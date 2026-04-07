# Comparison Report — PartnerSettings
Chain: partnersettings-260323-185103-86f9

## Agreed (both found)

1. **The save payload already includes `discount_enabled`** — Both CC and Codex confirm that line 588 of PartnerSettings.jsx already passes `discount_enabled: discountEnabled` in the `handleSave` payload. The bug description's hypothesized root cause (missing field in payload) is incorrect for the current codebase.

## CC Only (Codex missed)

_None._ CC found 0 actionable bugs. CC's analysis was thorough on the save chain (toggle → state → handleSave → onSave → saveDiscount → updateRec) and correctly concluded the payload is complete.

## Codex Only (CC missed)

1. **[P1] Save button unreachable when discount toggle is OFF** — Codex identified the actual root cause of PM-114:
   - `DiscountSection` sets `fieldsDisabled = !discountEnabled || isSaving` (line 601)
   - This applies `pointer-events-none` to the wrapper div (lines 638-715) that ALSO contains the Save button
   - When the user unchecks the toggle, the Save button becomes non-clickable — so even though `discount_enabled: false` is in the payload, `handleSave()` can never execute
   - **Verdict: ACCEPTED** — This is a valid P1 finding. It explains the observed behavior (toggle change not persisting after refresh) perfectly. The payload is correct but unreachable.

## Disputes (disagree)

_None._ Both agree the payload is correct. The only difference is that CC stopped at "no bug exists" while Codex dug deeper to find the UI-level blocker.

## Final Fix Plan

1. **[P1] Keep Save button clickable when discount toggle is OFF** — Source: Codex — The Save button must remain interactive even when `discountEnabled` is `false`. The `pointer-events-none` / disabled state should only apply to the percent/color/badge-size input controls, NOT to the Save button. Either:
   - (a) Move the Save button outside the disabled wrapper div, OR
   - (b) Split `fieldsDisabled` so the Save button is excluded from the disabled scope
   - Do NOT change the visual layout, only the interactivity of the Save button.

## Summary
- Agreed: 1 item (payload already correct — shared observation, not a fix)
- CC only: 0 items
- Codex only: 1 item (1 accepted, 0 rejected)
- Disputes: 0 items
- **Total fixes to apply: 1**

## Notes
- CC's analysis was correct but incomplete — it verified the data flow but did not check the UI interactivity path (whether the Save button is actually clickable in all states).
- Codex correctly identified that `pointer-events-none` on the wrapper div is the true blocker for PM-114.
- The fix is minimal: ensure the Save button remains clickable when the toggle is OFF. All other controls in the section should remain disabled as designed.
