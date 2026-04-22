---
chain: publicmenu-260327-202939-0fa1
chain_step: 1
chain_total: 1
chain_step_name: cc-fixer
page: PublicMenu
budget: 6.00
runner: cc
type: chain-step
---
=== CHAIN STEP: CC Fixer (1/1) ===
Chain: publicmenu-260327-202939-0fa1
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
   - git commit -m "fix(PublicMenu): N bugs fixed (quick-fix chain publicmenu-260327-202939-0fa1)"
   - git push

=== TASK CONTEXT ===
# Quick-fix: PM-155 — Discounted price floating point garbage

Reference: `BUGS_MASTER.md` PM-155. Regression from chain publicmenu-260327-181015-2eb1.
Production page: https://menu-app-mvp-49a4f5b2.base44.app

**Context:** Chain 2eb1 (Batch 13) removed `Math.round` from discounted price formula.
Raw JS multiplication `dish.price * (1 - discount/100)` produces floating point garbage like
`30.4094999999999998 ₸`. Fix: add `parseFloat((...).toFixed(2))` to round to 2 decimal places
BEFORE passing to `formatPrice`.

**TARGET FILES (modify):**
- `pages/PublicMenu/MenuView.jsx` — 2 occurrences (list card line ~103, tile card line ~281)
- `pages/PublicMenu/x.jsx` — 1 occurrence (detail card line ~3894)

---

## Fix 1 — PM-155 (P1) [MUST-FIX]: Wrap discounted price in toFixed(2) — 3 locations

### Current behavior (BAD)
```jsx
formatPrice(dish.price * (1 - partner.discount_percent / 100))
```
Result: `30.4094999999999998 ₸` — raw JS float, unreadable.

### Expected behavior
```jsx
formatPrice(parseFloat((dish.price * (1 - partner.discount_percent / 100)).toFixed(2)))
```
Result: `30.41 ₸` — clean, matches format of original price `32.01 ₸`.

### Must NOT
- Do NOT change `formatPrice(dish.price)` (original price — leave as-is).
- Do NOT change discount badge (–X%) logic.
- Do NOT change ANY other code.

### File and location — 3 exact occurrences to change

**pages/PublicMenu/MenuView.jsx, line ~103** (renderListCard):
```
{formatPrice(dish.price * (1 - partner.discount_percent / 100))}
```
→
```
{formatPrice(parseFloat((dish.price * (1 - partner.discount_percent / 100)).toFixed(2)))}
```

**pages/PublicMenu/MenuView.jsx, line ~281** (renderTileCard):
```
{formatPrice(dish.price * (1 - partner.discount_percent / 100))}
```
→ same replacement as above

**pages/PublicMenu/x.jsx, line ~3894** (detail card drawer):
```
{formatPrice(detailDish.price * (1 - partner.discount_percent / 100))}
```
→
```
{formatPrice(parseFloat((detailDish.price * (1 - partner.discount_percent / 100)).toFixed(2)))}
```

Search pattern to find all 3 locations:
`formatPrice(dish.price \* \(1 - partner.discount_percent` (2 hits in MenuView.jsx)
`formatPrice(detailDish.price \* \(1 - partner.discount_percent` (1 hit in x.jsx)

### Verification
1. Open menu with discount enabled (5%). List mode: discounted price = `30.41 ₸` (NOT `30.409...`).
2. Tile mode: same.
3. Detail card: `42.53 ₸` (NOT `42.5315 ₸`).

---

## ⛔ SCOPE LOCK — change ONLY the 3 lines described above
- Replace ONLY `dish.price * (1 - partner.discount_percent / 100)` → `parseFloat((...).toFixed(2))`
- Replace ONLY `detailDish.price * (1 - partner.discount_percent / 100)` → same pattern
- Do NOT touch any other code in either file.

## Implementation Notes
- TARGET FILES: `pages/PublicMenu/MenuView.jsx`, `pages/PublicMenu/x.jsx`
- Do NOT break: discount badge (-X%), original price display, tile stepper (PM-096)
- git add `pages/PublicMenu/MenuView.jsx` `pages/PublicMenu/x.jsx` && git commit -m "fix: PM-155 discount price floating point — add toFixed(2)" && git push
=== END ===
