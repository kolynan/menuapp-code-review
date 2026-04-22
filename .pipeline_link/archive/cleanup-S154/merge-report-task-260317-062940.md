# Merge Report: task-260317-062940

## Task: BUG-PM-026 tableCodeLength default 5→4 (regression)

### CC Analysis
- **[P1] BUG-PM-026**: `tableCodeLength` default regressed to 5 (line 101 of CartView.jsx).
  - FIX: Changed `return 5` → `return 4`. Commit: c461bfb.

### Codex Analysis (completed after ~8 min)
Codex found 17 issues (0 P0, 5 P1, 11 P2, 1 P3) — full review of CartView.jsx.
Codex did NOT flag BUG-PM-026 because the fix was already applied before Codex read the file.

**Codex P1 findings (not in scope for this task, but noted):**
1. Loyalty/discount UI hidden behind wrong gate (`showLoginPromptAfterRating` vs `showLoyaltySection`)
2. Failed star-rating save permanently locks the item
3. Same table code cannot be retried after failed verify
4. Review-reward banner appears before anything is reviewable
5. Cart can close during order submission

**Codex P2 findings:** 11 issues including status mapping regression, guest code leak in header, scroll-to-top missing after verification, hard-coded locale/currency, and more.

## Agreed (both found)
- BUG-PM-026 was the only assigned task. CC fixed it before Codex ran.

## CC only (Codex missed)
- BUG-PM-026 — not missed, just already fixed when Codex analyzed.

## Codex only (CC missed)
- 17 additional bugs found by Codex. These are OUT OF SCOPE for this smoke test task (budget=10, single-bug fix). They should be added to BUGS_MASTER.md / BACKLOG for future work.

## Disputes
None.

## Smoke Test Result: PASS
- `code_file:` frontmatter was correctly parsed (task targeted CartView.jsx)
- CC found and fixed the assigned bug
- Pipeline completed end-to-end
- Codex integration worked (though slow — ~8 min)
