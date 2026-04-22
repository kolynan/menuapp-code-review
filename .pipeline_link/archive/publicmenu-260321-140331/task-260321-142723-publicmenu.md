---
task_id: task-260321-142723-publicmenu
status: running
started: 2026-03-21T14:27:23+05:00
type: chain-step
page: PublicMenu
work_dir: C:/Dev/menuapp-code-review
budget_usd: 7.50
fallback_model: sonnet
version: 5.0
launcher: python-popen
---

# Task: task-260321-142723-publicmenu

## Config
- Budget: $7.50
- Mode: task-watcher.py launches Claude Code directly via Popen
- Fallback model: sonnet

## Prompt
---
chain: publicmenu-260321-140331
chain_step: 4
chain_total: 4
chain_step_name: merge-with-tag
page: PublicMenu
budget: 7.50
runner: cc
type: chain-step
---
=== CHAIN STEP: Merge with Versioning (4/4) ===
Chain: publicmenu-260321-140331
Page: PublicMenu

You are the Merge step in a modular consensus pipeline.
Your job: create a safe version tag, then apply the fix plan to the actual code.

INSTRUCTIONS:

## Phase 1 — Version tag (safety checkpoint)
1. Create a git tag BEFORE any code changes:
   - git tag "PublicMenu-pre-publicmenu-260321-140331" -m "Pre-fix checkpoint for chain publicmenu-260321-140331"
   - git push origin "PublicMenu-pre-publicmenu-260321-140331"
   - This allows instant rollback: `git revert --no-commit HEAD..PublicMenu-pre-publicmenu-260321-140331`

## Phase 2 — Apply fixes
2. Read the comparison: pipeline/chain-state/publicmenu-260321-140331-comparison.md
3. Check if discussion report exists: pipeline/chain-state/publicmenu-260321-140331-discussion.md
   - If it exists AND has an "Updated Fix Plan" section → use THAT for disputed items
   - If it says "No disputes" or doesn't exist → use Comparator's "Final Fix Plan" as-is
   - Items marked "Unresolved (for Arman)" → SKIP these, do NOT apply
4. Read the code file: pages/PublicMenu/base/*.jsx
5. Apply ALL fixes from the fix plan, in priority order (P0 first)
   - Agreed items from Comparator: always apply
   - Discussion-resolved items: apply the winning solution
   - Unresolved disputes: SKIP (note in merge report)
6. After applying fixes:
   a. Update BUGS.md in pages/PublicMenu/ with fixed items
   b. Update README.md in pages/PublicMenu/ if needed
7. Git commit and push:
   - git add <specific files only> (NEVER git add . or git add -A)
   - git commit -m "fix(PublicMenu): N bugs fixed via consensus chain publicmenu-260321-140331"
   - git push

## Phase 3 — Merge report
8. Write merge report to: pipeline/chain-state/publicmenu-260321-140331-merge-report.md

FORMAT for merge report:
# Merge Report — PublicMenu
Chain: publicmenu-260321-140331

## Version Tag
- Pre-fix tag: PublicMenu-pre-publicmenu-260321-140331
- Rollback: `git revert --no-commit HEAD..PublicMenu-pre-publicmenu-260321-140331`

## Applied Fixes
1. [P0] Fix title — Source: agreed/discussion-resolved — DONE
2. [P1] Fix title — Source: comparator — DONE
...

## Skipped — Unresolved Disputes (for Arman)
- Dispute: [title] — CC says X, Codex says Y — NEEDS DECISION

## Skipped — Could Not Apply
- Reason...

## Git
- Pre-fix tag: <tag>
- Commit: <hash>
- Files changed: N

## Summary
- Applied: N fixes
- Skipped (unresolved): N disputes
- Skipped (other): N fixes
- Commit: <hash>

=== TASK CONTEXT ===
# UX Batch 4: Chips Terracotta (PM-062) + Table Confirmation Bottom Sheet (PM-064)

Reference: `ux-concepts/public-menu.md` v4.1 (section G), `STYLE_GUIDE.md` v3.2, `BUGS_MASTER.md`.

---

## Fix 1 — PM-062 (P3): Active category chip still indigo — SPECIFY EXACT LOCATION

### Problem

After 3 batches of terracotta fixes, the active category chip (chips «Все», «Блюдо дня», «Основные блюда» etc.) still renders with indigo/purple background.

**IMPORTANT (KB-077):** Previous two batches missed this fix because the location was underspecified. This time:
- **File:** `pages/PublicMenu/base/ModeTabs.jsx`
- **Prop name:** `activeColor`
- **Current value:** some indigo/purple value (e.g. `indigo-600`, `bg-indigo-500`, or similar)
- **Required value:** `#B5543A` (terracotta, per STYLE_GUIDE.md primary color)

Also check: if `CategoryChips` or a chips subcomponent ignores `activeColor` prop and hardcodes its own color class — fix the hardcoded value directly in that component too.

### Expected Behavior

Active chip → terracotta `#B5543A` background, white text. Inactive chips remain white/gray border. This matches all other primary interactive elements already fixed.

---

## Fix 2 — PM-064 (P2): Table Confirmation must be Bottom Sheet AFTER submit, not inline in drawer

### Problem

Currently there is a table code input field that appears **inline inside the CartView drawer** (visible BEFORE the guest taps «Отправить официанту»). This is wrong.

Additionally, Batch A+5 added `showTableConfirmSheet` and a "Drawer-based Bottom Sheet" — but quick-test TC-5 confirmed the wrong flow still appears. Either:
(a) the new Bottom Sheet is not triggering on submit, or
(b) the old inline field is still visible alongside the new Bottom Sheet, or
(c) the Bottom Sheet opens but doesn't work correctly.

Investigate and fix.

### Expected Behavior (from `public-menu.md` §G — spec unchanged)

**Trigger:** Guest taps «Отправить официанту» AND table is not yet verified.

**Flow:**
1. «Отправить официанту» tap → intercept → Bottom Sheet opens (~75–85dvh, NOT full-screen)
2. Bottom Sheet content:
   - Title: «Подтвердите стол»
   - Subtitle: «Чтобы отправить заказ официанту»
   - Benefit line (conditional):
     - With loyalty: «По онлайн-заказу вы получите бонусы / скидку»
     - Without loyalty: «Так официант быстрее найдёт ваш заказ»
   - [Code input field]
   - Primary CTA: «Подтвердить и отправить»
   - Secondary link: «Не тот стол? Изменить»
3. Guest enters code → table verified → order sent immediately
4. Table remembered for entire visit (no re-asking)

**Rules:**
- Just-in-time ONLY — do NOT ask for table code on menu open or drawer open — only on submit tap
- If table already known → skip Bottom Sheet, send directly
- The inline table code block INSIDE the drawer (shown before submit) must be REMOVED
- Bottom sheet: `rounded-t-3xl`, backdrop blur, drag handle at top
- Submit button «Отправить официанту» must be always enabled (terracotta, no disabled state when table unknown)

**Files affected:** `x.jsx` (main logic, submit intercept, Bottom Sheet), `CartView.jsx` (remove inline table input if present there).

---

## Implementation Notes

- Primary files: `x.jsx` and `CartView.jsx`. Also check `ModeTabs.jsx` for Fix 1.
- Read `BUGS_MASTER.md` — do NOT regress Fixed items (PM-031, PM-032, PM-041, PM-063)
- Read `STYLE_GUIDE.md` for exact terracotta color values
- For Fix 1: search for `activeColor` in ModeTabs.jsx and any chips sub-component. If prop is unused, fix the hardcoded class.
- For Fix 2: look for `showTableConfirmSheet`, `pendingSubmitRef`, and any inline table code input in CartView drawer. The goal: zero table UI visible before submit.
- After all changes: `git add pages/PublicMenu/base/x.jsx pages/PublicMenu/base/CartView.jsx pages/PublicMenu/base/ModeTabs.jsx && git commit -m "fix(PublicMenu): PM-062 chips terracotta + PM-064 table confirmation bottom sheet" && git push`
=== END ===


## Status
Running...
