# CC Writer Findings — PublicMenu
Chain: publicmenu-260409-145921-5382

## Findings

### Fix 3 — Rewrite drawer JSX

1. **[P3] `pb-safe` is not a standard Tailwind utility class** — The scroll wrapper `<div className="overflow-y-auto flex-1 pb-safe">` uses `pb-safe`. This requires the `tailwindcss-safe-area` plugin (or a custom utility). If the plugin is not installed in the Base44 build pipeline, this class is silently ignored and the scroll area will lack safe-area bottom padding on iPhone X+ devices with a notch/home indicator. FIX: Verify `pb-safe` is available in the project's Tailwind config. If not, replace with `pb-[env(safe-area-inset-bottom)]` or a fixed `pb-6` as a fallback.

2. **[P3] URGENCY_STYLES recreated every render** — The task places `URGENCY_STYLES` as a plain `const` inside the component function (after SOS_BUTTONS). Since it's a static object with zero dependencies, it's recreated on every render. This won't cause bugs (it's used as a lookup, not as a hook dependency), but it's suboptimal. FIX: Move `URGENCY_STYLES` to module scope (outside the component) for zero-cost per render. Note: task explicitly chose component-scope for "code locality" — this is a trade-off, not a bug.

3. **[P2] Cancel confirm panel: `handleResolve(cancelConfirmType)` doesn't pass `otherId`** — In the confirm panel's "Отменить" button handler, `handleResolve(cancelConfirmType)` is called without a second argument. This is correct for the 6 typed buttons (call_waiter, bill, plate, napkins, utensils, clear_table) since `handleResolve` uses `prev[type]` for non-other types. However, if `handleSosCancel` were ever called with `type='other'` in the future, this would silently fail (handleResolve would try to map over `otherRows` with undefined `otherId`, finding nothing). Currently safe because SOS_BUTTONS excludes 'other' and `handleSosCancel` is only called from the 6-button grid. FIX: Add a defensive comment or guard: `// NB: cancel confirm is only for typed buttons, never 'other'`.

4. **[P2] Generic error fallback narrows scope from `ticketRows` to `activeRequests`** — Old code (line 5218): `ticketRows.some((row) => row.errorKind)`. New code: `activeRequests.some(r => r.errorKind)`. Since `activeRequests` is a subset of `ticketRows` (only `isActive` rows), a resolved/closed row with an error would no longer suppress the generic fallback. This is likely intentional for v6.0 (resolved rows shouldn't mask generic errors), but it's a behavioral change worth verifying. FIX: Confirm this is intended behavior. If so, no code change needed.

### Fix 5 — Cleanup removed state, refs, helpers

5. **[P2] `getHelpReminderWord` and `getMinutesAgo` become orphaned dead code** — Fix 5 removes 5 dead helpers (getHelpWaitLabel, getHelpReminderLabel, getHelpResolvedLabel, getHelpErrorCopy, getHelpFreshnessLabel). However, `getHelpReminderWord` (line 2631) and `getMinutesAgo` (line 2635) are ONLY called by `getHelpWaitLabel` and `getHelpReminderLabel` — both being removed. After Fix 5, these 2 `useCallback` hooks have zero call sites but remain in the source. FIX: Also remove `getHelpReminderWord` (line 2631-2633) and `getMinutesAgo` (line 2635-2637), OR keep them with `// SOS v6.0 — kept for hook order` comments if hook order safety is the priority.

6. **[P3] Inconsistent hook order safety strategy** — Fix 5 keeps `isTicketExpanded` and `highlightedTicket` (both `useState`) with "kept for hook order" comments, but removes `HELP_CHIPS` (useMemo, line 1874) and 5 dead helpers (all `useCallback`). Removing hooks permanently from source code is safe in React (hook order only matters within a single code version, not across deployments), so the "hook order safety" rationale is overly cautious. The inconsistency (keep 2 useStates but remove 6 other hooks) is harmless but confusing. FIX: Either keep ALL unused hooks with comments, OR remove all (including isTicketExpanded/highlightedTicket). Prefer removing all — simpler code, no confusion, React handles it correctly on next page load.

7. **[P3] `ticketBoardRef` removal may leave `useRef` import unused** — After removing `ticketBoardRef = useRef(null)` at line 1910, verify that `useRef` is still imported and used elsewhere (pendingQuickSendRef at line 1905, currentTableIdRef at line 1907, hasLoadedHelpStatesRef at line 1901). These other refs keep the import alive, so no action needed. FIX: None — just a verification note.

## Summary
Total: 7 findings (0 P0, 0 P1, 3 P2, 4 P3)

The proposed Fix 3 + Fix 5 implementation is well-structured and thorough. No P0 or P1 issues found. The main substantive finding is #5 (orphaned helpers after cleanup), which is a straightforward omission in the cleanup list. All other findings are minor observations or defensive suggestions.

## Prompt Clarity
- Overall clarity: **5/5**
- Ambiguous Fix descriptions: None. Both Fix 3 and Fix 5 are exceptionally detailed with exact line numbers, step-by-step instructions, verification commands, and boundary markers.
- Missing context: None. Prerequisites, FROZEN UX list, and scope restrictions are comprehensive.
- Scope questions: The only minor ambiguity is whether `getHelpReminderWord`/`getMinutesAgo` are intentionally kept or an oversight in Fix 5's "REMOVE ALL dead helpers" list (finding #5). The task lists 5 helpers by name but doesn't mention these 2 transitive dependencies.
