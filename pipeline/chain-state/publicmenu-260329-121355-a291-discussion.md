# Discussion Report — PublicMenu
Chain: publicmenu-260329-121355-a291

## Disputes Discussed
Total: 1 dispute from Comparator

## Round 1

### Dispute 1: Fix 3 — PM-159 (P3): Extra whitespace below "Новый заказ" (h-20 spacer)

**CC Position (SKIP):**
The `h-20` spacer at CartView.jsx line 1000 is **functional infrastructure** — it prevents the sticky footer (`sticky bottom-0` at line 1013) from overlapping the last content card. The comment in the code explicitly states: `{/* Spacer so sticky footer doesn't overlap last content */}`.

Analysis of the code structure:
- Line 997: End of the "Новый заказ" Card component
- Line 1000: `{(cart.length > 0 || todayMyOrders.length > 0) && <div className="h-20" />}` — unconditional spacer
- Line 1003-1010: Error state block (conditional, only shows on error)
- Line 1013: Sticky footer with submit button (`sticky bottom-0 bg-white border-t`)

The spacer ensures content is never hidden behind the sticky footer on any screen size. Removing or reducing it creates a **regression risk**: content could be partially occluded on smaller screens or when the error block is shown.

A proper fix would require **conditional layout logic** — different spacing based on item count, screen height, or whether error is visible. The task explicitly states: *"If a clean fix is not obvious without introducing conditional layout logic, SKIP this fix (it is [NICE-TO-HAVE])."*

There is no non-conditional alternative that safely eliminates the extra whitespace for 1-item carts without risking overlap for multi-item carts or error states. The `h-20` (5rem = 80px) matches the approximate height of the sticky footer (p-4 + button + possible motivation text), making it the correct functional value.

**Codex Position (FIX):**
After prolonged file system timeouts (sandbox scan issues), Codex eventually responded:
> "The correct patch is to remove that spacer entirely, or at minimum stop rendering it for the cart-present state. If a little breathing room is still desired, put a small margin/padding on the footer itself instead of a standalone h-20 block."

Codex suggests two approaches: (a) remove spacer entirely, (b) move spacing to footer's own margin/padding.

**CC Counter-analysis (Round 1 rebuttal):**
Both Codex suggestions have problems:

1. **"Remove spacer entirely"** — The footer uses `sticky bottom-0`, meaning it **overlays** content from the bottom of the scroll container. Without the spacer, the last card's content will be hidden behind the sticky footer when scrolled to bottom. This is the exact regression CC warned about.

2. **"Put margin/padding on the footer itself"** — This does NOT solve the overlap problem. `margin-top` or `padding-top` on a `sticky` element changes the element's own box, not the scroll space above it. The spacer exists as a **scroll offset** — it creates actual scrollable content height so the user can scroll past the last card without it being hidden behind the sticky footer. Footer padding is not a substitute.

3. **"Stop rendering it for cart-present state"** — This IS conditional logic (`cart.length > 0 ? ... : ...`), which the task explicitly says to avoid.

Codex did not address why removing the spacer is safe when `sticky bottom-0` positioning inherently overlaps content. The functional purpose of the spacer remains valid.

**Status:** RESOLVED — SKIP. CC's technical analysis of `sticky` positioning behavior is correct. Codex's alternatives either cause regression (content hidden behind footer) or introduce conditional logic (which the task prohibits). The task's own NICE-TO-HAVE + skip guidance applies.

## Resolution Summary
| # | Dispute | Rounds | Resolution | Winner |
|---|---------|--------|------------|--------|
| 1 | Fix 3 — PM-159 whitespace gap | 1 | resolved: SKIP | CC (per task guidance) |

## Updated Fix Plan
Based on discussion results, the disputed item is resolved as SKIP. Agreed items from Comparator remain unchanged.

The final fix plan (4 fixes to apply, 1 skipped):

1. **[P1] Fix 1 — PM-157: Floating point in StickyCartBar** — Source: AGREED — Wrap `myBill.total` and `tableTotal` with `parseFloat((value || 0).toFixed(2))` before `formatPrice()` in x.jsx lines 2283-2288.

2. **[P2] Fix 2 — #197: Remove confirmation screen clutter** — Source: AGREED — Delete `<p>` with "Ваш заказ" (x.jsx lines 702-704) and `{guestLabel && (...)}` block (x.jsx lines 737-741).

3. **[P2] Fix 4 — #193: MenuView list-mode line-clamp** — Source: AGREED — Change both `line-clamp-2` → `line-clamp-1` in MenuView.jsx renderListCard (lines 94, 96).

4. **[P3] Fix 5 — #144: StickyCartBar Uber Eats redesign** — Source: AGREED — Rewrite StickyCartBar.jsx render: entire bar = single `<button>`, layout: badge | centered label | price+chevron. Keep all existing props and logic. No x.jsx changes needed.

5. **[P3] Fix 3 — PM-159: Whitespace gap** — Source: DISPUTED → **SKIP**. The h-20 spacer is functional infrastructure preventing sticky footer overlap. No clean non-conditional fix exists. Task guidance explicitly says to skip.

## Unresolved (for Arman)
None. The single dispute was resolved by applying the task's own skip guidance.

## Notes
- Codex CLI (v0.116.0, gpt-5.4 model) experienced ~5 min of file system timeouts before producing a response. Despite delays, Codex did provide a substantive verdict (FIX) with two suggested approaches.
- CC rebutted both approaches on technical grounds (`sticky` positioning behavior). Codex did not get a second round as the dispute was resolved.
- Resolution based on: (a) task's explicit skip guidance for NICE-TO-HAVE without clean non-conditional fix, (b) CC's technical analysis of how `sticky bottom-0` overlays content requiring scroll-offset spacer, (c) Codex's alternatives either cause regression or require conditional logic.
