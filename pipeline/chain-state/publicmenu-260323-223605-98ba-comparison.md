# Comparison Report — PublicMenu
Chain: publicmenu-260323-223605-98ba

## Agreed (both found)

### 1. [P2] Math.round on discounted prices destroys decimal precision (MenuView.jsx lines 103, 283)
- **CC (#2):** Replace `Math.round(...)` with `parseFloat((dish.price * (1 - partner.discount_percent / 100)).toFixed(2))` in both renderListCard and renderTileCard.
- **Codex (#1):** Remove `Math.round` and pass computed decimal directly into formatter, stripping only insignificant trailing zeros.
- **Consensus:** Both agree Math.round must go. CC's fix (`parseFloat((...).toFixed(2))`) is more explicit and handles floating-point noise. Use CC's approach.

### 2. [P3] List-mode stepper renders in text column, not overlaid on image (MenuView.jsx lines 124-145)
- **CC (#4):** Move stepper from text column to image container div as absolute overlay (bottom-1 right-1), matching tile-mode pattern.
- **Codex (#2):** Same diagnosis — move in-cart stepper into image container as absolute bottom-right overlay matching tile-card pattern.
- **Consensus:** Identical diagnosis and fix direction. Apply as described — move stepper to image container with absolute positioning.

### 3. [P3] ChevronDown too small (28px) and needs 44×44 tap target (CartView.jsx line 427-428)
- **CC (#5):** Change `w-7 h-7` to `w-9 h-9`, wrap in button with `min-w-[44px] min-h-[44px]`.
- **Codex (#3):** Same — increase icon to `w-9 h-9` or `size={36}`, wrap in button with min 44×44 touch area.
- **Consensus:** Identical fix. Apply `w-9 h-9` + 44×44 button wrapper.

## CC Only (Codex missed)

### 4. [P2] formatPrice from useCurrency is external — may need B44 prompt (x.jsx)
- **CC (#1):** The `formatPrice` function comes from `useCurrency` hook (B44 internal). Suggested wrapping it in x.jsx with `safeFormatPrice`. Notes it may need a B44 prompt if the hook does rounding internally.
- **Evaluation:** VALID observation but OUT OF SCOPE for this chain. The task says "Find formatPrice in MenuView.jsx" — the actual non-discount price formatting depends on the external hook. The Math.round issue (Agreed #1) covers the in-scope part of PM-101. The useCurrency hook itself needs a B44 prompt — flag as SKIPPED with reason.
- **Decision:** SKIP — needs B44 prompt, not a page-level fix. Record in SKIPPED section for BUGS_MASTER.

### 5. [P2] Local formatPrice in OrderStatusScreen (x.jsx lines 986-994) uses toFixed(1)
- **CC (#3):** The local `formatPrice` in `OrderStatusScreen` uses `num.toFixed(1)` — truncates to 1 decimal. Fix: change to `parseFloat(num.toFixed(2)).toString()`.
- **Evaluation:** VALID bug related to PM-101. This is a local function in x.jsx that can be fixed without B44 prompt. Directly in scope since x.jsx is a TARGET file.
- **Decision:** ACCEPT — include in fix plan. Low risk, clear fix.

### 6. [INFO] No ChevronDown or drag handle in x.jsx
- **CC (#6):** Searched x.jsx — no ChevronDown element found. No changes needed in x.jsx for Fix 3.
- **Evaluation:** Informational. Codex (#4) partially contradicts this — see Disputes below.
- **Decision:** Noted. See Dispute #1 for the x.jsx drag handle question.

## Codex Only (CC missed)

### 7. [P3] Drag handle and chevron split across x.jsx and CartView.jsx — alignment issue
- **Codex (#4):** The drawer's default handle is in x.jsx (DrawerContent, line ~3419-3423), while chevron is in CartView.jsx (line 426-430). They're in different layers so can't be vertically aligned. Suggests rendering both in one shared wrapper.
- **Evaluation:** VALID concern about cross-file alignment. However, modifying the DrawerContent default handle in x.jsx means touching drawer infrastructure which risks regressions (PM-105 back button, PM-S81-15 history API are SCOPE LOCKED). The simpler approach: add a visual drag handle bar INSIDE CartView.jsx's sticky header alongside the chevron — this keeps changes localized to CartView.jsx without touching x.jsx drawer structure.
- **Decision:** PARTIALLY ACCEPT — add drag handle bar inside CartView.jsx alongside chevron (as CC #5 already suggested). Do NOT modify x.jsx drawer handle to avoid scope violations. If the default Vaul handle in x.jsx is still visible, it may need to be hidden — but only if it causes visual duplication. Flag for manual testing.

## Disputes (disagree)

### Dispute 1: Should x.jsx drawer handle be modified for Fix 3?
- **CC says:** No ChevronDown in x.jsx, no changes needed there for Fix 3.
- **Codex says:** The drawer default handle in x.jsx (line ~3419) and chevron in CartView.jsx are on different layers — need to share one wrapper or hide default handle.
- **Resolution:** CC is closer to correct for SCOPE safety. The task says Fix 3 should check x.jsx for ChevronDown — and there is none. Modifying the Vaul drawer handle in x.jsx risks PM-105/PM-S81-15 regressions. The pragmatic fix is to handle everything inside CartView.jsx. If the default Vaul handle creates visual duplication, that's a separate minor issue to flag. **Decision: Do NOT modify x.jsx for Fix 3. Apply all Fix 3 changes in CartView.jsx only.**

## Final Fix Plan

Ordered list of all fixes to apply:

1. **[P2] Remove Math.round from discounted prices** — Source: AGREED (CC+Codex) — In MenuView.jsx lines 103 and 283, replace `Math.round(dish.price * (1 - partner.discount_percent / 100))` with `parseFloat((dish.price * (1 - partner.discount_percent / 100)).toFixed(2))`. Covers PM-101 for discounted prices.

2. **[P2] Fix local formatPrice in OrderStatusScreen** — Source: CC only (accepted) — In x.jsx line ~992, change `num.toFixed(1)` to `parseFloat(num.toFixed(2)).toString()`. Covers PM-101 for order status display.

3. **[P3] Move list-mode stepper to image overlay** — Source: AGREED (CC+Codex) — In MenuView.jsx renderListCard function, move the in-cart stepper block (lines 125-144) from the text column into the image container as an absolute overlay (bottom-right), matching tile-mode pattern. Card height stays constant.

4. **[P3] Enlarge ChevronDown + add tap target + add drag handle bar** — Source: AGREED (CC+Codex) + Codex enhancement — In CartView.jsx: (a) change ChevronDown from `w-7 h-7` to `w-9 h-9`, (b) wrap in button with min 44×44 touch target, (c) add a centered drag handle bar (`w-10 h-1 rounded-full bg-gray-300`) in the same flex row for visual alignment.

## SKIPPED (not fixable at page level)

1. **[P2] useCurrency formatPrice may truncate decimals internally** — Source: CC — The shared `formatPrice` from `useCurrency` hook is a B44 internal module. If it does rounding internally, page-level fixes won't help for non-discounted prices. Needs B44 prompt to inspect/fix the hook. Record in BUGS_MASTER as requiring B44 intervention.

## Summary
- Agreed: 3 items
- CC only: 3 items (2 accepted, 1 informational)
- Codex only: 1 item (1 partially accepted — apply in CartView.jsx only)
- Disputes: 1 item (resolved: don't modify x.jsx for Fix 3)
- Total fixes to apply: 4
- Skipped (needs B44 prompt): 1
