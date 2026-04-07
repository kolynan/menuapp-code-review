# Comparison Report — PublicMenu
Chain: publicmenu-260326-234309-77f1

## Agreed (both found)

### 1. PM-148 (P3): Table confirmation banner still visible
Both CC and Codex agree the banner is NOT rendered directly in x.jsx — it comes from a child component (likely ModeTabs) that receives verification props. Both agree the fix must be done within x.jsx scope.

- **CC analysis:** Banner inline rendering was already removed (TASK-260127-01, line 3298 comment). The i18n key `cart.verify.table_verified` at line 481 is defined but never used in x.jsx. Banner likely comes from ModeTabs or useHallTable hook. CC proposes removing the unused i18n key and flagging external components.
- **Codex analysis:** ModeTabs at lines 3371-3384 receives `verifiedByCode`, `currentTableId`, `currentTable`, `resolvedTable` — these props drive the banner. No gate exists to suppress the banner after confirmation. Codex proposes removing banner-driving props or passing a "do not show" flag.

**Verdict:** Both agree on the root cause. Codex's approach is **more actionable** — modifying the props passed to ModeTabs (e.g., not passing `verifiedByCode` or adding a suppress flag) is more likely to actually hide the banner than just removing an unused i18n key. **Use Codex's approach + CC's i18n cleanup combined:**
1. Remove unused i18n key at line 481 (CC — dead code cleanup)
2. Suppress the banner by not forwarding `verifiedByCode` to ModeTabs, or resetting it after confirmation (Codex — actual fix)

### 2. PM-149 (P3): Guest ID suffix (#N) visible in guest-facing UI
Both CC and Codex agree on the same approach: create a wrapper function in x.jsx that strips the trailing `#N` suffix using regex before display.

- **CC analysis:** Proposes `getGuestDisplayNameClean()` wrapper with regex `/\s*#\d+$/`. Apply at line 2773 (confirmation screen) and line 3530 (CartView prop).
- **Codex analysis:** Same approach — derive guest-facing formatter stripping `\s+#\d+$`. Apply at CartView prop (lines 3519-3530) and hall-order confirmation label (lines 2772-2774, 3478-3481).

**Verdict:** Full agreement. CC's implementation is more detailed (provides the actual function code). Codex identifies an additional usage at lines 3478-3481 that CC didn't mention — **merge both: use CC's function code, apply at all locations identified by both.**

## CC Only (Codex missed)

None. Both reviewers identified the same two issues.

## Codex Only (CC missed)

### Additional usage location for PM-149
Codex identified lines 3478-3481 as an additional location where `getGuestDisplayName` is used for display. CC only identified lines 2773 and 3530. The merger should check all three locations.

**Verdict:** Accepted — the merger should verify and apply the wrapper at all guest-facing display locations.

## Disputes (disagree)

### PM-148 fix approach
- **CC:** Remove i18n key only; flag external components as out-of-scope.
- **Codex:** Modify props passed to ModeTabs to suppress the banner.

**Resolution:** Not a true dispute — complementary approaches. The merger should:
1. Try Codex's approach first (suppress via props — higher chance of actually fixing the banner)
2. Also apply CC's i18n cleanup (remove dead key)
3. If props modification doesn't work within x.jsx scope, document as "needs fix in ModeTabs component"

## Final Fix Plan

1. **[P3] PM-148: Remove table confirmation banner** — Source: agreed (Codex approach + CC cleanup)
   - Remove unused i18n key `cart.verify.table_verified` at line 481
   - Investigate ModeTabs props at lines 3371-3384: suppress banner by not forwarding `verifiedByCode` or resetting it after table confirmation
   - If banner is controlled entirely within ModeTabs/useHallTable internals, document as out-of-scope

2. **[P3] PM-149: Strip guest ID suffix from display** — Source: agreed (CC implementation + Codex locations)
   - Create `getGuestDisplayNameClean()` wrapper function with regex `/\s*#\d+$/`
   - Apply at: line 2773 (confirmation screen), lines 3478-3481 (if applicable), line 3530 (CartView prop)
   - Keep original `getGuestDisplayName` for staff-facing / internal use

## Summary
- Agreed: 2 items
- CC only: 0 items
- Codex only: 1 item (additional location for PM-149, accepted)
- Disputes: 0 real disputes (1 complementary approach difference on PM-148, resolved)
- Total fixes to apply: 2
