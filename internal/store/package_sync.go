package store

import "time"

// PackageSyncResult describes a force synchronization of live package buckets.
// UserIDs is intentionally internal: the API uses it to invalidate cached
// subscription links after the transaction commits.
type PackageSyncResult struct {
	Users   int `json:"users"`
	Buckets int `json:"buckets"`
	Active  int `json:"active"`
	Queued  int `json:"queued"`
	UserIDs []int64
}

// ForceSyncPlanPackages copies the currently published plan defaults into every
// non-retired user plan bucket that still points at an existing plan package.
// Metering counters are reset, but purchase/order history, validity timestamps,
// and queue state are preserved. Expired heads may promote their queued successor
// in the same transaction, just like the normal queue maintenance path.
func (s *Store) ForceSyncPlanPackages() (PackageSyncResult, error) {
	var out PackageSyncResult
	now := time.Now().Unix()
	today := time.Now().UTC().Format(edgeUsageDayLayout)

	tx, err := s.db.Begin()
	if err != nil {
		return out, err
	}
	committed := false
	defer func() {
		if !committed {
			_ = tx.Rollback()
		}
	}()

	type target struct {
		id        int64
		userID    int64
		packageID int64
		status    string
		name      string
		queueKey  string
		traffic   int64
		edge      int64
		days      int64
		options   []PlanOption
	}
	rows, err := tx.Query(`SELECT up.id, up.user_id, up.package_id, up.status,
		up.duration_days, p.name, p.queue_key, p.traffic_bytes, p.edge_request_limit, p.duration_days, p.duration_options
		FROM user_plans up
		JOIN packages p ON p.id=up.package_id
		WHERE up.kind='plan' AND up.status<>? AND p.type='plan'
		ORDER BY up.user_id, up.id`, StatusRetired)
	if err != nil {
		return out, err
	}
	targets := make([]target, 0)
	userSet := make(map[int64]struct{})
	for rows.Next() {
		var t target
		var storedOptions string
		var bucketDays, packageDays int64
		if err := rows.Scan(&t.id, &t.userID, &t.packageID, &t.status, &bucketDays, &t.name, &t.queueKey, &t.traffic, &t.edge, &packageDays, &storedOptions); err != nil {
			rows.Close()
			return out, err
		}
		t.days = packageDays
		t.options = decodeOptions(storedOptions)
		if len(t.options) > 0 {
			selected := t.options[0]
			for _, option := range t.options {
				if option.Days == bucketDays {
					selected = option
					break
				}
			}
			t.days, t.traffic, t.edge = selected.Days, selected.TrafficBytes, selected.EdgeRequestLimit
		}
		if t.queueKey == "" {
			t.queueKey = effectiveQueueKey(t.packageID, "")
		}
		targets = append(targets, t)
		userSet[t.userID] = struct{}{}
	}
	if err := rows.Close(); err != nil {
		return out, err
	}
	if err := rows.Err(); err != nil {
		return out, err
	}

	for _, t := range targets {
		if _, err := tx.Exec(`UPDATE user_plans SET
			name=?, queue_key=?, traffic_limit=?, edge_request_limit=?, duration_days=?,
			used_up=0, used_down=0, edge_requests_used=0, edge_usage_day=?, updated_at=?
			WHERE id=?`, t.name, t.queueKey, t.traffic, t.edge, t.days, today, now, t.id); err != nil {
			return out, err
		}
		out.Buckets++
		switch t.status {
		case "active":
			out.Active++
		case "queued":
			out.Queued++
		}
	}

	for userID := range userSet {
		if _, err := advanceUserQueues(tx, userID, now); err != nil {
			return out, err
		}
		if _, _, _, _, err := recomputeUserAggregate(tx, userID, now); err != nil {
			return out, err
		}
		out.UserIDs = append(out.UserIDs, userID)
	}
	if err := tx.Commit(); err != nil {
		return out, err
	}
	committed = true
	out.Users = len(out.UserIDs)
	return out, nil
}
