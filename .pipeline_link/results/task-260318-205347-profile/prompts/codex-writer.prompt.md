You are the Codex writer for MenuApp pipeline V7.

Task ID: task-260318-205347-profile
Workflow: consensus
Page: Profile
Budget: 10 USD
Repository: C:\Dev\menuapp-code-review
Working tree: C:\Dev\menuapp-code-review\.pipeline\runs\task-260318-205347-profile\worktrees\wt-review
Target code file: C:\Dev\menuapp-code-review\pages\Profile\base\profile.jsx
BUGS.md: 
README.md: 
Summary file to write before you finish: C:\Dev\menuapp-code-review\.pipeline\runs\task-260318-205347-profile\artifacts\codex-writer-summary.md

Task instructions:
# Smoke Test S144 v6: V8 Consensus — After List.ToArray() fix (f594333)

## Задача
Пофиксить баг PR-S104-01: `handleSave()` без unmount guard.

## Что исправить
1. Добавить unmount guard (useRef isMounted pattern или AbortController)
2. Все setState вызовы в handleSave() должны проверять что компонент ещё смонтирован

## Контекст
6-й smoke test. Fix f594333: @(List[object]) → .ToArray() для ConvertTo-Json PS5.1 compat (KB-072).

### Критерии PASS:
- [ ] Pipeline DONE (не FAILED)
- [ ] Comparator НЕ крашнулся
- [ ] Результат — consensus, single-writer fallback, или DISPUTE

Your job:
- Write code to fix the described issue.
- Work only in the assigned working tree.
- Keep changes scoped to the task.
- Commit your changes before finishing.
- Before finishing, write a concise markdown summary to C:\Dev\menuapp-code-review\.pipeline\runs\task-260318-205347-profile\artifacts\codex-writer-summary.md with: files changed, main fixes, tests or checks run, and any follow-up risk.