---
task_id: task-260408-143554-publicmenu-codex-writer-v2
status: running
started: 2026-04-08T14:35:56+05:00
type: chain-step
page: PublicMenu
work_dir: C:/Dev/menuapp-code-review
budget_usd: 5.00
fallback_model: sonnet
version: 5.17
launcher: python-popen
---

# Task: task-260408-143554-publicmenu-codex-writer-v2

## Config
- Budget: $5.00
- Mode: task-watcher.py launches Claude Code directly via Popen
- Fallback model: sonnet

## Prompt
---
chain: publicmenu-260408-143544-d0bc
chain_step: 1
chain_total: 4
chain_step_name: codex-writer-v2
chain_group: writers
chain_group_size: 2
page: PublicMenu
budget: 5.00
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

SPEED RULES — this is a time-sensitive pipeline step:
- Read ONLY the TARGET files + README/BUGS for context. Do NOT search the repo, do NOT read old findings, do NOT read files outside the page folder.
- Do NOT run rg/grep across the whole repo. Do NOT cross-reference with other pages.
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

Write findings to: pipeline/chain-state/publicmenu-260408-143544-d0bc-codex-findings.md

FORMAT:
# Codex Writer Findings — PublicMenu
Chain: publicmenu-260408-143544-d0bc

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

=== TASK CONTEXT ===
# SOS Help Drawer v6.0 — Part B1: Cleanup Dead Code
# Runs AFTER КС-A (chain de40, commit 0012e3f) — deployed and verified

## Context
File: pages/PublicMenu/x.jsx (TARGET — edit this file ONLY)
RELEASE: `260408-01 PublicMenu x RELEASE.jsx` (5457 lines)
Task: Remove dead constants, refs, helpers that are no longer referenced after КС-A deployment.
Weight: M | Budget: $5 | Chain: С5v2

## Prerequisites
КС-A is deployed. The following are NOW dead code (all JSX call sites existed in old drawer, which will be replaced in a separate B2 task — but these symbols have ZERO references in current JSX already OR are only referenced by OTHER dead code in this cleanup list):

## FROZEN UX (DO NOT CHANGE)
- ALL JSX rendering — do NOT touch any JSX return blocks
- handleCardTap, handleUndo, handleResolve, handleRetry — KEEP
- openHelpDrawer/closeHelpDrawer — KEEP (but clean post-send callback refs)
- All imports — do NOT remove any imports
- activeRequestCount — do NOT modify

---

## Fix 1 — Remove HELP_PREVIEW_LIMIT [MUST-FIX]

### What
`const HELP_PREVIEW_LIMIT = 2;` at line 1834. Has `// TODO: remove in v6.0 Part B` comment.

### Why dead
Only used in `focusHelpRow` (line 2786) — which is also being removed in Fix 4.

### Action
DELETE the entire line 1834.

### Verification
`grep -c "HELP_PREVIEW_LIMIT" pages/PublicMenu/x.jsx` → 0

---

## Fix 2 — Remove HELP_CHIPS [MUST-FIX]

### What
`const HELP_CHIPS = useMemo(...)` block starting at line 1874. Has `// TODO: remove in v6.0 Part B` comment. Ends with `], []);` closing.

### Why dead
Only used in old drawer JSX (lines 4976-5281). No other references.

### Action
DELETE the entire `HELP_CHIPS` useMemo block (line 1874 through its closing `], []);` at line 1880).

### Verification
`grep -c "HELP_CHIPS" pages/PublicMenu/x.jsx` → 0

---

## Fix 3 — Remove ticketBoardRef + post-send callback refs [MUST-FIX]

### What
- `const ticketBoardRef = useRef(null);` at line 1910
- Post-send callback at line ~2568: `ticketBoardRef.current?.scrollIntoView(...)` 
- Post-send callback at line ~2569: `setHighlightedTicket(action.rowId || action.type);`
- Post-send callback at line ~2570: `setTimeout(() => setHighlightedTicket(...))`

### Why dead
ticketBoardRef: only used in focusHelpRow (also being removed) and post-send callback.
highlightedTicket setters in post-send: no JSX reads highlightedTicket outside old drawer.

### Action
- DELETE line 1910 (`ticketBoardRef = useRef(null)`)
- In post-send callback (~line 2565-2571): DELETE the 3 lines (scrollIntoView, setHighlightedTicket, setTimeout). KEEP `setIsTicketExpanded(false)` and `setShowOtherForm(false)` which are on lines ~2566-2567.

### Verification
`grep -c "ticketBoardRef" pages/PublicMenu/x.jsx` → 0

---

## Fix 4 — Remove focusHelpRow [MUST-FIX]

### What
`const focusHelpRow = useCallback(...)` at line ~2784. Entire useCallback block through closing `}, [activeRequests, setShowOtherForm]);` at line ~2791.

### Why dead
References HELP_PREVIEW_LIMIT (removed in Fix 1) and ticketBoardRef (removed in Fix 3). All call sites were in old drawer JSX.

### Action
DELETE the entire focusHelpRow useCallback block (lines ~2784-2791).

### Verification
`grep -c "focusHelpRow" pages/PublicMenu/x.jsx` → 0

---

## Fix 5 — Remove 7 dead helper functions [MUST-FIX]

### What
Seven helper functions whose ONLY call sites are in old drawer JSX (lines 4976-5281) OR other helpers in this list:
- `getHelpReminderWord` (line 2631) — called ONLY by getHelpReminderLabel (also removed)
- `getMinutesAgo` (line 2635) — called ONLY by getHelpWaitLabel + getHelpReminderLabel (both removed)
- `getHelpWaitLabel` (line 2639) — called ONLY in old drawer JSX
- `getHelpReminderLabel` (line 2646) — called ONLY in old drawer JSX
- `getHelpResolvedLabel` (line 2657) — called ONLY in old drawer JSX
- `getHelpErrorCopy` (line 2668) — called ONLY in old drawer JSX
- `getHelpFreshnessLabel` (line 2684) — called ONLY in old drawer JSX

### ⚠️ DO NOT TOUCH handleRetry (line 2697)
handleRetry is IMMEDIATELY after getHelpFreshnessLabel. It is NOT dead — it will be used in B2 new JSX grid.

### Action
DELETE each of the 7 function definitions. For useCallback blocks: find each function name and its closing `}, [...]);`. For non-useCallback functions: find the full definition block.

### Verification
`grep -c "getHelpReminderWord\|getMinutesAgo\|getHelpWaitLabel\|getHelpReminderLabel\|getHelpResolvedLabel\|getHelpErrorCopy\|getHelpFreshnessLabel" pages/PublicMenu/x.jsx` → 0
`grep -c "handleRetry" pages/PublicMenu/x.jsx` → ≥ 1 (must still exist!)

---

## Fix 6 — Comment dead state hooks [MUST-FIX]

### What
- `highlightedTicket` (line 1911): useState declaration
- `isTicketExpanded` (line 1912): useState declaration

### Why keep (not delete)
React hook order must be stable. Removing useState hooks changes call order → potential crash. These will be fully removed when drawer JSX is rewritten in B2.

### Action
Add comment AFTER each line (do not modify the declaration itself):
```js
const [highlightedTicket, setHighlightedTicket] = useState(null); // SOS v6.0 B1 — dead, kept for hook order until B2
const [isTicketExpanded, setIsTicketExpanded] = useState(false); // SOS v6.0 B1 — dead, kept for hook order until B2
```

### Verification
`grep -c "highlightedTicket" pages/PublicMenu/x.jsx` → ≥ 1 (useState still there)
`grep -c "isTicketExpanded" pages/PublicMenu/x.jsx` → ≥ 2 (useState + setIsTicketExpanded in open/close)

---

## ⛔ SCOPE LOCK
Edit ONLY `pages/PublicMenu/x.jsx`.
Allowed changes — DELETIONS and COMMENTS only:
- HELP_PREVIEW_LIMIT (DELETE line 1834)
- HELP_CHIPS (DELETE useMemo block ~1874-1879)
- ticketBoardRef (DELETE line 1910)
- Post-send callback (DELETE 3 lines ~2568-2570, KEEP 2566-2567)
- focusHelpRow (DELETE useCallback block ~2784-2791)
- 7 dead helpers (DELETE by name: getHelpReminderWord, getMinutesAgo, getHelpWaitLabel, getHelpReminderLabel, getHelpResolvedLabel, getHelpErrorCopy, getHelpFreshnessLabel — NOT handleRetry)
- highlightedTicket, isTicketExpanded (ADD comments only)

DO NOT touch JSX return blocks, imports, handleCardTap, handleUndo, handleResolve, handleRetry, openHelpDrawer, closeHelpDrawer, activeRequestCount, or any other code.

## POST-IMPLEMENTATION CHECKS
- `wc -l pages/PublicMenu/x.jsx` — expected ~5370 ± 30 (removing ~80 lines of dead code, adding 2 comment lines). If < 5300 → ABORT (KB-095).
- `grep -c "HELP_CHIPS\|HELP_PREVIEW_LIMIT\|ticketBoardRef\|focusHelpRow\|getHelpReminderWord\|getMinutesAgo\|getHelpWaitLabel\|getHelpReminderLabel\|getHelpResolvedLabel\|getHelpErrorCopy\|getHelpFreshnessLabel" pages/PublicMenu/x.jsx` → must be 0
- `grep -c "handleRetry" pages/PublicMenu/x.jsx` → must be ≥ 1
- `grep -c "DrawerHeader\|DrawerTitle" pages/PublicMenu/x.jsx` → must be ≥ 4
- `node --check pages/PublicMenu/x.jsx || true` — no syntax errors (note: .jsx may warn, that's OK)
- git add pages/PublicMenu/x.jsx
- git commit -m "SOS v6.0 Part B1: cleanup dead helpers/refs/constants"
=== END ===


## Status
Running...
