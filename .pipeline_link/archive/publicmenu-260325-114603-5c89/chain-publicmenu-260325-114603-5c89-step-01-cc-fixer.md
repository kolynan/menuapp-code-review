---
chain: publicmenu-260325-114603-5c89
chain_step: 1
chain_total: 1
chain_step_name: cc-fixer
page: PublicMenu
budget: 4.00
runner: cc
type: chain-step
---
=== CHAIN STEP: CC Fixer (1/1) ===
Chain: publicmenu-260325-114603-5c89
Page: PublicMenu

You are the CC Fixer — a standalone step for quick bug fixes.
No Codex, no comparison — just analyze and fix.

INSTRUCTIONS:
1. Read the code file for PublicMenu in pages/PublicMenu/*.jsx
2. Also read README.md and BUGS.md in the same folder for context
3. Find ALL bugs and apply fixes directly
4. Focus on: logic errors, missing error handling, i18n issues, UI/UX for mobile-first, React anti-patterns
5. After applying fixes:
   a. Update BUGS.md in pages/PublicMenu/
   b. Update README.md if needed
6. Git commit and push:
   - git add <specific files only>
   - git commit -m "fix(PublicMenu): N bugs fixed (quick-fix chain publicmenu-260325-114603-5c89)"
   - git push

=== TASK CONTEXT ===
# Quick-fix: Two drawer regressions from chain 4504 (PM-128/PM-130 revisit)

Reference: `BUGS_MASTER.md`.
**Production page.**

Chain 4504 (commit 2af5564) introduced two regressions that cause ALL drawers (help drawer + table confirm drawer) to show only the dark backdrop overlay WITHOUT the DrawerContent sliding up. This quick-fix addresses both root causes.

## TARGET FILES (modify)
- `pages/PublicMenu/x.jsx` — both fixes

## CONTEXT FILES (read-only)
- `BUGS_MASTER.md`

---

## Fix 1 — PM-130 regression (P1) [MUST-FIX]: Help drawer content invisible — `relative` breaks vaul positioning

### Current behavior
Tapping the bell icon (🔔) on menu OR tapping bell in cart → screen darkens (vaul backdrop appears) but the help drawer content does NOT slide up. User is stuck on dark screen.

### Root cause
At line 3651, chain 4504 added `relative` to DrawerContent:
```jsx
<DrawerContent className="max-h-[85vh] rounded-t-2xl relative">
```
Tailwind's `.relative` (`position: relative`) overrides vaul's internal `position: fixed` on DrawerContent, causing the drawer content to render in normal document flow instead of as a fixed bottom sheet.

### Fix
Remove `relative` from `<DrawerContent>` at line 3651. Wrap the chevron button together with DrawerHeader in an inner `<div className="relative">` so the absolute-positioned chevron still works.

**BEFORE (line 3651-3662):**
```jsx
<DrawerContent className="max-h-[85vh] rounded-t-2xl relative">
  <button
    onClick={closeHelpDrawer}
    className="absolute top-3 right-3 w-11 h-11 flex items-center justify-center rounded-full bg-gray-200 text-gray-500 z-10"
    aria-label={t('common.close', 'Закрыть')}
  >
    <ChevronDown className="w-6 h-6" />
  </button>
  <DrawerHeader className="text-center pb-2">
    <DrawerTitle className="text-lg font-semibold text-slate-900">{t('help.modal_title', 'Нужна помощь?')}</DrawerTitle>
    <p className="text-sm text-slate-500 mt-1">{t('help.modal_desc', 'Выберите, чем мы можем помочь')}</p>
  </DrawerHeader>
```

**AFTER:**
```jsx
<DrawerContent className="max-h-[85vh] rounded-t-2xl">
  <div className="relative">
    <button
      onClick={closeHelpDrawer}
      className="absolute top-3 right-3 w-11 h-11 flex items-center justify-center rounded-full bg-gray-200 text-gray-500 z-10"
      aria-label={t('common.close', 'Закрыть')}
    >
      <ChevronDown className="w-6 h-6" />
    </button>
    <DrawerHeader className="text-center pb-2">
      <DrawerTitle className="text-lg font-semibold text-slate-900">{t('help.modal_title', 'Нужна помощь?')}</DrawerTitle>
      <p className="text-sm text-slate-500 mt-1">{t('help.modal_desc', 'Выберите, чем мы можем помочь')}</p>
    </DrawerHeader>
  </div>
```

### Must NOT
- Add `relative` to ANY `<DrawerContent>` element — this breaks vaul's fixed positioning
- Remove the chevron button itself (PM-130 fix must stay)
- Change the chevron styling (keep `bg-gray-200 w-11 h-11 rounded-full`)

### Verification
1. Tap bell icon on main menu → help drawer slides up from bottom ✓
2. Chevron visible in top-right of help drawer ✓
3. Tap chevron → drawer closes ✓

---

## Fix 2 — PM-128 regression (P1) [MUST-FIX]: Table confirm drawer not opening — `requestAnimationFrame` disrupts vaul

### Current behavior
In cart, tapping "Отправить официанту" without verified table → screen darkens but table code input drawer does NOT slide up. User is stuck.

### Root cause
At line 2752, chain 4504 added `requestAnimationFrame`:
```jsx
setShowTableConfirmSheet(true);
requestAnimationFrame(() => pushOverlay('tableConfirm'));
```
The `requestAnimationFrame` fires during vaul's animation cycle. `window.history.pushState` inside rAF disrupts vaul's opening animation for the second drawer (table confirm opens ON TOP of the already-open cart drawer).

### Fix
Replace the `requestAnimationFrame` with a `useEffect` that calls `pushOverlay` when `showTableConfirmSheet` becomes true. This ensures pushState runs AFTER React has committed the state update and vaul has started its animation.

**Step A — Remove rAF from handleSubmitOrder (line 2749-2754):**

**BEFORE:**
```jsx
if (orderMode === "hall" && !isTableVerified) {
  pendingSubmitRef.current = true;
  setShowTableConfirmSheet(true);
  requestAnimationFrame(() => pushOverlay('tableConfirm'));
  return;
}
```

**AFTER:**
```jsx
if (orderMode === "hall" && !isTableVerified) {
  pendingSubmitRef.current = true;
  setShowTableConfirmSheet(true);
  return;
}
```

**Step B — Add useEffect NEAR the existing tableConfirm useEffect (~line 2171):**

Find the existing `useEffect` that watches `isTableVerified` for auto-submit (search for `pendingSubmitRef.current && isTableVerified`). Add a NEW useEffect right AFTER it:

```jsx
// PM-128: Deferred pushOverlay for table confirm drawer — avoids disrupting vaul animation
useEffect(() => {
  if (showTableConfirmSheet) {
    const id = setTimeout(() => pushOverlay('tableConfirm'), 50);
    return () => clearTimeout(id);
  }
}, [showTableConfirmSheet, pushOverlay]);
```

Why `setTimeout(50)` instead of raw `useEffect`: vaul needs ~1 frame to begin its slide-up animation. A 50ms delay ensures the pushState fires AFTER vaul has started animating, not during the initial render commit.

### Must NOT
- Remove `pushOverlay('tableConfirm')` entirely — Android Back button must still close this drawer
- Change the `popOverlay('tableConfirm')` calls (lines 2174, 3536, 3547) — these are for CLOSING the drawer
- Modify the `handlePopState` switch case for 'tableConfirm' (line 2416-2418)
- Touch the cart Drawer (line 3444) or its open/close logic

### Verification
1. Open cart → tap "Отправить официанту" (without verified table) → table code input drawer slides up ON TOP of cart ✓
2. Enter table code → verify → submission works ✓
3. Press Android Back while table code drawer is open → drawer closes, cart remains ✓

---

## ⛔ SCOPE LOCK — change ONLY what is described above

Only modify `pages/PublicMenu/x.jsx`. Only change the specific lines described in Fix 1 and Fix 2.

Do NOT:
- Change any other DrawerContent elements (cart drawer at line 3449, detail card at line 3765, table confirm at line 3544)
- Modify pushOverlay/popOverlay function definitions (lines 1305-1316)
- Change handlePopState logic (lines 2400-2440)
- Alter bell icon condition (line 3842) — PM-129 fix is correct
- Change StickyCartBar, dish cards, prices, or any MenuView content
- Remove or modify the existing tableConfirm chevron button (line 3546-3551)

---

## FROZEN UX (DO NOT CHANGE)

- **PM-126 ✅** — Android Back overlay stack (handlePopState). Do NOT change.
- **PM-125 ✅** — Help Drawer + cart-to-help sequencing (handleHelpFromCart). Do NOT change.
- **#143 ✅** — Table code drawer chevron (lines 3546-3551). Do NOT change.
- **PM-129 ✅** — Bell condition `isHallMode` (line 3842). Do NOT change.
- **PM-117 ✅** — Detail card photo `aspect-square`. Do NOT change.
- **PM-099 ✅** — No custom drag handle. Do NOT add one.
- **#140 ✅** — CartView chevron in table info card. Do NOT touch CartView.jsx.

---

## MOBILE-FIRST CHECK (MANDATORY before commit)

This is a mobile-first restaurant app. Primary usage: customer phone at the table.
Before committing, verify ALL changes at 375px viewport width:
- [ ] Help drawer: slides up, chevron visible in top-right, content scrollable
- [ ] Table confirm drawer: slides up ON TOP of cart, 4-cell input visible
- [ ] Touch targets ≥ 44×44px
- [ ] No duplicate visual indicators
- [ ] Android Back closes correct drawer

---

## Implementation Notes
- File: `pages/PublicMenu/x.jsx` (only file modified)
- Fix 1 is a BEFORE/AFTER replacement — copy the AFTER block exactly
- Fix 2 has two parts (Step A + Step B) — do BOTH
- The new useEffect (Step B) should be placed near the existing tableConfirm useEffect around line 2171-2179
- Git: `git add pages/PublicMenu/x.jsx` (only one file)
=== END ===
