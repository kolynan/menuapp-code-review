---
page: INFRA
code_file: scripts/task-watcher-multi.py
budget: 10
agent: cc+codex
chain_template: consensus-with-discussion-v2
ws: WS-INFRA
task_id: ks-task-watcher-start-msg-type-260414
---

**MANDATORY FIRST STEP — run this before anything else:**
```
git fetch origin 2>/dev/null; git reset --hard origin/main
```
Файл находится ВНЕ `menuapp-code-review/`. Абсолютный путь:
`C:/Users/ASUS/Dev/Menu AI Cowork/scripts/task-watcher-multi.py`

Использовать этот абсолютный путь для всех операций чтения/правки. `wc -l` (для sanity): ожидаем ~2813 строк. После правки diff должен быть ≤ 20 строк.

---

# task-watcher-multi.py: добавить Type (ПССК/КС) в start-message

## Context
Файл: `scripts/task-watcher-multi.py` (v5.0, ~2813 строк)
Причина: когда в TG приходит start-message о новой задаче, не видно тип задачи. Нужно по имени файла определять ПССК/КС и показывать строку `Type: ...` в стартовом сообщении.
Blocker: KB-136 (Cowork-mount устаревший) — поэтому правим через ВЧР pipeline, не напрямую Cowork.
Вес: S (мелкая правка форматирования) | Бюджет: $10 | Модель: С5v2

## Scope (строго одно изменение)

### Fix1 — Парсинг типа из имени файла + добавление строки в start-message
**Только стартовое сообщение (start-message / build_start_message / аналог).** НЕ трогать chain-updates, НЕ трогать progress-messages, НЕ трогать DONE-сообщения.

**Логика:**
```
name = task_file.name  # или эквивалент, как уже в коде
if name.startswith("pssk-"):
    type_label = "ПССК"
elif name.startswith("ks-"):
    type_label = "КС"
else:
    type_label = None  # строку Type не добавляем
```

**Формат:** если `type_label` не None — добавить в start-message строку:
```
Type: {type_label}
```
Место строки: сразу после строки с task_id / названием задачи, до описания firstStep / budget. Точное место — на усмотрение исполнителя, главное чтобы это было видно в начале сообщения.

Если код использует готовый builder/шаблон TG-сообщения — найти функцию, отвечающую за формирование start-message (grep по ключевым словам: `start`, `build_start_message`, `new session`, `НС`, `НОВАЯ`, и т.д.), и модифицировать ТОЛЬКО её.

## FROZEN (DO NOT CHANGE)
- Формат chain-update сообщений
- Формат progress-task-*.md файлов
- DONE-сообщения
- Логика запуска task-watcher-multi.py
- Парсинг frontmatter
- Любая логика, не связанная с форматированием start-message
- Файлы кроме `scripts/task-watcher-multi.py`

## Validation
1. `python -m py_compile "C:/Users/ASUS/Dev/Menu AI Cowork/scripts/task-watcher-multi.py"` — без ошибок
2. grep по изменённому участку: должна присутствовать проверка `startswith("pssk-")` и `startswith("ks-")`
3. Общее количество строк в файле: ±20 от исходных 2813
4. Ничего кроме функции формирования start-message не тронуто (diff review)

## Commit message
```
WS-INFRA: task-watcher-multi.py start-message — add Type (ПССК/КС)

Detects task type from filename prefix (pssk-/ks-) and adds
"Type: ПССК" or "Type: КС" line to start-message. No effect on
chain updates, progress or DONE messages.

Ref: S268 user request, KB-142
```
