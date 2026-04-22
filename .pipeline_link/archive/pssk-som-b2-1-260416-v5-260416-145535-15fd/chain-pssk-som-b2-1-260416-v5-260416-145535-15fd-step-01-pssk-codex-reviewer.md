---
chain: pssk-som-b2-1-260416-v5-260416-145535-15fd
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
⛔ DO NOT: create any files in `pipeline/queue/`, `pipeline/staged/`, or any other pipeline directory except the single findings file specified below (`pipeline/chain-state/pssk-som-b2-1-260416-v5-260416-145535-15fd-codex-findings.md`). ⚠️ KB-134: Codex ошибочно создавал ks-*.md в queue/ → ВЧР подхватывал как новую КС → каскадные расходы. Если ты пишешь файл с именем `ks-*`, `pssk-*`, `synth-*`, `d3-*` — это ОШИБКА, твой output должен быть **только** ревью-отчёт по указанному пути. Никаких побочных файлов.
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

Write your findings to (ABSOLUTE PATH — required, see KB-139): C:/Users/ASUS/Dev/Menu AI Cowork/pipeline/chain-state/pssk-som-b2-1-260416-v5-260416-145535-15fd-codex-findings.md

FORMAT (MANDATORY — follow exactly, do NOT skip any section):
# Codex Reviewer Findings — ПССК Prompt Quality Review
Chain: pssk-som-b2-1-260416-v5-260416-145535-15fd

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
# ПССК ревью: SOM Б2.1 — Fix BUG-SM-015 (v5)

**Файл ПССК для ревью:** `pipeline/drafts/pssk-som-b2-1-260416-v5.md`

Прочитай файл ПССК по пути выше и выполни полный prompt-checker ревью (секции A-H):
- Структура (A), Скоуп и файлы (B), Содержание Fix'ов (C), Валидация бага (D), Mobile-first (E), Git (F), КС-специфичные правила (G), Codex-специфичные правила (H).

**Целевой файл:** `menuapp-code-review/pages/StaffOrdersMobile/staffordersmobile.jsx` (~4617 строк, RELEASE `260415-01`)
**Контекст файл:** `menuapp-code-review/components/sessionHelpers.js` (232 строки)
**Задача ПССК:** Фикс BUG-SM-015 — новые заказы на закрытый стол появляются в «Завершённых» вместо «Активных».
**Фиксов:** 3 (Fix A: `staleTime` 30s→5s; Fix B: `compositeKey` orderGroups + 5 call-site правок + B.5/B.6 + B.7 no-change; Fix C: invalidate orphan orders useEffect с one-shot guard)

## История версий

- **v2** (260416 10:14) → pssk-review → 4 CRITICAL + 3 MEDIUM blockers (rate-limit race, working-copy drift, grep count misalignment).
- **v3** (260416 11:39) → pssk-review → v5.10 watcher fix (KB-142 ✅), но chain infrastructure ошибки.
- **v4** (260416 13:24) → pssk-review → DONE 24m, $1.19. CC: 11 issues (1 CRITICAL + 4 MEDIUM + 6 LOW). Codex: 6 issues (4 CRITICAL + 2 MEDIUM) — найден через watcher fallback (KB-165 ✅).
- **v5** (260416 14:50) — текущая. 15 уникальных findings после dedupe адресованы:
  - **[V5-C1..C4]** 4 CRITICAL: (C1) `openSessions` queryKey shape `["openSessions", partnerId]` + prefix-invalidate note; (C2) Fix C anchor `data: orders,` @ ~3497 вместо `^  const orders ` (matches helper @ 1130); (C3) `handleBannerNavigate` call chain (2 direct + indirect via `banner.groupId`); (C4) Fix C verification с реальными именами (`orphanInvalidateSigRef` + `orphanPairs`).
  - **[V5-M1..M5]** 5 MEDIUM: (M1) Fix B.5 live JSX only (~2292), comments optional; (M2) B.4 pre-flight pinned 4 anchors + disambiguating context; (M3) `useQueryClient` pre-check; (M4) Codex Execution Mode single self-read path; (M5) wc-l asymmetric `+70/-35` explicit.
  - **[V5-L1..L6]** 6 LOW: (L1) «Servedot» → «servedOrders»; (L2) `git diff --quiet` gate; (L3) B.6 identity churn note; (L4) loose regex на `data-group-id`; (L5) react import pre-check; (L6) Identifier Contract extended с upstream banner rows.

**Цель:** обе рецензии (CC + Codex) — Prompt Clarity ≥4/5, Fix ratings ≥4/5, verdict APPROVE (нет CRITICAL).

Для каждого пункта чеклиста: ✅ PASS / ❌ FAIL + оценка 1-5 по разделам C/D/G/H.
=== END ===
