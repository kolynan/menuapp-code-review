# Review: Start-TaskSupervisor.ps1 heartbeat UX

Commit reviewed: `123a416`
File: `pipeline/v7/scripts/Start-TaskSupervisor.ps1`
Date: `2026-03-16`

## Checklist

1. PASS - Reviewed the full diff with `git diff HEAD~1`.
   The requested heartbeat change is isolated to `Start-TaskSupervisor.ps1`; the repo also has unrelated working-tree changes outside the pipeline script.

2. PASS - Repeated `Update-V7TelegramCodeReviewStateFromArtifacts -OverallState 'RUNNING'` calls do not overwrite already-completed worker states during normal code-review execution.
   In `Update-V7TelegramCodeReviewStateFromArtifacts`, each worker checks the artifact result file first and only falls back to the process state when the result file is absent. For example, the writer/reviewer branches at lines 955-985 prefer `claude-writer.result.json` / `codex-reviewer.result.json` over the still-`running` process info recorded in `$Status.processes` while the parallel wait loop is active. That means a finished writer stays `OK` even if the reviewer is still running.

3. FAIL - Passing an empty `$ArtifactsDir` can crash this new heartbeat path.
   `Update-V7TelegramCodeReviewStateFromArtifacts` immediately does `Join-Path $ArtifactsDir ...` at lines 947-949 with no empty-path guard. In PowerShell 5.1, `Join-Path '' 'claude-writer.result.json'` throws `Cannot bind argument to parameter 'Path' because it is an empty string.` I verified that directly. The older helper `Update-CodeReviewWorkerLinesFromArtifacts` does have a guard for blank/missing artifact paths, but the new heartbeat call bypasses that protection.

4. PASS - A 2-minute heartbeat is unlikely to create a Telegram rate-limit problem.
   `Invoke-V7TelegramScript` edits the existing message when possible and skips the API call entirely when the rendered text matches `last_text` (lines 1468-1474). Also, the existing 15-second progress-refresh path at lines 1881-1883 already dominates the edit cadence, so this diff does not materially increase Telegram traffic.

5. PASS - No direct side effects on `parallel-write` or `ux-discussion` were found.
   The new behavior is guarded by `if ($Workflow -eq 'code-review')` at lines 1867-1870, while the existing `parallel-write` heartbeat branch and the workflow-specific renderer switch remain unchanged.

## Concerns / Suggestions

- Add a guard or fallback before the new heartbeat call. The safest fix is to resolve `$ArtifactsDir` from `$Status.paths.artifacts_dir` when the parameter is blank, and return early if the resolved directory is still blank or missing.
- The new pre-heartbeat call is redundant with the later `Invoke-V7TelegramScript` call. That path already renders code-review rich state through `New-V7TelegramMessageText -> New-V7WorkflowTelegramMessageText -> Update-V7TelegramRichStateFromArtifacts`. Once the artifacts-dir guard is fixed, you may be able to remove the extra pre-call unless persisting worker lines to `status.json` before the Telegram edit is a deliberate requirement.

## Overall Verdict

REQUEST CHANGES

Reason: checklist item 3 fails. The new heartbeat block is not defensive against an empty `$ArtifactsDir`, and that path throws before the Telegram heartbeat update can run.
