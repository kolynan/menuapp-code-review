# CC Writer Findings — PublicMenu
Chain: publicmenu-260322-003733

## Task Context
Replace all hardcoded `#B5543A` (terracotta), `#9A4530` (hover), `#F5E6E0` (light bg) with dynamic `partner.primary_color` across all PublicMenu files.

## Findings

### x.jsx (9 occurrences of hardcoded colors)

1. [P2] **Hardcoded #B5543A on confirmation "Back to menu" button** (line 751) — `style={{backgroundColor:'#B5543A'}}` on CTA button in order confirmation view. FIX: Replace with `style={{backgroundColor: primaryColor}}`. Requires `primaryColor` derived from `partner?.primary_color || '#1A1A1A'` computed once at top of the main component or passed as prop.

2. [P2] **Hardcoded #B5543A on "Track order" button text** (line 770) — `style={{color:'#B5543A'}}` on track order link. FIX: Replace with `style={{color: primaryColor}}`.

3. [P2] **Hardcoded #B5543A on loading spinner** (line 1024) — `style={{color:'#B5543A'}}` on Loader2 in order loading state. FIX: Replace with `style={{color: primaryColor}}`. NOTE: This is inside `OrderStatusView` sub-render where `partner` may not be directly accessible — verify `partner` is in scope or pass `primaryColor` as a variable.

4. [P2] **Hardcoded #B5543A on phone contact link** (lines 1156-1157) — Two occurrences: Phone icon and phone number text both use `style={{color:'#B5543A'}}`. FIX: Replace both with `style={{color: primaryColor}}`.

5. [P2] **Hardcoded #B5543A on partner loading spinner** (line 3032) — `style={{color:'#B5543A'}}` on Loader2 before partner is loaded. FIX: This spinner shows BEFORE partner data is available, so `primaryColor` won't be set yet. Options: (a) use the default `#1A1A1A` which is fine since partner isn't loaded, or (b) leave as a neutral color like `text-slate-500`. Recommend (a) — compute `const primaryColor = partner?.primary_color || '#1A1A1A'` early, it naturally falls back.

6. [P2] **Hardcoded #B5543A in CategoryChips activeColor prop** (line 3190) — `activeColor="#B5543A"` passed to imported `<CategoryChips>`. FIX: Replace with `activeColor={primaryColor}`. NOTE: Per BUG-PM-062, CategoryChips component itself ignores this prop (needs B44 fix), but we should still pass the correct dynamic value so it works once the component is fixed.

7. [P2] **Hardcoded #B5543A in table code input focus border** (line 3426) — `focus-within:border-[#B5543A]` as Tailwind class. FIX: This is a dynamic Tailwind class that can't easily use inline styles for pseudo-state `focus-within`. Options: (a) Add inline style via onFocus/onBlur handlers, or (b) since this is a minor focus ring on an input container div, replace class with a generic `focus-within:border-slate-900` (matches #1A1A1A default). Recommend (b) for simplicity — the exact brand color on focus ring is not critical, and avoids complex JS for a CSS pseudo-state. Alternatively, wrap the focus color in a style tag with CSS variable if exact match is needed.

8. [P2] **Hardcoded #B5543A on "Confirm table" CTA button** (line 3460) — `style={{ backgroundColor: '#B5543A' }}`. FIX: Replace with `style={{ backgroundColor: primaryColor }}`.

### MenuView.jsx (10 occurrences)

9. [P2] **Hardcoded #B5543A on list card price text** (line 85) — `style={{color:'#B5543A'}}`. FIX: Replace with `style={{color: primaryColor}}`. Requires `primaryColor` to be passed as prop from x.jsx (via `partner.primary_color`) or computed from existing `partner` prop. Since `partner` is already a prop, compute locally: `const primaryColor = partner?.primary_color || '#1A1A1A';`.

10. [P2] **Hardcoded #B5543A + #9A4530 on list card "+" button** (lines 105-107) — backgroundColor and hover handlers use hardcoded colors. FIX: Replace `style={{backgroundColor:'#B5543A'}}` with `style={{backgroundColor: primaryColor}}`, and both mouse handlers with `primaryHover` (darken helper).

11. [P2] **Hardcoded #B5543A + #9A4530 on tile card "+" button** (lines 166-168) — Same pattern as #10. FIX: Same approach — `primaryColor` and `primaryHover`.

12. [P2] **Hardcoded #B5543A on tile card price text** (line 209) — `style={{color:'#B5543A'}}`. FIX: Replace with `style={{color: primaryColor}}`.

13. [P2] **Hardcoded #B5543A on "Tile" layout toggle button** (line 238) — `style={mobileLayout === 'tile' ? {backgroundColor:'#B5543A'} : undefined}`. FIX: Replace with `style={mobileLayout === 'tile' ? {backgroundColor: primaryColor} : undefined}`.

14. [P2] **Hardcoded #B5543A on "List" layout toggle button** (line 250) — Same pattern as #13. FIX: Replace with `primaryColor`.

15. [P2] **Hardcoded #B5543A on dishes loading spinner** (line 260) — `style={{color:'#B5543A'}}`. FIX: Replace with `style={{color: primaryColor}}`.

### CartView.jsx (6 occurrences)

16. [P2] **Hardcoded #B5543A on guest name edit button** (line 470) — `style={{color:'#B5543A'}}`. FIX: Replace with `style={{color: primaryColor}}`. Compute from `partner` prop already passed to CartView.

17. [P2] **Hardcoded #B5543A on "Get bonus" button** (line 508) — `style={{color:'#B5543A'}}`. FIX: Replace with `style={{color: primaryColor}}`.

18. [P2] **Hardcoded #B5543A on radio button accent color (x2)** (lines 862, 872) — `style={{accentColor:'#B5543A'}}` on split-type radio inputs. FIX: Replace both with `style={{accentColor: primaryColor}}`.

19. [P2] **Hardcoded #F5E6E0 on loyalty balance background** (line 954) — `style={{backgroundColor:'#F5E6E0'}}`. FIX: Replace with `style={{backgroundColor: primaryLight}}` using the `lightenColor(primaryColor, 0.1)` helper. This is the ONLY occurrence of `#F5E6E0` across all files.

20. [P2] **Hardcoded #B5543A on submit CTA button** (line 1067) — `style={!isSubmitting && !submitError ? {backgroundColor:'#B5543A'} : undefined}`. FIX: Replace with `style={!isSubmitting && !submitError ? {backgroundColor: primaryColor} : undefined}`.

### CheckoutView.jsx (3 occurrences)

21. [P2] **Hardcoded #B5543A on "Back to menu" link** (line 37) — `style={{color:'#B5543A'}}`. FIX: Replace with `style={{color: primaryColor}}`. Compute from `partner` prop (already passed to CheckoutView).

22. [P2] **Hardcoded #B5543A on total price text** (line 76) — `style={{color:'#B5543A'}}`. FIX: Replace with `style={{color: primaryColor}}`.

23. [P2] **Hardcoded #B5543A on submit CTA button** (line 175) — `style={(!isSubmitting && !submitError) ? {backgroundColor:'#B5543A'} : undefined}`. FIX: Replace with `style={(!isSubmitting && !submitError) ? {backgroundColor: primaryColor} : undefined}`.

### ModeTabs.jsx (1 occurrence)

24. [P2] **Hardcoded #B5543A on active tab background** (line 38) — `style={isActive ? {backgroundColor:'#B5543A'} : undefined}`. FIX: Replace with `style={isActive ? {backgroundColor: primaryColor} : undefined}`. Requires `primaryColor` to be passed as a new prop from x.jsx. ModeTabs does NOT currently receive `partner` — need to add prop.

### Architecture / Implementation Notes

25. [P1] **Helper functions and `primaryColor` need to be available across 5 files** — The `darkenColor()` and `lightenColor()` helpers plus `primaryColor`/`primaryHover`/`primaryLight` constants need to be available in x.jsx, CartView.jsx, MenuView.jsx, CheckoutView.jsx, and ModeTabs.jsx. FIX: Two approaches:
    - **(a) Prop drilling (recommended for B44):** Define helpers + compute `primaryColor`/`primaryHover`/`primaryLight` in x.jsx, pass these 3 values as props to all sub-components. Each sub-component just uses the prop values. Helpers stay in x.jsx only.
    - **(b) Each file computes locally:** Each component that receives `partner` computes `const primaryColor = partner?.primary_color || '#1A1A1A'` locally. Simpler per-file but duplicates logic and doesn't share `darkenColor`/`lightenColor`.

    Recommend **(a)**: define `darkenColor` and `lightenColor` at top of x.jsx, compute all 3 values, pass `primaryColor`, `primaryHover`, `primaryLight` as props. Sub-components use them directly.

26. [P2] **ModeTabs.jsx missing `partner` prop** — ModeTabs currently does NOT receive `partner` or any color prop. To make its active tab dynamic, need to either: (a) pass `primaryColor` as a new prop, or (b) pass full `partner` and compute locally. Recommend (a) — just add `primaryColor` prop. FIX: In x.jsx where `<ModeTabs ...>` is rendered, add `primaryColor={primaryColor}`. In ModeTabs.jsx, destructure `primaryColor` and use it.

27. [P2] **CheckoutView.jsx receives `partner` but doesn't extract color** — CheckoutView already gets `partner` prop. FIX: Add `const primaryColor = partner?.primary_color || '#1A1A1A';` at top of component, or receive `primaryColor` as dedicated prop (cleaner if using approach 25a).

## Summary
Total: 27 findings (0 P0, 1 P1, 26 P2, 0 P3)

Breakdown by file:
- x.jsx: 8 color replacements + 1 architecture (helpers + prop passing)
- MenuView.jsx: 7 color replacements (already has `partner` prop)
- CartView.jsx: 5 color replacements (already has `partner` prop)
- CheckoutView.jsx: 3 color replacements (already has `partner` prop)
- ModeTabs.jsx: 1 color replacement (needs new `primaryColor` prop)

Total hardcoded color instances to replace: **28** (`#B5543A`: 25, `#9A4530`: 2 in hover handlers, `#F5E6E0`: 1 in loyalty bg)

## Prompt Clarity
- Overall clarity: 5/5
- Ambiguous Fix descriptions: None. The task description was exceptionally detailed with exact patterns, helper code, and anti-patterns.
- Missing context: None — all relevant files, entity fields, and prior attempts were documented.
- Scope questions: Finding #7 (focus-within pseudo-class) is the only edge case not fully covered by the task spec — inline styles can't handle CSS pseudo-states directly. Recommend simple Tailwind class swap or accept minor deviation.
