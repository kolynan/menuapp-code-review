---
task_id: task-260413-165714-scripts-codex-writer-v2
status: running
started: 2026-04-13T16:57:15+05:00
type: chain-step
page: scripts
work_dir: C:/Dev/menuapp-code-review
budget_usd: 8.00
fallback_model: sonnet
version: 5.17
launcher: python-popen
---

# Task: task-260413-165714-scripts-codex-writer-v2

## Config
- Budget: $8.00
- Mode: task-watcher.py launches Claude Code directly via Popen
- Fallback model: sonnet

## Prompt
---
chain: scripts-260413-165707-8b00
chain_step: 1
chain_total: 4
chain_step_name: codex-writer-v2
chain_group: writers
chain_group_size: 2
page: scripts
budget: 8.00
runner: codex
type: chain-step
---
**MANDATORY FIRST STEP — run this before anything else:**
```
git fetch origin 2>/dev/null; git reset --hard origin/main
```
This ensures your working copy is in sync with the remote repository (prevents KB-095 stale-copy issue).

---

Review the file(s) specified in TASK CONTEXT below for a React restaurant QR-menu app on Base44 platform.
Also check README.md and BUGS.md in the same page folder for context (read-only, do NOT modify).

SPEED RULES — this is a time-sensitive pipeline step:
- Read ONLY the TARGET files + README/BUGS for context. Do NOT search the repo, do NOT read old findings, do NOT read files outside the page folder.
- Do NOT run rg/grep across the whole repo. Do NOT cross-reference with other pages.
- Limit analysis to the target page code. Be concise.

⛔ SCOPE RESTRICTION (MANDATORY):
If the TASK CONTEXT below contains a numbered Fix list (Fix 1, Fix 2, etc.):
- Do NOT report ANY issues outside the numbered Fix list.
- If you see other bugs — IGNORE them completely.
- Your output must contain ONLY findings for Fix 1, Fix 2, etc.
- Extra findings outside the Fix list = task FAILURE.
- BAD example: Task says "Fix 1: button position" → you report touch targets, aria-labels, i18n issues. This is WRONG.
- GOOD example: Task says "Fix 1: button position" → you report ONLY your analysis of Fix 1 (button position). Nothing else.

If there is NO numbered Fix list → find ALL bugs. Focus on: logic errors, missing error handling, i18n issues, UI/UX for mobile-first, React anti-patterns.

For each finding: [P0/P1/P2/P3] Title - Description. FIX: code change needed.

Write findings to: pipeline/chain-state/scripts-260413-165707-8b00-codex-findings.md

FORMAT:
# Codex Writer Findings — scripts
Chain: scripts-260413-165707-8b00

## Findings
1. [P0/P1/P2/P3] Title — Description. FIX: ...
2. ...

## Summary
Total: N findings (X P0, Y P1, Z P2, W P3)

## Prompt Clarity (MANDATORY — do NOT skip this section)
Rate the task description quality (1-5). For any score below 4, explain what was unclear:
- Overall clarity: [1-5]
- Ambiguous Fix descriptions (list Fix # and what was unclear): ...
- Missing context (what info would have helped): ...
- Scope questions (anything you weren't sure if it's in scope): ...
YOU MUST FILL IN ALL FIELDS ABOVE. Findings without Prompt Clarity are incomplete.

Do NOT apply fixes — only document findings.

=== TASK CONTEXT ===
# #291+#292: Auto lock-files for work streams in task-watcher-v3.py

**Context:** When a КС chain starts, a lock file (e.g. `pipeline/signals/lock-WS-SOM.md`) must be created automatically. When the chain completes (TG DONE), the lock file must be deleted. Currently lock files are created/deleted manually.

**File:** `scripts/task-watcher-v3.py` (v5.17, ~2900 lines, Python)

**References:**
- Existing lock files: `pipeline/signals/lock-WS-SOM.md`, `lock-WS-MON.md` — see format below
- Chain expansion: function `expand_chain_task_if_needed` (grep: `def expand_chain_task_if_needed`)
- Chain completion: function `update_chain_after_step` (grep: `def update_chain_after_step`)
- Chain state storage: `save_chain_state` / `load_chain_state` functions

---

## Fix 1 — #291 (P2) [MUST-FIX]: Create lock file when chain starts

### Сейчас
When a chain is expanded via `expand_chain_task_if_needed`, no lock file is created. Lock files must be created manually before starting a КС chain.

### Должно быть
After successful chain expansion (after `save_chain_state` at the end of `expand_chain_task_if_needed`), automatically create `pipeline/signals/lock-{ws}.md` where `{ws}` comes from:
1. Frontmatter field `ws` (e.g. `ws: WS-SOM`) — **primary source**
2. If `ws` is not in frontmatter → **skip lock creation** (backward compatible)

The lock file format must match existing convention:
```markdown
---
ws: {ws}
session: КС {chain_id}
task: "{task description from frontmatter or filename}"
started: {YYYY-MM-DD}
---

КС chain {chain_id} работает над {ws}.
Автоматически создан task-watcher-v3.py.
Удалится автоматически при завершении chain.
```

### НЕ должно быть
- Lock creation must NOT happen if `ws` field is missing from frontmatter (no guessing)
- Lock creation must NOT fail silently — log a warning if file write fails
- Must NOT overwrite an existing lock file for the same WS — if `lock-{ws}.md` already exists, log a warning and skip (another chain/session owns it)

### Файл и локация
`scripts/task-watcher-v3.py`, function `expand_chain_task_if_needed` (grep: `def expand_chain_task_if_needed`).
Insert lock creation AFTER the line `save_chain_state(pipeline_dir, chain_id, state)` (the second call, after step_names are saved — grep: `state\['step_names'\]`).
Also: store `ws` in chain state dict so Fix 2 can read it.

### Проверка
1. Create a queue file with `ws: WS-TEST` in frontmatter + `chain_template: consensus-with-discussion-v2`
2. After expansion → `pipeline/signals/lock-WS-TEST.md` exists with correct format
3. Queue file WITHOUT `ws` → no lock file created, no errors

---

## Fix 2 — #292 (P2) [MUST-FIX]: Delete lock file when chain completes

### Сейчас
When a chain completes successfully (`status = 'completed'` in `update_chain_after_step`), no lock file is deleted. Lock files must be removed manually.

### Должно быть
In `update_chain_after_step`, when `chain_step >= chain_total` and chain status becomes `'completed'`:
1. Read `ws` from chain state (stored in Fix 1)
2. If `ws` is present → delete `pipeline/signals/lock-{ws}.md`
3. Log the deletion: `logger.info(f'Lock released: lock-{ws}.md (chain {chain_id} completed)')`

### НЕ должно быть
- Must NOT delete lock on chain ERROR/PAUSE — only on successful completion
- Must NOT crash if lock file doesn't exist (use `Path.unlink(missing_ok=True)`)
- Must NOT delete lock if `ws` is not in chain state (backward compat with old chains)

### Файл и локация
`scripts/task-watcher-v3.py`, function `update_chain_after_step` (grep: `def update_chain_after_step`).
Insert lock deletion in the block where `state['status'] = 'completed'` (grep: `state\['status'\] = 'completed'`), AFTER `save_chain_state` and BEFORE the final TG summary update.

### Проверка
1. After chain completes (all steps done, TG shows ✅ DONE) → `lock-WS-TEST.md` is deleted from `pipeline/signals/`
2. Chain that errors at step 2/5 → lock file remains (WS still blocked)
3. Chain without `ws` in state → no deletion attempt, no errors

---

## ⛔ SCOPE LOCK — менять ТОЛЬКО то, что указано выше

- Change ONLY `expand_chain_task_if_needed` and `update_chain_after_step` functions
- Do NOT modify chain expansion logic, step ordering, TG messaging, or any other function
- Do NOT change the existing lock file format (ws/session/task/started YAML frontmatter)
- Do NOT add new imports (use existing `Path`, `shutil`, `datetime`)
- Do NOT rename or restructure existing variables

## Implementation Notes
- File: `scripts/task-watcher-v3.py` (single file, Python 3.13)
- Lock directory: `pipeline/signals/` (relative to pipeline_dir)
- Use `write_text()` helper (already defined in the file) for creating lock files
- Use `Path.unlink(missing_ok=True)` for deletion
- Thread safety: lock creation is in the main thread (expand runs sequentially). Lock deletion is also main-thread (update_chain_after_step is called from the poll loop). No extra locking needed.
- `pipeline_dir` is available in both functions — use `pipeline_dir / 'signals' / f'lock-{ws}.md'`
- Date format for `started` field: `datetime.now().strftime('%Y-%m-%d')` (already imported)
- git commit after all fixes
=== END ===


## Status
Running...
