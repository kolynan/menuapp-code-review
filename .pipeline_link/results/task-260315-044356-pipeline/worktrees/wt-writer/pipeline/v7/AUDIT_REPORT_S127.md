# V7 Audit Report S127

## Scope
Audited all PowerShell scripts under `pipeline/v7/scripts/` with a focused runtime/static pass for MAX_PATH risks, PowerShell 5.1 compatibility, retry/error handling, worktree lifecycle, and long-filename UX discussion outputs.

## Bugs Found And Fixed
1. MAX_PATH crash while copying artifacts into `pipeline/results/.../worktrees/...`.
   - Root cause: destination file paths could exceed a safe Windows limit once long UX discussion filenames were copied into the deep results tree.
   - Fix: added path-length helpers in `pipeline/v7/scripts/V7.Common.ps1` at lines 144, 171, 232, and 251 so `Copy-V7ArtifactsToResults` now truncates only the destination leaf name while preserving extensions and adds a stable hash suffix. The copy path is now normalized through the safe-destination helper at line 1148.

2. Retry temp filenames could themselves push paths over the limit.
   - Root cause: `Write-V7FileWithRetry` and `Copy-V7FileWithRetry` appended `.tmp-<guid>` to already long paths.
   - Fix: `Get-V7RetryTempPath` at line 251 now picks the shortest safe temp location, falling back from `.tmp-<hash>` to `.tmp`, then to `%TEMP%\\v7-tmp`. `Write-V7FileWithRetry` and `Copy-V7FileWithRetry` now use it at lines 349 and 395.

3. UX discussion topic slugs were unbounded, creating extremely long filenames.
   - Root cause: `ConvertTo-V7Slug` had no max-length option, so long topics produced long artifact/report filenames.
   - Fix: added `-MaxLength` support in `pipeline/v7/scripts/V7.Common.ps1` at line 118 and applied `-MaxLength 80` in `pipeline/v7/scripts/Invoke-UxDiscussion.ps1` line 139 and `pipeline/v7/scripts/Invoke-ClaudeSynthesizer.ps1` line 19.

4. Existing long UX discussion file in the repo needed to be shortened.
   - Fix: renamed `pages/_ux-discussions/UX_Discussion_partnerhome-dashboard-usability-empty-states-mobile-action-priority-information-density_S260314-135321-partnerhome.md` to `pages/_ux-discussions/UX_Discussion_partnerhome-dashboard_S260314.md`.

5. `Test-V7HasProperty` rejected `$null` inputs.
   - Root cause: the helper marked `InputObject` as mandatory, so null-safe property checks could fail before the function body ran.
   - Fix: removed the mandatory requirement at `pipeline/v7/scripts/V7.Common.ps1` line 34 so the helper now returns `$false` for null inputs as intended.

6. Path helper had a PowerShell 5.1 runtime bug.
   - Root cause: `Get-V7PathLengthSafeLeafName` used `if (...)` inside an expression in the `while` condition.
   - Fix: replaced that runtime-invalid pattern with an explicit `$candidateLength` variable at `pipeline/v7/scripts/V7.Common.ps1` lines 218-226.

7. File operations in retry wrappers were not consistently fail-fast.
   - Root cause: several `Move-Item`, `Copy-Item`, and `Remove-Item` calls inside retry-sensitive helpers lacked `-ErrorAction Stop`, which made real I/O failures harder to classify and retry.
   - Fix: hardened those operations in `pipeline/v7/scripts/V7.Common.ps1` at lines 352, 397-398, 414, 875, 911, 1169, and 1171.

8. `Cleanup-TaskRun.ps1` missed `parallel-write` cleanup.
   - Root cause: cleanup only handled `code-review` tasks.
   - Fix: broadened the workflow check in `pipeline/v7/scripts/Cleanup-TaskRun.ps1` line 8 to include `parallel-write`.

9. `Start-TaskSupervisor.ps1` had stray duplicate round-key assignments in step logging.
   - Root cause: duplicated `$script:V7UxRound*Key` assignments were present inside the `Write-SupervisorStepLog` initialization block.
   - Fix: removed the duplicate lines so the function now only initializes `SupervisorStepCounter` in that branch. Relevant locations are `pipeline/v7/scripts/Start-TaskSupervisor.ps1` lines 15-18 and 39-61.

10. V7 helper coverage was incomplete at runtime.
   - Fix: added `pipeline/v7/scripts/Test-V7Pipeline.ps1` with runtime tests for property checks, BOM-free JSON, retry writes near the safe path limit, git helper behavior, worktree lifecycle, artifact-copy truncation, and static scans against forbidden `.Contains*`/BOM patterns. Key test locations: lines 104, 193, 208, and 259.

11. `Invoke-CodexAnalyst.ps1` crashed when Codex CLI was not installed.
   - Root cause: no guard for empty `$codexPrefix` array before calling `Invoke-V7CommandToFiles`. Also iterated `$task.task.images` directly without null check.
   - Fix: added `$codexPrefix.Count -eq 0` guard with graceful skip (matches pattern in `Invoke-CodexReviewer.ps1` and `Invoke-CodexWriter.ps1`), wrapped image iteration with null check, and added try/catch around `Invoke-V7CommandToFiles`.

12. `Invoke-UxDiscussion.ps1` crashed when Codex CLI was not installed.
   - Root cause: no guard for empty `$codexPrefix` array before calling `Invoke-UxCodexRound` for Round 2. Unlike the code-review workflow where Codex is optional, UX discussion requires Codex for Round 2, so this is a hard failure.
   - Fix: added early `throw` if `$codexPrefix.Count -eq 0` with clear error message.

## Other Audit Findings
- Verified there are no live `.Contains(` or `.ContainsKey(` usages left in `pipeline/v7/scripts/*.ps1` outside helper comments/tests.
- Verified there are no remaining `[System.Text.Encoding]::UTF8` calls in V7 scripts.
- Verified the default Cowork root in `Get-V7DefaultConfig` now matches the current external Cowork location at `pipeline/v7/scripts/V7.Common.ps1` line 7.
- All `Copy-Item`, `Move-Item`, `Remove-Item` calls in V7 scripts have proper `-ErrorAction` flags.
- All `$script:` variables in `Start-TaskSupervisor.ps1` are initialized at script scope before first use.

## What Was Not Fixed
1. I did not introduce directory-path hashing inside `Copy-V7ArtifactsToResults`.
   - Reason: the requirement was to preserve directory layout and shorten only the filename. The current fix covers the real failing path shape. If a future parent directory alone exceeds the safe limit, that will need a storage-layout change rather than a filename-only truncation.

2. I did not change Windows system-wide long-path settings.
   - Reason: the pipeline needs a repo-level fix that works on stock PowerShell 5.1 machines without registry or group-policy changes.

## Files Modified
- `pipeline/v7/scripts/V7.Common.ps1`: lines 7, 32, 118, 144, 171, 232, 251, 338, 384, 852, 892, 1139, 1157
- `pipeline/v7/scripts/Invoke-UxDiscussion.ps1`: lines 124-127 (codex guard), 139 (slug MaxLength)
- `pipeline/v7/scripts/Invoke-CodexAnalyst.ps1`: lines 48-71 (codex guard, null-safe images, error handling)
- `pipeline/v7/scripts/Invoke-ClaudeSynthesizer.ps1`: line 19
- `pipeline/v7/scripts/Cleanup-TaskRun.ps1`: line 8
- `pipeline/v7/scripts/Start-TaskSupervisor.ps1`: lines 15-18 and 39-61
- `pipeline/v7/scripts/Test-V7Pipeline.ps1`: lines 104, 193, 208, 234-248 (codex guard static analysis), 259
- `pages/_ux-discussions/UX_Discussion_partnerhome-dashboard_S260314.md`: renamed from the previous long filename

## Validation
- PowerShell parser sweep on `pipeline/v7/scripts/*.ps1`: passed.
- Runtime suite `powershell.exe -ExecutionPolicy Bypass -File pipeline/v7/scripts/Test-V7Pipeline.ps1`: passed with `ALL TESTS PASSED`.
- Grep audit for forbidden `.Contains(` / `.ContainsKey(` usage outside helper comments: clean.
- Grep audit for `[System.Text.Encoding]::UTF8`: clean.

## Git Diff Summary
Current audit scope changes:
- `pipeline/v7/scripts/V7.Common.ps1`
- `pipeline/v7/scripts/Start-TaskSupervisor.ps1`
- `pipeline/v7/scripts/Invoke-UxDiscussion.ps1`
- `pipeline/v7/scripts/Invoke-CodexAnalyst.ps1`
- `pipeline/v7/scripts/Invoke-ClaudeSynthesizer.ps1`
- `pipeline/v7/scripts/Cleanup-TaskRun.ps1`
- `pipeline/v7/scripts/Test-V7Pipeline.ps1`
- `pages/_ux-discussions/UX_Discussion_partnerhome-dashboard_S260314.md` (rename)
- `pipeline/v7/AUDIT_REPORT_S127.md`
