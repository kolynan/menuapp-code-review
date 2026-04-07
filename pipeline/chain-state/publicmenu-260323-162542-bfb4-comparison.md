# Comparison Report — PublicMenu
Chain: publicmenu-260323-162542-bfb4

## Agreed (both found)

### 1. [P1] Discount guard uses truthy check instead of strict `=== true` — MenuView.jsx lines 107, 126, 217, 240
- **CC:** Change all 4 occurrences from `partner?.discount_enabled && partner?.discount_percent > 0` to `partner?.discount_enabled === true && (partner?.discount_percent ?? 0) > 0`.
- **Codex:** Same fix, additionally suggests extracting a shared `const hasDiscount = ...` variable to DRY the guard.
- **Decision:** Apply the strict guard at all 4 locations. The shared `hasDiscount` variable idea from Codex is a minor refactor — since Rule F4 says "fix ONLY what is asked" and the task spec shows inline guards, use the inline pattern from the task spec to minimize scope. **Use CC's inline approach.**

### 2. [P3] Vaul drag handle hidden by CSS override — x.jsx line 3419
- **CC:** Remove `[&>[data-vaul-handle-hitarea]]:hidden [&_[data-vaul-handle]]:hidden` from DrawerContent className to restore the default vaul drag handle.
- **Codex:** Same — remove the handle-hiding classes. Additionally suggests adding a visible header block with `flex items-center justify-center` to align drag handle and chevron.
- **Decision:** Both agree the handle-hiding CSS must be removed. Codex's suggestion of a custom header flex container is better for alignment but touches more code and the chevron lives in CartView.jsx (read-only). **Minimum fix: remove the hiding classes to restore the drag handle.** See "Disputes" for the alignment detail.

## CC Only (Codex missed)

### 3. [P1] Same truthy guard issue in dish detail dialog — x.jsx line 3687
- **CC found:** The discount guard pattern `partner?.discount_enabled && partner?.discount_percent > 0` also exists in x.jsx at line 3687 (dish detail dialog price section). Same fix needed.
- **Codex missed this.** Codex only covered MenuView.jsx locations.
- **Validity:** SOLID — the same pattern exists in x.jsx and x.jsx is a TARGET file. The task scope says "TARGET FILES (modify): x.jsx". This is a real instance of the same bug in a different file.
- **Decision:** ACCEPTED — apply the same strict guard fix to x.jsx line 3687.

## Codex Only (CC missed)

### 4. [P3] DrawerHeader is `sr-only` — x.jsx line 3420-3422
- **Codex noted:** The cart `DrawerHeader` is marked `sr-only` (screen-reader only, visually hidden), which means there's no visible header container to use for alignment.
- **CC missed this detail** but arrived at the same conclusion via a different path (noting CartView.jsx read-only constraint).
- **Validity:** Valid observation. However, the DrawerHeader being `sr-only` is by design (accessibility) and changing it could break screen reader behavior.
- **Decision:** NOTED but not a separate fix — the handle restoration (agreed fix #2) is sufficient. Do not change the `sr-only` on DrawerHeader.

## Disputes (disagree)

### Dispute 1: How to fix chevron + drag handle alignment (Fix 2 approach)
- **CC approach:** Just restore vaul default handle (remove hiding CSS). Accept that chevron (in CartView.jsx, read-only) and drag handle won't be at exact same Y position, but both will be visible. This is the minimum viable fix within the x.jsx-only constraint.
- **Codex approach:** Remove hiding CSS AND add a custom visible header flex container in x.jsx with `flex items-center justify-center` to align both elements.
- **Problem with Codex approach:** The ChevronDown icon is rendered inside CartView.jsx (line 426-431), which is listed as read-only. You can't move it into x.jsx without modifying CartView.jsx. Adding a SECOND drag indicator in x.jsx while CartView.jsx already has one would create duplication.
- **Resolution:** **CC's minimal approach wins.** Restoring the vaul handle gives us two visible indicators (handle at top, chevron below). The task's core complaint was "no drag handle visible" (Batch 6 hid it). Restoring it addresses the issue. Perfect pixel alignment requires CartView.jsx changes which are out of scope.

## Final Fix Plan

Ordered list of all fixes to apply:

1. **[P1] MenuView.jsx — Strict discount guard in renderListCard badge** (line 107) — Source: AGREED — Change `partner?.discount_enabled &&` to `partner?.discount_enabled === true &&` and `partner?.discount_percent > 0` to `(partner?.discount_percent ?? 0) > 0`
2. **[P1] MenuView.jsx — Strict discount guard in renderListCard price** (line 126) — Source: AGREED — Same pattern change
3. **[P1] MenuView.jsx — Strict discount guard in renderTileCard badge** (line 217) — Source: AGREED — Same pattern change
4. **[P1] MenuView.jsx — Strict discount guard in renderTileCard price** (line 240) — Source: AGREED — Same pattern change
5. **[P1] x.jsx — Strict discount guard in dish detail dialog** (line 3687) — Source: CC ONLY (accepted) — Same pattern change as items 1-4
6. **[P3] x.jsx — Restore vaul drag handle** (line 3419) — Source: AGREED — Remove `[&>[data-vaul-handle-hitarea]]:hidden [&_[data-vaul-handle]]:hidden` from DrawerContent className

## Summary
- Agreed: 2 items (discount guard in MenuView.jsx + drag handle hidden in x.jsx)
- CC only: 1 item (discount guard in x.jsx dish detail) — 1 accepted, 0 rejected
- Codex only: 1 item (DrawerHeader sr-only observation) — 0 accepted as separate fix, 1 noted
- Disputes: 1 item (chevron alignment approach — resolved: CC minimal approach)
- **Total fixes to apply: 6** (5x discount guard strict check + 1x restore drag handle)
