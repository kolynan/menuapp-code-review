# PSSK v3 Review: CartView Drawer Redesign Batch CV-A
**Date:** 2026-04-14
**Reviewer:** Claude Code (CC)
**Task:** task-260414-063321
**Source:** CartView.jsx (1163 lines)
**Prior:** v2 (task-260414-061144) = 0P0 + 5P1 + 5P2 + 2P3

---

## Part 1: P1 Closure Verification

### P1-1: V8-блок crash (lines 849-930) — CLOSED
Prompt now explicitly states: "V8 «Ничего не ждёте» block (lines 849–930): This render block uses the OLD 5 bucket keys (`ready`, `accepted`, `in_progress`, `new_order`, `served`). After Fix 1 renames to 2 groups, this block will crash. Update it to use the NEW `groups.in_progress` and `groups.served` keys instead."
**Verdict: Addressed.** The LLM has clear instructions to update the V8 block.

### P1-2: getOrderStatus удаление — CLOSED (with caveat)
Prompt says: "getOrderStatus() — DO NOT REMOVE. It is used in Tab Стол render (line ~788, OUT OF SCOPE). Update it to return only 2 labels."
**Caveat:** `getOrderStatus` is a PROP (line 53), not a local function. It cannot be "updated" inside CartView.jsx. See NEW-P2-1 below. The intent (don't remove it, keep call sites) is clear enough that the LLM should not break anything.
**Verdict: Addressed** — the critical concern (don't delete it) is covered.

### P1-3: Header total formula — CLOSED
Prompt Fix 2 now explicitly specifies:
- "N блюд: Sum of ALL item QUANTITIES across all sources"
- "X ₸: ordersSum + cartTotalAmount"
- "Must include ALL three sources: groups.served, groups.in_progress, AND cart"
**Verdict: Fully addressed** with formula and code example.

### P1-4: N заказа → N блюда — CLOSED
Prompt Fix 2 explicitly states: "Semantic change: «N заказа» → «N блюда»: Current header shows ORDER count (e.g. '3 заказа'). Fix 2 changes it to ITEM QUANTITY count (e.g. '4 блюда')."
**Verdict: Fully addressed** with grep targets and replacement code.

### P1-5: isSubmitting lines 729/733 — CLOSED
Prompt Fix 3 explicitly states: "isSubmitting relationship (lines 729, 733): isSubmitting prop is used for the close button (line ~729) and chevron (line ~733) — both are disabled while submitting. Keep these two usages of isSubmitting as-is. The new submitPhase state is ONLY for the CTA button render."
**Verdict: Fully addressed** with exact line numbers and clear scope.

**P1 Closure Summary: 5/5 CLOSED**

---

## Part 2: New Issues Found

### NEW-P1-1: `grep 'Сумма заказа' → 0` check conflicts with scope lock
**Lines:** 657, 794
**Problem:** The prompt's verification check says `grep 'Сумма заказа' → 0 matches`. But 'Сумма заказа' appears in TWO places:
1. Line 657 — inside `renderBucketOrders()` (IN SCOPE, should be changed by Fix 2)
2. Line 794 — inside Table Orders section / other guests (NOT in any Fix scope)

If the LLM follows the scope lock ("Fix ONLY what is asked"), line 794 stays → grep check fails.
If the LLM changes line 794 to pass the grep check → scope lock violation.

**Fix for prompt:** Change check to: `grep 'Сумма заказа' pages/PublicMenu/CartView.jsx | grep -v 'cart.order_total'` or explicitly note: "Line 794 (Table Orders section) is out of scope; grep check applies only to lines modified by Fix 1-2."

### NEW-P1-2: getSafeStatus label mapping is inaccurate in prompt
**Lines:** 275-310
**Problem:** Prompt says: "Update [getSafeStatus] to return 'Выдано' instead of 'Отправлено' for served/completed statuses."
But in actual code:
- 'Отправлено' = label for NEW status (lines 277, 288, 302)
- 'Подано' = label for served/completed (lines 294, 296, 297)

The prompt confuses which label maps to which status. The LLM needs to:
- Replace 'Подано' → 'Выдано' for served/completed
- Replace 'Отправлено' → 'В работе' for new/accepted/in_progress/ready
- Replace 'Готовится' → 'В работе'
- Replace 'Готов' → 'В работе'
- Replace 'Принят' → 'В работе'

But the prompt only mentions the 'Отправлено' → 'Выдано' mapping, which is wrong (those are different statuses).

**Risk:** Medium. The grep check `grep Отправлено → 0` provides a safety net. But the LLM might make incorrect mappings in the fallback table.

**Fix for prompt:** Replace the getSafeStatus instruction with:
```
Update getSafeStatus to return only 2 labels:
- served/completed/done → 'Выдано' (currently returns 'Подано')
- new/accepted/in_progress/ready/start/cook/cooking/finish → 'В работе' (currently returns 'Отправлено'/'Принят'/'Готовится'/'Готов')
This ensures grep 'Отправлено' → 0 AND grep 'Подано' → 0 (except comments).
```

### NEW-P2-1: getOrderStatus is a prop, prompt says "update it"
**Line:** 53
**Problem:** Prompt says "Update [getOrderStatus] to return only 2 labels." But `getOrderStatus` is destructured from props (line 53) — it's defined in x.jsx which is OUT OF SCOPE. Cannot be modified in CartView.jsx.
**Risk:** Low — the LLM likely won't find a local definition to modify and will just skip it. The critical part (don't remove it) is clear.
**Fix for prompt:** Change to: "getOrderStatus is a PROP — do NOT modify or remove it. Its output is consumed by getSafeStatus which WILL be updated (see above). All existing call sites (line 788) remain intact."

### NEW-P2-2: Footer motivation text not explicitly addressed
**Lines:** 1117-1125
**Problem:** Prompt says "footer = only CTA" and "Keep ONLY the CTA button." The footer currently contains a loyalty motivation text (`cart.motivation_bonus`, lines 1117-1125) ABOVE the CTA. The prompt doesn't explicitly mention removing it.
**Risk:** Low — "Keep ONLY the CTA button" is clear enough. But an explicit grep target would help:
**Fix for prompt:** Add to Fix 2: "Grep: `motivation_bonus` → remove motivation text from footer (stays in cart group if needed by Fix 5)."

### NEW-P2-3: useEffect auto-collapse (lines 103-113) not explicitly addressed
**Lines:** 103-113
**Problem:** Current useEffect collapses 4 bucket keys (`served`, `ready`, `in_progress`, `accepted`) when cart.length > 0. After Fix 1 reduces to 2 groups, this effect references non-existent keys. Fix 4 describes a NEW structural change detection mechanism but doesn't say "delete the old useEffect at line 103-113."
**Risk:** Low — the LLM should figure out the old effect is replaced. But an explicit note helps.
**Fix for prompt:** Add to Fix 4: "Delete the existing auto-collapse useEffect at lines 103-113 (references old 5-bucket keys). Replace with the structural change detection below."

### NEW-P2-4: `bucketDisplayNames` (lines 492-498) not explicitly targeted for removal
**Lines:** 492-498
**Problem:** The 5-label `bucketDisplayNames` map is used at lines 876 and 952. After Fix 1, this needs to become a 2-label map. The prompt mentions removing old labels but doesn't explicitly mention `bucketDisplayNames`.
**Risk:** Low — grep checks for 'Отправлено' will catch line 497. But the LLM needs to know to change the entire map, not just one value.
**Fix for prompt:** Add to Fix 1: "Grep: `bucketDisplayNames` → replace 5-label map with 2 labels: `{ served: tr('cart.group.served', 'Выдано'), in_progress: tr('cart.group.in_progress', 'В работе') }`."

### NEW-P2-5: Stepper touch targets undersized
**Lines:** 1027-1041
**Problem:** Stepper buttons are `w-8 h-8` (32x32px). The prompt's regression check says "Stepper buttons in cart: >= 44x44px" but no Fix explicitly addresses this.
**Risk:** Low — this is existing code, not introduced by the redesign.
**Fix for prompt:** Either add a minor Fix or note as a known gap: "Stepper buttons are 32px (existing). Touch target expansion is deferred to a separate task."

### NEW-P3-1: Cart dividers vs CV-29
**Line:** 1018
**Problem:** Cart items use `border-b last:border-0` creating horizontal dividers. Fix 1 says "NO horizontal dividers between items (CV-29)." But this refers to ordered items, and the cart section might intentionally keep dividers between cart items (they have steppers).
**Risk:** Very low — cosmetic, and dividers between cart items may be intentional.

### NEW-P3-2: Comments referencing old names
**Lines:** 94, 102, 866, 954
**Problem:** Comments like `// Подано`, `// CV-32: Auto-collapse "Подано"` will remain after rename. Cosmetic only.

---

## Part 3: Verdict

### P1 Closures: 5/5 CLOSED

### New Issues Summary
| ID | Priority | Title | Risk to KС |
|---|---|---|---|
| NEW-P1-1 | P1 | grep 'Сумма заказа' check conflicts with scope lock | Medium — LLM will hit contradictory instructions |
| NEW-P1-2 | P1 | getSafeStatus label mapping inaccurate | Medium — wrong label→status mapping in prompt text |
| NEW-P2-1 | P2 | getOrderStatus is a prop, can't be "updated" | Low — LLM likely skips |
| NEW-P2-2 | P2 | Footer motivation text not explicitly addressed | Low — inferrable from "only CTA" |
| NEW-P2-3 | P2 | Old auto-collapse useEffect not explicitly deleted | Low — inferrable |
| NEW-P2-4 | P2 | bucketDisplayNames not explicitly targeted | Low — grep catches it |
| NEW-P2-5 | P2 | Stepper touch targets 32px vs 44px requirement | Low — existing code |
| NEW-P3-1 | P3 | Cart dividers vs CV-29 | Very low |
| NEW-P3-2 | P3 | Comments with old names | Cosmetic |

### Ready for КС?
**NO — 2 P1 issues remain.** Apply P1 fixes to prompt, then ready for C5v2 $18 KС.

**Recommended prompt patches:**
1. Fix grep check: note line 794 is out of scope, or change to: `grep -c 'Сумма заказа' ... # expected: 1 (line 794 Table Orders, out of scope)`
2. Fix getSafeStatus instruction: explicitly list all label changes ('Подано' → 'Выдано', 'Отправлено'/'Принят'/'Готовится'/'Готов' → 'В работе')
3. (Optional P2) Clarify getOrderStatus is a prop, not updatable
4. (Optional P2) Add explicit mention of motivation_bonus removal from footer
5. (Optional P2) Add explicit deletion of old useEffect at 103-113
6. (Optional P2) Add explicit bucketDisplayNames target

After applying patches 1-2: prompt is ready for КС.
