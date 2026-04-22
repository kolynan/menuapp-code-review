---
chain: publicmenu-260322-203829-21fb
chain_step: 2
chain_total: 4
chain_step_name: comparator
page: PublicMenu
budget: 5.00
runner: cc
type: chain-step
---
=== CHAIN STEP: Comparator (2/4) ===
Chain: publicmenu-260322-203829-21fb
Page: PublicMenu

You are the Comparator in a modular consensus pipeline.
Your job: compare CC Writer and Codex Writer findings and produce a merge plan.

INSTRUCTIONS:
1. Read CC findings: pipeline/chain-state/publicmenu-260322-203829-21fb-cc-findings.md
   - If NOT found there, try: `git pull --rebase` then check again
   - If still not found, search for any *-cc-findings.md in pipeline/chain-state/
2. Read Codex findings: pipeline/chain-state/publicmenu-260322-203829-21fb-codex-findings.md
   - If NOT found there, search in pages/PublicMenu/review_*.md (Codex sometimes writes here)
   - If still not found, search for any *-codex-findings.md in pipeline/chain-state/
3. Compare both analyses and categorize:

Write comparison to: pipeline/chain-state/publicmenu-260322-203829-21fb-comparison.md

FORMAT:
# Comparison Report — PublicMenu
Chain: publicmenu-260322-203829-21fb

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
# Bug Fix: CartView mobile UX — 5 bugs (#90)

Reference: `BUGS_MASTER.md`, `pages/PublicMenu/BUGS.md`, `pages/PublicMenu/README.md`.
Production page.

**TARGET FILES (modify):** `pages/PublicMenu/CartView.jsx`
**CONTEXT FILES (read-only):** `pages/PublicMenu/README.md`, `pages/PublicMenu/BUGS.md`

**Context:** CartView.jsx (986 lines) is the drawer component for the restaurant cart. It opens as a bottom drawer on mobile (375px primary viewport). These 5 bugs were found during mobile testing (S161) — all are visual/layout issues at the top and bottom of the drawer. The file uses `tr(key, fallback)` and `trFormat(key, params, fallback)` for i18n (both defined inside the component, ~lines 232-260).

---

## Fix 1 — PM-083 (P2) [MUST-FIX]: Chevron ˅ must be right-aligned, not centered

### Now (current behavior)
The close chevron (˅) at the top of the cart drawer is centered horizontally (`mx-auto`).
Search: `<ChevronDown` at ~line 427.

### Expected (correct behavior)
The chevron must be right-aligned (top-right area of the drawer). UX convention: close/dismiss controls belong in the top-right corner.

### Must NOT be
- ❌ Centered chevron (`mx-auto`)
- ❌ Left-aligned chevron

### File and location
`CartView.jsx` ~line 427-430. The `<ChevronDown>` element has `className="w-5 h-5 mx-auto mb-2 cursor-pointer ..."`. Change `mx-auto` to right-alignment (e.g. `ml-auto` or wrap in a `flex justify-end` container).

### Verification
Open cart drawer on 375px viewport → chevron ˅ is in the top-right area, not centered.

---

## Fix 2 — PM-084 (P2) [MUST-FIX]: Remove duplicate gray line (drag handle + chevron)

### Now (current behavior)
Two visually similar gray elements at the top of the drawer:
1. A drag handle bar: `<div className="w-8 h-1 bg-gray-300 rounded-full mx-auto mt-2 mb-1" />` at ~line 426
2. The ChevronDown icon (also gray, centered) at ~line 427-430

Both look like gray horizontal lines to the user → confusing.

### Expected (correct behavior)
Keep the drag handle bar (standard mobile drawer pattern) + keep the ChevronDown icon but make them visually distinct. The chevron should be right-aligned (Fix 1) and clearly an interactive icon, not a second gray bar.

### Must NOT be
- ❌ Two centered gray horizontal elements that look identical
- ❌ Removing the drag handle (it's a standard mobile UX pattern for drawers)

### File and location
`CartView.jsx` ~lines 426-430. The drag handle div and ChevronDown are adjacent. After applying Fix 1 (right-align chevron), the visual duplication should be resolved — the drag handle stays centered, the chevron moves to the right.

### Verification
Open cart drawer → only ONE centered gray bar (drag handle). Chevron is a distinct icon in the top-right.

---

## Fix 3 — PM-085 (P1) [MUST-FIX]: Chevron must be sticky at the top when scrolling

### Now (current behavior)
When the cart has many items, the user scrolls down. The chevron (˅) scrolls away with the content → the user cannot close the drawer without scrolling back to the top.
The entire CartView content is inside `<div className="max-w-2xl mx-auto px-4 mt-2 pb-4">` (~line 424) which scrolls as a whole.

### Expected (correct behavior)
The chevron (and drag handle) must remain sticky at the top of the drawer during scroll. When the user scrolls down through a long cart, the chevron stays visible and tappable.

### Must NOT be
- ❌ Chevron scrolling away with content
- ❌ Sticky element without `z-index` (could be overlapped by card content)
- ❌ Breaking the existing sticky submit button at the bottom (~line 951)

### File and location
`CartView.jsx` ~lines 424-430. Extract the drag handle + chevron into a sticky container:
- Wrap lines 426-430 (drag handle div + ChevronDown) in a `<div className="sticky top-0 z-10 bg-white ...">` container
- Keep the rest of the content below it scrollable
- NOTE: The submit button at ~line 951 is already `sticky bottom-0` — both sticky elements must coexist.

### Verification
1. Add 5+ items to cart → open drawer → scroll down
2. Chevron ˅ remains visible at the top → tap it → drawer closes

---

## Fix 4 — PM-086 (P2) [MUST-FIX]: Remove email field from loyalty section

### Now (current behavior)
The loyalty section (~lines 886-917) shows an email input field ("Email для бонусов") when `showLoyaltySection` is true. This was supposed to be removed in #87 KS-1 (the comment at line 886 says "compact email + motivation line") but the email input block survived.
Search: `showLoyaltySection && (` at ~line 887.

### Expected (correct behavior)
Remove the entire loyalty email section (lines 886-917). The motivation text already exists at the bottom near the submit button (~lines 952-960) and is the only loyalty UI needed.

### Must NOT be
- ❌ Any email input in the pre-checkout cart view
- ❌ Removing the post-order reward email form (~lines 491-550, search `showRewardEmailForm`) — that one is DIFFERENT and must stay
- ❌ Removing the motivation text near submit button (~lines 952-960)

⚠️ **Important distinction:** There are TWO email-related sections in this file:
1. **Pre-checkout loyalty email** (~lines 886-917, guarded by `showLoyaltySection`) — REMOVE THIS ONE
2. **Post-order reward email** (~lines 491-550, guarded by `showRewardEmailForm`) — KEEP THIS ONE

### File and location
`CartView.jsx` ~lines 886-917. The block is `{showLoyaltySection && (<div className="mt-4 pt-4 border-t space-y-3">...</div>)}`. Remove this entire conditional block.

### Verification
Open cart with items → no email input field visible above ИТОГО. The motivation text below the submit button still shows.

---

## Fix 5 — PM-087 (P3) [MUST-FIX]: Compact gap between ИТОГО and motivation text

### Now (current behavior)
Large vertical gap between "ИТОГО: XX₸" (~line 922) and the motivation text "Отправьте заказ и получите +N бонусов" (~line 956). The gap is caused by:
- `mt-4 pt-4` on the subtotal wrapper (~line 920)
- `h-20` spacer div (~line 937)
- `mt-2 mb-2` on the motivation `<p>` (~line 956)

On a small mobile screen this creates excessive whitespace.

### Expected (correct behavior)
Compact vertical spacing: ИТОГО → 8-12px gap → motivation text → submit button. Reduce:
- The `h-20` spacer at ~line 937 to `h-16` (enough for sticky button clearance)
- The motivation text margins from `mt-2 mb-2` to `mt-1 mb-1` (~line 956)
- Optionally reduce `mt-4 pt-4` at ~line 920 to `mt-3 pt-3`

### Must NOT be
- ❌ Large empty space between ИТОГО and the submit button on 375px viewport
- ❌ Spacer so small that sticky button overlaps content (keep some clearance)

### File and location
`CartView.jsx`:
- Spacer: ~line 937 (`<div className="h-20" />`)
- Motivation text: ~line 956 (`className="text-sm text-gray-500 text-center mt-2 mb-2"`)
- Subtotal wrapper: ~line 920 (`className="mt-4 pt-4 border-t space-y-3"`)

### Verification
Open cart with items on 375px viewport → ИТОГО and motivation text are visually close (8-12px gap), no large empty space.

---

## ⛔ SCOPE LOCK — change ONLY what is described above
- Modify ONLY the code described in Fix 1-5 above.
- Everything else — DO NOT TOUCH.
- If you see other "problems" not in this task — SKIP them, do not fix.
- Locked UX decisions: submit button styling, guest name editing, call waiter button, order list layout.

## MOBILE-FIRST CHECK (MANDATORY before commit)
This is a mobile-first restaurant app. Primary usage: customer phone at the table.
Before committing, verify ALL changes at 375px viewport width:
- [ ] Close/chevron: RIGHT-ALIGNED (not centered), sticky top
- [ ] Touch targets >= 44x44px (h-11 w-11)
- [ ] No excessive whitespace/gaps on small screens
- [ ] Bottom sheet content scrollable without losing close button
- [ ] No duplicate visual indicators (e.g. two gray lines that look the same)
- [ ] Text truncation: long item names don't overflow
- [ ] Sticky footer buttons don't overlap content

## Implementation Notes
- TARGET: `pages/PublicMenu/CartView.jsx` (986 lines)
- CONTEXT: `pages/PublicMenu/README.md`, `pages/PublicMenu/BUGS.md`
- `tr()` and `trFormat()` are available inside the component (~lines 232-260)
- Do NOT break: sticky submit button (~line 951), reward email form (~lines 491-550), order list sections
- git add pages/PublicMenu/CartView.jsx && git commit -m "fix: CartView mobile UX — chevron, email, spacing (PM-083-087)" && git push
=== END ===
