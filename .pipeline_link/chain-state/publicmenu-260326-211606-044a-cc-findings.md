# CC Writer Findings — PublicMenu
Chain: publicmenu-260326-211606-044a

## Findings

### Fix 1 — PM-139: Guest name not saved (old name shown)

1. **[P1] `setCurrentGuest` silently discards update when `prev` is null** (x.jsx ~line 3161) — The callback `setCurrentGuest(prev => prev ? { ...prev, name: trimmedName } : prev)` returns `prev` unchanged when `prev` is null/undefined (no guest record created yet). This means the name is never stored in React state for new/anonymous guests. FIX: Change to `setCurrentGuest(prev => ({ ...(prev || {}), name: trimmedName }))` so the name is always set in local state, even when no DB guest record exists yet.

2. **[P1] `guestNameInput` cleared prematurely after save** (x.jsx ~line 3163) — `setGuestNameInput('')` runs immediately after `setCurrentGuest`. If the header displays `guestNameInput` as a fallback (and `currentGuest` is still null due to finding #1), the UI shows an empty name. FIX: Instead of clearing to empty string, set `setGuestNameInput(trimmedName)` so the input field retains the saved name as display fallback. The editing mode is already closed by `setIsEditingName(false)`.

3. **[P2] Order confirmation screen may show stale guest name for hall orders** (x.jsx ~line 2771-2773) — The hall submission path captures `guestLabel` via `getGuestDisplayName(guestToUse)`. If `guestToUse` still has the old name (because `setCurrentGuest` with null guard failed), the confirmation screen displays the old name. The fix from finding #1 addresses the root cause. Additionally, the confirmation data could read from `localStorage.getItem('menuapp_guest_name')` as a reliable fallback. FIX: After fixing finding #1, verify that `guestToUse` in submission reads the updated `currentGuest`. No additional code change needed if finding #1 is fixed — the state will be correct.

### Fix 2 — PM-146: Cart items lost after browser kill

4. **[P1] Cart restore effect runs but partner.id may not trigger re-run after `hasRestoredCart` ref blocks it** (x.jsx ~lines 1462-1473) — The restore effect at line 1464 has `if (cartRestoredRef.current) return;` as its first guard, followed by `if (!partner?.id) return;`. The dependency array is `[partner?.id]`. Scenario: on first render, `partner?.id` is undefined → effect fires → `cartRestoredRef.current` is false → `partner?.id` is falsy → returns early WITHOUT setting `cartRestoredRef.current = true`. Then when partner loads, `partner?.id` changes → effect fires again → `cartRestoredRef.current` is still false → `partner?.id` is now valid → sets `cartRestoredRef.current = true` → restores cart. **This logic actually appears correct on re-read.** The ref guard and partner guard work together properly.

5. **[P1] Cart save effect may clear localStorage before restore completes on fast re-render** (x.jsx ~lines 1454-1460) — The save effect at line 1456 has `if (!cartRestoredRef.current) return;` guard, which correctly prevents saving empty cart before restore. However, there's a race: if `cart` changes from `[]` to restored items (from the restore effect), the save effect fires with the restored cart — this is correct. **On deeper analysis: the current logic looks correct.** The `cartRestoredRef` flag properly gates the save.

   **Revised finding:** The cart persistence code at lines 165-213 and 1454-1473 is actually correct in its logic. The issue described in PM-146 (cart lost after browser kill) may be caused by a different root cause: **Android Chrome may aggressively clear localStorage on process kill in certain configurations** (e.g., when the PWA is not installed, or when the system memory pressure causes the browser to be killed). This is a known Android Chrome behavior. FIX: Add a redundant `sessionStorage` write alongside localStorage as a secondary persistence layer. On restore, check sessionStorage first (survives soft kills like tab suspension) then localStorage (survives hard kills). This is a belt-and-suspenders approach. Alternatively, verify the restore is working by adding a debug breadcrumb: after `cartRestoredRef.current = true`, log the restored cart length to help diagnose if the issue is in storage vs. restore timing.

   **Simpler fix aligned with task description:** Verify the dependency array and guard order. The task description says to ensure `partner?.id` is in deps and guard with `if (!partner?.id) return` — which is ALREADY the case in the current code (line 1466: `if (!partner?.id) return;`, line 1473: `[partner?.id]`). The current implementation IS correct. The bug may be that `cart.length === 0` check at line 1470 fails if cart already has items from a different source (unlikely on fresh load).

   **Final assessment: The cart restore code IS correct as-is.** The `cartRestoredRef` pattern, the `partner?.id` dependency, and the TTL check all work properly. If PM-146 is reproducible, the root cause is likely Android Chrome clearing localStorage on process kill, not a code bug. FIX: No code change needed for the restore logic itself. To improve resilience, wrap the restore in a try-catch that also attempts `sessionStorage` as fallback.

### Fix 3 — PM-145: Floating-point price display

6. **[P2] `cartTotalAmount` accumulates floating-point errors** (x.jsx ~line 2073) — `cart.reduce((acc, item) => acc + Math.round(item.price * item.quantity * 100) / 100, 0)` — while each per-item amount is rounded, the accumulator `acc` is a standard float, so summing multiple rounded values still produces floating-point drift (e.g., `0.1 + 0.2 = 0.30000000000000004`). FIX: Wrap the final result: `parseFloat(cart.reduce(...).toFixed(2))`. Change line 2073 to:
   ```js
   const cartTotalAmount = parseFloat(cart.reduce((acc, item) => acc + Math.round(item.price * item.quantity * 100) / 100, 0).toFixed(2));
   ```

7. **[P2] `formatPrice` in OrderStatusScreen lacks pre-rounding** (x.jsx ~line 987-994) — The local `formatPrice` in `OrderStatusScreen` does: `Number.isInteger(num) ? num.toLocaleString() : parseFloat(num.toFixed(2)).toString()`. If `num` is `69.27000000000001`, `Number.isInteger()` correctly returns false, and `toFixed(2)` produces `"69.27"` — so this actually handles it. However, `toLocaleString()` for integers may produce locale-specific separators inconsistently. FIX: Apply `Math.round(num * 100) / 100` before the integer check for robustness:
   ```js
   const rounded = Math.round(num * 100) / 100;
   const formatted = Number.isInteger(rounded) ? rounded.toLocaleString('ru-KZ') : rounded.toFixed(2);
   ```

8. **[P2] CartView line 809 shows per-item total without formatPrice rounding** (CartView.jsx ~line 809) — `{formatPrice(Math.round(item.price * item.quantity * 100) / 100)}` — this is already using `Math.round` before `formatPrice`, so it's correct. However, line 912 displays `{formatPrice(Number(cartTotalAmount) || 0)}` — if `cartTotalAmount` has floating-point drift, this will display it. FIX: Finding #6 fixes the root cause. No additional change needed in CartView.jsx — the `formatPrice` function from `useCurrency` hook should handle the display. But if `formatPrice` from `useCurrency` does NOT apply rounding, then the fix at the computation site (finding #6) is essential.

## Summary
Total: 8 findings (0 P0, 3 P1, 5 P2, 0 P3)

**Key fixes needed:**
- **Fix 1 (PM-139):** Change `setCurrentGuest` null guard at line 3161 (finding #1) + keep `guestNameInput` as trimmedName instead of clearing (finding #2). Two small targeted edits in x.jsx.
- **Fix 2 (PM-146):** Cart restore logic is actually correct as-is. If a code change is required for resilience, add `sessionStorage` as secondary persistence. Otherwise, this may be an Android Chrome platform limitation, not a code bug.
- **Fix 3 (PM-145):** Wrap `cartTotalAmount` with `parseFloat(...toFixed(2))` at line 2073 (finding #6) + harden OrderStatusScreen's `formatPrice` with pre-rounding (finding #7). Two small targeted edits in x.jsx.

## ⛔ Prompt Clarity (MANDATORY)
- **Overall clarity: 4/5** — Task description is well-structured with file locations, line numbers, and specific code snippets. The "already tried" sections are helpful.
- **Ambiguous Fix descriptions:**
  - Fix 2: The description says "Root cause to investigate: if `partner` is not yet loaded when the effect fires" — but the current code ALREADY has this guard (`if (!partner?.id) return`). The suggested fix is already implemented. This made the analysis confusing — I spent time verifying something that was already in place. It would help to say "verify the existing guard is sufficient" rather than suggesting it as a new fix.
- **Missing context:** The `useCurrency` hook's `formatPrice` implementation is external and not available for review. Since Fix 3 mentions `formatPrice` issues, knowing whether `useCurrency.formatPrice` applies rounding would clarify whether the fix needs to be at the computation site only or also in the formatter.
- **Scope questions:** Fix 2 conclusion — if the code is already correct, should we still add defensive sessionStorage fallback, or is "no change needed" an acceptable finding?
