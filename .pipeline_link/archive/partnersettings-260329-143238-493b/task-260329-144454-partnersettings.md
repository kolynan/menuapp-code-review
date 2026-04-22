---
task_id: task-260329-144454-partnersettings
status: running
started: 2026-03-29T14:44:54+05:00
type: chain-step
page: PartnerSettings
work_dir: C:/Dev/menuapp-code-review
budget_usd: 5.00
fallback_model: sonnet
version: 5.14
launcher: python-popen
---

# Task: task-260329-144454-partnersettings

## Config
- Budget: $5.00
- Mode: task-watcher.py launches Claude Code directly via Popen
- Fallback model: sonnet

## Prompt
---
chain: partnersettings-260329-143238-493b
chain_step: 3
chain_total: 4
chain_step_name: discussion-cc-only
page: PartnerSettings
budget: 5.00
runner: cc
type: chain-step
---
=== CHAIN STEP: Discussion CC-Only (3/4) ===
Chain: partnersettings-260329-143238-493b
Page: PartnerSettings

You are the Discussion moderator in a modular consensus pipeline.
Your job: resolve disputes from the Comparator step using CC analysis ONLY (no Codex calls).

WHY CC-ONLY: Codex CLI calls in discussion cause 40+ minute delays due to sandbox FS timeouts
and slow model inference. CC resolves disputes equally well based on both sets of findings.
Fallback: if this approach proves insufficient, switch chain to `consensus-with-discussion`
which uses the original `discussion.md` step with Codex participation.

INSTRUCTIONS:

1. Read the comparison report: pipeline/chain-state/partnersettings-260329-143238-493b-comparison.md
2. Read BOTH findings files referenced in the comparison report to understand full context.
3. Look at the "Disputes" section.

IF there are 0 disputes:
   - Write to pipeline/chain-state/partnersettings-260329-143238-493b-discussion.md:
     # Discussion Report — PartnerSettings
     Chain: partnersettings-260329-143238-493b
     ## Result
     No disputes found. All items agreed or resolved by Comparator. Skipping discussion.
   - DONE. Exit immediately. Do NOT run any rounds.

IF there are 1+ disputes:
   For each dispute, write your analysis considering BOTH CC and Codex findings:

   a) Read the original code in the repository to understand the current implementation.
   b) Evaluate CC's proposed solution:
      - Correctness, edge cases, risks
   c) Evaluate Codex's proposed solution:
      - Correctness, edge cases, risks
   d) Pick the better solution OR propose a compromise, with clear reasoning.
   e) If neither solution is safe → mark as SKIP with explanation.

   IMPORTANT: Be fair. Do not automatically prefer CC's solution.
   Judge each dispute on technical merits only.

4. Write final discussion report to: pipeline/chain-state/partnersettings-260329-143238-493b-discussion.md

FORMAT:
# Discussion Report — PartnerSettings
Chain: partnersettings-260329-143238-493b
Mode: CC-Only (v2)

## Disputes Analyzed
Total: N disputes from Comparator

### Dispute 1: [title]
**CC Solution:** ...
**Codex Solution:** ...
**CC Analysis:** [technical reasoning comparing both]
**Verdict:** CC / Codex / Compromise / SKIP
**Reasoning:** [1-2 sentences why]

### Dispute 2: [title]
...

## Resolution Summary
| # | Dispute | Verdict | Reasoning |
|---|---------|---------|-----------|
| 1 | Title   | CC/Codex/Compromise/SKIP | Brief reason |

## Updated Fix Plan
Based on discussion results, provide the UPDATED fix plan that the Merge step should use.
Include ONLY the disputed items — agreed items from Comparator remain unchanged.
Format same as Comparator's "Final Fix Plan":
1. [P0] Fix title — Source: discussion-resolved — Description
2. ...

## Skipped (for Arman)
Items where neither solution is safe or where the dispute cannot be resolved technically.
Each item shows both positions and why neither is sufficient.

5. Do NOT apply any fixes — only document the discussion results

=== TASK CONTEXT ===
# Fix Batch 5: PartnerSettings i18n Fallbacks + Auto-Save + Hide Dangerous Field (#199)

Reference: `BUGS_MASTER.md`.
Production page. App URL: https://menu-app-mvp-49a4f5b2.base44.app

**Context:** MenuApp — QR-menu and table ordering system for restaurants. PartnerSettings page (2727 lines) has three independent issues in a single file: missing i18n fallbacks that show raw translation keys to users, an inconsistent manual Save button in DiscountSection (all other sections auto-save per field), and a dangerous UI field for "max attempts" that could lock guests out and should be hidden from the UI.

TARGET FILES (modify):
- `pages/PartnerSettings/partnersettings.jsx`

CONTEXT FILES (read-only):
- `BUGS_MASTER.md` — bug descriptions for PS-S158-01..05, PS-S194-01, PM-113

---

## FROZEN UX (DO NOT CHANGE)

These sections work correctly and must NOT be touched:

- **AppearanceSection** (lines 482–529): color picker calls `onSave({ primary_color: hex })` immediately on click. Layout and save logic correct. Do not modify.
- **WorkingHoursSection** (lines 723+): uses `useDebouncedCallback(fn, 500)` for auto-save. Pattern correct. Do not modify.
- **ProfileSection**: saves via sticky bar at bottom. Do not touch.
- **All other tabs** (channels, hall except maxAttempts UI, wifi, languages, currencies): do not touch.
- **DiscountSection field layout and labels**: keep toggle, percent input, color picker, badge size select exactly as-is. Only save mechanism changes.
- **`maxAttempts` state and save logic**: `maxAttempts` state variable, `setMaxAttempts`, and any `onSave` call that includes `table_code_max_attempts` must remain intact. Only the JSX that renders the input field gets hidden.

---

## Fix 1 — PS-S158-01..05 (P2) [MUST-FIX]: Missing i18n fallbacks showing raw keys to users

### Current behavior
Several `t("key")` calls have no second-argument fallback. If the translation key is missing from the B44 translation table, the raw key string is shown to users (e.g. `settings.tabs.appearance` instead of a readable label). Confirmed on /partnersettings page.

### Expected behavior
Every `t()` call that renders user-visible text must include a Russian fallback as second argument: `t("key", "Russian text")`. Users always see readable text even if the key is missing.

### Must NOT be
- Do NOT change any `t()` calls that already have a fallback (e.g. lines 128, 611, 614, 634, 642, 657, 684, 690–693 — leave as-is).
- Do NOT add new translation keys or change existing key strings.
- Do NOT change any styling, layout, or logic.

### File and location
File: `pages/PartnerSettings/partnersettings.jsx`

Exact changes (5 calls):

```
Line 127:
  BEFORE: t("settings.tabs.appearance")
  AFTER:  t("settings.tabs.appearance", "Внешний вид")

Line 497:
  BEFORE: t("settings.appearance.title")
  AFTER:  t("settings.appearance.title", "Цвет оформления")

Line 498:
  BEFORE: t("settings.appearance.subtitle")
  AFTER:  t("settings.appearance.subtitle", "Основной цвет интерфейса ресторана")

Line 509 (inside aria-label):
  BEFORE: t("settings.appearance.default")
  AFTER:  t("settings.appearance.default", "По умолчанию")

Line 526:
  BEFORE: t("settings.appearance.defaultHint")
  AFTER:  t("settings.appearance.defaultHint", "Используется цвет по умолчанию")
```

### Verification
1. Search for `t("settings.tabs.appearance")` (without second argument) — must return 0 results after fix.
2. Search for `t("settings.appearance.title")` (without second argument) — must return 0 results.

---

## Fix 2 — PS-S194-01 (P2) [MUST-FIX]: DiscountSection manual Save button → per-field auto-save

### Current behavior
DiscountSection (lines 545–719) uses a manual Save button. The user must click Save after changing any discount setting. All other sections (AppearanceSection, WorkingHoursSection) auto-save per field. This is inconsistent.

The current implementation:
- `hasChanges` state tracks whether any field changed
- `handleSave()` batches all 4 fields into a single `onSave()` call
- Save button (lines 699–718) is disabled until `hasChanges === true`

### Expected behavior
Remove the Save button. Each field saves independently when changed:
- **Toggle (discount_enabled)**: save immediately on change (AppearanceSection pattern)
- **Color picker (discount_color)**: save immediately on click (AppearanceSection pattern)
- **Badge size dropdown (discount_badge_size)**: save immediately on change
- **Percent input (discount_percent)**: save after 500ms debounce (WorkingHoursSection pattern)

The `useDebouncedCallback` hook is already imported for WorkingHoursSection — verify before adding import (search for `useDebouncedCallback` in the file).

### Must NOT be
- Do NOT change the UI layout: toggle, percent input, color picker, badge size select must all remain visible and styled the same.
- Do NOT change `fieldsDisabled` behavior — fields still disabled when `!discountEnabled`.
- Do NOT remove `discountEnabled`, `discountPercent`, `discountColor`, `discountBadgeSize` state variables.
- Do NOT use `handleSave` pattern in any field handler.
- Do NOT keep `hasChanges` state — remove it entirely.
- Do NOT keep `localSaving` state — use the `saving` prop directly for disabled/spinner.

### File and location
File: `pages/PartnerSettings/partnersettings.jsx`
Component: `function DiscountSection` starting at line 545.

**Changes to make:**

1. **Remove state** (lines 550–551): delete `localSaving` and `hasChanges` useState declarations.

2. **Update `isSaving`** — replace `const isSaving = saving || localSaving;` with direct use of `saving` prop throughout. OR remove `isSaving` variable and use `saving` directly.

3. **Remove `handleSave` function** (lines 584–599): delete entire `const handleSave = async () => { ... }` block.

4. **Rewrite `handleToggle`** (immediate save):
```jsx
const handleToggle = (checked) => {
  const newVal = checked === true;
  setDiscountEnabled(newVal);
  onSave({ discount_enabled: newVal });
};
```
Remove `setHasChanges(true)` from this handler.

5. **Rewrite `handlePercentChange`** (debounced save):
```jsx
const debouncedSavePercent = useDebouncedCallback(
  (val) => onSave({ discount_percent: val }),
  500
);

const handlePercentChange = (e) => {
  const val = parseInt(e.target.value, 10);
  if (!isNaN(val)) {
    const clamped = Math.max(1, Math.min(99, val));
    setDiscountPercent(clamped);
    debouncedSavePercent(clamped);
  } else if (e.target.value === "") {
    setDiscountPercent("");
  }
};
```
Remove `setHasChanges(true)` from this handler.

6. **Rewrite `handleColorSelect`** (immediate save):
```jsx
const handleColorSelect = (hex) => {
  if (saving || !discountEnabled) return;
  setDiscountColor(hex);
  onSave({ discount_color: hex });
};
```
Remove `setHasChanges(true)` from this handler.

7. **Badge size `onValueChange`** (line 685 — immediate save):
```jsx
onValueChange={(val) => {
  setDiscountBadgeSize(val);
  onSave({ discount_badge_size: val });
}}
```
Remove `setHasChanges(true)` from here.

8. **Remove Save button JSX** (lines 699–718): delete the entire `<div className="pt-2">...</div>` block that contains the Save button.

9. **Update `fieldsDisabled`**: replace `const fieldsDisabled = !discountEnabled || isSaving;` with `const fieldsDisabled = !discountEnabled || saving;`

10. **Update remaining `isSaving` references in JSX**: replace with `saving` (spinner in title, opacity on label, disabled props).

### Verification
1. Open /partnersettings → Скидки tab. Confirm no Save button visible.
2. Toggle the "Включить скидку" checkbox → should save immediately (no button click needed, spinner briefly shows).
3. Click a color → should save immediately.
4. Change percent value → should save after ~0.5s without button click.
5. Change badge size → should save immediately.

---

## Fix 3 — PM-113 (P2) [MUST-FIX]: Hide "Макс. попыток" input from UI

### Current behavior
The hall settings section shows an input field "Макс. попыток" (max code attempts before lockout). Partners can accidentally set this to 1, locking out all guests who mistype the table code. This is a dangerous setting that should not be editable from the UI.

### Expected behavior
The "Макс. попыток" input and its label and hint are NOT visible to the user. The state variable and any backend save logic remain intact (for future use or admin-only access).

### Must NOT be
- Do NOT remove `maxAttempts` state variable.
- Do NOT remove `setMaxAttempts` calls.
- Do NOT remove `table_code_max_attempts` from any `onSave()` call.
- Do NOT change layout or spacing of other hall settings fields.
- Do NOT use `display: none` or opacity hacks — use `{false && (...)}` to comment out the JSX.

### File and location
File: `pages/PartnerSettings/partnersettings.jsx`
Search for: `settings.hall.max_attempts` (around line 1048)

Current JSX block to hide (lines 1047–1063):
```jsx
<div className="space-y-1.5">
  <Label className="text-xs text-slate-600">{t("settings.hall.max_attempts")}</Label>
  <Input
    type="number"
    min={1}
    max={10}
    value={maxAttempts}
    onChange={(e) => {
      const val = Math.max(1, Math.min(10, parseInt(e.target.value) || 3));
      setMaxAttempts(val);
      setHasCodeChanges(true);
    }}
    className="h-11 text-sm"
    disabled={isSaving}
  />
  <p className="text-xs text-slate-500">{t("settings.hall.max_attempts_hint")}</p>
</div>
```

Wrap this entire `<div>` in `{false && ( ... )}`:
```jsx
{false && (
  <div className="space-y-1.5">
    ... (unchanged content) ...
  </div>
)}
```

### Verification
1. Open /partnersettings → Зал tab. Confirm no "Макс. попыток" field visible.
2. Confirm other hall fields (code length, cooldown) still visible and working.

---

## MOBILE-FIRST CHECK (MANDATORY before commit)
This is a mobile-first restaurant app. Primary usage: customer phone at the table.
Before committing, verify ALL changes at 375px viewport width:
- [ ] Touch targets ≥ 44×44px (h-11 w-11)
- [ ] No excessive whitespace/gaps on small screens after Save button removal
- [ ] Toggle and color picker still tappable on small screens
- [ ] No duplicate visual indicators

---

## Regression Check (MANDATORY after implementation)

Verify these existing behaviors still work after all changes:
- [ ] AppearanceSection: clicking a color still auto-saves (no regression from debounce import)
- [ ] WorkingHoursSection: toggling days and editing hours still auto-saves with debounce
- [ ] ProfileSection: Save button in sticky bar still works
- [ ] Hall section: Code Length and Cooldown Seconds inputs still save correctly
- [ ] DiscountSection: toggling discount OFF still disables/fades all other fields

---

## ⛔ SCOPE LOCK — only change what is described above
- Modify ONLY `pages/PartnerSettings/partnersettings.jsx`.
- ONLY the specific lines described in Fix 1, Fix 2, Fix 3.
- If you see any other issue — SKIP it, do not fix it.
- Do NOT change any other component or file.
- Do NOT change any section not mentioned (ProfileSection, WorkingHoursSection, AppearanceSection, ChannelsSection, HallSection except maxAttempts UI, WifiSection, LanguagesSection, CurrenciesSection).

## Implementation Notes

**FROZEN UX grep verification** (run before committing to confirm FROZEN sections unchanged):
```bash
# AppearanceSection auto-save pattern must remain intact
grep -n "onSave({ primary_color" pages/PartnerSettings/partnersettings.jsx
# Expected: 1 result around line 487

# WorkingHoursSection debounce pattern must remain intact
grep -n "useDebouncedCallback" pages/PartnerSettings/partnersettings.jsx
# Expected: at least 1 result (WorkingHoursSection) + 1 from DiscountSection after Fix 2

# maxAttempts state must remain (only JSX hidden)
grep -n "maxAttempts" pages/PartnerSettings/partnersettings.jsx
# Expected: multiple results (state, setMaxAttempts, onSave) — but NO visible Input JSX for it
```

- File: `pages/PartnerSettings/partnersettings.jsx`
- Check if `useDebouncedCallback` is already imported before adding it (search for `useDebouncedCallback` — likely imported from `use-debounce`).
- All 3 fixes are in a single file — apply sequentially: Fix 1 (5 line edits), Fix 2 (DiscountSection refactor), Fix 3 (wrap 1 JSX block).
- git add `pages/PartnerSettings/partnersettings.jsx` && git commit -m "fix: PartnerSettings i18n fallbacks + discount auto-save + hide maxAttempts S194" && git push
=== END ===


## Status
Running...
