# Comparison Report — PublicMenu
Chain: publicmenu-260323-205015-f92b

## Agreed (both found)

### 1. [P2] PM-108+PM-110: List-mode layout — image must move to RIGHT side
- **CC**: Swap flex order so text renders first, image second (image appears on right). Update comment "Image LEFT" → "Image RIGHT".
- **Codex** (Finding 1): Same — reorder list-card layout so text/price column renders first, image wrapper renders as right column.
- **Consensus**: Both agree on the fix. Use CC's detailed implementation (swap div order inside CardContent flex row).

### 2. [P2] PM-108+PM-110: List-mode "+" button must overlay image, not text column
- **CC**: Move only the `!inCart` "+" button into image container as `absolute bottom-1 right-1`, keep stepper in text area for usability. Change `rounded-lg` → `rounded-full`. Button size `w-9 h-9` (36px) to fit on 96px image.
- **Codex** (Finding 2): Move add button into image container, `absolute bottom-2 right-2 rounded-full`. Remove height/padding workaround.
- **Consensus**: Both agree on the core fix (move button into image, make round, position absolute). Minor difference in offset (`bottom-1 right-1` vs `bottom-2 right-2`) — use `bottom-2 right-2` (8px inset, more breathing room). CC's insight about keeping stepper in text area is valuable and should be followed.

### 3. [P2] PM-111: Tile-mode "+" button must overlay image, not card
- **CC**: Move button block (lines 265-299) inside image container div. Remove `pb-14` from CardContent and `pr-14` from price area.
- **Codex** (Finding 3): Same — move add button into existing relative image container, `absolute bottom-2 right-2 z-10`. Remove extra content padding (`pb-14`, `pr-14`).
- **Consensus**: Full agreement. Both describe the same fix with the same padding removal.

## CC Only (Codex missed)

### 1. Stepper placement strategy for list mode
- **CC** details Option A vs Option B for stepper when `inCart`: recommends keeping stepper in text area (not cramming into image overlay) since horizontal stepper won't fit in 80-96px image width.
- **Codex** didn't address stepper placement explicitly.
- **Evaluation**: Valid and important design decision. **ACCEPTED** — follow CC's Option A (stepper stays in text column).

### 2. `overflow-hidden` edge case on list-mode image container
- **CC** flags that `overflow-hidden` on the image container could clip the "+" button, and analyzes that `w-9 h-9` at `bottom-1 right-1` fits within 96px bounds. Also suggests alternative: move `rounded-xl overflow-hidden` to `<img>` tag directly.
- **Codex** didn't mention overflow clipping.
- **Evaluation**: Valid edge case worth noting. **ACCEPTED** — merger should verify button is within image bounds or adjust overflow strategy.

### 3. Button size consideration (44px touch target vs image proportion)
- **CC** notes `w-9 h-9` (36px) is below 44px minimum touch target but proportionally better on 96px image; offers `w-10` or `w-11` alternatives.
- **Codex** didn't specify button dimensions.
- **Evaluation**: Important UX detail. **ACCEPTED** — use `w-9 h-9` with adequate padding from absolute positioning. The absolute positioning container adds click area.

## Codex Only (CC missed)

None. Codex split CC's Fix 1 into two separate findings but didn't identify anything CC missed.

## Disputes (disagree)

### Minor: Button offset — `bottom-1 right-1` (CC) vs `bottom-2 right-2` (Codex)
- CC uses `bottom-1 right-1` (4px inset) for list mode.
- Codex uses `bottom-2 right-2` (8px inset) for both modes.
- **Resolution**: Use `bottom-2 right-2` (8px) for both list and tile modes for consistency and better visual breathing room. Not a real dispute — just different defaults.

## Final Fix Plan

Ordered list of all fixes to apply:

1. **[P2] List-mode layout swap** — Source: agreed — In `renderListCard`, swap the order of text div and image div inside the CardContent flex row so image appears on the RIGHT side. Update comment.

2. **[P2] List-mode "+" overlay on image** — Source: agreed (CC detail) — Move ONLY the `!inCart` "+" button into the image container with `absolute bottom-2 right-2 z-10 rounded-full`. Keep the stepper (`inCart` branch) in the text column for usability. Button size: `w-9 h-9`. Verify `overflow-hidden` doesn't clip.

3. **[P2] Tile-mode "+" overlay on image** — Source: agreed — Move the add/stepper block (currently absolute on Card) into the image container div. Position: `absolute bottom-2 right-2 z-10`. Remove `pb-14` from CardContent and `pr-14` from price area since button no longer occupies card-level space.

## Summary
- Agreed: 3 items (all 3 core fixes)
- CC only: 3 items (3 accepted — stepper strategy, overflow edge case, button size)
- Codex only: 0 items
- Disputes: 0 real disputes (1 minor offset preference resolved)
- **Total fixes to apply: 3**
