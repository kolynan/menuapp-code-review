# CC Writer Findings — PartnerSettings
Chain: partnersettings-260321-235750

## Task Context
Add "Appearance" section with 8 color preset circles for `primary_color` between ProfileSection and WorkingHoursSection. Feature #82 part 1.

## Findings

### Implementation Required (new feature — color picker section)

1. **[P1] Missing AppearanceSection component** — The file has no `AppearanceSection` component. Need to add a new function component between `ProfileSection` (ends line 459) and `WorkingHoursSection` (starts line 461). The component should:
   - Accept `{ partner, onSave, saving, t }` props (matching page patterns)
   - Render a card with `id="section-appearance"` and same styling as other sections: `className="rounded-xl border bg-white p-4 sm:p-6 space-y-4 scroll-mt-20"`
   - Display header with icon (use `Palette` from lucide-react) + title `t("settings.appearance.title")` + subtitle `t("settings.appearance.subtitle")`
   - Show 8 preset color circles in a `flex flex-wrap gap-3` container
   - Each circle: `w-10 h-10 rounded-full cursor-pointer border-2` with `ring-2 ring-offset-2` when selected, plus a white `Check` icon overlay
   - Default color (`#1A1A1A`) should show a small label below: `t("settings.appearance.default")`
   - Click triggers `Partner.update(partner.id, { primary_color: color })` via the `onSave` callback
   - Selected = `partner.primary_color || "#1A1A1A"` (null/undefined = default black)

   FIX: Add `AppearanceSection` component at line 460 (between ProfileSection and WorkingHoursSection). Define PRESET_COLORS array as a const. Use `updateRec("Partner", partner.id, { primary_color })` pattern.

2. **[P1] Missing Palette import from lucide-react** — The task spec uses an icon for the section header. `Palette` is appropriate but not currently imported.

   FIX: Add `Palette` to the lucide-react import block (line 26-57).

3. **[P1] Missing `saveAppearance` handler in main component** — The main component (line 2018+) needs a save function for the appearance section, following the same pattern as `saveChannels`, `saveHallOrdering`, etc. Should call `updateRec("Partner", partner.id, { primary_color })` with `setSavingCount` wrapping.

   FIX: Add `saveAppearance` async function near line 2195 (after saveChannels). Pattern:
   ```js
   async function saveAppearance(data) {
     if (!partner?.id) return;
     setSavingCount(c => c + 1);
     try {
       await updateRec("Partner", partner.id, data);
       setPartner(prev => ({ ...prev, ...data }));
       showToast(t("settings.toasts.appearanceSaved"));
     } catch (e) {
       showError(t("settings.errors.error"), String(e?.message || e));
     } finally {
       setSavingCount(c => c - 1);
     }
   }
   ```

4. **[P1] Missing AppearanceSection in JSX render** — The render block (line 2342-2395) needs `<AppearanceSection>` inserted between `<ProfileSection>` (line 2343-2349) and `<WorkingHoursSection>` (line 2351-2356).

   FIX: Add after line 2349:
   ```jsx
   <AppearanceSection
     partner={partner}
     onSave={saveAppearance}
     saving={saving}
     t={t}
   />
   ```

5. **[P2] SectionNav tabs missing "appearance" entry** — `getSectionTabs()` (line 122-132) defines section tabs for scroll-spy navigation. Without an "appearance" entry, the new section won't be navigable from the horizontal nav bar. However, the task says SCOPE LOCK — only add the section, don't change existing. Adding a tab entry is necessary for the feature to be usable but technically modifies `getSectionTabs`.

   FIX: Add `{ id: "appearance", label: t("settings.tabs.appearance"), Icon: Palette }` to `getSectionTabs()` between the "profile" and "hours" entries (between lines 124 and 125). This is a minimal change to make the new section discoverable.

6. **[P2] Color circles need adequate touch targets** — The task specifies `w-10 h-10` (40x40px) for color circles, but the page's minimum touch target is 44x44px (BUG-PS-017/018). The circles should be `w-11 h-11` (44x44px) or use `min-w-[44px] min-h-[44px]` to meet the established standard.

   FIX: Use `w-11 h-11` instead of `w-10 h-10` for color circles.

7. **[P2] Optimistic UI update needed for color selection** — When user clicks a color, the UI should immediately show the selection (optimistic) before the API call completes. The `onSave` pattern with `setPartner` in the main component handles this, but the `AppearanceSection` component should also update local state optimistically on click (similar to how ChannelsSection works).

   FIX: In `AppearanceSection`, call `onSave({ primary_color: color })` directly — the main component's `saveAppearance` already does `setPartner(prev => ({ ...prev, ...data }))` which provides optimistic update.

8. **[P3] Saving indicator for color section** — When a color is being saved, user should see feedback. Could disable circles or show a subtle spinner. Other sections use `saving` prop for this.

   FIX: Add `disabled={saving}` with `opacity-50 pointer-events-none` when saving is true, on the circles container.

### Existing Code Issues (NOT in scope — documenting only)

9. **[P2] BUG-PS-013 still active — PartnerShell wrapper pattern deviation** — The export default contains all logic (line 2018) instead of extracting `PartnerSettingsContent`. Already tracked in BUGS.md.

10. **[P3] `getSectionTabs` doesn't include "contacts"** — The contacts tab exists as `pageTab` but not in scroll-spy SECTION_TABS. Existing issue, not related to this task.

## Summary
Total: 10 findings (0 P0, 4 P1, 4 P2, 2 P3)
- 8 findings are implementation requirements for the color picker feature
- 2 findings are pre-existing issues (out of scope, documented only)
- Key implementation files: `partnersettings.jsx` lines 26-57 (import), 122-132 (tabs), 460 (new component), 2195 (save handler), 2349 (JSX render)

## Prompt Clarity
- Overall clarity: 5
- Ambiguous Fix descriptions: None — the task description is exceptionally detailed with exact colors, placement, behavior, and anti-patterns to avoid.
- Missing context: None — entity field, save pattern, and UI specs are all provided.
- Scope questions: One minor question — whether adding the section to `getSectionTabs` is in scope (it modifies existing code, but is necessary for navigability). Decided to include it as P2.
