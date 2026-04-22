---
chain: publicmenu-260322-185123
chain_step: 4
chain_total: 4
chain_step_name: merge
page: PublicMenu
budget: 5.00
runner: cc
type: chain-step
---
=== CHAIN STEP: Merge (4/4) ===
Chain: publicmenu-260322-185123
Page: PublicMenu

You are the Merge step in a modular consensus pipeline.
Your job: apply the fix plan to the actual code.

INSTRUCTIONS:
1. Read the comparison: pipeline/chain-state/publicmenu-260322-185123-comparison.md
2. Check if discussion report exists: pipeline/chain-state/publicmenu-260322-185123-discussion.md
   - If it exists AND has an "Updated Fix Plan" section → use THAT for disputed items
   - If it says "No disputes" or doesn't exist → use Comparator's "Final Fix Plan" as-is
   - Items marked "Unresolved (for Arman)" → SKIP these, do NOT apply
3. Read the code file: pages/PublicMenu/*.jsx
4. Apply ALL fixes from the fix plan, in priority order (P0 first)
   - Agreed items from Comparator: always apply
   - Discussion-resolved items: apply the winning solution
   - Unresolved disputes: SKIP (note in merge report)
   - [MUST-FIX] items: CANNOT be skipped. If you cannot apply a MUST-FIX, explain WHY in detail in merge report — do NOT silently skip.
5. After applying fixes:
   a. Update BUGS.md in pages/PublicMenu/ with fixed items
   b. Update README.md in pages/PublicMenu/ if needed
6. Git commit and push:
   - git add <specific files only> (NEVER git add . or git add -A)
   - git commit -m "fix(PublicMenu): N bugs fixed via consensus chain publicmenu-260322-185123"
   - git push
7. Write merge report to: pipeline/chain-state/publicmenu-260322-185123-merge-report.md

FORMAT for merge report:
# Merge Report — PublicMenu
Chain: publicmenu-260322-185123

## Applied Fixes
1. [P0] Fix title — Source: agreed/discussion-resolved — DONE
2. [P1] Fix title — Source: comparator — DONE
...

## Skipped — Unresolved Disputes (for Arman)
- Dispute: [title] — CC says X, Codex says Y — NEEDS DECISION

## Skipped — Could Not Apply
- Reason...

## Git
- Commit: <hash>
- Files changed: N

## Prompt Feedback
Collect Prompt Clarity sections from CC and Codex findings files (if present), then add your own observations:
- CC clarity score: [N/5]
- Codex clarity score: [N/5]
- Fixes where writers diverged due to unclear description: ...
- Fixes where description was perfect (both writers agreed immediately): ...
- Recommendation for improving task descriptions: ...

## Summary
- Applied: N fixes
- Skipped (unresolved): N disputes
- Skipped (other): N fixes
- MUST-FIX not applied: N (with reasons)
- Commit: <hash>

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
