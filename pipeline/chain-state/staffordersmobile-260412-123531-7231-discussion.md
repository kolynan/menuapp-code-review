# Discussion Report — StaffOrdersMobile
Chain: staffordersmobile-260412-123531-7231
Mode: CC-Only (v2)

## Disputes Analyzed
Total: 1 dispute from Comparator

### Dispute 1: SCS_SOLID_CHIP — Tailwind classes vs inline styles
**CC Solution:** Replace Tailwind classes (`bg-green-500 text-white`, etc.) with inline style objects using exact iOS system colors from the authoritative HTML mockup: `#34c759` (green), `#ff3b30` (red), `#007aff` (blue). Also add a separate `SCS_CHIP_STYLES` constant for default (non-highlighted) chip outlines using alpha-blended mockup colors (`#34c75920`, etc.).

**Codex Solution:** Did not address implementation form. Simply noted that `SCS_SOLID_CHIP` and other helpers are absent, without specifying whether to use Tailwind or inline styles.

**CC Analysis:**
- Tailwind `bg-green-500` = `#22c55e`. Mockup specifies `#34c759`. Hue difference: ~10-15 degrees, noticeable side-by-side on mobile.
- Tailwind `bg-red-500` = `#ef4444`. Mockup specifies `#ff3b30`. Red is shifted toward orange in mockup (iOS style).
- Tailwind `bg-blue-500` = `#3b82f6`. Mockup specifies `#007aff`. Significantly different — mockup is pure iOS blue.
- The identity block already uses inline styles for pastel urgency backgrounds (`#FFE8E5`, `#FFF1DD`, `#F2F2F7`) — these are NOT available as Tailwind utilities.
- Using inline styles for chips maintains visual consistency with the identity block approach.
- The spec declares the HTML mockup "authoritative" — exact color match is the correct interpretation.
- Default chip alpha-blended backgrounds (`#34c75920`) are also NOT standard Tailwind values, further supporting inline styles.

**Verdict:** CC

**Reasoning:** The HTML mockup is declared authoritative. Tailwind green-500/red-500/blue-500 differ measurably from iOS system colors. The identity block already uses inline styles, so chips should match. Since Codex didn't propose an alternative (just noted absence), there's no counter-argument — CC's inline style approach is the only technically specified solution.

## Resolution Summary
| # | Dispute | Verdict | Reasoning |
|---|---------|---------|-----------|
| 1 | SCS_SOLID_CHIP: Tailwind vs inline styles | CC | Mockup is authoritative; Tailwind colors differ 10-20% from iOS system colors; identity block already uses inline styles |

## Updated Fix Plan
Based on discussion results, the disputed item is resolved as follows.
Agreed items from Comparator remain unchanged.

1. **[P1] SCS_SOLID_CHIP and SCS_CHIP_STYLES — use inline style objects** — Source: discussion-resolved (CC) — Both `SCS_SOLID_CHIP` (highlighted chips) and `SCS_CHIP_STYLES` (default chips) must use inline style objects with exact mockup colors, NOT Tailwind classes. Values:
   - `SCS_SOLID_CHIP`: `{ green: {background:'#34c759',color:'#fff'}, red: {background:'#ff3b30',color:'#fff'}, blue: {background:'#007aff',color:'#fff'} }`
   - `SCS_CHIP_STYLES`: `{ green: {background:'#34c75920',color:'#30a14e'}, red: {background:'#ff3b3020',color:'#ff3b30'}, blue: {background:'#007aff20',color:'#007aff'}, gray: {background:'#f2f2f7',color:'#8e8e93'} }`
   - Apply via `style={...}` attribute, not `className`

## Skipped (for Arman)
None — the single dispute was resolved on clear technical grounds (authoritative mockup + measurable color differences).
