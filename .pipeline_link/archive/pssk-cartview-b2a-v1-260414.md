---
task: pssk-cartview-b2a-v1
page: CartView
code_file: pages/PublicMenu/CartView.jsx
budget: 10
agent: cc+codex
chain_template: discussion-cc-codex
ws: WS-CV
created: 2026-04-14
session: 273
scope_summary: "CV-B2a narrow — 1 real bug (CV-BUG-04 stopPropagation) + 3 VERIFY ONLY (CV-BUG-03 scroll, CV-76 double-tap, CV-78 footer height)"
---

# START PROMPT — CV-B2a ПССК review (Д3, CC+Codex параллельно)

**Language:** English in output. Реф на русском допустим inline.

## Goal
Review draft of КС (implementation task) for CartView CV-B2a — narrow batch: **one real bug + three verify-only checks**. Produce findings: confirm/deny each fix, flag issues, rate Prompt Clarity 1–5.

---

## Scope Reality Tags (Rule: каждый Fix помечен — vchr-pretask §0.6)

| Fix | ID | Status | Lines | Notes |
|---|---|---|---|---|
| 1 | CV-BUG-04 | **[BUG at 936+1009]** | 2 (one-liner per location) | Missing `e.stopPropagation()` on «Оценить» chip — click bubbles to parent toggle at line 984, flipping `served: true` back to false |
| 2 | CV-BUG-03 | **[VERIFY ONLY]** | line 206 | `scrollable.scrollTop = 0` — verify this runs on drawer open (check trigger) |
| 3 | CV-76 | **[VERIFY ONLY]** | 115-177, 1153-1177 | `submitPhase` state machine ('idle'/'submitting'/'success'/'error') — verify double-tap prevention is complete and all error paths reset |
| 4 | CV-78 | **[VERIFY ONLY]** | footer region | Verify footer height does NOT jump between submitPhase transitions (stable layout) |

---

## TARGET FILE (editable)
- `pages/PublicMenu/CartView.jsx` (1192 lines, ACTUAL PATH — verified via ls)

## CONTEXT FILES (read-only, for reference)
- `pages/PublicMenu/CartView.jsx` — same file (target = context)
- *No other files needed for this batch.* Parent `x.jsx` is NOT in scope (cross-file auto_open trigger is CV-B2b, separate batch).

---

## SCOPE LOCK

⛔ **DO NOT** touch any file other than `pages/PublicMenu/CartView.jsx`.
⛔ **DO NOT** refactor unrelated logic. One-liner fix only for Fix 1. Verify-only for Fix 2/3/4.
⛔ **DO NOT** introduce new features (success screen, CTA unification, auto_open pulse — all OUT OF SCOPE, separate batches CV-B2c/B2b).

✅ Exception — i18n dictionary: if new `t()` keys are genuinely required, grep existing key (e.g. `cart.send_to_waiter`) → find dictionary file → add only the new keys. (Not expected for B2a since all fixes are existing code.)

---

## FROZEN UX context (inline — CC does NOT see root DECISIONS_INDEX.md)

CV-BUG-04 — «Оценить» chip:
- Chip is rendered for items with `served: true` status
- On click: must expand the «Выдано» group AND enter rating mode
- Current handler (line 936 and 1009):
  ```jsx
  onClick={() => {
    setExpandedStatuses(prev => ({ ...prev, served: true }));
    setIsRatingMode(true);
    // ...
  }}
  ```
- Parent `<div>` at line 984 has onClick that **toggles** `expandedStatuses.served` — click on chip bubbles up → toggle fires AFTER chip handler → `served: true` flips back to false → group never expands
- Correct reference: «Готово» chip at line 926 already uses `onClick={(e) => { e.stopPropagation(); ... }}` — copy this pattern

CV-BUG-03 — drawer scroll-to-top:
- When cart drawer opens, scroll position should reset to top (user expects fresh view of current order)
- Line 206 currently: `if (scrollable) scrollable.scrollTop = 0;` — verify this fires on drawer open effect, not on unrelated trigger

CV-76 — double-tap submit prevention:
- `submitPhase` state machine already exists (lines 115-177). States: 'idle' | 'submitting' | 'success' | 'error'
- CTA button disabled while `submitPhase === 'submitting'`
- Verify: (a) no race on fast double-tap; (b) error path resets to 'idle'; (c) timeout cleanup on unmount

CV-78 — footer height stability:
- Footer contains CTA button. Height must NOT jump during submitPhase transitions
- Common failure: 'success' state shows different content (e.g., checkmark vs button) with different height → layout shift
- Verify: footer height is pinned (min-height/fixed height) OR content occupies same vertical space

---

## Fixes — details for implementer

### Fix 1 — CV-BUG-04 [BUG at line 936 + line 1009]
**Problem:** «Оценить» chip click bubbles to parent toggle, collapsing the group immediately after expanding.

**Required change (2 locations, same pattern):**
```jsx
// BEFORE (line 936, line 1009):
onClick={() => {
  setExpandedStatuses(prev => ({ ...prev, served: true }));
  setIsRatingMode(true);
  // ... rest
}}

// AFTER:
onClick={(e) => {
  e.stopPropagation();
  setExpandedStatuses(prev => ({ ...prev, served: true }));
  setIsRatingMode(true);
  // ... rest
}}
```

**Verification grep after fix:**
```
grep -n "setIsRatingMode(true)" pages/PublicMenu/CartView.jsx
# Both occurrences must have e.stopPropagation() inside the handler
```

---

### Fix 2 — CV-BUG-03 [VERIFY ONLY, line 206 area]
**Task:** confirm `scrollable.scrollTop = 0` executes on drawer-open event (not on other trigger).
- If correctly wired → mark VERIFIED, no code change.
- If mis-wired (e.g., runs on every re-render, or never runs on open) → report as ISSUE with exact line and trigger.

---

### Fix 3 — CV-76 [VERIFY ONLY, lines 115-177, 1153-1177]
**Task:** confirm `submitPhase` state machine is complete:
- (a) Button `disabled={submitPhase === 'submitting'}` — check at line ~1153
- (b) Error path: catch block must setSubmitPhase('error') then setSubmitPhase('idle') after timeout
- (c) Unmount cleanup for any `setTimeout` used in state transitions
- If any of (a/b/c) missing → ISSUE with line + suggested fix.

---

### Fix 4 — CV-78 [VERIFY ONLY, footer region]
**Task:** confirm footer container has stable height across submitPhase states.
- Inspect the wrapper of CTA button (find via `grep -n "submitPhase" pages/PublicMenu/CartView.jsx`)
- Report: does container use `min-height`, fixed `height`, or does height depend on child? If child-dependent → ISSUE.

---

## MOBILE-FIRST CHECK (375px viewport)
- Chip «Оценить» tap target ≥ 44×44px (confirm padding).
- Footer: CTA does not overflow viewport width. Safe-area bottom respected.
- No horizontal scroll introduced by any change.

## REGRESSION CHECK
1. «Готово» chip still expands correctly (reference pattern at line 926).
2. Tapping empty area in drawer still toggles group expansion (parent onClick at 984).
3. Rating mode entry still works after chip click (setIsRatingMode(true) not blocked).
4. Submit button still functions in normal flow (single tap → submitting → success).
5. No console errors on chip click or drawer open.

---

## Output format (Prompt Clarity self-check at end)

For each Fix, report:
- **Fix N — [status] — [BUG/VERIFIED/ISSUE]** — 1-2 lines explanation
- If ISSUE: exact line + proposed correction

At end, list:
- **Ambiguities:** any unclear requirements
- **Risks:** regressions, edge cases
- **Execution plan:** what КС implementer should do (1-liner for Fix 1, verification steps for 2-4)
- **Prompt Clarity: N/5**

## Git (for implementer, not for this review)
Final КС will use: `git add pages/PublicMenu/CartView.jsx && git commit && git push`

# END PROMPT
