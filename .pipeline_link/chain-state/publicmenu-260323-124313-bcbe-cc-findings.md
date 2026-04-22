# CC Writer Findings — PublicMenu
Chain: publicmenu-260323-124313-bcbe

## Findings

### Fix 1 — PM-105: Android back button closes nested sheets in wrong order

Analysis of `x.jsx` lines 2352-2371 (the `handlePopState` handler) and all `history.pushState` call sites.

**Sub-finding 1.1: [P1] Priority order inverted in popstate handler (lines 2354-2366)**

The handler checks `drawerMode === 'cart'` FIRST (line 2355), then `showTableConfirmSheet` (line 2363). When both are open simultaneously (cart drawer at z-50, table confirm sheet at z-[60] on top), pressing Android Back closes the BOTTOM layer (cart) instead of the TOP layer (table confirm sheet).

Reproduction: Open cart → tap Submit (when table not verified) → table confirm sheet opens on top → press Back → cart closes (WRONG), table confirm sheet stays.

FIX: Reverse the check order — `showTableConfirmSheet` must be checked BEFORE `drawerMode === 'cart'`, since it has higher z-index and is visually on top. More robustly, introduce a ref-based overlay stack (e.g. `overlayStackRef = useRef([])`) that tracks open order. The popstate handler pops the last entry from the stack and closes the corresponding overlay.

**Sub-finding 1.2: [P1] Programmatic sheet closes don't pop history entries — ghost history states**

When sheets close programmatically (not via Back button), no `history.back()` is called to remove the corresponding `pushState` entry. This leaves orphan history entries that cause unexpected behavior on subsequent Back presses.

Affected locations:
- Line 2126: `setShowTableConfirmSheet(false)` — auto-close after successful table verification. No `history.back()`.
- Line 3466: `setShowTableConfirmSheet(false)` — close via Drawer's `onOpenChange`. No `history.back()`.
- Line 3377: `setDrawerMode(null)` via cart Drawer `onOpenChange` (user swipes down). No `history.back()`.
- Line 1474: `setDrawerMode(null)` inside `showConfirmation` callback. No `history.back()`.
- Line 3641: `setDrawerMode(null)` when toggling cart off via StickyCartBar button. No `history.back()`.

FIX: Every programmatic close of a sheet/overlay that had a `pushState` on open MUST call `window.history.back()` to pop the matching history entry. However, this must be guarded to avoid double-popping when the close was TRIGGERED by popstate itself. Pattern: use a `isPopStateClosing` ref flag — set it to `true` inside the popstate handler before closing, so the close handlers know NOT to call `history.back()` again.

**Sub-finding 1.3: [P1] No stack-based tracking of open overlays — fragile implicit ordering**

Currently, the popstate handler uses a hardcoded if/else chain to determine which overlay to close. This is fragile — if a new overlay is added or stacking order changes, the handler silently breaks. There's no single source of truth for "which overlays are currently open, in what order."

FIX: Introduce an overlay stack mechanism. Options (recommended: Option A):

**Option A — Ref-based stack (minimal change):**
```jsx
const overlayStackRef = useRef([]);

// Helper: push overlay
const pushOverlay = useCallback((name) => {
  overlayStackRef.current = [...overlayStackRef.current, name];
  window.history.pushState({ overlay: name }, '');
}, []);

// Helper: pop overlay (returns name of popped overlay)
const popOverlay = useCallback(() => {
  const stack = overlayStackRef.current;
  if (stack.length === 0) return null;
  const top = stack[stack.length - 1];
  overlayStackRef.current = stack.slice(0, -1);
  return top;
}, []);
```

Then in popstate handler:
```jsx
const handlePopState = () => {
  const top = popOverlay();
  if (!top) return; // no overlay — let browser handle
  isPopStateClosingRef.current = true;
  switch (top) {
    case 'tableConfirm':
      setShowTableConfirmSheet(false);
      break;
    case 'cart':
      if (isSubmitting) {
        // Re-push: can't close during submit
        pushOverlay('cart');
        return;
      }
      setDrawerMode(null);
      break;
  }
  isPopStateClosingRef.current = false;
};
```

And each open site uses `pushOverlay('cart')` / `pushOverlay('tableConfirm')` instead of raw `pushState`.

Each programmatic close calls:
```jsx
if (!isPopStateClosingRef.current) {
  const idx = overlayStackRef.current.lastIndexOf('cart');
  if (idx !== -1) {
    overlayStackRef.current.splice(idx, 1);
    window.history.back();
  }
}
```

**Sub-finding 1.4: [P2] Cart toggle from StickyCartBar can push duplicate history entries**

Line 3640: `if (drawerMode !== 'cart') window.history.pushState(...)` — this correctly guards against push when already open. But combined with Sub-finding 1.2 (no pop on close), rapidly toggling the cart creates orphan history entries. Each open pushes, but close doesn't pop. After 5 open/close cycles, user must press Back 5 times to navigate away.

FIX: Addressed by Sub-finding 1.2 fix — programmatic close must pop history.

**Sub-finding 1.5: [P2] Confirmation screen opens cart without considering existing history state**

Line 3355: `window.history.pushState({ overlay: 'cart' }, '')` — when user is on the confirmation screen and taps "Open Orders", cart opens with a new pushState. But the confirmation screen itself doesn't use pushState. If user then presses Back, the handler closes cart (correct), but another Back goes to browser history instead of back to confirmation. This is minor since confirmation is a full view, not an overlay.

FIX: If the stack-based approach from 1.3 is implemented, the confirmation→cart transition will work correctly since only the cart pushState will be in the stack.

## Summary
Total: 5 sub-findings under Fix 1 (0 P0, 3 P1, 2 P2, 0 P3)

The core bug (1.1) is a simple priority inversion — just swap the if/else order. But robust fix requires addressing 1.2 (ghost history entries) and 1.3 (stack tracking) together. Recommended approach: implement Option A (ref-based stack) with `isPopStateClosingRef` guard to prevent double-pops.

## ⛔ Prompt Clarity
- Overall clarity: 5
- Ambiguous Fix descriptions: None. Fix 1 is extremely well-described with current behavior, expected behavior, anti-patterns, file locations, and test cases.
- Missing context: None. All relevant state variables and z-index info were either provided or easily discoverable from the hints.
- Scope questions: None. Scope lock is clear — only x.jsx, only popstate/history logic.
