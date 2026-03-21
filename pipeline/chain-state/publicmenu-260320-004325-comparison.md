# Comparison Report — PublicMenu
Chain: publicmenu-260320-004325
Focus: BUG-PM-031 — Cart can be closed while order is being submitted

## Agreed (both found)

### 1. [P0] Close button in CartView has no isSubmitting guard
- **CC (#2):** CartView.jsx:465 — `onClick` calls `onClose()` / `setView("menu")` with no `isSubmitting` check. Fix: short-circuit if `isSubmitting`.
- **Codex (#5):** CartView.jsx:464-466 — same issue, same location. Fix: disable the close control and short-circuit every close path while `isSubmitting` is true.
- **Verdict:** AGREED. Both identify the exact same root cause at the same location. CC's fix is more specific (code snippet); Codex's recommendation is broader ("every close path"). Use CC's targeted code fix.

## CC Only (Codex missed)

### 2. [P0] Drawer onOpenChange allows close during submission — x.jsx:3270
- **CC (#1):** The `<Drawer>` component's `onOpenChange` handler fires when the user swipes down or taps the overlay, and has no `isSubmitting` guard. This is the primary mechanism for swipe-to-close.
- **Validity:** SOLID. This is the root cause of the swipe-to-dismiss behavior described in BUG-PM-031. Codex mentioned "short-circuit every close path" but didn't identify this specific location.
- **Accept:** YES — critical fix, must include.

### 3. [P1] StickyCartBar toggle can close drawer during submission — x.jsx:3432
- **CC (#3):** The StickyCartBar has a toggle that can close the drawer mid-submission. `isSubmitting` is accessible at that scope (declared at x.jsx:1282).
- **Validity:** SOLID. Another close vector not covered by Codex.
- **Accept:** YES — prevents a third way to dismiss the cart during submission.

### 4. [P2] Drawer `dismissible` prop not utilized — x.jsx:3268
- **CC (#5):** The shadcn/ui Drawer (vaul-based) supports `dismissible` prop that controls swipe/overlay/Escape dismiss. Setting `dismissible={!isSubmitting}` is cleaner and covers all native dismiss gestures.
- **Validity:** SOLID. Belt-and-suspenders approach alongside the `onOpenChange` guard. Handles edge cases like Escape key.
- **Accept:** YES — use in addition to the onOpenChange guard per CC's recommendation.

### 5. [P2] No visual feedback that drawer is locked during submission
- **CC (#4):** Close button should appear visually disabled during submission (greyed out, cursor-not-allowed).
- **Validity:** SOLID. Good UX — users need to understand why the drawer won't close.
- **Accept:** YES — minor change, improves UX.

## Codex Only (CC missed)

Codex found 16 additional issues (#1-4, #6-17) unrelated to BUG-PM-031. These are general CartView bugs, not part of the current task scope.

### Assessment of Codex-only findings:

**Out of scope for BUG-PM-031 (do NOT apply now):**
- Codex #1 [P1]: Loyalty panel wrong flag — unrelated to cart close
- Codex #2 [P1]: Failed rating saves lock dishes — unrelated to cart close
- Codex #3 [P1]: Table code retry after failed auto-verify — unrelated to cart close
- Codex #4 [P1]: Review reward hint timing — unrelated to cart close
- Codex #6-15 [P2]: Various status/UI/formatting issues — unrelated to cart close
- Codex #16-17 [P3]: Accessibility, timeout cleanup — unrelated to cart close

**Note:** These may be valid bugs but per Rule F4 ("Fix ONLY What Is Asked"), they must NOT be included in this fix. They should be logged in BUGS_MASTER.md for future sessions.

### One Codex finding worth noting for BUG-PM-031:
- Codex #17 [P3]: Reward-email success timer not cleaned up on unmount — This is tangentially related (unmount during submission could fire stale state setters), but it's a separate bug, not part of the cart-close-during-submission issue. **Exclude from this fix.**

## Disputes (disagree)

### Priority disagreement on close button issue
- **CC:** Rated as P0 (crash-level — user loses submission feedback, potential duplicate orders)
- **Codex:** Rated as P1 (incorrect behavior)
- **Resolution:** CC's P0 is more appropriate. The bug causes the user to lose visibility of a financial transaction (order submission), which can lead to duplicate orders and lost state. This meets P0 criteria (data loss, broken core flow). **Use P0.**

No other disputes — findings don't conflict, they're complementary.

## Final Fix Plan

Ordered list of all fixes to apply for BUG-PM-031:

1. **[P0] Guard Drawer onOpenChange** — Source: CC only — x.jsx:3270
   Change `onOpenChange` to check `isSubmitting` before allowing close: `onOpenChange={(open) => { if (!open && !isSubmitting) setDrawerMode(null); }}`

2. **[P0] Guard CartView close button** — Source: agreed (CC+Codex) — CartView.jsx:465
   Add `if (isSubmitting) return;` before close handler fires.

3. **[P0] Add `dismissible={!isSubmitting}` to Drawer** — Source: CC only — x.jsx:3268
   Prevents all native dismiss gestures (swipe, overlay click, Escape) during submission.

4. **[P1] Guard StickyCartBar toggle** — Source: CC only — x.jsx:3432
   Wrap toggle in `if (!isSubmitting)` check. `isSubmitting` is in scope (x.jsx:1282).

5. **[P2] Visual disabled state for close button** — Source: CC only — CartView.jsx:464-466
   Add conditional Tailwind classes: greyed out + cursor-not-allowed when `isSubmitting`.

## Summary
- Agreed: 1 item (close button guard)
- CC only: 4 items (4 accepted, 0 rejected)
- Codex only: 16 items (0 accepted for this fix, 0 rejected — all out of scope per Rule F4)
- Disputes: 1 (priority level — resolved as P0)
- **Total fixes to apply: 5**
- All fixes are 1-2 line changes, no architecture modifications
- Codex's 16 out-of-scope findings should be logged for future review
