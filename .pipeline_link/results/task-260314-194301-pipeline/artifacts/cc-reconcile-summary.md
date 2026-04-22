# Reconcile Summary — task-260314-194301-pipeline

## Files Changed

- `pipeline/v7/scripts/V7.Common.ps1` — 2 fixes
- `pipeline/v7/scripts/Test-V7Pipeline.ps1` — updated Test 7 for AllowNull behavior

## Fixes Applied (from reviewer findings)

### P2: Test-V7HasProperty rejects null input (V7.Common.ps1:34)
- Added `[AllowNull()]` attribute to `$InputObject` parameter so `$null` passes through to the in-function guard and returns `$false` instead of crashing with a parameter binding error.

### P2: Invoke-V7Git fails in worktrees due to dubious ownership (V7.Common.ps1:539)
- Added `-c safe.directory=$RepoRoot` to the git command arguments so automation worktrees don't trigger Git's ownership check.

### P1: Test-V7Pipeline.ps1 updated to match fixes
- Test 7 now expects a clean `$false` return from `Test-V7HasProperty -InputObject $null` instead of catching a parameter binding exception.

## Tests Run

All 16 tests pass:
```
=== V7 Pipeline Runtime Tests ===
[PASS] Test-V7HasProperty: hashtable existing key
[PASS] Test-V7HasProperty: hashtable missing key
[PASS] Test-V7HasProperty: PSCustomObject existing prop
[PASS] Test-V7HasProperty: PSCustomObject missing prop
[PASS] Test-V7HasProperty: OrderedDictionary existing key
[PASS] Test-V7HasProperty: OrderedDictionary missing key
[PASS] Test-V7HasProperty: null input returns false
[PASS] Test-V7HasProperty: nested PSCustomObject (ConvertFrom-Json)
[PASS] Test-V7HasProperty: empty hashtable
[PASS] Write-V7Json: no BOM in output file
[PASS] Write-V7Json: output is valid JSON
[PASS] Invoke-V7Git: git status succeeds
[PASS] Invoke-V7Git: invalid command throws gracefully
[PASS] V7.Common.ps1 health: no .Contains( outside Test-V7HasProperty
[PASS] V7.Common.ps1 health: no .ContainsKey( anywhere
[PASS] V7.Common.ps1 health: no BOM-producing [System.Text.Encoding]::UTF8
=== Results: 16/16 passed, 0 failed ===
```

## Follow-up Risk

- The `safe.directory` override is scoped per-invocation (not global git config), so it only affects pipeline automation. No risk to manual git usage.
- If Git changes `safe.directory` semantics in future versions, `Invoke-V7Git` callers could silently bypass ownership checks — low risk given the automation context.

## Permissions Requested

- File read: V7.Common.ps1, Test-V7Pipeline.ps1
- File edit: V7.Common.ps1, Test-V7Pipeline.ps1
- Bash: powershell.exe test execution, git add/commit, mkdir
