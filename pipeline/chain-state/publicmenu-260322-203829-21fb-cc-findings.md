# CC Writer Findings — PublicMenu (CartView.jsx)
Chain: publicmenu-260322-203829-21fb

## Findings

1. **[P2] PM-083: Chevron ˅ is centered instead of right-aligned** (line 428) — The `<ChevronDown>` close icon has `mx-auto` which centers it horizontally. UX convention: close/dismiss controls belong in the top-right corner. **FIX:** Change `mx-auto` to `ml-auto` in the ChevronDown className at line 428. This right-aligns the chevron while the drag handle bar remains centered.

2. **[P2] PM-084: Duplicate gray line — drag handle + centered chevron look identical** (lines 426-430) — The drag handle (`w-8 h-1 bg-gray-300 rounded-full mx-auto`) and the centered ChevronDown icon both appear as gray horizontal elements at the top of the drawer, confusing the user. **FIX:** This is resolved by Fix 1 (right-aligning the chevron). Once the chevron moves to the right, the two elements become visually distinct — centered drag handle bar vs. right-aligned interactive icon. No additional code change needed beyond Fix 1.

3. **[P1] PM-085: Chevron scrolls away with content — user can't close drawer** (lines 424-430) — The drag handle (line 426) and ChevronDown (lines 427-430) are inside the scrollable `<div className="max-w-2xl mx-auto px-4 mt-2 pb-4">` container (line 424). When the cart has many items, the user scrolls down and loses the close control. The sticky submit button at line 951 (`sticky bottom-0`) already works — a matching sticky top element is needed. **FIX:** Wrap lines 426-430 (drag handle div + ChevronDown) in a sticky container: `<div className="sticky top-0 z-10 bg-white pt-2 pb-1">`. Move the `mt-2` from the drag handle div into the sticky wrapper as `pt-2`. Remove `mb-2` from the ChevronDown (replace with `pb-1` on the wrapper). This creates a sticky header that coexists with the existing `sticky bottom-0` submit button.

4. **[P2] PM-086: Loyalty email field should be removed** (lines 886-917) — The loyalty section at lines 886-917 shows an email input ("Email для бонусов") when `showLoyaltySection` is true. This was supposed to be removed in #87 KS-1, but the block survived. The motivation text near the submit button (lines 952-960) is the only loyalty UI needed. NOTE: The post-order reward email form at lines 491-550 (guarded by `shouldShowReviewRewardNudge`) is a DIFFERENT feature and must NOT be removed. **FIX:** Delete the entire conditional block from line 886 (`{/* P1: Loyalty — compact email...`) through line 917 (closing `)}`) inclusive. This removes the pre-checkout email input while preserving: (a) the motivation text at lines 952-960, and (b) the reward email form at lines 491-550.

5. **[P3] PM-087: Excessive vertical gap between ИТОГО and motivation text** (lines 920, 937, 956) — On 375px mobile, there's too much whitespace between "ИТОГО" (line 922) and the motivation text (line 956). Contributing factors: `h-20` spacer (line 937), `mt-2 mb-2` on motivation text (line 956), `mt-4 pt-4` on subtotal wrapper (line 920). **FIX:** (a) Line 937: change `h-20` to `h-16`. (b) Line 956: change `mt-2 mb-2` to `mt-1 mb-1`. (c) Line 920: change `mt-4 pt-4` to `mt-3 pt-3`. This reduces the gap to ~8-12px while keeping enough spacer clearance for the sticky submit button.

## Summary
Total: 5 findings (0 P0, 1 P1, 3 P2, 1 P3)

All 5 findings correspond directly to the task description (PM-083 through PM-087). No additional out-of-scope issues were identified — analysis was limited strictly to the described bugs per SCOPE LOCK.

### Implementation Notes
- Fix 2 (PM-084) is automatically resolved by Fix 1 (PM-083) — no separate code change needed.
- Fix 3 (PM-085) is the most impactful: without it, users with large carts cannot close the drawer without scrolling back up.
- Fix 4 (PM-086) must carefully distinguish between TWO email sections: the pre-checkout loyalty email (REMOVE) vs. the post-order reward email (KEEP).
- The existing `sticky bottom-0` submit button (line 951) must continue working after adding `sticky top-0` for the chevron.

## Prompt Clarity (MANDATORY — do NOT skip this section)
- Overall clarity: **5**
- Ambiguous Fix descriptions: None. All 5 fixes had clear "Now / Expected / Must NOT be" sections with exact line numbers and class names. The distinction between two email sections in Fix 4 was explicitly called out — excellent.
- Missing context: None. The task provided file name, line numbers, CSS classes, and verification steps.
- Scope questions: None. SCOPE LOCK was clear. The task explicitly listed locked UX decisions.
