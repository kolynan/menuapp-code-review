# OrderStatus — BUGS.md
Updated: 2026-03-11, Session S110

## Active Bugs

### P3-S110-01: formatPrice hardcodes ru-RU locale
- **Line:** ~321
- **What:** `num.toLocaleString("ru-RU")` is hardcoded; not adaptable to user locale
- **Impact:** Minor — correct for KZ/RU target market, but not universal
- **Suggestion:** Could use partner locale setting if available in future

## Fixed Bugs (S110 — 260311-00)

### P2-S110-01: Refresh button touch target below 44px (FIXED)
- **Line:** ~536
- **What:** `size="sm"` Button renders ~32px height, below 44px mobile minimum
- **Fix:** Added `min-h-[44px]` to className
- **Release:** 260311-00

### P2-S110-02: itemsTotal treats line_total=0 as falsy (FIXED)
- **Line:** ~328
- **What:** `Number(item.line_total) || (fallback)` — if line_total is 0 (free item), falls through to dish_price * quantity calculation
- **Fix:** Changed to explicit null check: `item.line_total != null ? Number(item.line_total) : ...`
- **Release:** 260311-00

### P3-S110-02: No aria-label on refresh button (FIXED)
- **Line:** ~536
- **What:** Refresh button lacked aria-label for screen readers
- **Fix:** Added `aria-label={t("order_status.refresh")}`
- **Release:** 260311-00

## Previous Releases
| Date | Version | Bugs Fixed |
|---|---|---|
| 2026-03-03 | 260303-01 | Initial implementation (no bugs — new page) |
| 2026-03-11 | 260311-00 | P2-S110-01, P2-S110-02, P3-S110-02 |
