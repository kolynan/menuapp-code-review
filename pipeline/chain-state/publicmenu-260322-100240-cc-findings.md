# CC Writer Findings — PublicMenu
Chain: publicmenu-260322-100240

## Task Context
Replace all hardcoded #B5543A / #9A4530 / #F5E6E0 with dynamic `partner.primary_color` across 5 files.

## Findings

### x.jsx (9 instances of #B5543A)

1. [P1] x.jsx:751 — OrderConfirmationScreen "Back to menu" button uses `style={{backgroundColor:'#B5543A'}}`. FIX: Define `const primaryColor = partner?.primary_color || '#1A1A1A'` inside function X(). Pass `primaryColor` prop to OrderConfirmationScreen. Inside OrderConfirmationScreen, use `style={{backgroundColor: primaryColor}}`. Note: OrderConfirmationScreen is an internal function in x.jsx (line 604), so adding primaryColor to its props is straightforward.

2. [P1] x.jsx:770 — OrderConfirmationScreen "Track order" button uses `style={{color:'#B5543A'}}`. FIX: Replace with `style={{color: primaryColor}}` using the primaryColor prop passed to OrderConfirmationScreen.

3. [P1] x.jsx:1024 — OrderStatusScreen loading spinner uses `style={{color:'#B5543A'}}`. FIX: Replace with `style={{color: primaryColor}}`. Note: OrderStatusScreen is also internal (line ~880). Pass primaryColor prop.

4. [P1] x.jsx:1156 — OrderStatusScreen phone icon uses `style={{color:'#B5543A'}}`. FIX: Replace with `style={{color: primaryColor}}`.

5. [P1] x.jsx:1157 — OrderStatusScreen phone text uses `style={{color:'#B5543A'}}`. FIX: Replace with `style={{color: primaryColor}}`.

6. [P1] x.jsx:3032 — Main loading spinner (loadingPartner) uses `style={{color:'#B5543A'}}`. FIX: Replace with `style={{color: primaryColor}}`. CAVEAT: At line 3032, partner is still loading (`loadingPartner` is true), so `partner?.primary_color` will be undefined. The fallback `'#1A1A1A'` will always apply here. This is acceptable — the loading spinner shows default brand color before partner data arrives. Define `primaryColor` BEFORE the loading return statement.

7. [P1] x.jsx:3190 — CategoryChips `activeColor="#B5543A"`. FIX: Replace with `activeColor={primaryColor}`.

8. [P2] x.jsx:3426 — Table code cells use Tailwind `focus-within:border-[#B5543A]` which CANNOT be dynamic. FIX: Remove the Tailwind class `focus-within:border-[#B5543A]` and implement with state-driven approach: track which cell index has focus, apply `style={{borderColor: primaryColor}}` when that cell is focused. Alternatively, use a simpler approach: replace the whole `className` removing the focus-within class, and add a global CSS variable or inline focus style via onFocus/onBlur handlers on the hidden input, applying borderColor to all cells when input is focused.

9. [P1] x.jsx:3460 — "Confirm table code" CTA button uses `style={{ backgroundColor: '#B5543A' }}`. FIX: Replace with `style={{ backgroundColor: primaryColor }}`.

### CartView.jsx (6 instances of #B5543A + 1 of #F5E6E0)

10. [P1] CartView.jsx:470 — Guest name edit button uses `style={{color:'#B5543A'}}`. FIX: CartView already receives `partner` as prop (line 9). Define `const primaryColor = partner?.primary_color || '#1A1A1A'` at top of component. Replace with `style={{color: primaryColor}}`.

11. [P1] CartView.jsx:508 — "Get bonus" link uses `style={{color:'#B5543A'}}`. FIX: Replace with `style={{color: primaryColor}}`.

12. [P1] CartView.jsx:862 — Radio button accent for "Only me" uses `style={{accentColor:'#B5543A'}}`. FIX: Replace with `style={{accentColor: primaryColor}}`.

13. [P1] CartView.jsx:872 — Radio button accent for "For all" uses `style={{accentColor:'#B5543A'}}`. FIX: Replace with `style={{accentColor: primaryColor}}`.

14. [P1] CartView.jsx:954 — Loyalty balance box uses `style={{backgroundColor:'#F5E6E0'}}`. FIX: #F5E6E0 is the "primary light" color derived from #B5543A. With dynamic colors, need a lightenColor helper. Define `function lightenColor(hex, amount)` at module scope. Use `style={{backgroundColor: lightenColor(primaryColor, 0.85)}}` or similar. Alternatively, use a fixed light opacity approach: `style={{backgroundColor: primaryColor + '1A'}}` (10% opacity via hex alpha). The hex alpha approach is simpler and works for any primary color.

15. [P1] CartView.jsx:1067 — Submit order button uses `style={!isSubmitting && !submitError ? {backgroundColor:'#B5543A'} : undefined}`. FIX: Replace `'#B5543A'` with `primaryColor`.

### ModeTabs.jsx (1 instance)

16. [P1] ModeTabs.jsx:38 — Active tab uses `style={isActive ? {backgroundColor:'#B5543A'} : undefined}`. FIX: Add `primaryColor` to component props with default `'#1A1A1A'`. Replace `'#B5543A'` with `primaryColor`. In x.jsx where ModeTabs is rendered (~line 3170), pass `primaryColor={primaryColor}`.

### CheckoutView.jsx (3 instances)

17. [P1] CheckoutView.jsx:37 — "Back to menu" link uses `style={{color:'#B5543A'}}`. FIX: `partner` is already passed as prop (line 3236 in x.jsx) but NOT in the destructured props of CheckoutView (line 7-32). Add `partner` to destructured props. Define `const primaryColor = partner?.primary_color || '#1A1A1A'`. Replace with `style={{color: primaryColor}}`.

18. [P1] CheckoutView.jsx:76 — Total price display uses `style={{color:'#B5543A'}}`. FIX: Replace with `style={{color: primaryColor}}`.

19. [P1] CheckoutView.jsx:175 — Submit button uses `{backgroundColor:'#B5543A'}`. FIX: Replace with `{backgroundColor: primaryColor}`.

### MenuView.jsx (11 instances: 8x #B5543A + 2x #9A4530 hover)

20. [P1] MenuView.jsx:85 — List card price uses `style={{color:'#B5543A'}}`. FIX: MenuView receives `partner` as prop. Define `const primaryColor = partner?.primary_color || '#1A1A1A'`. Replace with `style={{color: primaryColor}}`.

21. [P1] MenuView.jsx:105 — List card "+" button uses `style={{backgroundColor:'#B5543A'}}`. FIX: Replace with `style={{backgroundColor: primaryColor}}`.

22. [P1] MenuView.jsx:106 — List card "+" hover uses `e.currentTarget.style.backgroundColor='#9A4530'`. FIX: Need darkenColor helper at module scope. Replace with `e.currentTarget.style.backgroundColor=darkenColor(primaryColor, 0.15)`.

23. [P1] MenuView.jsx:107 — List card "+" mouseLeave uses `e.currentTarget.style.backgroundColor='#B5543A'`. FIX: Replace with `e.currentTarget.style.backgroundColor=primaryColor`.

24. [P1] MenuView.jsx:166 — Tile card "+" button uses `style={{backgroundColor:'#B5543A'}}`. FIX: Replace with `style={{backgroundColor: primaryColor}}`.

25. [P1] MenuView.jsx:167 — Tile card "+" hover uses `'#9A4530'`. FIX: Replace with `darkenColor(primaryColor, 0.15)`.

26. [P1] MenuView.jsx:168 — Tile card "+" mouseLeave uses `'#B5543A'`. FIX: Replace with `primaryColor`.

27. [P1] MenuView.jsx:209 — Tile card price uses `style={{color:'#B5543A'}}`. FIX: Replace with `style={{color: primaryColor}}`.

28. [P1] MenuView.jsx:238 — Layout toggle "tile" button uses `{backgroundColor:'#B5543A'}`. FIX: Replace with `{backgroundColor: primaryColor}`.

29. [P1] MenuView.jsx:250 — Layout toggle "list" button uses `{backgroundColor:'#B5543A'}`. FIX: Replace with `{backgroundColor: primaryColor}`.

30. [P1] MenuView.jsx:260 — Loading spinner uses `style={{color:'#B5543A'}}`. FIX: Replace with `style={{color: primaryColor}}`.

### Cross-file concerns

31. [P1] OrderConfirmationScreen (x.jsx:604) does NOT receive partner or primaryColor. FIX: Add `primaryColor` to its props (line 604-616). Pass `primaryColor={primaryColor}` at line 3270.

32. [P1] OrderStatusScreen (x.jsx:~880) does NOT receive partner or primaryColor. FIX: Add `primaryColor` to its props. Pass `primaryColor={primaryColor}` at line 3290.

33. [P2] Helper functions darkenColor / lightenColor needed. FIX: Define at module scope in each file that needs them. Recommended implementation:
```js
function darkenColor(hex, amount) {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.max(0, Math.min(255, (num >> 16) - Math.round(255 * amount)));
  const g = Math.max(0, Math.min(255, ((num >> 8) & 0x00FF) - Math.round(255 * amount)));
  const b = Math.max(0, Math.min(255, (num & 0x0000FF) - Math.round(255 * amount)));
  return `#${(r << 16 | g << 8 | b).toString(16).padStart(6, '0')}`;
}
```
Files needing darkenColor: MenuView.jsx (for hover states).
Files needing lightenColor: CartView.jsx (for #F5E6E0 replacement at line 954). Alternative: use hex alpha `primaryColor + '1A'`.

34. [P2] CategoryChips component (imported from refactor/) accepts `activeColor` prop. Verify that CategoryChips actually uses this prop for styling. If it ignores it (per BUG-PM-062 in BUGS.md mentioning "issue is inside imported component"), passing primaryColor won't fix the chip color — this is a separate bug outside scope.

35. [P1] CheckoutView.jsx destructured props are missing `partner`. Partner IS passed from x.jsx (line 3236) but the function signature (line 7-32) does not destructure it. FIX: Add `partner,` to the destructured props list. Without this, `partner` is undefined inside CheckoutView and `primaryColor` will always fallback to `'#1A1A1A'`.

## Summary
Total: 35 findings (0 P0, 30 P1, 5 P2, 0 P3)

Breakdown by file:
- x.jsx: 9 color replacements + 2 prop additions (OrderConfirmationScreen, OrderStatusScreen)
- CartView.jsx: 6 color replacements (including #F5E6E0) + helper function
- ModeTabs.jsx: 1 color replacement + prop addition
- CheckoutView.jsx: 3 color replacements + destructure fix
- MenuView.jsx: 11 color replacements + darkenColor helper
- Cross-file: helper functions, prop threading

Key risks:
- Finding #6 (loading spinner at line 3032): primaryColor defaults to #1A1A1A while loading — acceptable behavior
- Finding #8 (focus-within Tailwind): cannot be dynamic, needs state-driven approach
- Finding #34 (CategoryChips): may not use activeColor prop internally (known BUG-PM-062)
- Finding #35 (CheckoutView props): partner not destructured — will silently use fallback color

## Prompt Clarity
- Overall clarity: 5
- Ambiguous Fix descriptions: Fix 6 — the focus-within approach is described but the exact implementation is left open (state tracking vs onFocus/onBlur on input). Both are valid but specificity would help.
- Missing context: None significant. All file paths, line numbers, and color values were accurately described.
- Scope questions: Fix 6 is labeled NICE-TO-HAVE but involves a real Tailwind limitation — it should probably be P2 not optional. Also, #F5E6E0 is mentioned in SCOPE LOCK but not explicitly called out in Fix 2 for CartView (it appears at line 954).
