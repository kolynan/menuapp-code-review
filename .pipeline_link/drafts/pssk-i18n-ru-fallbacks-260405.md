# Add I18N_FALLBACKS_RU to x.jsx — ССП Prompt Draft
# Saved: S222, 2026-04-05

---

START

Auto-approve all file edits, terminal commands, git operations, and network access without asking. Do not ask for confirmation on any step. Execute autonomously until the task is fully complete. At the end, write a section "## Permissions Requested".

## Task: Add I18N_FALLBACKS_RU to x.jsx — fix Russian mode showing English strings

**Root cause:** B44 stores help.* and cart.my_bill keys with English values in its Translations dictionary (added in S218 for EN mode fix). In RU mode, makeSafeT receives "Remind" from rawT() instead of the key "help.remind" → passes it as a valid translation → shows English to Russian-speaking guests.

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
- All existing RU translations in B44 dictionary — not our concern

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

---

## Step 1: Confirm anchor points (read only, no changes)

Run:
```
grep -n "help.chip.water\|function makeSafeT\|EN mode: I18N_FALLBACKS\|Try the real translation" pages/PublicMenu/x.jsx
```

Expected output (approximate line numbers):
- `"help.chip.water": "Water",` — last entry before `};` that closes I18N_FALLBACKS
- `function makeSafeT(rawT, lang)` — start of the function
- `// EN mode: I18N_FALLBACKS is the authoritative EN source` — inside makeSafeT
- `// Try the real translation first` — after the EN if-block closes

Confirm these patterns exist. If any is missing → STOP and report.

---

## Step 2: Insert I18N_FALLBACKS_RU after I18N_FALLBACKS

Use Python to insert exactly this block between the closing `};` of I18N_FALLBACKS and the `/**` comment that starts makeSafeT:

```python
content = open('pages/PublicMenu/x.jsx', encoding='utf-8', newline='').read()

RU_BLOCK = """\n// i18n RU FALLBACK MAP — RU fallbacks for keys B44 stores with English values\n// Checked first in RU mode, same pattern as I18N_FALLBACKS for EN mode.\nconst I18N_FALLBACKS_RU = {\n  "help.title": "\\u041d\\u0443\\u0436\\u043d\\u0430 \\u043f\\u043e\\u043c\\u043e\\u0449\\u044c?",\n  "help.sent": "\\u041e\\u0442\\u043f\\u0440\\u0430\\u0432\\u043b\\u0435\\u043d\\u043e",\n  "help.cancel": "\\u041e\\u0442\\u043c\\u0435\\u043d\\u0430",\n  "help.all_requests_cta": "\\u0412\\u0441\\u0435 \\u0437\\u0430\\u043f\\u0440\\u043e\\u0441\\u044b ({count})",\n  "help.back_to_help": "\\u041d\\u0430\\u0437\\u0430\\u0434",\n  "help.show_more": "\\u0415\\u0449\\u0451",\n  "help.call_waiter": "\\u0412\\u044b\\u0437\\u0432\\u0430\\u0442\\u044c \\u043e\\u0444\\u0438\\u0446\\u0438\\u0430\\u043d\\u0442\\u0430",\n  "help.get_bill": "\\u041f\\u0440\\u0438\\u043d\\u0435\\u0441\\u0442\\u0438 \\u0441\\u0447\\u0451\\u0442",\n  "help.request_napkins": "\\u0421\\u0430\\u043b\\u0444\\u0435\\u0442\\u043a\\u0438",\n  "help.request_menu": "\\u041c\\u0435\\u043d\\u044e",\n  "help.other": "\\u0414\\u0440\\u0443\\u0433\\u043e\\u0435",\n  "help.other_label": "\\u0414\\u0440\\u0443\\u0433\\u043e\\u0435",\n  "help.send_more": "\\u0415\\u0449\\u0451 \\u0437\\u0430\\u043f\\u0440\\u043e\\u0441",\n  "help.sending_now": "\\u041e\\u0442\\u043f\\u0440\\u0430\\u0432\\u043b\\u044f\\u0435\\u043c\\u2026",\n  "help.retry": "\\u041f\\u043e\\u0432\\u0442\\u043e\\u0440\\u0438\\u0442\\u044c",\n  "help.remind": "\\u041d\\u0430\\u043f\\u043e\\u043c\\u043d\\u0438\\u0442\\u044c",\n  "help.retry_in": "\\u0427\\u0435\\u0440\\u0435\\u0437",\n  "help.just_sent": "\\u0422\\u043e\\u043b\\u044c\\u043a\\u043e \\u0447\\u0442\\u043e",\n  "help.waiting_prefix": "\\u041e\\u0436\\u0438\\u0434\\u0430\\u043d\\u0438\\u0435",\n  "help.minutes_short": "\\u043c\\u0438\\u043d",\n  "help.reminded_just_now": "\\u0422\\u043e\\u043b\\u044c\\u043a\\u043e \\u0447\\u0442\\u043e \\u043d\\u0430\\u043f\\u043e\\u043c\\u043d\\u0438\\u043b\\u0438",\n  "help.reminded_prefix": "\\u041d\\u0430\\u043f\\u043e\\u043c\\u043d\\u0438\\u043b\\u0438",\n  "help.last_reminder_prefix": "\\u041f\\u043e\\u0441\\u043b\\u0435\\u0434\\u043d\\u0435\\u0435",\n  "help.reminder_sent": "\\u041d\\u0430\\u043f\\u043e\\u043c\\u0438\\u043d\\u0430\\u043d\\u0438\\u0435 \\u043e\\u0442\\u043f\\u0440\\u0430\\u0432\\u043b\\u0435\\u043d\\u043e",\n  "help.resolved_call_waiter": "\\u2705 \\u041e\\u0444\\u0438\\u0446\\u0438\\u0430\\u043d\\u0442 \\u043f\\u0440\\u0438\\u0448\\u0451\\u043b \\xb7 \\u0421\\u043f\\u0430\\u0441\\u0438\\u0431\\u043e!",\n  "help.resolved_bill": "\\u2705 \\u0421\\u0447\\u0451\\u0442 \\u043f\\u0440\\u0438\\u043d\\u0435\\u0441\\u043b\\u0438 \\xb7 \\u0421\\u043f\\u0430\\u0441\\u0438\\u0431\\u043e!",\n  "help.resolved_napkins": "\\u2705 \\u0421\\u0430\\u043b\\u0444\\u0435\\u0442\\u043a\\u0438 \\u043f\\u0440\\u0438\\u043d\\u0435\\u0441\\u043b\\u0438 \\xb7 \\u0441\\u043f\\u0430\\u0441\\u0438\\u0431\\u043e!",\n  "help.resolved_menu": "\\u2705 \\u041c\\u0435\\u043d\\u044e \\u043f\\u0440\\u0438\\u043d\\u0435\\u0441\\u043b\\u0438 \\xb7 \\u0421\\u043f\\u0430\\u0441\\u0438\\u0431\\u043e!",\n  "help.resolved_other": "\\u2705 \\u0413\\u043e\\u0442\\u043e\\u0432\\u043e \\xb7 \\u0421\\u043f\\u0430\\u0441\\u0438\\u0431\\u043e!",\n  "help.no_connection": "\\u041d\\u0435\\u0442 \\u0441\\u043e\\u0435\\u0434\\u0438\\u043d\\u0435\\u043d\\u0438\\u044f",\n  "help.try_again": "\\u041f\\u043e\\u043f\\u0440\\u043e\\u0431\\u0443\\u0439\\u0442\\u0435 \\u0441\\u043d\\u043e\\u0432\\u0430",\n  "help.remind_failed": "\\u041d\\u0435 \\u0443\\u0434\\u0430\\u043b\\u043e\\u0441\\u044c \\u043d\\u0430\\u043f\\u043e\\u043c\\u043d\\u0438\\u0442\\u044c",\n  "help.send_failed": "\\u041d\\u0435 \\u0443\\u0434\\u0430\\u043b\\u043e\\u0441\\u044c \\u043e\\u0442\\u043f\\u0440\\u0430\\u0432\\u0438\\u0442\\u044c",\n  "help.restoring_status": "\\u0412\\u043e\\u0441\\u0441\\u0442\\u0430\\u043d\\u0430\\u0432\\u043b\\u0438\\u0432\\u0430\\u0435\\u043c\\u2026",\n  "help.offline_status": "\\u041d\\u0435\\u0442 \\u0441\\u043e\\u0435\\u0434\\u0438\\u043d\\u0435\\u043d\\u0438\\u044f \\xb7 \\u043f\\u043e\\u0432\\u0442\\u043e\\u0440\\u0438\\u043c \\u0430\\u0432\\u0442\\u043e\\u043c\\u0430\\u0442\\u0438\\u0447\\u0435\\u0441\\u043a\\u0438",\n  "help.stale_status": "\\u0414\\u0430\\u043d\\u043d\\u044b\\u0435 \\u043c\\u043e\\u0433\\u043b\\u0438 \\u0443\\u0441\\u0442\\u0430\\u0440\\u0435\\u0442\\u044c",\n  "help.seconds_short": "\\u0441\\u0435\\u043a",\n  "help.updated_label": "\\u041e\\u0431\\u043d\\u043e\\u0432\\u043b\\u0435\\u043d\\u043e",\n  "help.ago": "\\u043d\\u0430\\u0437\\u0430\\u0434",\n  "help.reminder": "\\u043d\\u0430\\u043f\\u043e\\u043c\\u0438\\u043d\\u0430\\u043d\\u0438\\u0435",\n  "help.reminders": "\\u043d\\u0430\\u043f\\u043e\\u043c\\u0438\\u043d\\u0430\\u043d\\u0438\\u044f",\n  "help.chip.high_chair": "\\u0414\\u0435\\u0442\\u0441\\u043a\\u043e\\u0435 \\u043a\\u0440\\u0435\\u0441\\u043b\\u043e",\n  "help.chip.cutlery": "\\u041f\\u0440\\u0438\\u0431\\u043e\\u0440\\u044b",\n  "help.chip.sauce": "\\u0421\\u043e\\u0443\\u0441",\n  "help.chip.clear_table": "\\u0423\\u0431\\u0440\\u0430\\u0442\\u044c \\u0441\\u0442\\u043e\\u043b",\n  "help.chip.water": "\\u0412\\u043e\\u0434\\u0430",\n  "cart.my_bill": "\\u041c\\u043e\\u0439 \\u0441\\u0447\\u0451\\u0442",\n};\n"""

# Insert after I18N_FALLBACKS closing brace, before makeSafeT JSDoc comment
marker = '};\n\n/**\n * Wraps raw t()'
replacement = '};\n' + RU_BLOCK + '\n/**\n * Wraps raw t()'
if marker not in content:
    print('ERROR: anchor not found — check file manually')
else:
    new_content = content.replace(marker, replacement, 1)
    open('pages/PublicMenu/x.jsx', 'w', encoding='utf-8', newline='').write(new_content)
    print('Step 2 done: I18N_FALLBACKS_RU inserted')
```

---

## Step 3: Modify makeSafeT — add RU block after EN block

Insert RU check block after the closing `}` of the EN if-block, before `// Try the real translation first`:

```python
content = open('pages/PublicMenu/x.jsx', encoding='utf-8', newline='').read()

RU_CHECK = """    // RU mode: check RU fallbacks first (B44 may have stored EN values for these keys)
    if (lang === 'ru') {
      let fb = I18N_FALLBACKS_RU[key];
      if (fb != null && fb !== '') {
        if (params && typeof params === "object") {
          Object.entries(params).forEach(([k, v]) => {
            fb = fb.replace(new RegExp(`\\\\{${k}\\\\}`, "g"), String(v ?? ""));
          });
        }
        return fb;
      }
    }
"""

marker = "    }\n    // Try the real translation first"
if marker not in content:
    print('ERROR: EN-block close anchor not found')
else:
    new_content = content.replace(marker, "    }\n" + RU_CHECK + "    // Try the real translation first", 1)
    open('pages/PublicMenu/x.jsx', 'w', encoding='utf-8', newline='').write(new_content)
    print('Step 3 done: RU block added to makeSafeT')
```

---

## Step 4: Verify

```
python -c "
data = open('pages/PublicMenu/x.jsx', encoding='utf-8').read()
checks = ['I18N_FALLBACKS_RU', 'cart.my_bill', \"lang === 'ru'\", 'RU mode: check RU fallbacks']
for c in checks:
    print(f'{'OK' if c in data else 'MISSING'}: {c}')
wc = len(data.splitlines())
print(f'Lines: {wc} (expect ~5270+)')
"
```

All 4 items must show OK. If any MISSING → stop and report.

---

## Step 5: KB-095 check

```
python -c "
import subprocess
wc = len(open('pages/PublicMenu/x.jsx', encoding='utf-8').readlines())
res = subprocess.run(['git','show','HEAD:pages/PublicMenu/x.jsx'], capture_output=True, text=True, encoding='utf-8')
gc = len(res.stdout.splitlines())
print(f'Working copy: {wc} lines')
print(f'git HEAD: {gc} lines')
print(f'KB-095: OK' if wc > 5200 and wc > gc else 'WARNING: check manually')
"
```

---

## Step 6: Git commit + RELEASE

```
git add pages/PublicMenu/x.jsx
git commit -m "Add I18N_FALLBACKS_RU: RU fallbacks for help.* + cart.my_bill [HD-23, PM-166]"
git push
cp "pages/PublicMenu/x.jsx" "pages/PublicMenu/260404-03 PublicMenu x RELEASE.jsx"
```

---

## Self-check
Before executing, list:
1. Any ambiguities in this prompt
2. Any risks that might cause stalling
3. Execution plan (Step 0 → 1 → 2 → 3 → 4 → 5 → 6)
If you see a problem, propose a fix before proceeding.

## Post-task review
1. Rate this prompt 1-10 for clarity and executability
2. What was unclear or caused hesitation?
3. What would you change in this prompt to make it faster to execute?
4. Token efficiency: where did you spend the most tokens? Suggest specific prompt changes.

## Permissions Requested

END
