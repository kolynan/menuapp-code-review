---
chain: publicmenu-260321-110752
chain_step: 1
chain_total: 4
chain_step_name: cc-writer
chain_group: writers
chain_group_size: 2
page: PublicMenu
budget: 12.00
runner: cc
type: chain-step
---
=== CHAIN STEP: CC Writer (1/4) ===
Chain: publicmenu-260321-110752
Page: PublicMenu

You are the CC Writer in a modular consensus pipeline.
Your job: independently analyze the code and find ALL bugs.

INSTRUCTIONS:
1. Read the code file for PublicMenu in pages/PublicMenu/base/*.jsx
2. Also read README.md and BUGS.md in the same folder for context
3. Do your OWN independent analysis — find ALL bugs and issues
4. Focus on: logic errors, missing error handling, i18n issues, UI/UX for mobile-first, React anti-patterns
5. For each finding: [P0/P1/P2/P3] Title - Description. FIX: description of code change needed.
6. Write your findings to: pipeline/chain-state/publicmenu-260321-110752-cc-findings.md
7. Do NOT apply any fixes yet — only document findings

FORMAT for findings file:
# CC Writer Findings — PublicMenu
Chain: publicmenu-260321-110752

## Findings
1. [P0] Title — Description. FIX: ...
2. [P1] Title — Description. FIX: ...
...

## Summary
Total: N findings (X P0, Y P1, Z P2, W P3)

=== TASK CONTEXT ===
# UX Batch A+5: Quick Fixes + Table Confirmation

Reference: `ux-concepts/public-menu.md` v4.1 (section G), `STYLE_GUIDE.md` v3.2, `BUGS_MASTER.md`.

---

## Fix 1 — PM-062 (P3): Active category chip still indigo

### Problem

After Batch 2+3 deploy, the active category chip «Все» still renders with indigo/purple background color. All other terracotta fixes were applied correctly (tabs, «+» buttons, prices). Only the active chip state was missed.

### Expected Behavior

Active category chip → terracotta `#B5543A` (same as other primary interactive elements per STYLE_GUIDE.md v3.2). Inactive chips remain white/gray border (unchanged).

---

## Fix 2 — PM-063 (P2): Drawer stepper shows «×» instead of «−»

### Problem

In the cart drawer, the draft item row shows «× 1 +» — the × button is a remove-all action, not a decrement. On the dish card (inline stepper), the fix was applied correctly (shows «− 1 +»). But CartView drawer still has the old «×» button.

Reproduced: quick-test S153, after adding a dish and opening the drawer.

### Expected Behavior

Draft item row in drawer → stepper «− 1 +»:
- «−» decrements qty (removes item when qty reaches 0, with confirmation or auto-remove)
- «1» shows current quantity
- «+» increments

The × remove-all button should be removed from the inline draft row. (A separate "remove" option can remain accessible via long-press or swipe, but not the primary control.)

---

## Fix 3 — Table Confirmation / Just-in-time table code (Batch 5)

### Problem

Currently, guests must enter the table code BEFORE they can send an order. If they don't know the code (no QR, code not visible), they're stuck. The UX spec calls for a "just-in-time" flow: guest adds dishes freely → taps «Отправить официанту» → if table is unknown → Bottom Sheet appears to confirm the table.

### Expected Behavior (from `public-menu.md` §G)

**Trigger:** Guest taps «Отправить официанту» AND table is not yet verified (V2 state).

**Flow:**
1. CTA tap → intercept → Bottom Sheet opens (~75–85dvh, NOT full-screen)
2. Bottom Sheet content:
   - Title: «Подтвердите стол»
   - Subtitle: «Чтобы отправить заказ официанту»
   - Benefit line (conditional):
     - With loyalty: «По онлайн-заказу вы получите бонусы / скидку»
     - Without loyalty: «Так официант быстрее найдёт ваш заказ»
   - [Code input fields] OR [Table picker]
   - Primary CTA: «Подтвердить и отправить»
   - Secondary link: «Не тот стол? Изменить»
3. Guest enters code → table verified → order sent immediately
4. Table remembered for the entire visit (no re-asking)

**Rules:**
- Just-in-time only — do NOT ask for table code on menu open, only on submit
- If table is already known (V1 state) → skip Bottom Sheet, send directly
- Bottom sheet: `rounded-t-3xl`, backdrop blur, drag handle
- Task first, benefit second (code input prominent, benefit below title)

**CTA state V2+D1:** «Отправить официанту» → intercept table confirmation (replaces current behavior of showing disabled button with hint text when table unknown).

---

## Implementation Notes

- Primary file: `x.jsx`. Also check `CartView.jsx` for Fix 2.
- Read `BUGS_MASTER.md` — do not regress any Fixed items (especially PM-031, PM-032, PM-041)
- Read `STYLE_GUIDE.md` for exact terracotta values
- Table confirmation Bottom Sheet: reuse existing Bottom Sheet pattern in the codebase if available
- After all changes: `git add pages/PublicMenu/base/x.jsx pages/PublicMenu/base/CartView.jsx && git commit -m "feat: batch A+5 chip terracotta + drawer stepper fix + table confirmation just-in-time" && git push`
=== END ===
