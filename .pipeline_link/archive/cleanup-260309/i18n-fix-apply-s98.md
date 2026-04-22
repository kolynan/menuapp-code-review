---
task: i18n-fix-apply-s98
type: bugfix
budget: "$12"
priority: P1
page: PublicMenu
---

# Задача: Применить i18n Fallback фиксы в PublicMenu

## Контекст

Предыдущий CC-анализ (task-260307-204052, $3.61) нашёл 5 багов и подробно описал решение, но фиксы НЕ были закоммичены (worktree очистился). Нужно **повторно применить** эти фиксы.

## CC-анализ (из предыдущей задачи)

**Найденные баги:**

1. **[P1] i18n fallback chain missing** — все t() вызовы в x.jsx и child components возвращают raw ключи, когда перевод отсутствует. Нужен `I18N_FALLBACKS` map (90+ ключей с RU fallbacks) и `makeSafeT()` wrapper.

2. **[P1] Hardcoded || fallback pattern** — 7 мест в x.jsx используют `t('key') || 'hardcoded text'` — нарушает i18n правила, не обрабатывает KK→EN fallback chain. Убрать все `||` паттерны, т.к. makeSafeT обрабатывает fallbacks централизованно.

3. **[P2] Hardcoded || fallback в MenuView.jsx** — 3 места с `t('key') || 'text'` (menu.remove, menu.tile, menu.list). Убрать, т.к. parent передаёт wrapped t.

4. **[P2] Hardcoded DrawerTitle** — строка ~3059 содержит `"Koрзина"` вместо `t('cart.title')`. Исправить на i18n ключ с fallback в map.

5. **[P1] Child component keys missing** — CheckoutView.jsx использует 14 t() ключей, MenuView.jsx использует 6 ключей без fallback coverage. Добавить все в I18N_FALLBACKS map.

## Решение (повторить предыдущий подход CC)

### 1. Создать `I18N_FALLBACKS` map в x.jsx
Map из 90+ ключей с RU fallback текстом. Покрыть ВСЕ ключи из x.jsx + MenuView + CheckoutView + CartView.

### 2. Создать `makeSafeT(rawT)` функция-wrapper
Перехватывает t() возвраты, детектит raw key passthrough, подставляет fallback из map. Поддерживает `{param}` интерполяцию.

### 3. Обернуть в X() компоненте
`const t = makeSafeT(rawT)` — все child компоненты получающие t как prop автоматически получают safe behavior.

### 4. Убрать 10+ `|| 'hardcoded'` паттернов
В x.jsx (7 мест) и MenuView.jsx (3 места).

### 5. Починить DrawerTitle
Hardcoded "Корзина" → t('cart.title') с fallback в map.

## Reference: i18n ключи
- `ux-concepts/COPY_SPEC.md` — ~60 ключей RU/EN/KK
- `outputs/i18n-missing-keys-import.json` — 51 ключ из S92

## ВАЖНО: Line endings
Рабочие файлы имеют CRLF (Windows), git хранит LF. Перед коммитом:
```bash
# Step 0: Fix line endings FIRST
git checkout -- pages/PublicMenu/base/x.jsx pages/PublicMenu/base/MenuView.jsx pages/PublicMenu/base/CheckoutView.jsx pages/PublicMenu/base/CartView.jsx
# This restores LF from git, then make your edits
```
Коммитить ТОЛЬКО файлы PublicMenu, НЕ делать `git add .` — иначе line-ending мусор попадёт в коммит.

## Файлы для редактирования
- `pages/PublicMenu/base/x.jsx` — основной файл (I18N_FALLBACKS + makeSafeT + cleanup)
- `pages/PublicMenu/base/MenuView.jsx` — убрать || patterns
- `pages/PublicMenu/base/CheckoutView.jsx` — проверить t() coverage
- `pages/PublicMenu/base/CartView.jsx` — проверить t() coverage

## Acceptance criteria
- [ ] 0 raw i18n keys на RU
- [ ] 0 raw i18n keys на EN
- [ ] KK допускает EN/RU fallback, но НЕ raw keys
- [ ] Все `|| 'hardcoded'` patterns убраны
- [ ] makeSafeT wrapper работает с {param} интерполяцией
- [ ] Git commit ТОЛЬКО PublicMenu файлов (не весь repo)
- [ ] RELEASE файл создан: `260307-01 x RELEASE.jsx`

## Git workflow
```bash
git add -A && git commit -m "pre-review i18n-fix-apply-s98" && git push
# ... make fixes ...
git add pages/PublicMenu/base/x.jsx pages/PublicMenu/base/MenuView.jsx pages/PublicMenu/base/CheckoutView.jsx pages/PublicMenu/base/CartView.jsx pages/PublicMenu/BUGS.md pages/PublicMenu/README.md
git commit -m "fix: i18n fallback chain for PublicMenu — makeSafeT + 90 keys map"
git push
```
