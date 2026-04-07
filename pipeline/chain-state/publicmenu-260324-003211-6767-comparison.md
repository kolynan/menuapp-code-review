# Comparison Report — PublicMenu
Chain: publicmenu-260324-003211-6767

## Agreed (both found)

### Fix 3 — PM-069 (P2): Table code bottom sheet — no cooldown countdown display
- **CC:** BLOCKED — `codeAttempts`, `codeLockedUntil`, `nowTs` do NOT exist in x.jsx; they are encapsulated inside `useHallTable` hook (B44 import). Cannot fix in x.jsx alone — requires B44 prompt to expose lockout state.
- **Codex:** Confirms lockout state is not available in the destructured hook output (lines 1554–1564). Suggests exposing these values and adding countdown UI.
- **Agreement:** Both confirm the bug exists and lockout state is inaccessible. Both agree the bottom sheet cannot display countdown.
- **Disagreement on fix approach:** CC says this is BLOCKED (needs B44 hook modification, out of scope). Codex says "FIX: expose them" without acknowledging the B44 restriction. CC's analysis is more accurate — `useHallTable` is an imported hook from `@/components/publicMenu/refactor/hooks/useHallTable`, not local code. Per Base44 Restrictions (Rule 5), page code cannot modify imported platform hooks.
- **Verdict:** SKIP — requires B44 prompt. Document for Arman.

## CC Only (Codex missed)

### Fix 2 — PM-073 (P2): useTableSession loses restored guest ID
- **CC:** Already fixed in S164 (chain 466b). `normalizeId` function at line 2775 handles `.id` and `._id`. All `currentGuestIdRef.current` assignments use `normalizeId`.
- **Codex:** Not mentioned (presumably verified and found no issue, or skipped).
- **Verdict:** ALREADY FIXED ✅ — no change needed. CC's evidence is concrete (line numbers, code citations).

### Fix 4 — PM-075 (P2): Auto-submit after table verification — untracked setTimeout
- **CC:** Already fixed in S164 (chain 466b). `autoSubmitTimerRef` at line 1477, cleanup in useEffect at lines 2156–2158.
- **Codex:** Not mentioned (presumably verified and found no issue, or skipped).
- **Verdict:** ALREADY FIXED ✅ — no change needed. CC's evidence is concrete.

## Codex Only (CC missed)

None. All items Codex found were also found by CC.

## Disputes (disagree)

### Fix 1 — PM-070 (P1): Partner lookup swallows backend errors
- **CC:** ALREADY FIXED. Two-path error handling exists: `partnerError` → retry UI (lines 3134–3146); `!partner` (null) → not-found UI (lines 3148–3156). React Query retries with `shouldRetry`.
- **Codex:** NOT fully fixed. Identifies a remaining gap: if primary lookup fails (transient error, caught silently at lines 1380–1382) AND the fallback lookup returns no rows (null), then `partner === null` with no `partnerError` — triggering the "not found" UI instead of the retry UI. The catch-all on the primary lookup swallows the error signal.
- **Analysis:** Codex raises a valid edge case. The flow is:
  1. Primary `Partner.filter(...)` throws (e.g., network error) → caught silently (lines 1380–1382)
  2. Falls through to fallback `Partner.filter(...)` (line 1385)
  3. If fallback ALSO fails → error propagates → `partnerError` → retry UI ✅
  4. If fallback succeeds but returns empty array → `partner = null`, no `partnerError` → "not found" UI ❌
  - Scenario 4 is the gap: primary fails transiently, fallback returns empty (different filter), user sees "not found" for a valid restaurant.
- **However:** This scenario requires the primary lookup to fail while the fallback succeeds but returns empty. If the backend is truly down, both fail → retry UI shows. If the primary filter is wrong but fallback works, it returns results. The gap is narrow but theoretically possible (e.g., primary endpoint rate-limited, fallback endpoint works but with different filter criteria that miss the restaurant).
- **Verdict:** DISPUTE — Codex's concern has theoretical merit but may be a very narrow edge case. The fix (rethrow non-404 errors from primary) is low-risk and defensive. **Recommend: include in discussion step for resolution.**

### Fix 5 — PM-112 (P3): Remove "Send" button from table code bottom sheet
- **CC:** CANNOT APPLY — task premise is factually incorrect. There is NO auto-submit on last digit entry. The `onChange` handler (lines 3551–3553) only calls `setTableCodeInput(next)`. The "Отправить" button is the ONLY way to call `verifyTableCode()`. Removing it would break table code verification entirely.
- **Codex:** Remove the button block (lines 3580–3595), "keep the existing auto-submit-on-last-digit behavior unchanged."
- **Analysis:** CC's analysis is more thorough and correct. CC explicitly verified the code flow:
  - `onChange` handler → only updates state, no verification call
  - Button → only mechanism that calls `verifyTableCode(code)`
  - `autoSubmitTimerRef` → fires `handleSubmitOrder()` (order submission), NOT `verifyTableCode()` (code verification) — these are different operations
  - Codex appears to trust the task description without verifying the code. The task says auto-submit exists; Codex accepts this.
- **Verdict:** CC is correct. Removing the button would BREAK functionality. SKIP this fix. **The task premise is wrong — auto-submit on last digit does not exist in the current code.** If desired, a new two-part task should be created: (a) add auto-submit on last digit, (b) then remove button.

## Final Fix Plan

**No code fixes to apply in x.jsx.**

All 5 items are resolved as follows:

| # | Bug | Priority | Status | Action |
|---|-----|----------|--------|--------|
| 1 | PM-070 | P1 | DISPUTE | CC says fixed; Codex sees edge case. Send to discussion. |
| 2 | PM-073 | P2 | ALREADY FIXED | No change needed. |
| 3 | PM-069 | P2 | BLOCKED | Requires B44 prompt to expose useHallTable lockout state. |
| 4 | PM-075 | P2 | ALREADY FIXED | No change needed. |
| 5 | PM-112 | P3 | INVALID PREMISE | Auto-submit on last digit doesn't exist. Button is only submit mechanism. SKIP. |

**Items for discussion step:** Fix 1 (PM-070) — Codex's edge case analysis.

**Items for Arman:**
- Fix 3: Create B44 prompt to expose lockout state from useHallTable hook.
- Fix 5: Task premise incorrect. Auto-submit on last digit does not exist. Need new task if desired.

## Summary
- Agreed: 1 item (Fix 3 — bug exists, both agree it's blocked by hook limitation)
- CC only: 2 items (Fix 2, Fix 4 — already fixed, accepted as-is)
- Codex only: 0 items
- Disputes: 2 items (Fix 1 — edge case validity; Fix 5 — premise correctness)
- Total fixes to apply in x.jsx: **0**
- Items for discussion: **1** (Fix 1 edge case)
- Items requiring B44 prompt: **1** (Fix 3)
- Items with invalid premise: **1** (Fix 5)
