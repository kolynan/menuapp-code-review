# Codex Reviewer Findings — ПССК Prompt Quality Review
Chain: staffordersmobile-260407-185431-ae6d

## Issues Found
1. [CRITICAL] Jump-chip scroll sequence can fail on first tap — Fix 1 tells the agent to call `setIsExpanded(true); scrollToSection(chip.kind);` in the same click handler. If the target sections only mount after expansion, the scroll can run before the DOM exists, so the new jump-bar’s main behavior becomes flaky or non-functional. PROMPT FIX: require a deferred scroll mechanism, for example storing a `pendingScrollKind` and scrolling in an effect after expansion, or using `requestAnimationFrame`/`setTimeout` after the expanded state commits.

2. [CRITICAL] Fix 6 provides an unsafe JSX structure for the close hint — The proposed snippet wraps clickable `<button>` elements inside a `<p>`, which is invalid HTML nesting and can cause browser auto-correction, layout drift, or React DOM warnings. The same snippet also returns shorthand fragments from `.map(...)` while explicitly forbidding keyed `React.Fragment`, so the top-level mapped node cannot be keyed correctly. PROMPT FIX: change the wrapper to a `<div>` or `<span>`-based container and allow a keyed wrapper per mapped item, such as `<span key={...}>...</span>` or `<React.Fragment key={...}>...</React.Fragment>`.

3. [CRITICAL] Post-fix verification is too weak for this scope — The prompt asks for structural `grep` checks and a commit/push, but the changes affect JSX layout, click behavior, section expansion, scroll targeting, and a shared helper used by legacy paths. `grep`, line counts, and “smoke check” wording will not catch parse errors, invalid DOM, broken scroll behavior, or legacy regressions. PROMPT FIX: add required validation steps before commit/push: JSX/lint/build check, runtime verification of hall-mode interactions, and an explicit manual or automated smoke path for legacy1 and legacy2 after the shared helper change.

4. [MEDIUM] The prompt’s i18n rule conflicts with its own code examples — The scope lock says all new user-facing text must use `HALL_UI_TEXT`, but Fix 3 and Fix 4 inject raw Russian plural forms into JSX, and Fix 6 adds inline abbreviations like `запр.`, `нов.`, `гот.` and `в работе` directly inside `countMap`. That leaves an execution agent unsure whether to follow the rule or the snippets. PROMPT FIX: either whitelist the exact literals as an explicit exception, or move every new displayed fragment into `HALL_UI_TEXT` and update the snippets accordingly.

5. [MEDIUM] “Mockup wins” conflicts with several provided implementation snippets — The prompt says the HTML mockup is the ultimate source of truth, but multiple snippets diverge from the surrounding description: Fix 1 describes a `jump-bar` with `gap-8` while the supplied JSX uses `gap-1.5`; Fix 3 says the in-progress sections become gray root sections while the supplied classes are amber; Fix 6’s example shows a bill-payment hint, then the note says that case can never appear. This creates uncertainty about whether the agent should follow the mockup, the prose, or the pasted JSX. PROMPT FIX: pick one normative source per fix. If pasted JSX is authoritative, say so. If the mockup is authoritative, reconcile the snippets before handing off the prompt.

6. [MEDIUM] The new bill jump chip has an unspecified scroll dependency — Fix 1 introduces a `bill` jump chip and expects every chip tap to scroll to its section, but the prompt never confirms that `scrollToSection("bill")` already exists or tells the agent to add/verify the corresponding target ref. That leaves a realistic path where all chips work except the new bill chip. PROMPT FIX: explicitly state whether `scrollToSection` already supports `bill`; if not, instruct the agent to add the `bill` case and verify it in the regression checklist.

7. [MEDIUM] Verification relies on brittle absolute line numbers that will shift during the task — The prompt repeatedly says changes are at exact lines and even expects `grep -n` hits at specific numbers after earlier fixes already inserted new lines near line 343 and near line 1996. That can make a correct implementation look wrong and may cause an agent to chase line numbers instead of code anchors. PROMPT FIX: replace absolute post-edit line expectations with stable anchors such as function names, nearby comments, or “immediately after `hallSummaryItems`”.

8. [MEDIUM] Fix 6 does not define a safe fallback for unmapped close reasons — The snippet assumes every `closeDisabledReason` resolves through `reasonToKind`, then renders a clickable button that calls `scrollToSection(kind)`. If a new blocker reason is added later, or if one reason is intentionally non-scrollable, the generated button will call `scrollToSection(undefined)`. PROMPT FIX: require an exhaustive allowed-reason list for this task or instruct the agent to render plain text when `kind` is missing instead of a button.

9. [LOW] Fix 2 leaves active-section header behavior underspecified — It says to remove header buttons and leave only title + chevron, but it does not clearly say whether those headers remain tappable/collapsible, stay always open, or preserve any existing toggle logic on the container. That gap can lead to inconsistent implementations across sections. PROMPT FIX: explicitly state the intended interaction model for active section headers after the bulk buttons move to the bottom.

10. [LOW] Some required new dictionary keys appear unused by the supplied solution — The prompt says Fix 6 adds ten new `HALL_UI_TEXT` keys and claims Fix 1/3/4 depend on them, but `guests` and `dishes` are not used in the provided snippets, while plural output still comes from inline `pluralRu(...)` literals. This adds noise and raises doubt about whether the author intended a partial i18n migration that was never finished. PROMPT FIX: either remove unused key requirements or update the snippets so every added key has a defined purpose.

## Summary
Total: 10 issues (3 CRITICAL, 5 MEDIUM, 2 LOW)

## Fix Clarity Ratings
- Fix 1: 3/5
- Fix 2: 3/5
- Fix 3: 4/5
- Fix 4: 4/5
- Fix 5: 4/5
- Fix 6: 2/5

## Overall prompt score: 7/10

## Additional Risks
- The prompt encourages copy-pasting long JSX blocks into a 4400-line file without a syntax or render validation gate before `git push`.
- “Mockup wins” can expand the edit surface beyond the named fixes if the current hall-mode markup differs more broadly from the mockup.
- Because Fix 5 intentionally changes a shared helper used by all three render paths, the lack of a concrete regression procedure for the two legacy paths is a release risk.

## Prompt Clarity
- Overall clarity: 3/5
- What was most clear: the intended fix order, the hall-mode target area, and the high-level UX outcomes for each of the six fixes.
- What was ambiguous or could cause hesitation: whether the mockup or pasted JSX is authoritative when they diverge; whether active section headers remain interactive after Fix 2; how jump-chip scrolling should wait for newly mounted sections; and how to handle close reasons that do not map cleanly to a scroll target.
- Missing context: whether `scrollToSection` already supports `bill`; how the “smoke check” for legacy render paths should actually be performed; and whether inline plural forms/abbreviations are an approved exception to the `HALL_UI_TEXT` rule.
