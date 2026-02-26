# AdminPageHelp — BUGS.md

## Fixed Bugs

| ID | Priority | Description | Commit | RELEASE |
|---|---|---|---|---|
| BUG-AH-001 | P1 | Email case-sensitivity: ADMIN_EMAILS.includes(user.email) without toLowerCase(). Could deny access if email case differs from whitelist | `fdbd67a` | 260225-00 adminpagehelp RELEASE.jsx |
| BUG-AH-002 | P1 | Null guard on PageHelp.create: if API returns null, a null entry was appended to state array. Added `if (created)` guard | `fdbd67a` | 260225-00 adminpagehelp RELEASE.jsx |
| BUG-AH-003 | P2 | Removed 3 console.error calls from production code (load, save, delete handlers) | `fdbd67a` | 260225-00 adminpagehelp RELEASE.jsx |
| BUG-AH-010 | P1 | `t` (useI18n) in useEffect dependency array caused infinite refetches — unstable reference triggers re-render loop. Removed `t` from deps | S35 Codex round | pending RELEASE |
| BUG-AH-011 | P2 | `updatedAt` uses client-side `new Date().toISOString()` — clock skew risk. Added code comment. Base44 doesn't expose server timestamps, so this is a known platform limitation | S35 Codex round | pending RELEASE |

## Active Bugs

| ID | Priority | Description | Notes |
|---|---|---|---|
| BUG-AH-004 | P1 | AccessDenied component has zero i18n — hardcoded English strings ("Access Denied", "You don't have permission", "Go Back") | Should add t() or useI18n() inside component |
| BUG-AH-005 | P2 | `t` passed as prop to AdminHeader — anti-pattern. Should call useI18n() inside AdminHeader instead | Code quality |
| BUG-AH-006 | P2 | Hardcoded fallback strings in all t() calls. Should register keys in translation file | Style concern |
| BUG-AH-007 | P2 | Duplicate pageKey protection is client-side only — relies on server error message containing "duplicate"/"unique". Also: pageKey normalization is incomplete — trims and adds `/` prefix but doesn't lowercase or sanitize special chars, which could create near-duplicate entries | Data integrity. Expanded per Codex review |
| BUG-AH-008 | P3 | formatDate uses hardcoded locale 'ru-RU' — should derive from active i18n locale | Minor localization |
| BUG-AH-009 | P3 | Icon-only Edit/Delete buttons missing aria-label | Accessibility |

## Platform Limitations (no fix possible)

| ID | Priority | Description | Notes |
|---|---|---|---|
| BUG-AH-PLT-001 | Info | ADMIN_EMAILS whitelist is client-side JavaScript only — anyone can bypass it via dev tools. Base44 has no server-side ACL for custom admin pages | Platform limitation. Flagged by Codex. No fix available without server-side changes |
| BUG-AH-PLT-002 | Info | `updatedAt` timestamp is set client-side — Base44 doesn't return server timestamps on `.update()` | See BUG-AH-011 |
