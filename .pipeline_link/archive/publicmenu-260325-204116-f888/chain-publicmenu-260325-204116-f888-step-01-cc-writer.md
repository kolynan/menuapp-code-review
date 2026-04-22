---
chain: publicmenu-260325-204116-f888
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
Chain: publicmenu-260325-204116-f888
Page: PublicMenu

You are the CC Writer in a modular consensus pipeline.
Your job: independently analyze the code and produce findings.

INSTRUCTIONS:
1. Read the file(s) specified in TASK CONTEXT below for PublicMenu
2. Also read README.md and BUGS.md in the same folder for context (read-only, do NOT modify)
3. Do your OWN independent analysis
4. Focus on: logic errors, missing error handling, i18n issues, UI/UX for mobile-first, React anti-patterns
5. For each finding: [P0/P1/P2/P3] Title - Description. FIX: description of code change needed.
6. Write your findings to: pipeline/chain-state/publicmenu-260325-204116-f888-cc-findings.md
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
Chain: publicmenu-260325-204116-f888

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
# Batch 12: Guest Name Save + Empty State CTA + Star Size

Reference: `BUGS_MASTER.md` (PM-139, PM-140, PM-141), `pages/PublicMenu/CartView.jsx`, `pages/PublicMenu/x.jsx`.

Production page. Mobile-first restaurant app (target device: Android phone, 375px width).

---

## TARGET FILES (modify)
- `pages/PublicMenu/CartView.jsx`
- `pages/PublicMenu/x.jsx`

## CONTEXT FILES (read-only)
- `BUGS_MASTER.md`

---

## Fix 1 — PM-139 (P1) [MUST-FIX]: Guest name ✓ button does nothing + name not persisted

### Сейчас (current behaviour)
The user opens the cart drawer, sees a name input field ("Вы: [name]") in the table card at the top, types a name, taps the ✓ button — nothing happens. No toast, no visual feedback. After closing and reopening the drawer, the name is gone.

Root cause to investigate: `handleUpdateGuestName` in `pages/PublicMenu/x.jsx` (~line 3142) has an early return: `if (!currentGuest?.id || !guestNameInput.trim()) return;`. If `currentGuest` is null or has no `id`, the function exits silently. The ✓ button in CartView.jsx (~line 458) calls this function but appears unresponsive.

### Должно быть (expected)
1. When user types a name and taps ✓:
   - If `currentGuest?.id` exists → call `base44.entities.SessionGuest.update()` (existing logic)
   - In ALL cases → save name to `localStorage` under key `"menuapp_guest_name"` so it persists across sessions
   - Show `toast.success(...)` confirmation
   - Switch field to read-only display: show name as text + pencil icon for edit
2. On next page load → pre-fill `guestNameInput` from `localStorage.getItem("menuapp_guest_name")` if available

### НЕ должно быть
- Silent failure when ✓ is tapped (no feedback = broken UX)
- Name disappearing after page reload
- Removing the ✕ (cancel) button at ~line 459 — it must stay
- NOTE: The ✕ at ~line 459 is a name-cancel button, NOT a drawer close — do NOT remove it

### Файл и локация
- Logic: `pages/PublicMenu/x.jsx`, function `handleUpdateGuestName` ~line 3142–3160
- UI: `pages/PublicMenu/CartView.jsx`, name input block ~line 444–465
  - ✓ button: `<button onClick={handleUpdateGuestName} disabled={!guestNameInput.trim()} ...>`
- State: `guestNameInput` (line 1356), `isEditingName` (line 1357) in `x.jsx`

### Проверка
1. Open cart drawer → type a name → tap ✓ → toast appears, field switches to read-only text
2. Close and reopen the app → name field pre-filled from localStorage

---

## Fix 2 — PM-140 (P2) [MUST-FIX]: Empty white area after order submit — no CTA

### Сейчас (current behaviour)
After user submits an order (cart is cleared), the cart drawer shows "Ваши заказы (1)" section with order items and star ratings. Below that section: large empty white area (half a screen of blank space). No action available — user does not know what to do next.

Root cause: SECTION 2 ("Новый заказ", ~line 779) is wrapped in `{cart.length > 0 && (...)}`. After submit, `cart.length === 0`, so Section 2 and the sticky submit button disappear, leaving only the orders section and empty space.

### Должно быть
When `cart.length === 0` AND `myOrders.length > 0` (after submit): show a simple CTA block below the orders section:
```
┌─────────────────────────────────────┐
│  [+ Добавить к заказу]              │  ← calls onClose() to return to menu
└─────────────────────────────────────┘
```
- Button text: use i18n key `'cart.add_more'` with fallback `'Добавить к заказу'`
- Style: outlined button (border, transparent bg) with primary color, full width
- Placement: below `{/* SECTION 3: YOUR ORDERS */}` block (~line 663), inside a `<div className="mt-4">` wrapper
- `onClose` prop already exists in CartView.jsx (~line 476) — use it

### НЕ должно быть
- Adding this CTA when cart is NOT empty (only show when `cart.length === 0 && myOrders.length > 0`)
- Removing or changing the existing sticky submit button logic (it stays for when cart.length > 0)
- Changing "Ваши заказы" section layout or collapse behaviour

### Файл и локация
`pages/PublicMenu/CartView.jsx`, after SECTION 3 (~line 760–778), before SECTION 2 (~line 779)

### Проверка
1. Add items → submit order → cart clears → see "Добавить к заказу" button below orders
2. Tap button → drawer closes → user is back in menu

---

## Fix 3 — PM-141 (P2) [MUST-FIX]: Star rating touch targets too small on mobile

### Сейчас (current behaviour)
Star rating in "Ваши заказы" section uses `<Rating size="sm" />` (~line 723–741 in CartView.jsx). On mobile (375px), the stars are too small to tap accurately — touch target < 44px. Users miss the correct star.

### Должно быть
Increase star size to meet 44px touch target minimum. Options (pick best for the Rating component):
- Change `size="sm"` → `size="md"` (if Rating component supports it)
- OR wrap the `<Rating ...>` in `<div className="py-2">` to increase tap area vertically
- The stars should be visually larger and easier to tap on mobile

### НЕ должно быть
- Changing star layout in MenuView.jsx (tile/list mode stars) — only CartView order ratings
- Removing star ratings entirely

### Файл и локация
`pages/PublicMenu/CartView.jsx`, Rating component usage in orders section ~line 720–742:
```jsx
<Rating
  value={draftRating}
  onChange={(val) => { ... }}
  size="sm"          ← change this
  readonly={...}
/>
```

### Проверка
1. Submit an order → open cart → tap a star on the order item → correct star selected on first tap
2. Stars visually larger than before

---

## FROZEN UX (DO NOT CHANGE) — tested on Android S179

These elements are confirmed working after deploy. Do NOT modify:

- **Help drawer one-tap cards** — categories shown as cards, "Другое" textarea hidden until tapped, autoFocus on "Другое", sticky submit button (PM-134 ✅)
- **Help drawer state reset** — no green checkmark shown on open, `helpQuickSent` resets on `closeHelpDrawer` (PM-135 ✅)
- **Bell button (🔔) behaviour** — visible in menu; if no tableCode → redirects to table code BS; if tableCode set → opens help drawer (PM-133 ✅)
- **Table code BS** — opens correctly when no code; DrawerContent does NOT have `className="relative"` (PM-128 ✅). CRITICAL: do NOT add `relative` to DrawerContent anywhere — it breaks vaul drawer positioning.
- **Android Back button** — closes open drawers instead of exiting browser (PM-126 ✅)
- **Cart submit button** — sticky at bottom, shows loyalty motivation text, correct disabled states (PM-087 ✅)

---

## ⛔ SCOPE LOCK — modify ONLY what is described in Fix 1, 2, 3 above
- Do NOT refactor unrelated components, state, or logic
- Do NOT change routing, auth, or data model
- Do NOT add `relative` to any DrawerContent (breaks vaul)
- If you see another bug not listed here — skip it, do not fix

---

## Implementation Notes
- TARGET files: `pages/PublicMenu/CartView.jsx`, `pages/PublicMenu/x.jsx`
- git add these exact files only (no `git add .`)
- Commit message format: `Fix PM-139/140/141: name save + empty state CTA + star size`

---

## MOBILE-FIRST CHECK (MANDATORY before commit)
This is a mobile-first restaurant app. Verify at 375px width:
- [ ] ✓ button tap target >= 44x44px (already `min-w-[44px] min-h-[44px]` — preserve this)
- [ ] "Добавить к заказу" button full width, adequate height (min 44px)
- [ ] Star touch targets >= 44px after size increase
- [ ] No excessive whitespace on small screens after Fix 2
- [ ] Name input and ✓/✕ buttons remain properly aligned on 375px

---

## Regression Check (MANDATORY after implementation)
Verify these existing features still work after changes:
- [ ] Submitting a new order when cart has items (Section 2 logic unchanged)
- [ ] Table code BS opens when tapping submit without table code
- [ ] Help drawer opens from bell button (PM-133/134/135 flow intact)
- [ ] Android Back closes drawers (PM-126 intact)
- [ ] Name field shows edit mode when tapped (isEditingName toggle works)

---

## E3: FROZEN UX grep verification (run before commit)
```bash
grep -n "helpQuickSent" pages/PublicMenu/x.jsx          # must exist (PM-135)
grep -n "relative" pages/PublicMenu/x.jsx | grep "DrawerContent"  # must return 0 results
grep -n "isHallMode\|hallMode" pages/PublicMenu/x.jsx   # bell condition must use isHallMode (PM-129)
```
=== END ===
