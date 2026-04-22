<!-- Auto-extracted from task.log by watcher post-step (KB-165 fix, S296).
     Codex sandbox blocked direct write to pipeline/chain-state/; findings recovered from stdout.
     Source task: task-260416-214227-020  Chain: staffordersmobile-260416-213112-930f -->

# Codex Reviewer Findings â€” ÐŸÐ¡Ð¡Ðš Prompt Quality Review
(The pipeline uses regex extraction on your stdout. If this header is not the first line â†’ your findings are invisible to the watcher â†’ review treated as skipped.)

FORMAT (MANDATORY â€” follow exactly, do NOT skip any section):
# Codex Reviewer Findings â€” ÐŸÐ¡Ð¡Ðš Prompt Quality Review
Chain: staffordersmobile-260416-213112-930f

## Issues Found
1. [CRITICAL/MEDIUM/LOW] Title â€” Description. PROMPT FIX: ...
2. ...

## Summary
Total: N issues (X CRITICAL, Y MEDIUM, Z LOW)

## Additional Risks
Any risks the prompt author may not have considered.

## Prompt Clarity (MANDATORY â€” do NOT skip)
- Overall clarity: [1-5]
- What was most clear:
- What was ambiguous or could cause hesitation:
- Missing context:

## Fix Ratings (MANDATORY â€” ALWAYS include this section, even if no issues found)
Rate each Fix mentioned in the prompt. Scale: 1=Rewrite needed, 2=Major issues, 3=Needs clarification, 4=Minor issues, 5=Clear.

| Fix | Rating (1-5) | Verdict | Key issue (if any) |
|-----|-------------|---------|-------------------|
| Fix1 | X/5 | Clear / Needs clarification / Rewrite needed | ... |
| Fix2 | X/5 | ... | ... |
| Fix3 | X/5 | ... | ... |

Overall prompt verdict: APPROVED (all â‰¥4/5) / NEEDS REVISION (any <4/5)

Do NOT apply any fixes to code files. Analysis only.

=== SOURCE CODE ===
Read the target file(s) yourself using the Read tool.
Paths are specified in TASK CONTEXT below (look for "Ð¤Ð°Ð¹Ð» Ð¸ Ð»Ð¾ÐºÐ°Ñ†Ð¸Ñ", "Ð¤Ð°Ð¹Ð»:", or "Target file:").
Self-read mode (S283-Ch4 fix for WinError 206 on files >500 lines).
=== END SOURCE CODE ===

=== TASK CONTEXT ===
# SOM Ð‘2.1 â€” Fix BUG-SM-015: New Order on Closed Table (v7)

<!-- PC-VERDICT: GO (Cowork S304, 2026-04-16; v7 changes vs v6: CRITICAL path fix menuapp-code-review/pages/â†’pages/, Fix B.5 explicit old_string, staleTime:0 bullet removed from Fix A Should-NOT, ServiceRequest phantom-card comment, Safety Guards inline commit message) -->

## Context

**TARGET FILES (Ð±ÑƒÐ´ÑƒÑ‚ Ð¸Ð·Ð¼ÐµÐ½ÐµÐ½Ñ‹):**
- `pages/StaffOrdersMobile/staffordersmobile.jsx` (4617 lines Ð² HEAD, `260415-01 StaffOrdersMobile RELEASE.jsx` = 4617 lines â€” Ð¸ÑÑ‚Ð¾Ñ‡Ð½Ð¸Ðº Ð¸ÑÑ‚Ð¸Ð½Ñ‹)

**CONTEXT FILES (Ñ‚Ð¾Ð»ÑŒÐºÐ¾ Ð´Ð»Ñ Ñ‡Ñ‚ÐµÐ½Ð¸Ñ, Ð½Ðµ Ð¼ÐµÐ½ÑÑ‚ÑŒ):**
- `components/sessionHelpers.js` (232 lines, v1.1 Ð¾Ñ‚ S70) â€” ÑÐ¾Ð´ÐµÑ€Ð¶Ð¸Ñ‚ `getOrCreateSession`, `closeSession`
- `pages/PublicMenu/useTableSession.jsx` â€” guest-side session restore (ÐÐ• Ð¼ÐµÐ½ÑÑ‚ÑŒ)

**Ð—Ð°Ð´Ð°Ñ‡Ð°:** Ð¤Ð¸ÐºÑ BUG-SM-015 â€” Ð¿Ñ€Ð¸ Ð·Ð°ÐºÐ°Ð·Ðµ Ð³Ð¾ÑÑ‚ÐµÐ¼ Ð½Ð° Ñ€Ð°Ð½ÐµÐµ Ð·Ð°ÐºÑ€Ñ‹Ñ‚Ñ‹Ð¹ ÑÑ‚Ð¾Ð» Ð½Ð¾Ð²Ð°Ñ TableSession Ð´Ð¾Ð»Ð¶Ð½Ð° ÑÑ€Ð°Ð·Ñƒ Ð¾Ñ‚Ð¾Ð±Ñ€Ð°Ð¶Ð°Ñ‚ÑŒÑÑ ÐºÐ°Ðº Ð½Ð¾Ð²Ð°Ñ ÐºÐ°Ñ€Ñ‚Ð¾Ñ‡ÐºÐ° Ð² Ñ‚Ð°Ð±Ðµ Â«ÐÐºÑ‚Ð¸Ð²Ð½Ñ‹ÐµÂ», Ð° Ð½Ðµ ÑÐ»Ð¸Ð²Ð°Ñ‚ÑŒÑÑ Ñ Ð·Ð°ÐºÑ€Ñ‹Ñ‚Ð¾Ð¹ Ð² Â«Ð—Ð°Ð²ÐµÑ€ÑˆÑ‘Ð½Ð½Ñ‹Ñ…Â».

**Ð‘ÑŽÐ´Ð¶ÐµÑ‚:** $14 | **Ð¨Ð°Ð±Ð»Ð¾Ð½:** `consensus-with-discussion-v2` (Ð¡5v2) | **Ð’ÐµÑ:** M (3 Fix, ÑÐ²ÑÐ·Ð°Ð½Ð½Ñ‹Ðµ) | **ÐœÐ¾Ð´ÐµÐ»ÑŒ:** claude-sonnet-4-5

**BACKLOG:** #BUG-SM-015 (P0), #347 (M â€” session-aware orderGroups)

---

## Root Cause (VERIFIED via code reading â€” Ð½Ðµ Ð¿Ñ€ÐµÐ´Ð¿Ð¾Ð»Ð¾Ð¶ÐµÐ½Ð¸Ñ)

ÐŸÑ€Ð¾Ñ‡Ð¸Ñ‚Ð°Ð» `260415-01 StaffOrdersMobile RELEASE.jsx` ÑÑ‚Ñ€Ð¾ÐºÐ¸ 3541-3908 + `components/sessionHelpers.js`:

1. **`openSessions` query** (ÑÑ‚Ñ€Ð¾ÐºÐ¸ 3541-3552) Ð¸ÑÐ¿Ð¾Ð»ÑŒÐ·ÑƒÐµÑ‚ `queryKey: ["openSessions", partnerId]` + `staleTime: 30_000` â€” SOM Ð½Ðµ Ð·Ð½Ð°ÐµÑ‚ Ð¾ Ð½Ð¾Ð²Ð¾Ð¹ TableSession Ð´Ð¾ 30 ÑÐµÐºÑƒÐ½Ð´. [V5-C1]
2. **`orderGroups` useMemo** (ÑÑ‚Ñ€Ð¾ÐºÐ¸ 3768-3819) Ð³Ñ€ÑƒÐ¿Ð¿Ð¸Ñ€ÑƒÐµÑ‚ hall-Ð·Ð°ÐºÐ°Ð·Ñ‹ Ð¿Ð¾ `tableId` Ð¾Ð´Ð¸Ð½-Ðº-Ð¾Ð´Ð½Ð¾Ð¼Ñƒ Ñ‡ÐµÑ€ÐµÐ· `tableGroups[tableId]` â€” ÑÑ‚Ð°Ñ€Ñ‹Ðµ Ð·Ð°ÐºÑ€Ñ‹Ñ‚Ñ‹Ðµ Ð¸ Ð½Ð¾Ð²Ñ‹Ðµ Ð¾Ñ‚ÐºÑ€Ñ‹Ñ‚Ñ‹Ðµ Ð·Ð°ÐºÐ°Ð·Ñ‹ ÑÑ‚Ð¾Ð»Ð° ÑÐ»Ð¸Ð²Ð°ÑŽÑ‚ÑÑ Ð² ÐžÐ”ÐÐ£ ÐºÐ°Ñ€Ñ‚Ð¾Ñ‡ÐºÑƒ.
3. **`filteredGroups` / `tabCounts`** (3862-3908) Ð¾Ð¿Ñ€ÐµÐ´ÐµÐ»ÑÐµÑ‚ Ñ‚Ð°Ð± Ð¿Ð¾ `!!openSessionByTableId[group.id]`. Ð•ÑÐ»Ð¸ ÑÐµÑÑÐ¸Ñ Ð½Ðµ Ð¾Ð±Ð½Ð°Ñ€ÑƒÐ¶ÐµÐ½Ð° â†’ Ð³Ñ€ÑƒÐ¿Ð¿Ð° Ð¸Ð´Ñ‘Ñ‚ Ð² Â«Ð—Ð°Ð²ÐµÑ€ÑˆÑ‘Ð½Ð½Ñ‹ÐµÂ», Ð½Ð¾ ÐºÐ¾Ð³Ð´Ð° ÑÐµÑÑÐ¸Ñ Ð¿Ð¾ÑÐ²Ð¸Ñ‚ÑÑ (Ð¿Ð¾ÑÐ»Ðµ stale expire), Ð’Ð¡Ð¯ Ð¾Ð±ÑŠÐµÐ´Ð¸Ð½Ñ‘Ð½Ð½Ð°Ñ ÐºÐ°Ñ€Ñ‚Ð¾Ñ‡ÐºÐ° Ð¿ÐµÑ€ÐµÐµÐ´ÐµÑ‚ Ð² Â«ÐÐºÑ‚Ð¸Ð²Ð½Ñ‹ÐµÂ» â€” Ð²ÐºÐ»ÑŽÑ‡Ð°Ñ ÑÑ‚Ð°Ñ€Ñ‹Ðµ Ð·Ð°ÐºÑ€Ñ‹Ñ‚Ñ‹Ðµ Ð·Ð°ÐºÐ°Ð·Ñ‹.

**Sequence of the bug:**
- ÐžÑ„Ð¸Ñ†Ð¸Ð°Ð½Ñ‚ Ð·Ð°ÐºÑ€Ñ‹Ð²Ð°ÐµÑ‚ ÑÑ‚Ð¾Ð» â†’ `closeSession(sessionId, tableId)` â†’ TableSession.status = 'closed', Ð²ÑÐµ Orders = 'closed' (sessionHelpers.js:158-173).
- Ð“Ð¾ÑÑ‚ÑŒ Ð·Ð°ÐºÐ°Ð·Ñ‹Ð²Ð°ÐµÑ‚ â†’ `getOrCreateSession` (sessionHelpers.js:69-88) Ð²Ð¸Ð´Ð¸Ñ‚, Ñ‡Ñ‚Ð¾ `status: 'open'` ÑÐµÑÑÐ¸Ð¹ Ð½ÐµÑ‚ â†’ ÑÐ¾Ð·Ð´Ð°Ñ‘Ñ‚ ÐÐžÐ’Ð£Ð® TableSession.
- Guest SDK ÑÐ¾Ð·Ð´Ð°Ñ‘Ñ‚ Ð½Ð¾Ð²Ñ‹Ð¹ Order Ñ `table_session` = ID Ð½Ð¾Ð²Ð¾Ð¹ ÑÐµÑÑÐ¸Ð¸.
- SOM Ð² Ñ‚ÐµÑ‡ÐµÐ½Ð¸Ðµ 30 ÑÐµÐº Ð½Ðµ Ð¿Ð¾Ð´Ñ…Ð²Ð°Ñ‚Ñ‹Ð²Ð°ÐµÑ‚ Ð½Ð¾Ð²ÑƒÑŽ ÑÐµÑÑÐ¸ÑŽ (staleTime). `orderGroups` Ð³Ñ€ÑƒÐ¿Ð¿Ð¸Ñ€ÑƒÐµÑ‚ Ð½Ð¾Ð²Ñ‹Ð¹ Order Ð² Ñ‚Ð¾Ñ‚ Ð¶Ðµ `tableGroups[tableId]` Ñ‡Ñ‚Ð¾ Ð¸ ÑÑ‚Ð°Ñ€Ñ‹Ðµ Ð·Ð°ÐºÑ€Ñ‹Ñ‚Ñ‹Ðµ Orders. `openSessionByTableId[tableId]` = undefined â†’ Ð³Ñ€ÑƒÐ¿Ð¿Ð° Ð¸Ð´Ñ‘Ñ‚ Ð² Â«Ð—Ð°Ð²ÐµÑ€ÑˆÑ‘Ð½Ð½Ñ‹ÐµÂ».
- ÐŸÐ¾ÑÐ»Ðµ refetch (30 ÑÐµÐº+) `openSessionByTableId[tableId]` Ð¾Ð±Ð½Ð¾Ð²Ð¸Ñ‚ÑÑ â†’ Ð²ÑÑ ÐºÐ°Ñ€Ñ‚Ð¾Ñ‡ÐºÐ° (Ð½Ð¾Ð²Ñ‹Ðµ + ÑÑ‚Ð°Ñ€Ñ‹Ðµ) Ð¿ÐµÑ€ÐµÐµÐ´ÐµÑ‚ Ð² Â«ÐÐºÑ‚Ð¸Ð²Ð½Ñ‹ÐµÂ».

**Ð¦ÐµÐ»ÑŒ Ñ„Ð¸ÐºÑÐ°:** Ð¾Ñ‚Ð´ÐµÐ»Ð¸Ñ‚ÑŒ Orders Ñ‚ÐµÐºÑƒÑ‰ÐµÐ¹ Ð¾Ñ‚ÐºÑ€Ñ‹Ñ‚Ð¾Ð¹ ÑÐµÑÑÐ¸Ð¸ Ð¾Ñ‚ Orders Ð·Ð°ÐºÑ€Ñ‹Ñ‚Ñ‹Ñ… ÑÐµÑÑÐ¸Ð¹ Ð½Ð° ÑƒÑ€Ð¾Ð²Ð½Ðµ `orderGroups`, Ñ‡Ñ‚Ð¾Ð±Ñ‹ ÐºÐ°Ð¶Ð´Ð°Ñ ÑÐµÑÑÐ¸Ñ Ð¸Ð¼ÐµÐ»Ð° ÑÐ²Ð¾ÑŽ ÐºÐ°Ñ€Ñ‚Ð¾Ñ‡ÐºÑƒ Ñ ÐºÐ¾Ñ€Ñ€ÐµÐºÑ‚Ð½Ñ‹Ð¼ Ñ‚Ð°Ð±Ð¾Ð¼.

---

## UX Reference

- Ð¡ÐºÑ€Ð¸Ð½ÑˆÐ¾Ñ‚Ñ‹: `pages/StaffOrdersMobile/screenshots/current/`
- BUGS: `pages/StaffOrdersMobile/BUGS.md` Â§BUG-SM-015
- Ð›Ð¾Ð³Ð¸ÐºÐ° Ñ‚Ð°Ð±Ð¾Ð² (SOM_Progress_S274 TL-01..TL-18): Ð·Ð°ÐºÑ€Ñ‹Ñ‚Ð°Ñ ÑÐµÑÑÐ¸Ñ Ð² Â«Ð—Ð°Ð²ÐµÑ€ÑˆÑ‘Ð½Ð½Ñ‹Ñ…Â» Ð¾ÑÑ‚Ð°Ñ‘Ñ‚ÑÑ visible, Ð½Ð¾Ð²Ð°Ñ ÑÐµÑÑÐ¸Ñ ÑÐ¾Ð·Ð´Ð°Ñ‘Ñ‚ Ð¾Ñ‚Ð´ÐµÐ»ÑŒÐ½ÑƒÑŽ Ð·Ð°Ð¿Ð¸ÑÑŒ Ð² Â«ÐÐºÑ‚Ð¸Ð²Ð½Ñ‹Ñ…Â».

---

## FROZEN UX / FROZEN BEHAVIOR (ÐÐ• ÐœÐ•ÐÐ¯Ð¢Ð¬)

**Ð¡Ð¿Ð¸ÑÐ¾Ðº Ð¿Ñ€Ð°Ð²Ð¸Ð», ÐºÐ¾Ñ‚Ð¾Ñ€Ñ‹Ðµ Ð—ÐÐŸÐ Ð•Ð©Ð•ÐÐž Ð½Ð°Ñ€ÑƒÑˆÐ°Ñ‚ÑŒ Ð»ÑŽÐ±Ñ‹Ð¼ Fix:**

- `effectivePollingInterval` (polling ÐºÐ°Ð¶Ð´Ñ‹Ðµ 10-60Ñ) â€” Ð½Ðµ Ñ‚Ñ€Ð¾Ð³Ð°Ñ‚ÑŒ
- `closeSession` Ñ„ÑƒÐ½ÐºÑ†Ð¸Ñ Ð² `sessionHelpers.js` â€” ÐÐ• Ð¼ÐµÐ½ÑÑ‚ÑŒ (Ð‘2 Ñ„Ð¸ÐºÑ, Ð¿Ñ€Ð¾Ñ‚ÐµÑÑ‚Ð¸Ñ€Ð¾Ð²Ð°Ð½)
- `getOrCreateSession` Ð² `sessionHelpers.js` â€” ÐÐ• Ð¼ÐµÐ½ÑÑ‚ÑŒ (guest-side Ð»Ð¾Ð³Ð¸ÐºÐ°)
- `handleCloseTableClick` useCallback (ÑÑ‚Ñ€Ð¾ÐºÐ¸ ~2164-2177) â€” ÐÐ• Ð¼ÐµÐ½ÑÑ‚ÑŒ ÐºÐ¾Ð½Ñ‚Ñ€Ð°ÐºÑ‚ `onCloseTable(sessionId, identifier, tableId)`
- `confirmCloseTable` handler (~4183-4197) â€” ÐÐ• Ð¼ÐµÐ½ÑÑ‚ÑŒ Ñ„Ð»Ð¾Ñƒ Ð·Ð°ÐºÑ€Ñ‹Ñ‚Ð¸Ñ
- `activeOrders` status-Ñ„Ð¸Ð»ÑŒÑ‚Ñ€ (3593-3617) â€” ÐÐ• Ñ‚Ñ€Ð¾Ð³Ð°Ñ‚ÑŒ (closed/cancelled exclusion)
- `sortedStages`, `stagesMap`, `getStatusConfig` â€” ÐÐ• Ð¼ÐµÐ½ÑÑ‚ÑŒ
- `favorites` / `isFavorite` / `toggleFavorite` â€” Ð¿Ñ€Ð¸Ð²ÑÐ·ÐºÐ° Ðº `tableId`, ÐÐ• Ð¼ÐµÐ½ÑÑ‚ÑŒ ÐºÐ¾Ð½Ñ‚Ñ€Ð°ÐºÑ‚ (Ñ„Ð°Ð²Ð¾Ñ€Ð¸Ñ‚Ñ‹ Ð´Ð¾Ð»Ð¶Ð½Ñ‹ Ð²Ñ‹Ð¶Ð¸Ð²Ð°Ñ‚ÑŒ ÑÐ¼ÐµÐ½Ñƒ ÑÐµÑÑÐ¸Ð¸ â€” ÑÑ‚Ð¾ Ð¶ÐµÐ»Ð°ÐµÐ¼Ð¾Ðµ Ð¿Ð¾Ð²ÐµÐ´ÐµÐ½Ð¸Ðµ)
- `["servedOrders", group.id]` queryKey â€” Ð¾ÑÑ‚Ð°Ð²Ð¸Ñ‚ÑŒ Ð½Ð° `group.id` (ÑÑ‚Ð¾ tableId; Ð¿ÐµÑ€ÐµÐ½Ð¾Ñ Ð·Ð°ÐºÑ€Ñ‹Ñ‚Ñ‹Ñ… served-Ð·Ð°ÐºÐ°Ð·Ð¾Ð² Ð² Ð½Ð¾Ð²ÑƒÑŽ ÐºÐ°Ñ€Ñ‚Ð¾Ñ‡ÐºÑƒ Ð½Ðµ Ð½ÑƒÐ¶ÐµÐ½)
- OrderGroupCard Ñ€ÐµÐ½Ð´ÐµÑ€ UI â€” ÐÐ• Ð¼ÐµÐ½ÑÑ‚ÑŒ, Ñ‚Ð¾Ð»ÑŒÐºÐ¾ Ð¿Ñ€Ð¾Ð¿ÑÑ‹
- Pickup/Delivery groups (`group.type !== 'table'`) â€” ÐÐ• Ñ‚Ñ€Ð¾Ð³Ð°Ñ‚ÑŒ, Ð¿Ñ€Ð¾Ð´Ð¾Ð»Ð¶Ð°ÑŽÑ‚ Ð¸ÑÐ¿Ð¾Ð»ÑŒÐ·Ð¾Ð²Ð°Ñ‚ÑŒ `o.id` ÐºÐ°Ðº Ð³Ñ€ÑƒÐ¿Ð¿Ð°
- Tab Ð¡Ñ‚Ð¾Ð» (Ð²Ð½ÑƒÑ‚Ñ€Ð¸ ÐºÐ°Ñ€Ñ‚Ð¾Ñ‡ÐºÐ¸ ÑÑ‚Ð¾Ð»Ð°) â€” OUT OF SCOPE
- i18n ÐºÐ»ÑŽÑ‡Ð¸ â€” ÐÐ• Ð´Ð¾Ð±Ð°Ð²Ð»ÑÑ‚ÑŒ
- `buildBannerInfo` (~ÑÑ‚Ñ€Ð¾ÐºÐ¸ 4079-4090) â€” ÐÐ• Ð¼ÐµÐ½ÑÑ‚ÑŒ (Ð¸ÑÑ‚Ð¾Ñ‡Ð½Ð¸Ðº `banner.groupId` = tableId, Ð¿Ð¾Ñ‚Ñ€ÐµÐ±Ð»ÑÐµÑ‚ÑÑ `onNavigate`) [V5-L6]
- `onNavigate(banner.groupId)` call-site (~ÑÑ‚Ñ€Ð¾ÐºÐ° 2825) â€” ÐÐ• Ð¼ÐµÐ½ÑÑ‚ÑŒ; banner dispatcher Ð¿ÐµÑ€ÐµÐ´Ð°Ñ‘Ñ‚ Ñ‡Ð¸ÑÑ‚Ñ‹Ð¹ tableId [V5-L6]

**SCOPE LOCK:**
- âœ… ÐœÐ¾Ð¶Ð½Ð¾ Ð¼ÐµÐ½ÑÑ‚ÑŒ: `orderGroups` useMemo, `filteredGroups` useMemo, `tabCounts` useMemo, `openSessions` useQuery staleTime (Ñ‚Ð¾Ð»ÑŒÐºÐ¾ Ð·Ð½Ð°Ñ‡ÐµÐ½Ð¸Ðµ), `data-group-id` Ð°Ñ‚Ñ€Ð¸Ð±ÑƒÑ‚ (Ñ‚Ð¾Ð»ÑŒÐºÐ¾ live JSX), `key={}` Ð´Ð»Ñ OrderGroupCard, `handleToggleExpand` Ð²Ñ‹Ð·Ð¾Ð², `handleBannerNavigate`, Ð¾Ð´Ð¸Ð½ Ð½Ð¾Ð²Ñ‹Ð¹ useEffect (Fix C)
- â›” Ð—Ð°Ð¿Ñ€ÐµÑ‰ÐµÐ½Ð¾ Ð¼ÐµÐ½ÑÑ‚ÑŒ: sessionHelpers.js, useTableSession.jsx, OrderGroupCard Ð²Ð½ÑƒÑ‚Ñ€ÐµÐ½Ð½Ð¾ÑÑ‚Ð¸, Order/TableSession entities (B44), `queryKey: ["openSessions", partnerId]` Ð¼Ð°ÑÑÐ¸Ð² (Ñ‚Ð¾Ð»ÑŒÐºÐ¾ `staleTime` Ð²Ð½ÑƒÑ‚Ñ€Ð¸ Ð±Ð»Ð¾ÐºÐ°), Ð»ÑŽÐ±Ñ‹Ðµ Ð´Ñ€ÑƒÐ³Ð¸Ðµ useMemo/useQuery/useCallback Ð·Ð° Ð¿Ñ€ÐµÐ´ÐµÐ»Ð°Ð¼Ð¸ Ð¿ÐµÑ€ÐµÑ‡Ð¸ÑÐ»ÐµÐ½Ð½Ñ‹Ñ… Ð²Ñ‹ÑˆÐµ, i18n ÑÐ»Ð¾Ð²Ð°Ñ€Ð¸, Ð´Ñ€ÑƒÐ³Ð¸Ðµ ÑÑ‚Ñ€Ð°Ð½Ð¸Ñ†Ñ‹, `buildBannerInfo`, `onNavigate(banner.groupId)` call-site

---

## Preparation (Ð²Ñ‹Ð¿Ð¾Ð»Ð½Ð¸Ñ‚ÑŒ ÐŸÐ•Ð Ð•Ð” Pre-flight) â€” [v3: C1, v4: L6 + M6, v5: L2 + M3]

Ð Ð°Ð±Ð¾Ñ‡Ð°Ñ ÐºÐ¾Ð¿Ð¸Ñ (working copy) Ð¼Ð¾Ð¶ÐµÑ‚ Ð¾Ñ‚ÑÑ‚Ð°Ð²Ð°Ñ‚ÑŒ Ð¾Ñ‚ RELEASE-Ñ„Ð°Ð¹Ð»Ð° (HEAD Ð½Ð° Ð¼Ð¾Ð¼ÐµÐ½Ñ‚ Ð½Ð°Ð¿Ð¸ÑÐ°Ð½Ð¸Ñ ÐŸÐ¡Ð¡Ðš = 4617 ÑÑ‚Ñ€Ð¾Ðº, worktree Ð¼Ð¾Ð¶ÐµÑ‚ ÑÐ¾Ð´ÐµÑ€Ð¶Ð°Ñ‚ÑŒ Ð±Ð¾Ð»ÐµÐµ ÑÑ‚Ð°Ñ€ÑƒÑŽ Ð²ÐµÑ€ÑÐ¸ÑŽ). Ð¡Ð¸Ð½Ñ…Ñ€Ð¾Ð½Ð¸Ð·Ð¸Ñ€Ð¾Ð²Ð°Ñ‚ÑŒ Ð¿ÐµÑ€ÐµÐ´ Ð»ÑŽÐ±Ñ‹Ð¼Ð¸ Ð¿Ñ€Ð°Ð²ÐºÐ°Ð¼Ð¸:

```bash
# 0.0 [v5-L2] Ð—Ð°Ñ‰Ð¸Ñ‚Ð° Ð¾Ñ‚ Ð¿ÐµÑ€ÐµÐ·Ð°Ð¿Ð¸ÑÐ¸ Ð½ÐµÑÐ¾Ñ…Ñ€Ð°Ð½Ñ‘Ð½Ð½Ñ‹Ñ… Ð¸Ð·Ð¼ÐµÐ½ÐµÐ½Ð¸Ð¹: gate Ñ‡ÐµÑ€ÐµÐ· git
#     Ð•ÑÐ»Ð¸ working copy Ð¸Ð¼ÐµÐµÑ‚ uncommitted diff vs HEAD â€” STOP, ÑÐ¿Ñ€Ð¾ÑÐ¸Ñ‚ÑŒ Arman.
if ! git diff --quiet -- pages/StaffOrdersMobile/staffordersmobile.jsx; then
  echo "STOP: working copy has uncommitted changes vs HEAD."
  echo "       Backup Ð±ÑƒÐ´ÐµÑ‚ ÑÐ¾Ð·Ð´Ð°Ð½ Ð² .bak, Ð½Ð¾ overwrite Ð¾Ñ‚ÐºÐ»Ð°Ð´Ñ‹Ð²Ð°ÐµÑ‚ÑÑ Ð´Ð¾ Ð¿Ð¾Ð´Ñ‚Ð²ÐµÑ€Ð¶Ð´ÐµÐ½Ð¸Ñ Arman."
  echo "       Ð’Ñ‹Ð¿Ð¾Ð»Ð½Ð¸: git status + git diff ... Ð¸ Ð¿Ð¾Ð´Ñ‚Ð²ÐµÑ€Ð´Ð¸ safe to overwrite."
  exit 1
fi

# 0.1 Backup working copy (Ð²ÑÐµÐ³Ð´Ð°, Ð´Ð°Ð¶Ðµ ÐµÑÐ»Ð¸ diff Ð¿ÑƒÑÑ‚Ð¾Ð¹ â€” ÑÑ‚Ñ€Ð°Ñ…Ð¾Ð²ÐºÐ°)
if [ -f "pages/StaffOrdersMobile/staffordersmobile.jsx" ]; then
  cp "pages/StaffOrdersMobile/staffordersmobile.jsx" \
     "pages/StaffOrdersMobile/staffordersmobile.jsx.bak" 2>/dev/null || true
fi

# 1. Ð¡ÐºÐ¾Ð¿Ð¸Ñ€Ð¾Ð²Ð°Ñ‚ÑŒ RELEASE â†’ Ñ€Ð°Ð±Ð¾Ñ‡ÑƒÑŽ ÐºÐ¾Ð¿Ð¸ÑŽ
cp "pages/StaffOrdersMobile/260415-01 StaffOrdersMobile RELEASE.jsx" \
   "pages/StaffOrdersMobile/staffordersmobile.jsx"
# ÐžÐ¶Ð¸Ð´Ð°Ð½Ð¸Ðµ: ÐºÐ¾Ð¼Ð°Ð½Ð´Ð° Ð·Ð°Ð²ÐµÑ€ÑˆÐ°ÐµÑ‚ÑÑ Ð±ÐµÐ· Ð¾ÑˆÐ¸Ð±ÐºÐ¸, Ñ€Ð°Ð±Ð¾Ñ‡Ð°Ñ ÐºÐ¾Ð¿Ð¸Ñ Ñ‚ÐµÐ¿ÐµÑ€ÑŒ = 4617 ÑÑ‚Ñ€Ð¾Ðº

# 2. Pre-check: Ð¾Ð¿Ñ€ÐµÐ´ÐµÐ»Ð¸Ñ‚ÑŒ origin `getLinkId` â€” ÑÑ‚Ð¾ Ð²Ð»Ð¸ÑÐµÑ‚ Ð½Ð° Fix C deps array
grep -n "^import.*getLinkId\|^const getLinkId\|^function getLinkId\|from.*getLinkId" \
     "pages/StaffOrdersMobile/staffordersmobile.jsx" | head -3
# Ð’Ð°Ñ€Ð¸Ð°Ð½Ñ‚Ñ‹:
#   - Import Ð¾Ñ‚ components/... Ð¸Ð»Ð¸ @/... â†’ `getLinkId` Ñ‡Ð¸ÑÑ‚Ð°Ñ, ÐÐ• Ð²ÐºÐ»ÑŽÑ‡Ð°Ñ‚ÑŒ Ð² Fix C useEffect deps.
#   - `const getLinkId = ...` Ð²Ð½ÑƒÑ‚Ñ€Ð¸ ÐºÐ¾Ð¼Ð¿Ð¾Ð½ÐµÐ½Ñ‚Ð° â†’ Ð²ÐºÐ»ÑŽÑ‡Ð¸Ñ‚ÑŒ Ð² deps Ð˜Ð›Ð˜ Ð¾Ð±ÐµÑ€Ð½ÑƒÑ‚ÑŒ useCallback.
#   - ÐÐµ Ð½Ð°Ð¹Ð´ÐµÐ½Ð¾ â†’ `getLinkId` Ð¾Ð±ÑŠÑÐ²Ð»ÐµÐ½ Ð³Ð´Ðµ-Ñ‚Ð¾ ÐµÑ‰Ñ‘; Ð¸ÑÐ¿Ð¾Ð»ÑŒÐ·Ð¾Ð²Ð°Ñ‚ÑŒ `grep -rn "getLinkId" menuapp-code-review/` Ñ‡Ñ‚Ð¾Ð±Ñ‹ Ð½Ð°Ð¹Ñ‚Ð¸ origin Ð¿ÐµÑ€ÐµÐ´ Fix C.
# Ð—Ð°Ñ„Ð¸ÐºÑÐ¸Ñ€Ð¾Ð²Ð°Ñ‚ÑŒ Ñ€ÐµÐ·ÑƒÐ»ÑŒÑ‚Ð°Ñ‚ mental-flag â†’ Ð¸ÑÐ¿Ð¾Ð»ÑŒÐ·ÑƒÐµÑ‚ÑÑ Ð¿Ñ€Ð¸ Ð¿Ñ€Ð¸Ð¼ÐµÐ½ÐµÐ½Ð¸Ð¸ Fix C deps.

# 3. [v5-M3] Pre-check: `queryClient` scope Ð´Ð»Ñ Fix C.
#    Fix C Ð¸ÑÐ¿Ð¾Ð»ÑŒÐ·ÑƒÐµÑ‚ `queryClient.invalidateQueries(...)` â€” Ð¿ÐµÑ€ÐµÐ¼ÐµÐ½Ð½Ð°Ñ Ð´Ð¾Ð»Ð¶Ð½Ð° Ð±Ñ‹Ñ‚ÑŒ Ð² scope
#    Ð²Ð½ÑƒÑ‚Ñ€Ð¸ ÐºÐ¾Ð¼Ð¿Ð¾Ð½ÐµÐ½Ñ‚Ð° StaffOrdersMobile Ñ‡ÐµÑ€ÐµÐ· `const queryClient = useQueryClient()`.
grep -n "useQueryClient\|const queryClient" \
     "pages/StaffOrdersMobile/staffordersmobile.jsx" | head -5
# ÐžÐ¶Ð¸Ð´Ð°Ð½Ð¸Ðµ: ÐºÐ°Ðº Ð¼Ð¸Ð½Ð¸Ð¼ÑƒÐ¼ 2 hits:
#   - `import { ..., useQueryClient } from '@tanstack/react-query'` (Ð¸Ð»Ð¸ similar path)
#   - `const queryClient = useQueryClient();` Ð²Ð½ÑƒÑ‚Ñ€Ð¸ ÐºÐ¾Ð¼Ð¿Ð¾Ð½ÐµÐ½Ñ‚Ð°
# Ð•ÑÐ»Ð¸ Ð¿ÐµÑ€ÐµÐ¼ÐµÐ½Ð½Ð°Ñ Ð½Ð°Ð·Ð²Ð°Ð½Ð° Ð¸Ð½Ð°Ñ‡Ðµ (Ð½Ð°Ð¿Ñ€Ð¸Ð¼ÐµÑ€ `qc`, `qClient`) â†’ Ð¿ÐµÑ€ÐµÐ¸Ð¼ÐµÐ½Ð¾Ð²Ð°Ñ‚ÑŒ Ð² Fix C ÐºÐ¾Ð´ Ð½Ð¸Ð¶Ðµ.
# Ð•ÑÐ»Ð¸ useQueryClient Ð½Ðµ Ð¸Ð¼Ð¿Ð¾Ñ€Ñ‚Ð¸Ñ€Ð¾Ð²Ð°Ð½ â†’ STOP, ÑÐ¿Ñ€Ð¾ÑÐ¸Ñ‚ÑŒ Arman (Ð°Ñ€Ñ…Ð¸Ñ‚ÐµÐºÑ‚ÑƒÑ€Ð½Ð¾Ðµ Ð¸Ð·Ð¼ÐµÐ½ÐµÐ½Ð¸Ðµ scope).

# 4. [v5-L5] Pre-check: react import line â€” Ð´Ð»Ñ Fix C (useRef)
grep -n "from 'react'" "pages/StaffOrdersMobile/staffordersmobile.jsx" | head -3
# ÐžÐ¶Ð¸Ð´Ð°Ð½Ð¸Ðµ: 1 hit, Ñ„Ð¾Ñ€Ð¼Ð°Ñ‚ Ð»Ð¸Ð±Ð¾ Ð¾Ð´Ð½Ð¾linear `import { useState, useEffect, ... } from 'react';`
# Ð»Ð¸Ð±Ð¾ multi-line. Ð•ÑÐ»Ð¸ multi-line (Ñ‡ÐµÑ€ÐµÐ· Ð·Ð°Ð¿ÑÑ‚ÑƒÑŽ Ð½Ð° Ð½ÐµÑÐºÐ¾Ð»ÑŒÐºÐ¾ ÑÑ‚Ñ€Ð¾Ðº) â†’ Ð·Ð°Ñ„Ð¸ÐºÑÐ¸Ñ€Ð¾Ð²Ð°Ñ‚ÑŒ Ñ‚Ð¾Ñ‡Ð½ÑƒÑŽ Ñ„Ð¾Ñ€Ð¼Ñƒ
# Ð´Ð»Ñ Edit Ð² Fix C (useRef Ð¼Ð¾Ð¶ÐµÑ‚ ÑƒÐ¶Ðµ Ð±Ñ‹Ñ‚ÑŒ Ð² ÑÐ¿Ð¸ÑÐºÐµ Ð¸Ð»Ð¸ Ð½ÑƒÐ¶Ð½Ð¾ Ð´Ð¾Ð±Ð°Ð²Ð¸Ñ‚ÑŒ).
grep -c "useRef" "pages/StaffOrdersMobile/staffordersmobile.jsx"
# ÐžÐ¶Ð¸Ð´Ð°Ð½Ð¸Ðµ: â‰¥1 (useRef ÑƒÐ¶Ðµ Ð¸Ð¼Ð¿Ð¾Ñ€Ñ‚Ð¸Ñ€Ð¾Ð²Ð°Ð½) Ð¸Ð»Ð¸ 0 (Ð½ÑƒÐ¶Ð½Ð¾ Ð´Ð¾Ð±Ð°Ð²Ð¸Ñ‚ÑŒ Ð² react import).
```

âš ï¸ Ð•ÑÐ»Ð¸ RELEASE-Ñ„Ð°Ð¹Ð» Ð½Ðµ Ð½Ð°Ð¹Ð´ÐµÐ½ â€” STOP, ÑÐ¾Ð¾Ð±Ñ‰Ð¸Ñ‚ÑŒ Arman (deploy Ð½Ðµ Ð·Ð°Ð²ÐµÑ€ÑˆÑ‘Ð½ Ð¸Ð»Ð¸ Ñ„Ð°Ð¹Ð» Ð² Ð´Ñ€ÑƒÐ³Ð¾Ð¼ Ð¼ÐµÑÑ‚Ðµ).

---

## Pre-flight (Ð¾Ð±ÑÐ·Ð°Ñ‚ÐµÐ»ÑŒÐ½Ñ‹Ðµ ÐºÐ¾Ð¼Ð°Ð½Ð´Ñ‹ Ð”Ðž Ð¿Ñ€Ð°Ð²ÐºÐ¸)

```bash
# 1. ÐŸÐ¾Ð´Ñ‚Ð²ÐµÑ€Ð´Ð¸Ñ‚ÑŒ Ñ€Ð°Ð·Ð¼ÐµÑ€ Ñ„Ð°Ð¹Ð»Ð°
wc -l "pages/StaffOrdersMobile/staffordersmobile.jsx"
# ÐžÐ¶Ð¸Ð´Ð°Ð½Ð¸Ðµ: 4617 +70/-35 (Ð´Ð¸Ð°Ð¿Ð°Ð·Ð¾Ð½ 4582-4687). [v5-M5: Ð±Ñ‹Ð»Ð¾ Â«Â±35Â» Ñ‡Ñ‚Ð¾ Ð¼Ð°Ñ‚ÐµÐ¼Ð°Ñ‚Ð¸Ñ‡ÐµÑÐºÐ¸ 4582-4652, Ñ‚ÐµÐ¿ÐµÑ€ÑŒ Ñ„Ð¾Ñ€Ð¼ÑƒÐ»Ð° ÑÐ²Ð½Ð°Ñ]

# 2. ÐŸÐ¾Ð´Ñ‚Ð²ÐµÑ€Ð´Ð¸Ñ‚ÑŒ Ñ‡Ñ‚Ð¾ RELEASE-Ñ„Ð°Ð¹Ð» ÑÐ¾Ð²Ð¿Ð°Ð´Ð°ÐµÑ‚ Ñ Ñ€Ð°Ð±Ð¾Ñ‡ÐµÐ¹ ÐºÐ¾Ð¿Ð¸ÐµÐ¹
diff -q "pages/StaffOrdersMobile/staffordersmobile.jsx" \
        "pages/StaffOrdersMobile/260415-01 StaffOrdersMobile RELEASE.jsx"
# ÐžÐ¶Ð¸Ð´Ð°Ð½Ð¸Ðµ: Ð¿ÑƒÑÑ‚Ð¾. Ð•ÑÐ»Ð¸ diff ÐÐ•Ð¢Ð Ð˜Ð’Ð˜ÐÐ›Ð¬ÐÐ«Ð™ (Ð½Ðµ trailing newline) â†’ STOP, ÑÐ¿Ñ€Ð¾ÑÐ¸Ñ‚ÑŒ Arman.

# 3. ÐŸÐ¾Ð´Ñ‚Ð²ÐµÑ€Ð´Ð¸Ñ‚ÑŒ Ð¾Ð¶Ð¸Ð´Ð°ÐµÐ¼Ñ‹Ðµ ÑÑ‚Ñ€Ð¾ÐºÐ¸ Ð´Ð»Ñ grep-ÑÐºÐ¾Ñ€ÐµÐ¹
grep -n "staleTime: 30_000" "pages/StaffOrdersMobile/staffordersmobile.jsx"
# ÐžÐ¶Ð¸Ð´Ð°Ð½Ð¸Ðµ: 1 hit, ÑÑ‚Ñ€Ð¾ÐºÐ° ~3548 Ð²Ð½ÑƒÑ‚Ñ€Ð¸ openSessions useQuery.

# 3a. [v5-C1] ÐŸÐ¾Ð´Ñ‚Ð²ÐµÑ€Ð´Ð¸Ñ‚ÑŒ real queryKey shape Ð´Ð»Ñ openSessions
grep -n 'queryKey: \["openSessions"' "pages/StaffOrdersMobile/staffordersmobile.jsx"
# ÐžÐ¶Ð¸Ð´Ð°Ð½Ð¸Ðµ: 1 hit, ÑÑ‚Ñ€Ð¾ÐºÐ° ~3542, Ñ‚ÐµÐºÑÑ‚ `queryKey: ["openSessions", partnerId],`.
# ÐÐ• Ð¿ÑƒÑ‚Ð°Ñ‚ÑŒ Ñ `invalidateQueries({ queryKey: ["openSessions"] })` â€” Ñ‚Ð°Ð¼ prefix invalidate legit.

grep -n "const orderGroups = useMemo" "pages/StaffOrdersMobile/staffordersmobile.jsx"
# ÐžÐ¶Ð¸Ð´Ð°Ð½Ð¸Ðµ: 1 hit, ÑÑ‚Ñ€Ð¾ÐºÐ° ~3768.

grep -n "const filteredGroups = useMemo" "pages/StaffOrdersMobile/staffordersmobile.jsx"
# ÐžÐ¶Ð¸Ð´Ð°Ð½Ð¸Ðµ: 1 hit, ÑÑ‚Ñ€Ð¾ÐºÐ° ~3862.

grep -n "const tabCounts = useMemo" "pages/StaffOrdersMobile/staffordersmobile.jsx"
# ÐžÐ¶Ð¸Ð´Ð°Ð½Ð¸Ðµ: 1 hit, ÑÑ‚Ñ€Ð¾ÐºÐ° ~3886.

# 4. [v5-M2] Pre-pin counts Ð´Ð»Ñ Ð²ÑÐµÑ… 4 Fix B.4 Edit anchors
grep -n "key={group.id}" "pages/StaffOrdersMobile/staffordersmobile.jsx"
# ÐžÐ¶Ð¸Ð´Ð°Ð½Ð¸Ðµ: â‰¥1 hit Ð² v2SortedGroups.map (~4458). ÐœÐ¾Ð¶ÐµÑ‚ Ð±Ñ‹Ñ‚ÑŒ >1 â€” Ñ‚Ð¾Ð³Ð´Ð° Ð¿Ð¸Ð½Ñ‹ Ð¿Ð¾ ÐºÐ¾Ð½Ñ‚ÐµÐºÑÑ‚Ñƒ (ÑÐ¼. B.4 Ð½Ð¸Ð¶Ðµ).

grep -n "expandedGroupId === group.id" "pages/StaffOrdersMobile/staffordersmobile.jsx"
# ÐžÐ¶Ð¸Ð´Ð°Ð½Ð¸Ðµ: 1 hit, ÑÑ‚Ñ€Ð¾ÐºÐ° ~4461 (OrderGroupCard prop).

grep -n "onToggleExpand={() => handleToggleExpand(group.id)}" "pages/StaffOrdersMobile/staffordersmobile.jsx"
# ÐžÐ¶Ð¸Ð´Ð°Ð½Ð¸Ðµ: 1 hit, ÑÑ‚Ñ€Ð¾ÐºÐ° ~4462.

grep -n "isHighlighted={highlightGroupId === group.id}" "pages/StaffOrdersMobile/staffordersmobile.jsx"
# ÐžÐ¶Ð¸Ð´Ð°Ð½Ð¸Ðµ: 1 hit (Ð´Ð¾Ð»Ð¶ÐµÐ½ Ð±Ñ‹Ñ‚ÑŒ Ð²Ð½ÑƒÑ‚Ñ€Ð¸ v2SortedGroups.map).
# Ð•ÑÐ»Ð¸ hits != 1 â€” STOP, Ð¿Ñ€Ð¾Ð²ÐµÑ€Ð¸Ñ‚ÑŒ pickup/delivery map (Ð½Ðµ Ð¼ÐµÐ½ÑÑ‚ÑŒ ÐµÐ³Ð¾ prop highlightGroupId).

# 5. [v5-M1] Pre-pin Ð´Ð»Ñ data-group-id: Ñ€Ð°Ð·Ð»Ð¸Ñ‡Ð°Ñ‚ÑŒ live JSX vs block-comment
grep -n "data-group-id={group.id}" "pages/StaffOrdersMobile/staffordersmobile.jsx"
# ÐžÐ¶Ð¸Ð´Ð°Ð½Ð¸Ðµ: Ñ€Ð¾Ð²Ð½Ð¾ 3 hits (~565, ~1173, ~2292).
# âš ï¸ [v5-M1] Ð˜Ð— ÐÐ˜Ð¥: Ñ‚Ð¾Ð»ÑŒÐºÐ¾ ~2292 = live JSX Ð²Ð½ÑƒÑ‚Ñ€Ð¸ Ñ€ÐµÐ°Ð»ÑŒÐ½Ð¾Ð³Ð¾ OrderGroupCard Ñ€ÐµÐ½Ð´ÐµÑ€Ð°.
#    ~565 Ð¸ ~1173 Ð½Ð°Ñ…Ð¾Ð´ÑÑ‚ÑÑ Ð²Ð½ÑƒÑ‚Ñ€Ð¸ block-comment (legacy snapshot Ð¸Ð»Ð¸ docstring).
# Ð’Ð¸Ð·ÑƒÐ°Ð»ÑŒÐ½Ð°Ñ Ð¿Ñ€Ð¾Ð²ÐµÑ€ÐºÐ°: sed -n '560,570p' Ð¸ sed -n '1168,1178p' â†’ Ð´Ð¾Ð»Ð¶Ð½Ñ‹ ÑÐ¾Ð´ÐµÑ€Ð¶Ð°Ñ‚ÑŒ `/*` Ð¸Ð»Ð¸ `*/` Ð²Ð¾ÐºÑ€ÑƒÐ³.
sed -n '560,575p' "pages/StaffOrdersMobile/staffordersmobile.jsx" | head -20
sed -n '1168,1180p' "pages/StaffOrdersMobile/staffordersmobile.jsx" | head -15

# 6. [v5-C3] handleBannerNavigate â€” CALL-CHAIN CHECK (Ð½Ðµ hit-count gate!)
grep -n "handleBannerNavigate" "pages/StaffOrdersMobile/staffordersmobile.jsx"
# ÐžÐ¶Ð¸Ð´Ð°Ð½Ð¸Ðµ: Ð ÐžÐ’ÐÐž 2 direct hits:
#   - ÑÑ‚Ñ€Ð¾ÐºÐ° ~4142: `const handleBannerNavigate = useCallback(...)`  (Ð¾Ð±ÑŠÑÐ²Ð»ÐµÐ½Ð¸Ðµ)
#   - ÑÑ‚Ñ€Ð¾ÐºÐ° ~4610: `onNavigate={handleBannerNavigate}`              (prop pass Ð² banner ÐºÐ¾Ð¼Ð¿Ð¾Ð½ÐµÐ½Ñ‚)
# Ð•ÑÐ»Ð¸ hits != 2 â€” STOP, Ð¿Ñ€Ð¾Ð²ÐµÑ€Ð¸Ñ‚ÑŒ ÑÑ‚Ñ€ÑƒÐºÑ‚ÑƒÑ€Ñƒ Ð²Ñ€ÑƒÑ‡Ð½ÑƒÑŽ.

grep -n "onNavigate(banner.groupId)" "pages/StaffOrdersMobile/staffordersmobile.jsx"
# ÐžÐ¶Ð¸Ð´Ð°Ð½Ð¸Ðµ: 1 hit, ÑÑ‚Ñ€Ð¾ÐºÐ° ~2825 (indirect call Ð¸Ð· banner-ÐºÐ¾Ð¼Ð¿Ð¾Ð½ÐµÐ½Ñ‚Ð°).
# banner.groupId = tableId (ÑÐ¼. buildBannerInfo ~4079-4090, Ð²Ð¾Ð·Ð²Ñ€Ð°Ñ‰Ð°ÐµÑ‚ `groupId: table.id`).

grep -n "buildBannerInfo\|banner\.groupId" "pages/StaffOrdersMobile/staffordersmobile.jsx" | head -10
# ÐžÐ¶Ð¸Ð´Ð°Ð½Ð¸Ðµ: â‰¥3 hits â€” Ð¾Ð±ÑŠÑÐ²Ð»ÐµÐ½Ð¸Ðµ buildBannerInfo ~4079-4090 + Ð¸ÑÐ¿Ð¾Ð»ÑŒÐ·Ð¾Ð²Ð°Ð½Ð¸Ðµ banner.groupId Ð² dispatcher.
# Ð­Ñ‚Ð¾ Ð¿Ð¾Ð´Ñ‚Ð²ÐµÑ€Ð¶Ð´Ð°ÐµÑ‚: handleBannerNavigate Ð’Ð¡Ð•Ð“Ð”Ð Ð¿Ð¾Ð»ÑƒÑ‡Ð°ÐµÑ‚ tableId (Ð½Ðµ compositeKey), Ð¸ Fix B.6
# Ð”ÐžÐ›Ð–Ð•Ð Ñ€ÐµÐ·Ð¾Ð»Ð²Ð¸Ñ‚ÑŒ tableId â†’ compositeKey (defensive Ð²ÐµÑ€ÑÐ¸Ñ ÑÐ¿Ñ€Ð°Ð²Ð»ÑÐµÑ‚ÑÑ).
```

Ð•ÑÐ»Ð¸ Ð»ÑŽÐ±Ð¾Ð¹ grep Ð´Ð°Ð» Ð´Ñ€ÑƒÐ³Ð¾Ðµ ÐºÐ¾Ð»Ð¸Ñ‡ÐµÑÑ‚Ð²Ð¾ â€” STOP Ð¸ ÑÐ²ÐµÑ€ÑÑ‚ÑŒÑÑ Ñ Arman. ÐÐ• Ð¿Ñ€Ð¾Ð´Ð¾Ð»Ð¶Ð°Ñ‚ÑŒ Ñ€Ð°Ð±Ð¾Ñ‚Ñƒ Ð¿Ð¾ Ð½ÐµÐ²ÐµÑ€Ð½Ñ‹Ð¼ ÑÐºÐ¾Ñ€ÑÐ¼.

**[v4-M9] Semantic anchor rule:** grep count â€” Ð½ÐµÐ¾Ð±Ñ…Ð¾Ð´Ð¸Ð¼Ð¾Ðµ ÑƒÑÐ»Ð¾Ð²Ð¸Ðµ, Ð½Ð¾ ÐÐ• Ð´Ð¾ÑÑ‚Ð°Ñ‚Ð¾Ñ‡Ð½Ð¾Ðµ. ÐŸÐµÑ€ÐµÐ´ ÐºÐ°Ð¶Ð´Ð¾Ð¹ Ð·Ð°Ð¼ÐµÐ½Ð¾Ð¹ ÑƒÐ±ÐµÐ´Ð¸Ñ‚ÑŒÑÑ, Ñ‡Ñ‚Ð¾ Ð½Ð°Ð¹Ð´ÐµÐ½Ð½Ð°Ñ ÑÑ‚Ñ€Ð¾ÐºÐ° Ð¿Ñ€Ð¸Ð½Ð°Ð´Ð»ÐµÐ¶Ð¸Ñ‚ Ð¾Ð¶Ð¸Ð´Ð°ÐµÐ¼Ð¾Ð¹ Ñ„ÑƒÐ½ÐºÑ†Ð¸Ð¸ (Ñ‡Ð¸Ñ‚Ð°Ñ‚ÑŒ 3-5 ÑÑ‚Ñ€Ð¾Ðº Ð²Ð¾ÐºÑ€ÑƒÐ³ match: `sed -n '${LINE-3},${LINE+3}p'`). Ð•ÑÐ»Ð¸ ÐºÐ¾Ð½Ñ‚ÐµÐºÑÑ‚ Ð½Ðµ ÑÐ¾Ð²Ð¿Ð°Ð´Ð°ÐµÑ‚ â€” STOP.

---

## Fix Priority & Dependencies

**ÐŸÐ¾Ñ€ÑÐ´Ð¾Ðº Ð¿Ñ€Ð¸Ð¼ÐµÐ½ÐµÐ½Ð¸Ñ:**
1. Fix A Ð¿ÐµÑ€Ð²Ñ‹Ð¼ (Ð¾Ð´Ð½Ð° ÑÑ‚Ñ€Ð¾ÐºÐ°, Ð½Ðµ Ð»Ð¾Ð¼Ð°ÐµÑ‚ Ð½Ð¸Ñ‡ÐµÐ³Ð¾).
2. Fix B Ð²Ñ‚Ð¾Ñ€Ñ‹Ð¼ (Ð¾ÑÐ½Ð¾Ð²Ð½Ð¾Ð¹ UX-Ñ„Ð¸ÐºÑ, Ñ‚Ñ€ÐµÐ±ÑƒÐµÑ‚ ÐºÐ¾Ð¾Ñ€Ð´Ð¸Ð½Ð¸Ñ€Ð¾Ð²Ð°Ð½Ð½Ñ‹Ñ… Ð¿Ñ€Ð°Ð²Ð¾Ðº 5 Ð¼ÐµÑÑ‚).
3. Fix C Ð¿Ð¾ÑÐ»ÐµÐ´Ð½Ð¸Ð¼ (Ð·Ð°Ð²Ð¸ÑÐ¸Ñ‚ Ð¾Ñ‚ Ñ‚Ð¸Ð¿Ð° group Ð¸Ð· Fix B â€” `group.sessionId`).

âš ï¸ **ORDER:** Fix B MUST be applied before Fix C (Fix C Ñ‡Ð¸Ñ‚Ð°ÐµÑ‚ `group.sessionId` field, ÐºÐ¾Ñ‚Ð¾Ñ€Ñ‹Ð¹ ÑÐ¾Ð·Ð´Ð°Ñ‘Ñ‚ÑÑ Ð² Fix B).

Ð•ÑÐ»Ð¸ Ð¾Ð´Ð¸Ð½ Ð¸Ð· Fix Ð¿Ñ€Ð¾Ð²Ð°Ð»Ð¸Ð²Ð°ÐµÑ‚ÑÑ (syntax error / conflict) â†’ Ð¾Ñ‚ÐºÐ°Ñ‚Ð¸Ñ‚ÑŒ Ð¢ÐžÐ›Ð¬ÐšÐž ÑÑ‚Ð¾Ñ‚ Fix, Ð¾ÑÑ‚Ð°Ð»ÑŒÐ½Ñ‹Ðµ ÑÐ¾Ñ…Ñ€Ð°Ð½Ð¸Ñ‚ÑŒ. Fix A + Fix B Ð´Ð°ÑŽÑ‚ 80% ÑÑ„Ñ„ÐµÐºÑ‚Ð°. Fix C â€” optimization.

---

## Identifier Contract (ÐšÐ Ð˜Ð¢Ð˜Ð§ÐÐž â€” Ñ‡Ð¸Ñ‚Ð°Ñ‚ÑŒ Ð”Ðž Fix B) â€” [v4-C2, v5-L6]

Ð’ Fix B Ð²Ð²Ð¾Ð´Ð¸Ñ‚ÑÑ Ð½Ð¾Ð²Ð¾Ðµ Ð¿Ð¾Ð»Ðµ `group.compositeKey` (= `${tableId}__${sessionId}`). Ð­Ñ‚Ð¾ ÑÐ¾Ð·Ð´Ð°Ñ‘Ñ‚ Ð”Ð’Ð Ñ€Ð°Ð·Ð½Ñ‹Ñ… Ñ‚Ð¸Ð¿Ð° Ð¸Ð´ÐµÐ½Ñ‚Ð¸Ñ„Ð¸ÐºÐ°Ñ‚Ð¾Ñ€Ð¾Ð² Ð² OrderGroupCard'Ð°Ñ…. Ð›ÑŽÐ±Ð°Ñ Ð¿ÑƒÑ‚Ð°Ð½Ð¸Ñ†Ð° Ð»Ð¾Ð¼Ð°ÐµÑ‚ Ñ„ÑƒÐ½ÐºÑ†Ð¸Ð¾Ð½Ð°Ð». Ð­Ñ‚Ð° Ñ‚Ð°Ð±Ð»Ð¸Ñ†Ð° â€” ÐµÐ´Ð¸Ð½ÑÑ‚Ð²ÐµÐ½Ð½Ñ‹Ð¹ Ð¸ÑÑ‚Ð¾Ñ‡Ð½Ð¸Ðº Ð¸ÑÑ‚Ð¸Ð½Ñ‹:

| Ð“Ð´Ðµ Ð¸ÑÐ¿Ð¾Ð»ÑŒÐ·Ð¾Ð²Ð°Ñ‚ÑŒ | Ð˜Ð´ÐµÐ½Ñ‚Ð¸Ñ„Ð¸ÐºÐ°Ñ‚Ð¾Ñ€ | ÐŸÐ¾Ñ‡ÐµÐ¼Ñƒ | ÐœÐµÐ½ÑÐµÐ¼ Ð»Ð¸ Ð² Fix B? |
|---|---|---|---|
| **Render identity** (Ð²Ð¸Ð·ÑƒÐ°Ð»ÑŒÐ½Ð°Ñ, UI) | | | |
| `key={...}` Ð´Ð»Ñ OrderGroupCard Ð² map | `group.compositeKey` | React reconciliation â€” ÐºÐ°Ð¶Ð´Ð°Ñ ÐºÐ°Ñ€Ñ‚Ð¾Ñ‡ÐºÐ° ÑƒÐ½Ð¸ÐºÐ°Ð»ÑŒÐ½Ð° | âœ… Ð”Ð (Fix B.4) |
| `data-group-id={...}` Ð°Ñ‚Ñ€Ð¸Ð±ÑƒÑ‚ (live JSX @ ~2292) | `group.compositeKey` | DOM-ÑÐµÐ»ÐµÐºÑ‚Ð¾Ñ€ Ð´Ð»Ñ banner scroll | âœ… Ð”Ð (Fix B.5) |
| `expandedGroupId === group.compositeKey` | `group.compositeKey` | ÐºÐ°Ð¶Ð´Ð°Ñ ÐºÐ°Ñ€Ñ‚Ð¾Ñ‡ÐºÐ° expand/collapse Ð½ÐµÐ·Ð°Ð²Ð¸ÑÐ¸Ð¼Ð¾ | âœ… Ð”Ð (Fix B.4) |
| `highlightGroupId === group.compositeKey` | `group.compositeKey` | Ð¿Ð¾Ð´ÑÐ²ÐµÑ‚ÐºÐ° Ð¿Ð¾ÑÐ»Ðµ banner-navigate | âœ… Ð”Ð (Fix B.4) |
| `handleToggleExpand(group.compositeKey)` | `group.compositeKey` | Ð¿ÐµÑ€ÐµÐ´Ð°Ñ‘Ñ‚ÑÑ Ð² setExpandedGroupId | âœ… Ð”Ð (Fix B.4) |
| Tab bucketing (active/completed) â€” `isCurrentOpenSession` | `group.sessionId` (Ð¿Ð¾Ð»Ðµ) ÑÑ€Ð°Ð²Ð½Ð¸Ð²Ð°ÐµÑ‚ÑÑ Ñ `openSessionByTableId[group.id]?.id` | ÐºÐ°Ð¶Ð´Ð°Ñ ÑÐµÑÑÐ¸Ñ Ð¾Ð¿Ñ€ÐµÐ´ÐµÐ»ÑÐµÑ‚ ÑÐ²Ð¾Ð¹ Ñ‚Ð°Ð± Ð½ÐµÐ·Ð°Ð²Ð¸ÑÐ¸Ð¼Ð¾ | âœ… Ð”Ð (Fix B.2/B.3) |
| `setExpandedGroupId(targetKey)` Ð² banner-navigate | `compositeKey` (Ñ€ÐµÐ·Ð¾Ð»Ð² Ð¸Ð· tableId Ñ‡ÐµÑ€ÐµÐ· defensive helper) | scroll Ð¸ expand Ð¾Ð´Ð½Ð¾Ð¹ ÐºÐ°Ñ€Ñ‚Ð¾Ñ‡ÐºÐ¸ | âœ… Ð”Ð (Fix B.6) |
| **Business identity** (Ð´Ð¾Ð¼ÐµÐ½, Ð‘Ð”, ÐºÑÑˆ) | | | |
| `isFavorite('table', group.id)` | `group.id` (= tableId) | favorites Ð¿Ñ€Ð¸Ð²ÑÐ·Ð°Ð½Ñ‹ Ðº ÑÑ‚Ð¾Ð»Ñƒ, Ð²Ñ‹Ð¶Ð¸Ð²Ð°ÑŽÑ‚ ÑÐ¼ÐµÐ½Ñƒ ÑÐµÑÑÐ¸Ð¸ | â›” ÐÐ•Ð¢ |
| `toggleFavorite('table', group.id)` | `group.id` (= tableId) | Ñ‚Ð¾ Ð¶Ðµ | â›” ÐÐ•Ð¢ |
| `["servedOrders", group.id]` queryKey | `group.id` (= tableId) | served orders persist Ñ‡ÐµÑ€ÐµÐ· ÑÐµÑÑÐ¸Ð¸ (history ÑÑ‚Ð¾Ð»Ð°) | â›” ÐÐ•Ð¢ |
| `onCloseTable(group.openSessionId, group.displayName, group.id)` | `group.openSessionId` + `group.id` | Ð·Ð°ÐºÑ€Ñ‹Ð²Ð°ÐµÐ¼ ÑÐµÑÑÐ¸ÑŽ Ð´Ð»Ñ ÐºÐ¾Ð½ÐºÑ€ÐµÑ‚Ð½Ð¾Ð³Ð¾ ÑÑ‚Ð¾Ð»Ð° | â›” ÐÐ•Ð¢ |
| `tableMap[tableId]` lookup | `group.id` (= tableId) | Ñ‚Ð°Ð±Ð»Ð¸Ñ†Ð° ÑÐ¿Ñ€Ð°Ð²Ð¾Ñ‡Ð½Ð¸ÐºÐ¾Ð² ÑÑ‚Ð¾Ð»Ð¾Ð² Ð² B44 | â›” ÐÐ•Ð¢ |
| `getLinkId(req.table) === group.id` Ð² `hasActiveRequest` | `group.id` (= tableId) | ServiceRequest Ð¿Ñ€Ð¸Ð²ÑÐ·Ð°Ð½ Ðº tableId | â›” ÐÐ•Ð¢ |
| `Order.table_session` Ð² Ð‘Ð” | NEVER Ð˜Ð—ÐœÐ•ÐÐ¯Ð¢Ð¬ | source of truth Ð´Ð»Ñ Ð³Ñ€ÑƒÐ¿Ð¿Ð¸Ñ€Ð¾Ð²ÐºÐ¸ | â›” ÐÐ•Ð¢ |
| **Upstream (banner dispatcher â†’ handleBannerNavigate)** â€” [V5-L6] | | | |
| `onNavigate(banner.groupId)` call @ ~2825 | `banner.groupId` = tableId (Ð¸Ð· `buildBannerInfo` @ ~4079-4090) | banner Ð·Ð½Ð°ÐµÑ‚ Ñ‚Ð¾Ð»ÑŒÐºÐ¾ tableId (Ð¾Ð´Ð¸Ð½ Ð±Ð°Ð½ÐµÑ€ Ð½Ð° ÑÑ‚Ð¾Ð») | â›” ÐÐ•Ð¢ (upstream) |
| `buildBannerInfo` return `{ groupId: table.id, ... }` @ ~4079-4090 | tableId | banner Ð¿Ð¾ÐºÐ°Ð·Ñ‹Ð²Ð°ÐµÑ‚ alert Ð¿Ñ€Ð¾ ÑÑ‚Ð¾Ð», Ð½Ðµ Ð¿Ñ€Ð¾ Ð¾Ñ‚Ð´ÐµÐ»ÑŒÐ½ÑƒÑŽ ÑÐµÑÑÐ¸ÑŽ | â›” ÐÐ•Ð¢ (upstream) |
| Ð’Ð½ÑƒÑ‚Ñ€Ð¸ `handleBannerNavigate` Ñ‚ÐµÐ»Ð¾ | Ð¿Ñ€Ð¸Ð½Ð¸Ð¼Ð°ÐµÑ‚ tableId, Ñ€ÐµÐ·Ð¾Ð»Ð²Ð¸Ñ‚ Ð² compositeKey | defensive â€” Ñ€Ð°Ð±Ð¾Ñ‚Ð°ÐµÑ‚ Ð¸ Ñ Ñ‡Ð¸ÑÑ‚Ñ‹Ð¼ tableId (Ð½Ð°Ñˆ ÑÐ»ÑƒÑ‡Ð°Ð¹) Ð¸ Ñ compositeKey (Ð½Ðµ Ð²ÑÑ‚Ñ€ÐµÑ‡Ð°ÐµÑ‚ÑÑ today, Ð½Ð¾ Ð±ÐµÐ·Ð¾Ð¿Ð°ÑÐ½Ð¾) | âœ… Ð”Ð (Fix B.6) |

âš ï¸ **ÐŸÑ€Ð°Ð²Ð¸Ð»Ð¾ Ð¿Ñ€Ð¸ Ð¿Ñ€Ð°Ð²ÐºÐµ:** ÐµÑÐ»Ð¸ ÐºÐ¾Ð´ Â«Ñ‚Ñ€Ð¾Ð³Ð°ÐµÑ‚ DOM/React stateÂ» â†’ `compositeKey`. Ð•ÑÐ»Ð¸ ÐºÐ¾Ð´ Â«Ñ‚Ñ€Ð¾Ð³Ð°ÐµÑ‚ B44 entity / API / favorites / upstream bannerÂ» â†’ `tableId` (= `group.id`).

âš ï¸ **ÐÐ½Ñ‚Ð¸-Ð¿Ð°Ñ‚Ñ‚ÐµÑ€Ð½:** Ð·Ð°Ð¼ÐµÐ½Ð° `group.id` â†’ `group.compositeKey` Ð³Ð»Ð¾Ð±Ð°Ð»ÑŒÐ½Ð¾ Ñ‡ÐµÑ€ÐµÐ· find-replace Ð¡Ð›ÐžÐœÐÐ•Ð¢ favorites + servedOrders + close-table + upstream banner. Ð¢Ð¾Ð»ÑŒÐºÐ¾ Ð² Ð¼ÐµÑÑ‚Ð°Ñ… Ð¸Ð· Ñ‚Ð°Ð±Ð»Ð¸Ñ†Ñ‹ Ð²Ñ‹ÑˆÐµ.

âš ï¸ **Call-chain Ð´Ð»Ñ banner-navigate:** `buildBannerInfo â†’ banner.groupId (tableId) â†’ onNavigate(banner.groupId) @ 2825 â†’ prop onNavigate @ 4610 â†’ handleBannerNavigate @ 4142 â†’ defensive Ñ€ÐµÐ·Ð¾Ð»Ð² â†’ compositeKey â†’ scroll+expand`. handleBannerNavigate â€” ÐµÐ´Ð¸Ð½ÑÑ‚Ð²ÐµÐ½Ð½Ð°Ñ Ñ‚Ð¾Ñ‡ÐºÐ° Ð¿Ñ€ÐµÐ¾Ð±Ñ€Ð°Ð·Ð¾Ð²Ð°Ð½Ð¸Ñ tableId â†’ compositeKey.

---

## Codex Execution Mode (Ð´Ð»Ñ codex-writer-v2 step) â€” [v4-M8, v5-M4 ÑƒÐ¿Ñ€Ð¾Ñ‰Ñ‘Ð½]

`staffordersmobile.jsx` = 4617 ÑÑ‚Ñ€Ð¾Ðº. ÐÐ° Windows Codex CLI chanced to timeout Ð¿Ñ€Ð¸ Ð±Ð¾Ð»ÑŒÑˆÐ¸Ñ… inline prompt'Ð°Ñ…. Ð•Ð´Ð¸Ð½Ñ‹Ð¹ supported Ð¿ÑƒÑ‚ÑŒ:

1. **Self-read Ñ‡ÐµÑ€ÐµÐ· tool `Read` (MCP/Claude).** Ð•ÑÐ»Ð¸ Ð´Ð¾ÑÑ‚ÑƒÐ¿ÐµÐ½ Read tool â€” Ñ‡Ð¸Ñ‚Ð°Ð¹ Ñ€Ð°Ð±Ð¾Ñ‡ÑƒÑŽ ÐºÐ¾Ð¿Ð¸ÑŽ Ð½Ð°Ð¿Ñ€ÑÐ¼ÑƒÑŽ: `pages/StaffOrdersMobile/staffordersmobile.jsx`. Ð”Ð»Ñ Ð±Ð¾Ð»ÑŒÑˆÐ¸Ñ… Ñ„Ð°Ð¹Ð»Ð¾Ð² Ð¸ÑÐ¿Ð¾Ð»ÑŒÐ·ÑƒÐ¹ `offset`/`limit` Ð¿Ð°Ñ€Ð°Ð¼ÐµÑ‚Ñ€Ñ‹ Read Ð´Ð»Ñ range-reads (50-100 ÑÑ‚Ñ€Ð¾Ðº Ð²Ð¾ÐºÑ€ÑƒÐ³ ÑÐºÐ¾Ñ€Ñ).

2. **Ð•ÑÐ»Ð¸ Read tool Ð½ÐµÐ´Ð¾ÑÑ‚ÑƒÐ¿ÐµÐ½:** Ð¸ÑÐ¿Ð¾Ð»ÑŒÐ·ÑƒÐ¹ bash `grep -n` + `sed -n 'X,Yp'` (10-30 ÑÑ‚Ñ€Ð¾Ðº Ð²Ð¾ÐºÑ€ÑƒÐ³ ÑÐºÐ¾Ñ€Ñ) Ñ‡ÐµÑ€ÐµÐ· Ð¾Ð´Ð¸Ð½ shell-pass. ÐÐ• Ð·Ð°Ð¿ÑƒÑÐºÐ°Ð¹ PowerShell wrappers (timeout >15s).

3. **Output path (findings):** Ð¿Ð¸ÑˆÐ¸ Ð² ÑÐ¾Ð³Ð»Ð°ÑÐ¾Ð²Ð°Ð½Ð½Ñ‹Ð¹ chain-state path (watcher v5.3+ KB-165 retrieval Ð°ÐºÑ‚Ð¸Ð²ÐµÐ½ â€” Ð´Ð°Ð¶Ðµ ÐµÑÐ»Ð¸ sandbox Ð±Ð»Ð¾ÐºÐ¸Ñ€ÑƒÐµÑ‚ write, Cowork Ð¸Ð·Ð²Ð»ÐµÑ‡Ñ‘Ñ‚ findings Ð¸Ð· task.log). ÐÐ• ÑÐ¾Ð·Ð´Ð°Ð²Ð°Ð¹ side-Ñ„Ð°Ð¹Ð»Ñ‹ `result-codex.md` Ð¸Ð»Ð¸ Ð²Ñ€ÐµÐ¼ÐµÐ½Ð½Ñ‹Ðµ markdown-Ñ„Ð°Ð¹Ð»Ñ‹ Ð² Ñ€Ð°Ð±Ð¾Ñ‡ÐµÐ¼ ÐºÐ°Ñ‚Ð°Ð»Ð¾Ð³Ðµ Ñ€ÐµÐ¿Ð¾ â€” Ð¾Ð½Ð¸ Ð¼Ð¾Ð³ÑƒÑ‚ ÑÐ»ÑƒÑ‡Ð°Ð¹Ð½Ð¾ Ð¿Ð¾Ð¿Ð°ÑÑ‚ÑŒ Ð² git commit.

4. **Ð—Ð°Ð¿Ñ€ÐµÑ‰ÐµÐ½Ð¾:**
   - Ð—Ð°Ð³Ñ€ÑƒÐ¶Ð°Ñ‚ÑŒ **Ð²ÐµÑÑŒ** Ñ„Ð°Ð¹Ð» Ð² ÐºÐ¾Ð½Ñ‚ÐµÐºÑÑ‚ (4617 ÑÑ‚Ñ€Ð¾Ðº, ~250 KB).
   - Inline JSON dump Ð¿Ð¾Ð»Ð½Ð¾Ð³Ð¾ Ñ„Ð°Ð¹Ð»Ð° Ð² response.
   - Ð—Ð°Ð¿ÑƒÑÐº Ð´Ð»Ð¸Ð½Ð½Ñ‹Ñ… PowerShell-Ð¾Ð±Ñ‘Ñ€Ñ‚Ð¾Ðº (>10 ÑÐµÐºÑƒÐ½Ð´ startup) â€” ÑÑ‚Ð¾ Ñ‚Ð°Ð¹Ð¼Ð°ÑƒÑ‚Ð¸Ñ‚ Codex.

5. **Ð’Ñ€ÐµÐ¼Ñ.** Ð¦ÐµÐ»ÐµÐ²Ð¾Ðµ Ð²Ñ€ÐµÐ¼Ñ Codex review: 8-15 Ð¼Ð¸Ð½ÑƒÑ‚. Ð•ÑÐ»Ð¸ ÑƒÐ¿Ñ‘Ñ€ÑÑ Ð² Ñ‚ÐµÑ…Ð½Ð¸Ñ‡ÐµÑÐºÐ¸Ð¹ blocker (sandbox, timeout) â€” Ñ„Ð¸ÐºÑÐ¸Ñ€ÑƒÐ¹ Ð² findings Ð¸ Ð¿Ñ€Ð¾Ð´Ð¾Ð»Ð¶Ð°Ð¹ ÑÐ¾ ÑÐ»ÐµÐ´ÑƒÑŽÑ‰Ð¸Ð¼ Fix. ÐÐµ Ð±Ð»Ð¾ÐºÐ¸Ñ€ÑƒÐ¹ÑÑ.

---

## Fix A: staleTime Ð´Ð»Ñ openSessions 30s â†’ 5s

### Ð¡Ñ‚Ð°Ñ‚ÑƒÑ: [FIX]
**ÐŸÑ€Ð¾Ð±Ð»ÐµÐ¼Ð° (verified):** `staleTime: 30_000` Ð² `openSessions` useQuery (ÑÑ‚Ñ€Ð¾ÐºÐ° ~3548) Ð¾Ð·Ð½Ð°Ñ‡Ð°ÐµÑ‚, Ñ‡Ñ‚Ð¾ Ð¿Ð¾ÑÐ»Ðµ ÑÐ¾Ð·Ð´Ð°Ð½Ð¸Ñ Ð½Ð¾Ð²Ð¾Ð¹ TableSession Ð½Ð° Base44 SOM Ð½Ðµ Ð±ÑƒÐ´ÐµÑ‚ ÐµÑ‘ Ð²Ð¸Ð´ÐµÑ‚ÑŒ Ð´Ð¾ 30 ÑÐµÐºÑƒÐ½Ð´. Ð’ÑÑ‘ ÑÑ‚Ð¾ Ð²Ñ€ÐµÐ¼Ñ Ð½Ð¾Ð²Ñ‹Ðµ Orders Ð¾Ñ‚Ð¾Ð±Ñ€Ð°Ð¶Ð°ÑŽÑ‚ÑÑ Ð² ÐºÐ°Ñ€Ñ‚Ð¾Ñ‡ÐºÐµ ÑÑ‚Ð°Ñ€Ð¾Ð¹ Ð·Ð°ÐºÑ€Ñ‹Ñ‚Ð¾Ð¹ ÑÐµÑÑÐ¸Ð¸.

### Change

**Grep-ÑÐºÐ¾Ñ€ÑŒ:** `staleTime: 30_000` (Ð¾Ð¶Ð¸Ð´Ð°ÐµÑ‚ÑÑ 1 hit, Ð² Ð±Ð»Ð¾ÐºÐµ `openSessions` useQuery, ÑÑ‚Ñ€Ð¾ÐºÐ¸ 3541-3552).

**Ð¢ÐµÐºÑƒÑ‰Ð¸Ð¹ ÐºÐ¾Ð´ (ÑÑ‚Ñ€Ð¾ÐºÐ° ~3548):**
```js
    enabled: canFetch && !!partnerId && !rateLimitHit,
    staleTime: 30_000,
    refetchInterval: effectivePollingInterval,
```

**ÐÐ¾Ð²Ñ‹Ð¹ ÐºÐ¾Ð´ (Ð·Ð°Ð¼ÐµÐ½Ð¸Ñ‚ÑŒ Ñ€Ð¾Ð²Ð½Ð¾ Ð¾Ð´Ð½Ñƒ ÑÑ‚Ñ€Ð¾ÐºÑƒ):**
```js
    enabled: canFetch && !!partnerId && !rateLimitHit,
    staleTime: 5_000,
    refetchInterval: effectivePollingInterval,
```

### Should NOT â€” [v4-M1, v5-C1]

**Ð¦ÐµÐ»ÐµÐ²Ð¾Ð¹ queryKey:** `["openSessions", partnerId]` (1 hit @ ~3542). **ÐÐ• ÐœÐ•ÐÐ¯Ð¢Ð¬** queryKey shape â€” ÑÑ‚Ð¾ Ð¿Ð¾Ð²Ð»Ð¸ÑÐµÑ‚ Ð½Ð° ÐºÑÑˆ-Ð¿Ð°Ñ€Ñ‚Ð¸Ñ†Ð¸Ð¾Ð½Ð¸Ñ€Ð¾Ð²Ð°Ð½Ð¸Ðµ Ð¸ ÑÐ»Ð¾Ð¼Ð°ÐµÑ‚ Ð²ÑÐµ Ð¼ÐµÑÑ‚Ð°, ÐºÐ¾Ñ‚Ð¾Ñ€Ñ‹Ðµ Ñ‡Ð¸Ñ‚Ð°ÑŽÑ‚ cache Ð´Ð»Ñ ÐºÐ¾Ð½ÐºÑ€ÐµÑ‚Ð½Ð¾Ð³Ð¾ partner. [V5-C1]

**Ð’Ð°Ð¶Ð½Ð¾:** `queryClient.invalidateQueries({ queryKey: ["openSessions"] })` Ð² Fix C Ð½Ð¸Ð¶Ðµ â€” ÑÑ‚Ð¾ **prefix invalidate** (react-query Ð¿Ð¾ ÑƒÐ¼Ð¾Ð»Ñ‡Ð°Ð½Ð¸ÑŽ Ð¼Ð°Ñ‚Ñ‡Ð¸Ñ‚ `["openSessions", partnerId]` Ñ‡ÐµÑ€ÐµÐ· `exact: false`). ÐÐ• Ð½ÑƒÐ¶Ð½Ð¾ Ð¼ÐµÐ½ÑÑ‚ÑŒ Ð½Ð° `["openSessions", partnerId]` â€” prefix Ñ€Ð°Ð±Ð¾Ñ‚Ð°ÐµÑ‚ ÐºÐ¾Ñ€Ñ€ÐµÐºÑ‚Ð½Ð¾ Ð´Ð»Ñ Ð»ÑŽÐ±Ð¾Ð³Ð¾ Ñ‚ÐµÐºÑƒÑ‰ÐµÐ³Ð¾ partnerId.

**Ð¡Ð¿Ð¸ÑÐ¾Ðº staleTime Ð·Ð½Ð°Ñ‡ÐµÐ½Ð¸Ð¹ Ð² Ñ„Ð°Ð¹Ð»Ðµ, ÐºÐ¾Ñ‚Ð¾Ñ€Ñ‹Ðµ Ð—ÐÐŸÐ Ð•Ð©Ð•ÐÐž Ñ‚Ñ€Ð¾Ð³Ð°Ñ‚ÑŒ** (pre-check `grep -n "staleTime:" file`):
- `staleTime: 60_000` Ð´Ð»Ñ `["tables", partnerId]` / `["stages", partnerId]` / `["partner"]` queries â€” ÑÑ‚Ð°Ñ‚Ð¸Ñ‡Ð½Ñ‹Ð¹ ÐºÐ¾Ð½Ñ„Ð¸Ð³, Ð½Ðµ Ð¼ÐµÐ½ÑÑ‚ÑŒ.
- `["orders", partnerId]` useQuery â€” ÐÐ• Ð¸Ð¼ÐµÐµÑ‚ ÑÐ²Ð½Ð¾Ð³Ð¾ `staleTime` (Ð¸ÑÐ¿Ð¾Ð»ÑŒÐ·ÑƒÐµÑ‚ `refetchInterval`); Ð½Ðµ Ð´Ð¾Ð±Ð°Ð²Ð»ÑÑ‚ÑŒ staleTime Ñ‚ÑƒÐ´Ð°.
- Ð›ÑŽÐ±Ð¾Ð¹ Ð´Ñ€ÑƒÐ³Ð¾Ð¹ `staleTime: ...` ÐºÐ¾Ñ‚Ð¾Ñ€Ñ‹Ð¹ Ð½Ðµ Ð½Ð°Ñ…Ð¾Ð´Ð¸Ñ‚ÑÑ Ð² `useQuery({ queryKey: ["openSessions", partnerId], ... })` Ð±Ð»Ð¾ÐºÐµ â€” ÐÐ• Ð¢Ð ÐžÐ“ÐÐ¢Ð¬.

**Ð¢Ð°ÐºÐ¶Ðµ ÐÐ• Ð¼ÐµÐ½ÑÑ‚ÑŒ Ð² `["openSessions", partnerId]` useQuery:**
- `queryKey` (= `["openSessions", partnerId]`) â€” Ð¼ÐµÐ½ÑÑ‚ÑŒ ÑÐ»Ð¾Ð¼Ð°ÐµÑ‚ partitioning Ð¸ Fix C invalidate + tabCounts.
- `queryFn` (`OpenSessions.list(...)` Ð¸Ð»Ð¸ Ð°Ð½Ð°Ð»Ð¾Ð³) â€” ÑÑ‚Ð¾ backend ÐºÐ¾Ð½Ñ‚Ñ€Ð°ÐºÑ‚.
- `refetchInterval: effectivePollingInterval` â€” polling ÑƒÐ¿Ñ€Ð°Ð²Ð»ÑÐµÑ‚ÑÑ Ñ‡ÐµÑ€ÐµÐ· Ð¿ÐµÑ€ÐµÐ¼ÐµÐ½Ð½ÑƒÑŽ, Ð½Ðµ Ñ‚Ñ€Ð¾Ð³Ð°Ñ‚ÑŒ.
- `refetchIntervalInBackground` / `retry` / `enabled` (Ð·Ð° Ð¸ÑÐºÐ»ÑŽÑ‡ÐµÐ½Ð¸ÐµÐ¼ ÑƒÐ¶Ðµ ÑÑ‚Ð¾ÑÑ‰Ð¸Ñ… ÑƒÑÐ»Ð¾Ð²Ð¸Ð¹) â€” Ð½Ðµ Ñ‚Ñ€Ð¾Ð³Ð°Ñ‚ÑŒ.

### Verification Ð¿Ð¾ÑÐ»Ðµ Fix A
```bash
# 1. Ð£Ð±ÐµÐ´Ð¸Ñ‚ÑŒÑÑ Ñ‡Ñ‚Ð¾ Ð¸Ð·Ð¼ÐµÐ½ÐµÐ½Ð° Ñ‚Ð¾Ð»ÑŒÐºÐ¾ Ð¾Ð´Ð½Ð° ÑÑ‚Ñ€Ð¾ÐºÐ°
grep -n "staleTime:" "pages/StaffOrdersMobile/staffordersmobile.jsx" | grep "5_000"
# ÐžÐ¶Ð¸Ð´Ð°Ð½Ð¸Ðµ: 1 hit, ÑÑ‚Ñ€Ð¾ÐºÐ° ~3548.

# 2. Ð£Ð±ÐµÐ´Ð¸Ñ‚ÑŒÑÑ Ñ‡Ñ‚Ð¾ 30_000 Ð¸ÑÑ‡ÐµÐ·
grep -n "staleTime: 30_000" "pages/StaffOrdersMobile/staffordersmobile.jsx"
# ÐžÐ¶Ð¸Ð´Ð°Ð½Ð¸Ðµ: 0 hits.

# 3. [v5-C1] Ð£Ð±ÐµÐ´Ð¸Ñ‚ÑŒÑÑ Ñ‡Ñ‚Ð¾ queryKey shape ÐÐ• Ð¸Ð·Ð¼ÐµÐ½Ð¸Ð»ÑÑ
grep -n 'queryKey: \["openSessions", partnerId\]' "pages/StaffOrdersMobile/staffordersmobile.jsx"
# ÐžÐ¶Ð¸Ð´Ð°Ð½Ð¸Ðµ: 1 hit, ÑÑ‚Ñ€Ð¾ÐºÐ° ~3542 (ÐºÐ°Ðº Ð¸ Ð´Ð¾ Ñ„Ð¸ÐºÑÐ°).

grep -n 'queryKey: \["openSessions"\]' "pages/StaffOrdersMobile/staffordersmobile.jsx"
# ÐžÐ¶Ð¸Ð´Ð°Ð½Ð¸Ðµ: 0 hits Ð² `useQuery(...)` ÐºÐ¾Ð½Ñ‚ÐµÐºÑÑ‚Ðµ. ÐœÐ¾Ð¶ÐµÑ‚ Ð±Ñ‹Ñ‚ÑŒ â‰¥1 hit Ð² `invalidateQueries(...)` ÐºÐ¾Ð½Ñ‚ÐµÐºÑÑ‚Ðµ â€” ÑÑ‚Ð¾ prefix invalidate, ÑÑ‚Ð¾ OK.

# 4. wc -l Ð½Ðµ Ð´Ð¾Ð»Ð¶ÐµÐ½ Ð¸Ð·Ð¼ÐµÐ½Ð¸Ñ‚ÑŒÑÑ
wc -l "pages/StaffOrdersMobile/staffordersmobile.jsx"
# ÐžÐ¶Ð¸Ð´Ð°Ð½Ð¸Ðµ: 4617 +70/-35 (Ð·Ð°Ð¼ÐµÐ½Ð¸Ð»Ð¸ 1 ÑÑ‚Ñ€Ð¾ÐºÑƒ, ÑÑ‡Ñ‘Ñ‚Ñ‡Ð¸Ðº Ð½Ðµ Ð´Ð¾Ð»Ð¶ÐµÐ½ Ð²Ñ‹Ñ€Ð°ÑÑ‚Ð¸).
```

---

## Fix B: Session-aware orderGroups (#347) + coordinated call-site updates

### Ð¡Ñ‚Ð°Ñ‚ÑƒÑ: [FIX] (Ð¾ÑÐ½Ð¾Ð²Ð½Ð¾Ð¹ UX-Ñ„Ð¸ÐºÑ)
**ÐŸÑ€Ð¾Ð±Ð»ÐµÐ¼Ð° (verified):** `orderGroups` Ð³Ñ€ÑƒÐ¿Ð¿Ð¸Ñ€ÑƒÐµÑ‚ hall-Orders Ð¿Ð¾ `tableId`. ÐŸÑ€Ð¸ Ð¿Ð¾ÑÐ»ÐµÐ´Ð¾Ð²Ð°Ñ‚ÐµÐ»ÑŒÐ½Ñ‹Ñ… ÑÐµÑÑÐ¸ÑÑ… (ÑÑ‚Ð°Ñ€Ð°Ñ Ð·Ð°ÐºÑ€Ñ‹Ñ‚Ð° â†’ Ð½Ð¾Ð²Ð°Ñ Ð¾Ñ‚ÐºÑ€Ñ‹Ñ‚Ð°) Ð’Ð¡Ð• Orders ÑÑ‚Ð¾Ð»Ð° Ð¿Ð¾Ð¿Ð°Ð´Ð°ÑŽÑ‚ Ð² Ð¾Ð´Ð½Ñƒ `tableGroups[tableId]` â†’ Ð¾Ð´Ð½Ð° ÐºÐ°Ñ€Ñ‚Ð¾Ñ‡ÐºÐ°. ÐÑƒÐ¶Ð½Ð¾ Ð³Ñ€ÑƒÐ¿Ð¿Ð¸Ñ€Ð¾Ð²Ð°Ñ‚ÑŒ Ð¿Ð¾ `(tableId, sessionId)`, Ñ‡Ñ‚Ð¾Ð±Ñ‹ ÐºÐ°Ð¶Ð´Ð°Ñ TableSession Ð¸Ð¼ÐµÐ»Ð° Ð¾Ñ‚Ð´ÐµÐ»ÑŒÐ½ÑƒÑŽ ÐºÐ°Ñ€Ñ‚Ð¾Ñ‡ÐºÑƒ.

### Wireframe (Ð±Ñ‹Ð»Ð¾ â†’ Ð´Ð¾Ð»Ð¶Ð½Ð¾ Ð±Ñ‹Ñ‚ÑŒ)

```
Ð‘Ð«Ð›Ðž (BUG-SM-015):                      Ð”ÐžÐ›Ð–ÐÐž Ð‘Ð«Ð¢Ð¬:
â•”â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•—    â•”â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•—
â•‘ Ñ‚Ð°Ð± Â«Ð—Ð°Ð²ÐµÑ€ÑˆÑ‘Ð½Ð½Ñ‹ÐµÂ»                â•‘    â•‘ Ñ‚Ð°Ð± Â«ÐÐºÑ‚Ð¸Ð²Ð½Ñ‹ÐµÂ»                â•‘
â•‘ â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â•‘    â•‘ â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â•‘
â•‘ â”‚ Ð¡Ñ‚Ð¾Ð» 3                       â”‚ â•‘    â•‘ â”‚ Ð¡Ñ‚Ð¾Ð» 3 (new session)      â”‚ â•‘
â•‘ â”‚  - Ð·Ð°ÐºÐ°Ð· 1 (closed)          â”‚ â•‘    â•‘ â”‚  - Ð·Ð°ÐºÐ°Ð· 2 (new)          â”‚ â•‘
â•‘ â”‚  - Ð·Ð°ÐºÐ°Ð· 2 (new) â† WRONG!    â”‚ â•‘    â•‘ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â•‘
â•‘ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â•‘    â•‘                               â•‘
â•šâ•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•    â•‘ Ñ‚Ð°Ð± Â«Ð—Ð°Ð²ÐµÑ€ÑˆÑ‘Ð½Ð½Ñ‹ÐµÂ»             â•‘
                                        â•‘ â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â•‘
                                        â•‘ â”‚ Ð¡Ñ‚Ð¾Ð» 3 (closed session)   â”‚ â•‘
                                        â•‘ â”‚  - Ð·Ð°ÐºÐ°Ð· 1 (closed)       â”‚ â•‘
                                        â•‘ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â•‘
                                        â•šâ•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
```

### Changes â€” 5 ÐºÐ¾Ð¾Ñ€Ð´Ð¸Ð½Ð¸Ñ€Ð¾Ð²Ð°Ð½Ð½Ñ‹Ñ… Ð¿Ñ€Ð°Ð²Ð¾Ðº

**B.1 â€” `orderGroups` useMemo (~ÑÑ‚Ñ€Ð¾ÐºÐ¸ 3768-3819)**

Grep-ÑÐºÐ¾Ñ€ÑŒ: `const orderGroups = useMemo` (1 hit). Ð§Ð¸Ñ‚Ð°ÐµÑ‚ÑÑ ÐºÐ°Ðº:
```js
  // v2.7.0: Order groups model (hall by table, pickup/delivery individual)
  const orderGroups = useMemo(() => {
    if (isKitchen) return null;
    
    const groups = [];
    const tableGroups = {};
    
    visibleOrders.forEach(o => {
      if (o.order_type === 'hall') {
        const tableId = getLinkId(o.table);
        if (!tableId) return;
        if (!tableGroups[tableId]) {
          const tableName = tableMap[tableId]?.name || '?';
          tableGroups[tableId] = {
            type: 'table',
            id: tableId,
            displayName: tableName,
            orders: [],
            openSessionId: openSessionByTableId[tableId]?.id || null,
          };
          groups.push(tableGroups[tableId]);
        }
        tableGroups[tableId].orders.push(o);
      } else {
        groups.push({
          type: o.order_type,
          id: o.id,
          displayName: o.order_type === 'pickup' 
            ? `Ð¡Ð’-${o.order_number || o.id.slice(-3)}` 
            : `Ð”ÐžÐ¡-${o.order_number || o.id.slice(-3)}`,
          orders: [o],
        });
      }
    });

    activeRequests.forEach((req) => {
      const tableId = getLinkId(req.table);
      if (!tableId) return;
      if (!tableGroups[tableId]) {
        const tableName = tableMap[tableId]?.name || '?';
        tableGroups[tableId] = {
          type: 'table',
          id: tableId,
          displayName: tableName,
          orders: [],
          openSessionId: openSessionByTableId[tableId]?.id || null,
        };
        groups.push(tableGroups[tableId]);
      }
    });

    return groups;
  }, [visibleOrders, tableMap, isKitchen, activeRequests, openSessionByTableId]);
```

**Ð—Ð°Ð¼ÐµÐ½Ð¸Ñ‚ÑŒ Ð¦Ð•Ð›Ð˜ÐšÐžÐœ Ð±Ð»Ð¾Ðº `const orderGroups = useMemo(...)` ÑÐ»ÐµÐ´ÑƒÑŽÑ‰Ð¸Ð¼ (Ð‘Ð•Ð— Ð¸Ð·Ð¼ÐµÐ½ÐµÐ½Ð¸Ñ deps):**

```js
  // v2.7.0 + Ð‘2.1: Order groups model (hall by table+session, pickup/delivery individual)
  // BUG-SM-015: Split table orders by session_id so closed session stays in
  // Â«Ð—Ð°Ð²ÐµÑ€ÑˆÑ‘Ð½Ð½Ñ‹ÐµÂ» while new session appears as a fresh card in Â«ÐÐºÑ‚Ð¸Ð²Ð½Ñ‹ÐµÂ».
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
            id: tableId,                   // tableId â€” Ð¸ÑÐ¿Ð¾Ð»ÑŒÐ·ÑƒÐµÑ‚ÑÑ Ð´Ð»Ñ favorites, servedOrders query, onCloseTable callback
            sessionId: orderSessionId === 'no-session' ? null : orderSessionId, // NEW: ÑÐµÑÑÐ¸Ñ ÑÑ‚Ð¾Ð¹ Ð³Ñ€ÑƒÐ¿Ð¿Ñ‹ (null Ð´Ð»Ñ legacy orders Ð±ÐµÐ· session)
            compositeKey,                  // NEW: React key + data-group-id + expand/highlight tracking
            displayName: tableName,
            orders: [],
            openSessionId,                 // ID Ð¾Ñ‚ÐºÑ€Ñ‹Ñ‚Ð¾Ð¹ ÑÐµÑÑÐ¸Ð¸ Ð´Ð»Ñ ÑÑ‚Ð¾Ð³Ð¾ ÑÑ‚Ð¾Ð»Ð° (Ð¼Ð¾Ð¶ÐµÑ‚ != sessionId ÐµÑÐ»Ð¸ Ð·Ð°ÐºÑ€Ñ‹Ñ‚Ð°Ñ)
          };
          groups.push(tableGroups[compositeKey]);
        }
        tableGroups[compositeKey].orders.push(o);
      } else {
        // Pickup/Delivery â€” ÑƒÐ½Ð¸ÐºÐ°Ð»ÑŒÐ½Ñ‹ Ð¿Ð¾ orderId, Ð½Ðµ Ð¼ÐµÐ½ÑÐµÐ¼ Ð»Ð¾Ð³Ð¸ÐºÑƒ.
        groups.push({
          type: o.order_type,
          id: o.id,
          sessionId: null,
          compositeKey: `${o.order_type}__${o.id}`,
          displayName: o.order_type === 'pickup'
            ? `Ð¡Ð’-${o.order_number || o.id.slice(-3)}`
            : `Ð”ÐžÐ¡-${o.order_number || o.id.slice(-3)}`,
          orders: [o],
        });
      }
    });

    // ServiceRequest â†’ Ð¿Ñ€Ð¸Ð²ÑÐ·Ð°Ñ‚ÑŒ Ðº Ð³Ñ€ÑƒÐ¿Ð¿Ðµ Ð¢Ð•ÐšÐ£Ð©Ð•Ð™ Ð¾Ñ‚ÐºÑ€Ñ‹Ñ‚Ð¾Ð¹ ÑÐµÑÑÐ¸Ð¸ (ÐµÑÐ»Ð¸ ÐµÑÑ‚ÑŒ),
    // Ð¸Ð½Ð°Ñ‡Ðµ Ðº `${tableId}__no-session`. Ð—Ð°Ð¿Ñ€Ð¾ÑÑ‹ Ð¾Ñ‚ Ð·Ð°ÐºÑ€Ñ‹Ñ‚Ñ‹Ñ… ÑÐµÑÑÐ¸Ð¹ ÑƒÐ¶Ðµ Ð² ÑÑ‚Ð°Ñ‚ÑƒÑÐµ 'done'
    // (ÑÐ¼. closeSession Ð² sessionHelpers.js:175-188), Ð¿Ð¾ÑÑ‚Ð¾Ð¼Ñƒ Ð² activeRequests Ð½Ðµ Ð¿Ð¾Ð¿Ð°Ð´Ð°ÑŽÑ‚.
    //
    // âš ï¸ [v7-M1] INTENTIONAL: ÐµÑÐ»Ð¸ Ñƒ ÑÑ‚Ð¾Ð»Ð° Ð½ÐµÑ‚ Ð¾Ñ‚ÐºÑ€Ñ‹Ñ‚Ð¾Ð¹ ÑÐµÑÑÐ¸Ð¸ (openSessionId = null),
    // ÑÐ¾Ð·Ð´Ð°Ñ‘Ñ‚ÑÑ ÐºÐ°Ñ€Ñ‚Ð¾Ñ‡ÐºÐ° Ñ `orders: []`, `sessionId: null`, `compositeKey: ${tableId}__no-session`.
    // Ð¢Ð°ÐºÐ°Ñ ÐºÐ°Ñ€Ñ‚Ð¾Ñ‡ÐºÐ° Ð¿Ð¾Ð¿Ð°Ð´Ñ‘Ñ‚ Ð² Ñ‚Ð°Ð± Â«Ð—Ð°Ð²ÐµÑ€ÑˆÑ‘Ð½Ð½Ñ‹ÐµÂ» (filteredGroups: isCurrentOpenSession = false).
    // Ð­Ñ‚Ð¾ ÐºÐ¾Ñ€Ñ€ÐµÐºÑ‚Ð½Ð¾Ðµ Ð¿Ð¾Ð²ÐµÐ´ÐµÐ½Ð¸Ðµ: ServiceRequest Ð±ÐµÐ· Ð¾Ñ‚ÐºÑ€Ñ‹Ñ‚Ð¾Ð¹ ÑÐµÑÑÐ¸Ð¸ â€” Ð·Ð°Ð²ÐµÑ€ÑˆÑ‘Ð½Ð½Ñ‹Ð¹ Ð·Ð°Ð¿Ñ€Ð¾Ñ.
    // Ð•ÑÐ»Ð¸ Ð² Ð±ÑƒÐ´ÑƒÑ‰ÐµÐ¼ Ð¾Ñ‚ÐºÑ€Ð¾ÐµÑ‚ÑÑ ÑÐµÑÑÐ¸Ñ â†’ ÐºÐ°Ñ€Ñ‚Ð¾Ñ‡ÐºÐ° Ð´Ð»Ñ Ð½ÐµÑ‘ ÑÐ¾Ð·Ð´Ð°ÑÑ‚ÑÑ Ñ‡ÐµÑ€ÐµÐ· visibleOrders.
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
          sessionId: openSessionId,       // null ÐµÑÐ»Ð¸ no open session
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

**NOTE:** Ð¡Ð¾Ñ…Ñ€Ð°Ð½ÑÐµÑ‚ÑÑ Ñ‚Ð¾Ñ‚ Ð¶Ðµ dependency array (Ð´Ð¾Ð±Ð°Ð²Ð»ÑÑ‚ÑŒ Ð·Ð°Ð²Ð¸ÑÐ¸Ð¼Ð¾ÑÑ‚Ð¸ Ð½Ðµ Ñ‚Ñ€ÐµÐ±ÑƒÐµÑ‚ÑÑ â€” Ð²ÑÐµ Ð¸ÑÐ¿Ð¾Ð»ÑŒÐ·ÑƒÐµÐ¼Ñ‹Ðµ Ð² Ñ‚ÐµÐ»Ðµ Ð¿ÐµÑ€ÐµÐ¼ÐµÐ½Ð½Ñ‹Ðµ ÑƒÐ¶Ðµ Ð±Ñ‹Ð»Ð¸ Ð² ÑÑ‚Ð°Ñ€Ð¾Ð¼ Ð¼Ð°ÑÑÐ¸Ð²Ðµ).

**B.2 â€” `filteredGroups` useMemo (~ÑÑ‚Ñ€Ð¾ÐºÐ¸ 3862-3883)**

Grep-ÑÐºÐ¾Ñ€ÑŒ: `const filteredGroups = useMemo` (1 hit).

**Ð¢ÐµÐºÑƒÑ‰Ð¸Ð¹ ÐºÐ¾Ð´:**
```js
  const filteredGroups = useMemo(() => {
    if (!orderGroups) return [];

    return orderGroups.filter(group => {
      if (group.type === 'table') {
        const hasOpenSession = !!openSessionByTableId[group.id];
        if (!hasOpenSession) return activeTab === 'completed';
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

**[v4-M2] Ð—Ð°Ð¼ÐµÐ½Ð¸Ñ‚ÑŒ Ð’Ð•Ð¡Ð¬ Ð±Ð»Ð¾Ðº `const filteredGroups = useMemo(...)` ÑÐ»ÐµÐ´ÑƒÑŽÑ‰Ð¸Ð¼ (Ð¾Ñ‚Ð»Ð¸Ñ‡Ð¸Ñ Ð¾Ñ‚ Ñ‚ÐµÐºÑƒÑ‰ÐµÐ³Ð¾: Ð¢ÐžÐ›Ð¬ÐšÐž Ð¿ÐµÑ€Ð²Ñ‹Ð¹ `if (group.type === 'table')` Ð±Ð»Ð¾Ðº â€” Ð¾Ð¿Ñ€ÐµÐ´ÐµÐ»ÐµÐ½Ð¸Ðµ `isCurrentOpenSession` Ñ‡ÐµÑ€ÐµÐ· `openId` + `group.sessionId`, Ð²Ð¼ÐµÑÑ‚Ð¾ `hasOpenSession = !!openSessionByTableId[group.id]`). Ð’ÑÐµ Ð¾ÑÑ‚Ð°Ð»ÑŒÐ½Ñ‹Ðµ ÑÑ‚Ñ€Ð¾ÐºÐ¸ â€” `hasActiveOrder`, `hasActiveRequest`, `hasServedButNotClosed`, return â€” Ð˜Ð”Ð•ÐÐ¢Ð˜Ð§ÐÐ« Ð¾Ñ€Ð¸Ð³Ð¸Ð½Ð°Ð»Ñƒ. Deps array ÐÐ• Ð¼ÐµÐ½ÑÑ‚ÑŒ.**

```js
  const filteredGroups = useMemo(() => {
    if (!orderGroups) return [];

    return orderGroups.filter(group => {
      if (group.type === 'table') {
        // Ð‘2.1: Ð³Ñ€ÑƒÐ¿Ð¿Ð° Ð¿Ñ€Ð¸Ð½Ð°Ð´Ð»ÐµÐ¶Ð¸Ñ‚ Â«ÐÐºÑ‚Ð¸Ð²Ð½Ñ‹Ð¼Â» Ð¢ÐžÐ›Ð¬ÐšÐž ÐµÑÐ»Ð¸ ÐµÑ‘ sessionId ÑÐ¾Ð²Ð¿Ð°Ð´Ð°ÐµÑ‚ Ñ Ñ‚ÐµÐºÑƒÑ‰ÐµÐ¹
        // Ð¾Ñ‚ÐºÑ€Ñ‹Ñ‚Ð¾Ð¹ ÑÐµÑÑÐ¸ÐµÐ¹ Ð´Ð»Ñ ÑÑ‚Ð¾Ð»Ð°. Ð—Ð°ÐºÑ€Ñ‹Ñ‚Ñ‹Ðµ ÑÐµÑÑÐ¸Ð¸ (group.sessionId !== openId Ð¸Ð»Ð¸ no-session) â†’ Â«Ð—Ð°Ð²ÐµÑ€ÑˆÑ‘Ð½Ð½Ñ‹ÐµÂ».
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

âš ï¸ **Ð’Ð°Ð¶Ð½Ð¾:** `hasActiveRequest` Ð¿Ñ€Ð¾Ð´Ð¾Ð»Ð¶Ð°ÐµÑ‚ Ñ„Ð¸Ð»ÑŒÑ‚Ñ€Ð¾Ð²Ð°Ñ‚ÑŒ Ð¿Ð¾ `getLinkId(r.table) === group.id` (tableId). Ð­Ñ‚Ð¾ ÐºÐ¾Ñ€Ñ€ÐµÐºÑ‚Ð½Ð¾: ÐµÑÐ»Ð¸ Ñƒ ÑÑ‚Ð¾Ð»Ð° ÐµÑÑ‚ÑŒ request, Ð¾Ð½ Ð¿Ð¾ Fix B.1 ÑƒÐ¶Ðµ Ð¿Ñ€Ð¸ÐºÑ€ÐµÐ¿Ð»Ñ‘Ð½ Ðº compositeKey Ñ‚ÐµÐºÑƒÑ‰ÐµÐ¹ Ð¾Ñ‚ÐºÑ€Ñ‹Ñ‚Ð¾Ð¹ ÑÐµÑÑÐ¸Ð¸ â€” Ð·Ð½Ð°Ñ‡Ð¸Ñ‚ ÑÑ‚Ð° Ð³Ñ€ÑƒÐ¿Ð¿Ð° (Ñ `isCurrentOpenSession=true`) ÐµÐ³Ð¾ ÑƒÐ²Ð¸Ð´Ð¸Ñ‚; Ð·Ð°ÐºÑ€Ñ‹Ñ‚Ð°Ñ Ð³Ñ€ÑƒÐ¿Ð¿Ð° (Ñ `group.sessionId !== openId`) ÑƒÐ¶Ðµ Ð´Ñ€Ð¾Ð¿Ð½ÑƒÐ»Ð°ÑÑŒ Ð² `completed` Ð½Ð° Ñ€Ð°Ð½Ð½ÐµÐ¼ return.

**B.3 â€” `tabCounts` useMemo (~ÑÑ‚Ñ€Ð¾ÐºÐ¸ 3886-3908)**

Grep-ÑÐºÐ¾Ñ€ÑŒ: `const tabCounts = useMemo` (1 hit).

**Ð¢ÐµÐºÑƒÑ‰Ð¸Ð¹ ÐºÐ¾Ð´ (relevant Ñ‡Ð°ÑÑ‚ÑŒ):**
```js
    orderGroups.forEach(group => {
      if (group.type === 'table' && !openSessionByTableId[group.id]) {
        completed++;
        return;
      }
      ...
```

**[v4-M2] Ð—Ð°Ð¼ÐµÐ½Ð¸Ñ‚ÑŒ Ð’Ð•Ð¡Ð¬ Ð±Ð»Ð¾Ðº `const tabCounts = useMemo(...)` ÑÐ»ÐµÐ´ÑƒÑŽÑ‰Ð¸Ð¼ (Ð¾Ñ‚Ð»Ð¸Ñ‡Ð¸Ñ Ð¾Ñ‚ Ñ‚ÐµÐºÑƒÑ‰ÐµÐ³Ð¾: Ð¢ÐžÐ›Ð¬ÐšÐž Ð²Ð½ÑƒÑ‚Ñ€ÐµÐ½Ð½Ð¸Ð¹ `if (group.type === 'table' && !openSessionByTableId[group.id])` Ð±Ð»Ð¾Ðº â€” Ð·Ð°Ð¼ÐµÐ½Ñ‘Ð½ Ð½Ð° `isCurrentOpenSession` Ð¿Ñ€Ð¾Ð²ÐµÑ€ÐºÑƒ Ñ‡ÐµÑ€ÐµÐ· `group.sessionId`. ÐžÑÑ‚Ð°Ð»ÑŒÐ½Ð¾Ðµ â€” `hasActiveOrder`, `hasActiveRequest`, `hasServedButNotClosed`, Ð¸Ð½ÐºÑ€ÐµÐ¼ÐµÐ½Ñ‚ `active/completed`, return â€” Ð˜Ð”Ð•ÐÐ¢Ð˜Ð§ÐÐž Ð¾Ñ€Ð¸Ð³Ð¸Ð½Ð°Ð»Ñƒ. Deps array ÐÐ• Ð¼ÐµÐ½ÑÑ‚ÑŒ.**

```js
  // v2.7.1: Tab counts
  const tabCounts = useMemo(() => {
    if (!orderGroups) return { active: 0, completed: 0 };

    let active = 0, completed = 0;
    orderGroups.forEach(group => {
      if (group.type === 'table') {
        // Ð‘2.1: Ð³Ñ€ÑƒÐ¿Ð¿Ð° Ð¿Ñ€Ð¸Ð½Ð°Ð´Ð»ÐµÐ¶Ð¸Ñ‚ Â«Ð—Ð°Ð²ÐµÑ€ÑˆÑ‘Ð½Ð½Ñ‹Ð¼Â» ÐµÑÐ»Ð¸ ÑÑ‚Ð¾ ÐÐ• Ð³Ñ€ÑƒÐ¿Ð¿Ð° Ñ‚ÐµÐºÑƒÑ‰ÐµÐ¹ Ð¾Ñ‚ÐºÑ€Ñ‹Ñ‚Ð¾Ð¹ ÑÐµÑÑÐ¸Ð¸
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

**B.4 â€” Call-site updates Ð² OrderGroupCard map (~ÑÑ‚Ñ€Ð¾ÐºÐ¸ 4457-4486) â€” [v4-M3, v5-M2]**

Grep-ÑÐºÐ¾Ñ€ÑŒ: `v2SortedGroups.map(group => (` (1 hit). ÐœÐµÐ½ÑÐµÐ¼ Ð ÐžÐ’ÐÐž 4 ÑÑ‚Ñ€Ð¾ÐºÐ¸ props Ñ‡ÐµÑ€ÐµÐ· 4 Ð¾Ñ‚Ð´ÐµÐ»ÑŒÐ½Ñ‹Ñ… Edit.

âš ï¸ **[V5-M2] Pre-pinned counts** (Ð¸Ð· Pre-flight ÑˆÐ°Ð³ 4, ÑƒÐ±ÐµÐ´Ð¸ÑÑŒ Ñ‡Ñ‚Ð¾ ÑÐ¾Ð¾Ñ‚Ð²ÐµÑ‚ÑÑ‚Ð²ÑƒÐµÑ‚):
- `key={group.id}` â€” â‰¥1 hit (Ð¼Ð¾Ð¶ÐµÑ‚ Ð±Ñ‹Ñ‚ÑŒ Ð² Ð½ÐµÑÐºÐ¾Ð»ÑŒÐºÐ¸Ñ… map-Ð±Ð»Ð¾ÐºÐ°Ñ…; ÑÐ¼. context requirements Ð½Ð¸Ð¶Ðµ)
- `expandedGroupId === group.id` â€” Ð ÐžÐ’ÐÐž 1 hit (~4461)
- `onToggleExpand={() => handleToggleExpand(group.id)}` â€” Ð ÐžÐ’ÐÐž 1 hit (~4462)
- `isHighlighted={highlightGroupId === group.id}` â€” Ð ÐžÐ’ÐÐž 1 hit

Ð•ÑÐ»Ð¸ `key={group.id}` Ð´Ð°Ñ‘Ñ‚ >1 hit â€” ÑÑ‚Ð¾ Ð¾Ð¶Ð¸Ð´Ð°ÐµÐ¼Ð¾ (ÐµÑÑ‚ÑŒ Ð¾Ñ‚Ð´ÐµÐ»ÑŒÐ½Ñ‹Ð¹ map Ð´Ð»Ñ pickup/delivery OrderCard â€” ÐÐ• Ñ‚Ñ€Ð¾Ð³Ð°Ñ‚ÑŒ). Ð˜ÑÐ¿Ð¾Ð»ÑŒÐ·ÑƒÐµÐ¼ surrounding context Ñ‡Ñ‚Ð¾Ð±Ñ‹ Edit Ð·Ð°Ñ‚Ñ€Ð¾Ð½ÑƒÐ» Ñ‚Ð¾Ð»ÑŒÐºÐ¾ `v2SortedGroups.map` Ð±Ð»Ð¾Ðº.

âš ï¸ **Ð­Ñ‚Ð¸ 4 Edit'Ð° â€” ÐµÐ´Ð¸Ð½ÑÑ‚Ð²ÐµÐ½Ð½Ð¾Ðµ Ñ‡Ñ‚Ð¾ Ð¼ÐµÐ½ÑÐµÑ‚ÑÑ Ð² B.4. Ð’ÑÐµ Ð¾ÑÑ‚Ð°Ð»ÑŒÐ½Ñ‹Ðµ props Ð² ÑÑ‚Ð¾Ð¼ `<OrderGroupCard ... />` ÐÐ• Ð¢Ð ÐžÐ“ÐÐ¢Ð¬. ÐÐ¸ÐºÐ°ÐºÐ¸Ñ… `...` placeholder'Ð¾Ð² Ð² `new_string`.**

**Edit 1 â€” `key` (Ð¸ÑÐ¿Ð¾Ð»ÑŒÐ·ÑƒÐµÐ¼ ÐºÐ¾Ð½Ñ‚ÐµÐºÑÑ‚ Ð´Ð»Ñ disambiguation):**
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

**Edit 2 â€” `isExpanded` (ÐµÐ´Ð¸Ð½ÑÑ‚Ð²ÐµÐ½Ð½Ñ‹Ð¹ hit, ÑƒÐ½Ð¸ÐºÐ°Ð»ÐµÐ½):**
- old_string: `                  isExpanded={expandedGroupId === group.id}`
- new_string: `                  isExpanded={expandedGroupId === group.compositeKey}`

**Edit 3 â€” `onToggleExpand` (ÐµÐ´Ð¸Ð½ÑÑ‚Ð²ÐµÐ½Ð½Ñ‹Ð¹ hit, ÑƒÐ½Ð¸ÐºÐ°Ð»ÐµÐ½):**
- old_string: `                  onToggleExpand={() => handleToggleExpand(group.id)}`
- new_string: `                  onToggleExpand={() => handleToggleExpand(group.compositeKey)}`

**Edit 4 â€” `isHighlighted` (ÐµÐ´Ð¸Ð½ÑÑ‚Ð²ÐµÐ½Ð½Ñ‹Ð¹ hit, ÑƒÐ½Ð¸ÐºÐ°Ð»ÐµÐ½):**
- old_string: `                  isHighlighted={highlightGroupId === group.id}`
- new_string: `                  isHighlighted={highlightGroupId === group.compositeKey}`

**Ð˜Ð»Ð»ÑŽÑÑ‚Ñ€Ð°Ñ†Ð¸Ñ ÐºÐ¾Ð½Ñ‚ÐµÐºÑÑ‚Ð° (ÐÐ• ÐºÐ¾Ð¿Ð¸Ñ€Ð¾Ð²Ð°Ñ‚ÑŒ Ð² Edit â€” ÑÑ‚Ð¾ Ð´Ð»Ñ Ð¿Ð¾Ð½Ð¸Ð¼Ð°Ð½Ð¸Ñ, ÑÐ¼. Identifier Contract Ñ‚Ð°Ð±Ð»Ð¸Ñ†Ñƒ Ð²Ñ‹ÑˆÐµ):**
```jsx
              v2SortedGroups.map(group => (
                <OrderGroupCard
                  key={group.compositeKey}                                                /* CHANGED */
                  group={group}
                  isExpanded={expandedGroupId === group.compositeKey}                     /* CHANGED */
                  onToggleExpand={() => handleToggleExpand(group.compositeKey)}           /* CHANGED */
                  isHighlighted={highlightGroupId === group.compositeKey}                 /* CHANGED */
                  isFavorite={isFavorite(group.type === 'table' ? 'table' : 'order', group.id)} /* group.id â€” ÐÐ• Ð¼ÐµÐ½ÑÑ‚ÑŒ (tableId Ð´Ð»Ñ favorites) */
                  onToggleFavorite={toggleFavorite}                                       /* ÐÐ• Ð¼ÐµÐ½ÑÑ‚ÑŒ */
                  /* Ð¾ÑÑ‚Ð°Ð»ÑŒÐ½Ñ‹Ðµ props â€” onCloseTable, activeRequests, onBatchCloseRequestAsync Ð¸ Ð´Ñ€. â€” ÐÐ• Ð¼ÐµÐ½ÑÑ‚ÑŒ */
                />
              ))
```

âš ï¸ **ÐÐ• Ð¼ÐµÐ½ÑÑ‚ÑŒ (Ð¿Ð¾Ð²Ñ‚Ð¾Ñ€ Ð´Ð»Ñ Ð±ÐµÐ·Ð¾Ð¿Ð°ÑÐ½Ð¾ÑÑ‚Ð¸):**
- `isFavorite(...)` Ð²Ñ‹Ð·Ð¾Ð² â€” Ð¾ÑÑ‚Ð°Ñ‘Ñ‚ÑÑ Ð½Ð° `group.id` (tableId). Ð¤Ð°Ð²Ð¾Ñ€Ð¸Ñ‚Ñ‹ Ð´Ð¾Ð»Ð¶Ð½Ñ‹ Ð²Ñ‹Ð¶Ð¸Ð²Ð°Ñ‚ÑŒ ÑÐ¼ÐµÐ½Ñƒ ÑÐµÑÑÐ¸Ð¸.
- `onToggleFavorite` â€” Ð¾ÑÑ‚Ð°Ñ‘Ñ‚ÑÑ `toggleFavorite` Ð±ÐµÐ· wrapper'Ð° (ÑÐ¸Ð³Ð½Ð°Ñ‚ÑƒÑ€Ð° `(type, id)` Ð½Ðµ Ð¼ÐµÐ½ÑÐµÑ‚ÑÑ).
- ÐžÑÑ‚Ð°Ð»ÑŒÐ½Ñ‹Ðµ props (`onCloseTable`, `activeRequests`, `onBatchCloseRequestAsync`, etc.) â€” Ð½Ðµ Ñ‚Ñ€Ð¾Ð³Ð°Ñ‚ÑŒ.

**B.5 â€” `data-group-id` (live JSX only) â€” [v4-M4, v5-M1 ÐºÑ€Ð¸Ñ‚Ð¸Ñ‡Ð½Ð¾]**

[V5-M1] **Ð¢Ð¾Ð»ÑŒÐºÐ¾ 1 live JSX replacement Ð¾Ð±ÑÐ·Ð°Ñ‚ÐµÐ»ÐµÐ½. 2 Ð´Ñ€ÑƒÐ³Ð¸Ñ… â€” non-blocking commented snapshots.**

Pre-check (Ð¸Ð· Pre-flight Â§5) Ð´Ð¾Ð»Ð¶ÐµÐ½ Ð¿Ð¾Ð´Ñ‚Ð²ÐµÑ€Ð´Ð¸Ñ‚ÑŒ:
- `~2292` â€” live JSX Ð²Ð½ÑƒÑ‚Ñ€Ð¸ Ñ€ÐµÐ°Ð»ÑŒÐ½Ð¾Ð³Ð¾ OrderGroupCard root element (Ð¾Ð±ÑÐ·Ð°Ñ‚ÐµÐ»ÑŒÐ½Ð° Ð·Ð°Ð¼ÐµÐ½Ð°).
- `~565` Ð¸ `~1173` â€” Ð²Ð½ÑƒÑ‚Ñ€Ð¸ block-comment (`/* ... */` Ð¸Ð»Ð¸ JSX comment `{/* ... */}`). Ð—Ð°Ð¼ÐµÐ½Ð° non-blocking: Ð¼Ð¾Ð¶Ð½Ð¾ Ð»Ð¸Ð±Ð¾ Ð¿Ñ€Ð¾Ð¿ÑƒÑÑ‚Ð¸Ñ‚ÑŒ (safer), Ð»Ð¸Ð±Ð¾ Ð·Ð°Ð¼ÐµÐ½Ð¸Ñ‚ÑŒ Ð´Ð»Ñ ÐºÐ¾Ð½ÑÐ¸ÑÑ‚ÐµÐ½Ñ‚Ð½Ð¾ÑÑ‚Ð¸ (optional).

**Ð¡Ñ‚Ñ€Ð°Ñ‚ÐµÐ³Ð¸Ñ:**

**Ð¨Ð°Ð³ 1 â€” ÐžÐ‘Ð¯Ð—ÐÐ¢Ð•Ð›Ð¬ÐÐÐ¯ Ð·Ð°Ð¼ÐµÐ½Ð° live JSX (~2292):**

Ð¡Ð½Ð°Ñ‡Ð°Ð»Ð° Ð¿Ñ€Ð¾Ñ‡Ð¸Ñ‚Ð°Ñ‚ÑŒ Ñ‚Ð¾Ñ‡Ð½Ñ‹Ð¹ ÐºÐ¾Ð½Ñ‚ÐµÐºÑÑ‚:
```bash
sed -n '2285,2298p' "pages/StaffOrdersMobile/staffordersmobile.jsx"
# ÐžÐ¶Ð¸Ð´Ð°Ð½Ð¸Ðµ: JSX ÐºÐ¾Ð½Ñ‚ÐµÐºÑÑ‚ WITHOUT `/*` Ð¸Ð»Ð¸ `{/*` â€” ÑÑ‚Ð¾ live render.
# ÐšÐ»ÑŽÑ‡ÐµÐ²Ñ‹Ðµ Ð¼Ð°Ñ€ÐºÐµÑ€Ñ‹ ÑƒÐ½Ð¸ÐºÐ°Ð»ÑŒÐ½Ð¾ÑÑ‚Ð¸ (ÐžÐ¢Ð¡Ð£Ð¢Ð¡Ð¢Ð’Ð£Ð®Ð¢ Ð² ~565 Ð¸ ~1173):
#   - ÑÑ‚Ñ€Ð¾ÐºÐ° `highlightRing` Ð¸Ð»Ð¸ Ð¿ÐµÑ€ÐµÐ¼ÐµÐ½Ð½Ð°Ñ Ñ ÑÑ‚Ð¸Ð¼ Ð¸Ð¼ÐµÐ½ÐµÐ¼ (~2285-2292)
#   - ÐºÐ¾Ð½ÑÑ‚Ñ€ÑƒÐºÑ†Ð¸Ñ `return (` Ð² Ð¿Ñ€ÐµÐ´ÐµÐ»Ð°Ñ… 5 ÑÑ‚Ñ€Ð¾Ðº Ð´Ð¾ data-group-id
```

Edit pair (Ð—ÐÐŸÐžÐ›ÐÐ˜Ð¢Ð¬ Ñ‚Ð¾Ñ‡Ð½Ñ‹Ð¼Ð¸ ÑÑ‚Ñ€Ð¾ÐºÐ°Ð¼Ð¸ Ð¸Ð· sed-output Ð²Ñ‹ÑˆÐµ):

1. ÐŸÑ€Ð¾Ñ‡Ð¸Ñ‚Ð°Ñ‚ÑŒ Ð²Ñ‹Ð²Ð¾Ð´ `sed -n '2285,2298p'` Ð¸ Ð½Ð°Ð¹Ñ‚Ð¸ ÑƒÐ½Ð¸ÐºÐ°Ð»ÑŒÐ½Ñ‹Ð¹ Ð±Ð»Ð¾Ðº: ÑÑ‚Ñ€Ð¾ÐºÐ¸ Ð¾Ñ‚ `highlightRing`
   (Ð¸Ð»Ð¸ `return (`) Ð”Ðž Ð¸ Ð²ÐºÐ»ÑŽÑ‡Ð°Ñ `data-group-id={group.id}`.
2. Ð˜ÑÐ¿Ð¾Ð»ÑŒÐ·Ð¾Ð²Ð°Ñ‚ÑŒ ÑÑ‚Ð¸ 3-5 ÑÑ‚Ñ€Ð¾Ðº ÐºÐ°Ðº `old_string` â€” Ð²ÐºÐ»ÑŽÑ‡Ð°Ñ `highlightRing` Ð¿ÐµÑ€ÐµÐ¼ÐµÐ½Ð½ÑƒÑŽ Ð¸Ð»Ð¸ `return (`
   ÐºÐ°Ðº Ð¿ÐµÑ€Ð²ÑƒÑŽ ÑÑ‚Ñ€Ð¾ÐºÑƒ (ÑÑ‚Ð¾ Ð´ÐµÐ»Ð°ÐµÑ‚ anchor ÑƒÐ½Ð¸ÐºÐ°Ð»ÑŒÐ½Ñ‹Ð¼: Ñ‚Ð°ÐºÐ¸Ñ… ÑÑ‚Ñ€Ð¾Ðº Ð½ÐµÑ‚ Ð² ~565/~1173 comments).
3. `new_string` â€” Ñ‚Ðµ Ð¶Ðµ ÑÑ‚Ñ€Ð¾ÐºÐ¸ Ñ ÐµÐ´Ð¸Ð½ÑÑ‚Ð²ÐµÐ½Ð½Ð¾Ð¹ Ð·Ð°Ð¼ÐµÐ½Ð¾Ð¹ `data-group-id={group.id}` â†’ `data-group-id={group.compositeKey}`.

ÐžÐ¶Ð¸Ð´Ð°ÐµÐ¼Ñ‹Ð¹ Ð²Ð¸Ð´ (Ñ‚Ð¾Ñ‡Ð½Ñ‹Ðµ ÑÑ‚Ñ€Ð¾ÐºÐ¸ Ð·Ð°Ð¼ÐµÐ½Ð¸Ñ‚ÑŒ Ð¸Ð· sed-output):
```jsx
  // old_string Ð¿Ñ€Ð¸Ð¼ÐµÑ€ (Ð²Ð·ÑÑ‚ÑŒ Ñ‚Ð¾Ñ‡Ð½Ñ‹Ð¹ Ñ‚ÐµÐºÑÑ‚ Ð¸Ð· sed â€” ÐÐ• ÐºÐ¾Ð¿Ð¸Ñ€Ð¾Ð²Ð°Ñ‚ÑŒ ÑÑ‚Ð¾Ñ‚ ÑˆÐ°Ð±Ð»Ð¾Ð½):
  const highlightRing = highlightGroupId === group.compositeKey;
  return (
    <div
      data-group-id={group.id}
```
```jsx
  // new_string (Ñ‚Ð° Ð¶Ðµ ÑÑ‚Ñ€ÑƒÐºÑ‚ÑƒÑ€Ð°, Ñ‚Ð¾Ð»ÑŒÐºÐ¾ data-group-id Ð·Ð°Ð¼ÐµÐ½Ñ‘Ð½):
  const highlightRing = highlightGroupId === group.compositeKey;
  return (
    <div
      data-group-id={group.compositeKey}
```

âš ï¸ **ÐÐ• Ð¸ÑÐ¿Ð¾Ð»ÑŒÐ·Ð¾Ð²Ð°Ñ‚ÑŒ `data-group-id={group.id}` ÐºÐ°Ðº ÐµÐ´Ð¸Ð½ÑÑ‚Ð²ÐµÐ½Ð½ÑƒÑŽ ÑÑ‚Ñ€Ð¾ÐºÑƒ old_string** â€” ÑÑ‚Ð¾ Ð¼Ð¾Ð¶ÐµÑ‚ ÑÐ¾Ð²Ð¿Ð°ÑÑ‚ÑŒ Ñ block-comments @ ~565 / ~1173. Ð’ÑÐµÐ³Ð´Ð° Ð²ÐºÐ»ÑŽÑ‡Ð°Ñ‚ÑŒ `highlightRing` Ð¸Ð»Ð¸ `return (` ÑÑ‚Ñ€Ð¾ÐºÑƒ Ð”Ðž `data-group-id` Ð´Ð»Ñ Ð¾Ð´Ð½Ð¾Ð·Ð½Ð°Ñ‡Ð½Ð¾Ð¹ Ð¸Ð´ÐµÐ½Ñ‚Ð¸Ñ„Ð¸ÐºÐ°Ñ†Ð¸Ð¸.

**Ð¨Ð°Ð³ 2 â€” OPTIONAL Ð·Ð°Ð¼ÐµÐ½Ð° comment-only snapshots (~565, ~1173):**

Ð­Ñ‚Ð¸ hits Ð² block-comments (Ð¸ÑÑ‚Ð¾Ñ€Ð¸Ñ‡ÐµÑÐºÐ¸Ðµ snapshots/docstrings). Ð ÐµÐ½Ð´ÐµÑ€ DOM Ð½Ðµ Ð·Ð°Ñ‚Ñ€Ð°Ð³Ð¸Ð²Ð°ÑŽÑ‚. Ð—Ð°Ð¼ÐµÐ½Ñƒ Ð²Ñ‹Ð¿Ð¾Ð»Ð½ÑÑ‚ÑŒ **Ñ‚Ð¾Ð»ÑŒÐºÐ¾ ÐµÑÐ»Ð¸ Ð¾ÑÑ‚Ð°Ð»ÑŒÐ½Ñ‹Ðµ Fix Ð¿Ñ€Ð¾ÑˆÐ»Ð¸ Ð±ÐµÐ· Ð¾ÑˆÐ¸Ð±Ð¾Ðº** Ð¸ ÐµÑÑ‚ÑŒ Ð±ÑŽÐ´Ð¶ÐµÑ‚ Ð²Ñ€ÐµÐ¼ÐµÐ½Ð¸. Non-blocking. Ð•ÑÐ»Ð¸ Ð¿Ñ€Ð¾Ð¿ÑƒÑÐºÐ°ÐµÐ¼ â€” Ð·Ð°Ð¿Ð¸ÑÐ°Ñ‚ÑŒ Ð² ÐºÐ¾Ð¼Ð¼Ð¸Ñ‚Ðµ `/* v5-M1: commented snapshots @ 565, 1173 preserved as legacy docs */`.

**Verification B.5 (Ð¿Ð¾ÑÑ‚-Ñ„Ð¸ÐºÑ):**
```bash
# Live JSX Ð·Ð°Ð¼ÐµÐ½Ñ‘Ð½ (Ð¾Ð±ÑÐ·Ð°Ñ‚ÐµÐ»ÑŒÐ½Ð¾)
grep -c "data-group-id={group.compositeKey}" "pages/StaffOrdersMobile/staffordersmobile.jsx"
# ÐžÐ¶Ð¸Ð´Ð°Ð½Ð¸Ðµ: â‰¥1 (ÐµÑÐ»Ð¸ Ð¿Ñ€Ð¾Ð¿ÑƒÑÑ‚Ð¸Ð»Ð¸ comments) Ð¸Ð»Ð¸ =3 (ÐµÑÐ»Ð¸ Ð·Ð°Ð¼ÐµÐ½Ð¸Ð»Ð¸ Ð²ÑÑ‘).

# Ð¡Ñ‚Ð°Ñ€Ñ‹Ð¹ Ð°Ñ‚Ñ€Ð¸Ð±ÑƒÑ‚ data-group-id={group.id} â€” 0 Ð’ÐÐ• comments:
#   Ð•ÑÐ»Ð¸ Ñ€ÐµÑˆÐ¸Ð»Ð¸ Ð½Ðµ Ñ‚Ñ€Ð¾Ð³Ð°Ñ‚ÑŒ comments â†’ ÑÑ‚Ð°Ñ€Ñ‹Ðµ 2 hits Ð¾ÑÑ‚Ð°Ð½ÑƒÑ‚ÑÑ Ð² comments (OK).
#   [v5-L4] Loose regex â€” Ð´Ð¾Ð¿ÑƒÑÐºÐ°ÐµÑ‚ optional spaces Ð²Ð¾ÐºÑ€ÑƒÐ³ group.compositeKey (formatter-tolerant):
grep -cE "data-group-id=\{ *group\.compositeKey *\}" "pages/StaffOrdersMobile/staffordersmobile.jsx"
# ÐžÐ¶Ð¸Ð´Ð°Ð½Ð¸Ðµ: â‰¥1 (Ñ„Ð¾Ñ€Ð¼Ð°Ñ‚ live JSX Ð¼Ð¾Ð¶ÐµÑ‚ Ð¼ÐµÐ½ÑÑ‚ÑŒÑÑ Ð¿Ð¾ÑÐ»Ðµ Ñ„Ð¾Ñ€Ð¼attÐµÑ€Ð°).

# ÐšÐ Ð˜Ð¢Ð˜Ð§ÐÐž: live JSX @ ~2292 Ð¾Ð±ÑÐ·Ð°Ñ‚ÐµÐ»ÑŒÐ½Ð¾ Ð½Ð° compositeKey:
sed -n '2285,2298p' "pages/StaffOrdersMobile/staffordersmobile.jsx" | grep -c "compositeKey"
# ÐžÐ¶Ð¸Ð´Ð°Ð½Ð¸Ðµ: 1 hit.
```

âš ï¸ ÐšÐ Ð˜Ð¢Ð˜Ð§ÐÐž: `handleBannerNavigate` Ð¸ÑÐ¿Ð¾Ð»ÑŒÐ·ÑƒÐµÑ‚ ÑÐµÐ»ÐµÐºÑ‚Ð¾Ñ€ `[data-group-id="${CSS.escape(String(targetKey))}"]`. Ð•ÑÐ»Ð¸ LIVE `data-group-id` (@~2292) Ð¾ÑÑ‚Ð°Ð½ÐµÑ‚ÑÑ Ð½Ð° `group.id`, Ð±Ð°Ð½Ð½ÐµÑ€ Ð±ÑƒÐ´ÐµÑ‚ ÑÐºÑ€Ð¾Ð»Ð»Ð¸Ñ‚ÑŒ Ðº Ð¿ÐµÑ€Ð²Ð¾Ð¹ ÑÐ»ÑƒÑ‡Ð°Ð¹Ð½Ð¾Ð¹ ÐºÐ°Ñ€Ñ‚Ð¾Ñ‡ÐºÐµ (React key conflict + Ð½ÐµÐ¿Ñ€Ð°Ð²Ð¸Ð»ÑŒÐ½Ñ‹Ð¹ DOM selector). Commented hits Ð½Ð° Ñ€ÐµÐ½Ð´ÐµÑ€ ÐÐ• Ð²Ð»Ð¸ÑÑŽÑ‚.

**B.6 â€” `handleBannerNavigate` Ð¾Ð±Ð½Ð¾Ð²Ð¸Ñ‚ÑŒ Ð´Ð»Ñ compositeKey (~ÑÑ‚Ñ€Ð¾ÐºÐ° 4142) â€” [V5-L3]**

Grep-ÑÐºÐ¾Ñ€ÑŒ: `const handleBannerNavigate = useCallback` (1 hit, Ð¾Ð±ÑŠÑÐ²Ð»ÐµÐ½Ð¸Ðµ @ ~4142). Call-site: `onNavigate={handleBannerNavigate}` @ ~4610. Upstream: `onNavigate(banner.groupId)` @ ~2825, Ð³Ð´Ðµ `banner.groupId = tableId` Ð¸Ð· `buildBannerInfo @ ~4079-4090`.

**Ð¢ÐµÐºÑƒÑ‰Ð¸Ð¹ ÐºÐ¾Ð´:**
```js
  const handleBannerNavigate = useCallback((groupId) => {
    if (!groupId) return;
    setExpandedGroupId(groupId);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const el = document.querySelector(`[data-group-id="${CSS.escape(String(groupId))}"]`);
        ...
```

**[v3: M1] â€” Ð˜ÑÐ¿Ð¾Ð»ÑŒÐ·ÑƒÐµÐ¼ defensive Ñ€ÐµÐ°Ð»Ð¸Ð·Ð°Ñ†Ð¸ÑŽ unconditionally** (CC review: "two alternatives with no decision rule â†’ pick defensive one").

ÐÐµÐ·Ð°Ð²Ð¸ÑÐ¸Ð¼Ð¾ Ð¾Ñ‚ Ñ‚Ð¾Ð³Ð¾, Ñ‡Ñ‚Ð¾ Ð¿ÐµÑ€ÐµÐ´Ð°Ñ‘Ñ‚ call-site (upstream Ð¿ÐµÑ€ÐµÐ´Ð°Ñ‘Ñ‚ Ð§Ð˜Ð¡Ð¢Ð«Ð™ `tableId` Ð¸Ð· `banner.groupId`) â€” defensive Ð²ÐµÑ€ÑÐ¸Ñ Ñ Ð¿Ñ€Ð¾Ð²ÐµÑ€ÐºÐ¾Ð¹ `__` Ð±ÐµÐ·Ð¾Ð¿Ð°ÑÐ½Ð° Ð´Ð»Ñ Ð¾Ð±Ð¾Ð¸Ñ… ÑÐ»ÑƒÑ‡Ð°ÐµÐ².

**Ð—Ð°Ð¼ÐµÐ½Ð¸Ñ‚ÑŒ Ð¦Ð•Ð›Ð˜ÐšÐžÐœ `handleBannerNavigate` useCallback:**
```js
  const handleBannerNavigate = useCallback((maybeTableIdOrCompositeKey) => {
    if (!maybeTableIdOrCompositeKey) return;

    // Ð‘2.1: ÐµÑÐ»Ð¸ Ð¿ÐµÑ€ÐµÐ´Ð°Ð½ tableId Ð±ÐµÐ· sessionId (current flow: banner.groupId = tableId) â€”
    // Ñ€ÐµÐ·Ð¾Ð»Ð²Ð¸Ð¼ Ðº compositeKey Ð¢Ð•ÐšÐ£Ð©Ð•Ð™ Ð¾Ñ‚ÐºÑ€Ñ‹Ñ‚Ð¾Ð¹ ÑÐµÑÑÐ¸Ð¸ ÑÑ‚Ð¾Ð³Ð¾ ÑÑ‚Ð¾Ð»Ð°.
    // Defensive: Ñ€Ð°Ð±Ð¾Ñ‚Ð°ÐµÑ‚ Ð¸ ÐºÐ¾Ð³Ð´Ð° caller ÑƒÐ¶Ðµ Ð¿ÐµÑ€ÐµÐ´Ð°Ñ‘Ñ‚ compositeKey (ÑÐ¾Ð´ÐµÑ€Ð¶Ð¸Ñ‚ '__').
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

âš ï¸ Ð”Ð¾Ð±Ð°Ð²Ð¸Ñ‚ÑŒ `openSessionByTableId` Ð² dependency array useCallback (Ð½Ð¾Ð²Ð°Ñ Ð·Ð°Ð²Ð¸ÑÐ¸Ð¼Ð¾ÑÑ‚ÑŒ).

**[V5-L3] Note Ð¿Ñ€Ð¾ identity churn:** ÐÐ¾Ð²Ñ‹Ð¹ dep `openSessionByTableId` Ð¿ÐµÑ€ÐµÑÑ‡Ð¸Ñ‚Ñ‹Ð²Ð°ÐµÑ‚ÑÑ ÐºÐ°Ð¶Ð´Ñ‹Ð¹ refetch `openSessions` query (ÐºÐ°Ð¶Ð´Ñ‹Ðµ ~5s Ð¿Ð¾ÑÐ»Ðµ Fix A). Ð­Ñ‚Ð¾ Ð·Ð½Ð°Ñ‡Ð¸Ñ‚ `handleBannerNavigate` Ð¿Ð¾Ð»ÑƒÑ‡Ð¸Ñ‚ **Ð½Ð¾Ð²ÑƒÑŽ identity Ð¿Ñ€Ð¸ ÐºÐ°Ð¶Ð´Ð¾Ð¼ refetch** â€” ÐµÑÐ»Ð¸ bannerComponent Ð¾Ð±Ñ‘Ñ€Ð½ÑƒÑ‚ Ð² `memo` Ñ shallow prop comparison, Ð¾Ð½ Ð±ÑƒÐ´ÐµÑ‚ Ñ€Ðµ-Ñ€ÐµÐ½Ð´ÐµÑ€Ð¸Ñ‚ÑŒÑÑ ÐºÐ°Ð¶Ð´Ñ‹Ðµ 5 ÑÐµÐºÑƒÐ½Ð´.

Impact: **ÐºÐ¾ÑÐ¼ÐµÑ‚Ð¸Ñ‡ÐµÑÐºÐ¸Ð¹** â€” banner Ñ€ÐµÐ½Ð´ÐµÑ€ Ð»Ñ‘Ð³ÐºÐ¸Ð¹ (alert + ÐºÐ½Ð¾Ð¿ÐºÐ°), CPU cost Ð½Ð¸Ñ‡Ñ‚Ð¾Ð¶ÐµÐ½. ÐÐµ Ñ‚Ñ€ÐµÐ±ÑƒÐµÑ‚ Ð¼ÐµÐ¼Ð¾Ð¸Ð·Ð°Ñ†Ð¸Ð¸ `openSessionByTableId` Ð¸Ð»Ð¸ wrapper-hook. ÐŸÑ€Ð¸Ð½Ð¸Ð¼Ð°ÐµÐ¼Ð¾ ÐºÐ°Ðº trade-off Ð·Ð° fresh session info Ð² banner navigation.

**B.7 â€” `confirmCloseTable` Ð¾Ñ‡Ð¸ÑÑ‚ÐºÐ° expanded (~ÑÑ‚Ñ€Ð¾ÐºÐ° 4190)**

Grep-ÑÐºÐ¾Ñ€ÑŒ: `setExpandedGroupId(null); // Collapse expanded card` (1 hit). Ð¡Ñ‚Ñ€Ð¾ÐºÐ° ÐžÐš ÐºÐ°Ðº ÐµÑÑ‚ÑŒ â€” ÑƒÑÑ‚Ð°Ð½Ð°Ð²Ð»Ð¸Ð²Ð°ÐµÑ‚ `null`, Ð½Ð¸ÐºÐ°ÐºÐ¸Ñ… ÑÑÑ‹Ð»Ð¾Ðº Ð½Ð° ID. **ÐÐµ Ð¼ÐµÐ½ÑÑ‚ÑŒ.**

### Should NOT (Ð´Ð»Ñ Fix B Ñ†ÐµÐ»Ð¸ÐºÐ¾Ð¼) â€” [v4-L4: `onCloseTable` = prop, `handleCloseTable` = handler â€” Ð²ÐµÐ·Ð´Ðµ Ð½Ð¸Ð¶Ðµ Ð¸ÑÐ¿Ð¾Ð»ÑŒÐ·ÑƒÐµÐ¼ `onCloseTable` ÐºÐ°Ðº Ð¸Ð¼Ñ ÐºÐ¾Ð½Ñ‚Ñ€Ð°ÐºÑ‚Ð°]
- ÐÐ• Ð¼ÐµÐ½ÑÑ‚ÑŒ OrderGroupCard ÐºÐ¾Ð¼Ð¿Ð¾Ð½ÐµÐ½Ñ‚ (Ñ‚Ð¾Ð»ÑŒÐºÐ¾ Ð¿Ñ€Ð¾Ð¿ÑÑ‹).
- ÐÐ• Ð¼ÐµÐ½ÑÑ‚ÑŒ `favorites` Ð¼Ð°ÑÑÐ¸Ð² / `toggleFavorite` / `isFavorite` ÑÐ¸Ð³Ð½Ð°Ñ‚ÑƒÑ€Ñƒ. Favorites Ð¾ÑÑ‚Ð°ÑŽÑ‚ÑÑ Ð¿Ñ€Ð¸Ð²ÑÐ·Ð°Ð½Ñ‹ Ðº tableId.
- ÐÐ• Ð¼ÐµÐ½ÑÑ‚ÑŒ `["servedOrders", group.id]` queryKey â€” tableId Ð½ÑƒÐ¶ÐµÐ½ Ð´Ð»Ñ ÐºÐ¾Ñ€Ñ€ÐµÐºÑ‚Ð½Ð¾Ð³Ð¾ filter Ð¿Ð¾ B44.
- ÐÐ• Ð¼ÐµÐ½ÑÑ‚ÑŒ `onCloseTable(sessionId, identifier, tableId)` ÐºÐ¾Ð½Ñ‚Ñ€Ð°ÐºÑ‚ (FROZEN UX: Ð¿Ñ€Ð¾Ð¿Ñ OrderGroupCard'Ð°; Ð²Ð½ÑƒÑ‚Ñ€Ð¸ Ð¼Ð°Ð¿Ð¿Ð¸Ñ‚ÑÑ Ð½Ð° handler `handleCloseTable` Ñ€Ð¾Ð´Ð¸Ñ‚ÐµÐ»Ñ Ñ‡ÐµÑ€ÐµÐ· `group.openSessionId` + `group.displayName` + `group.id`).
- ÐÐ• Ñ‚Ñ€Ð¾Ð³Ð°Ñ‚ÑŒ `handleCloseTableClick` useCallback Ð²Ð½ÑƒÑ‚Ñ€Ð¸ OrderGroupCard (~2164-2177).
- ÐÐ• Ñ‚Ñ€Ð¾Ð³Ð°Ñ‚ÑŒ pickup/delivery Ð²ÐµÑ‚ÐºÑƒ Ð² `orderGroups` (Ð¸Ñ… compositeKey ÑƒÐ¶Ðµ ÑƒÐ½Ð¸ÐºÐ°Ð»ÐµÐ½ Ñ‡ÐµÑ€ÐµÐ· `o.id`).
- ÐÐ• Ñ‚Ñ€Ð¾Ð³Ð°Ñ‚ÑŒ `buildBannerInfo` @ ~4079-4090 Ð¸Ð»Ð¸ `onNavigate(banner.groupId)` @ ~2825 (upstream: Fix B.6 Ð¾Ð±Ñ€Ð°Ð±Ð°Ñ‚Ñ‹Ð²Ð°ÐµÑ‚ tableId Ñ‡ÐµÑ€ÐµÐ· defensive Ñ€ÐµÐ·Ð¾Ð»Ð²). [V5-L6]
- ÐÐ• Ð´Ð¾Ð±Ð°Ð²Ð»ÑÑ‚ÑŒ Ð½Ð¾Ð²Ñ‹Ðµ state/hooks/queries.

### Ð¡Ð²ÑÐ·Ð¸ Ð¼ÐµÐ¶Ð´Ñƒ Fix'Ð°Ð¼Ð¸
âš ï¸ **Fix B.1 ÑÐ¾Ð·Ð´Ð°Ñ‘Ñ‚ Ð¿Ð¾Ð»Ðµ `group.sessionId`**, ÐºÐ¾Ñ‚Ð¾Ñ€Ð¾Ðµ:
- Ð¸ÑÐ¿Ð¾Ð»ÑŒÐ·ÑƒÐµÑ‚ÑÑ Ð² Fix B.2 (`filteredGroups`) Ð¸ Fix B.3 (`tabCounts`) Ð´Ð»Ñ Ð¾Ð¿Ñ€ÐµÐ´ÐµÐ»ÐµÐ½Ð¸Ñ Ñ‚Ð°Ð±Ð°
- Ð¸ÑÐ¿Ð¾Ð»ÑŒÐ·ÑƒÐµÑ‚ÑÑ Ð² Fix C (Ð½Ð¸Ð¶Ðµ) Ð´Ð»Ñ Ð´ÐµÑ‚ÐµÐºÑ‚Ð¸Ñ€Ð¾Ð²Ð°Ð½Ð¸Ñ orphan orders
Ð•ÑÐ»Ð¸ Fix B.1 Ð¿Ð°Ð´Ð°ÐµÑ‚ â€” Fix B.2, B.3 Ð¸ Fix C Ñ‚Ð¾Ð¶Ðµ Ð½ÐµÐ»ÑŒÐ·Ñ Ð¿Ñ€Ð¸Ð¼ÐµÐ½ÑÑ‚ÑŒ.

### Verification Ð¿Ð¾ÑÐ»Ðµ Fix B (Ð’Ð¡Ð• ÐºÐ¾Ð¼Ð°Ð½Ð´Ñ‹ Ð´Ð¾Ð»Ð¶Ð½Ñ‹ Ð¿Ñ€Ð¾Ð¹Ñ‚Ð¸)

```bash
# 1. compositeKey Ð¿Ð¾ÑÐ²Ð¸Ð»ÑÑ Ð²ÐµÐ·Ð´Ðµ Ð³Ð´Ðµ Ð½ÑƒÐ¶Ð½Ð¾ (â‰¥5 occurrences: 1 key + 1 isExpanded + 1 onToggleExpand + 1 isHighlighted + 1-3 data-group-id)
grep -c "compositeKey" "pages/StaffOrdersMobile/staffordersmobile.jsx"
# ÐžÐ¶Ð¸Ð´Ð°Ð½Ð¸Ðµ: â‰¥5 (4 call-sites B.4 + 1 Ð¾Ð±ÑÐ·Ð°Ñ‚ÐµÐ»ÑŒÐ½Ñ‹Ð¹ data-group-id @ ~2292 + N Ð² orderGroups Ñ‚ÐµÐ»Ð¾).

# 2. Ð¡Ñ‚Ð°Ñ€Ð°Ñ Ð¾Ð´Ð¸Ð½Ð¾Ñ‡Ð½Ð°Ñ Ð³Ñ€ÑƒÐ¿Ð¿Ð¸Ñ€Ð¾Ð²ÐºÐ° ÑƒÐ±Ñ€Ð°Ð½Ð°
grep -n "tableGroups\[tableId\]" "pages/StaffOrdersMobile/staffordersmobile.jsx"
# ÐžÐ¶Ð¸Ð´Ð°Ð½Ð¸Ðµ: 0 hits (Ð²ÑÑ‘ Ð·Ð°Ð¼ÐµÐ½ÐµÐ½Ð¾ Ð½Ð° tableGroups[compositeKey]).

# 3. Ð¡Ñ‚Ð°Ñ€Ð¾Ðµ ÑƒÑÐ»Ð¾Ð²Ð¸Ðµ Ð² filteredGroups ÑƒÐ±Ñ€Ð°Ð½Ð¾
grep -n "hasOpenSession = !!openSessionByTableId\[group.id\]" "pages/StaffOrdersMobile/staffordersmobile.jsx"
# ÐžÐ¶Ð¸Ð´Ð°Ð½Ð¸Ðµ: 0 hits.

# 4. ÐÐ¾Ð²Ð¾Ðµ ÑƒÑÐ»Ð¾Ð²Ð¸Ðµ Ð¿Ñ€Ð¸ÑÑƒÑ‚ÑÑ‚Ð²ÑƒÐµÑ‚
grep -c "isCurrentOpenSession" "pages/StaffOrdersMobile/staffordersmobile.jsx"
# ÐžÐ¶Ð¸Ð´Ð°Ð½Ð¸Ðµ: 2 hits (filteredGroups + tabCounts).

# 5. Ð¡Ñ‚Ð°Ñ€Ñ‹Ð¹ key={group.id} Ð²Ð½ÑƒÑ‚Ñ€Ð¸ v2SortedGroups.map ÑƒÐ±Ñ€Ð°Ð½
sed -n '4455,4490p' "pages/StaffOrdersMobile/staffordersmobile.jsx" | grep -c "key={group.id}"
# ÐžÐ¶Ð¸Ð´Ð°Ð½Ð¸Ðµ: 0 hits Ð² ÑÑ‚Ð¾Ð¼ Ð´Ð¸Ð°Ð¿Ð°Ð·Ð¾Ð½Ðµ.

# 6. [v5-L4] Live data-group-id @ ~2292 Ð¸ÑÐ¿Ð¾Ð»ÑŒÐ·ÑƒÐµÑ‚ compositeKey (loose regex â€” formatter-tolerant)
sed -n '2285,2298p' "pages/StaffOrdersMobile/staffordersmobile.jsx" | grep -cE "data-group-id=\{ *group\.compositeKey *\}"
# ÐžÐ¶Ð¸Ð´Ð°Ð½Ð¸Ðµ: 1 hit.

# 7. isFavorite Ð¿Ð¾-Ð¿Ñ€ÐµÐ¶Ð½ÐµÐ¼Ñƒ Ð¸ÑÐ¿Ð¾Ð»ÑŒÐ·ÑƒÐµÑ‚ group.id â€” Ð¿Ñ€Ð¾Ð²ÐµÑ€ÐºÐ° Ñ‡Ñ‚Ð¾ ÐÐ• ÑÐ»Ð¾Ð¼Ð°Ð»Ð¸
grep -n "isFavorite(group.type === 'table' ? 'table' : 'order', group.id)" "pages/StaffOrdersMobile/staffordersmobile.jsx"
# ÐžÐ¶Ð¸Ð´Ð°Ð½Ð¸Ðµ: â‰¥1 hit (ÑÐ¸Ð³Ð½Ð°Ñ‚ÑƒÑ€Ð° ÑÐ¾Ñ…Ñ€Ð°Ð½ÐµÐ½Ð°).

# 8. ÐžÐ±Ñ‰ÐµÐµ Ñ‡Ð¸ÑÐ»Ð¾ ÑÑ‚Ñ€Ð¾Ðº Ñ„Ð°Ð¹Ð»Ð° (Ð¿Ñ€Ð¸Ð¼ÐµÑ€Ð½Ð¾Ðµ)
wc -l "pages/StaffOrdersMobile/staffordersmobile.jsx"
# ÐžÐ¶Ð¸Ð´Ð°Ð½Ð¸Ðµ: 4582 â‰¤ wc-l â‰¤ 4687 (base 4617, +70 max Ð¾Ñ‚ Ð½Ð¾Ð²Ñ‹Ñ… ÑÑ‚Ñ€Ð¾Ðº Fix B orderGroups + Fix C useEffect, -35 tolerance Ð·Ð° cleanup). [v5-M5: unambiguous]
```

---

## Fix C: Invalidate openSessions Ð¿Ñ€Ð¸ orphan-Ð·Ð°ÐºÐ°Ð·Ð°Ñ…

### Ð¡Ñ‚Ð°Ñ‚ÑƒÑ: [NEW CODE â€” performance optimization]
**ÐŸÑ€Ð¾Ð±Ð»ÐµÐ¼Ð°:** Ð”Ð°Ð¶Ðµ Ñ Fix A (staleTime 5s) Ð¾ÑÑ‚Ð°Ñ‘Ñ‚ÑÑ Ð¾ÐºÐ½Ð¾ Ð´Ð¾ 5 ÑÐµÐºÑƒÐ½Ð´, ÐºÐ¾Ð³Ð´Ð° Ð½Ð¾Ð²Ñ‹Ð¹ Order ÑƒÐ¶Ðµ Ð² Ð‘Ð”, Ð½Ð¾ SOM ÐµÐ³Ð¾ Ð³Ñ€ÑƒÐ¿Ð¿Ð¸Ñ€ÑƒÐµÑ‚ Ð±ÐµÐ· Ð¾Ñ‚ÐºÑ€Ñ‹Ñ‚Ð¾Ð¹ ÑÐµÑÑÐ¸Ð¸. Ð•ÑÐ»Ð¸ Ð°ÐºÑ‚Ð¸Ð²Ð½Ð¾ Ð¿Ð¾Ð»Ð¸Ð½Ð³ `orders` Ñ€Ð°Ð½ÑŒÑˆÐµ Ñ‡ÐµÐ¼ `openSessions` â€” ÐºÐ°Ñ€Ñ‚Ð¾Ñ‡ÐºÐ° Ð¿Ð¾ÑÐ²Ð¸Ñ‚ÑÑ Ð² Â«Ð—Ð°Ð²ÐµÑ€ÑˆÑ‘Ð½Ð½Ñ‹Ñ…Â», Ð¿Ð¾Ñ‚Ð¾Ð¼ Â«Ð¿Ñ€Ñ‹Ð³Ð½ÐµÑ‚Â» Ð² Â«ÐÐºÑ‚Ð¸Ð²Ð½Ñ‹ÐµÂ». Fix C Ð´ÐµÑ‚ÐµÐºÑ‚Ð¸Ñ€ÑƒÐµÑ‚ Ñ‚Ð°ÐºÐ¸Ðµ orphan Orders Ð¸ Ð´ÐµÐ»Ð°ÐµÑ‚ Ð¿Ñ€Ð¸Ð½ÑƒÐ´Ð¸Ñ‚ÐµÐ»ÑŒÐ½Ñ‹Ð¹ invalidate `openSessions` â€” ÐºÐ°Ñ€Ñ‚Ð¾Ñ‡ÐºÐ° Ð¿Ð¾ÑÐ²Ð¸Ñ‚ÑÑ ÐºÐ¾Ñ€Ñ€ÐµÐºÑ‚Ð½Ð¾ ÑÑ€Ð°Ð·Ñƒ.

### Change

**[v5-C2] Pre-check Ð¿ÐµÑ€ÐµÐ´ Ð²ÑÑ‚Ð°Ð²ÐºÐ¾Ð¹ â€” Ñ€ÐµÐ°Ð»ÑŒÐ½Ñ‹Ð¹ `orders` alias:**

```bash
# Real anchor: `data: orders,` Ð²Ð½ÑƒÑ‚Ñ€Ð¸ useQuery destructure @ ~3497
grep -n "data: orders," "pages/StaffOrdersMobile/staffordersmobile.jsx"
# ÐžÐ¶Ð¸Ð´Ð°Ð½Ð¸Ðµ: 1 hit, ÑÑ‚Ñ€Ð¾ÐºÐ° ~3497, Ð²Ð½ÑƒÑ‚Ñ€Ð¸ useQuery({ queryKey: ["orders", partnerId], ... }).
# Ð­Ñ‚Ð¾ Ð¸ÑÑ‚Ð¾Ñ‡Ð½Ð¸Ðº `orders` â€” Ð¼Ð°ÑÑÐ¸Ð² Order entities Ð¸ÑÐ¿Ð¾Ð»ÑŒÐ·ÑƒÐµÐ¼Ñ‹Ð¹ Ð¿Ð¾ Ð²ÑÐµÐ¼Ñƒ ÐºÐ¾Ð¼Ð¿Ð¾Ð½ÐµÐ½Ñ‚Ñƒ.

grep -n 'queryKey: \["orders"' "pages/StaffOrdersMobile/staffordersmobile.jsx"
# ÐžÐ¶Ð¸Ð´Ð°Ð½Ð¸Ðµ: 1 hit, ÑÑ‚Ñ€Ð¾ÐºÐ° ~3494, Ð±Ð»Ð¾Ðº orders useQuery (Ð´Ð¸Ð°Ð¿Ð°Ð·Ð¾Ð½ ~3494-3512).

# âš ï¸ ÐÐ• Ð¸ÑÐ¿Ð¾Ð»ÑŒÐ·Ð¾Ð²Ð°Ñ‚ÑŒ pattern `^  const orders ` â€” Ð¾Ð½ Ð¼Ð°Ñ‚Ñ‡Ð¸Ñ‚ inner helper variable @ ~1130 (Ð½Ðµ Ñ‚Ð¾).
# Ð˜ÑÐ¿Ð¾Ð»ÑŒÐ·Ð¾Ð²Ð°Ñ‚ÑŒ `data: orders,` ÐºÐ°Ðº ÐµÐ´Ð¸Ð½ÑÑ‚Ð²ÐµÐ½Ð½Ñ‹Ð¹ ÑÐºÐ¾Ñ€ÑŒ Ð´Ð»Ñ Fix C.
```

**Placement:** Ð´Ð¾Ð±Ð°Ð²Ð¸Ñ‚ÑŒ ÐÐžÐ’Ð«Ð™ useEffect Ð¡Ð ÐÐ—Ð£ ÐŸÐžÐ¡Ð›Ð• Ð·Ð°ÐºÑ€Ñ‹Ð²Ð°ÑŽÑ‰ÐµÐ¹ `}, [openSessions]);` useMemo `openSessionByTableId` (ÑÑ‚Ñ€Ð¾ÐºÐ° ~3561). Grep-ÑÐºÐ¾Ñ€ÑŒ Ð´Ð»Ñ Ñ‚Ð¾Ñ‡Ð½Ð¾Ð³Ð¾ Ð¼ÐµÑÑ‚Ð°:

```bash
grep -n "openSessionByTableId = useMemo" "pages/StaffOrdersMobile/staffordersmobile.jsx"
# ÐžÐ¶Ð¸Ð´Ð°Ð½Ð¸Ðµ: 1 hit, ÑÑ‚Ñ€Ð¾ÐºÐ° ~3554. Ð’ÑÑ‚Ð°Ð²Ð¸Ñ‚ÑŒ useEffect ÑÑ€Ð°Ð·Ñƒ Ð¿Ð¾ÑÐ»Ðµ `}, [openSessions]);` ÑÑ‚Ð¾Ð³Ð¾ useMemo.
```

**Alternative anchor ÐµÑÐ»Ð¸ closing `}, [openSessions]);` Ð¸Ð¼ÐµÐµÑ‚ Ð½ÐµÑÑ‚Ð°Ð½Ð´Ð°Ñ€Ñ‚Ð½Ð¾Ðµ Ñ„Ð¾Ñ€Ð¼Ð°Ñ‚Ð¸Ñ€Ð¾Ð²Ð°Ð½Ð¸Ðµ (trailing comment / extra whitespace / multi-line deps):**
```bash
# ÐŸÑ€Ð¾Ñ‡Ð¸Ñ‚Ð°Ñ‚ÑŒ ~30 ÑÑ‚Ñ€Ð¾Ðº Ð½Ð°Ñ‡Ð¸Ð½Ð°Ñ Ñ openSessionByTableId useMemo
sed -n '3554,3585p' "pages/StaffOrdersMobile/staffordersmobile.jsx"
# ÐÐ°Ð¹Ñ‚Ð¸ Ð¿ÐµÑ€Ð²ÑƒÑŽ ÑÑ‚Ñ€Ð¾ÐºÑƒ Ð¿Ð¾ÑÐ»Ðµ Ð·Ð°ÐºÑ€Ñ‹Ð²Ð°ÑŽÑ‰ÐµÐ¹ `});` Ð¸Ð»Ð¸ `}, [openSessions]);` Ð¸ Ð´Ð¾ `const activeRequests`.
# Ð˜ÑÐ¿Ð¾Ð»ÑŒÐ·Ð¾Ð²Ð°Ñ‚ÑŒ Ð¿Ð¾ÑÐ»ÐµÐ´Ð½Ð¸Ðµ 2 ÑÑ‚Ñ€Ð¾ÐºÐ¸ ÑÑ‚Ð¾Ð³Ð¾ useMemo (Ñ ÑƒÐ½Ð¸ÐºÐ°Ð»ÑŒÐ½Ð¾Ð¹ Ñ‚Ð¾Ñ‡Ð½Ð¾ÑÑ‚ÑŒÑŽ) ÐºÐ°Ðº Edit-anchor.
```

ÐŸÑ€Ð¸Ñ‡Ð¸Ð½Ð° (PQ-099): useEffect Ð´Ð¾Ð»Ð¶ÐµÐ½ Ð±Ñ‹Ñ‚ÑŒ Ð¾Ð±ÑŠÑÐ²Ð»ÐµÐ½ Ð¿Ð¾ÑÐ»Ðµ Ð²ÑÐµÑ… useMemo/useCallback, Ð¾Ñ‚ ÐºÐ¾Ñ‚Ð¾Ñ€Ñ‹Ñ… Ð·Ð°Ð²Ð¸ÑÐ¸Ñ‚, Ð½Ð¾ Ð´Ð¾ `const activeRequests` (~3565).

**[v4-C1 + v4-M7] ÐÐ¾Ð²Ñ‹Ð¹ ÐºÐ¾Ð´ (Ð²ÑÑ‚Ð°Ð²Ð¸Ñ‚ÑŒ):**

```js
  // Ð‘2.1 Fix C: ÐµÑÐ»Ð¸ Ð¿Ð¾ÑÐ²Ð¸Ð»ÑÑ hall-Order Ñ table_session, Ð½Ð¾ openSessionByTableId
  // ÐµÑ‰Ñ‘ Ð½Ðµ Ð·Ð½Ð°ÐµÑ‚ Ð¾ Ð½ÐµÐ¹ (staleTime race) â€” Ð¿Ñ€Ð¸Ð½ÑƒÐ´Ð¸Ñ‚ÐµÐ»ÑŒÐ½Ð¾ Ð¾Ð±Ð½Ð¾Ð²Ð¸Ñ‚ÑŒ openSessions.
  // Ð­Ñ‚Ð¾ ÑƒÑÐºÐ¾Ñ€ÑÐµÑ‚ Ð¿Ð¾ÑÐ²Ð»ÐµÐ½Ð¸Ðµ ÐºÐ¾Ñ€Ñ€ÐµÐºÑ‚Ð½Ð¾Ð¹ ÐºÐ°Ñ€Ñ‚Ð¾Ñ‡ÐºÐ¸ Ð² Â«ÐÐºÑ‚Ð¸Ð²Ð½Ñ‹Ñ…Â» (Ð´Ð¾ 5Ñ â†’ <1Ñ).
  //
  // [v4-C1] FILTER: Ð¸ÑÐºÐ»ÑŽÑ‡Ð°ÐµÐ¼ orders ÑÐ¾ status 'closed'/'cancelled' â€” Ñƒ Ð½Ð¸Ñ… table_session
  // Ð¾ÑÑ‚Ð°Ñ‘Ñ‚ÑÑ (sessionHelpers.js:158-173), Ð½Ð¾ Ð¾Ð½Ð¸ ÐÐ• Ð´Ð¾Ð»Ð¶Ð½Ñ‹ Ñ‚Ñ€Ð¸Ð³Ð³ÐµÑ€Ð¸Ñ‚ÑŒ invalidate
  // (Ð¸Ð½Ð°Ñ‡Ðµ Ð´Ð»Ñ ÐºÐ°Ð¶Ð´Ð¾Ð³Ð¾ Ð·Ð°ÐºÑ€Ñ‹Ñ‚Ð¾Ð³Ð¾ hall-Ð·Ð°ÐºÐ°Ð·Ð° Ð±ÐµÐ· Ð¾Ñ‚ÐºÑ€Ñ‹Ñ‚Ð¾Ð¹ ÑÐµÑÑÐ¸Ð¸ invalidate ÑƒÐ¹Ð´Ñ‘Ñ‚
  // Ð² ÐºÐ°Ð¶Ð´Ð¾Ð¼ Ñ†Ð¸ÐºÐ»Ðµ polling â†’ Ð±ÐµÑÐºÐ¾Ð½ÐµÑ‡Ð½Ð°Ñ Ð½Ð°Ð³Ñ€ÑƒÐ·ÐºÐ° Ð½Ð° ÑÐµÑ€Ð²ÐµÑ€).
  //
  // [v4-M7] ONE-SHOT GUARD: Ð·Ð°Ð¿Ð¾Ð¼Ð¸Ð½Ð°ÐµÐ¼ Â«ÑƒÐ¶Ðµ Ð¸Ð½Ð²Ð°Ð»Ð¸Ð´Ð¸Ñ€Ð¾Ð²Ð°Ð»Ð¸ Ð´Ð»Ñ ÑÑ‚Ð¾Ð¹ ÐºÐ¾Ð¼Ð±Ð¸Ð½Ð°Ñ†Ð¸Ð¸ orphan-ÑÐ¸Ð³Ð½Ð°Ñ‚ÑƒÑ€Â»
  // Ñ‡ÐµÑ€ÐµÐ· useRef. Ð¡Ð¸Ð³Ð½Ð°Ñ‚ÑƒÑ€Ð° = Ð¾Ñ‚ÑÐ¾Ñ€Ñ‚Ð¸Ñ€Ð¾Ð²Ð°Ð½Ð½Ð°Ñ ÑÑ‚Ñ€Ð¾ÐºÐ° `tableId:sessionId,tableId:sessionId,...`.
  // ÐšÐ¾Ð³Ð´Ð° ÑÐ¸Ð³Ð½Ð°Ñ‚ÑƒÑ€Ð° Ð½Ðµ Ð¸Ð·Ð¼ÐµÐ½Ð¸Ð»Ð°ÑÑŒ â€” ÐÐ• Ð²Ñ‹Ð·Ñ‹Ð²Ð°ÐµÐ¼ invalidate Ð¿Ð¾Ð²Ñ‚Ð¾Ñ€Ð½Ð¾ (Ð´Ð¾Ð¿. Ð·Ð°Ñ‰Ð¸Ñ‚Ð° Ð¾Ñ‚ race
  // ÐµÑÐ»Ð¸ openSessions Ð¾Ð±Ð½Ð¾Ð²Ð¸Ð»ÑÑ, Ð½Ð¾ Ð²ÑÑ‘ ÐµÑ‰Ñ‘ Ð½Ðµ ÑÐ¾Ð´ÐµÑ€Ð¶Ð¸Ñ‚ Ð½Ð¾Ð²ÑƒÑŽ ÑÐµÑÑÐ¸ÑŽ).
  const orphanInvalidateSigRef = useRef(null);
  useEffect(() => {
    if (!Array.isArray(orders) || orders.length === 0) return;

    const orphanPairs = [];
    for (const o of orders) {
      if (o.order_type !== 'hall') continue;
      // [v4-C1] Ð·Ð°ÐºÑ€Ñ‹Ñ‚Ñ‹Ðµ/Ð¾Ñ‚Ð¼ÐµÐ½Ñ‘Ð½Ð½Ñ‹Ðµ orders Ð½Ðµ ÑÑ‡Ð¸Ñ‚Ð°ÑŽÑ‚ÑÑ orphan â€” Ð¾Ð½Ð¸ Ð¿Ñ€Ð¸Ð½Ð°Ð´Ð»ÐµÐ¶Ð°Ñ‚ Ð·Ð°Ð²ÐµÑ€ÑˆÑ‘Ð½Ð½Ð¾Ð¹ ÑÐµÑÑÐ¸Ð¸
      if (o.status === 'closed' || o.status === 'cancelled') continue;
      const tableId = getLinkId(o.table);
      if (!tableId) continue;
      const sessionId = getLinkId(o.table_session);
      if (!sessionId) continue;
      // Order ÑÑÑ‹Ð»Ð°ÐµÑ‚ÑÑ Ð½Ð° table_session, Ð½Ð¾ SOM Ð½Ðµ Ð²Ð¸Ð´Ð¸Ñ‚ ÑÑ‚Ñƒ ÑÐµÑÑÐ¸ÑŽ Ð² openSessions
      const open = openSessionByTableId[tableId];
      if (!open || open.id !== sessionId) {
        orphanPairs.push(`${tableId}:${sessionId}`);
      }
    }

    if (orphanPairs.length === 0) {
      // Reset signature ÐºÐ¾Ð³Ð´Ð° orphan'Ñ‹ Ð¸ÑÑ‡ÐµÐ·Ð»Ð¸ (Ð½Ð¾Ñ€Ð¼Ð°Ð»ÑŒÐ½Ð¾Ðµ ÑÐ¾ÑÑ‚Ð¾ÑÐ½Ð¸Ðµ) â€” Ð¿Ð¾Ð·Ð²Ð¾Ð»Ð¸Ñ‚
      // ÑÑ€Ð°Ð±Ð¾Ñ‚Ð°Ñ‚ÑŒ invalidate ÐµÑ‰Ñ‘ Ñ€Ð°Ð· ÐµÑÐ»Ð¸ Ð² Ð±ÑƒÐ´ÑƒÑ‰ÐµÐ¼ Ð¿Ð¾ÑÐ²Ð¸Ñ‚ÑÑ Ð½Ð¾Ð²Ñ‹Ð¹ orphan.
      orphanInvalidateSigRef.current = null;
      return;
    }

    // [v4-M7] one-shot guard: ÑƒÐ½Ð¸ÐºÐ°Ð»ÑŒÐ½Ð°Ñ Ð¿Ð¾Ð´Ð¿Ð¸ÑÑŒ Ñ‚ÐµÐºÑƒÑ‰ÐµÐ³Ð¾ Ð½Ð°Ð±Ð¾Ñ€Ð° orphan'Ð¾Ð²
    const signature = orphanPairs.sort().join(',');
    if (orphanInvalidateSigRef.current === signature) {
      // Ð£Ð¶Ðµ Ð¸Ð½Ð²Ð°Ð»Ð¸Ð´Ð¸Ñ€Ð¾Ð²Ð°Ð»Ð¸ Ð´Ð»Ñ ÑÑ‚Ð¾Ð¹ Ð¶Ðµ ÐºÐ¾Ð¼Ð±Ð¸Ð½Ð°Ñ†Ð¸Ð¸ â€” Ð½Ðµ Ð¿Ð¾Ð²Ñ‚Ð¾Ñ€ÑÐµÐ¼.
      return;
    }
    orphanInvalidateSigRef.current = signature;
    // [v5-C1] Prefix invalidate â€” Ð¼Ð°Ñ‚Ñ‡Ð¸Ñ‚ ["openSessions", partnerId] Ð´Ð»Ñ Ð»ÑŽÐ±Ð¾Ð³Ð¾ Ñ‚ÐµÐºÑƒÑ‰ÐµÐ³Ð¾ partnerId.
    queryClient.invalidateQueries({ queryKey: ["openSessions"] });
  }, [orders, openSessionByTableId, queryClient]);
```

**âš ï¸ Dependency array useEffect â€” Ð”ÐžÐ‘ÐÐ’Ð˜Ð¢Ð¬ Ñ‚Ð¾Ð»ÑŒÐºÐ¾ ÑÑ‚Ð¸ 3:** `orders`, `openSessionByTableId`, `queryClient`. ÐÐ• Ð²ÐºÐ»ÑŽÑ‡Ð°Ñ‚ÑŒ `getLinkId` (origin Ð¾Ð¿Ñ€ÐµÐ´ÐµÐ»Ñ‘Ð½ Ð² Preparation Step 2; ÐµÑÐ»Ð¸ Ð¾Ð½ component-scoped â€” Ð¾Ð±ÐµÑ€Ð½ÑƒÑ‚ÑŒ Ð² useCallback Ð¸ Ð´Ð¾Ð±Ð°Ð²Ð¸Ñ‚ÑŒ Ð² deps; ÐµÑÐ»Ð¸ imported â€” Ð¿Ñ€Ð¾Ð¿ÑƒÑÑ‚Ð¸Ñ‚ÑŒ, ÐºÐ°Ðº ÑÐµÐ¹Ñ‡Ð°Ñ).

**âš ï¸ [V5-M3] Pre-check Ð”Ðž Ð²ÑÑ‚Ð°Ð²ÐºÐ¸:** ÑƒÐ±ÐµÐ´Ð¸Ñ‚ÑŒÑÑ Ñ‡Ñ‚Ð¾ `queryClient` Ð² scope (Ð¸Ð· Preparation Â§3). Ð•ÑÐ»Ð¸ Ð¿ÐµÑ€ÐµÐ¼ÐµÐ½Ð½Ð°Ñ Ð½Ð°Ð·Ñ‹Ð²Ð°ÐµÑ‚ÑÑ Ð¸Ð½Ð°Ñ‡Ðµ â€” Ð·Ð°Ð¼ÐµÐ½Ð¸Ñ‚ÑŒ Ð² ÐºÐ¾Ð´Ðµ Fix C. Ð•ÑÐ»Ð¸ `useQueryClient()` Ð½Ðµ Ð²Ñ‹Ð·Ð²Ð°Ð½ â€” STOP.

**âš ï¸ [V5-L5] Imports:** ÑƒÐ±ÐµÐ´Ð¸Ñ‚ÑŒÑÑ Ñ‡Ñ‚Ð¾ `useRef` ÑƒÐ¶Ðµ Ð¸Ð¼Ð¿Ð¾Ñ€Ñ‚Ð¸Ñ€Ð¾Ð²Ð°Ð½ Ð¸Ð· 'react'. Pre-check (Ð¸Ð· Preparation Â§4) Ð´Ð°ÑÑ‚ hit-count. Ð•ÑÐ»Ð¸ Ð½ÑƒÐ¶Ð½Ð¾ Ð´Ð¾Ð±Ð°Ð²Ð¸Ñ‚ÑŒ â€” Ð½Ð°Ð¹Ñ‚Ð¸ react import line (Preparation Â§4 grep `from 'react'`) Ð¸ Ñ€Ð°ÑÑˆÐ¸Ñ€Ð¸Ñ‚ÑŒ ÑÐ¿Ð¸ÑÐ¾Ðº:

Single-line Ð²Ð°Ñ€Ð¸Ð°Ð½Ñ‚ (ÐµÑÐ»Ð¸ Ñ‚ÐµÐºÑƒÑ‰Ð°Ñ Ñ„Ð¾Ñ€Ð¼Ð° Ñ‚Ð°ÐºÐ°Ñ):
- old_string: `import { useState, useEffect, useMemo, useCallback } from 'react';`
- new_string: `import { useState, useEffect, useMemo, useCallback, useRef } from 'react';`

Multi-line Ð²Ð°Ñ€Ð¸Ð°Ð½Ñ‚ (ÐµÑÐ»Ð¸ multi-line import) â€” Ð¸ÑÐ¿Ð¾Ð»ÑŒÐ·Ð¾Ð²Ð°Ñ‚ÑŒ Ñ‚Ð¾Ñ‡Ð½Ñ‹Ð¹ snippet Ð¸Ð· `grep -n "from 'react'"` + `sed -n` ÐºÐ¾Ð½Ñ‚ÐµÐºÑÑ‚. ÐÐ• Ð¿ÐµÑ€ÐµÑ„Ð¾Ñ€Ð¼Ð°Ñ‚Ð¸Ñ€Ð¾Ð²Ð°Ñ‚ÑŒ multi-line Ð² single-line Ð¸ Ð½Ð°Ð¾Ð±Ð¾Ñ€Ð¾Ñ‚.

### Why not activeOrders? (Why not Ð²ÐºÐ»ÑŽÑ‡Ð¸Ñ‚ÑŒ status filter Ð² `activeOrders`?)

CC findings (Issue #1 CRITICAL): `orders` Ð±ÐµÐ· status-Ñ„Ð¸Ð»ÑŒÑ‚Ñ€Ð° Ð»Ð¾Ð²Ð¸Ð» Ð²ÑÐµ hall orders Ð²ÐºÐ»ÑŽÑ‡Ð°Ñ Ð·Ð°ÐºÑ€Ñ‹Ñ‚Ñ‹Ðµ â†’ Ð±ÐµÑÐºÐ¾Ð½ÐµÑ‡Ð½Ñ‹Ð¹ invalidate-loop. ÐœÐ¾Ð¶Ð½Ð¾ Ð±Ñ‹Ð»Ð¾ Ð±Ñ‹ Ð¿ÐµÑ€ÐµÐºÐ»ÑŽÑ‡Ð¸Ñ‚ÑŒÑÑ Ð½Ð° `activeOrders` (ÐºÐ¾Ñ‚Ð¾Ñ€Ñ‹Ðµ ÑƒÐ¶Ðµ Ñ„Ð¸Ð»ÑŒÑ‚Ñ€Ð¾Ð²Ð°Ð½Ñ‹), Ð½Ð¾ ÑÑ‚Ð¾ Ð±Ñ‹ Ð¿Ñ€Ð¾Ð¿ÑƒÑÑ‚Ð¸Ð»Ð¾ ÑÐ²ÐµÐ¶ÐµÑÐ¾Ð·Ð´Ð°Ð½Ð½Ñ‹Ðµ orders Ñ status='active' Ð½Ð¾ Ñ‡ÐµÑ€ÐµÐ· `shiftCutoff` Ð¾Ñ‚Ñ„Ð¸Ð»ÑŒÑ‚Ñ€Ð¾Ð²Ð°Ð½Ð½Ñ‹Ðµ. Ð ÐµÑˆÐµÐ½Ð¸Ðµ [v4-C1]: Ð¾ÑÑ‚Ð°Ð²Ð»ÑÐµÐ¼ `orders` (Ñ€Ð°Ð½Ð½ÐµÐµ Ð¾Ð±Ð½Ð°Ñ€ÑƒÐ¶ÐµÐ½Ð¸Ðµ) + ÑÐ²Ð½Ñ‹Ð¹ inline-Ñ„Ð¸Ð»ÑŒÑ‚Ñ€ Ð¿Ð¾ status (Ð¸ÑÐºÐ»ÑŽÑ‡Ð°ÐµÑ‚ Ð·Ð°ÐºÑ€Ñ‹Ñ‚Ñ‹Ðµ carryover).

### Why not useMemo Ð²Ð¼ÐµÑÑ‚Ð¾ useEffect?
Ð­Ñ‚Ð¾ side-effect (invalidateQueries) â€” Ð´Ð¾Ð»Ð¶ÐµÐ½ Ð±Ñ‹Ñ‚ÑŒ Ð² useEffect, Ð½Ðµ useMemo.

### Safety (post-v4):
- useEffect ÐÐ• ÑÐ¾Ð·Ð´Ð°Ñ‘Ñ‚ Ñ‚Ð°Ð¹Ð¼ÐµÑ€Ñ‹/Ð¿Ñ€Ð¾Ð¼Ð¸ÑÑ‹ â†’ cleanup Ð½Ðµ Ð½ÑƒÐ¶ÐµÐ½.
- Re-run frequency: Ð¿Ñ€Ð¸ ÐºÐ°Ð¶Ð´Ð¾Ð¼ refetch orders (polling ~10-60Ñ) â€” ÐžÐš, signature-guard Ð±Ð»Ð¾ÐºÐ¸Ñ€ÑƒÐµÑ‚ Ð¿Ð¾Ð²Ñ‚Ð¾Ñ€Ð½Ñ‹Ðµ invalidate Ð´Ð»Ñ Ñ‚Ð¾Ð¹ Ð¶Ðµ ÐºÐ¾Ð¼Ð±Ð¸Ð½Ð°Ñ†Ð¸Ð¸.
- Ð‘ÐµÑÐºÐ¾Ð½ÐµÑ‡Ð½Ñ‹Ð¹ Ñ†Ð¸ÐºÐ» Ñ€Ð¸ÑÐº:
  - **Closed-order carryover (CC Issue #1):** âœ… Ð·Ð°ÐºÑ€Ñ‹Ñ‚Ð¾ Ñ„Ð¸Ð»ÑŒÑ‚Ñ€Ð¾Ð¼ `o.status === 'closed' || 'cancelled' â†’ continue` (v4-C1).
  - **New-session race (genuine orphan):** invalidate ÑÑ€Ð°Ð±Ð°Ñ‚Ñ‹Ð²Ð°ÐµÑ‚ 1 Ñ€Ð°Ð· â†’ openSessions refetch â†’ Ð½Ð¾Ð²Ð°Ñ ÑÐµÑÑÐ¸Ñ Ð¿Ð¾Ð¿Ð°Ð´Ð°ÐµÑ‚ Ð² `openSessionByTableId` â†’ orphanPairs ÑÑ‚Ð°Ð½Ð¾Ð²Ð¸Ñ‚ÑÑ Ð¿ÑƒÑÑ‚Ñ‹Ð¼ â†’ signature reset â†’ Ð³Ð¾Ñ‚Ð¾Ð² Ðº ÑÐ»ÐµÐ´ÑƒÑŽÑ‰ÐµÐ¼Ñƒ orphan'Ñƒ. âœ…
  - **Stale openSessions response:** signature-guard (v4-M7) Ð·Ð°Ñ‰Ð¸Ñ‰Ð°ÐµÑ‚: ÐµÑÐ»Ð¸ openSessions Ð²ÐµÑ€Ð½ÑƒÐ» Ñ‚Ð¾Ñ‚ Ð¶Ðµ Ð½Ð°Ð±Ð¾Ñ€ Ð±ÐµÐ· Ð½Ð¾Ð²Ð¾Ð¹ ÑÐµÑÑÐ¸Ð¸ â€” sig Ð½Ðµ Ð¸Ð·Ð¼ÐµÐ½Ð¸Ð»Ð°ÑÑŒ â†’ Ð²Ñ‚Ð¾Ñ€Ð¾Ð³Ð¾ invalidate Ð½Ðµ Ð±ÑƒÐ´ÐµÑ‚.

### Verification Ð¿Ð¾ÑÐ»Ðµ Fix C â€” [V5-C4 Ð¿ÐµÑ€ÐµÐ¿Ð¸ÑÐ°Ð½: real identifiers]

```bash
# 1. [v5-C4] ÐŸÑ€Ð¾Ð²ÐµÑ€ÐºÐ° real identifiers Ð² ÐºÐ¾Ð´Ðµ â€” ÐÐ• hasOrphanedHallOrder (stale var Ð¸Ð· v3)
grep -n "orphanInvalidateSigRef" "pages/StaffOrdersMobile/staffordersmobile.jsx"
# ÐžÐ¶Ð¸Ð´Ð°Ð½Ð¸Ðµ: Ñ€Ð¾Ð²Ð½Ð¾ 3 hits â€” (a) `const orphanInvalidateSigRef = useRef(null);` Ð¾Ð±ÑŠÑÐ²Ð»ÐµÐ½Ð¸Ðµ,
#                            (b) `if (orphanInvalidateSigRef.current === signature)` Ñ‡Ñ‚ÐµÐ½Ð¸Ðµ,
#                            (c) `orphanInvalidateSigRef.current = signature;` Ð·Ð°Ð¿Ð¸ÑÑŒ, Ð° Ñ‚Ð°ÐºÐ¶Ðµ
#                            (d) `orphanInvalidateSigRef.current = null;` reset. Ð˜Ñ‚Ð¾Ð³ 3-4 hits.
# Ð”Ð¾Ð¿ÑƒÑÑ‚Ð¸Ð¼Ð¾: 3-4 hits Ð² Ð·Ð°Ð²Ð¸ÑÐ¸Ð¼Ð¾ÑÑ‚Ð¸ Ð¾Ñ‚ Ñ‚Ð¾Ð³Ð¾ ÐºÐ°Ðº Ñ„Ð¾Ñ€Ð¼Ð°Ñ‚Ñ‚ÐµÑ€ Ð¾Ð±ÑŠÐµÐ´Ð¸Ð½ÑÐµÑ‚ reset.

grep -n "orphanPairs" "pages/StaffOrdersMobile/staffordersmobile.jsx"
# ÐžÐ¶Ð¸Ð´Ð°Ð½Ð¸Ðµ: â‰¥3 hits â€” Ð¾Ð±ÑŠÑÐ²Ð»ÐµÐ½Ð¸Ðµ, .push, .length check, .sort().join(',').

grep -n "orphanPairs.push" "pages/StaffOrdersMobile/staffordersmobile.jsx"
# ÐžÐ¶Ð¸Ð´Ð°Ð½Ð¸Ðµ: 1 hit (Ð²Ð½ÑƒÑ‚Ñ€Ð¸ Ñ†Ð¸ÐºÐ»Ð° for orders).

# 2. invalidateQueries openSessions Ð¿Ñ€Ð¸ÑÑƒÑ‚ÑÑ‚Ð²ÑƒÐµÑ‚ Ð² Ð½ÑƒÐ¶Ð½Ð¾Ð¼ Ð¼ÐµÑÑ‚Ðµ
grep -n 'invalidateQueries({ queryKey: \["openSessions"\] })' "pages/StaffOrdersMobile/staffordersmobile.jsx"
# ÐžÐ¶Ð¸Ð´Ð°Ð½Ð¸Ðµ: â‰¥2 hits (ÑÑ‚Ð°Ñ€Ñ‹Ð¹ Ð² confirmCloseTable + Ð½Ð¾Ð²Ñ‹Ð¹ Ð² Fix C useEffect).

# 3. [V5-C4] Stale references ÐžÐ¢Ð¡Ð£Ð¢Ð¡Ð¢Ð’Ð£Ð®Ð¢ (ÐµÑÐ»Ð¸ Codex/CC Ð¿Ð¾ Ð¾ÑˆÐ¸Ð±ÐºÐµ Ð½Ð°Ð¿Ð¸ÑÐ°Ð» Ð²Ð°Ñ€Ð¸Ð°Ð½Ñ‚ Ñ ÑÑ‚Ð¸Ð¼Ð¸ Ð¸Ð¼ÐµÐ½Ð°Ð¼Ð¸)
grep -n "hasOrphanedHallOrder\|hasOrphanedOrder" "pages/StaffOrdersMobile/staffordersmobile.jsx"
# ÐžÐ¶Ð¸Ð´Ð°Ð½Ð¸Ðµ: 0 hits (ÑÑ‚Ð¾ Ð¸Ð¼ÐµÐ½Ð° Ð¿ÐµÑ€ÐµÐ¼ÐµÐ½Ð½Ñ‹Ñ… Ð¸Ð· v3 draft, Ð² Ñ„Ð¸Ð½Ð°Ð»ÑŒÐ½Ð¾Ð¼ ÐºÐ¾Ð´Ðµ v4/v5 Ð¸Ñ… Ð½ÐµÑ‚).

# 4. [V5-M3] Pre-check Ð²Ñ‹Ð¿Ð¾Ð»Ð½ÐµÐ½: queryClient Ð² scope
grep -n "const queryClient = useQueryClient" "pages/StaffOrdersMobile/staffordersmobile.jsx"
# ÐžÐ¶Ð¸Ð´Ð°Ð½Ð¸Ðµ: 1 hit â€” Ð¾Ð±ÑŠÑÐ²Ð»ÐµÐ½Ð¸Ðµ Ð²Ð½ÑƒÑ‚Ñ€Ð¸ ÐºÐ¾Ð¼Ð¿Ð¾Ð½ÐµÐ½Ñ‚Ð° (pre-existed, Ð½Ðµ Ð´Ð¾Ð±Ð°Ð²Ð»ÑÐµÐ¼).

# 5. [V5-L5] useRef import Ð¿Ñ€Ð¸ÑÑƒÑ‚ÑÑ‚Ð²ÑƒÐµÑ‚ (Ð»Ð¸Ð±Ð¾ Ð±Ñ‹Ð», Ð»Ð¸Ð±Ð¾ Ð´Ð¾Ð±Ð°Ð²Ð¸Ð»Ð¸)
grep -c "useRef" "pages/StaffOrdersMobile/staffordersmobile.jsx"
# ÐžÐ¶Ð¸Ð´Ð°Ð½Ð¸Ðµ: â‰¥2 (1 Ð² import, 1 Ð² const orphanInvalidateSigRef = useRef).

# 6. Syntax check Ð½Ðµ Ð¾Ð±ÑÐ·Ð°Ñ‚ÐµÐ»ÐµÐ½ (JSX â€” Ð½Ðµ Ð¿Ð¾Ð´Ð´ÐµÑ€Ð¶Ð¸Ð²Ð°ÐµÑ‚ÑÑ node --check, PQ-072), Ð½Ð¾ Ð¿Ñ€Ð¾Ð²ÐµÑ€ÐºÐ° Ð»Ð¸Ð½Ñ‚Ð¾Ð¼:
# Git push triggered CI lint / B44 deploy catch syntax â†’ Ð´Ð¾Ð²ÐµÑ€ÑÐµÐ¼ Ñ„Ð¸Ð½Ð°Ð»ÑŒÐ½Ð¾Ð¼Ñƒ git commit.
```

---

## Regression Check (Ð¾Ð±ÑÐ·Ð°Ñ‚ÐµÐ»ÑŒÐ½Ð¾ Ð¿Ð¾ÑÐ»Ðµ Ð’Ð¡Ð•Ð¥ Fix) â€” [V5-L1 typo fix]

ÐŸÑ€Ð¾Ð²ÐµÑ€Ð¸Ñ‚ÑŒ, Ñ‡Ñ‚Ð¾ ÐŸÐ ÐžÐ”ÐžÐ›Ð–ÐÐ•Ð¢ Ñ€Ð°Ð±Ð¾Ñ‚Ð°Ñ‚ÑŒ:

- [ ] Ð Ð°ÑÐºÑ€Ñ‹Ñ‚Ð¸Ðµ/ÑÐ²Ð¾Ñ€Ð°Ñ‡Ð¸Ð²Ð°Ð½Ð¸Ðµ Ð¾Ð´Ð½Ð¾Ð¹ ÐºÐ°Ñ€Ñ‚Ð¾Ñ‡ÐºÐ¸ (click Ð¿Ð¾ header) â†’ Ñ€Ð°Ð±Ð¾Ñ‚Ð°ÐµÑ‚.
- [ ] ÐÐµÐ»ÑŒÐ·Ñ Ð¾Ñ‚ÐºÑ€Ñ‹Ñ‚ÑŒ 2 ÐºÐ°Ñ€Ñ‚Ð¾Ñ‡ÐºÐ¸ Ð¾Ð´Ð½Ð¾Ð²Ñ€ÐµÐ¼ÐµÐ½Ð½Ð¾ (`expandedGroupId` single) â†’ Ñ€Ð°Ð±Ð¾Ñ‚Ð°ÐµÑ‚.
- [ ] Favorite star Ð½Ð° ÑÑ‚Ð¾Ð»Ðµ â†’ Ð¿ÐµÑ€ÐµÐºÐ»ÑŽÑ‡Ð°ÐµÑ‚ÑÑ, ÑÐ¾Ñ…Ñ€Ð°Ð½ÑÐµÑ‚ÑÑ Ð¼ÐµÐ¶Ð´Ñƒ Ñ€ÐµÐ½Ð´ÐµÑ€Ð°Ð¼Ð¸.
- [ ] Favorite filter (star) â†’ Ð¿Ð¾ÐºÐ°Ð·Ñ‹Ð²Ð°ÐµÑ‚ Ñ‚Ð¾Ð»ÑŒÐºÐ¾ Ð¸Ð·Ð±Ñ€Ð°Ð½Ð½Ñ‹Ðµ.
- [ ] Close Table Ð¸Ð· ÐºÐ°Ñ€Ñ‚Ð¾Ñ‡ÐºÐ¸ ÑÑ‚Ð¾Ð»Ð° â†’ Ð·Ð°ÐºÑ€Ñ‹Ð²Ð°ÐµÑ‚ Ñ‚Ð¾Ð»ÑŒÐºÐ¾ open-session; ÑÑ‚Ð°Ñ€Ð°Ñ Ð·Ð°ÐºÑ€Ñ‹Ñ‚Ð°Ñ ÐºÐ°Ñ€Ñ‚Ð¾Ñ‡ÐºÐ° Ð¾ÑÑ‚Ð°Ñ‘Ñ‚ÑÑ Ð² Â«Ð—Ð°Ð²ÐµÑ€ÑˆÑ‘Ð½Ð½Ñ‹Ñ…Â» Ð½ÐµÑ‚Ñ€Ð¾Ð½ÑƒÑ‚Ð¾Ð¹.
- [ ] Pickup / Delivery Ð·Ð°ÐºÐ°Ð·Ñ‹ â†’ Ð¾Ñ‚Ð¾Ð±Ñ€Ð°Ð¶Ð°ÑŽÑ‚ÑÑ Ð² ÑÐ¿Ð¸ÑÐºÐµ, Ñ‚Ð°Ð¿ Ñ€Ð°Ð±Ð¾Ñ‚Ð°ÐµÑ‚.
- [ ] Active/Completed Ñ‚Ð°Ð± ÑÑ‡Ñ‘Ñ‚Ñ‡Ð¸ÐºÐ¸ (tabCounts) â†’ ÐºÐ¾Ñ€Ñ€ÐµÐºÑ‚Ð½Ð¾ ÑÑ‡Ð¸Ñ‚Ð°ÑŽÑ‚ (Ð½Ð¾Ð²Ð°Ñ ÑÐµÑÑÐ¸Ñ Ð² Â«ÐÐºÑ‚Ð¸Ð²Ð½Ñ‹ÐµÂ», ÑÑ‚Ð°Ñ€Ð°Ñ Ð² Â«Ð—Ð°Ð²ÐµÑ€ÑˆÑ‘Ð½Ð½Ñ‹ÐµÂ»).
- [ ] Banner-navigate (ÐºÐ»Ð¸Ðº Ð¿Ð¾ alert Ð±Ð°Ð½Ð½ÐµÑ€Ñƒ Ð¾ Ð½Ð¾Ð²Ð¾Ð¼ Ð·Ð°ÐºÐ°Ð·Ðµ) â†’ ÑÐºÑ€Ð¾Ð»Ð»Ð¸Ñ‚ Ðº Ð¿Ñ€Ð°Ð²Ð¸Ð»ÑŒÐ½Ð¾Ð¹ ÐºÐ°Ñ€Ñ‚Ð¾Ñ‡ÐºÐµ (Ñ‚ÐµÐºÑƒÑ‰ÐµÐ¹ Ð¾Ñ‚ÐºÑ€Ñ‹Ñ‚Ð¾Ð¹ ÑÐµÑÑÐ¸Ð¸), Ñ€Ð°ÑÐºÑ€Ñ‹Ð²Ð°ÐµÑ‚ ÐµÑ‘. [V5-C3: call chain buildBannerInfo â†’ banner.groupId (tableId) â†’ onNavigate @ 2825 â†’ prop @ 4610 â†’ handleBannerNavigate @ 4142 â†’ defensive Ñ€ÐµÐ·Ð¾Ð»Ð² tableId â†’ compositeKey]
- [ ] servedOrders query (Ð½Ð°Ð¶Ð°Ñ‚ÑŒ expand Ð½Ð° ÐºÐ°Ñ€Ñ‚Ð¾Ñ‡ÐºÐµ Ñ served orders) â†’ Ð¿Ð¾Ð´Ñ‚ÑÐ³Ð¸Ð²Ð°ÐµÑ‚ historical served orders Ð´Ð»Ñ tableId. [V5-L1: Ð±Ñ‹Ð»Ð¾ Â«ServedotÂ» typo]
- [ ] Kitchen mode (`isKitchen === true`) â†’ Ð²Ð¸Ð´Ð¸Ñ‚ flat `visibleOrders`, Ð±ÐµÐ· ÐºÐ°Ñ€Ñ‚Ð¾Ñ‡ÐµÐº. `orderGroups` Ð²Ð¾Ð·Ð²Ñ€Ð°Ñ‰Ð°ÐµÑ‚ `null` â†’ Ð½Ðµ Ð»Ð¾Ð¼Ð°ÐµÑ‚ÑÑ.
- [ ] Highlight (Ð¾Ñ€Ð°Ð½Ð¶ÐµÐ²Ð°Ñ Ð¿Ð¾Ð´ÑÐ²ÐµÑ‚ÐºÐ° 1.5Ñ Ð¿Ð¾ÑÐ»Ðµ banner-navigate) â†’ Ð¿Ñ€Ð¸Ð¼ÐµÐ½ÑÐµÑ‚ÑÑ Ðº Ð¿Ñ€Ð°Ð²Ð¸Ð»ÑŒÐ½Ð¾Ð¹ ÐºÐ°Ñ€Ñ‚Ð¾Ñ‡ÐºÐµ.

---

## Mobile-first check (MANDATORY)

SOM â€” mobile-first waiter interface (375px). Ð˜Ð·Ð¼ÐµÐ½ÐµÐ½Ð¸Ñ Fix A/B/C â€” backend Ð³Ñ€ÑƒÐ¿Ð¿Ð¸Ñ€Ð¾Ð²ÐºÐ°, UI Ð½Ðµ Ð´Ð¾Ð±Ð°Ð²Ð»ÑÐµÑ‚ÑÑ. ÐÐ¾ Ñ‚.Ðº. FROZEN UX Ð¿Ð¾ÐºÑ€Ñ‹Ð²Ð°ÐµÑ‚ Ñ€Ð°Ð·Ð¼ÐµÑ‚ÐºÑƒ OrderGroupCard â€” Ð²Ð¸Ð·ÑƒÐ°Ð»ÑŒÐ½Ð¾ Ð½Ð° 375px:
- ÐšÐ°Ñ€Ñ‚Ð¾Ñ‡ÐºÐ¸ ÑÑ‚Ð¾Ð»Ð° Ð¾ÑÑ‚Ð°ÑŽÑ‚ÑÑ Ñ‚Ð¾Ð¹ Ð¶Ðµ ÑˆÐ¸Ñ€Ð¸Ð½Ñ‹, Ð¾Ð´Ð½Ð° Ð¿Ð¾Ð´ Ð´Ñ€ÑƒÐ³Ð¾Ð¹
- ÐÐµÑ‚ Ð½Ð¾Ð²Ñ‹Ñ… touch-targets
- ÐÐµÑ‚ Ð½Ð¾Ð²Ñ‹Ñ… overlay/sticky ÑÐ»ÐµÐ¼ÐµÐ½Ñ‚Ð¾Ð²

**ÐÐµÑ‡ÐµÐ³Ð¾ Ð¼ÐµÐ½ÑÑ‚ÑŒ Ð² UI. Ð­Ñ‚Ð¾Ñ‚ Ð±Ð»Ð¾Ðº Ñ‚Ð¾Ð»ÑŒÐºÐ¾ Ð´Ð»Ñ Ñ„Ð¸ÐºÑÐ°Ñ†Ð¸Ð¸ â€” CC/Codex Ð½Ðµ Ð´Ð¾Ð»Ð¶Ð½Ñ‹ Ð¼Ð¾Ð´Ð¸Ñ„Ð¸Ñ†Ð¸Ñ€Ð¾Ð²Ð°Ñ‚ÑŒ ÑÑ‚Ð¸Ð»Ð¸/Ð²ÐµÑ€ÑÑ‚ÐºÑƒ.**

---

---

## Priority hierarchy (Ð¿Ñ€Ð¸ ÐºÐ¾Ð½Ñ„Ð»Ð¸ÐºÑ‚Ðµ Ñ FROZEN UX)

1. **Fix A** (staleTime) â€” ÐºÑ€Ð¸Ñ‚Ð¸Ñ‡ÐµÑÐºÐ¸Ð¹, simple, safe. ÐžÐ±ÑÐ·Ð°Ñ‚ÐµÐ»ÐµÐ½.
2. **Fix B.1-B.5** (orderGroups + filteredGroups + tabCounts + call-sites + data-group-id live @ 2292) â€” Ð¾Ð±ÑÐ·Ð°Ñ‚ÐµÐ»ÐµÐ½, Ð¾ÑÐ½Ð¾Ð²Ð½Ð¾Ð¹ UX-Ñ„Ð¸ÐºÑ.
3. **Fix B.6** (handleBannerNavigate) â€” Ð¾Ð±ÑÐ·Ð°Ñ‚ÐµÐ»ÐµÐ½ ÐµÑÐ»Ð¸ baserunner Ð¸ÑÐ¿Ð¾Ð»ÑŒÐ·ÑƒÐµÑ‚ `data-group-id` Ð´Ð»Ñ ÑÐºÑ€Ð¾Ð»Ð»Ð¸Ð½Ð³Ð° (ÑÐµÐ³Ð¾Ð´Ð½Ñ Ð¸ÑÐ¿Ð¾Ð»ÑŒÐ·ÑƒÐµÑ‚ Ñ‡ÐµÑ€ÐµÐ· call chain buildBannerInfo â†’ onNavigate â†’ handleBannerNavigate).
4. **Fix C** (orphan detection) â€” Ð¶ÐµÐ»Ð°Ñ‚ÐµÐ»ÑŒÐ½Ð¾. Ð•ÑÐ»Ð¸ ÑÐ¾Ð·Ð´Ð°Ñ‘Ñ‚ Ñ€Ð¸ÑÐºÐ¸ (Ð±ÐµÑÐºÐ¾Ð½ÐµÑ‡Ð½Ñ‹Ðµ re-renders / CPU spike Ð¿Ñ€Ð¸ Ð¼Ð½Ð¾Ð¶ÐµÑÑ‚Ð²Ðµ Orders) â€” Ð¸ÑÐºÐ»ÑŽÑ‡Ð¸Ñ‚ÑŒ, Fix A+B Ð´Ð¾ÑÑ‚Ð°Ñ‚Ð¾Ñ‡Ð½Ð¾ Ð´Ð»Ñ ÐºÐ¾Ñ€Ñ€ÐµÐºÑ‚Ð½Ð¾Ð³Ð¾ UX.

**ÐœÐ¸Ð½Ð¸Ð¼Ð°Ð»ÑŒÐ½Ð°Ñ Ñ€Ð°Ð±Ð¾Ñ‡Ð°Ñ ÐºÐ¾Ð¼Ð±Ð¸Ð½Ð°Ñ†Ð¸Ñ Ð´Ð»Ñ Ð·Ð°ÐºÑ€Ñ‹Ñ‚Ð¸Ñ BUG-SM-015:** Fix A + Fix B.1-B.5 (Ð±ÐµÐ· B.6 Ð¸ C). UX Ð¿Ñ€Ð¸ ÑÑ‚Ð¾Ð¼ ÐºÐ¾Ñ€Ñ€ÐµÐºÑ‚ÐµÐ½, Ð½Ð¾ banner-navigate Ð¼Ð¾Ð¶ÐµÑ‚ ÑÐºÑ€Ð¾Ð»Ð»Ð¸Ñ‚ÑŒ Ðº Ð½Ðµ-Ñ‚Ð¾Ð¹ ÐºÐ°Ñ€Ñ‚Ð¾Ñ‡ÐºÐµ (edge case, Ð½Ðµ Ð±Ð»Ð¾ÐºÐµÑ€).

---

## Codex-specific SCOPE RESTRICTION (Ð´Ð»Ñ codex-writer-v2 step)

â›” **Ð—Ð°Ð¿Ñ€ÐµÑ‰ÐµÐ½Ð¾:**
- ÐœÐµÐ½ÑÑ‚ÑŒ `components/sessionHelpers.js` (Ð»ÑŽÐ±Ñ‹Ðµ Ñ„ÑƒÐ½ÐºÑ†Ð¸Ð¸)
- ÐœÐµÐ½ÑÑ‚ÑŒ `pages/PublicMenu/useTableSession.jsx`
- ÐœÐµÐ½ÑÑ‚ÑŒ `pages/StaffOrdersMobile/BUGS.md`, README.md Ð¸Ð»Ð¸ Ð»ÑŽÐ±Ñ‹Ðµ Ð´Ð¾ÐºÑƒÐ¼ÐµÐ½Ñ‚Ñ‹
- Ð¡Ð¾Ð·Ð´Ð°Ð²Ð°Ñ‚ÑŒ Ð½Ð¾Ð²Ñ‹Ðµ ÐºÐ¾Ð¼Ð¿Ð¾Ð½ÐµÐ½Ñ‚Ñ‹/Ñ„Ð°Ð¹Ð»Ñ‹
- ÐœÐµÐ½ÑÑ‚ÑŒ B44 entity schemas (Ð¾Ð½Ð¸ Ñ‚Ð¾Ð»ÑŒÐºÐ¾ Ñ‡Ð¸Ñ‚Ð°ÑŽÑ‚ÑÑ Ñ‡ÐµÑ€ÐµÐ· api/base44Client)
- ÐœÐµÐ½ÑÑ‚ÑŒ i18n dictionaries, theme, CSS classes
- ÐœÐµÐ½ÑÑ‚ÑŒ `buildBannerInfo` Ð¸Ð»Ð¸ `onNavigate(banner.groupId)` call-site (upstream â€” FROZEN) [V5-L6]

â›” **ÐÐ• ÐºÐ¾Ð¼Ð±Ð¸Ð½Ð¸Ñ€Ð¾Ð²Ð°Ñ‚ÑŒ** Fix B Ñ Ð»ÑŽÐ±Ñ‹Ð¼Ð¸ Ð´Ñ€ÑƒÐ³Ð¸Ð¼Ð¸ Ñ€ÐµÑ„Ð°ÐºÑ‚Ð¾Ñ€Ð¸Ð½Ð³Ð°Ð¼Ð¸. Ð”Ð°Ð¶Ðµ Â«Ð¾Ñ‡ÐµÐ²Ð¸Ð´Ð½Ñ‹ÐµÂ» cleanup'Ñ‹ (ÑƒÐ´Ð°Ð»ÐµÐ½Ð¸Ðµ Ð½ÐµÐ¸ÑÐ¿Ð¾Ð»ÑŒÐ·ÑƒÐµÐ¼Ñ‹Ñ… Ð¿ÐµÑ€ÐµÐ¼ÐµÐ½Ð½Ñ‹Ñ…, Ð¿ÐµÑ€ÐµÐ¸Ð¼ÐµÐ½Ð¾Ð²Ð°Ð½Ð¸Ðµ Ñ…ÑƒÐºÐ¾Ð²) â€” Ð·Ð°Ð¿Ñ€ÐµÑ‰ÐµÐ½Ñ‹ Ð² ÑÑ‚Ð¾Ð¼ Ð±Ð°Ñ‚Ñ‡Ðµ.

---

## Safety Guards (Ñ„Ð¸Ð½Ð°Ð»ÑŒÐ½Ñ‹Ð¹ Ñ‡ÐµÐº Ð¿ÐµÑ€ÐµÐ´ push)

- [ ] `grep "tableGroups\[tableId\]"` â†’ 0 hits (Ð·Ð°Ð¼ÐµÐ½Ñ‹ Ð¿Ð¾Ð»Ð½Ñ‹Ðµ)
- [ ] `grep "tableGroups\[compositeKey\]"` â†’ â‰¥4 hits
- [ ] `wc -l` Ð² Ð´Ð¸Ð°Ð¿Ð°Ð·Ð¾Ð½Ðµ 4582-4687 [v5-M5]
- [ ] `node -e "require('esprima').parseModule(require('fs').readFileSync('...', 'utf8'))"` â€” Ð¿Ñ€Ð¾Ð¿ÑƒÑÐºÐ°ÐµÐ¼ (JSX Ð½Ðµ Ð¿Ð¾Ð´Ð´ÐµÑ€Ð¶Ð¸Ð²Ð°ÐµÑ‚ÑÑ, Ð½Ð¾ git push â†’ B44 deploy Ð¿Ð¾Ð¹Ð¼Ð°ÐµÑ‚ SyntaxError).
- [ ] `git diff main -- pages/StaffOrdersMobile/staffordersmobile.jsx` ÑÐ¾Ð´ÐµÑ€Ð¶Ð¸Ñ‚ Ð¸Ð·Ð¼ÐµÐ½ÐµÐ½Ð¸Ñ Ð¢ÐžÐ›Ð¬ÐšÐž Ð² **8 Ð»Ð¾ÐºÐ°Ñ†Ð¸ÑÑ…** [v4-L3, v5-M1 precision]: (1) openSessions staleTime (1 ÑÑ‚Ñ€Ð¾ÐºÐ°); (2) orderGroups useMemo (Ñ†ÐµÐ»Ð¸ÐºÐ¾Ð¼); (3) filteredGroups (Ñ‡Ð°ÑÑ‚Ð¸Ñ‡Ð½Ð¾ â€” Ñ‚Ð¾Ð»ÑŒÐºÐ¾ `if (group.type === 'table')` Ð±Ð»Ð¾Ðº); (4) tabCounts (Ñ‡Ð°ÑÑ‚Ð¸Ñ‡Ð½Ð¾ â€” Ñ‚Ð¾Ð»ÑŒÐºÐ¾ Ñ‚Ð¾Ñ‚ Ð¶Ðµ Ð±Ð»Ð¾Ðº); (5) OrderGroupCard map props (4 ÑÑ‚Ñ€Ð¾ÐºÐ¸ key/isExpanded/onToggleExpand/isHighlighted); (6) data-group-id live JSX @ ~2292 (1 Ð¼ÐµÑÑ‚Ð¾ Ð¾Ð±ÑÐ·Ð°Ñ‚ÐµÐ»ÑŒÐ½Ð¾; ~565, ~1173 optional comment-only); (7) handleBannerNavigate useCallback (Ñ†ÐµÐ»Ð¸ÐºÐ¾Ð¼); (8) Ð½Ð¾Ð²Ñ‹Ð¹ useEffect + useRef Fix C.
- [ ] `queryKey: ["openSessions", partnerId]` @ ~3542 ÐžÐ¡Ð¢ÐÐ›Ð¡Ð¯ Ð±ÐµÐ· Ð¸Ð·Ð¼ÐµÐ½ÐµÐ½Ð¸Ð¹ (Ñ‚Ð¾Ð»ÑŒÐºÐ¾ `staleTime` Ð²Ð½ÑƒÑ‚Ñ€Ð¸ Ð±Ð»Ð¾ÐºÐ° Ð¸Ð·Ð¼ÐµÐ½Ñ‘Ð½) [V5-C1]
- [ ] `buildBannerInfo` Ð¸ `onNavigate(banner.groupId)` call-site @ ~2825 ÐÐ• Ð¸Ð·Ð¼ÐµÐ½ÐµÐ½Ñ‹ [V5-L6]
- [ ] (ÐµÑÐ»Ð¸ Ñ‚Ñ€ÐµÐ±Ð¾Ð²Ð°Ð»Ð¾ÑÑŒ pre-check) `useRef` Ð¸Ð¼Ð¿Ð¾Ñ€Ñ‚ Ð´Ð¾Ð±Ð°Ð²Ð»ÐµÐ½ Ð² ÑÑƒÑ‰ÐµÑÑ‚Ð²ÑƒÑŽÑ‰Ð¸Ð¹ import block.
- [ ] `useQueryClient()` / `queryClient` Ð² scope (pre-existed, Ð½Ðµ Ð¼ÐµÐ½ÑÐµÐ¼) [V5-M3]
- [ ] ÐÐ¸ÐºÐ°ÐºÐ¸Ñ… Ð¸Ð·Ð¼ÐµÐ½ÐµÐ½Ð¸Ð¹ Ð² Ð´Ñ€ÑƒÐ³Ð¸Ñ… Ñ„Ð°Ð¹Ð»Ð°Ñ… (sessionHelpers.js, useTableSession.jsx, PublicMenu/*, docs).
- [ ] Commit message: `fix(SOM): BUG-SM-015 session-aware orderGroups + staleTime 30sâ†’5s + orphan invalidate`

---

## Notes Ð´Ð»Ñ Ñ€ÐµÑ†ÐµÐ½Ð·ÐµÐ½Ñ‚Ð° ÐŸÐ¡Ð¡Ðš

Fix Ñ‚Ð¸Ð¿Ñ‹: Fix A `[FIX]` safe/single; Fix B `[FIX]` ÑÐ¾ÑÑ‚Ð°Ð²Ð½Ð¾Ð¹ (7 ÑÑƒÐ±-Ð¿Ñ€Ð°Ð²Ð¾Ðº Ñ‡ÐµÑ€ÐµÐ· `group.sessionId`); Fix C `[NEW CODE]` performance. Ð’ÑÐµ anchors Ð¿Ñ€Ð¾Ð²ÐµÑ€ÐµÐ½Ñ‹ Ð² Pre-flight â€” ÐµÑÐ»Ð¸ count Ð½Ðµ ÑÐ¾Ð²Ð¿Ð°Ð´Ð°ÐµÑ‚ â†’ STOP + Arman.
=== END ===


=== FINAL STEPS ===
1. Use the Write tool to write the final summary to:
   C:/Users/ASUS/Dev/Menu AI Cowork/pipeline/cc-analysis-task-260416-214227-020.txt
2. Use the Write tool to append one line to the progress file:
   C:/Users/ASUS/Dev/Menu AI Cowork/pipeline/progress-task-260416-214227-020.txt
   Line: [OK] HH:MM DONE
Do NOT use shell commands for these final writes â€” use the Write tool.
=== END FINAL STEPS ===

codex
I have the task prompt loaded. It’s a prompt-quality review for `pages/StaffOrdersMobile/staffordersmobile.jsx`, so I’m now verifying the prompt’s cited line ranges, identifiers, and fix instructions against the actual source before writing the findings files.
codex
I’ve identified the target code areas from the prompt and am cross-checking them against the live `StaffOrdersMobile` source. I also need to emit the pipeline marker/progress files the prompt requires, but those paths are outside the writable workspace, so I’m verifying what the sandbox will actually allow before I finalize outputs.
exec
"C:\\WINDOWS\\System32\\WindowsPowerShell\\v1.0\\powershell.exe" -Command "rg -n \"openSessions|orderGroups|filteredGroups|tabCounts|handleBannerNavigate|buildBannerInfo|onNavigate\\(banner\\.groupId\\)|data-group-id|useQueryClient|useRef|orphanInvalidateSigRef|tableGroups\\[|from 'react'\" \"pages/StaffOrdersMobile/staffordersmobile.jsx\"" in C:\Users\ASUS\Dev\Menu AI Cowork\menuapp-code-review
 succeeded in 27960ms:
159:import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
161:import { useMutation, useQuery, useQueryClient, useQueries } from "@tanstack/react-query";
565:    <div data-group-id={group.id} className={`mb-3 rounded-lg border border-slate-200 overflow-hidden transition-all duration-300 ${style.bgClass} ${style.borderClass} ${highlightRing}`}>
1173:      data-group-id={group.id}
1581:  const queryClient = useQueryClient();
1749:  const queryClient = useQueryClient();
1810:  const ownerHintTimerRef = useRef(null);
1811:  const requestsSectionRef = useRef(null);
1812:  const newSectionRef = useRef(null);
1813:  const inProgressSectionRef = useRef(null);
1814:  const readySectionRef = useRef(null);
1904:  const batchInFlightRef = useRef(false);
2292:    <div data-group-id={group.id} className={`mb-3 rounded-lg border border-slate-200 overflow-hidden transition-all duration-300 ${style.bgClass} ${style.borderClass} ${highlightRing}`}>
2785:  const touchStartY = useRef(null);
2786:  const autoHideTimer = useRef(null);
2787:  const dismissAnimTimer = useRef(null);
2825:      onNavigate(banner.groupId);
2883:  const queryClient = useQueryClient();
2891:  const didBindRef = useRef(false);
2892:  const didUpdateLastActiveRef = useRef(false);
2893:  const didAutoBindRef = useRef(false);
2896:  const loadedGuestIdsRef = useRef(new Set());
2901:  const toastTimerRef = useRef(null);
2944:  const lastFilterChangeRef = useRef(0);
2954:  const bannerIdCounter = useRef(0);
2968:  const audioRef = useRef(null);
2969:  const audioUnlockedRef = useRef(false);
3004:  const ownMutationRef = useRef(null);
3058:  const favoritesInitializedRef = useRef(false);
3191:  const linkIdRef = useRef(null);
3541:  const { data: openSessions = [] } = useQuery({
3542:    queryKey: ["openSessions", partnerId],
3556:    (openSessions || []).forEach((s) => {
3561:  }, [openSessions]);
3768:  const orderGroups = useMemo(() => {
3778:        if (!tableGroups[tableId]) {
3780:          tableGroups[tableId] = {
3787:          groups.push(tableGroups[tableId]);
3789:        tableGroups[tableId].orders.push(o);
3805:      if (!tableGroups[tableId]) {
3807:        tableGroups[tableId] = {
3814:        groups.push(tableGroups[tableId]);
3823:    if (!orderGroups) return [];
3825:    return [...orderGroups].sort((a, b) => {
3833:  }, [orderGroups, getStatusConfig]);
3862:  const filteredGroups = useMemo(() => {
3863:    if (!orderGroups) return [];
3865:    return orderGroups.filter(group => {
3883:  }, [orderGroups, activeTab, getStatusConfig, activeRequests, openSessionByTableId]);
3886:  const tabCounts = useMemo(() => {
3887:    if (!orderGroups) return { active: 0, completed: 0 };
3890:    orderGroups.forEach(group => {
3908:  }, [orderGroups, getStatusConfig, activeRequests, openSessionByTableId]);
3912:    if (!showOnlyFavorites) return filteredGroups;
3914:    return filteredGroups.filter(group => {
3921:  }, [filteredGroups, showOnlyFavorites, isFavorite, activeRequests, favorites]);
3946:  // v2.7.0: Removed favoriteOrders/otherOrders (replaced by orderGroups)
3948:  const prevDigestRef = useRef(null);
3949:  const prevStatusMapRef = useRef({});
4056:    const buildBannerInfo = (orderIds, eventType) => {
4094:      const banner = buildBannerInfo(readyOrderIds, 'ready');
4099:      const banner = buildBannerInfo(newOrderIds, 'new');
4139:  const highlightTimerRef = useRef(null);
4142:  const handleBannerNavigate = useCallback((groupId) => {
4147:        const el = document.querySelector(`[data-group-id="${CSS.escape(String(groupId))}"]`);
4193:      queryClient.invalidateQueries({ queryKey: ["openSessions"] });
4365:              Активные ({tabCounts.active})
4375:              Завершённые ({tabCounts.completed})
4610:        onNavigate={handleBannerNavigate}

codex
The first source scan matches the prompt’s main anchors: `openSessions` is at 3541, `orderGroups`/`filteredGroups`/`tabCounts` are at 3768/3862/3886, and `handleBannerNavigate` is at 4142. I’m reading those exact ranges now to verify whether the prompt’s proposed fixes and safety claims are coherent against the real implementation.
exec
"C:\\WINDOWS\\System32\\WindowsPowerShell\\v1.0\\powershell.exe" -Command "@'
"'$path = '"'pages/StaffOrdersMobile/staffordersmobile.jsx'
"'$lines = Get-Content -LiteralPath $path
function Show-Range($start, $end) {
  for ($i = $start; $i -le $end; $i++) {
    if ($i -le $lines.Length) { '"'{0}: {1}' -f "'$i, $lines[$i-1] }
  }
}
Show-Range 3538 3910
'"'@ | powershell -NoProfile -Command -" in C:\Users\ASUS\Dev\Menu AI Cowork\menuapp-code-review
 succeeded in 68620ms:
codex
The range read command needs a smaller, direct PowerShell slice; I’m rerunning it that way so I can inspect the actual code instead of relying on anchors alone.
exec
"C:\\WINDOWS\\System32\\WindowsPowerShell\\v1.0\\powershell.exe" -Command '$path = '"'pages/StaffOrdersMobile/staffordersmobile.jsx'; "'$lines = Get-Content -LiteralPath $path; for ($i = 3538; $i -le 3910; $i++) { if ($i -le $lines.Length) { '"'{0}: {1}' -f "'$i, $lines[$i-1] } }' in C:\Users\ASUS\Dev\Menu AI Cowork\menuapp-code-review
 succeeded in 7800ms:
3538:     }
3539:   }, [requestsErrorObj]);
3540: 
3541:   const { data: openSessions = [] } = useQuery({
3542:     queryKey: ["openSessions", partnerId],
3543:     queryFn: () =>
3544:       partnerId
3545:         ? base44.entities.TableSession.filter({ partner: partnerId, status: 'open' })
3546:         : base44.entities.TableSession.list(),
3547:     enabled: canFetch && !!partnerId && !rateLimitHit,
3548:     staleTime: 30_000,
3549:     refetchInterval: effectivePollingInterval,
3550:     refetchIntervalInBackground: false,
3551:     retry: shouldRetry,
3552:   });
3553: 
3554:   const openSessionByTableId = useMemo(() => {
3555:     const map = {};
3556:     (openSessions || []).forEach((s) => {
3557:       const tid = getLinkId(s.table);
3558:       if (tid) map[tid] = s;
3559:     });
3560:     return map;
3561:   }, [openSessions]);
3562: 
3563:   const lastUpdatedAt = Math.max(ordersUpdatedAt || 0, requestsUpdatedAt || 0) || null;
3564: 
3565:   const activeRequests = useMemo(() => {
3566:     if (!allRequests || isKitchen) return [];
3567:     
3568:     const shiftCutoff = shiftStartTime.getTime();
3569:     
3570:     return allRequests.filter((r) => {
3571:       // SHIFT FILTER
3572:       const createdAt = safeParseDate(r.created_date).getTime();
3573:       if (createdAt < shiftCutoff) return false;
3574:       
3575:       // Existing status filter
3576:       return !["done", "cancelled"].includes(r.status);
3577:     });
3578:   }, [allRequests, isKitchen, shiftStartTime]);
3579: 
3580:   const updateRequestMutation = useMutation({
3581:     mutationFn: (payload) => { const { id, __batch, ...fields } = payload; return base44.entities.ServiceRequest.update(id, fields); },
3582:     onSuccess: (_data, vars) => { if (vars?.__batch) return; queryClient.invalidateQueries({ queryKey: ["serviceRequests"] }); },
3583:     onError: (err) => {
3584:       if (isRateLimitError(err)) {
3585:         queryClient.cancelQueries();
3586:         setRateLimitHit(true);
3587:       }
3588:     },
3589:   });
3590: 
3591:   // Filter orders by status (using both stage_id and status for hybrid support)
3592:   // P0-1: Uses normalized stageId
3593:   const activeOrders = useMemo(() => {
3594:     if (!orders) return [];
3595:     
3596:     const shiftCutoff = shiftStartTime.getTime();
3597:     
3598:     return orders.filter((o) => {
3599:       // P0-3: For hall orders, require table_session (filter out legacy/orphan orders)
3600:       if (o.order_type === 'hall' && !getLinkId(o.table_session)) return false;
3601: 
3602:       // SHIFT FILTER: only orders created after shift start
3603:       const createdAt = safeParseDate(o.created_date).getTime();
3604:       if (createdAt < shiftCutoff) return false;
3605: 
3606:       // Existing status filter (unchanged)
3607:       const stageId = getLinkId(o.stage_id);
3608:       if (stageId && stagesMap[stageId]) {
3609:         const stage = stagesMap[stageId];
3610:         if (stage.internal_code === 'finish') {
3611:           return o.status !== 'closed' && o.status !== 'cancelled';
3612:         }
3613:         return true;
3614:       }
3615:       return ["new", "accepted", "in_progress", "ready"].includes(o.status);
3616:     });
3617:   }, [orders, stagesMap, shiftStartTime]);
3618: 
3619:   // Kitchen filter: only see accepted, in_progress, ready (NOT new)
3620:   // P0-1: Uses normalized stageId
3621:   const roleFilteredOrders = useMemo(() => {
3622:     if (!isKitchen) return activeOrders;
3623:     return activeOrders.filter((o) => {
3624:       // P0-1: Normalize stage_id
3625:       const stageId = getLinkId(o.stage_id);
3626:       
3627:       // For stage mode: check if it's past the start stage
3628:       if (stageId && stagesMap[stageId]) {
3629:         const stage = stagesMap[stageId];
3630:         return stage.internal_code !== 'start';
3631:       }
3632:       // Fallback: legacy status
3633:       return ["accepted", "in_progress", "ready"].includes(o.status);
3634:     });
3635:   }, [activeOrders, isKitchen, stagesMap]);
3636: 
3637:   // P0-4.1: Reset guest cache when partnerId changes (prevents stale data across restaurants)
3638:   useEffect(() => {
3639:     loadedGuestIdsRef.current = new Set();
3640:     setGuestsMap({});
3641:   }, [partnerId]);
3642: 
3643:   // P0-4: Batch load guests with loadedGuestIdsRef to prevent re-fetching
3644:   useEffect(() => {
3645:     // Kitchen doesn't see guest badges — don't load guests
3646:     if (isKitchen) return;
3647:     
3648:     async function loadGuestsBatch() {
3649:       // Protect from undefined (orders may be undefined before loading)
3650:       const list = roleFilteredOrders || [];
3651:       
3652:       // P0-4: Use ref to filter already-attempted IDs (not just guestsMap)
3653:       const guestIds = [...new Set(
3654:         list
3655:           .map(o => getLinkId(o.guest))
3656:           .filter(Boolean)
3657:           .filter(id => !loadedGuestIdsRef.current.has(id)) // P0-4: check ref instead of guestsMap
3658:       )];
3659:       
3660:       if (guestIds.length === 0) return;
3661:       
3662:       // P0-4: Mark as attempted BEFORE loading (prevents parallel duplicate requests)
3663:       guestIds.forEach(id => loadedGuestIdsRef.current.add(id));
3664:       
3665:       try {
3666:         // Load in parallel
3667:         const guestPromises = guestIds.map(id => 
3668:           base44.entities.SessionGuest.get(id).catch(() => null)
3669:         );
3670:         const guests = await Promise.all(guestPromises);
3671:         
3672:         // Single setState
3673:         const newMap = {};
3674:         guests.forEach((guest, idx) => {
3675:           if (guest) newMap[guestIds[idx]] = guest;
3676:         });
3677:         
3678:         if (Object.keys(newMap).length > 0) {
3679:           setGuestsMap(prev => ({ ...prev, ...newMap }));
3680:         }
3681:       } catch (err) {
3682:         console.error("Error loading guests batch:", err);
3683:         // P0-4: On error, we keep IDs in ref to avoid retrying failed IDs repeatedly
3684:       }
3685:     }
3686:     
3687:     loadGuestsBatch();
3688:   }, [roleFilteredOrders, isKitchen]); // P0-4: deps are correct now (loadedGuestIdsRef is ref, doesn't need to be in deps)
3689: 
3690:   const applyChannels = (list, types) => {
3691:     const s = new Set(types);
3692:     return list.filter((o) => s.has(o.order_type || "hall"));
3693:   };
3694: 
3695:   const applyAssign = (list, filters, userId) => {
3696:     const s = new Set(filters);
3697:     return list.filter((o) => {
3698:       const mine = isOrderMine(o, userId);
3699:       const free = isOrderFree(o);
3700:       const others = !mine && !free;
3701:       return (mine && s.has("mine")) || (free && s.has("free")) || (others && s.has("others"));
3702:     });
3703:   };
3704: 
3705:   const channelCounts = useMemo(() => {
3706:     const base = applyAssign(roleFilteredOrders, assignFilters, effectiveUserId);
3707:     const c = { hall: 0, pickup: 0, delivery: 0 };
3708:     base.forEach((o) => {
3709:       const t = o.order_type || "hall";
3710:       if (c[t] !== undefined) c[t]++;
3711:     });
3712:     return c;
3713:   }, [roleFilteredOrders, assignFilters, effectiveUserId]);
3714: 
3715:   const assignCounts = useMemo(() => {
3716:     const base = applyChannels(roleFilteredOrders, selectedTypes);
3717:     let mine = 0, free = 0, others = 0;
3718:     base.forEach((o) => {
3719:       if (isOrderMine(o, effectiveUserId)) mine++;
3720:       else if (isOrderFree(o)) free++;
3721:       else others++;
3722:     });
3723:     return { mine, others, free };
3724:   }, [roleFilteredOrders, selectedTypes, effectiveUserId]);
3725: 
3726:   // Updated statusRank to support stage mode - P0-1: uses normalized stageId
3727:   const statusRank = (order) => {
3728:     // P0-1: Normalize stage_id
3729:     const stageId = getLinkId(order.stage_id);
3730:     
3731:     // If using stage mode
3732:     if (stageId && stagesMap[stageId]) {
3733:       const stage = stagesMap[stageId];
3734:       // Ready/finish = highest priority (0)
3735:       if (stage.internal_code === 'finish') return 0;
3736:       // Start = second priority (1)
3737:       if (stage.internal_code === 'start') return 1;
3738:       // Middle stages by sort_order (2+)
3739:       return 2 + (stage.sort_order || 0);
3740:     }
3741:     // Fallback: legacy status
3742:     const s = order.status;
3743:     return s === "ready" ? 0 : s === "new" ? 1 : s === "in_progress" ? 2 : s === "accepted" ? 3 : 9;
3744:   };
3745: 
3746:   const visibleOrders = useMemo(() => {
3747:     let r = applyChannels(roleFilteredOrders, selectedTypes);
3748:     r = applyAssign(r, assignFilters, effectiveUserId);
3749:     
3750:     r.sort((a, b) => {
3751:       if (sortMode === "priority") {
3752:         const ra = statusRank(a), rb = statusRank(b);
3753:         if (ra !== rb) return ra - rb;
3754:         const ta = safeParseDate(a.created_date).getTime();
3755:         const tb = safeParseDate(b.created_date).getTime();
3756:         return ta - tb;
3757:       } else {
3758:         const ta = safeParseDate(a.created_date).getTime();
3759:         const tb = safeParseDate(b.created_date).getTime();
3760:         return sortOrder === "newest" ? tb - ta : ta - tb;
3761:       }
3762:     });
3763:     
3764:     return r;
3765:   }, [roleFilteredOrders, selectedTypes, assignFilters, sortMode, sortOrder, effectiveUserId, stagesMap]);
3766: 
3767:   // v2.7.0: Order groups model (hall by table, pickup/delivery individual)
3768:   const orderGroups = useMemo(() => {
3769:     if (isKitchen) return null;
3770:     
3771:     const groups = [];
3772:     const tableGroups = {};
3773:     
3774:     visibleOrders.forEach(o => {
3775:       if (o.order_type === 'hall') {
3776:         const tableId = getLinkId(o.table);
3777:         if (!tableId) return;
3778:         if (!tableGroups[tableId]) {
3779:           const tableName = tableMap[tableId]?.name || '?';
3780:           tableGroups[tableId] = {
3781:             type: 'table',
3782:             id: tableId,
3783:             displayName: tableName,
3784:             orders: [],
3785:             openSessionId: openSessionByTableId[tableId]?.id || null,
3786:           };
3787:           groups.push(tableGroups[tableId]);
3788:         }
3789:         tableGroups[tableId].orders.push(o);
3790:       } else {
3791:         groups.push({
3792:           type: o.order_type,
3793:           id: o.id,
3794:           displayName: o.order_type === 'pickup' 
3795:             ? `СВ-${o.order_number || o.id.slice(-3)}` 
3796:             : `ДОС-${o.order_number || o.id.slice(-3)}`,
3797:           orders: [o],
3798:         });
3799:       }
3800:     });
3801: 
3802:     activeRequests.forEach((req) => {
3803:       const tableId = getLinkId(req.table);
3804:       if (!tableId) return;
3805:       if (!tableGroups[tableId]) {
3806:         const tableName = tableMap[tableId]?.name || '?';
3807:         tableGroups[tableId] = {
3808:           type: 'table',
3809:           id: tableId,
3810:           displayName: tableName,
3811:           orders: [],
3812:           openSessionId: openSessionByTableId[tableId]?.id || null,
3813:         };
3814:         groups.push(tableGroups[tableId]);
3815:       }
3816:     });
3817: 
3818:     return groups;
3819:   }, [visibleOrders, tableMap, isKitchen, activeRequests, openSessionByTableId]);
3820: 
3821:   // v2.7.0: Sorted groups by oldest unaccepted order
3822:   const sortedGroups = useMemo(() => {
3823:     if (!orderGroups) return [];
3824:     
3825:     return [...orderGroups].sort((a, b) => {
3826:       const getPriority = (group) => {
3827:         const unaccepted = group.orders.filter(o => getStatusConfig(o).isFirstStage);
3828:         if (unaccepted.length === 0) return Infinity;
3829:         return Math.min(...unaccepted.map(o => safeParseDate(o.created_date).getTime()));
3830:       };
3831:       return getPriority(a) - getPriority(b);
3832:     });
3833:   }, [orderGroups, getStatusConfig]);
3834: 
3835:   // v2.7.0: Auto-expand effect
3836:   useEffect(() => {
3837:     if (!sortedGroups?.length) return;
3838:     
3839:     setExpandedGroups(prev => {
3840:       const next = new Set(prev);
3841:       sortedGroups.slice(0, 5).forEach(g => next.add(g.id));
3842:       sortedGroups.forEach(g => {
3843:         if (isFavorite(g.type === 'table' ? 'table' : 'order', g.id)) {
3844:           next.add(g.id);
3845:         }
3846:       });
3847:       return next;
3848:     });
3849:   }, [sortedGroups, isFavorite]);
3850: 
3851:   // v2.7.0: Toggle group expand
3852:   const toggleGroupExpand = useCallback((groupId) => {
3853:     setExpandedGroups(prev => {
3854:       const next = new Set(prev);
3855:       if (next.has(groupId)) next.delete(groupId);
3856:       else next.add(groupId);
3857:       return next;
3858:     });
3859:   }, []);
3860: 
3861:   // v2.7.1: Tab filtering (active vs completed)
3862:   const filteredGroups = useMemo(() => {
3863:     if (!orderGroups) return [];
3864: 
3865:     return orderGroups.filter(group => {
3866:       if (group.type === 'table') {
3867:         const hasOpenSession = !!openSessionByTableId[group.id];
3868:         if (!hasOpenSession) return activeTab === 'completed';
3869:       }
3870:       const hasActiveOrder = group.orders.some(o => {
3871:         const config = getStatusConfig(o);
3872:         return !config.isFinishStage && o.status !== 'cancelled';
3873:       });
3874:       const hasActiveRequest = group.type === 'table' && activeRequests.some(r => getLinkId(r.table) === group.id);
3875:       const hasServedButNotClosed = group.orders.some(o => {
3876:         const config = getStatusConfig(o);
3877:         return config.isFinishStage && o.status !== 'closed' && o.status !== 'cancelled';
3878:       });
3879:       return activeTab === 'active'
3880:         ? (hasActiveOrder || hasActiveRequest || hasServedButNotClosed)
3881:         : (!hasActiveOrder && !hasActiveRequest && !hasServedButNotClosed);
3882:     });
3883:   }, [orderGroups, activeTab, getStatusConfig, activeRequests, openSessionByTableId]);
3884: 
3885:   // v2.7.1: Tab counts
3886:   const tabCounts = useMemo(() => {
3887:     if (!orderGroups) return { active: 0, completed: 0 };
3888: 
3889:     let active = 0, completed = 0;
3890:     orderGroups.forEach(group => {
3891:       if (group.type === 'table' && !openSessionByTableId[group.id]) {
3892:         completed++;
3893:         return;
3894:       }
3895:       const hasActiveOrder = group.orders.some(o => {
3896:         const config = getStatusConfig(o);
3897:         return !config.isFinishStage && o.status !== 'cancelled';
3898:       });
3899:       const hasActiveRequest = group.type === 'table' && activeRequests.some(r => getLinkId(r.table) === group.id);
3900:       const hasServedButNotClosed = group.orders.some(o => {
3901:         const config = getStatusConfig(o);
3902:         return config.isFinishStage && o.status !== 'closed' && o.status !== 'cancelled';
3903:       });
3904:       if (hasActiveOrder || hasActiveRequest || hasServedButNotClosed) active++; else completed++;
3905:     });
3906: 
3907:     return { active, completed };
3908:   }, [orderGroups, getStatusConfig, activeRequests, openSessionByTableId]);
3909: 
3910:   // v2.7.1: Favorites filter

exec
"C:\\WINDOWS\\System32\\WindowsPowerShell\\v1.0\\powershell.exe" -Command '$path = '"'pages/StaffOrdersMobile/staffordersmobile.jsx'; "'$lines = Get-Content -LiteralPath $path; foreach ($range in @(@{s=2288;e=2296}, @{s=4139;e=4168}, @{s=4568;e=4615}, @{s=3835;e=3859})) { for ($i = $range.s; $i -le $range.e; $i++) { if ($i -le $lines.Length) { '"'{0}: {1}' -f "'$i, $lines[$i-1] } }; '"''; }" in C:\Users\ASUS\Dev\Menu AI Cowork\menuapp-code-review
 succeeded in 2005ms:
2288: 
2289:   const highlightRing = isHighlighted ? "ring-2 ring-indigo-400 ring-offset-1" : "";
2290: 
2291:   return (
2292:     <div data-group-id={group.id} className={`mb-3 rounded-lg border border-slate-200 overflow-hidden transition-all duration-300 ${style.bgClass} ${style.borderClass} ${highlightRing}`}>
2293:       <div className="px-4 pt-3 pb-3 cursor-pointer active:opacity-80" onClick={onToggleExpand} role="button" aria-expanded={isExpanded} aria-label={group.type === "table" ? identifier : `${identifier}: ${statusLabel}`}>
2294:         {group.type === "table" ? (
2295:           <div>
2296:             <div style={{display:'flex', alignItems:'center', gap:'10px', minHeight:'72px'}}>

4139:   const highlightTimerRef = useRef(null);
4140: 
4141:   // v4.0.0: Banner tap → expand card + scroll to it + highlight briefly
4142:   const handleBannerNavigate = useCallback((groupId) => {
4143:     if (!groupId) return;
4144:     setExpandedGroupId(groupId);
4145:     requestAnimationFrame(() => {
4146:       requestAnimationFrame(() => {
4147:         const el = document.querySelector(`[data-group-id="${CSS.escape(String(groupId))}"]`);
4148:         if (el) {
4149:           el.scrollIntoView({ behavior: 'smooth', block: 'center' });
4150:           setHighlightGroupId(groupId);
4151:           if (highlightTimerRef.current) clearTimeout(highlightTimerRef.current);
4152:           highlightTimerRef.current = setTimeout(() => setHighlightGroupId(null), 1500);
4153:         }
4154:       });
4155:     });
4156:   }, []);
4157: 
4158:   // Cleanup highlight timer
4159:   useEffect(() => () => {
4160:     if (highlightTimerRef.current) clearTimeout(highlightTimerRef.current);
4161:   }, []);
4162: 
4163:   // V2-09: Banner dismiss handler
4164:   const handleBannerDismiss = useCallback(() => {
4165:     setBannerData(null);
4166:   }, []);
4167: 
4168:   const handleRefresh = () => {

4568:       )}
4569: 
4570:       {/* v3.6.0: Close table confirmation dialog */}
4571:       {closeTableConfirm && (
4572:         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
4573:           <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6">
4574:             <h3 className="text-lg font-bold text-slate-900 mb-2">
4575:               {`Закрыть ${closeTableConfirm.tableName}?`}
4576:             </h3>
4577:             <p className="text-sm text-slate-600 mb-6">
4578:               Гости больше не смогут отправлять заказы.
4579:             </p>
4580:             <div className="flex gap-3">
4581:               <button
4582:                 type="button"
4583:                 onClick={() => setCloseTableConfirm(null)}
4584:                 className="flex-1 min-h-[44px] rounded-lg border border-slate-300 bg-white text-sm font-medium text-slate-700 active:scale-[0.98]"
4585:               >
4586:                 Отмена
4587:               </button>
4588:               <button
4589:                 type="button"
4590:                 onClick={confirmCloseTable}
4591:                 className="flex-1 min-h-[44px] rounded-lg bg-red-600 text-white text-sm font-semibold active:scale-[0.98]"
4592:               >
4593:                 Закрыть
4594:               </button>
4595:             </div>
4596:           </div>
4597:         </div>
4598:       )}
4599: 
4600:       {toastMsg && (
4601:         <div className="fixed left-0 right-0 bottom-6 z-50 flex justify-center px-4 pointer-events-none">
4602:           <div className="bg-slate-900 text-white text-sm px-4 py-2 rounded-full shadow-lg">{toastMsg}</div>
4603:         </div>
4604:       )}
4605: 
4606:       {/* V2-09: Sprint D — Banner notification overlay */}
4607:       <BannerNotification
4608:         banner={bannerData}
4609:         onDismiss={handleBannerDismiss}
4610:         onNavigate={handleBannerNavigate}
4611:       />
4612:     </div>
4613:   );
4614: }
4615: 

3835:   // v2.7.0: Auto-expand effect
3836:   useEffect(() => {
3837:     if (!sortedGroups?.length) return;
3838:     
3839:     setExpandedGroups(prev => {
3840:       const next = new Set(prev);
3841:       sortedGroups.slice(0, 5).forEach(g => next.add(g.id));
3842:       sortedGroups.forEach(g => {
3843:         if (isFavorite(g.type === 'table' ? 'table' : 'order', g.id)) {
3844:           next.add(g.id);
3845:         }
3846:       });
3847:       return next;
3848:     });
3849:   }, [sortedGroups, isFavorite]);
3850: 
3851:   // v2.7.0: Toggle group expand
3852:   const toggleGroupExpand = useCallback((groupId) => {
3853:     setExpandedGroups(prev => {
3854:       const next = new Set(prev);
3855:       if (next.has(groupId)) next.delete(groupId);
3856:       else next.add(groupId);
3857:       return next;
3858:     });
3859:   }, []);


exec
"C:\\WINDOWS\\System32\\WindowsPowerShell\\v1.0\\powershell.exe" -Command 'rg -n "expandedGroupId|expandedGroups|setExpandedGroupId|setExpandedGroups|OrderGroupCard|toggleGroupExpand" "pages/StaffOrdersMobile/staffordersmobile.jsx"' in C:\Users\ASUS\Dev\Menu AI Cowork\menuapp-code-review
 succeeded in 1881ms:
91:   - OrderGroupCard: hall grouped by table, pickup/delivery individual
1723:function OrderGroupCard({
2958:  const [undoToast, setUndoToast] = useState(null); // lifted from OrderGroupCard — survives card unmount
3061:  const [expandedGroups, setExpandedGroups] = useState(new Set());
3068:  const [expandedGroupId, setExpandedGroupId] = useState(null);
3216:  // Global undo handler — works after OrderGroupCard unmounts
3839:    setExpandedGroups(prev => {
3852:  const toggleGroupExpand = useCallback((groupId) => {
3853:    setExpandedGroups(prev => {
4134:    setExpandedGroupId(prev => prev === groupId ? null : groupId);
4144:    setExpandedGroupId(groupId);
4190:      setExpandedGroupId(null); // Collapse expanded card — table no longer active
4458:                <OrderGroupCard
4461:                  isExpanded={expandedGroupId === group.id}

exec
"C:\\WINDOWS\\System32\\WindowsPowerShell\\v1.0\\powershell.exe" -Command '$path = '"'pages/StaffOrdersMobile/staffordersmobile.jsx'; "'$lines = Get-Content -LiteralPath $path; foreach ($range in @(@{s=4128;e=4148}, @{s=4448;e=4466}, @{s=3058;e=3070})) { for ($i = $range.s; $i -le $range.e; $i++) { if ($i -le $lines.Length) { '"'{0}: {1}' -f "'$i, $lines[$i-1] } }; '"''; }" in C:\Users\ASUS\Dev\Menu AI Cowork\menuapp-code-review
 succeeded in 6465ms:
4128:     lastFilterChangeRef.current = Date.now();
4129:     setAssignFilters((p) => (p.includes(key) ? p.filter((x) => x !== key) : [...p, key]));
4130:   };
4131: 
4132:   // v4.0.0: Toggle expand/collapse — max 1 card expanded
4133:   const handleToggleExpand = useCallback((groupId) => {
4134:     setExpandedGroupId(prev => prev === groupId ? null : groupId);
4135:   }, []);
4136: 
4137:   // V2-09: Sprint D — Highlight state for banner-navigate
4138:   const [highlightGroupId, setHighlightGroupId] = useState(null);
4139:   const highlightTimerRef = useRef(null);
4140: 
4141:   // v4.0.0: Banner tap → expand card + scroll to it + highlight briefly
4142:   const handleBannerNavigate = useCallback((groupId) => {
4143:     if (!groupId) return;
4144:     setExpandedGroupId(groupId);
4145:     requestAnimationFrame(() => {
4146:       requestAnimationFrame(() => {
4147:         const el = document.querySelector(`[data-group-id="${CSS.escape(String(groupId))}"]`);
4148:         if (el) {

4448:                     onClearNotified={clearNotified}
4449:                     getStatusConfig={getStatusConfig}
4450:                     isKitchen={isKitchen}
4451:                     guestsMap={guestsMap}
4452:                     onCloseTable={null}
4453:                   />
4454:                 );
4455:               })
4456:             ) : (
4457:               v2SortedGroups.map(group => (
4458:                 <OrderGroupCard
4459:                   key={group.id}
4460:                   group={group}
4461:                   isExpanded={expandedGroupId === group.id}
4462:                   onToggleExpand={() => handleToggleExpand(group.id)}
4463:                   isHighlighted={highlightGroupId === group.id}
4464:                   isFavorite={isFavorite(group.type === 'table' ? 'table' : 'order', group.id)}
4465:                   onToggleFavorite={toggleFavorite}
4466:                   getStatusConfig={getStatusConfig}

3058:   const favoritesInitializedRef = useRef(false);
3059: 
3060:   // v2.7.0: Expanded groups state
3061:   const [expandedGroups, setExpandedGroups] = useState(new Set());
3062: 
3063:   // v2.7.1: Tabs and favorites filter state
3064:   const [activeTab, setActiveTab] = useState('active'); // 'active' | 'completed'
3065:   const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);
3066: 
3067:   // v4.0.0: Expand/collapse — max 1 expanded card at a time
3068:   const [expandedGroupId, setExpandedGroupId] = useState(null);
3069: 
3070:   useEffect(() => {


codex
The live file exposes a likely prompt-design risk already: the page still carries both `expandedGroups` and `expandedGroupId`, but only `expandedGroupId` drives rendering. I’m pulling the prompt’s exact Fix A/B/C text next to check whether it notices that split state or assumes the grouping logic is the only moving part.
exec
"C:\\WINDOWS\\System32\\WindowsPowerShell\\v1.0\\powershell.exe" -Command 'rg -n "''^## |''^### |Fix A|Fix B|Fix C|B'"\\.1|B\\.2|B\\.3|B\\.4|B\\.5|B\\.6|orphan|staleTime|orderGroups|filteredGroups|tabCounts|handleBannerNavigate|data-group-id\" \"C:\\Users\\ASUS\\Dev\\Menu AI Cowork\\pipeline\\task-260416-214227-020.prompt\"" in C:\Users\ASUS\Dev\Menu AI Cowork\menuapp-code-review
 succeeded in 2350ms:
91:## Issues Found
95:## Summary
98:## Additional Risks
101:## Prompt Clarity (MANDATORY — do NOT skip)
107:## Fix Ratings (MANDATORY — ALWAYS include this section, even if no issues found)
127:# SOM Б2.1 — Fix BUG-SM-015: New Order on Closed Table (v7)
129:<!-- PC-VERDICT: GO (Cowork S304, 2026-04-16; v7 changes vs v6: CRITICAL path fix menuapp-code-review/pages/→pages/, Fix B.5 explicit old_string, staleTime:0 bullet removed from Fix A Should-NOT, ServiceRequest phantom-card comment, Safety Guards inline commit message) -->
131:## Context
144:**BACKLOG:** #BUG-SM-015 (P0), #347 (M — session-aware orderGroups)
148:## Root Cause (VERIFIED via code reading — не предположения)
152:1. **`openSessions` query** (строки 3541-3552) использует `queryKey: ["openSessions", partnerId]` + `staleTime: 30_000` — SOM не знает о новой TableSession до 30 секунд. [V5-C1]
153:2. **`orderGroups` useMemo** (строки 3768-3819) группирует hall-заказы по `tableId` один-к-одному через `tableGroups[tableId]` — старые закрытые и новые открытые заказы стола сливаются в ОДНУ карточку.
154:3. **`filteredGroups` / `tabCounts`** (3862-3908) определяет таб по `!!openSessionByTableId[group.id]`. Если сессия не обнаружена → группа идёт в «Завершённые», но когда сессия появится (после stale expire), ВСЯ объединённая карточка переедет в «Активные» — включая старые закрытые заказы.
160:- SOM в течение 30 сек не подхватывает новую сессию (staleTime). `orderGroups` группирует новый Order в тот же `tableGroups[tableId]` что и старые закрытые Orders. `openSessionByTableId[tableId]` = undefined → группа идёт в «Завершённые».
163:**Цель фикса:** отделить Orders текущей открытой сессии от Orders закрытых сессий на уровне `orderGroups`, чтобы каждая сессия имела свою карточку с корректным табом.
167:## UX Reference
175:## FROZEN UX / FROZEN BEHAVIOR (НЕ МЕНЯТЬ)
196:- ✅ Можно менять: `orderGroups` useMemo, `filteredGroups` useMemo, `tabCounts` useMemo, `openSessions` useQuery staleTime (только значение), `data-group-id` атрибут (только live JSX), `key={}` для OrderGroupCard, `handleToggleExpand` вызов, `handleBannerNavigate`, один новый useEffect (Fix C)
197:- ⛔ Запрещено менять: sessionHelpers.js, useTableSession.jsx, OrderGroupCard внутренности, Order/TableSession entities (B44), `queryKey: ["openSessions", partnerId]` массив (только `staleTime` внутри блока), любые другие useMemo/useQuery/useCallback за пределами перечисленных выше, i18n словари, другие страницы, `buildBannerInfo`, `onNavigate(banner.groupId)` call-site
201:## Preparation (выполнить ПЕРЕД Pre-flight) — [v3: C1, v4: L6 + M6, v5: L2 + M3]
226:# 2. Pre-check: определить origin `getLinkId` — это влияет на Fix C deps array
230:#   - Import от components/... или @/... → `getLinkId` чистая, НЕ включать в Fix C useEffect deps.
232:#   - Не найдено → `getLinkId` объявлен где-то ещё; использовать `grep -rn "getLinkId" menuapp-code-review/` чтобы найти origin перед Fix C.
233:# Зафиксировать результат mental-flag → используется при применении Fix C deps.
235:# 3. [v5-M3] Pre-check: `queryClient` scope для Fix C.
236:#    Fix C использует `queryClient.invalidateQueries(...)` — переменная должна быть в scope
243:# Если переменная названа иначе (например `qc`, `qClient`) → переименовать в Fix C код ниже.
246:# 4. [v5-L5] Pre-check: react import line — для Fix C (useRef)
250:# для Edit в Fix C (useRef может уже быть в списке или нужно добавить).
259:## Pre-flight (обязательные команды ДО правки)
272:grep -n "staleTime: 30_000" "pages/StaffOrdersMobile/staffordersmobile.jsx"
280:grep -n "const orderGroups = useMemo" "pages/StaffOrdersMobile/staffordersmobile.jsx"
283:grep -n "const filteredGroups = useMemo" "pages/StaffOrdersMobile/staffordersmobile.jsx"
286:grep -n "const tabCounts = useMemo" "pages/StaffOrdersMobile/staffordersmobile.jsx"
289:# 4. [v5-M2] Pre-pin counts для всех 4 Fix B.4 Edit anchors
291:# Ожидание: ≥1 hit в v2SortedGroups.map (~4458). Может быть >1 — тогда пины по контексту (см. B.4 ниже).
303:# 5. [v5-M1] Pre-pin для data-group-id: различать live JSX vs block-comment
304:grep -n "data-group-id={group.id}" "pages/StaffOrdersMobile/staffordersmobile.jsx"
312:# 6. [v5-C3] handleBannerNavigate — CALL-CHAIN CHECK (не hit-count gate!)
313:grep -n "handleBannerNavigate" "pages/StaffOrdersMobile/staffordersmobile.jsx"
315:#   - строка ~4142: `const handleBannerNavigate = useCallback(...)`  (объявление)
316:#   - строка ~4610: `onNavigate={handleBannerNavigate}`              (prop pass в banner компонент)
325:# Это подтверждает: handleBannerNavigate ВСЕГДА получает tableId (не compositeKey), и Fix B.6
335:## Fix Priority & Dependencies
338:1. Fix A первым (одна строка, не ломает ничего).
339:2. Fix B вторым (основной UX-фикс, требует координированных правок 5 мест).
340:3. Fix C последним (зависит от типа group из Fix B — `group.sessionId`).
342:⚠️ **ORDER:** Fix B MUST be applied before Fix C (Fix C читает `group.sessionId` field, который создаётся в Fix B).
344:Если один из Fix проваливается (syntax error / conflict) → откатить ТОЛЬКО этот Fix, остальные сохранить. Fix A + Fix B дают 80% эффекта. Fix C — optimization.
348:## Identifier Contract (КРИТИЧНО — читать ДО Fix B) — [v4-C2, v5-L6]
350:В Fix B вводится новое поле `group.compositeKey` (= `${tableId}__${sessionId}`). Это создаёт ДВА разных типа идентификаторов в OrderGroupCard'ах. Любая путаница ломает функционал. Эта таблица — единственный источник истины:
352:| Где использовать | Идентификатор | Почему | Меняем ли в Fix B? |
355:| `key={...}` для OrderGroupCard в map | `group.compositeKey` | React reconciliation — каждая карточка уникальна | ✅ ДА (Fix B.4) |
356:| `data-group-id={...}` атрибут (live JSX @ ~2292) | `group.compositeKey` | DOM-селектор для banner scroll | ✅ ДА (Fix B.5) |
357:| `expandedGroupId === group.compositeKey` | `group.compositeKey` | каждая карточка expand/collapse независимо | ✅ ДА (Fix B.4) |
358:| `highlightGroupId === group.compositeKey` | `group.compositeKey` | подсветка после banner-navigate | ✅ ДА (Fix B.4) |
359:| `handleToggleExpand(group.compositeKey)` | `group.compositeKey` | передаётся в setExpandedGroupId | ✅ ДА (Fix B.4) |
360:| Tab bucketing (active/completed) — `isCurrentOpenSession` | `group.sessionId` (поле) сравнивается с `openSessionByTableId[group.id]?.id` | каждая сессия определяет свой таб независимо | ✅ ДА (Fix B.2/B.3) |
361:| `setExpandedGroupId(targetKey)` в banner-navigate | `compositeKey` (резолв из tableId через defensive helper) | scroll и expand одной карточки | ✅ ДА (Fix B.6) |
370:| **Upstream (banner dispatcher → handleBannerNavigate)** — [V5-L6] | | | |
373:| Внутри `handleBannerNavigate` тело | принимает tableId, резолвит в compositeKey | defensive — работает и с чистым tableId (наш случай) и с compositeKey (не встречается today, но безопасно) | ✅ ДА (Fix B.6) |
379:⚠️ **Call-chain для banner-navigate:** `buildBannerInfo → banner.groupId (tableId) → onNavigate(banner.groupId) @ 2825 → prop onNavigate @ 4610 → handleBannerNavigate @ 4142 → defensive резолв → compositeKey → scroll+expand`. handleBannerNavigate — единственная точка преобразования tableId → compositeKey.
383:## Codex Execution Mode (для codex-writer-v2 step) — [v4-M8, v5-M4 упрощён]
402:## Fix A: staleTime для openSessions 30s → 5s
404:### Статус: [FIX]
405:**Проблема (verified):** `staleTime: 30_000` в `openSessions` useQuery (строка ~3548) означает, что после создания новой TableSession на Base44 SOM не будет её видеть до 30 секунд. Всё это время новые Orders отображаются в карточке старой закрытой сессии.
407:### Change
409:**Grep-якорь:** `staleTime: 30_000` (ожидается 1 hit, в блоке `openSessions` useQuery, строки 3541-3552).
414:    staleTime: 30_000,
421:    staleTime: 5_000,
425:### Should NOT — [v4-M1, v5-C1]
429:**Важно:** `queryClient.invalidateQueries({ queryKey: ["openSessions"] })` в Fix C ниже — это **prefix invalidate** (react-query по умолчанию матчит `["openSessions", partnerId]` через `exact: false`). НЕ нужно менять на `["openSessions", partnerId]` — prefix работает корректно для любого текущего partnerId.
431:**Список staleTime значений в файле, которые ЗАПРЕЩЕНО трогать** (pre-check `grep -n "staleTime:" file`):
432:- `staleTime: 60_000` для `["tables", partnerId]` / `["stages", partnerId]` / `["partner"]` queries — статичный конфиг, не менять.
433:- `["orders", partnerId]` useQuery — НЕ имеет явного `staleTime` (использует `refetchInterval`); не добавлять staleTime туда.
434:- Любой другой `staleTime: ...` который не находится в `useQuery({ queryKey: ["openSessions", partnerId], ... })` блоке — НЕ ТРОГАТЬ.
437:- `queryKey` (= `["openSessions", partnerId]`) — менять сломает partitioning и Fix C invalidate + tabCounts.
442:### Verification после Fix A
445:grep -n "staleTime:" "pages/StaffOrdersMobile/staffordersmobile.jsx" | grep "5_000"
449:grep -n "staleTime: 30_000" "pages/StaffOrdersMobile/staffordersmobile.jsx"
466:## Fix B: Session-aware orderGroups (#347) + coordinated call-site updates
468:### Статус: [FIX] (основной UX-фикс)
469:**Проблема (verified):** `orderGroups` группирует hall-Orders по `tableId`. При последовательных сессиях (старая закрыта → новая открыта) ВСЕ Orders стола попадают в одну `tableGroups[tableId]` → одна карточка. Нужно группировать по `(tableId, sessionId)`, чтобы каждая TableSession имела отдельную карточку.
471:### Wireframe (было → должно быть)
490:### Changes — 5 координированных правок
492:**B.1 — `orderGroups` useMemo (~строки 3768-3819)**
494:Grep-якорь: `const orderGroups = useMemo` (1 hit). Читается как:
497:  const orderGroups = useMemo(() => {
551:**Заменить ЦЕЛИКОМ блок `const orderGroups = useMemo(...)` следующим (БЕЗ изменения deps):**
557:  const orderGroups = useMemo(() => {
578:            compositeKey,                  // NEW: React key + data-group-id + expand/highlight tracking
607:    // Такая карточка попадёт в таб «Завершённые» (filteredGroups: isCurrentOpenSession = false).
639:**B.2 — `filteredGroups` useMemo (~строки 3862-3883)**
641:Grep-якорь: `const filteredGroups = useMemo` (1 hit).
645:  const filteredGroups = useMemo(() => {
646:    if (!orderGroups) return [];
648:    return orderGroups.filter(group => {
666:  }, [orderGroups, activeTab, getStatusConfig, activeRequests, openSessionByTableId]);
669:**[v4-M2] Заменить ВЕСЬ блок `const filteredGroups = useMemo(...)` следующим (отличия от текущего: ТОЛЬКО первый `if (group.type === 'table')` блок — определение `isCurrentOpenSession` через `openId` + `group.sessionId`, вместо `hasOpenSession = !!openSessionByTableId[group.id]`). Все остальные строки — `hasActiveOrder`, `hasActiveRequest`, `hasServedButNotClosed`, return — ИДЕНТИЧНЫ оригиналу. Deps array НЕ менять.**
672:  const filteredGroups = useMemo(() => {
673:    if (!orderGroups) return [];
675:    return orderGroups.filter(group => {
696:  }, [orderGroups, activeTab, getStatusConfig, activeRequests, openSessionByTableId]);
699:⚠️ **Важно:** `hasActiveRequest` продолжает фильтровать по `getLinkId(r.table) === group.id` (tableId). Это корректно: если у стола есть request, он по Fix B.1 уже прикреплён к compositeKey текущей открытой сессии — значит эта группа (с `isCurrentOpenSession=true`) его увидит; закрытая группа (с `group.sessionId !== openId`) уже дропнулась в `completed` на раннем return.
701:**B.3 — `tabCounts` useMemo (~строки 3886-3908)**
703:Grep-якорь: `const tabCounts = useMemo` (1 hit).
707:    orderGroups.forEach(group => {
715:**[v4-M2] Заменить ВЕСЬ блок `const tabCounts = useMemo(...)` следующим (отличия от текущего: ТОЛЬКО внутренний `if (group.type === 'table' && !openSessionByTableId[group.id])` блок — заменён на `isCurrentOpenSession` проверку через `group.sessionId`. Остальное — `hasActiveOrder`, `hasActiveRequest`, `hasServedButNotClosed`, инкремент `active/completed`, return — ИДЕНТИЧНО оригиналу. Deps array НЕ менять.**
719:  const tabCounts = useMemo(() => {
720:    if (!orderGroups) return { active: 0, completed: 0 };
723:    orderGroups.forEach(group => {
746:  }, [orderGroups, getStatusConfig, activeRequests, openSessionByTableId]);
749:**B.4 — Call-site updates в OrderGroupCard map (~строки 4457-4486) — [v4-M3, v5-M2]**
761:⚠️ **Эти 4 Edit'а — единственное что меняется в B.4. Все остальные props в этом `<OrderGroupCard ... />` НЕ ТРОГАТЬ. Никаких `...` placeholder'ов в `new_string`.**
810:**B.5 — `data-group-id` (live JSX only) — [v4-M4, v5-M1 критично]**
828:#   - конструкция `return (` в пределах 5 строк до data-group-id
834:   (или `return (`) ДО и включая `data-group-id={group.id}`.
837:3. `new_string` — те же строки с единственной заменой `data-group-id={group.id}` → `data-group-id={group.compositeKey}`.
845:      data-group-id={group.id}
848:  // new_string (та же структура, только data-group-id заменён):
852:      data-group-id={group.compositeKey}
855:⚠️ **НЕ использовать `data-group-id={group.id}` как единственную строку old_string** — это может совпасть с block-comments @ ~565 / ~1173. Всегда включать `highlightRing` или `return (` строку ДО `data-group-id` для однозначной идентификации.
861:**Verification B.5 (пост-фикс):**
864:grep -c "data-group-id={group.compositeKey}" "pages/StaffOrdersMobile/staffordersmobile.jsx"
867:# Старый атрибут data-group-id={group.id} — 0 ВНЕ comments:
870:grep -cE "data-group-id=\{ *group\.compositeKey *\}" "pages/StaffOrdersMobile/staffordersmobile.jsx"
878:⚠️ КРИТИЧНО: `handleBannerNavigate` использует селектор `[data-group-id="${CSS.escape(String(targetKey))}"]`. Если LIVE `data-group-id` (@~2292) останется на `group.id`, баннер будет скроллить к первой случайной карточке (React key conflict + неправильный DOM selector). Commented hits на рендер НЕ влияют.
880:**B.6 — `handleBannerNavigate` обновить для compositeKey (~строка 4142) — [V5-L3]**
882:Grep-якорь: `const handleBannerNavigate = useCallback` (1 hit, объявление @ ~4142). Call-site: `onNavigate={handleBannerNavigate}` @ ~4610. Upstream: `onNavigate(banner.groupId)` @ ~2825, где `banner.groupId = tableId` из `buildBannerInfo @ ~4079-4090`.
886:  const handleBannerNavigate = useCallback((groupId) => {
891:        const el = document.querySelector(`[data-group-id="${CSS.escape(String(groupId))}"]`);
899:**Заменить ЦЕЛИКОМ `handleBannerNavigate` useCallback:**
901:  const handleBannerNavigate = useCallback((maybeTableIdOrCompositeKey) => {
918:        const el = document.querySelector(`[data-group-id="${CSS.escape(targetKey)}"]`);
932:**[V5-L3] Note про identity churn:** Новый dep `openSessionByTableId` пересчитывается каждый refetch `openSessions` query (каждые ~5s после Fix A). Это значит `handleBannerNavigate` получит **новую identity при каждом refetch** — если bannerComponent обёрнут в `memo` с shallow prop comparison, он будет ре-рендериться каждые 5 секунд.
940:### Should NOT (для Fix B целиком) — [v4-L4: `onCloseTable` = prop, `handleCloseTable` = handler — везде ниже используем `onCloseTable` как имя контракта]
946:- НЕ трогать pickup/delivery ветку в `orderGroups` (их compositeKey уже уникален через `o.id`).
947:- НЕ трогать `buildBannerInfo` @ ~4079-4090 или `onNavigate(banner.groupId)` @ ~2825 (upstream: Fix B.6 обрабатывает tableId через defensive резолв). [V5-L6]
950:### Связи между Fix'ами
951:⚠️ **Fix B.1 создаёт поле `group.sessionId`**, которое:
952:- используется в Fix B.2 (`filteredGroups`) и Fix B.3 (`tabCounts`) для определения таба
953:- используется в Fix C (ниже) для детектирования orphan orders
954:Если Fix B.1 падает — Fix B.2, B.3 и Fix C тоже нельзя применять.
956:### Verification после Fix B (ВСЕ команды должны пройти)
959:# 1. compositeKey появился везде где нужно (≥5 occurrences: 1 key + 1 isExpanded + 1 onToggleExpand + 1 isHighlighted + 1-3 data-group-id)
961:# Ожидание: ≥5 (4 call-sites B.4 + 1 обязательный data-group-id @ ~2292 + N в orderGroups тело).
967:# 3. Старое условие в filteredGroups убрано
973:# Ожидание: 2 hits (filteredGroups + tabCounts).
979:# 6. [v5-L4] Live data-group-id @ ~2292 использует compositeKey (loose regex — formatter-tolerant)
980:sed -n '2285,2298p' "pages/StaffOrdersMobile/staffordersmobile.jsx" | grep -cE "data-group-id=\{ *group\.compositeKey *\}"
989:# Ожидание: 4582 ≤ wc-l ≤ 4687 (base 4617, +70 max от новых строк Fix B orderGroups + Fix C useEffect, -35 tolerance за cleanup). [v5-M5: unambiguous]
994:## Fix C: Invalidate openSessions при orphan-заказах
996:### Статус: [NEW CODE — performance optimization]
997:**Проблема:** Даже с Fix A (staleTime 5s) остаётся окно до 5 секунд, когда новый Order уже в БД, но SOM его группирует без открытой сессии. Если активно полинг `orders` раньше чем `openSessions` — карточка появится в «Завершённых», потом «прыгнет» в «Активные». Fix C детектирует такие orphan Orders и делает принудительный invalidate `openSessions` — карточка появится корректно сразу.
999:### Change
1013:# Использовать `data: orders,` как единственный якорь для Fix C.
1036:  // Б2.1 Fix C: если появился hall-Order с table_session, но openSessionByTableId
1037:  // ещё не знает о ней (staleTime race) — принудительно обновить openSessions.
1045:  // [v4-M7] ONE-SHOT GUARD: запоминаем «уже инвалидировали для этой комбинации orphan-сигнатур»
1049:  const orphanInvalidateSigRef = useRef(null);
1053:    const orphanPairs = [];
1056:      // [v4-C1] закрытые/отменённые orders не считаются orphan — они принадлежат завершённой сессии
1065:        orphanPairs.push(`${tableId}:${sessionId}`);
1069:    if (orphanPairs.length === 0) {
1070:      // Reset signature когда orphan'ы исчезли (нормальное состояние) — позволит
1071:      // сработать invalidate ещё раз если в будущем появится новый orphan.
1072:      orphanInvalidateSigRef.current = null;
1076:    // [v4-M7] one-shot guard: уникальная подпись текущего набора orphan'ов
1077:    const signature = orphanPairs.sort().join(',');
1078:    if (orphanInvalidateSigRef.current === signature) {
1082:    orphanInvalidateSigRef.current = signature;
1090:**⚠️ [V5-M3] Pre-check ДО вставки:** убедиться что `queryClient` в scope (из Preparation §3). Если переменная называется иначе — заменить в коде Fix C. Если `useQueryClient()` не вызван — STOP.
1100:### Why not activeOrders? (Why not включить status filter в `activeOrders`?)
1104:### Why not useMemo вместо useEffect?
1107:### Safety (post-v4):
1112:  - **New-session race (genuine orphan):** invalidate срабатывает 1 раз → openSessions refetch → новая сессия попадает в `openSessionByTableId` → orphanPairs становится пустым → signature reset → готов к следующему orphan'у. ✅
1115:### Verification после Fix C — [V5-C4 переписан: real identifiers]
1119:grep -n "orphanInvalidateSigRef" "pages/StaffOrdersMobile/staffordersmobile.jsx"
1120:# Ожидание: ровно 3 hits — (a) `const orphanInvalidateSigRef = useRef(null);` объявление,
1121:#                            (b) `if (orphanInvalidateSigRef.current === signature)` чтение,
1122:#                            (c) `orphanInvalidateSigRef.current = signature;` запись, а также
1123:#                            (d) `orphanInvalidateSigRef.current = null;` reset. Итог 3-4 hits.
1126:grep -n "orphanPairs" "pages/StaffOrdersMobile/staffordersmobile.jsx"
1129:grep -n "orphanPairs.push" "pages/StaffOrdersMobile/staffordersmobile.jsx"
1134:# Ожидание: ≥2 hits (старый в confirmCloseTable + новый в Fix C useEffect).
1146:# Ожидание: ≥2 (1 в import, 1 в const orphanInvalidateSigRef = useRef).
1154:## Regression Check (обязательно после ВСЕХ Fix) — [V5-L1 typo fix]
1164:- [ ] Active/Completed таб счётчики (tabCounts) → корректно считают (новая сессия в «Активные», старая в «Завершённые»).
1165:- [ ] Banner-navigate (клик по alert баннеру о новом заказе) → скроллит к правильной карточке (текущей открытой сессии), раскрывает её. [V5-C3: call chain buildBannerInfo → banner.groupId (tableId) → onNavigate @ 2825 → prop @ 4610 → handleBannerNavigate @ 4142 → defensive резолв tableId → compositeKey]
1167:- [ ] Kitchen mode (`isKitchen === true`) → видит flat `visibleOrders`, без карточек. `orderGroups` возвращает `null` → не ломается.
1172:## Mobile-first check (MANDATORY)
1174:SOM — mobile-first waiter interface (375px). Изменения Fix A/B/C — backend группировка, UI не добавляется. Но т.к. FROZEN UX покрывает разметку OrderGroupCard — визуально на 375px:
1185:## Priority hierarchy (при конфликте с FROZEN UX)
1187:1. **Fix A** (staleTime) — критический, simple, safe. Обязателен.
1188:2. **Fix B.1-B.5** (orderGroups + filteredGroups + tabCounts + call-sites + data-group-id live @ 2292) — обязателен, основной UX-фикс.
1189:3. **Fix B.6** (handleBannerNavigate) — обязателен если baserunner использует `data-group-id` для скроллинга (сегодня использует через call chain buildBannerInfo → onNavigate → handleBannerNavigate).
1190:4. **Fix C** (orphan detection) — желательно. Если создаёт риски (бесконечные re-renders / CPU spike при множестве Orders) — исключить, Fix A+B достаточно для корректного UX.
1192:**Минимальная рабочая комбинация для закрытия BUG-SM-015:** Fix A + Fix B.1-B.5 (без B.6 и C). UX при этом корректен, но banner-navigate может скроллить к не-той карточке (edge case, не блокер).
1196:## Codex-specific SCOPE RESTRICTION (для codex-writer-v2 step)
1207:⛔ **НЕ комбинировать** Fix B с любыми другими рефакторингами. Даже «очевидные» cleanup'ы (удаление неиспользуемых переменных, переименование хуков) — запрещены в этом батче.
1211:## Safety Guards (финальный чек перед push)
1217:- [ ] `git diff main -- pages/StaffOrdersMobile/staffordersmobile.jsx` содержит изменения ТОЛЬКО в **8 локациях** [v4-L3, v5-M1 precision]: (1) openSessions staleTime (1 строка); (2) orderGroups useMemo (целиком); (3) filteredGroups (частично — только `if (group.type === 'table')` блок); (4) tabCounts (частично — только тот же блок); (5) OrderGroupCard map props (4 строки key/isExpanded/onToggleExpand/isHighlighted); (6) data-group-id live JSX @ ~2292 (1 место обязательно; ~565, ~1173 optional comment-only); (7) handleBannerNavigate useCallback (целиком); (8) новый useEffect + useRef Fix C.
1218:- [ ] `queryKey: ["openSessions", partnerId]` @ ~3542 ОСТАЛСЯ без изменений (только `staleTime` внутри блока изменён) [V5-C1]
1223:- [ ] Commit message: `fix(SOM): BUG-SM-015 session-aware orderGroups + staleTime 30s→5s + orphan invalidate`
1227:## Notes для рецензента ПССК
1229:Fix типы: Fix A `[FIX]` safe/single; Fix B `[FIX]` составной (7 суб-правок через `group.sessionId`); Fix C `[NEW CODE]` performance. Все anchors проверены в Pre-flight — если count не совпадает → STOP + Arman.

codex
I’ve got the prompt’s section map. Now I’m reading the exact Fix A/B/C instructions, because the main failure modes here are likely in the prompt’s proposed patch bodies, not in its high-level diagnosis.
exec
"C:\\WINDOWS\\System32\\WindowsPowerShell\\v1.0\\powershell.exe" -Command '$path = '"'C:\\Users\\ASUS\\Dev\\Menu AI Cowork\\pipeline\\task-260416-214227-020.prompt'; "'$lines = Get-Content -LiteralPath $path; foreach ($range in @(@{s=402;e=460}, @{s=492;e=746}, @{s=749;e=930}, @{s=994;e=1095})) { for ($i = $range.s; $i -le $range.e; $i++) { if ($i -le $lines.Length) { '"'{0}: {1}' -f "'$i, $lines[$i-1] } }; '"''; }" in C:\Users\ASUS\Dev\Menu AI Cowork\menuapp-code-review
 succeeded in 2009ms:
402: ## Fix A: staleTime Ð´Ð»Ñ openSessions 30s â†’ 5s
403: 
404: ### Ð¡Ñ‚Ð°Ñ‚ÑƒÑ: [FIX]
405: **ÐŸÑ€Ð¾Ð±Ð»ÐµÐ¼Ð° (verified):** `staleTime: 30_000` Ð² `openSessions` useQuery (ÑÑ‚Ñ€Ð¾ÐºÐ° ~3548) Ð¾Ð·Ð½Ð°Ñ‡Ð°ÐµÑ‚, Ñ‡Ñ‚Ð¾ Ð¿Ð¾ÑÐ»Ðµ ÑÐ¾Ð·Ð´Ð°Ð½Ð¸Ñ Ð½Ð¾Ð²Ð¾Ð¹ TableSession Ð½Ð° Base44 SOM Ð½Ðµ Ð±ÑƒÐ´ÐµÑ‚ ÐµÑ‘ Ð²Ð¸Ð´ÐµÑ‚ÑŒ Ð´Ð¾ 30 ÑÐµÐºÑƒÐ½Ð´. Ð’ÑÑ‘ ÑÑ‚Ð¾ Ð²Ñ€ÐµÐ¼Ñ Ð½Ð¾Ð²Ñ‹Ðµ Orders Ð¾Ñ‚Ð¾Ð±Ñ€Ð°Ð¶Ð°ÑŽÑ‚ÑÑ Ð² ÐºÐ°Ñ€Ñ‚Ð¾Ñ‡ÐºÐµ ÑÑ‚Ð°Ñ€Ð¾Ð¹ Ð·Ð°ÐºÑ€Ñ‹Ñ‚Ð¾Ð¹ ÑÐµÑÑÐ¸Ð¸.
406: 
407: ### Change
408: 
409: **Grep-ÑÐºÐ¾Ñ€ÑŒ:** `staleTime: 30_000` (Ð¾Ð¶Ð¸Ð´Ð°ÐµÑ‚ÑÑ 1 hit, Ð² Ð±Ð»Ð¾ÐºÐµ `openSessions` useQuery, ÑÑ‚Ñ€Ð¾ÐºÐ¸ 3541-3552).
410: 
411: **Ð¢ÐµÐºÑƒÑ‰Ð¸Ð¹ ÐºÐ¾Ð´ (ÑÑ‚Ñ€Ð¾ÐºÐ° ~3548):**
412: ```js
413:     enabled: canFetch && !!partnerId && !rateLimitHit,
414:     staleTime: 30_000,
415:     refetchInterval: effectivePollingInterval,
416: ```
417: 
418: **ÐÐ¾Ð²Ñ‹Ð¹ ÐºÐ¾Ð´ (Ð·Ð°Ð¼ÐµÐ½Ð¸Ñ‚ÑŒ Ñ€Ð¾Ð²Ð½Ð¾ Ð¾Ð´Ð½Ñƒ ÑÑ‚Ñ€Ð¾ÐºÑƒ):**
419: ```js
420:     enabled: canFetch && !!partnerId && !rateLimitHit,
421:     staleTime: 5_000,
422:     refetchInterval: effectivePollingInterval,
423: ```
424: 
425: ### Should NOT â€” [v4-M1, v5-C1]
426: 
427: **Ð¦ÐµÐ»ÐµÐ²Ð¾Ð¹ queryKey:** `["openSessions", partnerId]` (1 hit @ ~3542). **ÐÐ• ÐœÐ•ÐÐ¯Ð¢Ð¬** queryKey shape â€” ÑÑ‚Ð¾ Ð¿Ð¾Ð²Ð»Ð¸ÑÐµÑ‚ Ð½Ð° ÐºÑÑˆ-Ð¿Ð°Ñ€Ñ‚Ð¸Ñ†Ð¸Ð¾Ð½Ð¸Ñ€Ð¾Ð²Ð°Ð½Ð¸Ðµ Ð¸ ÑÐ»Ð¾Ð¼Ð°ÐµÑ‚ Ð²ÑÐµ Ð¼ÐµÑÑ‚Ð°, ÐºÐ¾Ñ‚Ð¾Ñ€Ñ‹Ðµ Ñ‡Ð¸Ñ‚Ð°ÑŽÑ‚ cache Ð´Ð»Ñ ÐºÐ¾Ð½ÐºÑ€ÐµÑ‚Ð½Ð¾Ð³Ð¾ partner. [V5-C1]
428: 
429: **Ð’Ð°Ð¶Ð½Ð¾:** `queryClient.invalidateQueries({ queryKey: ["openSessions"] })` Ð² Fix C Ð½Ð¸Ð¶Ðµ â€” ÑÑ‚Ð¾ **prefix invalidate** (react-query Ð¿Ð¾ ÑƒÐ¼Ð¾Ð»Ñ‡Ð°Ð½Ð¸ÑŽ Ð¼Ð°Ñ‚Ñ‡Ð¸Ñ‚ `["openSessions", partnerId]` Ñ‡ÐµÑ€ÐµÐ· `exact: false`). ÐÐ• Ð½ÑƒÐ¶Ð½Ð¾ Ð¼ÐµÐ½ÑÑ‚ÑŒ Ð½Ð° `["openSessions", partnerId]` â€” prefix Ñ€Ð°Ð±Ð¾Ñ‚Ð°ÐµÑ‚ ÐºÐ¾Ñ€Ñ€ÐµÐºÑ‚Ð½Ð¾ Ð´Ð»Ñ Ð»ÑŽÐ±Ð¾Ð³Ð¾ Ñ‚ÐµÐºÑƒÑ‰ÐµÐ³Ð¾ partnerId.
430: 
431: **Ð¡Ð¿Ð¸ÑÐ¾Ðº staleTime Ð·Ð½Ð°Ñ‡ÐµÐ½Ð¸Ð¹ Ð² Ñ„Ð°Ð¹Ð»Ðµ, ÐºÐ¾Ñ‚Ð¾Ñ€Ñ‹Ðµ Ð—ÐÐŸÐ Ð•Ð©Ð•ÐÐž Ñ‚Ñ€Ð¾Ð³Ð°Ñ‚ÑŒ** (pre-check `grep -n "staleTime:" file`):
432: - `staleTime: 60_000` Ð´Ð»Ñ `["tables", partnerId]` / `["stages", partnerId]` / `["partner"]` queries â€” ÑÑ‚Ð°Ñ‚Ð¸Ñ‡Ð½Ñ‹Ð¹ ÐºÐ¾Ð½Ñ„Ð¸Ð³, Ð½Ðµ Ð¼ÐµÐ½ÑÑ‚ÑŒ.
433: - `["orders", partnerId]` useQuery â€” ÐÐ• Ð¸Ð¼ÐµÐµÑ‚ ÑÐ²Ð½Ð¾Ð³Ð¾ `staleTime` (Ð¸ÑÐ¿Ð¾Ð»ÑŒÐ·ÑƒÐµÑ‚ `refetchInterval`); Ð½Ðµ Ð´Ð¾Ð±Ð°Ð²Ð»ÑÑ‚ÑŒ staleTime Ñ‚ÑƒÐ´Ð°.
434: - Ð›ÑŽÐ±Ð¾Ð¹ Ð´Ñ€ÑƒÐ³Ð¾Ð¹ `staleTime: ...` ÐºÐ¾Ñ‚Ð¾Ñ€Ñ‹Ð¹ Ð½Ðµ Ð½Ð°Ñ…Ð¾Ð´Ð¸Ñ‚ÑÑ Ð² `useQuery({ queryKey: ["openSessions", partnerId], ... })` Ð±Ð»Ð¾ÐºÐµ â€” ÐÐ• Ð¢Ð ÐžÐ“ÐÐ¢Ð¬.
435: 
436: **Ð¢Ð°ÐºÐ¶Ðµ ÐÐ• Ð¼ÐµÐ½ÑÑ‚ÑŒ Ð² `["openSessions", partnerId]` useQuery:**
437: - `queryKey` (= `["openSessions", partnerId]`) â€” Ð¼ÐµÐ½ÑÑ‚ÑŒ ÑÐ»Ð¾Ð¼Ð°ÐµÑ‚ partitioning Ð¸ Fix C invalidate + tabCounts.
438: - `queryFn` (`OpenSessions.list(...)` Ð¸Ð»Ð¸ Ð°Ð½Ð°Ð»Ð¾Ð³) â€” ÑÑ‚Ð¾ backend ÐºÐ¾Ð½Ñ‚Ñ€Ð°ÐºÑ‚.
439: - `refetchInterval: effectivePollingInterval` â€” polling ÑƒÐ¿Ñ€Ð°Ð²Ð»ÑÐµÑ‚ÑÑ Ñ‡ÐµÑ€ÐµÐ· Ð¿ÐµÑ€ÐµÐ¼ÐµÐ½Ð½ÑƒÑŽ, Ð½Ðµ Ñ‚Ñ€Ð¾Ð³Ð°Ñ‚ÑŒ.
440: - `refetchIntervalInBackground` / `retry` / `enabled` (Ð·Ð° Ð¸ÑÐºÐ»ÑŽÑ‡ÐµÐ½Ð¸ÐµÐ¼ ÑƒÐ¶Ðµ ÑÑ‚Ð¾ÑÑ‰Ð¸Ñ… ÑƒÑÐ»Ð¾Ð²Ð¸Ð¹) â€” Ð½Ðµ Ñ‚Ñ€Ð¾Ð³Ð°Ñ‚ÑŒ.
441: 
442: ### Verification Ð¿Ð¾ÑÐ»Ðµ Fix A
443: ```bash
444: # 1. Ð£Ð±ÐµÐ´Ð¸Ñ‚ÑŒÑÑ Ñ‡Ñ‚Ð¾ Ð¸Ð·Ð¼ÐµÐ½ÐµÐ½Ð° Ñ‚Ð¾Ð»ÑŒÐºÐ¾ Ð¾Ð´Ð½Ð° ÑÑ‚Ñ€Ð¾ÐºÐ°
445: grep -n "staleTime:" "pages/StaffOrdersMobile/staffordersmobile.jsx" | grep "5_000"
446: # ÐžÐ¶Ð¸Ð´Ð°Ð½Ð¸Ðµ: 1 hit, ÑÑ‚Ñ€Ð¾ÐºÐ° ~3548.
447: 
448: # 2. Ð£Ð±ÐµÐ´Ð¸Ñ‚ÑŒÑÑ Ñ‡Ñ‚Ð¾ 30_000 Ð¸ÑÑ‡ÐµÐ·
449: grep -n "staleTime: 30_000" "pages/StaffOrdersMobile/staffordersmobile.jsx"
450: # ÐžÐ¶Ð¸Ð´Ð°Ð½Ð¸Ðµ: 0 hits.
451: 
452: # 3. [v5-C1] Ð£Ð±ÐµÐ´Ð¸Ñ‚ÑŒÑÑ Ñ‡Ñ‚Ð¾ queryKey shape ÐÐ• Ð¸Ð·Ð¼ÐµÐ½Ð¸Ð»ÑÑ
453: grep -n 'queryKey: \["openSessions", partnerId\]' "pages/StaffOrdersMobile/staffordersmobile.jsx"
454: # ÐžÐ¶Ð¸Ð´Ð°Ð½Ð¸Ðµ: 1 hit, ÑÑ‚Ñ€Ð¾ÐºÐ° ~3542 (ÐºÐ°Ðº Ð¸ Ð´Ð¾ Ñ„Ð¸ÐºÑÐ°).
455: 
456: grep -n 'queryKey: \["openSessions"\]' "pages/StaffOrdersMobile/staffordersmobile.jsx"
457: # ÐžÐ¶Ð¸Ð´Ð°Ð½Ð¸Ðµ: 0 hits Ð² `useQuery(...)` ÐºÐ¾Ð½Ñ‚ÐµÐºÑÑ‚Ðµ. ÐœÐ¾Ð¶ÐµÑ‚ Ð±Ñ‹Ñ‚ÑŒ â‰¥1 hit Ð² `invalidateQueries(...)` ÐºÐ¾Ð½Ñ‚ÐµÐºÑÑ‚Ðµ â€” ÑÑ‚Ð¾ prefix invalidate, ÑÑ‚Ð¾ OK.
458: 
459: # 4. wc -l Ð½Ðµ Ð´Ð¾Ð»Ð¶ÐµÐ½ Ð¸Ð·Ð¼ÐµÐ½Ð¸Ñ‚ÑŒÑÑ
460: wc -l "pages/StaffOrdersMobile/staffordersmobile.jsx"

492: **B.1 â€” `orderGroups` useMemo (~ÑÑ‚Ñ€Ð¾ÐºÐ¸ 3768-3819)**
493: 
494: Grep-ÑÐºÐ¾Ñ€ÑŒ: `const orderGroups = useMemo` (1 hit). Ð§Ð¸Ñ‚Ð°ÐµÑ‚ÑÑ ÐºÐ°Ðº:
495: ```js
496:   // v2.7.0: Order groups model (hall by table, pickup/delivery individual)
497:   const orderGroups = useMemo(() => {
498:     if (isKitchen) return null;
499:     
500:     const groups = [];
501:     const tableGroups = {};
502:     
503:     visibleOrders.forEach(o => {
504:       if (o.order_type === 'hall') {
505:         const tableId = getLinkId(o.table);
506:         if (!tableId) return;
507:         if (!tableGroups[tableId]) {
508:           const tableName = tableMap[tableId]?.name || '?';
509:           tableGroups[tableId] = {
510:             type: 'table',
511:             id: tableId,
512:             displayName: tableName,
513:             orders: [],
514:             openSessionId: openSessionByTableId[tableId]?.id || null,
515:           };
516:           groups.push(tableGroups[tableId]);
517:         }
518:         tableGroups[tableId].orders.push(o);
519:       } else {
520:         groups.push({
521:           type: o.order_type,
522:           id: o.id,
523:           displayName: o.order_type === 'pickup' 
524:             ? `Ð¡Ð’-${o.order_number || o.id.slice(-3)}` 
525:             : `Ð”ÐžÐ¡-${o.order_number || o.id.slice(-3)}`,
526:           orders: [o],
527:         });
528:       }
529:     });
530: 
531:     activeRequests.forEach((req) => {
532:       const tableId = getLinkId(req.table);
533:       if (!tableId) return;
534:       if (!tableGroups[tableId]) {
535:         const tableName = tableMap[tableId]?.name || '?';
536:         tableGroups[tableId] = {
537:           type: 'table',
538:           id: tableId,
539:           displayName: tableName,
540:           orders: [],
541:           openSessionId: openSessionByTableId[tableId]?.id || null,
542:         };
543:         groups.push(tableGroups[tableId]);
544:       }
545:     });
546: 
547:     return groups;
548:   }, [visibleOrders, tableMap, isKitchen, activeRequests, openSessionByTableId]);
549: ```
550: 
551: **Ð—Ð°Ð¼ÐµÐ½Ð¸Ñ‚ÑŒ Ð¦Ð•Ð›Ð˜ÐšÐžÐœ Ð±Ð»Ð¾Ðº `const orderGroups = useMemo(...)` ÑÐ»ÐµÐ´ÑƒÑŽÑ‰Ð¸Ð¼ (Ð‘Ð•Ð— Ð¸Ð·Ð¼ÐµÐ½ÐµÐ½Ð¸Ñ deps):**
552: 
553: ```js
554:   // v2.7.0 + Ð‘2.1: Order groups model (hall by table+session, pickup/delivery individual)
555:   // BUG-SM-015: Split table orders by session_id so closed session stays in
556:   // Â«Ð—Ð°Ð²ÐµÑ€ÑˆÑ‘Ð½Ð½Ñ‹ÐµÂ» while new session appears as a fresh card in Â«ÐÐºÑ‚Ð¸Ð²Ð½Ñ‹ÐµÂ».
557:   const orderGroups = useMemo(() => {
558:     if (isKitchen) return null;
559: 
560:     const groups = [];
561:     const tableGroups = {}; // key: `${tableId}__${sessionKey}` where sessionKey = sessionId || 'no-session'
562: 
563:     visibleOrders.forEach(o => {
564:       if (o.order_type === 'hall') {
565:         const tableId = getLinkId(o.table);
566:         if (!tableId) return;
567: 
568:         const orderSessionId = getLinkId(o.table_session) || 'no-session';
569:         const openSessionId = openSessionByTableId[tableId]?.id || null;
570:         const compositeKey = `${tableId}__${orderSessionId}`;
571: 
572:         if (!tableGroups[compositeKey]) {
573:           const tableName = tableMap[tableId]?.name || '?';
574:           tableGroups[compositeKey] = {
575:             type: 'table',
576:             id: tableId,                   // tableId â€” Ð¸ÑÐ¿Ð¾Ð»ÑŒÐ·ÑƒÐµÑ‚ÑÑ Ð´Ð»Ñ favorites, servedOrders query, onCloseTable callback
577:             sessionId: orderSessionId === 'no-session' ? null : orderSessionId, // NEW: ÑÐµÑÑÐ¸Ñ ÑÑ‚Ð¾Ð¹ Ð³Ñ€ÑƒÐ¿Ð¿Ñ‹ (null Ð´Ð»Ñ legacy orders Ð±ÐµÐ· session)
578:             compositeKey,                  // NEW: React key + data-group-id + expand/highlight tracking
579:             displayName: tableName,
580:             orders: [],
581:             openSessionId,                 // ID Ð¾Ñ‚ÐºÑ€Ñ‹Ñ‚Ð¾Ð¹ ÑÐµÑÑÐ¸Ð¸ Ð´Ð»Ñ ÑÑ‚Ð¾Ð³Ð¾ ÑÑ‚Ð¾Ð»Ð° (Ð¼Ð¾Ð¶ÐµÑ‚ != sessionId ÐµÑÐ»Ð¸ Ð·Ð°ÐºÑ€Ñ‹Ñ‚Ð°Ñ)
582:           };
583:           groups.push(tableGroups[compositeKey]);
584:         }
585:         tableGroups[compositeKey].orders.push(o);
586:       } else {
587:         // Pickup/Delivery â€” ÑƒÐ½Ð¸ÐºÐ°Ð»ÑŒÐ½Ñ‹ Ð¿Ð¾ orderId, Ð½Ðµ Ð¼ÐµÐ½ÑÐµÐ¼ Ð»Ð¾Ð³Ð¸ÐºÑƒ.
588:         groups.push({
589:           type: o.order_type,
590:           id: o.id,
591:           sessionId: null,
592:           compositeKey: `${o.order_type}__${o.id}`,
593:           displayName: o.order_type === 'pickup'
594:             ? `Ð¡Ð’-${o.order_number || o.id.slice(-3)}`
595:             : `Ð”ÐžÐ¡-${o.order_number || o.id.slice(-3)}`,
596:           orders: [o],
597:         });
598:       }
599:     });
600: 
601:     // ServiceRequest â†’ Ð¿Ñ€Ð¸Ð²ÑÐ·Ð°Ñ‚ÑŒ Ðº Ð³Ñ€ÑƒÐ¿Ð¿Ðµ Ð¢Ð•ÐšÐ£Ð©Ð•Ð™ Ð¾Ñ‚ÐºÑ€Ñ‹Ñ‚Ð¾Ð¹ ÑÐµÑÑÐ¸Ð¸ (ÐµÑÐ»Ð¸ ÐµÑÑ‚ÑŒ),
602:     // Ð¸Ð½Ð°Ñ‡Ðµ Ðº `${tableId}__no-session`. Ð—Ð°Ð¿Ñ€Ð¾ÑÑ‹ Ð¾Ñ‚ Ð·Ð°ÐºÑ€Ñ‹Ñ‚Ñ‹Ñ… ÑÐµÑÑÐ¸Ð¹ ÑƒÐ¶Ðµ Ð² ÑÑ‚Ð°Ñ‚ÑƒÑÐµ 'done'
603:     // (ÑÐ¼. closeSession Ð² sessionHelpers.js:175-188), Ð¿Ð¾ÑÑ‚Ð¾Ð¼Ñƒ Ð² activeRequests Ð½Ðµ Ð¿Ð¾Ð¿Ð°Ð´Ð°ÑŽÑ‚.
604:     //
605:     // âš ï¸ [v7-M1] INTENTIONAL: ÐµÑÐ»Ð¸ Ñƒ ÑÑ‚Ð¾Ð»Ð° Ð½ÐµÑ‚ Ð¾Ñ‚ÐºÑ€Ñ‹Ñ‚Ð¾Ð¹ ÑÐµÑÑÐ¸Ð¸ (openSessionId = null),
606:     // ÑÐ¾Ð·Ð´Ð°Ñ‘Ñ‚ÑÑ ÐºÐ°Ñ€Ñ‚Ð¾Ñ‡ÐºÐ° Ñ `orders: []`, `sessionId: null`, `compositeKey: ${tableId}__no-session`.
607:     // Ð¢Ð°ÐºÐ°Ñ ÐºÐ°Ñ€Ñ‚Ð¾Ñ‡ÐºÐ° Ð¿Ð¾Ð¿Ð°Ð´Ñ‘Ñ‚ Ð² Ñ‚Ð°Ð± Â«Ð—Ð°Ð²ÐµÑ€ÑˆÑ‘Ð½Ð½Ñ‹ÐµÂ» (filteredGroups: isCurrentOpenSession = false).
608:     // Ð­Ñ‚Ð¾ ÐºÐ¾Ñ€Ñ€ÐµÐºÑ‚Ð½Ð¾Ðµ Ð¿Ð¾Ð²ÐµÐ´ÐµÐ½Ð¸Ðµ: ServiceRequest Ð±ÐµÐ· Ð¾Ñ‚ÐºÑ€Ñ‹Ñ‚Ð¾Ð¹ ÑÐµÑÑÐ¸Ð¸ â€” Ð·Ð°Ð²ÐµÑ€ÑˆÑ‘Ð½Ð½Ñ‹Ð¹ Ð·Ð°Ð¿Ñ€Ð¾Ñ.
609:     // Ð•ÑÐ»Ð¸ Ð² Ð±ÑƒÐ´ÑƒÑ‰ÐµÐ¼ Ð¾Ñ‚ÐºÑ€Ð¾ÐµÑ‚ÑÑ ÑÐµÑÑÐ¸Ñ â†’ ÐºÐ°Ñ€Ñ‚Ð¾Ñ‡ÐºÐ° Ð´Ð»Ñ Ð½ÐµÑ‘ ÑÐ¾Ð·Ð´Ð°ÑÑ‚ÑÑ Ñ‡ÐµÑ€ÐµÐ· visibleOrders.
610:     activeRequests.forEach((req) => {
611:       const tableId = getLinkId(req.table);
612:       if (!tableId) return;
613: 
614:       const openSessionId = openSessionByTableId[tableId]?.id || null;
615:       const targetSessionKey = openSessionId || 'no-session';
616:       const compositeKey = `${tableId}__${targetSessionKey}`;
617: 
618:       if (!tableGroups[compositeKey]) {
619:         const tableName = tableMap[tableId]?.name || '?';
620:         tableGroups[compositeKey] = {
621:           type: 'table',
622:           id: tableId,
623:           sessionId: openSessionId,       // null ÐµÑÐ»Ð¸ no open session
624:           compositeKey,
625:           displayName: tableName,
626:           orders: [],
627:           openSessionId,
628:         };
629:         groups.push(tableGroups[compositeKey]);
630:       }
631:     });
632: 
633:     return groups;
634:   }, [visibleOrders, tableMap, isKitchen, activeRequests, openSessionByTableId]);
635: ```
636: 
637: **NOTE:** Ð¡Ð¾Ñ…Ñ€Ð°Ð½ÑÐµÑ‚ÑÑ Ñ‚Ð¾Ñ‚ Ð¶Ðµ dependency array (Ð´Ð¾Ð±Ð°Ð²Ð»ÑÑ‚ÑŒ Ð·Ð°Ð²Ð¸ÑÐ¸Ð¼Ð¾ÑÑ‚Ð¸ Ð½Ðµ Ñ‚Ñ€ÐµÐ±ÑƒÐµÑ‚ÑÑ â€” Ð²ÑÐµ Ð¸ÑÐ¿Ð¾Ð»ÑŒÐ·ÑƒÐµÐ¼Ñ‹Ðµ Ð² Ñ‚ÐµÐ»Ðµ Ð¿ÐµÑ€ÐµÐ¼ÐµÐ½Ð½Ñ‹Ðµ ÑƒÐ¶Ðµ Ð±Ñ‹Ð»Ð¸ Ð² ÑÑ‚Ð°Ñ€Ð¾Ð¼ Ð¼Ð°ÑÑÐ¸Ð²Ðµ).
638: 
639: **B.2 â€” `filteredGroups` useMemo (~ÑÑ‚Ñ€Ð¾ÐºÐ¸ 3862-3883)**
640: 
641: Grep-ÑÐºÐ¾Ñ€ÑŒ: `const filteredGroups = useMemo` (1 hit).
642: 
643: **Ð¢ÐµÐºÑƒÑ‰Ð¸Ð¹ ÐºÐ¾Ð´:**
644: ```js
645:   const filteredGroups = useMemo(() => {
646:     if (!orderGroups) return [];
647: 
648:     return orderGroups.filter(group => {
649:       if (group.type === 'table') {
650:         const hasOpenSession = !!openSessionByTableId[group.id];
651:         if (!hasOpenSession) return activeTab === 'completed';
652:       }
653:       const hasActiveOrder = group.orders.some(o => {
654:         const config = getStatusConfig(o);
655:         return !config.isFinishStage && o.status !== 'cancelled';
656:       });
657:       const hasActiveRequest = group.type === 'table' && activeRequests.some(r => getLinkId(r.table) === group.id);
658:       const hasServedButNotClosed = group.orders.some(o => {
659:         const config = getStatusConfig(o);
660:         return config.isFinishStage && o.status !== 'closed' && o.status !== 'cancelled';
661:       });
662:       return activeTab === 'active'
663:         ? (hasActiveOrder || hasActiveRequest || hasServedButNotClosed)
664:         : (!hasActiveOrder && !hasActiveRequest && !hasServedButNotClosed);
665:     });
666:   }, [orderGroups, activeTab, getStatusConfig, activeRequests, openSessionByTableId]);
667: ```
668: 
669: **[v4-M2] Ð—Ð°Ð¼ÐµÐ½Ð¸Ñ‚ÑŒ Ð’Ð•Ð¡Ð¬ Ð±Ð»Ð¾Ðº `const filteredGroups = useMemo(...)` ÑÐ»ÐµÐ´ÑƒÑŽÑ‰Ð¸Ð¼ (Ð¾Ñ‚Ð»Ð¸Ñ‡Ð¸Ñ Ð¾Ñ‚ Ñ‚ÐµÐºÑƒÑ‰ÐµÐ³Ð¾: Ð¢ÐžÐ›Ð¬ÐšÐž Ð¿ÐµÑ€Ð²Ñ‹Ð¹ `if (group.type === 'table')` Ð±Ð»Ð¾Ðº â€” Ð¾Ð¿Ñ€ÐµÐ´ÐµÐ»ÐµÐ½Ð¸Ðµ `isCurrentOpenSession` Ñ‡ÐµÑ€ÐµÐ· `openId` + `group.sessionId`, Ð²Ð¼ÐµÑÑ‚Ð¾ `hasOpenSession = !!openSessionByTableId[group.id]`). Ð’ÑÐµ Ð¾ÑÑ‚Ð°Ð»ÑŒÐ½Ñ‹Ðµ ÑÑ‚Ñ€Ð¾ÐºÐ¸ â€” `hasActiveOrder`, `hasActiveRequest`, `hasServedButNotClosed`, return â€” Ð˜Ð”Ð•ÐÐ¢Ð˜Ð§ÐÐ« Ð¾Ñ€Ð¸Ð³Ð¸Ð½Ð°Ð»Ñƒ. Deps array ÐÐ• Ð¼ÐµÐ½ÑÑ‚ÑŒ.**
670: 
671: ```js
672:   const filteredGroups = useMemo(() => {
673:     if (!orderGroups) return [];
674: 
675:     return orderGroups.filter(group => {
676:       if (group.type === 'table') {
677:         // Ð‘2.1: Ð³Ñ€ÑƒÐ¿Ð¿Ð° Ð¿Ñ€Ð¸Ð½Ð°Ð´Ð»ÐµÐ¶Ð¸Ñ‚ Â«ÐÐºÑ‚Ð¸Ð²Ð½Ñ‹Ð¼Â» Ð¢ÐžÐ›Ð¬ÐšÐž ÐµÑÐ»Ð¸ ÐµÑ‘ sessionId ÑÐ¾Ð²Ð¿Ð°Ð´Ð°ÐµÑ‚ Ñ Ñ‚ÐµÐºÑƒÑ‰ÐµÐ¹
678:         // Ð¾Ñ‚ÐºÑ€Ñ‹Ñ‚Ð¾Ð¹ ÑÐµÑÑÐ¸ÐµÐ¹ Ð´Ð»Ñ ÑÑ‚Ð¾Ð»Ð°. Ð—Ð°ÐºÑ€Ñ‹Ñ‚Ñ‹Ðµ ÑÐµÑÑÐ¸Ð¸ (group.sessionId !== openId Ð¸Ð»Ð¸ no-session) â†’ Â«Ð—Ð°Ð²ÐµÑ€ÑˆÑ‘Ð½Ð½Ñ‹ÐµÂ».
679:         const openId = openSessionByTableId[group.id]?.id || null;
680:         const isCurrentOpenSession = !!openId && group.sessionId === openId;
681:         if (!isCurrentOpenSession) return activeTab === 'completed';
682:       }
683:       const hasActiveOrder = group.orders.some(o => {
684:         const config = getStatusConfig(o);
685:         return !config.isFinishStage && o.status !== 'cancelled';
686:       });
687:       const hasActiveRequest = group.type === 'table' && activeRequests.some(r => getLinkId(r.table) === group.id);
688:       const hasServedButNotClosed = group.orders.some(o => {
689:         const config = getStatusConfig(o);
690:         return config.isFinishStage && o.status !== 'closed' && o.status !== 'cancelled';
691:       });
692:       return activeTab === 'active'
693:         ? (hasActiveOrder || hasActiveRequest || hasServedButNotClosed)
694:         : (!hasActiveOrder && !hasActiveRequest && !hasServedButNotClosed);
695:     });
696:   }, [orderGroups, activeTab, getStatusConfig, activeRequests, openSessionByTableId]);
697: ```
698: 
699: âš ï¸ **Ð’Ð°Ð¶Ð½Ð¾:** `hasActiveRequest` Ð¿Ñ€Ð¾Ð´Ð¾Ð»Ð¶Ð°ÐµÑ‚ Ñ„Ð¸Ð»ÑŒÑ‚Ñ€Ð¾Ð²Ð°Ñ‚ÑŒ Ð¿Ð¾ `getLinkId(r.table) === group.id` (tableId). Ð­Ñ‚Ð¾ ÐºÐ¾Ñ€Ñ€ÐµÐºÑ‚Ð½Ð¾: ÐµÑÐ»Ð¸ Ñƒ ÑÑ‚Ð¾Ð»Ð° ÐµÑÑ‚ÑŒ request, Ð¾Ð½ Ð¿Ð¾ Fix B.1 ÑƒÐ¶Ðµ Ð¿Ñ€Ð¸ÐºÑ€ÐµÐ¿Ð»Ñ‘Ð½ Ðº compositeKey Ñ‚ÐµÐºÑƒÑ‰ÐµÐ¹ Ð¾Ñ‚ÐºÑ€Ñ‹Ñ‚Ð¾Ð¹ ÑÐµÑÑÐ¸Ð¸ â€” Ð·Ð½Ð°Ñ‡Ð¸Ñ‚ ÑÑ‚Ð° Ð³Ñ€ÑƒÐ¿Ð¿Ð° (Ñ `isCurrentOpenSession=true`) ÐµÐ³Ð¾ ÑƒÐ²Ð¸Ð´Ð¸Ñ‚; Ð·Ð°ÐºÑ€Ñ‹Ñ‚Ð°Ñ Ð³Ñ€ÑƒÐ¿Ð¿Ð° (Ñ `group.sessionId !== openId`) ÑƒÐ¶Ðµ Ð´Ñ€Ð¾Ð¿Ð½ÑƒÐ»Ð°ÑÑŒ Ð² `completed` Ð½Ð° Ñ€Ð°Ð½Ð½ÐµÐ¼ return.
700: 
701: **B.3 â€” `tabCounts` useMemo (~ÑÑ‚Ñ€Ð¾ÐºÐ¸ 3886-3908)**
702: 
703: Grep-ÑÐºÐ¾Ñ€ÑŒ: `const tabCounts = useMemo` (1 hit).
704: 
705: **Ð¢ÐµÐºÑƒÑ‰Ð¸Ð¹ ÐºÐ¾Ð´ (relevant Ñ‡Ð°ÑÑ‚ÑŒ):**
706: ```js
707:     orderGroups.forEach(group => {
708:       if (group.type === 'table' && !openSessionByTableId[group.id]) {
709:         completed++;
710:         return;
711:       }
712:       ...
713: ```
714: 
715: **[v4-M2] Ð—Ð°Ð¼ÐµÐ½Ð¸Ñ‚ÑŒ Ð’Ð•Ð¡Ð¬ Ð±Ð»Ð¾Ðº `const tabCounts = useMemo(...)` ÑÐ»ÐµÐ´ÑƒÑŽÑ‰Ð¸Ð¼ (Ð¾Ñ‚Ð»Ð¸Ñ‡Ð¸Ñ Ð¾Ñ‚ Ñ‚ÐµÐºÑƒÑ‰ÐµÐ³Ð¾: Ð¢ÐžÐ›Ð¬ÐšÐž Ð²Ð½ÑƒÑ‚Ñ€ÐµÐ½Ð½Ð¸Ð¹ `if (group.type === 'table' && !openSessionByTableId[group.id])` Ð±Ð»Ð¾Ðº â€” Ð·Ð°Ð¼ÐµÐ½Ñ‘Ð½ Ð½Ð° `isCurrentOpenSession` Ð¿Ñ€Ð¾Ð²ÐµÑ€ÐºÑƒ Ñ‡ÐµÑ€ÐµÐ· `group.sessionId`. ÐžÑÑ‚Ð°Ð»ÑŒÐ½Ð¾Ðµ â€” `hasActiveOrder`, `hasActiveRequest`, `hasServedButNotClosed`, Ð¸Ð½ÐºÑ€ÐµÐ¼ÐµÐ½Ñ‚ `active/completed`, return â€” Ð˜Ð”Ð•ÐÐ¢Ð˜Ð§ÐÐž Ð¾Ñ€Ð¸Ð³Ð¸Ð½Ð°Ð»Ñƒ. Deps array ÐÐ• Ð¼ÐµÐ½ÑÑ‚ÑŒ.**
716: 
717: ```js
718:   // v2.7.1: Tab counts
719:   const tabCounts = useMemo(() => {
720:     if (!orderGroups) return { active: 0, completed: 0 };
721: 
722:     let active = 0, completed = 0;
723:     orderGroups.forEach(group => {
724:       if (group.type === 'table') {
725:         // Ð‘2.1: Ð³Ñ€ÑƒÐ¿Ð¿Ð° Ð¿Ñ€Ð¸Ð½Ð°Ð´Ð»ÐµÐ¶Ð¸Ñ‚ Â«Ð—Ð°Ð²ÐµÑ€ÑˆÑ‘Ð½Ð½Ñ‹Ð¼Â» ÐµÑÐ»Ð¸ ÑÑ‚Ð¾ ÐÐ• Ð³Ñ€ÑƒÐ¿Ð¿Ð° Ñ‚ÐµÐºÑƒÑ‰ÐµÐ¹ Ð¾Ñ‚ÐºÑ€Ñ‹Ñ‚Ð¾Ð¹ ÑÐµÑÑÐ¸Ð¸
726:         const openId = openSessionByTableId[group.id]?.id || null;
727:         const isCurrentOpenSession = !!openId && group.sessionId === openId;
728:         if (!isCurrentOpenSession) {
729:           completed++;
730:           return;
731:         }
732:       }
733:       const hasActiveOrder = group.orders.some(o => {
734:         const config = getStatusConfig(o);
735:         return !config.isFinishStage && o.status !== 'cancelled';
736:       });
737:       const hasActiveRequest = group.type === 'table' && activeRequests.some(r => getLinkId(r.table) === group.id);
738:       const hasServedButNotClosed = group.orders.some(o => {
739:         const config = getStatusConfig(o);
740:         return config.isFinishStage && o.status !== 'closed' && o.status !== 'cancelled';
741:       });
742:       if (hasActiveOrder || hasActiveRequest || hasServedButNotClosed) active++; else completed++;
743:     });
744: 
745:     return { active, completed };
746:   }, [orderGroups, getStatusConfig, activeRequests, openSessionByTableId]);

749: **B.4 â€” Call-site updates Ð² OrderGroupCard map (~ÑÑ‚Ñ€Ð¾ÐºÐ¸ 4457-4486) â€” [v4-M3, v5-M2]**
750: 
751: Grep-ÑÐºÐ¾Ñ€ÑŒ: `v2SortedGroups.map(group => (` (1 hit). ÐœÐµÐ½ÑÐµÐ¼ Ð ÐžÐ’ÐÐž 4 ÑÑ‚Ñ€Ð¾ÐºÐ¸ props Ñ‡ÐµÑ€ÐµÐ· 4 Ð¾Ñ‚Ð´ÐµÐ»ÑŒÐ½Ñ‹Ñ… Edit.
752: 
753: âš ï¸ **[V5-M2] Pre-pinned counts** (Ð¸Ð· Pre-flight ÑˆÐ°Ð³ 4, ÑƒÐ±ÐµÐ´Ð¸ÑÑŒ Ñ‡Ñ‚Ð¾ ÑÐ¾Ð¾Ñ‚Ð²ÐµÑ‚ÑÑ‚Ð²ÑƒÐµÑ‚):
754: - `key={group.id}` â€” â‰¥1 hit (Ð¼Ð¾Ð¶ÐµÑ‚ Ð±Ñ‹Ñ‚ÑŒ Ð² Ð½ÐµÑÐºÐ¾Ð»ÑŒÐºÐ¸Ñ… map-Ð±Ð»Ð¾ÐºÐ°Ñ…; ÑÐ¼. context requirements Ð½Ð¸Ð¶Ðµ)
755: - `expandedGroupId === group.id` â€” Ð ÐžÐ’ÐÐž 1 hit (~4461)
756: - `onToggleExpand={() => handleToggleExpand(group.id)}` â€” Ð ÐžÐ’ÐÐž 1 hit (~4462)
757: - `isHighlighted={highlightGroupId === group.id}` â€” Ð ÐžÐ’ÐÐž 1 hit
758: 
759: Ð•ÑÐ»Ð¸ `key={group.id}` Ð´Ð°Ñ‘Ñ‚ >1 hit â€” ÑÑ‚Ð¾ Ð¾Ð¶Ð¸Ð´Ð°ÐµÐ¼Ð¾ (ÐµÑÑ‚ÑŒ Ð¾Ñ‚Ð´ÐµÐ»ÑŒÐ½Ñ‹Ð¹ map Ð´Ð»Ñ pickup/delivery OrderCard â€” ÐÐ• Ñ‚Ñ€Ð¾Ð³Ð°Ñ‚ÑŒ). Ð˜ÑÐ¿Ð¾Ð»ÑŒÐ·ÑƒÐµÐ¼ surrounding context Ñ‡Ñ‚Ð¾Ð±Ñ‹ Edit Ð·Ð°Ñ‚Ñ€Ð¾Ð½ÑƒÐ» Ñ‚Ð¾Ð»ÑŒÐºÐ¾ `v2SortedGroups.map` Ð±Ð»Ð¾Ðº.
760: 
761: âš ï¸ **Ð­Ñ‚Ð¸ 4 Edit'Ð° â€” ÐµÐ´Ð¸Ð½ÑÑ‚Ð²ÐµÐ½Ð½Ð¾Ðµ Ñ‡Ñ‚Ð¾ Ð¼ÐµÐ½ÑÐµÑ‚ÑÑ Ð² B.4. Ð’ÑÐµ Ð¾ÑÑ‚Ð°Ð»ÑŒÐ½Ñ‹Ðµ props Ð² ÑÑ‚Ð¾Ð¼ `<OrderGroupCard ... />` ÐÐ• Ð¢Ð ÐžÐ“ÐÐ¢Ð¬. ÐÐ¸ÐºÐ°ÐºÐ¸Ñ… `...` placeholder'Ð¾Ð² Ð² `new_string`.**
762: 
763: **Edit 1 â€” `key` (Ð¸ÑÐ¿Ð¾Ð»ÑŒÐ·ÑƒÐµÐ¼ ÐºÐ¾Ð½Ñ‚ÐµÐºÑÑ‚ Ð´Ð»Ñ disambiguation):**
764: - old_string:
765:   ```
766:               v2SortedGroups.map(group => (
767:                 <OrderGroupCard
768:                   key={group.id}
769:   ```
770: - new_string:
771:   ```
772:               v2SortedGroups.map(group => (
773:                 <OrderGroupCard
774:                   key={group.compositeKey}
775:   ```
776: 
777: **Edit 2 â€” `isExpanded` (ÐµÐ´Ð¸Ð½ÑÑ‚Ð²ÐµÐ½Ð½Ñ‹Ð¹ hit, ÑƒÐ½Ð¸ÐºÐ°Ð»ÐµÐ½):**
778: - old_string: `                  isExpanded={expandedGroupId === group.id}`
779: - new_string: `                  isExpanded={expandedGroupId === group.compositeKey}`
780: 
781: **Edit 3 â€” `onToggleExpand` (ÐµÐ´Ð¸Ð½ÑÑ‚Ð²ÐµÐ½Ð½Ñ‹Ð¹ hit, ÑƒÐ½Ð¸ÐºÐ°Ð»ÐµÐ½):**
782: - old_string: `                  onToggleExpand={() => handleToggleExpand(group.id)}`
783: - new_string: `                  onToggleExpand={() => handleToggleExpand(group.compositeKey)}`
784: 
785: **Edit 4 â€” `isHighlighted` (ÐµÐ´Ð¸Ð½ÑÑ‚Ð²ÐµÐ½Ð½Ñ‹Ð¹ hit, ÑƒÐ½Ð¸ÐºÐ°Ð»ÐµÐ½):**
786: - old_string: `                  isHighlighted={highlightGroupId === group.id}`
787: - new_string: `                  isHighlighted={highlightGroupId === group.compositeKey}`
788: 
789: **Ð˜Ð»Ð»ÑŽÑÑ‚Ñ€Ð°Ñ†Ð¸Ñ ÐºÐ¾Ð½Ñ‚ÐµÐºÑÑ‚Ð° (ÐÐ• ÐºÐ¾Ð¿Ð¸Ñ€Ð¾Ð²Ð°Ñ‚ÑŒ Ð² Edit â€” ÑÑ‚Ð¾ Ð´Ð»Ñ Ð¿Ð¾Ð½Ð¸Ð¼Ð°Ð½Ð¸Ñ, ÑÐ¼. Identifier Contract Ñ‚Ð°Ð±Ð»Ð¸Ñ†Ñƒ Ð²Ñ‹ÑˆÐµ):**
790: ```jsx
791:               v2SortedGroups.map(group => (
792:                 <OrderGroupCard
793:                   key={group.compositeKey}                                                /* CHANGED */
794:                   group={group}
795:                   isExpanded={expandedGroupId === group.compositeKey}                     /* CHANGED */
796:                   onToggleExpand={() => handleToggleExpand(group.compositeKey)}           /* CHANGED */
797:                   isHighlighted={highlightGroupId === group.compositeKey}                 /* CHANGED */
798:                   isFavorite={isFavorite(group.type === 'table' ? 'table' : 'order', group.id)} /* group.id â€” ÐÐ• Ð¼ÐµÐ½ÑÑ‚ÑŒ (tableId Ð´Ð»Ñ favorites) */
799:                   onToggleFavorite={toggleFavorite}                                       /* ÐÐ• Ð¼ÐµÐ½ÑÑ‚ÑŒ */
800:                   /* Ð¾ÑÑ‚Ð°Ð»ÑŒÐ½Ñ‹Ðµ props â€” onCloseTable, activeRequests, onBatchCloseRequestAsync Ð¸ Ð´Ñ€. â€” ÐÐ• Ð¼ÐµÐ½ÑÑ‚ÑŒ */
801:                 />
802:               ))
803: ```
804: 
805: âš ï¸ **ÐÐ• Ð¼ÐµÐ½ÑÑ‚ÑŒ (Ð¿Ð¾Ð²Ñ‚Ð¾Ñ€ Ð´Ð»Ñ Ð±ÐµÐ·Ð¾Ð¿Ð°ÑÐ½Ð¾ÑÑ‚Ð¸):**
806: - `isFavorite(...)` Ð²Ñ‹Ð·Ð¾Ð² â€” Ð¾ÑÑ‚Ð°Ñ‘Ñ‚ÑÑ Ð½Ð° `group.id` (tableId). Ð¤Ð°Ð²Ð¾Ñ€Ð¸Ñ‚Ñ‹ Ð´Ð¾Ð»Ð¶Ð½Ñ‹ Ð²Ñ‹Ð¶Ð¸Ð²Ð°Ñ‚ÑŒ ÑÐ¼ÐµÐ½Ñƒ ÑÐµÑÑÐ¸Ð¸.
807: - `onToggleFavorite` â€” Ð¾ÑÑ‚Ð°Ñ‘Ñ‚ÑÑ `toggleFavorite` Ð±ÐµÐ· wrapper'Ð° (ÑÐ¸Ð³Ð½Ð°Ñ‚ÑƒÑ€Ð° `(type, id)` Ð½Ðµ Ð¼ÐµÐ½ÑÐµÑ‚ÑÑ).
808: - ÐžÑÑ‚Ð°Ð»ÑŒÐ½Ñ‹Ðµ props (`onCloseTable`, `activeRequests`, `onBatchCloseRequestAsync`, etc.) â€” Ð½Ðµ Ñ‚Ñ€Ð¾Ð³Ð°Ñ‚ÑŒ.
809: 
810: **B.5 â€” `data-group-id` (live JSX only) â€” [v4-M4, v5-M1 ÐºÑ€Ð¸Ñ‚Ð¸Ñ‡Ð½Ð¾]**
811: 
812: [V5-M1] **Ð¢Ð¾Ð»ÑŒÐºÐ¾ 1 live JSX replacement Ð¾Ð±ÑÐ·Ð°Ñ‚ÐµÐ»ÐµÐ½. 2 Ð´Ñ€ÑƒÐ³Ð¸Ñ… â€” non-blocking commented snapshots.**
813: 
814: Pre-check (Ð¸Ð· Pre-flight Â§5) Ð´Ð¾Ð»Ð¶ÐµÐ½ Ð¿Ð¾Ð´Ñ‚Ð²ÐµÑ€Ð´Ð¸Ñ‚ÑŒ:
815: - `~2292` â€” live JSX Ð²Ð½ÑƒÑ‚Ñ€Ð¸ Ñ€ÐµÐ°Ð»ÑŒÐ½Ð¾Ð³Ð¾ OrderGroupCard root element (Ð¾Ð±ÑÐ·Ð°Ñ‚ÐµÐ»ÑŒÐ½Ð° Ð·Ð°Ð¼ÐµÐ½Ð°).
816: - `~565` Ð¸ `~1173` â€” Ð²Ð½ÑƒÑ‚Ñ€Ð¸ block-comment (`/* ... */` Ð¸Ð»Ð¸ JSX comment `{/* ... */}`). Ð—Ð°Ð¼ÐµÐ½Ð° non-blocking: Ð¼Ð¾Ð¶Ð½Ð¾ Ð»Ð¸Ð±Ð¾ Ð¿Ñ€Ð¾Ð¿ÑƒÑÑ‚Ð¸Ñ‚ÑŒ (safer), Ð»Ð¸Ð±Ð¾ Ð·Ð°Ð¼ÐµÐ½Ð¸Ñ‚ÑŒ Ð´Ð»Ñ ÐºÐ¾Ð½ÑÐ¸ÑÑ‚ÐµÐ½Ñ‚Ð½Ð¾ÑÑ‚Ð¸ (optional).
817: 
818: **Ð¡Ñ‚Ñ€Ð°Ñ‚ÐµÐ³Ð¸Ñ:**
819: 
820: **Ð¨Ð°Ð³ 1 â€” ÐžÐ‘Ð¯Ð—ÐÐ¢Ð•Ð›Ð¬ÐÐÐ¯ Ð·Ð°Ð¼ÐµÐ½Ð° live JSX (~2292):**
821: 
822: Ð¡Ð½Ð°Ñ‡Ð°Ð»Ð° Ð¿Ñ€Ð¾Ñ‡Ð¸Ñ‚Ð°Ñ‚ÑŒ Ñ‚Ð¾Ñ‡Ð½Ñ‹Ð¹ ÐºÐ¾Ð½Ñ‚ÐµÐºÑÑ‚:
823: ```bash
824: sed -n '2285,2298p' "pages/StaffOrdersMobile/staffordersmobile.jsx"
825: # ÐžÐ¶Ð¸Ð´Ð°Ð½Ð¸Ðµ: JSX ÐºÐ¾Ð½Ñ‚ÐµÐºÑÑ‚ WITHOUT `/*` Ð¸Ð»Ð¸ `{/*` â€” ÑÑ‚Ð¾ live render.
826: # ÐšÐ»ÑŽÑ‡ÐµÐ²Ñ‹Ðµ Ð¼Ð°Ñ€ÐºÐµÑ€Ñ‹ ÑƒÐ½Ð¸ÐºÐ°Ð»ÑŒÐ½Ð¾ÑÑ‚Ð¸ (ÐžÐ¢Ð¡Ð£Ð¢Ð¡Ð¢Ð’Ð£Ð®Ð¢ Ð² ~565 Ð¸ ~1173):
827: #   - ÑÑ‚Ñ€Ð¾ÐºÐ° `highlightRing` Ð¸Ð»Ð¸ Ð¿ÐµÑ€ÐµÐ¼ÐµÐ½Ð½Ð°Ñ Ñ ÑÑ‚Ð¸Ð¼ Ð¸Ð¼ÐµÐ½ÐµÐ¼ (~2285-2292)
828: #   - ÐºÐ¾Ð½ÑÑ‚Ñ€ÑƒÐºÑ†Ð¸Ñ `return (` Ð² Ð¿Ñ€ÐµÐ´ÐµÐ»Ð°Ñ… 5 ÑÑ‚Ñ€Ð¾Ðº Ð´Ð¾ data-group-id
829: ```
830: 
831: Edit pair (Ð—ÐÐŸÐžÐ›ÐÐ˜Ð¢Ð¬ Ñ‚Ð¾Ñ‡Ð½Ñ‹Ð¼Ð¸ ÑÑ‚Ñ€Ð¾ÐºÐ°Ð¼Ð¸ Ð¸Ð· sed-output Ð²Ñ‹ÑˆÐµ):
832: 
833: 1. ÐŸÑ€Ð¾Ñ‡Ð¸Ñ‚Ð°Ñ‚ÑŒ Ð²Ñ‹Ð²Ð¾Ð´ `sed -n '2285,2298p'` Ð¸ Ð½Ð°Ð¹Ñ‚Ð¸ ÑƒÐ½Ð¸ÐºÐ°Ð»ÑŒÐ½Ñ‹Ð¹ Ð±Ð»Ð¾Ðº: ÑÑ‚Ñ€Ð¾ÐºÐ¸ Ð¾Ñ‚ `highlightRing`
834:    (Ð¸Ð»Ð¸ `return (`) Ð”Ðž Ð¸ Ð²ÐºÐ»ÑŽÑ‡Ð°Ñ `data-group-id={group.id}`.
835: 2. Ð˜ÑÐ¿Ð¾Ð»ÑŒÐ·Ð¾Ð²Ð°Ñ‚ÑŒ ÑÑ‚Ð¸ 3-5 ÑÑ‚Ñ€Ð¾Ðº ÐºÐ°Ðº `old_string` â€” Ð²ÐºÐ»ÑŽÑ‡Ð°Ñ `highlightRing` Ð¿ÐµÑ€ÐµÐ¼ÐµÐ½Ð½ÑƒÑŽ Ð¸Ð»Ð¸ `return (`
836:    ÐºÐ°Ðº Ð¿ÐµÑ€Ð²ÑƒÑŽ ÑÑ‚Ñ€Ð¾ÐºÑƒ (ÑÑ‚Ð¾ Ð´ÐµÐ»Ð°ÐµÑ‚ anchor ÑƒÐ½Ð¸ÐºÐ°Ð»ÑŒÐ½Ñ‹Ð¼: Ñ‚Ð°ÐºÐ¸Ñ… ÑÑ‚Ñ€Ð¾Ðº Ð½ÐµÑ‚ Ð² ~565/~1173 comments).
837: 3. `new_string` â€” Ñ‚Ðµ Ð¶Ðµ ÑÑ‚Ñ€Ð¾ÐºÐ¸ Ñ ÐµÐ´Ð¸Ð½ÑÑ‚Ð²ÐµÐ½Ð½Ð¾Ð¹ Ð·Ð°Ð¼ÐµÐ½Ð¾Ð¹ `data-group-id={group.id}` â†’ `data-group-id={group.compositeKey}`.
838: 
839: ÐžÐ¶Ð¸Ð´Ð°ÐµÐ¼Ñ‹Ð¹ Ð²Ð¸Ð´ (Ñ‚Ð¾Ñ‡Ð½Ñ‹Ðµ ÑÑ‚Ñ€Ð¾ÐºÐ¸ Ð·Ð°Ð¼ÐµÐ½Ð¸Ñ‚ÑŒ Ð¸Ð· sed-output):
840: ```jsx
841:   // old_string Ð¿Ñ€Ð¸Ð¼ÐµÑ€ (Ð²Ð·ÑÑ‚ÑŒ Ñ‚Ð¾Ñ‡Ð½Ñ‹Ð¹ Ñ‚ÐµÐºÑÑ‚ Ð¸Ð· sed â€” ÐÐ• ÐºÐ¾Ð¿Ð¸Ñ€Ð¾Ð²Ð°Ñ‚ÑŒ ÑÑ‚Ð¾Ñ‚ ÑˆÐ°Ð±Ð»Ð¾Ð½):
842:   const highlightRing = highlightGroupId === group.compositeKey;
843:   return (
844:     <div
845:       data-group-id={group.id}
846: ```
847: ```jsx
848:   // new_string (Ñ‚Ð° Ð¶Ðµ ÑÑ‚Ñ€ÑƒÐºÑ‚ÑƒÑ€Ð°, Ñ‚Ð¾Ð»ÑŒÐºÐ¾ data-group-id Ð·Ð°Ð¼ÐµÐ½Ñ‘Ð½):
849:   const highlightRing = highlightGroupId === group.compositeKey;
850:   return (
851:     <div
852:       data-group-id={group.compositeKey}
853: ```
854: 
855: âš ï¸ **ÐÐ• Ð¸ÑÐ¿Ð¾Ð»ÑŒÐ·Ð¾Ð²Ð°Ñ‚ÑŒ `data-group-id={group.id}` ÐºÐ°Ðº ÐµÐ´Ð¸Ð½ÑÑ‚Ð²ÐµÐ½Ð½ÑƒÑŽ ÑÑ‚Ñ€Ð¾ÐºÑƒ old_string** â€” ÑÑ‚Ð¾ Ð¼Ð¾Ð¶ÐµÑ‚ ÑÐ¾Ð²Ð¿Ð°ÑÑ‚ÑŒ Ñ block-comments @ ~565 / ~1173. Ð’ÑÐµÐ³Ð´Ð° Ð²ÐºÐ»ÑŽÑ‡Ð°Ñ‚ÑŒ `highlightRing` Ð¸Ð»Ð¸ `return (` ÑÑ‚Ñ€Ð¾ÐºÑƒ Ð”Ðž `data-group-id` Ð´Ð»Ñ Ð¾Ð´Ð½Ð¾Ð·Ð½Ð°Ñ‡Ð½Ð¾Ð¹ Ð¸Ð´ÐµÐ½Ñ‚Ð¸Ñ„Ð¸ÐºÐ°Ñ†Ð¸Ð¸.
856: 
857: **Ð¨Ð°Ð³ 2 â€” OPTIONAL Ð·Ð°Ð¼ÐµÐ½Ð° comment-only snapshots (~565, ~1173):**
858: 
859: Ð­Ñ‚Ð¸ hits Ð² block-comments (Ð¸ÑÑ‚Ð¾Ñ€Ð¸Ñ‡ÐµÑÐºÐ¸Ðµ snapshots/docstrings). Ð ÐµÐ½Ð´ÐµÑ€ DOM Ð½Ðµ Ð·Ð°Ñ‚Ñ€Ð°Ð³Ð¸Ð²Ð°ÑŽÑ‚. Ð—Ð°Ð¼ÐµÐ½Ñƒ Ð²Ñ‹Ð¿Ð¾Ð»Ð½ÑÑ‚ÑŒ **Ñ‚Ð¾Ð»ÑŒÐºÐ¾ ÐµÑÐ»Ð¸ Ð¾ÑÑ‚Ð°Ð»ÑŒÐ½Ñ‹Ðµ Fix Ð¿Ñ€Ð¾ÑˆÐ»Ð¸ Ð±ÐµÐ· Ð¾ÑˆÐ¸Ð±Ð¾Ðº** Ð¸ ÐµÑÑ‚ÑŒ Ð±ÑŽÐ´Ð¶ÐµÑ‚ Ð²Ñ€ÐµÐ¼ÐµÐ½Ð¸. Non-blocking. Ð•ÑÐ»Ð¸ Ð¿Ñ€Ð¾Ð¿ÑƒÑÐºÐ°ÐµÐ¼ â€” Ð·Ð°Ð¿Ð¸ÑÐ°Ñ‚ÑŒ Ð² ÐºÐ¾Ð¼Ð¼Ð¸Ñ‚Ðµ `/* v5-M1: commented snapshots @ 565, 1173 preserved as legacy docs */`.
860: 
861: **Verification B.5 (Ð¿Ð¾ÑÑ‚-Ñ„Ð¸ÐºÑ):**
862: ```bash
863: # Live JSX Ð·Ð°Ð¼ÐµÐ½Ñ‘Ð½ (Ð¾Ð±ÑÐ·Ð°Ñ‚ÐµÐ»ÑŒÐ½Ð¾)
864: grep -c "data-group-id={group.compositeKey}" "pages/StaffOrdersMobile/staffordersmobile.jsx"
865: # ÐžÐ¶Ð¸Ð´Ð°Ð½Ð¸Ðµ: â‰¥1 (ÐµÑÐ»Ð¸ Ð¿Ñ€Ð¾Ð¿ÑƒÑÑ‚Ð¸Ð»Ð¸ comments) Ð¸Ð»Ð¸ =3 (ÐµÑÐ»Ð¸ Ð·Ð°Ð¼ÐµÐ½Ð¸Ð»Ð¸ Ð²ÑÑ‘).
866: 
867: # Ð¡Ñ‚Ð°Ñ€Ñ‹Ð¹ Ð°Ñ‚Ñ€Ð¸Ð±ÑƒÑ‚ data-group-id={group.id} â€” 0 Ð’ÐÐ• comments:
868: #   Ð•ÑÐ»Ð¸ Ñ€ÐµÑˆÐ¸Ð»Ð¸ Ð½Ðµ Ñ‚Ñ€Ð¾Ð³Ð°Ñ‚ÑŒ comments â†’ ÑÑ‚Ð°Ñ€Ñ‹Ðµ 2 hits Ð¾ÑÑ‚Ð°Ð½ÑƒÑ‚ÑÑ Ð² comments (OK).
869: #   [v5-L4] Loose regex â€” Ð´Ð¾Ð¿ÑƒÑÐºÐ°ÐµÑ‚ optional spaces Ð²Ð¾ÐºÑ€ÑƒÐ³ group.compositeKey (formatter-tolerant):
870: grep -cE "data-group-id=\{ *group\.compositeKey *\}" "pages/StaffOrdersMobile/staffordersmobile.jsx"
871: # ÐžÐ¶Ð¸Ð´Ð°Ð½Ð¸Ðµ: â‰¥1 (Ñ„Ð¾Ñ€Ð¼Ð°Ñ‚ live JSX Ð¼Ð¾Ð¶ÐµÑ‚ Ð¼ÐµÐ½ÑÑ‚ÑŒÑÑ Ð¿Ð¾ÑÐ»Ðµ Ñ„Ð¾Ñ€Ð¼attÐµÑ€Ð°).
872: 
873: # ÐšÐ Ð˜Ð¢Ð˜Ð§ÐÐž: live JSX @ ~2292 Ð¾Ð±ÑÐ·Ð°Ñ‚ÐµÐ»ÑŒÐ½Ð¾ Ð½Ð° compositeKey:
874: sed -n '2285,2298p' "pages/StaffOrdersMobile/staffordersmobile.jsx" | grep -c "compositeKey"
875: # ÐžÐ¶Ð¸Ð´Ð°Ð½Ð¸Ðµ: 1 hit.
876: ```
877: 
878: âš ï¸ ÐšÐ Ð˜Ð¢Ð˜Ð§ÐÐž: `handleBannerNavigate` Ð¸ÑÐ¿Ð¾Ð»ÑŒÐ·ÑƒÐµÑ‚ ÑÐµÐ»ÐµÐºÑ‚Ð¾Ñ€ `[data-group-id="${CSS.escape(String(targetKey))}"]`. Ð•ÑÐ»Ð¸ LIVE `data-group-id` (@~2292) Ð¾ÑÑ‚Ð°Ð½ÐµÑ‚ÑÑ Ð½Ð° `group.id`, Ð±Ð°Ð½Ð½ÐµÑ€ Ð±ÑƒÐ´ÐµÑ‚ ÑÐºÑ€Ð¾Ð»Ð»Ð¸Ñ‚ÑŒ Ðº Ð¿ÐµÑ€Ð²Ð¾Ð¹ ÑÐ»ÑƒÑ‡Ð°Ð¹Ð½Ð¾Ð¹ ÐºÐ°Ñ€Ñ‚Ð¾Ñ‡ÐºÐµ (React key conflict + Ð½ÐµÐ¿Ñ€Ð°Ð²Ð¸Ð»ÑŒÐ½Ñ‹Ð¹ DOM selector). Commented hits Ð½Ð° Ñ€ÐµÐ½Ð´ÐµÑ€ ÐÐ• Ð²Ð»Ð¸ÑÑŽÑ‚.
879: 
880: **B.6 â€” `handleBannerNavigate` Ð¾Ð±Ð½Ð¾Ð²Ð¸Ñ‚ÑŒ Ð´Ð»Ñ compositeKey (~ÑÑ‚Ñ€Ð¾ÐºÐ° 4142) â€” [V5-L3]**
881: 
882: Grep-ÑÐºÐ¾Ñ€ÑŒ: `const handleBannerNavigate = useCallback` (1 hit, Ð¾Ð±ÑŠÑÐ²Ð»ÐµÐ½Ð¸Ðµ @ ~4142). Call-site: `onNavigate={handleBannerNavigate}` @ ~4610. Upstream: `onNavigate(banner.groupId)` @ ~2825, Ð³Ð´Ðµ `banner.groupId = tableId` Ð¸Ð· `buildBannerInfo @ ~4079-4090`.
883: 
884: **Ð¢ÐµÐºÑƒÑ‰Ð¸Ð¹ ÐºÐ¾Ð´:**
885: ```js
886:   const handleBannerNavigate = useCallback((groupId) => {
887:     if (!groupId) return;
888:     setExpandedGroupId(groupId);
889:     requestAnimationFrame(() => {
890:       requestAnimationFrame(() => {
891:         const el = document.querySelector(`[data-group-id="${CSS.escape(String(groupId))}"]`);
892:         ...
893: ```
894: 
895: **[v3: M1] â€” Ð˜ÑÐ¿Ð¾Ð»ÑŒÐ·ÑƒÐµÐ¼ defensive Ñ€ÐµÐ°Ð»Ð¸Ð·Ð°Ñ†Ð¸ÑŽ unconditionally** (CC review: "two alternatives with no decision rule â†’ pick defensive one").
896: 
897: ÐÐµÐ·Ð°Ð²Ð¸ÑÐ¸Ð¼Ð¾ Ð¾Ñ‚ Ñ‚Ð¾Ð³Ð¾, Ñ‡Ñ‚Ð¾ Ð¿ÐµÑ€ÐµÐ´Ð°Ñ‘Ñ‚ call-site (upstream Ð¿ÐµÑ€ÐµÐ´Ð°Ñ‘Ñ‚ Ð§Ð˜Ð¡Ð¢Ð«Ð™ `tableId` Ð¸Ð· `banner.groupId`) â€” defensive Ð²ÐµÑ€ÑÐ¸Ñ Ñ Ð¿Ñ€Ð¾Ð²ÐµÑ€ÐºÐ¾Ð¹ `__` Ð±ÐµÐ·Ð¾Ð¿Ð°ÑÐ½Ð° Ð´Ð»Ñ Ð¾Ð±Ð¾Ð¸Ñ… ÑÐ»ÑƒÑ‡Ð°ÐµÐ².
898: 
899: **Ð—Ð°Ð¼ÐµÐ½Ð¸Ñ‚ÑŒ Ð¦Ð•Ð›Ð˜ÐšÐžÐœ `handleBannerNavigate` useCallback:**
900: ```js
901:   const handleBannerNavigate = useCallback((maybeTableIdOrCompositeKey) => {
902:     if (!maybeTableIdOrCompositeKey) return;
903: 
904:     // Ð‘2.1: ÐµÑÐ»Ð¸ Ð¿ÐµÑ€ÐµÐ´Ð°Ð½ tableId Ð±ÐµÐ· sessionId (current flow: banner.groupId = tableId) â€”
905:     // Ñ€ÐµÐ·Ð¾Ð»Ð²Ð¸Ð¼ Ðº compositeKey Ð¢Ð•ÐšÐ£Ð©Ð•Ð™ Ð¾Ñ‚ÐºÑ€Ñ‹Ñ‚Ð¾Ð¹ ÑÐµÑÑÐ¸Ð¸ ÑÑ‚Ð¾Ð³Ð¾ ÑÑ‚Ð¾Ð»Ð°.
906:     // Defensive: Ñ€Ð°Ð±Ð¾Ñ‚Ð°ÐµÑ‚ Ð¸ ÐºÐ¾Ð³Ð´Ð° caller ÑƒÐ¶Ðµ Ð¿ÐµÑ€ÐµÐ´Ð°Ñ‘Ñ‚ compositeKey (ÑÐ¾Ð´ÐµÑ€Ð¶Ð¸Ñ‚ '__').
907:     let targetKey = String(maybeTableIdOrCompositeKey);
908:     if (!targetKey.includes('__')) {
909:       const openId = openSessionByTableId[targetKey]?.id || null;
910:       targetKey = openId
911:         ? `${targetKey}__${openId}`
912:         : `${targetKey}__no-session`;
913:     }
914: 
915:     setExpandedGroupId(targetKey);
916:     requestAnimationFrame(() => {
917:       requestAnimationFrame(() => {
918:         const el = document.querySelector(`[data-group-id="${CSS.escape(targetKey)}"]`);
919:         if (el) {
920:           el.scrollIntoView({ behavior: 'smooth', block: 'center' });
921:           setHighlightGroupId(targetKey);
922:           if (highlightTimerRef.current) clearTimeout(highlightTimerRef.current);
923:           highlightTimerRef.current = setTimeout(() => setHighlightGroupId(null), 1500);
924:         }
925:       });
926:     });
927:   }, [openSessionByTableId]);
928: ```
929: 
930: âš ï¸ Ð”Ð¾Ð±Ð°Ð²Ð¸Ñ‚ÑŒ `openSessionByTableId` Ð² dependency array useCallback (Ð½Ð¾Ð²Ð°Ñ Ð·Ð°Ð²Ð¸ÑÐ¸Ð¼Ð¾ÑÑ‚ÑŒ).

994: ## Fix C: Invalidate openSessions Ð¿Ñ€Ð¸ orphan-Ð·Ð°ÐºÐ°Ð·Ð°Ñ…
995: 
996: ### Ð¡Ñ‚Ð°Ñ‚ÑƒÑ: [NEW CODE â€” performance optimization]
997: **ÐŸÑ€Ð¾Ð±Ð»ÐµÐ¼Ð°:** Ð”Ð°Ð¶Ðµ Ñ Fix A (staleTime 5s) Ð¾ÑÑ‚Ð°Ñ‘Ñ‚ÑÑ Ð¾ÐºÐ½Ð¾ Ð´Ð¾ 5 ÑÐµÐºÑƒÐ½Ð´, ÐºÐ¾Ð³Ð´Ð° Ð½Ð¾Ð²Ñ‹Ð¹ Order ÑƒÐ¶Ðµ Ð² Ð‘Ð”, Ð½Ð¾ SOM ÐµÐ³Ð¾ Ð³Ñ€ÑƒÐ¿Ð¿Ð¸Ñ€ÑƒÐµÑ‚ Ð±ÐµÐ· Ð¾Ñ‚ÐºÑ€Ñ‹Ñ‚Ð¾Ð¹ ÑÐµÑÑÐ¸Ð¸. Ð•ÑÐ»Ð¸ Ð°ÐºÑ‚Ð¸Ð²Ð½Ð¾ Ð¿Ð¾Ð»Ð¸Ð½Ð³ `orders` Ñ€Ð°Ð½ÑŒÑˆÐµ Ñ‡ÐµÐ¼ `openSessions` â€” ÐºÐ°Ñ€Ñ‚Ð¾Ñ‡ÐºÐ° Ð¿Ð¾ÑÐ²Ð¸Ñ‚ÑÑ Ð² Â«Ð—Ð°Ð²ÐµÑ€ÑˆÑ‘Ð½Ð½Ñ‹Ñ…Â», Ð¿Ð¾Ñ‚Ð¾Ð¼ Â«Ð¿Ñ€Ñ‹Ð³Ð½ÐµÑ‚Â» Ð² Â«ÐÐºÑ‚Ð¸Ð²Ð½Ñ‹ÐµÂ». Fix C Ð´ÐµÑ‚ÐµÐºÑ‚Ð¸Ñ€ÑƒÐµÑ‚ Ñ‚Ð°ÐºÐ¸Ðµ orphan Orders Ð¸ Ð´ÐµÐ»Ð°ÐµÑ‚ Ð¿Ñ€Ð¸Ð½ÑƒÐ´Ð¸Ñ‚ÐµÐ»ÑŒÐ½Ñ‹Ð¹ invalidate `openSessions` â€” ÐºÐ°Ñ€Ñ‚Ð¾Ñ‡ÐºÐ° Ð¿Ð¾ÑÐ²Ð¸Ñ‚ÑÑ ÐºÐ¾Ñ€Ñ€ÐµÐºÑ‚Ð½Ð¾ ÑÑ€Ð°Ð·Ñƒ.
998: 
999: ### Change
1000: 
1001: **[v5-C2] Pre-check Ð¿ÐµÑ€ÐµÐ´ Ð²ÑÑ‚Ð°Ð²ÐºÐ¾Ð¹ â€” Ñ€ÐµÐ°Ð»ÑŒÐ½Ñ‹Ð¹ `orders` alias:**
1002: 
1003: ```bash
1004: # Real anchor: `data: orders,` Ð²Ð½ÑƒÑ‚Ñ€Ð¸ useQuery destructure @ ~3497
1005: grep -n "data: orders," "pages/StaffOrdersMobile/staffordersmobile.jsx"
1006: # ÐžÐ¶Ð¸Ð´Ð°Ð½Ð¸Ðµ: 1 hit, ÑÑ‚Ñ€Ð¾ÐºÐ° ~3497, Ð²Ð½ÑƒÑ‚Ñ€Ð¸ useQuery({ queryKey: ["orders", partnerId], ... }).
1007: # Ð­Ñ‚Ð¾ Ð¸ÑÑ‚Ð¾Ñ‡Ð½Ð¸Ðº `orders` â€” Ð¼Ð°ÑÑÐ¸Ð² Order entities Ð¸ÑÐ¿Ð¾Ð»ÑŒÐ·ÑƒÐµÐ¼Ñ‹Ð¹ Ð¿Ð¾ Ð²ÑÐµÐ¼Ñƒ ÐºÐ¾Ð¼Ð¿Ð¾Ð½ÐµÐ½Ñ‚Ñƒ.
1008: 
1009: grep -n 'queryKey: \["orders"' "pages/StaffOrdersMobile/staffordersmobile.jsx"
1010: # ÐžÐ¶Ð¸Ð´Ð°Ð½Ð¸Ðµ: 1 hit, ÑÑ‚Ñ€Ð¾ÐºÐ° ~3494, Ð±Ð»Ð¾Ðº orders useQuery (Ð´Ð¸Ð°Ð¿Ð°Ð·Ð¾Ð½ ~3494-3512).
1011: 
1012: # âš ï¸ ÐÐ• Ð¸ÑÐ¿Ð¾Ð»ÑŒÐ·Ð¾Ð²Ð°Ñ‚ÑŒ pattern `^  const orders ` â€” Ð¾Ð½ Ð¼Ð°Ñ‚Ñ‡Ð¸Ñ‚ inner helper variable @ ~1130 (Ð½Ðµ Ñ‚Ð¾).
1013: # Ð˜ÑÐ¿Ð¾Ð»ÑŒÐ·Ð¾Ð²Ð°Ñ‚ÑŒ `data: orders,` ÐºÐ°Ðº ÐµÐ´Ð¸Ð½ÑÑ‚Ð²ÐµÐ½Ð½Ñ‹Ð¹ ÑÐºÐ¾Ñ€ÑŒ Ð´Ð»Ñ Fix C.
1014: ```
1015: 
1016: **Placement:** Ð´Ð¾Ð±Ð°Ð²Ð¸Ñ‚ÑŒ ÐÐžÐ’Ð«Ð™ useEffect Ð¡Ð ÐÐ—Ð£ ÐŸÐžÐ¡Ð›Ð• Ð·Ð°ÐºÑ€Ñ‹Ð²Ð°ÑŽÑ‰ÐµÐ¹ `}, [openSessions]);` useMemo `openSessionByTableId` (ÑÑ‚Ñ€Ð¾ÐºÐ° ~3561). Grep-ÑÐºÐ¾Ñ€ÑŒ Ð´Ð»Ñ Ñ‚Ð¾Ñ‡Ð½Ð¾Ð³Ð¾ Ð¼ÐµÑÑ‚Ð°:
1017: 
1018: ```bash
1019: grep -n "openSessionByTableId = useMemo" "pages/StaffOrdersMobile/staffordersmobile.jsx"
1020: # ÐžÐ¶Ð¸Ð´Ð°Ð½Ð¸Ðµ: 1 hit, ÑÑ‚Ñ€Ð¾ÐºÐ° ~3554. Ð’ÑÑ‚Ð°Ð²Ð¸Ñ‚ÑŒ useEffect ÑÑ€Ð°Ð·Ñƒ Ð¿Ð¾ÑÐ»Ðµ `}, [openSessions]);` ÑÑ‚Ð¾Ð³Ð¾ useMemo.
1021: ```
1022: 
1023: **Alternative anchor ÐµÑÐ»Ð¸ closing `}, [openSessions]);` Ð¸Ð¼ÐµÐµÑ‚ Ð½ÐµÑÑ‚Ð°Ð½Ð´Ð°Ñ€Ñ‚Ð½Ð¾Ðµ Ñ„Ð¾Ñ€Ð¼Ð°Ñ‚Ð¸Ñ€Ð¾Ð²Ð°Ð½Ð¸Ðµ (trailing comment / extra whitespace / multi-line deps):**
1024: ```bash
1025: # ÐŸÑ€Ð¾Ñ‡Ð¸Ñ‚Ð°Ñ‚ÑŒ ~30 ÑÑ‚Ñ€Ð¾Ðº Ð½Ð°Ñ‡Ð¸Ð½Ð°Ñ Ñ openSessionByTableId useMemo
1026: sed -n '3554,3585p' "pages/StaffOrdersMobile/staffordersmobile.jsx"
1027: # ÐÐ°Ð¹Ñ‚Ð¸ Ð¿ÐµÑ€Ð²ÑƒÑŽ ÑÑ‚Ñ€Ð¾ÐºÑƒ Ð¿Ð¾ÑÐ»Ðµ Ð·Ð°ÐºÑ€Ñ‹Ð²Ð°ÑŽÑ‰ÐµÐ¹ `});` Ð¸Ð»Ð¸ `}, [openSessions]);` Ð¸ Ð´Ð¾ `const activeRequests`.
1028: # Ð˜ÑÐ¿Ð¾Ð»ÑŒÐ·Ð¾Ð²Ð°Ñ‚ÑŒ Ð¿Ð¾ÑÐ»ÐµÐ´Ð½Ð¸Ðµ 2 ÑÑ‚Ñ€Ð¾ÐºÐ¸ ÑÑ‚Ð¾Ð³Ð¾ useMemo (Ñ ÑƒÐ½Ð¸ÐºÐ°Ð»ÑŒÐ½Ð¾Ð¹ Ñ‚Ð¾Ñ‡Ð½Ð¾ÑÑ‚ÑŒÑŽ) ÐºÐ°Ðº Edit-anchor.
1029: ```
1030: 
1031: ÐŸÑ€Ð¸Ñ‡Ð¸Ð½Ð° (PQ-099): useEffect Ð´Ð¾Ð»Ð¶ÐµÐ½ Ð±Ñ‹Ñ‚ÑŒ Ð¾Ð±ÑŠÑÐ²Ð»ÐµÐ½ Ð¿Ð¾ÑÐ»Ðµ Ð²ÑÐµÑ… useMemo/useCallback, Ð¾Ñ‚ ÐºÐ¾Ñ‚Ð¾Ñ€Ñ‹Ñ… Ð·Ð°Ð²Ð¸ÑÐ¸Ñ‚, Ð½Ð¾ Ð´Ð¾ `const activeRequests` (~3565).
1032: 
1033: **[v4-C1 + v4-M7] ÐÐ¾Ð²Ñ‹Ð¹ ÐºÐ¾Ð´ (Ð²ÑÑ‚Ð°Ð²Ð¸Ñ‚ÑŒ):**
1034: 
1035: ```js
1036:   // Ð‘2.1 Fix C: ÐµÑÐ»Ð¸ Ð¿Ð¾ÑÐ²Ð¸Ð»ÑÑ hall-Order Ñ table_session, Ð½Ð¾ openSessionByTableId
1037:   // ÐµÑ‰Ñ‘ Ð½Ðµ Ð·Ð½Ð°ÐµÑ‚ Ð¾ Ð½ÐµÐ¹ (staleTime race) â€” Ð¿Ñ€Ð¸Ð½ÑƒÐ´Ð¸Ñ‚ÐµÐ»ÑŒÐ½Ð¾ Ð¾Ð±Ð½Ð¾Ð²Ð¸Ñ‚ÑŒ openSessions.
1038:   // Ð­Ñ‚Ð¾ ÑƒÑÐºÐ¾Ñ€ÑÐµÑ‚ Ð¿Ð¾ÑÐ²Ð»ÐµÐ½Ð¸Ðµ ÐºÐ¾Ñ€Ñ€ÐµÐºÑ‚Ð½Ð¾Ð¹ ÐºÐ°Ñ€Ñ‚Ð¾Ñ‡ÐºÐ¸ Ð² Â«ÐÐºÑ‚Ð¸Ð²Ð½Ñ‹Ñ…Â» (Ð´Ð¾ 5Ñ â†’ <1Ñ).
1039:   //
1040:   // [v4-C1] FILTER: Ð¸ÑÐºÐ»ÑŽÑ‡Ð°ÐµÐ¼ orders ÑÐ¾ status 'closed'/'cancelled' â€” Ñƒ Ð½Ð¸Ñ… table_session
1041:   // Ð¾ÑÑ‚Ð°Ñ‘Ñ‚ÑÑ (sessionHelpers.js:158-173), Ð½Ð¾ Ð¾Ð½Ð¸ ÐÐ• Ð´Ð¾Ð»Ð¶Ð½Ñ‹ Ñ‚Ñ€Ð¸Ð³Ð³ÐµÑ€Ð¸Ñ‚ÑŒ invalidate
1042:   // (Ð¸Ð½Ð°Ñ‡Ðµ Ð´Ð»Ñ ÐºÐ°Ð¶Ð´Ð¾Ð³Ð¾ Ð·Ð°ÐºÑ€Ñ‹Ñ‚Ð¾Ð³Ð¾ hall-Ð·Ð°ÐºÐ°Ð·Ð° Ð±ÐµÐ· Ð¾Ñ‚ÐºÑ€Ñ‹Ñ‚Ð¾Ð¹ ÑÐµÑÑÐ¸Ð¸ invalidate ÑƒÐ¹Ð´Ñ‘Ñ‚
1043:   // Ð² ÐºÐ°Ð¶Ð´Ð¾Ð¼ Ñ†Ð¸ÐºÐ»Ðµ polling â†’ Ð±ÐµÑÐºÐ¾Ð½ÐµÑ‡Ð½Ð°Ñ Ð½Ð°Ð³Ñ€ÑƒÐ·ÐºÐ° Ð½Ð° ÑÐµÑ€Ð²ÐµÑ€).
1044:   //
1045:   // [v4-M7] ONE-SHOT GUARD: Ð·Ð°Ð¿Ð¾Ð¼Ð¸Ð½Ð°ÐµÐ¼ Â«ÑƒÐ¶Ðµ Ð¸Ð½Ð²Ð°Ð»Ð¸Ð´Ð¸Ñ€Ð¾Ð²Ð°Ð»Ð¸ Ð´Ð»Ñ ÑÑ‚Ð¾Ð¹ ÐºÐ¾Ð¼Ð±Ð¸Ð½Ð°Ñ†Ð¸Ð¸ orphan-ÑÐ¸Ð³Ð½Ð°Ñ‚ÑƒÑ€Â»
1046:   // Ñ‡ÐµÑ€ÐµÐ· useRef. Ð¡Ð¸Ð³Ð½Ð°Ñ‚ÑƒÑ€Ð° = Ð¾Ñ‚ÑÐ¾Ñ€Ñ‚Ð¸Ñ€Ð¾Ð²Ð°Ð½Ð½Ð°Ñ ÑÑ‚Ñ€Ð¾ÐºÐ° `tableId:sessionId,tableId:sessionId,...`.
1047:   // ÐšÐ¾Ð³Ð´Ð° ÑÐ¸Ð³Ð½Ð°Ñ‚ÑƒÑ€Ð° Ð½Ðµ Ð¸Ð·Ð¼ÐµÐ½Ð¸Ð»Ð°ÑÑŒ â€” ÐÐ• Ð²Ñ‹Ð·Ñ‹Ð²Ð°ÐµÐ¼ invalidate Ð¿Ð¾Ð²Ñ‚Ð¾Ñ€Ð½Ð¾ (Ð´Ð¾Ð¿. Ð·Ð°Ñ‰Ð¸Ñ‚Ð° Ð¾Ñ‚ race
1048:   // ÐµÑÐ»Ð¸ openSessions Ð¾Ð±Ð½Ð¾Ð²Ð¸Ð»ÑÑ, Ð½Ð¾ Ð²ÑÑ‘ ÐµÑ‰Ñ‘ Ð½Ðµ ÑÐ¾Ð´ÐµÑ€Ð¶Ð¸Ñ‚ Ð½Ð¾Ð²ÑƒÑŽ ÑÐµÑÑÐ¸ÑŽ).
1049:   const orphanInvalidateSigRef = useRef(null);
1050:   useEffect(() => {
1051:     if (!Array.isArray(orders) || orders.length === 0) return;
1052: 
1053:     const orphanPairs = [];
1054:     for (const o of orders) {
1055:       if (o.order_type !== 'hall') continue;
1056:       // [v4-C1] Ð·Ð°ÐºÑ€Ñ‹Ñ‚Ñ‹Ðµ/Ð¾Ñ‚Ð¼ÐµÐ½Ñ‘Ð½Ð½Ñ‹Ðµ orders Ð½Ðµ ÑÑ‡Ð¸Ñ‚Ð°ÑŽÑ‚ÑÑ orphan â€” Ð¾Ð½Ð¸ Ð¿Ñ€Ð¸Ð½Ð°Ð´Ð»ÐµÐ¶Ð°Ñ‚ Ð·Ð°Ð²ÐµÑ€ÑˆÑ‘Ð½Ð½Ð¾Ð¹ ÑÐµÑÑÐ¸Ð¸
1057:       if (o.status === 'closed' || o.status === 'cancelled') continue;
1058:       const tableId = getLinkId(o.table);
1059:       if (!tableId) continue;
1060:       const sessionId = getLinkId(o.table_session);
1061:       if (!sessionId) continue;
1062:       // Order ÑÑÑ‹Ð»Ð°ÐµÑ‚ÑÑ Ð½Ð° table_session, Ð½Ð¾ SOM Ð½Ðµ Ð²Ð¸Ð´Ð¸Ñ‚ ÑÑ‚Ñƒ ÑÐµÑÑÐ¸ÑŽ Ð² openSessions
1063:       const open = openSessionByTableId[tableId];
1064:       if (!open || open.id !== sessionId) {
1065:         orphanPairs.push(`${tableId}:${sessionId}`);
1066:       }
1067:     }
1068: 
1069:     if (orphanPairs.length === 0) {
1070:       // Reset signature ÐºÐ¾Ð³Ð´Ð° orphan'Ñ‹ Ð¸ÑÑ‡ÐµÐ·Ð»Ð¸ (Ð½Ð¾Ñ€Ð¼Ð°Ð»ÑŒÐ½Ð¾Ðµ ÑÐ¾ÑÑ‚Ð¾ÑÐ½Ð¸Ðµ) â€” Ð¿Ð¾Ð·Ð²Ð¾Ð»Ð¸Ñ‚
1071:       // ÑÑ€Ð°Ð±Ð¾Ñ‚Ð°Ñ‚ÑŒ invalidate ÐµÑ‰Ñ‘ Ñ€Ð°Ð· ÐµÑÐ»Ð¸ Ð² Ð±ÑƒÐ´ÑƒÑ‰ÐµÐ¼ Ð¿Ð¾ÑÐ²Ð¸Ñ‚ÑÑ Ð½Ð¾Ð²Ñ‹Ð¹ orphan.
1072:       orphanInvalidateSigRef.current = null;
1073:       return;
1074:     }
1075: 
1076:     // [v4-M7] one-shot guard: ÑƒÐ½Ð¸ÐºÐ°Ð»ÑŒÐ½Ð°Ñ Ð¿Ð¾Ð´Ð¿Ð¸ÑÑŒ Ñ‚ÐµÐºÑƒÑ‰ÐµÐ³Ð¾ Ð½Ð°Ð±Ð¾Ñ€Ð° orphan'Ð¾Ð²
1077:     const signature = orphanPairs.sort().join(',');
1078:     if (orphanInvalidateSigRef.current === signature) {
1079:       // Ð£Ð¶Ðµ Ð¸Ð½Ð²Ð°Ð»Ð¸Ð´Ð¸Ñ€Ð¾Ð²Ð°Ð»Ð¸ Ð´Ð»Ñ ÑÑ‚Ð¾Ð¹ Ð¶Ðµ ÐºÐ¾Ð¼Ð±Ð¸Ð½Ð°Ñ†Ð¸Ð¸ â€” Ð½Ðµ Ð¿Ð¾Ð²Ñ‚Ð¾Ñ€ÑÐµÐ¼.
1080:       return;
1081:     }
1082:     orphanInvalidateSigRef.current = signature;
1083:     // [v5-C1] Prefix invalidate â€” Ð¼Ð°Ñ‚Ñ‡Ð¸Ñ‚ ["openSessions", partnerId] Ð´Ð»Ñ Ð»ÑŽÐ±Ð¾Ð³Ð¾ Ñ‚ÐµÐºÑƒÑ‰ÐµÐ³Ð¾ partnerId.
1084:     queryClient.invalidateQueries({ queryKey: ["openSessions"] });
1085:   }, [orders, openSessionByTableId, queryClient]);
1086: ```
1087: 
1088: **âš ï¸ Dependency array useEffect â€” Ð”ÐžÐ‘ÐÐ’Ð˜Ð¢Ð¬ Ñ‚Ð¾Ð»ÑŒÐºÐ¾ ÑÑ‚Ð¸ 3:** `orders`, `openSessionByTableId`, `queryClient`. ÐÐ• Ð²ÐºÐ»ÑŽÑ‡Ð°Ñ‚ÑŒ `getLinkId` (origin Ð¾Ð¿Ñ€ÐµÐ´ÐµÐ»Ñ‘Ð½ Ð² Preparation Step 2; ÐµÑÐ»Ð¸ Ð¾Ð½ component-scoped â€” Ð¾Ð±ÐµÑ€Ð½ÑƒÑ‚ÑŒ Ð² useCallback Ð¸ Ð´Ð¾Ð±Ð°Ð²Ð¸Ñ‚ÑŒ Ð² deps; ÐµÑÐ»Ð¸ imported â€” Ð¿Ñ€Ð¾Ð¿ÑƒÑÑ‚Ð¸Ñ‚ÑŒ, ÐºÐ°Ðº ÑÐµÐ¹Ñ‡Ð°Ñ).
1089: 
1090: **âš ï¸ [V5-M3] Pre-check Ð”Ðž Ð²ÑÑ‚Ð°Ð²ÐºÐ¸:** ÑƒÐ±ÐµÐ´Ð¸Ñ‚ÑŒÑÑ Ñ‡Ñ‚Ð¾ `queryClient` Ð² scope (Ð¸Ð· Preparation Â§3). Ð•ÑÐ»Ð¸ Ð¿ÐµÑ€ÐµÐ¼ÐµÐ½Ð½Ð°Ñ Ð½Ð°Ð·Ñ‹Ð²Ð°ÐµÑ‚ÑÑ Ð¸Ð½Ð°Ñ‡Ðµ â€” Ð·Ð°Ð¼ÐµÐ½Ð¸Ñ‚ÑŒ Ð² ÐºÐ¾Ð´Ðµ Fix C. Ð•ÑÐ»Ð¸ `useQueryClient()` Ð½Ðµ Ð²Ñ‹Ð·Ð²Ð°Ð½ â€” STOP.
1091: 
1092: **âš ï¸ [V5-L5] Imports:** ÑƒÐ±ÐµÐ´Ð¸Ñ‚ÑŒÑÑ Ñ‡Ñ‚Ð¾ `useRef` ÑƒÐ¶Ðµ Ð¸Ð¼Ð¿Ð¾Ñ€Ñ‚Ð¸Ñ€Ð¾Ð²Ð°Ð½ Ð¸Ð· 'react'. Pre-check (Ð¸Ð· Preparation Â§4) Ð´Ð°ÑÑ‚ hit-count. Ð•ÑÐ»Ð¸ Ð½ÑƒÐ¶Ð½Ð¾ Ð´Ð¾Ð±Ð°Ð²Ð¸Ñ‚ÑŒ â€” Ð½Ð°Ð¹Ñ‚Ð¸ react import line (Preparation Â§4 grep `from 'react'`) Ð¸ Ñ€Ð°ÑÑˆÐ¸Ñ€Ð¸Ñ‚ÑŒ ÑÐ¿Ð¸ÑÐ¾Ðº:
1093: 
1094: Single-line Ð²Ð°Ñ€Ð¸Ð°Ð½Ñ‚ (ÐµÑÐ»Ð¸ Ñ‚ÐµÐºÑƒÑ‰Ð°Ñ Ñ„Ð¾Ñ€Ð¼Ð° Ñ‚Ð°ÐºÐ°Ñ):
1095: - old_string: `import { useState, useEffect, useMemo, useCallback } from 'react';`


exec
"C:\\WINDOWS\\System32\\WindowsPowerShell\\v1.0\\powershell.exe" -Command '$path = '"'pages/StaffOrdersMobile/staffordersmobile.jsx'; "'$lines = Get-Content -LiteralPath $path; for ($i = 4054; $i -le 4102; $i++) { if ($i -le $lines.Length) { '"'{0}: {1}' -f "'$i, $lines[$i-1] } }' in C:\Users\ASUS\Dev\Menu AI Cowork\menuapp-code-review
 succeeded in 1891ms:
4054: 
4055:     // V2-09: Build banner info with table context
4056:     const buildBannerInfo = (orderIds, eventType) => {
4057:       if (!orderIds.length) return null;
4058:       // Find which table(s) these orders belong to
4059:       const orderMap = {};
4060:       eligibleOrders.forEach(o => { orderMap[o.id] = o; });
4061:       const tableIds = new Set();
4062:       orderIds.forEach(id => {
4063:         const o = orderMap[id];
4064:         if (o) {
4065:           const tId = getLinkId(o.table);
4066:           if (tId) tableIds.add(tId);
4067:         }
4068:       });
4069:       const tableNames = [...tableIds].map(tId => {
4070:         const t = tableMap[tId];
4071:         return t?.name ? `${t.name}` : null;
4072:       }).filter(Boolean);
4073: 
4074:       // Single table: "Стол 5: Новый заказ"
4075:       if (tableNames.length === 1 && orderIds.length === 1) {
4076:         const label = eventType === 'ready' ? 'Заказ готов' : 'Новый заказ';
4077:         return {
4078:           text: `${tableNames[0]}: ${label}`,
4079:           groupId: [...tableIds][0],
4080:           count: 1,
4081:         };
4082:       }
4083:       // Multiple: "3 новых заказа" or "2 заказа готовы"
4084:       const count = orderIds.length;
4085:       if (eventType === 'ready') {
4086:         const word = count === 1 ? 'заказ готов' : count < 5 ? 'заказа готовы' : 'заказов готовы';
4087:         return { text: `${count} ${word}`, groupId: tableIds.size === 1 ? [...tableIds][0] : null, count };
4088:       }
4089:       const word = count === 1 ? 'новый заказ' : count < 5 ? 'новых заказа' : 'новых заказов';
4090:       return { text: `${count} ${word}`, groupId: tableIds.size === 1 ? [...tableIds][0] : null, count };
4091:     };
4092: 
4093:     if (becameReady > 0) {
4094:       const banner = buildBannerInfo(readyOrderIds, 'ready');
4095:       pushNotify(`Готово: +${becameReady}`, [], banner);
4096:       return;
4097:     }
4098:     if (newOrderIds.length > 0) {
4099:       const banner = buildBannerInfo(newOrderIds, 'new');
4100:       pushNotify(`Новые: +${newOrderIds.length}`, newOrderIds, banner);
4101:       // v3.6.0: Force refetch to ensure detail view gets fresh data immediately
4102:       queryClient.invalidateQueries({ queryKey: ['orders'] });

exec
"C:\\WINDOWS\\System32\\WindowsPowerShell\\v1.0\\powershell.exe" -Command 'rg -n "function getLinkId|const getLinkId|export function getLinkId|=> getLinkId|getLinkId =" "pages/StaffOrdersMobile/staffordersmobile.jsx" "components/sessionHelpers.js"' in C:\Users\ASUS\Dev\Menu AI Cowork\menuapp-code-review
 succeeded in 2028ms:
pages/StaffOrdersMobile/staffordersmobile.jsx:546:function getLinkId(field) {
pages/StaffOrdersMobile/staffordersmobile.jsx:806:const uniqueGuests = (orders) => new Set(orders.map(o => getLinkId(o.guest))).size;
pages/StaffOrdersMobile/staffordersmobile.jsx:1118:    const currentStage = stages.find(s => getLinkId(s.id) === orderStageId);
pages/StaffOrdersMobile/staffordersmobile.jsx:1119:    if (currentStage && !filtered.find(s => getLinkId(s.id) === getLinkId(currentStage.id))) {
pages/StaffOrdersMobile/staffordersmobile.jsx:1135:      r => getLinkId(r.table) === group.id
pages/StaffOrdersMobile/staffordersmobile.jsx:1779:      const index = orderStages.findIndex((stage) => getLinkId(stage.id) === sid);
pages/StaffOrdersMobile/staffordersmobile.jsx:1877:    return (activeRequests || []).filter((request) => getLinkId(request.table) === group.id);
pages/StaffOrdersMobile/staffordersmobile.jsx:3444:      const currentIndex = relevantStages.findIndex(s => getLinkId(s.id) === stageId);
pages/StaffOrdersMobile/staffordersmobile.jsx:3655:          .map(o => getLinkId(o.guest))
pages/StaffOrdersMobile/staffordersmobile.jsx:3874:      const hasActiveRequest = group.type === 'table' && activeRequests.some(r => getLinkId(r.table) === group.id);
pages/StaffOrdersMobile/staffordersmobile.jsx:3899:      const hasActiveRequest = group.type === 'table' && activeRequests.some(r => getLinkId(r.table) === group.id);

exec
"C:\\WINDOWS\\System32\\WindowsPowerShell\\v1.0\\powershell.exe" -Command '$path = '"'pages/StaffOrdersMobile/staffordersmobile.jsx'; "'$lines = Get-Content -LiteralPath $path; for ($i = 536; $i -le 556; $i++) { if ($i -le $lines.Length) { '"'{0}: {1}' -f "'$i, $lines[$i-1] } }' in C:\Users\ASUS\Dev\Menu AI Cowork\menuapp-code-review
 succeeded in 2162ms:
536:       if (isRateLimitError(err)) break;
537:     }
538:     if (i < items.length - 1 && delayMs > 0) {
539:       await new Promise((r) => setTimeout(r, delayMs));
540:     }
541:   }
542:   return results;
543: }
544: 
545: // D1-006: Normalize link fields (type-safe: string/number/object/value-object)
546: function getLinkId(field) {
547:   if (field == null) return null; // only null/undefined
548: 
549:   if (typeof field === "string" || typeof field === "number") return String(field);
550: 
551:   if (typeof field === "object") {
552:     const v = field.id ?? field._id ?? field.value ?? null;
553: 
554:     if (typeof v === "string" || typeof v === "number") return String(v);
555: 
556:     if (v && typeof v === "object") {

codex
I’ve confirmed the main StaffOrdersMobile anchors. I’m doing one quick read of `components/sessionHelpers.js` where the prompt makes behavioral claims about closing/opening sessions, because if those references are off, the prompt can mislead the implementing agent about why Fix B and Fix C are safe.
exec
"C:\\WINDOWS\\System32\\WindowsPowerShell\\v1.0\\powershell.exe" -Command '$path = '"'components/sessionHelpers.js'; "'$lines = Get-Content -LiteralPath $path; for ($i = 60; $i -le 190; $i++) { if ($i -le $lines.Length) { '"'{0}: {1}' -f "'$i, $lines[$i-1] } }' in C:\Users\ASUS\Dev\Menu AI Cowork\menuapp-code-review
 succeeded in 1873ms:
60:       order_counter_date: updated.order_counter_date,
61:     }
62:   };
63: }
64: 
65: // ============================================================
66: // FUNCTION 3: getOrCreateSession
67: // Finds open session for table or creates new one
68: // ============================================================
69: export async function getOrCreateSession(tableId, partnerId) {
70:   const sessions = await base44.entities.TableSession.filter({
71:     table: tableId,
72:     status: "open"
73:   });
74: 
75:   if (sessions && sessions.length > 0) {
76:     return sessions[0];
77:   }
78: 
79:   const newSession = await base44.entities.TableSession.create({
80:     table: tableId,
81:     partner: partnerId,
82:     status: "open",
83:     opened_at: new Date().toISOString(),
84:     expires_at: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString()
85:   });
86: 
87:   return newSession;
88: }
89: 
90: // ============================================================
91: // FUNCTION 4: addGuestToSession
92: // Adds guest to session with correct number
93: // ============================================================
94: export async function addGuestToSession(sessionId, name = null, deviceId = null) {
95:   const guests = await base44.entities.SessionGuest.filter({
96:     session: sessionId
97:   });
98: 
99:   const nextNumber = (guests?.length || 0) + 1;
100: 
101:   const newGuest = await base44.entities.SessionGuest.create({
102:     session: sessionId,
103:     guest_number: nextNumber,
104:     name: name || null,
105:     device_id: deviceId || null
106:   });
107: 
108:   return newGuest;
109: }
110: 
111: // ============================================================
112: // FUNCTION 5: findGuestByDevice
113: // Finds guest by device_id in session
114: // ============================================================
115: export async function findGuestByDevice(sessionId, deviceId) {
116:   if (!deviceId) return null;
117: 
118:   const guests = await base44.entities.SessionGuest.filter({
119:     session: sessionId,
120:     device_id: deviceId
121:   });
122: 
123:   return (guests && guests.length > 0) ? guests[0] : null;
124: }
125: 
126: // ============================================================
127: // FUNCTION 6: getSessionGuests
128: // Gets all guests in session
129: // ============================================================
130: export async function getSessionGuests(sessionId) {
131:   const guests = await base44.entities.SessionGuest.filter({
132:     session: sessionId
133:   });
134:   return guests || [];
135: }
136: 
137: // ============================================================
138: // FUNCTION 7: getSessionOrders
139: // Gets all orders in session
140: // ============================================================
141: export async function getSessionOrders(sessionId) {
142:   const orders = await base44.entities.Order.filter({
143:     table_session: sessionId
144:   });
145: 
146:   // Sort by created_at desc (newest first)
147:   const sorted = (orders || []).sort((a, b) =>
148:     new Date(b.created_at || 0) - new Date(a.created_at || 0)
149:   );
150: 
151:   return sorted;
152: }
153: 
154: // ============================================================
155: // FUNCTION 8: closeSession
156: // Closes session
157: // ============================================================
158: export async function closeSession(sessionId, tableId) {
159:   await base44.entities.TableSession.update(sessionId, {
160:     status: "closed",
161:     closed_at: new Date().toISOString()
162:   });
163: 
164:   // S267: Bulk-close all non-cancelled orders in this session (sequential to avoid 429).
165:   const BATCH_DELAY_MS = 120;
166:   const sessionOrders = await base44.entities.Order.filter({ table_session: sessionId });
167:   const ordersToClose = sessionOrders.filter(o => o.status !== 'cancelled');
168:   for (let i = 0; i < ordersToClose.length; i++) {
169:     await base44.entities.Order.update(ordersToClose[i].id, { status: 'closed' });
170:     if (i < ordersToClose.length - 1) {
171:       await new Promise(r => setTimeout(r, BATCH_DELAY_MS));
172:     }
173:   }
174: 
175:   // S283: Close open ServiceRequests for this table (so closed table leaves Active tab)
176:   if (tableId) {
177:     let requests = await base44.entities.ServiceRequest.filter({ table_session: sessionId });
178:     if (requests.length === 0 && tableId) {
179:       requests = await base44.entities.ServiceRequest.filter({ table: tableId });
180:     }
181:     const openRequests = requests.filter(r => !['done', 'cancelled'].includes(r.status));
182:     for (let i = 0; i < openRequests.length; i++) {
183:       await base44.entities.ServiceRequest.update(openRequests[i].id, { status: 'done' });
184:       if (i < openRequests.length - 1) {
185:         await new Promise(r => setTimeout(r, BATCH_DELAY_MS));
186:       }
187:     }
188:   }
189: }
190: 

codex
I’ve hit a design question in the prompt itself: it treats `staleTime` as the main delay source, but this query already has interval polling. I’m checking the actual `effectivePollingInterval` wiring now, because if interval polling dominates freshness, Fix A may be oversold or partially ineffective in the prompt.
exec
"C:\\WINDOWS\\System32\\WindowsPowerShell\\v1.0\\powershell.exe" -Command 'rg -n "effectivePollingInterval|refetchInterval:" "pages/StaffOrdersMobile/staffordersmobile.jsx"' in C:\Users\ASUS\Dev\Menu AI Cowork\menuapp-code-review
 succeeded in 1802ms:
3494:  const effectivePollingInterval = rateLimitHit ? false : (pollingInterval === 0 ? false : pollingInterval);
3507:    refetchInterval: effectivePollingInterval,
3529:    refetchInterval: effectivePollingInterval,
3549:    refetchInterval: effectivePollingInterval,

exec
"C:\\WINDOWS\\System32\\WindowsPowerShell\\v1.0\\powershell.exe" -Command '$path = '"'pages/StaffOrdersMobile/staffordersmobile.jsx'; "'$lines = Get-Content -LiteralPath $path; for ($i = 3478; $i -le 3510; $i++) { if ($i -le $lines.Length) { '"'{0}: {1}' -f "'$i, $lines[$i-1] } }' in C:\Users\ASUS\Dev\Menu AI Cowork\menuapp-code-review
 succeeded in 1890ms:
3478:     
3479:     // Priority 2: Fallback to STATUS_FLOW
3480:     const flow = STATUS_FLOW[order.status];
3481:     return {
3482:       label: flow?.label || STAGE_NAME_FALLBACKS[order.status] || order.status,
3483:       color: null,
3484:       actionLabel: flow?.actionLabel || null,
3485:       nextStageId: null,
3486:       nextStatus: flow?.nextStatus || null,
3487:       badgeClass: flow?.badgeClass || "bg-slate-100",
3488:       isStageMode: false,
3489:       isFirstStage: order.status === 'new',
3490:       isFinishStage: order.status === 'ready' || order.status === 'served',
3491:     };
3492:   }, [stagesMap, sortedStages, t]);
3493: 
3494:   const effectivePollingInterval = rateLimitHit ? false : (pollingInterval === 0 ? false : pollingInterval);
3495: 
3496:   const {
3497:     data: orders,
3498:     isLoading: loadingOrders,
3499:     isError: ordersError,
3500:     error: ordersErrorObj,
3501:     refetch: refetchOrders,
3502:     dataUpdatedAt: ordersUpdatedAt,
3503:   } = useQuery({
3504:     queryKey: ["orders", partnerId],
3505:     queryFn: () => (partnerId ? base44.entities.Order.filter({ partner: partnerId }) : base44.entities.Order.list("-created_date", 1000)),
3506:     enabled: canFetch && !rateLimitHit,
3507:     refetchInterval: effectivePollingInterval,
3508:     refetchIntervalInBackground: false,
3509:     retry: shouldRetry,
3510:   });

exec
"C:\\WINDOWS\\System32\\WindowsPowerShell\\v1.0\\powershell.exe" -Command 'rg -n "pollingInterval|setPollingInterval" "pages/StaffOrdersMobile/staffordersmobile.jsx"' in C:\Users\ASUS\Dev\Menu AI Cowork\menuapp-code-review
 succeeded in 1801ms:
2636:  pollingInterval, 
2699:                    pollingInterval === opt.value
2916:  const [pollingInterval, setPollingInterval] = useState(() => loadPollingInterval());
2924:    setPollingInterval(val);
3494:  const effectivePollingInterval = rateLimitHit ? false : (pollingInterval === 0 ? false : pollingInterval);
4244:    : pollingInterval === 0 
4246:      : `Авто ${pollingInterval / 1000}с`;
4517:        pollingInterval={pollingInterval} 

exec
"C:\\WINDOWS\\System32\\WindowsPowerShell\\v1.0\\powershell.exe" -Command '$path = '"'pages/StaffOrdersMobile/staffordersmobile.jsx'; "'$lines = Get-Content -LiteralPath $path; foreach ($range in @(@{s=2608;e=2642}, @{s=2908;e=2920}, @{s=4238;e=4248})) { for ($i = $range.s; $i -le $range.e; $i++) { if ($i -le $lines.Length) { '"'{0}: {1}' -f "'$i, $lines[$i-1] } }; '"''; }" in C:\Users\ASUS\Dev\Menu AI Cowork\menuapp-code-review
 succeeded in 1896ms:
2608:                       <span>{item}</span>
2609:                     </div>
2610:                   ))}
2611:                 </div>
2612:               </div>
2613:             )}
2614:           </div>
2615:         </div>
2616: 
2617:         {/* Footer - Logout */}
2618:         <div className="p-4 border-t border-slate-200">
2619:           <Button
2620:             variant="outline"
2621:             onClick={onLogout}
2622:             className="w-full text-red-600 border-red-200 hover:bg-red-50"
2623:           >
2624:             <LogOut className="w-4 h-4 mr-2" />
2625:             Выйти
2626:           </Button>
2627:         </div>
2628:       </div>
2629:     </div>
2630:   );
2631: }
2632: 
2633: function SettingsPanel({ 
2634:   open, 
2635:   onClose, 
2636:   pollingInterval, 
2637:   onChangePollingInterval, 
2638:   sortMode, 
2639:   onChangeSortMode,
2640:   selectedTypes,
2641:   onToggleChannel,
2642:   channelCounts,

2908: 
2909:   const [selectedTypes, setSelectedTypes] = useState(() => [...ALL_CHANNELS]);
2910:   const [assignFilters, setAssignFilters] = useState(() => [...ALL_ASSIGN_FILTERS]);
2911:   
2912:   const [sortMode, setSortMode] = useState(() => loadSortMode());
2913:   const [sortOrder, setSortOrder] = useState(() => loadSortOrder());
2914:   
2915:   const [manualRefreshTs, setManualRefreshTs] = useState(null);
2916:   const [pollingInterval, setPollingInterval] = useState(() => loadPollingInterval());
2917:   const [settingsOpen, setSettingsOpen] = useState(false);
2918:   const [profileOpen, setProfileOpen] = useState(false);
2919: 
2920:   // D1-005: State for batch-loaded guests

4238:   const channelLabels = selectedTypes.map((t) => TYPE_THEME[t]?.label || t).join(", ");
4239:   const assignLabels = assignFilters.map((f) => (f === "mine" ? "Мои" : f === "others" ? "Чужие" : "Свободные")).join(", ");
4240: 
4241:   const manualAge = manualRefreshTs ? Math.floor((Date.now() - manualRefreshTs) / 1000) : 9999;
4242:   const refreshLabelText = manualAge <= 2 
4243:     ? "Готово ✓" 
4244:     : pollingInterval === 0 
4245:       ? "Вручную" 
4246:       : `Авто ${pollingInterval / 1000}с`;
4247:   const refreshLabelColor = manualAge <= 2 ? "text-green-600" : "text-slate-400";
4248: 


exec
"C:\\WINDOWS\\System32\\WindowsPowerShell\\v1.0\\powershell.exe" -Command "rg -n \"function loadPollingInterval|const loadPollingInterval|loadPollingInterval\\(\" \"pages/StaffOrdersMobile/staffordersmobile.jsx\"" in C:\Users\ASUS\Dev\Menu AI Cowork\menuapp-code-review
 succeeded in 1831ms:
962:function loadPollingInterval() {
2916:  const [pollingInterval, setPollingInterval] = useState(() => loadPollingInterval());

exec
"C:\\WINDOWS\\System32\\WindowsPowerShell\\v1.0\\powershell.exe" -Command '$path = '"'pages/StaffOrdersMobile/staffordersmobile.jsx'; "'$lines = Get-Content -LiteralPath $path; for ($i = 962; $i -le 980; $i++) { if ($i -le $lines.Length) { '"'{0}: {1}' -f "'$i, $lines[$i-1] } }' in C:\Users\ASUS\Dev\Menu AI Cowork\menuapp-code-review
 succeeded in 1968ms:
962: function loadPollingInterval() {
963:   try {
964:     const raw = sessionStorage.getItem(POLLING_INTERVAL_KEY);
965:     if (!raw) return DEFAULT_POLLING_INTERVAL;
966:     const val = parseInt(raw, 10);
967:     if (POLLING_OPTIONS.some((o) => o.value === val)) return val;
968:     return DEFAULT_POLLING_INTERVAL;
969:   } catch {
970:     return DEFAULT_POLLING_INTERVAL;
971:   }
972: }
973: 
974: function savePollingInterval(val) {
975:   try {
976:     sessionStorage.setItem(POLLING_INTERVAL_KEY, String(val));
977:   } catch { /* ignore */ }
978: }
979: 
980: function loadSortMode() {

exec
"C:\\WINDOWS\\System32\\WindowsPowerShell\\v1.0\\powershell.exe" -Command 'rg -n "DEFAULT_POLLING_INTERVAL|POLLING_OPTIONS" "pages/StaffOrdersMobile/staffordersmobile.jsx"' in C:\Users\ASUS\Dev\Menu AI Cowork\menuapp-code-review
 succeeded in 1825ms:
500:const POLLING_OPTIONS = [
508:const DEFAULT_POLLING_INTERVAL = 5000;
965:    if (!raw) return DEFAULT_POLLING_INTERVAL;
967:    if (POLLING_OPTIONS.some((o) => o.value === val)) return val;
968:    return DEFAULT_POLLING_INTERVAL;
970:    return DEFAULT_POLLING_INTERVAL;
2693:              {POLLING_OPTIONS.map((opt) => (

exec
"C:\\WINDOWS\\System32\\WindowsPowerShell\\v1.0\\powershell.exe" -Command '$path = '"'pages/StaffOrdersMobile/staffordersmobile.jsx'; "'$lines = Get-Content -LiteralPath $path; for ($i = 498; $i -le 510; $i++) { if ($i -le $lines.Length) { '"'{0}: {1}' -f "'$i, $lines[$i-1] } }' in C:\Users\ASUS\Dev\Menu AI Cowork\menuapp-code-review
 succeeded in 2022ms:
498: const ALL_ASSIGN_FILTERS = ["mine", "others", "free"];
499: 
500: const POLLING_OPTIONS = [
501:   { value: 5000, label: "5с" },
502:   { value: 15000, label: "15с" },
503:   { value: 30000, label: "30с" },
504:   { value: 60000, label: "60с" },
505:   { value: 0, label: "Вручную" },
506: ];
507: 
508: const DEFAULT_POLLING_INTERVAL = 5000;
509: const DEFAULT_SORT_MODE = "priority";
510: const DEFAULT_SORT_ORDER = "newest";

codex
I’ve finished the investigation pass and have enough to write the review. I’m saving the findings and the executed-command log into `pages/StaffOrdersMobile/` now, then I’ll attempt the pipeline-required marker/summary files as far as the sandbox allows.
apply patch
patch: completed
C:\Users\ASUS\Dev\Menu AI Cowork\menuapp-code-review\pages\StaffOrdersMobile\commands_2026-04-16.log
C:\Users\ASUS\Dev\Menu AI Cowork\menuapp-code-review\pages\StaffOrdersMobile\review_2026-04-16.md
diff --git a/pages/StaffOrdersMobile/commands_2026-04-16.log b/pages/StaffOrdersMobile/commands_2026-04-16.log
new file mode 100644
index 0000000000000000000000000000000000000000..926b9a38dc3aec185ad7f7a3a76ad20c4d4ced8b
--- /dev/null
+++ b/pages/StaffOrdersMobile/commands_2026-04-16.log
@@ -0,0 +1,30 @@
+Get-Content -LiteralPath 'C:\Users\ASUS\Dev\Menu AI Cowork\pipeline\task-260416-214227-020.prompt' -Raw
+rg -n "openSessions|orderGroups|filteredGroups|tabCounts|handleBannerNavigate|buildBannerInfo|onNavigate\(banner\.groupId\)|data-group-id|useQueryClient|useRef|orphanInvalidateSigRef|tableGroups\[|from 'react'" "pages/StaffOrdersMobile/staffordersmobile.jsx"
+@'
+$path = 'pages/StaffOrdersMobile/staffordersmobile.jsx'
+$lines = Get-Content -LiteralPath $path
+function Show-Range($start, $end) {
+  for ($i = $start; $i -le $end; $i++) {
+    if ($i -le $lines.Length) { '{0}: {1}' -f $i, $lines[$i-1] }
+  }
+}
+Show-Range 3538 3910
+'@ | powershell -NoProfile -Command -
+$path = 'pages/StaffOrdersMobile/staffordersmobile.jsx'; $lines = Get-Content -LiteralPath $path; for ($i = 3538; $i -le 3910; $i++) { if ($i -le $lines.Length) { '{0}: {1}' -f $i, $lines[$i-1] } }
+$path = 'pages/StaffOrdersMobile/staffordersmobile.jsx'; $lines = Get-Content -LiteralPath $path; foreach ($range in @(@{s=2288;e=2296}, @{s=4139;e=4168}, @{s=4568;e=4615}, @{s=3835;e=3859})) { for ($i = $range.s; $i -le $range.e; $i++) { if ($i -le $lines.Length) { '{0}: {1}' -f $i, $lines[$i-1] } }; '' }
+rg -n "expandedGroupId|expandedGroups|setExpandedGroupId|setExpandedGroups|OrderGroupCard|toggleGroupExpand" "pages/StaffOrdersMobile/staffordersmobile.jsx"
+$path = 'pages/StaffOrdersMobile/staffordersmobile.jsx'; $lines = Get-Content -LiteralPath $path; foreach ($range in @(@{s=4128;e=4148}, @{s=4448;e=4466}, @{s=3058;e=3070})) { for ($i = $range.s; $i -le $range.e; $i++) { if ($i -le $lines.Length) { '{0}: {1}' -f $i, $lines[$i-1] } }; '' }
+rg -n "^## |^### |Fix A|Fix B|Fix C|B\.1|B\.2|B\.3|B\.4|B\.5|B\.6|orphan|staleTime|orderGroups|filteredGroups|tabCounts|handleBannerNavigate|data-group-id" "C:\Users\ASUS\Dev\Menu AI Cowork\pipeline\task-260416-214227-020.prompt"
+$path = 'C:\Users\ASUS\Dev\Menu AI Cowork\pipeline\task-260416-214227-020.prompt'; $lines = Get-Content -LiteralPath $path; foreach ($range in @(@{s=402;e=460}, @{s=492;e=746}, @{s=749;e=930}, @{s=994;e=1095})) { for ($i = $range.s; $i -le $range.e; $i++) { if ($i -le $lines.Length) { '{0}: {1}' -f $i, $lines[$i-1] } }; '' }
+$path = 'pages/StaffOrdersMobile/staffordersmobile.jsx'; $lines = Get-Content -LiteralPath $path; for ($i = 4054; $i -le 4102; $i++) { if ($i -le $lines.Length) { '{0}: {1}' -f $i, $lines[$i-1] } }
+rg -n "function getLinkId|const getLinkId|export function getLinkId|=> getLinkId|getLinkId =" "pages/StaffOrdersMobile/staffordersmobile.jsx" "components/sessionHelpers.js"
+$path = 'pages/StaffOrdersMobile/staffordersmobile.jsx'; $lines = Get-Content -LiteralPath $path; for ($i = 536; $i -le 556; $i++) { if ($i -le $lines.Length) { '{0}: {1}' -f $i, $lines[$i-1] } }
+$path = 'components/sessionHelpers.js'; $lines = Get-Content -LiteralPath $path; for ($i = 60; $i -le 190; $i++) { if ($i -le $lines.Length) { '{0}: {1}' -f $i, $lines[$i-1] } }
+rg -n "effectivePollingInterval|refetchInterval:" "pages/StaffOrdersMobile/staffordersmobile.jsx"
+$path = 'pages/StaffOrdersMobile/staffordersmobile.jsx'; $lines = Get-Content -LiteralPath $path; for ($i = 3478; $i -le 3510; $i++) { if ($i -le $lines.Length) { '{0}: {1}' -f $i, $lines[$i-1] } }
+rg -n "pollingInterval|setPollingInterval" "pages/StaffOrdersMobile/staffordersmobile.jsx"
+$path = 'pages/StaffOrdersMobile/staffordersmobile.jsx'; $lines = Get-Content -LiteralPath $path; foreach ($range in @(@{s=2608;e=2642}, @{s=2908;e=2920}, @{s=4238;e=4248})) { for ($i = $range.s; $i -le $range.e; $i++) { if ($i -le $lines.Length) { '{0}: {1}' -f $i, $lines[$i-1] } }; '' }
+rg -n "function loadPollingInterval|const loadPollingInterval|loadPollingInterval\(" "pages/StaffOrdersMobile/staffordersmobile.jsx"
+$path = 'pages/StaffOrdersMobile/staffordersmobile.jsx'; $lines = Get-Content -LiteralPath $path; for ($i = 962; $i -le 980; $i++) { if ($i -le $lines.Length) { '{0}: {1}' -f $i, $lines[$i-1] } }
+rg -n "DEFAULT_POLLING_INTERVAL|POLLING_OPTIONS" "pages/StaffOrdersMobile/staffordersmobile.jsx"
+$path = 'pages/StaffOrdersMobile/staffordersmobile.jsx'; $lines = Get-Content -LiteralPath $path; for ($i = 498; $i -le 510; $i++) { if ($i -le $lines.Length) { '{0}: {1}' -f $i, $lines[$i-1] } }
diff --git a/pages/StaffOrdersMobile/review_2026-04-16.md b/pages/StaffOrdersMobile/review_2026-04-16.md
new file mode 100644
index 0000000000000000000000000000000000000000..2f05fa68a7e85dd3cc91750dab357b20ee82f983
--- /dev/null
+++ b/pages/StaffOrdersMobile/review_2026-04-16.md
@@ -0,0 +1,32 @@
+# Codex Reviewer Findings — ПССК Prompt Quality Review
+Chain: staffordersmobile-260416-213112-930f
+
+## Issues Found
+1. [MEDIUM] Fix A overstates `staleTime` as the main freshness gate — Prompt lines 148-160 and 402-460 treat `staleTime: 30_000` as the reason SOM can miss a new `TableSession` for 30 seconds. In the live source, the same query already polls on `refetchInterval: effectivePollingInterval` at `pages/StaffOrdersMobile/staffordersmobile.jsx:3549`, and `effectivePollingInterval` defaults to `5000` with user options `5s/15s/30s/60s/manual` at `pages/StaffOrdersMobile/staffordersmobile.jsx:500-508` and `:962-968`. Under default settings, lowering `staleTime` is mostly redundant, and in manual or slower polling modes it still does not guarantee a fast refresh. PROMPT FIX: rewrite Root Cause and Fix A around the actual polling/invalidation race, and downgrade Fix A from mandatory root-cause fix to optional/supporting change unless the prompt also changes the polling behavior.
+2. [MEDIUM] Fix C is incorrectly described as depending on Fix B — Prompt lines 338-344 and 950-954 say Fix B must be applied before Fix C because Fix C reads `group.sessionId`. The Fix C patch body at prompt lines 1033-1085 does not read `orderGroups` or `group.sessionId` at all; it only uses `orders`, `openSessionByTableId`, `getLinkId`, and `queryClient`. This wrong dependency can make an executor stop or roll back Fix C unnecessarily if B.1 conflicts, even though C is logically independent. PROMPT FIX: remove the stated dependency and say only B.6 depends on composite keys, while Fix C is an independent optional invalidation optimization.
+3. [MEDIUM] Fix C scans raw partner orders without a convincing boundary, which can produce avoidable invalidations — Prompt lines 1100-1104 justify using raw `orders` instead of `activeOrders` by saying activeOrders could miss a freshly created order because of `shiftCutoff`. A genuinely fresh order after shift start should not be filtered out by that cutoff. The proposed effect at prompt lines 1049-1085 instead iterates every partner order from `data: orders` (`pages/StaffOrdersMobile/staffordersmobile.jsx:3496-3505`), so historical non-closed anomalies outside the current waiter context can still trigger `invalidateQueries({ queryKey: ["openSessions"] })`. PROMPT FIX: either constrain orphan detection to the same shift/current-visibility boundary as the UI, or replace the current rationale with a verified status-based reason and explicitly document the historical-order tradeoff.
+4. [LOW] The prompt does not warn about the dual expansion state already present in the source — B.4/B.6 tell the executor to move card identity to `group.compositeKey` through the `expandedGroupId` path, but the file still contains older `expandedGroups` state and an auto-expand effect at `pages/StaffOrdersMobile/staffordersmobile.jsx:3061` and `:3835-3849`, while rendering actually uses `expandedGroupId` at `:4458-4463`. That stale state is out of scope, but not calling it out invites hesitation or accidental cleanup during B.4. PROMPT FIX: add one sentence in Context or B.4 that `expandedGroups` is pre-existing dead state and must be left untouched in this batch.
+
+## Summary
+Total: 4 issues (0 CRITICAL, 3 MEDIUM, 1 LOW)
+
+## Additional Risks
+- The prompt's strict `git diff ... only in 8 locations` and exact sequencing guidance are brittle against branch drift or minor formatter movement. That is acceptable in a controlled pipeline, but it should be presented as a safety heuristic rather than as proof that the fix is correct.
+- Because Fix A is presented as mandatory, an executor may spend time validating an almost-no-op freshness tweak instead of focusing on Fix B, which is the real UX separator.
+
+## Prompt Clarity (MANDATORY — do NOT skip)
+- Overall clarity: 3/5
+- What was most clear: Fix B's identifier contract is strong. The table describing `group.id` vs `group.compositeKey` vs `group.sessionId`, plus the banner call-chain, makes the intended shape of the session-aware grouping understandable.
+- What was ambiguous or could cause hesitation: The prompt mixes two different freshness models for `openSessions` and overstates the role of `staleTime`. It also claims Fix C depends on Fix B even though the provided Fix C patch does not.
+- Missing context: The prompt should explicitly acknowledge the existing dual expansion state (`expandedGroups` plus `expandedGroupId`) and should explain whether Fix C should respect current-shift boundaries or intentionally scan historical orders.
+
+## Fix Ratings (MANDATORY — ALWAYS include this section, even if no issues found)
+Rate each Fix mentioned in the prompt. Scale: 1=Rewrite needed, 2=Major issues, 3=Needs clarification, 4=Minor issues, 5=Clear.
+
+| Fix | Rating (1-5) | Verdict | Key issue (if any) |
+|-----|-------------|---------|-------------------|
+| Fix A | 2/5 | Rewrite needed | Misattributes the freshness delay to `staleTime` even though `openSessions` already interval-polls and defaults to 5s polling. |
+| Fix B | 4/5 | Clear | Core session-aware grouping design is coherent, but the prompt should warn about the stale `expandedGroups` path already present in the file. |
+| Fix C | 3/5 | Needs clarification | Patch body is understandable, but the prompt states a false dependency on Fix B and does not bound the raw-order scan convincingly. |
+
+Overall prompt verdict: NEEDS REVISION

diff --git a/pages/StaffOrdersMobile/commands_2026-04-16.log b/pages/StaffOrdersMobile/commands_2026-04-16.log
new file mode 100644
index 0000000000000000000000000000000000000000..926b9a38dc3aec185ad7f7a3a76ad20c4d4ced8b
--- /dev/null
+++ b/pages/StaffOrdersMobile/commands_2026-04-16.log
@@ -0,0 +1,30 @@
+Get-Content -LiteralPath 'C:\Users\ASUS\Dev\Menu AI Cowork\pipeline\task-260416-214227-020.prompt' -Raw
+rg -n "openSessions|orderGroups|filteredGroups|tabCounts|handleBannerNavigate|buildBannerInfo|onNavigate\(banner\.groupId\)|data-group-id|useQueryClient|useRef|orphanInvalidateSigRef|tableGroups\[|from 'react'" "pages/StaffOrdersMobile/staffordersmobile.jsx"
+@'
+$path = 'pages/StaffOrdersMobile/staffordersmobile.jsx'
+$lines = Get-Content -LiteralPath $path
+function Show-Range($start, $end) {
+  for ($i = $start; $i -le $end; $i++) {
+    if ($i -le $lines.Length) { '{0}: {1}' -f $i, $lines[$i-1] }
+  }
+}
+Show-Range 3538 3910
+'@ | powershell -NoProfile -Command -
+$path = 'pages/StaffOrdersMobile/staffordersmobile.jsx'; $lines = Get-Content -LiteralPath $path; for ($i = 3538; $i -le 3910; $i++) { if ($i -le $lines.Length) { '{0}: {1}' -f $i, $lines[$i-1] } }
+$path = 'pages/StaffOrdersMobile/staffordersmobile.jsx'; $lines = Get-Content -LiteralPath $path; foreach ($range in @(@{s=2288;e=2296}, @{s=4139;e=4168}, @{s=4568;e=4615}, @{s=3835;e=3859})) { for ($i = $range.s; $i -le $range.e; $i++) { if ($i -le $lines.Length) { '{0}: {1}' -f $i, $lines[$i-1] } }; '' }
+rg -n "expandedGroupId|expandedGroups|setExpandedGroupId|setExpandedGroups|OrderGroupCard|toggleGroupExpand" "pages/StaffOrdersMobile/staffordersmobile.jsx"
+$path = 'pages/StaffOrdersMobile/staffordersmobile.jsx'; $lines = Get-Content -LiteralPath $path; foreach ($range in @(@{s=4128;e=4148}, @{s=4448;e=4466}, @{s=3058;e=3070})) { for ($i = $range.s; $i -le $range.e; $i++) { if ($i -le $lines.Length) { '{0}: {1}' -f $i, $lines[$i-1] } }; '' }
+rg -n "^## |^### |Fix A|Fix B|Fix C|B\.1|B\.2|B\.3|B\.4|B\.5|B\.6|orphan|staleTime|orderGroups|filteredGroups|tabCounts|handleBannerNavigate|data-group-id" "C:\Users\ASUS\Dev\Menu AI Cowork\pipeline\task-260416-214227-020.prompt"
+$path = 'C:\Users\ASUS\Dev\Menu AI Cowork\pipeline\task-260416-214227-020.prompt'; $lines = Get-Content -LiteralPath $path; foreach ($range in @(@{s=402;e=460}, @{s=492;e=746}, @{s=749;e=930}, @{s=994;e=1095})) { for ($i = $range.s; $i -le $range.e; $i++) { if ($i -le $lines.Length) { '{0}: {1}' -f $i, $lines[$i-1] } }; '' }
+$path = 'pages/StaffOrdersMobile/staffordersmobile.jsx'; $lines = Get-Content -LiteralPath $path; for ($i = 4054; $i -le 4102; $i++) { if ($i -le $lines.Length) { '{0}: {1}' -f $i, $lines[$i-1] } }
+rg -n "function getLinkId|const getLinkId|export function getLinkId|=> getLinkId|getLinkId =" "pages/StaffOrdersMobile/staffordersmobile.jsx" "components/sessionHelpers.js"
+$path = 'pages/StaffOrdersMobile/staffordersmobile.jsx'; $lines = Get-Content -LiteralPath $path; for ($i = 536; $i -le 556; $i++) { if ($i -le $lines.Length) { '{0}: {1}' -f $i, $lines[$i-1] } }
+$path = 'components/sessionHelpers.js'; $lines = Get-Content -LiteralPath $path; for ($i = 60; $i -le 190; $i++) { if ($i -le $lines.Length) { '{0}: {1}' -f $i, $lines[$i-1] } }
+rg -n "effectivePollingInterval|refetchInterval:" "pages/StaffOrdersMobile/staffordersmobile.jsx"
+$path = 'pages/StaffOrdersMobile/staffordersmobile.jsx'; $lines = Get-Content -LiteralPath $path; for ($i = 3478; $i -le 3510; $i++) { if ($i -le $lines.Length) { '{0}: {1}' -f $i, $lines[$i-1] } }
+rg -n "pollingInterval|setPollingInterval" "pages/StaffOrdersMobile/staffordersmobile.jsx"
+$path = 'pages/StaffOrdersMobile/staffordersmobile.jsx'; $lines = Get-Content -LiteralPath $path; foreach ($range in @(@{s=2608;e=2642}, @{s=2908;e=2920}, @{s=4238;e=4248})) { for ($i = $range.s; $i -le $range.e; $i++) { if ($i -le $lines.Length) { '{0}: {1}' -f $i, $lines[$i-1] } }; '' }
+rg -n "function loadPollingInterval|const loadPollingInterval|loadPollingInterval\(" "pages/StaffOrdersMobile/staffordersmobile.jsx"
+$path = 'pages/StaffOrdersMobile/staffordersmobile.jsx'; $lines = Get-Content -LiteralPath $path; for ($i = 962; $i -le 980; $i++) { if ($i -le $lines.Length) { '{0}: {1}' -f $i, $lines[$i-1] } }
+rg -n "DEFAULT_POLLING_INTERVAL|POLLING_OPTIONS" "pages/StaffOrdersMobile/staffordersmobile.jsx"
+$path = 'pages/StaffOrdersMobile/staffordersmobile.jsx'; $lines = Get-Content -LiteralPath $path; for ($i = 498; $i -le 510; $i++) { if ($i -le $lines.Length) { '{0}: {1}' -f $i, $lines[$i-1] } }
diff --git a/pages/StaffOrdersMobile/review_2026-04-16.md b/pages/StaffOrdersMobile/review_2026-04-16.md
new file mode 100644
index 0000000000000000000000000000000000000000..2f05fa68a7e85dd3cc91750dab357b20ee82f983
--- /dev/null
+++ b/pages/StaffOrdersMobile/review_2026-04-16.md
@@ -0,0 +1,32 @@
+# Codex Reviewer Findings — ПССК Prompt Quality Review
+Chain: staffordersmobile-260416-213112-930f
+
+## Issues Found
+1. [MEDIUM] Fix A overstates `staleTime` as the main freshness gate — Prompt lines 148-160 and 402-460 treat `staleTime: 30_000` as the reason SOM can miss a new `TableSession` for 30 seconds. In the live source, the same query already polls on `refetchInterval: effectivePollingInterval` at `pages/StaffOrdersMobile/staffordersmobile.jsx:3549`, and `effectivePollingInterval` defaults to `5000` with user options `5s/15s/30s/60s/manual` at `pages/StaffOrdersMobile/staffordersmobile.jsx:500-508` and `:962-968`. Under default settings, lowering `staleTime` is mostly redundant, and in manual or slower polling modes it still does not guarantee a fast refresh. PROMPT FIX: rewrite Root Cause and Fix A around the actual polling/invalidation race, and downgrade Fix A from mandatory root-cause fix to optional/supporting change unless the prompt also changes the polling behavior.
+2. [MEDIUM] Fix C is incorrectly described as depending on Fix B — Prompt lines 338-344 and 950-954 say Fix B must be applied before Fix C because Fix C reads `group.sessionId`. The Fix C patch body at prompt lines 1033-1085 does not read `orderGroups` or `group.sessionId` at all; it only uses `orders`, `openSessionByTableId`, `getLinkId`, and `queryClient`. This wrong dependency can make an executor stop or roll back Fix C unnecessarily if B.1 conflicts, even though C is logically independent. PROMPT FIX: remove the stated dependency and say only B.6 depends on composite keys, while Fix C is an independent optional invalidation optimization.
+3. [MEDIUM] Fix C scans raw partner orders without a convincing boundary, which can produce avoidable invalidations — Prompt lines 1100-1104 justify using raw `orders` instead of `activeOrders` by saying activeOrders could miss a freshly created order because of `shiftCutoff`. A genuinely fresh order after shift start should not be filtered out by that cutoff. The proposed effect at prompt lines 1049-1085 instead iterates every partner order from `data: orders` (`pages/StaffOrdersMobile/staffordersmobile.jsx:3496-3505`), so historical non-closed anomalies outside the current waiter context can still trigger `invalidateQueries({ queryKey: ["openSessions"] })`. PROMPT FIX: either constrain orphan detection to the same shift/current-visibility boundary as the UI, or replace the current rationale with a verified status-based reason and explicitly document the historical-order tradeoff.
+4. [LOW] The prompt does not warn about the dual expansion state already present in the source — B.4/B.6 tell the executor to move card identity to `group.compositeKey` through the `expandedGroupId` path, but the file still contains older `expandedGroups` state and an auto-expand effect at `pages/StaffOrdersMobile/staffordersmobile.jsx:3061` and `:3835-3849`, while rendering actually uses `expandedGroupId` at `:4458-4463`. That stale state is out of scope, but not calling it out invites hesitation or accidental cleanup during B.4. PROMPT FIX: add one sentence in Context or B.4 that `expandedGroups` is pre-existing dead state and must be left untouched in this batch.
+
+## Summary
+Total: 4 issues (0 CRITICAL, 3 MEDIUM, 1 LOW)
+
+## Additional Risks
+- The prompt's strict `git diff ... only in 8 locations` and exact sequencing guidance are brittle against branch drift or minor formatter movement. That is acceptable in a controlled pipeline, but it should be presented as a safety heuristic rather than as proof that the fix is correct.
+- Because Fix A is presented as mandatory, an executor may spend time validating an almost-no-op freshness tweak instead of focusing on Fix B, which is the real UX separator.
+
+## Prompt Clarity (MANDATORY — do NOT skip)
+- Overall clarity: 3/5
+- What was most clear: Fix B's identifier contract is strong. The table describing `group.id` vs `group.compositeKey` vs `group.sessionId`, plus the banner call-chain, makes the intended shape of the session-aware grouping understandable.
+- What was ambiguous or could cause hesitation: The prompt mixes two different freshness models for `openSessions` and overstates the role of `staleTime`. It also claims Fix C depends on Fix B even though the provided Fix C patch does not.
+- Missing context: The prompt should explicitly acknowledge the existing dual expansion state (`expandedGroups` plus `expandedGroupId`) and should explain whether Fix C should respect current-shift boundaries or intentionally scan historical orders.
+
+## Fix Ratings (MANDATORY — ALWAYS include this section, even if no issues found)
+Rate each Fix mentioned in the prompt. Scale: 1=Rewrite needed, 2=Major issues, 3=Needs clarification, 4=Minor issues, 5=Clear.
+
+| Fix | Rating (1-5) | Verdict | Key issue (if any) |
+|-----|-------------|---------|-------------------|
+| Fix A | 2/5 | Rewrite needed | Misattributes the freshness delay to `staleTime` even though `openSessions` already interval-polls and defaults to 5s polling. |
+| Fix B | 4/5 | Clear | Core session-aware grouping design is coherent, but the prompt should warn about the stale `expandedGroups` path already present in the file. |
+| Fix C | 3/5 | Needs clarification | Patch body is understandable, but the prompt states a false dependency on Fix B and does not bound the raw-order scan convincingly. |
+
+Overall prompt verdict: NEEDS REVISION

codex
The repo-side report and command log are saved. I’m making one pass to emit the pipeline marker/progress artifacts next; those paths are outside the normal writable root, so this is the point where the sandbox may block me.
exec
"C:\\WINDOWS\\System32\\WindowsPowerShell\\v1.0\\powershell.exe" -Command 'Get-Date -Format o' in C:\Users\ASUS\Dev\Menu AI Cowork\menuapp-code-review
 succeeded in 4779ms:
2026-04-16T21:52:46.2740772+05:00

diff --git a/pages/StaffOrdersMobile/commands_2026-04-16.log b/pages/StaffOrdersMobile/commands_2026-04-16.log
new file mode 100644
index 0000000000000000000000000000000000000000..926b9a38dc3aec185ad7f7a3a76ad20c4d4ced8b
--- /dev/null
+++ b/pages/StaffOrdersMobile/commands_2026-04-16.log
@@ -0,0 +1,30 @@
+Get-Content -LiteralPath 'C:\Users\ASUS\Dev\Menu AI Cowork\pipeline\task-260416-214227-020.prompt' -Raw
+rg -n "openSessions|orderGroups|filteredGroups|tabCounts|handleBannerNavigate|buildBannerInfo|onNavigate\(banner\.groupId\)|data-group-id|useQueryClient|useRef|orphanInvalidateSigRef|tableGroups\[|from 'react'" "pages/StaffOrdersMobile/staffordersmobile.jsx"
+@'
+$path = 'pages/StaffOrdersMobile/staffordersmobile.jsx'
+$lines = Get-Content -LiteralPath $path
+function Show-Range($start, $end) {
+  for ($i = $start; $i -le $end; $i++) {
+    if ($i -le $lines.Length) { '{0}: {1}' -f $i, $lines[$i-1] }
+  }
+}
+Show-Range 3538 3910
+'@ | powershell -NoProfile -Command -
+$path = 'pages/StaffOrdersMobile/staffordersmobile.jsx'; $lines = Get-Content -LiteralPath $path; for ($i = 3538; $i -le 3910; $i++) { if ($i -le $lines.Length) { '{0}: {1}' -f $i, $lines[$i-1] } }
+$path = 'pages/StaffOrdersMobile/staffordersmobile.jsx'; $lines = Get-Content -LiteralPath $path; foreach ($range in @(@{s=2288;e=2296}, @{s=4139;e=4168}, @{s=4568;e=4615}, @{s=3835;e=3859})) { for ($i = $range.s; $i -le $range.e; $i++) { if ($i -le $lines.Length) { '{0}: {1}' -f $i, $lines[$i-1] } }; '' }
+rg -n "expandedGroupId|expandedGroups|setExpandedGroupId|setExpandedGroups|OrderGroupCard|toggleGroupExpand" "pages/StaffOrdersMobile/staffordersmobile.jsx"
+$path = 'pages/StaffOrdersMobile/staffordersmobile.jsx'; $lines = Get-Content -LiteralPath $path; foreach ($range in @(@{s=4128;e=4148}, @{s=4448;e=4466}, @{s=3058;e=3070})) { for ($i = $range.s; $i -le $range.e; $i++) { if ($i -le $lines.Length) { '{0}: {1}' -f $i, $lines[$i-1] } }; '' }
+rg -n "^## |^### |Fix A|Fix B|Fix C|B\.1|B\.2|B\.3|B\.4|B\.5|B\.6|orphan|staleTime|orderGroups|filteredGroups|tabCounts|handleBannerNavigate|data-group-id" "C:\Users\ASUS\Dev\Menu AI Cowork\pipeline\task-260416-214227-020.prompt"
+$path = 'C:\Users\ASUS\Dev\Menu AI Cowork\pipeline\task-260416-214227-020.prompt'; $lines = Get-Content -LiteralPath $path; foreach ($range in @(@{s=402;e=460}, @{s=492;e=746}, @{s=749;e=930}, @{s=994;e=1095})) { for ($i = $range.s; $i -le $range.e; $i++) { if ($i -le $lines.Length) { '{0}: {1}' -f $i, $lines[$i-1] } }; '' }
+$path = 'pages/StaffOrdersMobile/staffordersmobile.jsx'; $lines = Get-Content -LiteralPath $path; for ($i = 4054; $i -le 4102; $i++) { if ($i -le $lines.Length) { '{0}: {1}' -f $i, $lines[$i-1] } }
+rg -n "function getLinkId|const getLinkId|export function getLinkId|=> getLinkId|getLinkId =" "pages/StaffOrdersMobile/staffordersmobile.jsx" "components/sessionHelpers.js"
+$path = 'pages/StaffOrdersMobile/staffordersmobile.jsx'; $lines = Get-Content -LiteralPath $path; for ($i = 536; $i -le 556; $i++) { if ($i -le $lines.Length) { '{0}: {1}' -f $i, $lines[$i-1] } }
+$path = 'components/sessionHelpers.js'; $lines = Get-Content -LiteralPath $path; for ($i = 60; $i -le 190; $i++) { if ($i -le $lines.Length) { '{0}: {1}' -f $i, $lines[$i-1] } }
+rg -n "effectivePollingInterval|refetchInterval:" "pages/StaffOrdersMobile/staffordersmobile.jsx"
+$path = 'pages/StaffOrdersMobile/staffordersmobile.jsx'; $lines = Get-Content -LiteralPath $path; for ($i = 3478; $i -le 3510; $i++) { if ($i -le $lines.Length) { '{0}: {1}' -f $i, $lines[$i-1] } }
+rg -n "pollingInterval|setPollingInterval" "pages/StaffOrdersMobile/staffordersmobile.jsx"
+$path = 'pages/StaffOrdersMobile/staffordersmobile.jsx'; $lines = Get-Content -LiteralPath $path; foreach ($range in @(@{s=2608;e=2642}, @{s=2908;e=2920}, @{s=4238;e=4248})) { for ($i = $range.s; $i -le $range.e; $i++) { if ($i -le $lines.Length) { '{0}: {1}' -f $i, $lines[$i-1] } }; '' }
+rg -n "function loadPollingInterval|const loadPollingInterval|loadPollingInterval\(" "pages/StaffOrdersMobile/staffordersmobile.jsx"
+$path = 'pages/StaffOrdersMobile/staffordersmobile.jsx'; $lines = Get-Content -LiteralPath $path; for ($i = 962; $i -le 980; $i++) { if ($i -le $lines.Length) { '{0}: {1}' -f $i, $lines[$i-1] } }
+rg -n "DEFAULT_POLLING_INTERVAL|POLLING_OPTIONS" "pages/StaffOrdersMobile/staffordersmobile.jsx"
+$path = 'pages/StaffOrdersMobile/staffordersmobile.jsx'; $lines = Get-Content -LiteralPath $path; for ($i = 498; $i -le 510; $i++) { if ($i -le $lines.Length) { '{0}: {1}' -f $i, $lines[$i-1] } }
diff --git a/pages/StaffOrdersMobile/review_2026-04-16.md b/pages/StaffOrdersMobile/review_2026-04-16.md
new file mode 100644
index 0000000000000000000000000000000000000000..2f05fa68a7e85dd3cc91750dab357b20ee82f983
--- /dev/null
+++ b/pages/StaffOrdersMobile/review_2026-04-16.md
@@ -0,0 +1,32 @@
+# Codex Reviewer Findings — ПССК Prompt Quality Review
+Chain: staffordersmobile-260416-213112-930f
+
+## Issues Found
+1. [MEDIUM] Fix A overstates `staleTime` as the main freshness gate — Prompt lines 148-160 and 402-460 treat `staleTime: 30_000` as the reason SOM can miss a new `TableSession` for 30 seconds. In the live source, the same query already polls on `refetchInterval: effectivePollingInterval` at `pages/StaffOrdersMobile/staffordersmobile.jsx:3549`, and `effectivePollingInterval` defaults to `5000` with user options `5s/15s/30s/60s/manual` at `pages/StaffOrdersMobile/staffordersmobile.jsx:500-508` and `:962-968`. Under default settings, lowering `staleTime` is mostly redundant, and in manual or slower polling modes it still does not guarantee a fast refresh. PROMPT FIX: rewrite Root Cause and Fix A around the actual polling/invalidation race, and downgrade Fix A from mandatory root-cause fix to optional/supporting change unless the prompt also changes the polling behavior.
+2. [MEDIUM] Fix C is incorrectly described as depending on Fix B — Prompt lines 338-344 and 950-954 say Fix B must be applied before Fix C because Fix C reads `group.sessionId`. The Fix C patch body at prompt lines 1033-1085 does not read `orderGroups` or `group.sessionId` at all; it only uses `orders`, `openSessionByTableId`, `getLinkId`, and `queryClient`. This wrong dependency can make an executor stop or roll back Fix C unnecessarily if B.1 conflicts, even though C is logically independent. PROMPT FIX: remove the stated dependency and say only B.6 depends on composite keys, while Fix C is an independent optional invalidation optimization.
+3. [MEDIUM] Fix C scans raw partner orders without a convincing boundary, which can produce avoidable invalidations — Prompt lines 1100-1104 justify using raw `orders` instead of `activeOrders` by saying activeOrders could miss a freshly created order because of `shiftCutoff`. A genuinely fresh order after shift start should not be filtered out by that cutoff. The proposed effect at prompt lines 1049-1085 instead iterates every partner order from `data: orders` (`pages/StaffOrdersMobile/staffordersmobile.jsx:3496-3505`), so historical non-closed anomalies outside the current waiter context can still trigger `invalidateQueries({ queryKey: ["openSessions"] })`. PROMPT FIX: either constrain orphan detection to the same shift/current-visibility boundary as the UI, or replace the current rationale with a verified status-based reason and explicitly document the historical-order tradeoff.
+4. [LOW] The prompt does not warn about the dual expansion state already present in the source — B.4/B.6 tell the executor to move card identity to `group.compositeKey` through the `expandedGroupId` path, but the file still contains older `expandedGroups` state and an auto-expand effect at `pages/StaffOrdersMobile/staffordersmobile.jsx:3061` and `:3835-3849`, while rendering actually uses `expandedGroupId` at `:4458-4463`. That stale state is out of scope, but not calling it out invites hesitation or accidental cleanup during B.4. PROMPT FIX: add one sentence in Context or B.4 that `expandedGroups` is pre-existing dead state and must be left untouched in this batch.
+
+## Summary
+Total: 4 issues (0 CRITICAL, 3 MEDIUM, 1 LOW)
+
+## Additional Risks
+- The prompt's strict `git diff ... only in 8 locations` and exact sequencing guidance are brittle against branch drift or minor formatter movement. That is acceptable in a controlled pipeline, but it should be presented as a safety heuristic rather than as proof that the fix is correct.
+- Because Fix A is presented as mandatory, an executor may spend time validating an almost-no-op freshness tweak instead of focusing on Fix B, which is the real UX separator.
+
+## Prompt Clarity (MANDATORY — do NOT skip)
+- Overall clarity: 3/5
+- What was most clear: Fix B's identifier contract is strong. The table describing `group.id` vs `group.compositeKey` vs `group.sessionId`, plus the banner call-chain, makes the intended shape of the session-aware grouping understandable.
+- What was ambiguous or could cause hesitation: The prompt mixes two different freshness models for `openSessions` and overstates the role of `staleTime`. It also claims Fix C depends on Fix B even though the provided Fix C patch does not.
+- Missing context: The prompt should explicitly acknowledge the existing dual expansion state (`expandedGroups` plus `expandedGroupId`) and should explain whether Fix C should respect current-shift boundaries or intentionally scan historical orders.
+
+## Fix Ratings (MANDATORY — ALWAYS include this section, even if no issues found)
+Rate each Fix mentioned in the prompt. Scale: 1=Rewrite needed, 2=Major issues, 3=Needs clarification, 4=Minor issues, 5=Clear.
+
+| Fix | Rating (1-5) | Verdict | Key issue (if any) |
+|-----|-------------|---------|-------------------|
+| Fix A | 2/5 | Rewrite needed | Misattributes the freshness delay to `staleTime` even though `openSessions` already interval-polls and defaults to 5s polling. |
+| Fix B | 4/5 | Clear | Core session-aware grouping design is coherent, but the prompt should warn about the stale `expandedGroups` path already present in the file. |
+| Fix C | 3/5 | Needs clarification | Patch body is understandable, but the prompt states a false dependency on Fix B and does not bound the raw-order scan convincingly. |
+
+Overall prompt verdict: NEEDS REVISION

exec
"C:\\WINDOWS\\System32\\WindowsPowerShell\\v1.0\\powershell.exe" -Command "@(
  'C:\\Users\\ASUS\\Dev\\Menu AI Cowork\\pipeline\\started-task-260416-214227-020.md',
  'C:\\Users\\ASUS\\Dev\\Menu AI Cowork\\pipeline\\progress-task-260416-214227-020.txt',
  'C:\\Users\\ASUS\\Dev\\Menu AI Cowork\\pipeline\\chain-state\\staffordersmobile-260416-213112-930f-codex-findings.md',
  'C:\\Users\\ASUS\\Dev\\Menu AI Cowork\\pipeline\\cc-analysis-task-260416-214227-020.txt'
) | ForEach-Object { \""'$_`t$(Test-Path -LiteralPath $_)" }' in C:\Users\ASUS\Dev\Menu AI Cowork\menuapp-code-review
 succeeded in 7850ms:
C:\Users\ASUS\Dev\Menu AI Cowork\pipeline\started-task-260416-214227-020.md	False
C:\Users\ASUS\Dev\Menu AI Cowork\pipeline\progress-task-260416-214227-020.txt	True
C:\Users\ASUS\Dev\Menu AI Cowork\pipeline\chain-state\staffordersmobile-260416-213112-930f-codex-findings.md	False
C:\Users\ASUS\Dev\Menu AI Cowork\pipeline\cc-analysis-task-260416-214227-020.txt	False

diff --git a/pages/StaffOrdersMobile/commands_2026-04-16.log b/pages/StaffOrdersMobile/commands_2026-04-16.log
new file mode 100644
index 0000000000000000000000000000000000000000..926b9a38dc3aec185ad7f7a3a76ad20c4d4ced8b
--- /dev/null
+++ b/pages/StaffOrdersMobile/commands_2026-04-16.log
@@ -0,0 +1,30 @@
+Get-Content -LiteralPath 'C:\Users\ASUS\Dev\Menu AI Cowork\pipeline\task-260416-214227-020.prompt' -Raw
+rg -n "openSessions|orderGroups|filteredGroups|tabCounts|handleBannerNavigate|buildBannerInfo|onNavigate\(banner\.groupId\)|data-group-id|useQueryClient|useRef|orphanInvalidateSigRef|tableGroups\[|from 'react'" "pages/StaffOrdersMobile/staffordersmobile.jsx"
+@'
+$path = 'pages/StaffOrdersMobile/staffordersmobile.jsx'
+$lines = Get-Content -LiteralPath $path
+function Show-Range($start, $end) {
+  for ($i = $start; $i -le $end; $i++) {
+    if ($i -le $lines.Length) { '{0}: {1}' -f $i, $lines[$i-1] }
+  }
+}
+Show-Range 3538 3910
+'@ | powershell -NoProfile -Command -
+$path = 'pages/StaffOrdersMobile/staffordersmobile.jsx'; $lines = Get-Content -LiteralPath $path; for ($i = 3538; $i -le 3910; $i++) { if ($i -le $lines.Length) { '{0}: {1}' -f $i, $lines[$i-1] } }
+$path = 'pages/StaffOrdersMobile/staffordersmobile.jsx'; $lines = Get-Content -LiteralPath $path; foreach ($range in @(@{s=2288;e=2296}, @{s=4139;e=4168}, @{s=4568;e=4615}, @{s=3835;e=3859})) { for ($i = $range.s; $i -le $range.e; $i++) { if ($i -le $lines.Length) { '{0}: {1}' -f $i, $lines[$i-1] } }; '' }
+rg -n "expandedGroupId|expandedGroups|setExpandedGroupId|setExpandedGroups|OrderGroupCard|toggleGroupExpand" "pages/StaffOrdersMobile/staffordersmobile.jsx"
+$path = 'pages/StaffOrdersMobile/staffordersmobile.jsx'; $lines = Get-Content -LiteralPath $path; foreach ($range in @(@{s=4128;e=4148}, @{s=4448;e=4466}, @{s=3058;e=3070})) { for ($i = $range.s; $i -le $range.e; $i++) { if ($i -le $lines.Length) { '{0}: {1}' -f $i, $lines[$i-1] } }; '' }
+rg -n "^## |^### |Fix A|Fix B|Fix C|B\.1|B\.2|B\.3|B\.4|B\.5|B\.6|orphan|staleTime|orderGroups|filteredGroups|tabCounts|handleBannerNavigate|data-group-id" "C:\Users\ASUS\Dev\Menu AI Cowork\pipeline\task-260416-214227-020.prompt"
+$path = 'C:\Users\ASUS\Dev\Menu AI Cowork\pipeline\task-260416-214227-020.prompt'; $lines = Get-Content -LiteralPath $path; foreach ($range in @(@{s=402;e=460}, @{s=492;e=746}, @{s=749;e=930}, @{s=994;e=1095})) { for ($i = $range.s; $i -le $range.e; $i++) { if ($i -le $lines.Length) { '{0}: {1}' -f $i, $lines[$i-1] } }; '' }
+$path = 'pages/StaffOrdersMobile/staffordersmobile.jsx'; $lines = Get-Content -LiteralPath $path; for ($i = 4054; $i -le 4102; $i++) { if ($i -le $lines.Length) { '{0}: {1}' -f $i, $lines[$i-1] } }
+rg -n "function getLinkId|const getLinkId|export function getLinkId|=> getLinkId|getLinkId =" "pages/StaffOrdersMobile/staffordersmobile.jsx" "components/sessionHelpers.js"
+$path = 'pages/StaffOrdersMobile/staffordersmobile.jsx'; $lines = Get-Content -LiteralPath $path; for ($i = 536; $i -le 556; $i++) { if ($i -le $lines.Length) { '{0}: {1}' -f $i, $lines[$i-1] } }
+$path = 'components/sessionHelpers.js'; $lines = Get-Content -LiteralPath $path; for ($i = 60; $i -le 190; $i++) { if ($i -le $lines.Length) { '{0}: {1}' -f $i, $lines[$i-1] } }
+rg -n "effectivePollingInterval|refetchInterval:" "pages/StaffOrdersMobile/staffordersmobile.jsx"
+$path = 'pages/StaffOrdersMobile/staffordersmobile.jsx'; $lines = Get-Content -LiteralPath $path; for ($i = 3478; $i -le 3510; $i++) { if ($i -le $lines.Length) { '{0}: {1}' -f $i, $lines[$i-1] } }
+rg -n "pollingInterval|setPollingInterval" "pages/StaffOrdersMobile/staffordersmobile.jsx"
+$path = 'pages/StaffOrdersMobile/staffordersmobile.jsx'; $lines = Get-Content -LiteralPath $path; foreach ($range in @(@{s=2608;e=2642}, @{s=2908;e=2920}, @{s=4238;e=4248})) { for ($i = $range.s; $i -le $range.e; $i++) { if ($i -le $lines.Length) { '{0}: {1}' -f $i, $lines[$i-1] } }; '' }
+rg -n "function loadPollingInterval|const loadPollingInterval|loadPollingInterval\(" "pages/StaffOrdersMobile/staffordersmobile.jsx"
+$path = 'pages/StaffOrdersMobile/staffordersmobile.jsx'; $lines = Get-Content -LiteralPath $path; for ($i = 962; $i -le 980; $i++) { if ($i -le $lines.Length) { '{0}: {1}' -f $i, $lines[$i-1] } }
+rg -n "DEFAULT_POLLING_INTERVAL|POLLING_OPTIONS" "pages/StaffOrdersMobile/staffordersmobile.jsx"
+$path = 'pages/StaffOrdersMobile/staffordersmobile.jsx'; $lines = Get-Content -LiteralPath $path; for ($i = 498; $i -le 510; $i++) { if ($i -le $lines.Length) { '{0}: {1}' -f $i, $lines[$i-1] } }
diff --git a/pages/StaffOrdersMobile/review_2026-04-16.md b/pages/StaffOrdersMobile/review_2026-04-16.md
new file mode 100644
index 0000000000000000000000000000000000000000..2f05fa68a7e85dd3cc91750dab357b20ee82f983
--- /dev/null
+++ b/pages/StaffOrdersMobile/review_2026-04-16.md
@@ -0,0 +1,32 @@
+# Codex Reviewer Findings — ПССК Prompt Quality Review
+Chain: staffordersmobile-260416-213112-930f
+
+## Issues Found
+1. [MEDIUM] Fix A overstates `staleTime` as the main freshness gate — Prompt lines 148-160 and 402-460 treat `staleTime: 30_000` as the reason SOM can miss a new `TableSession` for 30 seconds. In the live source, the same query already polls on `refetchInterval: effectivePollingInterval` at `pages/StaffOrdersMobile/staffordersmobile.jsx:3549`, and `effectivePollingInterval` defaults to `5000` with user options `5s/15s/30s/60s/manual` at `pages/StaffOrdersMobile/staffordersmobile.jsx:500-508` and `:962-968`. Under default settings, lowering `staleTime` is mostly redundant, and in manual or slower polling modes it still does not guarantee a fast refresh. PROMPT FIX: rewrite Root Cause and Fix A around the actual polling/invalidation race, and downgrade Fix A from mandatory root-cause fix to optional/supporting change unless the prompt also changes the polling behavior.
+2. [MEDIUM] Fix C is incorrectly described as depending on Fix B — Prompt lines 338-344 and 950-954 say Fix B must be applied before Fix C because Fix C reads `group.sessionId`. The Fix C patch body at prompt lines 1033-1085 does not read `orderGroups` or `group.sessionId` at all; it only uses `orders`, `openSessionByTableId`, `getLinkId`, and `queryClient`. This wrong dependency can make an executor stop or roll back Fix C unnecessarily if B.1 conflicts, even though C is logically independent. PROMPT FIX: remove the stated dependency and say only B.6 depends on composite keys, while Fix C is an independent optional invalidation optimization.
+3. [MEDIUM] Fix C scans raw partner orders without a convincing boundary, which can produce avoidable invalidations — Prompt lines 1100-1104 justify using raw `orders` instead of `activeOrders` by saying activeOrders could miss a freshly created order because of `shiftCutoff`. A genuinely fresh order after shift start should not be filtered out by that cutoff. The proposed effect at prompt lines 1049-1085 instead iterates every partner order from `data: orders` (`pages/StaffOrdersMobile/staffordersmobile.jsx:3496-3505`), so historical non-closed anomalies outside the current waiter context can still trigger `invalidateQueries({ queryKey: ["openSessions"] })`. PROMPT FIX: either constrain orphan detection to the same shift/current-visibility boundary as the UI, or replace the current rationale with a verified status-based reason and explicitly document the historical-order tradeoff.
+4. [LOW] The prompt does not warn about the dual expansion state already present in the source — B.4/B.6 tell the executor to move card identity to `group.compositeKey` through the `expandedGroupId` path, but the file still contains older `expandedGroups` state and an auto-expand effect at `pages/StaffOrdersMobile/staffordersmobile.jsx:3061` and `:3835-3849`, while rendering actually uses `expandedGroupId` at `:4458-4463`. That stale state is out of scope, but not calling it out invites hesitation or accidental cleanup during B.4. PROMPT FIX: add one sentence in Context or B.4 that `expandedGroups` is pre-existing dead state and must be left untouched in this batch.
+
+## Summary
+Total: 4 issues (0 CRITICAL, 3 MEDIUM, 1 LOW)
+
+## Additional Risks
+- The prompt's strict `git diff ... only in 8 locations` and exact sequencing guidance are brittle against branch drift or minor formatter movement. That is acceptable in a controlled pipeline, but it should be presented as a safety heuristic rather than as proof that the fix is correct.
+- Because Fix A is presented as mandatory, an executor may spend time validating an almost-no-op freshness tweak instead of focusing on Fix B, which is the real UX separator.
+
+## Prompt Clarity (MANDATORY — do NOT skip)
+- Overall clarity: 3/5
+- What was most clear: Fix B's identifier contract is strong. The table describing `group.id` vs `group.compositeKey` vs `group.sessionId`, plus the banner call-chain, makes the intended shape of the session-aware grouping understandable.
+- What was ambiguous or could cause hesitation: The prompt mixes two different freshness models for `openSessions` and overstates the role of `staleTime`. It also claims Fix C depends on Fix B even though the provided Fix C patch does not.
+- Missing context: The prompt should explicitly acknowledge the existing dual expansion state (`expandedGroups` plus `expandedGroupId`) and should explain whether Fix C should respect current-shift boundaries or intentionally scan historical orders.
+
+## Fix Ratings (MANDATORY — ALWAYS include this section, even if no issues found)
+Rate each Fix mentioned in the prompt. Scale: 1=Rewrite needed, 2=Major issues, 3=Needs clarification, 4=Minor issues, 5=Clear.
+
+| Fix | Rating (1-5) | Verdict | Key issue (if any) |
+|-----|-------------|---------|-------------------|
+| Fix A | 2/5 | Rewrite needed | Misattributes the freshness delay to `staleTime` even though `openSessions` already interval-polls and defaults to 5s polling. |
+| Fix B | 4/5 | Clear | Core session-aware grouping design is coherent, but the prompt should warn about the stale `expandedGroups` path already present in the file. |
+| Fix C | 3/5 | Needs clarification | Patch body is understandable, but the prompt states a false dependency on Fix B and does not bound the raw-order scan convincingly. |
+
+Overall prompt verdict: NEEDS REVISION

exec
"C:\\WINDOWS\\System32\\WindowsPowerShell\\v1.0\\powershell.exe" -Command "Get-Content -LiteralPath 'C:\\Users\\ASUS\\Dev\\Menu AI Cowork\\pipeline\\progress-task-260416-214227-020.txt'" in C:\Users\ASUS\Dev\Menu AI Cowork\menuapp-code-review
 succeeded in 2750ms:
[..] task-260416-214227-020

Page: StaffOrdersMobile
AI: CC + Codex v6.0 (CC-managed)
Budget: $10.00
Started: 21:42

[CC] Starting...

diff --git a/pages/StaffOrdersMobile/commands_2026-04-16.log b/pages/StaffOrdersMobile/commands_2026-04-16.log
new file mode 100644
index 0000000000000000000000000000000000000000..926b9a38dc3aec185ad7f7a3a76ad20c4d4ced8b
--- /dev/null
+++ b/pages/StaffOrdersMobile/commands_2026-04-16.log
@@ -0,0 +1,30 @@
+Get-Content -LiteralPath 'C:\Users\ASUS\Dev\Menu AI Cowork\pipeline\task-260416-214227-020.prompt' -Raw
+rg -n "openSessions|orderGroups|filteredGroups|tabCounts|handleBannerNavigate|buildBannerInfo|onNavigate\(banner\.groupId\)|data-group-id|useQueryClient|useRef|orphanInvalidateSigRef|tableGroups\[|from 'react'" "pages/StaffOrdersMobile/staffordersmobile.jsx"
+@'
+$path = 'pages/StaffOrdersMobile/staffordersmobile.jsx'
+$lines = Get-Content -LiteralPath $path
+function Show-Range($start, $end) {
+  for ($i = $start; $i -le $end; $i++) {
+    if ($i -le $lines.Length) { '{0}: {1}' -f $i, $lines[$i-1] }
+  }
+}
+Show-Range 3538 3910
+'@ | powershell -NoProfile -Command -
+$path = 'pages/StaffOrdersMobile/staffordersmobile.jsx'; $lines = Get-Content -LiteralPath $path; for ($i = 3538; $i -le 3910; $i++) { if ($i -le $lines.Length) { '{0}: {1}' -f $i, $lines[$i-1] } }
+$path = 'pages/StaffOrdersMobile/staffordersmobile.jsx'; $lines = Get-Content -LiteralPath $path; foreach ($range in @(@{s=2288;e=2296}, @{s=4139;e=4168}, @{s=4568;e=4615}, @{s=3835;e=3859})) { for ($i = $range.s; $i -le $range.e; $i++) { if ($i -le $lines.Length) { '{0}: {1}' -f $i, $lines[$i-1] } }; '' }
+rg -n "expandedGroupId|expandedGroups|setExpandedGroupId|setExpandedGroups|OrderGroupCard|toggleGroupExpand" "pages/StaffOrdersMobile/staffordersmobile.jsx"
+$path = 'pages/StaffOrdersMobile/staffordersmobile.jsx'; $lines = Get-Content -LiteralPath $path; foreach ($range in @(@{s=4128;e=4148}, @{s=4448;e=4466}, @{s=3058;e=3070})) { for ($i = $range.s; $i -le $range.e; $i++) { if ($i -le $lines.Length) { '{0}: {1}' -f $i, $lines[$i-1] } }; '' }
+rg -n "^## |^### |Fix A|Fix B|Fix C|B\.1|B\.2|B\.3|B\.4|B\.5|B\.6|orphan|staleTime|orderGroups|filteredGroups|tabCounts|handleBannerNavigate|data-group-id" "C:\Users\ASUS\Dev\Menu AI Cowork\pipeline\task-260416-214227-020.prompt"
+$path = 'C:\Users\ASUS\Dev\Menu AI Cowork\pipeline\task-260416-214227-020.prompt'; $lines = Get-Content -LiteralPath $path; foreach ($range in @(@{s=402;e=460}, @{s=492;e=746}, @{s=749;e=930}, @{s=994;e=1095})) { for ($i = $range.s; $i -le $range.e; $i++) { if ($i -le $lines.Length) { '{0}: {1}' -f $i, $lines[$i-1] } }; '' }
+$path = 'pages/StaffOrdersMobile/staffordersmobile.jsx'; $lines = Get-Content -LiteralPath $path; for ($i = 4054; $i -le 4102; $i++) { if ($i -le $lines.Length) { '{0}: {1}' -f $i, $lines[$i-1] } }
+rg -n "function getLinkId|const getLinkId|export function getLinkId|=> getLinkId|getLinkId =" "pages/StaffOrdersMobile/staffordersmobile.jsx" "components/sessionHelpers.js"
+$path = 'pages/StaffOrdersMobile/staffordersmobile.jsx'; $lines = Get-Content -LiteralPath $path; for ($i = 536; $i -le 556; $i++) { if ($i -le $lines.Length) { '{0}: {1}' -f $i, $lines[$i-1] } }
+$path = 'components/sessionHelpers.js'; $lines = Get-Content -LiteralPath $path; for ($i = 60; $i -le 190; $i++) { if ($i -le $lines.Length) { '{0}: {1}' -f $i, $lines[$i-1] } }
+rg -n "effectivePollingInterval|refetchInterval:" "pages/StaffOrdersMobile/staffordersmobile.jsx"
+$path = 'pages/StaffOrdersMobile/staffordersmobile.jsx'; $lines = Get-Content -LiteralPath $path; for ($i = 3478; $i -le 3510; $i++) { if ($i -le $lines.Length) { '{0}: {1}' -f $i, $lines[$i-1] } }
+rg -n "pollingInterval|setPollingInterval" "pages/StaffOrdersMobile/staffordersmobile.jsx"
+$path = 'pages/StaffOrdersMobile/staffordersmobile.jsx'; $lines = Get-Content -LiteralPath $path; foreach ($range in @(@{s=2608;e=2642}, @{s=2908;e=2920}, @{s=4238;e=4248})) { for ($i = $range.s; $i -le $range.e; $i++) { if ($i -le $lines.Length) { '{0}: {1}' -f $i, $lines[$i-1] } }; '' }
+rg -n "function loadPollingInterval|const loadPollingInterval|loadPollingInterval\(" "pages/StaffOrdersMobile/staffordersmobile.jsx"
+$path = 'pages/StaffOrdersMobile/staffordersmobile.jsx'; $lines = Get-Content -LiteralPath $path; for ($i = 962; $i -le 980; $i++) { if ($i -le $lines.Length) { '{0}: {1}' -f $i, $lines[$i-1] } }
+rg -n "DEFAULT_POLLING_INTERVAL|POLLING_OPTIONS" "pages/StaffOrdersMobile/staffordersmobile.jsx"
+$path = 'pages/StaffOrdersMobile/staffordersmobile.jsx'; $lines = Get-Content -LiteralPath $path; for ($i = 498; $i -le 510; $i++) { if ($i -le $lines.Length) { '{0}: {1}' -f $i, $lines[$i-1] } }
diff --git a/pages/StaffOrdersMobile/review_2026-04-16.md b/pages/StaffOrdersMobile/review_2026-04-16.md
new file mode 100644
index 0000000000000000000000000000000000000000..2f05fa68a7e85dd3cc91750dab357b20ee82f983
--- /dev/null
+++ b/pages/StaffOrdersMobile/review_2026-04-16.md
@@ -0,0 +1,32 @@
+# Codex Reviewer Findings — ПССК Prompt Quality Review
+Chain: staffordersmobile-260416-213112-930f
+
+## Issues Found
+1. [MEDIUM] Fix A overstates `staleTime` as the main freshness gate — Prompt lines 148-160 and 402-460 treat `staleTime: 30_000` as the reason SOM can miss a new `TableSession` for 30 seconds. In the live source, the same query already polls on `refetchInterval: effectivePollingInterval` at `pages/StaffOrdersMobile/staffordersmobile.jsx:3549`, and `effectivePollingInterval` defaults to `5000` with user options `5s/15s/30s/60s/manual` at `pages/StaffOrdersMobile/staffordersmobile.jsx:500-508` and `:962-968`. Under default settings, lowering `staleTime` is mostly redundant, and in manual or slower polling modes it still does not guarantee a fast refresh. PROMPT FIX: rewrite Root Cause and Fix A around the actual polling/invalidation race, and downgrade Fix A from mandatory root-cause fix to optional/supporting change unless the prompt also changes the polling behavior.
+2. [MEDIUM] Fix C is incorrectly described as depending on Fix B — Prompt lines 338-344 and 950-954 say Fix B must be applied before Fix C because Fix C reads `group.sessionId`. The Fix C patch body at prompt lines 1033-1085 does not read `orderGroups` or `group.sessionId` at all; it only uses `orders`, `openSessionByTableId`, `getLinkId`, and `queryClient`. This wrong dependency can make an executor stop or roll back Fix C unnecessarily if B.1 conflicts, even though C is logically independent. PROMPT FIX: remove the stated dependency and say only B.6 depends on composite keys, while Fix C is an independent optional invalidation optimization.
+3. [MEDIUM] Fix C scans raw partner orders without a convincing boundary, which can produce avoidable invalidations — Prompt lines 1100-1104 justify using raw `orders` instead of `activeOrders` by saying activeOrders could miss a freshly created order because of `shiftCutoff`. A genuinely fresh order after shift start should not be filtered out by that cutoff. The proposed effect at prompt lines 1049-1085 instead iterates every partner order from `data: orders` (`pages/StaffOrdersMobile/staffordersmobile.jsx:3496-3505`), so historical non-closed anomalies outside the current waiter context can still trigger `invalidateQueries({ queryKey: ["openSessions"] })`. PROMPT FIX: either constrain orphan detection to the same shift/current-visibility boundary as the UI, or replace the current rationale with a verified status-based reason and explicitly document the historical-order tradeoff.
+4. [LOW] The prompt does not warn about the dual expansion state already present in the source — B.4/B.6 tell the executor to move card identity to `group.compositeKey` through the `expandedGroupId` path, but the file still contains older `expandedGroups` state and an auto-expand effect at `pages/StaffOrdersMobile/staffordersmobile.jsx:3061` and `:3835-3849`, while rendering actually uses `expandedGroupId` at `:4458-4463`. That stale state is out of scope, but not calling it out invites hesitation or accidental cleanup during B.4. PROMPT FIX: add one sentence in Context or B.4 that `expandedGroups` is pre-existing dead state and must be left untouched in this batch.
+
+## Summary
+Total: 4 issues (0 CRITICAL, 3 MEDIUM, 1 LOW)
+
+## Additional Risks
+- The prompt's strict `git diff ... only in 8 locations` and exact sequencing guidance are brittle against branch drift or minor formatter movement. That is acceptable in a controlled pipeline, but it should be presented as a safety heuristic rather than as proof that the fix is correct.
+- Because Fix A is presented as mandatory, an executor may spend time validating an almost-no-op freshness tweak instead of focusing on Fix B, which is the real UX separator.
+
+## Prompt Clarity (MANDATORY — do NOT skip)
+- Overall clarity: 3/5
+- What was most clear: Fix B's identifier contract is strong. The table describing `group.id` vs `group.compositeKey` vs `group.sessionId`, plus the banner call-chain, makes the intended shape of the session-aware grouping understandable.
+- What was ambiguous or could cause hesitation: The prompt mixes two different freshness models for `openSessions` and overstates the role of `staleTime`. It also claims Fix C depends on Fix B even though the provided Fix C patch does not.
+- Missing context: The prompt should explicitly acknowledge the existing dual expansion state (`expandedGroups` plus `expandedGroupId`) and should explain whether Fix C should respect current-shift boundaries or intentionally scan historical orders.
+
+## Fix Ratings (MANDATORY — ALWAYS include this section, even if no issues found)
+Rate each Fix mentioned in the prompt. Scale: 1=Rewrite needed, 2=Major issues, 3=Needs clarification, 4=Minor issues, 5=Clear.
+
+| Fix | Rating (1-5) | Verdict | Key issue (if any) |
+|-----|-------------|---------|-------------------|
+| Fix A | 2/5 | Rewrite needed | Misattributes the freshness delay to `staleTime` even though `openSessions` already interval-polls and defaults to 5s polling. |
+| Fix B | 4/5 | Clear | Core session-aware grouping design is coherent, but the prompt should warn about the stale `expandedGroups` path already present in the file. |
+| Fix C | 3/5 | Needs clarification | Patch body is understandable, but the prompt states a false dependency on Fix B and does not bound the raw-order scan convincingly. |
+
+Overall prompt verdict: NEEDS REVISION

codex
I’ve confirmed the pipeline destination paths. I’m attempting the required marker, findings copy, progress append, and CC summary with `apply_patch`; if the sandbox rejects sibling-directory writes, I’ll stop there and report that explicitly.
2026-04-16T16:53:49.421844Z ERROR codex_core::tools::router: error=patch rejected: writing outside of the project; rejected by user approval settings
diff --git a/pages/StaffOrdersMobile/commands_2026-04-16.log b/pages/StaffOrdersMobile/commands_2026-04-16.log
new file mode 100644
index 0000000000000000000000000000000000000000..926b9a38dc3aec185ad7f7a3a76ad20c4d4ced8b
--- /dev/null
+++ b/pages/StaffOrdersMobile/commands_2026-04-16.log
@@ -0,0 +1,30 @@
+Get-Content -LiteralPath 'C:\Users\ASUS\Dev\Menu AI Cowork\pipeline\task-260416-214227-020.prompt' -Raw
+rg -n "openSessions|orderGroups|filteredGroups|tabCounts|handleBannerNavigate|buildBannerInfo|onNavigate\(banner\.groupId\)|data-group-id|useQueryClient|useRef|orphanInvalidateSigRef|tableGroups\[|from 'react'" "pages/StaffOrdersMobile/staffordersmobile.jsx"
+@'
+$path = 'pages/StaffOrdersMobile/staffordersmobile.jsx'
+$lines = Get-Content -LiteralPath $path
+function Show-Range($start, $end) {
+  for ($i = $start; $i -le $end; $i++) {
+    if ($i -le $lines.Length) { '{0}: {1}' -f $i, $lines[$i-1] }
+  }
+}
+Show-Range 3538 3910
+'@ | powershell -NoProfile -Command -
+$path = 'pages/StaffOrdersMobile/staffordersmobile.jsx'; $lines = Get-Content -LiteralPath $path; for ($i = 3538; $i -le 3910; $i++) { if ($i -le $lines.Length) { '{0}: {1}' -f $i, $lines[$i-1] } }
+$path = 'pages/StaffOrdersMobile/staffordersmobile.jsx'; $lines = Get-Content -LiteralPath $path; foreach ($range in @(@{s=2288;e=2296}, @{s=4139;e=4168}, @{s=4568;e=4615}, @{s=3835;e=3859})) { for ($i = $range.s; $i -le $range.e; $i++) { if ($i -le $lines.Length) { '{0}: {1}' -f $i, $lines[$i-1] } }; '' }
+rg -n "expandedGroupId|expandedGroups|setExpandedGroupId|setExpandedGroups|OrderGroupCard|toggleGroupExpand" "pages/StaffOrdersMobile/staffordersmobile.jsx"
+$path = 'pages/StaffOrdersMobile/staffordersmobile.jsx'; $lines = Get-Content -LiteralPath $path; foreach ($range in @(@{s=4128;e=4148}, @{s=4448;e=4466}, @{s=3058;e=3070})) { for ($i = $range.s; $i -le $range.e; $i++) { if ($i -le $lines.Length) { '{0}: {1}' -f $i, $lines[$i-1] } }; '' }
+rg -n "^## |^### |Fix A|Fix B|Fix C|B\.1|B\.2|B\.3|B\.4|B\.5|B\.6|orphan|staleTime|orderGroups|filteredGroups|tabCounts|handleBannerNavigate|data-group-id" "C:\Users\ASUS\Dev\Menu AI Cowork\pipeline\task-260416-214227-020.prompt"
+$path = 'C:\Users\ASUS\Dev\Menu AI Cowork\pipeline\task-260416-214227-020.prompt'; $lines = Get-Content -LiteralPath $path; foreach ($range in @(@{s=402;e=460}, @{s=492;e=746}, @{s=749;e=930}, @{s=994;e=1095})) { for ($i = $range.s; $i -le $range.e; $i++) { if ($i -le $lines.Length) { '{0}: {1}' -f $i, $lines[$i-1] } }; '' }
+$path = 'pages/StaffOrdersMobile/staffordersmobile.jsx'; $lines = Get-Content -LiteralPath $path; for ($i = 4054; $i -le 4102; $i++) { if ($i -le $lines.Length) { '{0}: {1}' -f $i, $lines[$i-1] } }
+rg -n "function getLinkId|const getLinkId|export function getLinkId|=> getLinkId|getLinkId =" "pages/StaffOrdersMobile/staffordersmobile.jsx" "components/sessionHelpers.js"
+$path = 'pages/StaffOrdersMobile/staffordersmobile.jsx'; $lines = Get-Content -LiteralPath $path; for ($i = 536; $i -le 556; $i++) { if ($i -le $lines.Length) { '{0}: {1}' -f $i, $lines[$i-1] } }
+$path = 'components/sessionHelpers.js'; $lines = Get-Content -LiteralPath $path; for ($i = 60; $i -le 190; $i++) { if ($i -le $lines.Length) { '{0}: {1}' -f $i, $lines[$i-1] } }
+rg -n "effectivePollingInterval|refetchInterval:" "pages/StaffOrdersMobile/staffordersmobile.jsx"
+$path = 'pages/StaffOrdersMobile/staffordersmobile.jsx'; $lines = Get-Content -LiteralPath $path; for ($i = 3478; $i -le 3510; $i++) { if ($i -le $lines.Length) { '{0}: {1}' -f $i, $lines[$i-1] } }
+rg -n "pollingInterval|setPollingInterval" "pages/StaffOrdersMobile/staffordersmobile.jsx"
+$path = 'pages/StaffOrdersMobile/staffordersmobile.jsx'; $lines = Get-Content -LiteralPath $path; foreach ($range in @(@{s=2608;e=2642}, @{s=2908;e=2920}, @{s=4238;e=4248})) { for ($i = $range.s; $i -le $range.e; $i++) { if ($i -le $lines.Length) { '{0}: {1}' -f $i, $lines[$i-1] } }; '' }
+rg -n "function loadPollingInterval|const loadPollingInterval|loadPollingInterval\(" "pages/StaffOrdersMobile/staffordersmobile.jsx"
+$path = 'pages/StaffOrdersMobile/staffordersmobile.jsx'; $lines = Get-Content -LiteralPath $path; for ($i = 962; $i -le 980; $i++) { if ($i -le $lines.Length) { '{0}: {1}' -f $i, $lines[$i-1] } }
+rg -n "DEFAULT_POLLING_INTERVAL|POLLING_OPTIONS" "pages/StaffOrdersMobile/staffordersmobile.jsx"
+$path = 'pages/StaffOrdersMobile/staffordersmobile.jsx'; $lines = Get-Content -LiteralPath $path; for ($i = 498; $i -le 510; $i++) { if ($i -le $lines.Length) { '{0}: {1}' -f $i, $lines[$i-1] } }
diff --git a/pages/StaffOrdersMobile/review_2026-04-16.md b/pages/StaffOrdersMobile/review_2026-04-16.md
new file mode 100644
index 0000000000000000000000000000000000000000..2f05fa68a7e85dd3cc91750dab357b20ee82f983
--- /dev/null
+++ b/pages/StaffOrdersMobile/review_2026-04-16.md
@@ -0,0 +1,32 @@
+# Codex Reviewer Findings — ПССК Prompt Quality Review
+Chain: staffordersmobile-260416-213112-930f
+
+## Issues Found
+1. [MEDIUM] Fix A overstates `staleTime` as the main freshness gate — Prompt lines 148-160 and 402-460 treat `staleTime: 30_000` as the reason SOM can miss a new `TableSession` for 30 seconds. In the live source, the same query already polls on `refetchInterval: effectivePollingInterval` at `pages/StaffOrdersMobile/staffordersmobile.jsx:3549`, and `effectivePollingInterval` defaults to `5000` with user options `5s/15s/30s/60s/manual` at `pages/StaffOrdersMobile/staffordersmobile.jsx:500-508` and `:962-968`. Under default settings, lowering `staleTime` is mostly redundant, and in manual or slower polling modes it still does not guarantee a fast refresh. PROMPT FIX: rewrite Root Cause and Fix A around the actual polling/invalidation race, and downgrade Fix A from mandatory root-cause fix to optional/supporting change unless the prompt also changes the polling behavior.
+2. [MEDIUM] Fix C is incorrectly described as depending on Fix B — Prompt lines 338-344 and 950-954 say Fix B must be applied before Fix C because Fix C reads `group.sessionId`. The Fix C patch body at prompt lines 1033-1085 does not read `orderGroups` or `group.sessionId` at all; it only uses `orders`, `openSessionByTableId`, `getLinkId`, and `queryClient`. This wrong dependency can make an executor stop or roll back Fix C unnecessarily if B.1 conflicts, even though C is logically independent. PROMPT FIX: remove the stated dependency and say only B.6 depends on composite keys, while Fix C is an independent optional invalidation optimization.
+3. [MEDIUM] Fix C scans raw partner orders without a convincing boundary, which can produce avoidable invalidations — Prompt lines 1100-1104 justify using raw `orders` instead of `activeOrders` by saying activeOrders could miss a freshly created order because of `shiftCutoff`. A genuinely fresh order after shift start should not be filtered out by that cutoff. The proposed effect at prompt lines 1049-1085 instead iterates every partner order from `data: orders` (`pages/StaffOrdersMobile/staffordersmobile.jsx:3496-3505`), so historical non-closed anomalies outside the current waiter context can still trigger `invalidateQueries({ queryKey: ["openSessions"] })`. PROMPT FIX: either constrain orphan detection to the same shift/current-visibility boundary as the UI, or replace the current rationale with a verified status-based reason and explicitly document the historical-order tradeoff.
+4. [LOW] The prompt does not warn about the dual expansion state already present in the source — B.4/B.6 tell the executor to move card identity to `group.compositeKey` through the `expandedGroupId` path, but the file still contains older `expandedGroups` state and an auto-expand effect at `pages/StaffOrdersMobile/staffordersmobile.jsx:3061` and `:3835-3849`, while rendering actually uses `expandedGroupId` at `:4458-4463`. That stale state is out of scope, but not calling it out invites hesitation or accidental cleanup during B.4. PROMPT FIX: add one sentence in Context or B.4 that `expandedGroups` is pre-existing dead state and must be left untouched in this batch.
+
+## Summary
+Total: 4 issues (0 CRITICAL, 3 MEDIUM, 1 LOW)
+
+## Additional Risks
+- The prompt's strict `git diff ... only in 8 locations` and exact sequencing guidance are brittle against branch drift or minor formatter movement. That is acceptable in a controlled pipeline, but it should be presented as a safety heuristic rather than as proof that the fix is correct.
+- Because Fix A is presented as mandatory, an executor may spend time validating an almost-no-op freshness tweak instead of focusing on Fix B, which is the real UX separator.
+
+## Prompt Clarity (MANDATORY — do NOT skip)
+- Overall clarity: 3/5
+- What was most clear: Fix B's identifier contract is strong. The table describing `group.id` vs `group.compositeKey` vs `group.sessionId`, plus the banner call-chain, makes the intended shape of the session-aware grouping understandable.
+- What was ambiguous or could cause hesitation: The prompt mixes two different freshness models for `openSessions` and overstates the role of `staleTime`. It also claims Fix C depends on Fix B even though the provided Fix C patch does not.
+- Missing context: The prompt should explicitly acknowledge the existing dual expansion state (`expandedGroups` plus `expandedGroupId`) and should explain whether Fix C should respect current-shift boundaries or intentionally scan historical orders.
+
+## Fix Ratings (MANDATORY — ALWAYS include this section, even if no issues found)
+Rate each Fix mentioned in the prompt. Scale: 1=Rewrite needed, 2=Major issues, 3=Needs clarification, 4=Minor issues, 5=Clear.
+
+| Fix | Rating (1-5) | Verdict | Key issue (if any) |
+|-----|-------------|---------|-------------------|
+| Fix A | 2/5 | Rewrite needed | Misattributes the freshness delay to `staleTime` even though `openSessions` already interval-polls and defaults to 5s polling. |
+| Fix B | 4/5 | Clear | Core session-aware grouping design is coherent, but the prompt should warn about the stale `expandedGroups` path already present in the file. |
+| Fix C | 3/5 | Needs clarification | Patch body is understandable, but the prompt states a false dependency on Fix B and does not bound the raw-order scan convincingly. |
+
+Overall prompt verdict: NEEDS REVISION

codex
The prompt review is complete. Verdict: `NEEDS REVISION`.

The main problems are that Fix A misattributes the freshness delay to `staleTime` even though `openSessions` already interval-polls and defaults to 5s, Fix C is incorrectly described as depending on Fix B even though its own patch body does not read `group.sessionId`, and Fix C scans raw partner orders without a clear current-shift boundary.

I saved the repo-side outputs here:
- [review_2026-04-16.md](/C:/Users/ASUS/Dev/Menu%20AI%20Cowork/menuapp-code-review/pages/StaffOrdersMobile/review_2026-04-16.md)
- [commands_2026-04-16.log](/C:/Users/ASUS/Dev/Menu%20AI%20Cowork/menuapp-code-review/pages/StaffOrdersMobile/commands_2026-04-16.log)

The only incomplete part is the pipeline-side writes. I attempted to create/update:
- `C:\Users\ASUS\Dev\Menu AI Cowork\pipeline\started-task-260416-214227-020.md`
- `C:\Users\ASUS\Dev\Menu AI Cowork\pipeline\chain-state\staffordersmobile-260416-213112-930f-codex-findings.md`
- `C:\Users\ASUS\Dev\Menu AI Cowork\pipeline\progress-task-260416-214227-020.txt`
- `C:\Users\ASUS\Dev\Menu AI Cowork\pipeline\cc-analysis-task-260416-214227-020.txt`

Those writes were blocked by the sandbox because `pipeline\...` is outside the writable project root.
diff --git a/pages/StaffOrdersMobile/commands_2026-04-16.log b/pages/StaffOrdersMobile/commands_2026-04-16.log
new file mode 100644
index 0000000000000000000000000000000000000000..926b9a38dc3aec185ad7f7a3a76ad20c4d4ced8b
--- /dev/null
+++ b/pages/StaffOrdersMobile/commands_2026-04-16.log
@@ -0,0 +1,30 @@
+Get-Content -LiteralPath 'C:\Users\ASUS\Dev\Menu AI Cowork\pipeline\task-260416-214227-020.prompt' -Raw
+rg -n "openSessions|orderGroups|filteredGroups|tabCounts|handleBannerNavigate|buildBannerInfo|onNavigate\(banner\.groupId\)|data-group-id|useQueryClient|useRef|orphanInvalidateSigRef|tableGroups\[|from 'react'" "pages/StaffOrdersMobile/staffordersmobile.jsx"
+@'
+$path = 'pages/StaffOrdersMobile/staffordersmobile.jsx'
+$lines = Get-Content -LiteralPath $path
+function Show-Range($start, $end) {
+  for ($i = $start; $i -le $end; $i++) {
+    if ($i -le $lines.Length) { '{0}: {1}' -f $i, $lines[$i-1] }
+  }
+}
+Show-Range 3538 3910
+'@ | powershell -NoProfile -Command -
+$path = 'pages/StaffOrdersMobile/staffordersmobile.jsx'; $lines = Get-Content -LiteralPath $path; for ($i = 3538; $i -le 3910; $i++) { if ($i -le $lines.Length) { '{0}: {1}' -f $i, $lines[$i-1] } }
+$path = 'pages/StaffOrdersMobile/staffordersmobile.jsx'; $lines = Get-Content -LiteralPath $path; foreach ($range in @(@{s=2288;e=2296}, @{s=4139;e=4168}, @{s=4568;e=4615}, @{s=3835;e=3859})) { for ($i = $range.s; $i -le $range.e; $i++) { if ($i -le $lines.Length) { '{0}: {1}' -f $i, $lines[$i-1] } }; '' }
+rg -n "expandedGroupId|expandedGroups|setExpandedGroupId|setExpandedGroups|OrderGroupCard|toggleGroupExpand" "pages/StaffOrdersMobile/staffordersmobile.jsx"
+$path = 'pages/StaffOrdersMobile/staffordersmobile.jsx'; $lines = Get-Content -LiteralPath $path; foreach ($range in @(@{s=4128;e=4148}, @{s=4448;e=4466}, @{s=3058;e=3070})) { for ($i = $range.s; $i -le $range.e; $i++) { if ($i -le $lines.Length) { '{0}: {1}' -f $i, $lines[$i-1] } }; '' }
+rg -n "^## |^### |Fix A|Fix B|Fix C|B\.1|B\.2|B\.3|B\.4|B\.5|B\.6|orphan|staleTime|orderGroups|filteredGroups|tabCounts|handleBannerNavigate|data-group-id" "C:\Users\ASUS\Dev\Menu AI Cowork\pipeline\task-260416-214227-020.prompt"
+$path = 'C:\Users\ASUS\Dev\Menu AI Cowork\pipeline\task-260416-214227-020.prompt'; $lines = Get-Content -LiteralPath $path; foreach ($range in @(@{s=402;e=460}, @{s=492;e=746}, @{s=749;e=930}, @{s=994;e=1095})) { for ($i = $range.s; $i -le $range.e; $i++) { if ($i -le $lines.Length) { '{0}: {1}' -f $i, $lines[$i-1] } }; '' }
+$path = 'pages/StaffOrdersMobile/staffordersmobile.jsx'; $lines = Get-Content -LiteralPath $path; for ($i = 4054; $i -le 4102; $i++) { if ($i -le $lines.Length) { '{0}: {1}' -f $i, $lines[$i-1] } }
+rg -n "function getLinkId|const getLinkId|export function getLinkId|=> getLinkId|getLinkId =" "pages/StaffOrdersMobile/staffordersmobile.jsx" "components/sessionHelpers.js"
+$path = 'pages/StaffOrdersMobile/staffordersmobile.jsx'; $lines = Get-Content -LiteralPath $path; for ($i = 536; $i -le 556; $i++) { if ($i -le $lines.Length) { '{0}: {1}' -f $i, $lines[$i-1] } }
+$path = 'components/sessionHelpers.js'; $lines = Get-Content -LiteralPath $path; for ($i = 60; $i -le 190; $i++) { if ($i -le $lines.Length) { '{0}: {1}' -f $i, $lines[$i-1] } }
+rg -n "effectivePollingInterval|refetchInterval:" "pages/StaffOrdersMobile/staffordersmobile.jsx"
+$path = 'pages/StaffOrdersMobile/staffordersmobile.jsx'; $lines = Get-Content -LiteralPath $path; for ($i = 3478; $i -le 3510; $i++) { if ($i -le $lines.Length) { '{0}: {1}' -f $i, $lines[$i-1] } }
+rg -n "pollingInterval|setPollingInterval" "pages/StaffOrdersMobile/staffordersmobile.jsx"
+$path = 'pages/StaffOrdersMobile/staffordersmobile.jsx'; $lines = Get-Content -LiteralPath $path; foreach ($range in @(@{s=2608;e=2642}, @{s=2908;e=2920}, @{s=4238;e=4248})) { for ($i = $range.s; $i -le $range.e; $i++) { if ($i -le $lines.Length) { '{0}: {1}' -f $i, $lines[$i-1] } }; '' }
+rg -n "function loadPollingInterval|const loadPollingInterval|loadPollingInterval\(" "pages/StaffOrdersMobile/staffordersmobile.jsx"
+$path = 'pages/StaffOrdersMobile/staffordersmobile.jsx'; $lines = Get-Content -LiteralPath $path; for ($i = 962; $i -le 980; $i++) { if ($i -le $lines.Length) { '{0}: {1}' -f $i, $lines[$i-1] } }
+rg -n "DEFAULT_POLLING_INTERVAL|POLLING_OPTIONS" "pages/StaffOrdersMobile/staffordersmobile.jsx"
+$path = 'pages/StaffOrdersMobile/staffordersmobile.jsx'; $lines = Get-Content -LiteralPath $path; for ($i = 498; $i -le 510; $i++) { if ($i -le $lines.Length) { '{0}: {1}' -f $i, $lines[$i-1] } }
diff --git a/pages/StaffOrdersMobile/review_2026-04-16.md b/pages/StaffOrdersMobile/review_2026-04-16.md
new file mode 100644
index 0000000000000000000000000000000000000000..2f05fa68a7e85dd3cc91750dab357b20ee82f983
--- /dev/null
+++ b/pages/StaffOrdersMobile/review_2026-04-16.md
@@ -0,0 +1,32 @@
+# Codex Reviewer Findings — ПССК Prompt Quality Review
+Chain: staffordersmobile-260416-213112-930f
+
+## Issues Found
+1. [MEDIUM] Fix A overstates `staleTime` as the main freshness gate — Prompt lines 148-160 and 402-460 treat `staleTime: 30_000` as the reason SOM can miss a new `TableSession` for 30 seconds. In the live source, the same query already polls on `refetchInterval: effectivePollingInterval` at `pages/StaffOrdersMobile/staffordersmobile.jsx:3549`, and `effectivePollingInterval` defaults to `5000` with user options `5s/15s/30s/60s/manual` at `pages/StaffOrdersMobile/staffordersmobile.jsx:500-508` and `:962-968`. Under default settings, lowering `staleTime` is mostly redundant, and in manual or slower polling modes it still does not guarantee a fast refresh. PROMPT FIX: rewrite Root Cause and Fix A around the actual polling/invalidation race, and downgrade Fix A from mandatory root-cause fix to optional/supporting change unless the prompt also changes the polling behavior.
+2. [MEDIUM] Fix C is incorrectly described as depending on Fix B — Prompt lines 338-344 and 950-954 say Fix B must be applied before Fix C because Fix C reads `group.sessionId`. The Fix C patch body at prompt lines 1033-1085 does not read `orderGroups` or `group.sessionId` at all; it only uses `orders`, `openSessionByTableId`, `getLinkId`, and `queryClient`. This wrong dependency can make an executor stop or roll back Fix C unnecessarily if B.1 conflicts, even though C is logically independent. PROMPT FIX: remove the stated dependency and say only B.6 depends on composite keys, while Fix C is an independent optional invalidation optimization.
+3. [MEDIUM] Fix C scans raw partner orders without a convincing boundary, which can produce avoidable invalidations — Prompt lines 1100-1104 justify using raw `orders` instead of `activeOrders` by saying activeOrders could miss a freshly created order because of `shiftCutoff`. A genuinely fresh order after shift start should not be filtered out by that cutoff. The proposed effect at prompt lines 1049-1085 instead iterates every partner order from `data: orders` (`pages/StaffOrdersMobile/staffordersmobile.jsx:3496-3505`), so historical non-closed anomalies outside the current waiter context can still trigger `invalidateQueries({ queryKey: ["openSessions"] })`. PROMPT FIX: either constrain orphan detection to the same shift/current-visibility boundary as the UI, or replace the current rationale with a verified status-based reason and explicitly document the historical-order tradeoff.
+4. [LOW] The prompt does not warn about the dual expansion state already present in the source — B.4/B.6 tell the executor to move card identity to `group.compositeKey` through the `expandedGroupId` path, but the file still contains older `expandedGroups` state and an auto-expand effect at `pages/StaffOrdersMobile/staffordersmobile.jsx:3061` and `:3835-3849`, while rendering actually uses `expandedGroupId` at `:4458-4463`. That stale state is out of scope, but not calling it out invites hesitation or accidental cleanup during B.4. PROMPT FIX: add one sentence in Context or B.4 that `expandedGroups` is pre-existing dead state and must be left untouched in this batch.
+
+## Summary
+Total: 4 issues (0 CRITICAL, 3 MEDIUM, 1 LOW)
+
+## Additional Risks
+- The prompt's strict `git diff ... only in 8 locations` and exact sequencing guidance are brittle against branch drift or minor formatter movement. That is acceptable in a controlled pipeline, but it should be presented as a safety heuristic rather than as proof that the fix is correct.
+- Because Fix A is presented as mandatory, an executor may spend time validating an almost-no-op freshness tweak instead of focusing on Fix B, which is the real UX separator.
+
+## Prompt Clarity (MANDATORY — do NOT skip)
+- Overall clarity: 3/5
+- What was most clear: Fix B's identifier contract is strong. The table describing `group.id` vs `group.compositeKey` vs `group.sessionId`, plus the banner call-chain, makes the intended shape of the session-aware grouping understandable.
+- What was ambiguous or could cause hesitation: The prompt mixes two different freshness models for `openSessions` and overstates the role of `staleTime`. It also claims Fix C depends on Fix B even though the provided Fix C patch does not.
+- Missing context: The prompt should explicitly acknowledge the existing dual expansion state (`expandedGroups` plus `expandedGroupId`) and should explain whether Fix C should respect current-shift boundaries or intentionally scan historical orders.
+
+## Fix Ratings (MANDATORY — ALWAYS include this section, even if no issues found)
+Rate each Fix mentioned in the prompt. Scale: 1=Rewrite needed, 2=Major issues, 3=Needs clarification, 4=Minor issues, 5=Clear.
+
+| Fix | Rating (1-5) | Verdict | Key issue (if any) |
+|-----|-------------|---------|-------------------|
+| Fix A | 2/5 | Rewrite needed | Misattributes the freshness delay to `staleTime` even though `openSessions` already interval-polls and defaults to 5s polling. |
+| Fix B | 4/5 | Clear | Core session-aware grouping design is coherent, but the prompt should warn about the stale `expandedGroups` path already present in the file. |
+| Fix C | 3/5 | Needs clarification | Patch body is understandable, but the prompt states a false dependency on Fix B and does not bound the raw-order scan convincingly. |
+
+Overall prompt verdict: NEEDS REVISION
