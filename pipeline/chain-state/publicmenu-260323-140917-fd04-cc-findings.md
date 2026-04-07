# CC Writer Findings — PublicMenu
Chain: publicmenu-260323-140917-fd04

## Findings

### Fix 1 — PM-107 (P1): Programmatic BS close collapses entire sheet stack (regression from КС-4)

**CONFIRMED BUG.** The `popOverlay` function (x.jsx:1306-1311) removes the overlay from the stack and then calls `window.history.back()` when `isPopStateClosingRef.current` is false. This `history.back()` triggers the `popstate` event handler (x.jsx:2373-2401). The popstate handler does NOT check `isPopStateClosingRef` at entry — it always processes: it reads the next overlay from the stack and closes it too. This causes a cascade: closing the tableConfirm sheet programmatically also closes the cart drawer underneath.

**Root cause:** The `isPopStateClosingRef` flag prevents `popOverlay` from calling `history.back()` recursively, but it does NOT prevent the popstate handler from running when `popOverlay` itself calls `history.back()`.

**FIX:**
1. In `popOverlay` (x.jsx:1306-1311): Set `isPopStateClosingRef.current = true` BEFORE calling `window.history.back()`, so the popstate handler knows this is a programmatic back.
2. In the popstate handler (x.jsx:2374): Add a guard at the top — if `isPopStateClosingRef.current` is true, reset the flag to false and return immediately (skip processing).

Updated `popOverlay`:
```js
const popOverlay = useCallback((name) => {
  overlayStackRef.current = overlayStackRef.current.filter(n => n !== name);
  if (!isPopStateClosingRef.current) {
    isPopStateClosingRef.current = true;  // Flag BEFORE history.back()
    window.history.back();
  }
}, []);
```

Updated popstate handler:
```js
const handlePopState = () => {
  if (isPopStateClosingRef.current) {
    isPopStateClosingRef.current = false;
    return; // Programmatic back — overlay already closed by popOverlay caller
  }
  // ... rest of existing hardware-back handling ...
};
```

---

### Fix 2 — PM-103 (P2): Toast shows as thin line on Android

**CONFIRMED BUG.** The custom toast in MenuView.jsx:377-379 uses `t('menu.added_to_cart', 'Добавлено')`. The `makeSafeT` function (x.jsx:522-541) signature is `(key, params)` where `params` is an interpolation object, NOT a fallback string. The key `menu.added_to_cart` does NOT exist in `I18N_FALLBACKS` (the existing key is `cart.item_added` at line 408). So `t('menu.added_to_cart', 'Добавлено')` returns an empty string `""`. The toast div renders with empty content — only padding/background visible = "thin line".

**FIX:** Change the i18n key to one that exists in the fallback map, OR add the key to `I18N_FALLBACKS`:
- **Option A (recommended):** In `I18N_FALLBACKS` (x.jsx), add: `"menu.added_to_cart": "Добавлено в корзину"`.
- **Option B:** In MenuView.jsx:378, change to `t('cart.item_added')` which already exists in fallbacks as "Добавлено".
- Also: ensure the toast div has `min-h-[36px]` and `flex items-center` to prevent thin-line appearance even if text is somehow empty.

---

### Fix 3 — PM-102 (P2): Dish detail dialog — "Add to cart" button has no text

**CONFIRMED BUG.** Same root cause as Fix 2. In x.jsx:3704, the button uses `t('menu.add_to_cart', 'Добавить в корзину')`. The key `menu.add_to_cart` does NOT exist in `I18N_FALLBACKS`. The second parameter is treated as interpolation params (object), not a fallback string. Result: empty string → button renders as empty colored bar.

**FIX:** Add `"menu.add_to_cart": "Добавить в корзину"` to the `I18N_FALLBACKS` map in x.jsx (near line 420-425 area). This ensures the button always shows text even if the i18n system doesn't have the key.

---

### Fix 4 — PM-108 (P2): "+" button clipped by card overflow in list-mode

**ANALYSIS:** Looking at `renderListCard` in MenuView.jsx:81-187, the card has `className="overflow-hidden"` (line 87). The "+" button (line 153-162) is a `w-11 h-11 rounded-lg` button positioned inside `<div className="flex justify-end">` within the content column (`flex-1 min-w-0 flex flex-col justify-between h-24`).

The button is within the normal flow — not absolutely positioned — so `overflow-hidden` on the card should not clip it. However, the content column has a fixed `h-24` (96px) height. If the text above the button (dish name 2 lines + description + price + reviews) exceeds ~52px, the `justify-between` spacing compresses and the button could be pushed below the h-24 boundary, getting clipped by the card's `overflow-hidden`.

**FIX:** Change the list card's `overflow-hidden` to `overflow-visible` specifically for the content area, or change the outer Card class. The safest approach:
- On the Card (line 87): keep `overflow-hidden` (needed for image)
- On the content column (line 118): change `h-24` to `min-h-[96px]` to allow growth when content is tall, preventing clipping.

Alternative: wrap the button area with explicit `overflow-visible` or use `relative z-10` to ensure visibility.

---

### Fix 5 — PM-104 (P3): Chevron and gray separator line misaligned in cart drawer header

**CANNOT FIX IN SCOPE.** The `ChevronDown` icon is imported in x.jsx (line 28) but NOT rendered anywhere in x.jsx's drawer section. The drawer header in x.jsx (lines 3410-3413) is `sr-only` (hidden). The `ChevronDown` is actually rendered inside `CartView.jsx` (line 427, confirmed by grep). Since `CartView.jsx` is a CONTEXT FILE (read-only, not in TARGET FILES), this fix cannot be applied.

**Recommendation:** Either add CartView.jsx to TARGET FILES, or skip this fix. The chevron/separator alignment is a CartView.jsx concern, not x.jsx.

---

### Fix 6 — PM-096 (P2): Tile-mode stepper buttons below 44px touch target

**ALREADY FIXED.** The current code in `renderTileCard` (MenuView.jsx:266-299) already has:
- "+" add button: `w-11 h-11` (44px) — line 271
- Stepper "−" button: `w-11 h-11` (44px) — line 282
- Stepper "+" button: `w-11 h-11` (44px) — line 292

All tile-mode stepper buttons are already at the 44px minimum. This was likely fixed in a previous КС (possibly PM-092 or КС-3). No changes needed.

---

### Fix 7 — PM-discount-check (P2): Discount badge shows when discount_enabled is false

**ALREADY FIXED.** All discount rendering in MenuView.jsx already checks BOTH conditions:
- List mode badge (line 107): `partner?.discount_enabled && partner?.discount_percent > 0`
- List mode price (line 126): `partner?.discount_enabled && partner?.discount_percent > 0`
- Tile mode badge (line 217): `partner?.discount_enabled && partner?.discount_percent > 0`
- Tile mode price (line 240): `partner?.discount_enabled && partner?.discount_percent > 0`
- Dish detail dialog (x.jsx:3678): `partner?.discount_enabled && partner?.discount_percent > 0`

No changes needed.

---

### Fix 8 — #84b (P2): Discount badge uses hardcoded color instead of partner.discount_color

**ALREADY FIXED.** The discount badge already uses `partner.discount_color` with fallback:
- List mode badge (MenuView.jsx:110): `style={{ backgroundColor: partner?.discount_color || '#C92A2A' }}`
- Tile mode badge (MenuView.jsx:219): `style={{ backgroundColor: partner?.discount_color || '#C92A2A' }}`

No changes needed.

---

## Summary
Total: 5 findings (0 P0, 1 P1, 2 P2, 0 P3) + 3 ALREADY FIXED (Fix 6, 7, 8) + 1 OUT OF SCOPE (Fix 5)

| Fix | Bug ID | Priority | Status |
|-----|--------|----------|--------|
| Fix 1 | PM-107 | P1 | **CONFIRMED** — popOverlay cascades via popstate |
| Fix 2 | PM-103 | P2 | **CONFIRMED** — empty toast text (wrong i18n key) |
| Fix 3 | PM-102 | P2 | **CONFIRMED** — empty button text (wrong i18n key) |
| Fix 4 | PM-108 | P2 | **CONFIRMED** — h-24 + overflow-hidden may clip button |
| Fix 5 | PM-104 | P3 | **OUT OF SCOPE** — ChevronDown is in CartView.jsx (read-only) |
| Fix 6 | PM-096 | P2 | **ALREADY FIXED** — tile stepper already w-11 h-11 |
| Fix 7 | PM-discount | P2 | **ALREADY FIXED** — discount_enabled check present |
| Fix 8 | #84b | P2 | **ALREADY FIXED** — discount_color already used |

## ⛔ Prompt Clarity (MANDATORY)
- Overall clarity: **4/5**
- Ambiguous Fix descriptions:
  - Fix 4: Description says "circular FAB" but list-mode button is `rounded-lg` not `rounded-full`. Slightly confusing but the issue location was clear enough.
  - Fix 5: Task says to look in x.jsx but the ChevronDown is actually in CartView.jsx. This is a scope mismatch — the task correctly identifies the fix location but it's in a read-only file.
- Missing context:
  - Fix 5: Should have mentioned that ChevronDown is rendered in CartView.jsx, not x.jsx, to avoid wasted analysis time.
  - Fixes 6, 7, 8: These appear to have been fixed in prior КС chains (likely КС-3 or КС-5). The task could note "verify if still present" to save analysis time when fixes are already applied.
- Scope questions:
  - Fix 2: Should the fix be in I18N_FALLBACKS (x.jsx) or in MenuView.jsx? Both are TARGET FILES. Recommended: both (add key to fallbacks AND improve toast styling).
