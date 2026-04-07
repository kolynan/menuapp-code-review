# Comparison Report — PublicMenu
Chain: publicmenu-260322-131000

## Agreed (both found)

### 1. [P2] PM-072: Mobile grid ignores partner.menu_grid_mobile
- **CC (Finding 2 + 6):** Line 294 hardcodes `grid-cols-2` when `isMobile`, bypassing existing `MOBILE_GRID` mapping. Also noted `MOBILE_GRID` is missing `3: "grid-cols-3"`.
- **Codex (Finding 1):** Same — `MOBILE_GRID` only supports 1 and 2, line 294 hardcodes `grid-cols-2` on mobile. Also calls for adding `3: "grid-cols-3"`.
- **Consensus FIX:** (a) Add `3: "grid-cols-3"` to `MOBILE_GRID` object. (b) Replace `isMobile ? 'grid-cols-2'` with `isMobile ? MOBILE_GRID[mobileCols]` at line 294. Both AIs agree on identical fix. HIGH confidence.

### 2. [P2] AC-09: No toast/feedback on add to cart
- **CC (Finding 3):** No visual feedback on addToCart. Proposed local state toast with `handleAdd` wrapper, timer ref, cleanup useEffect, fixed bottom-20 toast div. Recommended Option A (toast) over Option B (button animation).
- **Codex (Finding 2):** Same diagnosis — `addToCart` called directly with no feedback. Notes this is a regression from previously-fixed AC-09. Proposes `handleAddToCart` wrapper with non-stacking toast, 1.5s auto-dismiss, timer cleanup.
- **Consensus FIX:** Add `handleAddToCart` wrapper with local toast state, 1.5s timeout, non-stacking (clear previous timer on re-tap), cleanup on unmount. Use `tr('menu.added_to_cart', 'Добавлено')` for i18n with fallback. Position toast at `fixed bottom-20` above StickyCartBar. Both AIs agree. HIGH confidence.

### 3. [P2] PM-077: "+" button position — image-level vs card-level
- **CC (Finding 1):** Current "+" is at `absolute bottom-2 right-2` inside image container. Task says "bottom-right of card". CC proposes moving it to card-level absolute positioning but flags ambiguity — current image-overlay pattern is also standard (Uber Eats, DoorDash). Recommends clarification with Arman.
- **Codex (Finding 3):** Same — CTA anchored to photo, not card. On cards with longer text, button appears mid-card visually. Proposes making card `relative`, anchoring CTA to card bottom-right, adding bottom padding to prevent overlap.
- **Consensus FIX:** Move "+" from image container to card-level positioning. Make Card `relative`, place CTA at `absolute bottom-3 right-3` of Card. Add `pb-14` or similar bottom padding to CardContent to prevent overlap with price text. Both AIs agree the task description is clear ("bottom-right corner of each dish card" = card level). Codex's note about reserving bottom padding is important to prevent overlap. HIGH confidence.

### 4. [P2] #84: Discount badges missing + need partner.discount_color
- **CC (Finding 4):** MenuView has zero references to discount. Proposes adding badge to both tile and list cards at top-left of image, using `partner?.discount_color || '#C92A2A'`. Flags uncertainty about dish entity field names (`dish.discount_percent`? partner-level?).
- **Codex (Finding 4):** Same — no discount badge or struck-through price in either card variant. Proposes restoring badge + original-price markup with `partner?.discount_color || '#C92A2A'`.
- **Consensus FIX:** Add discount badge to both tile and list card image areas (top-left corner). Style: `style={{ backgroundColor: partner?.discount_color || '#C92A2A' }}` with `text-white`. Both AIs flag the same open question: what is the exact dish field for discount percentage. Implementer must check dish entity fields. HIGH confidence on approach, MEDIUM confidence on field names.

## CC Only (Codex missed)

### 5. [P3] Toast i18n needs tr() fallback
- **CC (Finding 5):** The toast text should use `tr('menu.added_to_cart', 'Добавлено')` with explicit fallback, since the i18n key likely doesn't exist yet.
- **Evaluation:** Valid and practical. The key probably doesn't exist in translations. Using `tr()` with fallback is the safe pattern.
- **Decision:** ACCEPTED — merge into Fix 2 (toast) implementation. Use `tr()` not `t()`.

## Codex Only (CC missed)

### 6. [P3] List-mode icon buttons missing aria-label
- **Codex (Finding 5):** Icon-only add/remove buttons in list mode (lines 112-135) have no `aria-label`, while tile mode does. BUGS.md already flags this.
- **Evaluation:** Valid accessibility issue, already documented in BUGS.md. However, the task scope is specifically the 4 fixes listed. This is an accessibility improvement not in the task scope.
- **Decision:** REJECTED for this chain — out of scope per "SCOPE LOCK" section. Note in BUGS_MASTER.md for future fix.

## Disputes (disagree)

### Fix 1 — Button position interpretation
- **CC** hedges: suggests current image-overlay pattern may be acceptable, recommends asking Arman.
- **Codex** is firm: the task says card-level, so move it to card-level.
- **Resolution:** Codex is right. The task explicitly says "bottom-right corner of each dish card" and lists "NO inline button (not absolute positioned)" as anti-pattern. The task is clear — move to card level. CC's alternative (keep on image) contradicts the task description and LOCK-PM-001.

### Fix 4 — Scope of CartView changes
- **CC** analyzed CartView and concluded discount is shown as text only, no color change needed.
- **Codex** constrained review to only MenuView (interpreted scope as 3 files). Did not review CartView for discount.
- **Resolution:** CC's analysis is more thorough. CartView is listed as a TARGET FILE in the task. The implementer should check CartView for any colored discount elements and apply `partner.discount_color` if found. If CartView only shows text (no colored badge), no change needed there.

## Final Fix Plan

Ordered list of all fixes to apply:

1. **[P2] PM-072: Dynamic grid columns** — Source: AGREED — Add `3: "grid-cols-3"` to `MOBILE_GRID`. Replace hardcoded `grid-cols-2` on mobile path (line 294) with `MOBILE_GRID[mobileCols]`.

2. **[P2] PM-077: Move "+" to card bottom-right** — Source: AGREED — Make Card `relative`. Move CTA block from image container to card-level `absolute bottom-3 right-3`. Add bottom padding to CardContent to prevent overlap with price.

3. **[P2] AC-09: Toast on add to cart** — Source: AGREED (+ CC-only P3 merged) — Add `handleAddToCart` wrapper with local toast state. Use `tr('menu.added_to_cart', 'Добавлено')`. Non-stacking, 1.5s auto-dismiss, cleanup on unmount. Fixed position above StickyCartBar.

4. **[P2] #84: Discount badges with partner.discount_color** — Source: AGREED — Add discount badge to tile and list cards (top-left of image). Use `partner?.discount_color || '#C92A2A'` for background. White text. Check dish entity for correct field name. Also check CartView for any colored discount elements.

## Summary
- Agreed: 4 items (all 4 task fixes)
- CC only: 1 item (1 accepted — merged into Fix 3)
- Codex only: 1 item (0 accepted, 1 rejected — out of scope)
- Disputes: 2 minor interpretation differences (both resolved)
- **Total fixes to apply: 4**
