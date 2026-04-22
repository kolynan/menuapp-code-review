# Codex Writer Findings — StaffOrdersMobile
Chain: staffordersmobile-260330-172614-cb49

## Findings
1. [P2] Bill summary still uses `DollarSign` instead of `Receipt` — `pages/StaffOrdersMobile/staffordersmobile.jsx:1893` still renders `<DollarSign className="w-4 h-4 text-slate-500 shrink-0" />`, so the waiter will keep seeing a dollar glyph before `Счёт` instead of the approved receipt icon. FIX: replace only that usage with `<Receipt className="w-4 h-4 text-slate-500 shrink-0" />`; leave the surrounding layout/text and any other `DollarSign` usages untouched.
2. [P3] Table card title still duplicates the `Стол` prefix — `pages/StaffOrdersMobile/staffordersmobile.jsx:1398` still builds `identifier` as `` `Стол ${tableData.name}` ``, so DB values like `Стол 2` render as `Стол Стол 2`. FIX: guard the prefix with `tableData.name.startsWith('Стол') ? tableData.name : \`Стол ${tableData.name}\``; do not change pickup/delivery identifiers or `group.displayName`.
3. [P1] Inline `OrderCard` CTA is still broken for ready/custom-stage orders — `pages/StaffOrdersMobile/staffordersmobile.jsx:1134` shows the button only when `statusConfig.nextStageId || statusConfig.nextStatus`, and `pages/StaffOrdersMobile/staffordersmobile.jsx:1039` returns early on the same condition inside `handleAction`. But `pages/StaffOrdersMobile/staffordersmobile.jsx:3039`-`3056` builds stage-mode configs for the last configured stage with `nextStageId: null`, `nextStatus: null`, and no terminal flag, while the batch path already treats `config.isFinishStage` as a serve step at `pages/StaffOrdersMobile/staffordersmobile.jsx:1521`. Result: `Готово` / custom actionable orders can still lose the inline button, and forcing it visible would still no-op on tap. FIX: extend `getStatusConfig` so finish-stage-but-not-terminal orders expose an inline serve action and terminal states expose `isTerminal`; derive `showActionButton` from actionability (`statusConfig.actionLabel && !statusConfig.isTerminal` or equivalent), and mirror the existing `config.isFinishStage => payload.status = 'served'` fallback inside `OrderCard.handleAction`.

## Summary
Total: 3 findings (0 P0, 1 P1, 1 P2, 1 P3)

## Prompt Clarity (MANDATORY — do NOT skip this section)
- Overall clarity: 3
- Ambiguous Fix descriptions (list Fix # and what was unclear): Fix 3 — the scope text says to touch only `showActionButton` and `isTerminal`, but the expected result also requires the inline tap to advance a ready/custom-stage order, which means the current `OrderCard.handleAction` path has to be checked too.
- Missing context (what info would have helped): The page-folder-only context rule conflicted with the TASK CONTEXT references to `ux-concepts/staff-orders-mobile.md` and `BUGS_MASTER.md`, and the local README file is named `StaffOrdersMobile README.md` instead of `README.md`.
- Scope questions (anything you weren't sure if it's in scope): I treated the numbered Fix list as authoritative and ignored every issue outside Fix 1-3.
