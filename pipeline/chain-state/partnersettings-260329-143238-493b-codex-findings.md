# Codex Writer Findings — PartnerSettings Chain: partnersettings-260329-143238-493b

## Findings
1. [P2] Fix 1 incomplete — `pages/PartnerSettings/partnersettings.jsx` still renders five user-visible `t()` calls without Russian fallbacks at lines 127, 497, 498, 509, and 526. If those translation keys are missing in Base44, users will see raw keys instead of readable labels. FIX: add second-argument fallbacks to `t("settings.tabs.appearance")`, `t("settings.appearance.title")`, `t("settings.appearance.subtitle")`, `t("settings.appearance.default")`, and `t("settings.appearance.defaultHint")` exactly as specified.
2. [P2] Fix 2 not implemented — `DiscountSection` still uses the old manual-save flow: `localSaving` and `hasChanges` state remain at lines 550-551, `handleSave` still batches all four fields at lines 584-599, field handlers only update local state, and the Save button is still rendered at lines 699-718. This does not match the required per-field auto-save behavior. FIX: remove `localSaving`, `hasChanges`, `handleSave`, and the Save button; use the existing `useDebouncedCallback` pattern for `discount_percent`; call `onSave()` immediately from the toggle, color picker, and badge size handlers; and use `saving` directly for disabled/spinner state.
3. [P2] Fix 3 not implemented — the dangerous hall setting for `settings.hall.max_attempts` is still visible at lines 1047-1063, including its label, input, and hint. Partners can still edit the lockout threshold from the UI. FIX: wrap that existing JSX block in `{false && ( ... )}` and leave `maxAttempts`, `setMaxAttempts`, and all save logic untouched.

## Summary
Total: 3 findings (0 P0, 0 P1, 3 P2, 0 P3)

## Prompt Clarity (MANDATORY — do NOT skip this section)
- Overall clarity: 5
- Ambiguous Fix descriptions (list Fix # and what was unclear): None.
- Missing context (what info would have helped): None needed beyond the target file and page-local docs.
- Scope questions (anything you weren't sure if it's in scope): None.
