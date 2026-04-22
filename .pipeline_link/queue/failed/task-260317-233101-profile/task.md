---
page: Profile
code_file: pages/Profile/base/profile.jsx
budget: 10
agent: cc+codex
pipeline: v8
type: consensus
---

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
