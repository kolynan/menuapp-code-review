---
chain: scripts-260413-232717-abee
chain_step: 2
chain_total: 4
chain_step_name: comparator
page: scripts
budget: 6.00
runner: cc
type: chain-step
---
=== CHAIN STEP: Comparator (2/4) ===
Chain: scripts-260413-232717-abee
Page: scripts

You are the Comparator in a modular consensus pipeline.
Your job: compare CC Writer and Codex Writer findings and produce a merge plan.

INSTRUCTIONS:
1. Read CC findings: pipeline/chain-state/scripts-260413-232717-abee-cc-findings.md
   - If NOT found there, try: `git pull --rebase` then check again
   - If still not found, search for any *-cc-findings.md in pipeline/chain-state/
2. Read Codex findings: pipeline/chain-state/scripts-260413-232717-abee-codex-findings.md
   - If NOT found there, search in pages/scripts/review_*.md (Codex sometimes writes here)
   - If still not found, search for any *-codex-findings.md in pipeline/chain-state/
3. Compare both analyses and categorize:

Write comparison to: pipeline/chain-state/scripts-260413-232717-abee-comparison.md

FORMAT:
# Comparison Report — scripts
Chain: scripts-260413-232717-abee

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
# WS-INFRA: Port chain_template support from v3.py to multi.py

Цель: сделать `task-watcher-multi.py` единым ВЧР, который поддерживает:
1. Параллельный запуск простых задач (уже работает в v4.0).
2. Развёртку `chain_template` из frontmatter в N параллельных/последовательных шагов (сейчас только в v3.py).

После этой задачи `task-watcher-v3.py` можно будет депрекейтить. KB-136 закрывается.

**Reference:**
- `scripts/task-watcher-v3.py` — источник логики (функции ниже).
- `scripts/task-watcher-multi.py` — целевой файл (v4.0, 1530 строк).
- `pipeline/chains/*.yaml` — шаблоны цепочек (pssk-review, consensus-with-discussion-v2, discussion-cc-codex).
- `pipeline/steps/*.md` — шаблоны шагов (pssk-cc-reviewer, pssk-codex-reviewer и т.д.).
- `KNOWLEDGE_BASE_VSC.md` KB-136 (multi.py не умеет chain_template), KB-137 (inline source → WinError 206).

---

## Fix 1 — INFRA-001 (P0) [MUST-FIX]: Port chain expansion functions

### Сейчас (текущее поведение)
`task-watcher-multi.py` при обработке файла задачи в `pipeline/queue/` идёт напрямую в `run_task()` (строка 1168) и запускает CC с телом файла как промпт. Frontmatter-поле `chain_template` игнорируется. Результат: ПССК-задача с `chain_template: pssk-review` выполняется как одиночная CC-задача, Codex не участвует.

### Должно быть (ожидаемое поведение)
При появлении файла с `chain_template` в frontmatter multi.py:
1. Читает YAML шаблон из `pipeline/chains/{chain_template}.yaml`.
2. Разворачивает в N подзадач (по числу `steps:` в шаблоне).
3. Подзадачи одной `group:` запускаются параллельно, разные группы — последовательно.
4. Каждая подзадача использует свой агент (claude/codex) согласно `agent:` поля шага.
5. Шаблоны шагов читаются из `pipeline/steps/{step_name}.md`.
6. Плейсхолдеры `{{TASK_BODY}}`, `(source file not found — reviewer may need to read from disk)`, `{{PAGE}}` заменяются.
7. ТГ уведомления явно показывают `[chain_template]` и имя шага (например `[pssk-review] pssk-cc-reviewer`).

Ref: `task-watcher-v3.py` функции `maybe_expand_chain` (~line 2044), `expand_chain_to_tasks` (1851), `load_step_template` (1763), `resolve_inline_source` (1811), `build_chain_step_prompt` (594).

### НЕ должно быть (анти-паттерны)
- НЕ ломать существующий параллельный запуск простых задач (v4.0 логика).
- НЕ дублировать v3.py целиком — портируем ТОЛЬКО функции expansion.
- НЕ менять формат frontmatter задач — совместимость с текущими `.md` файлами.
- НЕ менять формат chains YAML / steps MD.
- НЕ вводить новые зависимости (pip пакеты).
- НЕ удалять `task-watcher-v3.py` в этой задаче (депрекейт — отдельно).

### Файл и локация
Основной: `scripts/task-watcher-multi.py`.
Источник: `scripts/task-watcher-v3.py` (функции: `maybe_expand_chain`, `expand_chain_to_tasks`, `load_step_template`, `resolve_inline_source`, `build_chain_step_prompt`).

Точка интеграции: в `run_task()` multi.py (line 1168) ДО запуска CC — проверить frontmatter на `chain_template`, если есть → развернуть в подзадачи и запустить их вместо одиночного CC.

### Уже пробовали (если применимо)
S263 (текущая сессия): попытка прогнать ПССК CartView через multi.py → Codex не запустился, chain не развернулся. KB-136 зафиксирован. Попытка 2: запустили эту же задачу через multi.py — снова Codex skipped. Попытка 3: v3.py подхватил пустой файл (sandbox glitch при awk/tail) — промпт был пустой. Текущая попытка (v2): файл создан через Write-тул.

### Проверка (мини тест-кейс)
1. Взять существующий файл `pipeline/queue/staged/pssk-cartview-cv-a-v4.md` (frontmatter `chain_template: pssk-review`).
2. Переместить в `pipeline/queue/`.
3. Запустить `python scripts/task-watcher-multi.py`.
4. Ожидаем в ТГ: 2 параллельных уведомления `[pssk-review] pssk-cc-reviewer` и `[pssk-review] pssk-codex-reviewer`.
5. В `pipeline/results/` появляются оба результата (CC и Codex).
6. Простая задача без `chain_template` в queue продолжает работать как раньше (smoke-тест на `test-simple.md`).

---

## Fix 2 — INFRA-002 (P1) [MUST-FIX]: ТГ уведомления для chain-шагов

### Сейчас
ТГ показывает `[CartView] ПССК...` — не понятно, это chain или простая задача, какой шаг выполняется.

### Должно быть
Для chain-шагов ТГ заголовок содержит:
- Имя chain (`pssk-review`, `consensus-with-discussion-v2`).
- Имя шага (`pssk-cc-reviewer`, `discuss-cc`).
- Агент (CC или Codex).
- Номер шага / общее (`Step 1/2`).

Формат: `[pssk-review] Step 1/2 pssk-cc-reviewer (CC) — CartView`.

### НЕ должно быть
- Не ломать формат ТГ для простых задач (обратная совместимость).
- Не добавлять ТГ-спам (одно сообщение на шаг, не на каждый прогресс-апдейт).

### Файл и локация
`scripts/task-watcher-multi.py` — функция отправки ТГ (найти существующую, не создавать параллельную).

### Проверка
1. Запустить ПССК CartView → в ТГ должно быть 2 сообщения с явным `[pssk-review]` и именем шага.
2. Запустить простую задачу → формат ТГ как раньше.

---

## Fix 3 — INFRA-003 (P1) [MUST-FIX]: Сохранить фикс WinError 206 из v3.py

### Сейчас
v3.py передаёт большие промпты через tmpfile и `-p [CONTENT]`. Если промпт +inline source > 8191 символов → Windows CreateProcess падает (WinError 206, KB-137).

### Должно быть
multi.py при порте должен унаследовать стратегию v3.py:
- `(source file not found — reviewer may need to read from disk)` резолвится из `pages/{page}/*.jsx` (последний по имени RELEASE файл).
- Null bytes из source вычищаются (`raw.replace(b'\x00', b'')`).
- При размере промпта >7KB использовать tmpfile + `--prompt-file` (если CC CLI поддерживает) ИЛИ chunking. Проверить текущую реализацию v3.py.

### НЕ должно быть
- НЕ передавать 80KB промпт как `-p [TEXT]` argv (WinError 206).

### Файл и локация
`scripts/task-watcher-multi.py` — функция `build_claude_command` (или эквивалент). Источник: `task-watcher-v3.py` line 725-734.

### Проверка
Запустить ПССК CartView с реальным 20KB промптом + inline source → не должно быть WinError 206.

---

## Fix 4 — INFRA-004 (P2) [MUST-FIX]: Документация и KB

### Сейчас
KB-136 говорит «multi.py не поддерживает chain_template». После фикса — устарело.

### Должно быть
- Обновить `KNOWLEDGE_BASE_VSC.md`: KB-136 → статус RESOLVED, ссылка на эту задачу.
- Добавить комментарий в `scripts/task-watcher-multi.py` в начале файла: «v5.0 — chain_template support ported from v3.py (INFRA-001)».
- В `CLAUDE.md` команды блок: сделать multi.py основным ВЧР (КС MULTI → КС).
- `task-watcher-v3.py` пометить как DEPRECATED в хедере файла (но НЕ удалять).

### НЕ должно быть
- НЕ удалять v3.py.
- НЕ менять формат chains/steps.

### Файл и локация
`KNOWLEDGE_BASE_VSC.md`, `scripts/task-watcher-multi.py` (header), `scripts/task-watcher-v3.py` (header), `CLAUDE.md` (блок команд).

### Проверка
- `grep "DEPRECATED" scripts/task-watcher-v3.py` → match.
- `grep "chain_template" scripts/task-watcher-multi.py` → match (функции присутствуют).
- KB-136 обновлён.

---

## ⛔ SCOPE LOCK — менять ТОЛЬКО то, что указано выше
- Изменяй ТОЛЬКО код из Fix-секций.
- ВСЁ остальное — НЕ ТРОГАТЬ.
- Если видишь «проблему» не из задачи — ПРОПУСТИ, запиши в новую задачу backlog.
- НЕ рефакторь v3.py. НЕ трогай другие скрипты в `scripts/`.
- НЕ меняй формат pipeline/chains/*.yaml или pipeline/steps/*.md.

## Implementation Notes

**Стратегия портирования:**
1. Скопировать 5 функций из v3.py в multi.py (с минимальными изменениями под архитектуру multi.py).
2. В `run_task()` multi.py (line 1168) — добавить проверку `chain_template` в начале, ветка: если есть → `expand_chain_to_tasks()` → параллельный запуск подзадач; если нет → существующая логика.
3. Сохранить всю логику `(source file not found — reviewer may need to read from disk)` и tmpfile для больших промптов.
4. ТГ: переиспользовать существующую функцию multi.py, добавить параметр `chain_name`, `step_name`, `step_num`, `total_steps`.

**Файлы:**
- `scripts/task-watcher-multi.py` (главное изменение)
- `scripts/task-watcher-v3.py` (только header DEPRECATED)
- `KNOWLEDGE_BASE_VSC.md` (KB-136 статус)
- `CLAUDE.md` (блок команд — КС MULTI → КС)

**НЕ ломать:**
- Параллельный запуск простых задач (v4.0 логика).
- Lock-файлы (S260, #291+#292).
- TG уведомления для простых задач.

**git commit после каждого Fix:**
- `git add -A && git commit -m "INFRA-001: port chain expansion to multi.py"`
- Финальный: `git commit -m "RELEASE 260413-XX multi.py v5.0 chain_template support"`

**Тест-план (после применения):**
1. Smoke: простая задача `test.md` → работает как в v4.0.
2. Chain: ПССК `pssk-cartview-cv-a-v4.md` → 2 параллельных шага (CC+Codex), оба результата в `pipeline/results/`.
3. ТГ: явно `[pssk-review] Step 1/2 pssk-cc-reviewer (CC)`.
4. Регресс: lock-файл создаётся (`ws: WS-INFRA`).
=== END ===
