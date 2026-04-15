# Comparison Report — StaffOrdersMobile
Chain: staffordersmobile-260415-153619-4e93

## Source Data
- **CC findings:** `pipeline/chain-state/staffordersmobile-260415-153619-4e93-cc-findings.md` — 7 findings (1 P0, 4 P1, 1 P2) across 4 fixes
- **Codex findings:** `staffordersmobile-260415-153619-4e93-codex-findings.md` — **NOT FOUND** in chain-state/, pages/, or any fallback location after git pull
- **Task context:** Arman's consolidated fix plan (Fix 1–4) references both `pipeline/cc-analysis-pssk-som-b1-cc-v1.txt` (CC) and `pipeline/codex-findings-pssk-som-b1-codex-v1.txt` (Codex) from a prior session. These original reference files also do not exist in the worktree.

**Decision:** Since the task context itself represents Arman's pre-synthesized plan from both CC and Codex analyses, and CC Writer findings align with this plan, we treat the task context as the authoritative consolidated specification. The comparison below validates CC findings against the task context spec.

---

## Agreed (CC findings match task context spec)

### 1. [P1] Fix 1a — `activeOrders` filter excludes closed orders (line 3580)
- **CC:** Change `return o.status !== 'closed' && o.status !== 'cancelled'` → `return o.status !== 'cancelled'` to allow closed orders into `filteredGroups`. Shift cutoff (3572-3574) prevents historical leakage.
- **Task spec:** Identical fix. Same line, same change.
- **Confidence:** HIGH — both sources agree, logic is sound.

### 2. [P1] Fix 1b — `closeSession` does not close ServiceRequests (sessionHelpers.js:158-171)
- **CC:** Identified that `hasActiveRequest` remains true for closed table because SRs stay open. Noted `getLinkId` not available in sessionHelpers.js — proposed using existing order data or inline extraction.
- **Task spec:** Identical root cause. Proposes fetching TableSession to get tableId via `getLinkId`. Notes sequential `for...of` + await.
- **Minor difference:** CC suggests option (B) — extract tableId from `sessionOrders[0]?.table` to avoid extra API call. Task spec uses option (A) — fetch TableSession by ID. Both valid.
- **Confidence:** HIGH — agreed on fix, minor implementation detail differs.
- **Resolution:** Use task spec approach (fetch session) for clarity and safety — `sessionOrders` may be empty if all were cancelled, but session always exists.

### 3. [P1] Fix 1c — `confirmCloseTable` missing `refetchRequests()` (line 4148-4155)
- **CC:** Add `if (!isKitchen) refetchRequests();` after `refetchOrders()`. Pattern from `handleRefresh` (4131).
- **Task spec:** Identical fix.
- **Confidence:** HIGH.

### 4. [P0] Fix 2 — `Promise.all` in closeSession → sequential (sessionHelpers.js:166-170)
- **CC:** Replace with for-loop + 120ms `BATCH_DELAY_MS`. Cannot import `runBatchSequential` (circular dep). Inline implementation.
- **Task spec:** Identical fix and reasoning. Same code snippet.
- **Confidence:** HIGH — both agree on approach and exact implementation.

### 5. [P1] Fix 3a/3b — Collapsed card `forEach` → `runBatchSequential` (line ~657)
- **CC:** Both Accept All and Serve All use fire-and-forget `forEach`. Replace with async handler using `runBatchSequential` + `onBatchCloseRequestAsync`. Single `invalidateQueries` after.
- **Task spec:** Identical fix. References expanded card line 2369 as correct pattern.
- **Confidence:** HIGH.

### 6. [P1] Fix 3c — TableOrderGroup collapsed `forEach` at line ~1272
- **CC:** Same `forEach` pattern duplicated in TableOrderGroup. Needs same fix.
- **Task spec:** Identical — mentions grep `tableRequests.forEach` for exact location.
- **Confidence:** HIGH.

### 7. [P2] Fix 4 — `__batch` guard on `updateStatusMutation` (line 1606)
- **CC:** Add `__batch` guard to `onSettled` to match `advanceMutation` pattern. Preventive/consistency fix.
- **Task spec:** Identical fix. Marked NICE-TO-HAVE.
- **Confidence:** HIGH.

---

## CC Only (Codex missed)

None — all CC findings align with the task context spec. No extra findings from CC beyond the defined scope.

CC noted one implementation detail not explicitly in the spec:
- **Fix 1b implementation:** CC suggested adding 120ms delay between SR close calls (to match `BATCH_DELAY_MS` pattern from Fix 2). Task spec says `for...of` + await but doesn't explicitly mention delay for SRs.
- **Recommendation:** Include 120ms delay for SR closure too — consistency with Fix 2 pattern, and SRs hit the same B44 API. **ACCEPTED as enhancement.**

---

## Codex Only (CC missed)

**Cannot evaluate** — Codex findings file is missing from this chain run. The task context references prior Codex analysis (`pipeline/codex-findings-pssk-som-b1-codex-v1.txt`) which was already incorporated into the consolidated fix plan by Arman.

No additional Codex-only findings to evaluate.

---

## Disputes (disagree)

### Minor: Fix 1b — tableId extraction method
- **CC preference:** Use `sessionOrders[0]?.table` (avoids extra API call)
- **Task spec preference:** Fetch `TableSession` by ID, use `getLinkId`
- **Resolution:** Task spec approach is safer:
  1. `sessionOrders` could be empty (all cancelled) → `sessionOrders[0]` is undefined
  2. `getLinkId` is not available in sessionHelpers.js — need inline equivalent
  3. We already have the session object from the update on line 159 — but actually we only have `sessionId`, not the full object with `table` field
  4. Best approach: after updating TableSession (line 159), we need table info. Since `closeSession` receives `sessionId`, we should fetch the session to get its `table` field. This is 1 extra API call but is safe regardless of order state.
- **Final decision:** Follow task spec (fetch session), inline the link extraction (since `getLinkId` is not importable).

---

## Final Fix Plan

Ordered list of all fixes to apply:

1. **[P0] Fix 2 — Sequential order closing in `closeSession`**
   - Source: Agreed (CC + task spec)
   - File: `components/sessionHelpers.js:166-170`
   - Change: Replace `Promise.all` with for-loop + 120ms delay
   - Priority: P0 — apply first as it's in sessionHelpers.js shared by Fix 1b

2. **[P1] Fix 1b — Close ServiceRequests in `closeSession`**
   - Source: Agreed (CC + task spec), with CC enhancement (add 120ms delay between SR calls)
   - File: `components/sessionHelpers.js:158-171` (add after order closing block)
   - Change: Fetch session → get tableId → fetch open SRs → close sequentially with 120ms delay

3. **[P1] Fix 1a — Allow closed orders through `activeOrders` filter**
   - Source: Agreed (CC + task spec)
   - File: `pages/StaffOrdersMobile/260414-02 StaffOrdersMobile RELEASE.jsx:3580`
   - Change: Remove `o.status !== 'closed'` condition (1 line change)

4. **[P1] Fix 1c — Refetch requests after close**
   - Source: Agreed (CC + task spec)
   - File: `pages/StaffOrdersMobile/260414-02 StaffOrdersMobile RELEASE.jsx:4148-4155`
   - Change: Add `if (!isKitchen) refetchRequests();` after `refetchOrders()`

5. **[P1] Fix 3a — Collapsed card "Accept All" → `runBatchSequential`**
   - Source: Agreed (CC + task spec)
   - File: `pages/StaffOrdersMobile/260414-02 StaffOrdersMobile RELEASE.jsx:~657`
   - Change: Replace `forEach` with async `runBatchSequential` + `onBatchCloseRequestAsync`

6. **[P1] Fix 3b — Collapsed card "Serve All" → `runBatchSequential`**
   - Source: Agreed (CC + task spec)
   - File: `pages/StaffOrdersMobile/260414-02 StaffOrdersMobile RELEASE.jsx:~657`
   - Change: Same pattern as 5 but with status `'done'`

7. **[P1] Fix 3c — TableOrderGroup collapsed `forEach` → `runBatchSequential`**
   - Source: Agreed (CC + task spec)
   - File: `pages/StaffOrdersMobile/260414-02 StaffOrdersMobile RELEASE.jsx:~1272`
   - Change: Same pattern as 5/6

8. **[P2] Fix 4 — `__batch` guard on `updateStatusMutation`**
   - Source: Agreed (CC + task spec), NICE-TO-HAVE
   - File: `pages/StaffOrdersMobile/260414-02 StaffOrdersMobile RELEASE.jsx:1606`
   - Change: Add `if (vars?.__batch) return;` guard to `onSettled`

---

## Summary
- Agreed: 7 items (all 7 CC findings match task spec)
- CC only: 1 enhancement accepted (120ms delay for SR closure in Fix 1b)
- Codex only: 0 items (Codex findings file missing — prior Codex analysis already incorporated in task spec by Arman)
- Disputes: 1 minor (tableId extraction method — resolved in favor of task spec)
- **Total fixes to apply: 8** (across 2 files)
- **Files modified:**
  - `components/sessionHelpers.js` — Fix 2 + Fix 1b
  - `pages/StaffOrdersMobile/260414-02 StaffOrdersMobile RELEASE.jsx` — Fix 1a, 1c, 3a, 3b, 3c, 4

## Risk Assessment
- All fixes are localized and well-defined
- Fix 1a (1-line change) has highest impact — enables the entire "Close Table → Completed" flow
- Fix 2 (P0) prevents rate limiting — critical for production stability
- Fix 4 is preventive only — lowest risk, lowest priority
- No scope creep detected — all fixes within SCOPE LOCK boundaries
