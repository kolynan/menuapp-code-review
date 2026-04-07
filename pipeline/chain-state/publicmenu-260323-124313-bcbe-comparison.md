# Comparison Report — PublicMenu
Chain: publicmenu-260323-124313-bcbe

## Agreed (both found)

### 1. [P1] Priority order inverted in popstate handler (CC 1.1 ≈ Codex 1)
**CC:** The handler checks `drawerMode === 'cart'` FIRST (line 2355), then `showTableConfirmSheet` (line 2363). When both open, Back closes bottom layer (cart) instead of top (table confirm sheet). Fix: reverse check order; better yet, use ref-based overlay stack.
**Codex:** Same finding — back handler checks cart before table-code sheet. Fix: make handler state-aware, close highest-priority active layer first, match `event.state.sheet` to close action.
**Verdict:** AGREED. Both identify the exact same root cause and same fix direction. CC provides more detailed code (Option A stack). Use CC's stack approach as the implementation pattern.

### 2. [P1] Programmatic sheet closes leave stale/ghost history entries (CC 1.2 ≈ Codex 2)
**CC:** When sheets close programmatically (X button, auto-close after verification, swipe down), no `history.back()` is called. Orphan history entries accumulate. Lists 5 specific locations. Fix: every programmatic close must call `history.back()`, guarded by `isPopStateClosingRef` to prevent double-pop when triggered by popstate itself.
**Codex:** Same finding — close paths only call setState, not `history.back()`. Lists 4 specific locations. Fix: centralize non-popstate closes and pair each with guarded `history.back()`.
**Verdict:** AGREED. Both identify same problem and same solution pattern (guarded history.back). CC lists one additional location (line 3641 — StickyCartBar toggle). Use CC's `isPopStateClosingRef` guard pattern.

### 3. [P1] No stack-based tracking — fragile implicit ordering (CC 1.3 ≈ Codex 3 partial)
**CC:** Popstate uses hardcoded if/else chain — fragile if new overlays added. Fix: ref-based overlay stack (`overlayStackRef`) with `pushOverlay`/`popOverlay` helpers.
**Codex:** Same core idea — only cart and table-confirm push history, but the task's priority list includes checkout/confirmation/orderstatus which only do URL replacement. Fix: assign every overlay/view a unique pushed history state.
**Verdict:** PARTIALLY AGREED on the problem. **DISPUTE on scope** — see Disputes section below.

## CC Only (Codex missed)

### 4. [P2] Cart toggle from StickyCartBar creates duplicate history entries (CC 1.4)
CC notes that rapidly toggling cart open/close pushes entries on each open but never pops on close (because of bug 1.2). After N open/close cycles, user must press Back N times.
**Validity:** Valid but already addressed by fix for item #2 (programmatic close pops history). No separate fix needed.
**Decision:** ACCEPTED as documentation — no separate fix action required (subsumed by item #2).

### 5. [P2] Confirmation screen opens cart without history-aware context (CC 1.5)
When user taps "Open Orders" from confirmation screen, cart opens with pushState. Confirmation itself has no pushState. Back closes cart (correct), but next Back goes to browser history instead of confirmation.
**Validity:** Valid edge case but minor — confirmation is a full view, not an overlay. Stack-based approach from item #3 handles this implicitly.
**Decision:** ACCEPTED as documentation — handled by stack approach from item #3. No separate fix.

## Codex Only (CC missed)

None. All Codex findings map to CC findings.

## Disputes (disagree)

### Dispute 1: Scope of stack — sheets only vs. all views (CC 1.3 vs Codex 3)

**CC position:** Stack covers only overlay sheets (cart drawer, table confirm sheet). These are the actual stacking overlays that cause the Back button ordering bug. Checkout, confirmation, orderstatus are full VIEW transitions that replace the page content — they're not overlapping sheets.

**Codex position:** The task description lists a priority stack: `table code > checkout/confirmation > order status > cart > menu`. Codex argues ALL of these should push unique history states, including the view transitions (checkout, confirmation, orderstatus) which currently only use URL replacement.

**Analysis:**
- The task's SCOPE LOCK says: "Modify ONLY the popstate/history logic and the sheet open/close handlers."
- Checkout/confirmation/orderstatus are VIEW transitions (`view` state changes + `replaceState`), not sheet open/close.
- Expanding to cover all view transitions is a significant scope increase and risks regression in the view navigation logic.
- The core reported bug (PM-105) is specifically about **nested overlapping sheets** (order list + table code input), not about view transitions.
- The task anti-pattern says "Do NOT use a single boolean flag. Use a STACK or ordered priority list of active sheets" — emphasis on "active sheets."

**Verdict:** CC's narrower scope is safer and directly addresses PM-105. Codex's broader scope (all views) would be a separate task. **Use CC's approach: stack for overlay sheets only (cart, tableConfirm).** If Android Back behavior for view transitions needs fixing, that should be a separate bug/task.

## Final Fix Plan

Ordered list of all fixes to apply:

1. **[P1] Introduce ref-based overlay stack** — Source: agreed (CC 1.3 + Codex 3, CC scope) — Add `overlayStackRef`, `pushOverlay()`, `popOverlay()` helpers to track open sheet order. Scope: cart drawer + table confirm sheet only.

2. **[P1] Fix popstate handler to use stack-based close order** — Source: agreed (CC 1.1 + Codex 1) — Replace hardcoded if/else chain with stack pop + switch. Topmost overlay closes first. Add `isPopStateClosingRef` guard.

3. **[P1] Add guarded history.back() to all programmatic sheet closes** — Source: agreed (CC 1.2 + Codex 2) — Every programmatic close (X button, swipe, auto-close, toggle) must call `history.back()` unless triggered by popstate. Guard with `isPopStateClosingRef.current` check. Affected locations:
   - ~Line 2126: `setShowTableConfirmSheet(false)` after verification
   - ~Line 3466: table confirm Drawer `onOpenChange`
   - ~Line 3377: cart Drawer `onOpenChange`
   - ~Line 1474: `setDrawerMode(null)` in `showConfirmation`
   - ~Line 3641: cart toggle off via StickyCartBar

4. **[P1] Replace raw pushState calls with pushOverlay()** — Source: agreed (CC 1.3) — All existing `history.pushState` for sheet opens replaced with `pushOverlay('cart')` / `pushOverlay('tableConfirm')`.

5. **[P2] No separate fix needed for CC 1.4 and 1.5** — Subsumed by fixes 1-4 above.

**Implementation order:** 1 → 4 → 2 → 3 (stack infrastructure first, then migrate pushState calls, then fix handler, then fix close handlers).

## Summary
- Agreed: 3 items (the 3 core P1 findings)
- CC only: 2 items (both P2, both accepted as subsumed — no separate fix)
- Codex only: 0 items
- Disputes: 1 item (scope of stack: sheets-only vs all-views — resolved in favor of CC's narrower scope)
- **Total fixes to apply: 4 action items** (all P1, implementing the ref-based overlay stack pattern)
