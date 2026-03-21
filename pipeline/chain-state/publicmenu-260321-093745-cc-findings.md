# CC Writer Findings — PublicMenu
Chain: publicmenu-260321-093745
Task: Batch 2+3 (Drawer Restructure + StickyCartBar + Visit States + Terracotta complete)

## Analysis Scope
Files analyzed: x.jsx (3446 lines), CartView.jsx (1279 lines), MenuView.jsx (289 lines), CheckoutView.jsx (188 lines), ModeTabs.jsx (82 lines), useTableSession.jsx (838 lines)
Context: BUGS.md (v26.0), STYLE_GUIDE.md (v3.1), public-menu.md referenced specs

---

## Findings

### Batch 3 — Terracotta palette completion (PM-S152-01)

1. **[P2] ModeTabs: Active tab still uses `bg-indigo-600` — line 33**
   ModeTabs.jsx:33 — active mode tab uses `bg-indigo-600 text-white` instead of terracotta `#B5543A`. This is the "В зале" tab highlighted in the task as still indigo.
   FIX: Change `bg-indigo-600 text-white` to inline style `style={{backgroundColor:'#B5543A'}}` with `text-white` class retained. Same pattern as CTA buttons already using terracotta.

2. **[P2] MenuView: Tile "+" button uses `bg-indigo-600` — line 162**
   MenuView.jsx:162 — the round "+" add-to-cart button on tile view cards uses `bg-indigo-600 hover:bg-indigo-700`. Task explicitly names "+" buttons on dish cards as still indigo.
   FIX: Replace `bg-indigo-600 hover:bg-indigo-700` with `style={{backgroundColor:'#B5543A'}}` and `hover:opacity-90` or a hover class.

3. **[P2] MenuView: List "+" button uses `bg-indigo-600` — line 104**
   MenuView.jsx:104 — the square "+" add-to-cart button on list view cards uses `bg-indigo-600 hover:bg-indigo-700`. Same issue as tile view.
   FIX: Replace `bg-indigo-600 hover:bg-indigo-700` with inline style `style={{backgroundColor:'#B5543A'}}`.

4. **[P2] MenuView: Price text uses `text-indigo-600` — lines 85, 203**
   MenuView.jsx:85 (list view) and 203 (tile view) — dish price displayed in `text-indigo-600` and `font-bold text-indigo-600`. STYLE_GUIDE says price color should be `--color-primary` (terracotta).
   FIX: Replace `text-indigo-600` with `style={{color:'#B5543A'}}` on both lines.

5. **[P2] MenuView: Loading spinner uses `text-indigo-600` — line 252**
   MenuView.jsx:252 — `<Loader2 className="... text-indigo-600" />`. Should use terracotta.
   FIX: Replace `text-indigo-600` with `style={{color:'#B5543A'}}`.

6. **[P2] MenuView: Layout toggle active state uses `bg-indigo-600` — lines 229, 239**
   MenuView.jsx:229,239 — Tile/List toggle buttons use `bg-indigo-600 text-white` for active state. These are the "category pills/chips" area.
   FIX: Replace `bg-indigo-600 text-white` with inline style `style={{backgroundColor:'#B5543A'}}` + `text-white`.

7. **[P2] CheckoutView: "Back to menu" link uses `text-indigo-600` — line 37**
   CheckoutView.jsx:37 — the "Назад к меню" link uses `text-indigo-600 hover:underline`.
   FIX: Replace with `style={{color:'#B5543A'}}`.

8. **[P2] CheckoutView: Total price uses `text-indigo-600` — line 76**
   CheckoutView.jsx:76 — total amount displayed in `text-indigo-600`. Should be terracotta.
   FIX: Replace `text-indigo-600` with `style={{color:'#B5543A'}}`.

9. **[P2] CheckoutView: Submit button uses `bg-green-600` — line 173**
   CheckoutView.jsx:173 — the submit CTA button uses `bg-green-600 hover:bg-green-700` instead of terracotta. STYLE_GUIDE mandates primary CTA = terracotta.
   FIX: Replace `bg-green-600 hover:bg-green-700` with `style={{backgroundColor:'#B5543A'}}` (unless submitError or isSubmitting).

### Batch 2 — Drawer structure analysis (NOT implemented, documenting gaps)

10. **[P1] CartView: No drawer layout differentiation by visit state**
    CartView.jsx renders the same layout regardless of whether the user has sent orders before (V1/V2/V3/V4 states from spec). The spec requires 3 distinct drawer layouts:
    - Layout 1 (before first send): only draft items + CTA "Отправить официанту"
    - Layout 2 (after send + new draft): draft on top, sent orders middle, bill section, CTA "Отправить новый заказ"
    - Layout 3 (after send, no draft): sent orders expanded, bill, CTA "Заказать ещё" + "Открыть счёт"

    Currently the sections are rendered in a fixed order (header → review hints → table orders → table total → my orders → new order → loyalty → totals → submit) regardless of state. The section ordering doesn't match spec (draft should be on TOP, sent orders below in Layout 2).
    FIX: Introduce a `drawerLayout` computed variable based on `myOrders.length > 0` (has sent) and `cart.length > 0` (has draft). Reorder JSX sections conditionally. Update CTA text per state.

11. **[P1] CartView: CTA text doesn't match 7-state matrix**
    CartView.jsx:1265-1269 — the submit button always shows "Отправить заказ официанту" or "Отправляем..." or "Повторить отправку". The spec defines 7 different CTA states (V1+D0 through V7+D0) with different primary/secondary labels.
    FIX: Compute CTA text from visit+draft state. Add secondary CTA button where spec requires it (e.g., "Продолжить выбор", "Открыть счёт", "Мои заказы").

12. **[P1] CartView: No visual separation between sent and draft items**
    CartView.jsx — sent orders (SECTION 3, line 667) and draft items (SECTION 2, line 783) use similar visual styling. Spec requires distinct visual treatment: sent = no stepper, no remove button, status chip, calm background; draft = steppers visible, remove visible, brighter section title.
    FIX: Add `bg-slate-50` or muted background to sent orders section. Remove stepper from sent items (already the case — sent items don't have steppers, but section title and card style should differ more).

13. **[P1] CartView: Missing collapsible СЧЁТ (bill) section**
    The spec Layout 2 and Layout 3 require a collapsible "СЧЁТ" section showing bill summary (Только мои / Общий toggle). Currently the table total (SECTION 6, line 655) is shown as a simple card but lacks the required collapsible behavior and bill breakdown per the spec.
    FIX: Add collapsible bill section with my-bill vs table-bill toggle.

14. **[P1] CartView: Missing "Заказать ещё" CTA for no-draft state (Layout 3)**
    When user has sent orders but empty cart (V3+D0), the spec says the primary CTA should be "Заказать ещё" which closes the drawer and returns to menu. Currently, if cart is empty, there's no submit button at all (guarded by `cart.length > 0` at line 1245).
    FIX: Show "Заказать ещё" button when `myOrders.length > 0 && cart.length === 0`. On click: close drawer, return to menu.

### Batch 3 — StickyCartBar visit states

15. **[P1] StickyCartBar: No 7-state visibility matrix implementation**
    x.jsx:2056-2079 — the `showCartButton` and `hallStickyMode` variables implement a simplified 4-state model (cart/myBill/tableOrders/cartEmpty) but don't match the 7-state visibility matrix from the spec. Missing states: "Fully paid → fade out 5s", "Tab closed by waiter → hidden", "Tab closed by waiter + has items → hidden + confirm reset".
    FIX: Add visit state detection (open/paid/closed) from tableSession status. Implement fade-out animation for paid state. Implement hidden + confirm reset dialog for closed-with-items state.

16. **[P1] StickyCartBar: Text modes not implemented per spec**
    x.jsx:2082-2091 — the sticky bar shows labels like "Оформить заказ", "Мой счёт", "Заказы стола" but the spec defines two specific text modes:
    - Draft mode: `2 блюда · Новый заказ · 3400₸`
    - Visit mode: `Мой заказ · 2 отправлено · Не оплачено 5600₸`
    FIX: Reformat StickyCartBar text to match the spec's two-mode pattern. Use item count and totals.

17. **[P2] StickyCartBar: Missing animation on "+" add**
    The spec requires: "On `+`: subtle count bump animation in StickyCartBar + toast Добавлено". The toast is already implemented (line 2245), but there's no count bump animation on the bar itself.
    FIX: Add CSS transition or animation class to the count display in StickyCartBar when cart items change.

18. **[P2] StickyCartBar: Missing "bar rises" animation on first item**
    Spec: "On first item added: bar rises/activates with soft animation". Currently StickyCartBar simply appears/disappears based on boolean conditions with no transition.
    FIX: Add enter/exit transition (CSS transform translateY or opacity) to StickyCartBar.

### Existing bugs from BUGS.md still present

19. **[P0] BUG-PM-050: Order items created after loyalty redeem — STILL ACTIVE**
    x.jsx:2460-2470 — `OrderItem.bulkCreate` happens AFTER the loyalty redeem try/catch block (lines 2442-2457). If loyalty redeem succeeds but bulkCreate fails, points are deducted without a matching order. The BUGS.md documents this as active P0.
    FIX: Move `OrderItem.bulkCreate` to immediately after `Order.create` (before loyalty side effects). Same pattern needed in pickup/delivery flow (lines 2834-2843 are already correctly placed BEFORE earn, but the redeem at 2817-2832 happens first).

20. **[P1] BUG-PM-051: Cart survives mode switches — STILL ACTIVE**
    x.jsx:2205-2226 — `handleModeChange` doesn't validate or clear cart items. Dishes enabled_hall may not be enabled_pickup, so switching modes can leave invalid items in cart.
    FIX: In `handleModeChange`, filter cart items against the new mode's available dishes, or warn user and clear.

21. **[P1] BUG-PM-053: Hall confirmation shows wrong total — STILL ACTIVE**
    x.jsx:2541 — `confirmedTotal` is calculated from raw `cart.reduce(sum)` which is pre-discount, but the order was created with `finalTotal` (post-discount). Confirmation screen shows inflated total.
    FIX: Use `finalTotal` instead of recalculating from cart items for the confirmation screen total.

### Additional findings

22. **[P2] CartView: Section rendering order doesn't match spec**
    CartView.jsx currently renders: Header → Review hints → Table orders (SECTION 5) → Table total (SECTION 6) → My orders (SECTION 3) → New order (SECTION 2). The section numbers in comments are out of sequence and don't match the spec's expected drawer layout order (Draft on top → Sent orders → Bill → Submit).
    FIX: Reorder sections to: Header → New order (draft, top) → My orders (sent, middle) → Table orders → Bill/Total → Submit. This aligns with Batch 2 Layout 2 spec.

23. **[P2] CartView: No stepper in draft items — only "remove all" button**
    CartView.jsx:799 — draft items show only an X button that removes the entire item (`updateQuantity(item.dishId, -item.quantity)`). The spec says draft items should have steppers visible (- / count / +) for quantity adjustment.
    FIX: Replace the X-only remove button with a stepper component (Minus/Plus with quantity display), matching the MenuView stepper pattern.

24. **[P2] x.jsx: `console.warn` statements left in production — lines 1323, 1330, 1371, 1599, 1602**
    Multiple `console.warn` calls remain in production code. While less severe than `console.log`, they still pollute the console.
    FIX: Remove or gate behind a debug flag.

25. **[P3] CheckoutView: Stepper buttons have no min touch target**
    CheckoutView.jsx:58-64 — the +/- stepper buttons use `p-1` which results in ~24px touch targets, below the 44px minimum from STYLE_GUIDE.
    FIX: Add `min-w-[44px] min-h-[44px]` or increase padding.

26. **[P3] MenuView: Category chips area not checked — file is imported component**
    The task mentions "Category pills/chips" still using indigo. CategoryChips is imported from `refactor/CategoryChips` which wasn't directly read. Likely has similar indigo issue.
    FIX: Check `CategoryChips.jsx` for indigo usage and replace with terracotta.

---

## Summary
Total: 26 findings (1 P0, 8 P1, 14 P2, 3 P3)

### By batch:
- **Batch 3 (Terracotta):** 9 findings (all P2) — #1-9, #26. Hardcoded indigo in ModeTabs, MenuView, CheckoutView
- **Batch 2 (Drawer restructure):** 7 findings (5 P1, 2 P2) — #10-14, #22-23. Missing visit-state layouts, CTA matrix, visual separation, collapsible bill, section ordering
- **Batch 3 (StickyCartBar):** 4 findings (2 P1, 2 P2) — #15-18. Missing 7-state matrix, text modes, animations
- **Existing BUGS.md bugs:** 3 findings (1 P0, 2 P1) — #19-21. PM-050, PM-051, PM-053 still active
- **Additional:** 3 findings (1 P2, 2 P3) — #24-26. Console warns, touch targets, unchecked component
