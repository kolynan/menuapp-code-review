# Round 3: Codex Responds to Implementation Details

## Point A: 4 vs 5 Tabs -- RESOLVED
- Codex AGREES to switch to 5 tabs: Home | Menu | Tables | Staff | More
- Added nuance: make it "phase-aware" -- Staff stays in primary nav while onboarding incomplete or pending invites > 0; can move to More later if usage drops
- Claude accepts the phase-aware approach as a good addition

## Point B: Onboarding Checklist -- AGREED with improvements
Codex approved Claude's checklist, added 3 changes:
1. Make "Invite staff" conditionally required (only if multi-staff operation)
2. Add "Run first test order" as required step (prevents untested launch)
3. Define strict completion rules per step (not just page visit)
- Keep Loyalty as optional bonus
- Progress denominator = required steps only

## Point C1: PartnerTables Mobile -- AGREED with adjustments
- Keep +Table visible in zone header (high-frequency)
- Zone secondary actions (QR batch, edit, delete) to overflow -- AGREED
- FAB for +Hall only if safe area allows, otherwise sticky header
- Increase reorder controls touch size

## Point C2: PartnerStaffAccess Mobile -- DISAGREEMENT on swipe
- Codex REJECTS swipe-to-reveal: poor discoverability, web gesture reliability issues, accessibility concerns
- Codex prefers: visible QR + copy buttons + overflow menu
- Codex prefers sticky bottom button over FAB for Invite CTA
- Claude ACCEPTS Codex's rejection of swipe -- valid points about web vs native

## Point C3: MenuManage Mobile -- AGREED with safety tweak
- Codex adds: use Archive instead of hard delete for dishes
- All other points agreed (collapsible categories, up/down buttons, sticky search)
- Choose ONE global pattern for FAB vs top action across all pages

## Point D: PartnerOrderProcess Mobile -- STRONGLY AGREED
- Table rows become mobile cards
- Pipeline preview becomes horizontal scroll strip
- Desktop table headers only on larger breakpoints
- Reorder via up/down, not drag

## Status After Round 3:
All major points resolved. No remaining disagreements.
The only adjustment from Claude's proposals: no swipe gestures (Codex's web accessibility argument wins).
Ready for final synthesis.
