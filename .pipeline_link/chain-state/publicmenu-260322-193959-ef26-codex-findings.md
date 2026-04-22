# Codex Writer Findings — PublicMenu
Chain: publicmenu-260322-193959-ef26

## Findings
1. [P2] Tile card footer text can render under the CTA zone — In `MenuView.jsx:230-257`, the tile-card price/rating block uses the full card width while the add/stepper control is absolutely pinned to the same bottom-right corner. On narrow mobile cards, price or rating text can slide under the button area. FIX: change the footer wrapper to reserve the CTA lane, e.g. `className="mt-auto pt-2 space-y-1 pr-14"`.
2. [P1] Add-to-cart toast bypasses i18n with a hardcoded Russian fallback — In `MenuView.jsx:369`, `t('menu.added_to_cart') || 'Добавлено'` can produce mixed-language UI and violates the no-hardcoded-fallback rule for user-facing text. FIX: remove the literal fallback and route this through the page's normal translation/fallback mechanism so the toast is always localized.
3. [P2] Several mobile controls miss the 44x44 touch-target baseline — In `MenuView.jsx:163-170`, `274-284`, and `302-323`, the list stepper buttons, tile stepper buttons, and mobile layout toggle buttons render with hit areas around 24-32px. On a phone-at-table flow this makes quantity changes and layout switching easy to miss-tap. FIX: increase the clickable area to at least `h-11 w-11` or wrap the existing visuals in 44px hit targets.
4. [P2] Broken dish images have no load-failure fallback — In `MenuView.jsx:92-97` and `195-200`, images only fall back when `dish.image` is falsy. If the URL exists but fails to load, the card shows a broken image instead of the existing placeholder UI. FIX: add `onError` handling that swaps failed images to the placeholder state.
5. [P3] List-mode add/remove buttons are not accessible to screen readers — In `MenuView.jsx:150-173`, the list-view plus/minus controls are icon-only and do not have `aria-label`s, unlike the tile-view controls. Screen-reader users cannot tell which action each button performs. FIX: add translated `aria-label`s for list-view add/remove actions via `t(...)`.

## Summary
Total: 5 findings (0 P0, 1 P1, 3 P2, 1 P3)

## Prompt Clarity (MANDATORY — do NOT skip this section)
- Overall clarity: 3
- Ambiguous Fix descriptions (list Fix # and what was unclear): Fix #1 itself was precise, but the surrounding instructions conflicted on scope: the top-level task said "Find ALL bugs" while the embedded task context said "modify ONLY Fix 1" and "skip" other problems.
- Missing context (what info would have helped): Whether `t()` returns raw keys or empty strings on missing translations; whether review should re-report issues already listed in `BUGS.md`; whether the 44x44 mobile target rule should be treated as a hard defect threshold or only a recommendation.
- Scope questions (anything you weren't sure if it's in scope): Whether `pages/PublicMenu/*.jsx` meant all JSX files in the folder or only `MenuView.jsx`; whether `BUGS.md` counted as allowed context despite the "do NOT read old findings" instruction; whether unrelated but real `MenuView.jsx` defects should be reported given the embedded scope lock.
