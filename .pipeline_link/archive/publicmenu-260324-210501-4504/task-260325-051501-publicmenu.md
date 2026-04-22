---
task_id: task-260325-051501-publicmenu
status: running
started: 2026-03-25T05:15:02+05:00
type: chain-step
page: PublicMenu
work_dir: C:/Dev/menuapp-code-review
budget_usd: 4.00
fallback_model: sonnet
version: 5.14
launcher: python-popen
---

# Task: task-260325-051501-publicmenu

## Config
- Budget: $4.00
- Mode: task-watcher.py launches Claude Code directly via Popen
- Fallback model: sonnet

## Prompt
---
chain: publicmenu-260324-210501-4504
chain_step: 4
chain_total: 4
chain_step_name: merge
page: PublicMenu
budget: 4.00
runner: cc
type: chain-step
---
=== CHAIN STEP: Merge (4/4) ===
Chain: publicmenu-260324-210501-4504
Page: PublicMenu

You are the Merge step in a modular consensus pipeline.
Your job: apply the fix plan to the actual code.

INSTRUCTIONS:
1. Read the comparison: pipeline/chain-state/publicmenu-260324-210501-4504-comparison.md
2. Check if discussion report exists: pipeline/chain-state/publicmenu-260324-210501-4504-discussion.md
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
   - git commit -m "fix(PublicMenu): N bugs fixed via consensus chain publicmenu-260324-210501-4504"
   - git push
7. Write merge report to: pipeline/chain-state/publicmenu-260324-210501-4504-merge-report.md

FORMAT for merge report:
# Merge Report — PublicMenu
Chain: publicmenu-260324-210501-4504

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
# Batch 9 Regressions — 3 Fixes (BACKLOG #149)

Reference: `BUGS_MASTER.md`, `ux-concepts/ACCEPTANCE_CRITERIA_publicmenu.md`.
**Production page.**

Three regressions introduced by Batch 9 (chain 30fb, commit a28bde1). All in `pages/PublicMenu/x.jsx`.
Must be fixed BEFORE Batch 10/11.

## CONTEXT
Batch 9 introduced `pushOverlay`/`popOverlay` system (lines 1305-1316) for Android Back button handling across all drawers. The system uses `overlayStackRef`, `isPopStateClosingRef`, and `isProgrammaticCloseRef` guards.

Three issues emerged during Android testing:
1. Table code drawer doesn't open (pushOverlay timing conflict with vaul Drawer)
2. Bell icon only visible in hall mode + verified table (too restrictive)
3. Help drawer missing close chevron

## TARGET FILES (modify)
- `pages/PublicMenu/x.jsx` — all 3 fixes are in this file

## CONTEXT FILES (read-only)
- `BUGS_MASTER.md` — bug reference
- `pages/PublicMenu/CartView.jsx` — context only (bell + chevron style reference)

---

## Fix 1 — PM-128 (P2) [MUST-FIX]: Table code drawer doesn't open (regression)

### Currently
When user taps "Отправить официанту" without a verified table code, the cart overlay darkens but the "Введите код стола" Bottom Sheet never appears. The drawer animation is disrupted.

### Root cause
At lines 2749-2753 in `handleSubmitOrder`:
```js
if (orderMode === "hall" && !isTableVerified) {
  pendingSubmitRef.current = true;
  pushOverlay('tableConfirm');        // line 2751 — pushes history state
  setShowTableConfirmSheet(true);     // line 2752 — opens Drawer
  return;
}
```
`pushOverlay` (line 1305-1308) calls `window.history.pushState()` synchronously. When called BEFORE `setShowTableConfirmSheet(true)`, the vaul Drawer library's internal animation gets disrupted because pushState triggers before the Drawer component mounts.

### Fix
**Reverse the order**: set state FIRST, push overlay AFTER. Use `requestAnimationFrame` or a microtask to delay pushOverlay until after React renders the Drawer:

```js
if (orderMode === "hall" && !isTableVerified) {
  pendingSubmitRef.current = true;
  setShowTableConfirmSheet(true);     // open Drawer FIRST
  requestAnimationFrame(() => {
    pushOverlay('tableConfirm');      // push history AFTER Drawer mounts
  });
  return;
}
```

⚠️ The `onOpenChange` callback of the TableConfirm Drawer (~line 3531-3542) already handles `popOverlay('tableConfirm')` on close — do NOT change that logic.

### Must NOT
- Call `pushOverlay` before `setState` (current broken order)
- Remove pushOverlay entirely (breaks Android Back for this drawer)
- Change the popOverlay logic in the Drawer's onOpenChange handler

### Verification
1. Open cart with items → tap "Отправить официанту" without table code → "Введите код стола" BS slides up ✓
2. Enter code and submit → BS closes, order proceeds ✓
3. Press Android Back while BS is open → BS closes (not browser back) ✓

---

## Fix 2 — PM-129 (P2) [MUST-FIX]: Bell icon not visible on main menu

### Currently
Bell icon on main menu (line 3838) has condition:
```js
{view === "menu" && orderMode === "hall" && isTableVerified && currentTableId && drawerMode !== 'cart' && (
```
This requires `isTableVerified` which is `true` only AFTER user enters table code (line 1616: `const isTableVerified = isHallMode && (!!resolvedTable?.id || verifiedByCode)`). So the bell is invisible until the user has already verified their table — but users need help BEFORE that (e.g., "where is my table code?").

### Fix
Replace the condition at line 3838 with:
```js
{view === "menu" && isHallMode && drawerMode !== 'cart' && (
```

Use `isHallMode` (already defined earlier in the component, truthy when `orderMode === "hall"`) instead of the full chain. Remove `isTableVerified && currentTableId` — the bell should be visible as soon as the user is in hall mode, even before table verification.

The help drawer itself (lines 3650-3722) already handles the case when `currentTableId` is null — it shows table info only if `currentTable` exists (line 3657).

### Must NOT
- Remove the bell icon entirely
- Show bell in non-hall modes (delivery/takeaway don't need waiter help)
- Change `isHallMode` definition (it's correct as-is)
- Change help drawer content or submission logic

### Verification
1. Open menu in hall mode (no table code entered yet) → bell icon visible bottom-left ✓
2. Tap bell → help drawer opens ✓
3. Switch to delivery mode → bell not visible ✓

---

## Fix 3 — PM-130 (P3) [MUST-FIX]: Help drawer missing close chevron

### Currently
Help drawer (lines 3650-3722) has no ChevronDown close button. The only way to close is swiping down or tapping "Отмена". Other drawers (table code at lines 3546-3552, detail card) have a grey circle chevron in top-right corner.

### Fix
Add ChevronDown button inside the help drawer, right after `<DrawerContent>` opens (after line 3651). Copy the exact style from the table code drawer chevron at lines 3546-3552:

```jsx
<button
  onClick={closeHelpDrawer}
  className="absolute top-3 right-3 w-11 h-11 flex items-center justify-center rounded-full bg-gray-200 text-gray-500 z-10"
  aria-label={t('common.close', 'Закрыть')}
>
  <ChevronDown className="w-6 h-6" />
</button>
```

The `DrawerContent` at line 3651 must include `relative` in className (needed for `absolute` positioning of the chevron):
```jsx
<DrawerContent className="max-h-[85vh] rounded-t-2xl relative">
```

`closeHelpDrawer` is already defined (~line 1654) and handles `popOverlay('help')` + state cleanup.

### Must NOT
- Create a new close handler (reuse existing `closeHelpDrawer`)
- Change the chevron style (must match table code drawer exactly)
- Add a custom drag handle (PM-099 FROZEN: no custom drag handles)
- Modify any other drawer's chevron

### Verification
1. Open help drawer (via bell) → grey circle chevron visible top-right ✓
2. Tap chevron → drawer closes ✓
3. Style matches table code drawer chevron exactly ✓

---

## ⛔ SCOPE LOCK

Only change what is described in Fix 1–3. Do NOT:
- Change dish card rendering, prices, steppers, or any MenuView content
- Modify StickyCartBar appearance or behavior
- Change order submission logic beyond the pushOverlay timing fix
- Alter styles/layout of cart items list or checkout flow
- Change detail card content, photo layout, or discount badge
- Touch `pages/PublicMenu/CartView.jsx` (read-only context only)
- Touch `pages/PublicMenu/MenuView.jsx`

---

## FROZEN UX (DO NOT CHANGE)

These elements are ✅ Fixed+Tested. Do NOT regress them:

**pages/PublicMenu/x.jsx:**
- **PM-064/PM-071 ✅** — Table Confirmation BS opens when "Отправить официанту" tapped without verified table. Trigger: `!isTableVerified` check before `validate()`, z-index `z-[60]` on BS.
- **PM-079 ✅** — Hidden text input in table code BS: `className="sr-only"` (~line 3409). Must stay.
- **PM-088 ✅** — 4-cell digit input in table code BS accepts input and displays correctly (~line 3409).
- **PM-090 ✅** — StickyCartBar "Оформить заказ" button uses `partner.primary_color` (not hardcoded).
- **PM-099 ✅** — No custom drag handle in detail card drawer (was removed; do NOT add one back).
- **PM-117 ✅** — Detail card photo: `aspect-square object-cover` layout. Do not change.
- **PM-032 ✅** — Loyalty points deducted AFTER Order.create() succeeds (not before).
- **PM-033 ✅** — localStorage access wrapped in try/catch (~lines 283–287).
- **PM-126 ✅** — Android Back closes all 4 drawers via overlayStackRef + handlePopState. Do NOT remove or rewrite the overlay system — only fix timing in Fix 1.
- **PM-125 ✅** — Help as Bottom Drawer (not Dialog). Bell in CartView closes cart → 300ms delay → help opens.
- **#143 ✅** — Chevron ˅ on table code drawer (top-right, bg-gray-200, 44×44px).

**pages/PublicMenu/CartView.jsx:**
- **PM-031 ✅** — Cart cannot be closed during order submission (dismissible guard).
- **PM-083 ✅** — Chevron ˅ on RIGHT side of table info card (non-sticky).
- **PM-086 ✅** — Email bonus field removed from cart.
- **PM-099 ✅** — No custom drag handle in CartView.

---

## MOBILE-FIRST CHECK (MANDATORY before commit)

This is a mobile-first restaurant app. Primary usage: customer phone at the table.
Before committing, verify ALL changes at 375px viewport width:
- [ ] Bell icon: visible on main menu, not overlapping other elements
- [ ] Bell touch target ≥ 44×44px (min-w-[44px] min-h-[44px])
- [ ] Help drawer chevron: RIGHT-ALIGNED (top-right), visible above content
- [ ] Help drawer: all option buttons visible and tappable at 375px
- [ ] Table code BS: opens correctly, chevron still works
- [ ] No duplicate visual indicators
- [ ] Android Back closes correct drawer (simulate with browser back button)

---

## Implementation Notes

- **pushOverlay timing (Fix 1):** The key insight is that vaul Drawer needs React state to render BEFORE pushState fires. `requestAnimationFrame` ensures Drawer mounts first. This is the same pattern as PM-107 fix (isProgrammaticCloseRef guard) — timing matters with history API + animated components.
- **isHallMode (Fix 2):** Already exists in code, derived from `orderMode === "hall"`. Using it instead of the full condition chain simplifies the bell visibility logic.
- **closeHelpDrawer (Fix 3):** Already defined and handles overlay cleanup. Just wire it to the new chevron button.
- Git: `git add pages/PublicMenu/x.jsx && git commit -m "fix: PM-128+PM-129+PM-130 batch9 regressions" && git push`
=== END ===


## Status
Running...
