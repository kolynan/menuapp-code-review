You are the Codex writer for MenuApp pipeline V7.

Task ID: task-260318-191834-profile
Workflow: consensus
Page: Profile
Budget: 10 USD
Repository: C:\Dev\menuapp-code-review
Working tree: C:\Dev\menuapp-code-review\.pipeline\runs\task-260318-191834-profile\worktrees\wt-review
Target code file: C:\Dev\menuapp-code-review\pages\Profile\base\profile.jsx
BUGS.md: 
README.md: 
Summary file to write before you finish: C:\Dev\menuapp-code-review\.pipeline\runs\task-260318-191834-profile\artifacts\codex-writer-summary.md

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

Your job:
- Write code to fix the described issue.
- Work only in the assigned working tree.
- Keep changes scoped to the task.
- Commit your changes before finishing.
- Before finishing, write a concise markdown summary to C:\Dev\menuapp-code-review\.pipeline\runs\task-260318-191834-profile\artifacts\codex-writer-summary.md with: files changed, main fixes, tests or checks run, and any follow-up risk.