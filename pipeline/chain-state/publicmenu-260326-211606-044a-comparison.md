# Comparison Report — PublicMenu
Chain: publicmenu-260326-211606-044a

## Agreed (both found)

### 1. [P1] `setCurrentGuest` null guard discards name update (CC #1 = Codex #1)
Both independently found the same root cause: `setCurrentGuest(prev => prev ? {...prev, name} : prev)` is a no-op when `prev` is null.
Both propose identical fix: `setCurrentGuest(prev => ({ ...(prev || {}), name: trimmedName }))`.
**Confidence: HIGH. Apply.**

### 2. [P1] Guest name fallback not propagated to header/confirmation (CC #2+#3 ≈ Codex #2)
CC found: `setGuestNameInput('')` clears the display fallback prematurely — fix by keeping `setGuestNameInput(trimmedName)`.
Codex found: broader issue — CartView and confirmation derive from `currentGuest?.name` only, ignoring persisted `menuapp_guest_name` from localStorage. Suggests deriving an effective guest name from localStorage when `currentGuest?.name` is empty.
**Both agree the name display chain is broken; Codex's scope is wider.** The CC fix (keep guestNameInput = trimmedName) is the minimal targeted fix. Codex's suggestion to add localStorage fallback in CartView/confirmation is a more robust approach but touches more code.
**Decision:** Apply CC's minimal fix (setGuestNameInput(trimmedName)) since fixing #1 ensures currentGuest.name is always set in state. If currentGuest.name is populated correctly (via fix #1), the downstream reads in CartView and confirmation will work. Codex's broader fallback pattern is valuable but risks scope creep — note as P3 improvement.
**Confidence: HIGH. Apply CC's targeted fix.**

### 3. [P2] `cartTotalAmount` floating-point accumulation (CC #6 = Codex #4)
Both found the same issue: `cart.reduce(...)` accumulates float errors in the accumulator.
Both propose identical fix: `parseFloat(cart.reduce(...).toFixed(2))`.
**Confidence: HIGH. Apply.**

### 4. [P2] `formatPrice` needs pre-rounding (CC #7 ≈ Codex #3)
CC found: apply `Math.round(num * 100) / 100` before the `Number.isInteger` check for robustness.
Codex found a MORE SPECIFIC issue: `parseFloat(num.toFixed(2)).toString()` strips trailing zeros — `55.80` renders as `55.8`, violating the "exactly 2 decimal places when cents exist" rule.
**Both agree formatPrice needs fixing; Codex identified the trailing-zero issue that CC missed.**
Combined fix:
```js
const rounded = Math.round(num * 100) / 100;
const formatted = Number.isInteger(rounded) ? rounded.toLocaleString('ru-KZ') : rounded.toFixed(2);
```
This uses `toFixed(2)` (returns string "55.80") instead of `parseFloat(...).toString()` (returns "55.8"), fixing both issues.
**Confidence: HIGH. Apply combined fix.**

## CC Only (Codex missed)

### 5. [P2] Order confirmation stale name for hall orders (CC #3)
CC noted that `guestLabel` in hall submission (line ~2771) reads from `guestToUse` which may have stale name.
**Validity:** This is a downstream consequence of fix #1. Once `setCurrentGuest` properly sets the name (fix #1), `guestToUse` will have the correct name. No additional code change needed.
**Decision: ACCEPTED as analysis, no separate fix needed. Already covered by fix #1.**

### 6. [P1→NOFIX] Cart restore logic analysis (CC #4+#5)
CC performed deep analysis of the cart restore effect (lines 1462-1473) and concluded: **the current code is correct**. The `cartRestoredRef` pattern, `partner?.id` dependency, and TTL check all work properly. PM-146 may be an Android Chrome platform limitation, not a code bug.
CC suggested optional sessionStorage fallback for resilience.
Codex: did not analyze PM-146 at all (no mention of cart persistence/restore).
**Decision: ACCEPTED CC's analysis. No code fix for cart restore logic — it is correct. Add a defensive note but no code change. If PM-146 persists after deploy, root cause is likely Android Chrome behavior.**

### 7. [P2→NOFIX] CartView line 809 display (CC #8)
CC noted CartView line 809 already uses `Math.round` before `formatPrice`, and line 912 will be fixed by fixing `cartTotalAmount` (fix #3 above).
**Decision: ACCEPTED. No separate fix needed — covered by fix #3.**

## Codex Only (CC missed)

### 8. [P2] Discounted detail price rounds to whole integer (Codex #5)
Codex found: `Math.round(detailDish.price * (1 - partner.discount_percent / 100))` at line ~3892 drops cents entirely (rounds to integer), violating the 2-decimal pricing rule.
**Validity: VALID finding.** `Math.round()` without the `* 100 / 100` pattern rounds to integer. A discounted price of 123.45 would display as 123.
**Scope check:** The task description mentions Fix C: "Search for `Math.round(item.price * item.quantity * 100) / 100` — verify they're consistent with the formatPrice rule." This discount computation is a related price calculation that should follow the same pattern.
**Decision: ACCEPTED. Apply fix:** `Math.round(Number(detailDish.price) * (1 - partner.discount_percent / 100) * 100) / 100` — consistent with the existing per-item rounding pattern.

## Disputes (disagree)

### PM-146 cart restore: CC says "code is correct, no fix needed" vs Codex says nothing
Not a dispute per se — Codex simply didn't analyze PM-146. CC's thorough analysis concluded the restore logic is sound. No conflicting views.
**Resolution:** Accept CC's analysis. No code change for PM-146 cart restore. The task description's suggested fix ("ensure partner?.id is in deps and guard") is ALREADY implemented in the current code.

## Final Fix Plan

Ordered list of all fixes to apply:

1. **[P1] Fix setCurrentGuest null guard** — Source: AGREED (CC #1 + Codex #1)
   File: `x.jsx` ~line 3161
   Change: `prev => prev ? { ...prev, name: trimmedName } : prev` → `prev => ({ ...(prev || {}), name: trimmedName })`

2. **[P1] Keep guestNameInput as trimmedName** — Source: AGREED (CC #2 + Codex #2)
   File: `x.jsx` ~line 3163
   Change: `setGuestNameInput('')` → `setGuestNameInput(trimmedName)`

3. **[P2] Wrap cartTotalAmount with toFixed(2)** — Source: AGREED (CC #6 + Codex #4)
   File: `x.jsx` ~line 2073
   Change: wrap reducer result with `parseFloat((...).toFixed(2))`

4. **[P2] Harden formatPrice with pre-rounding + trailing zeros** — Source: AGREED (CC #7 + Codex #3, combined)
   File: `x.jsx` ~line 987-994
   Change: apply `Math.round(num * 100) / 100` before integer check, use `rounded.toFixed(2)` for non-integers

5. **[P2] Fix discounted detail price rounding** — Source: Codex #5 (CC missed)
   File: `x.jsx` ~line 3892
   Change: `Math.round(price * factor)` → `Math.round(price * factor * 100) / 100`

6. **[NOFIX] PM-146 cart restore** — Source: CC analysis
   No code change. Current logic is correct. If PM-146 persists, root cause is Android Chrome platform behavior.

## Summary
- Agreed: 4 items (all applied)
- CC only: 3 items (0 new fixes — 2 covered by agreed fixes, 1 NOFIX analysis)
- Codex only: 1 item (1 accepted — discounted price rounding)
- Disputes: 0 items
- **Total fixes to apply: 5** (in x.jsx only, CartView.jsx needs no changes)
- PM-146: no code fix (logic is correct as-is)
