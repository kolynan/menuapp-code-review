# Comparison Report — PublicMenu
Chain: publicmenu-260322-185123

## Agreed (both found)

All 6 findings were independently identified by both CC and Codex with matching priority levels.

### 1. [P2] PM-079: Remove "0000" placeholder from code input cells (~line 3444)
- **CC**: Change `placeholder={'0'.repeat(tableCodeLength)}` to `placeholder=""`. Notes visual cells already show `_` as placeholder.
- **Codex**: Remove numeric placeholder, use empty string or neutral non-numeric placeholder.
- **Consensus**: Both agree. Use CC's specific fix: `placeholder=""`. Clean and minimal.

### 2. [P2] PM-080: Shorten confirmation button text (~line 3471)
- **CC**: Change fallback from `'Подтвердить и отправить'` to `'Отправить'`, keep same i18n key `cart.confirm_table.submit`.
- **Codex**: Replace key/fallback with short label `Отправить`. Also flags line 515 (i18n fallback map) needs updating.
- **Consensus**: Both agree on target text. **Codex adds value**: also update the i18n fallback map at ~line 515, not just the render site at ~line 3471. Apply both locations.

### 3. [P2] PM-081: Remove "Wrong table? Change" link (~lines 3473-3482)
- **CC**: Remove entire `<button>` block from lines 3473-3482 (10 lines).
- **Codex**: Remove secondary button from BS. Also flags unused i18n key/fallback at ~line 516.
- **Consensus**: Both agree on removal. **Codex adds value**: also clean up i18n fallback at ~line 516 if nothing else references the key. Apply both.

### 4. [P3] PM-082: Add bonus motivation text on BS (~above line 3458)
- **CC**: Detailed IIFE implementation using `tr()` with template literal fallback. Uses `Math.round((Number(cartTotalAmount) || 0) * (Number(partner?.loyalty_points_per_currency) || 1))`. Notes `trFormat` is NOT available.
- **Codex**: Render bonus text using existing loyalty calculation, show only when enabled and positive.
- **Consensus**: Both agree on the feature. **CC provides superior implementation detail** — use CC's IIFE pattern with `tr()` and the specific calculation formula. Codex's description is vague ("use existing loyalty calculation") but aligned.

### 5. [P1] PM-088: Code input cells don't accept input on mobile (~lines 3419-3446)
- **CC**: Two-part fix: (a) Add `onClick` to visual cell divs to focus hidden input via `useRef`, add `cursor-pointer`; (b) Add `ref`, keep `inputMode="numeric"`, add `pattern="[0-9]*"`, consider removing `autoFocus` or supplementing with click-to-focus.
- **Codex**: Make visible cells forward taps to hidden input; keep numeric-only entry; add `pattern="[0-9]*"`.
- **Consensus**: Both agree on the approach (forward taps from visual cells to hidden input). **CC provides superior implementation detail** with specific ref usage, onClick handler, and className addition. Use CC's approach.

### 6. [P2] PM-090: Pass primaryColor to StickyCartBar (~lines 3553, 3580)
- **CC**: Add `primaryColor={primaryColor}` to both StickyCartBar instances. Notes the variable is already defined in scope.
- **Codex**: Same fix — pass `primaryColor={primaryColor}` to both render paths.
- **Consensus**: Identical fix. Straightforward prop addition.

## CC Only (Codex missed)
None — Codex found all 6 items.

## Codex Only (CC missed)
None — CC found all 6 items.

However, Codex provided **two additional scope insights** that CC did not:
- PM-080: i18n fallback map at ~line 515 also needs updating (not just the render site)
- PM-081: i18n fallback at ~line 516 should be cleaned up when removing the button

These are not new findings but **implementation completeness improvements** within the same fixes.

## Disputes (disagree)
None — both reviewers agree on all 6 findings, priorities, and general approach.

Minor implementation differences (not disputes):
- PM-082: CC gave detailed IIFE code, Codex was vague. → Use CC's implementation.
- PM-088: CC gave ref-based solution, Codex described conceptually. → Use CC's implementation.
- PM-080/081: Codex identified additional i18n cleanup locations. → Include Codex's additions.

## Final Fix Plan
Ordered list of all fixes to apply, with priority and source:

1. **[P1] PM-088** — Make code input cells tappable on mobile — Source: **agreed** (CC implementation) — Add useRef for hidden input, onClick handlers on visual cells, cursor-pointer class, pattern="[0-9]*"
2. **[P2] PM-079** — Remove "0000" placeholder — Source: **agreed** — Change placeholder to empty string at ~line 3444
3. **[P2] PM-080** — Shorten button text to "Отправить" — Source: **agreed + Codex enhancement** — Update both i18n fallback map (~line 515) AND render site (~line 3471)
4. **[P2] PM-081** — Remove "change table" link — Source: **agreed + Codex enhancement** — Remove button block (~lines 3473-3482) AND clean up i18n fallback (~line 516)
5. **[P2] PM-090** — Pass primaryColor to StickyCartBar — Source: **agreed** — Add prop to both instances (~lines 3553, 3580)
6. **[P3] PM-082** — Add bonus motivation text — Source: **agreed** (CC implementation) — Insert IIFE block with loyalty calculation above submit button

## Summary
- Agreed: **6 items** (100%)
- CC only: 0 items
- Codex only: 0 items
- Disputes: 0 items
- Total fixes to apply: **6**
- Implementation quality: CC provided more detailed code; Codex identified 2 additional i18n cleanup locations
- Prompt clarity: CC rated 5/5, Codex rated 4/5
