# Comparison Report — PublicMenu
Chain: publicmenu-260322-090606
Comparator: Manual (Cowork S159) — automated comparator failed (KB-084, KB-085)

## Agreed (both found)
1. **Hardcoded #B5543A must become dynamic** — CC: 29 instances across 5 files. Codex: 7 instances in x.jsx only. CC more complete (covers CartView, ModeTabs, CheckoutView, MenuView).
2. **Table-code focus-within Tailwind class non-dynamic** — CC #8 ≈ Codex #6. Both agree `focus-within:border-[#B5543A]` can't be made dynamic via Tailwind.

## CC Only (Codex missed)
1. **CartView.jsx: 6 hardcoded colors** — Codex only reviewed x.jsx. VALID, include.
2. **ModeTabs.jsx: 1 hardcoded color + needs new prop** — VALID, include.
3. **CheckoutView.jsx: 3 hardcoded + partner not destructured** — VALID, include.
4. **MenuView.jsx: 11 hardcoded colors (incl 2x hover)** — VALID, include.
5. **OrderConfirmationScreen needs primaryColor prop** — VALID, include.
6. **OrderStatusScreen has own partner query** — VALID, include.
7. **Helper functions per-file** — VALID, include.
8. **CheckoutView partner missing from signature** — VALID, include.

## Codex Only (CC missed)
1. [P1] **Partner lookup collapses backend errors** — Already tracked as PM-070. OUT OF SCOPE for #82.
2. [P1] **OrderStatusScreen fetch errors → "not found"** — Similar to PM-070 but for orders. New bug PM-074. OUT OF SCOPE for #82.
3. [P1] **StickyCartBar ignores visit lifecycle** — Already tracked as PM-065 + PM-058/059. OUT OF SCOPE for #82.
4. [P2] **Auto-submit timeout untracked** — React anti-pattern, new bug PM-075. OUT OF SCOPE for #82.
5. [P3] **Table-code focus feedback** — Codex #6 ≈ CC #8. Already covered in Agreed section.

## Disputes (disagree)
None. No direct contradictions — different scope depth (CC: all 5 files; Codex: x.jsx only).

## Final Fix Plan
Ordered list of all fixes for task #82 (dynamic primary color):

1. [P2] x.jsx: define `primaryColor = partner?.primary_color || '#1A1A1A'` + darkenColor/lightenColor helpers — replace 9 hardcoded colors — Source: **agreed**
2. [P2] CartView.jsx: read `partner.primary_color` — replace 6 hardcoded colors — Source: **CC only**
3. [P2] ModeTabs.jsx: add `primaryColor` prop — replace 1 hardcoded color — Source: **CC only**
4. [P2] CheckoutView.jsx: add `partner` to destructured props — replace 3 hardcoded colors — Source: **CC only**
5. [P2] MenuView.jsx: read `partner.primary_color` — replace 11 hardcoded colors (incl hover) — Source: **CC only**
6. [P2] OrderConfirmationScreen: add `primaryColor` prop from parent — Source: **CC only**
7. [P2] OrderStatusScreen: derive `primaryColor` from own partner query — Source: **CC only**
8. [P3] x.jsx line 3426: replace Tailwind `focus-within:border-[#B5543A]` with state-driven highlight — Source: **agreed**

## Summary
- Agreed: 2 items
- CC only: 8 items (8 accepted, 0 rejected)
- Codex only: 5 items (0 accepted for #82, 5 out of scope → 2 new bugs recorded)
- Disputes: 0
- Total fixes to apply for #82: 8
