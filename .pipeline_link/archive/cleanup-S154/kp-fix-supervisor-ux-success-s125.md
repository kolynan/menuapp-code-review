START

Auto-approve all file edits, terminal commands, git operations, and network access without asking.
Do not ask for confirmation on any step.
Execute autonomously until the task is fully complete.
At the end, write a section "## Permissions Requested" listing every permission you would have asked for if auto-approve was not enabled.

## Task: Fix supervisor false-FAILED for ux-discussion workflow (KB-034)

### Bug description

The ux-discussion workflow completes successfully — all 3 rounds finish, `ux-discussion.result.json` shows `status: completed`, `exit_code: 0`, `merge_commit: 924f9a1`, and the result is committed to git. **But the supervisor marks the task as FAILED.**

The error is at `Start-TaskSupervisor.ps1` line ~2113:
```powershell
if (-not $uxDiscussionOk) { throw 'UX discussion workflow failed' }
```

`$uxDiscussionOk` remains `$false` even though the launcher completed successfully.

### Evidence from the real run

```
# ux-discussion.result.json (artifacts dir):
{
    "status": "completed",
    "exit_code": 0,
    "merge_commit": "924f9a136d955cfb7c2f0a57140ea6536a62de19",
    "commit_created": true
}

# But status.json shows:
{
    "state": "FAILED",
    "error": "UX discussion workflow failed",
    "processes": {
        "ux-discussion": { "state": "failed" }
    }
}
```

### Root cause to investigate

The supervisor determines `$uxDiscussionOk` from the process exit tracking, NOT from the launcher's result.json file. When the launcher process exits, the supervisor may not correctly capture the exit code (it shows `exit_code: null` in status.json despite the launcher reporting `exit_code: 0` in its result file).

### Fix approach

1. **Read** the ux-discussion section of `Start-TaskSupervisor.ps1` (around lines 2050-2130) to understand how `$uxDiscussionOk` is currently determined.

2. **Add a result.json fallback check.** After the launcher process ends and before the `if (-not $uxDiscussionOk)` check, read the `ux-discussion.result.json` file from the artifacts directory. If it exists and contains `"status": "completed"`, set `$uxDiscussionOk = $true`.

3. **Pattern:** Use `Get-V7StateValue` or similar safe accessor to read the result JSON:
```powershell
# Pseudocode — adapt to actual code structure:
$resultPath = Join-Path $artifactsDir 'ux-discussion.result.json'
if (Test-Path $resultPath) {
    $resultData = Get-Content $resultPath -Raw | ConvertFrom-Json
    if ($resultData.status -eq 'completed') {
        $uxDiscussionOk = $true
    }
}
```

4. **Apply the same pattern to code-review workflow** if it has a similar success-check. Grep for `throw.*workflow failed` in Start-TaskSupervisor.ps1 and check each one.

5. **Also fix the TG final message.** When the task actually succeeded (result.json says completed), the final TG message must show DONE, not FAILED. Check that the TG update code reads the correct success state.

### Affected files

- `pipeline/v7/scripts/Start-TaskSupervisor.ps1` — main fix (success determination + TG update)
- Any other V7 script that determines workflow success from process exit code instead of result.json

### Validation

1. **Syntax check:**
```powershell
Get-ChildItem pipeline/v7/scripts/*.ps1 | ForEach-Object { $null = [System.Management.Automation.Language.Parser]::ParseFile($_.FullName, [ref]$null, [ref]$null); Write-Host "OK: $($_.Name)" }
```

2. **Grep: find all `throw.*workflow failed` and verify each has a result.json fallback:**
```powershell
Select-String -Path pipeline/v7/scripts/Start-TaskSupervisor.ps1 -Pattern 'throw.*workflow failed' | ForEach-Object { Write-Host "Line $($_.LineNumber): $($_.Line.Trim())" }
```

3. **Readback:** Read the modified sections of Start-TaskSupervisor.ps1 and confirm the result.json check is present before the throw.

4. **Grep: no raw `.status` access without null check:**
```powershell
Select-String -Path pipeline/v7/scripts/Start-TaskSupervisor.ps1 -Pattern '\$resultData\.status' | ForEach-Object { Write-Host "Line $($_.LineNumber): $($_.Line.Trim())" }
```

### Git

```
git add pipeline/v7/scripts/Start-TaskSupervisor.ps1
git add -u pipeline/v7/scripts/
git commit -m "fix: supervisor reads result.json for ux-discussion success determination (KB-034) S125"
git push
```

## Permissions Requested
(KP fills this section at the end)

END
