package api

import (
	"net/http/httptest"
	"strings"
	"testing"
)

func TestHandleEdgeUsageRequiresToken(t *testing.T) {
	a, _ := newResetSubAPI(t)
	t.Setenv("QZ_EDGE_USAGE_TOKEN", "edge-secret")
	req := httptest.NewRequest("POST", "/api/internal/edge/usage", strings.NewReader(`{"source":"edgetunnel","batch_id":"b","items":[{"external_id":"1","requests":1}]}`))
	req.Header.Set("Authorization", "Bearer wrong")
	rec := httptest.NewRecorder()
	a.handleEdgeUsage(rec, req)
	if rec.Code != 401 {
		t.Fatalf("status = %d, want 401", rec.Code)
	}
}
