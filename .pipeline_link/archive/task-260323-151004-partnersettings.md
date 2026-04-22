---
task_id: task-260323-151004-partnersettings
status: running
started: 2026-03-23T15:10:05+05:00
type: chain-step
page: PartnerSettings
work_dir: C:/Dev/menuapp-code-review
budget_usd: 6.00
fallback_model: sonnet
version: 5.11
launcher: python-popen
---

# Task: task-260323-151004-partnersettings

## Config
- Budget: $6.00
- Mode: task-watcher.py launches Claude Code directly via Popen
- Fallback model: sonnet

## Prompt
---
chain: partnersettings-260323-142203-51fa
chain_step: 4
chain_total: 4
chain_step_name: merge
page: PartnerSettings
budget: 6.00
runner: cc
type: chain-step
---
=== CHAIN STEP: Merge (4/4) ===
Chain: partnersettings-260323-142203-51fa
Page: PartnerSettings

You are the Merge step in a modular consensus pipeline.
Your job: apply the fix plan to the actual code.

INSTRUCTIONS:
1. Read the comparison: pipeline/chain-state/partnersettings-260323-142203-51fa-comparison.md
2. Check if discussion report exists: pipeline/chain-state/partnersettings-260323-142203-51fa-discussion.md
   - If it exists AND has an "Updated Fix Plan" section → use THAT for disputed items
   - If it says "No disputes" or doesn't exist → use Comparator's "Final Fix Plan" as-is
   - Items marked "Unresolved (for Arman)" → SKIP these, do NOT apply
3. Read the code file: pages/PartnerSettings/*.jsx
4. Apply ALL fixes from the fix plan, in priority order (P0 first)
   - Agreed items from Comparator: always apply
   - Discussion-resolved items: apply the winning solution
   - Unresolved disputes: SKIP (note in merge report)
   - [MUST-FIX] items: CANNOT be skipped. If you cannot apply a MUST-FIX, explain WHY in detail in merge report — do NOT silently skip.
5. After applying fixes:
   a. Update BUGS.md in pages/PartnerSettings/ with fixed items
   b. Update README.md in pages/PartnerSettings/ if needed
6. Git commit and push:
   - git add <specific files only> (NEVER git add . or git add -A)
   - git commit -m "fix(PartnerSettings): N bugs fixed via consensus chain partnersettings-260323-142203-51fa"
   - git push
7. Write merge report to: pipeline/chain-state/partnersettings-260323-142203-51fa-merge-report.md

FORMAT for merge report:
# Merge Report — PartnerSettings
Chain: partnersettings-260323-142203-51fa

## Applied Fixes
1. [P0] Fix title — Source: agreed/discussion-resolved — DONE
2. [P1] Fix title — Source: comparator — DONE
...

## Skipped — Unresolved Disputes (for Arman)
- Dispute: [title] — CC says X, Codex says Y — NEEDS DECISION

## Skipped — Could Not Apply
- Reason...

## Git
- Commit: <hash>
- Files changed: N

## Prompt Feedback
Collect Prompt Clarity sections from CC and Codex findings files (if present), then add your own observations:
- CC clarity score: [N/5]
- Codex clarity score: [N/5]
- Fixes where writers diverged due to unclear description: ...
- Fixes where description was perfect (both writers agreed immediately): ...
- Recommendation for improving task descriptions: ...

## Summary
- Applied: N fixes
- Skipped (unresolved): N disputes
- Skipped (other): N fixes
- MUST-FIX not applied: N (with reasons)
- Commit: <hash>

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


## Status
Running...
