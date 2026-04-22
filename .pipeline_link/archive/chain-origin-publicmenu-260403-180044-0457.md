---
page: PublicMenu
chain_template: discussion-only
budget_usd: 4
agent: cc+codex
topic: "ПССК: Review and improve КС prompt for Help Drawer L-batch (HD-23/24/25/27)"
---

# ПССК: Review КС Prompt — HD-23/24/25/27 Help Drawer L-batch

## Instructions for CC and Codex

You are reviewing a КС (Chain Constructor) task prompt before it is sent to execution.
Your goal: find gaps, ambiguities, or risks in the prompt — and return an improved version.

DO NOT implement the fixes. Your job is only to review and improve the PROMPT itself.

## Review criteria

1. **Completeness** — Are all 4 fixes fully described? Can the executing agent complete each fix without questions?
2. **Grep patterns** — Are the grep patterns precise enough to uniquely identify the target code? Any risk of false matches?
3. **FROZEN UX** — Is the frozen list comprehensive? Anything important missing that КС might accidentally change?
4. **Edge cases** — Any missed edge cases? (e.g., other files that reference the same strings, mobile vs desktop variants)
5. **Fix 3 dependency** — Fix 3 (HD-25) depends on Fix 1 (HD-23). Is this dependency clearly stated and safe?
6. **HelpFab file location** — The prompt says "search with find". Is this instruction sufficient or should it be more specific?
7. **Translation system** — The prompt assumes changing fallback dict values is enough. Is there any risk this breaks Russian mode?

## Draft prompt to review

---

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

### What to change — Part A: fallback dictionary

Grep pattern: `"help.remind":` to find the dictionary block.

Find these entries (exact Russian values):
```
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

Change to:
```
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

Grep: `tr('help.remind` and `tr('help.retry_in` and `tr('help.reminded`

```javascript
// Before → After:
tr('help.remind', 'Напомнить')         → tr('help.remind', 'Remind')
tr('help.retry_in', 'Через')           → tr('help.retry_in', 'In')
tr('help.reminded_just_now', 'Напомнили только что') → tr('help.reminded_just_now', 'Just reminded')
tr('help.reminded_prefix', 'Напомнили') → tr('help.reminded_prefix', 'Reminded')
tr('help.reminder_sent', 'Напоминание отправлено') → tr('help.reminder_sent', 'Reminder sent')
tr('help.remind_failed', 'Не удалось отправить напоминание') → tr('help.remind_failed', 'Could not send reminder')
```

### Verification
Open app in English → Help Drawer → create request → "Remind" (not "Напомнить"), cooldown shows "In 01:30" (not "Через 01:30").

---

## Fix 2 (HD-24): Remove "{count} active" counter from "My requests" header

### Problem
Header shows `4 {count} active` — broken template. Decision: remove counter entirely.

### What to change

**Place 1** — Mode A header right side:
Grep: `activeRequestCount.*help.active_count`
```jsx
// REMOVE this entire block:
{activeRequestCount > 0 && (
  <span className="text-xs text-gray-400">{activeRequestCount} {t('help.active_count')}</span>
)}
```

**Place 2** — Mode B top subtitle:
Grep: `isTicketExpanded.*activeRequestCount`
```jsx
// REMOVE this entire block:
{isTicketExpanded && activeRequestCount > 0 && (
  <div className="text-sm text-slate-500 mb-2 text-center">
    {activeRequestCount} {t('help.active_count')}
  </div>
)}
```

Keep the `<span>My requests</span>` label. Only remove the counter spans.

### Verification
Help Drawer with 2+ active requests → "My requests" header has no number.

---

## Fix 3 (HD-25): Double arrow "← ← К помощи" in Full Requests mode

### Problem
Back button renders `[ArrowLeft icon] + [← К помощи text]` = two arrows.
Root cause: the i18n string contains "←" AND the JSX renders an ArrowLeft icon.

### What to change
Fix 3 is automatically resolved by Fix 1 — changing `"help.back_to_help"` from
`"← К помощи"` to `"Back to help"` removes the duplicate "←" from the text.

**Verify that the JSX structure is:**
```jsx
<button onClick={() => { setIsTicketExpanded(false); }} ...>
  <ArrowLeft className="w-4 h-4" />
  <span>{t('help.back_to_help')}</span>
</button>
```

After Fix 1: button renders `[← icon] Back to help` = single arrow. ✓

### Verification
Open Help Drawer → tap "All requests" → full list header shows `← Back to help` (single arrow).

---

## Fix 4 (HD-27): Move Help FAB button from right to left

### Problem
Floating bell button is `right-4` (bottom-right) — overlaps "+" add buttons on dish cards.

### What to change

Find HelpFab.jsx:
```bash
find . -name "HelpFab.jsx" -not -path "*/worktrees/*" -not -path "*/versions/*"
```

In HelpFab.jsx, find wrapper div:
```jsx
// Before:
<div className="fixed bottom-24 right-4 z-40 md:bottom-8 md:right-8">

// After:
<div className="fixed bottom-24 left-4 z-40 md:bottom-8 md:left-8">
```

Change `right-4` → `left-4` and `md:right-8` → `md:left-8`.
DO NOT change: z-40, bottom-24, button size, colors, any other classes.

### Verification
Open app Hall mode with table verified → bell in BOTTOM-LEFT, does not overlap "+" buttons.

---

## Notes for КС
1. File check first: `wc -l pages/PublicMenu/x.jsx` — must be 4000+ lines. If less, restore from git HEAD.
2. Use grep patterns provided. Do NOT rely on line numbers.
3. Do NOT change Russian text in partner-configured data (request type labels like "Вода", "Убрать со стола" — these come from DB, not i18n).

---

## Expected output from CC and Codex

Return for each issue found:
1. **Issue description**: what is unclear/risky/missing
2. **Suggested fix**: improved wording or additional instruction
3. **Final improved prompt sections** (only the changed parts)

At the end, provide a final verdict: "Prompt ready for КС" or list remaining blockers.
