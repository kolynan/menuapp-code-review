---
page: CartView
ws: WS-CV
budget: 10
agent: cc+codex
chain_template: discussion-cc-codex
session: 289
created: 2026-04-15
scope_summary: "CV-B1-Polish — 8 багов (CV-BUG-06..13). v4 — первый запуск на v5.8 с #355 fix (task_id atomic counter). v3 abort: ВЧР запущен на старой v5.7."
---

# Д3: CV-B1-Polish findings (CC + Codex)

## Контекст

Батч CV-B1-Polish — 8 багов в `CartView.jsx` (HEAD ~1223 строки).

- **v1** — KB-164 abort. **v2** — #342 abort. **v3** — #342 повтор (ВЧР v5.7). **v4** — первый запуск на v5.8.

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

## Deliverable

Два независимых findings-файла через CC+Codex, затем Cowork синтезирует → КС `ks-cv-b1-polish-v1` (С5v2, ~$12).
