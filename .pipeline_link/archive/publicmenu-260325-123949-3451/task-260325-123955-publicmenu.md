---
task_id: task-260325-123955-publicmenu
status: running
started: 2026-03-25T12:39:55+05:00
type: chain-step
page: PublicMenu
work_dir: C:/Dev/menuapp-code-review
budget_usd: 3.00
fallback_model: sonnet
version: 5.14
launcher: python-popen
---

# Task: task-260325-123955-publicmenu

## Config
- Budget: $3.00
- Mode: task-watcher.py launches Claude Code directly via Popen
- Fallback model: sonnet

## Prompt
---
chain: publicmenu-260325-123949-3451
chain_step: 1
chain_total: 1
chain_step_name: cc-fixer
page: PublicMenu
budget: 3.00
runner: cc
type: chain-step
---
=== CHAIN STEP: CC Fixer (1/1) ===
Chain: publicmenu-260325-123949-3451
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
   - git commit -m "fix(PublicMenu): N bugs fixed (quick-fix chain publicmenu-260325-123949-3451)"
   - git push

=== TASK CONTEXT ===
# Quick-fix: PM-128 — Remove `relative` from table confirm DrawerContent (same fix as PM-130)

Reference: `BUGS_MASTER.md`.
**Production page.**

The table code input drawer ("Введите код стола") does not slide up — only the dark backdrop appears. This is the SAME root cause as PM-130 (help drawer): Tailwind's `relative` class on `<DrawerContent>` overrides vaul's internal `position: fixed`, causing the drawer content to render in normal document flow instead of as a fixed bottom sheet.

## TARGET FILES (modify)
- `pages/PublicMenu/x.jsx` — one change

## CONTEXT FILES (read-only)
- None needed

---

## Fix 1 — PM-128 (P1) [MUST-FIX]: Remove `relative` from table confirm DrawerContent

### Current code (line 3551-3568)
```jsx
<DrawerContent className="max-h-[85dvh] rounded-t-3xl z-[60] relative">
  {/* #143: Chevron close button — top-right */}
  <button
    onClick={() => { popOverlay('tableConfirm'); pendingSubmitRef.current = false; setShowTableConfirmSheet(false); }}
    className="absolute top-3 right-3 w-11 h-11 flex items-center justify-center rounded-full bg-gray-200 text-gray-500 z-10"
    aria-label={t('common.close', 'Закрыть')}
  >
    <ChevronDown className="w-6 h-6" />
  </button>
  <DrawerHeader className="text-center pb-2">
    <DrawerTitle className="text-lg font-semibold text-slate-900">
      {tr('cart.verify.enter_table_code', 'Введите код стола')}
    </DrawerTitle>
    <p className="text-xs text-gray-400 mt-2 px-4">
      {tr('cart.verify.helper_text', 'Код указан на табличке вашего стола. Он нужен, чтобы официант знал куда нести заказ.')}
    </p>
  </DrawerHeader>
```

### Required change
Remove `relative` from `<DrawerContent>` className. Wrap the chevron button + DrawerHeader in `<div className="relative">` so the absolute-positioned chevron still works.

### After (replace the block above with this):
```jsx
<DrawerContent className="max-h-[85dvh] rounded-t-3xl z-[60]">
  <div className="relative">
    {/* #143: Chevron close button — top-right */}
    <button
      onClick={() => { popOverlay('tableConfirm'); pendingSubmitRef.current = false; setShowTableConfirmSheet(false); }}
      className="absolute top-3 right-3 w-11 h-11 flex items-center justify-center rounded-full bg-gray-200 text-gray-500 z-10"
      aria-label={t('common.close', 'Закрыть')}
    >
      <ChevronDown className="w-6 h-6" />
    </button>
    <DrawerHeader className="text-center pb-2">
      <DrawerTitle className="text-lg font-semibold text-slate-900">
        {tr('cart.verify.enter_table_code', 'Введите код стола')}
      </DrawerTitle>
      <p className="text-xs text-gray-400 mt-2 px-4">
        {tr('cart.verify.helper_text', 'Код указан на табличке вашего стола. Он нужен, чтобы официант знал куда нести заказ.')}
      </p>
    </DrawerHeader>
  </div>
```

### Must NOT
- Remove the chevron button itself (#143 fix must stay)
- Change `z-[60]` on DrawerContent (needed for stacking above cart)
- Add `relative` to ANY `<DrawerContent>` — this breaks vaul
- Change the useEffect for pushOverlay (lines 2183-2189) — keep it
- Modify pushOverlay/popOverlay functions
- Change any other drawer (help, detail card, cart)

### Verification
1. Open cart → tap "Отправить официанту" (without verified table) → table code input drawer slides up ON TOP of cart ✓
2. Chevron visible in top-right → tap → drawer closes ✓
3. Enter 4-digit code → verify → works ✓
4. Help drawer (bell icon) still works ✓

---

## ⛔ SCOPE LOCK

Change ONLY the DrawerContent at line 3551: remove `relative`, add inner wrapper `<div className="relative">` around chevron + DrawerHeader. That's it.

Do NOT change anything else in the file.

---

## FROZEN UX (DO NOT CHANGE)

All items from previous chains are frozen. Specifically do NOT touch:
- Help drawer (lines 3655-3670) — PM-130 fix working
- Bell icon condition (line 3842) — PM-129 fix working
- Android Back handlePopState (lines 2400-2440)
- Cart drawer (line 3444+)
- Detail card drawer (line 3764+)
- pushOverlay useEffect (lines 2183-2189) — PM-128 timing fix

---

## Post-fix file integrity check (KB-095)

After committing, verify the file is complete:
```bash
git show HEAD:pages/PublicMenu/x.jsx | wc -l
wc -l pages/PublicMenu/x.jsx
tail -3 pages/PublicMenu/x.jsx
```
Both line counts must match. Last line must be `}`.

---

## Implementation Notes
- This is a 2-line change: remove `relative` from className + add/close `<div className="relative">` wrapper
- Same pattern that fixed PM-130 (help drawer) in quick-fix 5c89
- Git: `git add pages/PublicMenu/x.jsx`
=== END ===


## Status
Running...
