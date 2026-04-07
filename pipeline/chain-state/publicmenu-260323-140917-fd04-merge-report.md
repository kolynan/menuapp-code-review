# Merge Report — PublicMenu
Chain: publicmenu-260323-140917-fd04

## Applied Fixes
1. [P1] Fix 1 — PM-107: popOverlay cascade regression — Source: agreed (CC+Codex) — DONE
   - Set `isPopStateClosingRef.current = true` before `history.back()` in `popOverlay`
   - Added early-return guard in `handlePopState` when flag is set (reset + return)
   - File: x.jsx lines 1306-1311, 2374-2379

2. [P2] Fix 2 — PM-103: Toast thin line (i18n key + positioning) — Source: CC (primary) + Codex (secondary) — DONE
   - Added `"menu.added_to_cart": "Добавлено в корзину"` to `I18N_FALLBACKS` in x.jsx
   - Moved toast to `top-4` with `z-[200]`, added `min-h-[36px]` and `flex items-center`
   - Files: x.jsx (i18n key), MenuView.jsx (toast styling)

3. [P2] Fix 3 — PM-102: Dish detail button empty — Source: CC only — DONE
   - Added `"menu.add_to_cart": "Добавить в корзину"` to `I18N_FALLBACKS` in x.jsx
   - File: x.jsx

4. [P2] Fix 4 — PM-108: "+" button clipped in list mode — Source: CC only — DONE
   - Changed `h-24` to `min-h-[96px]` on content column in `renderListCard`
   - File: MenuView.jsx

## Skipped — Unresolved Disputes (for Arman)
- None

## Skipped — Could Not Apply
- [P3] Fix 5 — PM-104: Chevron/separator misalignment — requires CartView.jsx which is read-only. x.jsx-only fix would be incomplete (hiding handle vs aligning it). Needs CartView.jsx in scope for proper fix.

## Already Fixed (no action needed)
- Fix 6 — PM-096: Tile stepper already 44px (w-11 h-11)
- Fix 7 — PM-discount-check: discount_enabled check already present
- Fix 8 — #84b: discount_color already used with fallback

## Git
- Commit: b0bd7fb
- Pre-task commit: c152dc7
- Files changed: 3 (x.jsx, MenuView.jsx, BUGS.md)

## Prompt Feedback
- CC clarity score: 4/5
- Codex clarity score: 5/5
- Fixes where writers diverged due to unclear description:
  - Fix 2 (PM-103): CC identified i18n empty string as root cause, Codex identified StickyCartBar occlusion. Both valid — task description didn't hint at i18n pattern being the primary cause. Complementary findings, both applied.
  - Fix 4 (PM-108): CC found it, Codex missed it. Description was clear.
  - Fix 5 (PM-104): Task said look in x.jsx but the ChevronDown is in CartView.jsx (read-only). Scope mismatch in task description.
- Fixes where description was perfect (both writers agreed immediately):
  - Fix 1 (PM-107): Excellent description with exact root cause, expected behavior, anti-patterns, and mini test case. Both writers converged on same flag-based solution.
- Recommendation for improving task descriptions:
  - For i18n-related bugs, mention whether the `makeSafeT` wrapper treats second param as interpolation (not fallback). This was the root cause for PM-102 and PM-103 but not mentioned in the task.
  - For Fix 5 (PM-104), either include CartView.jsx in target files or explicitly note the scope limitation.

## Summary
- Applied: 4 fixes (PM-107, PM-103, PM-102, PM-108)
- Skipped (unresolved): 0 disputes
- Skipped (other): 1 fix (PM-104, CartView.jsx out of scope)
- Already fixed: 3 (PM-096, PM-discount-check, #84b)
- MUST-FIX not applied: 0
- Commit: b0bd7fb
