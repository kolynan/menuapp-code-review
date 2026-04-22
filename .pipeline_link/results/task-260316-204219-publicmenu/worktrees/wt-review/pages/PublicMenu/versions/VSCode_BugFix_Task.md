# VS Code Task: Fix BUG-PM-004 + BUG-PM-005

## Context

Two active bugs in the PublicMenu page (pages/PublicMenu/PublicMenu_BASE.txt) related to the useTableSession hook (pages/PublicMenu/useTableSession.jsx).

## Files to modify
- `pages/PublicMenu/PublicMenu_BASE.txt` — main page component (2460+ lines)
- `pages/PublicMenu/useTableSession.jsx` — session management hook (758 lines)

## BUG-PM-004: Drawer auto-resets guest orders (P0)

### Symptoms
After submitting a hall order, the cart drawer shows "Ваши заказы (1)" with the guest's order total. After ~10 seconds, it auto-switches to show only "Заказы стола" without the guest's orders. The guest's order data disappears from the UI.

### Root Cause
In `useTableSession.jsx`, the polling effect (line ~456-607) runs every 10 seconds. At line 540-542:
```js
const orders = await getSessionOrders(sessionId);
setSessionOrders(orders || []);
```
This **completely replaces** `sessionOrders` with server data. But in `PublicMenu_BASE.txt` line ~1631, `processHallOrder` does an **optimistic update**:
```js
setSessionOrders(prev => [orderWithGuest, ...prev]);
```
If the server hasn't indexed the new order yet when polling fires (within 10s), the optimistic data is wiped and `myOrders` (which filters `sessionOrders` by `currentGuestIdRef`) returns empty.

### Fix approach
In `useTableSession.jsx` polling (line ~540-542), use a **merge strategy** instead of full replacement:
```js
setSessionOrders(prev => {
  const serverIds = new Set((orders || []).map(o => o.id));
  // Keep optimistic orders (temp IDs or orders not yet on server)
  const optimistic = prev.filter(o => !serverIds.has(o.id) && !o._fromServer);
  return [...(orders || []), ...optimistic];
});
```
Also mark server orders to distinguish them, and add a TTL (30s) for optimistic orders so they don't persist forever if the server truly rejected them.

Similarly fix `setSessionItems` at line ~570 with the same merge approach.

### Alternative simpler fix
After `processHallOrder` succeeds, skip one polling cycle:
```js
// In useTableSession, add a ref:
const skipNextPollRef = useRef(false);
// Export it so PublicMenu can set it
// In pollSessionData, at the top:
if (skipNextPollRef.current) { skipNextPollRef.current = false; return; }
// In PublicMenu processHallOrder, after setSessionOrders:
skipNextPollRef.current = true;
```
This is simpler but less robust. The merge strategy is recommended.

## BUG-PM-005: Cart lost on page refresh F5 (P1)

### Symptoms
User adds items to cart, presses F5 (page refresh), cart is empty. All added items are lost.

### Root Cause
In `PublicMenu_BASE.txt`, the `cart` state is a plain `useState([])` — it only lives in memory. On page refresh, React state resets.

### Fix approach
1. Find where `cart` is initialized (search for `useState` with cart). It should be something like:
   ```js
   const [cart, setCart] = useState([]);
   ```

2. Replace with localStorage persistence:
   ```js
   const getCartStorageKey = (partnerId) => `menuApp_cart_${partnerId}`;

   const loadCartFromStorage = (partnerId) => {
     try {
       const raw = localStorage.getItem(getCartStorageKey(partnerId));
       if (!raw) return [];
       const data = JSON.parse(raw);
       // TTL: 4 hours
       if (Date.now() - (data.ts || 0) > 4 * 60 * 60 * 1000) {
         localStorage.removeItem(getCartStorageKey(partnerId));
         return [];
       }
       return Array.isArray(data.items) ? data.items : [];
     } catch { return []; }
   };

   const saveCartToStorage = (partnerId, items) => {
     try {
       localStorage.setItem(getCartStorageKey(partnerId), JSON.stringify({ items, ts: Date.now() }));
     } catch {}
   };

   // Initialize cart from storage
   const [cart, setCart] = useState(() => loadCartFromStorage(partner?.id));

   // Sync to storage on change
   useEffect(() => {
     if (partner?.id) saveCartToStorage(partner.id, cart);
   }, [cart, partner?.id]);
   ```

3. Also check `clearCart()` function — make sure it calls `localStorage.removeItem(getCartStorageKey(partner.id))` when clearing after order submit. There's already a `clearCartStorage` function at line ~1647 — verify it clears the right key.

4. Edge case: if the partner data hasn't loaded yet on refresh, don't overwrite storage with empty cart. Guard:
   ```js
   useEffect(() => {
     if (partner?.id && cart.length > 0) saveCartToStorage(partner.id, cart);
     if (partner?.id && cart.length === 0) {
       // Only clear storage if we intentionally cleared (not on initial empty state)
       // Use a ref to track if cart was ever populated
     }
   }, [cart, partner?.id]);
   ```

## Review checklist after fixing
- [ ] After hall order submit, "Ваши заказы" persists through polling cycles
- [ ] After F5, cart items are restored
- [ ] After order submit + F5, cart is empty (clearCart worked)
- [ ] Switching tables clears the cart (different partner/table context)
- [ ] No stale optimistic orders after 30+ seconds
- [ ] No console.log left in production paths
