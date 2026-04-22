---
page: partnertables
budget: 10.00
type: fix
phase: 1v2
created: 2026-03-01
session: 52
---

# Phase 1 Re-run: partnertables — Mobile Fixes + Codex Verification

## Context
UX discussion result (CC+Codex consensus): pipeline/result-discussion-partner-cabinet-ux.md
Previous Phase 1 run was done WITHOUT Codex — this re-run adds mandatory Codex verification.

## CRITICAL: Codex Collaboration
You MUST involve Codex. This is the #1 requirement.
1. Launch Codex in background BEFORE your own analysis (see @code-reviewer workflow)
2. Compare CC findings with Codex findings
3. Report Codex participation in progress-live.txt
4. If Codex fails to start, report it but still complete the task

## Progress Reporting
APPEND progress to `../pipeline/progress-live.txt` (do NOT overwrite with >).
After each append, update Telegram message. See cc-system-rules.txt for details.

### Fixes Required
1. Touch targets: all icon buttons (QR, edit, delete, reorder) minimum 44x44px with 8px spacing
2. Where multiple small icons in a row: keep 1-2 primary actions visible + overflow (three-dot) menu

## Previous Run Results
Check if previous RELEASE exists for this page. If yes, VERIFY the fixes were applied correctly.
If fixes are missing or incomplete, apply them. If they look good, confirm and note "verified".

## Instructions
1. git add -A && git commit -m "before phase1v2 partnertables" && git push
2. Launch Codex in background (see @code-reviewer Step 1)
3. Read current code in pages/partnertables/ (case-insensitive folder lookup)
4. Apply fixes listed above
5. Wait for Codex, compare findings
6. Create RELEASE
7. Update BUGS.md and README.md
8. git add -A && git commit -m "Phase1v2 partnertables: CC+Codex fixes" && git push
