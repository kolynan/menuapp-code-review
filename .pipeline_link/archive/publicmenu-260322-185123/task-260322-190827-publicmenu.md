---
task_id: task-260322-190827-publicmenu
status: running
started: 2026-03-22T19:08:28+05:00
type: chain-step
page: PublicMenu
work_dir: C:/Dev/menuapp-code-review
budget_usd: 5.00
fallback_model: sonnet
version: 5.10
launcher: python-popen
---

# Task: task-260322-190827-publicmenu

## Config
- Budget: $5.00
- Mode: task-watcher.py launches Claude Code directly via Popen
- Fallback model: sonnet

## Prompt
---
chain: publicmenu-260322-185123
chain_step: 2
chain_total: 4
chain_step_name: comparator
page: PublicMenu
budget: 5.00
runner: cc
type: chain-step
---
=== CHAIN STEP: Comparator (2/4) ===
Chain: publicmenu-260322-185123
Page: PublicMenu

You are the Comparator in a modular consensus pipeline.
Your job: compare CC Writer and Codex Writer findings and produce a merge plan.

INSTRUCTIONS:
1. Read CC findings: pipeline/chain-state/publicmenu-260322-185123-cc-findings.md
   - If NOT found there, try: `git pull --rebase` then check again
   - If still not found, search for any *-cc-findings.md in pipeline/chain-state/
2. Read Codex findings: pipeline/chain-state/publicmenu-260322-185123-codex-findings.md
   - If NOT found there, search in pages/PublicMenu/review_*.md (Codex sometimes writes here)
   - If still not found, search for any *-codex-findings.md in pipeline/chain-state/
3. Compare both analyses and categorize:

Write comparison to: pipeline/chain-state/publicmenu-260322-185123-comparison.md

FORMAT:
# Comparison Report — PublicMenu
Chain: publicmenu-260322-185123

## Agreed (both found)
Items found by both CC and Codex — HIGH confidence, apply all.

## CC Only (Codex missed)
Items found only by CC — evaluate validity, include if solid.

## Codex Only (CC missed)
Items found only by Codex — evaluate validity, include if solid.

## Disputes (disagree)
Items where CC and Codex disagree — explain reasoning, pick best solution.

## Final Fix Plan
Ordered list of all fixes to apply, with priority and source:
1. [P0] Fix title — Source: agreed/CC/Codex — Description of change
2. ...

## Summary
- Agreed: N items
- CC only: N items (N accepted, N rejected)
- Codex only: N items (N accepted, N rejected)
- Disputes: N items
- Total fixes to apply: N

4. Do NOT apply any fixes yet — only document the comparison

=== TASK CONTEXT ===
# Bug Fixes: x.jsx Bottom Sheet — 6 fixes (#87)

TARGET FILES (modify): `pages/PublicMenu/x.jsx`
CONTEXT FILES (read-only): `pages/PublicMenu/README.md`, `pages/PublicMenu/BUGS.md`

Production page: https://menu-app-mvp-49a4f5b2.base44.app
This is a mobile-first QR-menu restaurant app. Primary device: customer phone at the table.

**Context:** The checkout Bottom Sheet (BS) has several UX bugs found during mobile testing (S161). The BS opens when user taps "Order" button from StickyCartBar. It contains a table code input, confirmation button, and table change link. All fixes below target the BS section of x.jsx.

---

## Fix 1 — PM-079 (P2) MUST-FIX: Remove "0000" placeholder from code input cells

### Now (current behavior)
The 4 code input cells show "0" as placeholder in each cell, displaying "0000" visually. This looks like a real code value and confuses users.

### Expected behavior
Empty placeholder — cells should show nothing or a subtle dot "·" as placeholder.

### Must NOT be
- No "0" placeholder
- No numeric characters as placeholder

### File and location
~line 3444 in x.jsx. Look for `placeholder={'0'.repeat(tableCodeLength)}` or similar.

### Verification
Open BS → code cells should be empty (or show "·"), not "0000".

---

## Fix 2 — PM-080 (P2) MUST-FIX: Shorten confirmation button text

### Now (current behavior)
Button text is "Подтвердить и отправить" (too long for mobile).

### Expected behavior
Button text: "Отправить" (or i18n key `cart.send` with fallback "Отправить").

### Must NOT be
- No "Подтвердить и отправить"
- No overly long button text

### File and location
~line 3471 in x.jsx. Look for the submit button in the BS section.

### Verification
Open BS → button should say "Отправить".

---

## Fix 3 — PM-081 (P2) MUST-FIX: Remove "Wrong table? Change" link

### Now (current behavior)
There is a "Не тот стол? Изменить" link below the code input on the BS.

### Expected behavior
Remove this link completely. Users should not change tables from the BS.

### Must NOT be
- No "Не тот стол" text
- No change table link in BS

### File and location
~line 3481 in x.jsx. Look for text containing "Не тот стол" or "wrong table" or i18n key for table change.

### Verification
Open BS → no "change table" link visible.

---

## Fix 4 — PM-082 (P3) NICE-TO-HAVE: Add bonus motivation text on BS

### Now (current behavior)
No motivation text on the BS. CartView shows "+N bonuses for this order" but BS does not.

### Expected behavior
Add text "+N бонусов за этот заказ" (or i18n equivalent) above the submit button, using the same bonus calculation formula as in CartView (loyaltySettings, cart total).

### Must NOT be
- Don't hardcode bonus amounts
- Don't show if loyalty is disabled

### File and location
Above the submit button in the BS section (~line 3465-3475).

### Verification
Open BS with items in cart → see bonus text above submit button.

---

## Fix 5 — PM-088 (P1) MUST-FIX: Code input cells don't accept input on mobile

### Now (current behavior)
On Android mobile (Chrome), tapping on code input cells does not bring up the numeric keyboard. The cells appear non-interactive on touch devices.

### Expected behavior
Tapping a code cell should focus it and show the numeric keyboard. Input should auto-advance to the next cell. All 4 cells should be tappable and editable.

### Must NOT be
- No autoFocus issues on mobile
- No missing inputMode
- No broken focus chain

### File and location
~lines 3419-3431 in x.jsx. Check: `inputMode="numeric"`, `pattern="[0-9]*"`, proper `onFocus`/`onClick` handlers, `autoComplete="one-time-code"` removal if causing issues.

### Verification
On mobile: tap each cell → keyboard appears → enter digit → auto-advance to next cell.

---

## Fix 6 — PM-090 (P2) MUST-FIX: Pass primaryColor to StickyCartBar

### Now (current behavior)
`<StickyCartBar>` is rendered without `primaryColor` prop. The button uses default/hardcoded color instead of the partner's brand color.

### Expected behavior
Pass `primaryColor={primaryColor}` to BOTH `<StickyCartBar>` instances in x.jsx. The variable `primaryColor` is already defined: `const primaryColor = partner?.primary_color || '#1A1A1A'`.

### Must NOT be
- No missing primaryColor prop on StickyCartBar
- Don't change StickyCartBar component itself (already updated)

### File and location
Two `<StickyCartBar` instances at ~lines 3553 and 3580 in x.jsx.

### Verification
Both StickyCartBar buttons should use the partner's primary_color.

---

## MOBILE-FIRST CHECK (MANDATORY before commit)
This is a mobile-first restaurant app. Primary usage: customer phone at the table.
Before committing, verify ALL changes at 375px viewport width:
- [ ] Close/chevron buttons: RIGHT-ALIGNED (not centered), sticky top
- [ ] Touch targets ≥ 44×44px (h-11 w-11)
- [ ] No excessive whitespace/gaps on small screens
- [ ] Bottom sheet content scrollable without losing close/submit button
- [ ] No duplicate visual indicators (e.g. two gray lines that look the same)
- [ ] Text truncation: long item names don't overflow
- [ ] Sticky footer buttons don't overlap content

## ⛔ SCOPE LOCK — modify ONLY what is described in Fix 1-6 above
- Change ONLY the code described in Fix sections above.
- Everything else — DO NOT TOUCH.
- If you see a "problem" not from this task — SKIP it, don't fix.

## Implementation Notes
- Files: `pages/PublicMenu/x.jsx`
- Do NOT break: cart logic, order submission, table session, menu display
- git add pages/PublicMenu/x.jsx && git commit -m "fix(PublicMenu): 6 BS bugs (PM-079,080,081,082,088,090)" && git push
=== END ===


## Status
Running...
