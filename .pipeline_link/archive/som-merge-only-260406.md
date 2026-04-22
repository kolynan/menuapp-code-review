---
task_id: som-merge-only-260406
page: StaffOrdersMobile
code_file: pages/StaffOrdersMobile/staffordersmobile.jsx
budget_usd: 10
runner: cc
type: standalone
---

=== STANDALONE MERGE TASK ===
Page: StaffOrdersMobile
Previous chain: staffordersmobile-260406-195641-c05c

You are the Merge step. The analysis is already done — use the existing findings.

INSTRUCTIONS:
1. Read the comparison: `pipeline/chain-state/staffordersmobile-260406-195641-c05c-comparison.md`
2. Read the discussion: `pipeline/chain-state/staffordersmobile-260406-195641-c05c-discussion.md`
3. Read the CC findings: `pipeline/chain-state/staffordersmobile-260406-195641-c05c-cc-findings.md`

**CRITICAL before reading code:**
Run `wc -l pages/StaffOrdersMobile/staffordersmobile.jsx`. Expected: 4333 lines.
If result is 4333 → proceed normally.
If result < 4300 → run `git checkout pages/StaffOrdersMobile/staffordersmobile.jsx` to restore, verify again, then proceed.
If still < 4300 after restore → STOP and report.

4. Apply ALL 20 fixes from CC findings (the discussion validated all of them as-is since Codex aborted).
   Apply in this mandatory order:
   1. Fix 1 — section reorder (CC finding #1)
   2. Fix 2 — active/passive visual weight (CC finding #2)
   3. Fix 3 — dual metric headers (CC findings #3, #4)
   4. Fix 4 — two-step requests (CC findings #5, #6, #7, #8, #9) — 3 P0 CRITICAL
   5. Fix 6 — bulk request buttons (CC findings #12, #13)
   6. Fix 5 — close-blocker array (CC findings #10, #11)
   7. Fix 7 — inline toast (CC findings #14, #15, #16, #17, #18, #19, #20)

**Key implementation notes from analysis:**
- THREE render blocks: compact (~500-710), expanded (~1100-1320), legacy (~2134-2153). ALL blocks.
- `HALL_UI_TEXT` at ~line 305 — approved i18n exception, add strings here.
- Fix 4 P0 #5: Add `"accepted"` to activeRequests filter at line 3310.
- Fix 4 P0 #6: Expand `updateRequestMutation` mutationFn to pass full payload (assignee, assigned_at).
- Fix 4 P0 #7: Fix `onCloseRequest` at line 4190 — stop hardcoding `'done'`.
- Fix 7: `undoToast` must be passed as PROP (not just `setUndoToast`) to OrderGroupCard. Render inline toast inside `renderHallRows` after last row of matching order.
- Pass `staffName` as new prop to OrderGroupCard for staff pill.

5. After applying all fixes:
   a. Update `pages/StaffOrdersMobile/BUGS.md` — mark fixed items
   b. git add pages/StaffOrdersMobile/staffordersmobile.jsx pages/StaffOrdersMobile/BUGS.md
   c. git commit -m "feat(StaffOrdersMobile): SOM Section Rework — lifecycle order, active/passive, dual metric, 2-step requests, staff pill, inline toast, close-blocker, bulk requests"
   d. git push

6. Write merge report to: `pipeline/chain-state/staffordersmobile-260406-195641-c05c-merge-report.md`

FORMAT:
# Merge Report — StaffOrdersMobile
Chain: staffordersmobile-260406-195641-c05c

## Applied Fixes
1. [P0] ... — DONE
...

## Skipped — Could Not Apply
(only if truly blocked, explain WHY in detail)

## Git
- Commit: <hash>
- Lines before: 4333
- Lines after: <count>

## Summary
- Applied: N fixes
- Skipped: N fixes
- Commit: <hash>

=== END ===
