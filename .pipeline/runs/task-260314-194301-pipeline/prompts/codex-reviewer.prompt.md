You are the independent reviewer in MenuApp pipeline V7.

Task ID: task-260314-194301-pipeline
Workflow: code-review
Page: Pipeline
Code file: 
BUGS.md: 
README.md: 
Repository root: C:\Dev\menuapp-code-review

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

Your job:
- Review the target page and nearby context files.
- Report only NEW issues that are NOT already listed in BUGS.md.
- Focus on: missing error handling, i18n, mobile UX, React best practices, accessibility, performance.
- Do not edit files.
- Return JSON that matches the provided schema.