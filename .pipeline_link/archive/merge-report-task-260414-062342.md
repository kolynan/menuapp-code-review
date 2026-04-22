# Merge Report: PSSK v5 KS Prompt Review — SOM Batch A

**Task:** task-260414-062342
**Date:** 2026-04-14
**Reviewers:** Claude Code (CC) + Codex (CDX)

---

## Agreed (both found)

### 1. File line count is WRONG — 4524, not 4426
- **CC:** Verified `wc -l` = 4524. Prompt says "4426 строк" in 5+ places.
- **CDX:** Confirmed `(Get-Content ...).Count` = 4524.
- **Impact:** BLOCKER. KS executor will doubt they have the correct file. All "4426" references must be updated to "4524".

### 2. Fix3 line numbers for ★ and ☆ badges are WRONG
- **CC:** ★ div is at line **2250** (not 2249). Line 2249 = `{ownershipState === "mine" && (` (JSX condition, not the div). ☆ div is at line **2260** (not 2257). Line 2257 = `</button>` closing the 🔒 button.
- **CDX:** Confirmed same via PowerShell line dump (2248-2265). Codex noted "some of the cited JSX line numbers are shifted relative to the described elements."
- **Impact:** BLOCKER for Fix3. KS executor looking at line 2257 will see `</button>` and be confused. Must fix to 2250 and 2260.

---

## CC only (Codex missed)

### 3. Block-comment integrity check grep pattern won't match line 1148
- The prompt's mandatory pre-commit check uses: `grep -nE "^\s*/\*$|^\s*\*/$"`
- This pattern requires `/*` at END of line (`$`), but line 1148 is `/* function RateLimitScreen({ onRetry }) {` — has content after `/*`.
- Expected output says "1148 /*" but it will NOT appear. Pattern should be `"^\s*/\*|^\s*\*/"` (without `$` on the opening pattern).
- Also: the grep will match extra lines (821, 1074, 2732, 3382) which are `*/` closers of doc comments — expected output doesn't mention these, causing confusion.
- **Impact:** Medium. Verification step will produce unexpected output, potentially causing false alarm about block comment integrity.

### 4. Fix1 helper placement references getLinkId at wrong location
- Prompt says "near `getLinkId` / `getAssignee` — lines ~780-800". But `getLinkId` is at line **528** (before the first block comment at 546). Only `getAssignee` is at 786.
- **Impact:** Low. Reference to `getLinkId` is misleading but the line range "~780-800" is correct for the target area (after `*/` at 785, near `getAssignee` at 786).
- **Fix:** Change to "near `getAssignee` — lines ~786-800 after block comment `*/` at 785".

### 5. Fix3 says "🔒 badge (другой стол) уже <button> с stopPropagation — не трогать" at "~line 2253-2255"
- Actual 🔒 `<button>` is a single long line at **2255** (not a 3-line range).
- **Impact:** Very low. Conceptually correct, minor line reference imprecision.

### 6. tabCounts range cited as "3804-3819" — line 3819 is blank
- Content ends at 3818 (dep array line). Line 3819 is empty.
- **Impact:** Negligible. No action needed.

---

## Codex only (CC missed)

None. Codex output was truncated (raw grep results without final summary). No additional findings beyond what CC identified.

---

## Disputes (disagree)

None. Both reviewers agreed on the line number mismatches.

---

## Summary

| Category | Count |
|----------|-------|
| Agreed findings | 2 (both BLOCKER) |
| CC only | 4 (1 medium, 3 low/negligible) |
| Codex only | 0 |
| Disputes | 0 |
