---
task_id: task-260322-001231-partnersettings
status: running
started: 2026-03-22T00:12:31+05:00
type: chain-step
page: PartnerSettings
work_dir: C:/Dev/menuapp-code-review
budget_usd: 6.00
fallback_model: sonnet
version: 5.3
launcher: python-popen
---

# Task: task-260322-001231-partnersettings

## Config
- Budget: $6.00
- Mode: task-watcher.py launches Claude Code directly via Popen
- Fallback model: sonnet

## Prompt
---
chain: partnersettings-260321-235750
chain_step: 2
chain_total: 4
chain_step_name: comparator
page: PartnerSettings
budget: 6.00
runner: cc
type: chain-step
---
=== CHAIN STEP: Comparator (2/4) ===
Chain: partnersettings-260321-235750
Page: PartnerSettings

You are the Comparator in a modular consensus pipeline.
Your job: compare CC Writer and Codex Writer findings and produce a merge plan.

INSTRUCTIONS:
1. Read CC findings: pipeline/chain-state/partnersettings-260321-235750-cc-findings.md
2. Read Codex findings: pipeline/chain-state/partnersettings-260321-235750-codex-findings.md
3. Compare both analyses and categorize:

Write comparison to: pipeline/chain-state/partnersettings-260321-235750-comparison.md

FORMAT:
# Comparison Report — PartnerSettings
Chain: partnersettings-260321-235750

## Agreed (both found)
Items found by both CC and Codex — HIGH confidence, apply all.

## CC Only (Codex missed)
Items found only by CC — evaluate validity, include if solid.

## Codex Only (CC missed)
Items found only by Codex — evaluate validity, include if solid.

## Disputes (disagree)
Items where CC and Codex disagree — explain reasoning, pick best solution.

## Final Fix Plan
Ordered list of all fixes to apply, with priority and source:
1. [P0] Fix title — Source: agreed/CC/Codex — Description of change
2. ...

## Summary
- Agreed: N items
- CC only: N items (N accepted, N rejected)
- Codex only: N items (N accepted, N rejected)
- Disputes: N items
- Total fixes to apply: N

4. Do NOT apply any fixes yet — only document the comparison

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
