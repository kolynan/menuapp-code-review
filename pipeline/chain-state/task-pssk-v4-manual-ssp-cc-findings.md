# CC Findings: PartnerOrderProcess ПССК v4 Prompt Review

**Reviewed by:** Claude Code (manual review, not chain)
**Prompt:** PartnerOrderProcess Redesign + язправ — КС Prompt v4
**Date:** 2026-04-04
**Methodology:** prompt-checker checklist A-H + KB_PROMPT_ERRORS PQ-001 through PQ-046

---

## CRITICAL (2)

### Finding 1: Execution order creates broken intermediate state (Fix 4 before Fix 2)

**Severity:** CRITICAL — runtime crash between steps

The prompt says: **"Fix 4 → Fix 1 → Fix 3 → Fix 2 → Fix 5"** with reason "Fix 4 must run first because `t()` calls are used in Fix 2 and Fix 3."

But Fix 4 says: **"After all replacements, DELETE `LOCAL_UI_TEXT` constant entirely (lines 125-135)."**

At this point Fix 2 has NOT run yet. The old `FixedStageRow` (lines 636-769) still contains:
- `LOCAL_UI_TEXT.locked` at line 698
- `LOCAL_UI_TEXT.enabled` / `LOCAL_UI_TEXT.disabled` at line 712

Deleting `LOCAL_UI_TEXT` before Fix 2 replaces `FixedStageRow` → **ReferenceError at runtime** between Fix 4 and Fix 2.

**Fix:** Split Fix 4 into two parts:
- **Fix 4A** (runs first): Replace Group Б + Group В references only. Do NOT delete `LOCAL_UI_TEXT` constant yet.
- **Fix 4B** (runs AFTER Fix 2): Delete `LOCAL_UI_TEXT` constant + verify 0 remaining references via grep.

Updated execution order: **Fix 4A → Fix 1 → Fix 2 → Fix 3 → Fix 4B → Fix 5**

### Finding 2: Missing i18n dictionary keys — 6 keys used in Fix 2 code but not in Fix 4 key list

**Severity:** CRITICAL — `t()` calls return raw key strings at runtime

Fix 2's replacement code uses these keys that are **NOT listed** in Fix 4's "New t() keys to add" section:

| Key used in Fix 2 code | Russian value needed | Status |
|---|---|---|
| `orderprocess.status.active` | `"Активен"` | MISSING from dictionary |
| `orderprocess.status.inactive` | `"Выключен"` | MISSING from dictionary |
| `orderprocess.aria.edit` | `"Редактировать этап"` (or similar) | MISSING from dictionary |
| `orderprocess.role.staff` | `"Персонал"` | MISSING from dictionary |
| `orderprocess.role.kitchen` | `"Кухня"` | MISSING from dictionary |
| `orderprocess.role.manager` | `"Менеджер"` | MISSING from dictionary |

**Fix:** Add all 6 keys to Fix 4's dictionary section. For `role.*` keys, add note: `(grep first — may already exist in other pages)`.

---

## HIGH (3)

### Finding 3: Icon imports not verified [PQ-015 adjacent]

Fix 2 uses Lucide icons: `Utensils`, `Package`, `Truck`, `Pencil`, `Lock`, `ChevronUp`, `ChevronDown`. The prompt does not verify which icons are already imported in the file.

If `ChevronUp`, `ChevronDown`, `Pencil`, or `Lock` are not imported → **build-time crash**.

**Fix:** Add a pre-step or note:
```
## Pre-requisite: Verify icon imports
grep -n "import.*from.*lucide" pages/PartnerOrderProcess/partnerorderprocess.jsx
Ensure these are imported: Utensils, Package, Truck, Pencil, Lock, ChevronUp, ChevronDown
If any missing → add to the existing lucide-react import line.
```

### Finding 4: No MOBILE-FIRST CHECK block [PQ-012, prompt-checker E1]

The prompt has excellent mobile wireframes but is **missing the mandatory MOBILE-FIRST CHECK block**. Per PQ-012, every UI КС prompt must include:

```
## MOBILE-FIRST CHECK (MANDATORY before commit)
This is a mobile-first restaurant app. Verify at 375px width:
- [ ] Close/chevron: right-aligned, sticky top
- [ ] Touch targets >= 44x44px
- [ ] No excessive whitespace on small screens
- [ ] Accordion expands/collapses correctly
- [ ] No horizontal overflow on channel icons row
```

**Fix:** Add the block before the VALIDATION section.

### Finding 5: No Regression Check section [prompt-checker E2]

Missing `## Regression Check (MANDATORY after implementation)` section. The prompt has FROZEN UX but no behavioral regression checks.

**Fix:** Add:
```
## Regression Check (MANDATORY after implementation)
- [ ] PipelinePreview banner still renders 5 colored circles with arrows
- [ ] Clicking pencil (desktop) or [Редактировать] (mobile) opens EditStageDialog
- [ ] EditStageDialog save still works (handleSaveStage untouched)
- [ ] Toggle active/inactive still works through EditStageDialog
- [ ] All 5 stages render (count check: querySelectorAll('.border-b').length >= 5)
```

---

## MEDIUM (4)

### Finding 6: Missing КС frontmatter [prompt-checker G1]

КС tasks require YAML frontmatter with `page:`, `budget:`, `agent:`, `chain_template:`. The prompt has these values in the header text but not in machine-readable frontmatter format.

**Fix:** Add at the very top:
```yaml
---
page: PartnerOrderProcess
code_file: pages/PartnerOrderProcess/partnerorderprocess.jsx
budget: 15
weight: H
chain_template: consensus-with-discussion-v2
agent: cc-writer
---
```

### Finding 7: No FROZEN UX grep verification commands [prompt-checker E3]

Per E3, for files >500 lines, add grep commands for key FROZEN elements so writers can verify before commit.

**Fix:** Add to VALIDATION section:
```bash
# FROZEN UX verification
grep -n "function PipelinePreview" pages/PartnerOrderProcess/partnerorderprocess.jsx
# Expected: exists, unchanged
grep -n "function EditStageDialog" pages/PartnerOrderProcess/partnerorderprocess.jsx
# Expected: exists, unchanged
grep -n "handleSaveStage" pages/PartnerOrderProcess/partnerorderprocess.jsx
# Expected: exists, unchanged
```

### Finding 8: Production/Test page not stated [PQ-001, prompt-checker B4]

The prompt does not explicitly state whether PartnerOrderProcess is a production page or test page. This affects priority assignment by CC/Codex writers.

**Fix:** Add to Context section: `Production page (partner-facing admin panel)`

### Finding 9: Fix 5 verification step incomplete

Fix 5 says "Step A — confirm zero JSX usages" with a grep command, but the grep includes `deleteDialog` and `handleConfirmDelete` alongside the functions to delete. Since `deleteDialog` and `deleteMutation` are explicitly KEPT, finding matches for `deleteDialog` would be expected and could confuse the implementer.

**Fix:** Split the grep into two:
```bash
# Step A — verify these have zero JSX call-sites (safe to delete function bodies):
grep -n "handleAddStage\|handleMoveUp\|handleMoveDown\|handleDeleteStage\|handleConfirmDelete" pages/PartnerOrderProcess/partnerorderprocess.jsx | grep -v "function \|const \|// "

# Step B — verify these exist and are KEPT (hook order):
grep -n "deleteMutation\|deleteDialog" pages/PartnerOrderProcess/partnerorderprocess.jsx
```

---

## LOW (1)

### Finding 10: C5 "НЕ должно быть" section missing for individual fixes [prompt-checker C5]

Per prompt-checker C5, each Fix should have a "НЕ должно быть" (what to REMOVE/avoid) note, not just "what to add." Fix 2 partially covers this via wireframes, but Fixes 3 and 4 lack explicit negative constraints.

**Fix:** Minor — add one-liners like:
- Fix 3: "НЕ должно быть: legend visible on desktop (sm:hidden enforces this)"
- Fix 4: "НЕ должно быть: any remaining LOCAL_UI_TEXT references after all fixes"

---

## Summary

| Severity | Count | Findings |
|----------|-------|----------|
| CRITICAL | 2 | #1 execution order crash, #2 missing 6 i18n keys |
| HIGH | 3 | #3 icon imports, #4 mobile-first block, #5 regression check |
| MEDIUM | 4 | #6 frontmatter, #7 frozen grep, #8 prod/test, #9 Fix 5 grep |
| LOW | 1 | #10 negative constraints |

**Verdict: ❌ FAIL — 2 CRITICAL + 3 HIGH must be fixed before queue**

### Prompt-Checker Checklist Summary

| Check | Result |
|-------|--------|
| A1-A4 | ⏭ N/A (КС type) |
| B1 TARGET vs CONTEXT | ✅ Clear (single file) |
| B2 Exact filename | ✅ |
| B3 Full relative path | ✅ |
| B4 Production/Test | ❌ Not stated |
| B5 Scope not mixed | ✅ |
| B6 SCOPE LOCK | ✅ |
| B7 Scope lock consistency | ✅ |
| C1 Position "of what" | ✅ (wireframes) |
| C2 Line numbers/grep | ✅ Extensive |
| C3 Fix dependencies | ❌ Execution order bug |
| C4 Unavailable APIs | ✅ (t() noted) |
| C5 "НЕ должно быть" | ❌ Missing for Fix 3/4 |
| C6 Mini test case | ✅ (Проверка sections) |
| C7 Price formatter | ⏭ N/A |
| D1 BUGS_MASTER | ⏭ (redesign, not bug) |
| D2 Bug in correct file | ✅ |
| D3 One task per prompt | ✅ |
| D4 Detail view exists | ✅ (EditStageDialog) |
| D5 History API | ⏭ N/A |
| D6 Drawer | ⏭ N/A |
| D7 DrawerContent relative | ⏭ N/A |
| D8 i18n function verified | ✅ (`const { t } = useI18n()` line 1067) |
| E1 MOBILE-FIRST CHECK | ❌ Missing |
| E2 Regression Check | ❌ Missing |
| E3 FROZEN UX grep | ❌ Missing |
| F1 Git add specific | ✅ |
| F2 Syntax check | ✅ (wc -l range) |
| F3 Grep verification | ✅ |
| G1 Frontmatter | ❌ Missing |
| G2 Budget | ✅ ($15 = H) |
| G3 H not mixed | ✅ |
| G4 References | ✅ |
| G5 SKIPPED | ⏭ N/A |
