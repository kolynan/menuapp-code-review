---
chain: publicmenu-260408-143544-d0bc
chain_step: 4
chain_total: 4
chain_step_name: merge-v2
page: PublicMenu
budget: 5.00
runner: cc
type: chain-step
---
=== CHAIN STEP: Merge (4/4) ===
Chain: publicmenu-260408-143544-d0bc
Page: PublicMenu

You are the Merge step in a modular consensus pipeline.
Your job: apply the fix plan to the actual code.

INSTRUCTIONS:
1. Read the comparison: pipeline/chain-state/publicmenu-260408-143544-d0bc-comparison.md
2. Check if discussion report exists: pipeline/chain-state/publicmenu-260408-143544-d0bc-discussion.md
   - If it exists AND has an "Updated Fix Plan" section → use THAT for disputed items
   - If it says "No disputes" or doesn't exist → use Comparator's "Final Fix Plan" as-is
   - Items marked "Unresolved (for Arman)" → SKIP these, do NOT apply
3. **File integrity check (KB-121 prevention):**
   Run: `wc -l pages/PublicMenu/*.jsx`
   - If result matches expected line count from comparison/findings → proceed.
   - If result is unexpectedly low (e.g. differs by 200+ lines from what findings mention) →
     run `git fetch origin && git reset --hard origin/main` then verify again.
   - If still wrong after reset → STOP and write merge report explaining the issue. Do NOT apply changes to a truncated file.
4. Read the code file: pages/PublicMenu/*.jsx
5. Apply ALL fixes from the fix plan, in priority order (P0 first)
   - Agreed items from Comparator: always apply
   - Discussion-resolved items: apply the winning solution
   - Unresolved disputes: SKIP (note in merge report)
   - [MUST-FIX] items: CANNOT be skipped. If you cannot apply a MUST-FIX, explain WHY in detail in merge report — do NOT silently skip.
6. After applying fixes:
   a. Update BUGS.md in pages/PublicMenu/ with fixed items
   b. Update README.md in pages/PublicMenu/ if needed
7. Git commit and push:
   - git add <specific files only> (NEVER git add . or git add -A)
   - git commit -m "fix(PublicMenu): N bugs fixed via consensus chain publicmenu-260408-143544-d0bc"
   - git push
8. Write merge report to: pipeline/chain-state/publicmenu-260408-143544-d0bc-merge-report.md

FORMAT for merge report:
# Merge Report — PublicMenu
Chain: publicmenu-260408-143544-d0bc

## Applied Fixes
1. [P0] Fix title — Source: agreed/discussion-resolved — DONE
2. [P1] Fix title — Source: comparator — DONE
...

## Skipped — Unresolved Disputes (for Arman)
- Dispute: [title] — CC says X, Codex says Y — NEEDS DECISION

## Skipped — Could Not Apply
- Reason...

## Git
- Commit: <hash>
- Lines before: <N>
- Lines after: <N>
- Files changed: N

## Prompt Feedback
Collect Prompt Clarity sections from CC and Codex findings files (if present), then add your own observations:
- CC clarity score: [N/5]
- Codex clarity score: [N/5]
- Fixes where writers diverged due to unclear description: ...
- Fixes where description was perfect (both writers agreed immediately): ...
- Recommendation for improving task descriptions: ...

## Summary
- Applied: N fixes
- Skipped (unresolved): N disputes
- Skipped (other): N fixes
- MUST-FIX not applied: N (with reasons)
- Commit: <hash>

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
