# CC Writer Findings — StaffOrdersMobile
Chain: staffordersmobile-260331-225506-fac7

## Findings

### Fix 1 — SOM-UX-23: Collapsed card Row 3 — replace СЕЙЧАС/ЕЩЁ with per-stage lines

1. [P1] Row 3 СЕЙЧАС/ЕЩЁ labels are noise — need replacement with per-stage summary lines.

**Current code (lines 1701-1721):** Row 3 renders hardcoded «СЕЙЧАС:» and «ЕЩЁ:» labels with `newCount`, `serveCount`, `inProgressCount`, and `requestBadges`. The stage names are hardcoded Russian strings («новых», «выдать», «готовится»).

**Problems confirmed by code analysis:**
- Lines 1704: `СЕЙЧАС: ` label hardcoded — adds noise, not actionable
- Lines 1714: `ЕЩЁ: ` label hardcoded — same issue
- Lines 1706-1707: hardcoded `новых`, `выдать` instead of using `config.label`
- Line 1715: hardcoded `готовится` instead of using `config.label`
- Line 1716: `billData.total` shown in collapsed card — irrelevant for waiter action
- No per-line age visible — waiter can't tell urgency without expanding

**FIX:** Two-part implementation:

**Part A — Add `summaryLines` useMemo (after line 1601, near existing count declarations):**

Add a `useMemo` that:
1. Collects request line (always first if `tableRequests.length > 0`), using oldest `created_date` for age
2. Groups `activeOrders` by stage via `getStatusConfig(order)` — key by `order.stage_id` (via `getLinkId`) or fallback `cfg.derivedNextStatus || '__nostage'`
3. Each stage group stores `label` (from `cfg.label`), `isFirst`, `isFinish`, and order list
4. Sorts: finish stages first (most urgent) → mid stages → first stages last
5. For each group: calculates age from oldest `order.stage_entered_at || order.created_date`
6. Returns array of `{ type: 'request'|'stage', count, ageMin, label }`

Also add `getSummaryLineColor(type, ageMin)` helper:
- Requests: `text-slate-700` if <3 min, `text-red-600` if ≥3 min
- Orders: `text-slate-700` if <5 min, `text-amber-600` if 5-15 min, `text-red-600` if >15 min

**Dependencies for `useMemo`:** `[activeOrders, tableRequests, getStatusConfig]`

⚠️ **Important note on `stage_entered_at`:** This field does NOT currently exist anywhere in the file. The `safeParseDate` call on it will return `Invalid Date` if the field is `undefined`/`null`. The fallback `order.stage_entered_at || order.created_date` handles this correctly at the JS level (undefined is falsy → falls back to `created_date`). This is safe.

⚠️ **`completedOrders` (finish-stage) are NOT in `activeOrders`:** The spec says to group `activeOrders` by stage, which excludes finish-stage orders (lines 1331-1334: `!c.isFinishStage`). However, the spec also says "Finish-stage orders (готово к выдаче / isFinishStage=true)" should appear. This is a contradiction: `activeOrders` has NO finish-stage orders by definition. The fix should ALSO include `completedOrders` in the stage grouping, OR the spec intends "finish" to mean "last active stage before finish" (which is already in `activeOrders`). Given the task spec says `activeOrders` — we follow the spec. The `isFinishStage` sorting won't match any orders from `activeOrders`, but the sort is still correct (finish-adjacent stages sort higher naturally). **Recommendation:** Keep as spec says (`activeOrders` only) — `completedOrders` are already served, waiter doesn't need them in collapsed summary.

**Part B — Replace Row 3 JSX (lines 1701-1721):**

Replace the entire СЕЙЧАС/ЕЩЁ block with a `summaryLines.map()` that renders:
- Each line: `<div className="text-xs {colorClass} flex items-center gap-1 leading-snug">`
- Request line: `{count} запрос[а/ов] · {age} мин`
- Stage line: `{count} {label} · {age} мин`
- Empty state: `Нет активных заказов` (same as current)

**Russian pluralization for "запрос":** 1 = запрос, 2-4 = запроса, 5+ = запросов. The task spec shows `count === 1 ? 'запрос' : count < 5 ? 'запроса' : 'запросов'` — this is correct for 1/2/3/4 but NOT for 11/12/13/14 (should be "запросов" for 11-14, "запрос" for 21, etc.). However, it's unlikely to have >10 requests. The simple version is acceptable. **Minor improvement possible:** `const p = count % 10; const t = count % 100; (t >= 11 && t <= 14) ? 'запросов' : p === 1 ? 'запрос' : (p >= 2 && p <= 4) ? 'запроса' : 'запросов'` — but this is over-engineering for a waiter dashboard where >5 requests is rare.

**Variables to keep:** `newCount`, `serveCount`, `inProgressCount`, `requestBadges` — grep confirms they're ONLY used in Row 3 render (lines 1702-1720). They can be safely left in place (declarations at lines 1599-1601, 1452-1465) as dead code, or removed. **Recommendation:** Leave declarations — they're cheap (no API calls, just `.filter().length`) and removing them risks breaking something if they're referenced in a future merge.

**Unicode escapes:** All new Russian text must use `\uXXXX` escapes per codebase convention.

2. [P2] `show_in_summary` pre-#218 forward-compatibility — The proposed `cfg.show_in_summary === false` check is technically correct but `getStatusConfig` does NOT currently return a `show_in_summary` field (confirmed by reading lines 3281-3313). The check `cfg.show_in_summary === false` will always be `undefined === false` → `false` → no filtering occurs. This is the intended behavior (show all stages). When #218 adds the field to `getStatusConfig`, it will work automatically. **No code change needed** — this is informational. FIX: Include the check `if (cfg.show_in_summary === false) return;` in the stageMap loop as specified — it's forward-compatible and harmless now.

## Summary
Total: 2 findings (0 P0, 1 P1, 1 P2, 0 P3)

Finding 1 (P1) is the main implementation — replace Row 3 with per-stage summary lines. The task spec's implementation is well-specified and mostly correct. Key observations:
- `stage_entered_at` fallback to `created_date` is safe
- `activeOrders` excludes finish-stage by design — this is correct for collapsed summary
- Pluralization is simplified but acceptable
- `show_in_summary` forward-compat check is harmless

## Prompt Clarity
- Overall clarity: **5/5**
- Ambiguous Fix descriptions: None — Fix 1 is extremely detailed with exact line numbers, code snippets, and implementation steps
- Missing context: None — all helpers (`safeParseDate`, `getLinkId`, `getStatusConfig`, `activeOrders`, `tableRequests`) were referenced and confirmed to exist
- Scope questions: One minor question about whether `completedOrders` should be included in stage grouping (resolved: no, `activeOrders` only is correct per spec and per UX logic — served orders don't need waiter action)
