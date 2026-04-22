---
page: Profile
code_file: pages/Profile/base/profile.jsx
budget: 10
agent: cc+codex
pipeline: v8
type: consensus
---

# Smoke Test S144 v2: V8 Consensus Retest (Comparator fix)

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
Третий smoke test V8 consensus pipeline. Предыдущие прогоны:
- S143 (task-260317-233101): CC Writer CRASH на `(if` syntax (KB-068), Comparator CRASH (KB-069)
- S144 v1 (task-260318-143030): CC Writer OK (0 files), Codex OK (1 file) — but Comparator CRASH: single-writer fallback not in Merge-ConsensusCompare.ps1, plus bare `if` in hashtable
- **Fixes applied**: single-writer fallback in Comparator + `$(if)` fix in 10 PS1 files (25 places)

### Критерии PASS:
- [ ] Supervisor распознал pipeline=v8 и запустил consensus флоу
- [ ] CC Writer НЕ крашнулся (KB-068 verified)
- [ ] Comparator НЕ крашнулся при single-writer scenario (KB-069 verified)
- [ ] Pipeline завершился без ошибок (DONE, не FAILED)
- [ ] Финальный результат — consensus или single-writer fallback (не crash)
