---
pipeline: v3
type: code-review
page: pipeline-v7
budget: $12
---
# V7 Pipeline Smoke Test — 4 fixes needed

## Context
We're trying to run V7 pipeline for the first time (smoke test). The watcher v7.1 (`scripts/task-watcher.py`) dispatches tasks with `pipeline: v7` frontmatter to the PowerShell supervisor (`pipeline/v7/scripts/Start-TaskSupervisor.ps1`). Three attempts failed. Fix all issues and run a successful smoke test.

## Problem 1: ContainsKey → Contains (ALREADY PARTIALLY FIXED)
**File:** `pipeline/v7/scripts/Start-TaskSupervisor.ps1` lines 176-184
**Error:** `[OrderedDictionary] does not contain a method named 'ContainsKey'`
**Cause:** `Get-V7TaskParts` returns metadata as `[ordered]@{}` (OrderedDictionary). Windows PowerShell 5.1 OrderedDictionary has `.Contains()` not `.ContainsKey()`.
**Fix:** Replace ALL `.ContainsKey(` with `.Contains(` in ALL `.ps1` files under `pipeline/v7/scripts/`. The fix was applied to `Start-TaskSupervisor.ps1` and `V7.Common.ps1` but verify it's correct and check ALL other ps1 files too.

## Problem 2: UTF-8 BOM in config
**File:** `scripts/task-watcher-config.json`
**Error:** `JSONDecodeError: Unexpected UTF-8 BOM`
**Fix:** In `scripts/task-watcher.py`, function `load_config()`, change the file open encoding from `'utf-8'` to `'utf-8-sig'`. This safely handles both BOM and non-BOM files. Find the line:
```python
with source.open(encoding="utf-8") as handle:
```
Change to:
```python
with source.open(encoding="utf-8-sig") as handle:
```

## Problem 3: Verify watcher → supervisor parameter passing
**File:** `scripts/task-watcher.py`
Verify that the watcher correctly passes these parameters to the PowerShell supervisor:
- `-TaskFile` (path to claimed task.md)
- `-TaskType`, `-TaskPage`, `-TaskBudget`, `-TaskTopic`, `-TaskAgent` (from frontmatter)
- `-RepoRoot` (repo directory)
- `-ConfigPath` (config json path)

Check that the PowerShell command construction is correct and all parameters are properly quoted (paths with spaces!).

## Problem 4: Smoke test validation
After fixes, create a test task file at `pipeline/queue/v7-smoke-validate.md`:
```yaml
---
pipeline: v7
type: code-review
page: PublicMenu
budget: $10
---
This is a V7 smoke test. Review pages/PublicMenu/base/ files for React best practices.
Update BUGS.md and README.md.
git add pages/PublicMenu/ && git commit -m "test: V7 smoke test S116" && git push
```

Then do a DRY RUN validation:
1. Run `python -c "from scripts import ..."` or a small test script that:
   - Parses the test task frontmatter
   - Confirms `determine_pipeline()` returns `"v7"`
   - Confirms the supervisor PowerShell command would be constructed correctly
   - Confirms the config loads without errors
2. Run `powershell -Command "& { . pipeline/v7/scripts/V7.Common.ps1; Write-Host 'V7.Common loaded OK' }"` to verify Common loads
3. Run a syntax check on the supervisor: `powershell -Command "Get-Content pipeline/v7/scripts/Start-TaskSupervisor.ps1 | Out-Null; Write-Host 'Syntax OK'"`

## ОБЯЗАТЕЛЬНО в конце:
```
git add scripts/task-watcher.py scripts/task-watcher-config.json pipeline/v7/scripts/*.ps1 pipeline/queue/v7-smoke-validate.md
git commit -m "fix: V7 smoke test issues — ContainsKey, BOM, parameter passing S116"
git push
```
