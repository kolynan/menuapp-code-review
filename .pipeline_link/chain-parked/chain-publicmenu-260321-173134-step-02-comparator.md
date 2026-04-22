---
chain: publicmenu-260321-173134
chain_step: 2
chain_total: 3
chain_step_name: comparator
page: PublicMenu
budget: 4.00
runner: cc
type: chain-step
---
=== CHAIN STEP: Comparator (2/3) ===
Chain: publicmenu-260321-173134
Page: PublicMenu

You are the Comparator in a modular consensus pipeline.
Your job: compare CC Writer and Codex Writer findings and produce a merge plan.

INSTRUCTIONS:
1. Read CC findings: pipeline/chain-state/publicmenu-260321-173134-cc-findings.md
2. Read Codex findings: pipeline/chain-state/publicmenu-260321-173134-codex-findings.md
3. Compare both analyses and categorize:

Write comparison to: pipeline/chain-state/publicmenu-260321-173134-comparison.md

FORMAT:
# Comparison Report — PublicMenu
Chain: publicmenu-260321-173134

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
# PM-062: Category chips — active chip color indigo → terracotta [L]

Reference: `STYLE_GUIDE.md` v3.2, `BUGS_MASTER.md`, `ux-concepts/UX_LOCKED_PublicMenu.md`.

---

## Fix 1 — PM-062 (P3) [MUST-FIX]: Active category chip still indigo

### Сейчас (текущее поведение)
Активный чип категории («Все», «Блюдо дня», «Основные блюда» и т.д.) отображается с фоном `bg-indigo-600` (`rgb(79, 70, 229)`) и белым текстом.

Скриншот подтверждён: S153 (Batch A+5 TC-1 ❌), S155A (Batch 4 TC-1 ❌).
CSS-класс кнопки: `snap-start flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-all bg-indigo-600 text-white`.

### Должно быть (ожидаемое поведение)
Активный чип → терракотовый фон `#B5543A` (`rgb(181, 84, 58)`), белый текст.
Неактивные чипы → белый/серый фон, серый текст, без изменений.

Ref: STYLE_GUIDE.md v3.2 (primary color = `#B5543A`).

### НЕ должно быть (анти-паттерны)
- Никаких `indigo`, `purple`, `violet` цветов на чипах категорий.
- НЕ менять структуру чипов, их порядок, scroll-поведение, snap-поведение.
- НЕ менять неактивные чипы — только active state.

### Файл и локация
Проблема в рендере category chips внутри `x.jsx` (главный файл PublicMenu).

Искать: компонент/секцию, которая рендерит `<button>` для категорий (Все, Блюдо дня, и т.д.).
Текущий active-класс содержит `bg-indigo-600 text-white` — заменить на inline style или Tailwind-эквивалент:
```
style={{ backgroundColor: '#B5543A', color: 'white' }}
```
или:
```
className="... bg-[#B5543A] text-white ..."
```

⚠️ **ВАЖНО:** Tailwind custom colors `bg-[#B5543A]` работают в B44 (проверено: таб «В зале» = `rgb(181, 84, 58)` через `bg-[#B5543A]`). Предпочтительнее `bg-[#B5543A]` чем inline style.

Также проверить: если есть prop `activeColor` или `activeClassName` — использовать его корректно.
Если `activeColor` передаётся но игнорируется — найти где игнорируется и применить.

### Уже пробовали
1. Batch 2+3 (chain 260321-093745): КС пометил «architectural» → SKIPPED.
2. Batch A+5 (chain 260321-110752): КС передал `activeColor` prop, но компонент CategoryChips его проигнорировал → partial. KB-077.
3. Batch 4 (chain 260321-140331): задача не включала PM-062 явно (фокус на PM-064).

**Урок KB-077:** расплывчатое описание «chips indigo» не помогает. Точная инструкция: найти `bg-indigo-600` в условном классе active-чипа и заменить на `bg-[#B5543A]`.

### Проверка (мини тест-кейс)
1. Открыть `/x?partner=69540a85f2492cff3e46a283&mode=hall&lang=RU`
2. Смотреть чип «Все» (активный по умолчанию) → фон = терракота (#B5543A)
3. Нажать «Блюдо дня» → этот чип = терракота, «Все» = белый/серый
4. JS проверка: `getComputedStyle(activeChip).backgroundColor` === `rgb(181, 84, 58)`

---

## ⛔ SCOPE LOCK — менять ТОЛЬКО то, что указано выше
- Изменяй ТОЛЬКО цвет active-состояния category chips.
- ВСЁ остальное (табы В зале/Самовывоз/Доставка, карточки блюд, drawer, stepper, Bottom Sheet) — НЕ ТРОГАТЬ.
- Если видишь «проблему» не из этой задачи — ПРОПУСТИ, не чини.
- Locked UX decisions: см. `ux-concepts/UX_LOCKED_PublicMenu.md` — ЗАПРЕЩЕНО менять.

## Prompt Clarity
_(заполняется CC/Codex writer после выполнения)_

## Implementation Notes
- Файл: `x.jsx` (category chips рендерятся в основном файле, не в ModeTabs)
- НЕ ломать: PM-063 (stepper), PM-041 (polling), PM-071 (BS trigger если уже применён)
- Ref: STYLE_GUIDE.md v3.2 (primary = #B5543A)
- git add pages/PublicMenu/base/x.jsx && git commit -m "PM-062: active chip bg-indigo-600 → bg-[#B5543A] terracotta" && git push
=== END ===
