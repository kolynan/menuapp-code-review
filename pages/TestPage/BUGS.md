# TestPage — Known Bugs

## Fixed
- **[P0] Missing await on response.json()** (line ~17) — `response.json()` returns a Promise; without `await`, `setItems` receives a Promise object instead of data. Fixed: added `await`.
- **[P1] No error handling in fetchItems** (line ~15) — Network errors crash silently, `loading` stays true forever. Fixed: added try/catch/finally.
- **[P1] No error handling in deleteItem** (line ~23) — Failed DELETE removes item from UI optimistically with no rollback. Fixed: added try/catch, check `res.ok`.

## Active
No active bugs.
