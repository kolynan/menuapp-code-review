# CC Reviewer Findings — PSSK Prompt Quality Review
Chain: publicmenu-260413-190133-11ce

## Issues Found

### 1. [CRITICAL] Fix 1 renames `statusBuckets` but frozen rating code depends on it (~15 usages)

The prompt instructs to replace the 5-bucket `statusBuckets` useMemo with a 2-group `groups` variable. But `statusBuckets` is referenced in **at least 15 places** throughout the file, including deep inside rating logic that is explicitly marked **OUT OF SCOPE** (States C/C2/C3/D):
- Line 503: `statusBuckets.served.length === 0` (CV-04 allServedRated)
- Line 504: `statusBuckets.served.every(...)` (CV-04)
- Line 512: `[statusBuckets.served, ...]` dependency array
- Line 522: `statusBuckets.served.forEach(...)` (CV-36 unrated count)
- Line 530, 535, 543: more rating useMemos
- Lines 850-854: `statusBuckets.accepted.length === 0 && statusBuckets.in_progress.length === 0 && statusBuckets.ready.length === 0 && statusBuckets.new_order.length === 0` (isV8 check for served-only state)
- Lines 876, 923, 935, 937: render sections

**The prompt doesn't enumerate these usages or explain how to handle the rename.** If the executor renames `statusBuckets` to `groups`, all frozen rating code breaks. If they keep `statusBuckets` as-is for rating code, they need TWO computed variables — the prompt doesn't address this.

PROMPT FIX: Either (a) keep the variable name `statusBuckets` and just change the bucket keys (merge `ready/in_progress/accepted/new_order` into `in_progress`), or (b) explicitly list ALL ~15 references that need updating and clarify that rating code references MUST be updated purely mechanically (rename only, no logic change). Option (a) is safer.

### 2. [CRITICAL] Fix 1 "Отправлено" count is wrong — 5 occurrences, not 4

Prompt says "4 matches to delete" for `Отправлено`. Actual grep shows **5 matches**:
- Line 98: `new_order: true, // Отправлено` (comment in `expandedStatuses` initial state)
- Line 277: `tr('status.sent', 'Отправлено')` in getOrderStatus switch
- Line 288: `'new': tr('status.sent', 'Отправлено')` in fallbacks map
- Line 302: `fallbacks[code] || tr('status.sent', 'Отправлено')` default
- Line 497: `new_order: 'Отправлено'` in bucketDisplayNames

The prompt lists only 4 (lines 277, 288, 302, 497) and misses the comment at line 98. The verification "Grep Отправлено → 0 matches" will **FAIL** unless the executor also removes/updates the comment.

PROMPT FIX: List all 5 occurrences explicitly. Add line 98 comment to the removal list.

### 3. [CRITICAL] Fix 1 doesn't address `bucketDisplayNames` transition

The prompt mentions removing the 5-label map but doesn't provide a replacement. `bucketDisplayNames` (line 492-498) has 5 entries: `served`, `ready`, `in_progress`, `accepted`, `new_order`. The render code at lines 876 and 952 reads `bucketDisplayNames[key]`. After collapsing to 2 groups, this object needs exactly 2 entries with i18n `tr()` calls matching the new group names ("В работе", "Выдано"). The prompt shows i18n keys (`cart.group.served`, `cart.group.in_progress`) in the Implementation Notes but never connects them to `bucketDisplayNames`.

PROMPT FIX: Add explicit code snippet for the new `bucketDisplayNames` (or `groupDisplayNames`):
```javascript
const groupDisplayNames = {
  served: tr('cart.group.served', 'Выдано'),
  in_progress: tr('cart.group.in_progress', 'В работе'),
};
```

### 4. [MEDIUM] Fix 4 auto-collapse condition `prev.served !== undefined` always true

The prompt's suggested code:
```javascript
setExpandedStatuses(prev => ({
  ...prev,
  served: prev.served !== undefined ? prev.served : !otherGroupsExist
}));
```
But `expandedStatuses` is initialized at line 93-98 with `served: false` — it's **always defined**. So `prev.served !== undefined` is always `true`, and the auto-set `!otherGroupsExist` never executes. The fix is a no-op.

PROMPT FIX: Change the condition. Use a separate `isFirstRender` ref, or detect structural group changes (e.g., `prevGroupKeys !== currentGroupKeys`). Example:
```javascript
// Track previous group structure, auto-set only when groups change
served: groupsChanged ? !otherGroupsExist : prev.served
```

### 5. [MEDIUM] Fix 5 references `loyaltyPoints` variable — doesn't exist in file

Prompt says: `+{loyaltyPoints} бонусов`. But `loyaltyPoints` is **not a variable** in CartView.jsx. The actual related variables are:
- `earnedPoints` (prop, line 39) — points already earned
- `reviewRewardPoints` (computed) — points for leaving a review
- `motivationPoints` (line 1119) — computed as `cartTotalAmount * loyalty_points_per_currency`

The prompt doesn't specify which variable to use for "bonus hint in cart group" or how to compute it. Most likely it should be `motivationPoints` (what you'll earn for this order), but that's computed deep in the render function (line 1119), not available at the group render level.

PROMPT FIX: Specify the exact variable name and where to compute it. If it's `motivationPoints`, extract the computation to a useMemo near the other derived values and reference it by name. Provide the formula explicitly.

### 6. [MEDIUM] Fix 2 verification for "К отправке" — already 0 matches, useless check

The prompt's verification step says: `Grep 'К отправке' → 0 matches`. But the current file already has **0 matches** for this string. The check passes trivially before any changes are made, providing zero regression detection value.

PROMPT FIX: Either remove this check (it's noise) or replace with a more meaningful check, e.g., verify footer contains ONLY the CTA button div — `grep -c "sticky.*footer" CartView.jsx` to ensure footer structure is correct.

### 7. [MEDIUM] Fix 1 render section is too vague — "Replace render: 3 groups in order"

The current render section (lines ~840-980) is complex with conditional logic for served bucket (isV8 check at line 850), rating mode toggles, and per-bucket iteration (line 935). The prompt says "Replace render: 3 groups in order: Выдано → В работе → В корзине" but doesn't provide the JSX structure or explain which existing render blocks to replace vs. preserve.

Lines 840-980 include: served bucket special render (with rating chip, star ratings), generic bucket iteration loop, and the current new-order section. The executor needs to know:
- Does the served-group special render (lines 850-930) stay as a special case, or merge into the generic loop?
- The generic loop (line 935) iterates `['ready', 'in_progress', 'accepted', 'new_order']` — what replaces this?
- Where does "В корзине" render? It's currently the cart items section which exists elsewhere in the file.

PROMPT FIX: Provide a high-level JSX skeleton for the new render section showing the 3-group structure with clear markers for which existing blocks to preserve vs. delete.

### 8. [MEDIUM] Fix 3 success detection via `isSubmitting` prop is fragile

The prompt suggests detecting submit success by watching `isSubmitting` go from `true` to `false`:
```javascript
// useEffect watching isSubmitting: false + submitPhase === 'submitting' → setSubmitPhase('success')
```

This assumes `isSubmitting` transitions cleanly true→false on success. But:
- If submit fails, `isSubmitting` also goes false — can't distinguish success from failure
- `submitError` (line 48) exists as a prop — the prompt should use it: success = `isSubmitting` went false AND `submitError` is null/unchanged

PROMPT FIX: Add error-awareness to the success detection:
```javascript
useEffect(() => {
  if (!isSubmitting && submitPhase === 'submitting' && !submitError) {
    setSubmitPhase('success');
    setTimeout(() => setSubmitPhase('idle'), 1500);
  } else if (!isSubmitting && submitPhase === 'submitting' && submitError) {
    setSubmitPhase('idle'); // failed, revert
  }
}, [isSubmitting, submitError, submitPhase]);
```

### 9. [MEDIUM] FROZEN grep verification: `ИТОГО` appears in comment at line 416

The prompt's mandatory verification says `grep -n "ИТОГО" CartView.jsx → should return 0`. But line 416 is a comment: `// ===== CV-02: Orders sum for drawer header (replaces ИТОГО ЗА ВИЗИТ) =====`. This is not user-facing text, but the grep check will report a match unless the executor also modifies the comment — which violates F4 (fix only what is asked) and scope lock.

PROMPT FIX: Change the grep check to exclude comments: `grep -n "ИТОГО" CartView.jsx | grep -v "^.*\/\/"` or acknowledge that this comment is acceptable and adjust the expected result.

### 10. [LOW] Fix 7 references CSS classes from HTML mockup, not actual JSX

The prompt uses `header-line1`, `header-line2` from the HTML mockup reference. The actual CartView.jsx uses Tailwind classes, not these CSS class names. The prompt should reference actual JSX variable names (`tableLabel`, `ordersSum`, `getGuestDisplayName`) and the actual JSX structure, not mockup class names.

PROMPT FIX: Replace HTML mockup references in Fix 7 with actual variable names and approximate line numbers where the header is rendered (around lines 700-720).

### 11. [LOW] D12 "comment out with `// reserved — hook order`" creates dead code permanently

The Implementation Notes say: "If useState/useMemo hooks become dead → comment out with `// reserved — hook order`, do NOT delete." This is correct for React hook ordering safety, but the prompt doesn't specify WHICH hooks might become dead after removing 5-bucket logic. The executor needs guidance on which specific hooks to preserve. Key candidates:
- `expandedStatuses` initial keys for `ready`, `in_progress`, `accepted`, `new_order` (lines 95-98)
- `bucketDisplayNames` entries for removed buckets

PROMPT FIX: List specific hooks/state that might become dead and confirm whether they should be commented out or legitimately removed.

---

## Line Number Verification

| Reference | Prompt says | Actual | Status |
|-----------|------------|--------|--------|
| `const buckets = { served` | (no line#) | Line 403 | ✅ Match |
| `Отправлено` occurrences | 4 matches | 5 matches (+ line 98 comment) | ❌ Count wrong |
| `statusBuckets` | (no line#) | Line 402 (useMemo), 15+ refs | ✅ Exists, but scope understated |
| `isSubmitting` prop | (no line#) | Line 47 (prop destructure) | ✅ |
| `handleSubmitOrder` prop | (no line#) | Line 50 (prop destructure) | ✅ |
| `expandedStatuses` state | (no line#) | Line 93 | ✅ |
| `infoModal` state | (no line#) | Line 124 | ✅ |
| `splitType` in props | (no line#) | Line 32 (prop only, no UI) | ✅ Prompt correct |
| `earnedPoints` prop | (no line#) | Line 39 | ✅ |
| `loyaltyPoints` variable | Referenced in Fix 5 | Does NOT exist | ❌ Wrong variable name |
| `Сумма заказа` | (no line#) | Lines 657, 794 | ✅ |
| `К отправке` | (no line#) | 0 matches | ⚠️ Already absent |
| `ИТОГО` | Should be 0 | Line 416 (comment) | ⚠️ Comment match |
| `const tr =` | (no line#) | Line 257 | ✅ |
| `totalQty > 1` | (no line#) | Line 583 | ✅ |
| `bucketDisplayNames` | (no line#) | Line 492 | ✅ But transition not specified |
| `cartGrandTotal` | (no line#) | Line 348 | ✅ |
| `submitError` | (no line#) | Line 48 (prop) + lines 1060-1144 | ✅ |
| `getOrderStatus` | (no line#) | Lines 53, 788 | ✅ |
| `isRatingMode` | frozen check | Line 119 + many refs | ✅ Exists |
| `handleUpdateGuestName` | frozen check | Line 25 + lines 695, 699 | ✅ Exists |
| `ordersSum` | (no line#) | Line 417 | ✅ |

---

## Fix-by-Fix Analysis

### Fix 1 — 5-status to 2-group: RISKY
- Core concept is sound but execution is dangerously underspecified
- `statusBuckets` rename impacts ~15 call sites including frozen rating code
- `bucketDisplayNames` replacement not provided
- Render section replacement is vague for a 140-line block
- `Отправлено` count is wrong (5 not 4)
- This is the highest-risk fix — an LLM might lose code during the massive restructure

### Fix 2 — Money to header only: SAFE
- Clear what to remove (footer summary, bucket subtotals)
- `ordersSum` already exists in header — just needs formula update to include cart
- One issue: `К отправке` grep check is vacuous (already 0)
- `Сумма заказа` locations clearly identifiable (lines 657, 794)

### Fix 3 — Submit-feedback A2: RISKY
- New `useState` hook placement is correctly specified (after `infoModal`)
- Success detection via `isSubmitting` is fragile — no error-path handling
- The CTA render ternary chain is clear
- Double-tap protection not specified (only mentioned in verification)

### Fix 4 — Выдано auto-collapse: RISKY
- Suggested code is a no-op due to `prev.served !== undefined` always being true
- CV-25/CV-47 polling constraint is mentioned but implementation is vague

### Fix 5 — Remove "Для кого заказ", add bonuses: RISKY
- `splitType` assessment is correct (prop only, no UI)
- `loyaltyPoints` variable doesn't exist — executor will be stuck
- Bonus computation source not specified

### Fix 6 — Qty display: SAFE
- Clear, minimal change
- Verification is straightforward
- Low risk

### Fix 7 — Compact header: SAFE
- Conceptually simple — merge 2 lines into 1
- References mockup CSS classes instead of actual JSX, but intent is clear
- Actual variables (`tableLabel`, `getGuestDisplayName`, `ordersSum`) exist

---

## Summary
Total: 11 issues (3 CRITICAL, 6 MEDIUM, 2 LOW)

## Prompt Clarity (MANDATORY)
- **Overall clarity: 3/5**
- **What was most clear:** The UX wireframes (БЫЛО/ДОЛЖНО БЫТЬ), the scope lock, the frozen UX list, i18n conventions, and the mockup-vs-v6.0 override table are excellent. Fix 2, 6, 7 are well-specified. The grep-based verification approach is practical.
- **What was ambiguous or could cause hesitation:**
  - Fix 1 is the core architectural change but the most underspecified — how to handle the `statusBuckets` rename across 15+ references (especially in frozen rating code) is not addressed
  - Fix 4's auto-collapse logic is mathematically a no-op
  - Fix 5's `loyaltyPoints` variable doesn't exist, executor will search and fail
  - Fix 3's success/error distinction not handled
- **Missing context:**
  - The render section structure (lines 840-980) needs a JSX skeleton showing the target layout
  - A dependency order between fixes would help: Fix 1 must come first (it creates the group structure), then Fix 2 (updates header formula), then Fix 4 (depends on group structure), then Fix 3 (independent)
  - Which React hooks become dead after Fix 1 and need the `// reserved` treatment
  - The interaction between `isV8` check (lines 850-854) and the new 2-group model — isV8 checks for empty accepted/in_progress/ready/new_order which no longer exist as separate buckets
