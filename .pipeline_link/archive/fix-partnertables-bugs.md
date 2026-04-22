---
page: PartnerTables
budget: 3.00
type: fix
---

# Fix Task: BUG-PT-D01 + BUG-PT-D02

Fix two remaining active bugs in PartnerTables. Solutions already decided (Session 43).

## BUG-PT-D01 | P3 | console.error calls — dev-only gate
**Lines:** 576, 1272, 1626, 1882, 1975
**Fix:** Wrap each console.error in `if (process.env.NODE_ENV !== 'production')`.
Do NOT remove them — they help debugging. Just gate them.

## BUG-PT-D02 | P2 | window.confirm() — i18n only
**Line:** 1965
**Fix:** Replace the hardcoded Russian text in confirm() with `t('partnertables.confirm.delete_table')`.
Do NOT replace confirm() with a React dialog — that is for later.

## Important
- Code file: `pages/PartnerTables/partnertables.jsx` (not the "1" file)
- After fixes: update `../../code/PartnerTables/BUGS.md` — move D01 and D02 from Active to Fixed
- Create RELEASE file in `../../code/PartnerTables/`
