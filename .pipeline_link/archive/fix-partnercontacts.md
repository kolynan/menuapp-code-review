---
page: PartnerContacts
type: Phase 1v2 re-run
budget: 3.00
phase: 1v2
---

# Task: Fix PartnerContacts (re-run)

Previous run crashed (.claude.json corrupted), but work was completed:
- RELEASE 260301-00 created
- Git push 04e7d0a

Re-run Phase 1v2 to verify and create proper result file.

## Instructions

git add . && git commit -m "pre-review PartnerContacts (re-run)" && git push

Review `pages/PartnerContacts/partnercontacts1.jsx` for:
1. Touch targets: ALL interactive elements must be >= 44x44px (h-11 w-11 or min-h-[44px] min-w-[44px])
2. i18n: ALL user-visible text must use t() or tr() — no hardcoded strings
3. Mobile UX: test at 375px width, no horizontal scroll, readable text
4. Accessibility: proper aria-labels, keyboard navigation
5. Code quality: no unused imports, no console.log, proper error handling

After review and fixes:
git add . && git commit -m "fix: PartnerContacts Phase1v2 re-run" && git push
