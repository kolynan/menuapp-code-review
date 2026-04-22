---
type: file migration
budget: 3.00
session: 60
decision: approved by Arman 2026-03-01
---

# Task: Migrate code/ archive → menuapp-code-review/pages/

## Context

Decision made in S60: `menuapp-code-review/pages/[PageName]/` is now the single
source of truth for all code. The old `code/` folder is deprecated.

Each page folder should have the full structure:
- `base/` — clean copy of what's currently in B44
- `versions/` — old archived versions
- `README.md` — page description + UX changelog
- `BUGS.md` — bug registry
- RELEASE files in root

## Goal

Copy missing files from `code/[PageName]/` → `menuapp-code-review/pages/[PageName]/`
for all pages where they are missing. Do NOT overwrite if already exists in destination.

## Instructions

git add . && git commit -m "pre-task: migrate code archive" && git push

### Step 1: Identify what's missing

For each page that exists in BOTH `code/` AND `menuapp-code-review/pages/`:
- Check if `base/` subfolder exists in destination
- Check if `README.md` (or `[PageName] README.md`) exists in destination
- Check if `BUGS.md` exists in destination
- Check if `versions/` subfolder exists in destination

The code/ folder is at: `C:/Users/ASUS/OneDrive/002 Menu/Claude AI Cowork/code/`
The destination is: `C:/Users/ASUS/OneDrive/002 Menu/Claude AI Cowork/menuapp-code-review/pages/`

### Step 2: Copy missing items

For each page (use Windows-compatible paths):
```
pages in code/: PartnerHome, PartnerShell, PartnerSettings, PartnerContacts,
PartnerLoyalty, PartnerStaffAccess, PartnerTables, PartnerClients,
PartnerOrderProcess, Profile, StaffOrdersMobile, MenuManage, MenuDishes,
ClientMessages, ClientAccount, PublicMenu, acceptinvite, adminpagehelp,
adminpartners, PageHelpButton, OrderDetails, OrdersList, Index, Lab
```

For each page:
- If `base/` missing in destination → copy from `../../code/[PageName]/base/`
- If `versions/` missing in destination → copy from `../../code/[PageName]/versions/`
- If no README in destination → copy from `../../code/[PageName]/` (look for *README.md)
- If `BUGS.md` missing in destination → copy from `../../code/[PageName]/BUGS.md`

Use `cp -rn` (no-overwrite) to be safe.

### Step 3: Verify

List the structure of 3-4 key pages after migration:
- PartnerSettings
- PartnerShell
- StaffOrdersMobile
- PartnerHome

Confirm each has: base/, BUGS.md, README.md

### Step 4: Commit

git add .
git commit -m "migrate: copy code archive (base/, versions/, README, BUGS) to menuapp-code-review"
git push

## Notes

- The `code/` folder itself is NOT deleted — leave it as-is, just stop using it
- If a file exists in destination already → skip it (don't overwrite)
- The work_dir for this task is menuapp-code-review/ as usual
- Use relative paths: `../code/[PageName]/` from within menuapp-code-review/
