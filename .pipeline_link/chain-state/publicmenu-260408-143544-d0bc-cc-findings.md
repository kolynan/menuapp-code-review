# CC Writer Findings — PublicMenu
Chain: publicmenu-260408-143544-d0bc

## Findings

1. **[P0] Fix 1 — HELP_PREVIEW_LIMIT is NOT dead: live JSX references at lines 5020 and 5112**
   The task states HELP_PREVIEW_LIMIT (line 1834) is "only used in focusHelpRow (line 2786)". This is INCORRECT. Grep reveals two additional references in the ACTIVE drawer JSX:
   - Line 5020: `activeRequests.slice(0, HELP_PREVIEW_LIMIT)` — controls how many tickets are shown in collapsed view
   - Line 5112: `activeRequestCount > HELP_PREVIEW_LIMIT` — controls "Show all requests" button visibility
   These are inside `<Drawer open={isHelpModalOpen}>` at line 4974 — the ONE AND ONLY drawer in the file. This JSX is LIVE, not dead. Deleting HELP_PREVIEW_LIMIT will cause a ReferenceError crash when any user opens the help drawer.
   FIX: Do NOT delete HELP_PREVIEW_LIMIT. Either (a) defer to B2, or (b) also clean the JSX references (but that contradicts SCOPE LOCK "DO NOT touch any JSX return blocks").

2. **[P0] Fix 2 — HELP_CHIPS is NOT dead: live JSX reference at line 5187**
   The task states HELP_CHIPS is "only used in old drawer JSX (lines 4976-5281)". This is true — but that JSX IS the currently active drawer, not dead code. Line 5187: `{HELP_CHIPS.map(chip => (` renders the chip buttons inside the "Other" form. The drawer at line 4974 is the ONLY `<Drawer>` component in the file — there is no "new" drawer replacing it yet (B2 hasn't happened).
   FIX: Do NOT delete HELP_CHIPS. Defer to B2 when JSX is rewritten.

3. **[P0] Fix 3 — ticketBoardRef is NOT dead: live JSX reference at line 5008**
   Line 5008: `<div ref={ticketBoardRef} className="mb-4">` — this is inside the active drawer. Also, the post-send callback lines (2568-2570) reference ticketBoardRef and highlightedTicket which are used by the live drawer. Specifically:
   - Line 5008: `ref={ticketBoardRef}` — attaches ref to ticket board div
   - Line 5025: `highlightedTicket === req.id` — used for visual highlighting of tickets
   - Line 2569: `setHighlightedTicket(...)` — triggers highlight after send
   Deleting ticketBoardRef and the post-send callback lines would break scroll-to-ticket and highlight-after-send behavior.
   FIX: Do NOT delete ticketBoardRef or post-send callback lines. Defer to B2.

4. **[P0] Fix 4 — focusHelpRow is NOT dead: live JSX reference at line 5147**
   Line 5147: `focusHelpRow(activeRow.id)` — called when user taps a card that already has an active request (scrolls to and highlights the existing ticket). This is inside the active drawer JSX grid at line 5131-5170.
   FIX: Do NOT delete focusHelpRow. Defer to B2.

5. **[P0] Fix 5 — 5 of 7 helpers are NOT dead: live JSX references in active drawer**
   The task states these are "only called in old drawer JSX" — but that JSX IS the live drawer. Specific references:
   - `getHelpFreshnessLabel` → line 5021: `const freshnessLabel = getHelpFreshnessLabel();`
   - `getHelpReminderLabel` → line 5030: `const reminderLabel = getHelpReminderLabel(req);`
   - `getHelpErrorCopy` → line 5031: `const errorCopy = getHelpErrorCopy(req);`
   - `getHelpResolvedLabel` → line 5058: `{getHelpResolvedLabel(req.type)}`
   - `getHelpWaitLabel` → line 5067: `{...getHelpWaitLabel(req)}`
   
   Two helpers (`getHelpReminderWord`, `getMinutesAgo`) are only called by other helpers in this list, so they're transitively live.
   
   FIX: Do NOT delete any of the 7 helpers. Defer to B2.

6. **[P1] Fix 6 — Adding comments to dead state hooks: SAFE but incomplete**
   Adding comments to `highlightedTicket` (line 1911) and `isTicketExpanded` (line 1912) is safe and correct — hook order is preserved. However, note that `isTicketExpanded` is NOT actually dead — it's actively used in the drawer JSX at lines 4977, 4994, 4995, 5009, 5018, 5112, 5128, 5131. Only `highlightedTicket` is arguably "dead" in the sense that removing its visual effect wouldn't crash the page (it only adds a CSS class). The comment "dead, kept for hook order until B2" is misleading for `isTicketExpanded` since it controls drawer state switching (collapsed/expanded view).
   FIX: For `isTicketExpanded`, change comment to: `// SOS v6.0 B1 — will be refactored in B2 (controls old drawer state)`. For `highlightedTicket`, the proposed comment is acceptable.

## Root Cause Analysis

The task premise is fundamentally incorrect. It states: *"these symbols have ZERO references in current JSX already OR are only referenced by OTHER dead code in this cleanup list."*

In reality, the drawer JSX at lines 4974-5281 is the **only** `<Drawer>` component in the file and is **actively rendered** when users open the help modal. КС-A added the new HelpFab card grid (which replaced the old card-tap flow outside the drawer), but the **drawer interior** — the ticket board, chips, helpers — was NOT replaced by КС-A. That replacement is scheduled for B2.

**All symbols proposed for deletion in Fixes 1-5 are referenced by live, rendering JSX.** Deleting them would cause immediate ReferenceError crashes for any user who opens the help drawer.

## Recommendation

**BLOCK this B1 task.** The cleanup cannot be done separately from the JSX rewrite. Options:
- **Option A (recommended):** Merge B1 into B2. Delete these constants/helpers AS PART OF the JSX rewrite, ensuring no dangling references.
- **Option B:** Redefine B1 scope to ONLY Fix 6 (adding comments). All deletions defer to B2.

## Summary
Total: 6 findings (5 P0, 1 P1)

## Prompt Clarity

⛔ Prompt Clarity (MANDATORY):
- Overall clarity: 2/5
- Ambiguous Fix descriptions: ALL Fixes 1-5 contain the same critical error — they claim symbols are dead ("ZERO references in current JSX") when they are actively referenced by the live drawer JSX at lines 4974-5281. The "Why dead" section in each Fix is factually incorrect.
- Missing context: The task should have included a grep of all references (not just non-JSX references) for each symbol. The prerequisite claim "ZERO references in current JSX" was not verified against the actual codebase.
- Scope questions: The SCOPE LOCK says "DO NOT touch any JSX return blocks" while simultaneously instructing deletion of symbols that are referenced by those JSX blocks — this is an inherent contradiction that makes the task as written impossible to execute safely.
