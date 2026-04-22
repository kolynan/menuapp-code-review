# OrderStatus — BUGS.md
Updated: 2026-03-11, Session S110

## Active Bugs

### P3-S110-01: formatPrice hardcodes ru-RU locale
- **Line:** ~321
- **What:** `num.toLocaleString("ru-RU")` is hardcoded; not adaptable to user locale
- **Impact:** Minor — correct for KZ/RU target market, but not universal
- **Suggestion:** Could use partner locale setting if available in future

### P3-CDX-09: Error/expired screens are dead ends (NOTED)
- **Lines:** ~336, ~378, ~397
- **What:** Invalid-token, not-found, and expired cards have no back/retry action
- **Impact:** Mobile users may feel stuck on these screens
- **Suggestion:** Add recovery CTA (history.back() or link to menu) in future

### P2-CDX-05: `new` status badge text may differ from progress step text (NOTED)
- **Lines:** ~46, ~105
- **What:** Badge uses `t("order_status.status_new")` ("Принят"), progress uses `t("order_status.step_received")`
- **Impact:** Minor semantic inconsistency — both are valid from user perspective
- **Suggestion:** Align translation keys if needed; this is an i18n config issue, not code bug

### P2-CDX-06: Secondary query failures silently degrade page (NOTED)
- **Lines:** ~227, ~239, ~250
- **What:** Partner/items/contacts queries don't track error state; failures show blank sections
- **Impact:** Graceful degradation is acceptable — status info (primary purpose) still shows
- **Suggestion:** Could add partial-error UI in future if needed

## Fixed Bugs (S110 — 260311-00)

### P1-CDX-01: `closed` status not handled — renders as "new" (FIXED)
- **Line:** ~30, ~43, ~102
- **What:** `closed` is a real order status (used in OrdersList) but OrderStatus page falls back to `configs.new`, shows blue "new" badge, wrong progress, and keeps polling
- **Fix:** Added `closed` to TERMINAL_STATUSES, getStatusConfig(), and StatusProgress isTerminal
- **Source:** Codex
- **Release:** 260311-00

### P1-CDX-02: Network errors shown as "Order not found" (FIXED)
- **Line:** ~362
- **What:** `orderError || !order` merged into same not-found card; network failures mislead users
- **Fix:** Separated into two blocks: network error (with retry button) vs order not found
- **Source:** Codex
- **Release:** 260311-00

### P2-S110-01: Refresh button touch target below 44px (FIXED)
- **Line:** ~573
- **What:** `size="sm"` Button renders ~32px height, below 44px mobile minimum
- **Fix:** Added `min-h-[44px]` to className
- **Source:** CC + Codex
- **Release:** 260311-00

### P2-S110-02: itemsTotal treats line_total=0 as falsy (FIXED)
- **Line:** ~365
- **What:** `Number(item.line_total) || (fallback)` — if line_total is 0 (free item), falls through
- **Fix:** Changed to explicit null check: `item.line_total != null ? Number(item.line_total) : ...`
- **Source:** CC + Codex
- **Release:** 260311-00

### P3-S110-02: No aria-label on refresh button (FIXED)
- **Line:** ~573
- **What:** Refresh button lacked aria-label for screen readers
- **Fix:** Added `aria-label={t("order_status.refresh")}`
- **Source:** CC
- **Release:** 260311-00

### P3-CDX-08: lastUpdated leaks across token changes (FIXED)
- **Line:** ~294
- **What:** Navigating between tokens without unmount preserves stale timestamp
- **Fix:** Reset lastUpdated/secondsAgo when order?.id changes
- **Source:** Codex
- **Release:** 260311-00

## Previous Releases
| Date | Version | Bugs Fixed |
|---|---|---|
| 2026-03-03 | 260303-01 | Initial implementation (no bugs — new page) |
| 2026-03-11 | 260311-00 | P1-CDX-01, P1-CDX-02, P2-S110-01, P2-S110-02, P3-S110-02, P3-CDX-08 |
