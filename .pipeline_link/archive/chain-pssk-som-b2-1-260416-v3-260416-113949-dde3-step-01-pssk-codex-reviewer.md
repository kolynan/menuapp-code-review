---
chain: pssk-som-b2-1-260416-v3-260416-113949-dde3
chain_step: 1
chain_total: 1
chain_step_name: pssk-codex-reviewer
chain_group: reviewers
chain_group_size: 2
page: Unknown
budget: 10.00
runner: codex
type: chain-step
---
You are a Codex code reviewer evaluating the QUALITY of a КС implementation prompt (NOT executing it).

A КС prompt is an instruction document for Claude Code + Codex pipeline to fix code in a React/Base44 app.
Your role: find issues with the PROMPT DESIGN that could cause the execution to fail, produce wrong results, or require clarification.

⛔ DO NOT: run any shell commands that modify state, make any code changes, modify files.
⛔ DO NOT: submit raw grep output or file dumps as your final answer — this will be treated as a failed review.
⛔ DO NOT: create any files in `pipeline/queue/`, `pipeline/staged/`, or any other pipeline directory except the single findings file specified below (`pipeline/chain-state/pssk-som-b2-1-260416-v3-260416-113949-dde3-codex-findings.md`). ⚠️ KB-134: Codex ошибочно создавал ks-*.md в queue/ → ВЧР подхватывал как новую КС → каскадные расходы. Если ты пишешь файл с именем `ks-*`, `pssk-*`, `synth-*`, `d3-*` — это ОШИБКА, твой output должен быть **только** ревью-отчёт по указанному пути. Никаких побочных файлов.
✅ DO: analyze the prompt text AND read the target source file(s) yourself via Read tool (paths in TASK CONTEXT).
✅ MANDATORY: Your response MUST end with a "Fix Ratings" table rating each Fix N/5. No table = incomplete review.

SPEED RULES — this is a time-sensitive pipeline step (KB-142 + S283-Ch4 WinError 206 fix):
- The source file is NOT inlined (files >500 lines exceed Windows argv limit → WinError 206).
  READ the target file yourself using the Read tool. Path is in TASK CONTEXT below (look for "Файл и локация", "Файл:", or "Target file:").
- For narrow lookups (specific function, line range), prefer Grep/Read with line offsets over full-file reads.
- Do NOT run ripgrep, Get-Content, Select-String, cat, head, tail, or other PowerShell filesystem scans on files >200KB — they time out at 11-12 sec per command on Windows (KB-142). Use Read tool with offset/limit.

To verify the prompt's code references — use the file you read:
1. Check line numbers against the actual source
2. Verify function names, variable names, and code snippets match
3. Check that code snippets in the prompt match actual code (correct field names, function signatures, etc.)

For each issue: [CRITICAL/MEDIUM/LOW] Title — Description. PROMPT FIX: what to change in the prompt.

Focus on:
- Incorrect code snippets in the prompt (wrong syntax, wrong function calls, wrong variable names) — verify against actual code
- Missing edge cases the prompt doesn't cover
- Ambiguous instructions Codex might misinterpret
- Safety risks: will this cause unintended file changes?
- Missing context: what info would help Codex execute without hesitation?
- Fix order: are there dependencies between fixes that need explicit sequencing?
- Validation: are the post-fix verification steps sufficient?
- Line numbers: verify all ~line N references against the actual file

Write your findings to (ABSOLUTE PATH — required, see KB-139): C:/Users/ASUS/Dev/Menu AI Cowork/pipeline/chain-state/pssk-som-b2-1-260416-v3-260416-113949-dde3-codex-findings.md

FORMAT (MANDATORY — follow exactly, do NOT skip any section):
# Codex Reviewer Findings — ПССК Prompt Quality Review
Chain: pssk-som-b2-1-260416-v3-260416-113949-dde3

## Issues Found
1. [CRITICAL/MEDIUM/LOW] Title — Description. PROMPT FIX: ...
2. ...

## Summary
Total: N issues (X CRITICAL, Y MEDIUM, Z LOW)

## Additional Risks
Any risks the prompt author may not have considered.

## Prompt Clarity (MANDATORY — do NOT skip)
- Overall clarity: [1-5]
- What was most clear:
- What was ambiguous or could cause hesitation:
- Missing context:

## Fix Ratings (MANDATORY — ALWAYS include this section, even if no issues found)
Rate each Fix mentioned in the prompt. Scale: 1=Rewrite needed, 2=Major issues, 3=Needs clarification, 4=Minor issues, 5=Clear.

| Fix | Rating (1-5) | Verdict | Key issue (if any) |
|-----|-------------|---------|-------------------|
| Fix1 | X/5 | Clear / Needs clarification / Rewrite needed | ... |
| Fix2 | X/5 | ... | ... |
| Fix3 | X/5 | ... | ... |

Overall prompt verdict: APPROVED (all ≥4/5) / NEEDS REVISION (any <4/5)

Do NOT apply any fixes to code files. Analysis only.

=== SOURCE CODE ===
Read the target file(s) yourself using the Read tool.
Paths are specified in TASK CONTEXT below (look for "Файл и локация", "Файл:", or "Target file:").
Self-read mode (S283-Ch4 fix for WinError 206 on files >500 lines).
=== END SOURCE CODE ===

=== TASK CONTEXT ===
# ПССК ревью: SOM Б2.1 — Fix BUG-SM-015 (v3)

**Файл ПССК для ревью:** `pipeline/drafts/pssk-som-b2-1-260416-v3.md`

Прочитай файл ПССК по пути выше и выполни полный prompt-checker ревью (секции A-H):
- Структура (A), Скоуп и файлы (B), Содержание Fix'ов (C), Валидация бага (D), Mobile-first (E), Git (F), КС-специфичные правила (G), Codex-специфичные правила (H).

**Целевой файл:** `menuapp-code-review/pages/StaffOrdersMobile/staffordersmobile.jsx` (4617 lines, RELEASE `260415-01`)
**Контекст файл:** `menuapp-code-review/components/sessionHelpers.js` (232 lines)
**Задача ПССК:** Фикс BUG-SM-015 — новые заказы на закрытый стол появляются в «Завершённых» вместо «Активных».
**Фиксов:** 3 (Fix A: staleTime 30s→5s; Fix B: compositeKey orderGroups + 7 координированных правок; Fix C: invalidate orphan orders useEffect)
**v3 vs v2:** исправлены 3 CRITICAL (working copy sync, data-group-id count 2→3, B.5 pin 3 hits) + 3 MEDIUM (B.6 defensive unconditional, Fix C orders var pre-check, wc -l ±35 unified).

Для каждого пункта чеклиста: ✅ PASS / ❌ FAIL + оценка 1-5 по разделам C/D/G/H.
=== END ===
