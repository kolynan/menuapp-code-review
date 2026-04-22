---
page: CartView
ws: WS-CV
code_file: pages/PublicMenu/CartView.jsx
budget: 6
agent: cc+codex
chain_template: discussion-cc-codex-lean
session: 283
created: 2026-04-15
---

# Д2 Smoke-test: CV-BUG-03 Scroll-to-new-order impl plan

## Контекст

**Это smoke-тест chain `discussion-cc-codex-lean` (Д2, BACKLOG #332).** Цель — проверить, что writers (CC + Codex) запускаются параллельно, chain завершается после обоих writers DONE без synthesizer-шага. Предмет обсуждения выбран нарочито узкий и дешёвый.

**CV-BUG-03 (BACKLOG #325):** после оформления нового заказа корзина CartView остаётся наверху, гость не видит свежий заказ. Нужно проскроллить drawer к новому Order card.

Текущий код: `pages/PublicMenu/CartView.jsx` HEAD 1223 строки. Заказы рендерятся в списке через `activeOrders.map(...)` (секция «Мои» и «Стол»). Drawer — `vaul` Drawer с внутренним scroll.

## Constraints

- Не ломать существующий scroll/focus behavior.
- Mobile 320-420px, vaul drawer.
- Никаких новых deps.

## 2 вопроса

### Q1: Как детектить «новый заказ» для scroll?

Варианты:
- **A)** Ref на последний order.id в `activeOrders` + `useEffect` по длине массива.
- **B)** Явный prop `lastSubmittedOrderId` снаружи (из submit flow).
- **C)** Сравнение `activeOrders[0].created_date` с mount timestamp.

Обсудить: race с polling (CV-80), false trigger при restore после kill Chrome (CV-74), tab context (если гость на табе «Стол» — скроллить там же?).

### Q2: Куда именно скроллить и как?

- `scrollIntoView({ behavior: 'smooth', block: 'start' })` на Order card ref?
- Или scrollTop контейнера drawer?
- Offset под sticky header (CV-19 «Заказано на стол»)?
- Что если новый order уже виден (no-op)?

## Deliverable (каждый writer)

Файл `pipeline/chain-state/<chain-id>-{cc,codex}-position.md`:
- Рекомендация по Q1 (A/B/C + обоснование)
- Рекомендация по Q2 (метод + offset + no-op logic)
- Риски / edge-cases
- 1-2 строки псевдокода если уместно

Cowork потом читает обе позиции и синтезирует с Arman в чате (Д2 flow).
