---
task: i18n-fallback-publicmenu-s97
type: bugfix
budget: "$10"
priority: P1
page: PublicMenu
---

# Задача: i18n Fallback — убрать raw keys из PublicMenu (/x)

## Контекст

На публичном меню (`/x`) при переключении языка (особенно KK) видны raw i18n keys вместо переведённого текста. Например: `order.status.new`, `loyalty.points`, и подобные. Это критический UX-баг — гость видит техническую строку вместо человеческого текста.

**Корневая причина:** нет fallback-механизма. Если ключ перевода отсутствует для выбранного языка — показывается сам ключ.

## Что нужно сделать

### 1. Fallback chain
Реализовать fallback в функции `t()` (или wrapper):
- Сначала ищем перевод на **выбранном языке** (RU / EN / KK)
- Если нет → ищем на **EN** (English как fallback)
- Если нет EN → показываем **последнее значение** из любого языка
- Если ничего нет → **НЕ показывать raw key**. Вместо этого — пустая строка или generic text

### 2. Сканировать и исправить
- Открыть `x.jsx` и найти все вызовы `t("...")`
- Проверить какие ключи существуют в translations, какие — нет
- Для отсутствующих — добавить fallback через wrapper или hardcoded default

### 3. Reference: список ключей
Полный список i18n ключей для PublicMenu → файл `ux-concepts/COPY_SPEC.md` v1.0 (60 ключей с RU/EN/KK переводами). Использовать как справочник для добавления недостающих.

Дополнительный файл: `outputs/i18n-missing-keys-import.json` (51 ключ из S92).

## UI-спека

**До фикса:**
```
Кнопка: "cta.send_order"
Статус: "orderprocess.default.new"
```

**После фикса:**
```
Кнопка: "Отправить официанту"
Статус: "Новый"
```

## Acceptance criteria

- [ ] На RU: 0 видимых raw i18n keys на всех экранах /x
- [ ] На EN: 0 видимых raw i18n keys
- [ ] На KK: допускается EN fallback, но НЕ raw keys
- [ ] Переключение языка не ломает layout
- [ ] Draft не теряется при смене языка
- [ ] Core flow (добавить → drawer → отправить) работает на всех 3 языках

## Файлы

- **Основной:** `pages/PublicMenu/base/x.jsx`
- **Справочник ключей:** `ux-concepts/COPY_SPEC.md` (OneDrive, скопировать в repo если нужно)
- **Ранее найденные ключи:** `outputs/i18n-missing-keys-import.json`

## Git

```bash
git add -A && git commit -m "fix: i18n fallback for PublicMenu - no raw keys (S97)" && git push
```
