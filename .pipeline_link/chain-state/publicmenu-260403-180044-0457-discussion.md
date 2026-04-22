# Discussion Report — PublicMenu (PSSK Prompt Review)
Chain: publicmenu-260403-180044-0457

## Overview
This is a CC-only prompt review (Codex failed: auth/model error, 0 bytes output after 3min wait).
Task: Review KS prompt draft for HD-23/24/25/27 Help Drawer L-batch before execution.

## CC Analysis: Code Verification Results

CC read x.jsx (4423 lines) and verified every grep pattern, dictionary entry, and JSX structure
referenced in the prompt against actual code.

**Verdict: PROMPT NOT READY — 6 blockers found, 3 critical.**

---

## Issue 1 (CRITICAL): Fix 1 Part A — Dictionary entries mostly DON'T EXIST

**Problem:** The prompt lists 11 dictionary entries to change in the fallback dictionary.
The ACTUAL dictionary (lines 508-512) has only 5 entries — and NONE match the prompt:

Actual dictionary (lines 508-512):
```
"help.call_waiter": "Позвать официанта",
"help.active_requests": "Активные запросы",
"help.sent_suffix": "отправлено",
"help.undo": "Отменить",
"help.cancel_request": "Больше не надо",
```

Prompt claims these exist in the dictionary — they do NOT:
- `help.remind`, `help.retry_in`, `help.active_count`, `help.all_requests_cta`,
  `help.back_to_help`, `help.reminded_just_now`, `help.reminded_prefix`,
  `help.reminder_sent`, `help.remind_failed`, `help.minutes_short`

**Impact:** KS will fail to find these entries and either skip the fix or make incorrect edits.

**Fix:** Rewrite Part A to target the ACTUAL 5 dictionary entries:
```
"help.call_waiter": "Позвать официанта"   → "Call waiter"
"help.active_requests": "Активные запросы" → "Active requests"
"help.sent_suffix": "отправлено"           → "sent"
"help.undo": "Отменить"                    → "Cancel"
"help.cancel_request": "Больше не надо"    → "Not needed"
```

---

## Issue 2 (CRITICAL): Fix 1 Part B — Covers ~30% of actual Russian strings

**Problem:** The prompt lists 6 `tr()` calls to change. The actual code has 30+ `t()`/`tr()` calls
with Russian fallbacks in the Help Drawer JSX (lines 4027-4243) and helper functions (lines 1655-1721).

**Missing from prompt (all have Russian fallbacks that show in English mode):**

In Help Drawer JSX:
- L4027: `t('help.modal_title', 'Нужна помощь?')` → "Need help?"
- L4028: `t('help.modal_desc', 'Выберите, чем мы можем помочь')` → "Choose how we can help"
- L4042: `t('help.my_requests', 'Мои запросы')` → "My requests"
- L4043: `t('help.active_count', 'активных')` → "active"
- L4071: `tr('help.reminders', 'напоминаний')` → "reminders"
- L4089: `tr('help.resolved', 'Не нужно')` → "Not needed"
- L4101: `t('help.show_more', 'Ещё')` → "More"
- L4101: `t('help.requests', 'запросов')` → "requests"
- L4109: `t('help.show_less', 'Свернуть')` → "Collapse"
- L4116: `t('help.status_auto_update', 'Статус обновляется автоматически')` → "Status updates automatically"
- L4121: `t('help.send_more', 'Отправить ещё')` → "Send more"
- L4126: `t('help.call_waiter', 'Позвать официанта')` → "Call waiter" (inline)
- L4127: `t('help.bill', 'Принести счёт')` → "Get the bill"
- L4128: `t('help.napkins', 'Салфетки')` → "Napkins"
- L4129: `t('help.menu', 'Бумажное меню')` → "Paper menu"
- L4142: `t('help.already_sent', 'Запрос уже отправлен — смотри выше')` → "Request already sent — see above"
- L4167: `t('help.other', 'Другое')` → "Other"
- L4190: `t('help.comment_placeholder_other', 'Например: детский стул, приборы, убрать со стола')` → "E.g.: highchair, cutlery, clear table"
- L4199: `t('help.sent_suffix', 'отправлено')` → "sent" (inline)
- L4201: `t('help.undo', 'Отменить')` → "Cancel" (inline)
- L4243: `t('help.submit_arrow', 'Отправить')` → "Submit"

In helper functions:
- L1655-1659: HELP_CARD_LABELS — `t('help.call_waiter/bill/napkins/menu/other_label', ...)`
- L1718: `t('help.just_now', 'Только что')` → "Just now"
- L1720: `t('help.waiting', 'Ждёте')` → "Waiting", `t('help.min_short', 'мин')` → "min"
- L1721: `t('help.min_ago', 'мин назад')` → "min ago"
- L1856: `t('help.reminder_sent', 'Напоминание отправлено')` → "Reminder sent"

**Impact:** After KS applies the prompt, 70% of strings will still show in Russian when English is selected.

**Fix:** Rewrite Fix 1 to include ALL `help.*` strings. Provide a complete list with exact Russian→English mappings.

---

## Issue 3 (CRITICAL): Fix 3 (HD-25) — The described button DOES NOT EXIST

**Problem:** The prompt describes a "back to help" button with `<ArrowLeft>` icon + text `"← К помощи"`.
This button does NOT exist in the Help Drawer code.

**What actually exists:**
- The expand/collapse uses Show more/Show less buttons (lines 4096-4110):
  `{t('help.show_more', 'Ещё')} {N} {t('help.requests', 'запросов')}`
  `{t('help.show_less', 'Свернуть')}`
- The ArrowLeft at line 1098 is in `OrderConfirmationScreen`, NOT in the Help Drawer.
- There is no `help.back_to_help` key anywhere in the code.
- There is no "full requests mode" with a separate back button.

**Impact:** KS will search for non-existent code, waste time, and potentially make incorrect edits.

**Fix:** Remove Fix 3 entirely. The bug HD-25 may be from a design spec, not actual code.
Or: if HD-25 is a future feature, mark it as "not yet implemented — skip".

---

## Issue 4 (MAJOR): Fix 2 — Wrong grep pattern + Place 2 doesn't exist

**Problem:**
1. Grep pattern says `activeRequestCount.*help.active_count` — but actual code at line 4043 uses
   `activeRequests.length` (not `activeRequestCount`). The variable `activeRequestCount` exists
   at line 1750 but is used for the badge (line 4008), not the counter.
2. "Place 2" (Mode B subtitle with `isTicketExpanded && activeRequestCount > 0`) does NOT exist.
   The actual code has no such element.

**Actual code at line 4043:**
```jsx
<span className="text-xs text-gray-400">{activeRequests.length} {t('help.active_count', 'активных')}</span>
```

**Fix:** Correct grep pattern to `activeRequests.length.*help.active_count` and remove Place 2.

---

## Issue 5 (MAJOR): Fix 4 — HelpFab.jsx not in repo, KS can't edit it

**Problem:** HelpFab.jsx is imported from `@/components/publicMenu/HelpFab` (line 98).
This file does NOT exist in the `pages/PublicMenu/` folder or anywhere in the menuapp-code-review repo.
The `find` command will return nothing. KS edits only files in pages/[PageName]/.

**Impact:** Fix 4 is impossible via KS.

**Fix:** This requires a B44 AI prompt (Rule 31), not a KS task. Remove Fix 4 from the KS prompt
and create a separate BACKLOG item for a B44 prompt to move HelpFab from right to left.

---

## Issue 6 (MINOR): FROZEN UX list has inaccuracies

**Problem:** FROZEN UX mentions:
- `"back_to_help"` text — doesn't exist in the code
- `HELP_PREVIEW_LIMIT` — not found with grep (the logic uses `activeRequests.length <= 3`)
- `cooldownActive` timer with `MM:SS` format — actual format is `00:00` zero-padded, not `MM:SS`

These don't cause harm (FROZEN = do not change) but indicate the prompt author didn't verify against actual code.

---

## Resolution Summary

| # | Issue | Severity | Resolution |
|---|-------|----------|------------|
| 1 | Fix 1 Part A dictionary entries don't exist | CRITICAL | Rewrite with actual 5 entries |
| 2 | Fix 1 Part B covers only 30% of strings | CRITICAL | Add all 30+ help.* strings |
| 3 | Fix 3 button doesn't exist | CRITICAL | Remove Fix 3 entirely |
| 4 | Fix 2 wrong grep + phantom Place 2 | MAJOR | Fix grep pattern, remove Place 2 |
| 5 | Fix 4 HelpFab.jsx not in repo | MAJOR | Move to B44 prompt, remove from KS |
| 6 | FROZEN UX inaccuracies | MINOR | Update for accuracy |

## Final Verdict

**PROMPT NOT READY FOR KS.**

Only Fix 2 (HD-24) is salvageable with corrections. Fix 1 (HD-23) needs complete rewrite.
Fix 3 (HD-25) and Fix 4 (HD-27) target non-existent code/files and must be removed.

### Recommended next steps:
1. **Rewrite Fix 1** with complete list of ALL `help.*` Russian→English mappings (both dictionary + inline)
2. **Fix Fix 2** grep pattern: `activeRequests.length` not `activeRequestCount`; remove Place 2
3. **Remove Fix 3** (HD-25) — the described UI element doesn't exist
4. **Remove Fix 4** (HD-27) → create B44 AI prompt in BACKLOG instead
5. **Re-run prompt-checker** after rewrite

### Codex Status
Codex CLI failed to run (auth/model error — `codex-mini` model not supported with ChatGPT account).
All analysis is CC-only.
