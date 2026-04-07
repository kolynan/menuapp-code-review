# Comparison Report — PublicMenu
Chain: publicmenu-260322-114012

## Task Scope Reminder
Replace hardcoded #B5543A / #9A4530 / #F5E6E0 with dynamic `partner.primary_color`. SCOPE LOCK: only color changes, no other code modifications.

## Agreed (both found)

1. **x.jsx hardcoded #B5543A (8 instances)** — Both CC and Codex identify all 8 hardcoded terracotta colors in x.jsx at lines 751, 770, 1024, 1156-1157, 3032, 3190, 3426, 3460. CC provides per-line fixes; Codex bundles them into finding #1. **HIGH confidence — apply all.**

2. **Helper functions needed (darkenColor, lightenColor)** — Both agree module-scope color helpers are needed. CC provides concrete implementations. Codex mentions them without code. **Use CC's implementations.**

3. **primaryColor definition in X()** — Both agree: `const primaryColor = partner?.primary_color || '#1A1A1A'` inside function X(). **Agreed.**

4. **focus-within:border-[#B5543A] at x.jsx:3426** — Both identify this Tailwind arbitrary value cannot be dynamic. Both recommend state-driven inline border. CC provides more detail (onFocus/onBlur per cell). **Agreed on approach.**

5. **Prop wiring for child components** — CC explicitly identifies: partner→OrderConfirmationScreen, partner destructure in CheckoutView, primaryColor→ModeTabs. Codex mentions "pass primaryColor to child components" generically. **Agreed — use CC's detailed prop plan.**

## CC Only (Codex missed)

6. **CartView.jsx: 6 hardcoded colors (CC #9-14)** — CC found all 6 instances including #F5E6E0 loyalty background. Codex finding #1 only mentions x.jsx. **VALID — accept. CartView is explicitly in task scope.**

7. **ModeTabs.jsx: 1 hardcoded color + new prop (CC #15, #34)** — CC found the active tab backgroundColor and specified the prop wiring. Codex omitted. **VALID — accept.**

8. **CheckoutView.jsx: 3 hardcoded colors + destructure fix (CC #16-18, #33)** — CC found all 3 instances and the missing partner destructure. Codex omitted. **VALID — accept.**

9. **MenuView.jsx: 11 hardcoded colors incl hover (CC #19-29)** — CC found all 11 instances including #9A4530 hover colors and layout toggle buttons. Codex omitted entirely. **VALID — accept. This is the file with the most instances.**

10. **OrderConfirmationScreen missing partner prop (CC #32)** — CC identified that OrderConfirmationScreen at x.jsx:604 doesn't receive partner, needs wiring at x.jsx:3270. Codex didn't flag. **VALID — required for color to work in that component.**

11. **OrderStatusScreen self-contained approach (CC #35)** — CC recommends using OrderStatusScreen's own partner query result rather than prop drilling. Pragmatic choice. **VALID — accept option (b).**

## Codex Only (CC missed)

12. **[P1] Partner lookup hides backend failures (Codex #2)** — Partner query catches errors and returns null, showing "not found" for transient API failures. **VALID bug, but OUT OF SCOPE for this task.** Task scope is color replacement only. → Record in BUGS_MASTER.md / BACKLOG.

13. **[P1] Order tracking misclassifies fetch failures (Codex #3)** — OrderStatusScreen conflates orderError with missing order. **VALID bug, but OUT OF SCOPE.** → Record in BUGS_MASTER.md / BACKLOG.

14. **[P1] Hall StickyCartBar 4-state heuristic (Codex #4)** — Sticky bar doesn't use full visit lifecycle. **VALID observation, but OUT OF SCOPE.** Already tracked as known issue in BUGS.md. → Skip (already known).

15. **[P2] Table-confirm bottom sheet retry/cooldown (Codex #5)** — No attempts remaining or lockout countdown shown. **OUT OF SCOPE.** → Record if not already tracked.

16. **[P2] Auto-submit uncleared timer (Codex #6)** — setTimeout not cleaned up on unmount. **VALID bug, but OUT OF SCOPE.** → Record in BUGS_MASTER.md.

17. **[P3] Production console.error calls (Codex #7)** — Multiple console.error in production flows. **OUT OF SCOPE** (task says "DO NOT TOUCH" anything outside color). → Already known pattern, low priority.

## Disputes (disagree)

**No disputes on in-scope items.** Both CC and Codex agree on the x.jsx color approach. The only difference is coverage: CC analyzed all 5 files comprehensively; Codex only analyzed x.jsx colors and then found 6 out-of-scope bugs.

## Final Fix Plan

Ordered list of all fixes to apply (IN SCOPE ONLY):

### x.jsx
1. [P1] Define `const primaryColor = partner?.primary_color || '#1A1A1A'` in function X() — Source: agreed
2. [P1] x.jsx:751 — OrderConfirmationScreen backgroundColor → primaryColor — Source: agreed
3. [P1] x.jsx:770 — OrderConfirmationScreen color → primaryColor — Source: agreed
4. [P1] x.jsx:1024 — OrderStatusScreen spinner color → primaryColor (use internal partner data) — Source: CC
5. [P1] x.jsx:1156-1157 — OrderStatusScreen contact colors → primaryColor — Source: CC
6. [P1] x.jsx:3032 — Loading spinner color → primaryColor (defaults to #1A1A1A while loading) — Source: agreed
7. [P1] x.jsx:3190 — CategoryChips activeColor → primaryColor — Source: agreed
8. [P2] x.jsx:3426 — focus-within Tailwind → state-driven borderColor — Source: agreed
9. [P1] x.jsx:3460 — Bottom Sheet confirm button → primaryColor — Source: agreed
10. [P1] Wire partner prop to OrderConfirmationScreen (x.jsx:604 signature + x.jsx:3270 JSX) — Source: CC
11. [P1] Wire primaryColor prop to ModeTabs (x.jsx:3165 JSX) — Source: CC
12. [P1] OrderStatusScreen: define primaryColor from internal orderPartner query — Source: CC

### CartView.jsx
13. [P1] Define primaryColor from partner prop — Source: CC
14. [P1] CartView.jsx:470 — guest name edit color → primaryColor — Source: CC
15. [P1] CartView.jsx:508 — "Get bonus" color → primaryColor — Source: CC
16. [P1] CartView.jsx:862 — radio accentColor → primaryColor — Source: CC
17. [P1] CartView.jsx:872 — radio accentColor → primaryColor — Source: CC
18. [P1] CartView.jsx:1067 — submit button backgroundColor → primaryColor — Source: CC
19. [P2] CartView.jsx:954 — #F5E6E0 loyalty background → lightenColor(primaryColor, 0.85) — Source: CC
20. [P1] Add lightenColor helper at module scope — Source: CC

### ModeTabs.jsx
21. [P1] Add primaryColor prop with default '#1A1A1A' — Source: CC
22. [P1] ModeTabs.jsx:38 — active tab backgroundColor → primaryColor — Source: CC

### CheckoutView.jsx
23. [P1] Add partner to destructured props — Source: CC
24. [P1] Define primaryColor from partner — Source: CC
25. [P1] CheckoutView.jsx:37 — "Back to menu" color → primaryColor — Source: CC
26. [P1] CheckoutView.jsx:76 — total price color → primaryColor — Source: CC
27. [P1] CheckoutView.jsx:175 — submit button backgroundColor → primaryColor — Source: CC

### MenuView.jsx
28. [P1] Define primaryColor from partner prop — Source: CC
29. [P1] Add darkenColor helper at module scope — Source: CC
30. [P1] MenuView.jsx:85 — list card price color → primaryColor — Source: CC
31. [P1] MenuView.jsx:105 — list card add button backgroundColor → primaryColor — Source: CC
32. [P1] MenuView.jsx:106-107 — list card hover → darkenColor/primaryColor — Source: CC
33. [P1] MenuView.jsx:166 — tile card add button backgroundColor → primaryColor — Source: CC
34. [P1] MenuView.jsx:167-168 — tile card hover → darkenColor/primaryColor — Source: CC
35. [P1] MenuView.jsx:209 — tile card price color → primaryColor — Source: CC
36. [P1] MenuView.jsx:238 — tile layout toggle backgroundColor → primaryColor — Source: CC
37. [P1] MenuView.jsx:250 — list layout toggle backgroundColor → primaryColor — Source: CC
38. [P1] MenuView.jsx:260 — spinner color → primaryColor — Source: CC

## Out-of-Scope Findings (for BACKLOG/BUGS_MASTER)
- Codex #2: Partner lookup hides backend failures as "not found"
- Codex #3: Order tracking misclassifies fetch failures
- Codex #5: Table-confirm bottom sheet missing retry/cooldown UX
- Codex #6: Auto-submit uncleared setTimeout

## Summary
- Agreed: 5 items (x.jsx colors, helpers, primaryColor def, focus-within, prop wiring)
- CC only: 6 items (CartView 6 colors, ModeTabs 1 color, CheckoutView 3 colors, MenuView 11 colors, OrderConfirmation prop, OrderStatusScreen approach) — **all 6 accepted**
- Codex only: 6 items (all out-of-scope bugs) — **0 accepted for this task, 4 recorded for BACKLOG**
- Disputes: 0 items
- **Total fixes to apply: 38**
