# Discussion Report — PublicMenu
Chain: publicmenu-260331-221017-8992
Mode: CC-Only (v2)

## Disputes Analyzed
Total: 2 disputes from Comparator

### Dispute 1: Priority disagreement on Fix 1/2 items (D1)
**CC Solution:** Rate HD-08 summary removal and cardActionModal removal as P0 (crash-level).
**Codex Solution:** Rate them as P1 (incorrect behavior).
**CC Analysis:** The old summary block and modal are not crash bugs — they still render and function. The issue is architectural: they conflict with the new ticket board design. P0 implies the app will crash or lose data without the fix, which isn't true here. However, these are the highest-priority items within this task because everything else depends on removing them first (Fix 3 requires cardActionModal gone, Fix 1E requires summary block gone). Codex's P1 is technically more accurate, but they need a "critical within scope" marker.
**Verdict:** Codex (P1, with P1-CRITICAL label)
**Reasoning:** Not crashes — architectural replacement. P1-CRITICAL preserves urgency without misrepresenting severity.

### Dispute 2: Status name ambiguity (D2)
**CC Solution:** Keep existing status names (`pending`, `repeat`, `idle`, `sending`) instead of renaming to the new schema names (`sent`, `remind_available`, `resolved`).
**Codex Solution:** Did not address this explicitly — used existing names in findings.
**CC Analysis:** The task prompt's Fix 2 describes a new schema with `'sent'` / `'remind_available'` / `'resolved'`, but the existing code uses `'pending'` / `'repeat'` / `'idle'` / `'sending'`. Renaming would require updating every status check, localStorage migration logic, and the undo flow — all of which are outside the scope of this task and introduce regression risk. The new fields (`lastReminderAt`, `reminderCount`, `remindCooldownUntil`) can be added without renaming existing statuses. The `'resolved'` status is future-only (no server-side status push exists yet). Keeping old names is the safe, minimal-change approach.
**Verdict:** CC (keep existing names)
**Reasoning:** Renaming statuses would touch dozens of conditionals with no functional benefit and high regression risk. Add new fields only.

## Resolution Summary
| # | Dispute | Verdict | Reasoning |
|---|---------|---------|-----------|
| 1 | Priority P0 vs P1 for Fix 1/2 removals | Codex (P1-CRITICAL) | Not crashes — architectural gap. P1-CRITICAL is accurate. |
| 2 | Status names: rename vs keep existing | CC (keep existing) | Rename = high regression risk, zero functional benefit for this task. |

## Updated Fix Plan
Based on discussion results, the disputed items are resolved as follows. Agreed items from Comparator remain unchanged.

1. **[P1-CRIT] Fix 1A — Remove HD-08 summary block** — Downgraded from P0 to P1-CRITICAL per D1 resolution. Implementation unchanged.
2. **[P1-CRIT] Fix 1B — Remove cardActionModal** — Downgraded from P0 to P1-CRITICAL per D1 resolution. Implementation unchanged.
3. **[P1-CRIT] Fix 2A — Expand requestStates** — Downgraded from P0 to P1-CRITICAL per D1 resolution. **Keep existing status names** (`pending`, `repeat`, `idle`, `sending`) per D2 resolution. Add only new fields: `lastReminderAt`, `reminderCount`, `remindCooldownUntil`.
4. **[P1-CRIT] Fix 2B — Convert "other" to array** — Downgraded from P0 to P1-CRITICAL per D1 resolution. Implementation unchanged.

All other items (Fix 1C–1G, Fix 2C–2D, Fix 3, Fix 4A–4C, Fix 5, Fix 6A–6B) retain their Comparator-assigned priorities and verdicts. Fix 7 remains SKIP.

## Skipped (for Arman)
No new skips from discussion. Fix 7 (paid gate) was already SKIP per Comparator — `partner.plan` not available in x.jsx.
