---
page: CartView
ws: WS-CV
budget: 10
agent: cc+codex
chain_template: discussion-cc-codex
session: 287
created: 2026-04-15
scope_summary: "CV-B1-Polish — 8 багов (CV-BUG-06..13). Д3 findings через CC+Codex параллельно. v2 после KB-164 fix (S285)."
---

# Д3: CV-B1-Polish findings (CC + Codex)

## Контекст

Батч CV-B1-Polish — 8 багов в `CartView.jsx` (HEAD ~1223 строки, после CV-B1-Core chain `cartview-260415-092055-289b`).

Первый запуск Д3 (v1, S283) был прерван из-за KB-164 (баг `INLINE_SOURCE` в шаблонах pipeline). KB-164 ✅ пофикшен в S285 — все шаблоны переведены на self-read. Это v2.

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
