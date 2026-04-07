# CC Writer Findings — PublicMenu
Chain: publicmenu-260323-112857-466b

## Findings

### Fix 1 — PM-070 (P1): Partner lookup masks backend errors as "not found"

**Current code** (lines 1324–1349): `useQuery` with `queryKey: ["publicPartner"]` has two try/catch blocks. The first catch silently swallows the error and falls through. The second catch returns `null`. In both cases, a backend/network error produces `partner = null`, which triggers the `if (!partner)` guard at line 3064, showing `t('error.partner_not_found')` — indistinguishable from a genuine "partner doesn't exist" response.

**Key observation:** React Query's `useQuery` does NOT set its own `error` state when the `queryFn` catches internally and returns `null`. The error is swallowed silently. So the fix must be inside the `queryFn` — we need to distinguish "both lookups returned empty results" from "both lookups threw exceptions".

**FIX:** Add a `partnerFetchError` state (`useState(false)`). Inside the `queryFn`:
- After the first try/catch, if it caught, set a local flag `firstFailed = true`.
- In the second catch block, if `firstFailed` is also true → both calls failed → this is a network error. Throw the error (or set state before returning null) so it can be detected.
- Better approach: let the second catch re-throw: `throw e;` — this will cause React Query to set its `error` property. Then destructure `error: partnerError` from useQuery and use it in the guard:

At line 1324, destructure `error: partnerError, refetch: refetchPartner` from useQuery.

At line 1337 (first catch): track that first lookup failed: `let primaryFailed = false;` before the first try, set `primaryFailed = true` in catch.

At line 1344–1346 (second catch): if `primaryFailed` is true, re-throw: `if (primaryFailed) throw e; return null;`. If primary succeeded but returned no result, and secondary throws — we should also throw since we have no data.

Actually simpler: second catch should always re-throw. Currently it returns null, but if the second lookup THREW, we have no partner data due to an error, not because the partner doesn't exist. The only "not found" case is when both lookups SUCCEED but return empty arrays.

**Revised FIX for queryFn (lines 1334–1347):**
```
try {
  const res = await base44.entities.Partner.filter(byIdFirst ? { id: p } : { slug: p });
  if (res?.[0]) return res[0];
} catch (e) {
  // Primary lookup failed — try fallback
}

// Fallback lookup — let errors propagate to React Query
const res2 = await base44.entities.Partner.filter(byIdFirst ? { slug: p } : { id: p });
return res2?.[0] || null;
```

Remove the second try/catch entirely. If fallback throws, React Query sets `error`. If fallback succeeds with empty array, returns `null` (genuine not-found).

**Guard change at lines 3064–3072:**
Split into two blocks:
```jsx
if (partnerError) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-md text-center p-6">
        <p className="text-slate-500">{t('error.network_error')}</p>
        <p className="text-sm text-slate-400 mt-2">{t('error.check_connection')}</p>
        <Button variant="outline" className="mt-4 min-h-[44px]" onClick={() => refetchPartner()}>
          {t('common.retry')}
        </Button>
      </Card>
    </div>
  );
}

if (!partner) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-md text-center p-6">
        <p className="text-slate-500">{t('error.partner_not_found')}</p>
      </Card>
    </div>
  );
}
```

**i18n keys needed:** `error.network_error`, `error.check_connection`, `common.retry` — verify they exist in the translations object at top of file.

---

### Fix 2 — PM-074 (P1): OrderStatusScreen masks backend fetch errors as "not found"

**Current code** (line 1033): `if (orderError || !order)` renders identical "not found" UI for both cases. `orderError` is already destructured from useQuery at line 894 and `refetchOrder` at line 895 — so React Query error state IS available.

**FIX:** Split line 1033 into two separate conditions:

```jsx
// Network/backend error — retryable
if (orderError) {
  return (
    <div className="fixed inset-0 z-[60] overflow-y-auto" style={{backgroundColor:'#faf9f7'}}>
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <XCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-slate-800 mb-2">{t("error.network_error")}</h2>
            <p className="text-sm text-slate-500 mb-4">{t("error.check_connection")}</p>
            <Button variant="outline" className="min-h-[44px]" onClick={() => refetchOrder()}>
              {t("common.retry")}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Order genuinely not found (query succeeded, returned null)
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

**Note:** `refetchOrder` is already destructured at line 895 — no new imports needed.

---

### Fix 3 — PM-073 (P2): normalizeId is consistent — NO BUG, but scope issue exists

**Analysis:** At line 2708, `normalizeId` is defined as:
```js
const normalizeId = (g) => String(g?.id ?? g?._id ?? "");
```
At line 2798 (create-new-guest path):
```js
const gid = String(guest?.id ?? guest?._id ?? "");
```

These are **identical logic**. However, `normalizeId` is defined INSIDE a `try` block starting at line 2707, scoped to the "restore guest" path. It's NOT available in the "create new guest" path at line 2795+.

The real issue is **scope**: `normalizeId` at line 2708 is a block-scoped `const` inside the `if (!guest) { try { ... } }` block. It's used at line 2778 and 2786 within that block. The create-guest path at 2798 is OUTSIDE that block and uses inline `String(guest?.id ?? guest?._id ?? "")` — which is identical but not using the helper.

**FIX:** For consistency and to prevent future drift, move `normalizeId` definition BEFORE the `if (!guest)` block (around line 2705), so both paths can use it:

Move line 2708 (`const normalizeId = ...`) to just before line 2706 (before `if (!guest)`):
```js
const normalizeId = (g) => String(g?.id ?? g?._id ?? "");
if (!guest) {
```

Then at line 2798, replace inline expression with `normalizeId(guest)`:
```js
const gid = normalizeId(guest);
```

This ensures both paths use the same function and prevents future drift if the normalization logic changes.

---

### Fix 4 — PM-069 (P2): BS table code — no auto-clear after wrong code, no lockout UI

**Analysis of current code:**
- `codeVerificationError` and `setTableCodeInput` come from `useHallTable` hook (external, line 1523).
- The BS renders at lines ~3438–3510. When wrong code is entered, `codeVerificationError` is displayed (line 3479–3481) but the input is NOT cleared.
- No `codeAttempts` or `codeLockedUntil` variables found in x.jsx — these don't exist in the current scope.

**Part A — Auto-clear on wrong code:**
The `codeVerificationError` is set by `useHallTable` externally. When it becomes truthy, we need to clear input after 500ms.

**FIX (Part A):** Add a `useEffect` in x.jsx that watches `codeVerificationError`:
```jsx
// Auto-clear code input after wrong entry (PM-069)
useEffect(() => {
  if (codeVerificationError && !isVerifyingCode) {
    const timer = setTimeout(() => {
      if (typeof setTableCodeInput === 'function') setTableCodeInput('');
    }, 500);
    return () => clearTimeout(timer);
  }
}, [codeVerificationError, isVerifyingCode]);
```

Place this after the `useHallTable` destructuring (~line 1524).

**Part B — Lockout countdown:** SKIPPED.
`codeAttempts` and `codeLockedUntil` state lives inside `useHallTable` hook (external file `@/components/publicMenu/refactor/hooks/useHallTable`). Surfacing it requires modifying the hook to expose these values, but the scope restriction says "modify ONLY x.jsx". Without access to attempt count, lockout countdown UI cannot be implemented here.

**Recommendation for Part B:** Add `codeAttempts` and `codeLockedUntil` to `useHallTable` return values (requires separate task modifying the hook file), then display countdown in x.jsx.

---

### Fix 5 — PM-075 (P2): Auto-submit setTimeout without cleanup

**Current code** (lines 2096–2103):
```jsx
useEffect(() => {
  if (pendingSubmitRef.current && isTableVerified && currentTableId) {
    pendingSubmitRef.current = false;
    setShowTableConfirmSheet(false);
    setTimeout(() => handleSubmitOrder(), 100);
  }
}, [isTableVerified, currentTableId]);
```

The `setTimeout` return value is not captured. No cleanup on unmount. Classic React anti-pattern.

**FIX:**
1. Add a ref (near other refs in the component): `const autoSubmitTimerRef = useRef(null);`
2. Modify the useEffect:
```jsx
useEffect(() => {
  if (pendingSubmitRef.current && isTableVerified && currentTableId) {
    pendingSubmitRef.current = false;
    setShowTableConfirmSheet(false);
    if (autoSubmitTimerRef.current) clearTimeout(autoSubmitTimerRef.current);
    autoSubmitTimerRef.current = setTimeout(() => handleSubmitOrder(), 100);
  }
  return () => {
    if (autoSubmitTimerRef.current) clearTimeout(autoSubmitTimerRef.current);
  };
}, [isTableVerified, currentTableId]);
```

**Note:** Need to find the refs section to place `autoSubmitTimerRef`. Search for existing `useRef` declarations near the top of the component.

---

## Summary
Total: 5 findings (0 P0, 2 P1, 3 P2, 0 P3)

- Fix 1 (PM-070, P1): Remove second try/catch in partner queryFn, let errors propagate. Add `partnerError` guard before `!partner` guard. Add retry button.
- Fix 2 (PM-074, P1): Split `orderError || !order` into two separate if blocks. `orderError` → retry UI with `refetchOrder()`. `!order` → existing "not found" UI.
- Fix 3 (PM-073, P2): Move `normalizeId` out of try block scope. Replace inline `String(guest?.id ?? guest?._id ?? "")` with `normalizeId(guest)` in create-guest path.
- Fix 4 (PM-069, P2): Part A — add useEffect to auto-clear code input 500ms after `codeVerificationError`. Part B — SKIPPED (requires useHallTable hook modification, out of scope).
- Fix 5 (PM-075, P2): Add `autoSubmitTimerRef`, store timeout ID, add cleanup function.

## ⛔ Prompt Clarity
- Overall clarity: **4/5**
- Ambiguous Fix descriptions:
  - Fix 3: Description said "normalizeId may not behave identically to normalizeGuestId" — but actual code shows `normalizeId` IS defined identically at line 2708. The real issue is block scope, not logic difference. Slightly misleading.
  - Fix 4 Part B: Task acknowledged complexity ("if too complex... note as SKIPPED") which was helpful, but the root cause (state lives in useHallTable, an out-of-scope file) could have been stated upfront.
- Missing context: useHallTable hook source would have helped assess Fix 4 Part B feasibility faster.
- Scope questions: Fix 4 Part B — unclear if modifying `useHallTable` return values would count as "modifying useHallTable.jsx" (prohibited) or if we could ask useHallTable to be updated in a separate task.
