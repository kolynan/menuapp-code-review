# Comparison Report — PublicMenu
Chain: publicmenu-260329-121355-a291

## Agreed (both found)

### 1. Fix 1 — PM-157 (P1): Floating point in StickyCartBar
**CC:** Confirmed. Wrap `myBill.total` and `tableTotal` with `parseFloat((value || 0).toFixed(2))` before `formatPrice()` at x.jsx lines 2283-2288.
**Codex:** Same finding, same fix, same lines.
**Verdict:** ✅ APPLY. Both agree on exact same code change. High confidence.

### 2. Fix 2 — #197 (P2): Remove "Ваш заказ" header and guest label
**CC:** Confirmed. Remove `<p>` at lines 702-704 and `{guestLabel && (...)}` at lines 737-741. Keep `clientName` for pickup/delivery.
**Codex:** Same finding, same two blocks to remove, same preservation of clientName.
**Verdict:** ✅ APPLY. Both agree on exact same deletions. High confidence.

### 3. Fix 4 — #193 (P2): MenuView list-mode line-clamp-1
**CC:** Confirmed. Change `line-clamp-2` → `line-clamp-1` at MenuView.jsx lines 94 and 96. Leave tile-mode unchanged.
**Codex:** Same finding, same lines, same change. Explicitly notes tile-mode and detail drawer unchanged.
**Verdict:** ✅ APPLY. Both agree on exact same change. High confidence.

### 4. Fix 5 — #144 (P3): StickyCartBar visual redesign
**CC:** Confirmed. Redesign StickyCartBar.jsx: entire bar = single tappable button, badge left, label center, price+chevron right. No x.jsx changes needed (onButtonClick already passed).
**Codex:** Same finding. Notes that props like `cartTotalItems`, `formattedCartTotal`, etc. are accepted but not rendered in current code. Same layout recommendation.
**Verdict:** ✅ APPLY. Both agree the redesign is needed and feasible within StickyCartBar.jsx alone. [NICE-TO-HAVE] but both recommend implementing.

## CC Only (Codex missed)
None. CC and Codex covered all 5 fixes.

## Codex Only (CC missed)
None. Both reviewers analyzed the same 5 fixes.

## Disputes (disagree)

### Fix 3 — PM-159 (P3): Extra whitespace below "Новый заказ"
**CC:** SKIP. The `h-20` spacer is functional (prevents sticky footer overlap). Removing it risks content being hidden behind the footer. A clean fix requires conditional height logic, and the task says to skip if no clean fix is obvious.
**Codex:** Suggests applying a fix — remove or reduce the `h-20` spacer, or replace with footer-safe padding.

**Analysis:** CC's reasoning is stronger here. The `h-20` spacer exists for a functional reason (preventing content overlap with sticky footer). Codex suggests removing/reducing it but doesn't provide a specific safe alternative. The task explicitly says: "If a clean fix is not obvious without introducing conditional layout logic, SKIP this fix." Both agree it's P3 [NICE-TO-HAVE].

**Verdict:** ⏭️ SKIP. Follow the task's own guidance. Risk of regression (content hidden behind sticky footer) outweighs cosmetic benefit.

## Final Fix Plan
Ordered list of all fixes to apply:

1. **[P1] Fix 1 — PM-157: Floating point in StickyCartBar** — Source: AGREED — Wrap `myBill.total` and `tableTotal` with `parseFloat((value || 0).toFixed(2))` before `formatPrice()` in x.jsx lines 2283-2288.

2. **[P2] Fix 2 — #197: Remove confirmation screen clutter** — Source: AGREED — Delete `<p>` with "Ваш заказ" (x.jsx lines 702-704) and `{guestLabel && (...)}` block (x.jsx lines 737-741).

3. **[P2] Fix 4 — #193: MenuView list-mode line-clamp** — Source: AGREED — Change both `line-clamp-2` → `line-clamp-1` in MenuView.jsx renderListCard (lines 94, 96).

4. **[P3] Fix 5 — #144: StickyCartBar Uber Eats redesign** — Source: AGREED — Rewrite StickyCartBar.jsx render: entire bar = single `<button>`, layout: badge | centered label | price+chevron. Keep all existing props and logic. No x.jsx changes needed.

5. **[P3] Fix 3 — PM-159: Whitespace gap** — Source: DISPUTED → **SKIP**. No clean fix without conditional layout; risk of footer overlap regression.

## Summary
- Agreed: 4 items (Fix 1, Fix 2, Fix 4, Fix 5)
- CC only: 0 items
- Codex only: 0 items
- Disputes: 1 item (Fix 3 — CC says SKIP, Codex says fix → resolved: SKIP per task guidance)
- Total fixes to apply: 4
- Total fixes to skip: 1 (Fix 3)
