# TestPage — Known Bugs

## Fixed
- **[P0] Missing await on response.json()** (line ~17) — `response.json()` returns a Promise; without `await`, `setItems` receives a Promise object instead of data. Fixed: added `await`.
- **[P1] No error handling in fetchItems** (line ~15) — Network errors crash silently, `loading` stays true forever. Fixed: added try/catch/finally.
- **[P1] No error handling in deleteItem** (line ~23) — Failed DELETE removes item from UI optimistically with no rollback. Fixed: added try/catch, check `res.ok`.

- **[P1] Hardcoded user-facing strings** (lines 36,40,44) — No i18n. Fixed: added useI18n, replaced with t() keys.
- **[P1] Stale closure in deleteItem** (line 30) — `setItems(items.filter(...))` loses concurrent deletes. Fixed: functional updater `setItems(prev => ...)`.
- **[P1] No response.ok check in fetchItems** (line 17) — Non-2xx responses treated as success. Fixed: added `if (!response.ok) throw`.
- **[P2] Inline styles instead of Tailwind** (line 39) — `style={{ padding: 16 }}`. Fixed: replaced with `className="p-4"`.
- **[P2] console.error in production** (lines 20,32) — No user feedback. Fixed: removed console.error, added error state display.
- **[P2] No minimum touch target for Delete** (line 44) — Below 44x44px. Fixed: added min-h/min-w classes.
- **[P2] No empty state** — Empty items shows nothing. Fixed: added empty state message.
- **[P2] No user-facing error feedback** — Errors only in console. Fixed: added error state and UI display.

## Active
No active bugs.
