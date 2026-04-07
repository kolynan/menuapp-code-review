# Comparison Report — PublicMenu
Chain: publicmenu-260322-133813
Task: #87 KS-2 — Replace ✕ with chevron ˅ in all bottom sheets

## Agreed (both found)

### 1. [P2] CartView X icon → ChevronDown (CartView.jsx ~line 494)
- **CC #1 + Codex #4 (partial):** Both identify the `<X className="w-5 h-5" />` close button in the cart drawer header needs replacement with `<ChevronDown className="w-6 h-6" />`.
- **Confidence:** HIGH — core requirement of the task.

### 2. [P2] CartView close button tap zone too small (CartView.jsx ~line 492)
- **CC #2 + Codex #4 (partial):** Both note current `p-2` gives ~36px, below 44×44px minimum. Both agree on `w-11 h-11` wrapper.
- **Confidence:** HIGH — explicit in task spec.

### 3. [P2] CartView header not sticky during scroll (CartView.jsx ~line 441)
- **CC #3 + Codex #4 (partial):** Both identify the header scrolls away on long carts. Both agree to add `sticky top-0 z-10`.
- **Confidence:** HIGH — explicit in task spec for scrollable cart drawer.

## CC Only (Codex missed)

### 4. [P3] CartView header comment outdated — ✕ → ˅ (CartView.jsx ~line 440)
- **CC #4:** Comment says `[✕]` but icon will now be `[˅]`.
- **Assessment:** VALID — minor but keeps comments accurate. Accept.

### 5. [P3] CartView comment referencing ✕ outdated (CartView.jsx ~line 1050)
- **CC #5:** Comment says "use ✕ to close" — should say "use ˅ to close".
- **Assessment:** VALID — minor consistency fix. Accept.

### 6. [P3] CartView unused XIcon import (CartView.jsx ~line 2)
- **CC #6:** `XIcon` is imported but unused anywhere in the file.
- **Assessment:** VALID but borderline scope — pre-existing issue, not introduced by this task. Accept as P3 cleanup since we're already editing the import line.

## Codex Only (CC missed)

### 7. [P2] Table confirmation BS — add ChevronDown close button (x.jsx ~lines 3405-3414)
- **Codex #5:** Codex says the table confirmation BS has no explicit close/minimize button and recommends adding a ChevronDown for consistency.
- **CC assessment:** CC explicitly analyzed this and decided NO change needed — the BS is short, has drag handle + CTA flow, and adding a chevron would clutter it.
- **Assessment:** REJECT. CC's reasoning is stronger here. The task says "replace ✕ with ˅" — there is no ✕ to replace in this BS. Adding a new button goes beyond scope ("SCOPE LOCK — менять ТОЛЬКО иконки закрытия/сворачивания bottom sheet (✕ → ˅)"). The drag handle provides sufficient close affordance for a short focused BS.

### 8. [P1] Table verification logic split (x.jsx + CartView.jsx)
- **Codex #1:** Verification can fire twice due to split state.
- **Assessment:** REJECT — OUT OF SCOPE. Task scope is icon replacement only. Valid observation but belongs in BUGS_MASTER.md / BACKLOG, not this fix.

### 9. [P1] Bill-state props dropped (x.jsx → CartView.jsx)
- **Codex #2:** Bill props passed but not accepted/rendered.
- **Assessment:** REJECT — OUT OF SCOPE. Valid observation, record in BUGS_MASTER.md.

### 10. [P1] Partner lookup masks backend failures (x.jsx ~line 1325)
- **Codex #3:** Transient API failures shown as "not found".
- **Assessment:** REJECT — OUT OF SCOPE. Valid observation, record in BUGS_MASTER.md.

### 11. [P2] Rate-limit guard fails open on fetch errors (x.jsx ~line 2389)
- **Codex #6:** `checkRateLimit()` returns true on exception.
- **Assessment:** REJECT — OUT OF SCOPE. Valid observation, record in BUGS_MASTER.md.

### 12. [P3] Reward-email placeholder bypasses i18n (CartView.jsx ~line 530)
- **Codex #7:** Hardcoded `placeholder="email@example.com"`.
- **Assessment:** REJECT — OUT OF SCOPE. Valid observation, record in BUGS_MASTER.md.

## Disputes (disagree)

### Table confirmation BS close button (Codex #5 vs CC out-of-scope note)
- **Codex:** Add ChevronDown button for consistency with cart drawer.
- **CC:** No ✕ exists to replace. BS is short with drag handle + CTA. Adding would clutter.
- **Resolution:** Side with CC. The task scope lock explicitly says "менять ТОЛЬКО иконки закрытия/сворачивания bottom sheet (✕ → ˅)". There is no existing close icon to replace. This is a scope expansion, not a replacement. If desired, it should be a separate BACKLOG item.

## Final Fix Plan

All fixes in **CartView.jsx only**. No changes to x.jsx.

1. **[P2] Replace X with ChevronDown icon** — Source: AGREED (CC#1 + Codex#4) — Change `<X className="w-5 h-5" />` to `<ChevronDown className="w-6 h-6" />` at ~line 494.
2. **[P2] Increase tap zone to 44×44px** — Source: AGREED (CC#2 + Codex#4) — Change button from `p-2 rounded-full` to `w-11 h-11 flex items-center justify-center rounded-full` at ~line 492.
3. **[P2] Make cart header sticky** — Source: AGREED (CC#3 + Codex#4) — Add `sticky top-0 z-10` to header div className at ~line 441.
4. **[P3] Update header comment ✕ → ˅** — Source: CC only (#4) — Update comment at ~line 440.
5. **[P3] Update close comment ✕ → ˅** — Source: CC only (#5) — Update comment at ~line 1050.
6. **[P3] Remove unused XIcon import** — Source: CC only (#6) — Clean up import at ~line 2.

### Out-of-scope Codex findings to record in BUGS_MASTER.md:
- Codex #1: Table verification dual-fire risk (P1)
- Codex #2: Bill-state props dropped (P1)
- Codex #3: Partner lookup masks failures (P1)
- Codex #6: Rate-limit fails open (P2)
- Codex #7: Email placeholder not i18n'd (P3)

## Summary
- Agreed: 3 items (all accepted — core changes)
- CC only: 3 items (3 accepted — comment/import cleanup)
- Codex only: 6 items (0 accepted for this task — 5 out of scope, 1 scope expansion rejected)
- Disputes: 1 item (resolved in favor of CC — no close button exists to replace)
- **Total fixes to apply: 6** (all in CartView.jsx)
- **Total out-of-scope observations to record: 5**
