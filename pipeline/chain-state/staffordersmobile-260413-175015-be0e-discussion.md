# Discussion Report — StaffOrdersMobile
Chain: staffordersmobile-260413-175015-be0e
Mode: CC+Codex (synthesized by CC — position files from step 1 were unavailable)
Topic: ПССК review of draft КС prompt — SOM Batch A Android Quick-Fix

## Note on Process
Step 1 (discussion-writer for CC and Codex) was still `running` when the synthesizer launched — neither `-cc-position.md` nor `-codex-position.md` existed. The synthesizer performed independent code verification and generated both perspectives internally, grounded in actual code at `staffordersmobile.jsx` (4524 lines).

---

## Questions Discussed

1. Fix 1 — Guest counter: are line numbers, grep hints, and edge cases complete?
2. Fix 2 — Table card disappears: is the diagnosis correct, is the fix location right?
3. Fix 3 — Star badge stopPropagation: is the fix minimal and correct?
4. Fix 4 — "В РАБОТЕ" wrapper removal: are locations complete, is deletion safety addressed?
5. Cross-cutting: scope creep risks, missing context, overall prompt quality.

---

## Analysis

### Q1: Fix 1 — Guest counter shows dish count instead of unique guests

**CC Position:** The fix description is accurate — `newOrders.length`, `inProgressOrders.length`, `readyOrders.length` are indeed used as guest counts. The suggested fix (`new Set(orders.map(o => getLinkId(o.guest))).size`) is valid — `getLinkId(o.guest)` exists at line 3584. However, the prompt **critically under-counts the affected locations**:
- Prompt mentions lines ~670, ~680, ~708 (3 locations)
- Actual code has **6+ occurrences**: lines 670, 680, 708, 1281, 1291, 1319 (second render branch), plus line 2333 (`section.orders.length` used with pluralRu("гость"...))
- The grep hint `HALL_UI_TEXT.guests` is excellent — it finds all 6 occurrences in the hall card view. But `section.orders.length` at line 2333 (collapsed card's inProgressSections) uses inline strings, not `HALL_UI_TEXT.guests`.

**Codex Position (inferred):** Would likely flag the same completeness issue. The null/undefined guest_id grouping instruction is good ("group as 1 unknown guest"). Would rate the fix description as correct but the location as **incomplete**.

**Status:** Agreed on diagnosis, agreed on incompleteness.

**Resolution:** ⚠️ **Needs clarification.** The prompt MUST:
1. Add lines 1281, 1291, 1319 as additional fix locations (second render branch).
2. Add line 2333 where `section.orders.length` is used with "гостей" pluralization in collapsed card inProgress sections.
3. Expand grep hint: `grep -n "HALL_UI_TEXT.guests\|pluralRu.*гост" staffordersmobile.jsx` to catch all occurrences.
4. Clarify: does unique guest count apply per-table-card (inside expanded view) or per-section-header (global view)? Both use the same pattern but the scope of `orders` differs.

**Rating:** ⚠️ Needs clarification — incomplete locations will cause partial fix.

---

### Q2: Fix 2 — Table card disappears after "Выдать все (N)"

**CC Position:** The diagnosis is correct — the card does disappear. But the **fix location is WRONG**. The prompt points to `visibleGroups` filter at line 3792, suggesting `group.tableSession?.status !== 'closed'`. Two critical problems:

**Problem A — `group` has no `tableSession` field.**
The `orderGroups` construction (lines 3697-3745) builds groups with only `{type, id, displayName, orders}`. There is no `tableSession` attached. The suggestion `group.tableSession?.status !== 'closed'` would always be `undefined !== 'closed'` → `true`, making ALL tables stay in active tab forever.

**Problem B — Orders are filtered out BEFORE grouping.**
`activeOrders` (line 3522-3546) excludes served orders at line 3539-3540:
```js
if (stage.internal_code === 'finish') {
  return o.status !== 'served' && o.status !== 'closed' && o.status !== 'cancelled';
}
```
When all orders reach `served` status, they're removed from `activeOrders` → `visibleOrders` → `orderGroups` never creates the group at all. The `visibleGroups` filter at line 3792 is the SECONDARY problem — the PRIMARY problem is that served orders are excluded from `activeOrders`.

**Correct fix approach:** The fix needs to operate at the `activeOrders` level (keep served hall orders if their table session is still open) OR construct groups from a wider set of orders for the "all served but open" case. This is architecturally different from what the prompt describes.

**Codex Position (inferred):** Would likely agree on the diagnosis but might not catch the `activeOrders` pre-filtering issue. Would flag `group.tableSession` as non-existent.

**Status:** Disagreement on fix approach — both the CC and the draft prompt see the correct symptom, but the draft prompt's fix location and mechanism are wrong.

**Resolution:** ❌ **Rewrite needed.** The fix must:
1. Acknowledge that `activeOrders` filtering (line 3539-3540) is the primary cause.
2. Either: (a) keep served hall orders in `activeOrders` when their table session isn't closed, or (b) introduce a separate query/check for "all-served-but-open" tables at the `orderGroups` level.
3. Remove the suggestion `group.tableSession?.status` — field doesn't exist on group.
4. Clarify how to determine if a table session is closed: `getLinkId(order.table_session)` gives the session ID, but the session's `status` field needs to be fetched — is it available in the data? The prompt must specify this.
5. Keep the `tabCounts` consistency note — it's valid but secondary.

**Rating:** ❌ Rewrite needed — wrong fix location, non-existent field reference.

---

### Q3: Fix 3 — Star badge stopPropagation

**CC Position:** Fix is minimal, accurate, and well-specified.
- Line 2250 (★ mine badge) is a `<div>` with no onClick — CONFIRMED.
- Line 2255 (🔒 other badge) is a `<button>` with stopPropagation — CONFIRMED.
- Lines 2259-2262 (☆ free badge) is a `<div>` with no onClick — CONFIRMED.
- The suggested fix (add `onClick={(e) => e.stopPropagation()}`) is correct and minimal.
- One minor correction: the prompt says the 🔒 is at "~line 2255" — it's exactly line 2255. Good.

**Codex Position (inferred):** Would agree. Might note that turning ★ from `<div>` to `<div onClick={...}>` is correct (keeps it non-semantic, just stops propagation). No functional change beyond preventing the bubbling.

**Status:** Agreed.

**Resolution:** ✅ **Clear.** The fix is well-specified, minimal, correct. No ambiguity.

**Rating:** ✅ Clear.

---

### Q4: Fix 4 — "В РАБОТЕ" wrapper groups stages incorrectly

**CC Position:** The diagnosis is correct — there IS a "В РАБОТЕ" wrapper at lines 677-706 that groups all `inProgressSections` under a single collapsible header. The fix (promote sections to root level) is conceptually right. However:

**Incomplete locations:** The prompt mentions only lines 677-730. But there are **three render branches** with similar code:
1. Lines 677-706 — hall card expanded view (first branch)
2. Lines 1288-1296 — hall card expanded view (second branch, nearly identical)
3. Lines 2346 — legacy path using `inProgressOrders` and `subGroups` (different structure but same wrapper concept)

The prompt must address all three, or explicitly state which branch is the target (and why others are excluded).

**Active/passive styling:** The prompt references UX decision #11 about active vs passive sections. The `inProgressSections.map` at line 2333 (collapsed card) already renders individual sections without wrapper and with opacity-0.6. But the expanded view branches (677, 1288) have the wrapper. The fix should be consistent with line 2333's approach.

**Dead code note:** `inProgressExpanded` state (line 1780) — the prompt says "leave with comment `// reserved — hook order`". This is reasonable to maintain React hooks order stability.

**Scope creep risk:** Promoting sections to root level affects the visual hierarchy significantly. The prompt should clarify whether each promoted section gets its own expand/collapse state (reusing `expandedSubGroups`) or uses a new mechanism.

**Codex Position (inferred):** Would flag the multi-branch issue. Might be more conservative — suggesting that fixing only the primary branch (677-706) and leaving branch 2 (1288-1296) as a follow-up reduces risk. Would agree on the dead code handling.

**Status:** Partial agreement — concept is right, but locations are incomplete and implementation details are underspecified.

**Resolution:** ⚠️ **Needs clarification.**
1. List ALL three render branches explicitly.
2. Clarify: does the expanded-section state come from `expandedSubGroups` (existing) or a new state?
3. Specify active/passive CSS classes explicitly (the prompt references UX decisions but doesn't give concrete Tailwind classes).
4. The prompt says "delete safety: inProgressExpanded becomes dead" — good. But also `setInProgressExpanded` usage at line 2346 must be addressed if that branch is touched.

**Rating:** ⚠️ Needs clarification — incomplete render branch coverage, underspecified styling.

---

### Q5: Cross-cutting concerns

**Scope creep risk (Fix 4):**
- Fix 4 is the largest change — promoting sections from nested to root-level changes DOM structure significantly. An implementor might accidentally alter collapsed card rendering (line 2333) which already works correctly.
- Recommendation: add explicit "DO NOT TOUCH line 2333 — collapsed card inProgressSections are already correct."

**Missing edge case (Fix 1):**
- What if ALL orders in a section have no `guest` field (all null)? The prompt says "group as 1 unknown guest" but what if `getLinkId(o.guest)` returns falsy for all orders? `new Set([...].filter(Boolean)).size` would be 0 — should show "0 гостей" or "1 гость" (unknown)?

**i18n concern:**
- The prompt says "No new user-facing strings." But Fix 4 removes the "В РАБОТЕ" header label — this is removing an existing string, not adding one. Confirm this is intentional.

**Anti-pattern (Fix 2):**
- The prompt's "НЕ должно быть" section is good but doesn't warn against the most likely mistake: adding `served` orders back into `activeOrders` without filtering by `order_type === 'hall'` (which would break pickup/delivery order lifecycle).

---

## Decision Summary

| # | Fix | Draft Rating | Key Issue | Confidence |
|---|-----|-------------|-----------|------------|
| 1 | Guest counter (#293) | ⚠️ Needs clarification | Missing 4+ locations (lines 1281, 1291, 1319, 2333) | High |
| 2 | Table card disappears (#296) | ❌ Rewrite needed | Wrong fix location; `group.tableSession` doesn't exist; `activeOrders` pre-filters served orders | High |
| 3 | Star badge (#297) | ✅ Clear | Minimal, correct, well-specified | High |
| 4 | В РАБОТЕ wrapper (#271) | ⚠️ Needs clarification | Incomplete render branch list (3 branches, not 1); styling underspecified | Medium |
| 5 | Scope lock | ✅ Clear | Appropriate constraints | High |

---

## Recommendations

### Fix 1 — Patch: add missing locations
Add to the "Файл и локация" section:
```
- **~line 1281**: Second render branch — НОВЫЕ section (same pattern as line 670)
- **~line 1291**: Second render branch — В РАБОТЕ section (same pattern as line 680)
- **~line 1319**: Second render branch — ГОТОВО section (same pattern as line 708)
- **~line 2333**: Collapsed card inProgressSections — `section.orders.length` used as guest count with inline "гость" pluralization
- Extended grep: `grep -n "HALL_UI_TEXT.guests\|pluralRu.*гост" staffordersmobile.jsx`
```

### Fix 2 — Rewrite required
The entire "Файл и локация" section needs rewriting:

1. **Primary cause:** `activeOrders` filter (lines 3539-3540) excludes served orders → they never reach `orderGroups`.
2. **Fix approach:** For hall orders at finish stage with status `served`, keep them in `activeOrders` if their `table_session` is not closed. This requires knowing the session status — specify how to obtain it (is it on the order object? Requires a separate fetch?).
3. **Secondary fix:** `visibleGroups` filter (line 3792) needs a third condition for `activeTab === 'active'`: table groups where all orders are served but session is open.
4. **Remove:** reference to `group.tableSession?.status` — this field doesn't exist.
5. **Add anti-pattern:** "Do NOT add served orders back to `activeOrders` for pickup/delivery types — only hall orders with open table sessions."

### Fix 3 — No changes needed
Prompt is clear and correct as written.

### Fix 4 — Patch: add completeness
1. List all three render branches (lines 677, 1288, 2346).
2. Add: "DO NOT TOUCH line 2333 collapsed card sections — already correct."
3. Specify concrete Tailwind classes for active (expanded, colored) vs passive (collapsed, grey, opacity-0.6) sections, or point to an existing example line.
4. Clarify expand/collapse state mechanism for promoted sections.

---

## Unresolved (for Arman)

### Fix 2 — Table session status availability
The fix requires knowing whether a table session is "closed" or "open." The `orderGroups` construction doesn't carry session objects. Two approaches:
- **Option A:** Extend `orderGroups` to include `tableSession` data (requires fetching session entities or deriving status from orders).
- **Option B:** Use a heuristic: if any order in the group has `table_session` and the group has no non-finished, non-cancelled orders, treat it as "all served but open" and keep in active tab.

Arman should decide: is `table_session.status` available on the order object, or does it require a separate entity fetch? This determines the correct approach.

### Fix 4 — Number of render branches to fix
The code has 3 render branches with the "В РАБОТЕ" wrapper:
1. Lines 677-706 (primary hall card view)
2. Lines 1288-1296 (second hall card view — appears to be a conditional variant)
3. Line 2346 (legacy path)

Should all 3 be fixed in this batch, or only the primary (677)?

---

## Quality Notes
- CC Prompt Clarity score: N/A (position file unavailable)
- Codex Prompt Clarity score: N/A (position file unavailable)
- Issues noted:
  - Step 1 writers did not complete before synthesizer launched — both positions generated internally by synthesizer with direct code verification.
  - The draft prompt's Fix 2 has a **structural error** (references non-existent field, wrong primary fix location) that would likely cause implementation failure or a no-op fix.
  - Overall prompt quality: 2/4 fixes are well-specified, 1 needs minor additions, 1 needs rewrite.
  - The scope lock and frozen UX sections are well-written and appropriate.
  - The regression check list is good but could add: "Verify table card remains in Active tab after all orders served."
