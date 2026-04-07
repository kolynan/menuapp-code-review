# CC Writer Findings — PublicMenu
Chain: publicmenu-260322-004903

## Task Context
Replace all hardcoded terracotta colors (#B5543A, #9A4530, #F5E6E0) with dynamic `partner.primary_color` across PublicMenu files. Default fallback: `#1A1A1A`.

## Findings

### 1. [P2] x.jsx — 9 hardcoded #B5543A occurrences need dynamic replacement

**Locations in x.jsx:**
- **Line 751**: `style={{backgroundColor:'#B5543A'}}` — "Back to menu" CTA button in OrderConfirmationScreen
- **Line 770**: `style={{color:'#B5543A'}}` — "Track order" ghost button text in OrderConfirmationScreen
- **Line 1024**: `style={{color:'#B5543A'}}` — Loader spinner in OrderStatusScreen loading state
- **Line 1156**: `style={{color:'#B5543A'}}` — Phone icon in OrderStatusScreen contact section
- **Line 1157**: `style={{color:'#B5543A'}}` — Phone number text in OrderStatusScreen contact section
- **Line 3032**: `style={{color:'#B5543A'}}` — Loader spinner during partner loading
- **Line 3190**: `activeColor="#B5543A"` — CategoryChips component prop
- **Line 3460**: `style={{ backgroundColor: '#B5543A' }}` — "Confirm and submit" CTA in table code verification dialog

**FIX:**
1. Define helpers at file top (before components):
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

2. In main component `X()` (after `partner` is loaded, ~line 1386):
```javascript
const primaryColor = partner?.primary_color || '#1A1A1A';
const primaryHover = darkenColor(primaryColor);
const primaryLight = lightenColor(primaryColor);
```

3. In `OrderStatusScreen` (line ~927, after its own `partner` query):
```javascript
const primaryColor = partner?.primary_color || '#1A1A1A';
```

4. In `OrderConfirmationScreen` — this component receives limited props. Need to pass `primaryColor` as a prop from `X()`.

5. Replace all 9 hardcoded values with the dynamic variable.

6. For line 3190 (`activeColor="#B5543A"`): change to `activeColor={primaryColor}`.

### 2. [P2] x.jsx — 1 hardcoded #B5543A in Tailwind class (line 3426) — requires different fix approach

**Location:** Line 3426 in table code verification cells:
```jsx
className="... focus-within:border-[#B5543A]"
```

**FIX:** Cannot use inline style for Tailwind `focus-within:` pseudo-class. Options:
- A) Remove `focus-within:border-[#B5543A]` from className and add a `onFocus/onBlur` handler to set border color dynamically. However, since this is on the container div (not the input), it would need a `focus-within` CSS equivalent.
- B) Use a `<style>` tag to inject a dynamic CSS rule — but task says NO `<style>` tags.
- C) **Recommended:** Replace with `focus-within:border-slate-900` (since default is `#1A1A1A` which is near-black, using slate-900 is a reasonable static approximation for all brand colors). This is a minor visual detail on code input cells.
- D) Use inline style override: remove the Tailwind focus class entirely, and rely on the existing `border-slate-200` default. The focus state is a subtle enhancement and removing it is acceptable.

**Recommendation:** Option C — replace `focus-within:border-[#B5543A]` with `focus-within:border-slate-900` as a pragmatic approximation. Alternatively, use a state-based approach with `onFocusCapture`/`onBlurCapture` on the parent div to set `borderColor: primaryColor` dynamically.

### 3. [P2] CartView.jsx — 6 hardcoded color occurrences

**Locations in CartView.jsx:**
- **Line 470**: `style={{color:'#B5543A'}}` — Guest name edit button
- **Line 508**: `style={{color:'#B5543A'}}` — "Get bonus" loyalty button
- **Line 862**: `style={{accentColor:'#B5543A'}}` — Split payment radio (single)
- **Line 872**: `style={{accentColor:'#B5543A'}}` — Split payment radio (all)
- **Line 954**: `style={{backgroundColor:'#F5E6E0'}}` — Loyalty balance box background (**primaryLight**)
- **Line 1067**: `style={!isSubmitting && !submitError ? {backgroundColor:'#B5543A'} : undefined}` — Submit CTA button

**FIX:** CartView already receives `partner` as a prop (line 9). Add at the top of the function body:
```javascript
const primaryColor = partner?.primary_color || '#1A1A1A';
const primaryLight = lightenColor(primaryColor);
```
Then replace all 6 occurrences. For `accentColor` lines, use `primaryColor` directly. For `#F5E6E0` use `primaryLight`.

Note: `lightenColor` helper needs to be either:
- Defined in a shared util and imported by CartView, OR
- Passed as a prop from x.jsx, OR
- Defined at the top of CartView.jsx (simplest — inline the helper)

**Recommended:** Define `darkenColor` and `lightenColor` in a new shared file `pages/PublicMenu/colorUtils.js` and import from both x.jsx and CartView.jsx. This avoids duplication.
However, task says "do NOT add new components" — but a utils file is not a component. Alternatively, inline in each file.

### 4. [P2] MenuView.jsx — 11 hardcoded color occurrences (including #9A4530 hover colors)

**Locations in MenuView.jsx:**
- **Line 85**: `style={{color:'#B5543A'}}` — Price text (list mode)
- **Line 105**: `style={{backgroundColor:'#B5543A'}}` — "+" button (list mode)
- **Line 106**: `onMouseEnter ... '#9A4530'` — Hover darken (list mode)
- **Line 107**: `onMouseLeave ... '#B5543A'` — Hover restore (list mode)
- **Line 166**: `style={{backgroundColor:'#B5543A'}}` — "+" button (tile mode)
- **Line 167**: `onMouseEnter ... '#9A4530'` — Hover darken (tile mode)
- **Line 168**: `onMouseLeave ... '#B5543A'` — Hover restore (tile mode)
- **Line 209**: `style={{color:'#B5543A'}}` — Price text (tile mode)
- **Line 238**: `style={mobileLayout === 'tile' ? {backgroundColor:'#B5543A'} : undefined}` — Tile layout toggle
- **Line 250**: `style={mobileLayout === 'list' ? {backgroundColor:'#B5543A'} : undefined}` — List layout toggle
- **Line 260**: `style={{color:'#B5543A'}}` — Loader spinner

**FIX:** MenuView receives `partner` as a prop (line 21). Add at the top of the function body:
```javascript
const primaryColor = partner?.primary_color || '#1A1A1A';
const primaryHover = darkenColor(primaryColor);
```
Then replace all 11 occurrences. For hover handlers, use `primaryHover` for onMouseEnter and `primaryColor` for onMouseLeave.

### 5. [P2] ModeTabs.jsx — 1 hardcoded #B5543A occurrence

**Location:** Line 38: `style={isActive ? {backgroundColor:'#B5543A'} : undefined}`

**FIX:** ModeTabs does NOT receive `partner` as a prop currently. Need to:
1. Add `primaryColor` prop to ModeTabs.
2. In x.jsx where `<ModeTabs>` is rendered (line 3165), add `primaryColor={primaryColor}`.
3. In ModeTabs, use the prop: `style={isActive ? {backgroundColor: primaryColor} : undefined}`.

### 6. [P2] CheckoutView.jsx — 3 hardcoded #B5543A occurrences

**Locations:**
- **Line 37**: `style={{color:'#B5543A'}}` — "Back to menu" link
- **Line 76**: `style={{color:'#B5543A'}}` — Total price
- **Line 175**: `style={(!isSubmitting && !submitError) ? {backgroundColor:'#B5543A'} : undefined}` — Submit CTA

**FIX:** CheckoutView receives `partner` as a prop (confirmed from x.jsx line 3236). Add at top of function:
```javascript
const primaryColor = partner?.primary_color || '#1A1A1A';
```
Then replace all 3 occurrences.

### 7. [P2] OrderConfirmationScreen needs primaryColor prop — component architecture issue

**Description:** `OrderConfirmationScreen` is defined inside x.jsx as a function component. It uses `#B5543A` at lines 751 and 770 but does NOT receive `partner` as a prop.

Check how it's called:
```javascript
// Need to verify the props passed to OrderConfirmationScreen
```

**FIX:** Either:
- A) Pass `primaryColor` as a prop to `OrderConfirmationScreen`
- B) Pass `partner` as a prop and derive `primaryColor` inside

Recommended: Pass `primaryColor` directly — simpler, keeps the component focused.

### 8. [P1] OrderStatusScreen has separate partner query — color may be stale/inconsistent

**Description:** `OrderStatusScreen` (line 886) loads its own `partner` object via a separate query (line 919). If the main page already has `partner` loaded, there's a timing window where the two may have different `primary_color` values if changed between loads.

**This is NOT a new issue** — it's existing architecture. However, for the color replacement:
- OrderStatusScreen's own `partner` (line 919) will include `primary_color`.
- Add `const primaryColor = partner?.primary_color || '#1A1A1A';` after line 927 in OrderStatusScreen.
- Replace the 3 occurrences (lines 1024, 1156, 1157).

**FIX:** Straightforward — just add `primaryColor` derivation using the existing partner query. No architecture change needed.

### 9. [P2] Loading spinner at line 3032 — partner may not be loaded yet

**Description:** At line 3032, `<Loader2 style={{color:'#B5543A'}} />` is rendered during `loadingPartner` state — at this point `partner` is null/undefined, so `partner?.primary_color` would be undefined and fallback to `#1A1A1A`.

**FIX:** This is acceptable — during loading, the default black color will show. Once partner loads, the actual color appears. No issue.

### 10. [P3] STYLE_GUIDE.md references hardcoded terracotta — should be updated

**Description:** `STYLE_GUIDE.md` (lines 24-26, 42) documents `#B5543A`, `#9A4530`, `#F5E6E0` as the color palette. After this change, the guide should note that colors are now dynamic via `partner.primary_color`.

**FIX:** Update STYLE_GUIDE.md to mention dynamic color with default `#1A1A1A`. Not a code change, P3 documentation only. OUT OF SCOPE for this task (scope lock says code changes only).

## Implementation Strategy

### Helper functions placement
Define `darkenColor()` and `lightenColor()` at the **top of x.jsx** (before any component definitions, after imports). Since MenuView and CartView also need them, two options:
1. **Duplicate in each file** — simple, no new files, ~10 lines each
2. **Create `pages/PublicMenu/colorUtils.js`** — DRY, but adds a file

**Recommendation:** Option 1 (duplicate). The helpers are tiny (5 lines each) and the task says not to add new components. While a util file isn't a component, keeping changes minimal is safer.

### Props threading
| Component | Has `partner` | Needs new prop | Action |
|---|---|---|---|
| x.jsx (X) | ✅ loaded directly | — | Add `primaryColor` derivation |
| OrderStatusScreen | ✅ own query | — | Add `primaryColor` derivation |
| OrderConfirmationScreen | ❌ | `primaryColor` | Pass from X |
| MenuView | ✅ via prop | — | Add `primaryColor` derivation from existing partner prop |
| CartView | ✅ via prop | — | Add `primaryColor` derivation from existing partner prop |
| CheckoutView | ✅ via prop | — | Add `primaryColor` derivation from existing partner prop |
| ModeTabs | ❌ | `primaryColor` | Pass from X |
| CategoryChips | ✅ has `activeColor` prop | — | Change prop value to `{primaryColor}` |

### Total changes
| File | Occurrences | Colors |
|---|---|---|
| x.jsx | 9 `#B5543A` + 1 `focus-within:border-[#B5543A]` | 10 total |
| CartView.jsx | 5 `#B5543A` + 1 `#F5E6E0` | 6 total |
| MenuView.jsx | 7 `#B5543A` + 2 `#9A4530` + 2 more `#B5543A` in handlers | 11 total |
| ModeTabs.jsx | 1 `#B5543A` | 1 total |
| CheckoutView.jsx | 3 `#B5543A` | 3 total |
| **TOTAL** | **31 occurrences across 5 files** | |

## Summary
Total: 10 findings (0 P0, 1 P1, 8 P2, 1 P3)

- P0: 0
- P1: 1 (Finding 8 — OrderStatusScreen separate partner, informational only)
- P2: 8 (Findings 1-7, 9 — all the hardcoded colors that need replacement)
- P3: 1 (Finding 10 — STYLE_GUIDE.md docs, out of scope)

All P2 findings are part of the same task (Fix 1 — PM-S81-04). They are split by file for clarity.

## Prompt Clarity
- Overall clarity: 5/5
- Ambiguous Fix descriptions: None. The task description was exceptionally detailed with exact line references, code examples for helpers, and clear "must NOT" constraints.
- Missing context: None. All relevant files, props, and component architecture were inferrable from the code.
- Scope questions: One minor question — whether to create a shared `colorUtils.js` file or duplicate helpers. Task says "do NOT add new components" but a utils file is debatable. Recommendation: duplicate for safety.
