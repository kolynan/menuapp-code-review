---
task: waiter-sprint-b-detail-view-s65
budget: 12
type: implementation
created: 2026-03-02
session: S65
---

Implement Sprint B for StaffOrdersMobile: full-screen Table Detail view + split-tap behavior.

Reference design: outputs/Design_WaiterScreen_V2_S64.md (sections Q2, Q5, ASCII wireframe "Table Detail").
Base code: menuapp-code-review/pages/StaffOrdersMobile/260302-00 StaffOrdersMobile RELEASE.jsx

Changes to implement (V2-02 + V2-03):
1. Create TableDetailScreen component (slide-in from right on card body tap)
   - Shows all guests, all items per guest, per-guest action buttons (48px min, full-width)
   - Shows table status header, elapsed time, table notes if any
   - Back button + swipe-right returns to list at same scroll position
2. Implement split-tap on OrderGroupCard:
   - CTA button tap → execute action immediately (no navigation, stay in list)
   - Card body tap (anywhere except CTA) → open TableDetailScreen
3. Preserve list scroll position when returning from detail view
4. Wire close/serve actions in detail view to same handlers as list CTA

Follow existing code patterns. No new dependencies. React + Tailwind only (Base44 constraint).

After implementation:
- git add, commit, push
- Create RELEASE file: 260302-01 StaffOrdersMobile RELEASE.jsx in menuapp-code-review/pages/StaffOrdersMobile/
- Update BUGS.md and README.md in same folder
