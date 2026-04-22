---
page: PublicMenu
code_file: pages/PublicMenu/x.jsx
budget: 23
agent: cc+codex
chain_template: consensus-with-discussion-v2
---

# Help Drawer Phase 1 — Architecture Redesign (v5.1)

**Production page:** PublicMenu (/x). File: `pages/PublicMenu/x.jsx` (4305 lines).

**Reference docs:**
- `ux-concepts/HelpDrawer/help-drawer.md` v5.1 — HD-01..HD-18, ASCII layouts, state model
- `ux-concepts/HelpDrawer/GPT_HelpDrawer_UX_S209.md` — ticket board architecture (stack B+C+D+E)
- `ux-concepts/HelpDrawer/GPT_HelpDrawer_Remind_S210.md` — remind flow, smart redirect, collapse thresholds

**Context:**
The Help Drawer currently uses a per-card state model where cards change color and label text when requests are pending/repeat. The redesign moves to a **ticket board architecture** with two clear sections:
1. "Мои запросы" — ticket board (only when active requests exist)
2. "Отправить ещё" — action cards, **always idle appearance**

Cards never change color/state. All status tracking moves to the ticket board above.

---

## TARGET FILES (modify)
- `pages/PublicMenu/x.jsx`

## CONTEXT FILES (read-only)
- `ux-concepts/HelpDrawer/help-drawer.md`
- `ux-concepts/HelpDrawer/GPT_HelpDrawer_UX_S209.md`
- `ux-concepts/HelpDrawer/GPT_HelpDrawer_Remind_S210.md`

---

## Fix 1 — ARCHITECTURE: Two-section ticket board layout [MUST-FIX]

### Current behavior
The drawer shows a grid of action cards. When a request is pending, its card changes color (bg-[#F5E6E0] border for pending, amber border for repeat) and displays status text ("✓ 2 мин назад") directly on the card. A separate HD-08 summary block appears above cards when 2+ requests are active. Tapping a pending card opens a `cardActionModal` bottom sheet with "Напомнить персоналу" and "Больше не надо" buttons.

### Expected behavior
**Two distinct sections inside the Drawer:**

**Section 1 — "Мои запросы"** (ticket board):
- Appears ONLY when at least 1 request has status `pending` or `remind_available`
- Header: `Мои запросы` (or `Мои запросы · N` when N ≥ 2)
- Each request = one row in the board:
  ```
  [emoji] [Label]                    [Уже помогли / Уже принесли]
  Отправлено X мин назад
  [Напомнить] (when remind_available)
  ```
- Emoji per type: call_waiter=🙋, bill=📋, napkins=🧻, menu=📄, other=✏️
- Soft-close button label per type:
  - `call_waiter`: "Уже помогли"
  - `bill`, `napkins`, `menu`: "Уже принесли"
  - `other`: "Неактуально"
- Soft-close action: local-only (remove from requestStates + localStorage), no server call
- "Напомнить" button: appears only after `remind_available` status (uses existing HELP_COOLDOWN_SECONDS timing)
- Anti-spam on "Напомнить": see Fix 4

**Section 2 — "Отправить ещё"** (action cards):
- Label "Отправить ещё" only visible when Section 1 is present; hidden when no active requests
- Cards grid ALWAYS appears idle (white background, slate border) — no color changes based on request status
- Same 5 cards: call_waiter, bill, napkins, menu, Другое
- Cards are always tappable (except brief `sending` spinner state lasting max 300-500ms during undo window)

**ASCII layout reference (from help-drawer.md):**
```
State B — 1 active request:
┌──────────────────────────────────────┐
│ Нужна помощь?           [✕]          │
│ 📍 Стол 2                            │
│                                      │
│ Мои запросы                          │
│ ┌────────────────────────────────┐   │
│ │ 📋 Счёт          [Уже принесли]│   │
│ │ Отправлено 3 мин назад         │   │
│ │ [Напомнить]                    │   │
│ └────────────────────────────────┘   │
│ Статус обновляется автоматически     │ ← anxiety copy
│                                      │
│ Отправить ещё                        │
│ ┌──────────────┐  ┌──────────────┐   │
│ │      🙋      │  │      📋      │   │
│ │ Позвать      │  │ Счёт         │   │
│ └──────────────┘  └──────────────┘   │
│ ... (always idle) ...                │
└──────────────────────────────────────┘
```

### Must NOT
- ❌ Cards changing bg-color/border/text when status is `pending` or `repeat`
- ❌ Per-card "✓ 2 мин назад" text displayed on action card buttons
- ❌ Old HD-08 summary block (search `{/* HD-08: Active requests summary block */}`, ~lines 3916–3926) — **remove entirely, replace with ticket board**
- ❌ `cardActionModal` sheet for standard types (search `{/* HD-01v3: Card action modal */}`, ~lines 4080–4130) — **remove entirely**
- ❌ Cards showing "Напомнить персоналу" text as label in repeat state
- ❌ "Отправить ещё" label when 0 active requests

### File and location
File: `pages/PublicMenu/x.jsx`
- Current HD-08 block: search `{/* HD-08: Active requests summary block */}` (~line 3916)
- Cards grid: search `{/* HD-01: Per-card state help cards */}` (~line 3927)
- cardActionModal: search `{/* HD-01v3: Card action modal */}` (~line 4080)
- State section: search `// HD-01..HD-08: Help drawer mini-ticket board state` (~line 1652)

**Insert ticket board** between Drawer header and cards grid, replacing the HD-08 block.
Add `ticketBoardRef = useRef(null)` and row-level refs for scroll/highlight in Fix 3.

### Verification
1. Open help drawer with 0 requests → only action cards visible, no "Мои запросы" header, no "Отправить ещё" label
2. Tap "Счёт" card → 5s undo window passes → "Мои запросы" section appears with "📋 Счёт" row; "Отправить ещё" label appears above cards grid
3. "📋 Счёт" card in "Отправить ещё" shows normal white/slate idle appearance (no color change)
4. Tap "Уже принесли" on the Счёт row → row disappears, "Мои запросы" section hides

---

## Fix 2 — STATE MODEL: Two timestamps + reminder history [MUST-FIX]

### Current behavior
`requestStates[type]` shape: `{ status, sentAt, message }` — single timestamp, no reminder history.
State machine uses `'repeat'` status.

### Expected behavior
**Extended state shape per standard type:**
```js
requestStates[type] = {
  status: 'idle' | 'sending' | 'pending' | 'remind_available',
  sentAt: timestamp_ms,            // original send time — NEVER changes after initial set
  lastReminderAt: null | timestamp_ms,  // updated on each remind tap
  reminderCount: 0,                // incremented on each remind tap
  remindCooldownUntil: null | timestamp_ms,  // anti-spam expiry (Fix 4)
  message: undefined               // for other type only
}
```
Note: rename internal `'repeat'` status to `'remind_available'` if doing so is clean; otherwise keep `'repeat'` as alias but ensure display logic uses correct label.

**For `other` type — support multiple entries:**
```js
requestStates.other = [
  { id: Date.now() + Math.random(), status, sentAt, lastReminderAt, reminderCount, remindCooldownUntil, message },
  // ... each tap creates a new array item
]
```
- Each "Другое" submission → pushes a new item to the array
- "Другое" card is always tappable (always creates new entry)
- Each array item = separate row in ticket board

**Timer display in ticket board rows:**
- Primary timer (based on `sentAt`, never changes):
  - < 60 seconds: "Только что"
  - 1–9 minutes: "Отправлено N мин назад"
  - ≥ 10 minutes: "Ждёте N мин"
- Secondary line (only if `reminderCount > 0`):
  - 1 reminder: "1 напоминание · последнее N мин назад"
  - 2+ reminders: "N напоминаний · последнее N мин назад" (based on `lastReminderAt`)
- Update interval: existing `setInterval` every 30s (search `// HD-02 + HD-03: Timer interval`, ~line 1817)

**localStorage save/restore:** Extend to save/restore all new fields per type. The `other` type saves as array.
- Key unchanged: `helpdrawer_${currentTableId}`
- `hasLoadedHelpStatesRef` guard (HD-10, ~line 1664) — **keep exactly as-is**, only extend restored fields

### Must NOT
- ❌ `sentAt` reset to `Date.now()` on remind tap
- ❌ `lastReminderAt` used as the primary "waiting" timer
- ❌ `reminderCount` lost on drawer close/reopen (must persist in localStorage)
- ❌ `other` array losing items when standard type updates (separate keys in requestStates)

### File and location
File: `pages/PublicMenu/x.jsx`
- State shape comment: search `// Structure: { call_waiter: { status: 'idle'|` (~line 1693)
- localStorage mount restore: search `// HD-05: Load requestStates from localStorage on mount` (~line 1665)
- `getRelativeTime` helper: search `// HD-03: Relative time helper` (~line 1699)
- Timer interval: search `// HD-02 + HD-03: Timer interval` (~line 1817)
- pendingRequests memo: search `.map(([type, s]) => ({ type, sentAt:` (~line 1713)

### Verification
1. Send "Счёт" → wait 10+ min → ticket board shows "Ждёте 12 мин"
2. Tap "Напомнить" → primary shows "Ждёте 12 мин" (unchanged); secondary adds "1 напоминание · последнее только что"
3. Close + reopen drawer → "Ждёте 12 мин · 1 напоминание" still displayed (localStorage)
4. Tap "Другое" twice and submit each → two separate rows in ticket board

---

## Fix 3 — REDIRECT: Smart redirect on card re-tap [MUST-FIX]

### Current behavior
When user taps a card with `status === 'pending'`, a `cardActionModal` mini-sheet opens (search `{/* HD-01v3: Card action modal */}`, ~lines 4080–4130) with "Напомнить персоналу" and "Больше не надо" buttons.

### Expected behavior
When user taps a card that already has an active pending/remind_available request:
1. Smoothly scroll `ticketBoardRef` section into view
2. Highlight the corresponding ticket board row for 1.5 seconds (brief amber/yellow bg flash, e.g. `bg-amber-50`)
3. Show brief inline toast: `t('help.request_already_sent', 'Запрос уже отправлен. Нажмите Напомнить')`
4. Do NOT create a duplicate request
5. Do NOT open any modal/sheet

**"Другое" exception:** Always creates a new entry regardless of existing Другое requests.

### Must NOT
- ❌ `cardActionModal` for standard types (call_waiter, bill, napkins, menu) — remove entirely
- ❌ Duplicate row in ticket board for the same standard type
- ❌ Auto-remind triggered silently on re-tap

### File and location
File: `pages/PublicMenu/x.jsx`
- `handleCardTap` function: search `// HD-01 + HD-06: Card tap with 5s undo delay` (~line 1762)
- Add `ticketBoardRef = useRef(null)` near state declarations (~line 1663)
- Add `[highlightedRow, setHighlightedRow] = useState(null)` for highlight animation
- Remove `[cardActionModal, setCardActionModal]` state declaration and its JSX block

### Verification
1. Send "Счёт", then tap "Счёт" card again → no modal; drawer scrolls to "Мои запросы"; "📋 Счёт" row flashes amber; toast appears
2. Same test for call_waiter, napkins, menu — same behavior
3. "Другое" tap with existing "Другое" pending → new row added (no redirect)

---

## Fix 4 — ANTISPAM: Anti-spam guard on [Напомнить] [MUST-FIX]

### Current behavior
No rate limiting on remind. User can tap "Напомнить" any number of times instantly.

### Expected behavior
After user taps [Напомнить] in a ticket board row:
1. Set `remindCooldownUntil = Date.now() + cooldownMs` in requestStates for that item
2. Button becomes disabled during cooldown
3. Button shows countdown microcopy: `t('help.remind_cooldown_timer', 'Повторить через') + ' ' + countdown`
   - Format: "Повторить через 00:42" (MM:SS format, countdown to 0)
   - Updates approximately every 30s (reuses existing setInterval tick `timerTick`)
4. After cooldown expires → button re-enables with label "Напомнить"

**Cooldown per type:**
- `call_waiter`: 30 seconds
- `bill`, `napkins`, `menu`, `other`: 45 seconds

**On remind fire:**
- Set `lastReminderAt = Date.now()`
- Increment `reminderCount += 1`
- Re-trigger server call: reuse `handleCardTap(type)` flow (same path as initial send, undo window)
- `sentAt` does NOT change

### Must NOT
- ❌ Anti-spam countdown shown on action cards (only in ticket board rows)
- ❌ Remind bypassing cooldown via any path

### File and location
File: `pages/PublicMenu/x.jsx`
- Add `handleRemind(type, itemId?)` function near `handleCardTap` (~line 1762)
- `remindCooldownUntil` stored in requestStates item (already added in Fix 2 state shape)
- Existing `timerTick` state and interval (~line 1817) → reuse to trigger re-render for countdown

### Verification
1. Tap [Напомнить] → button shows "Повторить через 00:45" and is disabled
2. After ~45s → button re-enables showing "Напомнить"
3. Timer text updates on next 30s interval tick

---

## Fix 5 — ANXIETY: Anxiety copy under "Мои запросы" [MUST-FIX]

### Current behavior
No helper text under the active requests section.

### Expected behavior
Small helper text placed directly below the ticket board list (within Section 1):
- Text: `t('help.status_auto_update', 'Статус обновляется автоматически')`
- Style: `text-xs text-slate-400 text-center pt-1`
- Only visible when Section 1 ("Мои запросы") is visible

### Must NOT
- ❌ Helper text shown when 0 active requests
- ❌ Helper text placed outside the "Мои запросы" section

### File and location
File: `pages/PublicMenu/x.jsx`
- Insert directly after the ticket board rows list, before the "Отправить ещё" divider

### Verification
1. No active requests → text not visible
2. Send any request → ticket board appears → "Статус обновляется автоматически" visible below ticket board rows

---

## Fix 6 — COLLAPSE: Show all at 1–3, collapse at 4+ [MUST-FIX]

### Current behavior
Old HD-08 summary block triggered at 2+ requests. Cards always fully visible.

### Expected behavior
In the ticket board (Section 1):
- 1, 2, or 3 requests: show ALL rows expanded (no collapse)
- 4+ requests: show first 3 rows + collapsed indicator button:
  `"Ещё N запросов · самый старый ждёт X мин"` (styled as text-sm text-slate-500 underline)
- Tapping collapsed indicator → expand all rows (`isTicketBoardExpanded = true`)
- Sort order: oldest `sentAt` first (longest waiting at top)

### Must NOT
- ❌ Collapse at 2 or 3 requests (threshold is 4)
- ❌ Showing collapsed state on initial open (default expanded = false, but show all when ≤3)

### File and location
File: `pages/PublicMenu/x.jsx`
- Add `[isTicketBoardExpanded, setIsTicketBoardExpanded] = useState(false)` state
- Use `pendingRequests` array (computed memo, ~line 1713) — extend to include `other` array items
- Sort `pendingRequests` by `sentAt` ascending (oldest first)

### Verification
1. Send 3 requests → all 3 rows visible in ticket board
2. Send 4th request → first 3 visible + "Ещё 1 запрос · самый старый ждёт X мин"
3. Tap collapsed indicator → all 4 rows visible

---

## Fix 7 — PAID GATE: Block service requests for Free plan [NICE-TO-HAVE]

### Current behavior
Help drawer works the same regardless of partner plan. No plan check on request submission.

### Expected behavior
When `partner?.plan === 'Free'` (or `partner?.plan_tier === 'Free'`):
- Help drawer still opens (user can see the feature)
- Cards are still visible
- Tapping any action card → show toast: `t('help.free_plan_blocked', 'Эта функция недоступна на текущем тарифе')` — do NOT send request
- No ticket board row created
- Card does NOT enter sending state

When `partner?.plan === 'Paid'` (or field is absent/undefined):
- Everything works as designed in Fixes 1–6 (no change)

### Must NOT
- ❌ Hiding the Help FAB or drawer itself (feature must be discoverable)
- ❌ Showing paid gate toast if plan field is null/undefined (treat as Paid = default)
- ❌ Blocking the undo flow — check happens INSIDE handleCardTap at start, before undo scheduling

### File and location
File: `pages/PublicMenu/x.jsx`
- `partner` object is already available in component scope (~line 1584)
- Add plan check at start of `handleCardTap` (~line 1763): `if (partner?.plan === 'Free') { toast(...); return; }`
- Use existing `toast()` call pattern from the file

### Verification
1. Simulate `partner.plan = 'Free'` → tap any help card → toast appears, no request created
2. Simulate `partner.plan = 'Paid'` or `undefined` → tap help card → normal flow with undo toast

---

## ⛔ SCOPE LOCK — change ONLY what is described in Fix sections above

Do NOT change any of the following:

**FROZEN (working, tested — must remain intact):**
- `HD-06` Undo toast mechanism: `handleUndo`, `undoToast` state, toast JSX (~lines 4033–4041). Keep as-is.
- `HD-07` FAB badge: `activeRequestCount > 0` badge on HelpFab (~lines 3884–3889). Keep as-is.
- `HD-10` `hasLoadedHelpStatesRef` guard (~line 1664) — only extend fields, do NOT change guard logic
- `HD-05` localStorage key: `helpdrawer_${currentTableId}` — same key, only extend stored shape
- `HD-04` "Другое" chips + textarea form UI (~lines 4008–4031) — keep form UI, only modify submission to push to array
- `PM-125` / `PM-S81-15` Android back: `openHelpDrawer`/`closeHelpDrawer`/`pushOverlay`/`popOverlay` mechanics — must remain intact
- `HelpFab` component: props, import, rendering (~lines 3877–3883) — do NOT modify
- Drawer wrapper: `<Drawer open={isHelpModalOpen} ...>` + DrawerContent classes (`max-h-[85vh] rounded-t-2xl flex flex-col`)
  - **DO NOT add `relative` class to DrawerContent** — breaks vaul library (KB-096)
- Drawer header: title "Нужна помощь?", subtitle, ChevronDown close button (~lines 3896–3907)
- `HELP_COOLDOWN_SECONDS` values (call_waiter:90, bill:150, napkins:240, menu:240, other:120) — used for remind_available timing
- `handlePresetSelect` and `submitHelpRequest` hook integration — keep same server call path
- `HELP_CHIPS` array values
- i18n pattern: `t('help.key', 'Fallback text')` — use same pattern for all new keys

**New i18n keys to add (with English/Russian fallbacks):**
- `help.my_requests` → "Мои запросы"
- `help.send_more` → "Отправить ещё"
- `help.status_auto_update` → "Статус обновляется автоматически"
- `help.remind` → "Напомнить"
- `help.remind_cooldown_timer` → "Повторить через"
- `help.already_helped` → "Уже помогли"
- `help.already_brought` → "Уже принесли"
- `help.irrelevant` → "Неактуально"
- `help.waiting_min` → "Ждёте" (prefix, e.g. "Ждёте 25 мин")
- `help.request_already_sent` → "Запрос уже отправлен. Нажмите Напомнить"
- `help.n_more_requests` → "Ещё запросов · самый старый ждёт" (build string with count)
- `help.free_plan_blocked` → "Эта функция недоступна на текущем тарифе"
- `help.1_reminder` → "1 напоминание"
- `help.n_reminders` → "напоминаний" (for N≥2: "N напоминаний")
- `help.last_reminder` → "последнее"

---

## Implementation Notes

**Architecture overview:**
```
BEFORE:  Cards have state (pending/repeat/sending) → status shown ON card
AFTER:   Cards always idle → status shown in "Мои запросы" ticket board ABOVE cards
```

**State shape (complete):**
```js
// Standard type:
requestStates.call_waiter = {
  status: 'pending' | 'remind_available',  // ('repeat' alias OK)
  sentAt: 1711800000000,          // original, NEVER reset
  lastReminderAt: null,
  reminderCount: 0,
  remindCooldownUntil: null,
}

// Other type (array):
requestStates.other = [
  { id: 1711800000001, status: 'pending', sentAt: ..., lastReminderAt: null, reminderCount: 0, remindCooldownUntil: null, message: 'Детский стул' },
  { id: 1711800000002, status: 'pending', sentAt: ..., ..., message: 'Вода' },
]
```

**Ticket board row (pseudo-code):**
```jsx
<div ref={rowRefs[rowId]} className={`border rounded-xl p-3 ${highlightedRow === rowId ? 'bg-amber-50' : 'bg-white'}`}>
  <div className="flex justify-between items-start">
    <span className="font-medium text-slate-800">{emoji} {label}</span>
    <button onClick={() => handleSoftClose(type, item.id)} className="text-sm text-slate-400 min-h-[44px]">
      {softCloseLabel}
    </button>
  </div>
  <p className="text-sm text-slate-500 mt-0.5">{timerText}</p>
  {reminderCount > 0 && <p className="text-xs text-slate-400">{reminderCountText} · {relTimeLastReminder}</p>}
  {showRemindButton && (
    <button onClick={() => handleRemind(type, item.id)} disabled={remindOnCooldown}
      className="mt-2 text-sm font-medium text-[#B5543A] min-h-[44px] disabled:opacity-50">
      {remindOnCooldown ? cooldownText : t('help.remind', 'Напомнить')}
    </button>
  )}
</div>
```

**handleSoftClose (local-only):**
```js
const handleSoftClose = useCallback((type, itemId) => {
  setRequestStates(prev => {
    const next = { ...prev };
    if (type === 'other') {
      next.other = (next.other || []).filter(item => item.id !== itemId);
    } else {
      delete next[type];
    }
    return next;
  });
  // Also update localStorage
}, [currentTableId]);
```

**handleRemind (per row):**
```js
const handleRemind = useCallback((type, itemId) => {
  const cooldownMs = type === 'call_waiter' ? 30000 : 45000;
  setRequestStates(prev => {
    const next = { ...prev };
    if (type === 'other') {
      next.other = (next.other || []).map(item =>
        item.id === itemId
          ? { ...item, lastReminderAt: Date.now(), reminderCount: (item.reminderCount || 0) + 1, remindCooldownUntil: Date.now() + cooldownMs }
          : item
      );
    } else {
      next[type] = { ...next[type], lastReminderAt: Date.now(), reminderCount: (next[type]?.reminderCount || 0) + 1, remindCooldownUntil: Date.now() + cooldownMs };
    }
    return next;
  });
  // Re-trigger server call via existing flow
  handleCardTap(type);
}, [handleCardTap, currentTableId]);
```

**Smart redirect (in handleCardTap, for standard types):**
```js
const handleCardTap = useCallback((type) => {
  // Fix 7: paid gate
  if (partner?.plan === 'Free') { toast(t('help.free_plan_blocked', '...')); return; }

  // Fix 3: smart redirect if already pending
  const existing = type === 'other' ? null : requestStates[type];
  if (existing && (existing.status === 'pending' || existing.status === 'remind_available' || existing.status === 'repeat')) {
    ticketBoardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setHighlightedRow(type);
    setTimeout(() => setHighlightedRow(null), 1500);
    toast(t('help.request_already_sent', 'Запрос уже отправлен. Нажмите Напомнить'));
    return;
  }
  // ... existing undo flow continues
}, [requestStates, partner, ...]);
```

**⚠️ Fix 1 changes card onClick:**
Current card onClick: `status === 'pending' ? setCardActionModal(card.id) : ...`
After Fix 1: `status === 'pending' || status === 'remind_available' ? [smart redirect] : handleCardTap(card.id)`
The card `className` must remain `bg-white border-slate-200` regardless of `requestStates[card.id]?.status`.

**pendingRequests memo update:**
The existing memo at ~line 1713 returns `{ type, sentAt, message }`.
Update to return full item shape including `lastReminderAt`, `reminderCount`, `remindCooldownUntil`.
For `other` type: flatten array items into the list, each with own `id`.

**git add:** `pages/PublicMenu/x.jsx` only.

---

## MOBILE-FIRST CHECK (MANDATORY before commit)
This is a mobile-first restaurant app. Verify at 375px width:
- [ ] Close/chevron: right-aligned, sticky top
- [ ] Touch targets >= 44×44px on all ticket board buttons (Напомнить, Уже помогли, collapse toggle)
- [ ] Ticket board rows readable at 320px (long labels don't overflow)
- [ ] "Отправить ещё" label not truncated
- [ ] Anxiety copy fits on one line at 375px
- [ ] No duplicate visual indicators (no status on cards + in ticket board simultaneously)
- [ ] Bottom sheet scrollable with ticket board + cards without losing close button
- [ ] Countdown microcopy (MM:SS) readable at small size

---

## Regression Check (MANDATORY after implementation)
After completing all fixes, verify these existing features still work:
- [ ] Tapping any card → undo toast (5s), "Отменить" button cancels the send
- [ ] FAB bell badge shows count of active requests (activeRequestCount)
- [ ] Closing and reopening drawer → active requests still in ticket board (localStorage)
- [ ] Android back button closes drawer (overlay stack: pushOverlay/popOverlay)
- [ ] "Другое" chips insert text into textarea
- [ ] "Другое" textarea submit → new row in ticket board
- [ ] Drawer does not show `relative` class on DrawerContent (vaul compatibility)
- [ ] Plan = Paid (or undefined) → help requests work normally (Fix 7 guard)
