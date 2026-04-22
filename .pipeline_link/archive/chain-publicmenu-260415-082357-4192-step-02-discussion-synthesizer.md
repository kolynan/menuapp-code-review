---
chain: publicmenu-260415-082357-4192
chain_step: 2
chain_total: 2
chain_step_name: discussion-synthesizer
page: PublicMenu
budget: 5.00
runner: cc
type: chain-step
---
=== CHAIN STEP: Discussion Synthesizer (2/2) ===
Chain: publicmenu-260415-082357-4192
Page: PublicMenu

You are the Discussion Synthesizer in a modular discussion pipeline.
Your job: read BOTH CC and Codex positions, compare them, and produce a unified decision report.

INSTRUCTIONS:

1. Read CC position: pipeline/chain-state/publicmenu-260415-082357-4192-cc-position.md
2. Read Codex position: pipeline/chain-state/publicmenu-260415-082357-4192-codex-position.md
3. If reference files are mentioned in the original task — read them for additional context.

4. For EACH question, compare CC and Codex positions:

   IF they AGREE:
   - Confirm the shared recommendation
   - Note confidence level

   IF they DISAGREE:
   - Analyze both arguments on technical/UX merits
   - Be FAIR — do not automatically prefer CC or Codex
   - Pick the stronger recommendation OR propose a compromise
   - If neither is clearly better → mark as "Arman decides" with both options

5. Write final discussion report to: pipeline/chain-state/publicmenu-260415-082357-4192-discussion.md

FORMAT:
# Discussion Report — PublicMenu
Chain: publicmenu-260415-082357-4192
Mode: CC+Codex (synthesized)
Topic: [title from task]

## Questions Discussed
[List all N questions from the task]

## Analysis

### Q1: [question title]
**CC Position:** [summary of CC recommendation + key reasoning]
**Codex Position:** [summary of Codex recommendation + key reasoning]
**Status:** agreed / disagreement
**Resolution:** [agreed recommendation OR synthesizer's verdict with reasoning]

### Q2: [question title]
...

## Decision Summary
| # | Question | CC | Codex | Resolution | Confidence |
|---|----------|----|-------|------------|------------|
| 1 | Title    | option A | option A | agreed: option A | high |
| 2 | Title    | option B | option C | synthesizer: option B (reason) | medium |
| 3 | Title    | option D | option E | Arman decides | — |

## Recommendations
For each question: the final recommendation (or both options if unresolved).
Format as actionable decisions ready for DECISIONS_INDEX.

## Unresolved (for Arman)
Questions where CC and Codex positions are both valid and synthesizer cannot determine a clear winner.
Each item shows both positions and the key trade-off.

## Quality Notes
- CC Prompt Clarity score: [from CC position file]
- Codex Prompt Clarity score: [from Codex position file]
- Issues noted: [any concerns about question quality]

6. Do NOT write or modify any code files.

=== TASK CONTEXT ===
# ПССК CV-B1-Core v1 — Таб «Стол» + статус из stage_id + refinement скролла

Цель: ревью промпта (CC + Codex параллельно, Д3). Оценить каждый Fix 1–5, дать сквозной анализ рисков/охвата, указать недостающие hooks/props, предложить правки перед выдачей в КС.

Reference:
- UX spec: `ux-concepts/CartView/260408-00 CartView UX S246.md` (v7.0 FROZEN)
- Progress map: `ux-concepts/CartView/CartView_Progress_S273.md`
- Code: `menuapp-code-review/pages/PublicMenu/CartView.jsx`, `useTableSession.jsx`
- BUGS: `menuapp-code-review/pages/PublicMenu/BUGS.md`

Контекст (S274 manual test): после RELEASE `260414-03` (CV-A + CV-BUG-04) Arman видит:
- В группе «В работе» есть заказы, но когда официант выдал — заказ **не переходит в «Выдано»** (при этом в блоке «Заказы стола» тот же заказ виден с иконкой «Выдано»).
- «Заказы стола» всё ещё **секция**, а не таб (противоречит CV-14/CV-56, утверждённым 2026-03-28).

---

## Fix 1 — CV-BUG-05 (P0) [MUST-FIX]: «Выдано» не обновляется в «Мои»

### Сейчас
`statusBuckets` (CartView.jsx, строки 427–435) группирует `todayMyOrders` по `o.status` (string). Когда официант проводит выдачу, обновляется `order.stage_id` через OrderStage workflow, но поле `order.status` может не меняться (или меняется рассинхронно). Результат: заказ с реально выполненной стадией остаётся в «В работе».

### Должно быть
Группировка по **stage-based статусу**, как и в блоке «Заказы стола» (строка 825: `getSafeStatus(getOrderStatus(order))`). Т.е. для каждого `order` определяем stage через `getOrderStatus(order)` → сравниваем с терминальными стадиями.
Ref: CV-45 (Badge = order-level через stage, Утв. 2026-03-28), UX spec §«Статусы» CV-52.

Правило отнесения:
- **served**: `getOrderStatus(order)` соответствует stage с `internal_code ∈ {'finish', 'served', 'completed'}` (подтвердить в CC review, какой код у «выдан»).
- **cancelled**: stage.internal_code === 'cancelled' → не попадает ни в одну группу.
- **in_progress**: всё остальное (включая new/sent/cooking/ready/picked).

### НЕ должно быть
- НЕ читать `o.status` как источник истины для группировки.
- НЕ ломать `statusBuckets.served` downstream (используется в auto-collapse line 444–455, review-гейтах 541–581, V8 empty state 894).
- НЕ менять блок «Заказы стола» (уже корректный).

### Файл и локация
`menuapp-code-review/pages/PublicMenu/CartView.jsx` строки 427–435 (блок `statusBuckets`). Возможно понадобится проп `stagesMap` или готовая функция-хелпер. В `useTableSession.jsx` уже есть `getOrderStatus` — проверить, возвращает ли она объект со `internal_code` или только `name` (если только name — добавить внутренний helper).

### Проверка
1. Открыть PublicMenu от имени гостя, сделать заказ.
2. В staff app пометить выдачу (stage → finish).
3. Вернуться в CartView → заказ должен появиться в «Выдано» синхронно с тем, что виден в «Заказы стола».

---

## Fix 2 — CV-14 + CV-56 (P1) [MUST-FIX]: 2 таба «Мои» / «Стол»

### Сейчас
Блок «Заказы стола» рендерится как отдельная Card после «Мои заказы» (строки 776–871). Нет таб-переключателя.

### Должно быть
Над областью заказов — сегментированный контрол с табами `[Мои]` и `[Стол]`. По умолчанию активен `Мои`. Выбор `Стол` скрывает «мои» блоки (В работе / Выдано / корзина ордеров) и показывает ТОЛЬКО контент текущего блока «Заказы стола» (содержимое, которое сейчас под заголовком «Заказы стола (N)»).
Ref: CV-14 (Утв. 2026-03-28), CV-56 — лейбл именно «Стол», не «Все».

State: `const [activeTab, setActiveTab] = useState('my')`.

### НЕ должно быть
- НЕ менять содержимое блока «Заказы стола» (группировка по гостям сохраняется как есть).
- НЕ дублировать «Счёт стола» — он должен остаться видимым в обоих табах (финансовый итог не зависит от таба).
- НЕ переносить корзину в таб «Стол».

### Файл и локация
`CartView.jsx`: добавить компонент табов в верхней части основного контейнера (после заголовка, до SECTION «В работе»). Conditional rendering по `activeTab`.

### Проверка
Таб «Мои» — видны: В работе, Выдано, корзина, Счёт стола. Таб «Стол» — виден только список заказов других гостей + Счёт стола.

---

## Fix 3 — CV-15 (P2) [MUST-FIX]: Таб «Стол» скрыт при 1 госте

### Сейчас
Блок «Заказы стола» уже условно рендерится через `showTableOrdersSection` / `sessionGuests.length > 1`. Но новый таб-контрол должен подхватить эту же логику.

### Должно быть
Когда `sessionGuests.length <= 1` (или `showTableOrdersSection === false`) — таб-контрол НЕ рендерится, всё выглядит как сейчас (без табов). При добавлении второго гостя таб появляется автоматически.
Ref: CV-15 (Утв. 2026-03-28).

### НЕ должно быть
- НЕ показывать таб «Стол» пустым.
- НЕ менять логику `showTableOrdersSection`.

### Файл и локация
`CartView.jsx`: обернуть весь таб-блок в `{(sessionGuests.length > 1 || showTableOrdersSection) && ...}`.

### Проверка
Стол с 1 гостем → табов нет, UI как до фикса. Приходит 2-й гость → таб появляется, активен «Мои» по умолчанию.

---

## Fix 4 — CV-BUG-03 refinement (P2) [MUST-FIX]: скролл к «В корзине (N)»

### Сейчас
После CV-BUG-03 S273 дровер автоматически открывается, но открытая позиция скролла — не на заголовке «В корзине (N)», а ниже/выше (Arman: «надо чтобы 'В корзине (3)' был наверху»).

### Должно быть
При авто-открытии дровера с непустой корзиной — программный `scrollIntoView({ block: 'start' })` на элемент заголовка «В корзине (N)» (или на сам контейнер корзины) после монтирования/открытия.

### НЕ должно быть
- НЕ менять логику авто-открытия из S273.
- НЕ ломать ручное поведение скролла (когда пользователь сам открыл дровер — не принудительно скроллить).

### Файл и локация
`CartView.jsx`: найти заголовок «В корзине» (Cart section heading) → `useRef` + `useEffect` по условию «только что авто-открыто и cart.length > 0».

### Проверка
Добавить блюдо → свернуть дровер → дождаться авто-открытия → заголовок «В корзине (N)» виден в верхней части viewport без ручного скролла.

---

## Fix 5 (NICE-TO-HAVE) — Debug-утилита для stage mapping

### Сейчас
При отладке CV-BUG-05 трудно понять, какой `internal_code` у стадии «выдан» у партнёра. OrderStage — конфигурируемая.

### Должно быть
Добавить `console.debug` в dev-режиме (если `import.meta.env.DEV`) с дампом: `{ orderId, stage_id, stageName, stageInternalCode, groupAssigned }` в `statusBuckets`.
Можно скипнуть если CC/Codex считают избыточным.

### НЕ должно быть
- НЕ оставлять логи в prod-бандле.
- НЕ логировать PII.

---

## ⛔ SCOPE LOCK — менять ТОЛЬКО то, что указано выше

- Только `menuapp-code-review/pages/PublicMenu/CartView.jsx` (+ при необходимости читать `useTableSession.jsx` для понимания `getOrderStatus`, но НЕ править её).
- FROZEN UX (v7.0) — не добавлять новые поля/секции/копирайты.
- НЕ трогать другие страницы (StaffOrdersMobile, PartnerTables, PublicMenu top-level).
- НЕ менять B44 schema.
- Если обнаружен баг вне этих 5 Fix — задокументировать в findings, НЕ править.

## Implementation Notes

- Все 5 Fix касаются одного файла CartView.jsx — один commit.
- После применения: RELEASE-файл + integrity check (wc-l vs git HEAD, tail).
- Downstream dependencies `statusBuckets.served` проверить тщательно (строки 444–581, 886–896, 961, 973).

## Вопросы для дискуссии (CC + Codex)

1. **Fix 1 корректность:** какие именно `internal_code` считать терминальными? Подтвердить по коду `OrderStage` / `useTableSession` / `StaffOrdersMobile`. Если есть канонический helper — использовать его, не дублировать.
2. **Fix 1 охват:** не используется ли `o.status` ещё где-то в CartView как «правда о статусе»? Если да — упомянуть, но НЕ править в этом батче (отдельный Fix).
3. **Fix 2 UX:** оставить «Счёт стола» в обоих табах или только в «Стол»? (Рекомендация: в обоих.)
4. **Fix 2 компонент:** использовать `shadcn/ui Tabs` или inline-кнопки? (В кодовой базе уже есть паттерны — проверить.)
5. **Fix 4 триггер:** как отличить «авто-открытие» от «юзер сам открыл»? Нужен ref/флаг? (Есть ли в коде S273 fix такой маркер?)
6. **Риски:** совместимость с auto-collapse served (444–455), V8 empty state (894), review-гейтами (541–581).
7. **Оценка промпта:** Prompt Clarity (1–5), достаточность «Сейчас/Должно быть/НЕ должно быть», риск scope creep.

После дискуссии — финальная версия попадёт в КС (chain_template: `consensus-with-discussion-v2`, С5v2, budget $12–15).
=== END ===
