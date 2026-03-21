# CC Writer Findings — PublicMenu
Chain: publicmenu-260321-195108
Task: PM-071 — Bottom Sheet trigger для Table Confirmation

## Analysis Summary

The `handleSubmitOrder` function in **x.jsx:2629-2632** already contains the correct trigger logic:
```js
if (orderMode === "hall" && !isTableVerified) {
  pendingSubmitRef.current = true;
  setShowTableConfirmSheet(true);
  return;
}
```

The Table Confirmation Drawer UI exists at **x.jsx:3382-3482** with full UI (title, code input, CTA button, "change table" link).

The auto-submit after verification also exists at **x.jsx:2090-2098**.

**So why doesn't the Bottom Sheet appear?** The root cause is a **stacked Drawer conflict**: two sibling `<Drawer>` components from vaul/radix-ui. When the cart Drawer (x.jsx:3297) is open and `showTableConfirmSheet` becomes `true`, the second Drawer either:
- Renders behind the first Drawer's overlay (invisible to user)
- Gets blocked by the first Drawer's portal/focus trap
- Has its overlay swallowed by the cart Drawer's backdrop

This is a known limitation of vaul's `<Drawer>` — it doesn't natively support two independent Drawer instances both open at the same time unless one is explicitly nested inside the other using the `Drawer.NestedRoot` pattern (vaul v0.9+).

---

## Findings

### 1. [P1] Stacked Drawer conflict — Table Confirmation Sheet invisible when Cart Drawer is open (PM-071 root cause)
- **File:** x.jsx, lines 3297-3380 (cart Drawer) and 3382-3482 (confirmation Drawer)
- **Description:** Both Drawers are rendered as siblings at the same JSX level. When user clicks "Отправить официанту" inside the cart Drawer, `handleSubmitOrder` sets `showTableConfirmSheet = true` BUT the confirmation Drawer either renders behind the cart Drawer's overlay or gets focus-trapped. The user sees no visible response — "silent failure".
- **FIX:** Move the Table Confirmation Drawer **inside** the Cart Drawer's `<DrawerContent>`, rendering it as a nested/overlaid component. Alternatively, use vaul's `Drawer.NestedRoot` if available. The simplest approach:
  1. Move the confirmation Drawer JSX (lines 3382-3482) inside the Cart DrawerContent (before the closing `</DrawerContent>` at line 3379).
  2. OR: Instead of a second Drawer, render the confirmation UI as a `position: fixed` overlay (`z-50` or higher) within the Cart Drawer, ensuring it sits above the cart content. This avoids the vaul stacking issue entirely.
  3. Recommended approach: Convert the Table Confirmation Sheet from a `<Drawer>` to a fixed-position div with `z-[60]` that renders inside the cart Drawer content area. This guarantees visibility regardless of vaul version.

### 2. [P1] Cart Drawer auto-verify in CartView.jsx fires inside wrong Drawer context
- **File:** CartView.jsx, lines 180-215
- **Description:** CartView.jsx has its own auto-verify effect (lines 180-215) that calls `verifyTableCode(code)` when `tableCodeInput` reaches `tableCodeLength` digits. This auto-verify happens inside the Cart Drawer context. If the Table Confirmation Sheet is not visible (Finding #1), the user has no way to enter a code — so this auto-verify is dead code in the current flow. However, it will work correctly once the confirmation sheet is visible (it reads `tableCodeInput` which is shared state). No fix needed for this — just confirmation that the auto-verify path is intact and will work after Finding #1 is fixed.
- **FIX:** No code change needed. Verify after Finding #1 fix that auto-verify still triggers.

### 3. [P2] Table Confirmation Sheet uses `t()` without fallback for 3 keys
- **File:** x.jsx, lines 3399-3407
- **Description:** Three i18n calls use `t()` without fallback: `t('cart.confirm_table.title')` (line 3399), `t('cart.confirm_table.subtitle')` (line 3402), `t('cart.confirm_table.benefit_loyalty')` / `t('cart.confirm_table.benefit_default')` (lines 3406-3407). If these keys are not defined in the translation file, the user will see raw keys like "cart.confirm_table.title" instead of "Подтвердите стол".
- **FIX:** Replace with `tr()` calls that have Russian fallbacks:
  - `tr('cart.confirm_table.title', 'Подтвердите стол')`
  - `tr('cart.confirm_table.subtitle', 'Чтобы отправить заказ официанту')`
  - `tr('cart.confirm_table.benefit_loyalty', 'Бонусы начисляются только при подтверждённом столе')`
  - `tr('cart.confirm_table.benefit_default', 'Подтвердите стол для отправки заказа')`

### 4. [P2] `console.error` left in production code
- **File:** x.jsx, line 1530
- **Description:** `console.error("Failed to save table", e);` in `saveTableSelection`. Debug log in production code.
- **FIX:** Remove or replace with silent catch `catch {}`.

### 5. [P2] Confirmation Sheet CTA button disabled state doesn't account for cooldown lock
- **File:** x.jsx, lines 3458
- **Description:** The CTA "Подтвердить и отправить" button's `disabled` prop checks `isVerifyingCode` and code length, but doesn't check `isCodeLocked` (the cooldown state from CartView). If the user has exceeded max code attempts and is in cooldown, the button in the confirmation sheet remains clickable (though verify will still fire and fail).
- **FIX:** This is minor because the cooldown logic is in CartView's auto-verify and the confirmation sheet also calls `verifyTableCode` directly. The `verifyTableCode` function from `useHallTable` hook should handle its own rate limiting. However, to provide better UX, add cooldown awareness to the confirmation sheet CTA. Since `isCodeLocked` state lives in CartView.jsx, this would require lifting it to x.jsx or passing it up.

### 6. [P3] Duplicate `tableCodeLength` computation
- **File:** CartView.jsx lines 103-107, x.jsx lines 1559-1562
- **Description:** `tableCodeLength` is computed identically in both files from `partner?.table_code_length`. CartView receives `partner` as a prop and computes it locally. x.jsx computes it for the confirmation sheet. This duplication could lead to divergence if one is updated and not the other.
- **FIX:** Pass `tableCodeLength` as a prop from x.jsx to CartView instead of recomputing. Low priority — current values are identical.

## Summary
Total: 6 findings (0 P0, 2 P1, 3 P2, 1 P3)

**Root cause of PM-071:** Finding #1 — Two sibling Drawer components from vaul cannot both be visible simultaneously. The Table Confirmation Sheet is correctly triggered by `handleSubmitOrder` but renders behind/under the Cart Drawer's overlay. Fix requires either nesting the confirmation UI inside the cart Drawer or converting it to a fixed-position overlay.

## Prompt Clarity
- Overall clarity: **5/5**
- Ambiguous Fix descriptions: None — the task description was exceptionally detailed with exact behavior, anti-patterns, file locations, and test cases
- Missing context: None
- Scope questions: None — scope lock was clear and specific
