---
task: patch-session-expired-guard-s68
budget: 10
type: implementation
created: 2026-03-02
session: S68
priority: P0 — required before deploy
---

# Patch: Add activity guard to isSessionExpired in useTableSession

## Background

We have `260302-00 useTableSession RELEASE.jsx` ready to deploy (P0-1 cleanup logic).

We just discovered that `isSessionExpired()` from `@/components/sessionHelpers` checks `opened_at`,
NOT `last_activity_at`. This means a table open for 8+ hours would be closed even if orders
were placed recently — which is wrong.

Reference: `outputs/reports/Analysis_P0-1_ExpiredSession_S68.md` (Q3, Risk matrix)
Source file of isSessionExpired: `menuapp-code-review/components/sessionHelpers.js` (Function 9)

## What to change

File: `menuapp-code-review/pages/StaffOrdersMobile/260302-00 useTableSession RELEASE.jsx`

### Step 1: Add helper function near the top of the file (after imports, before main hook)

```jsx
// Guard: protect sessions with recent activity from being expired based on opened_at alone
const hasRecentActivity = (session) => {
  const lastActivity = session.last_activity_at || session.updated_at || session.opened_at;
  if (!lastActivity) return false;
  const ageMs = Date.now() - new Date(lastActivity).getTime();
  return ageMs < 8 * 60 * 60 * 1000; // 8h
};
```

### Step 2: In STEP 1 of session restore logic (around line 284)

Find this line:
```jsx
const isExpired = isSessionExpired(savedSession);
```

Replace with:
```jsx
const isExpired = isSessionExpired(savedSession) && !hasRecentActivity(savedSession);
```

### Step 3: In STEP 2 loop (around line 323) where sessions are iterated

Find:
```jsx
if (isSessionExpired(s)) {
```

Replace with:
```jsx
if (isSessionExpired(s) && !hasRecentActivity(s)) {
```

## Why this is safe

- `isSessionExpired` checks `opened_at` → can incorrectly expire long-running tables
- `hasRecentActivity` checks `last_activity_at || updated_at` → protects tables with recent orders
- Combined: session is only closed if BOTH conditions are true (old opened_at AND no recent activity)
- This matches the intent of SESS-008: "8h since last order" (not "8h since opened")

## After implementation

- git add, commit, push
- Create new RELEASE file: `260302-06 useTableSession RELEASE.jsx`
  (increment from 260302-00 to 260302-06, keeping the fix history clear)
- Update BUGS.md in StaffOrdersMobile: note the guard addition
- Write brief note in result about which lines were changed

## Important

Only change the two `isSessionExpired(...)` call sites inside the hook.
Do NOT modify `isSessionExpired` itself in sessionHelpers.js — that is a B44 platform file.
Do NOT change any other logic.
