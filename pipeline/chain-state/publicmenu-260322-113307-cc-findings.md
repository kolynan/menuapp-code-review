# CC Writer Findings — PublicMenu
Chain: publicmenu-260322-113307

## Context
Task #82 part 2: Replace all hardcoded `#B5543A` (terracotta), `#9A4530` (hover), and `#F5E6E0` (light bg) with dynamic `partner.primary_color` across 5 files. Default: `#1A1A1A`.

## Findings

### Fix 1 — x.jsx: 9 hardcoded colors (8x #B5543A + 1x focus-within Tailwind)

1. **[P1] x.jsx:751 — hardcoded backgroundColor '#B5543A' on "Back to menu" button in OrderConfirmationScreen.**
   FIX: Add `primaryColor` prop to OrderConfirmationScreen (with default `'#1A1A1A'`). Replace `style={{backgroundColor:'#B5543A'}}` with `style={{backgroundColor: primaryColor}}`. In x.jsx where `<OrderConfirmationScreen>` is rendered (~line 3270), pass `primaryColor={primaryColor}`.

2. **[P1] x.jsx:770 — hardcoded color '#B5543A' on "Track order" button in OrderConfirmationScreen.**
   FIX: Replace `style={{color:'#B5543A'}}` with `style={{color: primaryColor}}` (same prop as finding #1).

3. **[P1] x.jsx:1024 — hardcoded color '#B5543A' on Loader2 spinner in OrderStatusScreen loading state.**
   FIX: OrderStatusScreen fetches its own `partner` via useQuery (line 919). Define `const primaryColor = partner?.primary_color || '#1A1A1A'` inside OrderStatusScreen. Replace `style={{color:'#B5543A'}}` with `style={{color: primaryColor}}`.

4. **[P1] x.jsx:1156 — hardcoded color '#B5543A' on Phone icon in OrderStatusScreen.**
   FIX: Replace `style={{color:'#B5543A'}}` with `style={{color: primaryColor}}` (same const from finding #3).

5. **[P1] x.jsx:1157 — hardcoded color '#B5543A' on phone number text in OrderStatusScreen.**
   FIX: Replace `style={{color:'#B5543A'}}` with `style={{color: primaryColor}}` (same const from finding #3).

6. **[P1] x.jsx:3032 — hardcoded color '#B5543A' on Loader2 spinner in main loading state (function X).**
   FIX: Define `const primaryColor = partner?.primary_color || '#1A1A1A'` inside function X() after partner is available. BUT this spinner shows BEFORE partner loads (`if (loadingPartner)`), so partner is null here. Use default `'#1A1A1A'` directly since partner isn't loaded yet. Actually, keep the same const with fallback — `primaryColor` will correctly fallback to `'#1A1A1A'` when partner is null.

7. **[P1] x.jsx:3190 — hardcoded activeColor="#B5543A" passed to CategoryChips.**
   FIX: Replace `activeColor="#B5543A"` with `activeColor={primaryColor}`. Note: BUG-PM-062 says CategoryChips ignores this prop (needs B44 prompt), but we should still pass the dynamic value so when CategoryChips is fixed, it works.

8. **[P1] x.jsx:3460 — hardcoded backgroundColor '#B5543A' on Bottom Sheet confirm button.**
   FIX: Replace `style={{ backgroundColor: '#B5543A' }}` with `style={{ backgroundColor: primaryColor }}`.

9. **[P2] x.jsx:3426 — Tailwind `focus-within:border-[#B5543A]` cannot be dynamic.**
   FIX: Replace Tailwind class with state-driven approach. Remove `focus-within:border-[#B5543A]` from className. Add `onFocus`/`onBlur` handlers to the hidden input to track focused cell index. Apply `style={{borderColor: primaryColor}}` when that cell is focused. Alternatively, since each cell div contains no focusable element itself (the real input is below), a simpler fix: use inline style with a CSS variable approach. Simplest: wrap the cell container with `style={{'--focus-color': primaryColor}}` and use Tailwind `focus-within:border-[var(--focus-color)]`. But dynamic CSS variables in Tailwind arbitrary values may not work. **Recommended approach**: Track focusedCellIndex state, apply `style={{borderColor: primaryColor}}` to the focused cell. Note: The input at line 3433 is a single input, not per-cell, so focus-within actually applies to the parent when the input is focused. Since there's only ONE input below these cells (not inside each cell div), the `focus-within` on individual cells won't fire anyway — this is actually a latent non-functional CSS. The cells just display characters; the real input is a separate element below. **Revised FIX**: Remove `focus-within:border-[#B5543A]` from cell className (it's non-functional). The visible Input at line 3433 handles actual focus styling via shadcn defaults.

### Fix 2 — CartView.jsx: 6 hardcoded colors (5x #B5543A + 1x #F5E6E0)

10. **[P1] CartView.jsx:470 — hardcoded color '#B5543A' on guest name edit button.**
    FIX: `partner` is already a prop (line 9). Define `const primaryColor = partner?.primary_color || '#1A1A1A'` at top of component body. Replace `style={{color:'#B5543A'}}` with `style={{color: primaryColor}}`.

11. **[P1] CartView.jsx:508 — hardcoded color '#B5543A' on "Get bonus" link.**
    FIX: Replace `style={{color:'#B5543A'}}` with `style={{color: primaryColor}}`.

12. **[P1] CartView.jsx:862 — hardcoded accentColor '#B5543A' on radio button (single split).**
    FIX: Replace `style={{accentColor:'#B5543A'}}` with `style={{accentColor: primaryColor}}`.

13. **[P1] CartView.jsx:872 — hardcoded accentColor '#B5543A' on radio button (all split).**
    FIX: Replace `style={{accentColor:'#B5543A'}}` with `style={{accentColor: primaryColor}}`.

14. **[P2] CartView.jsx:954 — hardcoded backgroundColor '#F5E6E0' on loyalty balance card.**
    FIX: `#F5E6E0` is the light tint of `#B5543A`. Replace with a computed light tint: define helper `lightenColor(hex, amount)` at module scope that creates a light background from primaryColor. Replace `style={{backgroundColor:'#F5E6E0'}}` with `style={{backgroundColor: lightenColor(primaryColor, 0.85)}}`. The helper should mix the color with white at the given ratio.

15. **[P1] CartView.jsx:1067 — hardcoded backgroundColor '#B5543A' on submit button.**
    FIX: Replace `style={!isSubmitting && !submitError ? {backgroundColor:'#B5543A'} : undefined}` with `style={!isSubmitting && !submitError ? {backgroundColor: primaryColor} : undefined}`.

### Fix 3 — ModeTabs.jsx: 1 hardcoded color

16. **[P1] ModeTabs.jsx:38 — hardcoded backgroundColor '#B5543A' on active tab.**
    FIX: Add `primaryColor` to component props with default `'#1A1A1A'`. Replace `style={isActive ? {backgroundColor:'#B5543A'} : undefined}` with `style={isActive ? {backgroundColor: primaryColor} : undefined}`. In x.jsx line 3165, pass `primaryColor={primaryColor}` to `<ModeTabs>`.

### Fix 4 — CheckoutView.jsx: 3 hardcoded colors

17. **[P1] CheckoutView.jsx:37 — hardcoded color '#B5543A' on "back to menu" link.**
    FIX: `partner` is already passed as prop (line 3236 of x.jsx) BUT not destructured in CheckoutView's function signature (line 7-32). Add `partner` to the destructured props. Define `const primaryColor = partner?.primary_color || '#1A1A1A'`. Replace `style={{color:'#B5543A'}}` with `style={{color: primaryColor}}`.

18. **[P1] CheckoutView.jsx:76 — hardcoded color '#B5543A' on total price display.**
    FIX: Replace `style={{color:'#B5543A'}}` with `style={{color: primaryColor}}`.

19. **[P1] CheckoutView.jsx:175 — hardcoded backgroundColor '#B5543A' on submit button.**
    FIX: Replace `style={(!isSubmitting && !submitError) ? {backgroundColor:'#B5543A'} : undefined}` with `style={(!isSubmitting && !submitError) ? {backgroundColor: primaryColor} : undefined}`.

### Fix 5 — MenuView.jsx: 11 hardcoded colors (8x #B5543A + 2x #9A4530 hover + 1x loader)

20. **[P1] MenuView.jsx:85 — hardcoded color '#B5543A' on price in list card.**
    FIX: `partner` is already a prop. Define `const primaryColor = partner?.primary_color || '#1A1A1A'` at top of component body. Replace `style={{color:'#B5543A'}}` with `style={{color: primaryColor}}`.

21. **[P1] MenuView.jsx:105-107 — hardcoded backgroundColor '#B5543A' + hover '#9A4530' on add button in list card.**
    FIX: Define `darkenColor(hex, amount)` helper at module scope. Replace:
    - `style={{backgroundColor:'#B5543A'}}` → `style={{backgroundColor: primaryColor}}`
    - `onMouseEnter={(e) => e.currentTarget.style.backgroundColor='#9A4530'}` → `onMouseEnter={(e) => e.currentTarget.style.backgroundColor=darkenColor(primaryColor, 0.15)}`
    - `onMouseLeave={(e) => e.currentTarget.style.backgroundColor='#B5543A'}` → `onMouseLeave={(e) => e.currentTarget.style.backgroundColor=primaryColor}`

22. **[P1] MenuView.jsx:166-168 — hardcoded backgroundColor '#B5543A' + hover '#9A4530' on add button in tile card.**
    FIX: Same pattern as finding #21. Replace all 3 style references.

23. **[P1] MenuView.jsx:209 — hardcoded color '#B5543A' on price in tile card.**
    FIX: Replace `style={{color:'#B5543A'}}` with `style={{color: primaryColor}}`.

24. **[P1] MenuView.jsx:238 — hardcoded backgroundColor '#B5543A' on tile layout toggle button.**
    FIX: Replace `style={mobileLayout === 'tile' ? {backgroundColor:'#B5543A'} : undefined}` with `style={mobileLayout === 'tile' ? {backgroundColor: primaryColor} : undefined}`.

25. **[P1] MenuView.jsx:250 — hardcoded backgroundColor '#B5543A' on list layout toggle button.**
    FIX: Replace `style={mobileLayout === 'list' ? {backgroundColor:'#B5543A'} : undefined}` with `style={mobileLayout === 'list' ? {backgroundColor: primaryColor} : undefined}`.

26. **[P1] MenuView.jsx:260 — hardcoded color '#B5543A' on Loader2 spinner.**
    FIX: Replace `style={{color:'#B5543A'}}` with `style={{color: primaryColor}}`.

### Additional observations

27. **[P2] OrderConfirmationScreen has no access to partner — needs prop threading.**
    OrderConfirmationScreen (x.jsx:604) doesn't receive `partner` as prop and can't compute primaryColor itself. The parent (function X) must pass `primaryColor` as a prop. This is addressed in findings #1-2.

28. **[P2] x.jsx:3032 spinner shows before partner loads — primaryColor will be default.**
    The loading spinner at line 3032 renders when `loadingPartner` is true, so `partner` is null. `primaryColor` will correctly fallback to `'#1A1A1A'`. This is acceptable behavior — the spinner shows briefly before partner data arrives.

29. **[P2] Helper functions darkenColor/lightenColor needed in MenuView.jsx and CartView.jsx.**
    `darkenColor` is needed in MenuView.jsx for hover states. `lightenColor` is needed in CartView.jsx for the loyalty balance card (#F5E6E0 replacement). These should be defined at module scope in each respective file. Alternatively, create a shared utility, but per task instructions, helpers go per-file at module scope.

## Summary
Total: 29 findings (0 P0, 22 P1, 7 P2, 0 P3)

Across 5 files:
- **x.jsx**: 9 instances (8x `#B5543A` + 1x `focus-within` Tailwind) → findings 1-9
- **CartView.jsx**: 6 instances (5x `#B5543A` + 1x `#F5E6E0`) → findings 10-15
- **ModeTabs.jsx**: 1 instance → finding 16
- **CheckoutView.jsx**: 3 instances → findings 17-19
- **MenuView.jsx**: 11 instances (8x `#B5543A` + 2x `#9A4530` + 1x loader) → findings 20-26

Key implementation notes:
- `partner` is available in x.jsx (function X), CartView.jsx (prop), MenuView.jsx (prop), CheckoutView.jsx (prop but not destructured)
- OrderConfirmationScreen needs `primaryColor` as new prop
- OrderStatusScreen fetches its own `partner` — can derive primaryColor internally
- `darkenColor` helper needed in MenuView.jsx for hover states
- `lightenColor` helper needed in CartView.jsx for `#F5E6E0` replacement
- All helpers at module scope per task instructions

## Prompt Clarity
- Overall clarity: 5
- Ambiguous Fix descriptions: Fix 6 mentions focus-within Tailwind as "NICE-TO-HAVE" but doesn't specify that the focus-within on individual cells is actually non-functional (the input is not inside the cell divs). The fix is simpler than described — just remove the class.
- Missing context: None — task description was thorough with line numbers and file references.
- Scope questions: None — scope lock was clear.
