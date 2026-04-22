---
type: fix
budget: 12
session: S71
priority: P1
created: "2026-03-03"
---

# Fix: GAP-02 /orderstatus Returns 404

## Problem

After deploying `pages/orderstatus.jsx` via B44 prompt (which also added `/orderstatus`
to `Layout.js PUBLIC_ROUTES`), the page still returns:

> "Page Not Found — The page 'orderstatus' could not be found in this application."

URL tested: `https://menu-app-mvp-49a4f5b2.base44.app/orderstatus`

The `confirmation.track_order` button in `OrderConfirmationScreen` (x.jsx) also fails
silently — clicking it returns to menu instead of navigating to orderstatus.

## Investigation Required

1. Read `menuapp-code-review/pages/PublicMenu/260303-02 x RELEASE.jsx` — find how
   `confirmation.track_order` button navigates (useNavigate? href? window.location?)
2. Read `menuapp-code-review/pages/OrderStatus/base/orderstatus.jsx` — the deployed page
3. Read any Layout or routing file in the repo to understand how B44 registers routes
4. Understand why `/orderstatus` 404s despite being in PUBLIC_ROUTES

## Likely Root Cause Hypothesis

B44 routing may not be controlled by `Layout.js PUBLIC_ROUTES` alone. B44 platform may
require pages to be registered through its own system. The SPA route `/orderstatus` may
only work inside the same React app context — i.e., orderstatus may need to be a
**screen/component inside x.jsx** rather than a separate page route.

## What to Implement

**Option A (Recommended if /orderstatus routing is not fixable externally):**
Embed `OrderStatusScreen` as a STATE inside `x.jsx` (like `OrderConfirmationScreen`).
When user clicks "Track Order", set state `{ view: 'orderstatus', token: xxx }` and
render the status screen inline within x.jsx. No new route needed.

**Option B (If B44 routing CAN be fixed):**
Fix the routing so `/orderstatus?token=xxx` works as a proper standalone page.

Analyze the codebase and choose the correct option. If unsure, go with Option A.

## Files to Modify

- `menuapp-code-review/pages/PublicMenu/` — likely the main fix location (Option A)
- `menuapp-code-review/pages/OrderStatus/` — may need refactoring

## OrderStatusScreen Content Requirements (from GAP-02 spec)

The status screen must show:
- Order status badge (e.g. "Принят", "Готов", "Выдан") — poll every 10s
- List of ordered items with prices
- Order total
- Order number
- Restaurant phone number
- "Back to menu" link

The orderstatus.jsx already has this logic — reuse it if going with Option A.

## Output

RELEASE files as needed. If Option A: new RELEASE for x.jsx (next index after 260303-02).
If Option B: fix in orderstatus route registration.

## Instructions

- git add -A && git commit -m "S71: start fix-gap02-orderstatus-404" && git push
- Read Layout.js and x.jsx BEFORE deciding which option to implement
- Do not touch StaffOrdersMobile or unrelated files
- git add -A && git commit -m "S71: fix orderstatus 404 complete" && git push
