---
task: waiter-sprint-d-banner-s65
budget: 10
type: implementation
created: 2026-03-02
session: S65
---

Implement Sprint D for StaffOrdersMobile: in-app banner notification overlay.

Reference design: outputs/Design_WaiterScreen_V2_S64.md (section Q6, Full notification stack).
Base code: latest RELEASE in menuapp-code-review/pages/StaffOrdersMobile/.

Changes to implement (V2-09):
1. BannerNotification component: fixed position, top of viewport, z-index above everything
   - Content: "Стол 5: Новый заказ" (table name + event type)
   - Auto-hide after 5 seconds
   - Tap banner → navigate to relevant table card (scroll to it, highlight briefly)
   - De-duplication: if multiple events in same poll cycle → "3 новых заказа"
   - Dismiss: swipe-up or auto-hide
2. Wire to polling cycle: detect new orders/events since last poll
3. Ensure banner works on all screens (Mine, Free, Others, Detail view)
4. Non-blocking: content below remains interactive while banner shows

Polling interval is already 5s. Compare current poll results with previous to detect new events.

After implementation:
- git add, commit, push
- Create RELEASE file: 260302-03 StaffOrdersMobile RELEASE.jsx in menuapp-code-review/pages/StaffOrdersMobile/
- Update BUGS.md and README.md in same folder
