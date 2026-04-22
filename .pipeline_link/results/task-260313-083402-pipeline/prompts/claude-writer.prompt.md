You are the Claude writer for MenuApp pipeline V7.

Task ID: task-260313-083402-pipeline
Workflow: code-review
Page: pipeline
Budget: budget
Repository: C:\Dev\menuapp-code-review
Working tree: C:\Dev\menuapp-code-review\.pipeline\runs\task-260313-083402-pipeline\worktrees\wt-writer
Target code file: 
BUGS.md: 
README.md: 
Summary file to write before you finish: C:\Dev\menuapp-code-review\.pipeline\runs\task-260313-083402-pipeline\artifacts\cc-writer-summary.md

Task instructions:
Auto-approve all file edits, terminal commands, and git operations without asking.
Do not ask for confirmation on any step.
Execute autonomously until the task is fully complete.

# V7 Pipeline Bug Fixes — KB-024 + KB-025 + General Audit

## Context

V7 Smoke Test #3 (task-260313-082351-publicmenu) reached the RUNNING stage successfully but FAILED at MERGING because neither Claude writer nor Codex reviewer produced results. This is the first test after KB-023 fix (SupervisorStepCounter init). The supervisor itself works fine now — the failures are in the worker launcher scripts.

## Bug 1: KB-024 — Claude CLI `--max-cost-dollars` not supported

**File:** `pipeline/v7/scripts/Invoke-ClaudeWriter.ps1` line 83
**Also affected:** `pipeline/v7/scripts/Invoke-ClaudeSynthesizer.ps1` line 58, `pipeline/v7/scripts/Invoke-ClaudeAnalyst.ps1` line 48

**Error from logs:**
```
node.exe : error: unknown option '--max-cost-dollars'
```

**Cause:** Claude Code CLI v2.1.71 does not support `--max-cost-dollars`. The current valid flag for cost control is `--max-turns` (limits number of agentic turns).

**Fix needed:** Replace `--max-cost-dollars` with a working alternative. Options:
1. Use `--max-turns` (e.g., 50 turns for $10 budget) — this is a supported flag
2. Remove cost flag entirely (Claude Code will run until task completion)
3. Check `claude --help` output on this machine to find the exact supported flags

**Action:** Run `claude --help` or `claude -p --help` to see which flags are available. Then fix ALL three scripts that use `--max-cost-dollars`.

## Bug 2: KB-025 — UTF-8 BOM in JSON schema files breaks Codex CLI

**Files affected (ALL have BOM):**
- `pipeline/v7/schemas/review-findings.schema.json`
- `pipeline/v7/schemas/task-run.schema.json`
- `pipeline/v7/schemas/status.sample.json`
- `pipeline/v7/schemas/task.sample.json`

**Error from logs:**
```
Output schema file C:\Dev\menuapp-code-review\pipeline\v7\schemas\review-findings.schema.json is not valid JSON: expected value at line 1 column 1
```

**Cause:** Files start with UTF-8 BOM (bytes EF BB BF). Codex CLI's JSON parser rejects BOM.

**Fix needed:** Remove BOM from all JSON files in `pipeline/v7/schemas/`. Use PowerShell:
```powershell
$files = Get-ChildItem pipeline/v7/schemas/*.json
foreach ($f in $files) {
    $content = [System.IO.File]::ReadAllText($f.FullName, [System.Text.UTF8Encoding]::new($false))
    [System.IO.File]::WriteAllText($f.FullName, $content, [System.Text.UTF8Encoding]::new($false))
}
```

**Prevention:** In `V7.Common.ps1`, ensure `Write-V7Json` uses `[System.Text.UTF8Encoding]::new($false)` (no BOM) instead of `[System.Text.Encoding]::UTF8` (which adds BOM in PowerShell 5.1).

## Bug 3 (minor): Budget not interpolated in prompt

In `Invoke-ClaudeWriter.ps1` line 50, the prompt shows `Budget: budget` instead of the actual value. Check line: `Budget: $$budget` — the `$$` may cause issues with PowerShell string interpolation in here-strings.

## General Audit Request

Since you're already in these files, please also:

1. **Scan ALL `pipeline/v7/scripts/*.ps1` files** for other potential issues:
   - Any `[System.Text.Encoding]::UTF8` that should be `[System.Text.UTF8Encoding]::new($false)` (BOM prevention)
   - Any uninitialized `$script:` variables (like KB-023)
   - Any hardcoded paths that might not exist
   - Any `.ContainsKey()` calls (should be `.Contains()` per KB-021)

2. **Check `V7.Common.ps1`** for the `Write-V7Json` function — ensure it writes without BOM.

3. **Verify Codex CLI flags** in `Invoke-CodexReviewer.ps1` — run `codex exec --help` to confirm `--output-schema`, `--json`, `-o` are all valid flags.

4. **Check all `[System.IO.File]::WriteAllText` calls** across V7 scripts — ensure they use BOM-free encoding.

## Git commit at the end

```bash
git add pipeline/v7/scripts/*.ps1 pipeline/v7/schemas/*.json
git commit -m "fix: KB-024 replace --max-cost-dollars, KB-025 remove BOM from schemas, audit V7 scripts S119"
git push
```

Rules:
- Work only inside the assigned working tree.
- Do not launch Codex or any other external AI tool. The supervisor owns orchestration.
- Update the target page, BUGS.md, and README.md when appropriate for this task.
- Keep changes scoped to the task.
- Prefer one clean git commit in this worktree. If you do not commit, the supervisor may auto-commit your final diff.
- Before finishing, write a concise markdown summary to C:\Dev\menuapp-code-review\.pipeline\runs\task-260313-083402-pipeline\artifacts\cc-writer-summary.md with: files changed, main fixes, tests or checks run, and any follow-up risk.