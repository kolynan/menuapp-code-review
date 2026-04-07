# Merge Report — PublicMenu
Chain: publicmenu-260323-142202-d0a4

## Applied Fixes
1. [P2] PM-103 toast sub-fixes — Source: agreed + Codex extras — DONE
   - (a) Removed unreliable `animate-in fade-in slide-in-from-top-2 duration-200` animation classes
   - (b) Added `pointer-events-none` to toast div
   - (c) Changed fallback text from 'Добавлено' to 'Добавлено в корзину'
   - (d) Changed timeout from 1500ms to 2000ms
2. [P2] PM-102 dish detail button — Source: agreed — DONE
   - Added `variant="ghost"` to strip shadcn default styles that override text-white
   - Added `min-h-[44px]` for touch target compliance
   - Added `hover:text-white` to prevent hover color override

## Already Applied by Prior Chain (fd04)
- [P1] PM-107: Programmatic BS close cascade — `isPopStateClosingRef` guard already in place (commit b0bd7fb)
- [P2] PM-103 base fix: z-[200], top-center positioning, min-h-[36px], i18n key in I18N_FALLBACKS
- [P2] PM-102 base fix: i18n key `menu.add_to_cart` in I18N_FALLBACKS
- [P2] PM-108: List-mode content `h-24` → `min-h-[96px]`

## No-Op (already fixed in prior chains)
- PM-096: Tile stepper already w-11 h-11 (44px) — chain 5842
- PM-discount-check: `partner?.discount_enabled` guard exists — chain 5842
- #84b: `partner?.discount_color || '#C92A2A'` exists — chain 5842

## Skipped — Cannot Apply Within Scope
- PM-104 (P3): ChevronDown alignment issue is in CartView.jsx (read-only target). ChevronDown imported but never rendered in x.jsx. No actionable fix within scope.

## Git
- Commit: a4132e3
- Pre-task commit: b0bd7fb
- Files changed: 3 (MenuView.jsx, x.jsx, BUGS.md)

## Prompt Feedback
- CC clarity score: 4/5
- Codex clarity score: 5/5
- Fixes where writers diverged due to unclear description: Fix 4 (PM-108) — CC noted description says "circular + FAB" but list-mode uses rounded-lg. Codex did not even attempt PM-108.
- Fixes where description was perfect (both writers agreed immediately): PM-107 (clear root cause + pattern), PM-103 z-index (clear symptom + fix)
- Recommendation for improving task descriptions: For PM-108, specify whether the bug is with the rounded shape or the position. For PM-103, the initial description could mention the exact current fallback text to make the discrepancy obvious.
- Note: Prior chain fd04 (running in parallel) already applied base fixes for 4 of 8 items. This chain applied incremental sub-fixes that fd04 missed (toast text/timing/animation, button variant/min-height).

## Summary
- Applied: 2 fixes (PM-103 sub-fixes, PM-102 sub-fixes)
- Already applied by prior chain: 4 fixes (PM-107, PM-103 base, PM-102 base, PM-108)
- No-op (prior chains): 3 (PM-096, PM-discount-check, #84b)
- Skipped (out of scope): 1 (PM-104)
- MUST-FIX not applied: 0
- Commit: a4132e3
