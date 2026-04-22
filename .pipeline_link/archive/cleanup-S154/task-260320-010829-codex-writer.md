---
task_id: task-260320-010829-codex-writer
status: running
started: 2026-03-20T01:08:30+05:00
type: chain-step
page: PublicMenu
work_dir: C:/Dev/menuapp-code-review
budget_usd: 4.00
fallback_model: sonnet
version: 4.3
launcher: python-popen
---

# Task: task-260320-010829-codex-writer

## Config
- Budget: $4.00
- Mode: task-watcher.py launches Claude Code directly via Popen
- Fallback model: sonnet

## Prompt
---
chain: publicmenu-260320-010828
chain_step: 1
chain_total: 4
chain_step_name: codex-writer
chain_group: writers
chain_group_size: 2
page: PublicMenu
budget: 4.00
runner: codex
type: chain-step
---
Review the file pages/PublicMenu/base/*.jsx for bugs in a React restaurant QR-menu app on Base44 platform.
Also check pages/PublicMenu/README.md and pages/PublicMenu/BUGS.md for context (ONLY these 3 files, nothing else).

SPEED RULES — this is a time-sensitive pipeline step:
- Read ONLY the 3 files above. Do NOT search the repo, do NOT read old findings, do NOT read files outside pages/PublicMenu/.
- Do NOT run rg/grep across the whole repo. Do NOT cross-reference with other pages.
- Limit analysis to the target page code. Be concise.

Find ALL bugs. Focus on: logic errors, missing error handling, i18n issues, UI/UX for mobile-first, React anti-patterns.

For each finding: [P0/P1/P2/P3] Title - Description. FIX: code change needed.

Write findings to: pipeline/chain-state/publicmenu-260320-010828-codex-findings.md

FORMAT:
# Codex Writer Findings — PublicMenu
Chain: publicmenu-260320-010828

## Findings
1. [P0] Title — Description. FIX: ...
2. [P1] Title — Description. FIX: ...

## Summary
Total: N findings (X P0, Y P1, Z P2, W P3)

Do NOT apply fixes — only document findings.

=== TASK CONTEXT ===
Fix 4 P1 bugs in CartView.jsx and x.jsx (BUG-PM-027, 028, 029, 030).

## Files to review
- pages/PublicMenu/base/CartView.jsx
- pages/PublicMenu/base/x.jsx

## Bugs to fix

### BUG-PM-027 (P1): Loyalty/discount UI hidden for normal checkout
- File: CartView.jsx:859, x.jsx:1937,3295
- Symptom: Loyalty section gated on `showLoginPromptAfterRating` instead of `showLoyaltySection`. Email entry, balance display, and point redemption unavailable until after a dish rating exists (never for fresh cart).
- Fix: Use `showLoyaltySection` for checkout loyalty UI; keep `showLoginPromptAfterRating` only for the review nudge prompt.

### BUG-PM-028 (P1): Failed star-rating saves leave dishes permanently locked
- File: CartView.jsx:705,720,725; x.jsx:2039
- Symptom: Item marked read-only when draftRating > 0, but async save can fail. Nothing clears the draft on failure, so user cannot retry rating.
- Fix: Roll back draft rating on save failure (clear draftRating in catch block), or only lock from confirmed `reviewedItems`.

### BUG-PM-029 (P1): Table-code auto-verify cannot retry same code after failure
- File: CartView.jsx:174,184
- Symptom: `lastSentVerifyCodeRef` never cleared on error or after cooldown unlock. Transient API failure forces guest to change digits to retry the same code.
- Fix: Clear `lastSentVerifyCodeRef` on failed verification, on cooldown unlock, and when input becomes incomplete (< full length).

### BUG-PM-030 (P1): Review-reward banner shows before any dish is reviewable
- File: CartView.jsx:386
- Symptom: "+N за отзыв" hint shows when `myOrders.length > 0` regardless of order status. Guests see reward prompt before anything is ready/served.
- Fix: Gate banner on ready/served statuses AND `reviewableItems.length > 0`. See also BUG-PM-021 regression risk.

## Instructions
- Fix all 4 bugs with minimal, targeted changes
- Do NOT refactor unrelated code
- After fixing, update BUGS.md in pages/PublicMenu/ marking all 4 as Fixed
- Git commit with message: "fix(PublicMenu): BUG-PM-027,028,029,030 — loyalty gate, rating rollback, code retry, reward banner"
- Git push
=== END ===


## Status
Running...
