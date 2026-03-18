# TestPage — Known Bugs

## Fixed (chain testpage-260318-235014)

1. **[P0] Missing `await` on `response.json()`** (line 17) — returns Promise instead of data, causes `.map()` crash
2. **[P1] No error handling on fetch calls** (lines 15-20, 23-26) — network errors crash the page silently
3. **[P1] `fetchItems` defined after `useEffect` call** — TDZ risk moved function above useEffect
4. **[P2] Inline styles** (line 31) — `style={{ padding: 16 }}` violates Tailwind-only rule, replaced with `className="p-4"`
5. **[P2] Stale closure in `deleteItem`** (line 25) — `items` captured by closure, replaced with functional `setItems(prev => ...)`

## Active

No active bugs.
