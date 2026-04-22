# Codex Discussion Position — CartView
Chain: cartview-260415-213231-403a
Topic: CV-B1-Polish findings

## Questions Analyzed

All code references below are active HEAD code, not block comments or commented-out JSX.

### Q1: CV-BUG-07 — Floating point in table sums
**Recommendation:** Treat this as already neutralized in the current snapshot. If the team wants extra hardening, round `tableOrdersTotal` and `guestTotal` locally, but I would not spend the batch on `formatPrice`.

**Reasoning:** The visible table-tab amounts pass through `formatPrice(...)` at `pages/PublicMenu/CartView.jsx:811`, `:834`, and `:848`. That formatter comes from `pages/PublicMenu/x.jsx:1159-1167`, where it already rounds with `Math.round(num * 100) / 100`. The raw producers at `pages/PublicMenu/CartView.jsx:489-498` and `:823-825` are unrounded, but in HEAD they only reach the UI through the rounded formatter.

**Trade-offs:** Skipping avoids redundant `toFixed(2)` clutter in `CartView`, but leaves raw sums available for any future non-`formatPrice` use.

**Mobile UX:** No direct mobile impact if the shared formatter path stays intact.

### Q2: CV-BUG-08 — Empty-cart footer CTA
**Recommendation:** Use primary filled `Вернуться в меню` for the current empty-cart branch.

**Reasoning:** The live branch at `pages/PublicMenu/CartView.jsx:1181-1218` still renders outline `Заказать ещё`. The UX doc is internally inconsistent: `C:/Users/ASUS/Dev/Menu AI Cowork/ux-concepts/CartView/260408-00 CartView UX S246.md:85` still shows outline `Заказать ещё`, but the later decision log at `...S246.md:121-122`, `:172`, and changelog `:393-397` says CV-70 superseded that on April 14, 2026 and removed `Заказать ещё` from the UI. `pages/CartView/BUGS.md:60-67` was updated on April 15, 2026 and matches the newer rule.

**Trade-offs:** This chooses the newest dated decision over a stale state-table row inside the same spec file.

**Mobile UX:** `Вернуться в меню` is a clearer exit CTA than outline `Заказать ещё` when the drawer is effectively read-only.

### Q3: CV-BUG-09 — `Готово` badge in the `Стол` tab
**Recommendation:** Fix `getSafeStatus` to map from `status.internal_code` first, not from the human label.

**Reasoning:** `useTableSession` returns `internal_code` at `pages/PublicMenu/useTableSession.jsx:797-811`, but `pages/PublicMenu/CartView.jsx:300-338` mostly maps by `status.label`. In the `Стол` tab, `pages/PublicMenu/CartView.jsx:840-858` calls `getSafeStatus(getOrderStatus(order))`, so a stage named `Готово` can leak to the guest because the fallback label map knows `Готов`, not `Готово` (`pages/PublicMenu/CartView.jsx:324-331`).

**Trade-offs:** This stops custom stage names from influencing guest text, which is correct for a guest-facing two-state UI.

**Mobile UX:** Two stable chips, `В работе` and `Выдано`, scan faster than mixed labels.

### Q4: CV-BUG-10 — Remove `Счёт стола` cards and decide header total semantics
**Recommendation:** Delete both `Счёт стола` cards and switch the `Стол`-tab header to `Заказано на стол: X ₸`, where `X` is submitted `sessionOrders` only. Do not use `tableTotal` as-is.

**Reasoning:** The cards are at `pages/PublicMenu/CartView.jsx:890-912`. The frozen UX spec says money belongs only in the header (`...S246.md:94-105`) and shows `Заказано на стол` in State T (`...S246.md:348-371`). `...S246.md:101` defines that label as all submitted orders of all guests. But `pages/PublicMenu/useTableSession.jsx:784-788` computes `tableTotal` as submitted table orders plus `cartTotalAmount`, so it overstates the `Стол` header whenever the current guest has an unsubmitted cart.

**Trade-offs:** Slightly bigger diff than just deleting cards, because the header needs a `cartTab === 'table'` branch and a submitted-only total.

**Mobile UX:** Removing the duplicate total cards shortens the drawer and reduces visual repetition.

### Q5: CV-BUG-11 — `Оценить блюда гостей` button
**Recommendation:** Remove the button block from `CartView` in this batch, but leave upstream review-hook cleanup for later unless the implementation task explicitly expands scope.

**Reasoning:** The button is live at `pages/PublicMenu/CartView.jsx:872-882`. State T in the UX spec (`...S246.md:348-369`) does not include it, and `pages/CartView/BUGS.md:95-101` correctly flags a CV-20 privacy violation. The upstream values come from the reviews hook in `pages/PublicMenu/x.jsx:3261-3275` and are passed through at `pages/PublicMenu/x.jsx:4810`.

**Trade-offs:** Some dead plumbing remains after the visible button is removed, but the product risk is the UI, not the unused prop.

**Mobile UX:** This removes a distracting CTA from an already dense tab.

### Q6: CV-BUG-12 — `Гость 5331` instead of `Гость N`
**Recommendation:** Keep `getGuestDisplayName(found)` when the guest exists in `sessionGuests`, and replace the raw-ID fallback with a human ordinal fallback such as `otherGuestIdsFromOrders.indexOf(gid) + 2`. Treat the deeper data-gap cause as a later fix.

**Reasoning:** The bad fallback is explicit at `pages/PublicMenu/CartView.jsx:500-506`. The intended format is backed by `components/sessionHelpers.js:226-229`, which uses `guest.guest_number`. Session guests are supposed to be loaded and refreshed for the full table at `pages/PublicMenu/useTableSession.jsx:340-343` and `:505-508`, so the raw-ID fallback likely means a sync gap between `sessionOrders` and `sessionGuests`.

**Trade-offs:** The ordinal fallback is approximate and can shift if ordering changes between polls, but it is still far better than exposing an opaque internal-looking suffix.

**Mobile UX:** `Гость 2` fits a narrow row title; `Гость 5331` looks broken.

### Q7: CV-BUG-13 — Pluralization of `блюдо`
**Recommendation:** Add a tiny local plural helper in `CartView` and switch the header to `dish_one` / `dish_few` / `dish_many` keys.

**Reasoning:** The bad copy is at `pages/PublicMenu/CartView.jsx:764`, which always renders `tr('cart.header.dishes', 'блюда')`. I did not find a reusable helper in the `PublicMenu` flow; the visible `pluralRu` implementation in this repo lives in an unrelated staff page (`pages/StaffOrdersMobile/260408-00 StaffOrdersMobile RELEASE.jsx:1666`).

**Trade-offs:** This adds three translation keys and a small local helper, but avoids a needless cross-file refactor in a polish batch.

**Mobile UX:** Grammar errors in the compact header are immediately visible and make the UI feel less polished.

### Q8: CV-BUG-06 — Raw `o.status === 'cancelled'` filter
**Recommendation:** Replace the raw-status filter with a stage-first filter based on `getOrderStatus(o).internal_code`, keeping raw `o.status` only as a legacy fallback.

**Reasoning:** The fragile filter is at `pages/PublicMenu/CartView.jsx:413-427`, especially `:422`. The same file already moved `statusBuckets` toward stage-aware logic at `pages/PublicMenu/CartView.jsx:431-442`. Since `getOrderStatus` exposes `internal_code` at `pages/PublicMenu/useTableSession.jsx:805-811`, that is the right source of truth. Comparing translated labels would be the wrong abstraction.

**Trade-offs:** This adds one more `getOrderStatus` call per order, but the list is small and the correctness gain is worth it.

**Mobile UX:** Cancelled orders should not inflate compact totals or remain in the drawer.

## Summary Table

| # | Question | Codex Recommendation | Confidence |
|---|----------|----------------------|------------|
| 1 | CV-BUG-07 floating point sums | Skip as a live HEAD bug; optional local hardening only | medium |
| 2 | CV-BUG-08 empty-cart footer CTA | Use primary `Вернуться в меню` per CV-70 | high |
| 3 | CV-BUG-09 `Готово` badge | Map by `internal_code`, not stage label | high |
| 4 | CV-BUG-10 table-total cards/header | Remove both cards; header uses submitted table total only | high |
| 5 | CV-BUG-11 rate-other-guests button | Remove UI block; deeper cleanup later | high |
| 6 | CV-BUG-12 `Гость 5331` label | Use human ordinal fallback `Гость N` | medium |
| 7 | CV-BUG-13 pluralization | Local plural helper + 3 i18n keys | high |
| 8 | CV-BUG-06 cancelled filter | Filter by `getOrderStatus().internal_code` | high |

## Prompt Clarity

- Overall clarity: 3
- Ambiguous questions:
  - Q1 conflicts with the current rounded formatter in `pages/PublicMenu/x.jsx:1159-1167`.
  - Q2 conflicts with the stale State B row in the UX spec versus the newer CV-70 decision log dated April 14, 2026.
  - Q4 mixes multiple candidate totals, while the later frozen spec clarifies that `Заказано на стол` means submitted orders of all guests.
  - Q6 does not explicitly say whether an approximate ordinal fallback is acceptable for the polish batch.
- Missing context:
  - The referenced PSSK and UX files were actually in the sibling workspace (`C:/Users/ASUS/Dev/Menu AI Cowork/...`), not the repo-local paths.
  - The required sibling `pipeline` write targets are outside this sandbox’s writable roots, and the task did not define a repo-local fallback path.
  - The startup instructions conflict: `VERY FIRST action` required the external start-marker write, while the later `MANDATORY FIRST STEP` required the git sync.
