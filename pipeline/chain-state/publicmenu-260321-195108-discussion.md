# Discussion Report — PublicMenu
Chain: publicmenu-260321-195108

## Result
No disputes found. All items agreed or resolved by Comparator. Skipping discussion.

The Comparator identified 0 disputes — CC and Codex findings were complementary, not contradictory. The two P1 root causes (validate gate + Drawer stacking) address different layers of the same bug and both are needed.

## Final Fix Plan (unchanged from Comparator)

| # | Priority | Title | Source | Description |
|---|----------|-------|--------|-------------|
| 1 | **P1** | Move `!isTableVerified` check before `validate()` | Codex | In `handleSubmitOrder`, intercept `orderMode === "hall" && !isTableVerified` BEFORE calling `validate()`, so `validate()` doesn't silently block the BS trigger |
| 2 | **P1** | Fix Drawer stacking — BS visible over Cart Drawer | CC | Move confirmation Drawer inside Cart `<DrawerContent>`, OR convert BS to fixed-position overlay with `z-[60]`, ensuring it renders above cart overlay |
| 3 | **P2** | Move verification state to x.jsx with the BS | Agreed | Move `codeAttempts`, `codeLockedUntil`, cooldown timer, and auto-verify from CartView.jsx to x.jsx so the BS has full UX feedback |
| 4 | **P2** | Add `tr()` fallbacks for BS i18n keys | CC | Replace `t('cart.confirm_table.*')` with `tr('cart.confirm_table.*', 'Russian fallback')` |
| 5 | **P2** | Remove `console.error` in `saveTableSelection` | CC | Remove or silence `console.error("Failed to save table", e)` at x.jsx:1530 |

## Unresolved (for Arman)
None.
