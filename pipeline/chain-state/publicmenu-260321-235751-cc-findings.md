# CC Writer Findings — PublicMenu
Chain: publicmenu-260321-235751

## Task: Replace hardcoded #B5543A / #9A4530 / #F5E6E0 with dynamic `partner.primary_color`

## Findings

### 1. [P2] x.jsx — 9 hardcoded color occurrences need dynamic replacement

**Locations:**
- **Line 751:** `style={{backgroundColor:'#B5543A'}}` — "Back to menu" button (Order Confirmation)
- **Line 770:** `style={{color:'#B5543A'}}` — "Track order" button text
- **Line 1024:** `style={{color:'#B5543A'}}` — Order loading spinner
- **Line 1156:** `style={{color:'#B5543A'}}` — Phone icon in Order Status
- **Line 1157:** `style={{color:'#B5543A'}}` — Phone number text
- **Line 3032:** `style={{color:'#B5543A'}}` — Partner loading spinner
- **Line 3190:** `activeColor="#B5543A"` — CategoryChips prop
- **Line 3426:** `focus-within:border-[#B5543A]` — Table code input focus border (Tailwind dynamic class)
- **Line 3460:** `style={{ backgroundColor: '#B5543A' }}` — Table verify CTA button

**FIX:**
1. Define helpers at the top of x.jsx (before any component):
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
2. In the main component function (PublicMenu), add:
```javascript
const primaryColor = partner?.primary_color || '#1A1A1A';
const primaryHover = darkenColor(primaryColor);
const primaryLight = lightenColor(primaryColor);
```
3. Replace all 9 occurrences with dynamic values.
4. Pass `primaryColor`, `primaryHover`, `primaryLight` as props to sub-components.
5. For line 3426 (Tailwind `focus-within:border-[#B5543A]`): convert to inline style since Tailwind can't do dynamic arbitrary values. Use `onFocus`/`onBlur` handlers or replace with a wrapper style approach.

### 2. [P2] CartView.jsx — 6 hardcoded color occurrences

**Locations:**
- **Line 470:** `style={{color:'#B5543A'}}` — Guest name edit link
- **Line 508:** `style={{color:'#B5543A'}}` — "Get bonus" link
- **Line 862:** `style={{accentColor:'#B5543A'}}` — Radio button (single split)
- **Line 872:** `style={{accentColor:'#B5543A'}}` — Radio button (all split)
- **Line 954:** `style={{backgroundColor:'#F5E6E0'}}` — Loyalty balance box background
- **Line 1067:** `style={!isSubmitting && !submitError ? {backgroundColor:'#B5543A'} : undefined}` — Submit CTA

**FIX:**
1. CartView already receives `partner` as a prop.
2. Add at the top of CartView function:
```javascript
const primaryColor = partner?.primary_color || '#1A1A1A';
const primaryLight = lightenColor(primaryColor);
```
3. Either import `lightenColor` from x.jsx (not possible with B44 local components) or duplicate the helper inside CartView.jsx (or receive `primaryColor` and `primaryLight` as props from x.jsx).
4. **Recommended approach:** Pass `primaryColor` and `primaryLight` as props from x.jsx to CartView.
5. Replace all 6 occurrences:
   - `color:'#B5543A'` → `color: primaryColor`
   - `accentColor:'#B5543A'` → `accentColor: primaryColor`
   - `backgroundColor:'#F5E6E0'` → `backgroundColor: primaryLight`
   - Submit button: `{backgroundColor:'#B5543A'}` → `{backgroundColor: primaryColor}`

### 3. [P2] CheckoutView.jsx — 3 hardcoded color occurrences

**Locations:**
- **Line 37:** `style={{color:'#B5543A'}}` — "Back to menu" link
- **Line 76:** `style={{color:'#B5543A'}}` — Total price display
- **Line 175:** `style={(!isSubmitting && !submitError) ? {backgroundColor:'#B5543A'} : undefined}` — Submit CTA

**FIX:**
1. CheckoutView does NOT currently receive `partner` prop (but does get other props from x.jsx).
2. **Option A (recommended):** Add `primaryColor` prop to CheckoutView, pass from x.jsx.
3. **Option B:** Pass `partner` prop (already passed for other CheckoutView usages at line 3236).
   - Wait, CheckoutView IS passed `partner` at line 3236. But the CheckoutView function signature at line 7-32 does NOT destructure `partner`.
   - Actually, re-checking: `partner` IS in the props passed from x.jsx at line 3236, but CheckoutView.jsx signature doesn't list it.
4. **Best approach:** Add `primaryColor` as a dedicated prop to CheckoutView.
5. Replace all 3 occurrences with `primaryColor`.

### 4. [P2] MenuView.jsx — 11 hardcoded color occurrences (including hover handlers)

**Locations:**
- **Line 85:** `style={{color:'#B5543A'}}` — Price in list card
- **Line 105:** `style={{backgroundColor:'#B5543A'}}` — Add button (list mode)
- **Line 106:** `onMouseEnter={(e) => e.currentTarget.style.backgroundColor='#9A4530'` — Hover darken (list)
- **Line 107:** `onMouseLeave={(e) => e.currentTarget.style.backgroundColor='#B5543A'` — Hover restore (list)
- **Line 166:** `style={{backgroundColor:'#B5543A'}}` — Add button (tile mode)
- **Line 167:** `onMouseEnter={(e) => e.currentTarget.style.backgroundColor='#9A4530'` — Hover darken (tile)
- **Line 168:** `onMouseLeave={(e) => e.currentTarget.style.backgroundColor='#B5543A'` — Hover restore (tile)
- **Line 209:** `style={{color:'#B5543A'}}` — Price in tile card
- **Line 238:** `style={mobileLayout === 'tile' ? {backgroundColor:'#B5543A'} : undefined}` — Tile toggle active
- **Line 250:** `style={mobileLayout === 'list' ? {backgroundColor:'#B5543A'} : undefined}` — List toggle active
- **Line 260:** `style={{color:'#B5543A'}}` — Loading spinner

**FIX:**
1. MenuView already receives `partner` as a prop.
2. Add at the top of MenuView function:
```javascript
const primaryColor = partner?.primary_color || '#1A1A1A';
const primaryHover = darkenColor(primaryColor);
```
3. Either pass `primaryColor` + `primaryHover` as props, or define darkenColor locally.
4. **Recommended:** Pass `primaryColor` and `primaryHover` as props from x.jsx.
5. Replace all 11 occurrences:
   - `'#B5543A'` in styles → `primaryColor`
   - `'#9A4530'` in hover handlers → `primaryHover`

### 5. [P2] ModeTabs.jsx — 1 hardcoded color occurrence

**Locations:**
- **Line 38:** `style={isActive ? {backgroundColor:'#B5543A'} : undefined}` — Active tab background

**FIX:**
1. ModeTabs does NOT receive `partner`.
2. Add `primaryColor` prop to ModeTabs, pass from x.jsx.
3. Replace: `{backgroundColor:'#B5543A'}` → `{backgroundColor: primaryColor}`

### 6. [P1] Architecture decision: prop drilling vs duplicated helpers

**Description:** Five different component files need access to `primaryColor`, `primaryHover`, and `primaryLight`. Two approaches:
- **Approach A (recommended by task):** Define `darkenColor` and `lightenColor` helpers in x.jsx. Compute `primaryColor`, `primaryHover`, `primaryLight` in x.jsx's main component. Pass as props to CartView, MenuView, CheckoutView, ModeTabs, CategoryChips.
- **Approach B (duplicate helpers):** Each component reads `partner?.primary_color` and computes locally. Duplicates helper functions.

**FIX:** Use Approach A — prop drilling from x.jsx. This is cleaner, single source of truth, and follows existing prop-passing pattern already used for `partner`, `t`, etc.

### 7. [P2] x.jsx line 3426 — Tailwind `focus-within:border-[#B5543A]` cannot be dynamic via class

**Description:** The table code input uses `focus-within:border-[#B5543A]` as a Tailwind class. Tailwind arbitrary values are compiled at build time; a dynamic hex won't work.

**FIX:** Remove the Tailwind class `focus-within:border-[#B5543A]` and handle the focus border via a wrapper with inline style, or use a small state to toggle border color:
```jsx
// Option: use CSS outline via inline style on parent
// Remove focus-within:border-[#B5543A] from className
// Add to style: borderColor managed via onFocusCapture/onBlurCapture on parent div
```

### 8. [P2] x.jsx line 3032 — Loading spinner uses #B5543A BEFORE partner loads

**Description:** At line 3032, the loading spinner shows `style={{color:'#B5543A'}}` while `partner` is still loading. At this point `partner` is null/undefined, so `partner?.primary_color` would be undefined and fallback to `#1A1A1A`.

**FIX:** This is acceptable behavior — the default color `#1A1A1A` (black) will be used for the loading spinner. This is actually fine as the spinner appears briefly. No additional fix needed beyond the standard replacement. Document this as expected: "loading spinner uses default color until partner data loads."

### 9. [P2] OrderStatusScreen inner component (lines ~900-1200) accesses different partner object

**Description:** The `OrderStatusScreen` component defined inside x.jsx (around line ~900) fetches its own `partner` via a separate useQuery (line 919). This inner `partner` is a different variable from the outer one. The hardcoded colors at lines 1024, 1156, 1157 are inside this inner component.

**FIX:** The inner `OrderStatusScreen` needs its own `primaryColor` derived from its own `partner` object:
```javascript
const primaryColor = partner?.primary_color || '#1A1A1A';
```
This must be declared inside `OrderStatusScreen`, not passed from the outer component, because it uses a different `partner` fetch.

## Summary
Total: 9 findings (0 P0, 1 P1, 8 P2, 0 P3)

**Hardcoded color count by file:**
| File | #B5543A | #9A4530 | #F5E6E0 | Total |
|------|---------|---------|---------|-------|
| x.jsx | 9 | 0 | 0 | 9 |
| CartView.jsx | 5 | 0 | 1 | 6 |
| CheckoutView.jsx | 3 | 0 | 0 | 3 |
| MenuView.jsx | 8 | 4 (in hover handlers) | 0 | 12 |
| ModeTabs.jsx | 1 | 0 | 0 | 1 |
| **TOTAL** | **26** | **4** | **1** | **31** |

**Implementation plan:**
1. Add `darkenColor()` and `lightenColor()` helpers to x.jsx (top of file, before components)
2. In main PublicMenu component: compute `primaryColor`, `primaryHover`, `primaryLight`
3. In inner `OrderStatusScreen`: compute its own `primaryColor` from its own `partner`
4. Pass `primaryColor`, `primaryHover`, `primaryLight` as props to: CartView, MenuView, CheckoutView, ModeTabs, CategoryChips
5. Replace all 31 hardcoded color values across 5 files
6. Special handling for line 3426 (Tailwind focus class → inline style)

## Prompt Clarity
- Overall clarity: 5/5
- Ambiguous Fix descriptions: None — the task description was exceptionally detailed with exact line references, helper code, and verification steps.
- Missing context: None — all necessary context (partner entity, existing prop patterns, file list) was provided.
- Scope questions: None — SCOPE LOCK was clear and well-defined. The only minor ambiguity was whether StickyCartBar also has hardcoded colors (it doesn't — confirmed via grep).
