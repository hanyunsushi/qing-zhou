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
