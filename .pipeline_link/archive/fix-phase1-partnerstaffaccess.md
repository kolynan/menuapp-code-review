---
page: partnerstaffaccess
budget: 5.00
type: fix
phase: 1
created: 2026-02-28
session: 52
---

# Phase 1 Fix: PartnerStaffAccess Page — Touch Targets

## Context
UX discussion (CC+Codex) identified Phase 1 mobile fixes for the partner cabinet.
Full discussion result: pipeline/result-discussion-partner-cabinet-ux.md

## Problems to Fix

### 1. Touch targets
Staff card action buttons (QR, Copy link, Send invitation, edit, delete) are too small for mobile.
**Fix:** All icon buttons and interactive elements must be at least 44x44px with 8px spacing. Where multiple small icons are in a row, keep only primary actions visible (QR, Copy) and move others to overflow menu. The "Send invitation" button should be consistently visible on all pending invitation cards.

## Instructions
1. git add -A && git commit -m "before phase1 partnerstaffaccess fixes" && git push
2. Read the current partnerstaffaccess page code in pages/PartnerStaffAccess/
3. Fix touch targets
4. Create RELEASE
5. Update BUGS.md and PartnerStaffAccess README.md
6. git add -A && git commit -m "Phase1 partnerstaffaccess: touch targets" && git push
