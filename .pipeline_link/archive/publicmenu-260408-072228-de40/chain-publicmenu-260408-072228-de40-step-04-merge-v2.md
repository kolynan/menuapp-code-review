---
chain: publicmenu-260408-072228-de40
chain_step: 4
chain_total: 4
chain_step_name: merge-v2
page: publicmenu
budget: 8.00
runner: cc
type: chain-step
---
=== CHAIN STEP: Merge (4/4) ===
Chain: publicmenu-260408-072228-de40
Page: publicmenu

You are the Merge step in a modular consensus pipeline.
Your job: apply the fix plan to the actual code.

INSTRUCTIONS:
1. Read the comparison: pipeline/chain-state/publicmenu-260408-072228-de40-comparison.md
2. Check if discussion report exists: pipeline/chain-state/publicmenu-260408-072228-de40-discussion.md
   - If it exists AND has an "Updated Fix Plan" section → use THAT for disputed items
   - If it says "No disputes" or doesn't exist → use Comparator's "Final Fix Plan" as-is
   - Items marked "Unresolved (for Arman)" → SKIP these, do NOT apply
3. **File integrity check (KB-121 prevention):**
   Run: `wc -l pages/publicmenu/*.jsx`
   - If result matches expected line count from comparison/findings → proceed.
   - If result is unexpectedly low (e.g. differs by 200+ lines from what findings mention) →
     run `git fetch origin && git reset --hard origin/main` then verify again.
   - If still wrong after reset → STOP and write merge report explaining the issue. Do NOT apply changes to a truncated file.
4. Read the code file: pages/publicmenu/*.jsx
5. Apply ALL fixes from the fix plan, in priority order (P0 first)
   - Agreed items from Comparator: always apply
   - Discussion-resolved items: apply the winning solution
   - Unresolved disputes: SKIP (note in merge report)
   - [MUST-FIX] items: CANNOT be skipped. If you cannot apply a MUST-FIX, explain WHY in detail in merge report — do NOT silently skip.
6. After applying fixes:
   a. Update BUGS.md in pages/publicmenu/ with fixed items
   b. Update README.md in pages/publicmenu/ if needed
7. Git commit and push:
   - git add <specific files only> (NEVER git add . or git add -A)
   - git commit -m "fix(publicmenu): N bugs fixed via consensus chain publicmenu-260408-072228-de40"
   - git push
8. Write merge report to: pipeline/chain-state/publicmenu-260408-072228-de40-merge-report.md

FORMAT for merge report:
# Merge Report — publicmenu
Chain: publicmenu-260408-072228-de40

## Applied Fixes
1. [P0] Fix title — Source: agreed/discussion-resolved — DONE
2. [P1] Fix title — Source: comparator — DONE
...

## Skipped — Unresolved Disputes (for Arman)
- Dispute: [title] — CC says X, Codex says Y — NEEDS DECISION

## Skipped — Could Not Apply
- Reason...

## Git
- Commit: <hash>
- Lines before: <N>
- Lines after: <N>
- Files changed: N

## Prompt Feedback
Collect Prompt Clarity sections from CC and Codex findings files (if present), then add your own observations:
- CC clarity score: [N/5]
- Codex clarity score: [N/5]
- Fixes where writers diverged due to unclear description: ...
- Fixes where description was perfect (both writers agreed immediately): ...
- Recommendation for improving task descriptions: ...

## Summary
- Applied: N fixes
- Skipped (unresolved): N disputes
- Skipped (other): N fixes
- MUST-FIX not applied: N (with reasons)
- Commit: <hash>

=== TASK CONTEXT ===
# SOS Help Drawer v6.0 — Fix 1+2+4 Only (Config + Urgency + i18n)
# Part A of hybrid split: safe constants/i18n only — no JSX changes
# R4 ПССК: CC 4/5 (9 issues), Codex 3/5 (7 issues) — Fixes 1+2+4 rated SAFE

## Context
File: pages/PublicMenu/x.jsx (TARGET — edit this file ONLY)
Task: Add new button type config, urgency threshold helpers, and i18n keys for SOS v6.0 Help Drawer.
**NO JSX CHANGES in this task** — only constants, helper functions, and i18n dictionary additions.
Weight: M | Budget: $8 | Chain: С5v2

## Precedence Rule
FROZEN behavior and server/persistence logic > this prompt. Do NOT touch anything outside listed regions.

## FROZEN UX (DO NOT CHANGE)
- All JSX / render code — DO NOT modify any JSX in this task
- `useHelpRequests` hook integration (~lines 1772-1786) — keep as-is
- ServiceRequest polling and server sync (~lines 2044-2260) — keep ALL, **except** line 2130 (see Fix 1 exception below)
- HelpFab button rendering and badge logic (~line 4872) — keep as-is
- All existing help.* i18n keys — grep first, add only NEW keys, do NOT overwrite existing unless explicitly noted

---

## Fix 1 — Update button set and config constants [MUST-FIX]

### Now
4 preset buttons: `call_waiter`, `bill`, `napkins`, `menu` + `other`.
Grep: `HELP_REQUEST_TYPES = useMemo` (~line 1796)
Grep: `HELP_CARD_LABELS = useMemo` (~line 1800)
Grep: `HELP_COOLDOWN_SECONDS = useMemo` (~line 1799)
Grep: `HELP_CHIPS = useMemo` (~line 1807)
Grep: `HELP_PREVIEW_LIMIT` (~line 1795)

### Should be
6 preset buttons: `call_waiter`, `bill`, `plate`, `napkins`, `utensils`, `clear_table`. `menu` kept legacy-only. `other` kept for "Другой запрос?" link.

Replace/update these constants:

```js
const HELP_REQUEST_TYPES = useMemo(() => new Set([
  'call_waiter', 'bill', 'plate', 'napkins', 'utensils', 'clear_table', 'other',
  'menu', // legacy — keep readable for backward compat; NOT shown in SOS grid
]), []);

const HELP_CARD_LABELS = useMemo(() => ({
  call_waiter: tr('help.call_waiter', 'Позвать официанта'),
  bill: tr('help.get_bill', 'Счёт'),
  plate: tr('help.plate', 'Тарелку'),
  napkins: tr('help.napkins', 'Салфетки'),
  utensils: tr('help.utensils', 'Приборы'),
  clear_table: tr('help.clear_table', 'Убрать со стола'),
  other: tr('help.other_label', 'Другое'),
}), [tr]);

// NEW — insert immediately after HELP_CARD_LABELS:
const HELP_CARD_SHORT_LABELS = useMemo(() => ({
  call_waiter: tr('help.call_waiter_short', 'Позвать'),
  bill: tr('help.get_bill_short', 'Счёт'),
  plate: tr('help.plate_short', 'Тарелку'),
  napkins: tr('help.napkins_short', 'Салфетки'),
  utensils: tr('help.utensils_short', 'Приборы'),
  clear_table: tr('help.clear_table_short', 'Убрать'),
  other: tr('help.other_label', 'Другое'),
}), [tr]);

const HELP_COOLDOWN_SECONDS = useMemo(() => ({
  call_waiter: 90, bill: 150, plate: 120, napkins: 120,
  utensils: 120, clear_table: 120, other: 120
}), []);
```

Also remove:
- `HELP_CHIPS = useMemo` (~line 1807) — remove entirely (no longer used in v6.0)
- `HELP_PREVIEW_LIMIT` (~line 1795) — remove entirely (no longer used in v6.0)

**FROZEN exception — update line 2130:**
`const nonOtherTypes = ['call_waiter', 'bill', 'napkins', 'menu']`
→ change to:
`const nonOtherTypes = ['call_waiter', 'bill', 'plate', 'napkins', 'utensils', 'clear_table', 'menu'];`
(add plate/utensils/clear_table; KEEP menu for backward compat)

### Should NOT be
- Do NOT put `menu` in grid/buttons config — only in HELP_REQUEST_TYPES and nonOtherTypes
- Do NOT change any JSX — these are constants only

### Verification
Grep `HELP_REQUEST_TYPES` — should contain `plate`, `utensils`, `clear_table`, AND `menu` (with `// legacy` comment).
Grep `HELP_CARD_SHORT_LABELS` — should exist with 7 entries.
Grep `nonOtherTypes` at line ~2130 — should contain `plate`, `utensils`, `clear_table`, AND `menu`.
Grep `HELP_CHIPS` in pages/PublicMenu/x.jsx — should be 0 occurrences.
Grep `HELP_PREVIEW_LIMIT` — should be 0 occurrences.

---

## Fix 2 — Add urgency threshold constants and helper functions [MUST-FIX]

### Now
No urgency thresholds or urgency helpers exist.

### Should be
Insert AFTER `HELP_COOLDOWN_SECONDS` (~line 1799 — will be slightly later after Fix 1 additions):

```js
// SOS v6.0: Urgency thresholds (seconds)
const HELP_URGENCY_THRESHOLDS = useMemo(() => ({
  std:  { amber: 480, red: 900  },   // 8m / 15m
  bill: { amber: 300, red: 600  },   // 5m / 10m
}), []);

const HELP_URGENCY_GROUP = useMemo(() => ({
  call_waiter: 'std', bill: 'bill', plate: 'std', napkins: 'std',
  utensils: 'std', clear_table: 'std', other: 'std',
}), []);
```

Add helper functions AFTER the new constants (still in component body, before return):

```js
const getHelpUrgency = useCallback((type, sentAt) => {
  if (!sentAt) return 'neutral';
  const elapsedSec = Math.floor((Date.now() - sentAt) / 1000);
  const group = HELP_URGENCY_GROUP[type] || 'std';
  const thr = HELP_URGENCY_THRESHOLDS[group];
  if (elapsedSec >= thr.red) return 'red';
  if (elapsedSec >= thr.amber) return 'amber';
  return 'neutral';
}, [HELP_URGENCY_GROUP, HELP_URGENCY_THRESHOLDS]);

const getHelpTimerStr = useCallback((sentAt) => {
  if (!sentAt) return '';
  const elapsedSec = Math.floor((Date.now() - sentAt) / 1000);
  if (elapsedSec < 60) return '<1м';
  const min = Math.floor(elapsedSec / 60);
  return `${min}м`;
}, []);
```

### Verification
Grep `HELP_URGENCY_THRESHOLDS` — should exist with std/bill groups.
Grep `getHelpUrgency` — should exist as useCallback.
Grep `getHelpTimerStr` — should exist as useCallback.

---

## Fix 4 — Add new i18n keys to BOTH dictionaries [MUST-FIX]

### Now
I18N_FALLBACKS (~line 327, EN) and I18N_FALLBACKS_RU (~line 588, RU) contain old help.* keys.

### Should be
Grep existing keys first, then add only NEW keys (do NOT duplicate existing).

**Add to I18N_FALLBACKS (English) — only if key does NOT already exist:**
```js
"help.get_bill": "Bill",
"help.plate": "Extra plate",
"help.utensils": "Utensils",
"help.clear_table": "Clear the table",
"help.call_waiter_short": "Call",
"help.get_bill_short": "Bill",
"help.plate_short": "Plate",
"help.napkins_short": "Napkins",
"help.utensils_short": "Utensils",
"help.clear_table_short": "Clear",
"help.subtitle_choose": "Choose what you need",
"help.table_default": "Table",
"help.cancel_confirm_q": "Cancel request?",
"help.cancel_keep": "Keep",
"help.cancel_do": "Cancel",
"help.other_request_link": "Something else?",
"help.other_placeholder": "Describe what you need…",
"help.send_btn": "Send",
"help.sent_suffix": "sent",
"help.retry": "Retry",
```

**Add to I18N_FALLBACKS_RU (Russian) — only if key does NOT already exist:**
```js
"help.get_bill": "Счёт",
// ⚠️ Note: this REPLACES existing "Принести счёт" with shorter "Счёт" — intentional for button label
"help.plate": "Тарелку",
"help.utensils": "Приборы",
"help.clear_table": "Убрать со стола",
"help.call_waiter_short": "Позвать",
"help.get_bill_short": "Счёт",
"help.plate_short": "Тарелку",
"help.napkins_short": "Салфетки",
"help.utensils_short": "Приборы",
"help.clear_table_short": "Убрать",
"help.subtitle_choose": "Выберите, что нужно",
"help.table_default": "Стол",
"help.cancel_confirm_q": "Отменить запрос?",
"help.cancel_keep": "Оставить",
"help.cancel_do": "Отменить",
"help.other_request_link": "Другой запрос?",
"help.other_placeholder": "Напишите, что нужно…",
"help.send_btn": "Отправить",
"help.sent_suffix": "отправлено",
"help.undo": "Отменить",
"help.retry": "Повторить",
```

### Verification
Grep `help.plate` in pages/PublicMenu/x.jsx — should exist in BOTH dictionary blocks.
Grep `help.sent_suffix` — should exist in both blocks.
Grep `help.undo` in I18N_FALLBACKS_RU — should exist (Russian fallback for undo toast).

---

## ⛔ SCOPE LOCK — change ONLY what is described above
Edit ONLY `pages/PublicMenu/x.jsx`.
**Allowed edit regions (complete list for this task):**
1. Config constants block (~lines 1795-1813): update HELP_REQUEST_TYPES, HELP_CARD_LABELS, add HELP_CARD_SHORT_LABELS, update HELP_COOLDOWN_SECONDS; REMOVE HELP_CHIPS, HELP_PREVIEW_LIMIT
2. After HELP_COOLDOWN_SECONDS: add HELP_URGENCY_THRESHOLDS, HELP_URGENCY_GROUP
3. Component body (before return): add getHelpUrgency, getHelpTimerStr useCallbacks
4. Server sync line ~2130: update nonOtherTypes array only
5. I18N_FALLBACKS (~line 327): add new help.* keys (EN)
6. I18N_FALLBACKS_RU (~line 588): add new help.* keys (RU)

**DO NOT change:** any JSX, any render code, any hooks, any imports, openHelpDrawer/closeHelpDrawer, ServiceRequest polling, CartView, MenuView, StickyCartBar, or any other area.

## POST-IMPLEMENTATION CHECKS
Grep `HELP_CHIPS` — must be 0 occurrences.
Grep `HELP_PREVIEW_LIMIT` — must be 0 occurrences.
Grep `HELP_CARD_SHORT_LABELS` — must exist.
Grep `getHelpUrgency` — must exist.
Grep `help.undo` in I18N_FALLBACKS_RU block — must exist.
`wc -l pages/PublicMenu/x.jsx` — expected ~5374 ± 50. If < 5200 → ABORT (KB-095).

## Implementation Notes
- File: `pages/PublicMenu/x.jsx` (5374 lines as of RELEASE 260407-00)
- Precondition: `wc -l pages/PublicMenu/x.jsx` = 5374 (±2). If different — STOP and report.
- git add pages/PublicMenu/x.jsx && git commit -m "SOS v6.0 Part A: config constants, urgency helpers, i18n keys"
=== END ===
