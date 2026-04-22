# CC Writer Findings — PublicMenu
Chain: publicmenu-260331-221017-8992

## Findings

### Fix 1 — ARCHITECTURE: Ticket board + always-idle cards

1. **[P0] HD-08 summary block must be removed** (lines 3916–3926) — The block `{pendingRequests.length >= 2 && <div>Активные запросы...}` needs to be fully removed and replaced with the new "Мои запросы" ticket board section. The `pendingRequests` memo (lines 1711–1716) should be repurposed or replaced by `activeRequests` which includes both `'pending'` and `'sending'` statuses (currently `activeRequestCount` on line 1707 counts these but there's no array version). FIX: Remove lines 3916–3926. Create a new `activeRequests` array memo (similar to `pendingRequests` but including `'sending'` + `'pending'` + `'repeat'` statuses). Add the "Мои запросы" section before the cards grid (line 3927).

2. **[P0] cardActionModal must be removed entirely** (lines 4080–4129 + state on line 1692) — The `cardActionModal` state and the entire modal JSX block must be deleted. Also remove `setCardActionModal` from the card onClick handler on line 3941. FIX: Delete `const [cardActionModal, setCardActionModal] = useState(null)` on line 1692. Delete the entire JSX block lines 4080–4129. Modify card onClick (line 3941) to no longer call `setCardActionModal` — instead use Fix 3 redirect logic.

3. **[P1] Cards must always render in idle visual state** (lines 3943–3948) — Currently cards change background/border based on `status` (`'pending'` → `bg-[#F5E6E0]`, `'sending'` → `bg-slate-50`, `'repeat'` → `border-amber-300`). Per task: cards should ALWAYS be idle. FIX: Remove status-based className conditional. Cards always use `bg-white border-slate-200 active:border-blue-400 active:bg-blue-50`. Remove the sending spinner (line 3950–3951) and pending timestamp (lines 3962–3964) from card rendering. Cards should show only emoji + label in idle state.

4. **[P1] Card label text must always show idle label** (lines 3957–3961) — Currently labels change: `'sending'` → "Отправляем...", `'repeat'` → "Напомнить персоналу". With always-idle cards, labels must always show `card.label`. FIX: Replace the conditional span content with just `card.label`.

5. **[P1] "Другое" card also needs always-idle treatment** (lines 3970–4006) — Same issue: "Другое" card changes visual state based on `otherStatus`. It should always be idle and clickable. FIX: Remove status-based styling from "Другое" card. Always show idle appearance. Remove `otherDisabled` logic (line 3972). The "Другое" card should always toggle `showOtherForm`.

6. **[P1] Section header "Отправить ещё" needed conditionally** — Per task, when `activeRequests.length > 0`, the cards grid should have a header "Отправить ещё" to distinguish from "Мои запросы" section. FIX: Add conditional `<span>` header before the `<div className="grid grid-cols-2 gap-3">` block: `{activeRequests.length > 0 && <span className="text-sm font-semibold text-gray-700">Отправить ещё</span>}`.

7. **[P2] `pendingRequests` memo may become unused** (lines 1711–1716) — After replacing HD-08 summary with ticket board and using a new `activeRequests` memo, the old `pendingRequests` memo should be cleaned up or repurposed. FIX: Replace `pendingRequests` with `activeRequests` that filters for statuses: `'sending'`, `'pending'`, `'repeat'`, and (for `'other'` array entries) same statuses. Remove old memo if unused.

### Fix 2 — STATE MODEL: Расширить requestStates

8. **[P0] requestStates structure needs expansion** (line 1663, 1693 comment) — Current: `{ status, sentAt, message }`. New fields needed: `lastReminderAt`, `reminderCount`, `remindCooldownUntil`. FIX: Update all places that create/set requestStates entries to include new fields: `handleCardTap` (line 1768), the "Другое" submit (line 4064), the auto-submit onSuccess (line 1800), the timer transition (line 1832). New entries should default: `{ status, sentAt, lastReminderAt: null, reminderCount: 0, remindCooldownUntil: null, message }`.

9. **[P0] "other" type needs to become an array** — Currently `requestStates['other']` is a single object. Per task, each "Другое" tap should create a new entry with a unique `id`. FIX: Change `requestStates['other']` to an array. Each entry: `{ id: crypto.randomUUID() || Date.now().toString(), status, sentAt, lastReminderAt: null, reminderCount: 0, remindCooldownUntil: null, message }`. This requires updating: (a) "Другое" submit handler (line 4059–4073) to push new entry; (b) the `otherSt` read in card rendering (line 3970); (c) `activeRequests` memo to flatten other entries; (d) localStorage persist/restore to handle arrays; (e) showOtherForm guard (line 4009) — always allow toggle since card is always idle.

10. **[P1] localStorage load/save must handle new structure** (lines 1666–1691 load, 1851–1865 save) — Current code only persists `'pending'` and `'repeat'` statuses. Needs to also handle the new fields and the `other` array. FIX: In load effect: parse `other` as array, validate each entry. In save effect: persist entries with `'pending'`, `'repeat'`, `'sending'` (for the new `remind_available` status check if used). For the other array, filter only active entries.

11. **[P1] Timer interval must use `sentAt` not `lastReminderAt`** (lines 1821–1838) — Task explicitly states timer displays must base on `sentAt` (original send time), not `lastReminderAt`. Current code already uses `sentAt` for cooldown transition check (line 1831: `now - state.sentAt`). Verify this stays correct and the ticket board row timer also uses `sentAt`. FIX: In the timer display component (getRelativeTime call), always pass `sentAt`. After 10 min show "Ждёте X мин" format — update `getRelativeTime` (line 1700) to support this.

12. **[P2] getRelativeTime needs "Ждёте X мин" format after 10 min** (line 1700–1704) — Currently only shows "Только что" or "X мин назад". Task requires: <10min "Только что"/"X мин назад", >=10min "Ждёте X мин". FIX: Add condition in `getRelativeTime`: `if (seconds >= 600) return 'Ждёте ${Math.floor(seconds / 60)} мин'`. Use i18n: `t('help.waiting_min', 'Ждёте') + ...`.

### Fix 3 — SMART REDIRECT: Повторный тап на карточку

13. **[P1] Card tap on active request must scroll to ticket board** (line 3941) — Current: `status === 'pending' ? setCardActionModal(card.id) : ...`. New: if not idle, scroll to "Мои запросы" section + amber highlight + toast. FIX: Add `useRef` for the ticket board section (`ticketBoardRef`). Add per-ticket refs or data attributes. In card onClick: if status is not `'idle'` → (a) `ticketBoardRef.current?.scrollIntoView({ behavior: 'smooth' })`, (b) add amber highlight class to the specific ticket row via ref/state for 1.5s, (c) show toast "Запрос уже отправлен — смотри выше". Remove `setCardActionModal` call.

14. **[P2] Need ref infrastructure for scroll + highlight** — No refs currently exist for the ticket board section or individual ticket rows. FIX: Add `const ticketBoardRef = useRef(null)` near other help drawer refs. Add `ref={ticketBoardRef}` on the "Мои запросы" wrapper div. For highlight: use a `highlightedTicket` state (type string or null) + setTimeout to clear after 1500ms.

### Fix 4 — ANTI-SPAM: Кнопка "Напомнить" с cooldown

15. **[P1] `handleRemind` function does not exist yet** — Need to create it. FIX: Add `handleRemind(type)` callback that: (a) updates `requestStates[type]` with `lastReminderAt: now`, `reminderCount + 1`, `remindCooldownUntil: now + 40000`; (b) triggers server send (similar to handleCardTap but WITHOUT undo delay — reminders should send immediately since user already confirmed intent); (c) shows toast "Напоминание отправлено".

16. **[P1] Remind button in ticket row needs cooldown countdown** — The "Напомнить" button in each ticket board row should show "Повторить через MM:SS" when `remindCooldownUntil > Date.now()`, updating every 30s via existing `timerTick`. FIX: In ticket row component, compute `isOnCooldown = entry.remindCooldownUntil && entry.remindCooldownUntil > Date.now()`. If on cooldown: disabled + countdown text. If off cooldown: active "Напомнить" button. Note: 30s interval is coarse for a countdown — consider using 1s interval when any remind cooldown is active (similar to how undoToast triggers 1s interval on line 1839).

17. **[P2] Remind cooldown timer granularity** (line 1839) — Current code already uses 1s interval when `undoToast` is active (`undoToast ? 1000 : 30000`). Should add remind cooldown check: if any entry has `remindCooldownUntil > Date.now()`, also use 1s interval. FIX: Extend condition: `(undoToast || hasAnyRemindCooldown) ? 1000 : 30000`.

### Fix 5 — ANXIETY COPY: "Статус обновляется автоматически"

18. **[P2] Anxiety copy text missing** — Not present in current code. FIX: Add `<p className="text-xs text-gray-400 mt-1 text-center">Статус обновляется автоматически</p>` inside the "Мои запросы" section, after the ticket rows. Use i18n: `t('help.status_auto_update', 'Статус обновляется автоматически')`. Only render when `activeRequests.length > 0`.

### Fix 6 — COLLAPSE: Порог 4+, сортировка по старым

19. **[P1] Ticket board has no collapse logic** — Currently no ticket board exists (being added in Fix 1). The new implementation must include collapse logic: show all if <= 3, show first 2 + "Ещё N запросов" toggle if >= 4. FIX: In the ticket board section: `const showAll = activeRequests.length <= 3 || isTicketExpanded`. Render `showAll ? activeRequests : activeRequests.slice(0, 2)`. Add expand toggle: `{activeRequests.length >= 4 && !isTicketExpanded && <button onClick={() => setIsTicketExpanded(true)}>Ещё {activeRequests.length - 2} запросов</button>}`. Add `const [isTicketExpanded, setIsTicketExpanded] = useState(false)`.

20. **[P1] Ticket rows must be sorted by sentAt ascending** — Oldest first so guest sees longest-waiting request at top. FIX: Sort `activeRequests` by `sentAt` ascending in the memo: `.sort((a, b) => a.sentAt - b.sentAt)`.

### Fix 7 — PAID GATE: Free-план блокирует help drawer

21. **[P2] `partner.plan` not found in x.jsx** — Grepped the file: no references to `partner?.plan` or `partner.plan` exist. The field may not be available in the PublicMenu context (public page likely receives limited partner data). FIX: SKIP Fix 7 — the `plan` field is not available in the current code. Record as finding: "partner.plan not present in x.jsx public context. Paid gate requires either: (a) adding plan to the partner query response, or (b) a B44 data model change to expose plan on public endpoint." This should be a BACKLOG item, not a code fix.

## Summary
Total: 21 findings (3 P0, 12 P1, 6 P2, 0 P3)

- Fix 1: 7 findings (1 P0, 4 P1, 2 P2) — major architecture change
- Fix 2: 5 findings (2 P0, 2 P1, 1 P2) — state model expansion
- Fix 3: 2 findings (1 P1, 1 P2) — scroll redirect
- Fix 4: 3 findings (2 P1, 1 P2) — remind with cooldown
- Fix 5: 1 finding (1 P2) — anxiety copy
- Fix 6: 2 findings (2 P1) — collapse + sort
- Fix 7: 1 finding (1 P2) — SKIP (partner.plan not available)

## Prompt Clarity
- Overall clarity: 4/5
- Ambiguous Fix descriptions:
  - Fix 2: The transition from old status names (`'pending'`, `'repeat'`) to new ones (`'sent'`, `'remind_available'`) is mentioned in the new structure but not explicitly stated as a rename. The code currently uses `'pending'`/`'repeat'`, and the new schema lists `'sent'`/`'remind_available'`. Should we rename existing statuses or keep old names? I assumed we keep functional compatibility and add new fields without renaming statuses to avoid breaking localStorage and existing logic.
  - Fix 3: "Amber highlight строки тикета 1.5 сек" — unclear if this should be border highlight or background highlight. I assumed `bg-amber-50` or `ring-2 ring-amber-300` with transition.
  - Fix 4: "Отправить сервисный запрос (аналог handleCardTap но без undo)" — unclear if remind should go through the same `handlePresetSelect` + `submitHelpRequest` chain or a different API call. I assumed same chain, no undo delay.
- Missing context:
  - Whether the existing `useHelpRequests` hook's `submitHelpRequest` supports a "remind" type or if it just creates a new ServiceRequest each time. This affects Fix 4 implementation.
  - Whether the server-side has any concept of "remind" vs "new request" — or if remind just creates another ServiceRequest of the same type.
- Scope questions:
  - Fix 2 mentions `'resolved'` status but no Fix describes how/when a request becomes resolved (no server-side status polling for help requests visible in the code). Presumably this is future functionality and `'resolved'` is just a placeholder in the enum.
  - The `'sending'` status in current code is a 5-second undo window state. The new schema still lists `'sending'` — confirm this remains the undo-window state, not an actual network-pending state.
