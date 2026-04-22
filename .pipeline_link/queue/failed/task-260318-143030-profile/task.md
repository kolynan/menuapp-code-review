---
page: Profile
code_file: pages/Profile/base/profile.jsx
budget: 10
agent: cc+codex
pipeline: v8
type: consensus
---

# Smoke Test S144: V8 Consensus Retest (KB-068/069 fixes)

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
Повторный smoke test V8 consensus pipeline. Предыдущий прогон (S143, task-260317-233101-profile) упал:
- **KB-068**: CC Writer crash — `(if ...)` syntax incompatible with PS5.1. FIXED: `$(if ...)` в 5 местах (коммит 9f04ce2).
- **KB-069**: Comparator crash — CC Writer нет коммита → throw. FIXED: single-writer fallback (коммит 9f04ce2).

### Критерии PASS:
- [ ] Supervisor распознал pipeline=v8 и запустил consensus флоу
- [ ] CC Writer НЕ крашнулся на `$(if` (KB-068 fix verified)
- [ ] Оба агента написали код (не review, а реальные изменения)
- [ ] Comparator НЕ крашнулся (KB-069 fix verified)
- [ ] Discussion rounds прошли (минимум 1 раунд) ИЛИ single-writer fallback сработал корректно
- [ ] Финальный результат — consensus или DISPUTE (не crash)
