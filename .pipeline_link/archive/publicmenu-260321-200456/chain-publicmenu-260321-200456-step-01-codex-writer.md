---
chain: publicmenu-260321-200456
chain_step: 1
chain_total: 4
chain_step_name: codex-writer
chain_group: writers
chain_group_size: 2
page: PublicMenu
budget: 10.00
runner: codex
type: chain-step
---
Review the file pages/PublicMenu/base/*.jsx for bugs in a React restaurant QR-menu app on Base44 platform.
Also check pages/PublicMenu/README.md and pages/PublicMenu/BUGS.md for context (ONLY these 3 files, nothing else).

SPEED RULES — this is a time-sensitive pipeline step:
- Read ONLY the 3 files above. Do NOT search the repo, do NOT read old findings, do NOT read files outside pages/PublicMenu/.
- Do NOT run rg/grep across the whole repo. Do NOT cross-reference with other pages.
- Limit analysis to the target page code. Be concise.

Find ALL bugs. Focus on: logic errors, missing error handling, i18n issues, UI/UX for mobile-first, React anti-patterns.

For each finding: [P0/P1/P2/P3] Title - Description. FIX: code change needed.

Write findings to: pipeline/chain-state/publicmenu-260321-200456-codex-findings.md

FORMAT:
# Codex Writer Findings — PublicMenu
Chain: publicmenu-260321-200456

## Findings
1. [P0] Title — Description. FIX: ...
2. [P1] Title — Description. FIX: ...

## Summary
Total: N findings (X P0, Y P1, Z P2, W P3)

## Prompt Clarity
Rate the task description quality (1-5). For any score below 4, explain what was unclear:
- Overall clarity: [1-5]
- Ambiguous Fix descriptions (list Fix # and what was unclear): ...
- Missing context (what info would have helped): ...
- Scope questions (anything you weren't sure if it's in scope): ...

Do NOT apply fixes — only document findings.

=== TASK CONTEXT ===
# PM-062: Category chips — active chip color indigo → terracotta [L] (Production page)

Reference: `STYLE_GUIDE.md` v3.2, `BUGS_MASTER.md`, `ux-concepts/UX_LOCKED_PublicMenu.md`.

⚠️ Production page: PublicMenu — боевая страница. Приоритеты расставлять как P3 (UX/visual fix).

---

## Fix 1 — PM-062 (P3) [MUST-FIX]: Active category chip still indigo

### Сейчас (текущее поведение)
Активный чип категории («Все», «Блюдо дня», «Основные блюда» и т.д.) отображается с фоном `bg-indigo-600` = `rgb(79, 70, 229)` и белым текстом.

Проверено JavaScript: `getComputedStyle(activeChip).backgroundColor` = `rgb(79, 70, 229)`.
CSS класс кнопки активного чипа содержит: `bg-indigo-600 text-white`.
Подтверждено тестами: S153 TC-1 ❌, S155A TC-1 ❌ (3 батча подряд не починен).

### Должно быть (ожидаемое поведение)
Активный чип категории → терракотовый фон `#B5543A` = `rgb(181, 84, 58)`, белый текст.
Неактивные чипы → белый/серый фон, серый текст — БЕЗ ИЗМЕНЕНИЙ.

Ref: STYLE_GUIDE.md v3.2 (primary color = `#B5543A`). Таб «В зале» уже использует `#B5543A` правильно — чипы должны быть такими же.

### НЕ должно быть (анти-паттерны)
- Никаких `indigo`, `purple`, `violet` у активного чипа.
- НЕ менять неактивные чипы — только active state.
- НЕ менять структуру, scroll, порядок чипов.
- НЕ использовать CSS-переменную `var(--color-primary)` — она пустая в B44. Использовать hardcoded `#B5543A` или `bg-[#B5543A]`.

### Файл и локация
Файл: `x.jsx` (`pages/PublicMenu/base/x.jsx`) — category chips рендерятся здесь.

Найти: рендер кнопок категорий (Все, Блюдо дня, Основные блюда...).
Активный чип определяется условием типа `isActive ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600'`.

Замена:
```
// было:
isActive ? 'bg-indigo-600 text-white' : '...'
// стало:
isActive ? 'bg-[#B5543A] text-white' : '...'
```

Или через inline style:
```
style={isActive ? { backgroundColor: '#B5543A', color: 'white' } : {}}
```

⚠️ `bg-[#B5543A]` работает в B44 (проверено: таб «В зале» использует именно его).

### Уже пробовали
1. Batch 2+3 (chain 260321-093745): пометили «architectural» → SKIPPED.
2. Batch A+5 (chain 260321-110752): передали `activeColor` prop в ModeTabs.jsx, но CategoryChips в `x.jsx` этот prop проигнорировал → partial. KB-077.
3. Batch 4 (chain 260321-140331): PM-062 не входил в задачу явно.

⚠️ KB-077: именно из-за расплывчатого описания пропущен 3 раза. Эта задача указывает точное место и замену.

### Проверка (мини тест-кейс)
1. Открыть `/x?partner=69540a85f2492cff3e46a283&mode=hall&lang=RU`
2. Чип «Все» (активный по умолчанию) → фон терракота `rgb(181, 84, 58)`
3. Нажать «Блюдо дня» → этот чип терракота, «Все» → серый/белый
4. JS: `getComputedStyle(activeChip).backgroundColor === 'rgb(181, 84, 58)'`

---

## ⛔ SCOPE LOCK — менять ТОЛЬКО то, что указано выше
- Изменяй ТОЛЬКО цвет active-состояния category chips в `x.jsx`.
- ВСЁ остальное (табы В зале/Самовывоз/Доставка, карточки блюд, drawer, stepper, Bottom Sheet) — НЕ ТРОГАТЬ.
- Если видишь «проблему» не из этой задачи — ПРОПУСТИ, не чини.
- Locked UX decisions: `ux-concepts/UX_LOCKED_PublicMenu.md` — ЗАПРЕЩЕНО менять.

## Prompt Clarity
_(заполняется CC/Codex writer после выполнения: оценка 1-5 + что было неясно)_

## Implementation Notes
- Файл: `x.jsx` (один файл, одна замена)
- НЕ ломать: PM-063 (stepper), PM-041 (polling), PM-071 (BS trigger)
- Не использовать CSS-переменные (пустые в B44) — только `bg-[#B5543A]` или inline style
- git add pages/PublicMenu/base/x.jsx && git commit -m "PM-062: active chip bg-indigo-600 → bg-[#B5543A] terracotta" && git push
=== END ===
