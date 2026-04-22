<!-- Auto-extracted from task.log by watcher post-step (KB-165 fix, S296).
     Codex sandbox blocked direct write to pipeline/chain-state/; findings recovered from stdout.
     Source task: task-260417-081550-002  Chain: staffordersmobile-260417-081549-67a0 -->

# Codex Reviewer Findings â€” ÐŸÐ¡Ð¡Ðš Prompt Quality Review
(The pipeline uses regex extraction on your stdout. If this header is not the first line â†’ your findings are invisible to the watcher â†’ review treated as skipped.)

FORMAT (MANDATORY â€” follow exactly, do NOT skip any section):
# Codex Reviewer Findings â€” ÐŸÐ¡Ð¡Ðš Prompt Quality Review
Chain: staffordersmobile-260417-081549-67a0

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
   C:/Users/ASUS/Dev/Menu AI Cowork/pipeline/cc-analysis-task-260417-081550-002.txt
2. Use the Write tool to append one line to the progress file:
   C:/Users/ASUS/Dev/Menu AI Cowork/pipeline/progress-task-260417-081550-002.txt
   Line: [OK] HH:MM DONE
Do NOT use shell commands for these final writes â€” use the Write tool.
=== END FINAL STEPS ===

codex
I’ve loaded the prompt header and constraints. Now I’m reading the prompt in bounded chunks and then I’ll verify the referenced `StaffOrdersMobile` ranges directly against source before writing the required reviewer findings.
exec
"C:\\WINDOWS\\System32\\WindowsPowerShell\\v1.0\\powershell.exe" -Command '$lines = Get-Content '"'C:\\Users\\ASUS\\Dev\\Menu AI Cowork\\pipeline\\task-260417-081550-002.prompt'; "'$lines | Select-Object -First 350' in C:\Users\ASUS\Dev\Menu AI Cowork\menuapp-code-review
exec
"C:\\WINDOWS\\System32\\WindowsPowerShell\\v1.0\\powershell.exe" -Command '$lines = Get-Content '"'C:\\Users\\ASUS\\Dev\\Menu AI Cowork\\pipeline\\task-260417-081550-002.prompt'; "'$lines | Select-Object -Skip 350 -First 350' in C:\Users\ASUS\Dev\Menu AI Cowork\menuapp-code-review
exec
"C:\\WINDOWS\\System32\\WindowsPowerShell\\v1.0\\powershell.exe" -Command '$lines = Get-Content '"'C:\\Users\\ASUS\\Dev\\Menu AI Cowork\\pipeline\\task-260417-081550-002.prompt'; "'$lines | Select-Object -Skip 700 -First 350' in C:\Users\ASUS\Dev\Menu AI Cowork\menuapp-code-review
exec
"C:\\WINDOWS\\System32\\WindowsPowerShell\\v1.0\\powershell.exe" -Command '$lines = Get-Content '"'C:\\Users\\ASUS\\Dev\\Menu AI Cowork\\pipeline\\task-260417-081550-002.prompt'; "'$lines | Select-Object -Skip 1050 -First 350' in C:\Users\ASUS\Dev\Menu AI Cowork\menuapp-code-review
 succeeded in 15356ms:
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

 succeeded in 16324ms:
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
   C:/Users/ASUS/Dev/Menu AI Cowork/pipeline/cc-analysis-task-260417-081550-002.txt
2. Use the Write tool to append one line to the progress file:
   C:/Users/ASUS/Dev/Menu AI Cowork/pipeline/progress-task-260417-081550-002.txt
   Line: [OK] HH:MM DONE
Do NOT use shell commands for these final writes â€” use the Write tool.
=== END FINAL STEPS ===

 succeeded in 16440ms:

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


 succeeded in 17020ms:
IMPORTANT: Your VERY FIRST action must be: use the Write tool to create the file
C:/Users/ASUS/Dev/Menu AI Cowork/pipeline/started-task-260417-081550-002.md
with content: started <current-ISO-timestamp>
Do NOT use any shell command (echo, Set-Content, Write-Output, etc.) for this marker.
Do NOT probe or test the shell before writing â€” use the Write tool directly.

=== TASK SETUP ===
Progress file: C:/Users/ASUS/Dev/Menu AI Cowork/pipeline/progress-task-260417-081550-002.txt
Task ID: task-260417-081550-002
=== END TASK SETUP ===

=== PROGRESS UPDATES ===
After each major step, use the Write tool (or Read+Write to append) to update:
C:/Users/ASUS/Dev/Menu AI Cowork/pipeline/progress-task-260417-081550-002.txt
Append one line of the form: [CDX] HH:MM <status>
Do NOT use shell commands for progress updates â€” use the Write tool.
=== END PROGRESS ===

=== GIT RULES ===
You are a reviewer/analyzer in this chain step. Do NOT commit or push any
code changes. Only write the findings/analysis file specified in the task body.
If the task body explicitly requires code changes:
  - Use Bash tool (not PowerShell) with simple commands: git add <file>; git commit -m "..."
  - NEVER use git add . or git add -A
  - Avoid long-running PowerShell scans (ripgrep/Get-Content on files >200KB)
=== END GIT RULES ===

---
chain: staffordersmobile-260417-081549-67a0
chain_step: 1
chain_total: 1
chain_step_name: pssk-codex-reviewer
chain_group: reviewers
chain_group_size: 2
page: StaffOrdersMobile
budget: 10.00
runner: codex
type: chain-step
---
You are a Codex code reviewer evaluating the QUALITY of a ÐšÐ¡ implementation prompt (NOT executing it).

A ÐšÐ¡ prompt is an instruction document for Claude Code + Codex pipeline to fix code in a React/Base44 app.
Your role: find issues with the PROMPT DESIGN that could cause the execution to fail, produce wrong results, or require clarification.

â›” DO NOT: run any shell commands that modify state, make any code changes, modify files.
â›” DO NOT: submit raw grep output or file dumps as your final answer â€” this will be treated as a failed review.
â›” DO NOT: create any files in `pipeline/queue/`, `pipeline/staged/`, or any other pipeline directory except the single findings file specified below (`pipeline/chain-state/staffordersmobile-260417-081549-67a0-codex-findings.md`). âš ï¸ KB-134: Codex Ð¾ÑˆÐ¸Ð±Ð¾Ñ‡Ð½Ð¾ ÑÐ¾Ð·Ð´Ð°Ð²Ð°Ð» ks-*.md Ð² queue/ â†’ Ð’Ð§Ð  Ð¿Ð¾Ð´Ñ…Ð²Ð°Ñ‚Ñ‹Ð²Ð°Ð» ÐºÐ°Ðº Ð½Ð¾Ð²ÑƒÑŽ ÐšÐ¡ â†’ ÐºÐ°ÑÐºÐ°Ð´Ð½Ñ‹Ðµ Ñ€Ð°ÑÑ…Ð¾Ð´Ñ‹. Ð•ÑÐ»Ð¸ Ñ‚Ñ‹ Ð¿Ð¸ÑˆÐµÑˆÑŒ Ñ„Ð°Ð¹Ð» Ñ Ð¸Ð¼ÐµÐ½ÐµÐ¼ `ks-*`, `pssk-*`, `synth-*`, `d3-*` â€” ÑÑ‚Ð¾ ÐžÐ¨Ð˜Ð‘ÐšÐ, Ñ‚Ð²Ð¾Ð¹ output Ð´Ð¾Ð»Ð¶ÐµÐ½ Ð±Ñ‹Ñ‚ÑŒ **Ñ‚Ð¾Ð»ÑŒÐºÐ¾** Ñ€ÐµÐ²ÑŒÑŽ-Ð¾Ñ‚Ñ‡Ñ‘Ñ‚ Ð¿Ð¾ ÑƒÐºÐ°Ð·Ð°Ð½Ð½Ð¾Ð¼Ñƒ Ð¿ÑƒÑ‚Ð¸. ÐÐ¸ÐºÐ°ÐºÐ¸Ñ… Ð¿Ð¾Ð±Ð¾Ñ‡Ð½Ñ‹Ñ… Ñ„Ð°Ð¹Ð»Ð¾Ð².
âœ… DO: analyze the prompt text AND read the target source file(s) yourself via Read tool (paths in TASK CONTEXT).
âœ… MANDATORY: Your response MUST end with a "Fix Ratings" table rating each Fix N/5. No table = incomplete review.

SPEED RULES â€” this is a time-sensitive pipeline step (KB-142 + S283-Ch4 WinError 206 fix):
- The source file is NOT inlined (files >500 lines exceed Windows argv limit â†’ WinError 206).
  READ the target file yourself using the Read tool. Path is in TASK CONTEXT below (look for "Ð¤Ð°Ð¹Ð» Ð¸ Ð»Ð¾ÐºÐ°Ñ†Ð¸Ñ", "Ð¤Ð°Ð¹Ð»:", or "Target file:").
- For narrow lookups (specific function, line range), prefer Grep/Read with line offsets over full-file reads.
- Do NOT run ripgrep, Get-Content, Select-String, cat, head, tail, or other PowerShell filesystem scans on files >200KB â€” they time out at 11-12 sec per command on Windows (KB-142). Use Read tool with offset/limit.

ACTION BUDGET â€” MANDATORY (KB-167, S302 fix for investigation runaway):
- **Hard limit: 20 tool calls** total (Read + Grep + Bash combined across the entire review).
- **After 20 calls: STOP all investigation immediately. Write your findings file NOW** â€” even if some sections are incomplete. A partial-but-delivered report is always better than a complete-but-never-written one.
- Phase gates (soft targets): â‰¤8 calls â†’ finish reading source file(s); â‰¤12 â†’ finish CRITICAL/MEDIUM analysis; â‰¤20 â†’ write findings file.
- Max **2 tool calls per single reference** (e.g., one [V5-X] tag, one line number, one function). If not verified in 2 calls â†’ mark as "â“ not verified (budget)" and move on.
- Do NOT explore code paths that are NOT explicitly referenced in the ÐŸÐ¡Ð¡Ðš being reviewed. Stick to what the prompt asks you to verify.

To verify the prompt's code references â€” use the file you read:
1. Check line numbers against the actual source
2. Verify function names, variable names, and code snippets match
3. Check that code snippets in the prompt match actual code (correct field names, function signatures, etc.)

For each issue: [CRITICAL/MEDIUM/LOW] Title â€” Description. PROMPT FIX: what to change in the prompt.

Focus on:
- Incorrect code snippets in the prompt (wrong syntax, wrong function calls, wrong variable names) â€” verify against actual code
- Missing edge cases the prompt doesn't cover
- Ambiguous instructions Codex might misinterpret
- Safety risks: will this cause unintended file changes?
- Missing context: what info would help Codex execute without hesitation?
- Fix order: are there dependencies between fixes that need explicit sequencing?
- Validation: are the post-fix verification steps sufficient?
- Line numbers: verify all ~line N references against the actual file

Write your findings to (ABSOLUTE PATH â€” required, see KB-139): C:/Users/ASUS/Dev/Menu AI Cowork/pipeline/chain-state/staffordersmobile-260417-081549-67a0-codex-findings.md

âš ï¸ CRITICAL OUTPUT RULE (KB-165): The VERY FIRST LINE of your findings file MUST be exactly:
# Codex Reviewer Findings â€” ÐŸÐ¡Ð¡Ðš Prompt Quality Review
(The pipeline uses regex extraction on your stdout. If this header is not the first line â†’ your findings are invisible to the watcher â†’ review treated as skipped.)

FORMAT (MANDATORY â€” follow exactly, do NOT skip any section):
# Codex Reviewer Findings â€” ÐŸÐ¡Ð¡Ðš Prompt Quality Review
Chain: staffordersmobile-260417-081549-67a0

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

codex
I’ve finished reading the prompt body. Next I’m validating the cited anchors in `staffordersmobile.jsx` and `sessionHelpers.js` against the actual source so the findings are about prompt quality, not speculation.
exec
"C:\\WINDOWS\\System32\\WindowsPowerShell\\v1.0\\powershell.exe" -Command "@'
function Show-Range("'$path, $start, $end, $label) {
  Write-Output "=== $label ($start-$end) ==="
  $i = 0
  [System.IO.File]::ReadLines($path) | ForEach-Object {
    $i++
    if ($i -ge $start -and $i -le $end) { '"'{0,5}: {1}' -f "'$i, $_ }
    elseif ($i -gt $end) { break }
  }
}
$path = '"'C:\\Users\\ASUS\\Dev\\Menu AI Cowork\\menuapp-code-review\\pages\\StaffOrdersMobile\\staffordersmobile.jsx'
Show-Range "'$path 1 25 '"'imports'
Show-Range "'$path 560 575 '"'comment-candidate-1'
Show-Range "'$path 1168 1180 '"'comment-candidate-2'
Show-Range "'$path 2285 2298 '"'live-data-group-id'
Show-Range "'$path 2818 2830 '"'banner-dispatch'
Show-Range "'$path 3490 3565 '"'orders-openSessions-openSessionByTableId'
Show-Range "'$path 3590 3620 '"'activeOrders'
Show-Range "'$path 3765 3910 '"'orderGroups-filteredGroups-tabCounts'
Show-Range "'$path 4075 4205 '"'buildBannerInfo-handleBannerNavigate-confirmCloseTable'
Show-Range "'$path 4455 4490 '"'orderGroupCard-map'
Show-Range "'$path 4605 4615 '"'banner-prop-pass'
'@ | powershell -NoProfile -Command -" in C:\Users\ASUS\Dev\Menu AI Cowork\menuapp-code-review
 succeeded in 31784ms:
codex
The first range-read command didn’t return content, so I’m retrying with a simpler direct script. After that I’ll synthesize findings and write the report.
exec
"C:\\WINDOWS\\System32\\WindowsPowerShell\\v1.0\\powershell.exe" -Command 'function Show-Range($path, $start, $end, $label) { Write-Output "=== $label ($start-$end) ==="; $i = 0; [System.IO.File]::ReadLines($path) | ForEach-Object { $i++; if ($i -ge $start -and $i -le $end) { '"'{0,5}: {1}' -f "'$i, $_ } elseif ($i -gt $end) { break } } }; $path = '"'C:\\Users\\ASUS\\Dev\\Menu AI Cowork\\menuapp-code-review\\pages\\StaffOrdersMobile\\staffordersmobile.jsx'; Show-Range "'$path 1 25 '"'imports'; Show-Range "'$path 560 575 '"'comment-candidate-1'; Show-Range "'$path 1168 1180 '"'comment-candidate-2'; Show-Range "'$path 2285 2298 '"'live-data-group-id'; Show-Range "'$path 2818 2830 '"'banner-dispatch'; Show-Range "'$path 3490 3565 '"'orders-openSessions-openSessionByTableId'; Show-Range "'$path 3590 3620 '"'activeOrders'; Show-Range "'$path 3765 3910 '"'orderGroups-filteredGroups-tabCounts'; Show-Range "'$path 4075 4205 '"'buildBannerInfo-handleBannerNavigate-confirmCloseTable'; Show-Range "'$path 4455 4490 '"'orderGroupCard-map'; Show-Range "'$path 4605 4615 '"'banner-prop-pass'" in C:\Users\ASUS\Dev\Menu AI Cowork\menuapp-code-review
 succeeded in 7717ms:
=== imports (1-25) ===
    1: /* ═══════════════════════════════════════════════════════════════════════════
    2:    STAFFORDERSMOBILE — v4.0.0 (2026-03-05) UX Redesign — Expand/Collapse Cards
    3: 
    4:    CHANGES in v4.0.0 (UX Redesign — Expand/Collapse Cards — S77):
    5:    - Replaced detail view navigation with inline expand/collapse cards
    6:    - Collapsed card: identifier + elapsed time + channel + status + items preview + request badges
    7:    - Expanded card (Hall): Block A (active orders) + Block B (action) + Block C (requests)
    8:      + Block E (bill summary) + Block F (completed orders) + Block D (close table)
    9:    - Expanded card (Pickup/Delivery): Block A (full items) + Block B (action) + contacts
   10:    - Max 1 expanded card at a time; tap to toggle
   11:    - Animation: height 200ms ease-out, content opacity transition
   12:    - Items loaded per-order via useQueries, cached 60s
   13:    - Human-readable status labels, no system IDs or raw i18n keys
   14:    - Order number displayed as secondary gray text
   15:    - Request badges (bill/waiter) on collapsed hall cards
   16:    - Bill summary with per-guest breakdown
   17:    - Close table with disable reasons
   18: 
   19:    CHANGES in v3.7.0 (Bug Fixes — S76):
   20:    - BUG-S76-01: Fixed i18n — status badge now translates OrderStage names via t()
   21:    - BUG-S76-02: Fixed i18n — action button text now translates OrderStage names via t()
   22:    - BUG-S76-03: Fixed client_name display in detail view for Pickup/Delivery orders
   23: 
   24:    CHANGES in v3.6.0 (P0 Stale Data + Close Table Confirm — S74):
   25:    - P0: Detail view forces refetch on open (prevents stale order list)

exec
"C:\\WINDOWS\\System32\\WindowsPowerShell\\v1.0\\powershell.exe" -Command 'function Show-Range($lines, $start, $end, $label) { Write-Output "=== $label ($start-$end) ==="; for ($i = $start; $i -le $end -and $i -le $lines.Length; $i++) { '"'{0,5}: {1}' -f "'$i, $lines[$i-1] } }; $path = '"'C:\\Users\\ASUS\\Dev\\Menu AI Cowork\\menuapp-code-review\\pages\\StaffOrdersMobile\\staffordersmobile.jsx'; "'$lines = [System.IO.File]::ReadAllLines($path); Show-Range $lines 26 40 '"'imports-continued'; Show-Range "'$lines 560 575 '"'comment-candidate-1'; Show-Range "'$lines 1168 1180 '"'comment-candidate-2'; Show-Range "'$lines 2285 2298 '"'live-data-group-id'; Show-Range "'$lines 2818 2830 '"'banner-dispatch'; Show-Range "'$lines 3490 3565 '"'orders-openSessions-openSessionByTableId'; Show-Range "'$lines 3590 3620 '"'activeOrders'; Show-Range "'$lines 3765 3910 '"'orderGroups-filteredGroups-tabCounts'; Show-Range "'$lines 4075 4205 '"'buildBannerInfo-handleBannerNavigate-confirmCloseTable'; Show-Range "'$lines 4455 4490 '"'orderGroupCard-map'; Show-Range "'$lines 4605 4615 '"'banner-prop-pass'" in C:\Users\ASUS\Dev\Menu AI Cowork\menuapp-code-review
 succeeded in 7038ms:
=== imports-continued (26-40) ===
   26:    - P0: Notification effect invalidates orders query when new orders detected
   27:    - P0: computeTableStatus reordered — NEW before STALE (new orders clear ПРОСРОЧЕН)
   28:    - P0: "Закрыть стол" replaced browser confirm() with React confirmation dialog
   29:    - Dialog: table name in title, destructive red button, 44px touch targets, mobile 320px safe
   30: 
   31:    CHANGES in v3.5.0 (SESS-016 — Session Cleanup Integration):
   32:    - Added runSessionCleanup() import from @/components/sessionCleanupJob
   33:    - Added useEffect + setInterval(5min) to auto-expire stale sessions
   34:    - Silent background job: logs only when actions taken or errors occur
   35:    - Idempotent: safe to run on each mount + every 5 minutes
   36: 
   37:    CHANGES in v3.4.0 (UI Bug Fixes — 4 bugs from Deep Test S66):
   38:    - BUG-S66-01: Detail view now opens reliably (removed translate-x animation, z-40)
   39:    - BUG-S66-02: PREPARING cards show CTA for advanceable orders (was hidden)
   40:    - BUG-S65-04: First-stage CTA opens detail view (prevents blind accept)
=== comment-candidate-1 (560-575) ===
  560:   }
  561: 
  562:   return null;
  563: }
  564: /*
  565:     <div data-group-id={group.id} className={`mb-3 rounded-lg border border-slate-200 overflow-hidden transition-all duration-300 ${style.bgClass} ${style.borderClass} ${highlightRing}`}>
  566:       <div className="px-4 pt-3 pb-3 cursor-pointer active:opacity-80" onClick={onToggleExpand} role="button" aria-expanded={isExpanded} aria-label={group.type === "table" ? identifier : `${identifier}: ${statusLabel}`}>
  567:         {group.type === "table" ? (
  568:           <div className="space-y-2">
  569:             <div className="flex items-start justify-between gap-3">
  570:               <div className="flex items-center gap-2 min-w-0">
  571:                 {ownershipState === "mine" ? (
  572:                   <span className="shrink-0"><Star className="w-4 h-4 fill-yellow-400 text-yellow-400" /></span>
  573:                 ) : ownershipState === "other" ? (
  574:                   <button type="button" onClick={showOtherTableHint} className="shrink-0 rounded-full p-0.5 -m-0.5" aria-label={HALL_UI_TEXT.otherTableTitle}>
  575:                     <Lock className="w-4 h-4 text-slate-400" />
=== comment-candidate-2 (1168-1180) ===
 1168: ═══════════════════════════════════════════════════════════════════════════ */
 1169: 
 1170: /* function RateLimitScreen({ onRetry }) {
 1171:   return (
 1172:     <div
 1173:       data-group-id={group.id}
 1174:       className={`mb-3 rounded-lg border border-slate-200 overflow-hidden transition-all duration-300 ${style.bgClass} ${style.borderClass} ${highlightRing}`}
 1175:     >
 1176:       <div
 1177:         className="px-4 pt-3 pb-3 cursor-pointer active:opacity-80"
 1178:         onClick={onToggleExpand}
 1179:         role="button"
 1180:         aria-expanded={isExpanded}
=== live-data-group-id (2285-2298) ===
 2285:       </div>
 2286:     );
 2287:   }, [advanceMutation.isPending, buildAdvancePayload, getOrderActionMeta, getStatusConfig, guestName, handleSingleAction, itemsByOrder]);
 2288: 
 2289:   const highlightRing = isHighlighted ? "ring-2 ring-indigo-400 ring-offset-1" : "";
 2290: 
 2291:   return (
 2292:     <div data-group-id={group.id} className={`mb-3 rounded-lg border border-slate-200 overflow-hidden transition-all duration-300 ${style.bgClass} ${style.borderClass} ${highlightRing}`}>
 2293:       <div className="px-4 pt-3 pb-3 cursor-pointer active:opacity-80" onClick={onToggleExpand} role="button" aria-expanded={isExpanded} aria-label={group.type === "table" ? identifier : `${identifier}: ${statusLabel}`}>
 2294:         {group.type === "table" ? (
 2295:           <div>
 2296:             <div style={{display:'flex', alignItems:'center', gap:'10px', minHeight:'72px'}}>
 2297:               <div style={{position:'relative', flexShrink:0, width:'84px', display:'flex', alignItems:'center', justifyContent:'flex-end'}}>
 2298:                 {ownershipState === "mine" && (
=== banner-dispatch (2818-2830) ===
 2818:     setDismissing(true);
 2819:     dismissAnimTimer.current = setTimeout(() => onDismiss(), 300);
 2820:   }, [onDismiss, clearTimers]);
 2821: 
 2822:   const handleTap = useCallback(() => {
 2823:     clearTimers();
 2824:     if (banner?.groupId) {
 2825:       onNavigate(banner.groupId);
 2826:     }
 2827:     setDismissing(true);
 2828:     dismissAnimTimer.current = setTimeout(() => onDismiss(), 200);
 2829:   }, [banner, onNavigate, onDismiss, clearTimers]);
 2830: 
=== orders-openSessions-openSessionByTableId (3490-3565) ===
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
 3511: 
 3512:   useEffect(() => {
 3513:     if (ordersErrorObj && isRateLimitError(ordersErrorObj)) {
 3514:       queryClient.cancelQueries();
 3515:       setRateLimitHit(true);
 3516:     }
 3517:   }, [ordersErrorObj]);
 3518: 
 3519:   const {
 3520:     data: allRequests,
 3521:     isError: requestsError,
 3522:     error: requestsErrorObj,
 3523:     refetch: refetchRequests,
 3524:     dataUpdatedAt: requestsUpdatedAt,
 3525:   } = useQuery({
 3526:     queryKey: ["serviceRequests", partnerId],
 3527:     queryFn: () => (partnerId ? base44.entities.ServiceRequest.filter({ partner: partnerId }) : base44.entities.ServiceRequest.list()),
 3528:     enabled: canFetch && !isKitchen && !rateLimitHit,
 3529:     refetchInterval: effectivePollingInterval,
 3530:     refetchIntervalInBackground: false,
 3531:     retry: shouldRetry,
 3532:   });
 3533: 
 3534:   useEffect(() => {
 3535:     if (requestsErrorObj && isRateLimitError(requestsErrorObj)) {
 3536:       queryClient.cancelQueries();
 3537:       setRateLimitHit(true);
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
=== activeOrders (3590-3620) ===
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
=== orderGroups-filteredGroups-tabCounts (3765-3910) ===
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
=== buildBannerInfo-handleBannerNavigate-confirmCloseTable (4075-4205) ===
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
 4103:     }
 4104:   }, [roleFilteredOrders, assignFilters, selectedTypes, canFetch, notifPrefs, effectiveUserId, stagesMap, tableMap, queryClient]);
 4105: 
 4106:   const toggleChannel = (type) => {
 4107:     const on = selectedTypes.includes(type);
 4108:     if (on && selectedTypes.length === 1) {
 4109:       showToast("Минимум 1 канал");
 4110:       return;
 4111:     }
 4112:     if (!on && (channelCounts[type] || 0) === 0) {
 4113:       showToast("Пока 0 заказов");
 4114:     }
 4115:     lastFilterChangeRef.current = Date.now();
 4116:     setSelectedTypes((p) => (p.includes(type) ? p.filter((t) => t !== type) : [...p, type]));
 4117:   };
 4118: 
 4119:   const toggleAssign = (key) => {
 4120:     const on = assignFilters.includes(key);
 4121:     if (on && assignFilters.length === 1) {
 4122:       showToast("Минимум 1 фильтр");
 4123:       return;
 4124:     }
 4125:     if (!on && (assignCounts[key] || 0) === 0) {
 4126:       showToast("Пока 0 заказов");
 4127:     }
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
 4169:     setManualRefreshTs(Date.now());
 4170:     refetchOrders();
 4171:     if (!isKitchen) refetchRequests();
 4172:   };
 4173: 
 4174:   // D1-007, D1-008, D1-009: Close table handler
 4175:   // v3.6.0: Shows confirmation dialog instead of browser confirm()
 4176:   const handleCloseTable = (tableSessionField, tableName, tableId) => {
 4177:     const sessionId = getLinkId(tableSessionField);
 4178:     if (!sessionId) return;
 4179:     setCloseTableConfirm({ sessionId, tableId, tableName: tableName || 'стол' });
 4180:   };
 4181: 
 4182:   // v3.6.0: Confirmation dialog — executes close after user confirms
 4183:   const confirmCloseTable = async () => {
 4184:     if (!closeTableConfirm) return;
 4185:     const { sessionId, tableId } = closeTableConfirm;
 4186:     setCloseTableConfirm(null);
 4187:     try {
 4188:       await closeSession(sessionId, tableId);
 4189:       showToast("Стол закрыт");
 4190:       setExpandedGroupId(null); // Collapse expanded card — table no longer active
 4191:       refetchOrders();
 4192:       if (!isKitchen) refetchRequests();
 4193:       queryClient.invalidateQueries({ queryKey: ["openSessions"] });
 4194:     } catch (err) {
 4195:       showToast("Ошибка при закрытии");
 4196:     }
 4197:   };
 4198: 
 4199:   // v2.7.1: Close all orders handler (move all to finish stage)
 4200:   const handleCloseAllOrders = useCallback(async (orders) => {
 4201:     if (!orders?.length) return;
 4202:     
 4203:     const finishStage = sortedStages.find(s => s.internal_code === 'finish');
 4204:     if (!finishStage) {
 4205:       showToast('Нет этапа "Завершён"');
=== orderGroupCard-map (4455-4490) ===
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
 4467:                   guestsMap={guestsMap}
 4468:                   effectiveUserId={effectiveUserId}
 4469:                   onMutate={trackOwnMutation}
 4470:                   onCloseTable={canCloseTable ? handleCloseTable : null}
 4471:                   overdueMinutes={partnerData?.order_overdue_minutes}
 4472:                   notifiedOrderIds={notifiedOrderIds}
 4473:                   onClearNotified={clearNotified}
 4474:                   tableMap={tableMap}
 4475:                   onCloseAllOrders={handleCloseAllOrders}
 4476:                   activeRequests={activeRequests}
 4477:                   onCloseRequest={(reqId, newStatus, extraFields) => updateRequestMutation.mutate({ id: reqId, status: newStatus, ...extraFields })}
 4478:                   onBatchCloseRequestAsync={(reqId, newStatus, extraFields) => updateRequestMutation.mutateAsync({ id: reqId, status: newStatus, ...extraFields, __batch: true })}
 4479:                   orderStages={sortedStages}
 4480:                   setUndoToast={setUndoToast}
 4481:                   undoToast={undoToast}
 4482:                   staffName={staffName}
 4483:                   isRequestPending={updateRequestMutation.isPending}
 4484:                 />
 4485:               ))
 4486:             )}
 4487: 
 4488:           </React.Fragment>
 4489:         )}
 4490:       </div>
=== banner-prop-pass (4605-4615) ===
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

exec
"C:\\WINDOWS\\System32\\WindowsPowerShell\\v1.0\\powershell.exe" -Command 'function Show-Range($path, $start, $end, $label) { $lines = [System.IO.File]::ReadAllLines($path); Write-Output "=== $label ($start-$end) ==="; for ($i = $start; $i -le $end -and $i -le $lines.Length; $i++) { '"'{0,5}: {1}' -f "'$i, $lines[$i-1] } }; $staff = '"'C:\\Users\\ASUS\\Dev\\Menu AI Cowork\\menuapp-code-review\\pages\\StaffOrdersMobile\\staffordersmobile.jsx'; "'$session = '"'C:\\Users\\ASUS\\Dev\\Menu AI Cowork\\menuapp-code-review\\components\\sessionHelpers.js'; Write-Output '=== staff pattern hits ==='; Select-String -Path "'$staff -Pattern "from '"'react'\",\"useQueryClient\",\"handleCloseTableClick\",\"const queryClient = useQueryClient\",\"setExpandedGroups\",\"toggleGroupExpand\" | ForEach-Object { '{0,5}: {1}' -f "'$_.LineNumber, $_.Line.Trim() }; Show-Range $session 65 95 '"'sessionHelpers-getOrCreateSession'; Show-Range "'$session 154 180 '"'sessionHelpers-closeSession'" in C:\Users\ASUS\Dev\Menu AI Cowork\menuapp-code-review
 succeeded in 12859ms:
=== staff pattern hits ===
  161: import { useMutation, useQuery, useQueryClient, useQueries } from "@tanstack/react-query";
  767: <button type="button" onClick={handleCloseTableClick} disabled={!!closeDisabledReason} className={`w-full min-h-[44px] flex items-center justify-center gap-2 font-medium text-sm rounded-lg border transition-all active:scale-[0.99] ${closeDisabledReason ? "bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed" : "bg-red-50 text-red-600 border-red-200 hover:bg-red-100"}`}>
 1382: <button type="button" onClick={handleCloseTableClick} disabled={!!closeDisabledReason} className={`w-full min-h-[44px] flex items-center justify-center gap-2 font-medium text-sm rounded-lg border transition-all active:scale-[0.99] ${closeDisabledReason ? 'bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed' : 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100'}`}>
 1581: const queryClient = useQueryClient();
 1749: const queryClient = useQueryClient();
 2164: const handleCloseTableClick = useCallback(() => {
 2390: {onCloseTable && group.orders.length > 0 && <div className="pt-2 border-t border-slate-200"><button type="button" onClick={handleCloseTableClick} disabled={!!closeDisabledReason} className={`w-full min-h-[44px] flex items-center justify-center gap-2 font-medium text-sm rounded-lg border transition-all active:scale-[0.99] ${closeDisabledReason ? "bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed" : "bg-red-50 text-red-600 border-red-200 hover:bg-red-100"}`}><X className="w-4 h-4" />{HALL_UI_TEXT.closeTable}</button>{closeDisabledReasons.length > 0 && <p className="mt-1.5 text-[11px] text-slate-400 text-center leading-relaxed">{`${HALL_UI_TEXT.closeHint} `}{closeDisabledReasons.map((reason, i) => { const kind = reasonToKind[reason]; const countMap = { requests: `${tableRequests.length} \u0437\u0430\u043F\u0440.`, new: `${newOrders.length} \u043D\u043E\u0432.`, inProgress: `${inProgressOrders.length} \u0432 \u0440\u0430\u0431\u043E\u0442\u0435`, ready: `${readyOrders.length} \u0433\u043E\u0442.` }; const actionMap = { requests: HALL_UI_TEXT.closeActionRequests, new: HALL_UI_TEXT.closeActionNew, inProgress: HALL_UI_TEXT.closeActionInProgress, ready: HALL_UI_TEXT.closeActionReady }; const actionText = actionMap[kind] ? `${actionMap[kind]} ${countMap[kind] || ""}` : reason; return <React.Fragment key={kind || i}>{i > 0 && <span> · </span>}<button type="button" onClick={() => scrollToSection(kind)} className="text-red-500 font-medium active:text-red-700">{`\u2192 ${actionText}`}</button></React.Fragment>; })}</p>}</div>}
 2883: const queryClient = useQueryClient();
 3061: const [expandedGroups, setExpandedGroups] = useState(new Set());
 3839: setExpandedGroups(prev => {
 3852: const toggleGroupExpand = useCallback((groupId) => {
 3853: setExpandedGroups(prev => {
=== sessionHelpers-getOrCreateSession (65-95) ===
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
=== sessionHelpers-closeSession (154-180) ===
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

codex
I’ve verified the main anchors. There are already a couple of prompt-quality mismatches in the source references, and I’m checking the remaining import/query-client anchors before I lock the report.
exec
"C:\\WINDOWS\\System32\\WindowsPowerShell\\v1.0\\powershell.exe" -Command 'function Show-Range($path, $start, $end, $label) { $lines = [System.IO.File]::ReadAllLines($path); Write-Output "=== $label ($start-$end) ==="; for ($i = $start; $i -le $end -and $i -le $lines.Length; $i++) { '"'{0,5}: {1}' -f "'$i, $lines[$i-1] } }; $staff = '"'C:\\Users\\ASUS\\Dev\\Menu AI Cowork\\menuapp-code-review\\pages\\StaffOrdersMobile\\staffordersmobile.jsx'; Show-Range "'$staff 145 170 '"'react-and-query-imports'; Show-Range "'$staff 1574 1588 '"'queryClient-hit-1'; Show-Range "'$staff 1742 1755 '"'queryClient-hit-2'; Show-Range "'$staff 2878 2892 '"'queryClient-hit-3'; Write-Output '=== useRef count ==='; ([regex]::Matches([System.IO.File]::ReadAllText("'$staff),'"'\\buseRef\\b')).Count" in C:\Users\ASUS\Dev\Menu AI Cowork\menuapp-code-review
 succeeded in 14333ms:
=== react-and-query-imports (145-170) ===
  145:    - P0: Added Cabinet button in header for directors after bind
  146:    
  147:    Previous changes (v2.2):
  148:    - Added ProfileSheet with staff name, role, restaurant name
  149:    - Moved "My Tables" (⭐) into ProfileSheet
  150:    - Added role-based help instructions (waiter vs kitchen)
  151:    - Added kitchen filter: kitchen only sees accepted/in_progress/ready orders
  152:    - Simplified header: [👤] [🔔] [⚙️]
  153:    - Added logout functionality
  154:    
  155:    Previous fixes (v2.1):
  156:    - Rate limit fix (infinite loop prevention)
  157: ═══════════════════════════════════════════════════════════════════════════ */
  158: 
  159: import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
  160: import { base44 } from "@/api/base44Client";
  161: import { useMutation, useQuery, useQueryClient, useQueries } from "@tanstack/react-query";
  162: import {
  163:   ArrowDown,
  164:   ArrowUp,
  165:   Bell,
  166:   Briefcase,
  167:   ChevronDown,
  168:   ChevronLeft,
  169:   ChevronUp,
  170:   Clock,
=== queryClient-hit-1 (1574-1588) ===
 1574:   isNotified,
 1575:   onClearNotified,
 1576:   getStatusConfig,
 1577:   isKitchen,
 1578:   guestsMap,
 1579:   onCloseTable,
 1580: }) {
 1581:   const queryClient = useQueryClient();
 1582:   const [itemsOpen, setItemsOpen] = useState(false);
 1583:   const tableId = getLinkId(order.table);
 1584:   const tableSessionId = getLinkId(order.table_session);
 1585:   const guestId = getLinkId(order.guest);
 1586:   const { data: items } = useQuery({
 1587:     queryKey: ["orderItems", order.id],
 1588:     queryFn: () => base44.entities.OrderItem.filter({ order: order.id }),
=== queryClient-hit-2 (1742-1755) ===
 1742:   onBatchCloseRequestAsync = () => Promise.resolve(),
 1743:   orderStages = [],
 1744:   setUndoToast,
 1745:   undoToast,
 1746:   staffName,
 1747:   isRequestPending,
 1748: }) {
 1749:   const queryClient = useQueryClient();
 1750:   const tableId = group.type === "table" ? group.id : null;
 1751:   const tableData = tableId ? tableMap[tableId] : null;
 1752:   const tableStatus = computeTableStatus(group, activeRequests, getStatusConfig);
 1753:   const style = TABLE_STATUS_STYLES[tableStatus] || TABLE_STATUS_STYLES.PREPARING;
 1754: 
 1755:   const workOrders = useMemo(
=== queryClient-hit-3 (2878-2892) ===
 2878: /* ═══════════════════════════════════════════════════════════════════════════
 2879:    MAIN COMPONENT
 2880: ═══════════════════════════════════════════════════════════════════════════ */
 2881: 
 2882: export default function StaffOrdersMobile() {
 2883:   const queryClient = useQueryClient();
 2884:   const { t } = useI18n(); // BUG-S76-01/02: translate stage names
 2885: 
 2886:   const [urlParams] = useState(() => new URLSearchParams(window.location.search));
 2887:   const token = urlParams.get("token");
 2888:   const isTokenMode = !!token;
 2889: 
 2890:   const deviceId = useMemo(() => getOrCreateDeviceId(), []);
 2891:   const didBindRef = useRef(false);
 2892:   const didUpdateLastActiveRef = useRef(false);
=== useRef count ===
25

exec
"C:\\WINDOWS\\System32\\WindowsPowerShell\\v1.0\\powershell.exe" -Command '$staff = '"'C:\\Users\\ASUS\\Dev\\Menu AI Cowork\\menuapp-code-review\\pages\\StaffOrdersMobile\\staffordersmobile.jsx'; Select-String -Path "'$staff -Pattern '"'getLinkId','expandedGroupId','setExpandedGroupId' | ForEach-Object { '{0,5}: {1}' -f "'$_.LineNumber, $_.Line.Trim() } | Select-Object -First 30' in C:\Users\ASUS\Dev\Menu AI Cowork\menuapp-code-review
 succeeded in 12530ms:
   98: - Stage ID сравнения теперь через getLinkId() везде (getStagesForOrder, getStatusConfig)
  103: - isOrderFree() теперь использует getLinkId() (унификация)
  104: - favorites нормализация: все ID приводятся к строке через getLinkId()
  105: - MyTablesModal использует getLinkId() для сравнений
  108: - getAssigneeId() теперь использует getLinkId() (унификация)
  112: - getLinkId() финальный: null-check (== null), консистентный String() везде
  115: - getLinkId() типобезопасный: string/number/object/value-object
  118: - getLinkId() расширен: теперь обрабатывает _id и value (не только id)
  122: - P0-1: Applied getLinkId() everywhere for order.table, order.stage_id, req.table
  133: - D1: getLinkId helper for normalizing link fields
  546: function getLinkId(field) {
  806: const uniqueGuests = (orders) => new Set(orders.map(o => getLinkId(o.guest))).size;
  813: return getLinkId(order.assignee);
  817: return !getLinkId(order.assignee);
 1114: const orderStageId = getLinkId(order.stage_id);
 1118: const currentStage = stages.find(s => getLinkId(s.id) === orderStageId);
 1119: if (currentStage && !filtered.find(s => getLinkId(s.id) === getLinkId(currentStage.id))) {
 1135: r => getLinkId(r.table) === group.id
 1149: const allFree = orders.every(o => !getLinkId(o.assignee));
 1529: const reqTableId = getLinkId(request.table);
 1583: const tableId = getLinkId(order.table);
 1584: const tableSessionId = getLinkId(order.table_session);
 1585: const guestId = getLinkId(order.guest);
 1772: const sid = getLinkId(order.stage_id) || "__null__";
 1779: const index = orderStages.findIndex((stage) => getLinkId(stage.id) === sid);
 1877: return (activeRequests || []).filter((request) => getLinkId(request.table) === group.id);
 1948: const snapshots = orders.map((order) => ({ orderId: order.id, prevStatus: order.status, prevStageId: getLinkId(order.stage_id) }));
 2008: const guestId = getLinkId(order.guest);
 2025: const gid = getLinkId(order.guest) || "__default";
 2168: (o) => o.status !== 'closed' && o.status !== 'cancelled' && getLinkId(o.table_session)

codex
I’ve finished the review. I’m saving the report and the command log into `pages/StaffOrdersMobile/` now, then I’ll return the findings in the required reviewer format.
apply patch
patch: completed
C:\Users\ASUS\Dev\Menu AI Cowork\menuapp-code-review\pages\StaffOrdersMobile\commands_2026-04-17.log
C:\Users\ASUS\Dev\Menu AI Cowork\menuapp-code-review\pages\StaffOrdersMobile\review_2026-04-17.md
diff --git a/pages/StaffOrdersMobile/commands_2026-04-17.log b/pages/StaffOrdersMobile/commands_2026-04-17.log
new file mode 100644
index 0000000000000000000000000000000000000000..f36ef37a53b22193bf950503ea15566b555b837a
--- /dev/null
+++ b/pages/StaffOrdersMobile/commands_2026-04-17.log
@@ -0,0 +1,33 @@
+1. Get-Content -Raw 'C:\Users\ASUS\Dev\Menu AI Cowork\pipeline\task-260417-081550-002.prompt'
+2. $lines = Get-Content 'C:\Users\ASUS\Dev\Menu AI Cowork\pipeline\task-260417-081550-002.prompt'; $lines | Select-Object -First 350
+3. $lines = Get-Content 'C:\Users\ASUS\Dev\Menu AI Cowork\pipeline\task-260417-081550-002.prompt'; $lines | Select-Object -Skip 350 -First 350
+4. $lines = Get-Content 'C:\Users\ASUS\Dev\Menu AI Cowork\pipeline\task-260417-081550-002.prompt'; $lines | Select-Object -Skip 700 -First 350
+5. $lines = Get-Content 'C:\Users\ASUS\Dev\Menu AI Cowork\pipeline\task-260417-081550-002.prompt'; $lines | Select-Object -Skip 1050 -First 350
+6. @'
+function Show-Range($path, $start, $end, $label) {
+  Write-Output "=== $label ($start-$end) ==="
+  $i = 0
+  [System.IO.File]::ReadLines($path) | ForEach-Object {
+    $i++
+    if ($i -ge $start -and $i -le $end) { '{0,5}: {1}' -f $i, $_ }
+    elseif ($i -gt $end) { break }
+  }
+}
+$path = 'C:\Users\ASUS\Dev\Menu AI Cowork\menuapp-code-review\pages\StaffOrdersMobile\staffordersmobile.jsx'
+Show-Range $path 1 25 'imports'
+Show-Range $path 560 575 'comment-candidate-1'
+Show-Range $path 1168 1180 'comment-candidate-2'
+Show-Range $path 2285 2298 'live-data-group-id'
+Show-Range $path 2818 2830 'banner-dispatch'
+Show-Range $path 3490 3565 'orders-openSessions-openSessionByTableId'
+Show-Range $path 3590 3620 'activeOrders'
+Show-Range $path 3765 3910 'orderGroups-filteredGroups-tabCounts'
+Show-Range $path 4075 4205 'buildBannerInfo-handleBannerNavigate-confirmCloseTable'
+Show-Range $path 4455 4490 'orderGroupCard-map'
+Show-Range $path 4605 4615 'banner-prop-pass'
+'@ | powershell -NoProfile -Command -
+7. function Show-Range($path, $start, $end, $label) { Write-Output "=== $label ($start-$end) ==="; $i = 0; [System.IO.File]::ReadLines($path) | ForEach-Object { $i++; if ($i -ge $start -and $i -le $end) { '{0,5}: {1}' -f $i, $_ } elseif ($i -gt $end) { break } } }; $path = 'C:\Users\ASUS\Dev\Menu AI Cowork\menuapp-code-review\pages\StaffOrdersMobile\staffordersmobile.jsx'; Show-Range $path 1 25 'imports'; Show-Range $path 560 575 'comment-candidate-1'; Show-Range $path 1168 1180 'comment-candidate-2'; Show-Range $path 2285 2298 'live-data-group-id'; Show-Range $path 2818 2830 'banner-dispatch'; Show-Range $path 3490 3565 'orders-openSessions-openSessionByTableId'; Show-Range $path 3590 3620 'activeOrders'; Show-Range $path 3765 3910 'orderGroups-filteredGroups-tabCounts'; Show-Range $path 4075 4205 'buildBannerInfo-handleBannerNavigate-confirmCloseTable'; Show-Range $path 4455 4490 'orderGroupCard-map'; Show-Range $path 4605 4615 'banner-prop-pass'
+8. function Show-Range($lines, $start, $end, $label) { Write-Output "=== $label ($start-$end) ==="; for ($i = $start; $i -le $end -and $i -le $lines.Length; $i++) { '{0,5}: {1}' -f $i, $lines[$i-1] } }; $path = 'C:\Users\ASUS\Dev\Menu AI Cowork\menuapp-code-review\pages\StaffOrdersMobile\staffordersmobile.jsx'; $lines = [System.IO.File]::ReadAllLines($path); Show-Range $lines 26 40 'imports-continued'; Show-Range $lines 560 575 'comment-candidate-1'; Show-Range $lines 1168 1180 'comment-candidate-2'; Show-Range $lines 2285 2298 'live-data-group-id'; Show-Range $lines 2818 2830 'banner-dispatch'; Show-Range $lines 3490 3565 'orders-openSessions-openSessionByTableId'; Show-Range $lines 3590 3620 'activeOrders'; Show-Range $lines 3765 3910 'orderGroups-filteredGroups-tabCounts'; Show-Range $lines 4075 4205 'buildBannerInfo-handleBannerNavigate-confirmCloseTable'; Show-Range $lines 4455 4490 'orderGroupCard-map'; Show-Range $lines 4605 4615 'banner-prop-pass'
+9. function Show-Range($path, $start, $end, $label) { $lines = [System.IO.File]::ReadAllLines($path); Write-Output "=== $label ($start-$end) ==="; for ($i = $start; $i -le $end -and $i -le $lines.Length; $i++) { '{0,5}: {1}' -f $i, $lines[$i-1] } }; $staff = 'C:\Users\ASUS\Dev\Menu AI Cowork\menuapp-code-review\pages\StaffOrdersMobile\staffordersmobile.jsx'; $session = 'C:\Users\ASUS\Dev\Menu AI Cowork\menuapp-code-review\components\sessionHelpers.js'; Write-Output '=== staff pattern hits ==='; Select-String -Path $staff -Pattern "from 'react'","useQueryClient","handleCloseTableClick","const queryClient = useQueryClient","setExpandedGroups","toggleGroupExpand" | ForEach-Object { '{0,5}: {1}' -f $_.LineNumber, $_.Line.Trim() }; Show-Range $session 65 95 'sessionHelpers-getOrCreateSession'; Show-Range $session 154 180 'sessionHelpers-closeSession'
+10. function Show-Range($path, $start, $end, $label) { $lines = [System.IO.File]::ReadAllLines($path); Write-Output "=== $label ($start-$end) ==="; for ($i = $start; $i -le $end -and $i -le $lines.Length; $i++) { '{0,5}: {1}' -f $i, $lines[$i-1] } }; $staff = 'C:\Users\ASUS\Dev\Menu AI Cowork\menuapp-code-review\pages\StaffOrdersMobile\staffordersmobile.jsx'; Show-Range $staff 145 170 'react-and-query-imports'; Show-Range $staff 1574 1588 'queryClient-hit-1'; Show-Range $staff 1742 1755 'queryClient-hit-2'; Show-Range $staff 2878 2892 'queryClient-hit-3'; Write-Output '=== useRef count ==='; ([regex]::Matches([System.IO.File]::ReadAllText($staff),'\buseRef\b')).Count
+11. $staff = 'C:\Users\ASUS\Dev\Menu AI Cowork\menuapp-code-review\pages\StaffOrdersMobile\staffordersmobile.jsx'; Select-String -Path $staff -Pattern 'getLinkId','expandedGroupId','setExpandedGroupId' | ForEach-Object { '{0,5}: {1}' -f $_.LineNumber, $_.Line.Trim() } | Select-Object -First 30
diff --git a/pages/StaffOrdersMobile/review_2026-04-17.md b/pages/StaffOrdersMobile/review_2026-04-17.md
new file mode 100644
index 0000000000000000000000000000000000000000..a35b9145b583154609287e956824d78fdbf2f433
--- /dev/null
+++ b/pages/StaffOrdersMobile/review_2026-04-17.md
@@ -0,0 +1,30 @@
+# Codex Reviewer Findings — ПССК Prompt Quality Review
+Chain: staffordersmobile-260417-081549-67a0
+
+## Issues Found
+1. [MEDIUM] `queryClient` verification anchor points at the wrong scope — the prompt says `grep -n "const queryClient = useQueryClient"` should return exactly 1 hit, but the source has three live hits at `staffordersmobile.jsx:1581`, `staffordersmobile.jsx:1749`, and `staffordersmobile.jsx:2883`. A writer following the current STOP rule can halt a correct run or patch the wrong component. PROMPT FIX: scope this check to the main component by anchoring around `export default function StaffOrdersMobile()` / the `2882-2884` range, or change the expectation to `>=1` globally plus a manual confirmation of the main-component hit.
+2. [MEDIUM] Optional vs required fix scope is internally inconsistent — the prompt says the minimal working combination is `Fix A + Fix B.1-B.5`, says `Fix C` is desirable-only if safe, and treats `Fix B.6` as an edge-case follow-up. Later, Safety Guards require changes in 8 locations including `handleBannerNavigate` and the new orphan-invalidate effect, and the prescribed commit message assumes orphan invalidate shipped. That contradiction can make a correct minimal implementation look like a failure. PROMPT FIX: choose one contract and propagate it consistently across `Priority hierarchy`, `Minimal working combination`, `Safety Guards`, and the commit-message guidance.
+3. [MEDIUM] React import pre-check does not match the real source — the prompt tells the executor to grep `from 'react'` and provides a single-line replacement example without the default `React` import. In the actual file the live import is `import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";` at `staffordersmobile.jsx:159`, so the quoted grep returns 0 hits and the literal example does not match the source. PROMPT FIX: use a quote-agnostic anchor such as `from ['\"]react['\"]`, and tell the writer to extend the exact existing import line while preserving the default `React` import and quote style.
+
+## Summary
+Total: 3 issues (0 CRITICAL, 3 MEDIUM, 0 LOW)
+
+## Additional Risks
+The source file mixes live code, large commented snapshots, and multiple component-level hook scopes. Exact whole-file hit-count gates are therefore brittle; future prompt checks should prefer component-scoped ranges over global grep counts whenever a symbol can legitimately appear in more than one live component.
+
+## Prompt Clarity (MANDATORY — do NOT skip)
+- Overall clarity: 3
+- What was most clear: The root-cause writeup, the identifier contract for `tableId` vs `compositeKey`, and the live-vs-comment `data-group-id` distinction are concrete and source-aligned.
+- What was ambiguous or could cause hesitation: Whether `Fix B.6` and `Fix C` are optional or mandatory, which `queryClient` hit the writer should treat as authoritative, and why the React import pre-check would fail against valid source.
+- Missing context: An explicit main-component anchor for `queryClient/useQueryClient` and a quote-agnostic React import anchor.
+
+## Fix Ratings (MANDATORY — ALWAYS include this section, even if no issues found)
+Rate each Fix mentioned in the prompt. Scale: 1=Rewrite needed, 2=Major issues, 3=Needs clarification, 4=Minor issues, 5=Clear.
+
+| Fix | Rating (1-5) | Verdict | Key issue (if any) |
+|-----|-------------|---------|-------------------|
+| Fix A | 5/5 | Clear | No material prompt issue found in the staleTime change itself. |
+| Fix B | 3/5 | Needs clarification | `Fix B.6` is described as skippable in one section and effectively mandatory in later safety gates. |
+| Fix C | 2/5 | Major issues | The `queryClient` hit-count check and React import anchor do not match the current source and can trigger false STOPs. |
+
+Overall prompt verdict: NEEDS REVISION

diff --git a/pages/StaffOrdersMobile/commands_2026-04-17.log b/pages/StaffOrdersMobile/commands_2026-04-17.log
new file mode 100644
index 0000000000000000000000000000000000000000..f36ef37a53b22193bf950503ea15566b555b837a
--- /dev/null
+++ b/pages/StaffOrdersMobile/commands_2026-04-17.log
@@ -0,0 +1,33 @@
+1. Get-Content -Raw 'C:\Users\ASUS\Dev\Menu AI Cowork\pipeline\task-260417-081550-002.prompt'
+2. $lines = Get-Content 'C:\Users\ASUS\Dev\Menu AI Cowork\pipeline\task-260417-081550-002.prompt'; $lines | Select-Object -First 350
+3. $lines = Get-Content 'C:\Users\ASUS\Dev\Menu AI Cowork\pipeline\task-260417-081550-002.prompt'; $lines | Select-Object -Skip 350 -First 350
+4. $lines = Get-Content 'C:\Users\ASUS\Dev\Menu AI Cowork\pipeline\task-260417-081550-002.prompt'; $lines | Select-Object -Skip 700 -First 350
+5. $lines = Get-Content 'C:\Users\ASUS\Dev\Menu AI Cowork\pipeline\task-260417-081550-002.prompt'; $lines | Select-Object -Skip 1050 -First 350
+6. @'
+function Show-Range($path, $start, $end, $label) {
+  Write-Output "=== $label ($start-$end) ==="
+  $i = 0
+  [System.IO.File]::ReadLines($path) | ForEach-Object {
+    $i++
+    if ($i -ge $start -and $i -le $end) { '{0,5}: {1}' -f $i, $_ }
+    elseif ($i -gt $end) { break }
+  }
+}
+$path = 'C:\Users\ASUS\Dev\Menu AI Cowork\menuapp-code-review\pages\StaffOrdersMobile\staffordersmobile.jsx'
+Show-Range $path 1 25 'imports'
+Show-Range $path 560 575 'comment-candidate-1'
+Show-Range $path 1168 1180 'comment-candidate-2'
+Show-Range $path 2285 2298 'live-data-group-id'
+Show-Range $path 2818 2830 'banner-dispatch'
+Show-Range $path 3490 3565 'orders-openSessions-openSessionByTableId'
+Show-Range $path 3590 3620 'activeOrders'
+Show-Range $path 3765 3910 'orderGroups-filteredGroups-tabCounts'
+Show-Range $path 4075 4205 'buildBannerInfo-handleBannerNavigate-confirmCloseTable'
+Show-Range $path 4455 4490 'orderGroupCard-map'
+Show-Range $path 4605 4615 'banner-prop-pass'
+'@ | powershell -NoProfile -Command -
+7. function Show-Range($path, $start, $end, $label) { Write-Output "=== $label ($start-$end) ==="; $i = 0; [System.IO.File]::ReadLines($path) | ForEach-Object { $i++; if ($i -ge $start -and $i -le $end) { '{0,5}: {1}' -f $i, $_ } elseif ($i -gt $end) { break } } }; $path = 'C:\Users\ASUS\Dev\Menu AI Cowork\menuapp-code-review\pages\StaffOrdersMobile\staffordersmobile.jsx'; Show-Range $path 1 25 'imports'; Show-Range $path 560 575 'comment-candidate-1'; Show-Range $path 1168 1180 'comment-candidate-2'; Show-Range $path 2285 2298 'live-data-group-id'; Show-Range $path 2818 2830 'banner-dispatch'; Show-Range $path 3490 3565 'orders-openSessions-openSessionByTableId'; Show-Range $path 3590 3620 'activeOrders'; Show-Range $path 3765 3910 'orderGroups-filteredGroups-tabCounts'; Show-Range $path 4075 4205 'buildBannerInfo-handleBannerNavigate-confirmCloseTable'; Show-Range $path 4455 4490 'orderGroupCard-map'; Show-Range $path 4605 4615 'banner-prop-pass'
+8. function Show-Range($lines, $start, $end, $label) { Write-Output "=== $label ($start-$end) ==="; for ($i = $start; $i -le $end -and $i -le $lines.Length; $i++) { '{0,5}: {1}' -f $i, $lines[$i-1] } }; $path = 'C:\Users\ASUS\Dev\Menu AI Cowork\menuapp-code-review\pages\StaffOrdersMobile\staffordersmobile.jsx'; $lines = [System.IO.File]::ReadAllLines($path); Show-Range $lines 26 40 'imports-continued'; Show-Range $lines 560 575 'comment-candidate-1'; Show-Range $lines 1168 1180 'comment-candidate-2'; Show-Range $lines 2285 2298 'live-data-group-id'; Show-Range $lines 2818 2830 'banner-dispatch'; Show-Range $lines 3490 3565 'orders-openSessions-openSessionByTableId'; Show-Range $lines 3590 3620 'activeOrders'; Show-Range $lines 3765 3910 'orderGroups-filteredGroups-tabCounts'; Show-Range $lines 4075 4205 'buildBannerInfo-handleBannerNavigate-confirmCloseTable'; Show-Range $lines 4455 4490 'orderGroupCard-map'; Show-Range $lines 4605 4615 'banner-prop-pass'
+9. function Show-Range($path, $start, $end, $label) { $lines = [System.IO.File]::ReadAllLines($path); Write-Output "=== $label ($start-$end) ==="; for ($i = $start; $i -le $end -and $i -le $lines.Length; $i++) { '{0,5}: {1}' -f $i, $lines[$i-1] } }; $staff = 'C:\Users\ASUS\Dev\Menu AI Cowork\menuapp-code-review\pages\StaffOrdersMobile\staffordersmobile.jsx'; $session = 'C:\Users\ASUS\Dev\Menu AI Cowork\menuapp-code-review\components\sessionHelpers.js'; Write-Output '=== staff pattern hits ==='; Select-String -Path $staff -Pattern "from 'react'","useQueryClient","handleCloseTableClick","const queryClient = useQueryClient","setExpandedGroups","toggleGroupExpand" | ForEach-Object { '{0,5}: {1}' -f $_.LineNumber, $_.Line.Trim() }; Show-Range $session 65 95 'sessionHelpers-getOrCreateSession'; Show-Range $session 154 180 'sessionHelpers-closeSession'
+10. function Show-Range($path, $start, $end, $label) { $lines = [System.IO.File]::ReadAllLines($path); Write-Output "=== $label ($start-$end) ==="; for ($i = $start; $i -le $end -and $i -le $lines.Length; $i++) { '{0,5}: {1}' -f $i, $lines[$i-1] } }; $staff = 'C:\Users\ASUS\Dev\Menu AI Cowork\menuapp-code-review\pages\StaffOrdersMobile\staffordersmobile.jsx'; Show-Range $staff 145 170 'react-and-query-imports'; Show-Range $staff 1574 1588 'queryClient-hit-1'; Show-Range $staff 1742 1755 'queryClient-hit-2'; Show-Range $staff 2878 2892 'queryClient-hit-3'; Write-Output '=== useRef count ==='; ([regex]::Matches([System.IO.File]::ReadAllText($staff),'\buseRef\b')).Count
+11. $staff = 'C:\Users\ASUS\Dev\Menu AI Cowork\menuapp-code-review\pages\StaffOrdersMobile\staffordersmobile.jsx'; Select-String -Path $staff -Pattern 'getLinkId','expandedGroupId','setExpandedGroupId' | ForEach-Object { '{0,5}: {1}' -f $_.LineNumber, $_.Line.Trim() } | Select-Object -First 30
diff --git a/pages/StaffOrdersMobile/review_2026-04-17.md b/pages/StaffOrdersMobile/review_2026-04-17.md
new file mode 100644
index 0000000000000000000000000000000000000000..a35b9145b583154609287e956824d78fdbf2f433
--- /dev/null
+++ b/pages/StaffOrdersMobile/review_2026-04-17.md
@@ -0,0 +1,30 @@
+# Codex Reviewer Findings — ПССК Prompt Quality Review
+Chain: staffordersmobile-260417-081549-67a0
+
+## Issues Found
+1. [MEDIUM] `queryClient` verification anchor points at the wrong scope — the prompt says `grep -n "const queryClient = useQueryClient"` should return exactly 1 hit, but the source has three live hits at `staffordersmobile.jsx:1581`, `staffordersmobile.jsx:1749`, and `staffordersmobile.jsx:2883`. A writer following the current STOP rule can halt a correct run or patch the wrong component. PROMPT FIX: scope this check to the main component by anchoring around `export default function StaffOrdersMobile()` / the `2882-2884` range, or change the expectation to `>=1` globally plus a manual confirmation of the main-component hit.
+2. [MEDIUM] Optional vs required fix scope is internally inconsistent — the prompt says the minimal working combination is `Fix A + Fix B.1-B.5`, says `Fix C` is desirable-only if safe, and treats `Fix B.6` as an edge-case follow-up. Later, Safety Guards require changes in 8 locations including `handleBannerNavigate` and the new orphan-invalidate effect, and the prescribed commit message assumes orphan invalidate shipped. That contradiction can make a correct minimal implementation look like a failure. PROMPT FIX: choose one contract and propagate it consistently across `Priority hierarchy`, `Minimal working combination`, `Safety Guards`, and the commit-message guidance.
+3. [MEDIUM] React import pre-check does not match the real source — the prompt tells the executor to grep `from 'react'` and provides a single-line replacement example without the default `React` import. In the actual file the live import is `import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";` at `staffordersmobile.jsx:159`, so the quoted grep returns 0 hits and the literal example does not match the source. PROMPT FIX: use a quote-agnostic anchor such as `from ['\"]react['\"]`, and tell the writer to extend the exact existing import line while preserving the default `React` import and quote style.
+
+## Summary
+Total: 3 issues (0 CRITICAL, 3 MEDIUM, 0 LOW)
+
+## Additional Risks
+The source file mixes live code, large commented snapshots, and multiple component-level hook scopes. Exact whole-file hit-count gates are therefore brittle; future prompt checks should prefer component-scoped ranges over global grep counts whenever a symbol can legitimately appear in more than one live component.
+
+## Prompt Clarity (MANDATORY — do NOT skip)
+- Overall clarity: 3
+- What was most clear: The root-cause writeup, the identifier contract for `tableId` vs `compositeKey`, and the live-vs-comment `data-group-id` distinction are concrete and source-aligned.
+- What was ambiguous or could cause hesitation: Whether `Fix B.6` and `Fix C` are optional or mandatory, which `queryClient` hit the writer should treat as authoritative, and why the React import pre-check would fail against valid source.
+- Missing context: An explicit main-component anchor for `queryClient/useQueryClient` and a quote-agnostic React import anchor.
+
+## Fix Ratings (MANDATORY — ALWAYS include this section, even if no issues found)
+Rate each Fix mentioned in the prompt. Scale: 1=Rewrite needed, 2=Major issues, 3=Needs clarification, 4=Minor issues, 5=Clear.
+
+| Fix | Rating (1-5) | Verdict | Key issue (if any) |
+|-----|-------------|---------|-------------------|
+| Fix A | 5/5 | Clear | No material prompt issue found in the staleTime change itself. |
+| Fix B | 3/5 | Needs clarification | `Fix B.6` is described as skippable in one section and effectively mandatory in later safety gates. |
+| Fix C | 2/5 | Major issues | The `queryClient` hit-count check and React import anchor do not match the current source and can trigger false STOPs. |
+
+Overall prompt verdict: NEEDS REVISION

codex
# Codex Reviewer Findings — ПССК Prompt Quality Review
Chain: staffordersmobile-260417-081549-67a0

## Issues Found
1. [MEDIUM] `queryClient` verification anchor points at the wrong scope — the prompt says `grep -n "const queryClient = useQueryClient"` should return exactly 1 hit, but the source has three live hits at `staffordersmobile.jsx:1581`, `staffordersmobile.jsx:1749`, and `staffordersmobile.jsx:2883`. A writer following the current STOP rule can halt a correct run or patch the wrong component. PROMPT FIX: scope this check to the main component by anchoring around `export default function StaffOrdersMobile()` / the `2882-2884` range, or change the expectation to `>=1` globally plus a manual confirmation of the main-component hit.

2. [MEDIUM] Optional vs required fix scope is internally inconsistent — the prompt says the minimal working combination is `Fix A + Fix B.1-B.5`, says `Fix C` is desirable-only if safe, and treats `Fix B.6` as an edge-case follow-up. Later, Safety Guards require changes in 8 locations including `handleBannerNavigate` and the new orphan-invalidate effect, and the prescribed commit message assumes orphan invalidate shipped. That contradiction can make a correct minimal implementation look like a failure. PROMPT FIX: choose one contract and propagate it consistently across `Priority hierarchy`, `Minimal working combination`, `Safety Guards`, and the commit-message guidance.

3. [MEDIUM] React import pre-check does not match the real source — the prompt tells the executor to grep `from 'react'` and provides a single-line replacement example without the default `React` import. In the actual file the live import is `import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";` at `staffordersmobile.jsx:159`, so the quoted grep returns 0 hits and the literal example does not match the source. PROMPT FIX: use a quote-agnostic anchor such as `from ['\"]react['\"]`, and tell the writer to extend the exact existing import line while preserving the default `React` import and quote style.

## Summary
Total: 3 issues (0 CRITICAL, 3 MEDIUM, 0 LOW)

## Additional Risks
The source file mixes live code, large commented snapshots, and multiple component-level hook scopes. Exact whole-file hit-count gates are therefore brittle; future prompt checks should prefer component-scoped ranges over global grep counts whenever a symbol can legitimately appear in more than one live component.

## Prompt Clarity (MANDATORY — do NOT skip)
- Overall clarity: 3
- What was most clear: The root-cause writeup, the identifier contract for `tableId` vs `compositeKey`, and the live-vs-comment `data-group-id` distinction are concrete and source-aligned.
- What was ambiguous or could cause hesitation: Whether `Fix B.6` and `Fix C` are optional or mandatory, which `queryClient` hit the writer should treat as authoritative, and why the React import pre-check would fail against valid source.
- Missing context: An explicit main-component anchor for `queryClient/useQueryClient` and a quote-agnostic React import anchor.

## Fix Ratings (MANDATORY — ALWAYS include this section, even if no issues found)
Rate each Fix mentioned in the prompt. Scale: 1=Rewrite needed, 2=Major issues, 3=Needs clarification, 4=Minor issues, 5=Clear.

| Fix | Rating (1-5) | Verdict | Key issue (if any) |
|-----|-------------|---------|-------------------|
| Fix A | 5/5 | Clear | No material prompt issue found in the staleTime change itself. |
| Fix B | 3/5 | Needs clarification | `Fix B.6` is described as skippable in one section and effectively mandatory in later safety gates. |
| Fix C | 2/5 | Major issues | The `queryClient` hit-count check and React import anchor do not match the current source and can trigger false STOPs. |

Overall prompt verdict: NEEDS REVISION
diff --git a/pages/StaffOrdersMobile/commands_2026-04-17.log b/pages/StaffOrdersMobile/commands_2026-04-17.log
new file mode 100644
index 0000000000000000000000000000000000000000..f36ef37a53b22193bf950503ea15566b555b837a
--- /dev/null
+++ b/pages/StaffOrdersMobile/commands_2026-04-17.log
@@ -0,0 +1,33 @@
+1. Get-Content -Raw 'C:\Users\ASUS\Dev\Menu AI Cowork\pipeline\task-260417-081550-002.prompt'
+2. $lines = Get-Content 'C:\Users\ASUS\Dev\Menu AI Cowork\pipeline\task-260417-081550-002.prompt'; $lines | Select-Object -First 350
+3. $lines = Get-Content 'C:\Users\ASUS\Dev\Menu AI Cowork\pipeline\task-260417-081550-002.prompt'; $lines | Select-Object -Skip 350 -First 350
+4. $lines = Get-Content 'C:\Users\ASUS\Dev\Menu AI Cowork\pipeline\task-260417-081550-002.prompt'; $lines | Select-Object -Skip 700 -First 350
+5. $lines = Get-Content 'C:\Users\ASUS\Dev\Menu AI Cowork\pipeline\task-260417-081550-002.prompt'; $lines | Select-Object -Skip 1050 -First 350
+6. @'
+function Show-Range($path, $start, $end, $label) {
+  Write-Output "=== $label ($start-$end) ==="
+  $i = 0
+  [System.IO.File]::ReadLines($path) | ForEach-Object {
+    $i++
+    if ($i -ge $start -and $i -le $end) { '{0,5}: {1}' -f $i, $_ }
+    elseif ($i -gt $end) { break }
+  }
+}
+$path = 'C:\Users\ASUS\Dev\Menu AI Cowork\menuapp-code-review\pages\StaffOrdersMobile\staffordersmobile.jsx'
+Show-Range $path 1 25 'imports'
+Show-Range $path 560 575 'comment-candidate-1'
+Show-Range $path 1168 1180 'comment-candidate-2'
+Show-Range $path 2285 2298 'live-data-group-id'
+Show-Range $path 2818 2830 'banner-dispatch'
+Show-Range $path 3490 3565 'orders-openSessions-openSessionByTableId'
+Show-Range $path 3590 3620 'activeOrders'
+Show-Range $path 3765 3910 'orderGroups-filteredGroups-tabCounts'
+Show-Range $path 4075 4205 'buildBannerInfo-handleBannerNavigate-confirmCloseTable'
+Show-Range $path 4455 4490 'orderGroupCard-map'
+Show-Range $path 4605 4615 'banner-prop-pass'
+'@ | powershell -NoProfile -Command -
+7. function Show-Range($path, $start, $end, $label) { Write-Output "=== $label ($start-$end) ==="; $i = 0; [System.IO.File]::ReadLines($path) | ForEach-Object { $i++; if ($i -ge $start -and $i -le $end) { '{0,5}: {1}' -f $i, $_ } elseif ($i -gt $end) { break } } }; $path = 'C:\Users\ASUS\Dev\Menu AI Cowork\menuapp-code-review\pages\StaffOrdersMobile\staffordersmobile.jsx'; Show-Range $path 1 25 'imports'; Show-Range $path 560 575 'comment-candidate-1'; Show-Range $path 1168 1180 'comment-candidate-2'; Show-Range $path 2285 2298 'live-data-group-id'; Show-Range $path 2818 2830 'banner-dispatch'; Show-Range $path 3490 3565 'orders-openSessions-openSessionByTableId'; Show-Range $path 3590 3620 'activeOrders'; Show-Range $path 3765 3910 'orderGroups-filteredGroups-tabCounts'; Show-Range $path 4075 4205 'buildBannerInfo-handleBannerNavigate-confirmCloseTable'; Show-Range $path 4455 4490 'orderGroupCard-map'; Show-Range $path 4605 4615 'banner-prop-pass'
+8. function Show-Range($lines, $start, $end, $label) { Write-Output "=== $label ($start-$end) ==="; for ($i = $start; $i -le $end -and $i -le $lines.Length; $i++) { '{0,5}: {1}' -f $i, $lines[$i-1] } }; $path = 'C:\Users\ASUS\Dev\Menu AI Cowork\menuapp-code-review\pages\StaffOrdersMobile\staffordersmobile.jsx'; $lines = [System.IO.File]::ReadAllLines($path); Show-Range $lines 26 40 'imports-continued'; Show-Range $lines 560 575 'comment-candidate-1'; Show-Range $lines 1168 1180 'comment-candidate-2'; Show-Range $lines 2285 2298 'live-data-group-id'; Show-Range $lines 2818 2830 'banner-dispatch'; Show-Range $lines 3490 3565 'orders-openSessions-openSessionByTableId'; Show-Range $lines 3590 3620 'activeOrders'; Show-Range $lines 3765 3910 'orderGroups-filteredGroups-tabCounts'; Show-Range $lines 4075 4205 'buildBannerInfo-handleBannerNavigate-confirmCloseTable'; Show-Range $lines 4455 4490 'orderGroupCard-map'; Show-Range $lines 4605 4615 'banner-prop-pass'
+9. function Show-Range($path, $start, $end, $label) { $lines = [System.IO.File]::ReadAllLines($path); Write-Output "=== $label ($start-$end) ==="; for ($i = $start; $i -le $end -and $i -le $lines.Length; $i++) { '{0,5}: {1}' -f $i, $lines[$i-1] } }; $staff = 'C:\Users\ASUS\Dev\Menu AI Cowork\menuapp-code-review\pages\StaffOrdersMobile\staffordersmobile.jsx'; $session = 'C:\Users\ASUS\Dev\Menu AI Cowork\menuapp-code-review\components\sessionHelpers.js'; Write-Output '=== staff pattern hits ==='; Select-String -Path $staff -Pattern "from 'react'","useQueryClient","handleCloseTableClick","const queryClient = useQueryClient","setExpandedGroups","toggleGroupExpand" | ForEach-Object { '{0,5}: {1}' -f $_.LineNumber, $_.Line.Trim() }; Show-Range $session 65 95 'sessionHelpers-getOrCreateSession'; Show-Range $session 154 180 'sessionHelpers-closeSession'
+10. function Show-Range($path, $start, $end, $label) { $lines = [System.IO.File]::ReadAllLines($path); Write-Output "=== $label ($start-$end) ==="; for ($i = $start; $i -le $end -and $i -le $lines.Length; $i++) { '{0,5}: {1}' -f $i, $lines[$i-1] } }; $staff = 'C:\Users\ASUS\Dev\Menu AI Cowork\menuapp-code-review\pages\StaffOrdersMobile\staffordersmobile.jsx'; Show-Range $staff 145 170 'react-and-query-imports'; Show-Range $staff 1574 1588 'queryClient-hit-1'; Show-Range $staff 1742 1755 'queryClient-hit-2'; Show-Range $staff 2878 2892 'queryClient-hit-3'; Write-Output '=== useRef count ==='; ([regex]::Matches([System.IO.File]::ReadAllText($staff),'\buseRef\b')).Count
+11. $staff = 'C:\Users\ASUS\Dev\Menu AI Cowork\menuapp-code-review\pages\StaffOrdersMobile\staffordersmobile.jsx'; Select-String -Path $staff -Pattern 'getLinkId','expandedGroupId','setExpandedGroupId' | ForEach-Object { '{0,5}: {1}' -f $_.LineNumber, $_.Line.Trim() } | Select-Object -First 30
diff --git a/pages/StaffOrdersMobile/review_2026-04-17.md b/pages/StaffOrdersMobile/review_2026-04-17.md
new file mode 100644
index 0000000000000000000000000000000000000000..a35b9145b583154609287e956824d78fdbf2f433
--- /dev/null
+++ b/pages/StaffOrdersMobile/review_2026-04-17.md
@@ -0,0 +1,30 @@
+# Codex Reviewer Findings — ПССК Prompt Quality Review
+Chain: staffordersmobile-260417-081549-67a0
+
+## Issues Found
+1. [MEDIUM] `queryClient` verification anchor points at the wrong scope — the prompt says `grep -n "const queryClient = useQueryClient"` should return exactly 1 hit, but the source has three live hits at `staffordersmobile.jsx:1581`, `staffordersmobile.jsx:1749`, and `staffordersmobile.jsx:2883`. A writer following the current STOP rule can halt a correct run or patch the wrong component. PROMPT FIX: scope this check to the main component by anchoring around `export default function StaffOrdersMobile()` / the `2882-2884` range, or change the expectation to `>=1` globally plus a manual confirmation of the main-component hit.
+2. [MEDIUM] Optional vs required fix scope is internally inconsistent — the prompt says the minimal working combination is `Fix A + Fix B.1-B.5`, says `Fix C` is desirable-only if safe, and treats `Fix B.6` as an edge-case follow-up. Later, Safety Guards require changes in 8 locations including `handleBannerNavigate` and the new orphan-invalidate effect, and the prescribed commit message assumes orphan invalidate shipped. That contradiction can make a correct minimal implementation look like a failure. PROMPT FIX: choose one contract and propagate it consistently across `Priority hierarchy`, `Minimal working combination`, `Safety Guards`, and the commit-message guidance.
+3. [MEDIUM] React import pre-check does not match the real source — the prompt tells the executor to grep `from 'react'` and provides a single-line replacement example without the default `React` import. In the actual file the live import is `import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";` at `staffordersmobile.jsx:159`, so the quoted grep returns 0 hits and the literal example does not match the source. PROMPT FIX: use a quote-agnostic anchor such as `from ['\"]react['\"]`, and tell the writer to extend the exact existing import line while preserving the default `React` import and quote style.
+
+## Summary
+Total: 3 issues (0 CRITICAL, 3 MEDIUM, 0 LOW)
+
+## Additional Risks
+The source file mixes live code, large commented snapshots, and multiple component-level hook scopes. Exact whole-file hit-count gates are therefore brittle; future prompt checks should prefer component-scoped ranges over global grep counts whenever a symbol can legitimately appear in more than one live component.
+
+## Prompt Clarity (MANDATORY — do NOT skip)
+- Overall clarity: 3
+- What was most clear: The root-cause writeup, the identifier contract for `tableId` vs `compositeKey`, and the live-vs-comment `data-group-id` distinction are concrete and source-aligned.
+- What was ambiguous or could cause hesitation: Whether `Fix B.6` and `Fix C` are optional or mandatory, which `queryClient` hit the writer should treat as authoritative, and why the React import pre-check would fail against valid source.
+- Missing context: An explicit main-component anchor for `queryClient/useQueryClient` and a quote-agnostic React import anchor.
+
+## Fix Ratings (MANDATORY — ALWAYS include this section, even if no issues found)
+Rate each Fix mentioned in the prompt. Scale: 1=Rewrite needed, 2=Major issues, 3=Needs clarification, 4=Minor issues, 5=Clear.
+
+| Fix | Rating (1-5) | Verdict | Key issue (if any) |
+|-----|-------------|---------|-------------------|
+| Fix A | 5/5 | Clear | No material prompt issue found in the staleTime change itself. |
+| Fix B | 3/5 | Needs clarification | `Fix B.6` is described as skippable in one section and effectively mandatory in later safety gates. |
+| Fix C | 2/5 | Major issues | The `queryClient` hit-count check and React import anchor do not match the current source and can trigger false STOPs. |
+
+Overall prompt verdict: NEEDS REVISION
