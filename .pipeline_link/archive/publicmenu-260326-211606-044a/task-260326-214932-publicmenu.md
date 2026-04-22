---
task_id: task-260326-214932-publicmenu
status: running
started: 2026-03-26T21:49:32+05:00
type: chain-step
page: PublicMenu
work_dir: C:/Dev/menuapp-code-review
budget_usd: 6.00
fallback_model: sonnet
version: 5.14
launcher: python-popen
---

# Task: task-260326-214932-publicmenu

## Config
- Budget: $6.00
- Mode: task-watcher.py launches Claude Code directly via Popen
- Fallback model: sonnet

## Prompt
---
chain: publicmenu-260326-211606-044a
chain_step: 4
chain_total: 4
chain_step_name: merge
page: PublicMenu
budget: 6.00
runner: cc
type: chain-step
---
=== CHAIN STEP: Merge (4/4) ===
Chain: publicmenu-260326-211606-044a
Page: PublicMenu

You are the Merge step in a modular consensus pipeline.
Your job: apply the fix plan to the actual code.

INSTRUCTIONS:
1. Read the comparison: pipeline/chain-state/publicmenu-260326-211606-044a-comparison.md
2. Check if discussion report exists: pipeline/chain-state/publicmenu-260326-211606-044a-discussion.md
   - If it exists AND has an "Updated Fix Plan" section → use THAT for disputed items
   - If it says "No disputes" or doesn't exist → use Comparator's "Final Fix Plan" as-is
   - Items marked "Unresolved (for Arman)" → SKIP these, do NOT apply
3. Read the code file: pages/PublicMenu/*.jsx
4. Apply ALL fixes from the fix plan, in priority order (P0 first)
   - Agreed items from Comparator: always apply
   - Discussion-resolved items: apply the winning solution
   - Unresolved disputes: SKIP (note in merge report)
   - [MUST-FIX] items: CANNOT be skipped. If you cannot apply a MUST-FIX, explain WHY in detail in merge report — do NOT silently skip.
5. After applying fixes:
   a. Update BUGS.md in pages/PublicMenu/ with fixed items
   b. Update README.md in pages/PublicMenu/ if needed
6. Git commit and push:
   - git add <specific files only> (NEVER git add . or git add -A)
   - git commit -m "fix(PublicMenu): N bugs fixed via consensus chain publicmenu-260326-211606-044a"
   - git push
7. Write merge report to: pipeline/chain-state/publicmenu-260326-211606-044a-merge-report.md

FORMAT for merge report:
# Merge Report — PublicMenu
Chain: publicmenu-260326-211606-044a

## Applied Fixes
1. [P0] Fix title — Source: agreed/discussion-resolved — DONE
2. [P1] Fix title — Source: comparator — DONE
...

## Skipped — Unresolved Disputes (for Arman)
- Dispute: [title] — CC says X, Codex says Y — NEEDS DECISION

## Skipped — Could Not Apply
- Reason...

## Git
- Commit: <hash>
- Files changed: N

## Prompt Feedback
Collect Prompt Clarity sections from CC and Codex findings files (if present), then add your own observations:
- CC clarity score: [N/5]
- Codex clarity score: [N/5]
- Fixes where writers diverged due to unclear description: ...
- Fixes where description was perfect (both writers agreed immediately): ...
- Recommendation for improving task descriptions: ...

## Summary
- Applied: N fixes
- Skipped (unresolved): N disputes
- Skipped (other): N fixes
- MUST-FIX not applied: N (with reasons)
- Commit: <hash>

=== TASK CONTEXT ===
# Bug Fix: Guest Name + Cart Persistence + Price Formatting (#160)

Reference: `BUGS_MASTER.md` (PM-139, PM-146, PM-145).
Production page: https://menu-app-mvp-49a4f5b2.base44.app

**Context:** Three bugs in the guest session and pricing flow.
PM-139 and PM-146 likely share the same root cause: localStorage is not reliable on Android Chrome (data may not persist across browser kills). PM-145 is a floating-point display bug in price totals.

TARGET FILES (modify):
- `pages/PublicMenu/x.jsx`
- `pages/PublicMenu/CartView.jsx`

CONTEXT FILES (read-only):
- `BUGS_MASTER.md`

---

## Fix 1 — PM-139 (P1) [MUST-FIX]: Guest name not saved — old name shown on order confirmation

### Сейчас
User enters a new name (e.g. "Arman"), taps ✓. The header still shows the old name ("Timur111"). When order is submitted, confirmation screen shows old name "Timur111" instead of the newly entered name.

### Должно быть
After tapping ✓ on name input:
1. Header immediately updates to new name
2. Order confirmation screen shows new name
3. Name persists after browser restart (both localStorage AND DB if guest record exists)

### НЕ должно быть
- Old name "Timur111" appearing anywhere after the user saved a new name
- `setCurrentGuest` silently discarding the update when `currentGuest` is null/undefined

### Файл и локация
File: `pages/PublicMenu/x.jsx`
Search for `handleUpdateGuestName` (~line 3144).
Bug: `setCurrentGuest(prev => prev ? { ...prev, name: trimmedName } : prev)` — if `prev` is null, the name is NOT updated in state. Fix: `setCurrentGuest(prev => ({ ...(prev || {}), name: trimmedName }))`.
Also search for `guestNameInput` state init (~line 1356): `useState(() => { try { return localStorage.getItem('menuapp_guest_name') || ''; } catch (e) { return ''; } })` — this is the display fallback; make sure order submission also reads from localStorage if `currentGuest?.name` is empty.

### Уже пробовали
Chain f888 (S180): added localStorage persist + conditional DB update + local state sync. Issue persists after deploy — likely because `setCurrentGuest(prev => prev ? {...prev} : prev)` does NOT update when prev is null/falsy (no guest record created yet).

### Проверка
1. Open menu → open cart → tap pencil ✏️ on name → type new name → tap ✓
2. Header shows new name immediately
3. Submit order → confirmation screen shows new name
4. Kill browser → reopen → header still shows new name (localStorage fallback)

---

## Fix 2 — PM-146 (P2) [MUST-FIX]: Cart items lost after browser kill

### Сейчас
User adds dishes to cart → kills browser (swipes away) → reopens app → cart is empty.

### Должно быть
Cart items persist across browser restarts for up to 4 hours (existing TTL logic is correct).

### НЕ должно быть
Cart silently emptying on page reload.

### Файл и локация
File: `pages/PublicMenu/x.jsx`
Search for `saveCartToStorage` (~line 169) and `Restore cart from localStorage` (~line 1462).
Root cause to investigate: The restore effect at ~line 1462 calls `getCartFromStorage(partner.id)`. If `partner` is not yet loaded when the effect fires, `partner.id` is undefined → `getCartFromStorage(undefined)` returns null → cart restore fails silently.
Fix: ensure the restore effect only fires when `partner?.id` is available (add `partner?.id` to dependency array and guard with `if (!partner?.id) return`).
Also check: if `partner?.id` is already in deps, verify the effect re-fires after partner loads (check if `hasRestoredCart` ref prevents re-run).

### Уже пробовали
First fix attempt in S180 (f888 chain) — addressed localStorage persist for name but cart restore timing issue was not identified. Cart persistence code (lines ~169-201) appears correct — TTL logic is fine. Issue is likely the restore effect dependency.

### Проверка
1. Add 2 dishes to cart
2. Kill browser (swipe away completely)
3. Reopen app at same URL
4. Cart should still have the 2 dishes

---

## Fix 3 — PM-145 (P2) [MUST-FIX]: Floating-point price display (69.27000000000001 ₸)

### Сейчас
StickyCartBar shows raw floating-point numbers like `69.27000000000001 ₸`. This happens because the cart total is accumulated as a sum of per-item values without final rounding.

### Должно быть
Price formatting rule (apply everywhere):
- Whole number (e.g. 100, 2280) → show WITHOUT decimals: `100 ₸`
- Has cents (e.g. 55.86, 32.01) → show with EXACTLY 2 decimal places: `55.86 ₸`
- NEVER show more than 2 decimal places

### НЕ должно быть
- `69.27000000000001 ₸` or any number with >2 decimal places
- `100.00 ₸` when partner uses whole-number prices

### Файл и локация
File: `pages/PublicMenu/x.jsx`

**Fix A — cartTotalAmount computation (~line 2073):**
```
const cartTotalAmount = cart.reduce((acc, item) => acc + Math.round(item.price * item.quantity * 100) / 100, 0);
```
The accumulator itself accumulates floating-point errors. Fix: wrap final result: `parseFloat(result.toFixed(2))`.
Change to: `cart.reduce((acc, item) => acc + Math.round(item.price * item.quantity * 100) / 100, 0)` → apply `parseFloat((...).toFixed(2))` on the result.

**Fix B — formatPrice function (~line 987):**
Current: `const formatted = Number.isInteger(num) ? num.toLocaleString() : parseFloat(num.toFixed(2)).toString();`
Issue: `Number.isInteger(69.27000000000001)` = false → goes through toFixed(2) = "69.27" which is correct. BUT if `num` arrives as a string `"69.27000000000001"`, the Number() conversion may not be integer-detected.
Ensure: apply `Math.round(num * 100) / 100` before the integer check:
```js
const rounded = Math.round(num * 100) / 100;
const formatted = Number.isInteger(rounded) ? rounded.toLocaleString('ru-KZ') : rounded.toFixed(2);
```

**Fix C — line_total computations (~lines 717, 2674, 3052):**
Search for `Math.round(item.price * item.quantity * 100) / 100` — these per-item computations are fine, but verify they're consistent with the formatPrice rule above.

### Проверка
1. Add items with decimal prices (e.g. 55.86 ₸) → StickyCartBar shows "55.86 ₸" (not "55.86000000001 ₸")
2. Add items with whole prices (e.g. 100 ₸) → StickyCartBar shows "100 ₸" (not "100.00 ₸")
3. Mixed cart → total shows correct format matching the rule

---

## ⛔ SCOPE LOCK — менять ТОЛЬКО то, что указано выше
- Modify ONLY the code described in Fix 1, Fix 2, Fix 3.
- Do NOT change: cart UI layout, CartView structure, order flow, drawer behavior, menu display.
- Do NOT change: help drawer (PM-133/134/135 ✅ FROZEN), Android back button logic (PM-126 ✅ FROZEN), bell visibility (PM-127/129 ✅ FROZEN), table code drawer (PM-128 ✅ FROZEN).
- Do NOT change: CartView header layout (PM-104 ✅ FROZEN), star ratings (PM-141 ✅ FROZEN), "Вернуться в меню" button (PM-140 ✅ FROZEN).
- If you see an unrelated issue — SKIP IT, do not fix.

## FROZEN UX (DO NOT CHANGE)
These elements are tested and approved — do not modify:
- PM-104 ✅: chevron (˅) in right part of table card in CartView, NOT sticky
- PM-125 ✅: help drawer one-tap cards (🙋🧾🗒️📄 + «Другое»)
- PM-126 ✅: Android Back closes detail card drawer, not browser (pushState/popstate)
- PM-127 ✅: bell (🔔) visible in menu for hall+verified mode
- PM-128 ✅: table code drawer opens via pushOverlay
- PM-129 ✅: bell only in hall+verified session
- PM-130 ✅: help drawer has ChevronDown close button
- PM-133 ✅: help drawer redirect to tableCode sheet
- PM-134 ✅: help drawer autoFocus + sticky submit
- PM-135 ✅: helpQuickSent reset on closeHelpDrawer
- PM-140 ✅: "Вернуться в меню" + "Мои заказы" buttons after order in CartView
- PM-141 ✅: star rating touch targets ≥ 44px in CartView

## FROZEN UX grep verification
Before commit, verify these have NOT changed:
```
grep -n "pushOverlay\|popOverlay" pages/PublicMenu/x.jsx | head -10
grep -n "helpQuickSent\|closeHelpDrawer" pages/PublicMenu/x.jsx | head -5
grep -n "ChevronDown" pages/PublicMenu/CartView.jsx | head -5
```

## Regression Check (MANDATORY after implementation)
- [ ] Guest name ✓ button still works (saves and closes input)
- [ ] Cart add/remove stepper works normally
- [ ] Order submit flow works: add items → "Отправить официанту" → confirmation screen
- [ ] Help drawer still opens with one-tap cards (not broken by state changes)
- [ ] Android Back on detail card still closes drawer (not browser)
- [ ] All price displays in CartView show correct format

## MOBILE-FIRST CHECK (MANDATORY before commit)
This is a mobile-first restaurant app. Primary usage: customer phone at the table.
Before committing, verify ALL changes at 375px viewport width:
- [ ] Touch targets ≥ 44×44px (h-11 w-11)
- [ ] Name input and ✓ button easily tappable
- [ ] No excessive whitespace on small screens
- [ ] Cart drawer content scrollable without losing submit button
- [ ] Price numbers don't overflow card bounds

## Implementation Notes
- TARGET FILES: `pages/PublicMenu/x.jsx`, `pages/PublicMenu/CartView.jsx`
- Do NOT use `git add .` — only: `git add pages/PublicMenu/x.jsx pages/PublicMenu/CartView.jsx`
- git commit -m "fix: guest name state, cart restore timing, floating-point prices S181"
- git push
=== END ===


## Status
Running...
