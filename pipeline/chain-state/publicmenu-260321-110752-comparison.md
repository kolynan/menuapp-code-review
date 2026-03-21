# Comparison Report — PublicMenu
Chain: publicmenu-260321-110752

## Agreed (both found)

### 1. [P1] Just-in-time table confirmation flow missing
- **CC finding #4** ↔ **Codex finding #1**
- Both identify that `handleSubmitOrder()` hard-blocks when table is unknown (disabled button + early return with `error.table_required`) instead of showing a just-in-time Bottom Sheet.
- CC provides detailed implementation plan (state, intercept logic, Bottom Sheet specs, enable button, i18n keys).
- Codex describes the same gap more concisely: replace early return with intercept, continue after `verifyTableCode`.
- **Verdict:** HIGH confidence. Apply CC's detailed plan as the implementation guide.

## CC Only (Codex missed)

### 2. [P3] Active category chip still indigo (PM-062) — ACCEPTED
- CC finding #1. The `CategoryChips` component is external (Base44), active chip uses indigo instead of terracotta `#B5543A`.
- Fix requires either passing `activeColor` prop or B44 prompt update.
- Codex missed this entirely — likely because it's a component-level styling issue in an imported module.
- **Verdict:** Valid. Accept — this is explicitly requested in the task (Fix 1).

### 3. [P2] CartView drawer stepper shows XIcon instead of Minus (PM-063) — ACCEPTED
- CC findings #2, #3, #10. Three related sub-findings:
  - (a) Line 806: `XIcon` renders when qty=1 instead of `Minus` icon
  - (b) `Minus` icon not imported in CartView.jsx
  - (c) Text `+`/`−` chars used instead of `Plus`/`Minus` icon components for consistency
- Codex missed all three — the drawer stepper issue was explicitly requested (Fix 2).
- **Verdict:** Valid. Accept all three as one logical fix group.

### 4. [P1] Table code input buried in drawer — ACCEPTED
- CC finding #5. The table code input is hidden inside a collapsible subtotal section. For just-in-time flow, it should be extracted into a reusable component for the new Bottom Sheet.
- This is a sub-task of the agreed Fix 3. Codex mentioned the overall flow but didn't call out the extraction specifically.
- **Verdict:** Valid. Accept as part of the table confirmation implementation.

### 5. [P2] Submit button text doesn't match spec — ACCEPTED
- CC finding #6. New i18n keys needed for the Bottom Sheet (`cart.confirm_table.title`, `.subtitle`, `.benefit_loyalty`, `.benefit_default`, `.submit`, `.change`).
- Codex didn't detail i18n requirements for the new Bottom Sheet.
- **Verdict:** Valid. Accept — necessary for proper i18n in the new component.

### 6. [P2] Console.error left in production code — ACCEPTED (minor)
- CC finding #7. `console.error(err)` at x.jsx:2582. Should be removed per code rules.
- **Verdict:** Valid but minor. Accept — quick cleanup.

### 7. [P3] Informational notes (no fix needed) — SKIPPED
- CC findings #8, #9. The `×` in submitted orders is correct (multiplication sign), and `tr()` fallbacks are the established pattern.
- **Verdict:** Informational only. No action needed.

## Codex Only (CC missed)

### 8. [P1] Partner lookup hides real backend failures — REJECTED (out of scope)
- Codex finding #2. Partner query catches all errors and shows "restaurant not found" even for network failures.
- **Verdict:** Valid observation, BUT out of scope for Batch A+5 (which covers chip color, drawer stepper, table confirmation). This is a separate bug — record in BUGS_MASTER.md but do NOT fix in this batch. Per rule F4: fix ONLY what is asked.

### 9. [P1] Hall StickyCartBar ignores visit lifecycle state — REJECTED (out of scope)
- Codex finding #3. StickyCartBar doesn't inspect visit/session/bill/closed/paid state.
- **Verdict:** Valid observation, BUT this is a state machine enhancement beyond Batch A+5 scope. The task doesn't mention StickyCartBar lifecycle changes. Record in BUGS_MASTER.md for future batch.

### 10. [P2] Hall StickyCartBar copy is 4-state shortcut — REJECTED (out of scope)
- Codex finding #4. Label resolver only produces a few generic labels instead of the full hall sticky state matrix.
- **Verdict:** Same as above — StickyCartBar copy improvements are outside Batch A+5. Record for future.

### 11. [P2] StickyCartBar animations cannot fire — REJECTED (out of scope)
- Codex finding #5. Parent doesn't track previous cart count for animation triggers.
- **Verdict:** Outside Batch A+5 scope. Animations are a separate UX enhancement.

### 12. [P2] Mode-switch removal toast missing i18n fallback — ACCEPTED
- Codex finding #6. `t('cart.items_removed_mode_switch', { count })` has no entry in `I18N_FALLBACKS`, so `makeSafeT()` returns empty string → blank toast.
- CC missed this. It's a real bug — a blank toast is visible to users.
- **Verdict:** Valid. Accept — quick fix, add to `I18N_FALLBACKS` or switch to `tr()`.

## Disputes (disagree)

No direct disputes — the AIs agree on the core fixes. The only divergence is scope: Codex found 4 items (findings #2-5) outside Batch A+5 scope that CC correctly ignored. These are valid bugs but should be tracked separately, not fixed in this batch.

## Final Fix Plan

Ordered list of all fixes to apply:

1. **[P1] Just-in-time table confirmation Bottom Sheet** — Source: AGREED (CC #4 + Codex #1) — Implement intercept in `handleSubmitOrder()`, create Bottom Sheet component with table code input, enable submit button regardless of table state, add i18n keys. Files: `x.jsx`, `CartView.jsx`.

2. **[P1] Extract table code verification UI** — Source: CC only (#5) — Extract table code input from CartView.jsx:1084-1189 into reusable component for both drawer and Bottom Sheet. Files: `CartView.jsx`, `x.jsx`.

3. **[P2] Drawer stepper XIcon → Minus + import fix** — Source: CC only (#2, #3, #10) — Replace `XIcon` with `Minus` icon at qty=1, replace text `+`/`−` with `Plus`/`Minus` icons, add imports. Files: `CartView.jsx`.

4. **[P2] Submit button text update + i18n keys** — Source: CC only (#6) — Always show «Отправить заказ официанту», add Bottom Sheet i18n keys. Files: `CartView.jsx`, `x.jsx`.

5. **[P2] Mode-switch toast i18n fallback** — Source: Codex only (#6) — Add `cart.items_removed_mode_switch` to `I18N_FALLBACKS` or use `tr()`. Files: `x.jsx`.

6. **[P2] Remove console.error** — Source: CC only (#7) — Remove `console.error(err)` at x.jsx:2582. Files: `x.jsx`.

7. **[P3] Active category chip terracotta** — Source: CC only (#1) — Pass `activeColor="#B5543A"` prop to CategoryChips or note that B44 prompt is needed if prop not supported. Files: `x.jsx` (attempt prop), may need B44 prompt.

### Items for BUGS_MASTER.md (out of scope, do NOT fix now):
- [P1] Partner lookup hides backend failures behind "restaurant not found" (Codex #2)
- [P1] Hall StickyCartBar ignores visit lifecycle state (Codex #3)
- [P2] Hall StickyCartBar copy — missing full state matrix (Codex #4)
- [P2] StickyCartBar animations — no cart count tracking for triggers (Codex #5)

## Summary
- Agreed: 1 item (just-in-time table confirmation)
- CC only: 7 items (6 accepted, 1 informational/skipped)
- Codex only: 5 items (1 accepted, 4 rejected as out of scope)
- Disputes: 0
- Total fixes to apply: 7
- Items deferred to BUGS_MASTER: 4
