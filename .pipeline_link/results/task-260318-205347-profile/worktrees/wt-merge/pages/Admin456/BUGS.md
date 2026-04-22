# Admin456 — BUGS.md

## Fixed Bugs

| ID | Priority | Description | Commit | RELEASE |
|---|---|---|---|---|
| BUG-A4-001 | P1 | Zero i18n — all user-facing strings hardcoded (English + Russian mixed). Added useI18n, wrapped all 12 strings with t() | `9c4b475` | 260225-00 admin456 RELEASE.jsx |

## Active Bugs

| ID | Priority | Description | Notes |
|---|---|---|---|
| BUG-A4-002 | P2 | Hardcoded fallback strings in t() calls (second argument). Should register keys in translation file and remove fallbacks | Style concern, not blocking |
| BUG-A4-003 | P2 | common.* key naming — some keys (accessDenied, noPermission, loggedInAs) may be better under admin456.* namespace if not shared | Review key usage across pages |
| BUG-A4-004 | P3 | Unused `error` state variable (line 14: `const [error, setError] = useState(null)`) — never set or used | Minor cleanup |
