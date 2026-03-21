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
