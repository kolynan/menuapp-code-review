# PartnerContacts — Bug Tracker

## Fixed Bugs

### RELEASE 260301-00 (Phase 1v2 — CC+Codex verified touch targets)

| ID | Priority | Description | Fix |
|----|----------|-------------|-----|
| BUG-PC-021 | P2 | Error boundary reload button under 44px | `min-h-[44px]` on reload Button |
| BUG-PC-022 | P2 | Header nav buttons `size="sm"` (~32px) | `min-h-[44px]` on 3 header Buttons (lines 388, 411, 414) |
| BUG-PC-023 | P2 | Save/Cancel viewMode buttons under 44px | `min-h-[44px]` on both buttons |
| BUG-PC-024 | P2 | Search Input default height (40px) | `min-h-[44px]` on search Input |
| BUG-PC-025 | P2 | "Add link" button under 44px | `min-h-[44px]` on Add button |

### RELEASE 260228-00 (Phase 1 — i18n + touch targets)

| ID | Priority | Description | Fix |
|----|----------|-------------|-----|
| BUG-PC-001 | P0 | Error boundary crashes when triggered (tr() undefined) | Functional wrapper passes fallback-aware `t` from useI18n |
| BUG-PC-002 | P1 | Hardcoded toast "URL обязателен" | `t('partnercontacts.toast.url_required', ...)` |
| BUG-PC-003 | P1 | Hardcoded "LAB VERSION — Partner Contacts" | `t('partnercontacts.lab_version', ...)` |
| BUG-PC-004 | P1 | getTypeLabel() bypasses i18n (9 labels) | `getTypeLabel(type, t)` with `partnercontacts.type.*` keys |
| BUG-PC-004b | P1 | openCreateLink hardcoded "Phone" label | `label: getTypeLabel("phone", t)` |
| BUG-PC-005 | P1 | NaN sort_order sent to API | `Number.isNaN` validation with error toast |
| BUG-PC-006 | P1 | useEffect resets unsaved viewMode on refetch | Depend on `[recordId, recordViewMode]` primitives |
| BUG-PC-016 | P0 | All i18n keys shown as raw text (e.g., "partnercontacts.page_title") | Shadow `t` with fallback-aware wrapper: checks if result === key, returns fallback |
| BUG-PC-017 | P2 | Icon buttons below 44px touch target | `min-h-[44px] min-w-[44px]` on edit/toggle/delete buttons |
| BUG-PC-018 | P2 | View mode toggle buttons below 44px | `min-h-[44px]` on both toggle buttons |
| BUG-PC-019 | P2 | Checkbox touch target too small | Label `min-h-[44px]`, checkbox `w-5 h-5`, cursor-pointer |
| BUG-PC-020 | P2 | Action buttons gap too tight (4px) | `gap-1` to `gap-2` (8px spacing) |

### RELEASE 260225 (Initial review — S45)

| ID | Priority | Description | Fix |
|----|----------|-------------|-----|
| BUG-PC-001–006 | P0-P1 | See above (first 7 rows) | Applied in initial review |

## Active Bugs (not yet fixed)

| ID | Priority | Description |
|----|----------|-------------|
| BUG-PC-007 | P2 | `initialData: []` suppresses loading state flash |
| BUG-PC-008 | P2 | URL scheme validation missing (latent XSS) |
| BUG-PC-009 | P2 | All toggle buttons blocked by shared `isPending` |
| BUG-PC-010 | P2 | Dynamic Tailwind classes via interpolation |
| BUG-PC-011 | P2 | `console.error` in error boundary |
| BUG-PC-012 | P2 | Error boundary doesn't wrap early return |
| BUG-PC-013 | P3 | Missing `aria-label` on icon buttons |
| BUG-PC-014 | P3 | Missing `aria-label` on search input |
| BUG-PC-015 | P3 | Magic strings "icons"/"full" |
