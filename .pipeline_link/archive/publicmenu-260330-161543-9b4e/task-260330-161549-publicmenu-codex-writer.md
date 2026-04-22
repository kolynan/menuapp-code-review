---
task_id: task-260330-161549-publicmenu-codex-writer
status: running
started: 2026-03-30T16:15:49+05:00
type: chain-step
page: PublicMenu
work_dir: C:/Dev/menuapp-code-review
budget_usd: 20.00
fallback_model: sonnet
version: 5.14
launcher: python-popen
---

# Task: task-260330-161549-publicmenu-codex-writer

## Config
- Budget: $20.00
- Mode: task-watcher.py launches Claude Code directly via Popen
- Fallback model: sonnet

## Prompt
---
chain: publicmenu-260330-161543-9b4e
chain_step: 1
chain_total: 4
chain_step_name: codex-writer
chain_group: writers
chain_group_size: 2
page: PublicMenu
budget: 20.00
runner: codex
type: chain-step
---
Review the file(s) specified in TASK CONTEXT below for a React restaurant QR-menu app on Base44 platform.
Also check README.md and BUGS.md in the same page folder for context (read-only, do NOT modify).

SPEED RULES — this is a time-sensitive pipeline step:
- Read ONLY the TARGET files + README/BUGS for context. Do NOT search the repo, do NOT read old findings, do NOT read files outside the page folder.
- Do NOT run rg/grep across the whole repo. Do NOT cross-reference with other pages.
- Limit analysis to the target page code. Be concise.

⛔ SCOPE RESTRICTION (MANDATORY):
If the TASK CONTEXT below contains a numbered Fix list (Fix 1, Fix 2, etc.):
- Do NOT report ANY issues outside the numbered Fix list.
- If you see other bugs — IGNORE them completely.
- Your output must contain ONLY findings for Fix 1, Fix 2, etc.
- Extra findings outside the Fix list = task FAILURE.
- BAD example: Task says "Fix 1: button position" → you report touch targets, aria-labels, i18n issues. This is WRONG.
- GOOD example: Task says "Fix 1: button position" → you report ONLY your analysis of Fix 1 (button position). Nothing else.

If there is NO numbered Fix list → find ALL bugs. Focus on: logic errors, missing error handling, i18n issues, UI/UX for mobile-first, React anti-patterns.

For each finding: [P0/P1/P2/P3] Title - Description. FIX: code change needed.

Write findings to: pipeline/chain-state/publicmenu-260330-161543-9b4e-codex-findings.md

FORMAT:
# Codex Writer Findings — PublicMenu
Chain: publicmenu-260330-161543-9b4e

## Findings
1. [P0/P1/P2/P3] Title — Description. FIX: ...
2. ...

## Summary
Total: N findings (X P0, Y P1, Z P2, W P3)

## Prompt Clarity (MANDATORY — do NOT skip this section)
Rate the task description quality (1-5). For any score below 4, explain what was unclear:
- Overall clarity: [1-5]
- Ambiguous Fix descriptions (list Fix # and what was unclear): ...
- Missing context (what info would have helped): ...
- Scope questions (anything you weren't sure if it's in scope): ...
YOU MUST FILL IN ALL FIELDS ABOVE. Findings without Prompt Clarity are incomplete.

Do NOT apply fixes — only document findings.

=== TASK CONTEXT ===
# Implement CV-05 v2: CartView Rating Flow — Two-mode system (#204)

Reference: `ux-concepts/CartView/cart-view.md` v5.0 §CV-05/CV-36–CV-42, `ux-concepts/CartView/GPT_RatingFlow_CV05_S201.md`, `BUGS_MASTER.md`.
Production page: `/x` (CartView.jsx).

**Context:** The current rating implementation shows inline stars for all items in «Подано» whenever the section is expanded. This creates visual noise (empty stars) and doesn't align with the approved CV-05 v2 spec. This task implements a **two-mode rating system** (view mode + rating mode) with autosave, a chip counter, a bonus subline, email bottom sheet after completion, and re-entry support.

This is an **implement feature per spec** task (not a bug fix). Implement ALL items below per the ASCII mockups in `cart-view.md §г г2 г3 г4 г5`.

TARGET FILES (modify): `pages/PublicMenu/CartView.jsx`
CONTEXT FILES (read-only): `ux-concepts/CartView/cart-view.md`, `ux-concepts/CartView/GPT_RatingFlow_CV05_S201.md`, `references/B44_Entity_Schemas.md`, `BUGS_MASTER.md`

---

## Fix 1 — CV-05-v2 (P1) [MUST-FIX]: Implement view mode — remove empty stars, show rating status text

### Сейчас
When «Подано» bucket is expanded, the `renderBucketOrders(orders, showRating=true)` function shows inline `<Rating>` stars for EVERY item in the served bucket immediately — including items with no rating yet (empty stars). This creates ~5 rows of empty stars = visual noise.
Current code (~line 553-584): `{showRating && reviewsEnabled && g.items.map(item => { ... <Rating value={draftRating} ... } )}`

### Должно быть
**View mode** (default when bucket is expanded, `isRatingMode=false`):
- No star widgets visible.
- For **rated items** (hasReview OR draftRating > 0): show `⭐{rating}` text right-aligned next to dish name/price.
  Format: `<span className="text-xs text-amber-500">⭐{draftRating || reviewRating}</span>` — right of the price.
- For **unrated items**: show grey muted text `Оценить` right-aligned.
  Format: `<span className="text-xs text-slate-400">{tr('review.rate_action', 'Оценить')}</span>`
- No star component rendered in view mode.

**Rating mode** (`isRatingMode=true`, activated by chip tap — see Fix 2):
- Inline `<Rating>` stars appear below each dish name for UNRATED items only.
- Rated items show stars pre-filled (read-only with edit option — see Fix 7).
- Stars have `size="md"` with container `min-h-[44px]` (tap target fix — Fix 8).

Ref: cart-view.md §CV-05 v2, §г2 (view mode mockup), §г3 (rating mode mockup), GPT_RatingFlow_CV05_S201.md.

### НЕ должно быть
- No empty star widgets in view mode.
- Do NOT show `<Rating>` component at all in view mode.
- Do NOT hide the `Оценить` text for unrated items — it shows even in view mode.

### Файл и локация
File: `pages/PublicMenu/CartView.jsx`
Add state: `const [isRatingMode, setIsRatingMode] = React.useState(false);` near other useState declarations (~line 92-120).
Modify: `renderBucketOrders` function (~lines 513-594) — add `isRatingMode` param or read from state. Conditionally render stars vs text.
Search: `grep -an "showRating && reviewsEnabled" pages/PublicMenu/CartView.jsx`

### Проверка
Open CartView → expand «Подано» bucket → see text `Оценить` for unrated, `⭐4` for rated. No star widgets visible until rating mode is activated.

---

## Fix 2 — CV-05-chip (P1) [MUST-FIX]: Rating chip — counter + mode toggle

### Сейчас
Chip in «Подано» header shows static text `tr('review.rate', 'Оценить')` (orange chip). Tapping it only expands the bucket (line ~816-817 and ~928-929). No mode tracking. No counter showing unrated count.

### Должно быть
**Chip label logic:**
- Unrated items exist → `Оценить (N)` where N = count of unrated items in served bucket.
- All rated → `✓ Оценено` (green text, no orange background).
  Format: `<span className="ml-1 text-xs text-green-600 font-medium">✓ {tr('review.all_rated_chip', 'Оценено')}</span>`

**Chip behavior (when unrated items exist):**
- Tap chip → expand bucket AND set `isRatingMode = true`.
- Chip label changes to `Готово` (white/neutral style).
- Micro-label appears below bucket header: `<p className="text-xs text-slate-500 mt-0.5">{tr('review.rating_mode', 'Режим оценки')}</p>`.
- Auto-scroll to first unrated item (use `scrollIntoView({ behavior: 'smooth', block: 'nearest' })`).

**`Готово` button behavior:**
- Tap `Готово` → set `isRatingMode = false`.
- If guest is anonymous (no email on file) AND loyaltyEnabled AND at least 1 item was rated → trigger email bottom sheet (Fix 6).

**Count calculation:**
- `unratedServedCount` = served items where `!safeReviewedItems.has(item.itemId)` AND `!(safeDraftRatings[item.itemId] > 0)`.

Ref: cart-view.md §CV-36, §CV-05 v2.

### НЕ должно быть
- Do NOT remove the expand/collapse chevron behavior from bucket header button.
- Do NOT show `Оценить (N)` chip when there are 0 served items.
- Do NOT show the chip on non-served buckets.
- Do NOT use `e.stopPropagation()` pattern that prevents header expand on chip tap — chip should BOTH expand AND activate rating mode.

### Файл и локация
File: `pages/PublicMenu/CartView.jsx`
Modify chip at ~line 810-818 (V8 path) and ~line 921-930 (normal bucket loop).
State: `isRatingMode` (from Fix 1). Add `unratedServedCount` computed value.
Search existing chip: `grep -an "review.rate" pages/PublicMenu/CartView.jsx`

### Проверка
Open CartView with served items → chip shows `Оценить (3)`. Tap → rating mode activates, chip shows `Готово`. Rate all → chip shows `✓ Оценено`. Tap `Готово` → rating mode exits.

---

## Fix 3 — CV-37 (P2) [MUST-FIX]: Bonus subline below «Подано» header — replace inline amber banner

### Сейчас
Bonus hint shows as an amber banner INSIDE the expanded bucket content (~line 830-834):
`<div className="mt-2 text-xs text-amber-700 bg-amber-50 ..."><span>⭐</span><span>За отзыв +{reviewRewardPoints} бонусов</span></div>`
This is shown when `shouldShowReviewRewardHint && expandedStatuses.served`.

### Должно быть
**Remove** the amber banner from inside the expanded bucket content.
**Add** a subline directly below the bucket header button (outside the expanded content), shown when bucket is collapsed OR expanded AND `shouldShowReviewRewardHint`:
```jsx
{shouldShowReviewRewardHint && (
  <p className="text-xs text-slate-500 mt-0.5 pb-1">
    {tr('loyalty.review_bonus_hint', 'За отзыв можно получить')} +{reviewRewardPoints} {tr('loyalty.points_short', 'баллов')}
  </p>
)}
```
This subline sits below the `<button>` collapse/expand element, still inside `<CardContent>`, before `{expandedStatuses.served && ...}`.
Note: Use `можно получить` wording (not `получите`) — CV-37 spec.

Ref: cart-view.md §CV-37, §г (collapsed mockup shows subline below header), GPT_RatingFlow_CV05_S201.md §4.

### НЕ должно быть
- Do NOT keep the amber banner inside expanded content (remove it).
- Do NOT show this subline if `!shouldShowReviewRewardHint` (respect existing flag).
- Do NOT show it on non-served buckets.
- Do NOT put it inside the `{expandedStatuses.served && ...}` conditional.

### Файл и локация
File: `pages/PublicMenu/CartView.jsx`
Remove: `shouldShowReviewRewardHint` amber banner at ~line 829-834 (V8 path) and ~line 941-946 (normal bucket loop).
Add: subline after the `<button>` element in both V8 and normal bucket paths.
Search: `grep -an "shouldShowReviewRewardHint" pages/PublicMenu/CartView.jsx`

### Проверка
Open CartView with served items and loyalty enabled → see muted subline `За отзыв можно получить +10 баллов` below «Подано» header. No amber box inside expanded content.

---

## Fix 4 — CV-39 (P1) [MUST-FIX]: Autosave per row — optimistic UI with save states

### Сейчас
When a star is tapped, `handleRateDish` is called immediately. `ratingSavingByItemId` shows a spinner while saving. After save, shows `✓` checkmark. This is already partially correct.
Issue: the `onChange` guard `if (draftRating > 0 || hasReview) return;` prevents changing a rating once set — this is too restrictive for re-entry (Fix 7).

### Должно быть
Keep the immediate save behavior (autosave per row). Improve the save states display:
- Saving: `<span className="text-xs text-slate-400">{tr('review.saving', 'Сохраняем…')}</span>`
- Saved: `<span className="text-xs text-green-600">✓ {tr('review.saved', 'Сохранено')}</span>`
- Error: `<span className="text-xs text-red-500">{tr('review.save_error', 'Ошибка. Повторить')}</span>` (only if `ratingSavingByItemId[item.itemId] === 'error'`)

Remove the guard `if (draftRating > 0 || hasReview) return;` from `onChange` — re-rating should be allowed (see Fix 7 re-entry).
Replace with: `if (ratingSavingByItemId?.[item.itemId] === true) return;` — only block during active save.

Ref: cart-view.md §CV-39, GPT_RatingFlow_CV05_S201.md §6 (optimistic + `Готово` = exit mode only).

### НЕ должно быть
- Do NOT block re-rating when `draftRating > 0` — editing is allowed until table session ends (CV-41).
- Do NOT show stars as permanently readonly once rated — only block during active save operation.
- Do NOT remove `handleRateDish` call — still save immediately on tap.

### Файл и локация
File: `pages/PublicMenu/CartView.jsx`
Modify: `onChange` guard in `renderBucketOrders` (~line 561).
Modify: save state display (~lines 576-581).
Search: `grep -an "draftRating > 0 || hasReview" pages/PublicMenu/CartView.jsx`

### Проверка
Rate a dish → spinner `Сохраняем…` appears → changes to `✓ Сохранено`. Tap another star on same dish → re-save works (no block).

---

## Fix 5 — CV-36 (P2) [MUST-FIX]: Chip shows `✓ Оценено` when all items rated (not just «Оценить» hidden)

### Сейчас
When `allServedRated` is true, the chip shows a `<span>` with `tr('review.all_rated', 'Оценено')` text (green, no background). This is partially correct.

### Должно быть
When `allServedRated = true`:
- Chip shows: `✓ Оценено` (with checkmark prefix).
- Format: `<span className="ml-1 text-xs text-green-600 font-medium">✓ {tr('review.all_rated_chip', 'Оценено')}</span>`
- Chip is NOT a button — it's a read-only indicator (no onClick).
- `isRatingMode` is set to false when all items become rated (auto-exit).

When `allServedRated = false` AND `unratedServedCount > 0`:
- Chip is a button: `Оценить ({unratedServedCount})` in rating mode → `Готово`.

Ref: cart-view.md §CV-36, §г5 mockup.

### НЕ должно быть
- Do NOT hide the chip when all items are rated — keep `✓ Оценено` visible for re-entry reference.
- Do NOT show `Оценить (0)` when count reaches zero.

### Файл и локация
File: `pages/PublicMenu/CartView.jsx`
Modify existing `allServedRated` chip display (~lines 811-813, 923-925).
Add: auto-exit from rating mode when `allServedRated` becomes true (useEffect or inside `handleRateDish` callback).
Search: `grep -an "allServedRated" pages/PublicMenu/CartView.jsx`

### Проверка
Rate all served dishes → chip automatically changes from `Оценить (1)` to `✓ Оценено`. Rating mode exits automatically.

---

## Fix 6 — CV-38 (P2) [MUST-FIX]: Email bottom sheet after «Готово» for anonymous guests

### Сейчас
After rating, a green «Спасибо за оценку!» banner + email form appears inside the expanded bucket content (~lines 836-890). This inline flow is cluttered and triggers before the user explicitly finishes.

### Должно быть
**Remove** the inline green reward nudge banner from inside bucket content (lines ~835-890 that contain `shouldShowReviewRewardNudge` banner with email form).

**Add** a new bottom sheet (email prompt) triggered AFTER `Готово` tap:
- Trigger condition: `isRatingMode` was true AND user tapped `Готово` AND `shouldShowReviewRewardNudge` AND guest has no email on file.
- New state: `const [showPostRatingEmailSheet, setShowPostRatingEmailSheet] = React.useState(false);`
- `Готово` handler: `setIsRatingMode(false); if (shouldShowReviewRewardNudge) setShowPostRatingEmailSheet(true);`

**Bottom sheet content** (using existing Sheet/Drawer component pattern in this file):
```
Title: «Получить баллы за отзыв»
Body:
  «Вы оценили {ratedCount} блюд.»
  «Введите email, чтобы получить {totalBonusPoints} баллов.»
  [Email input field — reuse existing `rewardEmail` state]
  [Button «Получить баллы» → submit email]
  [Button/link «Пропустить»]
  Muted note: «Оценки уже сохранены»
```
- On submit: call existing `handleRewardEmailSubmit` logic (reuse from existing code).
- `totalBonusPoints` = `ratedCount × reviewRewardPoints`.
- On «Пропустить» or after submit: `setShowPostRatingEmailSheet(false)`.

Ref: cart-view.md §CV-38, §г4 (email sheet mockup), GPT_RatingFlow_CV05_S201.md §5.

### НЕ должно быть
- Do NOT show email form inside the expanded bucket content.
- Do NOT remove `shouldShowReviewRewardNudge` state/logic — reuse it for triggering the sheet.
- Do NOT show sheet if guest already has email on file (respect `shouldShowReviewRewardNudge` flag).
- Do NOT show sheet if no items were rated in this session.

### Файл и локация
File: `pages/PublicMenu/CartView.jsx`
Remove: `shouldShowReviewRewardNudge` green banner from ~lines 835-890 (in both V8 and normal bucket rendering paths).
Add: `showPostRatingEmailSheet` state + bottom sheet JSX (near end of component return, after main content, before sticky footer).
Reuse: `rewardEmail`, `handleRewardEmailSubmit`, `showRewardEmailForm` logic for the actual submission — adapt to new sheet trigger.
Search: `grep -an "shouldShowReviewRewardNudge" pages/PublicMenu/CartView.jsx`

### Проверка
Rate dishes → tap `Готово` → email sheet slides up from bottom. Enter email → tap «Получить баллы» → sheet closes, success. Tap «Пропустить» → sheet closes, no email sent.

---

## Fix 7 — CV-40 (P2) [MUST-FIX]: Re-entry in rating mode — pre-filled stars for rated items

### Сейчас
If user rates some dishes, exits rating mode, then taps chip again to re-enter — all stars show empty (draftRatings may be cleared or not reflected correctly).

### Должно быть
When entering rating mode (isRatingMode = true) for a second time:
- Items already in `safeReviewedItems` or `safeDraftRatings` show their rating value pre-filled.
- Rating component `value={draftRating || (hasReview ? existingReviewRating : 0)}`.
- These pre-filled stars are editable (not readonly) — user can change their rating.
- Only `ratingSavingByItemId[item.itemId] === true` (active save) blocks interaction.

Ref: cart-view.md §CV-40, GPT_RatingFlow_CV05_S201.md §1 (re-entry with pre-filled stars).

### НЕ должно быть
- Do NOT show readonly stars on re-entry.
- Do NOT reset `draftRatings` when exiting rating mode — preserve them for re-entry.

### Файл и локация
File: `pages/PublicMenu/CartView.jsx`
Modify: `Rating` component `value` and `readonly` props in `renderBucketOrders` rating section.
Search: `grep -an "draftRating > 0 || hasReview" pages/PublicMenu/CartView.jsx`

### Проверка
Rate 2 of 3 dishes → tap `Готово` → re-tap `Оценить (1)` chip → rated dishes show their star values pre-filled, unrated shows empty stars.

---

## Fix 8 — CV-42 (P2) [MUST-FIX]: Star tap targets ≥ 44×44px

### Сейчас
Stars in `renderBucketOrders` are inside `<div className="flex items-center gap-2 pl-2 py-1">`. The py-1 padding may be insufficient (8px total height for the row container). `Rating` component has `size="md"` already.

### Должно быть
Each star rating row container should have `min-h-[44px]` to ensure tap target:
Change `<div className="flex items-center gap-2 pl-2 py-1">` → `<div className="flex items-center gap-2 pl-2 min-h-[44px]">`
This ensures the touch area for the stars row is ≥ 44px tall on mobile.

Ref: cart-view.md §CV-42, GPT_RatingFlow_CV05_S201.md §6 (tap targets).

### НЕ должно быть
- Do NOT reduce `size="md"` on the Rating component.
- Do NOT add excessive padding that wastes vertical space.

### Файл и локация
File: `pages/PublicMenu/CartView.jsx`
Search: `grep -an "flex items-center gap-2 pl-2 py-1" pages/PublicMenu/CartView.jsx`
Expected: 1 match at ~line 557 (rating row container inside renderBucketOrders).

### Проверка
Open CartView in rating mode on mobile → stars are easy to tap precisely without accidentally tapping adjacent rows.

---

## Fix 9 — PM-164 (P3) [L]: Header gap — guest name button height reduced

### Сейчас
The guest name button on line 637 has `min-h-[44px]` in its className. When a subline is present (e.g., «8 заказов · 194.04₸»), the 44px minimum height creates a visible gap between the guest name row and the subline below it. This makes the header card appear loosely spaced on Android.

### Должно быть
Change `min-h-[44px]` → `min-h-[32px]` on the guest name button:
- The button still has adequate tap target height (32px is acceptable for a named-text button, not a primary CTA).
- The gap between guest name and the order count subline disappears, making the header card compact.

### НЕ должно быть
- Do NOT remove the button entirely — it's tappable for guest name editing.
- Do NOT change `min-h` on the star rating row containers (Fix 8 requires `min-h-[44px]` there — different element).
- Do NOT change any other header card elements.

### Файл и локация
File: `pages/PublicMenu/CartView.jsx`
Search: `grep -an "min-h-\[44px\]" pages/PublicMenu/CartView.jsx`
Expected: line ~637 in the guest name button className.
Change only the one at ~line 637 (guest name button), NOT any others.

### Проверка
Open CartView with an active visit → header card shows guest name and order count subline compact, no visible gap between them.

---

## Fix 10 — PM-165 (P3) [L]: renderBucketOrders — remove pt-1 gap between header and first item

### Сейчас
The `renderBucketOrders` items container at ~line 543 has `className="space-y-1 mt-1 pt-1"`. The `pt-1` (padding-top 4px) creates an extra gap between the bucket section header («Готовится (2)») and the first dish item in that section. This gap is larger than the gap between items themselves — looks inconsistent.

### Должно быть
Remove `pt-1` from the className, keeping `space-y-1` and `mt-1`:
Change: `className="space-y-1 mt-1 pt-1"` → `className="space-y-1 mt-1"`

The `mt-1` (margin-top 4px) already provides adequate spacing between the header button and items container. Removing `pt-1` makes the header→first-item gap equal to the item-to-item gap.

### НЕ должно быть
- Do NOT remove `mt-1` — that's the correct spacing.
- Do NOT remove `space-y-1` — that handles item-to-item spacing.
- Do NOT add any other padding/margin.

### Файл и локация
File: `pages/PublicMenu/CartView.jsx`
Search: `grep -an "space-y-1 mt-1" pages/PublicMenu/CartView.jsx`
Expected: line ~543.

### Проверка
Open CartView with items in any status bucket → gap between bucket header and first item equals the gap between items. No extra padding visible at the top of the items list.

---

## FROZEN UX (DO NOT CHANGE)
These elements are approved and tested. Do NOT modify, remove, reposition, or restyle them:
- **Bucket structure and collapse logic**: expandedStatuses, served=collapsed default (CV-10), chevron behavior — PM-142/143/144 ✅ Tested S183.
- **Guest display**: no suffix `#XXXX` in guestBaseName (~line 307-309) — PM-149 ✅ Tested S184.
- **Flat dish list grouping**: `renderBucketOrders` groups by dish name with qty — CV-28 ✅ Tested S192.
- **Today-only order filtering**: calendar-date cutoff — PM-154 ✅ Tested S190.
- **Float-free prices**: all `formatPrice(parseFloat(...toFixed(2)))` — PM-145 ✅ Tested S183.
- **Bell button**: `<Bell>` triggers `onCallWaiter` in header card — PM-125 ✅ Tested S176.
- **Android back button handling** — PM-126 ✅ Tested S176.
- **Bucket subtotals in headers** — CV-03 ✅.
- **h-14 spacer** (will be set in Batch 8A — treat as FROZEN: do NOT change back to h-20).
- **«Подано» bucket path (V8 screen)**: the entire V8 display block (~lines 780-890) — preserve structure, only modify rating-specific parts per fixes above.
- **`allServedRated` logic**: computed variable at ~line 497 — DO NOT remove.
- **`shouldShowReviewRewardHint` flag**: keep the logic, only move where it's displayed (Fix 3).

## ⛔ SCOPE LOCK — менять ТОЛЬКО то, что описано выше
- Implement ONLY the rating flow changes described in Fix 1–8.
- Do NOT change layout of non-rating UI (bucket headers, cart section, footer, header card).
- Do NOT add new external dependencies or imports beyond what already exists in the file.
- Do NOT change any bucket behavior for non-served buckets (accepted, in_progress, ready, new_order).
- If you see issues outside this scope — SKIP and note in findings.

## MOBILE-FIRST CHECK (MANDATORY before commit)
This is a mobile-first restaurant app. Verify at 375px width:
- [ ] Rating stars visible and tappable (min-h-[44px] on rows)
- [ ] Rating mode chip (`Готово`) fully visible in bucket header
- [ ] Email bottom sheet: scrollable, email input above keyboard, close button accessible
- [ ] Auto-scroll to first unrated item works without jumping the whole page
- [ ] `✓ Оценено` chip fits in bucket header alongside subtotal

## Regression Check (MANDATORY after implementation)
After applying all fixes, verify:
- [ ] CartView drawer opens and closes normally
- [ ] Served bucket collapses by default on open
- [ ] Tap «Оценить (N)» → bucket expands + stars appear
- [ ] Tap `Готово` → stars disappear, chip resets
- [ ] Guest name shows without suffix (PM-149)
- [ ] Prices show without float (PM-145)
- [ ] Cart «Новый заказ» section: stepper +/− still works
- [ ] Non-served buckets (Принят, Готовится, Готов) NOT affected

## FROZEN UX grep verification (for files >500 lines)
Before commit, run these grep checks:
```bash
grep -an "expandedStatuses" pages/PublicMenu/CartView.jsx | grep "served: false"
grep -an "guestBaseName" pages/PublicMenu/CartView.jsx
grep -an "renderBucketOrders" pages/PublicMenu/CartView.jsx
grep -an "isRatingMode" pages/PublicMenu/CartView.jsx
```

## Implementation Notes
- TARGET file: `pages/PublicMenu/CartView.jsx` — 1126 lines (after Batch 8A: ~1126+ lines). Use `grep -a` for all searches (PQ-029: file has BOM).
- New state variables to add: `isRatingMode` (boolean), `showPostRatingEmailSheet` (boolean).
- Reuse existing state: `safeDraftRatings`, `safeReviewedItems`, `ratingSavingByItemId`, `rewardEmail`, `shouldShowReviewRewardHint`, `shouldShowReviewRewardNudge`, `reviewRewardPoints`, `handleRateDish`, `handleRewardEmailSubmit`.
- If `handleRewardEmailSubmit` does not exist as a separate function (may be inline), extract or adapt as needed.
- DishFeedback entity: `DishFeedback.create({order_item: itemId, dish: dishId, rating: val})` — see `references/B44_Entity_Schemas.md`.
- git add pages/PublicMenu/CartView.jsx && git commit -m "feat(CartView): CV-05 v2 rating flow — view/rating modes, autosave, email sheet; fix PM-164/PM-165 header gap" && git push
=== END ===


## Status
Running...
