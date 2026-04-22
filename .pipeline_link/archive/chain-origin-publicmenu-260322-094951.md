---
page: PublicMenu
code_file: pages/PublicMenu/x.jsx
budget: 12
agent: cc+codex
chain_template: consensus-with-discussion
---

# Dynamic Primary Color — PublicMenu (#82 part 2)

Reference: `BUGS_MASTER.md` (PM-S81-04), `pipeline/chain-state/publicmenu-260322-090606-comparison.md`, `ux-concepts/UX_LOCKED_PublicMenu.md`.
Production page. Manual comparison done (S159).

**Context:** Task #82 part 1 added color picker to PartnerSettings — partner selects `primary_color` (hex code) from 8 presets (commit afeb603). This task makes PublicMenu dynamic: replace hardcoded `#B5543A` (terracotta) with `partner.primary_color`.

**Pre-requisite:**
- Field `primary_color` exists in Partner entity.
- PartnerSettings writes the value (part 1, commit afeb603).
- If `primary_color` = null/undefined/empty → default `#1A1A1A`.

**Comparison done:** `pipeline/chain-state/publicmenu-260322-090606-comparison.md` — CC found 29 hardcoded colors across 5 files. Codex confirmed in x.jsx. 8 fixes total.

---

## Fix 1 — PM-S81-04a (P2) [MUST-FIX]: x.jsx — 9 hardcoded colors → dynamic

### Now
In x.jsx, `#B5543A` is hardcoded at lines 751, 770, 1024, 1156, 1157, 3190, 3426, 3460.

### Expected
1. Define at module scope (before component) two helper functions:
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
2. Inside `export default function X()`, after partner is loaded:
```javascript
const primaryColor = partner?.primary_color || '#1A1A1A';
const primaryHover = darkenColor(primaryColor);
const primaryLight = lightenColor(primaryColor);
```
3. Replace ALL `style={{backgroundColor:'#B5543A'}}` with `style={{backgroundColor: primaryColor}}`
4. Replace ALL `style={{color:'#B5543A'}}` with `style={{color: primaryColor}}`
5. Pass `primaryColor` as prop to `<OrderConfirmationScreen>` and `<ModeTabs>`
6. Line 3190: `activeColor="#B5543A"` → `activeColor={primaryColor}`

### Must NOT have
- NO remaining `#B5543A` or `#9A4530` or `#F5E6E0` in x.jsx
- NO CSS variables via style tag — use inline styles only
- NO changes to FAB position (fixed bottom-right per UX LOCKED)

### File and location
`pages/PublicMenu/x.jsx` — lines 751, 770, 1024, 1156, 1157, 3190, 3426, 3460

### Verification
`grep -r "B5543A" pages/PublicMenu/x.jsx` → 0 results

---

## Fix 2 — PM-S81-04b (P2) [MUST-FIX]: CartView.jsx — 6 hardcoded colors → dynamic

### Now
CartView.jsx contains 6 instances of `#B5543A` in CTA buttons, price text, active states.

### Expected
1. Add darkenColor/lightenColor helpers at file scope (same as Fix 1)
2. Read `partner?.primary_color || '#1A1A1A'` — partner is already passed as prop
3. Replace all 6 instances with inline styles using `primaryColor`

### Must NOT have
- NO remaining `#B5543A` or `#9A4530` in CartView.jsx

### File and location
`pages/PublicMenu/CartView.jsx`

### Verification
`grep -r "B5543A" pages/PublicMenu/CartView.jsx` → 0 results

---

## Fix 3 — PM-S81-04c (P2) [MUST-FIX]: ModeTabs.jsx — add primaryColor prop

### Now
ModeTabs.jsx has 1 hardcoded `#B5543A` for active tab.

### Expected
1. Add `primaryColor` to component props (with default `'#1A1A1A'`)
2. Replace hardcoded color with `primaryColor` prop
3. In x.jsx, pass `primaryColor={primaryColor}` to `<ModeTabs>`

### File and location
`pages/PublicMenu/ModeTabs.jsx`

### Verification
`grep -r "B5543A" pages/PublicMenu/ModeTabs.jsx` → 0 results

---

## Fix 4 — PM-S81-04d (P2) [MUST-FIX]: CheckoutView.jsx — 3 hardcoded + add partner to props

### Now
CheckoutView.jsx has 3 hardcoded `#B5543A`. `partner` prop passed but NOT destructured.

### Expected
1. Add `partner` to destructured props in CheckoutView function signature
2. Define `primaryColor = partner?.primary_color || '#1A1A1A'`
3. Replace 3 hardcoded colors with `primaryColor`

### File and location
`pages/PublicMenu/CheckoutView.jsx`

### Verification
`grep -r "B5543A" pages/PublicMenu/CheckoutView.jsx` → 0 results

---

## Fix 5 — PM-S81-04e (P2) [MUST-FIX]: MenuView.jsx — 11 hardcoded colors (incl hover)

### Now
MenuView.jsx has 11 hardcoded colors: `#B5543A` for prices, buttons, badges + 2x `#9A4530` for hover.

### Expected
1. Add darkenColor/lightenColor helpers at file scope
2. Read `partner?.primary_color || '#1A1A1A'` — partner is already passed as prop
3. Replace all 11 instances including hover states
4. For hover: use onMouseEnter/onMouseLeave with `primaryHover`

### File and location
`pages/PublicMenu/MenuView.jsx`

### Verification
`grep -r "B5543A\|9A4530" pages/PublicMenu/MenuView.jsx` → 0 results

---

## Fix 6 — PM-S81-04f (P3) [NICE-TO-HAVE]: x.jsx line 3426 — focus-within Tailwind class

### Now
Table-code digit cells use `focus-within:border-[#B5543A]` Tailwind class which cannot be dynamic.

### Expected
Replace with state-driven border: track focus state, apply `style={{borderColor: primaryColor}}` when focused.

### File and location
`pages/PublicMenu/x.jsx` line 3426

### Verification
`grep "focus-within:border-\[#B5543A\]" pages/PublicMenu/x.jsx` → 0 results

---

## SCOPE LOCK
- Replace ONLY colors `#B5543A`, `#9A4530`, `#F5E6E0` with dynamic values.
- ALL other code (layout, sizes, behavior, state logic) — DO NOT TOUCH.
- UX LOCKED decisions (see `ux-concepts/UX_LOCKED_PublicMenu.md`) — FORBIDDEN to change.
- Do NOT refactor components, do NOT change file structure.
- Do NOT touch: polling logic, order flow, cart logic, drawer behavior, i18n.
- If you see a problem not from this task — SKIP it, do NOT fix.

## Implementation Notes
- Files: `x.jsx`, `CartView.jsx`, `ModeTabs.jsx`, `CheckoutView.jsx`, `MenuView.jsx`
- Helper functions define PER FILE at module scope (before components)
- partner object already loaded in x.jsx and passed as prop to sub-components
- Inline styles take priority over Tailwind classes — OK for dynamic colors
- git add pages/PublicMenu/x.jsx pages/PublicMenu/CartView.jsx pages/PublicMenu/ModeTabs.jsx pages/PublicMenu/CheckoutView.jsx pages/PublicMenu/MenuView.jsx && git commit -m "feat: dynamic primary color in PublicMenu from partner settings (#82)" && git push
