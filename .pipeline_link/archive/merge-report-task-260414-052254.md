# Merge Report: PSSK v3 (patched) — SOM Batch A KS Prompt Review
## Task: task-260414-052254 | Session S267 | 2026-04-14

---

## Methodology

- **CC** (Claude Code): Read actual source files (`staffordersmobile.jsx` 4524 lines, `components/sessionHelpers.js`), verified every line number cited in the prompt via direct file reads and grep.
- **Codex** (GPT-5.4): Independent review via `codex exec`. Codex read the same source files but arrived at fundamentally different conclusions on Fix1 and Fix4.

---

## CRITICAL DISPUTE: Codex claims lines 670-708, 1281-1319 are "commented-out code"

**Codex says:** "The cited lines 670, 680, and 708 are inside a commented-out JSX block (`/* ... */` runs through line 785), so an implementor can easily patch dead code."

**CC verification:** This is **WRONG**. Lines 670-708 are LIVE code inside `OrderGroupCard` component render. I read these lines directly:
- Line 670: `<div className="text-[11px] font-bold uppercase...">` — active JSX with `newOrders.length` in template literal
- Line 680: `<span className="text-[11px]...">` — active JSX with `inProgressOrders.length`
- Line 708: `<div className="text-[11px]...">` — active JSX with `readyOrders.length`

Same for B3 lines 1281-1319 — all live code, not commented.

**Root cause of Codex error:** Codex likely found a different version of the file or misidentified a comment block. The file at `pages/StaffOrdersMobile/staffordersmobile.jsx` has no `/* ... */` block spanning lines 670-785.

**Impact:** Codex's "Rewrite needed" ratings for Fix1 and Fix4 are based on this false premise and should be disregarded.

---

## Agreed (both found)

### Fix 3 — Star badge stopPropagation
- **CC rating:** 5/5 CLEAR
- **Codex rating:** 5/5 CLEAR (only fix Codex rated correctly)
- **Consensus:** Both agree Fix3 is well-specified. Lines 2249-2252 (star), 2259-2262 (free) verified correct. Pattern matches existing 2255 (lock button). No changes needed.

---

## CC only (Codex missed or got wrong)

### Issue 1: Fix2 Change 3 — `filteredGroups` code snippet breaks useMemo structure

**CC finding (Codex missed):** The prompt says "REPLACE lines 3792-3801 with:" and gives code starting with `const filteredGroups = orderGroups.filter(group => {`. But lines 3789-3801 in the actual file are:
```javascript
const filteredGroups = useMemo(() => {     // line 3789
  if (!orderGroups) return [];              // line 3790
                                            // line 3791
  return orderGroups.filter(group => {      // line 3792
    ...                                     // lines 3793-3800
  });
}, [orderGroups, activeTab, getStatusConfig, activeRequests]);  // line 3801
```

The replacement code starts with `const filteredGroups = orderGroups.filter(...)` — if taken literally, this would:
1. Create a DUPLICATE `const filteredGroups` declaration (original `useMemo` wrapper remains)
2. LOSE the `useMemo` optimization
3. Line 3801 includes the useMemo dependency array closing `}, [deps])` — replacement code doesn't account for this

**Recommendation:** Change the replacement code to show ONLY the filter body (`return orderGroups.filter(group => { ... });`) and explicitly note "This goes INSIDE the existing useMemo at line 3789". Or better: specify "Replace lines 3792-3800" (not 3801 which has the dep array).

**Severity:** BLOCKER-level ambiguity for Fix2.

### Issue 2: Per-section header format gap between Fix1 and Fix4

Current B1/B3 per-section headers (lines 692, 1303) show:
```javascript
`${section.label} (${section.rowCount})`
```
No guest count at all. Fix1 lists 10 specific lines but NONE of them are per-section headers in B1/B3 (692, 1303). Fix4 "Rules per section" says headers should include `uniqueGuests(section.orders)` but doesn't list specific line changes for 692/1303.

**Result:** Neither Fix1 nor Fix4 explicitly owns adding `uniqueGuests(section.orders)` to B1/B3 per-section headers. The implementor must infer this from the cross-Fix interaction described in Fix1 ("Per-section headers dopo Fix4 получают uniqueGuests(section.orders)") + Fix4 "Rules per section" target format. This is underspecified.

**Recommendation:** Add lines 692, 1303 to Fix4's explicit line-change list, with BEFORE/AFTER showing the header format change from `${section.label} (${section.rowCount})` to `${section.label} (${uniqueGuests(section.orders)} guests · ${section.rowCount} dishes)`.

**Severity:** WARNING — could be missed by implementor.

### Issue 3: B2/B4 section header format after migration

After migrating B2/B4 from `subGroups.map` to `inProgressSections.map`, the prompt says use `section.label` (was `cfg.label`). But what header COUNT format? Current B2 shows `${subGroupLabel} (${orders.length})` — just a simple count. Should B2/B4 adopt the full `guests · dishes` format from "Rules per section"? The prompt implies yes but never explicitly provides the target template for B2/B4 per-section headers.

**Severity:** Minor ambiguity.

### Issue 4: File naming inconsistency

The prompt says "RELEASE source: `260413-00 StaffOrdersMobile RELEASE.jsx` (4524 lines)" but this file does NOT exist in the folder. Available files:
- `staffordersmobile.jsx` (4524 lines) — this is the correct working copy
- `260408-00 StaffOrdersMobile RELEASE.jsx` — latest dated release

The YAML `code_file` correctly says `staffordersmobile.jsx`, but the textual reference could confuse.

**Severity:** Nit (YAML header is correct).

---

## Codex only (CC missed) — evaluated

### Codex: Fix2 targets wrong location (activeOrders filter is upstream)
**Codex claim:** "The proposed fix location is not the real root cause... Patching only filteredGroups will not restore a card that never reaches orderGroups."

**CC evaluation:** Codex is PARTIALLY RIGHT but misread the prompt. The prompt DOES include Change 2 targeting `activeOrders` at line 3540:
```
// BEFORE (line 3540)
return o.status !== 'served' && o.status !== 'closed' && o.status !== 'cancelled';
// AFTER
return o.status !== 'closed' && o.status !== 'cancelled';
```
This is the PRIMARY fix — it keeps `served` orders in `visibleOrders` so `orderGroups` includes them. Change 3 (`filteredGroups` + `tabCounts`) is the SECONDARY fix ensuring the group stays in the Active tab. Codex missed Change 2 in its analysis but correctly identified that the upstream filter is the root cause. The prompt IS addressing both levels.

**Verdict:** NOT a valid issue — prompt already handles this correctly via Change 2.

### Codex: Fix4 — "wrapper already removed in active code"
**Codex claim:** "The active table-card render already uses root-level `inProgressSections.map(...)`. There is no outer wrapper there."

**CC evaluation:** WRONG. Lines 677-703 clearly show:
- Line 678: Outer `<div>` wrapper
- Lines 679-681: `<button>` with `setInProgressExpanded` toggle — this IS the "В РАБОТЕ" wrapper header
- Line 683: `{inProgressExpanded && (...)}` — conditional rendering
- Lines 685-699: `inProgressSections.map(...)` nested INSIDE the wrapper

The wrapper EXISTS and needs removal. Codex's analysis was based on the incorrect premise that this code is commented out.

**Verdict:** NOT a valid issue — Codex error from wrong file reading.

### Codex: Missing test case for regression check
**Codex valid point:** "Verify table card remains in Active tab after all orders served." This IS a good addition to the regression checklist. The existing checklist has "Закрыть стол button appears on ALL_SERVED tables and moves card to Completed tab" but doesn't explicitly verify the card STAYS in Active tab before closing.

**Verdict:** Valid minor improvement — add to regression checklist.

---

## Disputes (disagree)

### Fix1 Rating
- **CC:** 4.5/5 CLEAR — all 10 lines verified, grep patterns comprehensive
- **Codex:** 1/5 Rewrite needed (based on false "commented-out code" premise)
- **Resolution:** CC is correct. Codex's analysis is based on a factual error. **CC rating stands: 4.5/5**

### Fix2 Rating
- **CC:** 3.5/5 WARNING — Change 3 has useMemo structure ambiguity
- **Codex:** 1/5 Rewrite needed (partly valid concern about upstream filter, but missed Change 2)
- **Resolution:** CC identified a more specific and actionable issue (useMemo wrapper confusion). **CC rating stands: 3.5/5 — needs Fix2 Change 3 code snippet correction**

### Fix4 Rating
- **CC:** 4/5 WARNING — per-section header format underspecified
- **Codex:** 1/5 Rewrite needed (based on false "commented-out code" premise)
- **Resolution:** CC is correct. **CC rating stands: 4/5 — needs explicit per-section header line changes**

---

## Summary Table

| Fix | CC Rating | Codex Rating | Final Rating | Status |
|-----|-----------|-------------|--------------|--------|
| Fix1 | 4.5/5 | 1/5 (wrong) | **4.5/5** | CLEAR — minor cross-Fix dependency note |
| Fix2 | 3.5/5 | 1/5 (partial) | **3.5/5** | WARNING — Change 3 useMemo snippet |
| Fix3 | 5/5 | 5/5 | **5/5** | CLEAR |
| Fix4 | 4/5 | 1/5 (wrong) | **4/5** | WARNING — per-section header gap |

**Target: all 4 Fix must reach >= 4/5.** Fix2 is at 3.5/5 — still below threshold.

---

## Required Patches to Reach 4/5 on All Fixes

### Patch A (Fix2 BLOCKER): Fix Change 3 filteredGroups code snippet
Replace the current "REPLACE lines 3792-3801 with:" section. The code should show:
1. Only the inner filter body (NOT `const filteredGroups = ...`)
2. Explicitly note "Replace the filter callback INSIDE the existing useMemo (lines 3789-3801)"
3. Or change target lines to "3792-3800" (exclude 3801 which has the dep array)
4. Add note: "useMemo dependency array at line 3801 does NOT need new deps — getStatusConfig already covers hasServedButNotClosed inputs"

### Patch B (Fix4 minor): Add explicit per-section header format changes
Add to Fix4 B1 section:
- "Line 692: Change `${section.label} (${section.rowCount})` to `${section.label} (${uniqueGuests(section.orders)} ... · ${section.rowCount} ...)`"
Add to Fix4 B3 section:
- "Line 1303: Same change as line 692"
Add to Fix4 B2/B4 section:
- Specify whether B2/B4 after migration should use simple or full header format

### Patch C (nit): Fix file reference
Change "RELEASE source: `260413-00 StaffOrdersMobile RELEASE.jsx`" to match actual filename.

### Patch D (nit): Add regression check line
Add to Regression Check: "After 'Выдать все (N)': table card remains in Active tab with green ОБСЛУЖЕНО badge (not disappeared)"
