---
pipeline: v7
type: bugfix
page: Pipeline
budget: $10
---

START

Auto-approve all file edits, terminal commands, git operations, and network access without asking. Do not ask for confirmation on any step. Execute autonomously until the task is fully complete. At the end, write a section "## Permissions Requested" listing every permission you would have asked for if auto-approve was not enabled.

## Task: Fix .Contains() crash on PSCustomObject in V7 scripts

**Problem:** ALL V7 tasks crash immediately with:
```
Cannot find an overload for "Contains" and the argument count: "1".
```

**Root cause:** `ConvertFrom-Json` in PowerShell 5.1 returns `PSCustomObject`, NOT `Hashtable`. PSCustomObject does NOT have `.Contains()` or `.ContainsKey()` methods. The V7 scripts use `.Contains('key')` throughout, which works on Hashtable but crashes on PSCustomObject.

**Fix:** Replace ALL `.Contains('key')` calls across ALL `pipeline/v7/scripts/*.ps1` files with the correct PSCustomObject-safe pattern:

```powershell
# WRONG (crashes on PSCustomObject):
if ($obj.Contains('key')) { ... }

# CORRECT (works on both PSCustomObject and Hashtable):
if ($obj.PSObject.Properties.Name -contains 'key') { ... }
```

**Recommended approach:** Create a helper function in `V7.Common.ps1`:

```powershell
function Test-V7HasProperty {
    param(
        [Parameter(Mandatory)] $InputObject,
        [Parameter(Mandatory)] [string] $Name
    )
    if ($null -eq $InputObject) { return $false }
    if ($InputObject -is [hashtable]) {
        return $InputObject.Contains($Name)
    }
    if ($InputObject -is [System.Collections.Specialized.OrderedDictionary]) {
        return $InputObject.Contains($Name)
    }
    # PSCustomObject or anything else
    return ($null -ne $InputObject.PSObject -and
            $InputObject.PSObject.Properties.Name -contains $Name)
}
```

Then replace EVERY `.Contains(` call in all V7 scripts with `Test-V7HasProperty`:

```powershell
# Before:
if ($status.Contains('error')) { ... }

# After:
if (Test-V7HasProperty $status 'error') { ... }
```

### Steps

1. Add `Test-V7HasProperty` to `V7.Common.ps1`
2. Find ALL `.Contains(` calls in ALL `pipeline/v7/scripts/*.ps1` files
3. Replace each one with `Test-V7HasProperty`
4. Also check for any `.ContainsKey(` that may have been missed — replace those too
5. Check for direct property access on optional fields that could also fail (e.g., `$obj.field` where field may not exist) — wrap with `Test-V7HasProperty` check or use `Get-V7StateValue`

### Validation (MUST pass before commit)

1. PowerShell syntax check:
   ```powershell
   Get-ChildItem pipeline/v7/scripts/*.ps1 | ForEach-Object { $errs = $null; $null = [System.Management.Automation.Language.Parser]::ParseFile($_.FullName, [ref]$null, [ref]$errs); if ($errs) { Write-Host "FAIL: $($_.Name) - $($errs[0].Message)" } else { Write-Host "OK: $($_.Name)" } }
   ```

2. Grep audit — ZERO matches expected for unsafe patterns:
   ```powershell
   Select-String -Path pipeline/v7/scripts/*.ps1 -Pattern '\.Contains\(' | Where-Object { $_.Line -notmatch 'function Test-V7HasProperty' -and $_.Line -notmatch '\$InputObject\.Contains' -and $_.Line -notmatch '# ' } | ForEach-Object { Write-Host "FAIL unsafe Contains: $_" }
   Select-String -Path pipeline/v7/scripts/*.ps1 -Pattern '\.ContainsKey\(' | ForEach-Object { Write-Host "FAIL ContainsKey: $_" }
   ```

3. Verify `Test-V7HasProperty` exists in V7.Common.ps1

4. Count replacements made — report how many `.Contains(` calls were replaced

### Git

```
git add pipeline/v7/scripts/*.ps1
git commit -m "fix: replace .Contains() with Test-V7HasProperty for PSCustomObject compat S126"
git push
```

END
