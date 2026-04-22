---
page: partnertables
budget: 5.00
type: fix
phase: 1
created: 2026-02-28
session: 52
---

# Phase 1 Fix: PartnerTables Page — Touch Targets

## Context
UX discussion (CC+Codex) identified Phase 1 mobile fixes for the partner cabinet.
Full discussion result: pipeline/result-discussion-partner-cabinet-ux.md

## Problems to Fix

### 1. Touch targets
Action icons on table rows (QR icon, edit, delete, reorder) are too small for mobile.
**Fix:** All icon buttons and interactive elements must be at least 44x44px with 8px spacing. This includes: QR download icons, edit/delete buttons, reorder handles, zone action buttons. Where multiple small icons are in a row, consider grouping less-used actions into an overflow (three-dot) menu and keeping only 1-2 primary actions visible.

## Instructions
1. git add -A && git commit -m "before phase1 partnertables fixes" && git push
2. Read the current partnertables page code in pages/PartnerTables/ (or pages/partnertables/)
3. Fix touch targets
4. Create RELEASE
5. Update BUGS.md and PartnerTables README.md
6. git add -A && git commit -m "Phase1 partnertables: touch targets" && git push
