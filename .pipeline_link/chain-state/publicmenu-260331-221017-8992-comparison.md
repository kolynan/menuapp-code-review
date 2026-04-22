# Comparison Report — PublicMenu
Chain: publicmenu-260331-221017-8992

## Agreed (both found)

### Fix 1 — ARCHITECTURE: Ticket board + always-idle cards
| # | Issue | CC | Codex | Verdict |
|---|-------|-----|-------|---------|
| 1 | Remove HD-08 summary block (lines 3916–3926) | P0 #1 | P1 #1 | **AGREED** — both identify the same block to remove. Apply. |
| 2 | Remove cardActionModal state + JSX (line 1692, lines 4080–4129) | P0 #2 | P1 #1, P1 #3 | **AGREED** — both identify modal removal. Apply. |
| 3 | Cards must always render idle (no status-based styling) | P1 #3, #4, #5 | P1 #1 | **AGREED** — CC is more granular (3 separate findings: className, label text, "Другое" card). Codex rolls into one. Use CC's granularity for implementation — it's more actionable. Apply all. |
| 4 | Add "Мои запросы" ticket board section | P0 #1 | P1 #1 | **AGREED** — both describe the new section. Apply. |
| 5 | Conditional "Отправить ещё" header | P1 #6 | P1 #1 | **AGREED** — both note the conditional header. Apply. |

### Fix 2 — STATE MODEL: Расширить requestStates
| # | Issue | CC | Codex | Verdict |
|---|-------|-----|-------|---------|
| 6 | Expand requestStates with new fields (lastReminderAt, reminderCount, remindCooldownUntil) | P0 #8 | P1 #2 | **AGREED** — same fields identified. Apply. |
| 7 | "other" type → array of entries | P0 #9 | P1 #2 | **AGREED** — both identify the array transformation. CC provides more implementation detail (crypto.randomUUID, 5 update points). Apply. |
| 8 | localStorage handling for new structure | P1 #10 | P1 #2 | **AGREED** — both note localStorage needs updating. Apply. |
| 9 | Timer must use sentAt, not lastReminderAt | P1 #11 | P1 #2 | **AGREED** — both confirm sentAt as timer base. Apply. |
| 10 | getRelativeTime "Ждёте X мин" format after 10min | P2 #12 | P1 #2 | **AGREED** — CC provides exact implementation with i18n. Apply. |

### Fix 3 — SMART REDIRECT
| # | Issue | CC | Codex | Verdict |
|---|-------|-----|-------|---------|
| 11 | Scroll to ticket board + amber highlight + toast on re-tap | P1 #13 | P1 #3 | **AGREED** — both describe same flow: scrollIntoView, 1.5s highlight, toast. Apply. |
| 12 | Ref infrastructure for scroll/highlight | P2 #14 | P1 #3 | **AGREED** — CC explicitly calls out ref needs, Codex mentions refs inline. Apply. |

### Fix 4 — ANTI-SPAM: Remind with cooldown
| # | Issue | CC | Codex | Verdict |
|---|-------|-----|-------|---------|
| 13 | Create handleRemind function | P1 #15 | P1 #4 | **AGREED** — both describe the same function with cooldown update + server send. Apply. |
| 14 | Remind button cooldown countdown in ticket row | P1 #16 | P1 #4 | **AGREED** — both note disabled state + "Повторить через MM:SS". Apply. |

### Fix 5 — ANXIETY COPY
| # | Issue | CC | Codex | Verdict |
|---|-------|-----|-------|---------|
| 15 | Add "Статус обновляется автоматически" text | P2 #18 | P2 #5 | **AGREED** — identical requirement. CC adds i18n key. Apply. |

### Fix 6 — COLLAPSE: Порог 4+, сортировка
| # | Issue | CC | Codex | Verdict |
|---|-------|-----|-------|---------|
| 16 | Collapse at 4+ threshold (show 2, hide rest) | P1 #19 | P2 #6 | **AGREED** — same logic. CC provides more implementation detail (state, slice, toggle). Apply. |
| 17 | Sort ticket rows by sentAt ascending | P1 #20 | P2 #6 | **AGREED** — identical. Apply. |

### Fix 7 — PAID GATE
| # | Issue | CC | Codex | Verdict |
|---|-------|-----|-------|---------|
| 18 | partner.plan not available → SKIP Fix 7 | P2 #21 | P3 #7 | **AGREED** — both confirmed `partner.plan` not in x.jsx, both recommend skip. **SKIP.** |

## CC Only (Codex missed)

| # | Issue | CC Finding | Valid? | Action |
|---|-------|-----------|--------|--------|
| C1 | `pendingRequests` memo cleanup/replacement | P2 #7 | **Valid** — after introducing `activeRequests`, old memo is dead code. | **ACCEPT** — include cleanup in Fix 1 implementation. |
| C2 | Remind cooldown timer granularity (extend 1s interval condition) | P2 #17 | **Valid** — 30s interval is too coarse for MM:SS countdown display. Without this, countdown would jump 30s at a time. | **ACCEPT** — include in Fix 4 implementation. Important for UX smoothness. |

## Codex Only (CC missed)

None. All Codex findings are covered by CC findings (CC was more granular overall).

## Disputes (disagree)

### D1 — Priority disagreement on Fix 1/2 items
- CC rates HD-08 removal and cardActionModal removal as **P0** (crash-level).
- Codex rates them as **P1** (incorrect behavior).
- **Resolution:** These are not crash bugs — they're architectural gaps (old UI still present). **P1** is more accurate since the old code works, it's just wrong for the new design. However, they are the most critical items in the task scope. **Use P1-CRITICAL label** — highest priority within P1.

### D2 — Status name ambiguity (CC only raised)
- CC Prompt Clarity section notes the new schema has `'sent'`/`'remind_available'` while code uses `'pending'`/`'repeat'`. CC suggests keeping old names.
- Codex doesn't address this.
- **Resolution:** **Keep existing status names** (`pending`, `repeat`, `idle`, `sending`) to avoid breaking localStorage and existing logic. Add new fields only. The new schema names are aspirational; the task doesn't explicitly require renaming. This is the safe approach.

## Final Fix Plan

Ordered by dependency and priority:

1. **[P1-CRIT] Fix 2A — Expand requestStates standard-type structure** — Add `lastReminderAt`, `reminderCount`, `remindCooldownUntil` fields with defaults. Source: agreed (CC #8, Codex #2).
2. **[P1-CRIT] Fix 2B — Convert "other" to array** — Change `requestStates['other']` from object to array of entries with `id`. Update submit handler, card rendering, localStorage. Source: agreed (CC #9, Codex #2).
3. **[P1] Fix 2C — localStorage load/save for new structure** — Handle new fields + array for "other" in persist/restore. Source: agreed (CC #10, Codex #2).
4. **[P1] Fix 2D — getRelativeTime "Ждёте X мин" format** — Add >=10min conditional with i18n. Source: agreed (CC #12, Codex #2).
5. **[P1-CRIT] Fix 1A — Remove HD-08 summary block** — Delete lines 3916–3926. Source: agreed (CC #1, Codex #1).
6. **[P1-CRIT] Fix 1B — Remove cardActionModal** — Delete state (line 1692), JSX (lines 4080–4129), and onClick reference (line 3941). Source: agreed (CC #2, Codex #1/#3).
7. **[P1] Fix 1C — Cards always idle** — Remove status-based className, labels, spinner, pending timestamp from standard cards. Source: agreed (CC #3/#4, Codex #1).
8. **[P1] Fix 1D — "Другое" card always idle** — Remove status-based styling and `otherDisabled` logic. Source: agreed (CC #5, Codex #1).
9. **[P1] Fix 1E — Add "Мои запросы" ticket board section** — New section with ticketBoardRef, render active requests as rows. Source: agreed (CC #1, Codex #1).
10. **[P1] Fix 1F — Conditional "Отправить ещё" header** — Show header when activeRequests > 0. Source: agreed (CC #6, Codex #1).
11. **[P2] Fix 1G — Clean up pendingRequests memo** — Replace with activeRequests or remove if unused. Source: CC-only (CC #7).
12. **[P1] Fix 3 — Smart redirect on re-tap** — scrollIntoView + amber highlight 1.5s + toast. Add ticketBoardRef + highlightedTicket state. Source: agreed (CC #13/#14, Codex #3).
13. **[P1] Fix 4A — handleRemind function** — Update state, send reminder (no undo), show toast. Source: agreed (CC #15, Codex #4).
14. **[P1] Fix 4B — Remind button cooldown in ticket row** — Disabled + "Повторить через MM:SS" countdown. Source: agreed (CC #16, Codex #4).
15. **[P2] Fix 4C — Timer interval granularity for cooldowns** — Extend 1s interval condition to include remind cooldowns. Source: CC-only (CC #17).
16. **[P2] Fix 5 — Anxiety copy** — "Статус обновляется автоматически" with i18n. Source: agreed (CC #18, Codex #5).
17. **[P1] Fix 6A — Collapse at 4+ threshold** — Show 2, toggle "Ещё N запросов". Source: agreed (CC #19, Codex #6).
18. **[P1] Fix 6B — Sort by sentAt ascending** — Oldest first. Source: agreed (CC #20, Codex #6).
19. **[SKIP] Fix 7 — Paid gate** — partner.plan not available in x.jsx. Record as BACKLOG. Source: agreed (CC #21, Codex #7).

## Summary
- Agreed: 18 items (all 7 fixes covered by both reviewers)
- CC only: 2 items (2 accepted — pendingRequests cleanup, timer granularity)
- Codex only: 0 items
- Disputes: 2 minor (priority labels, status naming — both resolved)
- Total fixes to apply: 18 (Fix 7 skipped)
- Total SKIP: 1 (Fix 7 — partner.plan not in scope)

## Notes for Merge Step
- **Status names:** Keep `pending`/`repeat`/`idle`/`sending` — do NOT rename to `sent`/`remind_available`.
- **Fix 7:** Record in findings as BACKLOG item, not a code fix.
- **Dependency order is critical:** Fix 2 (state) → Fix 1 (architecture) → Fix 3 (redirect) → Fix 4 (remind) → Fix 5/6 (independent).
- **CC Prompt Clarity notes are valuable** — pass to merge step for implementation awareness (especially: `'resolved'` status is future-only, `'sending'` remains undo-window state, remind uses same submitHelpRequest chain).
