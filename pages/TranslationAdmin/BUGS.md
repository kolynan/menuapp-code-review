# TranslationAdmin — BUGS.md

**Page:** TranslationAdmin
**File:** `translationadmin.jsx` (~1950 lines after fixes)
**Last updated:** 2026-02-26 (S35 Codex round)

## Fixed Issues

### Round 1 (S35 initial review — Claude Code)

| ID | Priority | Description | Commit |
|----|----------|-------------|--------|
| BUG-TA-001 | P1 | setDefaultLanguage non-atomic — zero-default state on partial failure | `8c3c086` + `6e79f32` |
| BUG-TA-002 | P1 | updateTranslation swallowed error — edit always closed on failure | `5c2b9e4` + `6e79f32` |
| BUG-TA-003 | P1 | deleteUnusedKeys — silent error swallowing, state desync | `505b05b` |
| BUG-TA-004 | P1 | saveAndScanAndAdd — stale tracker closure when tracker newly created | `06a24af` |
| BUG-TA-005 | P1 | CSV import — partial failure loses state, no deduplication | `5dc95cf` |
| BUG-TA-006 | P1 | CSV round-trip — newlines corrupted (escapeCSV vs parseCSV mismatch) | `3e022d0` |
| BUG-TA-007 | P1 | refreshTranslations failures silent in 3 bulk operations | `91af727` |

### Round 2 (S35 Codex round — found by Codex GPT-5.3, fixed by Claude Code)

| ID | Priority | Description | Fix |
|----|----------|-------------|-----|
| BUG-TA-024 | P1 | scanAllSources re-entrant — double-click corrupts scannedCount/scanResults | Added `isScanning` state guard + button disabled during scan |
| BUG-TA-025 | P1 | saveAndScanAndAdd marks tracker as scanned despite createRecord errors | Only mark `scan_status: "scanned"` when `failed === 0`; otherwise `"needs_rescan"` with `new_keys_count: failed` |
| BUG-TA-026 | P1 | addScannedKeys clears scanResults.new even when some keys failed | Track `addedKeys` set, only filter out successfully created keys |
| BUG-TA-027 | P1 | addLanguage has no duplicate language code guard | Check `languages.some()` with normalized code before creating |
| BUG-TA-028 | P2 | CSV parser splits on `\n` first — breaks RFC-4180 multiline quoted cells | Added `splitCSVRows()` state-machine that respects quoted fields |
| BUG-TA-029 | P2 | updateUnusedKeyLogs all-or-nothing state update — partial failure inconsistency | Update state incrementally after each successful API call |

## Active Issues (not fixed)

### P2

| ID | Priority | Description | Notes |
|----|----------|-------------|-------|
| BUG-TA-008 | P2 | Admin email hardcoded in client-side bundle | Base44 platform constraint — no server-side alternative |
| BUG-TA-009 | P3 | `OperationProgress` uses string-matching on color prop (dynamic Tailwind) | Codex dispute: AGREE — downgraded from P2 to P3. Style preference, not a functional bug. Dynamic Tailwind classes are included in the class list so they work. |
| BUG-TA-010 | P3 | `ProgressBar` passes raw Tailwind class as color prop | Codex dispute: AGREE — downgraded from P2 to P3. Same as TA-009. |
| BUG-TA-011 | P3 | Magic numbers for delays/thresholds (100ms, 300ms, 500ms, 50ms) | Codex dispute: AGREE — downgraded from P2 to P3. These are throttle constants, not correctness issues. |
| BUG-TA-015 | P2 | No search debounce / no pagination — performance concern with large datasets | Kept as P2 — real performance concern at scale |
| BUG-TA-016 | ~~P2~~ | Duplicated save-code logic across saveSourceCode/saveAndScan/saveAndScanAndAdd | Codex dispute: AGREE — closed. Refactoring suggestion, not a bug. Code is readable as-is. |

### P3

| ID | Priority | Description | Notes |
|----|----------|-------------|-------|
| BUG-TA-012 | P3 | 20+ `console.error` calls in production code | Codex dispute: DISAGREE — keeping as P3. CLAUDE.md rule says "No Debug Logs." However these are `console.error` (diagnostic), not `console.log`. Low priority. |
| BUG-TA-013 | P3 | `confirm()` used for destructive ops (3 places) | Codex dispute: AGREE — downgraded from P2 to P3. Not a functional bug; `confirm()` works fine outside iframes. UX enhancement for future. |
| BUG-TA-014 | ~~P3~~ | Missing `useCallback` on event handlers | Codex dispute: AGREE — closed. Premature optimization. React handles this fine without memo for this page's scale. |
| BUG-TA-018 | P3 | `formatDate` hardcodes English strings | Active |
| BUG-TA-019 | P3 | No `aria-label` on icon-only buttons (accessibility) | Active |
| BUG-TA-020 | P3 | `TranslationRow`/`SourceRow` not wrapped in `React.memo` | Active |
| BUG-TA-021 | P3 | `PREDEFINED_SOURCES` hints hardcoded English | Active |
| BUG-TA-022 | P3 | `copyToClipboard` no fallback for older browsers | Active |
| BUG-TA-023 | ~~P3~~ | `isAdmin` not memoized (trivial) | Codex dispute: AGREE — closed. `useState` preserves tab state across re-renders. Only lost on full reload, which is expected. |
| BUG-TA-030 | P3 | Per-source Scan button active during Scan All — interleaving tracker/log updates | Found by Codex verification. Admin-only, single user — low risk. |

## Dispute Summary

| Disputed Bug | Codex Says | Claude Verdict |
|---|---|---|
| TA-009 (P2) | Refactoring, not bug | AGREE — downgraded to P3 |
| TA-010 (P2) | Refactoring, not bug | AGREE — downgraded to P3 |
| TA-012 (P2) | Refactoring, not bug | AGREE — downgraded to P3 (but note: was about scanResults reset, reassigned to magic numbers) |
| TA-014 (P3) | Refactoring, not bug | AGREE — closed |
| TA-016 (P3) | Refactoring, not bug | AGREE — closed |
| TA-017 (P3) | Refactoring, not bug | DISAGREE — keeping TA-012 as P3 (console.error in production) |
| TA-023 (P3) | Refactoring, not bug | AGREE — closed |

**Score:** Codex was right on 6 out of 7 disputes. Fair assessment.

## Statistics

- **Total issues found:** 30 (R1: 23, R2: 6 new, Codex verification: 1 new)
- **Fixed:** 13 (R1: 7 P1, R2: 4 P1 + 2 P2)
- **Active:** 13 (P2: 2, P3: 11)
- **Closed (not bugs):** 4 (TA-014, TA-016, TA-023, TA-012-reset)
- **Codex verification:** 6/6 APPROVED (2 new edge cases found, 1 fixed inline, 1 logged as P3)
