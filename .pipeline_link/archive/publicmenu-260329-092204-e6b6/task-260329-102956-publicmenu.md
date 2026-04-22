---
task_id: task-260329-102956-publicmenu
status: running
started: 2026-03-29T10:29:57+05:00
type: chain-step
page: PublicMenu
work_dir: C:/Dev/menuapp-code-review
budget_usd: 10.00
fallback_model: sonnet
version: 5.14
launcher: python-popen
---

# Task: task-260329-102956-publicmenu

## Config
- Budget: $10.00
- Mode: task-watcher.py launches Claude Code directly via Popen
- Fallback model: sonnet

## Prompt
---
chain: publicmenu-260329-092204-e6b6
chain_step: 4
chain_total: 4
chain_step_name: merge
page: PublicMenu
budget: 10.00
runner: cc
type: chain-step
---
=== CHAIN STEP: Merge (4/4) ===
Chain: publicmenu-260329-092204-e6b6
Page: PublicMenu

You are the Merge step in a modular consensus pipeline.
Your job: apply the fix plan to the actual code.

INSTRUCTIONS:
1. Read the comparison: pipeline/chain-state/publicmenu-260329-092204-e6b6-comparison.md
2. Check if discussion report exists: pipeline/chain-state/publicmenu-260329-092204-e6b6-discussion.md
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
   - git commit -m "fix(PublicMenu): N bugs fixed via consensus chain publicmenu-260329-092204-e6b6"
   - git push
7. Write merge report to: pipeline/chain-state/publicmenu-260329-092204-e6b6-merge-report.md

FORMAT for merge report:
# Merge Report — PublicMenu
Chain: publicmenu-260329-092204-e6b6

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
# CartView UX Batch 3: 11 fixes from real Android test (S190)

Reference: `ux-concepts/cart-view.md` v4.2, `BUGS_MASTER.md`, `DECISIONS_INDEX.md` §2.
Production page. Mobile-first restaurant app.

TARGET FILES (modify):
- `pages/PublicMenu/CartView.jsx` (1148 lines) — Fixes 1-8, 10
- `pages/PublicMenu/x.jsx` (4020 lines) — Fix 9 only (StickyCartBar bell icon)

CONTEXT FILES (read-only):
- `pages/PublicMenu/MenuView.jsx` — for understanding component structure
- `pages/PublicMenu/ModeTabs.jsx` — do NOT modify

---

## Fix 1 — CV-28 (P1) [MUST-FIX]: Flat dish list inside status buckets (Variant B — group by name)

### Currently
Each status bucket (e.g. "Принят", "Готовится") shows per-order rows with timestamps and chevrons:
```
▾ 14:47 (2 блюда)  70.36 ₸
  New York Steak    57.44 ₸
  Салат Цезарь      12.92 ₸
▾ 14:46 (1 блюдо)  44.52 ₸
  New York Steak    57.44 ₸
```
User sees timestamps and collapse/expand arrows that add clutter.

### Expected
Inside each bucket, show a FLAT list of dishes grouped by dish name:
```
New York Steak sandwich ×2    114.88 ₸
Салат Цезарь                   12.92 ₸
```
- Same-name dishes from different orders within the SAME bucket → combine into one row: `Name ×qty  total_price`.
- qty=1 → do NOT show `×1` (CV-23 rule).
- No per-order timestamps, no per-order chevron arrows.
- The BUCKET HEADER collapses/expands the entire bucket (not individual orders).
Ref: cart-view.md CV-28 + CV-23.

### Must NOT be
- No per-order `▾ 14:47 (2 блюда)` rows.
- No chevron arrows on individual dishes.
- No separate listing of same-name dishes that belong to different orders within one bucket.

### File and location
`CartView.jsx` ~lines 383-560 (status bucket rendering). Search for `statusBuckets` and the `.map()` that renders individual orders inside each bucket. Currently each `bucket` maps over `orders`, then maps over `order.items`. Restructure to: collect ALL items from ALL orders in the bucket → group by dish name → render flat list.

### Verification
Open CartView drawer → see bucket "Принят" with 2 orders containing "New York Steak" → should show ONE row: `New York Steak sandwich ×2  114.88 ₸`.

---

## Fix 2 — CV-29 (P2) [MUST-FIX]: Remove separator lines between dish rows inside buckets

### Currently
Horizontal `border-b` lines between each dish row inside a bucket section.

### Expected
No horizontal separator lines between dish rows. Clean flat list. The bucket header + background already provides visual grouping.

### Must NOT be
No `<hr>`, no `border-b`, no `border-t` between individual dish rows INSIDE bucket sections.

### File and location
`CartView.jsx` ~line 528 (`border-b pb-2 last:border-0`) and ~line 978 (`py-2 border-b last:border-0`). Remove `border-b` from dish row containers inside status buckets.

### Verification
Open CartView drawer → dish rows inside each bucket have no horizontal lines between them.

---

## Fix 3 — CV-30 (P2) [MUST-FIX]: Drawer header "N заказа · X ₸" instead of "Заказов: X ₸"

### Currently
Line 667: `{tr('cart.orders_sum', 'Заказов')}: {formatPrice(ordersSum)}`
Shows: `Заказов: 114.88 ₸`

### Expected
Show order COUNT + sum: `2 заказа · 114.88 ₸`
Format: `{orderCount} заказа · {formatPrice(ordersSum)}`
Use `todayMyOrders.length` for count. Russian plural: 1 заказ / 2-4 заказа / 5+ заказов.

### Must NOT be
No "Заказов:" prefix without a count number.

### File and location
`CartView.jsx` ~line 664-668. Replace the `ordersSum > 0` block with new format.
NOTE: Add a simple plural helper inline or use existing `tr()` with interpolation. If `tr()` doesn't support plurals, use inline ternary: `count === 1 ? 'заказ' : (count >= 2 && count <= 4) ? 'заказа' : 'заказов'`.

### Verification
After sending 2 orders → drawer header shows `2 заказа · 114.88 ₸`.

---

## Fix 4 — CV-31 (P2) [MUST-FIX]: Table + guest on one line

### Currently
Table and guest are on separate lines in the header:
```
Стол 11
Вы: Гость 1 ›
```

### Expected
One line: `Стол 11 · Гость 1 ›`
Combine `tableLabel` and guest display into a single line with `·` separator.

### Must NOT be
No two separate lines for table and guest in the header.

### File and location
`CartView.jsx` ~lines 634-660. Currently there's `<div className="text-sm font-medium text-slate-700">{tableLabel}</div>` on one line and a separate flex block for guest. Combine into one flex row.

### Verification
Open CartView drawer → header shows `Стол 11 · Гость 1 ›` on one line.

---

## Fix 5 — CV-32 (P2) [MUST-FIX]: Auto-collapse "Подано" (served) when cart is non-empty (D1)

### Currently
~line 92-98: `expandedStatuses` initial state has `served: false` (collapsed by default). But after user expands it, it stays expanded even when adding items to cart.

### Expected
When cart is non-empty (D1 state: `cart.length > 0`), automatically collapse the "Подано" bucket so that "Новый заказ" section is visible without scrolling. Use a `useEffect`:
```javascript
useEffect(() => {
  if (cart.length > 0) {
    setExpandedStatuses(prev => ({ ...prev, served: false }));
  }
}, [cart.length > 0]);
```

### Must NOT be
Do NOT collapse Принят/Готовится/Готов — only "Подано" (served).
Do NOT override user's manual expand of other buckets.

### File and location
`CartView.jsx` ~line 92-98 (expandedStatuses state) + add useEffect after it.

### Verification
Add item to cart → "Подано" bucket auto-collapses → "Новый заказ" visible without scrolling.

---

## Fix 6 — CV-33 (P2) [MUST-FIX]: Remove "Для кого заказ" (split-order) section entirely

### Currently
Lines 1010-1075: Section with radio buttons for "Для кого заказ" (split: "Мне" / "Для всех" / "Выбрать гостей"). State: `splitType`, `splitExpanded`, `setSplitExpanded`.

### Expected
Remove the entire section (UI + state). Each guest orders for themselves — no split-order concept needed in current model.
- Remove `splitType` from props or set it to always 'single' in parent.
- Remove `splitExpanded` state (~line 90).
- Remove the entire UI block ~lines 1010-1075.
- Remove `splitSummary` computation (~line 470).

### Must NOT be
No radio buttons, no "Для кого заказ" header, no "Мне / Для всех / Выбрать гостей" options.

### File and location
`CartView.jsx`:
- State: ~line 90 (`splitExpanded`)
- Summary: ~line 470 (`splitSummary`)
- UI: ~lines 1010-1075 (the entire split-order block)
Search for: `splitExpanded`, `splitType`, `cart.split_title`, `cart.split_disabled_hint`.

### Verification
Open CartView with items in cart → no "Для кого заказ" section visible.

---

## Fix 7 — CV-34 (P2) [MUST-FIX]: Hide "X ₸ × 1" when qty=1 in cart items

### Currently
Line 982: `<div className="text-xs text-slate-500">{formatPrice(item.price)} × {item.quantity}</div>`
Always shows price × quantity, even when qty=1: `32.01 ₸ × 1`.

### Expected
Only show `price × qty` when qty ≥ 2. When qty=1, hide this line entirely (the total already shows the price).

### Must NOT be
No `32.01 ₸ × 1` visible when quantity is 1.

### File and location
`CartView.jsx` ~line 982. Wrap with: `{item.quantity > 1 && (<div ...>{formatPrice(item.price)} × {item.quantity}</div>)}`

### Verification
Add 1 item → no "price × 1" shown. Add 2 of same → shows "32.01 ₸ × 2".

---

## Fix 8 — CV-35 (P2) [NICE-TO-HAVE]: Reduce padding in "Новый заказ" section

### Currently
~line 968: `<CardContent className="p-4">` — 16px padding on all sides. With few items, creates excessive whitespace.

### Expected
Reduce to `p-3` (12px) or `px-3 py-2` for a tighter layout.

### Must NOT be
No excessive white space between last cart item and the footer button.

### File and location
`CartView.jsx` ~line 968 (`<CardContent className="p-4">`). Also check ~line 967 (`<Card className="mb-4">`) — reduce `mb-4` to `mb-2` if needed.

### Verification
Open CartView with 1-2 items → "Новый заказ" section looks compact, no wasted space.

---

## Fix 9 — PM-156 (P2) [MUST-FIX]: Remove duplicate bell icon from StickyCartBar area

### Currently
After Chrome kill (кх), two bell icons appear:
1. CartView header bell (~line 622-630 in CartView.jsx) — amber 🔔, correct placement.
2. Floating bell (~line 3952-3961 in x.jsx) — fixed bottom-left, `z-40`, shows when `view === "menu" && isHallMode && drawerMode !== 'cart'`.

When CartView drawer is open (`drawerMode === 'cart'`), the floating bell SHOULD be hidden. But after Chrome kill, `drawerMode` state may reset to `null` while drawer is visually still open → both bells render.

### Expected
Keep ONLY the bell in CartView header (CartView.jsx ~line 622-630).
Hide the floating bell in x.jsx when CartView drawer is open. The condition `drawerMode !== 'cart'` SHOULD work, but needs to be verified after Chrome kill (state recovery from localStorage).

Two approaches (pick simpler):
A) Add `!isCartOpen` check to x.jsx bell condition (where `isCartOpen` is derived from drawer visibility).
B) Simply remove the floating bell from x.jsx entirely — CartView header bell is always accessible when drawer is open, and when drawer is closed the StickyCartBar itself opens it.

Recommendation: Approach B — remove floating bell entirely. Help is accessible via help drawer (one-tap cards in it), and CartView header has the bell.

### Must NOT be
No two bell icons visible simultaneously.

### File and location
`x.jsx` ~lines 3952-3961. The block:
```jsx
{view === "menu" && isHallMode && drawerMode !== 'cart' && (
  <button onClick={openHelpDrawer} className="fixed bottom-20 left-4 z-40 ...">
    <Bell className="w-5 h-5" />
  </button>
)}
```
Either remove this entire block OR add additional state check.

### Already tried
Not tried before. First occurrence S190.

### Verification
Open CartView drawer → only ONE bell icon visible (in header). Close drawer → no floating bell (it was removed). Help accessible via help drawer from menu.

---

## Fix 10 — PM-152 (P2) [MUST-FIX]: Guest name not cleared when table changes

### Currently
`x.jsx` ~line 2459: `useEffect` removes `menuapp_guest_name` from localStorage when `tableCodeParam` changes. BUT: the effect depends on comparing `prevTableRef.current !== tableCodeParam`. After Chrome kill, `prevTableRef` resets to `undefined`/`null` → comparison fails → localStorage NOT cleared → stale name persists.

### Expected
On ANY navigation to a new table (new `tableCodeParam` that differs from previous), clear `guestNameInput` state AND remove `localStorage.menuapp_guest_name`. Reliable detection: if `tableCodeParam` changes AND is non-empty, treat as new table.

Fix approach: use `useEffect` with `tableCodeParam` as dependency. On change, always clear:
```javascript
useEffect(() => {
  if (!tableCodeParam) return;
  // Always reset guest name when table code changes
  setGuestNameInput('');
  try { localStorage.removeItem('menuapp_guest_name'); } catch(e) {}
  // Reset prev ref
  prevTableRef.current = tableCodeParam;
}, [tableCodeParam]);
```
Remove the old `prevTableRef` comparison logic — it's unreliable after state reset.

### Must NOT be
No stale guest name carried over to a different table.
Do NOT clear name on initial load (only on table change from one value to another).

### File and location
`x.jsx` ~lines 2459-2470. Search for `prevTableRef` and the effect that calls `localStorage.removeItem('menuapp_guest_name')`.

### Already tried
ССП S189 Fix 8: `removeItem` on `tableCodeParam` change using `prevTableRef` comparison — failed in S190 Android test (name not cleared).

### Verification
Enter name on Table 01 → navigate to Table 02 (enter new code) → name input should be empty.

---

## Fix 11 — PM-153 (P1) [MUST-FIX]: Guest name fallback — show guestNameInput when DB name is empty

### Currently
`CartView.jsx` ~lines 309-312:
```javascript
const guestBaseName = currentGuest
  ? (currentGuest.name || getGuestDisplayName(currentGuest))
  : tr("cart.guest", "Гость");
```
After Chrome kill, `currentGuest.name` is null (DB returns empty). `getGuestDisplayName` returns generic "Гость". The user-entered name is only in `guestNameInput` (from localStorage auto-save, Fix B S190), but CartView doesn't use it as fallback.

### Expected
Use `guestNameInput` as fallback when `currentGuest.name` is empty:
```javascript
const guestBaseName = currentGuest
  ? (currentGuest.name || guestNameInput || getGuestDisplayName(currentGuest))
  : (guestNameInput || tr("cart.guest", "Гость"));
```
`guestNameInput` is already passed as prop from x.jsx (confirmed: x.jsx line 3544).

### Must NOT be
No showing generic "Гость" when user has a name saved in localStorage.

### File and location
`CartView.jsx` ~lines 309-312. Modify the `guestBaseName` computation to include `guestNameInput` fallback.

### Verification
Enter name "Артур" → send order → kill Chrome → reopen → CartView shows "Артур" (not "Гость").

---

## ⛔ SCOPE LOCK — change ONLY what is described above

- Modify ONLY code described in Fix 1-11 sections above.
- Do NOT change: discount logic, formatPrice implementation, stepper (-/+) behavior, table verification flow, checkout flow, polling logic, help drawer cards, Android Back handling.
- Do NOT change star ratings (CV-04/CV-05 — working correctly).
- Do NOT change sticky footer CTA button logic (CV-02/CV-11 — working correctly).

## FROZEN UX (DO NOT CHANGE)
These elements are Fixed and Tested — do NOT modify their behavior or styling:
- PM-083: Chevron ˅ right-aligned in CartView header ✅
- PM-085: Chevron sticky top ✅
- PM-086: No email field in CartView ✅
- PM-099: Single drag handle (no duplicate) ✅
- PM-126: Android Back closes drawer correctly ✅
- PM-139: Guest name save (✓ button + localStorage) ✅
- PM-140: CTA buttons after order sent ✅
- PM-141: Star rating touch targets ✅
- PM-142/143/144: Status-based buckets + date filter + sorting ✅
- PM-146: Cart persists after Chrome kill (localStorage) ✅
- PM-148: No "Стол Стол" duplicate (ModeTabs.jsx) ✅
- PM-149: No "#1313" suffix on guest name ✅
- PM-154: Calendar-date cutoff for business day ✅

FROZEN grep verification (run BEFORE commit):
```bash
grep -an "border-l-4\|PM-083\|sticky.*top\|ChevronDown" pages/PublicMenu/CartView.jsx | head -5
grep -an "openHelpDrawer\|pushOverlay\|popOverlay" pages/PublicMenu/x.jsx | head -5
```

## MOBILE-FIRST CHECK (MANDATORY before commit)
This is a mobile-first restaurant app. Verify at 375px width:
- [ ] Close/chevron: right-aligned, sticky top
- [ ] Touch targets >= 44x44px
- [ ] No excessive whitespace on small screens
- [ ] Bottom sheet scrollable without losing close button
- [ ] No duplicate visual indicators

## Regression Check (MANDATORY after implementation)
- [ ] CartView drawer opens/closes correctly
- [ ] Orders display in status buckets (Принят, Готовится, Готов, Подано)
- [ ] Cart items have working stepper (-/+)
- [ ] "Отправить официанту" button works
- [ ] Android Back button closes drawer (not browser)

## Implementation Notes
- TARGET: `CartView.jsx` (1148 lines), `x.jsx` (4020 lines — Fix 9 ONLY, ~6 lines change)
- CartView.jsx has BOM/null bytes — use `grep -a` flag in all grep commands (PQ-029)
- Price formatting: use SAME `formatPrice()` function already in file. Do NOT introduce Math.round or toFixed for display — formatPrice handles it.
- i18n: use `tr()` function for all user-facing text. Keys format: `cart.section.element`.
- git add pages/PublicMenu/CartView.jsx pages/PublicMenu/x.jsx && git commit -m "CartView Batch 3: CV-28..CV-35 + PM-153 + PM-156 (10 UX fixes from S190 Android test)"
- git push
=== END ===


## Status
Running...
