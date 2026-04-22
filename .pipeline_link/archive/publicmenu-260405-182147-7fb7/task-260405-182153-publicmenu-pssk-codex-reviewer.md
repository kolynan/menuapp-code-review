---
task_id: task-260405-182153-publicmenu-pssk-codex-reviewer
status: running
started: 2026-04-05T18:21:54+05:00
type: chain-step
page: PublicMenu
work_dir: C:/Dev/menuapp-code-review
budget_usd: 5.00
fallback_model: sonnet
version: 5.17
launcher: python-popen
---

# Task: task-260405-182153-publicmenu-pssk-codex-reviewer

## Config
- Budget: $5.00
- Mode: task-watcher.py launches Claude Code directly via Popen
- Fallback model: sonnet

## Prompt
---
chain: publicmenu-260405-182147-7fb7
chain_step: 1
chain_total: 1
chain_step_name: pssk-codex-reviewer
chain_group: reviewers
chain_group_size: 2
page: PublicMenu
budget: 5.00
runner: codex
type: chain-step
---
You are a Codex code reviewer evaluating the QUALITY of a КС implementation prompt (NOT executing it).

A КС prompt is an instruction document for Claude Code + Codex pipeline to fix code in a React/Base44 app.
Your role: find issues with the PROMPT DESIGN that could cause the execution to fail, produce wrong results, or require clarification.

⛔ DO NOT: read code files, run any commands, make any code changes.
✅ DO: analyze only the prompt text provided below in TASK CONTEXT.

For each issue: [CRITICAL/MEDIUM/LOW] Title — Description. PROMPT FIX: what to change in the prompt.

Focus on:
- Incorrect code snippets in the prompt (wrong syntax, wrong function calls, wrong variable names)
- Missing edge cases the prompt doesn't cover
- Ambiguous instructions Codex might misinterpret
- Safety risks: will this cause unintended file changes?
- Missing context: what info would help Codex execute without hesitation?
- Fix order: are there dependencies between fixes that need explicit sequencing?
- Validation: are the post-fix verification steps sufficient?

Write your findings to: pipeline/chain-state/publicmenu-260405-182147-7fb7-codex-findings.md

FORMAT:
# Codex Reviewer Findings — ПССК Prompt Quality Review
Chain: publicmenu-260405-182147-7fb7

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

Do NOT apply any fixes to code files. Analysis only.

=== TASK CONTEXT ===
You are reviewing the quality of a ССП implementation prompt for a React/Base44 app.
DO NOT execute the changes. DO NOT read code files. Only review the prompt quality.

Context: Add I18N_FALLBACKS_RU object to x.jsx (~5214 lines) and modify makeSafeT() to check RU fallbacks first when lang === 'ru'. Fixes help.* and cart.my_bill showing English in Russian mode. Two Python string insertions via str.replace().

Find issues with the PROMPT DESIGN:
1. Incorrect code snippets (wrong syntax, variable names, Python string handling)
2. Missing edge cases (encoding issues, str.replace collision risk, anchor not found fallback)
3. Ambiguous instructions
4. Safety risks (unintended file changes, wrong insertion point)
5. Validation: are post-fix checks sufficient?
6. Unicode handling: are Cyrillic characters encoded correctly for writing to UTF-8 JSX file?

---

START

Auto-approve all file edits, terminal commands, git operations, and network access without asking. Do not ask for confirmation on any step. Execute autonomously until the task is fully complete. At the end, write a section "## Permissions Requested".

## Task: Add I18N_FALLBACKS_RU to x.jsx — fix Russian mode showing English strings

**Root cause:** B44 stores help.* and cart.my_bill keys with English values in its Translations dictionary (added in S218 for EN mode fix). In RU mode, makeSafeT receives "Remind" from rawT() instead of the key "help.remind" — passes it as a valid translation — shows English to Russian-speaking guests.

**Fix:** Add I18N_FALLBACKS_RU object (RU strings) after I18N_FALLBACKS, then modify makeSafeT to check I18N_FALLBACKS_RU first when lang === 'ru'. Same pattern as EN mode checks I18N_FALLBACKS first.

**Target file:** `pages/PublicMenu/x.jsx` (~5214 lines, RELEASE: `260404-02 PublicMenu x RELEASE.jsx`)

If `wc -l pages/PublicMenu/x.jsx` gives less than 5200 — restore from RELEASE:
```
cp "pages/PublicMenu/260404-02 PublicMenu x RELEASE.jsx" pages/PublicMenu/x.jsx
```

---

## FROZEN UX (DO NOT CHANGE)
- `I18N_FALLBACKS` object — keep ALL existing keys and English values exactly as-is
- `makeSafeT` EN block (`if (lang === 'en') { ... }`) — do NOT modify
- `const tr = (key, fallback) => ...` function — do NOT modify
- All component JSX, hooks, handlers — do NOT touch

---

## Step 0: Verify no smart quotes (KB-118)
```
python -c "
data = open('pages/PublicMenu/x.jsx', encoding='utf-8').read()
n = data.count('\u201c') + data.count('\u201d')
print(f'Smart quotes: {n} (expect 0)')
"
```
If non-zero → STOP and report.

## Step 1: Confirm anchor points
```
grep -n "help.chip.water\|function makeSafeT\|EN mode: I18N_FALLBACKS\|Try the real translation" pages/PublicMenu/x.jsx
```
Confirm all 4 patterns exist. If any missing → STOP.

## Step 2: Insert I18N_FALLBACKS_RU after I18N_FALLBACKS

```python
content = open('pages/PublicMenu/x.jsx', encoding='utf-8', newline='').read()

RU_BLOCK = """\n// i18n RU FALLBACK MAP — RU fallbacks for keys B44 stores with English values\nconst I18N_FALLBACKS_RU = {\n  "help.title": "\\u041d\\u0443\\u0436\\u043d\\u0430 \\u043f\\u043e\\u043c\\u043e\\u0449\\u044c?",\n  "help.sent": "\\u041e\\u0442\\u043f\\u0440\\u0430\\u0432\\u043b\\u0435\\u043d\\u043e",\n  "help.cancel": "\\u041e\\u0442\\u043c\\u0435\\u043d\\u0430",\n  "help.all_requests_cta": "\\u0412\\u0441\\u0435 \\u0437\\u0430\\u043f\\u0440\\u043e\\u0441\\u044b ({count})",\n  "help.back_to_help": "\\u041d\\u0430\\u0437\\u0430\\u0434",\n  "help.show_more": "\\u0415\\u0449\\u0451",\n  "help.call_waiter": "\\u0412\\u044b\\u0437\\u0432\\u0430\\u0442\\u044c \\u043e\\u0444\\u0438\\u0446\\u0438\\u0430\\u043d\\u0442\\u0430",\n  "help.get_bill": "\\u041f\\u0440\\u0438\\u043d\\u0435\\u0441\\u0442\\u0438 \\u0441\\u0447\\u0451\\u0442",\n  "help.request_napkins": "\\u0421\\u0430\\u043b\\u0444\\u0435\\u0442\\u043a\\u0438",\n  "help.request_menu": "\\u041c\\u0435\\u043d\\u044e",\n  "help.other": "\\u0414\\u0440\\u0443\\u0433\\u043e\\u0435",\n  "help.other_label": "\\u0414\\u0440\\u0443\\u0433\\u043e\\u0435",\n  "help.send_more": "\\u0415\\u0449\\u0451 \\u0437\\u0430\\u043f\\u0440\\u043e\\u0441",\n  "help.sending_now": "\\u041e\\u0442\\u043f\\u0440\\u0430\\u0432\\u043b\\u044f\\u0435\\u043c\\u2026",\n  "help.retry": "\\u041f\\u043e\\u0432\\u0442\\u043e\\u0440\\u0438\\u0442\\u044c",\n  "help.remind": "\\u041d\\u0430\\u043f\\u043e\\u043c\\u043d\\u0438\\u0442\\u044c",\n  "help.retry_in": "\\u0427\\u0435\\u0440\\u0435\\u0437",\n  "help.just_sent": "\\u0422\\u043e\\u043b\\u044c\\u043a\\u043e \\u0447\\u0442\\u043e",\n  "help.waiting_prefix": "\\u041e\\u0436\\u0438\\u0434\\u0430\\u043d\\u0438\\u0435",\n  "help.minutes_short": "\\u043c\\u0438\\u043d",\n  "help.reminded_just_now": "\\u0422\\u043e\\u043b\\u044c\\u043a\\u043e \\u0447\\u0442\\u043e \\u043d\\u0430\\u043f\\u043e\\u043c\\u043d\\u0438\\u043b\\u0438",\n  "help.reminded_prefix": "\\u041d\\u0430\\u043f\\u043e\\u043c\\u043d\\u0438\\u043b\\u0438",\n  "help.last_reminder_prefix": "\\u041f\\u043e\\u0441\\u043b\\u0435\\u0434\\u043d\\u0435\\u0435",\n  "help.reminder_sent": "\\u041d\\u0430\\u043f\\u043e\\u043c\\u0438\\u043d\\u0430\\u043d\\u0438\\u0435 \\u043e\\u0442\\u043f\\u0440\\u0430\\u0432\\u043b\\u0435\\u043d\\u043e",\n  "help.resolved_call_waiter": "\\u2705 \\u041e\\u0444\\u0438\\u0446\\u0438\\u0430\\u043d\\u0442 \\u043f\\u0440\\u0438\\u0448\\u0451\\u043b \\u00b7 \\u0421\\u043f\\u0430\\u0441\\u0438\\u0431\\u043e!",\n  "help.resolved_bill": "\\u2705 \\u0421\\u0447\\u0451\\u0442 \\u043f\\u0440\\u0438\\u043d\\u0435\\u0441\\u043b\\u0438 \\u00b7 \\u0421\\u043f\\u0430\\u0441\\u0438\\u0431\\u043e!",\n  "help.resolved_napkins": "\\u2705 \\u0421\\u0430\\u043b\\u0444\\u0435\\u0442\\u043a\\u0438 \\u043f\\u0440\\u0438\\u043d\\u0435\\u0441\\u043b\\u0438 \\u00b7 \\u0421\\u043f\\u0430\\u0441\\u0438\\u0431\\u043e!",\n  "help.resolved_menu": "\\u2705 \\u041c\\u0435\\u043d\\u044e \\u043f\\u0440\\u0438\\u043d\\u0435\\u0441\\u043b\\u0438 \\u00b7 \\u0421\\u043f\\u0430\\u0441\\u0438\\u0431\\u043e!",\n  "help.resolved_other": "\\u2705 \\u0413\\u043e\\u0442\\u043e\\u0432\\u043e \\u00b7 \\u0421\\u043f\\u0430\\u0441\\u0438\\u0431\\u043e!",\n  "help.no_connection": "\\u041d\\u0435\\u0442 \\u0441\\u043e\\u0435\\u0434\\u0438\\u043d\\u0435\\u043d\\u0438\\u044f",\n  "help.try_again": "\\u041f\\u043e\\u043f\\u0440\\u043e\\u0431\\u0443\\u0439\\u0442\\u0435 \\u0441\\u043d\\u043e\\u0432\\u0430",\n  "help.remind_failed": "\\u041d\\u0435 \\u0443\\u0434\\u0430\\u043b\\u043e\\u0441\\u044c \\u043d\\u0430\\u043f\\u043e\\u043c\\u043d\\u0438\\u0442\\u044c",\n  "help.send_failed": "\\u041d\\u0435 \\u0443\\u0434\\u0430\\u043b\\u043e\\u0441\\u044c \\u043e\\u0442\\u043f\\u0440\\u0430\\u0432\\u0438\\u0442\\u044c",\n  "help.restoring_status": "\\u0412\\u043e\\u0441\\u0441\\u0442\\u0430\\u043d\\u0430\\u0432\\u043b\\u0438\\u0432\\u0430\\u0435\\u043c\\u2026",\n  "help.offline_status": "\\u041d\\u0435\\u0442 \\u0441\\u043e\\u0435\\u0434\\u0438\\u043d\\u0435\\u043d\\u0438\\u044f \\u00b7 \\u043f\\u043e\\u0432\\u0442\\u043e\\u0440\\u0438\\u043c \\u0430\\u0432\\u0442\\u043e\\u043c\\u0430\\u0442\\u0438\\u0447\\u0435\\u0441\\u043a\\u0438",\n  "help.stale_status": "\\u0414\\u0430\\u043d\\u043d\\u044b\\u0435 \\u043c\\u043e\\u0433\\u043b\\u0438 \\u0443\\u0441\\u0442\\u0430\\u0440\\u0435\\u0442\\u044c",\n  "help.seconds_short": "\\u0441\\u0435\\u043a",\n  "help.updated_label": "\\u041e\\u0431\\u043d\\u043e\\u0432\\u043b\\u0435\\u043d\\u043e",\n  "help.ago": "\\u043d\\u0430\\u0437\\u0430\\u0434",\n  "help.reminder": "\\u043d\\u0430\\u043f\\u043e\\u043c\\u0438\\u043d\\u0430\\u043d\\u0438\\u0435",\n  "help.reminders": "\\u043d\\u0430\\u043f\\u043e\\u043c\\u0438\\u043d\\u0430\\u043d\\u0438\\u044f",\n  "help.chip.high_chair": "\\u0414\\u0435\\u0442\\u0441\\u043a\\u043e\\u0435 \\u043a\\u0440\\u0435\\u0441\\u043b\\u043e",\n  "help.chip.cutlery": "\\u041f\\u0440\\u0438\\u0431\\u043e\\u0440\\u044b",\n  "help.chip.sauce": "\\u0421\\u043e\\u0443\\u0441",\n  "help.chip.clear_table": "\\u0423\\u0431\\u0440\\u0430\\u0442\\u044c \\u0441\\u0442\\u043e\\u043b",\n  "help.chip.water": "\\u0412\\u043e\\u0434\\u0430",\n  "cart.my_bill": "\\u041c\\u043e\\u0439 \\u0441\\u0447\\u0451\\u0442",\n};\n"""

marker = '};\n\n/**\n * Wraps raw t()'
if marker not in content:
    print('ERROR: anchor not found')
else:
    new_content = content.replace(marker, '};\n' + RU_BLOCK + '\n/**\n * Wraps raw t()', 1)
    open('pages/PublicMenu/x.jsx', 'w', encoding='utf-8', newline='').write(new_content)
    print('Step 2 done')
```

## Step 3: Modify makeSafeT — add RU block

```python
content = open('pages/PublicMenu/x.jsx', encoding='utf-8', newline='').read()

RU_CHECK = """    // RU mode: check RU fallbacks first (B44 may have stored EN values for these keys)\n    if (lang === 'ru') {\n      let fb = I18N_FALLBACKS_RU[key];\n      if (fb != null && fb !== '') {\n        if (params && typeof params === "object") {\n          Object.entries(params).forEach(([k, v]) => {\n            fb = fb.replace(new RegExp(`\\\\\\\\{${k}\\\\\\\\}`, "g"), String(v ?? ""));\n          });\n        }\n        return fb;\n      }\n    }\n"""

marker = "    }\n    // Try the real translation first"
if marker not in content:
    print('ERROR: anchor not found')
else:
    new_content = content.replace(marker, "    }\n" + RU_CHECK + "    // Try the real translation first", 1)
    open('pages/PublicMenu/x.jsx', 'w', encoding='utf-8', newline='').write(new_content)
    print('Step 3 done')
```

## Step 4: Verify
```
python -c "
data = open('pages/PublicMenu/x.jsx', encoding='utf-8').read()
checks = ['I18N_FALLBACKS_RU', 'cart.my_bill', \"lang === 'ru'\", 'RU mode: check RU fallbacks']
for c in checks:
    print(f'{'OK' if c in data else 'MISSING'}: {c}')
print(f'Lines: {len(data.splitlines())} (expect 5270+)')
"
```

## Step 5: KB-095 check
```
python -c "
import subprocess
wc = len(open('pages/PublicMenu/x.jsx', encoding='utf-8').readlines())
res = subprocess.run(['git','show','HEAD:pages/PublicMenu/x.jsx'], capture_output=True, text=True, encoding='utf-8')
gc = len(res.stdout.splitlines())
print(f'Working: {wc}, HEAD: {gc}')
print('OK' if wc > 5200 and wc > gc else 'WARNING')
"
```

## Step 6: Git commit + RELEASE
```
git add pages/PublicMenu/x.jsx
git commit -m "Add I18N_FALLBACKS_RU: RU fallbacks for help.* + cart.my_bill [HD-23, PM-166]"
git push
cp "pages/PublicMenu/x.jsx" "pages/PublicMenu/260404-03 PublicMenu x RELEASE.jsx"
```

## Self-check
Before executing, list:
1. Any ambiguities
2. Risks that might cause stalling
3. Execution plan

## Post-task review
1. Rate 1-10
2. What was unclear?
3. What would improve this prompt?
4. Token efficiency notes

## Permissions Requested

END
=== END ===


## Status
Running...
