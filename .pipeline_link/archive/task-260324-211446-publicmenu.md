---
task_id: task-260324-211446-publicmenu
status: running
started: 2026-03-24T21:14:47+05:00
type: chain-step
page: PublicMenu
work_dir: C:/Dev/menuapp-code-review
budget_usd: 4.00
fallback_model: sonnet
version: 5.14
launcher: python-popen
---

# Task: task-260324-211446-publicmenu

## Config
- Budget: $4.00
- Mode: task-watcher.py launches Claude Code directly via Popen
- Fallback model: sonnet

## Prompt
---
chain: publicmenu-260324-205343-7865
chain_step: 2
chain_total: 4
chain_step_name: comparator
page: PublicMenu
budget: 4.00
runner: cc
type: chain-step
---
=== CHAIN STEP: Comparator (2/4) ===
Chain: publicmenu-260324-205343-7865
Page: PublicMenu

You are the Comparator in a modular consensus pipeline.
Your job: compare CC Writer and Codex Writer findings and produce a merge plan.

INSTRUCTIONS:
1. Read CC findings: pipeline/chain-state/publicmenu-260324-205343-7865-cc-findings.md
   - If NOT found there, try: `git pull --rebase` then check again
   - If still not found, search for any *-cc-findings.md in pipeline/chain-state/
2. Read Codex findings: pipeline/chain-state/publicmenu-260324-205343-7865-codex-findings.md
   - If NOT found there, search in pages/PublicMenu/review_*.md (Codex sometimes writes here)
   - If still not found, search for any *-codex-findings.md in pipeline/chain-state/
3. Compare both analyses and categorize:

Write comparison to: pipeline/chain-state/publicmenu-260324-205343-7865-comparison.md

FORMAT:
# Comparison Report — PublicMenu
Chain: publicmenu-260324-205343-7865

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
# Batch 9 Regressions — PM-128+PM-129+PM-130 (BACKLOG #149)

Reference: `BUGS_MASTER.md`.
**Production page.**

Three regressions from Batch 9 (chain 30fb, commit a28bde1). All in `pages/PublicMenu/x.jsx`.

## TARGET FILES (modify)
- `pages/PublicMenu/x.jsx` — all 3 fixes

## CONTEXT FILES (read-only)
- `BUGS_MASTER.md`
- `pages/PublicMenu/CartView.jsx` — for understanding cart interaction (do NOT modify)

---

## Fix 1 — PM-128 (P2) [MUST-FIX]: Table code drawer does not open — cart just darkens

### Сейчас
When user taps "Отправить официанту" while table is NOT verified, the table code input drawer ("Введите код стола") should appear on top of the cart. Instead: the cart overlay darkens (the tableConfirm Drawer's backdrop renders) but the DrawerContent does NOT slide up. User is stuck.

### Root cause (verified by Cowork reading code)
At line 2751, Batch 9 added `pushOverlay('tableConfirm')` BEFORE `setShowTableConfirmSheet(true)` (line 2752). The `pushOverlay` function (line 1305) calls `window.history.pushState(...)` synchronously. This pushState call while the cart Drawer is already open interferes with vaul's animation of the second Drawer.

**Before Batch 9:** only `setShowTableConfirmSheet(true)` was called — no pushState. The table confirm Drawer opened fine on top of the cart.
**After Batch 9:** `pushOverlay('tableConfirm')` + `setShowTableConfirmSheet(true)` — the pushState disrupts the second Drawer's opening animation when cart is already open.

### Должно быть
Table code input drawer slides up ON TOP of the cart (cart stays open underneath, darkened by overlay). Same behavior as before Batch 9, but WITH Android Back support.

The fix should separate the pushState from the Drawer opening. Options:
- Move `pushOverlay('tableConfirm')` into a `useEffect` that watches `showTableConfirmSheet` — when it becomes `true`, call `pushOverlay('tableConfirm')` after a short delay (e.g. `requestAnimationFrame` or `setTimeout(..., 50)`)
- OR move `pushOverlay('tableConfirm')` into the Drawer's `onOpenChange` handler (line 3533) when `open` transitions to `true`
- Key: the `setShowTableConfirmSheet(true)` MUST execute first, THEN the pushState entry is added after the Drawer animation starts

### Exact locations in `pages/PublicMenu/x.jsx`
- Line 1305-1308: `pushOverlay` function definition
- Line 2749-2753: `handleSubmitOrder` — the trigger (`if (orderMode === "hall" && !isTableVerified)`)
- Line 3531-3636: the `<Drawer open={showTableConfirmSheet}>` component (tableConfirm)
- Line 3444-3527: the cart `<Drawer>` (for context — this is already open when tableConfirm tries to open)

### НЕ должно быть
- Cart overlay darkening without tableConfirm content sliding up
- Removing pushOverlay('tableConfirm') entirely (Android Back still needs to close it)
- Breaking the existing Android Back behavior for tableConfirm (popstate case at line 2416-2418)

### Проверка
1. Open cart → tap "Отправить официанту" (without verified table) → table code input drawer slides up on top of cart ✓
2. Enter code → verify → submit works ✓
3. Press Android Back while table code drawer is open → drawer closes, cart remains ✓

---

## Fix 2 — PM-129 (P2) [MUST-FIX]: Bell icon on main menu only visible in hall mode

### Сейчас
Bell icon 🔔 was added by Batch 9 (PM-127 fix) but with an overly restrictive condition at line 3838:
```
view === "menu" && orderMode === "hall" && isTableVerified && currentTableId && drawerMode !== 'cart'
```
The `orderMode === "hall"` condition means the bell is ONLY visible when the app is in hall mode (table ordering at restaurant). In pickup/delivery mode or when orderMode is something else, the bell is hidden.

### Должно быть
Bell icon visible on main menu whenever the user has a verified table, regardless of order mode. Change the condition at line 3838 to:
```
view === "menu" && isTableVerified && currentTableId && drawerMode !== 'cart'
```
Remove `orderMode === "hall"` from the condition. The `isTableVerified` check already ensures the user is at a table (line 1616: `isTableVerified = isHallMode && (!!resolvedTable?.id || verifiedByCode)`).

**Wait — `isTableVerified` itself depends on `isHallMode`!** (line 1616). So if `isHallMode` is false, `isTableVerified` is always false, and the bell won't show regardless. This means the bell CORRECTLY only shows in hall mode because of the `isTableVerified` check. The redundant `orderMode === "hall"` in line 3838 can be removed, but the bell WILL still only show in hall mode due to `isTableVerified`.

**The actual question:** should the bell show in pickup/delivery mode too? In those modes there's no table, so "Нужна помощь?" (call waiter, napkins, etc.) doesn't apply. So hall-mode-only IS correct behavior.

**The real issue:** Arman tested and didn't see the bell. This means either:
- Arman was not in hall mode during testing
- OR `isTableVerified` was false (table not verified)
- OR `currentTableId` was null
- OR `drawerMode` was 'cart' (cart was open)

The fix should: make the bell visible more broadly in hall mode. Replace `isTableVerified` with `isHallMode` (show even before table verification — user might want to call waiter before entering table code):
```
view === "menu" && isHallMode && drawerMode !== 'cart'
```

### Exact location in `pages/PublicMenu/x.jsx`
- Line 3838: the condition rendering the bell button
- Line 3839-3845: the bell button JSX
- Line 1616: `isTableVerified` definition (for reference)
- Line 1559: `isHallMode` prop

### НЕ должно быть
- Bell visible in pickup/delivery mode (no table = no waiter service)
- Bell hidden when user is in hall mode but hasn't verified table yet

### Проверка
1. Open menu in hall mode (scan QR at table) → bell 🔔 visible on screen (bottom-left) BEFORE entering table code ✓
2. Open menu in pickup mode → no bell visible ✓
3. Tap bell → help drawer opens ✓

---

## Fix 3 — PM-130 (P3) [MUST-FIX]: Help drawer missing chevron close button

### Сейчас
The help drawer "Нужна помощь?" (lines 3650-3722) has no ChevronDown close button. User can only close it by swiping down or tapping "Отмена". Other drawers (detail card at line 3774, table code at line 3546) all have a grey circle chevron in top-right.

### Должно быть
Add a ChevronDown close button in the top-right corner of the help drawer. Use the exact same style as the table code drawer chevron (line 3546-3552):
```jsx
<button
  onClick={closeHelpDrawer}
  className="absolute top-3 right-3 w-11 h-11 flex items-center justify-center rounded-full bg-gray-200 text-gray-500 z-10"
  aria-label={t('common.close', 'Закрыть')}
>
  <ChevronDown className="w-6 h-6" />
</button>
```

Insert this button INSIDE `<DrawerContent>` at line 3651, as the first child (before `<DrawerHeader>`).

### Exact location in `pages/PublicMenu/x.jsx`
- Line 3650: `<Drawer open={isHelpModalOpen}>`
- Line 3651: `<DrawerContent className="max-h-[85vh] rounded-t-2xl">` — insert chevron button as FIRST child here
- Line 3654: `closeHelpDrawer` function (line 1654-1657) is already defined and used by "Отмена" button at line 3706

### НЕ должно быть
- Help drawer without a close button
- Chevron in a different style (must match table code drawer: `bg-gray-200`, `w-11 h-11`, `rounded-full`)
- Breaking existing "Отмена" button behavior

### Проверка
1. Open help drawer → grey circle chevron visible in top-right ✓
2. Tap chevron → help drawer closes ✓
3. "Отмена" button still works ✓

---

## ⛔ SCOPE LOCK

Only change what is described in Fix 1–3. Do NOT:
- Change the pushOverlay/popOverlay/handlePopState logic (Fix 1 only adjusts WHEN pushOverlay is called, not the function itself)
- Modify CartView.jsx (read-only)
- Change dish cards, prices, steppers, MenuView content
- Modify StickyCartBar appearance or behavior
- Change order submission logic (only the table confirm trigger timing)
- Alter detail card drawer or its layout

---

## FROZEN UX (DO NOT CHANGE)

**pages/PublicMenu/x.jsx — tested and working (chain 30fb S176):**
- **PM-126 ✅** — Android Back closes all 4 drawers (handlePopState at lines 2400-2440, overlayStackRef). Do NOT change.
- **PM-125 ✅** — Help Dialog→Drawer conversion works. Cart-to-help sequencing (handleHelpFromCart at line 1660) works. Do NOT change.
- **#143 ✅** — Table code drawer has chevron close button (lines 3546-3552). Do NOT remove.
- **PM-064/PM-071 ✅** — Table Confirmation BS trigger logic at line 2749 (`!isTableVerified` check). Do NOT change the condition logic.
- **PM-079/PM-088 ✅** — 4-cell input in table code BS (lines 3564-3596, sr-only hidden input). Do NOT change.
- **PM-090 ✅** — StickyCartBar uses `primaryColor` prop. Do NOT change.
- **PM-099 ✅** — No custom drag handle. Do NOT add one.
- **PM-117 ✅** — Detail card photo `aspect-square`. Do NOT change.

**pages/PublicMenu/CartView.jsx — DO NOT MODIFY (read-only):**
- **#140 ✅** — Chevron moved into table info card (lines 425-470). Do NOT touch CartView.

---

## MOBILE-FIRST CHECK (MANDATORY before commit)

This is a mobile-first restaurant app. Primary usage: customer phone at the table.
Before committing, verify ALL changes at 375px viewport width:
- [ ] Bell icon: visible, tappable (≥44×44px), not overlapping StickyCartBar
- [ ] Help drawer chevron: right-aligned, 44×44px touch target
- [ ] Table code drawer: slides up fully over cart (content visible, not just overlay)
- [ ] No duplicate visual indicators
- [ ] Android Back still closes correct drawer in all scenarios

---

## Implementation Notes
- Fix 1 is the critical one: the timing between pushState and Drawer animation. Test by opening cart → tapping submit without verified table → table code drawer MUST slide up fully.
- Fix 2: check that `isHallMode` is a prop passed to the main component (line 1559 confirms it is).
- Fix 3: copy-paste the chevron from line 3546-3552, change `onClick` to `closeHelpDrawer`.
- Git: `git add pages/PublicMenu/x.jsx` (only one file modified)
=== END ===


## Status
Running...
