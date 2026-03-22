---
version: "29.0"
updated: "2026-03-21"
session: 153
---

# PublicMenu — Bug Registry

Регистр всех известных багов страницы публичного меню (x.jsx + useTableSession.jsx).
Цель: не терять контекст, быстро чинить повторные баги, не допускать регрессий.

---

## Active Bugs (не исправлены)

*18 active bugs remaining (0x P0, 8x P1, 7x P2, 2x P3, 1x suggestion).*

### BUG-PM-056: Drawer layout not visit-state-driven (P1 — Batch 2)
- **Приоритет:** P1
- **Когда:** S153 (consensus chain publicmenu-260321-093745)
- **Файл:** CartView.jsx
- **Симптом:** CartView renders same layout regardless of visit state. Missing 3 distinct drawer layouts per spec (before send / after send+draft / after send no draft).
- **Фикс:** Introduce `drawerLayout` variable, conditionally reorder sections, add collapsible bill.

### BUG-PM-057: CTA 7-state matrix not implemented (P1 — Batch 2)
- **Приоритет:** P1
- **Когда:** S153 (consensus chain publicmenu-260321-093745)
- **Файл:** CartView.jsx
- **Симптом:** Submit button text doesn't vary by visit+draft state. Missing "Заказать ещё", "Открыть счёт" CTAs.
- **Фикс:** Compute CTA text/behavior from 7-state matrix.

### BUG-PM-058: StickyCartBar missing 7-state visibility (P1 — Batch 3)
- **Приоритет:** P1
- **Когда:** S153 (consensus chain publicmenu-260321-093745)
- **Файл:** x.jsx
- **Симптом:** `hallStickyMode` only has 4 states. Missing: paid fade-out, closed hidden, closed+items confirm reset, two text modes.
- **Фикс:** Full state detection from tableSession.

### BUG-PM-059: StickyCartBar text modes not implemented (P1 — Batch 3)
- **Приоритет:** P1
- **Когда:** S153 (consensus chain publicmenu-260321-093745)
- **Файл:** x.jsx
- **Симптом:** No separate draft-mode vs visit-mode text formats for StickyCartBar.

### BUG-PM-052: Pickup/delivery checkout drops loyalty UI (P1)
- **Приоритет:** P1
- **Когда:** S150 (Codex review, chain publicmenu-260320-173330)
- **Файл:** x.jsx / CartView.jsx
- **Симптом:** Loyalty section not shown in pickup/delivery checkout flow.
- **Фикс:** Enable loyalty UI for all order modes.

### BUG-PM-060: Section rendering order wrong (P2 — Batch 2)
- **Приоритет:** P2
- **Когда:** S153 (consensus chain publicmenu-260321-093745)
- **Файл:** CartView.jsx
- **Симптом:** Sections render out of spec order (sent before draft). Part of drawer restructure (BUG-PM-056).

### BUG-PM-061: StickyCartBar missing animations (P2 — Batch 3)
- **Приоритет:** P2
- **Когда:** S153 (consensus chain publicmenu-260321-093745)
- **Файл:** x.jsx
- **Симптом:** Missing count bump animation on "+" and soft rise animation on first item.

### BUG-PM-062: CategoryChips ignores activeColor prop — needs B44 prompt (P3)
- **Приоритет:** P3
- **Когда:** S153 (consensus chain publicmenu-260321-093745)
- **Файл:** @/components/publicMenu/refactor/CategoryChips (imported component, NOT page code)
- **Симптом:** Active chip still renders indigo despite `activeColor="#B5543A"` prop passed in x.jsx:3182. CC grep confirmed zero indigo in all page files — issue is inside imported component.
- **Фикс:** B44 prompt needed to fix CategoryChips component to respect `activeColor` prop. No page-side code fix possible.
- **Confirmed:** Chain publicmenu-260321-140331 (both CC and Codex agree).

### BUG-PM-055: Status new/accepted blue→amber debate (suggestion)
- **Приоритет:** P3 (suggestion — needs Arman decision)
- **Когда:** S150 (CC review, chain publicmenu-260320-173330)
- **Файл:** x.jsx (OrderStatusBadge, osGetStatusConfig), CartView.jsx (getSafeStatus)
- **Симптом:** "new" and "accepted" statuses use blue, but STYLE_GUIDE says sent/waiting=amber. Task constraint said "do NOT change status colors."
- **Фикс:** If Arman decides to align with STYLE_GUIDE, change blue→amber for these intermediate statuses.

### BUG-PM-055: Status new/accepted blue→amber debate (suggestion)
- **Приоритет:** P3 (suggestion — needs Arman decision)
- **Когда:** S150 (CC review, chain publicmenu-260320-173330)
- **Файл:** x.jsx (OrderStatusBadge, osGetStatusConfig), CartView.jsx (getSafeStatus)
- **Симптом:** "new" and "accepted" statuses use blue, but STYLE_GUIDE says sent/waiting=amber. Task constraint said "do NOT change status colors."
- **Фикс:** If Arman decides to align with STYLE_GUIDE, change blue→amber for these intermediate statuses.

### BUG-PM-064: Partner lookup hides backend failures (P1)
- **Приоритет:** P1
- **Когда:** S153 (Codex review, chain publicmenu-260321-110752)
- **Файл:** x.jsx
- **Симптом:** Partner query catches all errors and shows "restaurant not found" even for network failures.
- **Фикс:** Distinguish network errors from 404 and show appropriate message.

### BUG-PM-065: Hall StickyCartBar ignores visit lifecycle state (P1)
- **Приоритет:** P1
- **Когда:** S153 (Codex review, chain publicmenu-260321-110752)
- **Файл:** x.jsx
- **Симптом:** StickyCartBar doesn't inspect visit/session/bill/closed/paid state.
- **Фикс:** Full lifecycle state detection.

### BUG-PM-066: Hall StickyCartBar copy — missing full state matrix (P2)
- **Приоритет:** P2
- **Когда:** S153 (Codex review, chain publicmenu-260321-110752)
- **Файл:** x.jsx
- **Симптом:** Label resolver only produces a few generic labels instead of full state matrix.

### BUG-PM-067: StickyCartBar animations — no cart count tracking (P2)
- **Приоритет:** P2
- **Когда:** S153 (Codex review, chain publicmenu-260321-110752)
- **Файл:** x.jsx
- **Симптом:** Parent doesn't track previous cart count for animation triggers.

### BUG-PM-070: Partner lookup hides backend failures as "not found" (P1)
- **Приоритет:** P1
- **Когда:** S154 (Codex review, chain publicmenu-260321-140331, Finding #4 — SKIPPED by merge)
- **Файл:** x.jsx:1321, x.jsx:3029
- **Симптом:** Partner query swallows exceptions and returns `null`, then page always renders `error.partner_not_found`. Transient backend failure is misreported as bad QR link. User sees "restaurant not found" instead of retryable error.
- **Фикс:** Preserve request errors separately from true not-found. Render retryable error UI for backend failures.

### BUG-PM-068: Hardcoded aria labels / missing i18n in controls (P3)
- **Приоритет:** P3
- **Когда:** S153 (Codex review, chain publicmenu-260321-140331)
- **Файл:** CheckoutView.jsx, CartView.jsx, MenuView.jsx
- **Симптом:** Hardcoded English aria labels in CheckoutView, hardcoded placeholder in CartView, missing aria-labels in MenuView.
- **Фикс:** Replace with t()/tr() i18n calls. Future batch.

### BUG-PM-069: Bottom Sheet missing cooldown/lockout countdown display (P2)
- **Приоритет:** P2
- **Когда:** S153 (chain publicmenu-260321-140331)
- **Файл:** x.jsx
- **Симптом:** Table confirmation Bottom Sheet shows codeVerificationError but doesn't display attempt counter or lockout countdown. CartView cooldown logic still prevents brute-force via shared state, but user doesn't see countdown in Bottom Sheet.
- **Фикс:** Lift codeAttempts/codeLockedUntil/nowTs state to x.jsx scope and display in Bottom Sheet.

### BUG-PM-072: Mobile grid partner setting ignored in MenuView (P2) — FIXED S159
- **Приоритет:** P2
- **Когда:** S155D (Codex review, chain publicmenu-260321-195108), fixed S159 via chain publicmenu-260322-131000
- **Файл:** MenuView.jsx
- **Симптом:** `grid-cols-2` hardcoded on mobile despite `partner.menu_grid_mobile` setting. MOBILE_GRID missing `3: "grid-cols-3"`.
- **Фикс:** Added `3: "grid-cols-3"` to MOBILE_GRID. Replaced hardcoded `grid-cols-2` with `MOBILE_GRID[mobileCols]` on mobile path.

### BUG-PM-073: useTableSession loses restored guests with only `_id` (P2)
- **Приоритет:** P2
- **Когда:** S155D (Codex review, chain publicmenu-260321-195108)
- **Файл:** useTableSession.jsx
- **Симптом:** `currentGuestIdRef.current` uses `.id` instead of `normalizeGuestId()` — restored guests with only `_id` field may be missed.
- **Фикс:** Use `normalizeGuestId()` consistently.

---

## Fixed Bugs (исправлены)

### FIX-PM-077-KS3: "+" button moved to card bottom-right — FIXED S159
- **Когда:** S159, chain publicmenu-260322-131000
- **Файл:** MenuView.jsx
- **Симптом:** "+" button was inside image container (bottom-2 right-2 of image), not at card level per LOCK-PM-001.
- **Фикс:** Made Card `relative`, moved CTA to `absolute bottom-3 right-3` of Card. Added `pb-14` to CardContent to prevent overlap.

### FIX-84-KS3: Discount badges use partner.discount_color — FIXED S159
- **Когда:** S159, chain publicmenu-260322-131000
- **Файл:** MenuView.jsx
- **Симптом:** No discount badge on dish cards. No struck-through original price when discount active.
- **Фикс:** Added discount badge (top-left of image, both tile and list cards) with `partner.discount_color || '#C92A2A'`. Added discounted price display with struck-through original price.

### FIX-PM-071-CHAIN-195108: 4 fixes via consensus chain publicmenu-260321-195108 — FIXED S155D
- **Когда:** S155D, chain publicmenu-260321-195108
- **Файл:** x.jsx
- **Фикс:**
  1. [P1] Move `!isTableVerified` check before `validate()` in `handleSubmitOrder` — root cause of BS not opening (Codex)
  2. [P1] Add `z-[60]` to confirmation DrawerContent — ensures BS visible above cart Drawer (CC)
  3. [P2] Add `tr()` fallbacks for 5 BS i18n keys — prevents raw key display if translations missing (CC)
  4. [P2] Remove `console.error` in `saveTableSelection` — production log cleanup (CC)
- **Skipped:** Fix 3 (P2 state refactor — move verification state to x.jsx) — too large, recorded as BUG-PM-069.

### FIX-PM-CHAIN-140331: 6 fixes via consensus chain publicmenu-260321-140331 — FIXED S153
- **Когда:** S153, chain publicmenu-260321-140331
- **Файл:** x.jsx, CartView.jsx
- **Фикс:**
  1. [P0] Gate hall submit on `isTableVerified` instead of `!currentTableId` — prevents orphan orders (Codex X1)
  2. [P1] Removed inline table verification UI from CartView (201 lines) — Bottom Sheet is sole surface (A1)
  3. [P1] Added primary CTA "Подтвердить и отправить" button to Bottom Sheet (A3)
  4. [P1] Dynamic tableCodeLength in Bottom Sheet from partner config (A2)
  5. [P1] Toast on Bottom Sheet close without verification (C8)
  6. [P2] Fixed misleading "order saved" error fallback message in CartView (X4)
- **Tag:** PublicMenu-pre-publicmenu-260321-140331 (rollback point)

### BUG-PM-035: Verified-table block regresses mobile UX (P2) — FIXED S153
- **Когда:** S116 (found), S153 (fixed via chain publicmenu-260321-140331)
- **Файл:** CartView.jsx
- **Фикс:** Inline table verification block removed entirely (201 lines). Bottom Sheet replaces it with proper UX. Duplicate header and tiny touch targets no longer exist.

### BUG-PM-063: Drawer stepper shows XIcon instead of Minus (P2) — FIXED S153
- **Когда:** S153 (chain publicmenu-260321-110752)
- **Файл:** CartView.jsx
- **Фикс:** Replaced `XIcon` with `Minus` icon for decrement, replaced text `+` with `Plus` icon. Added `Minus`, `Plus` imports.

### FIX-PM-JIT: Just-in-time table confirmation Bottom Sheet (P1) — FIXED S153
- **Когда:** S153 (chain publicmenu-260321-110752)
- **Файл:** x.jsx, CartView.jsx
- **Фикс:** Submit button always enabled. If table not verified on submit → Bottom Sheet opens for code entry. Auto-submits after verification. Added 8 new i18n keys.

### FIX-PM-TOAST: Mode-switch toast i18n fallback (P2) — FIXED S153
- **Когда:** S153 (chain publicmenu-260321-110752)
- **Файл:** x.jsx
- **Фикс:** Added `cart.items_removed_mode_switch` to `I18N_FALLBACKS`.

### FIX-PM-CONSOLE: Remove console.error in hall submit (P2) — FIXED S153
- **Когда:** S153 (chain publicmenu-260321-110752)
- **Файл:** x.jsx
- **Фикс:** Removed `console.error(err)` at line ~2582.

### BUG-PM-050: Order creation race — items created after loyalty redeem (P0) — FIXED S153
- **Когда:** S150 (found), S153 (fixed via chain publicmenu-260321-093745)
- **Файл:** x.jsx
- **Фикс:** Moved `OrderItem.bulkCreate` before loyalty side effects in both hall and pickup/delivery submit paths.
- **Commit:** 3b65762

### BUG-PM-051: Cart survives mode switches (P1) — FIXED S153
- **Когда:** S150 (found), S153 (fixed via chain publicmenu-260321-093745)
- **Файл:** x.jsx
- **Фикс:** `handleModeChange()` now filters cart items via `isDishEnabledForMode()`, drops unavailable with toast.
- **Commit:** 3b65762

### BUG-PM-053: Hall confirmation shows wrong total (P1) — FIXED S153
- **Когда:** S150 (found), S153 (fixed via chain publicmenu-260321-093745)
- **Файл:** x.jsx
- **Фикс:** Confirmation screen uses `finalTotal` (post-discount) instead of raw `cart.reduce`.
- **Commit:** 3b65762

### BUG-PM-054: Hardcoded colors in MenuView, CheckoutView, ModeTabs (P2) — FIXED S153
- **Когда:** S150 (found), S153 (fixed via chain publicmenu-260321-093745)
- **Файл:** MenuView.jsx, CheckoutView.jsx, ModeTabs.jsx
- **Фикс:** All indigo/green replaced with terracotta #B5543A inline styles. 9+ locations.
- **Commit:** 3b65762

### BUG-PM-PALETTE-01: Terracotta palette applied to x.jsx + CartView.jsx (17 fixes) — FIXED S150
- **Когда:** S150, fixed via consensus chain publicmenu-260320-173330
- **Файл:** x.jsx (11 fixes), CartView.jsx (6 fixes)
- **Фикс:** Replaced all indigo/green hardcoded colors with terracotta (#B5543A) semantic palette. 5 indigo→terracotta, 5 bg-white→warm surface (#faf9f7), 2 edit links, 2 radio accents, 1 loyalty box→primary light (#F5E6E0), 1 submit CTA green→terracotta, 1 "Back to menu" button.
- **Commit:** a829e02
- **Tag:** PublicMenu-pre-publicmenu-260320-173330 (rollback point)

### BUG-PM-041: Polling timer leak in useTableSession after cleanup (P0) — FIXED S150
- **Когда:** S119 (CC review), fixed S150 via consensus chain publicmenu-260320-171535
- **Файл:** useTableSession.jsx:670-676
- **Фикс:** Double guard: `if (cancelled) return` at scheduleNext entry + `if (!cancelled)` before recursive call. Also fixed: stale closure deps (NEW-01), infinite retry loop (NEW-02), fire-and-forget closeExpiredSessionInDB (NEW-03), console.warn removal (NEW-04).

### BUG-PM-026: tableCodeLength default regressed to 5 (P1) — FIXED (confirmed S150)
- **Когда:** S116 (Codex review), confirmed fixed S150
- **Файл:** CartView.jsx:101
- **Симптом:** Default table code length is 5, but BUG-PM-S81-02 fixed it to 4.
- **Фикс:** Input count now depends on partner config `table_code_length`. No hardcoded default needed.

### BUG-PM-048: Post-create side effects cause false retry UI (P2) — FIXED S148
- **Когда:** S148 (Codex review), fixed S148 via consensus chain publicmenu-260320-141634
- **Файл:** x.jsx:2434-2498, x.jsx:2800-2895
- **Фикс:** Wrapped loyalty redeem/earn and partner counter updates in individual try/catch blocks so order is confirmed even if side effects fail.

### BUG-PM-032: Order-status differentiation regressed (P2) — FIXED S148
- **Когда:** S116 (Codex review), fixed S148 via consensus chain publicmenu-260320-141634
- **Файл:** CartView.jsx:236-270, CartView.jsx:608,616
- **Фикс:** Added `accepted` fallback to getSafeStatus. Render `{icon} {label}` in all badge locations.

### BUG-PM-033: Scroll position not reset after table verification (P2) — FIXED S148
- **Когда:** S116 (Codex review), fixed S148 via consensus chain publicmenu-260320-141634
- **Файл:** CartView.jsx:143-148
- **Фикс:** Added scrollTo(0) on nearest scrollable container when isTableVerified transitions to true.

### BUG-PM-034-R: Guest code leaked back into drawer header (P2) — FIXED S148
- **Когда:** S116 (Codex review), fixed S148 via consensus chain publicmenu-260320-141634
- **Файл:** CartView.jsx:284
- **Фикс:** Gated localStorage guest code fallback behind `hallGuestCodeEnabled`.

### BUG-PM-049: Review-reward CTA invents +10 bonus when no reward exists (P2) — FIXED S148
- **Когда:** S148 (Codex review), fixed S148 via consensus chain publicmenu-260320-141634
- **Файл:** CartView.jsx:639
- **Фикс:** Changed `|| 10` to `?? 0` and gated bonus text behind `(partner?.loyalty_review_points ?? 0) > 0`.

### BUG-PM-040: Loyalty points debited before order creation (P0) — FIXED S148
- **Когда:** S119 (CC review), fixed S148 via consensus chain publicmenu-260320-141634
- **Файл:** x.jsx:2444-2457, x.jsx:2818-2831
- **Фикс:** Moved `Order.create()` before loyalty transaction and balance update in both hall and pickup/delivery flows.

### BUG-PM-042: isBillOnCooldown crashes in restricted environments (P1) — FIXED S148
- **Когда:** S119 (CC review), fixed S148 via consensus chain publicmenu-260320-141634
- **Файл:** x.jsx:283-293
- **Фикс:** Wrapped `isBillOnCooldown` and `setBillCooldownStorage` in try/catch.

### BUG-PM-036: Loyalty amounts bypass app localization (P2) — FIXED S148
- **Когда:** S116 (Codex review), fixed S148 via consensus chain publicmenu-260320-141634
- **Файл:** CartView.jsx, x.jsx
- **Фикс:** Removed hardcoded `ru-RU` locale, replaced `₸` with `formatPrice()`, added i18n key for points suffix.

### BUG-PM-037: Reward email flow reports success without validation (P2) — FIXED S148
- **Когда:** S116 (Codex review), fixed S148 via consensus chain publicmenu-260320-141634
- **Файл:** CartView.jsx:524
- **Фикс:** Added email regex validation before save, error toast on invalid format.

### BUG-PM-038: Submit-error copy says "order saved" when it may not be (P2) — FIXED S148
- **Когда:** S116 (Codex review), fixed S148 via consensus chain publicmenu-260320-141634
- **Файл:** x.jsx i18n key `error.send.subtitle`
- **Фикс:** Changed to neutral retry text.

### BUG-PM-039: 8-digit table codes overflow narrow phones (P2) — FIXED S148
- **Когда:** S116 (Codex review), fixed S148 via consensus chain publicmenu-260320-141634
- **Файл:** CartView.jsx:1085-1092
- **Фикс:** Made box width and gap responsive (`w-8 sm:w-9`, `gap-1 sm:gap-2`, `flex-wrap`).

### BUG-PM-043: formatOrderTime and formatPrice hardcode ru-RU locale (P2) — FIXED S148
- **Когда:** S119 (CC review), fixed S148 via consensus chain publicmenu-260320-141634
- **Файл:** x.jsx:973, x.jsx:1206
- **Фикс:** Replaced `"ru-RU"` with browser default locale.

### BUG-PM-044: loyalty_redeem_rate falsy-coalescing (P2) — FIXED S148
- **Когда:** S119 (CC review), fixed S148 via consensus chain publicmenu-260320-141634
- **Файл:** CartView.jsx:936
- **Фикс:** Changed `|| 1` to `?? 1`.

### BUG-PM-045: console.log left in production (P2) — FIXED S148
- **Когда:** S119 (CC review), fixed S148 via consensus chain publicmenu-260320-141634
- **Файл:** x.jsx
- **Фикс:** Removed `console.log("Order created")` and debug guest items block.

### BUG-PM-046: Redirect banner setTimeout leak (P2) — FIXED S148
- **Когда:** S119 (CC review), fixed S148 via consensus chain publicmenu-260320-141634
- **Файл:** x.jsx:1871
- **Фикс:** Added cleanup return in useEffect.

### BUG-PM-047: Interactive elements missing aria-label (P3) — FIXED S148
- **Когда:** S119 (CC review), fixed S148 via consensus chain publicmenu-260320-141634
- **Файл:** CartView.jsx
- **Фикс:** Added `aria-label` and min 44px touch targets to bell, save/cancel, info buttons.

### BUG-PM-S140-01: customerEmail.trim() crashes if null/undefined (P2) — FIXED S148
- **Когда:** S140, fixed S148 via consensus chain publicmenu-260320-132541
- **Файл:** CartView.jsx:912, CartView.jsx:976
- **Симптом:** `.trim()` called directly on `customerEmail` without null check. If user has no email set, loyalty section throws TypeError.
- **Фикс:** Changed `customerEmail.trim()` to `(customerEmail || '').trim()` on both lines.

### BUG-PM-S87-03-R: Submit button green when isTableVerified is undefined (P2) — RE-FIXED S148
- **Когда:** S87 (original fix), re-fixed S148 via consensus chain publicmenu-260320-132541
- **Файл:** CartView.jsx:1237, CartView.jsx:1247
- **Симптом:** Original fix used `isTableVerified === false` (strict equality), which doesn't catch `undefined` initial state. Button appeared green and enabled before any verification attempt.
- **Фикс:** Changed `isTableVerified === false` to `!isTableVerified` in both className ternary and disabled prop.

### BUG-AC-09: No visual feedback when dish added to cart (P2) — FIXED S159
- **Когда:** AC-09, re-fixed S159 via chain publicmenu-260322-131000
- **Файл:** MenuView.jsx
- **Симптом:** MenuView's addToCart had no toast (x.jsx toast only covered CartView). User got no feedback when tapping "+" on menu dish cards.
- **Фикс:** Added `handleAddToCart` wrapper with local toast state, 1.5s non-stacking auto-dismiss, cleanup on unmount. Toast positioned `fixed bottom-20` above StickyCartBar.

### BUG-PM-S140-03: Reward-email setTimeout not cleared on unmount (P3) — FIXED S148
- **Когда:** S140, fixed S148 via consensus chain publicmenu-260320-132541
- **Файл:** CartView.jsx:528
- **Симптом:** `setTimeout` in reward-email onClick handler not cancelled on unmount. React warns about state update on unmounted component.
- **Фикс:** Added `rewardTimerRef` ref + cleanup useEffect. setTimeout now stores ID in ref for cleanup.

### BUG-PM-027: Loyalty/discount UI hidden for normal checkout (P1) — FIXED S148
- **Когда:** S116 (Codex review), fixed S148 via consensus chain publicmenu-260320-010828
- **Файл:** CartView.jsx:860, x.jsx:3296
- **Симптом:** Loyalty section gated on `showLoginPromptAfterRating` instead of `showLoyaltySection`. Email entry, balance display, and point redemption unavailable until after a dish rating exists (never for fresh cart).
- **Фикс:** Added `showLoyaltySection` to CartView props. Changed loyalty section gate from `showLoginPromptAfterRating` to `showLoyaltySection`.

### BUG-PM-028: Failed star-rating saves leave dishes permanently locked (P1) — FIXED S148
- **Когда:** S116 (Codex review), fixed S148 via consensus chain publicmenu-260320-010828
- **Файл:** x.jsx:2039 (handleRateDish catch block)
- **Симптом:** Item marked read-only when draftRating > 0, but async save can fail. Nothing clears the draft on failure, so user cannot retry.
- **Фикс:** Added `updateDraftRating(itemId, 0)` in catch block to roll back draft rating on save failure.

### BUG-PM-029: Table-code auto-verify cannot retry same code after failure (P1) — FIXED S148
- **Когда:** S116 (Codex review), fixed S148 via consensus chain publicmenu-260320-010828
- **Файл:** CartView.jsx:155,133
- **Симптом:** `lastSentVerifyCodeRef` never cleared on error or after cooldown unlock. Transient API failure forces guest to change digits to retry.
- **Фикс:** Clear `lastSentVerifyCodeRef` on failed verification (error-counting effect) and on cooldown unlock.

### BUG-PM-030: Review-reward banner shows before any dish is reviewable (P1) — FIXED S148
- **Когда:** S116 (Codex review), fixed S148 via consensus chain publicmenu-260320-010828
- **Файл:** CartView.jsx:386
- **Симптом:** "За отзыв +N" hint shows when `myOrders.length > 0` regardless of order status. Guests see reward prompt before anything is ready/served.
- **Фикс:** Changed condition from `myOrders?.length > 0` to `reviewableItems?.length > 0`.
- **Регрессия:** BUG-PM-021

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

### BUG-PM-150-01: Email input in CartView has no format validation (P2) — FIXED S160
- **Приоритет:** P2
- **Когда:** Task #87 KS-1
- **Root cause:** Email input in loyalty section accepted any string without validation.
- **Фикс:** Added `onBlur` validation with regex `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`, error text under input, submit button disabled while email invalid.
- **Файл:** `CartView.jsx`
- **Коммит:** #87 KS-1

### BUG-PM-150-02: Checkout drawer shows full loyalty UI (balance, progress, catalog) (P2) — FIXED S160
- **Приоритет:** P2
- **Когда:** Task #87 KS-1
- **Root cause:** Checkout drawer contained collapsible loyalty section with balance, redeem controls, discount info — too heavy for checkout flow.
- **Фикс:** Replaced with compact email field + motivation text line above submit button. Motivation: "Отправьте заказ и получите +N бонусов" (only when loyalty_enabled).
- **Файл:** `CartView.jsx`
- **Коммит:** #87 KS-1

### BUG-PM-150-03: Table code BS lacks helper text explaining where to find code (P3) — FIXED S160
- **Приоритет:** P3
- **Когда:** Task #87 KS-1
- **Root cause:** BS had generic title "Подтвердите стол" without explaining what the code is or where to find it.
- **Фикс:** Changed title to "Введите код стола", added always-visible helper: "Код указан на табличке вашего стола. Он нужен, чтобы официант знал куда нести заказ."
- **Файл:** `x.jsx`
- **Коммит:** #87 KS-1

---

## Notes

- **Формат ID:** BUG-PM-NNN (PM = PublicMenu)
- **Приоритеты:** P0 = блокирует использование, P1 = серьёзный, P2 = косметический
- **Review issues** (стиль, i18n, console.log) хранятся в `review_*.md`, не здесь
- При создании RELEASE — проверять что все Active Bugs закрыты или задокументированы
- **Для каждого бага обязательно:** root cause (код, строки), фикс (что изменили), коммит, RELEASE
