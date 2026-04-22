# Codex Writer Findings — StaffOrdersMobile
Chain: staffordersmobile-260331-225506-fac7

## Findings
1. [P1] Fix 1 summary computation is still count-based instead of per-stage with age — [staffordersmobile.jsx](C:/Users/ASUS/Dev/Menu%20AI%20Cowork/menuapp-code-review/pages/StaffOrdersMobile/staffordersmobile.jsx#L1598) only derives `newCount`, `serveCount`, and `inProgressCount`. There is no `summaryLines` grouping by current stage, no request-vs-finish-vs-mid-vs-first ordering, no oldest-age calculation from `order.stage_entered_at || order.created_date`, and no forward-compatible `cfg.show_in_summary !== false` filter. As written, Row 3 cannot produce the required `[count] [stage_name] · [age_мин]` lines or urgency colors. FIX: add the `summaryLines` `useMemo` plus `getSummaryLineColor` helper from Fix 1, grouping `activeOrders` by `getStatusConfig(order)` and computing age from the oldest request/order timestamp.
2. [P1] Fix 1 Row 3 JSX was not replaced — [staffordersmobile.jsx](C:/Users/ASUS/Dev/Menu%20AI%20Cowork/menuapp-code-review/pages/StaffOrdersMobile/staffordersmobile.jsx#L1701) still renders the old `СЕЙЧАС / ЕЩЁ` block with hardcoded strings (`новых`, `выдать`, `готовится`) and still appends `billData.total`. That directly contradicts SOM-UX-23, which requires removing the `СЕЙЧАС`/`ЕЩЁ` labels, removing the sum, and showing dynamic stage names from `config.label` with per-line age. FIX: replace the entire Row 3 block with the `summaryLines.map(...)` render from Fix 1 and keep only the empty-state fallback when `summaryLines.length === 0`.

## Summary
Total: 2 findings (0 P0, 2 P1, 0 P2, 0 P3)

## Prompt Clarity (MANDATORY — do NOT skip this section)
- Overall clarity: 4
- Ambiguous Fix descriptions (list Fix # and what was unclear): None.
- Missing context (what info would have helped): None.
- Scope questions (anything you weren't sure if it's in scope): The folder contains `StaffOrdersMobile README.md` rather than `README.md`; I treated it as the intended context file.
