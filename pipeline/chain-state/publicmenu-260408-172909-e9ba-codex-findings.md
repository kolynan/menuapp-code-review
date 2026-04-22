# Codex Reviewer Findings — ПССК Prompt Quality Review
Chain: publicmenu-260408-172909-e9ba

## Issues Found
1. [CRITICAL] Destructive preflight overwrite of `x.jsx` — Step 0 tells the executor to run `cp 'pages/PublicMenu/260408-01 PublicMenu x RELEASE.jsx' pages/PublicMenu/x.jsx` before any real verification. That can wipe unrelated local work in `pages/PublicMenu/x.jsx` and turns a read-only baseline check into a destructive file replacement. PROMPT FIX: replace the copy step with a read-only diff/verification step; if `x.jsx` does not match the named RELEASE closely enough, abort and ask for clarification instead of overwriting it.

2. [CRITICAL] The replacement JSX drops the `other` request error/retry path — In the actual RELEASE file, errored requests are rendered through `errorCopy` plus `handleRetry` in the ticket board (`5059-5083`), and `handleRetry` explicitly supports `row.type === 'other'` (`2697-2782`). The proposed new JSX only handles `errorKind` inside the 6-button grid for typed buttons; the `activeRequests.filter(r => r.type === 'other')` section renders plain orange rows with timer + cancel only. Combined with the prompt’s new generic fallback condition `!activeRequests.some(r => r.errorKind)`, an errored `other` row can lose both row-level retry UI and the generic error surface. PROMPT FIX: add an explicit error state for `other` rows with `handleRetry(row)`, or preserve one shared error-state renderer for both typed and `other` requests.

3. [MEDIUM] Shell instructions assume Unix tools in a PowerShell repo context — The prompt hard-codes `cp`, `wc -l`, and `grep` as execution steps, but this repository/session is Windows PowerShell. Even if some aliases exist, prompt execution should not depend on shell-specific assumptions. PROMPT FIX: either declare `bash` as a prerequisite for the task or provide PowerShell-safe equivalents such as `Copy-Item`, `(Get-Content ...).Count`, and `Select-String`.

4. [MEDIUM] One deletion anchor does not match the real code — Fix 5b says the `HELP_CHIPS` block ends with ``], []);`` at line `1880`. In the actual RELEASE file, the block ends at line `1880` as ``], [tr]);``. That means the prompt’s literal anchor is wrong even though the start line is right. PROMPT FIX: correct the closing snippet to ``], [tr]);`` or instruct deletion by symbol/block name only instead of quoting the wrong terminator.

5. [MEDIUM] The prompt sneaks in an unscoped behavior change to the generic error fallback — The current file renders the generic error only when `helpSubmitError && !ticketRows.some((row) => row.errorKind)` (`5218-5219`). The proposed replacement changes that to `!activeRequests.some(r => r.errorKind)` without any explanation. That is not neutral cleanup; it changes when the generic fallback is suppressed. PROMPT FIX: preserve the existing `ticketRows` condition unless the prompt explicitly wants this behavior change and adds a validation step for it.

6. [MEDIUM] The mobile tap-target requirement conflicts with the proposed cancel buttons — The prompt’s mandatory mobile check says touch targets must be at least `44x44`, but the proposed `✕` buttons are `w-[22px] h-[22px]`. Because the active tiles are intentionally inert `div`s, the cancel tap area is still 22x22 in practice. PROMPT FIX: make the cancel buttons at least 44x44 or keep the visual icon small inside a larger clickable wrapper.

7. [LOW] The grid dimensions are described ambiguously — The prose repeatedly says “6 buttons 3×2,” but the prescribed JSX is `grid-cols-2`, which produces 2 columns by 3 rows. That mismatch can cause hesitation or an incorrect layout if the implementer follows the prose instead of the snippet. PROMPT FIX: rewrite the prose to “2 columns × 3 rows on mobile (`grid-cols-2`).”

8. [LOW] `URGENCY_STYLES` placement is internally contradictory — Step 2.5 calls `URGENCY_STYLES` a “module-level constant,” but also tells the executor to insert it “AFTER SOS_BUTTONS,” and Step 2 places `SOS_BUTTONS` after `HELP_URGENCY_GROUP` inside the component. The prompt is forcing the reader to choose between module scope and component scope. PROMPT FIX: choose one placement explicitly; module scope is cleaner because `URGENCY_STYLES` is static.

9. [LOW] The RELEASE file-length anchor is already stale — The prompt says `260408-01 PublicMenu x RELEASE.jsx` has `5457` lines, but the actual file currently has `5458`. The later `±1` tolerance prevents a hard failure, but it weakens confidence in the prompt’s exact line references. PROMPT FIX: update the baseline to `5458` and describe the line numbers as approximate anchors, not exact truth.

## Summary
Total: 9 issues (2 CRITICAL, 4 MEDIUM, 3 LOW)

## Additional Risks
- The prompt’s verification is strong on grep counts but weak on the highest-risk runtime regressions. It should explicitly validate a failed `other` request, retry from that state, and the red-urgency cancel-confirm path.
- The prompt asks for a large pasted JSX replacement but does not require any syntax/parsing check after the paste. A malformed JSX tag would survive the current grep-only verification.
- If `x.jsx` differs from the named RELEASE for legitimate reasons, the current prompt gives no safe reconciliation path other than overwriting it.

## Prompt Clarity (MANDATORY — do NOT skip)
- Overall clarity: 3/5
- What was most clear: Scope lock, fix ordering (`Fix 3` before `Fix 5`), and the exact Help Drawer region to replace are described well.
- What was ambiguous or could cause hesitation: The shell assumption, the “3×2” wording vs `grid-cols-2`, the incorrect `HELP_CHIPS` closing snippet, and whether `URGENCY_STYLES` belongs at module scope or inside the component.
- Missing context: A safe fallback when `x.jsx` is not identical to the RELEASE file, the intended shell/runtime for command examples, and explicit instructions for preserving `other`-request error/retry behavior.
