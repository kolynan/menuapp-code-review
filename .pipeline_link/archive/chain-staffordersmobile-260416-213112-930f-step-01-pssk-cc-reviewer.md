---
chain: staffordersmobile-260416-213112-930f
chain_step: 1
chain_total: 1
chain_step_name: pssk-cc-reviewer
chain_group: reviewers
chain_group_size: 2
page: StaffOrdersMobile
budget: 10.00
runner: cc
type: chain-step
---
You are a CC code reviewer evaluating the QUALITY of a КС implementation prompt (NOT executing it).

A КС prompt is an instruction document for Claude Code + Codex pipeline to fix code in a React/Base44 app.
Your role: find issues with the PROMPT DESIGN that could cause the execution to fail, produce wrong results, or require clarification.

⛔ DO NOT: read code files, run any commands, make any code changes.
⛔ DO NOT: submit raw grep output or file dumps as your final answer — this will be treated as a failed review.
✅ DO: analyze only the prompt text provided below in TASK CONTEXT.
✅ MANDATORY: Your response MUST end with a "Fix Ratings" table rating each Fix N/5. No table = incomplete review.

For each issue: [CRITICAL/MEDIUM/LOW] Title — Description. PROMPT FIX: what to change in the prompt.

Focus on:
- Incorrect line numbers (check against current file if specified)
- Incorrect code snippets (wrong syntax, wrong function calls, wrong variable names)
- Missing edge cases the prompt doesn't cover
- Ambiguous instructions that could be misinterpreted
- Safety risks: will this cause unintended file changes?
- Missing context: what info would help CC execute without hesitation?
- Fix dependencies: are there ordering requirements between fixes?
- Validation steps: are they sufficient to catch regressions?
- New dictionary entries: are all additions justified and explained?

Write your findings to: pipeline/chain-state/staffordersmobile-260416-213112-930f-cc-findings.md

FORMAT:
# CC Reviewer Findings — ПССК Prompt Quality Review
Chain: staffordersmobile-260416-213112-930f

## Issues Found
1. [CRITICAL/MEDIUM/LOW] Title — Description. PROMPT FIX: ...
2. ...

## Line Number Verification
| Reference | Prompt says | Actual | Status |
|-----------|------------|--------|--------|
| ... | ... | ... | ✅/❌ |

## Fix-by-Fix Analysis
For each fix: SAFE / RISKY — brief reason.

## Summary
Total: N issues (X CRITICAL, Y MEDIUM, Z LOW)
Prompt clarity rating: [1-5]

## Prompt Clarity (MANDATORY — do NOT skip)
- Overall clarity: [1-5]
- What was most clear:
- What was ambiguous or could cause hesitation:
- Missing context:

## Fix Ratings (MANDATORY — ALWAYS include this section, even if no issues found)
Rate each Fix mentioned in the prompt. Scale: 1=Rewrite needed, 2=Major issues, 3=Needs clarification, 4=Minor issues, 5=Clear.

| Fix | Rating (1-5) | Verdict | Key issue (if any) |
|-----|-------------|---------|-------------------|
| Fix1 | X/5 | Clear / Needs clarification / Rewrite needed | ... |
| Fix2 | X/5 | ... | ... |
| Fix3 | X/5 | ... | ... |

Overall prompt verdict: APPROVED (all ≥4/5) / NEEDS REVISION (any <4/5)

Do NOT apply any fixes to code files. Analysis only.

=== TASK CONTEXT ===
# SOM Б2.1 — Fix BUG-SM-015: New Order on Closed Table (v7)

<!-- PC-VERDICT: GO (Cowork S304, 2026-04-16; v7 changes vs v6: CRITICAL path fix menuapp-code-review/pages/→pages/, Fix B.5 explicit old_string, staleTime:0 bullet removed from Fix A Should-NOT, ServiceRequest phantom-card comment, Safety Guards inline commit message) -->

## Context

**TARGET FILES (будут изменены):**
- `pages/StaffOrdersMobile/staffordersmobile.jsx` (4617 lines в HEAD, `260415-01 StaffOrdersMobile RELEASE.jsx` = 4617 lines — источник истины)

**CONTEXT FILES (только для чтения, не менять):**
- `components/sessionHelpers.js` (232 lines, v1.1 от S70) — содержит `getOrCreateSession`, `closeSession`
- `pages/PublicMenu/useTableSession.jsx` — guest-side session restore (НЕ менять)

**Задача:** Фикс BUG-SM-015 — при заказе гостем на ранее закрытый стол новая TableSession должна сразу отображаться как новая карточка в табе «Активные», а не сливаться с закрытой в «Завершённых».

**Бюджет:** $14 | **Шаблон:** `consensus-with-discussion-v2` (С5v2) | **Вес:** M (3 Fix, связанные) | **Модель:** claude-sonnet-4-5

**BACKLOG:** #BUG-SM-015 (P0), #347 (M — session-aware orderGroups)

---

## Root Cause (VERIFIED via code reading — не предположения)

Прочитал `260415-01 StaffOrdersMobile RELEASE.jsx` строки 3541-3908 + `components/sessionHelpers.js`:

1. **`openSessions` query** (строки 3541-3552) использует `queryKey: ["openSessions", partnerId]` + `staleTime: 30_000` — SOM не знает о новой TableSession до 30 секунд. [V5-C1]
2. **`orderGroups` useMemo** (строки 3768-3819) группирует hall-заказы по `tableId` один-к-одному через `tableGroups[tableId]` — старые закрытые и новые открытые заказы стола сливаются в ОДНУ карточку.
3. **`filteredGroups` / `tabCounts`** (3862-3908) определяет таб по `!!openSessionByTableId[group.id]`. Если сессия не обнаружена → группа идёт в «Завершённые», но когда сессия появится (после stale expire), ВСЯ объединённая карточка переедет в «Активные» — включая старые закрытые заказы.

**Sequence of the bug:**
- Официант закрывает стол → `closeSession(sessionId, tableId)` → TableSession.status = 'closed', все Orders = 'closed' (sessionHelpers.js:158-173).
- Гость заказывает → `getOrCreateSession` (sessionHelpers.js:69-88) видит, что `status: 'open'` сессий нет → создаёт НОВУЮ TableSession.
- Guest SDK создаёт новый Order с `table_session` = ID новой сессии.
- SOM в течение 30 сек не подхватывает новую сессию (staleTime). `orderGroups` группирует новый Order в тот же `tableGroups[tableId]` что и старые закрытые Orders. `openSessionByTableId[tableId]` = undefined → группа идёт в «Завершённые».
- После refetch (30 сек+) `openSessionByTableId[tableId]` обновится → вся карточка (новые + старые) переедет в «Активные».

**Цель фикса:** отделить Orders текущей открытой сессии от Orders закрытых сессий на уровне `orderGroups`, чтобы каждая сессия имела свою карточку с корректным табом.

---

## UX Reference

- Скриншоты: `pages/StaffOrdersMobile/screenshots/current/`
- BUGS: `pages/StaffOrdersMobile/BUGS.md` §BUG-SM-015
- Логика табов (SOM_Progress_S274 TL-01..TL-18): закрытая сессия в «Завершённых» остаётся visible, новая сессия создаёт отдельную запись в «Активных».

---

## FROZEN UX / FROZEN BEHAVIOR (НЕ МЕНЯТЬ)

**Список правил, которые ЗАПРЕЩЕНО нарушать любым Fix:**

- `effectivePollingInterval` (polling каждые 10-60с) — не трогать
- `closeSession` функция в `sessionHelpers.js` — НЕ менять (Б2 фикс, протестирован)
- `getOrCreateSession` в `sessionHelpers.js` — НЕ менять (guest-side логика)
- `handleCloseTableClick` useCallback (строки ~2164-2177) — НЕ менять контракт `onCloseTable(sessionId, identifier, tableId)`
- `confirmCloseTable` handler (~4183-4197) — НЕ менять флоу закрытия
- `activeOrders` status-фильтр (3593-3617) — НЕ трогать (closed/cancelled exclusion)
- `sortedStages`, `stagesMap`, `getStatusConfig` — НЕ менять
- `favorites` / `isFavorite` / `toggleFavorite` — привязка к `tableId`, НЕ менять контракт (фавориты должны выживать смену сессии — это желаемое поведение)
- `["servedOrders", group.id]` queryKey — оставить на `group.id` (это tableId; перенос закрытых served-заказов в новую карточку не нужен)
- OrderGroupCard рендер UI — НЕ менять, только пропсы
- Pickup/Delivery groups (`group.type !== 'table'`) — НЕ трогать, продолжают использовать `o.id` как группа
- Tab Стол (внутри карточки стола) — OUT OF SCOPE
- i18n ключи — НЕ добавлять
- `buildBannerInfo` (~строки 4079-4090) — НЕ менять (источник `banner.groupId` = tableId, потребляется `onNavigate`) [V5-L6]
- `onNavigate(banner.groupId)` call-site (~строка 2825) — НЕ менять; banner dispatcher передаёт чистый tableId [V5-L6]

**SCOPE LOCK:**
- ✅ Можно менять: `orderGroups` useMemo, `filteredGroups` useMemo, `tabCounts` useMemo, `openSessions` useQuery staleTime (только значение), `data-group-id` атрибут (только live JSX), `key={}` для OrderGroupCard, `handleToggleExpand` вызов, `handleBannerNavigate`, один новый useEffect (Fix C)
- ⛔ Запрещено менять: sessionHelpers.js, useTableSession.jsx, OrderGroupCard внутренности, Order/TableSession entities (B44), `queryKey: ["openSessions", partnerId]` массив (только `staleTime` внутри блока), любые другие useMemo/useQuery/useCallback за пределами перечисленных выше, i18n словари, другие страницы, `buildBannerInfo`, `onNavigate(banner.groupId)` call-site

---

## Preparation (выполнить ПЕРЕД Pre-flight) — [v3: C1, v4: L6 + M6, v5: L2 + M3]

Рабочая копия (working copy) может отставать от RELEASE-файла (HEAD на момент написания ПССК = 4617 строк, worktree может содержать более старую версию). Синхронизировать перед любыми правками:

```bash
# 0.0 [v5-L2] Защита от перезаписи несохранённых изменений: gate через git
#     Если working copy имеет uncommitted diff vs HEAD — STOP, спросить Arman.
if ! git diff --quiet -- pages/StaffOrdersMobile/staffordersmobile.jsx; then
  echo "STOP: working copy has uncommitted changes vs HEAD."
  echo "       Backup будет создан в .bak, но overwrite откладывается до подтверждения Arman."
  echo "       Выполни: git status + git diff ... и подтверди safe to overwrite."
  exit 1
fi

# 0.1 Backup working copy (всегда, даже если diff пустой — страховка)
if [ -f "pages/StaffOrdersMobile/staffordersmobile.jsx" ]; then
  cp "pages/StaffOrdersMobile/staffordersmobile.jsx" \
     "pages/StaffOrdersMobile/staffordersmobile.jsx.bak" 2>/dev/null || true
fi

# 1. Скопировать RELEASE → рабочую копию
cp "pages/StaffOrdersMobile/260415-01 StaffOrdersMobile RELEASE.jsx" \
   "pages/StaffOrdersMobile/staffordersmobile.jsx"
# Ожидание: команда завершается без ошибки, рабочая копия теперь = 4617 строк

# 2. Pre-check: определить origin `getLinkId` — это влияет на Fix C deps array
grep -n "^import.*getLinkId\|^const getLinkId\|^function getLinkId\|from.*getLinkId" \
     "pages/StaffOrdersMobile/staffordersmobile.jsx" | head -3
# Варианты:
#   - Import от components/... или @/... → `getLinkId` чистая, НЕ включать в Fix C useEffect deps.
#   - `const getLinkId = ...` внутри компонента → включить в deps ИЛИ обернуть useCallback.
#   - Не найдено → `getLinkId` объявлен где-то ещё; использовать `grep -rn "getLinkId" menuapp-code-review/` чтобы найти origin перед Fix C.
# Зафиксировать результат mental-flag → используется при применении Fix C deps.

# 3. [v5-M3] Pre-check: `queryClient` scope для Fix C.
#    Fix C использует `queryClient.invalidateQueries(...)` — переменная должна быть в scope
#    внутри компонента StaffOrdersMobile через `const queryClient = useQueryClient()`.
grep -n "useQueryClient\|const queryClient" \
     "pages/StaffOrdersMobile/staffordersmobile.jsx" | head -5
# Ожидание: как минимум 2 hits:
#   - `import { ..., useQueryClient } from '@tanstack/react-query'` (или similar path)
#   - `const queryClient = useQueryClient();` внутри компонента
# Если переменная названа иначе (например `qc`, `qClient`) → переименовать в Fix C код ниже.
# Если useQueryClient не импортирован → STOP, спросить Arman (архитектурное изменение scope).

# 4. [v5-L5] Pre-check: react import line — для Fix C (useRef)
grep -n "from 'react'" "pages/StaffOrdersMobile/staffordersmobile.jsx" | head -3
# Ожидание: 1 hit, формат либо одноlinear `import { useState, useEffect, ... } from 'react';`
# либо multi-line. Если multi-line (через запятую на несколько строк) → зафиксировать точную форму
# для Edit в Fix C (useRef может уже быть в списке или нужно добавить).
grep -c "useRef" "pages/StaffOrdersMobile/staffordersmobile.jsx"
# Ожидание: ≥1 (useRef уже импортирован) или 0 (нужно добавить в react import).
```

⚠️ Если RELEASE-файл не найден — STOP, сообщить Arman (deploy не завершён или файл в другом месте).

---

## Pre-flight (обязательные команды ДО правки)

```bash
# 1. Подтвердить размер файла
wc -l "pages/StaffOrdersMobile/staffordersmobile.jsx"
# Ожидание: 4617 +70/-35 (диапазон 4582-4687). [v5-M5: было «±35» что математически 4582-4652, теперь формула явная]

# 2. Подтвердить что RELEASE-файл совпадает с рабочей копией
diff -q "pages/StaffOrdersMobile/staffordersmobile.jsx" \
        "pages/StaffOrdersMobile/260415-01 StaffOrdersMobile RELEASE.jsx"
# Ожидание: пусто. Если diff НЕТРИВИАЛЬНЫЙ (не trailing newline) → STOP, спросить Arman.

# 3. Подтвердить ожидаемые строки для grep-якорей
grep -n "staleTime: 30_000" "pages/StaffOrdersMobile/staffordersmobile.jsx"
# Ожидание: 1 hit, строка ~3548 внутри openSessions useQuery.

# 3a. [v5-C1] Подтвердить real queryKey shape для openSessions
grep -n 'queryKey: \["openSessions"' "pages/StaffOrdersMobile/staffordersmobile.jsx"
# Ожидание: 1 hit, строка ~3542, текст `queryKey: ["openSessions", partnerId],`.
# НЕ путать с `invalidateQueries({ queryKey: ["openSessions"] })` — там prefix invalidate legit.

grep -n "const orderGroups = useMemo" "pages/StaffOrdersMobile/staffordersmobile.jsx"
# Ожидание: 1 hit, строка ~3768.

grep -n "const filteredGroups = useMemo" "pages/StaffOrdersMobile/staffordersmobile.jsx"
# Ожидание: 1 hit, строка ~3862.

grep -n "const tabCounts = useMemo" "pages/StaffOrdersMobile/staffordersmobile.jsx"
# Ожидание: 1 hit, строка ~3886.

# 4. [v5-M2] Pre-pin counts для всех 4 Fix B.4 Edit anchors
grep -n "key={group.id}" "pages/StaffOrdersMobile/staffordersmobile.jsx"
# Ожидание: ≥1 hit в v2SortedGroups.map (~4458). Может быть >1 — тогда пины по контексту (см. B.4 ниже).

grep -n "expandedGroupId === group.id" "pages/StaffOrdersMobile/staffordersmobile.jsx"
# Ожидание: 1 hit, строка ~4461 (OrderGroupCard prop).

grep -n "onToggleExpand={() => handleToggleExpand(group.id)}" "pages/StaffOrdersMobile/staffordersmobile.jsx"
# Ожидание: 1 hit, строка ~4462.

grep -n "isHighlighted={highlightGroupId === group.id}" "pages/StaffOrdersMobile/staffordersmobile.jsx"
# Ожидание: 1 hit (должен быть внутри v2SortedGroups.map).
# Если hits != 1 — STOP, проверить pickup/delivery map (не менять его prop highlightGroupId).

# 5. [v5-M1] Pre-pin для data-group-id: различать live JSX vs block-comment
grep -n "data-group-id={group.id}" "pages/StaffOrdersMobile/staffordersmobile.jsx"
# Ожидание: ровно 3 hits (~565, ~1173, ~2292).
# ⚠️ [v5-M1] ИЗ НИХ: только ~2292 = live JSX внутри реального OrderGroupCard рендера.
#    ~565 и ~1173 находятся внутри block-comment (legacy snapshot или docstring).
# Визуальная проверка: sed -n '560,570p' и sed -n '1168,1178p' → должны содержать `/*` или `*/` вокруг.
sed -n '560,575p' "pages/StaffOrdersMobile/staffordersmobile.jsx" | head -20
sed -n '1168,1180p' "pages/StaffOrdersMobile/staffordersmobile.jsx" | head -15

# 6. [v5-C3] handleBannerNavigate — CALL-CHAIN CHECK (не hit-count gate!)
grep -n "handleBannerNavigate" "pages/StaffOrdersMobile/staffordersmobile.jsx"
# Ожидание: РОВНО 2 direct hits:
#   - строка ~4142: `const handleBannerNavigate = useCallback(...)`  (объявление)
#   - строка ~4610: `onNavigate={handleBannerNavigate}`              (prop pass в banner компонент)
# Если hits != 2 — STOP, проверить структуру вручную.

grep -n "onNavigate(banner.groupId)" "pages/StaffOrdersMobile/staffordersmobile.jsx"
# Ожидание: 1 hit, строка ~2825 (indirect call из banner-компонента).
# banner.groupId = tableId (см. buildBannerInfo ~4079-4090, возвращает `groupId: table.id`).

grep -n "buildBannerInfo\|banner\.groupId" "pages/StaffOrdersMobile/staffordersmobile.jsx" | head -10
# Ожидание: ≥3 hits — объявление buildBannerInfo ~4079-4090 + использование banner.groupId в dispatcher.
# Это подтверждает: handleBannerNavigate ВСЕГДА получает tableId (не compositeKey), и Fix B.6
# ДОЛЖЕН резолвить tableId → compositeKey (defensive версия справляется).
```

Если любой grep дал другое количество — STOP и сверяться с Arman. НЕ продолжать работу по неверным якорям.

**[v4-M9] Semantic anchor rule:** grep count — необходимое условие, но НЕ достаточное. Перед каждой заменой убедиться, что найденная строка принадлежит ожидаемой функции (читать 3-5 строк вокруг match: `sed -n '${LINE-3},${LINE+3}p'`). Если контекст не совпадает — STOP.

---

## Fix Priority & Dependencies

**Порядок применения:**
1. Fix A первым (одна строка, не ломает ничего).
2. Fix B вторым (основной UX-фикс, требует координированных правок 5 мест).
3. Fix C последним (зависит от типа group из Fix B — `group.sessionId`).

⚠️ **ORDER:** Fix B MUST be applied before Fix C (Fix C читает `group.sessionId` field, который создаётся в Fix B).

Если один из Fix проваливается (syntax error / conflict) → откатить ТОЛЬКО этот Fix, остальные сохранить. Fix A + Fix B дают 80% эффекта. Fix C — optimization.

---

## Identifier Contract (КРИТИЧНО — читать ДО Fix B) — [v4-C2, v5-L6]

В Fix B вводится новое поле `group.compositeKey` (= `${tableId}__${sessionId}`). Это создаёт ДВА разных типа идентификаторов в OrderGroupCard'ах. Любая путаница ломает функционал. Эта таблица — единственный источник истины:

| Где использовать | Идентификатор | Почему | Меняем ли в Fix B? |
|---|---|---|---|
| **Render identity** (визуальная, UI) | | | |
| `key={...}` для OrderGroupCard в map | `group.compositeKey` | React reconciliation — каждая карточка уникальна | ✅ ДА (Fix B.4) |
| `data-group-id={...}` атрибут (live JSX @ ~2292) | `group.compositeKey` | DOM-селектор для banner scroll | ✅ ДА (Fix B.5) |
| `expandedGroupId === group.compositeKey` | `group.compositeKey` | каждая карточка expand/collapse независимо | ✅ ДА (Fix B.4) |
| `highlightGroupId === group.compositeKey` | `group.compositeKey` | подсветка после banner-navigate | ✅ ДА (Fix B.4) |
| `handleToggleExpand(group.compositeKey)` | `group.compositeKey` | передаётся в setExpandedGroupId | ✅ ДА (Fix B.4) |
| Tab bucketing (active/completed) — `isCurrentOpenSession` | `group.sessionId` (поле) сравнивается с `openSessionByTableId[group.id]?.id` | каждая сессия определяет свой таб независимо | ✅ ДА (Fix B.2/B.3) |
| `setExpandedGroupId(targetKey)` в banner-navigate | `compositeKey` (резолв из tableId через defensive helper) | scroll и expand одной карточки | ✅ ДА (Fix B.6) |
| **Business identity** (домен, БД, кэш) | | | |
| `isFavorite('table', group.id)` | `group.id` (= tableId) | favorites привязаны к столу, выживают смену сессии | ⛔ НЕТ |
| `toggleFavorite('table', group.id)` | `group.id` (= tableId) | то же | ⛔ НЕТ |
| `["servedOrders", group.id]` queryKey | `group.id` (= tableId) | served orders persist через сессии (history стола) | ⛔ НЕТ |
| `onCloseTable(group.openSessionId, group.displayName, group.id)` | `group.openSessionId` + `group.id` | закрываем сессию для конкретного стола | ⛔ НЕТ |
| `tableMap[tableId]` lookup | `group.id` (= tableId) | таблица справочников столов в B44 | ⛔ НЕТ |
| `getLinkId(req.table) === group.id` в `hasActiveRequest` | `group.id` (= tableId) | ServiceRequest привязан к tableId | ⛔ НЕТ |
| `Order.table_session` в БД | NEVER ИЗМЕНЯТЬ | source of truth для группировки | ⛔ НЕТ |
| **Upstream (banner dispatcher → handleBannerNavigate)** — [V5-L6] | | | |
| `onNavigate(banner.groupId)` call @ ~2825 | `banner.groupId` = tableId (из `buildBannerInfo` @ ~4079-4090) | banner знает только tableId (один банер на стол) | ⛔ НЕТ (upstream) |
| `buildBannerInfo` return `{ groupId: table.id, ... }` @ ~4079-4090 | tableId | banner показывает alert про стол, не про отдельную сессию | ⛔ НЕТ (upstream) |
| Внутри `handleBannerNavigate` тело | принимает tableId, резолвит в compositeKey | defensive — работает и с чистым tableId (наш случай) и с compositeKey (не встречается today, но безопасно) | ✅ ДА (Fix B.6) |

⚠️ **Правило при правке:** если код «трогает DOM/React state» → `compositeKey`. Если код «трогает B44 entity / API / favorites / upstream banner» → `tableId` (= `group.id`).

⚠️ **Анти-паттерн:** замена `group.id` → `group.compositeKey` глобально через find-replace СЛОМАЕТ favorites + servedOrders + close-table + upstream banner. Только в местах из таблицы выше.

⚠️ **Call-chain для banner-navigate:** `buildBannerInfo → banner.groupId (tableId) → onNavigate(banner.groupId) @ 2825 → prop onNavigate @ 4610 → handleBannerNavigate @ 4142 → defensive резолв → compositeKey → scroll+expand`. handleBannerNavigate — единственная точка преобразования tableId → compositeKey.

---

## Codex Execution Mode (для codex-writer-v2 step) — [v4-M8, v5-M4 упрощён]

`staffordersmobile.jsx` = 4617 строк. На Windows Codex CLI chanced to timeout при больших inline prompt'ах. Единый supported путь:

1. **Self-read через tool `Read` (MCP/Claude).** Если доступен Read tool — читай рабочую копию напрямую: `pages/StaffOrdersMobile/staffordersmobile.jsx`. Для больших файлов используй `offset`/`limit` параметры Read для range-reads (50-100 строк вокруг якоря).

2. **Если Read tool недоступен:** используй bash `grep -n` + `sed -n 'X,Yp'` (10-30 строк вокруг якоря) через один shell-pass. НЕ запускай PowerShell wrappers (timeout >15s).

3. **Output path (findings):** пиши в согласованный chain-state path (watcher v5.3+ KB-165 retrieval активен — даже если sandbox блокирует write, Cowork извлечёт findings из task.log). НЕ создавай side-файлы `result-codex.md` или временные markdown-файлы в рабочем каталоге репо — они могут случайно попасть в git commit.

4. **Запрещено:**
   - Загружать **весь** файл в контекст (4617 строк, ~250 KB).
   - Inline JSON dump полного файла в response.
   - Запуск длинных PowerShell-обёрток (>10 секунд startup) — это таймаутит Codex.

5. **Время.** Целевое время Codex review: 8-15 минут. Если упёрся в технический blocker (sandbox, timeout) — фиксируй в findings и продолжай со следующим Fix. Не блокируйся.

---

## Fix A: staleTime для openSessions 30s → 5s

### Статус: [FIX]
**Проблема (verified):** `staleTime: 30_000` в `openSessions` useQuery (строка ~3548) означает, что после создания новой TableSession на Base44 SOM не будет её видеть до 30 секунд. Всё это время новые Orders отображаются в карточке старой закрытой сессии.

### Change

**Grep-якорь:** `staleTime: 30_000` (ожидается 1 hit, в блоке `openSessions` useQuery, строки 3541-3552).

**Текущий код (строка ~3548):**
```js
    enabled: canFetch && !!partnerId && !rateLimitHit,
    staleTime: 30_000,
    refetchInterval: effectivePollingInterval,
```

**Новый код (заменить ровно одну строку):**
```js
    enabled: canFetch && !!partnerId && !rateLimitHit,
    staleTime: 5_000,
    refetchInterval: effectivePollingInterval,
```

### Should NOT — [v4-M1, v5-C1]

**Целевой queryKey:** `["openSessions", partnerId]` (1 hit @ ~3542). **НЕ МЕНЯТЬ** queryKey shape — это повлияет на кэш-партиционирование и сломает все места, которые читают cache для конкретного partner. [V5-C1]

**Важно:** `queryClient.invalidateQueries({ queryKey: ["openSessions"] })` в Fix C ниже — это **prefix invalidate** (react-query по умолчанию матчит `["openSessions", partnerId]` через `exact: false`). НЕ нужно менять на `["openSessions", partnerId]` — prefix работает корректно для любого текущего partnerId.

**Список staleTime значений в файле, которые ЗАПРЕЩЕНО трогать** (pre-check `grep -n "staleTime:" file`):
- `staleTime: 60_000` для `["tables", partnerId]` / `["stages", partnerId]` / `["partner"]` queries — статичный конфиг, не менять.
- `["orders", partnerId]` useQuery — НЕ имеет явного `staleTime` (использует `refetchInterval`); не добавлять staleTime туда.
- Любой другой `staleTime: ...` который не находится в `useQuery({ queryKey: ["openSessions", partnerId], ... })` блоке — НЕ ТРОГАТЬ.

**Также НЕ менять в `["openSessions", partnerId]` useQuery:**
- `queryKey` (= `["openSessions", partnerId]`) — менять сломает partitioning и Fix C invalidate + tabCounts.
- `queryFn` (`OpenSessions.list(...)` или аналог) — это backend контракт.
- `refetchInterval: effectivePollingInterval` — polling управляется через переменную, не трогать.
- `refetchIntervalInBackground` / `retry` / `enabled` (за исключением уже стоящих условий) — не трогать.

### Verification после Fix A
```bash
# 1. Убедиться что изменена только одна строка
grep -n "staleTime:" "pages/StaffOrdersMobile/staffordersmobile.jsx" | grep "5_000"
# Ожидание: 1 hit, строка ~3548.

# 2. Убедиться что 30_000 исчез
grep -n "staleTime: 30_000" "pages/StaffOrdersMobile/staffordersmobile.jsx"
# Ожидание: 0 hits.

# 3. [v5-C1] Убедиться что queryKey shape НЕ изменился
grep -n 'queryKey: \["openSessions", partnerId\]' "pages/StaffOrdersMobile/staffordersmobile.jsx"
# Ожидание: 1 hit, строка ~3542 (как и до фикса).

grep -n 'queryKey: \["openSessions"\]' "pages/StaffOrdersMobile/staffordersmobile.jsx"
# Ожидание: 0 hits в `useQuery(...)` контексте. Может быть ≥1 hit в `invalidateQueries(...)` контексте — это prefix invalidate, это OK.

# 4. wc -l не должен измениться
wc -l "pages/StaffOrdersMobile/staffordersmobile.jsx"
# Ожидание: 4617 +70/-35 (заменили 1 строку, счётчик не должен вырасти).
```

---

## Fix B: Session-aware orderGroups (#347) + coordinated call-site updates

### Статус: [FIX] (основной UX-фикс)
**Проблема (verified):** `orderGroups` группирует hall-Orders по `tableId`. При последовательных сессиях (старая закрыта → новая открыта) ВСЕ Orders стола попадают в одну `tableGroups[tableId]` → одна карточка. Нужно группировать по `(tableId, sessionId)`, чтобы каждая TableSession имела отдельную карточку.

### Wireframe (было → должно быть)

```
БЫЛО (BUG-SM-015):                      ДОЛЖНО БЫТЬ:
╔══════════════════════════════════╗    ╔═══════════════════════════════╗
║ таб «Завершённые»                ║    ║ таб «Активные»                ║
║ ┌──────────────────────────────┐ ║    ║ ┌───────────────────────────┐ ║
║ │ Стол 3                       │ ║    ║ │ Стол 3 (new session)      │ ║
║ │  - заказ 1 (closed)          │ ║    ║ │  - заказ 2 (new)          │ ║
║ │  - заказ 2 (new) ← WRONG!    │ ║    ║ └───────────────────────────┘ ║
║ └──────────────────────────────┘ ║    ║                               ║
╚══════════════════════════════════╝    ║ таб «Завершённые»             ║
                                        ║ ┌───────────────────────────┐ ║
                                        ║ │ Стол 3 (closed session)   │ ║
                                        ║ │  - заказ 1 (closed)       │ ║
                                        ║ └───────────────────────────┘ ║
                                        ╚═══════════════════════════════╝
```

### Changes — 5 координированных правок

**B.1 — `orderGroups` useMemo (~строки 3768-3819)**

Grep-якорь: `const orderGroups = useMemo` (1 hit). Читается как:
```js
  // v2.7.0: Order groups model (hall by table, pickup/delivery individual)
  const orderGroups = useMemo(() => {
    if (isKitchen) return null;
    
    const groups = [];
    const tableGroups = {};
    
    visibleOrders.forEach(o => {
      if (o.order_type === 'hall') {
        const tableId = getLinkId(o.table);
        if (!tableId) return;
        if (!tableGroups[tableId]) {
          const tableName = tableMap[tableId]?.name || '?';
          tableGroups[tableId] = {
            type: 'table',
            id: tableId,
            displayName: tableName,
            orders: [],
            openSessionId: openSessionByTableId[tableId]?.id || null,
          };
          groups.push(tableGroups[tableId]);
        }
        tableGroups[tableId].orders.push(o);
      } else {
        groups.push({
          type: o.order_type,
          id: o.id,
          displayName: o.order_type === 'pickup' 
            ? `СВ-${o.order_number || o.id.slice(-3)}` 
            : `ДОС-${o.order_number || o.id.slice(-3)}`,
          orders: [o],
        });
      }
    });

    activeRequests.forEach((req) => {
      const tableId = getLinkId(req.table);
      if (!tableId) return;
      if (!tableGroups[tableId]) {
        const tableName = tableMap[tableId]?.name || '?';
        tableGroups[tableId] = {
          type: 'table',
          id: tableId,
          displayName: tableName,
          orders: [],
          openSessionId: openSessionByTableId[tableId]?.id || null,
        };
        groups.push(tableGroups[tableId]);
      }
    });

    return groups;
  }, [visibleOrders, tableMap, isKitchen, activeRequests, openSessionByTableId]);
```

**Заменить ЦЕЛИКОМ блок `const orderGroups = useMemo(...)` следующим (БЕЗ изменения deps):**

```js
  // v2.7.0 + Б2.1: Order groups model (hall by table+session, pickup/delivery individual)
  // BUG-SM-015: Split table orders by session_id so closed session stays in
  // «Завершённые» while new session appears as a fresh card in «Активные».
  const orderGroups = useMemo(() => {
    if (isKitchen) return null;

    const groups = [];
    const tableGroups = {}; // key: `${tableId}__${sessionKey}` where sessionKey = sessionId || 'no-session'

    visibleOrders.forEach(o => {
      if (o.order_type === 'hall') {
        const tableId = getLinkId(o.table);
        if (!tableId) return;

        const orderSessionId = getLinkId(o.table_session) || 'no-session';
        const openSessionId = openSessionByTableId[tableId]?.id || null;
        const compositeKey = `${tableId}__${orderSessionId}`;

        if (!tableGroups[compositeKey]) {
          const tableName = tableMap[tableId]?.name || '?';
          tableGroups[compositeKey] = {
            type: 'table',
            id: tableId,                   // tableId — используется для favorites, servedOrders query, onCloseTable callback
            sessionId: orderSessionId === 'no-session' ? null : orderSessionId, // NEW: сессия этой группы (null для legacy orders без session)
            compositeKey,                  // NEW: React key + data-group-id + expand/highlight tracking
            displayName: tableName,
            orders: [],
            openSessionId,                 // ID открытой сессии для этого стола (может != sessionId если закрытая)
          };
          groups.push(tableGroups[compositeKey]);
        }
        tableGroups[compositeKey].orders.push(o);
      } else {
        // Pickup/Delivery — уникальны по orderId, не меняем логику.
        groups.push({
          type: o.order_type,
          id: o.id,
          sessionId: null,
          compositeKey: `${o.order_type}__${o.id}`,
          displayName: o.order_type === 'pickup'
            ? `СВ-${o.order_number || o.id.slice(-3)}`
            : `ДОС-${o.order_number || o.id.slice(-3)}`,
          orders: [o],
        });
      }
    });

    // ServiceRequest → привязать к группе ТЕКУЩЕЙ открытой сессии (если есть),
    // иначе к `${tableId}__no-session`. Запросы от закрытых сессий уже в статусе 'done'
    // (см. closeSession в sessionHelpers.js:175-188), поэтому в activeRequests не попадают.
    //
    // ⚠️ [v7-M1] INTENTIONAL: если у стола нет открытой сессии (openSessionId = null),
    // создаётся карточка с `orders: []`, `sessionId: null`, `compositeKey: ${tableId}__no-session`.
    // Такая карточка попадёт в таб «Завершённые» (filteredGroups: isCurrentOpenSession = false).
    // Это корректное поведение: ServiceRequest без открытой сессии — завершённый запрос.
    // Если в будущем откроется сессия → карточка для неё создастся через visibleOrders.
    activeRequests.forEach((req) => {
      const tableId = getLinkId(req.table);
      if (!tableId) return;

      const openSessionId = openSessionByTableId[tableId]?.id || null;
      const targetSessionKey = openSessionId || 'no-session';
      const compositeKey = `${tableId}__${targetSessionKey}`;

      if (!tableGroups[compositeKey]) {
        const tableName = tableMap[tableId]?.name || '?';
        tableGroups[compositeKey] = {
          type: 'table',
          id: tableId,
          sessionId: openSessionId,       // null если no open session
          compositeKey,
          displayName: tableName,
          orders: [],
          openSessionId,
        };
        groups.push(tableGroups[compositeKey]);
      }
    });

    return groups;
  }, [visibleOrders, tableMap, isKitchen, activeRequests, openSessionByTableId]);
```

**NOTE:** Сохраняется тот же dependency array (добавлять зависимости не требуется — все используемые в теле переменные уже были в старом массиве).

**B.2 — `filteredGroups` useMemo (~строки 3862-3883)**

Grep-якорь: `const filteredGroups = useMemo` (1 hit).

**Текущий код:**
```js
  const filteredGroups = useMemo(() => {
    if (!orderGroups) return [];

    return orderGroups.filter(group => {
      if (group.type === 'table') {
        const hasOpenSession = !!openSessionByTableId[group.id];
        if (!hasOpenSession) return activeTab === 'completed';
      }
      const hasActiveOrder = group.orders.some(o => {
        const config = getStatusConfig(o);
        return !config.isFinishStage && o.status !== 'cancelled';
      });
      const hasActiveRequest = group.type === 'table' && activeRequests.some(r => getLinkId(r.table) === group.id);
      const hasServedButNotClosed = group.orders.some(o => {
        const config = getStatusConfig(o);
        return config.isFinishStage && o.status !== 'closed' && o.status !== 'cancelled';
      });
      return activeTab === 'active'
        ? (hasActiveOrder || hasActiveRequest || hasServedButNotClosed)
        : (!hasActiveOrder && !hasActiveRequest && !hasServedButNotClosed);
    });
  }, [orderGroups, activeTab, getStatusConfig, activeRequests, openSessionByTableId]);
```

**[v4-M2] Заменить ВЕСЬ блок `const filteredGroups = useMemo(...)` следующим (отличия от текущего: ТОЛЬКО первый `if (group.type === 'table')` блок — определение `isCurrentOpenSession` через `openId` + `group.sessionId`, вместо `hasOpenSession = !!openSessionByTableId[group.id]`). Все остальные строки — `hasActiveOrder`, `hasActiveRequest`, `hasServedButNotClosed`, return — ИДЕНТИЧНЫ оригиналу. Deps array НЕ менять.**

```js
  const filteredGroups = useMemo(() => {
    if (!orderGroups) return [];

    return orderGroups.filter(group => {
      if (group.type === 'table') {
        // Б2.1: группа принадлежит «Активным» ТОЛЬКО если её sessionId совпадает с текущей
        // открытой сессией для стола. Закрытые сессии (group.sessionId !== openId или no-session) → «Завершённые».
        const openId = openSessionByTableId[group.id]?.id || null;
        const isCurrentOpenSession = !!openId && group.sessionId === openId;
        if (!isCurrentOpenSession) return activeTab === 'completed';
      }
      const hasActiveOrder = group.orders.some(o => {
        const config = getStatusConfig(o);
        return !config.isFinishStage && o.status !== 'cancelled';
      });
      const hasActiveRequest = group.type === 'table' && activeRequests.some(r => getLinkId(r.table) === group.id);
      const hasServedButNotClosed = group.orders.some(o => {
        const config = getStatusConfig(o);
        return config.isFinishStage && o.status !== 'closed' && o.status !== 'cancelled';
      });
      return activeTab === 'active'
        ? (hasActiveOrder || hasActiveRequest || hasServedButNotClosed)
        : (!hasActiveOrder && !hasActiveRequest && !hasServedButNotClosed);
    });
  }, [orderGroups, activeTab, getStatusConfig, activeRequests, openSessionByTableId]);
```

⚠️ **Важно:** `hasActiveRequest` продолжает фильтровать по `getLinkId(r.table) === group.id` (tableId). Это корректно: если у стола есть request, он по Fix B.1 уже прикреплён к compositeKey текущей открытой сессии — значит эта группа (с `isCurrentOpenSession=true`) его увидит; закрытая группа (с `group.sessionId !== openId`) уже дропнулась в `completed` на раннем return.

**B.3 — `tabCounts` useMemo (~строки 3886-3908)**

Grep-якорь: `const tabCounts = useMemo` (1 hit).

**Текущий код (relevant часть):**
```js
    orderGroups.forEach(group => {
      if (group.type === 'table' && !openSessionByTableId[group.id]) {
        completed++;
        return;
      }
      ...
```

**[v4-M2] Заменить ВЕСЬ блок `const tabCounts = useMemo(...)` следующим (отличия от текущего: ТОЛЬКО внутренний `if (group.type === 'table' && !openSessionByTableId[group.id])` блок — заменён на `isCurrentOpenSession` проверку через `group.sessionId`. Остальное — `hasActiveOrder`, `hasActiveRequest`, `hasServedButNotClosed`, инкремент `active/completed`, return — ИДЕНТИЧНО оригиналу. Deps array НЕ менять.**

```js
  // v2.7.1: Tab counts
  const tabCounts = useMemo(() => {
    if (!orderGroups) return { active: 0, completed: 0 };

    let active = 0, completed = 0;
    orderGroups.forEach(group => {
      if (group.type === 'table') {
        // Б2.1: группа принадлежит «Завершённым» если это НЕ группа текущей открытой сессии
        const openId = openSessionByTableId[group.id]?.id || null;
        const isCurrentOpenSession = !!openId && group.sessionId === openId;
        if (!isCurrentOpenSession) {
          completed++;
          return;
        }
      }
      const hasActiveOrder = group.orders.some(o => {
        const config = getStatusConfig(o);
        return !config.isFinishStage && o.status !== 'cancelled';
      });
      const hasActiveRequest = group.type === 'table' && activeRequests.some(r => getLinkId(r.table) === group.id);
      const hasServedButNotClosed = group.orders.some(o => {
        const config = getStatusConfig(o);
        return config.isFinishStage && o.status !== 'closed' && o.status !== 'cancelled';
      });
      if (hasActiveOrder || hasActiveRequest || hasServedButNotClosed) active++; else completed++;
    });

    return { active, completed };
  }, [orderGroups, getStatusConfig, activeRequests, openSessionByTableId]);
```

**B.4 — Call-site updates в OrderGroupCard map (~строки 4457-4486) — [v4-M3, v5-M2]**

Grep-якорь: `v2SortedGroups.map(group => (` (1 hit). Меняем РОВНО 4 строки props через 4 отдельных Edit.

⚠️ **[V5-M2] Pre-pinned counts** (из Pre-flight шаг 4, убедись что соответствует):
- `key={group.id}` — ≥1 hit (может быть в нескольких map-блоках; см. context requirements ниже)
- `expandedGroupId === group.id` — РОВНО 1 hit (~4461)
- `onToggleExpand={() => handleToggleExpand(group.id)}` — РОВНО 1 hit (~4462)
- `isHighlighted={highlightGroupId === group.id}` — РОВНО 1 hit

Если `key={group.id}` даёт >1 hit — это ожидаемо (есть отдельный map для pickup/delivery OrderCard — НЕ трогать). Используем surrounding context чтобы Edit затронул только `v2SortedGroups.map` блок.

⚠️ **Эти 4 Edit'а — единственное что меняется в B.4. Все остальные props в этом `<OrderGroupCard ... />` НЕ ТРОГАТЬ. Никаких `...` placeholder'ов в `new_string`.**

**Edit 1 — `key` (используем контекст для disambiguation):**
- old_string:
  ```
              v2SortedGroups.map(group => (
                <OrderGroupCard
                  key={group.id}
  ```
- new_string:
  ```
              v2SortedGroups.map(group => (
                <OrderGroupCard
                  key={group.compositeKey}
  ```

**Edit 2 — `isExpanded` (единственный hit, уникален):**
- old_string: `                  isExpanded={expandedGroupId === group.id}`
- new_string: `                  isExpanded={expandedGroupId === group.compositeKey}`

**Edit 3 — `onToggleExpand` (единственный hit, уникален):**
- old_string: `                  onToggleExpand={() => handleToggleExpand(group.id)}`
- new_string: `                  onToggleExpand={() => handleToggleExpand(group.compositeKey)}`

**Edit 4 — `isHighlighted` (единственный hit, уникален):**
- old_string: `                  isHighlighted={highlightGroupId === group.id}`
- new_string: `                  isHighlighted={highlightGroupId === group.compositeKey}`

**Иллюстрация контекста (НЕ копировать в Edit — это для понимания, см. Identifier Contract таблицу выше):**
```jsx
              v2SortedGroups.map(group => (
                <OrderGroupCard
                  key={group.compositeKey}                                                /* CHANGED */
                  group={group}
                  isExpanded={expandedGroupId === group.compositeKey}                     /* CHANGED */
                  onToggleExpand={() => handleToggleExpand(group.compositeKey)}           /* CHANGED */
                  isHighlighted={highlightGroupId === group.compositeKey}                 /* CHANGED */
                  isFavorite={isFavorite(group.type === 'table' ? 'table' : 'order', group.id)} /* group.id — НЕ менять (tableId для favorites) */
                  onToggleFavorite={toggleFavorite}                                       /* НЕ менять */
                  /* остальные props — onCloseTable, activeRequests, onBatchCloseRequestAsync и др. — НЕ менять */
                />
              ))
```

⚠️ **НЕ менять (повтор для безопасности):**
- `isFavorite(...)` вызов — остаётся на `group.id` (tableId). Фавориты должны выживать смену сессии.
- `onToggleFavorite` — остаётся `toggleFavorite` без wrapper'а (сигнатура `(type, id)` не меняется).
- Остальные props (`onCloseTable`, `activeRequests`, `onBatchCloseRequestAsync`, etc.) — не трогать.

**B.5 — `data-group-id` (live JSX only) — [v4-M4, v5-M1 критично]**

[V5-M1] **Только 1 live JSX replacement обязателен. 2 других — non-blocking commented snapshots.**

Pre-check (из Pre-flight §5) должен подтвердить:
- `~2292` — live JSX внутри реального OrderGroupCard root element (обязательна замена).
- `~565` и `~1173` — внутри block-comment (`/* ... */` или JSX comment `{/* ... */}`). Замена non-blocking: можно либо пропустить (safer), либо заменить для консистентности (optional).

**Стратегия:**

**Шаг 1 — ОБЯЗАТЕЛЬНАЯ замена live JSX (~2292):**

Сначала прочитать точный контекст:
```bash
sed -n '2285,2298p' "pages/StaffOrdersMobile/staffordersmobile.jsx"
# Ожидание: JSX контекст WITHOUT `/*` или `{/*` — это live render.
# Ключевые маркеры уникальности (ОТСУТСТВУЮТ в ~565 и ~1173):
#   - строка `highlightRing` или переменная с этим именем (~2285-2292)
#   - конструкция `return (` в пределах 5 строк до data-group-id
```

Edit pair (ЗАПОЛНИТЬ точными строками из sed-output выше):

1. Прочитать вывод `sed -n '2285,2298p'` и найти уникальный блок: строки от `highlightRing`
   (или `return (`) ДО и включая `data-group-id={group.id}`.
2. Использовать эти 3-5 строк как `old_string` — включая `highlightRing` переменную или `return (`
   как первую строку (это делает anchor уникальным: таких строк нет в ~565/~1173 comments).
3. `new_string` — те же строки с единственной заменой `data-group-id={group.id}` → `data-group-id={group.compositeKey}`.

Ожидаемый вид (точные строки заменить из sed-output):
```jsx
  // old_string пример (взять точный текст из sed — НЕ копировать этот шаблон):
  const highlightRing = highlightGroupId === group.compositeKey;
  return (
    <div
      data-group-id={group.id}
```
```jsx
  // new_string (та же структура, только data-group-id заменён):
  const highlightRing = highlightGroupId === group.compositeKey;
  return (
    <div
      data-group-id={group.compositeKey}
```

⚠️ **НЕ использовать `data-group-id={group.id}` как единственную строку old_string** — это может совпасть с block-comments @ ~565 / ~1173. Всегда включать `highlightRing` или `return (` строку ДО `data-group-id` для однозначной идентификации.

**Шаг 2 — OPTIONAL замена comment-only snapshots (~565, ~1173):**

Эти hits в block-comments (исторические snapshots/docstrings). Рендер DOM не затрагивают. Замену выполнять **только если остальные Fix прошли без ошибок** и есть бюджет времени. Non-blocking. Если пропускаем — записать в коммите `/* v5-M1: commented snapshots @ 565, 1173 preserved as legacy docs */`.

**Verification B.5 (пост-фикс):**
```bash
# Live JSX заменён (обязательно)
grep -c "data-group-id={group.compositeKey}" "pages/StaffOrdersMobile/staffordersmobile.jsx"
# Ожидание: ≥1 (если пропустили comments) или =3 (если заменили всё).

# Старый атрибут data-group-id={group.id} — 0 ВНЕ comments:
#   Если решили не трогать comments → старые 2 hits останутся в comments (OK).
#   [v5-L4] Loose regex — допускает optional spaces вокруг group.compositeKey (formatter-tolerant):
grep -cE "data-group-id=\{ *group\.compositeKey *\}" "pages/StaffOrdersMobile/staffordersmobile.jsx"
# Ожидание: ≥1 (формат live JSX может меняться после формattера).

# КРИТИЧНО: live JSX @ ~2292 обязательно на compositeKey:
sed -n '2285,2298p' "pages/StaffOrdersMobile/staffordersmobile.jsx" | grep -c "compositeKey"
# Ожидание: 1 hit.
```

⚠️ КРИТИЧНО: `handleBannerNavigate` использует селектор `[data-group-id="${CSS.escape(String(targetKey))}"]`. Если LIVE `data-group-id` (@~2292) останется на `group.id`, баннер будет скроллить к первой случайной карточке (React key conflict + неправильный DOM selector). Commented hits на рендер НЕ влияют.

**B.6 — `handleBannerNavigate` обновить для compositeKey (~строка 4142) — [V5-L3]**

Grep-якорь: `const handleBannerNavigate = useCallback` (1 hit, объявление @ ~4142). Call-site: `onNavigate={handleBannerNavigate}` @ ~4610. Upstream: `onNavigate(banner.groupId)` @ ~2825, где `banner.groupId = tableId` из `buildBannerInfo @ ~4079-4090`.

**Текущий код:**
```js
  const handleBannerNavigate = useCallback((groupId) => {
    if (!groupId) return;
    setExpandedGroupId(groupId);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const el = document.querySelector(`[data-group-id="${CSS.escape(String(groupId))}"]`);
        ...
```

**[v3: M1] — Используем defensive реализацию unconditionally** (CC review: "two alternatives with no decision rule → pick defensive one").

Независимо от того, что передаёт call-site (upstream передаёт ЧИСТЫЙ `tableId` из `banner.groupId`) — defensive версия с проверкой `__` безопасна для обоих случаев.

**Заменить ЦЕЛИКОМ `handleBannerNavigate` useCallback:**
```js
  const handleBannerNavigate = useCallback((maybeTableIdOrCompositeKey) => {
    if (!maybeTableIdOrCompositeKey) return;

    // Б2.1: если передан tableId без sessionId (current flow: banner.groupId = tableId) —
    // резолвим к compositeKey ТЕКУЩЕЙ открытой сессии этого стола.
    // Defensive: работает и когда caller уже передаёт compositeKey (содержит '__').
    let targetKey = String(maybeTableIdOrCompositeKey);
    if (!targetKey.includes('__')) {
      const openId = openSessionByTableId[targetKey]?.id || null;
      targetKey = openId
        ? `${targetKey}__${openId}`
        : `${targetKey}__no-session`;
    }

    setExpandedGroupId(targetKey);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const el = document.querySelector(`[data-group-id="${CSS.escape(targetKey)}"]`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          setHighlightGroupId(targetKey);
          if (highlightTimerRef.current) clearTimeout(highlightTimerRef.current);
          highlightTimerRef.current = setTimeout(() => setHighlightGroupId(null), 1500);
        }
      });
    });
  }, [openSessionByTableId]);
```

⚠️ Добавить `openSessionByTableId` в dependency array useCallback (новая зависимость).

**[V5-L3] Note про identity churn:** Новый dep `openSessionByTableId` пересчитывается каждый refetch `openSessions` query (каждые ~5s после Fix A). Это значит `handleBannerNavigate` получит **новую identity при каждом refetch** — если bannerComponent обёрнут в `memo` с shallow prop comparison, он будет ре-рендериться каждые 5 секунд.

Impact: **косметический** — banner рендер лёгкий (alert + кнопка), CPU cost ничтожен. Не требует мемоизации `openSessionByTableId` или wrapper-hook. Принимаемо как trade-off за fresh session info в banner navigation.

**B.7 — `confirmCloseTable` очистка expanded (~строка 4190)**

Grep-якорь: `setExpandedGroupId(null); // Collapse expanded card` (1 hit). Строка ОК как есть — устанавливает `null`, никаких ссылок на ID. **Не менять.**

### Should NOT (для Fix B целиком) — [v4-L4: `onCloseTable` = prop, `handleCloseTable` = handler — везде ниже используем `onCloseTable` как имя контракта]
- НЕ менять OrderGroupCard компонент (только пропсы).
- НЕ менять `favorites` массив / `toggleFavorite` / `isFavorite` сигнатуру. Favorites остаются привязаны к tableId.
- НЕ менять `["servedOrders", group.id]` queryKey — tableId нужен для корректного filter по B44.
- НЕ менять `onCloseTable(sessionId, identifier, tableId)` контракт (FROZEN UX: пропс OrderGroupCard'а; внутри маппится на handler `handleCloseTable` родителя через `group.openSessionId` + `group.displayName` + `group.id`).
- НЕ трогать `handleCloseTableClick` useCallback внутри OrderGroupCard (~2164-2177).
- НЕ трогать pickup/delivery ветку в `orderGroups` (их compositeKey уже уникален через `o.id`).
- НЕ трогать `buildBannerInfo` @ ~4079-4090 или `onNavigate(banner.groupId)` @ ~2825 (upstream: Fix B.6 обрабатывает tableId через defensive резолв). [V5-L6]
- НЕ добавлять новые state/hooks/queries.

### Связи между Fix'ами
⚠️ **Fix B.1 создаёт поле `group.sessionId`**, которое:
- используется в Fix B.2 (`filteredGroups`) и Fix B.3 (`tabCounts`) для определения таба
- используется в Fix C (ниже) для детектирования orphan orders
Если Fix B.1 падает — Fix B.2, B.3 и Fix C тоже нельзя применять.

### Verification после Fix B (ВСЕ команды должны пройти)

```bash
# 1. compositeKey появился везде где нужно (≥5 occurrences: 1 key + 1 isExpanded + 1 onToggleExpand + 1 isHighlighted + 1-3 data-group-id)
grep -c "compositeKey" "pages/StaffOrdersMobile/staffordersmobile.jsx"
# Ожидание: ≥5 (4 call-sites B.4 + 1 обязательный data-group-id @ ~2292 + N в orderGroups тело).

# 2. Старая одиночная группировка убрана
grep -n "tableGroups\[tableId\]" "pages/StaffOrdersMobile/staffordersmobile.jsx"
# Ожидание: 0 hits (всё заменено на tableGroups[compositeKey]).

# 3. Старое условие в filteredGroups убрано
grep -n "hasOpenSession = !!openSessionByTableId\[group.id\]" "pages/StaffOrdersMobile/staffordersmobile.jsx"
# Ожидание: 0 hits.

# 4. Новое условие присутствует
grep -c "isCurrentOpenSession" "pages/StaffOrdersMobile/staffordersmobile.jsx"
# Ожидание: 2 hits (filteredGroups + tabCounts).

# 5. Старый key={group.id} внутри v2SortedGroups.map убран
sed -n '4455,4490p' "pages/StaffOrdersMobile/staffordersmobile.jsx" | grep -c "key={group.id}"
# Ожидание: 0 hits в этом диапазоне.

# 6. [v5-L4] Live data-group-id @ ~2292 использует compositeKey (loose regex — formatter-tolerant)
sed -n '2285,2298p' "pages/StaffOrdersMobile/staffordersmobile.jsx" | grep -cE "data-group-id=\{ *group\.compositeKey *\}"
# Ожидание: 1 hit.

# 7. isFavorite по-прежнему использует group.id — проверка что НЕ сломали
grep -n "isFavorite(group.type === 'table' ? 'table' : 'order', group.id)" "pages/StaffOrdersMobile/staffordersmobile.jsx"
# Ожидание: ≥1 hit (сигнатура сохранена).

# 8. Общее число строк файла (примерное)
wc -l "pages/StaffOrdersMobile/staffordersmobile.jsx"
# Ожидание: 4582 ≤ wc-l ≤ 4687 (base 4617, +70 max от новых строк Fix B orderGroups + Fix C useEffect, -35 tolerance за cleanup). [v5-M5: unambiguous]
```

---

## Fix C: Invalidate openSessions при orphan-заказах

### Статус: [NEW CODE — performance optimization]
**Проблема:** Даже с Fix A (staleTime 5s) остаётся окно до 5 секунд, когда новый Order уже в БД, но SOM его группирует без открытой сессии. Если активно полинг `orders` раньше чем `openSessions` — карточка появится в «Завершённых», потом «прыгнет» в «Активные». Fix C детектирует такие orphan Orders и делает принудительный invalidate `openSessions` — карточка появится корректно сразу.

### Change

**[v5-C2] Pre-check перед вставкой — реальный `orders` alias:**

```bash
# Real anchor: `data: orders,` внутри useQuery destructure @ ~3497
grep -n "data: orders," "pages/StaffOrdersMobile/staffordersmobile.jsx"
# Ожидание: 1 hit, строка ~3497, внутри useQuery({ queryKey: ["orders", partnerId], ... }).
# Это источник `orders` — массив Order entities используемый по всему компоненту.

grep -n 'queryKey: \["orders"' "pages/StaffOrdersMobile/staffordersmobile.jsx"
# Ожидание: 1 hit, строка ~3494, блок orders useQuery (диапазон ~3494-3512).

# ⚠️ НЕ использовать pattern `^  const orders ` — он матчит inner helper variable @ ~1130 (не то).
# Использовать `data: orders,` как единственный якорь для Fix C.
```

**Placement:** добавить НОВЫЙ useEffect СРАЗУ ПОСЛЕ закрывающей `}, [openSessions]);` useMemo `openSessionByTableId` (строка ~3561). Grep-якорь для точного места:

```bash
grep -n "openSessionByTableId = useMemo" "pages/StaffOrdersMobile/staffordersmobile.jsx"
# Ожидание: 1 hit, строка ~3554. Вставить useEffect сразу после `}, [openSessions]);` этого useMemo.
```

**Alternative anchor если closing `}, [openSessions]);` имеет нестандартное форматирование (trailing comment / extra whitespace / multi-line deps):**
```bash
# Прочитать ~30 строк начиная с openSessionByTableId useMemo
sed -n '3554,3585p' "pages/StaffOrdersMobile/staffordersmobile.jsx"
# Найти первую строку после закрывающей `});` или `}, [openSessions]);` и до `const activeRequests`.
# Использовать последние 2 строки этого useMemo (с уникальной точностью) как Edit-anchor.
```

Причина (PQ-099): useEffect должен быть объявлен после всех useMemo/useCallback, от которых зависит, но до `const activeRequests` (~3565).

**[v4-C1 + v4-M7] Новый код (вставить):**

```js
  // Б2.1 Fix C: если появился hall-Order с table_session, но openSessionByTableId
  // ещё не знает о ней (staleTime race) — принудительно обновить openSessions.
  // Это ускоряет появление корректной карточки в «Активных» (до 5с → <1с).
  //
  // [v4-C1] FILTER: исключаем orders со status 'closed'/'cancelled' — у них table_session
  // остаётся (sessionHelpers.js:158-173), но они НЕ должны триггерить invalidate
  // (иначе для каждого закрытого hall-заказа без открытой сессии invalidate уйдёт
  // в каждом цикле polling → бесконечная нагрузка на сервер).
  //
  // [v4-M7] ONE-SHOT GUARD: запоминаем «уже инвалидировали для этой комбинации orphan-сигнатур»
  // через useRef. Сигнатура = отсортированная строка `tableId:sessionId,tableId:sessionId,...`.
  // Когда сигнатура не изменилась — НЕ вызываем invalidate повторно (доп. защита от race
  // если openSessions обновился, но всё ещё не содержит новую сессию).
  const orphanInvalidateSigRef = useRef(null);
  useEffect(() => {
    if (!Array.isArray(orders) || orders.length === 0) return;

    const orphanPairs = [];
    for (const o of orders) {
      if (o.order_type !== 'hall') continue;
      // [v4-C1] закрытые/отменённые orders не считаются orphan — они принадлежат завершённой сессии
      if (o.status === 'closed' || o.status === 'cancelled') continue;
      const tableId = getLinkId(o.table);
      if (!tableId) continue;
      const sessionId = getLinkId(o.table_session);
      if (!sessionId) continue;
      // Order ссылается на table_session, но SOM не видит эту сессию в openSessions
      const open = openSessionByTableId[tableId];
      if (!open || open.id !== sessionId) {
        orphanPairs.push(`${tableId}:${sessionId}`);
      }
    }

    if (orphanPairs.length === 0) {
      // Reset signature когда orphan'ы исчезли (нормальное состояние) — позволит
      // сработать invalidate ещё раз если в будущем появится новый orphan.
      orphanInvalidateSigRef.current = null;
      return;
    }

    // [v4-M7] one-shot guard: уникальная подпись текущего набора orphan'ов
    const signature = orphanPairs.sort().join(',');
    if (orphanInvalidateSigRef.current === signature) {
      // Уже инвалидировали для этой же комбинации — не повторяем.
      return;
    }
    orphanInvalidateSigRef.current = signature;
    // [v5-C1] Prefix invalidate — матчит ["openSessions", partnerId] для любого текущего partnerId.
    queryClient.invalidateQueries({ queryKey: ["openSessions"] });
  }, [orders, openSessionByTableId, queryClient]);
```

**⚠️ Dependency array useEffect — ДОБАВИТЬ только эти 3:** `orders`, `openSessionByTableId`, `queryClient`. НЕ включать `getLinkId` (origin определён в Preparation Step 2; если он component-scoped — обернуть в useCallback и добавить в deps; если imported — пропустить, как сейчас).

**⚠️ [V5-M3] Pre-check ДО вставки:** убедиться что `queryClient` в scope (из Preparation §3). Если переменная называется иначе — заменить в коде Fix C. Если `useQueryClient()` не вызван — STOP.

**⚠️ [V5-L5] Imports:** убедиться что `useRef` уже импортирован из 'react'. Pre-check (из Preparation §4) даст hit-count. Если нужно добавить — найти react import line (Preparation §4 grep `from 'react'`) и расширить список:

Single-line вариант (если текущая форма такая):
- old_string: `import { useState, useEffect, useMemo, useCallback } from 'react';`
- new_string: `import { useState, useEffect, useMemo, useCallback, useRef } from 'react';`

Multi-line вариант (если multi-line import) — использовать точный snippet из `grep -n "from 'react'"` + `sed -n` контекст. НЕ переформатировать multi-line в single-line и наоборот.

### Why not activeOrders? (Why not включить status filter в `activeOrders`?)

CC findings (Issue #1 CRITICAL): `orders` без status-фильтра ловил все hall orders включая закрытые → бесконечный invalidate-loop. Можно было бы переключиться на `activeOrders` (которые уже фильтрованы), но это бы пропустило свежесозданные orders с status='active' но через `shiftCutoff` отфильтрованные. Решение [v4-C1]: оставляем `orders` (раннее обнаружение) + явный inline-фильтр по status (исключает закрытые carryover).

### Why not useMemo вместо useEffect?
Это side-effect (invalidateQueries) — должен быть в useEffect, не useMemo.

### Safety (post-v4):
- useEffect НЕ создаёт таймеры/промисы → cleanup не нужен.
- Re-run frequency: при каждом refetch orders (polling ~10-60с) — ОК, signature-guard блокирует повторные invalidate для той же комбинации.
- Бесконечный цикл риск:
  - **Closed-order carryover (CC Issue #1):** ✅ закрыто фильтром `o.status === 'closed' || 'cancelled' → continue` (v4-C1).
  - **New-session race (genuine orphan):** invalidate срабатывает 1 раз → openSessions refetch → новая сессия попадает в `openSessionByTableId` → orphanPairs становится пустым → signature reset → готов к следующему orphan'у. ✅
  - **Stale openSessions response:** signature-guard (v4-M7) защищает: если openSessions вернул тот же набор без новой сессии — sig не изменилась → второго invalidate не будет.

### Verification после Fix C — [V5-C4 переписан: real identifiers]

```bash
# 1. [v5-C4] Проверка real identifiers в коде — НЕ hasOrphanedHallOrder (stale var из v3)
grep -n "orphanInvalidateSigRef" "pages/StaffOrdersMobile/staffordersmobile.jsx"
# Ожидание: ровно 3 hits — (a) `const orphanInvalidateSigRef = useRef(null);` объявление,
#                            (b) `if (orphanInvalidateSigRef.current === signature)` чтение,
#                            (c) `orphanInvalidateSigRef.current = signature;` запись, а также
#                            (d) `orphanInvalidateSigRef.current = null;` reset. Итог 3-4 hits.
# Допустимо: 3-4 hits в зависимости от того как форматтер объединяет reset.

grep -n "orphanPairs" "pages/StaffOrdersMobile/staffordersmobile.jsx"
# Ожидание: ≥3 hits — объявление, .push, .length check, .sort().join(',').

grep -n "orphanPairs.push" "pages/StaffOrdersMobile/staffordersmobile.jsx"
# Ожидание: 1 hit (внутри цикла for orders).

# 2. invalidateQueries openSessions присутствует в нужном месте
grep -n 'invalidateQueries({ queryKey: \["openSessions"\] })' "pages/StaffOrdersMobile/staffordersmobile.jsx"
# Ожидание: ≥2 hits (старый в confirmCloseTable + новый в Fix C useEffect).

# 3. [V5-C4] Stale references ОТСУТСТВУЮТ (если Codex/CC по ошибке написал вариант с этими именами)
grep -n "hasOrphanedHallOrder\|hasOrphanedOrder" "pages/StaffOrdersMobile/staffordersmobile.jsx"
# Ожидание: 0 hits (это имена переменных из v3 draft, в финальном коде v4/v5 их нет).

# 4. [V5-M3] Pre-check выполнен: queryClient в scope
grep -n "const queryClient = useQueryClient" "pages/StaffOrdersMobile/staffordersmobile.jsx"
# Ожидание: 1 hit — объявление внутри компонента (pre-existed, не добавляем).

# 5. [V5-L5] useRef import присутствует (либо был, либо добавили)
grep -c "useRef" "pages/StaffOrdersMobile/staffordersmobile.jsx"
# Ожидание: ≥2 (1 в import, 1 в const orphanInvalidateSigRef = useRef).

# 6. Syntax check не обязателен (JSX — не поддерживается node --check, PQ-072), но проверка линтом:
# Git push triggered CI lint / B44 deploy catch syntax → доверяем финальному git commit.
```

---

## Regression Check (обязательно после ВСЕХ Fix) — [V5-L1 typo fix]

Проверить, что ПРОДОЛЖАЕТ работать:

- [ ] Раскрытие/сворачивание одной карточки (click по header) → работает.
- [ ] Нельзя открыть 2 карточки одновременно (`expandedGroupId` single) → работает.
- [ ] Favorite star на столе → переключается, сохраняется между рендерами.
- [ ] Favorite filter (star) → показывает только избранные.
- [ ] Close Table из карточки стола → закрывает только open-session; старая закрытая карточка остаётся в «Завершённых» нетронутой.
- [ ] Pickup / Delivery заказы → отображаются в списке, тап работает.
- [ ] Active/Completed таб счётчики (tabCounts) → корректно считают (новая сессия в «Активные», старая в «Завершённые»).
- [ ] Banner-navigate (клик по alert баннеру о новом заказе) → скроллит к правильной карточке (текущей открытой сессии), раскрывает её. [V5-C3: call chain buildBannerInfo → banner.groupId (tableId) → onNavigate @ 2825 → prop @ 4610 → handleBannerNavigate @ 4142 → defensive резолв tableId → compositeKey]
- [ ] servedOrders query (нажать expand на карточке с served orders) → подтягивает historical served orders для tableId. [V5-L1: было «Servedot» typo]
- [ ] Kitchen mode (`isKitchen === true`) → видит flat `visibleOrders`, без карточек. `orderGroups` возвращает `null` → не ломается.
- [ ] Highlight (оранжевая подсветка 1.5с после banner-navigate) → применяется к правильной карточке.

---

## Mobile-first check (MANDATORY)

SOM — mobile-first waiter interface (375px). Изменения Fix A/B/C — backend группировка, UI не добавляется. Но т.к. FROZEN UX покрывает разметку OrderGroupCard — визуально на 375px:
- Карточки стола остаются той же ширины, одна под другой
- Нет новых touch-targets
- Нет новых overlay/sticky элементов

**Нечего менять в UI. Этот блок только для фиксации — CC/Codex не должны модифицировать стили/верстку.**

---

---

## Priority hierarchy (при конфликте с FROZEN UX)

1. **Fix A** (staleTime) — критический, simple, safe. Обязателен.
2. **Fix B.1-B.5** (orderGroups + filteredGroups + tabCounts + call-sites + data-group-id live @ 2292) — обязателен, основной UX-фикс.
3. **Fix B.6** (handleBannerNavigate) — обязателен если baserunner использует `data-group-id` для скроллинга (сегодня использует через call chain buildBannerInfo → onNavigate → handleBannerNavigate).
4. **Fix C** (orphan detection) — желательно. Если создаёт риски (бесконечные re-renders / CPU spike при множестве Orders) — исключить, Fix A+B достаточно для корректного UX.

**Минимальная рабочая комбинация для закрытия BUG-SM-015:** Fix A + Fix B.1-B.5 (без B.6 и C). UX при этом корректен, но banner-navigate может скроллить к не-той карточке (edge case, не блокер).

---

## Codex-specific SCOPE RESTRICTION (для codex-writer-v2 step)

⛔ **Запрещено:**
- Менять `components/sessionHelpers.js` (любые функции)
- Менять `pages/PublicMenu/useTableSession.jsx`
- Менять `pages/StaffOrdersMobile/BUGS.md`, README.md или любые документы
- Создавать новые компоненты/файлы
- Менять B44 entity schemas (они только читаются через api/base44Client)
- Менять i18n dictionaries, theme, CSS classes
- Менять `buildBannerInfo` или `onNavigate(banner.groupId)` call-site (upstream — FROZEN) [V5-L6]

⛔ **НЕ комбинировать** Fix B с любыми другими рефакторингами. Даже «очевидные» cleanup'ы (удаление неиспользуемых переменных, переименование хуков) — запрещены в этом батче.

---

## Safety Guards (финальный чек перед push)

- [ ] `grep "tableGroups\[tableId\]"` → 0 hits (замены полные)
- [ ] `grep "tableGroups\[compositeKey\]"` → ≥4 hits
- [ ] `wc -l` в диапазоне 4582-4687 [v5-M5]
- [ ] `node -e "require('esprima').parseModule(require('fs').readFileSync('...', 'utf8'))"` — пропускаем (JSX не поддерживается, но git push → B44 deploy поймает SyntaxError).
- [ ] `git diff main -- pages/StaffOrdersMobile/staffordersmobile.jsx` содержит изменения ТОЛЬКО в **8 локациях** [v4-L3, v5-M1 precision]: (1) openSessions staleTime (1 строка); (2) orderGroups useMemo (целиком); (3) filteredGroups (частично — только `if (group.type === 'table')` блок); (4) tabCounts (частично — только тот же блок); (5) OrderGroupCard map props (4 строки key/isExpanded/onToggleExpand/isHighlighted); (6) data-group-id live JSX @ ~2292 (1 место обязательно; ~565, ~1173 optional comment-only); (7) handleBannerNavigate useCallback (целиком); (8) новый useEffect + useRef Fix C.
- [ ] `queryKey: ["openSessions", partnerId]` @ ~3542 ОСТАЛСЯ без изменений (только `staleTime` внутри блока изменён) [V5-C1]
- [ ] `buildBannerInfo` и `onNavigate(banner.groupId)` call-site @ ~2825 НЕ изменены [V5-L6]
- [ ] (если требовалось pre-check) `useRef` импорт добавлен в существующий import block.
- [ ] `useQueryClient()` / `queryClient` в scope (pre-existed, не меняем) [V5-M3]
- [ ] Никаких изменений в других файлах (sessionHelpers.js, useTableSession.jsx, PublicMenu/*, docs).
- [ ] Commit message: `fix(SOM): BUG-SM-015 session-aware orderGroups + staleTime 30s→5s + orphan invalidate`

---

## Notes для рецензента ПССК

Fix типы: Fix A `[FIX]` safe/single; Fix B `[FIX]` составной (7 суб-правок через `group.sessionId`); Fix C `[NEW CODE]` performance. Все anchors проверены в Pre-flight — если count не совпадает → STOP + Arman.
=== END ===
