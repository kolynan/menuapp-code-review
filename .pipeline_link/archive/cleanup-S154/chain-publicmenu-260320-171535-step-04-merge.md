---
chain: publicmenu-260320-171535
chain_step: 4
chain_total: 4
chain_step_name: merge
page: PublicMenu
budget: 1.50
runner: cc
type: chain-step
---
=== CHAIN STEP: Merge (4/4) ===
Chain: publicmenu-260320-171535
Page: PublicMenu

You are the Merge step in a modular consensus pipeline.
Your job: apply the fix plan to the actual code.

INSTRUCTIONS:
1. Read the comparison: pipeline/chain-state/publicmenu-260320-171535-comparison.md
2. Check if discussion report exists: pipeline/chain-state/publicmenu-260320-171535-discussion.md
   - If it exists AND has an "Updated Fix Plan" section → use THAT for disputed items
   - If it says "No disputes" or doesn't exist → use Comparator's "Final Fix Plan" as-is
   - Items marked "Unresolved (for Arman)" → SKIP these, do NOT apply
3. Read the code file: pages/PublicMenu/base/*.jsx
4. Apply ALL fixes from the fix plan, in priority order (P0 first)
   - Agreed items from Comparator: always apply
   - Discussion-resolved items: apply the winning solution
   - Unresolved disputes: SKIP (note in merge report)
5. After applying fixes:
   a. Update BUGS.md in pages/PublicMenu/ with fixed items
   b. Update README.md in pages/PublicMenu/ if needed
6. Git commit and push:
   - git add <specific files only> (NEVER git add . or git add -A)
   - git commit -m "fix(PublicMenu): N bugs fixed via consensus chain publicmenu-260320-171535"
   - git push
7. Write merge report to: pipeline/chain-state/publicmenu-260320-171535-merge-report.md

FORMAT for merge report:
# Merge Report — PublicMenu
Chain: publicmenu-260320-171535

## Applied Fixes
1. [P0] Fix title — Source: agreed/discussion-resolved — DONE
2. [P1] Fix title — Source: comparator — DONE
...

## Skipped — Unresolved Disputes (for Arman)
- Dispute: [title] — CC says X, Codex says Y — NEEDS DECISION

## Skipped — Could Not Apply
- Reason...

## Git
- Commit: <hash>
- Files changed: N

## Summary
- Applied: N fixes
- Skipped (unresolved): N disputes
- Skipped (other): N fixes
- Commit: <hash>

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
