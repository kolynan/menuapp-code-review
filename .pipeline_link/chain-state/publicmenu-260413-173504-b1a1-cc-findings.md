# CC Writer Findings — PublicMenu
Chain: publicmenu-260413-173504-b1a1

## Findings

### Fix 1 — #285 (P2): "Something else?" link — show disabled instead of hidden

**Current code** (x.jsx lines 5053–5061):
The link is hidden when `activeRequests.some(r => r.type === 'other')` is true. The `!showOtherForm` condition also hides it when the textarea is open (this is correct and should be kept).

**Analysis:**
The fix requires replacing the binary show/hide condition with a two-state rendering:
- When `showOtherForm` is true → hide (keep current behavior)
- When `showOtherForm` is false AND there's an active 'other' request → show disabled link + helper text
- When `showOtherForm` is false AND no active 'other' request → show normal clickable link

**FIX:**
Replace lines 5053–5061 with:
```jsx
{!showOtherForm && (() => {
  const hasActiveOther = activeRequests.some(r => r.type === 'other');
  return (
    <div className="px-3.5 pb-3">
      <button
        onClick={() => { if (!hasActiveOther) setShowOtherForm(true); }}
        className={hasActiveOther
          ? "text-sm text-gray-300 bg-transparent border-none cursor-default"
          : "text-sm text-gray-400 underline underline-offset-2 bg-transparent border-none cursor-pointer"}
      >
        {tr('help.other_request_link', 'Другой запрос?')}
      </button>
      {hasActiveOther && (
        <p className="text-[11px] text-gray-300 mt-0.5">
          {tr('help.other_only_one', 'Можно только 1 такой запрос одновременно')}
        </p>
      )}
    </div>
  );
})()}
```

**i18n keys to add:**
- EN (I18N_FALLBACKS, ~line 603 area): `"help.other_only_one": "Only 1 custom request at a time"`
- RU (I18N_FALLBACKS_RU, ~line 675 area): `"help.other_only_one": "Можно только 1 такой запрос одновременно"`

**Notes:**
- The `disabled` HTML attribute is NOT used per spec — instead onClick is a no-op when disabled
- `cursor-default` replaces `cursor-pointer` when disabled
- No `underline` class when disabled (per spec: "no underline, no hover effect")
- The button element stays tappable (no `disabled` attr) for potential future gate use
- Touch target: the `<button>` in `px-3.5 pb-3` container provides adequate touch area (text-sm on a full-width padded div)

---

### Fix 2 — #284 (P2): Auto-resolve requests older than 24h + stale timer display

**2a) Stale timer display — `getHelpTimerStr` (x.jsx lines 1898–1904)**

**Current code:**
```jsx
const getHelpTimerStr = useCallback((sentAt) => {
  if (!sentAt) return '';
  const elapsedSec = Math.floor((Date.now() - sentAt) / 1000);
  if (elapsedSec < 60) return '<1м';
  const min = Math.floor(elapsedSec / 60);
  return `${min}м`;
}, []);
```

**FIX:** Add early return for >= 24h before the existing logic:
```jsx
const getHelpTimerStr = useCallback((sentAt) => {
  if (!sentAt) return '';
  const elapsedSec = Math.floor((Date.now() - sentAt) / 1000);
  if (elapsedSec >= 24 * 60 * 60) return tr('help.stale_status', 'Данные могли устареть');
  if (elapsedSec < 60) return '<1м';
  const min = Math.floor(elapsedSec / 60);
  return `${min}м`;
}, []);
```

**Note:** The `help.stale_status` key already exists in both EN (line 572) and RU (line 643) translation objects.

**2b) Auto-resolve useEffect**

**FIX:** Add a new `useEffect` near the other help-related effects (after line ~2135, near the `timerTick`-dependent memos). This effect should run on every `timerTick` and resolve stale requests:

```jsx
// #284: Auto-resolve requests older than 24h
useEffect(() => {
  const STALE_MS = 24 * 60 * 60 * 1000;
  const now = Date.now();
  
  // Check non-other types
  Object.entries(requestStates).forEach(([type, state]) => {
    if (type === 'other') {
      const rows = Array.isArray(state) ? state : [];
      rows.forEach((row) => {
        if (row.sentAt && (now - row.sentAt > STALE_MS) && row.status !== 'closed_by_guest' && !row.terminalHideAt) {
          handleResolve('other', row.id);
        }
      });
    } else {
      if (state?.sentAt && (now - state.sentAt > STALE_MS) && state.status !== 'closed_by_guest' && !state.terminalHideAt) {
        handleResolve(type);
      }
    }
  });
}, [timerTick, requestStates, handleResolve]);
```

**Notes:**
- Uses existing `timerTick` (ticks every 30s) as dependency — no new polling interval
- Uses local `handleResolve` — no backend API call
- Guards against already-resolved items (`closed_by_guest`, `terminalHideAt`) to prevent infinite re-resolve loops
- Does NOT change `HELP_URGENCY_THRESHOLDS`

---

### Fix 3 — #286 (P3): Save textarea draft when drawer closes

**Analysis of close/open/cancel/send paths:**
- `closeHelpDrawer` (line 2370): sets `showOtherForm(false)` and `helpComment('')` — draft save must happen BEFORE this
- `openHelpDrawer` (line 2357): sets `showOtherForm(false)` and `helpComment('')` — draft restore should override these
- Cancel button (line 5077): `setShowOtherForm(false); setHelpComment('')` — must also clear localStorage
- Send path (line 5121–5122): `setShowOtherForm(false); setHelpComment('')` — must also clear localStorage

**FIX:** Add a `useEffect` watching `isHelpModalOpen` for save/restore:

```jsx
// #286: Save/restore "other" textarea draft on drawer close/open
useEffect(() => {
  const storageKey = currentTableId ? 'sos_draft_' + currentTableId : null;
  if (!storageKey) return;
  
  if (!isHelpModalOpen) {
    // Drawer just closed — save draft if textarea was open with content
    if (showOtherForm && helpComment.trim()) {
      try { localStorage.setItem(storageKey, helpComment); } catch (e) { /* KB-033 */ }
    }
  } else {
    // Drawer just opened — restore draft if exists and no active 'other' request
    if (!showOtherForm) {
      try {
        const draft = localStorage.getItem(storageKey);
        if (draft && draft.trim()) {
          const hasActiveOther = activeRequests.some(r => r.type === 'other');
          if (!hasActiveOther) {
            setHelpComment(draft);
            setShowOtherForm(true);
          }
        }
      } catch (e) { /* KB-033 */ }
    }
  }
}, [isHelpModalOpen]);
```

**Important implementation note:** The `closeHelpDrawer` callback (line 2370) calls `setShowOtherForm(false)` and `setHelpComment('')` AFTER `setIsHelpModalOpen(false)`. Since React batches state updates, the useEffect for `isHelpModalOpen` will fire with the NEW values of `showOtherForm` (false) and `helpComment` (''). This means we need to save the draft BEFORE the close callback runs.

**Alternative approach (more reliable):** Instead of a useEffect, modify `closeHelpDrawer` directly to save draft before clearing:

```jsx
const closeHelpDrawer = useCallback(() => {
  // #286: Save draft before clearing
  if (showOtherForm && helpComment.trim() && currentTableId) {
    try { localStorage.setItem('sos_draft_' + currentTableId, helpComment); } catch (e) { /* KB-033 */ }
  }
  popOverlay('help');
  setIsHelpModalOpen(false);
  setIsTicketExpanded(false);
  setShowOtherForm(false);
  setHelpComment('');
  setCancelConfirmType(null);
}, [popOverlay, setHelpComment, showOtherForm, helpComment, currentTableId]);
```

And add restore logic in `openHelpDrawer`:

```jsx
const openHelpDrawer = useCallback(() => {
  if (!currentTableId) {
    setShowTableConfirmSheet(true);
    return;
  }
  setShowOtherForm(false);
  setHelpComment('');
  setIsTicketExpanded(false);
  setCancelConfirmType(null);
  // #286: Restore draft if exists
  const hasActiveOther = activeRequests?.some(r => r.type === 'other');
  if (!hasActiveOther) {
    try {
      const draft = localStorage.getItem('sos_draft_' + currentTableId);
      if (draft && draft.trim()) {
        setHelpComment(draft);
        setShowOtherForm(true);
      }
    } catch (e) { /* KB-033 */ }
  }
  setIsHelpModalOpen(true);
  pushOverlay('help');
}, [currentTableId, pushOverlay, setHelpComment, setShowTableConfirmSheet, activeRequests]);
```

**Additionally, clear localStorage on Cancel and Send:**

Cancel button (line 5077), change to:
```jsx
onClick={() => {
  setShowOtherForm(false);
  setHelpComment('');
  if (currentTableId) { try { localStorage.removeItem('sos_draft_' + currentTableId); } catch (e) { /* KB-033 */ } }
}}
```

Send success path (lines 5121–5122), after `setHelpComment('')` add:
```jsx
if (currentTableId) { try { localStorage.removeItem('sos_draft_' + currentTableId); } catch (e) { /* KB-033 */ } }
```

**RECOMMENDED approach:** Modify `closeHelpDrawer` + `openHelpDrawer` directly (the "alternative approach" above). The useEffect approach has a race condition with React batched state updates where `showOtherForm` and `helpComment` may already be reset by the time the effect fires.

---

### Fix 4 — #232 (P2): HelpFab — move from right to left side

**Current code** (HelpFab.jsx line 7):
```jsx
<div className="fixed bottom-24 right-4 z-40 md:bottom-8 md:right-8">
```

**FIX:** Replace `right-4` → `left-4` and `md:right-8` → `md:left-8`:
```jsx
<div className="fixed bottom-24 left-4 z-40 md:bottom-8 md:left-8">
```

**Notes:**
- Only HelpFab.jsx is changed — x.jsx not touched for this fix
- No other styles, sizes, colors, or logic changed
- LOCK-PM-001 cart FAB "+" is in a different component and unaffected

---

## Summary
Total: 4 findings (0 P0, 0 P1, 3 P2, 1 P3)

- Fix 1: P2 — Disabled link state + helper text + 2 i18n keys
- Fix 2: P2 — Two sub-changes: stale timer display + auto-resolve useEffect  
- Fix 3: P3 — Draft save/restore in closeHelpDrawer/openHelpDrawer + localStorage cleanup on cancel/send
- Fix 4: P2 — Trivial CSS class swap in HelpFab.jsx

## Prompt Clarity

- Overall clarity: 5
- Ambiguous Fix descriptions: None — all 4 fixes had clear current/expected/anti-pattern sections with exact line numbers and code snippets
- Missing context: None — all referenced code was accurate and findable at the specified locations
- Scope questions: Fix 3 has a subtle implementation challenge around React state batching in the useEffect approach (documented in findings). The task didn't specify which approach to use (useEffect vs. direct callback modification), so both are documented with recommendation.
