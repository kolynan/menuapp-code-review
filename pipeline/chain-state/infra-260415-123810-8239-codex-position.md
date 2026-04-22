# Codex Discussion Position — Infra Chain: infra-260415-123810-8239
Topic: D3 — Smoke-test S280 Pipeline Hardening

## Questions Analyzed

### Q1: How should `cleanup_stale_git_locks` avoid deleting a lock that still belongs to a live Git process?
**Recommendation:** Add a liveness guard before unlinking any aged lock: check whether a Git process is still active for `repo_dir` or the matching worktree, and only delete when the lock is both old and not plausibly owned by a live process. If process inspection is too platform-specific, require two stale observations a few seconds apart before deletion.

**Reasoning:** Age alone is a weak signal. A large fetch/rebase, slow disk, antivirus interference, or a briefly suspended process can leave a valid lock older than 60 seconds. In an automation path that runs both pre-flight and right before auto-stash, a false-positive cleanup is worse than a missed cleanup because it can corrupt or interrupt the Git operation that was actually still in progress.

**Trade-offs:** This adds some implementation complexity and may leave a real stale lock in place for one extra loop, but it shifts the helper toward "safe by default," which is the right bias for merge automation.

**Mobile UX:** Not directly user-facing. Indirectly, safer merge automation reduces avoidable pipeline stalls and gets restaurant-side fixes to waiters and guests faster.

### Q2: Which missing lock scenarios should `cleanup_stale_git_locks` handle better?
**Recommendation:** Replace the narrow hardcoded list with a controlled allowlist sweep of additional Git lock paths that commonly block automation, especially `.git/packed-refs.lock`, `.git/config.lock`, `.git/shallow.lock`, and `.git/refs/**/*.lock`, while logging path, age, and delete/skip reason for every candidate.

**Reasoning:** The current contract only mentions `{index, ORIG_HEAD, HEAD, MERGE_HEAD}.lock` plus `.git/refs/heads/main.lock`. That is enough for some failures, but not for all branch-update, ref-update, or branch-delete paths in the S280 flow. A broader allowlisted sweep prevents "cleanup says OK but merge still fails," and richer diagnostics make the Telegram alert actionable instead of forcing a second round of manual triage.

**Trade-offs:** A broader sweep needs a strict allowlist and clear logging so the helper does not start deleting arbitrary files under `.git`. It is slightly noisier, but it improves both recovery coverage and debuggability.

**Mobile UX:** Not directly user-facing. Indirectly, better recovery coverage shortens time-to-fix when restaurant-critical hotfixes are queued behind a blocked merge.

## Summary Table
| # | Question | Codex Recommendation | Confidence |
|---|----------|----------------------|------------|
| 1 | Prevent false-positive deletion of live locks | Add active-process or repeated-stale confirmation before unlinking | high |
| 2 | Cover more real merge blockers | Expand to an allowlisted sweep of other Git lock paths and log decisions | medium |

## Prompt Clarity
Rate the task description quality (1-5). For any score below 4, explain what was unclear:
- Overall clarity: 3
- Ambiguous questions (list # and what was unclear): Q2 was phrased as "what other 2 improvements" without the actual source, so the discussion had to infer gaps from the helper contract instead of validating them line-by-line.
- Missing context (what info would have helped): The actual contents of `scripts/task-watcher-multi.py`, the current body of `cleanup_stale_git_locks`, and the exact callsites mentioned in the task. In this synced checkout, neither the file nor the helper exists at the stated path, so source verification was not possible.
