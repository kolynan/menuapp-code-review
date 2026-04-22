You are the Codex writer for MenuApp pipeline V7.

Task ID: task-260317-233101-profile
Workflow: consensus
Page: Profile
Budget: 10 USD
Repository: C:\Dev\menuapp-code-review
Working tree: C:\Dev\menuapp-code-review\.pipeline\runs\task-260317-233101-profile\worktrees\wt-review
Target code file: C:\Dev\menuapp-code-review\pages\Profile\base\profile.jsx
BUGS.md: 
README.md: 
Summary file to write before you finish: C:\Dev\menuapp-code-review\.pipeline\runs\task-260317-233101-profile\artifacts\codex-writer-summary.md

Task instructions:
# Smoke Test S143: V8 Consensus Pipeline

## Задача
Пофиксить баг PR-S104-01: `handleSave()` без unmount guard — если уйти со страницы во время сохранения, промис вызывает setInitialFullName/setSaveStatus/toast на размонтированном компоненте.

## Что исправить
1. Добавить unmount guard (useRef isMounted pattern или AbortController)
2. Все setState вызовы в handleSave() должны проверять что компонент ещё смонтирован
3. Не ломать существующую логику сохранения

## Ожидаемое поведение
- handleSave() корректно работает при нормальном использовании (без unmount)
- Если пользователь уходит со страницы во время сохранения — нет console warnings, нет state updates на unmounted component

## Контекст
Smoke test для V8 consensus pipeline (коммит 4442792). Оба агента (CC + Codex) пишут свой вариант фикса параллельно, потом сравнивают и приходят к consensus через discussion rounds.

### Критерии PASS:
- [ ] Supervisor распознал pipeline=v8 и запустил consensus флоу
- [ ] Оба агента написали код (не review, а реальные изменения)
- [ ] Discussion rounds прошли (минимум 1 раунд)
- [ ] Финальный результат — consensus или DISPUTE

Your job:
- Write code to fix the described issue.
- Work only in the assigned working tree.
- Keep changes scoped to the task.
- Commit your changes before finishing.
- Before finishing, write a concise markdown summary to C:\Dev\menuapp-code-review\.pipeline\runs\task-260317-233101-profile\artifacts\codex-writer-summary.md with: files changed, main fixes, tests or checks run, and any follow-up risk.