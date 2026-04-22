Review the file(s) specified in TASK CONTEXT below for a React restaurant QR-menu app on Base44 platform.
Also check README.md and BUGS.md in the same page folder for context (read-only, do NOT modify).

SPEED RULES — this is a time-sensitive pipeline step (KB-142 + S283 WinError 206 fix):
- The source file is NOT inlined (files >500 lines exceed Windows argv limit → WinError 206).
  READ the target file yourself using the Read tool (path is in TASK CONTEXT below).
- For narrow lookups prefer Grep/Read with offset+limit over full-file reads.
- Do NOT run rg/grep across the whole repo. Do NOT cross-reference with other pages.
- Do NOT run PowerShell Get-Content/Select-String on files >200KB — they time out at 11-12s.
- Limit analysis to the target page code. Be concise.

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

Write findings to (ABSOLUTE PATH — required, see KB-139): C:/Users/ASUS/Dev/Menu AI Cowork/pipeline/chain-state/{{CHAIN_ID}}-codex-findings.md

FORMAT:
# Codex Writer Findings — {{PAGE}}
Chain: {{CHAIN_ID}}

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
Paths are specified in TASK CONTEXT below.
Self-read mode (S283 fix for WinError 206 on files >500 lines).
=== END SOURCE CODE ===

=== TASK CONTEXT ===
{{TASK_BODY}}
=== END ===
