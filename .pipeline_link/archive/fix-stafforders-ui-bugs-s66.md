---
task: fix-stafforders-ui-bugs-s66
budget: 12
type: implementation
created: 2026-03-02
session: S66
priority: P1 — after session logic fix
---

Fix 4 UI bugs in StaffOrdersMobile found during Deep Test S66.
Base code: menuapp-code-review/pages/StaffOrdersMobile/ — latest RELEASE (260302-03).

## Bug 1 — BUG-S66-01: Detail view doesn't open on card tap (Sprint B broken)
**What user sees:** Tapping any order card does nothing — no expand, no detail
**Expected:** Tap on card → shows order contents (dishes, quantities, total per guest)
**Note:** Sprint B was supposed to add this. The click/tap handler is either missing or broken.
**Fix:** Find the onClick handler on the order card component. If missing — add it.
The detail view should show:
- List of dishes ordered (grouped by guest if multiple guests)
- Each dish: name × quantity, price
- Subtotal per guest, grand total
- Only THEN show the action button (Принято / Обслужено)

## Bug 2 — BUG-S66-02: No action button on ГОТОВИТСЯ card
**What user sees:** Card with status "ГОТОВИТСЯ" shows no CTA button — waiter cannot mark it as served
**Expected:** Card should show "Обслужено" (or "Подать") button when status is ГОТОВИТСЯ/READY
**Fix:** Check the conditional rendering of CTA buttons by status. Ensure ГОТОВИТСЯ status renders the appropriate next-action button.
Status flow: НОВЫЙ → (Принято) → ГОТОВИТСЯ → (Обслужено) → ОБСЛУЖЕНО

## Bug 3 — BUG-S65-04: Waiter accepts order blind (no content visible before accepting)
**What user sees:** Card shows "→ Принято (Гость 68)" button without any order content
**Expected:** Waiter should be able to see what's in the order BEFORE accepting
**Fix:** This is connected to Bug 1 — once detail view works, the "Принято" button should only appear INSIDE the expanded detail view (not on the collapsed card). Or at minimum show a summary (N dishes, X₸) on the collapsed card before the accept button.

## Bug 4 — BUG-S65-05: Double "Стол" prefix — "Стол Стол 22"
**What user sees:** Table name shows as "Стол Стол 22" instead of "Стол 22"
**Expected:** "Стол 22"
**Fix:** Find where table name is constructed/displayed in the card. The word "Стол" is being added twice — once from the table name stored in DB ("Стол 22") and once hardcoded in the component. Remove the hardcoded prefix.

## After implementation

- git add, commit, push
- Create RELEASE file: 260302-05 StaffOrdersMobile RELEASE.jsx in menuapp-code-review/pages/StaffOrdersMobile/
- Update BUGS.md: mark BUG-S66-01, BUG-S66-02, BUG-S65-04, BUG-S65-05 as fixed
- Update README.md with changes
