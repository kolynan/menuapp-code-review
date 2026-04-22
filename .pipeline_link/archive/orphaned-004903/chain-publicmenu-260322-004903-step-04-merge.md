---
chain: publicmenu-260322-004903
chain_step: 4
chain_total: 4
chain_step_name: merge
page: PublicMenu
budget: 6.00
runner: cc
type: chain-step
---
=== CHAIN STEP: Merge (4/4) ===
Chain: publicmenu-260322-004903
Page: PublicMenu

You are the Merge step in a modular consensus pipeline.
Your job: apply the fix plan to the actual code.

INSTRUCTIONS:
1. Read the comparison: pipeline/chain-state/publicmenu-260322-004903-comparison.md
2. Check if discussion report exists: pipeline/chain-state/publicmenu-260322-004903-discussion.md
   - If it exists AND has an "Updated Fix Plan" section → use THAT for disputed items
   - If it says "No disputes" or doesn't exist → use Comparator's "Final Fix Plan" as-is
   - Items marked "Unresolved (for Arman)" → SKIP these, do NOT apply
3. Read the code file: pages/PublicMenu/*.jsx
4. Apply ALL fixes from the fix plan, in priority order (P0 first)
   - Agreed items from Comparator: always apply
   - Discussion-resolved items: apply the winning solution
   - Unresolved disputes: SKIP (note in merge report)
   - [MUST-FIX] items: CANNOT be skipped. If you cannot apply a MUST-FIX, explain WHY in detail in merge report — do NOT silently skip.
5. After applying fixes:
   a. Update BUGS.md in pages/PublicMenu/ with fixed items
   b. Update README.md in pages/PublicMenu/ if needed
6. Git commit and push:
   - git add <specific files only> (NEVER git add . or git add -A)
   - git commit -m "fix(PublicMenu): N bugs fixed via consensus chain publicmenu-260322-004903"
   - git push
7. Write merge report to: pipeline/chain-state/publicmenu-260322-004903-merge-report.md

FORMAT for merge report:
# Merge Report — PublicMenu
Chain: publicmenu-260322-004903

## Applied Fixes
1. [P0] Fix title — Source: agreed/discussion-resolved — DONE
2. [P1] Fix title — Source: comparator — DONE
...

## Skipped — Unresolved Disputes (for Arman)
- Dispute: [title] — CC says X, Codex says Y — NEEDS DECISION

## Skipped — Could Not Apply
- Reason...

## Git
- Commit: <hash>
- Files changed: N

## Prompt Feedback
Collect Prompt Clarity sections from CC and Codex findings files (if present), then add your own observations:
- CC clarity score: [N/5]
- Codex clarity score: [N/5]
- Fixes where writers diverged due to unclear description: ...
- Fixes where description was perfect (both writers agreed immediately): ...
- Recommendation for improving task descriptions: ...

## Summary
- Applied: N fixes
- Skipped (unresolved): N disputes
- Skipped (other): N fixes
- MUST-FIX not applied: N (with reasons)
- Commit: <hash>

=== TASK CONTEXT ===
# Feature: Dynamic primary color в PublicMenu (#82, часть 2 из 2)

Reference: `BUGS_MASTER.md` (PM-S81-04, PM-062), `references/PROMPT_TEMPLATES.md`, `ux-concepts/UX_LOCKED_PublicMenu.md`.
Production page.

**Контекст:** Задача #82 часть 1 добавила color picker в PartnerSettings — партнёр выбирает `primary_color` (hex-код) из 8 пресетов. Эта задача делает PublicMenu динамическим: вместо захардкоженного `#B5543A` (terracotta) используется цвет из `partner.primary_color`.

**Pre-requisite:**
- Поле `primary_color` уже существует в Partner entity (добавлено ранее).
- PartnerSettings уже умеет записывать значение (часть 1, commit afeb603).
- Если `primary_color` = null/undefined/пустая строка → использовать дефолт `#1A1A1A`.

**Retry note:** Предыдущий прогон (chain publicmenu-260321-235751) упал из-за Codex rc=255 (параллельный конфликт запусков). Задача не была выполнена. Это чистый retry той же задачи.

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
     // Parse hex, reduce each RGB channel by percent%, return new hex
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
