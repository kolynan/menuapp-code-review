# Comparison Report — PublicMenu
Chain: publicmenu-260320-173330
Task: Batch 1 — Apply Terracotta Primary + Semantic Palette

## Agreed (both found)

Both CC and Codex identified hardcoded indigo/green colors that must become terracotta. Codex rolled these into a single finding (#6) while CC enumerated each instance individually.

| # | Description | CC ref | Codex ref | Priority |
|---|-------------|--------|-----------|----------|
| A1 | Guest name edit link indigo (CartView line 469) | CC #12 | Codex #6 | P1 |
| A2 | Guest name edit link 2nd instance (CartView line 506) | CC #13 | Codex #6 | P1 |
| A3 | Loyalty info box bg-indigo-50 (CartView line 940) | CC #16 | Codex #6 | P1 |
| A4 | Submit CTA green → terracotta (CartView line 1254) | CC #17 | Codex #6 | P1 |
| A5 | "Track Order" button indigo (x.jsx line 759) | CC #2 | Codex #6 | P1 |
| A6 | Main page loader indigo (x.jsx line 2983) | CC #5 | Codex #6 | P1 |

## CC Only (Codex missed)

All are ON-SCOPE color palette items. CC was more granular.

| # | Description | CC ref | Priority | Accept? |
|---|-------------|--------|----------|---------|
| C1 | Loader spinner indigo (x.jsx line 1013) | CC #1 | P1 | YES — clear indigo→terracotta |
| C2 | Phone icon indigo (x.jsx line 1145) | CC #3 | P1 | YES — clear indigo→terracotta |
| C3 | Phone number text indigo (x.jsx line 1146) | CC #4 | P1 | YES — clear indigo→terracotta |
| C4 | OrderConfirmation bg-white → warm (x.jsx line 618) | CC #6 | P2 | YES — fullscreen overlay, should be warm |
| C5 | OrderStatus loading bg-white → warm (x.jsx line 1011) | CC #7 | P2 | YES — fullscreen overlay |
| C6 | OrderStatus invalid-token bg-white → warm (x.jsx line 993) | CC #8 | P2 | YES — fullscreen overlay |
| C7 | OrderStatus error bg-white → warm (x.jsx line 1022) | CC #9 | P2 | YES — fullscreen overlay |
| C8 | OrderStatus expired bg-white → warm (x.jsx line 1040) | CC #10 | P2 | YES — fullscreen overlay |
| C9 | Confirmation "Back to menu" button needs terracotta (x.jsx line 740-744) | CC #11 | P2 | YES — primary CTA needs palette |
| C10 | Loyalty info icon indigo (CartView line 848) | CC #14 | P1 | YES — clear indigo→terracotta |
| C11 | Loyalty info icon 2nd instance (CartView line 858) | CC #15 | P1 | YES — clear indigo→terracotta |
| C12 | Status default fallback blue→amber for "sent" (CartView line 241, 272) | CC #21 | P2 | YES — matches STYLE_GUIDE sent=amber |
| C13 | OrderStatusBadge "new" blue→amber (x.jsx line 573) | CC #22 | P2 | YES — matches STYLE_GUIDE |
| C14 | OrderStatusBadge "accepted" blue→amber (x.jsx line 574) | CC #23 | P2 | YES — matches STYLE_GUIDE |
| C15 | osGetStatusConfig "new" blue→amber (x.jsx line 795) | CC #24 | P2 | YES — matches STYLE_GUIDE |

CC also noted bg-white areas to KEEP AS-IS (CC #18, #19, #20) — these are correct decisions (cards within drawers, sticky CTA bar, retry button red). Not counted as fixes.

## Codex Only (CC missed)

Codex found several items. Most are **OUT OF SCOPE** for this color-palette task — they are logic/architecture bugs unrelated to visual palette changes.

| # | Description | Codex ref | Priority | Accept? | Reason |
|---|-------------|-----------|----------|---------|--------|
| X1 | Order creation race — items created after loyalty redeem | Codex #1 | P0 | REJECT for this chain | Logic bug, not color. Record in BUGS_MASTER. |
| X2 | Session polling re-arms after unmount | Codex #2 | P0 | REJECT for this chain | Logic bug, not color. Already tracked (PM-041 fixed in S149). |
| X3 | Cart survives mode switches with invalid dishes | Codex #3 | P1 | REJECT for this chain | Logic bug, not color. Record in BUGS_MASTER. |
| X4 | Pickup/delivery checkout drops loyalty UI | Codex #4 | P1 | REJECT for this chain | Feature gap, not color. Record in BUGS_MASTER. |
| X5 | Hall confirmation shows wrong total | Codex #5 | P1 | REJECT for this chain | Logic bug, not color. Record in BUGS_MASTER. |
| X6 | Codex #6 additional files: MenuView.jsx, CheckoutView.jsx, ModeTabs.jsx | Codex #6 (partial) | P1 | PARTIAL ACCEPT | See Disputes below. |
| X7 | Verified-table block wastes space on mobile | Codex #7 | P2 | REJECT for this chain | UX/layout, not color. |
| X8 | Scroll reset targets wrong element | Codex #8 | P2 | REJECT for this chain | Logic bug, not color. |
| X9 | Cart modal backdrop not touch-friendly | Codex #9 | P2 | REJECT for this chain | UX/interaction, not color. |
| X10 | i18n leaks (toast fallback, email placeholder) | Codex #10 | P2 | REJECT for this chain | i18n, not color. Record in BUGS_MASTER. |

## Disputes (disagree)

### D1: Scope of Codex #6 — additional files beyond x.jsx and CartView.jsx

**Codex** says hardcoded colors also exist in `MenuView.jsx`, `CheckoutView.jsx`, `ModeTabs.jsx` and lists specific lines.

**CC** only analyzed the two files specified in the task: `x.jsx` and `CartView.jsx`.

**Resolution:** The task explicitly says "Files to process: 1. x.jsx, 2. CartView.jsx". However, Codex is right that other files may have indigo colors. **For this chain, stick to the two specified files.** The additional files should be recorded in BUGS_MASTER as Batch 2 candidates. Codex #6 is PARTIALLY ACCEPTED — the x.jsx + CartView.jsx instances are already covered in Agreed items, and the extra files are out of scope.

### D2: CC #22-24 — Status "new"/"accepted" blue→amber

**CC** proposes changing "new" and "accepted" status from blue to amber per STYLE_GUIDE (sent=amber).

**Codex** did not mention status color corrections at all.

**Resolution:** CC's reading of STYLE_GUIDE is correct: "Sent/Waiting" = amber. However, "new" and "accepted" are intermediate states that could reasonably stay blue as "Preparing" color. The task says "Do NOT change status colors (green/amber/blue/red) — they are already standard Tailwind." **DEFER** — these are debatable and the task constraints say not to change status colors. Record as BUGS_MASTER suggestion for Arman to decide.

## Final Fix Plan

Ordered list of all fixes to apply (scope: x.jsx + CartView.jsx, colors only):

### x.jsx fixes (11 items)

| # | Priority | Title | Source | Line(s) | Change |
|---|----------|-------|--------|---------|--------|
| 1 | P1 | Loader spinner indigo→terracotta | CC only | ~1013 | `text-indigo-500` → `style={{color:'#B5543A'}}` |
| 2 | P1 | Track Order button indigo→terracotta | Agreed | ~759 | `text-indigo-600` → `style={{color:'#B5543A'}}` |
| 3 | P1 | Phone icon indigo→terracotta | CC only | ~1145 | `text-indigo-500` → `style={{color:'#B5543A'}}` |
| 4 | P1 | Phone number text indigo→terracotta | CC only | ~1146 | `text-indigo-600` → `style={{color:'#B5543A'}}` |
| 5 | P1 | Main page loader indigo→terracotta | Agreed | ~2983 | `text-indigo-600` → `style={{color:'#B5543A'}}` |
| 6 | P2 | OrderConfirmation bg→warm surface | CC only | ~618 | `bg-white` → `style={{backgroundColor:'#faf9f7'}}` |
| 7 | P2 | OrderStatus loading bg→warm | CC only | ~1011 | `bg-white` → `style={{backgroundColor:'#faf9f7'}}` |
| 8 | P2 | OrderStatus invalid-token bg→warm | CC only | ~993 | `bg-white` → `style={{backgroundColor:'#faf9f7'}}` |
| 9 | P2 | OrderStatus error bg→warm | CC only | ~1022 | `bg-white` → `style={{backgroundColor:'#faf9f7'}}` |
| 10 | P2 | OrderStatus expired bg→warm | CC only | ~1040 | `bg-white` → `style={{backgroundColor:'#faf9f7'}}` |
| 11 | P2 | Confirmation "Back to menu" button → terracotta | CC only | ~740-744 | Add `style={{backgroundColor:'#B5543A', color:'white'}}` |

### CartView.jsx fixes (7 items)

| # | Priority | Title | Source | Line(s) | Change |
|---|----------|-------|--------|---------|--------|
| 12 | P1 | Guest name edit link indigo→terracotta | Agreed | ~469 | `text-indigo-600` → `style={{color:'#B5543A'}}` |
| 13 | P1 | Guest name edit link 2nd→terracotta | Agreed | ~506 | `text-indigo-600` → `style={{color:'#B5543A'}}` |
| 14 | P1 | Loyalty info icon→terracotta | CC only | ~848 | `text-indigo-600` → `style={{color:'#B5543A'}}` |
| 15 | P1 | Loyalty info icon 2nd→terracotta | CC only | ~858 | `text-indigo-600` → `style={{color:'#B5543A'}}` |
| 16 | P1 | Loyalty info box bg→primary light | Agreed | ~940 | `bg-indigo-50` → `style={{backgroundColor:'#F5E6E0'}}` |
| 17 | P1 | Submit CTA green→terracotta | Agreed | ~1254 | `bg-green-600 hover:bg-green-700` → `style={{backgroundColor:'#B5543A'}}` + disabled: `bg-slate-100 text-slate-400 cursor-not-allowed` |
| 18 | P2 | (no change) Red retry button | CC note | ~1253 | KEEP AS-IS — red is semantic error color |

### Deferred items (record in BUGS_MASTER, not fix in this chain)

| # | Source | Description | Why deferred |
|---|--------|-------------|--------------|
| D1 | Codex #6 | MenuView.jsx, CheckoutView.jsx, ModeTabs.jsx have indigo colors | Out of scope — task specifies only x.jsx + CartView.jsx. Batch 2. |
| D2 | CC #22-24 | Status "new"/"accepted" blue→amber | Task says "do NOT change status colors". Needs Arman decision. |
| D3 | Codex #1 | Order creation race condition (P0) | Logic bug, not color palette task |
| D4 | Codex #2 | Session polling after unmount (P0) | Logic bug, already tracked PM-041 |
| D5 | Codex #3 | Cart survives mode switches (P1) | Logic bug, not color |
| D6 | Codex #4 | Pickup/delivery drops loyalty UI (P1) | Feature gap, not color |
| D7 | Codex #5 | Hall confirmation wrong total (P1) | Logic bug, not color |
| D8 | Codex #7-9 | UX issues (table block, scroll, backdrop) | UX/layout, not color |
| D9 | Codex #10 | i18n leaks | i18n, not color |

## Summary

- **Agreed:** 6 items (both found the same indigo/green instances in x.jsx + CartView.jsx)
- **CC only:** 15 items (11 accepted for fix, 4 informational keep-as-is notes)
- **Codex only:** 10 items (0 accepted for this chain — all out of scope; 1 partial overlap with Agreed)
- **Disputes:** 2 items (both deferred — extra files out of scope, status colors per task constraints)
- **Total fixes to apply:** 17 (5 P1 in x.jsx + 6 P2 in x.jsx + 5 P1 in CartView.jsx + 1 P2 note keep-as-is)
- **Deferred to BUGS_MASTER:** 9 items (2 P0, 3 P1, 4 P2 from Codex)

### Assessment

CC provided thorough, granular coverage of the actual palette task — every indigo instance, every bg-white surface, with clear per-line fixes. Codex focused more on architecture/logic bugs and rolled the color findings into one broad item (#6), but usefully flagged additional files (MenuView, CheckoutView, ModeTabs) that CC didn't analyze. The Codex logic bugs (P0 order race, P0 polling) are real and important but belong in a separate chain — this task is strictly visual palette changes.

The merge step should apply all 17 fixes from the Final Fix Plan above, targeting only x.jsx and CartView.jsx.
