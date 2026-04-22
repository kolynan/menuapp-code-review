You are the Claude reconcile writer for MenuApp pipeline V7.

Task ID: task-260315-044356-pipeline
Workflow: code-review
Page: Pipeline
Budget: 15 USD
Repository: C:\Dev\menuapp-code-review
Working tree: C:\Dev\menuapp-code-review\.pipeline\runs\task-260315-044356-pipeline\worktrees\wt-merge
Target code file: 
BUGS.md: 
README.md: 
Summary file to write before you finish: C:\Dev\menuapp-code-review\.pipeline\runs\task-260315-044356-pipeline\artifacts\cc-reconcile-summary.md

Task instructions:
START

Auto-approve all file edits, terminal commands, git operations, and network access without asking. Do not ask for confirmation on any step. Execute autonomously until the task is fully complete. At the end, write a section "## Permissions Requested" listing every permission you would have asked for if auto-approve was not enabled.

## Task: Full V7 audit — fix MAX_PATH crash + find all potential bugs + create test script

This is a THREE-PART task. Complete all parts.

### Context: Critical bug blocking ALL pipeline tasks

Every V7 task currently FAILS because `Copy-V7ArtifactsToResults` in V7.Common.ps1 copies worktree files to `C:\Users\ASUS\Dev\Claude AI Cowork\pipeline\results\task-...\worktrees\wt-merge\pages\_ux-discussions\` — and some filenames are extremely long (139+ chars). Combined with the deep results path, total path exceeds Windows MAX_PATH (260 chars).

Error log:
```
Copy-Item : Could not find a part of the path 'C:\Users\ASUS\Dev\Claude AI Cowork\pipeline\results\task-260314-194301-pipeline\worktrees\wt-merge\pages\_ux-discussions\UX_Discussion_partnerhome-dashboard-usability-empty-states-mobile-action-priority-information-density_S260314-135321-partnerhome.md.tmp-2dfbd60106c841369b9ddadaf5ef8c80'
```

The `.tmp-[guid]` suffix from `Write-V7FileWithRetry` makes it even longer.

### PART 1: Fix MAX_PATH crash (CRITICAL)

1. In `Copy-V7ArtifactsToResults` (V7.Common.ps1): before copying each file, check if total destination path length > 240 chars. If so, truncate the FILENAME (not directory) to fit under 240 total, preserving the extension.

2. In `Write-V7FileWithRetry` (V7.Common.ps1): the temp path `$tempPath = "$SourcePath.tmp-$([Guid]::NewGuid().ToString())"` adds 41 chars. If this would exceed 240 chars, use a SHORTER temp suffix (e.g., `.tmp` with no GUID, or use a temp dir instead).

3. In ux-discussion workflow: wherever the UX Discussion filename is generated, add a MAX LENGTH of 80 chars for the topic slug. Truncate longer topics. Check ALL places that generate UX Discussion filenames — search for `UX_Discussion_` across all V7 scripts.

4. Find and rename (git mv) the existing long file in the repo if it exists:
   `pages/_ux-discussions/UX_Discussion_partnerhome-dashboard-usability-empty-states-mobile-action-priority-information-density_S260314-135321-partnerhome.md`
   Rename to: `UX_Discussion_partnerhome-dashboard_S260314.md`

### PART 2: Full audit of ALL V7 scripts

Read EVERY .ps1 file in `pipeline/v7/scripts/` and look for:

1. **Path length issues** — any string concatenation that could exceed MAX_PATH
2. **Uninitialized variables** — any `$script:` or `$global:` used before assignment
3. **Missing error handling** — bare `Copy-Item`, `Move-Item`, `Remove-Item` without `-ErrorAction` or try/catch
4. **Hardcoded paths** that assume OneDrive location (should use config)
5. **Race conditions** — concurrent file access without locks or retries
6. **PowerShell 5.1 incompatibilities** — methods that don't exist in PS 5.1
7. **Any other bugs or fragile patterns** you can find

For each issue found, FIX IT immediately. Don't just report — fix.

### PART 3: Create Test-V7Pipeline.ps1

Create `pipeline/v7/scripts/Test-V7Pipeline.ps1` that tests ALL V7 helper functions at runtime.

Requirements:
- Dot-source `V7.Common.ps1` from the same directory
- Test ALL exported functions: Test-V7HasProperty, Write-V7Json, Write-V7FileWithRetry, Invoke-V7Git, New-V7Worktree, Remove-V7Worktree, Copy-V7ArtifactsToResults, etc.
- Print PASS/FAIL for each test, exit 0 if all pass, exit 1 if any fail
- Work on PowerShell 5.1
- Include path length tests: verify that Copy-V7ArtifactsToResults handles files with 200+ char names
- Include all test cases from this list:

Test-V7HasProperty:
- hashtable existing key → True
- hashtable missing key → False
- PSCustomObject existing property → True
- PSCustomObject missing property → False
- OrderedDictionary existing key → True
- OrderedDictionary missing key → False
- $null input → False
- nested PSCustomObject from ConvertFrom-Json → True
- empty hashtable → False

Write-V7Json:
- Write JSON to temp file, read back, verify no BOM (first 3 bytes != EF BB BF)
- Write JSON, verify valid JSON (ConvertFrom-Json succeeds)

Invoke-V7Git:
- 'status' succeeds
- invalid command returns error gracefully (no crash)

Path safety:
- Copy-V7ArtifactsToResults with a file that has 200-char name → no crash
- Write-V7FileWithRetry with a path near MAX_PATH → no crash

Static analysis:
- No .Contains( calls outside Test-V7HasProperty
- No .ContainsKey( calls anywhere
- No [System.Text.Encoding]::UTF8 (BOM-producing) calls

### PART 4: Write audit report

Create `pipeline/v7/AUDIT_REPORT_S127.md` with:
- List of ALL bugs found (numbered)
- What was fixed and how
- What was NOT fixed and why
- Files modified (with line numbers)
- Git diff summary

This report allows us to review your changes and rollback if needed.

### Known PowerShell 5.1 Pitfalls (MUST READ)

- NEVER use .Contains() or .ContainsKey() on ANY object. Use Test-V7HasProperty from V7.Common.ps1.
- NEVER use [System.Text.Encoding]::UTF8 — it adds BOM. Use [System.Text.UTF8Encoding]::new($false).
- NEVER use raw `& git` or `git -C` — use Invoke-V7Git from V7.Common.ps1.
- NEVER use $args as variable name — reserved in PowerShell.
- NEVER use --max-cost-dollars for Claude CLI — correct flag is --max-budget-usd.
- ConvertFrom-Json returns PSCustomObject (NOT Hashtable) in PS 5.1.
- $PSBoundParameters is PSBoundParametersDictionary (NOT Hashtable).
- Initialize ALL $script: variables before first use.
- Use Write-V7FileWithRetry for file writes in queue/ and results/ dirs (OneDrive lock protection).

### Validation (MUST pass before commit)

1. PowerShell parser check:
   Get-ChildItem pipeline/v7/scripts/*.ps1 | ForEach-Object { $errs = $null; $null = [System.Management.Automation.Language.Parser]::ParseFile($_.FullName, [ref]$null, [ref]$errs); if ($errs) { Write-Host "FAIL: $($_.Name) - $($errs[0].Message)" } else { Write-Host "OK: $($_.Name)" } }

2. Runtime test (MANDATORY):
   powershell.exe -ExecutionPolicy Bypass -File pipeline/v7/scripts/Test-V7Pipeline.ps1
   ALL tests must pass. If any fail — fix and re-run.

3. Grep audit:
   Select-String -Path pipeline/v7/scripts/*.ps1 -Pattern '\.Contains\(|\.ContainsKey\(' | Where-Object { $_.Line -notmatch 'function Test-V7HasProperty' -and $_.Line -notmatch '\$InputObject' -and $_.Line -notmatch '#' } | ForEach-Object { Write-Host "FAIL: $_" }

### Git

git add pipeline/v7/scripts/V7.Common.ps1 pipeline/v7/scripts/Test-V7Pipeline.ps1 pipeline/v7/scripts/Start-TaskSupervisor.ps1 pipeline/v7/scripts/Invoke-ClaudeWriter.ps1 pipeline/v7/scripts/Invoke-CodexReviewer.ps1 pipeline/v7/scripts/Invoke-ClaudeSynthesizer.ps1 pipeline/v7/scripts/Invoke-ClaudeAnalyst.ps1 pipeline/v7/scripts/Invoke-CodexWriter.ps1 pipeline/v7/scripts/Merge-ParallelWrite.ps1 pipeline/v7/AUDIT_REPORT_S127.md
git commit -m "fix: V7 full audit — MAX_PATH fix, bug fixes, runtime tests S127"
git push

END

Rules:
- Work only inside the assigned working tree.
- Do not launch Codex or any other external AI tool. The supervisor owns orchestration.
- Update the target page, BUGS.md, and README.md when appropriate for this task.
- Keep changes scoped to the task.
- Prefer one clean git commit in this worktree. If you do not commit, the supervisor may auto-commit your final diff.
- Before finishing, write a concise markdown summary to C:\Dev\menuapp-code-review\.pipeline\runs\task-260315-044356-pipeline\artifacts\cc-reconcile-summary.md with: files changed, main fixes, tests or checks run, and any follow-up risk.
Reviewer findings to address:
{"overall_status":"needs_changes","summary":"Found 5 new issues in the V7 audit patch: one silent artifact-loss bug, two blocking runtime-test regressions, one temp-file race, and one default-path regression.","findings":[{"priority":"P1","title":"Artifact copy still suppresses source enumeration failures","file":"pipeline/v7/scripts/V7.Common.ps1","line":1146,"description":"`Copy-V7ArtifactsToResults` still enumerates `LocalRunDir` with `Get-ChildItem ... -ErrorAction SilentlyContinue`. If a source artifact hits a locked-path or MAX_PATH error, the function now skips it silently instead of failing the run. That turns the original path-length crash into silent data loss.","suggested_fix":"Use `-ErrorAction Stop` for the file enumeration and either fail the stage or log/report each skipped file explicitly.","already_in_bugs_md":false},{"priority":"P1","title":"The new long-path copy test cannot create its own source fixture inside a pipeline worktree","file":"pipeline/v7/scripts/Test-V7Pipeline.ps1","line":213,"description":"This test writes a 200-character filename under `$repoRoot\\.p7-$PID`. In an actual `.pipeline/runs/.../worktrees/...` checkout, that source path is already over the Windows limit; in this review worktree it was 302 characters, and the mandated `powershell.exe -ExecutionPolicy Bypass -File pipeline/v7/scripts/Test-V7Pipeline.ps1` run failed here before `Copy-V7ArtifactsToResults` was exercised.","suggested_fix":"Create the long-name source fixture under a short temp root (for example `%TEMP%`) and only make the destination path exceed the safe limit.","already_in_bugs_md":false},{"priority":"P2","title":"Git helper tests depend on the current checkout already being marked as safe.directory","file":"pipeline/v7/scripts/Test-V7Pipeline.ps1","line":177,"description":"The new suite runs `Invoke-V7Git` against the current repo/worktree. In any sandboxed or CI checkout where Git sees a different owner, both the `status` test and the worktree round-trip fail with `detected dubious ownership` before the helper logic is validated. I reproduced this by running the required test command in this review worktree.","suggested_fix":"Run the git tests against a temporary repo created by the script, or pass `-c safe.directory=<repo>` for the test invocations.","already_in_bugs_md":false},{"priority":"P2","title":"Short `.tmp` fallback reintroduces temp-file collisions for concurrent writes","file":"pipeline/v7/scripts/V7.Common.ps1","line":272,"description":"When the GUID form would exceed the length budget, `Get-V7RetryTempPath` falls back to `<leaf>.tmp`. Repeated calls for the same destination return the exact same temp path, so concurrent `Write-V7FileWithRetry` or `Copy-V7FileWithRetry` operations can clobber each other's temp file or bounce on the lock retry loop.","suggested_fix":"Keep a unique temp filename in a short temp directory, or use a hashed per-destination subdirectory so the fallback remains collision-free.","already_in_bugs_md":false},{"priority":"P2","title":"Default queue/results root was changed to another machine-local path","file":"pipeline/v7/scripts/V7.Common.ps1","line":7,"description":"The patch replaces the documented OneDrive-based `onedrive_root` with `C:\\Users\\ASUS\\Dev\\Claude AI Cowork`. `pipeline/v7/README.md`, `pipeline/v7/MIGRATION.md`, and the sample task/status schemas still point queue/results at OneDrive, so any run without an override config will watch and copy the wrong folder tree.","suggested_fix":"Keep the documented OneDrive default, or move this machine-specific root into external config/environment instead of hardcoding it in `Get-V7DefaultConfig`.","already_in_bugs_md":false}],"missing_tests":["`Test-V7Pipeline.ps1` still does not exercise several exported helpers such as `Append-V7FileWithRetry`, `Copy-V7FileWithRetry`, `Move-V7PathWithRetry`, `Get-V7ResultsRoot`, and `Get-V7QueueRoot`, despite the task requirement to cover all exported functions.","No runtime test covers parent-directory-only overflow in `Get-V7PathLengthSafeDestination` or concurrent long-path writes/copies that hit the shared `.tmp` fallback."],"notes":["No `pipeline/BUGS.md` exists in this worktree, so all findings were treated as new.","PowerShell parser sweep on `pipeline/v7/scripts/*.ps1` passed.","Running `powershell.exe -ExecutionPolicy Bypass -File pipeline/v7/scripts/Test-V7Pipeline.ps1` in this review worktree failed in the git and long-path copy cases above.","This diff is PowerShell-only, so there were no React/mobile UX/accessibility/i18n deltas to review."]}

For reconcile mode, focus only on applying the reviewer findings that are supported by the code and task scope.