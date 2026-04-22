---
chain: publicmenu-260320-173330
chain_step: 4
chain_total: 4
chain_step_name: merge-with-tag
page: PublicMenu
budget: 2.50
runner: cc
type: chain-step
---
=== CHAIN STEP: Merge with Versioning (4/4) ===
Chain: publicmenu-260320-173330
Page: PublicMenu

You are the Merge step in a modular consensus pipeline.
Your job: create a safe version tag, then apply the fix plan to the actual code.

INSTRUCTIONS:

## Phase 1 — Version tag (safety checkpoint)
1. Create a git tag BEFORE any code changes:
   - git tag "PublicMenu-pre-publicmenu-260320-173330" -m "Pre-fix checkpoint for chain publicmenu-260320-173330"
   - git push origin "PublicMenu-pre-publicmenu-260320-173330"
   - This allows instant rollback: `git revert --no-commit HEAD..PublicMenu-pre-publicmenu-260320-173330`

## Phase 2 — Apply fixes
2. Read the comparison: pipeline/chain-state/publicmenu-260320-173330-comparison.md
3. Check if discussion report exists: pipeline/chain-state/publicmenu-260320-173330-discussion.md
   - If it exists AND has an "Updated Fix Plan" section → use THAT for disputed items
   - If it says "No disputes" or doesn't exist → use Comparator's "Final Fix Plan" as-is
   - Items marked "Unresolved (for Arman)" → SKIP these, do NOT apply
4. Read the code file: pages/PublicMenu/base/*.jsx
5. Apply ALL fixes from the fix plan, in priority order (P0 first)
   - Agreed items from Comparator: always apply
   - Discussion-resolved items: apply the winning solution
   - Unresolved disputes: SKIP (note in merge report)
6. After applying fixes:
   a. Update BUGS.md in pages/PublicMenu/ with fixed items
   b. Update README.md in pages/PublicMenu/ if needed
7. Git commit and push:
   - git add <specific files only> (NEVER git add . or git add -A)
   - git commit -m "fix(PublicMenu): N bugs fixed via consensus chain publicmenu-260320-173330"
   - git push

## Phase 3 — Merge report
8. Write merge report to: pipeline/chain-state/publicmenu-260320-173330-merge-report.md

FORMAT for merge report:
# Merge Report — PublicMenu
Chain: publicmenu-260320-173330

## Version Tag
- Pre-fix tag: PublicMenu-pre-publicmenu-260320-173330
- Rollback: `git revert --no-commit HEAD..PublicMenu-pre-publicmenu-260320-173330`

## Applied Fixes
1. [P0] Fix title — Source: agreed/discussion-resolved — DONE
2. [P1] Fix title — Source: comparator — DONE
...

## Skipped — Unresolved Disputes (for Arman)
- Dispute: [title] — CC says X, Codex says Y — NEEDS DECISION

## Skipped — Could Not Apply
- Reason...

## Git
- Pre-fix tag: <tag>
- Commit: <hash>
- Files changed: N

## Summary
- Applied: N fixes
- Skipped (unresolved): N disputes
- Skipped (other): N fixes
- Commit: <hash>

=== TASK CONTEXT ===
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
=== END ===
