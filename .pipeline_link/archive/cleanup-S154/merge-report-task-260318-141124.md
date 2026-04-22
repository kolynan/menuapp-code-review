# Merge Report: V8 Consensus Smoke Test — Profile PR-S104-01

**Task:** Verify V8 consensus pipeline works after KB-068/069 fixes
**File:** `pages/Profile/base/profile.jsx`
**Bug:** PR-S104-01 — handleSave() unmount guard

## Pipeline Status

| Stage | Status | Notes |
|-------|--------|-------|
| CC Writer | OK | Completed analysis, 0 new bugs |
| Codex Writer | PARTIAL | Completed analysis (10 findings), crashed on recursive codex exec self-call |
| Comparator | N/A | Not tested (no code changes to compare) |
| Discussion | N/A | Not needed |
| Merge | N/A | Not needed |

## Key Finding: PR-S104-01 Already Fixed

The unmount guard fix was already applied in commit `2607c3b` (Session S104):
- Line 59: `const isMountedRef = useRef(true);`
- Lines 62-66: cleanup effect sets `isMountedRef.current = false`
- Line 123: `if (!isMountedRef.current) return;` after updateMe()
- Line 129: `if (isMountedRef.current)` in setTimeout callback
- Line 132: `if (!isMountedRef.current) return;` in catch block

**No code changes needed.**

## Agreed (both found)

- PR-S104-01 unmount guard is correctly implemented. Both CC and Codex read the code and found the guard in place.

## CC only (Codex missed)

- Nothing new — CC confirmed the code is clean with 0 bugs.

## Codex only (CC missed)

Codex found 10 items, but these are all **pre-existing known issues** from prior reviews (review_2026-03-16.md), not new bugs:

1. [P1] Profile bypasses PartnerShell context — known, architectural decision
2. [P1] Role badge can show raw enum — known, documented
3. [P1] Hardcoded Russian fallbacks in tr() — known, by-design for Base44
4. [P2] Partner fetch failures silent — known
5. [P2] Save button not in fixed footer — known
6. [P2] Inputs missing min-h-[44px] — known
7. [P3] Missing activeTab="profile" — known
8. [P3] Nested min-h-screen — known
9. [P3] Load error lacks role="alert" — known
10. [P3] Icons missing aria-hidden — known

**Verdict:** All Codex findings are pre-existing and already documented. No new bugs to fix.

## Disputes

None.

## Smoke Test Result

**PARTIAL PASS:**
- CC Writer: PASS (completed successfully)
- Codex Writer: PASS (analysis completed, findings produced)
- Codex recursive self-call: FAIL (crashed with "access denied" on `codex exec` piped from PowerShell)
- Comparator/Discussion/Merge: NOT TESTED (no code changes to trigger these stages)

**Note:** The recursive codex-calling-codex crash is a known Codex sandbox limitation, not related to KB-068/069 fixes. The KB-068/069 fixes addressed PowerShell `$(if` syntax and single-writer fallback in the supervisor scripts, which are not exercised in this direct `codex exec` invocation.
