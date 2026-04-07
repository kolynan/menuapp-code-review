# CC Writer Findings — PublicMenu
Chain: publicmenu-260323-103002-0c33

## Findings

### Fix 1 — PM-S81-15 (P1): Android back button closes browser instead of drawer/cart

**Analysis:** Confirmed. `x.jsx` uses `window.history.replaceState` on lines 1468, 1478, 1493, 1889, 2250 but never calls `history.pushState`. No `popstate` event listener exists anywhere in the file. On Android, the hardware back button triggers `popstate`, and since the app creates no history entries, the browser navigates away (closes tab).

**Overlay states found in x.jsx:**
- `drawerMode` (line 1271): `'cart' | null` — the cart bottom drawer
- `showTableConfirmSheet` (line 1274): `boolean` — table confirmation bottom sheet
- `view` (line 1262): `'menu' | 'checkout' | 'confirmation' | 'orderstatus'` — full-screen views

**Note:** Task description mentions `showTableCodeSheet` but this state does NOT exist in the current code. Only `showTableConfirmSheet` exists.

**FIX (3 parts):**

**Part A — Push history entry when opening overlays:**

1. Where `setDrawerMode("cart")` is called (lines 3288, 3572): add `window.history.pushState({ overlay: 'cart' }, '');` BEFORE the `setDrawerMode("cart")` call.
   - Line 3572 has a toggle pattern (`setDrawerMode(drawerMode === 'cart' ? null : 'cart')`), so pushState should only fire when opening (when `drawerMode !== 'cart'`).
   - Line 3288 always opens cart, so pushState is unconditional there.

2. Where `setShowTableConfirmSheet(true)` is called (line 2630): add `window.history.pushState({ overlay: 'tableConfirm' }, '');` BEFORE it.

**Part B — popstate listener (useEffect):**

Add near line ~1500 (after other effects):
```js
useEffect(() => {
  const handlePopState = () => {
    if (drawerMode === 'cart') {
      setDrawerMode(null);
      return;
    }
    if (showTableConfirmSheet) {
      setShowTableConfirmSheet(false);
      return;
    }
    // No overlay open — let browser handle normally
  };
  window.addEventListener('popstate', handlePopState);
  return () => window.removeEventListener('popstate', handlePopState);
}, [drawerMode, showTableConfirmSheet]);
```

**Part C — Prevent pushState during submission:**

Line 3571 already guards against toggling during submit: `if (isSubmitting && drawerMode === 'cart') return;`. The popstate handler should also respect this — if `isSubmitting` is true and cart is open, re-push the history entry instead of closing:
```js
if (drawerMode === 'cart') {
  if (isSubmitting) {
    window.history.pushState({ overlay: 'cart' }, '');
    return;
  }
  setDrawerMode(null);
  return;
}
```

**Edge cases to handle:**
- Multiple pushState calls (open cart, close, open again) — each open should push one entry. Each close (via popstate) consumes one entry. This is correct behavior.
- The `onOpenChange` handler on the Drawer (line 3309) also closes the cart — this does NOT need a `history.back()` call because the user closed via swipe/X, not via back button. The extra history entry will be consumed next time they press back — acceptable behavior (matches WhatsApp Web pattern).

---

### Fix 2 — PM-076 (P3): 11 console.error calls leak internal details in production

**Analysis:** Confirmed. Found exactly 11 `console.error` calls in `x.jsx`:

| # | Line | Message | Context |
|---|------|---------|---------|
| 1 | 2071 | `'Failed to save rating:', err` | catch in rating save |
| 2 | 2164 | `"Failed to init guest code", e` | catch in guest code init |
| 3 | 2413 | `"Rate limit check failed", e` | catch in rate limit check |
| 4 | 2517 | `'Post-create loyalty side effect failed:', sideEffectErr` | catch in loyalty redemption |
| 5 | 2548 | `'Post-create earn points failed:', earnErr` | catch in loyalty earn |
| 6 | 2552 | `'Partner counter update failed:', e` | catch in partner counter update |
| 7 | 2894 | `'Post-create loyalty side effect failed:', sideEffectErr` | duplicate loyalty catch (hall order path) |
| 8 | 2925 | `'Post-create earn points failed:', earnErr` | duplicate earn catch (hall order path) |
| 9 | 2955 | `err` (bare) | catch in main submit handler |
| 10 | 2981 | `'Failed to update guest name:', err` | catch in guest name update |
| 11 | 3012 | `'Failed to request bill:', err` | catch in bill request |

**CartView.jsx:** No `console.error` calls found (grep returned 0 matches). No action needed for CartView.jsx for this fix.

**No `process.env.NODE_ENV` guards found** — all console.error calls are unconditional.

**FIX:** Remove each `console.error(...)` line and replace with `// silent` comment. Do NOT remove the catch block, do NOT change any other logic. Mechanical find-and-replace for all 11 occurrences.

Example pattern:
```js
// BEFORE:
} catch (err) {
  console.error('Failed to save rating:', err);
  toast.error(t('error.save_failed'), { id: 'mm1' });
}

// AFTER:
} catch (err) {
  // silent
  toast.error(t('error.save_failed'), { id: 'mm1' });
}
```

For bare `console.error(err)` at line 2955:
```js
// BEFORE:
} catch (err) {
  console.error(err);
  setSubmitError(t('error.send.title'));
}

// AFTER:
} catch (err) {
  // silent
  setSubmitError(t('error.send.title'));
}
```

For one-liner catch at line 2552:
```js
// BEFORE:
try { ... } catch (e) { console.error('Partner counter update failed:', e); }

// AFTER:
try { ... } catch (e) { /* silent */ }
```

## Summary
Total: 2 findings (0 P0, 1 P1, 0 P2, 1 P3)

- Fix 1 (P1): Android back button — add `pushState` on overlay open + `popstate` listener to close overlays. 3 code locations to add pushState, 1 useEffect to add. Note: `showTableCodeSheet` from task description does not exist; only `showTableConfirmSheet` exists.
- Fix 2 (P3): Remove 11 `console.error` calls in x.jsx. CartView.jsx has none. Mechanical removal, no logic changes.

## ⛔ Prompt Clarity

- **Overall clarity: 4/5** — Task description is well-structured with clear before/after patterns and anti-patterns.
- **Ambiguous Fix descriptions:**
  - Fix 1: mentions `showTableCodeSheet` state variable which does NOT exist in current code. Only `showTableConfirmSheet` exists. This caused unnecessary search time. The task should verify state names against actual code before specifying them.
  - Fix 1: does not mention the `view` state (`checkout`, `confirmation`, `orderstatus`) which are also full-screen overlays. Should these also get pushState? The task is silent on this. I scoped to only `drawerMode` and `showTableConfirmSheet` as explicitly listed.
- **Missing context:** Line numbers are approximate (noted with ~) which is fine, but the `showTableCodeSheet` reference is misleading.
- **Scope questions:** The toggle pattern on line 3572 (`setDrawerMode(drawerMode === 'cart' ? null : 'cart')`) — should pushState fire on every toggle-open, or only on the first open? I assumed every open (matches LMP pattern).
