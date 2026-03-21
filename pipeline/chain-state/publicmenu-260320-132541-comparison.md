# Comparison Report — PublicMenu
Chain: publicmenu-260320-132541

## Overview
- **CC Writer:** 5 findings (0 P0, 0 P1, 3 P2, 2 P3)
- **Codex Writer:** 11 findings (1 P0, 2 P1, 7 P2, 1 P3)
- **Task scope:** 4 specific bugs (PM-S140-01, PM-S87-03, AC-09, PM-S140-03)

---

## Agreed (both found)

### 1. PM-S140-01: customerEmail.trim() crashes if null/undefined
- **CC:** P2, lines 912 & 976 in CartView.jsx. Fix: `(customerEmail || '').trim()`
- **Codex:** P1, same lines. Fix: normalize once with `const normalizedCustomerEmail = (customerEmail ?? '').trim()` and pass `customerEmail ?? ''` to input.
- **Verdict:** AGREED on bug and locations. CC's inline fix is simpler and more targeted (Rule F4). Codex's normalize-once approach is cleaner but adds a new variable. **Use CC's inline approach** — minimal change, 2 lines touched.

### 2. PM-S140-03: setTimeout not cleared on unmount (partial overlap)
- **CC:** P3, CartView.jsx:528 — reward-email onClick setTimeout. Fix: useRef + cleanup useEffect.
- **Codex:** P2, x.jsx:1866-1871 — redirect-banner setTimeout. Fix: store timer id, clear in cleanup.
- **Verdict:** These are **different timers in different files** but same pattern. CC found the one in the task spec (PM-S140-03). Codex found an additional timer leak (redirect-banner). **Both valid.** Task scope includes only PM-S140-03 (CartView.jsx:528). Codex's redirect-banner timer is out of scope but noted.

---

## CC Only (Codex missed)

### 3. PM-S87-03: Submit button appears green when disabled
- **CC:** P2, CartView.jsx:1232-1247. `isTableVerified === false` doesn't catch `undefined`. Fix: change to `!isTableVerified`.
- **Codex:** Not mentioned.
- **Verdict:** VALID. This is a real UX bug — the strict equality check misses the initial `undefined` state. The fix is a 2-character change in 2 locations. **ACCEPT — in task scope.**

### 4. AC-09: No visual feedback when dish added to cart
- **CC:** Already fixed. Toast exists at x.jsx:2237-2238.
- **Codex:** Not mentioned.
- **Verdict:** VALID finding — CC correctly identified this was already resolved in a prior session. **No action needed.**

### 5. CC-NEW-01: rewardEmail.trim() defensive guard
- **CC:** P3, CartView.jsx:520-522. Optional defensive fix for consistency.
- **Codex:** Not found as separate item (Codex #4 touches reward-email form but focuses on validation, not null safety).
- **Verdict:** LOW PRIORITY, optional. Out of task scope. **Note for future.**

---

## Codex Only (CC missed)

### 6. [P0] Loyalty points deducted before order creation (Codex #1)
- x.jsx:2444-2457, x.jsx:2818-2831 — redeem transaction runs before Order.create().
- **Verdict:** VALID and serious — points lost if order creation fails. However, **OUT OF TASK SCOPE** (not one of the 4 assigned bugs). Should be logged as new bug for future fix. Rule F4 — fix only what is asked.

### 7. [P1] localStorage crash in restricted browsers (Codex #3)
- x.jsx:283-287 — no try/catch around localStorage.
- **Verdict:** VALID edge case. **OUT OF SCOPE.** Note for future.

### 8. [P2] Reward-email accepts invalid emails (Codex #4)
- CartView.jsx:524-535 — no email format validation.
- **Verdict:** VALID but **OUT OF SCOPE.** Enhancement, not a crash bug.

### 9. [P2] Submit-error subtitle misleading (Codex #5)
- CartView.jsx:1227-1228 — says "order saved" even when it failed.
- **Verdict:** VALID UX issue. **OUT OF SCOPE.**

### 10. [P2] Locale/currency hardcoded (Codex #6)
- Multiple locations hardcode ru-RU and Tenge.
- **Verdict:** VALID i18n issue. **OUT OF SCOPE.** Large change, multiple files.

### 11. [P2] Zero redeem-rate || vs ?? (Codex #7)
- CartView.jsx:932 — `|| 1` treats 0 as falsy.
- **Verdict:** VALID logic bug. **OUT OF SCOPE.** Quick fix but not assigned.

### 12. [P2] Redirect-banner timer leak (Codex #8)
- x.jsx:1866-1871 — same pattern as PM-S140-03 but different location.
- **Verdict:** VALID. **OUT OF SCOPE** but same pattern as in-scope PM-S140-03.

### 13. [P2] Table-code UI overflow (Codex #9)
- CartView.jsx:103-106, 1085-1092 — 8-digit code overflows 320px.
- **Verdict:** VALID responsive issue. **OUT OF SCOPE.**

### 14. [P2] Debug logging in production (Codex #10)
- x.jsx:2269-2306, 2591, 2919 — console.log with guest data.
- **Verdict:** VALID (violates rule P2-10: no debug logs). **OUT OF SCOPE.**

### 15. [P3] Icon-only controls not accessible (Codex #11)
- CartView.jsx:431-437, 459-460, 1018-1024 — no aria-labels, small touch targets.
- **Verdict:** VALID a11y issue. **OUT OF SCOPE.**

---

## Disputes (disagree)

### Priority of PM-S140-01
- CC rates P2, Codex rates P1.
- **Resolution:** The crash only happens if `customerEmail` is null, which depends on upstream data. It's a real crash but in a specific path. **Keep as P2** per original task spec — the component mostly works, it's a guard issue not a core logic failure.

### AC-09 status
- CC says already fixed. Codex didn't mention it at all.
- **Resolution:** CC verified the toast exists in code. **Confirmed already fixed.** No action.

---

## Final Fix Plan

Ordered list of fixes to apply (task scope only):

1. **[P2] PM-S140-01** — Source: AGREED (CC+Codex) — Replace `customerEmail.trim()` with `(customerEmail || '').trim()` at CartView.jsx lines 912 and 976.

2. **[P2] PM-S87-03** — Source: CC only — Change `isTableVerified === false` to `!isTableVerified` in disabled prop (line 1247) and className ternary (line 1237) in CartView.jsx.

3. **[P2] AC-09** — Source: CC — **NO ACTION** — already fixed in prior session (toast at x.jsx:2237-2238).

4. **[P3] PM-S140-03** — Source: AGREED (CC+Codex, same pattern) — Add `rewardTimerRef` via useRef, store setTimeout ID, add cleanup useEffect in CartView.jsx near line 528.

### Out-of-scope findings to log (for future):
| ID | Priority | Description | Source |
|---|---|---|---|
| PM-NEW-01 | P0 | Loyalty points deducted before order creation | Codex |
| PM-NEW-02 | P1 | localStorage crash in private/restricted browsers | Codex |
| PM-NEW-03 | P2 | Reward-email no format validation | Codex |
| PM-NEW-04 | P2 | Submit-error subtitle misleading | Codex |
| PM-NEW-05 | P2 | Locale/currency hardcoded to ru-RU/Tenge | Codex |
| PM-NEW-06 | P2 | Zero redeem-rate `|| 1` should be `?? 1` | Codex |
| PM-NEW-07 | P2 | Redirect-banner timer leak (x.jsx:1866) | Codex |
| PM-NEW-08 | P2 | Table-code UI overflow on 320px | Codex |
| PM-NEW-09 | P2 | Debug console.log exposes guest data | Codex |
| PM-NEW-10 | P3 | Icon-only controls missing aria-labels | Codex |
| PM-NEW-11 | P3 | rewardEmail.trim() defensive guard | CC |

---

## Summary
- **Agreed:** 2 items (PM-S140-01, PM-S140-03 pattern)
- **CC only:** 3 items (PM-S87-03 accepted, AC-09 already fixed, CC-NEW-01 noted)
- **Codex only:** 10 items (0 accepted for this task, all out of scope but valid — logged for future)
- **Disputes:** 1 minor (priority rating of PM-S140-01 — resolved as P2)
- **Total fixes to apply:** 3 (PM-S140-01, PM-S87-03, PM-S140-03) + 0 for AC-09 (already done)
