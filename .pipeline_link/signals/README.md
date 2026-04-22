# pipeline/signals/ — WS Lock Files

Папка для lock-файлов параллельных сессий (ПС/КВ).

## Конвенция

**Создать lock при старте работы над вркс:**
```
pipeline/signals/lock-WS-SOM.md
pipeline/signals/lock-WS-SOS.md
pipeline/signals/lock-WS-CV.md
```

**Удалить lock при завершении:**
```bash
rm "pipeline/signals/lock-WS-SOM.md"
```

## Формат lock-файла

```markdown
ws: WS-SOM
session: S254
type: UX   # UX | KS | TEST | INFRA
scope: staffordersmobile.jsx
started: 2026-04-10
task: #288 КС collapsed card
```

## Правила

- КВ: при рекомендации параллельных задач → проверить `ls pipeline/signals/lock-*.md`
- Если lock существует → НЕ предлагать конфликтующие задачи по этому вркс
- ПС: ПЕРВОЕ действие после старта = создать lock. ПОСЛЕДНЕЕ перед закрытием = удалить lock
- Если ПС упала и lock остался → Arman удаляет вручную или КВ проверяет дату

## Проверка конфликтов

Перед рекомендацией батча — КВ читает signals/:
```bash
ls pipeline/signals/lock-*.md 2>/dev/null
```
Если файл есть → заблокированный вркс нельзя трогать параллельно.
