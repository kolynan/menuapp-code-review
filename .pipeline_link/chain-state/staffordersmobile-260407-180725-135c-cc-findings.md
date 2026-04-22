# CC Reviewer Findings — ПССК Prompt Quality Review
Chain: staffordersmobile-260407-180725-135c

## Issues Found

1. **[CRITICAL] Fix 1: `jumpChips` array placement inside JSX is impossible** — The prompt says "Build a `jumpChips` array in the hall-mode card (near line 2183)". Line 2183 is INSIDE JSX (`{hallSummaryItems.length > 0 ? ...}`). You cannot declare a `const jumpChips = [...]` array inside JSX. The array MUST be computed before the JSX return — near the other computed data (lines 1990–2010 area), ideally as a `useMemo` or plain computation alongside `hallSummaryItems` (line 1996).
   **PROMPT FIX:** Change "Build a jumpChips array in the hall-mode card (near line 2183)" to "Build a `jumpChips` array as a computed value BEFORE the JSX return, near `hallSummaryItems` (line 1996). Example placement: after line 1996, before `inProgressSections`."

2. **[CRITICAL] Fix 2 ↔ Fix 3 dependency conflict for inProgress section** — Fix 2 instructs "For В РАБОТЕ subsections (line 2216): move per-subsection bulk buttons below renderHallRows." Fix 3 then COMPLETELY REPLACES the inProgress wrapper at line 2216 with a new structure that already includes bulk buttons at the bottom. If the implementer applies Fix 2 first to inProgress, Fix 3 overwrites all those changes. The prompt does not clarify this ordering dependency.
   **PROMPT FIX:** Add to Fix 2: "NOTE: For В РАБОТЕ subsections, skip this fix — Fix 3 replaces the entire inProgress block and already includes bulk buttons at the bottom." Or reorder: apply Fix 3 before Fix 2. Or merge the overlapping parts.

3. **[MEDIUM] Fix 1: Hardcoded Russian strings violate SCOPE LOCK i18n rule** — The prompt uses `label: "Запросы"` and `label: "В работе"` as hardcoded Russian strings. The SCOPE LOCK section states "all new user-facing text MUST use HALL_UI_TEXT keys." `HALL_UI_TEXT.requestsShort` already exists at line 307 (= "Запросы"). For "В работе", no `inProgressShort` key exists.
   **PROMPT FIX:** Change `label: "Запросы"` to `label: HALL_UI_TEXT.requestsShort`. Add `inProgressShort: "В работе",` to the new HALL_UI_TEXT keys in Fix 6 (or create a separate note). Update Fix 1 to use `label: HALL_UI_TEXT.inProgressShort`.

4. **[MEDIUM] Fix 2: Missing code for ЗАПРОСЫ section restructuring** — The ЗАПРОСЫ section (line 2212) has complex conditional logic: `(() => { const allNew = ...; const allAccepted = ...; if (allNew) return <button>acceptAll</button>; if (allAccepted) return <button>serveAll</button>; return null; })()`. The prompt says "move button to bottom of requests list. Keep request cards as-is." but provides NO actual code for this restructuring. Given the complexity (conditional accept/serve, inline IIFE), implementers need explicit guidance.
   **PROMPT FIX:** Provide the actual JSX code showing: (a) the simplified header (title + chevron only), (b) the bulk-bar at the bottom of the requests list, preserving the allNew/allAccepted conditional logic.

5. **[MEDIUM] Fix 2: Missing header replacement code for all sections** — The prompt describes "Replace with a chevron" for section headers but only shows the bulk-bar code (the `<div className="border-t border-blue-100 ...">` block). The actual header replacement (removing the `<button>` and adding `<ChevronDown>`) is not shown in code for НОВЫЕ, ГОТОВО, or ЗАПРОСЫ sections. Only verbal description.
   **PROMPT FIX:** For at least НОВЫЕ section, show the complete header replacement: from the current `<div className="flex items-center justify-between gap-3 mb-2"><div>...title...</div><button>acceptAll</button></div>` to `<div className="flex items-center justify-between gap-3 mb-2"><div>...title...</div><ChevronDown className="w-4 h-4 text-slate-400" /></div>`.

6. **[MEDIUM] Fix 2: Bulk buttons style inconsistency** — Current bulk buttons use outlined style (`border-blue-200 bg-blue-50 text-blue-700`). Fix 2 changes them to filled solid buttons (`bg-blue-600 text-white`). This is a significant visual change. If intentional per mockup, fine — but the prompt should explicitly note this is a deliberate style change, not just a position move.
   **PROMPT FIX:** Add a note: "Bulk buttons change from outlined to filled solid style per mockup."

7. **[MEDIUM] Fix 4: `servedOrders.length` as "гостей" may be misleading with split-order architecture** — FROZEN UX #12 states "each cart item = separate Order". With split-order, `servedOrders.length` counts individual dish-orders, not guests. Showing "5 гостей · 5 блюд" when it's actually 1 guest with 5 dishes is confusing. However, this is an EXISTING pattern (НОВЫЕ/ГОТОВО use the same `orders.length` as guest count), so Fix 4 is consistent with existing behavior — just extending it.
   **PROMPT FIX:** Add a note: "NOTE: `servedOrders.length` counts orders, not unique guests (same as existing НОВЫЕ/ГОТОВО pattern). Per split-order architecture, this may overcount guests. Accepted as-is for consistency — future UX fix if needed."

8. **[LOW] Fix 1: `chipStyles` should be a module-level constant** — The prompt places `chipStyles` "near line 2075 (before renderHallRows)." This is inside the component — it will be recreated every render. Since it's a plain static object with no dependencies, it should be defined at module level (near `HALL_UI_TEXT` at line 343) for performance.
   **PROMPT FIX:** Change placement to "Define chipStyles as a module-level constant after HALL_UI_TEXT (line 343)."

9. **[LOW] Fix 1: Bill chip label case mismatch** — `HALL_UI_TEXT.bill` = "СЧЁТ" (uppercase). The mockup shows "Счёт" (title case). Minor visual discrepancy. May need a `billShort` key.
   **PROMPT FIX:** Either add `billShort: "Счёт"` to HALL_UI_TEXT or note that uppercase is acceptable.

10. **[LOW] Fix 6: No bill blocker in closeDisabledReasons** — The mockup example shows "→ оплатить 6 239 ₸" but `closeDisabledReasons` (lines 2019-2027) never includes a bill-related blocker. The Fix 6 `actionHint` mapping has no `bill` case. This is correct behavior (bills don't block closing), but the implementer might be confused by the mockup example.
    **PROMPT FIX:** Add a note: "The mockup's '→ оплатить' example is illustrative — the current `closeDisabledReasons` logic doesn't include bill blockers, so bill hints won't appear. This is expected."

## Line Number Verification

| Reference | Prompt says | Actual | Status |
|-----------|------------|--------|--------|
| HALL_UI_TEXT dictionary | 305–343 | 305–343 | ✅ |
| `getOrderActionMeta` | 1902–1913 | 1902–1913 | ✅ |
| `countRows` | 1967–1970 | 1967–1970 | ✅ |
| `hallSummaryItems` | line 1996 | 1996 | ✅ |
| `inProgressSections` | line 1998 | 1998 | ✅ |
| `closeDisabledReasons` | 2019–2027 | 2019–2027 | ✅ |
| `reasonToKind` | 2029–2034 | 2029–2034 | ✅ |
| `renderHallSummaryItem` | 2057–2072 | 2057–2072 | ✅ |
| `renderHallRows` | 2075–2114 | 2075–2125 (extends further) | ⚠️ minor |
| `hallSummaryItems.map(renderHallSummaryItem)` | line 2183 | 2183 | ✅ |
| Hall-mode path start | ~2175 | ~2168–2175 (collapsed card header area) | ✅ |
| НОВЫЕ section | line 2214 | 2214 | ✅ |
| В РАБОТЕ section | line 2216 | 2216 | ✅ |
| ГОТОВО section | line 2218 | 2218 | ✅ |
| ВЫДАНО section | line 2220 | 2220 | ✅ |
| Close-table block | line 2224 | 2224 | ✅ |
| `renderHallSummaryItem` legacy uses | 537, 594, 1149, 1205 | 537, 594, 1149, 1205 | ✅ |
| `rowLabel` in `getOrderActionMeta` | line 1910 | 1910 | ✅ |
| `scrollToSection` | line 1753 | 1753 | ✅ |
| File line count | 4407 | 4407 | ✅ |
| `inProgressExpanded` state init | (implicit) | line 1743 | ✅ |
| `requestsShort` key | (not referenced in prompt) | line 307 | ✅ exists |

## Fix-by-Fix Analysis

### Fix 1: Jump chips — RISKY
- Core idea is sound: replace text summary with colored chips. Data sources correctly identified.
- **Risk 1:** `jumpChips` placement inside JSX won't compile. Must compute before return.
- **Risk 2:** Hardcoded Russian strings violate the prompt's own SCOPE LOCK.
- **Risk 3:** Missing `HALL_UI_TEXT` keys for "В работе" chip label.
- Clarity: 3/5 — placement instruction is wrong, i18n violated.

### Fix 2: Bulk buttons repositioning — RISKY
- Concept is clear: move bulk buttons from header to bottom of card block.
- **Risk 1:** No code shown for ЗАПРОСЫ section (most complex, has conditional IIFE).
- **Risk 2:** No code shown for header replacement (removing button, adding chevron).
- **Risk 3:** Conflicts with Fix 3 for inProgress section — no dependency note.
- **Risk 4:** Style change (outlined → filled) not flagged.
- Clarity: 2/5 — too much left to implementer's interpretation.

### Fix 3: Remove В РАБОТЕ wrapper — SAFE (with note)
- Full replacement code provided. Structure matches mockup.
- `inProgressSectionRef` handling for `scrollToSection` is correct.
- `expandedSubGroups` / auto-expand effect (lines 1778-1786) still works since `inProgressExpanded` stays `true`.
- Opacity-60 on expanded content may be intentional for "passive" sections.
- Clarity: 4/5 — well-specified with complete code.

### Fix 4: Dual metric for ВЫДАНО — SAFE
- Simple text format change. Consistent with existing НОВЫЕ/ГОТОВО pattern.
- `pluralRu` usage matches established pattern throughout the file.
- Minor concern: `servedOrders.length` ≠ unique guests with split-order, but consistent.
- Clarity: 5/5 — clear, minimal, correct.

### Fix 5: Arrow → text labels — SAFE
- Minimal one-line change. Uses already-computed `nextLabel`.
- `nextLabel` correctly strips leading "→ " then re-adds it — result: "→ Готовится".
- No side effects on `bulkLabel` (already correct).
- Clarity: 5/5 — crystal clear, safe.

### Fix 6: Close-table hint reformatting — SAFE
- New HALL_UI_TEXT keys are justified and listed.
- `scrollToSection(kind)` behavior preserved (FROZEN UX #256-SOM).
- `reasonToKind` mapping correctly used to derive `kind` from blocker reason strings.
- Inline layout replaces vertical layout cleanly.
- Clarity: 4/5 — well-specified, minor mockup confusion about bill blocker.

## Summary

**Total: 10 issues (2 CRITICAL, 5 MEDIUM, 3 LOW)**

| Severity | Count | Key issues |
|----------|-------|------------|
| CRITICAL | 2 | jumpChips JSX placement; Fix 2↔Fix 3 dependency conflict |
| MEDIUM | 5 | Hardcoded i18n strings; missing ЗАПРОСЫ restructuring code; missing header replacement code; bulk button style change; servedOrders.length semantics |
| LOW | 3 | chipStyles module-level; bill chip case; no bill blocker note |

**Prompt clarity rating: 7/10**

## Prompt Clarity (MANDATORY — do NOT skip)

- **Overall clarity: 3.5/5**
- **What was most clear:** Line numbers are exceptionally accurate (17/17 verified ✅). Data structure references are correct. FROZEN UX list is comprehensive. Fix 3, 4, 5, 6 are well-specified with complete code. SCOPE LOCK is detailed and correct. Verification commands are useful.
- **What was ambiguous or could cause hesitation:**
  - Fix 1 `jumpChips` placement "near line 2183" — impossible location (inside JSX). Implementer will waste time figuring out where to put it.
  - Fix 2 lacks concrete code for 3 out of 4 sections (ЗАПРОСЫ header+bulk, НОВЫЕ header, ГОТОВО header). Only the bulk-bar is shown. Implementer must reverse-engineer the header changes.
  - Fix 2 ↔ Fix 3 overlap for inProgress is not addressed — implementer may apply both and create broken code.
  - Fix 1 violates its own i18n SCOPE LOCK rule with hardcoded Russian strings.
- **Missing context:**
  - Fix ordering recommendation: suggest applying Fix 5 → Fix 4 → Fix 6 → Fix 3 → Fix 1 → Fix 2 (simpler fixes first, then Fix 3 before Fix 2 to avoid conflict).
  - Whether `inProgressExpanded` auto-expand effect (line 1778-1786) should be modified after Fix 3 removes the hall-mode toggle.
  - How the collapsed card should look when BOTH jump chips (Fix 1) AND the expand toggle are present — the chips show below the header line, but is there enough vertical space?
