# CC Writer Findings — PublicMenu (MenuView.jsx)
Chain: publicmenu-260322-204901-9d4e

## Findings

1. **[P1] Hardcoded Russian fallback in toast (PM-091)** — Line 369: `{t('menu.added_to_cart') || 'Добавлено'}` uses JS `||` operator which bypasses the i18n system. If `t()` returns `undefined`, non-Russian speakers see raw Russian text. FIX: Replace with `{t('menu.added_to_cart', 'Добавлено')}` using the two-argument `t(key, fallback)` pattern consistent with the rest of the codebase.

2. **[P2] Touch targets below 44px on list-mode stepper buttons (PM-092)** — Lines 161-165 and 168-172: the minus/plus stepper buttons in `renderListCard` have `className="p-1 hover:bg-white rounded-md"` giving an effective size of ~24x24px, well below the 44px minimum for mobile touch targets. FIX: Change `p-1` to `min-w-[44px] min-h-[44px] flex items-center justify-center` on both stepper buttons. Keep icon size at `w-4 h-4`.

3. **[P2] No onError fallback for dish images in list mode (PM-093)** — Lines 92-97: `<img src={dish.image} .../>` in `renderListCard` has no `onError` handler. If image URL is broken/404, the browser shows a broken image icon instead of a graceful fallback. FIX: Add `onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling && (e.currentTarget.nextElementSibling.style.display = 'flex'); }}` and add a hidden placeholder sibling `<div>` — OR simpler: add `onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.style.display = 'none'; }}` since the parent `div` already has `bg-slate-100` background which serves as a visual fallback.

4. **[P3] Missing aria-labels on list-mode buttons (PM-094)** — Lines 150, 161, 168: three buttons in `renderListCard` lack `aria-label` attributes. The tile-mode equivalents (lines 261, 273, 283) already have `aria-label={t('menu.add')}` and `aria-label={t('menu.remove')}`. FIX: Add `aria-label={t('menu.add')}` to the add button (line 150) and plus stepper (line 168). Add `aria-label={t('menu.remove')}` to the minus stepper (line 161).

5. **[P2] No onError fallback for dish images in tile mode (PM-095)** — Lines 195-200: `<img src={dish.image} .../>` in `renderTileCard` has the same issue as Finding 3. Broken image URL shows broken icon. FIX: Add `onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.style.display = 'none'; }}` — the parent div has `bg-slate-100` and the sibling placeholder div (lines 201-204) will be visible as fallback.

6. **[P2] Tile-mode stepper buttons below 44px (out-of-scope note)** — Lines 274 and 284: tile stepper minus/plus buttons have `w-8 h-8` (32px), below 44px mobile minimum. NOTE: This is NOT in the current task scope (PM-091-095) but flagged for awareness. Already has aria-labels.

## Summary
Total: 6 findings (0 P0, 1 P1, 4 P2, 1 P3)
In-scope (PM-091-095): 5 findings
Out-of-scope note: 1 finding (#6)

## Prompt Clarity (MANDATORY)
- Overall clarity: 5
- Ambiguous Fix descriptions: None — all 5 fixes are clear with exact line numbers, search strings, and expected behavior.
- Missing context: None — the task provided file path, line numbers, i18n pattern, and verification steps. The `t(key, fallback)` two-argument pattern was confirmed by reading the code.
- Scope questions: Finding 6 (tile stepper touch targets) is clearly similar to PM-092 but was not listed. The SCOPE LOCK makes it clear not to fix it, which is correct. No ambiguity.
