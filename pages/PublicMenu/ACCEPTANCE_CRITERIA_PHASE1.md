---
version: "1.0"
created: "2026-03-07"
updated: "2026-03-07"
session: 97
depends_on:
  - public-menu.md v4.1
  - STYLE_GUIDE.md v3.1
  - TESTING.md v2.1
---

# Acceptance Criteria — Phase 1 (Quick Wins)

Критерии приёмки для Phase 1 PublicMenu. Каждый пункт = конкретная проверка, которую можно пройти ✅ или провалить ❌. Тестирование в Chrome device mode (375×812, iPhone SE/14).

**Философия:** Phase 1 = стабилизация. Не новые фичи, а починка того, что сломано или мешает пользователю. Гость должен пройти core flow без путаницы.

**Ссылки:** детали UX → `public-menu.md`, визуальные стандарты → `STYLE_GUIDE.md`, методология тестирования → `TESTING.md`.

---

## AC-01: Raw i18n Keys

**Что:** На экране не должно быть видимых ключей переводов (`order.status.new`, `loyalty.points`, и т.д.).

**Критерий:**
- [ ] На всех экранах PublicMenu (меню, drawer, confirmation) — 0 видимых i18n keys
- [ ] Проверить на RU, EN, KK
- [ ] Если ключ отсутствует в переводах — показать fallback (EN), а не raw key

**Fail:** любой raw key виден пользователю.

**Источник:** public-menu.md принцип #5 "Всё через i18n", TESTING.md i18n testing.

---

## AC-02: Sticky CTA Visibility

**Что:** Главная кнопка действия (StickyCartBar / "Отправить официанту") всегда видна на экране, не уходит за fold.

**Критерий:**
- [ ] StickyCartBar прилипает к низу экрана при скролле меню
- [ ] CTA кнопка не перекрыта другими элементами (drawer, keyboard, cookie banner)
- [ ] При длинном меню (20+ блюд) CTA не исчезает
- [ ] safe-area-bottom учтён (нет перекрытия на iPhone с home indicator)

**Fail:** CTA не видна или не нажимается в любом состоянии.

**Источник:** STYLE_GUIDE.md §2 Sticky CTA, public-menu.md Phase 1 "sticky CTA".

---

## AC-03: Draft Total ≠ Savings

**Что:** Сумма черновика показывает реальную стоимость блюд. Скидка/бонусы отображаются ОТДЕЛЬНОЙ строкой, а не вычитаются из draft total.

**Критерий:**
- [ ] Draft total = сумма (цена × кол-во) для каждого блюда в черновике
- [ ] Скидка loyalty (если есть) — отдельная строка "Ожидаемая выгода"
- [ ] Draft total НЕ уменьшен на скидку до отправки
- [ ] Нет путаницы "сколько я заплачу"

**Fail:** draft total отличается от суммы позиций, или скидка уже вычтена.

**Источник:** public-menu.md §E Totals Logic #1 и #3.

---

## AC-04: Bill / Orders Hidden Before First Send

**Что:** Гость не видит "Счёт" и "Мои заказы" пока не отправил хотя бы один заказ.

**Критерий:**
- [ ] До первой отправки: drawer показывает ТОЛЬКО черновик
- [ ] Нет секции "Мои заказы" (0 отправленных)
- [ ] Нет секции "Счёт" / Bill
- [ ] После первой отправки: секции появляются

**Fail:** гость видит "Счёт: 0₸" или пустую секцию "Мои заказы" до отправки.

**Источник:** public-menu.md §D 7-state matrix (states V0+D0, V1+D1), §E anti-pattern #2.

---

## AC-05: Copy Fixes (критические тексты)

**Что:** Ключевые UI-тексты понятны гостю, без технического жаргона.

**Критерий:**
- [ ] CTA кнопка отправки: текст = "Отправить официанту" (не "Submit", не "Отправить заказ")
- [ ] Confirmation: "Заказ отправлен официанту" (не "Order sent")
- [ ] Empty cart: человеческий текст + CTA "Открыть меню" (не пустой экран)
- [ ] Error state: "Не удалось отправить. Попробуйте снова" (не "Error 500")
- [ ] Все критические тексты есть в RU, EN, KK

**Fail:** технический текст или непереведённый текст в core flow.

**Источник:** public-menu.md Phase 1 "copy fixes", TESTING.md §Content checklist. Полный копирайтинг → COPY_SPEC.md (отдельный документ).

---

## AC-06: Touch Targets ≥ 44px

**Что:** Все интерактивные элементы на мобильном имеют минимальный размер касания 44×44px.

**Критерий:**
- [ ] Кнопка "+" на карточке блюда: ≥ 44×44px
- [ ] Stepper "−" и "+": ≥ 44×44px
- [ ] CTA кнопки: ≥ 52px высота (мобайл)
- [ ] Иконки в header (язык, помощь): ≥ 44×44px
- [ ] Закрытие drawer "×": ≥ 44×44px

**Fail:** любой интерактивный элемент < 44px на мобильном.

**Источник:** STYLE_GUIDE.md §2 Кнопки, Apple HIG.

---

## AC-07: Disabled / Loading State на CTA

**Что:** При отправке заказа CTA переходит в disabled + показывает loading.

**Критерий:**
- [ ] Нажатие "Отправить" → кнопка становится disabled (серая, text-slate-400, cursor-not-allowed)
- [ ] Показан loading indicator (spinner или "Отправляем...")
- [ ] Повторное нажатие невозможно (no double-submit)
- [ ] При ошибке → кнопка возвращается в активное состояние + текст "Повторить"
- [ ] При успехе → экран confirmation

**Fail:** можно нажать дважды, нет loading, кнопка не меняет состояние.

**Источник:** public-menu.md §E CTA Logic V5+D2, STYLE_GUIDE.md disabled style.

---

## AC-08: Error State на Submit

**Что:** При ошибке отправки гость видит понятное сообщение + возможность повторить.

**Критерий:**
- [ ] Ошибка сети → сообщение "Не удалось отправить" (не blank screen, не "Connection error")
- [ ] CTA "Повторить отправку" доступна
- [ ] Черновик НЕ потерян (все выбранные блюда на месте)
- [ ] Гость может продолжить выбор (вернуться в меню)

**Fail:** потеря черновика, dead-end без recovery, технический текст ошибки.

**Источник:** public-menu.md §E V6+D3, TESTING.md Scenario 6, STYLE_GUIDE.md §7 Error state.

---

## AC-09: Toast "Добавлено"

**Что:** После добавления блюда гость получает обратную связь.

**Критерий:**
- [ ] Нажатие "+" → toast/snackbar "Добавлено" (или аналог)
- [ ] Count bump в StickyCartBar (если видна)
- [ ] Subtle highlight на карточке (500–800ms, опционально)
- [ ] Toast не блокирует UI, исчезает сам (2–3 сек)

**Fail:** нет обратной связи после добавления (гость не уверен, добавилось ли).

**Источник:** public-menu.md §B Feedback после добавления, STYLE_GUIDE.md §8.

---

## AC-10: 4 State Coverage (Loading / Empty / Error / Success)

**Что:** Каждый ключевой view имеет все 4 состояния. Нет blank screen.

**Критерий:**
- [ ] MenuView: Loading (skeleton) → Empty ("Меню пока пусто") → Error ("Не удалось загрузить") → Success (карточки)
- [ ] CartView / Drawer: Empty ("Выберите блюда") → Success (список)
- [ ] Confirmation: Success (✓ Заказ отправлен)
- [ ] Нет белого экрана ни в одном состоянии

**Fail:** любой blank screen без объяснения.

**Источник:** STYLE_GUIDE.md §7, public-menu.md принцип #2, TESTING.md §State testing.

---

## AC-11: Modifier Guard

**Что:** Если блюдо имеет required модификаторы, а UI их ещё не поддерживает (Phase 1), — блокировать добавление в корзину.

**Критерий:**
- [ ] Нажатие "+" на блюде с required modifier → НЕ добавляет в корзину
- [ ] Показано объяснение: "Выбор опций скоро будет доступен" (или disable кнопки с hint)
- [ ] Блюда без required modifiers → добавляются нормально
- [ ] Блюда с only-optional modifiers → добавляются нормально (без выбора опций)

**Fail:** блюдо с required modifier добавляется без выбора, заказ уходит без modifier → кухня не знает что готовить.

**Источник:** public-menu.md Phase 1 "modifier guard" (S96 GPT), §F Модификаторы.

---

## AC-12: i18n Fallback

**Что:** Если ключ перевода отсутствует для текущего языка — показать EN fallback, а не raw key.

**Критерий:**
- [ ] Переключить на KK → все тексты на казахском ИЛИ на EN fallback
- [ ] Нет raw keys (`some.key.name`) ни на одном языке
- [ ] Fallback цепочка: выбранный язык → EN → key (только в dev, не в production)

**Fail:** raw key виден на любом языке в production.

**Источник:** public-menu.md принцип #5, Phase 1 "i18n", AC-01 (связан).

---

## AC-13: BUG-7 Fix (известный баг)

**Что:** BUG-7, зарегистрированный в S93. Конкретика — см. BUGS_MASTER.md.

**Критерий:**
- [ ] Баг BUG-7 больше не воспроизводится
- [ ] Регрессия отсутствует

**Fail:** баг воспроизводится.

**Источник:** public-menu.md Phase 1 "BUG-7", BUGS_MASTER.md.

---

## Сводка по фазам тестирования

### Smoke Test (5 мин, после каждого деплоя Phase 1)

Проверить: AC-01, AC-02, AC-04, AC-05, AC-10 — на RU.

### Full Phase 1 Acceptance (30 мин)

Проверить все AC-01 — AC-13 на RU, EN, KK по сценариям:
- **S0** (First Impression) → AC-10
- **S1** (QR → add → send → confirmation) → AC-02, AC-03, AC-05, AC-06, AC-07, AC-08, AC-09
- **S2** (Дозаказ) → AC-04
- **S3** (Языки) → AC-01, AC-12
- Отдельно: AC-11 (modifier guard), AC-13 (BUG-7)

### Pass Criteria

| Уровень | Критерий |
|---------|----------|
| ✅ Phase 1 Accepted | Все 13 AC пройдены на RU + EN. KK допускает fallback на EN |
| ⚠️ Conditional Pass | 1–2 P2 бага, 0 P0/P1, core flow работает |
| ❌ Phase 1 Blocked | Любой P0, или ≥2 P1, или core flow сломан |

---

## Связь с документами

| Документ | Что берём |
|----------|----------|
| `public-menu.md` v4.1 | UX-решения, state matrix, CTA logic, anti-patterns |
| `STYLE_GUIDE.md` v3.1 | Визуальные стандарты, цвета, размеры, состояния |
| `TESTING.md` v2.1 | Сценарии, severity, формат багов, scorecard |
| `COPY_SPEC.md` (TBD) | Точные тексты для AC-05 |
| `BUGS_MASTER.md` | Детали BUG-7 для AC-13 |

---

## История изменений

| Дата | Сессия | Что изменилось |
|------|--------|---------------|
| 2026-03-07 | S97 | v1.0 — Создан. 13 acceptance criteria по Phase 1 из public-menu.md. Smoke + Full acceptance процедуры. Pass criteria |
