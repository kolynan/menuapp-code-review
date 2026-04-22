# CC Writer Findings — PublicMenu
Chain: publicmenu-260329-210938-5306

## Findings

1. **[P2] Fix 1 — PM-160: Auto-collapse all status buckets when cart is non-empty (CV-10)**
   File: `pages/PublicMenu/CartView.jsx`, lines 102-107.
   Current `useEffect` only collapses `served` when `cart.length > 0`. Status buckets `ready`, `in_progress`, and `accepted` remain expanded, forcing guests to scroll past 7+ items to reach "Новый заказ".
   FIX: Expand the `setExpandedStatuses` call in the existing useEffect (line 105) to also set `ready: false`, `in_progress: false`, `accepted: false`. Do NOT touch `new_order` (must stay true). Do NOT change the `useState` defaults at line 93-99. Code:
   ```jsx
   React.useEffect(() => {
     if (cart.length > 0) {
       setExpandedStatuses(prev => ({
         ...prev,
         served: false,
         ready: false,
         in_progress: false,
         accepted: false,
       }));
     }
   }, [cart.length > 0]);
   ```

2. **[P3] Fix 2 — PM-161: Reduce padding on status bucket section headers**
   File: `pages/PublicMenu/CartView.jsx`, two locations:
   - Line 865: V8 state Подано card `<CardContent className="p-4">` → change to `className="p-3"`
   - Line 912: Normal bucket loop `<CardContent className="p-4">` → change to `className="p-3"`
   FIX: Change `p-4` to `p-3` on both `<CardContent>` elements. Do NOT change the guest/table header card (~line 596, already `p-3`) or the "Новый заказ" section (~line 951, `px-3 py-2`).

3. **[P3] Fix 3 — Remove emoji icons from CartView status bucket labels**
   File: `pages/PublicMenu/CartView.jsx`, four locations:
   - Line 872: `<span>✅</span>` before `{bucketDisplayNames.served}` in V8 state header — REMOVE this span.
   - Line 919: `<span>{bucketIcons[key]}</span>` before `{bucketDisplayNames[key]}` in normal bucket loop — REMOVE this span.
   - Line 954: `🛒 {tr('cart.new_order', 'Новый заказ')}` — REMOVE the `🛒 ` prefix, keep only the `{tr(...)}` call.
   - Lines 490-492: `bucketIcons` object definition — can be removed entirely since all usages are removed. Or leave as dead code (less risk). Recommend removing it.
   FIX: Remove the three emoji render points listed above. Optionally remove the `bucketIcons` object definition at lines 490-492. Do NOT remove the `✅` accent chip next to "Оценить" CTA (lines 878, 926) — those are status indicators. Do NOT remove `⭐` in review reward hint (~line 671). Do NOT change `bucketDisplayNames`.

4. **[P3] Fix 4 — Remove duplicate ЗАПРОСЫ ГОСТЕЙ section header from StaffOrdersMobile**
   File: `pages/StaffOrdersMobile/staffordersmobile.jsx`, lines 3809-3811.
   The `<h2>` heading "ЗАПРОСЫ ГОСТЕЙ" duplicates info already in each `RequestCard`.
   FIX: Remove only the `<h2>` element (lines 3809-3811). Keep the `<div>` container, the `!isKitchen && finalRequests.length > 0` condition, and all `finalRequests.map(...)` rendering intact. Do NOT remove the `Hand` import — it is used elsewhere (lines 1644, 1749).
   After:
   ```jsx
   {!isKitchen && finalRequests.length > 0 && (
     <div>
       {finalRequests.map((req) => {
         ...
       })}
     </div>
   )}
   ```

## Summary
Total: 4 findings (0 P0, 0 P1, 1 P2, 3 P3)

## Prompt Clarity
- Overall clarity: 5/5
- Ambiguous Fix descriptions: None — all 4 fixes had exact line numbers, current/expected code patterns, and clear "DO NOT" boundaries.
- Missing context: None — file locations, frozen UX list, and verification steps were comprehensive.
- Scope questions: None — scope lock section was explicit and matched the numbered Fix list.
