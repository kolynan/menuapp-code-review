# Screenshots — StaffOrdersMobile

## Структура

- `current/` — актуальные скриншоты страницы (заменяются при деплое новой версии)
- `versions/` — архив скриншотов по дате: `YYMMDD_som_[описание].png`

## Конвенция именования

`current/` — простые имена без даты:
- `som_table-list.png` — список столов
- `som_table-expanded.png` — раскрытый стол
- `som_table-счёт.png` — секция СЧЁТ
- `som_table-счёт-expanded.png` — СЧЁТ развёрнут

`versions/` — с датой:
- `260407_som_table-list.png`

## При деплое новой версии

1. Переместить текущие скрины из `current/` в `versions/` (переименовать с датой)
2. Положить новые скрины в `current/`
