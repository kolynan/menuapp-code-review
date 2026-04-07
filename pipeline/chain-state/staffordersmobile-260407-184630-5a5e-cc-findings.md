# CC Reviewer Findings — ПССК Prompt Quality Review Round 2
Chain: staffordersmobile-260407-184630-5a5e

## Issues Found

1. **[CRITICAL] Fix 2 ЗАПРОСЫ — `handleAcceptAllRequests` / `handleServeAllRequests` do not exist.**
   The prompt's Fix 2 bulk bar for ЗАПРОСЫ uses `onClick={allNew ? handleAcceptAllRequests : handleServeAllRequests}`, but these functions do NOT exist anywhere in the file. `grep -n "handleAcceptAllRequests\|handleServeAllRequests" staffordersmobile.jsx` returns empty. The current code at line 2212 uses inline callbacks: `tableRequests.forEach(r => onCloseRequest(r.id, 'accepted', {...}))` and `tableRequests.forEach(r => onCloseRequest(r.id, 'done'))`.
   **PROMPT FIX:** Replace with inline callbacks matching the existing pattern:
   ```jsx
   onClick={allNew
     ? () => tableRequests.forEach(r => onCloseRequest(r.id, "accepted", { assignee: effectiveUserId, assigned_at: new Date().toISOString() }))
     : () => tableRequests.forEach(r => onCloseRequest(r.id, "done"))}
   disabled={isRequestPending}
   ```
   Also change `disabled={advanceMutation.isPending}` to `disabled={isRequestPending}` — requests use `isRequestPending`, not `advanceMutation.isPending` (see existing code at line 2212).

2. **[CRITICAL] Fix 6 new keys — `newShort` and `readyShort` already exist with DIFFERENT values.**
   The prompt says to add 10 keys including `newShort: "Нов."` and `readyShort: "Гот."` — but these already exist at lines 309 (`newShort: "Новые"`) and 311 (`readyShort: "Готово"`). Adding them again at line 342 would silently override the existing values. This breaks legacy summary items at lines 1994-1995 which use `HALL_UI_TEXT.newShort` ("Новые") and `HALL_UI_TEXT.readyShort` ("Готово") for `hallSummaryItems` — consumed by `renderHallSummaryItem` in legacy paths (lines 537, 594, 1149, 1205). Legacy paths will display "Нов." instead of "Новые" — an unintended side effect that violates SCOPE LOCK ("do NOT modify existing JSX" in legacy paths — changing their data source is equivalent).
   **PROMPT FIX:** Two options:
   - **Option A (recommended):** Use different key names for short chip labels: `newChipShort: "Нов."`, `readyChipShort: "Гот."` — and update Fix 1 jumpChips to use these new keys.
   - **Option B:** Accept the override and document it explicitly as an intentional change to legacy summary labels. Add to SCOPE LOCK: "legacy summary labels will change from 'Новые'→'Нов.' and 'Готово'→'Гот.'"

3. **[CRITICAL] Fix 2 ГОТОВО bulk button — wrong `countRows` call signature.**
   The prompt shows: `{``${HALL_UI_TEXT.serveAll} (${countRows(readyOrders.length)})``}` — calling `countRows` with ONE argument. But `countRows` at line 1967 requires TWO arguments: `(rows, fallback)`. `readyOrders.length` is a number, not an array — `rows.filter(...)` will throw TypeError.
   **PROMPT FIX:** Change to `countRows(readyRows, readyOrders.length)` (matching the existing pattern at line 2218).

4. **[MEDIUM] Fix 6 close hint — `countMap` uses inline Russian strings, violating SCOPE LOCK.**
   The prompt's Fix 6 close hint code uses:
   ```js
   const countMap = {
     requests: `${tableRequests.length} запр.`,
     new: `${newOrders.length} нов.`,
     inProgress: `${inProgressOrders.length} в работе`,
     ready: `${readyOrders.length} гот.`,
   };
   ```
   The SCOPE LOCK explicitly says: "ALL new user-facing text MUST use HALL_UI_TEXT keys. No inline Russian strings outside HALL_UI_TEXT." The strings "запр.", "нов.", "в работе", "гот." are user-facing text not in HALL_UI_TEXT.
   **PROMPT FIX:** Either add these as HALL_UI_TEXT keys (e.g., `closeCountRequests`, `closeCountNew`, etc.) or simplify to just counts without abbreviated labels: `${tableRequests.length}` (the action verb already provides context).

5. **[MEDIUM] Fix 6 — React Fragment in `.map()` missing key.**
   The prompt uses `<>...</>` shorthand inside `closeDisabledReasons.map()`. React requires a `key` on each top-level element returned from `.map()`. The `<>` shorthand does NOT support keys — this will produce a React warning: "Each child in a list should have a unique 'key' prop."
   **PROMPT FIX:** Change `<>` to `<React.Fragment key={kind || i}>` and remove individual `key` props from inner `<span>` and `<button>` elements (they become unnecessary with Fragment key).

6. **[MEDIUM] Fix 6 new keys — `guests` and `dishes` are duplicates (same values).**
   `guests: "гост"` (line 341) and `dishes: "блюд"` (line 342) already exist. Adding them again is harmless (same values) but confusing and could signal to the executor that all 10 keys are new.
   **PROMPT FIX:** Remove `guests` and `dishes` from the "10 new keys" list. State clearly: "Add these 6 NEW keys (the other 4 — `newShort`, `readyShort`, `guests`, `dishes` — already exist)."

7. **[MEDIUM] Fix 6 — wrong line number for "last key."**
   Prompt says "Add these 10 keys after the last key in HALL_UI_TEXT (line 341, before `};`)". Actually, line 341 is `guests`, line 342 is `dishes`, line 343 is `};`. The last key is at line 342.
   **PROMPT FIX:** Change to "after line 342 (`dishes`), before `};` at line 343."

8. **[LOW] Fix 1 — `setIsExpanded(true)` timing with `scrollToSection`.**
   The chip onClick calls `setIsExpanded(true)` then immediately `scrollToSection(chip.kind)`. But `setIsExpanded` is async (React state update) — sections may not be mounted yet when `scrollToSection` runs (refs will be null). This could cause scroll to silently fail.
   **PROMPT FIX:** Use `requestAnimationFrame` or `setTimeout(..., 0)` for scrollToSection:
   ```jsx
   onClick={(e) => {
     e.stopPropagation();
     setIsExpanded(true);
     requestAnimationFrame(() => scrollToSection(chip.kind));
   }}
   ```
   Or add a note that `scrollToSection` already handles null refs gracefully (if it does — verify).

9. **[LOW] Fix 2 — НОВЫЕ section button text computation is duplicated.**
   Fix 2's НОВЫЕ bulk button recalculates `getOrderActionMeta(newOrders[0]).willServe` inline. This is fine functionally but is a repeat of logic already available. Minor DRY concern only.

10. **[LOW] Fix 4 — dual metric consistency note.**
    The prompt correctly notes that `servedOrders.length` counts individual dish-orders (not unique guests) due to split-order architecture. However, Fix 3's inProgress subsections use `section.orders.length` for the same purpose. These are consistent, but a brief inline comment in the prompt's "NOTE" section clarifying this for the executor would reduce hesitation.

## Line Number Verification
| Reference | Prompt says | Actual | Status |
|-----------|------------|--------|--------|
| HALL_UI_TEXT start | line 305 | line 305 | ✅ |
| HALL_UI_TEXT last key | line 341 | line 342 (`dishes`) | ❌ off by 1 |
| HALL_UI_TEXT `};` | before line 341 | line 343 | ❌ |
| `requestsShort` | line 307 | line 307 | ✅ |
| `getOrderActionMeta` | line 1902 | line 1902 | ✅ |
| `rowLabel` assignment | line 1910 | line 1910 | ✅ |
| `bulkLabel` assignment | line 1911 | line 1911 | ✅ |
| `nextLabel` computation | line 1904 | line 1904 | ✅ |
| `countRows` | line 1967 | line 1967 | ✅ |
| `hallSummaryItems` | line 1996 | line 1996 | ✅ |
| `inProgressSections` | line 1998 | line 1998 | ✅ |
| `closeDisabledReasons` | lines 2019-2027 | lines 2019-2027 | ✅ |
| `reasonToKind` | lines 2029-2034 | lines 2029-2034 | ✅ |
| `renderHallRows` | line 2075 | line 2075 (approx) | ✅ |
| Hall-mode render start | ~line 2175 | line 2175 | ✅ |
| Collapsed card summary | line 2183 | line 2183 | ✅ |
| ЗАПРОСЫ section | line 2212 | line 2212 | ✅ |
| НОВЫЕ section | line 2214 | line 2214 | ✅ |
| В РАБОТЕ wrapper | line 2216 | line 2216 | ✅ |
| ГОТОВО section | line 2218 | line 2218 | ✅ |
| ВЫДАНО section | line 2220 | line 2220 | ✅ |
| Close table area | line 2224 | line 2224 | ✅ |
| `scrollToSection` | line 1753 | line 1753 | ✅ |
| `renderHallSummaryItem` | line 2057 | line 2057 | ✅ |
| `renderHallSummaryItem` legacy usages | 537, 594, 1149, 1205 | 537, 594, 1149, 1205 | ✅ |
| `pluralRu` function | exists | line 1652 | ✅ |
| `formatHallMoney` function | exists | line 353 | ✅ |
| `ChevronDown` import | exists | line 167 | ✅ |
| File line count | 4407 | 4407 | ✅ |

## Fix-by-Fix Analysis

- **Fix 1 (Jump chips):** RISKY — `setIsExpanded(true)` + immediate `scrollToSection` race condition (issue #8). Otherwise well-structured with clear module-level constant, computation before JSX, and proper legacy preservation.
- **Fix 2 (Bulk buttons bottom):** RISKY — two bugs: (a) ЗАПРОСЫ references non-existent `handleAcceptAllRequests`/`handleServeAllRequests` (CRITICAL #1), (b) ГОТОВО wrong `countRows` call (CRITICAL #3). Fix these and it becomes SAFE.
- **Fix 3 (Remove В РАБОТЕ wrapper):** SAFE — well-structured replacement. Correctly preserves `inProgressExpanded` for legacy, attaches `inProgressSectionRef` to first item. `pluralRu` literal strings are justified.
- **Fix 4 (ВЫДАНО dual metric):** SAFE — simple isolated change, consistent with Fix 3 pattern.
- **Fix 5 (Button labels):** SAFE — minimal change (adding `nextLabel` to existing template literal), shared-helper impact is documented and acceptable.
- **Fix 6 (Close hint):** RISKY — React Fragment key missing (MEDIUM #5), inline Russian strings violate SCOPE LOCK (MEDIUM #4), duplicate dictionary keys with different values (CRITICAL #2).

## Summary
Total: 10 issues (3 CRITICAL, 4 MEDIUM, 3 LOW)

## Fix Clarity Ratings
- Fix 1: 4/5 (clear except scroll timing edge case)
- Fix 2: 2/5 (two critical bugs: nonexistent functions + wrong countRows signature)
- Fix 3: 5/5 (excellent — thorough, preserves legacy, justified exceptions)
- Fix 4: 5/5 (simple, clear, correct)
- Fix 5: 5/5 (minimal, well-documented shared impact)
- Fix 6: 3/5 (React Fragment key issue + SCOPE LOCK violation on inline strings + duplicate keys)

## Overall prompt score: 6/10
The prompt is well-structured with excellent context (data structures, FROZEN UX, SCOPE LOCK, execution order, verification steps). However, 3 CRITICALs prevent a passing score: non-existent function references (#1), dictionary key override with legacy side effects (#2), and wrong function signature (#3). After fixing these, the score would be 8-9/10.

## Prompt Clarity (MANDATORY)
- **Overall clarity: 4/5** — Very well-organized with clear sections, mockup references, and verification steps.
- **What was most clear:** Fix execution order rationale, FROZEN UX list, data structure documentation, legacy preservation instructions.
- **What was ambiguous or could cause hesitation:**
  - Fix 2 ЗАПРОСЫ bulk bar: executor will search for `handleAcceptAllRequests` and fail, causing significant hesitation and improvisation.
  - Fix 6 "10 new keys": executor may be confused when 4 of 10 keys already exist — will they skip or add duplicates?
  - Fix 1 `setIsExpanded` + `scrollToSection` timing: no guidance on whether scrollToSection handles null refs.
- **Missing context:**
  - Whether `scrollToSection` gracefully handles null/unmounted refs (for Fix 1 timing).
  - Explicit list of which keys are NEW vs EXISTING in the "10 new keys" block.
  - `isRequestPending` vs `advanceMutation.isPending` distinction for request actions (Fix 2 ЗАПРОСЫ uses wrong disabled prop).

## Additional Risks
1. **ChevronDown in section headers (Fix 2):** The prompt says "Replace with just `<ChevronDown .../>` (or `<span>></span>` if ChevronDown not imported)." But ChevronDown IS imported (line 167). The parenthetical fallback creates unnecessary ambiguity — remove it.
2. **Fix 3 opacity-60 on entire expanded content:** The mockup shows `opacity-0.6` on collapsed state, but Fix 3 applies `opacity-60` on expanded content div too. This dims the dish rows AND bulk button — verify this matches mockup intent.
3. **Count display for bill chip (Fix 1):** The bill chip uses `formatHallMoney(billData.total)` as `count` — this produces a formatted string like "6 239 ₸" which is then rendered as `{chip.label} {chip.count}` = "СЧЁТ 6 239 ₸". Verify this matches the mockup's "Счёт 6 239 ₸" — note HALL_UI_TEXT.bill is "СЧЁТ" (uppercase), but the mockup shows "Счёт" (sentence case). Minor visual mismatch.
