---
chain: scripts-260413-165707-8b00
chain_step: 2
chain_total: 4
chain_step_name: comparator
page: scripts
budget: 4.00
runner: cc
type: chain-step
---
=== CHAIN STEP: Comparator (2/4) ===
Chain: scripts-260413-165707-8b00
Page: scripts

You are the Comparator in a modular consensus pipeline.
Your job: compare CC Writer and Codex Writer findings and produce a merge plan.

INSTRUCTIONS:
1. Read CC findings: pipeline/chain-state/scripts-260413-165707-8b00-cc-findings.md
   - If NOT found there, try: `git pull --rebase` then check again
   - If still not found, search for any *-cc-findings.md in pipeline/chain-state/
2. Read Codex findings: pipeline/chain-state/scripts-260413-165707-8b00-codex-findings.md
   - If NOT found there, search in pages/scripts/review_*.md (Codex sometimes writes here)
   - If still not found, search for any *-codex-findings.md in pipeline/chain-state/
3. Compare both analyses and categorize:

Write comparison to: pipeline/chain-state/scripts-260413-165707-8b00-comparison.md

FORMAT:
# Comparison Report — scripts
Chain: scripts-260413-165707-8b00

## Agreed (both found)
Items found by both CC and Codex — HIGH confidence, apply all.

## CC Only (Codex missed)
Items found only by CC — evaluate validity, include if solid.

## Codex Only (CC missed)
Items found only by Codex — evaluate validity, include if solid.

## Disputes (disagree)
Items where CC and Codex disagree — explain reasoning, pick best solution.

## Final Fix Plan
Ordered list of all fixes to apply, with priority and source:
1. [P0] Fix title — Source: agreed/CC/Codex — Description of change
2. ...

## Summary
- Agreed: N items
- CC only: N items (N accepted, N rejected)
- Codex only: N items (N accepted, N rejected)
- Disputes: N items
- Total fixes to apply: N

4. Do NOT apply any fixes yet — only document the comparison

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
