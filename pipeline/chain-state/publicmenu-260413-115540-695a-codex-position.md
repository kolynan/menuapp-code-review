# Codex Discussion Position — PublicMenu Chain: publicmenu-260413-115540-695a
Topic: Free-план «Сервис не подключён»

Reference note: the four cited reference files were not present in this synced checkout, so the position below is based on the task context only.

## Questions Analyzed

### Q1: UI-паттерн для сообщения «Сервис не подключён»
**Recommendation:** c) Inline message — show the explanation directly inside the Help Drawer, anchored under the tapped premium action.

**Reasoning:** The guest is already inside a drawer and trying to complete a quick task. An inline message keeps the context intact, avoids stacking a second surface on top of a drawer, and lets the explanation stay visible long enough to be read. It is also less easy to miss than a toast and less annoying than a dialog that requires an extra dismissal.

**Trade-offs:** Inline feedback is slightly less attention-grabbing than a dialog and requires local state in the drawer. If the message is placed too far from the tapped item, it can be overlooked.

**Mobile UX:** Keep the message short, persistent until the next action or drawer close, and place it immediately under the tapped button so the guest sees cause and effect without extra taps.

### Q2: Scope gate — какие кнопки блокировать?
**Recommendation:** b) Block only the 4 active/service-request actions and leave navigation or informational options free.

**Reasoning:** This is the best balance between monetization pressure and baseline guest utility. The paywall should apply to actions that create operational value for the restaurant, such as calling staff, requesting the bill, placing an order, or sending structured feedback. If every button is blocked, the Help Drawer starts to feel broken and the free plan becomes too weak; if only two buttons are blocked, the upsell signal is probably too soft for the agreed flow.

**Trade-offs:** The upsell pressure is lower than a full six-button lock, and the exact split depends on the final list of drawer actions. Some restaurants will still get meaningful free utility from the remaining options.

**Mobile UX:** Leave at least some clearly useful options active so the drawer still feels functional on a small screen and the guest is not pushed into a dead-end UI.

### Q3: Визуальный сигнал до тапа
**Recommendation:** a) Show a pre-tap premium signal, but implement it as subtle reduced emphasis plus a lock icon, not a fully disabled look.

**Reasoning:** In freemium UX, honest upfront signaling is better than surprise failure after tap. A small lock or paid marker sets expectation early and reduces confusion. Keeping locked actions visually identical feels deceptive; moving them into a separate premium section adds extra clutter in a compact drawer and turns the drawer into a mini upsell page.

**Trade-offs:** Too much dimming can make the action look disabled instead of locked. This needs careful accessibility tuning so contrast stays readable and the control still looks tappable.

**Mobile UX:** Preserve full-size tap targets and place the lock at the trailing edge or next to the label. Avoid opacity so low that the button looks inactive rather than premium-gated.

### Q4: Текст сообщения
**Recommendation:** b) Use a neutral explanation with an immediate alternative. Suggested copy: «Эта функция пока не подключена рестораном. Вы можете обратиться к персоналу напрямую.»

**Reasoning:** This is the best balance between honesty and tact. It explains why nothing happened without framing it as a bug, and it gives the guest a clear recovery path. Option c is too vague and implies a temporary technical issue; option a is polite but leaves the guest at a dead end.

**Trade-offs:** The copy is longer than a minimalist message and takes more space. It also reveals that the restaurant chose not to enable the feature, so the wording has to stay neutral and non-judgmental.

**Mobile UX:** Keep it to two short sentences maximum. No brand mention, no extra CTA, and no paragraph-length explanation inside a small drawer.

### Q5: Self-promo #181 — в том же сообщении или отдельно?
**Recommendation:** b) Keep self-promo as a separate #181 block, not inside the locked-feature message.

**Reasoning:** The locked-feature message is a recovery moment, not an acquisition moment. Adding MenuApp promotion immediately after a failed tap will feel opportunistic and risks making the restaurant look cheap. A separate low-pressure “Powered by MenuApp” block is cleaner, easier to tune later, and keeps the service message focused on the guest’s next step.

**Trade-offs:** This will likely convert less aggressively than putting a CTA inside the message. It also creates one more surface to design and place.

**Mobile UX:** On mobile, the denial message should stay focused on “what now”; promo belongs in a stable footer or separate block where it does not interrupt the guest’s task flow.

## Summary Table
| # | Question | Codex Recommendation | Confidence |
|---|----------|----------------------|------------|
| 1 | UI pattern for “service not connected” | Inline message inside the Help Drawer | high |
| 2 | Which buttons to gate on Free plan | Block only the 4 active/service-request actions | medium |
| 3 | Pre-tap premium signal | Subtle lock plus reduced emphasis on premium buttons | medium |
| 4 | Guest-facing message text | Neutral explanation plus direct alternative to ask staff | high |
| 5 | Self-promo placement | Separate #181 block, not inside the lock message | high |

## Prompt Clarity
Rate the task description quality (1-5). For any score below 4, explain what was unclear:

- Overall clarity: 3
- Ambiguous questions (list # and what was unclear):
  - Q2: the exact six Help Drawer options are not listed, so “4 active” versus “navigation/information” has to be inferred.
  - Q3: option a uses disabled-style dimming even though the control remains tappable, so the intended affordance needs clarification.
- Missing context (what info would have helped):
  - The four cited reference files were not present in this synced checkout.
  - The current Help Drawer hierarchy and exact button list.
  - Any existing guest-facing monetization copy rules or tone guidelines.
