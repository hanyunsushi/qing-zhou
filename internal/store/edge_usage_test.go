package store

import "testing"

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
}

func TestApplyEdgeUsageBatchRejectsInvalidAndDuplicateItems(t *testing.T) {
	st := newRefundStore(t)
	for _, batch := range []EdgeUsageBatch{
		{Source: "wrong", BatchID: "x", Items: []EdgeUsageItem{{ExternalID: "1", Requests: 1}}},
		{Source: "edgetunnel", BatchID: "x", Items: []EdgeUsageItem{{ExternalID: "nope", Requests: 1}}},
		{Source: "edgetunnel", BatchID: "x", Items: []EdgeUsageItem{{ExternalID: "1", Requests: 0}}},
		{Source: "edgetunnel", BatchID: "x", Items: []EdgeUsageItem{{ExternalID: "1", Requests: 1}, {ExternalID: "1", Requests: 1}}},
	} {
		if _, _, err := st.ApplyEdgeUsageBatch(batch); err != ErrInvalidEdgeUsageBatch {
			t.Fatalf("batch %+v returned %v, want ErrInvalidEdgeUsageBatch", batch, err)
		}
	}
}
