# Comparison Report — PublicMenu
Chain: publicmenu-260328-083047-385c

## Agreed (both found)

### Fix 1 — CV-01+CV-09: Section restructure [P1]
Both CC and Codex agree: CartView still uses old `Выдано`/`Заказано` split. Needs three sections: **Сейчас** (active) → **История** (delivered, collapsed) → **Новый заказ** (cart). Both note missing urgency sub-grouping within Сейчас (`Готов → Готовится → Принят`), missing collapsed summary for История, and that empty sections must not render.

**CC extra detail (accepted):** CC explicitly identifies that DB uses English status strings (`new`, `preparing`, `ready`, `served`, `completed`) while the task describes Russian labels — critical for correct filtering. CC recommends keeping English-based filtering and only changing display labels. This is correct and important for the merger to follow.

**Agreed fix:** Partition `todayMyOrders` into `nowOrders` (statuses: `new`/any non-served/completed/cancelled) and `historyOrders` (statuses: `served`, `completed`) using raw English DB values. Sub-group nowOrders by status with urgency ordering. Render Сейчас → История → Новый заказ. Empty sections hidden.

### Fix 2 — CV-02+CV-03: Sticky footer [P1]
Both agree: ИТОГО + CTA are inside scrollable content, not sticky. Both prescribe the same flex layout pattern (`flex flex-col h-full` → scrollable area + fixed footer). Both identify three footer states (cart+history, cart-only/first-order, empty cart). Both note float fix (`parseFloat(...toFixed(2))`). Both warn about D7/KB-096 (`relative` breaks vaul).

**CC extra detail (accepted):** CC identifies the specific spacer div `<div className="h-16" />` at line 995 to remove, and notes the existing `sticky bottom-0` on submit button only works within scroll container. Useful for merger.

**Agreed fix:** Restructure to flex layout. Three-state footer. Remove ИТОГО card from scrollable area. Remove «ИТОГО ЗА ВИЗИТ» label entirely.

### Fix 3 — CV-04+CV-05: Remove stars until delivery [P1]
Both agree: Rating UI renders for ALL orders regardless of status. Both prescribe: gate by delivered status only, add «Оценить блюда» CTA for delivered orders, expand stars on tap.

**CC extra detail (accepted):** CC suggests a `ratingExpandedByOrder` state map (order.id → boolean). Codex says the same concept ("expand the existing stars only after CTA is tapped"). Implementation-aligned.

**Agreed fix:** No rating for active orders. Delivered orders get «Оценить блюда» button → expand to show Rating per item. New state: `ratingExpandedByOrder`.

### Fix 4 — CV-06: Collapsed summary rows [P1]
Both agree: active-section orders show full item lists. Both prescribe: per-order collapse state, summary row with first 2 items + `+N`, chevron to expand.

**CC extra detail (accepted):** CC adds P2 finding about chevron touch target ≥ 44×44px (`min-w-[44px] min-h-[44px]`). Valid per MOBILE-FIRST CHECK requirement.

**Agreed fix:** Add `expandedOrders` state. Collapsed: `HH:MM Name1, Name2 +N total ₸ ▾`. Expand on tap. Новый заказ always expanded. Chevron ≥ 44px touch target. Use same price formatter as individual items.

### Fix 5 — CV-07: «Кому заказ» selector [P2]
Both agree: old split toggle is confusing and should be replaced. Both agree: hide when 1 guest, use local `useState` sheet (not pushOverlay per D6c).

**CC extra detail (accepted):** CC notes the conceptual difference between current split-type radio (billing split) and the task's guest-name picker (order assignment). This is a valid scope question but both proceed with implementing the task as described.

**Agreed fix:** Hide when `guestCount <= 1`. Replace radios with `Кому заказ: [name] ▾` + local sheet picker. Use `useState` for open/close.

### Fix 6 — CV-08: Guest-facing status labels [P1→CC, P2→Codex]
Both agree: `getSafeStatus` still uses old labels (`Заказано`, `Выдан гостю`). Both prescribe mapping to 4 labels: Принят, Готовится, Готов, Подано.

**Priority difference:** CC rates P1, Codex rates P2. Since this affects user-facing correctness and is a requirement, **P1 is appropriate**.

**Agreed fix:** Normalize display labels in `getSafeStatus()` without changing raw status values used for filtering. Заказано/Принято → Принят. Выдан гостю → Подано.

### Fix 7 — PM-154: Order filter 06:00 [P1]
Both agree: filter uses midnight cutoff (`toDateString()`). Both prescribe the rolling 06:00 AM business-day cutoff with the same algorithm.

**Agreed fix:** Replace date-only equality with `today6am` cutoff. If current time < 06:00 → use yesterday 06:00.

### Fix 8 — PM-151: Float in success screen [P1]
Both agree: `formatPrice(totalAmount)` in x.jsx passes raw float. Both prescribe wrapping with `parseFloat(totalAmount.toFixed(2))`.

**CC extra detail (accepted):** CC identifies two possible fix locations — line 731 (display) or line 3481 (data source). Either works; applying at display is safer (minimal blast radius).

**Agreed fix:** At x.jsx ~line 731: `formatPrice(parseFloat(totalAmount.toFixed(2)))`.

### Fix 9 — PM-152+PM-153: Guest name localStorage [P1]
Both agree: guest name is not cleared on table change, causing stale names. Both prescribe: clear/namespace storage when table changes, fall back to «Гость».

**CC extra detail (accepted):** CC adds finding #17 — localStorage value should take priority over DB `currentGuest.name` to prevent stale DB name from overriding. This is a valid edge case.

**Agreed fix:** Store last-used table ID in localStorage. On mount, compare with current table — if different, clear `menuapp_guest_name`. Ensure localStorage name takes priority over DB-fetched name on mount.

### Fix 10 — D3: «Все блюда поданы» screen [P1]
Both agree: no D3 screen exists. Both prescribe: condition `nowOrders.length === 0 && historyOrders.length > 0 && cart.length === 0` → banner + collapsed История + sticky footer with «Дозаказать» (primary) + «Попросить счёт» (disabled if no backend).

**Agreed fix:** Add D3 branch. Reuse Fix 1 arrays. «Попросить счёт» disabled with tooltip if no `handleRequestBill` prop. Float-safe totals.

## CC Only (Codex missed)

### CC #17 — PM-153 localStorage priority over DB name [P2] → ACCEPTED
CC notes that even with localStorage persistence, `currentGuest?.name` from DB could override the localStorage value on mount. This is a valid edge case that Codex didn't explicitly address. **Include in fix plan** as part of Fix 9.

### CC Prompt Clarity critique — Fix 5 conceptual ambiguity → NOTED (not a code fix)
CC flagged that Fix 5 conflates split-billing (current implementation) with guest-assignment (task description). This doesn't affect the fix plan (we implement as the task describes) but is useful feedback for the prompt author.

## Codex Only (CC missed)

None. All Codex findings are covered by CC findings.

## Disputes (disagree)

### Priority of Fix 6 — P1 (CC) vs P2 (Codex)
CC rates Fix 6 (status labels) as P1, Codex as P2. The task marks it as [SHOULD-FIX] (not MUST-FIX), which aligns more with P2. However, the labels directly affect user comprehension and are explicitly required.

**Resolution:** Keep as **P1** — it's a user-facing label change that's part of the section restructure. Incorrect labels (like «Заказано» appearing when it should say «Принят») would confuse users alongside the new section names.

No other disputes.

## Final Fix Plan

Ordered by dependency chain (Fix 7 first, then Fix 1, then others that depend on Fix 1's arrays):

1. **[P1] Fix 7 — PM-154: 06:00 filter** — Source: agreed — Replace midnight cutoff with 06:00 AM business-day filter in `todayMyOrders`. File: CartView.jsx.
2. **[P1] Fix 6 — CV-08: Status labels** — Source: agreed — Remap `getSafeStatus()` display labels to Принят/Готовится/Готов/Подано. File: CartView.jsx. (Run before Fix 1 so sub-headers use correct labels.)
3. **[P1] Fix 1 — CV-01+CV-09: Section restructure** — Source: agreed — Split `todayMyOrders` into `nowOrders`/`historyOrders` using English DB statuses. Render Сейчас (with urgency sub-groups) → История (collapsed) → Новый заказ. File: CartView.jsx.
4. **[P1] Fix 3 — CV-04+CV-05: Stars removal** — Source: agreed — Gate rating UI by delivered status. Add «Оценить блюда» CTA with expand state. File: CartView.jsx.
5. **[P1] Fix 4 — CV-06: Collapsed rows** — Source: agreed — Per-order collapse state in Сейчас. Summary: `HH:MM Name1, Name2 +N total ▾`. Chevron ≥ 44px. File: CartView.jsx.
6. **[P1] Fix 2 — CV-02+CV-03: Sticky footer** — Source: agreed — Flex layout. Three-state footer (cart+history / first-order / empty-cart). Remove «ИТОГО ЗА ВИЗИТ». Float-safe sums. File: CartView.jsx.
7. **[P1] Fix 5 — CV-07: Guest selector** — Source: agreed (P2 in Codex, upgraded given UX impact) — Hide for 1 guest. Replace radios with `Кому заказ: [name] ▾` + local useState sheet. File: CartView.jsx.
8. **[P1] Fix 10 — D3 screen** — Source: agreed — Condition: no active + has history + no cart → banner «Все блюда поданы» + collapsed История + sticky footer with Дозаказать + Попросить счёт (disabled). File: CartView.jsx.
9. **[P1] Fix 8 — PM-151: Float success screen** — Source: agreed — Wrap `totalAmount` with `parseFloat(...toFixed(2))` at display point. File: x.jsx.
10. **[P1] Fix 9 — PM-152+153: Guest name localStorage** — Source: agreed — Clear name on table change (compare stored table ID). localStorage priority over DB name on mount. File: x.jsx.

## Summary
- Agreed: 10 items (all 10 fixes)
- CC only: 1 item (PM-153 localStorage priority detail — accepted, merged into Fix 9)
- Codex only: 0 items
- Disputes: 1 minor priority disagreement on Fix 6 (resolved as P1)
- **Total fixes to apply: 10**

## Notes for Discussion/Merge steps
- **DB status values are English** (`new`, `preparing`, `ready`, `served`, `completed`, `cancelled`) — this is the most critical implementation detail. Russian labels are display-only.
- **Dependency chain:** Fix 7 → Fix 6 → Fix 1 → (Fix 3, 4, 10 depend on Fix 1 arrays) → Fix 2 → Fix 5. Fixes 8 and 9 (x.jsx) are independent.
- **KB-095 risk:** Both CartView.jsx and x.jsx modified. Post-chain line count verification mandatory.
- Both reviewers rate prompt clarity at 4/5 — solid but could improve by including raw DB status values in the task description.
