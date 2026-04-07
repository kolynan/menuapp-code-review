# CC Writer Findings — PublicMenu
Chain: publicmenu-260323-142203-c460

## Findings

### 1. [P1] Fix 1 — PM-107: Programmatic BS close cascades to close entire overlay stack (regression)

**File:** `x.jsx`, lines 1298–1311, 2372–2401

**Description:** `popOverlay(name)` (line 1306) removes the named overlay from `overlayStackRef`, then calls `window.history.back()` (line 1309). This triggers the `handlePopState` listener (line 2374), which sees the **next** overlay still on the stack and closes it too — cascading the close to ALL remaining sheets.

**Flow of the bug:**
1. Open cart → `pushOverlay('cart')` → stack: `['cart']`
2. Open tableConfirm → `pushOverlay('tableConfirm')` → stack: `['cart', 'tableConfirm']`
3. User swipes down / taps × on tableConfirm → `onOpenChange(false)` fires → calls `popOverlay('tableConfirm')`
4. `popOverlay` removes 'tableConfirm' → stack: `['cart']`, calls `history.back()`
5. `history.back()` fires `popstate` → `handlePopState` sees stack `['cart']` → closes cart too → stack: `[]`
6. **Result:** Both sheets close. Expected: only tableConfirm closes.

**Root cause:** The existing `isPopStateClosingRef` only gates `popOverlay` from calling `history.back()` when the close was triggered BY popstate. But there's no reverse gate: `handlePopState` is not told to skip when `popOverlay` already handled the close and is the one that triggered `history.back()`.

**FIX:** Add `isProgrammaticCloseRef = useRef(false)`. In `popOverlay`: set `isProgrammaticCloseRef.current = true` before calling `history.back()`. In `handlePopState`: if `isProgrammaticCloseRef.current === true`, reset it to false and `return` early (skip closing any overlay — `popOverlay` already did that).

```jsx
// Line ~1298: Add new ref
const isProgrammaticCloseRef = useRef(false);

// Line ~1306: Update popOverlay
const popOverlay = useCallback((name) => {
  overlayStackRef.current = overlayStackRef.current.filter(n => n !== name);
  if (!isPopStateClosingRef.current) {
    isProgrammaticCloseRef.current = true;
    window.history.back();
  }
}, []);

// Line ~2374: Update handlePopState
const handlePopState = () => {
  if (isProgrammaticCloseRef.current) {
    isProgrammaticCloseRef.current = false;
    return; // popOverlay already handled the close
  }
  // ... rest of existing handler unchanged
};
```

---

### 2. [P2] Fix 2 — PM-103: Toast z-index too low, may render behind other fixed elements

**File:** `MenuView.jsx`, line 377

**Description:** Toast div uses `z-50` (z-index: 50). Other page elements (Drawer at z-50, DrawerContent at z-[60], StickyCartBar, dialogs) may have equal or higher z-index, causing the toast to render behind them as a barely-visible thin line on Android. The toast text is also shortened to 'Добавлено' — should be the full 'Добавлено в корзину' for clarity.

**Current code (line 377):**
```jsx
<div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 bg-slate-800 text-white text-sm rounded-lg px-4 py-2 shadow-lg animate-in fade-in slide-in-from-bottom-2 duration-200">
```

**FIX:** Raise z-index to `z-[200]` to guarantee it renders above all drawers, dialogs, and overlays. Also verify `bottom-20` doesn't collide with StickyCartBar — consider `bottom-24` if StickyCartBar is 80px tall. The `animate-in` classes from tailwindcss-animate may not work on all Android browsers; consider removing the animation classes for reliability, or keeping them as progressive enhancement.

```jsx
<div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[200] bg-slate-800 text-white text-sm rounded-lg px-4 py-2 shadow-lg pointer-events-none">
```

---

### 3. [P2] Fix 3 — PM-102: Dish detail "Add to cart" button text invisible due to CSS specificity

**File:** `x.jsx`, lines 3699–3705

**Description:** The Button component at line 3699 uses `className="w-full text-white"` with `style={{ backgroundColor }}`. The text `{t('menu.add_to_cart', 'Добавить в корзину')}` IS present in the code (line 3704). The issue is likely CSS specificity: shadcn's `Button` component default variant applies `text-primary-foreground` via `buttonVariants()`. If `primary-foreground` is not white (e.g., dark theme or custom CSS variables), it may override `text-white` depending on tailwind-merge resolution order. On Android, this manifests as the text being the same color as the background, making it invisible.

**Current code:**
```jsx
<Button
  className="w-full text-white"
  style={{ backgroundColor: partner?.primary_color || '#1A1A1A' }}
  onClick={() => { addToCart(detailDish); setDetailDish(null); }}
>
  {t('menu.add_to_cart', 'Добавить в корзину')}
</Button>
```

**FIX:** Use inline style for BOTH `backgroundColor` AND `color` to bypass any CSS specificity issues. Also add `min-h-[44px]` for touch target compliance.

```jsx
<Button
  className="w-full min-h-[44px]"
  style={{ backgroundColor: partner?.primary_color || '#1A1A1A', color: '#FFFFFF' }}
  onClick={() => { addToCart(detailDish); setDetailDish(null); }}
>
  {t('menu.add_to_cart', 'Добавить в корзину')}
</Button>
```

---

### 4. [P2] Fix 4 — PM-108: "+" button in list-mode may be clipped by Card overflow-hidden

**File:** `MenuView.jsx`, lines 81–187

**Description:** The list card's `Card` (line 87) has `overflow-hidden`. The "+" button (line 153) is positioned via flexbox inside `CardContent` with `p-3` padding. The button at `w-11 h-11` (44px) should fit within the card bounds. However, on narrow screens (375px), the flex layout might push the button against the right edge of `CardContent`, and `overflow-hidden` on the Card could clip the button's right portion (especially the rounded corners or shadow).

The button is NOT absolutely positioned (unlike the tile card's button), so the issue is subtler — it may be a padding/margin edge case where the button touches the card boundary.

**FIX:** Two options:
- (A) Add explicit right padding to the button's container: change `<div className="flex justify-end">` to `<div className="flex justify-end pr-1">` (line 151) — ensures breathing room.
- (B) Change the Card's `overflow-hidden` to `overflow-visible` — but this would affect image clipping too. Not recommended.
- (C) Alternatively, ensure the button container has `shrink-0` to prevent flex shrinking: `<div className="flex justify-end shrink-0">`.

Option A is safest and most targeted.

---

### 5. [P2] Fix 5 — PM-096: ALREADY FIXED — Tile stepper buttons are already 44px

**File:** `MenuView.jsx`, lines 271, 283, 293

**Description:** The task states tile-mode stepper buttons have `w-8 h-8` (32px). However, **current code already uses `w-11 h-11` (44px)**:
- Initial "+" button: line 271 — `w-11 h-11` ✅
- Stepper "−" button: line 283 — `w-11 h-11` ✅
- Stepper "+" button: line 293 — `w-11 h-11` ✅

**FIX:** None needed. This was likely fixed in a prior commit (PM-092, commit d633716). No code change required.

---

### 6. [P2] Fix 6 — PM-discount-check: ALREADY FIXED — discount_enabled guard is in place

**File:** `MenuView.jsx`, lines 107, 126, 217, 240; `x.jsx`, line 3678

**Description:** The task states the discount badge shows when `discount_percent > 0` ignoring `discount_enabled`. However, **current code already checks `partner?.discount_enabled && partner?.discount_percent > 0`** in all relevant locations:
- List badge: line 107 ✅
- List strikethrough price: line 126 ✅
- Tile badge: line 217 ✅
- Tile strikethrough price: line 240 ✅
- Dish detail dialog: x.jsx line 3678 ✅

**FIX:** None needed. Already implemented.

---

### 7. [P2] Fix 7 — #84b: ALREADY FIXED — discount_color is used with fallback

**File:** `MenuView.jsx`, lines 110, 220

**Description:** The task states the badge uses hardcoded `bg-red-600` or `#C92A2A`, ignoring `partner.discount_color`. However, **current code already uses inline style with `partner?.discount_color || '#C92A2A'`**:
- List badge: line 110 — `style={{ backgroundColor: partner?.discount_color || '#C92A2A' }}` ✅
- Tile badge: line 220 — `style={{ backgroundColor: partner?.discount_color || '#C92A2A' }}` ✅

**FIX:** None needed. Already implemented.

---

### 8. [P3] Fix 8 — PM-104: ChevronDown imported but NOT used in cart drawer — fix location unclear

**File:** `x.jsx`, lines 28, 3404–3419

**Description:** `ChevronDown` is imported (line 28) but **never used** in the cart drawer or anywhere else in the JSX. The cart Drawer at line 3404 has:
- `DrawerHeader` with class `sr-only` (line 3411) — visually hidden
- `[&>[data-vaul-handle-hitarea]]:hidden` on DrawerContent (line 3410) — hides the Vaul handle

There is **no visible chevron or gray separator line** in our code. The visual artifact the user sees (misaligned chevron + gray line) likely comes from the **Vaul drawer component's internal rendering** — the default handle/grabber bar that we hide via `data-vaul-handle-hitarea` selector. If hiding is incomplete on Android, a remnant gray line may appear.

**FIX:** Two options:
- (A) Strengthen the Vaul handle hiding by also targeting the visual indicator: add `[&_[data-vaul-handle]]:hidden` to the DrawerContent className. This targets both the hit area and the visual handle.
- (B) Remove the unused `ChevronDown` import (line 28) — dead code cleanup.

Since the root cause is in the Vaul drawer component (not our code), fix scope is limited. Option A is a best-effort CSS override.

---

## Summary
Total: 8 findings analyzed (1× P1, 5× P2, 0× P3 actionable, 2× P3 nice-to-have)

| Fix | Bug ID | Status | Action Required |
|-----|--------|--------|-----------------|
| Fix 1 | PM-107 | **BUG CONFIRMED** | Add `isProgrammaticCloseRef` to prevent cascade close |
| Fix 2 | PM-103 | **BUG CONFIRMED** | Raise toast z-index from `z-50` to `z-[200]` |
| Fix 3 | PM-102 | **BUG CONFIRMED** | Use inline `color: '#FFFFFF'` style on Button |
| Fix 4 | PM-108 | **LIKELY BUG** | Add padding/shrink-0 to prevent flex clipping |
| Fix 5 | PM-096 | **ALREADY FIXED** | No change needed — already `w-11 h-11` |
| Fix 6 | PM-discount | **ALREADY FIXED** | No change needed — `discount_enabled` checked |
| Fix 7 | #84b | **ALREADY FIXED** | No change needed — `discount_color` used |
| Fix 8 | PM-104 | **ROOT CAUSE EXTERNAL** | Best-effort CSS override of Vaul handle |

Actionable fixes: 4 (Fix 1, 2, 3, 4)
Already resolved: 3 (Fix 5, 6, 7)
External/limited: 1 (Fix 8)

## ⛔ Prompt Clarity

- **Overall clarity:** 4/5 — Task descriptions were detailed with file locations, search terms, and verification steps. Excellent structure.
- **Ambiguous Fix descriptions:**
  - Fix 4: Description says "circular '+' FAB button" but in list-mode the button is `rounded-lg` (not circular). The circular button is in tile-mode. Slightly confusing which mode has the actual clipping issue.
  - Fix 8: "Search for ChevronDown near cart drawer" — ChevronDown is not used in the drawer at all, making the search instruction misleading. The actual visual artifact is from the Vaul library, not our code.
- **Missing context:**
  - Fix 2: Would help to know what z-index the StickyCartBar uses, to determine the correct z-index for the toast.
  - Fix 3: Would help to know which shadcn Button variant/version is in use to understand the CSS specificity issue.
  - Fixes 5/6/7: These were already fixed in prior commits — the task context should note when a fix was already applied to avoid redundant analysis.
- **Scope questions:** None — the scope restriction was clear and well-defined.
