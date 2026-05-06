---
version: "1.5"
updated: "2026-05-01"
session: 494
release: "260415-01 CartView RELEASE.jsx (CV-B1-Polish chain cartview-260415-225026-8ace)"
---

# CartView — Bugs & Improvements

## 🔴 Баги (технические)

### CV-BUG-01 — Session loss: "Ваши заказы 0₸" после перезапуска Chrome
**Воспроизведение:** Открыть корзину → убить Chrome → открыть снова → корзина показывает "Ваши заказы 0₸"
**Ожидалось:** Показать заказы стола и персональные заказы (восстановить из tableSession по tableId)
**Факт:** Сохраняется только № стола. Ни заказы пользователя, ни заказы стола не восстанавливаются.
**Приоритет:** P1 — частая ситуация у реальных гостей (телефон засыпает/перезагружается)
**Batch:** Отдельный fix или Batch CV-B

---

### CV-BUG-02 — Ввод кода стола: лишняя кнопка + преждевременная валидация
**Воспроизведение:** Открыть ввод кода стола
**Факт 1:** Кнопка (которую решили убрать) всё ещё присутствует
**Факт 2:** При первом вводе сразу начинает проверять код — не даёт ввести полностью или сразу показывает "ошибочный код"
**Приоритет:** P1 — мешает первому входу гостя
**Batch:** Отдельный quick-fix (не связан с CartView drawer)

---

### CV-BUG-03 — Drawer открывается прокрученным мимо header после добавления в корзину
**Воспроизведение:** Открыть корзину → добавить блюдо → drawer открывается не сверху, а со скроллом вниз (не видно header, не видно "Выдано", сразу блюда без заголовков)
**Ожидалось:** Drawer открывается сверху ИЛИ auto-scroll к секции "В корзине" (новое действие пользователя)
**Факт:** Скролл непредсказуемый, гость вынужден скроллить вверх
**Приоритет:** P1 — нарушает базовую навигацию, происходит при каждом добавлении
**Batch:** Batch CV-BUGS (quick-fix)
**Ref:** Скрин 6 (26d859b7)

---

### CV-BUG-04 — Tap на chip "Оценить (N)" не раскрывает свёрнутую секцию "Выдано"
**Воспроизведение:** "Выдано (4)" свёрнуто, chip "Оценить (4)" оранжевый → тап по chip → chip меняется на "Готово" + "Режим оценки" label, НО секция остаётся свёрнутой → звёзды не видны
**Ожидалось (CV-43):** Chip = вход в rating mode, секция должна раскрываться автоматически, показывать inline звёзды для оценки
**Факт:** Секция остаётся свёрнутой, гость не видит что произошло, думает что ничего не случилось
**Приоритет:** P1 — rating flow неработоспособен в свёрнутом состоянии
**Batch:** Batch CV-BUGS или CV-B3 (rating flow)
**Ref:** Скрины ed7c0ffb (до) → ee4dc722 (после тапа)

---

### CV-BUG-07 — Floating point в суммах: «3 169.8700000000003 ₸» (P0)
**Воспроизведение:** Открыть таб «Стол» → развернуть «Заказы стола (N)» → в заголовке блока и строке гостя сумма показывается как `3 169.8700000000003 ₸`.
**Ожидалось:** `3 169.87 ₸` — 2 знака после запятой через `toFixed(2)` / форматирование.
**Факт:** JavaScript floating-point результат попадает в UI без округления.
**Приоритет:** P0 — ломает визуал, видно гостю.
**Batch:** CV-B1-Polish (quick).
**Ref:** Скрины `461db2f6`, `52c19ad0`, `a9fb4c78` (9a4f5b2, после CV-B1-Core).

---

### CV-BUG-08 — CTA «Заказать ещё» вместо «Вернуться в меню» (регрессия CV-70)
**Воспроизведение:** Корзина пустая + есть активные / выданные заказы → в footer показывается «Заказать ещё» (outline).
**Ожидалось (CV-70 rule b):** Primary filled «Вернуться в меню». Лейбл «Заказать ещё» удалён из UI по CV-70.
**Факт:** Старая CTA присутствует в State B (и, возможно, C3). CV-70 помечался как внедрённый в CV-B2a (RELEASE 260414-03) — сейчас либо частично не прокинуто, либо регрессия после CV-B1-Core.
**Приоритет:** P0 — нарушение FROZEN UX.
**Batch:** CV-B1-Polish.
**Ref:** Скрины `461db2f6` (таб Мои), `52c19ad0` (таб Стол), `a9fb4c78` (таб Стол, State B-подобный).

---

### CV-BUG-09 — Статус «Готово» показывается гостю в табе «Стол» (нарушение CV-52)
**Воспроизведение:** Таб «Стол» → развернуть «Заказы стола (N)» → в строке гостя блюдо «Стейк × 1» имеет badge `🟡 Готово`.
**Ожидалось (CV-52):** Гостю видны ТОЛЬКО 2 статуса — «В работе» / «Выдано». `ready` stage должен маппиться в «В работе» (Fix 1 из CV-B1-Core).
**Факт:** Рендеринг таба «Стол» использует `order.status` (или другой источник) напрямую, stage-based mapping (Fix 1, CV-BUG-05) применён только к `statusBuckets` таба «Мои», не к содержимому таба «Стол».
**Приоритет:** P1 — UX неконсистентность между табами.
**Batch:** CV-B1-Polish или CV-B1b.
**Ref:** Скрин `52c19ad0`.

---

### CV-BUG-10 — Блок «Итого по столу» не в спеке (нарушение CV-50 + CV-19)
**Воспроизведение:** Открыть CartView drawer → видно отдельный блок-карточка «Итого по столу: X ₸» в обоих табах (Мои и Стол).
**Ожидалось (CV-50 + Totals Logic §94-105):** Деньги показываются ТОЛЬКО в header drawer.
  - Таб «Мои» → header: `«N блюд · X ₸»`. Отдельного «Итого» блока нет.
  - Таб «Стол» → header меняется на `«Заказано на стол: X ₸»` (CV-19). Отдельного «Итого» блока нет.
**Факт 1:** Блок «Итого по столу» рендерится в обоих табах (legacy от пре-CV-50 дизайна).
**Факт 2:** Header в табе «Стол» показывает «17 блюд · 32 958.14 ₸» (формат таба «Мои»), а должен переключаться на «Заказано на стол: X ₸» (CV-19).
**Факт 3:** Лейбл «Итого по столу» похож на запрещённый (§104 «Заказов: X ₸», §Запрещённые лейблы).
**Ожидалось:** Удалить блок полностью. Header в табе «Стол» — переключать label на «Заказано на стол».
**Приоритет:** P1 — нарушение FROZEN UX, дублирует сумму.
**Batch:** CV-B1-Polish.
**Ref:** Скрины `461db2f6` (таб Мои), `52c19ad0`, `a9fb4c78` (таб Стол).

---

### CV-BUG-11 — Кнопка «⭐ Оценить блюда гостей» в табе «Стол» не в спеке
**Воспроизведение:** Таб «Стол» → внутри блока «Заказы стола (N)» видна кнопка `⭐ Оценить блюда гостей`.
**Ожидалось (State T, §348-371):** В табе «Стол» нет кнопки оценки чужих блюд. Footer CTA State T = «Попросить счёт» (CV-21). Оценка доступна в табе «Мои» / State C/D для своих блюд.
**Факт:** Новая CTA добавлена без основы в UX-спеке.
**Приоритет:** P2 — создаёт privacy-риск (оценка чужих блюд) + нарушение CV-20 (privacy между гостями).
**Batch:** CV-B1-Polish (удалить) или обсудить с GPT если есть продуктовая причина.
**Ref:** Скрин `52c19ad0`.

---

### CV-BUG-12 — Блок «Заказы стола (N)» вместо гостевой группировки
**Воспроизведение:** Таб «Стол» → видно сворачиваемый блок «Заказы стола (1) · 3 169.87 ₸» → внутри «Гость 5331» с блюдами.
**Ожидалось (State T + CV-13/16/17):** Гостевая группировка: self-first блок «Вы (Гость 1)» раскрыт, остальные гости свёрнуты как карточки `Артём (Гость 3) › 1 блюдо`. Fallback label — `Гость N`, не `Гость 5331` (это выглядит как device_id/session_id).
**Факт:** Один сворачиваемый блок-накопитель + внутренний «Гость 5331» (не CV-13 format).
**Приоритет:** P1 для label `Гость 5331` (CV-13 violation), основная структура — CV-B1b батч.
**Batch:** Label fix в CV-B1-Polish; полная структура — CV-B1b (BACKLOG #327).
**Ref:** Скрины `52c19ad0`, `a9fb4c78`.

---

### CV-BUG-13 — Плюрализация: «17 блюда» вместо «17 блюд» (грамматика)
**Воспроизведение:** Header drawer → число N блюд → появляется «17 блюда» (неверная форма).
**Ожидалось:** Правильный plural: 1 блюдо / 2-4 блюда / 5+ блюд.
**Факт:** `pluralRules` не применён или применён неверно для числительных 11-19.
**Приоритет:** P2 — орфографическая ошибка, видна всем гостям.
**Batch:** CV-B1-Polish.
**Ref:** S282 discovery.

---

### CV-NEW-01 — «Заказано на стол» неверная сумма (287× или 0₸) (P0)
**Воспроизведение:** Таб «Стол» → header показывает «Заказано на стол: 24 268 ₸» при реальной сумме 84.86 ₸ (~287× множитель); в другом состоянии — «0 ₸» при активных заказах.
**Ожидалось:** Сумма header = сумма рендеримых заказов активного таба (архитектурное правило R2 из GPT UX S294).
**Факт:** Header sum берётся из отдельного агрегата (table summary service), а не из dataset активного таба → рассинхрон при polling.
**Приоритет:** P0 — ломает доверие гостя к ценам.
**Batch:** CV-B2 (header attribution fix).
**Ref:** Скрины `cv_s294_03_tab-stol-prinyato.jpg`, `cv_s294_04_tab-stol-v-rabote.jpg`. GPT UX S294 решение R2.

---

### CV-NEW-02 — Статус «Принято» виден гостю (нарушение CV-52) (P1)
**Воспроизведение:** Таб «Мои» → строка заказа → badge «Принято» (= accepted stage).
**Ожидалось (CV-52):** Гостю видны ТОЛЬКО 2 статуса: «В работе» / «Выдано». `accepted` должен маппиться в «В работе».
**Факт:** Статус `accepted` не замаппирован через stage-based rules, показывается raw.
**Приоритет:** P1 — нарушение FROZEN UX CV-52, путает гостей.
**Batch:** CV-B2.
**Ref:** Скрин `cv_s294_03_tab-stol-prinyato.jpg`. GPT UX S294 решение R1 (pending/accepted states).

---

### CV-NEW-03 — Свои заказы не видны в табе «Стол» (нет self-first, нарушение CV-16/17) (P1)
**Воспроизведение:** Таб «Стол» → заказы текущего гостя не отображаются / не выделены как первые.
**Ожидалось (CV-16/17):** Self-first: блок текущего гостя — первый, раскрытый. Остальные гости — свёрнутые карточки.
**Факт:** Заказы гостя либо скрыты, либо смешаны без приоритета.
**Приоритет:** P1 — гость не видит свои заказы в «Стол».
**Batch:** CV-B2.
**Ref:** Скрины `cv_s294_03_tab-stol-prinyato.jpg`, `cv_s294_04_tab-stol-v-rabote.jpg`.

---

### CV-NEW-04 — «Мои заказы» — outline кнопка вместо text-link (нарушение CV-71) (P2)
**Воспроизведение:** Таб «Мои» → внизу footer → кнопка «Мои заказы» outline style.
**Ожидалось (CV-71):** «Мои заказы» = tertiary text-link внутри контента, НЕ outline-кнопка.
**Факт:** Outline кнопка (CV-B1-Core регрессия или не применено CV-71 rule).
**Приоритет:** P2 — нарушение CV-71 (FROZEN UX), но не критично для функционала.
**Batch:** CV-B2.
**Ref:** Скрин `cv_s294_02_zakaz-prinyat.jpg`.

---

### ~~CV-BUG-18~~ — ✅ FIXED S497 (S496-v2 Variant B applied, commit `ce6afc2`)
**Status:** ✅ FIXED (visible симптом scenarios 1+2). Race condition в scenario 3 → отдельный CV-BUG-19.
**Original repro:** `mode=hall` → ввести верный код стола → код проверен успешно → CartView показывает красный блок «Ошибка отправки» / «Please try again» + красная кнопка «Повторить отправку».
**Saga (S495-cont/S496/S497):**
- **S496 attempt (Cowork-direct, FAILED):** single-line `setSubmitError(null)` в isTableVerified useEffect. Smoke FAIL, git revert `129d4c8`. VVV #125 (Cowork-direct без review для multi-state logic). Closed only 1 of 4 gates.
- **ССП+КП review (3 рецензента):** GO_WITH_CAVEATS, 4 gates identified — (a) `submitError` prop, (b) `submitPhase` local state, (c) x.jsx auto-submit race, (d) i18n RU dict missing.
- **S496-v2 Variant B (ССП Implementation, APPLIED commit `ce6afc2`):** dual-state reset (CartView submitError + submitPhase=idle, deps `[isTableVerified, setSubmitError]`) + x.jsx auto-submit gate `&& showTableConfirmSheet` + I18N_FALLBACKS_RU 2 keys + makeSafeT lang.toLowerCase normalization.
- **Smoke S497:** scenarios 1 (hall + correct code → no red block) ✅ + 2 (wrong → correct → no stale red block) ✅. RU текст корректен в error блоке.
- **Scenario 3 race → CV-BUG-19** (отдельный bug): auto-submit fires до загрузки tableSession → first try fails → retry CTA legitimately shown.
- **Smoke 4+5 pending — handoff to НС.**
**RELEASE:** `260502-00 CartView RELEASE.jsx` (1488 lines) + `260502-00 x RELEASE.jsx` (5398 lines).
**Cross-refs:** BACKLOG ~~#588~~ DONE, BACKLOG #589 (CV-BUG-19 race), [NS_588 review codex](computer://C:\Users\ASUS\Dev\Menu AI Cowork\menuapp-code-review\outputs\NS_588_CV_BUG_18_review_codex.md), commit `ce6afc2`, скрин original `pages/CartView/screenshots/current/CV-BUG-18-hall-mode-submit-error-S495.jpg`.

---

### ✅ CV-BUG-19 — Hall mode auto-submit race: tableSession async load vs 100мс auto-submit timer (S518 FIXED)
**Воспроизведение:** `mode=hall` → tap «Отправить» до verify (открывает табличный код sheet) → ввести верный код → 100мс delay → `processHallOrder` срабатывает но `tableSession` ещё не загружен → throws → catch ставит `submitError` → красная AC-08 retry CTA с RU текстом «Не удалось отправить / Попробуйте снова».
**Контекст:** Найден S497 smoke scenario 3 после S496-v2 deploy. Existing race КП identified в review §1: «`tableSession` typically hasn't loaded yet (the same component already has a 3 s `sessionCheckTimedOut` for that exact race), so `processHallOrder` throws and `setSubmitError(t('error.send.title'))` fires.»
**Root cause:** x.jsx:3386 useEffect setTimeout 100мс недостаточен для async tableSession load (~500мс-3с). Same component already has `sessionCheckTimedOut` 3s constant for this exact race, но auto-submit не использует.
**Workaround (UX):** гость может тапнуть «Повторить отправку» — должно сработать (tableSession загружен к этому моменту).
**Status:** ✅ FIXED S518 (commit `f537f2a`). Fix: extend auto-submit useEffect gate condition с `&& (tableSession?.id || sessionCheckTimedOut)` + add deps `tableSession?.id, sessionCheckTimedOut` per ССП-1 review proposal. PM-075 UX preserved (auto-submit fires когда session loads OR sessionCheckTimedOut истекает после 3s). Code: `pages/PublicMenu/x.jsx:3386-3407`. RELEASE: `260504-00 x RELEASE.jsx`. ССП review GO (Q1-Q6 4/5/4/5/5/5 avg 4.67), КП procedural NO_GO (shell timeout KB-176).
**Batch:** S518 (CV-BUG-19 + CV-BUG-20 saga).
**Ref:** S497 скрин Arman (hall mode, 3 блюда, Стол 22). Скрин: `pages/CartView/screenshots/current/CV-BUG-18-scenario-3-auto-submit-real-fail-S496-v2-smoke.jpg`. Cross-ref: ССП review NS_589_review_cc.md, КП review NS_589_review_codex.md, BACKLOG ~~#589~~ DONE.

---

### ✅ CV-BUG-20 — TableSession.create payload missing opened_at + expires_at fields → 4× HTTP 422 backend validation rejection (S518 FIXED)
**Воспроизведение (S518):** hall mode, **table verified successfully**, корзина с 2+ dishes, тап «Отправить официанту» → красный блок «Не удалось отправить» / «Попробуйте снова» + красная кнопка retry. DevTools Network: **4× HTTP 422** на `/api/apps/.../entities/TableSession`. Console: `Failed to load resource: 422 ()` × 4. Workaround нет — все 4 retry попытки fail с тем же 422.
**Root cause:** `components/sessionHelpers.js:200-205` `TableSession.create` payload missing `opened_at` + `expires_at` fields. Backend schema требует `opened_at` (read at sessionHelpers.js:352 `isSessionExpired` + sort key at useTableSession.jsx:318). Без него backend rejects payload с 422 validation error.
**4× 422 explained (ССП review):** 4 sequential user retry taps (1 initial submit + 3 «Повторить отправку» button presses), **NOT concurrent fan-out**. Verified через `submitLockRef` / `pendingSubmitRef` / polling-dormancy / StrictMode analysis.
**Regression history:**
- 2026-04-15 (S70-era) `260415-00 sessionHelpers RELEASE.js`: client-side `.create()` had `opened_at` + `expires_at` ✅ (baseline)
- 2026-04-29 (S451 RF-4): pivot to B44 Backend Function — server-side filled fields, client passed only IDs
- 2026-04-30 (S485 RF-4 Sub-1): Backend Functions blocked, rewrite client-side filter+create+verify, **fields NOT restored** (regression)
- 2026-05-01 commit `9751ed5` (RF-4 Sub-4): production deploy → 422 errors начались
- 2026-05-04 today: Arman hits the bug
**Status:** ✅ FIXED S518 (commit `0a95564`). Fix: literal restoration of 2 fields из S70-era baseline:
```javascript
opened_at: new Date().toISOString(),
expires_at: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(),
```
Net change: +2 lines additive внутри `getOrCreateSession` `TableSession.create()` payload block. RELEASE: `260504-00 sessionHelpers RELEASE.js`. ССП investigation ROOT_CAUSE_PROBABLE → ССП Implementer applied → КП Reviewer GO (Q1-Q6 5/5/5/5/4/5 avg 4.83). Smoke PASS.
**Backwards compat:** legacy TableSession rows без `opened_at` (создан между 9751ed5 и сейчас) НЕ broken — `new Date(undefined)` yields NaN, `hoursDiff = NaN`, `NaN > 8` = false, `isSessionExpired` returns false. Sort fallback to created_at. Pre-existing tolerance, не regression.
**Приоритет:** P1 — production blocker для всех hall-mode submits после verify (since 9751ed5 deploy).
**Batch:** S518 (CV-BUG-19 + CV-BUG-20 saga).
**Cross-refs:** [NS_589_CV_BUG_20_Investigation_Prompt.md](computer://C:\Users\ASUS\Dev\Menu AI Cowork\outputs\NS_589_CV_BUG_20_Investigation_Prompt.md), [NS_589_CV_BUG_20_Implementation_Prompt.md](computer://C:\Users\ASUS\Dev\Menu AI Cowork\outputs\NS_589_CV_BUG_20_Implementation_Prompt.md), [NS_589_CV_BUG_20_KP_Review_Prompt.md](computer://C:\Users\ASUS\Dev\Menu AI Cowork\outputs\NS_589_CV_BUG_20_KP_Review_Prompt.md), commit `0a95564`, BACKLOG ~~#589~~ DONE + #651 spawned (UX loader gap).
**Spawn UX follow-up:** BACKLOG #651 — loader during table verify→submit transition (P3 polish, ~30-45 мин, parallel-safe).

---

### ~~CV-BUG-14~~ — NOT A BUG (закрыт S303)
**Статус:** ✅ NOT A BUG — поведение корректное по дизайну.
**Логика форматирования цен (by design):** Количество знаков после запятой определяется ценой блюда в меню партнёра, а не валютой. Если блюдо стоит 80 ₸ → показываем «80 ₸». Если 80.50 ₸ → показываем «80.50 ₸». Это осознанное решение: цена отображается ровно так, как задал партнёр. Decimals=0 по умолчанию для KZT — неверное допущение.
**Почему закрыт:** S303 — Arman подтвердил: TEST_PLAN `formatPriceDisplay: decimals=0` — некорректная спека. Не чинить.

---

### CV-OBS-01 — Отсутствует primary CTA "Оценить и получить +N бонусов" (State C)
**Наблюдение (НЕ баг, not-implemented):** По UX-док (строка 85, State C) footer CTA должен быть primary "Оценить и получить X бонусов" при всё выдано + 0 оценено. Сейчас footer = "Заказать ещё" outline.
**Что имеется в виду "большая кнопка":** Это она — primary green CTA в footer для State C/C2.
**Статус:** Запланировано в Batch CV-B3 (rating flow full).
**Ref:** Скрин 00d19632 — footer "Заказать ещё" outline, а ожидается primary green CTA.

---

### ~~CV-BUG-15~~ ✅ DONE S511 (auto-resolved by CV-B2-B `a133651`, code verified) — «⏳ Ожидает» bucket никогда не появляется: status 'submitted' vs 'new' (P1)
**Воспроизведение:** Отправить заказ (State A2) → таб «Мои» → группа «⏳ Ожидает» не отображается.
**Ожидалось (State A2, mockup v11 S302, DECISIONS §1):** После отправки в «Мои» появляется amber-группа «⏳ Ожидает (N)» с подсказкой «ⓘ Ждём подтверждения ресторана».
**Факт:** `statusBuckets` useMemo проверяет `o.status === 'submitted'`, но B44 возвращает `status: 'new'` для только что созданного заказа. Условие `isPending` всегда `false` → bucket не заполняется → группа невидима.
**Строка кода:** RELEASE.jsx ~477: `const isPending = !stageInfo?.internal_code && (o.status || '').toLowerCase() === 'submitted';`
**Фикс:** заменить `=== 'submitted'` на `=== 'new'` (или `['new','submitted'].includes(...)` для совместимости).
**Приоритет:** P1 — ключевой UX-момент (State A2) полностью сломан.
**Batch:** CV-B3 (Ожидает batch).
**Ref:** S494 discovery, mockup v11 S302 State A2, DECISIONS_INDEX LOCKED.
**S511 verify:** Code at CartView.jsx:472 = `(o.status || '').toLowerCase() === 'new'` ✅ (committed `a133651` CV-B2-B batch). Comment label says "CV-BUG-16" but fix is for CV-BUG-15 (minor mislabel, no functional impact). **Smoke pending:** Arman test in prod (отправить заказ → bucket «⏳ Ожидает» visible).

---

### ~~CV-BUG-16~~ ✅ DONE S511 (auto-resolved by CV-B2-B `a133651`, code verified) — Неверный порядок bucket: «⏳ Ожидает» сверху вместо снизу (P2)
**Воспроизведение:** Даже если bucket получит данные — он рендерится ПЕРВЫМ (сверху).
**Ожидалось (DECISIONS_INDEX LOCKED, S302):** Порядок снизу вверх: Выдано (top, dimmed) → В работе → Ожидает (bottom, amber).
**Факт:** `bucketOrder = ['pending_unconfirmed', 'served', 'in_progress']` — Ожидает идёт первым.
**Строка кода:** RELEASE.jsx ~1094: `const bucketOrder = ['pending_unconfirmed', 'served', 'in_progress'];`
**Фикс:** `['served', 'in_progress', 'pending_unconfirmed']`
**Приоритет:** P2 — нарушение LOCKED layout-решения.
**Batch:** CV-B3 (Ожидает batch).
**Ref:** S494 discovery, DECISIONS_INDEX «Ожидает bucket СНИЗУ «Мои»».
**S511 verify:** Code at CartView.jsx:1259 = `const bucketOrder = ['served', 'in_progress', 'pending_unconfirmed'];` ✅ (committed `a133651` CV-B2-B batch + R1 LOCKED comment). **Smoke pending:** Arman test in prod (Ожидает в самом низу).

---

### ~~CV-BUG-17~~ ✅ DONE S498 (CV-B3 v2 deploy 260503-00, code verified S511) — Отсутствует hint «ⓘ Ждём подтверждения ресторана» под bucket «Ожидает» (P2)
**Воспроизведение:** State A2 → группа «⏳ Ожидает» (если будет видна) — без подсказки.
**Ожидалось (mockup v11 S302 State A2, строки 415-417):** Под шапкой bucket «⏳ Ожидает» — серая italic-строка «ⓘ Ждём подтверждения ресторана».
**Факт:** В коде отсутствует hint-элемент для `pending_unconfirmed` bucket. Рендерится стандартный bucket без дополнительного текста.
**Строка кода:** RELEASE.jsx ~1102-1160 (normal bucket render) — нет ветки для pending hint.
**Фикс:** добавить после шапки `pending_unconfirmed` bucket JSX-элемент с hint-текстом.
**Приоритет:** P2 — UX-уточнение, важно для State A2 сценария.
**Batch:** CV-B3 (Ожидает batch).
**Ref:** S494 discovery, mockup v11 S302 State A2 lines ~415-417.
**S511 verify:** Code at CartView.jsx:1321-1326 = JSX block with marker `CV-BUG-17 (S498, #587)` + hint text `ⓘ {tr('cart.pending.hint', 'Ждём подтверждения ресторана')}` rendered when `key === 'pending_unconfirmed'` ✅. Working copy uncommitted (paired deploy 260503-00 без commit per S498 — chain-lock guard active). **Smoke pending:** Arman test in prod (отправить заказ → bucket «⏳ Ожидает» → hint видна).

---

## 🟡 UX-вопросы (закрыты S271 GPT v7 → UX v7.0 FROZEN)

### ✅ CV-Q-01 — CLOSED (S271)
Решено через **CV-71**: success-экран = ровно одна primary sticky CTA «Вернуться в меню» внизу drawer (safe-area-aware, тонкий divider), «Мои заказы» = tertiary text-link внутри контента (не outline-кнопка).

### ✅ CV-Q-02 — CLOSED (S271)
Решено через **CV-70** (supersedes CV-11/CV-12): унифицированное CTA правило по 3 состояниям, всегда primary filled. Пустая корзина + active/delivered → primary «Вернуться в меню» (не «Заказать ещё» outline). Лейбл «Заказать ещё» удалён из UI.

### ✅ CV-Q-03 — CLOSED (S271)
Решено через **CV-72 + CV-73**: auto-scroll к заголовку «В корзине» jump (не smooth) только при add_to_cart_auto_open + pulse новой строки 0.8–1.2с. Секция «В работе» НЕ схлопывается (риск «блюда пропали»).

### ⏸ CV-Q-04 — LOCKED до батча CV-B1
Решение зафиксировано в **CV-14** (табы Мои/Стол). Детали поведения табов (пустой таб, активный indicator, badge) будут проработаны непосредственно перед КС батчем CV-B1.

### ✅ CV-Q-05 — CLOSED (S271)
Решено через **CV-74**: 4-state session restore model (S-loading / S-restored / S-failed-network / S-lost). Разделение network fail и lost session — ключевое уточнение GPT. Плюс **CV-75** (kill-during-submit banner).

---

## 📋 Не реализовано (Batch CV-B)

### CV-TODO-01 — Rating flow (States C, C2, C3, D)
Всё что связано с оценкой блюд после выдачи. Планируется в Batch CV-B.
- State C: всё выдано, 0 оценено — chip "Оценить (N)", бонусная subline
- State C2: частично оценено — chip "Оценено M из N", CTA "Продолжить оценку"
- State C3: все оценены — "Оценено N из N · +X бонусов начислено"
- State D: режим оценки — inline звёзды, autosave per row, CTA "Готово"
- Email bottom sheet после завершения оценки (CV-38)
- Ref: CV-36 — CV-42, CV-58, CV-59, CV-60

### CV-TODO-02 — Таб "Стол" (State T)
Сейчас "Заказы стола" = collapsible секция внутри drawer. По UX — должен быть отдельный таб "Стол".
- 2 таба: "Мои" и "Стол" (CV-14)
- Таб "Стол" скрыт при 1 госте (CV-15)
- Группировка по гостям, self-first (CV-16, CV-17)
- "Попросить счёт" + дедупликация (CV-21)
- Хронологическая сортировка (CV-57)
- Ref: CV-14 — CV-22, CV-53 — CV-57
