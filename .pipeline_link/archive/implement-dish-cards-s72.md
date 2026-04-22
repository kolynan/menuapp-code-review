---
task_id: implement-dish-cards-s72
type: implementation
priority: high
created: 2026-03-03
session: S72
budget: 12.00
---

# Task: Implement Dish Card Redesign (S72)

## Context

Full CC+Codex design spec is ready in `outputs/Design_DishCards_S72.md`. This task implements 4 agreed changes to the tile-mode dish cards in PublicMenu (MenuView component).

**Read first:**
- `outputs/Design_DishCards_S72.md` — full spec with ASCII wireframes and CSS specs (AUTHORITATIVE)
- `outputs/Design_DishCards_Backlog_S72.md` — implementation order and complexity
- `ux-concepts/public-menu.md` — Decision #4 and #12 context

**Git:** Start with `git add . && git commit -m "S72 pre-dish-cards-impl snapshot" && git push`

---

## Changes to Implement (in order)

### Change 1 — Card alignment (Size S)
**File:** `menuapp-code-review/pages/PublicMenu/` — find MenuView / dish card component

Fix: change card content area to `flex flex-col` with `mt-auto` on the price+button row.
Add `line-clamp-2` to dish name element.

This pins price and action area to the bottom of every card regardless of name length.

### Change 2 — "+" button replacing "Добавить" (Size M)
**File:** same MenuView / dish card component

Replace the "Добавить" text button with a round "+" button overlaid on the photo:
```
ADD STATE:
- Position: absolute bottom-2 right-2 on image container
- Size: w-11 h-11 (44×44px)
- Style: bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-md
- Icon: Plus from lucide-react, w-5 h-5
- aria-label={t('menu.add')} — add i18n key if missing

IN-CART STATE (stepper):
- Position: same absolute location
- Shape: pill, h-11 rounded-full bg-white shadow-md
- Layout: [−] [N] [+] horizontal
- Minus/Plus: w-8 h-8 rounded-full hover:bg-slate-100
- Counter: min-w-[18px] text-center text-sm font-semibold text-indigo-600
```

Check how cart state is managed in PublicMenu (likely via useCart hook or similar). Use existing add/remove functions — do NOT rewrite cart logic.

### Change 3 — Photo placeholder (Size S)
**File:** same MenuView / dish card component

Replace the placeholder (currently shows `t('menu.photo_later')` text) with:
```
Container: w-full h-36 sm:h-48 bg-slate-50 flex items-center justify-center
Icon: ImageIcon from lucide-react, w-10 h-10 text-slate-300 (opacity ~30%)
No text whatsoever
aria-label="No photo available"
```

### Change 4 — Default view mode: list on mobile (Size S)
**File:** x.jsx (main PublicMenu file) — find the default viewMode state

Change default from `'tile'` to `'list'`.
localStorage persistence already works — no changes needed there.
Desktop can keep tile as default if there's already a responsive default (check code).

---

## Important Rules

- Work only on TILE VIEW cards. List view cards are already correct — do NOT change them.
- Do NOT change cart logic, hooks, or any other component than the card/photo rendering.
- Codex must review Changes 2 and 4 before RELEASE (higher risk).
- Add `menu.add` i18n key if it doesn't exist: ru="Добавить", en="Add", kk="Қосу"

---

## Required Output

### Deliverable 1: RELEASE file
`menuapp-code-review/pages/PublicMenu/260303-NN x RELEASE.jsx` (next number after last release)

### Deliverable 2: Update base/
Copy new release to `pages/PublicMenu/base/x.jsx`

### Deliverable 3: Update README
`pages/PublicMenu/README.md` — add UX changelog entry for S72 dish card changes

### Deliverable 4: Update ux-concepts/public-menu.md
Mark Decision #4 (+ button) and Decision #12 (card hierarchy) as ✅ Реализовано.

---

## Notes

- If the dish card is in a sub-component (e.g. DishCard.jsx or MenuView.jsx), edit that file and include it in the RELEASE.
- If you can't find the exact card component, search for `line-clamp` or `Добавить` string to locate it.
- The `Plus` icon is from `lucide-react` — already available in the project.
