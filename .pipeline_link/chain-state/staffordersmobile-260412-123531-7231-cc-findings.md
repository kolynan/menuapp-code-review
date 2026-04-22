# CC Writer Findings — StaffOrdersMobile
Chain: staffordersmobile-260412-123531-7231

## Findings

1. **[P1] SCS_SOLID_CHIP Tailwind colors don't match authoritative HTML mockup** — The proposed `SCS_SOLID_CHIP` uses Tailwind classes `bg-green-500` (#22c55e), `bg-red-500` (#ef4444), `bg-blue-500` (#3b82f6). But the HTML mockup (declared authoritative) specifies iOS system colors: `#34c759`, `#ff3b30`, `#007aff`. These differ by 10-20% in hue/saturation. Since identity block already uses inline styles for pastels, the highlighted chips should too for visual consistency. FIX: Replace `SCS_SOLID_CHIP` Tailwind classes with inline style objects:
   ```js
   const SCS_SOLID_CHIP = {
     green: { background: '#34c759', color: '#fff' },
     red:   { background: '#ff3b30', color: '#fff' },
     blue:  { background: '#007aff', color: '#fff' },
   };
   ```
   Apply via `style={SCS_SOLID_CHIP[chip.tone]}` instead of className.

2. **[P1] Missing default (outline) chip style definitions** — The spec defines `SCS_SOLID_CHIP` for the longest-chip highlight but provides no equivalent constant for default (non-highlighted) chip styles. The existing `HALL_CHIP_STYLES` (line 351) won't work because: (a) they include `border-*` classes designed for 32px jump chips with visible borders, (b) Tailwind colors (`bg-green-50` = #f0fdf4) differ from mockup (`#34c75920` = green with 12% alpha). The new scsChips are 26px tall, 13px font, pill-shaped — a visually distinct component from jump chips. FIX: Add a `SCS_CHIP_STYLES` constant matching the mockup CSS:
   ```js
   const SCS_CHIP_STYLES = {
     green: { background: '#34c75920', color: '#30a14e' },
     red:   { background: '#ff3b3020', color: '#ff3b30' },
     blue:  { background: '#007aff20', color: '#007aff' },
     gray:  { background: '#f2f2f7',   color: '#8e8e93' },
   };
   ```

3. **[P2] "Свернуть" collapse label missing from new layout spec** — Line 2197 currently renders `{isExpanded && <span>{HALL_UI_TEXT.collapse}</span>}` as a visual hint when the card is expanded. The new collapsed card layout (identity block + chips zone) doesn't mention where this label goes. If omitted, users lose the visual affordance that an expanded card can be tapped to collapse. FIX: Add the collapse label to the right zone, e.g., as a small text below chips or as an absolute-positioned element in the top-right corner of the card:
   ```jsx
   {isExpanded && (
     <span className="text-xs font-semibold text-slate-500 shrink-0 self-start">
       {HALL_UI_TEXT.collapse}
     </span>
   )}
   ```

4. **[P2] Hardcoded Russian string in scsChips computation** — The proposed `scsChips` uses `section.sid === '__null__' ? 'В работе' : section.label` with a hardcoded Russian string. `HALL_UI_TEXT.inProgressShort` (line 343, value "В работе") already exists for exactly this purpose and is used elsewhere (line 2021 in jumpChips). Using the constant maintains i18n consistency. FIX: Replace `'В работе'` with `HALL_UI_TEXT.inProgressShort` in the scsChips computation.

5. **[P2] Chip rendering JSX not fully specified** — The spec describes chip styles textually and provides HTML examples but doesn't give complete React JSX for rendering scsChips in the right zone. The merge step needs explicit JSX to correctly apply: (a) base chip styles (height 26px, padding, border-radius, font), (b) default vs highlighted styles, (c) actionable format (`label count · Xм`) vs non-actionable (`label count`). FIX: Provide explicit render block:
   ```jsx
   <div style={{flex:1, display:'flex', flexWrap:'wrap', gap:'6px', minWidth:0, alignContent:'center'}}>
     {scsChips.length > 0 ? scsChips.map(chip => {
       const isHighlight = chip.key === scsHighlightKey;
       const chipStyle = isHighlight ? SCS_SOLID_CHIP[chip.tone] : SCS_CHIP_STYLES[chip.tone];
       const text = chip.isActionable
         ? `${chip.label} ${chip.count} \u00B7 ${formatCompactMinutes(chip.ageMin)}`
         : `${chip.label} ${chip.count}`;
       return (
         <span key={chip.key} style={{
           height:'26px', padding:'0 9px', borderRadius:'13px',
           fontSize:'13px', fontWeight:600, whiteSpace:'nowrap',
           display:'inline-flex', alignItems:'center',
           ...chipStyle
         }}>{text}</span>
       );
     }) : (
       <span className="text-xs text-slate-400">{HALL_UI_TEXT.noActions}</span>
     )}
   </div>
   ```

6. **[P2] Free table ☆ badge and mine ★ badge missing aria-labels** — The `other` ownership badge correctly specifies `aria-label={HALL_UI_TEXT.otherTableTitle}`. However, the `mine` (★) and `free` (☆) badges have no aria-labels. For accessibility on a mobile staff app, screen readers should announce badge meaning. FIX: Add aria-labels, e.g., `aria-label="Мой стол"` for mine, `aria-label="Свободный стол"` for free — or add keys to HALL_UI_TEXT.

7. **[P1] showOtherTableHint called without event on badge button** — The spec says badge for `other` renders as `<button onClick={(e) => { e.stopPropagation(); showOtherTableHint(e); }}>`. The existing `showOtherTableHint` (line 2065) already calls `event?.stopPropagation()` via optional chaining. While the double stopPropagation is harmless, the critical issue is that the `ownerHintVisible` tooltip (lines 2199-2204) currently renders INSIDE the old `space-y-2` div. In the new flex layout, this tooltip block needs to be placed OUTSIDE the main flex row (identity + chips) or it will break the flex alignment. FIX: Place `ownerHintVisible` block after the main card flex row, as a separate child of the onClick div:
   ```jsx
   <div className="px-4 pt-3 pb-3 cursor-pointer active:opacity-80" onClick={onToggleExpand}>
     {group.type === "table" ? (
       <div> {/* wrapper for new layout + tooltip */}
         <div style={{display:'flex', alignItems:'center', gap:'10px', minHeight:'72px'}}>
           {/* identity wrapper + chips zone */}
         </div>
         {ownerHintVisible && (
           <div className="rounded-lg bg-slate-900 px-3 py-2 text-white mt-2">...</div>
         )}
       </div>
     ) : ( ... )}
   </div>
   ```

## Summary
Total: 7 findings (0 P0, 2 P1, 5 P2, 0 P3)

- Findings 1-2 address color accuracy vs the authoritative HTML mockup — using inline styles instead of Tailwind ensures pixel-perfect match with the iOS-style design system
- Finding 7 addresses a layout correctness issue — tooltip must be outside flex row to avoid breaking alignment
- Findings 3-6 address completeness gaps in the spec that the merge step will need resolved

## Prompt Clarity

- **Overall clarity: 4/5** — Excellent level of detail with HTML mockup, line numbers, and step-by-step instructions. The inline mockup being declared authoritative is very helpful.
- **Ambiguous Fix descriptions:**
  - Fix 1, Step 3: "Chips zone" rendering JSX not fully specified — the spec describes styles textually and in CSS but doesn't provide React JSX for the right zone chip rendering. The merge step will need to synthesize this.
  - Fix 1: "Свернуть" collapse label mentioned in "Keep unchanged" for ownerHintVisible but not mentioned for its own placement in the new layout.
- **Missing context:** None significant — line numbers, function names, and existing code patterns were all provided or easy to verify.
- **Scope questions:** The `isExpanded` collapse text (line 2197) — unclear if it should be preserved, moved, or dropped in the new layout. Assumed it should be preserved.
