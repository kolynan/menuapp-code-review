# CC Writer Findings — PublicMenu
Chain: publicmenu-260322-093706

## Findings

### Fix 1 — x.jsx: 9 hardcoded colors → dynamic

1. [P2] **x.jsx line 751: backgroundColor '#B5543A' in OrderConfirmationScreen "Back to menu" button** — Hardcoded terracotta color. FIX: Define `primaryColor` inside `OrderConfirmationScreen` from a new `primaryColor` prop (with default `'#1A1A1A'`). Replace `style={{backgroundColor:'#B5543A'}}` → `style={{backgroundColor: primaryColor}}`. Must also pass `primaryColor={primaryColor}` from parent at line 3270.

2. [P2] **x.jsx line 770: color '#B5543A' in OrderConfirmationScreen "Track order" button** — Same component. FIX: Replace `style={{color:'#B5543A'}}` → `style={{color: primaryColor}}`.

3. [P2] **x.jsx line 1024: Loader spinner color in OrderStatusScreen** — Hardcoded `#B5543A` on loading spinner. FIX: Add `primaryColor` prop to `OrderStatusScreen` (default `'#1A1A1A'`), replace `style={{color:'#B5543A'}}` → `style={{color: primaryColor}}`. Pass from parent at line 3290. Note: OrderStatusScreen fetches its own `partner` at line 919-925, so alternatively can use `partner?.primary_color || '#1A1A1A'` internally.

4. [P2] **x.jsx lines 1156-1157: Phone contact link colors in OrderStatusScreen** — Two hardcoded `#B5543A` on phone icon and text. FIX: Use the `partner` already loaded inside OrderStatusScreen (line 919): define `const primaryColor = partner?.primary_color || '#1A1A1A';` and replace both instances.

5. [P2] **x.jsx line 3032: Loader spinner while loading partner** — Hardcoded `#B5543A`. FIX: This spinner shows BEFORE `partner` is loaded, so `partner?.primary_color` is unavailable. Use default `'#1A1A1A'` directly: `style={{color:'#1A1A1A'}}`. This is a pre-load state so dynamic color is impossible.

6. [P2] **x.jsx line 3190: CategoryChips activeColor prop** — Hardcoded `activeColor="#B5543A"`. FIX: Replace with `activeColor={primaryColor}` where `primaryColor = partner?.primary_color || '#1A1A1A'` is defined in the main `X()` component.

7. [P2] **x.jsx line 3426: focus-within Tailwind class with hardcoded color** — `focus-within:border-[#B5543A]` cannot be dynamic at runtime. FIX: Remove the Tailwind class, add React state to track which cell has focus, apply `style={{borderColor: primaryColor}}` when focused. Alternatively, a simpler approach: since these are visual cells (not actual inputs — the real input is hidden below), replace the Tailwind class entirely with a JS-driven approach using `onFocus`/`onBlur` on the hidden input to set a `focusedCellIndex` state.

8. [P2] **x.jsx line 3460: Confirm button backgroundColor** — Hardcoded `#B5543A`. FIX: Replace `style={{ backgroundColor: '#B5543A' }}` → `style={{ backgroundColor: primaryColor }}`.

9. [P2] **x.jsx: Need to define primaryColor in main component** — No `primaryColor` variable exists yet. FIX: After `partner` is available in the main `X()` component body, add: `const primaryColor = partner?.primary_color || '#1A1A1A';`. Also define `darkenColor` and `lightenColor` helpers at module scope (before components).

### Fix 2 — CartView.jsx: 6 hardcoded colors → dynamic

10. [P2] **CartView.jsx line 470: Guest name edit button color** — Hardcoded `style={{color:'#B5543A'}}`. FIX: `partner` is already destructured in props (line 9). Define `const primaryColor = partner?.primary_color || '#1A1A1A';` at top of component. Replace with `style={{color: primaryColor}}`.

11. [P2] **CartView.jsx line 508: "Get bonus" button color** — Hardcoded `style={{color:'#B5543A'}}`. FIX: Replace with `style={{color: primaryColor}}`.

12. [P2] **CartView.jsx lines 862, 872: Radio button accentColor** — Hardcoded `style={{accentColor:'#B5543A'}}`. FIX: Replace both with `style={{accentColor: primaryColor}}`.

13. [P2] **CartView.jsx line 954: Loyalty balance background** — Hardcoded `style={{backgroundColor:'#F5E6E0'}}`. FIX: Define `lightenColor` helper. Replace with `style={{backgroundColor: lightenColor(primaryColor)}}`.

14. [P2] **CartView.jsx line 1067: Submit button backgroundColor** — Hardcoded `style={{...{backgroundColor:'#B5543A'}...}}`. FIX: Replace with `style={!isSubmitting && !submitError ? {backgroundColor: primaryColor} : undefined}`.

### Fix 3 — ModeTabs.jsx: 1 hardcoded color → dynamic via prop

15. [P2] **ModeTabs.jsx line 38: Active tab backgroundColor** — Hardcoded `style={isActive ? {backgroundColor:'#B5543A'} : undefined}`. FIX: Add `primaryColor = '#1A1A1A'` to destructured props (with default). Replace with `style={isActive ? {backgroundColor: primaryColor} : undefined}`. In x.jsx at line 3165, add `primaryColor={primaryColor}` prop.

### Fix 4 — CheckoutView.jsx: 3 hardcoded + missing partner destructuring

16. [P2] **CheckoutView.jsx: `partner` not destructured in props** — `partner` is passed from x.jsx (line 3236) but NOT in the function signature (lines 7-32). FIX: Add `partner,` to the destructured props. Define `const primaryColor = partner?.primary_color || '#1A1A1A';`.

17. [P2] **CheckoutView.jsx line 37: "Back to menu" link color** — Hardcoded `style={{color:'#B5543A'}}`. FIX: Replace with `style={{color: primaryColor}}`.

18. [P2] **CheckoutView.jsx line 76: Total price color** — Hardcoded `style={{color:'#B5543A'}}`. FIX: Replace with `style={{color: primaryColor}}`.

19. [P2] **CheckoutView.jsx line 175: Submit button backgroundColor** — Hardcoded `style={{...{backgroundColor:'#B5543A'}...}}`. FIX: Replace with dynamic `primaryColor`.

### Fix 5 — MenuView.jsx: 11 hardcoded colors (incl hover)

20. [P2] **MenuView.jsx line 85: List card price color** — Hardcoded `style={{color:'#B5543A'}}`. FIX: `partner` is already in props. Define `const primaryColor = partner?.primary_color || '#1A1A1A';` and `const primaryHover = darkenColor(primaryColor);`. Replace with `style={{color: primaryColor}}`.

21. [P2] **MenuView.jsx lines 105-107: List card "Add" button with hover** — Hardcoded backgroundColor `#B5543A` and hover `#9A4530`. FIX: Replace `style={{backgroundColor:'#B5543A'}}` → `style={{backgroundColor: primaryColor}}`, `onMouseEnter` → `e.currentTarget.style.backgroundColor=primaryHover`, `onMouseLeave` → `e.currentTarget.style.backgroundColor=primaryColor`. (Note: need to use a variable closure, not a string literal in the event handler.)

22. [P2] **MenuView.jsx lines 166-168: Tile card "Add" button with hover** — Same pattern as #21. FIX: Same replacement with `primaryColor` and `primaryHover`.

23. [P2] **MenuView.jsx line 209: Tile card price color** — Hardcoded `style={{color:'#B5543A'}}`. FIX: Replace with `style={{color: primaryColor}}`.

24. [P2] **MenuView.jsx line 238: Layout toggle "tile" button** — Hardcoded `style={mobileLayout === 'tile' ? {backgroundColor:'#B5543A'} : undefined}`. FIX: Replace with `style={mobileLayout === 'tile' ? {backgroundColor: primaryColor} : undefined}`.

25. [P2] **MenuView.jsx line 250: Layout toggle "list" button** — Same as above but for `'list'`. FIX: Same replacement.

26. [P2] **MenuView.jsx line 260: Loader spinner** — Hardcoded `style={{color:'#B5543A'}}`. FIX: Replace with `style={{color: primaryColor}}`.

### Additional findings (not in original task spec)

27. [P3] **x.jsx: OrderConfirmationScreen does not receive `primaryColor` prop** — The component is defined inline in x.jsx (line 604) and does not accept a `primaryColor` prop. The task spec says "Pass `primaryColor` as prop to `<OrderConfirmationScreen>`" but the component signature needs updating. FIX: Add `primaryColor` to destructured props with default `'#1A1A1A'`, pass from parent.

28. [P3] **x.jsx: OrderStatusScreen has its own `partner` fetch** — Lines 919-925 fetch partner independently. The 3 hardcoded colors in this sub-component (lines 1024, 1156, 1157) can use `partner?.primary_color || '#1A1A1A'` directly. No need to pass as prop — just define `primaryColor` inside the component after `partner` is loaded.

29. [P2] **Scope edge case: `#F5E6E0` in CartView.jsx line 954** — This is the "light variant" of `#B5543A`. The task says to remove all 3 color variants. FIX: Use `lightenColor(primaryColor, 0.15)` to generate a light background dynamically. Need `lightenColor` helper in CartView.jsx.

30. [P3] **x.jsx line 3032: Pre-load spinner** — This spinner displays BEFORE partner data is available (`loadingPartner` is true). Cannot use `partner?.primary_color`. FIX: Use the static default `'#1A1A1A'` here. Acceptable because the user hasn't seen any branding yet.

## Summary
Total: 30 findings (0 P0, 0 P1, 26 P2, 4 P3)

Files affected:
- **x.jsx**: 9 hardcoded colors (lines 751, 770, 1024, 1156, 1157, 3032, 3190, 3426, 3460) + need primaryColor definition + need to pass to OrderConfirmationScreen and ModeTabs
- **CartView.jsx**: 6 hardcoded colors (lines 470, 508, 862, 872, 954, 1067) — partner already in props
- **ModeTabs.jsx**: 1 hardcoded color (line 38) — needs new `primaryColor` prop
- **CheckoutView.jsx**: 3 hardcoded colors (lines 37, 76, 175) + partner not destructured in props
- **MenuView.jsx**: 11 hardcoded colors including 2 hover states (lines 85, 105-107, 166-168, 209, 238, 250, 260) — partner already in props

Helper functions needed (define at module scope in each file that uses them):
- `darkenColor(hex, percent=15)` — for hover states (MenuView.jsx)
- `lightenColor(hex, opacity=0.1)` — for light backgrounds (CartView.jsx)

Key implementation notes:
1. x.jsx main component: define `const primaryColor = partner?.primary_color || '#1A1A1A';` after partner is loaded
2. OrderConfirmationScreen: add `primaryColor` prop, pass from parent
3. OrderStatusScreen: use its own fetched `partner` to derive `primaryColor`
4. CategoryChips: already accepts `activeColor` prop — just change the passed value
5. Pre-load spinners (line 3032): use default `'#1A1A1A'` since partner isn't loaded yet
6. Focus-within on digit cells (line 3426): requires removing Tailwind class and adding React state-driven border

## Prompt Clarity
- Overall clarity: 5
- Ambiguous Fix descriptions: None — each fix has clear before/after and file locations
- Missing context: Minor — task says "9 hardcoded colors" in x.jsx but actual count is 9 (correct). Some live inside sub-components (OrderConfirmationScreen, OrderStatusScreen) defined in x.jsx, which wasn't explicitly called out.
- Scope questions: Fix 6 (focus-within) is marked NICE-TO-HAVE but requires non-trivial React state management — good that it's separated from MUST-FIX items.
