# Merge Report — PublicMenu
Chain: publicmenu-260325-133629-74b9

## Applied Fixes
1. [P2] Standardize discount formula in renderListCard — Source: agreed (CC+Codex) — DONE
   - Changed `parseFloat((...).toFixed(2))` to `Math.round(... * 100) / 100`
2. [P2] Standardize discount formula in renderTileCard — Source: agreed (CC+Codex) — DONE
   - Changed `Math.round(...)` (integer) to `Math.round(... * 100) / 100`
3. [P3] List mode: overflow-hidden → overflow-visible, rounded-xl to img+placeholder — Source: agreed — DONE
4. [P3] List mode: "+" button to photo edge (bottom-[-10px] right-[-10px]) — Source: agreed — DONE
5. [P3] List mode: white border ring (border-2 border-white) on button+stepper — Source: agreed — DONE
6. [P3] Tile mode: overflow-hidden → overflow-visible on Card, rounded-t-xl to img+placeholder — Source: agreed — DONE
7. [P3] Tile mode: "+" button to photo edge (bottom-[-10px] right-[-10px]) — Source: agreed — DONE
8. [P3] Tile mode: white border ring (border-2 border-white) on button+stepper — Source: agreed — DONE

## Skipped — Unresolved Disputes (for Arman)
None — all disputes resolved in discussion step.

## Skipped — Could Not Apply
- PM-132 (P2): List mode stepper w-9 h-9 → w-11 h-11. Both CC and Codex confirmed real bug but FROZEN UX forbids stepper size changes in this batch. Logged as PM-132 in BUGS.md for future batch.

## Git
- Commit: ea20cf8
- Files changed: 2 (MenuView.jsx, BUGS.md)

## Prompt Feedback
- CC clarity score: 4/5
- Codex clarity score: 4/5
- Fixes where writers diverged due to unclear description: discount formula — task said "Math.round(item.price * (1 - partner.discount_percent / 100) * 100) / 100" but existing code used two different patterns (parseFloat+toFixed vs Math.round to integer). Both writers found the divergence, slight difference in description of root cause.
- Fixes where description was perfect (both writers agreed immediately): overflow-hidden→visible, button edge position, white border ring — all had exact class names and line numbers.
- Recommendation for improving task descriptions: The discount formula fix could explicitly state "BOTH tile and list currently use DIFFERENT wrong formulas" to make the divergence clearer upfront.

## Summary
- Applied: 8 fixes (2x P2 discount formula + 6x P3 button edge/overflow/ring)
- Skipped (unresolved): 0 disputes
- Skipped (other): 1 fix (PM-132 stepper sizing — FROZEN UX)
- MUST-FIX not applied: 0 (both MUST-FIX items applied successfully)
- Commit: ea20cf8
