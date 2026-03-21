# CC Writer Findings — PublicMenu
Chain: publicmenu-260321-110752

## Task Context
UX Batch A+5: Quick Fixes + Table Confirmation
Three fixes: PM-062 (active chip color), PM-063 (drawer stepper ×→−), Fix 3 (just-in-time table confirmation)

## Findings

### Fix 1 — PM-062: Active category chip still indigo

1. **[P3] Active category chip uses indigo instead of terracotta `#B5543A`** (CategoryChips component, imported at x.jsx:105)
   — The `CategoryChips` component is imported from `@/components/publicMenu/refactor/CategoryChips` which is a Base44 deployed component, NOT in our local repo. The active chip's background color is controlled inside that component. All other terracotta fixes were correctly applied in MenuView.jsx and x.jsx (prices, +buttons, layout toggles, confirmation buttons all use `style={{backgroundColor:'#B5543A'}}`), but the CategoryChips component was missed.
   — **FIX:** Need to either (a) create a local copy of CategoryChips that accepts an `activeColor` prop and passes `style={{backgroundColor:'#B5543A'}}` to the active chip, or (b) update the CategoryChips component in Base44 to use terracotta instead of indigo for the active state. Since the component is external, the simplest approach is to pass an `activeColor="#B5543A"` prop from x.jsx line 3152-3159 and ensure the CategoryChips component respects it. If CategoryChips doesn't support `activeColor`, a B44 prompt is needed to update the component.

### Fix 2 — PM-063: Drawer stepper shows × instead of −

2. **[P2] CartView draft item stepper shows XIcon when quantity=1 instead of Minus** (CartView.jsx:806)
   — Line 806: `{item.quantity === 1 ? <XIcon className="w-3.5 h-3.5 text-red-500" /> : <span className="text-slate-600 text-sm font-medium">−</span>}`
   — When quantity is 1, the minus button renders `<XIcon>` (a red × icon), which acts as remove-all. This is confusing because: (a) it looks like a cancel/close action, not decrement, (b) on the dish card in MenuView.jsx the stepper correctly shows `<Minus>` for all quantities (lines 113-125, 174-190), creating inconsistency, (c) per spec, the stepper should always be «− 1 +» with auto-remove when qty reaches 0.
   — **FIX:** Replace line 806 in CartView.jsx:
   ```jsx
   // BEFORE:
   {item.quantity === 1 ? <XIcon className="w-3.5 h-3.5 text-red-500" /> : <span className="text-slate-600 text-sm font-medium">−</span>}
   // AFTER:
   <Minus className="w-3.5 h-3.5 text-slate-600" />
   ```
   Also import `Minus` from lucide-react (currently not imported in CartView.jsx — line 2 imports `XIcon, Loader2, ChevronDown, ChevronUp, Users, Gift, ShoppingBag, Bell, X` but NOT `Minus`). Add `Minus` to the import.

3. **[P2] CartView missing Minus import from lucide-react** (CartView.jsx:2)
   — Related to finding #2. The `Minus` icon is not imported in CartView.jsx, but it's needed for the stepper fix.
   — **FIX:** Add `Minus` to the lucide-react import on line 2:
   ```jsx
   import { XIcon, Loader2, ChevronDown, ChevronUp, Users, Gift, ShoppingBag, Bell, X, Minus } from "lucide-react";
   ```

### Fix 3 — Just-in-time table confirmation (Batch 5)

4. **[P1] Submit button disabled when table not verified — no just-in-time flow** (CartView.jsx:1275, x.jsx:2588-2604)
   — Currently, when `isTableVerified === false`, the submit button is completely disabled (line 1275: `disabled={isSubmitting || !isTableVerified}`) with a gray background and a hint text "Введите код стола чтобы отправить заказ" (line 1285). The table code input is buried inside a collapsible "Subtotal" section inside the drawer (CartView.jsx:1079-1189).
   — Per spec, the UX should be: guest taps «Отправить официанту» → if table unknown → Bottom Sheet opens with table confirmation. Currently, the button is disabled and the user must scroll down in the drawer to find the code input. This is a poor UX for guests who don't know the flow.
   — **FIX:** Implement a just-in-time table confirmation flow:
   (a) In x.jsx, add a state `const [showTableConfirmSheet, setShowTableConfirmSheet] = useState(false);`
   (b) Modify handleSubmitOrder (x.jsx:2588) to intercept: if `orderMode === "hall" && !isTableVerified`, set `showTableConfirmSheet(true)` and return (instead of calling validate which fails on `!currentTableId`).
   (c) Create a Bottom Sheet component (or use the existing Drawer) that appears with: title «Подтвердите стол», subtitle, code input fields (reuse the existing table code input pattern from CartView.jsx:1100-1141), and a primary CTA «Подтвердить и отправить».
   (d) On successful table verification inside the sheet, automatically call `handleSubmitOrder()` to send the order.
   (e) In CartView.jsx: change the submit button to NOT be disabled when `!isTableVerified` — instead, make it enabled and call the intercept logic. Change line 1275 from `disabled={isSubmitting || !isTableVerified}` to `disabled={isSubmitting}`.
   (f) The bottom sheet should be `rounded-t-3xl` with backdrop blur, drag handle, ~75-85dvh height.
   (g) If table is already verified (V1 state), skip the sheet and submit directly (current behavior preserved).

5. **[P1] Table code input buried inside drawer subtotal section** (CartView.jsx:1079-1189)
   — The table code input is currently inside a collapsible section within the CartView drawer, requiring the user to scroll down past cart items and loyalty sections. For the just-in-time flow, this input should be prominently placed in the new Bottom Sheet, not hidden in the drawer.
   — **FIX:** Extract the table code verification UI (lines 1084-1189 of CartView.jsx) into a reusable component (e.g., `TableCodeVerification`) that can be rendered both in the CartView (for users who open the drawer before submitting) and in the new Bottom Sheet (for the just-in-time flow). The Bottom Sheet should show: title, benefit line, code input (prominent), CTA button.

6. **[P2] Submit button text doesn't match spec for just-in-time flow** (CartView.jsx:1277-1281)
   — Current button text when not verified: button is disabled so no text change needed currently. But with the just-in-time flow, the CTA should show «Отправить официанту» at all times (enabled), and the bottom sheet CTA should show «Подтвердить и отправить».
   — **FIX:** Update submit button text to always show `tr('cart.send_to_waiter', 'Отправить заказ официанту')` regardless of table verification state, and add new i18n keys for the bottom sheet: `cart.confirm_table.title` = "Подтвердите стол", `cart.confirm_table.subtitle` = "Чтобы отправить заказ официанту", `cart.confirm_table.benefit_loyalty` = "По онлайн-заказу вы получите бонусы / скидку", `cart.confirm_table.benefit_default` = "Так официант быстрее найдёт ваш заказ", `cart.confirm_table.submit` = "Подтвердить и отправить", `cart.confirm_table.change` = "Не тот стол? Изменить".

### Additional findings (independent analysis)

7. **[P2] Console.error left in production code** (x.jsx:2582)
   — Line 2582: `console.error(err);` in the `handleSubmitReviews` catch block. Should use error reporting or remove.
   — **FIX:** Remove `console.error(err);` or replace with a proper error toast (there's already `setSubmitError` on line 2583).

8. **[P3] Order items display uses × (multiplication sign) for quantity in submitted orders** (CartView.jsx:621, 719)
   — Line 621: `{item.dish_name} × {item.quantity}` and line 719: `{item.dish_name} × {item.quantity}`. This is fine for submitted orders (it's a multiplication indicator "Бургер × 2"), but note this is a different × than the stepper issue. These are correct — × here means "times" not "remove". No fix needed but noting for clarity.

9. **[P3] Hardcoded fallback strings in CartView tr() calls** (CartView.jsx:multiple locations)
   — The `tr()` function with fallbacks like `tr('cart.empty', 'Корзина пуста')` is the established pattern in this codebase. These are not violations — the `tr` function is specifically designed for safe fallback handling when i18n keys are missing. No fix needed.

10. **[P2] Cart items in drawer use text "+" and "−" characters instead of icon components** (CartView.jsx:806, 814)
    — Line 806 uses `<span>−</span>` (when qty > 1) and line 814 uses `<span>+</span>`. Meanwhile MenuView.jsx uses `<Minus>` and `<Plus>` icon components. For consistency, the drawer stepper should use the same icon components.
    — **FIX:** In addition to finding #2, also change line 814 from `<span className="text-slate-600 text-sm font-medium">+</span>` to `<Plus className="w-3.5 h-3.5 text-slate-600" />`. Import `Plus` from lucide-react as well.

## Summary
Total: 10 findings (0 P0, 2 P1, 4 P2, 3 P3, 1 informational)

**By fix area:**
- Fix 1 (PM-062 chip color): 1 finding (P3) — requires B44 component update or prop addition
- Fix 2 (PM-063 drawer stepper): 3 findings (2× P2, 1× P2) — missing Minus import, XIcon→Minus, text chars→icons
- Fix 3 (table confirmation): 3 findings (2× P1, 1× P2) — submit disabled→intercept, extract code UI, i18n keys
- Additional: 3 findings (1× P2, 2× P3) — console.error, informational notes
