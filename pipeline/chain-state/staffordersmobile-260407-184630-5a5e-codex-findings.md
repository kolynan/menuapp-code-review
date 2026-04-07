# Codex Reviewer Findings — ПССК Prompt Quality Review
Chain: staffordersmobile-260407-184630-5a5e

## Issues Found
1. [CRITICAL] `jumpChips` placement violates the prompt's own TDZ rule — Fix 1 says to insert `jumpChips` immediately after `hallSummaryItems`, but that snippet reads `inProgressSections`, which the prompt itself places later (`hallSummaryItems` at ~1996, `inProgressSections` at ~1998). That can create a temporal dead zone/runtime failure before render.  
PROMPT FIX: Change the anchor from "immediately after `hallSummaryItems`" to "after all inputs used by `jumpChips` are declared, including `inProgressSections`." Make the placement dependency-based, not line-based.

2. [CRITICAL] The ready-section bulk button snippet uses the wrong `countRows()` call — Fix 2 shows `countRows(readyOrders.length)`, while the same prompt consistently documents `countRows(rows, fallbackCount)` and already uses `countRows(readyRows, readyOrders.length)` elsewhere. As written, this can produce a wrong count or crash if `countRows` expects a rows array.  
PROMPT FIX: Replace the snippet with `countRows(readyRows, readyOrders.length)` and explicitly say all bulk-button counts must use the same helper signature.

3. [CRITICAL] The jump-chip tap flow is logically incomplete — The proposed chip handler calls `setIsExpanded(true); scrollToSection(chip.kind);` in the same event, but the comment says expansion must happen first so sections mount. In React, the state change is asynchronous, so first-tap scroll can easily run before refs exist. This directly threatens a stated acceptance criterion.  
PROMPT FIX: Instruct the executor to defer scrolling until after expansion has committed, for example via a pending target state + `useEffect`, `requestAnimationFrame`, or a callback inside `scrollToSection` that retries after mount.

4. [CRITICAL] Verification is too weak for a multi-branch JSX change set — The prompt edits several JSX blocks plus a shared helper used in all 3 render paths, but POST-TASK only asks for `grep`, `wc -l`, `git commit`, and `git push`. That is not enough to catch broken JSX, missing imports, bad hook ordering, or render regressions before shipping.  
PROMPT FIX: Require at least one syntax/render validation step before commit/push. If no test suite exists, explicitly require a lint/parse check and a manual smoke pass of hall-mode plus both legacy paths.

5. [MEDIUM] Fix 6 gives incorrect React key guidance — The snippet maps to `<>...</>` fragments, then says not to use keyed fragments and to place keys on the inner `<span>` and `<button>`. That does not satisfy React's list-key requirement because the mapped top-level node still has no key.  
PROMPT FIX: Tell the executor to return a keyed wrapper per iteration, e.g. `<React.Fragment key={...}>...</React.Fragment>` or another keyed parent element. If imports are locked, explicitly allow the needed fragment import or another keyed wrapper.

6. [MEDIUM] The prompt contradicts its own i18n rule in Fix 6 — Scope Lock says all new user-facing text must use `HALL_UI_TEXT`, but the close-hint snippet hardcodes new visible strings like `"запр."`, `"нов."`, `"в работе"`, and `"гот."` inside `countMap`. That leaves the executor choosing between violating i18n or expanding scope ad hoc.  
PROMPT FIX: Add these abbreviations to `HALL_UI_TEXT`, or declare a narrow exception for close-hint abbreviations in the prompt itself.

7. [MEDIUM] "`Mockup wins`" is stated too absolutely — Early instructions say mockup wins whenever it conflicts with the fix description, but Fix 6 later says the mockup's payment hint is illustrative only and must not be implemented because the backing blocker data does not exist. The product decision is reasonable, but the precedence rule is no longer absolute.  
PROMPT FIX: Rewrite the rule as: "Mockup wins unless it requires unavailable data, forbidden model changes, or conflicts with frozen behavior."

8. [MEDIUM] The prompt still relies too heavily on line numbers in a file that is being edited in sequence — Many directives point to exact lines like 2183, 2216, and 2224 even though earlier fixes will shift the file. In a 4407-line file with three similar render paths, that raises the risk of patching the wrong branch or stale location.  
PROMPT FIX: Use structural anchors first: nearby variable names, section labels, unique JSX snippets, and render-path identifiers. Keep line numbers as secondary hints only.

9. [LOW] Fix 5 assumes `nextLabel` is always present in shared helper output — The prompt says to change `rowLabel` to ``\u2192 ${nextLabel}`` across all render paths, but it does not state what to do if `config.actionLabel` is empty, already malformed, or missing for an edge stage. That can degrade into `"→ undefined"` in legacy paths.  
PROMPT FIX: Add a fallback requirement, e.g. only prefix with the arrow when `nextLabel` is non-empty; otherwise fall back to an approved label.

## Summary
Total: 9 issues (4 CRITICAL, 4 MEDIUM, 1 LOW)

## Additional Risks
- The shared-helper change in Fix 5 affects all 3 render paths, but the prompt does not define concrete visual acceptance criteria for legacy paths beyond "still render without errors."
- The close-hint counts are underspecified: some places use row counts, others use order counts, and the prompt does not explicitly standardize which unit the inline hint should display.
- The prompt asks the executor to match the mockup's classes closely, but it does not say how to resolve conflicts with existing local styling conventions if the file already uses slightly different patterns.

## Prompt Clarity (MANDATORY — do NOT skip)
- Overall clarity: 3/5
- Fix clarity ratings: Fix 1 = 2/5, Fix 2 = 3/5, Fix 3 = 4/5, Fix 4 = 4/5, Fix 5 = 3/5, Fix 6 = 2/5
- Overall prompt score: 6/10
- What was most clear: The intended UX outcomes, frozen areas, and the requested fix order are all explicit and easy to follow.
- What was ambiguous or could cause hesitation: Exact edit anchors after line drift, the real precedence between mockup vs. code constraints, the first-tap jump-chip scroll behavior, and the i18n exceptions around plural/abbreviated Russian text.
- Missing context: A reliable validation method before push, whether any existing lint/build command is available, and explicit fallback rules for shared-helper edge cases that affect legacy render paths.
