---
chain: publicmenu-260330-213949-a1d6
chain_step: 4
chain_total: 4
chain_step_name: merge
page: PublicMenu
budget: 10.00
runner: cc
type: chain-step
---
=== CHAIN STEP: Merge (4/4) ===
Chain: publicmenu-260330-213949-a1d6
Page: PublicMenu

You are the Merge step in a modular consensus pipeline.
Your job: apply the fix plan to the actual code.

INSTRUCTIONS:
1. Read the comparison: pipeline/chain-state/publicmenu-260330-213949-a1d6-comparison.md
2. Check if discussion report exists: pipeline/chain-state/publicmenu-260330-213949-a1d6-discussion.md
   - If it exists AND has an "Updated Fix Plan" section → use THAT for disputed items
   - If it says "No disputes" or doesn't exist → use Comparator's "Final Fix Plan" as-is
   - Items marked "Unresolved (for Arman)" → SKIP these, do NOT apply
3. Read the code file: pages/PublicMenu/*.jsx
4. Apply ALL fixes from the fix plan, in priority order (P0 first)
   - Agreed items from Comparator: always apply
   - Discussion-resolved items: apply the winning solution
   - Unresolved disputes: SKIP (note in merge report)
   - [MUST-FIX] items: CANNOT be skipped. If you cannot apply a MUST-FIX, explain WHY in detail in merge report — do NOT silently skip.
5. After applying fixes:
   a. Update BUGS.md in pages/PublicMenu/ with fixed items
   b. Update README.md in pages/PublicMenu/ if needed
6. Git commit and push:
   - git add <specific files only> (NEVER git add . or git add -A)
   - git commit -m "fix(PublicMenu): N bugs fixed via consensus chain publicmenu-260330-213949-a1d6"
   - git push
7. Write merge report to: pipeline/chain-state/publicmenu-260330-213949-a1d6-merge-report.md

FORMAT for merge report:
# Merge Report — PublicMenu
Chain: publicmenu-260330-213949-a1d6

## Applied Fixes
1. [P0] Fix title — Source: agreed/discussion-resolved — DONE
2. [P1] Fix title — Source: comparator — DONE
...

## Skipped — Unresolved Disputes (for Arman)
- Dispute: [title] — CC says X, Codex says Y — NEEDS DECISION

## Skipped — Could Not Apply
- Reason...

## Git
- Commit: <hash>
- Files changed: N

## Prompt Feedback
Collect Prompt Clarity sections from CC and Codex findings files (if present), then add your own observations:
- CC clarity score: [N/5]
- Codex clarity score: [N/5]
- Fixes where writers diverged due to unclear description: ...
- Fixes where description was perfect (both writers agreed immediately): ...
- Recommendation for improving task descriptions: ...

## Summary
- Applied: N fixes
- Skipped (unresolved): N disputes
- Skipped (other): N fixes
- MUST-FIX not applied: N (with reasons)
- Commit: <hash>

=== TASK CONTEXT ===
# Help Drawer: Mini-Ticket Board UX (HD-01..HD-08)

Production page: `/publicmenu` (x.jsx)
UX spec: `ux-concepts/HelpDrawer/help-drawer.md` v2.0
GPT review: `ux-concepts/HelpDrawer/GPT_HelpDrawer_UX_S201.md`

TARGET FILES (modify): `pages/PublicMenu/x.jsx`
CONTEXT FILES (read-only): `ux-concepts/HelpDrawer/help-drawer.md`, `ux-concepts/HelpDrawer/GPT_HelpDrawer_UX_S201.md`, `BUGS_MASTER.md`

## Context

The Help Drawer (`openHelpDrawer` / HelpDrawerContent in x.jsx) is the guest-facing "Need help?" bottom sheet.
Currently it shows 4 cards (Call Waiter, Bill, Napkins, Menu) + "Other" button with NO feedback after tap.

This task implements the full **mini-ticket board UX**: pending states, per-type cooldowns, timers, undo, badge, summary.

⚠️ **Fix dependency chain:** Fix 1 introduces the `requestStates` object and `HELP_COOLDOWN_SECONDS` constant — all other fixes (2–8) depend on this shared state. Fixes 2–8 must NOT create their own separate state objects.

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
   - Subline: timer "2 мин назад" (from Fix 3)
   - Background: very soft brand tint (bg-[#F5E6E0], NOT full green — this is pending, not resolved)
   - Card is disabled (no tap)

Add new state at top of HelpDrawerContent component (search for "openHelpDrawer" or "Нужна помощь" or "Позвать официанта"):
```js
const [requestStates, setRequestStates] = useState({});
// Structure: { waiter: { status: 'idle'|'sending'|'pending'|'repeat'|'resolved', sentAt: timestamp }, ... }

const HELP_COOLDOWN_SECONDS = { waiter: 90, bill: 150, napkins: 240, menu: 240, other: 120 };
```

### НЕ должно быть
- No green "success" state implying request is fulfilled/waiter arrived
- No card disappearing after tap
- No toast-only feedback (card must change visually)
- No "Отправлено" text — use "Запрос отправлен"

### Файл и локация
File: `pages/PublicMenu/x.jsx`
Search: `openHelpDrawer`, `Нужна помощь`, `Позвать официанта`
Add `requestStates` useState + `HELP_COOLDOWN_SECONDS` const near top of HelpDrawerContent

### Проверка
1. Open Help Drawer → tap "Позвать официанта" → card shows spinner → then shows ✓ "Запрос отправлен" with bg-[#F5E6E0]
2. Card is disabled (second tap does nothing)

---

## Fix 2 — HD-02 (P1) [MUST-FIX]: Per-type cooldown

### Сейчас
No protection against repeated taps. Guest can send same request multiple times.

### Должно быть
Use `requestStates[type].sentAt` + `HELP_COOLDOWN_SECONDS[type]` (from Fix 1) to determine when card transitions to `repeat` state.

In `repeat` state: card shows original icon + text **"Напомнить персоналу"** (NOT "Повторить запрос")
Tap in repeat state → card goes back to `sending` → `pending`

Cooldown reference (from Fix 1's `HELP_COOLDOWN_SECONDS`):
- waiter: 90s, bill: 150s, napkins: 240s, menu: 240s, other: 120s

### НЕ должно быть
- No global cooldown — per-type only
- No text "Повторить запрос?" — use "Напомнить персоналу"

### Файл и локация
File: `pages/PublicMenu/x.jsx`
Use `HELP_COOLDOWN_SECONDS` from Fix 1 — do NOT redefine it.

### Проверка
1. Tap "Позвать официанта" → pending → after 90s → shows "Напомнить персоналу"
2. Tap "Меню" → after 4 min → shows "Напомнить персоналу"

---

## Fix 3 — HD-03 (P1) [MUST-FIX]: Timer "X мин назад" on pending cards

### Сейчас
No time indication on sent requests.

### Должно быть
Pending cards show relative time since `requestStates[type].sentAt` (from Fix 1):
- `< 60 seconds` → "Только что"
- `1 мин назад`, `2 мин назад`, ..., `N мин назад`

Timer updates every 30 seconds via `setInterval`. Recalculate on `visibilitychange`.

```js
function getRelativeTime(sentAtMs) {
  const seconds = Math.floor((Date.now() - sentAtMs) / 1000);
  if (seconds < 60) return 'Только что';
  return `${Math.floor(seconds / 60)} мин назад`;
}
```

### НЕ должно быть
- No second-by-second updates
- No storing formatted string in state — always calculate from timestamp

### Файл и локация
File: `pages/PublicMenu/x.jsx`
Add `useEffect` with `setInterval(updateTimers, 30000)`.

### Проверка
1. Send request → see "Только что" → wait 1+ min → see "1 мин назад"

---

## Fix 4 — HD-04 (P1) [MUST-FIX]: "Другое" button → textarea with quick-action chips

### Сейчас
"Другое" button behavior: likely sends blank "other" request with no text input.

### Должно быть
Tapping "Другое" expands an inline form at the bottom of the drawer:

1. Quick-action chips: `[Детский стул]` `[Приборы]` `[Соус]` `[Убрать со стола]` `[Вода]`
   - Tapping a chip → inserts text into textarea
2. Textarea: placeholder "Например: детский стул, приборы, убрать со стола", max 100 chars
3. Counter: "0 / 100"
4. Two buttons: [Отмена] [Отправить →] — "Отправить" disabled while empty/whitespace
5. After send: "Другое" card → pending state with preview "✓ \"Детский стул...\" · 3 мин"
6. Draft text in state only — do NOT persist to localStorage (only requestStates is persisted, per Fix 5)

Add state: `otherExpanded` (boolean) + `otherDraft` (string).

### НЕ должно быть
- No separate screen for "Другое"
- No submit enabled on empty/whitespace
- No full text in pending card — truncate at 30 chars + "..."

### Файл и локация
File: `pages/PublicMenu/x.jsx`
Search: existing "Другое" button render, search for "other" or "Другое" near other help cards.
Add `otherExpanded` + `otherDraft` state alongside `requestStates` (Fix 1).
Chips: hardcoded array `['Детский стул', 'Приборы', 'Соус', 'Убрать со стола', 'Вода']`

### Проверка
1. Tap "Другое" → chips + textarea appear
2. Tap chip "Детский стул" → text inserted → "Отправить" enabled
3. Tap "Отправить" → card shows ✓ "Детский стул..." · мин
4. "Отмена" → form collapses, idle

---

## Fix 5 — HD-05 (P2) [MUST-FIX]: Persist requestStates in localStorage

### Сейчас
Closing and reopening drawer resets all cards to idle.

### Должно быть
Persist `requestStates` (from Fix 1) in localStorage:
- Key: `helpdrawer_${tableId}` (use tableId from props/context — search for `currentTableId` or `tableCode`)
- On state change → `localStorage.setItem(key, JSON.stringify(requestStates))`
- On drawer mount → load + filter out entries older than `max(HELP_COOLDOWN_SECONDS) = 240s`
- On tableId change → clear stored state for previous table

⚠️ localStorage is UI cache ONLY — not business truth. Clear on server error.
⚠️ Do NOT use localStorage for `otherDraft` (Fix 4) — only `requestStates`.

### НЕ должно быть
- No states persisting across table sessions (clear on tableId change)

### Файл и локация
File: `pages/PublicMenu/x.jsx`
Use `useEffect` on `requestStates` → write. Use `useEffect` on mount → read + filter.

### Проверка
1. Send request → close drawer → reopen → card still shows "Запрос отправлен · N мин"

---

## Fix 6 — HD-06 (P2) [MUST-FIX]: Undo toast for 5 seconds after tap

### Сейчас
No way to cancel accidental tap.

### Должно быть
After any card tap, show a 5-second undo toast at bottom of drawer:
- Text: "[Тип] отправлено · [Отменить (5с)]" with countdown
- If "Отменить" tapped within 5s: do NOT send to server, card returns to idle
- If 5s pass: request confirmed, keep pending state
- Only 1 toast at a time (new tap replaces previous toast)

Add state: `undoToast: { type, expiresAt } | null`

```js
// On card tap: set undoToast + schedule auto-confirm
setUndoToast({ type, expiresAt: Date.now() + 5000 });
// If undo tapped: setUndoToast(null) + reset requestStates[type] to idle
// After 5s timeout: setUndoToast(null) + confirm send to server
```

### НЕ должно быть
- No permanent cancel after 5s
- No toast outside drawer

### Файл и локация
File: `pages/PublicMenu/x.jsx`
Add `undoToast` state alongside `requestStates` (Fix 1).

### Проверка
1. Tap "Счёт" → toast "Счёт · Отменить (5с)" appears → tap "Отменить" → card back to idle
2. Tap "Счёт" → wait 5s → toast disappears, card stays pending

---

## Fix 7 — HD-07 (P2) [MUST-FIX]: Badge on Help button showing active request count

### Сейчас
"Нужна помощь?" trigger button has no indication of active requests.

### Должно быть
Derive `activeRequestCount` from `requestStates` (Fix 1):
```js
const activeRequestCount = Object.values(requestStates)
  .filter(s => s.status === 'pending').length;
```

Show badge on the Help trigger button: small `bg-[#B5543A] text-white rounded-full` overlay, showing count if > 0.

⚠️ The Help button may be rendered OUTSIDE HelpDrawerContent (in a parent component). If `requestStates` is local to HelpDrawerContent, lift state up or use a ref/callback to expose `activeRequestCount` to parent. Search for where the 🔔 button is rendered.

### НЕ должно быть
- No badge when 0 active requests
- No badge on unrelated buttons

### Файл и локация
File: `pages/PublicMenu/x.jsx`
Search: `openHelpDrawer`, `🔔`, `Нужна помощь` — find where the trigger button renders.

### Проверка
1. Send request → badge "1" on Help button outside drawer
2. Two requests → badge "2"
3. All cooldowns expire → badge disappears

---

## Fix 8 — HD-08 (P2) [MUST-FIX]: Active requests summary block at top of drawer

### Сейчас
No summary when reopening drawer with active requests.

### Должно быть
If `pendingRequests.length > 0`, show summary ABOVE the 2×2 card grid:

```
┌──────────────────────────────────┐
│ Активные запросы: 2              │
│ Позвать официанта · 3 мин назад  │
│ Счёт · 1 мин назад               │
└──────────────────────────────────┘
```

Styling: `bg-[#F5E6E0] text-slate-700 text-sm rounded-lg p-3`
Use `getRelativeTime()` from Fix 3.
Only visible when `pendingRequests.length > 0` — do NOT replace card grid.

### НЕ должно быть
- No summary when 0 active requests
- No hiding or replacing card grid

### Файл и локация
File: `pages/PublicMenu/x.jsx`
Conditional render above 2×2 grid inside HelpDrawerContent.

### Проверка
1. Send 2 requests → close drawer → reopen → summary "Активные запросы: 2" visible above cards
2. Zero requests → no summary

---

## ⛔ SCOPE LOCK — менять ТОЛЬКО то, что указано выше

- Change ONLY the Help Drawer component and its state logic inside `x.jsx`
- DO NOT change: menu browsing, cart logic, order flow, StickyCartBar, checkout, other drawers
- DO NOT change: PublicMenu layout, dish cards, category chips, search
- DO NOT refactor unrelated code
- DO NOT add new B44 entities or API calls — HD-05 is localStorage only

## FROZEN UX (DO NOT CHANGE — already tested ✅)
- Android Back button in drawers (PM-S81-15) — `pushState`/`popstate` logic ✅ Tested S191
- Help drawer chevron ˅ close button top-right (PM-130) ✅ Tested S177
- Bell 🔔 visible in normal mode / hall mode (PM-129) ✅ Tested S177
- No drawer open if tableId missing → redirect to table code BS (PM-133) ✅ Tested S179
- "Другое" textarea hidden by default until tapped (PM-134) ✅ Tested S179
- `helpQuickSent` resets on closeHelpDrawer (PM-135) ✅ Tested S179
- DrawerContent must NOT have className `relative` — use inner `<div className="relative">` wrapper instead (PM-128, KB-096) ✅
- Table code BS (4-cell input, code entry) unaffected (PM-088) ✅ Tested S164
- Cart content + guest name persistence (PM-146, PM-139) ✅ Tested S182
- StickyCartBar 3-state text modes (PM-059) ✅ Tested S191

## Regression Check (MANDATORY after implementation)
- [ ] Help drawer opens from 🔔 button (no regression PM-129)
- [ ] Android Back closes drawer (PM-S81-15 not regressed)
- [ ] Cart drawer still opens / StickyCartBar unchanged
- [ ] Table code BS still works (PM-088 not regressed)
- [ ] "Другое" form collapses on "Отмена" tap (new: otherExpanded reset)
- [ ] localStorage writes use table-scoped key, not global (no cross-table pollution)

## Implementation Notes
- File: `pages/PublicMenu/x.jsx` (~4100+ lines)
- New state: `requestStates` (object), `undoToast` (null|{type, expiresAt}), `otherExpanded` (bool), `otherDraft` (string)
- New constants: `HELP_COOLDOWN_SECONDS` (module-level or near HelpDrawerContent)
- New helpers: `getRelativeTime(sentAtMs)`, `getActiveRequests(requestStates)`
- localStorage key: `helpdrawer_${tableId}`
- ⚠️ DrawerContent must NOT have className `relative` — KB-096
- FROZEN UX grep verification (run before commit):
  ```bash
  grep -n "pushState\|popstate\|pushOverlay\|popOverlay" pages/PublicMenu/x.jsx
  grep -n "ChevronDown\|chevron" pages/PublicMenu/x.jsx | grep -i "help\|drawer"
  grep -n "helpQuickSent\|closeHelpDrawer" pages/PublicMenu/x.jsx
  ```
  All must return results.
- git add pages/PublicMenu/x.jsx
- git commit -m "feat(PublicMenu): help drawer mini-ticket board UX (HD-01..HD-08)"
- git push

## MOBILE-FIRST CHECK (MANDATORY before commit)
This is a mobile-first restaurant app (375px primary, 320px minimum). Before committing:
- [ ] All help cards: touch target ≥ 44×44px
- [ ] Quick-action chips (Fix 4): wrap properly on 320px, no horizontal scroll
- [ ] Textarea + "Отправить" button: visible above keyboard on 375px
- [ ] Undo toast (Fix 6): visible at bottom of drawer, not overlapping cards
- [ ] Badge (Fix 7): small, not obscuring bell icon
- [ ] Summary block (Fix 8): text readable on 320px (text-sm minimum)
- [ ] Drawer scrollable with all new content
=== END ===
