---
chain: scripts-260413-232717-abee
chain_step: 3
chain_total: 4
chain_step_name: discussion-cc-only
page: scripts
budget: 6.00
runner: cc
type: chain-step
---
=== CHAIN STEP: Discussion CC-Only (3/4) ===
Chain: scripts-260413-232717-abee
Page: scripts

You are the Discussion moderator in a modular consensus pipeline.
Your job: resolve disputes from the Comparator step using CC analysis ONLY (no Codex calls).

WHY CC-ONLY: Codex CLI calls in discussion cause 40+ minute delays due to sandbox FS timeouts
and slow model inference. CC resolves disputes equally well based on both sets of findings.
Fallback: if this approach proves insufficient, switch chain to `consensus-with-discussion`
which uses the original `discussion.md` step with Codex participation.

INSTRUCTIONS:

1. Read the comparison report: pipeline/chain-state/scripts-260413-232717-abee-comparison.md
2. Read BOTH findings files referenced in the comparison report to understand full context.
3. Look at the "Disputes" section.

IF there are 0 disputes:
   - Write to pipeline/chain-state/scripts-260413-232717-abee-discussion.md:
     # Discussion Report — scripts
     Chain: scripts-260413-232717-abee
     ## Result
     No disputes found. All items agreed or resolved by Comparator. Skipping discussion.
   - DONE. Exit immediately. Do NOT run any rounds.

IF there are 1+ disputes:
   For each dispute, write your analysis considering BOTH CC and Codex findings:

   a) Read the original code in the repository to understand the current implementation.
   b) Evaluate CC's proposed solution:
      - Correctness, edge cases, risks
   c) Evaluate Codex's proposed solution:
      - Correctness, edge cases, risks
   d) Pick the better solution OR propose a compromise, with clear reasoning.
   e) If neither solution is safe → mark as SKIP with explanation.

   IMPORTANT: Be fair. Do not automatically prefer CC's solution.
   Judge each dispute on technical merits only.

4. Write final discussion report to: pipeline/chain-state/scripts-260413-232717-abee-discussion.md

FORMAT:
# Discussion Report — scripts
Chain: scripts-260413-232717-abee
Mode: CC-Only (v2)

## Disputes Analyzed
Total: N disputes from Comparator

### Dispute 1: [title]
**CC Solution:** ...
**Codex Solution:** ...
**CC Analysis:** [technical reasoning comparing both]
**Verdict:** CC / Codex / Compromise / SKIP
**Reasoning:** [1-2 sentences why]

### Dispute 2: [title]
...

## Resolution Summary
| # | Dispute | Verdict | Reasoning |
|---|---------|---------|-----------|
| 1 | Title   | CC/Codex/Compromise/SKIP | Brief reason |

## Updated Fix Plan
Based on discussion results, provide the UPDATED fix plan that the Merge step should use.
Include ONLY the disputed items — agreed items from Comparator remain unchanged.
Format same as Comparator's "Final Fix Plan":
1. [P0] Fix title — Source: discussion-resolved — Description
2. ...

## Skipped (for Arman)
Items where neither solution is safe or where the dispute cannot be resolved technically.
Each item shows both positions and why neither is sufficient.

5. Do NOT apply any fixes — only document the discussion results

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
