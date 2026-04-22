# PartnerOrderProcess — Bug Tracker

**Last updated:** 2026-03-01

---

## Fixed (in RELEASE 260228-01)

| ID | Priority | Description | Commit |
|----|----------|-------------|--------|
| BUG-OP-016 | P2 | Mobile reorder up/down buttons only 24px tall (h-6), below 44px minimum. Moved to overflow menu with min-h-[44px] items. Codex confirmed fix. | Phase1v2 CC+Codex |

---

## Fixed (in RELEASE 260228-00)

| ID | Priority | Description | Commit |
|----|----------|-------------|--------|
| BUG-OP-015 | P2 | Touch targets: action buttons 36px (h-9), move buttons ~17px, channel filter/color picker below 44px minimum | Phase1 touch targets |

---

## Fixed (in RELEASE 260224-00)

| ID | Priority | Description | Commit |
|----|----------|-------------|--------|
| BUG-OP-001 | P0 | handleSaveStage + handleConfirmDelete: no try/catch around rebalanceSortOrder — unhandled rejection | `1ebf4e2` |
| BUG-OP-002 | P1 | Delete stage orphans orders referencing it — orders become invisible in pipeline | `1ebf4e2` |
| BUG-OP-003 | P1 | Double invalidateQueries on create/delete — two rapid refetches increase rate-limit risk | `1ebf4e2` |
| BUG-OP-004 | P1 | handleCreateDefaults double-click race — duplicate default stages via async state gap | `1ebf4e2` |
| BUG-OP-005 | P1 | Silent error swallow when Order.filter pre-check fails in handleConfirmDelete | `982386f` |

---

## Active

| ID | Priority | Description | Line(s) | Notes |
|----|----------|-------------|---------|-------|
| BUG-OP-006 | P2 | Fractional sort_order (0.5) may collide on INTEGER backend column | 817, 944 | Use integer offsets or verify schema |
| BUG-OP-007 | P2 | handleCreateDefaults non-atomic — partial creates on mid-loop failure | 741-747 | Consider cleanup on error |
| BUG-OP-008 | P2 | Move Up/Down buttons misleading under channel filter — computed from full list | 1128-1130 | Compute from filteredStages |
| BUG-OP-009 | P2 | ROLE_OPTIONS recreated on every render — should use useMemo | 452-456 | |
| BUG-OP-010 | P2 | useCallback on getRoleLabel in non-memoized StageRow — no benefit | 227-234 | Remove useCallback |
| BUG-OP-011 | P2 | Magic number 15 in handleAddStage | 813 | Name as constant |
| BUG-OP-012 | P1 (style) | Color swatch aria-label uses raw English string, not t() | 512, 26-32 | Add i18n keys |
| BUG-OP-013 | P1 (style) | .replace("{name}") bypasses i18n interpolation | 609 | Use t(key, { name }) |
| BUG-OP-014 | P3 | Russian comments in production code | various | Translate to English |
