# Discussion Report — PublicMenu
Chain: publicmenu-260324-190433-30fb

## Disputes Discussed
Total: 2 disputes from Comparator

## Round 1
### Dispute 1: useAndroidBack hook vs. extend existing overlay stack
**CC Position:** Extend the existing `pushOverlay`/`popOverlay`/`handlePopState` centralized system with new cases (`detailDish`, `help`). Creating a separate `useAndroidBack` hook that registers its own `popstate` listeners would conflict with the existing central listener — both would fire on Android Back, causing double-close or wrong-drawer-close bugs. The task's intent (unified behavior, no copy-paste) is fully achieved by extending the existing system. The overlay stack IS the reusable mechanism.

**Codex Position (Round 1):** Codex read the codebase and confirmed all 5 fix findings. Confirmed the overlay stack at x.jsx:1300-1315 and x.jsx:2384-2413 only handles `tableConfirm` and `cart`. Confirmed detail drawer uses `setDetailDish(null)` at x.jsx:3666-3688 without overlay integration, and help uses `isHelpModalOpen` at x.jsx:3615-3630 without overlay integration. Did not directly address the hook vs overlay-extension architectural question in Round 1 (spent time reading code).

**Status:** ongoing → moved to Round 2

### Dispute 2: Priority levels (P1 vs P2)
**CC Position:** On a mobile-first restaurant app where the primary user is a customer at a table using their phone, Android Back not working (Fix 1) and help dialog opening behind cart (Fix 2) are genuinely P1 — they represent broken core UX, not cosmetic issues.

**Codex Position (Round 1):** Original Codex findings rated everything P2-P3. Did not directly address priority dispute in Round 1.

**Status:** ongoing → moved to Round 2

## Round 2

Focused Round 2 with direct questions to Codex.

### Dispute 1: useAndroidBack hook vs. extend existing overlay stack
**CC Position:** Same as Round 1 — extend existing centralized overlay stack.

**Codex Position:** **AGREE with CC.** "Option A. Keep one centralized `popstate` owner and extend the existing overlay stack to handle 4 drawers. Option B is riskier because separate back handlers will compete, and that is exactly how you get double-close, wrong-close, and history desync bugs."

**Status:** RESOLVED — both agree on extending existing overlay stack.

### Dispute 2: Priority levels
**CC Position:** P1 for Android Back issues and help-behind-cart.

**Codex Position:** **AGREE with CC.** "P1. On a mobile restaurant app, Android Back is core navigation. If an open drawer does not close and Back exits the tab/app flow instead, that is incorrect behavior with clear user impact, not just polish."

**Status:** RESOLVED — both agree on P1.

## Resolution Summary
| # | Dispute | Rounds | Resolution | Winner |
|---|---------|--------|------------|--------|
| 1 | useAndroidBack hook vs. extend overlay stack | 2 | resolved | CC (Codex agrees) |
| 2 | Priority levels (P1 vs P2) | 2 | resolved | CC (Codex agrees) |

## Updated Fix Plan
Based on discussion results, the disputed items are now resolved:

1. **[P1] Fix 1 — Extend existing overlay stack (NOT new hook)** — Source: discussion-resolved — Add `pushOverlay('detailDish')` on detail card open, `popOverlay('detailDish')` on close, add `'detailDish'` case in `handlePopState`. Add `pushOverlay('help')` on help open, `popOverlay('help')` on close, add `'help'` case in `handlePopState`. Do NOT create a separate `useAndroidBack` hook — extend the existing centralized `pushOverlay`/`popOverlay`/`handlePopState` system. File: `x.jsx`.

2. **[P1] Priority upgrade** — Source: discussion-resolved — Fix 1 (overlay gaps for detail card + help) and Fix 2 (help behind cart / HelpModal → Drawer) are P1, not P2. Rationale: Android Back is core navigation on mobile, broken behavior = user exits tab instead of closing drawer.

## Unresolved (for Arman)
None — all disputes resolved.
