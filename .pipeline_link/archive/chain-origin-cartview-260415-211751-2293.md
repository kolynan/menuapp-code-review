---
page: CartView
ws: WS-CV
budget: 10
agent: cc+codex
chain_template: discussion-cc-codex
session: 289
created: 2026-04-15
scope_summary: "CV-B1-Polish — 8 багов (CV-BUG-06..13). Д3 findings через CC+Codex параллельно. v3 после #355 fix (S289 — task_id collision в parallel writers). v2 abort: Codex writer never dispatched."
---

# Д3: CV-B1-Polish findings (CC + Codex)

## Контекст

Батч CV-B1-Polish — 8 багов в `CartView.jsx` (HEAD ~1223 строки, после CV-B1-Core chain `cartview-260415-092055-289b`).

История:
- **v1 (S283)** — прерван из-за KB-164 (`INLINE_SOURCE` в шаблонах). KB-164 ✅ пофикшен в S285.
- **v2 (S287→S288)** — CC writer ✅ ($1.31, 8m), Codex writer ✗ (#342 parallel writers bug — task_id collision → create_worktree silent fail). Chain aborted_s288.
- **v3 (S289)** — #355 ✅ пофикшен (task-watcher-multi.py v5.8, atomic counter suffix в `task_id`).

## Writer промпты (ПССК)

- **CC findings:** `pipeline/pssk-cv-b1-polish-cc-v1.md`
- **Codex findings:** `pipeline/pssk-cv-b1-polish-codex-v1.md`

## Bugs в скоупе (8 штук)

| Баг | Приоритет | Краткое описание |
|-----|-----------|-----------------|
| CV-BUG-07 | P0 | Floating point в суммах («3 169.87000000003 ₸») |
| CV-BUG-08 | P0 | CTA «Заказать ещё» вместо «Вернуться в меню» (CV-70 регрессия) |
| CV-BUG-09 | P1 | Badge «Готово» в табе Стол (CV-52: только «В работе» / «Выдано») |
| CV-BUG-10 | P1 | Блок «Итого по столу» не в спеке (CV-50/CV-19) |
| CV-BUG-11 | P2 | Кнопка «Оценить блюда гостей» — нарушение CV-20 (privacy) |
| CV-BUG-12 | P1 | Label «Гость 5331» вместо «Гость N» (CV-13) |
| CV-BUG-13 | P1 | Плюрализация «17 блюда» → «17 блюд» |
| CV-BUG-06 | L | `o.status === 'cancelled'` — тот же root cause что CV-BUG-05 |

## Reference files

- `ux-concepts/CartView/260408-00 CartView UX S246.md` — UX v7.0 FROZEN
- `menuapp-code-review/pages/CartView/BUGS.md` v1.2
- `menuapp-code-review/pages/PublicMenu/CartView.jsx` — HEAD (~1223 строки)
- `menuapp-code-review/components/sessionHelpers.js` — `getGuestDisplayName`

## Out of scope

- CV-BUG-01 session restore (CV-B3)
- CV-BUG-02 table code input
- Полная структура таба «Стол» (CV-B1b #327)

## Deliverable

Два независимых findings-файла:
- CC: `pipeline/cc-analysis-pssk-cv-b1-polish-cc-v1.txt`
- Codex: возвращает в Cowork (output channel)

Затем Cowork синтезирует findings → КС `ks-cv-b1-polish-v1` (С5v2, ~$12).

## Acceptance для верификации #355 фикса

Оба writer'а должны:
1. Получить **разные** `task_id` (формат `task-YYMMDD-HHMMSS-NNN` где NNN — счётчик).
2. Стартовать параллельно (±10 сек) — оба TG-сообщения running в одной chain widget.
3. Создать `pipeline/task-XXX.log` (ранее Codex не создавал).
4. Завершиться с findings: `chain-state/cartview-*-cc-findings.md` + `chain-state/cartview-*-codex-findings.md`.
