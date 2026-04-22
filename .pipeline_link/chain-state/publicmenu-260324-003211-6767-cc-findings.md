# CC Writer Findings — PublicMenu
Chain: publicmenu-260324-003211-6767

## Findings

### Fix 1 — PM-070 (P1): Partner lookup swallows backend errors as "restaurant not found"

**Status: ALREADY FIXED (S164, chain 466b)**

The current code at lines 1367–1388 already implements the correct two-path error handling:
- Primary lookup (line 1378) catches errors silently (line 1380–1382) and falls through to fallback.
- Fallback lookup (line 1385) lets errors propagate to React Query via `partnerError`.
- Render path at lines 3134–3146: `partnerError` → shows `t('error.network_error')` + retry button (`refetchPartner()`).
- Render path at lines 3148–3156: `!partner` (null result, no error) → shows `t('error.partner_not_found')`.
- React Query also has `retry: shouldRetry` (line 1370) which retries up to 2 times for non-rate-limit errors (line 135).

**No code change needed.**

---

### Fix 2 — PM-073 (P2): useTableSession loses restored guest ID

**Status: ALREADY FIXED (S164, chain 466b)**

The `normalizeId` function is defined at line 2775: `const normalizeId = (g) => String(g?.id ?? g?._id ?? "");`
It handles both `.id` and `._id` properties correctly. All `currentGuestIdRef.current` assignments use it:
- Restored guest path: line 2848 `const gid = normalizeId(guest);` → line 2850 `currentGuestIdRef.current = gid || null;`
- New guest path: line 2868 `const gid = normalizeId(guest);` → line 2870 `currentGuestIdRef.current = gid || null;`

No raw `guest.id` access exists for `currentGuestIdRef` assignment.

**No code change needed.**

---

### Fix 3 — PM-069 (P2): Table code bottom sheet — no cooldown countdown display

**Status: NOT FIXED — BLOCKED by B44 hook limitation**

The lockout state variables (`codeAttempts`, `codeLockedUntil`, `nowTs`) do NOT exist in x.jsx. They are encapsulated inside the `useHallTable` hook, imported from `@/components/publicMenu/refactor/hooks/useHallTable` (line 110). The hook currently exposes: `tableCodeParam`, `resolvedTable`, `isHallMode`, `tableCodeInput`, `setTableCodeInput`, `isVerifyingCode`, `verifiedByCode`, `verifiedTableId`, `verifiedTable`, `codeVerificationError`, `verifyTableCode` (lines 1552–1563). It does NOT expose lockout timing state.

The i18n keys for lockout display already exist in x.jsx:
- Line 465: `"cart.verify.attempts": "Попытки"`
- Line 477: `"cart.verify.locked": "Слишком много попыток. Повторите через"`

But the bottom sheet (lines 3499–3598) cannot display a countdown because it has no access to lockout state.

**FIX REQUIRES:** A B44 prompt to modify `useHallTable` hook to expose `codeAttempts`, `codeLockedUntil`, and `nowTs` (or a single `lockoutRemainingMs` value). This is NOT fixable in x.jsx alone.

**Recommended approach:** Create a B44 prompt asking useHallTable to export lockout state. Then in x.jsx, add countdown display to the bottom sheet using the exposed values.

---

### Fix 4 — PM-075 (P2): Auto-submit after table verification — untracked setTimeout

**Status: ALREADY FIXED (S164, chain 466b)**

- `autoSubmitTimerRef` declared at line 1477: `const autoSubmitTimerRef = useRef(null);`
- Timer stored before use at line 2153: `if (autoSubmitTimerRef.current) clearTimeout(autoSubmitTimerRef.current);`
- Timer set at line 2154: `autoSubmitTimerRef.current = setTimeout(() => handleSubmitOrder(), 100);`
- Cleanup in useEffect return at line 2156–2158: `return () => { if (autoSubmitTimerRef.current) clearTimeout(autoSubmitTimerRef.current); };`

The useEffect (lines 2147–2159) has proper dependency array `[isTableVerified, currentTableId]` and cleanup function.

**No code change needed.**

---

### Fix 5 — PM-112 (P3): Remove "Send" button from table code bottom sheet

**Status: CANNOT BE APPLIED AS DESCRIBED — task premise is incorrect**

The task states: "the code auto-submits when the last (4th) digit is entered. The button is therefore redundant."

**This is factually incorrect.** There is NO auto-submit on last digit entry in the current code:
- The `onChange` handler (lines 3551–3553) only updates state via `setTableCodeInput(next)`. It does NOT call `verifyTableCode`.
- The "Отправить" button (lines 3581–3595) is the ONLY mechanism that calls `verifyTableCode(code)` (line 3588).
- The `autoSubmitTimerRef` at line 2154 fires `handleSubmitOrder()` (order submission) AFTER table verification succeeds — this is different from table code verification.

**Removing the button would break table code verification entirely** — users would have no way to submit the code.

**Two possible interpretations:**
1. **If auto-submit on last digit SHOULD be added first:** Add auto-submit logic to the `onChange` handler, THEN remove the button. But this is two changes, not just removing the button.
2. **If the button should stay:** The task description is based on a false premise and should be rejected.

**Recommendation:** SKIP this fix. Flag to Arman that auto-submit on last digit does not exist. If desired, create a separate task to (a) add auto-submit on last digit, then (b) remove the button.

---

## Summary
Total: 5 findings analyzed (0 P0, 0 P1, 0 P2, 0 P3 — all are status assessments)

- **Fix 1 (PM-070):** Already fixed ✅ — no change needed
- **Fix 2 (PM-073):** Already fixed ✅ — no change needed
- **Fix 3 (PM-069):** BLOCKED — requires B44 hook change to expose lockout state
- **Fix 4 (PM-075):** Already fixed ✅ — no change needed
- **Fix 5 (PM-112):** INVALID premise — no auto-submit on last digit exists; button is the only submit mechanism

**Actionable fixes in x.jsx: 0 out of 5.**

3 fixes were already applied in S164 (chain 466b). 1 is blocked by B44 hook. 1 has incorrect premise.

## Prompt Clarity
- Overall clarity: 3
- Ambiguous Fix descriptions:
  - Fix 3: Task says "codeAttempts, codeLockedUntil, nowTs state is not accessible in the bottom sheet component scope" — correct, but doesn't mention these variables DON'T EXIST in x.jsx at all (they're inside an imported hook). The task implies they can be moved/passed as props within x.jsx, but they can't — they require a B44 hook modification.
  - Fix 5: Task states "the code auto-submits when the last (4th) digit is entered" — this is false. No auto-submit on last digit exists. The entire fix premise is wrong.
- Missing context:
  - Fix 1/2/4: No mention that these were already fixed in S164 (chain 466b). BUGS_MASTER.md clearly marks them as fixed. The task should have checked BUGS_MASTER before including these.
  - Fix 3: Missing info about what `useHallTable` exposes and that it's a B44 imported hook, not local code.
- Scope questions:
  - Fix 3: Is modifying the B44 hook in scope? (Answer: No, per Base44 Restrictions — needs a B44 prompt.)
  - Fix 5: Should auto-submit on last digit be ADDED as part of this fix, or is only button removal in scope?
