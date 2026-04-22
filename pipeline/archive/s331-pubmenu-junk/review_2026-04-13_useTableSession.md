## Code Review Report: 260320-01 useTableSession RELEASE.jsx

### Scope
- Reviewed `C:/Dev/worktrees/task-260413-200148/pages/PublicMenu/260320-01 useTableSession RELEASE.jsx`
- Read nearby context files:
  - `C:/Dev/worktrees/task-260413-200148/pages/PublicMenu/README.md`
  - `C:/Dev/worktrees/task-260413-200148/pages/PublicMenu/BUGS.md`
- Cross-checked `C:/Dev/worktrees/task-260413-200148/components/sessionHelpers.js` where expiry logic is defined

### Summary
This hook is structurally solid on hooks ordering and storage guards, but it has one critical session-expiry regression and several correctness issues around totals, status rendering, partner resets, and restore failure handling. The README/BUGS context also confirms that at least one previously fixed P0 (`hasRecentActivity`) has regressed in this release.

### Findings

- [P0] Active sessions can be expired and cancelled based only on `opened_at` - `sessionHelpers.isSessionExpired()` still expires sessions from `opened_at` only, and this release removed the local `hasRecentActivity()` guard that `README.md` / `BUGS.md` say was required in S68. In both restore branches, an 8h-old but still active table can be marked expired and its `new` orders cancelled via `closeExpiredSessionInDB()`. A guest who refreshes on a long-running active table can lose visibility into the real visit and force the app onto a new session. FIX: restore `hasRecentActivity(session)` and gate both expiry checks with `isSessionExpired(session) && !hasRecentActivity(session)` before closing anything.
  - Evidence: `useTableSession RELEASE.jsx:284-300`, `:323-325`
  - Context: `components/sessionHelpers.js:169-177`, `BUGS.md:843-849`

- [P1] Money arithmetic can corrupt bills and visit totals - The hook adds `item.line_total` and `order.total_amount` without coercing them to numbers. If Base44 returns numeric fields as strings, `sharedPool += lineTotal`, `bill.singles += lineTotal`, and `sum + (o.total_amount || 0)` will concatenate strings and produce wrong totals for `myBill`, `othersTotal`, and `tableTotal`. Other page files already defensively wrap these same fields with `Number(...)`, which makes the inconsistency higher risk, not lower. FIX: coerce `line_total`, `dish_price`, `quantity`, and `total_amount` with `Number(...) || 0` before arithmetic, then round at the formatting boundary.
  - Evidence: `useTableSession RELEASE.jsx:727-736`, `:786-787`

- [P1] Partial guest data drops guests from the billing map and over-splits shared items - `billsByGuest` chooses guest IDs from `sessionGuests` or from `sessionOrders`, never a union. If `sessionGuests` is partial but non-empty, any guest present only in orders is excluded from `bills`, their single items are skipped, and `sharedPool` is divided by too small a `guestCount`. That misstates both individual and table-level billing. FIX: build `guestIds` as a deduped union of guest IDs from both `sessionGuests` and `sessionOrders`.
  - Evidence: `useTableSession RELEASE.jsx:707-717`, `:722-747`

- [P1] Status badges can regress to `"new"` even when the order already carries richer stage data - `getOrderStatus()` detects when `order.stage_id` is an object, but then throws away the object and only uses its ID to query `stagesMap`. If `orderStages` is still loading or incomplete, the function falls back to `t('status.new')` even for accepted / in-progress / ready orders. That shows guests the wrong order state during initial mobile load or stale stage-cache situations. FIX: if `order.stage_id` is an object, use its `internal_code`, `name`, and `color` directly before falling back to `stagesMap`.
  - Evidence: `useTableSession RELEASE.jsx:797-811`

- [P1] Partner changes do not reset session state, so stale visit data can leak across restaurants - The reset effect reruns on `partner?.id`, but it only compares previous and current table ID. If the user opens another restaurant in the same tab and `currentTableId` stays the same or is still `null` during the transition, old `tableSession`, guest, orders, and `didAttemptRestoreRef` survive into the new partner context. Because storage keys are partner-scoped, this asymmetry is a correctness bug. FIX: track the previous partner ID alongside the previous table ID and clear/reset state when either dimension changes.
  - Evidence: `useTableSession RELEASE.jsx:213-243`

- [P2] A single transient restore error silently disables restore for the rest of the visit - `didAttemptRestoreRef.current` is set to `true` before any async work, the entire restore flow swallows errors, and the flag is never cleared on failure. On flaky mobile connections, one transient exception during `TableSession.filter`, `getSessionGuests`, `getSessionOrders`, or `OrderItem.filter` leaves the guest with no restored session/history until table change or full reload, with no retry affordance or error feedback. FIX: keep the retry-loop guard, but add bounded retry/backoff or expose a restore error + retry path to the page.
  - Evidence: `useTableSession RELEASE.jsx:267-273`, `:479-481`

- [P2] Expired-session cleanup blocks initial restore on the critical path - The current restore code `await`s `closeExpiredSessionInDB()` in both expiry branches. That helper does multiple network writes/reads, including order cancellation, even though its own comment says cleanup is best-effort. On a phone connection, one stale session can noticeably delay reopening the drawer/history after refresh. FIX: move cleanup off the critical path again: either fire-and-forget it, or queue it after the active session has been selected and rendered.
  - Evidence: `useTableSession RELEASE.jsx:169-190`, `:299`, `:324`
  - Context: `BUGS.md:530-533` notes this was previously fixed as part of the polling/restore hardening

- [P2] `_id` handling is inconsistent, so the current-guest ref can be cleared for valid guests - The hook defines `normalizeGuestId()` specifically to support both `id` and `_id`, but the sync effect writes `currentGuestIdRef.current = currentGuest?.id || null`. If a valid guest object arrives with only `_id`, the ref flips back to `null`, and polling keeps re-running guest restore/device lookup logic unnecessarily. FIX: set the ref with `normalizeGuestId(currentGuest) || null` for consistency with the rest of the file.
  - Evidence: `useTableSession RELEASE.jsx:17-18`, `:257-259`

- [P2] The fallback `"new"` status label is not protected against missing translations - The hook returns `t('status.new')` directly, while the rest of PublicMenu moved to `tr()`-style safe fallbacks because `t()` can return the raw key string. If this key is missing in a locale pack, the guest sees `status.new` in the status badge. FIX: pass a safe translation helper into the hook, or normalize the `t()` return before using it as the final user-facing label.
  - Evidence: `useTableSession RELEASE.jsx:811`
  - Context: `BUGS.md:763-768` documents the same raw-key failure mode elsewhere in PublicMenu

### Statistics
- Total issues: 8
- Severity split: P0: 1, P1: 4, P2: 3, P3: 0
- Files analyzed: 4
- Lines reviewed: ~1,944 (`useTableSession`, `README`, `BUGS`, `sessionHelpers`)

### Notes
- I could not save artifacts into `C:/Dev/worktrees/task-260413-200148/pages/PublicMenu/` because that path is read-only under the current sandbox. This report is saved in the writable mirror: `C:/Dev/menuapp-code-review/pages/PublicMenu/`.
- `codex exec` second-opinion review was attempted per repo workflow, but the CLI failed with an access-denied error in this environment.
