---
pipeline: v7
type: bugfix
page: Pipeline
budget: $15
---

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
