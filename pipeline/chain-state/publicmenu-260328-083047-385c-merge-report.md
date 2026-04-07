# Merge Report — PublicMenu
Chain: publicmenu-260328-083047-385c

## Applied Fixes
1. [P1] Fix 7 — PM-154: 06:00 filter — Source: agreed — DONE. Replaced midnight `toDateString()` cutoff with rolling 06:00 AM business-day filter. Orders before 06:00 AM belong to previous shift.
2. [P1] Fix 6 — CV-08: Status labels — Source: agreed — DONE. Remapped `getSafeStatus()` fallbacks: `new`→Принят, `finish/ready/done`→Готов, `served/completed`→Подано. Added display-layer normalization: Заказано→Принят, Готово→Готов, Выдан гостю→Подано.
3. [P1] Fix 1 — CV-01+CV-09: Section restructure — Source: agreed — DONE. Renamed `servedOrders`→`historyOrders`, `activeOrders`→`nowOrders`. Added urgency sub-grouping (ready→preparing→new). Rendered Сейчас→История→Новый заказ with correct labels. Empty sections hidden.
4. [P1] Fix 3 — CV-04+CV-05: Stars removal — Source: agreed — DONE. Added `ratingExpandedByOrder` state. Rating UI gated by `showRating` param — only shown for delivered orders. «Оценить блюда» CTA button expands to show Rating per item.
5. [P1] Fix 4 — CV-06: Collapsed rows — Source: agreed — DONE. Added `expandedOrders` state. Collapsed row: `HH:MM Name1, Name2 +N total ₸ ▾`. Chevron ≥ 44px touch target. Новый заказ always expanded.
6. [P1] Fix 2 — CV-02+CV-03: Sticky footer — Source: agreed — DONE. Restructured to flex layout (`flex flex-col h-full` + `flex-1 overflow-y-auto` + footer). Three-state footer. Removed «ИТОГО ЗА ВИЗИТ» label. Float-safe sums.
7. [P1] Fix 5 — CV-07: Guest selector — Source: agreed — DONE. Hidden when `canSplit` is false (1 guest). Replaced radio buttons with simple picker UI using local `useState`. No `pushOverlay` per D6(c).
8. [P1] Fix 10 — D3 screen — Source: agreed — DONE. Condition: `nowOrders.length === 0 && historyOrders.length > 0 && cart.length === 0`. Shows ✅ banner, collapsed История, sticky footer with «Дозаказать» (primary) + «Попросить счёт» (disabled with title tooltip).
9. [P1] Fix 8 — PM-151: Float success screen — Source: agreed — DONE. x.jsx line 731: `formatPrice(parseFloat((totalAmount || 0).toFixed(2)))`.
10. [P1] Fix 9 — PM-152+153: Guest name localStorage — Source: agreed — DONE. x.jsx: On init, compare `menuapp_last_table` with current `table` URL param. If different → clear `menuapp_guest_name`. Always update `menuapp_last_table`.

## Skipped — Unresolved Disputes (for Arman)
None. All 10 items agreed by both CC and Codex.

## Skipped — Could Not Apply
None.

## Git
- Pre-task commit: df5df0313a678993d5a7fe8b3f230963e3ebdca3
- Commit: 2e5bb6d
- Files changed: 3 (CartView.jsx, x.jsx, BUGS.md)
- CartView.jsx: 1044 → 1156 lines (+112)
- x.jsx: 4003 → 4014 lines (+11)
- KB-095 verified: git HEAD == working tree for both files

## Prompt Feedback
- CC clarity score: 4/5
- Codex clarity score: 4/5
- Fixes where writers diverged due to unclear description: Fix 5 (conceptual ambiguity between split-billing radio and guest-name picker — CC flagged this, Codex didn't). Both implemented as task described.
- Fixes where description was perfect (both writers agreed immediately): Fix 7 (06:00 filter), Fix 8 (float fix), Fix 2 (sticky footer), Fix 4 (collapsed rows).
- Recommendation for improving task descriptions:
  - Include raw DB status values (`new`, `preparing`, `ready`, `served`, `completed`, `cancelled`) directly in Fix 1 description. Both writers had to grep the code to discover this.
  - Fix 5: Clarify whether replacing `splitType` logic entirely or adding a parallel `orderForGuest` concept.
  - Fix 9: Clarify that `tableCodeParam` comes from URL and a page reload = full state reset.

## Summary
- Applied: 10 fixes
- Skipped (unresolved): 0 disputes
- Skipped (other): 0 fixes
- MUST-FIX not applied: 0
- Commit: 2e5bb6d
