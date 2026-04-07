# Discussion Report — PublicMenu
Chain: publicmenu-260324-153540-d45d

## Disputes Discussed
Total: 1 dispute from Comparator

### Dispute: Fix 3 data source — Partner-level vs Per-dish discount fields

## Round 1

### Dispute 1: PM-118 discount display — which data source?

**CC Position:**
Use partner-level fields. Evidence:
1. MenuView.jsx uses `partner?.discount_enabled === true && (partner?.discount_percent ?? 0) > 0` in ALL 4 discount blocks (lines 100, 142, 219, 278).
2. x.jsx line 2021 already defines `const discountEnabled = partner?.discount_enabled === true;` — the file's own existing pattern is partner-level.
3. The task spec explicitly says "use SAME pattern as MenuView.jsx."
4. Using per-dish fields would cause UX inconsistency: same dish could show different prices in list view (partner-level) vs detail card (per-dish), confusing customers.
5. Current code at line 3685 (`detailDish.discount_enabled === true && detailDish.original_price`) is the ONLY place in the entire codebase using per-dish discount fields — it's the outlier, not the pattern.

**Codex Position:**
Codex was unable to provide a substantive response to the dispute question due to sandbox file access limitations (PowerShell constrained language mode blocked all file reads). Codex spent the entire session attempting to read files rather than analyzing the dispute with the evidence provided in the prompt.

However, from the original Codex writer findings (codex-findings.md), Codex's position was: use "this page's dish cards" guard pattern `discount_enabled === true && (discount_percent ?? 0) > 0` with per-dish `original_price` and `discount_percent`. This was ambiguous — it could be interpreted as either partner-level or per-dish, since Codex didn't specify `detailDish.` or `partner?.` prefix.

**Status:** RESOLVED — CC wins by evidence.

## Resolution Summary
| # | Dispute | Rounds | Resolution | Winner |
|---|---------|--------|------------|--------|
| 1 | PM-118 discount data source (partner vs per-dish) | 1 | resolved | CC |

**Resolution reasoning:**
The codebase evidence is unambiguous:
- `grep -n "partner.*discount_enabled" pages/PublicMenu/MenuView.jsx` → 4 matches (lines 100, 142, 219, 278), ALL partner-level
- `grep -n "partner.*discount_enabled" pages/PublicMenu/x.jsx` → line 2021 uses partner-level
- `grep -n "detailDish.discount_enabled" pages/PublicMenu/x.jsx` → line 3685 (the ONLY per-dish usage, the outlier to fix)
- Task spec: "use SAME pattern as MenuView.jsx" → partner-level is the only valid choice
- UX consistency: list/tile views show partner-level discount → detail card must match

## Updated Fix Plan
Based on discussion results, the disputed item is resolved:

1. **[P2] PM-118: Discount display alignment** — Source: discussion-resolved (CC wins)
   - Guard: `partner?.discount_enabled === true && (partner?.discount_percent ?? 0) > 0`
   - Discounted price: `Math.round(detailDish.price * (1 - partner.discount_percent / 100))`
   - Original price (strikethrough): `detailDish.price` (this IS the original/base price; the calculated value is the discounted one)
   - Badge: `-{partner.discount_percent}%`
   - Badge color: `partner?.discount_color || '#C92A2A'`
   - Price text color: `partner?.primary_color || '#1A1A1A'`

## Unresolved (for Arman)
None — the single dispute was resolved with clear codebase evidence.

## Note on Codex Participation
Codex CLI (gpt-5.4) was invoked but could not participate meaningfully in the discussion due to Windows sandbox restrictions (PowerShell constrained language mode blocked file reads). The dispute was resolved based on direct codebase evidence verified by CC. This is consistent with KB-084b (Codex sandbox issues on Windows).
