# Discussion Report — CartView
Chain: cartview-260415-213231-403a
Mode: CC-only (Codex position missing)
Topic: CV-B1-Polish findings — 8 bugs (CV-BUG-06..13)

## Status Note

**Codex position file was not found** (`cartview-260415-213231-403a-codex-position.md` does not exist in `pipeline/chain-state/`). The Codex PSSK source (`pipeline/pssk-cv-b1-polish-codex-v1.md`) is also absent. Codex likely failed, timed out, or was not executed for this chain.

This report is based on CC's position only. All recommendations carry CC-only confidence and should be treated as single-reviewer findings (no cross-validation).

## Questions Discussed

1. CV-BUG-07 (P0) — Floating point in monetary sums
2. CV-BUG-08 (P0) — CTA "Заказать ещё" instead of "Вернуться в меню"
3. CV-BUG-09 (P1) — Badge "Готово" in Стол tab
4. CV-BUG-10 (P1) — "Счёт стола" blocks not in spec
5. CV-BUG-11 (P2) — "Оценить блюда гостей" button (privacy)
6. CV-BUG-12 (P1) — "Гость 5331" instead of "Гость N"
7. CV-BUG-13 (P2) — Pluralization "17 блюда"
8. CV-BUG-06 (L) — Raw `o.status === 'cancelled'` check

## Analysis

### Q1: CV-BUG-07 (P0) — Floating point in monetary sums
**CC Position:** Fix 3 unprotected `formatPrice` call sites (lines 811, 834, 848) with `parseFloat(Number(x).toFixed(2))`. Consistent with pattern already used at 6 other call sites in the same file.
**Codex Position:** N/A (missing)
**Status:** CC-only
**Resolution:** Accept CC recommendation. The analysis is thorough — all 9 `formatPrice` calls were audited, 3 unprotected ones identified. The fix pattern matches existing code. Low risk.

### Q2: CV-BUG-08 (P0) — CTA regression (CV-70)
**CC Position:** Replace outline button with primary filled button, change label from `cart.cta.order_more` ("Заказать ещё") to `cart.cta.back_to_menu` ("Вернуться в меню"). Same `onClick` behavior.
**Codex Position:** N/A (missing)
**Status:** CC-only
**Resolution:** Accept CC recommendation. Direct UX spec compliance (CV-70 rule b). The change is purely visual + label, no logic change. The orphaned i18n key `cart.cta.order_more` should be noted for cleanup.

### Q3: CV-BUG-09 (P1) — "Готово" badge leak
**CC Position:** Add `'Готово'` to `oldInProgressLabels` array at line 326. Simple string addition.
**Codex Position:** N/A (missing)
**Status:** CC-only
**Resolution:** Accept CC recommendation. Root cause is clear — the neuter form `'Готово'` is missing while masculine `'Готов'` is present. Minimal change, minimal risk. The suggestion to also add lowercase variants is a reasonable hardening step but optional for Polish batch.

### Q4: CV-BUG-10 (P1) — "Счёт стола" blocks violate CV-50/CV-19
**CC Position:** (A) Remove both Card blocks (lines 890-900 and 902-912). (B) Make header conditional: Stol tab shows "Заказано на стол: X ₸", My tab keeps "N блюд · X ₸".
**Codex Position:** N/A (missing)
**Status:** CC-only
**Resolution:** Accept CC recommendation with a caveat. This is the most complex fix in the batch — two deletions + a conditional header rewrite. The logic is sound (CV-50 mandates money only in header, CV-19 specifies Stol tab header format). However, the header IIFE modification is intricate and **would benefit from Codex cross-validation that is missing**. Recommend careful manual testing. Medium confidence without second opinion.

### Q5: CV-BUG-11 (P2) — "Оценить блюда гостей" button
**CC Position:** Remove entire button block (lines 872-883). CV-20 privacy principle prohibits cross-guest interaction.
**Codex Position:** N/A (missing)
**Status:** CC-only
**Resolution:** Accept CC recommendation. Pure deletion, no new code. The prop `otherGuestsReviewableItems` becomes orphaned in CartView but the computation in x.jsx is harmless. Clean and safe.

### Q6: CV-BUG-12 (P1) — "Гость 5331" fallback label
**CC Position:** Option A (index-based fallback): use `otherGuestIdsFromOrders.indexOf(gid) + 2` for sequential numbering. Option B (proper data fix) deferred to future batch.
**Codex Position:** N/A (missing)
**Status:** CC-only
**Resolution:** Accept CC Option A for Polish batch. The stability concern (numbering may shift if guest order changes) is acknowledged but acceptable — it matches real-world semantics (earliest orderer = lowest number). The alternative (exposing full SessionGuest data) is correctly identified as out of scope.

### Q7: CV-BUG-13 (P2) — Pluralization
**CC Position:** Add inline `pluralizeRu(n, one, few, many)` helper (~6 lines) + 3 new i18n keys (`cart.header.dish_one/few/many`).
**Codex Position:** N/A (missing)
**Status:** CC-only
**Resolution:** Accept CC recommendation. The Russian pluralization algorithm is standard and correct (handles teens, mod-10 rules). Inline helper is appropriate for Polish batch — extraction to shared util is future scope per F7. Note: if Q4 changes the header to show "Заказано на стол" in Stol tab, this pluralization only applies in My tab header.

### Q8: CV-BUG-06 (L) — Raw cancelled status check
**CC Position:** Replace `o.status !== 'cancelled'` at line 422 with stage-based check via `getOrderStatus`, matching the pattern already used in `statusBuckets`. Add `getOrderStatus` to useMemo deps.
**Codex Position:** N/A (missing)
**Status:** CC-only
**Resolution:** Accept CC recommendation. The fix aligns `todayMyOrders` filtering with the already-correct `statusBuckets` pattern. Adding the dep to useMemo is the right thing to do. Low priority (L) so can be deferred if batch scope is tight.

## Decision Summary
| # | Question | CC | Codex | Resolution | Confidence |
|---|----------|----|-------|------------|------------|
| 1 | CV-BUG-07 FP sums | Fix 3 call sites with toFixed(2) | N/A | accept CC | high |
| 2 | CV-BUG-08 CTA regression | Primary filled + "Вернуться в меню" | N/A | accept CC | high |
| 3 | CV-BUG-09 "Готово" badge | Add 'Готово' to oldInProgressLabels | N/A | accept CC | high |
| 4 | CV-BUG-10 "Счёт стола" | Remove Cards + conditional header | N/A | accept CC (needs testing) | medium |
| 5 | CV-BUG-11 Rate others btn | Remove lines 872-883 | N/A | accept CC | high |
| 6 | CV-BUG-12 "Гость 5331" | Index-based fallback (Option A) | N/A | accept CC | medium |
| 7 | CV-BUG-13 Pluralization | Inline pluralizeRu + 3 i18n keys | N/A | accept CC | high |
| 8 | CV-BUG-06 Raw cancelled | Stage-based check via getOrderStatus | N/A | accept CC | high |

## Recommendations

All 8 bugs: accept CC recommendations as stated. Implementation order:

1. **P0 first:** CV-BUG-07 (FP sums), CV-BUG-08 (CTA)
2. **P1 next:** CV-BUG-09 (badge), CV-BUG-10 (table total cards), CV-BUG-12 (guest label)
3. **P2 then:** CV-BUG-11 (rate others), CV-BUG-13 (pluralization)
4. **L last:** CV-BUG-06 (cancelled status)

**Interaction between fixes:** Q4 (CV-BUG-10) and Q7 (CV-BUG-13) both modify the header at line 764. They must be implemented together to avoid merge conflicts. The pluralization applies only to the My-tab branch of the conditional header.

## Unresolved (for Arman)

**No items require Arman's decision on technical merits** — all CC recommendations are well-supported by UX spec references and code analysis.

However, Arman should be aware:
- **Codex was absent for this entire discussion.** All findings are single-reviewer. Q4 (the most complex fix) would particularly benefit from a second opinion before implementation.
- **CV-BUG-06 is tagged "L" (low).** Arman may choose to defer it entirely from the Polish batch to reduce risk.

## Quality Notes
- CC Prompt Clarity score: 4/5 (from CC position file)
- Codex Prompt Clarity score: N/A (file missing)
- Issues noted:
  - Codex position file completely absent — chain step 1 (Codex runner) either failed, timed out, or was not executed
  - CC analysis is thorough with line-level audit, diff sketches, and side-effect analysis for all 8 bugs
  - Q4 and Q7 have a cross-dependency (both touch header line 764) that CC noted but could be more explicitly flagged as an implementation constraint
