package store

import (
	"errors"
	"fmt"
	"strconv"
	"strings"
	"time"
)

const maxEdgeUsageItems = 5000
const maxEdgeUsageRequests = int64(1_000_000_000)
const edgeUsageDayLayout = "2006-01-02"

var ErrInvalidEdgeUsageBatch = errors.New("Edge 用量批次无效")

type EdgeUsageItem struct {
	ExternalID string `json:"external_id"`
	Requests   int64  `json:"requests"`
	UsageDay   string `json:"usage_day,omitempty"`
}

type EdgeUsageBatch struct {
	Source      string          `json:"source"`
	BatchID     string          `json:"batch_id"`
	PeriodStart int64           `json:"period_start"`
	PeriodEnd   int64           `json:"period_end"`
	Items       []EdgeUsageItem `json:"items"`
}

type EdgeRequestTotals struct {
	Total     int64 `json:"total"`
	Used      int64 `json:"used"`
	Remaining int64 `json:"remaining"`
	Unlimited bool  `json:"unlimited"`
}

type edgeUsageBucket struct {
	id    int64
	limit int64
	used  int64
	day   string
}

func edgeUsageTotals(buckets []edgeUsageBucket, today string) EdgeRequestTotals {
	var out EdgeRequestTotals
	for _, b := range buckets {
		if b.day == today {
			out.Used += b.used
		}
		if b.limit == 0 {
			out.Unlimited = true
		} else {
			out.Total += b.limit
		}
	}
	if !out.Unlimited && out.Total > out.Used {
		out.Remaining = out.Total - out.Used
	}
	return out
}

// EdgeRequestTotalsFromBuckets applies the persisted quota rules to an already
// loaded bucket snapshot.
func EdgeRequestTotalsFromBuckets(buckets []*Bucket, now int64) EdgeRequestTotals {
	usageBuckets := make([]edgeUsageBucket, 0, len(buckets))
	for _, b := range buckets {
		if b.Kind != "plan" || b.Status != "active" || !b.NotExpired(now) {
			continue
		}
		usageBuckets = append(usageBuckets, edgeUsageBucket{
			limit: b.EdgeRequestLimit,
			used:  b.EdgeRequestsUsed,
			day:   b.EdgeUsageDay,
		})
	}
	return edgeUsageTotals(usageBuckets, edgeUsageDayAt(now))
}

func edgeUsageDay(ts int64, now int64) string {
	if ts <= 0 {
		return edgeUsageDayAt(now)
	}
	return time.Unix(ts, 0).UTC().Format(edgeUsageDayLayout)
}

func edgeUsageDayAt(now int64) string {
	return time.Unix(now, 0).UTC().Format(edgeUsageDayLayout)
}

func validEdgeUsageDay(day string) bool {
	parsed, err := time.Parse(edgeUsageDayLayout, day)
	return err == nil && parsed.UTC().Format(edgeUsageDayLayout) == day
}

// ApplyEdgeUsageBatch commits a callback exactly once. Counts are allocated to
// the user's currently active plan buckets, so a queued or retired plan never
// consumes the next plan's allowance. edge_request_limit is a per-UTC-day
// allowance; edge_requests_used is reset lazily when a new day is received.
// A zero package limit is intentionally unlimited for backwards compatibility.
func (s *Store) ApplyEdgeUsageBatch(batch EdgeUsageBatch) ([]string, int, error) {
	if batch.Source != "edgetunnel" || strings.TrimSpace(batch.BatchID) == "" || len(batch.BatchID) > 128 || len(batch.Items) == 0 || len(batch.Items) > maxEdgeUsageItems {
		return nil, 0, ErrInvalidEdgeUsageBatch
	}
	now := time.Now().Unix()
	today := edgeUsageDayAt(now)
	fallbackDay := edgeUsageDay(batch.PeriodStart, now)
	seen := make(map[string]struct{}, len(batch.Items))
	for i := range batch.Items {
		item := &batch.Items[i]
		item.ExternalID = strings.TrimSpace(item.ExternalID)
		item.UsageDay = strings.TrimSpace(item.UsageDay)
		if item.UsageDay == "" {
			item.UsageDay = fallbackDay
		}
		if item.ExternalID == "" || len(item.ExternalID) > 32 || item.Requests <= 0 || item.Requests > maxEdgeUsageRequests {
			return nil, 0, ErrInvalidEdgeUsageBatch
		}
		if !validEdgeUsageDay(item.UsageDay) {
			return nil, 0, ErrInvalidEdgeUsageBatch
		}
		if item.UsageDay > today {
			return nil, 0, ErrInvalidEdgeUsageBatch
		}
		userID, err := strconv.ParseInt(item.ExternalID, 10, 64)
		if err != nil || userID <= 0 {
			return nil, 0, ErrInvalidEdgeUsageBatch
		}
		seenKey := strconv.FormatInt(userID, 10) + "\x00" + item.UsageDay
		if _, ok := seen[seenKey]; ok {
			return nil, 0, ErrInvalidEdgeUsageBatch
		}
		seen[seenKey] = struct{}{}
	}

	tx, err := s.db.Begin()
	if err != nil {
		return nil, 0, err
	}
	committed := false
	defer func() {
		if !committed {
			_ = tx.Rollback()
		}
	}()

	result, err := tx.Exec(`INSERT OR IGNORE INTO edge_request_batches
		(batch_id, source, period_start, period_end, created_at) VALUES (?,?,?,?,?)`,
		batch.BatchID, batch.Source, batch.PeriodStart, batch.PeriodEnd, now)
	if err != nil {
		return nil, 0, err
	}
	if affected, _ := result.RowsAffected(); affected == 0 {
		if err := tx.Commit(); err != nil {
			return nil, 0, err
		}
		committed = true
		return nil, 0, nil
	}

	blocked := make([]string, 0)
	for _, item := range batch.Items {
		userID, _ := strconv.ParseInt(item.ExternalID, 10, 64)
		rows, err := tx.Query(`SELECT id, edge_request_limit, edge_requests_used, edge_usage_day
			FROM user_plans
			WHERE user_id=? AND kind='plan' AND status='active'
			  AND (expiry_at=0 OR expiry_at>?)
			ORDER BY id`, userID, now)
		if err != nil {
			return nil, 0, err
		}
		buckets := make([]edgeUsageBucket, 0)
		for rows.Next() {
			var b edgeUsageBucket
			if err := rows.Scan(&b.id, &b.limit, &b.used, &b.day); err != nil {
				rows.Close()
				return nil, 0, err
			}
			buckets = append(buckets, b)
		}
		if err := rows.Err(); err != nil {
			rows.Close()
			return nil, 0, err
		}
		rows.Close()
		if len(buckets) == 0 {
			continue
		}

		remaining := item.Requests
		stale := false
		for _, bucket := range buckets {
			if bucket.day > item.UsageDay {
				stale = true
				break
			}
		}
		if !stale {
			for i := range buckets {
				if remaining <= 0 {
					break
				}
				if buckets[i].day != item.UsageDay {
					buckets[i].used = 0
					buckets[i].day = item.UsageDay
				}
				if buckets[i].limit == 0 {
					buckets[i].used += remaining
					if _, err := tx.Exec(`UPDATE user_plans SET edge_requests_used=?, edge_usage_day=?, updated_at=? WHERE id=?`, buckets[i].used, item.UsageDay, now, buckets[i].id); err != nil {
						return nil, 0, err
					}
					remaining = 0
					continue
				}
				available := buckets[i].limit - buckets[i].used
				if available < 0 {
					available = 0
				}
				take := remaining
				if take > available {
					take = available
				}
				if take > 0 {
					buckets[i].used += take
					if _, err := tx.Exec(`UPDATE user_plans SET edge_requests_used=?, edge_usage_day=?, updated_at=? WHERE id=?`, buckets[i].used, item.UsageDay, now, buckets[i].id); err != nil {
						return nil, 0, err
					}
					remaining -= take
				}
			}
			if remaining > 0 {
				// Preserve the full provider count for the account even after the
				// finite allowance is exhausted. The final bucket becomes visibly
				// over-limit and the next subscription request is blocked.
				last := buckets[len(buckets)-1]
				if last.day != item.UsageDay {
					last.used = 0
					last.day = item.UsageDay
				}
				last.used += remaining
				if _, err := tx.Exec(`UPDATE user_plans SET edge_requests_used=?, edge_usage_day=?, updated_at=? WHERE id=?`, last.used, item.UsageDay, now, last.id); err != nil {
					return nil, 0, err
				}
			}
		}
		totalsDay := item.UsageDay
		if stale {
			totalsDay = today
		}
		totals := edgeUsageTotals(buckets, totalsDay)
		if !totals.Unlimited && totals.Total > 0 && totals.Used >= totals.Total {
			blocked = append(blocked, item.ExternalID)
		}
	}

	if err := tx.Commit(); err != nil {
		return nil, 0, err
	}
	committed = true
	return blocked, len(batch.Items), nil
}

func (s *Store) EdgeRequestTotals(userID int64) (EdgeRequestTotals, error) {
	now := time.Now().Unix()
	rows, err := s.db.Query(`SELECT edge_request_limit, edge_requests_used, edge_usage_day
		FROM user_plans WHERE user_id=? AND kind='plan' AND status='active'
		AND (expiry_at=0 OR expiry_at>?)`, userID, now)
	if err != nil {
		return EdgeRequestTotals{}, err
	}
	defer rows.Close()
	buckets := make([]edgeUsageBucket, 0)
	for rows.Next() {
		var b edgeUsageBucket
		if err := rows.Scan(&b.limit, &b.used, &b.day); err != nil {
			return EdgeRequestTotals{}, err
		}
		buckets = append(buckets, b)
	}
	if err := rows.Err(); err != nil {
		return EdgeRequestTotals{}, err
	}
	return edgeUsageTotals(buckets, edgeUsageDayAt(now)), nil
}

func (s *Store) EdgeRequestTotalsForUsers(userIDs []int64) (map[int64]EdgeRequestTotals, error) {
	out := make(map[int64]EdgeRequestTotals, len(userIDs))
	for _, id := range userIDs {
		totals, err := s.EdgeRequestTotals(id)
		if err != nil {
			return nil, fmt.Errorf("edge request totals for user %d: %w", id, err)
		}
		out[id] = totals
	}
	return out, nil
}
