---
version: "15.0"
updated: "2026-03-05"
session: 82
---

# PublicMenu — Bug Registry

Регистр всех известных багов страницы публичного меню (x.jsx + useTableSession.jsx).
Цель: не терять контекст, быстро чинить повторные баги, не допускать регрессий.

---

## Active Bugs (не исправлены)

### BUG-PM-028: Table code input shows 5 boxes for 4-digit codes (S81-02, P0) — FIXED S82
- **Когда:** S81 testing
- **Файл:** `CartView.jsx` — tableCodeLength useMemo
- **Симптом:** OTP input renders 5 boxes but real codes are 4 digits. Auto-verify fires only when `safe.length === tableCodeLength`. User enters 4 digits → 5th box empty → auto-verify never fires → `isTableVerified` stays false → submit button disabled → "Стол —" no number → order blocked.
- **Root cause:** `tableCodeLength` default was `5` when `partner?.table_code_length` is not set.
- **Фикс:** Changed default from `5` to `4` in CartView.jsx (line 136).
- **RELEASE:** `260305-03 CartView RELEASE.jsx`
- **Коммит:** `e9050d3`

### BUG-PM-029: No visible feedback after Hall order sent (S81-17, P1) — FIXED S82
- **Когда:** S81 testing
- **Файл:** `x.jsx` — processHallOrder()
- **Симптом:** (a) Toast "Заказ отправлен официанту" appeared for only 2 seconds — too short, users missed it; (b) On order failure, `setSubmitError` was called but `submitError` renders only in `CheckoutView` (not in drawer) → failure invisible to Hall user.
- **Root cause:** Toast duration was 2000ms; generic catch only used `setSubmitError`, not `toast.error`.
- **Фикс:** (a) Extended toast duration 2000→4000ms. (b) Added `toast.error(t('error.submit_failed'), ...)` in catch block alongside `setSubmitError`.
- **RELEASE:** `260305-04 x RELEASE.jsx`
- **Коммит:** `e9050d3`

### BUG-PM-026: Drawer pull-down swipe doesn't close drawer (S81-01, P1) — FIXED S82
- **Когда:** S81 testing
- **Файл:** `x.jsx` — Drawer component
- **Симптом:** Swipe down on drag handle did not close or collapse the drawer
- **Root cause:** `setActiveSnapPoint` prop was wired to `setDrawerSnapPoint` directly. When vaul calls `setActiveSnapPoint(null)` to signal close (user dragged below lowest snap), `setDrawerMode(null)` was never called — drawer stayed open.
- **Фикс:** Replaced `setActiveSnapPoint={setDrawerSnapPoint}` with an inline handler: `if (sp === null) setDrawerMode(null); else setDrawerSnapPoint(sp);`
- **RELEASE:** `260305-04 x RELEASE.jsx`

### BUG-PM-027: CTA button hidden at default drawer height (S81-03, P1) — FIXED S82
- **Когда:** S81 testing
- **Файл:** `x.jsx` — drawer snap point logic
- **Симптом:** Drawer opens at SNAP_MID=60% by default. The «Отправить официанту» button lives in CartView sticky footer at bottom of full-height (90vh) content, so it is outside the visible 60% area. User must manually drag drawer up to see it.
- **Root cause:** `useEffect` auto-grow only expanded to SNAP_FULL when `cart.length > 4`. With 1-4 items, drawer stayed at SNAP_MID and CTA was invisible.
- **Фикс:** Changed condition to `cart.length > 0`: drawer auto-expands to SNAP_FULL whenever cart has any items (mode 'order'). SNAP_MID kept for empty cart (receipt mode — no CTA needed).
- **RELEASE:** `260305-04 x RELEASE.jsx`

### BUG-PM-023: reviewedItems.has() without null guard (P0, pre-existing)
- **Когда:** S79 review (pre-existing from S74)
- **Файл:** CartView.jsx, Mode 2 order render
- **Симптом:** If `reviewedItems` prop is undefined, calling `.has()` crashes the render
- **Фикс:** Add `safeReviewedItems` default in safe prop defaults block

### BUG-PM-024: loyaltyAccount.balance without null guard (P0, pre-existing)
- **Когда:** S79 review (pre-existing from S74)
- **Файл:** CartView.jsx, loyalty section
- **Симптом:** If `loyaltyAccount.balance` is undefined/null, `.toLocaleString()` crashes
- **Фикс:** Wrap with `Number(loyaltyAccount.balance || 0)`

### BUG-PM-025: draftRatings prop without null guard (P1, pre-existing)
- **Когда:** S79 review (pre-existing from S74)
- **Файл:** CartView.jsx, Mode 2 order render
- **Симптом:** If `draftRatings` is undefined, accessing `draftRatings[itemId]` crashes
- **Фикс:** Add `safeDraftRatings` default in safe prop defaults block

---

## Fixed Bugs (исправлены)

### BUG-PM-018: Confirmation screen shows "Заказ принят!" before waiter accepts (P0)
- **Приоритет:** P0 (wrong semantics breaks user trust)
- **Когда:** Session 74 (CC+GPT UX analysis)
- **Симптом:** After tapping "Отправить официанту", guest sees "Заказ принят!" — implies the waiter already accepted, which is false. The order was only sent.
- **Фикс:** Confirmation title now uses mode-dependent text: hall → "Заказ отправлен официанту", pickup/delivery → "Заказ отправлен". Added subtext: "Статус обновится, когда официант примет заказ". New `tr()` helper added to `OrderConfirmationScreen` for safe fallbacks.
- **Файл:** `x.jsx` (OrderConfirmationScreen)
- **RELEASE:** `260304-00 x RELEASE.jsx`

### BUG-PM-019: No visual status differentiation in guest "Мои заказы" (P1)
- **Приоритет:** P1
- **Когда:** Session 74
- **Симптом:** All orders showed generic blue badge without icon. Guest couldn't distinguish sent/accepted/cooking/ready status.
- **Фикс:** Enhanced `getSafeStatus()` with full STATUS_MAP: 🟡 Отправлен (new), 🟢 Принят (accepted), 🔵 Готовится (cooking), ✅ Готов (ready). Badge now shows `{icon} {label}` instead of just `{label}`.
- **Файл:** `CartView.jsx`
- **RELEASE:** `260304-00 CartView RELEASE.jsx`

### BUG-PM-020: Session ID "#1313" shown to guest in drawer header (P2)
- **Приоритет:** P2
- **Когда:** Session 74
- **Симптом:** Guest sees "Вы: Гость 2 #1313" — the `#1313` is a meaningless session code from localStorage.
- **Фикс:** `guestDisplay` now uses only `guestBaseName` (name or "Гость N"). Session code logged to `console.debug` for debugging only.
- **Файл:** `CartView.jsx`
- **RELEASE:** `260304-00 CartView RELEASE.jsx`

### BUG-PM-021: Rating banner shows before any order is ready (P1)
- **Приоритет:** P1
- **Когда:** Session 74
- **Симптом:** "За отзыв +10 баллов" banner appears immediately when drawer opens, even if no order has been delivered. Premature and confusing.
- **Фикс:** `shouldShowReviewRewardHint` now checks `hasReadyOrders` (at least one order with finish/ready/done/served status) AND `reviewableItems.length > 0`. Inline confirmation "Спасибо! +NБ" next to stars replaces generic "✓" checkmark when loyalty is active.
- **Файл:** `CartView.jsx`
- **RELEASE:** `260304-00 CartView RELEASE.jsx`

### BUG-PM-022: Drawer opens at wrong height — header not visible (P0)
- **Приоритет:** P0
- **Когда:** Session 74
- **Симптом:** Cart drawer opens at wrong snap position — only bottom portion visible, header "Стол / Гость / ✕" is offscreen.
- **Фикс:** Added `snapPoints={[0.85]}` to Drawer component to force 85% viewport height. Added `paddingBottom: env(safe-area-inset-bottom)` for mobile safe area support.
- **Файл:** `x.jsx`
- **RELEASE:** `260304-00 x RELEASE.jsx`

### BUG-PM-013: track_order button shows dish popup instead of OrderStatusScreen (GAP-02) (P1)
- **Приоритет:** P1
- **Когда:** Session 71 (найден Arman при тестировании 260303-03)
- **Симптом:** Clicking "Track Order" on OrderConfirmationScreen briefly shows a "Стейк" product popup, then returns to menu. OrderStatusScreen never appears.
- **Root cause:** `CONFIRMATION_AUTO_DISMISS_MS = 10000` (10s timer). The auto-dismiss fires `setView("menu")` + `setConfirmationData(null)`, removing the full-screen confirmation overlay. A pending touch/click event from the user then falls through to the menu grid underneath, hitting a dish card (Стейк) which opens `DishReviewsModal`. This is a ghost-click race condition on mobile.
- **Фикс:** Removed auto-dismiss timer entirely. The confirmation screen has 3 explicit navigation buttons (back to menu, my orders, track order) — auto-dismiss is unnecessary and harmful. Removed `CONFIRMATION_AUTO_DISMISS_MS` constant, `confirmationTimerRef` ref, all timer setup/cleanup code.
- **Файл:** `x.jsx` (PublicMenu main page)
- **RELEASE:** `260303-04 x RELEASE.jsx`

### BUG-PM-012: /orderstatus returns 404 — B44 routing doesn't register page (GAP-02) (P1)
- **Приоритет:** P1
- **Когда:** Session 71 (найден при деплое GAP-02)
- **Root cause:** B44 platform routing is managed internally — simply adding a `pages/orderstatus.jsx` file and updating `PUBLIC_ROUTES` in Layout.js does not register a route. The SPA route `/orderstatus` returned "Page Not Found". The `track_order` button in `OrderConfirmationScreen` used `window.location.href = '/orderstatus?token=...'` which triggered a full page navigation to a non-existent route.
- **Фикс:** Embedded `OrderStatusScreen` as a view state inside `x.jsx` (like `OrderConfirmationScreen`). View state expanded to `menu|checkout|confirmation|orderstatus`. Button now sets `setView("orderstatus")` instead of navigating. Sub-reviewer fixes: P0 timer leak after terminal, P1 token regex widened, P1 token generator fixed (substring(2,10)), P1 staleTime added, P1 pollTimerRef→closure, P1 orderStatusToken cleared in dismissConfirmation.
- **Файл:** `x.jsx` (PublicMenu main page)
- **Коммит:** `f080b62`
- **RELEASE:** `260303-03 x RELEASE.jsx`

### BUG-PM-011: Active tables expired based on opened_at alone — activity guard missing (P0)
- **Приоритет:** P0
- **Когда:** Session 68 (найден при анализе P0-1 перед деплоем)
- **Root cause:** `isSessionExpired()` in `sessionHelpers.js` checks only `opened_at`. A table open 8+ hours with recent orders (e.g., `last_activity_at` updated 1 hour ago) would be incorrectly expired. The cleanup logic in STEP 1 and STEP 2 of `restoreSession()` would close an active table and cancel orders.
- **Фикс:** Added `hasRecentActivity(session)` helper that checks `last_activity_at || updated_at || opened_at`. Both `isSessionExpired` call sites now use combined condition: `isSessionExpired(s) && !hasRecentActivity(s)` — session is expired only if BOTH old `opened_at` AND no recent activity.
- **Файл:** `useTableSession.jsx` (lines 11-18, 293, 332)
- **RELEASE:** `260302-06 useTableSession RELEASE.jsx`

### BUG-PM-009: Expired sessions reused — old orders leak into new visits (P0-1)
- **Приоритет:** P0
- **Когда:** Session 65 (найден Arman), Session 66 (исправлен)
- **Root cause:** `useTableSession.restoreSession()` called `isSessionExpired()` to skip expired sessions, but never closed them in DB. Old sessions stayed `status: 'open'` forever. When a new guest scanned QR, `getOrCreateSession` found the old open session and reused it — new guest saw all historical orders.
- **Фикс:** Added `closeExpiredSessionInDB()` helper: closes session (`status: expired`) + cancels unprocessed orders (`new` → `cancelled`). Called in STEP 1 (saved session) and STEP 2 (DB query) of `restoreSession()`.
- **Файл:** `useTableSession.jsx`
- **RELEASE:** `260302-00 useTableSession RELEASE.jsx`

### BUG-PM-010: Order created without valid table_session (P0-2)
- **Приоритет:** P0
- **Когда:** Session 65 (диагноз), Session 66 (исправлен)
- **Root cause:** `processHallOrder()` used `tableSession?.id || null` for `table_session` field. If session was expired or missing, order was created with `table_session: null`. This broke session-based filtering — the order was invisible to the current session or leaked into all views.
- **Фикс:** `handleSubmitOrder` now validates session before proceeding: if expired → close in DB + create new. Hard guard rejects if no valid session. `processHallOrder` receives `validatedSession` parameter (no stale closure).
- **Файл:** `x.jsx` (PublicMenu main page)
- **RELEASE:** `260302-00 x RELEASE.txt`

### BUG-PM-006: Drawer после подтверждения стола открывается проскроллленным вниз
- **Приоритет:** P1
- **Когда:** Session 29 (найден Arman)
- **Root cause:** При вводе кода стола в нижней части CartView и успешном подтверждении, drawer оставался проскроллленным вниз. Scroll position не сбрасывался.
- **Фикс:** `prevTableVerifiedRef` отслеживает переход `false→true`. При переходе — находим ближайший scrollable ancestor и scrollTo({ top: 0 }).
- **Файл:** `CartView.jsx`
- **Коммиты:** `d7db09b`, `6c7e21c` (review fix: scrollable ancestor вместо scrollIntoView)
- **RELEASE:** `260224-01 CartView RELEASE.jsx`
- **Ревью:** Correctness ✅ (scroll target issue → fixed), Style ✅

### BUG-PM-007: UX — «✅ Стол подтверждён» дублирует шапку
- **Приоритет:** P2
- **Когда:** Session 29 (найден Arman)
- **Root cause:** Жёлтый блок показывал «✅ Стол подтверждён» после подтверждения, но номер стола уже в шапке drawer.
- **Фикс:** `hasOnlineBenefits` + `shouldShowOnlineOrderBlock` — жёлтый блок скрыт если стол подтверждён И нет бенефитов. Если есть бенефиты — показываются только они. Текст «✅ Стол подтверждён» и код ввода полностью убраны при isTableVerified.
- **Файл:** `CartView.jsx`
- **Коммит:** `7e546f8`
- **RELEASE:** `260224-01 CartView RELEASE.jsx`

### BUG-PM-008: UX — ⓘ иконка в заголовке жёлтого блока слишком мала для мобильного
- **Приоритет:** P2
- **Когда:** Session 29 (анализ GPT по Apple HIG / Material Design)
- **Root cause:** Кнопка ⓘ (text-sm px-2) не соответствовала Apple HIG 44×44px. Две маленькие интерактивные иконки рядом в мобильном заголовке.
- **Фикс:** Заменены обе ⓘ кнопки на full-width Button + Info icon (lucide-react) с h-11 (44px). Две отдельные кнопки: «Как работает онлайн-заказ» (всегда в блоке) и «Где найти код стола» (только до подтверждения).
- **Файл:** `CartView.jsx`
- **Коммит:** `7e546f8`
- **RELEASE:** `260224-01 CartView RELEASE.jsx`

### BUG-PM-001: Белый экран после заказа в зале
- **Приоритет:** P0
- **Когда:** Session 27
- **Root cause:** `processHallOrder()` вызывал `setView("cart")`, но view="cart" не имеет JSX-рендера — только "menu" и "checkout" отрисовываются → белый экран.
- **Фикс:** `setView("cart")` → `setView("menu")`
- **Файл:** `PublicMenu_BASE.txt` (processHallOrder)
- **Коммит:** `2872bbf`
- **RELEASE:** `260223-00 x RELEASE.txt`
- **Ревью-заметка:** Correctness-reviewer нашёл что `setDrawerMode(null)` не вызывается → drawer остаётся открытым. Решение: это by design (показать "Ваши заказы").
- **Возможная регрессия:** → BUG-PM-004

### BUG-PM-002: Резкий переход экрана после заказа (Pickup/Delivery)
- **Приоритет:** P1
- **Когда:** Session 27
- **Root cause:** `handleSubmitOrder()` сразу вызывал `setView("menu")` + `setDrawerMode(null)` — экран менялся до того как пользователь увидел toast "Заказ отправлен".
- **Фикс:** Toast показывается сразу, `setView("menu")` + `setDrawerMode(null)` отложены на 300мс через `setTimeout` с cleanup через `viewTransitionTimerRef`.
- **Файл:** `PublicMenu_BASE.txt` (handleSubmitOrder)
- **Коммит:** `dbf1785` + `8c03690`
- **RELEASE:** `260223-00 x RELEASE.txt`

### BUG-PM-004: Polling стирает optimistic updates (Hall mode)
- **Приоритет:** P0
- **Когда:** Session 29
- **Root cause:** Polling в `useTableSession.jsx` (строки 540-542) полностью заменял `sessionOrders` через `setSessionOrders(orders || [])`. Optimistic order из `processHallOrder()` стирался через ~10 сек.
- **Фикс:** Merge-стратегия: polling теперь сравнивает серверные данные с локальными. Optimistic записи (с `_optimisticAt`) сохраняются до 30 сек (OPTIMISTIC_TTL_MS) или пока сервер не подтвердит. Dedup по ID предотвращает дубли.
- **Файлы:** `useTableSession.jsx` (polling merge), `PublicMenu_BASE.txt` (`_optimisticAt` в processHallOrder)
- **Коммиты:** `f5eb015` + `1c4aac5` (reviewer fixes)
- **RELEASE:** `260224-00 x RELEASE.txt`, `260224-00 useTableSession RELEASE.jsx`
- **Ревью:** Correctness ✅, Style ✅, Codex (partial) ✅

### BUG-PM-005: Корзина пропадает после F5
- **Приоритет:** P1
- **Когда:** Session 29
- **Root cause:** `cart` хранился как `useState([])` без персистенции. F5 сбрасывал React state.
- **Фикс:** localStorage с форматом `{items, ts}` и TTL 4ч. Guard через `cartRestoredRef` предотвращает race condition (save до restore). Legacy формат (plain array) мигрируется на чтении.
- **Файл:** `PublicMenu_BASE.txt`
- **Коммиты:** `f5eb015` + `1c4aac5`
- **RELEASE:** `260224-00 x RELEASE.txt`
- **Ревью:** Correctness ✅, Style ✅

### BUG-PM-003: Пустой drawer после F5 в зале
- **Приоритет:** P1
- **Когда:** Session 27
- **Root cause:** После F5 `isTableVerified` = true (из localStorage), но `myOrders`/`sessionOrders` грузятся асинхронно. Кнопка открывала пустой CartView до загрузки данных.
- **Фикс:** Флаг `isSessionLoading` (isTableVerified && !tableSession) + 3с таймаут `sessionCheckTimedOut`. Кнопка показывает "Загрузка..." и блокирует drawer.
- **Файл:** `PublicMenu_BASE.txt`
- **Коммит:** `c096ccb` + `8c03690`
- **RELEASE:** `260223-00 x RELEASE.txt`
- **Связано с:** BUG-PM-005 (корзина тоже пропадает при F5, но другая проблема — cart vs session)

---

## Notes

- **Формат ID:** BUG-PM-NNN (PM = PublicMenu)
- **Приоритеты:** P0 = блокирует использование, P1 = серьёзный, P2 = косметический
- **Review issues** (стиль, i18n, console.log) хранятся в `review_*.md`, не здесь
- При создании RELEASE — проверять что все Active Bugs закрыты или задокументированы
- **Для каждого бага обязательно:** root cause (код, строки), фикс (что изменили), коммит, RELEASE
