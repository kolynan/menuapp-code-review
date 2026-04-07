# Comparison Report — PublicMenu
Chain: publicmenu-260325-131945-c028

## Agreed (both found)

### 1. [P2] Help drawer uses old multi-step flow — must become one-tap cards
- **CC** (Finding 1): Replace lines 3687–3737 with 2×2 quick-action cards + "Другое" col-span-2. Detailed card definitions array, styling specs, remove standalone Отмена button and always-visible textarea.
- **Codex** (Finding 1): Same scope — replace selector flow with five cards, wire preset cards to `submitHelpRequest(typeOverride)`, keep Другое as only expandable form, remove cancel button + default textarea. Also flags `sm:col-span-1` → `col-span-2` fix for Другое.
- **Verdict:** Full agreement. CC provides more granular implementation detail (card array, styling classes), Codex adds the `sm:col-span-1` breakpoint issue. Merge both perspectives.

### 2. [P2] Success state + auto-close + state reset missing
- **CC** (Finding 3): `closeHelpDrawer` doesn't reset `helpQuickSent`. Provides fix for `closeHelpDrawer` callback.
- **Codex** (Finding 2): No `helpQuickSent` state, no success render, no 2-second auto-close. Provides complete fix: add state + render success UI + setTimeout + reset on close.
- **Verdict:** Full agreement. Codex packages it as one larger finding (state + render + auto-close + reset); CC splits state reset as a separate finding. Same fix — combine into one item for the merge.

### 3. [P2] PM-131: Submit button disabled by `!currentTableId`
- **CC** (Finding 5): `disabled={isSendingHelp || !currentTableId}` at line 3731. Fix: change to `disabled={isSendingHelp || !helpComment.trim()}`.
- **Codex** (Finding 3): Same line, same analysis, same fix. Confirms no `pointer-events-none` found in the drawer slice.
- **Verdict:** Full agreement. Identical fix.

## CC Only (Codex missed)

### 4. [P1] `submitHelpRequest` needs `typeOverride` parameter (CC Finding 2)
- CC identifies that `submitHelpRequest` currently reads from `selectedHelpType` state, and quick-action cards need to pass type directly to avoid React state batching race conditions.
- CC proposes: modify `submitHelpRequest(typeOverride?)` in the `useHelpRequests` hook, or use `setTimeout(submitHelpRequest, 0)` fallback.
- **Validity:** SOLID — this is a real implementation concern. Without `typeOverride`, a quick card would need to `setSelectedHelpType(type)` and then somehow call submit after state updates — fragile with React 18 batching. Codex's Finding 1 mentions "wire preset cards to `submitHelpRequest(typeOverride)`" but doesn't call out the hook modification needed.
- **Accept:** Yes — include as a required implementation step.

### 5. [P2] Need `sendingCardId` tracking state (CC Finding 4)
- CC identifies that when `isSendingHelp=true`, the spec requires showing a spinner on the TAPPED card specifically and disabling others. No current state tracks which card was tapped.
- Proposes `const [sendingCardId, setSendingCardId] = useState(null)`.
- **Validity:** SOLID — necessary for the per-card spinner UX described in the task spec ("show spinner on the tapped card, disable all other cards").
- **Accept:** Yes — include as required.

### 6. [P1] Potential z-index/pointer-events conflict with ChevronDown (CC Finding 6)
- CC flags that the close button at `top-3 right-3` with `z-10` could theoretically conflict with the submit button.
- CC's own assessment: "No additional fix needed if the layout is correct. Just ensure no `pointer-events-none` or `overflow-hidden` is added."
- **Validity:** LOW RISK — CC itself acknowledges this is theoretical. The submit button sits well below the close button in normal flow. Codex explicitly confirmed "no `pointer-events-none` in this drawer slice."
- **Accept:** Include as a verification-only item (no code change needed), downgrade to P3.

## Codex Only (CC missed)

*None.* All Codex findings map to CC findings.

## Disputes (disagree)

*None.* No disagreements between CC and Codex on any finding.

## Final Fix Plan

Ordered list of all fixes to apply:

1. **[P1] Add `typeOverride` parameter to `submitHelpRequest`** — Source: CC — Modify the `submitHelpRequest` function (or wrapper) to accept an optional `typeOverride` parameter so quick-action cards can send immediately without state race conditions.

2. **[P2] Replace help drawer content with one-tap quick-action cards** — Source: Agreed — Replace lines 3687–3737 with: 4 quick-action cards (2×2 grid, immediate submit), "Другое" card (col-span-2, expands textarea+submit inline). Remove standalone Отмена button, remove always-visible textarea. Fix `sm:col-span-1` → persistent `col-span-2` on Другое.

3. **[P2] Add `helpQuickSent` state + success render + auto-close** — Source: Agreed — Add `const [helpQuickSent, setHelpQuickSent] = useState(false)`. Render success state (checkmark + "Запрос отправлен!" + "Официант скоро подойдёт") when true. Auto-close drawer after 2s via setTimeout.

4. **[P2] Add `sendingCardId` tracking state** — Source: CC — Add `const [sendingCardId, setSendingCardId] = useState(null)`. Set on card tap, clear on success/failure. Use for per-card spinner + disable other cards.

5. **[P2] Update `closeHelpDrawer` to reset all new state** — Source: Agreed — Reset `helpQuickSent`, `sendingCardId`, `selectedHelpType`, `helpComment` on drawer close.

6. **[P2] PM-131: Fix submit button disabled condition** — Source: Agreed — Change `disabled={isSendingHelp || !currentTableId}` → `disabled={isSendingHelp || !helpComment.trim()}` on the Другое expanded form's submit button.

7. **[P3] Verify no z-index/pointer-events conflicts** — Source: CC — Post-implementation verification only. No code change expected.

## Summary
- Agreed: 3 items
- CC only: 3 items (3 accepted, 0 rejected)
- Codex only: 0 items
- Disputes: 0 items
- Total fixes to apply: 7 (0 P0, 1 P1, 5 P2, 1 P3 verification-only)
