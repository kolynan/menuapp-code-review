---
chain: publicmenu-260322-193959-ef26
chain_step: 4
chain_total: 4
chain_step_name: merge
page: PublicMenu
budget: 3.00
runner: cc
type: chain-step
---
=== CHAIN STEP: Merge (4/4) ===
Chain: publicmenu-260322-193959-ef26
Page: PublicMenu

You are the Merge step in a modular consensus pipeline.
Your job: apply the fix plan to the actual code.

INSTRUCTIONS:
1. Read the comparison: pipeline/chain-state/publicmenu-260322-193959-ef26-comparison.md
2. Check if discussion report exists: pipeline/chain-state/publicmenu-260322-193959-ef26-discussion.md
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
   - git commit -m "fix(PublicMenu): N bugs fixed via consensus chain publicmenu-260322-193959-ef26"
   - git push
7. Write merge report to: pipeline/chain-state/publicmenu-260322-193959-ef26-merge-report.md

FORMAT for merge report:
# Merge Report — PublicMenu
Chain: publicmenu-260322-193959-ef26

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
# Bug Fix: MenuView.jsx — 1 fix (#87)

TARGET FILES (modify): `pages/PublicMenu/MenuView.jsx`
CONTEXT FILES (read-only): `pages/PublicMenu/README.md`

Production page: https://menu-app-mvp-49a4f5b2.base44.app
This is a mobile-first QR-menu restaurant app. Primary device: customer phone at the table.

**Context:** MenuView displays the restaurant menu as a grid of dish cards. Each card has: image (top), name, description, price, and a "+" FAB button (absolute bottom-right). The card already has `pb-14` (56px) for vertical spacing below content, and the button uses `absolute bottom-3 right-3`. The problem is HORIZONTAL overlap — on narrow cards, long text (price/rating) collides with the button area.

NOTE: PM-062 (indigo category chips) is NOT included here — that bug is in an imported B44 component (CategoryChips), not in MenuView.jsx page code. It requires a separate B44 prompt.

---

## Fix 1 — PM-089 (P2) MUST-FIX: Price/rating text overlaps "+" button horizontally

### Now (current behavior)
The `mt-auto pt-2 space-y-1` div (~line 230) that contains price and rating spans the full card width. The "+" button is `absolute bottom-3 right-3` (~line 257). On narrow cards or when the stepper is shown (wider than single "+" button), price text overlaps horizontally with the button.

### Expected behavior
Add right padding to the bottom content area to prevent horizontal overlap. Change ~line 230 from `<div className="mt-auto pt-2 space-y-1">` to `<div className="mt-auto pt-2 space-y-1 pr-14">`. The `pr-14` (56px) matches the button zone width (44px button + 12px right offset).

### Must NOT be
- Text must NOT overlap with the "+" button area
- Don't change the absolute positioning of the button
- Don't increase the overall card height unnecessarily

### File and location
MenuView.jsx ~line 230. The `mt-auto pt-2 space-y-1` div inside the tile card component.

### Already tried
Chain publicmenu-260322-190827 writers identified this correctly. CC rated fix clarity 3/5 because the original prompt described the issue as "button not shifted down" when the real issue is horizontal overlap with existing vertical spacing already in place (pb-14).

### Verification
View menu with a dish that has a long name (>20 chars) and a price → text is fully visible, "+" button at bottom-right has clear space, no overlap.

---

## MOBILE-FIRST CHECK (MANDATORY before commit)
This is a mobile-first restaurant app. Primary usage: customer phone at the table.
Before committing, verify ALL changes at 375px viewport width:
- [ ] Touch targets ≥ 44×44px (h-11 w-11)
- [ ] Dish card text doesn't overflow or overlap with buttons
- [ ] "+" button tappable without accidental taps on card text

## ⛔ SCOPE LOCK — modify ONLY what is described in Fix 1 above
- Change ONLY the code described in Fix section above.
- Everything else — DO NOT TOUCH.
- If you see a "problem" not from this task — SKIP it, don't fix.
- NOTE: Do NOT touch CategoryChips, category tab styling, or any indigo references — those are in an imported B44 component and out of scope.

## Implementation Notes
- Files: `pages/PublicMenu/MenuView.jsx`
- Do NOT break: dish display, category filtering, add to cart functionality, image loading
- git add pages/PublicMenu/MenuView.jsx && git commit -m "fix(PublicMenu): PM-089 price text overlap with FAB button" && git push
=== END ===
