# Merge Report — PublicMenu
Chain: publicmenu-260321-110752

## Version Tag
- Pre-fix tag: PublicMenu-pre-publicmenu-260321-110752
- Rollback: `git revert --no-commit HEAD..PublicMenu-pre-publicmenu-260321-110752`

## Applied Fixes
1. **[P1] Just-in-time table confirmation Bottom Sheet** — Source: AGREED (CC+Codex) — DONE
   - Added `showTableConfirmSheet` state and `pendingSubmitRef`
   - Modified `handleSubmitOrder()` to intercept when table not verified → opens Bottom Sheet
   - Added Drawer-based Bottom Sheet with table code slot UI, auto-verify, benefit text
   - Auto-submits order after successful table verification
   - Added 8 new i18n keys (`cart.confirm_table.*`)

2. **[P1] Submit button always enabled** — Source: CC only (merged with Fix 1) — DONE
   - Removed `disabled={!isTableVerified}` from CartView submit button
   - Removed gray disabled styling and hint text
   - Button now always terracotta, calls `handleSubmitOrder()` which handles intercept

3. **[P2] Drawer stepper XIcon → Minus** — Source: CC only — DONE
   - Replaced `XIcon` (red, remove-all) with `Minus` icon (slate, decrement) at qty=1
   - Replaced text `+` with `Plus` icon component
   - Added `Minus`, `Plus` to lucide-react imports in CartView.jsx

4. **[P2] Submit button text update** — Source: CC only — DONE
   - Simplified button className (removed `!isTableVerified` gray state)
   - Style always applies terracotta when not submitting/error

5. **[P2] Mode-switch toast i18n fallback** — Source: Codex only — DONE
   - Added `"cart.items_removed_mode_switch"` to `I18N_FALLBACKS`

6. **[P2] Remove console.error** — Source: CC only — DONE
   - Removed `console.error(err)` in hall submit catch block (x.jsx ~line 2582)

7. **[P3] Active category chip terracotta** — Source: CC only — DONE (partial)
   - Passed `activeColor="#B5543A"` prop to CategoryChips component
   - NOTE: If CategoryChips ignores this prop, a B44 prompt will be needed

## Skipped — Unresolved Disputes (for Arman)
None — no disputes in this chain.

## Skipped — Could Not Apply
None.

## New Bugs Recorded (out of scope)
- BUG-PM-064: [P1] Partner lookup hides backend failures (Codex #2)
- BUG-PM-065: [P1] Hall StickyCartBar ignores visit lifecycle state (Codex #3)
- BUG-PM-066: [P2] Hall StickyCartBar copy — missing full state matrix (Codex #4)
- BUG-PM-067: [P2] StickyCartBar animations — no cart count tracking (Codex #5)

## Git
- Pre-fix tag: PublicMenu-pre-publicmenu-260321-110752
- Commit: 360f76d
- Files changed: 3 (x.jsx, CartView.jsx, BUGS.md)

## Summary
- Applied: 7 fixes
- Skipped (unresolved): 0 disputes
- Skipped (other): 0 fixes
- New bugs recorded: 4 (out of scope)
- Commit: 360f76d
