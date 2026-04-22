# Comparison Report — scripts
Chain: scripts-260413-232717-abee

## Methodology Note

**Codex writer was SKIPPED** (codex_status: skipped, result file shows 0 files changed, 0 findings).
This comparison is CC-only. All findings come from the CC writer analysis.
Each finding is evaluated on its own merit for inclusion in the fix plan.

## Agreed (both found)

_None — Codex did not produce findings._

## CC Only (Codex missed)

All 12 CC findings are CC-only. Evaluated below:

### Fix 1 — INFRA-001 (P0): Port chain expansion functions

**Finding 1 — [P0] Missing `update_chain_after_step`** — VALID, ACCEPT.
Chains will hang after step 1 group completes because step completion is never recorded.
This is the most critical missing piece. Must port from v3.py lines 2556-2700.

**Finding 2 — [P0] Missing Codex runner support (`build_codex_direct_command`)** — VALID, ACCEPT.
`runner: codex` steps currently launch CC instead of Codex. Must port `build_codex_direct_command`,
`resolve_codex_path`, `resolve_codex_node_command` from v3.py.

**Finding 3 — [P1] Missing auth pre-check (`check_cc_auth` / `check_codex_auth`)** — VALID, ACCEPT.
Without auth checks, expired tokens cause silent failures. Port from v3.py.

**Finding 4 — [P2] Missing `CLAUDE_CODE_GIT_BASH_PATH` env setup** — VALID, ACCEPT.
Windows-specific reliability issue. Port `_find_git_bash` and env setup block.

**Finding 5 — [P2] Missing chain completion lifecycle (lock cleanup, KB-095 auto-fix)** — VALID, ACCEPT.
Depends on Finding 1 (`update_chain_after_step`). Include as part of that port.

### Fix 2 — INFRA-002 (P1): TG notifications for chain steps

**Finding 6 — [P1] Chain step individual TG messages sent unnecessarily** — VALID, ACCEPT.
Double-send: both `mark_chain_step_running` AND `send_initial_telegram` called for chain steps.
Fix: wrap `send_initial_telegram` in `if not is_chain_step:`.

**Finding 7 — [P2] TG heartbeat updates go to per-step message** — VALID, ACCEPT (lower priority).
Heartbeat worker creates noise for chain steps. Suppress or redirect to chain TG message.

### Fix 3 — INFRA-003 (P1): WinError 206 fix

**Finding 8 — [P1] stdin pipe correct for CC but Codex runner branch missing** — VALID, ACCEPT.
Codex uses a different WinError 206 strategy (node.exe direct + single-line collapse).
Must be included when porting `build_codex_direct_command`.

**Finding 9 — [P2] Null byte cleaning gap for Codex steps** — VALID, ACCEPT (defensive).
CC path already strips nulls, but Codex path needs it too when ported.

### Fix 4 — INFRA-004 (P2): Documentation and KB

**Finding 10 — [P1] KB-136 already marked RESOLVED prematurely** — VALID, ACCEPT.
KB-136 says "RESOLVED (S264)" but the port is incomplete. Revert to OPEN until all findings fixed.

**Finding 11 — [P2] v3.py header not yet marked DEPRECATED** — VALID but DEFER.
CC correctly notes v3.py should NOT be deprecated until multi.py fully replaces it.
Mark as PARTIAL/CONDITIONAL — add DEPRECATED only after Findings 1-3 are resolved and tested.

**Finding 12 — [P2] CLAUDE.md "KS MULTI -> KS" rename premature** — VALID but DEFER.
Same logic: don't rename until multi.py is proven. Add warning note if updating now.

## Codex Only (CC missed)

_None — Codex did not produce findings._

## Disputes (disagree)

_None — single-reviewer comparison, no disputes possible._

## Final Fix Plan

Ordered by priority and dependency. All sourced from CC writer.

| # | Priority | Fix ID | Title | Source | Accept? | Notes |
|---|----------|--------|-------|--------|---------|-------|
| 1 | P0 | INFRA-001a | Port `update_chain_after_step` from v3.py | CC #1 | YES | Showstopper — chains hang without it |
| 2 | P0 | INFRA-001b | Port `build_codex_direct_command` + `resolve_codex_path` | CC #2 | YES | Codex steps run as CC without it |
| 3 | P1 | INFRA-001c | Port `check_cc_auth` / `check_codex_auth` | CC #3 | YES | Silent auth failures |
| 4 | P1 | INFRA-002a | Fix double TG send for chain steps | CC #6 | YES | Quick fix: `if not is_chain_step:` guard |
| 5 | P1 | INFRA-003a | Ensure Codex runner has WinError 206 protection | CC #8 | YES | Part of INFRA-001b port |
| 6 | P1 | INFRA-004a | Revert KB-136 to OPEN (premature RESOLVED) | CC #10 | YES | Factual correction |
| 7 | P2 | INFRA-001d | Port `CLAUDE_CODE_GIT_BASH_PATH` env setup | CC #4 | YES | Windows reliability |
| 8 | P2 | INFRA-001e | Chain completion lifecycle (lock cleanup, KB-095) | CC #5 | YES | Part of #1 port |
| 9 | P2 | INFRA-002b | Suppress/redirect heartbeat for chain steps | CC #7 | YES | Lower priority TG cleanup |
| 10 | P2 | INFRA-003b | Null byte cleaning for Codex path | CC #9 | YES | Defensive, part of #2 port |
| 11 | P2 | INFRA-004b | v3.py DEPRECATED header — CONDITIONAL | CC #11 | DEFER | Only after fixes 1-5 verified |
| 12 | P2 | INFRA-004c | CLAUDE.md KS rename — CONDITIONAL | CC #12 | DEFER | Only after fixes 1-5 verified |

## Summary

- Agreed: 0 items (Codex skipped)
- CC only: 12 items (10 accepted, 2 deferred/conditional)
- Codex only: 0 items (Codex skipped)
- Disputes: 0 items
- **Total fixes to apply: 10** (2 P0, 4 P1, 4 P2) + 2 deferred pending verification

### Key Observations

1. **Codex gap limits confidence.** Without a second reviewer, all findings rely on CC analysis alone.
   Recommend extra scrutiny during the discussion step (step 4) or a manual spot-check by Arman.

2. **The port is structurally incomplete.** The expansion/creation side works, but the lifecycle side
   (step completion, Codex runner, auth checks) is missing. This is a ~300-400 line port effort.

3. **Findings 11 and 12 (DEPRECATED/rename) are deliberately deferred** because applying them before
   the port is complete would be misleading — v3.py is still the only fully-working chain runner.

4. **Dependency chain:** Fix #1 (update_chain_after_step) unblocks Fix #8 (lifecycle) and is a
   prerequisite for Fix #11 (DEPRECATED). Fix #2 (Codex runner) unblocks Fix #5 (WinError) and
   Fix #10 (null bytes).
