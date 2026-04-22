---
chain_template: consensus-with-discussion
page: PublicMenu
code_file: pages/PublicMenu/base/useTableSession.jsx
budget_per_step: 3
---

# Fix: PM-041 — Polling timer leak in useTableSession (P0)

## Проблема
`scheduleNext()` в useTableSession.jsx создаёт рекурсивный цепочку `setTimeout`. При cleanup (unmount компонента) устанавливается `cancelled=true` и вызывается `clearTimeout(intervalId)`. Однако, если `pollSessionData()` ещё выполняется в момент cleanup, коллбэк `scheduleNext` внутри него регистрирует НОВЫЙ timeout, который cleanup уже не может очистить. Это приводит к orphaned polling и spurious state updates на stale компонентах.

## Файл и строки
`useTableSession.jsx`, строки ~670-685 (scheduleNext function)

## Воспроизведение
1. Открыть /x (публичное меню)
2. Дождаться пока polling запустится (таблица верифицирована, сессия активна)
3. Быстро перейти на другую страницу или закрыть drawer
4. В console — warnings "state update on unmounted component"

## Ожидаемое поведение
- `scheduleNext` ОБЯЗАНА проверять `if (cancelled) return` ПЕРЕД регистрацией нового setTimeout
- После unmount — ноль orphaned таймеров, ноль warnings в console
- Polling останавливается полностью и немедленно

## Контекст
- P0 баг — единственный оставшийся P0 в PublicMenu
- Файл useTableSession.jsx отдельный от основного UI — изменения изолированы
- Связанные баги: PM-S140-03 (reward setTimeout leak) уже Fixed S148 — аналогичный паттерн
- Не трогать другие файлы — только useTableSession.jsx
