# Comparison Report — PublicMenu
Chain: publicmenu-260321-093745

## Agreed (both found)

### 1. [P0] Loyalty side effects run before order items exist
- **CC #19** / **Codex #1** — Both identified that `OrderItem.bulkCreate` happens after loyalty redeem in x.jsx (~lines 2436-2470, 2812-2843). If item creation fails, points are already spent.
- **Fix consensus:** Move `OrderItem.bulkCreate` before loyalty side effects. Codex additionally suggests treating item creation as the commit point. Both approaches align — create items first, then loyalty.

### 2. [P1] Hall confirmation shows wrong total (pre-discount vs post-discount)
- **CC #21** / **Codex #2** — Both found that confirmation screen uses `cart.reduce(sum)` (raw total) instead of `finalTotal` (post-discount). x.jsx:2540-2559.
- **Fix consensus:** Use `finalTotal` or stored `total_amount` for the confirmation display.

### 3. [P1] Cart survives mode switches with invalid items
- **CC #20** / **Codex #3** — Both found `handleModeChange()` (x.jsx:2205-2225) doesn't revalidate cart. Hall-only dishes can stay in cart after switching to pickup.
- **Fix consensus:** Revalidate cart on mode change, drop invalid items with toast or block checkout.

### 4. [P1] Drawer layout is count-driven, not visit-state-driven
- **CC #10-14** (5 separate findings) / **Codex #5** (1 combined finding) — Both agree CartView renders the same layout regardless of visit state. Missing: 3 distinct drawer layouts, CTA matrix, visual separation sent/draft, collapsible bill, "Заказать ещё" for no-draft state.
- CC was more granular (5 sub-items), Codex consolidated into one architectural finding. Both reach the same conclusion.
- **Fix consensus:** Derive explicit visit state from session/order/payment status, render conditionally. CC's breakdown is more actionable for implementation.

### 5. [P1] StickyCartBar missing 7-state visibility matrix + text modes
- **CC #15-16** / **Codex #5** (partial) — Both found `hallStickyMode` only has 4 states (cart/myBill/tableOrders/cartEmpty) instead of the required 7-state matrix. Missing: paid fade-out, closed hidden, closed+items confirm reset, two text modes (draft/visit).
- **Fix consensus:** Implement full 7-state matrix with visit status detection from tableSession.

### 6. [P2] Terracotta palette still incomplete — indigo/green remaining
- **CC #1-9, #26** (10 findings) / **Codex #6** (1 combined) — Both found indigo/green remnants across ModeTabs.jsx, MenuView.jsx, CheckoutView.jsx.
- CC enumerated every specific line; Codex listed the same files/lines in one finding.
- **Fix consensus:** Replace all `bg-indigo-*`, `text-indigo-*`, `bg-green-*` with terracotta `#B5543A` inline styles or CSS variable.
- **Specific locations (from CC's detailed enumeration):**
  - ModeTabs.jsx:33 — active tab `bg-indigo-600`
  - MenuView.jsx:85,203 — price `text-indigo-600`
  - MenuView.jsx:104,162 — "+" buttons `bg-indigo-600`
  - MenuView.jsx:229,239 — layout toggle `bg-indigo-600`
  - MenuView.jsx:252 — loader `text-indigo-600`
  - CheckoutView.jsx:37 — back link `text-indigo-600`
  - CheckoutView.jsx:76 — total `text-indigo-600`
  - CheckoutView.jsx:173 — submit button `bg-green-600`
  - CategoryChips (imported, unchecked) — likely indigo

### 7. [P2-P3] Touch targets below 44px minimum
- **CC #25** (P3, CheckoutView steppers only) / **Codex #7** (P2, broader scope: list add 40x40, tile steppers 32x32, checkout steppers, mode tabs).
- Codex identified more locations and rated higher (P2). Codex also suggests aria-labels.
- **Fix consensus:** Raise all primary tap targets to 44x44px. Use Codex's broader scope. Accept P2 priority (mobile-first is important for a QR-menu app).

## CC Only (Codex missed)

### 8. [P2] CartView section rendering order doesn't match spec — CC #22
- Sections render out of spec order: table orders before my orders, draft not on top.
- **Valid:** Yes — this is a real gap, though partially subsumed by the drawer restructure (Agreed #4). Including as part of Layout 2 reorder.
- **Decision:** ACCEPTED — include in drawer restructure fix.

### 9. [P2] CartView draft items only have "remove all" — no stepper — CC #23
- Draft items show only X button, spec requires -/count/+ steppers for quantity adjustment.
- **Valid:** Yes — spec explicitly says "steppers visible" for draft items.
- **Decision:** ACCEPTED.

### 10. [P2] console.warn statements left in production — CC #24
- x.jsx lines 1323, 1330, 1371, 1599, 1602 have `console.warn`.
- **Valid:** Yes — violates "No Debug Logs" rule. Lower priority since warns are less noisy than logs.
- **Decision:** ACCEPTED as P2.

### 11. [P2] StickyCartBar missing count bump animation on "+" — CC #17
- Spec requires subtle count bump animation when item added.
- **Valid:** Yes — spec is explicit. Lower priority (P2 animation).
- **Decision:** ACCEPTED as P2.

### 12. [P2] StickyCartBar missing "bar rises" animation on first item — CC #18
- Spec requires soft enter/exit animation.
- **Valid:** Yes — spec is explicit. Lower priority (P2 animation).
- **Decision:** ACCEPTED as P2.

### 13. [P3] CategoryChips component unchecked for indigo — CC #26
- CategoryChips imported from `refactor/CategoryChips`, likely has indigo.
- **Valid:** Likely true but not verified. Should be checked during implementation.
- **Decision:** ACCEPTED as P3 — verify during terracotta fix pass.

## Codex Only (CC missed)

### 14. [P1] Pickup/delivery checkout drops loyalty and discount controls — Codex #4
- x.jsx passes loyalty props into CheckoutView (lines 3174-3197), but CheckoutView doesn't accept or render them (CheckoutView.jsx:7-31, 88-150). Non-hall guests can't see balance, redeem points, or understand discounts.
- **Valid:** Yes — this is a genuine functional gap. CC analyzed CheckoutView but focused on terracotta/styling, missing this logic gap.
- **Decision:** ACCEPTED as P1. Important feature gap for non-hall flows.

### 15. [P2] Localization fallback hardcoded in Russian — Codex #8
- x.jsx:325-506 has a hardcoded Russian fallback map. CartView repeats `tr('key', 'Русский текст')`. If EN/KZ key is missing, UI silently shows Russian.
- **Valid:** Partially. The `tr()` pattern with Russian fallbacks is the established Base44 convention — it's how the platform works. However, Codex's point about mixed-locale UI is valid for multi-language scenarios.
- **Decision:** ACCEPTED as P3 (downgraded from P2). This is a known platform pattern, not a bug per se, but worth noting. Moving fallbacks to translation catalogs would be an improvement but is lower priority than functional fixes.

## Disputes (disagree)

No direct disputes — CC and Codex agree on all overlapping findings. Minor priority differences resolved above:
- Touch targets: CC said P3, Codex said P2 → **resolved as P2** (mobile-first app)
- Localization fallback: Codex said P2 → **downgraded to P3** (platform convention)

## Final Fix Plan

Ordered list of all fixes to apply, with priority and source:

1. **[P0] Loyalty side effects before order items** — Source: agreed — Move `OrderItem.bulkCreate` before loyalty redeem in both hall and pickup/delivery submit paths (x.jsx ~2436-2470, ~2812-2843)
2. **[P1] Hall confirmation shows wrong total** — Source: agreed — Use `finalTotal` in confirmation display (x.jsx ~2541)
3. **[P1] Cart survives mode switches** — Source: agreed — Revalidate cart on mode change, drop invalid items with toast (x.jsx ~2205-2225)
4. **[P1] Pickup/delivery checkout drops loyalty** — Source: Codex — Plumb loyalty props through CheckoutView, render loyalty/discount block (CheckoutView.jsx:7-31, x.jsx:3174-3197)
5. **[P1] Drawer layout: 3 visit-state layouts** — Source: agreed — Introduce `drawerLayout` variable, reorder sections conditionally, add collapsible СЧЁТ section (CartView.jsx)
6. **[P1] CTA text: 7-state matrix** — Source: agreed — Compute CTA text from visit+draft state, add secondary CTA buttons (CartView.jsx ~1245-1277)
7. **[P1] Visual separation sent vs draft** — Source: agreed — Calm background for sent, brighter for draft, status chips on sent items (CartView.jsx)
8. **[P1] "Заказать ещё" CTA for no-draft state** — Source: agreed — Show "Заказать ещё" when sent orders exist but cart empty (CartView.jsx)
9. **[P1] StickyCartBar 7-state visibility matrix** — Source: agreed — Full state detection from tableSession, fade-out for paid, hidden+confirm for closed (x.jsx ~2056-2115)
10. **[P1] StickyCartBar text modes** — Source: agreed — Two text formats: draft mode and visit mode (x.jsx ~2082-2091)
11. **[P2] Terracotta palette completion** — Source: agreed — Replace all indigo/green across ModeTabs, MenuView, CheckoutView, check CategoryChips (9+ locations)
12. **[P2] Draft items need steppers** — Source: CC — Add -/count/+ stepper to draft items in CartView (CartView.jsx ~799)
13. **[P2] Section rendering order** — Source: CC — Reorder CartView sections: draft top → sent middle → bill → submit (included in #5)
14. **[P2] Touch targets below 44px** — Source: agreed (Codex scope) — Raise all primary tap targets to 44x44 across MenuView, CheckoutView, ModeTabs + add aria-labels
15. **[P2] StickyCartBar count bump animation** — Source: CC — Subtle animation on count change
16. **[P2] StickyCartBar enter animation** — Source: CC — Soft rise animation on first item added
17. **[P2] Remove console.warn from production** — Source: CC — Remove/gate 5 console.warn calls in x.jsx
18. **[P3] Localization fallback improvement** — Source: Codex (downgraded) — Note for future: move Russian fallbacks to translation catalogs
19. **[P3] Verify CategoryChips for indigo** — Source: CC — Check imported component during terracotta pass

## Summary
- Agreed: 7 items (mapped from 19 CC + 5 Codex findings that overlapped)
- CC only: 6 items (6 accepted, 0 rejected)
- Codex only: 2 items (2 accepted, 0 rejected — 1 downgraded P2→P3)
- Disputes: 0 (minor priority differences resolved inline)
- **Total fixes to apply: 19** (1 P0, 9 P1, 7 P2, 2 P3)
