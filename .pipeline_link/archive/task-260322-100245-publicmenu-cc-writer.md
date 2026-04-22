---
task_id: task-260322-100245-publicmenu-cc-writer
status: running
started: 2026-03-22T10:02:46+05:00
type: chain-step
page: PublicMenu
work_dir: C:/Dev/menuapp-code-review
budget_usd: 12.00
fallback_model: sonnet
version: 5.6
launcher: python-popen
---

# Task: task-260322-100245-publicmenu-cc-writer

## Config
- Budget: $12.00
- Mode: task-watcher.py launches Claude Code directly via Popen
- Fallback model: sonnet

## Prompt
---
chain: publicmenu-260322-100240
chain_step: 1
chain_total: 4
chain_step_name: cc-writer
chain_group: writers
chain_group_size: 2
page: PublicMenu
budget: 12.00
runner: cc
type: chain-step
---
=== CHAIN STEP: CC Writer (1/4) ===
Chain: publicmenu-260322-100240
Page: PublicMenu

You are the CC Writer in a modular consensus pipeline.
Your job: independently analyze the code and find ALL bugs.

INSTRUCTIONS:
1. Read the code file for PublicMenu in pages/PublicMenu/*.jsx
2. Also read README.md and BUGS.md in the same folder for context
3. Do your OWN independent analysis — find ALL bugs and issues
4. Focus on: logic errors, missing error handling, i18n issues, UI/UX for mobile-first, React anti-patterns
5. For each finding: [P0/P1/P2/P3] Title - Description. FIX: description of code change needed.
6. Write your findings to: pipeline/chain-state/publicmenu-260322-100240-cc-findings.md
7. Do NOT apply any fixes yet — only document findings

FORMAT for findings file:
# CC Writer Findings — PublicMenu
Chain: publicmenu-260322-100240

## Findings
1. [P0] Title — Description. FIX: ...
2. [P1] Title — Description. FIX: ...
...

## Summary
Total: N findings (X P0, Y P1, Z P2, W P3)

## Prompt Clarity
Rate the task description quality (1-5). For any score below 4, explain what was unclear:
- Overall clarity: [1-5]
- Ambiguous Fix descriptions (list Fix # and what was unclear): ...
- Missing context (what info would have helped): ...
- Scope questions (anything you weren't sure if it's in scope): ...

=== TASK CONTEXT ===
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
=== END ===


## Status
Running...
