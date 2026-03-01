# OrdersList — BUGS

## Fixed Bugs

| Bug ID | Priority | Description | Fixed in | Commit |
|--------|----------|-------------|----------|--------|
| BUG-OL-001 | P1 | `initialData: []` masks loading spinner and error states | 260225-00 RELEASE | `10ff5e4` |
| BUG-OL-002 | P1 | No `isError` handling — API failures show "Нет заказов" | 260225-00 RELEASE | `10ff5e4` |
| BUG-OL-003 | P1 | Mixed Russian/English, no `useI18n` — 30+ hardcoded strings | 260225-00 RELEASE | `10ff5e4` |
| BUG-OL-004 | P1 | Raw status values in badges ("in_progress") | 260225-00 RELEASE | `10ff5e4` |
| BUG-OL-005 | P1 | Raw `order_type` with CSS capitalize only (not translated) | 260225-00 RELEASE | `10ff5e4` |
| BUG-OL-006 | P1 | Hardcoded `'Guest'` fallback violates i18n | 260225-00 RELEASE | `10ff5e4` |
| BUG-OL-007 | P1 | `total_amount || 0` fails with falsy 0 — changed to `?? 0` | 260225-00 RELEASE | `10ff5e4` |
| BUG-OL-008 | P1 | `order.order_number.toLowerCase()` crashes if field is numeric | 260225-00 RELEASE | `62de5f8` |

## Active Bugs

| Bug ID | Priority | Description | Notes |
|--------|----------|-------------|-------|
| BUG-OL-P2-001 | P2 | Hardcoded `$` currency symbol (line 226) | Needs partner config for correct currency |
| BUG-OL-P2-002 | P2 | Hardcoded limit 100, no pagination | Orders beyond 100 silently invisible |
| BUG-OL-P2-003 | P2 | No PartnerShell wrapper pattern | Page works without it (no usePartnerAccess call) |
| BUG-OL-P2-004 | P2 | `created_by === currentUser.email` — fragile identity check | May fail if Base44 stores user ID instead of email |
| BUG-OL-P2-005 | P2 | No guard against malformed date strings in `format()` | Same as OrderDetails |
| BUG-OL-P3-001 | P3 | Missing `aria-label` on search input | Accessibility |
| BUG-OL-P3-002 | P3 | Clickable rows have no keyboard support | No tabIndex/onKeyDown |
| BUG-OL-P3-003 | P3 | Tab buttons missing `aria-pressed` attribute | Accessibility |
| BUG-OL-P3-004 | P3 | Dynamic Tailwind classes via template literals | May be purged by JIT |
