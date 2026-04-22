# INFRA Bugs

- 2026-04-15: The mandatory repo sync step is blocked by a pre-existing `.git/index.lock` in the repo root, producing `fatal: Unable to create 'C:/Users/ASUS/Dev/Menu AI Cowork/menuapp-code-review/.git/index.lock': File exists.`
- 2026-04-15: Required writes to `C:/Users/ASUS/Dev/Menu AI Cowork/pipeline/...` are denied from this sandbox, so discussion-writer artifacts cannot be persisted to the requested pipeline paths in this environment.
- 2026-04-15: D3 Infra task context points to `scripts/task-watcher-multi.py` and `cleanup_stale_git_locks`, but the synced checkout at `5fc308ecaf42a8bcf2a90de53c19fd9f00d38fc3` does not contain that file/helper, so source-level verification was not possible.
