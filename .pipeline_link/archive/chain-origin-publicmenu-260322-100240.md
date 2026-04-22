---
page: PublicMenu
code_file: pages/PublicMenu/x.jsx
budget: 12
agent: cc+codex
chain_template: consensus-with-discussion
---

# Dynamic Primary Color — PublicMenu (#82 part 2)

Reference: BUGS_MASTER.md (PM-S81-04), ux-concepts/UX_LOCKED_PublicMenu.md.
Production page.

Context: Task #82 part 1 added color picker to PartnerSettings. Partner selects primary_color (hex code) from 8 presets (commit afeb603). This task makes PublicMenu dynamic: replace hardcoded #B5543A (terracotta) with partner.primary_color.

Pre-requisite: Field primary_color exists in Partner entity. PartnerSettings writes the value. If primary_color is null/undefined/empty, default is #1A1A1A.

## Fix 1 — x.jsx: 9 hardcoded colors [MUST-FIX]

In x.jsx, #B5543A is hardcoded at lines 751, 770, 1024, 1156, 1157, 3190, 3426, 3460. Define helpers darkenColor and lightenColor at module scope. Inside function X(), define: const primaryColor = partner?.primary_color || '#1A1A1A'. Replace all style={{backgroundColor:'#B5543A'}} with style={{backgroundColor: primaryColor}}. Replace all style={{color:'#B5543A'}} with style={{color: primaryColor}}. Pass primaryColor as prop to OrderConfirmationScreen and ModeTabs. Line 3190: activeColor="#B5543A" becomes activeColor={primaryColor}. Verification: grep B5543A pages/PublicMenu/x.jsx should return 0 results.

## Fix 2 — CartView.jsx: 6 hardcoded colors [MUST-FIX]

CartView.jsx has 6 instances of #B5543A. Add helpers at file scope. Read partner?.primary_color || '#1A1A1A' (partner is already a prop). Replace all 6 with inline styles. Verification: grep B5543A pages/PublicMenu/CartView.jsx returns 0.

## Fix 3 — ModeTabs.jsx: add primaryColor prop [MUST-FIX]

ModeTabs.jsx has 1 hardcoded #B5543A. Add primaryColor to component props with default '#1A1A1A'. Replace hardcoded color. In x.jsx pass primaryColor={primaryColor} to ModeTabs. Verification: grep B5543A pages/PublicMenu/ModeTabs.jsx returns 0.

## Fix 4 — CheckoutView.jsx: 3 hardcoded + destructure partner [MUST-FIX]

CheckoutView.jsx has 3 hardcoded #B5543A. partner prop is passed but NOT destructured in function signature. Add partner to destructured props. Define primaryColor. Replace 3 colors. Verification: grep B5543A pages/PublicMenu/CheckoutView.jsx returns 0.

## Fix 5 — MenuView.jsx: 11 hardcoded colors incl hover [MUST-FIX]

MenuView.jsx has 11 hardcoded colors: #B5543A for prices/buttons/badges plus 2x #9A4530 for hover. Add helpers. Read partner?.primary_color || '#1A1A1A'. Replace all 11. For hover use onMouseEnter/onMouseLeave with darkenColor result. Verification: grep "B5543A\|9A4530" pages/PublicMenu/MenuView.jsx returns 0.

## Fix 6 — x.jsx line 3426: focus-within Tailwind [NICE-TO-HAVE]

Table-code cells use focus-within:border-[#B5543A] which cannot be dynamic. Replace with state-driven border using style={{borderColor: primaryColor}} when focused.

## SCOPE LOCK

Replace ONLY colors #B5543A, #9A4530, #F5E6E0 with dynamic values. ALL other code DO NOT TOUCH. UX LOCKED decisions (ux-concepts/UX_LOCKED_PublicMenu.md) FORBIDDEN to change. Do NOT touch polling, order flow, cart logic, drawer, i18n.

## Implementation Notes

Files: x.jsx, CartView.jsx, ModeTabs.jsx, CheckoutView.jsx, MenuView.jsx. Helper functions per file at module scope. partner object already in x.jsx and passed as prop. Inline styles over Tailwind for dynamic colors.

git add pages/PublicMenu/x.jsx pages/PublicMenu/CartView.jsx pages/PublicMenu/ModeTabs.jsx pages/PublicMenu/CheckoutView.jsx pages/PublicMenu/MenuView.jsx && git commit -m "feat: dynamic primary color in PublicMenu (#82)" && git push
