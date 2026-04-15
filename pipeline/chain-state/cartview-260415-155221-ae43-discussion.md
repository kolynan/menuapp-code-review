# Discussion Report — CartView
Chain: cartview-260415-155221-ae43
Mode: CC-only (Codex position missing)
Topic: CV-B1-Polish (8 bugs after CV-B1-Core)

## Note on Codex Absence

Codex position file was never generated for this chain. Only `cartview-260415-155221-ae43-cc-position.md` exists. This report synthesizes CC's analysis alone, with independent verification against HEAD where feasible. Confidence levels are adjusted downward for items that would benefit from a second opinion.

## Questions Discussed

1. Q1: CV-BUG-07 (P0) — Floating point in monetary sums
2. Q2: CV-BUG-08 (P0) — Footer CTA "Заказать ещё" vs "Вернуться в меню"
3. Q3: CV-BUG-09 (P1) — Badge "Готово" in Стол tab
4. Q4: CV-BUG-10 (P1) — "Счёт стола" blocks violate CV-50 + CV-19
5. Q5: CV-BUG-11 (P2) — Button "Оценить блюда гостей" not in spec
6. Q6: CV-BUG-12 (P1) — Label "Гость 5331" instead of "Гость N"
7. Q7: CV-BUG-13 (P2) — Pluralization "17 блюда"
8. Q8: CV-BUG-06 (L) — Raw `o.status === 'cancelled'`

## Analysis

### Q1: CV-BUG-07 (P0) — Floating point in monetary sums

**CC Position:** Fix at source — round `tableOrdersTotal` (line ~497) and `guestTotal` (line ~825) with `parseFloat(sum.toFixed(2))`. This follows the existing pattern used in 6+ other places in HEAD (lines 631, 764, 896, 908, 1087). Do NOT modify `formatPrice` (defined in x.jsx, out of scope).

**Codex Position:** N/A (missing)

**Status:** CC-only, no disagreement possible.

**Resolution:** Accept CC's recommendation. The pattern is already established in HEAD. Fixing at computation is better than at display — ensures all downstream consumers get clean values.

**Confidence:** High — the existing codebase pattern is clear, and the fix is mechanical.

**Diff:** ~3 changed lines (2 computations + 1 optional guard on line 848).

**Test plan:**
1. Multi-guest session, items totaling fractional sums (e.g., 1099.29 × 3) → "Стол" tab shows clean sum.
2. Individual guest subtotals are also clean.

---

### Q2: CV-BUG-08 (P0) — Footer CTA "Заказать ещё" → "Вернуться в меню"

**CC Position:** Replace outline "Заказать ещё" (lines ~1209-1218) with primary filled "Вернуться в меню" using `backgroundColor: primaryColor` + `text-white`. The onClick action is already correct. New i18n key: `cart.cta.back_to_menu`.

**Codex Position:** N/A (missing)

**Status:** CC-only.

**Resolution:** Accept CC's recommendation. CV-70 rule b is explicit about State B CTA wording and styling. The action doesn't need change — only label and style.

**Open question:** CC says no need to distinguish State B vs E — both return to menu. This is reasonable: when cart is empty, "Вернуться в меню" is always the right label. If a future state needs "Заказать ещё" it can be added then.

**Confidence:** High — spec is unambiguous.

**Diff:** ~6 changed lines (style + label).

**Test plan:**
1. Cart with orders but empty cart items → filled button reads "Вернуться в меню".
2. Tap → returns to menu.

---

### Q3: CV-BUG-09 (P1) — Badge "Готово" in Стол tab

**CC Position:** **Already fixed in HEAD** (CV-B1-Core). `getSafeStatus` at lines 299-338 implements CV-52 2-status model. `ready`/`prepared` fall through to "В работе". No action needed.

**Codex Position:** N/A (missing)

**Status:** CC-only.

**Resolution:** Accept — skip this bug. CC's finding that HEAD already handles `ready` → "В работе" via the else branch is credible (CV-B1-Core specifically targeted CV-52). Should be verified during KS execution but no diff needed.

**Confidence:** High — CC read the HEAD code directly.

**Diff:** None (0 lines).

---

### Q4: CV-BUG-10 (P1) — "Счёт стола" blocks violate CV-50 + CV-19

**CC Position:** Delete both Card blocks (lines ~891-900 full, ~903-912 mini). Modify header (line ~753-767) with conditional: "Стол" tab → "Заказано на стол: X ₸" using `tableTotal` (full table sum); "Мои" tab → keep "N блюд · X ₸". New i18n key: `cart.header.table_total`.

**Codex Position:** N/A (missing)

**Status:** CC-only.

**Resolution:** Accept CC's recommendation with one clarification.

**Clarification on `tableTotal`:** CC uses `tableTotal` (prop, all guests including self) for the "Стол" tab header. This is correct for "Заказано на стол" — it represents what the entire table has ordered. The distinction between `tableTotal` (all) vs `tableOrdersTotal` (others only) matters — "на стол" semantically means the whole table.

**Risk:** This is the largest diff (~20 deleted lines + ~10 new lines in header). Careful line counting needed during KS.

**Confidence:** Medium-high — spec is clear, but the header conditional adds complexity. Would have benefited from Codex review.

**Diff:** ~-20 lines (delete Card blocks) + ~10 lines (header conditional).

**Test plan:**
1. "Мои" tab → header shows "N блюд · X ₸" (unchanged).
2. "Стол" tab → header shows "Заказано на стол: X ₸", no separate Card block.

---

### Q5: CV-BUG-11 (P2) — Button "Оценить блюда гостей" not in spec

**CC Position:** Delete the button block (lines ~872-883, 12 lines). Keep props `otherGuestsReviewableItems` and `openReviewDialog` — they're defined in x.jsx and may be used by other components. i18n key `review.rate_others` becomes orphaned in CartView but may be used elsewhere.

**Codex Position:** N/A (missing)

**Status:** CC-only.

**Resolution:** Accept. CV-20 privacy rule is explicit — guests don't rate others' dishes. Pure deletion, no new code.

**Orphan check at KS time:** Grep `review.rate_others` across the full project. If only used here, note for translation cleanup (separate task).

**Confidence:** High — straightforward deletion per spec.

**Diff:** ~-12 lines.

**Test plan:**
1. "Стол" tab expanded → no "Оценить блюда гостей" button.
2. "Мои" tab rating flow still works.

---

### Q6: CV-BUG-12 (P1) — Label "Гость 5331" instead of "Гость N"

**CC Position:** Option A — use `otherGuestIdsFromOrders.indexOf(gid) + 2` as fallback (self = 1, others start at 2). Quick, minimal, within scope. Option B (fix fetch in x.jsx) is out of scope. Option C (A + console.warn) conflicts with no-debug-logs rule.

**Codex Position:** N/A (missing)

**Status:** CC-only.

**Resolution:** Accept Option A with a nuance.

**Nuance on stability:** `otherGuestIdsFromOrders` order depends on Map insertion order from `sessionOrders`, which is stable within a render cycle. Between polling cycles, if a new guest appears, existing guests' numbers could theoretically shift. In practice this is unlikely (guests don't frequently join/leave), and the fallback path itself is a race-condition edge case. Acceptable for CV-B1-Polish; root-cause fetch fix belongs in CV-B1b (#334).

**Risk note:** If the same guest gets different numbers across renders, it could confuse. But "Гость 5331" is worse. This is a clear improvement.

**Confidence:** Medium — would have benefited from Codex's take on the stability concern.

**Diff:** ~3 changed lines.

**Test plan:**
1. Multi-guest session (3 guests), "Стол" tab → shows "Гость 2", "Гость 3".
2. Guest with name in sessionGuests → shows actual name.

---

### Q7: CV-BUG-13 (P2) — Pluralization "17 блюда"

**CC Position:** Inline `pluralRu(n, one, few, many)` helper in CartView.jsx (~8 lines). Replace single `cart.header.dishes` with 3 keys: `cart.header.dish_one` ("блюдо"), `cart.header.dish_few` ("блюда"), `cart.header.dish_many` ("блюд").

**Codex Position:** N/A (missing)

**Status:** CC-only.

**Resolution:** Accept with minor observation.

**Observation:** The `pluralRu` helper is standard Russian pluralization logic. Inline is correct for CV-B1-Polish (minimal diff). If other pages need it later, extract to a shared util then. The 3-key i18n approach is clean.

**Note on Q4 interaction:** If Q4 changes the header for "Стол" tab to "Заказано на стол: X ₸" (no dish count), then pluralization only applies in "Мои" tab header. The `pluralRu` call should be inside the "Мои" tab branch of the conditional from Q4.

**Confidence:** High — standard algorithm, clear spec.

**Diff:** ~8 lines (helper) + ~1 line (call site change). Note interaction with Q4 header rewrite.

**Test plan:**
1. 1 item → "1 блюдо"
2. 3 items → "3 блюда"
3. 17 items → "17 блюд"
4. 21 items → "21 блюдо"

---

### Q8: CV-BUG-06 (L) — Raw `o.status === 'cancelled'` (line ~422)

**CC Position:** Replace `.filter(o => o.status !== 'cancelled')` with `getOrderStatus`-based check, matching the pattern used in `statusBuckets` (lines 430-442). Multi-line filter with `internal_code` check + raw status fallback.

**Codex Position:** N/A (missing)

**Status:** CC-only.

**Resolution:** Accept with simplification preference.

**Simplification:** CC's proposed 5-line filter is correct but verbose. An alternative: extract a tiny helper `isOrderCancelled(o)` that encapsulates both checks. But per minimal-diff principle, the inline version is fine. The key point is consistency with how `statusBuckets` already handles cancellation.

**Performance note (from CC):** `getOrderStatus` is already called per order in `statusBuckets`. Adding it to the filter means double calls per order. Since `todayMyOrders` feeds `statusBuckets`, consider computing the filter inside the same loop — but that's a refactor beyond scope. The duplication is acceptable for a small order count.

**Confidence:** Medium — the fix pattern is sound, but verifying `getOrderStatus` return shape for cancelled orders would ideally be double-checked. CC acknowledged this uncertainty.

**Diff:** ~5 changed lines.

**Test plan:**
1. Waiter cancels order via SOM → CartView hides cancelled order.
2. `ordersSum` and header dish count exclude cancelled.

---

## Decision Summary

| # | Bug | Priority | CC | Codex | Resolution | Confidence |
|---|-----|----------|----|-------|------------|------------|
| 1 | CV-BUG-07 FP money | P0 | `toFixed(2)` at computation | N/A | accept CC: round at source | high |
| 2 | CV-BUG-08 CTA label | P0 | filled "Вернуться в меню" | N/A | accept CC: per CV-70 | high |
| 3 | CV-BUG-09 "Готово" badge | P1 | already fixed in HEAD | N/A | skip — no action needed | high |
| 4 | CV-BUG-10 "Счёт стола" | P1 | delete Cards + conditional header | N/A | accept CC: per CV-50/CV-19 | medium-high |
| 5 | CV-BUG-11 rate others btn | P2 | delete button block | N/A | accept CC: per CV-20 | high |
| 6 | CV-BUG-12 "Гость 5331" | P1 | Option A seq index | N/A | accept CC: minimal fallback | medium |
| 7 | CV-BUG-13 pluralization | P2 | inline pluralRu + 3 keys | N/A | accept CC: standard approach | high |
| 8 | CV-BUG-06 raw o.status | L | getOrderStatus-based filter | N/A | accept CC: consistency | medium |

## Recommendations

**Actionable decisions for KS:**

1. **CV-BUG-07:** Add `parseFloat(sum.toFixed(2))` to `tableOrdersTotal` return (line ~497) and `guestTotal` computation (line ~825).
2. **CV-BUG-08:** Replace outline "Заказать ещё" button with filled "Вернуться в меню" (lines ~1209-1218). New key `cart.cta.back_to_menu`.
3. **CV-BUG-09:** No action — already fixed in CV-B1-Core.
4. **CV-BUG-10:** Delete both "Счёт стола" Card blocks (~lines 891-912). Rewrite header (~line 753) with conditional: Стол → "Заказано на стол: X ₸", Мои → "N блюд · X ₸". New key `cart.header.table_total`.
5. **CV-BUG-11:** Delete "Оценить блюда гостей" button block (~lines 872-883).
6. **CV-BUG-12:** Replace `gid.slice(-4)` fallback with `otherGuestIdsFromOrders.indexOf(gid) + 2` (~line 503).
7. **CV-BUG-13:** Add inline `pluralRu` helper (~8 lines) + replace `cart.header.dishes` with 3 plural keys. Place inside Мои-tab branch of Q4 header conditional.
8. **CV-BUG-06:** Replace `o.status !== 'cancelled'` (line ~422) with `getOrderStatus`-based check.

**Execution order recommendation:** Q4 first (largest structural change), then Q5 (adjacent deletion), then Q7 (header interaction with Q4), then Q1, Q2, Q6, Q8 in any order. Q3 skip.

## i18n Keys Table

| Action | Key | RU Value |
|--------|-----|----------|
| ADD | `cart.cta.back_to_menu` | Вернуться в меню |
| ADD | `cart.header.table_total` | Заказано на стол |
| ADD | `cart.header.dish_one` | блюдо |
| ADD | `cart.header.dish_few` | блюда |
| ADD | `cart.header.dish_many` | блюд |
| REMOVE | `cart.cta.order_more` | verify no other usage first |
| REMOVE | `cart.table_total` | verify no other usage first |
| REPLACE | `cart.header.dishes` | replaced by 3 plural forms above |
| ORPHAN? | `review.rate_others` | grep project-wide before removing |

## Orphan Vars/Functions to Remove

- **No code-level orphans.** All props (`otherGuestsReviewableItems`, `openReviewDialog`) are passed from x.jsx — keep destructuring.
- **`otherGuestsReviewableItems`** is only consumed in the deleted button (Q5). The prop still arrives from x.jsx. Leaving unused destructuring is safe; removing the x.jsx computation is out of scope.

## Risks / Open Items for KS

1. **Q4 + Q7 interaction:** The header rewrite (Q4) and pluralization (Q7) both touch lines ~753-767. KS must coordinate these — apply Q4 first, then Q7 inside the Мои branch.
2. **Q6 stability:** Sequential guest numbers may shift between polling cycles. Acceptable for fallback path, but note for QA.
3. **Q8 `getOrderStatus` shape:** Need to verify `internal_code` values for cancelled stages during KS. If no cancel `internal_code` exists, the raw-status fallback still covers it.
4. **NULL bytes in HEAD:** KS must use the `python3` workaround or `sed` to handle NULLs when grepping.
5. **Codex review gap:** Without Codex's independent analysis, Q4 (largest change) and Q6 (stability concern) have reduced confidence. KS reviewer should pay extra attention to these.

## KS Recommendation

**One KS (C5v2) for all 7 bugs** (Q3 skipped). Rationale:
- All changes are in a single file (`CartView.jsx`).
- Total estimated diff: ~+20 lines (helper + header conditional), ~-35 lines (deleted blocks), ~10 modified lines.
- Changes are independent — no cascading dependencies between bugs.
- Splitting into multiple KS adds overhead ($12+ each) without benefit.
- Recommended budget: $12 is sufficient for 7 targeted fixes.

## Unresolved (for Arman)

No hard disagreements (Codex was absent). However, two items warrant Arman's attention:

1. **Q4 — "Заказано на стол" sum composition:** CC recommends `tableTotal` (all guests incl. self). If the intent is "what others ordered" (excluding self), use `tableOrdersTotal` instead. The label "на стол" suggests all-inclusive, but Arman should confirm against UX-spec §348.

2. **Q6 — Fallback approach:** Option A (sequential index) is a cosmetic fix. The root cause (missing guest in `sessionGuests`) persists. Should CV-B1b (#334) include a proper fetch fix? If yes, Option A is interim. If no, Option A is permanent.

## Quality Notes

- CC Prompt Clarity score: 4/5 (from CC position file)
- Codex Prompt Clarity score: N/A (position file missing)
- Issues noted:
  - Codex position was never generated — reduces dual-perspective value of this discussion chain.
  - Line number references in task context were from pre-Core RELEASE (1164 lines), not HEAD (1223 lines). CC adapted but this caused extra analysis overhead.
  - The NULL bytes warning was valuable — saved CC from silent grep failures.
