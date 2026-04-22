---
chain: publicmenu-260325-131945-c028
chain_step: 2
chain_total: 4
chain_step_name: comparator
page: PublicMenu
budget: 6.00
runner: cc
type: chain-step
---
=== CHAIN STEP: Comparator (2/4) ===
Chain: publicmenu-260325-131945-c028
Page: PublicMenu

You are the Comparator in a modular consensus pipeline.
Your job: compare CC Writer and Codex Writer findings and produce a merge plan.

INSTRUCTIONS:
1. Read CC findings: pipeline/chain-state/publicmenu-260325-131945-c028-cc-findings.md
   - If NOT found there, try: `git pull --rebase` then check again
   - If still not found, search for any *-cc-findings.md in pipeline/chain-state/
2. Read Codex findings: pipeline/chain-state/publicmenu-260325-131945-c028-codex-findings.md
   - If NOT found there, search in pages/PublicMenu/review_*.md (Codex sometimes writes here)
   - If still not found, search for any *-codex-findings.md in pipeline/chain-state/
3. Compare both analyses and categorize:

Write comparison to: pipeline/chain-state/publicmenu-260325-131945-c028-comparison.md

FORMAT:
# Comparison Report — PublicMenu
Chain: publicmenu-260325-131945-c028

## Agreed (both found)
Items found by both CC and Codex — HIGH confidence, apply all.

## CC Only (Codex missed)
Items found only by CC — evaluate validity, include if solid.

## Codex Only (CC missed)
Items found only by Codex — evaluate validity, include if solid.

## Disputes (disagree)
Items where CC and Codex disagree — explain reasoning, pick best solution.

## Final Fix Plan
Ordered list of all fixes to apply, with priority and source:
1. [P0] Fix title — Source: agreed/CC/Codex — Description of change
2. ...

## Summary
- Agreed: N items
- CC only: N items (N accepted, N rejected)
- Codex only: N items (N accepted, N rejected)
- Disputes: N items
- Total fixes to apply: N

4. Do NOT apply any fixes yet — only document the comparison

=== TASK CONTEXT ===
# Feature + Fix: Help Drawer Redesign — One-tap Quick Actions (#150, PM-131)

Reference: `BUGS_MASTER.md`.
Production page: https://menu-app-mvp-49a4f5b2.base44.app (PublicMenu / x.jsx).

**Context:** The current help drawer ("Нужна помощь?") uses a 4-button type-selector → textarea → submit flow. PM-131: the submit button is not clickable. Goal: redesign to instant one-tap cards (no textarea for preset requests), fix PM-131 for the "Other" card's submit button.

---

## Fix 1 — #150 (P2) [MUST-FIX]: Redesign help drawer — one-tap quick action cards

Help drawer location: `pages/PublicMenu/x.jsx`, search for `PM-125: Help as Bottom Drawer`, approx lines 3658–3740.

### Current behavior
4 preset buttons (2×2 grid) to SELECT a type → textarea always visible below → two action buttons «Отмена» + «Отправить». Multi-step flow before any request is sent.

### Expected behavior

Replace the select → textarea → submit flow with instant one-tap cards:

```
┌─────────────────────────────────┐
│  ▬▬▬  (drag handle)             │
│  [×]  (ChevronDown, top-3 right-3, KEEP AS-IS)
│  Нужна помощь?                  │
│  [MapPin + table name]          │  ← keep if currentTable present
│  [hasActiveRequest banner]      │  ← keep if hasActiveRequest
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
└─────────────────────────────────┘
```

**Behavior — quick-action cards (Позвать официанта / Принести счёт / Салфетки / Бумажное меню):**
- Tapping a card immediately calls `submitHelpRequest` with the preset type (no textarea, no confirm step)
- Add optional parameter: `submitHelpRequest(typeOverride?: string)` so quick cards call e.g. `submitHelpRequest('bill')` without modifying textarea state
- While sending (`isSendingHelp=true`): show spinner on the tapped card, disable all other cards
- After successful send → show success state inside the drawer:
  ```
  ✅  Запрос отправлен!
  Официант скоро подойдёт
  ```
- Auto-close the drawer after 2 seconds: `setTimeout(() => { closeHelpDrawer(); setHelpQuickSent(false); }, 2000)`
- New state required: `const [helpQuickSent, setHelpQuickSent] = useState(false)`

**Behavior — «Другое...» card (col-span-2):**
- Tapping «Другое» does NOT send immediately
- Instead: expand/show a textarea area + «Отправить» button below the grid (inline)
- Textarea + button appears with CSS transition (max-height animation)
- «Отправить» button: full width, primaryColor background
- Disabled only when textarea is empty: `disabled={isSendingHelp || !helpComment.trim()}` (see Fix 2)

**Card styling:**
- Each card: `rounded-xl border border-slate-200 bg-white min-h-[80px] flex flex-col items-center justify-center gap-1`
- Emoji: `text-2xl`
- Label: `text-sm font-medium text-slate-700 text-center`
- Active/hover: `border-[primaryColor] bg-[primaryColor]/5`
- «Другое» card: `col-span-2 flex-row gap-2` (emoji left + label)

**State management:**
- Add: `const [helpQuickSent, setHelpQuickSent] = useState(false)`
- Keep existing: `selectedHelpType`, `helpComment`, `isSendingHelp`, `hasActiveRequest`, `helpSubmitError`
- On drawer close (`closeHelpDrawer`): reset `helpQuickSent`, `selectedHelpType`, `helpComment`

**i18n keys to add:**
- `help.quick_sent_title` = 'Запрос отправлен!'
- `help.quick_sent_desc` = 'Официант скоро подойдёт'

### НЕ должно быть
- NO textarea visible by default (only after tapping «Другое»)
- NO «Отмена» button as a standalone button
- NO multi-step type-selector → submit flow
- NO `disabled={isSendingHelp || !currentTableId}` on the «Отправить» button (root cause of PM-131)
- NO `relative` class on `<DrawerContent>` itself (KB-096: breaks vaul position:fixed — backdrop shows but drawer doesn't open)

### File and location
`pages/PublicMenu/x.jsx` — search `PM-125: Help as Bottom Drawer` (~lines 3658–3740)
MapPin + table name: ~lines 3675–3680
hasActiveRequest banner: ~lines 3681–3686

### Verification
1. Open help drawer via bell → see 4 cards + «Другое» in 2×2+1 layout
2. Tap «Принести счёт» → spinner on card, other cards disabled → success ✅ message → drawer auto-closes after 2s
3. Tap «Другое» → textarea + «Отправить» appears below grid
4. Type text → «Отправить» becomes enabled → tap → success + drawer closes

---

## Fix 2 — PM-131 (P2) [MUST-FIX]: «Отправить» button not clickable in «Другое» expanded form

### Current behavior
User selects a help type, writes a comment, taps «Отправить» — button does not respond. Root cause: `disabled` condition includes `!currentTableId` which may be falsy when drawer opens, or `pointer-events-none` / z-index issue blocks the button.

### Expected behavior
«Отправить» button in the «Другое» expanded form:
- `disabled={isSendingHelp || !helpComment.trim()}` ONLY — remove `!currentTableId` from the condition
- Ensure no `pointer-events-none` or z-index issue blocks the button touch target
- If drawer is open, `currentTableId` is always set (don't need it as disabled condition)

### НЕ должно быть
- NO `!currentTableId` in the disabled condition
- NO `pointer-events-none` on any parent wrapping the button
- NO z-index conflict with the absolute ChevronDown button

### File and location
`pages/PublicMenu/x.jsx` — help drawer section, search for `submitHelpRequest` button, ~lines 3655+

### Verification
1. Open «Другое», type text → «Отправить» becomes enabled
2. Tap «Отправить» with empty textarea → button stays disabled
3. Tap «Отправить» with text → request sent, drawer closes

---

## FROZEN UX (DO NOT CHANGE)

These elements are confirmed working and tested — do NOT modify, move, or restyle:
- ChevronDown close button: `absolute top-3 right-3` inside `<div className="relative">` wrapping DrawerHeader — PM-130 ✅
- DrawerContent className: `"max-h-[85vh] rounded-t-2xl"` — **NO `relative` class on DrawerContent** (KB-096)
- FAB bell button (HelpFab component) — do not touch
- Bell visibility condition: `view === "menu" && isHallMode && drawerMode !== 'cart'` — PM-129 ✅
- Drawer handlers: `isHelpModalOpen`, `openHelpDrawer`, `closeHelpDrawer` — do not rename
- pushOverlay / popOverlay / overlayStackRef pattern (Android Back) — PM-126 ✅
- MapPin + table name display (~lines 3675–3680)
- hasActiveRequest banner (~lines 3681–3686)

## ⛔ SCOPE LOCK — modify ONLY what is described in Fix 1 and Fix 2 above
- Do NOT touch CartView.jsx, MenuView.jsx, or any file other than `pages/PublicMenu/x.jsx`
- Do NOT modify any FROZEN UX element listed above
- If you see another issue outside this scope — SKIP it, do not fix

## MOBILE-FIRST CHECK (MANDATORY before commit)
This is a mobile-first restaurant app. Verify at 375px width:
- [ ] All 4 quick-action cards visible in 2×2 grid without overflow
- [ ] «Другое» full-width card visible below the 2×2 grid
- [ ] Touch targets >= 44x44px for all cards
- [ ] Success state (✅ Запрос отправлен) fits in drawer without overflow
- [ ] «Отправить» button reachable when textarea is open (not hidden behind keyboard)
- [ ] ChevronDown close button visible and clickable (top-3 right-3)

## Implementation Notes
- Keep `helpSubmitError` display — show below relevant section on send failure
- `submitHelpRequest` currently uses `selectedHelpType` state — add optional `typeOverride` param for quick cards
- `git add pages/PublicMenu/x.jsx && git commit -m "feat: help drawer redesign — one-tap cards + PM-131 fix" && git push`
=== END ===
