# Comparison Report — PublicMenu
Chain: publicmenu-260323-142202-d0a4

## Agreed (both found)

### 1. [P1] PM-107: Programmatic close cascades — closes multiple sheets
- **CC:** `popOverlay` removes name from stack, then calls `history.back()`, popstate handler finds next overlay and closes it too. Fix: add `isProgrammaticCloseRef`, set before `history.back()`, skip popstate handler when flag is set.
- **Codex:** Same analysis — `popOverlay()` calls `history.back()`, popstate handler closes whatever is now on top. Fix: same `isProgrammaticCloseRef` approach.
- **Verdict:** Full agreement on root cause and fix. Apply CC's detailed 4-step implementation.

### 2. [P2] PM-103: Toast rendering issues (z-index, text, timing)
- **CC:** Toast at `z-50` renders behind `z-[60]` overlays. Animation classes may not resolve on Android. Fix: raise to `z-[200]`, remove animation classes, add `pointer-events-none`.
- **Codex:** Same z-index issue. ALSO: fallback text says "Добавлено" but task requires "Добавлено в корзину"; timeout is 1500ms but task says ~2s. Fix: z-[200] + correct text + 2000ms timeout.
- **Verdict:** Agreed on z-index fix. Codex adds two valid points (text + timing) that CC missed. Merge all three sub-fixes.

### 3. [P2] PM-102: Dish detail "Add to cart" button issues
- **CC:** Text IS present in code but may be invisible due to shadcn `text-primary-foreground` overriding `text-white`. Fix: add `variant="ghost"` or inline `color: '#FFFFFF'`, plus `min-h-[44px]`.
- **Codex:** Text is visible, but button lacks `min-h-[44px]` touch target. Fix: add `min-h-[44px]` or `h-11`.
- **Verdict:** Both agree `min-h-[44px]` is needed. CC's color fix is a valid safety measure — apply both. Use `variant="ghost"` approach from CC + `min-h-[44px]` from both.

## CC Only (Codex missed)

### 4. [P2] PM-108: List-mode "+" button clipped at right edge
- **CC:** Analyzed `renderListCard` — button is inside flex flow with `w-11 h-11`, Card has `overflow-hidden`. CC notes clipping may not actually occur with current layout; conditional on device test.
- **Codex:** Did not mention this fix at all.
- **Verdict:** ACCEPT — the task explicitly requires this fix. Even if CC is uncertain about current clipping, the task says it IS clipped on Android. Apply a safe fix: add `pr-1` padding or adjust button positioning to ensure no edge clipping.

### 5. [P2] PM-096: Tile stepper already 44px — NO-OP
- **CC:** Verified code — stepper buttons already `w-11 h-11` (44px). Already fixed in prior chain.
- **Codex:** Did not mention (implicitly agrees it's done).
- **Verdict:** ACCEPT as no-op. No code changes needed.

### 6. [P2] PM-discount-check: Discount guard already present — NO-OP
- **CC:** Verified code — `partner?.discount_enabled && partner?.discount_percent > 0` guard exists.
- **Codex:** Did not mention (implicitly agrees it's done).
- **Verdict:** ACCEPT as no-op. No code changes needed.

### 7. [P2] #84b: Discount badge color already uses partner.discount_color — NO-OP
- **CC:** Verified code — `style={{ backgroundColor: partner?.discount_color || '#C92A2A' }}` exists.
- **Codex:** Did not mention (implicitly agrees it's done).
- **Verdict:** ACCEPT as no-op. No code changes needed.

### 8. [P3] PM-104: ChevronDown not rendered in x.jsx — OUT OF SCOPE
- **CC:** `ChevronDown` is imported but never rendered in x.jsx. Visual issue is in CartView.jsx (not a target file). No actionable fix in x.jsx.
- **Codex:** Did not mention.
- **Verdict:** ACCEPT CC's analysis. Mark as SKIPPED — cannot fix within scope (CartView.jsx is read-only). The task instruction "Do NOT look in CartView.jsx" confirms this is out of scope for x.jsx fixes.

## Codex Only (CC missed)

### 9. [P2] PM-103 sub-fix: Toast text says "Добавлено" not "Добавлено в корзину"
- **Codex:** Line 378 in MenuView.jsx shows "Добавлено" but task requires "Добавлено в корзину".
- **CC:** Did not catch the text discrepancy.
- **Verdict:** ACCEPT — valid finding. Task explicitly says toast should show "Добавлено в корзину". Fix: change to `t('menu.added_to_cart', 'Добавлено в корзину')`.

### 10. [P2] PM-103 sub-fix: Toast timeout 1500ms → ~2000ms
- **Codex:** Line 58 has `setTimeout` at 1500ms, task says ~2s.
- **CC:** Did not mention timing.
- **Verdict:** ACCEPT — valid finding. Change 1500 → 2000.

## Disputes (disagree)

None — no direct contradictions between CC and Codex. Minor differences in emphasis were resolved above.

## Final Fix Plan

Ordered list of all fixes to apply:

1. **[P1] PM-107 — Programmatic BS close cascading regression** — Source: AGREED — Add `isProgrammaticCloseRef = useRef(false)` in x.jsx. Set flag before `history.back()` in `popOverlay`. In `handlePopState`: if flag is true, reset and return. File: `x.jsx`.

2. **[P2] PM-103 — Toast thin line on Android** — Source: AGREED + Codex extras — Three sub-fixes in MenuView.jsx:
   - (a) Change `z-50` → `z-[200]` on toast div (line ~377)
   - (b) Change fallback text from "Добавлено" to `t('menu.added_to_cart', 'Добавлено в корзину')` (line ~378)
   - (c) Change timeout from 1500ms to 2000ms (line ~58)
   - (d) Remove unreliable animation classes, add `pointer-events-none`

3. **[P2] PM-102 — Dish detail button text invisible** — Source: AGREED — In x.jsx:
   - (a) Add `variant="ghost"` to Button to strip shadcn defaults
   - (b) Add `min-h-[44px]` for touch target
   - (c) Add `hover:text-white` to prevent hover color override

4. **[P2] PM-108 — List-mode "+" button clipped** — Source: CC ONLY — In MenuView.jsx `renderListCard`:
   - Add right padding to prevent button clipping at card edge

5. **[NO-OP] PM-096** — Already fixed (stepper 44px). No changes.
6. **[NO-OP] PM-discount-check** — Already fixed (discount_enabled guard). No changes.
7. **[NO-OP] #84b** — Already fixed (discount_color). No changes.
8. **[SKIPPED] PM-104** — ChevronDown issue is in CartView.jsx, not fixable in x.jsx scope.

## Summary
- Agreed: 3 items (PM-107, PM-103, PM-102)
- CC only: 5 items (4 accepted as no-op/skipped, 1 accepted as fix — PM-108)
- Codex only: 2 items (2 accepted — PM-103 text + timing sub-fixes)
- Disputes: 0 items
- Total fixes to apply: 4 (PM-107, PM-103, PM-102, PM-108)
- Total no-ops: 3 (PM-096, PM-discount-check, #84b)
- Total skipped: 1 (PM-104 — out of scope)
