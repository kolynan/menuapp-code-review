# Discussion Report — PublicMenu
Chain: publicmenu-260413-173504-b1a1
Mode: CC-Only (v2)

## Disputes Analyzed
Total: 1 dispute from Comparator

### Dispute 1: Fix 3 (#286) implementation approach — useEffect vs. direct callback modification

**CC Solution:** Modify `closeHelpDrawer` directly to save draft BEFORE clearing state (`setShowOtherForm(false); setHelpComment('')`). Modify `openHelpDrawer` to restore draft after opening. Rationale: a `useEffect` watching `isHelpModalOpen` fires after the re-render where React has already batched all state updates — by that point `showOtherForm` is `false` and `helpComment` is `''`, so the draft text is lost.

**Codex Solution:** Add a `useEffect` watching `isHelpModalOpen` for save/restore logic. Standard React pattern for side effects tied to state changes.

**CC Analysis:**

I verified the actual code at x.jsx lines 2370–2377. The `closeHelpDrawer` callback executes:
```
popOverlay('help');
setIsHelpModalOpen(false);
setIsTicketExpanded(false);
setShowOtherForm(false);
setHelpComment('');
setCancelConfirmType(null);
```

All six state setters run synchronously within one callback. React 18's automatic batching combines them into a single re-render. When a `useEffect([isHelpModalOpen])` fires, it runs AFTER that re-render — at which point `showOtherForm` is already `false` and `helpComment` is already `''`. The effect cannot read the pre-close values of these states.

CC's approach saves the draft inside `closeHelpDrawer` before the state setters clear the values. This guarantees access to the current `showOtherForm` and `helpComment` values via the callback closure.

For the restore path in `openHelpDrawer`, both approaches would work equally well since the restore reads from localStorage (not from state). However, placing restore logic inside `openHelpDrawer` keeps the save/restore pair co-located and symmetric, which is cleaner.

**Edge cases considered:**
- The `useCallback` dependency arrays for `closeHelpDrawer` and `openHelpDrawer` will need updating to include `showOtherForm`, `helpComment`, `currentTableId`, and `activeRequests` respectively. CC's findings include these updated dependency arrays.
- The direct modification approach is a slightly larger diff to the existing callbacks, but it's the only correct approach given React 18 batching.

**Verdict:** CC

**Reasoning:** Codex's useEffect approach has a confirmed React 18 state batching race condition — `helpComment` and `showOtherForm` are cleared before the effect fires, making draft save impossible. CC's direct callback modification is the only correct approach for this specific code structure.

## Resolution Summary
| # | Dispute | Verdict | Reasoning |
|---|---------|---------|-----------|
| 1 | Fix 3 implementation approach | CC | useEffect race condition with React 18 batching — draft values cleared before effect fires |

## Updated Fix Plan
Based on discussion results, provide the UPDATED fix plan for disputed items only.
Agreed items from Comparator remain unchanged.

1. **[P3] Fix 3 — #286: Draft save/restore** — Source: discussion-resolved (CC approach) — Modify `closeHelpDrawer` to save `helpComment` to `localStorage('sos_draft_' + currentTableId)` BEFORE calling state setters. Modify `openHelpDrawer` to restore draft from localStorage after early-return guard, before `setIsHelpModalOpen(true)`. Add `localStorage.removeItem` to Cancel button onClick and Send success path. All localStorage access wrapped in `try/catch` (KB-033). Updated `useCallback` dependency arrays: `closeHelpDrawer` adds `[showOtherForm, helpComment, currentTableId]`, `openHelpDrawer` adds `[activeRequests]`.

## Skipped (for Arman)
None. The single dispute was resolved technically.
