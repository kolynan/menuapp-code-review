# Codex Writer Findings — PublicMenu Chain: publicmenu-260322-185123

## Findings
1. [P2] Table-code field still renders a fake `0000` value (`x.jsx:3444`) — The Bottom Sheet input uses `placeholder={'0'.repeat(tableCodeLength)}`, so an empty code looks prefilled on mobile instead of empty. FIX: remove the numeric placeholder and use an empty string or a neutral non-numeric placeholder in the code-entry UI.
2. [P2] Bottom Sheet submit copy is still the long version (`x.jsx:515`, `x.jsx:3471`) — Both the i18n fallback map and the rendered CTA still use `Подтвердить и отправить`, which is too long for a narrow phone sheet. FIX: replace the key/fallback text with a short label such as `Отправить` everywhere this CTA is defined/rendered.
3. [P2] The deprecated "change table" action is still rendered (`x.jsx:516`, `x.jsx:3474-3481`) — The Bottom Sheet still shows `Не тот стол? Изменить`, even though this flow should no longer let guests switch tables here. FIX: remove the secondary button from the Bottom Sheet and delete the now-unused i18n key/fallback if nothing else references it.
4. [P3] Bottom Sheet is missing the loyalty motivation line (`x.jsx:3460-3472`) — `x.jsx` already computes loyalty state (`earnedPoints`, `loyaltyEnabled`), but the sheet never shows `+N бонусов за этот заказ` above the submit CTA. FIX: render the bonus text above the button using the existing loyalty calculation, and only show it when loyalty is enabled and the earned amount is positive.
5. [P1] The visible code cells are not actual mobile inputs (`x.jsx:3419-3445`) — The four code "cells" are plain `div`s, while the only editable control is a separate text input below them. On Android, tapping the UI that looks like the code-entry surface does nothing, so the numeric keyboard only appears if the user notices and taps the secondary field. FIX: make the visible cells the real input surface, or forward taps from them into a hidden single input; keep numeric-only entry and add mobile-friendly focus/`pattern=\"[0-9]*\"` behavior.
6. [P2] `StickyCartBar` never gets the partner brand color (`x.jsx:3553`, `x.jsx:3580`) — Both `StickyCartBar` instances omit `primaryColor`, so the sticky checkout button falls back to default styling instead of the partner's `primary_color`. FIX: pass `primaryColor={primaryColor}` to both `StickyCartBar` render paths.

## Summary
Total: 6 findings (0 P0, 1 P1, 4 P2, 1 P3)

## Prompt Clarity (MANDATORY — do NOT skip this section)
- Overall clarity: 4
- Ambiguous Fix descriptions (list Fix # and what was unclear): None.
- Missing context (what info would have helped): None required beyond the three allowed files.
- Scope questions (anything you weren't sure if it's in scope): The opening `pages/PublicMenu/*.jsx` wording suggested multiple JSX files, but the later "ONLY these 3 files" and task context narrowed the review to `pages/PublicMenu/x.jsx` plus the two docs.
