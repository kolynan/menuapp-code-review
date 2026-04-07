# CC Reviewer Findings — ПССК Prompt Quality Review
Chain: publicmenu-260405-182147-7fb7

## Issues Found

1. **[CRITICAL] RegExp escaping mismatch in RU_CHECK — `{param}` interpolation will SILENTLY FAIL**
   The RU_CHECK Python string has 8 backslash characters (`\\\\\\\\`) before `{` and `}` in the RegExp pattern. In a Python triple-quoted string, `\\` → `\`, so 8 chars → 4 literal backslashes written to the file.
   The EN block (line 599) has exactly **2 backslashes** before `{` and `}`:
   ```
   fb = fb.replace(new RegExp(`\\{${k}\\}`, "g"), String(v ?? ""));
   ```
   The RU block would produce **4 backslashes**:
   ```
   fb = fb.replace(new RegExp(`\\\\{${k}\\\\}`, "g"), String(v ?? ""));
   ```
   **Impact:** The `{count}` placeholder in `help.all_requests_cta` ("Все запросы ({count})") will NOT be interpolated — users will see literal `{count}` text.
   **PROMPT FIX:** Change `\\\\\\\\{${k}\\\\\\\\}` to `\\\\{${k}\\\\}` (4 backslash chars instead of 8) in the RU_CHECK Python string. This produces 2 literal backslashes matching the EN block.

2. **[MEDIUM] Step 4 f-string syntax incompatible with Python < 3.12**
   ```python
   print(f'{'OK' if c in data else 'MISSING'}: {c}')
   ```
   This uses nested single quotes inside a single-quoted f-string. Only works in Python 3.12+ (PEP 701). On Python 3.10/3.11 (common on Windows), this is a SyntaxError and the verification step fails silently — the executor may not notice the fix was incomplete.
   **PROMPT FIX:** Use double quotes for the outer f-string:
   ```python
   print(f"{'OK' if c in data else 'MISSING'}: {c}")
   ```

3. **[LOW] Missing fallback if `help.all_requests_cta` is called without `count` param**
   If `makeSafeT('help.all_requests_cta')` is called without `params`, the RU fallback returns "Все запросы ({count})" with literal `{count}`. This is the same behavior as the EN block (not a regression), but worth noting that the prompt does not add any guard for missing params.
   **PROMPT FIX:** Not required (existing pattern). But document this as a known limitation.

4. **[LOW] Expected line count "5270+" is approximate**
   RU_BLOCK adds ~55 lines (52 keys + comment + opening/closing). RU_CHECK adds ~12 lines. Total: 5214 + 67 ≈ 5281. The "5270+" estimate is fine but slightly low.
   **PROMPT FIX:** Change to "expect ~5280" for precision.

## Line Number Verification

| Reference | Prompt says | Actual | Status |
|-----------|------------|--------|--------|
| File line count | ~5214 | 5214 | ✅ |
| `help.chip.water` key | exists in I18N_FALLBACKS | line 583 | ✅ |
| `function makeSafeT` | exists | line 590 | ✅ |
| `EN mode: I18N_FALLBACKS` comment | exists | line 592 | ✅ |
| `// Try the real translation first` | exists | line 605 | ✅ |
| Step 2 anchor: `};\n\n/**\n * Wraps raw t()` | unique | char 21904, 1 occurrence | ✅ |
| Step 3 anchor: `    }\n    // Try the real translation first` | unique | char 22587, 1 occurrence | ✅ |
| RELEASE file: `260404-02 PublicMenu x RELEASE.jsx` | exists | referenced in prompt | ✅ (not verified on disk) |

## Fix-by-Fix Analysis

### Step 0: Smart quote check
**SAFE** — Non-destructive read-only check. Correct Unicode codepoints.

### Step 1: Anchor verification
**SAFE** — All 4 grep patterns confirmed present and unique. Good stop-gate.

### Step 2: Insert I18N_FALLBACKS_RU
**SAFE** — Anchor is unique (1 occurrence). Insertion point is correct (between I18N_FALLBACKS closing `};` and the `/** Wraps raw t()` JSDoc). Unicode escapes (`\uXXXX`) are valid JS and will render correctly as Cyrillic. The `str.replace(..., 1)` limits to first match.

### Step 3: Modify makeSafeT — add RU block
**RISKY** — The anchor is unique and correctly placed. The RU block logic is correct (mirror of EN block). BUT the RegExp escaping has a CRITICAL bug (Issue #1 above): 4 backslashes instead of 2. The `{count}` param in `help.all_requests_cta` will not be interpolated.

### Step 4: Verification
**SAFE with caveat** — Checks presence of key strings. The f-string syntax may fail on Python < 3.12 (Issue #2). The checks themselves are correct but won't catch the regex escaping bug.

### Step 5: KB-095 check
**SAFE** — Standard line count validation. Compares working copy vs HEAD. Correct thresholds.

### Step 6: Git + RELEASE
**SAFE** — Adds only specific file. Commit message is descriptive. RELEASE copy is correct increment (03).

## Summary
Total: 4 issues (1 CRITICAL, 1 MEDIUM, 2 LOW)

The CRITICAL issue (#1) will cause silent failure of `{count}` interpolation in the `help.all_requests_cta` key — showing literal `{count}` to Russian-speaking users. Fix is simple: reduce backslash count from 8 to 4 in the Python source string for RU_CHECK.

## Prompt Clarity (MANDATORY)
- **Overall clarity: 4/5**
- **What was most clear:** Step-by-step structure with stop-gates at each anchor verification. The root cause explanation is excellent. FROZEN UX section properly protects existing code. Unicode escapes avoid encoding issues.
- **What was ambiguous or could cause hesitation:** The RegExp escaping in Step 3 — the executor would need to manually verify backslash counts against the EN block. The Python < 3.12 f-string issue in Step 4 might cause the verification to silently fail, making the executor think everything is fine.
- **Missing context:** (1) No explicit note that the RU_CHECK regex MUST match the EN block regex pattern exactly. (2) No test case for `{count}` interpolation after the fix. Adding a Step 4.5 like `python -c "... check that I18N_FALLBACKS_RU['help.all_requests_cta'] with count=5 returns correct string ..."` would catch Issue #1.
