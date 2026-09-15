package officialusage

import (
	"context"
	"crypto/rand"
	"crypto/rsa"
	"crypto/x509"
	"encoding/pem"
	"io"
	"net/http"
	"strings"
	"testing"
	"time"
)

type roundTripFunc func(*http.Request) (*http.Response, error)

func (fn roundTripFunc) RoundTrip(r *http.Request) (*http.Response, error) { return fn(r) }

func testPrivateKey(t *testing.T, pkcs8 bool) string {
	t.Helper()
	key, err := rsa.GenerateKey(rand.Reader, 2048)
	if err != nil {
		t.Fatal(err)
	}
	var data []byte
	var kind string
	if pkcs8 {
		data, err = x509.MarshalPKCS8PrivateKey(key)
		kind = "PRIVATE KEY"
	} else {
		data = x509.MarshalPKCS1PrivateKey(key)
		kind = "RSA PRIVATE KEY"
	}
	if err != nil {
		t.Fatal(err)
	}
	return string(pem.EncodeToMemory(&pem.Block{Type: kind, Bytes: data}))
}

func testClient(fn roundTripFunc) *http.Client { return &http.Client{Transport: fn} }

func jsonResponse(status int, body string) *http.Response {
	return &http.Response{StatusCode: status, Header: make(http.Header), Body: io.NopCloser(strings.NewReader(body))}
}

func TestFetchOCIReadsTransferUsageAndSignsRequest(t *testing.T) {
	key := testPrivateKey(t, false)
	now := time.Date(2026, 9, 15, 8, 30, 0, 0, time.UTC)
	client := testClient(func(r *http.Request) (*http.Response, error) {
		if r.URL.Host != "usageapi.ap-tokyo-1.oci.oraclecloud.com" || r.URL.Path != "/20200107/usage" {
			t.Fatalf("unexpected OCI endpoint %s", r.URL)
		}
		if got := r.Header.Get("Authorization"); !strings.Contains(got, `algorithm="rsa-sha256"`) || strings.Contains(got, key) {
			t.Fatalf("bad authorization header %q", got)
		}
		if got := r.Header.Get("X-Content-SHA256"); got == "" {
			t.Fatal("missing body digest")
		}
		return jsonResponse(200, `{"items":[
			{"service":"Networking","skuName":"Data Transfer Out","unit":"GB","attributedUsage":"1.5"},
			{"service":"Compute","skuName":"OCPU Hour","unit":"HOUR","attributedUsage":"99"},
			{"service":"Networking","skuName":"Outbound Transfer","unit":"MiB","computedQuantity":2}
		]}`), nil
	})
	usage := FetchOCI(context.Background(), client, OCIConfig{
		TenancyOCID: "ocid1.tenancy.oc1..example", UserOCID: "ocid1.user.oc1..example",
		Fingerprint: "aa:bb", Region: "ap-tokyo-1", PrivateKey: key, MonthlyLimitBytes: 2_000_000_000,
	}, now)
	if !usage.Success || usage.Used != 1_502_097_152 || usage.Remaining != 497_902_848 {
		t.Fatalf("unexpected OCI usage %#v", usage)
	}
}

func TestOCIPrivateKeyParsesPKCS8(t *testing.T) {
	if _, err := parsePrivateKey(testPrivateKey(t, true)); err != nil {
		t.Fatalf("PKCS#8 key: %v", err)
	}
}

func TestParseOCITransferBytesSkipsUnsupportedUnits(t *testing.T) {
	used, err := parseOCITransferBytes([]byte(`{"items":[
		{"service":"Networking","skuName":"Outbound Data Transfer","unit":"GB-MONTH","attributedUsage":"1"},
		{"service":"Networking","skuName":"Egress","unit":"TB","attributedUsage":"0.25"}
	]}`))
	if err != nil || used != 250_000_000_000 {
		t.Fatalf("used=%d err=%v", used, err)
	}
}

func TestFetchCloudflareAddsPagesAndWorkers(t *testing.T) {
	now := time.Date(2026, 9, 15, 8, 30, 0, 0, time.UTC)
	client := testClient(func(r *http.Request) (*http.Response, error) {
		if got := r.Header.Get("Authorization"); got != "Bearer analytics-token" {
			t.Fatalf("unexpected auth %q", got)
		}
		return jsonResponse(200, `{"data":{"viewer":{"accounts":[{"pagesFunctionsInvocationsAdaptiveGroups":[{"sum":{"requests":12}}],"workersInvocationsAdaptive":[{"sum":{"requests":3}},{"sum":{"requests":5}}]}]}}}`), nil
	})
	usage := FetchCloudflare(context.Background(), client, CloudflareConfig{AccountID: "account-id", AnalyticsToken: "analytics-token", DailyRequestLimit: 100}, now)
	if !usage.Success || usage.Used != 20 || usage.Remaining != 80 {
		t.Fatalf("unexpected CF usage %#v", usage)
	}
}

func TestFetchCloudflareReportsGraphQLErrors(t *testing.T) {
	client := testClient(func(*http.Request) (*http.Response, error) {
		return jsonResponse(200, `{"errors":[{"message":"forbidden"}]}`), nil
	})
	usage := FetchCloudflare(context.Background(), client, CloudflareConfig{AccountID: "account-id", AnalyticsToken: "analytics-token"}, time.Now())
	if usage.Success || !strings.Contains(usage.Error, "forbidden") {
		t.Fatalf("unexpected CF error %#v", usage)
	}
}

func TestFetchCloudflareReportsHTTPFailures(t *testing.T) {
	client := testClient(func(*http.Request) (*http.Response, error) { return jsonResponse(403, `{}`), nil })
	usage := FetchCloudflare(context.Background(), client, CloudflareConfig{AccountID: "account-id", AnalyticsToken: "analytics-token"}, time.Now())
	if usage.Success || !strings.Contains(usage.Error, "HTTP 403") {
		t.Fatalf("unexpected CF error %#v", usage)
	}
}
