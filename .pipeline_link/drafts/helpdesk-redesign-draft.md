---
title: "Help Drawer Redesign — One-tap Quick Actions"
status: DRAFT
created: 2026-03-25
session: S177
chain_template: consensus-with-discussion
estimated_budget: $12
file: pages/PublicMenu/x.jsx
---

# DRAFT — Help Drawer Redesign (One-tap Quick Actions)

> ⚠️ Это черновик. Перед отправкой в queue/ прогнать через `skills/prompt-checker.md`.
> Также добавить актуальные строки FROZEN UX из BUGS_MASTER перед запуском.

---

## Context

File: `pages/PublicMenu/x.jsx`
Help drawer location: lines ~3658–3740 (search for `PM-125: Help as Bottom Drawer`)

Current implementation:
- 4 preset buttons (2×2 grid) to SELECT a type
- textarea always visible below
- Two action buttons: «Отмена» + «Отправить»
- Bug PM-131: «Отправить» button is not clickable (disabled condition or touch target issue)

## Tasks

### Task 1: Redesign help drawer — one-tap quick action cards

Replace the current select → textarea → submit flow with instant one-tap cards.

**New layout:**

```
┌─────────────────────────────────┐
│  ▬▬▬  (drag handle)             │
│  [×]                            │  ← keep existing ChevronDown button (top-3 right-3)
│  Нужна помощь?                  │
│  [MapPin + table name]          │  ← keep existing, if currentTable present
│  [hasActiveRequest banner]      │  ← keep existing, if hasActiveRequest
│                                 │
│  ┌──────────┐  ┌──────────┐     │
│  │    🙋    │  │    🧾    │     │
│  │ Позвать  │  │ Принести │     │
│  │официанта │  │  счёт    │     │
│  └──────────┘  └──────────┘     │
│                                 │
│  ┌──────────┐  ┌──────────┐     │
│  │    🗒️    │  │    📄    │     │
│  │Салфетки  │  │ Бумажное │     │
│  │          │  │   меню   │     │
│  └──────────┘  └──────────┘     │
│                                 │
│  ┌─────────────────────────┐    │
│  │  ✏️  Другое...          │    │
│  └─────────────────────────┘    │
│                                 │
└─────────────────────────────────┘
```

**Behavior for quick-action cards (Позвать официанта / Принести счёт / Салфетки / Бумажное меню):**
- Tapping a card immediately calls `submitHelpRequest` with the preset ID (no textarea, no confirm step)
- After successful send → show success state inside the drawer:
  ```
  ✅  Запрос отправлен!
  Официант скоро подойдёт
  ```
- Auto-close the drawer after 2 seconds (use setTimeout → closeHelpDrawer())
- While sending (isSendingHelp=true): show spinner on the tapped card, disable all other cards

**Behavior for «Другое...» card:**
- Tapping «Другое» does NOT send immediately
- Instead: expand/show a textarea area + «Отправить» button below the grid (inline, not a new screen)
- The textarea + button appears with a smooth CSS transition (e.g. max-height animation)
- «Отправить» button: full width, uses primaryColor background, calls submitHelpRequest
- «Отправить» is disabled only when textarea is empty (remove the `!currentTableId` condition — if the drawer is open, currentTableId must be set)

**Card styling:**
- Each card: rounded-xl, border (border-slate-200), background white, min-h-[80px], flex column, items-center, justify-center, gap-1
- Emoji: text-2xl
- Label: text-sm font-medium text-slate-700, text-center
- Active/hover state: border-[primaryColor], bg-[primaryColor]/5
- Full-width «Другое» card: col-span-2, flex-row, gap-2, emoji left + label

**State management:**
- New state: `const [helpQuickSent, setHelpQuickSent] = useState(false)` — controls success state display
- On successful send for quick cards: setHelpQuickSent(true) → setTimeout 2000ms → closeHelpDrawer() + setHelpQuickSent(false)
- Keep existing state: `selectedHelpType`, `helpComment`, `isSendingHelp`, `hasActiveRequest`, `helpSubmitError`
- On drawer close (closeHelpDrawer): reset helpQuickSent, selectedHelpType, helpComment

### Task 2: Fix PM-131 — «Отправить» button not clickable

In the «Другое» expanded form, the submit button must be:
- `disabled={isSendingHelp || !helpComment.trim()}` (NOT `disabled={isSendingHelp || !currentTableId}`)
- Ensure no `pointer-events-none` or z-index issues block the button

## FROZEN UX (DO NOT CHANGE)

These elements are confirmed working and tested — do not modify:
- ChevronDown close button (absolute top-3 right-3, inside `<div className="relative">` wrapping DrawerHeader)
- DrawerContent className: `"max-h-[85vh] rounded-t-2xl"` — **NO `relative` class on DrawerContent itself** (KB-096: breaks vaul position:fixed → only backdrop shows)
- FAB bell button (HelpFab component) — do not touch
- Bell visibility condition (`view === "menu" && isHallMode && drawerMode !== 'cart'`) — PM-129, tested ✅
- Drawer open/close handlers: `isHelpModalOpen`, `openHelpDrawer`, `closeHelpDrawer` — do not rename
- `submitHelpRequest` function — do not rename or remove, only call it from new cards
- MapPin + table name display (lines ~3675–3680)
- hasActiveRequest banner (lines ~3681–3686)
- pushOverlay / popOverlay pattern for Android Back (overlayStackRef) — do not break

## Verification steps

1. Open help drawer via bell → see 4 cards + «Другое» in 2×2+1 layout
2. Tap «Принести счёт» → spinner on card, other cards disabled → success ✅ message → drawer auto-closes after 2s
3. Tap «Другое» → textarea + «Отправить» appears below grid; other cards remain visible
4. Type text → «Отправить» becomes enabled → tap → drawer closes
5. Try tap «Отправить» with empty textarea → button stays disabled
6. Open drawer, tap quick card → check that `hasActiveRequest` banner appears on next open
7. Android Back while drawer open → drawer closes (not browser back navigation)

## Notes for implementor

- `submitHelpRequest` currently uses `selectedHelpType` and `helpComment` state values.
  For quick-action cards, pass the type as a parameter OR set selectedHelpType before calling.
  Preferred approach: add optional parameter `submitHelpRequest(typeOverride?: string)` so
  quick cards can call `submitHelpRequest('bill')` without touching the textarea state.
- Keep `helpSubmitError` display — show it below the relevant section if send fails.
- i18n keys to add: `help.quick_sent_title` = 'Запрос отправлен!', `help.quick_sent_desc` = 'Официант скоро подойдёт'
