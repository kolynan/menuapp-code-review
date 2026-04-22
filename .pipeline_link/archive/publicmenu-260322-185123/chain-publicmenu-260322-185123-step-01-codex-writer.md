---
chain: publicmenu-260322-185123
chain_step: 1
chain_total: 4
chain_step_name: codex-writer
chain_group: writers
chain_group_size: 2
page: PublicMenu
budget: 10.00
runner: codex
type: chain-step
---
Review the file pages/PublicMenu/*.jsx for bugs in a React restaurant QR-menu app on Base44 platform.
Also check pages/PublicMenu/README.md and pages/PublicMenu/BUGS.md for context (ONLY these 3 files, nothing else).

SPEED RULES — this is a time-sensitive pipeline step:
- Read ONLY the 3 files above. Do NOT search the repo, do NOT read old findings, do NOT read files outside pages/PublicMenu/.
- Do NOT run rg/grep across the whole repo. Do NOT cross-reference with other pages.
- Limit analysis to the target page code. Be concise.

Find ALL bugs. Focus on: logic errors, missing error handling, i18n issues, UI/UX for mobile-first, React anti-patterns.

For each finding: [P0/P1/P2/P3] Title - Description. FIX: code change needed.

Write findings to: pipeline/chain-state/publicmenu-260322-185123-codex-findings.md

FORMAT:
# Codex Writer Findings — PublicMenu
Chain: publicmenu-260322-185123

## Findings
1. [P0] Title — Description. FIX: ...
2. [P1] Title — Description. FIX: ...

## Summary
Total: N findings (X P0, Y P1, Z P2, W P3)

## Prompt Clarity (MANDATORY — do NOT skip this section)
Rate the task description quality (1-5). For any score below 4, explain what was unclear:
- Overall clarity: [1-5]
- Ambiguous Fix descriptions (list Fix # and what was unclear): ...
- Missing context (what info would have helped): ...
- Scope questions (anything you weren't sure if it's in scope): ...
YOU MUST FILL IN ALL FIELDS ABOVE. Findings without Prompt Clarity are incomplete.

Do NOT apply fixes — only document findings.

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
