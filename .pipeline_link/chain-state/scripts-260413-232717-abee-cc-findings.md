# CC Writer Findings — scripts
Chain: scripts-260413-232717-abee

## Findings

### Fix 1 — INFRA-001 (P0): Port chain expansion functions

1. **[P0] Missing `update_chain_after_step` — chain steps complete but state never advances** — multi.py has `expand_chain_task_if_needed` (line 1182), `can_run_chain_step` (line 861), and `mark_chain_step_running` (line 1115), but it does NOT have `update_chain_after_step` (v3.py line 2556). This means: after a chain step finishes, `completed_step` in chain state stays at 0. Subsequent steps (step 2, 3, etc.) call `can_run_chain_step` which checks `completed < chain_step - 1` (line 882) — they will be deferred FOREVER because step 1 is never marked completed. This is a **showstopper**: multi-step chains (consensus, discussion-cc-codex) will hang after step 1 group finishes. FIX: Port `update_chain_after_step` from v3.py (lines 2556-2700) into multi.py. Call it from `finalize_process` or from the post-CC block in `run_task()` (after line 2192) when `is_chain_step` is True. Must include: (a) update step entry in chain state with cost/duration/status, (b) group completion logic (only advance `completed_step` when ALL group members done), (c) chain completion logic (mark chain "completed" when last step done, cleanup lock files, send final TG summary), (d) error handling (pause chain, park remaining step files).

2. **[P0] Missing Codex runner support — `runner: codex` steps launch as CC** — multi.py's `run_task()` (line 2077) always calls `build_claude_command` → launches CC CLI. There is NO branch for `runner == 'codex'`. In v3.py (lines 1525-1594), when `runner == 'codex'`, it calls `build_codex_direct_command` to launch Codex CLI directly (node.exe → codex exec). multi.py does not have `build_codex_direct_command`, `resolve_codex_path`, or `resolve_codex_node_command`. Result: chain steps with `runner: codex` (e.g., codex-writer in pssk-review, consensus chains) get the prompt piped to CC instead of Codex. FIX: Port `build_codex_direct_command` (v3.py line 802), `resolve_codex_path` (v3.py line 754), `resolve_codex_node_command` (check v3.py) into multi.py. Add `runner` check in `run_task()` around line 2056-2077: if `runner == 'codex'`, use `build_codex_direct_command` instead of `build_claude_command`, skip `DETACHED_PROCESS` flags, set `cwd` to `menuapp-code-review/` (KB-082).

3. **[P1] Missing auth pre-check — `check_cc_auth` / `check_codex_auth` not ported** — v3.py has `check_cc_auth` (line 1968) and `check_codex_auth` (line 2002) called before chain expansion (KB-106). multi.py's `expand_chain_task_if_needed` does not call either function. If CC or Codex auth is expired, chain steps will launch and immediately fail silently. FIX: Port `check_cc_auth`, `check_codex_auth`, and `_find_git_bash` from v3.py. Call auth checks in `expand_chain_task_if_needed` before expansion (after recipe load, before `expand_chain_to_tasks`). On auth failure: keep file in queue, send TG alert, skip expansion (same pattern as v3.py).

4. **[P2] Missing `CLAUDE_CODE_GIT_BASH_PATH` env setup** — v3.py (lines 1565-1576) sets `CLAUDE_CODE_GIT_BASH_PATH` in the environment before launching CC (KB-078, KB-084, KB-084b, KB-092). multi.py's `run_task()` only sets `LANG` and `LC_ALL` (lines 2078-2080). On Windows, CC may intermittently fail because it can't find Git Bash. FIX: Port `_find_git_bash` and add the `CLAUDE_CODE_GIT_BASH_PATH` setup block to `run_task()` after the env copy (line 2078).

5. **[P2] Missing chain completion lifecycle: lock file cleanup, chain artifact archival, KB-095 auto-fix** — v3.py's `update_chain_after_step` (lines 2649-2688) handles: (a) auto-delete work stream lock file when chain completes (#292), (b) KB-095 auto-fix for working copy truncation, (c) chain artifact cleanup. multi.py has `cleanup_chain_artifacts` (line 1310) but it's never called (no `update_chain_after_step` to invoke it). FIX: Include these in the ported `update_chain_after_step`.

### Fix 2 — INFRA-002 (P1): TG notifications for chain steps

6. **[P1] Chain step individual TG messages sent unnecessarily** — multi.py's `run_task()` at line 2048 calls `send_initial_telegram(ctx, ...)` for ALL tasks including chain steps. But chain steps should only update the chain's single TG message (via `mark_chain_step_running`). v3.py (lines 1512-1516) has a branch: `if is_chain_step: mark_chain_step_running() / else: send_initial_telegram()`. multi.py calls BOTH `mark_chain_step_running` (line 2024) AND `send_initial_telegram` (line 2048). FIX: Wrap `send_initial_telegram` at line 2048 in `if not is_chain_step:` to match v3.py behavior. Chain steps should rely solely on the chain TG message updates.

7. **[P2] TG heartbeat updates go to per-step message for chain steps** — The heartbeat worker (line 1651) updates TG via `update_telegram_from_progress` which edits the per-step TG message. For chain steps, this creates per-step TG messages with heartbeat noise, while the chain's consolidated TG message doesn't get heartbeat updates. FIX: For chain steps, heartbeat should call `update_chain_tg` instead of `update_telegram_from_progress`, or suppress heartbeat for chain steps entirely (v3.py doesn't send per-step heartbeats for chain tasks).

### Fix 3 — INFRA-003 (P1): WinError 206 fix

8. **[P1] stdin pipe for large prompts: correct for CC, but Codex runner branch missing** — multi.py's `build_claude_command` (line 1599) correctly handles the >7KB threshold with stdin pipe (INFRA-003). However, since `runner: codex` support is missing (Finding #2), there's no equivalent WinError 206 protection for Codex launch. v3.py's `build_codex_direct_command` (line 802) handles this differently: it uses node.exe directly (bypassing cmd.exe 8191 limit) and collapses prompts to single-line. FIX: When porting `build_codex_direct_command`, ensure the KB-086 node-direct approach is preserved (this is a different strategy from stdin pipe — Codex uses single-line prompt collapse + node.exe bypass).

9. **[P2] Null byte cleaning done in `build_claude_command` but not for chain step prompts** — `build_claude_command` (line 1609) strips `\x00` from prompts. But for chain steps, the prompt comes from `build_chain_step_prompt` → `ctx.prompt_body` which could contain null bytes from `resolve_inline_source` (if a source file had nulls). The `resolve_inline_source` in multi.py (line 746) uses `errors='replace'` which replaces invalid UTF-8 but doesn't remove null bytes. FIX: Add `prompt_text = prompt_text.replace('\x00', '')` in `build_chain_step_prompt` or in `resolve_inline_source` after reading file content. Actually, since `build_claude_command` already strips nulls from the tmpfile content at runtime (line 1609-1610), this is handled — but only if the prompt goes through `build_claude_command`. For Codex steps (which would use `build_codex_direct_command`), null byte stripping must be included there too.

### Fix 4 — INFRA-004 (P2): Documentation and KB

10. **[P1] KB-136 already marked RESOLVED prematurely** — KB-136 (line 145) says "RESOLVED (S264)" and claims multi.py v5.0 supports chain_template. But as shown in Findings #1 and #2, the port is INCOMPLETE: `update_chain_after_step` and `build_codex_direct_command` are missing, chains will hang after step 1. KB-136 status should remain OPEN until these functions are ported and tested. FIX: Revert KB-136 status to OPEN or add a note that the port is partial: expansion works but step completion and Codex runner are missing.

11. **[P2] v3.py header not yet marked DEPRECATED** — The task requires adding a DEPRECATED header to v3.py. Current header (line 4) says "Version: 5.16". It should be marked as deprecated with a pointer to multi.py. FIX: Add `DEPRECATED — use task-watcher-multi.py v5.0+ instead. Kept for reference only.` to v3.py header comment. However, given Findings #1 and #2, v3.py should NOT be deprecated until multi.py fully replaces it — marking it DEPRECATED now would be misleading.

12. **[P2] CLAUDE.md commands block — "KS MULTI → KS" rename premature** — The task asks to update CLAUDE.md to make multi.py the primary watcher (KS MULTI → KS). Given that multi.py's chain support is incomplete (Findings #1, #2), this rename would cause users to default to an incomplete watcher. FIX: Only update CLAUDE.md after all Findings are resolved and smoke-tested. If updating now, add a warning note.

## Summary
Total: 12 findings (2 P0, 5 P1, 5 P2, 0 P3)

The port from v3.py to multi.py is STRUCTURALLY INCOMPLETE. The expansion/creation side is done well (chain detection, expansion, step file creation, TG init, lock files), but the LIFECYCLE side is missing:
- **Step completion** (`update_chain_after_step`) — chains will hang after step 1
- **Codex runner** (`build_codex_direct_command`) — Codex steps run as CC
- **Auth pre-checks** (`check_cc_auth`, `check_codex_auth`) — silent failures on auth expiry
- **Git Bash env** (`_find_git_bash`) — intermittent Windows failures

Estimated effort to fix: medium-high. ~300-400 lines need to be ported from v3.py.

## Prompt Clarity

- Overall clarity: **4/5** — The task description is well-structured with clear Fix sections, anti-patterns, and test plans.
- Ambiguous Fix descriptions:
  - Fix 1: Lists 5 functions to port but misses `update_chain_after_step` (the most critical one). The "Implementation Notes" section says "Copy 5 functions" but there are actually ~8-10 functions needed.
  - Fix 1: Does not mention `build_codex_direct_command` / `resolve_codex_path` / `resolve_codex_node_command` — these are essential for `runner: codex` support but are not listed.
- Missing context:
  - No mention that v3.py has `check_cc_auth`/`check_codex_auth` (KB-106) — these are important for robustness.
  - No mention that `update_chain_after_step` handles group completion logic (required for parallel writers in pssk-review).
- Scope questions:
  - KB-136 is already marked RESOLVED in the KB — should it be reverted given the incomplete port? (I assume yes.)
  - Should the chain TG handling in `run_task()` (double send: mark_chain_step_running + send_initial_telegram) be fixed as part of this task? (I treated it as in-scope for Fix 2.)
