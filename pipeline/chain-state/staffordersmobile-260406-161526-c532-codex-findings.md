# Codex Reviewer Findings — ПССК Prompt Quality Review
Chain: staffordersmobile-260406-161526-c532

## Issues Found
1. [CRITICAL] Destructive integrity guard and shell-specific commands — The prompt tells the executor to run `wc -l` and, if the result is below a threshold, immediately overwrite the target file from a RELEASE copy. That is unsafe and brittle: line count is a weak integrity signal, the restore step can silently discard newer work, and the command examples assume Unix tooling (`wc`, `cp`, `grep`, `head`) rather than a shell-agnostic workflow.  
PROMPT FIX: Replace this with a non-destructive guard such as: "If the file length differs materially from expectation, stop and report instead of overwriting automatically." Use the full repo-relative path in command examples and either provide PowerShell equivalents or say "use your shell's equivalent command."

2. [CRITICAL] Two-step request flow assumes backend support that the prompt never verifies — Fix 4 introduces `status='accepted'` and `assigned_at`, and depends on accepted requests staying visible until they become `done`. The prompt never requires verifying that `accepted` is a valid `ServiceRequest` status, that `assigned_at` already exists in the schema, or that active-request queries/filters include accepted requests. If any of those assumptions are wrong, the implementation will fail or violate the "no data model changes" rule.  
PROMPT FIX: Add a prerequisite step: "Before editing UI, verify that `ServiceRequest` already supports `accepted`, `done`, `assignee`, and `assigned_at`, and that active request queries treat `accepted` as active. If any field/status is missing, stop and report instead of inventing schema changes."

3. [CRITICAL] Request state logic is keyed off `assignee` instead of `status` — The prompt's conditional UI and bulk logic use `!request.assignee` vs `request.assignee` to decide between "Принять" and "Выдать". That can misclassify legacy data, requests accepted by another waiter, or requests with an assignee set but a non-accepted status. The same fix already defines `status` as the workflow state, so using `assignee` as the source of truth is a prompt bug.  
PROMPT FIX: Explicitly require all request-state UI and bulk conditions to branch on `request.status` (`new/open` vs `accepted` vs `done`), with `assignee` used only for display.

4. [CRITICAL] Inline toast spec conflicts with the existing per-order action model — Fix 7 says actions are per-order, but the toast should render "directly under the dish row" and be keyed by `undoToast.orderId`. If an order renders multiple dish rows, matching by `orderId` will place the same toast under multiple rows or under the wrong row. The prompt also references `{dishName}` and `{newStatusLabel}` without defining where those values come from in a per-order action flow.  
PROMPT FIX: Define a single toast anchor key that matches the acted UI element (for example `rowId` or `orderId + rowKey`), state exactly what label should be shown for a per-order action, and specify the source or mapping for `newStatusLabel`.

5. [MEDIUM] Mockup priority conflicts with scope lock — The prompt says the HTML mockup "wins" and the implementation "MUST match the layout, class names, and behavior", while the scope lock says to change only the listed fixes and not touch unrelated areas. Those rules can point in opposite directions and justify broad rewrites outside the intended patch scope.  
PROMPT FIX: Add an explicit priority rule: "Implement only Fixes 1-7. Use the mockup to resolve styling/details inside those fixes only. Do not rewrite unrelated hierarchy/classes just to mirror the mockup."

6. [MEDIUM] Dual-metric sample code violates the prompt's own counting rule — Fix 3 says "Do NOT change how `countRows` is calculated", but the provided `dualMetric()` snippet replaces that logic with `rows.length || orders.length`. That is not equivalent unless `countRows()` is trivial, and the prompt has not established that.  
PROMPT FIX: Change the sample to reuse the existing helper, for example: `const dishes = countRows(rows, orders.length);`, and state explicitly that dish count must continue to come from `countRows()`.

7. [MEDIUM] `assigned_at` handling is internally inconsistent — The prose says to write `assigned_at=new Date()`, while the later code snippet uses `new Date().toISOString()`. The prompt never states which type the Base44 entity expects. The same fix also assumes `effectiveUserId` is always available, but provides no fallback if it is missing.  
PROMPT FIX: State the exact expected type for `assigned_at` and the required fallback behavior for missing `effectiveUserId`, for example: "Use ISO string if the entity stores dates as strings; if `effectiveUserId` is unavailable, stop and report instead of writing an accepted request without assignee."

8. [MEDIUM] Close-table blocker redesign is under-specified — Fix 5 changes `closeDisabledReason` from a string into an array of `{ text, count, sectionRef }` and requires tappable scrolling, but it never defines where the refs come from, whether tapping should expand collapsed sections first, or whether counts should be based on rows, orders, or requests for each blocker type.  
PROMPT FIX: Fully define the blocker object shape, target refs, expansion behavior, and counting rules before asking for implementation. If scrolling depends on refs that do not yet exist, say to add them explicitly and where.

9. [MEDIUM] Bulk-button guidance is contradictory and missing mutation safeguards — Fix 6 says order-section bulk buttons need the "same logic as requests", then immediately says "No change needed for order bulk buttons." It also does not say whether bulk request mutations should be sequential, batched, or disabled while pending, which matters on a mobile app where double-taps are common.  
PROMPT FIX: Split this into two explicit instructions: "Requests: add conditional bulk button." "Orders: preserve existing behavior; no code change." Also specify pending/error behavior for bulk actions.

10. [MEDIUM] Validation steps do not cover the riskiest regressions — The post-fix checks are mostly grep-based, visual, or broad regression bullets. They do not require verifying that accepted requests remain visible after step 1, that mixed request states suppress the bulk button, that the inline toast appears only once under the acted element, or that the expanded mutation payload still works from every caller.  
PROMPT FIX: Add a focused validation matrix for Fixes 4-7, including `new -> accepted -> done`, mixed request states, assignee-pill rendering, close-blocker multi-item output, and inline-toast placement/timer/reset behavior.

11. [MEDIUM] Mobile verification has no execution path — The prompt mandates a 375px mobile-first check and several visual assertions, but it never explains how the executor is supposed to inspect the UI in this pipeline. In a CLI-only run, that requirement will either be skipped or push the agent into speculative CSS edits.  
PROMPT FIX: Provide the exact preview/test method for the page and viewport, or narrow this requirement to code-level checks when visual tooling is unavailable.

12. [MEDIUM] The prompt conflicts with repo-wide i18n rules — It explicitly says to keep hardcoded Russian strings in `HALL_UI_TEXT` and add new strings there. In this repository, the loaded review rules say all user-facing strings should use `t('key')`. That conflict can cause hesitation during implementation and guaranteed noise during review.  
PROMPT FIX: Add an explicit exception note approved for this file, or rewrite the prompt so the string strategy matches the repo's i18n rules.

13. [LOW] Location guidance is too brittle for a 4333-line file — The prompt relies heavily on approximate line numbers and weak grep anchors such as `text-blue-600` or `onCloseRequest(request.id, "done")`. In a large file with duplicated render blocks, that makes it easy to change the wrong spot or miss one of the copies.  
PROMPT FIX: Use stable anchors based on function/component names plus nearby JSX labels, or include short surrounding code excerpts instead of raw class-name searches.

14. [LOW] Verification command examples use inconsistent paths/tooling — The final grep block runs against `staffordersmobile.jsx` from the current directory, but the target file elsewhere is `pages/StaffOrdersMobile/staffordersmobile.jsx`. The block also assumes Bash piping with `grep` and `head`.  
PROMPT FIX: Use the full repo-relative path in every command example and keep the commands shell-agnostic or provide explicit alternatives per shell.

15. [LOW] Fix order is only partially specified — The prompt calls out Fix 4 before Fix 6, but other dependencies remain implicit: Fix 5 needs section refs/targets after the render structure is settled, and Fix 7 changes toast ownership/state in ways that can be affected by earlier render edits.  
PROMPT FIX: Add a concrete sequence such as: 1) section order/render anchors, 2) visual/header changes, 3) request mutation flow, 4) request bulk logic, 5) close-blocker refs/list, 6) inline toast relocation, 7) regression pass.

## Summary
Total: 15 issues (4 CRITICAL, 8 MEDIUM, 3 LOW)

## Additional Risks
- This is a large single-file patch against a 4333-line component with duplicated compact/expanded render paths. Without an explicit "diff both blocks side-by-side" checkpoint, it is easy to fix one path and miss the other.
- The prompt treats several "verified via grep" claims as settled facts. If even one of those anchors is stale, the executor may confidently patch the wrong location.
- If the HTML mockup diverges from production component boundaries or data hooks, "match class names and component hierarchy exactly" can push the agent toward a partial rewrite instead of a contained patch.

## Prompt Clarity (MANDATORY — do NOT skip)
- Overall clarity: 3/5
- What was most clear: The UX intent of each numbered fix, the target file, and the warning that compact and expanded render paths both exist.
- What was ambiguous or could cause hesitation: The request status model, whether `accepted` and `assigned_at` already exist, mockup-vs-scope priority, close-blocker scroll behavior, inline-toast anchoring, and how the executor is supposed to perform mobile visual validation.
- Missing context: Valid `ServiceRequest` status values/fields, current active-request filtering rules, where section refs should live, expected bulk-mutation behavior, and the exact tool path for visual verification.
