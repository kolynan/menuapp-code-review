# Codex Writer Findings — PartnerSettings
Chain: partnersettings-260321-235750

## Findings
1. [P1] Appearance section is missing entirely — [`partnersettings.jsx`](C:/Dev/menuapp-code-review/pages/PartnerSettings/partnersettings.jsx) renders [`ProfileSection`](C:/Dev/menuapp-code-review/pages/PartnerSettings/partnersettings.jsx#L392) and then jumps straight to [`WorkingHoursSection`](C:/Dev/menuapp-code-review/pages/PartnerSettings/partnersettings.jsx#L2351), so the required "Appearance" block between them does not exist. `ProfileSection` itself only contains logo, name, address, and map-link fields at [C:/Dev/menuapp-code-review/pages/PartnerSettings/partnersettings.jsx#L392](C:/Dev/menuapp-code-review/pages/PartnerSettings/partnersettings.jsx#L392). Partners currently have no way to choose a brand color. FIX: add a dedicated Appearance section between Profile and Working Hours with the required title/subtitle and 8 preset color chips, using mobile-safe touch targets and a clear selected state.
2. [P1] `primary_color` is never saved or restored — the file contains no `primary_color` handling, and the only profile save path updates just `name`, `address`, `logo`, and `address_map_url` in [`saveProfile()`](C:/Dev/menuapp-code-review/pages/PartnerSettings/partnersettings.jsx#L2135). Because there is no code path that calls `Partner.update(..., { primary_color })`, the selected color cannot persist across reloads and the null default requirement (`#1A1A1A`) is not implemented. FIX: derive the selected value from `partner?.primary_color ?? "#1A1A1A"` and on chip tap call `updateRec("Partner", partner.id, { primary_color: selectedColor })`, then merge the saved value back into local `partner` state.
3. [P2] Sticky section nav is out of sync with the required new section — [`getSectionTabs()`](C:/Dev/menuapp-code-review/pages/PartnerSettings/partnersettings.jsx#L122) still defines `profile -> hours -> channels -> hall -> wifi -> languages -> currencies` with no `appearance` entry. On this mobile-first page the horizontal sticky nav is the primary section switcher; omitting Appearance makes the section order inconsistent and leaves the new block undiscoverable from navigation. FIX: add an `appearance` tab/id immediately after `profile` and wire it to the new section anchor.

## Summary
Total: 3 findings (0 P0, 2 P1, 1 P2, 0 P3)

## Prompt Clarity
- Overall clarity: 3
- Ambiguous Fix descriptions (list Fix # and what was unclear): None.
- Missing context (what info would have helped): The prompt asked for `pages/PartnerSettings/README.md`, but that exact file does not exist in the folder; only `pages/PartnerSettings/PartnerSettings README.md` is present.
- Scope questions (anything you weren't sure if it's in scope): `pages/PartnerSettings/*.jsx` conflicts with "ONLY these 3 files" because the folder contains multiple `.jsx` files. I limited the review to `pages/PartnerSettings/partnersettings.jsx` because the task context and `BUGS.md` both point to that file.
