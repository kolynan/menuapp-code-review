---
page: CartView
budget: 20
topic: CV-B2-B fixes apply (pre-approved)
---

# Task: Apply CV-B2-B Pre-Approved Fixes to CartView.jsx

All fixes have been reviewed and approved (pssk-review v1–v5, CC GO, comparison report confirmed).

## Step 0 — Read the approved fix specification

Read the full ПССК at this absolute path:
`C:/Users/ASUS/Dev/Menu AI Cowork/pipeline/queue/pssk-cv-b2-b-260421-v5.md`

## Step 1 — Apply all 5 fixes exactly as specified in the ПССК

Work on: `pages/PublicMenu/CartView.jsx` (currently 1316 lines, RELEASE 260419-00)

Quick reference (anchors from comparison report — both CC+Codex agreed):

- **Fix 2a** `isPending`/`isOrderPending`: replace `=== 'submitted'` → `=== 'new'` at lines ~467, ~887, ~979
- **Fix 2b** `bucketOrder` reorder: `['served', 'in_progress', 'pending_unconfirmed']` at line ~1094
- **Fix 3** Terminal Screen: `localStorage.getItem('cv_terminal_table_${getLinkId()}')` (session-scoped key)
- **Fix 4** Guest cards flat list: render `Section 5` as flat `div` list (remove inner `GuestOrderCard` wrapper nesting)
- **Fix 5** V4 footer: apply outline style to footer actions button + bell icon visibility fix
- **Fix 6** `tableOrdersTotal` / `guestTotal`: add `isCancelledOrder` filter (lines ~521-530, ~948-949)

Follow the ПССК exactly for each fix. Do NOT add anything not in the ПССК.

## Step 2 — Commit

After applying all fixes:

```
git add pages/PublicMenu/CartView.jsx
git commit -m "fix(CartView): CV-B2-B Fix2+3+4+5+6 isPending/localStorage/guestCards/footer/isCancelledOrder"
```

Report: list of all edits made with line numbers.
