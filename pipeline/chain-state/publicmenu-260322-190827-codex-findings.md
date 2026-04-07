# Codex Writer Findings — PublicMenu
Chain: publicmenu-260322-190827

## Findings
1. [P1] Hardcoded add-to-cart toast fallback bypasses i18n — `MenuView.jsx:369` renders `t('menu.added_to_cart') || 'Добавлено'`. If the translation key is missing, the UI silently falls back to hardcoded Russian text, which violates the page i18n rule against literal fallback strings and breaks locale consistency. FIX: Replace the literal fallback with a project i18n-safe helper or guaranteed translated key; do not hardcode user-facing text in JSX.
2. [P2] Quantity steppers are too small for mobile tapping — `MenuView.jsx:161-170` uses icon buttons with only `p-1`, and `MenuView.jsx:271-285` uses `w-8 h-8`. Both are below the required 44x44 mobile touch target, making quantity changes easy to miss or mis-tap on a phone. FIX: Increase all `+/-` controls to at least `w-11 h-11` or add equivalent hit-area padding.
3. [P2] Layout toggle buttons miss the mobile touch-target requirement — `MenuView.jsx:300-323` uses `px-3 py-1.5` with no minimum height, so the tile/list toggle is shorter than the 44px mobile target called out in the task. FIX: Give both toggle buttons a minimum `h-11` / `min-h-[44px]` hit area while preserving the current layout.
4. [P3] List-view cart controls are missing accessible labels — `MenuView.jsx:150-172` has no `aria-label` on the add button or the `+/-` stepper in list mode, while tile mode does provide translated labels. Screen-reader and voice-control users get unlabeled controls. FIX: Add translated `aria-label` props to the list-mode add, increase, and decrease buttons.
5. [P3] Broken image URLs have no fallback path — `MenuView.jsx:91-97` and `MenuView.jsx:195-200` only handle a falsy `dish.image`; they do not handle failed image loads. A bad CDN URL leaves broken-image browser chrome in the menu instead of the existing placeholder state. FIX: Add `onError` handling that swaps failed images to the placeholder UI.

## Summary
Total: 5 findings (0 P0, 1 P1, 2 P2, 2 P3)

## Prompt Clarity (MANDATORY — do NOT skip this section)
Rate the task description quality (1-5). For any score below 4, explain what was unclear:
- Overall clarity: 2
- Ambiguous Fix descriptions (list Fix # and what was unclear): Fix 1 says to replace indigo in `MenuView.jsx`, but this file contains no `CategoryChips` component and no `indigo` classes. Fix 2 says the `+` FAB currently overlaps text, but the current file already has the CTA moved to card bottom-right with `pb-14`, so the described current behavior does not match the code I reviewed.
- Missing context (what info would have helped): The actual file that renders category chips, and whether this review should report only still-open bugs or also note that some task-context bugs are already fixed.
- Scope questions (anything you weren't sure if it's in scope): Whether task-context mismatches like “Fix 1 is in another component” and “Fix 2 already appears implemented” should be reported as findings or only under Prompt Clarity.
