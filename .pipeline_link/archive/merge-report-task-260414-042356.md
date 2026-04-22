# Merge Report — PSSK v2: SOM Batch A КС Prompt Review

**Task:** task-260414-042356 | **Session:** S266 | **Date:** 2026-04-14

## Agreed (both CC and Codex found)

### 1. Source file naming inconsistency
- **Prompt yaml says** `code_file: pages/StaffOrdersMobile/staffordersmobile.jsx`
- **Prompt body says** `RELEASE source: 260413-00 StaffOrdersMobile RELEASE.jsx (4524 lines)`
- Both files are identical (verified `diff`), but the implementation КС should use ONE consistent name.
- **Impact:** Low (implementor can figure it out), but a PSSK should be unambiguous.
- **Fix:** Use `staffordersmobile.jsx` everywhere (it's the live file). Mention `260413-00` only as "snapshot reference."

### 2. Fix 3 is CLEAR
Both agree: Fix 3 (star badge stopPropagation) is minimal, line numbers correct, no ambiguity.

## CC only (Codex missed)

### 3. CRITICAL: `closeSession` is NOT used only in SOM
- **Prompt claim:** "closeSession is used ONLY in SOM (verified grep 2026-04-14)"
- **Reality:** `partnertables/260301-00 partnertables RELEASE.js` imports and calls `closeSession(id)` (lines 61, 1981)
- **Impact:** Adding bulk order close to `closeSession()` will also fire when admins close tables from partnertables. All orders for that session will be bulk-set to `status: 'closed'`.
- **Risk assessment:** Likely SAFE (closing orders when closing a table makes sense from partnertables too), but the prompt MUST acknowledge this cross-page impact and verify partnertables doesn't break.
- **Recommendation:** Either (a) add a comment in the prompt acknowledging partnertables usage and asserting it's safe, OR (b) create a separate `closeSessionWithOrders(sessionId)` wrapper that SOM calls, keeping original `closeSession` untouched.

### 4. Fix1: B6 branch uses different i18n pattern
- B1/B3 use `HALL_UI_TEXT.guests` — grep catches these (6 hits)
- B6 (lines 2331, 2333, 2335, 2337) uses hardcoded `"гость", "гостя", "гостей"` — grep for `HALL_UI_TEXT.guests` MISSES these
- **Fix:** Add second grep to verification: `grep -n 'pluralRu.*гост' staffordersmobile.jsx`

### 5. Fix1: Header says "6 EXACT PLACES" but actual total is 10
- B1: 3 places (670, 680, 708)
- B3: 3 places (1281, 1291, 1319)
- B6: 4 places (2331, 2333, 2335, 2337)
- **Fix:** Change header to "10 places in 3 render branches (6 in B1+B3, 4 in B6)"

### 6. Fix2: Change 3 — "Decision for implementor" is underspecified
- The `filteredGroups` and `tabCounts` fix says "Decision for implementor" — but КС prompts should not leave architectural choices to the implementor.
- Provide ONE clear approach with exact code for both `filteredGroups` (lines 3792-3801) and `tabCounts` (lines 3804-3818).

### 7. Fix4: B2/B4 should use `inProgressSections`, not raw `subGroups`
- B2 (761-769) and B4 (1374-1398) currently use `subGroups.map(...)` which gives raw `{sid, orders, cfg}` objects
- B1/B3 and B6 (reference model line 2333) use `inProgressSections.map(...)` which adds `label`, `rowCount`, `bulkLabel`, `rows`
- **Prompt should specify:** after removing the wrapper, B2/B4 should switch from `subGroups` to `inProgressSections` for consistency with B6 reference model.

### 8. Fix1: `new Set` computed twice in pattern example
- The "AFTER" pattern calls `new Set(newOrders.map(o => getLinkId(o.guest))).size` twice in the same template literal — once for count, once for `pluralRu()`.
- The "Recommendation" to extract `uniqueGuests(orders)` should be REQUIRED, not optional.

## Codex only (CC missed)

### 9. Codex noted: `260306-05 RELEASE.jsx` is 4015 lines, not 4524
- Codex verified against the old `260306-05` file, found it's 4015 lines.
- The prompt correctly says 4524 lines (matching `staffordersmobile.jsx` / `260413-00`), but the `260306-05` reference in the task description is stale.
- **Impact:** Low — the prompt body uses `260413-00` and `staffordersmobile.jsx`. Just remove any `260306-05` references.

## Disputes (disagree)

None — CC and Codex largely agree on findings. Codex's S263 ratings (Fix1 ⚠️, Fix2 ❌, Fix3 ✅, Fix4 ❌) were for the previous draft. This v2 draft addresses many issues but the `closeSession` cross-page impact (finding #3) is new and critical.
