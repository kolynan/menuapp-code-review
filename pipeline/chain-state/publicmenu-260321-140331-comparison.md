# Comparison Report — PublicMenu
Chain: publicmenu-260321-140331

## Agreed (both found)

### A1. [P1] Inline table code input in CartView violates just-in-time spec
- **CC #7** (P1) + **Codex #2** (P1)
- Both agree: CartView.jsx lines ~1035-1239 render the full table verification UI inside the drawer BEFORE submit tap. This violates the PM-064 spec ("just-in-time ONLY — only on submit tap").
- **Fix:** Remove the entire inline verification block from CartView.jsx. The Bottom Sheet in x.jsx becomes the sole table-confirmation surface.
- **Confidence:** HIGH — both agree, spec is explicit.

### A2. [P1] Bottom Sheet hardcodes 4 code slots instead of dynamic tableCodeLength
- **CC #8** (P1) + **Codex #3** (P1, partial)
- Both agree: x.jsx Bottom Sheet uses `Array.from({ length: 4 })`, `maxLength={4}`, `.slice(0, 4)` — ignores `partner?.table_code_length` (3-8 range).
- **Fix:** Compute `tableCodeLength` from `partner?.table_code_length || 4` in x.jsx scope and replace all hardcoded `4`.
- **Confidence:** HIGH.

### A3. [P1] Bottom Sheet missing primary CTA "Подтвердить и отправить"
- **CC #12** (P1) + **Codex #3** (P1, partial)
- Both agree: spec requires a terracotta CTA button. Currently only code slots and a "Change" link exist.
- **Fix:** Add primary CTA button (terracotta bg, white text) that calls verifyTableCode then auto-submits.
- **Confidence:** HIGH — spec is explicit.

---

## CC Only (Codex missed)

### C1. [P3] CategoryChips activeColor prop likely ignored by imported component — ACCEPT (document only)
- **CC #1** — `activeColor="#B5543A"` is correctly passed in x.jsx:3182 but `CategoryChips` is imported from `@/components/publicMenu/refactor/CategoryChips`. If that component hardcodes indigo internally, the prop has no effect.
- **Verdict:** ACCEPT as documentation. Page-side code is correct — this needs a B44 prompt to fix the component. Not actionable in this chain.

### C2. [P3] Clean confirmations (ModeTabs, MenuView, CheckoutView, x.jsx, CartView) — ACCEPT (informational)
- **CC #2-6** — Confirms no indigo remnants in page files. Useful context.
- **Verdict:** ACCEPT as informational. No fix needed.

### C3. [P2] Bottom Sheet missing cooldown/lockout/attempts logic — ACCEPT
- **CC #9** — CartView has full cooldown/lockout (codeAttempts, codeLockedUntil, nowTs). Bottom Sheet has none.
- **Verdict:** ACCEPT. When inline input is removed (A1), this logic must move to the Bottom Sheet or a shared hook. Important for production UX.

### C4. [P2] Bottom Sheet "Change" button incomplete — no "Not my table?" functionality — ACCEPT
- **CC #10** — Current button only calls `setTableCodeInput('')`. Spec says "Не тот стол? Изменить" should provide table change.
- **Verdict:** ACCEPT. Should clear table binding or offer selection, not just clear input.

### C5. [P2] Bottom Sheet missing auto-verify on full code entry — ACCEPT
- **CC #11, #15** — CartView has useEffect that auto-triggers verifyTableCode when input reaches tableCodeLength. Bottom Sheet has no such trigger.
- **Verdict:** ACCEPT. Without auto-verify AND without CTA (A3), the user has no way to submit from the Bottom Sheet.

### C6. [P2] Bottom Sheet doesn't check locked/cooldown state — ACCEPT (merged with C3)
- **CC #13** — If user was locked out, Bottom Sheet doesn't know.
- **Verdict:** ACCEPT, merge with C3 — cooldown state must be available in Bottom Sheet scope.

### C7. [P2] CartView table code state duplication — ACCEPT (conditional)
- **CC #14** — Moot if inline input removed (A1). Otherwise needs state lifting.
- **Verdict:** ACCEPT conditionally. If A1 is implemented (remove inline input), this resolves itself. Document as "resolved by A1".

### C8. [P1] Order silently dropped when user closes Bottom Sheet without verification — ACCEPT
- **CC #16** — If user closes Bottom Sheet, `pendingSubmitRef` resets and order is silently lost. No toast/feedback.
- **Verdict:** ACCEPT. Should show toast like "Для отправки заказа нужно подтвердить стол" when Bottom Sheet is closed without completing verification.

---

## Codex Only (CC missed)

### X1. [P0] Hall submit bypasses table verification when currentTableId exists but isTableVerified=false — ACCEPT (escalate to P0)
- **Codex #1** — `handleSubmitOrder` gates on `!currentTableId` (x.jsx:2622), but the verified hall path gates on `isTableVerified` (x.jsx:2635). If a QR provides `currentTableId` without verification, the code falls through to the generic branch and creates a hall order without table/session/guest.
- **Verdict:** ACCEPT. This is a genuine logic gap — a race condition or stale session could create orphan orders. CC missed this. **P0** is justified — data integrity issue.
- **Fix:** Gate on `!isTableVerified` instead of (or in addition to) `!currentTableId`. Add guard in generic branch to reject unverified hall orders.

### X2. [P1] Partner lookup swallows backend errors as "not found" — REJECT (out of scope)
- **Codex #4** — Partner query catches exceptions and returns null, page renders "partner not found" for all null cases.
- **Verdict:** REJECT for this chain. Valid observation but: (a) not related to PM-062 or PM-064, (b) partner lookup has worked this way since launch, (c) changing error handling is a separate task. Document in BUGS_MASTER as a future improvement.

### X3. [P1] x.jsx imports from @/components not from base/* sibling files — REJECT (Base44 architecture)
- **Codex #5** — x.jsx imports from `@/components/publicMenu/...` not from `pages/PublicMenu/base/*`.
- **Verdict:** REJECT. This is how Base44 works — `@/components` is the runtime path. The `base/` files in our repo ARE the same files, stored here for review. This is not a bug, it's the platform architecture. Codex misunderstood the repo structure.

### X4. [P2] Submit error fallback says "order saved" on failure — ACCEPT (minor scope stretch)
- **Codex #6** — CartView falls back to "Ваш заказ сохранён. Попробуйте снова" on submit error — factually wrong if order wasn't created.
- **Verdict:** ACCEPT as P2 documentation. It's a real i18n/UX bug but slightly outside PM-062/PM-064 scope. Include in fix plan as low-priority if touching CartView anyway.

### X5. [P3] i18n/accessibility regressions in controls — ACCEPT (document only)
- **Codex #7** — Hardcoded English aria labels in CheckoutView, hardcoded placeholder in CartView, missing aria-labels in MenuView.
- **Verdict:** ACCEPT as P3 documentation. Valid i18n findings but out of scope for this batch. Document in BUGS_MASTER.

---

## Disputes (disagree)

### D1. PM-062 root cause — "needs B44 prompt" (CC) vs "fix the base files" (Codex)
- **CC** says page-side code is correct (`activeColor="#B5543A"` passed), issue is in imported `CategoryChips` component that ignores the prop. Needs B44 prompt.
- **Codex** didn't explicitly address this — it focused on other issues and didn't produce a PM-062-specific finding.
- **Resolution:** CC's analysis is more thorough here. CC grep'd all files and confirmed zero indigo remnants in page code. The fix is outside page scope. **Document as "needs B44 prompt" in BUGS_MASTER, no code fix in this chain.**

### D2. Codex P0 severity for hall submit bypass
- **Codex** rates the `currentTableId` vs `isTableVerified` gap as P0.
- **CC** found the related issue (#16, order dropped on close) but rated it P1 and didn't identify the deeper `currentTableId`/`isTableVerified` mismatch.
- **Resolution:** Codex's P0 is justified — an unverified hall order reaching the backend without table data is a data integrity issue. **Accept P0.**

---

## Final Fix Plan

Ordered by priority. All fixes target PM-064 (table confirmation) unless noted.

| # | Priority | Title | Source | Description |
|---|----------|-------|--------|-------------|
| 1 | **P0** | Gate hall submit on `isTableVerified` | Codex (X1) | Change intercept condition from `!currentTableId` to `!isTableVerified`. Add guard in generic branch. |
| 2 | **P1** | Remove inline table verification from CartView | Agreed (A1) | Delete CartView.jsx lines ~1035-1239 (inline table code UI). Bottom Sheet becomes sole surface. |
| 3 | **P1** | Add primary CTA to Bottom Sheet | Agreed (A3) | Add "Подтвердить и отправить" terracotta button. On click: verify + auto-submit. |
| 4 | **P1** | Use dynamic tableCodeLength in Bottom Sheet | Agreed (A2) | Replace hardcoded `4` with `partner?.table_code_length \|\| 4`. |
| 5 | **P1** | Toast on Bottom Sheet close without verification | CC (C8) | Show "Для отправки заказа нужно подтвердить стол" toast when closed. |
| 6 | **P2** | Move cooldown/lockout logic to Bottom Sheet | CC (C3+C6) | Lift codeAttempts/codeLockedUntil to x.jsx scope or shared hook. |
| 7 | **P2** | Add auto-verify on full code entry | CC (C5) | useEffect triggers verifyTableCode when input length === tableCodeLength. |
| 8 | **P2** | Fix "Change" button to clear table binding | CC (C4) | "Не тот стол? Изменить" should reset table state, not just clear input. |
| 9 | **P2** | Fix submit error fallback message | Codex (X4) | Replace misleading "order saved" fallback with neutral retry text. |
| 10 | **P3** | Document PM-062 as B44 prompt needed | CC (C1) | CategoryChips component ignores activeColor prop. No page-side fix possible. |
| 11 | **P3** | Document i18n/a11y regressions | Codex (X5) | Hardcoded aria labels, missing i18n in controls. Future batch. |

---

## Summary

- **Agreed:** 3 items (A1, A2, A3) — all P1, high confidence
- **CC only:** 8 items (4 accepted as fixes: C3, C4, C5, C8; 2 informational: C1, C2; 2 conditional/merged: C6→C3, C7→resolved by A1)
- **Codex only:** 5 items (1 P0 accepted: X1; 2 rejected: X2 out-of-scope, X3 architecture misunderstanding; 1 P2 accepted: X4; 1 P3 accepted: X5)
- **Disputes:** 2 items (D1 resolved — B44 prompt needed; D2 resolved — P0 accepted)
- **Total fixes to apply:** 9 actionable + 2 document-only = 11 items
- **Rejected:** 2 Codex findings (X2 partner error handling — out of scope; X3 import paths — platform architecture)
