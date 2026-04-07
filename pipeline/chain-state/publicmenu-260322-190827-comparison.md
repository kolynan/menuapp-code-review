# Comparison Report — PublicMenu
Chain: publicmenu-260322-190827

## Agreed (both found)

### 1. PM-062: CategoryChips indigo is NOT in MenuView.jsx — needs B44 prompt
- **CC:** Zero `indigo` references in MenuView.jsx. CategoryChips is a B44 imported component. Not fixable in page code. SKIP.
- **Codex:** Confirmed — "this file contains no CategoryChips component and no indigo classes."
- **Verdict:** SKIP — both agree this is not actionable in MenuView.jsx. Requires a B44 prompt. Already documented in BUGS.md.

## CC Only (Codex missed)

### 2. PM-089: Horizontal overlap — add `pr-14` to price container (line 230)
- **CC:** The tile card uses `absolute bottom-3 right-3` for the button (line 257). Vertical space is handled by `pb-14`, but the price/rating section at `mt-auto` (line 230) spans full width — on narrow cards or when stepper is shown, price text can overlap horizontally with the button. Fix: add `pr-14` to the `mt-auto pt-2` div.
- **Codex:** Did not address this specific horizontal overlap. Codex noted in Prompt Clarity that "Fix 2 already appears implemented" because `pb-14` exists — but missed the horizontal overlap case.
- **Verdict:** ACCEPT CC's fix. The vertical padding (`pb-14`) is correct, but horizontal padding (`pr-14`) is missing. This is a valid edge case on narrow cards or with the wider stepper control. Minimal, targeted fix.

## Codex Only (CC missed)

### 3. [P1] Hardcoded toast fallback `|| 'Добавлено'` (line 369)
- **Codex:** `t('menu.added_to_cart') || 'Добавлено'` — hardcoded Russian fallback violates i18n rules.
- **Verdict:** REJECT for this chain. Valid finding, but **OUT OF SCOPE** per task SCOPE LOCK ("Change ONLY the code described in Fix 1-2"). Should be recorded in BUGS_MASTER.md for a future chain.

### 4. [P2] Quantity steppers too small for mobile (lines 161-170, 271-285)
- **Codex:** `+/-` controls use `p-1` or `w-8 h-8`, below 44px minimum touch target.
- **Verdict:** REJECT for this chain. Valid finding, but **OUT OF SCOPE**. Not part of PM-062 or PM-089. Record in BUGS_MASTER.md.

### 5. [P2] Layout toggle buttons miss 44px touch target (lines 300-323)
- **Codex:** Toggle buttons use `px-3 py-1.5` with no minimum height.
- **Verdict:** REJECT for this chain. Valid finding, but **OUT OF SCOPE**. Record in BUGS_MASTER.md.

### 6. [P3] List-view cart controls missing aria-labels (lines 150-172)
- **Codex:** No `aria-label` on list-mode add/stepper buttons.
- **Verdict:** REJECT for this chain. Valid finding, but **OUT OF SCOPE**. Record in BUGS_MASTER.md.

### 7. [P3] Broken image URLs have no fallback (lines 91-97, 195-200)
- **Codex:** No `onError` handler for failed image loads.
- **Verdict:** REJECT for this chain. Valid finding, but **OUT OF SCOPE**. Record in BUGS_MASTER.md.

## Disputes (disagree)

### PM-089 interpretation
- **CC:** The overlap is real but horizontal (price text vs button on right). Fix: `pr-14`.
- **Codex:** Thinks the issue is "already implemented" because `pb-14` exists.
- **Resolution:** CC is correct. `pb-14` handles vertical space only. The horizontal overlap on narrow cards/wide stepper is a distinct issue. CC's `pr-14` fix is minimal and targeted.

## Final Fix Plan

1. **[P2] PM-089: Add `pr-14` to tile card price container** — Source: CC — Change line 230 from `<div className="mt-auto pt-2 space-y-1">` to `<div className="mt-auto pt-2 space-y-1 pr-14">` to prevent horizontal text/button overlap.

That's the **only** fix to apply. PM-062 requires a B44 prompt (not page code). All Codex-only findings are valid but out of scope.

## New Bugs to Record (from Codex, out of scope)
These should be added to BUGS_MASTER.md for future work:
- PM-091: Hardcoded toast fallback `|| 'Добавлено'` (P1, i18n)
- PM-092: Stepper touch targets below 44px (P2, mobile UX)
- PM-093: Toggle button touch targets below 44px (P2, mobile UX)
- PM-094: List-mode buttons missing aria-labels (P3, a11y)
- PM-095: No onError fallback for broken images (P3, resilience)

## Prompt Clarity (both writers agree)
- **Overall:** 2-3/5
- Both CC and Codex flagged Fix 1 as misdirected — `indigo` is not in MenuView.jsx, it's in a B44 imported component.
- Codex also flagged Fix 2 as partially already implemented (pb-14 exists) — though CC correctly identified the remaining horizontal gap.

## Summary
- Agreed: 1 item (PM-062 SKIP — both confirm not in file)
- CC only: 1 item (PM-089 horizontal fix — accepted)
- Codex only: 5 items (all valid but OUT OF SCOPE — rejected for this chain, record in BUGS_MASTER)
- Disputes: 1 (PM-089 interpretation — resolved in CC's favor)
- **Total fixes to apply: 1**
