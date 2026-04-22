---
task_id: task-260323-163331-publicmenu
status: running
started: 2026-03-23T16:33:32+05:00
type: chain-step
page: PublicMenu
work_dir: C:/Dev/menuapp-code-review
budget_usd: 6.00
fallback_model: sonnet
version: 5.11
launcher: python-popen
---

# Task: task-260323-163331-publicmenu

## Config
- Budget: $6.00
- Mode: task-watcher.py launches Claude Code directly via Popen
- Fallback model: sonnet

## Prompt
---
chain: publicmenu-260323-162542-bfb4
chain_step: 2
chain_total: 4
chain_step_name: comparator
page: PublicMenu
budget: 6.00
runner: cc
type: chain-step
---
=== CHAIN STEP: Comparator (2/4) ===
Chain: publicmenu-260323-162542-bfb4
Page: PublicMenu

You are the Comparator in a modular consensus pipeline.
Your job: compare CC Writer and Codex Writer findings and produce a merge plan.

INSTRUCTIONS:
1. Read CC findings: pipeline/chain-state/publicmenu-260323-162542-bfb4-cc-findings.md
   - If NOT found there, try: `git pull --rebase` then check again
   - If still not found, search for any *-cc-findings.md in pipeline/chain-state/
2. Read Codex findings: pipeline/chain-state/publicmenu-260323-162542-bfb4-codex-findings.md
   - If NOT found there, search in pages/PublicMenu/review_*.md (Codex sometimes writes here)
   - If still not found, search for any *-codex-findings.md in pipeline/chain-state/
3. Compare both analyses and categorize:

Write comparison to: pipeline/chain-state/publicmenu-260323-162542-bfb4-comparison.md

FORMAT:
# Comparison Report — PublicMenu
Chain: publicmenu-260323-162542-bfb4

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
# Bugfix S168: discount_enabled guard + chevron alignment

Reference: `BUGS_MASTER.md`, `menuapp-code-review/pages/PublicMenu/`.
UX Lock: `ux-concepts/UX_LOCKED_PublicMenu.md`.
**Production page** — `https://menu-app-mvp-49a4f5b2.base44.app/x?partner=69540a85f2492cff3e46a283&mode=hall&lang=RU`

TARGET FILES (modify):
- `pages/PublicMenu/MenuView.jsx`
- `pages/PublicMenu/x.jsx`

CONTEXT FILES (read-only, do NOT modify):
- `pages/PublicMenu/x.jsx` — only for Fix 1 context; TARGET for Fix 2
- `pages/PublicMenu/CartView.jsx`

---

## Fix 1 — PM-109 (P1) [MUST-FIX]: Discount badge shows even when discount_enabled = false

### Сейчас
In PartnerSettings the partner can toggle discount on/off via `discount_enabled` field. When the toggle is turned OFF (`discount_enabled = false`), discount badges (showing "-X%") and strikethrough original prices still appear on dish cards in the menu. The guard condition is either missing or checking only `discount_percent > 0` without checking `discount_enabled`.

### Должно быть
Discount badge (e.g. "-10%") and strikethrough original price MUST only render when BOTH conditions are true:
```
partner.discount_enabled === true && partner.discount_percent > 0
```
When either condition is false: no badge, no strikethrough, show regular price only.

### НЕ должно быть
- Do NOT show discount badge when `discount_enabled` is false, even if `discount_percent > 0`
- Do NOT show strikethrough price when discount is disabled
- Do NOT change how the badge looks (color, size, position) — only add the guard condition
- Do NOT touch tile-mode or list-mode layout beyond the discount display logic

### Файл и локация
File: `pages/PublicMenu/MenuView.jsx`

Two functions to update — search for both:
1. `renderListCard` — search for `discount` or `discount_percent` or strikethrough (`line-through`) in list card render
2. `renderTileCard` — search for `discount` or `discount_percent` or strikethrough (`line-through`) in tile card render

In each function, wrap the discount badge and original price strikethrough in:
```jsx
{partner?.discount_enabled === true && (partner?.discount_percent ?? 0) > 0 && (
  // discount badge + original price strikethrough
)}
```

The `partner` object is likely passed as a prop or available via context — search for how it's accessed in the file.

### Уже пробовали
No previous КС attempts. Bug discovered S167 Android test ❌.

### Проверка
1. PartnerSettings → Скидки → toggle OFF → save → open menu on Android → NO discount badges, NO strikethrough prices ✅
2. PartnerSettings → Скидки → toggle ON, set 10% → save → open menu → discount badges "-10%" visible ✅
3. Dish prices look normal (no formatting issues) in both states

---

## Fix 2 — PM-104 (P3) [MUST-FIX]: Chevron misaligned with drag handle in cart drawer header

### Сейчас
The cart drawer (bottom sheet) header has two visual elements: a gray drag handle (horizontal line/pill at the very top) and a ChevronDown icon (˅). On Android these two elements appear at different vertical levels — they are NOT aligned at the same height. This creates a visual inconsistency in the header/drag area.

### Должно быть
The chevron icon and the gray drag handle should be visually at the same level OR the header should have a clean single visual indicator. Best approach: the drag handle bar and the chevron should both be inside the same flex container with `items-center` so they appear at the same vertical position.

### НЕ должно быть
- Do NOT hide the drag handle (gray line) — a previous attempt hid it which made it worse
- Do NOT remove the chevron icon
- Do NOT change the functionality of the drawer (open/close behavior unchanged)
- Do NOT change the header height significantly

### Файл и локация
File: `pages/PublicMenu/x.jsx`
- Search for: `ChevronDown` — this is the chevron icon in the cart drawer header
- Search for: `drag` or `drag-handle` or `rounded-full` (gray pill) — this is the drag indicator
- Look at the header section of the cart/bottom-sheet component (likely ~lines 3200-3500)
- The fix: ensure both elements are in a flex container with proper `items-center` alignment, or use absolute positioning to center them

### Уже пробовали
- **КС-5 S166** (chain publicmenu-260323-125539-3bf4): attempted fix, result unclear — not resolved on Android
- **Batch 6** (chain publicmenu-260323-142203-c460): incorrect fix — hid the drag handle entirely instead of aligning it. Do NOT hide the drag handle.
- Both attempts were confused by `x.jsx or CartView.jsx` ambiguity in previous prompts. The chevron IS in `x.jsx`. Do not look in CartView.jsx.

### Проверка
1. Open cart drawer on Android → chevron and gray line are visually at the same vertical level ✅
2. Drag handle (gray pill) is visible ✅
3. Drawer still opens/closes normally ✅

---

## ⛔ SCOPE LOCK — менять ТОЛЬКО то, что указано выше

- Modify ONLY the code described in Fix 1 and Fix 2 above
- Fix 1 scope: ONLY `MenuView.jsx` — guard condition for discount badge/strikethrough in `renderListCard` + `renderTileCard`
- Fix 2 scope: ONLY `x.jsx` — chevron + drag handle alignment in cart drawer header
- Do NOT touch: CartView.jsx, CheckoutView.jsx, ModeTabs.jsx, CategoryChips.jsx
- Do NOT refactor unrelated code
- If you see other bugs — IGNORE them, do not report
- UX decisions in `ux-concepts/UX_LOCKED_PublicMenu.md` — DO NOT change

## Implementation Notes
- Files: `pages/PublicMenu/MenuView.jsx`, `pages/PublicMenu/x.jsx`
- Do NOT break: PM-107 (programmatic close guard), PM-105 (back button stack)
- Do NOT break: existing discount display styling (color, font, badge shape)
- git commit after all fixes

## MOBILE-FIRST CHECK (MANDATORY before commit)
This is a mobile-first app (375px width target):
- [ ] Discount badge/price: check at 375px in both list-mode and tile-mode
- [ ] Cart drawer header: chevron + drag handle aligned at 375px viewport
- [ ] No layout shifts or overflow from the changes
=== END ===


## Status
Running...
