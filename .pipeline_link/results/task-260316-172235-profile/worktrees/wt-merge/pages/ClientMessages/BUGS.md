# ClientMessages — BUGS

Page: `clientmessages.jsx` (253 lines) — Client messages inbox
Last review: 2026-02-28 (8 P2/P3 bugs fixed)
Reviewed by: Claude Code (automated fix task)

## Fixed Bugs

### BUG-CM-001 (P1) — FIXED — Hardcoded Russian in formatMessageDate
- **File:** clientmessages.jsx:125-133
- **What:** `formatMessageDate` used hardcoded "Сегодня"/"Вчера" strings and `'ru-RU'` locale in `toLocaleTimeString`/`toLocaleDateString`.
- **Impact:** Non-Russian users saw Russian date labels. Dates formatted in Russian locale regardless of user setting.
- **Fix:** Wrapped in `t('clientmessages.date_today')` / `t('clientmessages.date_yesterday')`. Replaced `'ru-RU'` with `undefined` (uses browser locale).

### BUG-CM-002 (P1) — FIXED — Missing loading state while accounts load
- **File:** clientmessages.jsx:150
- **What:** Only `loadingMessages` was checked for the spinner. While accounts were loading, messages query was disabled and `loadingMessages` was false, so user saw "no messages" empty state briefly.
- **Impact:** Confusing flash of "no messages" on every page load.
- **Fix:** Added `isLoading: loadingAccounts` from accounts query and changed check to `loadingAccounts || loadingMessages`.

### BUG-CM-003 (P1) — FIXED — Hardcoded "..." partner name fallback
- **File:** clientmessages.jsx:209
- **What:** `partner?.name || "..."` used a hardcoded string. Changed to `t('clientmessages.unknown_partner', '...')`.
- **Impact:** Untranslatable fallback text for partner names.

### BUG-CM-004 (P1) — FIXED — Missing null guard in partners queryFn
- **File:** clientmessages.jsx:62
- **What:** `messages.map(m => m.partner)` inside `queryFn` had no null guard. If React Query called queryFn during a stale-while-revalidate race before `enabled` settled, `messages` could be undefined.
- **Impact:** Potential `TypeError: Cannot read properties of undefined` crash.
- **Fix:** Added `if (!messages || messages.length === 0) return [];` guard at top of queryFn.

### BUG-CM-005 (P2) — FIXED — Messages queryKey missing accounts dependency
- **File:** clientmessages.jsx:41
- **What:** `queryKey: ["customerMessages", customerEmail]` but `queryFn` depends on `accounts`. If accounts change (new restaurant adds user), messages won't refetch.
- **Impact:** Stale message list if accounts change during session.
- **Fix:** Added `accounts?.map(a => a.id)` to queryKey: `["customerMessages", customerEmail, accounts?.map(a => a.id)]`.

### BUG-CM-006 (P2) — FIXED — Partners queryKey unstable reference
- **File:** clientmessages.jsx:60
- **What:** `messages?.map(m => m.partner)` creates new array reference on every render. Potential unnecessary refetches.
- **Impact:** Performance — potential unnecessary partner refetches.
- **Fix:** Memoized `partnerIds` with `useMemo` and used in queryKey + queryFn + enabled.

### BUG-CM-007 (P2) — FIXED — Back button touch target below 44px
- **File:** clientmessages.jsx:164-168
- **What:** `p-2` padding + `h-5 w-5` icon = 36px total, below 44px Apple HIG minimum.
- **Impact:** Hard to tap on mobile devices.
- **Fix:** Added `min-w-[44px] min-h-[44px] flex items-center justify-center`.

### BUG-CM-008 (P2) — FIXED — Back button missing aria-label
- **File:** clientmessages.jsx:164
- **What:** Icon-only button has no accessible label.
- **Impact:** Screen readers announce unlabeled button.
- **Fix:** Added `aria-label={t('common.back')}`.

### BUG-CM-009 (P2) — FIXED — Message cards not keyboard accessible
- **File:** clientmessages.jsx:193-234
- **What:** `<Card>` with `onClick` but no `tabIndex`, `role`, or `onKeyDown`. Keyboard users can't expand messages.
- **Impact:** Keyboard and screen reader users can't interact with messages.
- **Fix:** Added `role="button" tabIndex={0} onKeyDown` handler (Enter/Space triggers click).

### BUG-CM-010 (P2) — FIXED — onError callback deprecated in useQuery v5
- **File:** clientmessages.jsx:34-36, 53-55, 69-71
- **What:** `onError` in `useQuery` options was removed in TanStack Query v5. May silently fail.
- **Impact:** Error toasts may not fire on newer React Query versions.
- **Fix:** Removed all 3 `onError` callbacks from useQuery. Added single `useEffect` watching `accountsError`, `messagesError`, `partnersError` to show toasts.

### BUG-CM-011 (P3) — FIXED — Dead code in render check
- **File:** clientmessages.jsx:178
- **What:** `!sortedMessages || sortedMessages.length === 0` — `sortedMessages` is always an array (useMemo returns `[]`), so `!sortedMessages` is always false.
- **Impact:** Dead code, no functional impact.
- **Fix:** Simplified to `sortedMessages.length === 0`.

### BUG-CM-012 (P3) — FIXED — Unread dot is color-only indicator
- **File:** clientmessages.jsx:206-208
- **What:** Blue dot is the only unread indicator. Color-blind users may miss it.
- **Impact:** Accessibility gap for color vision deficiency.
- **Fix:** Added `aria-label={t('clientmessages.unread', 'Непрочитано')}` to Circle icon.

## Active Bugs

None — all bugs fixed as of 260228-00 RELEASE.
