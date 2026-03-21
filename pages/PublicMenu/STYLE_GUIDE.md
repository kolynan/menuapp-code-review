---
version: "3.1"
created: "2026-03-03"
updated: "2026-03-07"
session: 95
---

# MenuApp — UX Style Guide

Единый справочник визуальных стандартов для всех страниц MenuApp. Все ВСК задачи (CC+Codex) должны ссылаться на этот документ при реализации UI.

---

## 1. Цветовая палитра

### Дизайн-философия цвета (S94 GPT Round 3)

Terracotta выбран как primary вместо indigo/purple. Обоснование: тёплый, аппетитный, не «tech-like» и не «delivery-like», хороший контраст на белом фоне, работает при плохом ресторанном освещении.

### Semantic Palette — единая система цветов

| Роль | Цвет | Hex | CSS Variable | Где используется |
|------|-------|-----|-------------|-----------------|
| **Primary** | Terracotta | `#B5543A` | `--color-primary` | CTA кнопки, ссылки, активные табы, кнопка "+", навигация, selected state |
| **Primary Hover** | Terracotta dark | `#9A4530` | `--color-primary-hover` | Hover на primary кнопках |
| **Primary Light** | Terracotta tint | `#F5E6E0` | `--color-primary-light` | Фон активной категории, selected chip, light highlight |
| **Success** | Green | `#22c55e` | `--color-success` | Confirmed, served, paid, подтверждение |
| **Sent / Waiting** | Amber | `#f59e0b` | `--color-sent` | Отправлено официанту, ожидание |
| **Preparing** | Blue | `#3b82f6` | `--color-preparing` | Готовится, in progress |
| **Error** | Red | `#ef4444` | `--color-error` | Ошибки, destructive actions |
| **Neutral** | Slate 50 | `#f8fafc` | — | Фон плейсхолдеров, приглушённые карточки |
| **Neutral Border** | Slate 200 | `#e2e8f0` | — | Границы карточек, разделители |
| **Surface** | Warm neutral | `#faf9f7` | `--color-surface` | Фон страниц (тёплый, не холодно-серый) |
| **Text Primary** | Slate 900 | `#0f172a` | — | Основной текст |
| **Text Secondary** | Slate 500 | `#64748b` | — | Описания, подписи |
| **Text Muted** | Slate 300 | `#cbd5e1` | — | Плейсхолдеры, иконки-заглушки (ТОЛЬКО декоративные) |

> **A11y правило контраста:** `slate-300` — ТОЛЬКО для декоративных элементов (плейсхолдеры, иконки-заглушки). Для любого читаемого текста минимум — `slate-500`. На белом фоне в ресторане (яркий свет, грязный экран) более светлый текст нечитаем. Secondary text не должен быть «почти невидимым».

> **Ресторанное освещение:** проверять экран при пониженной яркости и в тёмной обстановке. Выигрывает контрастный, крупный, тёплый и предсказуемый UI.

> **⚠️ При реализации:** terracotta не входит в стандартный Tailwind. Использовать CSS variables или Tailwind `extend` в конфиге. Hex `#B5543A` — ориентировочный, финально подтвердить после проверки контраста WCAG 4.5:1 для белого текста на primary фоне.

### Статусные цвета (единые для Guest + Waiter)

| Статус | Семантика | Цвет | Hex |
|--------|-----------|------|-----|
| ОТПРАВЛЕН (Sent) | Ожидание | Amber | `#f59e0b` |
| ПРИНЯТ (Accepted) | Ожидание | Amber | `#f59e0b` |
| ГОТОВИТСЯ (Preparing) | In progress | Blue | `#3b82f6` |
| ГОТОВ (Ready) | Требует действия | Amber | `#f59e0b` |
| ПОДАНО (Served) | Success | Green | `#22c55e` |
| ОПЛАЧЕНО (Paid) | Success | Green | `#22c55e` |
| ОТМЕНЁН (Cancelled) | Error | Red | `#ef4444` |

> **Правило: статус = цвет + текст.** Никогда не кодировать статус только цветом. Всегда есть текстовый бейдж/лейбл. Цвет — усиление, не единственный индикатор (дальтонизм, усталость, плохое освещение).

### Партнёрская кастомизация

| Что партнёр МОЖЕТ менять | Что партнёр НЕ МОЖЕТ менять |
|--------------------------|----------------------------|
| Accent surfaces (фон header) | Primary CTA color (terracotta) |
| Category chip tint | Success/error semantic colors |
| Decorative highlights | Status colors (sent/preparing/served) |
| Header background color | Text contrast rules |

---

## 2. Кнопки

### Размеры (tap targets)

| Тип | Минимальная высота | Ширина | Контекст |
|-----|-------------------|--------|----------|
| Primary CTA (мобайл) | **52px** | Full-width | "Отправить заказ", "Принять" |
| Primary CTA (десктоп) | **48px** | Auto / Full-width | Те же кнопки на больших экранах |
| Secondary | **48px** | Auto (min 120px) | "Назад", "Отмена" |
| Icon button ("+") | **44×44px** (`w-11 h-11`) | Фиксированная | Добавить в корзину |
| Small action (stepper) | **44×44px** (`w-11 h-11`) | Фиксированная | Степпер "−", "+" |
| Badge/chip | **32px** | Auto | Статус, категория (read-only) |

> **Правило Apple HIG:** минимум 44px для любого тапа на мобайле. Для официантов с руками, полными тарелок — 52px для основных действий.

### Стили

| Тип | Классы / стили |
|-----|--------|
| Primary | `bg-[--color-primary] hover:bg-[--color-primary-hover] text-white rounded-lg shadow-sm` |
| Primary Round | `bg-[--color-primary] hover:bg-[--color-primary-hover] text-white rounded-full shadow-md` |
| Secondary | `bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg` |
| Danger | `bg-red-500 hover:bg-red-600 text-white rounded-lg` |
| Ghost | `hover:bg-slate-100 text-slate-600 rounded-full` |
| Disabled | `bg-slate-100 text-slate-400 cursor-not-allowed` |

### Sticky CTA

Главная CTA кнопка **всегда видна** на экране (sticky bottom). Шаблон:

```
<div className="sticky bottom-0 bg-white border-t border-slate-200 p-4 safe-area-bottom">
  <button className="w-full h-[52px] bg-[var(--color-primary)] ...">
    {label}
  </button>
</div>
```

---

## 3. Карточки

### Dish Card (List View — default) — S95

Основной формат для PublicMenu. 1-column list, не grid.

```
Card container:
  border border-slate-200 rounded-xl overflow-hidden
  hover:shadow-md transition-shadow
  flex flex-row           ← горизонтальный flex (list mode)

Photo area:
  w-[96px] h-[96px] bg-slate-100 flex-shrink-0
  "+" button: absolute, w-11 h-11, bg-[--color-primary] rounded-full

Content area:
  p-3 flex flex-col flex-1
  Name: line-clamp-2, text-base, font-semibold
  Description: line-clamp-1, text-sm, text-slate-500
  Price: mt-auto, font-bold, text-[--color-primary]
  Dietary tags: 0–2, text-xs, если данные надёжны
```

### Dish Card (Grid View — опциональный) — S95

Включается в настройках партнёра. Не удалять из кода.

```
Card container:
  border border-slate-200 rounded-xl overflow-hidden
  hover:shadow-md transition-shadow
  flex flex-col           ← вертикальный flex (grid mode)

Photo area:
  relative w-full h-36 sm:h-48 bg-slate-100
  "+" button: absolute bottom-2 right-2, w-11 h-11, bg-[--color-primary] rounded-full

Content area:
  p-3 flex flex-col flex-1
  Name: line-clamp-2, text-base sm:text-lg, font-semibold
  Description: line-clamp-1, text-sm, text-slate-500
  Price: mt-auto, font-bold, text-[--color-primary]
  Rating: text-sm, text-slate-500 — CONDITIONAL: показывать только если отзывов ≥5 (см. public-menu.md)
```

> **Guardrail:** line-clamp обязателен для RU/KK — длинные названия блюд. Тестировать с названиями >40 символов.

### Photo Placeholder (без фото)

```
bg-slate-50 flex items-center justify-center
<ImageIcon className="w-10 h-10 text-slate-300 opacity-30" />
Никакого текста. Только иконка.
```

### Waiter Card (StaffOrdersMobile)

```
Card container:
  border-l-4 border-[STATUS_COLOR]    ← цветной бордер слева
  rounded-lg bg-white shadow-sm

Compact mode (список):
  Table name + badge + guest count + time
  One CTA button (52px height, full-width)

Preparing state (muted):
  bg-slate-50, smaller text, no CTA, grey badge
```

---

## 4. Типографика

| Элемент | Классы | Размер (px) |
|---------|--------|-------------|
| Restaurant Name | `text-2xl font-bold text-slate-900` | 24–28 |
| Section Header | `text-lg font-semibold text-slate-800` | 18–20 |
| Card Title | `text-base font-semibold text-slate-900 line-clamp-2` | 16–17 |
| Body Text (гостевое меню) | `text-base text-slate-700` | 16 |
| Body Text (персонал) | `text-sm text-slate-700` | 14 |
| Caption / Description | `text-sm text-slate-500 line-clamp-1` | 14 |
| Price | `text-base font-bold text-[--color-primary]` | 16 |
| Badge | `text-xs font-medium px-2 py-1 rounded-full` | 12–13 |
| Meta / Chips | `text-xs text-slate-600` | 12–13 |
| Form Label | `text-sm font-medium text-slate-700` | 14 |
| Placeholder | `text-sm text-slate-400` | 14 |

> **A11y правило:** в гостевом меню (PublicMenu /x) основной текст = `text-base` (≥16px). `text-sm` — только подписи и вторичное. Для персонала (StaffOrdersMobile) допустим `text-sm` для компактности, но не мельче.

---

## 5. Отступы и сетка

| Элемент | Значение |
|---------|----------|
| Base grid | `8pt` (все отступы кратны 8) |
| Page padding | `px-4` (16px) |
| Card gap | `gap-4` (16px) |
| Card internal padding | `p-3` или `p-4` (16px) |
| Section spacing | `space-y-4` (16px) |
| Chip gap | `gap-2` (8px) |
| Button gap (внутри карточки) | `gap-2` (8px) |
| List layout | `flex flex-col gap-4` |
| Grid layout (optional) | `grid grid-cols-2 sm:grid-cols-3 gap-4` |
| Min gap между tap targets | `gap-2` (8px) минимум, лучше `gap-3` (12px) |
| Safe-area для sticky блоков | `safe-area-bottom` обязательно на iOS |

### Радиусы

| Элемент | Значение |
|---------|----------|
| Cards | `rounded-xl` (16px) |
| Pills / Chips / Buttons | `rounded-full` (9999px) или `rounded-2xl` (20–24px) |
| Drawers | `rounded-t-3xl` (24–28px top radius) |
| Input fields | `rounded-lg` (8px) |

---

## 6. Иконки

**Библиотека:** `lucide-react` (уже в проекте)

| Назначение | Иконка | Размер |
|------------|--------|--------|
| Добавить | `Plus` | `w-5 h-5` |
| Убрать | `Minus` | `w-4 h-4` |
| Фото-заглушка | `ImageIcon` | `w-10 h-10 opacity-30` |
| Корзина | `ShoppingCart` | `w-5 h-5` |
| Помощь | `HelpCircle` | `w-5 h-5` |
| Назад | `ArrowLeft` | `w-5 h-5` |
| Закрыть | `X` | `w-5 h-5` |
| Рейтинг | `Star` (filled) | `w-4 h-4` |
| Язык | `Globe` | `w-5 h-5` |

### A11y для иконок
- Любая icon-only кнопка ("+", "×", степпер) обязана иметь `aria-label` и `title`.
- Декоративные иконки (рядом с текстом) — `aria-hidden="true"`.
- Для ключевого действия "+" на фото — допускается без текста (ЛМП Wolt/Glovo), но с `aria-label="Добавить"` и toast "Добавлено" при первом использовании.

---

## 7. Состояния (обязательно для каждого view)

Каждый view/компонент ОБЯЗАН поддерживать 4 состояния:

| Состояние | Что показывает | Пример |
|-----------|---------------|--------|
| Loading | Skeleton / spinner | Серые прямоугольники пульсируют |
| Empty | Иконка + текст + CTA | "Нет заказов. Откройте меню" |
| Error | Описание + кнопка "Попробовать снова" | "Не удалось загрузить. Попробуйте снова" |
| Success | Основной контент | Карточки блюд, список заказов |

> Белый экран = баг. Если экран пустой без объяснения — это должно быть исправлено.

### Рецепты (готовые шаблоны)

**Empty state:**
- Заголовок: 2-4 слова (`text-lg font-semibold`)
- 1 строка объяснения (`text-sm text-slate-500`)
- 1 CTA кнопка (Primary)
- Пример: "Пока нет заказов" → "Выберите блюда в меню" → [Открыть меню]

**Error state:**
- Заголовок: "Не удалось …" (`text-lg font-semibold`)
- 1 строка: человеческий текст, без тех. терминов (`text-sm text-slate-500`)
- CTA: "Попробовать снова" (обязательно)
- Пример: "Не удалось загрузить" → "Проверьте интернет" → [Попробовать снова]

**Loading:**
- Skeleton для ключевого контента (не spinner на пустом экране)
- При таймауте → Error state (не крутить бесконечно)

---

## 8. Анимации и переходы

| Действие | Анимация |
|----------|----------|
| Hover на карточке | `hover:shadow-md transition-shadow` |
| Добавление в корзину | "+" → count bump в StickyCartBar + toast "Добавлено" |
| StickyCartBar появление | Мягкая анимация при первом item |
| StickyCartBar обновление | highlight/pulse при изменении суммы |
| Скролл после действия | `behavior: 'smooth'` — только при явных действиях |
| Открытие drawer | slide-up |
| Card highlight после add | subtle highlight 500–800ms |

> **Правило:** анимации минимальные. Не добавлять bounce, shake, «летающие» элементы. Ресторан — рабочий контекст, не развлечение. Не добавлять сложных анимаций если Base44 это усложняет.
>
> **A11y:** все анимации (pulse, highlight, smooth-scroll) отключаются при `prefers-reduced-motion`. После авто-скролла фокус переводится в целевую область.

---

## 9. Responsive Breakpoints

| Breakpoint | Tailwind | Использование |
|------------|----------|---------------|
| Mobile (default) | нет префикса | 320-640px, основной дизайн |
| Small | `sm:` | 640px+, десктоп карточки, большие фото |
| Medium | `md:` | 768px+, 3-колоночная сетка |

> **Mobile-first:** все стили по умолчанию для мобайла. `sm:` и `md:` — только для расширения на больших экранах.

---

## 10. Drawer (Bottom Sheet)

Общие правила для всех drawer / bottom sheet:

| Параметр | Значение |
|----------|----------|
| Width | Full mobile |
| Top radius | `rounded-t-3xl` (24–28px) |
| Max height (compact) | 80–85dvh |
| Max height (expanded) | 88–92dvh |
| Sticky header + footer | Всегда |
| Touch targets | min 44×44px |
| Section spacing | 16px |
| Padding | 16px |
| Drag handle | Всегда видна сверху |

### Визуальное разделение sent vs draft (в Cart Drawer)

| Зона | Стиль | Элементы |
|------|-------|----------|
| Sent orders (сверху) | Спокойный фон, текст менее контрастный но читаемый, status chip | Без stepper, без remove, read-only |
| Draft (снизу) | Яркий стиль, section title ярче, CTA active | Stepper видны, remove доступен |

> **НЕ делать:** сильный blur, opacity 50%, disabled-серую кашу для sent orders. Sent должен быть читаемым, просто визуально «тише» чем draft.

---

## История изменений

| Дата | Сессия | Что изменилось |
|------|--------|---------------|
| 2026-03-03 | S72 | Создан Style Guide v1.0 |
| 2026-03-03 | S72 | v2.0 — GPT UX Review. Контраст, статус=цвет+текст, typography 16px, gap+safe-area, aria-label, рецепты Empty/Error/Loading, reduced-motion |
| 2026-03-07 | S95 | v3.0 — Полное обновление по решениям GPT S93-S94. Primary: indigo→terracotta. Semantic palette. Партнёрская кастомизация. List view default. Drawer specs. Радиусы. Base grid 8pt. Статусные цвета unified (Guest+Waiter). Warm-neutral surfaces |
| 2026-03-07 | S96 | v3.1 — GPT Review fixes: stepper 40→44px (убрано противоречие с min 44px), rating в grid card → conditional |
