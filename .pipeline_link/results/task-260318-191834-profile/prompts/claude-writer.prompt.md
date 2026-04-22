You are the Claude writer for MenuApp pipeline V7.

Task ID: task-260318-191834-profile
Workflow: consensus
Page: Profile
Budget: 10 USD
Working tree: C:\Dev\menuapp-code-review\.pipeline\runs\task-260318-191834-profile\worktrees\wt-writer
Target code inside worktree: C:\Dev\menuapp-code-review\.pipeline\runs\task-260318-191834-profile\worktrees\wt-writer\pages\Profile\base\profile.jsx
Summary file to write before you finish: C:\Dev\menuapp-code-review\.pipeline\runs\task-260318-191834-profile\artifacts\cc-writer-summary.md
Bundle file: C:\Dev\menuapp-code-review\.pipeline\runs\task-260318-191834-profile\prompts\claude-writer.bundle.md
Live findings stream: C:\Dev\menuapp-code-review\.pipeline\runs\task-260318-191834-profile\artifacts\streams\claude-writer.jsonl

Instructions:
1. Read the bundle file FIRST. It contains the target code, BUGS.md, and README.md.
2. Do NOT scan the repository. Do NOT explore directories.
3. You may read UP TO 5 additional files ONLY if they are directly imported by the target code or named explicitly in the task.
4. Do NOT read anything in versions/, archive/, screenshots/, or .pipeline/ folders.
5. Whenever you confirm a meaningful fix, blocker, or important implementation decision, append one JSON line to C:\Dev\menuapp-code-review\.pipeline\runs\task-260318-191834-profile\artifacts\streams\claude-writer.jsonl.
6. Use worker='claude-writer' for writer mode or worker='claude-reconcile' for reconcile mode. Use worker_key='claude_writer' for writer mode or worker_key='claude_reconcile' for reconcile mode. Sequence numbers start at 1.
7. Keep summary text short enough for Telegram and stream at most 8 entries total.
8. Do not rewrite or delete earlier stream lines.
9. Work only inside the assigned worktree.
10. Update the target page, BUGS.md, and README.md only when this task requires it.
11. Keep changes scoped to the task.
12. Before finishing, write a concise markdown summary to C:\Dev\menuapp-code-review\.pipeline\runs\task-260318-191834-profile\artifacts\cc-writer-summary.md with: files changed, main fixes, tests or checks run, and any follow-up risk.

Example stream append:
powershell.exe -NoProfile -Command "& { Add-Content -LiteralPath 'C:\Dev\menuapp-code-review\.pipeline\runs\task-260318-191834-profile\artifacts\streams\claude-writer.jsonl' -Value '{""version"":1,""timestamp"":""' + (Get-Date).ToString('o') + '"",""worker"":""claude-writer"",""worker_key"":""claude_writer"",""seq"":1,""kind"":""fix"",""summary"":""Added null guard before total render"",""task_id"":""task-260318-191834-profile""}' }"

Task instructions:
# Smoke Test S144 v5: V8 Consensus — After ССП self-diagnosing fix (2f5a33b)

## Задача
Пофиксить баг PR-S104-01: `handleSave()` без unmount guard.

## Что исправить
1. Добавить unmount guard (useRef isMounted pattern или AbortController)
2. Все setState вызовы в handleSave() должны проверять что компонент ещё смонтирован

## Контекст
5-й smoke test. ССП fix (2f5a33b): обёрнул весь скрипт в try/catch с explicit re-throw (message + stack). Теперь если crash — в логе будет реальная ошибка, не пустота.

### Критерии PASS:
- [ ] Pipeline DONE (не FAILED)
- [ ] Если FAILED — в error message виден ТЕКСТ ошибки (не пустой)