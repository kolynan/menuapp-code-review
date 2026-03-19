---
version: "23.0"
updated: "2026-03-20"
session: 148
---

# PublicMenu — Bug Registry

Регистр всех известных багов страницы публичного меню (x.jsx + useTableSession.jsx).
Цель: не терять контекст, быстро чинить повторные баги, не допускать регрессий.

---

## Active Bugs (не исправлены)

*14 active bugs from S116 + 8 new bugs found in S119 CC review (2x P0, 1x P1, 4x P2, 1x P3).*

### BUG-PM-026: tableCodeLength default regressed to 5 (P1)
- **Приоритет:** P1
- **Когда:** S116 (Codex review)
- **Файл:** CartView.jsx:101
- **Симптом:** Default table code length is 5, but BUG-PM-S81-02 fixed it to 4. With partner config unset, guests enter wrong number of digits.
- **Фикс:** Change fallback from `return 5` to `return 4`.
- **Регрессия:** BUG-PM-S81-02

### BUG-PM-027: Loyalty/discount UI hidden for normal checkout (P1)
- **Приоритет:** P1
- **Когда:** S116 (Codex review)
- **Файл:** CartView.jsx:859, x.jsx:1937,3295
- **Симптом:** Loyalty section gated on `showLoginPromptAfterRating` instead of `showLoyaltySection`. Email entry, balance display, and point redemption unavailable until after a dish rating exists (never for fresh cart).
- **Фикс:** Use `showLoyaltySection` for checkout loyalty; keep `showLoginPromptAfterRating` only for review nudge.

### BUG-PM-028: Failed star-rating saves leave dishes permanently locked (P1)
- **Приоритет:** P1
- **Когда:** S116 (Codex review)
- **Файл:** CartView.jsx:705,720,725; x.jsx:2039
- **Симптом:** Item marked read-only when draftRating > 0, but async save can fail. Nothing clears the draft on failure, so user cannot retry.
- **Фикс:** Roll back draft rating on failure, or only lock from confirmed `reviewedItems`.

### BUG-PM-029: Table-code auto-verify cannot retry same code after failure (P1)
- **Приоритет:** P1
- **Когда:** S116 (Codex review)
- **Файл:** CartView.jsx:174,184
- **Симптом:** `lastSentVerifyCodeRef` never cleared on error or after cooldown unlock. Transient API failure forces guest to change digits to retry.
- **Фикс:** Clear `lastSentVerifyCodeRef` on failed verification, on unlock, and when input becomes incomplete.

### BUG-PM-030: Review-reward banner shows before any dish is reviewable (P1)
- **Приоритет:** P1
- **Когда:** S116 (Codex review)
- **Файл:** CartView.jsx:386
- **Симптом:** "За отзыв +N" hint shows when `myOrders.length > 0` regardless of order status. Guests see reward prompt before anything is ready/served.
- **Фикс:** Gate banner on ready/served statuses + `reviewableItems.length > 0`.
- **Регрессия:** BUG-PM-021


### BUG-PM-032: Order-status differentiation regressed (P2)
- **Приоритет:** P2
- **Когда:** S116 (Codex review)
- **Файл:** CartView.jsx:240
- **Симптом:** `getSafeStatus()` missing `accepted` fallback. Render paths ignore `status.icon`. Sent/accepted/cooking/ready collapse into near-identical text.
- **Фикс:** Add `accepted` to fallback map. Render `{icon} {label}` in all badge locations.
- **Регрессия:** BUG-PM-019

### BUG-PM-033: Scroll position not reset after table verification (P2)
- **Приоритет:** P2
- **Когда:** S116 (Codex review)
- **Файл:** CartView.jsx:136
- **Симптом:** `isTableVerified` effect only resets attempt counters, scroll-to-top fix is gone. Drawer stays stranded at bottom after code entry.
- **Фикс:** Restore scroll reset using `prevTableVerifiedRef` and nearest scrollable ancestor.
- **Регрессия:** BUG-PM-S81-03

### BUG-PM-034-R: Guest code leaked back into drawer header (P2)
- **Приоритет:** P2
- **Когда:** S116 (Codex review)
- **Файл:** CartView.jsx:274,281
- **Симптом:** `#guestCode` appended to "Вы:" label, exposing internal identifier even when `hallGuestCodeEnabled` is off.
- **Фикс:** Show code only in dedicated waiter-code block.
- **Регрессия:** BUG-PM-020

### BUG-PM-035: Verified-table block regresses mobile UX (P2)
- **Приоритет:** P2
- **Когда:** S116 (Codex review)
- **Файл:** CartView.jsx:1046,1007,1056
- **Симптом:** Duplicate "Стол подтвержден" header after verification. Info buttons are tiny icon-only touch targets (< 44px).
- **Фикс:** Restore `shouldShowOnlineOrderBlock` logic. Replace icon-only info controls with 44px labeled buttons.
- **Регрессия:** BUG-PM-008, BUG-PM-S81-07

### BUG-PM-036: Loyalty amounts bypass app localization (P2)
- **Приоритет:** P2
- **Когда:** S116 (Codex review)
- **Файл:** CartView.jsx:398,922,925
- **Симптом:** Hard-coded `toLocaleString('ru-RU')` and `₸` instead of `formatPrice`. Wrong currency/locale for non-Russian/non-tenge partners.
- **Фикс:** Use same formatter/locale as rest of page.

### BUG-PM-037: Reward email flow reports success without validation (P2)
- **Приоритет:** P2
- **Когда:** S116 (Codex review)
- **Файл:** CartView.jsx:514,520
- **Симптом:** Accepts any non-empty string, toasts "Email saved!" immediately. Invalid email or failed loyalty lookup still shows success.
- **Фикс:** Validate email format, await persistence result, show error if failed.

### BUG-PM-038: Submit-error copy says "order saved" when it may not be (P2)
- **Приоритет:** P2
- **Когда:** S116 (Codex review)
- **Файл:** CartView.jsx:1216, x.jsx:2591,2919
- **Симптом:** Error subtitle always says "Ваш заказ сохранен. Попробуйте снова" but submit may have failed completely. Misleads guest.
- **Фикс:** Use neutral retry text, or pass explicit error type.

### BUG-PM-039: 8-digit table codes overflow narrow phones (P2)
- **Приоритет:** P2
- **Когда:** S116 (Codex review)
- **Файл:** CartView.jsx:100,1074
- **Симптом:** Config allows up to 8 slots, but fixed `w-9` boxes + `gap-2` exceeds 320px viewport.
- **Фикс:** Make slot width/gap responsive, or switch to single-input layout for longer codes.

### BUG-PM-040: Loyalty points debited before order creation — no rollback on failure (P0)
- **Приоритет:** P0
- **Когда:** S119 (CC review)
- **Файл:** x.jsx:2443-2455, x.jsx:2817-2829
- **Симптом:** In both `processHallOrder` and pickup/delivery flow, `LoyaltyTransaction` (redeem) and `LoyaltyAccount.update` (balance decrement) execute BEFORE `Order.create`. If order creation throws, points are permanently lost — catch block only sets `submitError`, never re-credits.
- **Фикс:** Move points deduction to after `Order.create` succeeds, or add compensating re-credit in catch block.

### BUG-PM-041: Polling timer leak in useTableSession after cleanup (P0)
- **Приоритет:** P0
- **Когда:** S119 (CC review)
- **Файл:** useTableSession.jsx:670-685
- **Симптом:** `scheduleNext()` creates recursive `setTimeout` chain. Cleanup sets `cancelled=true` and `clearTimeout(intervalId)`, but if `pollSessionData()` is mid-execution during cleanup, `scheduleNext` inside the callback fires, registering a new timeout the cleanup can't clear. Orphaned polling causes spurious state updates on stale components.
- **Фикс:** Guard `scheduleNext` with `if (cancelled) return` before scheduling next poll.

### BUG-PM-042: isBillOnCooldown crashes in restricted environments (P1)
- **Приоритет:** P1
- **Когда:** S119 (CC review)
- **Файл:** x.jsx:283-288
- **Симптом:** `isBillOnCooldown()` calls `localStorage.getItem()` without try/catch. In private/incognito mode or strict security policies, `localStorage` access can throw. Called inside `useEffect` at x.jsx:2256 — unhandled exception crashes the component.
- **Фикс:** Add try/catch with `return false` fallback inside `isBillOnCooldown`.

### BUG-PM-043: formatOrderTime and OrderStatusScreen.formatPrice hardcode ru-RU locale (P2)
- **Приоритет:** P2
- **Когда:** S119 (CC review)
- **Файл:** x.jsx:973, x.jsx:1206
- **Симптом:** `formatOrderTime` uses `d.toLocaleTimeString("ru-RU", ...)` and `OrderStatusScreen.formatPrice` uses `num.toLocaleString("ru-RU")`, ignoring active `lang` state. Wrong locale for non-Russian partners.
- **Фикс:** Pass `lang` or the parent's `formatPrice` as prop to `OrderStatusScreen`. Make `formatOrderTime` locale-aware.
- **Связано:** BUG-PM-036 (same pattern in CartView)

### BUG-PM-044: loyalty_redeem_rate falsy-coalescing shows wrong monetary value (P2)
- **Приоритет:** P2
- **Когда:** S119 (CC review)
- **Файл:** CartView.jsx:925
- **Симптом:** `(partner?.loyalty_redeem_rate || 1)` treats rate of `0` as falsy, falls back to `1`. Partner with explicit `loyalty_redeem_rate = 0` shows inflated value to guests.
- **Фикс:** Use `??` (nullish coalescing) instead of `||`: `(partner?.loyalty_redeem_rate ?? 1)`.

### BUG-PM-045: console.log left in production order submission paths (P2)
- **Приоритет:** P2
- **Когда:** S119 (CC review)
- **Файл:** x.jsx:2589, x.jsx:2917
- **Симптом:** Two `console.log("Order created", order?.id)` calls remain in successful order submission paths (hall and pickup/delivery). Minor information leak, violates no-debug-log rule.
- **Фикс:** Remove both `console.log` calls.

### BUG-PM-046: Redirect banner setTimeout not cleaned up on unmount (P2)
- **Приоритет:** P2
- **Когда:** S119 (CC review)
- **Файл:** x.jsx:1871
- **Симптом:** `setTimeout(() => setRedirectBanner(null), 5000)` inside `useEffect` with no cleanup. If component unmounts or deps change within 5s, the stale timer fires `setRedirectBanner(null)` on an unmounted component — React dev warning.
- **Фикс:** Store timer ID and return cleanup function, same pattern as `viewTransitionTimerRef`.

### BUG-PM-047: Multiple interactive elements missing aria-label (P3)
- **Приоритет:** P3
- **Когда:** S119 (CC review)
- **Файл:** CartView.jsx:424,449-450,1011,1060; MenuView.jsx:104,111,117
- **Симптом:** Icon-only buttons (call-waiter bell, name editor ✓/✕, info ⓘ buttons, list-mode add/stepper buttons) use `title` instead of `aria-label` or have no accessible label at all. Screen readers and mobile VoiceOver can't announce button purpose.
- **Фикс:** Add `aria-label` to all icon-only interactive elements. List-mode buttons should match tile-mode which already has proper labels.

---

## Fixed Bugs (исправлены)

### BUG-PM-031: Cart can still be closed during order submission (P0) — FIXED S148
- **Когда:** S116 (Codex review), fixed S148 via consensus chain publicmenu-260320-004325
- **Файл:** CartView.jsx:464, x.jsx:3268-3270, x.jsx:3432
- **Симптом:** Close button active while `isSubmitting`. Drawer swipe/overlay/Escape close unconditionally. StickyCartBar toggle can close. User loses submission feedback, risk of duplicate orders.
- **Фикс:** 5 changes: (1) `dismissible={!isSubmitting}` on Drawer, (2) `onOpenChange` guard, (3) close button `isSubmitting` guard + disabled + visual state, (4) StickyCartBar toggle guard, (5) visual disabled styling.

### BUG-PM-023: reviewedItems.has() without null guard (P0) — FIXED S116
- **Когда:** S79 review (pre-existing from S74), fixed S116
- **Файл:** CartView.jsx, Mode 2 order render
- **Симптом:** If `reviewedItems` prop is undefined, calling `.has()` crashes the render
- **Фикс:** Added `safeReviewedItems = reviewedItems || new Set()` in safe prop defaults block. All `.has()` calls use safeReviewedItems.

### BUG-PM-024: loyaltyAccount.balance without null guard (P0) — FIXED S116
- **Когда:** S79 review (pre-existing from S74), fixed S116
- **Файл:** CartView.jsx, loyalty section
- **Симптом:** If `loyaltyAccount.balance` is undefined/null, `.toLocaleString()` crashes
- **Фикс:** Wrapped all `loyaltyAccount.balance` usages with `Number(loyaltyAccount.balance || 0)`.

### BUG-PM-025: draftRatings prop without null guard (P1) — FIXED S116
- **Когда:** S79 review (pre-existing from S74), fixed S116
- **Файл:** CartView.jsx, Mode 2 order render
- **Симптом:** If `draftRatings` is undefined, accessing `draftRatings[itemId]` crashes
- **Фикс:** Added `safeDraftRatings = draftRatings || {}` in safe prop defaults block. All `draftRatings[itemId]` uses safeDraftRatings.

### BUG-PM-S87-03: CTA button "Send to waiter" looks active when disabled (P2) — FIXED S87
- **Когда:** S87 testing
- **Файл:** `CartView.jsx` — submit button at bottom of cart drawer
- **Симптом:** Button always shows `bg-green-600` regardless of disabled state. When `isTableVerified === false`, button looks clickable (green) but does nothing. Confusing UX.
- **Root cause:** `className="w-full bg-green-600 hover:bg-green-700"` was unconditional — no visual change for disabled state.
- **Фикс:** Conditional className: `isTableVerified === false` → `bg-gray-300 text-gray-500 cursor-not-allowed hover:bg-gray-300`. Added hint text `tr('cart.enter_table_code_hint', 'Введите код стола чтобы отправить заказ')` below button when disabled.
- **RELEASE:** pending (parallel mode, pre-merge)

### BUG-PM-028: Table code input shows 5 boxes for 4-digit codes (S81-02, P0) — FIXED S82
- **Когда:** S81 testing
- **Файл:** `CartView.jsx` — tableCodeLength useMemo
- **Симптом:** OTP input renders 5 boxes but real codes are 4 digits → auto-verify never fires → order blocked.
- **Фикс:** tableCodeLength default 5→4 (reads from partner.table_code_length if set).
- **RELEASE:** `260305-03 CartView RELEASE.jsx` | **Коммит:** `e9050d3`

### BUG-PM-029: No visible feedback after Hall order sent (S81-17, P1) — FIXED S82
- **Когда:** S81 testing
- **Файл:** `x.jsx` — processHallOrder()
- **Симптом:** Toast appeared for 2s (too short); on failure `setSubmitError` invisible in drawer.
- **Фикс:** Toast duration 2s→4s; added `toast.error` in catch; cart cleared on success.
- **RELEASE:** `260305-05 x RELEASE.jsx` | **Коммит:** `02ae5e5`

### BUG-PM-030: Pickup/Delivery checkout used fullscreen instead of drawer (S81-14, P0) — FIXED S82
- **Когда:** S81 testing
- **Файл:** `x.jsx` — handleCheckoutClick, StickyCartBar for pickup/delivery
- **Симптом:** Нажатие «Оформить» в режимах Самовывоз/Доставка открывало fullscreen checkout (отдельный экран) вместо bottom drawer. Несогласованный UX с режимом «В зале».
- **Фикс:** Добавлен `PickupDeliveryCheckoutContent` — drawer-контент с полями: Имя + Телефон (обязательные) + Адрес (только Доставка) + Комментарий + Total + CTA. `handleCheckoutClick` теперь устанавливает `drawerMode = 'checkout'` вместо `setView("checkout")`. Drawer использует `SNAP_FULL` (90% высоты) для отображения формы. Drawer нельзя закрыть во время submit (`isSubmitting` guard). Ошибки очищаются при закрытии (`onOpenChange`).
- **RELEASE:** `260305-05 x RELEASE.jsx` | **Коммит:** `02ae5e5`

### BUG-PM-031: Duplicate restaurant name in header (S81-07, P1) — FIXED S84
- **Когда:** S84 Quick Test — regression from S79 (logo addition)
- **Файл:** `x.jsx` — PublicMenuHeader + logo+name block
- **Симптом:** Restaurant name shown twice: (1) in PublicMenuHeader h1, (2) in logo+name block below.
- **Root cause:** S79 patch added logo+name block but didn't suppress the name already shown by PublicMenuHeader.
- **Фикс:** Pass `partner={showLogo ? { ...partner, name: undefined } : partner}` to PublicMenuHeader. When logo block shows the name, PublicMenuHeader gets partner without name field.
- **RELEASE:** `260306-00 x RELEASE.jsx` | **Коммиты:** `a89ce7c`, `03b2eb9`

### BUG-PM-032: CTA button «Отправить официанту» below viewport (S81-03, P0) — FIXED S84
- **Когда:** S84 Quick Test — regression: S82 fix (SNAP_FULL) was not enough
- **Файл:** `x.jsx` — cart drawer structure
- **Симптом:** "Send to Waiter" button at y≈729 (viewport 736px), not visible without manual scroll.
- **Root cause:** RELEASE removed the `overflow-y-auto` wrapper around CartView (flex-col DrawerContent without scroll container). `sticky bottom-0` in CartView requires a scroll container parent.
- **Фикс:** Added `<div className="flex-1 overflow-y-auto min-h-0">` wrapper around CartView (and PickupDeliveryCheckoutContent) inside DrawerContent. Also added `isSubmitting` guard to `onOpenChange`.
- **RELEASE:** `260306-00 x RELEASE.jsx` | **Коммиты:** `32d7e8a`, `03b2eb9`

### BUG-PM-033: Drawer drag handle swipe-to-close not working (S81-01, P0) — FIXED S84
- **Когда:** S84 Quick Test — regression: S82 `setActiveSnapPoint(null)` approach didn't work
- **Файл:** `x.jsx` — Drawer component
- **Симптом:** Swipe down on drag handle (gray bar at top of drawer) did not close drawer.
- **Root cause:** `setActiveSnapPoint(null)` relied on vaul snap point API that may not fire consistently. No fallback touch handler.
- **Фикс:** Added custom drag handle div with `onTouchStart`/`onTouchEnd` handlers. Swipe >80px triggers close. Added `isSubmitting` guard. Applied to both cart and checkout drawers.
- **RELEASE:** `260306-00 x RELEASE.jsx` | **Коммиты:** `270ad06`, `03b2eb9`

### BUG-PM-034: Cart drawer setActiveSnapPoint missing !isSubmitting guard (P1) — FIXED S85
- **Когда:** S85 — found during task-260306-003505 verification
- **Файл:** `x.jsx` — cart Drawer setActiveSnapPoint handler
- **Симптом:** Cart drawer could be closed via vaul snap API swipe even during order submission (vaul internal swipe). Inconsistency with checkout drawer which already had the guard.
- **Root cause:** Cart drawer `setActiveSnapPoint` used `if (sp === null)` without `!isSubmitting`, unlike checkout drawer which used `if (sp === null && !isSubmitting)`.
- **Фикс:** Added `&& !isSubmitting` to cart drawer `setActiveSnapPoint` condition + changed `else` to `else if (sp !== null)` for symmetry with checkout drawer.
- **RELEASE:** `260306-01 x RELEASE.jsx`

### BUG-PM-S87-01: :::ARCHIVED::: marker visible to guests in dish descriptions (P1) — FIXED S87
- **Когда:** S87 testing
- **Файл:** `x.jsx` — isDishArchived(), getCleanDescription(), getDishDescription()
- **Симптом:** Guests see raw `:::ARCHIVED:::` text in dish descriptions (e.g., "пропрол :::ARCHIVED:::").
- **Root cause:** IS_ARCHIVED_TAG was lowercase `:::archived:::` but actual data has uppercase `:::ARCHIVED:::`. String.includes() and String.replace() are case-sensitive.
- **Фикс:** isDishArchived() now uses `.toLowerCase().includes()`. getCleanDescription() now uses `/:::archived:::/gi` regex. getDishDescription() now also cleans translated descriptions.
- **RELEASE:** `260306-01 x RELEASE.jsx`

### BUG-PM-S87-02: Raw i18n keys visible after order submission (P1) — FIXED S87
- **Когда:** S87 testing
- **Файл:** `x.jsx` — OrderConfirmationScreen, StickyCartBar labels
- **Симптом:** After submitting order, confirmation screen shows raw keys like `confirmation.title`, `CART.MY_BILL` instead of Russian text.
- **Root cause:** `t()` returns the key string when translation is missing. `|| "fallback"` pattern doesn't catch it because the key string is truthy. OrderConfirmationScreen used bare `t()` without fallbacks.
- **Фикс:** Added `tr()` helper to both x.jsx main component and OrderConfirmationScreen (same pattern as CartView). All confirmation.* keys and cart.* button labels now use `tr("key", "Russian fallback")`. 28 i18n keys added to `i18n_pending.csv`.
- **RELEASE:** `260306-01 x RELEASE.jsx`

### BUG-PM-026: Drawer pull-down swipe doesn't close drawer (S81-01, P1) — FIXED S82
- **Когда:** S81 testing
- **Файл:** `x.jsx` — Drawer setActiveSnapPoint
- **Симптом:** Swipe down on drag handle did not close the drawer.
- **Фикс:** `setActiveSnapPoint` handler: `if (sp === null) setDrawerMode(null); else setDrawerSnapPoint(sp);`
- **RELEASE:** `260305-05 x RELEASE.jsx`

### BUG-PM-027: CTA button hidden at default drawer height (S81-03, P1) — FIXED S82
- **Когда:** S81 testing
- **Файл:** `x.jsx` — drawer snap point auto-grow
- **Симптом:** Drawer at SNAP_MID (60%); CTA outside visible area with 1-4 items.
- **Фикс:** Auto-expand to SNAP_FULL when `cart.length > 0` (was `> 4`).
- **RELEASE:** `260305-05 x RELEASE.jsx`

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
