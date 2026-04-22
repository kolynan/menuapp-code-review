---
task_id: pssk-review-sos-fix35-260408-r2
chain_template: pssk-review
budget_usd: 5
model: claude-sonnet-4-5
page: PublicMenu
---

# PSSK Review: SOS v6.0 Fix 3+5 (JSX Rewrite + Cleanup) — R2

You are reviewing a КС (engineering task) prompt that will rewrite Help Drawer JSX and cleanup removed references. The task has been revised after R1 feedback.

## Review Checklist (from prompt-checker)

### CRITICAL Issues (block execution)
- [ ] **C1: Line numbers accurate?** Verify all grep patterns and insertion points match current RELEASE 260408-01 (5459 lines). Check: handleResolve ends ~2493, activeRequestCount ~2031, DrawerContent boundary ~5282.
- [ ] **C2: Execution order explicit?** Both Fix 3 and Fix 5 MUST execute sequentially, not parallel. Is it clear: complete all 6 Fix 3 steps FIRST, then Fix 5? Check for "THEN apply" or sequential numbering.
- [ ] **C3: Preflight step present?** Is STEP 0 preflight (cp RELEASE → x.jsx) clearly the first action to normalize file state?
- [ ] **C4: Dead helpers by name, not range?** The 5 dead helpers are listed by exact name (getHelpWaitLabel, getHelpReminderLabel, getHelpResolvedLabel, getHelpErrorCopy, getHelpFreshnessLabel) with NO numeric line range?
- [ ] **C5: URGENCY_STYLES mapping included?** Is the new mapping object (M4) defined with all 3 urgency levels (neutral, amber, red) before grid JSX?

### MEDIUM Issues (quality)
- [ ] **M1: Scroll wrapper present?** Lines 4976-5281 replacement starts with scroll wrapper `<div className="overflow-y-auto flex-1 pb-safe">` wrapping ALL grid/textarea/toast/error content, closing before DrawerContent close tag?
- [ ] **M2: Legacy menu note?** Is there a NOTE explaining why legacy `menu` requests are hidden from badge count AND grid (intentional for Part B)?
- [ ] **M3: Other cancel note?** Is there a NOTE explaining why `other` requests cancel instantly without red-confirm (user knows what they're cancelling via message)?
- [ ] **M4: Tailwind mapping logic?** Are the 6 old const variables replaced with `const s = URGENCY_STYLES[urgency]` usage pattern in active tiles?
- [ ] **M5: Boundary wording clear?** Does the JSX Replacement Boundary section clarify that lines 5000+ are SIBLINGS inside DrawerContent, not children of the `<div className="relative">`?

### LOW Issues (polish)
- [ ] **L1: POST-IMPLEMENTATION CHECKS updated?** Does the checklist include "Verify drawer scrolls when content exceeds viewport (5+ active requests)" and updated expected line count?
- [ ] **L2: Frozen UX preserved?** Are CartView and Bottom Sheet drawers explicitly marked as FROZEN (no changes)?
- [ ] **L3: Import safety confirmed?** Is it clear that DrawerHeader/DrawerTitle MUST NOT be removed (used in other drawers)?
- [ ] **L4: Comment style consistent?** Do added comments (isTicketExpanded, highlightedTicket) follow "SOS v6.0 — kept for..." pattern?

## Final Questions
1. **Are there any contradictions between Fix 3 and Fix 5?** (e.g., JSX references vs. cleanup scope)
2. **Is the execution order enforceable?** Could a developer accidentally apply Fix 5 first?
3. **Are all i18n keys assumed to exist?** (Verify against КС-A additions: HELP_CARD_LABELS, HELP_CARD_SHORT_LABELS, tr() calls)
4. **Boundary precision:** Are line numbers ~2493, ~2031, ~5282 within ±10 of actual RELEASE 260408-01?

## Instructions for Codex Review
If running Codex review:
1. Verify RELEASE 260408-01 (5459 lines) exists in pages/PublicMenu/ directory
2. Check that all grep patterns (activeRequestCount, handleResolve, handleSosCancel, DrawerContent) would match
3. Confirm: URGENCY_STYLES approach correctly replaces 6 const variables
4. Verify: Scroll wrapper DIV properly nests all children and closes before DrawerContent
5. Ensure: Both Fix 3 steps 1-6 AND Fix 5 cleanup can execute in sequence without conflicts

## Summary
Review this prompt for execution clarity, line accuracy, and architectural safety. If all CRITICAL items are satisfied (C1-C5) and MEDIUM items are present (M1-M5), mark as READY for КС execution.
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

### STEP 0 — Preflight: Normalize x.jsx
Run: `cp '260408-01 PublicMenu x RELEASE.jsx' x.jsx` to ensure x.jsx matches RELEASE exactly (prevents NUL bytes / stale trailing content).

### JSX Replacement Boundary (VERIFIED with RELEASE 260408-01)
Keep: `<Drawer open={isHelpModalOpen}` tag (line 4974).
Keep: `<DrawerContent>` opening tag (line 4975): className="max-h-[85vh] rounded-t-2xl flex flex-col". **D7 rule: do NOT add `relative` to DrawerContent**.
REPLACE: ALL children INSIDE `<DrawerContent>`:
- **Start**: `<div className="relative">` at line 4976 (first child after `<DrawerContent>`)
- **End**: just before `</DrawerContent>` at **line 5282**
- Strategy: Replace every child node of `<DrawerContent>` from the `<div className="relative">` at 4976 through the comment at 5281 inclusive. Lines 5000+ are siblings inside DrawerContent, not children of the first div.
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
Insert AFTER that useCallback block closes (line ~2493):
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

{/* SOS v6.0 Scroll wrapper */}
<div className="overflow-y-auto flex-1 pb-safe">
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
        const s = URGENCY_STYLES[urgency] || URGENCY_STYLES.neutral;
        return (
          <div key={btn.id} className={`rounded-xl border-2 ${s.border} ${s.bg} p-[11px] min-h-[70px] flex flex-col justify-between select-none`}>
            <div className="flex items-start justify-between">
              <span className={`text-[13px] font-extrabold ${s.label}`}>{btn.shortLabel}</span>
              <button onClick={(e) => { e.stopPropagation(); handleSosCancel(btn.id); }}
                className={`w-[22px] h-[22px] rounded-full ${s.xBg} ${s.xColor} flex items-center justify-center text-[11px] font-extrabold -mt-0.5 flex-shrink-0`}>✕</button>
            </div>
            <div className={`text-[12px] font-bold ${s.timer} flex items-center gap-[3px] mt-1`}>
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
</div>
```

---

## Fix 5 — Cleanup removed state, refs, helpers [MUST-FIX]

⚠️ EXECUTION ORDER: Apply Fix 3 COMPLETELY first (all 6 steps). THEN apply Fix 5 cleanup. Fix 5 depends on Fix 3 being done (removed JSX refs enable constant removal).

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
Remove 5 dead helpers (REMOVE by name: getHelpWaitLabel, getHelpReminderLabel, getHelpResolvedLabel, getHelpErrorCopy, getHelpFreshnessLabel — do NOT touch handleRetry which follows immediately after)

NOTE: Legacy `menu` requests are hidden from badge count AND from the 6-button grid. They continue to exist in activeRequests but have no UI surface — this is intentional for Part B. A cleanup migration (auto-resolve stale menu requests) is planned for a future task.

NOTE: `other` requests cancel immediately (no red-confirm panel). This is by design — `other` has a visible message label, so the user knows exactly what they're cancelling.

### Dynamic Tailwind styles (M4)
Add BEFORE the grid JSX (after the scroll wrapper opening div, inside the component):
```js
const URGENCY_STYLES = {
  neutral: { bg: 'bg-orange-50', border: 'border-orange-500', label: 'text-orange-800', timer: 'text-orange-500', xBg: 'bg-orange-500/15', xColor: 'text-orange-800' },
  amber: { bg: 'bg-amber-50', border: 'border-amber-500', label: 'text-amber-900', timer: 'text-amber-600', xBg: 'bg-amber-500/20', xColor: 'text-amber-800' },
  red: { bg: 'bg-red-50', border: 'border-red-500', label: 'text-red-900', timer: 'text-red-600', xBg: 'bg-red-500/20', xColor: 'text-red-800' },
};
```
Replace the 6 const lines with `const s = URGENCY_STYLES[urgency] || URGENCY_STYLES.neutral;` and use `s.bg`, `s.border`, `s.label`, `s.timer`, `s.xBg`, `s.xColor`.

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
- handleSosCancel (ADD after handleResolve ~line 2493)
- activeRequestCount (MODIFY line 2031)
- openHelpDrawer/closeHelpDrawer (ADD resets at lines 2349/2361)
- post-send callback (MODIFY ~line 2568: remove ticketBoardRef refs)
- HELP_PREVIEW_LIMIT (REMOVE line 1834)
- HELP_CHIPS (REMOVE lines 1874-1879)
- ticketBoardRef (REMOVE line 1910)
- focusHelpRow (REMOVE ~line 2784)
- 5 dead helpers (REMOVE by name: getHelpWaitLabel, getHelpReminderLabel, getHelpResolvedLabel, getHelpErrorCopy, getHelpFreshnessLabel)
- isTicketExpanded, highlightedTicket (ADD comments only)
- URGENCY_STYLES mapping object (ADD before grid)

DO NOT change any other part of the file.
i18n exception: new tr() calls in JSX use keys already added by КС-A. No new i18n keys needed.

## POST-IMPLEMENTATION CHECKS
- 6-button grid renders (call_waiter, bill, plate, napkins, utensils, clear_table)
- tap sends request, ✕ cancels (non-red = instant, red = confirm panel)
- textarea form for "other" sends correctly
- undo toast 5s with countdown
- error tile shows retry button
- Drawer scrolls when content exceeds viewport (5+ active requests)
- `wc -l pages/PublicMenu/x.jsx` — expected ~5350 ± 150 (replacing ~305 lines old JSX, adding ~170 lines new grid + scroll wrapper, removing ~80 lines dead helpers/constants). If < 5100 → ABORT (KB-095).
- `grep -c "HELP_CHIPS\|HELP_PREVIEW_LIMIT\|ticketBoardRef\|focusHelpRow\|getHelpWaitLabel" pages/PublicMenu/x.jsx` → must be 0
- git commit -m "SOS v6.0 Part B: drawer JSX rewrite + cleanup"
