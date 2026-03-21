# Review: Start-TaskSupervisor.ps1 heartbeat UX v2

Commits reviewed: `123a416`, `abe9c83`
File: `pipeline/v7/scripts/Start-TaskSupervisor.ps1`
Date: `2026-03-16`

## Checklist

1. PASS - The empty-`ArtifactsDir` guard now prevents the PS 5.1 crash in the new heartbeat branch.
   The added condition at lines 1867-1869 only calls `Update-V7TelegramCodeReviewStateFromArtifacts` when `$ArtifactsDir` is not blank. I also verified the guard behavior directly with an empty string: the guarded branch skips the `Join-Path` call that previously threw on PS 5.1.

2. PASS - Repeated `Update-V7TelegramCodeReviewStateFromArtifacts -OverallState 'RUNNING'` calls do not overwrite completed worker states.
   In `Update-V7TelegramCodeReviewStateFromArtifacts`, each worker checks its result JSON first and only falls back to process state when the result file is absent. That means a finished writer or reviewer stays `OK`/`SKIPPED`/`FAILED` even while another worker is still running.

3. PASS - The 2-minute heartbeat should not create a Telegram rate-limit problem.
   `Invoke-V7TelegramScript` edits the existing message when possible and skips the API call entirely when the newly rendered text matches `last_text` (lines 1468-1474). Also, the existing 15-second progress refresh loop already drives a much higher potential edit cadence than the 2-minute heartbeat.

4. PASS - No workflow-specific regression was found for `parallel-write` or `ux-discussion`.
   The new worker-visibility refresh is still gated by `if ($Workflow -eq 'code-review')`. The only shared behavior change is the intentional global heartbeat cadence moving from 5 minutes to 2 minutes.

5. PASS - No unintended changes were found in the reviewed `Start-TaskSupervisor.ps1` commit scope.
   The file-scoped diff for `HEAD~2..HEAD` is limited to the two `AddMinutes(2)` edits plus the guarded `code-review` heartbeat refresh block. Note: the full `git diff HEAD~2` in this checkout also shows unrelated current working-tree changes in other files, but those are outside the reviewed heartbeat commits.

## Notes

- The fix addresses the specific crash path introduced by commit `123a416`.
- The richer worker visibility is also redundant with the later `Invoke-V7TelegramScript` render path, but it is harmless and keeps `status.json` worker lines current before the heartbeat edit.

## Overall Verdict

APPROVE
