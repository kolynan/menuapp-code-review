# Codex Writer Findings — PartnerSettings Chain: partnersettings-260323-142203-51fa
## Findings
1. [P2] Discounts section is not implemented at all — `getSectionTabs()` has no discounts entry, the rendered settings flow jumps from `AppearanceSection` straight to `WorkingHoursSection`, and the file contains no `discount_` bindings, so the required toggle, percentage input, color picker, and badge-size control from Fix 1 are all missing. Relevant code: `pages/PartnerSettings/partnersettings.jsx:123`, `pages/PartnerSettings/partnersettings.jsx:2434`, `pages/PartnerSettings/partnersettings.jsx:2441`. FIX: Add a dedicated discounts section immediately after `AppearanceSection`, with controls bound to `partner.discount_enabled`, `partner.discount_percent`, `partner.discount_color`, and `partner.discount_badge_size`, and disable the last three controls when `discount_enabled` is false.
2. [P2] The required save path for discount settings does not exist — the only sticky page-level save button calls `saveProfile()`, which persists only `name`, `address`, `logo`, and `address_map_url`, while `saveAppearance()` only updates `primary_color`. Even if the UI were added, the Fix 1 requirement to save/reload all four discount fields with the existing settings save flow would still fail until those fields are included. Relevant code: `pages/PartnerSettings/partnersettings.jsx:2204`, `pages/PartnerSettings/partnersettings.jsx:2225`, `pages/PartnerSettings/partnersettings.jsx:2501`. FIX: Wire `discount_enabled`, `discount_percent`, `discount_color`, and `discount_badge_size` into the intended existing save flow and the in-memory `partner` state so the values persist after save and reload.

## Summary
Total: 2 findings (0 P0, 0 P1, 2 P2, 0 P3)

## Prompt Clarity (MANDATORY — do NOT skip this section)
- Overall clarity: 4
- Ambiguous Fix descriptions (list Fix # and what was unclear): Fix 1: “save together with the existing settings save button” is slightly ambiguous because this page currently mixes an appearance auto-save path with a profile-only sticky save button.
- Missing context (what info would have helped): The folder contains `PartnerSettings README.md` rather than `README.md`; the exact filename would have removed that mismatch.
- Scope questions (anything you weren't sure if it's in scope): It was not explicit whether the new Discounts section also needs its own `SectionNav` tab entry, or only the section body placed after `primary_color`.
