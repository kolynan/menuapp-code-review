# Code Review Report: MenuView.jsx (Phase 2.2b)

**Date:** 2026-02-23
**Reviewed by:** Claude (correctness + style subagents) + Codex (timed out)
**File:** pages/PublicMenu/MenuView.jsx
**Commits reviewed:** 6bb823b, 578c08b, 3e4ed4b (3 implementation commits)

---

## Summary

Three fixes were implemented: (1) tap-anywhere on card opens drawer, (2) swipe-down to close drawer, (3) adaptive drawer styling for no-photo dishes. Both reviewers found actionable issues, all of which were fixed in commit f6ea5c5. Codex review was attempted but timed out due to sandbox policy restrictions.

---

## Issues Found and Fixed (commit f6ea5c5)

### P0 - Fixed: Missing `e.touches[0]` null guard
- **Where:** Touch event handlers on drawer (lines ~255-274)
- **Issue:** `e.touches[0].clientY` accessed without checking if `e.touches[0]` exists. Could cause TypeError on edge cases (WebKit, multi-finger).
- **Fix:** Added `if (!e.touches[0]) return;` guard in both `onTouchStart` and `onTouchMove`.

### P0 - Fixed: Page scrolls during swipe gesture
- **Where:** `onTouchMove` handler
- **Issue:** Missing `e.preventDefault()` allowed browser default scroll behavior during drag-to-close gesture.
- **Fix:** Added `e.preventDefault()` when `diff > 0` and swipe is eligible.

### P1 - Fixed: Swipe-close triggers on scrollable content
- **Where:** Touch handlers on drawer div
- **Issue:** When drawer content is scrolled partway, swiping down would simultaneously scroll content AND trigger the close gesture.
- **Fix:** Added `swipeEligibleRef` that checks `drawerRef.current?.scrollTop === 0` at touchStart. Swipe-close only activates when drawer is scrolled to top.

### P1 - Fixed: Drawer close animation missing on swipe
- **Where:** `onTouchEnd` handler
- **Issue:** `setSelectedDish(null)` unmounted the drawer immediately, cutting off the transition-transform animation.
- **Fix:** Set `transform: translateY(100%)` first, then `setTimeout(() => setSelectedDish(null), 200)` to let the slide-away animation complete.

### P1 - Fixed: Escape key doesn't work (drawer never focused)
- **Where:** Drawer dialog element with `tabIndex={-1}`
- **Issue:** The drawer had `onKeyDown` for Escape but was never programmatically focused, so the handler never fired.
- **Fix:** Added `React.useEffect` that calls `drawerRef.current.focus()` when `selectedDish` is set.

### P1 - Fixed: Stale transform on dish change
- **Where:** Drawer refs
- **Issue:** If `selectedDish` changed without going through `null`, the previous drag transform would persist on the new drawer content.
- **Fix:** Added `drawerRef.current.style.transform = ''` in the same useEffect that focuses the drawer.

### P1 - Fixed: Missing aria-label on list card add-to-cart button
- **Where:** `renderListCard` add-to-cart button (line ~118)
- **Issue:** Icon-only button had no accessible name for screen readers.
- **Fix:** Added `aria-label={t('menu.add')}`.

---

## Pre-existing Issues (Not Fixed - Out of Scope)

These were flagged by reviewers but pre-date the current changes:

| Priority | Issue | Notes |
|---|---|---|
| P2 | Dynamic Tailwind class in `gridColsClass` | Template literal composition; JIT scanner may not detect. Pre-existing. |
| P2 | `key` prop inside render functions | Works correctly but unconventional placement. Pre-existing. |
| P2 | `cart.find()` repeated 3 times (DRY) | Extract `getCartItem` helper. Pre-existing. |
| P2 | `renderXxx` naming convention | Class-era pattern; extract as components. Pre-existing. |
| P3 | List/tile card stepper buttons < 44px | `p-1` yields ~24px targets; should be `w-11 h-11`. Pre-existing. |
| P1 | Scroll lock stomp with parent Drawer | Both photo drawer and parent Drawer set `body.overflow`. Pre-existing. |

---

## Statistics

- Total issues found: 13 (7 fixed, 6 deferred pre-existing)
- Fixed: P0: 2, P1: 5
- Deferred: P1: 1, P2: 4, P3: 1
- Lines of code: ~450
- Commits: 3 implementation + 1 review fix = 4 total
