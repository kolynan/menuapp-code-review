---
page: PublicMenu
code_file: pages/PublicMenu/MenuView.jsx
budget: 10
agent: cc+codex
chain_template: consensus-with-discussion
---

# KS-3 (#135): MenuView stepper position (PM-115)

**Production page.** Target file: MenuView.jsx only.

Reference: `BUGS_MASTER.md`.

---

## FROZEN UX (DO NOT CHANGE)
These elements are approved and tested — DO NOT modify under any circumstances:
- List-mode card: image RIGHT, «+» button = absolute overlay bottom-right of image (PM-108, PM-110)
- Tile-mode: «+» button = absolute overlay bottom-right of image (PM-111)
- discount_enabled guard === true (not just truthy) (PM-109)
- Touch targets ≥ 44px on all stepper buttons (PM-092, PM-096)
- Mobile grid: dynamic MOBILE_GRID[mobileCols], not hardcoded (PM-072)
- whitespace-nowrap on discounted prices in tile-mode (PM-106)

---

## Fix 1 — PM-115 (P3) [MUST-FIX]: List-mode stepper at BOTTOM-RIGHT of photo, not center

### Сейчас
In list-mode, when an item is in cart (stepper visible), the `−N+` stepper is positioned at the CENTER of the item photo (`inset-0 flex items-center justify-center` or similar). This overlaps the food photo poorly and looks wrong.
RELEASE 260324-01 (MenuView) contains a center-position fix that was tested on Android S172 and confirmed WRONG.

### Должно быть
The stepper `−N+` in list-mode must appear at the **bottom-right corner of the photo** — same position as the «+» add button. The stepper REPLACES the «+» button when item count > 0.
CSS: `absolute bottom-2 right-2` (or equivalent) on the stepper overlay.

### НЕ должно быть
- Do NOT use `inset-0` + `items-center` + `justify-center` — this centers the stepper (confirmed wrong, S172)
- Do NOT move the stepper outside the photo area
- Do NOT change the «+» button position (PM-110, PM-111 are FROZEN)
- Do NOT change stepper touch targets (must stay ≥ 44px)

### Файл и локация
File: `pages/PublicMenu/MenuView.jsx`
Function: `renderListCard` (or equivalent list-mode card renderer)
Search for: `inset-0` near stepper — that's the wrong centering class to replace.
Grep hint: search `"inset-0"` in MenuView.jsx → find the stepper overlay div in list card context.
Also search `"renderListCard"` or `"list-mode"` comment to find the card renderer.
Current wrong class: `inset-0 flex items-center justify-center` (or similar)
Required class: `absolute bottom-2 right-2` (matching PM-110 «+» button position)

### Уже пробовали
Chain 36d5 (S172, chain template С5): applied `center` position — tested Android, WRONG (PM-115 reopened).
Chain 98ba (S170): PM-115 🟡 — overlay appeared but position was off.

### Проверка
1. Open menu in list-mode
2. Add any item to cart (stepper appears)
3. Stepper `−N+` must be at BOTTOM-RIGHT of the item photo, NOT centered
4. Must NOT overlap dish name or price text

---

## ⛔ SCOPE LOCK — менять ТОЛЬКО то, что указано выше
- Modify ONLY the stepper position in list-mode card (renderListCard).
- Do NOT touch tile-mode cards, header, category chips, or any other component.
- Do NOT change stepper button sizes, colors, or logic.
- Locked UX decisions (FROZEN UX above) — PROHIBITED to change.
- If you notice another issue not in this task — SKIP IT.

## MOBILE-FIRST CHECK (MANDATORY before commit)
This is a mobile-first restaurant app. Primary usage: customer phone at the table.
Before committing, verify ALL changes at 375px viewport width:
- [ ] Stepper buttons: BOTTOM-RIGHT of photo (not centered)
- [ ] Touch targets ≥ 44×44px on stepper −/+ buttons
- [ ] Stepper does NOT overlap dish name or price text
- [ ] «+» button still visible when item count = 0 (not affected by fix)
- [ ] No regression in tile-mode (stepper/add button position unchanged)

## Implementation Notes
- TARGET FILES (modify): `pages/PublicMenu/MenuView.jsx`
- CONTEXT FILES (read-only): `BUGS_MASTER.md`
- This is a SINGLE CSS positioning fix — scope is very narrow
- After fix: `git add pages/PublicMenu/MenuView.jsx && git commit -m "KS-3 #135: PM-115 list-mode stepper bottom-right position"`
