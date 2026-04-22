---
chain: publicmenu-260322-131000
chain_step: 4
chain_total: 4
chain_step_name: merge
page: PublicMenu
budget: 5.00
runner: cc
type: chain-step
---
=== CHAIN STEP: Merge (4/4) ===
Chain: publicmenu-260322-131000
Page: PublicMenu

You are the Merge step in a modular consensus pipeline.
Your job: apply the fix plan to the actual code.

INSTRUCTIONS:
1. Read the comparison: pipeline/chain-state/publicmenu-260322-131000-comparison.md
2. Check if discussion report exists: pipeline/chain-state/publicmenu-260322-131000-discussion.md
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
   - git commit -m "fix(PublicMenu): N bugs fixed via consensus chain publicmenu-260322-131000"
   - git push
7. Write merge report to: pipeline/chain-state/publicmenu-260322-131000-merge-report.md

FORMAT for merge report:
# Merge Report — PublicMenu
Chain: publicmenu-260322-131000

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
# UX Batch: MenuView fixes + discount color (#87 KS-3)

Reference: `ux-concepts/UX_LOCKED_PublicMenu.md`, `BUGS_MASTER.md`, `STYLE_GUIDE.md`.
Production page.

**Context:** MenuView has several open L-bugs that are all visually testable together. Plus discount color feature (#84) — partner entity already has `discount_color` field (added S156, default `#C92A2A`). All fixes target MenuView.jsx primarily, with CartView.jsx for discount badges if they render there.

TARGET FILES (modify): MenuView.jsx, CartView.jsx
CONTEXT FILES (read-only): README.md, BUGS.md

---

## Fix 1 — PM-077 (P2) [MUST-FIX]: Move "+" button to bottom-right of dish card

### Сейчас (текущее поведение)
The "+" (add to cart) button on each dish card is positioned in the CENTER of the card. This violates LOCK-PM-001.

### Должно быть (ожидаемое поведение)
The "+" button should be positioned in the **bottom-right corner** of each dish card. Standard FAB-pattern per Material Design:
- `position: absolute` (relative to card container)
- `bottom-right` corner of the card
- Button style: `bg-[#B5543A] text-white rounded-full w-11 h-11` (44×44px, primary color)
- The card container needs `position: relative` if not already set

This is a LOCKED UX decision: `ux-concepts/UX_LOCKED_PublicMenu.md` → LOCK-PM-001.

### НЕ должно быть (анти-паттерны)
- NO centered "+" button on dish cards
- NO inline "+" button (not absolute positioned)
- NO "+" button smaller than 44×44px
- NO indigo/purple/blue color on "+" button — must be primary (#B5543A)

### Файл и локация
File: `pages/PublicMenu/MenuView.jsx`
Look for: the "+" button/icon rendered inside each dish card (grid item). Currently centered — move to bottom-right with absolute positioning.

### Проверка (мини тест-кейс)
1. Open menu → each dish card has "+" in bottom-right corner
2. "+" button is terracotta (#B5543A), round, 44×44px

---

## Fix 2 — PM-072 (P2) [MUST-FIX]: Dynamic grid columns from partner setting

### Сейчас (текущее поведение)
MenuView uses hardcoded `grid-cols-2` for the dish grid, ignoring the `partner.menu_grid_mobile` setting.

### Должно быть (ожидаемое поведение)
Read `partner.menu_grid_mobile` (number: 1, 2, or 3) and apply dynamically:
```jsx
className={`grid grid-cols-${partner.menu_grid_mobile || 2} gap-4`}
```
Or use a mapping object if template literals don't work with Tailwind:
```jsx
const gridCols = { 1: 'grid-cols-1', 2: 'grid-cols-2', 3: 'grid-cols-3' };
className={`grid ${gridCols[partner.menu_grid_mobile] || 'grid-cols-2'} gap-4`}
```
Default: 2 columns if `menu_grid_mobile` is not set.

### НЕ должно быть (анти-паттерны)
- NO hardcoded `grid-cols-2` in MenuView
- NO breaking the grid when `menu_grid_mobile` is undefined (must fallback to 2)

### Файл и локация
File: `pages/PublicMenu/MenuView.jsx`
Look for: `grid-cols-2` in the dish grid container. Replace with dynamic class.

### Уже пробовали
Chain 195108 (S155A): SKIPPED — task was focused on other fixes. First attempt in this batch.

### Проверка (мини тест-кейс)
1. Check partner settings for `menu_grid_mobile` value → grid matches that value
2. If not set → defaults to 2 columns

---

## Fix 3 — AC-09 (P2) [MUST-FIX]: Toast feedback on add to cart

### Сейчас (текущее поведение)
When user taps "+" to add a dish to cart, the dish is added but there is NO visual feedback/confirmation. User doesn't know if the action succeeded.

### Должно быть (ожидаемое поведение)
Show a brief toast/notification when a dish is added to cart:
- Text: "Добавлено" (or dish name + "добавлено")
- Duration: 1.5 seconds, then auto-dismiss
- Position: bottom-center of screen, above the StickyCartBar if visible
- Style: small, subtle, non-blocking. Example: `bg-slate-800 text-white text-sm rounded-lg px-4 py-2 shadow-lg`
- Animation: fade in + slide up, fade out

Alternative (simpler): brief animation on the "+" button itself (scale pulse, checkmark flash for 0.5s). Either approach is acceptable.

### НЕ должно быть (анти-паттерны)
- NO blocking modal or alert
- NO toast lasting more than 2 seconds
- NO toast that covers the CTA or important UI elements

### Файл и локация
File: `pages/PublicMenu/MenuView.jsx`
Look for: `handleAddToCart` or similar function triggered by "+" button. Add toast state and rendering there. If a toast component already exists in the codebase, reuse it.

### Проверка (мини тест-кейс)
1. Tap "+" on any dish → see brief "Добавлено" toast or button animation
2. Toast disappears after ~1.5s
3. Rapid tapping "+" multiple times → no stacking/overlapping toasts

---

## Fix 4 — #84 (P2) [MUST-FIX]: Discount badges use partner.discount_color

### Сейчас (текущее поведение)
Discount badges on dish cards (e.g., "-20%") use a hardcoded color (likely red or default).

### Должно быть (ожидаемое поведение)
Discount badges should use `partner.discount_color` from the Partner entity:
- Background: `partner.discount_color` (default: `#C92A2A` if not set)
- Text: white
- Example: `style={{ backgroundColor: partner.discount_color || '#C92A2A' }}` with `text-white`

The `discount_color` field already exists in Partner entity (added S156).

### НЕ должно быть (анти-паттерны)
- NO hardcoded discount badge color
- NO breaking badges when `discount_color` is not set (must fallback to `#C92A2A`)

### Файл и локация
Files: `pages/PublicMenu/MenuView.jsx` (dish cards with discount badges) and potentially `pages/PublicMenu/CartView.jsx` (if discount is shown in cart)
Look for: discount percentage rendering, badge/chip with "-X%" text. Replace hardcoded color with dynamic `partner.discount_color`.

### Проверка (мини тест-кейс)
1. Partner with `discount_color` set → badges use that color
2. Partner without `discount_color` → badges use default #C92A2A
3. Badges still readable (white text on colored background)

---

## ⛔ SCOPE LOCK — менять ТОЛЬКО то, что указано выше
- Изменяй ТОЛЬКО код, описанный в Fix-секциях выше.
- ВСЁ остальное — НЕ ТРОГАТЬ.
- Если видишь «проблему» не из этой задачи — ПРОПУСТИ, не чини.
- Locked UX decisions (см. `ux-concepts/UX_LOCKED_PublicMenu.md`) — ЗАПРЕЩЕНО менять.
- Do NOT change primary_color logic (already implemented in #82).
- Do NOT change category chips, header, or checkout flow.

## Implementation Notes
- TARGET FILES: `MenuView.jsx`, `CartView.jsx`
- CONTEXT FILES: `README.md`, `BUGS.md`
- НЕ ломать: #82 (primary_color dynamic), PM-063 (stepper), KS-1 fixes (motivation text), KS-2 fixes (chevron)
- Partner entity fields available: `partner.primary_color`, `partner.discount_color`, `partner.menu_grid_mobile`
- After all fixes: `git add pages/PublicMenu/MenuView.jsx pages/PublicMenu/CartView.jsx && git commit -m "ux: menuview fixes + discount color #87-KS3" && git push`
=== END ===
