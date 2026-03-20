# CC Writer Findings — PublicMenu
Chain: publicmenu-260320-141634

## Findings (all from Codex chain publicmenu-260320-132541, verified and fixed)

1. [P0] BUG-PM-040: Loyalty points deducted before order creation — Moved `LoyaltyTransaction.create` + `LoyaltyAccount.update` to AFTER `Order.create()` in both hall and pickup/delivery submit flows (x.jsx). FIX: Reordered code blocks so order is created first, then points deducted.

2. [P1] BUG-PM-042: localStorage crash in private/restricted browsers — `isBillOnCooldown()` and `setBillCooldownStorage()` call localStorage without try/catch. FIX: Wrapped both functions in try/catch, return false / ignore on error.

3. [P2] BUG-PM-037: Reward-email accepts invalid emails — No format validation before calling setCustomerEmail and showing success toast. FIX: Added regex email validation before save, shows error toast on invalid format.

4. [P2] BUG-PM-038: Submit-error subtitle says "order saved" when it wasn't — i18n key `error.send.subtitle` text misleads user. FIX: Changed to neutral retry text "Попробуйте отправить ещё раз".

5. [P2] BUG-PM-036 + BUG-PM-043: Hardcoded ru-RU locale and currency — `toLocaleString('ru-RU')` and hardcoded `₸` symbol in CartView and x.jsx. FIX: Removed hardcoded locale (use browser default), replaced `₸` with `formatPrice()`, added i18n key for points suffix `Б`.

6. [P2] BUG-PM-044: loyalty_redeem_rate `|| 1` treats 0 as falsy — FIX: Changed to `?? 1` (nullish coalescing). Fixed in the same edit as BUG-PM-036.

7. [P2] BUG-PM-046: Redirect-banner setTimeout leak — No cleanup on unmount. FIX: Added `return () => clearTimeout(timerId)` in the useEffect.

8. [P2] BUG-PM-039: Table-code UI overflows narrow phones — Fixed `w-9` boxes + `gap-2` to `w-8 sm:w-9` + `gap-1 sm:gap-2` + `flex-wrap justify-center`.

9. [P2] BUG-PM-045: Production debug logging — Removed `console.log("Order created")` from both submit paths. Replaced 40-line debug useEffect with no-op hook (preserving hook order).

10. [P3] BUG-PM-047: Icon-only controls missing aria-label — Added `aria-label` and `min-w-[44px] min-h-[44px]` to bell button, guest name save/cancel buttons, and info button.

## Summary
Total: 10 findings (1 P0, 1 P1, 7 P2, 1 P3) — all fixed
