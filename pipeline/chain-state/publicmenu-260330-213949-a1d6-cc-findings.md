# CC Writer Findings — PublicMenu
Chain: publicmenu-260330-213949-a1d6

## Findings

### Fix 1 — HD-01 (P1): Pending state for each request card

**Current state:** Lines 3754–3810. The Help Drawer currently uses a simple boolean `helpQuickSent` (line 1648) and `sendingCardId` (line 1649) for feedback. After tapping a card, `handleQuickSend` (line 1680) sets `sendingCardId` and calls `handlePresetSelect` → `submitHelpRequest`. On success, `helpQuickSent` flips to `true` showing a single global "Запрос отправлен!" screen (lines 3756–3759) with a green CheckCircle2 — and auto-closes the drawer after 2 seconds (line 1696). There is NO per-card state, no idle/sending/pending/repeat/resolved model, no `requestStates` object.

**Finding:** [P1] No per-card request state — all cards share one binary `helpQuickSent`. Only one request can be sent before the entire drawer collapses to a success screen, preventing multi-card requests in a single drawer session.

**FIX:**
1. Add `requestStates` useState object and `HELP_COOLDOWN_SECONDS` constant near line 1648 (alongside existing help state):
```js
const [requestStates, setRequestStates] = useState({});
// Structure: { waiter: { status: 'idle'|'sending'|'pending'|'repeat'|'resolved', sentAt: timestamp }, ... }

const HELP_COOLDOWN_SECONDS = { call_waiter: 90, bill: 150, napkins: 240, menu: 240, other: 120 };
```
Note: card IDs in current code are `call_waiter`, `bill`, `napkins`, `menu` (line 3764–3768) — use these as keys, NOT `waiter`.

2. Replace `handleQuickSend` (line 1680) to update `requestStates[type].status = 'sending'` instead of using `sendingCardId`. On success, set `status = 'pending', sentAt = Date.now()` instead of `helpQuickSent = true`. Remove the 2-second auto-close (line 1696) — drawer should stay open for multi-request use.

3. In card rendering (lines 3770–3783): conditionally render based on `requestStates[card.id]?.status`:
   - `idle` (or undefined): current look (emoji + label)
   - `sending`: Loader2 spinner + "Отправляем..." text
   - `pending`: Check icon (not CheckCircle2 green) + "Запрос отправлен" + timer subline + `bg-[#F5E6E0]` background + disabled
   - Card `disabled` when status is `sending` or `pending` (NOT globally disabled when any card is sending)

4. Remove the global success screen (lines 3755–3760) — instead each card independently shows its state.

5. Keep existing `helpQuickSent` / `sendingCardId` state variables temporarily for backward compatibility or remove them entirely (cleaner). Recommend removal since `requestStates` replaces both.

---

### Fix 2 — HD-02 (P1): Per-type cooldown

**Current state:** No cooldown mechanism exists. `hasActiveRequest` (line 1641, from useHelpRequests hook) is a single boolean — it shows a blue banner (lines 3748–3752) and disables ALL cards (line 3773 `disabled={!!sendingCardId || hasActiveRequest}`). This is a global lock, not per-type.

**Finding:** [P1] Global `hasActiveRequest` disables all cards when ANY request is active. No per-type cooldown logic exists.

**FIX:**
1. Add a `useEffect` or `setInterval` (combine with Fix 3 timer) that checks each entry in `requestStates`: if `Date.now() - sentAt > HELP_COOLDOWN_SECONDS[type] * 1000` → transition status from `pending` to `repeat`.

2. In `repeat` state, card renders: original emoji/icon + text "Напомнить персоналу" (not the idle label). Card is enabled for tap.

3. Tapping a `repeat` card → `sending` → `pending` (same flow as idle tap, but sentAt resets).

4. Remove `hasActiveRequest` from card `disabled` condition (line 3773). Instead, each card's disabled state is determined by its own `requestStates[card.id]?.status === 'sending' || requestStates[card.id]?.status === 'pending'`.

5. The `hasActiveRequest` banner (lines 3748–3752) can be kept for server-side active request indication, or removed in favor of the per-card visual states. Recommend keeping it only if useHelpRequests provides server-side info that differs from local state.

---

### Fix 3 — HD-03 (P1): Timer "X мин назад" on pending cards

**Current state:** No timer exists on any card.

**Finding:** [P1] No time indication after request is sent — guest has no idea how long they've been waiting.

**FIX:**
1. Add helper function (module-level or inside component):
```js
function getRelativeTime(sentAtMs) {
  const seconds = Math.floor((Date.now() - sentAtMs) / 1000);
  if (seconds < 60) return 'Только что';
  return `${Math.floor(seconds / 60)} мин назад`;
}
```

2. Add `useEffect` with `setInterval` every 30 seconds to force re-render for timer updates:
```js
const [timerTick, setTimerTick] = useState(0);
useEffect(() => {
  const hasPending = Object.values(requestStates).some(s => s.status === 'pending');
  if (!hasPending) return;
  const interval = setInterval(() => setTimerTick(t => t + 1), 30000);
  return () => clearInterval(interval);
}, [requestStates]);
```

3. Add `visibilitychange` listener to recalculate on tab return:
```js
useEffect(() => {
  const handler = () => { if (!document.hidden) setTimerTick(t => t + 1); };
  document.addEventListener('visibilitychange', handler);
  return () => document.removeEventListener('visibilitychange', handler);
}, []);
```

4. In pending card render, show subline: `<span className="text-xs text-slate-500">{getRelativeTime(requestStates[card.id].sentAt)}</span>`

5. Combine the cooldown transition check (Fix 2) inside the same 30s interval — when checking timers, also check if any pending card has exceeded its cooldown → transition to `repeat`.

---

### Fix 4 — HD-04 (P1): "Другое" button → textarea with quick-action chips

**Current state:** Lines 3785–3804. "Другое" button toggles `showOtherForm` which reveals a plain textarea (line 3797). No quick-action chips. Textarea placeholder: "Расскажите, что случилось..." (line 3801). A sticky submit button appears below (lines 3813–3825). The "Другое" button also calls `handlePresetSelect('other')` (line 3786).

**Finding:** [P1] No quick-action chips above textarea. Textarea has no character limit/counter. No truncated preview in pending state. Missing "Отмена" button in the form.

**FIX:**
1. Add quick-action chips above textarea (inside the `showOtherForm` block, before textarea):
```jsx
const HELP_CHIPS = ['Детский стул', 'Приборы', 'Соус', 'Убрать со стола', 'Вода'];

// Render:
<div className="flex flex-wrap gap-2">
  {HELP_CHIPS.map(chip => (
    <button
      key={chip}
      onClick={() => setHelpComment(prev => prev ? `${prev}, ${chip.toLowerCase()}` : chip)}
      className="px-3 py-1.5 rounded-full border border-slate-200 bg-white text-sm text-slate-700 active:bg-slate-100"
    >
      {chip}
    </button>
  ))}
</div>
```

2. Add `maxLength={100}` to textarea and show character counter:
```jsx
<div className="text-right text-xs text-slate-400">{helpComment.length} / 100</div>
```

3. Update placeholder to: `t('help.comment_placeholder_other', 'Например: детский стул, приборы, убрать со стола')`

4. Replace the sticky submit area (lines 3813–3825) to include both "Отмена" and "Отправить →":
```jsx
<div className="flex gap-3">
  <Button variant="outline" className="flex-1 min-h-[44px]" onClick={() => { setShowOtherForm(false); setHelpComment(''); }}>
    {t('common.cancel', 'Отмена')}
  </Button>
  <Button className="flex-1 min-h-[44px] text-white" style={{ backgroundColor: primaryColor }} ...>
    {t('help.submit_arrow', 'Отправить →')}
  </Button>
</div>
```

5. After "Другое" submit succeeds, the "Другое" card should show pending state with truncated preview: `"✓ \"${helpComment.slice(0, 30)}${helpComment.length > 30 ? '...' : ''}\" · ${getRelativeTime(sentAt)}"`. Store the `message` in `requestStates.other`.

6. Rename `showOtherForm` to `otherExpanded` per spec (or keep — functionally identical). Use `helpComment` (already exists) as `otherDraft`. Do NOT persist `otherDraft` to localStorage.

---

### Fix 5 — HD-05 (P2): Persist requestStates in localStorage

**Current state:** No localStorage persistence for help request states. Closing drawer loses all state — the 2s auto-close (line 1696) means state is always ephemeral.

**Finding:** [P2] requestStates lost on drawer close/reopen. Guest has no memory of active requests after navigating away.

**FIX:**
1. Use `currentTableId` (line 1626) for localStorage key: `helpdrawer_${currentTableId}`

2. On `requestStates` change → save to localStorage:
```js
useEffect(() => {
  if (!currentTableId) return;
  const key = `helpdrawer_${currentTableId}`;
  if (Object.keys(requestStates).length === 0) {
    localStorage.removeItem(key);
  } else {
    localStorage.setItem(key, JSON.stringify(requestStates));
  }
}, [requestStates, currentTableId]);
```

3. On component mount / currentTableId change → load + filter expired:
```js
useEffect(() => {
  if (!currentTableId) return;
  try {
    const stored = JSON.parse(localStorage.getItem(`helpdrawer_${currentTableId}`) || '{}');
    const maxCooldown = Math.max(...Object.values(HELP_COOLDOWN_SECONDS)) * 1000; // 240s
    const now = Date.now();
    const filtered = {};
    for (const [type, state] of Object.entries(stored)) {
      if (state.sentAt && (now - state.sentAt) < maxCooldown) {
        // Check if cooldown expired → set to repeat
        const cooldownMs = (HELP_COOLDOWN_SECONDS[type] || 120) * 1000;
        filtered[type] = {
          ...state,
          status: (now - state.sentAt) >= cooldownMs ? 'repeat' : state.status
        };
      }
    }
    if (Object.keys(filtered).length > 0) setRequestStates(filtered);
  } catch (e) { /* ignore corrupt localStorage */ }
}, [currentTableId]);
```

4. Important: do NOT write `otherDraft` / `helpComment` to localStorage — only `requestStates`.

---

### Fix 6 — HD-06 (P2): Undo toast for 5 seconds after tap

**Current state:** No undo mechanism. Request fires immediately on card tap via `handleQuickSend` → `handlePresetSelect` → `submitHelpRequest` (lines 1680–1705). The submit is synchronous with the UI transition.

**Finding:** [P2] No undo for accidental taps — especially risky for "Счёт" (bill request is consequential).

**FIX:**
1. Add state: `const [undoToast, setUndoToast] = useState(null); // { type, expiresAt, timeoutId }`

2. Restructure card tap flow: instead of immediately calling `submitHelpRequest`, first show undo toast:
```js
const handleCardTap = useCallback((type) => {
  // Cancel previous undo if any
  if (undoToast?.timeoutId) clearTimeout(undoToast.timeoutId);

  // Set card to sending visually
  setRequestStates(prev => ({ ...prev, [type]: { status: 'sending', sentAt: Date.now() } }));

  // Schedule actual send after 5s
  const timeoutId = setTimeout(() => {
    // Actually send to server
    handlePresetSelect(type);
    // ... trigger submitHelpRequest
    setRequestStates(prev => ({ ...prev, [type]: { ...prev[type], status: 'pending' } }));
    setUndoToast(null);
  }, 5000);

  setUndoToast({ type, expiresAt: Date.now() + 5000, timeoutId });
}, [handlePresetSelect, undoToast]);
```

3. Undo handler:
```js
const handleUndo = useCallback(() => {
  if (!undoToast) return;
  clearTimeout(undoToast.timeoutId);
  setRequestStates(prev => {
    const next = { ...prev };
    delete next[undoToast.type];
    return next;
  });
  setUndoToast(null);
}, [undoToast]);
```

4. Render toast at bottom of drawer (inside the scrollable area or as a fixed footer):
```jsx
{undoToast && (
  <div className="mx-4 mb-2 rounded-lg bg-slate-800 text-white px-4 py-3 flex items-center justify-between text-sm">
    <span>{cardLabel} {t('help.sent_suffix', 'отправлено')}</span>
    <button onClick={handleUndo} className="text-amber-300 font-medium ml-2">
      {t('help.undo', 'Отменить')} ({Math.max(0, Math.ceil((undoToast.expiresAt - Date.now()) / 1000))})
    </button>
  </div>
)}
```

5. Add countdown timer for toast (re-render every 1s while toast visible):
```js
useEffect(() => {
  if (!undoToast) return;
  const interval = setInterval(() => setTimerTick(t => t + 1), 1000);
  return () => clearInterval(interval);
}, [undoToast]);
```

6. Only 1 toast at a time — new tap replaces (cancels) previous undo.

**Important architectural note:** The current flow `handleQuickSend → handlePresetSelect → submitHelpRequest` is tightly coupled — `handlePresetSelect` sets `selectedHelpType` state, and a useEffect (line 1687) watches for it to auto-call `submitHelpRequest`. For undo, the actual server call must be DELAYED 5s. Two approaches:
- (a) Keep current flow but delay calling `handlePresetSelect` until after 5s timeout. During undo window, card shows `sending` state visually but no server call yet.
- (b) Refactor to call server directly bypassing the preset→effect chain.

Recommend (a) — minimal change to existing hook interaction. The `sending` state during 5s undo window is visually appropriate (not yet confirmed).

---

### Fix 7 — HD-07 (P2): Badge on Help button showing active request count

**Current state:** HelpFab component (imported line 97 from `@/components/publicMenu/HelpFab`) renders at line 3716. It receives props: `fabSuccess`, `isSendingHelp`, `isHelpModalOpen`, `onOpen`, `t`. No `requestStates` or active count is passed.

**Finding:** [P2] HelpFab has no awareness of active request count — no badge shown.

**FIX:**
1. Derive `activeRequestCount`:
```js
const activeRequestCount = Object.values(requestStates).filter(s => s.status === 'pending' || s.status === 'sending').length;
```

2. Pass to HelpFab:
```jsx
<HelpFab
  fabSuccess={fabSuccess}
  isSendingHelp={isSendingHelp}
  isHelpModalOpen={isHelpModalOpen}
  onOpen={openHelpDrawer}
  t={t}
  activeRequestCount={activeRequestCount}
/>
```

3. **Problem:** HelpFab is an imported component (`@/components/publicMenu/HelpFab`) — we cannot modify it directly in x.jsx. Two options:
   - (a) If HelpFab already accepts/renders extra props → pass count and it shows badge.
   - (b) If HelpFab doesn't support badge → wrap the HelpFab render with a relative container and overlay a badge:
```jsx
<div className="relative">
  <HelpFab ... />
  {activeRequestCount > 0 && (
    <span className="absolute -top-1 -right-1 bg-[#B5543A] text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-medium pointer-events-none">
      {activeRequestCount}
    </span>
  )}
</div>
```

Recommend (b) since we can only modify x.jsx and HelpFab is an external component. The wrapper `div` with `relative` positioning overlays the badge on the fab button. Ensure wrapper doesn't break HelpFab's `fixed` positioning if it uses one — may need `className="fixed bottom-4 right-4 z-50"` on the wrapper instead.

**Note:** Check line 3943 — "PM-156: Floating bell removed — bell accessible via CartView header + help drawer". The HelpFab renders only in hall mode when table is verified (line 3715). The badge approach must work with this conditional.

---

### Fix 8 — HD-08 (P2): Active requests summary block at top of drawer

**Current state:** Lines 3748–3752 show a simple `hasActiveRequest` banner ("У вас уже есть активный запрос") — single boolean, no list of requests, no timers.

**Finding:** [P2] No multi-request summary. Reopening drawer with active requests shows only a generic banner, not which requests are pending.

**FIX:**
1. Derive pending requests list:
```js
const pendingRequests = Object.entries(requestStates)
  .filter(([_, s]) => s.status === 'pending')
  .map(([type, s]) => ({ type, sentAt: s.sentAt }));
```

2. Replace the `hasActiveRequest` banner (lines 3748–3752) with a richer summary when `pendingRequests.length > 0`:
```jsx
{pendingRequests.length > 0 && (
  <div className="bg-[#F5E6E0] text-slate-700 text-sm rounded-lg p-3 space-y-1">
    <div className="font-medium">{t('help.active_requests', 'Активные запросы')}: {pendingRequests.length}</div>
    {pendingRequests.map(({ type, sentAt }) => (
      <div key={type} className="text-slate-600">
        {getCardLabel(type)} · {getRelativeTime(sentAt)}
      </div>
    ))}
  </div>
)}
```

3. Add `getCardLabel` helper mapping card IDs to display names:
```js
const HELP_CARD_LABELS = {
  call_waiter: 'Позвать официанта',
  bill: 'Принести счёт',
  napkins: 'Салфетки',
  menu: 'Бумажное меню',
  other: 'Другое',
};
function getCardLabel(type) { return t(`help.${type === 'call_waiter' ? 'call_waiter' : type}`, HELP_CARD_LABELS[type] || type); }
```

4. Show summary ABOVE the 2x2 card grid (line 3747 area), NOT replacing the grid.

5. Keep the server-side `hasActiveRequest` banner as a SEPARATE indicator if it provides different info than local `requestStates`. If they overlap, replace entirely with the new summary.

---

## Summary
Total: 8 findings (0 P0, 4 P1, 4 P2, 0 P3)

- Fix 1 (HD-01, P1): Add `requestStates` object + per-card state machine (idle→sending→pending→repeat→resolved). Replace global `helpQuickSent`.
- Fix 2 (HD-02, P1): Per-type cooldown using `HELP_COOLDOWN_SECONDS`. Transition `pending→repeat` after timeout.
- Fix 3 (HD-03, P1): Timer "X мин назад" via `getRelativeTime()` + 30s setInterval + visibilitychange.
- Fix 4 (HD-04, P1): Quick-action chips + textarea with 100-char limit + counter + Отмена/Отправить buttons.
- Fix 5 (HD-05, P2): localStorage persistence keyed by `helpdrawer_${currentTableId}`, filter expired on load.
- Fix 6 (HD-06, P2): 5s undo toast — delay server call, countdown, single toast at a time.
- Fix 7 (HD-07, P2): Badge on HelpFab via wrapper div overlay (HelpFab is external component).
- Fix 8 (HD-08, P2): Summary block above card grid showing pending requests with timers.

## Key Implementation Notes

1. **Card IDs in code:** `call_waiter`, `bill`, `napkins`, `menu` (lines 3764–3768). The spec uses `waiter` in some places but code uses `call_waiter` — use code's IDs consistently.

2. **State lifting for Fix 7:** `requestStates` is local to the main component (where HelpDrawerContent is inline, lines 3726–3828). HelpFab (line 3716) is rendered in the same component scope, so `activeRequestCount` can be derived and passed as prop without lifting state.

3. **Undo + existing hook interaction (Fix 6):** The `useHelpRequests` hook controls `submitHelpRequest` and `handlePresetSelect`. The undo mechanism must delay calling `handlePresetSelect` (which triggers the useEffect chain at line 1687). During the 5s window, card shows `sending` state purely from `requestStates` — no hook interaction yet.

4. **DrawerContent constraint (KB-096):** DrawerContent at line 3727 must NOT have `className="relative"`. The undo toast should be placed inside the inner `<div className="relative">` wrapper (line 3728) or as a sibling in the flex column.

5. **FROZEN UX verified:** pushState/popstate at lines 1296–1301, ChevronDown close at line 3734, helpQuickSent reset at line 1661/1673 — all present. New code must not modify these.

6. **Imports needed:** No new lucide-react imports required — `Check`, `Loader2`, `CheckCircle2`, `MapPin` already imported. May need `Timer` or `Clock` for pending state — `Clock` is already imported (line 28).

## Prompt Clarity
- Overall clarity: 4/5
- Ambiguous Fix descriptions:
  - Fix 1: Spec says key `waiter` but code uses `call_waiter` — minor mismatch, detectable by reading code.
  - Fix 6: Interaction with existing `handlePresetSelect → useEffect → submitHelpRequest` chain is complex and not addressed in the spec. The undo delay must intercept this chain.
  - Fix 7: Spec says "search for where 🔔 button is rendered" but PM-156 removed the floating bell. The actual trigger is HelpFab (imported component) — spec could have noted this.
- Missing context: HelpFab component source code (external to x.jsx) — unknown if it accepts badge props.
- Scope questions: Whether `hasActiveRequest` from `useHelpRequests` hook should be replaced or kept alongside `requestStates`. Spec doesn't clarify interaction with server-side state from the hook.
