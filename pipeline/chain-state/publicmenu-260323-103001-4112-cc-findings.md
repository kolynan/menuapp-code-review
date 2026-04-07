# CC Writer Findings — PublicMenu
Chain: publicmenu-260323-103001-4112

## Findings

### 1. [P1] Fix 1 — PM-070: Partner lookup masks backend errors as "not found"

**Location:** `x.jsx` lines 1324–1349 (queryFn), line 3042 (error UI)

**Problem:** The partner `useQuery` at line 1324 only destructures `{ data: partner, isLoading: loadingPartner }` — it does NOT capture `error` or `isError`. Inside the `queryFn`, both `catch` blocks silently swallow exceptions: the first catch falls through to the second lookup, and the second catch (line 1344–1346) returns `null`. This means react-query never sees an error — both "backend down" and "partner genuinely not found" produce `partner === null`, which renders the same "Ресторан не найден" UI at line 3046. The user has no retry option for transient network failures.

**FIX:**
1. In the `queryFn` (lines 1328–1348): Instead of catching and returning `null` in the second catch, let the exception propagate (remove `return null` from the second catch, or re-throw). This way react-query will set `error`/`isError` when BOTH lookups fail due to network/backend issues. If the first lookup succeeds with empty array and the second also returns empty → return `null` (genuine not-found).
2. Destructure `error: partnerError` and `refetch: refetchPartner` from the `useQuery` at line 1324.
3. At line 3042, BEFORE the `if (!partner)` block, add a new block:
```jsx
if (partnerError) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-md text-center p-6">
        <AlertCircle className="w-12 h-12 text-orange-400 mx-auto mb-4" />
        <p className="text-slate-700 font-medium mb-2">{t('error.network_error')}</p>
        <p className="text-slate-500 text-sm mb-4">{t('error.check_connection')}</p>
        <Button variant="outline" className="min-h-[44px]" onClick={() => refetchPartner()}>
          <RefreshCw className="w-4 h-4 mr-2" />
          {t('common.retry')}
        </Button>
      </Card>
    </div>
  );
}
```
4. Add i18n keys: `error.network_error` = "Не удалось загрузить меню", `error.check_connection` = "Проверьте соединение и попробуйте снова", `common.retry` = "Повторить".
5. Revised `queryFn` logic:
```jsx
queryFn: async () => {
  const p = partnerParamRaw;
  if (!p) return null;
  const byIdFirst = looksLikePartnerId(p);
  // First lookup
  try {
    const res = await base44.entities.Partner.filter(byIdFirst ? { id: p } : { slug: p });
    if (res?.[0]) return res[0];
  } catch (e) {
    // First lookup failed, try fallback
  }
  // Fallback lookup — let errors propagate so react-query marks as error
  const res2 = await base44.entities.Partner.filter(byIdFirst ? { slug: p } : { id: p });
  return res2?.[0] || null;
},
```
This way: if both lookups fail with exceptions → react-query sets `partnerError`. If lookups succeed but return empty → `partner === null` → "not found" UI.

---

### 2. [P1] Fix 2 — PM-074: OrderStatusScreen masks backend fetch errors as "not found"

**Location:** `x.jsx` line 1033

**Problem:** The condition `if (orderError || !order)` at line 1033 combines two distinct failure cases into one UI block. When `orderError` is set (network/backend failure during fetch), the user sees "order_status.not_found" message with no retry option. When `!order` (query succeeded but returned null — invalid token), the same UI appears. These should be separate paths.

**FIX:**
Split line 1033 into two separate `if` blocks:

```jsx
// Network/backend error — retryable
if (orderError) {
  return (
    <div className="fixed inset-0 z-[60] overflow-y-auto" style={{backgroundColor:'#faf9f7'}}>
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <AlertCircle className="w-12 h-12 text-orange-400 mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-slate-800 mb-2">{t("error.network_error")}</h2>
            <p className="text-sm text-slate-500 mb-4">{t("error.check_connection")}</p>
            <Button variant="outline" className="min-h-[44px]" onClick={() => refetchOrder()}>
              <RefreshCw className="w-4 h-4 mr-2" />
              {t("common.retry")}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Genuine not found — token invalid
if (!order) {
  return (
    <div className="fixed inset-0 z-[60] overflow-y-auto" style={{backgroundColor:'#faf9f7'}}>
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <XCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-slate-800 mb-2">{t("order_status.not_found")}</h2>
            <p className="text-sm text-slate-500 mb-4">{t("order_status.check_link")}</p>
            <Button variant="outline" className="min-h-[44px]" onClick={onBackToMenu}>{t("order_status.back_to_menu")}</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
```

Note: `refetchOrder` is already destructured at line 895. The retry UI reuses `error.network_error` and `error.check_connection` keys from Fix 1. `AlertCircle` and `RefreshCw` are already imported.

---

### 3. [P2] Fix 3 — PM-073: normalizeId consistency in guest restore vs create paths

**Location:** `x.jsx` lines 2756 and 2776

**Problem:** The task description warns about inconsistency between the restore path (line 2756: `normalizeId(guest)`) and the create path (line 2776: `String(guest?.id ?? guest?._id ?? "")`). After analysis: `normalizeId` is defined at line 2686 as `(g) => String(g?.id ?? g?._id ?? "")` — which IS identical to the inline pattern at line 2776. **However**, `normalizeId` is scoped inside the `if (!guest)` try block (lines 2684–2769), and line 2756 is inside the same block, so it works. The real concern is maintainability: if `normalizeId` is ever changed without updating line 2776 (or vice versa), they'll diverge silently.

**FIX:**
Replace the inline pattern at line 2776 with `normalizeId(guest)` to use the same function. But since `normalizeId` is scoped inside the `if (!guest)` try block and line 2776 is OUTSIDE that block (it's in the subsequent `if (!guest)` block at line 2773), `normalizeId` is not accessible there.

Two options:
- **Option A (recommended):** Move the `normalizeId` definition to just before line 2682 (before the `let guest = currentGuest;` line), making it accessible to both blocks.
- **Option B:** Replace line 2756 with the inline pattern to match line 2776. Less DRY but simpler change.

Recommend Option A:
```jsx
// Move normalizeId BEFORE guest variable
const normalizeId = (g) => String(g?.id ?? g?._id ?? "");
let guest = currentGuest;
```
Then at line 2776, replace `String(guest?.id ?? guest?._id ?? "")` with `normalizeId(guest)`.

---

### 4. [P2] Fix 4 — PM-069: BS table code: no auto-clear after wrong code + no lockout countdown

**Location:** `x.jsx` lines 3456–3458 (error display), lines 3418–3448 (code input cells)

**Problem:**
- **Part A:** When user enters a wrong table code, `codeVerificationError` becomes truthy and is displayed at line 3457, but the 4-digit input is NOT cleared. User must manually delete digits before retyping.
- **Part B:** No `codeAttempts` or `codeLockedUntil` state exists in x.jsx. These would need to come from `useHallTable` hook (imported from external file at line 111). Since `useHallTable` doesn't expose attempt count or lockout state (only `codeVerificationError` is exposed per line 1521), implementing lockout countdown in x.jsx would require modifying the hook — which is OUT OF SCOPE (scope lock: only x.jsx).

**FIX Part A (auto-clear on wrong code):**
Add a `useEffect` that watches `codeVerificationError`. When it becomes truthy, clear the input after 500ms:

```jsx
// Auto-clear code input after wrong code (PM-069)
useEffect(() => {
  if (!codeVerificationError) return;
  const timer = setTimeout(() => {
    if (typeof setTableCodeInput === 'function') setTableCodeInput('');
  }, 500);
  return () => clearTimeout(timer);
}, [codeVerificationError, setTableCodeInput]);
```

Place this after line 1523 (after `useHallTable` destructuring).

**FIX Part B: SKIPPED.**
Reason: `codeAttempts` and `codeLockedUntil` state lives inside `useHallTable` hook (external import at line 111: `@/components/publicMenu/refactor/hooks/useHallTable`). The hook does not expose these values. Adding lockout countdown UI requires either: (a) modifying useHallTable to expose attempt state — violates scope lock, or (b) duplicating attempt tracking in x.jsx — creates state duplication. Neither is acceptable within this task scope. Recommend separate task to add lockout UI to useHallTable hook.

---

### 5. [P2] Fix 5 — PM-075: Auto-submit setTimeout without cleanup causes stale submit

**Location:** `x.jsx` lines 2096–2103

**Problem:** At line 2101, `setTimeout(() => handleSubmitOrder(), 100)` is called inside a `useEffect` but the timeout ID is not stored in a ref and not cleaned up on unmount/re-render. If the component unmounts or re-renders within 100ms, `handleSubmitOrder` fires on stale state — potential double-submit or error on unmounted component.

**FIX:**
1. Add a ref declaration near other refs (around line 1437 area):
```jsx
const autoSubmitTimerRef = useRef(null);
```
2. Replace lines 2096–2103 with:
```jsx
useEffect(() => {
  if (pendingSubmitRef.current && isTableVerified && currentTableId) {
    pendingSubmitRef.current = false;
    setShowTableConfirmSheet(false);
    // Clear any previous timer
    if (autoSubmitTimerRef.current) clearTimeout(autoSubmitTimerRef.current);
    // Slight delay to let state propagate
    autoSubmitTimerRef.current = setTimeout(() => handleSubmitOrder(), 100);
  }
  return () => {
    if (autoSubmitTimerRef.current) clearTimeout(autoSubmitTimerRef.current);
  };
}, [isTableVerified, currentTableId]);
```

---

## Summary
Total: 5 findings (0 P0, 2 P1, 3 P2, 0 P3)

- Fix 1 (PM-070) — P1: Partner query swallows all errors → add error state + retry UI
- Fix 2 (PM-074) — P1: Order status combines error+not-found → split into two if blocks
- Fix 3 (PM-073) — P2: normalizeId scoping makes both paths identical but fragile → hoist function
- Fix 4 (PM-069) — P2: Auto-clear input after wrong code (Part A); lockout countdown SKIPPED (Part B)
- Fix 5 (PM-075) — P2: Store setTimeout in ref + cleanup on unmount

## ⛔ Prompt Clarity
- Overall clarity: **4/5**
- Ambiguous Fix descriptions:
  - Fix 3: Description implied `normalizeId` might NOT handle `_id` fallback, but actual code at line 2686 shows it does. The real issue is scoping/maintainability, not a functional bug. Slightly misleading framing.
  - Fix 4: Unclear whether Part B is expected to be implemented or is acceptable as SKIPPED. The description says "If Part B is too complex — implement Part A only and note Part B as SKIPPED" which is helpful, but the assessment of "too complex" depends on whether modifying useHallTable is in scope (it's not per scope lock).
- Missing context: Line numbers were accurate (within ±5 lines), which was very helpful. No significant missing context.
- Scope questions: Fix 4 Part B touches useHallTable hook (external file) — confirmed out of scope per scope lock. No other scope ambiguity.
