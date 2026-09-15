// Package officialusage reads provider-account usage directly from official
// provider APIs. It intentionally has no dependency on QingZhou's nodes or
// EdgeTunnel so the displayed numbers keep their original provider scope.
package officialusage

import (
	"bytes"
	"context"
	"crypto"
	"crypto/rand"
	"crypto/rsa"
	"crypto/sha256"
	"crypto/x509"
	"encoding/base64"
	"encoding/json"
	"encoding/pem"
	"errors"
	"fmt"
	"io"
	"math"
	"net/http"
	"regexp"
	"strconv"
	"strings"
	"time"
)

const (
	DefaultOCIMonthlyLimitBytes int64 = 10_000_000_000_000
	DefaultCFDailyRequestLimit  int64 = 100_000
)

// OCIConfig is the minimum OCI API-key profile required by the Usage API.
// PrivateKey is never serialized back by the admin API.
type OCIConfig struct {
	TenancyOCID       string `json:"tenancy_ocid"`
	UserOCID          string `json:"user_ocid"`
	Fingerprint       string `json:"fingerprint"`
	Region            string `json:"region"`
	PrivateKey        string `json:"private_key"`
	MonthlyLimitBytes int64  `json:"monthly_limit_bytes"`
}

// CloudflareConfig holds a dedicated Account Analytics token. It is distinct
// from the DNS token QingZhou can use for ACME.
type CloudflareConfig struct {
	AccountID         string `json:"account_id"`
	AnalyticsToken    string `json:"analytics_token"`
	DailyRequestLimit int64  `json:"daily_request_limit"`
}

// Usage is a provider-account usage snapshot. Remaining is derived by QingZhou
// from the configured allowance; neither provider API returns one shared value.
type Usage struct {
	Configured bool   `json:"configured"`
	Success    bool   `json:"success"`
	Used       int64  `json:"used"`
	Limit      int64  `json:"limit"`
	Remaining  int64  `json:"remaining"`
	Unit       string `json:"unit"`
	Period     string `json:"period"`
	Source     string `json:"source"`
	UpdatedAt  string `json:"updated_at,omitempty"`
	Error      string `json:"error,omitempty"`
}

func (c OCIConfig) normalized() OCIConfig {
	c.TenancyOCID = strings.TrimSpace(c.TenancyOCID)
	c.UserOCID = strings.TrimSpace(c.UserOCID)
	c.Fingerprint = strings.TrimSpace(c.Fingerprint)
	c.Region = strings.ToLower(strings.TrimSpace(c.Region))
	if c.MonthlyLimitBytes <= 0 {
		c.MonthlyLimitBytes = DefaultOCIMonthlyLimitBytes
	}
	return c
}

func (c CloudflareConfig) normalized() CloudflareConfig {
	c.AccountID = strings.TrimSpace(c.AccountID)
	c.AnalyticsToken = strings.TrimSpace(c.AnalyticsToken)
	if c.DailyRequestLimit <= 0 {
		c.DailyRequestLimit = DefaultCFDailyRequestLimit
	}
	return c
}

func (c OCIConfig) Configured() bool {
	c = c.normalized()
	return c.TenancyOCID != "" && c.UserOCID != "" && c.Fingerprint != "" && c.Region != "" && strings.TrimSpace(c.PrivateKey) != ""
}

func (c CloudflareConfig) Configured() bool {
	c = c.normalized()
	return c.AccountID != "" && c.AnalyticsToken != ""
}

var ociRegion = regexp.MustCompile(`^[a-z][a-z0-9-]+-[a-z]+-[0-9]+$`)

// Validate checks configuration supplied from the management form before it is
// encrypted and stored. It deliberately permits only the fixed OCI API host.
func (c OCIConfig) Validate() error {
	c = c.normalized()
	if c.TenancyOCID == "" || c.UserOCID == "" || c.Fingerprint == "" || c.Region == "" || strings.TrimSpace(c.PrivateKey) == "" {
		return errors.New("请完整填写 OCI 租户、用户、指纹、区域和 API 私钥")
	}
	if !ociRegion.MatchString(c.Region) {
		return errors.New("OCI 区域格式不正确，例如 ap-tokyo-1")
	}
	if c.MonthlyLimitBytes < 1 || c.MonthlyLimitBytes > 1_000_000_000_000_000 {
		return errors.New("OCI 月度上限必须在 1 B 到 1000 TB 之间")
	}
	_, err := parsePrivateKey(c.PrivateKey)
	if err != nil {
		return fmt.Errorf("OCI API 私钥无效: %w", err)
	}
	return nil
}

func (c CloudflareConfig) Validate() error {
	c = c.normalized()
	if c.AccountID == "" || c.AnalyticsToken == "" {
		return errors.New("请填写 Cloudflare Account ID 和 Analytics Token")
	}
	if c.DailyRequestLimit < 1 || c.DailyRequestLimit > 10_000_000_000 {
		return errors.New("Cloudflare 每日请求上限必须在 1 到 100 亿之间")
	}
	return nil
}

// FetchOCI reads current-UTC-month data-transfer usage from OCI's Usage API.
func FetchOCI(ctx context.Context, client *http.Client, config OCIConfig, now time.Time) Usage {
	config = config.normalized()
	base := Usage{Configured: config.Configured(), Limit: config.MonthlyLimitBytes, Unit: "bytes", Period: "本月（UTC）", Source: "OCI Usage API"}
	if !base.Configured {
		base.Error = "未配置"
		return base
	}
	if err := config.Validate(); err != nil {
		base.Error = err.Error()
		return base
	}
	if client == nil {
		client = &http.Client{Timeout: 20 * time.Second}
	}
	now = now.UTC()
	body, err := json.Marshal(map[string]any{
		"tenantId":          config.TenancyOCID,
		"timeUsageStarted":  time.Date(now.Year(), now.Month(), 1, 0, 0, 0, 0, time.UTC).Format(time.RFC3339),
		"timeUsageEnded":    now.Format(time.RFC3339),
		"granularity":       "DAILY",
		"isAggregateByTime": true,
		"queryType":         "USAGE_ONLY",
		"groupBy":           []string{"service", "skuName", "unit"},
	})
	if err != nil {
		base.Error = "构造 OCI 请求失败"
		return base
	}
	host := "usageapi." + config.Region + ".oci.oraclecloud.com"
	req, err := http.NewRequestWithContext(ctx, http.MethodPost, "https://"+host+"/20200107/usage", bytes.NewReader(body))
	if err != nil {
		base.Error = "构造 OCI 请求失败"
		return base
	}
	if err := signOCIRequest(req, body, config); err != nil {
		base.Error = "签名 OCI 请求失败: " + err.Error()
		return base
	}
	resp, err := client.Do(req)
	if err != nil {
		base.Error = "OCI Usage API 请求失败: " + err.Error()
		return base
	}
	defer resp.Body.Close()
	data, err := io.ReadAll(io.LimitReader(resp.Body, 2<<20))
	if err != nil {
		base.Error = "读取 OCI Usage API 响应失败"
		return base
	}
	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		base.Error = fmt.Sprintf("OCI Usage API 返回 HTTP %d", resp.StatusCode)
		return base
	}
	used, err := parseOCITransferBytes(data)
	if err != nil {
		base.Error = "解析 OCI Usage API 响应失败: " + err.Error()
		return base
	}
	base.Success = true
	base.Used = used
	base.Remaining = remaining(base.Limit, used)
	base.UpdatedAt = now.Format(time.RFC3339)
	return base
}

func signOCIRequest(req *http.Request, body []byte, config OCIConfig) error {
	key, err := parsePrivateKey(config.PrivateKey)
	if err != nil {
		return err
	}
	digest := sha256.Sum256(body)
	date := time.Now().UTC().Format(http.TimeFormat)
	req.Header.Set("Date", date)
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Content-Length", strconv.Itoa(len(body)))
	req.Header.Set("X-Content-SHA256", base64.StdEncoding.EncodeToString(digest[:]))

	headers := "(request-target) date host content-length content-type x-content-sha256"
	signingString := strings.Join([]string{
		"(request-target): " + strings.ToLower(req.Method) + " " + req.URL.RequestURI(),
		"date: " + date,
		"host: " + req.URL.Host,
		"content-length: " + strconv.Itoa(len(body)),
		"content-type: application/json",
		"x-content-sha256: " + req.Header.Get("X-Content-SHA256"),
	}, "\n")
	hash := sha256.Sum256([]byte(signingString))
	sig, err := rsa.SignPKCS1v15(rand.Reader, key, crypto.SHA256, hash[:])
	if err != nil {
		return err
	}
	keyID := config.TenancyOCID + "/" + config.UserOCID + "/" + config.Fingerprint
	req.Header.Set("Authorization", fmt.Sprintf(`Signature version="1",keyId="%s",algorithm="rsa-sha256",headers="%s",signature="%s"`, keyID, headers, base64.StdEncoding.EncodeToString(sig)))
	return nil
}

func parsePrivateKey(value string) (*rsa.PrivateKey, error) {
	block, _ := pem.Decode([]byte(strings.TrimSpace(value)))
	if block == nil {
		return nil, errors.New("未找到 PEM 私钥")
	}
	if key, err := x509.ParsePKCS1PrivateKey(block.Bytes); err == nil {
		return key, nil
	}
	key, err := x509.ParsePKCS8PrivateKey(block.Bytes)
	if err != nil {
		return nil, errors.New("仅支持 RSA PKCS#1 或 PKCS#8 私钥")
	}
	rsaKey, ok := key.(*rsa.PrivateKey)
	if !ok {
		return nil, errors.New("仅支持 RSA 私钥")
	}
	return rsaKey, nil
}

type ociResponse struct {
	Items []struct {
		Service          string      `json:"service"`
		SkuName          string      `json:"skuName"`
		Unit             string      `json:"unit"`
		AttributedUsage  string      `json:"attributedUsage"`
		ComputedQuantity json.Number `json:"computedQuantity"`
	} `json:"items"`
}

func parseOCITransferBytes(data []byte) (int64, error) {
	decoder := json.NewDecoder(bytes.NewReader(data))
	decoder.UseNumber()
	var response ociResponse
	if err := decoder.Decode(&response); err != nil {
		return 0, err
	}
	var total int64
	for _, item := range response.Items {
		if !isTransferUsage(item.Service, item.SkuName) {
			continue
		}
		quantity, err := usageQuantity(item.AttributedUsage, item.ComputedQuantity)
		if err != nil {
			return 0, err
		}
		bytes, ok := quantityToBytes(quantity, item.Unit)
		if !ok {
			continue
		}
		if bytes > math.MaxInt64-total {
			return 0, errors.New("OCI 用量超出可表示范围")
		}
		total += bytes
	}
	return total, nil
}

func isTransferUsage(service, sku string) bool {
	s := strings.ToLower(service + " " + sku)
	return strings.Contains(s, "data transfer") || strings.Contains(s, "outbound") || strings.Contains(s, "egress")
}

func usageQuantity(attributed string, computed json.Number) (float64, error) {
	v := strings.TrimSpace(attributed)
	if v == "" {
		v = computed.String()
	}
	if v == "" {
		return 0, errors.New("OCI 用量条目缺少数值")
	}
	n, err := strconv.ParseFloat(v, 64)
	if err != nil || n < 0 || math.IsNaN(n) || math.IsInf(n, 0) {
		return 0, errors.New("OCI 用量数值无效")
	}
	return n, nil
}

func quantityToBytes(quantity float64, unit string) (int64, bool) {
	u := strings.ToUpper(strings.ReplaceAll(strings.TrimSpace(unit), " ", ""))
	multipliers := map[string]float64{
		"B": 1, "BYTE": 1, "BYTES": 1,
		"KB": 1e3, "KILOBYTE": 1e3,
		"MB": 1e6, "MEGABYTE": 1e6,
		"GB": 1e9, "GIGABYTE": 1e9,
		"TB": 1e12, "TERABYTE": 1e12,
		"KIB": 1 << 10, "MIB": 1 << 20, "GIB": 1 << 30, "TIB": 1 << 40,
	}
	m, ok := multipliers[u]
	if !ok || quantity > float64(math.MaxInt64)/m {
		return 0, false
	}
	return int64(math.Round(quantity * m)), true
}

// FetchCloudflare reads the current UTC day's Pages Functions and Workers
// invocation total from Cloudflare Account Analytics GraphQL.
func FetchCloudflare(ctx context.Context, client *http.Client, config CloudflareConfig, now time.Time) Usage {
	config = config.normalized()
	base := Usage{Configured: config.Configured(), Limit: config.DailyRequestLimit, Unit: "requests", Period: "今日（UTC）", Source: "Cloudflare Analytics GraphQL"}
	if !base.Configured {
		base.Error = "未配置"
		return base
	}
	if err := config.Validate(); err != nil {
		base.Error = err.Error()
		return base
	}
	if client == nil {
		client = &http.Client{Timeout: 20 * time.Second}
	}
	now = now.UTC()
	dayStart := time.Date(now.Year(), now.Month(), now.Day(), 0, 0, 0, 0, time.UTC)
	body, err := json.Marshal(map[string]any{
		"query":     `query getBillingMetrics($AccountID: String!, $filter: AccountWorkersInvocationsAdaptiveFilter_InputObject) { viewer { accounts(filter: {accountTag: $AccountID}) { pagesFunctionsInvocationsAdaptiveGroups(limit: 1000, filter: $filter) { sum { requests } } workersInvocationsAdaptive(limit: 10000, filter: $filter) { sum { requests } } } } }`,
		"variables": map[string]any{"AccountID": config.AccountID, "filter": map[string]string{"datetime_geq": dayStart.Format(time.RFC3339), "datetime_leq": now.Format(time.RFC3339)}},
	})
	if err != nil {
		base.Error = "构造 Cloudflare 请求失败"
		return base
	}
	req, err := http.NewRequestWithContext(ctx, http.MethodPost, "https://api.cloudflare.com/client/v4/graphql", bytes.NewReader(body))
	if err != nil {
		base.Error = "构造 Cloudflare 请求失败"
		return base
	}
	req.Header.Set("Authorization", "Bearer "+config.AnalyticsToken)
	req.Header.Set("Content-Type", "application/json")
	resp, err := client.Do(req)
	if err != nil {
		base.Error = "Cloudflare Analytics 请求失败: " + err.Error()
		return base
	}
	defer resp.Body.Close()
	data, err := io.ReadAll(io.LimitReader(resp.Body, 2<<20))
	if err != nil {
		base.Error = "读取 Cloudflare Analytics 响应失败"
		return base
	}
	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		base.Error = fmt.Sprintf("Cloudflare Analytics 返回 HTTP %d", resp.StatusCode)
		return base
	}
	used, err := parseCloudflareRequests(data)
	if err != nil {
		base.Error = "解析 Cloudflare Analytics 响应失败: " + err.Error()
		return base
	}
	base.Success = true
	base.Used = used
	base.Remaining = remaining(base.Limit, used)
	base.UpdatedAt = now.Format(time.RFC3339)
	return base
}

func parseCloudflareRequests(data []byte) (int64, error) {
	var response struct {
		Errors []struct {
			Message string `json:"message"`
		} `json:"errors"`
		Data struct {
			Viewer struct {
				Accounts []struct {
					Pages []struct {
						Sum struct {
							Requests int64 `json:"requests"`
						} `json:"sum"`
					} `json:"pagesFunctionsInvocationsAdaptiveGroups"`
					Workers []struct {
						Sum struct {
							Requests int64 `json:"requests"`
						} `json:"sum"`
					} `json:"workersInvocationsAdaptive"`
				} `json:"accounts"`
			} `json:"viewer"`
		} `json:"data"`
	}
	if err := json.Unmarshal(data, &response); err != nil {
		return 0, err
	}
	if len(response.Errors) > 0 {
		return 0, errors.New(response.Errors[0].Message)
	}
	if len(response.Data.Viewer.Accounts) == 0 {
		return 0, errors.New("未找到 Cloudflare 账户数据")
	}
	var total int64
	for _, group := range response.Data.Viewer.Accounts[0].Pages {
		if group.Sum.Requests < 0 || group.Sum.Requests > math.MaxInt64-total {
			return 0, errors.New("Cloudflare 请求数无效")
		}
		total += group.Sum.Requests
	}
	for _, group := range response.Data.Viewer.Accounts[0].Workers {
		if group.Sum.Requests < 0 || group.Sum.Requests > math.MaxInt64-total {
			return 0, errors.New("Cloudflare 请求数无效")
		}
		total += group.Sum.Requests
	}
	return total, nil
}

func remaining(limit, used int64) int64 {
	if used >= limit {
		return 0
	}
	return limit - used
}
