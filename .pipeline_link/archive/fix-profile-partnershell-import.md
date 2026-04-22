---
task_id: fix-profile-partnershell-import
type: bug-fix
priority: high
created: 2026-03-01
page: Profile
---

# Bug Fix: Profile.jsx — PartnerShell named import → default import

## Problem
`profile.jsx` uses named import:
```js
import { PartnerShell } from "@/components/PartnerShell";
```
But `PartnerShell.jsx` exports as default (no named export). This causes:
```
SyntaxError: The requested module '/src/components/PartnerShell.jsx'
does not provide an export named 'PartnerShell'
```
B44 had to auto-fix this after our deploy. We need to fix it in our RELEASE file so this never happens again.

## Fix Required
Change line 9 in `profile.jsx`:
```js
// WRONG (current):
import { PartnerShell } from "@/components/PartnerShell";

// CORRECT:
import PartnerShell from "@/components/PartnerShell";
```

## General Rule to Apply
Scan ALL pages (especially Phase 1v2 RELEASEs) for any `import { PartnerShell }` pattern and replace with `import PartnerShell` (default import). PartnerShell always uses default export.

## Files to Check
- `profile.jsx` ← confirmed broken
- All other pages that import PartnerShell: partnerhome, partnerclients, partnertables, partnercontacts, partnerloyalty, partnersettings, partnerorderprocess, partnerstaffaccess, clientmessages

## After Fix
Create new RELEASE: `260301-01 profile RELEASE.jsx`
