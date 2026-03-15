You are the Claude reconcile writer for MenuApp pipeline V7.

Task ID: task-260314-194301-pipeline
Workflow: code-review
Page: Pipeline
Budget: 10 USD
Repository: C:\Dev\menuapp-code-review
Working tree: C:\Dev\menuapp-code-review\.pipeline\runs\task-260314-194301-pipeline\worktrees\wt-merge
Target code file: 
BUGS.md: 
README.md: 
Summary file to write before you finish: C:\Dev\menuapp-code-review\.pipeline\runs\task-260314-194301-pipeline\artifacts\cc-reconcile-summary.md

Task instructions:
START

Auto-approve all file edits, terminal commands, git operations, and network access without asking. Do not ask for confirmation on any step. Execute autonomously until the task is fully complete. At the end, write a section "## Permissions Requested" listing every permission you would have asked for if auto-approve was not enabled.

## Task: Create Test-V7Pipeline.ps1 — runtime test for V7 helpers

Create a new file `pipeline/v7/scripts/Test-V7Pipeline.ps1` that tests ALL V7 helper functions at runtime. This script will be run at the end of every KP prompt to catch bugs before commit.

### Requirements

The script must:
1. Dot-source `V7.Common.ps1` from the same directory
2. Run a series of test cases
3. Print PASS/FAIL for each test
4. Exit with code 0 if all pass, code 1 if any fail
5. Work on PowerShell 5.1 (Windows default)

### Test cases to include

**Test-V7HasProperty:**
```
Test 1: hashtable with existing key → True
Test 2: hashtable with missing key → False
Test 3: PSCustomObject with existing property → True
Test 4: PSCustomObject with missing property → False
Test 5: OrderedDictionary with existing key → True
Test 6: OrderedDictionary with missing key → False
Test 7: $null input → False
Test 8: nested PSCustomObject (from ConvertFrom-Json) → True
Test 9: empty hashtable → False
```

**Write-V7Json + Read (if these helpers exist):**
```
Test 10: Write JSON to temp file, read back, verify no BOM (first 3 bytes != EF BB BF)
Test 11: Write JSON, verify valid JSON (ConvertFrom-Json succeeds)
```

**Invoke-V7Git (if exists):**
```
Test 12: Invoke-V7Git 'status' succeeds (exit code 0)
Test 13: Invoke-V7Git with invalid command returns error gracefully (no crash)
```

**General V7.Common.ps1 health:**
```
Test 14: No .Contains( calls outside Test-V7HasProperty function
Test 15: No .ContainsKey( calls anywhere
Test 16: No [System.Text.Encoding]::UTF8 (BOM-producing) calls
```

### Output format

```
=== V7 Pipeline Runtime Tests ===
[PASS] Test-V7HasProperty: hashtable existing key
[PASS] Test-V7HasProperty: hashtable missing key
[PASS] Test-V7HasProperty: PSCustomObject existing prop
...
[FAIL] Write-V7Json: BOM check — expected no BOM, got BOM
...
=== Results: 15/16 passed, 1 failed ===
```

### Self-test

After creating the file, RUN IT:
```powershell
powershell.exe -ExecutionPolicy Bypass -File pipeline/v7/scripts/Test-V7Pipeline.ps1
```

ALL tests must pass. If any fail — fix the issue in V7.Common.ps1 or the test, and re-run until 100% pass.

### Git

```
git add pipeline/v7/scripts/Test-V7Pipeline.ps1
git commit -m "test: add V7 pipeline runtime tests S126"
git push
```

END

Rules:
- Work only inside the assigned working tree.
- Do not launch Codex or any other external AI tool. The supervisor owns orchestration.
- Update the target page, BUGS.md, and README.md when appropriate for this task.
- Keep changes scoped to the task.
- Prefer one clean git commit in this worktree. If you do not commit, the supervisor may auto-commit your final diff.
- Before finishing, write a concise markdown summary to C:\Dev\menuapp-code-review\.pipeline\runs\task-260314-194301-pipeline\artifacts\cc-reconcile-summary.md with: files changed, main fixes, tests or checks run, and any follow-up risk.
Reviewer findings to address:
{"overall_status":"needs_changes","summary":"The S126 runtime-test deliverable is missing, and the current helpers still fail required cases for `$null` inputs and git execution in this worktree.","findings":[{"priority":"P1","title":"Required V7 runtime test harness was never added","file":"pipeline/v7/scripts/Test-V7Pipeline.ps1","line":null,"description":"`HEAD` does not contain `pipeline/v7/scripts/Test-V7Pipeline.ps1` at all. That means none of the requested PASS/FAIL checks, aggregate exit-code handling, or end-of-prompt regression gate for the V7 helpers exists.","suggested_fix":"Add the missing script under `pipeline/v7/scripts/`, dot-source `V7.Common.ps1`, implement all required helper/runtime checks, print the requested summary output, and exit with code 1 on any failure.","already_in_bugs_md":false},{"priority":"P2","title":"Test-V7HasProperty rejects null input before its own guard runs","file":"pipeline/v7/scripts/V7.Common.ps1","line":34,"description":"The helper declares `$InputObject` as mandatory without `[AllowNull()]`, so `Test-V7HasProperty -InputObject $null -Name 'x'` fails during parameter binding with `ParameterArgumentValidationErrorNullNotAllowed` before the explicit null check on line 38 executes. Required test case 7 therefore fails, and any nullable caller will crash instead of receiving `$false`.","suggested_fix":"Allow null at the parameter level, for example by adding `[AllowNull()]` to `$InputObject` (or by removing `Mandatory`), then keep the existing in-function null guard.","already_in_bugs_md":false},{"priority":"P2","title":"Invoke-V7Git fails the required status smoke test in task worktrees","file":"pipeline/v7/scripts/V7.Common.ps1","line":539,"description":"`Invoke-V7Git` shells out as `git -C <repo> ...` with no `safe.directory` handling. In this reviewer worktree, `git status --short` exits 1 with Git's \"detected dubious ownership\" error, so required test 12 does not pass and any runtime test script built on top of the current helper will fail under the same sandboxed user separation.","suggested_fix":"Invoke git with a scoped `-c safe.directory=<RepoRoot>` override in automation, or detect this specific failure and retry with that override before surfacing an error.","already_in_bugs_md":false}],"missing_tests":["No executable `pipeline/v7/scripts/Test-V7Pipeline.ps1` exists to cover the required Test-V7HasProperty, JSON, Invoke-V7Git, and V7.Common health checks.","No evidence of the required self-test run (`powershell.exe -ExecutionPolicy Bypass -File pipeline/v7/scripts/Test-V7Pipeline.ps1`) is present because the script itself is missing."],"notes":["No Pipeline-scoped `BUGS.md` exists in this worktree, so I compared against the available repo context only.","I validated the `$null` and `Invoke-V7Git status` behaviors directly in PowerShell 5.1 from this worktree."]}

For reconcile mode, focus only on applying the reviewer findings that are supported by the code and task scope.