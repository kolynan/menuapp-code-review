# CC Discussion Position — CartView
Chain: cartview-260415-160645-6ec7
Topic: CV-BUG-03 Scroll-to-new-order impl plan

## Questions Analyzed

### Q1: How to detect "new order" for scroll?

**Recommendation:** Option B — explicit prop `lastSubmittedOrderId` from submit flow

**Reasoning:**

Option A (ref on `activeOrders` length change) is fragile. The length of `todayMyOrders` can change for reasons other than the guest submitting a new order:
- Polling brings in a status change that removes a cancelled order (the `.filter(o => o.status !== 'cancelled')` at line 393).
- Another guest's order appears if `myOrders` is somehow mis-scoped.
- On Chrome restore (CV-74), the component re-mounts with the full order list — a length-based `useEffect` would fire a false scroll on every mount since the "previous length" ref starts at 0.

Option C (comparing `created_date` with mount timestamp) has race issues: if polling (CV-80) delivers the new order with a slight delay after submit, the timestamp comparison may miss it; conversely, on remount after kill (CV-74), orders created before the kill but after the mount timestamp would falsely trigger a scroll.

Option B is the cleanest because the parent component already knows exactly when a submit succeeds. The flow is:
1. `handleSubmitOrder()` succeeds → parent sets `lastSubmittedOrderId` to the new order's ID.
2. CartView `useEffect` sees the new prop, scrolls once, done.
3. No false triggers on remount, polling, or status changes.

**Trade-offs:**
- Requires a small change in the parent (PublicMenu) to thread the prop. This is a one-line state + one-line setter in the submit callback.
- If the order ID isn't immediately available in the submit response (async Base44), we may need a fallback. But typically `createOrder` returns the created record with its ID.

**Mobile UX:** No difference between options on mobile — the detection mechanism is invisible to the user. What matters is that it fires exactly once and only when the guest actually submitted.

**Edge cases:**
- **CV-80 (polling race):** With option B, we don't depend on polling at all — the trigger is the submit callback itself. If polling hasn't yet delivered the order to `todayMyOrders`, the scroll target may not exist yet. Mitigation: use a short retry (requestAnimationFrame + one fallback setTimeout 300ms) to wait for the order card to render.
- **CV-74 (Chrome restore):** With option B, `lastSubmittedOrderId` resets to `null` on remount — no false trigger.
- **Tab context (guest on "Стол" tab):** CartView doesn't have tabs — it's a flat drawer. The "Заказы стола" section (line 740) shows other guests. The new order always appears in `statusBuckets.new_order` (line 410) which renders in the main bucket list. So scrolling always targets the same container.

**Pseudocode:**
```jsx
// In parent (PublicMenu):
const [lastSubmittedOrderId, setLastSubmittedOrderId] = useState(null);
// in submit callback: setLastSubmittedOrderId(newOrder.id);

// In CartView — new prop: lastSubmittedOrderId
```

---

### Q2: Where exactly to scroll and how?

**Recommendation:** `scrollIntoView({ behavior: 'smooth', block: 'start' })` on the new order's bucket card, with a sticky-header offset guard and a no-op check.

**Reasoning:**

The drawer uses either a `[data-radix-scroll-area-viewport]` or a `[role="dialog"]` as scroll container (line 184 already uses this pattern for table-code verification scroll). Using `element.scrollIntoView()` is the simplest approach that works regardless of which scroll container is active.

**Method — step by step:**

1. **Target element:** Add a `data-order-id={orderId}` attribute to each order's status-bucket `<Card>` wrapper. After detecting the new order (Q1), query `document.querySelector(`[data-order-id="${lastSubmittedOrderId}"]`)`.

   Actually — since orders appear as items inside bucket cards (not individual cards per order), a better target is the `new_order` bucket card itself. We can add `data-bucket="new_order"` to the Card at line 943. The scroll target is always the "Отправлено" bucket because a freshly submitted order enters status `new`.

2. **scrollIntoView call:**
   ```jsx
   targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
   ```
   `block: 'start'` aligns the top of the card with the top of the viewport — this is better than `block: 'nearest'` because the user explicitly expects to see the new order at the top after submitting.

3. **Sticky header offset:** The drawer header (lines 667-737) is `bg-white rounded-lg shadow-sm border` but it's NOT sticky — it scrolls with content. So no offset is needed. The sticky element is only the bottom footer (line 1114, `sticky bottom-0`). Since we're scrolling to top-aligned content and the sticky element is at the bottom, there's no overlap issue.

4. **No-op check:** Before scrolling, check if the target element is already within the visible viewport:
   ```jsx
   const rect = targetEl.getBoundingClientRect();
   const container = targetEl.closest('[data-radix-scroll-area-viewport], [role="dialog"]');
   const containerRect = container?.getBoundingClientRect();
   if (containerRect && rect.top >= containerRect.top && rect.bottom <= containerRect.bottom) {
     return; // already visible, no-op
   }
   ```
   This prevents jarring scroll when the order card is already in view (e.g., short order list).

5. **Timing:** The scroll must happen after React renders the new order in the bucket. Use:
   ```jsx
   React.useEffect(() => {
     if (!lastSubmittedOrderId) return;
     // Ensure bucket is expanded
     setExpandedStatuses(prev => ({ ...prev, new_order: true }));
     // Wait for render
     const raf = requestAnimationFrame(() => {
       const el = document.querySelector('[data-bucket="new_order"]');
       if (!el) {
         // Fallback: order not rendered yet (polling delay)
         const timer = setTimeout(() => {
           const el2 = document.querySelector('[data-bucket="new_order"]');
           if (el2) el2.scrollIntoView({ behavior: 'smooth', block: 'start' });
         }, 300);
         return () => clearTimeout(timer);
       }
       // No-op check
       const rect = el.getBoundingClientRect();
       const vp = el.closest('[data-radix-scroll-area-viewport], [role="dialog"]');
       if (vp) {
         const vpRect = vp.getBoundingClientRect();
         if (rect.top >= vpRect.top && rect.bottom <= vpRect.bottom) return;
       }
       el.scrollIntoView({ behavior: 'smooth', block: 'start' });
     });
     return () => cancelAnimationFrame(raf);
   }, [lastSubmittedOrderId]);
   ```

**Trade-offs:**
- `scrollIntoView` may behave slightly differently across mobile browsers, but it's well-supported (98%+ caniuse). The `behavior: 'smooth'` option is also widely supported.
- Using `data-bucket="new_order"` as target means we scroll to the bucket header, not the individual new item within it. This is actually better UX — the guest sees the "Отправлено (N)" header with their new order listed below.

**Risks:**
- If the `new_order` bucket is already expanded from a previous order, the new item appears at the top of the bucket (orders sorted newest-first at line 394-398). The scroll lands on the bucket header which is correct.
- If the V8 path (line 849, "all served + cart empty") is active, there's no `new_order` bucket to scroll to. But this can't happen right after submit — cart was non-empty moments ago, and the new order would be in `new_order` status, not `served`.
- On very slow networks, the order may not appear in `todayMyOrders` immediately if polling is needed. The 300ms fallback timeout handles this; if even that fails, we simply don't scroll — acceptable degradation.

## Summary Table
| # | Question | CC Recommendation | Confidence |
|---|----------|-------------------|------------|
| 1 | How to detect new order | B — explicit `lastSubmittedOrderId` prop | high |
| 2 | Where/how to scroll | `scrollIntoView` on `[data-bucket="new_order"]` card, with no-op check, rAF + 300ms fallback | high |

## Prompt Clarity
- Overall clarity: 4
- Ambiguous questions: None truly ambiguous. Q1 options were well-defined.
- Missing context: Would have helped to know whether `handleSubmitOrder` is async and returns the new order object (confirms feasibility of option B). Also, whether the vaul Drawer has its own scroll container or delegates to `[data-radix-scroll-area-viewport]` — I inferred from line 184 that it's one of those two.
