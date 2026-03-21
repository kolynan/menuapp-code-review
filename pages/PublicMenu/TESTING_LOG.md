---
version: "1.0"
created: "2026-03-21"
session: 153
page: PublicMenu (/x)
---

# Testing Log — PublicMenu

Хронологический лог всех тестов страницы. Обновлять после каждого деплоя.
Баги → `BUGS_MASTER.md` (мастер) + `BUGS.md` (страница).

---

## Формат записи

```
### YYYY-MM-DD | [Батч/задача] | S[N]
- **Деплой:** [файлы] (commit [hash])
- **Тест:** quick-test / deep-test / ручной / не тестировали
- **Результат:** ✅ pass / ⚠️ partial / ❌ fail
- **Баги найдены:** [ID] / нет
- **Заметки:** ...
```

---

## 2026-03-21 | Batch 4 (PM-062 + PM-064 Table Confirmation) | S155A

- **КС:** consensus-with-versioning (С6), chain publicmenu-260321-140331
- **Коммит:** b744f9a — 6 фиксов
- **Стоимость:** $4.69 (CC $4.69, Codex 0k tok — parser issue #65)
- **RELEASE:** 260321-02 x.jsx, 260321-02 CartView.jsx
- **Что пофикшено:**
  1. [P0] Gate hall submit on `isTableVerified` — предотвращает orphan orders
  2. [P1] Убран inline table verification из CartView (201 строк удалено)
  3. [P1] Добавлена CTA кнопка «Подтвердить и отправить» в Bottom Sheet
  4. [P1] Dynamic tableCodeLength из partner config в Bottom Sheet
  5. [P1] Toast при закрытии Bottom Sheet без верификации
  6. [P2] Исправлен misleading error fallback "заказ сохранён"
- **SKIPPED (2):**
  - Finding #5: import paths (архитектура B44, не баг)
  - Finding #4: partner lookup errors → PM-070 (записан в BUGS)
- **Новые баги найдены:** PM-068 (P3, aria), PM-069 (P2, cooldown display), PM-070 (P1, partner lookup)
- **Деплой:** ✅ задеплоен (S154 подтверждено)
- **Тест:** ✅ выполнен S155A, браузер (Chrome MCP), TEST_PLAN_batch4.md
- **Результат:** ⚠️ partial — 3 ✅, 2 ❌, 2 ⏭
- **Итоговая таблица:**

| TC | Описание | Результат | Заметки |
|----|----------|-----------|---------|
| TC-1 | Chips терракота (PM-062) | ❌ | `rgb(79,70,229)` = indigo-600. Ожидался, нужен B44 prompt |
| TC-2 | Chips после смены вкладки | ✅ | Выбор сохраняется. Цвет всё ещё indigo — это TC-1 баг |
| TC-3 | Submit кнопка всегда активна | ✅ | Терракотовая, не disabled. Inline-инпут удалён ✅ |
| TC-4 | Bottom Sheet после submit | ❌ | BS не появляется. P0-гейт работает (заказ не уходит), но BS-триггер отсутствует → PM-071 |
| TC-5 | Ввод кода и отправка | ⏭ | SKIP — TC-4 провалился |
| TC-6 | Повторный заказ без BS | ⏭ | SKIP — TC-4 провалился |
| TC-7 | Регрессия (stepper + console) | ✅ | «− 1 +» ✅, PM-041 polling ✅, console чистая |

- **Новые баги найдены в тесте:** PM-071 (P1, BS-триггер отсутствует)
- **Дополнительно:** PM-064 фактически не закрыт полностью — BS компонент не рендерится при нажатии «Отправить официанту» с неверифицированным столом

---

## 2026-03-21 | Batch A+5 (Chips + Stepper + Table Confirmation) | S153

- **Деплой:** x.jsx, CartView.jsx (RELEASE 260321-01)
- **Тест:** quick-test (Chrome MCP, S153), TEST_PLAN_batch-a5.md
- **Результат:** ⚠️ partial — 3 pass, 3 fail, 2 skip
- **Проверено:**
  - ❌ TC-1: чип «Все» — ещё indigo (PM-062, partial — КС предупреждал)
  - ❌ TC-2: активный чип «Основные блюда» — ещё indigo (PM-062)
  - ✅ TC-3: drawer stepper «− 1 +» — PM-063 FIXED
  - ✅ TC-4: декремент «−» при qty=1 удаляет блюдо из корзины
  - ❌ TC-5: Table Confirmation — код стола показывается inline в drawer ДО нажатия. По спецификации должен быть Bottom Sheet ПОСЛЕ нажатия (PM-064 NEW)
  - ⏭ TC-6: SKIP (TC-5 fail, flow другой)
  - ⏭ TC-7: SKIP (TC-5 fail)
  - ✅ TC-8: регрессия OK — StickyCartBar ✅, F5 ✅, no i18n keys ✅, «В зале» терракота ✅
- **Баги найдены:** PM-062 (подтверждён, не закрыт), PM-064 (НОВЫЙ — Table Confirmation inline)
- **Баги закрыты:** PM-063 ✅

---

## 2026-03-21 | Batch 2+3 (Drawer + StickyCartBar + Terracotta) | S153

- **Деплой:** x.jsx, CartView.jsx, MenuView.jsx, ModeTabs.jsx, CheckoutView.jsx (commit 3b65762 + a99d6a8)
- **Тест:** quick-test (Chrome MCP, S153)
- **Результат:** ⚠️ partial pass — core flow OK, 2 визуальных бага
- **Что деплоили:**
  - [P0] OrderItem.bulkCreate перенесён до loyalty side effects
  - [P1] Hall confirmation использует finalTotal (post-discount)
  - [P1] Revalidation корзины при смене режима
  - [P2] Терракота: ModeTabs, MenuView, CheckoutView — все indigo/green заменены
  - [P2] Draft stepper (-/count/+) вместо кнопки удаления
  - [P2] console.warn убраны (8 мест)
  - [P2] Touch targets 44px+
  - [P2] Кнопка submit в CheckoutView — терракота
- **Проверено:**
  - ✅ Страница загружается (нет белого экрана, нет ошибок)
  - ✅ Нет i18n ключей
  - ✅ «В зале» таб — терракота (PM-S152-01 fixed ✅)
  - ✅ Кнопки «+» на карточках — терракота
  - ✅ Цены — терракота
  - ✅ Inline stepper на карточке после добавления (−/1/+)
  - ✅ StickyCartBar появляется с корректным текстом
  - ✅ Drawer открывается корректно
  - ✅ ИТОГО: 56₸ (не уменьшен на скидку, AC-03)
  - ✅ Ожидаемая выгода показана отдельной строкой
  - ✅ Поле кода стола — 4 ячейки
  - ✅ Кнопка «Отправить официанту» disabled пока код не введён
  - ✅ Rate-limit ошибка при неверном коде
  - ✅ F5 — страница восстановилась, корзина сохранилась
- **Баги найдены:** PM-062 (chips indigo), PM-063 (× вместо − в drawer stepper)
- **Заметки:** Кнопка «Оформить заказ» в StickyCartBar тёмная — проверить цвет в enabled состоянии отдельно.

---

## 2026-03-20 | Batch 0+1 (PM-041 + Terracotta CTA) | S152

- **Деплой:** x.jsx, CartView.jsx, useTableSession.jsx (commits 91b5bab, a829e02, cdcd350)
- **Тест:** quick-test (Chrome MCP, S152)
- **Результат:** ⚠️ partial
- **Баги найдены:** PM-S152-01 (tabs/chips/«+» остались indigo) → Fixed в Batch 2+3
- **Заметки:** Core flow ✅ (блюдо→drawer→«Заказ принят!»). PM-041 polling leak подтверждён Fixed.
