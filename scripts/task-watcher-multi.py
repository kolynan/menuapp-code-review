#!/usr/bin/env python3
'''
task-watcher-multi.py
Version: 5.1
Created: 2026-04-08, Session 244
Based on: task-watcher.py v3.0 (S109)
v5.0: chain_template expansion ported from v3.py (INFRA-001, S264)
v5.1: chain lifecycle complete — update_chain_after_step, Codex runner,
      auth pre-checks, Git Bash env, TG fix (INFRA-001/002/003/004, S264)

PARALLEL task watcher for pipeline/queue/.
Key differences from task-watcher.py (v3.0):
  - Runs up to N chains concurrently (config: max_concurrent_chains, default 2)
  - Each chain gets its own git worktree (isolated copy of repo)
  - HARD RULE: two chains CANNOT work on the same page simultaneously
  - After chain completes, changes are merged back to main branch
  - v5.0: Supports chain_template frontmatter — expands into N sequential/parallel steps
  - Original task-watcher.py is preserved as fallback (DEPRECATED)

Launch: python scripts/task-watcher-multi.py
Fallback: python scripts/task-watcher.py  (single-chain, original)
'''

import json
import logging
import os
import random
import re
import shutil
import signal
import subprocess
import sys
import threading
import time
import urllib.request
from concurrent.futures import ThreadPoolExecutor, Future
from dataclasses import dataclass
from datetime import datetime
from logging.handlers import RotatingFileHandler
from pathlib import Path

CONFIG_PATH = Path(__file__).parent / 'task-watcher-config.json'
DEFAULT_REPO_DIR = Path('C:/Dev/menuapp-code-review')
SYSTEM_RULES_NAME = 'cc-system-rules.txt'
WATCHER_VERSION = '5.1'
PIPELINE_AI_LABEL = 'CC + Codex v6.0 (CC-managed)'
ALLOWED_TOOLS = 'Bash,Read,Edit,Write'
HEARTBEAT_INTERVAL_SEC = 300
PROCESS_POLL_SEC = 5
DISCUSSION_AGENT = 'discussion-moderator'
DISCUSSION_CODEX_FILE_RE = re.compile(r'^codex-round\d+(?:-discussion)?\.md$')

# Chain template support (ported from v3.py, INFRA-001)
CHAIN_STATE_DIR_NAME = 'chain-state'
STEPS_DIR_NAME = 'steps'
CHAINS_DIR_NAME = 'chains'

DETACHED_FLAGS = (
    getattr(subprocess, 'DETACHED_PROCESS', 0)
    | getattr(subprocess, 'CREATE_NEW_PROCESS_GROUP', 0)
)

# ─────────────────────────────────────────
# Page lock: prevents two chains on same page
# Merge lock: serializes merges back to main
# ─────────────────────────────────────────
_page_lock = threading.Lock()
_active_pages: dict[str, str] = {}  # page_name -> task_id
_merge_lock = threading.Lock()  # only one merge at a time
_chain_state_lock = threading.RLock()  # chain state read/write serialization


@dataclass
class TaskContext:
    task_id: str
    timestamp: str
    task_file: Path
    prompt_body: str
    task_type: str
    page: str
    topic: str
    budget: str
    work_dir: Path
    pipeline_dir: Path
    start_epoch: int
    start_time_human: str
    progress_file: Path
    prompt_tmpfile: Path
    log_file: Path
    debug_file: Path
    done_file: Path
    managed_file: Path
    task_record_file: Path
    result_file: Path
    tg_id_file: Path
    pre_commit_file: Path
    cc_cost_file: Path
    cc_error_file: Path
    cdx_status_file: Path
    cc_analysis_file: Path
    started_file: Path
    codex_findings_file: Path
    merge_report_file: Path
    agent: str


def load_config() -> dict:
    if not CONFIG_PATH.exists():
        print(f"ERROR: Config not found: {CONFIG_PATH}")
        print("Create task-watcher-config.json from the .example file.")
        sys.exit(1)
    with open(CONFIG_PATH, encoding="utf-8") as f:
        return json.load(f)


# ─────────────────────────────────────────
# Logging
# ─────────────────────────────────────────

def setup_logging(pipeline_dir: Path, cfg: dict) -> logging.Logger:
    log_file = pipeline_dir / "task-watcher.log"
    logger = logging.getLogger("task-watcher")
    logger.handlers.clear()
    logger.setLevel(logging.DEBUG)
    logger.propagate = False

    log_cfg = cfg.get("logging", {})
    file_level = getattr(logging, log_cfg.get("file_level", "DEBUG").upper(), logging.DEBUG)
    console_level = getattr(logging, log_cfg.get("console_level", "INFO").upper(), logging.INFO)

    # P2 fix: rotate log at 5 MB, keep 3 backups (prevents unbounded growth)
    fh = RotatingFileHandler(
        log_file, maxBytes=5 * 1024 * 1024, backupCount=3, encoding="utf-8"
    )
    fh.setLevel(file_level)

    ch = logging.StreamHandler(sys.stdout)
    ch.setLevel(console_level)

    fmt = logging.Formatter(
        "%(asctime)s [%(levelname)s] %(message)s",
        datefmt="%H:%M:%S"
    )
    fh.setFormatter(fmt)
    ch.setFormatter(fmt)

    logger.addHandler(fh)
    logger.addHandler(ch)
    return logger


# ─────────────────────────────────────────
# PID file (BUG-3 fix: Windows-safe check)
# ─────────────────────────────────────────

def write_pid(pid_file: Path) -> None:
    pid_file.write_text(str(os.getpid()), encoding="utf-8")


def check_pid_running(pid_file: Path) -> bool:
    """
    Returns True if another watcher instance is still running.
    Uses tasklist on Windows for reliable PID check (os.kill can false-positive
    on Windows when the old PID was reused by an unrelated system process).
    Falls back to os.kill on non-Windows.
    """
    if not pid_file.exists():
        return False
    try:
        old_pid = int(pid_file.read_text(encoding="utf-8").strip())
    except (ValueError, OSError):
        return False

    # Try Windows tasklist first (P2 fix: check PID only, not process name —
    # checking for "python" caused false negatives when launched via py.exe)
    try:
        result = subprocess.run(
            ["tasklist", "/FI", f"PID eq {old_pid}", "/FO", "CSV", "/NH"],
            capture_output=True, text=True, timeout=5
        )
        # tasklist prints "No tasks..." when PID is absent; CSV row when present
        if str(old_pid) in result.stdout:
            return True
        return False
    except (FileNotFoundError, subprocess.TimeoutExpired):
        pass  # tasklist not available (non-Windows) → fall back to os.kill

    # POSIX fallback
    try:
        os.kill(old_pid, 0)
        return True
    except OSError:
        return False


def cleanup_pid(pid_file: Path) -> None:
    try:
        pid_file.unlink(missing_ok=True)
    except OSError:
        pass


# ─────────────────────────────────────────
# Telegram helpers (stdlib only)
# ─────────────────────────────────────────

def tg_send(bot_token: str, chat_id: str, text: str, logger: logging.Logger) -> str:
    """Send a new Telegram message. Returns message_id string or ''."""
    url = f"https://api.telegram.org/bot{bot_token}/sendMessage"
    payload = json.dumps({"chat_id": chat_id, "text": text}).encode("utf-8")
    try:
        req = urllib.request.Request(
            url, data=payload,
            headers={"Content-Type": "application/json"}
        )
        with urllib.request.urlopen(req, timeout=10) as resp:
            result = json.loads(resp.read())
            msg_id = str(result.get("result", {}).get("message_id", ""))
            logger.debug(f"TG sendMessage ok: msg_id={msg_id}")
            return msg_id
    except Exception as exc:
        logger.warning(f"TG sendMessage failed: {exc}")
        return ""


def tg_edit(bot_token: str, chat_id: str, msg_id: str, text: str,
            logger: logging.Logger) -> bool:
    """Edit an existing Telegram message. Returns True on success."""
    if not msg_id:
        return False
    url = f"https://api.telegram.org/bot{bot_token}/editMessageText"
    try:
        msg_id_int = int(msg_id)
    except (ValueError, TypeError):
        logger.warning(f"TG edit: invalid msg_id={msg_id!r}")
        return False
    payload = json.dumps({
        "chat_id": chat_id,
        "message_id": msg_id_int,
        "text": text
    }).encode("utf-8")
    try:
        req = urllib.request.Request(
            url, data=payload,
            headers={"Content-Type": "application/json"}
        )
        with urllib.request.urlopen(req, timeout=10) as resp:
            result = json.loads(resp.read())
            ok = result.get("ok", False)
            logger.debug(f"TG editMessageText ok={ok} msg_id={msg_id}")
            return ok
    except Exception as exc:
        logger.warning(f"TG editMessageText failed: {exc}")
        return False


# ─────────────────────────────────────────
# Recovery: interrupted tasks (S82 bug fix)
# BUG-4 fix: age cutoff prevents false [INTERRUPTED] for old tasks
# ─────────────────────────────────────────

def recover_interrupted_tasks(
        pipeline_dir: Path,
        bot_token: str,
        chat_id: str,
        cfg: dict,
        logger: logging.Logger
) -> None:
    """
    On startup: find .managed files (without .done) that are recent enough.
    These are tasks interrupted by PC restart or watcher kill.
    Sends [INTERRUPTED] TG edit + creates .done to prevent re-processing.
    Fixes S82 bug: [DONE] notification lost on PC restart.

    Age cutoff (default 24h) prevents false alerts for historical task files
    that predate the .done convention or were left without .done intentionally.
    """
    recovery_max_age_hours = cfg.get("watcher", {}).get("recovery_max_age_hours", 24)
    cutoff = time.time() - recovery_max_age_hours * 3600
    recovered = 0

    for managed_file in sorted(pipeline_dir.glob("task-*.managed")):
        # Skip files older than cutoff (BUG-4 fix)
        try:
            if managed_file.stat().st_mtime < cutoff:
                continue
        except OSError:
            continue

        task_id = managed_file.stem
        done_file = pipeline_dir / f"{task_id}.done"

        if done_file.exists():
            continue  # Already completed normally

        logger.info(f"Recovery: interrupted task: {task_id}")

        # Edit the TG message if we have the message_id
        tg_id_file = pipeline_dir / f"{task_id}.tg_msg_id"
        if tg_id_file.exists():
            try:
                msg_id = tg_id_file.read_text(encoding="utf-8").strip()
                if msg_id:
                    text = (
                        f"[INTERRUPTED] {task_id}\n\n"
                        f"Watcher was restarted (PC reboot?).\n"
                        f"Check pipeline/{task_id}.log for details.\n"
                        f"Re-queue the task if needed."
                    )
                    tg_edit(bot_token, chat_id, msg_id, text, logger)
            except OSError as exc:
                logger.warning(f"Recovery: cannot read tg_msg_id for {task_id}: {exc}")

        # Mark as done to prevent re-processing
        done_file.write_text("interrupted", encoding="utf-8")
        recovered += 1
        logger.info(f"Recovery: marked {task_id} as interrupted")

    if recovered:
        logger.info(f"Recovery complete: {recovered} interrupted task(s) handled")


# ─────────────────────────────────────────
# YAML frontmatter parser
# ─────────────────────────────────────────

def parse_frontmatter(content: str) -> dict:
    """
    Parse simple YAML frontmatter between first --- and second --- markers.
    Returns dict of key: value pairs.
    Handles: quoted values, values with colons, Windows line endings.
    """
    meta: dict = {}
    if not content.startswith("---"):
        return meta
    end = content.find("---", 3)
    if end == -1:
        return meta
    block = content[3:end].strip()
    for line in block.splitlines():
        line = line.strip()
        if not line or line.startswith("#") or ":" not in line:
            continue
        key, _, val = line.partition(":")
        meta[key.strip()] = val.strip().strip("\"'")
    return meta


def clean_budget(raw: str) -> str:
    """Strip quotes and $ signs: '$12' → '12', '\"$12\"' → '12'"""
    cleaned = re.sub(r'[$"\']', "", raw).strip()
    return cleaned if cleaned else "10.00"


# ─────────────────────────────────────────
# Page lock helpers (v4.0)
# ─────────────────────────────────────────

def extract_all_pages(meta: dict) -> set[str]:
    """
    Extract ALL pages touched by this task (target + context).
    HARD RULE: two chains cannot work on overlapping page sets.

    Frontmatter fields checked:
      - page: primary target page (always present)
      - context_pages: comma-separated list of pages read as context
    """
    pages: set[str] = set()
    primary = meta.get('page', '').strip()
    if primary:
        pages.add(primary.lower())

    # context_pages: "PublicMenu, CartView" → {"publicmenu", "cartview"}
    ctx_raw = meta.get('context_pages', '')
    for p in ctx_raw.split(','):
        p = p.strip()
        if p:
            pages.add(p.lower())
    return pages


def try_acquire_pages(pages: set[str], task_id: str, logger: logging.Logger) -> bool:
    """
    Try to lock all pages for this task. Returns True if successful.
    If ANY page is already locked by another task, returns False (no partial lock).
    """
    with _page_lock:
        # Check for conflicts
        for page in pages:
            if page in _active_pages:
                blocking_task = _active_pages[page]
                logger.info(
                    f'Page lock conflict: "{page}" is locked by {blocking_task}, '
                    f'cannot start {task_id}'
                )
                return False
        # All clear — acquire all pages atomically
        for page in pages:
            _active_pages[page] = task_id
        logger.info(f'Page lock acquired: {pages} for {task_id}')
        return True


def release_pages(pages: set[str], task_id: str, logger: logging.Logger) -> None:
    """Release page locks after task completion."""
    with _page_lock:
        for page in pages:
            if _active_pages.get(page) == task_id:
                del _active_pages[page]
        logger.info(f'Page lock released: {pages} for {task_id}')


# ─────────────────────────────────────────
# Git worktree helpers (v4.0)
# ─────────────────────────────────────────

def create_worktree(
    repo_dir: Path, task_id: str, logger: logging.Logger
) -> Path | None:
    """
    Create a git worktree for this task.
    Returns the worktree path, or None on failure.

    Worktree is created at: <repo_dir>/../worktrees/<task_id>/
    Branch name: wt-<task_id>
    """
    worktrees_root = repo_dir.parent / 'worktrees'
    worktrees_root.mkdir(parents=True, exist_ok=True)
    wt_path = worktrees_root / task_id
    branch_name = f'wt-{task_id}'

    if wt_path.exists():
        logger.warning(f'Worktree path already exists, removing: {wt_path}')
        try:
            # Remove stale worktree registration first
            subprocess.run(
                ['git', 'worktree', 'remove', '--force', str(wt_path)],
                cwd=str(repo_dir), capture_output=True, timeout=30,
            )
        except Exception:
            pass
        if wt_path.exists():
            shutil.rmtree(str(wt_path), ignore_errors=True)

    try:
        proc = subprocess.run(
            ['git', 'worktree', 'add', '-b', branch_name, str(wt_path), 'HEAD'],
            cwd=str(repo_dir),
            capture_output=True,
            text=True,
            timeout=60,
        )
        if proc.returncode != 0:
            logger.error(f'git worktree add failed: {proc.stderr.strip()}')
            return None
        logger.info(f'Worktree created: {wt_path} (branch: {branch_name})')
        return wt_path
    except Exception as exc:
        logger.error(f'git worktree add exception: {exc}')
        return None


def merge_worktree_to_main(
    repo_dir: Path, wt_path: Path, task_id: str, logger: logging.Logger
) -> bool:
    """
    Merge worktree branch back to main.
    Steps:
      1. In worktree: commit any uncommitted changes (CC should have committed, but just in case)
      2. In main repo: git merge wt-<task_id> --no-edit
      3. Push to remote
    Returns True on success.
    """
    branch_name = f'wt-{task_id}'

    # Step 1: Check if worktree has uncommitted changes
    try:
        status = subprocess.run(
            ['git', 'status', '--porcelain'],
            cwd=str(wt_path), capture_output=True, text=True, timeout=15,
        )
        if status.stdout.strip():
            logger.warning(f'Worktree has uncommitted changes, committing...')
            subprocess.run(
                ['git', 'add', '-A'],
                cwd=str(wt_path), capture_output=True, timeout=15,
            )
            subprocess.run(
                ['git', 'commit', '-m', f'auto-commit: uncommitted changes from {task_id}'],
                cwd=str(wt_path), capture_output=True, timeout=30,
            )
    except Exception as exc:
        logger.warning(f'Worktree cleanup commit failed: {exc}')

    # Step 2: Merge branch into main
    try:
        # First, make sure we're on main in the main repo
        subprocess.run(
            ['git', 'checkout', 'main'],
            cwd=str(repo_dir), capture_output=True, text=True, timeout=15,
        )
        proc = subprocess.run(
            ['git', 'merge', branch_name, '--no-edit'],
            cwd=str(repo_dir),
            capture_output=True,
            text=True,
            timeout=60,
        )
        if proc.returncode != 0:
            logger.error(f'Merge failed for {branch_name}: {proc.stderr.strip()}')
            logger.error(f'MANUAL INTERVENTION NEEDED: resolve merge in {repo_dir}')
            return False
        logger.info(f'Merged {branch_name} into main successfully')
    except Exception as exc:
        logger.error(f'Merge exception for {branch_name}: {exc}')
        return False

    # Step 3: Push
    try:
        subprocess.run(
            ['git', 'push'],
            cwd=str(repo_dir), capture_output=True, text=True, timeout=60,
        )
        logger.info(f'Pushed merged changes to remote')
    except Exception as exc:
        logger.warning(f'Push after merge failed (non-fatal): {exc}')

    return True


def cleanup_worktree(
    repo_dir: Path, wt_path: Path, task_id: str, logger: logging.Logger
) -> None:
    """Remove worktree and its branch after merge."""
    branch_name = f'wt-{task_id}'
    try:
        subprocess.run(
            ['git', 'worktree', 'remove', '--force', str(wt_path)],
            cwd=str(repo_dir), capture_output=True, timeout=30,
        )
        logger.info(f'Worktree removed: {wt_path}')
    except Exception as exc:
        logger.warning(f'Worktree remove failed: {exc}')

    # Delete branch
    try:
        subprocess.run(
            ['git', 'branch', '-D', branch_name],
            cwd=str(repo_dir), capture_output=True, timeout=15,
        )
        logger.debug(f'Branch deleted: {branch_name}')
    except Exception as exc:
        logger.debug(f'Branch delete failed (non-fatal): {exc}')

    # Cleanup directory if still exists
    if wt_path.exists():
        shutil.rmtree(str(wt_path), ignore_errors=True)


# ─────────────────────────────────────────
# Task runner
# ─────────────────────────────────────────


def iso_now() -> str:
    return datetime.now().astimezone().isoformat(timespec='seconds')


def read_text(path: Path) -> str:
    try:
        return path.read_text(encoding='utf-8', errors='replace')
    except OSError:
        return ''


def write_text(path: Path, text: str) -> None:
    path.write_text(text, encoding='utf-8')


def append_text(path: Path, text: str) -> None:
    with path.open('a', encoding='utf-8', newline='\n') as handle:
        handle.write(text)


def safe_unlink(path: Path) -> None:
    try:
        path.unlink(missing_ok=True)
    except OSError:
        pass


def read_msg_id(path: Path) -> str:
    try:
        return path.read_text(encoding='utf-8').strip()
    except OSError:
        return ''


def progress_snapshot(progress_file: Path) -> str:
    return read_text(progress_file).strip() or '[running]'


def repo_dir_from_config(cfg: dict) -> Path:
    raw = cfg.get('paths', {}).get('repo_dir', '')
    return Path(raw) if raw else DEFAULT_REPO_DIR


# ─────────────────────────────────────────
# Chain template support (ported from v3.py, INFRA-001)
# ─────────────────────────────────────────


def parse_simple_yaml(text: str) -> dict:
    """Parse a simple YAML file (flat keys + list of dicts under 'steps:')."""
    result: dict = {}
    lines = text.splitlines()
    i = 0
    while i < len(lines):
        line = lines[i].rstrip()
        if not line or line.lstrip().startswith('#'):
            i += 1
            continue
        if ':' not in line:
            i += 1
            continue
        key, _, val = line.partition(':')
        key = key.strip()
        val = val.strip().strip("\"'")
        if key == 'steps' and not val:
            steps = []
            current_step: dict | None = None
            i += 1
            while i < len(lines):
                sline = lines[i].rstrip()
                if not sline.strip() or sline.strip().startswith('#'):
                    i += 1
                    continue
                stripped = sline.lstrip()
                indent = len(sline) - len(stripped)
                if indent == 0 and not stripped.startswith('-'):
                    break
                if stripped.startswith('- '):
                    if current_step is not None:
                        steps.append(current_step)
                    current_step = {}
                    entry = stripped[2:].strip()
                    if ':' in entry:
                        ek, _, ev = entry.partition(':')
                        current_step[ek.strip()] = ev.strip().strip("\"'")
                    i += 1
                    continue
                if current_step is not None and ':' in stripped:
                    ck, _, cv = stripped.partition(':')
                    current_step[ck.strip()] = cv.strip().strip("\"'")
                i += 1
            if current_step is not None:
                steps.append(current_step)
            result['steps'] = steps
        else:
            result[key] = val
            i += 1
    return result


def load_chain_recipe(pipeline_dir: Path, template_name: str, logger: logging.Logger) -> dict | None:
    """Load a chain recipe from pipeline/chains/{template_name}.yaml"""
    chains_dir = pipeline_dir / CHAINS_DIR_NAME
    recipe_file = chains_dir / f'{template_name}.yaml'
    if not recipe_file.exists():
        logger.error(f'Chain recipe not found: {recipe_file}')
        return None
    try:
        content = recipe_file.read_text(encoding='utf-8')
        return parse_simple_yaml(content)
    except Exception as exc:
        logger.error(f'Cannot parse chain recipe {recipe_file}: {exc}')
        return None


def load_step_template(pipeline_dir: Path, step_name: str, logger: logging.Logger) -> str | None:
    """Load a step prompt template from pipeline/steps/{step_name}.md"""
    steps_dir = pipeline_dir / STEPS_DIR_NAME
    step_file = steps_dir / f'{step_name}.md'
    if not step_file.exists():
        logger.error(f'Step template not found: {step_file}')
        return None
    try:
        return step_file.read_text(encoding='utf-8')
    except Exception as exc:
        logger.error(f'Cannot read step template {step_file}: {exc}')
        return None


def load_chain_state(pipeline_dir: Path, chain_id: str) -> dict:
    """Load chain state from pipeline/chain-state/{chain_id}.json."""
    state_dir = pipeline_dir / CHAIN_STATE_DIR_NAME
    state_file = state_dir / f'{chain_id}.json'
    with _chain_state_lock:
        if not state_file.exists():
            return {}
        try:
            return json.loads(state_file.read_text(encoding='utf-8'))
        except Exception:
            return {}


def save_chain_state(pipeline_dir: Path, chain_id: str, state: dict) -> None:
    """Save chain state to pipeline/chain-state/{chain_id}.json."""
    state_dir = pipeline_dir / CHAIN_STATE_DIR_NAME
    with _chain_state_lock:
        state_dir.mkdir(parents=True, exist_ok=True)
        state_file = state_dir / f'{chain_id}.json'
        state_file.write_text(json.dumps(state, indent=2, ensure_ascii=False), encoding='utf-8')


def generate_chain_id(page: str) -> str:
    """Generate a unique chain ID like 'profile-260318-143022-a3f1'."""
    ts = datetime.now().strftime('%y%m%d-%H%M%S')
    slug = re.sub(r'[^a-z0-9]+', '-', page.lower()).strip('-') or 'task'
    suffix = f'{random.randint(0, 0xFFFF):04x}'
    return f'{slug}-{ts}-{suffix}'


def resolve_inline_source(page: str, task_body: str, cfg: dict, logger: logging.Logger) -> str:
    """
    KB-127b: Read the target source file and return numbered lines for inline embedding.
    Looks for RELEASE file in pages/{page}/, falls back to x.jsx.
    """
    repo_dir = repo_dir_from_config(cfg)
    page_dir = repo_dir / 'pages' / page
    if not page_dir.is_dir():
        logger.warning(f'resolve_inline_source: page dir not found: {page_dir}')
        return ''

    release_files = sorted(page_dir.glob('*RELEASE*.jsx'), reverse=True)
    target_file = release_files[0] if release_files else None

    if not target_file:
        x_file = page_dir / 'x.jsx'
        if x_file.exists():
            target_file = x_file

    if not target_file:
        logger.warning(f'resolve_inline_source: no source file found in {page_dir}')
        return ''

    try:
        content = target_file.read_text(encoding='utf-8', errors='replace')
        lines = content.splitlines()
        numbered = [f'{i+1:5d}: {line}' for i, line in enumerate(lines)]
        result = '\n'.join(numbered)
        logger.info(f'resolve_inline_source: loaded {target_file.name} ({len(lines)} lines, {len(result)} chars)')
        return f'File: {target_file.name} ({len(lines)} lines)\n\n{result}'
    except Exception as e:
        logger.warning(f'resolve_inline_source: error reading {target_file}: {e}')
        return ''


def expand_chain_to_tasks(
    task_file: Path,
    meta: dict,
    task_body: str,
    recipe: dict,
    chain_id: str,
    pipeline_dir: Path,
    logger: logging.Logger,
    cfg: dict | None = None,
) -> list[Path]:
    """
    Expand a chain template task into individual step task files in queue/.
    Steps with the same 'group' get the same chain_step number (run in parallel).
    """
    queue_dir = pipeline_dir / 'queue'
    steps = recipe.get('steps', [])
    if not steps:
        logger.error(f'Chain recipe has no steps')
        return []

    page = meta.get('page', 'Unknown')
    raw_budget = str(meta.get('budget_per_step', meta.get('budget', '5'))).strip().lstrip('$')
    base_budget = float(raw_budget) if raw_budget else 5.0

    logical_steps: list[tuple[int, dict]] = []
    current_logical = 0
    active_group: str | None = None
    group_sizes: dict[int, int] = {}

    for step_def in steps:
        group = step_def.get('group', '')
        if group and group == active_group:
            logical_steps.append((current_logical, step_def))
            group_sizes[current_logical] = group_sizes.get(current_logical, 1) + 1
        else:
            current_logical += 1
            logical_steps.append((current_logical, step_def))
            group_sizes[current_logical] = 1
            active_group = group if group else None

    total_logical_steps = current_logical
    created_files: list[Path] = []

    for seq_idx, (logical_num, step_def) in enumerate(logical_steps):
        step_name = step_def.get('step', '')
        multiplier = float(step_def.get('budget_multiplier', '1.0'))
        step_budget = f'{base_budget * multiplier:.2f}'

        step_template = load_step_template(pipeline_dir, step_name, logger)
        if step_template is None:
            logger.error(f'Missing step template: {step_name}, aborting chain expansion')
            for f in created_files:
                try:
                    f.unlink(missing_ok=True)
                except OSError:
                    pass
            return []

        prompt = step_template
        prompt = prompt.replace('{{PAGE}}', page)
        prompt = prompt.replace('{{TASK_BODY}}', task_body)
        prompt = prompt.replace('{{CHAIN_ID}}', chain_id)
        prompt = prompt.replace('{{STEP_NUM}}', str(logical_num))
        prompt = prompt.replace('{{TOTAL_STEPS}}', str(total_logical_steps))
        prompt = prompt.replace('{{STEP_NAME}}', step_name)

        # KB-127b: Inline source code for Codex pssk-review steps
        if '{{INLINE_SOURCE}}' in prompt and cfg:
            inline_src = resolve_inline_source(page, task_body, cfg, logger)
            if inline_src:
                prompt = prompt.replace('{{INLINE_SOURCE}}', inline_src)
            else:
                prompt = prompt.replace('{{INLINE_SOURCE}}', '(source file not found — reviewer may need to read from disk)')

        step_filename = f'chain-{chain_id}-step-{logical_num:02d}-{step_name}.md'
        step_path = queue_dir / step_filename

        runner = step_def.get('runner', 'cc')
        group = step_def.get('group', '')
        grp_size = group_sizes.get(logical_num, 1)
        group_line = f'chain_group: {group}\nchain_group_size: {grp_size}\n' if group else ''

        frontmatter = (
            f'---\n'
            f'chain: {chain_id}\n'
            f'chain_step: {logical_num}\n'
            f'chain_total: {total_logical_steps}\n'
            f'chain_step_name: {step_name}\n'
            f'{group_line}'
            f'page: {page}\n'
            f'budget: {step_budget}\n'
            f'runner: {runner}\n'
            f'type: {meta.get("type", "chain-step")}\n'
            f'---\n'
        )

        step_path.write_text(frontmatter + prompt, encoding='utf-8')
        created_files.append(step_path)
        grp_label = f' [group:{group}]' if group else ''
        logger.info(f'  Created step {logical_num}/{total_logical_steps}{grp_label}: {step_filename} (${step_budget})')

    return created_files


def can_run_chain_step(meta: dict, pipeline_dir: Path, logger: logging.Logger) -> bool:
    """
    Check if a chain step task can run now.
    Step 1 can always run. Step N requires step N-1 to be completed.
    """
    chain_id = meta.get('chain', '')
    if not chain_id:
        return True

    chain_step = int(meta.get('chain_step', '1'))
    if chain_step <= 1:
        return True

    state = load_chain_state(pipeline_dir, chain_id)
    if not state:
        logger.warning(f'Chain state not found for {chain_id}, allowing step {chain_step}')
        return True

    if state.get('status') == 'paused':
        return False

    completed = state.get('completed_step', 0)
    if completed < chain_step - 1:
        return False

    # KB-092: inter_step_delay_sec
    delay_sec = int(state.get('inter_step_delay_sec', 0))
    if delay_sec > 0:
        last_completed_at = state.get('last_step_completed_at', '')
        if last_completed_at:
            try:
                last_dt = datetime.fromisoformat(last_completed_at)
                elapsed = (datetime.now(last_dt.tzinfo) - last_dt).total_seconds()
                if elapsed < delay_sec:
                    remaining = int(delay_sec - elapsed)
                    logger.debug(f'Chain {chain_id} step {chain_step}: waiting {remaining}s inter-step delay (KB-092)')
                    return False
            except (ValueError, TypeError):
                pass
    return True


def parse_step_metrics(chain_id: str, step_name: str, pipeline_dir: Path) -> str:
    """Parse key metrics from step result files. Returns short string for TG."""
    candidates = [
        DEFAULT_REPO_DIR / 'pipeline' / CHAIN_STATE_DIR_NAME,
        pipeline_dir / CHAIN_STATE_DIR_NAME,
    ]
    state_dir = pipeline_dir / CHAIN_STATE_DIR_NAME
    for d in candidates:
        if d.is_dir() and list(d.glob(f'{chain_id}-*.md')):
            state_dir = d
            break

    def _safe_read(path: Path) -> str:
        for enc in ('utf-8', 'utf-8-sig', 'cp1252', 'latin-1'):
            try:
                return path.read_text(encoding=enc)
            except (UnicodeDecodeError, OSError):
                continue
        return ''

    try:
        if step_name in ('cc-writer', 'codex-writer', 'codex-writer-v2'):
            prefix = 'cc' if step_name == 'cc-writer' else 'codex'
            findings_file = state_dir / f'{chain_id}-{prefix}-findings.md'
            if findings_file.exists():
                text = _safe_read(findings_file)
                m = re.search(r'Total:\s*(\d+)\s*findings?', text)
                if m:
                    return f'{m.group(1)} findings'
                count = len(re.findall(r'^\d+\.\s*\[P', text, re.MULTILINE))
                if count:
                    return f'{count} findings'
        elif step_name == 'comparator':
            comp_file = state_dir / f'{chain_id}-comparison.md'
            if comp_file.exists():
                text = _safe_read(comp_file)
                agreed = re.search(r'Agreed:\s*(\d+)', text)
                disputes = re.search(r'Disputes:\s*(\d+)', text)
                a = agreed.group(1) if agreed else '0'
                d = disputes.group(1) if disputes else '0'
                return f'{a} agreed / {d} disputes'
        elif step_name in ('discussion', 'discussion-cc-only'):
            disc_file = state_dir / f'{chain_id}-discussion.md'
            if disc_file.exists():
                text = _safe_read(disc_file)
                if 'No disputes' in text or 'no disputes' in text.lower() or '0 disputes' in text:
                    return 'no disputes, skipped'
    except Exception:
        pass
    return ''


def _format_step_line(step_data: dict, metrics: str = '') -> str:
    """Format a single step line for TG chain summary."""
    name = step_data.get('step_name', '?')
    status = step_data.get('status', '?')
    runner = step_data.get('runner', 'cc')
    cost = step_data.get('cost', '0.00')
    dur = int(step_data.get('duration_sec', 0))

    runner_label = 'Codex' if runner == 'codex' else 'CC'
    if status == 'completed':
        st = 'OK'
    elif status == 'error':
        reason = step_data.get('error_reason', '')
        st = f'FAIL — {reason}' if reason else 'FAIL'
    else:
        st = status.upper()

    dur_text = f'{dur // 60}m' if dur >= 60 else f'{dur}s'
    parts = [f'{name} ({runner_label}): {st}']
    if metrics:
        parts.append(metrics)
    parts.append(cost if 'tok' in cost else f'${cost}')
    parts.append(dur_text)
    return ', '.join(parts)


def build_chain_live_text(state: dict, pipeline_dir: Path | None = None) -> str:
    """Build a live-updating TG text for the entire chain from chain state."""
    chain_id = state.get('chain_id', '?')
    page = state.get('page', '?')
    template = state.get('template', 'chain')
    step_names = state.get('step_names', [])
    steps = state.get('steps', {})
    created = state.get('created', '')

    start_time = '?'
    if created:
        try:
            start_time = created.split('T')[1][:5]
        except (IndexError, ValueError):
            pass

    lines = [
        f'[{template}] {page}',
        f'RUNNING | {start_time}',
        '--- Steps ---',
    ]

    shown = set()
    for name in step_names:
        found = False
        for key, sdata in steps.items():
            if sdata.get('step_name') == name and key not in shown:
                status = sdata.get('status', '?')
                if status == 'completed':
                    metrics = ''
                    if pipeline_dir:
                        metrics = parse_step_metrics(chain_id, name, pipeline_dir)
                    lines.append(_format_step_line(sdata, metrics))
                elif status == 'error':
                    runner = 'Codex' if sdata.get('runner', 'cc') == 'codex' else 'CC'
                    lines.append(f'{name} ({runner}): FAIL')
                elif status == 'running':
                    runner = 'Codex' if sdata.get('runner', 'cc') == 'codex' else 'CC'
                    lines.append(f'{name} ({runner}): running...')
                else:
                    runner = 'Codex' if sdata.get('runner', 'cc') == 'codex' else 'CC'
                    lines.append(f'{name} ({runner}): {status}')
                shown.add(key)
                found = True
                break
        if not found:
            lines.append(f'{name}: waiting')

    return '\n'.join(lines)


def _build_chain_summary(state: dict, is_failed: bool, failed_step: str = '',
                         pipeline_dir: Path | None = None) -> str:
    """Build detailed chain summary TG message."""
    chain_id = state.get('chain_id', '?')
    page = state.get('page', '?')
    template = state.get('template', 'chain')
    total_steps = state.get('total_steps', 0)
    steps = state.get('steps', {})

    status_label = 'FAILED' if is_failed else 'DONE'

    created = state.get('created', '')
    start_time = '?'
    if created:
        try:
            start_time = created.split('T')[1][:5]
        except (IndexError, ValueError):
            pass
    end_time = datetime.now().astimezone().strftime('%H:%M')

    def _safe_cost(c: str) -> float:
        try:
            return float(c)
        except (ValueError, TypeError):
            return 0.0
    total_cost = sum(_safe_cost(s.get('cost', '0')) for s in steps.values())
    total_dur = sum(int(s.get('duration_sec', 0)) for s in steps.values())
    dur_text = f'{total_dur // 60}m' if total_dur >= 60 else f'{total_dur}s'

    lines = [
        f'[{template}] {page}',
        f'{status_label} | {start_time} -> {end_time} ({dur_text})',
        '--- Steps ---',
    ]

    step_names_ordered = state.get('step_names', [])
    shown = set()
    for name in step_names_ordered:
        for key, sdata in steps.items():
            if sdata.get('step_name') == name and key not in shown:
                metrics = ''
                if pipeline_dir and sdata.get('status') == 'completed':
                    metrics = parse_step_metrics(chain_id, name, pipeline_dir)
                lines.append(_format_step_line(sdata, metrics))
                shown.add(key)
                break
        else:
            lines.append(f'{name}: --')

    for key, sdata in sorted(steps.items()):
        if key not in shown:
            lines.append(_format_step_line(sdata))

    completed_count = sum(1 for s in steps.values() if s.get('status') == 'completed')
    lines.append('--- Result ---')
    if is_failed:
        lines.append(f'FAILED at: {failed_step}')
        lines.append(f'Total: ${total_cost:.2f} | {completed_count}/{total_steps} steps')
    else:
        lines.append(f'Total: ${total_cost:.2f} | {completed_count}/{total_steps} steps')

    return '\n'.join(lines)


def update_chain_tg(
    chain_id: str,
    pipeline_dir: Path,
    bot_token: str,
    chat_id: str,
    logger: logging.Logger,
    text: str | None = None,
) -> None:
    """Edit the chain's single TG message with the given text or live status."""
    state = load_chain_state(pipeline_dir, chain_id)
    msg_id = str(state.get('tg_msg_id', ''))
    if not msg_id:
        logger.warning(f'No TG msg_id for chain {chain_id}')
        return
    if text is None:
        text = build_chain_live_text(state, pipeline_dir)
    tg_edit(bot_token, chat_id, msg_id, text, logger)


def mark_chain_step_running(
    meta: dict,
    pipeline_dir: Path,
    bot_token: str,
    chat_id: str,
    logger: logging.Logger,
) -> None:
    """Mark a chain step as 'running' in chain state and update chain TG."""
    chain_id = meta.get('chain', '')
    if not chain_id:
        return
    step_name = meta.get('chain_step_name', '?')
    chain_step = int(meta.get('chain_step', '1'))
    runner = meta.get('runner', 'cc')

    with _chain_state_lock:
        state = load_chain_state(pipeline_dir, chain_id)
        if not state:
            return

        step_key = f'{chain_step}-{step_name}'
        state['steps'][step_key] = {
            'step_name': step_name,
            'chain_step': chain_step,
            'status': 'running',
            'runner': runner,
        }
        save_chain_state(pipeline_dir, chain_id, state)
        update_chain_tg(chain_id, pipeline_dir, bot_token, chat_id, logger)


def build_chain_step_prompt(ctx: TaskContext) -> str:
    """Lightweight prompt wrapper for chain steps (no Codex integration)."""
    dq = chr(34)
    progress_str = ctx.progress_file.as_posix()
    started_str = ctx.started_file.as_posix()
    analysis_str = ctx.cc_analysis_file.as_posix()

    return f'''\
IMPORTANT: Your VERY FIRST action must be: echo {dq}started $(date -Iseconds){dq} > {dq}{started_str}{dq}

=== TASK SETUP ===
Progress file: {progress_str}
Task ID: {ctx.task_id}
=== END TASK SETUP ===

=== PROGRESS UPDATES ===
Update progress file after each major step:
  echo {dq}[CC] $(date +%H:%M) <status>{dq} >> {dq}{progress_str}{dq}
=== END PROGRESS ===

=== GIT RULES ===
- Capture pre-task commit: PRE=$(git rev-parse HEAD)
- After ALL fixes: git add <specific files only> && git commit -m 'fix: <description>'
- Push with retry: git push || (git pull --rebase && git push)
- NEVER use git add . or git add -A
- Update BUGS.md in the page folder
=== END GIT RULES ===

{ctx.prompt_body}

=== FINAL STEPS ===
1. Write final summary to: {analysis_str}
2. Update progress: echo {dq}[OK] $(date +%H:%M) DONE{dq} >> {dq}{progress_str}{dq}
=== END FINAL STEPS ==='''


def expand_chain_task_if_needed(
    task_file: Path,
    pipeline_dir: Path,
    bot_token: str,
    chat_id: str,
    logger: logging.Logger,
    cfg: dict | None = None,
) -> bool:
    """
    Check if a task file uses chain_template. If so, expand it into step files.
    Returns True if the task was a chain (expanded or failed), False if regular task.
    """
    try:
        content = task_file.read_text(encoding='utf-8')
    except OSError:
        return False

    meta = parse_frontmatter(content)
    template_name = meta.get('chain_template', '')
    if not template_name:
        return False

    page = meta.get('page', task_file.stem)
    logger.info(f'Chain task detected: template={template_name}, page={page}')

    # KB-132: Rename task BEFORE expansion to prevent duplicate chain creation
    processing_path = task_file.parent / f'.processing-{task_file.name}'
    try:
        shutil.move(str(task_file), str(processing_path))
        task_file = processing_path
    except OSError as e:
        logger.warning(f'Cannot claim task file {task_file.name}: {e}')
        return True

    recipe = load_chain_recipe(pipeline_dir, template_name, logger)
    if recipe is None:
        error_path = pipeline_dir / f'error-{task_file.name}'
        shutil.move(str(task_file), str(error_path))
        tg_send(bot_token, chat_id,
                f'[ERROR] Chain template not found: {template_name}\nTask: {task_file.name}',
                logger)
        return True

    # INFRA-001c: Auth pre-checks before chain expansion (KB-106)
    steps = recipe.get('steps', [])
    needs_cc = any(s.get('runner', 'cc') == 'cc' for s in steps)
    needs_codex = any(s.get('runner', 'cc') == 'codex' for s in steps)
    if needs_cc and not check_cc_auth(logger):
        logger.warning(f'CC auth failed — deferring chain task {task_file.name}')
        # Put file back (restore from .processing- to original)
        orig_name = task_file.name.replace('.processing-', '')
        orig_path = task_file.parent / orig_name
        shutil.move(str(task_file), str(orig_path))
        tg_send(bot_token, chat_id, f'[WARN] CC auth expired — chain {template_name} deferred', logger)
        return True
    if needs_codex and not check_codex_auth(logger):
        logger.warning(f'Codex auth failed — deferring chain task {task_file.name}')
        orig_name = task_file.name.replace('.processing-', '')
        orig_path = task_file.parent / orig_name
        shutil.move(str(task_file), str(orig_path))
        tg_send(bot_token, chat_id, f'[WARN] Codex auth expired — chain {template_name} deferred', logger)
        return True

    # Extract task body (everything after frontmatter)
    task_body = content
    if content.startswith('---'):
        end = content.find('---', 3)
        if end != -1:
            task_body = content[end + 3:].strip()

    chain_id = generate_chain_id(page)
    steps = recipe.get('steps', [])
    logger.info(f'Expanding chain: {chain_id} ({len(steps)} steps)')

    created = expand_chain_to_tasks(task_file, meta, task_body, recipe, chain_id, pipeline_dir, logger, cfg=cfg)

    if not created:
        error_path = pipeline_dir / f'error-{task_file.name}'
        shutil.move(str(task_file), str(error_path))
        tg_send(bot_token, chat_id,
                f'[ERROR] Chain expansion failed: {template_name}\nTask: {task_file.name}',
                logger)
        return True

    # Initialize chain state
    total_steps = len(created)
    cfg_chain = load_config().get('chain', {})
    inter_step_delay = int(cfg_chain.get('inter_step_delay_sec', 60))
    state = {
        'chain_id': chain_id,
        'template': template_name,
        'page': page,
        'total_steps': total_steps,
        'completed_step': 0,
        'status': 'running',
        'steps': {},
        'created': iso_now(),
        'inter_step_delay_sec': inter_step_delay,
        'last_step_completed_at': None,
        'ws': meta.get('ws', ''),
    }
    save_chain_state(pipeline_dir, chain_id, state)

    # Move original task to pipeline/ (archive)
    archive_path = pipeline_dir / f'chain-origin-{chain_id}.md'
    shutil.move(str(task_file), str(archive_path))

    state['step_names'] = [s.get('step', '?') for s in steps]
    save_chain_state(pipeline_dir, chain_id, state)

    # Send TG message for chain (Fix 2: shows [template] and step names)
    initial_text = build_chain_live_text(state)
    msg_id = tg_send(bot_token, chat_id, initial_text, logger)
    if msg_id:
        state['tg_msg_id'] = msg_id
        save_chain_state(pipeline_dir, chain_id, state)
        logger.info(f'Chain {chain_id} TG message sent: msg_id={msg_id}')

    # Auto-create lock file for work stream (#291)
    ws = meta.get('ws', '')
    if ws:
        lock_path = pipeline_dir / 'signals' / f'lock-{ws}.md'
        if lock_path.exists():
            logger.warning(f'Lock file already exists: lock-{ws}.md — skipping')
        else:
            try:
                lock_path.parent.mkdir(parents=True, exist_ok=True)
                task_desc = meta.get('task', meta.get('description', task_file.name))
                lock_content = (
                    f'---\n'
                    f'ws: {ws}\n'
                    f'session: chain {chain_id}\n'
                    f'task: "{task_desc}"\n'
                    f'started: {datetime.now().strftime("%Y-%m-%d")}\n'
                    f'---\n\n'
                    f'Chain {chain_id} ({template_name}) working on {ws}.\n'
                    f'Auto-created by task-watcher-multi.py v{WATCHER_VERSION}.\n'
                    f'Will be removed when chain completes.\n'
                )
                lock_path.write_text(lock_content, encoding='utf-8')
                logger.info(f'Lock created: lock-{ws}.md (chain {chain_id})')
            except OSError as e:
                logger.warning(f'Failed to create lock file lock-{ws}.md: {e}')

    logger.info(f'Chain {chain_id} expanded: {total_steps} steps queued')
    return True


def cleanup_chain_artifacts(
    chain_id: str,
    state: dict,
    pipeline_dir: Path,
    logger: logging.Logger,
) -> int:
    """Move intermediate chain artifacts to pipeline/archive/<chain_id>/."""
    archive_dir = pipeline_dir / 'archive' / chain_id
    archive_dir.mkdir(parents=True, exist_ok=True)

    task_ids = set()
    for step_data in state.get('steps', {}).values():
        tid = step_data.get('task_id', '')
        if tid:
            task_ids.add(tid)

    moved = 0
    for f in pipeline_dir.iterdir():
        if not f.is_file():
            continue
        fname = f.name

        matched = False
        for tid in task_ids:
            if fname.startswith(tid) or fname.startswith(f'cc-analysis-{tid}') or \
               fname.startswith(f'progress-{tid}') or fname.startswith(f'result-{tid.replace("task-", "")}') or \
               fname.startswith(f'started-{tid}'):
                matched = True
                break

        if not matched and chain_id in fname and fname.startswith('chain-') and fname != f'chain-origin-{chain_id}.md':
            matched = True

        if matched:
            try:
                shutil.move(str(f), str(archive_dir / fname))
                moved += 1
            except Exception as e:
                logger.warning(f'cleanup_chain_artifacts: cannot move {fname}: {e}')

    return moved


def detect_error_reason(log_file: Path) -> str:
    """Parse CC/Codex log for error type. Returns short label for TG display.
    Ported from v3.py (line 1114)."""
    content = read_text(log_file)
    if not content:
        return 'crash'
    cl = content.lower()
    if 'authentication_error' in cl or '401' in content:
        return 'auth error'
    if 'rate_limit' in cl or '429' in content:
        return 'rate limit'
    if 'overloaded' in cl or '529' in content:
        return 'overloaded'
    if 'budget' in cl and ('exceeded' in cl or 'limit' in cl):
        return 'budget exceeded'
    if 'timeout' in cl or 'timed out' in cl:
        return 'timeout'
    if 'permission' in cl and 'denied' in cl:
        return 'permission denied'
    return 'error'


def kb095_check_and_fix(page: str, work_dir: Path, logger: logging.Logger) -> list[str]:
    """KB-095: Detect and auto-fix working copy truncation after merge step.
    Ported from v3.py (line 2505)."""
    if not page:
        return []
    page_dir = work_dir / 'pages' / page
    if not page_dir.exists():
        return []

    restored = []
    for jsx_file in sorted(page_dir.glob('*.jsx')):
        rel_path = f'pages/{page}/{jsx_file.name}'
        try:
            result = subprocess.run(
                ['git', 'show', f'HEAD:{rel_path}'],
                cwd=str(work_dir),
                capture_output=True,
                text=True,
                encoding='utf-8',
                errors='replace',
                timeout=30,
            )
            if result.returncode != 0:
                continue
            git_lines = result.stdout.count('\n')
            if git_lines == 0:
                continue
            wc_lines = jsx_file.read_text(encoding='utf-8', errors='replace').count('\n')
            if wc_lines < git_lines:
                diff = git_lines - wc_lines
                logger.warning(
                    f'KB-095: {jsx_file.name} truncated! '
                    f'WC={wc_lines} lines, HEAD={git_lines} lines (missing {diff}). Restoring...'
                )
                jsx_file.write_text(result.stdout, encoding='utf-8')
                logger.info(f'KB-095: {jsx_file.name} restored ({wc_lines}→{git_lines} lines)')
                restored.append(f'{jsx_file.name} ({wc_lines}→{git_lines})')
        except subprocess.TimeoutExpired:
            logger.warning(f'KB-095: timeout checking {jsx_file.name}')
        except Exception as e:
            logger.warning(f'KB-095: error checking {jsx_file.name}: {e}')
    return restored


def update_chain_after_step(
    meta: dict,
    task_id: str,
    is_error: bool,
    cost_text: str,
    pipeline_dir: Path,
    bot_token: str,
    chat_id: str,
    logger: logging.Logger,
    *,
    runner: str = 'cc',
    duration_sec: int = 0,
    files_count: int = 0,
    error_reason: str = '',
) -> None:
    """Update chain state after a step completes or fails.
    Ported from v3.py (line 2556). INFRA-001a."""
    chain_id = meta.get('chain', '')
    if not chain_id:
        return

    chain_step = int(meta.get('chain_step', '1'))
    chain_total = int(meta.get('chain_total', '1'))
    step_name = meta.get('chain_step_name', f'step-{chain_step}')

    with _chain_state_lock:
        state = load_chain_state(pipeline_dir, chain_id)
        if not state:
            state = {'chain_id': chain_id, 'total_steps': chain_total, 'completed_step': 0, 'status': 'running', 'steps': {}}

        step_key = f'{chain_step}-{step_name}'
        step_entry = {
            'task_id': task_id,
            'step_name': step_name,
            'chain_step': chain_step,
            'status': 'error' if is_error else 'completed',
            'cost': cost_text,
            'completed': iso_now(),
            'runner': runner,
            'duration_sec': duration_sec,
            'files_count': files_count,
        }
        if error_reason:
            step_entry['error_reason'] = error_reason
        state['steps'][step_key] = step_entry
        save_chain_state(pipeline_dir, chain_id, state)

    if is_error:
        state['status'] = 'paused'
        state['paused_at_step'] = chain_step
        save_chain_state(pipeline_dir, chain_id, state)

        # Remove remaining step files from queue to prevent running
        queue_dir = pipeline_dir / 'queue'
        for remaining in sorted(queue_dir.glob(f'chain-{chain_id}-step-*.md')):
            parked_dir = pipeline_dir / 'chain-parked'
            parked_dir.mkdir(parents=True, exist_ok=True)
            shutil.move(str(remaining), str(parked_dir / remaining.name))
            logger.info(f'Parked remaining step: {remaining.name}')

        # Mark remaining steps as skipped
        for name in state.get('step_names', []):
            found = any(s.get('step_name') == name for s in state.get('steps', {}).values())
            if not found:
                state['steps'][f'x-{name}'] = {
                    'step_name': name, 'status': 'skipped', 'cost': '0.00',
                    'runner': 'cc', 'duration_sec': 0, 'files_count': 0,
                }
        save_chain_state(pipeline_dir, chain_id, state)

        summary = _build_chain_summary(state, is_failed=True, failed_step=f'{step_name} (step {chain_step})',
                                       pipeline_dir=pipeline_dir)
        update_chain_tg(chain_id, pipeline_dir, bot_token, chat_id, logger, text=summary)
        logger.warning(f'Chain {chain_id} PAUSED at step {chain_step} ({step_name})')

    else:
        # For groups: only advance completed_step when ALL members at this level are done
        group_size = int(meta.get('chain_group_size', '1'))
        if group_size > 1:
            completed_at_level = sum(
                1 for s in state.get('steps', {}).values()
                if s.get('chain_step') == chain_step and s.get('status') == 'completed'
            )
            if completed_at_level < group_size:
                save_chain_state(pipeline_dir, chain_id, state)
                update_chain_tg(chain_id, pipeline_dir, bot_token, chat_id, logger)
                logger.info(f'Chain {chain_id} step {chain_step} group: {completed_at_level}/{group_size} done')
                return
        state['completed_step'] = chain_step
        state['last_step_completed_at'] = iso_now()
        if chain_step >= chain_total:
            state['status'] = 'completed'
            state['completed'] = iso_now()
            save_chain_state(pipeline_dir, chain_id, state)

            # #292: Auto-delete lock file for work stream
            ws = state.get('ws', '')
            if ws:
                lock_path = pipeline_dir / 'signals' / f'lock-{ws}.md'
                try:
                    lock_path.unlink(missing_ok=True)
                    logger.info(f'Lock released: lock-{ws}.md (chain {chain_id} completed)')
                except OSError as e:
                    logger.warning(f'Failed to delete lock file lock-{ws}.md: {e}')

            # KB-095 auto-fix: check working copy truncation
            page = state.get('page', '')
            kb095_note = ''
            if page:
                try:
                    cfg_data = json.loads(CONFIG_PATH.read_text(encoding='utf-8'))
                    kb095_work_dir = repo_dir_from_config(cfg_data)
                except Exception:
                    kb095_work_dir = DEFAULT_REPO_DIR
                restored = kb095_check_and_fix(page, kb095_work_dir, logger)
                if restored:
                    kb095_note = '\n\nKB-095 auto-fix: ' + ', '.join(restored)

            summary = _build_chain_summary(state, is_failed=False, pipeline_dir=pipeline_dir)
            update_chain_tg(chain_id, pipeline_dir, bot_token, chat_id, logger, text=summary + kb095_note)
            def _sc(c):
                try: return float(c)
                except (ValueError, TypeError): return 0.0
            total_cost = sum(_sc(s.get('cost', '0')) for s in state.get('steps', {}).values())
            logger.info(f'Chain {chain_id} COMPLETED ({chain_total} steps, ${total_cost:.2f})')

            cleanup_chain_artifacts(chain_id, state, pipeline_dir, logger)
        else:
            save_chain_state(pipeline_dir, chain_id, state)
            update_chain_tg(chain_id, pipeline_dir, bot_token, chat_id, logger)

        save_chain_state(pipeline_dir, chain_id, state)


def create_task_context(task_file: Path, prompt_body: str, meta: dict, cfg: dict) -> TaskContext:
    now = datetime.now().astimezone()
    timestamp = now.strftime('%y%m%d-%H%M%S')
    task_id = f'task-{timestamp}'
    pipeline_dir = task_file.parent
    work_dir = repo_dir_from_config(cfg)
    page = meta.get('page', task_file.name)
    task_type = meta.get('type', 'task')
    topic = meta.get('topic', '')

    return TaskContext(
        task_id=task_id,
        timestamp=timestamp,
        task_file=task_file,
        prompt_body=prompt_body,
        task_type=task_type,
        page=page,
        topic=topic,
        budget=clean_budget(meta.get('budget', cfg['defaults'].get('budget', '10.00'))),
        work_dir=work_dir,
        pipeline_dir=pipeline_dir,
        start_epoch=int(now.timestamp()),
        start_time_human=now.strftime('%H:%M'),
        progress_file=pipeline_dir / f'progress-{task_id}.txt',
        prompt_tmpfile=pipeline_dir / f'{task_id}.prompt',
        log_file=pipeline_dir / f'{task_id}.log',
        debug_file=pipeline_dir / f'{task_id}.debug',
        done_file=pipeline_dir / f'{task_id}.done',
        managed_file=pipeline_dir / f'{task_id}.managed',
        task_record_file=pipeline_dir / f'{task_id}.md',
        result_file=pipeline_dir / f'result-{timestamp}.md',
        tg_id_file=pipeline_dir / f'{task_id}.tg_msg_id',
        pre_commit_file=pipeline_dir / f'{task_id}.pre_commit',
        cc_cost_file=pipeline_dir / f'{task_id}.cc_cost',
        cc_error_file=pipeline_dir / f'{task_id}.cc_error',
        cdx_status_file=pipeline_dir / f'{task_id}.cdx_status',
        cc_analysis_file=pipeline_dir / f'cc-analysis-{task_id}.txt',
        started_file=pipeline_dir / f'started-{task_id}.md',
        codex_findings_file=pipeline_dir / f'codex-findings-{task_id}.txt',
        merge_report_file=pipeline_dir / f'merge-report-{task_id}.md',
        agent=meta.get('agent', ''),
    )


def build_initial_progress(ctx: TaskContext) -> str:
    name = ctx.task_file.name
    if name.startswith('pssk-'):
        type_label = 'ПССК'
    elif name.startswith('ks-'):
        type_label = 'КС'
    else:
        type_label = None
    type_line = f'Type: {type_label}\n' if type_label else ''
    return (
        f'[..] {ctx.task_id}\n\n'
        f'Page: {ctx.page}\n'
        f'{type_line}'
        f'AI: {PIPELINE_AI_LABEL}\n'
        f'Budget: ${ctx.budget}\n'
        f'Started: {ctx.start_time_human}\n\n'
        '[CC] Starting...\n'
    )


def detect_code_file(ctx: TaskContext, logger: logging.Logger) -> Path | None:
    page_dir = ctx.work_dir / 'pages' / ctx.page
    if not page_dir.is_dir():
        if not ctx.page.lower().endswith('.md'):
            logger.warning(f'Page dir not found: {page_dir.as_posix()}')
        return None

    base_dir = page_dir / 'base'
    for candidate in sorted(base_dir.glob('*.jsx')):
        return candidate
    for candidate in sorted(page_dir.glob('*.jsx')):
        return candidate
    return None


def build_codex_instruction(ctx: TaskContext, code_file: Path) -> str:
    dq = chr(34)
    code_file_str = code_file.as_posix()
    findings_str = ctx.codex_findings_file.as_posix()
    merge_str = ctx.merge_report_file.as_posix()
    progress_str = ctx.progress_file.as_posix()

    return f'''\
=== CODEX INTEGRATION (v6.0 - CC-managed) ===
You have access to Codex CLI via PowerShell. BEFORE starting your own analysis, launch Codex:

STEP 1: Run Codex via PowerShell (IMPORTANT: use powershell.exe, NOT bash):
  powershell.exe -Command {dq}codex exec -C 'C:/Dev/menuapp-code-review' --full-auto 'Review the file {code_file_str} for bugs in a React restaurant QR-menu app on Base44 platform. Also check nearby files like README.md and BUGS.md in the same folder for context. Find ALL bugs and issues. Focus on: logic errors, missing error handling, i18n issues, UI/UX problems for mobile-first, React anti-patterns. For each finding: [P0/P1/P2/P3] Title - Description. FIX: description of code change needed.'{dq} > {findings_str} 2>&1

STEP 2: While Codex runs (it takes 1-3 min), do your OWN independent analysis of the code.

STEP 3: After your analysis, read Codex findings: cat {findings_str}

STEP 4: COMPARE both analyses - write comparison to {merge_str}:
  ## Agreed (both found)
  ## CC only (Codex missed)
  ## Codex only (CC missed) - evaluate and fix if valid
  ## Disputes (disagree) - explain reasoning, pick best solution

STEP 5: Apply ALL agreed fixes + valid Codex-only fixes to the code.

If Codex command fails or times out after 5 minutes, continue with your own analysis only.
Update progress after Codex: echo {dq}[CDX] $(date +%H:%M) Codex: done/failed{dq} >> {dq}{progress_str}{dq}
=== END CODEX INTEGRATION ==='''


def build_discussion_override(ctx: TaskContext) -> str:
    if ctx.agent != DISCUSSION_AGENT:
        return ''
    return '''\
=== DISCUSSION AGENT OVERRIDE ===
This task is running with --agent discussion-moderator.
Codex participation is REQUIRED for this workflow.
Ignore any generic guidance that says Codex always runs externally or should be skipped for discussion tasks.
Before writing the final discussion, you MUST create at least one non-empty transcript file named codex-round1-discussion.md (legacy codex-round1.md is also accepted) in the current working directory or current agent worktree, then read it and incorporate Codex's perspective.
If Codex cannot be reached, explicitly report that failure instead of presenting a single-model answer as a completed two-AI discussion.
=== END DISCUSSION AGENT OVERRIDE ==='''


def build_cc_prompt(ctx: TaskContext, code_file: Path | None) -> str:
    dq = chr(34)
    codex_instruction = build_codex_instruction(ctx, code_file) if code_file else ''
    discussion_override = build_discussion_override(ctx)
    progress_str = ctx.progress_file.as_posix()
    started_str = ctx.started_file.as_posix()
    analysis_str = ctx.cc_analysis_file.as_posix()

    return f'''\
IMPORTANT: Your VERY FIRST action must be: echo {dq}started $(date -Iseconds){dq} > {dq}{started_str}{dq}

=== TASK SETUP ===
Progress file: {progress_str}
Task ID: {ctx.task_id}
=== END TASK SETUP ===
{codex_instruction}
{discussion_override}

=== PROGRESS UPDATES ===
Update progress file after each major step:
  echo {dq}[CC] $(date +%H:%M) <status>{dq} >> {dq}{progress_str}{dq}
Examples: CC started analysis, CC found N bugs, CC applying fixes, CC creating RELEASE
=== END PROGRESS ===

=== GIT RULES ===
- Capture pre-task commit: PRE=$(git rev-parse HEAD)
- After ALL fixes: git add <specific files only> && git commit -m 'fix: <description>' && git push
- NEVER use git add . or git add -A
- Update BUGS.md in the page folder
=== END GIT RULES ===

=== TASK ===
{ctx.prompt_body}
=== END TASK ===

=== FINAL STEPS ===
1. Write final summary to: {analysis_str}
2. Update progress: echo {dq}[OK] $(date +%H:%M) DONE: N bugs fixed, M from Codex{dq} >> {dq}{progress_str}{dq}
=== END FINAL STEPS ==='''


def build_task_record(ctx: TaskContext, fallback_model: str) -> str:
    topic_line = f'topic: {ctx.topic}\n' if ctx.topic else ''
    return f'''\
---
task_id: {ctx.task_id}
status: running
started: {iso_now()}
type: {ctx.task_type}
page: {ctx.page}
{topic_line}work_dir: {ctx.work_dir.as_posix()}
budget_usd: {ctx.budget}
fallback_model: {fallback_model}
version: {WATCHER_VERSION}
launcher: python-popen
---

# Task: {ctx.task_id}

## Config
- Budget: ${ctx.budget}
- Mode: task-watcher.py launches Claude Code directly via Popen
- Fallback model: {fallback_model}

## Prompt
{ctx.prompt_body}

## Status
Running...
'''


def get_pre_task_commit(work_dir: Path, logger: logging.Logger) -> str:
    try:
        proc = subprocess.run(
            ['git', 'rev-parse', 'HEAD'],
            cwd=str(work_dir),
            capture_output=True,
            text=True,
            timeout=10,
        )
    except Exception as exc:
        logger.debug(f'git rev-parse failed: {exc}')
        return ''

    if proc.returncode != 0:
        return ''
    return proc.stdout.strip()


def append_debug(ctx: TaskContext, text: str) -> None:
    if not text.endswith('\n'):
        text += '\n'
    append_text(ctx.debug_file, text)


def write_debug_preamble(
    ctx: TaskContext,
    claude_label: str,
    fallback_model: str,
    system_rules_file: Path,
    pre_commit: str,
) -> None:
    system_rules_label = system_rules_file.as_posix() if system_rules_file.exists() else 'missing'
    lines = [
        f'launcher started at {iso_now()}',
        f'CC launch: {claude_label}',
        f'WORK_DIR: {ctx.work_dir.as_posix()}',
        f'Mode: task-watcher.py v{WATCHER_VERSION} direct Popen',
        f'Fallback model: {fallback_model}',
        f'System rules: {system_rules_label}',
        f'PRE_TASK_COMMIT: {pre_commit}',
    ]
    if ctx.agent:
        lines.append(f'Agent: {ctx.agent}')
    write_text(ctx.debug_file, '\n'.join(lines) + '\n')


def _find_git_bash() -> str:
    """KB-084: Auto-detect Git Bash path on Windows.
    Ported from v3.py (line 1422). INFRA-001c + INFRA-001d."""
    candidates = [
        r'C:\Program Files\Git\usr\bin\bash.exe',
        r'C:\Program Files\Git\bin\bash.exe',
        r'C:\Program Files (x86)\Git\usr\bin\bash.exe',
        r'C:\Program Files (x86)\Git\bin\bash.exe',
        r'C:\Git\usr\bin\bash.exe',
        r'C:\Git\bin\bash.exe',
        os.path.expandvars(r'%LOCALAPPDATA%\Programs\Git\usr\bin\bash.exe'),
        os.path.expandvars(r'%LOCALAPPDATA%\Programs\Git\bin\bash.exe'),
    ]
    for path in candidates:
        if os.path.isfile(path):
            return path
    try:
        result = subprocess.run(
            ['where', 'bash'], capture_output=True, text=True, timeout=5
        )
        if result.returncode == 0:
            for line in result.stdout.strip().splitlines():
                line = line.strip()
                if line and os.path.isfile(line) and 'git' in line.lower():
                    return line
            for line in result.stdout.strip().splitlines():
                line = line.strip()
                if line and os.path.isfile(line):
                    return line
    except (FileNotFoundError, subprocess.TimeoutExpired):
        pass
    return ''


def check_cc_auth(logger: logging.Logger) -> bool:
    """Quick CC auth pre-check before starting a chain.
    Ported from v3.py (line 1971). INFRA-001c."""
    git_bash = _find_git_bash()
    if not git_bash:
        logger.warning('check_cc_auth: git bash not found, skipping auth check')
        return True
    try:
        result = subprocess.run(
            [git_bash, '-c', 'claude -p --allowedTools Bash "echo auth_ok_preflight"'],
            capture_output=True, text=True, timeout=30,
            creationflags=getattr(subprocess, 'CREATE_NO_WINDOW', 0),
        )
        output = (result.stdout + result.stderr).lower()
        if result.returncode != 0 or 'authentication' in output or '401' in output or 'please log in' in output or 'not logged in' in output:
            logger.warning(f'check_cc_auth: auth failed (rc={result.returncode})')
            return False
        if 'auth_ok_preflight' in result.stdout:
            return True
        if 'error' in output and 'auth_ok_preflight' not in result.stdout:
            logger.warning(f'check_cc_auth: suspicious output (rc={result.returncode}): {output[:200]}')
            return False
        return True
    except subprocess.TimeoutExpired:
        logger.warning('check_cc_auth: timeout (30s) — assuming auth ok')
        return True
    except Exception as e:
        logger.warning(f'check_cc_auth: exception {e} — assuming auth ok')
        return True


def check_codex_auth(logger: logging.Logger) -> bool:
    """Quick Codex CLI auth pre-check before starting a chain.
    Ported from v3.py (line 2005). INFRA-001c."""
    git_bash = _find_git_bash()
    if not git_bash:
        logger.warning('check_codex_auth: git bash not found, skipping')
        return True
    try:
        result = subprocess.run(
            [git_bash, '-c', 'codex --version'],
            capture_output=True, text=True, timeout=15,
            creationflags=getattr(subprocess, 'CREATE_NO_WINDOW', 0),
        )
        output = (result.stdout + result.stderr).lower()
        if result.returncode != 0:
            logger.warning(f'check_codex_auth: codex not available (rc={result.returncode})')
            return False
        if 'not found' in output or 'command not found' in output:
            logger.warning('check_codex_auth: codex CLI not found')
            return False
        return True
    except subprocess.TimeoutExpired:
        logger.warning('check_codex_auth: timeout — assuming ok')
        return True
    except Exception as e:
        logger.warning(f'check_codex_auth: exception {e} — assuming ok')
        return True


def resolve_codex_path(raw_path: str) -> str:
    """Resolve the codex CLI executable path.
    Ported from v3.py (line 754). INFRA-001b."""
    if not raw_path or raw_path == 'codex':
        if os.name == 'nt':
            npm_prefix = Path(os.environ.get('APPDATA', '')) / 'npm'
            cmd_path = npm_prefix / 'codex.cmd'
            if cmd_path.exists():
                return str(cmd_path)
        return 'codex'
    path = Path(raw_path)
    if os.name == 'nt':
        cmd_path = path.with_suffix('.cmd')
        if cmd_path.exists():
            return str(cmd_path)
    return str(path)


def resolve_codex_node_command(raw_path: str) -> list[str] | None:
    """KB-086: Resolve codex as [node.exe, cli.js] to bypass cmd.exe 8191 char limit.
    Ported from v3.py (line 776). INFRA-001b."""
    if os.name != 'nt':
        return None
    npm_prefix = Path(os.environ.get('APPDATA', '')) / 'npm'
    for cli_rel in [
        'node_modules/@openai/codex/bin/codex.js',
        'node_modules/@openai/codex/dist/cli.js',
        'node_modules/@openai/codex/cli.js',
        'node_modules/codex/dist/cli.js',
    ]:
        cli_js = npm_prefix / cli_rel
        if cli_js.exists():
            node_path = shutil.which('node')
            if node_path:
                return [node_path, str(cli_js)]
    return None


def build_codex_direct_command(
    ctx: TaskContext,
    prompt_text: str,
    cfg: dict,
) -> tuple[list[str], str | None]:
    """Build a command to run Codex exec directly (no CC wrapper).
    KB-086: Windows cmd.exe has 8191 char limit — use node.exe directly.
    Ported from v3.py (line 802). INFRA-001b + INFRA-003a."""
    onedrive_root = cfg.get('paths', {}).get('onedrive_root', '')
    if onedrive_root:
        repo_dir = (Path(onedrive_root) / 'menuapp-code-review').as_posix()
    else:
        repo_dir = ctx.work_dir.as_posix()

    clean_prompt = prompt_text
    if clean_prompt.startswith('---'):
        end = clean_prompt.find('---', 3)
        if end != -1:
            clean_prompt = clean_prompt[end + 3:].strip()

    # INFRA-003b: Clean null bytes for Codex path too
    clean_prompt = clean_prompt.replace('\x00', '')

    # Collapse to single line — Windows cmd line can't handle multi-line args
    single_line_prompt = ' '.join(clean_prompt.split())

    # KB-086+KB-083: Always use node.exe directly on Windows
    if os.name == 'nt':
        node_cmd = resolve_codex_node_command(cfg.get('paths', {}).get('codex_cli', 'codex'))
        if node_cmd:
            return node_cmd + ['exec', '-C', repo_dir, '--full-auto', single_line_prompt], 'node-direct'

    codex_path = resolve_codex_path(cfg.get('paths', {}).get('codex_cli', 'codex'))
    return [codex_path, 'exec', '-C', repo_dir, '--full-auto', single_line_prompt], None


def resolve_claude_command(raw_path: str) -> tuple[list[str], str]:
    path = Path(raw_path)
    if os.name == 'nt':
        cli_js = path.parent / 'node_modules' / '@anthropic-ai' / 'claude-code' / 'cli.js'
        local_node = path.parent / 'node.exe'
        node_cmd = str(local_node) if local_node.exists() else shutil.which('node')
        if cli_js.exists() and node_cmd:
            return [node_cmd, str(cli_js)], f'{Path(node_cmd).as_posix()} {cli_js.as_posix()}'
        cmd_path = path.with_suffix('.cmd')
        if cmd_path.exists():
            return [str(cmd_path)], cmd_path.as_posix()
    return [str(path)], path.as_posix()


def build_claude_command(
    ctx: TaskContext,
    launch_prefix: list[str],
    fallback_model: str,
    system_rules_file: Path,
) -> tuple[list[str], bool]:
    """Build CC CLI command. Returns (cmd, use_stdin).
    Fix 3 (INFRA-003, KB-137): For prompts >7KB, omits -p from argv and signals
    caller to pipe prompt via stdin, avoiding Windows WinError 206."""
    prompt_text = read_text(ctx.prompt_tmpfile)
    # Clean null bytes (KB-137: can appear in files read from disk)
    prompt_text = prompt_text.replace('\x00', '')
    cmd = list(launch_prefix)
    use_stdin = len(prompt_text) > 7000

    if not use_stdin:
        cmd.extend(['-p', prompt_text])

    cmd.extend([
        '--output-format',
        'json',
        '--allowedTools',
        ALLOWED_TOOLS,
        '--max-budget-usd',
        ctx.budget,
        '--fallback-model',
        fallback_model,
    ])
    if system_rules_file.exists():
        cmd.extend(['--append-system-prompt-file', system_rules_file.as_posix()])
    if ctx.agent:
        cmd.extend(['--agent', ctx.agent])

    if use_stdin:
        # Re-write cleaned prompt to tmpfile (caller reads it for stdin pipe)
        write_text(ctx.prompt_tmpfile, prompt_text)

    return cmd, use_stdin


def send_initial_telegram(ctx: TaskContext, bot_token: str, chat_id: str, logger: logging.Logger) -> str:
    msg_id = tg_send(bot_token, chat_id, progress_snapshot(ctx.progress_file), logger)
    write_text(ctx.tg_id_file, msg_id)
    return msg_id


def update_telegram_from_progress(ctx: TaskContext, bot_token: str, chat_id: str, logger: logging.Logger) -> None:
    msg_id = read_msg_id(ctx.tg_id_file)
    if msg_id:
        tg_edit(bot_token, chat_id, msg_id, progress_snapshot(ctx.progress_file), logger)


def heartbeat_worker(
    ctx: TaskContext,
    bot_token: str,
    chat_id: str,
    stop_event: threading.Event,
    logger: logging.Logger,
) -> None:
    while not stop_event.is_set() and not ctx.done_file.exists():
        time.sleep(HEARTBEAT_INTERVAL_SEC)
        if stop_event.is_set() or ctx.done_file.exists():
            break

        elapsed = max(0, int(time.time()) - ctx.start_epoch)
        minutes, seconds = divmod(elapsed, 60)
        clock = time.strftime('%H:%M')
        append_text(ctx.progress_file, f'[..] {clock} {minutes}m {seconds}s\n')
        update_telegram_from_progress(ctx, bot_token, chat_id, logger)


def parse_claude_result(log_file: Path, logger: logging.Logger) -> dict:
    content = read_text(log_file)
    if not content:
        return {}

    for line in reversed(content.splitlines()):
        line = line.strip()
        if not line or not line.startswith('{'):
            continue
        try:
            payload = json.loads(line)
        except json.JSONDecodeError:
            continue
        if isinstance(payload, dict):
            return payload

    logger.warning(f'Could not parse Claude JSON result from {log_file.name}')
    return {}


def extract_total_cost(result: dict) -> float:
    try:
        return float(result.get('total_cost_usd', 0) or 0)
    except (TypeError, ValueError):
        return 0.0


def collect_git_diff(work_dir: Path, pre_commit: str, logger: logging.Logger) -> list[str]:
    if not pre_commit:
        return []

    try:
        proc = subprocess.run(
            ['git', 'diff', '--name-only', pre_commit, 'HEAD'],
            cwd=str(work_dir),
            capture_output=True,
            text=True,
            timeout=20,
        )
    except Exception as exc:
        logger.debug(f'git diff failed: {exc}')
        return []

    if proc.returncode != 0:
        return []

    seen: set[str] = set()
    paths: list[str] = []
    for line in proc.stdout.splitlines():
        path = line.strip()
        if not path or path in seen:
            continue
        seen.add(path)
        paths.append(path)
    return paths


def format_file_list(paths: list[str]) -> str:
    visible: list[str] = []
    for path in paths:
        if path.startswith('.claude/'):
            continue
        label = path[6:] if path.startswith('pages/') else path
        visible.append(label)
        if len(visible) == 5:
            break
    return ', '.join(visible) if visible else 'none'


def is_discussion_codex_transcript(path: Path) -> bool:
    return DISCUSSION_CODEX_FILE_RE.fullmatch(path.name) is not None


def detect_codex_status(ctx: TaskContext) -> str:
    try:
        if ctx.codex_findings_file.exists() and ctx.codex_findings_file.stat().st_size > 0:
            return 'done'
    except OSError:
        pass

    try:
        for cdx_file in ctx.work_dir.glob('codex-round*.md'):
            if not is_discussion_codex_transcript(cdx_file):
                continue
            if cdx_file.stat().st_size <= 0:
                continue
            if int(cdx_file.stat().st_mtime) >= ctx.start_epoch:
                return 'done'
    except OSError:
        pass

    # Also check agent worktrees (CC with --agent may write discussion transcripts there)
    try:
        for worktree_dir in sorted(
            ctx.work_dir.glob('.claude/worktrees/agent-*/'),
            key=lambda d: d.stat().st_mtime,
            reverse=True,
        ):
            for cdx_file in worktree_dir.glob('codex-round*.md'):
                if not is_discussion_codex_transcript(cdx_file):
                    continue
                if cdx_file.stat().st_size > 0 and int(cdx_file.stat().st_mtime) >= ctx.start_epoch:
                    return 'done'
            break  # only check newest worktree
    except OSError:
        pass

    analysis_text = read_text(ctx.cc_analysis_file)
    progress_text = read_text(ctx.progress_file)
    if 'CODEX FAILED' in analysis_text or 'Codex: failed' in progress_text or 'Cdx: failed' in progress_text:
        return 'failed'
    return 'skipped'


def build_final_progress_text(
    ctx: TaskContext,
    is_error: bool,
    cdx_status: str,
    cost_text: str,
    file_list: str,
    duration_sec: int,
) -> str:
    end_time = datetime.now().astimezone().strftime('%H:%M')
    minutes, seconds = divmod(duration_sec, 60)
    status = 'ERROR' if is_error else 'DONE'
    cc_status = 'ERROR' if is_error else 'OK'
    return (
        f'[{status}] {ctx.task_id}\n\n'
        f'Page: {ctx.page}\n'
        f'AI: {PIPELINE_AI_LABEL}\n'
        f'CC: {cc_status} | Codex: {cdx_status}\n'
        f'Changed: {file_list}\n'
        f'Cost: ${cost_text}/{ctx.budget}\n'
        f'Time: {ctx.start_time_human} -> {end_time} ({minutes}m {seconds}s)\n'
    )


def build_result_text(
    ctx: TaskContext,
    completion_status: str,
    is_error: bool,
    cdx_status: str,
    cost_text: str,
    git_diff: list[str],
    duration_sec: int,
) -> str:
    minutes, seconds = divmod(duration_sec, 60)
    cc_status = 'ERROR' if is_error else 'OK'
    diff_block = '\n'.join(git_diff) if git_diff else 'none'
    return f'''\
---
task_id: {ctx.task_id}
status: {completion_status}
completed: {iso_now()}
files_changed: {len(git_diff)}
cost_usd: {cost_text}
budget_usd: {ctx.budget}
codex_status: {cdx_status}
is_error: {'true' if is_error else 'false'}
work_dir: {ctx.work_dir.as_posix()}
script_version: {WATCHER_VERSION}
---

# Result: {ctx.task_id}

## Pipeline v3.0 (Python Popen)
- CC: {cc_status} - {minutes}m {seconds}s - ${cost_text}
- Codex: {cdx_status}

## Code Files Changed
{diff_block}
'''


def write_final_artifacts(
    ctx: TaskContext,
    completion_status: str,
    is_error: bool,
    cdx_status: str,
    cost_text: str,
    git_diff: list[str],
    duration_sec: int,
    bot_token: str,
    chat_id: str,
    logger: logging.Logger,
) -> None:
    file_list = format_file_list(git_diff)
    write_text(
        ctx.progress_file,
        build_final_progress_text(ctx, is_error, cdx_status, cost_text, file_list, duration_sec),
    )
    write_text(
        ctx.result_file,
        build_result_text(ctx, completion_status, is_error, cdx_status, cost_text, git_diff, duration_sec),
    )
    write_text(ctx.cc_cost_file, cost_text)
    write_text(ctx.cc_error_file, 'true' if is_error else 'false')
    write_text(ctx.cdx_status_file, cdx_status)
    update_telegram_from_progress(ctx, bot_token, chat_id, logger)


def write_launch_failure(
    ctx: TaskContext,
    reason: str,
    pre_commit: str,
    bot_token: str,
    chat_id: str,
    logger: logging.Logger,
) -> None:
    if not ctx.log_file.exists():
        write_text(ctx.log_file, reason + '\n')
    append_debug(ctx, f'Launch failure: {reason}')
    git_diff = collect_git_diff(ctx.work_dir, pre_commit, logger)
    duration_sec = max(0, int(time.time()) - ctx.start_epoch)
    cdx_status = detect_codex_status(ctx)
    write_final_artifacts(
        ctx,
        'error',
        True,
        cdx_status,
        '0.00',
        git_diff,
        duration_sec,
        bot_token,
        chat_id,
        logger,
    )
    write_text(ctx.done_file, 'error')
    safe_unlink(ctx.prompt_tmpfile)


def finalize_process(
    ctx: TaskContext,
    pre_commit: str,
    returncode: int | None,
    timed_out: bool,
    bot_token: str,
    chat_id: str,
    logger: logging.Logger,
) -> None:
    result = parse_claude_result(ctx.log_file, logger)
    cost_text = f'{extract_total_cost(result):.2f}'
    is_error = timed_out or returncode not in (0, None) or bool(result.get('is_error', False))
    cdx_status = detect_codex_status(ctx)
    git_diff = collect_git_diff(ctx.work_dir, pre_commit, logger)
    duration_sec = max(0, int(time.time()) - ctx.start_epoch)
    minutes, seconds = divmod(duration_sec, 60)
    append_debug(
        ctx,
        f'CC finished: cost=${cost_text} time={minutes}m {seconds}s error={str(is_error).lower()} rc={returncode}',
    )

    completion_status = 'timeout' if timed_out else ('error' if is_error else 'completed')
    write_final_artifacts(
        ctx,
        completion_status,
        is_error,
        cdx_status,
        cost_text,
        git_diff,
        duration_sec,
        bot_token,
        chat_id,
        logger,
    )
    write_text(ctx.done_file, completion_status)
    safe_unlink(ctx.prompt_tmpfile)


def run_task(
    task_file: Path,
    cfg: dict,
    logger: logging.Logger,
    stop_event: threading.Event,
    bot_token: str,
    chat_id: str,
) -> None:
    """
    v4.0: Each task runs in its own git worktree.
    Page lock prevents two tasks from touching the same page.
    After CC finishes, worktree is merged back to main.
    """
    root = Path(cfg['paths']['onedrive_root'])
    pipeline_dir = root / 'pipeline'
    filename = task_file.name
    main_repo_dir = repo_dir_from_config(cfg)

    try:
        content = task_file.read_text(encoding='utf-8')
    except OSError as exc:
        logger.error(f'Cannot read task file {filename}: {exc}')
        quarantine = pipeline_dir / f'error-{filename}'
        try:
            shutil.move(str(task_file), str(quarantine))
            logger.warning(f'Moved unreadable file to: {quarantine.name}')
        except OSError as move_exc:
            logger.error(f'Could not quarantine {filename}: {move_exc}')
        return

    meta = parse_frontmatter(content)

    # ── v4.0: Page lock check (BEFORE moving file) ──
    pages = extract_all_pages(meta)
    # Build a temporary task_id for logging (real one created after move)
    temp_task_id = f'pre-{filename}'
    if not pages:
        pages = {filename.lower()}  # fallback: use filename as page
        logger.warning(f'No page in frontmatter for {filename}, using filename as lock key')

    if not try_acquire_pages(pages, temp_task_id, logger):
        # Page is busy — put file back and let next poll retry
        logger.info(f'Deferring {filename}: page(s) {pages} are busy')
        return  # file stays in queue/, will be retried next poll

    # ── Move file to pipeline/ (same as v3.0) ──
    dest = pipeline_dir / filename
    try:
        shutil.move(str(task_file), str(dest))
    except OSError as exc:
        logger.error(f'Cannot move {filename} to pipeline/: {exc}')
        release_pages(pages, temp_task_id, logger)
        return

    ctx = create_task_context(dest, content, meta, cfg)

    # Update page lock with real task_id
    with _page_lock:
        for page in pages:
            if _active_pages.get(page) == temp_task_id:
                _active_pages[page] = ctx.task_id

    # ── v5.0: Chain step handling ──
    is_chain_step = bool(meta.get('chain', ''))
    if is_chain_step:
        if not can_run_chain_step(meta, pipeline_dir, logger):
            # Previous step not done yet — put back in queue
            try:
                shutil.move(str(dest), str(task_file))
            except OSError:
                pass
            release_pages(pages, ctx.task_id, logger)
            logger.debug(f'Chain step deferred: {filename} (waiting for previous step)')
            return

    fallback_model = cfg['defaults'].get('fallback_model', 'sonnet')
    system_rules_file = root / 'references' / SYSTEM_RULES_NAME

    chain_label = ''
    if is_chain_step:
        chain_id = meta.get('chain', '')
        step_name = meta.get('chain_step_name', '?')
        chain_step = meta.get('chain_step', '?')
        chain_total = meta.get('chain_total', '?')
        chain_label = f' [chain:{chain_id} step {chain_step}/{chain_total} {step_name}]'
        mark_chain_step_running(meta, pipeline_dir, bot_token, chat_id, logger)

    logger.info(f'Task: {ctx.page} (budget: ${ctx.budget}) - {filename} [MULTI v5.0]{chain_label}')

    # ── v4.0: Create worktree ──
    wt_path = create_worktree(main_repo_dir, ctx.task_id, logger)
    if wt_path is None:
        logger.error(f'Worktree creation failed for {ctx.task_id}, aborting task')
        release_pages(pages, ctx.task_id, logger)
        return

    # Override work_dir to point to worktree (CC will work there)
    ctx.work_dir = wt_path
    append_debug(ctx, f'v5.0 worktree: {wt_path.as_posix()}')
    append_debug(ctx, f'v5.0 locked pages: {sorted(pages)}')

    # ── v5.0: Build prompt (chain steps use lightweight wrapper) ──
    if is_chain_step:
        prompt_text = build_chain_step_prompt(ctx)
    else:
        code_file = detect_code_file(ctx, logger)
        prompt_text = build_cc_prompt(ctx, code_file)

    write_text(ctx.progress_file, build_initial_progress(ctx))
    # INFRA-002a: Only send individual TG for non-chain tasks; chain steps use chain TG
    if not is_chain_step:
        send_initial_telegram(ctx, bot_token, chat_id, logger)
    write_text(ctx.managed_file, f'managed by task-watcher-multi.py v{WATCHER_VERSION}\n')
    write_text(ctx.prompt_tmpfile, prompt_text)
    write_text(ctx.task_record_file, build_task_record(ctx, fallback_model))

    pre_commit = get_pre_task_commit(ctx.work_dir, logger)
    write_text(ctx.pre_commit_file, pre_commit)

    launch_prefix, claude_label = resolve_claude_command(cfg['paths']['claude_cli'])
    write_debug_preamble(ctx, claude_label, fallback_model, system_rules_file, pre_commit)

    heartbeat_stop = threading.Event()
    heartbeat_thread = None
    # INFRA-002b: Suppress per-step heartbeat for chain steps (avoids TG noise)
    if not is_chain_step:
        heartbeat_thread = threading.Thread(
            target=heartbeat_worker,
            args=(ctx, bot_token, chat_id, heartbeat_stop, logger),
            daemon=True,
        )
        heartbeat_thread.start()

    log_handle = None
    timed_out = False
    returncode = None

    # INFRA-001b: Determine runner type (cc or codex) from frontmatter
    runner = meta.get('runner', 'cc')

    try:
        if not ctx.work_dir.exists():
            raise FileNotFoundError(f'Worktree dir not found: {ctx.work_dir.as_posix()}')

        env = os.environ.copy()
        env.setdefault('LANG', 'en_US.UTF-8')
        env.setdefault('LC_ALL', 'en_US.UTF-8')

        # INFRA-001d: Set CLAUDE_CODE_GIT_BASH_PATH for Windows reliability
        if os.name == 'nt' and 'CLAUDE_CODE_GIT_BASH_PATH' not in env:
            git_bash = _find_git_bash()
            if git_bash:
                env['CLAUDE_CODE_GIT_BASH_PATH'] = git_bash
                append_debug(ctx, f'Set CLAUDE_CODE_GIT_BASH_PATH={git_bash}')

        log_handle = ctx.log_file.open('w', encoding='utf-8', newline='\n')

        if runner == 'codex':
            # INFRA-001b: Launch Codex directly for codex runner steps
            if not launch_prefix:
                raise FileNotFoundError('Claude Code CLI launch command could not be resolved (codex fallback)')
            codex_prompt = read_text(ctx.prompt_tmpfile)
            cmd, codex_mode = build_codex_direct_command(ctx, codex_prompt, cfg)
            append_debug(ctx, f'Codex runner: mode={codex_mode}, cmd[0]={cmd[0] if cmd else "?"}')
            # KB-082: Codex requires cwd inside a git repo
            codex_cwd = str(ctx.work_dir)
            proc = subprocess.Popen(
                cmd,
                cwd=codex_cwd,
                stdin=subprocess.DEVNULL,
                stdout=log_handle,
                stderr=subprocess.STDOUT,
                # No DETACHED_PROCESS for Codex (node.exe direct)
                env=env,
            )
            use_stdin = False
        else:
            # CC runner (default)
            if not launch_prefix:
                raise FileNotFoundError('Claude Code CLI launch command could not be resolved')
            cmd, use_stdin = build_claude_command(ctx, launch_prefix, fallback_model, system_rules_file)

            # Fix 3 (INFRA-003): pipe prompt via stdin for large prompts (KB-137)
            if use_stdin:
                append_debug(ctx, f'Using stdin pipe for large prompt ({ctx.prompt_tmpfile.stat().st_size} bytes)')
                proc = subprocess.Popen(
                    cmd,
                    cwd=str(ctx.work_dir),
                    stdin=subprocess.PIPE,
                    stdout=log_handle,
                    stderr=subprocess.STDOUT,
                    creationflags=DETACHED_FLAGS if os.name == 'nt' else 0,
                    env=env,
                )
                try:
                    prompt_bytes = read_text(ctx.prompt_tmpfile).encode('utf-8')
                    proc.stdin.write(prompt_bytes)
                    proc.stdin.close()
                except Exception as stdin_exc:
                    append_debug(ctx, f'stdin pipe error: {stdin_exc}')
            else:
                proc = subprocess.Popen(
                    cmd,
                    cwd=str(ctx.work_dir),
                    stdin=subprocess.DEVNULL,
                    stdout=log_handle,
                    stderr=subprocess.STDOUT,
                    creationflags=DETACHED_FLAGS if os.name == 'nt' else 0,
                    env=env,
                )
        runner_label = 'Codex' if runner == 'codex' else 'CC'
        append_debug(ctx, f'Popen PID: {proc.pid} (runner={runner_label}, stdin_mode={use_stdin})')
        logger.info(f'{runner_label} PID: {proc.pid} ({ctx.task_id}) [worktree: {wt_path.name}]')

        max_wait_sec = cfg.get('watcher', {}).get('max_wait_minutes', 60) * 60
        waited = 0
        logger.info(f'Waiting for Claude process exit (max {max_wait_sec // 60}min)')

        while waited < max_wait_sec:
            if stop_event.is_set():
                append_debug(ctx, 'Watcher stop requested before completion; leaving process detached')
                logger.info(f'Stop requested - abandoning wait for {ctx.task_id}')
                # v4.0: release page lock on early exit (worktree stays for recovery)
                release_pages(pages, ctx.task_id, logger)
                return

            returncode = proc.poll()
            if returncode is not None:
                break

            time.sleep(PROCESS_POLL_SEC)
            waited += PROCESS_POLL_SEC

        if proc.poll() is None:
            timed_out = True
            logger.warning(f'Timeout: {ctx.page} ({ctx.task_id}) after {max_wait_sec // 60}min')
            append_debug(ctx, f'Timeout after {max_wait_sec} seconds; terminating PID {proc.pid}')
            try:
                proc.kill()
            except OSError as exc:
                append_debug(ctx, f'Kill failed: {exc}')
            try:
                returncode = proc.wait(timeout=15)
            except subprocess.TimeoutExpired:
                returncode = None
        else:
            returncode = proc.returncode

    except Exception as exc:
        logger.error(f'Claude launch failed for {ctx.task_id}: {exc}')
        if log_handle is not None:
            try:
                log_handle.close()
            except OSError:
                pass
            log_handle = None
        write_launch_failure(ctx, str(exc), pre_commit, bot_token, chat_id, logger)
        # v4.0: cleanup worktree + release pages even on failure
        cleanup_worktree(main_repo_dir, wt_path, ctx.task_id, logger)
        release_pages(pages, ctx.task_id, logger)
        return

    finally:
        if log_handle is not None:
            try:
                log_handle.flush()
            except Exception:
                pass
            try:
                log_handle.close()
            except OSError:
                pass
        heartbeat_stop.set()
        if heartbeat_thread is not None:
            heartbeat_thread.join(timeout=1.0)

    # ── v4.0: Merge worktree back to main + cleanup ──
    is_error = timed_out or returncode not in (0, None)
    if not is_error:
        # Serialize merges: only one merge at a time to avoid conflicts
        with _merge_lock:
            merge_ok = merge_worktree_to_main(main_repo_dir, wt_path, ctx.task_id, logger)
            if not merge_ok:
                append_debug(ctx, 'MERGE FAILED — worktree preserved for manual resolution')
                logger.error(f'Merge failed for {ctx.task_id}. Worktree preserved: {wt_path}')
                # Still finalize with error status
                is_error = True
    else:
        logger.info(f'Task had error/timeout, skipping merge for {ctx.task_id}')

    # Finalize (reads git diff from work_dir which is the worktree)
    finalize_process(ctx, pre_commit, returncode, timed_out, bot_token, chat_id, logger)

    # INFRA-001a: Update chain state after step completes
    if is_chain_step:
        result = parse_claude_result(ctx.log_file, logger)
        step_cost = f'{extract_total_cost(result):.2f}'
        step_is_error = timed_out or returncode not in (0, None) or bool(result.get('is_error', False))
        step_duration = max(0, int(time.time()) - ctx.start_epoch)
        git_diff = collect_git_diff(ctx.work_dir, pre_commit, logger)
        err_reason = ''
        if step_is_error:
            err_reason = detect_error_reason(ctx.log_file)
        update_chain_after_step(
            meta, ctx.task_id, step_is_error, step_cost,
            pipeline_dir, bot_token, chat_id, logger,
            runner=runner, duration_sec=step_duration, files_count=len(git_diff),
            error_reason=err_reason,
        )

    # Cleanup worktree (unless merge failed — keep for manual intervention)
    merge_ok = locals().get('merge_ok', True)  # True if merge was never attempted (error path)
    should_cleanup = merge_ok or is_error  # keep worktree ONLY if merge was attempted and failed
    if should_cleanup:
        cleanup_worktree(main_repo_dir, wt_path, ctx.task_id, logger)
    else:
        logger.warning(f'Worktree preserved for manual merge: {wt_path}')

    # v4.0: Always release page lock
    release_pages(pages, ctx.task_id, logger)

    if timed_out:
        logger.warning(f'Finalized timeout for {ctx.page} ({ctx.task_id})')
    elif returncode not in (0, None):
        logger.warning(f'Finalized error for {ctx.page} ({ctx.task_id}) rc={returncode}')
    else:
        logger.info(f'Done: {ctx.page} ({ctx.task_id})')


def main() -> None:
    cfg = load_config()
    root = cfg["paths"]["onedrive_root"]
    pipeline_dir = Path(root) / "pipeline"
    queue_dir = pipeline_dir / "queue"
    pid_file = pipeline_dir / ".task-watcher-multi.pid"  # v4.0: separate PID file

    queue_dir.mkdir(parents=True, exist_ok=True)

    logger = setup_logging(pipeline_dir, cfg)

    # ── PID check (BUG-3 fix: Windows-safe via tasklist) ──
    if check_pid_running(pid_file):
        try:
            old_pid = pid_file.read_text(encoding="utf-8").strip()
        except OSError:
            old_pid = "unknown"
        logger.error(f"Another instance is running (PID {old_pid}). Exiting.")
        logger.error(f"If that's stale, delete: {pid_file}")
        sys.exit(1)

    write_pid(pid_file)

    # ── Signal handling ──
    stop_event = threading.Event()

    def handle_signal(signum, frame):
        logger.info(f"Signal {signum} received — shutting down gracefully...")
        stop_event.set()

    signal.signal(signal.SIGINT, handle_signal)
    try:
        signal.signal(signal.SIGTERM, handle_signal)
    except (OSError, AttributeError):
        pass  # SIGTERM not available on Windows

    bot_token = cfg["telegram"]["bot_token"]
    chat_id = cfg["telegram"]["chat_id"]
    poll_interval = cfg["watcher"].get("poll_interval", 5)
    recovery_hours = cfg.get("watcher", {}).get("recovery_max_age_hours", 24)
    max_concurrent = cfg.get("watcher", {}).get("max_concurrent_chains", 2)  # v4.0

    # ── Banner ──
    print("=" * 50)
    print('  Task Watcher MULTI v5.0 (Parallel Worktrees + Chain Templates)')
    print("=" * 50)
    print(f"Watching  : pipeline/queue/")
    print(f"Parallel  : up to {max_concurrent} chains")
    print(f"Isolation : git worktree per chain")
    print(f"Page lock : YES (same page = sequential)")
    print(f"Poll      : {poll_interval}s")
    print(f'Recovery  : {recovery_hours}h window')
    print('Launch    : Python subprocess.Popen -> Claude Code')
    print('Log       : pipeline/task-watcher.log (rotating 5MB x3)')
    print(f"PID file  : pipeline/.task-watcher-multi.pid")
    print(f"Python    : {sys.version.split()[0]}")
    print("Press Ctrl+C to stop.\n")

    logger.info(f'Task Watcher MULTI v5.0 started (PID {os.getpid()}, max_concurrent={max_concurrent})')

    # ── Recovery: handle tasks interrupted by PC restart ──
    recover_interrupted_tasks(pipeline_dir, bot_token, chat_id, cfg, logger)

    # ── v5.0: Main loop with ThreadPoolExecutor + chain expansion ──
    # Unlike v3.0 (sequential for loop), this submits tasks to a thread pool.
    # v5.0: chain_template tasks are expanded into step files BEFORE submission.
    # Page lock inside run_task prevents conflicts — deferred tasks stay in queue/.
    active_futures: dict[str, Future] = {}  # task_filename -> Future

    try:
        with ThreadPoolExecutor(max_workers=max_concurrent, thread_name_prefix='chain') as executor:
            while not stop_event.is_set():
                # Clean up completed futures
                done_keys = [k for k, f in active_futures.items() if f.done()]
                for k in done_keys:
                    future = active_futures.pop(k)
                    # Log any unhandled exceptions from the thread
                    exc = future.exception()
                    if exc:
                        logger.error(f'Task thread {k} raised exception: {exc}')

                # Scan queue for new tasks
                raw_files = list(queue_dir.glob("*.md"))

                # v5.0: First pass — expand any chain_template tasks into step files.
                # This happens synchronously (fast, just file I/O) before submitting.
                expanded_any = False
                for f in list(raw_files):
                    if f.name.startswith('.processing-'):
                        continue
                    if f.name in active_futures:
                        continue
                    if expand_chain_task_if_needed(f, pipeline_dir, bot_token, chat_id, logger, cfg=cfg):
                        expanded_any = True
                        raw_files.remove(f)

                # Re-scan if we expanded chains (new step files appeared)
                if expanded_any:
                    raw_files = list(queue_dir.glob("*.md"))

                task_files = []
                for f in raw_files:
                    if f.name.startswith('.processing-'):
                        continue
                    # Skip files already being processed
                    if f.name in active_futures:
                        continue
                    try:
                        task_files.append((f.stat().st_mtime, f))
                    except OSError:
                        pass
                task_files = [f for _, f in sorted(task_files)]  # oldest first

                if task_files:
                    slots_available = max_concurrent - len(active_futures)
                    if slots_available > 0:
                        logger.info(
                            f"Queue: {len(task_files)} task(s), "
                            f"active: {len(active_futures)}/{max_concurrent}, "
                            f"slots: {slots_available}"
                        )

                    for task_file in task_files:
                        if stop_event.is_set():
                            break
                        if len(active_futures) >= max_concurrent:
                            break  # all slots busy, wait for next poll

                        # Submit to thread pool
                        # run_task handles page lock internally — if page is busy,
                        # it returns immediately and the file stays in queue/
                        fname = task_file.name
                        future = executor.submit(
                            run_task, task_file, cfg, logger, stop_event, bot_token, chat_id
                        )
                        active_futures[fname] = future
                        logger.info(f'Submitted {fname} to thread pool')

                time.sleep(poll_interval)

            # ── Graceful shutdown: wait for running tasks ──
            if active_futures:
                logger.info(f'Shutdown: waiting for {len(active_futures)} active task(s)...')
                for fname, future in active_futures.items():
                    try:
                        future.result(timeout=10)
                    except Exception as exc:
                        logger.warning(f'Task {fname} during shutdown: {exc}')

    finally:
        cleanup_pid(pid_file)
        logger.info("Task Watcher MULTI stopped.")


if __name__ == "__main__":
    main()
