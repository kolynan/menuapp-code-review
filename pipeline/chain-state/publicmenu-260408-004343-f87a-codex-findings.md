# Codex Reviewer Findings — ПССК Prompt Quality Review
Chain: publicmenu-260408-004343-f87a

## Issues Found
1. [CRITICAL] Missing live timer/urgency render driver — `getHelpUrgency()` and `getHelpTimerStr()` both depend on `Date.now()`, but the prompt never tells the implementer to bind the new grid to `timerTick` or another periodic state. The UI can easily freeze at the initial timer/color until some unrelated rerender happens. PROMPT FIX: explicitly require the active-button render path to depend on the existing timer state and add a validation step that the timer and urgency colors update without reopening the drawer.

2. [CRITICAL] `handleResolve()` and `handleCardTap()` are reused with guessed contracts — the prompt assumes `handleResolve(type, id?)` and `handleCardTap('other')` are valid calls, but it never states their real signatures or data expectations. If either handler expects a row object, request id, message payload, or a different argument order, send/cancel behavior breaks. PROMPT FIX: include the exact current handler signatures in the prompt or instruct the implementer to inspect them first and only then wire the new UI to those verified contracts.

3. [CRITICAL] The JSX replacement boundary is unsafe — "Replace ENTIRE DrawerContent children" is too broad for a large file and does not say whether `<DrawerContent>` props, wrapper nodes, error blocks, or sibling structure must stay untouched. That invites accidental truncation or removal of frozen behavior. PROMPT FIX: define hard anchors and preservation rules, for example "keep the existing `<DrawerContent ...>` opening/closing tags and props, and replace only the child block between X anchor and Y anchor."

4. [CRITICAL] Pending-undo and duplicate-tap behavior is undefined — the redesign maps one button to one in-place state, but the prompt never specifies what happens if the same button is tapped during the 5-second undo window, while the same request type is already active, or while the red cancel confirm is open. This is a core state-machine gap, not a minor edge case. PROMPT FIX: add an explicit transition table for `idle`, `pending_send`, `active_neutral`, `active_amber`, `active_red`, and `cancel_confirm`, including repeat taps, undo, drawer reopen, and duplicate same-type requests.

5. [CRITICAL] Post-fix validation is too weak for a full Drawer rewrite — the prompt relies on grep checks, manual inspection, and a file line-count threshold. None of that reliably catches broken JSX, undefined symbols, missing imports, or syntax damage after a large structural edit. PROMPT FIX: require at least one syntax/build validation step on `pages/PublicMenu/x.jsx` plus a focused smoke test for open, send, undo, cancel, and reopen/localStorage restore. Keep the line-count check only as a secondary sanity check.

6. [CRITICAL] i18n instructions conflict with themselves — the broader rules say `t('key')`, the prompt snippets use `tr('key', fallback)`, and the prompt never confirms which helper already exists in `x.jsx`. It also uses `help.sent_suffix` in the undo toast snippet without adding that key to the required dictionary list, and `HELP_CARD_LABELS[undoToast.type] || undoToast.type` can leak raw internal ids to users. PROMPT FIX: standardize on the exact helper that already exists in the file, add every newly referenced key including `help.sent_suffix`, and forbid raw-type fallbacks in user-facing text.

7. [MEDIUM] Hook cleanup guidance is technically wrong and contradictory — Fix 5 says to remove dead `useState`s, then says to keep `isTicketExpanded` if referenced elsewhere, and adds "replace with `// reserved — hook order` comment". Comments do not preserve React hook order; only stable unconditional hooks do. PROMPT FIX: say "remove unused hooks normally; if a hook value is still referenced in close/open/reset logic, either refactor that logic or keep the hook until all references are removed." Remove the placeholder-comment instruction.

8. [MEDIUM] New state reset rules are missing — `cancelConfirmType` is introduced, but the prompt never says when it resets: drawer close, drawer reopen, successful undo, successful resolve, or opening the "other" form. That can leave stale confirm UI on reopen or after unrelated actions. PROMPT FIX: explicitly list reset points for `cancelConfirmType`, `showOtherForm`, and `helpComment` in `openHelpDrawer`, `closeHelpDrawer`, undo, resolve, and successful send flows.

9. [MEDIUM] Some snippets reference locals that are not guaranteed to exist — the new header uses `activeRequestCount`, but the prompt only confirms `activeRequests`. The prompt also says "define button config array inside render" while showing a `const SOS_BUTTONS = [...]` declaration that cannot be pasted literally into JSX children. PROMPT FIX: replace `activeRequestCount` with `activeRequests.length` or define it explicitly, and state the exact placement for `SOS_BUTTONS`: component body before `return` or a memo above the render block.

10. [MEDIUM] The active-row selection rule is underspecified — `activeRequests.find(r => r.type === btn.id)` silently assumes only one unresolved row per type. If duplicate unresolved rows exist because of retries, restore logic, or past-state leakage, the UI can show the wrong timer and cancel the wrong row. PROMPT FIX: define the source-of-truth rule, for example "use the most recent unresolved row per type, ordered by sentAt/createdAt descending."

11. [MEDIUM] Import maintenance is not explicitly covered — removing the old header/ticket-board UI will likely orphan `ChevronDown`, `ArrowLeft`, `MapPin`, and possibly ref-related imports. The prompt also assumes `Layers` already exists but does not say what to do if it does not. PROMPT FIX: add an import cleanup step: remove newly unused imports and add `Layers` only if it is absent.

12. [MEDIUM] The class strategy is risky for Tailwind/Base44 — the prompt builds classes through `${us.border} ${us.bg}` and arbitrary-opacity tokens like `bg-amber-500/[.18]`. In purge/JIT-sensitive setups this can miss class generation or violate the repo rule against dynamic Tailwind classes. PROMPT FIX: require static variant maps with full literal class strings or explicit conditional branches with literal class names.

13. [MEDIUM] Precedence rules can override frozen behavior by accident — the prompt says "When Fix description and mockup conflict — mockup wins," but it also has frozen logic, state-machine rules, and no-change zones. Without a hierarchy, an implementer can over-trust the mockup and remove working behavior that the mockup simply does not show. PROMPT FIX: define precedence explicitly: frozen behavior and server/persistence logic win over visuals; the mockup wins only for layout/styling inside the allowed Drawer content area.

14. [LOW] Verification commands assume Unix-style tooling and the wrong path shorthand — examples use `grep`, `wc -l`, and `x.jsx` without the full `pages/PublicMenu/` path. In PowerShell-based pipelines that can fail or be interpreted differently. PROMPT FIX: use repo-standard `rg`/PowerShell-safe commands and always show the full repo-relative path.

15. [LOW] The mobile touch-target rule contradicts the provided UI snippet — the checklist says controls should be `>= 44x44`, but the active cancel button is specified as `22x22` and the prompt explicitly rationalizes that away. That bakes an accessibility failure into the target. PROMPT FIX: enlarge the actual clickable cancel affordance to at least `44x44`, or make the whole active tile tappable with a separate confirmation rule.

## Summary
Total: 15 issues (6 CRITICAL, 7 MEDIUM, 2 LOW)

## Additional Risks
- The prompt depends on external UX files as the visual source of truth, but it does not summarize which behaviors from those files are non-negotiable versus illustrative. That increases the chance of over-implementing the mockup.
- The line-based anchors (`~line 4889`, `~line 1799`) will drift quickly. On a future rerun of the same prompt, those anchors may point to the wrong block even if the grep strings still exist in multiple places.
- The manual "wait 8+ min / 15+ min" checks are not realistic in an implementation loop, so the most important urgency behavior is likely to go unverified unless the prompt explicitly allows a test-time acceleration strategy.

## Prompt Clarity (MANDATORY — do NOT skip)
- Overall clarity: 3/5
- What was most clear: the visual direction of the redesign, the new 6-button set, the urgency thresholds, and the list of frozen areas that should not be changed.
- What was ambiguous or could cause hesitation: the exact JSX replacement boundary, the real handler signatures, repeated-tap behavior, state reset rules, the live timer/rerender mechanism, and which i18n helper should be used.
- Missing context: the exact contracts for `handleResolve`, `handleCardTap`, `openHelpDrawer`, and `closeHelpDrawer`; the exact definition of `activeRequests`; the real translation helper in `x.jsx`; and the intended behavior during undo-pending, duplicate same-type requests, and drawer reopen after partial state changes.
