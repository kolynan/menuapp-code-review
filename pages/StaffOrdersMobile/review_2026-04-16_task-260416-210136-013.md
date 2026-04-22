# Codex Reviewer Findings — ПССК Prompt Quality Review
Chain: staffordersmobile-260416-210134-4d89

## Issues Found
1. [CRITICAL] Fix B can close the wrong live session from a historical card — Prompt B.1 assigns `openSessionId = openSessionByTableId[tableId]?.id || null` to every per-session group, including closed-session groups (`pipeline/drafts/pssk-som-b2-1-260416-v6.md:442-455`, `482-495`). In the real source, every `OrderGroupCard` still receives `onCloseTable` and `onCloseAllOrders` (`pages/StaffOrdersMobile/staffordersmobile.jsx:4457-4475`), and `handleCloseTableClick` prefers `group.openSessionId` (`pages/StaffOrdersMobile/staffordersmobile.jsx:2164-2177`). After the split, tapping "Close table" on an old completed card would close the current open session for that table. PROMPT FIX: either set `openSessionId` only when `group.sessionId === openSessionByTableId[group.id]?.id`, or explicitly gate close actions so only the current-open-session card can close a table; relax the current "Do not touch handleCloseTableClick / other props" restriction enough to allow that repair.
2. [MEDIUM] Fix C is documented with a false hard dependency on Fix B — The prompt says Fix B must precede Fix C because Fix C "reads `group.sessionId`" (`pipeline/drafts/pssk-som-b2-1-260416-v6.md:214-216`, `803-806`), but the provided Fix C code only reads `orders`, `openSessionByTableId`, `queryClient`, and `getLinkId` (`pipeline/drafts/pssk-som-b2-1-260416-v6.md:901-937`). This creates avoidable confusion and can cause the writer to skip a safe standalone improvement after a partial Fix B failure. PROMPT FIX: rewrite the dependency note to reflect rollout priority only, or remove the `group.sessionId` dependency claim entirely.
3. [MEDIUM] The React import pre-check and fallback patch do not match the actual source import — Preparation §4 tells the writer to `grep -n "from 'react'"` and, if needed, add `useRef` to `import { useState, useEffect, useMemo, useCallback } from 'react';` (`pipeline/drafts/pssk-som-b2-1-260416-v6.md:115-126`, `944-950`). The real file uses `import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";` (`pages/StaffOrdersMobile/staffordersmobile.jsx:159`). The grep anchor will miss the existing import, and the fallback edit would drop the default `React` import if ever applied. PROMPT FIX: anchor on `from "react"` or `import React,`, preserve the default import, and note that `useRef` is already present in the current source.
4. [MEDIUM] Safety Guards reference a removed section, so the commit-message instruction has no source of truth — v6 explicitly says Deployment/TestPlan/Notes-for-reviewer were removed (`pipeline/drafts/pssk-som-b2-1-260416-v6.md:3`), but Safety Guards still say `Commit message как в Deployment §4` (`pipeline/drafts/pssk-som-b2-1-260416-v6.md:1075`). That leaves the writer without an actual commit-message specification at the final step. PROMPT FIX: inline the exact commit message in Safety Guards or restore the missing Deployment section reference.

## Summary
Total: 4 issues (1 CRITICAL, 3 MEDIUM, 0 LOW)

## Additional Risks
Fix B.6 still resolves banner navigation through `openSessionByTableId`. During the stale-session race, that can fall back to `tableId__no-session` even though Fix B.1 groups the new order under `tableId__<realSessionId>`, so banner scroll will still miss the new card until Fix C or the next open-sessions refresh lands.
The "8 locations only" diff guard omits the optional `useRef` import edit, so the guard becomes self-contradictory if a future variant actually needs that import change.

## Prompt Clarity (MANDATORY — do NOT skip)
- Overall clarity: 3/5
- What was most clear: The source anchors for `openSessions`, `orderGroups`, `filteredGroups`, `tabCounts`, and the identifier-contract table around `group.id` versus `group.compositeKey` are concrete and easy to verify.
- What was ambiguous or could cause hesitation: The prompt forbids touching close-table call-sites while its own `orderGroups` rewrite changes the meaning of `openSessionId`; Fix C is also described as depending on `group.sessionId` even though the snippet does not.
- Missing context: The prompt needs an explicit rule for which session card may surface close-table actions after the split, and it should inline the expected commit message instead of referencing a removed section.

## Fix Ratings (MANDATORY — ALWAYS include this section, even if no issues found)
Rate each Fix mentioned in the prompt. Scale: 1=Rewrite needed, 2=Major issues, 3=Needs clarification, 4=Minor issues, 5=Clear.

| Fix | Rating (1-5) | Verdict | Key issue (if any) |
|-----|-------------|---------|-------------------|
| Fix A | 5/5 | Clear | One-line staleTime change is well anchored and validated against the live source. |
| Fix B | 2/5 | Rewrite needed | Current `openSessionId` design would let a completed card close the wrong live session. |
| Fix C | 3/5 | Needs clarification | The code snippet is mostly workable, but the prompt states a false dependency on Fix B and uses a mismatched React-import pre-check. |

Overall prompt verdict: NEEDS REVISION
