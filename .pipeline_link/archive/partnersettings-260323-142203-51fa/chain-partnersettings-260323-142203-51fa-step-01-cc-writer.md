---
chain: partnersettings-260323-142203-51fa
chain_step: 1
chain_total: 4
chain_step_name: cc-writer
chain_group: writers
chain_group_size: 2
page: PartnerSettings
budget: 12.00
runner: cc
type: chain-step
---
=== CHAIN STEP: CC Writer (1/4) ===
Chain: partnersettings-260323-142203-51fa
Page: PartnerSettings

You are the CC Writer in a modular consensus pipeline.
Your job: independently analyze the code and produce findings.

INSTRUCTIONS:
1. Read the file(s) specified in TASK CONTEXT below for PartnerSettings
2. Also read README.md and BUGS.md in the same folder for context (read-only, do NOT modify)
3. Do your OWN independent analysis
4. Focus on: logic errors, missing error handling, i18n issues, UI/UX for mobile-first, React anti-patterns
5. For each finding: [P0/P1/P2/P3] Title - Description. FIX: description of code change needed.
6. Write your findings to: pipeline/chain-state/partnersettings-260323-142203-51fa-cc-findings.md
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
Chain: partnersettings-260323-142203-51fa

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
# Feature: PartnerSettings — Discount management UI (toggle, %, color, badge size)

Reference: `BUGS_MASTER.md`, `menuapp-code-review/pages/PartnerSettings/`.

**Production page** — `https://menu-app-mvp-49a4f5b2.base44.app/partnersettings`

**Context:** Partner entity already has 4 discount fields: `discount_enabled` (boolean), `discount_percent` (number), `discount_color` (string, hex), `discount_allow_anonymous` (boolean). These fields exist in the DB but are NOT exposed in the PartnerSettings UI. Partners cannot manage discounts from their cabinet.

TARGET FILES (modify):
- `pages/PartnerSettings/PartnerSettings.jsx`

CONTEXT FILES (read-only, do NOT modify):
- `pages/PartnerSettings/README.md`

---

## Fix 1 — #104 (P2) [MUST-FIX]: Add Discount management section to PartnerSettings UI

### Сейчас (текущее поведение)
PartnerSettings page has no section for discount management. Partner has no way to:
- Enable or disable discounts
- Set discount percentage
- Choose discount badge color
- Set discount badge size

### Должно быть (ожидаемое поведение)
Add a new section **"Скидки" / "Discounts"** to PartnerSettings. The section should contain:

**1. Toggle: Enable discount**
- Label: "Включить скидку" (i18n key: `settings.discount_enabled`)
- Binds to: `partner.discount_enabled` (boolean)
- When OFF: all other discount fields are disabled/grayed out

**2. Number input: Discount percentage**
- Label: "Размер скидки, %" (i18n key: `settings.discount_percent`)
- Binds to: `partner.discount_percent` (number, integer)
- Validation: 1–99 (inclusive)
- Disabled when `discount_enabled = false`

**3. Color picker: Badge color**
- Label: "Цвет бейджа скидки" (i18n key: `settings.discount_color`)
- Binds to: `partner.discount_color` (string, hex)
- Default value: `#C92A2A`
- Use the same color-picker component pattern already used on this page (search for existing color picker — `primary_color` picker was added in S159, chain partnersettings-260321-235750)
- Disabled when `discount_enabled = false`

**4. Select/radio: Badge font size**
- Label: "Размер шрифта бейджа" (i18n key: `settings.discount_badge_size`)
- Binds to: `partner.discount_badge_size` (string)
- Options: `"sm"` → "Маленький", `"base"` → "Средний" (default), `"lg"` → "Большой"
- Disabled when `discount_enabled = false`
- NOTE: `discount_badge_size` field may not exist yet in Partner entity — if it doesn't exist as a known field, implement the UI anyway and save to `partner.discount_badge_size`. The field will be added to the schema separately.

**Section placement:** Add the Discounts section after the existing color settings section (or at the end of the settings form — check where `primary_color` section ends and place after it).

**Save behavior:** All 4 fields save together with the existing settings save button (same `handleSave` or similar function already used on this page).

### НЕ должно быть (анти-паттерны)
- Do NOT create a separate save button for the discounts section — use the existing global save.
- Do NOT change any existing settings sections (primary_color, logo, hours, etc.).
- Do NOT add a new page — everything stays on PartnerSettings.
- Do NOT hardcode colors or values — use the field bindings above.

### Файл и локация
`pages/PartnerSettings/PartnerSettings.jsx`
- Search for `primary_color` — find the color picker section (added S159, chain partnersettings-260321-235750) to understand the existing color picker pattern and placement
- Search for `handleSave` or `onSave` or `updatePartner` — the save function; add all 4 new fields to it
- Search for existing section headers (`<h2`, `<h3`, `<section`, or a section wrapper component) to match layout style
- Place new "Скидки" section immediately after the `primary_color` color picker section

### Проверка (мини тест-кейс)
1. Open /partnersettings → "Скидки" section visible with toggle, %, color, size fields. ✅
2. Toggle OFF → all 3 other fields are disabled. ✅
3. Change discount_percent to 10 → save → reload → value is 10. ✅
4. Change discount_color to `#00FF00` → save → reload → color picker shows `#00FF00`. ✅

---

## ⛔ SCOPE LOCK — менять ТОЛЬКО то, что указано выше
- Modify ONLY: `pages/PartnerSettings/PartnerSettings.jsx`
- Do NOT touch any other page files, shared components, or utility files.
- Do NOT change existing settings sections (colors, logo, hours, language, etc.).
- Do NOT change routing or navigation.
- Extra findings = task FAILURE.

## Implementation Notes
- File: `pages/PartnerSettings/PartnerSettings.jsx`
- Color picker pattern: follow the `primary_color` color picker already in this file (added S159)
- i18n: use `t('settings.discount_enabled', 'Включить скидку')` pattern with fallback strings
- `discount_badge_size` field: save to `partner.discount_badge_size` even if not yet in entity schema
- git add pages/PartnerSettings/PartnerSettings.jsx && git commit -m "feat: add discount management section to PartnerSettings (#104)" && git push

## MOBILE-FIRST CHECK (MANDATORY before commit)
This is a mobile-first restaurant app. Verify at 375px width:
- [ ] Discounts section visible and readable on mobile
- [ ] Toggle is large enough to tap (>= 44px touch target)
- [ ] Color picker opens and works on mobile
- [ ] Number input for % accepts keyboard input on mobile
- [ ] Disabled state visually clear (grayed out) when toggle is OFF
=== END ===
