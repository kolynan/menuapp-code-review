---
chain: publicmenu-260321-093745
chain_step: 4
chain_total: 4
chain_step_name: merge-with-tag
page: PublicMenu
budget: 6.00
runner: cc
type: chain-step
---
=== CHAIN STEP: Merge with Versioning (4/4) ===
Chain: publicmenu-260321-093745
Page: PublicMenu

You are the Merge step in a modular consensus pipeline.
Your job: create a safe version tag, then apply the fix plan to the actual code.

INSTRUCTIONS:

## Phase 1 — Version tag (safety checkpoint)
1. Create a git tag BEFORE any code changes:
   - git tag "PublicMenu-pre-publicmenu-260321-093745" -m "Pre-fix checkpoint for chain publicmenu-260321-093745"
   - git push origin "PublicMenu-pre-publicmenu-260321-093745"
   - This allows instant rollback: `git revert --no-commit HEAD..PublicMenu-pre-publicmenu-260321-093745`

## Phase 2 — Apply fixes
2. Read the comparison: pipeline/chain-state/publicmenu-260321-093745-comparison.md
3. Check if discussion report exists: pipeline/chain-state/publicmenu-260321-093745-discussion.md
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
   - git commit -m "fix(PublicMenu): N bugs fixed via consensus chain publicmenu-260321-093745"
   - git push

## Phase 3 — Merge report
8. Write merge report to: pipeline/chain-state/publicmenu-260321-093745-merge-report.md

FORMAT for merge report:
# Merge Report — PublicMenu
Chain: publicmenu-260321-093745

## Version Tag
- Pre-fix tag: PublicMenu-pre-publicmenu-260321-093745
- Rollback: `git revert --no-commit HEAD..PublicMenu-pre-publicmenu-260321-093745`

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
# UX Batch 2+3: Drawer Restructure + StickyCartBar + Visit States

Reference: `ux-concepts/public-menu.md` v4.1 (sections D, E), `STYLE_GUIDE.md` v3.2, `BUGS_MASTER.md`.

## Context

This task implements Phase 2 structural improvements for PublicMenu (x.jsx).
Two closely related areas: cart drawer layout and sticky bottom bar visibility logic.

---

## Part 1 — Drawer Restructure (Batch 2)

### Problem

Currently the cart drawer does not distinguish between sent orders and the current draft visually or structurally. The layout is the same regardless of visit state (before first send / after send with new draft / after send no draft).

### Expected Behavior

Implement 3 drawer layouts based on visit + draft state (see `public-menu.md` §E):

**Layout 1 — Before first send (V1+D1 / V2+D1):**
- Top: НОВЫЙ ЗАКАЗ section (draft items with stepper/remove, editable)
- Bottom sticky: draft total + primary CTA "Отправить официанту"
- [If table unknown — V2]: show table confirmation hint inside drawer before CTA

**Layout 2 — After first send + new draft (V4+D1):**
- Top: НОВЫЙ ЗАКАЗ (draft, editable, bright style, steppers visible)
- Middle: МОИ ЗАКАЗЫ (collapsible, sent orders read-only, calm style, status chips)
- Middle: СЧЁТ (collapsible, bill summary)
- Bottom sticky: draft total (line 1) + unpaid total secondary (line 2) + CTA "Отправить новый заказ"

**Layout 3 — After first send, no draft (V3+D0):**
- Top: МОИ ЗАКАЗЫ (expanded, read-only)
- Middle: СЧЁТ
- Bottom sticky: open tab total + CTA "Заказать ещё" + secondary "Открыть счёт"

### Visual separation — sent vs draft

| Zone | Style |
|------|-------|
| Sent orders | No stepper, no remove button, status chip, calm background, slightly less contrast text (but still readable) |
| Draft | Steppers visible, remove visible, section title brighter, CTA active |

**Anti-pattern:** Do NOT use opacity 50% or heavy blur on sent orders — must remain readable.

### CTA Logic per state (from `public-menu.md` §E CTA Logic table)

| State | Primary CTA | Secondary CTA |
|-------|-------------|---------------|
| V1+D0 | — | Вернуться в меню |
| V1+D1 | Отправить официанту | Продолжить выбор |
| V2+D1 | Отправить официанту (→ intercept table confirmation) | Продолжить выбор |
| V3+D0 | Заказать ещё | Открыть счёт |
| V4+D1 | Отправить новый заказ | Мои заказы |
| V5+D2 | Отправляем... (disabled) | — |
| V6+D3 | Повторить отправку | Продолжить выбор |
| V7+D0 | — | Вернуться в меню |

### Totals Logic

1. **Draft total** = sum(draftItems.price × qty + modifiers). Does NOT include sent. Does NOT subtract savings before submit.
2. **Sent unpaid total** = sum of Visit.orders where status != paid. Secondary line.
3. **Estimated savings** = loyalty preview, label "Ожидаемая выгода". Does NOT change draft total.
4. **Bill total** = Visit.total. "Только мои" / "Общий". Do NOT show before open tab.

---

## Part 2 — StickyCartBar + Visit States (Batch 3)

### Problem

StickyCartBar does not implement the 7-state visibility matrix — it either shows or doesn't based on cart count, without considering visit state. Text modes are not implemented (visit mode vs draft mode).

### Expected Behavior

Single bottom panel, 56px height, two text modes (from `public-menu.md` §D):

| Mode | Panel text |
|------|------------|
| Has draft | `2 блюда · Новый заказ · 3400₸` |
| No draft, has sent orders | `Мой заказ · 2 отправлено · Не оплачено 5600₸` |

**7-state visibility matrix:**

| Visit state | Draft state | StickyCartBar | Text |
|-------------|-------------|---------------|------|
| No visit | Empty | Hidden or ghost | — |
| No visit | Has items | Active | draft mode |
| Open, unpaid | Empty | Active (visit mode) | visit mode |
| Open, unpaid | Has items | Active (draft mode) | draft mode |
| Fully paid | Empty | Fade out 5s | — |
| Tab closed by waiter | Empty | Hidden (3s) | — |
| Tab closed by waiter | Has items | Hidden + confirm reset | — |

**Animations:**
- On `+`: subtle count bump animation in StickyCartBar + toast "Добавлено"
- On first item added: bar rises/activates with soft animation
- No complex "flying item" animations

---

## Part 3 — PM-S152-01: Complete Terracotta palette (open bug, P2)

### Problem

After Batch 1 deploy, terracotta was applied only to primary CTA buttons (drawer "Отправить официанту", confirmation "Вернуться в меню"). The following elements still use `bg-indigo-xxx`:
- Tab "В зале" (active state)
- Category pills/chips ("Все", "Блюдо дня", etc.)
- "+" buttons on dish cards

CSS variables `--color-primary` are empty (not defined). Verified via `getComputedStyle` in S152.

### Expected Behavior

All interactive elements that use primary color → terracotta `#B5543A` (consistent with STYLE_GUIDE.md v3.2 Batch 1 palette). No indigo remaining in UI.

---

## Implementation Notes

- Files to modify: `x.jsx` (main), possibly `CartView.jsx` (if drawer logic is there)
- Read `BUGS_MASTER.md` for current open PublicMenu bugs — do not regress any Fixed items
- Read `STYLE_GUIDE.md` for exact color values and component specs
- After all changes: `git add pages/PublicMenu/base/x.jsx pages/PublicMenu/base/CartView.jsx && git commit -m "feat: batch 2+3 drawer restructure + StickyCartBar visit states + terracotta complete" && git push`
=== END ===
