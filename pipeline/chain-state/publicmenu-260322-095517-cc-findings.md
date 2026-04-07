# CC Writer Findings — PublicMenu
Chain: publicmenu-260322-095517

## Task Context
Replace hardcoded colors `#B5543A`, `#9A4530`, `#F5E6E0` with dynamic `partner.primary_color` across 5 files. Default fallback: `#1A1A1A`.

## Findings

### Fix 1 — x.jsx: 9 hardcoded `#B5543A` → dynamic primaryColor

1. [P2] **x.jsx line 751** — `style={{backgroundColor:'#B5543A'}}` on "Back to menu" button in OrderConfirmationScreen.
   FIX: OrderConfirmationScreen is a function inside x.jsx (line 604) — does NOT receive `partner` as prop. Must add `primaryColor` prop to OrderConfirmationScreen, pass it from the X() component (line 3270). Then replace `style={{backgroundColor:'#B5543A'}}` with `style={{backgroundColor: primaryColor}}`.

2. [P2] **x.jsx line 770** — `style={{color:'#B5543A'}}` on "Track order" button in OrderConfirmationScreen.
   FIX: Replace with `style={{color: primaryColor}}` (same prop as finding #1).

3. [P2] **x.jsx line 1024** — `style={{color:'#B5543A'}}` on Loader2 spinner in OrderStatusScreen.
   FIX: OrderStatusScreen (line 886) does NOT receive partner/primaryColor. Must add `primaryColor` prop. Replace with `style={{color: primaryColor}}`. Pass from X() at line 3290.

4. [P2] **x.jsx lines 1156-1157** — Two `style={{color:'#B5543A'}}` on phone icon and phone number in OrderStatusScreen contact card.
   FIX: Replace both with `style={{color: primaryColor}}` (same prop as finding #3).

5. [P2] **x.jsx line 3032** — `style={{color:'#B5543A'}}` on Loader2 spinner (partner loading state in X()).
   FIX: This is BEFORE partner is loaded (`if (loadingPartner)` block). Cannot use `partner.primary_color` here — partner data is not yet available. Use hardcoded default `#1A1A1A` instead. Or keep `#B5543A` since it's a transient loading state. **Recommend: replace with `#1A1A1A`** to match default.

6. [P2] **x.jsx line 3190** — `activeColor="#B5543A"` prop on CategoryChips component.
   FIX: Replace with `activeColor={primaryColor}`. CategoryChips already accepts `activeColor` as a prop.

7. [P2] **x.jsx line 3426** — Tailwind class `focus-within:border-[#B5543A]` on table code digit cells.
   FIX: Cannot use dynamic value in Tailwind arbitrary class. Must replace with state-driven approach: track focus state, apply `style={{borderColor: primaryColor}}` conditionally. However, this is inside a `.map()` rendering digit cells — adding focus tracking per-cell is complex. **Simpler approach**: Remove `focus-within:border-[#B5543A]` from className. Add a wrapper approach: since the actual `<Input>` is below (line 3433), and these div cells are display-only (they show `ch` characters), the focus-within triggers when the hidden input inside would be focused. Actually, these divs don't contain the input — the input is separate. So `focus-within` doesn't trigger on these divs at all. **This is a dead Tailwind class** — the `<Input>` at line 3433 is a sibling, not a child. FIX: Remove `focus-within:border-[#B5543A]` (it never fires). Optionally add dynamic border via JS when input is focused (but this is a P3 nice-to-have enhancement, not a bug).

8. [P2] **x.jsx line 3460** — `style={{ backgroundColor: '#B5543A' }}` on "Confirm table code" CTA button.
   FIX: Replace with `style={{ backgroundColor: primaryColor }}`. `primaryColor` is available in X() scope.

9. [P1] **x.jsx — primaryColor must be defined early in X()** — The main X() function (line 1224) needs `const primaryColor = partner?.primary_color || '#1A1A1A';` defined after `partner` is loaded (after line 1322 where useQuery returns partner). This variable is used throughout and passed as prop to child components.
   FIX: After line ~1322 (partner query), add: `const primaryColor = partner?.primary_color || '#1A1A1A';`

10. [P1] **x.jsx — helper functions darkenColor / lightenColor at module scope** — Needed for hover states in child components. Define before any component function.
    FIX: Add `darkenColor(hex, percent)` and `lightenColor(hex, opacity)` functions at module scope (before line 604).

### Fix 2 — CartView.jsx: 6 hardcoded colors → dynamic

11. [P2] **CartView.jsx line 470** — `style={{color:'#B5543A'}}` on guest name edit button.
    FIX: Define `const primaryColor = partner?.primary_color || '#1A1A1A';` inside CartView (partner already destructured at line 9). Replace with `style={{color: primaryColor}}`.

12. [P2] **CartView.jsx line 508** — `style={{color:'#B5543A'}}` on "Get bonus" button.
    FIX: Replace with `style={{color: primaryColor}}`.

13. [P2] **CartView.jsx line 862** — `style={{accentColor:'#B5543A'}}` on radio button (split type: single).
    FIX: Replace with `style={{accentColor: primaryColor}}`.

14. [P2] **CartView.jsx line 872** — `style={{accentColor:'#B5543A'}}` on radio button (split type: all).
    FIX: Replace with `style={{accentColor: primaryColor}}`.

15. [P2] **CartView.jsx line 954** — `style={{backgroundColor:'#F5E6E0'}}` on loyalty balance card.
    FIX: `#F5E6E0` is a light tint of `#B5543A`. Replace with `lightenColor(primaryColor, 0.1)` — need to add `lightenColor` helper at module scope. Result: `style={{backgroundColor: lightenColor(primaryColor, 0.1)}}`.

16. [P2] **CartView.jsx line 1067** — `style={!isSubmitting && !submitError ? {backgroundColor:'#B5543A'} : undefined}` on submit CTA.
    FIX: Replace `'#B5543A'` with `primaryColor`.

### Fix 3 — ModeTabs.jsx: 1 hardcoded color → dynamic via prop

17. [P2] **ModeTabs.jsx line 38** — `style={isActive ? {backgroundColor:'#B5543A'} : undefined}` on active tab.
    FIX: Add `primaryColor = '#1A1A1A'` to ModeTabs props (with default). Replace `'#B5543A'` with `primaryColor`. In x.jsx line 3165, pass `primaryColor={primaryColor}` to ModeTabs.

### Fix 4 — CheckoutView.jsx: 3 hardcoded colors + missing partner prop

18. [P1] **CheckoutView.jsx — partner prop not destructured** — `partner` is passed from x.jsx (line 3236) but NOT in CheckoutView's function signature (lines 7-32). Must add `partner` to destructured props.
    FIX: Add `partner,` to the destructured props list.

19. [P2] **CheckoutView.jsx line 37** — `style={{color:'#B5543A'}}` on "back to menu" link.
    FIX: Define `const primaryColor = partner?.primary_color || '#1A1A1A';` inside function. Replace with `style={{color: primaryColor}}`.

20. [P2] **CheckoutView.jsx line 76** — `style={{color:'#B5543A'}}` on total price text.
    FIX: Replace with `style={{color: primaryColor}}`.

21. [P2] **CheckoutView.jsx line 175** — `style={(!isSubmitting && !submitError) ? {backgroundColor:'#B5543A'} : undefined}` on submit button.
    FIX: Replace `'#B5543A'` with `primaryColor`.

### Fix 5 — MenuView.jsx: 11 hardcoded colors (incl 2x hover #9A4530)

22. [P2] **MenuView.jsx line 85** — `style={{color:'#B5543A'}}` on price text (list layout).
    FIX: Define `const primaryColor = partner?.primary_color || '#1A1A1A';` inside MenuView (partner already at line 21). Add `darkenColor` helper at module scope. Replace with `style={{color: primaryColor}}`.

23. [P2] **MenuView.jsx line 105** — `style={{backgroundColor:'#B5543A'}}` on "Add to cart" button (list layout).
    FIX: Replace with `style={{backgroundColor: primaryColor}}`.

24. [P2] **MenuView.jsx line 106** — `onMouseEnter={(e) => e.currentTarget.style.backgroundColor='#9A4530'}` (hover dark).
    FIX: Replace with `onMouseEnter={(e) => e.currentTarget.style.backgroundColor=darkenColor(primaryColor)}`.

25. [P2] **MenuView.jsx line 107** — `onMouseLeave={(e) => e.currentTarget.style.backgroundColor='#B5543A'}` (hover restore).
    FIX: Replace with `onMouseLeave={(e) => e.currentTarget.style.backgroundColor=primaryColor}`.

26. [P2] **MenuView.jsx line 166** — `style={{backgroundColor:'#B5543A'}}` on "Add to cart" button (tile layout).
    FIX: Replace with `style={{backgroundColor: primaryColor}}`.

27. [P2] **MenuView.jsx line 167** — `onMouseEnter={(e) => e.currentTarget.style.backgroundColor='#9A4530'}` (hover dark, tile).
    FIX: Replace with `onMouseEnter={(e) => e.currentTarget.style.backgroundColor=darkenColor(primaryColor)}`.

28. [P2] **MenuView.jsx line 168** — `onMouseLeave={(e) => e.currentTarget.style.backgroundColor='#B5543A'}` (hover restore, tile).
    FIX: Replace with `onMouseLeave={(e) => e.currentTarget.style.backgroundColor=primaryColor}`.

29. [P2] **MenuView.jsx line 209** — `style={{color:'#B5543A'}}` on price text (tile layout).
    FIX: Replace with `style={{color: primaryColor}}`.

30. [P2] **MenuView.jsx line 238** — `style={mobileLayout === 'tile' ? {backgroundColor:'#B5543A'} : undefined}` on layout toggle (tile).
    FIX: Replace `'#B5543A'` with `primaryColor`.

31. [P2] **MenuView.jsx line 250** — `style={mobileLayout === 'list' ? {backgroundColor:'#B5543A'} : undefined}` on layout toggle (list).
    FIX: Replace `'#B5543A'` with `primaryColor`.

32. [P2] **MenuView.jsx line 260** — `style={{color:'#B5543A'}}` on Loader2 spinner.
    FIX: Replace with `style={{color: primaryColor}}`.

### Additional Findings (not in task description)

33. [P3] **x.jsx — OrderConfirmationScreen needs primaryColor prop threading** — Task description says "Pass `primaryColor` as prop to OrderConfirmationScreen and ModeTabs" but OrderConfirmationScreen is an internal function (line 604), not an imported component. It's rendered at line 3270. Must add `primaryColor={primaryColor}` there and destructure in function signature.
    FIX: Add `primaryColor` to OrderConfirmationScreen props and render call.

34. [P3] **x.jsx — OrderStatusScreen also needs primaryColor** — Has 3 hardcoded colors (lines 1024, 1156, 1157). Not mentioned in task but within scope (all #B5543A in x.jsx). Must add `primaryColor` prop.
    FIX: Add `primaryColor` to OrderStatusScreen props and render call at line 3290.

35. [P2] **Duplicate helper functions across 3 files** — darkenColor/lightenColor defined in CartView.jsx, MenuView.jsx, and x.jsx (3 copies). Not ideal but matches task spec ("define PER FILE at module scope"). This is acceptable per task instructions but noted as tech debt.
    FIX: No fix needed per task spec. Future: extract to shared utility.

## Summary
Total: 35 findings (0 P0, 3 P1, 29 P2, 3 P3)

- **P1 findings** (3): primaryColor variable definition in X(), helper functions at module scope, CheckoutView partner prop not destructured
- **P2 findings** (29): All hardcoded color replacements across 5 files
- **P3 findings** (3): OrderConfirmationScreen/OrderStatusScreen prop threading, duplicate helpers

### Files affected:
| File | Hardcoded instances | Colors found |
|------|-------------------|--------------|
| x.jsx | 9 | #B5543A (9x) |
| CartView.jsx | 6 | #B5543A (5x), #F5E6E0 (1x) |
| ModeTabs.jsx | 1 | #B5543A (1x) |
| CheckoutView.jsx | 3 | #B5543A (3x) |
| MenuView.jsx | 11 | #B5543A (9x), #9A4530 (2x) |
| **Total** | **30** | |

### Key implementation notes:
1. **x.jsx line 3032 (loading spinner)**: partner not yet loaded → use `#1A1A1A` default directly
2. **x.jsx line 3426 (focus-within Tailwind)**: `focus-within:border-[#B5543A]` is effectively dead code — the Input is a sibling not child. Remove the class, optionally add JS-driven focus border.
3. **CheckoutView.jsx**: `partner` is passed (x.jsx line 3236) but NOT destructured — must add to function signature
4. **OrderConfirmationScreen + OrderStatusScreen**: internal functions in x.jsx, need `primaryColor` prop added
5. **CategoryChips**: external component, already accepts `activeColor` prop — just change the value

## Prompt Clarity
- Overall clarity: 4/5
- Ambiguous Fix descriptions:
  - Fix 1 says "9 hardcoded colors" but lists 8 line numbers. The 9th is line 3032 (loading spinner) which is in a different context (before partner loads). Should be explicitly mentioned.
  - Fix 1 says "Pass primaryColor as prop to OrderConfirmationScreen" — doesn't mention OrderStatusScreen which also has 3 hardcoded colors in x.jsx.
  - Fix 6 (focus-within Tailwind) — the suggested "state-driven border" approach is more complex than needed. The `focus-within` doesn't actually fire on these elements (Input is a sibling).
- Missing context: None significant — comparison doc and code were sufficient.
- Scope questions: The `#F5E6E0` color in CartView.jsx line 954 — task SCOPE LOCK mentions it but Fix 2 description doesn't list it explicitly. I included it since SCOPE LOCK says "Replace ONLY colors #B5543A, #9A4530, #F5E6E0".
