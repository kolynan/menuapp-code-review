---
chain: partnersettings-260323-185103-86f9
chain_step: 1
chain_total: 4
chain_step_name: cc-writer
chain_group: writers
chain_group_size: 2
page: PartnerSettings
budget: 10.00
runner: cc
type: chain-step
---
=== CHAIN STEP: CC Writer (1/4) ===
Chain: partnersettings-260323-185103-86f9
Page: PartnerSettings

You are the CC Writer in a modular consensus pipeline.
Your job: independently analyze the code and produce findings.

INSTRUCTIONS:
1. Read the file(s) specified in TASK CONTEXT below for PartnerSettings
2. Also read README.md and BUGS.md in the same folder for context (read-only, do NOT modify)
3. Do your OWN independent analysis
4. Focus on: logic errors, missing error handling, i18n issues, UI/UX for mobile-first, React anti-patterns
5. For each finding: [P0/P1/P2/P3] Title - Description. FIX: description of code change needed.
6. Write your findings to: pipeline/chain-state/partnersettings-260323-185103-86f9-cc-findings.md
7. Do NOT apply any fixes yet — only document findings

⛔ SCOPE RESTRICTION (MANDATORY):
If the TASK CONTEXT below contains a numbered Fix list (Fix 1, Fix 2, etc.):
- Do NOT report ANY issues outside the numbered Fix list.
- If you see other bugs — IGNORE them completely.
- Your output must contain ONLY findings for Fix 1, Fix 2, etc.
- Extra findings outside the Fix list = task FAILURE.
- BAD example: Task says "Fix 1: button position" → you report touch targets, aria-labels, i18n issues. This is WRONG.
- GOOD example: Task says "Fix 1: button position" → you report ONLY your analysis of Fix 1 (button position). Nothing else.

If there is NO numbered Fix list → find ALL bugs.

FORMAT for findings file:
# CC Writer Findings — PartnerSettings
Chain: partnersettings-260323-185103-86f9

## Findings
1. [P0/P1/P2/P3] Title — Description. FIX: ...
2. ...

## Summary
Total: N findings (X P0, Y P1, Z P2, W P3)

⛔ Prompt Clarity (MANDATORY — findings without this section are INCOMPLETE and will be REJECTED):
Rate the task description quality (1-5). For any score below 4, explain what was unclear:
- Overall clarity: [1-5]
- Ambiguous Fix descriptions (list Fix # and what was unclear): ...
- Missing context (what info would have helped): ...
- Scope questions (anything you weren't sure if it's in scope): ...
YOU MUST FILL IN ALL FIELDS ABOVE. Do NOT skip this section.

=== TASK CONTEXT ===
# Bugfix S168: discount_enabled toggle not saving in PartnerSettings

Reference: `BUGS_MASTER.md` (PM-114), `menuapp-code-review/pages/PartnerSettings/`.
**Production page** — PartnerSettings (partner cabinet, /partnersettings)

TARGET FILES (modify):
- `pages/PartnerSettings/PartnerSettings.jsx`

CONTEXT FILES (read-only, do NOT modify):
- `pages/PartnerSettings/BUGS.md`
- `pages/PartnerSettings/README.md`

---

## Fix 1 — PM-114 (P1) [MUST-FIX]: discount_enabled toggle does not persist on save

### Сейчас
The "Скидки" (Discounts) section in PartnerSettings has a toggle (checkbox) for `discount_enabled`, plus inputs for `discount_percent`, `discount_color`, and `discount_label_size`. When the partner unchecks the toggle and clicks "Сохранить" (Save), the toggle change is NOT saved to the entity. After page refresh, the checkbox appears checked again — `discount_enabled` remains `true` in the entity.

The Save button in the Скидки section only persists the numeric/color fields (`discount_percent`, `discount_color`, `discount_label_size`) but does NOT include `discount_enabled` in the save payload.

### Должно быть
When partner clicks "Сохранить" in the Скидки section:
- `discount_enabled` MUST be saved to the entity (alongside percent, color, label size)
- After refresh: toggle reflects the saved value (OFF stays OFF, ON stays ON)
- All 4 fields saved together: `discount_enabled`, `discount_percent`, `discount_color`, `discount_label_size`

### НЕ должно быть
- Do NOT add a separate save button only for the toggle
- Do NOT auto-save on toggle change (keep explicit save pattern consistent with rest of PartnerSettings)
- Do NOT change the visual layout of the Скидки section
- Do NOT touch other sections (WiFi, Contacts, Appearance, etc.)

### Файл и локация
File: `pages/PartnerSettings/PartnerSettings.jsx`

Search for the Скидки section save handler:
- Search for `discount_percent` or `discount_color` or `discount_label_size` — this is where the save payload is built
- The save handler likely calls `entity.update(...)` or similar — find where the discount fields are passed
- Add `discount_enabled: localDiscountEnabled` (or whatever the local state variable is named) to the same save payload

Steps:
1. Find the local state variable for the toggle (e.g. `localDiscountEnabled`, `discountEnabled`, `localDiscount.enabled`)
2. Find the save function for the Скидки section (search near `discount_percent` save call)
3. Add `discount_enabled` to the save payload in that function

### Уже пробовали
First occurrence — added in S167 КС (chain partnersettings-260323-142203-51fa, 12 fixes applied). Toggle was added to UI but save was not connected. This is the first fix attempt.

### Проверка
1. Open PartnerSettings → Скидки section
2. Toggle discount OFF (uncheck)
3. Click "Сохранить"
4. Refresh the page
5. Expected: toggle is OFF ✅ (discount_enabled = false persisted)
6. Toggle ON → Save → Refresh → toggle is ON ✅

---

## ⛔ SCOPE LOCK — менять ТОЛЬКО то, что указано выше

- Modify ONLY the save handler for the Скидки section in `PartnerSettings.jsx`
- Add ONLY `discount_enabled` to the existing save payload — nothing else
- Do NOT change the toggle UI, layout, or other sections
- Do NOT add new state variables unless absolutely necessary
- Do NOT touch: WiFi section, Contacts, Appearance, other save handlers
- If you see other bugs — IGNORE them, do not report

## Implementation Notes
- File: `pages/PartnerSettings/PartnerSettings.jsx`
- Save pattern: same as existing save functions in the file (check WifiSection or color save for reference)
- git commit after fix
=== END ===
