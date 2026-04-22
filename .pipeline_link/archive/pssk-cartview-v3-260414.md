---
page: CartView
code_file: pages/PublicMenu/CartView.jsx
budget: 10
agent: cc+codex
chain_template: pssk-review
ws: WS-CV
---

# ПССК Review v3: CartView Drawer Redesign Batch CV-A

**Цель:** Третий раунд ПССК. v2 (task-260414-061144) дал 0P0+5P1+5P2+2P3. Все 5 P1 применены к промпту. Проверить что:
1. P1-1 (V8-блок crash) — закрыт
2. P1-2 (getOrderStatus удаление) — закрыт
3. P1-3 (header total formula) — закрыт
4. P1-4 (N заказа → N блюда) — закрыт
5. P1-5 (isSubmitting lines 729/733) — закрыт
6. Нет новых P0/P1
7. Промпт готов к финальной КС (С5v2 $18)

Вес задачи: H (architectural redesign, 1163-line file). Batch CV-A = States A/A2/B.

---

# КС Prompt (для ревью):

---
page: CartView
code_file: pages/PublicMenu/CartView.jsx
budget: 18
agent: cc+codex
chain_template: consensus-with-discussion-v2
ws: WS-CV
---

# CartView Drawer Redesign: Core Structure (Batch CV-A) — КС Prompt
**PSSK Review v3** — v2 + 5 P1 fixes from S267 (CC+Codex 260414-061144).

## Context
Файл: pages/PublicMenu/CartView.jsx (1163 lines, RELEASE `260330-02 CartView RELEASE.jsx`)
Задача: Redesign CartView drawer — collapse 5 status buckets into 2 groups (В работе / Выдано), add "В корзине" group with stepper, move money to header only, make footer CTA-only, implement submit-feedback state A2.
Вес: H (architectural UI redesign) | Бюджет: $18 | Модель: С5v2

⚠️ If `wc -l pages/PublicMenu/CartView.jsx` < 1100 — restore: `cp "260330-02 CartView RELEASE.jsx" CartView.jsx` (KB-095).

## UX Reference (INLINED — files NOT in repo)
UX-документ: v6.0 (60 decisions CV-01..CV-60, 8 states A→T, GPT R4 "Lock and build").
HTML макет: v5.1, pre-dates v6.0. Layout/structure is valid reference, but these v6.0 overrides apply:
  - Footer `"К отправке:"` summary → **REMOVE** (v6.0 CV-51: footer = only CTA)
  - Bucket `bucket-sum` in header → **REMOVE** (v6.0 CV-50: no subtotals in groups)
  - "Отправлено" status → **REMOVE** (v6.0 CV-52: only 2 statuses)
  - "Новый заказ" section name → rename to **"В корзине"** (v6.0 CV-49)

**⚠️ UX files are NOT in the repo.** All critical decisions are inlined in this prompt. Do NOT attempt to reference external UX files.

BACKLOG: WS-CV (CartView Drawer)

**CRITICAL: `OrderItem` has NO status field.** Status = `Order.status` only. All items in one order share the same status. Buckets group ORDERS, not items.

**`Order.status` → Guest-facing groups (v6.0):**
- `new`, `accepted`, `in_progress`, `ready` → **В работе**
- `served`, `completed` → **Выдано**
- `cancelled` → hidden

**3 visual groups use DIFFERENT data sources:**
- **Выдано** → `groups.served` (from orders with status served/completed)
- **В работе** → `groups.in_progress` (from orders with status new/accepted/in_progress/ready)
- **В корзине** → `cart` prop/state (local items NOT yet submitted). Cart is NOT part of `groups` object.

This batch covers States A, A2, B only. Rating flow (C/C2/C3/D) and Tab "Стол" (T) → Batch CV-B.

## FROZEN UX (DO NOT CHANGE)
- **Tab switching** (Мои/Стол) — leave as-is, Batch CV-B will update Tab Стол
- **Guest name editing** (`isEditingName`, `handleUpdateGuestName`) — leave as-is
- **Help drawer integration** (`onCallWaiter`) — leave as-is
- **Star rating rendering** on served items — leave existing rating code as-is, Batch CV-B refactors
- **Table verification flow** (`hallGuestCodeEnabled`, `verifyTableCode`) — leave as-is
- **Loyalty redemption** (`redeemedPoints`, `pointsDiscountAmount`) — leave as-is
- **Close drawer** (`onClose`, vaul mechanics) — leave as-is
- **StickyCartBar** in x.jsx — DO NOT TOUCH
- **x.jsx** — DO NOT MODIFY. This batch = CartView.jsx only.

---

## Fix 1 — CV-01+CV-48+CV-52 [MUST-FIX, H]: Replace 5-status buckets with 2 groups + В корзине

### Проблема
CartView splits orders into 5 status buckets (served/ready/in_progress/accepted/new_order). Guest sees labels "Отправлено", "Принят", "Готовится", "Готов", "Подано". v6.0 says: guest needs only 2 statuses.

### Wireframe (было → должно быть)
```
БЫЛО:                           ДОЛЖНО БЫТЬ:
▾ Отправлено (1)                ▸ Выдано (2)         ← collapsed
▾ Принят (1)                    ▾ В работе (3)       ← all non-served merged
▾ Готовится (1)                   Суши       44.77 ₸
▾ Подано (2)                      Стейк      64.02 ₸
  [collapsed]                     New dish    10.00 ₸
--- new order ---               ▾ В корзине (1)      ← cart items (from cart prop, NOT groups)
                                  Ризотто    32.00 ₸
                                  [ − ] 1 [ + ]
                                  +32 бонуса
```

### Что менять
Grep: `const buckets = { served` → find bucket creation logic. Currently creates 5 buckets.
Grep: `'Отправлено'` → find all occurrences of this label. Remove all.
Grep: `new_order:` → find bucket label map. Replace 5-label map with 2 labels.
Grep: `statusBuckets` → find all usages. Update to use 2-group model.

Change bucket creation:
```javascript
// OLD (5 buckets):
const buckets = { served: [], ready: [], in_progress: [], accepted: [], new_order: [] };
// ...complex per-status splitting...

// NEW (2 groups):
const groups = { served: [], in_progress: [] };
todayMyOrders.forEach(o => {
  const s = o.status?.toLowerCase?.() || 'new';
  if (s === 'served' || s === 'completed') groups.served.push(o);
  else if (s !== 'cancelled') groups.in_progress.push(o);
});
```

**⚠️ Cart items are NOT part of `groups`.** They come from the existing `cart` prop/state. The 3 visual groups use different data sources: `groups.served` (orders), `groups.in_progress` (orders), `cart` (local items). Do NOT add cart items to the groups object.

Grep: `Отправлено` → matches to delete. After removing 5-status labels from `getOrderStatus`:
- **`getOrderStatus()` — DO NOT REMOVE.** It is used in Tab Стол render (line ~788, OUT OF SCOPE). Update it to return only 2 labels: `'В работе'` for non-served, `'Выдано'` for served/completed. Leave all call sites intact.
- **Grep `getOrderStatus` for ALL call sites** to confirm no call sites are removed.

**⚠️ V8 «Ничего не ждёте» block (lines 849–930):** This render block uses the OLD 5 bucket keys (`ready`, `accepted`, `in_progress`, `new_order`, `served`). After Fix 1 renames to 2 groups, this block will crash. Update it to use the NEW `groups.in_progress` and `groups.served` keys instead. Grep: `Ничего не ждёте` → find the block → replace all old bucket references inside it with new group references.

**⚠️ getSafeStatus (lines ~277, ~288, ~302):** Returns string `'Отправлено'` for some statuses. This function is used by Tab Стол (OUT OF SCOPE). Do NOT remove or rename `getSafeStatus`. Update it to return `'Выдано'` instead of `'Отправлено'` for served/completed statuses — this way the grep `Отправлено → 0` check will pass while keeping the function intact.

Replace render: 3 groups in order: Выдано (collapsed) → В работе (expanded) → В корзине (expanded). Empty groups hidden.

**Empty drawer state:** If ALL groups are empty (0 orders AND 0 cart items), either show an empty state message (e.g., `tr('cart.empty', 'Корзина пуста')`) or verify that the drawer cannot be opened when empty (check StickyCartBar logic).

### НЕ должно быть
- NO 5-status sub-buckets visible to guest
- NO "Отправлено" text/badge/color ANYWHERE
- NO per-order rows with timestamps (CV-28: flat list by dish name)
- NO horizontal dividers between items (CV-29)

### Проверка
1. Orders in `accepted` + `ready` → both under single "В работе" group.
2. Grep `Отправлено` in modified file → 0 matches.
3. Grep `getOrderStatus` → verify all call sites still work or function removed.
4. Cart items render from `cart` prop, not from `groups` object.

---

## Fix 2 — CV-50+CV-51 [MUST-FIX, M]: Money only in drawer header, footer = only CTA

### Проблема
Footer has summary (amount, count). Groups have subtotals. Money scattered across UI.

### Wireframe (было → должно быть)
```
БЫЛО (footer):                  ДОЛЖНО БЫТЬ (footer):
├─────────────────────┤         ├─────────────────────┤
│ К отправке: 32.00 ₸│         │ [Отправить          │
│ +32 бонуса          │         │  официанту]         │
│ [Отправить офиц.]   │         └─────────────────────┘
└─────────────────────┘
                                ДОЛЖНО БЫТЬ (header):
                                │ Стол 22 · Tulip (Г1) ˅│
                                │ 4 блюда · 118.79 ₸    │
```

### Что менять
Grep for actual React identifiers in CartView.jsx (NOT HTML mockup class names):
- Grep: `totalPrice\|grandTotal\|orderTotal\|cartTotal` → find price calculation variables
- Grep: `Сумма заказа` → find inline subtotal. REMOVE.
- Grep: `К отправке\|cartGrandTotal` → find footer summary elements. REMOVE.
- Grep: `footer\|Footer` → find footer render section. Keep ONLY the CTA button.

**⚠️ Note:** `orders-info`, `footer-summary`, `footer-bonus` are HTML mockup CSS classes, NOT React code identifiers. Grep for actual variable/component names instead.

**Header formula — N блюд:** Sum of ALL item QUANTITIES across all sources. If guest orders 3x Sushi, that's 3 блюда, not 1. Grep: `ordersSum\|itemCount\|totalQty\|dishCount` → find the existing counter variable. Extend it to include cart items:
```javascript
// Existing: ordersSum = todayMyOrders.reduce(...)
// Add cart items quantity:
const cartItemCount = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
const totalDishCount = ordersItemCount + cartItemCount; // use in header as "N блюда"
```

**Header formula — X ₸:** `ordersSum + cartTotalAmount`. Grep: `ordersSum\|cartTotalAmount\|cartTotal` → find both variables. Header price = their sum. Must include ALL three sources: `groups.served`, `groups.in_progress`, AND `cart`.

**⚠️ Semantic change: «N заказа» → «N блюда»:** Current header shows ORDER count (e.g. "3 заказа"). Fix 2 changes it to ITEM QUANTITY count (e.g. "4 блюда"). Grep `заказа\|заказов` in header render → replace with the new `totalDishCount` variable + label `блюда/блюд` (use `tr('cart.header.dishes', 'блюда')`).

### НЕ должно быть
- NO `ИТОГО` / `К отправке` / `Всего` in footer
- NO subtotals in group headers
- **Banned labels:** `«За визит»`, `«ИТОГО ЗА ВИЗИТ»`, `«К отправке: X ₸»`

### Проверка
1. Open drawer → header: "4 блюда · 118.79 ₸". Footer: ONLY the button.
2. Grep `Сумма заказа` → 0 matches.
3. Grep `К отправке` → 0 matches.
4. Verify header total includes cart + in_progress + served items (not just one source).

---

## Fix 3 — CV-48 compensator [MUST-FIX, M]: State A2 — submit-feedback (1.5s CTA transition)

### Проблема
After removing "Отправлено" badge (Fix 1), guest gets no feedback that order was sent. Currently CTA just goes to loading state via `isSubmitting` prop.

### Wireframe
```
State A:  [Отправить официанту]   ← primary
          ↓ tap
State A2: [⏳ Отправляем…]        ← disabled, 1-2s
          ↓ success
          [✅ Заказ отправлен]     ← disabled, success color, 1.5s
          ↓ auto-transition
State B:  [Заказать ещё]           ← outline

ERROR:    [⚠️ Повторить отправку]  ← error color, retry
```

### Что менять
Grep: `isSubmitting\|handleSubmitOrder` → find CTA render and submit handler.

Add new state variable (place AFTER existing hooks to preserve React hook order):
```javascript
// 4 phases: idle, submitting, success, error
const [submitPhase, setSubmitPhase] = React.useState('idle'); // 'idle' | 'submitting' | 'success' | 'error'
```

**⚠️ Error handling (P0 from PSSK review):** If `handleSubmitOrder` fails, the guest must NOT see "Заказ отправлен". Detect error via:
- If `handleSubmitOrder` returns a promise → wrap in try/catch
- If it uses `submitError` prop → check prop value
- The useEffect must check: if `isSubmitting` went false AND no error → `'success'`; if `isSubmitting` went false AND error → `setSubmitPhase('error')`

**⚠️ setTimeout cleanup (P0 from PSSK review):** The success→idle transition uses `setTimeout(1500ms)`. MUST return cleanup function from useEffect to prevent React memory leak on unmount:
```javascript
useEffect(() => {
  if (submitPhase === 'success') {
    const timer = setTimeout(() => setSubmitPhase('idle'), 1500);
    return () => clearTimeout(timer); // cleanup on unmount/re-render
  }
}, [submitPhase]);
```

**⚠️ isSubmitting relationship (lines 729, 733):** `isSubmitting` prop is used for the **close button** (line ~729) and **chevron** (line ~733) — both are disabled while submitting. Keep these two usages of `isSubmitting` as-is. The new `submitPhase` state is ONLY for the CTA button render and the useEffect transition logic. Do NOT replace `isSubmitting` at lines 729/733 with `submitPhase`.

**⚠️ Reset on drawer close:** Reset `submitPhase` to `'idle'` when drawer closes (in existing onClose handler or via useEffect watching drawer open state). Otherwise stale 'success' phase shows on reopen.

**⚠️ Double-tap prevention:** CTA button must have `disabled={submitPhase !== 'idle' || cart.length === 0}` to prevent double submission.

CTA render — 4 states:
```javascript
submitPhase === 'submitting' ? tr('cart.submit.sending', 'Отправляем…')
: submitPhase === 'success' ? tr('cart.submit.success', '✅ Заказ отправлен')
: submitPhase === 'error' ? tr('cart.submit.retry', '⚠️ Повторить отправку')
: cart.length > 0 ? tr('cart.submit.send', 'Отправить официанту')
: tr('cart.order_more', 'Заказать ещё')
```

**⚠️ Hook order safety (D12):** Place `useState('idle')` AFTER `const [infoModal, setInfoModal]` (grep: `infoModal`). Do NOT insert before existing hooks. **Prefer REUSING dead hook slots** for `submitPhase` (e.g., repurpose a removed useState from 5-bucket code) before commenting out dead hooks.

### НЕ должно быть
- NO "Отправлено" badge on orders after submit
- NO silent transition (guest must see success feedback)
- NO blocking dialog/modal
- NO "Заказ отправлен" on FAILED submissions

### Проверка
1. Add to cart → tap "Отправить" → see "Отправляем…" → "✅ Заказ отправлен" → "Заказать ещё".
2. Double-tap → only 1 order created (button disabled during submitting/success).
3. Submit fails → see "⚠️ Повторить отправку" (NOT "Заказ отправлен").
4. Close drawer during success phase → reopen → phase is 'idle'.

---

## Fix 4 — CV-46 [MUST-FIX, L]: Выдано auto-collapse logic

### Проблема
"Выдано" collapse may not auto-adjust based on other groups.

### Что менять
Grep: `expandedStatuses\|setExpandedStatuses` → find existing state and initializer.

**⚠️ expandedStatuses sync with Fix 1:** The current `expandedStatuses` object has 5 keys (matching the 5 old buckets, line ~93–99). After Fix 1 reduces to 2 groups, update the initializer to use only 2 keys: `{ served: false, in_progress: true }`.

Auto-collapse rule: `served` expanded = `(inProgressItems.length === 0 && cart.length === 0)`. If Выдано is the ONLY group → expanded. Otherwise → collapsed.

**Structural change detection:** Auto-set not only on first render (`prev.served === undefined`) but ALSO when groups change structurally (a group appears or disappears). Add a ref to track previous group existence:
```javascript
const prevGroupKeysRef = useRef('');
// ...
const currentGroupKeys = [
  groups.served.length > 0 ? 'S' : '',
  groups.in_progress.length > 0 ? 'I' : '',
  cart.length > 0 ? 'C' : ''
].join('');

useEffect(() => {
  const structuralChange = currentGroupKeys !== prevGroupKeysRef.current;
  prevGroupKeysRef.current = currentGroupKeys;
  
  if (structuralChange) {
    const otherGroupsExist = groups.in_progress.length > 0 || cart.length > 0;
    setExpandedStatuses(prev => ({
      ...prev,
      served: !otherGroupsExist
    }));
  }
}, [currentGroupKeys]);
```

**CV-25/CV-47:** Polling must NOT reset manual expand/collapse. Only auto-set on FIRST render or structural changes. When user manually toggles, set a `manualOverride` flag per group.

### НЕ должно быть
- NO forced collapse on every poll/re-render
- NO always-collapsed Выдано when it's the only group

### Проверка
1. Cart non-empty + served orders → Выдано collapsed.
2. Only served orders → Выдано expanded.
3. User manually expands Выдано → polling triggers → stays expanded.

---

## Fix 5 — CV-33+CV-49 [MUST-FIX, L]: Remove "Для кого заказ", add bonuses in cart group

### Что менять
Grep: `splitType` → confirmed: appears ONLY in prop destructuring, no UI render in current code. ✅ No UI to remove.

Grep: `earnedPoints\|loyalty_points\|бонус\|loyaltyPoints` → find loyalty info display.

**⚠️ earnedPoints vs cart bonus:** `earnedPoints` likely reflects submitted orders. For the cart bonus, calculate from `cartTotalAmount`: `Math.round(cartTotalAmount * (partner?.loyalty_points_per_currency || 0))`. Grep: `loyalty_points_per_currency\|loyaltyPointsRate` to find the rate variable. Use whichever is available.

Move bonus line into "В корзине" group:
```javascript
// Inside cart group, after last cart item:
{partner?.loyalty_enabled && cartBonusPoints > 0 && (
  <div className="text-xs text-green-600 mt-1">+{cartBonusPoints} бонусов</div>
)}
```

**⚠️ Loyalty condition:** Grep: `partner?.loyalty_enabled` (line ~1118) — use this exact expression, NOT `partner.loyalty` (does not exist in code).

### НЕ должно быть
- NO bonus info in footer
- NO yellow loyalty banner

### Проверка
1. Partner has loyalty + cart items → "+32 бонуса" below stepper.
2. Partner without loyalty → no bonus line.

---

## Fix 6 — CV-23+CV-34 [MUST-FIX, L]: Qty display cleanup

### Что менять
Grep: `totalQty > 1.*×` → find existing qty display. Currently: `{g.totalQty > 1 ? \` ×${g.totalQty}\` : ''}`. ✅ Already hides ×1 for ordered items.

Check cart items: grep `quantity\|stepper` in cart render section. If cart shows `price × 1` text when qty=1 → hide it.

### НЕ должно быть
- NO "×1" visible anywhere

### Проверка
1. Single-qty: "Суши  44.77 ₸" (no ×1).
2. Multi-qty: "Суши ×2  89.54 ₸" (muted ×2).

---

## Fix 7 — CV-31 [NICE-TO-HAVE, L]: Compact header — table + guest on one line

### Wireframe
```
БЫЛО:                    ДОЛЖНО БЫТЬ:
│ Стол 22               │ Стол 22 · Tulip (Г1) ˅│
│ Tulip (Гость 1)       │ 4 блюда · 118.79 ₸    │
│ 4 заказа · 118 ₸      │                        │
```

### Что менять
Grep: `tablePrefix\|tableLabel\|getGuestDisplayName\|header` → find header render. Merge table + guest onto line1. Line2 = total from Fix 2 (totalDishCount + header price).

**⚠️ Header layout note (P3 from v2 review):** Lines 681–723 already have a 2-line header structure — only content change is needed (line1: add guest name; line2: update from order count to dish quantity + price formula from Fix 2). Do NOT restructure the outer layout.

**Guest name format:** Use existing `getGuestDisplayName` output as-is.

### Проверка
1. Header = 2 lines max: line1=table+guest, line2=total.

---

## ⛔ SCOPE LOCK — менять ТОЛЬКО то, что указано в Fix 1-7

- Изменяй ТОЛЬКО код из Fix-секций.
- ВСЁ остальное — НЕ ТРОГАТЬ.
- Rating flow (States C/C2/C3/D) — **OUT OF SCOPE**. Do NOT change star rating, DishFeedback, isRatingMode.
- Tab "Стол" content — **OUT OF SCOPE**. Leave tab Стол render as-is.
- Email bottom sheet — **OUT OF SCOPE**.
- Table verification — **OUT OF SCOPE**.
- Loyalty redemption logic — **OUT OF SCOPE** (only DISPLAY bonus line in cart group).
- **x.jsx — DO NOT MODIFY.**
- **Exception — i18n:** Fix 1, Fix 2, Fix 3, Fix 5 add new `tr()` keys (see Implementation Notes). Find the i18n dictionary in CartView.jsx (grep: `const tr =`) and add all keys listed there. This is the ONLY exception to the scope lock.

## Implementation Notes
- i18n: file uses `tr(key, fallback)` (grep: `const tr =`). For ALL new strings use same `tr(key, fallback)` pattern. Keys: `cart.group.served`, `cart.group.in_progress`, `cart.group.in_cart`, `cart.header.dishes`, `cart.submit.sending`, `cart.submit.success`, `cart.submit.retry`, `cart.cta.order_more`, `cart.empty`.
- `formatPrice` prop for currency formatting — use it for ALL price displays.
- **⚠️ D7 — DrawerContent `relative` ban:** Do NOT add `className="relative"` to any top-level div. Breaks vaul drawer (KB-096).
- **⚠️ D12 — Hook reuse:** When removing 5-bucket code, grep each variable for usage outside deleted block. If useState/useMemo hooks become dead → **prefer REUSING dead hook slots** for new state (e.g., repurpose a removed useState for `submitPhase`). Only comment out with `// reserved — hook order` if no reuse is possible.
- **⚠️ D15 — stopPropagation:** Group headers have `onClick` for expand/collapse. Clickable elements INSIDE header need `e.stopPropagation()`.
- **⚠️ D16 — useMemo:** Derived arrays combining items from different groups MUST use `React.useMemo`. No naked `const x = [...a, ...b]`.
- git add pages/PublicMenu/CartView.jsx && git commit after all fixes.

## MOBILE-FIRST CHECK (MANDATORY before commit)
This is a mobile-first restaurant app (320-420px, one-handed use at table). Verify:
- [ ] Drawer header: 2 lines, readable at 320px
- [ ] Group headers: tappable, touch targets >= 44px height
- [ ] Stepper buttons in cart: >= 44x44px
- [ ] Footer CTA: full width, prominent, sticky bottom
- [ ] No horizontal overflow
- [ ] No excessive whitespace between groups

## Regression Check (MANDATORY after implementation)
- [ ] Cart items: add/remove via stepper still works
- [ ] Submit order: `handleSubmitOrder` still called correctly
- [ ] Submit error: error state shows retry button (NOT success)
- [ ] Star ratings on served items still render (rating MODE is out of scope, but display is not)
- [ ] Tab switching (Мои/Стол) still works
- [ ] Drawer close (chevron/swipe) still works
- [ ] Guest name display correct
- [ ] Price formatting correct (`formatPrice`)
- [ ] **Drawer scroll with many items (>10)** — vaul snap points and content scrolling work correctly with new 3-group layout
- [ ] **Empty state** — verify behavior when all groups are empty
- [ ] `wc -l` before/after — verify file size hasn't grown excessively (F3 rule)

## FROZEN UX grep verification (run before commit)
```bash
grep -n "Отправлено" pages/PublicMenu/CartView.jsx      # should return 0
grep -n "Сумма заказа" pages/PublicMenu/CartView.jsx     # should return 0
grep -n "К отправке" pages/PublicMenu/CartView.jsx       # should return 0
grep -n "ИТОГО" pages/PublicMenu/CartView.jsx             # should return 0
grep -n "isRatingMode" pages/PublicMenu/CartView.jsx      # should still exist (untouched)
grep -n "handleUpdateGuestName" pages/PublicMenu/CartView.jsx  # should still exist
grep -n "getOrderStatus" pages/PublicMenu/CartView.jsx    # verify updated (NOT removed)
grep -n "getSafeStatus" pages/PublicMenu/CartView.jsx     # should still exist (NOT removed)
```
