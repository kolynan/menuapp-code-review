---
chain: publicmenu-260408-004343-f87a
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

⛔ DO NOT: read code files, run any commands, make any code changes.
✅ DO: analyze only the prompt text provided below in TASK CONTEXT.

For each issue: [CRITICAL/MEDIUM/LOW] Title — Description. PROMPT FIX: what to change in the prompt.

Focus on:
- Incorrect code snippets in the prompt (wrong syntax, wrong function calls, wrong variable names)
- Missing edge cases the prompt doesn't cover
- Ambiguous instructions Codex might misinterpret
- Safety risks: will this cause unintended file changes?
- Missing context: what info would help Codex execute without hesitation?
- Fix order: are there dependencies between fixes that need explicit sequencing?
- Validation: are the post-fix verification steps sufficient?

Write your findings to: pipeline/chain-state/publicmenu-260408-004343-f87a-codex-findings.md

FORMAT:
# Codex Reviewer Findings — ПССК Prompt Quality Review
Chain: publicmenu-260408-004343-f87a

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

Context: Complete redesign of Help Drawer UI (x.jsx) — replace ticket-board + card-grid with in-place 3×2 button grid. Each button changes state in-place (idle → active with timer → urgency colors). 5 fixes: new button types, urgency thresholds, full JSX rewrite, i18n keys, dead state cleanup.

Find issues with the PROMPT DESIGN:
1. Incorrect code snippets (wrong syntax, variable names, line numbers)
2. Missing edge cases (e.g. what happens if undo toast is active and same button type is tapped again?)
3. Ambiguous instructions (e.g. "replace ENTIRE DrawerContent children" — is closing tag included? what about DrawerContent props like className?)
4. Safety risks (unintended file changes, hook order violations, React state update loops)
5. Validation: are post-fix checks sufficient?
6. Scope: are FROZEN UX elements adequately protected?
7. i18n: are all new tr() keys properly defined in BOTH dictionaries?
8. State cleanup: are removed useState hooks replaced with hook-order guards?

---

# SOS Help Drawer v6.0 — In-Place Redesign — КС Prompt

## Context
File: pages/PublicMenu/x.jsx (TARGET — edit this file)
Task: Complete redesign of Help Drawer UI — replace ticket-board + card-grid architecture with in-place state-change model. All 6 buttons always visible in a 3×2 grid. Each button changes state in-place (idle → active with timer → urgency colors). No separate "Мои запросы" section.
Weight: H (architectural UI redesign) | Budget: $20 | Chain: С5v2

## UX Reference
UX document: `ux-concepts/HelpDrawer/260407-00 HelpDrawer UX S234 FINAL.md` (v6.0)
HTML mockup: `ux-concepts/HelpDrawer/260407-01 SOS HelpDrawer Mockup S235.html` (CONTEXT — read as code, it contains exact target UI: Tailwind-equivalent classes, section order, component hierarchy, button labels, urgency colors. Your implementation MUST match this mockup. When Fix description and mockup conflict — mockup wins.)
BACKLOG: #267 (HTML mockup), #269 (button 3 = Тарелку)
DECISIONS_INDEX: §12 (Help Drawer decisions, especially: "СОС новая архитектура: in-place" S234)

## FROZEN UX (DO NOT CHANGE)
These elements are tested and working — DO NOT modify:
- HelpFab button rendering and badge logic (~line 4870-4886) — keep as-is
- `openHelpDrawer` / `closeHelpDrawer` callbacks (~lines 2264-2282) — keep logic, only adjust state resets if needed
- `useHelpRequests` hook integration (~lines 1772-1786) — keep as-is
- ServiceRequest polling and server sync (~lines 2044-2260) — keep all server sync logic
- localStorage persistence logic — keep key format `helpdrawer_${currentTableId}`
- pushOverlay/popOverlay integration for Android Back — keep as-is
- Undo toast mechanism (5s delay before server send) — keep core logic, adapt UI rendering
- All code OUTSIDE the Help Drawer section (MenuView, CartView, StickyCartBar, checkout, hall mode, etc.)

## Fix 1 — Update button set and config constants [MUST-FIX]

### Now
4 preset buttons: `call_waiter`, `bill`, `napkins`, `menu` + separate `other` (full-width).
Grep: `HELP_REQUEST_TYPES = useMemo` (~line 1796)
Grep: `HELP_CARD_LABELS = useMemo` (~line 1800)
Grep: `HELP_COOLDOWN_SECONDS = useMemo` (~line 1799)
Grep: `HELP_CHIPS = useMemo` (~line 1807)

### Should be
6 preset buttons: `call_waiter`, `bill`, `plate`, `napkins`, `utensils`, `clear_table`. Remove `menu` from presets. Keep `other` for "Другой запрос?" secondary link.

Update these constants:

```js
const HELP_REQUEST_TYPES = useMemo(() => new Set([
  'call_waiter', 'bill', 'plate', 'napkins', 'utensils', 'clear_table', 'other'
]), []);

const HELP_CARD_LABELS = useMemo(() => ({
  call_waiter: tr('help.call_waiter', 'Позвать официанта'),
  bill: tr('help.get_bill', 'Счёт'),
  plate: tr('help.plate', 'Тарелку'),
  napkins: tr('help.napkins', 'Салфетки'),
  utensils: tr('help.utensils', 'Приборы'),
  clear_table: tr('help.clear_table', 'Убрать со стола'),
  other: tr('help.other_label', 'Другое'),
}), [tr]);

// SHORT labels for active state (no "официанта" / "со стола" — save space in active button)
const HELP_CARD_SHORT_LABELS = useMemo(() => ({
  call_waiter: tr('help.call_waiter_short', 'Позвать'),
  bill: tr('help.get_bill_short', 'Счёт'),
  plate: tr('help.plate_short', 'Тарелку'),
  napkins: tr('help.napkins_short', 'Салфетки'),
  utensils: tr('help.utensils_short', 'Приборы'),
  clear_table: tr('help.clear_table_short', 'Убрать'),
  other: tr('help.other_label', 'Другое'),
}), [tr]);

const HELP_COOLDOWN_SECONDS = useMemo(() => ({
  call_waiter: 90, bill: 150, plate: 120, napkins: 120, utensils: 120, clear_table: 120, other: 120
}), []);
```

Remove `HELP_CHIPS` entirely (no longer used — the chips quick-suggestion UI is removed in v6.0).

### Should NOT be
- Do NOT keep `menu` in HELP_REQUEST_TYPES
- Do NOT leave old HELP_CHIPS array

### Verification
Grep `HELP_REQUEST_TYPES` — should contain `plate`, `utensils`, `clear_table`, NOT `menu`.
Grep `HELP_CHIPS` — should be 0 occurrences.

---

## Fix 2 — Add urgency threshold config [MUST-FIX]

### Now
No urgency thresholds exist. Timer is shown but no color change based on time.

### Should be
Add urgency threshold constants AFTER `HELP_COOLDOWN_SECONDS` (~line 1799):

```js
// SOS v6.0: Urgency thresholds (seconds)
const HELP_URGENCY_THRESHOLDS = useMemo(() => ({
  std:  { amber: 480,  red: 900  },   // 8m / 15m — call_waiter, plate, napkins, utensils, clear_table
  bill: { amber: 300,  red: 600  },   // 5m / 10m — bill only
}), []);

// Map button type → urgency group
const HELP_URGENCY_GROUP = useMemo(() => ({
  call_waiter: 'std', bill: 'bill', plate: 'std', napkins: 'std', utensils: 'std', clear_table: 'std', other: 'std',
}), []);
```

Add helper function to compute urgency level:
```js
const getHelpUrgency = useCallback((type, sentAt) => {
  if (!sentAt) return 'neutral';
  const elapsedSec = Math.floor((Date.now() - sentAt) / 1000);
  const group = HELP_URGENCY_GROUP[type] || 'std';
  const thr = HELP_URGENCY_THRESHOLDS[group];
  if (elapsedSec >= thr.red) return 'red';
  if (elapsedSec >= thr.amber) return 'amber';
  return 'neutral';
}, [HELP_URGENCY_GROUP, HELP_URGENCY_THRESHOLDS]);
```

Add helper for timer display:
```js
const getHelpTimerStr = useCallback((sentAt) => {
  if (!sentAt) return '';
  const elapsedSec = Math.floor((Date.now() - sentAt) / 1000);
  if (elapsedSec < 60) return '<1м';
  const min = Math.floor(elapsedSec / 60);
  return `${min}м`;
}, []);
```

### Verification
Grep `HELP_URGENCY_THRESHOLDS` — should exist.

---

## Fix 3 — Rewrite drawer JSX: header + grid + cancel confirm [MUST-FIX]

### Now
Current drawer layout (~lines 4889-5170):
- DrawerContent with close button (ChevronDown) + back button (ArrowLeft)
- DrawerHeader centered: "Нужна помощь?" + description
- Table info line with MapPin icon
- Ticket board section ("Мои запросы") with per-request cards
- "Ещё запрос" label
- 4 preset button cards in 2×2 grid
- Full-width "Другое" button
- "Other" form with HELP_CHIPS + textarea
- Undo toast
- Error display

Grep: `<Drawer open={isHelpModalOpen}` (~line 4889)
Grep: `{ticketRows.length > 0 &&` (~line 4922) — start of ticket board
Grep: `grid grid-cols-2 gap-3` (~line 5048) — start of card grid
Grep: `{showOtherForm &&` (~line 5099) — other form
Grep: `{undoToast &&` (~line 5125) — undo toast

### Should be
Replace ENTIRE DrawerContent children (everything between `<DrawerContent>` opening and closing tag) with new v6.0 layout:

```
┌──────────────────────────────────────┐
│ [pill drag handle]                   │
│                                      │
│ Нужна помощь?             [Стол 22]  │  ← one-line header
│ Выберите, что нужно                  │  ← subtitle (hidden when any active)
├──────────────────────────────────────┤
│  ┌─────────────┐  ┌───────────────┐  │
│  │[emoji] Label │  │ [emoji] Label │  │  ← idle buttons: icon + label
│  └─────────────┘  └───────────────┘  │
│  ┌─────────────┐  ┌───────────────┐  │
│  │ Label · Xм ✕│  │ [emoji] Label │  │  ← active: short label + timer + ✕
│  └─────────────┘  └───────────────┘  │
│  ┌─────────────┐  ┌───────────────┐  │
│  │[emoji] Label │  │ [emoji] Label │  │
│  └─────────────┘  └───────────────┘  │
│                                      │
│  [Cancel confirm if red ✕ tapped]    │
│                                      │
│  [Active custom request row if any]  │
│  Другой запрос?                      │  ← secondary link
│  [Textarea form if expanded]         │
└──────────────────────────────────────┘
```

Implementation details for new JSX:

**A. Header** — replace DrawerHeader block:
```jsx
{/* SOS v6.0 Header — one line */}
<div className="px-4 pt-3 pb-2 border-b border-slate-100">
  <div className="flex items-center justify-between">
    <span className="text-[17px] font-extrabold text-gray-900">
      {tr('help.title', 'Нужна помощь?')}
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
```

Remove: close button (ChevronDown), back button (ArrowLeft), centered DrawerHeader, MapPin table line, isTicketExpanded logic.

**B. Button Grid** — replace card grid AND ticket board with single grid:

Define button config array inside render:
```jsx
const SOS_BUTTONS = [
  { id: 'call_waiter', emoji: '🙋', label: HELP_CARD_LABELS.call_waiter, shortLabel: HELP_CARD_SHORT_LABELS.call_waiter },
  { id: 'bill', emoji: '🧾', label: HELP_CARD_LABELS.bill, shortLabel: HELP_CARD_SHORT_LABELS.bill },
  { id: 'plate', emoji: '🍽️', label: HELP_CARD_LABELS.plate, shortLabel: HELP_CARD_SHORT_LABELS.plate },
  { id: 'napkins', icon: 'layers', label: HELP_CARD_LABELS.napkins, shortLabel: HELP_CARD_SHORT_LABELS.napkins },
  { id: 'utensils', emoji: '🍴', label: HELP_CARD_LABELS.utensils, shortLabel: HELP_CARD_SHORT_LABELS.utensils },
  { id: 'clear_table', emoji: '🗑️', label: HELP_CARD_LABELS.clear_table, shortLabel: HELP_CARD_SHORT_LABELS.clear_table },
];
```

For each button, check requestStates to determine state. Active request = the button's type exists in `ticketRows` with isActive=true. Get sentAt from that row.

```jsx
<div className="grid grid-cols-2 gap-[9px] px-3.5 pt-2.5 pb-2">
  {SOS_BUTTONS.map(btn => {
    const activeRow = activeRequests.find(r => r.type === btn.id);
    const isActive = Boolean(activeRow);
    const sentAt = activeRow?.sentAt;
    const urgency = isActive ? getHelpUrgency(btn.id, sentAt) : 'neutral';
    const timerText = isActive ? getHelpTimerStr(sentAt) : '';

    // Urgency-based styles
    const urgencyStyles = {
      neutral: { bg: 'bg-orange-50', border: 'border-orange-500', labelColor: 'text-orange-800', timerColor: 'text-orange-500', xBg: 'bg-orange-500/15', xColor: 'text-orange-800' },
      amber: { bg: 'bg-amber-50', border: 'border-amber-500', labelColor: 'text-amber-900', timerColor: 'text-amber-600', xBg: 'bg-amber-500/[.18]', xColor: 'text-amber-800' },
      red: { bg: 'bg-red-50', border: 'border-red-500', labelColor: 'text-red-900', timerColor: 'text-red-600', xBg: 'bg-red-500/[.18]', xColor: 'text-red-800' },
    };
    const us = isActive ? urgencyStyles[urgency] : null;

    if (isActive) {
      return (
        <div key={btn.id} className={`rounded-xl border-2 ${us.border} ${us.bg} p-[11px] min-h-[70px] flex flex-col justify-between select-none`}>
          <div className="flex items-start justify-between">
            <span className={`text-[13px] font-extrabold ${us.labelColor}`}>{btn.shortLabel}</span>
            <button
              onClick={(e) => { e.stopPropagation(); handleSosCancel(btn.id); }}
              className={`w-[22px] h-[22px] rounded-full ${us.xBg} ${us.xColor} flex items-center justify-center text-[11px] font-extrabold -mt-0.5 flex-shrink-0`}
            >✕</button>
          </div>
          <div className={`text-[12px] font-bold ${us.timerColor} flex items-center gap-[3px] mt-1`}>
            <span className="text-[11px]">⏱</span>{timerText}
          </div>
        </div>
      );
    }

    // Idle state
    return (
      <button
        key={btn.id}
        onClick={() => handleCardTap(btn.id)}
        className="rounded-xl border-2 border-gray-200 bg-gray-50 p-[11px] min-h-[70px] flex flex-row items-center gap-[9px] select-none active:bg-gray-100 active:scale-[0.97] transition-transform"
      >
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
```

**C. Cancel confirm panel** — shown inline under grid when red ✕ tapped:

Add state: `const [cancelConfirmType, setCancelConfirmType] = useState(null);`

`handleSosCancel` function:
```js
const handleSosCancel = useCallback((type) => {
  const activeRow = activeRequests.find(r => r.type === type);
  if (!activeRow) return;
  const urgency = getHelpUrgency(type, activeRow.sentAt);
  if (urgency === 'red') {
    setCancelConfirmType(type);
  } else {
    // Immediate cancel
    handleResolve(type, type === 'other' ? activeRow.id : undefined);
  }
}, [activeRequests, getHelpUrgency, handleResolve]);
```

Cancel confirm JSX (under grid):
```jsx
{cancelConfirmType && (
  <div className="mx-3.5 mb-1.5 p-3 bg-red-50 border-[1.5px] border-red-200 rounded-xl">
    <div className="text-sm font-extrabold text-red-900 mb-2.5">
      {tr('help.cancel_confirm_q', 'Отменить запрос?')}
    </div>
    <div className="flex gap-2">
      <button
        onClick={() => setCancelConfirmType(null)}
        className="flex-1 py-2 rounded-lg border-2 border-gray-200 bg-white text-sm font-bold text-gray-700"
      >{tr('help.cancel_keep', 'Оставить')}</button>
      <button
        onClick={() => {
          const row = activeRequests.find(r => r.type === cancelConfirmType);
          handleResolve(cancelConfirmType, cancelConfirmType === 'other' ? row?.id : undefined);
          setCancelConfirmType(null);
        }}
        className="flex-1 py-2 rounded-lg bg-red-500 text-white text-sm font-bold"
      >{tr('help.cancel_do', 'Отменить')}</button>
    </div>
  </div>
)}
```

**D. "Другой запрос?" link and form** — keep existing `showOtherForm` + textarea but:
- Remove HELP_CHIPS from the form (no chips in v6.0)
- Style the "Другой запрос?" as underlined gray link (not a button card)
- Show active custom request as a row (similar to mockup `.other-active-row`)

```jsx
{/* Active custom request display */}
{activeRequests.some(r => r.type === 'other') && (
  <div className="mx-3.5 mb-2 px-3 py-2 bg-orange-50 border-[1.5px] border-orange-500 rounded-[10px] flex items-center justify-between gap-2">
    <span className="text-[13px] text-orange-800 font-semibold flex-1 truncate">
      «{activeRequests.find(r => r.type === 'other')?.message || '...'}»
    </span>
    <span className="text-[12px] font-bold text-orange-500 whitespace-nowrap">
      ⏱ {getHelpTimerStr(activeRequests.find(r => r.type === 'other')?.sentAt)}
    </span>
    <button
      onClick={(e) => { e.stopPropagation(); handleSosCancel('other'); }}
      className="w-[22px] h-[22px] rounded-full bg-orange-500/15 text-orange-800 flex items-center justify-center text-[11px] font-extrabold flex-shrink-0"
    >✕</button>
  </div>
)}

{/* "Другой запрос?" link */}
{!activeRequests.some(r => r.type === 'other') && !showOtherForm && (
  <div className="px-3.5 pb-4">
    <button
      onClick={() => setShowOtherForm(true)}
      className="text-sm text-gray-400 underline underline-offset-2 bg-transparent border-none cursor-pointer"
    >{tr('help.other_request_link', 'Другой запрос?')}</button>
  </div>
)}

{/* Textarea form for "Другое" */}
{showOtherForm && (
  <div className="mx-3.5 mb-3.5 p-2.5 bg-gray-50 border-[1.5px] border-gray-200 rounded-xl flex flex-col gap-2">
    <textarea
      autoFocus
      value={helpComment}
      onChange={(e) => setHelpComment(e.target.value.slice(0, 120))}
      maxLength={120}
      placeholder={tr('help.other_placeholder', 'Напишите, что нужно…')}
      className="w-full rounded-lg border-[1.5px] border-gray-200 p-2 text-sm min-h-[60px] resize-none focus:outline-none focus:border-orange-500 bg-white text-gray-900"
    />
    <div className="flex gap-[7px]">
      <button
        onClick={() => {
          if (!helpComment.trim()) return;
          handleCardTap('other');
        }}
        className="flex-1 py-[7px] rounded-lg bg-orange-500 text-white text-[13px] font-bold"
      >{tr('help.send_btn', 'Отправить')}</button>
      <button
        onClick={() => { setShowOtherForm(false); setHelpComment(''); }}
        className="py-[7px] px-3.5 rounded-lg bg-white text-gray-500 border-[1.5px] border-gray-200 text-[13px] font-semibold"
      >{tr('common.cancel', 'Отмена')}</button>
    </div>
  </div>
)}
```

**E. Undo toast** — keep but simplify rendering, place AFTER other-req section:
```jsx
{undoToast && (
  <div className="mx-3.5 mb-3 rounded-lg bg-slate-800 text-white px-4 py-3 flex items-center justify-between text-sm">
    <span>{HELP_CARD_LABELS[undoToast.type] || undoToast.type} {tr('help.sent_suffix', 'отправлено')}</span>
    <button onClick={handleUndo} className="text-amber-300 font-medium ml-2 min-h-[44px] min-w-[44px] flex items-center justify-center">
      {tr('help.undo', 'Отмена')} ({Math.max(0, Math.ceil((undoToast.expiresAt - Date.now()) / 1000))})
    </button>
  </div>
)}
```

### Should NOT be
- No DrawerHeader component (replace with custom header div)
- No centered title
- No MapPin icon line
- No "Мои запросы" / ticket board section
- No isTicketExpanded / back button (ArrowLeft)
- No HELP_CHIPS rendering
- No "Ещё запрос" label
- No ChevronDown close button (drawer closes via overlay tap or pull-down, per Vaul behavior)

### Verification
1. Open drawer → see 6 buttons in 3×2 grid, all idle
2. Tap "Позвать" → button shows "Позвать · <1м ✕" with orange border in-place
3. Wait 8+ min → button turns amber
4. Tap ✕ on amber button → immediate cancel → back to idle
5. Wait 15+ min on different button → button turns red → tap ✕ → inline confirm appears
6. Tap "Другой запрос?" → textarea appears → type text → send → row appears

---

## Fix 4 — Add new i18n keys to dictionary [MUST-FIX]

### Now
I18N_FALLBACKS (~line 476) and I18N_FALLBACKS_RU (~line 588) contain old help.* keys.

### Should be
Add new keys to BOTH dictionaries. Exception — i18n dictionary: grep existing keys → add new keys listed below.

**I18N_FALLBACKS (English):**
```js
"help.get_bill": "Bill",
"help.plate": "Extra plate",
"help.utensils": "Utensils",
"help.clear_table": "Clear the table",
"help.call_waiter_short": "Call",
"help.get_bill_short": "Bill",
"help.plate_short": "Plate",
"help.napkins_short": "Napkins",
"help.utensils_short": "Utensils",
"help.clear_table_short": "Clear",
"help.subtitle_choose": "Choose what you need",
"help.table_default": "Table",
"help.cancel_confirm_q": "Cancel request?",
"help.cancel_keep": "Keep",
"help.cancel_do": "Cancel",
"help.other_request_link": "Something else?",
"help.other_placeholder": "Describe what you need…",
"help.send_btn": "Send",
```

**I18N_FALLBACKS_RU (Russian):**
```js
"help.get_bill": "Счёт",
"help.plate": "Тарелку",
"help.utensils": "Приборы",
"help.clear_table": "Убрать со стола",
"help.call_waiter_short": "Позвать",
"help.get_bill_short": "Счёт",
"help.plate_short": "Тарелку",
"help.napkins_short": "Салфетки",
"help.utensils_short": "Приборы",
"help.clear_table_short": "Убрать",
"help.subtitle_choose": "Выберите, что нужно",
"help.table_default": "Стол",
"help.cancel_confirm_q": "Отменить запрос?",
"help.cancel_keep": "Оставить",
"help.cancel_do": "Отменить",
"help.other_request_link": "Другой запрос?",
"help.other_placeholder": "Напишите, что нужно…",
"help.send_btn": "Отправить",
```

### Verification
Grep `help.plate` — should exist in both dictionaries.

---

## Fix 5 — Clean up removed state and imports [MUST-FIX]

### Now
`isTicketExpanded` state, `setIsTicketExpanded` and `highlightedTicket`, `setHighlightedTicket`, `ticketBoardRef` are used only in the old ticket board UI.
`HELP_CHIPS` is used in the old "Other" form.
`HELP_PREVIEW_LIMIT` is used for ticket board truncation.

Grep: `isTicketExpanded` (~line 1827)
Grep: `highlightedTicket` (~line 1826)
Grep: `ticketBoardRef` (~line 1825)
Grep: `HELP_PREVIEW_LIMIT` (~line 1795)

### Should be
- Remove `isTicketExpanded` / `setIsTicketExpanded` state — NOT needed in v6.0
- Remove `highlightedTicket` / `setHighlightedTicket` state — NOT needed
- Remove `ticketBoardRef` — NOT needed
- Remove `HELP_PREVIEW_LIMIT` constant — NOT needed
- Remove `HELP_CHIPS` — NOT needed
- Add `cancelConfirmType` / `setCancelConfirmType` state (new, for red cancel confirm)
- Remove `focusHelpRow` function if it exists (grep first)
- Keep `isTicketExpanded` in useState declaration but remove from JSX IF it's referenced in closeHelpDrawer or other non-JSX code → check before removing

### Should NOT be
- Do NOT remove `requestStates`, `undoToast`, `showOtherForm`, `timerTick`, `pendingQuickSendRef` — these are still used
- Do NOT remove hooks that might break React hook order — if removing a useState, replace with `// reserved — hook order` comment

### Verification
Grep `isTicketExpanded` — should be 0 occurrences in JSX. If in hook cleanup functions, keep with comment.
Grep `HELP_CHIPS` — should be 0 occurrences.

---

## ⛔ SCOPE LOCK — change ONLY what is described above
- Edit ONLY `pages/PublicMenu/x.jsx`
- Change ONLY: drawer JSX layout (~lines 4889-5170), config constants (~lines 1796-1813), i18n dictionaries (~lines 476-620), and dead state cleanup
- DO NOT change: MenuView, CartView, StickyCartBar, CheckoutView, ModeTabs, hall mode rendering, order processing, cart logic, split-order logic
- DO NOT change: ServiceRequest polling logic, server sync hooks, localStorage persistence core
- DO NOT change: HelpFab component (imported, separate file)
- DO NOT change: useHelpRequests hook integration
- DO NOT change: Any code related to orders, menu items, categories, DishDetail, checkout, payment
- Exception — i18n dictionaries: add new keys to I18N_FALLBACKS and I18N_FALLBACKS_RU as specified in Fix 4

## MOBILE-FIRST CHECK (MANDATORY before commit)
This is a mobile-first restaurant app. Verify at 375px width:
- [ ] Close/chevron: drawer closes via pull-down (Vaul behavior), no explicit close button needed
- [ ] Touch targets >= 44x44px for ✕ cancel buttons (currently 22x22 — but they are the only tap target on active buttons which are 70px+ tall)
- [ ] No excessive whitespace on small screens
- [ ] Button grid fits in viewport without scrolling (6 buttons × ~70px = ~420px + header < 85vh)
- [ ] No duplicate visual indicators

## Regression Check (MANDATORY after implementation)
- [ ] Help FAB (bell) button opens drawer correctly
- [ ] Active request count badge on FAB shows correct number
- [ ] ServiceRequest is created on server after 5s undo timeout
- [ ] Undo cancels the request before server send
- [ ] Android Back closes drawer (pushOverlay/popOverlay)
- [ ] Drawer reopens with correct state (localStorage restore)
- [ ] "Другое" textarea sends custom request with message text

## FROZEN UX grep verification
```bash
grep -n "HelpFab" x.jsx         # Should still exist at ~line 4872
grep -n "pushOverlay" x.jsx     # Should still have 'help' overlay registration
grep -n "helpdrawer_" x.jsx     # localStorage key pattern preserved
grep -n "ServiceRequest.create" x.jsx  # Server send preserved
```

## Implementation Notes
- File: `pages/PublicMenu/x.jsx` (5374 lines as of RELEASE 260407-00)
- Expected line count after changes: ~5374 ± 100 (removing ticket board JSX ~200 lines, adding new grid ~150 lines, adding constants ~30 lines)
- `wc -l` check BEFORE commit: if < 5200 → ABORT, file likely truncated (KB-095)
- `tr()` function for new i18n keys (has fallback), `t()` for existing keys
- `handleResolve` already exists — reuse for cancel. `handleCardTap` already exists — reuse for sending.
- `Layers` icon import already exists (from lucide-react) — used for napkins
- `activeRequests` already computed from `ticketRows` — reuse for determining button state
- git add pages/PublicMenu/x.jsx && git commit -m "SOS v6.0: in-place help drawer redesign — 6 buttons, urgency thresholds, cancel confirm"
=== END ===
