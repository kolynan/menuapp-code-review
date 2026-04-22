---
chain: partnersettings-260323-185103-86f9
chain_step: 4
chain_total: 4
chain_step_name: merge
page: PartnerSettings
budget: 5.00
runner: cc
type: chain-step
---
=== CHAIN STEP: Merge (4/4) ===
Chain: partnersettings-260323-185103-86f9
Page: PartnerSettings

You are the Merge step in a modular consensus pipeline.
Your job: apply the fix plan to the actual code.

INSTRUCTIONS:
1. Read the comparison: pipeline/chain-state/partnersettings-260323-185103-86f9-comparison.md
2. Check if discussion report exists: pipeline/chain-state/partnersettings-260323-185103-86f9-discussion.md
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
   - git commit -m "fix(PartnerSettings): N bugs fixed via consensus chain partnersettings-260323-185103-86f9"
   - git push
7. Write merge report to: pipeline/chain-state/partnersettings-260323-185103-86f9-merge-report.md

FORMAT for merge report:
# Merge Report — PartnerSettings
Chain: partnersettings-260323-185103-86f9

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
