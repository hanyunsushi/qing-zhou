package store

import (
	"testing"
	"time"
)

func TestApplyEdgeUsageBatchIsIdempotentAndConsumesActiveAllowance(t *testing.T) {
	st := newRefundStore(t)
	uid := mkUser(t, st, "edge-usage")
	id, err := st.CreatePackage(Package{
		Type: "plan", Name: "Edge 3", PricePoints: 1, TrafficBytes: 1,
		EdgeRequestLimit: 3, DurationDays: 30, Stock: -1, Enabled: true,
	})
	if err != nil {
		t.Fatal(err)
	}
	pkg, err := st.GetPackage(id)
	if err != nil {
		t.Fatal(err)
	}
	buy(t, st, uid, pkg)

	batch := EdgeUsageBatch{Source: "edgetunnel", BatchID: "batch-1", Items: []EdgeUsageItem{{ExternalID: "1", Requests: 2}}}
	blocked, accepted, err := st.ApplyEdgeUsageBatch(batch)
	if err != nil || accepted != 1 || len(blocked) != 0 {
		t.Fatalf("first batch = blocked %v, accepted %d, err %v", blocked, accepted, err)
	}
	blocked, accepted, err = st.ApplyEdgeUsageBatch(batch)
	if err != nil || accepted != 0 || len(blocked) != 0 {
		t.Fatalf("duplicate batch = blocked %v, accepted %d, err %v", blocked, accepted, err)
	}

	blocked, accepted, err = st.ApplyEdgeUsageBatch(EdgeUsageBatch{
		Source: "edgetunnel", BatchID: "batch-2", Items: []EdgeUsageItem{{ExternalID: "1", Requests: 1}},
	})
	if err != nil || accepted != 1 || len(blocked) != 1 || blocked[0] != "1" {
		t.Fatalf("exhausting batch = blocked %v, accepted %d, err %v", blocked, accepted, err)
	}
	totals, err := st.EdgeRequestTotals(uid)
	if err != nil {
		t.Fatal(err)
	}
	if totals.Total != 3 || totals.Used != 3 || totals.Remaining != 0 || totals.Unlimited {
		t.Fatalf("totals = %+v, want 3/3/0/false", totals)
	}
	buckets, err := st.ListBuckets(uid)
	if err != nil {
		t.Fatal(err)
	}
	viewTotals := EdgeRequestTotalsFromBuckets(buckets, time.Now().Unix())
	if viewTotals != totals {
		t.Fatalf("bucket-view totals = %+v, persisted totals = %+v", viewTotals, totals)
	}
}

func TestApplyEdgeUsageBatchRejectsInvalidAndDuplicateItems(t *testing.T) {
	st := newRefundStore(t)
	for _, batch := range []EdgeUsageBatch{
		{Source: "wrong", BatchID: "x", Items: []EdgeUsageItem{{ExternalID: "1", Requests: 1}}},
		{Source: "edgetunnel", BatchID: "x", Items: []EdgeUsageItem{{ExternalID: "nope", Requests: 1}}},
		{Source: "edgetunnel", BatchID: "x", Items: []EdgeUsageItem{{ExternalID: "1", Requests: 0}}},
		{Source: "edgetunnel", BatchID: "x", Items: []EdgeUsageItem{{ExternalID: "1", Requests: 1}, {ExternalID: "1", Requests: 1}}},
		{Source: "edgetunnel", BatchID: "x", Items: []EdgeUsageItem{{ExternalID: "1", Requests: 1}, {ExternalID: "01", Requests: 1}}},
		{Source: "edgetunnel", BatchID: "x", Items: []EdgeUsageItem{{ExternalID: "0", Requests: 1}}},
		{Source: "edgetunnel", BatchID: "x", Items: []EdgeUsageItem{{ExternalID: "-1", Requests: 1}}},
	} {
		if _, _, err := st.ApplyEdgeUsageBatch(batch); err != ErrInvalidEdgeUsageBatch {
			t.Fatalf("batch %+v returned %v, want ErrInvalidEdgeUsageBatch", batch, err)
		}
	}
}

func TestApplyEdgeUsageBatchResetsAtUtcDayBoundary(t *testing.T) {
	st := newRefundStore(t)
	uid := mkUser(t, st, "edge-daily")
	id, err := st.CreatePackage(Package{
		Type: "plan", Name: "Daily Edge", PricePoints: 1, TrafficBytes: 1,
		EdgeRequestLimit: 3, DurationDays: 30, Stock: -1, Enabled: true,
	})
	if err != nil {
		t.Fatal(err)
	}
	pkg, err := st.GetPackage(id)
	if err != nil {
		t.Fatal(err)
	}
	buy(t, st, uid, pkg)
	today := time.Now().UTC().Format(edgeUsageDayLayout)
	yesterday := time.Now().UTC().Add(-24 * time.Hour).Format(edgeUsageDayLayout)

	blocked, _, err := st.ApplyEdgeUsageBatch(EdgeUsageBatch{
		Source: "edgetunnel", BatchID: "daily-old", Items: []EdgeUsageItem{{ExternalID: "1", UsageDay: yesterday, Requests: 3}},
	})
	if err != nil || len(blocked) != 1 {
		t.Fatalf("yesterday batch = blocked %v, err %v; want blocked", blocked, err)
	}
	blocked, _, err = st.ApplyEdgeUsageBatch(EdgeUsageBatch{
		Source: "edgetunnel", BatchID: "daily-today", Items: []EdgeUsageItem{{ExternalID: "1", UsageDay: today, Requests: 1}},
	})
	if err != nil || len(blocked) != 0 {
		t.Fatalf("today batch = blocked %v, err %v; want allowed", blocked, err)
	}
	totals, err := st.EdgeRequestTotals(uid)
	if err != nil {
		t.Fatal(err)
	}
	if totals.Total != 3 || totals.Used != 1 || totals.Remaining != 2 {
		t.Fatalf("daily totals = %+v, want 3/1/2", totals)
	}
	buckets, err := st.ListBuckets(uid)
	if err != nil {
		t.Fatal(err)
	}
	if len(buckets) == 0 || !buckets[0].HasEdgeQuota() {
		t.Fatal("stale previous-day usage must not keep the current plan exhausted")
	}
}

func TestApplyEdgeUsageBatchDoesNotLetLatePriorDayUsageResetToday(t *testing.T) {
	st := newRefundStore(t)
	uid := mkUser(t, st, "edge-late-daily")
	id, err := st.CreatePackage(Package{
		Type: "plan", Name: "Daily Edge", PricePoints: 1, TrafficBytes: 1,
		EdgeRequestLimit: 3, DurationDays: 30, Stock: -1, Enabled: true,
	})
	if err != nil {
		t.Fatal(err)
	}
	pkg, err := st.GetPackage(id)
	if err != nil {
		t.Fatal(err)
	}
	buy(t, st, uid, pkg)
	today := time.Now().UTC().Format(edgeUsageDayLayout)
	yesterday := time.Now().UTC().Add(-24 * time.Hour).Format(edgeUsageDayLayout)

	if _, _, err := st.ApplyEdgeUsageBatch(EdgeUsageBatch{
		Source: "edgetunnel", BatchID: "today-first", Items: []EdgeUsageItem{{ExternalID: "1", UsageDay: today, Requests: 2}},
	}); err != nil {
		t.Fatal(err)
	}
	blocked, accepted, err := st.ApplyEdgeUsageBatch(EdgeUsageBatch{
		Source: "edgetunnel", BatchID: "yesterday-late", Items: []EdgeUsageItem{{ExternalID: "1", UsageDay: yesterday, Requests: 3}},
	})
	if err != nil || accepted != 1 || len(blocked) != 0 {
		t.Fatalf("late yesterday batch = blocked %v, accepted %d, err %v; want today's 2/3 allowance preserved", blocked, accepted, err)
	}

	totals, err := st.EdgeRequestTotals(uid)
	if err != nil {
		t.Fatal(err)
	}
	if totals.Total != 3 || totals.Used != 2 || totals.Remaining != 1 {
		t.Fatalf("late prior-day batch changed today's totals: %+v, want 3/2/1", totals)
	}
	blocked, _, err = st.ApplyEdgeUsageBatch(EdgeUsageBatch{
		Source: "edgetunnel", BatchID: "today-exhausts", Items: []EdgeUsageItem{{ExternalID: "1", UsageDay: today, Requests: 1}},
	})
	if err != nil || len(blocked) != 1 || blocked[0] != "1" {
		t.Fatalf("today exhaustion = blocked %v, err %v; want user 1 blocked", blocked, err)
	}
}

func TestLatePriorDayBatchSkipsAllBucketsWhenAnyBucketHasNewerDay(t *testing.T) {
	st := newRefundStore(t)
	uid := mkUser(t, st, "edge-late-multi-plan")
	packageIDs := make([]int64, 2)
	for i, name := range []string{"Earlier", "Later"} {
		id, err := st.CreatePackage(Package{
			Type: "plan", Name: name, PricePoints: 1, TrafficBytes: 1,
			EdgeRequestLimit: 3, DurationDays: 30, Stock: -1, Enabled: true,
		})
		if err != nil {
			t.Fatal(err)
		}
		pkg, err := st.GetPackage(id)
		if err != nil {
			t.Fatal(err)
		}
		buy(t, st, uid, pkg)
		packageIDs[i] = id
	}
	buckets, err := st.ListBuckets(uid)
	if err != nil {
		t.Fatal(err)
	}
	today := time.Now().UTC().Format(edgeUsageDayLayout)
	yesterday := time.Now().UTC().Add(-24 * time.Hour).Format(edgeUsageDayLayout)
	for _, bucket := range buckets {
		if bucket.Status != "active" {
			continue
		}
		day, used := yesterday, int64(0)
		if bucket.PackageID == packageIDs[1] {
			day, used = today, 2
		}
		if _, err := st.db.Exec(`UPDATE user_plans SET edge_usage_day=?, edge_requests_used=? WHERE id=?`, day, used, bucket.ID); err != nil {
			t.Fatal(err)
		}
	}

	if _, _, err := st.ApplyEdgeUsageBatch(EdgeUsageBatch{
		Source: "edgetunnel", BatchID: "multi-plan-yesterday-late", Items: []EdgeUsageItem{{ExternalID: "1", UsageDay: yesterday, Requests: 3}},
	}); err != nil {
		t.Fatal(err)
	}
	buckets, err = st.ListBuckets(uid)
	if err != nil {
		t.Fatal(err)
	}
	for _, bucket := range buckets {
		if bucket.Status != "active" {
			continue
		}
		if bucket.PackageID == packageIDs[0] && (bucket.EdgeUsageDay != yesterday || bucket.EdgeRequestsUsed != 0) {
			t.Fatalf("older bucket was partially rewritten: day=%s used=%d", bucket.EdgeUsageDay, bucket.EdgeRequestsUsed)
		}
		if bucket.PackageID == packageIDs[1] && (bucket.EdgeUsageDay != today || bucket.EdgeRequestsUsed != 2) {
			t.Fatalf("today bucket changed: day=%s used=%d", bucket.EdgeUsageDay, bucket.EdgeRequestsUsed)
		}
	}
}

func TestApplyEdgeUsageBatchRejectsFutureUsageDayWithoutConsumingBatchID(t *testing.T) {
	st := newRefundStore(t)
	tomorrow := time.Now().UTC().Add(24 * time.Hour).Format(edgeUsageDayLayout)
	batch := EdgeUsageBatch{
		Source: "edgetunnel", BatchID: "future-day", Items: []EdgeUsageItem{{ExternalID: "1", UsageDay: tomorrow, Requests: 1}},
	}
	if _, _, err := st.ApplyEdgeUsageBatch(batch); err != ErrInvalidEdgeUsageBatch {
		t.Fatalf("future usage day returned %v, want ErrInvalidEdgeUsageBatch", err)
	}
	batch.Items[0].UsageDay = time.Now().UTC().Format(edgeUsageDayLayout)
	if _, accepted, err := st.ApplyEdgeUsageBatch(batch); err != nil || accepted != 1 {
		t.Fatalf("valid retry after rejected future day = accepted %d, err %v; want accepted", accepted, err)
	}
}

func TestDailyEdgeExhaustionDoesNotAdvanceQueuedPlan(t *testing.T) {
	st := newRefundStore(t)
	uid := mkUser(t, st, "edge-queue-daily")
	id, err := st.CreatePackage(Package{
		Type: "plan", Name: "Daily Queue", PricePoints: 1, TrafficBytes: 1,
		EdgeRequestLimit: 1, DurationDays: 30, Stock: -1, Enabled: true,
	})
	if err != nil {
		t.Fatal(err)
	}
	pkg, err := st.GetPackage(id)
	if err != nil {
		t.Fatal(err)
	}
	buy(t, st, uid, pkg)
	buy(t, st, uid, pkg)
	if _, _, err := st.ApplyEdgeUsageBatch(EdgeUsageBatch{
		Source: "edgetunnel", BatchID: "queue-daily", Items: []EdgeUsageItem{{ExternalID: "1", Requests: 1}},
	}); err != nil {
		t.Fatal(err)
	}
	buckets, err := st.ListBuckets(uid)
	if err != nil {
		t.Fatal(err)
	}
	var active, queued int
	for _, b := range buckets {
		if b.PackageID != id {
			continue
		}
		switch b.Status {
		case "active":
			active++
		case "queued":
			queued++
		}
	}
	if active != 1 || queued != 1 {
		t.Fatalf("daily exhaustion changed queue: active=%d queued=%d, want 1/1", active, queued)
	}
}
