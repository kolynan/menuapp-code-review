# Comparison Report — PublicMenu
Chain: publicmenu-260321-195108
Task: PM-071 — Bottom Sheet trigger для Table Confirmation

## Agreed (both found)

### 1. [P1] Root cause: Table Confirmation Sheet is invisible when Cart Drawer is open
- **CC angle:** Two sibling `<Drawer>` components from vaul conflict — the confirmation Drawer renders behind the cart Drawer's overlay/focus-trap. The trigger (`setShowTableConfirmSheet(true)`) fires correctly but the UI is invisible.
- **Codex angle:** `handleSubmitOrder()` calls `validate()` before the `!isTableVerified` interception. `validate()` rejects hall submits when `!currentTableId`, storing an error in `errors.tableSelection` that is never rendered — causing a silent no-op before the BS trigger even runs.
- **Assessment:** These are **complementary root causes**, not contradictions. Both likely contribute:
  1. `validate()` may short-circuit before the BS trigger (Codex finding) — needs code verification
  2. Even if trigger fires, the Drawer stacking issue hides the BS (CC finding)
  **Both fixes are needed.** Order: fix validate() gate first (Codex), then fix Drawer visibility (CC).

### 2. [P2] Verification state split between CartView and Bottom Sheet
- **CC finding #2/#5:** CartView.jsx owns auto-verify effect and cooldown state (`isCodeLocked`), but the visible input is in the BS in x.jsx. CTA button doesn't check cooldown.
- **Codex finding #3:** Same issue — `codeAttempts`, `codeLockedUntil`, `codeSecondsLeft`, and auto-verify effect live in hidden CartView while the visible BS is in x.jsx. Sheet shows no attempt/cooldown feedback.
- **Assessment:** Both agree the state split is a problem. CC notes it's functional but has UX gaps; Codex says it can cause off-screen verification triggers. **Accept as P2 — fix by moving verification ownership to x.jsx or passing state up.**

## CC Only (Codex missed)

### 3. [P2] `t()` without fallback for 3 BS keys — ACCEPTED
- **File:** x.jsx, lines 3399-3407
- **Details:** `t('cart.confirm_table.title')`, `t('cart.confirm_table.subtitle')`, and benefit keys have no fallback. If keys aren't in the translation file, user sees raw key strings.
- **Validity:** Solid finding, directly in PM-071 scope (BS UI). **Accept.**

### 4. [P2] `console.error` left in production — ACCEPTED (minor)
- **File:** x.jsx, line 1530
- **Details:** `console.error("Failed to save table", e);` in `saveTableSelection`.
- **Validity:** Valid per code rules (no debug logs in production). Borderline scope — in `saveTableSelection` which is part of table verification flow. **Accept as low-priority P2.**

### 5. [P3] Duplicate `tableCodeLength` computation — REJECTED (out of scope)
- **Details:** Same computation in CartView.jsx and x.jsx.
- **Validity:** Real but not related to PM-071 bug. Refactoring prop passing is explicitly out of scope per SCOPE LOCK. **Reject — note in BUGS.md for future.**

## Codex Only (CC missed)

### 6. [P1→SKIP] Pickup/delivery checkout drops loyalty/discount UI — OUT OF SCOPE
- **Details:** `CheckoutView.jsx` doesn't accept loyalty/discount props from x.jsx.
- **Validity:** Likely real bug, but **completely outside PM-071 scope** (different flow, different view). **Skip — record in BUGS.md.**

### 7. [P2→SKIP] Mobile grid partner setting ignored — OUT OF SCOPE
- **Details:** `MenuView.jsx` hardcodes `grid-cols-2` on mobile despite `partner.menu_grid_mobile`.
- **Validity:** Likely real but **not PM-071**. **Skip — record in BUGS.md.**

### 8. [P2→SKIP] `useTableSession` loses restored guests with only `_id` — OUT OF SCOPE
- **Details:** `currentGuestIdRef.current` uses `.id` instead of `normalizeGuestId()`.
- **Validity:** Plausible, but **not PM-071**. **Skip — record in BUGS.md.**

### 9. [P3→PARTIAL] i18n/accessibility label regressions — PARTIAL SCOPE
- **Details:** Hardcoded `aria-label="Decrease"/"Increase"` in CheckoutView, missing labels on icon-only buttons.
- **Validity:** Real i18n issues but mostly outside PM-071 scope. Only BS-related labels are in scope. **Accept only BS-related labels if any; skip the rest — record in BUGS.md.**

## Disputes (disagree)

### None.
CC and Codex findings are complementary, not contradictory. The two P1 root causes (validate gate + Drawer stacking) address different layers of the same bug.

## Final Fix Plan

Ordered by priority and dependency:

| # | Priority | Title | Source | Description |
|---|----------|-------|--------|-------------|
| 1 | **P1** | Move `!isTableVerified` check before `validate()` | Codex | In `handleSubmitOrder`, intercept `orderMode === "hall" && !isTableVerified` BEFORE calling `validate()`, so `validate()` doesn't silently block the BS trigger |
| 2 | **P1** | Fix Drawer stacking — BS visible over Cart Drawer | CC | Move confirmation Drawer inside Cart `<DrawerContent>`, OR convert BS to fixed-position overlay with `z-[60]`, ensuring it renders above cart overlay |
| 3 | **P2** | Move verification state to x.jsx with the BS | Agreed | Move `codeAttempts`, `codeLockedUntil`, cooldown timer, and auto-verify from CartView.jsx to x.jsx so the BS has full UX feedback |
| 4 | **P2** | Add `tr()` fallbacks for BS i18n keys | CC | Replace `t('cart.confirm_table.*')` with `tr('cart.confirm_table.*', 'Russian fallback')` |
| 5 | **P2** | Remove `console.error` in `saveTableSelection` | CC | Remove or silence `console.error("Failed to save table", e)` at x.jsx:1530 |

### Out-of-scope items to record in BUGS.md:
- Codex #2: Pickup/delivery checkout missing loyalty UI (new bug)
- Codex #4: Mobile grid setting ignored in MenuView (new bug)
- Codex #5: useTableSession guest _id normalization (new bug)
- Codex #6: i18n/accessibility labels in CheckoutView/CartView/MenuView (new bug)
- CC #6: Duplicate tableCodeLength computation (tech debt)

## Summary
- **Agreed:** 2 items (root cause + state split)
- **CC only:** 3 items (2 accepted, 1 rejected as out-of-scope)
- **Codex only:** 4 items (0 accepted in-scope, 4 out-of-scope → BUGS.md)
- **Disputes:** 0
- **Total fixes to apply:** 5 (2 P1, 3 P2)
- **Items for BUGS.md:** 5 (out-of-scope findings)
