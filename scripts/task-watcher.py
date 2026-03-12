#!/usr/bin/env python3
"""
Task watcher v7 dispatcher.

Default behavior:
- pipeline: v7 dispatches to the V7 PowerShell supervisor
- pipeline: v3 or no pipeline frontmatter stays on the legacy v3 path

The watcher is intentionally thin for V7 tasks:
- poll queue/ for markdown tasks
- claim V7 tasks into queue/running/<task-id>/task.md
- launch the PowerShell V7 supervisor and wait for it
- delegate legacy tasks to task-watcher-v3-legacy.py
"""

from __future__ import annotations

import json
import logging
import os
import re
import shutil
import signal
import subprocess
import sys
import time
from logging.handlers import RotatingFileHandler
from pathlib import Path

CONFIG_PATH = Path(__file__).parent / "task-watcher-config.json"
EXAMPLE_CONFIG_PATH = Path(__file__).parent / "task-watcher-config.example.json"
V3_LEGACY_PATH = Path(__file__).parent / "task-watcher-v3-legacy.py"
DEFAULTS = {
    "paths": {
        "onedrive_root": r"C:/Users/ASUS/OneDrive/002 Menu/Claude AI Cowork",
        "repo_dir": r"C:/Dev/menuapp-code-review",
        "powershell_exe": r"C:/WINDOWS/System32/WindowsPowerShell/v1.0/powershell.exe",
    },
    "watcher": {
        "poll_interval": 5,
        "supervisor_timeout_minutes": 180,
    },
}
WATCHER_VERSION = "7.1"
V7_TYPES = {"code-review", "ux-discussion"}


def merge_dict(base: dict, override: dict) -> dict:
    for key, value in override.items():
        if isinstance(base.get(key), dict) and isinstance(value, dict):
            merge_dict(base[key], value)
        else:
            base[key] = value
    return base


def load_config() -> dict:
    cfg = json.loads(json.dumps(DEFAULTS))
    source = CONFIG_PATH if CONFIG_PATH.exists() else EXAMPLE_CONFIG_PATH
    if source.exists():
        with source.open(encoding="utf-8") as handle:
            merge_dict(cfg, json.load(handle))
    return cfg


def setup_logging(pipeline_dir: Path) -> logging.Logger:
    pipeline_dir.mkdir(parents=True, exist_ok=True)
    log_path = pipeline_dir / "task-watcher.log"
    logger = logging.getLogger("task-watcher")
    logger.handlers.clear()
    logger.setLevel(logging.DEBUG)
    logger.propagate = False

    file_handler = RotatingFileHandler(log_path, maxBytes=5 * 1024 * 1024, backupCount=3, encoding="utf-8")
    file_handler.setLevel(logging.DEBUG)
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(logging.INFO)
    formatter = logging.Formatter("%(asctime)s [%(levelname)s] %(message)s", datefmt="%H:%M:%S")
    file_handler.setFormatter(formatter)
    console_handler.setFormatter(formatter)
    logger.addHandler(file_handler)
    logger.addHandler(console_handler)
    return logger


def parse_frontmatter(content: str) -> dict:
    if not content.startswith("---"):
        return {}
    end = content.find("---", 3)
    if end == -1:
        return {}
    meta = {}
    for line in content[3:end].strip().splitlines():
        line = line.strip()
        if not line or line.startswith("#") or ":" not in line:
            continue
        key, _, value = line.partition(":")
        meta[key.strip()] = value.strip().strip('"\'')
    return meta


def determine_pipeline(meta: dict) -> str:
    pipeline_version = meta.get("pipeline", "").strip().lower()
    if pipeline_version == "v7":
        return "v7"
    return "v3"


def slugify(value: str) -> str:
    value = re.sub(r"[^a-z0-9]+", "-", value.lower()).strip("-")
    return value or "task"


def build_task_id(task_file: Path, meta: dict | None = None) -> str:
    timestamp = time.strftime("%y%m%d-%H%M%S")
    meta = meta or {}
    stem = meta.get("page") or meta.get("topic") or task_file.stem
    return f"task-{timestamp}-{slugify(stem)}"


def write_pid(pid_file: Path) -> None:
    pid_file.write_text(str(os.getpid()), encoding="utf-8")


def check_pid_running(pid_file: Path) -> bool:
    if not pid_file.exists():
        return False
    try:
        old_pid = int(pid_file.read_text(encoding="utf-8").strip())
    except (OSError, ValueError):
        return False
    try:
        result = subprocess.run(
            ["tasklist", "/FI", f"PID eq {old_pid}", "/FO", "CSV", "/NH"],
            capture_output=True,
            text=True,
            timeout=5,
            check=False,
        )
    except Exception:
        return False
    return str(old_pid) in result.stdout


def cleanup_pid(pid_file: Path) -> None:
    try:
        pid_file.unlink(missing_ok=True)
    except OSError:
        pass


def claim_v7_task(task_file: Path, queue_dir: Path, meta: dict) -> tuple[str, Path]:
    task_id = build_task_id(task_file, meta)
    running_dir = queue_dir / "running" / task_id
    running_dir.mkdir(parents=True, exist_ok=True)
    dest = running_dir / "task.md"
    shutil.move(str(task_file), str(dest))
    return task_id, dest


def launch_v7_supervisor(task_id: str, task_file: Path, meta: dict, cfg: dict, logger: logging.Logger) -> int:
    repo_dir = Path(cfg["paths"]["repo_dir"])
    supervisor = repo_dir / "pipeline" / "v7" / "scripts" / "Start-TaskSupervisor.ps1"
    if not supervisor.exists():
        logger.error("Supervisor script not found: %s", supervisor)
        return 1

    powershell_exe = cfg["paths"].get("powershell_exe") or DEFAULTS["paths"]["powershell_exe"]
    args = [
        powershell_exe,
        "-NoProfile",
        "-ExecutionPolicy",
        "Bypass",
        "-File",
        str(supervisor),
        "-TaskFile",
        str(task_file),
        "-TaskId",
        task_id,
        "-RepoRoot",
        str(repo_dir),
    ]
    for key, flag in (
        ("type", "-TaskType"),
        ("page", "-TaskPage"),
        ("topic", "-TaskTopic"),
        ("budget", "-TaskBudget"),
        ("agent", "-TaskAgent"),
    ):
        value = str(meta.get(key, "")).strip()
        if value:
            args.extend([flag, value])
    if CONFIG_PATH.exists():
        args.extend(["-ConfigPath", str(CONFIG_PATH)])

    timeout_minutes = int(cfg.get("watcher", {}).get("supervisor_timeout_minutes", 180))
    logger.info("Launching V7 supervisor for %s", task_id)
    try:
        proc = subprocess.run(args, cwd=str(repo_dir), check=False, timeout=timeout_minutes * 60)
    except subprocess.TimeoutExpired:
        logger.error("V7 supervisor timed out for %s after %s minutes", task_id, timeout_minutes)
        return 124
    logger.info("V7 supervisor finished for %s rc=%s", task_id, proc.returncode)
    return proc.returncode


def launch_legacy_task(task_file: Path, logger: logging.Logger) -> int:
    if not V3_LEGACY_PATH.exists():
        logger.error("Legacy watcher not found: %s", V3_LEGACY_PATH)
        return 1

    args = [sys.executable, str(V3_LEGACY_PATH), "--single-task", str(task_file)]
    if CONFIG_PATH.exists():
        args.extend(["--config", str(CONFIG_PATH)])

    logger.info("Launching legacy v3 watcher for %s", task_file.name)
    proc = subprocess.run(args, cwd=str(Path(__file__).parent.parent), check=False)
    logger.info("Legacy v3 watcher finished for %s rc=%s", task_file.name, proc.returncode)
    return proc.returncode


def inspect_task(task_file: Path) -> tuple[dict, str]:
    content = task_file.read_text(encoding="utf-8", errors="replace")
    meta = parse_frontmatter(content)
    return meta, determine_pipeline(meta)


def main() -> None:
    cfg = load_config()
    onedrive_root = Path(cfg["paths"]["onedrive_root"])
    pipeline_dir = onedrive_root / "pipeline"
    queue_dir = pipeline_dir / "queue"
    queue_dir.mkdir(parents=True, exist_ok=True)
    (queue_dir / "running").mkdir(parents=True, exist_ok=True)
    (queue_dir / "done").mkdir(parents=True, exist_ok=True)
    (queue_dir / "failed").mkdir(parents=True, exist_ok=True)
    (pipeline_dir / "results").mkdir(parents=True, exist_ok=True)

    logger = setup_logging(pipeline_dir)
    pid_file = pipeline_dir / ".task-watcher.pid"

    if check_pid_running(pid_file):
        logger.error("Another watcher instance is already running. Exiting.")
        sys.exit(1)
    write_pid(pid_file)

    stop = False

    def handle_signal(signum, _frame):
        nonlocal stop
        logger.info("Signal %s received. Stopping watcher.", signum)
        stop = True

    signal.signal(signal.SIGINT, handle_signal)
    try:
        signal.signal(signal.SIGTERM, handle_signal)
    except (AttributeError, OSError):
        pass

    poll_interval = int(cfg.get("watcher", {}).get("poll_interval", 5))
    logger.info("Task Watcher v%s started", WATCHER_VERSION)
    logger.info("Watching queue: %s", queue_dir)

    try:
        while not stop:
            task_files = []
            for candidate in queue_dir.glob("*.md"):
                try:
                    task_files.append((candidate.stat().st_mtime, candidate))
                except OSError:
                    continue
            task_files = [path for _, path in sorted(task_files)]

            if not task_files:
                time.sleep(poll_interval)
                continue

            logger.info("Found %s queued task(s)", len(task_files))
            for task_file in task_files:
                if stop:
                    break
                try:
                    meta, pipeline_name = inspect_task(task_file)
                except OSError as exc:
                    logger.exception("Could not read task file %s: %s", task_file.name, exc)
                    continue

                if pipeline_name == "v7":
                    task_id, claimed_task = claim_v7_task(task_file, queue_dir, meta)
                    logger.info("Claimed %s as V7 task %s", task_file.name, task_id)
                    launch_v7_supervisor(task_id, claimed_task, meta, cfg, logger)
                else:
                    logger.info("Dispatching %s via legacy v3 path", task_file.name)
                    launch_legacy_task(task_file, logger)

            if not stop:
                logger.info("Queue drained. Waiting for next task.")
    finally:
        cleanup_pid(pid_file)
        logger.info("Task Watcher stopped.")


if __name__ == "__main__":
    main()
