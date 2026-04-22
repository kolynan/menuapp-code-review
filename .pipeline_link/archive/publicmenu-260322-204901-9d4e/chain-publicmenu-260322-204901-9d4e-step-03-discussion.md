---
chain: publicmenu-260322-204901-9d4e
chain_step: 3
chain_total: 4
chain_step_name: discussion
page: PublicMenu
budget: 8.00
runner: cc
type: chain-step
---
=== CHAIN STEP: Discussion (3/4) ===
Chain: publicmenu-260322-204901-9d4e
Page: PublicMenu

You are the Discussion moderator in a modular consensus pipeline.
Your job: resolve disputes from the Comparator step by running a multi-round discussion between CC and Codex.

INSTRUCTIONS:

1. Read the comparison report: pipeline/chain-state/publicmenu-260322-204901-9d4e-comparison.md
2. Look at the "Disputes" section.

IF there are 0 disputes:
   - Write to pipeline/chain-state/publicmenu-260322-204901-9d4e-discussion.md:
     # Discussion Report — PublicMenu
     Chain: publicmenu-260322-204901-9d4e
     ## Result
     No disputes found. All items agreed or resolved by Comparator. Skipping discussion.
   - DONE. Exit immediately. Do NOT run any rounds.

IF there are 1+ disputes:
   Run up to 3 rounds of discussion. Each round:

   a) CC Position (you write):
      For each dispute, write your analysis:
      - Which solution is better and WHY (with code reasoning)
      - What edge cases or risks does each approach have

   b) Codex Position (run codex):
      Create a prompt file with CC's position and ask Codex to respond.
      Run: codex.cmd exec --model codex-mini --prompt "<prompt>" --quiet
      The prompt should include CC's position and ask Codex to:
      - Agree or disagree with CC's reasoning
      - Provide counter-arguments if it disagrees
      - Propose a compromise if possible

   c) After each round, check:
      - If both agree on all disputes → RESOLVED, stop early
      - If round 3 and still disagree → mark as UNRESOLVED for Arman

3. Write final discussion report to: pipeline/chain-state/publicmenu-260322-204901-9d4e-discussion.md

FORMAT:
# Discussion Report — PublicMenu
Chain: publicmenu-260322-204901-9d4e

## Disputes Discussed
Total: N disputes from Comparator

## Round 1
### Dispute 1: [title]
**CC Position:** ...
**Codex Position:** ...
**Status:** resolved/ongoing

### Dispute 2: [title]
...

## Round 2 (if needed)
...

## Round 3 (if needed)
...

## Resolution Summary
| # | Dispute | Rounds | Resolution | Winner |
|---|---------|--------|------------|--------|
| 1 | Title   | 2      | resolved   | CC/Codex/compromise |
| 2 | Title   | 3      | unresolved | → Arman |

## Updated Fix Plan
Based on discussion results, provide the UPDATED fix plan that the Merge step should use.
Include ONLY the disputed items — agreed items from Comparator remain unchanged.
Format same as Comparator's "Final Fix Plan":
1. [P0] Fix title — Source: discussion-resolved — Description
2. ...

## Unresolved (for Arman)
Items where CC and Codex could not agree after 3 rounds.
Arman must decide. Each item shows both positions.

4. Do NOT apply any fixes — only document the discussion results

=== TASK CONTEXT ===
# Bug Fix: MenuView L-weight fixes — 5 bugs (PM-091–095)

Reference: `BUGS_MASTER.md`, `pages/PublicMenu/BUGS.md`, `pages/PublicMenu/README.md`.
Production page.

**TARGET FILES (modify):** `pages/PublicMenu/MenuView.jsx`
**CONTEXT FILES (read-only):** `pages/PublicMenu/README.md`, `pages/PublicMenu/BUGS.md`

**Context:** MenuView.jsx (373 lines) renders the restaurant menu — dish cards in list mode and tile (grid) mode. It uses `t(key)` for i18n (passed as prop from parent x.jsx). These 5 bugs were found by Codex in S162 as out-of-scope findings. All are L-weight (one-line or few-line fixes).

---

## Fix 1 — PM-091 (P1) [MUST-FIX]: Hardcoded Russian fallback in toast

### Now (current behavior)
Line 369: `{t('menu.added_to_cart') || 'Добавлено'}` — uses JS `||` operator which means if `t()` returns `undefined`, the hardcoded Russian string shows. This is an i18n violation: non-Russian speakers see Russian text.

### Expected (correct behavior)
Use the `t(key, fallback)` two-argument pattern: `{t('menu.added_to_cart', 'Добавлено')}`. This way the `t()` function handles fallback internally (consistent with all other t() calls in the file).

### Must NOT be
- ❌ Hardcoded Russian outside of `t()` fallback parameter
- ❌ English-only fallback (the app is Russian-primary, so Russian fallback is correct — but it must go through `t()`)

### File and location
`MenuView.jsx` line 369. Search: `|| 'Добавлено'`.

### Verification
Search the file for `|| '` (JS OR with string literal) — should find 0 results after fix.

---

## Fix 2 — PM-092 (P2) [MUST-FIX]: Touch targets below 44px on list-mode stepper buttons

### Now (current behavior)
List-mode stepper buttons (−/+) at lines 161-173 have `className="p-1 hover:bg-white rounded-md"` — effective size ~24x24px, well below 44px minimum.

### Expected (correct behavior)
Add minimum touch target: `min-w-[44px] min-h-[44px]` (or `w-11 h-11`) to both stepper buttons at lines 161-165 and 168-172. Keep the visual icon size at `w-4 h-4` but enlarge the tap area.

### Must NOT be
- ❌ Buttons with effective touch area < 44x44px
- ❌ Visual layout broken by oversized buttons (use `flex items-center justify-center` to keep icon centered)

### File and location
`MenuView.jsx` lines 161-165 (minus button) and 168-172 (plus button) in `renderListCard`. Search: `p-1 hover:bg-white rounded-md`.

### Verification
Inspect list-mode stepper buttons → computed size >= 44x44px.

---

## Fix 3 — PM-093 (P2) [MUST-FIX]: No onError fallback for dish images in list mode

### Now (current behavior)
List-mode dish image at lines 92-97: `<img src={dish.image} ... />` — if the image URL is broken/404, the browser shows a broken image icon. No fallback.

### Expected (correct behavior)
Add `onError` handler that hides the broken image and shows the placeholder (same as the no-image state at lines 98-102): `onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextSibling && (e.currentTarget.nextSibling.style.display = 'flex'); }}` — OR replace `<img>` src with empty and show placeholder div.

Simpler approach: add `onError={(e) => { e.currentTarget.src = ''; e.currentTarget.style.display = 'none'; }}` and ensure the parent div shows `bg-slate-100` background as fallback.

### Must NOT be
- ❌ Broken image icon visible to user
- ❌ Removing lazy loading (`loading="lazy"`)

### File and location
`MenuView.jsx` lines 92-97 in `renderListCard`. The `<img>` tag at line 92-97.

### Verification
Set a dish image URL to invalid → list card shows slate placeholder, not broken image icon.

---

## Fix 4 — PM-094 (P3) [MUST-FIX]: Missing aria-labels on list-mode buttons

### Now (current behavior)
Three buttons in list-mode `renderListCard` (lines 148-176) lack aria-labels:
1. "+" add button at line 150-158: no `aria-label`
2. "−" stepper button at line 161-165: no `aria-label`
3. "+" stepper button at line 168-172: no `aria-label`

Compare with tile-mode (lines 260-287) which already HAS aria-labels: `aria-label={t('menu.add')}`, `aria-label={t('menu.remove')}`.

### Expected (correct behavior)
Add the same aria-labels as tile mode:
- Add button: `aria-label={t('menu.add')}`
- Minus stepper: `aria-label={t('menu.remove')}`
- Plus stepper: `aria-label={t('menu.add')}`

### Must NOT be
- ❌ Hardcoded English aria-labels — use `t()` with i18n keys
- ❌ Missing aria-labels on interactive elements

### File and location
`MenuView.jsx` lines 150, 161, 168 in `renderListCard`. The tile-mode equivalents at lines 261, 273, 283 already have the correct pattern.

### Verification
Search `renderListCard` for `<button` — every button must have `aria-label`.

---

## Fix 5 — PM-095 (P2) [MUST-FIX]: No onError fallback for dish images in tile mode

### Now (current behavior)
Tile-mode dish image at lines 195-200: `<img src={dish.image} ... />` — same problem as Fix 3 but in `renderTileCard`. Broken image URL shows broken icon.

### Expected (correct behavior)
Same pattern as Fix 3: add `onError` handler to hide broken image and show the existing placeholder div (lines 201-204).

### Must NOT be
- ❌ Broken image icon visible to user

### File and location
`MenuView.jsx` lines 195-200 in `renderTileCard`. The `<img>` tag.

### Verification
Set a dish image URL to invalid in tile mode → card shows slate placeholder with ImageIcon, not broken image icon.

---

## ⛔ SCOPE LOCK — change ONLY what is described above
- Modify ONLY the code described in Fix 1-5 above.
- Everything else — DO NOT TOUCH.
- If you see other "problems" not in this task — SKIP them, do not fix.
- Do NOT change: grid layout, card structure, darkenColor function, DishRating component, category rendering.

## MOBILE-FIRST CHECK (MANDATORY before commit)
This is a mobile-first restaurant app. Primary usage: customer phone at the table.
Before committing, verify ALL changes at 375px viewport width:
- [ ] Touch targets >= 44x44px (h-11 w-11)
- [ ] No broken image icons visible
- [ ] Toast text goes through t() function
- [ ] All interactive buttons have aria-label

## Implementation Notes
- TARGET: `pages/PublicMenu/MenuView.jsx` (373 lines)
- CONTEXT: `pages/PublicMenu/README.md`, `pages/PublicMenu/BUGS.md`
- `t(key)` is passed as prop — supports `t(key, fallback)` pattern
- Do NOT break: dish card layout, stepper +/- logic, discount badge, rating display
- git add pages/PublicMenu/MenuView.jsx && git commit -m "fix: MenuView L-bugs — i18n, touch targets, onError, aria (PM-091-095)" && git push
=== END ===
