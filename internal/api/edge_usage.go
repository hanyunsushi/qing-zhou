package api

import (
	"crypto/subtle"
	"encoding/json"
	"net/http"
	"os"
	"strings"
	"time"

	"qingzhou/internal/store"
)

func edgeUsageView(t store.EdgeRequestTotals) J {
	return J{
		"used":      t.Used,
		"total":     t.Total,
		"remaining": t.Remaining,
		"unlimited": t.Unlimited,
	}
}

func edgeRequestView(buckets []*store.Bucket) J {
	var out store.EdgeRequestTotals
	now := time.Now().Unix()
	today := time.Now().UTC().Format("2006-01-02")
	for _, b := range buckets {
		if b.Kind != "plan" || b.Status != "active" || !b.NotExpired(now) {
			continue
		}
		if b.EdgeUsageDay == today {
			out.Used += b.EdgeRequestsUsed
		}
		if b.EdgeRequestLimit == 0 {
			out.Unlimited = true
		} else {
			out.Total += b.EdgeRequestLimit
		}
	}
	if !out.Unlimited && out.Total > out.Used {
		out.Remaining = out.Total - out.Used
	}
	return edgeUsageView(out)
}

func (a *API) handleEdgeUsage(w http.ResponseWriter, r *http.Request) {
	expected := strings.TrimSpace(os.Getenv("QZ_EDGE_USAGE_TOKEN"))
	provided := strings.TrimSpace(strings.TrimPrefix(r.Header.Get("Authorization"), "Bearer "))
	if expected == "" || provided == "" || len(expected) != len(provided) || subtle.ConstantTimeCompare([]byte(expected), []byte(provided)) != 1 {
		fail(w, http.StatusUnauthorized, "未授权")
		return
	}
	if r.ContentLength > 2<<20 {
		fail(w, http.StatusRequestEntityTooLarge, "批次过大")
		return
	}
	var batch store.EdgeUsageBatch
	decoder := json.NewDecoder(http.MaxBytesReader(w, r.Body, 2<<20))
	if err := decoder.Decode(&batch); err != nil {
		fail(w, http.StatusBadRequest, "请求格式错误")
		return
	}
	blocked, accepted, err := a.st.ApplyEdgeUsageBatch(batch)
	if err != nil {
		if err == store.ErrInvalidEdgeUsageBatch {
			fail(w, http.StatusBadRequest, err.Error())
			return
		}
		fail(w, http.StatusInternalServerError, "Edge 用量入账失败")
		return
	}
	ok(w, J{"accepted": accepted, "blocked_external_ids": blocked})
}
