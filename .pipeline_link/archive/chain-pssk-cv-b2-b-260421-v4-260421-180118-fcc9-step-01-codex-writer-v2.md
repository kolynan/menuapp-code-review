---
chain: pssk-cv-b2-b-260421-v4-260421-180118-fcc9
chain_step: 1
chain_total: 4
chain_step_name: codex-writer-v2
chain_group: writers
chain_group_size: 2
page: Unknown
budget: 10.00
runner: codex
type: chain-step
---
**MANDATORY FIRST STEP — run this before anything else:**
```
git fetch origin 2>/dev/null; git reset --hard origin/main
```
This ensures your working copy is in sync with the remote repository (prevents KB-095 stale-copy issue).

---

Review the file(s) specified in TASK CONTEXT below for a React restaurant QR-menu app on Base44 platform.
Also check README.md and BUGS.md in the same page folder for context (read-only, do NOT modify).

SPEED RULES — this is a time-sensitive pipeline step (KB-142 + S283 WinError 206 fix):
- The source file is NOT inlined (files >500 lines exceed Windows argv limit → WinError 206).
  READ the target file yourself using the Read tool (path is in TASK CONTEXT below, under "Файл и локация").
- For narrow lookups (specific function, line range), prefer Grep/Read with line offsets over full-file reads.
- Do NOT run ripgrep, Get-Content, Select-String, cat, head, tail, or other PowerShell filesystem scans
  on files >200KB — they time out at 11-12 sec per command on Windows (KB-142).
  Use Read tool with offset/limit instead.
- Do NOT dump raw grep output as your answer. Those are not findings.
- You MAY read small auxiliary files (README.md, BUGS.md in same page folder) with narrow commands.
- Limit analysis to the target page code. Be concise.
- Budget guidance: spend ≤2 min on file reads, ≥rest on analysis.

⛔ SCOPE RESTRICTION (MANDATORY):
If the TASK CONTEXT below contains a numbered Fix list (Fix 1, Fix 2, etc.):
- Do NOT report ANY issues outside the numbered Fix list.
- If you see other bugs — IGNORE them completely.
- Your output must contain ONLY findings for Fix 1, Fix 2, etc.
- Extra findings outside the Fix list = task FAILURE.
- BAD example: Task says "Fix 1: button position" → you report touch targets, aria-labels, i18n issues. This is WRONG.
- GOOD example: Task says "Fix 1: button position" → you report ONLY your analysis of Fix 1 (button position). Nothing else.

If there is NO numbered Fix list → find ALL bugs. Focus on: logic errors, missing error handling, i18n issues, UI/UX for mobile-first, React anti-patterns.

For each finding: [P0/P1/P2/P3] Title - Description. FIX: code change needed.

Write findings to (ABSOLUTE PATH — required, see KB-139): C:/Users/ASUS/Dev/Menu AI Cowork/pipeline/chain-state/pssk-cv-b2-b-260421-v4-260421-180118-fcc9-codex-findings.md

**KB-158 write-fallback:** if absolute path write fails (sandbox read-only), fallback to relative `pages/Unknown/pssk-cv-b2-b-260421-v4-260421-180118-fcc9-codex-findings.md`. Always include `pssk-cv-b2-b-260421-v4-260421-180118-fcc9` in filename. NEVER write to generic `review_YYYY-MM-DD.md` — comparator cannot locate it.

FORMAT:
# Codex Writer Findings — Unknown
Chain: pssk-cv-b2-b-260421-v4-260421-180118-fcc9

## Findings
1. [P0/P1/P2/P3] Title — Description. FIX: ...
2. ...

## Summary
Total: N findings (X P0, Y P1, Z P2, W P3)

## Prompt Clarity (MANDATORY — do NOT skip this section)
Rate the task description quality (1-5). For any score below 4, explain what was unclear:
- Overall clarity: [1-5]
- Ambiguous Fix descriptions (list Fix # and what was unclear): ...
- Missing context (what info would have helped): ...
- Scope questions (anything you weren't sure if it's in scope): ...
YOU MUST FILL IN ALL FIELDS ABOVE. Findings without Prompt Clarity are incomplete.

Do NOT apply fixes — only document findings.

=== SOURCE CODE ===
Read the target file(s) yourself using the Read tool.
Paths are specified in TASK CONTEXT below (look for "Файл и локация", "Файл:", or "Target file:").
Self-read mode (S283 fix for WinError 206 on files >500 lines).
=== END SOURCE CODE ===

=== TASK CONTEXT ===
PC-VERDICT: GO
=== END ===
