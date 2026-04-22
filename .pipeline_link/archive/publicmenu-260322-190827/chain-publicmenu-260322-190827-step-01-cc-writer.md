---
chain: publicmenu-260322-190827
chain_step: 1
chain_total: 4
chain_step_name: cc-writer
chain_group: writers
chain_group_size: 2
page: PublicMenu
budget: 8.00
runner: cc
type: chain-step
---
=== CHAIN STEP: CC Writer (1/4) ===
Chain: publicmenu-260322-190827
Page: PublicMenu

You are the CC Writer in a modular consensus pipeline.
Your job: independently analyze the code and find ALL bugs.

INSTRUCTIONS:
1. Read the code file for PublicMenu in pages/PublicMenu/*.jsx
2. Also read README.md and BUGS.md in the same folder for context
3. Do your OWN independent analysis — find ALL bugs and issues
4. Focus on: logic errors, missing error handling, i18n issues, UI/UX for mobile-first, React anti-patterns
5. For each finding: [P0/P1/P2/P3] Title - Description. FIX: description of code change needed.
6. Write your findings to: pipeline/chain-state/publicmenu-260322-190827-cc-findings.md
7. Do NOT apply any fixes yet — only document findings

FORMAT for findings file:
# CC Writer Findings — PublicMenu
Chain: publicmenu-260322-190827

## Findings
1. [P0] Title — Description. FIX: ...
2. [P1] Title — Description. FIX: ...
...

## Summary
Total: N findings (X P0, Y P1, Z P2, W P3)

## Prompt Clarity (MANDATORY — do NOT skip this section)
Rate the task description quality (1-5). For any score below 4, explain what was unclear:
- Overall clarity: [1-5]
- Ambiguous Fix descriptions (list Fix # and what was unclear): ...
- Missing context (what info would have helped): ...
- Scope questions (anything you weren't sure if it's in scope): ...
YOU MUST FILL IN ALL FIELDS ABOVE. Findings without Prompt Clarity are incomplete.

=== TASK CONTEXT ===
# Bug Fixes: MenuView.jsx — 2 fixes (#87)

TARGET FILES (modify): `pages/PublicMenu/MenuView.jsx`
CONTEXT FILES (read-only): `pages/PublicMenu/README.md`

Production page: https://menu-app-mvp-49a4f5b2.base44.app
This is a mobile-first QR-menu restaurant app. Primary device: customer phone at the table.

**Context:** MenuView displays the restaurant menu: category chips at top, grid of dish cards below. Each card has dish image, name, description, price, and a "+" FAB button to add to cart. The parent x.jsx passes `primaryColor` and `activeColor` props derived from `partner?.primary_color`. These props are already available in MenuView but not fully used.

---

## Fix 1 — PM-062 (P2) MUST-FIX: Category chips use indigo instead of primaryColor

### Now (current behavior)
Category chips (horizontal scrollable tabs at top) use hardcoded `bg-indigo-600`, `bg-indigo-100`, `text-indigo-600` etc. This ignores the partner's brand color.

### Expected behavior
Replace ALL indigo references in CategoryChips with dynamic `primaryColor`/`activeColor`:
- Active chip background: use `activeColor` prop (already passed from x.jsx, value like `#F5E6E0`)
- Active chip text: use `primaryColor` prop (already passed from x.jsx, value like `#1A1A1A`)
- Use inline `style={{ backgroundColor: activeColor }}` and `style={{ color: primaryColor }}` for active state
- Inactive chip: keep neutral (bg-white or bg-gray-100, text-gray-700)

### Must NOT be
- ❌ No `bg-indigo-*` anywhere in MenuView
- ❌ No `text-indigo-*` anywhere in MenuView
- ❌ Don't hardcode new colors — use the props

### File and location
Search MenuView.jsx for `indigo`. Replace in CategoryChips component and any category-related styling.

### Already tried
Chain publicmenu-260322 S159 partially addressed colors in other components but MenuView category chips were not included.

### Verification
Open menu page → category chips should use the partner's color (terracotta by default), NOT indigo/purple.

---

## Fix 2 — PM-089 (P2) MUST-FIX: "+" FAB button overlaps dish text

### Now (current behavior)
The "+" button (add to cart FAB) on each dish card is positioned so that long dish names or descriptions get cut off / overlap with the button. There's not enough vertical space between the text area and the button.

### Expected behavior
Push the "+" button to the bottom of the card. Use `mt-auto` on the button container or increase the card's content area so text has room. The button should sit at the bottom-right, and text should have full space above it.

### Must NOT be
- Button must NOT overlap text
- Don't remove the "+" button
- Don't make the card excessively tall

### File and location
MenuView.jsx — look for the dish card component, find the "+" button (usually a `<button>` with `+` or `<Plus>` icon), and its container's flex layout.

### Verification
View menu with a dish that has a long name (>20 chars) → name is fully visible, "+" button is at bottom-right, no overlap.

---

## MOBILE-FIRST CHECK (MANDATORY before commit)
This is a mobile-first restaurant app. Primary usage: customer phone at the table.
Before committing, verify ALL changes at 375px viewport width:
- [ ] Touch targets ≥ 44×44px (h-11 w-11)
- [ ] Category chips scrollable horizontally
- [ ] Dish card text doesn't overflow
- [ ] "+" button tappable without accidental taps on card

## ⛔ SCOPE LOCK — modify ONLY what is described in Fix 1-2 above
- Change ONLY the code described in Fix sections above.
- Everything else — DO NOT TOUCH.
- If you see a "problem" not from this task — SKIP it, don't fix.

## Implementation Notes
- Files: `pages/PublicMenu/MenuView.jsx`
- Do NOT break: dish display, category filtering, add to cart functionality, image loading
- git add pages/PublicMenu/MenuView.jsx && git commit -m "fix(PublicMenu): 2 MenuView bugs (PM-062,PM-089)" && git push
=== END ===
