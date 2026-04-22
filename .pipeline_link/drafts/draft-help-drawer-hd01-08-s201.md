---
page: PublicMenu
code_file: pages/PublicMenu/x.jsx
budget: 20
agent: cc+codex
chain_template: consensus-with-discussion-v2
status: DRAFT
created: 2026-03-30
session: 201
---

# Help Drawer: Mini-Ticket Board UX (HD-01..HD-08)

Reference: `ux-concepts/HelpDrawer/help-drawer.md` v2.0, `PROMPT_TEMPLATES.md`, `STYLE_GUIDE.md`

⚠️ DRAFT: перед отправкой в queue/ — добавить FROZEN UX section + прогнать prompt-checker.

---

## Context

The Help Drawer (`openHelpDrawer` / HelpDrawerContent in x.jsx) is the guest-facing "Need help?" bottom sheet.
Currently it shows 4 cards (Call Waiter, Bill, Napkins, Menu) + "Other" button with NO feedback after tap.

This task implements the full **mini-ticket board UX**: pending states, per-type cooldowns, timers, undo, badge, summary.

UX spec: `ux-concepts/HelpDrawer/help-drawer.md` v2.0
GPT review: `ux-concepts/HelpDrawer/GPT_HelpDrawer_UX_S201.md`

---

## Fix 1 — HD-01 (P1) [MUST-FIX]: Pending state for each request card

### Сейчас
After tapping any help card (Call Waiter, Bill, Napkins, Menu), the card looks identical — no visual confirmation that the request was sent. Guest doesn't know if it worked.

### Должно быть
Each card has 5 states: `idle` → `sending` → `pending` → `repeat` → `resolved`.

After tap:
1. Card immediately → `sending`: spinner icon + text "Отправляем..."
2. After ~500ms (or server ack): card → `pending` state:
   - Checkmark icon ✓
   - Text: "Запрос отправлен" (NOT "Отправлено" — that sounds final/completed)
   - Subline: timer "2 мин назад" (from HD-03)
   - Background: very soft brand tint (bg-[#F5E6E0], NOT full green — this is pending, not resolved)
   - Card is disabled (no tap)

### НЕ должно быть
- No green "success" state implying the request is fulfilled/waiter arrived
- No card disappearing after tap
- No toast-only feedback (card must change visually)
- No "Отправлено" text (use "Запрос отправлен")

### Файл и локация
File: `pages/PublicMenu/x.jsx`
Component: `HelpDrawerContent` (or similar — search for "openHelpDrawer", "Нужна помощь", "Позвать официанта")
Add state: `requestStates` object, keyed by request type (waiter/bill/napkins/menu/other)
Each value: `{ status: 'idle'|'sending'|'pending'|'repeat'|'resolved', sentAt: timestamp }`

### Проверка
1. Open Help Drawer → tap "Позвать официанта" → card shows spinner briefly → then shows ✓ "Запрос отправлен" with bg-[#F5E6E0] tint
2. Card is disabled (second tap does nothing)

---

## Fix 2 — HD-02 (P1) [MUST-FIX]: Per-type cooldown (not global 5 min)

### Сейчас
No protection against repeated taps. Guest can send same request 5 times.

### Должно быть
After `pending` state, after type-specific cooldown, card transitions to `repeat` state:
- **Call Waiter (waiter):** repeat available after 90 seconds
- **Bill (bill):** repeat available after 150 seconds (2.5 min)
- **Napkins (napkins):** repeat available after 240 seconds (4 min)
- **Menu (menu):** repeat available after 240 seconds (4 min)
- **Other (other):** repeat available after 120 seconds (2 min)

In `repeat` state: card shows original icon + text **"Напомнить персоналу"** (NOT "Повторить запрос")
Tap in repeat state → sends a new request, card goes back to `sending` → `pending`

Cooldown constants:
```
HELP_COOLDOWN_SECONDS = { waiter: 90, bill: 150, napkins: 240, menu: 240, other: 120 }
```

### НЕ должно быть
- No global 5-minute cooldown for all request types
- No text "Повторить запрос?" — use "Напомнить персоналу"
- No blocking repeat indefinitely

### Файл и локация
File: `pages/PublicMenu/x.jsx`
Add constant `HELP_COOLDOWN_SECONDS` near top of component or as module-level const.
Use `requestStates[type].sentAt` + current time to determine if cooldown has passed.

### Проверка
1. Tap "Позвать официанта" → card in pending → after 90 seconds → card shows "Напомнить персоналу" and is tappable again
2. Tap "Меню" → after 4 minutes → card shows "Напомнить персоналу"

---

## Fix 3 — HD-03 (P1) [MUST-FIX]: Timer "X мин назад" on pending cards

### Сейчас
No time indication on sent requests.

### Должно быть
Pending cards show relative time since request was sent:
- `< 60 seconds` → "Только что"
- `1 мин назад`, `2 мин назад`, ..., `N мин назад`

Timer updates every 30 seconds via `setInterval`.
Time is calculated from `requestStates[type].sentAt` timestamp (NOT stored as string).
On page visibility change (`visibilitychange` event) — recalculate immediately.

### НЕ должно быть
- No second-by-second updates (too noisy)
- No storing formatted string in state (always calculate from timestamp)

### Файл и локация
File: `pages/PublicMenu/x.jsx`
Add `useEffect` with `setInterval(updateTimers, 30000)`.
Helper function `getRelativeTime(sentAtMs)` → returns formatted string.

### Проверка
1. Send request → see "Только что" → wait 1+ min → see "1 мин назад"

---

## Fix 4 — HD-04 (P1) [MUST-FIX]: "Другое" button opens textarea with quick-action chips

### Сейчас
"Другое" button behavior is unclear — likely just sends a blank "other" request.

### Должно быть
Tapping "Другое" expands an inline form at the bottom of the drawer:

1. Quick-action chips row: `[Детский стул]` `[Приборы]` `[Соус]` `[Убрать со стола]` `[Вода]`
   - Tapping a chip → inserts text into textarea
2. Textarea below chips: placeholder "Например: детский стул, приборы, убрать со стола"
3. Character counter: "0 / 100" (max 100 chars)
4. Two buttons: [Отмена] [Отправить →]
   - "Отправить" is disabled while textarea is empty or whitespace-only
5. After send: "Другое" card transitions to pending state with preview text: "✓ \"Детский стул...\" · 3 мин"
6. Draft text saved to state while typing (lost on drawer close — do NOT persist in localStorage)

Mobile considerations:
- When textarea is focused, drawer should scroll/adjust so textarea + "Отправить" button remain visible above keyboard
- "Отмена" tapping collapses the form back, returns card to idle

### НЕ должно быть
- No separate screen/page for "Другое"
- No submit enabled on empty/whitespace input
- No full text shown in pending card (truncate at 30 chars + "...")

### Файл и локация
File: `pages/PublicMenu/x.jsx`
Add `otherExpanded` boolean state + `otherDraft` string state.
Quick chips: hardcoded array in component.

### Проверка
1. Tap "Другое" → chips + textarea appear
2. Tap chip "Детский стул" → text inserted in textarea → "Отправить" becomes enabled
3. Tap "Отправить" → card shows ✓ "Детский стул..." · мин
4. Tap "Другое" again → "Отмена" tap → form collapses, card back to idle

---

## Fix 5 — HD-05 (P2) [MUST-FIX]: Persist request states in localStorage (UI cache only)

### Сейчас
Closing and reopening the drawer resets all card states to idle. Guest forgets what they already sent.

### Должно быть
Request states survive drawer open/close via localStorage:
- Key: `helpdrawer_{tableId}` (use tableId from props/context)
- Value: serialized `requestStates` object with timestamps
- On drawer open: load from localStorage, filter out states older than max cooldown (240s)
- On state change: write to localStorage
- On drawer mount: restore states (apply timers, cooldowns)

⚠️ localStorage is UI cache ONLY — not business truth. If server returns error, clear the state.

### НЕ должно быть
- No treating localStorage as source of truth
- No states persisting across table sessions (clear on tableId change)

### Файл и локация
File: `pages/PublicMenu/x.jsx`
`useEffect` on `requestStates` change → `localStorage.setItem(key, JSON.stringify(requestStates))`
`useEffect` on mount → load + filter stale entries

### Проверка
1. Send request → close drawer → reopen drawer → card still shows "Запрос отправлен · N мин"

---

## Fix 6 — HD-06 (P2) [MUST-FIX]: Undo toast for 5 seconds after tap

### Сейчас
No way to cancel accidental tap.

### Должно быть
After any card tap, show a 5-second undo toast at bottom of drawer:
- Text: "[Тип запроса] отправлено · [Отменить (5с)]"
- Countdown in the button: (5с) → (4с) → ... → (0с) then disappears
- If "Отменить" tapped: cancel the pending, card returns to idle (do NOT send to server)
- If 5 seconds pass without cancel: request is confirmed (keep pending state)
- Only one toast at a time (latest request replaces previous toast if another is tapped quickly)

### НЕ должно быть
- No permanent cancel button after 5 seconds
- No toast appearing outside drawer

### Файл и локация
File: `pages/PublicMenu/x.jsx`
Add `undoToast` state: `{ type, expiresAt }` or null.
`useEffect` to clear toast after 5s.

### Проверка
1. Tap "Счёт" → toast appears "Счёт · Отменить (5с)" → tap "Отменить" → card back to idle
2. Tap "Счёт" → wait 5s → toast disappears, card stays in pending

---

## Fix 7 — HD-07 (P2) [MUST-FIX]: Badge on Help button showing active request count

### Сейчас
Help button outside the drawer has no indication of active requests. Guest closes drawer and forgets.

### Должно быть
The "Нужна помощь?" trigger button (outside drawer, wherever it's rendered in PublicMenu) shows a badge:
- Small red dot or number badge when `activeRequestCount > 0`
- Badge shows count (e.g. "2") if 2+ active requests
- Badge disappears when all requests move to repeat/resolved state or cooldowns expire

### НЕ должно быть
- No badge when 0 active requests
- No badge on unrelated buttons

### Файл и локация
File: `pages/PublicMenu/x.jsx`
The button rendering "Нужна помощь?" needs to receive/access `activeRequestCount` (derive from requestStates).
Add small badge overlay: `<span>` with `bg-[#B5543A] text-white rounded-full text-xs` positioned absolute top-right.

### Проверка
1. Send any request → badge "1" appears on Help button outside drawer
2. Send second request → badge shows "2"
3. All cooldowns expire → badge disappears

---

## Fix 8 — HD-08 (P2) [MUST-FIX]: Active requests summary block at top of drawer

### Сейчас
No summary of active requests when reopening drawer.

### Должно быть
If there are any pending requests when drawer opens, show a compact summary block ABOVE the 2×2 card grid:

```
┌──────────────────────────────────┐
│ Активные запросы: 2              │
│ Позвать официанта · 3 мин назад  │
│ Счёт · 1 мин назад               │
└──────────────────────────────────┘
```

- Only visible when `pendingRequests.length > 0`
- List shows type name + relative time (same function as HD-03)
- Subtle styling: bg-[#F5E6E0] with text-slate-700, text-sm, rounded-lg, p-3

### НЕ должно быть
- No summary block when no active requests
- No replacing the card grid (summary is ABOVE the grid, both visible)

### Файл и локация
File: `pages/PublicMenu/x.jsx`
Conditional render above 2x2 grid inside HelpDrawerContent.

### Проверка
1. Send 2 requests → close drawer → reopen → summary block shows "Активные запросы: 2"
2. Zero active requests → summary block not visible

---

## ⛔ SCOPE LOCK — менять ТОЛЬКО то, что указано выше

- Change ONLY the Help Drawer component and its state logic inside `x.jsx`
- DO NOT change: menu browsing, cart logic, order flow, StickyCartBar, checkout, any other drawers
- DO NOT change: PublicMenu layout, dish cards, category chips, search
- DO NOT refactor unrelated code even if it looks improvable
- DO NOT add new B44 entities or API calls (HD-05 is localStorage only — no new backend calls)

## FROZEN UX (DO NOT CHANGE)
⚠️ TO BE FILLED before moving to queue/ — check BUGS_MASTER for 🟢 Tested items in x.jsx

## Implementation Notes
- File: `pages/PublicMenu/x.jsx`
- New state: `requestStates`, `undoToast`, `otherExpanded`, `otherDraft`
- New constants: `HELP_COOLDOWN_SECONDS`, `HELP_REQUEST_LABELS`
- New helpers: `getRelativeTime(ms)`, `getActiveRequests(requestStates)`
- localStorage key: `helpdrawer_{tableId}`
- Ref: `ux-concepts/HelpDrawer/help-drawer.md` v2.0
- git commit after all fixes

## MOBILE-FIRST CHECK (MANDATORY before commit)
This is a mobile-first restaurant app. Primary usage: customer phone at the table.
Before committing, verify ALL changes at 375px viewport width:
- [ ] Drawer content scrollable — all cards + textarea visible with keyboard open
- [ ] Touch targets ≥ 44×44px (chips, cards, buttons)
- [ ] Undo toast visible at bottom, not overlapping cards
- [ ] Quick-action chips wrap properly on 320px
- [ ] "Отправить" button not hidden when keyboard is open
