---
chain_template: pssk-review
budget: 10
code_file: pages/PublicMenu/CartView.jsx
ws: WS-CV
type: ПССК
pc_verdict: GO
---

# ПССК CV-B2 — CartView Batch 2
**Версия:** v19 | **Сессия:** S317 | **Дата:** 2026-04-17
**Изменения v19 vs v18 (3 блокера из коу v18 — ТОЛЬКО Fix 3, Fix 1/2/4 не изменены):**
(A) **Codex C1 — убран `partnerId` (не в props):** key = `cv_terminal_dismissed_${currentTableKey}` (без restaurant prefix). Шаг 3.0 убран. Все 4+ `partnerId` placeholder'а убраны.
(B) **Codex C2 — `o.guest_id` → `(getLinkId ? getLinkId(o.guest) : o.guest)`:** guest_id = 0 hits в файле, реальный паттерн = getLinkId normalization (lines 407/499). Правки в Шаге 1.0 (todayMyOrders) и Шаге 3.2b (sessionSelfTotal).
(C) **Codex MEDIUM — AC Fix3:** `ordersSum > 0` → `sessionSelfTotal > 0`.

**Изменения v18 vs v17 (4 Must-фикса из коу v17):**
(1) **MUST — CWD/Paths (17 итераций!):** все bash команды исправлены — убран prefix `menuapp-code-review/` перед путями. Working Directory section переписана: cwd = корень worktree (= menuapp-code-review репозиторий), пути = `pages/PublicMenu/CartView.jsx` (без prefix). Закрывает хронический CC CRITICAL C1+C2 из v1-v17.
(2) **MUST — `isCancelledOrder` predicate:** расширен для соответствия `getSafeStatus()` (lines 321-322): добавлена проверка `si?.internal_code === 'cancelled'` (past-tense форма). Insertion point перемещён с «перед `statusBuckets` line 456» на «перед `todayMyOrders` line ~443» — чтобы helper был доступен в `todayMyOrders` filter. Добавлен Шаг 1.0: обновить `todayMyOrders` filter для использования `isCancelledOrder(o)` (закрывает Codex CRITICAL — cancelled заказы утекали в `todayMyOrders`/`ordersSum`/`renderedTable*`/`tableIsClosed`).
(3) **REVERTED — Fix3 storage key:** `partnerId` не существует в props CartView.jsx (Codex C1 из коу v18). Ключ возвращён к `cv_terminal_dismissed_${currentTableKey}` (per-table, без restaurant prefix). Restaurant-scoped key — в следующем батче когда prop появится.
(4) **MUST — Fix3 guest matching (Codex C2 из коу v18):** `o.guest_id` не существует в CartView.jsx (0 hits). Исправлен на `(getLinkId ? getLinkId(o.guest) : o.guest)` — реальный паттерн из lines 407/499. Обновлены: `todayMyOrders` filter (Шаг 1.0) + `sessionSelfTotal` filter (Шаг 3.2b). AC Fix3: `ordersSum > 0` → `sessionSelfTotal > 0` (Codex MEDIUM из коу v18).

**Изменения v17 vs v16:** (1) **Fix3 verification drift** — строки 526/528 (`submittedTableTotal`) удалены Fix 1 Step 1.3; verification grep в Fix 3 обновлён: добавлена ⚠️ заметка что эти hits НЕ будут после Fix 1 — это нормально, подтверждение `'submitted'` перенесено в Preparation. (2) **Fix4 AC `Гость ?`** — добавлен fallback note в AC: если myGuestId не в sessionGuests → `«Гость ?»` — ожидаемый fallback, не дефект. (3) **Fix3 closeSession source** — добавлена ссылка на `sessionHelpers.js` (commit 35726f1) для верификации контракта. (4) **Fix2 verification grep** — усилен до context-grep ±3 строки вокруг `bucketDisplayNames[` вместо same-line only.
**Изменения v16 vs v15:** (1) **Fix4 AC `!` missing** — AC bullet `filter(isCancelledOrder)` → `filter((o) => !isCancelledOrder(o))`. AC теперь точно описывает «active (non-cancelled) self orders». (2) **Fix3 AC predicate** — `nonCancelled = sessionOrders.filter(o.status !== 'cancelled')` → `filter((o) => !isCancelledOrder(o))` — выровнен с кодом (нормализованный predicate). (3) **Fix3 Step 3.2 stale comment** — `currentTable?.name || currentTable?.code` → `currentTable?.code || currentTable?.name` (code-first, последний выживший name-first артефакт). (4) **Fix2 AC badge visibility** — добавлено `otherGuestsExpanded` условие: badge видим только когда collapsed block открыт.
**Изменения v15 vs v14:** (1) **CRITICAL Fix4 (Codex)** — добавлен `activeMyOrdersInSession` фильтр: самозаказы рендерятся только активные (без cancelled), аналогично `selfTotal`. Ранее `selfTotal` фильтровал cancelled, а `myOrdersInSession.map(...)` итерировал все → header/rows рассинхронизированы. Теперь обе операции используют `activeMyOrdersInSession.filter(isCancelledOrder)`. AC обновлён. (2) **MEDIUM Fix3 — шаги переставлены физически** — Шаг 3.3 (useEffect, sync при смене стола) теперь идёт В ДОКУМЕНТЕ ПЕРЕД Шаг 3.4 (early return). Убран мета-комментарий «порядок документа ≠ порядок кода» — он вводил в замешательство. (3) **MEDIUM Fix3 — currentTableKey нормализован** — все упоминания в prose, comment и разделе «Почему code\|\|name» изменены с `name || code` на `code || name` (code-first). (4) **MEDIUM Fix2 — double-label задокументирован** — добавлена явная директива: row status label у submitted заказов = `getSafeStatus(null)` → `В работе` (это нормально, НЕ менять `getSafeStatus`). Badge `⏳ Ожидает` и лейбл `В работе` видны одновременно — intentional design. (5) **LOW Fix4** — добавлена заметка о `getGuestLabelById` fallback для edge case когда `myGuestId` не в `sessionGuests`.
**Изменения v14 vs v13:** (1) **C1 (Codex-CRITICAL, Fix1/Fix4)** — убрано слово «rendered-data invariant» из заголовка Fix 1 и Fix 4. AC переформулированы: «Header shows active-orders totals (non-cancelled only). Section 5 still renders ALL orders — by design (service staff view).» Invariant claim больше не заявляется. (2) **C2 (Codex-CRITICAL, Fix4)** — добавлена защита `if (selfTotal === 0) return null;` внутри IIFE Шаг 4.1: self-block НЕ отображается если все self-заказы отменены. AC обновлён. (3) **M1 (Codex-MEDIUM, Fix3)** — `currentTableKey` изменён с `name || code` на `code || name`: `code` стабильнее и уникальнее чем `name` (name не уникален, может повторяться). Комментарий + AC обновлены. (4) **M2 (Codex-MEDIUM, Fix2)** — `getOrderStatus` контракт переформулирован из «ASSUMPTION» в «Verified contract» с явным описанием: B44 returns rawStatus='submitted' для pending WITHOUT confirmed stage → stageInfo=null + rawStatus='submitted' → isPending=true. (5) **CC-MEDIUM (Issue 1)** — закрыта jsx fence (` ``` `) после `isCancelledOrder` helper в Fix 1 Part A. (6) **CC-MEDIUM (Steps 3.3/3.4)** — переставлены местами: теперь Шаг 3.3 = useEffect (sync при смене стола), Шаг 3.4 = early return. Порядок в документе соответствует порядку в коде (Rules of Hooks: все хуки → conditional return). (7) **CC-MEDIUM (Issue 7)** — добавлен grep для `setView` в Fix 3. (8) **CC-MEDIUM (Issue 8)** — добавлен grep `SECTION 5: TABLE ORDERS` как anchor в Fix 4 Шаг 4.1.
**Изменения v13 vs v12:** (1) **CC-CRITICAL Fix 2 TDZ** — `isCancelledOrder` helper перемещён из «между 523-525» в начало Fix 1 Шаг 1.1: теперь вставляется **ПЕРЕД** `statusBuckets` (line ~455), НЕ после `tableOrdersTotal` (line ~524). Причина: `statusBuckets` (line 456) зовёт `isCancelledOrder` в своём callback; если helper объявлен НИЖЕ → TDZ crash на первом render. Три renderedTable* useMemo остаются на прежнем месте (после `tableOrdersTotal`, ~524). (2) **Codex-CRITICAL Fix 3 Step 3.2 anchor** — удалён неверный «ordersSum ~530» ориентир; `ordersSum` реально находится на line ~490, т.е. ВЫШЕ Fix 1 блока и после Fix 1 не смещается до 530. Замена: anchor теперь однозначный — «ПОСЛЕ закрывающей строки `renderedTableGuestCount` useMemo, ПЕРЕД `const getGuestLabelById`».  (3) **Codex-MEDIUM Fix 2 Step 2.4c** — rationale переписан: цель `otherGroupsExist = true` — НЕ «served не collapsed», а «предотвратить auto-expand served при наличии pending»; порядок отображения bucket'ов не изменён (R1 FROZEN: served→in_progress→pending_unconfirmed).

PC-VERDICT: GO
> пч v18: прогнан S317 — 0 hard violations, B13 SOFT-WARN justified (4 Fix, 17 iterations адресовано). ✅
> пч v19: только Fix 3 изменён (3 точечных правки: убран partnerId + guest_id fix + AC). Новых нарушений нет. ✅

**Изменения v11 vs v10:** (1) **CC+Codex-CRITICAL TDZ** — Fix 3 Step 3.2 placement перенесён: `tableIsClosed` теперь вставляется ПОСЛЕ Fix 1 блока (после `renderedTableGuestCount`, ~563 post-Fix-1) вместо ~490. Причина: `tableIsClosed` вызывает `isCancelledOrder` (объявлен в Fix 1 ~524) — если вставить перед этим, const находится в TDZ при первом render → ReferenceError crash. Также обновлён Rules of Hooks comment (убрана ошибочная фраза «перед всеми остальными useMemo»). (2) **CC+Codex-MEDIUM deps** — `getOrderStatus` добавлен в deps всех 4 useMemo: `renderedTableTotal`, `renderedTableDishCount`, `renderedTableGuestCount` (Fix 1) и `tableIsClosed` (Fix 3). (3) **Codex-MEDIUM loading state** — добавлена явная директива: при пустом `sessionItems` или `itemsByOrder` `renderedTableDishCount` = 0 (Map.get returns undefined → items=[]), `renderedTableTotal` = 0. Загрузочное состояние не требует отдельной ветки. (4) **Codex-MEDIUM pending_unconfirmed expansion** — Fix 2 Step 2.6 теперь явно указывает: badge рендерится внутри `{otherGuestsExpanded && ...}` collapsed-by-default — это intentional, не auto-expand при pending_unconfirmed. AC добавлен. (5) **CC-MEDIUM baseline numbering** — Fix 2 Steps 2.4b/2.4c добавлена директива: "всегда использовать grep, номера строк — только ориентир".
**Изменения v10 vs v9:** (1) Codex-CRITICAL i18n — §⚠️ i18n Exception переформатирован: `tr()` уже имеет fallback-строки → UI НЕ покажет raw ключи, dictionary additions НЕОБЯЗАТЕЛЬНЫ (NON-MANDATORY). (2) Codex Fix 1 (3/5) — `isCancelledOrder(o)` helper добавлен перед useMemo'ами, нормализует predicate аналогично lines 443-446/459-463; весь Fix 1+4 cancelled-фильтр использует helper вместо raw check. (3) Codex Fix 3 (3/5) — closeSession B44 contract теперь explicit: S286 Б1 КС подтверждён — closeSession() устанавливает все заказы в `status: 'closed'` атомарно; note повышен до verified, не assumption. (4) Codex-MEDIUM grep — `grep -a -n "currentTable\\?\\."` исправлен на `grep -a -nE "currentTable\\?\\."` (BRE `\?` = quantifier, не literal; ERE -E правильно матчит `?.`).
**Изменения v9 vs v8:** (1) Codex-MEDIUM Fix 2 — добавлен Шаг 2.4c: обновление `otherGroupsExist` (line 481) добавлением `pending_unconfirmed` в collapse-предикат; без этого `served` bucket остаётся collapsed при `served + pending_unconfirmed` состоянии. (2) Codex-MEDIUM Fix 3 — `currentTableKey` исправлен с `name ?? code` на `name || code` (identity parity с line 385 `name || code || "—"`, `??` расходится при `name === ""`).

**Изменения v8 vs v7:** (1) CC-CRITICAL — Fix 3 Step 3.2 comment + AC: `code ?? name` исправлен на `name ?? code` (алигн с Step 3.1 и line 385). (2) Codex-CRITICAL — Fix 2: добавлен Шаг 2.4b — обновление `isV8` condition (строки 928-930) с `statusBuckets.pending_unconfirmed.length === 0`; без этого сессия с `served > 0` + `pending_unconfirmed > 0` + `in_progress === 0` + empty cart показывала «Ничего не ждёте» без pending bucket. (3) Codex-CRITICAL — Fix 2 Step 2.0: `'submitted'` grep перемещён в Preparation (до Fix 1), т.к. Fix 1 Step 1.3 удаляет единственный hit (line 528). (4) CC-MEDIUM — Fix 2 Step 2.5: цель Edit сужена до `<span>` (не `<div>`) — безопасно для siblings. (5) Line-drift disclaimer добавлен в Fix 2/3/4. (6) Codex-MEDIUM cancelled predicate: ASSUMPTION note добавлена. (7) Mobile QA → Manual QA (non-blocking для reviewer).

**Изменения v7 vs v6:** (1) C1 — Fix 2 Шаг 2.6 + Fix 4 inner map: badge `isOrderPending` теперь использует ТОТ ЖЕ guard что `statusBuckets`: `!stageInfo?.internal_code && rawStatus === 'submitted'` (не только rawStatus — устраняет amber «Ожидает» рядом с «В работе»). (2) C2 — `renderedTableGuestCount` теперь считает только гостей с ≥1 non-cancelled заказом (иначе гость с только cancelled-заказами попадал в count но не в total → рассинхрон). (3) M2 — `currentTableKey` precedence исправлен: `name ?? code` (совпадает с line 385 `name || code`). (4) M1 — Шаг 2.0b переписан как assumption (getOrderStatus — prop, runtime нельзя верифицировать grep'ом). (5) L1 — Шаг 2.5 динамический Tailwind → static class map (полные literal строки). + 3 minor: CC-M badge-visibility note; CC-L text-amber-600 line 748 fix; placement claim «перед ordersSum useMemo».

**Изменения v6 vs v5:** Адресованы все blockers из v5 CC+Codex review: (1) Fix 4 Шаг 4.1 — `selfTotal` теперь фильтрует `cancelled` заказы (=совпадает с формулой `renderedTableTotal` в Fix 1, нет расхождения в итогах); (2) Fix 3 Шаг 3.2 — `tableIsClosed` расширен: `'cancelled'` заказы игнорируются (не мешают показу Terminal после pre-close отмен); (3) Все `grep -n` → `grep -a -n` (binary-safe, NUL byte offset 56177 в CartView.jsx); (4) `grep -n "currentTable\."` → `grep -a -n "currentTable\\?\\."` (optional chaining fix); (5) `bucketOrder` grep → `-E` word boundary (не матчит `renderBucketOrders`); (6) Добавлена декларация cwd перед Preparation; (7) Счётчик строк `1227` → `~1227`; (8) Fix 2 Шаг 2.5 — исправлена опечатка «НЕ используется нигде»; (9) Добавлена директива порядка применения Fix 1→2→3→4.

**Изменения v5 vs v4:** Fix 3 — исправлены 2 блокера из Codex+CC review: (1) localStorage ключ изменён с единственного `cv_terminal_dismissed` на per-table `cv_terminal_dismissed_{tableKey}` в соответствии с R4 FROZEN spec; (2) `currentTableKey` теперь использует `currentTable?.code ?? currentTable?.name` (оба верифицированы line 385) вместо непроверенного `currentTable?.id`. Fix 2 — добавлен Шаг 2.0b: grep верификация `getOrderStatus` для submitted заказов (Codex finding Fix2 3/5).

**Изменения v4 vs v3:** ВСЕ 13 findings из v3 пересмотра адресованы. Verified identifiers (`bucketDisplayNames` не `groupLabels`). Fix 2 через расширение `bucketOrder` массива (НЕ статический JSX-блок). Fix 3 wrap через early-return с безопасной точкой. Fix 3 data source = `sessionOrders.every(o.status === 'closed')` (verified, `currentTable.status` отсутствует). Fix 4 без изменения cascade `showTableOrdersSection` (self-block просто добавляется внутрь секции «Стол»). Кнопка Fix 3 — shadcn `<Button>`. Все placeholder'ы заменены concrete JSX. Orphan `submittedTableTotal` явно удалён.

---

## Context

**File:** `pages/PublicMenu/CartView.jsx` (path from worktree root)
**Lines:** ~1227 | **Last RELEASE commit:** `fa73c97` (RELEASE `260415-01 CartView RELEASE.jsx`)
**UX Source of Truth:** `ux-concepts/CartView/260416-02 CartView Mockup v11 S302.html` (FROZEN v11)

> ⚠️ **Note:** All FROZEN UX and spec content needed for review is provided **inline** in this file below. Do NOT attempt to read external files outside `menuapp-code-review/` — they are inaccessible in worktree.

This prompt covers **4 Fix-blocks** for CartView Batch 2:
- **Fix 1 [BUG at lines 787-807]:** Header attribution «Вы:»/«Стол:» + rendered-data invariant (R2, CV-NEW-01)
- **Fix 2 [NEW CODE]:** ⏳ Ожидает bucket — pending pre-acceptance state (R1)
- **Fix 3 [NEW CODE]:** ✦ Terminal screen «Спасибо за визит!» with durable persist (R4)
- **Fix 4 [BUG at line 834]:** Self-first «Вы (Гость N)» в «Стол» (CV-NEW-03, CV-16/17)

**Scope lock:** Only `pages/PublicMenu/CartView.jsx`. No changes to other files.

---

## ⛔ FROZEN UX — ОБЯЗАТЕЛЬНО К СОБЛЮДЕНИЮ (Rule 33)

Следующие решения LOCKED. Нельзя оспаривать, изменять или предлагать альтернативы.
(Source: DECISIONS_INDEX §2, content inlined here.)

| ID | Решение |
|----|---------|
| **R1** | `'submitted'` статус → `⏳ Ожидает` (текст + иконка, НЕ иконка-only). `'accepted'/'ready'/'in_progress'` → `🔵 В работе` (уже так). «Ожидает» bucket — СНИЗУ «Мои» (ниже «В работе»). Badge «Ожидает» — ТОЛЬКО в табе «Стол» (per-item). В «Мои» — badge нет, достаточно amber bucket-заголовка. |
| **R2** | Таб «Мои» header → `«Вы: X блюд · X ₸»`. Таб «Стол» header → `«Стол: X гостя · X блюд · X ₸»`. Сумма = from rendered-data (НЕ из `submittedTableTotal`). Количество блюд = сумма quantity (НЕ count заказов). |
| **V4** | Standalone CTA «Попросить счёт» УБРАН. Footer «Стол»: «Вернуться в меню» (outline) + helper «Нужна помощь или счёт? Нажмите 🔔». |
| **R4** | Terminal = единый экран «Спасибо за визит!» при закрытии стола. Durable persist `cv_terminal_dismissed_{tableId}` (localStorage). |
| **CV-52** | «В работе»: calm bg, без stepper. «В корзине»: яркий, stepper видим. Badge «Отправлено» убран везде. |
| **CV-50** | Деньги убраны из групп (В работе, В корзине, Выдано). Деньги ТОЛЬКО в header drawer. |
| **CV-16/17** | Self-block «Вы (Гость N)» — первым в «Стол», expanded. Остальные гости — collapsed по умолчанию. |
| **stale helper** | Helper «Проверяем подтверждение…» (`stale_pending`) — УБРАН (S302). НЕ восстанавливать. |

---

## Working Directory

> **cwd для всех bash команд = корень worktree** (= `menuapp-code-review` репозиторий). ВЧР запускает writer в worktree: `C:\Dev\worktrees\task-YYYYMMDD-HHMMSS-NNN\`. Это и есть `menuapp-code-review/` root. Все пути в bash командах — относительные от этого корня: `pages/PublicMenu/CartView.jsx` (без `menuapp-code-review/` prefix). CC writer: выполни `pwd` при старте, ожидаем путь вида `C:/Dev/worktrees/task-*/` (НЕ `Menu AI Cowork/`).

---

## Fix Application Order

> ⚠️ **ОБЯЗАТЕЛЬНЫЙ ПОРЯДОК применения:** Fix 1 → Fix 2 → Fix 3 → Fix 4 (строго последовательно).
>
> **Причина:** номера строк в каждом Fix рассчитаны по состоянию файла ДО этого Fix'а. Fix 1 вставляет 3 useMemo (~30 строк) и удаляет 7 строк → все последующие Fix'ы смещаются. Fix 2 добавляет строки → Fix 3 и Fix 4 смещаются. Применение не в порядке = неверные номера строк = ошибка.

---

## Preparation

```bash
cp pages/PublicMenu/CartView.jsx pages/PublicMenu/CartView.jsx.working
wc -l pages/PublicMenu/CartView.jsx
# Ожидаем: ~1227 строк (±5)
git log --oneline -1
# Ожидаем: fa73c97 или новее
```

> ✅ **v12 — `.working` = recovery backup ONLY.** Все grep-верификации и Edit/Write операции выполняются над оригинальным **`CartView.jsx`** — НЕ над `.working`. `.working` создаётся только как страховочная копия на случай если что-то пойдёт не так; он НЕ является target файлом для правок и НЕ участвует в commit. После применения всех Fix'ов `.working` можно удалить.

**Pre-Fix-1 snapshot grep** — выполнить ДО Fix 1 (Fix 1 Step 1.3 удаляет line 528 которая содержит единственный `'submitted'` литерал):

```bash
grep -a -n "'submitted'" pages/PublicMenu/CartView.jsx
```
Ожидаем: `line 528` (`o.status === 'submitted'` в filter для `submittedTableTotal`). Это подтверждает что `'submitted'` — легитимное значение `order.status` → Fix 2 маппинг `rawStatus === 'submitted'` корректен. Если 0 hits — **ОСТАНОВИТЬСЯ**, сообщить Cowork: «статус `'submitted'` не найден до Fix 1, маппинг Fix 2 требует проверки».

---

## Verified Identifiers (grep before first Fix)

Эти grep'ы обязательно выполнить ОДИН раз перед Fix 1 — они подтверждают что в коде используются ТЕ имена что в ПССК.

```bash
grep -a -n -E "bucketDisplayNames|groupLabels" pages/PublicMenu/CartView.jsx
grep -a -nw "bucketOrder" pages/PublicMenu/CartView.jsx
```
Ожидаемый результат:
- Hit `bucketDisplayNames`: строки **574**, **950**, **1023** (3 hits — определение + два использования)
- Hit `bucketOrder` (word-bounded, `-w`): строка **1005** (1 hit — определение массива; НЕ матчит `renderBucketOrders` на ~627/995)
- Hit `groupLabels`: **0 hits** (этого идентификатора НЕ существует в файле; если хоть один hit — это ошибка, stop и сообщить)

```bash
grep -a -n "showTableOrdersSection\|otherGuestIdsFromOrders" pages/PublicMenu/CartView.jsx
```
Ожидаемый результат:
- `showTableOrdersSection`: строка **542** (определение) + строки **824**, **834**, **920**, **927**, **1075** (5 использований)
- `otherGuestIdsFromOrders`: строка **510** (определение) + ≥6 использований внутри рендер-блока

```bash
grep -a -nE "currentTable\?\." pages/PublicMenu/CartView.jsx
```
> ✅ **v10 fix:** Флаг `-E` (ERE) обязателен — в BRE (без `-E`) `\?` трактуется как квантификатор «0 или 1», а не literal `?`. С `-E`: `currentTable\?\.` → literal `?.` → правильно матчит `currentTable?.name` / `currentTable?.code`. Без `-E` grep может дать 0 hits на строке 385, хотя она существует.

Ожидаемый результат:
- Строка **385**: `currentTable?.name || currentTable?.code` — только name/code usages
- **`currentTable?.status` или `currentTable.status` — 0 hits** (поле status НЕ подтверждено на объекте `currentTable`, нельзя его использовать)

---

## Fix 1 — Header Attribution — Active-Orders Totals [BUG at lines 787-807]

**Проблема:** Header использует `submittedTableTotal` (агрегат из строк 525-531) вместо суммы реально отрендеренных блюд. Нет атрибуции «Вы:»/«Стол:». [CV-NEW-01]

> ✅ **v14 (C1): Design intent.** Header counts active-orders totals (non-cancelled only). Section 5 «Заказы стола» intentionally renders ALL orders including cancelled — this is the service-staff-facing view, by design. These are TWO DIFFERENT VIEWS with different purposes. No cross-view invariant is claimed.

### Верификация grep перед ревью
```bash
grep -a -n "submittedTableTotal\|Заказано на стол\|table_ordered\|ordersItemCount" pages/PublicMenu/CartView.jsx
```
Ожидаем:
- `line 525-531`: определение `submittedTableTotal` (useMemo агрегат)
- `line 788`: начало условного блока header (`ordersSum > 0 || cart.length > 0 || (cartTab === 'table' && submittedTableTotal > 0)`)
- `line 789-792`: `ordersItemCount` — сумма quantity, НЕ count заказов (важный образец)
- `line 799`: текущий «Заказано на стол» render с `submittedTableTotal` — это баг (нет атрибуции, не из рендер-данных)

### Текущий код (строки 787-807, точная копия)

```jsx
{/* CV-50: Dish count + total sum in drawer header (orders + cart) */}
{(ordersSum > 0 || cart.length > 0 || (cartTab === 'table' && submittedTableTotal > 0)) && (() => {
  const ordersItemCount = todayMyOrders.reduce((sum, o) => {
    const items = itemsByOrder.get(o.id) || [];
    return sum + items.reduce((s, it) => s + (it.quantity || 1), 0);
  }, 0);
  const cartItemCount = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
  const totalDishCount = ordersItemCount + cartItemCount;
  const headerTotal = ordersSum + (Number(cartTotalAmount) || 0);
  return cartTab === 'table'
    ? (
      <div className="text-xs text-slate-500 mt-0.5">
        {tr('cart.header.table_ordered', 'Заказано на стол')}: {formatPrice(parseFloat(Number(submittedTableTotal).toFixed(2)))}
      </div>
    )
    : totalDishCount > 0 ? (
      <div className="text-xs text-slate-500 mt-0.5">
        {totalDishCount} {pluralizeRu(totalDishCount, tr('cart.header.dish_one', 'блюдо'), tr('cart.header.dish_few', 'блюда'), tr('cart.header.dish_many', 'блюд'))} · {formatPrice(parseFloat(headerTotal.toFixed(2)))}
      </div>
    ) : null;
})()}
```

### Что нужно сделать

**Шаг 1.0 (NEW in v18)** — Добавить `isCancelledOrder` helper **ПЕРЕД** `todayMyOrders` и обновить `todayMyOrders` filter.

> ✅ **v18 fix (Codex CRITICAL):** helper теперь объявляется ПЕРЕД `todayMyOrders` (line ~443) — а не перед `statusBuckets` (line 456). Это позволяет `todayMyOrders` использовать `isCancelledOrder(o)` для исключения cancelled заказов (включая stage-code cancel), устраняя утечку в `ordersSum`/`renderedTable*`/`tableIsClosed`. TDZ безопасен — `statusBuckets` (line 456) по-прежнему ниже helper'а.

```bash
# Шаг 1.0a: найти todayMyOrders useMemo definition
grep -a -n "todayMyOrders\s*=" pages/PublicMenu/CartView.jsx | head -3
# Ожидаем: строка ~443 — useMemo definition
```

Найти строку `const todayMyOrders = React.useMemo(`. Вставить `isCancelledOrder` helper **НЕПОСРЕДСТВЕННО ПЕРЕД** этой строкой.

```jsx
// Fix 1 (R2, v18): Shared cancelled-order helper — declared BEFORE todayMyOrders (v18: moved from line ~455).
// v18 ALIGNMENT WITH getSafeStatus() lines 321-322: getSafeStatus checks internal_code === 'cancel'
// AND internal_code === 'cancelled' (past-tense). Previous versions only checked 'cancel' → missed orders
// where B44 uses 'cancelled' stage code.
// B44 also sets raw status='cancelled' when no stage assigned.
// All useMemos that call isCancelledOrder are at or below this declaration (TDZ safe).
const isCancelledOrder = (o) => {
  const si = getOrderStatus(o);
  return (si?.internal_code === 'cancel')
    || (si?.internal_code === 'cancelled')  // v18: align with getSafeStatus() lines 321-322
    || (!si?.internal_code && (o.status || '').toLowerCase() === 'cancelled');
};
```

**Шаг 1.0b** — Обновить `todayMyOrders` useMemo — заменить inline cancelled-check на `isCancelledOrder(o)`.

```bash
# Шаг 1.0b: прочитать todayMyOrders useMemo чтобы найти inline cancelled check
# (ориентировочно 4 строки начиная с найденной строки)
grep -a -n "todayMyOrders\s*=" pages/PublicMenu/CartView.jsx | head -1
# Прочитать: Read pages/PublicMenu/CartView.jsx --offset=LINE --limit=15
```

В теле `todayMyOrders.filter(...)` найти условие которое исключает cancelled заказы (обычно: `(o.status || '').toLowerCase() !== 'cancelled'`). **Заменить** это условие на `!isCancelledOrder(o)`.

Примерный вид замены (адаптировать к реальному коду):
```jsx
// БЫЛО:
const todayMyOrders = React.useMemo(() => {
  if (!myGuestId) return [];
  return (allOrders || []).filter(o =>
    (getLinkId ? getLinkId(o.guest) : o.guest) === myGuestId  // v19: fix Codex C2 — o.guest_id does not exist; use getLinkId normalization (lines 407/499)
    && (o.status || '').toLowerCase() !== 'cancelled'  // ← inline check (misses stage-code cancel)
  );
}, [allOrders, myGuestId]);

// СТАЛО (v18: use isCancelledOrder which covers all cancel forms):
const todayMyOrders = React.useMemo(() => {
  if (!myGuestId) return [];
  return (allOrders || []).filter(o =>
    (getLinkId ? getLinkId(o.guest) : o.guest) === myGuestId  // v19: fix Codex C2 — o.guest_id does not exist
    && !isCancelledOrder(o)  // v18: normalized predicate (cancel + cancelled internal_code + raw)
  );
}, [allOrders, myGuestId, getOrderStatus]);  // v18: add getOrderStatus to deps (used by isCancelledOrder)
```

> ⚠️ Reviewer: адаптировать к реальному коду `todayMyOrders`. Паттерн замены: `(o.status || '').toLowerCase() !== 'cancelled'` → `!isCancelledOrder(o)`. Добавить `getOrderStatus` в deps если его там нет.

**Шаг 1.1 Part A** — `isCancelledOrder` уже вставлен в Шаге 1.0. Шаг 1.1 описывает только Part B (3 useMemo агрегатов) и Part B placement.

⚠️ **КРИТИЧНО v13 (сохраняется в v18):** helper ДОЛЖЕН быть объявлен ДО `statusBuckets` useMemo (line 456), иначе TDZ crash. В v18 helper теперь ещё выше — перед `todayMyOrders` (~443) — что даёт ещё большую безопасность.

> ✅ **v18 Part A note:** helper объявлен в Шаге 1.0 (перед todayMyOrders). Part A insertion вынесен в Шаг 1.0. Пропустить старую Локация Part A, перейти к Part B.

```jsx
// Fix 1 (R2, v18): helper уже объявлен в Шаге 1.0 выше.
// isCancelledOrder в scope для всех useMemo ниже (todayMyOrders, statusBuckets, renderedTable*, tableIsClosed).
```

**Шаг 1.1 Part B** — Добавить 3 `useMemo` для rendered-data агрегатов.

Локация Part B: сразу ПОСЛЕ `tableOrdersTotal` useMemo (строка 514-523) и ДО `submittedTableTotal` (строка 525). Вставить между строками 523 и 525. `isCancelledOrder` уже в scope (объявлена в Part A выше).

```jsx
// Fix 1 (R2): rendered-data aggregates across ALL guests (self + others) for «Стол» header
const renderedTableTotal = React.useMemo(() => {
  let total = 0;
  const allGuestIds = [...(myGuestId ? [myGuestId] : []), ...otherGuestIdsFromOrders];
  allGuestIds.forEach((gid) => {
    const orders = ordersByGuestId.get(gid) || [];
    orders.forEach((o) => {
      if (!isCancelledOrder(o)) {
        total += Number(o.total_amount) || 0;
      }
    });
  });
  return parseFloat(total.toFixed(2));
}, [ordersByGuestId, myGuestId, otherGuestIdsFromOrders, getOrderStatus]);

// Fix 1 (R2): dish count = sum of item quantities (same semantics as ordersItemCount line 789-792)
const renderedTableDishCount = React.useMemo(() => {
  let count = 0;
  const allGuestIds = [...(myGuestId ? [myGuestId] : []), ...otherGuestIdsFromOrders];
  allGuestIds.forEach((gid) => {
    const orders = ordersByGuestId.get(gid) || [];
    orders.forEach((o) => {
      if (isCancelledOrder(o)) return;
      const items = itemsByOrder.get(o.id) || [];
      count += items.reduce((s, it) => s + (it.quantity || 1), 0);
    });
  });
  return count;
}, [ordersByGuestId, myGuestId, otherGuestIdsFromOrders, itemsByOrder, getOrderStatus]);

// Fix 1 (R2): guest count = guests with ≥1 non-cancelled order (matches renderedTableTotal filter).
// v7: must NOT count guests with only cancelled orders — their total = 0 but header would include
// them in count → "2 гостя · 500₸" while one guest has 0₸ (all cancelled). Inconsistent.
// Note: Section 5 «Заказы стола» still renders ALL orders including cancelled — by design,
// this is the service staff-facing view. Only the HEADER counts active guests.
const renderedTableGuestCount = React.useMemo(() => {
  const hasNonCancelled = (gid) =>
    (ordersByGuestId.get(gid) || []).some((o) => !isCancelledOrder(o));
  const selfCount = myGuestId && hasNonCancelled(myGuestId) ? 1 : 0;
  const othersCount = otherGuestIdsFromOrders.filter(hasNonCancelled).length;
  return selfCount + othersCount;
}, [myGuestId, ordersByGuestId, otherGuestIdsFromOrders, getOrderStatus]);
```

> ✅ **Verified identifiers:**
> - `myGuestId` (line 508), `ordersByGuestId` (line 496), `otherGuestIdsFromOrders` (line 510), `itemsByOrder` (prop line 53). Все существуют.
> - `getOrderStatus` — prop (line 54), доступна в scope. Добавлена в deps всех 3 useMemo (v11).
> - Функция `pluralizeRu` (line 299) — доступна в scope.
> - `isCancelledOrder` — определена прямо выше, в scope для всех Fix 1/4 useMemo.

> ✅ **v11: Loading state** — при пустом `itemsByOrder` (пока данные ещё грузятся) `Map.get(o.id)` возвращает `undefined` → `items = []` → количество блюд = 0. Это корректное начальное состояние, отдельная loading-ветка NOT REQUIRED. Аналогично `renderedTableTotal = 0` пока заказов нет.

> ✅ **v10: cancelled predicate нормализован.** `isCancelledOrder(o)` mirrors existing logic at lines 443-446/459-463: проверяет `internal_code === 'cancel'` ИЛИ (нет internal_code + raw status === 'cancelled'). Это покрывает оба B44 сценария: когда stage с cancel-code присвоена, и когда отмена только по raw status. Fix 4 `selfTotal` тоже должен использовать `isCancelledOrder` — см. Шаг 4.1.

**Шаг 1.2** — Заменить header render **(строки 787-807)** целиком на:

```jsx
{/* CV-50 + Fix 1 (R2): Dish count + total sum in drawer header — attributed «Вы:»/«Стол:», sum from rendered data */}
{(ordersSum > 0 || cart.length > 0 || (cartTab === 'table' && renderedTableTotal > 0)) && (() => {
  const ordersItemCount = todayMyOrders.reduce((sum, o) => {
    const items = itemsByOrder.get(o.id) || [];
    return sum + items.reduce((s, it) => s + (it.quantity || 1), 0);
  }, 0);
  const cartItemCount = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
  const totalDishCount = ordersItemCount + cartItemCount;
  const headerTotal = ordersSum + (Number(cartTotalAmount) || 0);
  return cartTab === 'table'
    ? (renderedTableTotal > 0 ? (
        <div className="text-xs text-slate-500 mt-0.5">
          {tr('cart.header.table_label', 'Стол')}: {renderedTableGuestCount}{' '}
          {pluralizeRu(
            renderedTableGuestCount,
            tr('cart.header.guest_one', 'гость'),
            tr('cart.header.guest_few', 'гостя'),
            tr('cart.header.guest_many', 'гостей')
          )}
          {' · '}{renderedTableDishCount}{' '}
          {pluralizeRu(
            renderedTableDishCount,
            tr('cart.header.dish_one', 'блюдо'),
            tr('cart.header.dish_few', 'блюда'),
            tr('cart.header.dish_many', 'блюд')
          )}
          {' · '}{formatPrice(parseFloat(Number(renderedTableTotal).toFixed(2)))}
        </div>
      ) : null)
    : (totalDishCount > 0 ? (
        <div className="text-xs text-slate-500 mt-0.5">
          {tr('cart.header.you_label', 'Вы')}: {totalDishCount}{' '}
          {pluralizeRu(
            totalDishCount,
            tr('cart.header.dish_one', 'блюдо'),
            tr('cart.header.dish_few', 'блюда'),
            tr('cart.header.dish_many', 'блюд')
          )}
          {' · '}{formatPrice(parseFloat(headerTotal.toFixed(2)))}
        </div>
      ) : null);
})()}
```

**Шаг 1.3** — Удалить orphan `submittedTableTotal` определение (строки 525-531).

После Fix 1 `submittedTableTotal` больше нигде не используется (перепроверить):

```bash
grep -a -n "submittedTableTotal" pages/PublicMenu/CartView.jsx
```
Если единственный hit — определение на 525-531 — удалить эти 7 строк полностью. Если есть другие использования — оставить определение, НЕ удалять.

> ⚠️ Важно: Reviewer —
> 1. **Тот же тег**: `<div className="text-xs text-slate-500 mt-0.5">` (НЕ `<p>`, НЕ `text-sm`, НЕ `slate-600`).
> 2. **Condition**: `renderedTableTotal > 0` (НЕ `submittedTableTotal > 0`).
> 3. `pluralizeRu` уже есть (line 299).
> 4. `formatPrice(parseFloat(Number(...).toFixed(2)))` — точно тот же паттерн что в существующем коде (line 799, 851, 874).

**НЕ делать:**
- ❌ Не менять `ordersItemCount`/`totalDishCount`/`headerTotal` для «Мои» (только добавить `«Вы:»` prefix).
- ❌ Не использовать `.length || 1` для dish count — только sum quantities (R2 FROZEN).
- ❌ Не оставлять неиспользуемый `submittedTableTotal` если grep подтверждает orphan.

### Acceptance Criteria
- [ ] `isCancelledOrder` helper объявлен ПЕРЕД `todayMyOrders` (~line 443) — не перед `statusBuckets` (v18 fix)
- [ ] `isCancelledOrder` покрывает ВСЕ 3 формы: `internal_code === 'cancel'` + `internal_code === 'cancelled'` + raw `=== 'cancelled'` (v18 fix — align с getSafeStatus)
- [ ] `todayMyOrders` filter использует `!isCancelledOrder(o)` вместо inline `status !== 'cancelled'` check (v18 fix)
- [ ] `getOrderStatus` добавлен в deps `todayMyOrders` useMemo (v18 fix)
- [ ] Header «Мои»: `«Вы: X блюд · X ₸»` (pluralized + правильный тег `<div>`)
- [ ] Header «Стол»: `«Стол: X гостя · X блюд · X ₸»` (pluralized)
- [ ] Condition включает `renderedTableTotal > 0` вместо `submittedTableTotal > 0`
- [ ] `renderedTableDishCount` = sum of `it.quantity` (НЕ `.length`)
- [ ] `renderedTableGuestCount` = guests with **≥1 non-cancelled order** only (guests with ALL orders cancelled → NOT counted in header; this is intentional — header shows active totals, NOT all-time totals)
- [ ] Section 5 «Заказы стола» continues to render ALL orders (including cancelled) — by design; this is the service-staff view and is NOT changed by Fix 1
- [ ] `submittedTableTotal` определение удалено (если orphan)
- [ ] Новые `<div>` используют className `text-xs text-slate-500 mt-0.5` (=existing)

---

## Fix 2 — ⏳ Ожидает Bucket [NEW CODE]

> ⚠️ **Номера строк — baseline ДО Fix 1.** Fix 1 вставляет ~30 строк и удаляет 7 → net +~23. Все числовые ссылки в этом Fix указаны по pre-Fix-1 состоянию файла. **Всегда locate by content, не по номеру строки** — использовать grep для точной локации.

**Задача:** Добавить третий bucket «Ожидает» (amber) для заказов в статусе `'submitted'` — до подтверждения официантом.

### Верификация grep перед ревью
```bash
grep -a -n "statusBuckets\|bucketDisplayNames\|currentGroupKeys" pages/PublicMenu/CartView.jsx
grep -a -nw "bucketOrder" pages/PublicMenu/CartView.jsx
```
Ожидаем (первый grep):
- `line 456-467`: `statusBuckets` useMemo с `groups = { served: [], in_progress: [] }` — 2 группы, нет pending
- `line 470-474`: `currentGroupKeys` — массив ключей `S`/`I`/`C` (served/in_progress/cart)
- `line 574-577`: `bucketDisplayNames` (а НЕ `groupLabels`) — отображаемые названия bucket
- `line 1023`: `{bucketDisplayNames[key]} ({orders.length})` — шаблон заголовка bucket

Ожидаем (второй grep с `-w`):
- `line 1005`: `const bucketOrder = ['served', 'in_progress'];` — только 1 hit (НЕ матчит `renderBucketOrders`)
- `pending_unconfirmed` — 0 hits

### Архитектура рендера (важно понять перед ревью)

Текущая архитектура в блоке State B (обычный режим) — lines 1004-1071:
```jsx
const bucketOrder = ['served', 'in_progress'];
return bucketOrder.map(key => {
  const orders = statusBuckets[key];
  if (orders.length === 0) return null;
  const isExpanded = !!expandedStatuses[key];
  const isServed = key === 'served';
  // ... <Card>...</Card>
});
```

Это — **динамический рендер через `.map()`**. Fix 2 расширяет `bucketOrder` новым ключом и `statusBuckets` новой группой. Статический JSX-блок добавлять **НЕ НУЖНО**.

### Что нужно сделать

**Шаг 2.0 (Pre-flight verify)** — подтвердить что статус `'submitted'` зафиксирован в Preparation snapshot.

> ✅ **v8 note:** Grep для `'submitted'` перемещён в **Preparation** (до Fix 1) — потому что Fix 1 Step 1.3 удаляет `submittedTableTotal` (строки 525-531), которая содержит единственный `'submitted'` литерал (line 528). Если выполнять grep ПОСЛЕ Fix 1 — результат 0 hits → ложный STOP.
>
> Если Preparation snapshot показал `line 528` — продолжать. Если Preparation показал 0 hits — **ОСТАНОВИТЬСЯ**, сообщить Cowork: «статус `'submitted'` не найден в CartView.jsx baseline, маппинг Fix 2 требует проверки».

**Шаг 2.0b (Verified contract — M2 v14)** — `getOrderStatus` является prop (line 54), его runtime-поведение задокументировано ниже на основе системного поведения B44 + SOM.

```bash
grep -a -n "getOrderStatus" pages/PublicMenu/CartView.jsx | head -5
```
**Ожидаем:** `line 54` — prop definition. Строки вызова: `getOrderStatus(o)` в statusBuckets и рендер-блоках.

> **Verified contract (v14, M2):** B44 Platform возвращает `rawStatus = 'submitted'` для заказов которые ещё НЕ подтверждены официантом (submitted but not accepted). В этом состоянии `stageInfo = null` (confirmed stage отсутствует). Таким образом: `getOrderStatus(submittedOrder) = null` + `order.status = 'submitted'` → `isPending = !null?.internal_code && 'submitted' === 'submitted'` → `isPending = true` ✅. После принятия официантом в SOM: B44 assigns подтверждённый stage → `stageInfo.internal_code` становится непустым → `isPending = false` → заказ переходит в `in_progress` bucket. Это design decision: stage-сигнал от сервера приоритетнее raw status.
>
> **If runtime diverges:** если в Preparation `'submitted'` не найден (0 hits) → **СТОП**, сообщить Cowork: «статус `'submitted'` не найден — контракт требует проверки». Fix 2 реализует этот контракт правильно: `statusBuckets` использует `isPending = !stageInfo?.internal_code && rawStatus === 'submitted'`. Badge в Шаг 2.6 использует ТОТ ЖЕ guard (v7 fix).

**Шаг 2.1** — Обновить `statusBuckets` (строки 456-467) добавлением `pending_unconfirmed` группы:

**Текущий код:**
```jsx
const statusBuckets = React.useMemo(() => {
  const groups = { served: [], in_progress: [] };
  todayMyOrders.forEach(o => {
    const stageInfo = getOrderStatus(o);
    const isServed = stageInfo?.internal_code === 'finish'
      || (!stageInfo?.internal_code && ['served', 'completed'].includes((o.status || '').toLowerCase()));
    const isCancelled = !stageInfo?.internal_code && (o.status || '').toLowerCase() === 'cancelled';
    if (isServed) groups.served.push(o);
    else if (!isCancelled) groups.in_progress.push(o);
  });
  return groups;
}, [todayMyOrders, getOrderStatus]);
```

**Заменить на:**
```jsx
const statusBuckets = React.useMemo(() => {
  const groups = { served: [], in_progress: [], pending_unconfirmed: [] };
  todayMyOrders.forEach(o => {
    const stageInfo = getOrderStatus(o);
    const rawStatus = (o.status || '').toLowerCase();
    const isServed = stageInfo?.internal_code === 'finish'
      || (!stageInfo?.internal_code && ['served', 'completed'].includes(rawStatus));
    // Fix 2 (v12): use normalized isCancelledOrder helper (introduced in Fix 1 Part A) for consistency.
    // Original code: `!stageInfo?.internal_code && rawStatus === 'cancelled'` — this misses orders
    // where B44 sets internal_code === 'cancel' (stage-based cancel, not raw-status-only cancel).
    // isCancelledOrder covers BOTH cases → consistent with Fix 1/4 aggregates.
    // ✅ TDZ-safe (v13): isCancelledOrder declared in Fix 1 Part A at line ~455 — ABOVE statusBuckets
    // at line 456. After Fix 1 Part A applied, const isCancelledOrder is in scope here.
    const isCancelled = isCancelledOrder(o);
    // Fix 2 (R1): pending_unconfirmed = 'submitted' status (awaiting waiter confirmation).
    // Priority: server-side stageInfo wins; only raw status === 'submitted' AND no stage info → pending.
    const isPending = !stageInfo?.internal_code && rawStatus === 'submitted';

    if (isServed) groups.served.push(o);
    else if (isPending) groups.pending_unconfirmed.push(o);
    else if (!isCancelled) groups.in_progress.push(o);
  });
  return groups;
}, [todayMyOrders, getOrderStatus]);
```

**Шаг 2.2** — Обновить `currentGroupKeys` (строки 470-474) добавлением ключа `P`:

**Текущий код:**
```jsx
const currentGroupKeys = [
  statusBuckets.served.length > 0 ? 'S' : '',
  statusBuckets.in_progress.length > 0 ? 'I' : '',
  cart.length > 0 ? 'C' : ''
].join('');
```

**Заменить на:**
```jsx
const currentGroupKeys = [
  statusBuckets.served.length > 0 ? 'S' : '',
  statusBuckets.in_progress.length > 0 ? 'I' : '',
  statusBuckets.pending_unconfirmed.length > 0 ? 'P' : '', // Fix 2 (R1)
  cart.length > 0 ? 'C' : ''
].join('');
```

**Шаг 2.3** — Обновить `bucketDisplayNames` (строки 574-577) добавлением `pending_unconfirmed`:

**Текущий код:**
```jsx
const bucketDisplayNames = {
  served: tr('cart.group.served', 'Выдано'),
  in_progress: tr('cart.group.in_progress', 'В работе'),
};
```

**Заменить на:**
```jsx
const bucketDisplayNames = {
  served: tr('cart.group.served', 'Выдано'),
  in_progress: tr('cart.group.in_progress', 'В работе'),
  pending_unconfirmed: tr('cart.group.pending', '⏳ Ожидает'), // Fix 2 (R1)
};
```

> ⚠️ **КРИТИЧНО:** идентификатор = `bucketDisplayNames` (НЕ `groupLabels`). Grep выше подтверждает (line 574). Если reviewer видит `groupLabels` в v3/v4 — это ошибка, правильное имя `bucketDisplayNames`.

**Шаг 2.4** — Обновить `bucketOrder` массив (строка 1005) — **добавить `pending_unconfirmed` в КОНЕЦ** (R1 FROZEN: «Ожидает» bucket снизу «Мои», ниже «В работе»):

**Текущий код (line 1005):**
```jsx
const bucketOrder = ['served', 'in_progress'];
```

**Заменить на:**
```jsx
// Fix 2 (R1): Order = 'served' top (collapsed by default), 'in_progress' middle,
// 'pending_unconfirmed' bottom (amber, below «В работе»).
const bucketOrder = ['served', 'in_progress', 'pending_unconfirmed'];
```

> ✅ Что это даёт: динамический `.map(key => ...)` (lines 1006-1071) автоматически отрендерит новый `pending_unconfirmed` Card в том же паттерне что `served` и `in_progress`. Не нужно дублировать JSX-разметку.

**Шаг 2.4b** — Обновить `isV8` condition (строка ~928-930) в блоке `{(!showTableOrdersSection || cartTab === 'my') && (() => {`:

```bash
grep -a -n "const isV8 = " pages/PublicMenu/CartView.jsx
```
Ожидаем: строка **~928** (после Fix 1 смещение ~+23 → ~951). **v11: Всегда locate by grep content — номера строк только ориентир.**

**Текущий код:**
```jsx
const isV8 = statusBuckets.in_progress.length === 0
  && statusBuckets.served.length > 0
  && cart.length === 0;
```

**Заменить на:**
```jsx
const isV8 = statusBuckets.in_progress.length === 0
  && statusBuckets.pending_unconfirmed.length === 0 // Fix 2: don't hide pending bucket behind «Ничего не ждёте»
  && statusBuckets.served.length > 0
  && cart.length === 0;
```

> ⚠️ **Почему обязательно:** без этого условия сессия с `served > 0`, `pending_unconfirmed > 0`, `in_progress === 0`, empty cart → `isV8 = true` → экран «Ничего не ждёте» + только `served` bucket. Новый `pending_unconfirmed` bucket полностью скрыт. Пользователь не видит свои ожидающие заказы.
>
> После фикса: если есть ожидающие заказы → `isV8 = false` → нормальный рендер через `bucketOrder.map()` показывает все три bucket'а.

**Шаг 2.4c** — Обновить `otherGroupsExist` (строка 481) добавлением `pending_unconfirmed` в collapse-предикат:

```bash
grep -a -n "otherGroupsExist" pages/PublicMenu/CartView.jsx
```
Ожидаем: строка **481** (`const otherGroupsExist = statusBuckets.in_progress.length > 0 || cart.length > 0;`). После Fix 1 смещение ~+23 → ~**504**. **v11: Всегда locate by grep content — номера строк только ориентир. Не использовать номер строки напрямую без grep-верификации.**

**Текущий код:**
```jsx
const otherGroupsExist = statusBuckets.in_progress.length > 0 || cart.length > 0;
```

**Заменить на:**
```jsx
const otherGroupsExist = statusBuckets.in_progress.length > 0 || cart.length > 0
  || statusBuckets.pending_unconfirmed.length > 0; // Fix 2 (R1): served collapses only when no pending
```

> ⚠️ **Почему обязательно (v9, v13 rationale fix):** при `served > 0` + `pending_unconfirmed > 0` + `in_progress === 0` + empty cart — `otherGroupsExist = false` → `served` bucket рендерится с `defaultExpanded: true` (auto-expanded). Это **нежелательно**: bucket порядок по R1 FROZEN = `served → in_progress → pending_unconfirmed`, т.е. `served` всегда первый. Если `served` auto-expanded — он занимает всё место и пользователь не видит `pending_unconfirmed` который идёт СНИЗУ. После фикса: `otherGroupsExist = true` → `served` collapsed по умолчанию (пользователь сворачивает Выдано чтобы дойти до Ожидает). Порядок отображения R1 остаётся: `served → in_progress → pending_unconfirmed` — `pending` НЕ показывается «первым», он показывается последним согласно FROZEN spec.

**Шаг 2.5** — Внутри `.map()` блока (lines 1006-1071) нужно добавить **amber стилизацию** заголовка для `pending_unconfirmed` bucket.

Найти **только `<span>` элемент** (строки **1022-1024** внутри `.map`):

```jsx
<span className="text-base font-semibold text-slate-800">
  {bucketDisplayNames[key]} ({orders.length})
</span>
```

> ⚠️ **v8 — Целевой элемент: только `<span>`, не `<div>`.** Окружающий `<div className="flex items-center gap-2">` содержит siblings (rating chips `{isServed && reviewsEnabled && ...}`). Заменять `<div>` целиком — риск потерять siblings. Меняем только `<span>` внутри `<div>`.

**Заменить только `<span>` на:**
```jsx
{/* v8: static class map — no dynamic Tailwind (PurgeCSS must see full literal class strings) */}
{key === 'pending_unconfirmed' ? (
  <span className="text-base font-semibold text-amber-600">
    {bucketDisplayNames[key]} ({orders.length})
  </span>
) : (
  <span className="text-base font-semibold text-slate-800">
    {bucketDisplayNames[key]} ({orders.length})
  </span>
)}
```

> ✅ Reviewer: Tailwind класс `text-amber-600` — уже используется в CartView.jsx (line 748, Bell help button). Conditional branches (не template literal) → full class strings присутствуют как literals → PurgeCSS находит классы при сборке. Surrounding `<div>` остаётся нетронутым.

**Шаг 2.6** — Badge «⏳ Ожидает» в табе «Стол» (per-item render, R1 FROZEN).

Локация: строки **880-901** (existing render other-guests items). Нужно добавить per-item pending badge.

**Текущий код (lines 880-901):**
```jsx
{guestOrders.map((order) => {
  const items = itemsByOrder.get(order.id) || [];
  const status = getSafeStatus(getOrderStatus(order));

  if (items.length === 0) {
    return (
      <div key={order.id} className="flex justify-between items-center text-xs">
        <span className="text-slate-600">
          {tr('cart.order_total', 'Сумма заказа')}: {formatPrice(parseFloat(Number(order.total_amount).toFixed(2)))}
        </span>
        <span className="text-xs" style={{ color: status.color }}>{status.icon} {status.label}</span>
      </div>
    );
  }

  return items.map((item, idx) => (
    <div key={`${order.id}-${idx}`} className="flex justify-between items-center text-xs">
      <span className="text-slate-600">{item.dish_name} × {item.quantity}</span>
      <span className="text-xs" style={{ color: status.color }}>{status.icon} {status.label}</span>
    </div>
  ));
})}
```

**Заменить на:**
```jsx
{guestOrders.map((order) => {
  const items = itemsByOrder.get(order.id) || [];
  // Fix 2 (v7): derive stageInfo once — reuse for both status label and badge guard.
  // isOrderPending MUST use same condition as statusBuckets.isPending to avoid contradictory UI:
  // without internal_code guard → badge shows amber «Ожидает» while getSafeStatus shows «В работе»
  // (if waiter accepted order → internal_code set → order in in_progress bucket, badge must disappear).
  const stageInfo = getOrderStatus(order);
  const rawOrderStatus = (order.status || '').toLowerCase();
  const status = getSafeStatus(stageInfo);
  const isOrderPending = !stageInfo?.internal_code && rawOrderStatus === 'submitted';

  if (items.length === 0) {
    return (
      <div key={order.id} className="flex justify-between items-center text-xs">
        <span className="text-slate-600">
          {tr('cart.order_total', 'Сумма заказа')}: {formatPrice(parseFloat(Number(order.total_amount).toFixed(2)))}
          {isOrderPending && (
            <span className="ml-1 text-amber-600 font-medium">⏳ {tr('cart.order.pending_badge', 'Ожидает')}</span>
          )}
        </span>
        <span className="text-xs" style={{ color: status.color }}>{status.icon} {status.label}</span>
      </div>
    );
  }

  return items.map((item, idx) => (
    <div key={`${order.id}-${idx}`} className="flex justify-between items-center text-xs">
      <span className="text-slate-600">
        {item.dish_name} × {item.quantity}
        {isOrderPending && (
          <span className="ml-1 text-amber-600 font-medium">⏳ {tr('cart.order.pending_badge', 'Ожидает')}</span>
        )}
      </span>
      <span className="text-xs" style={{ color: status.color }}>{status.icon} {status.label}</span>
    </div>
  ));
})}
```

> ⚠️ **Badge visibility note (v11):** Шаг 2.6 badge рендерится внутри `{otherGuestsExpanded && ...}` блока (collapsed by default). Это **умышленное поведение (intentional)** — детали заказов других гостей (включая `⏳ Ожидает` badge) скрыты пока блок свёрнут, видны после tap на `otherGuestsExpanded`. **НЕ делать auto-expand** при `pending_unconfirmed.length > 0`. Collapsed = нормальный UI-state для чужих заказов.
> 
> **AC (v11):** при ручном раскрытии `otherGuestsExpanded` → на submitted заказах других гостей отображается `⏳ Ожидает` badge (если `isOrderPending` = true).

**НЕ делать:**
- ❌ Не добавлять статический JSX-блок «Ожидает» в State B render — `.map(bucketOrder)` делает это автоматически.
- ❌ Не добавлять badge «Ожидает» в таб «Мои» — только amber заголовок bucket (R1 FROZEN).
- ❌ Не делать auto-expand `otherGuestsExpanded` для показа pending badge — collapsed = normal UI state.
- ❌ Не добавлять helper «Проверяем подтверждение…» / `stale_pending` (убран S302).
- ❌ Не менять `getSafeStatus` для pending — bucket assignment через `statusBuckets`, не через `getSafeStatus`.

> ✅ **v15 — Row status label для submitted заказов (intentional double-display):** В рендере строк Fix 2 и Fix 4 используется `getSafeStatus(stageInfo)`. Для submitted заказов `stageInfo = null` → `getSafeStatus(null)` возвращает label `«В работе»` (fallback, lines 309-317). Одновременно показывается badge `⏳ Ожидает`. Итого видны **оба**: badge `⏳ Ожидает` + label `🔵 В работе`. Это intentional по design (badge = состояние ожидания подтверждения, label = нет stage → fallback). **НЕ менять `getSafeStatus`** для submitted orders — изменение сломает отображение других заказов. Если в будущих версиях захотят убрать `В работе` label для submitted → это отдельная задача, не входит в CV-B2 scope.

### Acceptance Criteria
- [ ] `statusBuckets` имеет 3 ключа: `served`, `in_progress`, `pending_unconfirmed`
- [ ] Заказ со статусом `'submitted'` → в `pending_unconfirmed` bucket (не в `in_progress`)
- [ ] `isV8` condition включает `statusBuckets.pending_unconfirmed.length === 0` (не показывает «Ничего не ждёте» при наличии pending заказов)
- [ ] `bucketOrder` = `['served', 'in_progress', 'pending_unconfirmed']` (pending снизу)
- [ ] `bucketDisplayNames.pending_unconfirmed = '⏳ Ожидает'`
- [ ] Заголовок pending bucket — `text-amber-600` (остальные bucket'ы — `text-slate-800`)
- [ ] Badge «⏳ Ожидает» виден в «Стол» (per-item, при `isOrderPending=true`) — ТОЛЬКО когда `otherGuestsExpanded` открыт (badge внутри collapsed block, intentional) (v16 AC fix)
- [ ] НЕТ badge «Ожидает» в «Мои» (только amber заголовок)
- [ ] `stale_pending` / «Проверяем подтверждение…» — НЕ добавлен

---

## Fix 3 — ✦ Terminal Screen «Спасибо за визит!» [NEW CODE]

> ⚠️ **Номера строк — baseline ДО Fix 1+2.** После Fix 1 (+~23 строки) и Fix 2 (+~30 строк) все числовые ссылки в этом Fix сместятся. **Всегда locate by content, не по номеру строки** — использовать grep для точной локации.

**Задача:** Добавить финальный экран при закрытии стола (когда SOM staff закрыл сессию) с durable persist.

> ✅ **v15 — Шаги 3.1→3.2→3.3→3.4 в документе соответствуют порядку в коде (Rules of Hooks):**
> **3.1 useState → 3.2 useMemo → 3.3 useEffect → 3.4 early return** — всё строго последовательно.
> Реализовывать в порядке документа.

### Data source — verified

`currentTable?.status` — **НЕ существует** как поле (grep `currentTable\.` подтверждает только `name`/`code` usages на line 385). Использовать **НЕЛЬЗЯ**.

`tableSession` **не является prop** компонента CartView (grep prop list line 17-83 — нет `tableSession`). Добавить его — вне скоупа (требует правок в родительском `x.jsx`, нарушает scope lock).

**Verified data source:** `sessionOrders` — массив всех заказов стола (prop line 59). Когда SOM staff закрывает стол через `closeSession()` (S286 Б1 КС, commit `35726f1`), **все активные заказы TableSession получают `status: 'closed'` атомарно** — это B44 Platform контракт (не speculation). Verified in S286: после `closeSession()` стол переходил в «Завершённые» с `status: 'closed'` на всех заказах. `sessionOrders` — realtime prop, обновляется по B44 subscription → Terminal появится при следующем poll/invalidate.

> 📁 **v17 note (closeSession source):** Реализация `closeSession()` находится в `pages/StaffOrdersMobile/sessionHelpers.js` (commit `35726f1`, задеплоен S286 Б1). Executor может прочитать этот файл из worktree для подтверждения контракта.

Логика: `tableIsClosed = nonCancelled.length > 0 && nonCancelled.every(o.status === 'closed')` — cancelled заказы не учитываются (v6: сессии с pre-close отменами корректно показывают Terminal).

### Верификация grep перед ревью
```bash
grep -a -n "sessionOrders\|terminal\|cv_terminal_dismissed\|Спасибо" pages/PublicMenu/CartView.jsx
```
Ожидаем:
- `line 59`: `sessionOrders,` — prop существует
- ~~`line 526, 528`~~: ⚠️ **v17 note:** строки 525-531 (`submittedTableTotal`) удалены Fix 1 Step 1.3 → `sessionOrders` НЕ будет на этих строках после Fix 1. Это **нормально** — подтверждение статуса `'submitted'` перенесено в **Preparation** (до Fix 1).
- `line 848, 871`: `sessionOrders.length > 0` — паттерн проверки наличия заказов (строки не смещаются Fix 1)
- `terminal`, `cv_terminal_dismissed`, `Спасибо` — 0 hits (не реализовано)

### Что нужно сделать

**~~Шаг 3.0 (REMOVED in v19)~~** — ~~поиск `partnerId`~~ — Шаг 3.0 убран. `partnerId` отсутствует в props CartView.jsx (Codex C1). Используем только `currentTableKey` для localStorage key. Restaurant-scoped key — в следующем батче.

**Шаг 3.1** — Добавить durable persist state.

Локация: вместе с другими useState. Вставить ПОСЛЕ строки 114 (`const [showPostRatingEmailSheet, setShowPostRatingEmailSheet] = React.useState(false);`):

> ⚠️ **v12 — R4 `{tableId}` implementation:** R4 FROZEN spec требует ключ `cv_terminal_dismissed_{tableId}` — per-table persist. В CartView.jsx понятие `tableId` реализуется через `currentTable?.code || currentTable?.name`:
>
> **Почему `code || name` = verified surrogate для `{tableId}`:**
> 1. **`currentTable?.id` недоступно** — grep `currentTable\?\.id` / `currentTable\.id` даёт **0 hits** в CartView.jsx. Поле `.id` в scope компонента не подтверждено.
> 2. **`code || name` верифицировано** — line 385 использует `currentTable?.name || currentTable?.code || "—"` как primary table label. Этот pattern существует в файле; v14 (M1) уточнил что `code` должен быть первым, т.к. code стабильнее и уникальнее.
> 3. **Стабильность** — `code` — уникальный идентификатор стола (например "A1", "B3"), `name` — может повторяться у разных столов. `code || name` → code-first для уникальности localStorage ключа.
> 4. **Per-table isolation сохранена** — каждый уникальный `code || name` → уникальный localStorage ключ → dismiss на Стол A не влияет на Стол B.
>
> `||` vs `??`: при `code === ""` (пустая строка) `??` возвращает `""` как ключ, `||` корректно проваливается на `name`. Используем `||`.
>
> R4 FROZEN spec: `cv_terminal_dismissed_{tableId}` — per-table ключ, не единственный глобальный ключ. Каждый стол хранит независимый флаг.

```jsx
  // Fix 3 (R4): Per-table durable dismissal.
  // v19 (C1 fix): partnerId not in CartView.jsx props — use per-table key only.
  // tableKey = code || name — CODE-FIRST (v14, M1 fix): code is stable unique identifier per table.
  // Use || not ?? : when code === "" (empty string), ?? returns "" as key; || correctly falls back to name.
  // NOT .id (unverified — 0 greps in CartView.jsx).
  const currentTableKey = currentTable?.code || currentTable?.name || null; // v14 M1: code-first
  // v19: simple per-table key (no restaurant prefix — partnerId prop does not exist in CartView.jsx)
  const terminalStorageKey = currentTableKey
    ? `cv_terminal_dismissed_${currentTableKey}`
    : null; // null → no-op (no persist if table key missing)

  const [terminalDismissed, setTerminalDismissed] = React.useState(() => {
    if (!terminalStorageKey || typeof localStorage === 'undefined') return false;
    try {
      return !!localStorage.getItem(terminalStorageKey);
    } catch { return false; }
  });
```

> ✅ **v19 note:** `terminalStorageKey` = `cv_terminal_dismissed_${currentTableKey}` — per-table key. Restaurant-scoping будет добавлено в следующем батче когда restaurant ID prop будет доступен.

**Шаг 3.2** — Вычислить условие показа terminal через `useMemo`.

**Локация (MANDATORY grep для placement):**

```bash
# Шаг A: найти конец Fix 1 блока (последний useMemo вставленный Fix 1)
grep -a -n "renderedTableGuestCount = React.useMemo" pages/PublicMenu/CartView.jsx
# Шаг B: найти следующий anchor после Fix 1 блока
grep -a -n "getGuestLabelById\|guestLabelById" pages/PublicMenu/CartView.jsx | head -2
```

**Ожидаем Шаг A:** один hit — найти строку с `renderedTableGuestCount = React.useMemo(`. Перейти к её закрывающей строке `}, [myGuestId, ordersByGuestId, otherGuestIdsFromOrders, getOrderStatus]);`.

**Ожидаем Шаг B:** один hit на строке `~533-540` (baseline), после Fix 1+2 смещается. Это ориентир что мы не перешли за Fix 1 блок.

> ✅ **v13 fix (Codex-CRITICAL):** Предыдущие версии (v11/v12) использовали `ordersSum` как anchor для "потолка" вставки, ожидая его на строке ~530 после Fix 1. **Это было неверно**: `ordersSum` находится на строке ~490 в оригинальном файле — **выше** `tableOrdersTotal` (514-523) и выше Fix 1 Part B вставки (~524). `ordersSum` не смещается значительно после Fix 1. Поэтому `ordersSum` не годится как "нижний bound" для placement — `tableIsClosed` должна идти ПОСЛЕ Fix 1 block, а Fix 1 block заканчивается на `renderedTableGuestCount`, не перед `ordersSum`.

**Точное место вставки:** НЕПОСРЕДСТВЕННО ПОСЛЕ закрывающей строки `renderedTableGuestCount` useMemo и ПЕРЕД следующим кодом (grep Step B даёт ориентир). НЕ использовать `ordersSum` как anchor.

Такой порядок гарантирует:
1. **TDZ безопасен**: `isCancelledOrder` объявлена в Fix 1 Part A (line ~455) — ВЫШЕ всех useMemo включая `tableIsClosed`.
2. **Rules of Hooks стабилен**: `tableIsClosed` useMemo вызывается на каждом рендере в фиксированной позиции (после Fix 1 useMemo блока) → нет React warning «Rendered more hooks than previous render».
3. **Dependencies доступны**: `sessionOrders` — prop (line 59); `getOrderStatus` — prop (line 54). Оба в scope.

```jsx
  // Fix 3 (R4): Table is closed when session has orders AND all non-cancelled orders are 'closed'.
  // (SOM staff invokes closeSession — active orders get status='closed' atomically, S286 Б1.)
  // 'cancelled' orders are excluded from the predicate so pre-close cancellations
  // don't prevent the Terminal from showing (v6 fix: handles mixed closed+cancelled sessions).
  const tableIsClosed = React.useMemo(() => {
    if (!Array.isArray(sessionOrders) || sessionOrders.length === 0) return false;
    const nonCancelled = sessionOrders.filter((o) => !isCancelledOrder(o)); // v10: normalized predicate
    // If only cancelled orders exist (edge case) → don't show terminal (no real session activity).
    if (nonCancelled.length === 0) return false;
    return nonCancelled.every((o) => (o.status || '').toLowerCase() === 'closed');
  }, [sessionOrders, getOrderStatus]);

  // currentTableKey defined in Шаг 3.1 above (currentTable?.code || currentTable?.name || null) — code-first (v16 fix)
  // Do NOT redefine it here — it is already declared as const above.
  const showTerminal = tableIsClosed && !!currentTableKey && !terminalDismissed;

  // Fix 3 (R4, v18 SHOULD — M4): Session-scoped self total for Terminal screen.
  // v17 used ordersSum which is day-filtered (todayMyOrders). If session crosses day boundary,
  // ordersSum = 0 while tableIsClosed = true → Terminal shows "Ваша сумма: 0₸" (wrong).
  // sessionSelfTotal uses sessionOrders (prop line 59) filtered by myGuestId — matches tableIsClosed scope.
  const sessionSelfTotal = React.useMemo(() => {
    if (!Array.isArray(sessionOrders) || !myGuestId) return 0;
    return sessionOrders
      .filter((o) => (getLinkId ? getLinkId(o.guest) : o.guest) === myGuestId && !isCancelledOrder(o))  // v19: fix Codex C2 — o.guest_id does not exist (0 hits in CartView.jsx)
      .reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0);
  }, [sessionOrders, myGuestId, getOrderStatus]);
```

> ⚠️ Reviewer: `currentTableKey`, `showTerminal`, `sessionSelfTotal` — computed on every render (derived values). `tableIsClosed` — `useMemo`, чтобы не пересчитывать `.every()` при каждом рендере. `sessionSelfTotal` — useMemo (avoids repeated `.filter().reduce()` on each render).

**Шаг 3.3** — useEffect для синхронизации dismissed state при смене стола.

> ✅ **v15 (Rules of Hooks):** useEffect объявляется ДО early return (Шаг 3.4) — все хуки (useState, useMemo, useEffect) вызываются до любого conditional return. Порядок в документе = порядок в коде: 3.1 → 3.2 → 3.3 → 3.4.

Когда гость переходит на другой стол (`currentTableKey` меняется), `terminalDismissed` нужно обновить из localStorage для нового стола. Без этого `useState` остаётся на старом значении при смене стола.

Локация: ПОСЛЕ useMemo (Шаг 3.2) и ПЕРЕД early return (Шаг 3.4). Добавить useEffect:

```jsx
  // Fix 3 (R4, v19): Re-sync dismissal flag when table changes.
  // v19 (C1 fix): terminalStorageKey = cv_terminal_dismissed_{tableKey} (per-table, no restaurant prefix).
  React.useEffect(() => {
    if (!terminalStorageKey || typeof localStorage === 'undefined') {
      setTerminalDismissed(false);
      return;
    }
    try {
      setTerminalDismissed(!!localStorage.getItem(terminalStorageKey));
    } catch {
      setTerminalDismissed(false);
    }
  }, [terminalStorageKey]); // runs when table changes (v19: table-key only)
```

Это гарантирует: при возврате на ранее dismissed стол — terminal не показывается; при переходе на другой стол или ресторан — terminal показывается если тот стол закрыт.

**НЕ нужно** очищать localStorage (per-restaurant-per-table ключи хранятся долго — это и есть «durable persist» по R4).

**Шаг 3.4** — Рендер Terminal screen через **early return** (безопасно: все hooks уже вызваны выше в Шагах 3.1-3.3).

> ✅ **v14 (CC Issue 7): `setView` верификация.** Перед реализацией убедиться что `setView` доступен в scope:
> ```bash
> grep -a -n "setView" pages/PublicMenu/CartView.jsx | head -3
> ```
> Ожидаем: `line 22` — prop definition. Если 0 hits → использовать только `onClose()`, не `setView`.

Локация: найти строку **где начинается главный `return (`** (строка **738** ожидается — точнее grep для подтверждения):

```bash
grep -a -n "^  return (" pages/PublicMenu/CartView.jsx
```
Ожидаем: один hit на строке `~738` (главный return).

**Вставить ПРЯМО ПЕРЕД** главным `return (` (т.е. после useEffect Шаг 3.3 и до открывающей скобки JSX):

```jsx
  // Fix 3 (R4, v18): Terminal screen — intercept before main render when table closed.
  // All hooks above (3.1 useState, 3.2 useMemo+sessionSelfTotal, 3.3 useEffect) are called unconditionally;
  // early return here is safe (Rules of Hooks OK).
  if (showTerminal) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 py-12 text-center gap-5">
        <div className="text-6xl" aria-hidden="true">✅</div>
        <h2 className="text-xl font-semibold text-gray-900">
          {tr('cart.terminal.title', 'Спасибо за визит!')}
        </h2>
        {sessionSelfTotal > 0 && (
          // v18 (M4): sessionSelfTotal — session-scoped, not day-scoped (ordersSum)
          <p className="text-gray-600 text-sm">
            {tr('cart.terminal.your_total', 'Ваша сумма')}: {formatPrice(parseFloat(Number(sessionSelfTotal).toFixed(2)))}
          </p>
        )}
        <Button
          size="lg"
          className="w-full min-h-[44px] text-white mt-2"
          style={{ backgroundColor: primaryColor }}
          onClick={() => {
            // v18 (M3): Per-restaurant-per-table persist via composite terminalStorageKey.
            // Dismissing table A1 in restaurant X does NOT affect table A1 in restaurant Y.
            setTerminalDismissed(true);
            try {
              if (typeof localStorage !== 'undefined' && terminalStorageKey) {
                localStorage.setItem(terminalStorageKey, '1');
              }
            } catch {}
            if (typeof onClose === 'function') {
              onClose();
            } else {
              setView('menu');
            }
          }}
        >
          {tr('cart.terminal.back_to_menu', 'Вернуться в меню')}
        </Button>
      </div>
    );
  }
```

> ✅ **Почему safe early return:** все `React.useState` / `React.useMemo` / `React.useEffect` вызовы в компоненте расположены ВЫШЕ (Шаги 3.1-3.3 + остальные hooks). Вставляя early return ПЕРЕД главным `return (`, мы гарантируем что все hooks вызваны перед любым branching. Это соответствует Rules of Hooks.
> ✅ **Кнопка** — shadcn `<Button>` с паттерном из lines 1215-1222 (size="lg", w-full min-h-[44px] text-white, style={{backgroundColor: primaryColor}}). Переиспользуем existing pattern.
> ✅ `primaryColor` (line 84), `onClose` (prop line 72), `setView` (prop line 22), `tr` (line 282), `formatPrice` (prop line 30), `ordersSum` (line 490) — всё доступно в scope.
> ✅ `Button` импортирован на line 4 (`import { Button } from "@/components/ui/button"`).

**НЕ делать:**
- ❌ Не использовать `currentTable?.status` — это поле не verified.
- ❌ Не добавлять `tableSession` prop — нарушает scope lock.
- ❌ Не показывать terminal и основной контент одновременно (early return делает это невозможным — это правильно).
- ❌ Не добавлять счётчик обратного отсчёта (не в скоупе).
- ❌ Не удалять основной `return (...)` блок — он должен оставаться после early return.

### Acceptance Criteria
- [ ] `tableIsClosed` true когда `nonCancelled.length > 0 && nonCancelled.every(o.status === 'closed')` (где `nonCancelled = sessionOrders.filter((o) => !isCancelledOrder(o))` — нормализованный predicate, cancelled не блокируют Terminal; v16 AC fix)
- [ ] `showTerminal` = `tableIsClosed && !!currentTableKey && !terminalDismissed`
- [ ] `currentTableKey` = `currentTable?.code || currentTable?.name || null` (code-first, v14 M1 fix: code is stable unique identifier; НЕ `??`, НЕ `.id`, НЕ name-first)
- [ ] Early return РАСПОЛОЖЕН ПЕРЕД главным `return (` — после всех hooks
- [ ] Terminal screen содержит: ✅ иконку, «Спасибо за визит!», сумму гостя (если `sessionSelfTotal > 0`), кнопку «Вернуться в меню»
- [ ] Кнопка = shadcn `<Button size="lg">` (НЕ `<button className="btn btn-outline">`)
- [ ] Кнопка использует `style={{backgroundColor: primaryColor}}` и `className="w-full min-h-[44px] text-white"` (= line 1217)
- [ ] `terminalStorageKey` = `cv_terminal_dismissed_${currentTableKey}` — per-table key (v19 C1 fix: partnerId not in props)
- [ ] `sessionSelfTotal` useMemo использует `sessionOrders` filtered by `(getLinkId ? getLinkId(o.guest) : o.guest) === myGuestId && !isCancelledOrder(o)` — session-scoped (v19 C2 fix)
- [ ] Terminal показывает `sessionSelfTotal` (НЕ `ordersSum`): `{sessionSelfTotal > 0 && <p>...}` (v18 M4 fix, v19 C2: uses getLinkId pattern)
- [ ] onClick — `localStorage.setItem(terminalStorageKey, '1')` (composite key, v18 M3 fix)
- [ ] onClick — `setTerminalDismissed(true)` + вызывается `onClose()` или `setView('menu')`
- [ ] useEffect синхронизирует `terminalDismissed` при смене `terminalStorageKey` (deps: `[terminalStorageKey]`)
- [ ] При повторном открытии того же стола того же ресторана — экран НЕ показывается (localStorage composite hit)
- [ ] При переходе на другой стол OR другой ресторан — экран снова показывается (если тот стол закрыт)
- [ ] Основной `return (<div ...>)` блок ОСТАВЛЕН без изменений (только early return добавлен перед ним)

---

## Fix 4 — Self-first «Вы (Гость N)» в «Стол» [BUG at line 834, non-cancelled only]

> ⚠️ **Номера строк — baseline ДО Fix 1+2+3.** После Fix 1-3 (+~60-80 строк суммарно) все числовые ссылки сместятся. **Всегда locate by content, не по номеру строки** — использовать grep для точной локации.

**Проблема:** В табе «Стол» свои заказы не показаны. `otherGuestIdsFromOrders` (line 510) исключает `myGuestId`, и рендер (lines 834-916) показывает только `otherGuestIdsFromOrders.map(...)`. [CV-NEW-03, CV-16/17]

### Верификация grep перед ревью
```bash
grep -a -n "SECTION 5\|otherGuestsExpanded\|myGuestId\|ordersByGuestId" pages/PublicMenu/CartView.jsx
```
Ожидаем:
- `line 508`: `const myGuestId = currentGuest?.id ? String(currentGuest.id) : null`
- `line 510-512`: `otherGuestIdsFromOrders` — filter исключает `myGuestId` (правильно, оставить как есть)
- `line 533-540`: `getGuestLabelById(guestId)` — уже доступен
- `line 833`: комментарий `{/* SECTION 5: TABLE ORDERS (other guests) — visible only in Стол tab */}`
- `line 834`: `{showTableOrdersSection && cartTab === 'table' && (` — Card «Заказы стола»
- `line 861`: `{otherGuestsExpanded && (...)}` — collapsed by default

```bash
# v14 (CC Issue 8): явный anchor для вставки self-block ПЕРЕД SECTION 5
grep -a -n "SECTION 5: TABLE ORDERS" pages/PublicMenu/CartView.jsx
```
Ожидаем: **ровно 1 hit** на строке ~833. Новый self-block вставляется **ПЕРЕД** этой строкой (т.е. между `</Tabs>` Card и SECTION 5 комментарием).

### Анализ cascade `showTableOrdersSection`

Grep на line 824, 834, 920, 927, 1075 показывает 5 использований. Проверка:
- **Line 824** (Tabs header): `{showTableOrdersSection && (<Tabs>...)` — показывает тумблер «Мои»/«Стол» ТОЛЬКО когда есть другие гости. Это правильно: если других нет, не нужны табы.
- **Line 834** (Card «Заказы стола»): показывает карточку других гостей. Это правильно: без других гостей её быть не должно.
- **Lines 920, 927, 1075** (State A empty, State D served+waiting, State B cart): `{(!showTableOrdersSection || cartTab === 'my') && ...}` — показывает содержимое «Мои» tab.

**Вывод:** cascade уже корректный. Fix 4 **не должен** менять определение `showTableOrdersSection`. Single-guest сессия (нет других) → табов нет → нечего чинить.

Проблема CV-NEW-03 возникает только в multi-guest сессиях (табы есть). Фикс = добавить self-block ВНУТРИ «Стол» tab, ПЕРЕД Card «Заказы стола» (line 834).

### Что нужно сделать

**Шаг 4.1** — Добавить Self-block Card ПЕРЕД строкой 833-834.

Локация: между закрывающим `</Tabs>` Card (line 831) и комментарием `{/* SECTION 5: TABLE ORDERS (other guests) ... */}` (line 833). Т.е. вставить как новый блок между lines 831 и 833.

Вставить:

```jsx
      {/* SECTION 4.5 (Fix 4, CV-16/17, CV-NEW-03): SELF BLOCK in Стол tab — own orders shown FIRST, expanded */}
      {showTableOrdersSection && cartTab === 'table' && myGuestId && ordersByGuestId.has(myGuestId) && (() => {
        const myOrdersInSession = ordersByGuestId.get(myGuestId) || [];
        // Fix 4 (v6): exclude cancelled orders from selfTotal — matches renderedTableTotal formula in Fix 1.
        // Fix 4 (v15, CRITICAL): activeMyOrdersInSession also used for render loop — both selfTotal AND
        // the rendered rows must exclude cancelled orders. Without this, selfTotal shows "500₸" but
        // the rows still include the cancelled item row → visual inconsistency between header and list.
        const activeMyOrdersInSession = myOrdersInSession.filter((o) => !isCancelledOrder(o)); // v15 fix
        const selfTotal = activeMyOrdersInSession
          .reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0);

        // Fix 4 (v14, C2): don't show self-block when ALL self-orders are cancelled (selfTotal === 0).
        if (selfTotal === 0) return null;

        return (
          <Card className="mb-4">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-slate-500" />
                  <span className="text-sm font-semibold text-slate-700">
                    {tr('cart.table.you', 'Вы')} ({getGuestLabelById(myGuestId)})
                  </span>
                </div>
                <span className="font-bold text-slate-700">
                  {formatPrice(parseFloat(Number(selfTotal).toFixed(2)))}
                </span>
              </div>
              {/* Self orders — always expanded (CV-16), cancelled orders excluded (v15) */}
              <div className="pl-2 border-l-2 border-slate-200 space-y-1">
                {activeMyOrdersInSession.map((order) => {
                  const items = itemsByOrder.get(order.id) || [];
                  // Fix 4 (v7): same stageInfo-guard as Fix 2 badge — consistent with statusBuckets rule.
                  const stageInfoSelf = getOrderStatus(order);
                  const rawSelfStatus = (order.status || '').toLowerCase();
                  const status = getSafeStatus(stageInfoSelf);
                  const isOrderPending = !stageInfoSelf?.internal_code && rawSelfStatus === 'submitted';

                  if (items.length === 0) {
                    return (
                      <div key={order.id} className="flex justify-between items-center text-xs">
                        <span className="text-slate-600">
                          {tr('cart.order_total', 'Сумма заказа')}: {formatPrice(parseFloat(Number(order.total_amount).toFixed(2)))}
                          {isOrderPending && (
                            <span className="ml-1 text-amber-600 font-medium">⏳ {tr('cart.order.pending_badge', 'Ожидает')}</span>
                          )}
                        </span>
                        <span className="text-xs" style={{ color: status.color }}>{status.icon} {status.label}</span>
                      </div>
                    );
                  }

                  return items.map((item, idx) => (
                    <div key={`${order.id}-${idx}`} className="flex justify-between items-center text-xs">
                      <span className="text-slate-600">
                        {item.dish_name} × {item.quantity}
                        {isOrderPending && (
                          <span className="ml-1 text-amber-600 font-medium">⏳ {tr('cart.order.pending_badge', 'Ожидает')}</span>
                        )}
                      </span>
                      <span className="text-xs" style={{ color: status.color }}>{status.icon} {status.label}</span>
                    </div>
                  ));
                })}
              </div>
            </CardContent>
          </Card>
        );
      })()}
```

> ✅ **Verified identifiers & patterns:**
> - `ordersByGuestId` (line 496), `myGuestId` (line 508), `getGuestLabelById` (line 533), `itemsByOrder` (prop line 53), `getOrderStatus` (prop line 54), `getSafeStatus` (line 309), `formatPrice` (prop line 30), `tr` (line 282), `Users` icon (import line 2), `Card`/`CardContent` (import line 3). Все существуют.
> - JSX render блюд — **1:1 скопирован из существующего render для других гостей** (lines 880-901). Только guest-level wrapper заменён на self-wrapper с `Users`-иконкой и label «Вы (Гость N)».
> - Fix 2 badge «⏳ Ожидает» применён идентично (per-item, в «Стол»).

**Шаг 4.2** — НЕ менять определение `showTableOrdersSection` (line 542).

Cascade-анализ выше подтверждает: текущая логика `otherGuestIdsFromOrders.length > 0` правильная. Fix 4 НЕ меняет эту строку.

**Шаг 4.3** — НЕ менять Card «Заказы стола» (lines 834-916).

Она продолжает рендериться как есть. Self-block — отдельная Card ПЕРЕД ней.

**НЕ делать:**
- ❌ Не добавлять self-block внутрь `otherGuestIdsFromOrders.map(...)`.
- ❌ Не менять `otherGuestIdsFromOrders` filter (line 511 — правильный).
- ❌ Не трогать `otherGuestsExpanded` toggle логику.
- ❌ Не менять `showTableOrdersSection` определение и его 5 использований.

### Acceptance Criteria
- [ ] Новая Card «Вы (Гость N)» рендерится ПЕРЕД Card «Заказы стола» в табе «Стол»
- [ ] Self-block виден только когда `cartTab === 'table' && showTableOrdersSection && myGuestId && ordersByGuestId.has(myGuestId) && selfTotal > 0` — если все self-заказы отменены (selfTotal === 0) → IIFE возвращает null, self-block НЕ отображается (v14 C2 fix)
- [ ] Self-block ВСЕГДА expanded (нет кнопки collapse)
- [ ] Заголовок self-block = `«Вы (Гость N)»` через `getGuestLabelById(myGuestId)` (если guest в `sessionGuests` — покажется его имя; если НЕ в `sessionGuests` → `«Гость ?»` — ожидаемый fallback, **не дефект**, v17 AC fix)
- [ ] `activeMyOrdersInSession = myOrdersInSession.filter((o) => !isCancelledOrder(o))` — содержит только НЕ-cancelled заказы (v16 AC fix: была пропущена `!`)
- [ ] `selfTotal` вычисляется из `activeMyOrdersInSession.reduce(...)` — НЕ из `myOrdersInSession`
- [ ] Рендер-loop использует `activeMyOrdersInSession.map(...)` — НЕ `myOrdersInSession.map(...)` (alignment с selfTotal)
- [ ] Сумма в header self-block = `sum(order.total_amount)` для активных (non-cancelled) заказов self (=та же формула что header в Fix 1)
- [ ] Section 5 (другие гости) по-прежнему отображает ВСЕ заказы включая cancelled — это by design (service-staff view, не изменяется Fix 4)
- [ ] Pending badge «⏳ Ожидает» появляется у submitted заказов self-block (в соответствии с Fix 2 R1)
- [ ] `showTableOrdersSection` и его 5 использований НЕ затронуты
- [ ] Card «Заказы стола» других гостей рендерится как раньше (collapsed by default, toggle `otherGuestsExpanded`)
- [ ] `myGuestId` не появился в `otherGuestIdsFromOrders` (filter line 511 не изменён)

---

## MANUAL QA (post-deploy, non-blocking for reviewer)

Mobile-first restaurant app. Verify at **375px width** after deploy (cannot be verified in-runner without browser):
- [ ] Fix 1: Header «Вы:»/«Стол:» text wraps gracefully (no overflow)
- [ ] Fix 2: «Ожидает» bucket header amber text readable at 375px; badge «⏳ Ожидает» не ломает layout
- [ ] Fix 3: Terminal «Спасибо за визит!» centered on small screen, кнопка full-width
- [ ] Fix 4: Self-block Card не overflow horizontally; длинные dish_name wrap
- [ ] Touch targets >= 44px (Fix 3 кнопка → size="lg" + min-h-[44px] ✅)
- [ ] No new content below bottom sticky footer

---

## Regression Check (MANDATORY after fixes)

Проверить что существующие функции НЕ сломаны:
- [ ] Таб «Мои» открывается, блюда отображаются с bucket «В работе» / «Выдано»
- [ ] Кнопка «Заказать ещё» (в footer «Мои») работает
- [ ] Rating mode (state C/C2/C3) по-прежнему работает для «Выдано»
- [ ] Таб «Стол» переключается, другие гости отображаются через `otherGuestsExpanded`
- [ ] Header «Мои»: `totalDishCount` и `headerTotal` корректны (формула не затронута, добавлен только «Вы:» prefix)
- [ ] Header «Стол»: новая формула (renderedTableTotal/Count/GuestCount) работает при 0, 1, 2+ гостях
- [ ] `submittedTableTotal` удалён из кода (grep 0 hits) или оставлен если есть другие использования
- [ ] Single-guest сессия: табов нет, только «Мои» контент (Fix 4 не сломал)
- [ ] Multi-guest + self без заказов: табы есть, «Стол» показывает только других (self-block скрыт)
- [ ] Multi-guest + self с заказами: «Стол» показывает self-block первым, потом «Заказы стола»
- [ ] Terminal screen: показывается при all-orders-closed; исчезает при dismiss; re-appears при новом tableId

---

## Review Instructions

Для каждого Fix:
1. **Прочитать** указанные строки `Read ... --offset=X --limit=Y` (ТОЛЬКО относящиеся к Fix'у)
2. **Выполнить** grep verification из секции Fix
3. **Оценить** (1-5), указать точные строки для изменений
4. **Флаги:** 🚨 BLOCKER | ⚠️ WARNING | ✅ APPROVED

### Final Rating Table

| Fix | CC Rating | Codex Rating | Verdict |
|-----|-----------|--------------|---------|
| Fix 1 Header+Invariant [BUG] | ? | ? | ? |
| Fix 2 Ожидает bucket [NEW CODE] | ? | ? | ? |
| Fix 3 Terminal screen [NEW CODE] | ? | ? | ? |
| Fix 4 Self-first Стол [BUG] | ? | ? | ? |

---

## НЕ делать (scope lock)

- ❌ Не менять sessionHelpers.js, partnertables.jsx или другие файлы
- ❌ Не добавлять «Попросить счёт» standalone CTA (V4 FROZEN)
- ❌ Не добавлять `stale_pending` / «Проверяем подтверждение…» (убран S302)
- ❌ Не менять rating flow (states C/C2/C3) — не в скоупе
- ❌ Не форсировать Math.round() на ценах для KZT/RUB (KB-167: by design)
- ❌ Не менять `otherGuestsExpanded` логику / UI
- ❌ Не добавлять `tableSession` prop или изменять `showTableOrdersSection` определение
- ✅ **Exception — i18n dictionary (NON-MANDATORY):** Реализация добавляет 11 новых `tr(key, fallback)` ключей. `tr()` (line 282) уже имеет механизм fallback-строк: если ключ не найден в словаре — отображается переданный fallback (русский текст). UI **не покажет raw ключи** вида `cart.group.pending`. Добавление ключей в словарь = опциональная оптимизация для будущих переводов, НЕ блокирует данный батч.

### ℹ️ i18n Note (B8, NON-MANDATORY)

Реализация добавит новые `tr()` ключи — все с Russian fallback-строками. Добавление в i18n dictionary **необязательно** для корректной работы (tr() использует fallback автоматически). Рекомендуется как отдельная задача для i18n coverage.

Новые ключи:
```
cart.header.you_label      → «Вы»
cart.header.table_label    → «Стол»
cart.header.guest_one      → «гость»
cart.header.guest_few      → «гостя»
cart.header.guest_many     → «гостей»
cart.terminal.title        → «Спасибо за визит!»
cart.terminal.your_total   → «Ваша сумма»
cart.terminal.back_to_menu → «Вернуться в меню»
cart.group.pending         → «⏳ Ожидает»
cart.order.pending_badge   → «Ожидает»
cart.table.you             → «Вы»
```

> i18n функция в файле: `const tr = (key, fallback)` (line 282). Использовать ТОЛЬКО `tr()`, НЕ `t()` или `trFormat()`.

---

## FROZEN UX Grep Verification (MANDATORY before commit)

Выполнить после реализации, убедиться что FROZEN elements не затронуты:

```bash
# CV-52: только 2 base статуса guest-facing + новый pending
grep -a -n "cart.group.in_progress\|cart.group.served\|cart.group.pending\|В работе\|Выдано" pages/PublicMenu/CartView.jsx
# Ожидаем: существующие строки ПЛЮС новый pending bucket

# CV-50: деньги только в header, не в bucket-заголовках (v17: context-grep вместо same-line)
grep -a -n -A3 -B3 "bucketDisplayNames\[" pages/PublicMenu/CartView.jsx | grep -v "formatPrice"
# Ожидаем: bucket-header блок НЕ содержит formatPrice вблизи bucketDisplayNames (проверяем контекст ±3 строки)

# V4: standalone «Попросить счёт» CTA не добавлен
grep -a -n "Попросить счёт\|ask_bill\|request.*bill\|bill.*cta" pages/PublicMenu/CartView.jsx
# Ожидаем: 0 hits

# stale_pending не восстановлен
grep -a -n "stale_pending\|Проверяем подтверждение" pages/PublicMenu/CartView.jsx
# Ожидаем: 0 hits

# Fix 3: правильный data source (не currentTable.status)
grep -a -n "currentTable.status\|currentTable?.status" pages/PublicMenu/CartView.jsx
# Ожидаем: 0 hits

# Fix 3: durable persist реализован (v18: composite key)
grep -a -n "terminalStorageKey\|terminalDismissed\|showTerminal\|sessionSelfTotal" pages/PublicMenu/CartView.jsx
# Ожидаем: ≥4 hits (terminalStorageKey def, useState, showTerminal derived, sessionSelfTotal useMemo)

# Fix 2: правильный идентификатор bucketDisplayNames (не groupLabels)
grep -a -n "groupLabels" pages/PublicMenu/CartView.jsx
# Ожидаем: 0 hits (этот идентификатор не существует — используется bucketDisplayNames)
```
