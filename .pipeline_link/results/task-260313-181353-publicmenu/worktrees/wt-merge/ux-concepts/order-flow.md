---
type: ux-concept
scope: cross-page
pages: [PublicMenu, StaffOrdersMobile, TableSession]
version: "1.0"
created: "2026-03-11"
session: 112
sources:
  - outputs/reports/Analysis_P0-1_ExpiredSession_S68.md
  - pages/StaffOrdersMobile/DeepAnalysis_S70.md
  - pages/StaffOrdersMobile/Audit_FunctionalMap_S70.md
  - pages/PublicMenu/README.md
  - pages/PublicMenu/BUGS.md
  - pages/PublicMenu/versions/round1_260303.md (Cart drawer UX)
  - outputs/Design_WaiterScreen_Backlog_S64.md
  - outputs/discussion-result.md (Waiter Screen V2 Q1-Q6)
status: compiled
---

# Order Flow: Cross-Page UX Concept

## Философия

Этот документ описывает **полный путь заказа** — от момента, когда гость выбирает блюдо,
до завершения обслуживания официантом. Поток проходит через три страницы:

```
PublicMenu (гость) → StaffOrdersMobile (официант/кухня) → TableSession (контракт данных)
    QR → Меню → Корзина → Заказ → Уведомление → Принять → Готовить → Выдать → Закрыть стол
```

**Зачем cross-page документ?** Решения на одной странице влияют на другие:
- Статус заказа, который гость видит в drawer, определяется стадиями из OrderStage (кухня/официант)
- Сессия, которую создаёт гость, закрывается официантом или по TTL
- Формат уведомлений официанту зависит от данных, которые гость вводит при заказе

---

## 1. Order Flow Decisions (из S61 + S64 + S70)

### Q1: Close Table — Кто и как закрывает стол?

**Консенсус (CC+Codex, S61/S70):** Только официант закрывает стол.

- Действие: `handleCloseTable()` → `closeSession()` → status="closed" + `closed_at`
- Подтверждение: React-диалог с именем стола (не browser confirm) — BUG-SM-007 fixed
- Гость НЕ может закрыть стол — нет кнопки "Я ушёл"
- Автозакрытие: `closeExpiredSessionInDB()` через 8ч (SESS-008)
- **Приоритет:** P0 (реализовано)
- **Статус:** DONE — работает в текущем RELEASE

### Q2: Guest Return — Что видит гость при возврате на страницу?

**Консенсус (CC+Codex, S65-S68):**

- Сессия восстанавливается из localStorage (sessionId + guestId, 8ч TTL)
- `useTableSession` restore flow: saved → DB lookup → fallback strategies (session key, table key, legacy key, guest code, device ID)
- Если сессия expired (>8ч): тихо закрывается, новая создаётся при следующем заказе
- **Известная проблема:** Нет сообщения гостю при expiry (GAP-09, P3)
- **Приоритет:** P1 (реализовано, UX edge case остаётся)
- **Статус:** DONE — hasRecentActivity guard добавлен в S68

### Q3: Table Code / QR — Как гость привязывается к столу?

**Консенсус (CC+Codex, S70):**

- QR содержит URL: `/x?partner=<id>&table=<code>&mode=hall`
- Автоматическая привязка: `useHallTable()` hook резолвит стол из URL
- Ручной ввод: 4-значный код (BUG-PM-028 fixed — было 5 ячеек)
- Верификация: зелёная галочка в ModeTabs после подтверждения
- **Приоритет:** P0 (реализовано)
- **Статус:** DONE

### Q4: Waiter Model — Как официант получает и обрабатывает заказы?

**Консенсус (CC+Codex, S61/S64):**

- **Claim model:** Free / Mine / Others — три вкладки фильтрации
- Нет назначения столов. Все заказы видны всем официантам.
- Favorites (My Tables): официант помечает звёздочкой нужные столы
- CTA на карточке: одно действие (самое срочное) + контекст гостя ("Принять (Гость 3)")
- Split-tap: CTA выполняет действие в списке; тело карточки открывает detail view
- **Приоритет:** P0 (реализовано в Sprint A-D)
- **Статус:** DONE — V2 card redesign + detail view + banner notifications

### Q5: Post-Order Dialog — Что видит гость после отправки заказа?

**Консенсус (CC+Codex, S74):**

- Подтверждение: "Заказ отправлен официанту" (не "Заказ принят!" — BUG-PM-018 fixed)
- Подтекст: "Статус обновится, когда официант примет заказ"
- Кнопки: "Назад в меню", "Мои заказы", "Отследить заказ"
- Без auto-dismiss (BUG-PM-013 — ghost click race condition, таймер удалён)
- Pickup/delivery: отдельный confirmation flow с OrderStatusScreen внутри x.jsx (не /orderstatus — BUG-PM-012)
- **Приоритет:** P0 (реализовано)
- **Статус:** DONE

### Q6: Live Status — Как гость отслеживает статус заказа?

**Консенсус (CC+Codex, S74/S70):**

Маппинг статусов OrderStage → пользовательские бейджи:

| OrderStage status | Гость видит | Бейдж | Цвет |
|---|---|---|---|
| `new` | Отправлен | 🟡 | yellow |
| `accepted` / start stage | Принят | 🟢 | green |
| `in_progress` / cook stage | Готовится | 🔵 | blue |
| `ready` / finish stage | Готов | ✅ | emerald |
| `served` | Выдан | ✅ | gray |

- Polling: каждые 10 сек через `useTableSession`
- **Зал:** статусы видны в CartView drawer (Mode 2 — "Мои заказы")
- **Самовывоз/доставка:** GAP-02 — OrderStatusScreen встроен в x.jsx (view state)
- **Приоритет:** P0 (реализовано для зала), P1 (pickup/delivery — базовый tracking)
- **Статус:** DONE (base), нет push-уведомлений (P3 future)

### Q7: Table Naming — Как отображается название стола?

**Консенсус (CC+Codex, S61/S89):**

- БД хранит "Стол 22" (с префиксом) — НЕ добавлять "Стол " в коде
- `withTablePrefix()` helper: проверяет `name.startsWith("Стол ")` перед добавлением
- Исправлено в 5 местах StaffOrdersMobile (BUG-SO-S61-07)
- Исправлено в orderGroups + banner (BUG-S65-05)
- **Приоритет:** P2 (реализовано)
- **Статус:** DONE

---

## 2. Session Contract (SESS rules)

Правила сессий извлечены из Analysis_P0-1_ExpiredSession_S68, DeepAnalysis_S70, и BUGS.md.

### Locked Rules (иммутабельные)

| Rule | Описание | Источник |
|---|---|---|
| **SESS-008** | Hard-expire: 8ч с последнего заказа (`isSessionExpired()`) | S68 analysis |
| **SESS-016** | Scheduled cleanup: `sessionCleanupJob.js` — каждые 5 мин в StaffOrdersMobile | BUG-SM-012 |
| **SESS-021** | Legacy migration: закрыть все сессии старше 24ч перед деплоем P0-1 | S68 recommendation |
| **SESS-022** | Session status contract: `getOrCreateSession` → "active", `useTableSession` → "open" | S70 mismatch analysis |

### Session Lifecycle

```
[Гость сканирует QR]
    ↓
getOrCreateSession() → status: "active" (sessionHelpers.js)
    ↓
[Гость заказывает, сессия живёт]
    ↓ 8ч без активности
isSessionExpired() → true
    ↓
closeExpiredSessionInDB() → status: "expired", new orders → "cancelled"
    ↓ ИЛИ: официант нажимает "Закрыть стол"
closeSession() → status: "closed", closed_at: now
```

### Известная проблема: Status Mismatch ("active" vs "open")

- `sessionHelpers.js:getOrCreateSession()` создаёт с `status: "active"` и ищет по `"active"`
- `useTableSession.jsx:310-313` ищет по `status: "open"`
- **Практический эффект:** После F5 гость временно теряет видимость заказов (P1 UX issue)
- **Данные целы:** следующий заказ корректно привязывается к той же сессии
- **Рекомендованный фикс:** Изменить `getOrCreateSession()` на `status: "open"` + миграция
- **Статус:** Не исправлено (P1, documented in DeepAnalysis_S70)

### Session Guards

| Guard | Что делает | Добавлен |
|---|---|---|
| `hasRecentActivity()` | Проверяет `last_activity_at` перед закрытием сессии | S68, BUG-PM-011 |
| `submitLockRef` | Защита от двойного сабмита | S74 |
| `isSubmitting` guard | Блокирует закрытие drawer во время отправки | S84-S85 |
| `closeExpiredSessionInDB()` | Закрывает expired + отменяет new orders | S65-S66, BUG-PM-009 |

---

## 3. Cart Drawer Architecture (S74 + S79 + S82)

### Two-Mode Drawer

Drawer имеет два режима, переключаемых через `drawerMode`:

| Mode | Содержимое | Snap Points |
|---|---|---|
| `'cart'` | CartView — корзина + мои заказы + счёт | mid 60% / full 90% |
| `'checkout'` | PickupDeliveryCheckoutContent — форма оформления | full 90% |

### Snap Points и поведение

- **SNAP_MID (60%):** По умолчанию при открытии
- **SNAP_FULL (90%):** Авто-expand когда `cart.length > 0` (BUG-PM-027)
- **Close:** Свайп вниз >80px на drag handle (BUG-PM-033, custom touch handler)
- **isSubmitting guard:** Drawer нельзя закрыть во время отправки заказа (BUG-PM-034)

### CartView Sections (Mode 1: Cart / Mode 2: Orders)

**Mode 1 — Корзина (cart items > 0):**
```
┌─── Drag Handle ───────────────────┐
│ Sticky Header: Стол / Гость / ✕   │
│                                    │
│ [Online Order Benefits Block]      │
│ [Table Code Input — if unverified] │
│ Cart Items (quantity controls)     │
│ Split Type Selector               │
│ Comment Field                      │
│                                    │
│ ──── sticky bottom ────            │
│ [CTA: Отправить официанту]         │
└────────────────────────────────────┘
```

**Mode 2 — Мои заказы (cart empty, orders exist):**
```
┌─── Drag Handle ───────────────────┐
│ Sticky Header: Стол / Гость / ✕   │
│                                    │
│ ▼ Мои заказы (expanded)           │
│   Order #1: 🟡 Отправлен          │
│     - Стейк x1                    │
│     - Кола x2                     │
│   Order #2: 🟢 Принят             │
│ ▶ Заказы стола (collapsed)        │
│   Preview: 3 гостя • 7 поз •18500₸│
│ ─── Итого по столу ───            │
│ [Rating Banner — if ready orders]  │
└────────────────────────────────────┘
```

### Drawer UX Decisions (S74 round1 Codex)

- **No tabs inside drawer** — collapsible sections вместо табов (Option C consensus)
- Default: "Мой заказ" expanded, "Заказы стола" collapsed
- Table total always visible
- Tab naming (если переход на full page): "Мой заказ" / "Стол" (best for 320px)

---

## 4. Post-Order Flow

### Confirmation Screen

```
┌────────────────────────────────────┐
│                                    │
│    ✅ Заказ отправлен официанту    │
│    (hall) / Заказ отправлен        │
│    (pickup/delivery)               │
│                                    │
│    Статус обновится, когда         │
│    официант примет заказ           │
│                                    │
│    [Назад в меню]                  │
│    [Мои заказы]                    │
│    [Отследить заказ]               │
│                                    │
└────────────────────────────────────┘
```

- Без auto-dismiss таймера (BUG-PM-013)
- `tr()` helper для safe i18n fallbacks (BUG-PM-S87-02)
- "Отследить заказ" → setView("orderstatus") для pickup/delivery

### Rating Timing

- Баннер "За отзыв +10 баллов" → только когда есть ready/served заказы (BUG-PM-021)
- Inline подтверждение "Спасибо! +NБ" рядом с звёздами (при активной лояльности)
- Отзывы через `DishReviewsModal` / `ReviewDialog` по клику на рейтинг блюда

---

## 5. Live Status Mapping

### Guest Side (PublicMenu CartView)

```javascript
const STATUS_MAP = {
  new:         { icon: '🟡', label: 'Отправлен',  color: 'yellow'  },
  accepted:    { icon: '🟢', label: 'Принят',     color: 'green'   },
  cooking:     { icon: '🔵', label: 'Готовится',   color: 'blue'    },
  in_progress: { icon: '🔵', label: 'Готовится',   color: 'blue'    },
  ready:       { icon: '✅', label: 'Готов',       color: 'emerald' },
  served:      { icon: '✅', label: 'Выдан',       color: 'gray'    },
};
```

### Waiter Side (StaffOrdersMobile)

Использует OrderStage entity с динамическими стадиями. Fallback через STATUS_FLOW:

```javascript
const STATUS_FLOW = [
  { status: 'new',         label: 'Новый'     },
  { status: 'accepted',    label: 'Принят'    },
  { status: 'in_progress', label: 'Готовится'  },
  { status: 'ready',       label: 'Готов'      },
  { status: 'served',      label: 'Выдан'     },
];
```

### Stage Name Resolution (BUG-SO-S89-01)

OrderStage entity хранит i18n ключи (e.g., `orderprocess.default.new`) в поле `name`.
`getStageName()` helper резолвит в читаемое имя:
1. Попробовать `t()` для B44 i18n
2. Short name mapping ("new" → "Новый")
3. Извлечь последний сегмент из dotted key
4. Fallback protection для STATUS_FLOW пути

### Polling Architecture

| Сторона | Интервал | Механизм |
|---|---|---|
| Guest (useTableSession) | 10 сек | useQuery refetchInterval |
| Waiter (StaffOrdersMobile) | 5-60 сек (configurable) | useQuery refetchInterval |
| Cleanup job (sessionCleanupJob) | 300 сек | setInterval in StaffOrdersMobile |

Optimistic updates: `_optimisticAt` флаг на заказе, сохраняется до 30 сек (OPTIMISTIC_TTL_MS)
или пока сервер не подтвердит (BUG-PM-004 fix).

---

## 6. Приоритеты реализации

### P0 — DONE (блокирующие, уже реализованы)

| # | Фича | Страница | RELEASE |
|---|---|---|---|
| 1 | Session expire + cleanup | useTableSession | 260302-06 |
| 2 | Order confirmation screen | x.jsx | 260304-00 |
| 3 | Live status badges (hall) | CartView | 260304-00 |
| 4 | Pickup/delivery checkout в drawer | x.jsx | 260305-05 |
| 5 | Drawer CTA always visible | x.jsx | 260306-00 |
| 6 | Close table confirmation dialog | StaffOrdersMobile | 260304-00 |
| 7 | Session cleanup job | sessionCleanupJob | 260303-02 |

### P1 — TODO (серьёзные, запланированы)

| # | Фича | Страница | GAP |
|---|---|---|---|
| 1 | Session status mismatch fix ("active"→"open") | sessionHelpers | S70 finding |
| 2 | CartView null guards (BUG-PM-023/024/025) | CartView | pre-existing |
| 3 | Atomic order creation (network failure) | x.jsx | GAP-11 |

### P2 — Later (улучшения)

| # | Фича | Страница | GAP |
|---|---|---|---|
| 1 | Waiter order creation | StaffOrdersMobile | GAP-03 |
| 2 | "Mark as paid" button | StaffOrdersMobile | GAP-04 |
| 3 | Order cancel/modify | PublicMenu + Staff | GAP-05 |
| 4 | "Stop accepting orders" toggle | PartnerSettings | GAP-07 |
| 5 | Dish availability toggle (86'd) | StaffOrdersMobile | GAP-08 |

### P3 — Future (nice-to-have)

| # | Фича | Страница | GAP |
|---|---|---|---|
| 1 | Session expiry message for guest | PublicMenu | GAP-09 |
| 2 | i18n for waiter interface | StaffOrdersMobile | GAP-06 / BUG-SM-001 |
| 3 | Push notifications (guest) | PublicMenu | - |
| 4 | Guest order cancellation (new status only) | PublicMenu | GAP-05 subset |

---

## 7. Cross-Page Data Contract

### Entities и их роли в Order Flow

```
Partner (ресторан)
  ├── Table (стол с QR кодом)
  │     └── TableSession (сессия посещения)
  │           ├── SessionGuest (гость с устройством)
  │           │     └── Order (заказ гостя)
  │           │           └── OrderItem (позиция заказа)
  │           └── ServiceRequest (вызов официанта)
  ├── OrderStage (стадии обработки заказа)
  └── StaffAccessLink (доступ официанта)
```

### Order Number Format

| Режим | Формат | Пример |
|---|---|---|
| Hall | ZAL-NNN | ZAL-001 |
| Pickup | SV-NNN | SV-002 |
| Delivery | DOS-NNN | DOS-003 |

Генерируется в `getNextOrderNumber()`. Counter хранится в `Partner.order_counter`.

---

## 8. Известные ограничения (из DeepAnalysis_S70)

1. **Нет отмены заказа** — ни гость, ни официант не могут отменить отправленный заказ
2. **Нет перемещения между столами** — гость теряет видимость заказов при смене стола
3. **Нет ввода телефона в hall drawer** — телефон только в CheckoutView (pickup/delivery)
4. **Нет создания заказа официантом** — для пожилых гостей без смартфона
5. **Partial order при сбое сети** — Order без OrderItems возможен (GAP-11)
6. **Нет push-уведомлений** — гость должен сам проверять drawer
7. **Race condition при двух официантах** — last-write-wins при одновременном "Принять"

---

*Compiled by Claude Code (CC), Session S112, 2026-03-11*
*Sources: S61 (waiter design), S64 (backlog), S65-S68 (session logic), S70 (deep analysis), S74 (cart redesign), S79-S87 (drawer fixes)*
