---
task_id: pssk-review-sos-fix35-260408
chain_template: pssk-review
budget_usd: 5
model: claude-sonnet-4-5
page: PublicMenu
---

You are reviewing the quality of a КС implementation prompt for a React/Base44 app.
DO NOT execute the changes. DO NOT read code files. Only review the prompt quality.

Context: SOS Help Drawer v6.0 Part B — rewrite drawer JSX (6-button grid with in-place state) + cleanup dead helpers/state/refs. This runs AFTER Part A which added config constants, urgency helpers, and i18n keys.

Find issues with the PROMPT DESIGN:
1. Incorrect code snippets (wrong syntax, variable names, line numbers)
2. Missing edge cases
3. Ambiguous instructions
4. Safety risks (unintended file changes)
5. Validation: are post-fix checks sufficient?

# SOS Help Drawer v6.0 — Fix 3+5 (JSX Rewrite + Cleanup) — КС-B
# Runs AFTER КС-A (chain de40, commit 0012e3f) — deployed and verified

## Prerequisites (all confirmed in RELEASE 260408-01, 5459 lines)
КС-A (Fix 1+2+4) is ALREADY APPLIED. The file now has:
- HELP_REQUEST_TYPES includes plate/utensils/clear_table (line 1835)
- HELP_CARD_LABELS (line 1846), HELP_CARD_SHORT_LABELS (line 1856) — both exist
- HELP_COOLDOWN_SECONDS updated (line 1841)
- HELP_URGENCY_THRESHOLDS (line 1866), HELP_URGENCY_GROUP (line 1870) — exist
- getHelpUrgency (line 1882), getHelpTimerStr (line 1892) — exist
- nonOtherTypes includes plate/utensils/clear_table (line 2216)
- I18N_FALLBACKS EN+RU have all help.* keys

⚠️ HELP_CHIPS (line 1874) and HELP_PREVIEW_LIMIT (line 1834) are STILL present (КС-A kept them because JSX refs existed). Fix 5 removes them and all JSX refs.

## Context
File: pages/PublicMenu/x.jsx (TARGET — edit this file ONLY)
RELEASE: `260408-01 PublicMenu x RELEASE.jsx` (5459 lines)
Task: Rewrite DrawerContent children (JSX only) + cleanup removed state/refs/helpers.
Weight: H | Budget: $15 | Chain: С5v2

## UX Reference
UX-документ: `ux-concepts/HelpDrawer/260407-00 HelpDrawer UX S234 FINAL.md`
HTML mockup: `ux-concepts/HelpDrawer/260407-01 SOS HelpDrawer Mockup S235.html`
Key decisions (DECISIONS_INDEX §12): in-place state change, 6 buttons 3×2, tap body=safe, ✕=cancel, urgency <8m/8-14m/15m+

## FROZEN UX (DO NOT CHANGE)
- StickyCartBar behavior and appearance
- MenuView tile/list layout and stepper
- CartView drawer (different DrawerContent at line 4763-4840)
- Bottom Sheet drawer (different DrawerContent at line 4858-4951)
- Bell icon badge display (line ~4965)
- All code outside the Help Drawer region
- handleCardTap logic (line 2370) — sends request correctly
- handleUndo logic (line 2405) — undo toast works
- openHelpDrawer/closeHelpDrawer base logic (lines 2349/2361) — only ADD resets

---

## Fix 3 — Rewrite drawer JSX [MUST-FIX]

### JSX Replacement Boundary (VERIFIED with RELEASE 260408-01)
Keep: `<Drawer open={isHelpModalOpen}` tag (line 4974).
Keep: `<DrawerContent>` opening tag (line 4975): className="max-h-[85vh] rounded-t-2xl flex flex-col". **D7 rule: do NOT add `relative` to DrawerContent**.
REPLACE: ALL children INSIDE `<DrawerContent>`:
- **Start**: `<div className="relative">` at line 4976 (first child after `<DrawerContent>`)
- **End**: just before `</DrawerContent>` at **line 5282**
- Strategy: replace the entire `<div className="relative">` element and ALL its children down to line 5281
- Includes: the "other" form block (lines 5222-5280) — this gets replaced by new textarea section
Keep: `</DrawerContent>` at line 5282 and `</Drawer>` at line 5283 — do NOT replace these.

Verification grep before edit: `grep -n "</DrawerContent>" pages/PublicMenu/x.jsx` → must show line ~5282 (third occurrence).

### STEP 1: Add cancelConfirmType state (~line 1913, after showOtherForm)
```js
const [cancelConfirmType, setCancelConfirmType] = useState(null); // SOS v6.0 cancel confirm
```

### STEP 2: Insert SOS_BUTTONS AFTER HELP_URGENCY_GROUP (from Fix 1, ends ~line 1879)
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
Search: `handleResolve = useCallback` to find exact position (line ~2455).
Insert AFTER that useCallback block closes (line ~2470):
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

### STEP 4: Fix activeRequestCount to exclude legacy `menu`
Find: `grep -n "activeRequestCount" pages/PublicMenu/x.jsx` → line ~2031.
Current: `const activeRequestCount = useMemo(() => activeRequests.length, [activeRequests]);`
Change to:
```js
const activeRequestCount = useMemo(() =>
  activeRequests.filter(r => r.type !== 'menu').length,
[activeRequests]);
```
This prevents legacy `menu` requests from inflating the badge.

### STEP 5: State resets in open/close functions
In `openHelpDrawer` (line ~2349): add `setCancelConfirmType(null);` after existing resets.
In `closeHelpDrawer` (line ~2361): add `setCancelConfirmType(null);` after existing resets.
KEEP all existing resets: `setIsTicketExpanded(false)`, `setShowOtherForm(false)`, `setHelpComment('')`.

### STEP 6: Replace DrawerContent children (lines 4976-5281) with new JSX
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

{/* Textarea form for "other" request — COPIED from existing block (lines 5222-5280) with styling changes:
    1. outer wrapper → "mx-3.5 mb-3.5 p-2.5 bg-gray-50 border-[1.5px] border-gray-200 rounded-xl flex flex-col gap-2"
    2. textarea: maxLength 100→120, add autoFocus, placeholder=tr('help.other_placeholder','Напишите, что нужно…')
    3. send button: className="flex-1 py-[7px] rounded-lg bg-orange-500 text-white text-[13px] font-bold", text=tr('help.send_btn','Отправить')
    4. counter: change 100→120
    DO NOT change: undo logic, setRequestStates, Array.isArray check, pendingQuickSendRef, handlePresetSelect call, cancel button logic — copy EXACTLY from existing lines 5222-5280 */}
{showOtherForm && (
  <div className="mx-3.5 mb-3.5 p-2.5 bg-gray-50 border-[1.5px] border-gray-200 rounded-xl flex flex-col gap-2">
    <textarea
      autoFocus
      value={helpComment}
      onChange={(e) => setHelpComment(e.target.value.slice(0, 120))}
      placeholder={tr('help.other_placeholder', 'Напишите, что нужно…')}
      maxLength={120}
      className="w-full rounded-lg border border-gray-200 p-2 text-sm resize-none h-[70px] focus:border-orange-400 focus:ring-1 focus:ring-orange-400 outline-none"
    />
    <div className="flex items-center justify-between">
      <span className="text-xs text-gray-400">{helpComment.length}/120</span>
      <div className="flex gap-2">
        <button onClick={() => { setShowOtherForm(false); setHelpComment(''); }}
          className="px-3 py-[7px] rounded-lg border border-gray-200 bg-white text-[13px] font-bold text-gray-700">
          {tr('common.cancel', 'Отмена')}
        </button>
        <button
          disabled={!helpComment.trim()}
          onClick={() => {
            if (!helpComment.trim()) return;
            const msg = helpComment.trim();
            if (undoToast?.timeoutId) clearTimeout(undoToast.timeoutId);
            const entryId = `other-${Date.now()}`;
            const timeoutId = setTimeout(() => {
              if (currentTableIdRef.current !== currentTableId) return;
              const now = Date.now();
              setRequestStates(prev => {
                const otherArr = Array.isArray(prev.other) ? prev.other : (prev.other ? [prev.other] : []);
                return {
                  ...prev,
                  other: [
                    ...otherArr,
                    {
                      id: entryId,
                      status: 'sending',
                      sentAt: now,
                      lastReminderAt: null,
                      reminderCount: 0,
                      remindCooldownUntil: null,
                      message: msg,
                      pendingAction: 'send',
                      errorKind: null,
                      errorMessage: '',
                      terminalHideAt: null,
                      syncSource: 'local',
                    },
                  ],
                };
              });
              setHelpComment(msg);
              pendingQuickSendRef.current = { type: 'other', action: 'send', rowId: entryId, message: msg };
              handlePresetSelect('other');
              setPendingHelpActionTick((value) => value + 1);
              setUndoToast(prev => (prev?.timeoutId === timeoutId ? null : prev));
            }, 5000);
            setUndoToast({ type: 'other', rowId: entryId, tableId: currentTableId, message: msg, expiresAt: Date.now() + 5000, timeoutId });
            setShowOtherForm(false);
            setHelpComment('');
          }}
          className="flex-1 py-[7px] rounded-lg bg-orange-500 text-white text-[13px] font-bold disabled:opacity-50">
          {tr('help.send_btn', 'Отправить')}
        </button>
      </div>
    </div>
  </div>
)}

{/* Undo toast */}
{undoToast && (
  <div className="mx-3.5 mb-3 rounded-lg bg-slate-800 text-white px-4 py-3 flex items-center justify-between text-sm">
    <span>{HELP_CARD_LABELS[undoToast.type] || undoToast.type} {tr('help.sent_suffix', 'отправлено')}</span>
    <button onClick={handleUndo} className="text-amber-300 font-medium ml-2 min-h-[44px] min-w-[44px] flex items-center justify-center">
      {tr('help.undo', 'Отмена')} ({Math.max(0, Math.ceil((undoToast.expiresAt - Date.now()) / 1000))})
    </button>
  </div>
)}

{/* Generic error fallback */}
{helpSubmitError && !activeRequests.some(r => r.errorKind) && (
  <div className="mx-3.5 mb-3 bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
    {helpSubmitError}
  </div>
)}
```

---

## Fix 5 — Cleanup removed state, refs, helpers [MUST-FIX]

### HELP_CHIPS and HELP_PREVIEW_LIMIT — REMOVE
These were kept by КС-A because JSX still referenced them. After Fix 3 replaces all JSX, they have 0 call sites.
- `HELP_PREVIEW_LIMIT` (line 1834): REMOVE entire line
- `HELP_CHIPS` (line 1874-1879): REMOVE entire useMemo block
- Verification: `grep -n "HELP_CHIPS\|HELP_PREVIEW_LIMIT" pages/PublicMenu/x.jsx` → 0 occurrences AFTER Fix 3 is applied

### State: keep with comments (hook order safety)
- `isTicketExpanded` (line 1912): keep declaration, add comment `// SOS v6.0 — kept for hook order, no longer used in JSX`
- `highlightedTicket` (line 1911): keep declaration, add comment `// SOS v6.0 — kept for hook order, no longer used in JSX`

### Refs: remove ticketBoardRef
- `ticketBoardRef = useRef(null)` (line 1910): REMOVE
- Clean up post-send callback (~line 2568): remove `ticketBoardRef.current?.scrollIntoView(...)`, `setHighlightedTicket(...)`, `setTimeout(() => setHighlightedTicket(...))`. KEEP `setIsTicketExpanded(false)` and `setShowOtherForm(false)`.

### focusHelpRow — REMOVE ENTIRELY
`grep -n "focusHelpRow" pages/PublicMenu/x.jsx` → definition at line ~2784.
focusHelpRow references HELP_PREVIEW_LIMIT (being removed) and ticketBoardRef (being removed). All call sites are in replaced JSX block → safe to remove.

### Dead helpers — REMOVE ALL (all call sites are in replaced block 4976-5281)
Remove definitions for:
- `getHelpWaitLabel` (line 2639)
- `getHelpReminderLabel` (line 2646)
- `getHelpResolvedLabel` (line 2657)
- `getHelpErrorCopy` (line 2668)
- `getHelpFreshnessLabel` (line 2684)
Verification: grep each name → 0 occurrences after Fix 3.

### handleRetry — KEEP (used in error-state tiles in new grid)

### Import cleanup
⚠️ DrawerHeader, DrawerTitle — **DO NOT REMOVE** from imports! They are used in CartView drawer (line 4764-4766) and Bottom Sheet drawer (line 4868-4876), OUTSIDE the help drawer.
- `ArrowLeft` — used at line 1273 outside help drawer → KEEP
- `ChevronDown` — used at line 4866 outside help drawer → KEEP  
- `MapPin` — used at line 161 outside help drawer → KEEP
- `Layers` — KEEP (used in new napkins button)

### Verification
After both Fix 3 and Fix 5:
- `grep -c "ticketBoardRef" pages/PublicMenu/x.jsx` → 0
- `grep -c "focusHelpRow" pages/PublicMenu/x.jsx` → 0
- `grep -c "HELP_CHIPS" pages/PublicMenu/x.jsx` → 0
- `grep -c "HELP_PREVIEW_LIMIT" pages/PublicMenu/x.jsx` → 0
- `grep -c "getHelpWaitLabel\|getHelpReminderLabel\|getHelpResolvedLabel\|getHelpErrorCopy\|getHelpFreshnessLabel" pages/PublicMenu/x.jsx` → 0
- `grep -c "isTicketExpanded" pages/PublicMenu/x.jsx` → only useState line + setIsTicketExpanded(false) in open/close/post-send (NOT in JSX return)
- `grep -c "DrawerHeader\|DrawerTitle" pages/PublicMenu/x.jsx` → ≥ 4 (CartView + BS drawers, NOT zero!)

---

## ⛔ SCOPE LOCK
Edit ONLY `pages/PublicMenu/x.jsx`.
Allowed regions:
- DrawerContent children (4976-5281) — REPLACE
- cancelConfirmType state (ADD after line 1913)
- SOS_BUTTONS (ADD after line 1879)
- handleSosCancel (ADD after handleResolve ~line 2470)
- activeRequestCount (MODIFY line 2031)
- openHelpDrawer/closeHelpDrawer (ADD resets at lines 2349/2361)
- post-send callback (MODIFY ~line 2568: remove ticketBoardRef refs)
- HELP_PREVIEW_LIMIT (REMOVE line 1834)
- HELP_CHIPS (REMOVE lines 1874-1879)
- ticketBoardRef (REMOVE line 1910)
- focusHelpRow (REMOVE ~line 2784)
- 5 dead helpers (REMOVE lines 2639-2697)
- isTicketExpanded, highlightedTicket (ADD comments only)

DO NOT change any other part of the file.
i18n exception: new tr() calls in JSX use keys already added by КС-A. No new i18n keys needed.

## POST-IMPLEMENTATION CHECKS
- 6-button grid renders (call_waiter, bill, plate, napkins, utensils, clear_table)
- tap sends request, ✕ cancels (non-red = instant, red = confirm panel)
- textarea form for "other" sends correctly
- undo toast 5s with countdown
- error tile shows retry button
- `wc -l pages/PublicMenu/x.jsx` — expected ~5350 ± 150 (replacing ~305 lines old JSX, adding ~170 lines new grid, removing ~80 lines dead helpers/constants). If < 5100 → ABORT (KB-095).
- `grep -c "HELP_CHIPS\|HELP_PREVIEW_LIMIT\|ticketBoardRef\|focusHelpRow\|getHelpWaitLabel" pages/PublicMenu/x.jsx` → must be 0
- git commit -m "SOS v6.0 Part B: drawer JSX rewrite + cleanup"
