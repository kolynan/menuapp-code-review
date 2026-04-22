# Discussion Report — PublicMenu
Chain: publicmenu-260413-115540-6369
Mode: CC+Codex (synthesized)
Topic: #180 — Free-план «Сервис не подключён»

## Questions Discussed
1. Q1: UI-паттерн для сообщения «Сервис не подключён»
2. Q2: Scope gate — какие кнопки блокировать?
3. Q3: Визуальный сигнал до тапа
4. Q4: Текст сообщения
5. Q5: Self-promo #181 — в том же сообщении или отдельно?

## Analysis

### Q1: UI-паттерн для сообщения «Сервис не подключён»

**CC Position:** (b) Compact bottom sheet — auto-dismiss 5s, tap-to-dismiss, appears above Help Drawer without overlay. Reasoning: toast too ephemeral for important info + alternative action; full dialog too heavy; inline shifts layout on tight 3x2 grid. Cites Material Design 3 / Google Maps / Uber pattern.

**Codex Position:** (c) Inline message — text appears directly under the tapped button inside the Help Drawer. Reasoning: most contextual, keeps cause-and-effect obvious, avoids modal-on-modal. Requires clean expansion animation.

**Status:** disagreement

**Resolution:** Synthesizer recommends **CC's compact bottom sheet**, with the following reasoning:

1. **Layout stability is critical.** The Help Drawer is a fixed 3x2 grid on 320-420px screens (confirmed by UX v6.0). Inserting inline text under a button pushes siblings down. If the guest taps multiple locked buttons exploring, the layout jumps repeatedly. CC's concern about "visual chaos" on small screens is well-founded.

2. **All 6 buttons are locked on Free** (see Q2 resolution). If the guest taps button #1 and sees inline text, then taps button #3 — does the first inline message collapse? Do both show? The interaction model gets complex. A single bottom sheet with one message regardless of which button was tapped is simpler.

3. **Codex's "modal-on-modal" concern is valid but mitigable.** CC's spec says no overlay/backdrop dimming — the Help Drawer stays visible behind the compact bottom sheet. This is not a true modal-on-modal; it's a lightweight snackbar-like element overlaid on the drawer. This pattern is standard in mobile apps (Material Design "standard bottom sheet" / snackbar).

4. **Auto-dismiss at 5s** means the guest doesn't have to manually close anything — addressing Codex's friction concern.

**Compromise element from Codex:** The bottom sheet should appear anchored to the bottom of the Help Drawer (not the screen bottom), making the cause-and-effect relationship more contextual, as Codex wanted. This preserves layout stability while improving contextual connection.

### Q2: Scope gate — какие кнопки блокировать?

**CC Position:** Block ALL 6 buttons + «Другой запрос?». All 6 are service requests requiring staff action, and on Free plan there's no staff-side infrastructure (StaffOrdersMobile is paid). Allowing some through means requests go unseen — worse than blocking.

**Codex Position:** Block only 4 "active" service actions. Keep informational/navigational buttons free so the drawer still provides value.

**Status:** disagreement

**Resolution:** Synthesizer recommends **CC's "all 6 + Другой запрос?"**, based on verified facts:

1. **The UX v6.0 doc (read and confirmed) lists all 6 buttons:** Позвать, Счёт, Вода, Салфетки, Приборы, Убрать. Every single one is a service request that creates a ServiceRequest record and requires staff to act. There are NO informational or navigational buttons in the Help Drawer — that's the core of CC's argument, and it's correct.

2. **Codex assumed some buttons were informational/navigational** ("Informational or navigation items should stay available"), but the reference file shows this is not the case. Codex noted it could not access the reference files ("referenced files were not present at the provided paths"), which explains this gap.

3. **CC's "phantom request" argument is decisive:** On Free plan, StaffOrdersMobile is not active. If we allow even 1-2 requests through, they enter a queue that nobody monitors. The guest waits indefinitely, sees urgency go amber → red, and has a terrible experience. Blocking is MORE honest than silently dropping requests.

4. **Monetization model confirms:** Free = QR-menu only, Paid = orders + service. All 6 Help Drawer buttons are "service". The boundary is clean and defensible.

5. **"Другой запрос?"** is also a service request (free-text to staff) — same logic applies.

### Q3: Визуальный сигнал до тапа

**CC Position:** (a) Dimmed opacity-50 + 🔒 12px icon top-right, text-gray-400. Buttons remain tappable. Subtitle "Сервис не подключён рестораном" replaces "Выберите, что нужно".

**Codex Position:** (a) Subtle locked state with lock icon. Agrees with dimming but warns against too-heavy opacity that makes buttons look fully disabled/untappable. Wants "modest visual softening" rather than 50%.

**Status:** agreed on approach (a), minor calibration difference on opacity level

**Resolution:** **Agreed: dimmed + lock icon.** Synthesize parameters from both:

- **Opacity: 0.6** (compromise — CC said 0.5, Codex warned 0.5 might look fully disabled in restaurant lighting conditions). 0.6 is still clearly dimmed but remains scannable.
- **Lock icon: 12px**, top-right corner of each card, `text-gray-400` — both agree.
- **Buttons remain tappable** (not `pointer-events-none`) — both agree, this is essential for the tap-to-explain flow.
- **No strikethrough/red/disabled styling** — both agree, "unavailable on upgrade" not "broken".
- **Subtitle replacement:** CC's suggestion of replacing "Выберите, что нужно" with "Сервис не подключён рестораном" in `text-sm text-gray-400` — Codex didn't address this but it's a clean solution that sets expectations before any tap.

Codex's concern about restaurant lighting is a good practical note — opacity 0.6 addresses it.

### Q4: Текст сообщения

**CC Position:** "Эта функция пока не подключена. Обратитесь к персоналу напрямую." — "пока" implies future availability (subtle upsell), avoids "не активирована" (sounds like a bug), includes alternative action.

**Codex Position:** "Эта функция не активирована рестораном. Если нужно, обратитесь к персоналу напрямую." — neutral, with recovery path. Explicit "рестораном" attribution.

**Status:** agreed on structure (option b: neutral + alternative), minor wording difference

**Resolution:** **Synthesizer recommends CC's wording with one Codex element:**

> «Эта функция пока не подключена. Обратитесь к персоналу напрямую.»

Reasoning:
1. CC's argument against "не активирована" is strong — it sounds like a technical status/bug, not a plan limitation. "Не подключена" is more natural in Russian.
2. CC's "пока" is better than Codex's explicit "рестораном" — attributing the limitation to the restaurant ("не активирована рестораном") could feel like blame. "Пока не подключена" is impersonal and implies it could change, which is the desired upsell signal.
3. Both agree on the alternative action sentence. CC's shorter "Обратитесь к персоналу напрямую" is slightly better for mobile (fewer characters) than Codex's "Если нужно, обратитесь к персоналу напрямую" — the "если нужно" is redundant (the guest already tapped because they need it).
4. i18n keys: `help.free_gate.message` + `help.free_gate.alternative` (CC's suggestion, good practice).

### Q5: Self-promo #181 — в том же сообщении или отдельно?

**CC Position:** (b) Separate #181, different placement. Argues: blocked-action moment = frustration, not marketing opportunity. Promo here creates "MenuApp is blocking me" brand association. §9.2 says promo belongs "after success state", not after blocked action.

**Codex Position:** (b) Separate #181. Agrees: problem-resolution moment ≠ marketing moment. Separate component is cleaner and more ethical.

**Status:** agreed

**Resolution:** **Agreed: (b) Separate block #181.** Both AI converge strongly. Key points:
- #181 is a separate component, separate task, separate UX context
- Placement: menu browsing flow (end_of_category, bottom_of_menu per §9.1-9.2), NOT Help Drawer
- The locked-action message must NOT contain any MenuApp branding or CTA
- Confidence: very high (both AI, both at high confidence, for the same reasons)

## Decision Summary

| # | Question | CC | Codex | Resolution | Confidence |
|---|----------|----|-------|------------|------------|
| 1 | UI pattern for message | Compact bottom sheet (5s auto-dismiss) | Inline message under button | **Synthesizer: bottom sheet** — layout stability on 3x2 grid, all buttons locked = single message pattern simpler | high |
| 2 | Scope: which buttons to block | All 6 + «Другой запрос?» | Only 4 "active" | **Synthesizer: all 6 + Другой запрос?** — verified: all are service requests, no info/nav buttons exist. Free plan has no staff monitoring. | high |
| 3 | Visual signal before tap | Dimmed (0.5) + lock 12px | Subtle dimmed + lock (less opacity) | **Agreed: dimmed (0.6) + lock 12px** — compromise on opacity level | high |
| 4 | Message text | "пока не подключена" + alternative | "не активирована рестораном" + alternative | **Synthesizer: CC wording** — "пока не подключена" more natural, avoids blame | high |
| 5 | Self-promo in message? | No — separate #181 | No — separate #181 | **Agreed: separate #181** | very high |

## Recommendations

**For DECISIONS_INDEX §9:**

1. **Free gate UI pattern:** Compact bottom sheet (auto-dismiss 5s, no overlay), appears above Help Drawer. Not toast, not inline, not full dialog.

2. **Free gate scope:** ALL 6 Help Drawer buttons + "Другой запрос?" are blocked on Free plan. No partial unlock — all are service requests requiring staff infrastructure.

3. **Free gate visual:** Locked buttons shown at opacity 0.6 with 12px lock icon (top-right). Buttons remain tappable. Subtitle: "Сервис не подключён рестораном" (text-sm text-gray-400).

4. **Free gate copy:** "Эта функция пока не подключена. Обратитесь к персоналу напрямую." (i18n keys: help.free_gate.message, help.free_gate.alternative)

5. **Self-promo #181:** Completely separate from #180. No MenuApp branding in blocked-action messages. #181 placement: menu browsing flow (end_of_category / bottom_of_menu).

**Implementation notes:**
- Single bottom sheet message regardless of which button is tapped (don't repeat per-button)
- After first tap shows bottom sheet, subsequent taps in same session show brief toast "Сервис не подключён" (CC's mitigation idea)
- Bell FAB still visible on Free plan, Help Drawer still opens — the visual treatment (dimmed + locks) communicates the limitation
- plan=Paid: everything works as-is, no changes needed

## Unresolved (for Arman)

No unresolved questions — all 5 had clear resolutions. Both AI agreed on Q3 and Q5; Q1, Q2, Q4 had disagreements where the synthesizer could determine a clear winner based on verified reference data and UX principles.

**Optional follow-up (not blocking):**
- Should the bell FAB itself have a visual indicator on Free plan? (e.g., subtle badge or different color) — CC flagged this as an open question. This could be addressed during implementation.

## Quality Notes
- CC Prompt Clarity score: 5/5
- Codex Prompt Clarity score: 3/5
- Issues noted: Codex could not access reference files (UX v6.0, Monetization doc) — this affected Q2 where Codex assumed some buttons were informational/navigational. The task prompt was clear and well-structured; the file access issue was environmental, not a prompt quality problem.
- Overall discussion quality: productive disagreements on Q1 and Q2 led to well-reasoned resolutions. Both AI brought valuable perspectives.
