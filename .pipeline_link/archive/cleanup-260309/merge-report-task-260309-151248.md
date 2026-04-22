# Merge Report — task-260309-151248 (S105 Smoke Test v6.1)
# Page: Profile | Date: 2026-03-09

## Smoke Test Result
- `--full-auto` flag: ACCEPTED (no flag error) → v6.1 flag fix: PASS
- `codex-mini-latest` model: ERROR — "model not supported for ChatGPT account"
- Codex findings: NONE (model failure)

## Agreed (both found)
N/A — Codex produced no findings.

## CC only (Codex missed)
All findings are CC-only due to Codex model failure.

### PR-S104-01..05 Verification
All 5 fixes from S104 are properly implemented in base/profile.jsx:
- PR-S104-01: isMountedRef guard in handleSave ✓
- PR-S104-02: Split isUserLoading + isPartnerLoading ✓
- PR-S104-03: Label → <p> for role/restaurant ✓
- PR-S104-04: <form onSubmit> wrapper ✓
- PR-S104-05: role="status" aria-live="polite" on loading div ✓

### New Bugs Found (CC)

**BUG-S105-01 (P1) — Missing isLoadError state [REGRESSION — FIXED]**
- When auth.me() fails: catch block only showed toast, then rendered empty form.
- Previously fixed as BUG-PF-001/BUG-PF-017, but lost in base file updates.
- README explicitly lists "Error state screen with icon + message if auth.me() fails".
- Fix: Added isLoadError state, error screen with AlertCircle + Back button.

**BUG-S105-02 (P2) — Input fields missing min-h-[44px] [REGRESSION — OPEN]**
- Full Name and Email inputs below 44px touch target minimum on mobile.
- Was fixed in RELEASE 260301-00 (BUG-PF-025), missing from current base.

**BUG-S105-03 (P2) — Save button not in fixed footer [REGRESSION — OPEN]**
- Save button inline in form, not always visible on mobile without scrolling.
- Was fixed in RELEASE 260301-00 (BUG-PF-023), missing from current base.

**BUG-S105-04 (P2) — Partner load failure indistinguishable from "no restaurant" [REGRESSION — OPEN]**
- catch block for Partner.get() silently falls back to "Не привязан".
- Was fixed in RELEASE 260227-01 (BUG-PF-015), missing from current base.

**BUG-PF-010 (P3) — Decorative icons missing aria-hidden [KNOWN OPEN]**
- ArrowLeft, Loader2, Check icons lack aria-hidden="true".
- Previously known active bug, not fixed.

## Codex only (CC missed)
N/A — Codex produced no findings.

## Disputes
N/A — Single reviewer only.

## Summary
- Smoke test: --full-auto flag PASS, model still failing (needs different model)
- P1 fixed: 1 (BUG-S105-01 isLoadError regression)
- P2 open: 3 (BUG-S105-02, 03, 04 — regressions needing next session)
- P3 known: 1 (BUG-PF-010)
