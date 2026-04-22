# Help Drawer i18n Fix: HD-23/24/25 — КС Prompt (CC-Updated)
# Version: 1.1 (CC review applied 2026-04-03)
# Changes from v1.0: Full dictionary rewrite (49 entries), HD-25 re-included,
#   Fix 4 (HD-27 HelpFab) removed (B44 prompt needed), inline tr() fallbacks added

## Context
**File:** `pages/PublicMenu/x.jsx` (4503 lines — RELEASE version)
**Task:** Fix Help Drawer (СОС): all Russian strings appear in English mode (HD-23),
  broken counter display (HD-24), double arrow in back button (HD-25).
**Weight:** M | **Budget:** $10 | **Model:** С5v2
**Session:** S215 | **BACKLOG:** #228 (HD-23), #229 (HD-24), #230 (HD-25)

## UX Reference
**UX-документ:** `ux-concepts/HelpDrawer/help-drawer.md` (v5.2)
**Скриншоты:** `outputs/screenshots-S215/` ← актуальные Android-скриншоты из S215
**BACKLOG:** #228/#229/#230 — i18n + counter + double arrow

---

## ⚠️ IMPORTANT: Working Copy vs RELEASE

The authoritative source is the RELEASE file. Before starting:

1. Check working copy line count:
```bash
wc -l pages/PublicMenu/x.jsx
```
Expected: ~4503 lines.

2. If less than 4503, restore from RELEASE (source of truth):
```bash
cp "260401-04 PublicMenu x RELEASE.jsx" pages/PublicMenu/x.jsx
wc -l pages/PublicMenu/x.jsx  # verify: must be 4503
```

Do NOT use `git show HEAD` as fallback — git HEAD may also be truncated (KB-095).
Always prefer the named RELEASE file.

---

## FROZEN UX (DO NOT CHANGE)

These elements are tested and working — do NOT touch:

- `isTicketExpanded` toggle logic (Mode A ↔ Mode B switching)
- `HELP_PREVIEW_LIMIT` constant (line ~1703, value = 2)
- Cooldown timer logic and format: `MM:SS` with `padStart(2, '0')` (lines ~4757-4827)
- Close button (ChevronDown, top-right)
- "Send more" grid: call_waiter / bill / napkins / menu / other cards layout
- "Other" form: chips, textarea, Submit/Cancel buttons
- Undo toast (5-sec timer, Отменить button)
- Badge counter on FAB: `activeRequestCount` (HD-07, tested)
- All drawer sizing, z-index, border-radius, shadow classes
- All colors: primaryColor, orange-800, slate-*, bg-slate-100, etc.
- `handleRemind`, `handleResolve`, `handleUndo`, `handleCardTap` logic
- `HelpFab` component import and usage (do not touch — fix is B44-only)
- All non-help.* translations (the `t()` calls with other key prefixes)

---

## Fix 1 (HD-23 + HD-25): Complete Fallback Dictionary Rewrite

### Problem
The local fallback dictionary in x.jsx contains ALL Russian values.
When server translations are not loaded and English language is selected,
`t()` returns these fallbacks — showing Russian text to English-speaking guests.

HD-25 is also fixed here: `help.back_to_help` currently has `"← К помощи"` which,
combined with the `<ArrowLeft>` icon on line ~4707, produces a double arrow "← ← К помощи".
Removing "←" from the string value fixes HD-25 as part of Fix 1.

### Wireframe — HD-23

```
CURRENT (English mode, Russian text appears):        FIXED:
┌─────────────────────────────────────────┐          ┌──────────────────────────────────────────┐
│ ✕                          Нужна помощь?│          │ ✕                              Need help? │
│        Выберите, чем мы можем помочь    │          │          Choose how we can help           │
│ ┌──────────┐ ┌──────────┐ ┌───────────┐│          │ ┌──────────┐ ┌──────────┐ ┌────────────┐ │
│ │ 🛎       │ │ 🧾       │ │ 🗞        ││          │ │ 🛎        │ │ 🧾        │ │ 🗞         │ │
│ │ Позвать  │ │ Принести │ │ Бумажное  ││          │ │   Call   │ │  Get the │ │   Paper    │ │
│ │официанта │ │  счёт    │ │  меню     ││          │ │  waiter  │ │   bill   │ │   menu     │ │
│ └──────────┘ └──────────┘ └───────────┘│          │ └──────────┘ └──────────┘ └────────────┘ │
└─────────────────────────────────────────┘          └──────────────────────────────────────────┘
```

### Wireframe — HD-25 (double arrow)

```
CURRENT:                         FIXED:
┌──────────────────────────┐     ┌──────────────────────────┐
│ ← ← К помощи             │     │ ← Back to help           │
│   [icon + "← К помощи"]  │     │   [icon + "Back to help"] │
└──────────────────────────┘     └──────────────────────────┘
ArrowLeft icon + "←" in text      ArrowLeft icon + no "←" in text
= double arrow                    = single arrow ✓
```

### What to Change

Find the fallback dictionary:
```
Grep: `"help.call_waiter": "Позвать`
```

Replace ALL 49 entries in the dictionary block (lines ~508–556) with these English values:

```javascript
"help.call_waiter": "Call waiter",
"help.active_requests": "Active requests",
"help.sent_suffix": "sent",
"help.undo": "Cancel",
"help.cancel_request": "Not needed",
"help.modal_title": "Need help?",
"help.modal_desc": "Choose how we can help",
"help.my_requests": "My requests",
"help.active_count": "active",
"help.bill": "Get the bill",
"help.napkins": "Napkins",
"help.menu": "Paper menu",
"help.other": "Other",
"help.other_label": "Other",
"help.send_more": "Send more",
"help.all_requests_cta": "All requests ({count})",
"help.back_to_help": "Back to help",
"help.show_more": "More",
"help.show_less": "Collapse",
"help.requests": "requests",
"help.already_sent_short": "Already sent",
"help.comment_placeholder_other": "E.g.: highchair, cutlery, clear the table",
"help.submit_arrow": "Submit",
"help.closed_by_guest": "✅ Not needed",
"help.sending_now": "Sending…",
"help.retry": "Retry",
"help.remind": "Remind",
"help.retry_in": "In",
"help.just_sent": "Just sent",
"help.waiting_prefix": "Waiting",
"help.minutes_short": "min",
"help.reminded_just_now": "Reminded just now",
"help.reminded_prefix": "Reminded",
"help.last_reminder_prefix": "Last",
"help.reminder_sent": "Reminder sent",
"help.resolved_call_waiter": "✅ Waiter came · Thank you!",
"help.resolved_bill": "✅ Bill delivered · Thank you!",
"help.resolved_napkins": "✅ Napkins brought · Thank you!",
"help.resolved_menu": "✅ Menu brought · Thank you!",
"help.resolved_other": "✅ Done · Thank you!",
"help.no_connection": "No connection",
"help.try_again": "Try again",
"help.remind_failed": "Remind failed",
"help.send_failed": "Failed to send",
"help.restoring_status": "Restoring status…",
"help.offline_status": "No connection · will retry automatically",
"help.stale_status": "Data may be outdated · no updates",
"help.seconds_short": "sec",
"help.updated_label": "Updated",
```

### Verification
1. Grep `help\.[a-z_]*": "` — count should match 49 entries, all English values
2. Grep `"help.back_to_help"` — value must be `"Back to help"` (no "←")
3. Grep `"help.modal_title"` — value must be `"Need help?"`

---

## Fix 2 (HD-24): Fix Inline `tr()` Fallback Strings

### Problem
All `tr('help.key', 'Russian fallback')` calls throughout the file have Russian secondary fallbacks.
While the dictionary (Fix 1) is the primary fallback, these inline values are a third-level backup
and should be consistent with English.

### What to Change

There are ~25 inline `tr()` calls with Russian values. Replace each inline fallback with its English equivalent.

```
Grep: `tr('help\.`
```

Replace inline Russian fallbacks as follows (match by grep pattern, replace 2nd argument only):

```
tr('help.call_waiter', 'Позвать официанта')     → tr('help.call_waiter', 'Call waiter')
tr('help.bill', 'Принести счёт')                → tr('help.bill', 'Get the bill')
tr('help.napkins', 'Салфетки')                  → tr('help.napkins', 'Napkins')
tr('help.menu', 'Бумажное меню')                → tr('help.menu', 'Paper menu')
tr('help.other_label', 'Другое')                → tr('help.other_label', 'Other')
tr('help.reminder_sent', 'Напоминание отправлено') → tr('help.reminder_sent', 'Reminder sent')
tr('help.just_sent', 'Отправлено только что')   → tr('help.just_sent', 'Just sent')
tr('help.waiting_prefix', 'Ждёте')              → tr('help.waiting_prefix', 'Waiting')
tr('help.minutes_short', 'мин')                 → tr('help.minutes_short', 'min')
tr('help.reminded_just_now', 'Напомнили только что') → tr('help.reminded_just_now', 'Reminded just now')
tr('help.reminded_prefix', 'Напомнили')         → tr('help.reminded_prefix', 'Reminded')
tr('help.last_reminder_prefix', 'Последнее')    → tr('help.last_reminder_prefix', 'Last')
tr('help.resolved_call_waiter', '✅ Официант подошёл · Спасибо!') → tr('help.resolved_call_waiter', '✅ Waiter came · Thank you!')
tr('help.resolved_bill', '✅ Счёт принесли · Спасибо!')           → tr('help.resolved_bill', '✅ Bill delivered · Thank you!')
tr('help.resolved_napkins', '✅ Салфетки принесли · Спасибо!')    → tr('help.resolved_napkins', '✅ Napkins brought · Thank you!')
tr('help.resolved_menu', '✅ Меню принесли · Спасибо!')           → tr('help.resolved_menu', '✅ Menu brought · Thank you!')
tr('help.resolved_other', '✅ Выполнено · Спасибо!')              → tr('help.resolved_other', '✅ Done · Thank you!')
tr('help.no_connection', 'Нет связи')           → tr('help.no_connection', 'No connection')
tr('help.try_again', 'Попробуйте ещё раз')      → tr('help.try_again', 'Try again')
tr('help.remind_failed', 'Не удалось отправить напоминание') → tr('help.remind_failed', 'Remind failed')
tr('help.send_failed', 'Не удалось отправить')  → tr('help.send_failed', 'Failed to send')
tr('help.restoring_status', 'Восстанавливаем статус…') → tr('help.restoring_status', 'Restoring status…')
tr('help.offline_status', 'Нет связи · попробуем снова автоматически') → tr('help.offline_status', 'No connection · will retry automatically')
tr('help.stale_status', 'Данные могут быть неактуальны · нет обновления') → tr('help.stale_status', 'Data may be outdated · no updates')
tr('help.closed_by_guest', '✅ Больше не нужно') → tr('help.closed_by_guest', '✅ Not needed')
tr('help.sending_now', 'Отправляем…')           → tr('help.sending_now', 'Sending…')
tr('help.retry', 'Повторить')                   → tr('help.retry', 'Retry')
tr('help.retry_in', 'Через')                    → tr('help.retry_in', 'In')
tr('help.remind', 'Напомнить')                  → tr('help.remind', 'Remind')
tr('help.seconds_short', 'сек')                 → tr('help.seconds_short', 'sec')
tr('help.updated_label', 'Обновлено')           → tr('help.updated_label', 'Updated')
```

### Wireframe — counter after fix

```
CURRENT (English mode):          FIXED:
┌──────────────────────────┐     ┌──────────────────────────┐
│ My requests  4 активных  │     │ My requests       4 active│
│                          │     │                           │
│ All requests ({count})   │     │ All requests (4)          │
└──────────────────────────┘     └──────────────────────────┘
```

### Verification
1. Grep `tr('help\..*'[А-яЁё]` — should return 0 matches (no Cyrillic in tr() fallbacks)
2. Grep `"help.active_count"` in dictionary — must be `"active"`

---

## Fix 3 (HD-24 counter display): Remove standalone counter in Mode B

### Problem
In Mode B (isTicketExpanded = true), the counter `{activeRequestCount} {t('help.active_count')}`
appears as a standalone div below the header title — redundant since the count is already
visible in the cards below.

### What to Change

```
Grep: `isTicketExpanded && activeRequestCount > 0`
```

Find this block (~line 4742):
```jsx
{isTicketExpanded && activeRequestCount > 0 && (
  <div className="text-sm text-slate-500 mb-2 text-center">
    {activeRequestCount} {t('help.active_count')}
  </div>
)}
```

Remove the entire block. The Mode A counter (span at line ~4738) stays — do NOT remove it.

### Wireframe

```
Mode B CURRENT:                  Mode B FIXED:
┌──────────────────────────┐     ┌──────────────────────────┐
│ ← Back to help           │     │ ← Back to help           │
│ My requests              │     │ My requests              │
│   [4 active]   ← REMOVE  │     │ ──────────────────────── │
│ ──────────────────────── │     │ Card 1                   │
│ Card 1                   │     │ Card 2                   │
└──────────────────────────┘     └──────────────────────────┘
```

### Verification
Grep `isTicketExpanded && activeRequestCount > 0` — should return 0 matches.

---

## ❌ NOT IN THIS TASK: HD-27 (Bell button position)

HelpFab.jsx is imported from `@/components/publicMenu/HelpFab` and does NOT exist
in the menuapp-code-review repo. Do NOT attempt to find or edit it.
This fix requires a B44 AI prompt (separate task).

---

## Post-Fix Checklist

1. `wc -l pages/PublicMenu/x.jsx` — must be ≥ 4503 lines (file not truncated)
2. `grep -c '"help\.' pages/PublicMenu/x.jsx` — should be ~99 (49 dict + ~50 inline)
3. `grep 'help\.[a-z_]*.*[А-яЁё]' pages/PublicMenu/x.jsx` — must return 0 (no Cyrillic in help.* values)
4. `grep 'help.back_to_help' pages/PublicMenu/x.jsx` — value must NOT contain "←"
5. `grep 'isTicketExpanded && activeRequestCount > 0' pages/PublicMenu/x.jsx` — must return 0
