# Codex Writer Findings — PublicMenu Chain: publicmenu-260326-234309-77f1

## Findings
1. [P3] PM-148 removal is not enforced in `x.jsx` — the main menu still renders `ModeTabs` with the full table-verification payload, including `verifiedByCode`, `currentTableId`, `currentTable`, and `resolvedTable` (`pages/PublicMenu/x.jsx:3371-3384`). In this file there is no explicit gate that disables the post-verification success/banner state after table-code confirmation, so the banner removal is not guaranteed at the page boundary. FIX: remove the banner-driving prop/path from the menu render in `x.jsx`, or pass an explicit "do not show confirmation banner" flag while keeping the bottom-sheet table confirmation flow unchanged.
2. [P3] Guest-facing name output is still unsanitized in `x.jsx` — the file passes `getGuestDisplayName` straight into `CartView` (`pages/PublicMenu/x.jsx:3519-3530`) and also uses `getGuestDisplayName(guestToUse)` for the hall-order confirmation label (`pages/PublicMenu/x.jsx:2772-2774`, `pages/PublicMenu/x.jsx:3478-3481`). There is no display-only stripping of a trailing ` #N` suffix anywhere in this file, so guest-facing UI can still show the internal guest ID if the shared helper returns it. FIX: derive a guest-facing formatter in `x.jsx` that strips a trailing `\\s+#\\d+$` before passing/rendering the label, while keeping the stored guest data and staff-facing displays unchanged.

## Summary
Total: 2 findings (0 P0, 0 P1, 0 P2, 2 P3)

## Prompt Clarity (MANDATORY — do NOT skip this section)
- Overall clarity: 4
- Ambiguous Fix descriptions (list Fix # and what was unclear): Fix 1 — the task names `x.jsx` as the only target, but the banner-owning UI block is not identified inside this file; `x.jsx` only forwards verification props to child UI.
- Missing context (what info would have helped): Whether Fix 2 should also remove the suffix from the hall-order confirmation label in `x.jsx`, not only the cart header.
- Scope questions (anything you weren't sure if it's in scope): The task says target only `x.jsx`, but Fix 2 text references `x.jsx / CartView.jsx` display. Review stayed inside `x.jsx` only.
