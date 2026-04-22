---
page: PublicMenu
code_file: pages/PublicMenu/base/x.jsx
budget: 12
agent: cc+codex
chain_template: consensus-with-versioning
---

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
