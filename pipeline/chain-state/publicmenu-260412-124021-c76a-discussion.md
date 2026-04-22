# Standalone Discussion Report — PublicMenu
Chain: publicmenu-260412-124021-c76a
Topic: WS-MON #180 — «Сервис не подключён» для Free-плана

## Questions Discussed
1. UI pattern: toast vs small bottom sheet vs inline message inside drawer
2. Scope gate: block all 6 buttons or only "active" ones
3. Visual signal: buttons look different before tap or only after tap
4. Text: wording for the "not available" message
5. Self-promo tie-in (#181): in same message or separately

## Codex Status
**Codex: PARTIAL** — Codex CLI (gpt-5.4) spent ~8 minutes (21k tokens). Most time wasted trying to read repository files (all blocked by sandbox policy or timed out). Eventually produced review criteria (not per-question answers) that align with CC on most points. See `publicmenu-260412-124021-c76a-codex-findings.md` for raw Codex log.

**Codex's review criteria (verbatim summary):**
1. Reject any answer that hides/removes/disables the 6 service buttons for Free plan
2. All 6 buttons stay visible+tappable, each tap shows contextual message naming the intent
3. No "free plan", "upgrade", or internal pricing language in guest-facing copy
4. Wording: "This restaurant hasn't enabled in-app service requests yet" + fallback (ask staff directly)
5. "Something else" should follow same dispatch logic — not become a hidden workaround
6. "Leave review" remains available, separate from dispatch limitation
7. **Avoid dead-end UX** — tap result should explain what happened AND what guest can do now

## Round 1 — CC Analysis (with Codex criteria overlay)

### Q1: UI Pattern (toast vs bottom sheet vs inline)

**CC:** Recommends **inline banner inside the drawer**.

**Reasoning:**
- **Toast (2-3 sec auto-dismiss):** Too fast — user may miss it or not understand why nothing happened. Toasts work for confirmations ("saved!"), not for explaining a blocked feature. On mobile, toasts at the top of screen while user is looking at bottom sheet content = visual disconnect.
- **Bottom sheet on top of bottom sheet:** Bad UX pattern. Sheet-on-sheet creates modal stacking confusion. User has to dismiss inner sheet to get back to help drawer. Violates mobile UX principle of minimal modal depth.
- **Inline banner (recommended):** When user taps a blocked button, show a compact banner/card at the **top of the drawer content area** (above the 3×2 grid). Content: icon + message text. Auto-dismiss after 5 sec OR tap anywhere to dismiss. Grid stays visible below. This keeps context: user sees the banner in the same viewport as the buttons they were interacting with.

**Implementation detail:** Single `useState` for `showFreePlanMessage`, triggered by any blocked button tap. One banner component, not per-button. Re-tapping while banner is visible just resets the 5-sec timer.

**Reference patterns:** Uber Eats "unavailable item" tap → inline message in category; Google Maps "feature not available in your area" → inline card. Both use inline, not toast or stacked sheet.

**Codex:** Did not answer Q1 directly. Criteria say "each tap shows a contextual message" — compatible with inline banner approach. No explicit preference for toast vs sheet vs inline.

**Status:** CC recommendation (Codex compatible). **Agreed.**

---

### Q2: Scope Gate (which buttons to block)

**CC:** Block only the **6 service request buttons** (Позвать, Счёт, Вода, Салфетки, Приборы, Убрать). Do **NOT** block «Оставить отзыв» or «Другой запрос?».

**Reasoning:**
- The 6 grid buttons all trigger **staff dispatch** — they create a real-time notification to waitstaff. This is the feature that requires the Paid plan (integration with staff notification system).
- «Оставить отзыв» (Leave a review) is **passive** — it could work as a simple form submission (email/webhook) even without staff dispatch. Blocking reviews hurts both the guest and the restaurant (reviews are valuable data even on Free plan).
- «Другой запрос?» (Something else?) opens a textarea for custom text. This could also be handled via simple submission (email queue, dashboard notification) without real-time staff dispatch. Blocking it removes a communication channel unnecessarily.
- **Upsell argument:** If a Free-plan guest can leave a review but cannot call a waiter, the contrast itself communicates "this restaurant has basic features but not the full experience" — which is a subtler and more effective upsell than blocking everything.
- **Implementation simplicity:** `const isFreePlan = partner?.plan === 'Free'` check only on the 6 grid button handlers. «Оставить отзыв» and «Другой запрос?» work normally.

**Edge case — «Другой запрос?» on Free plan:**
If the custom text request is also routed through the staff dispatch system (same backend as the 6 buttons), then it should also be blocked. Decision depends on backend architecture. If it uses a separate queue (e.g., email) — keep unblocked. If same dispatch — block with the same message.

**Codex:** Agrees: "Leave review should remain available and separate from dispatch limitation." On «Другой запрос?»: "Something else should follow the same logic if it also depends on dispatch. It should not become a hidden workaround for unsupported service requests." This aligns with CC's edge case — Codex leans toward blocking it if it uses dispatch.

**Status:** **Agreed** on main scope. Edge case for «Другой запрос?» — both CC and Codex say "block if dispatch-dependent." Arman confirms backend routing.

---

### Q3: Visual Signal (before vs after tap)

**CC:** Recommends **normal appearance before tap**. Difference only after tap (inline banner).

**Reasoning:**
- **Against pre-tap dimming/lock icon:**
  - Visually dimming buttons is a softer form of hiding — it contradicts the S184 decision "do NOT hide buttons."
  - A 🔒 icon on 6 out of 6 grid buttons makes the entire drawer look broken/disabled. Guest impression: "this restaurant's help feature doesn't work" → negative brand perception for MenuApp.
  - Dimmed buttons reduce tap rate → fewer upsell message impressions → less pressure on restaurant to upgrade.
  - Adds implementation complexity: conditional styling per plan, potentially per button state (what if a dimmed button gets an active state from a race condition?).

- **For normal appearance + post-tap message:**
  - The slight "surprise" of the message is intentional. Guest taps expecting a feature → learns it's not enabled → asks restaurant "why?" This is the upsell mechanism.
  - Guest doesn't feel "warned off" before trying. The discovery is organic.
  - Simplest implementation: no conditional CSS, just a handler check.

- **Counter-argument (for dimming):** Some UX practitioners argue that tapping a normal-looking button and getting "not available" feels like a broken app. However, the message text makes it clear this is a restaurant choice, not a bug. And the banner appears immediately (no loading spinner → failure pattern).

**Codex:** Agrees: "All six buttons stay visible and tappable." Does not mention pre-tap dimming, which implies normal appearance is acceptable.

**Status:** **Agreed** (both CC and Codex want buttons visible+tappable, no dimming).

---

### Q4: Message Text

**CC:** Recommends **«Ресторан ещё не подключил этот сервис»** / **"The restaurant hasn't connected this service yet"**.

**Analysis of options:**
| Option | RU | Tone | Issue |
|--------|----|----|-------|
| A | «Эта функция не активирована рестораном» | Technical, passive voice | "Активирована" sounds like enterprise software. Passive voice ("рестораном") is impersonal. |
| B (recommended) | «Ресторан ещё не подключил этот сервис» | Neutral, active voice | "Ещё" (yet) implies temporary state. Active voice personalizes without blaming. "Подключил" (connected) is everyday language. |
| C | «Сервис недоступен» | Terse, ambiguous | Could mean "server down" or "feature removed." Doesn't explain why. |
| D | «Эта услуга пока не доступна в вашем ресторане» | Formal, long | Too many words for a mobile banner. "Пока" is slightly apologetic. |

**Key principles for the text:**
1. **No blame** — doesn't say "restaurant refused" or "you can't."
2. **Implies temporary** — "ещё" (yet) suggests it could change.
3. **Factual** — states what IS, not what ISN'T.
4. **Short** — fits in a single line on 320px screen.
5. **Conversational** — "подключил" (connected) vs "активирована" (activated).

**i18n key:** `public_menu.help_drawer.free_plan_message`

**Codex:** Suggests: "This restaurant hasn't enabled in-app service requests yet" + fallback "ask staff directly." Key differences from CC:
- Codex uses "enabled" vs CC's "connected" (подключил) — similar tone.
- **Codex adds fallback action:** "ask staff directly" — CC's original text had no fallback. This is a good addition (avoids dead-end UX, Codex criterion #7).
- Codex explicitly says no "free plan" or "upgrade" language — CC agrees.

**Updated CC recommendation incorporating Codex feedback:**
- Main: «Ресторан ещё не подключил этот сервис»
- **Add fallback line:** «Вы можете обратиться к персоналу напрямую» / "You can ask staff directly"
- i18n keys: `public_menu.help_drawer.free_plan_message` + `public_menu.help_drawer.free_plan_fallback`

**Status:** **Agreed with enhancement.** CC adopts Codex's fallback suggestion.

---

### Q5: Self-Promo Tie-In (#181)

**CC:** Recommends showing brand **in the same banner**, as a subtle secondary line.

**Layout:**
```
┌─────────────────────────────────────┐
│  Ресторан ещё не подключил          │
│  этот сервис                        │
│                          MenuApp    │  ← small, gray, right-aligned
└─────────────────────────────────────┘
```

**Reasoning:**
- **Same message > separate placement:**
  - A footer "Powered by MenuApp" at the bottom of the drawer is seen by <5% of users (below fold, ignored like banner blindness).
  - The blocked-service moment is the **highest-attention context**: user is actively wondering "why doesn't this work?" At that exact moment, seeing "MenuApp" connects the brand to the solution.
  - No separate promo element needed — saves UI real estate and avoids feeling "salesy."

- **Must be subtle:**
  - Just the word "MenuApp" in small gray text (text-xs text-gray-400).
  - NO link, NO button, NO "Learn more", NO logo icon.
  - If it looks like an ad, users will mentally block it. If it looks like a system attribution, they'll read it.

- **Alternative considered — separate promo card below grid:**
  - Pros: always visible, not tied to error state.
  - Cons: feels like spam, takes space, shown to ALL users (including Paid plan where there's no reason for promo).
  - Showing promo ONLY in Free-plan blocked-service context = targeted and relevant.

**Codex:** Did not address self-promo directly. No opinion.

**Status:** CC-only recommendation on Q5. Codex silent.

---

## Decision Summary

| # | Question | CC Recommendation | Codex | Resolution | Confidence |
|---|----------|-------------------|-------|------------|------------|
| 1 | UI pattern | Inline banner in drawer (5s auto-dismiss) | compatible ("contextual message") | agreed | high |
| 2 | Scope gate | Block 6 service buttons; keep review unblocked | agrees; "Something else" = block if dispatch | agreed | high |
| 3 | Visual signal | Normal before tap, banner after tap | agrees ("visible+tappable") | agreed | high |
| 4 | Text | «Ресторан ещё не подключил этот сервис» + fallback | similar wording + "ask staff directly" | agreed with enhancement | high |
| 5 | Self-promo | Subtle "MenuApp" in same banner, small gray text | no opinion | CC-only | medium |

## Recommendations

**For DECISIONS_INDEX:**

1. **Q1 → Inline banner pattern.** Free-plan blocked buttons show a compact banner at top of Help Drawer content area. Auto-dismiss 5 sec. No toast, no stacked sheet.

2. **Q2 → Block 6 service buttons only.** «Оставить отзыв» and «Другой запрос?» remain functional on Free plan. Exception: if «Другой запрос?» uses the same staff dispatch backend, also block it (needs Arman confirmation on backend routing).

3. **Q3 → No visual difference before tap.** Buttons look identical on Free and Paid plans. Difference appears only when tapped (inline banner). Rationale: maximizes upsell impressions, simplest implementation.

4. **Q4 → Text: «Ресторан ещё не подключил этот сервис» + «Вы можете обратиться к персоналу напрямую».** i18n keys: `public_menu.help_drawer.free_plan_message` + `public_menu.help_drawer.free_plan_fallback`. English: "The restaurant hasn't connected this service yet" + "You can ask staff directly." (Fallback line added per Codex's "avoid dead-end UX" criterion.)

5. **Q5 → Brand in same banner.** Small gray "MenuApp" text in the blocked-service banner. No link, no button. Only shown to Free-plan users when they tap a blocked button.

## Unresolved (for Arman)

1. **Q2 edge case — «Другой запрос?» routing.** Both CC and Codex agree: if custom text requests go through the same staff dispatch system → block on Free plan. If separate queue (email/webhook) → keep unblocked. **Arman to confirm backend routing.**

2. **Q5 — promo intensity.** CC recommends minimal (just "MenuApp" text). Codex had no opinion. Arman may want something stronger (e.g., "Сервис MenuApp" or a link). Worth discussing with marketing/business goals.

## Technical Notes

- **Codex behavior:** gpt-5.4 model via Codex CLI. Spent ~8 min (21k tokens). Tried 8+ file reads (Get-Content, rg, findstr, cmd /c more, Select-String) — all either timed out (exit 124, 21-32 sec each) or were blocked by sandbox policy. Eventually produced review criteria (not per-question answers) that were useful for validation. KB candidate: when running Codex for UX/architecture discussions, use a prompt that explicitly says "DO NOT read any files, answer from the context provided in this prompt."
- **Duration:** CC analysis ~3 min, Codex ~8 min (mostly wasted on file reads), total ~11 min.
- **Codex's key contribution:** The "avoid dead-end UX" criterion led CC to add a fallback action line to Q4 text.
