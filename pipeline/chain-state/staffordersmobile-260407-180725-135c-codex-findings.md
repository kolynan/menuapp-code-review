# Codex Reviewer Findings — ПССК Prompt Quality Review
Chain: staffordersmobile-260407-180725-135c

## Issues Found
1. [CRITICAL] Scope lock contradicts the required edit locations — The prompt says all 6 fixes are hall-mode only and forbids touching shared helpers, but it also explicitly requires changes in `HALL_UI_TEXT` and `getOrderActionMeta`, which are shared across render paths. This creates hesitation: follow scope lock strictly, or make the shared edits and risk legacy regressions. PROMPT FIX: explicitly split the scope into `hall-mode JSX only` and `shared helpers intentionally allowed`, and require a legacy-path smoke check for any shared helper/dictionary change.

2. [CRITICAL] Fix 1 does not specify how chip taps expand the collapsed card — The required behavior says chip tap should expand the card and scroll to the section, but the provided handler only does `e.stopPropagation()` and `scrollToSection(chip.kind)`. If the section is not mounted until expansion, this can silently fail. PROMPT FIX: provide the exact expected interaction contract, for example: `setIsExpanded(true)` first, then scroll after layout settles, or explicitly state that `scrollToSection()` already expands the card.

3. [CRITICAL] i18n rules conflict with the prompt’s own snippets — The scope lock says all new user-facing text must use `HALL_UI_TEXT`, but the samples introduce inline Russian strings such as `"Запросы"`, `"В работе"`, `"запр."`, `"нов."`, and also reference keys not listed anywhere (`newShort`, `readyShort`, `guests`, `dishes`). This makes a compliant implementation impossible without guessing. PROMPT FIX: enumerate every required new key up front and rewrite all sample code to use those keys only.

4. [CRITICAL] Fix 6’s patch does not match the stated UX and misses the payment/bill case — The mockup example is action-oriented and includes payment (`→ оплатить 6 239 ₸`), but the provided implementation only handles `requests/new/inProgress/ready` and falls back to status-like abbreviations. The prompt also never defines a bill blocker/action mapping, so one of the main target states is underspecified. PROMPT FIX: add the bill close-blocker path explicitly, define the exact text format for every kind, and remove the status abbreviations from the sample.

5. [CRITICAL] Fix 5 modifies a shared helper while the prompt still claims legacy paths must remain untouched — `getOrderActionMeta` is almost certainly used outside hall-mode, so changing `rowLabel` can alter legacy buttons too. The prompt never acknowledges that cross-path impact or tells the implementer how to validate it. PROMPT FIX: either scope the label change inside hall-mode rendering only, or state clearly that the shared helper will change globally and must be regression-checked in legacy1 and legacy2.

6. [MEDIUM] Chevron/icon guidance is ambiguous and may force forbidden import changes — Fix 2 says use `<ChevronDown>` or plain `›`, but Fix 3’s sample hardcodes `<ChevronDown>`, and the scope lock forbids import edits. Fix 6 also uses `React.Fragment`, which may fail if `React` is not in scope. PROMPT FIX: choose one implementation path that works with existing imports, or explicitly allow the needed import change; prefer fragment shorthand if imports are frozen.

7. [MEDIUM] Fix 2 under-specifies the header/toggle behavior for active sections — The prompt says headers should become “title + chevron,” but it does not say whether those headers are clickable, what state they toggle, or whether `Запросы/Новые/Готово` stay always-open. The requests section is especially vague: it says “move the button to bottom” without an exact replacement snippet or label logic. PROMPT FIX: define, per section, whether the header is static or toggleable and provide one concrete JSX pattern for requests, new, ready, and in-progress subsections.

8. [MEDIUM] Fix 2 and Fix 3 overlap without explicit sequencing — Both fixes touch the in-progress area and bulk-button placement, but one is structural and the other is positional. An implementer can easily do the work twice or preserve the old wrapper longer than intended. PROMPT FIX: merge the in-progress instructions into one fix, or state the dependency explicitly: “Apply Fix 3 first, then place subsection bulk bars inside the new root-level section layout.”

9. [MEDIUM] The pluralization sample is likely wrong or at least too guess-heavy — The prompt builds Russian forms via `HALL_UI_TEXT.guests + 'ь'` / `+ 'я'` / `+ 'ей'` and similar for dishes, but it never defines the base values of those keys. If `HALL_UI_TEXT.guests` already contains a full word, the resulting strings can be malformed. PROMPT FIX: provide explicit plural forms in the prompt or reference an existing helper/constants set that already returns correct localized nouns.

10. [MEDIUM] Validation is mostly text-search, not behavior verification — `grep` checks and line-count checks only prove that strings exist somewhere. They do not validate mobile overflow, scroll behavior, expansion state, section order, close-hint actions, or that legacy paths still render correctly. PROMPT FIX: replace line-based acceptance with behavior-based checks, for example a short mandatory smoke checklist covering collapsed-card chip navigation, expanded section order, legacy-path button labels, and close-hint interactions.

11. [LOW] Command examples are not aligned with the stated shell/environment — The prompt relies on `grep` and `wc -l`, but the environment here is PowerShell on Windows. Even if equivalents exist, the prompt adds friction by assuming a Unix shell. PROMPT FIX: say “use shell-equivalent search/count commands” or provide PowerShell-friendly alternatives.

12. [LOW] The final line-count target is a brittle acceptance criterion — “Expected final: 4427–4447 lines” is not a reliable quality signal and can fail for harmless formatting differences. It can also push an implementer to preserve line count instead of preserving behavior. PROMPT FIX: downgrade the line-count note to a rough reference only, or remove it entirely and rely on functional verification instead.

## Summary
Total: 12 issues (5 CRITICAL, 5 MEDIUM, 2 LOW)

## Fix Clarity Ratings
- Fix 1: 2/5 — clear visual goal, but expansion behavior and i18n keys are under-specified.
- Fix 2: 2/5 — intent is clear, but section toggle behavior and the requests-section implementation are ambiguous.
- Fix 3: 3/5 — structural target is mostly clear, but imports, pluralization, and overlap with Fix 2 create friction.
- Fix 4: 3/5 — narrow change, but it depends on undefined text keys/plural forms.
- Fix 5: 2/5 — small patch, but it contradicts the “no arrow” goal and risks shared-helper regressions.
- Fix 6: 1/5 — the provided patch conflicts with the mockup, misses bill/payment, and breaks its own i18n rule.

Overall prompt score: 4/10

## Additional Risks
- The prompt is over-coupled to current line numbers. If the file has moved even slightly, a careful implementer will need to re-locate every anchor manually.
- The prompt assumes the mockup is the final authority, but several included snippets already diverge from that mockup. Without explicit per-fix precedence, the implementer must improvise.
- The post-task `git add/commit/push` step has no guardrail for a dirty working tree. If the target file already contains unrelated edits, they can be committed accidentally.

## Prompt Clarity (MANDATORY — do NOT skip)
- Overall clarity: 2/5
- What was most clear: the intended UX outcomes at a high level, the hall-mode target area, and the “do not touch legacy render paths” intent.
- What was ambiguous or could cause hesitation: whether shared helpers are allowed to change, how jump chips expand the card, whether active section headers toggle, which new `HALL_UI_TEXT` keys actually exist, and how close-table hints should handle the bill/payment state.
- Missing context: the exact expansion state API for hall-mode, the available icon/import inventory, the existing localized noun/plural helpers, whether `scrollToSection()` already expands content, and whether `getOrderActionMeta` is shared by legacy paths.
