# Review Report: BUG-PM-006/007/008 Fixes

**Date:** 2026-02-24
**Session:** 29
**Reviewed by:** Claude (correctness + style) + Codex (independent analysis)
**File:** `pages/PublicMenu/CartView.jsx`

---

## Phase 1: Analysis & Codex Comparison

### BUG-PM-006 (Drawer scroll to top on verification)
- **Claude:** Add ref to CartView top div + useEffect with prevTableVerifiedRef
- **Codex:** Add ref to scroll container in PublicMenu_BASE.txt + scrollTop = 0 with rAF
- **Chosen:** Combined — CartView ref (self-contained) + Codex's prevRef transition pattern

### BUG-PM-007 (Redundant "Стол подтверждён" text)
- **Claude:** Hide bottom border-t section when verified
- **Codex:** Same + add `shouldShowOnlineOrderBlock` to hide entire yellow block when verified + no benefits
- **Chosen:** Codex — cleaner, hides useless block entirely

### BUG-PM-008 (ⓘ tiny touch target)
- **Claude:** Remove ⓘ, add single text link
- **Codex:** Replace with full-width `Button` + `Info` icon, `h-11` = 44px
- **Chosen:** Codex — uses shadcn Button, consistent patterns

**No disputes.** Both AI agreed on direction for all 3 issues.

---

## Phase 2: Implementation

### Commits

1. `d7db09b` — **BUG-PM-006**: Added `topRef`, `prevTableVerifiedRef`, useEffect that detects false→true transition and calls `scrollIntoView`
2. `7e546f8` — **BUG-PM-007 + BUG-PM-008**: Added `hasOnlineBenefits`/`shouldShowOnlineOrderBlock`, replaced ⓘ buttons with full-width Button+Info, removed redundant verified text, hide block when no benefits
3. `6c7e21c` — **Review fix**: Changed `scrollIntoView` to walk up to nearest scrollable ancestor and use `scrollTo({ top: 0 })` — more reliable in drawer context

---

## Phase 3: Review Findings

### Correctness Reviewer

| Priority | Issue | Status |
|----------|-------|--------|
| P0-surface | `scrollIntoView` targets outer div, not drawer scroll container | **FIXED** in commit `6c7e21c` |
| P0 | `sessionItems`/`sessionOrders`/`sessionGuests` `.length` without null guard | Pre-existing, not from these changes |
| P0 | `myOrders.length` without null guard | Pre-existing, not from these changes |
| P1 | Submit button enabled when `isTableVerified === null` | Pre-existing |
| P1 | `trFormat` key detection too broad | Pre-existing |
| P1 | `XIcon` + `X` duplicate imports | Pre-existing |

### Style Reviewer

| Priority | Issue | Status |
|----------|-------|--------|
| P1 | `tr()` Russian fallbacks bypass i18n | Pre-existing design decision |
| P1 | `trFormat()` key detection too broad | Pre-existing (same as correctness) |
| P2 | Close button missing `aria-label` | Pre-existing |
| P2 | Call-waiter uses `title` not `aria-label` | Pre-existing |
| P2 | Info modal not keyboard-accessible | Pre-existing |
| P2 | Guest-name buttons no `aria-label` | Pre-existing |
| P2 | Toggle buttons missing `aria-expanded` | Pre-existing |
| P2 | Magic number 250 repeated | Pre-existing |
| P3 | Loading state `'...'` not translated | Pre-existing |

### Codex Review
- Codex review timed out after extended processing
- Results from correctness + style reviewers were comprehensive

---

## Summary

- **New issues from BUG-PM-006/007/008 changes:** 1 (scroll target — **FIXED**)
- **Pre-existing issues flagged:** 14 (P0: 2, P1: 4, P2: 7, P3: 1)
- **All new code passes review** after the scroll fix
- **No missing imports, no broken JSX, no invalid Tailwind classes**
- **All new i18n keys follow `page.section.element` format**
