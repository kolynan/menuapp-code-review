# CC Reviewer Findings — ПССК Prompt Quality Review
Chain: publicmenu-260404-221902-9b8a

## Issues Found

1. [MEDIUM] **`python3` may not exist on Windows** — The prompt uses `python3` in all verification and fix commands. On Windows (Arman's setup), Python is typically invoked as `python`, not `python3`. If the ССП runner is Claude Code on Windows, `python3` will fail with "command not found". PROMPT FIX: Use `python` instead of `python3`, or add a note: "Use `python` on Windows, `python3` on Linux/Mac".

2. [MEDIUM] **File encoding write safety — no BOM / newline preservation check** — The Python replace script reads and writes the entire file. If the file has a BOM (byte order mark) or uses `\r\n` line endings (common on Windows), Python's default `open()` in text mode on Windows will convert `\n` to `\r\n` on write, potentially doubling line endings or changing them. PROMPT FIX: Add `newline=''` parameter to the `open()` calls to preserve original line endings: `open('...', 'w', encoding='utf-8', newline='')` for write, and `open('...', 'r', encoding='utf-8', newline='')` for read. Or use binary mode with explicit encoding.

3. [LOW] **Backup step missing (Rule F2)** — The system rules require `cp file.jsx file.jsx.bak` before ANY code changes (Rule F2). The prompt jumps directly to the Python replace without a backup step. PROMPT FIX: Add before the fix command: `cp pages/PublicMenu/x.jsx pages/PublicMenu/x.jsx.bak`

4. [LOW] **No size check step (Rule F3)** — Rules require `BEFORE=$(wc -l < file.jsx)` / `AFTER=$(wc -l < file.jsx)` comparison. The prompt mentions checking `wc -l` in verification but doesn't structure it as the mandatory BEFORE/AFTER pattern. PROMPT FIX: Add explicit BEFORE capture before fix, AFTER capture after fix, and the 5% comparison guard.

5. [LOW] **Commit message references KB-118 but KB entry not verified** — The git commit message says "(KB-118)" but the prompt doesn't mention creating or verifying KB-118 exists. If it doesn't exist, the reference is dangling. PROMPT FIX: Either remove KB-118 reference from commit message, or add a note that KB-118 should be created separately.

6. [LOW] **grep verification is minimal** — The check `grep -c '"status.new"' pages/PublicMenu/x.jsx` only verifies one key exists. A more robust check would verify the I18N_FALLBACKS object structure is intact (e.g., count of key-value pairs before/after). PROMPT FIX: Add `grep -c '":' pages/PublicMenu/x.jsx` before and after to compare total key count hasn't changed.

## Line Number Verification

| Reference | Prompt says | Actual | Status |
|-----------|------------|--------|--------|
| I18N_FALLBACKS location | lines 327–584 | Not verified (reviewer cannot read files per instructions) | ⚠️ Cannot verify |
| File length | ~5215 lines | Not verified | ⚠️ Cannot verify |
| Smart quote count | 997 total (473 U+201C + 524 U+201D) | Not verified | ⚠️ Cannot verify |

Note: Line numbers and counts were provided by the prompt author based on prior analysis. Since this is a mechanical replacement (not line-targeted edits), exact line numbers are less critical — the Python script operates on full-file content, not specific lines.

## Fix-by-Fix Analysis

**Fix 1 (Smart quote replacement):** SAFE — This is a straightforward global string replacement. The operation is idempotent (running twice produces same result). The replacement characters (`"` → `"`) are well-defined Unicode codepoints. No regex involved, pure string `.replace()` — no risk of unintended pattern matching. The scope is correctly limited to two specific characters.

Risk factors:
- File encoding handling on Windows (covered in Issue #2 above)
- Python availability as `python3` vs `python` (covered in Issue #1 above)
- Both are easily fixable in the prompt

## Summary
Total: 6 issues (0 CRITICAL, 2 MEDIUM, 4 LOW)
Prompt clarity rating: 4/5

## Prompt Clarity (MANDATORY)
- Overall clarity: **4/5**
- What was most clear: The problem description is excellent — specific Unicode codepoints, exact counts, clear cause-effect (smart quotes → SyntaxError → B44 can't publish). The fix command is simple and correct. FROZEN UX section properly scopes the change.
- What was ambiguous or could cause hesitation: The `python3` vs `python` distinction on Windows could cause the executor to pause and troubleshoot. The lack of explicit backup/size-check steps (F2/F3) might cause a rules-aware executor to add them anyway, slowing execution.
- Missing context: (1) Whether the file uses `\r\n` or `\n` line endings. (2) Whether `python3` is available in the execution environment. (3) Whether the 40 comment occurrences need special handling or are fine to replace alongside string literals (prompt says "replace all" which is correct, but could note this explicitly).
