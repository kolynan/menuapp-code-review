---
chain_template: consensus-with-discussion-v2
budget: 14
code_file: menuapp-code-review/pages/StaffOrdersMobile/staffordersmobile.jsx
ws: WS-SOM
type: КС
---

<!-- PC-VERDICT: GO (ПССК v7 CC APPROVED 2026-04-17: Fix A 5/5, B.1 4/5, B.2 5/5, B.3 5/5, B.4 5/5, B.5 4/5, B.6 5/5, C 5/5 — 0 CRITICAL, 2 MEDIUM non-blocking) -->

# КС SOM Б2.1 — BUG-SM-015: Session-aware orderGroups (v7)

**TARGET FILE:** `pages/StaffOrdersMobile/staffordersmobile.jsx` (4617 lines, RELEASE `260415-01 StaffOrdersMobile RELEASE.jsx`)

**Bug fixed:** New orders on a re-opened table appear in «Завершённые» instead of «Активные» because `orderGroups` groups all Orders by `tableId` only, merging old closed-session orders with new open-session orders into one card.

**Fix summary:** 3 coordinated fixes:
- Fix A — `staleTime: 30_000` → `5_000` in `openSessions` useQuery (1 line)
- Fix B — session-aware `orderGroups` using `compositeKey = \`${tableId}__${sessionId}\`` + 6 coordinated call-site updates (B.1–B.7)
- Fix C — orphan-detection `useEffect` that invalidates `openSessions` when new hall orders have no matching open session

**Apply order:** Fix A → Fix B (B.1 first, then B.2–B.7) → Fix C. Fix C depends on `group.sessionId` field created in Fix B.1.

**Commit message:** `fix(SOM): BUG-SM-015 session-aware orderGroups + staleTime 30s→5s + orphan invalidate`

---

## Preparation (run BEFORE any edits)

```bash
# 0. Gate: if working copy has uncommitted changes vs HEAD → STOP
if ! git diff --quiet -- pages/StaffOrdersMobile/staffordersmobile.jsx; then
  echo "STOP: working copy has uncommitted changes. Verify with git diff then confirm safe to overwrite."
  exit 1
fi

# 1. Sync working copy from RELEASE (source of truth)
cp "pages/StaffOrdersMobile/260415-01 StaffOrdersMobile RELEASE.jsx" \
   "pages/StaffOrdersMobile/staffordersmobile.jsx"
# Expected: no error, file = 4617 lines

# 2. Verify line count
wc -l "pages/StaffOrdersMobile/staffordersmobile.jsx"
# Expected: 4617

# 3. Anchor pre-checks
grep -n "staleTime: 30_000" "pages/StaffOrdersMobile/staffordersmobile.jsx"
# Expected: 1 hit ~3548

grep -n "const orderGroups = useMemo" "pages/StaffOrdersMobile/staffordersmobile.jsx"
# Expected: 1 hit ~3768

grep -n "const filteredGroups = useMemo" "pages/StaffOrdersMobile/staffordersmobile.jsx"
# Expected: 1 hit ~3862

grep -n "const tabCounts = useMemo" "pages/StaffOrdersMobile/staffordersmobile.jsx"
# Expected: 1 hit ~3886

grep -n "isHighlighted={highlightGroupId === group.id}" "pages/StaffOrdersMobile/staffordersmobile.jsx"
# Expected: 1 hit (in v2SortedGroups.map)

grep -n "data-group-id={group.id}" "pages/StaffOrdersMobile/staffordersmobile.jsx"
# Expected: 3 hits (~565, ~1173, ~2292). Only ~2292 is live JSX; the rest are block-comments.

# 4. Read live data-group-id context to build unique old_string for Fix B.5
sed -n '2285,2298p' "pages/StaffOrdersMobile/staffordersmobile.jsx"
# Identify the ~3-5 lines including `highlightRing` variable (or `return (`) that precede data-group-id
# — this makes the old_string unique vs the block-comment hits at ~565/~1173.

# 5. queryClient + useRef pre-checks (needed by Fix C)
grep -n "const queryClient = useQueryClient" "pages/StaffOrdersMobile/staffordersmobile.jsx"
# Expected: 1 hit (pre-exists inside component)

grep -c "useRef" "pages/StaffOrdersMobile/staffordersmobile.jsx"
# Expected: ≥1 (if 0 → add useRef to react import in Fix C)
```

If any anchor count differs from expected — **STOP** and report to chain; do not proceed on wrong anchors.

---

## FROZEN UX (DO NOT CHANGE)

- `closeSession` and `getOrCreateSession` in `components/sessionHelpers.js` — **DO NOT TOUCH**
- `handleCloseTableClick` useCallback (~2164-2177) — DO NOT TOUCH
- `confirmCloseTable` handler (~4183-4197) — DO NOT TOUCH
- `effectivePollingInterval` — DO NOT TOUCH
- `activeOrders` status filter (3593-3617) — DO NOT TOUCH
- `buildBannerInfo` (~4079-4090) and `onNavigate(banner.groupId)` call-site (~2825) — DO NOT TOUCH
- `favorites` / `isFavorite` / `toggleFavorite` — remain on `tableId` (`group.id`) — DO NOT TOUCH
- `["servedOrders", group.id]` queryKey — remains tableId — DO NOT TOUCH
- `OrderGroupCard` internals — only change the 4 listed props in Fix B.4
- i18n keys — DO NOT ADD

**SCOPE LOCK:** Only these locations change: (1) openSessions staleTime; (2) orderGroups useMemo full block; (3) filteredGroups useMemo `if (group.type === 'table')` sub-block; (4) tabCounts useMemo `if (group.type === 'table')` sub-block; (5) 4 props in v2SortedGroups.map OrderGroupCard; (6) data-group-id live JSX ~2292; (7) handleBannerNavigate useCallback full block; (8) new useEffect + useRef (Fix C).

**Identifier rule:** DOM/React state → `compositeKey`; B44 entity/API/favorites/upstream → `tableId` (`group.id`).

---

## Fix A — staleTime 30s → 5s

**Anchor:** `staleTime: 30_000` (1 hit ~3548, inside `openSessions` useQuery block)

old_string:
```
    enabled: canFetch && !!partnerId && !rateLimitHit,
    staleTime: 30_000,
    refetchInterval: effectivePollingInterval,
```

new_string:
```
    enabled: canFetch && !!partnerId && !rateLimitHit,
    staleTime: 5_000,
    refetchInterval: effectivePollingInterval,
```

**Do NOT change:** `queryKey`, `queryFn`, `refetchInterval`, `enabled`, or any other `staleTime:` values in the file (60_000 for tables/stages/partner queries — leave untouched).

**Verify:**
```bash
grep -n "staleTime: 5_000" "pages/StaffOrdersMobile/staffordersmobile.jsx"  # Expected: 1 hit ~3548
grep -c "staleTime: 30_000" "pages/StaffOrdersMobile/staffordersmobile.jsx" # Expected: 0 hits
```

---

## Fix B.1 — orderGroups useMemo (full block replacement)

**Anchor:** `const orderGroups = useMemo` (1 hit ~3768)

⚠️ Read the actual block via `sed -n '3768,3825p'` before replacing — use exact whitespace from file as old_string. The block ends with `}, [visibleOrders, tableMap, isKitchen, activeRequests, openSessionByTableId]);`.

Replace the **entire** `const orderGroups = useMemo(...)` block with:

```js
  // v2.7.0 + Б2.1: Order groups model (hall by table+session, pickup/delivery individual)
  // BUG-SM-015: Split table orders by session_id so closed session stays in
  // «Завершённые» while new session appears as a fresh card in «Активные».
  const orderGroups = useMemo(() => {
    if (isKitchen) return null;

    const groups = [];
    const tableGroups = {}; // key: `${tableId}__${sessionKey}` where sessionKey = sessionId || 'no-session'

    visibleOrders.forEach(o => {
      if (o.order_type === 'hall') {
        const tableId = getLinkId(o.table);
        if (!tableId) return;

        const orderSessionId = getLinkId(o.table_session) || 'no-session';
        const openSessionId = openSessionByTableId[tableId]?.id || null;
        const compositeKey = `${tableId}__${orderSessionId}`;

        if (!tableGroups[compositeKey]) {
          const tableName = tableMap[tableId]?.name || '?';
          tableGroups[compositeKey] = {
            type: 'table',
            id: tableId,                   // tableId — used for favorites, servedOrders query, onCloseTable callback
            sessionId: orderSessionId === 'no-session' ? null : orderSessionId, // NEW: session of this group
            compositeKey,                  // NEW: React key + data-group-id + expand/highlight tracking
            displayName: tableName,
            orders: [],
            openSessionId,                 // ID of open session for this table (may differ from sessionId if closed)
          };
          groups.push(tableGroups[compositeKey]);
        }
        tableGroups[compositeKey].orders.push(o);
      } else {
        // Pickup/Delivery — unique by orderId, logic unchanged.
        groups.push({
          type: o.order_type,
          id: o.id,
          sessionId: null,
          compositeKey: `${o.order_type}__${o.id}`,
          displayName: o.order_type === 'pickup'
            ? `СВ-${o.order_number || o.id.slice(-3)}`
            : `ДОС-${o.order_number || o.id.slice(-3)}`,
          orders: [o],
        });
      }
    });

    // ServiceRequest → attach to current open session card (if any), else `${tableId}__no-session`.
    // Requests from closed sessions are already 'done' (sessionHelpers.js:175-188), so not in activeRequests.
    activeRequests.forEach((req) => {
      const tableId = getLinkId(req.table);
      if (!tableId) return;

      const openSessionId = openSessionByTableId[tableId]?.id || null;
      const targetSessionKey = openSessionId || 'no-session';
      const compositeKey = `${tableId}__${targetSessionKey}`;

      if (!tableGroups[compositeKey]) {
        const tableName = tableMap[tableId]?.name || '?';
        tableGroups[compositeKey] = {
          type: 'table',
          id: tableId,
          sessionId: openSessionId,
          compositeKey,
          displayName: tableName,
          orders: [],
          openSessionId,
        };
        groups.push(tableGroups[compositeKey]);
      }
    });

    return groups;
  }, [visibleOrders, tableMap, isKitchen, activeRequests, openSessionByTableId]);
```

**Verify:**
```bash
grep -c "compositeKey" "pages/StaffOrdersMobile/staffordersmobile.jsx"   # Expected: ≥3 after this fix
grep -c "tableGroups\[tableId\]" "pages/StaffOrdersMobile/staffordersmobile.jsx" # Expected: 0
```

---

## Fix B.2 — filteredGroups useMemo (partial update)

**Anchor:** `const filteredGroups = useMemo` (1 hit ~3862)

Replace the **entire** `const filteredGroups = useMemo(...)` block. Only the `if (group.type === 'table')` sub-block changes; all other lines are identical to original.

new_string (full block):
```js
  const filteredGroups = useMemo(() => {
    if (!orderGroups) return [];

    return orderGroups.filter(group => {
      if (group.type === 'table') {
        // Б2.1: group belongs to «Активные» ONLY if its sessionId matches the current open session
        const openId = openSessionByTableId[group.id]?.id || null;
        const isCurrentOpenSession = !!openId && group.sessionId === openId;
        if (!isCurrentOpenSession) return activeTab === 'completed';
      }
      const hasActiveOrder = group.orders.some(o => {
        const config = getStatusConfig(o);
        return !config.isFinishStage && o.status !== 'cancelled';
      });
      const hasActiveRequest = group.type === 'table' && activeRequests.some(r => getLinkId(r.table) === group.id);
      const hasServedButNotClosed = group.orders.some(o => {
        const config = getStatusConfig(o);
        return config.isFinishStage && o.status !== 'closed' && o.status !== 'cancelled';
      });
      return activeTab === 'active'
        ? (hasActiveOrder || hasActiveRequest || hasServedButNotClosed)
        : (!hasActiveOrder && !hasActiveRequest && !hasServedButNotClosed);
    });
  }, [orderGroups, activeTab, getStatusConfig, activeRequests, openSessionByTableId]);
```

**Verify:**
```bash
grep -c "isCurrentOpenSession" "pages/StaffOrdersMobile/staffordersmobile.jsx" # Expected: ≥1 (will be 2 after B.3)
grep -c "hasOpenSession = !!openSessionByTableId" "pages/StaffOrdersMobile/staffordersmobile.jsx" # Expected: 0
```

---

## Fix B.3 — tabCounts useMemo (partial update)

**Anchor:** `const tabCounts = useMemo` (1 hit ~3886)

Replace the **entire** `const tabCounts = useMemo(...)` block.

new_string (full block):
```js
  // v2.7.1: Tab counts
  const tabCounts = useMemo(() => {
    if (!orderGroups) return { active: 0, completed: 0 };

    let active = 0, completed = 0;
    orderGroups.forEach(group => {
      if (group.type === 'table') {
        // Б2.1: group belongs to «Завершённые» if NOT the current open session's group
        const openId = openSessionByTableId[group.id]?.id || null;
        const isCurrentOpenSession = !!openId && group.sessionId === openId;
        if (!isCurrentOpenSession) {
          completed++;
          return;
        }
      }
      const hasActiveOrder = group.orders.some(o => {
        const config = getStatusConfig(o);
        return !config.isFinishStage && o.status !== 'cancelled';
      });
      const hasActiveRequest = group.type === 'table' && activeRequests.some(r => getLinkId(r.table) === group.id);
      const hasServedButNotClosed = group.orders.some(o => {
        const config = getStatusConfig(o);
        return config.isFinishStage && o.status !== 'closed' && o.status !== 'cancelled';
      });
      if (hasActiveOrder || hasActiveRequest || hasServedButNotClosed) active++; else completed++;
    });

    return { active, completed };
  }, [orderGroups, getStatusConfig, activeRequests, openSessionByTableId]);
```

**Verify:**
```bash
grep -c "isCurrentOpenSession" "pages/StaffOrdersMobile/staffordersmobile.jsx" # Expected: 2 (filteredGroups + tabCounts)
```

---

## Fix B.4 — OrderGroupCard call-site (4 props in v2SortedGroups.map)

**Anchor:** `v2SortedGroups.map(group => (` (1 hit). Makes 4 separate Edits.

**Edit 1 — key (use surrounding context for disambiguation):**
- old_string:
  ```
              v2SortedGroups.map(group => (
                <OrderGroupCard
                  key={group.id}
  ```
- new_string:
  ```
              v2SortedGroups.map(group => (
                <OrderGroupCard
                  key={group.compositeKey}
  ```

**Edit 2 — isExpanded (unique hit ~4461):**
- old_string: `                  isExpanded={expandedGroupId === group.id}`
- new_string: `                  isExpanded={expandedGroupId === group.compositeKey}`

**Edit 3 — onToggleExpand (unique hit ~4462):**
- old_string: `                  onToggleExpand={() => handleToggleExpand(group.id)}`
- new_string: `                  onToggleExpand={() => handleToggleExpand(group.compositeKey)}`

**Edit 4 — isHighlighted (unique hit):**
- old_string: `                  isHighlighted={highlightGroupId === group.id}`
- new_string: `                  isHighlighted={highlightGroupId === group.compositeKey}`

⚠️ **DO NOT change** `isFavorite(group.type === 'table' ? 'table' : 'order', group.id)` — favorites remain on tableId.

**Verify:**
```bash
sed -n '4455,4490p' "pages/StaffOrdersMobile/staffordersmobile.jsx" | grep -c "key={group.id}"
# Expected: 0 (in this range)
sed -n '4455,4490p' "pages/StaffOrdersMobile/staffordersmobile.jsx" | grep -c "compositeKey"
# Expected: 4 (key + isExpanded + onToggleExpand + isHighlighted)
```

---

## Fix B.5 — data-group-id live JSX only (~2292)

⚠️ There are 3 hits for `data-group-id={group.id}`. Only the hit at ~2292 is live JSX. The hits at ~565 and ~1173 are inside block-comments — skip them (safer).

From Preparation step 4 (`sed -n '2285,2298p'`), identify the 3-5 lines that include `highlightRing` variable (or `return (`) immediately before `data-group-id`. Use those lines as `old_string` to make the Edit unique.

Example structure (get exact text from sed output):
```jsx
  const highlightRing = ...;
  return (
    <div
      data-group-id={group.id}
```
→ replace `data-group-id={group.id}` with `data-group-id={group.compositeKey}` in that block.

**Verify:**
```bash
sed -n '2285,2298p' "pages/StaffOrdersMobile/staffordersmobile.jsx" | grep -c "compositeKey"
# Expected: 1 hit (live JSX replaced)
```

---

## Fix B.6 — handleBannerNavigate useCallback (full replacement)

**Anchor:** `const handleBannerNavigate = useCallback` (1 hit ~4142)

Replace the **entire** `handleBannerNavigate` useCallback:

```js
  const handleBannerNavigate = useCallback((maybeTableIdOrCompositeKey) => {
    if (!maybeTableIdOrCompositeKey) return;

    // Б2.1: if tableId passed (current flow: banner.groupId = tableId from buildBannerInfo) —
    // resolve to compositeKey of current open session for that table.
    // Defensive: also works if caller already passes compositeKey (contains '__').
    let targetKey = String(maybeTableIdOrCompositeKey);
    if (!targetKey.includes('__')) {
      const openId = openSessionByTableId[targetKey]?.id || null;
      targetKey = openId
        ? `${targetKey}__${openId}`
        : `${targetKey}__no-session`;
    }

    setExpandedGroupId(targetKey);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const el = document.querySelector(`[data-group-id="${CSS.escape(targetKey)}"]`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          setHighlightGroupId(targetKey);
          if (highlightTimerRef.current) clearTimeout(highlightTimerRef.current);
          highlightTimerRef.current = setTimeout(() => setHighlightGroupId(null), 1500);
        }
      });
    });
  }, [openSessionByTableId]);
```

**Note:** Added `openSessionByTableId` to dependency array (new dependency).

**Verify:**
```bash
grep -n "handleBannerNavigate" "pages/StaffOrdersMobile/staffordersmobile.jsx"
# Expected: 2 hits — declaration ~4142 + prop pass ~4610
grep -c "maybeTableIdOrCompositeKey" "pages/StaffOrdersMobile/staffordersmobile.jsx"
# Expected: ≥2
```

---

## Fix C — Orphan detection useEffect

**Placement:** Add the new `useRef` + `useEffect` IMMEDIATELY AFTER the closing `}, [openSessions]);` of the `openSessionByTableId` useMemo (~3561) and BEFORE `const activeRequests`.

Locate exact insertion point:
```bash
grep -n "openSessionByTableId = useMemo" "pages/StaffOrdersMobile/staffordersmobile.jsx"
# Expected: 1 hit ~3554
sed -n '3554,3590p' "pages/StaffOrdersMobile/staffordersmobile.jsx"
# Find the line after `}, [openSessions]);` closing this useMemo — insert there.
```

**Insert AFTER the `openSessionByTableId` useMemo closing line:**

```js
  // Б2.1 Fix C: if a hall-Order references a table_session not yet in openSessionByTableId
  // (staleTime race) — force invalidate openSessions to fetch the new session immediately.
  // Filter: skip closed/cancelled orders (they retain table_session but should NOT trigger invalidate).
  // One-shot guard: track orphan signature via ref to avoid repeated invalidates for same set.
  const orphanInvalidateSigRef = useRef(null);
  useEffect(() => {
    if (!Array.isArray(orders) || orders.length === 0) return;

    const orphanPairs = [];
    for (const o of orders) {
      if (o.order_type !== 'hall') continue;
      if (o.status === 'closed' || o.status === 'cancelled') continue;
      const tableId = getLinkId(o.table);
      if (!tableId) continue;
      const sessionId = getLinkId(o.table_session);
      if (!sessionId) continue;
      const open = openSessionByTableId[tableId];
      if (!open || open.id !== sessionId) {
        orphanPairs.push(`${tableId}:${sessionId}`);
      }
    }

    if (orphanPairs.length === 0) {
      orphanInvalidateSigRef.current = null;
      return;
    }

    const signature = orphanPairs.sort().join(',');
    if (orphanInvalidateSigRef.current === signature) return;
    orphanInvalidateSigRef.current = signature;
    // Prefix invalidate — matches ["openSessions", partnerId] for any current partnerId
    queryClient.invalidateQueries({ queryKey: ["openSessions"] });
  }, [orders, openSessionByTableId, queryClient]);
```

**If `useRef` is not yet imported:** add `useRef` to the react import line.

**Verify:**
```bash
grep -c "orphanInvalidateSigRef" "pages/StaffOrdersMobile/staffordersmobile.jsx"
# Expected: 3-4 hits
grep -c "orphanPairs" "pages/StaffOrdersMobile/staffordersmobile.jsx"
# Expected: ≥3
grep -n 'invalidateQueries({ queryKey: \["openSessions"\] })' "pages/StaffOrdersMobile/staffordersmobile.jsx"
# Expected: ≥2 (existing confirmCloseTable + new Fix C)
```

---

## Final Safety Guards (before commit)

```bash
grep -c "tableGroups\[tableId\]" "pages/StaffOrdersMobile/staffordersmobile.jsx"   # Expected: 0
grep -c "compositeKey" "pages/StaffOrdersMobile/staffordersmobile.jsx"              # Expected: ≥8
grep -c "isCurrentOpenSession" "pages/StaffOrdersMobile/staffordersmobile.jsx"     # Expected: 2
wc -l "pages/StaffOrdersMobile/staffordersmobile.jsx"                              # Expected: 4582–4687
grep -n 'queryKey: \["openSessions", partnerId\]' "pages/StaffOrdersMobile/staffordersmobile.jsx" # Expected: 1 hit
git diff -- components/sessionHelpers.js                                            # Expected: empty
git diff --name-only                                                                # Expected: staffordersmobile.jsx only

git add pages/StaffOrdersMobile/staffordersmobile.jsx
git commit -m "fix(SOM): BUG-SM-015 session-aware orderGroups + staleTime 30s→5s + orphan invalidate"
```
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            