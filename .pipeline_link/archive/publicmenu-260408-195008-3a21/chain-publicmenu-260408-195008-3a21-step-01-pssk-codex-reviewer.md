---
chain: publicmenu-260408-195008-3a21
chain_step: 1
chain_total: 1
chain_step_name: pssk-codex-reviewer
chain_group: reviewers
chain_group_size: 2
page: PublicMenu
budget: 5.00
runner: codex
type: chain-step
---
You are a Codex code reviewer evaluating the QUALITY of a КС implementation prompt (NOT executing it).

A КС prompt is an instruction document for Claude Code + Codex pipeline to fix code in a React/Base44 app.
Your role: find issues with the PROMPT DESIGN that could cause the execution to fail, produce wrong results, or require clarification.

⛔ DO NOT: run any commands, make any code changes, modify files.
✅ DO: analyze the prompt text AND read the target source file to verify code snippets, line numbers, function signatures, and field names.

To verify the prompt's code references:
1. Read the RELEASE file named in the prompt (e.g. `pages/PublicMenu/260407-00 PublicMenu x RELEASE.jsx`)
2. Grep for specific function names, variable names, and line numbers mentioned in the prompt
3. Check that code snippets in the prompt match actual code (correct field names, function signatures, etc.)

For each issue: [CRITICAL/MEDIUM/LOW] Title — Description. PROMPT FIX: what to change in the prompt.

Focus on:
- Incorrect code snippets in the prompt (wrong syntax, wrong function calls, wrong variable names) — verify against actual code
- Missing edge cases the prompt doesn't cover
- Ambiguous instructions Codex might misinterpret
- Safety risks: will this cause unintended file changes?
- Missing context: what info would help Codex execute without hesitation?
- Fix order: are there dependencies between fixes that need explicit sequencing?
- Validation: are the post-fix verification steps sufficient?
- Line numbers: verify all ~line N references against the actual file

Write your findings to: pipeline/chain-state/publicmenu-260408-195008-3a21-codex-findings.md

FORMAT:
# Codex Reviewer Findings — ПССК Prompt Quality Review
Chain: publicmenu-260408-195008-3a21

## Issues Found
1. [CRITICAL/MEDIUM/LOW] Title — Description. PROMPT FIX: ...
2. ...

## Summary
Total: N issues (X CRITICAL, Y MEDIUM, Z LOW)

## Additional Risks
Any risks the prompt author may not have considered.

## Prompt Clarity (MANDATORY — do NOT skip)
- Overall clarity: [1-5]
- What was most clear:
- What was ambiguous or could cause hesitation:
- Missing context:

Do NOT apply any fixes to code files. Analysis only.

=== TASK CONTEXT ===
You are reviewing the quality of a КС implementation prompt for a React/Base44 app.
DO NOT execute the changes. DO NOT read code files. Only review the prompt quality.

Context: SOS Help Drawer v6.0 Part B - rewrite drawer JSX (6-button grid with in-place state) + cleanup dead helpers/state/refs. This is ПССК Round 2 — Round 1 found 2 CRITICAL + 7 MEDIUM issues, all applied. Key fixes applied in R2: safe Step 0 (diff before cp), `other` row error/retry state, sr-only DrawerHeader, 44px ✕ hit areas, component-scope URGENCY_STYLES, grid orientation clarified.

## Your output format (HYBRID — findings + rewritten sections)
For each issue found:
1. **[SEVERITY] Title** — describe the problem
2. **PROMPT FIX:** — describe what to change
3. **REWRITTEN SECTION:** — provide the corrected text/code block ready to paste into the prompt (not the whole prompt, just the changed section with enough context to locate it)

If no issues at severity level → write "None found."

Find issues with the PROMPT DESIGN:
1. Incorrect code snippets (wrong syntax, variable names, line numbers)
2. Missing edge cases
3. Ambiguous instructions
4. Safety risks (unintended file changes)
5. Validation: are post-fix checks sufficient?

---

# SOS Help Drawer v6.0 — Part B: Drawer JSX Rewrite + Cleanup — КС-B
# Runs AFTER КС-A (chain de40, commit 0012e3f) — deployed and verified

## Prerequisites (all confirmed in RELEASE 260408-01, 5458 lines)
КС-A is ALREADY APPLIED. The file now has:
- HELP_REQUEST_TYPES includes plate/utensils/clear_table (line 1835)
- HELP_CARD_LABELS (line 1846), HELP_CARD_SHORT_LABELS (line 1856) — both exist
- HELP_COOLDOWN_SECONDS updated (line 1841)
- HELP_URGENCY_THRESHOLDS (line 1866), HELP_URGENCY_GROUP (line 1870) — exist
- getHelpUrgency (line 1882), getHelpTimerStr (line 1892) — exist
- nonOtherTypes includes plate/utensils/clear_table (line 2215)
- I18N_FALLBACKS EN+RU have all help.* keys
⚠️ HELP_CHIPS (line 1874) and HELP_PREVIEW_LIMIT (line 1834) are STILL present — Fix 5 removes them.
⚠️ Old drawer JSX (lines 4976-5281) still references dead helpers — Fix 3 replaces JSX FIRST, then Fix 5 cleans up.

## Context
File: pages/PublicMenu/x.jsx (TARGET — edit this file ONLY)
RELEASE: `260408-01 PublicMenu x RELEASE.jsx` (5458 lines)
Task: Rewrite DrawerContent children (JSX) + cleanup dead code after replacement.
Weight: H | Budget: $15 | Chain: С5v2
⚠️ ORDER: Fix 3 (JSX rewrite) FIRST → then Fix 5 (cleanup). Fix 5 removes symbols whose ONLY call sites are in old JSX being replaced by Fix 3.

## UX Reference
UX-документ: `ux-concepts/HelpDrawer/260407-00 HelpDrawer UX S234 FINAL.md`
HTML mockup: `ux-concepts/HelpDrawer/260407-01 SOS HelpDrawer Mockup S235.html`
Key decisions (DECISIONS_INDEX §12): in-place state change, 6 buttons in 2 columns × 3 rows (`grid-cols-2`), tap body=safe, ✕=cancel, urgency <8m/8-14m/15m+

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

### STEP 0 — Preflight: Normalize x.jsx (PQ-092: safe normalization)
First: `diff pages/PublicMenu/x.jsx 'pages/PublicMenu/260408-01 PublicMenu x RELEASE.jsx'` — review the diff.
- If diff is ONLY trailing newline or whitespace → proceed with cp.
- If diff contains nontrivial code changes → STOP and report (local drift detected).
Then: `cp 'pages/PublicMenu/260408-01 PublicMenu x RELEASE.jsx' pages/PublicMenu/x.jsx`
Verify: `wc -l pages/PublicMenu/x.jsx` → must be 5458 (± 1 for trailing newline). If significantly different → STOP.

### JSX Replacement Boundary (VERIFIED with RELEASE 260408-01)
Keep: `<Drawer open={isHelpModalOpen}` tag (line 4974).
Keep: `<DrawerContent>` opening tag (line 4975): className="max-h-[85vh] rounded-t-2xl flex flex-col". **D7 rule: do NOT add `relative` to DrawerContent**.
REPLACE: ALL children INSIDE `<DrawerContent>`:
- **Start**: `<div className="relative">` at line 4976 (first child after `<DrawerContent>`)
- **End**: just before `</DrawerContent>` at **line 5282**
- Strategy: Replace every child node of `<DrawerContent>` from the `<div className="relative">` at 4976 through the comment at 5281 inclusive. Lines 5000+ are siblings inside DrawerContent, not children of the first div.
- Includes: the "other" form block (lines 5222-5280) — this gets replaced by new textarea section
Keep: `</DrawerContent>` at line 5282 and `</Drawer>` at line 5283 — do NOT replace these.

Verification grep before edit: `grep -n "</DrawerContent>" pages/PublicMenu/x.jsx` → the help drawer is the THIRD `<DrawerContent>` block; the file currently contains 4 `<DrawerContent>` blocks total (CartView, BottomSheet, Help, and one more). Help drawer's `</DrawerContent>` is at line ~5282.

### STEP 1: Add cancelConfirmTarget state (after showOtherForm — grep `showOtherForm` to find)
```js
const [cancelConfirmTarget, setCancelConfirmTarget] = useState(null); // SOS v6.0 cancel confirm — { type, rowId } or null
```
NOTE: This is an OBJECT `{ type, rowId }` not a string. This safely handles multiple `other` rows.

### STEP 2: Insert SOS_BUTTONS AFTER HELP_URGENCY_GROUP (grep `HELP_URGENCY_GROUP` to find end)
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
Search: `grep -n "handleResolve = useCallback"` to find start. Then find its closing `}, [...]); ` — insert AFTER that line.
```js
const handleSosCancel = useCallback((type, rowId) => {
  const activeRow = rowId
    ? activeRequests.find(r => r.id === rowId)
    : activeRequests.find(r => r.type === type);
  if (!activeRow) return;
  const urgency = getHelpUrgency(type, activeRow.sentAt);
  if (urgency === 'red') {
    setCancelConfirmTarget({ type, rowId: activeRow.id || type });
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
In `openHelpDrawer` (grep `openHelpDrawer = useCallback`): add `setCancelConfirmTarget(null);` after existing resets.
In `closeHelpDrawer` (grep `closeHelpDrawer = useCallback`): add `setCancelConfirmTarget(null);` after existing resets.
KEEP all existing resets: `setIsTicketExpanded(false)`, `setShowOtherForm(false)`, `setHelpComment('')`.

### STEP 6: Replace DrawerContent children (lines 4976-5281) with new JSX
```jsx
{/* SOS v6.0 a11y header — sr-only for screen readers (PQ CC M3) */}
<DrawerHeader className="sr-only">
  <DrawerTitle>{tr('help.modal_title', 'Нужна помощь?')}</DrawerTitle>
</DrawerHeader>

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
<div className="overflow-y-auto flex-1 pb-4">
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
                className="min-w-[44px] min-h-[44px] flex items-center justify-center -mt-0.5 -mr-2 flex-shrink-0">
                <span className={`w-[22px] h-[22px] rounded-full ${s.xBg} ${s.xColor} flex items-center justify-center text-[11px] font-extrabold`}>✕</span>
              </button>
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

  {/* Cancel confirm panel — uses cancelConfirmTarget object {type, rowId} */}
  {cancelConfirmTarget && (
    <div className="mx-3.5 mb-1.5 p-3 bg-red-50 border-[1.5px] border-red-200 rounded-xl">
      <div className="text-sm font-extrabold text-red-900 mb-2.5">
        {tr('help.cancel_confirm_q', 'Отменить запрос?')}
      </div>
      <div className="flex gap-2">
        <button onClick={() => setCancelConfirmTarget(null)}
          className="flex-1 py-2 rounded-lg border-2 border-gray-200 bg-white text-sm font-bold text-gray-700">
          {tr('help.cancel_keep', 'Оставить')}
        </button>
        <button onClick={() => {
            const { type: cType, rowId: cRowId } = cancelConfirmTarget;
            // Guard: if target row no longer exists, just dismiss
            const targetRow = cType === 'other'
              ? activeRequests.find(r => r.id === cRowId)
              : activeRequests.find(r => r.type === cType);
            if (targetRow) {
              handleResolve(cType, cType === 'other' ? cRowId : undefined);
            }
            setCancelConfirmTarget(null);
          }}
          className="flex-1 py-2 rounded-lg bg-red-500 text-white text-sm font-bold">
          {tr('help.cancel_do', 'Отменить')}
        </button>
      </div>
    </div>
  )}

  {/* Active custom "other" requests — PQ-091: includes error state with retry */}
  {activeRequests.filter(r => r.type === 'other').map(row => {
    if (row.errorKind) {
      return (
        <button key={row.id} onClick={() => handleRetry(row)}
          className="mx-3.5 mb-2 px-3 py-2 bg-red-50 border-[1.5px] border-red-400 rounded-[10px] flex items-center justify-between gap-2 w-[calc(100%-28px)] select-none active:bg-red-100">
          <span className="text-[13px] text-red-800 font-semibold flex-1 truncate text-left">
            «{row.message || tr('help.other_label', 'Другое')}»
          </span>
          <div className="text-[12px] font-bold text-red-600 flex items-center gap-[3px] whitespace-nowrap">
            <span className="text-[11px]">⚠</span>{tr('help.retry', 'Повторить')}
          </div>
        </button>
      );
    }
    return (
      <div key={row.id} className="mx-3.5 mb-2 px-3 py-2 bg-orange-50 border-[1.5px] border-orange-500 rounded-[10px] flex items-center justify-between gap-2">
        <span className="text-[13px] text-orange-800 font-semibold flex-1 truncate">
          «{row.message || tr('help.other_label', 'Другое')}»
        </span>
        <span className="text-[12px] font-bold text-orange-500 whitespace-nowrap">⏱ {getHelpTimerStr(row.sentAt)}</span>
        <button onClick={(e) => { e.stopPropagation(); handleSosCancel('other', row.id); }}
          className="min-w-[44px] min-h-[44px] flex items-center justify-center flex-shrink-0 -mr-1">
          <span className="w-[22px] h-[22px] rounded-full bg-orange-500/15 text-orange-800 flex items-center justify-center text-[11px] font-extrabold">✕</span>
        </button>
      </div>
    );
  })}

  {/* "Другой запрос?" link */}
  {!activeRequests.some(r => r.type === 'other') && !showOtherForm && (
    <div className="px-3.5 pb-3">
      <button onClick={() => setShowOtherForm(true)}
        className="text-sm text-gray-400 underline underline-offset-2 bg-transparent border-none cursor-pointer">
        {tr('help.other_request_link', 'Другой запрос?')}
      </button>
    </div>
  )}

  {/* Textarea form for "other" request — REWRITE of existing block (lines 5222-5280) with new styling.
      ALL business logic preserved from original: undo logic, setRequestStates, Array.isArray check,
      pendingQuickSendRef, handlePresetSelect call, cancel button logic.
      Changes: <Button> (shadcn) → <button> (native), primaryColor → bg-orange-500, maxLength 100→120,
      add autoFocus, new placeholder/counter. */}
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

## URGENCY_STYLES — Add as component-scope constant (STEP 2.5)
Insert AFTER SOS_BUTTONS (from Step 2), inside the component body BEFORE `return (`. NOT module-level — it must be near SOS_BUTTONS which depends on component-scope HELP_CARD_LABELS:
```js
const URGENCY_STYLES = {
  neutral: { bg: 'bg-orange-50', border: 'border-orange-500', label: 'text-orange-800', timer: 'text-orange-500', xBg: 'bg-orange-500/15', xColor: 'text-orange-800' },
  amber: { bg: 'bg-amber-50', border: 'border-amber-500', label: 'text-amber-900', timer: 'text-amber-600', xBg: 'bg-amber-500/20', xColor: 'text-amber-800' },
  red: { bg: 'bg-red-50', border: 'border-red-500', label: 'text-red-900', timer: 'text-red-600', xBg: 'bg-red-500/20', xColor: 'text-red-800' },
};
```
Use `const s = URGENCY_STYLES[urgency] || URGENCY_STYLES.neutral;` in the grid JSX instead of 6 separate const assignments.

NOTE: Legacy `menu` requests are hidden from badge count AND from the 6-button grid. They continue to exist in activeRequests but have no UI surface — intentional. A cleanup migration is planned for a future task.

NOTE: `other` rows go through `handleSosCancel('other', row.id)` which routes to confirm if red urgency, or instant cancel otherwise — same flow as the 6 typed buttons.

---

## Fix 5 — Cleanup dead code AFTER Fix 3 replaces JSX [MUST-FIX]

⚠️ ORDER: Apply Fix 5 ONLY AFTER Fix 3 (JSX replacement). Before Fix 3, these symbols have live refs in old JSX.

### 5a. Remove HELP_PREVIEW_LIMIT
`const HELP_PREVIEW_LIMIT = 2;` at line 1834. DELETE entire line.

### 5b. Remove HELP_CHIPS
`const HELP_CHIPS = useMemo(...)` block starting at line 1874 through closing `], []);` at line 1880. DELETE entire block.

### 5c. Remove ticketBoardRef + post-send callback refs
- DELETE `const ticketBoardRef = useRef(null);` at line 1910
- In post-send callback (grep `ticketBoardRef.current`): DELETE 3 lines (scrollIntoView, setHighlightedTicket, setTimeout). KEEP `setIsTicketExpanded(false)` and `setShowOtherForm(false)`.

### 5d. Remove focusHelpRow
DELETE the entire `focusHelpRow = useCallback(...)` block (grep `focusHelpRow`).

### 5e. Remove 7 dead helper functions (PQ-088: include transitively dead)
BEFORE deleting: `grep -n "getHelpReminderWord\|getMinutesAgo\|getHelpWaitLabel\|getHelpReminderLabel\|getHelpResolvedLabel\|getHelpErrorCopy\|getHelpFreshnessLabel" pages/PublicMenu/x.jsx` — verify each is called ONLY within the group or in already-replaced JSX. If any has a call outside these locations → DO NOT DELETE it.
DELETE each of these — their ONLY call sites were in old JSX (now replaced) or in each other:
- `getHelpReminderWord` (line 2631) — called ONLY by getHelpReminderLabel
- `getMinutesAgo` (line 2635) — called ONLY by getHelpWaitLabel + getHelpReminderLabel
- `getHelpWaitLabel` (line 2639)
- `getHelpReminderLabel` (line 2646)
- `getHelpResolvedLabel` (line 2657)
- `getHelpErrorCopy` (line 2668)
- `getHelpFreshnessLabel` (line 2684)

⚠️ DO NOT DELETE `handleRetry` (line 2697) — it is used in the NEW grid JSX (error-state tiles).

### 5f. Remove handleRemind (dead after JSX replacement)
grep `handleRemind` — only called in old drawer JSX (~line 5086). DELETE entire useCallback block.

### 5g. Comment dead state hooks (keep for hook order stability)
```js
const [highlightedTicket, setHighlightedTicket] = useState(null); // SOS v6.0 — dead, kept for hook order until full refactor
const [isTicketExpanded, setIsTicketExpanded] = useState(false); // SOS v6.0 — dead, kept for hook order until full refactor
```

### 5h. Import notes
- `DrawerHeader`, `DrawerTitle` — DO NOT REMOVE. Used in CartView drawer (line 4764-4766) and Bottom Sheet drawer (line 4868-4876).
- `ArrowLeft` (line 4982), `ChevronDown` (line 4991), `MapPin` (line 5003) — their usages WITHIN the replaced block are intentionally removed. Imports kept alive by other usages outside the help drawer (ArrowLeft@1273, ChevronDown@4866, MapPin@161).
- `Layers` — KEEP, used in new napkins button.

### Fix 5 Verification
```
grep -c "HELP_CHIPS\|HELP_PREVIEW_LIMIT\|ticketBoardRef\|focusHelpRow" pages/PublicMenu/x.jsx → 0
grep -c "getHelpReminderWord\|getMinutesAgo\|getHelpWaitLabel\|getHelpReminderLabel\|getHelpResolvedLabel\|getHelpErrorCopy\|getHelpFreshnessLabel\|handleRemind" pages/PublicMenu/x.jsx → 0
grep -c "handleRetry" pages/PublicMenu/x.jsx → ≥ 1 (must still exist!)
grep -c "DrawerHeader\|DrawerTitle" pages/PublicMenu/x.jsx → ≥ 6 (CartView + BS + Help sr-only drawers)
```

---

## ⛔ SCOPE LOCK
Edit ONLY `pages/PublicMenu/x.jsx`.
Allowed changes:
- DrawerContent children (grep `<div className="relative">` after `<DrawerContent>` to find start, grep third `</DrawerContent>` to find end) — REPLACE
- cancelConfirmTarget state (ADD after showOtherForm useState)
- SOS_BUTTONS (ADD after HELP_URGENCY_GROUP, component-scope)
- URGENCY_STYLES (ADD after SOS_BUTTONS, component-scope — NOT module-level)
- handleSosCancel (ADD after handleResolve useCallback)
- activeRequestCount (MODIFY — add `.filter(r => r.type !== 'menu')`)
- openHelpDrawer/closeHelpDrawer (ADD `setCancelConfirmTarget(null)` resets)
- HELP_PREVIEW_LIMIT (DELETE line 1834)
- HELP_CHIPS (DELETE useMemo block lines 1874-1880)
- ticketBoardRef (DELETE line 1910 + post-send refs)
- focusHelpRow (DELETE useCallback block)
- 7 dead helpers + handleRemind (DELETE — NOT handleRetry)
- highlightedTicket, isTicketExpanded (ADD comments only)

DO NOT touch: imports, handleCardTap, handleUndo, handleResolve, handleRetry, CartView drawer, Bottom Sheet drawer, or any code outside Help Drawer.
NOTE: Bell icon badge display (line ~4965) visual treatment is FROZEN — but Step 4 intentionally changes `activeRequestCount` count logic to exclude legacy `menu`. This is allowed.
i18n exception: new tr() calls in JSX use keys already added by КС-A. No new i18n keys needed. The switch from t() to tr() for help.* keys is intentional (provides RU fallback via I18N_FALLBACKS_RU).
NOTE: `pb-4` is used for safe-area padding. If not available in Base44 Tailwind config, it will be silently ignored (fallback: natural padding from content).

## POST-IMPLEMENTATION CHECKS
- 6-button grid renders (call_waiter, bill, plate, napkins, utensils, clear_table)
- tap sends request, ✕ cancels (non-red = instant, red = confirm panel with guard)
- `other` row ✕ goes through handleSosCancel (not direct handleResolve)
- textarea form for "other" sends correctly
- failed `other` row shows retry button (PQ-091: error path for custom requests)
- undo toast 5s with countdown
- error tile shows retry button
- Drawer scrolls when content exceeds viewport (overflow-y-auto flex-1 wrapper)
- `grep -c "cancelConfirmTarget" pages/PublicMenu/x.jsx` → ≥ 3 (state + handler + JSX)
- `grep -c "handleSosCancel" pages/PublicMenu/x.jsx` → ≥ 3 (definition + grid buttons + other row)
- `grep -c "SOS_BUTTONS" pages/PublicMenu/x.jsx` → ≥ 2 (definition + .map)
- `grep -c "URGENCY_STYLES" pages/PublicMenu/x.jsx` → ≥ 2 (definition + usage)
- `grep -c "HELP_CHIPS\|HELP_PREVIEW_LIMIT\|ticketBoardRef\|focusHelpRow\|handleRemind" pages/PublicMenu/x.jsx` → 0
- `grep -c "handleRetry" pages/PublicMenu/x.jsx` → ≥ 1
- `grep -c "DrawerHeader\|DrawerTitle" pages/PublicMenu/x.jsx` → ≥ 6
- `wc -l pages/PublicMenu/x.jsx` — expected ~5370 ± 100 (replacing ~305 old JSX with ~195 new grid incl. a11y header + other error state, removing ~90 lines dead helpers/constants). If < 5150 → ABORT (KB-095).
## MOBILE-FIRST CHECK (MANDATORY before commit)
This is a mobile-first restaurant app. Verify at 375px width:
- [ ] Close/chevron: swipe-down/backdrop dismisses drawer (no explicit ✕ per UX v6.0)
- [ ] Touch targets >= 44x44px (grid buttons min-h-[70px], ✕ buttons 22×22 visual but 44×44 hit area via wrapper)
- [ ] No excessive whitespace on small screens
- [ ] Drawer scrollable with overflow-y-auto when content exceeds viewport
- [ ] 6 buttons visible in 2 columns × 3 rows grid without scrolling

## Regression Check (MANDATORY after implementation)
- [ ] StickyCartBar still shows correct count and opens cart drawer
- [ ] CartView drawer still opens and shows orders (grep `<DrawerContent>` — 3 occurrences: CartView, BottomSheet, Help)
- [ ] Bell icon badge still displays activeRequestCount
- [ ] handleCardTap sends ServiceRequest.create() correctly (test one tap)
- [ ] handleUndo cancels within 5s window

- git add pages/PublicMenu/x.jsx
- git commit -m "SOS v6.0 Part B: drawer JSX rewrite + cleanup dead code"
=== END ===
