# PSSK Review v2: CartView Drawer Redesign (Batch CV-A)
## Reviewed by: Claude Code | Date: 2026-04-14
## Target: KS Prompt for CartView Fixes 1-7
## File: pages/PublicMenu/CartView.jsx (1163 lines)

---

## 1. P0 Closure Check (S262)

### P0-1: Error handling in Fix 3 — CLOSED
The prompt now includes explicit error detection: "if `isSubmitting` went false AND no error -> 'success'; if `isSubmitting` went false AND error -> setSubmitPhase('error')". The `submitError` prop is mentioned. Verified: `submitError` prop exists (line 48), `setSubmitError` (line 49), and error display already exists (lines 1060-1067).

### P0-2: setTimeout cleanup in Fix 3 — CLOSED
The prompt includes the cleanup snippet: `return () => clearTimeout(timer)` in the useEffect. Correct pattern.

**Verdict: Both P0 from S262 are addressed in the prompt.**

---

## 2. New Findings

### [P1] Fix 1: V8 "Ничего не ждёте" block uses 5-bucket references (lines 849-930) — NOT mentioned in prompt

**What:** Lines 850-855 check all 5 old bucket keys:
```javascript
const isV8 = statusBuckets.accepted.length === 0
  && statusBuckets.in_progress.length === 0
  && statusBuckets.ready.length === 0
  && statusBuckets.new_order.length === 0
  && statusBuckets.served.length > 0
  && cart.length === 0;
```
After Fix 1 replaces 5 buckets with 2 groups, this block will crash (`groups.accepted` is undefined).

**Why it matters:** This is ~80 lines of render logic (the entire V8 state) that the prompt never mentions. An implementer following Fix 1 literally would break State V8.

**Fix for prompt:** Add to Fix 1: "Also update the V8 empty-state block (grep: `isV8`) — replace 5-bucket checks with 2-group check: `groups.in_progress.length === 0 && cart.length === 0 && groups.served.length > 0`."

### [P1] Fix 1: `getOrderStatus` must be KEPT — prompt says "remove entirely if no longer used"

**What:** Prompt says: "Verify `getOrderStatus()` function fate: Either (a) update it to return only 2 labels, or (b) remove entirely if no longer used." But `getOrderStatus` is used at line 788 inside the table orders section (Tab Стол), which is OUT OF SCOPE:
```javascript
const status = getSafeStatus(getOrderStatus(order));  // line 788
```

**Why it matters:** If implementer greps and sees only 2 call sites (prop destructuring + line 788) and removes it, table orders section breaks.

**Fix for prompt:** Change to: "getOrderStatus is used in Tab Стол (line ~788, OUT OF SCOPE). KEEP the function and prop. Only remove its usage from my-orders rendering if applicable."

### [P1] Fix 2: Header total MUST combine ordersSum + cart — prompt underspecified

**What:** The prompt says "Header formula: N блюд = sum of all item QUANTITIES... X ₸ = sum of all orders + cart items." But doesn't specify HOW. Current code (line 720) shows only `ordersSum` (submitted orders). Cart total is available as `cartTotalAmount` prop (line 44).

**Why it matters:** Without explicit variable names, implementer may miss that two separate sources must be combined: `ordersSum + (Number(cartTotalAmount) || 0)`.

**Fix for prompt:** Add: "Header price = `ordersSum + (Number(cartTotalAmount) || 0)`. Header item count requires: `todayMyOrders.reduce((sum, o) => (itemsByOrder.get(o.id) || []).reduce((s, i) => s + (i.quantity || 1), 0) + sum, 0) + cart.reduce((s, i) => s + (i.quantity || 1), 0)`."

### [P1] Fix 2: Header count says "блюд" but current code counts "заказов" (orders)

**What:** Current header (lines 714-722) displays `todayMyOrders.length` with plural forms for "заказ/заказа/заказов". Fix 2 says to show "N блюд" (item quantities). This is a semantic change from counting orders to counting dish quantities. The prompt doesn't explicitly say to REMOVE the old order-count code.

**Why it matters:** Implementer might add item count alongside existing order count, or miss the replacement.

**Fix for prompt:** Add: "REPLACE the existing order-count display (lines ~714-723, grep: `cart.order_one`) with item-quantity count + total price."

### [P1] Fix 3: `isSubmitting` prop still used outside CTA — prompt doesn't address

**What:** `isSubmitting` is used at:
- Line 729: Close button disabled during submit (`if (isSubmitting) return;`)
- Line 733: Chevron grayed out during submit
- Line 1140: Button disabled

After introducing `submitPhase`, the relationship between `isSubmitting` (prop from parent) and `submitPhase` (local state) needs clarification. Should close button check `submitPhase !== 'idle'` instead?

**Why it matters:** If `isSubmitting` goes false but `submitPhase` is 'success', the close button becomes clickable. Is that intended? The prompt says "Reset submitPhase to idle when drawer closes" but doesn't say whether close should be allowed during success phase.

**Fix for prompt:** Add: "Close button (line ~729): keep checking `isSubmitting` prop for disabling. The submitPhase only controls CTA appearance. Close during 'success' phase is OK — the onClose handler should reset submitPhase."

### [P2] Fix 1: `getSafeStatus` function (lines 275-310) has "Отправлено" in 3 places

**What:** `getSafeStatus` returns "Отправлено" as label at lines 277, 288, 302. Prompt verification says "grep Отправлено → 0 matches". But `getSafeStatus` is used for table orders (line 788, OUT OF SCOPE).

**Why it matters:** Conflict between "0 matches for Отправлено" requirement and "don't touch Tab Стол code". The function serves both my-orders and table-orders.

**Fix for prompt:** Change verification to: "grep 'Отправлено' in bucket/group rendering → 0 matches. Note: getSafeStatus may still contain 'Отправлено' for table orders (OUT OF SCOPE). The bucketDisplayNames object (line ~492) must be fully replaced."

### [P2] Fix 1: "Сумма заказа" exists in TWO places, one is in-scope and one is out-of-scope

**What:**
- Line 657: In `renderBucketOrders` fallback — IN SCOPE (this renders my-orders)
- Line 794: In table orders section — OUT OF SCOPE

Prompt says "grep `Сумма заказа` → 0 matches" but line 794 is in Tab Стол (frozen).

**Fix for prompt:** Change to: "grep 'Сумма заказа' outside of table-orders section → 0 matches. Line ~794 is Tab Стол (OUT OF SCOPE), may remain."

### [P2] Fix 4: expandedStatuses initial state has 5 keys — needs sync with Fix 1

**What:** Line 93-99 initializes expandedStatuses with 5 keys (`served, ready, in_progress, accepted, new_order`). After Fix 1 reduces to 2 groups, this should become `{ served: false, in_progress: true }`.

**Why it matters:** Not fatal (extra keys are harmless), but confusing. The auto-collapse effect (lines 103-113) also references 4 keys that won't exist after Fix 1.

**Fix for prompt:** Add to Fix 4: "Coordinate with Fix 1: after 5→2 group reduction, simplify expandedStatuses to `{ served: false, in_progress: true }` and remove the old auto-collapse effect (lines ~103-113) which references dead keys."

### [P2] Fix 5: Bonus calculation for CART items is ambiguous

**What:** The prompt says to show "+{earnedPoints} бонусов" in the cart group and "Use whichever of `earnedPoints`, `loyaltyPoints`, or calculated value is available." But `earnedPoints` (line 39) is a prop likely calculated from SUBMITTED orders, not cart items.

For cart items, the correct formula is at line 1119:
```javascript
Math.round((Number(cartTotalAmount) || 0) * (Number(partner?.loyalty_points_per_currency) || 1))
```

**Fix for prompt:** Replace ambiguous "earnedPoints" reference with: "Calculate cart bonus as `Math.round((Number(cartTotalAmount) || 0) * (Number(partner?.loyalty_points_per_currency) || 1))`. Show only if `partner?.loyalty_enabled && motivationPoints > 0`."

### [P2] Fix 5: Loyalty condition is wrong — prompt says `partner.loyalty` but code uses `partner.loyalty_enabled`

**What:** Prompt says "Show ONLY if partner has loyalty configured. Grep: `partner.loyalty|loyaltyEnabled`". Actual code uses `partner?.loyalty_enabled` (line 1118) and the prop `showLoyaltySection` (line 81).

**Fix for prompt:** Change to: "Show only if `partner?.loyalty_enabled` (line ~1118). Use same condition as existing motivation text."

### [P2] Fix 6: Stepper touch targets are 32x32px — below 44px minimum

**What:** Lines 1027-1042 use `w-8 h-8` (32px) for stepper buttons. MOBILE-FIRST CHECK requires "Stepper buttons in cart: >= 44x44px". Fix 6 only mentions qty display ("×1" cleanup).

**Why it matters:** Mobile UX violation. Should at minimum note this as a known issue.

**Fix for prompt:** Add note to Fix 6 or separate item: "Stepper buttons are w-8 h-8 (32px). Consider upgrading to w-11 h-11 (44px) per mobile-first check, or document as a separate P3."

### [P3] Fix 7: Header is already partially implemented (lines 681-723)

**What:** Current code already has table + guest on line 1, and order count + sum on line 2. Fix 7's wireframe matches what's already there, except the count metric (orders vs items — addressed in Fix 2).

**Fix for prompt:** Add note: "Header layout (table+guest line1, stats line2) is already implemented. Fix 7 is only about adjusting the content of line2 to match Fix 2's formula (items + combined total). No structural layout change needed."

### [P3] Fix 3: CTA "Заказать ещё" lives in a separate branch — not covered by submitPhase render

**What:** The footer has two branches (lines 1115-1159):
- `cart.length > 0`: Submit button (uses isSubmitting/submitError)
- `else`: "Заказать ещё" outline button

The prompt's CTA render logic mixes both: `submitPhase === 'submitting' ? ... : cart.length > 0 ? ... : tr('cart.order_more', ...)`. But in the actual code these are separate JSX branches. After submit success, cart is typically cleared by the parent, so the `else` branch naturally shows "Заказать ещё".

**Fix for prompt:** Clarify: "The success→idle transition happens while cart is being cleared by parent. If cart empties before success phase ends, the footer switches to the outline 'Заказать ещё' branch. Ensure submitPhase logic is in the `cart.length > 0` branch only. The 'Заказать ещё' button in the else branch stays unchanged."

---

## 3. Summary

| Priority | Count | Description |
|----------|-------|-------------|
| P0 | 0 | Both S262 P0s confirmed closed |
| P1 | 5 | V8 block crash, getOrderStatus removal risk, header total underspecified, header count semantic change, isSubmitting/submitPhase relationship |
| P2 | 5 | Отправлено in getSafeStatus, Сумма заказа scope conflict, expandedStatuses sync, bonus calc ambiguous, loyalty condition wrong |
| P3 | 2 | Header already done, CTA branch structure |

**Total findings: 12** (0 P0, 5 P1, 5 P2, 2 P3)

## 4. Verdict

**Prompt is NOT ready for final KS.** The 5 P1 issues could cause implementation failures:
1. V8 block crash after bucket→group rename (P1, high risk)
2. getOrderStatus removal breaking table orders (P1, high risk)
3. Header total missing cart amount (P1, medium risk)
4. Header count orders→items semantic gap (P1, medium risk)
5. isSubmitting/submitPhase dual-state confusion (P1, medium risk)

**Recommendation:** Apply P1 fixes to prompt, then it's ready for KS.
