# Merge Report — PublicMenu
Chain: publicmenu-260331-221017-8992

## Applied Fixes

1. **[P1-CRIT] Fix 2A — Expand requestStates standard-type structure** — Source: agreed — DONE. Added `lastReminderAt`, `reminderCount`, `remindCooldownUntil` fields with defaults in handleCardTap and onSuccess.
2. **[P1-CRIT] Fix 2B — Convert "other" to array** — Source: agreed — DONE. `requestStates['other']` is now an array of entries with `id`. Updated submit handler, undo handler, onSuccess, onError to handle array.
3. **[P1] Fix 2C — localStorage load/save for new structure** — Source: agreed — DONE. Mount load, openHelpDrawer load, and save effect all handle other-as-array and new fields.
4. **[P1] Fix 2D — getRelativeTime "Ждёте X мин" format** — Source: agreed — DONE. Added >=10min conditional with i18n keys.
5. **[P1-CRIT] Fix 1A — Remove HD-08 summary block** — Source: agreed — DONE. Entire block removed.
6. **[P1-CRIT] Fix 1B — Remove cardActionModal** — Source: agreed — DONE. State declaration, JSX modal block (50 lines), and all setCardActionModal references removed.
7. **[P1] Fix 1C — Cards always idle** — Source: agreed — DONE. Removed status-based className, labels, spinner, pending timestamp. Cards always show idle appearance.
8. **[P1] Fix 1D — "Другое" card always idle** — Source: agreed — DONE. Removed status-based styling and otherDisabled logic. Card always toggles form.
9. **[P1] Fix 1E — Add "Мои запросы" ticket board section** — Source: agreed — DONE. New section with ticketBoardRef, renders active requests as rows with time display, remind/resolve buttons.
10. **[P1] Fix 1F — Conditional "Отправить ещё" header** — Source: agreed — DONE. Shows when activeRequests.length > 0.
11. **[P2] Fix 1G — Clean up pendingRequests memo** — Source: CC-only — DONE. Replaced with `activeRequests` memo that handles both standard types and other-as-array, sorted by sentAt ascending.
12. **[P1] Fix 3 — Smart redirect on re-tap** — Source: agreed — DONE. scrollIntoView + highlightedTicket state (1.5s amber bg-amber-50) + toast "Запрос уже отправлен".
13. **[P1] Fix 4A — handleRemind function** — Source: agreed — DONE. Updates lastReminderAt/reminderCount/remindCooldownUntil, sends via handlePresetSelect (no undo), shows toast.
14. **[P1] Fix 4B — Remind button cooldown in ticket row** — Source: agreed — DONE. Disabled + "Повторить через MM:SS" countdown when remindCooldownUntil > now.
15. **[P2] Fix 4C — Timer interval granularity** — Source: CC-only — DONE. Extended condition: `(undoToast || hasAnyRemindCooldown) ? 1000 : 30000`.
16. **[P2] Fix 5 — Anxiety copy** — Source: agreed — DONE. "Статус обновляется автоматически" with i18n key, shown when activeRequests > 0.
17. **[P1] Fix 6A — Collapse at 4+ threshold** — Source: agreed — DONE. Show 2 + "Ещё N запросов" toggle, with collapse/expand buttons.
18. **[P1] Fix 6B — Sort by sentAt ascending** — Source: agreed — DONE. Built into activeRequests memo.

## Skipped — Unresolved Disputes (for Arman)

None. All disputes (D1 priority labels, D2 status naming) were resolved by comparator.

## Skipped — Could Not Apply

- **[SKIP] Fix 7 — Paid gate** — `partner.plan` not available in x.jsx public context. Both CC and Codex agreed to skip. Record as BACKLOG: need B44 data model change to expose plan field on public endpoint.

## Git
- Commit: 0a85945
- Files changed: 2 (x.jsx, BUGS.md)
- Lines: 4305 → 4425 (+120 lines, expected — new ticket board section)

## Prompt Feedback
- CC clarity score: 4/5
- Codex clarity score: 5/5
- Fixes where writers diverged due to unclear description:
  - Fix 2: Status name ambiguity — task listed `'sent'`/`'remind_available'` but code uses `'pending'`/`'repeat'`. Comparator resolved: keep existing names.
  - Fix 3: Amber highlight style (border vs background) — not specified. Used `bg-amber-50 border-amber-300`.
  - Fix 4: Whether remind uses same submitHelpRequest chain — assumed yes based on existing patterns.
- Fixes where description was perfect (both writers agreed immediately):
  - Fix 1 (remove HD-08, remove cardActionModal, always-idle cards)
  - Fix 5 (anxiety copy — simple addition)
  - Fix 6 (collapse threshold + sort)
  - Fix 7 (skip condition clearly defined)
- Recommendation for improving task descriptions:
  - When introducing new status names alongside existing ones, explicitly state whether to rename or keep old names.
  - For visual changes (highlight style), include specific Tailwind classes in the task.
  - Clarify whether reminder uses the same API chain as initial request or a separate endpoint.

## Summary
- Applied: 18 fixes (17 code + 1 cleanup)
- Skipped (unresolved): 0 disputes
- Skipped (other): 1 fix (Fix 7 — partner.plan not in scope)
- MUST-FIX not applied: 0
- Commit: 0a85945
