# Codex Reviewer Findings — ПССК Prompt Quality Review
Chain: publicmenu-260408-011900-d310

## Issues Found
1. [CRITICAL] New request types are not wired into the server-sync merge path — The prompt updates `HELP_REQUEST_TYPES` at line 1796, but it also freezes "ServiceRequest polling and server sync (~lines 2044-2260)" while that frozen block still hardcodes `const nonOtherTypes = ['call_waiter', 'bill', 'napkins', 'menu'];` at line 2130 in `pages/PublicMenu/260407-00 PublicMenu x RELEASE.jsx`. If the executor follows the prompt literally, `plate`, `utensils`, and `clear_table` will not participate in merge/resolution flow. PROMPT FIX: explicitly allow editing the sync merge block and replace `nonOtherTypes` with the new preset type list.

2. [CRITICAL] Legacy `menu` requests have no migration rule — Removing `menu` from `HELP_REQUEST_TYPES` changes server filtering at lines 2053 and 2061, so existing active server-side `menu` requests will disappear from the drawer after deploy. The same prompt still preserves local restore logic, so old local `menu` state and server `menu` state can diverge. PROMPT FIX: define a migration strategy: keep `menu` readable until resolved, map it to another UI state, or explicitly discard it on load/sync.

3. [CRITICAL] The stated JSX replacement anchor does not exist in the current file — The prompt says the replacement should start at `className="flex justify-center"` and calls that the "first child inside DrawerContent", but the actual first child after `<DrawerContent ...>` at line 4890 is `<div className="relative">` starting at line 4891. That makes the anchor-based replacement unsafe. PROMPT FIX: use anchors that exist in the current file, for example "replace the children between the actual first child `<div className="relative">` and the closing `</DrawerContent>` while preserving the Drawer tags and props."

4. [CRITICAL] The redesign snippet breaks the current multi-`other` data model — The source file clearly supports multiple custom requests via `requestStates.other` arrays and grouping logic (for example lines 1922-1927, 2007-2011, and 2192-2255). The prompt's JSX uses `activeRequests.some/find(r => r.type === 'other')` and `handleSosCancel('other')`, which only shows and cancels one `other` request. PROMPT FIX: specify how multiple active custom requests should render and cancel, and update the snippet to use a deterministic rule or a list instead of `find(...)`.

5. [MEDIUM] The i18n migration is incomplete and can leave English on the wrong key path — The new header snippet uses `tr('help.title', ...)`, but the English fallback map currently uses `help.modal_title` at line 531; `help.title` exists only in the RU map at line 589. The prompt also says "grep first, add only if absent", which can make an implementer see `help.title` in RU and skip adding it to EN. PROMPT FIX: either keep using the existing `help.modal_title` key or explicitly add `help.title` to the English fallback map and state that both language maps must contain the same new key set.

6. [MEDIUM] The prompt still contradicts its own "static Tailwind classes" claim — R2 says dynamic Tailwind classes were fixed, but the supplied JSX still assembles classes with variables like `activeBg`, `activeBorder`, `labelColor`, `timerColor`, `xBg`, and `xColor` inside template strings. That is still dynamic class composition. PROMPT FIX: provide one full literal class string per urgency variant or a map of complete `className` strings, not fragments inserted into templates.

7. [MEDIUM] Cleanup guidance for `isTicketExpanded` is self-contradictory — Fix 5 says to keep `const [isTicketExpanded, setIsTicketExpanded] = useState(false);` and even keep `setIsTicketExpanded(false);` in the post-send block, but the verification then says `grep isTicketExpanded ... should be 0 occurrences (only placeholder remains)`. Those instructions cannot both be true. PROMPT FIX: pick one strategy and make verification match it: either fully remove the state and all setters, or keep the placeholder hook and specify the exact remaining references.

8. [MEDIUM] The scope lock omits several edit locations the prompt itself requires — The scope section allows changes around the drawer block, constants, i18n, state, and "dead state cleanup", but the actual fix steps also require edits in `openHelpDrawer`/`closeHelpDrawer` (2264-2282), the pending-send success block (2481-2483), `focusHelpRow` (2699-2706), and top-level imports. That mismatch can make an executor hesitate about whether those edits are allowed. PROMPT FIX: expand the scope lock to list every required edit region explicitly.

9. [MEDIUM] Acceptance text does not match the provided JSX — The verification says tapping "Позвать" should show `Позвать · <1м ✕` inline, but the supplied active-button JSX renders the short label and `✕` on one row and the timer on a separate row below. The prompt also describes a "3×2" grid while the snippet uses `grid-cols-2`, which many readers will interpret as 2 columns and 3 rows. PROMPT FIX: align the prose validation steps with the exact JSX structure and define grid orientation explicitly as "2 columns, 3 rows" or "3 columns, 2 rows."

10. [LOW] The prompt's own snippet still contains user-facing raw fallbacks — `«{activeRequests.find(...)?.message || '...'}»` and `{HELP_CARD_LABELS[undoToast.type] || undoToast.type}` both violate the repo's stated i18n/no-raw-fallback rules. PROMPT FIX: require translated fallbacks or guaranteed safe labels instead of raw ids and literal `'...'`.

11. [LOW] The line-count/check tooling is already stale and shell-specific — The prompt says the release file is 5374 lines, but `pages/PublicMenu/260407-00 PublicMenu x RELEASE.jsx` is 5375 lines. It also prescribes `grep` and `wc -l`, while this repo runs in a PowerShell-oriented environment. PROMPT FIX: treat counts as approximate and use PowerShell/`rg`-safe verification commands.

## Summary
Total: 11 issues (4 CRITICAL, 5 MEDIUM, 2 LOW)

## Additional Risks
- The prompt targets `pages/PublicMenu/x.jsx` for edits, but the verification baseline is the named RELEASE copy. If those files drift, the line anchors and grep guidance become unreliable.
- In this workspace, `pages/PublicMenu/x.jsx` triggers binary-file detection in some `rg` scans, so grep-based validation against the live edit target may misbehave unless the canonical file and encoding are clarified.
- Removing the old drawer header will likely orphan `DrawerHeader` and `DrawerTitle` imports, but the prompt's cleanup section does not mention them.

## Prompt Clarity (MANDATORY — do NOT skip)
- Overall clarity: 3/5
- What was most clear: the intended visual direction, the six-button set, the urgency thresholds, and the list of frozen behaviors around FAB, undo, persistence, and overlay handling.
- What was ambiguous or could cause hesitation: the real replacement anchors, whether server-sync code is allowed to change for new types, how multiple `other` requests should behave, and whether `isTicketExpanded` is supposed to stay or disappear.
- Missing context: the canonical source of truth file (`x.jsx` vs the named RELEASE copy), the full list of hardcoded request-type enums that must be updated, the migration behavior for legacy `menu` requests, and the intended UX for multiple active custom requests.
