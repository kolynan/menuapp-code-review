# Merge Report — PublicMenu
Chain: publicmenu-260408-143544-d0bc

## Applied Fixes

None. All 6 fixes were blocked by unanimous CC + Codex consensus.

## Skipped — Task Premise Incorrect (ALL 6 FIXES)

Both CC and Codex independently verified that **every symbol targeted for deletion has live references in the active drawer JSX (lines 4974-5281)**. The task incorrectly assumed these were dead code after КС-A — but КС-A only updated the HelpFab card grid outside the drawer. The drawer interior (ticket board, chips, helpers) remains live and will only be replaced in B2.

| Fix | Item | [MUST-FIX] | Reason Skipped |
|-----|------|------------|----------------|
| Fix 1 | HELP_PREVIEW_LIMIT | Yes | Live refs at lines 5020, 5112 — controls collapsed ticket view + "Show all" button |
| Fix 2 | HELP_CHIPS | Yes | Live ref at line 5187 — renders chip buttons in Other form |
| Fix 3 | ticketBoardRef + callbacks | Yes | Live refs at lines 5008, 5025 — scroll-to-ticket + highlight behavior |
| Fix 4 | focusHelpRow | Yes | Live ref at line 5147 — scrolls to existing ticket on re-tap |
| Fix 5 | 7 helper functions | Yes | All have live refs in drawer JSX (lines 5021, 5030, 5031, 5058, 5067) + 2 transitive |
| Fix 6 | Hook comments ("dead") | Yes | Both hooks are live — `isTicketExpanded` controls drawer state at 8+ locations, `highlightedTicket` drives row highlighting at line 5025 |

### MUST-FIX Explanation

All 6 fixes were marked [MUST-FIX] in the task. None could be applied because:

1. **Fixes 1-5**: Deleting these symbols would cause immediate `ReferenceError` crashes for any user who opens the help drawer. The drawer JSX at lines 4974-5281 is the ONLY `<Drawer>` component in the file and is actively rendered.

2. **Fix 6**: Adding "dead" comments to actively-used hooks is factually misleading. `isTicketExpanded` is used at 8+ lines controlling drawer state switching. `highlightedTicket` drives visual highlighting at line 5025.

The SCOPE LOCK instruction ("DO NOT touch any JSX return blocks") creates an inherent contradiction — you cannot delete symbols that are referenced by JSX blocks while also not touching those JSX blocks.

## Skipped — Unresolved Disputes (for Arman)

None. Both reviewers agreed on all items.

## Recommended Path Forward (Unanimous CC + Codex)

- **Option A (recommended):** Merge B1 scope into B2. Delete constants/helpers/refs AS PART OF the drawer JSX rewrite, ensuring zero dangling references.
- **Option B:** Close B1 with zero fixes. Proceed directly to B2.

## Git
- Commit: none (0 code changes)
- Pre-task HEAD: 0012e3f
- Lines before: 5459 (x.jsx)
- Lines after: 5459 (unchanged)
- Files changed: 0

## Prompt Feedback
- CC clarity score: 2/5
- Codex clarity score: 2/5
- Fixes where writers diverged due to unclear description: None — both writers AGREED on all 6 items (unusual case: both rejected all fixes for the same reason)
- Fixes where description was perfect: None — all 6 fix descriptions contained the same fundamental error (claiming symbols are dead when they have live JSX references)
- Root cause of low clarity: The task premise ("these symbols have ZERO references in current JSX") was not verified against the actual codebase. A simple `grep` for each symbol would have revealed the live references.
- Recommendation for improving task descriptions: Before writing a cleanup/dead-code task, run `grep -n "SYMBOL_NAME" file.jsx` for EVERY symbol and include the full reference list in the task. If any references exist in JSX return blocks, the symbol cannot be deleted without also modifying those blocks.

## Summary
- Applied: 0 fixes
- Skipped (task premise incorrect): 6 fixes (all MUST-FIX — see explanation above)
- Skipped (unresolved disputes): 0
- MUST-FIX not applied: 6 — all symbols have live JSX references; deleting would crash the help drawer
- Commit: none
