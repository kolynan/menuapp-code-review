---
task: waiter-sprint-c-sort-animation-s65
budget: 10
type: implementation
created: 2026-03-02
session: S65
---

Implement Sprint C for StaffOrdersMobile: static urgency sort + transition animations.

Reference design: outputs/Design_WaiterScreen_V2_S64.md (sections Q3, Q4, Sort Order Specification).
Base code: result of Sprint B (latest RELEASE in menuapp-code-review/pages/StaffOrdersMobile/).

Changes to implement (V2-04 + V2-07):
1. Mine tab static sort: BILL_REQUESTED > NEW > READY > ALL_SERVED > PREPARING, oldest first within group
2. Preparing→Ready transition animation:
   - Left border color animates gray→amber (300ms ease)
   - CTA button fades in ("Mark Served / Подать")
   - Card does NOT reorder in list
   - Optional: brief amber flash on whole card (200ms) for peripheral attention
3. Ensure card position stability — no reordering within same status group

Use CSS transitions / React state for animations. No animation libraries.

After implementation:
- git add, commit, push
- Create RELEASE file: 260302-02 StaffOrdersMobile RELEASE.jsx in menuapp-code-review/pages/StaffOrdersMobile/
- Update BUGS.md and README.md in same folder
