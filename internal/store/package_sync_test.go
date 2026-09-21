package store

import (
	"testing"
	"time"
)

func TestForceSyncPlanPackagesRefreshesDefinitionsAndResetsUsage(t *testing.T) {
	st := newRefundStore(t)
	uid := mkUser(t, st, "sync-user")
	pkg := mkPlan(t, st, "旧套餐", 100, 100, 30)
	buy(t, st, uid, pkg)
	var bucketID int64
	if err := st.db.QueryRow(`SELECT id FROM user_plans WHERE user_id=? AND package_id=?`, uid, pkg.ID).Scan(&bucketID); err != nil {
		t.Fatal(err)
	}
	if _, err := st.db.Exec(`UPDATE user_plans SET used_up=?, used_down=?, edge_request_limit=?, edge_requests_used=?, edge_usage_day=? WHERE id=?`,
		3*giB, 2*giB, 7, 6, time.Now().UTC().Format(edgeUsageDayLayout), bucketID); err != nil {
		t.Fatal(err)
	}

	pkg.Name = "新套餐"
	pkg.TrafficBytes = 200 * giB
	pkg.EdgeRequestLimit = 99
	pkg.DurationDays = 60
	if err := st.UpdatePackage(*pkg); err != nil {
		t.Fatal(err)
	}

	result, err := st.ForceSyncPlanPackages()
	if err != nil {
		t.Fatal(err)
	}
	if result.Users != 1 || result.Buckets != 1 || result.Active != 1 {
		t.Fatalf("result = %+v", result)
	}
	buckets := planBuckets(t, st, uid, pkg.ID)
	if len(buckets) != 1 {
		t.Fatalf("buckets = %d", len(buckets))
	}
	b := buckets[0]
	if b.Name != "新套餐" || b.TrafficLimit != 200*giB || b.EdgeRequestLimit != 99 || b.DurationDays != 60 {
		t.Fatalf("synced bucket = %+v", b)
	}
	if b.Used() != 0 || b.EdgeRequestsUsed != 0 {
		t.Fatalf("counters were not reset: %+v", b)
	}
}

func TestForceSyncPlanPackagesPreservesQueueState(t *testing.T) {
	st := newRefundStore(t)
	uid := mkUser(t, st, "sync-queue-user")
	pkg := mkPlan(t, st, "套餐", 100, 100, 30)
	buy(t, st, uid, pkg)
	buy(t, st, uid, pkg)

	pkg.Name = "更新后的套餐"
	pkg.TrafficBytes = 250 * giB
	if err := st.UpdatePackage(*pkg); err != nil {
		t.Fatal(err)
	}
	result, err := st.ForceSyncPlanPackages()
	if err != nil {
		t.Fatal(err)
	}
	if result.Users != 1 || result.Buckets != 2 || result.Active != 1 || result.Queued != 1 {
		t.Fatalf("result = %+v", result)
	}

	rows, err := st.db.Query(`SELECT status, name, traffic_limit FROM user_plans
		WHERE user_id=? AND kind='plan' ORDER BY id`, uid)
	if err != nil {
		t.Fatal(err)
	}
	defer rows.Close()
	wantStatuses := []string{"active", "queued"}
	for i, wantStatus := range wantStatuses {
		var status, name string
		var traffic int64
		if !rows.Next() {
			t.Fatalf("missing bucket %d", i)
		}
		if err := rows.Scan(&status, &name, &traffic); err != nil {
			t.Fatal(err)
		}
		if status != wantStatus || name != "更新后的套餐" || traffic != 250*giB {
			t.Fatalf("bucket %d = status %q name %q traffic %d", i, status, name, traffic)
		}
	}
	if rows.Next() {
		t.Fatal("unexpected extra bucket")
	}
	if err := rows.Err(); err != nil {
		t.Fatal(err)
	}
}
