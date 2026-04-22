# Help Drawer L-Batch: HD-23/24/25/27 — КС Prompt Draft

## Context
**Files:**
- Primary: `pages/PublicMenu/x.jsx` (~4400+ lines)
- Secondary: search for `HelpFab.jsx` in components (imported as `@/components/publicMenu/HelpFab`)

**Task:** 4 L-weight fixes in Help Drawer (СОС) and its floating button.
**Weight:** L (4 small fixes) | **Budget:** $10 | **Model:** С5v2
**Session:** S215 | **BACKLOG:** #228 (HD-23), #229 (HD-24), #230 (HD-25), #232 (HD-27)

---

## FROZEN UX (DO NOT CHANGE)
These elements are tested and working — do NOT modify:

- Ticket rows structure (cards with Remind + Cancel buttons)
- `isTicketExpanded` toggle logic (Mode A ↔ Mode B switching)
- `HELP_PREVIEW_LIMIT` logic (how many tickets are shown in Mode A)
- Close button (ChevronDown, top-right)
- "Send more" grid: call_waiter / bill / napkins / menu / other cards
- "Other" form: chips, textarea, Submit/Cancel buttons
- Undo toast (5-sec timer, Отменить button)
- Badge counter on FAB (activeRequestCount, HD-07)
- All drawer sizing, z-index, border-radius classes
- All colors: primaryColor, orange-800, slate-*, bg-slate-100, etc.
- `handleRemind`, `handleResolve`, `handleUndo`, `handleCardTap` logic
- `cooldownActive` timer logic and display format `MM:SS`

---

## Fix 1 (HD-23): i18n — Russian strings appear when English language is selected

### Problem
The app has a local translation fallback dictionary in x.jsx. When English is selected
and no server translation is loaded, `t()` returns these fallback values — which are all
in Russian. Fix: change Russian fallback values to English.

There are TWO places to fix:
1. The fallback dictionary object (const/object at top of component)
2. Individual `tr('key', 'Russian fallback')` calls throughout the file

### Wireframe
```
CURRENT (English mode selected, Russian appears):
┌─────────────────────────────────┐
│ My requests          4 активных │  ← "активных" is Russian
│ ┌───────────────────────────────┐│
│ │ Menu                          ││
│ │ Ждёте 30 мин                  ││  ← "Ждёте" Russian
│ │ [Напомнить]  [Cancel request] ││  ← "Напомнить" Russian
│ └───────────────────────────────┘│
│ ← ← К помощи   (Full view)      │  ← "К помощи" Russian
└─────────────────────────────────┘

SHOULD BE (English mode, all English):
┌─────────────────────────────────┐
│ My requests                     │  ← counter removed (Fix 2)
│ ┌───────────────────────────────┐│
│ │ Menu                          ││
│ │ Waiting 30 min                ││
│ │ [Remind]     [Cancel request] ││  ← "Remind" English
│ └───────────────────────────────┘│
│ ← Back to help  (Full view)     │  ← English, single arrow (Fix 3)
└─────────────────────────────────┘
```

### What to change — Part A: fallback dictionary

Grep pattern: `"help.remind":` to find the dictionary block.

Find this dictionary (the exact string values are Russian):
```javascript
"help.remind": "Напомнить",
"help.retry_in": "Через",
"help.active_count": "активных",
"help.all_requests_cta": "Все запросы ({count})",
"help.back_to_help": "← К помощи",
"help.sent_suffix": "отправлено",
"help.reminded_just_now": "Напомнили только что",
"help.reminded_prefix": "Напомнили",
"help.reminder_sent": "Напоминание отправлено",
"help.remind_failed": "Не удалось отправить напоминание",
"help.minutes_short": "мин",
```

Change to English fallbacks:
```javascript
"help.remind": "Remind",
"help.retry_in": "In",
"help.active_count": "active",
"help.all_requests_cta": "All requests ({count})",
"help.back_to_help": "Back to help",
"help.sent_suffix": "sent",
"help.reminded_just_now": "Just reminded",
"help.reminded_prefix": "Reminded",
"help.reminder_sent": "Reminder sent",
"help.remind_failed": "Could not send reminder",
"help.minutes_short": "min",
```

NOTE: Remove "←" from `"help.back_to_help"` — it becomes just `"Back to help"`.
The arrow icon already comes from the JSX (ArrowLeft component). See Fix 3.

### What to change — Part B: tr() hardcoded Russian fallbacks

Grep pattern: `tr('help.remind` and `tr('help.retry_in` and `tr('help.reminded`

Find all `tr('help.*', 'Russian text')` calls and change Russian fallback text to English:

```javascript
// Before:
tr('help.remind', 'Напомнить')
tr('help.retry_in', 'Через')
tr('help.reminded_just_now', 'Напомнили только что')
tr('help.reminded_prefix', 'Напомнили')
tr('help.reminder_sent', 'Напоминание отправлено')
tr('help.remind_failed', 'Не удалось отправить напоминание')

// After:
tr('help.remind', 'Remind')
tr('help.retry_in', 'In')
tr('help.reminded_just_now', 'Just reminded')
tr('help.reminded_prefix', 'Reminded')
tr('help.reminder_sent', 'Reminder sent')
tr('help.remind_failed', 'Could not send reminder')
```

### Verification
Open app in English → open Help Drawer → create a request →
"Remind" button (not "Напомнить"), "In 01:30" cooldown (not "Через 01:30").

---

## Fix 2 (HD-24): Remove "{count} active" counter from "My requests" header

### Problem
The "My requests" header shows `4 {count} active` — the `{count}` template variable
is not interpolated, producing a broken string. User decision: remove the counter
entirely (simpler than fixing interpolation, cleaner UI).

### Wireframe
```
CURRENT:
┌─────────────────────────────────┐
│ My requests    4 {count} active │  ← broken
└─────────────────────────────────┘

SHOULD BE:
┌─────────────────────────────────┐
│ My requests                     │  ← just the label
└─────────────────────────────────┘
```

### What to change

There are TWO places this counter is rendered. Both must be removed.

**Place 1** — In Mode A (main view), "My requests" header right side:
Grep pattern: `activeRequestCount.*help.active_count`

Find this block:
```jsx
{activeRequestCount > 0 && (
  <span className="text-xs text-gray-400">{activeRequestCount} {t('help.active_count')}</span>
)}
```
Remove the entire `{activeRequestCount > 0 && (...)}` block. Keep the `<span>My requests</span>` label on the left.

**Place 2** — In Mode B (full requests view), top subtitle:
Grep pattern: `isTicketExpanded.*activeRequestCount`

Find this block:
```jsx
{isTicketExpanded && activeRequestCount > 0 && (
  <div className="text-sm text-slate-500 mb-2 text-center">
    {activeRequestCount} {t('help.active_count')}
  </div>
)}
```
Remove this entire block.

### Verification
Open Help Drawer with 2+ active requests → "My requests" header shows no number.
Switch to Mode B (full list) → no count subtitle at top.

---

## Fix 3 (HD-25): Double arrow "← ← Back to help" in Full Requests mode

### Problem
The back button in Full Requests mode (isTicketExpanded=true) renders:
`[ArrowLeft icon] [← Back to help text]` = two arrows.

Root cause: the i18n string `"help.back_to_help"` contains "←" as a text character
AND the JSX also renders an `<ArrowLeft>` icon separately.
Fix 1 (HD-23) already removes "←" from the string text → becomes "Back to help".
But double-check: confirm the JSX has `<ArrowLeft ... />` icon + `{t('help.back_to_help')}` text.

### Wireframe
```
CURRENT (Mode B header):
┌─────────────────────────────────────────────────────┐
│ [← ← К помощи]      My requests      [v close]     │
│  ↑ArrowLeft icon + "← К помощи" text = double arrow │
└─────────────────────────────────────────────────────┘

SHOULD BE:
┌─────────────────────────────────────────────────────┐
│ [← Back to help]     My requests      [v close]     │
│  ↑ArrowLeft icon + "Back to help" text = single     │
└─────────────────────────────────────────────────────┘
```

### What to change

Grep pattern: `help.back_to_help` in JSX

Find the back button (in the `isTicketExpanded` conditional block):
```jsx
<button onClick={() => { setIsTicketExpanded(false); }} ...>
  <ArrowLeft className="w-4 h-4" />
  <span>{t('help.back_to_help')}</span>
</button>
```

This is CORRECT structure — ArrowLeft icon + text. The fix is ONLY in the dictionary
value (done in Fix 1): change `"← К помощи"` → `"Back to help"`.

If Fix 1 is applied correctly, Fix 3 is automatically resolved.
**Verify that:** the dictionary entry for `"help.back_to_help"` does NOT contain "←".

### Verification
Open Help Drawer → tap "All requests (N)" → Full view header shows "← Back to help"
(single arrow: the icon, no extra ← in text).

---

## Fix 4 (HD-27): Move Help bell button from right to left

### Problem
The floating Help button (bell/FAB) is positioned `right-4` (bottom-right corner).
This overlaps with the "+" add button on dish cards which is also in the bottom-right area.

### Wireframe
```
CURRENT screen layout (bottom area):
┌─────────────────────────────────────────┐
│  [dish card]  [dish card]               │
│  [name]       [name]                    │
│  [price]  [+] [price]  [+]             │  ← [+] add button (right side of card)
│                                         │
│                              [🔔 bell] │  ← bell overlaps [+]
└─────────────────────────────────────────┘

SHOULD BE:
┌─────────────────────────────────────────┐
│  [dish card]  [dish card]               │
│  [name]       [name]                    │
│  [price]  [+] [price]  [+]             │  ← [+] add button (right side)
│                                         │
│  [🔔 bell]                              │  ← bell on left, no overlap
└─────────────────────────────────────────┘
```

### What to change

The HelpFab component is imported as `@/components/publicMenu/HelpFab`.
Search for the file: `find . -name "HelpFab.jsx" -not -path "*/worktrees/*"`

In HelpFab.jsx, find the wrapper div with `fixed bottom-24 right-4`:
```jsx
<div className="fixed bottom-24 right-4 z-40 md:bottom-8 md:right-8">
```

Change to left-positioned:
```jsx
<div className="fixed bottom-24 left-4 z-40 md:bottom-8 md:left-8">
```

Change BOTH occurrences: mobile (`right-4` → `left-4`) and desktop (`md:right-8` → `md:left-8`).

DO NOT change: z-40, bottom-24, button size, icon, styling, any other classes.

### Verification
Open app in Hall mode with verified table → bell appears in BOTTOM-LEFT corner.
Scroll menu → bell does NOT overlap "+" add buttons on dish cards.

---

## Notes for КС

1. **File version check first:** Before editing, run:
   `wc -l pages/PublicMenu/x.jsx` — should be 4400+ lines.
   If less than 4000 lines, the file may be truncated — restore from git HEAD first.

2. **HelpFab.jsx location:** Use `find` to locate it, do not assume path.
   It may be at `components/publicMenu/HelpFab.jsx` or similar.

3. **Do not fix anything not listed above.** In particular:
   - Do not touch Russian partner-configured data (request type labels: "Вода", "Убрать со стола" etc.) — these come from database, not i18n, Russian is correct.
   - Do not change the `t('help.modal_title')` / `t('help.modal_desc')` if they already have English fallbacks.
   - Do not change any colors, sizes, spacing, or behavior.

4. **Grep before editing.** All patterns provided above. Use grep to confirm location before making changes.
