# SOS Help Drawer v6.0 — Fix 3+5 (JSX Rewrite + Cleanup) — DRAFT (not yet reviewed)
# КС-B: runs AFTER КС-A (Fix 1+2+4) is deployed and verified
# R4 ПССК issues to fix before ПССК R5: C1 (boundary), C2 (textarea skeleton), C4 (menu badge)

## Prerequisites
КС-A (Fix 1+2+4) must be applied FIRST. This task assumes:
- HELP_CARD_LABELS, HELP_CARD_SHORT_LABELS, HELP_URGENCY_THRESHOLDS exist
- getHelpUrgency, getHelpTimerStr exist
- HELP_CHIPS and HELP_PREVIEW_LIMIT are already removed
- nonOtherTypes already includes plate/utensils/clear_table

## Context
File: pages/PublicMenu/x.jsx (TARGET — edit this file ONLY)
Task: Rewrite DrawerContent children (JSX only) + cleanup removed state/refs/helpers.
Weight: H | Budget: $15 | Chain: С5v2

---

## Fix 3 — Rewrite drawer JSX [MUST-FIX]

### JSX Replacement Boundary (C1 FIXED: was 5175, actual 5197)
Keep: `<Drawer open={isHelpModalOpen}` tag (~line 4889).
Keep: `<DrawerContent>` opening tag (~line 4890): className="max-h-[85vh] rounded-t-2xl flex flex-col". **D7 rule: do NOT add `relative` to DrawerContent**.
REPLACE: ALL children INSIDE `<DrawerContent>`:
- **Start**: `<div className="relative">` at line 4891 (first child after `<DrawerContent>`)
- **End**: just before `</DrawerContent>` at **line 5197** (verified via grep)
- Strategy: replace the entire `<div className="relative">` element and ALL its children
Keep: `</DrawerContent>` at line 5197 and `</Drawer>` — do NOT replace these.

Verification grep before edit: `grep -n "</DrawerContent>" pages/PublicMenu/x.jsx` → must show line ~5197.

### STEP 1: Add cancelConfirmType state (~line 1828, after isTicketExpanded)
```js
const [cancelConfirmType, setCancelConfirmType] = useState(null); // SOS v6.0 cancel confirm
```

### STEP 2: Insert SOS_BUTTONS AFTER HELP_CARD_SHORT_LABELS (from Fix 1, ~line 1813)
```js
const SOS_BUTTONS = [
  { id: 'call_waiter', emoji: '🙋', label: HELP_CARD_LABELS.call_waiter, shortLabel: HELP_CARD_SHORT_LABELS.call_waiter },
  { id: 'bill', emoji: '🧾', label: HELP_CARD_LABELS.bill, shortLabel: HELP_CARD_SHORT_LABELS.bill },
  { id: 'plate', emoji: '🍽️', label: HELP_CARD_LABELS.plate, shortLabel: HELP_CARD_SHORT_LABELS.plate },
  { id: 'napkins', icon: 'layers', label: HELP_CARD_LABELS.napkins, shortLabel: HELP_CARD_SHORT_LABELS.napkins },
  { id: 'utensils', emoji: '🍴', label: HELP_CARD_LABELS.utensils, shortLabel: HELP_CARD_SHORT_LABELS.utensils },
  { id: 'clear_table', emoji: '🗑️', label: HELP_CARD_LABELS.clear_table, shortLabel: HELP_CARD_SHORT_LABELS.clear_table },
];
```

### STEP 3: Insert handleSosCancel AFTER handleResolve definition
Search: `handleResolve = useCallback` to find exact position.
Insert AFTER that useCallback block closes:
```js
const handleSosCancel = useCallback((type) => {
  const activeRow = activeRequests.find(r => r.type === type);
  if (!activeRow) return;
  const urgency = getHelpUrgency(type, activeRow.sentAt);
  if (urgency === 'red') {
    setCancelConfirmType(type);
  } else {
    handleResolve(type, type === 'other' ? activeRow.id : undefined);
  }
}, [activeRequests, getHelpUrgency, handleResolve]);
```

### STEP 4: Fix activeRequestCount to exclude legacy `menu` (C4 FIX)
Find `activeRequestCount` definition (~line 1947):
```js
const activeRequestCount = /* existing definition using activeRequests.length */
```
Change to filter out hidden legacy types:
```js
const activeRequestCount = useMemo(() =>
  activeRequests.filter(r => r.type !== 'menu').length,
[activeRequests]);
```
This prevents legacy `menu` requests from inflating the badge when no cancel surface is shown.

### STEP 5: State resets in open/close functions
In `openHelpDrawer` (~line 2264-2274): add `setCancelConfirmType(null);`
In `closeHelpDrawer` (~line 2276-2282): add `setCancelConfirmType(null);` + `setShowOtherForm(false); setHelpComment('');` if not present.
KEEP `setIsTicketExpanded(false)` in both — do NOT remove.

### STEP 6: Replace DrawerContent children with new JSX
```jsx
{/* SOS v6.0 Drag handle pill */}
<div className="flex justify-center pt-2 pb-1">
  <div className="w-10 h-1 rounded-full bg-gray-300" />
</div>

{/* SOS v6.0 Header */}
<div className="px-4 pt-2 pb-2 border-b border-slate-100">
  <div className="flex items-center justify-between">
    <span className="text-[17px] font-extrabold text-gray-900">
      {tr('help.modal_title', 'Нужна помощь?')}
    </span>
    <span className="bg-orange-500 text-white rounded-xl px-3 py-0.5 text-[13px] font-bold">
      {currentTable?.name || currentTable?.code || tr('help.table_default', 'Стол')}
    </span>
  </div>
  {activeRequestCount === 0 && (
    <p className="text-[13px] text-gray-400 mt-0.5">
      {tr('help.subtitle_choose', 'Выберите, что нужно')}
    </p>
  )}
</div>

{/* SOS v6.0 Button Grid — 3×2, in-place state */}
<div className="grid grid-cols-2 gap-[9px] px-3.5 pt-2.5 pb-2">
  {SOS_BUTTONS.map(btn => {
    const activeRow = activeRequests.find(r => r.type === btn.id);
    const isActive = Boolean(activeRow);
    const sentAt = activeRow?.sentAt;
    const urgency = isActive ? getHelpUrgency(btn.id, sentAt) : 'neutral';
    const timerText = isActive ? getHelpTimerStr(sentAt) : '';
    if (isActive) {
      const hasError = Boolean(activeRow.errorKind);
      if (hasError) {
        return (
          <button key={btn.id} onClick={() => handleRetry(activeRow)}
            className="rounded-xl border-2 border-red-400 bg-red-50 p-[11px] min-h-[70px] flex flex-col justify-between select-none active:bg-red-100">
            <span className="text-[13px] font-extrabold text-red-800">{btn.shortLabel}</span>
            <div className="text-[12px] font-bold text-red-600 flex items-center gap-[3px] mt-1">
              <span className="text-[11px]">⚠</span>{tr('help.retry', 'Повторить')}
            </div>
          </button>
        );
      }
      const activeBg = urgency === 'red' ? 'bg-red-50' : urgency === 'amber' ? 'bg-amber-50' : 'bg-orange-50';
      const activeBorder = urgency === 'red' ? 'border-red-500' : urgency === 'amber' ? 'border-amber-500' : 'border-orange-500';
      const labelColor = urgency === 'red' ? 'text-red-900' : urgency === 'amber' ? 'text-amber-900' : 'text-orange-800';
      const timerColor = urgency === 'red' ? 'text-red-600' : urgency === 'amber' ? 'text-amber-600' : 'text-orange-500';
      const xBg = urgency === 'red' ? 'bg-red-500/20' : urgency === 'amber' ? 'bg-amber-500/20' : 'bg-orange-500/15';
      const xColor = urgency === 'red' ? 'text-red-800' : urgency === 'amber' ? 'text-amber-800' : 'text-orange-800';
      return (
        <div key={btn.id} className={`rounded-xl border-2 ${activeBorder} ${activeBg} p-[11px] min-h-[70px] flex flex-col justify-between select-none`}>
          <div className="flex items-start justify-between">
            <span className={`text-[13px] font-extrabold ${labelColor}`}>{btn.shortLabel}</span>
            <button onClick={(e) => { e.stopPropagation(); handleSosCancel(btn.id); }}
              className={`w-[22px] h-[22px] rounded-full ${xBg} ${xColor} flex items-center justify-center text-[11px] font-extrabold -mt-0.5 flex-shrink-0`}>✕</button>
          </div>
          <div className={`text-[12px] font-bold ${timerColor} flex items-center gap-[3px] mt-1`}>
            <span className="text-[11px]">⏱</span>{timerText}
          </div>
        </div>
      );
    }
    return (
      <button key={btn.id} onClick={() => handleCardTap(btn.id)}
        className="rounded-xl border-2 border-gray-200 bg-gray-50 p-[11px] min-h-[70px] flex flex-row items-center gap-[9px] select-none active:bg-gray-100 active:scale-[0.97] transition-transform">
        {btn.icon === 'layers' ? (
          <Layers className="w-[22px] h-[22px] text-gray-500 flex-shrink-0" />
        ) : (
          <span className="text-xl leading-none flex-shrink-0">{btn.emoji}</span>
        )}
        <span className="text-[13px] font-bold text-gray-900 text-left leading-tight">{btn.label}</span>
      </button>
    );
  })}
</div>

{/* Cancel confirm panel */}
{cancelConfirmType && (
  <div className="mx-3.5 mb-1.5 p-3 bg-red-50 border-[1.5px] border-red-200 rounded-xl">
    <div className="text-sm font-extrabold text-red-900 mb-2.5">
      {tr('help.cancel_confirm_q', 'Отменить запрос?')}
    </div>
    <div className="flex gap-2">
      <button onClick={() => setCancelConfirmType(null)}
        className="flex-1 py-2 rounded-lg border-2 border-gray-200 bg-white text-sm font-bold text-gray-700">
        {tr('help.cancel_keep', 'Оставить')}
      </button>
      <button onClick={() => {
          const row = activeRequests.find(r => r.type === cancelConfirmType);
          handleResolve(cancelConfirmType, cancelConfirmType === 'other' ? row?.id : undefined);
          setCancelConfirmType(null);
        }}
        className="flex-1 py-2 rounded-lg bg-red-500 text-white text-sm font-bold">
        {tr('help.cancel_do', 'Отменить')}
      </button>
    </div>
  </div>
)}

{/* Active custom "other" requests */}
{activeRequests.filter(r => r.type === 'other').map(row => (
  <div key={row.id} className="mx-3.5 mb-2 px-3 py-2 bg-orange-50 border-[1.5px] border-orange-500 rounded-[10px] flex items-center justify-between gap-2">
    <span className="text-[13px] text-orange-800 font-semibold flex-1 truncate">
      «{row.message || tr('help.other_label', 'Другое')}»
    </span>
    <span className="text-[12px] font-bold text-orange-500 whitespace-nowrap">⏱ {getHelpTimerStr(row.sentAt)}</span>
    <button onClick={(e) => { e.stopPropagation(); handleResolve('other', row.id); }}
      className="w-[22px] h-[22px] rounded-full bg-orange-500/15 text-orange-800 flex items-center justify-center text-[11px] font-extrabold flex-shrink-0">✕</button>
  </div>
))}

{/* "Другой запрос?" link */}
{!activeRequests.some(r => r.type === 'other') && !showOtherForm && (
  <div className="px-3.5 pb-3">
    <button onClick={() => setShowOtherForm(true)}
      className="text-sm text-gray-400 underline underline-offset-2 bg-transparent border-none cursor-pointer">
      {tr('help.other_request_link', 'Другой запрос?')}
    </button>
  </div>
)}

{/* Textarea form for custom "other" request (C2 FIX: COPY existing block ~5137-5195 verbatim, 
    changing ONLY: 
    1. outer wrapper className → "mx-3.5 mb-3.5 p-2.5 bg-gray-50 border-[1.5px] border-gray-200 rounded-xl flex flex-col gap-2"
    2. textarea maxLength 100→120, add autoFocus, placeholder=tr('help.other_placeholder','Напишите, что нужно…')
    3. send button className → "flex-1 py-[7px] rounded-lg bg-orange-500 text-white text-[13px] font-bold", text=tr('help.send_btn','Отправить')
    4. counter display: change 100→120 in the counter string
    DO NOT change: undo logic, setRequestStates, Array.isArray check, pendingQuickSendRef, handlePresetSelect call — copy exactly */}
{showOtherForm && (
  /* COPY lines ~5137-5195 verbatim here, with only the 4 changes listed above */
  <div />
)}

{/* Undo toast */}
{undoToast && (
  <div className="mx-3.5 mb-3 rounded-lg bg-slate-800 text-white px-4 py-3 flex items-center justify-between text-sm">
    <span>{HELP_CARD_LABELS[undoToast.type] || undoToast.type} {t('help.sent_suffix')}</span>
    <button onClick={handleUndo} className="text-amber-300 font-medium ml-2 min-h-[44px] min-w-[44px] flex items-center justify-center">
      {t('help.undo')} ({Math.max(0, Math.ceil((undoToast.expiresAt - Date.now()) / 1000))})
    </button>
  </div>
)}

{/* Generic error fallback — shown only when helpSubmitError exists (per-tile errors shown above) */}
{helpSubmitError && !activeRequests.some(r => r.errorKind) && (
  <div className="mx-3.5 mb-3 bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
    {helpSubmitError}
  </div>
)}
```

---

## Fix 5 — Cleanup removed state, refs, helpers [MUST-FIX]

### State: keep with comments (hook order safety)
- `isTicketExpanded` (~line 1827): keep declaration, just add comment `// SOS v6.0 — no longer used in JSX`
- `highlightedTicket` (~line 1826): keep declaration, just add comment `// SOS v6.0 — no longer used in JSX`

### Refs: remove ticketBoardRef
- `ticketBoardRef = useRef(null)` (~line 1825): REMOVE
- Clean up call-site at post-send callback (~line 2481): remove `ticketBoardRef.current?.scrollIntoView(...)`, `setHighlightedTicket(...)`, `setTimeout(() => setHighlightedTicket(...))`. KEEP `setIsTicketExpanded(false)` and `setShowOtherForm(false)`.

### focusHelpRow — REMOVE ENTIRELY (C4 FIXED)
`grep -n "focusHelpRow" pages/PublicMenu/x.jsx`
Remove the function definition (~line 2699).
⚠️ REASON: focusHelpRow references HELP_PREVIEW_LIMIT (removed in Fix 1) and ticketBoardRef (removed above). Keeping it would cause ReferenceError. All call sites are in replaced JSX — confirm grep shows no remaining call sites before removing.

### Dead helpers — grep and remove if ALL call sites in replaced block
Check each: `getHelpWaitLabel`, `getHelpReminderLabel`, `getHelpResolvedLabel`, `getHelpErrorCopy`, `getHelpFreshnessLabel`.
- grep call sites for each
- If ALL call sites are inside the replaced block (lines 4891-5197) → remove function definition
- If any call site is outside → keep function
`handleRetry` — KEEP (used in error-state tiles in new grid).

### Import cleanup
Grep: `DrawerHeader`, `DrawerTitle` → used only in old drawer JSX → REMOVE from imports.
Grep: `ArrowLeft` — used at line ~1234 outside help drawer → KEEP.
Grep: `ChevronDown` — used at line ~4781 outside help drawer → KEEP.
Grep: `MapPin` — used at line ~161 → KEEP.
`Layers` — KEEP (napkins button).

### Verification
Grep `ticketBoardRef` — 0 occurrences.
Grep `focusHelpRow` — 0 occurrences.
Grep `isTicketExpanded` — only in: useState declaration line + setIsTicketExpanded(false) in open/close/post-send. NOT in JSX return.
Grep `HELP_CHIPS` — 0 occurrences.
Grep `HELP_PREVIEW_LIMIT` — 0 occurrences.

---

## ⛔ SCOPE LOCK
Edit ONLY `pages/PublicMenu/x.jsx`.
Allowed regions: DrawerContent children (4891-5197), cancelConfirmType state (add), ticketBoardRef/isTicketExpanded/highlightedTicket (modify), openHelpDrawer/closeHelpDrawer (add resets), post-send callback (remove ticketBoardRef refs), activeRequestCount (filter menu), SOS_BUTTONS/handleSosCancel (add to body), dead helpers (remove), imports (remove DrawerHeader/DrawerTitle), focusHelpRow (remove).
DO NOT change: any other part of the file.

## POST-IMPLEMENTATION CHECKS
6-button grid renders, tap sends, ✕ cancels, red ✕ → confirm panel, textarea form sends, undo toast 5s, error tile → retry.
`wc -l pages/PublicMenu/x.jsx` — expected ~5374 ± 200 (replacing ~200 lines ticket board, adding ~150 lines new grid). If < 5100 → ABORT (KB-095).
git commit -m "SOS v6.0 Part B: drawer JSX rewrite + cleanup"
