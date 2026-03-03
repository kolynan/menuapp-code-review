## Codex Review: Dish Card Changes 2+4 (S72)

**Reviewer:** Codex GPT-5.3 (xhigh reasoning)
**Date:** 2026-03-03
**Session:** S72
**Files reviewed:** MenuView.jsx, x.jsx

### Approved (no issues found)
- Round add button accessibility baseline is good: `aria-label` + `w-11 h-11` (44x44px)
- `stopPropagation` does not break card behavior — cards are not wired with `onClick`
- Stepper pill container fits 320px 2-column layout (~100px wide, card width larger)
- Tailwind classes are valid and explicit (no unsafe dynamic class generation)
- `Plus`, `Minus`, `ImageIcon` imports all present

### Issues Found (with severity P0-P3)

| # | Severity | Issue | CC Assessment | Action |
|---|----------|-------|---------------|--------|
| 1 | P1 | `menu_grid_mobile` could be string `"2"` — strict `=== 2` fails | AGREE | FIXED: Added `Number()` coercion |
| 2 | P2 | Stepper buttons `w-8 h-8` (32px) below 44px, no `aria-label` | PARTIAL — size is per design spec (pill = 44px, inner buttons smaller = Wolt/Glovo pattern). aria-label valid. | FIXED: Added aria-labels. Size kept per spec. |
| 3 | P3 | Existing localStorage masks new default for returning users | DISAGREE — by design. User preference should persist. | NO ACTION |

### Fixes Applied
1. `x.jsx:1130` — Added `Number()` coercion: `const mobileGrid = Number(partner.menu_grid_mobile ?? 1);`
2. `MenuView.jsx:169,178` — Added `aria-label` on stepper minus/plus buttons

### Summary
Change 2 and Change 4 approved by Codex with minor fixes. No P0 issues. CC and Codex agree on all substantive points.
