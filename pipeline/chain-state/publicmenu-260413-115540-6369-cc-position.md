# CC Discussion Position — PublicMenu
Chain: publicmenu-260413-115540-6369
Topic: #180 — Free-план «Сервис не подключён»

## Context Summary
- Decision S184: show buttons, but on tap display "service not activated" message
- Flow: bell → Help Drawer → guest taps paid option → message
- Help Drawer v6.0: 6 buttons in 3×2 grid + "Другой запрос?" link
- Monetization: Free (QR-menu + self-promo) / Paid (3900₸ + 1000₸/staff)
- DECISIONS_INDEX §9 row "Free gate UI": 5 questions pending discussion

## Questions Analyzed

### Q1: UI-паттерн для сообщения «Сервис не подключён»

**Recommendation:** (b) Bottom sheet / dialog — lightweight variant (compact bottom sheet, not full dialog)

**Reasoning:**
1. **Toast is too ephemeral.** The guest taps expecting an action (call waiter, request bill). A toast disappears in 3-4 seconds — the guest may miss it, tap again, get frustrated. The message carries important information (alternative: ask staff directly), which needs reading time.
2. **Full dialog is too heavy** for what is essentially an informational message. Modal dialogs imply a decision point — there's no decision here.
3. **Inline message (c) has layout problems.** Help Drawer already has a tight 3×2 grid. Inserting text under a specific button would shift the layout, especially if multiple buttons are tapped. On 320px screens this creates visual chaos.
4. **Compact bottom sheet** (small, auto-dismiss after ~5s, tap-to-dismiss) is the sweet spot: visible enough to read, not blocking, familiar mobile pattern. Material Design 3 calls this a "standard bottom sheet" — Google Maps, Uber, and Yandex Go all use this pattern for informational messages that need 1-2 sentences.

**Trade-offs:** Slightly more intrusive than toast. But the goal IS to be noticed — the guest should remember "I couldn't call the waiter" and mention it to the restaurant. Toast achieves the opposite (easy to miss → no upsell signal).

**Mobile UX:**
- 44px min tap target for dismiss
- Auto-dismiss after 5s (guest doesn't have to close manually)
- Appears above Help Drawer (z-index), not replacing it
- No overlay/backdrop dimming — Help Drawer remains visible behind

### Q2: Scope gate — какие кнопки блокировать?

**Recommendation:** (b) Only 4 "active" service buttons — block: Позвать, Счёт, Вода/Тарелку, Убрать (service requests). Keep: navigational/informational buttons free.

Wait — looking at Help Drawer v6.0 button list:
1. Позвать (call waiter)
2. Счёт (bill)
3. Тарелку (plate) — was Вода in earlier version, now Тарелку per S234+S235
4. Салфетки (napkins)
5. Приборы (utensils)
6. Убрать (clear table)
+ "Другой запрос?" secondary link

**Revised Recommendation:** Block ALL 6 buttons + "Другой запрос?" on Free plan.

**Reasoning:**
1. All 6 buttons are **service requests** that require staff action. None are purely informational/navigational. They all create ServiceRequest records in the backend.
2. On Free plan, there is no staff-side infrastructure (StaffOrdersMobile is a paid feature). Even if we allowed some requests through, **nobody would see them**. This would be worse UX than blocking — the guest waits forever, urgency goes to red, and nothing happens.
3. The monetization model (§9) is clear: Free = QR-menu only, Paid = orders + service. All 6 buttons are "service", not "menu".
4. Blocking all 6 gives the strongest upsell signal while being honest — "these features aren't activated" is true for all of them.
5. The guest still gets value from the QR-menu itself (browsing, photos, prices, descriptions). Help Drawer is entirely a paid feature.

**Trade-offs:** The bell icon (FAB button) still appears and Help Drawer still opens — the guest sees 6 locked buttons. This could feel frustrating. Mitigation: show the message on the FIRST tap and don't repeat the bottom sheet for subsequent taps in the same session (show a brief toast instead: "Сервис не подключён").

**Mobile UX:** Consider showing a single message at drawer open (not per-button) if all buttons are locked — see Q3 for visual treatment.

### Q3: Визуальный сигнал до тапа

**Recommendation:** (a) Dimmed + 🔒 — but with specific parameters

**Reasoning:**
1. **Honest UX is better than surprise.** LMP (best practices) for freemium apps: show what exists but mark it clearly as premium. Spotify dims locked features with a lock icon. Notion shows upgrade badges. Hiding the state until tap is deceptive.
2. **Reduces frustration.** If the guest sees dimmed buttons with locks, they understand immediately without needing to tap each one. One bottom sheet message on first tap is enough. Without visual signals, the guest might tap all 6, getting the same message 6 times — annoying.
3. **Option (c) "separate Premium section"** doesn't apply here — ALL buttons are service, there's no "free subset" to separate from.

**Specific parameters:**
- `opacity-50` (0.5) on the entire button card
- Small 🔒 icon (12px) in the top-right corner of each card, `text-gray-400`
- Button remains tappable (not `pointer-events-none`) — tap triggers the message
- Do NOT use strikethrough, red, or "disabled" styling — that implies broken, not "available on upgrade"
- Subtitle under grid (replacing "Выберите, что нужно"): "Сервис не подключён ресторaном" in `text-sm text-gray-400`

**Trade-offs:** More visual clutter in Help Drawer. But since ALL buttons are locked on Free, the entire drawer has a consistent dimmed look — it's actually clean, just clearly "unavailable". The alternative (normal buttons that don't work) is more confusing.

**Mobile UX:**
- Dimmed buttons still have 44×44px touch targets
- Lock icon must not overlap with the button icon (position: absolute top-right)
- On 320px the lock icon at 12px fits without crowding

### Q4: Текст сообщения

**Recommendation:** Option (b) with slight modification — include alternative, don't blame restaurant

**Proposed text (RU):**
> «Эта функция пока не подключена. Обратитесь к персоналу напрямую.»

**Proposed text (EN):**
> «This feature is not yet available. Please ask your server directly.»

**Reasoning:**
1. **"Пока не подключена"** — neutral, implies it might be connected later (subtle upsell: "your restaurant could have this"). Better than "не активирована" (sounds like a bug) or "временно недоступна" (implies outage).
2. **"Обратитесь к персоналу напрямую"** — gives an immediate alternative. The guest came to Help Drawer with a need (call waiter, get bill). Don't leave them without a solution. This is critical UX: blocked action + alternative = acceptable. Blocked action + dead end = frustrating.
3. **Why NOT option (a) "Эта функция сейчас не активирована"**: no alternative action. Guest doesn't know what to do next.
4. **Why NOT option (c) "Эта функция временно недоступна"**: implies a technical problem. The restaurant might get complaints about "your app is broken". This is not a bug — it's a plan limitation.
5. The text should be through `t()` / `tr()` for i18n: key `help.free_gate.message` and `help.free_gate.alternative`.

**Trade-offs:** "Обратитесь к персоналу напрямую" — some restaurants might feel this undermines their tech image. But it's practical: the guest has a real need right now.

**Mobile UX:** Text fits in 2 lines on 320px in the compact bottom sheet. No truncation issues.

### Q5: Self-promo #181 — в том же сообщении или отдельно?

**Recommendation:** (b) Separate block #181 — do NOT mix with #180 message

**Reasoning:**
1. **Context mismatch.** The guest just tried to call a waiter and was blocked. This is a moment of mild frustration. Inserting "Powered by MenuApp" or a CTA here feels exploitative — capitalizing on the guest's negative experience. This violates the Monetization doc's own rule: "реклама не должна мешать гостю" (§12.1).
2. **Monetization doc §9.2 is clear:** self-promo is allowed "after success state" (after waiter called, bill requested, etc.). A BLOCKED action is the opposite of a success state. Showing promo here contradicts the established placement rules.
3. **Trust erosion.** If the guest sees "this feature is blocked" + "buy MenuApp", they may think the block is artificial/greedy rather than a legitimate plan limitation. This hurts both MenuApp's brand and the restaurant's trust.
4. **#181 has better placement options:** bottom of menu, after successful order, footer of PublicMenu. These are "natural pause" moments per §9.1 — much more effective for conversion anyway.
5. **Option (c) "Powered by MenuApp" small text** in the message — even this creates an association between the block and the platform brand. The guest's thought process: "MenuApp is blocking me from calling a waiter". Not the brand impression we want.

**Implementation note:** #181 should be a completely separate component, separate task, separate UX context. It belongs in the menu browsing flow (§9.2: end_of_category, bottom_of_menu), not in Help Drawer at all.

**Trade-offs:** We lose a high-visibility placement opportunity. But the conversion quality would be low (frustrated user → low click-through, high bounce) and the brand risk is real.

**Mobile UX:** N/A — recommendation is to not show anything here.

## Summary Table

| # | Question | CC Recommendation | Confidence |
|---|----------|-------------------|------------|
| 1 | UI pattern for message | Compact bottom sheet (auto-dismiss 5s) | high |
| 2 | Scope: which buttons to block | All 6 + "Другой запрос?" (all are service requests requiring staff) | high |
| 3 | Visual signal before tap | Dimmed (opacity 0.5) + 🔒 12px top-right on each card | high |
| 4 | Message text | "Эта функция пока не подключена. Обратитесь к персоналу напрямую." | high |
| 5 | Self-promo in same message | No — separate #181 task, different placement (menu flow, not Help Drawer) | high |

## Prompt Clarity

- Overall clarity: **5/5**
- Ambiguous questions: none — all 5 questions are well-scoped with clear options and criteria
- Missing context: none critical. The Help Drawer UX doc v6.0 and Monetization doc provided all necessary context. The only minor addition that would help: what does the FAB button (bell icon) look like on Free plan? Should it also have a visual indicator? (This could be a follow-up question for implementation.)
