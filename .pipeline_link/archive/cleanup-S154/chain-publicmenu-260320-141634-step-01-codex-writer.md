---
chain: publicmenu-260320-141634
chain_step: 1
chain_total: 4
chain_step_name: codex-writer
chain_group: writers
chain_group_size: 2
page: PublicMenu
budget: 5.00
runner: codex
type: chain-step
---
Review the file pages/PublicMenu/base/*.jsx for bugs in a React restaurant QR-menu app on Base44 platform.
Also check pages/PublicMenu/README.md and pages/PublicMenu/BUGS.md for context (ONLY these 3 files, nothing else).

SPEED RULES — this is a time-sensitive pipeline step:
- Read ONLY the 3 files above. Do NOT search the repo, do NOT read old findings, do NOT read files outside pages/PublicMenu/.
- Do NOT run rg/grep across the whole repo. Do NOT cross-reference with other pages.
- Limit analysis to the target page code. Be concise.

Find ALL bugs. Focus on: logic errors, missing error handling, i18n issues, UI/UX for mobile-first, React anti-patterns.

For each finding: [P0/P1/P2/P3] Title - Description. FIX: code change needed.

Write findings to: pipeline/chain-state/publicmenu-260320-141634-codex-findings.md

FORMAT:
# Codex Writer Findings — PublicMenu
Chain: publicmenu-260320-141634

## Findings
1. [P0] Title — Description. FIX: ...
2. [P1] Title — Description. FIX: ...

## Summary
Total: N findings (X P0, Y P1, Z P2, W P3)

Do NOT apply fixes — only document findings.

=== TASK CONTEXT ===
Fix 10 bugs found by Codex review (chain publicmenu-260320-132541). All have exact locations and fix plans.

## Files
- pages/PublicMenu/base/CartView.jsx
- pages/PublicMenu/base/x.jsx

## Bugs to fix (in priority order)

### 1. [P0] Loyalty points deducted before order creation
- File: x.jsx:2444-2457, x.jsx:2818-2831
- Symptom: Redeem transaction and balance update run BEFORE `Order.create()` at x.jsx:2487/2854. If order creation fails, the catch only sets submitError — points are lost without an order.
- Fix: Move `Order.create()` BEFORE the redeem transaction and balance update. Or add compensating rollback in the catch path that reverses the transaction.

### 2. [P1] localStorage crash in private/restricted browsers
- File: x.jsx:283-287, x.jsx:2258-2260
- Symptom: `localStorage` read without try/catch. In private mode or blocked-storage environments, crashes the page before cart opens.
- Fix: Wrap all localStorage access in try/catch, return false on failure.

### 3. [P2] Reward-email accepts invalid emails and shows false success
- File: CartView.jsx:524-535
- Symptom: Any non-empty string accepted, setCustomerEmail called immediately, success toast shown without validating format or awaiting persistence.
- Fix: Validate email format before saving. Await the real save/lookup result. Show error toast on failure.

### 4. [P2] Submit-error subtitle says "order saved" when it wasn't
- File: CartView.jsx:1227-1228, x.jsx:403
- Symptom: `error.send.subtitle` always says "Your order is saved. Try again." even when Order.create() failed completely.
- Fix: Change copy to neutral retry text, or only show "saved" variant when there is explicit persistence confirmation.

### 5. [P2] Locale and currency hardcoded to ru-RU / Tenge
- File: CartView.jsx:409, CartView.jsx:929-970, CartView.jsx:1000, CartView.jsx:1044, x.jsx:973, x.jsx:1206
- Symptom: Hardcoded `ru-RU` formatting, Tenge-only symbol, raw `B` points suffix. Non-Russian partners get wrong separators, time format, currency.
- Fix: Reuse page locale and formatPrice utility. Move point/unit labels through i18n keys.

### 6. [P2] Zero redeem-rate treated as 1 (|| vs ??)
- File: CartView.jsx:932
- Symptom: `(partner?.loyalty_redeem_rate || 1)` — explicit rate of 0 treated as 1. Guests see redeemable value that doesn't exist.
- Fix: Replace `|| 1` with `?? 1`.

### 7. [P2] Redirect-banner timer leak on unmount
- File: x.jsx:1866-1871
- Symptom: setTimeout with no cleanup. If page unmounts or effect reruns, stale timer calls state updates.
- Fix: Store timer id in ref, clear in effect cleanup.

### 8. [P2] Table-code UI overflows narrow phones for long codes
- File: CartView.jsx:103-106, CartView.jsx:1085-1092
- Symptom: Up to 8 digits with fixed `w-9` boxes + `gap-2`. Eight boxes exceed 320px viewport.
- Fix: Make box width and gap responsive, or switch to single-input/wrapped layout for longer codes.

### 9. [P2] Production debug logging exposes guest data
- File: x.jsx:2269-2306, x.jsx:2591, x.jsx:2919
- Symptom: console.log dumps guest ids, names, orders behind query param; created order ids always logged.
- Fix: Remove the logs or gate behind build-time dev flag.

### 10. [P3] Icon-only controls missing aria-label and < 44px touch
- File: CartView.jsx:431-437, CartView.jsx:459-460, CartView.jsx:1018-1024
- Symptom: Icon-only buttons with `title` or no label, hit areas below 44x44px.
- Fix: Add aria-labels, enforce min 44px touch targets for bell, save, cancel, info buttons.

## Instructions
- Fix ALL 10 bugs with targeted changes
- Priority order: P0 first, then P1, then P2, then P3
- Do NOT refactor unrelated code
- For bug #5 (locale/currency): if formatPrice utility doesn't exist, create a minimal helper, don't restructure all i18n
- After fixing, update BUGS.md in pages/PublicMenu/ marking all as Fixed
- Git commit: "fix(PublicMenu): 10 bugs — loyalty order, localStorage, email validation, locale, a11y"
- Git push
=== END ===
