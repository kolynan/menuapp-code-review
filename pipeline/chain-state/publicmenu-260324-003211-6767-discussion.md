# Discussion Report — PublicMenu
Chain: publicmenu-260324-003211-6767

## Disputes Discussed
Total: 2 disputes from Comparator

## Round 1

### Dispute 1: PM-070 (P1) — Partner lookup swallows backend errors (edge case)

**CC Position:**
CC re-examined the code (lines 1371–1388) and **agrees with Codex's edge case analysis**. The scenario is:
1. Primary `Partner.filter(byIdFirst ? { id: p } : { slug: p })` throws a transient error (network, 5xx) → caught silently at lines 1380–1382
2. Fallback `Partner.filter(byIdFirst ? { slug: p } : { id: p })` succeeds but returns empty array (different filter criteria don't match)
3. `return res2?.[0] || null` → partner = null, no partnerError
4. UI shows "Restaurant not found" (line 3148–3155) instead of retry UI (line 3134–3146)

CC's proposed fix — store primaryError, rethrow if fallback also returns null:
```javascript
queryFn: async () => {
  const p = partnerParamRaw;
  if (!p) return null;
  const byIdFirst = looksLikePartnerId(p);
  let primaryError = null;
  try {
    const res = await base44.entities.Partner.filter(byIdFirst ? { id: p } : { slug: p });
    if (res?.[0]) return res[0];
  } catch (e) {
    primaryError = e;
  }
  // Fallback lookup — let errors propagate to React Query (PM-070)
  const res2 = await base44.entities.Partner.filter(byIdFirst ? { slug: p } : { id: p });
  if (res2?.[0]) return res2[0];
  if (primaryError) throw primaryError;
  return null;
},
```

This preserves all existing behavior:
- If primary succeeds → returns partner (unchanged)
- If primary fails, fallback finds partner → returns partner (unchanged)
- If both fail → fallback throws → React Query gets error → retry UI (unchanged)
- **NEW**: If primary fails, fallback returns empty → rethrows primaryError → retry UI (was: "not found")
- If both return empty, no error → null → "not found" (unchanged, genuine not-found)

**Codex Position (from original findings + comparison):**
Codex originally identified this edge case in the writer step (Finding #1 in codex-findings). Codex agrees the primary catch-all swallows the error signal. Codex's proposed approach: "only treat explicit 404/not-found failures as not-found; rethrow network/5xx/timeout/unknown errors."

CC's fix achieves the same result more simply — store the error and rethrow only if the fallback also fails to find a partner. This avoids needing to parse error types (404 vs 500) which may not be reliably available from Base44's API.

**Status:** RESOLVED — Round 1. Both agree on the problem. CC's fix approach is simpler and more defensive.

### Dispute 2: PM-112 (P3) — Remove "Send" button from table code bottom sheet

**CC Position:**
The task premise is **factually incorrect**. CC verified the code:
1. `onChange` handler (lines 3551–3553): only calls `setTableCodeInput(next)` — **NO auto-submit on last digit**
2. Button (lines 3581–3595): calls `verifyTableCode(code)` — this is the **ONLY mechanism** to verify the table code
3. `autoSubmitTimerRef` fires `handleSubmitOrder()` (order submission AFTER verification), NOT `verifyTableCode()` — these are completely different operations

Removing the button would **BREAK table code verification entirely**. Users would have no way to submit their table code.

**Codex Position (from original findings):**
Codex's original finding (#3) stated: "remove this button block entirely and keep the existing auto-submit-on-last-digit behavior unchanged." However, Codex did not verify whether auto-submit-on-last-digit actually exists in the code — it trusted the task description.

The Comparator already verified CC's analysis is correct: the `onChange` handler only updates state, the button is the sole verification trigger, and `autoSubmitTimerRef` is for order submission (a different operation entirely).

**Status:** RESOLVED — Round 1. CC is correct. Task premise is wrong. SKIP this fix.

If PM-112 is desired, it requires a **two-part task**: (a) first implement auto-submit on last digit entry (call `verifyTableCode` when input length === `tableCodeLength`), (b) then remove the button. These must be done together, not just (b) alone.

## Resolution Summary
| # | Dispute | Rounds | Resolution | Winner |
|---|---------|--------|------------|--------|
| 1 | PM-070 edge case | 1 | resolved | Compromise — Codex found the bug, CC provided simpler fix |
| 2 | PM-112 remove button | 1 | resolved | CC — task premise incorrect, button is only verification mechanism |

## Updated Fix Plan
Based on discussion results, the UPDATED fix plan for the Merge step:

1. [P1] PM-070 — Partner lookup edge case fix — Source: discussion-resolved (Codex found, CC fix approach) — Store primaryError in catch block, rethrow if fallback also returns null. Ensures transient errors show retry UI instead of "not found". Change is in queryFn at lines 1371–1388.

## Skipped Items (no code change)
- PM-073 (Fix 2): ALREADY FIXED in S164 (chain 466b). No change needed.
- PM-069 (Fix 3): BLOCKED — requires B44 prompt to expose lockout state from useHallTable hook.
- PM-075 (Fix 4): ALREADY FIXED in S164 (chain 466b). No change needed.
- PM-112 (Fix 5): INVALID PREMISE — auto-submit on last digit does not exist. Button is only verification mechanism. Removing it breaks functionality.

## Unresolved (for Arman)
None — both disputes resolved in Round 1.

**Items requiring Arman's attention (from Comparator, carried forward):**
- PM-069: Create B44 prompt to expose `codeAttempts`, `codeLockedUntil`, `nowTs` from `useHallTable` hook.
- PM-112: Task premise incorrect. If auto-submit behavior is desired, a new two-part task is needed: (a) add auto-submit on last digit, (b) then remove button.
