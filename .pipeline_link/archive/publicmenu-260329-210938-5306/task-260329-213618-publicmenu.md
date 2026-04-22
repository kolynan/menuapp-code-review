---
task_id: task-260329-213618-publicmenu
status: running
started: 2026-03-29T21:36:18+05:00
type: chain-step
page: PublicMenu
work_dir: C:/Dev/menuapp-code-review
budget_usd: 6.00
fallback_model: sonnet
version: 5.14
launcher: python-popen
---

# Task: task-260329-213618-publicmenu

## Config
- Budget: $6.00
- Mode: task-watcher.py launches Claude Code directly via Popen
- Fallback model: sonnet

## Prompt
---
chain: publicmenu-260329-210938-5306
chain_step: 4
chain_total: 4
chain_step_name: merge
page: PublicMenu
budget: 6.00
runner: cc
type: chain-step
---
=== CHAIN STEP: Merge (4/4) ===
Chain: publicmenu-260329-210938-5306
Page: PublicMenu

You are the Merge step in a modular consensus pipeline.
Your job: apply the fix plan to the actual code.

INSTRUCTIONS:
1. Read the comparison: pipeline/chain-state/publicmenu-260329-210938-5306-comparison.md
2. Check if discussion report exists: pipeline/chain-state/publicmenu-260329-210938-5306-discussion.md
   - If it exists AND has an "Updated Fix Plan" section → use THAT for disputed items
   - If it says "No disputes" or doesn't exist → use Comparator's "Final Fix Plan" as-is
   - Items marked "Unresolved (for Arman)" → SKIP these, do NOT apply
3. Read the code file: pages/PublicMenu/*.jsx
4. Apply ALL fixes from the fix plan, in priority order (P0 first)
   - Agreed items from Comparator: always apply
   - Discussion-resolved items: apply the winning solution
   - Unresolved disputes: SKIP (note in merge report)
   - [MUST-FIX] items: CANNOT be skipped. If you cannot apply a MUST-FIX, explain WHY in detail in merge report — do NOT silently skip.
5. After applying fixes:
   a. Update BUGS.md in pages/PublicMenu/ with fixed items
   b. Update README.md in pages/PublicMenu/ if needed
6. Git commit and push:
   - git add <specific files only> (NEVER git add . or git add -A)
   - git commit -m "fix(PublicMenu): N bugs fixed via consensus chain publicmenu-260329-210938-5306"
   - git push
7. Write merge report to: pipeline/chain-state/publicmenu-260329-210938-5306-merge-report.md

FORMAT for merge report:
# Merge Report — PublicMenu
Chain: publicmenu-260329-210938-5306

## Applied Fixes
1. [P0] Fix title — Source: agreed/discussion-resolved — DONE
2. [P1] Fix title — Source: comparator — DONE
...

## Skipped — Unresolved Disputes (for Arman)
- Dispute: [title] — CC says X, Codex says Y — NEEDS DECISION

## Skipped — Could Not Apply
- Reason...

## Git
- Commit: <hash>
- Files changed: N

## Prompt Feedback
Collect Prompt Clarity sections from CC and Codex findings files (if present), then add your own observations:
- CC clarity score: [N/5]
- Codex clarity score: [N/5]
- Fixes where writers diverged due to unclear description: ...
- Fixes where description was perfect (both writers agreed immediately): ...
- Recommendation for improving task descriptions: ...

## Summary
- Applied: N fixes
- Skipped (unresolved): N disputes
- Skipped (other): N fixes
- MUST-FIX not applied: N (with reasons)
- Commit: <hash>

=== TASK CONTEXT ===
# UX Batch 6: CartView collapsed sections + SOM cleanup

Reference: `ux-concepts/cart-view.md` v4.2, `BUGS_MASTER.md`, `STYLE_GUIDE.md`.

**TARGET FILES (modify):**
- `pages/PublicMenu/CartView.jsx` (1063 lines) — Fix 1, Fix 2, Fix 3
- `pages/StaffOrdersMobile/staffordersmobile.jsx` (4025 lines) — Fix 4

**CONTEXT FILES (read-only):**
- `BUGS_MASTER.md`
- `ux-concepts/cart-view.md`

Production pages: `/x` (CartView drawer) and `/staffordersmobile`.

---

## Fix 1 — PM-160 (P2) [MUST-FIX]: Auto-collapse all status buckets when cart is non-empty (CV-10)

### Сейчас
When the guest adds items to the new order (cart.length > 0), status buckets `Принят`, `Готовится`, `Готов` remain expanded by default. With 7+ items across statuses, the guest must scroll far down to see the `Новый заказ` section at the bottom. Only `Подано` (served) was being auto-collapsed (existing useEffect, ~lines 102-107).

### Должно быть
When `cart.length > 0`, ALL status buckets except `new_order` must auto-collapse:
- `served: false` — already collapsed
- `ready: false` — NEW: also collapse
- `in_progress: false` — NEW: also collapse
- `accepted: false` — NEW: also collapse

This ensures "Новый заказ" section is immediately visible to the guest.

### НЕ должно быть
- Do NOT collapse `new_order` bucket (it IS the cart — must stay visible).
- Do NOT change the initial `useState` default values.
- Only change the useEffect that auto-collapses based on cart state.

### Файл и локация
File: `pages/PublicMenu/CartView.jsx`
Search for: `React.useEffect(() => {` followed by `served: false` (~lines 102-107).
Current code pattern:
```
React.useEffect(() => {
  if (cart.length > 0) {
    setExpandedStatuses(prev => ({ ...prev, served: false }));
  }
}, [cart.length > 0]);
```
Change to:
```
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

### Проверка
1. Open CartView with existing orders (accepted + in_progress statuses) AND items in cart.
2. All status sections should be collapsed → "Новый заказ" visible without scrolling.

---

## Fix 2 — PM-161 (P3) [MUST-FIX]: Reduce padding on status bucket section headers

### Сейчас
Status bucket cards use `<CardContent className="p-4">` which adds excessive vertical height. With 4 buckets visible, this wastes ~32-48px total.

### Должно быть
Change `p-4` → `p-3` on `<CardContent>` inside the status bucket cards (both the "V8 state" bucket at ~line 836 and the normal loop bucket at ~line 912).

### НЕ должно быть
- Do NOT change padding on the guest/table header card at ~line 596 (it already uses `p-3`).
- Do NOT change padding on the "Новый заказ" section at ~line 951 (`px-3 py-2` — already compact).
- Only target the `<CardContent>` wrappers for the status bucket sections.

### Файл и локация
File: `pages/PublicMenu/CartView.jsx`
There are 2 `<CardContent className="p-4">` instances to change:
1. V8 state Подано card: search for `<CardContent className="p-4">` near `863-865` (the Card containing the served bucket in "all served" state).
2. Normal bucket loop: search for `<CardContent className="p-4">` near `~lines 911-912` (inside `bucketOrder.map(key => {...})` block).

Change both from `className="p-4"` to `className="p-3"`.

### Проверка
Open CartView with multiple status buckets visible — each section header should be visibly shorter.

---

## Fix 3 — [MUST-FIX]: Remove emoji icons from CartView status bucket labels

### Сейчас
Bucket section headers show emoji icons before the bucket name:
- `bucketIcons` object at ~lines 490-492: `{ served: '✅', ready: '🟠', in_progress: '🔵', accepted: '🟡', new_order: '⚪' }`
- These are rendered via `<span>{bucketIcons[key]}</span>` at ~line 919
- Also `<span>✅</span>` in V8 state rendering at ~line 872
- Also `🛒` emoji in "Новый заказ" header at ~line 954

This creates visual noise in the section headers.

### Должно быть
Remove emoji from bucket labels. Text-only labels: "Подано (2)", "Готовится (1)", "Новый заказ".

### НЕ должно быть
- Do NOT remove the `✅` accent chip next to "Оценить" CTA inside the Подано section (lines ~878, ~926-931) — those are status indicators, not label emojis.
- Do NOT remove the `⭐` in review reward hint text (~line 671).
- Do NOT change the `bucketDisplayNames` object — those text labels are correct.
- ONLY remove: the `<span>{bucketIcons[key]}</span>` render, the standalone `<span>✅</span>` near line 872, and the `🛒` before "Новый заказ" in the h2 at ~line 954.

### Файл и локация
File: `pages/PublicMenu/CartView.jsx`
Changes needed:

1. In `bucketIcons` definition (~lines 490-492): you can leave the object or remove it — but remove all usages below.

2. In the V8 state bucket header (~line 872):
   Search for: `<span>✅</span>` immediately before `{bucketDisplayNames.served}`
   Remove just that `<span>✅</span>`.

3. In the normal bucket loop header (~line 919):
   Search for: `<span>{bucketIcons[key]}</span>` immediately before `{bucketDisplayNames[key]}`
   Remove just that `<span>`.

4. In the "Новый заказ" h2 header (~line 954):
   Search for: `🛒 {tr('cart.new_order', 'Новый заказ')}`
   Replace with: `{tr('cart.new_order', 'Новый заказ')}`

### Проверка
Open CartView → status bucket headers show plain text: "Подано (2)", "Принят (1)" — no emojis.

---

## Fix 4 — [MUST-FIX]: Remove duplicate ЗАПРОСЫ ГОСТЕЙ section header from StaffOrdersMobile

### Сейчас
In `staffordersmobile.jsx` at ~lines 3807-3828, there is a top-level `<h2>` heading "ЗАПРОСЫ ГОСТЕЙ" rendered above the request cards. This heading duplicates information already visible in each `RequestCard` component, creating visual redundancy.

The code block to remove is:
```jsx
{!isKitchen && finalRequests.length > 0 && (
  <div>
    <h2 className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider mb-2 flex items-center gap-1">
      <Hand className="w-3 h-3" /> ЗАПРОСЫ ГОСТЕЙ ({finalRequests.length})
    </h2>
    {finalRequests.map((req) => {
      ...
    })}
  </div>
)}
```

### Должно быть
Remove the `<h2>` element (lines 3809-3811) only. Keep the `<div>` container, the condition, and all `RequestCard` rendering.

Result: the request cards appear without a separate heading.

### НЕ должно быть
- Do NOT remove the request cards or the `finalRequests.map(...)` loop.
- Do NOT change the condition `!isKitchen && finalRequests.length > 0`.
- Do NOT change any `RequestCard` component logic.
- ONLY remove: the `<h2>` element and its content (3 lines).

### Файл и локация
File: `pages/StaffOrdersMobile/staffordersmobile.jsx`
Search for: `ЗАПРОСЫ ГОСТЕЙ` (~line 3810)
Remove the `<h2>` tag and its content. Also remove the `<Hand>` icon if it's only used in this h2.

### Проверка
Open /staffordersmobile → if there are guest requests, they appear as cards without an "ЗАПРОСЫ ГОСТЕЙ" heading above them.

---

## ⛔ SCOPE LOCK — менять ТОЛЬКО то, что указано выше

- Modify ONLY the code described in Fix 1-4.
- Everything else (polling, business logic, order filtering, UX flows, routing) — DO NOT TOUCH.
- If you see a problem outside these fixes — SKIP it, do not fix.
- FROZEN UX — must NOT change:
  - CV-28: flat dish list per bucket (renderBucketOrders function) — DO NOT add per-order collapse
  - CV-30: order count + sum in drawer header (`ordersSum` display, ~lines 641-652)
  - PM-149: `guestDisplay = guestBaseName` at ~lines 322 — no suffix, no effectiveGuestCode appended to display
  - PM-158: `derivedNextStatus` position-based logic in staffordersmobile.jsx — DO NOT change
  - `expandedStatuses` useState initial values — DO NOT change defaults; only change the useEffect
  - `bucketDisplayNames` object — text labels are correct, DO NOT change

## MOBILE-FIRST CHECK (MANDATORY before commit)
This is a mobile-first restaurant app. Verify at 375px width:
- [ ] Section headers: touch target for expand/collapse ≥ 44px height preserved
- [ ] "Новый заказ" section visible near top when cart has items
- [ ] No duplicate visual elements in SOM request section
- [ ] Padding reduction (p-4→p-3) doesn't break content overflow

## Regression Check (MANDATORY after implementation)
After all fixes, verify these still work:
- [ ] Tapping a status bucket header still expands/collapses it normally
- [ ] "Оценить" chip inside Подано section still appears and works
- [ ] Cart items in "Новый заказ" section still show with stepper buttons
- [ ] SOM: request cards still render correctly without heading
- [ ] SOM: PM-158 status updates still work (accepted → in_progress → served)

## Implementation Notes
- TARGET files: `pages/PublicMenu/CartView.jsx`, `pages/StaffOrdersMobile/staffordersmobile.jsx`
- CONTEXT: `BUGS_MASTER.md`, `ux-concepts/cart-view.md`
- Grep verification before commit:
  - `grep -n "bucketIcons\[key\]" pages/PublicMenu/CartView.jsx` → should return 0 results
  - `grep -n "ЗАПРОСЫ ГОСТЕЙ" pages/StaffOrdersMobile/staffordersmobile.jsx` → should return 0 results
- git add `pages/PublicMenu/CartView.jsx` `pages/StaffOrdersMobile/staffordersmobile.jsx`
- git commit message: "Batch 6: auto-collapse buckets + reduce padding + remove emojis + SOM cleanup"
=== END ===


## Status
Running...
