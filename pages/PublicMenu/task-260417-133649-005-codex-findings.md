# Codex Reviewer Findings — ПССК Prompt Quality Review
Chain: pssk-cv-b2-260417-v15-260417-132855-c3b3

Note: Required writes to `C:/Users/ASUS/Dev/Menu AI Cowork/pipeline/...` were blocked by sandbox policy in this session. This is a fallback copy saved inside the workspace.

## Issues Found
1. [MEDIUM] Fix 4 acceptance criteria invert the cancel filter — Prompt line 1154 says `activeMyOrdersInSession = myOrdersInSession.filter(isCancelledOrder)`, but the Step 4.1 code block at line 1066 uses `myOrdersInSession.filter((o) => !isCancelledOrder(o))`, which matches the stated goal of excluding cancelled self-orders from both `selfTotal` and the render loop. This contradiction can make the executor or reviewer accept the opposite behavior. PROMPT FIX: change the AC to `activeMyOrdersInSession = myOrdersInSession.filter((o) => !isCancelledOrder(o))` and restate it as "active (non-cancelled) self orders."
2. [MEDIUM] Fix 3 acceptance criteria weaken the verified cancel predicate — Step 3.2 uses `sessionOrders.filter((o) => !isCancelledOrder(o))` (prompt lines 884-890) so terminal visibility ignores both raw `'cancelled'` and `stageInfo.internal_code === 'cancel'`. The AC at lines 998-999 rewrites that as `sessionOrders.filter(o.status !== 'cancelled')`, which is narrower than the proposed code and contradicts the v6/v10 rationale carried through Fixes 1 and 3. PROMPT FIX: align the AC with `!isCancelledOrder(o)` or say "exclude cancelled orders via the same normalized predicate as Fix 1."
3. [LOW] Fix 3 still contains a stale name-first comment after the code-first correction — Step 3.1 and the AC require `currentTable?.code || currentTable?.name || null` (prompt lines 845 and 1001), but the Step 3.2 comment at line 892 still says `currentTable?.name || currentTable?.code || null`. That makes the document internally inconsistent on the persistence key and creates avoidable review churn. PROMPT FIX: update the Step 3.2 comment to `currentTable?.code || currentTable?.name || null` or remove the restated expression.
4. [LOW] Fix 2 acceptance criteria omit the `otherGuestsExpanded` visibility precondition — The explanatory note at prompt lines 763-765 correctly says the per-item pending badge lives inside `{otherGuestsExpanded && ...}` and is intentionally hidden while the Table Orders card is collapsed. The AC at line 783 reduces this to "badge visible in Table tab," which can make a reviewer expect visibility in the collapsed state and falsely reject a correct implementation. PROMPT FIX: rewrite the AC to "When `otherGuestsExpanded` is opened, submitted orders in the Table tab show the pending badge."

## Summary
Total: 4 issues (0 CRITICAL, 2 MEDIUM, 2 LOW)

## Additional Risks
The prompt is otherwise strong on placement anchors and scope lock, but it is now detailed enough that snippet/AC drift is the main failure mode. A final consistency pass after each version bump should compare every Acceptance Criteria bullet against the exact replacement snippet for the same Fix.

## Prompt Clarity
- Overall clarity: 4
- What was most clear: The prompt is strong on source verification, content-based anchors, hook-order reasoning, and explicit scope locks around `showTableOrdersSection`, `otherGuestsExpanded`, and `currentTable?.status`.
- What was ambiguous or could cause hesitation: When an Acceptance Criteria bullet disagrees with the replacement snippet, the prompt never states which one is authoritative. That matters in Fix 3 and Fix 4.
- Missing context: A short rule like "if prose/AC and code block disagree, follow the code block and report the mismatch" would remove the remaining hesitation.

## Fix Ratings (MANDATORY — ALWAYS include this section, even if no issues found)
Rate each Fix mentioned in the prompt. Scale: 1=Rewrite needed, 2=Major issues, 3=Needs clarification, 4=Minor issues, 5=Clear.

| Fix | Rating (1-5) | Verdict | Key issue (if any) |
|-----|-------------|---------|-------------------|
| Fix1 | 5/5 | Clear | No material prompt-design issue found. |
| Fix2 | 4/5 | Clear | AC should mention that the pending badge is only visible after `otherGuestsExpanded` is opened. |
| Fix3 | 3/5 | Needs clarification | AC downgrades `!isCancelledOrder(o)` to a raw `o.status !== 'cancelled'` check, and one stale comment still says name-first. |
| Fix4 | 3/5 | Needs clarification | AC line 1154 inverts the intended filter and currently describes cancelled orders as the active set. |

Overall prompt verdict: NEEDS REVISION
