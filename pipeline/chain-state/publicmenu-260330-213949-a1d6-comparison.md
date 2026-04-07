# Comparison Report — PublicMenu
Chain: publicmenu-260330-213949-a1d6

## Agreed (both found)

All 8 fixes were identified by both CC and Codex with matching priorities and aligned root-cause analysis:

### 1. Fix 1 — HD-01 (P1): Pending state per request card
**Both agree:** Current `helpQuickSent` / `sendingCardId` is a global binary — needs replacement with per-card `requestStates` object (idle→sending→pending→repeat→resolved). Both identify the auto-close after 2s (line ~1696) and the full-screen success swap (lines 3755–3760) as the elements to remove/replace.
**CC adds:** Specific line references for card IDs (`call_waiter`, `bill`, `napkins`, `menu` at lines 3764–3768) noting spec says `waiter` but code uses `call_waiter`. Detailed rendering per-state.
**Codex adds:** Explicitly calls out that `sendingCardId` and `helpQuickSent` must be removed (lines 1647–1651).
**Resolution:** Fully agreed. Use code's `call_waiter` ID (not `waiter`). Remove global success screen + auto-close.

### 2. Fix 2 — HD-02 (P1): Per-type cooldown
**Both agree:** Global `hasActiveRequest` disabling all cards (line 3773) must be replaced with per-card cooldown derived from `requestStates[type].sentAt` + `HELP_COOLDOWN_SECONDS[type]`. Transition `pending→repeat` shows "Напомнить персоналу".
**CC adds:** Suggestion to keep `hasActiveRequest` banner for server-side state if it differs from local state.
**Codex adds:** Notes the exact global condition `!!sendingCardId || hasActiveRequest` that blocks all cards.
**Resolution:** Fully agreed. Keep server-side `hasActiveRequest` only if it provides different info.

### 3. Fix 3 — HD-03 (P1): Timer "X мин назад"
**Both agree:** No timer exists. Add `getRelativeTime(sentAtMs)` helper, 30s `setInterval`, `visibilitychange` handler.
**CC adds:** Concrete code for `timerTick` state to force re-renders, and combining cooldown checks with timer interval.
**Codex adds:** Notes the only help text is static (lines 3755–3760).
**Resolution:** Fully agreed. Combine cooldown transition check with timer interval (CC's optimization is good).

### 4. Fix 4 — HD-04 (P1): "Другое" → chips + textarea
**Both agree:** Current `showOtherForm` is minimal (lines 3785–3804). Missing: quick-action chips, 100-char limit/counter, "Отмена" button, whitespace guard, truncated pending preview.
**CC adds:** Concrete chip rendering code, character counter JSX, dual-button layout, truncated preview logic `helpComment.slice(0, 30)`, rename suggestion `showOtherForm → otherExpanded`.
**Codex adds:** Explicit mention of `otherExpanded`/`otherDraft` state names, whitespace-only guard.
**Resolution:** Fully agreed. Use chip array `['Детский стул', 'Приборы', 'Соус', 'Убрать со стола', 'Вода']`. Keep or rename `showOtherForm`.

### 5. Fix 5 — HD-05 (P2): localStorage persistence
**Both agree:** No localStorage for help state. `openHelpDrawer`/`closeHelpDrawer` reset state (lines 1661–1676). Key: `helpdrawer_${currentTableId}`. Filter entries older than 240s on load. Do NOT persist `otherDraft`.
**CC adds:** Detailed load/filter code including cooldown-to-repeat transition on load. Clear on `currentTableId` change.
**Codex adds:** Notes explicit state clearing in open/close handlers and server-send failure clearing.
**Resolution:** Fully agreed. CC's load+filter code is comprehensive — use it.

### 6. Fix 6 — HD-06 (P2): Undo toast 5s
**Both agree:** No undo mechanism. `handleQuickSend → handlePresetSelect → submitHelpRequest` fires immediately. Need `undoToast` state, 5s delay, countdown, cancel back to idle.
**CC adds:** Detailed architecture analysis of the `handlePresetSelect → useEffect → submitHelpRequest` chain (line 1687). Two approaches: (a) delay `handlePresetSelect` call, (b) refactor to direct server call. Recommends (a). Provides complete `handleCardTap` and `handleUndo` code with `timeoutId` tracking. 1s countdown interval.
**Codex adds:** Identifies the exact flow at lines 1679–1705.
**Resolution:** Fully agreed. CC's approach (a) — delay `handlePresetSelect` — is the right minimal-change strategy.

### 7. Fix 7 — HD-07 (P2): Badge on Help button
**Both agree:** HelpFab (imported component at line 97) renders at line 3716 with no `activeRequestCount` prop. Need to derive count from `requestStates` and display badge.
**CC adds:** Since HelpFab is external, proposes wrapper `<div className="relative">` with overlay badge. Notes PM-156 removed floating bell — HelpFab only renders in hall mode. Caution about `fixed` positioning.
**Codex adds:** Suggests lifting state high enough for count derivation.
**Resolution:** Fully agreed. CC's wrapper approach is correct since HelpFab is an imported component we cannot modify. State is already in the same component scope — no actual lifting needed.

### 8. Fix 8 — HD-08 (P2): Summary block at top of drawer
**Both agree:** Current `hasActiveRequest` banner (lines 3748–3752) is a single generic line. Replace/augment with `pendingRequests` list showing type + relative time, rendered above the 2×2 grid.
**CC adds:** `getCardLabel` helper with `HELP_CARD_LABELS` mapping. Styling: `bg-[#F5E6E0] text-slate-700 text-sm rounded-lg p-3`.
**Codex adds:** Notes it should show total count + itemized rows.
**Resolution:** Fully agreed. Use CC's detailed rendering approach.

## CC Only (Codex missed)

None — all findings matched.

## Codex Only (CC missed)

None — all findings matched.

## Disputes (disagree)

**No disputes.** Both reviewers found the same 8 issues with the same priorities and compatible solutions.

Minor implementation differences (not disputes):
- **Card ID key name:** CC explicitly flags `call_waiter` vs spec's `waiter` — Codex doesn't address this. **Use `call_waiter`** (matches code).
- **`hasActiveRequest` banner:** CC considers keeping it alongside new summary for server-side state info. Codex doesn't address this. **Replace with new summary** — if server-side state is needed, it can be incorporated into the summary block.
- **Fix 7 implementation:** CC proposes wrapper div overlay; Codex says "lift state." State doesn't need lifting (same scope), and wrapper overlay is the only viable approach for an external component. **Use CC's wrapper approach.**

## Final Fix Plan

Ordered list of all fixes to apply:

1. **[P1] Fix 1 — HD-01: Pending state per card** — Source: AGREED — Add `requestStates` useState + `HELP_COOLDOWN_SECONDS` const. Replace `helpQuickSent`/`sendingCardId` with per-card state machine. Remove global success screen + 2s auto-close. Card renders: idle/sending/pending/repeat states with appropriate icons, text, background.

2. **[P1] Fix 2 — HD-02: Per-type cooldown** — Source: AGREED — Use `requestStates[type].sentAt` + `HELP_COOLDOWN_SECONDS[type]` to transition `pending→repeat`. Replace global `hasActiveRequest` card disabling with per-card disabled logic. `repeat` state shows "Напомнить персоналу".

3. **[P1] Fix 3 — HD-03: Timer "X мин назад"** — Source: AGREED — Add `getRelativeTime(sentAtMs)` helper. 30s `setInterval` + `visibilitychange` listener for updates. Combine cooldown checks with timer tick. Show subline on pending cards.

4. **[P1] Fix 4 — HD-04: "Другое" chips + textarea** — Source: AGREED — Quick-action chips array, 100-char textarea with counter, "Отмена" + "Отправить →" buttons, whitespace guard, truncated pending preview in card.

5. **[P2] Fix 5 — HD-05: localStorage persistence** — Source: AGREED — Key `helpdrawer_${currentTableId}`. Write on state change, load+filter on mount (max 240s age, transition expired to `repeat`). Clear on tableId change. Do NOT persist `otherDraft`.

6. **[P2] Fix 6 — HD-06: Undo toast 5s** — Source: AGREED — Delay `handlePresetSelect` call by 5s. Show toast with countdown. Cancel returns to idle. Single toast at a time. Track `timeoutId` for cleanup.

7. **[P2] Fix 7 — HD-07: Badge on Help button** — Source: AGREED — Derive `activeRequestCount` from `requestStates`. Wrap HelpFab in `<div className="relative">` with overlay badge `bg-[#B5543A] text-white rounded-full`.

8. **[P2] Fix 8 — HD-08: Summary block** — Source: AGREED — Derive `pendingRequests` list from `requestStates`. Render above 2×2 grid: "Активные запросы: N" + per-type rows with `getRelativeTime()`. Use `bg-[#F5E6E0]` styling. Show only when > 0.

## Summary
- Agreed: 8 items
- CC only: 0 items (0 accepted, 0 rejected)
- Codex only: 0 items (0 accepted, 0 rejected)
- Disputes: 0 items
- Total fixes to apply: 8
