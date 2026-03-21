# CC Writer Findings — PublicMenu
Chain: publicmenu-260320-004325
Focus: BUG-PM-031 — Cart can be closed while order is being submitted

## Findings

1. [P0] Drawer onOpenChange allows close during submission — x.jsx:3270. The `<Drawer>` component has `onOpenChange={(open) => !open && setDrawerMode(null)}` which fires when user swipes down or taps the overlay. There is NO guard checking `isSubmitting`, so the drawer closes mid-submission. This is the ROOT CAUSE of BUG-PM-031. FIX: Change to `onOpenChange={(open) => { if (!open && !isSubmitting) setDrawerMode(null); }}`.

2. [P0] Close button in CartView has no isSubmitting guard — CartView.jsx:465. The close button calls `onClick={() => onClose ? onClose() : setView("menu")}` with no check for `isSubmitting`. User can tap ✕ while order is in flight, causing the same issue as finding #1. FIX: Change to `onClick={() => { if (isSubmitting) return; onClose ? onClose() : setView("menu"); }}`.

3. [P1] StickyCartBar toggle can close drawer during submission — x.jsx:3432. The StickyCartBar has `setDrawerMode(drawerMode === 'cart' ? null : 'cart')` which toggles the drawer. If the user taps the cart bar while submitting, it closes the drawer. FIX: Guard the toggle: `if (!isSubmitting) setDrawerMode(drawerMode === 'cart' ? null : 'cart')`. Note: need to check if `isSubmitting` is available at that scope (it is — declared at x.jsx:1282).

4. [P2] No visual feedback that drawer is locked during submission — CartView.jsx:464-469. When the close button is disabled during submission, there should be a visual indicator (e.g., greyed out or hidden) so users understand why the drawer won't close. FIX: Add conditional styling: `className={`p-2 rounded-full ${isSubmitting ? 'bg-slate-50 text-slate-300 cursor-not-allowed' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}`.

5. [P2] Drawer dismissible prop not utilized — x.jsx:3268. The shadcn/ui Drawer component (based on vaul) supports a `dismissible` prop that controls whether the drawer can be closed by swiping or clicking overlay. Setting `dismissible={!isSubmitting}` is a cleaner solution than guarding `onOpenChange` alone, as it handles all native dismiss gestures (swipe, overlay click, Escape key). FIX: Add `dismissible={!isSubmitting}` to the `<Drawer>` component. This should be used IN ADDITION to the onOpenChange guard (belt + suspenders).

## Summary
Total: 5 findings (2 P0, 1 P1, 2 P2)

### Recommended fix approach (minimal, targeted):
1. x.jsx:3268-3270 — Add `dismissible={!isSubmitting}` prop and guard `onOpenChange`
2. CartView.jsx:465 — Guard close button with `isSubmitting` check
3. x.jsx:3432 — Guard StickyCartBar toggle with `isSubmitting` check
4. CartView.jsx:464-466 — Add visual disabled state to close button during submission

All fixes are small (1-2 line changes each), no architecture changes needed.
