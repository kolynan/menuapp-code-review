---
chain: partnersettings-260321-235750
chain_step: 1
chain_total: 4
chain_step_name: cc-writer
chain_group: writers
chain_group_size: 2
page: PartnerSettings
budget: 12.00
runner: cc
type: chain-step
---
=== CHAIN STEP: CC Writer (1/4) ===
Chain: partnersettings-260321-235750
Page: PartnerSettings

You are the CC Writer in a modular consensus pipeline.
Your job: independently analyze the code and find ALL bugs.

INSTRUCTIONS:
1. Read the code file for PartnerSettings in pages/PartnerSettings/*.jsx
2. Also read README.md and BUGS.md in the same folder for context
3. Do your OWN independent analysis — find ALL bugs and issues
4. Focus on: logic errors, missing error handling, i18n issues, UI/UX for mobile-first, React anti-patterns
5. For each finding: [P0/P1/P2/P3] Title - Description. FIX: description of code change needed.
6. Write your findings to: pipeline/chain-state/partnersettings-260321-235750-cc-findings.md
7. Do NOT apply any fixes yet — only document findings

FORMAT for findings file:
# CC Writer Findings — PartnerSettings
Chain: partnersettings-260321-235750

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
