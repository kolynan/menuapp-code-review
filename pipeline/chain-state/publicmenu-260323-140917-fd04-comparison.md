# Comparison Report — PublicMenu
Chain: publicmenu-260323-140917-fd04

## Agreed (both found)

### 1. Fix 1 — PM-107 (P1): Programmatic BS close collapses entire sheet stack
Both CC and Codex confirm this regression. Both identify the same mechanism: `popOverlay` calls `history.back()`, which triggers the `popstate` handler, which closes the next sheet on the stack too.

- **CC fix:** Set `isPopStateClosingRef.current = true` BEFORE calling `history.back()` in `popOverlay`, then guard the `popstate` handler to skip processing when the flag is set (reset to false and return).
- **Codex fix:** Keep the sheet on the stack until its matching history entry is consumed, use a dedicated programmatic-back ref/flag so the next `popstate` is ignored.

**Verdict:** Both approaches use a flag to skip the popstate handler on programmatic close. CC's patch is more concrete and minimal — it reuses the existing `isPopStateClosingRef` already in the code. **Use CC's approach.**

---

### 2. Fix 2 — PM-103 (P2): Toast shows as thin line on Android
Both found this bug but with **different root cause analysis**:

- **CC analysis:** The `makeSafeT` function treats the second param as interpolation object, not fallback string. `t('menu.added_to_cart', 'Добавлено')` returns `""` because the key doesn't exist in `I18N_FALLBACKS`. Empty string → toast div has only padding/background → thin line.
  - CC fix: Add `"menu.added_to_cart": "Добавлено в корзину"` to `I18N_FALLBACKS` in x.jsx, plus add `min-h-[36px]` safety.

- **Codex analysis:** Toast at `bottom-20` is occluded by `StickyCartBar` which mounts at the same time. On 375px viewport the toast is covered → appears as thin line.
  - Codex fix: Move toast to top-center or raise z-index/bottom offset above the cart bar.

**Verdict:** These are likely **both contributing factors**. The PRIMARY cause is CC's finding: empty text makes the toast a thin line regardless of position. The SECONDARY cause is Codex's: even with text, the toast could be partially occluded by the sticky cart bar. **Apply BOTH fixes:** (1) add i18n key to fallbacks, (2) ensure toast has sufficient z-index and is positioned above StickyCartBar.

---

## CC Only (Codex missed)

### 3. Fix 3 — PM-102 (P2): Dish detail dialog button has no text
CC found the same i18n root cause: `t('menu.add_to_cart', 'Добавить в корзину')` returns empty because `menu.add_to_cart` is not in `I18N_FALLBACKS` and the second param is treated as interpolation, not fallback.

Codex did not mention this bug at all.

**Verdict:** VALID finding. Same pattern as Fix 2. **Accept — add `"menu.add_to_cart": "Добавить в корзину"` to I18N_FALLBACKS.**

---

### 4. Fix 4 — PM-108 (P2): "+" button clipped by card overflow in list-mode
CC found: The content column has fixed `h-24` (96px). When text overflows, `justify-between` compression pushes the button below the h-24 boundary, and card's `overflow-hidden` clips it.

CC fix: Change `h-24` to `min-h-[96px]` on the content column so it can grow with content.

Codex did not mention this bug.

**Verdict:** VALID finding with reasonable fix. **Accept — change `h-24` to `min-h-[96px]`.**

---

### 5. Fix 6 — PM-096 (P2): Tile stepper already 44px — ALREADY FIXED
CC confirmed tile stepper buttons are already `w-11 h-11` (44px). Codex didn't mention (implicitly agrees by omission).

**Verdict:** No action needed. Already fixed in prior КС.

---

### 6. Fix 7 — PM-discount-check (P2): discount_enabled check — ALREADY FIXED
CC confirmed all discount rendering already checks `partner?.discount_enabled && partner?.discount_percent > 0`. Codex didn't mention.

**Verdict:** No action needed. Already fixed.

---

### 7. Fix 8 — #84b (P2): discount_color — ALREADY FIXED
CC confirmed badge already uses `partner?.discount_color || '#C92A2A'`. Codex didn't mention.

**Verdict:** No action needed. Already fixed.

---

## Codex Only (CC missed)

### 8. Fix 5 — PM-104 (P3): Vaul handle hidden instead of aligned
- **CC verdict:** OUT OF SCOPE — ChevronDown is in CartView.jsx (read-only file).
- **Codex finding:** x.jsx line 3410 applies `[&>[data-vaul-handle-hitarea]]:hidden` which hides the sheet handle area entirely, sidestepping the alignment issue instead of fixing it. Task says "do NOT remove the chevron or the separator."

**Verdict:** Codex raises a valid point that x.jsx is actively hiding the handle (which is within scope), but the task description says Fix 5 is NICE-TO-HAVE (P3). The proper fix would require coordinated changes in both x.jsx (handle visibility) and CartView.jsx (chevron alignment), but CartView.jsx is read-only. **SKIP this fix** — mark as SKIPPED with note that CartView.jsx needs to be in scope to properly fix. If only x.jsx changes are desired, removing the `[data-vaul-handle-hitarea]:hidden` selector would restore the handle but won't fix the alignment.

---

## Disputes (disagree)

### Fix 2 root cause — i18n empty string vs. z-index occlusion
CC and Codex disagree on the PRIMARY root cause of the thin-line toast:
- CC: empty text from wrong i18n key usage
- Codex: positional occlusion by StickyCartBar

**Resolution:** Not a true dispute — these are complementary findings. The i18n fix is the primary fix (no text = guaranteed thin line). The positioning fix is a hardening measure. Apply both.

---

## Final Fix Plan

Ordered list of all fixes to apply, with priority and source:

1. **[P1] Fix 1 — PM-107: popOverlay cascade regression** — Source: Agreed (CC+Codex) — Add `isPopStateClosingRef = true` before `history.back()` in `popOverlay`; add early-return guard in `popstate` handler when flag is set. File: `x.jsx`.

2. **[P2] Fix 2 — PM-103: Toast thin line (i18n key)** — Source: CC (primary) + Codex (secondary) — Add `"menu.added_to_cart": "Добавлено в корзину"` to `I18N_FALLBACKS` in x.jsx. Add `min-h-[36px]` safety to toast div in MenuView.jsx. Consider raising z-index or repositioning above StickyCartBar. Files: `x.jsx`, `MenuView.jsx`.

3. **[P2] Fix 3 — PM-102: Dish detail button empty** — Source: CC only — Add `"menu.add_to_cart": "Добавить в корзину"` to `I18N_FALLBACKS` in x.jsx. File: `x.jsx`.

4. **[P2] Fix 4 — PM-108: "+" button clipped in list mode** — Source: CC only — Change `h-24` to `min-h-[96px]` on content column in `renderListCard`. File: `MenuView.jsx`.

5. **[P3] Fix 5 — PM-104: Chevron/separator misalignment** — Source: Codex only — **SKIPPED** (requires CartView.jsx which is read-only; x.jsx-only fix would be incomplete).

6. **[—] Fix 6 — PM-096** — ALREADY FIXED. No action.
7. **[—] Fix 7 — PM-discount-check** — ALREADY FIXED. No action.
8. **[—] Fix 8 — #84b** — ALREADY FIXED. No action.

---

## Summary
- **Agreed:** 2 items (Fix 1, Fix 2)
- **CC only:** 5 items (3 accepted: Fix 3, Fix 4; 3 already-fixed: Fix 6, 7, 8)
- **Codex only:** 1 item (Fix 5 — rejected/skipped, out of scope)
- **Disputes:** 0 real disputes (Fix 2 root cause = complementary, not conflicting)
- **Total fixes to apply:** 4 (Fix 1, Fix 2, Fix 3, Fix 4)
- **SKIPPED:** 1 (Fix 5 — PM-104, needs CartView.jsx in scope)
- **ALREADY FIXED:** 3 (Fix 6, Fix 7, Fix 8)
