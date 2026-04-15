# Comparison Report — CartView
Chain: cartview-260415-225026-8ace
Date: 2026-04-15
Comparator: CC (Opus)

## Source Availability

| Source | File | Status |
|--------|------|--------|
| CC Writer | `cartview-260415-225026-8ace-cc-findings.md` | Present — 10 findings, 7 fixes, 204 lines |
| Codex Writer | `cartview-260415-225026-8ace-codex-findings.md` | **ABSENT** (known bug #357) |
| Prior CC Position | `cartview-260415-213231-403a-cc-position.md` | Present — 8 questions, 440 lines |
| Prior Discussion | `cartview-260415-213231-403a-discussion.md` | Present — CC-only mode, 111 lines |

**Note:** Codex Writer did not produce findings for this chain (bug #357). The task context (КС) was manually synthesized by Cowork and attributes specific insights to "Codex" from an earlier analysis round ($1.46/25m, 105 lines). These Codex-attributed insights are referenced below but were never formalized as a Codex findings file.

Searched locations: `pipeline/chain-state/*codex*cartview*`, `pipeline/chain-state/*8ace*`, `pages/**/codex-findings*`, `pages/CartView/review_*.md` — all negative.

---

## Agreed (both found)

Since Codex findings are absent, there are no items formally found by both reviewers in this chain. However, the Cowork synthesis in the task context shows agreement between CC and earlier Codex analysis on the following:

### 1. Fix 1 — CV-BUG-07 (P0): Floating-point in sums
- **CC (8ace):** Fix 3 unprotected `formatPrice` call sites (:811, :834, :848) + round in `tableOrdersTotal` useMemo (:497)
- **Codex (from Cowork synthesis):** Noted `formatPrice` in x.jsx:1159-1167 already does `Math.round(num*100)/100`, making visible error unlikely — but agreed with defense-in-depth approach
- **Consensus:** Both agree fix is needed. CC approach (call-site + useMemo rounding) accepted.

### 2. Fix 2 — CV-BUG-08 (P0): Empty-cart CTA regression
- **CC (8ace):** Replace outline "Заказать ещё" → primary filled "Вернуться в меню" at :1209-1218
- **Codex (from Cowork):** No disagreement noted
- **Consensus:** Straightforward CV-70 compliance. High confidence.

### 3. Fix 5 — CV-BUG-11 (P2): Remove "Оценить блюда гостей"
- **CC (8ace):** Delete :872-883 entirely. CV-20 privacy violation.
- **Codex (from Cowork):** No disagreement noted
- **Consensus:** Pure deletion, no new code. High confidence.

### 4. Fix 6 — CV-BUG-12 (P1): "Гость 5331" → "Гость N"
- **CC (8ace):** Option A — index-based fallback via `otherGuestIdsFromOrders.indexOf(gid) + 2`
- **Codex (from Cowork):** Both reviewers agreed on Option A
- **Consensus:** Accepted. Medium confidence (numbering stability depends on `sessionOrders` sort order).

### 5. Fix 7 — CV-BUG-06 (P1/L): Raw `o.status === 'cancelled'` → stage-based
- **CC (8ace):** Replace :422 with stage-based check via `getOrderStatus`, add to useMemo deps
- **Codex (from Cowork):** No disagreement noted
- **Consensus:** Aligns with already-correct `statusBuckets` pattern. High confidence.

---

## CC Only (Codex missed)

### 6. Fix 1 supplement — `tableOrdersTotal` useMemo rounding
- **CC (8ace) Finding #1:** `:497` returns raw `sum` without `toFixed(2)`. CC recommends adding `return parseFloat(sum.toFixed(2))` in the useMemo itself (in addition to call-site fixes).
- **Evaluation:** Valid — defense-in-depth. The useMemo rounding prevents any non-`formatPrice` consumer from seeing raw floats. **Accept.**

### 7. CC scope questions (8ace findings, lines 209-217)
CC raised several implementation ambiguities:
- Header IIFE guard `(ordersSum > 0 || cart.length > 0)` at :754 may not execute on Стол tab when user has no personal orders but table orders exist → header won't show `submittedTableTotal`. **Valid concern. Flagged for implementer.**
- `getSafeStatus` icon/color format inconsistency between existing branches and new `internal_code` branches. **Minor — new branches use spec-defined values.**
- `submittedTableTotal` filters by `o.status` strings (same fragility as Fix 7). **Valid — acknowledged as pragmatic for Polish batch.**

---

## Codex Only (CC missed)

### 8. Fix 3 — CV-BUG-09: `internal_code`-first mapping in `getSafeStatus`
- **Codex (from Cowork synthesis):** Recommended mapping by `internal_code` first, label as fallback
- **CC (8ace) Finding #4:** Only proposed adding `'Готово'` to `oldInProgressLabels` + an `internal_code` early-check. CC's 8ace finding is more conservative (label-first with extended list) while Cowork spec merges both approaches.
- **CC (403a) Position Q3:** Only proposed adding `'Готово'` to the label list — did NOT propose `internal_code` early-check.
- **Evaluation:** The `internal_code`-first approach from Codex is architecturally superior — it handles ALL partner custom labels, not just known ones. **Accept Codex's approach (merged with CC's label fallback extension).** This is the synthesis already in the task spec.

### 9. Fix 4 — CV-BUG-10: `tableTotal` includes draft cart → `submittedTableTotal`
- **Codex (from Cowork synthesis):** Critical catch — `tableTotal` prop from `useTableSession.jsx:784-788` = submitted orders + `cartTotalAmount` of current guest → inflates Стол-tab header
- **CC (403a) Position Q4:** Used `tableTotal` directly for Стол-tab header (didn't catch the draft inclusion)
- **CC (8ace) Finding #7:** Adopted `submittedTableTotal` useMemo (submitted-only filter) — incorporating Codex's insight
- **Evaluation:** Codex caught a real bug that CC initially missed. The `submittedTableTotal` useMemo with explicit status filter is the correct fix. **Accept.**

---

## Disputes (disagree)

### 10. Fix 3 — Scope of `getSafeStatus` refactor
- **CC (8ace):** Proposes both `internal_code` early-check AND extending `oldInProgressLabels` with `'Готово'`. Notes icon/color format inconsistency.
- **CC (403a):** Only proposed label extension (conservative).
- **Cowork spec:** Merged approach — `internal_code` first (Codex idea) + label fallback with `'Готово'` (CC idea).
- **Resolution:** Cowork spec's merged approach is correct. Not a true dispute — CC evolved its position between 403a and 8ace after seeing Codex's insight. **Use merged approach from spec.**

### 11. Fix 4 — Header guard condition
- **CC (8ace) scope question:** `(ordersSum > 0 || cart.length > 0)` guard at :754 won't fire when Стол tab is active and user has no personal orders. Should it be extended to `|| (cartTab === 'table' && submittedTableTotal > 0)`?
- **Cowork spec:** Does not address this. Shows only the inner content change, not the guard.
- **Resolution:** **Flag for implementer.** The guard SHOULD be extended, otherwise Стол-tab header won't show table total when user hasn't ordered. This is a **gap in the spec** — recommend adding the guard extension during implementation. Priority: P1 (header invisible on Стол tab for guests who haven't ordered personally).

---

## Final Fix Plan

Ordered list of all fixes to apply, with priority and source:

| # | Priority | Fix | Bug ID | Source | Description |
|---|----------|-----|--------|--------|-------------|
| 1 | P0 | Fix 1 | CV-BUG-07 | Agreed (CC+Cowork) | Round `tableOrdersTotal` useMemo (:497) + wrap 3 call-sites (:811, :834, :848) with `parseFloat(Number(x).toFixed(2))` |
| 2 | P0 | Fix 2 | CV-BUG-08 | Agreed (CC+Cowork) | Replace outline "Заказать ещё" → primary filled "Вернуться в меню" (:1209-1218) |
| 3 | P1 | Fix 3 | CV-BUG-09 | Merged (CC label + Codex internal_code) | Add `internal_code` early-check in `getSafeStatus` (:300-338) + extend `oldInProgressLabels` with `'Готово'` |
| 4 | P1+P2 | Fix 4 | CV-BUG-10+13 | CC + Codex catch (`submittedTableTotal`) | Add `submittedTableTotal` useMemo + `pluralizeRu` helper + conditional header by `cartTab` + delete Card "Счёт стола" blocks. **Implementation note:** extend header guard to `\|\| (cartTab === 'table' && submittedTableTotal > 0)` |
| 5 | P1 | Fix 6 | CV-BUG-12 | Agreed (CC+Cowork) | Replace `gid.slice(-4)` fallback with index-based ordinal from `otherGuestIdsFromOrders` |
| 6 | P1 | Fix 7 | CV-BUG-06 | Agreed (CC+Cowork) | Replace raw `o.status !== 'cancelled'` (:422) with stage-based check via `getOrderStatus` + fix useMemo deps |
| 7 | P2 | Fix 5 | CV-BUG-11 | Agreed (CC+Cowork) | Delete "Оценить блюда гостей" button (:872-883) |

**Implementation order:** Fix 1 → Fix 2 → Fix 3 → Fix 7 → Fix 6 → Fix 4 (includes pluralization) → Fix 5

**Cross-dependencies:**
- Fix 4 MUST be implemented together with pluralization (CV-BUG-13) — both modify header at :753-767
- Fix 4 depends on Fix 1 having already rounded `tableOrdersTotal` (for consistency)
- Fix 5 (deletion at :872-883) and Fix 4 (deletion of Card blocks at :890-912) are close in line numbers — apply Fix 4 deletions first, then Fix 5, to avoid line-number drift

**New artifacts:**
- `pluralizeRu` helper (~6 lines, after `trFormat` ~:297)
- `submittedTableTotal` useMemo (~7 lines, after `tableOrdersTotal` ~:498)
- `internal_code` early-check in `getSafeStatus` (~10 lines, after null check ~:303)

**Deleted artifacts:**
- Card "Счёт стола" blocks (:890-912 in HEAD — 1 or 2 blocks depending on HEAD state)
- "Оценить блюда гостей" button (:872-883)

**New i18n keys:**
- `cart.cta.back_to_menu` = "Вернуться в меню"
- `cart.header.table_ordered` = "Заказано на стол"
- `cart.header.dish_one` = "блюдо"
- `cart.header.dish_few` = "блюда"
- `cart.header.dish_many` = "блюд"

**Orphaned i18n keys** (can remove from translations):
- `cart.cta.order_more`
- `cart.header.dishes`
- `cart.table_total`
- `review.rate_others`

---

## Summary

- **Agreed:** 5 items (Fix 1, Fix 2, Fix 5, Fix 6, Fix 7)
- **CC only:** 2 items (useMemo rounding supplement, scope questions — both accepted)
- **Codex only:** 2 items (`internal_code`-first mapping, `submittedTableTotal` catch — both accepted)
- **Disputes:** 2 items (getSafeStatus scope — resolved via merged approach; header guard — flagged for implementer)
- **Total fixes to apply:** 7 (covering 8 bug IDs: CV-BUG-06 through CV-BUG-13)

## Confidence Assessment

| Fix | Confidence | Notes |
|-----|-----------|-------|
| Fix 1 (FP sums) | HIGH | Pattern matches existing code, well-audited |
| Fix 2 (CTA) | HIGH | Pure visual + label, direct spec compliance |
| Fix 3 (getSafeStatus) | HIGH | Merged approach covers both `internal_code` and legacy labels |
| Fix 4 (header + cards) | MEDIUM | Most complex fix; header guard gap flagged; no Codex cross-validation on final form |
| Fix 5 (rate others) | HIGH | Pure deletion |
| Fix 6 (guest label) | MEDIUM | Numbering stability depends on sort order |
| Fix 7 (cancelled filter) | HIGH | Mirrors existing correct pattern |

## Spec Gaps Flagged for Implementer

1. **Header guard (:754):** Extend `(ordersSum > 0 || cart.length > 0)` to also trigger when `cartTab === 'table' && submittedTableTotal > 0`. Without this, Стол-tab header won't show for guests who haven't ordered personally.
2. **`submittedTableTotal` status filter:** Uses hardcoded status strings (`submitted`, `accepted`, etc.) — same fragility as the raw status check in Fix 7. Pragmatic for Polish batch but should be revisited with stage-based filtering in future sprint.
3. **`getSafeStatus` icon/color consistency:** New `internal_code` branches use different icon/color values than existing label-based branches. Verify visual consistency during testing.
