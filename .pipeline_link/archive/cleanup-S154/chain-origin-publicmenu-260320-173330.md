---
chain_template: consensus-with-versioning
page: PublicMenu
code_file: pages/PublicMenu/base/x.jsx
budget_per_step: 5
---

# Batch 1: Apply Terracotta Primary + Semantic Palette to PublicMenu

## Задача
Заменить ВСЕ hardcoded цвета в PublicMenu (x.jsx + CartView.jsx) на semantic palette из STYLE_GUIDE.md v3.2. Это глобальное визуальное обновление — после него приложение должно выглядеть в новых цветах.

## Цветовая палитра (ОБЯЗАТЕЛЬНО следовать)

| Роль | Hex | Tailwind / CSS | Где |
|------|-----|----------------|-----|
| Primary (CTA, ссылки, активные табы, "+") | `#B5543A` | custom / inline style | Все primary кнопки, активные элементы |
| Primary Hover | `#9A4530` | — | Hover на primary кнопках |
| Primary Light (фон выбранного) | `#F5E6E0` | — | Фон активной категории, selected chips |
| Success | `#22c55e` | `green-500` | Confirmed, served, paid |
| Sent/Waiting | `#f59e0b` | `amber-500` | Отправлено, ожидание |
| Preparing | `#3b82f6` | `blue-500` | Готовится |
| Error | `#ef4444` | `red-500` | Ошибки |
| Surface (фон страниц) | `#faf9f7` | custom | Фон вместо холодного белого |
| Text Primary | `#0f172a` | `slate-900` | Заголовки, основной текст |
| Text Secondary | `#64748b` | `slate-500` | Описания, подписи |

## Что найти и заменить

1. **Primary color**: любые indigo/purple/blue CTA кнопки → `#B5543A` terracotta
2. **Background**: холодный белый (`bg-white`, `#ffffff`) на основных surface → warm `#faf9f7`
3. **Active states**: selected категории, активные табы → `#F5E6E0` (primary light)
4. **Status chips**: проверить что статусные цвета (sent/preparing/served) используют правильные hex
5. **Hover states**: hover на primary → `#9A4530`
6. **Disabled states**: disabled CTA → `text-slate-400`, `bg-slate-100`, `cursor-not-allowed`

## Ограничения

- Terracotta НЕ входит в стандартный Tailwind. Использовать inline styles `style={{backgroundColor: '#B5543A'}}` или CSS variables
- НЕ менять status colors (green/amber/blue/red) — они уже стандартные Tailwind
- НЕ менять layout, структуру компонентов, логику — ТОЛЬКО цвета и визуальные стили
- НЕ менять Tailwind config (нет доступа к tailwind.config.js в Base44)

## Файлы для обработки

1. `pages/PublicMenu/base/x.jsx` — основной файл (2442 строки, 22 компонента). Приоритет.
2. `pages/PublicMenu/base/CartView.jsx` — drawer/корзина. Второй файл.

## Проверка результата

- Все CTA кнопки визуально terracotta (не indigo/purple)
- Фон страниц тёплый (не холодно-белый)
- Активные категории с light terracotta фоном
- Status chips: amber для sent, blue для preparing, green для served
- Disabled кнопки серые, не цветные
- Текст читаемый: primary slate-900, secondary slate-500

## Контекст
- WCAG проверка пройдена: `#B5543A` на белом = 4.89:1 ✅ AA pass (S149)
- STYLE_GUIDE.md v3.2 — единственный источник истины для цветов
- Это Batch 1 из плана Phase 2 — после него все последующие батчи уже в правильных цветах
