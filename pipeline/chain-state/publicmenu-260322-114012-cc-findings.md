# CC Writer Findings — PublicMenu
Chain: publicmenu-260322-114012

## Task Context
Replace hardcoded #B5543A / #9A4530 / #F5E6E0 with dynamic `partner.primary_color` (default `#1A1A1A`).

## Findings

### x.jsx (3597 lines, 8 instances of #B5543A)

1. [P1] x.jsx:751 — Hardcoded `backgroundColor:'#B5543A'` on "Back to menu" button in OrderConfirmationScreen. FIX: OrderConfirmationScreen does NOT receive `partner` as prop. Must add `partner` prop to OrderConfirmationScreen signature (line 604) and pass it from x.jsx:3270. Then define `const primaryColor = partner?.primary_color || '#1A1A1A'` inside OrderConfirmationScreen. Replace `style={{backgroundColor:'#B5543A'}}` with `style={{backgroundColor: primaryColor}}`.

2. [P1] x.jsx:770 — Hardcoded `color:'#B5543A'` on "Track order" ghost button in OrderConfirmationScreen. FIX: Same as above — use `style={{color: primaryColor}}` once primaryColor is defined in OrderConfirmationScreen.

3. [P1] x.jsx:1024 — Hardcoded `color:'#B5543A'` on Loader2 spinner in OrderStatusScreen loading state. FIX: OrderStatusScreen fetches its own partner data internally (line 924). Define `const primaryColor = orderPartner?.primary_color || '#1A1A1A'` (where `orderPartner` is the queried partner). Replace with `style={{color: primaryColor}}`. Note: if loading state renders BEFORE partner data is fetched, the spinner will use default #1A1A1A which is acceptable.

4. [P1] x.jsx:1156-1157 — Two hardcoded `color:'#B5543A'` on phone icon and phone text in OrderStatusScreen contact section. FIX: Same `primaryColor` from OrderStatusScreen's internal partner data. Replace both.

5. [P1] x.jsx:3032 — Hardcoded `color:'#B5543A'` on partner-loading Loader2 spinner. FIX: Partner not yet loaded at this point, so `partner?.primary_color` is undefined — default #1A1A1A will apply. Define `const primaryColor = partner?.primary_color || '#1A1A1A'` once inside function X() (after partner is available from useQuery). For the loading spinner at line 3032, partner isn't available yet — either use the #1A1A1A default directly, or accept that the loading spinner shows default color. Replace with `style={{color: primaryColor}}` where primaryColor is defined at X() scope, noting it will be '#1A1A1A' while loading.

6. [P1] x.jsx:3190 — Hardcoded `activeColor="#B5543A"` on CategoryChips prop. FIX: Replace with `activeColor={primaryColor}` (primaryColor defined in function X()).

7. [P2] x.jsx:3426 — Hardcoded Tailwind `focus-within:border-[#B5543A]` on table code input cells (Bottom Sheet). This is a Tailwind arbitrary value in className — cannot be made dynamic via className. FIX: Remove `focus-within:border-[#B5543A]` from className. Add state tracking for focused cell, apply `style={{borderColor: primaryColor}}` conditionally. Alternative simpler approach: use a CSS custom property `style={{'--primary': primaryColor}}` on the parent and replace with `focus-within:border-[var(--primary)]` — but Tailwind may not support this. Safest: add onFocus/onBlur handlers to each cell div, track focused index in state, apply `style={{borderColor: focusedIdx === idx ? primaryColor : undefined}}`. OR simplest: since the div contains an Input, use the parent container's style with CSS variable approach.

8. [P1] x.jsx:3460 — Hardcoded `backgroundColor: '#B5543A'` on the "Confirm and submit" button in Bottom Sheet. FIX: Replace with `style={{ backgroundColor: primaryColor }}`.

### CartView.jsx (1083 lines, 6 instances)

9. [P1] CartView.jsx:470 — Hardcoded `color:'#B5543A'` on guest name edit button. FIX: `partner` is already a prop (line 9). Define `const primaryColor = partner?.primary_color || '#1A1A1A'` near top of CartView function body. Replace with `style={{color: primaryColor}}`.

10. [P1] CartView.jsx:508 — Hardcoded `color:'#B5543A'` on "Get bonus" button. FIX: Replace with `style={{color: primaryColor}}`.

11. [P1] CartView.jsx:862 — Hardcoded `accentColor:'#B5543A'` on radio button (split type "single"). FIX: Replace with `style={{accentColor: primaryColor}}`.

12. [P1] CartView.jsx:872 — Hardcoded `accentColor:'#B5543A'` on radio button (split type "all"). FIX: Replace with `style={{accentColor: primaryColor}}`.

13. [P2] CartView.jsx:954 — Hardcoded `backgroundColor:'#F5E6E0'` on loyalty balance section. FIX: #F5E6E0 is a light tint of the terracotta brand color. Need a `lightenColor(hex, amount)` helper to derive a light background from primaryColor. Replace with `style={{backgroundColor: lightenColor(primaryColor, 0.85)}}` (or similar — produces a very light tint of the primary color).

14. [P1] CartView.jsx:1067 — Hardcoded `backgroundColor:'#B5543A'` on submit button. FIX: Replace with `style={!isSubmitting && !submitError ? {backgroundColor: primaryColor} : undefined}`.

### ModeTabs.jsx (83 lines, 1 instance)

15. [P1] ModeTabs.jsx:38 — Hardcoded `backgroundColor:'#B5543A'` on active mode tab. FIX: Add `primaryColor` to component props with default `'#1A1A1A'`. Replace with `style={isActive ? {backgroundColor: primaryColor} : undefined}`. In x.jsx:3165, pass `primaryColor={primaryColor}` to ModeTabs.

### CheckoutView.jsx (189 lines, 3 instances)

16. [P1] CheckoutView.jsx:37 — Hardcoded `color:'#B5543A'` on "Back to menu" link. FIX: `partner` is listed in x.jsx:3236 as a prop passed to CheckoutView but it's NOT in CheckoutView's destructured params (line 7-32). Add `partner` to destructured props. Define `const primaryColor = partner?.primary_color || '#1A1A1A'`. Replace with `style={{color: primaryColor}}`.

17. [P1] CheckoutView.jsx:76 — Hardcoded `color:'#B5543A'` on total price. FIX: Replace with `style={{color: primaryColor}}`.

18. [P1] CheckoutView.jsx:175 — Hardcoded `backgroundColor:'#B5543A'` on submit button. FIX: Replace with `style={(!isSubmitting && !submitError) ? {backgroundColor: primaryColor} : undefined}`.

### MenuView.jsx (297 lines, 11 instances incl hover colors)

19. [P1] MenuView.jsx:85 — Hardcoded `color:'#B5543A'` on list card price. FIX: `partner` is already a prop (line 21). Define `const primaryColor = partner?.primary_color || '#1A1A1A'` near top of MenuView. Need `darkenColor(hex, amount)` helper for hover states. Replace with `style={{color: primaryColor}}`.

20. [P1] MenuView.jsx:105 — Hardcoded `backgroundColor:'#B5543A'` on list card add-to-cart button. FIX: Replace with `style={{backgroundColor: primaryColor}}`.

21. [P1] MenuView.jsx:106 — Hardcoded hover `backgroundColor='#9A4530'` on mouseEnter for list card add button. FIX: Replace with `onMouseEnter={(e) => e.currentTarget.style.backgroundColor = darkenColor(primaryColor, 0.15)}`.

22. [P1] MenuView.jsx:107 — Hardcoded hover `backgroundColor='#B5543A'` on mouseLeave for list card add button. FIX: Replace with `onMouseLeave={(e) => e.currentTarget.style.backgroundColor = primaryColor}`.

23. [P1] MenuView.jsx:166 — Hardcoded `backgroundColor:'#B5543A'` on tile card add-to-cart button. FIX: Replace with `style={{backgroundColor: primaryColor}}`.

24. [P1] MenuView.jsx:167 — Hardcoded hover `backgroundColor='#9A4530'` on mouseEnter for tile card add button. FIX: Replace with `onMouseEnter={(e) => e.currentTarget.style.backgroundColor = darkenColor(primaryColor, 0.15)}`.

25. [P1] MenuView.jsx:168 — Hardcoded hover `backgroundColor='#B5543A'` on mouseLeave for tile card add button. FIX: Replace with `onMouseLeave={(e) => e.currentTarget.style.backgroundColor = primaryColor}`.

26. [P1] MenuView.jsx:209 — Hardcoded `color:'#B5543A'` on tile card price. FIX: Replace with `style={{color: primaryColor}}`.

27. [P1] MenuView.jsx:238 — Hardcoded `backgroundColor:'#B5543A'` on "Tile" layout toggle button (active state). FIX: Replace with `style={mobileLayout === 'tile' ? {backgroundColor: primaryColor} : undefined}`.

28. [P1] MenuView.jsx:250 — Hardcoded `backgroundColor:'#B5543A'` on "List" layout toggle button (active state). FIX: Replace with `style={mobileLayout === 'list' ? {backgroundColor: primaryColor} : undefined}`.

29. [P1] MenuView.jsx:260 — Hardcoded `color:'#B5543A'` on Loader2 spinner. FIX: Replace with `style={{color: primaryColor}}`.

### Cross-cutting: Helper functions needed

30. [P1] Missing helper: `darkenColor(hex, amount)` — needed in MenuView.jsx for hover states (replaces #9A4530). FIX: Add at module scope in MenuView.jsx:
```js
function darkenColor(hex, amount) {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.max(0, (num >> 16) - Math.round(255 * amount));
  const g = Math.max(0, ((num >> 8) & 0x00FF) - Math.round(255 * amount));
  const b = Math.max(0, (num & 0x0000FF) - Math.round(255 * amount));
  return `#${(r << 16 | g << 8 | b).toString(16).padStart(6, '0')}`;
}
```

31. [P1] Missing helper: `lightenColor(hex, amount)` — needed in CartView.jsx for #F5E6E0 replacement (loyalty balance background). FIX: Add at module scope in CartView.jsx:
```js
function lightenColor(hex, amount) {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.min(255, (num >> 16) + Math.round((255 - (num >> 16)) * amount));
  const g = Math.min(255, ((num >> 8) & 0x00FF) + Math.round((255 - ((num >> 8) & 0x00FF)) * amount));
  const b = Math.min(255, (num & 0x0000FF) + Math.round((255 - (num & 0x0000FF)) * amount));
  return `#${(r << 16 | g << 8 | b).toString(16).padStart(6, '0')}`;
}
```

### Prop wiring issues

32. [P1] OrderConfirmationScreen missing `partner` prop — x.jsx:3270 does not pass `partner`. FIX: Add `partner={partner}` to the JSX at line 3270. Add `partner` to the function signature at line 604. Define `primaryColor` inside the component.

33. [P1] CheckoutView.jsx missing `partner` in destructured props — partner is passed from x.jsx:3236 but NOT destructured in the function params (lines 7-32). FIX: Add `partner,` to the destructured parameter list.

34. [P1] ModeTabs.jsx missing `primaryColor` prop — currently has no color prop. FIX: Add `primaryColor = '#1A1A1A'` to destructured params. Pass `primaryColor={primaryColor}` from x.jsx:3165.

### Scope note: OrderStatusScreen (x.jsx:886)

35. [P2] OrderStatusScreen fetches its own partner data (line 924) and has 3 hardcoded #B5543A (lines 1024, 1156, 1157). The component receives `partnerId` but NOT the full partner object. Two options: (a) pass `partner` prop from x.jsx and use it; (b) since OrderStatusScreen already queries partners, extract primary_color from the query result. Option (b) is self-contained — define `const primaryColor = orderPartner?.primary_color || '#1A1A1A'` after the partner query resolves. FIX: Use option (b) for less prop drilling.

## Summary
Total: 35 findings (0 P0, 28 P1, 7 P2, 0 P3)

Breakdown by file:
- x.jsx: 8 color replacements + 2 prop additions (partner to OrderConfirmation, primaryColor to ModeTabs)
- CartView.jsx: 6 color replacements (partner already a prop)
- ModeTabs.jsx: 1 color replacement + 1 new prop
- CheckoutView.jsx: 3 color replacements + 1 prop destructure fix
- MenuView.jsx: 11 color replacements (partner already a prop)
- Helpers: darkenColor (MenuView), lightenColor (CartView)

Key risks:
- OrderConfirmationScreen doesn't receive `partner` — must be wired
- CheckoutView destructures but doesn't include `partner` — silent bug today, blocker for dynamic color
- x.jsx:3426 focus-within Tailwind class cannot be dynamic — requires state-based approach or CSS variable
- OrderStatusScreen has its own partner fetch — use internal data rather than prop drilling

## Prompt Clarity
- Overall clarity: 4
- Ambiguous Fix descriptions: Fix 6 (focus-within Tailwind) — the task says "Replace with state-driven border using style={{borderColor: primaryColor}} when focused" but doesn't specify how to track focus state for individual cells (state variable? ref?). Implementation is clear but details are light.
- Missing context: None significant — all files are accessible and the task is well-scoped.
- Scope questions: Should OrderStatusScreen (internal component in x.jsx with its own partner query) be updated? The task says "In x.jsx" but OrderStatusScreen is defined inside x.jsx. Assumed yes based on line numbers in the task (1024, 1156, 1157 are in OrderStatusScreen). Also: CategoryChips `activeColor` prop — task mentions it but BUG-PM-062 says CategoryChips ignores this prop anyway (B44 component issue). Still replacing the hardcoded value is correct.
