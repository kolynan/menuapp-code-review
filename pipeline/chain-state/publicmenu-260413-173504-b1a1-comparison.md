# Comparison Report — PublicMenu
Chain: publicmenu-260413-173504-b1a1

## Agreed (both found)

### 1. Fix 1 — #285 (P2): Disabled "Другой запрос?" link instead of hidden
Both CC and Codex agree:
- Keep `!showOtherForm` hide rule (hide link when textarea is open)
- Always render the link when form is closed, but switch to disabled visual when active 'other' request exists
- Disabled visual: `text-gray-300`, no underline, `cursor-default`, no hover
- Add helper text `tr('help.other_only_one', ...)` below disabled link
- Add `help.other_only_one` key to both EN and RU translation objects
- Button must NOT use `disabled` HTML attribute (remain tappable)

**Approach agreement:** Full. CC provides complete JSX patch using IIFE pattern inside JSX. Codex describes the same approach without full code. No disagreement on implementation.

### 2. Fix 2a — #284 (P2): Stale timer display in `getHelpTimerStr`
Both CC and Codex agree:
- Add early return in `getHelpTimerStr` for `elapsedSec >= 24 * 60 * 60`
- Return `tr('help.stale_status', 'Данные могли устареть')`
- Insert before existing `< 60` check
- `help.stale_status` key already exists in both translation objects

**Approach agreement:** Full. Identical fix proposed by both.

### 3. Fix 2b — #284 (P2): Auto-resolve useEffect for 24h+ stale requests
Both CC and Codex agree:
- Add `useEffect` that runs on `timerTick` dependency
- Scan `activeRequests` / `requestStates` for rows where `Date.now() - sentAt > 24h`
- Call local `handleResolve(type, id)` for each stale row
- No new polling interval, no backend API call
- Guard against already-resolved items

**Approach agreement:** Full. CC provides detailed code with guards for `closed_by_guest` and `terminalHideAt`. Codex describes the same logic. CC's code is more complete.

### 4. Fix 3 — #286 (P3): Draft save/restore + cleanup paths
Both CC and Codex agree on WHAT is needed:
- Save `helpComment` to `localStorage` keyed by `'sos_draft_' + currentTableId` on drawer close
- Restore from `localStorage` on drawer open (if no active 'other' request)
- Clear localStorage on explicit Cancel click and on successful Send
- All localStorage access wrapped in `try/catch` (KB-033)
- Do NOT restore if active 'other' request exists

Both CC and Codex agree on cleanup paths:
- Cancel button: add `localStorage.removeItem('sos_draft_' + currentTableId)`
- Send success path: add `localStorage.removeItem('sos_draft_' + currentTableId)`

### 5. Fix 4 — #232 (P2): HelpFab move from right to left
Both CC and Codex agree:
- `right-4` → `left-4`, `md:right-8` → `md:left-8`
- Only change in HelpFab.jsx, no other modifications
- Trivial CSS class swap

**Approach agreement:** Full. Identical fix.

## CC Only (Codex missed)

None. Both reviewers found the same set of issues.

## Codex Only (CC missed)

None. Codex split Fix 3 into two items (#4 save/restore + #5 cleanup paths) while CC covered both in one finding. No net difference in coverage.

## Disputes (disagree)

### Dispute 1: Fix 3 implementation approach — useEffect vs. direct callback modification

**Codex recommends:** `useEffect` watching `isHelpModalOpen` for save/restore logic.

**CC recommends:** Modifying `closeHelpDrawer` and `openHelpDrawer` callbacks directly (save draft inside `closeHelpDrawer` before clearing state, restore inside `openHelpDrawer` before setting state). CC explicitly warns that the useEffect approach has a **React state batching race condition** — by the time the effect fires, `showOtherForm` and `helpComment` may already be reset to `false` / `''` by the close callback, making it impossible to read the draft text.

**Analysis:**
CC's reasoning is correct. In React 18+ with automatic batching, `closeHelpDrawer` calls:
1. `setIsHelpModalOpen(false)` 
2. `setShowOtherForm(false)`
3. `setHelpComment('')`

All three updates are batched into a single re-render. When the `useEffect` for `isHelpModalOpen` fires, the component has already re-rendered with `showOtherForm === false` and `helpComment === ''`. The draft text is gone before the effect can save it.

**Decision:** CC's approach (direct callback modification) is superior. **Accept CC's approach.**

## Final Fix Plan

Ordered list of all fixes to apply, with priority and source:

1. **[P2] Fix 1 — #285: Disabled "Другой запрос?" link** — Source: agreed — Replace hide condition with always-render + disabled visual state. Add `help.other_only_one` i18n key to EN and RU. Use CC's IIFE JSX pattern.

2. **[P2] Fix 2a — #284: Stale timer display** — Source: agreed — Add early return in `getHelpTimerStr` for `elapsedSec >= 86400` returning `tr('help.stale_status', ...)`.

3. **[P2] Fix 2b — #284: Auto-resolve stale requests** — Source: agreed — Add `useEffect` on `timerTick` scanning `requestStates` for 24h+ rows, calling `handleResolve`. Use CC's code with guards for `closed_by_guest` and `terminalHideAt`.

4. **[P3] Fix 3 — #286: Draft save/restore** — Source: agreed (CC approach preferred) — Modify `closeHelpDrawer` to save draft before clearing. Modify `openHelpDrawer` to restore draft on open. Add `localStorage.removeItem` to Cancel and Send paths. All localStorage access in `try/catch`.

5. **[P2] Fix 4 — #232: HelpFab left-side position** — Source: agreed — `right-4` → `left-4`, `md:right-8` → `md:left-8` in HelpFab.jsx only.

## Summary
- Agreed: 5 items (all 5 accepted)
- CC only: 0 items
- Codex only: 0 items (structural split only, no new content)
- Disputes: 1 item (Fix 3 approach — resolved in favor of CC's direct callback modification)
- **Total fixes to apply: 5** (across 2 files: x.jsx + HelpFab.jsx)
