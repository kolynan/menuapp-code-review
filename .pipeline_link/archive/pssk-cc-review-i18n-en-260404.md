task_id: pssk-cc-review-i18n-en-260404
chain_template: discussion-only
budget_usd: 3
model: claude-sonnet-4-5
page: PublicMenu

discussion_topic: |
  You are reviewing a draft implementation prompt (ССП task for Claude Code Desktop).
  Your role: CC reviewer. DO NOT execute the changes. Only review the prompt quality.

  Context: The prompt fixes EN language mode in PublicMenu/x.jsx (5184 lines).
  When user selects English, some UI strings remain Russian because I18N_FALLBACKS
  dictionary has Russian fallback values. The fix: replace all Russian values with
  English, and fix 3 hardcoded Russian string locations.

  Review the draft prompt below. Return:
  1. List of issues (ambiguities, risks, missing info, wrong assumptions)
  2. Specific improved sections (rewrite any problematic parts)
  3. Final verdict: is this prompt ready to execute or does it need revision?

  Focus especially on:
  - Are line numbers reliable for x.jsx (5184 lines, could shift)?
  - Should the prompt reference the RELEASE file instead of x.jsx?
  - Is Fix 1 (replacing 250 lines of dictionary) safe to do in one shot?
  - Any edge cases in Fix 2b (getHelpReminderWord rewrite — tr dependency change)?
  - Is the validation section sufficient?
  - Anything that could cause CC to stall or make a mistake?

  ---
  DRAFT PROMPT TO REVIEW:
  ---

  START

  Auto-approve all file edits, terminal commands, git operations, and network access without asking. Do not ask for confirmation on any step. Execute autonomously until the task is fully complete. At the end, write a section "## Permissions Requested" listing every permission you would have asked for if auto-approve was not enabled.

  Within 5 minutes of starting, begin editing files.

  ## Goal

  Fix EN language mode in PublicMenu (x.jsx). When user selects English, some UI strings remain in Russian because the local I18N_FALLBACKS dictionary has Russian values. Replace all Russian fallback values with English equivalents, and fix 3 hardcoded Russian string locations.

  ## File

  `pages/PublicMenu/x.jsx` (5184 lines). Do NOT read the full file.
  Inspect only the specific line ranges listed below.

  ## Fix 1 — Replace I18N_FALLBACKS dictionary (lines 323–569)

  Read lines 323–575 to confirm boundaries, then replace the entire block from line 327 (`const I18N_FALLBACKS = {`) through line 569 (`};`) with the following content:

  [NEW DICTIONARY — 180 entries, all English values, including help.* entries unchanged]
  (Full content in pipeline/drafts/pssk-i18n-en-260404.md — Fix 1 section)

  ## Fix 2 — Hardcoded Russian strings (4 surgical changes)

  Read lines 1713–1716 and 2448–2476 and 2513–2516 only (±3 lines context).

  ### Fix 2a — HELP_CHIPS (line 1715)
  Change: `['Детский стул', 'Приборы', 'Соус', 'Убрать со стола', 'Вода']`
  To:     `['High chair', 'Cutlery', 'Sauce', 'Clear the table', 'Water']`

  ### Fix 2b — getHelpReminderWord (lines 2448–2454)
  Change: Russian plural logic (mod10/mod100)
  To: `return count === 1 ? tr('help.reminder', 'reminder') : tr('help.reminders', 'reminders');`
  (adds `tr` to useCallback dependency array)

  ### Fix 2c — "назад" in 3 template literals (lines 2472, 2475, 2515)
  Change: hardcoded `назад`
  To: `${tr('help.ago', 'ago')}`

  ## FROZEN UX (DO NOT CHANGE)
  - makeSafeT() function
  - tr() function definition
  - All JSX component logic
  - help.* entries in I18N_FALLBACKS (already English)

  ## Known Issues
  KB-095: CC may truncate large files. After commit verify:
  `git show HEAD:pages/PublicMenu/x.jsx | wc -l` vs `wc -l pages/PublicMenu/x.jsx`

  ## Validation
  1. grep Cyrillic in I18N_FALLBACKS (python3 script)
  2. grep "назад" after line 1000
  3. node syntax check
  4. wc -l line count

  ## Git
  `git add pages/PublicMenu/x.jsx && git commit -m "fix: replace Russian i18n fallbacks with English, fix hardcoded strings (#235)"`

  ## Self-check / Post-task review sections present.

  END
