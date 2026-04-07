# Comparison Report — PublicMenu
Chain: publicmenu-260322-204901-9d4e

## Agreed (both found)

### 1. [P1] Hardcoded Russian fallback in toast (PM-091)
- **CC:** Replace `|| 'Добавлено'` with `t('menu.added_to_cart', 'Добавлено')` two-arg pattern. Line 369.
- **Codex:** Same fix — two-argument `t()` pattern, remove `||`.
- **Verdict:** AGREED. Identical fix. HIGH confidence.

### 2. [P2] Touch targets below 44px on list-mode stepper buttons (PM-092)
- **CC:** Add `min-w-[44px] min-h-[44px] flex items-center justify-center` to both stepper buttons (lines 161-165, 168-172). Keep icon `w-4 h-4`.
- **Codex:** Same fix — `min-w-[44px] min-h-[44px] flex items-center justify-center` or `w-11 h-11`.
- **Verdict:** AGREED. Identical fix. HIGH confidence.

### 3. [P2] No onError fallback for list-mode dish images (PM-093)
- **CC:** Add `onError` handler to hide broken image; parent `bg-slate-100` serves as fallback. Lines 92-97.
- **Codex:** Same approach — `onError` handler hides image, placeholder becomes visible. Keep `loading="lazy"`.
- **Verdict:** AGREED. Same approach. HIGH confidence.

### 4. [P3] Missing aria-labels on list-mode buttons (PM-094)
- **CC:** Add `aria-label={t('menu.add')}` to add button (line 150) and plus stepper (line 168). Add `aria-label={t('menu.remove')}` to minus stepper (line 161).
- **Codex:** Identical — same three buttons, same i18n keys matching tile-mode pattern.
- **Verdict:** AGREED. Identical fix. HIGH confidence.

### 5. [P2] No onError fallback for tile-mode dish images (PM-095)
- **CC:** Add `onError` handler same as list mode. Lines 195-200.
- **Codex:** Same fix — `onError` to hide image and show placeholder.
- **Verdict:** AGREED. Identical fix. HIGH confidence.

## CC Only (Codex missed)

### 6. [P2] Tile-mode stepper buttons below 44px (out-of-scope note)
- **CC flagged** tile stepper buttons (w-8 h-8 = 32px) as below 44px minimum.
- **CC correctly marked this OUT OF SCOPE** per SCOPE LOCK (PM-091-095 only).
- **Codex:** Did not mention this.
- **Verdict:** NOTED but NOT included in fix plan. Correct per scope lock. Should be recorded in BUGS_MASTER.md separately.

## Codex Only (CC missed)

None. Codex found the same 5 in-scope issues.

## Disputes (disagree)

None. Both AI agree on all 5 findings and their fixes.

## Final Fix Plan

Ordered list of fixes to apply:

1. **[P1] PM-091 — Hardcoded Russian toast fallback** — Source: AGREED — Replace `{t('menu.added_to_cart') || 'Добавлено'}` with `{t('menu.added_to_cart', 'Добавлено')}` at line 369.
2. **[P2] PM-092 — List-mode stepper touch targets** — Source: AGREED — Add `min-w-[44px] min-h-[44px] flex items-center justify-center` to minus button (lines 161-165) and plus button (lines 168-172). Keep icon `w-4 h-4`.
3. **[P2] PM-093 — List-mode dish image onError** — Source: AGREED — Add `onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.style.display = 'none'; }}` to `<img>` at lines 92-97.
4. **[P2] PM-095 — Tile-mode dish image onError** — Source: AGREED — Add same `onError` handler to `<img>` at lines 195-200.
5. **[P3] PM-094 — List-mode aria-labels** — Source: AGREED — Add `aria-label={t('menu.add')}` to add button (line 150) and plus stepper (line 168). Add `aria-label={t('menu.remove')}` to minus stepper (line 161).

## Summary
- Agreed: 5 items
- CC only: 1 item (0 accepted — out of scope, 1 noted)
- Codex only: 0 items
- Disputes: 0 items
- **Total fixes to apply: 5**
