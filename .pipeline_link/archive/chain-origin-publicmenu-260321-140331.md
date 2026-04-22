---
page: PublicMenu
code_file: pages/PublicMenu/base/x.jsx
budget: 15
agent: cc+codex
chain_template: consensus-with-versioning
---

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
