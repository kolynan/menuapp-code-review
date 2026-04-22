# CC Writer Findings — PartnerSettings
Chain: partnersettings-260323-142203-51fa

## Findings

### Fix 1 — #104 (P2): Add Discount management section to PartnerSettings UI

After analyzing PartnerSettings.jsx (2513 lines), here is the implementation plan and findings:

**1. [P2] New DiscountSection component needed — Follow existing section pattern**

The page uses a consistent pattern for each section: a standalone function component receiving `{ partner, onSave, saving, t }`. Each section has:
- A container `<div>` with `rounded-xl border bg-white p-4 sm:p-6 space-y-4 scroll-mt-20`
- A header with icon circle + `<h2>` title + `<p>` subtitle
- Fields inside
- Local state for form values, synced to `partner` via `useEffect`

FIX: Create `function DiscountSection({ partner, onSave, saving, t })` following the AppearanceSection pattern (line 480). Include:
- `useState` for `discountEnabled`, `discountPercent`, `discountColor`, `discountBadgeSize`
- `useEffect` to sync from `partner` prop when `partner.id` changes
- Section icon: `Palette` (already imported) or a percentage/tag icon — since `Percent` is not imported, use inline text "%" or import `Tag` from lucide-react. Better: import `Percent` from lucide-react.
- Disabled state: when `discountEnabled === false`, wrap fields in a div with `opacity-50 pointer-events-none` (same pattern as AppearanceSection line 500).

**2. [P2] Toggle control — Use Checkbox pattern, not Switch (Switch not imported)**

The page does NOT import `Switch` from shadcn/ui. It uses `Checkbox` for toggle-like behavior (see HallOrderingSection, line 778: `handleToggle`). The Checkbox returns `true`/`false`/`"indeterminate"`.

FIX: Use the `<Checkbox>` component for the enable/disable toggle, following the HallOrderingSection pattern:
```jsx
<Checkbox
  checked={discountEnabled}
  onCheckedChange={handleToggle}
  disabled={saving}
  className="h-6 w-6"
/>
```
Alternatively, since a toggle is more intuitive for on/off, a `<button>` styled as toggle could work. But to minimize changes and match existing patterns, use Checkbox.

**3. [P2] Discount percentage input — Needs validation (1-99)**

FIX: Use `<Input type="number" min={1} max={99}>` with `onChange` handler that clamps value. Follow the pattern from HallOrderingSection (codeLength input). Use `parseInt` and clamp:
```jsx
const handlePercentChange = (e) => {
  const val = parseInt(e.target.value, 10);
  if (!isNaN(val)) setDiscountPercent(Math.max(1, Math.min(99, val)));
};
```

**4. [P2] Color picker — Reuse PRESET_COLORS pattern from AppearanceSection**

The task says "Use the same color-picker component pattern already used on this page". AppearanceSection (line 480-527) uses a `PRESET_COLORS` array with color circles. The discount color picker should follow the same pattern but with appropriate preset colors for discount badges (reds, oranges, greens).

FIX: Create a small preset array for discount badge colors (e.g., `#C92A2A`, `#E67700`, `#2B8A3E`, `#1864AB`, `#5F3DC4`, `#D6336C`) and render the same circle-button pattern. Default: `#C92A2A`.

**5. [P2] Badge size select — Use Select component (already imported)**

FIX: Use `<Select>` component (already imported, lines 16-21) with three options:
```jsx
<Select value={discountBadgeSize} onValueChange={setDiscountBadgeSize} disabled={!discountEnabled || saving}>
  <SelectTrigger className="min-h-[44px]">
    <SelectValue />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="sm">{t('settings.discount_badge_sm', 'Маленький')}</SelectItem>
    <SelectItem value="base">{t('settings.discount_badge_base', 'Средний')}</SelectItem>
    <SelectItem value="lg">{t('settings.discount_badge_lg', 'Большой')}</SelectItem>
  </SelectContent>
</Select>
```

**6. [P2] Save function — Follow saveAppearance pattern (simplest)**

`saveAppearance` (line 2225) is the simplest save: no `saveSeq` needed since discount changes are infrequent. The save should bundle all 4 fields into a single `updateRec("Partner", ...)` call.

FIX: Add `saveDiscount` function after `saveAppearance` (line 2237):
```jsx
async function saveDiscount(data) {
  if (!partner?.id) return;
  setSavingCount(c => c + 1);
  try {
    await updateRec("Partner", partner.id, data);
    setPartner(prev => ({ ...prev, ...data }));
    showToast(t("settings.toasts.discountSaved"));
  } catch (e) {
    showError(t("settings.errors.error"), String(e?.message || e));
  } finally {
    setSavingCount(c => c - 1);
  }
}
```

**7. [P2] Section placement — After AppearanceSection in render tree**

The task specifies placing after `primary_color` section. In the render (line 2434-2439), `AppearanceSection` is rendered right after `ProfileSection`.

FIX: Add `<DiscountSection>` between `AppearanceSection` (line 2439) and `WorkingHoursSection` (line 2441):
```jsx
<DiscountSection
  partner={partner}
  onSave={saveDiscount}
  saving={saving}
  t={t}
/>
```

**8. [P1] Save button pattern — Task says "use existing global save" but each section saves independently**

Important clarification: The task says "All 4 fields save together with the existing settings save button (same handleSave)". However, analyzing the code, there is NO single global save button for sections. Each section either:
- Auto-saves on change (AppearanceSection — color click saves immediately, line 485)
- Has its own local save button (HallOrderingSection, WifiSection)

The "sticky save bar" (line 2489-2511) is ONLY for ProfileSection changes (name, logo, etc.), not for other sections.

FIX: The DiscountSection needs its own save mechanism. Two viable approaches:
- **A (recommended):** Local Save button inside the section (like WifiSection pattern) — user changes fields, clicks Save. This is safer for multi-field forms.
- **B:** Auto-save on each change (like AppearanceSection) — simpler but may cause excessive API calls when adjusting percentage.

Recommend approach A: local Save button with `hasChanges` tracking.

**9. [P2] i18n keys — Must use t() with fallback pattern**

The page uses `t('key', 'fallback')` pattern (see line 2393: `t("settings.pageTab.settings", "Настройки")`).

FIX: All new strings must use this pattern:
- `t('settings.discount.title', 'Скидки')` — section title
- `t('settings.discount.subtitle', 'Настройки скидок для меню')` — section subtitle
- `t('settings.discount_enabled', 'Включить скидку')` — toggle label
- `t('settings.discount_percent', 'Размер скидки, %')` — percent label
- `t('settings.discount_color', 'Цвет бейджа скидки')` — color label
- `t('settings.discount_badge_size', 'Размер шрифта бейджа')` — size label
- `t('settings.toasts.discountSaved', 'Скидки сохранены')` — toast

**10. [P2] Mobile-first: min-h-[44px] touch targets**

All interactive elements must have >= 44px touch targets (existing pattern: see line 2498 `min-h-[44px]`).

FIX: Ensure:
- Checkbox toggle: `className="h-6 w-6"` (24px — too small!). Use wrapper `<label>` with `min-h-[44px] flex items-center gap-3 cursor-pointer` to expand touch target.
- Color circles: `w-11 h-11` (44px ✓, same as AppearanceSection line 508)
- Select trigger: `className="min-h-[44px]"`
- Number input: `className="min-h-[44px]"`
- Save button: `className="min-h-[44px]"`

**11. [P2] Import needed — Percent icon from lucide-react**

FIX: Add `Percent` to the lucide-react import (line 25-58) for the section header icon. If Percent is not available in lucide-react, use `Tag` instead.

## Summary
Total: 11 findings (0 P0, 1 P1, 10 P2, 0 P3)

The P1 finding (#8) is critical: the task description assumes a "global save button" exists, but the page uses per-section save. The implementation must decide between auto-save or local save button pattern.

All other findings are P2 implementation guidance for building the DiscountSection correctly within the existing codebase patterns.

## ⛔ Prompt Clarity

- **Overall clarity: 4/5** — Very well-structured task with clear field specs, placement instructions, and anti-patterns. Good mini test cases.
- **Ambiguous Fix descriptions:**
  - Fix 1, "Save behavior" paragraph: says "All 4 fields save together with the existing settings save button (same handleSave or similar function already used on this page)" — this is **incorrect**. There is no single global save button. Each section saves independently. The task should specify whether to use auto-save or local-save-button pattern. This caused confusion (P1 finding #8).
- **Missing context:**
  - Whether `Percent` icon exists in the project's lucide-react version would help (minor).
  - Whether `Switch` component from shadcn is available/imported anywhere else in the codebase — currently only `Checkbox` is used on this page.
- **Scope questions:**
  - Should the `getSectionTabs` function (line 123) be updated to add a "Discounts" tab in the section navigation? The task doesn't mention it, but all other sections have a nav tab. This would be a natural addition but is technically outside the Fix 1 description.
