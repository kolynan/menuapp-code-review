---
chain: cartview-260415-225026-8ace
chain_step: 4
chain_total: 4
chain_step_name: merge-v2
page: CartView
budget: 12.00
runner: cc
type: chain-step
---
=== CHAIN STEP: Merge (4/4) ===
Chain: cartview-260415-225026-8ace
Page: CartView

You are the Merge step in a modular consensus pipeline.
Your job: apply the fix plan to the actual code.

INSTRUCTIONS:
1. Read the comparison: pipeline/chain-state/cartview-260415-225026-8ace-comparison.md
   - **Abort-on-empty check (KB-158):** if comparison contains `## CRITICAL: No findings found` OR has empty "Final Fix Plan" (0 items) → write merge report with status `ABORTED_NO_FINDINGS`, skip git commit, EXIT step. Do NOT proceed with 0 fixes and claim success.
   - **Capture HEAD baseline:** run `git rev-parse HEAD` and record value as `HEAD_BEFORE` in merge report. Required for step 9 verify.
2. Check if discussion report exists: pipeline/chain-state/cartview-260415-225026-8ace-discussion.md
   - If it exists AND has an "Updated Fix Plan" section → use THAT for disputed items
   - If it says "No disputes" or doesn't exist → use Comparator's "Final Fix Plan" as-is
   - Items marked "Unresolved (for Arman)" → SKIP these, do NOT apply
3. **File integrity check (KB-121 prevention):**
   Run: `wc -l pages/CartView/*.jsx`
   - If result matches expected line count from comparison/findings → proceed.
   - If result is unexpectedly low (e.g. differs by 200+ lines from what findings mention) →
     run `git fetch origin && git reset --hard origin/main` then verify again.
   - If still wrong after reset → STOP and write merge report explaining the issue. Do NOT apply changes to a truncated file.
4. Read the code file: pages/CartView/*.jsx
5. Apply ALL fixes from the fix plan, in priority order (P0 first)
   - Agreed items from Comparator: always apply
   - Discussion-resolved items: apply the winning solution
   - Unresolved disputes: SKIP (note in merge report)
   - [MUST-FIX] items: CANNOT be skipped. If you cannot apply a MUST-FIX, explain WHY in detail in merge report — do NOT silently skip.
6. After applying fixes:
   a. Update BUGS.md in pages/CartView/ with fixed items
   b. Update README.md in pages/CartView/ if needed
7. Git commit and push:
   - git add <specific files only> (NEVER git add . or git add -A)
   - git commit -m "fix(CartView): N bugs fixed via consensus chain cartview-260415-225026-8ace"
   - git push
8. **Verify-commit check (PQ-111):** run `git rev-parse HEAD` → record as `HEAD_AFTER`.
   - If `HEAD_BEFORE == HEAD_AFTER` → merge FAILED silently. Write merge report with status `FAILED_NO_COMMIT` explaining what blocked the commit (merge conflict? nothing to stage? hooks rejected?). Do NOT claim success.
   - If `HEAD_AFTER != HEAD_BEFORE` → verify commit touched expected files: `git show --stat HEAD` must include at least one `pages/CartView/` file. If not → status `FAILED_WRONG_FILES`.
9. Write merge report to: pipeline/chain-state/cartview-260415-225026-8ace-merge-report.md

FORMAT for merge report:
# Merge Report — CartView
Chain: cartview-260415-225026-8ace

## Applied Fixes
1. [P0] Fix title — Source: agreed/discussion-resolved — DONE
2. [P1] Fix title — Source: comparator — DONE
...

## Skipped — Unresolved Disputes (for Arman)
- Dispute: [title] — CC says X, Codex says Y — NEEDS DECISION

## Skipped — Could Not Apply
- Reason...

## Git
- HEAD_BEFORE: <hash>
- HEAD_AFTER: <hash>
- Commit: <hash> (MUST equal HEAD_AFTER when status=OK)
- Status: OK | ABORTED_NO_FINDINGS | FAILED_NO_COMMIT | FAILED_WRONG_FILES
- Lines before: <N>
- Lines after: <N>
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
# КС — CartView B1-Polish (8 fixes)

**Контекст:** Д3 findings от CC ($1.24/10m, 439 строк) + Codex ($1.46/25m, 105 строк) готовы в
`menuapp-code-review/pipeline/chain-state/cartview-260415-213231-403a-{cc,codex}-position.md`.
Synthesizer шёл CC-only (known bug #357), поэтому в этом КС ручной синтез Cowork.

**Target file:** `pages/PublicMenu/260415-00 CartView RELEASE.jsx` (HEAD, 1223 строк). RELEASE filename
for commit = `260415-01 CartView RELEASE.jsx` (Rule 32a: RELEASE-файл + integrity check перед деплоем).

**Проверено Cowork перед КС:**
- grep в HEAD подтвердил все line numbers из findings (см. таблицу per-fix ниже).
- `formatPrice` prop определён в родителе `x.jsx` — НЕ модифицируем helper, фиксим call-sites (CC approach) для defense-in-depth, т.к. Codex отметил что `formatPrice` в x.jsx:1159-1167 уже делает `Math.round(num*100)/100`. Мы всё равно добавляем локальное округление в useMemo'ах (минимально), чтобы исключить любой non-formatPrice путь.
- `cartTab` state уже существует в HEAD (добавлен CV-B1-Core S279). `otherGuestIdsFromOrders` useMemo на @485-487.
- `sessionOrders` sorted by `created_at desc` в `sessionHelpers.js:147` — order стабильный для ordinal fallback в Fix 6.

---

## FROZEN UX (не менять)

1. **Two-tab Мои/Стол** (CV-14/56 CV-B1-Core) — UI tabs сохраняем как есть.
2. **Two-group Активные/Подано model** (CV-A) — `statusBuckets`, grouping не трогаем.
3. **CV-70 footer CTA phases** (State A/B/C) — только исправляем label/variant для empty-cart branch, сам phase-switch оставляем.
4. **Privacy CV-20** — не показываем draft других гостей (усиливается Fix 5).
5. **CV-52** — в Стол tab только два стабильных chip'а («В работе»/«Выдано»), НЕ показываем внутренние stage-labels партнёра (Fix 3).
6. **Rating flow** для своих блюд (openReviewDialog для self) — оставляем (Fix 5 только убирает кросс-гость кнопку).

---

## BUGS_MASTER note

После merge добавить в `menuapp-code-review/pages/CartView/BUGS.md` статус FIXED для
CV-BUG-06..13 с commit hash. `BUGS_MASTER.md` (root) — синхронизировать.

---

## Fix 1 — CV-BUG-07 (P0) · Floating-point в суммах на табе «Стол»

**Status:** `[BUG at lines 811, 834, 848 + useMemo @ 489-498]`

**Target file:** `pages/PublicMenu/260415-00 CartView RELEASE.jsx`

**Проблема:** Три call-site `formatPrice(...)` в Стол-таб секции передают незаокруглённые
сырые суммы:
- `:811` — `formatPrice(tableOrdersTotal)` (useMemo @489-498 = raw `reduce`).
- `:834` — `formatPrice(guestTotal)` (inline reduce @825).
- `:848` — `formatPrice(order.total_amount)` (DB value, обычно безопасно, но defense-in-depth).

Codex отметил что `formatPrice` в `x.jsx:1159-1167` уже использует `Math.round(num*100)/100`,
поэтому видимая ошибка маловероятна в prod. Но BUGS.md CV-BUG-07 помечен P0 — фиксим
**на уровне call-sites + useMemo** чтобы исключить любой non-formatPrice путь и защититься
от будущих изменений в `formatPrice`.

**Что делать (2 шага):**

1. **Round в `tableOrdersTotal` useMemo @489-498** — добавить финальное округление:
   ```diff
   - return sum;
   + return parseFloat(sum.toFixed(2));
     }, [sessionOrders, currentGuest?.id]);
   ```

2. **Call-site фиксы** на `:811`, `:834`, `:848`:
   ```diff
   - <span className="font-bold text-slate-700">{formatPrice(tableOrdersTotal)}</span>
   + <span className="font-bold text-slate-700">{formatPrice(parseFloat(Number(tableOrdersTotal).toFixed(2)))}</span>

   - <span className="font-bold text-slate-600">{formatPrice(guestTotal)}</span>
   + <span className="font-bold text-slate-600">{formatPrice(parseFloat(Number(guestTotal).toFixed(2)))}</span>

   - {tr('cart.order_total', 'Сумма заказа')}: {formatPrice(order.total_amount)}
   + {tr('cart.order_total', 'Сумма заказа')}: {formatPrice(parseFloat(Number(order.total_amount).toFixed(2)))}
   ```

**НЕ должно быть в Fix 1:**
- НЕ трогать `formatPrice` helper в родительском `x.jsx` (global side-effects).
- НЕ менять остальные `formatPrice(...)` call-sites (которые уже имеют `toFixed(2)` — :631, :764, :896, :908, :1087).
- НЕ добавлять `.toFixed(2)` на `item.price` (@1084) — single DB value, out of scope.

**Test:**
1. Стол с 2+ гостями, fractional prices (например 1299.99 × 3) → Стол-таб → collapsed header total = 2 decimals, no `3899.969999`.
2. Expand гостя → per-guest total = 2 decimals.
3. Per-order line amount = 2 decimals.

---

## Fix 2 — CV-BUG-08 (P0) · CV-70 regression: empty-cart CTA

**Status:** `[BUG at lines 1209-1218]`

**Target file:** `pages/PublicMenu/260415-00 CartView RELEASE.jsx`

**Проблема:** При empty cart + активные orders рендерится `variant="outline"` кнопка с
label `Заказать ещё` — это прямое нарушение CV-70 rule b: "cart empty + active/delivered
orders → primary filled «Вернуться в меню»". Label `Заказать ещё` забанен CV-70 как
cognitive conflict в empty-cart контексте.

**Что делать (:1209-1218):**
```diff
- <Button
-   variant="outline"
-   size="lg"
-   className="w-full min-h-[44px]"
-   style={{borderColor: primaryColor, color: primaryColor}}
-   onClick={() => { onClose ? onClose() : setView("menu"); }}
- >
-   {tr('cart.cta.order_more', 'Заказать ещё')}
- </Button>
+ <Button
+   size="lg"
+   className="w-full min-h-[44px] text-white"
+   style={{backgroundColor: primaryColor}}
+   onClick={() => { onClose ? onClose() : setView("menu"); }}
+ >
+   {tr('cart.cta.back_to_menu', 'Вернуться в меню')}
+ </Button>
```

**i18n keys:**
- Новый: `cart.cta.back_to_menu` = "Вернуться в меню".
- Orphan: `cart.cta.order_more` — grep подтвердил ЕДИНСТВЕННОЕ использование на `:1217` (см. findings), можно удалить из translations.

**НЕ должно быть в Fix 2:**
- НЕ трогать остальные phase-branches (State A `cart.length > 0` с «Отправить официанту») — они корректны.
- НЕ менять `onClick` behavior (onClose→setView("menu")) — только visual + label.

**Test:**
1. Добавить 1 блюдо → submit order → корзина пустеет → open drawer → видим primary filled зелёную кнопку "Вернуться в меню".
2. Tap кнопку → возврат в меню.
3. Добавить блюдо → footer переключается на "Отправить официанту" (State A).
4. Проверить обе вкладки Мои/Стол.

---

## Fix 3 — CV-BUG-09 (P1) · Badge «Готово» в Стол-табе (CV-52)

**Status:** `[BUG at lines 300-338]` (функция `getSafeStatus`)

**Target file:** `pages/PublicMenu/260415-00 CartView RELEASE.jsx`

**Проблема:** `getSafeStatus` мапит преимущественно по `status.label`, а не по `internal_code`.
В HEAD `oldInProgressLabels` (@326 в HEAD / @322 в RELEASE текущем) содержит
`['Отправлено','Принят','Готовится','Готов']` — но не `'Готово'` (нейтральная форма, которая
и попадает с custom stage names партнёра). Fallthrough → label возвращается as-is →
гость видит внутренний партнёрский label.

**Решение (синтез CC+Codex):** Codex рекомендует мапить **по `internal_code` первым**,
а label-mapping оставить как fallback (с добавлением `'Готово'` на случай legacy данных).

**Что делать (`getSafeStatus` @300-338):**

1. Добавить early-check по `internal_code` в самом начале функции (до обработки label):
   ```js
   const getSafeStatus = (status) => {
     if (!status) return { label: tr('cart.status.in_progress', 'В работе'), icon: '⏳', color: '#64748b' };

     // S290: internal_code first (CV-52 compliance — guest-facing 2 states only)
     const code = status.internal_code;
     if (code === 'ready' || code === 'prepared' || code === 'in_progress' || code === 'accepted' || code === 'new') {
       return { label: tr('cart.status.in_progress', 'В работе'), icon: '⏳', color: '#64748b' };
     }
     if (code === 'served' || code === 'delivered') {
       return { label: tr('cart.status.served', 'Выдано'), icon: '✓', color: '#059669' };
     }
     if (code === 'cancel' || code === 'cancelled') {
       return { label: tr('cart.status.cancelled', 'Отменён'), icon: '✕', color: '#dc2626' };
     }
     // ...существующая label-based логика остаётся как fallback
     const label = status.label || '';
     // ...
   };
   ```

2. В `oldInProgressLabels` (@326 HEAD) добавить `'Готово'` как safety net:
   ```diff
   - const oldInProgressLabels = ['Отправлено', 'Принят', 'Готовится', 'Готов'];
   + const oldInProgressLabels = ['Отправлено', 'Принят', 'Готовится', 'Готов', 'Готово'];
   ```

**НЕ должно быть в Fix 3:**
- НЕ менять количество отображаемых chip'ов (остаётся «В работе» / «Выдано» per CV-52).
- НЕ трогать `statusBuckets` (@434-441) — уже использует `internal_code` через `getOrderStatus`.
- НЕ менять callers `getSafeStatus` — только тело функции.

**Test:**
1. Order с `stage.internal_code='ready'` и custom label «Готово» → Стол-таб → chip = «В работе» (не «Готово»).
2. Order со `stage.internal_code='served'` → chip = «Выдано».
3. Order с отсутствующим `internal_code` но legacy label «Готов» → всё ещё мапится на «В работе» (fallback).
4. Мои-таб — status badges работают как раньше.

---

## Fix 4 — CV-BUG-10 + CV-BUG-13 (P1+P2) · Header total semantics + pluralization

**⚠️ Fix 4 объединяет CV-BUG-10 и CV-BUG-13 — обе правки трогают header на `:757-767` и должны быть реализованы вместе, иначе второй Fix перезапишет первый.**

**Status:**
- CV-BUG-10: `[BUG at lines 873-883 (Card block)]` + `[BUG at lines 753-767 (header)]`
- CV-BUG-13: `[BUG at line 757 (pluralization)]`

**Target file:** `pages/PublicMenu/260415-00 CartView RELEASE.jsx`

**Проблема:**
- **CV-BUG-10:** Card `«Счёт стола»` (@873-883) нарушает **CV-50** (money only in header). В Стол-таб header должен показывать `Заказано на стол: X ₸` (CV-19), сейчас показывает dish count.
  - Codex flagged: `tableTotal` prop (в `useTableSession.jsx:784-788`) = submitted orders всех гостей **+ cartTotalAmount текущего гостя** → завышает header в Стол-табе. Нужно submitted-only sum.
- **CV-BUG-13:** `tr('cart.header.dishes', 'блюда')` — хардкод всегда «блюда», не работает для 1/5/17/21 по русским правилам плюрализации.

**Что делать (4 шага):**

1. **Добавить helper `pluralizeRu`** рядом с другими helpers (после `trFormat` ~@297):
   ```js
   const pluralizeRu = (n, one, few, many) => {
     const abs = Math.abs(n);
     const m10 = abs % 10;
     const m100 = abs % 100;
     if (m10 === 1 && m100 !== 11) return one;
     if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return few;
     return many;
   };
   ```

2. **Добавить `submittedTableTotal` useMemo** рядом с `tableOrdersTotal` (после @498) — submitted-only sum всех гостей (для Стол-таб header):
   ```js
   // S290 CV-BUG-10: Стол header = submitted orders всех гостей (без draft cart)
   const submittedTableTotal = React.useMemo(() => {
     const orders = sessionOrders || [];
     const sum = orders
       .filter(o => o.status !== 'cancelled' && (o.status === 'submitted' || o.status === 'accepted' || o.status === 'in_progress' || o.status === 'ready' || o.status === 'served' || o.status === 'closed'))
       .reduce((acc, o) => acc + (Number(o.total_amount) || 0), 0);
     return parseFloat(sum.toFixed(2));
   }, [sessionOrders]);
   ```
   > **Note:** альтернатива — использовать `tableTotal - cartTotalAmount`, но это менее прозрачно. Submitted filter + own reduce надёжнее.

3. **Conditional header** (@753-767) — переключаем по `cartTab`:
   ```diff
     return totalDishCount > 0 ? (
       <div className="text-xs text-slate-500 mt-0.5">
   -     {totalDishCount} {tr('cart.header.dishes', 'блюда')} · {formatPrice(parseFloat(headerTotal.toFixed(2)))}
   +     {cartTab === 'table'
   +       ? `${tr('cart.header.table_ordered', 'Заказано на стол')}: ${formatPrice(parseFloat(Number(submittedTableTotal).toFixed(2)))}`
   +       : `${totalDishCount} ${pluralizeRu(totalDishCount, tr('cart.header.dish_one', 'блюдо'), tr('cart.header.dish_few', 'блюда'), tr('cart.header.dish_many', 'блюд'))} · ${formatPrice(parseFloat(headerTotal.toFixed(2)))}`
   +     }
       </div>
     ) : null;
   ```

4. **Удалить Card «Счёт стола»** (@873-883 в RELEASE / эквивалент в HEAD):
   ```diff
   - {/* SECTION 6: TABLE TOTAL */}
   - {(sessionGuests.length > 1 || showTableOrdersSection) && (
   -   <Card className="mb-4 bg-slate-50">
   -     <CardContent className="p-4">
   -       <div className="flex items-center justify-between">
   -         <span className="font-medium text-slate-700">{tr('cart.table_total', 'Счёт стола')}:</span>
   -         <span className="text-xl font-bold text-slate-900">{formatPrice(parseFloat(Number(tableTotal).toFixed(2)))}</span>
   -       </div>
   -     </CardContent>
   -   </Card>
   - )}
   ```
   > **HEAD-specific:** CC findings ссылаются на DВА Card блока (@890-900 Стол-таб + @902-912 Мои-таб) в 1223-строчном HEAD. Если при implementation окажется что HEAD действительно имеет два блока — удалить оба. Если только один (как в RELEASE 260414-03) — удалить один.

**i18n keys:**
- Новые: `cart.header.table_ordered` = "Заказано на стол", `cart.header.dish_one` = "блюдо", `cart.header.dish_few` = "блюда", `cart.header.dish_many` = "блюд".
- Orphans: `cart.header.dishes`, `cart.table_total` — можно удалить из translations (grep check during impl).

**НЕ должно быть в Fix 4:**
- НЕ менять `headerTotal` formula для Мои-таба (остаётся `ordersSum + cartTotalAmount` — это правильно для своих).
- НЕ трогать `showTableOrdersSection` (@501) — условие для секции гостей, не для header.
- НЕ использовать `tableTotal` prop напрямую для Стол-таб header (Codex critical catch: включает draft cart).
- НЕ добавлять plural helper в shared utils — local scope CartView only.

**Test:**
1. 2+ гостя, stol-tab → header = "Заказано на стол: X ₸", без отдельной Card внизу. X = сумма submitted orders всех гостей, НЕ включает draft текущего гостя.
2. My-tab → header = "N <pluralized> · X ₸" (1 → «блюдо», 3 → «блюда», 17 → «блюд», 21 → «блюдо»).
3. Draft в cart + submitted orders → My-tab header считает свой total (orders+cart), Stol-tab header — только submitted всех.
4. Нет Card «Счёт стола» ни в одной вкладке.

---

## Fix 5 — CV-BUG-11 (P2) · Удалить кнопку «Оценить блюда гостей»

**Status:** `[BUG at lines 856-866]` (RELEASE) / `[:872-883]` (HEAD)

**Target file:** `pages/PublicMenu/260415-00 CartView RELEASE.jsx`

**Проблема:** Кнопка `⭐ Оценить блюда гостей` позволяет оценивать чужую еду → нарушает
CV-20 privacy. Spec State T (`ux-concepts/CartView/260408-00 CartView UX S246.md:348-369`)
не содержит такой кнопки. Footer CTA на Стол-таб = «Попросить счёт» (CV-21).

**Что делать:**
```diff
  {otherGuestIdsFromOrders.map((gid) => {
    // ... per-guest rendering ...
  })}

- {/* Review button for other guests' dishes */}
- {otherGuestsReviewableItems.length > 0 && (
-   <Button
-     variant="outline"
-     size="sm"
-     className="w-full mt-2"
-     onClick={() => openReviewDialog(otherGuestsReviewableItems)}
-   >
-     ⭐ {tr('review.rate_others', 'Оценить блюда гостей')}
-     {loyaltyAccount && (partner?.loyalty_review_points ?? 0) > 0 && ` (+${otherGuestsReviewableItems.length * (partner?.loyalty_review_points ?? 0)} ${tr('review.points', 'баллов')})`}
-   </Button>
- )}
```

**i18n:** `review.rate_others` — orphan после удаления (можно удалить из translations).

**НЕ должно быть в Fix 5:**
- НЕ трогать `openReviewDialog` prop — используется для self-rating elsewhere.
- НЕ удалять `otherGuestsReviewableItems` prop из signature (@65) — upstream `x.jsx:3261-3275` остаётся; cleanup — отдельный батч (out of scope).
- НЕ менять Rating dialog component.

**Test:**
1. Стол-таб, 2+ гостя, часть orders served → НЕ видим кнопку «Оценить блюда гостей».
2. Мои-таб → self rating chip «Оценить» на served orders всё ещё работает.
3. openReviewDialog для self — работает как раньше.

---

## Fix 6 — CV-BUG-12 (P1) · «Гость 5331» → «Гость N»

**Status:** `[BUG at lines 493-506]` (`getGuestLabelById`)

**Target file:** `pages/PublicMenu/260415-00 CartView RELEASE.jsx`

**Проблема:** Когда `sessionGuests` не содержит гостя с данным `id` (race / sync-gap
между `sessionOrders` и `sessionGuests`), fallback берёт `gid.slice(-4)` → «Гость 5331»
(последние 4 символа UUID). CV-13 требует «Гость N» где N — sequential (1 = ты, 2+ = другие).

**Решение (оба рецензента согласны — Option A):** index-based fallback через `otherGuestIdsFromOrders`.
Deeper data-gap cause (prop threading `SessionGuest` data для всех гостей) — отдельный
батч, НЕ в Polish.

**Что делать (`getGuestLabelById` @500-506 HEAD / @493 в RELEASE):**
```diff
  const getGuestLabelById = (guestId) => {
    const gid = String(guestId);
    const found = (sessionGuests || []).find((g) => String(g.id) === gid);
    if (found) return getGuestDisplayName(found);
-   const suffix = gid.length >= 4 ? gid.slice(-4) : gid;
-   return `${tr("cart.guest", "Гость")} ${suffix}`;
+   // S290 CV-BUG-12: index-based ordinal fallback (Polish batch; deeper fix in future sprint)
+   const idx = (otherGuestIdsFromOrders || []).indexOf(gid);
+   const guestNum = idx >= 0 ? idx + 2 : '?';  // +2: self = Гость 1, others start at 2
+   return `${tr("cart.guest", "Гость")} ${guestNum}`;
  };
```

**Scope check:** `otherGuestIdsFromOrders` useMemo на @485-487 HEAD — в том же функциональном
scope что и `getGuestLabelById` (@500 HEAD). OK.

**НЕ должно быть в Fix 6:**
- НЕ менять prop threading для `SessionGuest` (scope: Polish only).
- НЕ трогать `getGuestDisplayName` helper (в `sessionHelpers.js:226-229` использует `guest.guest_number`).
- НЕ менять numbering когда `found` branch срабатывает (нормальный путь — сохраняем).

**Test:**
1. Стол с 3 гостями, sessionGuests загружен → «Гость 2», «Гость 3», «Гость N» (из `guest_number`).
2. Reload страницы → numbering consistent (order от `sessionOrders` desc by created_at — стабильный).
3. Sync-gap (stale sessionGuests) → «Гость 2» вместо «Гость 5331».
4. Orphan guestId (нет и в orders) → «Гость ?» (edge-case marker).

---

## Fix 7 — CV-BUG-06 (L) · Raw `o.status === 'cancelled'` → stage-based filter

**Status:** `[BUG at line 422]` (HEAD) / `[:418]` (RELEASE текущий)

**Target file:** `pages/PublicMenu/260415-00 CartView RELEASE.jsx`

**Проблема:** `todayMyOrders` useMemo фильтрует `.filter(o => o.status !== 'cancelled')` — но
реальный статус order идёт через `stage_id` (тот же root cause что CV-BUG-05, уже
починенный для `statusBuckets` в CV-B1-Core). Raw `o.status` может отставать от stage pipeline.

`statusBuckets` (@434-441) уже делает правильно:
```js
const isCancelled = !stageInfo?.internal_code && (o.status || '').toLowerCase() === 'cancelled';
```

**Что делать (@413-428 HEAD):**
```diff
    return (myOrders || [])
      .filter(o => { ... shift-cutoff filter ... })
-     .filter(o => o.status !== 'cancelled')
+     .filter(o => {
+       const stageInfo = getOrderStatus(o);
+       const isCancelled = stageInfo?.internal_code === 'cancel'
+         || (!stageInfo?.internal_code && (o.status || '').toLowerCase() === 'cancelled');
+       return !isCancelled;
+     })
      // ...existing chain
- }, [myOrders]);
+ }, [myOrders, getOrderStatus]);
```

**НЕ должно быть в Fix 7:**
- НЕ менять `statusBuckets` (@434-441) — уже правильная логика.
- НЕ трогать shift cutoff filter (первый `.filter` перед этим) — out of scope.
- НЕ добавлять в deps кроме `getOrderStatus` (callback обычно стабилен через useCallback).

**Test:**
1. Cancelled order (status='cancelled') → не в Мои-табе.
2. Order at stage `internal_code='cancel'` → не в Мои-табе (раньше мог просачиваться).
3. Non-cancelled orders → отображаются корректно.
4. Downstream consumers `todayMyOrders` (statusBuckets:431) — не ломаются.

---

## Regression Check (MANDATORY after implementation)

Эти фичи должны ПРОДОЛЖАТЬ работать после Fix 1+2+3+4+5+6+7:

1. **CV-70 State A** — cart.length>0 → «Отправить официанту» primary filled (не затронут Fix 2; Fix 2 меняет только empty-cart branch).
2. **CV-A two-group model** — «Активные/Подано» на Мои-табе (statusBuckets, statusBuckets rendering) — не затронут.
3. **Мои-tab footer** — при mixed stages (in-progress + served + cart items) — phase-switch корректен.
4. **Rating flow для своих блюд** — `openReviewDialog(myItems)` на self served chip.
5. **sessionGuests loading skeleton** — `sessionItems.length === 0 && sessionOrders.length > 0` ветка (@815-816) — не затронута.
6. **Collapsed drawer header** — chevron close (@763+) работает как раньше после header refactor (Fix 4 только меняет текст внутри).

---

## Validation после merge (execute before commit)

1. **Lint:** `cd menuapp-code-review && npx eslint "pages/PublicMenu/*.jsx"` → 0 errors.
2. **Grep verify:**
   - `grep -cn "formatPrice(tableOrdersTotal)\|formatPrice(guestTotal)\|formatPrice(order.total_amount)" "pages/PublicMenu/260415-00 CartView RELEASE.jsx"` — expected = 0 (все три обёрнуты в `parseFloat(Number(...).toFixed(2))`).
   - `grep -n "cart.cta.order_more" "pages/PublicMenu/260415-00 CartView RELEASE.jsx"` — expected = 0 (заменён на `cart.cta.back_to_menu`).
   - `grep -n "cart.cta.back_to_menu" "pages/PublicMenu/260415-00 CartView RELEASE.jsx"` — expected = 1.
   - `grep -n "cart.table_total" "pages/PublicMenu/260415-00 CartView RELEASE.jsx"` — expected = 0 (Card удалён).
   - `grep -n "review.rate_others" "pages/PublicMenu/260415-00 CartView RELEASE.jsx"` — expected = 0 (кнопка удалена).
   - `grep -n "pluralizeRu" "pages/PublicMenu/260415-00 CartView RELEASE.jsx"` — expected ≥ 2 (определение + call в header).
   - `grep -n "submittedTableTotal" "pages/PublicMenu/260415-00 CartView RELEASE.jsx"` — expected ≥ 2 (useMemo + call).
   - `grep -n "gid.slice(-4)" "pages/PublicMenu/260415-00 CartView RELEASE.jsx"` — expected = 0 (заменён на ordinal).
   - `grep -n "cart.header.table_ordered\|cart.header.dish_one\|cart.header.dish_few\|cart.header.dish_many" "pages/PublicMenu/260415-00 CartView RELEASE.jsx"` — expected ≥ 4 (новые i18n keys).
   - `grep -n "internal_code === 'cancel'" "pages/PublicMenu/260415-00 CartView RELEASE.jsx"` — expected ≥ 1 (Fix 7).
3. **Line count:** CartView.jsx 1223 → примерно 1220-1250 (удаление Card ≈ −11 строк, добавление pluralizeRu ≈ +8, submittedTableTotal ≈ +10, getSafeStatus internal_code branches ≈ +15, Fix 7 ≈ +5, остальное по мелочи).
4. **Integrity check:** `wc -l "pages/PublicMenu/260415-01 CartView RELEASE.jsx"` + `tail -5` (убедиться что закрывающие `}` + `export default` на месте).
5. **RELEASE-файл:** создать копию с новым именем `260415-01 CartView RELEASE.jsx` (Rule 32a).

---

## Files to modify

1. `pages/PublicMenu/260415-00 CartView RELEASE.jsx` → новая версия `260415-01 CartView RELEASE.jsx` (все 7 Fix).
2. `pages/PublicMenu/CartView.jsx` — синхронизировать (B44 auto-lint или manual copy).
3. `pages/CartView/BUGS.md` — проставить FIXED статус CV-BUG-06..13 + commit hash + RELEASE date.
4. `BUGS_MASTER.md` (root) — синхронизировать CV-BUG-06..13 FIXED.

---

## Git (auto via С5v2 merge step)

```
git add "pages/PublicMenu/260415-01 CartView RELEASE.jsx" \
        "pages/PublicMenu/CartView.jsx" \
        "pages/CartView/BUGS.md" \
        "../BUGS_MASTER.md"
git commit -m "fix(cv-b1-polish): 8 bugs CV-BUG-06..13 (FP sums, CTA, status badge, table-total, privacy, guest label, pluralization, cancelled filter)"
git push
```

---

## Prompt Clarity (self-assessment)

- **Overall clarity:** 4.5/5.
- **Known ambiguities handled inline:**
  - Fix 1: CC vs Codex disagreement → выбрали defense-in-depth (fix at useMemo + call-sites) с пояснением.
  - Fix 3: CC добавить label vs Codex map internal_code → сделали оба (internal_code first, label fallback расширен).
  - Fix 4: `tableTotal` включает draft cart (Codex catch) → ввели `submittedTableTotal` useMemo.
  - Fix 4 merge с Fix 7 (CV-BUG-13) — explicit warning в заголовке Fix 4.
- **Risks:**
  - Line numbers в findings относятся к HEAD 1223-строчной версии; при implementation использовать grep-паттерны (выше в Validation), не hardcoded line numbers.
  - `submittedTableTotal` filter по `o.status` включает список статусов — при изменении order lifecycle (новые статусы) может потребоваться update.
=== END ===
