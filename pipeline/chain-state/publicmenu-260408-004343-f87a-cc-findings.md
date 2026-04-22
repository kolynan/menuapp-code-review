# CC Reviewer Findings — ПССК Prompt Quality Review
Chain: publicmenu-260408-004343-f87a

## Issues Found

1. **[CRITICAL] `handleCardTap('other')` in textarea form sends empty message** — In Fix 3D, the "Отправить" button calls `handleCardTap('other')` but the existing `handleCardTap` function (line 2285) does NOT pass `helpComment` message to the server. It creates a request with `message: ''`. The OLD code (lines 5137-5184) had a completely separate flow for "other" submissions that manually built the state with `msg` and called `handlePresetSelect`. The prompt's new textarea code will break custom request sending — it will send blank "other" requests. **PROMPT FIX:** Either (a) replicate the old "other" submission logic from lines 5137-5184 in the new form's onClick, or (b) explicitly instruct CC to modify `handleCardTap` to accept an optional `message` parameter and pass `helpComment` for type==='other'. This is a P0 data-loss bug.

2. **[CRITICAL] `activeRequests` shape mismatch — `.type` vs `.request_type` and `.sentAt` field** — The prompt's grid code uses `activeRequests.find(r => r.type === btn.id)` and `activeRow?.sentAt`. But examining `activeRequests` (line 1945: `ticketRows.filter(row => row.isActive)`), these are rows from `ticketRows` which are derived from `helpRequestFeed` (line 2053-2072). The ticketRows objects likely have `request_type` (from DB field name), not `type`. Also `sentAt` may be named differently (e.g. `timestamp`, `created_date`). The prompt MUST specify the exact field names from the ticketRow object shape to avoid runtime failures where `.find()` never matches. **PROMPT FIX:** Add a grep/read instruction: "Check the shape of objects in `ticketRows` (derived ~line 2053-2072) and use the correct field names. The prompt assumes `.type` and `.sentAt` — verify these match actual field names."

3. **[CRITICAL] React hook order violation risk in Fix 5** — Removing 3 useState hooks (`isTicketExpanded`, `highlightedTicket`) and 1 useRef (`ticketBoardRef`) changes the hook call order. React requires hooks to be called in the same order every render. If any other code conditionally references these hooks or if the removal shifts positions relative to other hooks, this will cause a React runtime error. The prompt mentions "replace with `// reserved — hook order` comment" but only as an afterthought in "Should NOT be". **PROMPT FIX:** Make this the PRIMARY instruction in Fix 5: "Replace removed useState/useRef calls with `const [_reserved1] = useState(null); // hook-order placeholder` to preserve hook call count. Do NOT delete the hook calls — replace them with no-ops."

4. **[MEDIUM] `openHelpDrawer` and `closeHelpDrawer` reference removed state** — `openHelpDrawer` (line 2271) calls `setIsTicketExpanded(false)` and `closeHelpDrawer` (line 2279) also calls `setIsTicketExpanded(false)`. If `isTicketExpanded` is removed (Fix 5), these calls will error. The prompt's FROZEN UX section says "keep logic, only adjust state resets if needed" but doesn't explicitly say to remove/replace `setIsTicketExpanded` calls in these two functions. **PROMPT FIX:** Add explicit instruction: "In `openHelpDrawer` (~line 2271) and `closeHelpDrawer` (~line 2279), remove `setIsTicketExpanded(false)` calls. Add `setCancelConfirmType(null)` to `closeHelpDrawer` to reset cancel confirm state."

5. **[MEDIUM] `focusHelpRow` removal not safe — called from `handleResendAll`** — The prompt says "Remove `focusHelpRow` function if it exists" but `focusHelpRow` is called at line 5062 (inside grid card onClick) and possibly elsewhere. While the old grid is being replaced, `focusHelpRow` might be referenced in `handleResendAll` or other non-JSX code (line 2699 definition references `activeRequests`). **PROMPT FIX:** Add "grep ALL call sites of `focusHelpRow` before removing. Remove function only if ALL call sites are also being removed in this change."

6. **[MEDIUM] Undo toast uses `t()` but prompt uses `tr()`** — The existing undo toast (line 5127) uses `t('help.sent_suffix')` and `t('help.undo')`. The prompt's new undo toast uses `tr('help.sent_suffix', 'отправлено')` and `tr('help.undo', 'Отмена')`. Mixing `t()` and `tr()` in the same component is already established in the codebase (constants use `tr()`, render uses `t()`), but the undo toast CURRENTLY uses `t()`. The prompt should keep `t()` for existing keys to avoid regression, or explicitly state "change to tr() with fallback". **PROMPT FIX:** Clarify: use `tr()` consistently for ALL help drawer strings (including undo toast) since the new keys are all `tr()`. Or note that `t('help.sent_suffix')` already works and keep `t()`.

7. **[MEDIUM] `cancelConfirmType` state position matters for hook order** — Fix 5 says "Add `cancelConfirmType` / `setCancelConfirmType` state (new)". The prompt doesn't specify WHERE to add it relative to other hooks. If it's added after removing 3 hooks, the net hook count changes. **PROMPT FIX:** Specify: "Add `const [cancelConfirmType, setCancelConfirmType] = useState(null);` at line ~1828 (immediately after the removed/replaced hooks, maintaining hook order)."

8. **[MEDIUM] `activeRequests` for non-`other` types may not have `.sentAt`** — The urgency helper `getHelpUrgency(type, sentAt)` requires `sentAt` as a timestamp (ms since epoch). The `requestStates` object (line 2293-2308) stores `sentAt: now` as `Date.now()` but `ticketRows` (derived from server feed) may store timestamps differently (ISO string, seconds, etc.). If `activeRow?.sentAt` returns an ISO string, `Date.now() - sentAt` will produce NaN. **PROMPT FIX:** Add note: "Verify `sentAt` field type in ticketRows — if it's an ISO string, parse it with `new Date(sentAt).getTime()` before computing elapsed time."

9. **[LOW] `HELP_URGENCY_THRESHOLDS` and `HELP_URGENCY_GROUP` don't need `useMemo`** — These are static objects with no dependencies. Plain `const` would be cleaner and avoid unnecessary hook slots. However, consistency with existing pattern (other HELP_* constants use useMemo) is fine. No action needed unless hook count is a concern.

10. **[LOW] Missing `helpSubmitError` display** — The current code (lines 5133-5135) shows `helpSubmitError` in the drawer. The prompt's new JSX doesn't include this error display anywhere. **PROMPT FIX:** Add error display after undo toast: `{helpSubmitError && <div className="mx-3.5 mb-3 ...">...</div>}`.

11. **[LOW] MapPin icon may still be imported but unused** — The prompt removes the MapPin table info line but doesn't mention cleaning up the import. If MapPin is only used in the help drawer, it becomes a dead import. **PROMPT FIX:** Add "Check if MapPin is used elsewhere. If only in help drawer, remove from import."

12. **[LOW] `help.get_bill` vs `help.bill` key mismatch** — Existing code uses `tr('help.bill', 'Bring the bill')` (line 1802) with key `help.bill`. The prompt's Fix 1 changes this to `tr('help.get_bill', 'Счёт')`. Fix 4 adds `"help.get_bill": "Bill"` to EN and `"help.get_bill": "Счёт"` to RU. But the old `help.bill` key still exists in both dictionaries (RU line ~9: `"help.bill": "Принести счёт"`). This is fine (new key), but the prompt should note: "The key changes from `help.bill` to `help.get_bill`. All references to the old key in render code must also be updated." **PROMPT FIX:** Note that `t('help.bill')` used at line 5051 must become `HELP_CARD_LABELS.bill` or be removed (since the new grid uses HELP_CARD_LABELS).

## Line Number Verification
| Reference | Prompt says | Actual | Status |
|-----------|------------|--------|--------|
| HELP_REQUEST_TYPES | ~line 1796 | 1796 | ✅ |
| HELP_CARD_LABELS | ~line 1800 | 1800 | ✅ |
| HELP_COOLDOWN_SECONDS | ~line 1799 | 1799 | ✅ |
| HELP_CHIPS | ~line 1807 | 1807 | ✅ |
| HELP_PREVIEW_LIMIT | ~line 1795 | 1795 | ✅ |
| isTicketExpanded | ~line 1827 | 1827 | ✅ |
| highlightedTicket | ~line 1826 | 1826 | ✅ |
| ticketBoardRef | ~line 1825 | 1825 | ✅ |
| Drawer open={isHelpModalOpen} | ~line 4889 | 4889 | ✅ |
| ticketRows.length > 0 (ticket board start) | ~line 4922 | 4922 | ✅ |
| grid grid-cols-2 gap-3 | ~line 5048 | 5048 | ✅ |
| showOtherForm && | ~line 5099 | 5099/5137 | ✅ (two locations) |
| undoToast && | ~line 5125 | 5125 | ✅ |
| I18N_FALLBACKS | ~line 476 | 327 | ❌ (actual line 327) |
| I18N_FALLBACKS_RU | ~line 588 | 588 | ✅ |
| openHelpDrawer | ~lines 2264-2282 | 2264-2282 | ✅ |
| HelpFab | ~line 4870-4886 | 4872 | ✅ |
| useHelpRequests | ~lines 1772-1786 | ~1772-1786 area | ✅ |
| focusHelpRow | exists? | Yes, line 2699 | ✅ |

## Fix-by-Fix Analysis

### Fix 1 — Update button set and config constants
**RISKY** — Code snippets are correct. New types (`plate`, `utensils`, `clear_table`) added correctly. However: `HELP_CARD_SHORT_LABELS` is a brand new constant — prompt correctly introduces it. The `HELP_REQUEST_TYPES` Set still includes `'other'` which is correct. **Risk:** HELP_REQUEST_TYPES is used in server feed filtering (line 2053, 2061) — adding new types that don't exist on server side won't cause crashes but those types will be filtered OUT of feed results. Prompt should note: "New types (`plate`, `utensils`, `clear_table`) must also exist in the ServiceRequest backend model's type enum, or they will be filtered out during feed sync."

### Fix 2 — Add urgency threshold config
**SAFE** — Pure additive. New constants, new helper functions. `getHelpUrgency` and `getHelpTimerStr` are `useCallback` with correct deps. No existing code is modified. Minor: `useCallback` deps include `HELP_URGENCY_GROUP` and `HELP_URGENCY_THRESHOLDS` which are useMemo with `[]` deps — these are stable references, so deps are technically unnecessary but harmless.

### Fix 3 — Rewrite drawer JSX
**RISKY** — This is the largest change. Issues:
- **3A (Header):** Correct. Uses `currentTable?.name || currentTable?.code` (verified: `currentTable` exists at line 1770). Adds `activeRequestCount` check (verified: exists at line 1946). Safe.
- **3B (Grid):** RISKY — `activeRequests.find(r => r.type === btn.id)` field name concern (Issue #2). `sentAt` field concern (Issue #8). Grid layout itself is sound.
- **3C (Cancel confirm):** RISKY — `handleSosCancel` references `activeRequests` and `getHelpUrgency` — deps look correct. But `handleResolve` for non-other types doesn't need `otherId` — correct (line 2370 handles `type !== 'other'` path).
- **3D (Other request):** CRITICAL — `handleCardTap('other')` issue (Issue #1).
- **3E (Undo toast):** Mixed `t()`/`tr()` concern (Issue #6).

### Fix 4 — Add new i18n keys
**SAFE** — Pure additive to dictionaries. All keys are properly paired EN/RU. **Issue:** I18N_FALLBACKS line number is wrong (prompt says ~476, actual is 327). This could cause CC to look in the wrong area and miss the dictionary. **PROMPT FIX:** Correct to "I18N_FALLBACKS (~line 327)".

### Fix 5 — Clean up removed state
**RISKY** — Hook order is the main concern (Issue #3). The prompt's "keep with comment" guidance is buried in "Should NOT be" section. Also `openHelpDrawer`/`closeHelpDrawer` reference removed state (Issue #4). `focusHelpRow` removal needs call-site verification (Issue #5).

## Summary
Total: 12 issues (3 CRITICAL, 5 MEDIUM, 4 LOW)
Prompt clarity rating: 3/5

## Prompt Clarity (MANDATORY — do NOT skip)
- **Overall clarity: 3/5** — The prompt is very detailed with good structure, but has 3 critical issues that would cause runtime failures if not addressed.
- **What was most clear:** Line numbers are almost all accurate (only I18N_FALLBACKS off by ~150 lines). Fix structure with Now/Should be/Should NOT be/Verification is excellent. FROZEN UX section is comprehensive. Button grid JSX is detailed with exact Tailwind classes matching mockup.
- **What was ambiguous or could cause hesitation:**
  1. How to handle "other" type submission from textarea (handleCardTap won't pass message)
  2. Whether `activeRequests` rows have `.type` or `.request_type` and `.sentAt` format
  3. How to handle hook order when removing 3 hooks and adding 1
  4. Whether to update `openHelpDrawer`/`closeHelpDrawer` functions that reference removed state
  5. Where exactly to place the new `cancelConfirmType` useState
- **Missing context:**
  1. Exact shape of `ticketRows` objects (field names for type, sentAt, id, message)
  2. Whether new request types (`plate`, `utensils`, `clear_table`) need backend enum changes
  3. Explicit handling of the "other" textarea submission flow (old code was 50+ lines, not just `handleCardTap('other')`)
  4. `helpSubmitError` display location in new layout
