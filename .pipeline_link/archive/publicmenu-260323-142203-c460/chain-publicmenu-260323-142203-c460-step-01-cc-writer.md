---
chain: publicmenu-260323-142203-c460
chain_step: 1
chain_total: 4
chain_step_name: cc-writer
chain_group: writers
chain_group_size: 2
page: PublicMenu
budget: 15.00
runner: cc
type: chain-step
---
=== CHAIN STEP: CC Writer (1/4) ===
Chain: publicmenu-260323-142203-c460
Page: PublicMenu

You are the CC Writer in a modular consensus pipeline.
Your job: independently analyze the code and produce findings.

INSTRUCTIONS:
1. Read the file(s) specified in TASK CONTEXT below for PublicMenu
2. Also read README.md and BUGS.md in the same folder for context (read-only, do NOT modify)
3. Do your OWN independent analysis
4. Focus on: logic errors, missing error handling, i18n issues, UI/UX for mobile-first, React anti-patterns
5. For each finding: [P0/P1/P2/P3] Title - Description. FIX: description of code change needed.
6. Write your findings to: pipeline/chain-state/publicmenu-260323-142203-c460-cc-findings.md
7. Do NOT apply any fixes yet — only document findings

⛔ SCOPE RESTRICTION (MANDATORY):
If the TASK CONTEXT below contains a numbered Fix list (Fix 1, Fix 2, etc.):
- Do NOT report ANY issues outside the numbered Fix list.
- If you see other bugs — IGNORE them completely.
- Your output must contain ONLY findings for Fix 1, Fix 2, etc.
- Extra findings outside the Fix list = task FAILURE.
- BAD example: Task says "Fix 1: button position" → you report touch targets, aria-labels, i18n issues. This is WRONG.
- GOOD example: Task says "Fix 1: button position" → you report ONLY your analysis of Fix 1 (button position). Nothing else.

If there is NO numbered Fix list → find ALL bugs.

FORMAT for findings file:
# CC Writer Findings — PublicMenu
Chain: publicmenu-260323-142203-c460

## Findings
1. [P0/P1/P2/P3] Title — Description. FIX: ...
2. ...

## Summary
Total: N findings (X P0, Y P1, Z P2, W P3)

⛔ Prompt Clarity (MANDATORY — findings without this section are INCOMPLETE and will be REJECTED):
Rate the task description quality (1-5). For any score below 4, explain what was unclear:
- Overall clarity: [1-5]
- Ambiguous Fix descriptions (list Fix # and what was unclear): ...
- Missing context (what info would have helped): ...
- Scope questions (anything you weren't sure if it's in scope): ...
YOU MUST FILL IN ALL FIELDS ABOVE. Do NOT skip this section.

=== TASK CONTEXT ===
# Bugfix Batch 6: PublicMenu — regression + toast + dish detail + UI polish

Reference: `BUGS_MASTER.md`, `menuapp-code-review/pages/PublicMenu/`.
UX Lock: `ux-concepts/UX_LOCKED_PublicMenu.md`.
**Production page** — `https://menu-app-mvp-49a4f5b2.base44.app/x?partner=69540a85f2492cff3e46a283&mode=hall&lang=RU`

TARGET FILES (modify):
- `pages/PublicMenu/x.jsx`
- `pages/PublicMenu/MenuView.jsx`

CONTEXT FILES (read-only, do NOT modify):
- `pages/PublicMenu/CartView.jsx`
- `pages/PublicMenu/CheckoutView.jsx`

---

## Fix 1 — PM-107 (P1) [MUST-FIX]: Programmatic BS close collapses entire sheet stack (regression КС-4)

### Сейчас
КС-4 (commit 4da1dc4) added stack-based history: each sheet open calls `pushOverlay(name)` → `history.pushState(...)`. Each sheet programmatic close was also wired to call `history.back()`.

Regression on Android: open order list → open table code BS on top → swipe down/tap × to close table code BS → **BOTH sheets close**, only menu remains. Expected: only table code BS closes, order list stays.

### Должно быть
- **Hardware Back button** → `history.back()` → popstate fires → closes topmost sheet only. ✅ Already works.
- **Programmatic close** (swipe, × button, overlay tap) → calls `setState(false)` + removes its own history entry WITHOUT triggering popstate for other sheets.

Pattern: use a `isProgrammaticClose` ref flag. On programmatic close: set flag=true, call `history.back()`, in popstate handler: if flag=true, skip listener logic, reset flag=false.

### НЕ должно быть
- Do NOT remove pushOverlay/popOverlay stack logic.
- Do NOT break hardware back (PM-105, commit 4da1dc4 — already works, keep it).
- Do NOT cascade history.back() to close multiple sheets.

### Файл и локация
`pages/PublicMenu/x.jsx`
- Search for: `pushOverlay`, `popOverlay`, `overlayStackRef` — КС-4 additions (commit 4da1dc4)
- Search for: `popstate` — the listener
- Search for: `setShowTableCodeSheet` — table code close handler
- Add `isProgrammaticCloseRef = useRef(false)` flag to gate the popstate listener

### Уже пробовали
КС-4 chain publicmenu-260323-124313-bcbe fixed hardware back ✅. Programmatic close was not handled — that is this regression.

### Проверка
1. Order list open → table code BS open → swipe/× table code → only table code closes, order list stays. ✅
2. Order list open → hardware Back → only order list closes. ✅
3. No frozen state, no infinite loops.

---

## Fix 2 — PM-103 (P2) [MUST-FIX]: Toast shows as thin line on Android (КС-5 fix did not work)

### Сейчас
Toast appears as a thin horizontal line when adding a dish. КС-5 (commit c152dc7) removed a duplicate sonner Toaster — did NOT fix the issue on Android.

### Должно быть
Proper toast: readable text "Добавлено в корзину", visible at 375px, auto-dismisses ~2s, fixed position (top or bottom center), z-index above all other elements.

### НЕ должно быть
- Do NOT use `alert()`. Do NOT change toast trigger logic.
- Do NOT add a new toast library — fix the existing implementation.

### Файл и локация
`pages/PublicMenu/MenuView.jsx` and/or `pages/PublicMenu/x.jsx`
- Search for `toastVisible` in MenuView.jsx — custom boolean state toast added in КС-3 (commit d633716)
- The toast div likely has wrong styling: check for `h-0`, `overflow-hidden`, missing `z-index`, missing `fixed` positioning
- Ensure toast div has: `fixed`, `z-[200]`, explicit `padding`, readable background (dark bg, white text)
- Search for `sonner` or `<Toaster` in x.jsx to confirm no duplicate remains

### Уже пробовали
КС-5 removed duplicate sonner — did not fix. Root cause is in custom `toastVisible` state-based toast CSS in MenuView.jsx.

### Проверка
1. Tap "+" on any dish at 375px → toast shows with readable text (not a line). ✅
2. Toast auto-dismisses in ~2s. ✅

---

## Fix 3 — PM-102 (P2) [MUST-FIX]: Dish detail dialog — "Add to cart" button has no visible text

### Сейчас
КС-5 created a dish detail dialog (opens on card tap). Dialog shows name/description/price ✅. But the "Add to cart" button renders as an empty colored bar — no text inside.

### Должно быть
Button shows text: "Добавить в корзину" (fallback for i18n: `t('menu.add_to_cart', 'Добавить в корзину')`). Button: `partner.primary_color` background, white text, min 44px height.

### НЕ должно быть
- Do NOT remove or replace the dialog — only fix the button text.
- Do NOT change dish data display (name/price work).

### Файл и локация
`pages/PublicMenu/x.jsx`
- Search for `DishDetail` or `dishDetailOpen` or `selectedDish` — the dialog added in КС-5 (commit c152dc7)
- Find the `<Button` or `<button` inside — add text: `{t('menu.add_to_cart', 'Добавить в корзину')}`
- If text exists but is invisible: check text color (add `text-white` class)

### Проверка
1. Tap dish card → dialog opens → button shows "Добавить в корзину". ✅
2. Tap button → dish added to cart. ✅

---

## Fix 4 — PM-108 (P2) [MUST-FIX]: "+" button clipped at right edge in list-mode

### Сейчас
In list-mode, the circular "+" FAB button is cut off at the right edge of the dish card (only half-circle visible). The card `overflow-hidden` clips it.

### Должно быть
"+" button fully visible and tappable — positioned inside card bounds (e.g. `right-2 bottom-2` with padding, not hanging outside the card).

### НЕ должно быть
- Do NOT move "+" to center. Do NOT remove `overflow-hidden` if it clips the image — use targeted fix.

### Файл и локация
`pages/PublicMenu/MenuView.jsx`
- Search for `renderListCard` — list-mode card renderer
- Find "+" button position: likely `absolute right-0 bottom-0` or similar — change to `right-2 bottom-2` (inside card bounds)
- Or: change card container from `overflow-hidden` to `overflow-visible` if image is not affected

### Проверка
1. List mode on 375px → all "+" buttons fully visible as complete circles. ✅

---

## Fix 5 — PM-096 (P2) [MUST-FIX]: Tile-mode stepper buttons below 44px touch target

### Сейчас
Tile-mode stepper − / + buttons have `w-8 h-8` (32px) — below 44px minimum.

### Должно быть
`w-11 h-11` (44px) or `min-w-[44px] min-h-[44px]`.

### НЕ должно быть
Do NOT change list-mode stepper (fixed in PM-092, commit d633716).

### Файл и локация
`pages/PublicMenu/MenuView.jsx`
- Search for `renderTileCard` → find stepper buttons with `w-8 h-8` → change to `w-11 h-11`

### Проверка
1. Tile mode → tap − / + → easily tappable (44px). ✅

---

## Fix 6 — PM-discount-check (P2) [MUST-FIX]: Discount badge shows when discount_enabled is false

### Сейчас
Discount badge (-X%) shown when `discount_percent > 0`, ignoring `partner.discount_enabled`.

### Должно быть
Badge shown ONLY when `partner.discount_enabled === true && partner.discount_percent > 0`.

### НЕ должно быть
Do NOT change discount calculation. Do NOT change badge styling.

### Файл и локация
`pages/PublicMenu/MenuView.jsx`
- Search for `discount_percent` — in both `renderListCard` and `renderTileCard`
- Add guard: `partner.discount_enabled && partner.discount_percent > 0` before rendering badge + strikethrough price

### Проверка
1. `discount_enabled: false`, `discount_percent: 5` → no badge. ✅
2. `discount_enabled: true`, `discount_percent: 5` → badge "-5%". ✅

---

## Fix 7 — #84b (P2) [MUST-FIX]: Discount badge uses hardcoded color instead of partner.discount_color

### Сейчас
Discount badge uses hardcoded color (`bg-red-600` or `#C92A2A`). `partner.discount_color` field is ignored.

### Должно быть
Badge background: `partner.discount_color || '#C92A2A'` (fallback to default red).

### НЕ должно быть
Do NOT change badge shape/position. Badge text color stays white.

### Файл и локация
`pages/PublicMenu/MenuView.jsx`
- Search for `bg-red` or `#C92A2A` near `discount_percent` rendering
- Replace with inline style: `style={{ backgroundColor: partner.discount_color || '#C92A2A' }}`
- Apply in both `renderListCard` and `renderTileCard`

### Проверка
1. `discount_color: '#4CAF50'` → badge has green background. ✅
2. `discount_color: null` → badge has `#C92A2A`. ✅

---

## Fix 8 — PM-104 (P3) [NICE-TO-HAVE]: Chevron and gray line misaligned in cart drawer header

### Сейчас
Chevron (˅, right-aligned) and gray separator line in cart drawer header are at slightly different vertical levels — looks misaligned.

### Должно быть
Chevron and separator visually aligned or clearly separated.

### НЕ должно быть
Do NOT remove chevron or separator. Do NOT change drawer behavior.

### Файл и локация
`pages/PublicMenu/x.jsx`
- Search for `ChevronDown` near cart drawer/sheet header
- Adjust `margin-top` or `padding` to align
- NOTE: Do NOT look in CartView.jsx — it is NOT in TARGET FILES

### Проверка
1. Open cart drawer → header area looks visually clean. ✅

---

## ⛔ SCOPE LOCK — менять ТОЛЬКО то, что указано выше
- Modify ONLY: `pages/PublicMenu/x.jsx` and `pages/PublicMenu/MenuView.jsx`
- Do NOT touch: CartView.jsx, CheckoutView.jsx, useTableSession.jsx, ModeTabs.jsx, StickyCartBar.jsx
- Do NOT fix any bugs outside the 8 Fix sections above.
- Extra findings = task FAILURE.
- UX Lock: `ux-concepts/UX_LOCKED_PublicMenu.md` — do NOT change locked decisions.

## Implementation Notes
- Priority: Fix 1 (P1 regression) → Fixes 2–7 (P2) → Fix 8 (P3, NICE-TO-HAVE)
- НЕ ломать: PM-105 back button (commit 4da1dc4), PM-106 tile price (commit c152dc7), PM-064 table code BS
- git add pages/PublicMenu/x.jsx pages/PublicMenu/MenuView.jsx && git commit -m "fix(PublicMenu): batch 6 — PM-107 regression, toast, dish detail, list+ clip, discount" && git push

## MOBILE-FIRST CHECK (MANDATORY before commit)
This is a mobile-first restaurant app. Verify at 375px width:
- [ ] PM-107: swipe/× on table code BS → only that sheet closes, order list stays
- [ ] PM-103: toast fully visible with readable text (not a thin line)
- [ ] PM-102: dish detail button shows "Добавить в корзину"
- [ ] PM-108: "+" button in list mode fully visible (no clipping)
- [ ] PM-096: tile stepper >= 44px tap target
- [ ] No regression: hardware Back still closes topmost sheet only (PM-105)
=== END ===
