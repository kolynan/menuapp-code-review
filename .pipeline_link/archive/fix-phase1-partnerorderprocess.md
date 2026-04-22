---
page: partnerorderprocess
budget: 5.00
type: fix
phase: 1
created: 2026-02-28
session: 52
---

# Phase 1 Fix: PartnerOrderProcess Page — Touch Targets

## Context
UX discussion (CC+Codex) identified Phase 1 mobile fixes for the partner cabinet.
Full discussion result: pipeline/result-discussion-partner-cabinet-ux.md

## Problems to Fix

### 1. Touch targets
Stage action buttons (edit, delete, reorder) and pipeline configuration elements are too small for mobile.
**Fix:** All icon buttons and interactive elements must be at least 44x44px with 8px spacing. Reorder controls should be 48x48px. Keep only primary actions visible per stage row and move others to overflow menu.

## Instructions
1. git add -A && git commit -m "before phase1 partnerorderprocess fixes" && git push
2. Read the current partnerorderprocess page code in pages/PartnerOrderProcess/
3. Fix touch targets
4. Create RELEASE
5. Update BUGS.md and PartnerOrderProcess README.md
6. git add -A && git commit -m "Phase1 partnerorderprocess: touch targets" && git push
