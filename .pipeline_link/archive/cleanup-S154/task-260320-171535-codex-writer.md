---
task_id: task-260320-171535-codex-writer
status: running
started: 2026-03-20T17:15:36+05:00
type: chain-step
page: PublicMenu
work_dir: C:/Dev/menuapp-code-review
budget_usd: 3.00
fallback_model: sonnet
version: 4.3
launcher: python-popen
---

# Task: task-260320-171535-codex-writer

## Config
- Budget: $3.00
- Mode: task-watcher.py launches Claude Code directly via Popen
- Fallback model: sonnet

## Prompt
---
chain: publicmenu-260320-171535
chain_step: 1
chain_total: 4
chain_step_name: codex-writer
chain_group: writers
chain_group_size: 2
page: PublicMenu
budget: 3.00
runner: codex
type: chain-step
---
Review the file pages/PublicMenu/base/*.jsx for bugs in a React restaurant QR-menu app on Base44 platform.
Also check pages/PublicMenu/README.md and pages/PublicMenu/BUGS.md for context (ONLY these 3 files, nothing else).

SPEED RULES — this is a time-sensitive pipeline step:
- Read ONLY the 3 files above. Do NOT search the repo, do NOT read old findings, do NOT read files outside pages/PublicMenu/.
- Do NOT run rg/grep across the whole repo. Do NOT cross-reference with other pages.
- Limit analysis to the target page code. Be concise.

Find ALL bugs. Focus on: logic errors, missing error handling, i18n issues, UI/UX for mobile-first, React anti-patterns.

For each finding: [P0/P1/P2/P3] Title - Description. FIX: code change needed.

Write findings to: pipeline/chain-state/publicmenu-260320-171535-codex-findings.md

FORMAT:
# Codex Writer Findings — PublicMenu
Chain: publicmenu-260320-171535

## Findings
1. [P0] Title — Description. FIX: ...
2. [P1] Title — Description. FIX: ...

## Summary
Total: N findings (X P0, Y P1, Z P2, W P3)

Do NOT apply fixes — only document findings.

=== TASK CONTEXT ===
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
=== END ===


## Status
Running...
