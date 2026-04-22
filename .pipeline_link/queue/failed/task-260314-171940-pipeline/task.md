---
pipeline: v7
type: bugfix
page: Pipeline
budget: $10
---

START

Auto-approve all file edits, terminal commands, git operations, and network access without asking. Do not ask for confirmation on any step. Execute autonomously until the task is fully complete. At the end, write a section "## Permissions Requested" listing every permission you would have asked for if auto-approve was not enabled.

## Task: Unify task-watcher config — single source of truth

**Problem:** There are TWO copies of `task-watcher-config.json`:
1. `C:/Users/ASUS/Dev/Claude AI Cowork/scripts/task-watcher-config.json` — the master copy (managed by Cowork)
2. `C:/Dev/menuapp-code-review/scripts/task-watcher-config.json` — repo copy (used by V7 watcher)

When the master is updated (e.g., path change), the repo copy gets out of sync. This caused ВЧР to watch the wrong queue directory.

**Solution:** Make the repo's `task-watcher.py` read config from the EXTERNAL master location, not from its own `scripts/` folder.

### What to change in `scripts/task-watcher.py`:

1. Find where config is loaded (look for `task-watcher-config.json` or `load_config`).

2. Change the config resolution order to:
   ```python
   # Config resolution order:
   # 1. Environment variable WATCHER_CONFIG_PATH (if set)
   # 2. External master: C:/Users/ASUS/Dev/Claude AI Cowork/scripts/task-watcher-config.json
   # 3. Fallback: scripts/task-watcher-config.json (same dir as this script)
   ```

3. Add a log line when config is loaded showing which file was used:
   ```python
   logger.info(f"Config loaded from: {config_path}")
   ```
   Or if logger is not yet initialized at that point, use print:
   ```python
   print(f"Config loaded from: {config_path}")
   ```

4. The repo's own `scripts/task-watcher-config.json` should still exist as fallback, but update its `_comment` to say:
   ```json
   "_comment": "FALLBACK ONLY. Master config: C:/Users/ASUS/Dev/Claude AI Cowork/scripts/task-watcher-config.json"
   ```

5. Also update the repo config's `onedrive_root` to match the master:
   ```json
   "onedrive_root": "C:/Users/ASUS/Dev/Claude AI Cowork"
   ```

### Validation

1. Run `python scripts/task-watcher.py --help` or just start it briefly — verify it prints the config path and loads from the external master location.
2. Verify the startup log shows: `Config loaded from: C:\Users\ASUS\Dev\Claude AI Cowork\scripts\task-watcher-config.json`
3. Verify it watches queue: `C:\Users\ASUS\Dev\Claude AI Cowork\pipeline\queue`

### Git

```
git add scripts/task-watcher.py scripts/task-watcher-config.json
git commit -m "fix: unify watcher config — single source of truth S126"
git push
```

END
