# CC Writer Findings — PublicMenu
Chain: publicmenu-260322-185123

## Findings

1. [P2] PM-079: Remove "0000" placeholder from code input cells (line 3444) — The hidden `<Input>` at line 3433-3446 uses `placeholder={'0'.repeat(tableCodeLength)}` which shows "0000" in the input field. This looks like a pre-filled code value and confuses users. FIX: Change line 3444 from `placeholder={'0'.repeat(tableCodeLength)}` to `placeholder=""` (empty string). The visual cells (lines 3423-3430) already show `_` as placeholder via `{ch || <span className="text-slate-300">_</span>}`, so the hidden input placeholder just needs to be empty.

2. [P2] PM-080: Shorten confirmation button text (line 3471) — The submit button shows "Подтвердить и отправить" which is too long for mobile screens. FIX: Change line 3471 from `tr('cart.confirm_table.submit', 'Подтвердить и отправить')` to `tr('cart.confirm_table.submit', 'Отправить')`. The i18n key stays the same, only the fallback text changes.

3. [P2] PM-081: Remove "Wrong table? Change" link (lines 3473-3482) — The "Не тот стол? Изменить" button below the code input is unnecessary and confusing. Users should not change tables from the BS. FIX: Remove the entire `<button>` block from line 3473 (`{/* Secondary: change table (PM-064 C4) */}`) through line 3482 (closing `</button>`). That's 10 lines to remove.

4. [P3] PM-082: Add bonus motivation text on BS (above line 3458) — The CartView shows "+N бонусов за этот заказ" motivation text but the BS does not. FIX: Add a conditional block above the submit `<Button>` (before line 3458). The calculation mirrors CartView line 954: `const motivationPoints = Math.round((Number(cartTotalAmount) || 0) * (Number(partner?.loyalty_points_per_currency) || 1))`. Show the text only when `loyaltyEnabled && motivationPoints > 0`. Note: `trFormat` is NOT available in x.jsx, so use `tr()` with a template literal fallback. The variables `loyaltyEnabled`, `cartTotalAmount`, and `partner` are all in scope at this location. Insert:
```jsx
{(() => {
  if (!loyaltyEnabled) return null;
  const motivationPoints = Math.round((Number(cartTotalAmount) || 0) * (Number(partner?.loyalty_points_per_currency) || 1));
  if (motivationPoints <= 0) return null;
  return (
    <p className="text-center text-sm text-emerald-600 mt-4">
      {tr('cart.motivation_bonus_short', `+${motivationPoints} бонусов за этот заказ`)}
    </p>
  );
})()}
```

5. [P1] PM-088: Code input cells don't accept input on mobile (lines 3419-3446) — The visual code cells (lines 3423-3430) are plain `<div>` elements with no click/tap handlers. The actual input is a separate `<Input>` at line 3433 which relies on `autoFocus`. On mobile browsers (especially Android Chrome), `autoFocus` on a drawer/sheet content is unreliable — the keyboard doesn't appear, and tapping the visual cells does nothing because they are non-interactive divs. FIX: Two changes needed:
   (a) Add `onClick` handler to each visual cell div (line 3423) that focuses the hidden input. Give the Input a ref: add `const codeInputRef = React.useRef(null)` (or use existing ref), set `ref={codeInputRef}` on the Input, and add `onClick={() => codeInputRef.current?.focus()}` to each cell div. Also add `cursor-pointer` to the div className.
   (b) On the `<Input>` (line 3433): add `ref={codeInputRef}`, keep `inputMode="numeric"`, add `pattern="[0-9]*"` for iOS keyboard, remove `autoFocus` (unreliable on mobile) and instead use an effect or the drawer's `onOpenChange` to focus programmatically after mount. Alternatively, keep `autoFocus` but ALSO add the click-to-focus on cells as the primary mobile mechanism.

6. [P2] PM-090: Pass primaryColor to StickyCartBar (lines 3553, 3580) — Both `<StickyCartBar>` instances are missing the `primaryColor` prop. The `primaryColor` variable is already defined in scope (`const primaryColor = partner?.primary_color || '#1A1A1A'`). FIX: Add `primaryColor={primaryColor}` prop to both StickyCartBar instances:
   - Line 3553: add `primaryColor={primaryColor}` to the hall-mode StickyCartBar
   - Line 3580: add `primaryColor={primaryColor}` to the pickup/delivery StickyCartBar

## Summary
Total: 6 findings (0 P0, 1 P1, 4 P2, 1 P3)

## Prompt Clarity (MANDATORY)
- Overall clarity: 5
- Ambiguous Fix descriptions: None — all 6 fixes had clear Now/Expected/Location sections with line numbers that matched the actual code.
- Missing context: Fix 4 (bonus text) — would have been helpful to state explicitly that `trFormat` is NOT available in x.jsx so the writer knows to use `tr()` with template literal. Minor: Fix 5 could mention whether a `useRef` import already exists.
- Scope questions: Fix 5 — unclear if a full `useRef`+`useEffect` solution is in scope or if simpler click-to-focus is sufficient. Chose pragmatic approach (click-to-focus on cells + keep autoFocus).
