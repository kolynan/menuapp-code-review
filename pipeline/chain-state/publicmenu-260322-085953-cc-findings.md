# CC Writer Findings — PublicMenu
Chain: publicmenu-260322-085953

## Task: Dynamic primary_color (#82 part 2)

Replace all hardcoded `#B5543A` / `#9A4530` / `#F5E6E0` with dynamic `partner.primary_color`.

---

## Inventory of Hardcoded Colors

### x.jsx (9 occurrences)
| Line | Color | Context |
|------|-------|---------|
| 751 | `#B5543A` | OrderConfirmationScreen "Back to menu" button `backgroundColor` |
| 770 | `#B5543A` | OrderConfirmationScreen "Track order" button `color` |
| 1024 | `#B5543A` | OrderStatusScreen loading spinner `color` |
| 1156 | `#B5543A` | OrderStatusScreen phone icon `color` |
| 1157 | `#B5543A` | OrderStatusScreen phone text `color` |
| 3032 | `#B5543A` | Main page loading spinner `color` |
| 3190 | `#B5543A` | CategoryChips `activeColor` prop |
| 3426 | `#B5543A` | Table code input cell `focus-within:border-[#B5543A]` (Tailwind) |
| 3460 | `#B5543A` | Confirm table code button `backgroundColor` |

### CartView.jsx (6 occurrences)
| Line | Color | Context |
|------|-------|---------|
| 470 | `#B5543A` | Edit guest name link `color` |
| 508 | `#B5543A` | "Get bonus" link `color` |
| 862 | `#B5543A` | Radio button (split single) `accentColor` |
| 872 | `#B5543A` | Radio button (split all) `accentColor` |
| 954 | `#F5E6E0` | Loyalty balance box `backgroundColor` |
| 1067 | `#B5543A` | Submit order button `backgroundColor` |

### MenuView.jsx (10 occurrences)
| Line | Color | Context |
|------|-------|---------|
| 85 | `#B5543A` | Price text (list mode) `color` |
| 105 | `#B5543A` | Add-to-cart button (list) `backgroundColor` |
| 106 | `#9A4530` | Add button hover-enter (list) |
| 107 | `#B5543A` | Add button hover-leave (list) |
| 166 | `#B5543A` | Add-to-cart button (tile) `backgroundColor` |
| 167 | `#9A4530` | Add button hover-enter (tile) |
| 168 | `#B5543A` | Add button hover-leave (tile) |
| 209 | `#B5543A` | Price text (tile mode) `color` |
| 238 | `#B5543A` | Layout toggle "tile" active `backgroundColor` |
| 250 | `#B5543A` | Layout toggle "list" active `backgroundColor` |
| 260 | `#B5543A` | Loading spinner `color` |

### ModeTabs.jsx (1 occurrence)
| Line | Color | Context |
|------|-------|---------|
| 38 | `#B5543A` | Active mode tab `backgroundColor` |

### CheckoutView.jsx (3 occurrences)
| Line | Color | Context |
|------|-------|---------|
| 37 | `#B5543A` | "Back to menu" link `color` |
| 76 | `#B5543A` | Total price `color` |
| 175 | `#B5543A` | Submit button `backgroundColor` |

**Total: 29 hardcoded color occurrences across 5 files.**

---

## Findings

### 1. [P1] CheckoutView lacks `partner` prop — cannot read `primary_color`
CheckoutView.jsx does NOT receive `partner` in its props (verified: props list lines 7-32). It has 3 hardcoded `#B5543A` references. To make these dynamic, either:
- (a) Add `partner` as a new prop and pass it from x.jsx, or
- (b) Pass a `primaryColor` string prop directly.
Option (b) is simpler and avoids expanding the prop surface unnecessarily.

**FIX:** Add `primaryColor` prop to CheckoutView. In x.jsx where `<CheckoutView` is rendered, add `primaryColor={primaryColor}`. Replace all 3 hardcoded colors inside CheckoutView with the prop.

### 2. [P1] ModeTabs lacks `partner` prop — cannot read `primary_color`
ModeTabs.jsx does NOT receive `partner` in its props (line 3-17). It has 1 hardcoded `#B5543A` on line 38.

**FIX:** Add `primaryColor` prop to ModeTabs. Pass from x.jsx. Replace `style={isActive ? {backgroundColor:'#B5543A'} : undefined}` with `style={isActive ? {backgroundColor: primaryColor} : undefined}`.

### 3. [P1] OrderConfirmationScreen needs `primaryColor` prop
OrderConfirmationScreen (defined in x.jsx ~line 604) receives specific props but not partner or color. It has 2 hardcoded `#B5543A` references (lines 751, 770).

**FIX:** Add `primaryColor` to its props destructuring. Pass from the caller. Replace both inline styles.

### 4. [P1] OrderStatusScreen has its own `partner` query — can self-derive color
OrderStatusScreen (x.jsx ~line 886) loads `partner` via its own useQuery (line 919). It has 3 hardcoded `#B5543A` references (lines 1024, 1156, 1157). The loading spinner at line 1024 renders BEFORE partner data is available, so it needs a fallback.

**FIX:** Inside OrderStatusScreen, add `const primaryColor = partner?.primary_color || '#1A1A1A';`. Replace 3 occurrences. For the loading spinner (line 1024), use the default `#1A1A1A` since partner isn't loaded yet.

### 5. [P2] Tailwind dynamic class `focus-within:border-[#B5543A]` cannot use inline styles
Line 3426 in x.jsx uses `focus-within:border-[#B5543A]` as a Tailwind arbitrary value class. Inline styles cannot express `:focus-within` pseudo-class.

**FIX:** Replace the Tailwind class approach with onFocus/onBlur handlers on the parent, or use a CSS variable set via inline style on a wrapper. Simplest: remove the Tailwind class and add `onFocusCapture`/`onBlurCapture` handlers that set `borderColor` via state or ref. Alternatively, keep a neutral Tailwind focus class like `focus-within:border-slate-500` and accept slightly less dynamic behavior for this minor UI detail.

### 6. [P2] `darkenColor` helper edge case with very dark colors
The proposed `darkenColor` function subtracts a fixed amount (`255 * percent / 100`) from each RGB channel. With the default `#1A1A1A` (RGB 26,26,26), darkening by 15% subtracts ~38 from each channel, clamping to 0 → result is `#000000`. This is technically correct (darker than near-black = black) but produces no visible hover effect for dark colors.

**FIX:** Consider using multiplicative darkening instead: `Math.round(channel * (1 - percent/100))`. For `#1A1A1A` this gives RGB(22,22,22) = `#161616`, still very subtle. For dark defaults, the hover difference will be minimal regardless — acceptable behavior. Alternatively, for very dark colors, lighten on hover instead of darken (invert the strategy). But this is a P2 edge case — the simple approach is fine for most brand colors.

### 7. [P2] MenuView hover handlers use hardcoded `#9A4530`
MenuView.jsx lines 106-107 and 167-168 use `onMouseEnter/Leave` with hardcoded `#9A4530` (the darken variant). These need to use the `darkenColor` helper result. Since MenuView receives `partner` as a prop, it can compute the hover color.

**FIX:** Inside MenuView, compute:
```js
const primaryColor = partner?.primary_color || '#1A1A1A';
const primaryHover = darkenColor(primaryColor);
```
Replace all `'#9A4530'` with `primaryHover` and all `'#B5543A'` with `primaryColor`.
Note: `darkenColor` helper must be importable by MenuView — either define it in a shared location or pass `primaryColor` and `primaryHover` as props. Simplest: pass as props from x.jsx.

### 8. [P2] CartView `#F5E6E0` (light variant) needs `lightenColor` helper
Line 954 in CartView.jsx uses `#F5E6E0` (a light terracotta background for loyalty balance). This needs `lightenColor(primaryColor)`.

**FIX:** CartView receives `partner` prop. Compute `const primaryLight = lightenColor(primaryColor);` inside CartView, or receive it as a prop. Replace `style={{backgroundColor:'#F5E6E0'}}` with `style={{backgroundColor: primaryLight}}`.

### 9. [P2] Main loading spinner (x.jsx:3032) renders before `partner` is loaded
The loading spinner at line 3032 shows while `loadingPartner` is true — meaning `partner` is null. Cannot read `primary_color` yet.

**FIX:** Use the default fallback `#1A1A1A` for this spinner. Since `primaryColor` will be defined as `partner?.primary_color || '#1A1A1A'` and partner is null during loading, this works automatically — just use `primaryColor` which will resolve to the default.

### 10. [P2] Helper functions need to be accessible across 5 files
`darkenColor` and `lightenColor` are proposed for x.jsx only, but MenuView, CartView, CheckoutView, and ModeTabs also need the computed values.

**FIX:** Two approaches:
- (a) **Props approach** (recommended): Define helpers and compute `primaryColor`, `primaryHover`, `primaryLight` in x.jsx's main component, pass as props to all sub-components. Minimal change to sub-component logic.
- (b) **Shared module**: Extract helpers to a shared file. More complex, touches import structure.

Recommend (a): add 3 props (`primaryColor`, `primaryHover`, `primaryLight`) to CartView, MenuView, CheckoutView, ModeTabs, and OrderConfirmationScreen. Define the helpers once in x.jsx.

### 11. [P3] CategoryChips `activeColor` prop may be ignored
Line 3190 passes `activeColor="#B5543A"` to CategoryChips. BUGS.md (PM-062) notes: "Active chip still renders indigo despite `activeColor` prop passed." If CategoryChips ignores this prop internally, changing the value to `primaryColor` alone won't fix the visual.

**FIX:** Verify CategoryChips component (imported from `@/components/publicMenu/refactor/CategoryChips`) actually uses the `activeColor` prop. If it doesn't, this is a pre-existing bug (PM-062) outside our scope — just pass the dynamic value and note the dependency.

---

## Summary
Total: 11 findings (0 P0, 4 P1, 6 P2, 1 P3)

### Implementation Strategy (recommended)
1. Define `darkenColor()` and `lightenColor()` helpers at top of x.jsx (before components).
2. In the main PublicMenuPage component, compute:
   ```js
   const primaryColor = partner?.primary_color || '#1A1A1A';
   const primaryHover = darkenColor(primaryColor);
   const primaryLight = lightenColor(primaryColor);
   ```
3. Pass `primaryColor`, `primaryHover`, `primaryLight` as props to: CartView, MenuView, CheckoutView, ModeTabs, OrderConfirmationScreen.
4. In OrderStatusScreen (has own partner query): compute locally.
5. Replace all 29 hardcoded occurrences with the dynamic values.
6. For `focus-within:border-[#B5543A]` (line 3426): use `focus-within:border-current` with a wrapper `style={{color: primaryColor}}`, or use onFocusCapture/onBlurCapture with state.

## Prompt Clarity
- Overall clarity: 5
- Ambiguous Fix descriptions: None — the task description was exceptionally detailed with exact line references, helper code, and verification steps.
- Missing context: CategoryChips internal implementation (is `activeColor` prop actually used?) — but this is noted as a pre-existing issue (PM-062).
- Scope questions: None — scope lock is clear.
