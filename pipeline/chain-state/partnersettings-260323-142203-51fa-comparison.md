# Comparison Report — PartnerSettings
Chain: partnersettings-260323-142203-51fa

## Agreed (both found)

### 1. Discount section is completely missing — needs new DiscountSection component
- **CC**: Finding #1 — detailed plan for `DiscountSection` component following `AppearanceSection` pattern, with `useState`, `useEffect` sync, section placement after AppearanceSection (line 2439).
- **Codex**: Finding #1 — section missing from `getSectionTabs()`, render flow jumps from AppearanceSection to WorkingHoursSection, no `discount_` bindings exist.
- **Confidence**: HIGH — both agree the entire section needs to be built from scratch.
- **Best approach**: CC's detailed component plan (Finding #1) with all sub-findings (#2-#7, #9-#11) as implementation guidance.

### 2. Save path does not exist — no global save covers discount fields
- **CC**: Finding #8 (P1) — explicitly flags that the task description assumes a "global save button" but the page uses per-section saves. `saveProfile()` only saves name/address/logo, `saveAppearance()` only saves `primary_color`. Recommends local Save button (approach A).
- **Codex**: Finding #2 (P2) — same observation: sticky save button calls `saveProfile()` which only persists profile fields; `saveAppearance()` only updates `primary_color`. Discount fields would not be saved.
- **Confidence**: HIGH — both independently confirmed the task's "use existing save" instruction is inaccurate.
- **Best approach**: CC's recommendation — local Save button inside DiscountSection (like WifiSection pattern). This is safer for a multi-field form than auto-save.

## CC Only (Codex missed)

### 3. Toggle control — Use Checkbox, not Switch (CC #2)
- CC noted `Switch` is not imported, recommends `Checkbox` following HallOrderingSection pattern.
- **Valid**: Yes — important implementation detail. Codex didn't specify which component to use.
- **Accept**: YES

### 4. Discount percentage validation 1-99 (CC #3)
- CC provided clamping logic with `parseInt` and `Math.max/Math.min`.
- **Valid**: Yes — required by task spec, important for data integrity.
- **Accept**: YES

### 5. Color picker — Reuse PRESET_COLORS pattern (CC #4)
- CC specified using same circle-button pattern from AppearanceSection with discount-appropriate presets.
- **Valid**: Yes — follows task instruction to match existing color picker pattern.
- **Accept**: YES

### 6. Badge size select — Use Select component (CC #5)
- CC provided complete JSX for Select with 3 options and i18n keys.
- **Valid**: Yes — Select is already imported, clean implementation.
- **Accept**: YES

### 7. Save function implementation (CC #6)
- CC provided complete `saveDiscount` function following `saveAppearance` pattern with `updateRec`, state update, toast.
- **Valid**: Yes — concrete implementation needed.
- **Accept**: YES

### 8. i18n keys catalog (CC #9)
- CC listed all required i18n keys with fallback strings in the `t('key', 'fallback')` pattern.
- **Valid**: Yes — essential for i18n compliance.
- **Accept**: YES

### 9. Mobile-first touch targets (CC #10)
- CC identified Checkbox is only 24px (too small), needs wrapper label with min-h-[44px]. Color circles 44px OK. Select/Input/Button all need min-h-[44px].
- **Valid**: Yes — mandatory per task spec and Base44 rules.
- **Accept**: YES

### 10. Import Percent icon (CC #11)
- CC noted need to import `Percent` from lucide-react for section header.
- **Valid**: Yes — minor but needed for the section icon.
- **Accept**: YES

## Codex Only (CC missed)

### 11. getSectionTabs() needs update (Codex #1, scope question)
- Codex mentioned `getSectionTabs()` (line 123) has no discounts entry.
- CC also noted this in the Prompt Clarity section as a scope question but did NOT include it as a finding.
- **Valid**: YES — all other sections have nav tabs. Adding a tab is natural and expected for discoverability.
- **Accept**: YES — add "Discounts" tab entry to `getSectionTabs()`.

## Disputes (disagree)

### Save approach: local button vs wiring into existing save
- **CC**: Recommends local Save button (approach A, like WifiSection). Rates this P1.
- **Codex**: Says "wire into the intended existing save flow" (P2) — suggesting extending saveProfile or similar.
- **Resolution**: CC's approach is better. There IS no single existing save flow that covers all sections — each section saves independently. Creating a local save button follows the established pattern (WifiSection, HallOrderingSection). Wiring into saveProfile would break that function's single responsibility. **Use CC's approach: local Save button.**

## Final Fix Plan

Ordered list of all fixes to apply:

1. **[P2] Import Percent icon** — Source: CC #11 — Add `Percent` to lucide-react imports
2. **[P2] Create DiscountSection component** — Source: agreed (CC #1 + Codex #1) — New function component following AppearanceSection pattern with useState/useEffect sync
3. **[P2] Toggle: Checkbox for discount_enabled** — Source: CC #2 — Use Checkbox with label wrapper for 44px touch target
4. **[P2] Number input: discount_percent with 1-99 validation** — Source: CC #3 — Input type=number with clamping
5. **[P2] Color picker: discount_color with PRESET_COLORS** — Source: CC #4 — Circle-button pattern matching AppearanceSection
6. **[P2] Select: discount_badge_size with 3 options** — Source: CC #5 — Select component with sm/base/lg
7. **[P2] All i18n keys with t('key', 'fallback') pattern** — Source: CC #9 — Full key catalog provided
8. **[P1] Save function: local saveDiscount with own Save button** — Source: agreed (CC #8 + Codex #2) — Local save button pattern (WifiSection), NOT global save. updateRec with all 4 fields.
9. **[P2] Disabled state when discount_enabled=false** — Source: agreed — opacity-50 + pointer-events-none on dependent fields
10. **[P2] Mobile-first: min-h-[44px] on all interactive elements** — Source: CC #10 — Touch targets >= 44px
11. **[P2] Section placement after AppearanceSection in render** — Source: agreed (CC #7 + Codex #1) — Between AppearanceSection and WorkingHoursSection
12. **[P2] Add "Discounts" tab to getSectionTabs()** — Source: Codex scope observation — Nav tab for discoverability

## Summary
- Agreed: 2 items (section missing + save path missing)
- CC only: 8 items (8 accepted, 0 rejected) — implementation details Codex didn't specify
- Codex only: 1 item (1 accepted, 0 rejected) — getSectionTabs update
- Disputes: 1 item (save approach — resolved in favor of CC's local button)
- **Total fixes to apply: 12**
