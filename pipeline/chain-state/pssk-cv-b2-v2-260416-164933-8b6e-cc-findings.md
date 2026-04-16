# CC Reviewer Findings — ПССК Prompt Quality Review
Chain: pssk-cv-b2-v2-260416-164933-8b6e
Reviewer: CC (prompt-quality only; no source code was read per task rules)
Date: 2026-04-16

## Issues Found

### CRITICAL

1. **[CRITICAL] Missing i18n dictionary entries (`cart.header.dish_*`, `cart.order_total`)** — The "⚠️ i18n Exception (B8)" section enumerates 11 keys to be added, but the replacement JSX in Fix 1 also uses `cart.header.dish_one`, `cart.header.dish_few`, `cart.header.dish_many` (three more keys), and Fix 4's self-block uses `cart.order_total`. None of these four keys appear in the dictionary list. КС will either forget them (runtime shows the fallback forever and the review round loop will surface a review flag) or invent ad-hoc keys.
   **PROMPT FIX:** Extend the "Новые ключи" list to include:
   ```
   cart.header.dish_one   → «блюдо»
   cart.header.dish_few   → «блюда»
   cart.header.dish_many  → «блюд»
   cart.order_total       → «Заказ»
   ```

2. **[CRITICAL] R4 persist key name mismatch (`terminalStateShownForVersion` vs `cv_terminal_dismissed`)** — The FROZEN UX table quotes R4 as "Durable persist `terminalStateShownForVersion` (localStorage)". Fix 3 code uses `cv_terminal_dismissed` with the table id. Different semantics: "shown for version" vs "dismissed per table". This is a direct violation of the FROZEN spec that the reviewer is told NOT to challenge. If CC follows Rule 33 literally it will halt; if it follows the code, it violates R4.
   **PROMPT FIX:** Either (a) update the FROZEN quote to match the intended key name (`cv_terminal_dismissed` keyed by table id) and explain why this replaces the "version" concept, or (b) rewrite Fix 3 to use `terminalStateShownForVersion` with an explicit version token (e.g., `${table.id}:${sessionVersion}`). Pick one and make the code + spec consistent.

3. **[CRITICAL] Fix 3 relies on an undefined data field (`currentTable?.status === 'closed'`)** — The prompt itself admits: "Reviewer должен определить верный data source". This is a contract the prompt should resolve before executing CC, not a question to answer during review. If `currentTable.status` does not exist, the Terminal screen will never render and acceptance criteria fail silently.
   **PROMPT FIX:** Before dispatch, author should verify in B44 schema whether Table entity has `status` (and the closed enum value). List the confirmed field and accepted values in the prompt. If it is actually derived from `sessionOrders` or `currentSession`, state the derivation formula. Do not leave data-source discovery to the executor.

4. **[CRITICAL] Fix 4 hardcodes Russian UI string "блюд" without pluralization or `tr()`** — Line: `${items.length} блюд` in the per-order map. This violates Project Rule 4 (i18n Required) and Rule F4 (Fix Only What Is Asked — yet also contradicts instruction "Скопировать паттерн, не изобретать новый"). Also wrong for Russian plurals (1 блюдо, 2 блюда, 5 блюд).
   **PROMPT FIX:** Replace with `pluralizeRu(items.length, tr('cart.header.dish_one','блюдо'), tr('cart.header.dish_few','блюда'), tr('cart.header.dish_many','блюд'))` or explicitly instruct to mirror the existing "other guests" rendering helper. Document the fallback string pattern.

5. **[CRITICAL] Fix 1 `renderedTableDishCount` fallback logic is ambiguous and double-counts** — `count += (itemsByOrder.get(o.id) || []).length || 1`. The `|| 1` falls back to 1 *per order* when items are empty. Then the external note says "если count нельзя из itemsByOrder — использовать `orders.length` как fallback" — that is a DIFFERENT strategy (whole-list fallback). If items are partially loaded, the two approaches produce different totals and may disagree with StaffOrdersMobile / backend counts.
   **PROMPT FIX:** Pick one strategy explicitly: either (a) always trust `itemsByOrder` and omit the `|| 1` — if an order has 0 items, count it as 0; or (b) use `orders.length` everywhere. Remove the contradictory guidance and provide one final formula.

### MEDIUM

6. **[MEDIUM] `pluralizeRu` signature is assumed but not documented** — Fix 1 calls `pluralizeRu(count, one, few, many)` but the prompt never confirms argument order or nullability. A different signature (e.g., `(one, few, many, count)`) would silently produce wrong plurals. Saying "grep shows it exists" is insufficient proof of the exact contract.
   **PROMPT FIX:** Paste the existing function signature from the file (2-3 lines) so CC can pattern-match without guessing.

7. **[MEDIUM] Fix 2 Step 2.4 placement is underspecified** — The instruction "Найти место рендера `statusBuckets.in_progress` (в блоке «Мои» заказов) и добавить «Ожидает» bucket ПОСЛЕ него" lacks a line anchor, and `renderBucketOrders(x, false)` — the second arg `false` is unexplained (is it `isServed`? `showRating`? `expanded`?). CC may pass wrong value.
   **PROMPT FIX:** Add the anchor line number (or the nearest unique grep token, e.g., the exact className of the in_progress wrapper). Document what the 2nd param of `renderBucketOrders` controls and why `false` is correct for pending.

8. **[MEDIUM] Fix 2 Step 2.5 badge JSX placement not specified** — "И в JSX рядом со статусом заказа" is vague. Existing render of `status.icon`/label in lines ~878-910 has multiple candidate insertion points. Different placements produce different visual orderings and reading order.
   **PROMPT FIX:** Show the exact before/after snippet for the badge insertion (e.g., "immediately after `{status.icon} {status.label}` inside the same `<span>`").

9. **[MEDIUM] Fix 2 pending detection guarded by `!stageInfo?.internal_code`** — `isPending = !stageInfo?.internal_code && status === 'submitted'`. If `getOrderStatus(o)` returns a stageInfo with internal_code for submitted orders (e.g., code 'submitted' or 'new'), those orders will fall through to `in_progress` silently.
   **PROMPT FIX:** Either remove the `!stageInfo?.internal_code` guard (rely purely on `o.status === 'submitted'`) or enumerate which `internal_code` values can coexist with `submitted` and test each explicitly. Provide the B44 state-machine mapping inline.

10. **[MEDIUM] Fix 3 Terminal placement conflict (wrap vs. early-return vs. ternary)** — Prompt says "ПЕРЕД основным контентом drawer, после header" and "Reviewer должен предложить точный wrap — либо ternary на верхнем уровне рендера, либо early return". CC executes, not proposes; it needs one concrete answer. Early return vs ternary vs section-wrap each produce different header/footer visibility.
   **PROMPT FIX:** Pick the pattern. Recommendation: early return AFTER header renders but BEFORE main body (so drawer close button still works), or ternary wrapping only the body content. State which one and show the skeleton.

11. **[MEDIUM] Fix 3 `cv_terminal_dismissed` keyed only by most-recent table id** — Stores a single string. Dismissing table A then table B overwrites A. Reopening A re-shows terminal for A. Acceptance criteria says "При повторном открытии того же стола — экран НЕ показывается", which this implementation fails when multiple closed tables interleave.
   **PROMPT FIX:** Use a namespaced store (JSON array or `cv_terminal_dismissed:<tableId>` prefix pattern). Specify max entries and retention (e.g., keep last 10 table ids).

12. **[MEDIUM] Fix 3 `btn btn-outline` class not verified** — The prompt says "проверить что классы существуют в файле (grep: `btn-outline`). Если нет — использовать className из существующей кнопки" but doesn't paste the existing button's className. CC will guess.
   **PROMPT FIX:** Paste the exact className string from line ~1221's "Вернуться в меню" button (the prompt already references it). Two fewer grep calls during execution.

13. **[MEDIUM] Fix 4 contradicts itself on "copy pattern, don't invent"** — Instruction 4 under Шаг 4.1 notes: "Структуру render блюд адаптировать под ТОЧНЫЙ паттерн из строк ~863-910. Скопировать паттерн, не изобретать новый." Yet the prompt body shows a fully invented self-block JSX (card + inline formatted per-order map with hardcoded "блюд"). Executor will prefer the larger visible snippet over the footnote.
   **PROMPT FIX:** Either paste an authoritative ~30-line snippet of lines 863-910 and say "use verbatim for the inner map", or state "the self-block JSX above is the authoritative version; lines 863-910 are reference only".

14. **[MEDIUM] Fix ordering not stated** — Fix 2 introduces `isOrderPending`, Fix 4 reuses that concept inside its self-block. If Fix 4 is applied before Fix 2, the badge styling will exist without the bucket and vice versa. No ordering directive given.
   **PROMPT FIX:** Add an explicit section "Apply order: 1 → 2 → 4 → 3 (Fix 3 last because drawer-wrap changes render tree)".

15. **[MEDIUM] `submittedTableTotal` leftover unused definition** — Fix 1 says "Не удалять определение `submittedTableTotal` (может использоваться в другом месте — проверить grep)" but also Acceptance Criteria: "`submittedTableTotal` НЕ используется в header render после фикса". The useMemo stays, but uses drop to (possibly) zero. Dead code alerts will fire.
   **PROMPT FIX:** Either explicitly instruct to remove the useMemo if no other usage remains after Fix 1 (with a grep command to confirm), or justify keeping it. Do not leave executor in limbo.

### LOW

16. **[LOW] Duplicate i18n key `cart.header.you_label` vs `cart.table.you`** — Both render "Вы" (one in Мои header, one in Стол self-block). Semantically identical strings; two keys allow future drift.
    **PROMPT FIX:** Reuse a single key (`cart.header.you_label` = «Вы») in both Fix 1 and Fix 4, or state the reason they must stay separate.

17. **[LOW] `parseFloat(x.toFixed(2))` pattern undocumented** — Appears 4 times in Fix 1/3/4. Pattern rounds to 2 decimals then back to number. For KZT/RUB amounts the project explicitly notes "Не форсировать Math.round() на ценах" (KB-167). toFixed(2) keeps 2 decimals but may truncate a 0.01 KZT in edge cases. Risk is minimal but contradicts KB-167's spirit.
    **PROMPT FIX:** Add a one-line comment clarifying that `parseFloat(x.toFixed(2))` is strictly for display normalization (formatPrice input), not stored amounts, and is consistent with KB-167.

18. **[LOW] Regression check step not runnable** — "Таб «Мои» открывается" etc. are manual-UI checks with no commands. CC can't execute them from CLI.
    **PROMPT FIX:** Convert to grep-based invariants (e.g., `grep -c "statusBuckets.in_progress" CartView.jsx` should be ≥1 before and after). Keep the manual list for Arman.

19. **[LOW] Mobile-first check has no concrete breakpoint guidance** — "Header «Вы:»/«Стол:» text wraps gracefully on narrow screens" — but the rendered `<p>` uses no `break-words` or `flex-wrap` utility. A long "5 гостей · 12 блюд · 123 456 ₸" may overflow 375px.
    **PROMPT FIX:** Specify the className should include `whitespace-normal break-words` or `flex flex-wrap gap-1`. Or confirm parent container already handles this.

20. **[LOW] "Cdx" collaboration unclear in this CC-only step** — The chain step name is `pssk-cc-reviewer`, group `reviewers` size 2, but the prompt is routed only to CC. If Codex is a parallel reviewer (chain_total:1 says single step), the collaboration note at top of system rules doesn't apply here. Harmless but confusing.
    **PROMPT FIX:** At the top, explicitly state "CC is one of two independent reviewers; no Codex merge in this step." (Metadata hint, not functional.)

## Line Number Verification

Per task rules (⛔ DO NOT read code files) I did not open CartView.jsx. Line numbers in the table below reflect only the prompt's internal consistency — whether the prompt's own claims agree with each other.

| Reference | Prompt says | Internal consistency | Status |
|-----------|------------|----------------------|--------|
| File size | 1227 lines | Preparation grep expects 1227 | ✅ consistent |
| `submittedTableTotal` definition | ~line 525 | Also ~528 in Fix 2 grep | ⚠️ ±3 line drift, acceptable |
| Header render "Заказано на стол" | ~line 799 | Acceptance says "after fix not in header" | ✅ consistent |
| `const getSafeStatus` | ~line 309 | Fix 2 references it at ~882 | ✅ consistent |
| `statusBuckets` | ~line 456-467 | Fix 2 re-refs same range | ✅ consistent |
| `groupLabels` | ~line 575-577 | Fix 2 adds pending_unconfirmed key | ✅ consistent |
| `pluralizeRu` | "grep: pluralizeRu → ~line 804" | Elsewhere unspecified | ⚠️ same line as header render, plausible |
| `renderBucketOrders` | ~line 627 | Used in Fix 2 Step 2.4 | ✅ consistent |
| `myGuestId` definition | ~line 508 | Filter at ~line 511 | ✅ consistent |
| `otherGuestsExpanded` toggle | ~line 838, render at ~861 | Section 5 header at ~833 | ✅ consistent |
| `getGuestLabelById` | ~line 533 | Used in Fix 4 | ✅ consistent |
| `currentTable` prop | ~line 19 | Status field: **UNKNOWN** | ❌ prompt admits gap (see CRITICAL #3) |
| `onClose` prop | ~line 72 | Used in Fix 3 | ✅ consistent |
| Return-to-menu button | ~line 1221 | Fix 3 references className | ⚠️ className not pasted |

## Fix-by-Fix Analysis

- **Fix 1 (Header Attribution + Rendered-Data Invariant) — RISKY.** Core idea is sound and the replacement JSX is mostly spelled out. But missing dish_one/few/many dictionary keys, ambiguous `|| 1` fallback in `renderedTableDishCount`, undocumented `pluralizeRu` signature, and unresolved "keep vs delete `submittedTableTotal`" make this a medium-effort risk. Will likely require one clarification round.

- **Fix 2 (⏳ Ожидает bucket) — RISKY.** Bucket classification logic is mostly correct, but (a) pending detection guarded by `!stageInfo?.internal_code` may misclassify real-world orders; (b) Step 2.4 lacks a concrete insertion anchor and `renderBucketOrders(..., false)` 2nd arg is unexplained; (c) Step 2.5 badge JSX has no exact placement. Expect 1-2 executor questions.

- **Fix 3 (Terminal screen) — BLOCKER-LEVEL RISKY.** The data-source question (`currentTable.status`) is unresolved, the localStorage semantics mismatch R4 FROZEN, the storage scheme only remembers one table, and the terminal-vs-body render wrap pattern is left to the executor. This fix is not ready for autonomous execution.

- **Fix 4 (Self-first Стол) — RISKY.** Placement and scope are clear, but the hardcoded Russian "блюд" string, lack of i18n/pluralization, and self-contradiction between "copy existing pattern" and "use the invented JSX above" will produce either a lint/review failure or an i18n regression. Dictionary needs `cart.order_total` added.

## Summary
Total: 20 issues (5 CRITICAL, 10 MEDIUM, 5 LOW)
Prompt clarity rating: 3/5

## Prompt Clarity (MANDATORY)
- **Overall clarity:** 3/5
- **What was most clear:**
  - FROZEN UX table is well-structured; IDs make it easy to trace back to DECISIONS_INDEX.
  - "НЕ делать" sections for each fix prevent scope creep.
  - Grep verification commands scoped per Fix let executor sanity-check before editing.
  - Acceptance criteria bullets are testable for Fix 1, 2, 4.
- **What was ambiguous or could cause hesitation:**
  - Fix 3 data-source (`currentTable.status`) marked as "reviewer decides" — that is a pre-dispatch decision, not an execution-time one.
  - Fix 3 localStorage key name contradicts R4 FROZEN quote.
  - `renderBucketOrders(..., false)` second argument never explained.
  - "Copy existing pattern" vs "use JSX shown above" conflict in Fix 4.
  - Fix ordering between blocks not stated, yet Fix 2 and Fix 4 share `isOrderPending`.
- **Missing context:**
  - `pluralizeRu` exact signature.
  - B44 Table entity schema excerpt (does `status` exist? enum values?).
  - The full className of the existing "Вернуться в меню" button (line ~1221) — prompt mentions it but does not paste.
  - Existing per-order-row JSX from lines 863-910 for Fix 4 reuse.
  - Four i18n keys (`cart.header.dish_*`, `cart.order_total`) missing from the dictionary list despite appearing in code.
  - No preserved-test-plan for the rating-flow regression.

## Fix Ratings (MANDATORY)

| Fix | Rating (1-5) | Verdict | Key issue (if any) |
|-----|-------------|---------|-------------------|
| Fix 1 Header+Invariant [BUG] | 3/5 | Needs clarification | Missing `dish_*` i18n keys, ambiguous `|| 1` count fallback, `pluralizeRu` signature unverified, `submittedTableTotal` keep/delete undecided |
| Fix 2 Ожидает bucket [NEW CODE] | 3/5 | Needs clarification | Pending guard `!stageInfo?.internal_code` risks misclassification; Step 2.4 anchor vague; `renderBucketOrders(..., false)` 2nd arg undocumented; Step 2.5 badge placement not pinned |
| Fix 3 Terminal screen [NEW CODE] | 2/5 | Major issues (close to rewrite) | Data source (`currentTable.status`) unresolved; localStorage key mismatches FROZEN R4; single-value store breaks multi-table dismissal; render-wrap pattern left to executor; `btn btn-outline` classes not verified |
| Fix 4 Self-first Стол [BUG] | 3/5 | Needs clarification | Hardcoded "блюд" violates i18n + Russian plural rules; self-contradictory "copy pattern / use JSX shown"; missing `cart.order_total` key |

Overall prompt verdict: **NEEDS REVISION** (Fix 3 at 2/5, all others at 3/5 — none meet the ≥4/5 threshold)

Recommended prerequisites before re-dispatch:
1. Confirm `currentTable.status` data source (or provide alternative).
2. Reconcile R4 persist key naming.
3. Add the 4 missing i18n dictionary entries.
4. Paste `pluralizeRu` signature and the existing return-to-menu button className.
5. Decide fix application order and state it.
