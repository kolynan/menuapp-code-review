# Merge Report — PublicMenu
Chain: publicmenu-260320-132541

## Applied Fixes

All 3 actionable fixes were already applied in commit `0ddcec6` (prior chain run). Verified in code:

1. **[P2] PM-S140-01** — Source: AGREED (CC+Codex) — DONE
   - `customerEmail.trim()` → `(customerEmail || '').trim()` at CartView.jsx lines 916 and 980
   - Verified: no bare `customerEmail.trim()` calls remain

2. **[P2] PM-S87-03** — Source: CC only — DONE
   - `isTableVerified === false` → `!isTableVerified` at CartView.jsx lines 1241 and 1251
   - Verified: disabled prop and className ternary both use `!isTableVerified`

3. **[P2] AC-09** — NO ACTION NEEDED — already fixed in prior session
   - Toast exists at x.jsx:2237-2238: `toast.success(t('cart.item_added'), ...)`

4. **[P3] PM-S140-03** — Source: AGREED (CC+Codex) — DONE
   - `rewardTimerRef` declared (line 97), cleanup useEffect (line 100), timer stored (line 532)
   - Verified: full ref + cleanup pattern in place

## Skipped — Unresolved Disputes (for Arman)
None. All disputes resolved by Discussion step.

## Skipped — Could Not Apply
None.

## Out-of-Scope Findings (logged in BUGS.md)
11 out-of-scope findings from Codex/CC already recorded in BUGS.md as active bugs:
- PM-NEW-01 (P0) → BUG-PM-040: Loyalty points deducted before order creation
- PM-NEW-02 (P1) → BUG-PM-042: localStorage crash in restricted browsers
- PM-NEW-03 (P2) → BUG-PM-037: Reward-email no format validation
- PM-NEW-04 (P2) → BUG-PM-038: Submit-error subtitle misleading
- PM-NEW-05 (P2) → BUG-PM-043: Locale/currency hardcoded
- PM-NEW-06 (P2) → BUG-PM-044: Zero redeem-rate || vs ??
- PM-NEW-07 (P2) → BUG-PM-046: Redirect-banner timer leak
- PM-NEW-08 (P2) → BUG-PM-039: Table-code UI overflow
- PM-NEW-09 (P2) → BUG-PM-045: Debug console.log in production
- PM-NEW-10 (P3) → BUG-PM-047: Icon-only controls missing aria-labels
- PM-NEW-11 (P3) → CC-NEW-01: rewardEmail.trim() defensive guard (not yet in BUGS.md)

## Git
- Commit: 0ddcec6 (already applied prior to this merge step)
- Files changed: 2 (CartView.jsx, x.jsx)
- No new commit needed — fixes already pushed

## Summary
- Applied: 3 fixes (PM-S140-01, PM-S87-03, PM-S140-03)
- No action: 1 (AC-09, already fixed)
- Skipped (unresolved): 0 disputes
- Skipped (other): 0
- Commit: 0ddcec6
