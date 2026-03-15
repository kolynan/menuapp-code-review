# CC Writer Summary: AC-09 Toast on Cart Item Addition

**Task ID:** task-260314-002819-publicmenu
**Date:** 2026-03-14
**Session:** S121

## Finding

AC-09 was **already implemented** in commit `be74e0d` (S87, by Arman). The fix was present in `x.jsx` but not documented in BUGS.md.

### Implementation details (already in codebase):
- **x.jsx:20** — `import { toast } from "sonner"`
- **x.jsx:404** — i18n key `"cart.item_added": "Добавлено"` in `I18N_FALLBACKS`
- **x.jsx:2236** — `toast.success(t('cart.item_added'), { id: 'cart-add', duration: 2000 })` called after `setCart()` in `addToCart(dish)` function
- Toast uses `id: 'cart-add'` to deduplicate rapid taps (sonner replaces same-id toasts)
- Auto-dismisses after 2 seconds

### Flow:
1. User taps "+" button in MenuView.jsx (line 103 or 160)
2. Calls `addToCart(dish)` prop from x.jsx
3. x.jsx:2220-2237 updates cart state and fires sonner toast

## Files Changed

| File | Change |
|---|---|
| `pages/PublicMenu/BUGS.md` | Added AC-09 to Fixed Bugs section, updated version to 23.0 |
| `pages/PublicMenu/README.md` | Added S121 changelog entry, updated version to 8.0 |

## No Code Changes Required

The toast implementation was already complete and correct. No modifications to `.jsx` files were needed.

## Commit

`9d551fd` — `fix: AC-09 add toast on cart item addition S121`

## Follow-up Risk

None. The fix is stable and has been in production since S87.
