# Merge Report — PublicMenu
Chain: publicmenu-260323-142203-c460

## Applied Fixes
1. [P1] PM-107 — Programmatic BS close cascade — Source: agreed — DONE
   - Added `isProgrammaticCloseRef = useRef(false)` as separate flag from `isPopStateClosingRef`
   - `popOverlay` sets `isProgrammaticCloseRef` before `history.back()`
   - `handlePopState` checks `isProgrammaticCloseRef` for early return (prevents cascade)
   - `isPopStateClosingRef` now used exclusively by `handlePopState` → `popOverlay` direction
2. [P2] PM-102 — Dish detail button text invisible — Source: CC only (accepted) — DONE
   - Changed from `text-white hover:text-white` classes to inline `style={{ color: '#FFFFFF' }}`
   - Bypasses CSS specificity issue with shadcn Button component
3. [P2] PM-108 — "+" button clipped in list-mode — Source: CC only (accepted) — DONE
   - Added `pr-1` to button container `<div className="flex justify-end pr-1">` in `renderListCard`
4. [P3] PM-104 — Cart drawer handle artifact — Source: CC only (accepted, best-effort) — DONE
   - Added `[&_[data-vaul-handle]]:hidden` to cart DrawerContent className
   - Removed unused `ChevronDown` import from lucide-react

## Skipped — Already Fixed (No-ops)
- PM-103 (P2): Toast — already fully fixed by parallel chain d0a4 (z-[200], pointer-events-none, full text, 2000ms timer)
- PM-096 (P2): Tile stepper — already 44px (w-11 h-11) from prior КС
- PM-discount-check (P2): discount_enabled guard — already in place
- #84b (P2): discount_color — already used with fallback

## Skipped — Unresolved Disputes (for Arman)
None.

## Skipped — Could Not Apply
None.

## Git
- Commit: 46c07a8
- Pre-task commit: a4132e3
- Files changed: 3 (x.jsx, MenuView.jsx, BUGS.md)

## Prompt Feedback
- CC clarity score: 4/5
- Codex clarity score: 4/5
- Fixes where writers diverged due to unclear description:
  - Fix 4 (PM-108): CC says "circular FAB button" but list-mode uses `rounded-lg` (not circular). Tile-mode has the circular button. Slight confusion about which mode.
  - Fix 8 (PM-104): "Search for ChevronDown near cart drawer" — ChevronDown is not used in the drawer. The visual artifact is from Vaul library internal handle, not our code.
- Fixes where description was perfect (both writers agreed immediately):
  - Fix 1 (PM-107): Excellent flow description with overlay stack diagram. Both CC and Codex identified identical root cause and fix.
  - Fix 2 (PM-103): Clear symptom description, both found z-index + text issues.
- Recommendation for improving task descriptions:
  - Include DOM screenshots or exact element selectors for visual bugs (PM-103 toast, PM-104 chevron)
  - Distinguish "circular" vs "rounded" button shapes to avoid mode confusion
  - Mark context files explicitly as read-only in a separate section (Codex was confused about scope)

## Summary
- Applied: 4 fixes (1 P1 + 2 P2 + 1 P3)
- Skipped (already fixed): 4 no-ops
- Skipped (unresolved): 0 disputes
- Skipped (other): 0
- MUST-FIX not applied: 0
- Commit: 46c07a8
