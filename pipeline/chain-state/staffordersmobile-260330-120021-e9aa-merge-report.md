# Merge Report — StaffOrdersMobile
Chain: staffordersmobile-260330-120021-e9aa

## Applied Fixes

1. **[P0] Fix 2A+2B — Shift filter fallback to start-of-today** — Source: agreed — DONE
   - Changed both fallback returns in `getShiftStartTime()` from `now - FALLBACK_HOURS * 60 * 60 * 1000` to `startOfToday.setHours(0,0,0,0)`. `FALLBACK_HOURS` constant kept but unused.

2. **[P0] Fix 1A — Replace Row 3 with СЕЙЧАС/ЕЩЁ summary** — Source: agreed — DONE
   - Added `newCount`, `serveCount`, `inProgressCount` computed after `billData`. Replaced Row 3 with two-line summary: "СЕЙЧАС: N новых · N выдать · emoji badges" + "ЕЩЁ: N готовится · NNN ₸".

3. **[P0] Fix 1B — Remove Row 4 request badges** — Source: agreed — DONE
   - Row 4 badge chips removed; badges now merged into СЕЙЧАС line.

4. **[P1] Fix 1C — Add empty state fallback** — Source: CC only — DONE
   - When all counts = 0 and no badges, shows "Нет активных заказов" muted text.

5. **[P0] Fix 4D+4E — Fix bill icon (Receipt)** — Source: agreed — DONE
   - Imported `Receipt` from lucide-react. Replaced `Bell` with `Receipt` for bill type in collapsed card AND expanded Block C.

6. **[P0] Fix 4A — Move Block C to top of expanded content** — Source: agreed — DONE
   - Block C (Guest Requests) moved from after Block B to FIRST position in expanded content, before all order sections.

7. **[P1] Fix 4B — "Выполнено" button + callback fix** — Source: agreed (CC detail) — DONE
   - Button text changed from conditional "В работу"/"Готово" to single "Выполнено". Callback at line 3893 changed to always set `status: 'done'`.

8. **[P1] Fix 4C — Touch target 44px for "Выполнено"** — Source: CC only — DONE
   - Changed `min-h-[28px]` to `min-h-[44px]`.

9. **[P0] Fix 3A — newOrders/inProgressOrders useMemo + inProgressExpanded state** — Source: agreed — DONE
   - Added `newOrders` and `inProgressOrders` useMemo filters. Added `inProgressExpanded` state.

10. **[P0] Fix 3A render — 3 status sections** — Source: agreed — DONE
    - Rendered: "Новые (N)" [open] → "Готово к выдаче (N)" [open] → "В работе (N)" [collapsed with chevron].

11. **[P0] Fix 3B — "Принять все" batch button** — Source: agreed — DONE
    - Added `handleBatchAction` helper that iterates orders and calls `advanceMutation.mutate()` per order. Wired to "Принять все" in Новые section header.

12. **[P0] Fix 3C — "Выдать все" batch button** — Source: agreed + CC concern — DONE
    - `handleBatchAction` handles isFinishStage orders: if no `nextStageId`/`nextStatus`, uses direct `status: 'served'` payload. Verified `getStatusConfig()` returns null for both when isFinishStage in stage mode.

13. **[P0] Fix 3D — Remove Block F** — Source: agreed — DONE
    - Old Block F removed entirely. Its content (completedOrders) now displayed in Section 2 "Готово к выдаче".

## Skipped — Unresolved Disputes (for Arman)
None — no disputes remained after discussion.

## Skipped — Could Not Apply
None.

## Git
- Commit: `ba88ac6`
- Files changed: 2 (staffordersmobile.jsx, BUGS.md)
- Lines: 4022 → 4123 (+101 net)

## FROZEN UX Verification
- `derivedNextStatus` logic: UNCHANGED (4 occurrences verified)
- `FALLBACK_HOURS` constant: PRESENT (unused in fallback returns as intended)
- `duration-200 ease-out` animation: PRESENT
- `BannerNotification`: UNTOUCHED
- `runSessionCleanup()`: UNTOUCHED
- `handleAdvance`: UNTOUCHED (only `handleBatchAction` added separately)

## Prompt Feedback
- CC clarity score: 4/5
- Codex clarity score: 3/5
- Average: 3.5/5
- Fixes where writers diverged due to unclear description: Fix 3C — `completedOrders` naming confusion (isFinishStage = "ready to serve", not "truly completed"). CC identified that stage-mode isFinishStage orders have no nextStageId, Codex missed this.
- Fixes where description was perfect (both writers agreed immediately): Fix 2A+2B (shift filter), Fix 4B (Выполнено button), Fix 1A+1B (summary lines)
- Recommendation for improving task descriptions: Clarify `completedOrders` semantics upfront — explain that in stage mode, isFinishStage orders may not have a next action. Also consider a single table showing final expanded block order rather than splitting across Fix 3 and Fix 4.

## Summary
- Applied: 13 fixes
- Skipped (unresolved): 0 disputes
- Skipped (other): 0 fixes
- MUST-FIX not applied: 0
- Commit: `ba88ac6`
