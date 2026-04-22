---
task_id: task-260322-085958-publicmenu-cc-writer
status: running
started: 2026-03-22T08:59:59+05:00
type: chain-step
page: PublicMenu
work_dir: C:/Dev/menuapp-code-review
budget_usd: 12.00
fallback_model: sonnet
version: 5.4
launcher: python-popen
---

# Task: task-260322-085958-publicmenu-cc-writer

## Config
- Budget: $12.00
- Mode: task-watcher.py launches Claude Code directly via Popen
- Fallback model: sonnet

## Prompt
---
chain: publicmenu-260322-085953
chain_step: 1
chain_total: 4
chain_step_name: cc-writer
chain_group: writers
chain_group_size: 2
page: PublicMenu
budget: 12.00
runner: cc
type: chain-step
---
=== CHAIN STEP: CC Writer (1/4) ===
Chain: publicmenu-260322-085953
Page: PublicMenu

You are the CC Writer in a modular consensus pipeline.
Your job: independently analyze the code and find ALL bugs.

INSTRUCTIONS:
1. Read the code file for PublicMenu in pages/PublicMenu/*.jsx
2. Also read README.md and BUGS.md in the same folder for context
3. Do your OWN independent analysis — find ALL bugs and issues
4. Focus on: logic errors, missing error handling, i18n issues, UI/UX for mobile-first, React anti-patterns
5. For each finding: [P0/P1/P2/P3] Title - Description. FIX: description of code change needed.
6. Write your findings to: pipeline/chain-state/publicmenu-260322-085953-cc-findings.md
7. Do NOT apply any fixes yet — only document findings

FORMAT for findings file:
# CC Writer Findings — PublicMenu
Chain: publicmenu-260322-085953

## Findings
1. [P0] Title — Description. FIX: ...
2. [P1] Title — Description. FIX: ...
...

## Summary
Total: N findings (X P0, Y P1, Z P2, W P3)

## Prompt Clarity
Rate the task description quality (1-5). For any score below 4, explain what was unclear:
- Overall clarity: [1-5]
- Ambiguous Fix descriptions (list Fix # and what was unclear): ...
- Missing context (what info would have helped): ...
- Scope questions (anything you weren't sure if it's in scope): ...

=== TASK CONTEXT ===
# Feature: Dynamic primary color в PublicMenu (#82, часть 2 из 2)

Reference: `BUGS_MASTER.md` (PM-S81-04, PM-062), `references/PROMPT_TEMPLATES.md`, `ux-concepts/UX_LOCKED_PublicMenu.md`.
Production page.

**Контекст:** Задача #82 часть 1 добавила color picker в PartnerSettings — партнёр выбирает `primary_color` (hex-код) из 8 пресетов. Эта задача делает PublicMenu динамическим: вместо захардкоженного `#B5543A` (terracotta) используется цвет из `partner.primary_color`.

**Pre-requisite:**
- Поле `primary_color` уже существует в Partner entity (добавлено ранее).
- PartnerSettings уже умеет записывать значение (часть 1, commit afeb603).
- Если `primary_color` = null/undefined/пустая строка → использовать дефолт `#1A1A1A`.

**Retry note:** Предыдущие прогоны падали из-за Codex rc=255 (cwd не в git repo). Исправлено в task-watcher-v3.py v5.4 (KB-082).

---

## Fix 1 — PM-S81-04 (P2) [MUST-FIX]: Заменить hardcoded #B5543A на dynamic primary_color

### Сейчас
В x.jsx (и возможно CartView.jsx, ModeTabs.jsx) цвет `#B5543A` захардкожен в множестве мест:
- CTA-кнопки: `bg-[#B5543A]`
- Hover: `hover:bg-[#9A4530]`
- Активные чипы/табы: `bg-[#F5E6E0] text-[#B5543A]`
- Цена: `text-[#B5543A]`
- FAB кнопка "+": `bg-[#B5543A]`
- И другие акценты

### Должно быть
1. **Читать** `partner.primary_color` из Partner entity (объект `partner` уже загружается в x.jsx).
2. **Определить** цвет в начале компонента:
   ```javascript
   const primaryColor = partner?.primary_color || '#1A1A1A';
   ```
3. **Создать helper** для генерации hover-варианта (затемнение на 15%):
   ```javascript
   function darkenColor(hex, percent = 15) {
     const num = parseInt(hex.replace('#', ''), 16);
     const r = Math.max(0, (num >> 16) - Math.round(255 * percent / 100));
     const g = Math.max(0, ((num >> 8) & 0x00FF) - Math.round(255 * percent / 100));
     const b = Math.max(0, (num & 0x0000FF) - Math.round(255 * percent / 100));
     return `#${(r << 16 | g << 8 | b).toString(16).padStart(6, '0')}`;
   }
   const primaryHover = darkenColor(primaryColor);
   ```
4. **Создать helper** для light-варианта (фон активного чипа — 10% opacity):
   ```javascript
   function lightenColor(hex, opacity = 0.1) {
     const num = parseInt(hex.replace('#', ''), 16);
     const r = (num >> 16) & 0xFF;
     const g = (num >> 8) & 0xFF;
     const b = num & 0xFF;
     return `rgba(${r}, ${g}, ${b}, ${opacity})`;
   }
   const primaryLight = lightenColor(primaryColor);
   ```
5. **Заменить ВСЕ** `bg-[#B5543A]` → `style={{ backgroundColor: primaryColor }}`
6. **Заменить ВСЕ** `hover:bg-[#9A4530]` → inline style или onMouseEnter/Leave с `primaryHover`
7. **Заменить ВСЕ** `text-[#B5543A]` → `style={{ color: primaryColor }}`
8. **Заменить ВСЕ** `bg-[#F5E6E0]` → `style={{ backgroundColor: primaryLight }}`

### НЕ должно быть
- ❌ НИ ОДНОГО оставшегося `#B5543A` или `#9A4530` или `#F5E6E0` в коде — все три цвета должны стать динамическими
- ❌ Hardcoded fallback на terracotta — если нет primary_color, дефолт = `#1A1A1A` (чёрный)
- ❌ CSS variables через `<style>` тег — использовать inline styles (проще, надёжнее в B44)
- ❌ Ломать UX LOCKED решения (см. UX_LOCKED_PublicMenu.md): FAB "+" остаётся fixed bottom-right

### Файл и локация
Основной файл: `pages/PublicMenu/x.jsx`
Вероятно затронуты: `CartView.jsx`, `ModeTabs.jsx` (если содержат hardcoded #B5543A)
Entity read: `partner.primary_color` — объект `partner` уже доступен в компоненте.

### Уже пробовали
PM-062 (chips indigo) пробовали фиксить 3 раза через КС — проблема была в компоненте CategoryChips который игнорировал prop. Здесь другой подход: мы заменяем ВСЕ hardcoded цвета на inline styles с динамическим значением, включая CategoryChips.

### Проверка
1. Partner с `primary_color: "#E8590C"` (оранжевый) → открыть /x → ВСЕ кнопки, чипы, акценты оранжевые.
2. Partner с `primary_color: null` → открыть /x → ВСЕ кнопки, чипы, акценты чёрные (`#1A1A1A`).
3. `grep -r "B5543A\|9A4530\|F5E6E0" pages/PublicMenu/` → 0 результатов (ни одного hardcoded цвета).
4. FAB кнопка "+" — цвет динамический, позиция fixed bottom-right (не изменена).
5. Корзина, checkout, drawer — все CTA-кнопки используют динамический цвет.

---

## ⛔ SCOPE LOCK — менять ТОЛЬКО то, что указано выше
- Заменять ТОЛЬКО цвета `#B5543A`, `#9A4530`, `#F5E6E0` на динамические.
- ВСЁ остальное (layout, позиции, размеры, поведение, state logic) — НЕ ТРОГАТЬ.
- UX LOCKED решения (см. `ux-concepts/UX_LOCKED_PublicMenu.md`) — ЗАПРЕЩЕНО менять.
- НЕ рефакторить компоненты, НЕ менять структуру файлов, НЕ добавлять новые компоненты.
- НЕ трогать: polling logic, order flow, cart logic, drawer behavior, i18n.
- Если видишь «проблему» не из этой задачи — ПРОПУСТИ, не чини.

## Implementation Notes
- Файлы: `x.jsx`, `CartView.jsx`, `ModeTabs.jsx` (проверить все три на hardcoded цвета)
- Helper functions (`darkenColor`, `lightenColor`) определить В НАЧАЛЕ файла x.jsx, перед компонентом
- `partner` объект уже загружается — просто добавить `.primary_color`
- Inline styles имеют приоритет над Tailwind классами — это ОК для динамических цветов
- git add pages/PublicMenu/x.jsx pages/PublicMenu/CartView.jsx pages/PublicMenu/ModeTabs.jsx && git commit -m "feat: dynamic primary color from partner settings (#82)" && git push
=== END ===


## Status
Running...
