# Comparison Report — PublicMenu
Chain: publicmenu-260320-141634

## Agreed (both found)
Both CC and Codex identified these issues — HIGH confidence, apply all.

### 1. Reward-email accepts invalid emails (CC#3 = Codex#6) — P2
- **CC fix:** Regex email validation before save, error toast on invalid format.
- **Codex fix:** Same + await real save/lookup result, localize placeholder text.
- **Verdict:** Codex's fix is slightly more thorough (adds await + placeholder i18n). Use CC's fix as base, incorporate Codex's placeholder localization if practical.

### 2. Hardcoded locale and currency (CC#5 = Codex#7) — P2
- **CC fix:** Remove hardcoded `ru-RU`, use browser default, replace `₸` with `formatPrice()`, i18n for points suffix.
- **Codex fix:** Pass one shared locale-aware formatter into CartView and OrderStatusScreen.
- **Verdict:** Same direction. CC already applied a concrete fix. Codex suggests a shared formatter which is a good idea but potentially larger scope. CC's applied fix is sufficient.

### 3. Table-code UI overflow on narrow phones (CC#8 = Codex#9) — P2
- **CC fix:** `w-8 sm:w-9` + `gap-1 sm:gap-2` + `flex-wrap justify-center`.
- **Codex fix:** Make slot width/gaps responsive or switch to wrapped/single-input layout.
- **Verdict:** Agreed. CC's concrete responsive fix addresses the issue.

### 4. Production debug logging exposes guest data (CC#9 = Codex#10) — P2
- **CC fix:** Removed `console.log("Order created")`, replaced 40-line debug useEffect with no-op (preserving hook order).
- **Codex fix:** Remove logs or gate behind build-time dev flag.
- **Verdict:** Agreed. CC's approach (remove + preserve hook order) is correct for Base44 where build flags aren't available.

### 5. Icon-only controls missing aria-label and < 44px touch (CC#10 = Codex#11) — P3
- **CC fix:** Added `aria-label` and `min-w-[44px] min-h-[44px]` to bell, save/cancel, info buttons.
- **Codex fix:** Same scope but mentions additional buttons (drawer close, remove-item X).
- **Verdict:** Agreed. CC's fix covers the main buttons. Codex identifies a few extra locations — include if practical, but not critical.

## CC Only (Codex missed)
Items found only by CC — evaluated for validity.

### 6. [P0] Loyalty points deducted before order creation (CC#1) — ACCEPT
- CC moved `LoyaltyTransaction.create` + `LoyaltyAccount.update` to AFTER `Order.create()` in both flows.
- This is a **critical data integrity fix** — points must not be deducted if the order fails.
- Codex#1 is related (post-create failure handling) but didn't catch the ordering problem. Codex assumed order was already created first; CC fixed the actual sequencing bug.
- **Verdict:** Accept. This is the highest-priority fix in the entire set.

### 7. [P1] localStorage crash in private/restricted browsers (CC#2) — ACCEPT
- `isBillOnCooldown()` and `setBillCooldownStorage()` call localStorage without try/catch.
- Real crash risk in Safari private mode, restricted corporate browsers, etc.
- **Verdict:** Accept. Straightforward defensive fix.

### 8. [P2] Submit-error subtitle says "order saved" when it wasn't (CC#4) — ACCEPT
- i18n key `error.send.subtitle` misleads user into thinking order persisted.
- CC changed to neutral retry text.
- **Verdict:** Accept. UX correctness fix, low risk.

### 9. [P2] loyalty_redeem_rate `|| 1` treats 0 as falsy (CC#6) — ACCEPT
- Changed to `?? 1` (nullish coalescing).
- Note: Codex found a *similar* pattern (`|| 10` for review_points in Codex#5) but at a different location. These are distinct bugs with the same root cause.
- **Verdict:** Accept. Minimal, correct fix.

### 10. [P2] Redirect-banner setTimeout leak on unmount (CC#7) — ACCEPT
- Added cleanup return in useEffect.
- Standard React pattern, no risk.
- **Verdict:** Accept.

## Codex Only (CC missed)
Items found only by Codex — evaluated for validity.

### 11. [P1] Partial order commits reported as full failure (Codex#1) — ACCEPT (reduced to P2)
- After CC's P0 fix reordered loyalty deduction to after Order.create(), this becomes: if *post-order* side effects (loyalty, bulk items, partner update) fail, the UI shows full retry even though the order exists.
- Valid concern but less critical now that the ordering is fixed. Downgrade to P2.
- **Verdict:** Accept as P2. Add post-create phase tracking so UI doesn't encourage duplicate orders.

### 12. [P2] Accepted statuses collapse to "new", badges ignore icons (Codex#2) — ACCEPT
- `getSafeStatus()` lacks `accepted` fallback; badges render only label without icon.
- Valid UX bug — guests lose status distinction.
- **Verdict:** Accept. Add `accepted` case and render icon in status badges.

### 13. [P2] Drawer scroll not reset after table verification (Codex#3) — ACCEPT
- After verification, cart remains scrolled to bottom where code was entered.
- Valid UX issue.
- **Verdict:** Accept. Restore scroll-to-top on verification success.

### 14. [P2] Guest code leaked into main header label (Codex#4) — ACCEPT
- `effectiveGuestCode` shows internal code even when `hallGuestCodeEnabled` is off.
- Valid privacy/UX bug.
- **Verdict:** Accept. Gate storage fallback behind `hallGuestCodeEnabled`.

### 15. [P2] Review-reward CTA invents +10 bonus when no reward exists (Codex#5) — ACCEPT
- `(partner?.loyalty_review_points || 10)` shows +10 even when disabled or set to 0.
- Same `||` vs `??` pattern as CC#6 but different field (`review_points` vs `redeem_rate`).
- **Verdict:** Accept. Replace `|| 10` with `?? 0` and gate bonus text behind active rewards.

### 16. [P2] Verified-state online-order panel wastes mobile space (Codex#8) — REJECT
- The amber block rendering logic is intentional UX for showing online-order benefits.
- Removing it without UX review could confuse users who expect confirmation.
- **Verdict:** Reject for now. Add to BACKLOG as UX evaluation item (not a bug fix).

## Disputes (disagree)
No direct disputes — CC and Codex approached from different angles but didn't contradict each other on any specific fix.

The only near-dispute is CC#1 (P0, reorder loyalty deduction) vs Codex#1 (P1, post-create failure handling). These are **complementary**, not conflicting: CC's fix addresses the sequencing, Codex's addresses the error handling after sequencing is fixed. Both should be applied.

## Final Fix Plan
Ordered list of all fixes to apply, with priority and source:

1. **[P0] Loyalty points deducted before order creation** — Source: CC — Move loyalty deduction after Order.create() in both flows
2. **[P1] localStorage crash in private browsers** — Source: CC — Wrap localStorage in try/catch
3. **[P2] Partial order post-create failure handling** — Source: Codex — Track post-create phase, don't show retry for already-created orders
4. **[P2] Reward-email invalid format** — Source: Agreed (CC+Codex) — Validate email, await result, error toast on failure
5. **[P2] Submit-error subtitle misleading** — Source: CC — Change to neutral retry text
6. **[P2] Hardcoded locale and currency** — Source: Agreed (CC+Codex) — Use browser locale, formatPrice(), i18n for points
7. **[P2] loyalty_redeem_rate || vs ??** — Source: CC — Change to ?? 1
8. **[P2] Review-reward CTA || 10 bug** — Source: Codex — Change to ?? 0, gate behind active rewards
9. **[P2] Redirect-banner setTimeout leak** — Source: CC — Add cleanup in useEffect
10. **[P2] Table-code UI overflow** — Source: Agreed (CC+Codex) — Responsive width/gap
11. **[P2] Production debug logging** — Source: Agreed (CC+Codex) — Remove logs, preserve hook order
12. **[P2] Accepted statuses / badge icons** — Source: Codex — Add accepted fallback, render icons
13. **[P2] Drawer scroll reset after verification** — Source: Codex — Scroll to top on verification
14. **[P2] Guest code leaked into header** — Source: Codex — Gate behind hallGuestCodeEnabled
15. **[P3] Icon-only controls aria-label + touch targets** — Source: Agreed (CC+Codex) — Add aria-labels, min 44px

## Summary
- **Agreed:** 5 items (email, locale, overflow, debug logs, aria-labels)
- **CC only:** 5 items (5 accepted, 0 rejected) — loyalty order P0, localStorage P1, submit error text, redeem rate ||, setTimeout leak
- **Codex only:** 6 items (5 accepted, 1 rejected) — post-create handling, accepted status, drawer scroll, guest code leak, review reward ||, ~~online-order panel~~
- **Disputes:** 0 items
- **Total fixes to apply:** 15
