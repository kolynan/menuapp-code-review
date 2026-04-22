# Codex Writer Findings — PublicMenu Chain: publicmenu-260322-204901-9d4e

## Findings
1. [P1] Hardcoded Russian toast fallback bypasses i18n at `MenuView.jsx:369` — The add-to-cart toast uses `{t('menu.added_to_cart') || 'Добавлено'}`. If `t()` returns a falsy value, the UI falls back outside the i18n system and shows hardcoded Russian text to every locale. FIX: replace it with the two-argument pattern `t('menu.added_to_cart', 'Добавлено')` and remove the `||` fallback.
2. [P2] List-mode stepper buttons are below the 44x44 mobile touch target at `MenuView.jsx:161-172` — Both list-mode `-` and `+` buttons still use `className="p-1 hover:bg-white rounded-md transition-colors"`, which keeps the tap area around icon size instead of mobile-safe button size. FIX: add a 44x44 minimum target such as `min-w-[44px] min-h-[44px] flex items-center justify-center` or `w-11 h-11 flex items-center justify-center` to both stepper buttons.
3. [P2] List-mode dish image has no broken-image fallback at `MenuView.jsx:92-97` — The list card renders `<img src={dish.image} ... loading="lazy" />` with no `onError` handling, so an invalid image URL will expose the browser’s broken-image icon instead of the intended slate placeholder. FIX: add an `onError` handler that hides or clears the image and reveals the existing placeholder state while keeping `loading="lazy"`.
4. [P3] List-mode action buttons are missing aria-labels at `MenuView.jsx:150-172` — The list-mode add button and both stepper buttons have no `aria-label`, while the tile-mode equivalents already use `t('menu.add')` and `t('menu.remove')`. FIX: add `aria-label={t('menu.add')}` to the add button and plus stepper button, and `aria-label={t('menu.remove')}` to the minus stepper button.
5. [P2] Tile-mode dish image has no broken-image fallback at `MenuView.jsx:195-200` — The tile card image has the same gap as list mode: a broken URL will render a browser error icon because the `<img>` has no `onError` path to fall back to the existing placeholder block. FIX: add an `onError` handler that hides or clears the image and allows the placeholder UI to appear, without removing `loading="lazy"`.

## Summary
Total: 5 findings (0 P0, 1 P1, 3 P2, 1 P3)

## Prompt Clarity (MANDATORY — do NOT skip this section)
- Overall clarity: 5
- Ambiguous Fix descriptions (list Fix # and what was unclear): none
- Missing context (what info would have helped): none
- Scope questions (anything you weren't sure if it's in scope): none
