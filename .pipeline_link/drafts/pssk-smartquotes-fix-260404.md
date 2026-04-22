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

После коммита — задеплоить в B44 и опубликовать проект.
