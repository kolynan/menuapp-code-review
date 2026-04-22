---
task_id: task-260322-001620-partnersettings
status: running
started: 2026-03-22T00:16:20+05:00
type: chain-step
page: PartnerSettings
work_dir: C:/Dev/menuapp-code-review
budget_usd: 6.00
fallback_model: sonnet
version: 5.3
launcher: python-popen
---

# Task: task-260322-001620-partnersettings

## Config
- Budget: $6.00
- Mode: task-watcher.py launches Claude Code directly via Popen
- Fallback model: sonnet

## Prompt
---
chain: partnersettings-260321-235750
chain_step: 4
chain_total: 4
chain_step_name: merge
page: PartnerSettings
budget: 6.00
runner: cc
type: chain-step
---
=== CHAIN STEP: Merge (4/4) ===
Chain: partnersettings-260321-235750
Page: PartnerSettings

You are the Merge step in a modular consensus pipeline.
Your job: apply the fix plan to the actual code.

INSTRUCTIONS:
1. Read the comparison: pipeline/chain-state/partnersettings-260321-235750-comparison.md
2. Check if discussion report exists: pipeline/chain-state/partnersettings-260321-235750-discussion.md
   - If it exists AND has an "Updated Fix Plan" section → use THAT for disputed items
   - If it says "No disputes" or doesn't exist → use Comparator's "Final Fix Plan" as-is
   - Items marked "Unresolved (for Arman)" → SKIP these, do NOT apply
3. Read the code file: pages/PartnerSettings/*.jsx
4. Apply ALL fixes from the fix plan, in priority order (P0 first)
   - Agreed items from Comparator: always apply
   - Discussion-resolved items: apply the winning solution
   - Unresolved disputes: SKIP (note in merge report)
   - [MUST-FIX] items: CANNOT be skipped. If you cannot apply a MUST-FIX, explain WHY in detail in merge report — do NOT silently skip.
5. After applying fixes:
   a. Update BUGS.md in pages/PartnerSettings/ with fixed items
   b. Update README.md in pages/PartnerSettings/ if needed
6. Git commit and push:
   - git add <specific files only> (NEVER git add . or git add -A)
   - git commit -m "fix(PartnerSettings): N bugs fixed via consensus chain partnersettings-260321-235750"
   - git push
7. Write merge report to: pipeline/chain-state/partnersettings-260321-235750-merge-report.md

FORMAT for merge report:
# Merge Report — PartnerSettings
Chain: partnersettings-260321-235750

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
# Feature: Color Picker в PartnerSettings (#82, часть 1 из 2)

Reference: `BUGS_MASTER.md` (PM-S81-04, PM-S81-05), скриншот PartnerSettings S53.
Production page.

**Контекст:** Партнёр должен иметь возможность выбрать основной цвет бренда. Этот цвет будет использоваться для CTA-кнопок, активных чипов и акцентов в публичном меню (/x). Сейчас цвет захардкожен как `#B5543A` в PublicMenu — задача #82 часть 2 сделает его динамическим. Эта задача добавляет UI для выбора цвета в PartnerSettings.

**Pre-requisite:** Arman вручную добавит поле `primary_color` (тип: Text) в сущность Partner в B44 admin. Поле может быть пустым (null/undefined) — дефолт `#1A1A1A`.

---

## Fix 1 — PM-S81-04 (P2) [MUST-FIX]: Добавить секцию «Внешний вид» с выбором цвета

### Сейчас
В PartnerSettings нет секции для выбора цвета бренда. Партнёр не может настроить визуальный стиль своего публичного меню.

### Должно быть
Новая секция **«Внешний вид»** (или «Appearance» / i18n ключ `settings.appearance`) между секцией «Профиль» (с логотипом) и секцией «Часы работы».

Секция содержит:
1. **Заголовок** с иконкой (как другие секции на странице): «🎨 Внешний вид» / «Appearance»
2. **Подзаголовок:** «Цвет кнопок и акцентов в вашем публичном меню» / «Button and accent color for your public menu»
3. **8 цветных кружков** (preset colors) в горизонтальном ряду с flex-wrap:
   - `#1A1A1A` (Чёрный — дефолт, помечен как "По умолчанию")
   - `#2D6A4F` (Тёмно-зелёный)
   - `#7B2D3B` (Бордо)
   - `#1B3A5C` (Тёмно-синий)
   - `#E8590C` (Оранжевый)
   - `#C92A2A` (Красный)
   - `#6741D9` (Фиолетовый)
   - `#B8860B` (Золотой)
4. **Выбранный цвет** отмечен галочкой (✓) белого цвета внутри кружка ИЛИ border/ring вокруг (2px белый + 2px кружка цвета).
5. Нажатие на кружок → обновляет `partner.primary_color` через `Partner.update()`.
6. **Визуальный preview** НЕ нужен (партнёр увидит результат в публичном меню).

### НЕ должно быть
- ❌ Произвольного ввода HEX-кода (только пресеты, без text input)
- ❌ Color picker нативного (тип `<input type="color">`) — нет, только наши кружки
- ❌ Секции в другом месте страницы (только между Профиль и Часы работы)
- ❌ Ломать существующие секции — не менять ничего кроме добавления новой секции

### Файл и локация
Файл: `pages/PartnerSettings/partnersettings.jsx`
Место вставки: найти секцию «Профиль» (с upload лого) и секцию «Часы работы» (⏰). Новая секция вставляется МЕЖДУ ними.
Entity: `Partner` — поле `primary_color` (string, hex-код).
Read: `Partner.filter()` или из существующего `partner` state.
Write: `Partner.update(partner.id, { primary_color: selectedColor })`.

### Проверка
1. Открыть /partnersettings → между «Профиль» и «Часы работы» есть секция «Внешний вид» с 8 цветными кружками.
2. Нажать на кружок «Оранжевый» → кружок помечен галочкой/рамкой, значение сохранено в Partner entity.
3. Перезагрузить страницу → оранжевый кружок всё ещё выбран (данные persist).
4. Все остальные секции страницы работают как раньше (часы, QR, валюты).

---

## ⛔ SCOPE LOCK — менять ТОЛЬКО то, что указано выше
- Добавить ТОЛЬКО одну новую секцию «Внешний вид» между «Профиль» и «Часы работы».
- ВСЁ остальное на странице (Профиль, Часы работы, Кнопки меню, QR, Wi-Fi, Языки, Валюты, Контакты) — НЕ ТРОГАТЬ.
- НЕ менять layout, стили, поведение существующих секций.
- НЕ добавлять i18n записи в CSV — просто использовать строки или ключи, i18n будет отдельно.
- Если видишь «проблему» не из этой задачи — ПРОПУСТИ, не чини.

## Implementation Notes
- Файл: `partnersettings.jsx` (один файл)
- Entity: `Partner` — `primary_color` field (string, nullable, default null → UI показывает #1A1A1A как выбранный)
- Стиль кружков: `w-10 h-10 rounded-full cursor-pointer border-2` + при выбранном: `ring-2 ring-offset-2` или `✓` внутри
- НЕ ломать: существующие секции, partner.update() для других полей
- git add pages/PartnerSettings/partnersettings.jsx && git commit -m "feat: add color picker section to PartnerSettings (#82)" && git push
=== END ===


## Status
Running...
