# Comparison Report — PublicMenu
Chain: publicmenu-260326-223118-f62f

## Agreed (both found)

### 1. [P2] No date/session filtering on orders — PM-142
- **CC (#1):** Filter `myOrders` to today's date using `toDateString()` comparison, store as `todayMyOrders` via `useMemo`.
- **Codex (#1):** Derive `currentVisitOrders` from `myOrders`/`sessionOrders` using today's date or active session ID.
- **Verdict:** Both agree the filtering is completely missing. CC provides more concrete code (useMemo with date field fallback chain). **Use CC's implementation** — it includes the `o.created_at || o.created_date || o.createdAt` fallback pattern and keeps orders without dates as edge-case safety.

### 2. [P2] No full-datetime sort — PM-143
- **CC (#2):** Sort filtered array by full datetime descending (newest first) inside the same useMemo.
- **Codex (#2):** Sort each group by `new Date(order.created_at || order.created_date || order.createdAt).getTime()` descending.
- **Verdict:** Identical approach. Both agree sort is missing and must use full datetime, not HH:MM only. **Use CC's combined useMemo** (filter + sort in one pass).

### 3. [P2] Wrong section structure — PM-144 (Выдано/Заказано/Новый заказ)
- **CC (#3):** Split `todayMyOrders` into `servedOrders` (served/completed) and `activeOrders` (rest except cancelled). Two new collapse states. Remove old `myOrdersExpanded`. Reorder JSX.
- **Codex (#3 + #4):** Same conclusion split across two findings — structure is absent (#3) and Новый заказ is buried (#4). Recommends same approach: split by status, separate expand/collapse, render Новый заказ as own section.
- **Verdict:** Full agreement. Codex described the problem in two findings but same fix. **Use CC's concrete plan** — includes specific state names (`servedExpanded`, `activeExpanded`), status groupings, and JSX restructure order.

### 4. [P2] Floating point display artifacts — PM-145
- **CC (#4):** Apply `parseFloat(x.toFixed(2))` to: (a) new visitTotal, (b) per-order subtotals, (c) line item totals at line 717.
- **Codex (#5):** Same — compute one `visitTotal` across all sections, normalize with `parseFloat(visitTotal.toFixed(2))`, apply to displayed subtotals.
- **Verdict:** Identical. Both agree on the same `parseFloat(toFixed(2))` pattern from x.jsx. **Use CC's three-point application** (visit total + order subtotals + line items) for completeness.

## CC Only (Codex missed)

### 5. [P2] Section chevrons need ≥44px touch targets — CC #5
CC noted that new "Выдано" and "Заказано" section headers need chevron buttons with `min-w-[44px] min-h-[44px]` — matching existing table card header chevron pattern (line 474-482).
- **Validity:** VALID. Task spec explicitly requires mobile-first check with ≥44×44px touch targets for chevron buttons. This is a new UI element that needs the explicit sizing.
- **Decision:** ACCEPT — include in fix plan.

### 6. [P1] D7 warning — no `relative` class on new wrappers — CC #6
CC flagged KB-096: any new container divs inside DrawerContent must NOT have `relative` class (breaks vaul drawer). Need post-implementation audit.
- **Validity:** VALID. This is explicitly called out in the task prompt as D7 rule. Critical for drawer functionality.
- **Decision:** ACCEPT — include as implementation constraint and post-fix verification.

### 7. [P2] "Для кого" selector position — CC #7
CC noted the split selector should remain inside "Новый заказ" Card after restructure. No code change needed, just verification.
- **Validity:** VALID but no action needed — it's a verification step, not a fix.
- **Decision:** ACCEPT as verification item only (not a separate fix).

### 8. [P2] "ИТОГО за визит" i18n label — CC #8
CC noted the new "ИТОГО за визит" string needs `tr('cart.visit_total', 'ИТОГО за визит')` for i18n compliance.
- **Validity:** VALID. Code rules require ALL user-facing strings use `tr()`. This is a new string.
- **Decision:** ACCEPT — include in fix plan. Also check that section headers "Выдано", "Заказано", "Новый заказ" use `tr()`.

## Codex Only (CC missed)

None. All Codex findings map to CC findings. Codex split PM-144 into two findings (#3 structure + #4 position) while CC combined them into one, but no unique issues from Codex.

## Disputes (disagree)

### Minor: Severity of D7 `relative` class warning
- CC rated it P1 (high priority — drawer breaks).
- Codex did not flag it at all.
- **Resolution:** Agree with CC's P1 — this is from KB-096 and has caused production regressions. Keep as P1 constraint.

### Minor: i18n for new section headers
- CC flagged only "ИТОГО за визит" as needing `tr()`.
- Codex did not flag any i18n.
- **Resolution:** CC is correct. Additionally, new section headers "Выдано", "Заказано", "Новый заказ" should also use `tr()` for consistency. Expand CC's finding.

No significant disputes on approach or implementation.

## Final Fix Plan

Ordered list of all fixes to apply:

1. **[P2] Date filtering — PM-142** — Source: AGREED — Add `useMemo` to filter `myOrders` to today's date only, with `created_at || created_date || createdAt` fallback chain. Keep orders without dates as safety.

2. **[P2] Full datetime sort — PM-143** — Source: AGREED — Sort filtered orders by full datetime descending (newest first) inside same `useMemo`.

3. **[P2] Section restructure — PM-144** — Source: AGREED — Split filtered orders into `servedOrders` (status: served/completed) and `activeOrders` (rest except cancelled). Replace single "Ваши заказы" section with "Выдано" (collapsed default) + "Заказано" (expanded default). Keep "Новый заказ" (cart) as always-visible section. Remove old `myOrdersExpanded` state, add `servedExpanded` (false) + `activeExpanded` (true).

4. **[P2] Float fix — PM-145** — Source: AGREED — Apply `parseFloat(x.toFixed(2))` to: (a) new `visitTotal` sum, (b) per-order subtotals in section rows, (c) line item totals (`item.dish_price * item.quantity`).

5. **[P2] Chevron touch targets** — Source: CC ONLY — New section header chevrons must have `min-w-[44px] min-h-[44px]` button wrapper. Copy pattern from table card header chevron.

6. **[P1] D7 constraint — no `relative` in DrawerContent** — Source: CC ONLY — Implementation constraint: do NOT add `relative` class to any new wrapper inside DrawerContent. Post-implementation: `grep -n "relative" CartView.jsx`.

7. **[P2] i18n for new strings** — Source: CC ONLY (expanded) — All new user-facing strings must use `tr()`: `tr('cart.served', 'Выдано')`, `tr('cart.ordered', 'Заказано')`, `tr('cart.new_order', 'Новый заказ')`, `tr('cart.visit_total', 'ИТОГО за визит')`.

8. **[P2] Verification — "Для кого" selector** — Source: CC ONLY — After restructure, verify "Для кого заказ" split selector remains inside "Новый заказ" Card.

## Summary
- Agreed: 4 items (PM-142 filter, PM-143 sort, PM-144 structure, PM-145 float)
- CC only: 4 items (4 accepted, 0 rejected) — chevron targets, D7 constraint, i18n, selector verification
- Codex only: 0 items
- Disputes: 0 significant (2 minor severity differences, resolved in CC's favor)
- **Total fixes to apply: 7** (items 1-7 are actionable; item 8 is verification only)
