# Comparison Report — PublicMenu
Chain: publicmenu-260324-130431-1152

## Agreed (both found)

### 1. [P3] PM-121 — Custom drag handle div duplicates native B44 handle
- **CC:** Remove custom `<div className="w-12 h-1.5 bg-gray-300 rounded-full" />` at CartView.jsx line ~428, plus the spacer div. Change header to `flex justify-end` with only chevron.
- **Codex:** Remove the custom handle div, keep native B44 handle.
- **Consensus:** Both agree on removing the custom drag handle. CC provides more detailed replacement JSX (flex justify-end, single chevron button). **Use CC's detailed patch.**

### 2. [P2] PM-120 — Floating point in cart line item subtotal (CartView.jsx line ~800)
- **CC:** `formatPrice(Math.round(item.price * item.quantity * 100) / 100)`
- **Codex:** Same rounding approach, suggests shared helper `Math.round(Number(price) * Number(quantity) * 100) / 100`
- **Consensus:** Both agree on `Math.round(... * 100) / 100` pattern. Inline is simpler and avoids scope creep (Rule F4). **Use CC's inline approach.**

### 3. [P2] PM-120 — Floating point in cart total reduce (x.jsx line ~2001)
- **CC:** Round each item in reduce: `acc + Math.round(item.price * item.quantity * 100) / 100`
- **Codex:** Same — unrounded `item.price * item.quantity` in reduce accumulates FP errors.
- **Consensus:** Both agree. **Use CC's inline Math.round in reduce.**

### 4. [P2] PM-120 — Floating point in `line_total` DB writes (x.jsx lines ~2588, ~2967)
- **CC:** `line_total: Math.round(item.price * item.quantity * 100) / 100`
- **Codex:** Same — raw `line_total` persists FP noise to DB.
- **Consensus:** Both agree this is in scope (task says fix the underlying number). **Apply Math.round to both line_total locations.**

## CC Only (Codex missed)

### 5. [P3] PM-104 — Chevron alignment resolved by Fix 1
- **CC found:** Fix 2 (PM-104) is effectively resolved once Fix 1 removes the custom handle + spacer. Chevron becomes the only element, right-aligned via `justify-end`. No additional code change needed.
- **Codex missed:** Did not address PM-104 as a separate item.
- **Evaluation:** Valid observation. No extra code change — just verification that after Fix 1, chevron is correctly positioned. **Accept — no code change, just verification step.**

### 6. [P2] Floating point in confirmation screen (x.jsx line ~716)
- **CC found:** `formatPrice(item.price * item.quantity)` in order confirmation has same FP issue.
- **Codex missed:** Did not mention confirmation screen display.
- **Evaluation:** Valid — same pattern, same fix. Defensive rounding before display. **Accept — apply Math.round at line ~716.**

## Codex Only (CC missed)

### 7. Prompt clarity: FROZEN UX says `w-7 h-7`, Fix 2 says `w-9 h-9`
- **Codex flagged:** Conflict between FROZEN UX section ("Chevron size w-7 h-7 (PM-100)") and Fix 2 instruction ("Do NOT change chevron size from w-9 h-9 (36px)").
- **Evaluation:** This is a prompt inconsistency, not a code bug. Fix 2's explicit instruction (`w-9 h-9`) is the more recent decision (chain 505b S171 applied this size). The FROZEN UX entry for PM-100 appears outdated. **Resolution: follow Fix 2's explicit `w-9 h-9` instruction. No code change needed — just use current size.**

### 8. Codex suggested shared helper function
- **Codex:** Proposed a shared rounded line-total helper.
- **Evaluation:** Creating a helper function violates Rule F4 (fix ONLY what is asked) and Rule F7 (no unsolicited changes). Inline `Math.round(... * 100) / 100` at each location is simpler and sufficient. **Reject — use inline rounding.**

## Disputes (disagree)

No real disputes. Both reviewers agree on all fixes. Minor differences in implementation approach (helper vs inline) resolved in favor of inline per project rules.

## Final Fix Plan

Ordered list of all fixes to apply:

1. **[P3] Remove custom drag handle div — CartView.jsx line ~427-428** — Source: agreed — Remove custom `<div className="w-12 h-1.5 bg-gray-300 rounded-full" />` and spacer `<div className="w-9" />`. Change header container to `flex justify-end`. Keep only chevron button (w-9 h-9, right-aligned).

2. **[P3] Verify chevron alignment after Fix 1 — CartView.jsx** — Source: CC only — After removing custom handle, confirm chevron is right-aligned and properly styled. No additional code change expected.

3. **[P2] Round cart line item subtotal — CartView.jsx line ~800** — Source: agreed — Change `formatPrice(item.price * item.quantity)` to `formatPrice(Math.round(item.price * item.quantity * 100) / 100)`.

4. **[P2] Round cart total reduce — x.jsx line ~2001** — Source: agreed — Change reduce callback to `acc + Math.round(item.price * item.quantity * 100) / 100`.

5. **[P2] Round line_total in order items — x.jsx line ~2588** — Source: agreed — Change `line_total: item.price * item.quantity` to `line_total: Math.round(item.price * item.quantity * 100) / 100`.

6. **[P2] Round line_total in order items (2nd location) — x.jsx line ~2967** — Source: agreed — Same Math.round fix as #5.

7. **[P2] Round confirmation screen line item — x.jsx line ~716** — Source: CC only — Change `formatPrice(item.price * item.quantity)` to `formatPrice(Math.round(item.price * item.quantity * 100) / 100)`.

## Summary
- Agreed: 4 items (PM-121 handle removal, PM-120 in 3 locations)
- CC only: 2 items (PM-104 verification, confirmation screen FP) — both accepted
- Codex only: 2 items (prompt clarity note, helper function suggestion) — 0 accepted as code changes
- Disputes: 0
- **Total fixes to apply: 6 code changes + 1 verification step**
