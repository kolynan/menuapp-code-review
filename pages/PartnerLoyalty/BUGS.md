# PartnerLoyalty — Bug Tracker

**Last updated:** 2026-02-28

---

## Fixed (in RELEASE 260228-00)

| ID | Priority | Description | Commit |
|----|----------|-------------|--------|
| BUG-PL-008 | P2 | Save button not visible on mobile — requires full scroll to bottom of long form | Phase1 fix |
| BUG-PL-009 | P2 | Checkbox touch targets below 44px minimum — hard to tap on mobile | Phase1 fix |
| BUG-PL-010 | P2 | Save button too small on mobile — below 44px touch target minimum | Phase1 fix |

## Fixed (in RELEASE 260224-00)

| ID | Priority | Description | Commit |
|----|----------|-------------|--------|
| BUG-PL-001 | P1 | useEffect([partner]) resets form on every background refetch — silent data loss | `cb53de6` |
| BUG-PL-002 | P1 | hasChanges false-negative for null/undefined fields — Save button stays disabled | `cb53de6` |
| BUG-PL-003 | P1 | NaN/invalid values pass validation — corrupts loyalty calculations downstream | `cb53de6` + `982386f` (expiry_days >= 1) |

---

## Active

| ID | Priority | Description | Line(s) | Notes |
|----|----------|-------------|---------|-------|
| BUG-PL-004 | P2 | saveStatus duplicates saveMutation.isPending — parallel state can drift | 32, 96-98 | Use mutation.isPending + isSaved boolean only |
| BUG-PL-005 | P2 | NUMERIC_FIELDS declared inside function body — should be module-scope constant | 101-104 | Move to top of file |
| BUG-PL-006 | P2 | String() coercion in hasChanges is fragile — direct !== suffices for current types | 122-129 | Consider direct comparison |
| BUG-PL-007 | P2 | saveStatus magic strings — should be named constants | various | Extract SAVE_STATUS enum |
