# OrderDetails — BUGS

## Fixed Bugs

| Bug ID | Priority | Description | Fixed in | Commit |
|--------|----------|-------------|----------|--------|
| BUG-OD-001 | P1 | `Number(undefined).toFixed(2)` renders "$NaN" when price fields missing | 260225-00 RELEASE | `489647d` |
| BUG-OD-002 | P1 | No `isError` handling — API failures show misleading "Order not found" | 260225-00 RELEASE | `489647d` |
| BUG-OD-003 | P1 | No `useI18n` — 25+ hardcoded English strings (zero i18n coverage) | 260225-00 RELEASE | `489647d` |
| BUG-OD-004 | P1 | Raw status values ("in_progress") shown to users in badge | 260225-00 RELEASE | `489647d` |
| BUG-OD-005 | P1 | Raw `order_type` and `payment_status` DB values rendered without translation | 260225-00 RELEASE | `62de5f8` |
| BUG-OD-006 | P1 | `isError` checked after `isLoading` (wrong priority order) | 260225-00 RELEASE | `62de5f8` |
| BUG-OD-007 | P1 | Total footer row renders during loading/error (regression risk) | 260225-00 RELEASE | `62de5f8` |

## Active Bugs

| Bug ID | Priority | Description | Notes |
|--------|----------|-------------|-------|
| BUG-OD-P2-001 | P2 | Hardcoded `$` currency symbol (lines 185, 187, 209) | Needs partner config access for correct currency |
| BUG-OD-P2-002 | P2 | `window.location.search` instead of `useSearchParams` | Works but not reactive to programmatic navigation |
| BUG-OD-P2-003 | P2 | No PartnerShell wrapper pattern | Page works without it (no usePartnerAccess call) |
| BUG-OD-P2-004 | P2 | No guard against malformed date strings in `format()` | `new Date("garbage")` → `format()` throws |
| BUG-OD-P2-005 | P2 | `getStatusColor` duplicated with OrdersList | Should be shared utility |
