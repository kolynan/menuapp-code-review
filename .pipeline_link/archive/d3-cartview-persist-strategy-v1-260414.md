---
page: CartView
ws: WS-CV
budget: 10
agent: cc+codex
chain_template: discussion-cc-codex
session: 271
created: 2026-04-14
---

# Д3 Discussion: CartView persist-стратегия (CV-BUG-01)

## Контекст

CV-BUG-01 — session loss после kill Chrome: в localStorage сохраняется только `tableId`, поэтому после перезапуска корзина показывает «Ваши заказы 0₸», пока не завершится восстановление с сервера (или вообще не восстанавливается при network fail).

UX v7.0 FROZEN (S271) зафиксировал 4 состояния восстановления (CV-74: S-loading / S-restored / S-failed-network / S-lost) + banner при kill-during-submit (CV-75). Но **техническое решение** — что именно хранить в localStorage и как восстанавливать — оставлено для CC+Codex обсуждения перед импл батча CV-B3.

Цель дискуссии: выбрать persist-стратегию (что хранить, как восстанавливать, как инвалидировать), которая корректно реализует 4-state CV-74 модель на existing B44 schema (без расширения).

## Reference Files (read for context)

- `ux-concepts/CartView/260408-00 CartView UX S246.md` — UX v7.0 FROZEN (CV-74, CV-75, CV-77, CV-80)
- `ux-concepts/CartView/GPT_UX_v7_S271.md` — GPT vertdict + UX-spec по 4-state restore
- `menuapp-code-review/pages/CartView/BUGS.md` — CV-BUG-01 описание
- `menuapp-code-review/pages/CartView.jsx` — текущая реализация persist (grep `localStorage`)
- `KNOWLEDGE_BASE_VSC.md` — B44 SDK constraints (TableSession.get, Order.filter, SessionGuest.filter)
- `DECISIONS_INDEX.md` §2 — CV-70..CV-80 LOCKED decisions

## Constraints (не обсуждать, уже зафиксировано)

- Схема B44 не расширяется (только existing entity: Order, SessionGuest, TableSession, ServiceRequest).
- Per-guest = Order-per-guest (не OrderItem.payment_status).
- 4-state restore UX (CV-74) уже утверждён — дискуссия про impl, не про UX.
- Polling (нет WebSocket).
- Mobile browser, vaul drawer, 320–420px.

## 5 вопросов для обсуждения

### Q1: Что хранить в localStorage?

Варианты:
- **A) Minimal:** только `{ tableId, sessionGuestId, lastSeenTs }` — всё остальное fetch с сервера при restore.
- **B) Lightweight snapshot:** A + массив `orderIds` пользователя + `tableSessionId`, чтобы минимизировать round-trips.
- **C) Full snapshot:** весь `tableSession` + `orders[]` + `guests[]` с content — мгновенный optimistic render, потом reconcile с сервером.

Обсудить: размер localStorage budget на мобиле, risk of stale data, UX-импакт optimistic vs skeleton, сложность reconcile-логики.

### Q2: Restore flow sequence (CV-74 S-loading → S-restored)

Как восстанавливаем после mount при наличии persist?
- Параллельные запросы (`TableSession.get` + `Order.filter` + `SessionGuest.filter`) или последовательно?
- Таймауты per-request vs global?
- Что именно триггерит переход S-loading → S-failed-network (timeout) vs S-lost (404/410 на session)?
- Нужен ли debounce/retry перед S-failed-network?

### Q3: Invalidation — когда persist становится stale?

Обсудить триггеры очистки localStorage:
- Server вернул 404/410 на tableSession (stale → S-lost).
- `lastSeenTs` старше N часов (какое N? 2? 12? 24?).
- Schema version mismatch (если меняем структуру persist — как мигрировать).
- Явный logout / «покинуть стол».
- Edge case: shared phone — два гостя на одном устройстве последовательно (как различаем сессии?).

### Q4: Kill-during-submit (CV-75) — как детектим?

По UX: если kill произошёл во время submit заказа — показать banner «Возможно, последний заказ не отправлен». Как техически определить?
- Флаг `pendingSubmit: true` в localStorage перед fetch, clear после success?
- Сравнение server-side orders с persist snapshot?
- Что делаем при false positive (заказ прошёл, но banner показали)?

### Q5: Interaction с polling (CV-80) и event priority (CV-77)

- Когда стартует polling — после S-restored или сразу?
- Если polling fail после S-restored — переходим обратно в S-failed-network или остаёмся с stale data + toast?
- CV-77 event priority (banner vs push vs toast) — как persist-события встраиваются в ранжирование?

## Deliverable

Итоговый файл `ux-concepts/CartView/CV-BUG-01_Persist_Strategy_S271.md` со структурой:
- Выбранный вариант (A/B/C из Q1) + обоснование
- Sequence diagram restore flow (Q2)
- Invalidation rules table (Q3)
- Kill-during-submit detection logic (Q4)
- Polling/event priority integration (Q5)
- Acceptance criteria для CV-B3 импл
- Open items (если есть)
