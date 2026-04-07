# CC Writer Findings — PublicMenu
Chain: publicmenu-260330-161543-9b4e

## Findings

### Fix 1 — CV-05-v2 (P1): Implement view mode — remove empty stars, show rating status text

**Current code (line 553-584):** `renderBucketOrders` receives `showRating` boolean. When `showRating && reviewsEnabled`, it renders inline `<Rating>` stars for EVERY item unconditionally — empty stars for unrated items = visual noise.

**Required changes:**

1. **Add state** `const [isRatingMode, setIsRatingMode] = React.useState(false);` near line 114 (after `showRewardEmailForm` state).

2. **Modify `renderBucketOrders` signature** (line 513): Change to accept `showRating` but use `isRatingMode` from component state for deciding between view mode and rating mode.

3. **View mode (isRatingMode=false, lines 553-584):** Replace the `<Rating>` block with conditional text:
   - For rated items (`hasReview || draftRating > 0`): Show `<span className="text-xs text-amber-500">⭐{draftRating || existingRating}</span>` right-aligned after price in the dish row (line 546-550 flex row).
   - For unrated items: Show `<span className="text-xs text-slate-400">{tr('review.rate_action', 'Оценить')}</span>` right-aligned.
   - Move these indicators INTO the `<div className="flex justify-between items-center text-sm py-1">` row (line 546) rather than a separate row below.
   - No `<Rating>` component rendered at all in view mode.

4. **Rating mode (isRatingMode=true):** Keep existing `<Rating>` rendering but:
   - Show stars for ALL items (unrated = empty, rated = pre-filled).
   - Stars are editable (not readonly) — see Fix 7.
   - Container gets `min-h-[44px]` — see Fix 8.

**FIX:** Restructure lines 552-584: wrap in `{showRating && reviewsEnabled && (isRatingMode ? <RatingModeJSX> : <ViewModeJSX>)}` pattern. View mode puts rating text inline with the dish name/price row. Rating mode keeps the separate `<Rating>` row but with updated props.

---

### Fix 2 — CV-05-chip (P1): Rating chip — counter + mode toggle

**Current code:**
- V8 path (line 813-817): Chip shows static `tr('review.rate', 'Оценить')` with `e.stopPropagation()` that prevents header expand.
- Normal bucket path (line 925-929): Same pattern.

**Issues identified:**
1. **No counter** — chip shows "Оценить" without `(N)` unrated count.
2. **`e.stopPropagation()` prevents expand** — chip should BOTH expand bucket AND activate rating mode (spec says "do NOT use `e.stopPropagation()` pattern that prevents header expand on chip tap").
3. **No `Готово` toggle state** — when rating mode is active, chip should show `Готово`.
4. **No auto-scroll** to first unrated item.

**Required changes:**

1. **Compute `unratedServedCount`** (near line 498, after `allServedRated`):
```jsx
const unratedServedCount = React.useMemo(() => {
  let count = 0;
  statusBuckets.served.forEach(order => {
    const orderItems = itemsByOrder.get(order.id) || [];
    orderItems.forEach((item, idx) => {
      const itemId = item.id || `${order.id}_${idx}`;
      if (!safeReviewedItems.has(itemId) && !(safeDraftRatings[itemId] > 0)) count++;
    });
  });
  return count;
}, [statusBuckets.served, itemsByOrder, safeReviewedItems, safeDraftRatings]);
```

2. **Replace chip JSX** in both V8 path (lines 813-817) and normal bucket path (lines 925-929):
   - When `allServedRated`: `<span className="ml-1 text-xs text-green-600 font-medium">✓ {tr('review.all_rated_chip', 'Оценено')}</span>` (not a button).
   - When `!allServedRated && !isRatingMode`: `<button ... onClick={() => { setExpandedStatuses(prev => ({...prev, served: true})); setIsRatingMode(true); }}>Оценить ({unratedServedCount})</button>` — **WITHOUT** `e.stopPropagation()` so the expand still fires from the parent button.
   - When `!allServedRated && isRatingMode`: `<button ... onClick={(e) => { e.stopPropagation(); setIsRatingMode(false); /* trigger email sheet logic */ }}>Готово</button>` — here stopPropagation IS needed to prevent re-toggling expand.

3. **Add micro-label** below bucket header button when `isRatingMode && !allServedRated`:
```jsx
{isRatingMode && !allServedRated && (
  <p className="text-xs text-slate-500 mt-0.5">{tr('review.rating_mode', 'Режим оценки')}</p>
)}
```

4. **Auto-scroll**: After setting `isRatingMode(true)`, use `setTimeout(() => { document.querySelector('[data-first-unrated]')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); }, 100)` — requires adding `data-first-unrated` attribute to the first unrated item row in rating mode.

**FIX:** Replace chip rendering in both V8 and normal paths. Remove `e.stopPropagation()` from the `Оценить` chip (it's inside the header `<button>`, so let the parent button's `onClick` handle expand). For `Готово`, use `e.stopPropagation()` since we don't want to toggle collapse when tapping Готово.

**Note on chip placement:** The chip is currently INSIDE the header `<button>` element. A nested `<button>` inside `<button>` is invalid HTML. The `Оценить` chip should be changed to a `<span>` with `role="button"` or the chip should be moved outside the header button. However, moving it outside changes layout significantly — recommend keeping `<span>` with `onClick` + `role="button"` for minimal change.

---

### Fix 3 — CV-37 (P2): Bonus subline below header — replace inline amber banner

**Current code:**
- V8 path (lines 829-834): Amber banner `<div className="mt-2 text-xs text-amber-700 bg-amber-50 ...">` inside `{expandedStatuses.served && ...}`.
- Normal bucket path (lines 941-946): Same amber banner inside `{isExpanded && isServed && ...}`.

**Required changes:**

1. **Remove** amber banners from lines 829-834 (V8) and 941-946 (normal).
2. **Add** muted subline AFTER the `<button>` header element but BEFORE the expand conditional, in both V8 (after line 826) and normal (after line 938) paths:
```jsx
{shouldShowReviewRewardHint && (
  <p className="text-xs text-slate-500 mt-0.5 pb-1">
    {tr('loyalty.review_bonus_hint', 'За отзыв можно получить')} +{reviewRewardPoints} {tr('loyalty.points_short', 'баллов')}
  </p>
)}
```
3. This subline is visible even when bucket is collapsed (it's outside the expand conditional).

**FIX:** Move reward hint from inside expanded content to below header button in both rendering paths. Change style from amber banner to muted text. Change wording to `можно получить` per CV-37 spec.

---

### Fix 4 — CV-39 (P1): Autosave per row — remove re-rating guard

**Current code (line 561):**
```jsx
if (draftRating > 0 || hasReview) return;
```
This prevents ANY re-rating once a star is tapped.

**Line 574:**
```jsx
readonly={draftRating > 0 || hasReview || ratingSavingByItemId?.[item.itemId]}
```
Stars become permanently readonly after first rating.

**Lines 576-581:** Save state display is minimal — just a `<Loader2>` spinner during save and a plain `✓` after.

**Required changes:**

1. **Line 561:** Replace guard with: `if (ratingSavingByItemId?.[item.itemId] === true) return;` — only block during active save.
2. **Line 574:** Change `readonly` to: `readonly={ratingSavingByItemId?.[item.itemId] === true}` — only readonly during active save.
3. **Lines 576-581:** Improve save state display:
   - Saving: `<span className="text-xs text-slate-400">{tr('review.saving', 'Сохраняем...')}</span>` (with Loader2 icon).
   - Saved: `<span className="text-xs text-green-600">✓ {tr('review.saved', 'Сохранено')}</span>`.
   - Error: `<span className="text-xs text-red-500">{tr('review.save_error', 'Ошибка. Повторить')}</span>` (if `ratingSavingByItemId[item.itemId] === 'error'`).

**FIX:** Update guard (line 561), readonly prop (line 574), and save state display (lines 576-581). The `ratingSavingByItemId` might only support boolean (`true`/`false`) — check if `'error'` state exists in parent component. If not, only implement saving/saved states, and note that error state requires parent changes.

---

### Fix 5 — CV-36 (P2): Chip shows `✓ Оценено` when all rated + auto-exit rating mode

**Current code:**
- V8 path (line 811-812): `<span className="ml-1 text-xs text-green-600 font-medium">{tr('review.all_rated', 'Оценено')}</span>` — close but missing `✓` prefix.
- Normal path (line 923-924): Same.

**Required changes:**

1. **Add `✓` prefix** to both paths: Change `{tr('review.all_rated', 'Оценено')}` → `✓ {tr('review.all_rated_chip', 'Оценено')}`.
2. **Auto-exit rating mode** when `allServedRated` becomes true. Add effect:
```jsx
React.useEffect(() => {
  if (allServedRated) setIsRatingMode(false);
}, [allServedRated]);
```
Or handle inside `handleRateDish` callback — after save succeeds, check if all are now rated and exit.

3. **Make chip non-clickable** when `allServedRated` — it's already a `<span>` not `<button>`, so this is correct.

**FIX:** Add `✓` prefix to `Оценено` text in both rendering paths. Add `useEffect` for auto-exit from rating mode. Use i18n key `review.all_rated_chip` (not `review.all_rated`) per spec.

---

### Fix 6 — CV-38 (P2): Email bottom sheet after `Готово` for anonymous guests

**Current code (lines 835-890 V8, 947-1001 normal):** Inline green `shouldShowReviewRewardNudge` banner with email form embedded inside the expanded bucket content.

**Required changes:**

1. **Remove** inline reward nudge blocks from V8 path (lines 835-890) and normal path (lines 947-1001).

2. **Add state:** `const [showPostRatingEmailSheet, setShowPostRatingEmailSheet] = React.useState(false);` near other useState declarations.

3. **`Готово` handler** (in Fix 2 chip): When tapping `Готово`:
```jsx
setIsRatingMode(false);
if (shouldShowReviewRewardNudge) {
  setShowPostRatingEmailSheet(true);
}
```

4. **Compute `ratedCount`** for the sheet:
```jsx
const ratedCount = React.useMemo(() => {
  let count = 0;
  statusBuckets.served.forEach(order => {
    const orderItems = itemsByOrder.get(order.id) || [];
    orderItems.forEach((item, idx) => {
      const itemId = item.id || `${order.id}_${idx}`;
      if (safeReviewedItems.has(itemId) || (safeDraftRatings[itemId] > 0)) count++;
    });
  });
  return count;
}, [statusBuckets.served, itemsByOrder, safeReviewedItems, safeDraftRatings]);
```

5. **Add bottom sheet JSX** near end of component return (before closing `</div>`). Use existing Drawer/Sheet pattern if present in the file, otherwise use a simple overlay:
```jsx
{showPostRatingEmailSheet && (
  <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/30" onClick={() => setShowPostRatingEmailSheet(false)}>
    <div className="bg-white rounded-t-xl w-full max-w-lg p-4 pb-6" onClick={e => e.stopPropagation()}>
      <h3 className="text-base font-semibold text-slate-800 mb-2">{tr('review.get_bonus_title', 'Получить баллы за отзыв')}</h3>
      <p className="text-sm text-slate-600 mb-1">{tr('review.rated_count', 'Вы оценили')} {ratedCount} {tr('review.dishes_word', 'блюд')}.</p>
      <p className="text-sm text-slate-600 mb-3">{tr('review.enter_email_for_points', 'Введите email, чтобы получить')} {ratedCount * reviewRewardPoints} {tr('loyalty.points_short', 'баллов')}.</p>
      <Input type="email" value={rewardEmail} onChange={e => setRewardEmail(e.target.value)} placeholder="email@example.com" className="mb-3 h-10" />
      <Button className="w-full h-11 mb-2" style={{backgroundColor: primaryColor}} disabled={!rewardEmail.trim() || rewardEmailSubmitting} onClick={() => { /* reuse existing submit logic */ }}>
        {rewardEmailSubmitting ? '...' : tr('review.get_bonus_btn', 'Получить баллы')}
      </Button>
      <button type="button" className="w-full text-center text-sm text-slate-500 py-2" onClick={() => setShowPostRatingEmailSheet(false)}>
        {tr('review.skip', 'Пропустить')}
      </button>
      <p className="text-xs text-slate-400 text-center mt-1">{tr('review.ratings_saved_note', 'Оценки уже сохранены')}</p>
    </div>
  </div>
)}
```

6. **Reuse email submit logic** from existing inline form (lines 868-880): Extract to a function or inline the same validation + `setCustomerEmail` + toast call.

**FIX:** Remove inline reward nudge from both paths. Add `showPostRatingEmailSheet` state. Add bottom sheet JSX. Wire `Готово` handler to trigger it. The bottom sheet should check for existing drawer/sheet components in the codebase — if no Radix Sheet is available, use a fixed overlay pattern as shown above.

**Note:** The existing email form code uses `setCustomerEmail` (from props) + `toast.success` — there is NO separate `handleRewardEmailSubmit` function. The email submit logic is inline. For the sheet, replicate this inline logic or extract it.

---

### Fix 7 — CV-40 (P2): Re-entry in rating mode — pre-filled stars

**Current code (line 558-559):**
```jsx
<Rating value={draftRating} onChange={...} />
```
`draftRating = safeDraftRatings[item.itemId] || 0` — this should already show pre-filled values on re-entry since `safeDraftRatings` persists in parent state.

**Issue:** The `readonly` guard at line 574 (`draftRating > 0 || hasReview`) makes rated items permanently readonly — Fix 4 addresses this.

**Additional issue:** The `value` prop only uses `draftRating`, not `existingReviewRating` from `safeReviewedItems`. If an item was reviewed in a previous session (exists in `safeReviewedItems` but not in `safeDraftRatings`), the stars would show 0.

**Required changes:**

1. **Rating value:** Change from `value={draftRating}` to `value={draftRating || (hasReview ? (item.rating || item.review_rating || 0) : 0)}`. However, `safeReviewedItems` is a Set (just item IDs), not a Map with ratings. The actual rating value for reviewed items may need to come from a different source. Check if `reviewedItems` data includes the rating value, or if it's only IDs.

2. **If only IDs available in `safeReviewedItems`:** Show stars as 5 (max) for reviewed items as a fallback, or keep `draftRating` which should be populated by parent component for all rated items. This depends on parent implementation.

3. **Ensure `safeDraftRatings` is NOT cleared** when exiting rating mode — this is controlled by parent, not CartView. CartView only calls `updateDraftRating`. No change needed in CartView for persistence.

**FIX:** Update `Rating value` prop to handle re-entry: `value={draftRating || 0}` (keep current, since `draftRating` should persist). The main fix is in Fix 4 — removing the readonly guard. If `safeReviewedItems` is only a Set of IDs without rating values, note this limitation: re-entry for items rated in a PREVIOUS session won't show the original star count unless the parent populates `safeDraftRatings` from DishFeedback records.

---

### Fix 8 — CV-42 (P2): Star tap targets >= 44x44px

**Current code (line 557):**
```jsx
<div key={item.itemId} className="flex items-center gap-2 pl-2 py-1">
```
`py-1` = 4px top + 4px bottom = 8px padding. With `md` size stars (~24px), total height ~32px — below 44px minimum.

**Required change:**
Change `py-1` to `min-h-[44px]`:
```jsx
<div key={item.itemId} className="flex items-center gap-2 pl-2 min-h-[44px]">
```

**FIX:** Single class change at line 557. Replace `py-1` with `min-h-[44px]`.

---

### Fix 9 — PM-164 (P3): Header gap — guest name button height

**Current code (line 637):**
```jsx
className="min-h-[44px] flex items-center hover:underline"
```
The 44px min-height on the guest name button creates excessive gap when a subline (order count) is below.

**Required change:**
Change `min-h-[44px]` to `min-h-[32px]`:
```jsx
className="min-h-[32px] flex items-center hover:underline"
```

**Caution:** Line 637 has `min-h-[44px]` — but lines 631, 632 (save/cancel buttons in edit mode) also have `min-h-[44px]` — do NOT change those, they are action buttons needing full 44px targets.

**FIX:** Change only line 637 `min-h-[44px]` → `min-h-[32px]`.

---

### Fix 10 — PM-165 (P3): Remove pt-1 gap between header and first item

**Current code (line 543):**
```jsx
<div className="space-y-1 mt-1 pt-1">
```

**Required change:**
Remove `pt-1`:
```jsx
<div className="space-y-1 mt-1">
```

`mt-1` (4px margin-top) provides spacing from header. `space-y-1` handles item-to-item gaps. The extra `pt-1` (4px padding-top) doubles the header→first-item gap vs item-to-item gap.

**FIX:** Remove `pt-1` from line 543 className.

---

## Summary
Total: 10 findings (0 P0, 3 P1, 5 P2, 2 P3)

- Fix 1 [P1]: View mode — remove empty stars, show text indicators (major restructure of renderBucketOrders)
- Fix 2 [P1]: Rating chip counter + mode toggle (both V8 and normal paths)
- Fix 3 [P2]: Bonus subline below header, remove amber banner (both paths)
- Fix 4 [P1]: Remove re-rating guard, improve save states
- Fix 5 [P2]: `✓ Оценено` chip + auto-exit rating mode
- Fix 6 [P2]: Email bottom sheet after Готово (remove inline form)
- Fix 7 [P2]: Re-entry pre-filled stars (mainly covered by Fix 4)
- Fix 8 [P2]: Star tap targets min-h-[44px]
- Fix 9 [P3]: Guest name button min-h-[32px]
- Fix 10 [P3]: Remove pt-1 from renderBucketOrders container

## Implementation Risks & Notes

1. **Nested button issue (Fix 2):** The rating chip is currently a `<button>` nested inside the header `<button>`. This is invalid HTML. Recommend changing chip to `<span role="button" tabIndex={0}>` to avoid DOM warnings and click handling issues.

2. **Email submit logic reuse (Fix 6):** There is NO standalone `handleRewardEmailSubmit` function — the email logic is inline (lines 868-880). Either extract it to a named function first, or duplicate the inline logic in the bottom sheet. Extraction is cleaner.

3. **`safeReviewedItems` is a Set, not a Map (Fix 7):** It only stores item IDs, not rating values. Pre-filling stars for items reviewed in a previous session requires the parent to populate `safeDraftRatings` from DishFeedback records. CartView alone cannot show the original rating count for such items — it would show 0 stars. This is a parent-component limitation, not fixable in CartView alone.

4. **`ratingSavingByItemId` error state (Fix 4):** The current code treats this as boolean (`true`/spinner). If the parent doesn't set `'error'` state, the error display won't trigger. Implement the error UI but note it depends on parent changes to populate `ratingSavingByItemId[id] = 'error'`.

5. **Both V8 and normal paths must be updated:** Fixes 2, 3, 5, 6 affect BOTH the V8 display path (~lines 798-896) and the normal bucket loop (~lines 900-1005). Easy to miss one path.

## Prompt Clarity

- Overall clarity: **4/5**
- Ambiguous Fix descriptions:
  - Fix 7: The spec says "show their rating value pre-filled" but `safeReviewedItems` is a Set (no rating values). Where does the existing rating value come from for items reviewed in a previous session? The spec doesn't clarify the data source for `existingReviewRating`.
  - Fix 6: "Reuse existing `handleRewardEmailSubmit` logic" — this function doesn't exist. The email logic is inline. Minor naming mismatch.
- Missing context:
  - Whether `ratingSavingByItemId` supports `'error'` state or only boolean — affects Fix 4 error display.
  - Whether the file uses any Radix Sheet/Drawer component (for Fix 6 bottom sheet) — would need to check x.jsx or other imports.
- Scope questions:
  - Fix 2 mentions auto-scroll with `data-first-unrated` — should this attribute be added? Yes, per spec, but this is implementation detail not covered in the fix description.
  - Whether `Готово` chip needs separate stopPropagation handling vs letting parent button handle both expand and mode toggle — resolved by analysis above.
