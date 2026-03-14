# S124 Changelog

## Files Changed

- `pipeline/v7/scripts/V7.Common.ps1`
- `pipeline/v7/scripts/Invoke-ClaudeAnalyst.ps1`
- `pipeline/v7/scripts/Invoke-ClaudeSynthesizer.ps1`
- `pipeline/v7/scripts/Invoke-ClaudeWriter.ps1`
- `pipeline/v7/scripts/Invoke-CodexAnalyst.ps1`
- `pipeline/v7/scripts/Invoke-CodexReviewer.ps1`
- `pipeline/v7/scripts/Invoke-CodexWriter.ps1`
- `pipeline/v7/scripts/Invoke-UxDiscussion.ps1`
- `pipeline/v7/scripts/Merge-ParallelWrite.ps1`
- `pipeline/v7/scripts/Start-TaskSupervisor.ps1`
- `pipeline/v7/DIAGNOSTIC_S124.md`
- `pipeline/v7/CHANGELOG_S124.md`

## Summary

### Bug 1: Codex silent death
- Restored all Codex launchers to stdin prompt mode using `-` and `-InputText`.
- Updated `Invoke-V7CommandToFiles` to write stdin as explicit UTF-8 bytes without BOM.
- Renamed launcher-local `$args` variables to non-automatic names such as `codexArgs`, `claudeArgs`, and `launcherArgs`.

### Bug 2: Supervisor property errors
- Added `Get-V7StateValue` and `Get-V7StateText` helpers.
- Replaced unsafe optional reads for `error`, `exit_code`, `merge_commit`, `writer_commit`, `codex_commit`, `output_file`, and `repo_output_file`.
- Switched several ordered-dictionary writes/reads to safer key/index or getter-based access.

### Bug 3: Dead process detection
- Added `Test-V7WorkerProcessAlive`.
- Updated `Wait-V7Launchers` to refresh process objects and verify live PIDs with `Get-Process`.
- Timeout termination now also uses the PID-backed liveness check.

## Validation Notes
- Parser sweep passed for all V7 PowerShell scripts.
- No remaining `$args =` assignments under `pipeline/v7/scripts/`.
- No remaining raw `.error` or `.exit_code` reads in `Start-TaskSupervisor.ps1`.
- `Invoke-CodexReviewer.ps1` now launches Codex with stdin prompt input again.
- The supervisor heartbeat loop now checks both process object state and actual PID presence.