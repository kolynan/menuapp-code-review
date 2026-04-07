# Merge Report — PublicMenu
Chain: publicmenu-260330-213949-a1d6

## Applied Fixes
1. [P1] Fix 1 — HD-01: Pending state per card — Source: agreed — DONE. Added `requestStates` useState + `HELP_COOLDOWN_SECONDS` constant. Per-card state machine (idle→sending→pending→repeat). Removed global `helpQuickSent`/`sendingCardId`. Removed 2s auto-close and global success screen.
2. [P1] Fix 2 — HD-02: Per-type cooldown — Source: agreed — DONE. Cooldown transitions via 30s interval checking `sentAt` + `HELP_COOLDOWN_SECONDS[type]`. Cards show "Напомнить персоналу" in repeat state. Replaced global `hasActiveRequest` card disabling.
3. [P1] Fix 3 — HD-03: Timer "X мин назад" — Source: agreed — DONE. Added `getRelativeTime()` helper, `timerTick` state for re-renders, 30s `setInterval`, `visibilitychange` listener. Combined with cooldown checks (Fix 2).
4. [P1] Fix 4 — HD-04: "Другое" chips + textarea — Source: agreed — DONE. Quick-action chips array, 100-char textarea with counter, dual buttons (Отмена/Отправить), whitespace guard. Truncated preview in pending state via `message` field in `requestStates.other`.
5. [P2] Fix 5 — HD-05: localStorage persistence — Source: agreed — DONE. Key `helpdrawer_${currentTableId}`. Write on state change (only pending/repeat). Load + filter expired on drawer open (max 240s age). Expired entries transition to repeat.
6. [P2] Fix 6 — HD-06: Undo toast 5s — Source: agreed — DONE. Delayed `handlePresetSelect` call by 5s. Toast with countdown at bottom of drawer. Cancel returns to idle. Single toast at a time. Timer interval drops to 1s while toast visible.
7. [P2] Fix 7 — HD-07: Badge on HelpFab — Source: agreed — DONE. Wrapper `<div className="relative inline-block">` around HelpFab with overlay badge `bg-[#B5543A] text-white rounded-full`. Derived `activeRequestCount` from pending+sending states.
8. [P2] Fix 8 — HD-08: Summary block — Source: agreed — DONE. Derived `pendingRequests` from requestStates. Rendered above 2x2 grid: "Активные запросы: N" + per-type rows with `getRelativeTime()`. `bg-[#F5E6E0]` styling. Only visible when >0.

## Skipped — Unresolved Disputes (for Arman)
None — 0 disputes in comparison.

## Skipped — Could Not Apply
None.

## Git
- Commit: a2b4da6
- Pre-task commit: a2980f0
- Files changed: 2 (x.jsx, BUGS.md)
- Lines: 4002 → 4224 (+222 net, +331/-96 diff)

## FROZEN UX Verification
- pushState/popstate: present (lines 1296-1301)
- ChevronDown close: present (line 3868)
- closeHelpDrawer: 4 references intact
- helpQuickSent: 0 references (fully removed, replaced by requestStates)
- sendingCardId: 0 references (fully removed)
- DrawerContent: no `className="relative"` (KB-096 compliant)

## Prompt Feedback
- CC clarity score: 4/5
- Codex clarity score: 4/5
- Fixes where writers diverged due to unclear description: None — perfect alignment on all 8 fixes.
- Fixes where description was perfect (both writers agreed immediately): All 8.
- Minor ambiguities noted by CC:
  - Fix 1: Spec uses key `waiter` but code uses `call_waiter` — resolved by using code's IDs.
  - Fix 6: Interaction with `handlePresetSelect → useEffect → submitHelpRequest` chain not addressed in spec.
  - Fix 7: Spec says "search for bell button" but HelpFab is the actual trigger (PM-156 removed floating bell).
- Recommendation: For complex state machine features, include a brief note about how the existing hook chain (handlePresetSelect → useEffect → submitHelpRequest) works so writers can integrate cleanly without reverse-engineering.

## Summary
- Applied: 8 fixes (4 P1, 4 P2)
- Skipped (unresolved): 0 disputes
- Skipped (other): 0 fixes
- MUST-FIX not applied: 0
- Commit: a2b4da6
