# CC Writer Findings — publicmenu
Chain: publicmenu-260408-072128-52db

## Findings

### Fix 1 — Button set and config constants

1. [P0] HELP_CHIPS removal will crash — HELP_CHIPS is actively referenced in JSX at line 5102 (`{HELP_CHIPS.map(chip => ...}`). Removing this constant without updating JSX causes ReferenceError at runtime. The task says "NO JSX CHANGES" but also says "REMOVE HELP_CHIPS entirely." These are contradictory. FIX: Do NOT remove HELP_CHIPS in this task. Leave it in place. The JSX that uses it must be updated first (in a separate JSX-changing task, Part B). Alternatively, keep HELP_CHIPS but add a `// DEPRECATED v6.0 — remove when JSX is updated` comment.

2. [P0] HELP_PREVIEW_LIMIT removal will crash — HELP_PREVIEW_LIMIT is actively referenced at 3 JSX/logic locations: line 2701 (`setIsTicketExpanded(rowIndex >= HELP_PREVIEW_LIMIT)`), line 4935 (`.slice(0, HELP_PREVIEW_LIMIT)` x2), line 5027 (`activeRequestCount > HELP_PREVIEW_LIMIT`). Removing this constant causes ReferenceError. FIX: Do NOT remove HELP_PREVIEW_LIMIT in this task. Keep it as-is. Remove only when the JSX references are updated.

3. [P2] HELP_CARD_LABELS i18n key change: `help.bill` → `help.get_bill` — The bill entry changes from `tr('help.bill', 'Bring the bill')` to `tr('help.get_bill', 'Счёт')`. The old key `help.bill` at EN dictionary line 535 becomes orphaned (no longer used by this constant). Not a crash risk since HELP_CARD_LABELS is accessed by property name (`HELP_CARD_LABELS.bill`), but `help.bill` should be kept in EN dictionary for backward compat (other code may reference it). FIX: Implement the key change as specified, but do NOT remove `help.bill` from I18N_FALLBACKS.

4. [P2] HELP_CARD_LABELS `tr()` fallback strings changed from English to Russian — All fallback strings in `tr(key, fallback)` change from English (e.g., 'Call a waiter') to Russian (e.g., 'Позвать официанта'). Since these constants use `tr()` (not `t()`/`makeSafeT()`), the Russian fallback will show if B44 doesn't have the key and `tr()` can't resolve it. Mitigated by Fix 4 adding keys to both EN/RU dictionaries. FIX: No code change needed — this is an intentional design choice per the task. Just flagging the behavior change.

### Fix 2 — Urgency thresholds and helpers

5. [P2] `getHelpUrgency` dependency array includes stable references — `HELP_URGENCY_GROUP` and `HELP_URGENCY_THRESHOLDS` are both `useMemo(() => ..., [])` with empty deps, so they never change. Including them in useCallback deps is technically correct (ESLint exhaustive-deps would want them) but functionally redundant. FIX: No change needed — keep as specified for ESLint compliance.

6. [P1] `getHelpUrgency` and `getHelpTimerStr` placement — Task says "component body, before return" but doesn't specify exact location. These functions must be placed AFTER `HELP_URGENCY_GROUP` and `HELP_URGENCY_THRESHOLDS` declarations (to avoid TDZ — KB-107). FIX: Insert helpers immediately after the urgency constants block, before any JSX return statement. Verify no TDZ risk by confirming all referenced constants are declared above.

### Fix 4 — i18n dictionary additions

7. [P1] Fix 4 EN list includes keys that ALREADY EXIST — `help.sent_suffix` (line 528, "sent") and `help.retry` (line 551, "Retry") already exist in I18N_FALLBACKS. Adding them again creates duplicate entries in the JS object (later one silently wins). FIX: Skip `help.sent_suffix` and `help.retry` when adding to I18N_FALLBACKS — they already exist with correct values.

8. [P1] Fix 4 RU list includes `help.retry` which ALREADY EXISTS — `help.retry` at line 603 ("Повторить") already exists in I18N_FALLBACKS_RU. FIX: Skip `help.retry` when adding to I18N_FALLBACKS_RU.

9. [P1] Fix 4 RU `help.get_bill` must UPDATE existing entry, not add duplicate — `help.get_bill` exists at line 596 as "Принести счёт". Task explicitly says replace with "Счёт" (intentional shortening for button label). FIX: Update the existing line 596 value from "Принести счёт" to "Счёт" — do NOT add a second `help.get_bill` entry below.

## Summary
Total: 9 findings (2 P0, 4 P1, 3 P2, 0 P3)

- **2 P0 (CRITICAL):** HELP_CHIPS (line 5102) and HELP_PREVIEW_LIMIT (lines 2701, 4935, 5027) are actively used in JSX — removing them WITHOUT JSX changes causes runtime crashes. Must keep both constants in this task.
- **4 P1:** Duplicate i18n keys in Fix 4 (3 findings) + TDZ placement caution for urgency helpers (1 finding).
- **3 P2:** Key rename side-effect, tr() fallback language change, redundant useCallback deps.

## ⛔ Prompt Clarity

- **Overall clarity: 4/5** — Task is well-structured with clear code snippets, verification steps, and scope lock. The Fix descriptions are precise with before/after states.
- **Ambiguous Fix descriptions:**
  - Fix 1: "REMOVE HELP_CHIPS" and "REMOVE HELP_PREVIEW_LIMIT" directly contradict the "NO JSX CHANGES" constraint — these constants are actively used in 4 JSX locations (lines 2701, 4935, 5027, 5102). The task should have either (a) included JSX cleanup in scope, or (b) explicitly said "keep HELP_CHIPS/HELP_PREVIEW_LIMIT — they'll be removed in Part B."
  - Fix 4: Lists `help.sent_suffix` and `help.retry` for EN addition, and `help.retry` for RU addition, but these keys already exist. The instruction "add only if key does NOT already exist" is present but the code block contradicts it by including existing keys.
- **Missing context:** Whether `tr()` is the raw B44 translation function or the wrapped `makeSafeT` version — affects understanding of the fallback language change in HELP_CARD_LABELS.
- **Scope questions:** None beyond the HELP_CHIPS/HELP_PREVIEW_LIMIT contradiction.
