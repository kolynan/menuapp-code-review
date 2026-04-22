# Codex Discussion Position - StaffOrdersMobile
Chain: staffordersmobile-260413-175015-be0e
Topic: ПССК: Ревью черновика КС-промпта - SOM Batch A Android Quick-Fix

## Questions Analyzed

### Q1: Fix 1 - guest counter should count unique guests, not orders
**Recommendation:** ❌ Rewrite needed. Keep the behavioral goal, but rewrite the prompt to target the active table-card headers in `pages/StaffOrdersMobile/staffordersmobile.jsx`, not the commented-out blocks. Recommend a small helper such as `countUniqueGuests(orders)` and apply it to all active section headers that show `guests · dishes`.

**Reasoning:** The desired behavior is clear and correct for waiter UX: guest count is coverage, dish count is workload. The problem is prompt targeting. The cited lines `670`, `680`, and `708` are inside a commented-out JSX block (`/* ... */` runs through line `785`), so an implementor can easily patch dead code. The same stale pattern appears again in another commented block around `1281`, `1291`, and `1319`. The active table-card headers are around `2331`, `2333`, `2335`, and `2337`. The grep hint `HALL_UI_TEXT.guests` is too broad because it returns both dead and live matches. Also, `countRows()` is only dish-row logic at `2004-2007`; it is not the source of the guest-count bug.

**Trade-offs:** Rewriting the prompt adds a little upfront precision work, but it prevents wasted edits in commented code and avoids duplicated inline `new Set(...)` expressions scattered across several headers.

**Mobile UX:** On a 375px waiter screen, the header summary is a scanning aid. Showing `2 guests` for one person with two dishes exaggerates table load and can distort triage when staff are moving quickly.

### Q2: Fix 2 - table card disappears after "Выдать все (N)"
**Recommendation:** ❌ Rewrite needed. The prompt should target the earlier order-source filter first, then keep tab filtering/count logic consistent. It also needs an explicit source of truth for "table still open".

**Reasoning:** The proposed fix location is not the real root cause. The draft points to `filteredGroups`/`tabCounts` around `3792-3815`, but the table can already disappear earlier in `activeOrders` at `3527-3545`. In that filter, finish-stage hall orders are excluded when `o.status === 'served'`, so once all dishes are served there may be no hall orders left to build a group from. Patching only `filteredGroups` will not restore a card that never reaches `orderGroups`. The prompt is also underspecified about the "table session still open" check: `group.tableSession?.status` does not exist in the current group model, and there is no loaded table-session status in this file. If the intended rule is "keep `served` hall orders until close action changes them to `closed`", say that explicitly. If the intended rule truly depends on session status, the prompt must specify where that status comes from.

**Trade-offs:** A rewrite makes the prompt longer, but it avoids a shallow fix that updates tab predicates while leaving the actual disappearance bug intact. The only real cost is that the implementor needs clearer product-state guidance for "served but not closed".

**Mobile UX:** This is the highest-impact fix in the batch. On mobile, disappearing the card after "serve all" breaks task continuity at the exact moment the waiter needs the "Закрыть стол" action. That is a workflow dead end, not just a cosmetic issue.

### Q3: Fix 3 - tapping the star ownership badge expands the card
**Recommendation:** ✅ Clear. Keep this fix minimal and apply `stopPropagation()` to both the `★` badge and the `☆` badge in the active card header.

**Reasoning:** This is the strongest part of the draft. The issue is concrete, the current active code is correctly anchored at `2249-2262`, and the analogous `🔒` button already shows the intended event pattern at `2255`. The requested scope is tight: prevent bubbling, do not add new behavior, do not change `🔒`. That is easy for an implementor to execute safely.

**Trade-offs:** Adding click handlers to decorative `div`s is a little inelegant semantically, but it is the smallest possible fix and stays within the no-redesign scope.

**Mobile UX:** Small badges sit near the thumb path on a crowded card header. Preventing accidental expand/collapse reduces noisy motion and makes the ownership indicator feel passive, which matches user expectation.

### Q4: Fix 4 - remove the "В РАБОТЕ" wrapper and promote stages to root level
**Recommendation:** ❌ Rewrite needed, and likely remove this fix from the batch for the current file version. The active table-card render already uses root-level `inProgressSections.map(...)`.

**Reasoning:** The draft is stale against the current source. The cited lines `677-730` are again in commented-out code. In the active `OrderGroupCard` render, the table path already promotes `inProgressSections` to root-level sections around `2333`; there is no outer "В РАБОТЕ" wrapper there. That means the prompt, as written, sends the implementor to dead code and asks them to "fix" behavior that is already implemented in live code. The deletion note is also factually wrong: `inProgressExpanded` does not simply become dead. It is still used in the non-table render path around `2346` and in the effect at `1815-1823`.

**Trade-offs:** Removing or rewriting this fix reduces apparent batch size, but it avoids scope creep into unrelated states and prevents regressions in non-table cards. If product still sees a hierarchy problem, the prompt should ask for verification of the active root-level stage rendering and passive styling, not wrapper removal.

**Mobile UX:** Separate root-level stage sections are the right mobile pattern because they shorten scan depth and keep each tap target conceptually simple. The problem is not the target UX; the problem is that the current prompt is aimed at the wrong code.

## Summary Table

| # | Question | Codex Recommendation | Confidence |
|---|----------|----------------------|------------|
| 1 | Fix 1 - unique guest count | ❌ Rewrite needed | high |
| 2 | Fix 2 - keep all-served table visible until close | ❌ Rewrite needed | high |
| 3 | Fix 3 - stop star badge from toggling card | ✅ Clear | high |
| 4 | Fix 4 - remove in-progress wrapper | ❌ Rewrite needed | high |

## Prompt Clarity

- Overall clarity: 2/5
- Ambiguous questions:
  - Q1: Wrong anchors point to commented code, and the grep hint hits dead and live matches together.
  - Q2: The prompt names `visibleGroups`, but the actual memo is `filteredGroups`; more importantly, it does not mention the earlier `activeOrders` filter that likely causes the disappearance. The "table still open" signal is undefined in the current file.
  - Q4: The draft describes a bug that is already resolved in the active table-card render and incorrectly says `inProgressExpanded` becomes dead.
- Missing context:
  - `BUGS_MASTER.md` is not present at the path given in the prompt.
  - `ux-concepts/StaffOrdersMobile/260406-00 StaffOrdersMobile UX S225 FINAL.md` is not present at the path given.
  - `ux-concepts/StaffOrdersMobile/260406-00 StaffOrdersMobile Mockup S225 FINAL.html` is not present at the path given.
  - The prompt references both `pages/StaffOrdersMobile/staffordersmobile.jsx` and `260413-00 StaffOrdersMobile RELEASE.jsx`. The code file is identifiable, but the stale line anchors suggest the author may have copied from an older or commented snapshot.
