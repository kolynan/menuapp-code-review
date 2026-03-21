# CC Writer Findings — PublicMenu
Chain: publicmenu-260320-171535
File: useTableSession.jsx (838 lines)
Pre-task commit: 22b34b0

## Findings

### 1. [P0] PM-041: Polling timer leak — `scheduleNext` does not check `cancelled` flag (lines 670-675)

**Description:** `scheduleNext()` creates a recursive `setTimeout` chain. The cleanup function (line 682-685) sets `cancelled=true` and calls `clearTimeout(intervalId)`. However, if the setTimeout callback has already fired and is executing (calling `pollSessionData()` then `scheduleNext()`), the `clearTimeout` does nothing (callback already running), and `scheduleNext` registers a NEW timeout that cleanup cannot clear. This orphaned timer continues polling indefinitely, causing state updates on unmounted components.

**Root cause:** `scheduleNext` (line 670) never checks the `cancelled` flag before scheduling the next `setTimeout`.

**Code (current):**
```javascript
const scheduleNext = () => {
  intervalId = setTimeout(() => {
    pollSessionData();
    scheduleNext();
  }, getInterval());
};
```

**FIX:** Add `if (cancelled) return;` as the first line inside `scheduleNext`, AND inside the setTimeout callback before calling `scheduleNext()`:
```javascript
const scheduleNext = () => {
  if (cancelled) return;
  intervalId = setTimeout(() => {
    pollSessionData();
    if (!cancelled) scheduleNext();
  }, getInterval());
};
```

---

### 2. [P2] Stale closure in polling — `partner?.id` and `currentTableId` not in dependency array (lines 493, 513, 517-519, 553, 567)

**Description:** The polling `useEffect` (line 493) has dependency array `[tableSession?.id, isHallMode, isTableVerified]` but references `partner?.id` and `currentTableId` inside the callback (lines 513, 517-519, 553, 567). If `partner` or `currentTableId` changes without `tableSession?.id` changing, the polling closure captures stale values. This could cause guest restore logic to use wrong partner/table IDs.

**FIX:** Add `partner?.id` and `currentTableId` to the dependency array on line 686:
```javascript
}, [tableSession?.id, isHallMode, isTableVerified, partner?.id, currentTableId]);
```

---

### 3. [P2] Infinite retry loop on persistent restore errors (line 480)

**Description:** In the `restoreSession()` catch block (line 479-481), `didAttemptRestoreRef.current` is set back to `false`. If the error is persistent (e.g., network down, API consistently failing), each re-render will trigger a new `restoreSession()` call, creating an infinite loop of failing API calls. This wastes bandwidth and can flood error tracking.

**FIX:** Either remove the `didAttemptRestoreRef.current = false` reset (let it fail once and stop), or add a retry counter with a max limit (e.g., 3 retries):
```javascript
} catch (err) {
  // Don't reset — avoid infinite retry loop on persistent errors
  // didAttemptRestoreRef.current = false;
}
```

---

### 4. [P3] Fire-and-forget `closeExpiredSessionInDB` without await (line 299)

**Description:** On line 299, `closeExpiredSessionInDB(savedSession.id)` is called without `await`. The next line (300) immediately clears localStorage. If the DB close fails, the session is cleared from localStorage but remains `status: 'open'` in DB. On next visit, STEP 2 (line 310) will find it again via DB query and attempt to reuse an expired session.

**FIX:** Add `await` before the call:
```javascript
await closeExpiredSessionInDB(savedSession.id);
clearSessionId(partner.id, currentTableId);
```

---

### 5. [P3] `console.warn` left in production code (line 188)

**Description:** `console.warn` in `closeExpiredSessionInDB` (line 188) will output to browser console in production. While this is a warn (not log), it violates the "No Debug Logs" rule for production code.

**FIX:** Remove the `console.warn` or wrap in a dev-only guard. Since this is a catch block for a fire-and-forget cleanup, silent failure is acceptable:
```javascript
} catch (err) {
  // Silent fail — cleanup is best-effort
}
```

---

## Summary

Total: 5 findings (1 P0, 2 P2, 2 P3)

| # | Priority | Bug ID | Title | Lines |
|---|----------|--------|-------|-------|
| 1 | P0 | PM-041 | Polling timer leak — `scheduleNext` missing `cancelled` check | 670-675 |
| 2 | P2 | NEW | Stale closure — `partner?.id`/`currentTableId` not in polling deps | 493, 686 |
| 3 | P2 | NEW | Infinite retry loop on persistent restore errors | 480 |
| 4 | P3 | NEW | Fire-and-forget `closeExpiredSessionInDB` without await | 299 |
| 5 | P3 | NEW | `console.warn` in production code | 188 |
