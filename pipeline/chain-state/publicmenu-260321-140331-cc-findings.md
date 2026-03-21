# CC Writer Findings — PublicMenu
Chain: publicmenu-260321-140331

## Findings

### PM-062: CategoryChips active color still indigo

1. **[P3] CategoryChips `activeColor` prop passed but may be ignored by imported component** (x.jsx:3182) — The `activeColor="#B5543A"` prop is correctly passed to `<CategoryChips>` at line 3182, but `CategoryChips` is an imported component from `@/components/publicMenu/refactor/CategoryChips` (line 105). If that component hardcodes indigo internally (e.g., `bg-indigo-600`), the prop has no effect. **This is a Base44 refactored component — cannot be fixed in page code alone.** FIX: Verify whether `CategoryChips` component honors the `activeColor` prop. If it ignores it and hardcodes indigo, this requires a B44 prompt to fix the component. The page-side code is already correct.

2. **[P3] ModeTabs.jsx — no indigo remnants (CONFIRMED CLEAN)** (ModeTabs.jsx:38) — ModeTabs uses inline `style={{backgroundColor:'#B5543A'}}` for active tabs. No indigo remains. No fix needed.

3. **[P3] MenuView.jsx — no indigo remnants (CONFIRMED CLEAN)** — Zero grep matches for "indigo" in current MenuView.jsx. No fix needed.

4. **[P3] CheckoutView.jsx — no indigo remnants (CONFIRMED CLEAN)** — Zero grep matches for "indigo" in current CheckoutView.jsx. No fix needed.

5. **[P3] x.jsx — no indigo remnants (CONFIRMED CLEAN)** — Zero grep matches for "indigo" in current x.jsx. No fix needed.

6. **[P3] CartView.jsx — no indigo remnants (CONFIRMED CLEAN)** — Zero grep matches for "indigo" in current CartView.jsx. Submit button uses `style={{backgroundColor:'#B5543A'}}`. No fix needed.

### PM-064: Table Confirmation Bottom Sheet flow issues

7. **[P1] Inline table code input in CartView.jsx is always rendered — violates just-in-time spec** (CartView.jsx:1035-1239) — The entire "Online order to waiter" section with table code input slots, verification UI, info modal, and guest code display is rendered inline inside the cart drawer BEFORE the guest taps submit. This violates the spec which says: "Just-in-time ONLY — do NOT ask for table code on menu open or drawer open — only on submit tap." The inline table code block INSIDE the drawer (shown before submit) must be REMOVED per PM-064 spec. FIX: Remove the entire block from CartView.jsx lines 1035-1239 (the `{/* Online order to waiter (verification + benefits) */}` section including the info modal). Table code input should only appear in the Bottom Sheet in x.jsx after submit tap.

8. **[P1] Bottom Sheet code slots hardcode length=4 instead of using dynamic tableCodeLength** (x.jsx:3408-3409, 3424, 3426, 3428) — The table confirmation Bottom Sheet renders exactly 4 code slots (`Array.from({ length: 4 })`) and uses `maxLength={4}` and `.slice(0, 4)`. But CartView.jsx computes `tableCodeLength` dynamically from `partner?.table_code_length` (3-8 range, default 4). If a partner configures a different code length, the Bottom Sheet will break. FIX: Pass `tableCodeLength` (computed from `partner?.table_code_length`) to the Bottom Sheet scope in x.jsx, or compute it there. Replace all hardcoded `4` with the dynamic value.

9. **[P2] Bottom Sheet missing cooldown/lockout/attempts logic** (x.jsx:3401-3454) — CartView.jsx has full table code UX: cooldown timer, attempt counter, locked state, code verification error with attempts display. The Bottom Sheet in x.jsx only shows basic error text and a spinner — no lockout, no attempt counter, no cooldown timer. A user who enters wrong codes repeatedly in the Bottom Sheet will see no feedback about remaining attempts or lockout. FIX: Either move the cooldown/lockout logic from CartView into the Bottom Sheet, or extract it into a shared hook/component.

10. **[P2] Bottom Sheet "Change" button only clears input — no "Not my table?" functionality** (x.jsx:3445-3453) — The spec says secondary link should be "Не тот стол? Изменить" but the current button only calls `setTableCodeInput('')` — it doesn't navigate to table selection or provide a way to change the table. FIX: Implement "Not my table?" action that either clears the current table binding or provides table selection UI.

11. **[P2] Bottom Sheet missing auto-verify on full code entry** (x.jsx:3421-3434) — CartView.jsx has auto-verify logic in a `useEffect` that triggers `verifyTableCode` when the input reaches `tableCodeLength`. The Bottom Sheet has no such auto-verify — the user can enter all digits but nothing happens automatically. There's no explicit "Confirm and Send" button either (spec says "Подтвердить и отправить" should be the primary CTA). FIX: Add auto-verify effect or add a "Подтвердить и отправить" CTA button to the Bottom Sheet.

12. **[P1] Bottom Sheet missing primary CTA "Подтвердить и отправить"** (x.jsx:3401-3454) — The spec explicitly says the Bottom Sheet must have a primary CTA button "Подтвердить и отправить" (terracotta). Currently there is no such button — only code input slots and a "Change" link. After entering the code, there's no way for the user to explicitly confirm and send the order. FIX: Add a primary CTA button with terracotta background, text from `t('cart.confirm_table.submit')` with fallback "Подтвердить и отправить". On click: verify table code, then auto-submit order.

13. **[P2] Bottom Sheet does not show locked/cooldown state from CartView** (x.jsx:3401-3454) — If the user was previously locked out from too many attempts in CartView, the Bottom Sheet doesn't check that state. The `isCodeLocked`, `codeSecondsLeft`, `codeAttempts` variables are local to CartView.jsx and not passed up. FIX: Either lift the cooldown state to x.jsx or pass it as props.

### Other issues found during analysis

14. **[P2] CartView.jsx table code verification state is duplicated** — CartView.jsx maintains its own `codeAttempts`, `codeLockedUntil`, `nowTs` state (lines 89-91) independently. The same `tableCodeInput`/`setTableCodeInput` are shared via props, but the lockout/cooldown state is local. If both CartView inline input AND x.jsx Bottom Sheet exist simultaneously, they'd have independent lockout counters. FIX: If inline input is removed (per finding #7), this becomes moot. Otherwise, lift state.

15. **[P2] Bottom Sheet Drawer uses x.jsx's `isVerifyingCode` and `codeVerificationError` but these come from useTableSession hook** (x.jsx:1512,1516) — These are already in x.jsx scope from the hook destructuring, so they work. But the Bottom Sheet lacks the auto-verify trigger that would SET `isVerifyingCode` — verifyTableCode is never called from the Bottom Sheet. FIX: Add auto-verify effect in x.jsx Bottom Sheet scope, or add the CTA button that calls verifyTableCode.

16. **[P1] handleSubmitOrder intercepts only when `!currentTableId` but Bottom Sheet shows even if table code was partially entered** (x.jsx:2622-2627) — The intercept condition is `orderMode === "hall" && !currentTableId`. This is correct — it shows Bottom Sheet when table not verified. But after the Bottom Sheet opens, if the user closes it without entering a code, `pendingSubmitRef` is reset and the order is silently dropped. No error/toast informs the user. FIX: Consider showing a toast when user closes the Bottom Sheet without completing verification: "Для отправки заказа нужно подтвердить стол".

## Summary
Total: 16 findings (0 P0, 4 P1, 8 P2, 4 P3)

### Key conclusions:
- **PM-062 (chips indigo):** Page-side code is correct — `activeColor="#B5543A"` is passed. All page files are clean of indigo. The issue is in the imported `CategoryChips` component (`@/components/publicMenu/refactor/CategoryChips`) which likely ignores the prop. **Needs B44 prompt** to fix the component itself.
- **PM-064 (table confirmation):** The Bottom Sheet exists but is incomplete — missing primary CTA button, auto-verify, cooldown logic, dynamic code length. The inline table code input in CartView.jsx must be removed per spec.
