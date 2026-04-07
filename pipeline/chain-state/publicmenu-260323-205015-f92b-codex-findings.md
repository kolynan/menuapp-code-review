# Codex Writer Findings — PublicMenu Chain: publicmenu-260323-205015-f92b

## Findings
1. [P2] Fix 1: List-mode photo remains on the left - In `renderListCard`, the image wrapper is still rendered before the text block (`MenuView.jsx:90-115`), so list-mode keeps the old left-image layout instead of moving the photo to the right as required by PM-108/PM-110. FIX: reorder the list-card layout so the text/price column renders first and the image wrapper renders as the right column at the target image width.
2. [P2] Fix 1: List-mode add button is still a card/text-column control - The `+` control is still rendered in the text column (`MenuView.jsx:150-180`) with `flex justify-end pr-1`, while the image wrapper has no add button inside it. The button is also `rounded-lg`, not circular, and the code still relies on `min-h-[96px]` (`MenuView.jsx:118`) instead of redesigning the layout around an image overlay. FIX: move the add button into the image container, keep that container `relative`, set the button to `absolute bottom-2 right-2 rounded-full`, and remove the height/padding workaround that keeps the control attached to the card layout.
3. [P2] Fix 2: Tile-mode add control is still anchored to the card, not the photo - In `renderTileCard`, the add/stepper container remains a direct child of the `Card` with `absolute bottom-3 right-3` (`MenuView.jsx:265-299`), so the `+` stays attached to the card container instead of the image wrapper. The extra content padding (`pb-14` and `pr-14` at `MenuView.jsx:228-239`) also shows the tile is still reserving space for a card-level control rather than leaving the rest of the tile layout unchanged. FIX: move the add button into the existing relative image container (`MenuView.jsx:201-225`), anchor it there with `absolute bottom-2 right-2 z-10`, and remove the extra content padding that only exists to avoid collision with a card-level button.

## Summary
Total: 3 findings (0 P0, 0 P1, 3 P2, 0 P3)

## Prompt Clarity (MANDATORY — do NOT skip this section)
- Overall clarity: 5
- Ambiguous Fix descriptions (list Fix # and what was unclear): none
- Missing context (what info would have helped): none
- Scope questions (anything you weren't sure if it's in scope): none
