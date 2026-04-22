---
chain: publicmenu-260331-221017-8992
chain_step: 4
chain_total: 4
chain_step_name: merge
page: PublicMenu
budget: 11.50
runner: cc
type: chain-step
---
=== CHAIN STEP: Merge (4/4) ===
Chain: publicmenu-260331-221017-8992
Page: PublicMenu

You are the Merge step in a modular consensus pipeline.
Your job: apply the fix plan to the actual code.

INSTRUCTIONS:
1. Read the comparison: pipeline/chain-state/publicmenu-260331-221017-8992-comparison.md
2. Check if discussion report exists: pipeline/chain-state/publicmenu-260331-221017-8992-discussion.md
   - If it exists AND has an "Updated Fix Plan" section → use THAT for disputed items
   - If it says "No disputes" or doesn't exist → use Comparator's "Final Fix Plan" as-is
   - Items marked "Unresolved (for Arman)" → SKIP these, do NOT apply
3. Read the code file: pages/PublicMenu/*.jsx
4. Apply ALL fixes from the fix plan, in priority order (P0 first)
   - Agreed items from Comparator: always apply
   - Discussion-resolved items: apply the winning solution
   - Unresolved disputes: SKIP (note in merge report)
   - [MUST-FIX] items: CANNOT be skipped. If you cannot apply a MUST-FIX, explain WHY in detail in merge report — do NOT silently skip.
5. After applying fixes:
   a. Update BUGS.md in pages/PublicMenu/ with fixed items
   b. Update README.md in pages/PublicMenu/ if needed
6. Git commit and push:
   - git add <specific files only> (NEVER git add . or git add -A)
   - git commit -m "fix(PublicMenu): N bugs fixed via consensus chain publicmenu-260331-221017-8992"
   - git push
7. Write merge report to: pipeline/chain-state/publicmenu-260331-221017-8992-merge-report.md

FORMAT for merge report:
# Merge Report — PublicMenu
Chain: publicmenu-260331-221017-8992

## Applied Fixes
1. [P0] Fix title — Source: agreed/discussion-resolved — DONE
2. [P1] Fix title — Source: comparator — DONE
...

## Skipped — Unresolved Disputes (for Arman)
- Dispute: [title] — CC says X, Codex says Y — NEEDS DECISION

## Skipped — Could Not Apply
- Reason...

## Git
- Commit: <hash>
- Files changed: N

## Prompt Feedback
Collect Prompt Clarity sections from CC and Codex findings files (if present), then add your own observations:
- CC clarity score: [N/5]
- Codex clarity score: [N/5]
- Fixes where writers diverged due to unclear description: ...
- Fixes where description was perfect (both writers agreed immediately): ...
- Recommendation for improving task descriptions: ...

## Summary
- Applied: N fixes
- Skipped (unresolved): N disputes
- Skipped (other): N fixes
- MUST-FIX not applied: N (with reasons)
- Commit: <hash>

=== TASK CONTEXT ===
# Help Drawer Phase 1 — Ticket Board Architecture (#214)

## Контекст

Help Drawer («Нужна помощь?») — компонент в x.jsx. Сейчас: карточки меняют цвет при pending, cardActionModal для повторных нажатий. Цель: переход на ticket board архитектуру (help-drawer.md v5.1).

**Ключевые UX-документы:** `ux-concepts/HelpDrawer/help-drawer.md` v5.1, `GPT_HelpDrawer_UX_S209.md`, `GPT_HelpDrawer_Remind_S210.md`

**Grep-подсказки (x.jsx):**
- requestStates: ~line 1636
- HELP_COOLDOWN_SECONDS: ~line 1640
- hasLoadedHelpStatesRef: ~line 1645
- handleCardTap: ~line 1720
- handleUndo: ~line 1760
- cardActionModal: ~line 4080
- HD-08 summary block: ~line 3916
- Cards grid: ~line 3927
- Undo toast: ~line 4033

---

## SCOPE LOCK

**Файл:** ТОЛЬКО `pages/PublicMenu/x.jsx`
**Компонент:** ТОЛЬКО Help Drawer (openHelpDrawer / HelpDrawerContent / handleCardTap / requestStates и связанные функции)
**НЕ трогать:** PublicMenu основной UI, MenuView, CartView, StickyCartBar, любые другие компоненты

---

## FROZEN UX (DO NOT CHANGE)

Следующие элементы уже работают и протестированы — **не изменять**:

- **HD-06:** Undo toast 5 сек после тапа (снизу drawer: «Позвали официанта · Отменить (4с)»)
- **HD-07:** FAB badge на кнопке «Нужна помощь?» — dot/цифра при активных запросах
- **HD-10:** `hasLoadedHelpStatesRef` guard — защита от race condition localStorage (KB-095 S208)
- **HD-05:** localStorage ключ `helpdrawer_{partnerId}_{venueId}_{tableId}_{tableSessionId}`
- **PM-125:** overlay stack порядок (Help Drawer поверх остального)
- **DrawerContent:** НЕ добавлять `relative` класс на DrawerContent (KB-096/vaul breakage)

E3 FROZEN UX grep verification (выполнить ПОСЛЕ всех изменений):
```
grep -n "hasLoadedHelpStatesRef" pages/PublicMenu/x.jsx  # должен быть
grep -n "helpdrawer_" pages/PublicMenu/x.jsx             # должен быть
grep -n "handleUndo" pages/PublicMenu/x.jsx              # должен быть
grep -n "cardActionModal" pages/PublicMenu/x.jsx         # должен ОТСУТСТВОВАТЬ (Fix 1 удаляет)
grep -n "HD-08" pages/PublicMenu/x.jsx                   # должен ОТСУТСТВОВАТЬ (Fix 1 удаляет)
```

---

## Fixes

### Fix 1 — ARCHITECTURE: Ticket board + always-idle cards [CRITICAL]

**Удалить:**
- HD-08 summary block (~line 3916–3926): весь блок `{activeRequests.length >= 2 && <div>Активные запросы...</div>}`
- cardActionModal (~line 4080–4130): весь modal с кнопками «Напомнить» / «Уже помогли» / «Закрыть»

**Добавить — Раздел 1 «Мои запросы»** (ticket board, показывать только если есть активные запросы):
```jsx
{activeRequests.length > 0 && (
  <div className="mb-4">
    <div className="flex items-center justify-between mb-2">
      <span className="text-sm font-semibold text-gray-700">Мои запросы</span>
      <span className="text-xs text-gray-400">{activeRequests.length} активных</span>
    </div>
    {/* Строки тикетов — см. Fix 2 для структуры данных, Fix 3/4/6 для поведения */}
    {ticketBoardRows}
    {/* Fix 5: anxiety copy */}
    <p className="text-xs text-gray-400 mt-1">Статус обновляется автоматически</p>
  </div>
)}
```

**Изменить карточки** (раздел «Отправить ещё»):
- Карточки (Позвать, Счёт, Салфетки, Меню, Другое) — **всегда в idle состоянии**
- Убрать любую логику изменения цвета/иконки карточки при `status === 'pending'` или `status === 'repeat'`
- Заголовок «Отправить ещё» показывать только если есть раздел «Мои запросы» (т.е. activeRequests.length > 0)

**Зависимость:** Fix 1 зависит от Fix 2 (новая структура requestStates нужна для ticketBoardRows).

---

### Fix 2 — STATE MODEL: Расширить requestStates [CRITICAL]

**Текущая структура:** `requestStates[type] = { status, sentAt, message }`

**Новая структура для стандартных типов:**
```js
requestStates[type] = {
  status,           // 'idle' | 'sending' | 'sent' | 'remind_available' | 'resolved'
  sentAt,           // timestamp исходной отправки — НИКОГДА не меняется
  lastReminderAt,   // timestamp последнего напоминания (null если не было)
  reminderCount,    // число напоминаний (0 по умолчанию)
  remindCooldownUntil, // timestamp до которого кнопка «Напомнить» disabled (null если доступна)
  message,          // для 'другое'
}
```

**Для типа `other`** — изменить на массив записей:
```js
requestStates['other'] = [
  { id: uuid, status, sentAt, lastReminderAt, reminderCount, remindCooldownUntil, message },
  ...
]
```
Каждый тап «Другое» + «Отправить» = новая запись в массиве.

**Таймер отображения** (в компоненте строки тикета):
- До 10 мин: «Только что» / «X мин назад»
- После 10 мин: «Ждёте X мин»
- Если `reminderCount > 0`: вторая строка «X напоминаний · последнее Y мин назад»
- `sentAt` — основа таймера, не меняется при remind

**setInterval** обновление каждые 30 сек (уже есть — проверить что считает от `sentAt`, не `lastReminderAt`).

---

### Fix 3 — SMART REDIRECT: Повторный тап на карточку [CRITICAL]

**Текущее поведение:** повторный тап открывает cardActionModal.
**Новое поведение:** если `requestStates[type].status` не 'idle' (уже есть активный запрос):

```js
// Вместо открытия modal:
1. Скролл к разделу «Мои запросы» (scrollIntoView({ behavior: 'smooth' }))
2. Amber highlight строки тикета 1.5 сек (className добавить/убрать через setTimeout)
3. Toast снизу: «Запрос уже отправлен — смотри выше»
```

**НЕ показывать cardActionModal** — он удаляется в Fix 1.

Реализовать через `useRef` на секцию «Мои запросы» + добавить `ticketRef` на каждую строку тикета.

---

### Fix 4 — ANTI-SPAM: Кнопка «Напомнить» с cooldown [IMPORTANT]

В `handleRemind(type)`:

```js
const handleRemind = (type) => {
  const REMIND_COOLDOWN_MS = 40_000; // 40 сек
  const now = Date.now();

  setRequestStates(prev => {
    const current = prev[type];
    // Обновить lastReminderAt, reminderCount, remindCooldownUntil
    return {
      ...prev,
      [type]: {
        ...current,
        lastReminderAt: now,
        reminderCount: (current.reminderCount || 0) + 1,
        remindCooldownUntil: now + REMIND_COOLDOWN_MS,
      }
    };
  });

  // Отправить сервисный запрос (аналог handleCardTap но без undo)
  // ...
};
```

**Кнопка «Напомнить» в строке тикета:**
- Если `remindCooldownUntil > Date.now()`: disabled + текст «Повторить через MM:SS» (countdown)
- Если cooldown истёк: активна, текст «Напомнить»
- Countdown обновляется тем же setInterval что и таймер (каждые 30 сек достаточно)

**Зависимость:** Fix 4 зависит от Fix 2 (поле `remindCooldownUntil` в state).

---

### Fix 5 — ANXIETY COPY: «Статус обновляется автоматически» [IMPORTANT]

Добавить под разделом «Мои запросы» (если есть хотя бы 1 активный запрос):
```jsx
<p className="text-xs text-gray-400 mt-1 text-center">
  Статус обновляется автоматически
</p>
```

Цель: снизить тревожность гостя при ожидании. Не показывать при 0 активных запросах.

---

### Fix 6 — COLLAPSE: Порог 4+, сортировка по старым [IMPORTANT]

**Текущий порог collapse:** 3+ → **изменить на 4+**.

**Логика:**
- До 3 запросов включительно: показывать все строки
- 4+ запросов: показывать первые 2, ниже коллапс «Ещё N запросов»

**Сортировка строк тикетов:** по `sentAt` ascending (самые старые сверху — гость видит что ждал дольше всего).

---

### Fix 7 — PAID GATE: Free-план блокирует help drawer [NICE-TO-HAVE]

В начале `handleCardTap(type)`, перед любой логикой:

```js
if (partner?.plan === 'Free') {
  // показать toast
  toast({
    title: t('helpDrawer.featureUnavailable') || 'Функция недоступна',
    description: t('helpDrawer.upgradePlan') || 'Эта функция не активирована для вашего заведения',
    duration: 3000,
  });
  return;
}
```

**Только если** поле `partner.plan` существует в текущем коде (grep проверить: `partner?.plan` или `partner.plan`). Если не существует — пропустить Fix 7 и записать в findings.

---

## ⚠️ Fix Dependencies

```
Fix 1 (архитектура) → требует Fix 2 (state model готов)
Fix 3 (redirect) → требует Fix 1 (cardActionModal удалён)
Fix 4 (antispam) → требует Fix 2 (remindCooldownUntil в state)
Fix 5 (anxiety copy) → независим, добавить в Fix 1 блок
Fix 6 (collapse) → независим
Fix 7 (paid gate) → независим, первая строка handleCardTap
```

Рекомендуемый порядок реализации: Fix 2 → Fix 1 → Fix 3 → Fix 4 → Fix 5 → Fix 6 → Fix 7

---

## MOBILE-FIRST CHECK

После реализации проверить:
- [ ] Раздел «Мои запросы» умещается в viewport 375px без горизонтального скролла
- [ ] Кнопки «Напомнить» и «Уже помогли» min-h-[44px] (touch target)
- [ ] Строки тикетов не перекрывают раздел «Отправить ещё» при 3+ запросах
- [ ] Amber highlight виден на светлом фоне (bg-amber-50 или border-amber-300)
- [ ] Countdown «Повторить через MM:SS» не обрезается в 320px viewport

---

## Regression Check

Проверить после всех изменений:
1. HD-06 undo toast — всё ещё работает при первом тапе карточки
2. HD-07 FAB badge — обновляется при добавлении/удалении тикетов
3. localStorage restore — `hasLoadedHelpStatesRef` guard не сломан
4. «Другое» форма — inline, не modal, черновик сохраняется
5. x.jsx line count = исходный ± разумное изменение (не обрезан)
=== END ===
