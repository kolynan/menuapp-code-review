---
pipeline: v7
type: code-review
page: Pipeline
budget: $12
---

START

Auto-approve all file edits, terminal commands, git operations, and network access without asking. Do not ask for confirmation on any step. Execute autonomously until the task is fully complete. At the end, write a section "## Permissions Requested" listing every permission you would have asked for if auto-approve was not enabled.

## Task: Implement `parallel-write` workflow for V7 pipeline

**Context:** V7 pipeline currently supports two workflows: `code-review` (CC writes + Codex reviews + merge) and `ux-discussion` (3-round CC/Codex/synthesis). We need a third workflow: `parallel-write` where both CC and Codex WRITE code independently, then a CC reconciler merges the best parts.

```
Current code-review:
CC writes code  ──┐
                   ├──> Merge (cherry-pick CC + apply Codex findings)
Codex reviews   ──┘

New parallel-write:
CC writes code    ──┐
                    ├──> CC Reconciler (compares both, merges best parts)
Codex writes code ──┘
```

---

### Files to create/modify

All files are in `pipeline/v7/scripts/`.

#### 1. CREATE `Invoke-CodexWriter.ps1`

Similar to `Invoke-ClaudeWriter.ps1` but uses Codex CLI instead of Claude CLI.

- Read `Invoke-ClaudeWriter.ps1` first to understand the pattern.
- Uses `$task.paths.review_worktree` as working directory (in parallel-write, the "review" worktree becomes codex-writer worktree).
- Prompt for Codex: same task body as CC writer. Include: "You are the Codex writer for MenuApp pipeline V7. Write code to fix the described issue. Work only in the assigned working tree. Commit your changes before finishing."
- Runs `codex exec -C {worktree} --full-auto -` with prompt on stdin.
- Writes result JSON to `codex-writer.result.json` in artifacts dir.
- Must capture commit hash from the worktree after completion (same pattern as ClaudeWriter).
- Use BOM-free UTF-8 encoding for ALL file writes: `[System.Text.UTF8Encoding]::new($false)` — NEVER `[System.Text.Encoding]::UTF8` (adds BOM).
- Use `.Contains()` not `.ContainsKey()` for hashtable lookups (PowerShell 5.1 compat).
- Use `Invoke-V7Git` and `Invoke-V7CapturedCommand` from V7.Common.ps1 for all git/external commands — NEVER raw `& git` or `git -C`.
- Handle errors gracefully — write error details to result JSON, don't crash silently.

#### 2. CREATE `Merge-ParallelWrite.ps1`

The reconciler for parallel-write workflow.

- Read `Merge-TaskResult.ps1` first to understand the merge pattern.
- Reads both `claude-writer.result.json` and `codex-writer.result.json` from artifacts.
- Cherry-picks CC's commit into merge worktree first (like current Merge-TaskResult.ps1).
- Then runs CC (Claude CLI) in reconcile mode with this prompt:
  ```
  You are the reconciler for a parallel-write task.
  Two AI agents independently wrote code for the same task.

  CC Writer commit: {hash} - already applied to this worktree
  Codex Writer commit: {hash} - in branch task/{id}-review

  Your job:
  1. Read the CC writer's changes - already in your worktree
  2. Read the Codex writer's changes: git diff {base}..{codex_commit}
  3. Compare both approaches
  4. If Codex has better solutions for specific parts, apply them
  5. Write a reconciliation report to {reportPath}
  6. Commit the final merged result
  ```
- Writes `parallel-write-report.md` and `merge.result.json` to artifacts.
- Use `--max-budget-usd` (NOT `--max-cost-dollars` — that flag does not exist).
- BOM-free UTF-8 for all file writes.

#### 3. UPDATE `Start-TaskSupervisor.ps1`

Add `parallel-write` workflow branch.

- Find the existing workflow switch (where `code-review` and `ux-discussion` are handled).
- Add `elseif ($workflow -eq 'parallel-write')` block:
  - Same worktree setup as code-review (3 worktrees: writer, review/codex-writer, merge)
  - Launch CC Writer (Invoke-ClaudeWriter.ps1) + Codex Writer (Invoke-CodexWriter.ps1) in parallel
  - Wait for both using existing Wait-V7Launchers pattern
  - Use `Test-V7WorkerProcessAlive` for dead process detection (KB-032)
  - Run Merge-ParallelWrite.ps1 instead of Merge-TaskResult.ps1
  - Use `Get-V7StateValue` and `Get-V7StateText` for all optional property reads (KB-033)
- TG status format for parallel-write:
  ```
  [parallel-write] {PageName}
  RUNNING | {startTime}
  --- Writers ---
  CC Writer: started...
  Codex Writer: started...
  Reconciler: waiting
  ```
  Final:
  ```
  [parallel-write] {PageName}
  DONE | {startTime} > {endTime} ({total} min)
  --- Writers ---
  CC Writer: OK, {N} files, commit {hash7} ({duration} min)
  Codex Writer: OK, {N} files, commit {hash7} ({duration} min)
  Reconciler: OK, used {CC|Codex|both}, commit {hash7} ({duration} min)
  --- Result ---
  Source: {CC only|Codex only|merged from both}
  DONE
  ```

#### 4. UPDATE `V7.Common.ps1` (if needed)

If any new shared helpers are needed for the parallel-write workflow, add them here. Use existing patterns.

---

### PowerShell 5.1 Rules (CRITICAL — read before writing ANY code)

1. Use `.Contains()` NEVER `.ContainsKey()` for dictionaries
2. Use `[System.Text.UTF8Encoding]::new($false)` NEVER `[System.Text.Encoding]::UTF8` for file writes
3. Use `Invoke-V7Git` / `Invoke-V7CapturedCommand` for ALL external commands — NEVER raw `& git`
4. Use `Get-V7StateValue` / `Get-V7StateText` for ALL optional property reads
5. Use `Test-V7WorkerProcessAlive` for process alive checks
6. Use `Write-V7FileWithRetry` for file writes in queue/ and results/ dirs
7. NEVER use `$args` as a variable name — it is a reserved PowerShell automatic variable
8. Initialize ALL `$script:` variables before first use

---

### Validation (MUST pass before commit)

1. PowerShell syntax check on ALL modified/new .ps1 files:
   ```powershell
   Get-ChildItem pipeline/v7/scripts/*.ps1 | ForEach-Object { $errs = $null; $null = [System.Management.Automation.Language.Parser]::ParseFile($_.FullName, [ref]$null, [ref]$errs); if ($errs) { Write-Host "FAIL: $($_.Name) - $($errs[0].Message)" } else { Write-Host "OK: $($_.Name)" } }
   ```
2. Grep audit — zero matches expected:
   ```powershell
   Select-String -Path pipeline/v7/scripts/*.ps1 -Pattern '\.ContainsKey\(' | ForEach-Object { Write-Host "FAIL ContainsKey: $_" }
   Select-String -Path pipeline/v7/scripts/*.ps1 -Pattern '\[System\.Text\.Encoding\]::UTF8' | ForEach-Object { Write-Host "FAIL BOM encoding: $_" }
   Select-String -Path pipeline/v7/scripts/*.ps1 -Pattern '& git |git -C ' | ForEach-Object { Write-Host "FAIL raw git: $_" }
   Select-String -Path pipeline/v7/scripts/*.ps1 -Pattern '--max-cost-dollars' | ForEach-Object { Write-Host "FAIL wrong flag: $_" }
   ```
3. Verify `Start-TaskSupervisor.ps1` handles all 3 workflow types: `code-review`, `ux-discussion`, `parallel-write`.
4. Read back key sections of new files to confirm correctness.

### Git

```
git add pipeline/v7/scripts/Invoke-CodexWriter.ps1 pipeline/v7/scripts/Merge-ParallelWrite.ps1 pipeline/v7/scripts/Start-TaskSupervisor.ps1 pipeline/v7/scripts/V7.Common.ps1
git commit -m "feat: parallel-write workflow for V7 pipeline S126"
git push
```

END
