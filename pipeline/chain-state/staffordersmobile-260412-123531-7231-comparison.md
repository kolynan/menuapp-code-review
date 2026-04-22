# Comparison Report — StaffOrdersMobile
Chain: staffordersmobile-260412-123531-7231

## Agreed (both found)

### 1. Urgency helpers and chip computation must be added (~line 376 + ~line 2025)
- **CC** (#1, #2): Identified that `SCS_SOLID_CHIP` should use inline styles with exact iOS system colors (#34c759, #ff3b30, #007aff) instead of Tailwind classes, AND that a separate `SCS_CHIP_STYLES` constant is needed for default (non-highlighted) chip styles.
- **Codex** (#1): Identified that `getUrgencyLevel`, `URGENCY_IDENTITY_STYLE`, `SCS_SOLID_CHIP`, `scsChips`, `scsOldestActionable`, `scsUrgency`, `scsHighlightKey` are all absent.
- **Consensus**: Both agree these must be added. CC provides more granular guidance — use inline style objects (not Tailwind classes) to match the authoritative HTML mockup colors exactly. Accept CC's refinement.

### 2. Collapsed table header must be replaced with identity block + chips layout (~lines 2181-2206)
- **CC** (#7): Focused on a specific layout pitfall — `ownerHintVisible` tooltip must be placed OUTSIDE the new flex row to avoid breaking alignment. Provided explicit wrapper structure.
- **Codex** (#2): Identified the full scope — old `space-y-2` header with inline ownership icon, dark pill with white text, zone chip all need replacing with the new identity-wrapper + identity block + right-zone scsChips layout.
- **Consensus**: Both agree this is the core change. Codex covers the full replacement scope; CC adds the critical detail about tooltip placement. Both perspectives needed for merge step.

### 3. Jump chips must move from header to expanded view (~line 2205 → inside `isExpanded` block)
- **CC**: Implicit in the spec analysis (not a separate finding, but referenced in context).
- **Codex** (#3): Explicitly flagged — jump chips still render at line 2205 in always-visible header, and no jump-chip row exists at top of expanded content.
- **Consensus**: Both agree. Codex's explicit call-out is more actionable. Drop `setIsExpanded(true)` from chip onClick handler (already expanded). Keep `HALL_CHIP_STYLES` unchanged (FROZEN UX).

## CC Only (Codex missed)

### 4. [P2] "Свернуть" collapse label placement — ACCEPTED
- **CC** (#3): Line 2197 currently renders `{isExpanded && <span>{HALL_UI_TEXT.collapse}</span>}` as a visual hint. The new layout spec doesn't mention where this goes. Losing it removes a UX affordance.
- **Verdict**: ACCEPTED — valid concern. The merge step should preserve this label. CC's suggestion to place it as a small text in the right zone (shrink-0, self-start) is reasonable. Add it after the chips in the right zone when expanded.

### 5. [P2] Hardcoded Russian "В работе" in scsChips — ACCEPTED
- **CC** (#4): The spec's proposed scsChips uses `'В работе'` hardcoded. `HALL_UI_TEXT.inProgressShort` (line 343) already exists for this.
- **Verdict**: ACCEPTED — straightforward i18n consistency fix. Use `HALL_UI_TEXT.inProgressShort`.

### 6. [P2] Chip rendering JSX not fully specified — ACCEPTED
- **CC** (#5): Spec describes chip styles textually + HTML, but doesn't give complete React JSX for the right zone. CC provides a full render block with inline styles.
- **Verdict**: ACCEPTED — the merge step needs explicit JSX. CC's provided render block is well-structured: handles highlight vs default, actionable vs non-actionable format, and empty state.

### 7. [P2] Free/mine badge missing aria-labels — REJECTED (out of scope)
- **CC** (#6): Only `other` (🔒) badge has `aria-label`. Mine (★) and free (☆) don't.
- **Verdict**: REJECTED — valid observation but out of scope for #288. The spec explicitly defines aria-label only for `other` badge. Adding aria-labels to mine/free is a P3 improvement → note in BUGS.md but don't implement now. Scope lock says: "If you see another issue outside this scope — SKIP IT."

## Codex Only (CC missed)

### 8. [P1] Spec conflict: badge visibility "ALWAYS show" vs "filter==='all'" — ACCEPTED
- **Codex** (prompt clarity note): Fix 1 says ownership badge must "ALWAYS show based on `ownershipState` alone — do NOT add a filter check" but Step 3 says "shown only when `filter==='all'` or equivalent."
- **Verdict**: ACCEPTED — this IS a real conflict in the spec. The authoritative rule is the one in the main Fix 1 description (ALWAYS show, no filter check), because: (a) it explicitly says "do NOT add a filter check", (b) it notes `assignFilters` is NOT a prop of OrderGroupCard, (c) Step 3 appears to be a stale note. **Resolution: ALWAYS show badge. No filter check.**

## Disputes (disagree)

### 9. SCS_SOLID_CHIP: Tailwind classes vs inline styles
- **CC** (#1): Argues Tailwind `bg-green-500` (#22c55e) differs from mockup `#34c759` by 10-20%. Recommends inline style objects.
- **Codex**: Did not address this — simply noted the helpers are missing without discussing implementation form.
- **Resolution**: CC wins. The HTML mockup is declared "authoritative" in the spec. Using inline styles ensures exact color match. The identity block already uses inline styles, so chips should too for consistency. Use inline style objects for both `SCS_SOLID_CHIP` and `SCS_CHIP_STYLES`.

## Final Fix Plan

Ordered list of all fixes to apply, with priority and source:

1. **[P1] Add urgency helpers near line 376** — Source: agreed (CC #1-2 + Codex #1) — Add `getUrgencyLevel()`, `URGENCY_IDENTITY_STYLE`, `SCS_SOLID_CHIP` (inline styles, not Tailwind), and new `SCS_CHIP_STYLES` for default chip colors. All values from authoritative HTML mockup.

2. **[P1] Add scsChips computation after jumpChips (~line 2025)** — Source: agreed (CC + Codex #1) — Add `scsChips` useMemo, `scsOldestActionable`, `scsUrgency`, `scsHighlightKey`. Use `HALL_UI_TEXT.inProgressShort` instead of hardcoded `'В работе'` (CC #4).

3. **[P1] Replace collapsed table header (~lines 2181-2206)** — Source: agreed (CC #7 + Codex #2) — Replace `space-y-2` layout with:
   - Outer wrapper div (for flex row + tooltip)
   - Flex row: identity-wrapper (84px, relative) + right zone (flex-1, wrap chips)
   - Identity wrapper: ownership badge (absolute, top-left, ALWAYS shown per ownershipState — no filter check, per Codex #8 resolution) + identity block (78×54px, pastel urgency bg, centered dark table number)
   - Right zone: scsChips rendered with inline styles, highlight for longest-actionable chip, empty state shows `HALL_UI_TEXT.noActions`
   - ownerHintVisible tooltip OUTSIDE flex row (CC #7)
   - Preserve "Свернуть" label when expanded (CC #3) — small text in right zone

4. **[P1] Move jump chips to expanded view only** — Source: agreed (CC + Codex #3) — Remove jump chips from header (~line 2205). Add jump chips row as first element inside `isExpanded` block, before sections. Keep `HALL_CHIP_STYLES` unchanged (FROZEN). Drop `setIsExpanded(true)` from onClick.

5. **[P2] Hardcoded "В работе" → HALL_UI_TEXT.inProgressShort** — Source: CC only (#4) — Folded into fix #2 above.

6. **[P3] Note in BUGS.md: aria-labels for mine/free badges** — Source: CC only (#6) — Don't implement, just document as future improvement.

## Summary
- Agreed: 3 items (urgency helpers, collapsed header replacement, jump chips relocation)
- CC only: 4 items (3 accepted: collapse label, hardcoded string, chip JSX; 1 rejected: aria-labels)
- Codex only: 1 item (1 accepted: spec conflict on badge visibility)
- Disputes: 1 item (resolved in favor of CC: inline styles for exact color match)
- **Total fixes to apply: 4 main changes** (helpers, scsChips computation, collapsed header JSX, jump chips relocation) + 1 minor note for BUGS.md
