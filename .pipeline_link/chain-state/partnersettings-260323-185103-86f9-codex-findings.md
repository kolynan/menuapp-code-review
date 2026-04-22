# Codex Writer Findings — PartnerSettings Chain: partnersettings-260323-185103-86f9

## Findings
1. [P1] Save button becomes non-interactive when discounts are turned off — `DiscountSection` sets `fieldsDisabled = !discountEnabled || isSaving` at `PartnerSettings.jsx:601` and applies `pointer-events-none` to the wrapper at `PartnerSettings.jsx:638-715` that also contains the section Save button. When the user unchecks the toggle, the Save button stops receiving clicks before `handleSave()` can run, so `discount_enabled=false` cannot be persisted even though the payload already includes `discount_enabled` at `PartnerSettings.jsx:588`. FIX: keep the explicit Save button interactive when `discountEnabled` is `false`; only disable the percent/color/badge-size controls, or move the Save button outside the disabled wrapper without changing the section layout or save pattern.

## Summary
Total: 1 findings (0 P0, 1 P1, 0 P2, 0 P3)

## Prompt Clarity (MANDATORY — do NOT skip this section)
- Overall clarity: 3
- Ambiguous Fix descriptions (list Fix # and what was unclear): Fix 1 says the save payload omits `discount_enabled`, but the current file already includes `discount_enabled` in the payload. The remaining blocker is the disabled Save button when the toggle is OFF.
- Missing context (what info would have helped): The exact README filename in the page folder. `pages/PartnerSettings/README.md` does not exist; the available context file is `pages/PartnerSettings/PartnerSettings README.md`.
- Scope questions (anything you weren't sure if it's in scope): Whether to report the actual in-file blocker that still prevents saving `discount_enabled=false`, even though it differs from the hypothesized root cause in the task text.
