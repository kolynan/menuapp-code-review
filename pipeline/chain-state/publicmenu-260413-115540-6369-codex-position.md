# Codex Discussion Position — PublicMenu Chain: publicmenu-260413-115540-6369
Topic: Free-план «Сервис не подключён»

Note: After the required sync to `origin/main`, the referenced files were not present at the provided paths. The analysis below is based on the task context only.

## Questions Analyzed

### Q1: UI-паттерн для сообщения «Сервис не подключён»
**Recommendation:** `c) Inline message` inside the Help Drawer, directly under the tapped locked action.

**Reasoning:** This is the most contextual and least annoying option for a mobile restaurant flow. The user is already inside a drawer; opening a second blocking layer creates unnecessary friction, while a toast is too easy to miss and disappears before the guest understands what happened. An inline message keeps the cause-and-effect obvious: "I tapped this action, and this exact action is unavailable." It also supports the agreed upsell effect without making the product feel broken.

**Trade-offs:** Inline feedback is less attention-grabbing than a dialog, so the copy and visual treatment need to be clear. It also requires a clean expansion pattern so the drawer does not feel jumpy.

**Mobile UX:** Avoid nested modal-on-modal behavior. Keep the message to 1-2 short lines, animate the reveal lightly, and keep the tapped button visible so the guest immediately understands which action triggered the message.

### Q2: Scope gate — какие кнопки блокировать?
**Recommendation:** `b) Только 4 «активные»` actions should be blocked: waiter call, bill request, order-related request, and feedback/service request. Informational or navigation items should stay available.

**Reasoning:** Free restaurants still need to deliver basic guest value, otherwise the menu feels artificially broken and reflects badly on the venue. Gating the service-triggering actions creates a clear upsell boundary without making the whole Help Drawer pointless. Blocking all 6 is too punitive; blocking only 2 weakens the monetization signal and makes the free/paid split feel arbitrary.

**Trade-offs:** This creates a smaller upsell push than locking everything. It also requires a clean definition of which actions are truly "service" features versus basic usability features.

**Mobile UX:** Keep non-blocked items reliable so the drawer still feels useful on a quick mobile interaction. Dead ends should be limited to high-intent actions, not to orientation or information.

### Q3: Визуальный сигнал до тапа
**Recommendation:** `a) Приглушённые + 🔒`, but with a subtle locked treatment rather than a heavy disabled look.

**Reasoning:** Guests should not discover the restriction only after tapping; that feels deceptive. A light lock indicator follows common freemium patterns and sets expectation early. A separate "Premium" section would add more visual noise and make the drawer feel more like an upsell surface than a help surface. Showing no distinction creates the most frustration.

**Trade-offs:** Any pre-tap signal adds some clutter. If the dimming is too strong, users may assume the item is fully disabled and not tappable, which works against the agreed flow where tap should still explain the limitation.

**Mobile UX:** Preserve full hit targets and readable contrast. Use a small lock icon and modest visual softening, not 50% opacity gray text that becomes hard to scan on a phone in restaurant lighting.

### Q4: Текст сообщения
**Recommendation:** `b)` with slightly tightened copy: `Эта функция не активирована рестораном. Если нужно, обратитесь к персоналу напрямую.`

**Reasoning:** This is the best balance of honesty, neutrality, and recovery path. Option `a)` is too bare and leaves the guest in a dead end. Option `c)` sounds like a temporary outage or bug, which is misleading. The recommended copy explains the situation without sounding accusatory and immediately offers a practical next step.

**Trade-offs:** The message is a little longer than the minimal version, so it must stay concise. It still lightly attributes the limitation to restaurant setup, which should be phrased neutrally.

**Mobile UX:** Keep it to two short sentences max. The second sentence matters because mobile users want an immediate fallback, not just an explanation.

### Q5: Self-promo #181 — в том же сообщении или отдельно?
**Recommendation:** `b) Отдельный блок #181` as a separate component, not inside the locked-feature message.

**Reasoning:** The "service not connected" moment is a problem-resolution moment, not a marketing moment. Adding MenuApp promo to that message increases the feeling that the guest is being used as an upsell channel. A separate `Powered by MenuApp` block is cleaner, more ethical, and easier to tune independently without contaminating service UX.

**Trade-offs:** This will likely convert less aggressively than piggybacking on the blocked-action message. It also means one more surface to design and place well.

**Mobile UX:** Keep the blocked-state explanation focused and light. Promotional content should live in a stable, low-pressure area of the menu where it does not interrupt the guest's task.

## Summary Table
| # | Question | Codex Recommendation | Confidence |
|---|----------|----------------------|------------|
| 1 | UI pattern for locked-service message | `c) Inline message` | high |
| 2 | Scope gate | `b) Block only 4 active service actions` | medium |
| 3 | Pre-tap visual signal | `a) Subtle locked state with lock icon` | high |
| 4 | Message copy | `b) Neutral copy with direct alternative` | high |
| 5 | Self-promo placement | `b) Separate block #181` | high |

## Prompt Clarity
- Overall clarity: `3/5`
- Ambiguous questions:
  - `Q2`: The exact list of the ~6 Help Drawer buttons is not provided, so the paid/free split can only be discussed at the principle level.
  - `Q3`: The option says "dimmed," but the intended interaction still requires tapping; too much dimming conflicts with tappability.
  - `Q5`: The business priority between guest trust and conversion is implied, but not explicitly ranked.
- Missing context (what info would have helped):
  - The referenced files were not present at the provided paths after the mandatory sync.
  - Current Help Drawer screenshot or current button list.
  - Exact free-plan versus paid-plan feature matrix for Help Drawer actions.
