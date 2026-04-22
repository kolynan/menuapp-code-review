#!/usr/bin/env python3
'''
task-watcher.py
Version: 3.0
Created: 2026-03-05, Session 83
Updated: 2026-03-11, Session 109 - v3.0: Launch Claude Code directly via Python Popen
  - Replaces bash nohup launcher from run-vsc-task.sh for CC startup
  - Uses Windows DETACHED_PROCESS + CREATE_NEW_PROCESS_GROUP flags
  - Heartbeat moved from nohup bash to Python thread
  - Prompt building and result telemetry moved into Python
  - Fixes KB-017: inner bash can fail before first line on Windows

Python task watcher for pipeline/queue/.
Processes tasks sequentially, launches Claude Code directly, and keeps Telegram
and pipeline artifacts in sync without relying on bash nohup.
'''

import json
import logging
import os
import re
import shutil
import signal
import subprocess
import sys
import threading
import time
import urllib.request
from dataclasses import dataclass
from datetime import datetime
from logging.handlers import RotatingFileHandler
from pathlib import Path

CONFIG_PATH = Path(__file__).parent / 'task-watcher-config.json'
DEFAULT_REPO_DIR = Path('C:/Dev/menuapp-code-review')
SYSTEM_RULES_NAME = 'cc-system-rules.txt'
WATCHER_VERSION = '3.0'
PIPELINE_AI_LABEL = 'CC + Codex v6.0 (CC-managed)'
ALLOWED_TOOLS = 'Bash,Read,Edit,Write'
HEARTBEAT_INTERVAL_SEC = 300
PROCESS_POLL_SEC = 5
DETACHED_FLAGS = (
    getattr(subprocess, 'DETACHED_PROCESS', 0)
    | getattr(subprocess, 'CREATE_NEW_PROCESS_GROUP', 0)
)


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
    return (
        f'[..] {ctx.task_id}\n\n'
        f'Page: {ctx.page}\n'
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


def build_cc_prompt(ctx: TaskContext, code_file: Path | None) -> str:
    dq = chr(34)
    codex_instruction = build_codex_instruction(ctx, code_file) if code_file else ''
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
) -> list[str]:
    cmd = list(launch_prefix)
    cmd.extend([
        '-p',
        read_text(ctx.prompt_tmpfile),
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
    return cmd


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


def detect_codex_status(ctx: TaskContext) -> str:
    try:
        if ctx.codex_findings_file.exists() and ctx.codex_findings_file.stat().st_size > 0:
            return 'done'
    except OSError:
        pass

    try:
        for cdx_file in ctx.work_dir.glob('codex-round*-discussion.md'):
            if cdx_file.stat().st_size <= 0:
                continue
            if int(cdx_file.stat().st_mtime) >= ctx.start_epoch:
                return 'done'
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
    root = Path(cfg['paths']['onedrive_root'])
    pipeline_dir = root / 'pipeline'
    filename = task_file.name

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

    dest = pipeline_dir / filename
    try:
        shutil.move(str(task_file), str(dest))
    except OSError as exc:
        logger.error(f'Cannot move {filename} to pipeline/: {exc}')
        return

    ctx = create_task_context(dest, content, meta, cfg)
    fallback_model = cfg['defaults'].get('fallback_model', 'sonnet')
    system_rules_file = root / 'references' / SYSTEM_RULES_NAME

    logger.info(f'Task: {ctx.page} (budget: ${ctx.budget}) - {filename}')

    code_file = detect_code_file(ctx, logger)
    prompt_text = build_cc_prompt(ctx, code_file)

    write_text(ctx.progress_file, build_initial_progress(ctx))
    send_initial_telegram(ctx, bot_token, chat_id, logger)
    write_text(ctx.managed_file, f'managed by task-watcher.py v{WATCHER_VERSION}\n')
    write_text(ctx.prompt_tmpfile, prompt_text)
    write_text(ctx.task_record_file, build_task_record(ctx, fallback_model))

    pre_commit = get_pre_task_commit(ctx.work_dir, logger)
    write_text(ctx.pre_commit_file, pre_commit)

    launch_prefix, claude_label = resolve_claude_command(cfg['paths']['claude_cli'])
    write_debug_preamble(ctx, claude_label, fallback_model, system_rules_file, pre_commit)

    heartbeat_stop = threading.Event()
    heartbeat_thread = threading.Thread(
        target=heartbeat_worker,
        args=(ctx, bot_token, chat_id, heartbeat_stop, logger),
        daemon=True,
    )
    heartbeat_thread.start()

    log_handle = None
    timed_out = False
    returncode = None

    try:
        if not launch_prefix:
            raise FileNotFoundError('Claude Code CLI launch command could not be resolved')
        if not ctx.work_dir.exists():
            raise FileNotFoundError(f'Repo dir not found: {ctx.work_dir.as_posix()}')

        cmd = build_claude_command(ctx, launch_prefix, fallback_model, system_rules_file)
        env = os.environ.copy()
        env.setdefault('LANG', 'en_US.UTF-8')
        env.setdefault('LC_ALL', 'en_US.UTF-8')

        log_handle = ctx.log_file.open('w', encoding='utf-8', newline='\n')
        proc = subprocess.Popen(
            cmd,
            cwd=str(ctx.work_dir),
            stdin=subprocess.DEVNULL,
            stdout=log_handle,
            stderr=subprocess.STDOUT,
            creationflags=DETACHED_FLAGS if os.name == 'nt' else 0,
            env=env,
        )
        append_debug(ctx, f'Popen PID: {proc.pid}')
        logger.info(f'CC PID: {proc.pid} ({ctx.task_id})')

        max_wait_sec = cfg.get('watcher', {}).get('max_wait_minutes', 60) * 60
        waited = 0
        logger.info(f'Waiting for Claude process exit (max {max_wait_sec // 60}min)')

        while waited < max_wait_sec:
            if stop_event.is_set():
                append_debug(ctx, 'Watcher stop requested before completion; leaving process detached')
                logger.info(f'Stop requested - abandoning wait for {ctx.task_id}')
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
        heartbeat_thread.join(timeout=1.0)

    finalize_process(ctx, pre_commit, returncode, timed_out, bot_token, chat_id, logger)

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
    pid_file = pipeline_dir / ".task-watcher.pid"

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

    # ── Banner ──
    print("=" * 46)
    print('  Task Watcher v3.0 (Direct Claude Popen)')
    print("=" * 46)
    print(f"Watching : pipeline/queue/")
    print(f"Poll     : {poll_interval}s")
    print(f'Recovery : {recovery_hours}h window')
    print('Launch   : Python subprocess.Popen -> Claude Code')
    print('Log      : pipeline/task-watcher.log (rotating 5MB x3)')
    print(f"PID file : pipeline/.task-watcher.pid")
    print(f"Python   : {sys.version.split()[0]}")
    print("Press Ctrl+C to stop.\n")

    logger.info(f'Task Watcher v3.0 started (PID {os.getpid()})')

    # ── Recovery: handle tasks interrupted by PC restart ──
    recover_interrupted_tasks(pipeline_dir, bot_token, chat_id, cfg, logger)

    # ── Main loop ──
    try:
        while not stop_event.is_set():
            # P1 fix: stat() can fail if a file disappears between glob() and stat()
            # (e.g. another process picked it up). Collect mtime safely; skip missing files.
            raw_files = list(queue_dir.glob("*.md"))
            task_files = []
            for f in raw_files:
                try:
                    task_files.append((f.stat().st_mtime, f))
                except OSError:
                    pass  # file disappeared between glob and stat — skip
            task_files = [f for _, f in sorted(task_files)]  # oldest first

            if not task_files:
                time.sleep(poll_interval)
                continue

            logger.info(f"Found {len(task_files)} task(s) in queue")

            for task_file in task_files:
                if stop_event.is_set():
                    break
                run_task(task_file, cfg, logger, stop_event, bot_token, chat_id)

            if not stop_event.is_set():
                logger.info("All tasks processed. Waiting for next batch...")

    finally:
        cleanup_pid(pid_file)
        logger.info("Task Watcher stopped.")


if __name__ == "__main__":
    main()
