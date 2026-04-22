# Comparison Report — scripts
Chain: scripts-260413-165707-8b00

## Source Availability
- **CC findings:** FOUND — `scripts-260413-165707-8b00-cc-findings.md`
- **Codex findings:** NOT FOUND — file `scripts-260413-165707-8b00-codex-findings.md` does not exist. Codex either failed, timed out, or was not launched for this chain. Proceeding with CC-only comparison.

## Agreed (both found)
N/A — Codex findings unavailable.

## CC Only (Codex missed)
Since Codex is absent, all findings are CC-only. Both are validated against the actual source code.

### Fix 1 — #291 [P2]: Create lock file when chain starts
**Source:** CC Writer | **Validity: CONFIRMED**

CC proposes 2 changes in `expand_chain_task_if_needed` (line 2035):

**(a)** Add `'ws': meta.get('ws', '')` to the `state` dict at line ~2111-2122. This stores the work stream identifier in chain state for use by Fix 2.
- **Verified:** State dict is at lines 2111-2122. Adding `'ws'` alongside `'page'` is clean and non-disruptive.

**(b)** After line 2138 (`save_chain_state` after TG msg_id), insert lock file creation block:
- Only creates if `ws` is non-empty (backward compat)
- Skips if lock file already exists (no overwrite)
- Logs warning on write failure (no crash)
- Format matches existing `lock-WS-SOM.md` / `lock-WS-MON.md` convention
- Uses `meta.get('task', meta.get('description', task_file.name))` for task description fallback
- **Verified:** Line 2138 is the correct insertion point — after chain is fully initialized, TG message sent, state saved.

**Assessment: ACCEPT — well-scoped, correct insertion point, proper error handling, matches spec exactly.**

### Fix 2 — #292 [P2]: Delete lock file when chain completes
**Source:** CC Writer | **Validity: CONFIRMED**

CC proposes 1 change in `update_chain_after_step` (line 2526):

After line 2622 (`save_chain_state` in completion block), before KB-095 auto-fix (line 2624), insert lock deletion:
- Reads `ws` from `state.get('ws', '')` (stored by Fix 1)
- Uses `Path.unlink(missing_ok=True)` — safe if file already gone
- OSError wrapped with warning log
- Only in the `state['status'] = 'completed'` path (line 2620), NOT in error/pause paths
- **Verified:** Line 2622 is correct. The error path (line ~2571-2600) is separate and untouched. Lock persists on error — correct per spec.

**Assessment: ACCEPT — minimal change, correct placement, proper backward compat.**

## Codex Only (CC missed)
N/A — Codex findings unavailable.

## Disputes (disagree)
N/A — single source.

## Final Fix Plan
Ordered list of all fixes to apply:

1. **[P2] #291 — Store `ws` in chain state dict** — Source: CC — Add `'ws': meta.get('ws', '')` to state dict in `expand_chain_task_if_needed` (line ~2121, before `save_chain_state`)
2. **[P2] #291 — Create lock file after chain expansion** — Source: CC — Insert lock creation block after line 2138 in `expand_chain_task_if_needed` (after final `save_chain_state`). Create `pipeline/signals/lock-{ws}.md` with YAML frontmatter matching existing convention.
3. **[P2] #292 — Delete lock file on chain completion** — Source: CC — Insert lock deletion after line 2622 in `update_chain_after_step` (after `save_chain_state` in completion block, before KB-095). Use `Path.unlink(missing_ok=True)`.

## Summary
- Agreed: 0 items (Codex unavailable)
- CC only: 2 items (2 accepted, 0 rejected)
- Codex only: 0 items (Codex unavailable)
- Disputes: 0 items
- **Total fixes to apply: 3 changes across 2 functions**

## Notes
- All CC line references verified against actual source (`task-watcher-v3.py` v5.17, ~2900 lines)
- No new imports needed — `Path`, `datetime`, `logger` already in scope
- Both fixes are backward-compatible: chains without `ws` in frontmatter/state are unaffected
- Scope is locked to `expand_chain_task_if_needed` and `update_chain_after_step` only
