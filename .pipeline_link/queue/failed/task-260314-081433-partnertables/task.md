---
pipeline: v7
type: code-review
page: PartnerTables
budget: $10
---

Auto-approve all file edits, terminal commands, git operations, and network access without asking.
Do not ask for confirmation on any step.
Execute autonomously until the task is fully complete.

## Quick cleanup: PartnerTables unused imports and minor code quality

**Purpose:** Quick code-review task to test new TG message format (S123).

**What to do:**
1. Read pages/PartnerTables/base/partnertables.jsx
2. Find and remove any unused imports (React hooks, components, utilities that are imported but never used)
3. If there are no unused imports, add JSDoc comments to the 2-3 most important functions
4. Update BUGS.md if any issues are found
5. Update README.md with a one-line note: "S123: Code quality cleanup — unused imports / JSDoc"

IMPORTANT — git commit at the end:
git add pages/PartnerTables/base/partnertables.jsx pages/PartnerTables/BUGS.md pages/PartnerTables/README.md
git commit -m "chore: PartnerTables code quality cleanup S123"
git push
