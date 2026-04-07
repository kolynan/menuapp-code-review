# CC Writer Findings — PublicMenu
Chain: publicmenu-260322-090606

## Task Context
Replace ALL hardcoded `#B5543A` (terracotta), `#9A4530` (hover), `#F5E6E0` (light bg) with dynamic `partner.primary_color`. Default fallback: `#1A1A1A`.

## Inventory of Hardcoded Colors

### x.jsx (9 occurrences)
| Line | Color | Usage |
|------|-------|-------|
| 751 | `#B5543A` | OrderConfirmationScreen: "Back to menu" button `backgroundColor` |
| 770 | `#B5543A` | OrderConfirmationScreen: "Track order" button `color` |
| 1024 | `#B5543A` | OrderStatusScreen: loading spinner `color` |
| 1156 | `#B5543A` | OrderStatusScreen: phone icon `color` |
| 1157 | `#B5543A` | OrderStatusScreen: phone number text `color` |
| 3032 | `#B5543A` | Main component: loading spinner `color` |
| 3190 | `#B5543A` | CategoryChips: `activeColor` prop |
| 3426 | `#B5543A` | Bottom Sheet table code: `focus-within:border-[#B5543A]` (Tailwind class) |
| 3460 | `#B5543A` | Bottom Sheet CTA: "Confirm and submit" button `backgroundColor` |

### CartView.jsx (6 occurrences)
| Line | Color | Usage |
|------|-------|-------|
| 470 | `#B5543A` | Guest name edit button `color` |
| 508 | `#B5543A` | "Get bonus" button `color` |
| 862 | `#B5543A` | Radio button "Only me" `accentColor` |
| 872 | `#B5543A` | Radio button "For all" `accentColor` |
| 954 | `#F5E6E0` | Loyalty balance box `backgroundColor` |
| 1067 | `#B5543A` | Submit order button `backgroundColor` |

### ModeTabs.jsx (1 occurrence)
| Line | Color | Usage |
|------|-------|-------|
| 38 | `#B5543A` | Active mode tab `backgroundColor` |

### CheckoutView.jsx (3 occurrences)
| Line | Color | Usage |
|------|-------|-------|
| 37 | `#B5543A` | "Back to menu" link `color` |
| 76 | `#B5543A` | Total price `color` |
| 175 | `#B5543A` | Submit button `backgroundColor` |

### MenuView.jsx (10 occurrences)
| Line | Color | Usage |
|------|-------|-------|
| 85 | `#B5543A` | List card: dish price `color` |
| 105 | `#B5543A` | List card: "+" button `backgroundColor` |
| 106 | `#9A4530` | List card: "+" button hover `backgroundColor` |
| 107 | `#B5543A` | List card: "+" button hover-leave `backgroundColor` |
| 166 | `#B5543A` | Tile card: "+" button `backgroundColor` |
| 167 | `#9A4530` | Tile card: "+" button hover `backgroundColor` |
| 168 | `#B5543A` | Tile card: "+" button hover-leave `backgroundColor` |
| 209 | `#B5543A` | Tile card: dish price `color` |
| 238 | `#B5543A` | Layout toggle "Tile" active `backgroundColor` |
| 250 | `#B5543A` | Layout toggle "List" active `backgroundColor` |
| 260 | `#B5543A` | Loading spinner `color` |

**Total: 29 hardcoded color references across 5 files (26x `#B5543A`, 2x `#9A4530`, 1x `#F5E6E0`).**

---

## Findings

### 1. [P2] MUST-FIX: x.jsx — No `primaryColor` variable defined, 9 hardcoded colors

**Description:** x.jsx has 9 hardcoded `#B5543A` references. The `partner` object is already loaded via `useQuery` at line ~1322 but `partner.primary_color` is never read.

**FIX:**
1. In the main `PublicMenuPage` component body (after partner is loaded), add:
   ```javascript
   const primaryColor = partner?.primary_color || '#1A1A1A';
   ```
2. Add helper functions at file top (in CONSTANTS & HELPERS section, after `isSafeUrl`):
   ```javascript
   function darkenColor(hex, percent = 15) {
     const num = parseInt(hex.replace('#', ''), 16);
     const r = Math.max(0, (num >> 16) - Math.round(255 * percent / 100));
     const g = Math.max(0, ((num >> 8) & 0x00FF) - Math.round(255 * percent / 100));
     const b = Math.max(0, (num & 0x0000FF) - Math.round(255 * percent / 100));
     return `#${(r << 16 | g << 8 | b).toString(16).padStart(6, '0')}`;
   }

   function lightenColor(hex, opacity = 0.1) {
     const num = parseInt(hex.replace('#', ''), 16);
     const r = (num >> 16) & 0xFF;
     const g = (num >> 8) & 0xFF;
     const b = num & 0xFF;
     return `rgba(${r}, ${g}, ${b}, ${opacity})`;
   }
   ```
3. Replace all 9 hardcoded colors with `primaryColor` (and compute `primaryHover = darkenColor(primaryColor)`, `primaryLight = lightenColor(primaryColor)` where needed).

**Special cases in x.jsx:**
- **Line 3426** (`focus-within:border-[#B5543A]`): This is a Tailwind dynamic class — cannot use inline style for `focus-within`. Replace with inline `style` on focus event or remove the focus-within border color (it's cosmetic on the code-input cells and already has `border-slate-200`). Recommended: remove the `focus-within:border-[#B5543A]` class entirely and use a `onFocus`/`onBlur` handler on the parent, or simply leave `border-slate-200` as the focus border since the input is hidden.
- **Lines 751, 770** (OrderConfirmationScreen): This component doesn't receive `partner` as a prop. Need to add `primaryColor` prop.
- **Lines 1024, 1156, 1157** (OrderStatusScreen): Has its own `partner` query. Can derive `primaryColor` from its own `partner?.primary_color || '#1A1A1A'`.
- **Line 3190** (CategoryChips `activeColor` prop): Change from `activeColor="#B5543A"` to `activeColor={primaryColor}`.

### 2. [P2] MUST-FIX: CartView.jsx — 6 hardcoded colors, `partner` already available as prop

**Description:** CartView receives `partner` as a prop (line 9) but never reads `primary_color`.

**FIX:**
1. At top of CartView function body, add:
   ```javascript
   const primaryColor = partner?.primary_color || '#1A1A1A';
   const primaryLight = lightenColor(primaryColor);
   ```
2. Import or inline the `lightenColor` helper (since it's a separate file, either define locally or receive as prop).
3. Replace all 6 occurrences:
   - Line 470: `style={{color:'#B5543A'}}` → `style={{color: primaryColor}}`
   - Line 508: `style={{color:'#B5543A'}}` → `style={{color: primaryColor}}`
   - Line 862: `style={{accentColor:'#B5543A'}}` → `style={{accentColor: primaryColor}}`
   - Line 872: `style={{accentColor:'#B5543A'}}` → `style={{accentColor: primaryColor}}`
   - Line 954: `style={{backgroundColor:'#F5E6E0'}}` → `style={{backgroundColor: primaryLight}}`
   - Line 1067: `{backgroundColor:'#B5543A'}` → `{backgroundColor: primaryColor}`

### 3. [P2] MUST-FIX: ModeTabs.jsx — 1 hardcoded color, needs `primaryColor` prop

**Description:** ModeTabs.jsx has `{backgroundColor:'#B5543A'}` at line 38 but doesn't receive `partner` or `primaryColor`.

**FIX:**
1. Add `primaryColor` prop to ModeTabs component signature.
2. Replace line 38: `style={isActive ? {backgroundColor:'#B5543A'} : undefined}` → `style={isActive ? {backgroundColor: primaryColor} : undefined}`
3. In x.jsx where `<ModeTabs>` is rendered (line ~3165), add `primaryColor={primaryColor}` prop.

### 4. [P2] MUST-FIX: CheckoutView.jsx — 3 hardcoded colors, `partner` already available as prop

**Description:** CheckoutView receives `partner` prop (line ~3236 in parent) but never reads `primary_color`.

**FIX:**
1. At top of CheckoutView function body, add:
   ```javascript
   const primaryColor = partner?.primary_color || '#1A1A1A';
   ```
   Note: CheckoutView already receives `partner` via props (confirmed at x.jsx line 3236). However, looking at CheckoutView's function signature, it does NOT list `partner` in its destructured props. Need to add it.
2. Replace:
   - Line 37: `style={{color:'#B5543A'}}` → `style={{color: primaryColor}}`
   - Line 76: `style={{color:'#B5543A'}}` → `style={{color: primaryColor}}`
   - Line 175: `{backgroundColor:'#B5543A'}` → `{backgroundColor: primaryColor}`

### 5. [P2] MUST-FIX: MenuView.jsx — 10+1 hardcoded colors (incl. hover), `partner` already available as prop

**Description:** MenuView receives `partner` as prop (line 21) but never reads `primary_color`. Also has 2 instances of `#9A4530` for hover state.

**FIX:**
1. At top of MenuView function body, add:
   ```javascript
   const primaryColor = partner?.primary_color || '#1A1A1A';
   const primaryHover = darkenColor(primaryColor);
   ```
2. Need `darkenColor` helper — either define locally or import. Recommend defining locally (small pure function, keeps files independent).
3. Replace all 11 occurrences:
   - Lines 85, 209: `style={{color:'#B5543A'}}` → `style={{color: primaryColor}}`
   - Lines 105, 166: `style={{backgroundColor:'#B5543A'}}` → `style={{backgroundColor: primaryColor}}`
   - Lines 106, 167: `e.currentTarget.style.backgroundColor='#9A4530'` → `e.currentTarget.style.backgroundColor=primaryHover`
   - Lines 107, 168: `e.currentTarget.style.backgroundColor='#B5543A'` → `e.currentTarget.style.backgroundColor=primaryColor`
   - Lines 238, 250: `style={... ? {backgroundColor:'#B5543A'} : undefined}` → `style={... ? {backgroundColor: primaryColor} : undefined}`
   - Line 260: `style={{color:'#B5543A'}}` → `style={{color: primaryColor}}`

### 6. [P2] OrderConfirmationScreen needs `primaryColor` prop

**Description:** OrderConfirmationScreen (defined at line 604 in x.jsx) has 2 hardcoded `#B5543A` (lines 751, 770) but doesn't receive `partner` or `primaryColor`. It's rendered from the main component which HAS `partner`.

**FIX:**
1. Add `primaryColor` to OrderConfirmationScreen's destructured props.
2. Pass `primaryColor={primaryColor}` when rendering `<OrderConfirmationScreen>` in the main component.
3. Replace lines 751 and 770.

### 7. [P2] OrderStatusScreen has its own `partner` query — derive `primaryColor` internally

**Description:** OrderStatusScreen (line 886) fetches its own `partner` object via useQuery (line 919). It has 3 hardcoded `#B5543A` references (lines 1024, 1156, 1157).

**FIX:**
1. After the partner query result, add:
   ```javascript
   const primaryColor = partner?.primary_color || '#1A1A1A';
   ```
2. Replace lines 1024, 1156, 1157 with `primaryColor`.

### 8. [P3] Tailwind dynamic class `focus-within:border-[#B5543A]` cannot be dynamically replaced

**Description:** Line 3426 in x.jsx uses `focus-within:border-[#B5543A]` as a Tailwind class. Tailwind JIT generates classes at build time, so dynamic values in class names won't work. For inline styles, `focus-within` pseudo-class cannot be targeted.

**FIX:** Two options:
- **Option A (recommended):** Remove the `focus-within:border-[#B5543A]` class. The code cells are decorative display boxes (the actual input is below). The default `border-slate-200` is sufficient.
- **Option B:** Replace with a focus/blur JS handler on the wrapper that sets `borderColor` via inline style. More complex for minimal UX gain.

### 9. [P3] Helper functions should be defined at file scope (not inside component)

**Description:** `darkenColor` and `lightenColor` are pure functions with no component dependencies. They should be defined at the file/module scope (in the CONSTANTS & HELPERS section of x.jsx) and either duplicated in MenuView.jsx/CartView.jsx or defined in each file that needs them.

**FIX:** Define helpers at file scope in each file that uses them. Do NOT create a shared utils file (scope lock — no new files/components).

### 10. [P2] CheckoutView.jsx — `partner` prop not in function signature

**Description:** CheckoutView is passed `partner={partner}` from x.jsx (line 3236), but the destructured props in CheckoutView.jsx (lines 7-32) do NOT include `partner`. This means `partner` is available but silently ignored. To use `partner.primary_color`, we must add `partner` to the destructured props.

**FIX:** Add `partner,` to the CheckoutView function signature (after `isSubmitting,` or before `isTableVerified,`).

## Summary
Total: 10 findings (0 P0, 0 P1, 8 P2, 2 P3)

All findings relate to the single task: replacing hardcoded terracotta colors with dynamic `partner.primary_color`. The implementation touches 5 files with 29 total color references to replace.

**Key implementation notes:**
- `partner` object is already available in all components (either as prop or own query)
- CheckoutView needs `partner` added to its destructured props
- ModeTabs needs a new `primaryColor` prop
- OrderConfirmationScreen needs a new `primaryColor` prop
- OrderStatusScreen can derive `primaryColor` from its own partner query
- Helper functions (`darkenColor`, `lightenColor`) should be defined per-file at module scope
- One Tailwind dynamic class (`focus-within:border-[#B5543A]`) should be removed (Option A)

## Prompt Clarity
- Overall clarity: 5
- Ambiguous Fix descriptions: None — the task description was detailed and specific.
- Missing context: None — all necessary info was provided.
- Scope questions: None — scope lock was clearly defined.
