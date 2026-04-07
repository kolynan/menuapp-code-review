# Discussion Report — PublicMenu
Chain: publicmenu-260323-124313-bcbe

## Disputes Discussed
Total: 1 dispute from Comparator

## Round 1
### Dispute 1: Scope of stack — sheets only vs. all views (CC 1.3 vs Codex 3)

**CC Position:**
The overlay stack should cover ONLY actual overlay sheets that stack on top of each other: cart drawer and table confirm sheet. Checkout, confirmation, and orderstatus are full VIEW transitions — they replace the entire page content via `view` state change + `replaceState`. They are NOT overlapping sheets. The task SCOPE LOCK says "Modify ONLY the popstate/history logic and the sheet open/close handlers" — view transitions are not sheet handlers. The actual bug PM-105 is specifically about nested overlapping sheets (order list + table code input), not about view transitions. Expanding to all views is a significant scope increase and risks regression in the view navigation system.

**Codex Position:**
"A (narrow). PM-105 is about nested overlapping sheets, and the scope lock explicitly limits changes to popstate/history logic plus sheet open/close handlers, not broader navigation semantics. If checkout, confirmation, and order status are full view transitions already managed via `replaceState`, forcing them into the same overlay stack changes product behavior outside the bug. The correct fix is to make history stack order match the actual overlapping sheet order: `tableConfirm` above `cart`, and nothing more."

**Status:** RESOLVED — Codex agrees with CC's narrow scope.

## Resolution Summary
| # | Dispute | Rounds | Resolution | Winner |
|---|---------|--------|------------|--------|
| 1 | Scope of stack: sheets-only vs all-views | 1 | resolved | CC (Codex concurred) |

## Updated Fix Plan
Based on discussion results, the disputed item is now resolved. The overlay stack covers ONLY:
- `tableConfirm` (table code verification sheet — highest priority)
- `cart` (cart drawer — lower priority)

Full view transitions (checkout, confirmation, orderstatus) remain as-is with `replaceState` — they are out of scope for PM-105.

The Comparator's Final Fix Plan stands unchanged since the dispute was resolved in favor of CC's position (which the Comparator had already recommended):

1. **[P1] Introduce ref-based overlay stack** — Source: agreed (CC 1.3 + Codex 3, CC scope) — Add `overlayStackRef`, `pushOverlay()`, `popOverlay()` helpers. Scope: cart drawer + table confirm sheet only.

2. **[P1] Fix popstate handler to use stack-based close order** — Source: agreed (CC 1.1 + Codex 1) — Replace hardcoded if/else chain with stack pop + switch. Topmost overlay closes first. Add `isPopStateClosingRef` guard.

3. **[P1] Add guarded history.back() to all programmatic sheet closes** — Source: agreed (CC 1.2 + Codex 2) — Every programmatic close must call `history.back()` unless triggered by popstate. Guard with `isPopStateClosingRef.current` check. Affected locations:
   - ~Line 2126: `setShowTableConfirmSheet(false)` after verification
   - ~Line 3466: table confirm Drawer `onOpenChange`
   - ~Line 3377: cart Drawer `onOpenChange`
   - ~Line 1474: `setDrawerMode(null)` in `showConfirmation`
   - ~Line 3641: cart toggle off via StickyCartBar

4. **[P1] Replace raw pushState calls with pushOverlay()** — Source: agreed (CC 1.3) — All existing `history.pushState` for sheet opens replaced with `pushOverlay('cart')` / `pushOverlay('tableConfirm')`.

**Implementation order:** 1 → 4 → 2 → 3 (stack infrastructure first, then migrate pushState calls, then fix handler, then fix close handlers).

## Unresolved (for Arman)
None. All disputes resolved in Round 1.
