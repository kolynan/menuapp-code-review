---
page: PublicMenu
code_file: pages/PublicMenu/x.jsx
budget: 10
agent: cc+codex
chain_template: consensus-with-discussion-v2
---

# Help Drawer i18n Fix: HD-23/24/25

Reference: `ux-concepts/HelpDrawer/help-drawer.md` v5.2,
Screenshots: `outputs/screenshots-S215/`,
BACKLOG: #228 (HD-23), #229 (HD-24), #230 (HD-25)

---

## ⚠️ STEP 0 (MANDATORY): Restore working copy from RELEASE

Before making any changes, verify the file is not truncated:

```bash
wc -l pages/PublicMenu/x.jsx
```

Expected: 4503 lines. If less than 4503, restore from RELEASE (source of truth):

```bash
cp "pages/PublicMenu/260401-04 PublicMenu x RELEASE.jsx" pages/PublicMenu/x.jsx
wc -l pages/PublicMenu/x.jsx
```

Do NOT use `git show HEAD` — git HEAD may also be truncated (KB-095).
Only proceed after confirming line count is 4503.

---

## FROZEN UX (DO NOT CHANGE)

These elements are tested and working. Do NOT modify:

- `isTicketExpanded` toggle logic (Mode A ↔ Mode B)
- `HELP_PREVIEW_LIMIT` constant (~line 1703, value = 2)
- Cooldown timer logic: `${String(cooldownMin).padStart(2, '0')}:${String(cooldownSecRem).padStart(2, '0')}` format
- Close button (ChevronDown, top-right corner)
- "Send more" grid: call_waiter / bill / napkins / menu / other card layout and behavior
- "Other" form: chips, textarea, Submit/Cancel buttons
- Undo toast (5-sec timer, cancel button)
- Badge counter on FAB: `activeRequestCount` (HD-07)
- All drawer sizing, z-index, border-radius, shadow classes
- All colors: primaryColor, orange-800, slate-*, bg-slate-100
- `handleRemind`, `handleResolve`, `handleUndo`, `handleCardTap` function logic
- `HelpFab` import and usage (do NOT touch — requires B44 fix, out of scope)
- All non-`help.*` translations

---

## Fix 1 (HD-23 + HD-25) [MUST-FIX]: Rewrite fallback dictionary to English

### Сейчас
When English language is selected and server translations are not loaded,
`t()` returns fallback values from the local dictionary — which are all in Russian.
Guest sees Russian text: "Нужна помощь?", "Позвать официанта", "Отменить", etc.

Also: the back button in Mode B shows a double arrow "← ← К помощи" because
the `<ArrowLeft>` icon is rendered AND the dictionary value `"← К помощи"` contains "←".

### Должно быть
Dictionary contains English fallback values. English-mode guests see English text.
Back button shows "← Back to help" (icon only, no "←" in text string).

### НЕ должно быть
- No Cyrillic characters in any `help.*` dictionary value
- No "←" character in `help.back_to_help` value

### Файл и локация
File: `pages/PublicMenu/x.jsx`
Grep: `"help.call_waiter": "Позвать`
Location: the fallback dictionary object (~lines 508–556, 49 entries total)

Replace the ENTIRE dictionary block with these English values:

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

### Проверка
1. Switch app language to English → open Help Drawer → all text is English
2. Grep `"help.back_to_help"` → value must be `"Back to help"` (no "←")
3. Tap "My requests" to enter Mode B → back button shows "← Back to help" (single arrow)

---

## Fix 2 (HD-23 secondary) [MUST-FIX]: Translate inline `tr()` fallback strings

### Сейчас
All `tr('help.key', 'Russian fallback')` calls throughout the file have Russian secondary fallbacks.
If even the dictionary lookup fails, Russian text appears.

### Должно быть
All inline `tr()` fallback strings are in English, consistent with the dictionary.

### НЕ должно быть
No Cyrillic characters as the second argument of any `tr('help.*', ...)` call.

### Файл и локация
File: `pages/PublicMenu/x.jsx`
Grep: `tr('help\.`

Replace inline Russian fallbacks (match by key, change 2nd argument only):

```
tr('help.call_waiter', 'Позвать официанта')       → tr('help.call_waiter', 'Call waiter')
tr('help.bill', 'Принести счёт')                  → tr('help.bill', 'Get the bill')
tr('help.napkins', 'Салфетки')                    → tr('help.napkins', 'Napkins')
tr('help.menu', 'Бумажное меню')                  → tr('help.menu', 'Paper menu')
tr('help.other_label', 'Другое')                  → tr('help.other_label', 'Other')
tr('help.reminder_sent', 'Напоминание отправлено') → tr('help.reminder_sent', 'Reminder sent')
tr('help.just_sent', 'Отправлено только что')      → tr('help.just_sent', 'Just sent')
tr('help.waiting_prefix', 'Ждёте')                → tr('help.waiting_prefix', 'Waiting')
tr('help.minutes_short', 'мин')                   → tr('help.minutes_short', 'min')
tr('help.reminded_just_now', 'Напомнили только что') → tr('help.reminded_just_now', 'Reminded just now')
tr('help.reminded_prefix', 'Напомнили')           → tr('help.reminded_prefix', 'Reminded')
tr('help.last_reminder_prefix', 'Последнее')      → tr('help.last_reminder_prefix', 'Last')
tr('help.resolved_call_waiter', '✅ Официант подошёл · Спасибо!') → tr('help.resolved_call_waiter', '✅ Waiter came · Thank you!')
tr('help.resolved_bill', '✅ Счёт принесли · Спасибо!')           → tr('help.resolved_bill', '✅ Bill delivered · Thank you!')
tr('help.resolved_napkins', '✅ Салфетки принесли · Спасибо!')    → tr('help.resolved_napkins', '✅ Napkins brought · Thank you!')
tr('help.resolved_menu', '✅ Меню принесли · Спасибо!')           → tr('help.resolved_menu', '✅ Menu brought · Thank you!')
tr('help.resolved_other', '✅ Выполнено · Спасибо!')              → tr('help.resolved_other', '✅ Done · Thank you!')
tr('help.no_connection', 'Нет связи')             → tr('help.no_connection', 'No connection')
tr('help.try_again', 'Попробуйте ещё раз')        → tr('help.try_again', 'Try again')
tr('help.remind_failed', 'Не удалось отправить напоминание') → tr('help.remind_failed', 'Remind failed')
tr('help.send_failed', 'Не удалось отправить')    → tr('help.send_failed', 'Failed to send')
tr('help.restoring_status', 'Восстанавливаем статус…') → tr('help.restoring_status', 'Restoring status…')
tr('help.offline_status', 'Нет связи · попробуем снова автоматически') → tr('help.offline_status', 'No connection · will retry automatically')
tr('help.stale_status', 'Данные могут быть неактуальны · нет обновления') → tr('help.stale_status', 'Data may be outdated · no updates')
tr('help.closed_by_guest', '✅ Больше не нужно')  → tr('help.closed_by_guest', '✅ Not needed')
tr('help.sending_now', 'Отправляем…')             → tr('help.sending_now', 'Sending…')
tr('help.retry', 'Повторить')                     → tr('help.retry', 'Retry')
tr('help.retry_in', 'Через')                      → tr('help.retry_in', 'In')
tr('help.remind', 'Напомнить')                    → tr('help.remind', 'Remind')
tr('help.seconds_short', 'сек')                   → tr('help.seconds_short', 'sec')
tr('help.updated_label', 'Обновлено')             → tr('help.updated_label', 'Updated')
```

### Проверка
Grep `tr('help\.[a-z_]*',\s*'[А-яЁё]` → must return 0 matches.

---

## Fix 3 (HD-24) [MUST-FIX]: Remove redundant counter in Mode B

### Сейчас
In Mode B (`isTicketExpanded = true`), a standalone counter div appears below the header:
`{activeRequestCount} {t('help.active_count')}` (e.g. "2 active").
This is redundant — the count is already visible in the request cards below.

### Должно быть
Mode B header has no standalone counter. Only Mode A counter (inside header span) remains.

### НЕ должно быть
The `isTicketExpanded && activeRequestCount > 0` div block must NOT exist.
Do NOT remove the Mode A counter span (the one inside the header row, NOT the full-width div).

### Файл и локация
File: `pages/PublicMenu/x.jsx`
Grep: `isTicketExpanded && activeRequestCount > 0`

Find and remove this block only:
```jsx
{isTicketExpanded && activeRequestCount > 0 && (
  <div className="text-sm text-slate-500 mb-2 text-center">
    {activeRequestCount} {t('help.active_count')}
  </div>
)}
```

Keep this (Mode A counter — do NOT touch):
```jsx
<span className="text-xs text-gray-400">{activeRequestCount} {t('help.active_count')}</span>
```

### Проверка
Grep `isTicketExpanded && activeRequestCount > 0` → must return 0 matches.

---

## ❌ NOT IN THIS TASK: HD-27 (Bell button position)

`HelpFab` is imported from `@/components/publicMenu/HelpFab` — this file does NOT exist
in the menuapp-code-review repo. Do NOT attempt to find or edit it.

---

## ⛔ SCOPE LOCK — change ONLY what is described above

- Edit ONLY: fallback dictionary values, inline `tr()` fallback strings, one `isTicketExpanded` div block
- Do NOT touch: any logic, state, event handlers, layout, colors, other components
- Do NOT touch: any `t()` or `tr()` calls with non-`help.*` keys
- Do NOT touch: `HelpFab` component or its import
- If you notice any other issue — skip it, do not fix

---

## MOBILE-FIRST CHECK (MANDATORY before commit)

This is a mobile-first restaurant app. Verify at 375px width:
- [ ] Help drawer opens fully, close button visible
- [ ] Touch targets >= 44x44px (Remind, Not needed, Submit buttons)
- [ ] No excessive whitespace on small screens
- [ ] Bottom sheet scrollable without losing close button
- [ ] No duplicate visual indicators (counter, arrows)

---

## Regression Check (MANDATORY after implementation)

Verify these existing features still work after changes:

- [ ] Open Help Drawer → can tap "Call waiter" card → request is sent
- [ ] Tap "My requests" → enters Mode B → back button returns to Mode A
- [ ] Remind button shows cooldown timer in MM:SS format
- [ ] Undo toast appears after request, disappears after 5 sec
- [ ] Badge on FAB shows correct count

---

## Implementation Notes

- File: `pages/PublicMenu/x.jsx` (4503 lines, RELEASE 260401-04)
- git add `pages/PublicMenu/x.jsx`
- git commit after all fixes

### Post-fix verification commands:

```bash
# 1. File not truncated
wc -l pages/PublicMenu/x.jsx
# Expected: 4503

# 2. No Cyrillic in dictionary values
grep -n '"help\.[a-z_]*": "[А-яЁё]' pages/PublicMenu/x.jsx
# Expected: 0 matches

# 3. No Cyrillic in tr() fallbacks
grep -n "tr('help\.[^']*', '[А-яЁё]" pages/PublicMenu/x.jsx
# Expected: 0 matches

# 4. FROZEN: back_to_help has no arrow character
grep -n 'back_to_help' pages/PublicMenu/x.jsx
# Expected: value = "Back to help" (no ←)

# 5. FROZEN: Mode B counter div removed
grep -n 'isTicketExpanded && activeRequestCount > 0' pages/PublicMenu/x.jsx
# Expected: 0 matches

# 6. FROZEN: HELP_PREVIEW_LIMIT still present
grep -n 'HELP_PREVIEW_LIMIT' pages/PublicMenu/x.jsx
# Expected: ~3 matches (definition + usage)
```
