# Comparison Report — PublicMenu
Chain: publicmenu-260325-133629-74b9

## Agreed (both found)

### 1. [P2] Discount formula diverges between tile and list modes
- **CC**: Found tile uses `Math.round(...)` rounding to integer (line 281), list uses `parseFloat((...).toFixed(2))` (line 103) — different patterns produce different results for the same dish.
- **Codex**: Found same divergence — tile rounds to whole unit, list rounds to 2 decimals.
- **Agreed fix**: Standardize BOTH to `Math.round(dish.price * (1 - partner.discount_percent / 100) * 100) / 100`. Keep existing `partner?.discount_enabled === true && (partner?.discount_percent ?? 0) > 0` guard.
- **Confidence**: HIGH — both identified the same root cause and same fix formula.

### 2. [P3] Photo container `overflow-hidden` clips button at edge position (list + tile)
- **CC**: Found list mode (line 127) and tile Card (line 199) both have `overflow-hidden` that clips edge-positioned buttons.
- **Codex**: Found same — list photo wrapper `overflow-hidden` at line 127, both modes still `bottom-2 right-2`.
- **Agreed fix**: Change `overflow-hidden` to `overflow-visible` on photo containers. Move `rounded-xl` to `<img>` tag directly so image stays rounded without container clipping.
- **Confidence**: HIGH.

### 3. [P3] "+" button position is 8px inside photo — needs edge offset (list + tile)
- **CC**: Found `bottom-2 right-2` at lines 151 (list) and 229 (tile) — 8px inside.
- **Codex**: Found same positions at same lines.
- **Agreed fix**: Change to `bottom-[-10px] right-[-10px]` (or equivalent style prop) in both modes.
- **Confidence**: HIGH.

### 4. [P3] "+" button missing white border ring (list + tile)
- **CC**: Found missing `border-2 border-white` on button (lines 156, 234) and stepper pill container (lines 164, 242).
- **Codex**: Found same — "neither floating `+` button adds the required white border/ring styling" at lines 156-160 and 234-239.
- **Agreed fix**: Add `border-2 border-white` to `+` button and stepper pill container in both modes.
- **Confidence**: HIGH.

## CC Only (Codex missed)

### 5. [P2] Format mismatch is a CONSEQUENCE of finding #1 (not a separate bug)
- CC explicitly called this out as a third finding: "same dish shows different prices in different view modes."
- Codex implicitly covered this in finding #1 but didn't separate it.
- **Verdict**: MERGED into finding #1 above — not a separate fix, just a symptom. No additional action needed.

### 6. [INFO] Discount badge not clipped after overflow change (tile)
- CC noted that removing `overflow-hidden` from Card won't affect the discount badge since it's positioned within bounds (`absolute top-2 left-2`).
- **Verdict**: ACCEPTED as regression awareness note — no action, just good to know.

### 7. [INFO] Card tap area unaffected by overflow change
- CC confirmed `onClick` is on Card/CardContent, not overflow container. `e.stopPropagation()` on button wrapper prevents conflicts.
- **Verdict**: ACCEPTED as regression awareness note.

### 8. [INFO] Cart payload unaffected by Fix 1
- CC confirmed `addToCart(dish)` passes full `dish` object — Fix 1 is display-only.
- **Verdict**: ACCEPTED as regression awareness note.

## Codex Only (CC missed)

### 9. [P3] List mode "+" button uses `w-9 h-9` (36px) instead of `w-11 h-11` (44px)
- **Codex**: Found list mode controls at lines 156-178 use `w-9 h-9` and `h-9`, below 44px spec.
- **CC**: Did not flag this — CC only focused on position/overflow/ring, not button sizing in list mode.
- **⚠️ CONFLICT WITH FROZEN UX**: The task prompt states: "Stepper button sizes: `w-11 h-11` on all −/+ buttons, tile and list mode (PM-092, PM-096 ✅) — DO NOT change." The task also says: "PM-096 (stepper 44px) is ALREADY FIXED (confirmed w-11 h-11 in code) — do NOT touch stepper sizes."
- **Verdict**: REJECTED. Even if Codex is correct that list mode has `w-9`, the FROZEN UX and SCOPE LOCK explicitly forbid changing stepper sizes. This fix would violate FROZEN UX. If it IS actually w-9 in list mode, it should be logged as a separate bug for a future batch, not fixed in this chain.

## Disputes (disagree)

### Codex finding #3 vs FROZEN UX — stepper sizing
- **Codex says**: List mode uses `w-9 h-9` (36px), should be `w-11 h-11` (44px).
- **FROZEN UX says**: `w-11 h-11` confirmed on all buttons, DO NOT change.
- **Resolution**: FROZEN UX takes priority. The discussion step should verify actual code, but per task instructions, stepper sizes are out of scope. If Codex is right that w-9 exists, log it as PM-132 or similar for a future batch. Do NOT fix in this chain.

## Final Fix Plan

Ordered list of all fixes to apply:

1. **[P2] Standardize discount formula in renderTileCard** — Source: AGREED (CC #1 + Codex #1)
   - Line ~281: Change `Math.round(dish.price * (1 - partner.discount_percent / 100))` to `Math.round(dish.price * (1 - partner.discount_percent / 100) * 100) / 100`

2. **[P2] Standardize discount formula in renderListCard** — Source: AGREED (CC #2 + Codex #1)
   - Line ~103: Change `parseFloat((dish.price * (1 - partner.discount_percent / 100)).toFixed(2))` to `Math.round(dish.price * (1 - partner.discount_percent / 100) * 100) / 100`

3. **[P3] List mode: Remove overflow-hidden, move rounded-xl to img** — Source: AGREED (CC #4 + Codex #2)
   - Line ~127: Change `overflow-hidden` to `overflow-visible` on photo container div
   - Move `rounded-xl` to `<img>` tag (line ~130) and no-image placeholder div (line ~137)

4. **[P3] List mode: Move "+" button to photo edge** — Source: AGREED (CC #5 + Codex #2)
   - Line ~151: Change `bottom-2 right-2` to `bottom-[-10px] right-[-10px]`

5. **[P3] List mode: Add white border ring to "+" and stepper** — Source: AGREED (CC #6 + Codex #3 partial)
   - Line ~156: Add `border-2 border-white` to button
   - Line ~164: Add `border-2 border-white` to stepper pill container

6. **[P3] Tile mode: Remove overflow-hidden from Card** — Source: AGREED (CC #7 + Codex #2)
   - Line ~199: Remove `overflow-hidden` from Card className
   - Add `rounded-t-xl` to `<img>` tag (line ~208) and no-image placeholder (line ~213)

7. **[P3] Tile mode: Move "+" button to photo edge** — Source: AGREED (CC #8 + Codex #2)
   - Line ~229: Change `bottom-2 right-2` to `bottom-[-10px] right-[-10px]`

8. **[P3] Tile mode: Add white border ring to "+" and stepper** — Source: AGREED (CC #9 + Codex #3 partial)
   - Line ~234: Add `border-2 border-white` to button
   - Line ~242: Add `border-2 border-white` to stepper pill container

## Summary
- Agreed: 4 core issues (covering 8 fix points across list+tile modes)
- CC only: 1 merged symptom + 3 INFO notes (all accepted as awareness)
- Codex only: 1 item (REJECTED — conflicts with FROZEN UX scope lock)
- Disputes: 1 (stepper sizing — resolved in favor of FROZEN UX)
- **Total fixes to apply: 8 fix points** (2 × P2 discount formula + 6 × P3 button edge/overflow/ring)
