# Codex Writer Findings — PublicMenu Chain: publicmenu-260326-211606-044a

## Findings
1. [P1] Guest rename still no-ops when `currentGuest` is falsy — In `pages/PublicMenu/x.jsx:3161`, `setCurrentGuest(prev => prev ? { ...prev, name: trimmedName } : prev)` leaves state unchanged for the exact Fix 1 path where no guest object exists yet. The new name is written to `localStorage`, but the header/confirmation state is not updated immediately. FIX: change this to `setCurrentGuest(prev => ({ ...(prev || {}), name: trimmedName }))` so the saved name reaches local state even before a DB guest record exists.
2. [P1] Persisted guest name is not reused for header/confirmation fallback — `pages/PublicMenu/CartView.jsx:302` and `pages/PublicMenu/CartView.jsx:463` display/edit from `currentGuest?.name` only, while `pages/PublicMenu/x.jsx:2955` still creates the hall guest with `null` name and `pages/PublicMenu/x.jsx:2771` derives the confirmation label from that guest object. After restart or before the first guest record is named, the UI falls back to generic or stale guest data instead of the saved `menuapp_guest_name`. FIX: derive one effective guest name from persisted storage when `currentGuest?.name` is empty, use it in the cart header/edit opener, and apply it when creating/restoring the hall guest before building `guestLabel`.
3. [P2] `formatPrice` still strips required trailing zeroes — In `pages/PublicMenu/x.jsx:987`, non-integer prices are formatted with `parseFloat(num.toFixed(2)).toString()`, so values such as `55.80` render as `55.8`. That still violates Fix 3's rule to show exactly 2 decimals whenever cents exist. FIX: round first, then use `rounded.toFixed(2)` for non-integers and the integer branch only after checking the rounded value.
4. [P2] Cart total still carries floating-point residue into downstream math — In `pages/PublicMenu/x.jsx:2073`, `cartTotalAmount` is the raw reducer result with no final `toFixed(2)` normalization. That leaves floating-point noise available to loyalty/session totals and any display path that consumes the raw total. FIX: wrap the reducer result in `parseFloat((...).toFixed(2))` before assigning `cartTotalAmount`.
5. [P2] Discounted dish detail price still rounds to a whole integer — In `pages/PublicMenu/x.jsx:3892`, `Math.round(detailDish.price * (1 - partner.discount_percent / 100))` drops cents entirely, so discounted decimal prices can show as whole numbers. This is still outside Fix 3's required 2-decimal pricing rule. FIX: round the discounted detail price to 2 decimals, e.g. `Math.round(Number(detailDish.price) * factor * 100) / 100`, then pass that result to `formatPrice`.

## Summary
Total: 5 findings (0 P0, 2 P1, 3 P2, 0 P3)

## Prompt Clarity (MANDATORY — do NOT skip this section)
- Overall clarity: 5
- Ambiguous Fix descriptions (list Fix # and what was unclear): none
- Missing context (what info would have helped): none
- Scope questions (anything you weren't sure if it's in scope): none
