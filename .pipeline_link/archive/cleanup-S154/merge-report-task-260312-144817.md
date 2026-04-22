# Merge Report: PublicMenu V7 Smoke Test S116

## Codex Status: COMPLETED (253k tokens, ~15min due to slow Windows filesystem)

## CC Analysis (Claude Code)

### Files Analyzed
- x.jsx (~3462 lines) - main page component
- CartView.jsx (~1253 lines) - cart drawer
- MenuView.jsx (~290 lines) - menu grid/list
- CheckoutView.jsx (~189 lines) - checkout form
- ModeTabs.jsx (~83 lines) - mode tabs
- useTableSession.jsx (~838 lines) - session management hook

### CC Bugs Found and Fixed (3)

| Bug ID | Priority | Description | Fixed |
|--------|----------|-------------|-------|
| BUG-PM-023 | P0 | reviewedItems.has() crashes when prop undefined | YES |
| BUG-PM-024 | P0 | loyaltyAccount.balance.toLocaleString() crashes when null | YES |
| BUG-PM-025 | P1 | draftRatings[itemId] crashes when prop undefined | YES |

## Codex Bugs Found (14 total: 1x P0, 7x P1, 6x P2)

### Agreed with CC (overlap)
- BUG-PM-024 (P0): Codex also flagged loyalty amounts crash — CC already fixed

### CC accepted from Codex (new findings, added to BUGS.md)

| Bug ID | Priority | Description | Regression of |
|--------|----------|-------------|---------------|
| BUG-PM-026 | P1 | tableCodeLength default 5 instead of 4 | BUG-PM-S81-02 |
| BUG-PM-027 | P1 | Loyalty/discount UI hidden for normal checkout (gated on showLoginPromptAfterRating instead of showLoyaltySection) | NEW |
| BUG-PM-028 | P1 | Failed star-rating saves leave dishes permanently locked | NEW |
| BUG-PM-029 | P1 | Table-code auto-verify cannot retry same code after failure | NEW |
| BUG-PM-030 | P1 | Review-reward banner shows before any dish is reviewable | BUG-PM-021 |
| BUG-PM-031 | P1 | Cart can still be closed during order submission | BUG-PM-034 |
| BUG-PM-032 | P2 | Order-status differentiation regressed (no accepted fallback, icons not rendered) | BUG-PM-019 |
| BUG-PM-033 | P2 | Scroll position not reset after table verification | BUG-PM-S81-03 |
| BUG-PM-034 | P2 | Guest code leaked back into drawer header | BUG-PM-020 |
| BUG-PM-035 | P2 | Verified-table block regresses mobile UX (duplicate header, tiny info buttons) | BUG-PM-008 |
| BUG-PM-036 | P2 | Loyalty amounts bypass app localization (hardcoded ru-RU, hardcoded tenge) | NEW |
| BUG-PM-037 | P2 | Reward email flow reports success without validation | NEW |
| BUG-PM-038 | P2 | Submit-error copy says "order saved" when it may not be | NEW |
| BUG-PM-039 | P2 | 8-digit table codes overflow on narrow phones | NEW |

### CC rejected from Codex (0)
None — all Codex findings verified against actual code.

### CC downgraded from Codex (2)
- Codex P0 "tableCodeLength default" -> CC P1 (5-digit codes still work, partner config overrides)
- Codex P1 "status differentiation" -> CC P2 (fallback map exists, just incomplete)
- Codex P1 "scroll reset" -> CC P2 (UX regression, not logic error)

### Notes (not fixed, per F4/F7 rules)

| Priority | Description | File | Reason not fixed |
|----------|-------------|------|-----------------:|
| P2 | console.log/warn in production (10+ instances) | x.jsx, useTableSession.jsx | Not requested, cosmetic |
| P1-P2 | 14 Codex findings above | CartView.jsx, x.jsx | Beyond smoke test scope, added to BUGS.md |

## Summary
- CC found: 3 bugs (fixed in commit e19ed0d)
- Codex found: 14 bugs (documented in BUGS.md as active)
- Overlap: 1 (loyalty balance crash)
- Unique CC: 2 (reviewedItems null guard, draftRatings null guard)
- Unique Codex: 13 (mostly regressions of previously fixed bugs)
- Disputes: 0 (all Codex findings accepted, 3 downgraded in severity)
- Total active bugs: 14 (added to BUGS.md)
