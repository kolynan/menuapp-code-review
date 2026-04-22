---
chain: publicmenu-260404-221902-9b8a
chain_step: 1
chain_total: 1
chain_step_name: pssk-codex-reviewer
chain_group: reviewers
chain_group_size: 2
page: PublicMenu
budget: 5.00
runner: codex
type: chain-step
---
You are a Codex code reviewer evaluating the QUALITY of a КС implementation prompt (NOT executing it).

A КС prompt is an instruction document for Claude Code + Codex pipeline to fix code in a React/Base44 app.
Your role: find issues with the PROMPT DESIGN that could cause the execution to fail, produce wrong results, or require clarification.

⛔ DO NOT: read code files, run any commands, make any code changes.
✅ DO: analyze only the prompt text provided below in TASK CONTEXT.

For each issue: [CRITICAL/MEDIUM/LOW] Title — Description. PROMPT FIX: what to change in the prompt.

Focus on:
- Incorrect code snippets in the prompt (wrong syntax, wrong function calls, wrong variable names)
- Missing edge cases the prompt doesn't cover
- Ambiguous instructions Codex might misinterpret
- Safety risks: will this cause unintended file changes?
- Missing context: what info would help Codex execute without hesitation?
- Fix order: are there dependencies between fixes that need explicit sequencing?
- Validation: are the post-fix verification steps sufficient?

Write your findings to: pipeline/chain-state/publicmenu-260404-221902-9b8a-codex-findings.md

FORMAT:
# Codex Reviewer Findings — ПССК Prompt Quality Review
Chain: publicmenu-260404-221902-9b8a

## Issues Found
1. [CRITICAL/MEDIUM/LOW] Title — Description. PROMPT FIX: ...
2. ...

## Summary
Total: N issues (X CRITICAL, Y MEDIUM, Z LOW)

## Additional Risks
Any risks the prompt author may not have considered.

## Prompt Clarity (MANDATORY — do NOT skip)
- Overall clarity: [1-5]
- What was most clear:
- What was ambiguous or could cause hesitation:
- Missing context:

Do NOT apply any fixes to code files. Analysis only.

=== TASK CONTEXT ===
You are reviewing the quality of a ССП implementation prompt for a React/Base44 app.
DO NOT execute the changes. DO NOT read code files. Only review the prompt quality.

Context: Replace typographic smart quotes (U+201C/U+201D) with ASCII double quotes in x.jsx I18N_FALLBACKS section (lines 327–584). B44 blocks publication with SyntaxError on every affected line.

Find issues with the PROMPT DESIGN:
1. Incorrect code snippets (wrong syntax, variable names)
2. Missing edge cases (encoding issues, file write safety)
3. Ambiguous instructions
4. Safety risks (unintended file changes, data loss)
5. Validation: are post-fix checks sufficient?

---

# Fix Smart Quotes in I18N_FALLBACKS — ССП Prompt

## Context
Файл: `pages/PublicMenu/x.jsx`
RELEASE: `260404-01 PublicMenu x RELEASE.jsx` (5215 строк)
Задача: Заменить типографические кавычки `"` (U+201C) и `"` (U+201D) на ASCII `"` (U+0022) в x.jsx
Причина: B44 не может опубликовать проект — SyntaxError на каждой строке I18N_FALLBACKS
Вес: Low (механическая замена символов) | ССП, не КС (KB-097/KB-113: string-replace на >4500 строк → ССП без merge шага)

## UX Reference
Страница: PublicMenu (x.jsx)
BACKLOG: #238 — задеплоить x.jsx commit 988368c + тест EN режим

## FROZEN UX (DO NOT CHANGE)
- Вся логика `makeSafeT`, `I18N_FALLBACKS`, `tr()` — только замена кавычек, не переписывать
- Все функции и компоненты страницы — не трогать
- `wc -l` результат должен быть ~5215 (не меняется при замене символов)

---

## Fix 1: Заменить smart quotes на ASCII double quotes

### Проблема
Пользователь видит: B44 не позволяет опубликовать проект — `SyntaxError: Invalid or unexpected token`
В объекте `I18N_FALLBACKS` (строки 327–584) использованы типографические кавычки:
- `"` (U+201C, LEFT DOUBLE QUOTATION MARK)
- `"` (U+201D, RIGHT DOUBLE QUOTATION MARK)

Эти символы появились при копировании EN текста через редактор с автозаменой.
JavaScript не распознаёт их как строковые разделители → SyntaxError.

**Данные проверки (реальный файл):**
- Smart quotes U+201C: 473 вхождения
- Smart quotes U+201D: 524 вхождения
- В строковых литералах: 957 вхождений → вызывают SyntaxError
- В комментариях: 40 вхождений → косметические (не ломают JS, но исправляем для чистоты)
- Итого: 997 замен

### Что менять

**Grep для верификации проблемы:**
```bash
python3 -c "
import sys
with open('pages/PublicMenu/x.jsx', 'r', encoding='utf-8') as f:
    content = f.read()
count = content.count('\u201c') + content.count('\u201d')
print(f'Smart quotes found: {count}')
"
```
Ожидаемый результат ДО фикса: ~997

**Команда замены:**
```python
with open('pages/PublicMenu/x.jsx', 'r', encoding='utf-8') as f:
    content = f.read()
content = content.replace('\u201c', '"').replace('\u201d', '"')
with open('pages/PublicMenu/x.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
```

### НЕ должно быть после фикса
- Smart quotes U+201C или U+201D в любом месте файла
- Изменений в логике, компонентах, импортах
- Изменений количества строк (должно остаться ~5215)

### Проверка
```bash
# 1. Smart quotes убраны
python3 -c "
with open('pages/PublicMenu/x.jsx', 'r', encoding='utf-8') as f:
    c = f.read()
print('Smart quotes remaining:', c.count('\u201c') + c.count('\u201d'))  # должно быть 0
"

# 2. Количество строк не изменилось
wc -l pages/PublicMenu/x.jsx  # ~5215

# 3. Синтаксис: ключ I18N_FALLBACKS на месте
grep -c '"status.new"' pages/PublicMenu/x.jsx  # должно быть >= 1
```

---

## Git commit

```bash
git add pages/PublicMenu/x.jsx
git commit -m "Fix smart quotes in I18N_FALLBACKS — replace U+201C/201D with ASCII quotes (KB-118)"
git push
```
=== END ===
