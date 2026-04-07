# Discussion Report — PublicMenu
Chain: publicmenu-260325-133629-74b9

## Disputes Discussed
Total: 1 dispute from Comparator

## Round 1
### Dispute 1: List mode stepper buttons w-9 h-9 (36px) vs FROZEN UX w-11 h-11 (44px)

**CC Position:**
Codex correctly identified that list mode uses `w-9 h-9` (lines 156, 168, 178) while tile mode uses `w-11 h-11` (lines 234, 246, 256). This IS a real inconsistency — the 44px minimum touch target spec is violated in list mode. However, the task has three explicit directives that forbid fixing this:
1. FROZEN UX: "Stepper button sizes: `w-11 h-11` on all −/+ buttons, tile and list mode (PM-092, PM-096 ✅) — DO NOT change"
2. Task context: "PM-096 (stepper 44px) is ALREADY FIXED (confirmed w-11 h-11 in code) — do NOT touch stepper sizes"
3. SCOPE LOCK: "Do NOT change stepper sizes (already w-11 h-11, correct)"

The FROZEN UX instruction was written assuming w-11 h-11 was already applied everywhere, but list mode was missed in a prior batch. Regardless, scope discipline requires we follow the lock. Changing stepper sizes risks unintended layout regressions in list mode (different card height, stepper pill size, etc.) that haven't been tested. The correct action: log as PM-132 for a future batch, do NOT fix in this chain.

**Codex Position:**
AGREE. Codex confirmed the inconsistency is real (verified lines 156, 168, 178 = w-9 h-9 vs line 234 = w-11 h-11). However, Codex agrees that CC's action decision is correct: the task explicitly freezes stepper sizing and says PM-092/PM-096 are already fixed and must not be touched. The finding is valid but the patch is not actionable in this batch. Changing a frozen dimension would break scope discipline, create process risk, and could interfere with the in-scope edge/overflow/ring adjustments. The correct outcome: record as PM-132 and fix in a follow-up task that explicitly reopens stepper sizing.

**Status:** RESOLVED (Round 1) — Both agree: real bug, out of scope, log as PM-132.

## Resolution Summary
| # | Dispute | Rounds | Resolution | Winner |
|---|---------|--------|------------|--------|
| 1 | List mode stepper w-9 vs FROZEN UX w-11 | 1 | resolved | CC (scope lock prevails) |

## Updated Fix Plan
Based on discussion results, the disputed item is NOT added to the fix plan.
All 8 agreed fix points from the Comparator remain unchanged:

1. **[P2] Standardize discount formula in renderTileCard** — Source: AGREED (CC + Codex)
   - Line ~281: Change `Math.round(dish.price * (1 - partner.discount_percent / 100))` to `Math.round(dish.price * (1 - partner.discount_percent / 100) * 100) / 100`

2. **[P2] Standardize discount formula in renderListCard** — Source: AGREED (CC + Codex)
   - Line ~103: Change `parseFloat((dish.price * (1 - partner.discount_percent / 100)).toFixed(2))` to `Math.round(dish.price * (1 - partner.discount_percent / 100) * 100) / 100`

3. **[P3] List mode: Remove overflow-hidden, move rounded-xl to img** — Source: AGREED
   - Line ~127: Change `overflow-hidden` to `overflow-visible` on photo container div
   - Move `rounded-xl` to `<img>` tag (line ~130) and no-image placeholder div (line ~137)

4. **[P3] List mode: Move "+" button to photo edge** — Source: AGREED
   - Line ~151: Change `bottom-2 right-2` to `bottom-[-10px] right-[-10px]`

5. **[P3] List mode: Add white border ring to "+" and stepper** — Source: AGREED
   - Line ~156: Add `border-2 border-white` to button
   - Line ~164: Add `border-2 border-white` to stepper pill container

6. **[P3] Tile mode: Remove overflow-hidden from Card** — Source: AGREED
   - Line ~199: Remove `overflow-hidden` from Card className
   - Add `rounded-t-xl` to `<img>` tag (line ~208) and no-image placeholder (line ~213)

7. **[P3] Tile mode: Move "+" button to photo edge** — Source: AGREED
   - Line ~229: Change `bottom-2 right-2` to `bottom-[-10px] right-[-10px]`

8. **[P3] Tile mode: Add white border ring to "+" and stepper** — Source: AGREED
   - Line ~234: Add `border-2 border-white` to button
   - Line ~242: Add `border-2 border-white` to stepper pill container

## New Bug to Log
- **PM-132** (P2): List mode stepper buttons use `w-9 h-9` (36px) instead of `w-11 h-11` (44px) — violates 44px minimum touch target. Lines 156, 168, 178 in MenuView.jsx. Both CC and Codex confirmed. Deferred to future batch.

## Unresolved (for Arman)
None — all disputes resolved in Round 1.
