# CC Writer Findings — StaffOrdersMobile
Chain: staffordersmobile-260407-225207-80e2

## Findings

1. [P0] TDZ Crash — `jumpChips` references `inProgressSections` before initialization (line 2015 → line 2020).

   `const jumpChips = [...]` is declared at lines 2012–2018. On line 2015 it accesses `inProgressSections.reduce(...)`. But `const inProgressSections = useMemo(...)` is not declared until line 2020. Since `const` is block-scoped and subject to the Temporal Dead Zone, accessing `inProgressSections` at line 2015 will throw `ReferenceError: Cannot access 'inProgressSections' before initialization`. This is a **guaranteed crash on every render** of a hall-mode table card with in-progress orders.

   FIX: Move the `const jumpChips = [...]` block (lines 2012–2018) to AFTER `const inProgressSections = useMemo(...)` (after line 2024). The rest of the code using `jumpChips` (line 2205 in JSX) is already after line 2024 so no further changes needed.

## Summary
Total: 1 findings (1 P0, 0 P1, 0 P2, 0 P3)

All 6 fixes from the task (Fix 1–6) are otherwise correctly implemented:
- Fix 1 (jump chips): HALL_CHIP_STYLES at line 351, jumpChips computation near line 2012, chip JSX at line 2205 — correct except TDZ ordering above.
- Fix 2 (bulk bars at bottom): ЗАПРОСЫ (line 2234), НОВЫЕ (line 2236), ГОТОВО (line 2240) — headers have title + ChevronDown only, filled bulk buttons at bottom of each section. Correct.
- Fix 3 (inProgress root sections): line 2238 renders `inProgressSections.map(...)` as independent root-level sections with expandedSubGroups toggle. `inProgressExpanded` preserved for legacy paths (lines 658, 744, 1269, 1355, 2251). Correct.
- Fix 4 (ВЫДАНО dual metric): line 2242 includes `pluralRu` for guests and dishes. Correct.
- Fix 5 (rowLabel text): line 1924 uses `` `\u2192 ${nextLabel}` `` instead of standalone `"\u2192"`. Correct.
- Fix 6 (close hint): line 2246 renders single inline `<p>` with `HALL_UI_TEXT.closeHint` + mapped `scrollToSection` buttons. New HALL_UI_TEXT keys at lines 341–348. Correct.

### Verified constraints:
- `renderHallSummaryItem`: 5 occurrences (not removed) ✓
- `inProgressExpanded`: preserved in legacy paths (lines 658, 744, 1269, 1355, 2251) ✓  
- `HALL_CHIP_STYLES`: module-level at line 351 ✓
- `scrollToSection(kind)` in close area: preserved at line 2246 ✓
- File line count: 4429 (within expected 4427–4452 range) ✓
- Legacy paths 1 (~line 580) and 2 (~line 1190): not modified, render correctly ✓
- FROZEN UX elements: all 13 items verified intact ✓

⛔ Prompt Clarity (MANDATORY):
- Overall clarity: 5/5
- Ambiguous Fix descriptions: None. All 6 fixes had precise line numbers, exact code snippets, and clear before/after expectations.
- Missing context: None. The task provided all necessary context (3 render paths, data structures, existing keys, mockup reference).
- Scope questions: None. SCOPE LOCK was clearly defined with explicit ALLOWED and FORBIDDEN lists. The Fix execution order was helpful in preventing conflicts.

Note: The task description specified that `newShort` and `readyShort` should be added with values "Нов." and "Гот." in the NEW KEYS section, but these keys already existed at lines 309 and 311 with values "Новые" and "Готово". The task rule says "When Fix description and mockup conflict — mockup wins" and the mockup shows "Новые" / "Готово" — so the existing values are correct.
