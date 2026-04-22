# Code Review Report: PartnerClients

**File:** `pages/PartnerClients/partnerclients.jsx` (386 lines after fix)
**Date:** 2026-02-24
**Reviewed by:** Claude (correctness + style) + Codex (independent review)
**Rounds:** 1 analysis + 1 post-fix verification

---

## Summary

Client management page with search, detail sheet, and messaging. Four P1 bugs found and fixed: dual-modal crash, hardcoded Russian locale, null safety in queries, and form state leak. Well-structured PartnerShell pattern. Good i18n coverage.

---

## Fixed Issues

### BUG-PC-001 (P1) — Mail icon opens Sheet + Dialog simultaneously
- **Lines:** 91-95 (original)
- **Impact:** Clicking mail icon on client card sets `selectedAccount` (opens Sheet) AND `messageDialogOpen` (opens Dialog). Two overlapping modals on mobile. If user closes Sheet, `selectedAccount` becomes null → crash when sending message.
- **Fix:** Introduced separate `messageTarget` state for the message dialog. Mail icon now only opens Dialog without touching Sheet's `selectedAccount`. Also: form reset on dialog close, null guard on send.
- **Consensus:** Claude P1, Codex P2. Fixed as P1 due to crash potential.

### BUG-PC-002 (P1) — formatDate hardcodes Russian locale
- **Lines:** 26-33 (original)
- **Impact:** All dates display Russian month names regardless of user's language setting.
- **Fix:** Removed `{ locale: ru }` import and usage. Now uses locale-neutral `dd.MM.yyyy` format.
- **Consensus:** Claude P1, Style P1.

### BUG-PC-003 (P1) — queryFn lacks optional chaining on selectedAccount
- **Lines:** 51-55, 57-61 (original)
- **Impact:** If React Query calls queryFn during stale-while-revalidate after selectedAccount is set to null, `selectedAccount.id` throws TypeError.
- **Fix:** Changed to `selectedAccount?.id` in both transaction and review queryFn.
- **Consensus:** Claude found.

### BUG-PC-004 (P1) — messageForm not reset on cancel/dismiss
- **Found during:** Post-fix review
- **Impact:** Closing message dialog without sending retains old subject/body. Opening for a different client shows stale text → risk of sending wrong message.
- **Fix:** Added `setMessageForm({ title: "", body: "" })` in dialog's `onOpenChange` close path.

### BUG-PC-005 (P1) — getClientNumber id.slice crash if id is numeric
- **Line:** 22 (original)
- **Impact:** If Base44 returns numeric IDs, `account.id.slice(-4)` throws TypeError. Edge case but crash path.
- **Fix:** Changed to `String(account.id).slice(-4)`.

---

## Active Issues (P2-P3, not fixed)

### P2: getClientNumber is O(n²) — sorts all accounts per card render
- **Lines:** 18-24
- Called inside `filteredAccounts.map()`. For 500 clients: 500 full array sorts per render.
- **Recommendation:** Pre-compute `clientNumberMap` via `useMemo`, sort once.

### P2: Client numbers are index-based, unstable across data changes
- **Lines:** 18-24
- Numbers change when new clients are added or if sort is non-deterministic for same `created_at`.
- **Recommendation:** Add stable tie-break by `id` in sort comparator.

### P2: Search only filters by client number, not phone/name
- **Lines:** 81-89
- Partners expect to search by phone. The filter only checks sequential number string.

### P3: Mail icon button below 44px touch target (32x32)
- **Line:** 178 — `className="h-8 w-8 p-0"` is 32px.

### P3: Mail icon button missing `aria-label`
- **Line:** 178

### P3: Sheet missing `SheetDescription` for accessibility
- **Line:** 205-209

---

## Statistics
- Total issues found: 11 (P0: 0, P1: 5, P2: 3, P3: 3)
- Issues fixed: 5 (all P1)
- Lines of code: 386
