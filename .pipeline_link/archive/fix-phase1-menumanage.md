---
page: menumanage
budget: 5.00
type: fix
phase: 1
created: 2026-02-28
session: 52
---

# Phase 1 Fix: MenuManage Page — Touch Targets

## Context
UX discussion (CC+Codex) identified Phase 1 mobile fixes for the partner cabinet.
Full discussion result: pipeline/result-discussion-partner-cabinet-ux.md

## Problems to Fix

### 1. Touch targets
Dish action buttons (edit, delete, reorder) and category management buttons are too small for mobile.
**Fix:** All icon buttons and interactive elements must be at least 44x44px with 8px spacing. Reorder arrows should be 48x48px. Where multiple small icons are in a row, keep only 1-2 primary actions visible and move others to overflow (three-dot) menu.

## Instructions
1. git add -A && git commit -m "before phase1 menumanage fixes" && git push
2. Read the current menumanage page code in pages/MenuManage/
3. Fix touch targets
4. Create RELEASE
5. Update BUGS.md and MenuManage README.md
6. git add -A && git commit -m "Phase1 menumanage: touch targets" && git push
