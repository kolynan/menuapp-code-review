# Merge Report — PublicMenu
Chain: publicmenu-260324-003211-6767

## Applied Fixes
1. [P1] PM-070 — Partner lookup edge case: store primaryError, rethrow if fallback returns null — Source: discussion-resolved (Codex found edge case, CC provided fix) — DONE

## Skipped — Already Fixed
- PM-073 (Fix 2): ALREADY FIXED in S164 (chain 466b). `normalizeId` handles `.id`/`._id` at line 2775.
- PM-075 (Fix 4): ALREADY FIXED in S164 (chain 466b). `autoSubmitTimerRef` at line 1477, cleanup at lines 2156–2158.

## Skipped — Blocked (requires B44 prompt)
- PM-069 (Fix 3): Lockout state (`codeAttempts`, `codeLockedUntil`, `nowTs`) encapsulated inside `useHallTable` hook (B44 import). Cannot expose from page code. Needs B44 prompt.

## Skipped — Invalid Premise
- PM-112 (Fix 5): Task says auto-submit on last digit exists — it does NOT. `onChange` only calls `setTableCodeInput(next)`. The "Отправить" button is the ONLY way to call `verifyTableCode()`. Removing it breaks table code verification. If desired, needs two-part task: (a) add auto-submit on last digit, (b) remove button.

## Skipped — Unresolved Disputes (for Arman)
None — both disputes resolved in Round 1 of discussion.

## Git
- Pre-task: d60a9b3
- Commit: 1ac5648
- Files changed: 1 (pages/PublicMenu/x.jsx)

## Prompt Feedback
- CC clarity score: 3/5
- Codex clarity score: 3/5
- Fixes where writers diverged due to unclear description: PM-112 — task stated auto-submit exists but it doesn't; PM-070 — task described the issue but existing retry UI was already partially in place
- Fixes where description was perfect (both writers agreed immediately): PM-069 (both confirmed blocked), PM-073, PM-075 (both confirmed already fixed)
- Recommendation for improving task descriptions: For PM-112, verify current code behavior before writing fix description. For PM-070, note that retry UI already exists and specify the edge case (primary fails + fallback empty). Pre-check BUGS_MASTER for "already fixed" status before including items in batch.

## Summary
- Applied: 1 fix (PM-070)
- Skipped (already fixed): 2 (PM-073, PM-075)
- Skipped (blocked/B44): 1 (PM-069)
- Skipped (invalid premise): 1 (PM-112)
- Skipped (unresolved): 0 disputes
- MUST-FIX not applied: 3 (PM-069 blocked by B44 hook, PM-112 invalid premise, PM-073/PM-075 already fixed — no action needed)
- Commit: 1ac5648
