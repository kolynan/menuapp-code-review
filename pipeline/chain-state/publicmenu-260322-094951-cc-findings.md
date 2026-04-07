# CC Writer Findings — PublicMenu
Chain: publicmenu-260322-094951
Task: Dynamic Primary Color (#82 part 2)

## Findings

### Fix 1 — x.jsx: 9 hardcoded `#B5543A` → dynamic `primaryColor`

1. [P2] **x.jsx line 751: OrderConfirmationScreen "Back to menu" button bg** — `style={{backgroundColor:'#B5543A'}}` hardcoded on CTA button. FIX: Add `primaryColor` prop to `OrderConfirmationScreen`, use `style={{backgroundColor: primaryColor}}`. In X() component, define `const primaryColor = partner?.primary_color || '#1A1A1A'` after partner is loaded (after line ~1322), and pass `primaryColor={primaryColor}` to `<OrderConfirmationScreen>` at line 3270.

2. [P2] **x.jsx line 770: OrderConfirmationScreen "Track order" text color** — `style={{color:'#B5543A'}}` hardcoded. FIX: Use `style={{color: primaryColor}}` via the new `primaryColor` prop.

3. [P2] **x.jsx line 1024: OrderStatusScreen loading spinner** — `style={{color:'#B5543A'}}` on Loader2. FIX: Add `primaryColor` prop to `OrderStatusScreen`, use `style={{color: primaryColor}}`. Pass `primaryColor={primaryColor}` from X() at line 3290.

4. [P2] **x.jsx line 1156-1157: OrderStatusScreen phone icon + text** — Two instances of `style={{color:'#B5543A'}}` on Phone icon and phone number span. FIX: Use `style={{color: primaryColor}}` via the new `primaryColor` prop.

5. [P2] **x.jsx line 3032: Partner loading spinner** — `style={{color:'#B5543A'}}` on the main loading state. FIX: This fires BEFORE partner is loaded, so `primaryColor` is not yet available. Use the default `#1A1A1A` directly OR keep as-is since partner data isn't available yet. RECOMMENDATION: Replace with `style={{color:'#1A1A1A'}}` (the default) since we can't read `partner.primary_color` before partner loads.

6. [P2] **x.jsx line 3190: CategoryChips `activeColor` prop** — `activeColor="#B5543A"` passed to `<CategoryChips>`. FIX: Replace with `activeColor={primaryColor}`. CategoryChips already accepts this as a prop.

7. [P2] **x.jsx line 3426: Table-code digit cells `focus-within:border-[#B5543A]`** — Dynamic Tailwind class cannot be generated at runtime. FIX: Remove the Tailwind `focus-within:border-[#B5543A]` class. Instead, track focus state with a useState or use a parent-level CSS approach. Simplest: replace with inline style conditional. Since these are display-only divs (the actual input is hidden below), consider using a CSS variable approach or simply remove the focus highlight and rely on the hidden input's native focus behavior. Alternatively, use a focused index state tracked by the hidden input, and apply `style={{borderColor: primaryColor}}` to the active cell.

8. [P2] **x.jsx line 3460: Table-code submit button bg** — `style={{ backgroundColor: '#B5543A' }}`. FIX: Replace with `style={{ backgroundColor: primaryColor }}`.

### Additional finding in x.jsx (NOT in task description)

9. [P2] **x.jsx line 3032: Cannot use dynamic color before partner loads** — The loading spinner at line 3032 shows while partner is being fetched. `primaryColor` depends on `partner?.primary_color`, which is null during loading. FIX: Use the static default `'#1A1A1A'` at this location. This is a no-change-needed item if we define `primaryColor` after the loading guard.

### Fix 2 — CartView.jsx: 6 hardcoded colors → dynamic

10. [P2] **CartView.jsx line 470: Guest name edit button text color** — `style={{color:'#B5543A'}}`. FIX: Define `const primaryColor = partner?.primary_color || '#1A1A1A'` at top of CartView function (partner is already a prop). Replace with `style={{color: primaryColor}}`.

11. [P2] **CartView.jsx line 508: "Get bonus" link text color** — `style={{color:'#B5543A'}}`. FIX: Replace with `style={{color: primaryColor}}`.

12. [P2] **CartView.jsx line 862: Radio button accent for "Only me"** — `style={{accentColor:'#B5543A'}}`. FIX: Replace with `style={{accentColor: primaryColor}}`.

13. [P2] **CartView.jsx line 872: Radio button accent for "For all"** — `style={{accentColor:'#B5543A'}}`. FIX: Replace with `style={{accentColor: primaryColor}}`.

14. [P2] **CartView.jsx line 954: Loyalty balance bg `#F5E6E0`** — `style={{backgroundColor:'#F5E6E0'}}` — this is a light tint of `#B5543A`. FIX: Use `lightenColor(primaryColor, 0.15)` or similar. Define `lightenColor` helper at module scope. Replace with `style={{backgroundColor: lightenColor(primaryColor, 0.15)}}`.

15. [P2] **CartView.jsx line 1067: Submit CTA button bg** — `style={!isSubmitting && !submitError ? {backgroundColor:'#B5543A'} : undefined}`. FIX: Replace `'#B5543A'` with `primaryColor`.

### Fix 3 — ModeTabs.jsx: 1 hardcoded color → dynamic prop

16. [P2] **ModeTabs.jsx line 38: Active tab bg** — `style={isActive ? {backgroundColor:'#B5543A'} : undefined}`. FIX: Add `primaryColor = '#1A1A1A'` to component props with default. Replace `'#B5543A'` with `primaryColor`. In x.jsx, pass `primaryColor={primaryColor}` to `<ModeTabs>` at line 3165.

### Fix 4 — CheckoutView.jsx: 3 hardcoded + destructure partner

17. [P2] **CheckoutView.jsx line 37: "Back to menu" link color** — `style={{color:'#B5543A'}}`. FIX: Add `partner` to destructured props. Define `const primaryColor = partner?.primary_color || '#1A1A1A'`. Replace with `style={{color: primaryColor}}`.

18. [P2] **CheckoutView.jsx line 76: Total price color** — `style={{color:'#B5543A'}}`. FIX: Replace with `style={{color: primaryColor}}`.

19. [P2] **CheckoutView.jsx line 175: Submit button bg** — `style={(!isSubmitting && !submitError) ? {backgroundColor:'#B5543A'} : undefined}`. FIX: Replace `'#B5543A'` with `primaryColor`.

### Fix 5 — MenuView.jsx: 11 hardcoded colors including hover

20. [P2] **MenuView.jsx line 85: List-mode dish price color** — `style={{color:'#B5543A'}}`. FIX: Define `const primaryColor = partner?.primary_color || '#1A1A1A'` at top of MenuView (partner is already a prop). Also define `darkenColor` helper at module scope. Replace with `style={{color: primaryColor}}`.

21. [P2] **MenuView.jsx line 105-107: List-mode add button bg + hover** — `style={{backgroundColor:'#B5543A'}}` with `onMouseEnter` to `#9A4530` and `onMouseLeave` back to `#B5543A`. FIX: Replace bg with `primaryColor`, hover enter with `darkenColor(primaryColor)`, hover leave with `primaryColor`.

22. [P2] **MenuView.jsx line 166-168: Tile-mode add button bg + hover** — Same pattern as #21. FIX: Same replacement with `primaryColor` and `darkenColor(primaryColor)`.

23. [P2] **MenuView.jsx line 209: Tile-mode dish price color** — `style={{color:'#B5543A'}}`. FIX: Replace with `style={{color: primaryColor}}`.

24. [P2] **MenuView.jsx line 238: Layout toggle "tile" button bg** — `style={mobileLayout === 'tile' ? {backgroundColor:'#B5543A'} : undefined}`. FIX: Replace with `primaryColor`.

25. [P2] **MenuView.jsx line 250: Layout toggle "list" button bg** — `style={mobileLayout === 'list' ? {backgroundColor:'#B5543A'} : undefined}`. FIX: Replace with `primaryColor`.

26. [P2] **MenuView.jsx line 260: Loading spinner color** — `style={{color:'#B5543A'}}`. FIX: Replace with `style={{color: primaryColor}}`.

### Cross-cutting concerns

27. [P3] **Helper function duplication across files** — `darkenColor` and `lightenColor` will be duplicated in x.jsx, CartView.jsx, and MenuView.jsx. This is per task spec ("helper functions define PER FILE at module scope"). Not a bug, just noting. No fix needed — follow spec.

28. [P1] **x.jsx line 3032: Race condition — primaryColor used before partner loaded** — At line 3032 the loading spinner renders while `loadingPartner` is true. If `primaryColor` is computed from `partner?.primary_color`, it will be `'#1A1A1A'` (default) here, which is correct behavior. However, need to ensure `primaryColor` const is defined BEFORE the loading guard at line 3029, not after it. FIX: Define `const primaryColor = partner?.primary_color || '#1A1A1A'` immediately after the partner query (after line ~1322), well before the loading guard.

29. [P1] **OrderConfirmationScreen and OrderStatusScreen don't receive `partner` prop** — These internal components in x.jsx need `primaryColor` passed explicitly. `OrderConfirmationScreen` (line 604) and `OrderStatusScreen` (line 886) both have hardcoded colors but neither receives `partner` or `primaryColor`. FIX: Pass `primaryColor={primaryColor}` as a new prop to both components. Update their function signatures to accept it.

## Summary
Total: 29 findings (0 P0, 2 P1, 26 P2, 1 P3)

Breakdown by file:
- x.jsx: 9 hardcoded color instances + 2 structural issues (prop passing, timing)
- CartView.jsx: 6 instances (incl. 1 `#F5E6E0` light variant)
- ModeTabs.jsx: 1 instance
- CheckoutView.jsx: 3 instances + destructure fix
- MenuView.jsx: 11 instances (incl. 2 `#9A4530` hover variants)

Key implementation notes:
1. Define `primaryColor` in X() RIGHT AFTER the partner query (~line 1322), before any loading guards
2. `darkenColor`/`lightenColor` helpers go at MODULE SCOPE (before components) in each file that needs them
3. x.jsx line 3032 spinner: will show default `#1A1A1A` during loading — this is correct
4. CategoryChips already accepts `activeColor` prop — just change the value passed
5. ModeTabs needs a new `primaryColor` prop with default
6. CheckoutView needs `partner` destructured from existing props
7. OrderConfirmationScreen and OrderStatusScreen need new `primaryColor` prop
8. Focus-within Tailwind class at line 3426 needs state-based solution

## Prompt Clarity
- Overall clarity: 5
- Ambiguous Fix descriptions: Fix 6 (focus-within) could use more specific implementation guidance — "state-driven border" is a bit vague for a complex scenario with hidden input + multiple display divs
- Missing context: None — the comparison file and line numbers were accurate and helpful
- Scope questions: Line 3032 (pre-partner-load spinner) was not mentioned in the task fixes but contains `#B5543A` — included it as finding #5/#28
