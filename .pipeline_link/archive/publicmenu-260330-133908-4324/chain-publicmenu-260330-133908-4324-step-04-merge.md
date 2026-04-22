---
chain: publicmenu-260330-133908-4324
chain_step: 4
chain_total: 4
chain_step_name: merge
page: PublicMenu
budget: 4.00
runner: cc
type: chain-step
---
=== CHAIN STEP: Merge (4/4) ===
Chain: publicmenu-260330-133908-4324
Page: PublicMenu

You are the Merge step in a modular consensus pipeline.
Your job: apply the fix plan to the actual code.

INSTRUCTIONS:
1. Read the comparison: pipeline/chain-state/publicmenu-260330-133908-4324-comparison.md
2. Check if discussion report exists: pipeline/chain-state/publicmenu-260330-133908-4324-discussion.md
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
   - git commit -m "fix(PublicMenu): N bugs fixed via consensus chain publicmenu-260330-133908-4324"
   - git push
7. Write merge report to: pipeline/chain-state/publicmenu-260330-133908-4324-merge-report.md

FORMAT for merge report:
# Merge Report — PublicMenu
Chain: publicmenu-260330-133908-4324

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
# UX Batch 8A: CartView spacing/gap polish + PM-163 float fix (#204)

Reference: `ux-concepts/CartView/cart-view.md` v5.0, `BUGS_MASTER.md`.
Production page: `/x` (CartView.jsx renders inside PublicMenu x.jsx).

**Context:** Post-Batch-7 Android test (S200) revealed 4 spacing issues in CartView drawer: bucket headers too tall, bell header too padded, items gap too large, spacer too big. Plus PM-163 float in table total. All are L-level CSS/className tweaks — exact line numbers provided below.

TARGET FILES (modify): `pages/PublicMenu/CartView.jsx`
CONTEXT FILES (read-only): `ux-concepts/CartView/cart-view.md`, `BUGS_MASTER.md`

---

## Fix 1 — CV-spacing-01 (P2) [MUST-FIX]: Bucket headers too tall — reduce vertical padding

### Сейчас
Bucket card content (both V8 «Подано» bucket and normal bucket loop) uses `px-3 py-2`.
This makes collapsed bucket headers feel tall and wastes vertical space on mobile.
Lines: ~800 and ~911: `<CardContent className="px-3 py-2">`

### Должно быть
Change `py-2` → `py-1.5` so bucket headers are slightly more compact.
Pattern applies to ALL CardContent wrappers on status bucket cards.
Ref: cart-view.md §Fix 1, S200 Android test finding.

### НЕ должно быть
- Do NOT change `px-3` — horizontal padding stays the same.
- Do NOT change the `min-h-[44px]` on the inner button — keep touch target.
- Do NOT change CardContent padding for the cart (new order) section.

### Файл и локация
File: `pages/PublicMenu/CartView.jsx`
Search: `grep -an "CardContent.*px-3 py-2" pages/PublicMenu/CartView.jsx`
Expected: 3 matches — ~line 800 (V8 served bucket), ~line 911 (normal bucket loop), ~line 1014 (cart section — DO NOT change this one).
Change ONLY ~line 800 and ~line 911. Line ~1014 is the cart section — leave as `px-3 py-2`.

### Проверка
Open `/x` → place an order → CartView drawer opens → bucket headers feel slightly more compact but touch area still comfortable.

---

## Fix 2 — CV-spacing-02 (P2) [MUST-FIX]: Bell header card — reduce vertical padding

### Сейчас
The table info card at the top of CartView (bell + table + guest + chevron) uses class `p-3` on its container div.
Line ~599: `<div className="bg-white rounded-lg shadow-sm border p-3 mb-4 mt-2">`
This creates too much vertical padding compared to the content.

### Должно быть
Change `p-3` → `px-3 py-2` for slightly less vertical padding.
Ref: S200 Fix 2 finding.

### НЕ должно быть
- Do NOT change `mb-4 mt-2` margins.
- Do NOT change `rounded-lg shadow-sm border`.
- Do NOT change any child elements inside this div.

### Файл и локация
File: `pages/PublicMenu/CartView.jsx`
Search: `grep -an "bg-white rounded-lg shadow-sm border p-3" pages/PublicMenu/CartView.jsx`
Expected: 1 match at ~line 599.

### Проверка
Open CartView → top bell/table card looks slightly shorter vertically. Content (bell icon, table name, chevron) unchanged.

---

## Fix 3 — CV-spacing-03 (P2) [MUST-FIX]: renderBucketOrders items gap too large

### Сейчас
The `renderBucketOrders` function returns a container with `mt-2 pt-2` creating a gap between bucket header and item list.
Line ~543: `<div className="space-y-1 mt-2 pt-2">`

### Должно быть
Change `mt-2 pt-2` → `mt-1 pt-1` for tighter spacing between header and dish items.
Ref: S200 Fix 3 finding (items too far from header).

### НЕ должно быть
- Do NOT change `space-y-1` — keep vertical spacing between items.
- Do NOT change `py-1` on individual item rows (~line 546).

### Файл и локация
File: `pages/PublicMenu/CartView.jsx`
Search: `grep -an "space-y-1 mt-2 pt-2" pages/PublicMenu/CartView.jsx`
Expected: 1 match at ~line 543 inside `renderBucketOrders` function.

### Проверка
Open CartView → expand a bucket → dish list starts slightly closer to the bucket header.

---

## Fix 4 — CV-spacing-04 (P2) [MUST-FIX]: Bottom spacer too tall — reduce h-20 to h-14

### Сейчас
A spacer div at the bottom of CartView prevents the sticky footer from overlapping content.
Line ~1063: `{(cart.length > 0 || todayMyOrders.length > 0) && <div className="h-20" />}`
This creates too much empty space at the bottom when viewing cart with few items.

### Должно быть
Change `h-20` → `h-14` (reduced from 80px to 56px). Still sufficient to clear the sticky footer.
Ref: S200 Fix 4 finding.

### НЕ должно быть
- Do NOT remove the spacer entirely — it prevents content from being hidden behind sticky footer.
- Do NOT change the condition `(cart.length > 0 || todayMyOrders.length > 0)`.

### Файл и локация
File: `pages/PublicMenu/CartView.jsx`
Search: `grep -an "h-20" pages/PublicMenu/CartView.jsx`
Expected: 1 match at ~line 1063.

### Проверка
Open CartView with 1-2 items → less empty white space below «Новый заказ» section. Footer still fully visible.

---

## Fix 5 — PM-163 (P3) [MUST-FIX]: Table total floating point (desktop only)

### Сейчас
The table total display at ~line 774 shows floating point on desktop: `205.76999999999998 ₸`.
Code: `{formatPrice(tableTotal)}` where `tableTotal` is a prop.
`tableTotal` may arrive as a raw JS float computed by summing order totals.

### Должно быть
Wrap `tableTotal` in `parseFloat(Number(tableTotal).toFixed(2))` before passing to `formatPrice`.
Same pattern as other float fixes in this file (PM-145, PM-157 pattern).
Result: `formatPrice(parseFloat(Number(tableTotal).toFixed(2)))` at ~line 774.
Ref: PM-163, BUGS_MASTER.

### НЕ должно быть
- Do NOT change the label text `tr('cart.table_total', 'Счёт стола')`.
- Do NOT change the Card/CardContent structure around it.
- Do NOT apply toFixed elsewhere than line ~774 for this fix.

### Файл и локация
File: `pages/PublicMenu/CartView.jsx`
Search: `grep -an "formatPrice(tableTotal)" pages/PublicMenu/CartView.jsx`
Expected: 1 match at ~line 774. Also check `grep -an "tableTotal" pages/PublicMenu/CartView.jsx` for any other display usages.

### Проверка
Open CartView on desktop with multi-guest orders → «Счёт стола» shows `205.77 ₸` (not `205.76999...`).

---

## FROZEN UX (DO NOT CHANGE)
These elements are approved and tested in CartView. Do NOT modify, remove, reposition, or restyle them:
- **Bucket structure**: served(collapsed by default), accepted/in_progress/ready(expanded), new_order(bottom) — CV-01/CV-09/CV-10. State: `expandedStatuses.served = false`.
- **Guest display**: no suffix `#XXXX` — `guestBaseName` without effectiveGuestCode suffix (~line 307-309) — PM-149 ✅ Tested S184.
- **Flat dish list in served bucket**: `renderBucketOrders` groups by dish name — CV-28 ✅ Tested S192.
- **Today-only orders**: cutoff filter (calendar date comparison) — PM-154 ✅ Tested S190.
- **Float-free prices**: all prices use `formatPrice(parseFloat(...toFixed(2)))` — PM-145 ✅ Tested S183.
- **Bell button**: `<Bell>` in header card, triggers `onCallWaiter` — PM-125 ✅ Tested S176.
- **Chevron position**: `ChevronDown/Up` in right section of bucket header with `min-w-[44px] min-h-[44px]` — PM-083/085 ✅.
- **Single bell icon**: no duplicate bell in StickyCartBar — PM-156 ✅.
- **Accent chip «Оценить»**: orange chip in «Подано» header, triggers expand — CV-05 partial (do not remove or change behavior).
- **Rating stars in served bucket**: shown when `showRating && reviewsEnabled && expanded` — keep as-is (rating flow redesign is in Batch 8B).
- **Android back button handling**: `pushState`/`popstate` logic — PM-126 ✅ Tested S176.

## ⛔ SCOPE LOCK — менять ТОЛЬКО то, что описано выше
- Modify ONLY the 5 CSS classNames/expressions described in Fix 1–5.
- Everything else in CartView.jsx — DO NOT TOUCH.
- If you see other "issues" outside these fixes — SKIP them, do not fix.
- Do NOT restructure any component, add state, or change behavior.

## MOBILE-FIRST CHECK (MANDATORY before commit)
This is a mobile-first restaurant app. Verify at 375px width:
- [ ] Close/chevron: right-aligned, sticky top — unchanged
- [ ] Touch targets ≥ 44×44px — `min-h-[44px]` on bucket buttons still present
- [ ] No excessive whitespace on small screens — spacer h-14 is sufficient
- [ ] Bottom sheet scrollable without losing close button
- [ ] No duplicate visual indicators

## Regression Check (MANDATORY after implementation)
After applying all fixes, verify:
- [ ] CartView drawer still opens and closes normally
- [ ] Bucket expand/collapse still works (tap header)
- [ ] «Оценить» chip still expands served bucket
- [ ] Guest name shows without suffix (PM-149)
- [ ] Prices show without float (PM-145)
- [ ] Cart «Новый заказ» section still functional with stepper +/−

## FROZEN UX grep verification (for files >500 lines)
Before commit, run these grep checks to confirm FROZEN elements are intact:
```bash
grep -an "expandedStatuses" pages/PublicMenu/CartView.jsx | grep "served: false"
grep -an "guestBaseName" pages/PublicMenu/CartView.jsx
grep -an "space-y-1 mt-1 pt-1" pages/PublicMenu/CartView.jsx
```

## Implementation Notes
- TARGET file: `pages/PublicMenu/CartView.jsx` — 1126 lines. Use `grep -a` for all searches (PQ-029: file has BOM).
- All 5 fixes are className/expression changes only — no new state, no new components.
- git add pages/PublicMenu/CartView.jsx && git commit -m "style(CartView): spacing polish + PM-163 table total float fix" && git push
=== END ===
