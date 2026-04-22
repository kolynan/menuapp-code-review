---
chain: publicmenu-260322-093706
chain_step: 1
chain_total: 4
chain_step_name: codex-writer
chain_group: writers
chain_group_size: 2
page: PublicMenu
budget: 12.00
runner: codex
type: chain-step
---
Review the file pages/PublicMenu/*.jsx for bugs in a React restaurant QR-menu app on Base44 platform.
Also check pages/PublicMenu/README.md and pages/PublicMenu/BUGS.md for context (ONLY these 3 files, nothing else).

SPEED RULES — this is a time-sensitive pipeline step:
- Read ONLY the 3 files above. Do NOT search the repo, do NOT read old findings, do NOT read files outside pages/PublicMenu/.
- Do NOT run rg/grep across the whole repo. Do NOT cross-reference with other pages.
- Limit analysis to the target page code. Be concise.

Find ALL bugs. Focus on: logic errors, missing error handling, i18n issues, UI/UX for mobile-first, React anti-patterns.

For each finding: [P0/P1/P2/P3] Title - Description. FIX: code change needed.

Write findings to: pipeline/chain-state/publicmenu-260322-093706-codex-findings.md

FORMAT:
# Codex Writer Findings — PublicMenu
Chain: publicmenu-260322-093706

## Findings
1. [P0] Title — Description. FIX: ...
2. [P1] Title — Description. FIX: ...

## Summary
Total: N findings (X P0, Y P1, Z P2, W P3)

## Prompt Clarity
Rate the task description quality (1-5). For any score below 4, explain what was unclear:
- Overall clarity: [1-5]
- Ambiguous Fix descriptions (list Fix # and what was unclear): ...
- Missing context (what info would have helped): ...
- Scope questions (anything you weren't sure if it's in scope): ...

Do NOT apply fixes — only document findings.

=== TASK CONTEXT ===
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

### Сейчас
In x.jsx, `#B5543A` is hardcoded at lines 751, 770, 1024, 1156, 1157, 3190, 3426, 3460. Plus `#9A4530` for hover nowhere in x.jsx but might appear. `#F5E6E0` as light variant.

### Должно быть
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
3. Replace ALL `style={{backgroundColor:'#B5543A'}}` → `style={{backgroundColor: primaryColor}}`
4. Replace ALL `style={{color:'#B5543A'}}` → `style={{color: primaryColor}}`
5. Pass `primaryColor` as prop to `<OrderConfirmationScreen>` and `<ModeTabs>`
6. Line 3190: `activeColor="#B5543A"` → `activeColor={primaryColor}`

### НЕ должно быть
- NO remaining `#B5543A` or `#9A4530` or `#F5E6E0` in x.jsx
- NO CSS variables via `<style>` tag — use inline styles only
- NO changes to FAB position (fixed bottom-right per UX LOCKED)
- NO changes to layout, state logic, polling, order flow

### Файл и локация
`pages/PublicMenu/x.jsx` — lines 751, 770, 1024, 1156, 1157, 3190, 3426, 3460

### Проверка
1. `grep -r "B5543A" pages/PublicMenu/x.jsx` → 0 results
2. `grep -r "primaryColor" pages/PublicMenu/x.jsx` → multiple results

---

## Fix 2 — PM-S81-04b (P2) [MUST-FIX]: CartView.jsx — 6 hardcoded colors → dynamic

### Сейчас
CartView.jsx contains 6 instances of `#B5543A` in CTA buttons, price text, active states.

### Должно быть
1. Add darkenColor/lightenColor helpers at file scope (same as Fix 1)
2. Read `partner?.primary_color || '#1A1A1A'` — partner is already passed as prop
3. Replace all 6 instances with inline styles using `primaryColor`

### НЕ должно быть
- NO remaining `#B5543A` or `#9A4530` in CartView.jsx
- NO changes to cart logic, submit flow, loyalty

### Файл и локация
`pages/PublicMenu/CartView.jsx`

### Проверка
`grep -r "B5543A" pages/PublicMenu/CartView.jsx` → 0 results

---

## Fix 3 — PM-S81-04c (P2) [MUST-FIX]: ModeTabs.jsx — add primaryColor prop

### Сейчас
ModeTabs.jsx has 1 hardcoded `#B5543A` for active tab. Component does not accept a color prop.

### Должно быть
1. Add `primaryColor` to component props (with default `'#1A1A1A'`)
2. Replace hardcoded color with `primaryColor` prop
3. In x.jsx, pass `primaryColor={primaryColor}` to `<ModeTabs>`

### НЕ должно быть
- NO remaining `#B5543A` in ModeTabs.jsx

### Файл и локация
`pages/PublicMenu/ModeTabs.jsx`

### Проверка
`grep -r "B5543A" pages/PublicMenu/ModeTabs.jsx` → 0 results

---

## Fix 4 — PM-S81-04d (P2) [MUST-FIX]: CheckoutView.jsx — 3 hardcoded + add partner to props

### Сейчас
CheckoutView.jsx has 3 hardcoded `#B5543A`. `partner` prop is passed but NOT destructured in function signature.

### Должно быть
1. Add `partner` to destructured props in CheckoutView function signature
2. Define `primaryColor = partner?.primary_color || '#1A1A1A'`
3. Replace 3 hardcoded colors with `primaryColor`

### НЕ должно быть
- NO remaining `#B5543A` in CheckoutView.jsx
- NO changes to checkout flow, payment logic

### Файл и локация
`pages/PublicMenu/CheckoutView.jsx`

### Проверка
`grep -r "B5543A" pages/PublicMenu/CheckoutView.jsx` → 0 results

---

## Fix 5 — PM-S81-04e (P2) [MUST-FIX]: MenuView.jsx — 11 hardcoded colors (incl hover)

### Сейчас
MenuView.jsx has 11 hardcoded colors: `#B5543A` for prices, buttons, badges + 2x `#9A4530` for hover states.

### Должно быть
1. Add darkenColor/lightenColor helpers at file scope
2. Read `partner?.primary_color || '#1A1A1A'` — partner is already passed as prop
3. Replace all 11 instances including hover states
4. For hover: use `onMouseEnter`/`onMouseLeave` with `primaryHover` or inline styles

### НЕ должно быть
- NO remaining `#B5543A` or `#9A4530` in MenuView.jsx
- NO changes to dish rendering logic, category logic

### Файл и локация
`pages/PublicMenu/MenuView.jsx`

### Проверка
`grep -r "B5543A\|9A4530" pages/PublicMenu/MenuView.jsx` → 0 results

---

## Fix 6 — PM-S81-04f (P3) [NICE-TO-HAVE]: x.jsx line 3426 — focus-within Tailwind class

### Сейчас
Table-code digit cells use `focus-within:border-[#B5543A]` Tailwind class which cannot be made dynamic.

### Должно быть
Replace with state-driven border: track focus state in React, apply `style={{borderColor: primaryColor}}` when focused.

### НЕ должно быть
- NO Tailwind dynamic color classes (they don't work with runtime values)

### Файл и локация
`pages/PublicMenu/x.jsx` line 3426

### Проверка
`grep "focus-within:border-\[#B5543A\]" pages/PublicMenu/x.jsx` → 0 results

---

## SCOPE LOCK — менять ТОЛЬКО то, что указано выше

- Replace ONLY colors `#B5543A`, `#9A4530`, `#F5E6E0` with dynamic values.
- ALL other code (layout, positions, sizes, behavior, state logic) — DO NOT TOUCH.
- UX LOCKED decisions (see `ux-concepts/UX_LOCKED_PublicMenu.md`) — FORBIDDEN to change.
- Do NOT refactor components, do NOT change file structure, do NOT add new components.
- Do NOT touch: polling logic, order flow, cart logic, drawer behavior, i18n.
- If you see a problem not from this task — SKIP it, do NOT fix.

## Implementation Notes
- Files: `x.jsx`, `CartView.jsx`, `ModeTabs.jsx`, `CheckoutView.jsx`, `MenuView.jsx`
- Helper functions define PER FILE at module scope (before components)
- `partner` object already loaded in x.jsx and passed as prop to sub-components
- Inline styles take priority over Tailwind classes — this is OK for dynamic colors
- git add pages/PublicMenu/x.jsx pages/PublicMenu/CartView.jsx pages/PublicMenu/ModeTabs.jsx pages/PublicMenu/CheckoutView.jsx pages/PublicMenu/MenuView.jsx && git commit -m "feat: dynamic primary color in PublicMenu from partner settings (#82)" && git push
=== END ===
