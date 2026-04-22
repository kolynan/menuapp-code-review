---
chain: publicmenu-260323-162542-bfb4
chain_step: 4
chain_total: 4
chain_step_name: merge
page: PublicMenu
budget: 6.00
runner: cc
type: chain-step
---
=== CHAIN STEP: Merge (4/4) ===
Chain: publicmenu-260323-162542-bfb4
Page: PublicMenu

You are the Merge step in a modular consensus pipeline.
Your job: apply the fix plan to the actual code.

INSTRUCTIONS:
1. Read the comparison: pipeline/chain-state/publicmenu-260323-162542-bfb4-comparison.md
2. Check if discussion report exists: pipeline/chain-state/publicmenu-260323-162542-bfb4-discussion.md
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
   - git commit -m "fix(PublicMenu): N bugs fixed via consensus chain publicmenu-260323-162542-bfb4"
   - git push
7. Write merge report to: pipeline/chain-state/publicmenu-260323-162542-bfb4-merge-report.md

FORMAT for merge report:
# Merge Report — PublicMenu
Chain: publicmenu-260323-162542-bfb4

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
