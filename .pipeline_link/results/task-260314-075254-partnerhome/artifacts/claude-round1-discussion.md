# Round 1 — Claude Analysis: PartnerHome Empty State UX

**Task ID:** task-260314-075254-partnerhome
**Date:** 2026-03-14
**Round:** 1 (Claude initial analysis)
**Page:** PartnerHome (`/partnerhome`)

---

## 1. Topic Framing

**The question:** When a restaurant partner opens their dashboard and has zero open tables and zero orders today, what should they see?

**Current behavior (from screenshot + code, lines 589-596):**
The page shows three blocks stacked vertically:
1. **Empty white card** at top — the tables banner showing "Нет открытых столов" (clickable, navigates to `/partnertables`)
2. **"Сегодня" statistics block** — shows "0 Заказы / 0 ₸ Выручка" with channel rows all at "0 зак. · 0 ₸"
3. **Blue hint banner** at bottom — "Пока здесь пусто" (a single line of text)

Above all of this, the **onboarding checklist** (added in 260305-00) may also appear if the partner hasn't completed all 4 setup steps.

**Why this matters:** The empty dashboard is the very first thing a partner sees after setup. It's the moment they're most likely to feel lost, wonder "now what?", and potentially churn. The current empty state communicates *absence* ("nothing here") rather than *opportunity* ("here's what you can do").

---

## 2. User Goals and Constraints

### Who sees this empty state?
Two distinct personas hit this screen with zero tables/orders:

| Persona | Situation | Goal |
|---------|-----------|------|
| **New partner** (just finished onboarding) | Completed setup steps, no guests yet | Understand how to get first orders, test QR flow |
| **Returning partner** (slow day / morning) | Restaurant not yet open for the day | Quick glance to confirm nothing pending, then move on |

### Platform constraints
- **Base44 no-code:** Complex interactive widgets are harder to maintain. Simple, declarative components are preferred.
- **Mobile-first:** Most partners use phones. Vertical scroll is fine; horizontal complexity is not.
- **i18n:** All strings need `t('key')` in ru/en/kk. More content = more translation work.
- **6 useQuery calls already:** PartnerHome already loads Partner, TableSession, Order, Dish, Table, and StaffAccessLink. Adding more queries has performance implications.

---

## 3. Current Friction Points

### 3A. The "zero-zero" dashboard feels broken
**Observed in screenshot:** Seeing "0 Заказы / 0 ₸ Выручка" with three channel rows all showing "0 зак. · 0 ₸" is information-dense but value-empty. It looks like a dashboard that failed to load data, not a dashboard with no activity yet.

**Impact:** The partner may wonder if something is misconfigured, or simply feel deflated looking at walls of zeroes.

### 3B. The hint banner is too vague
The blue "Пока здесь пусто" banner (line 591-596) is a single sentence with no actionable content. It doesn't tell the partner:
- *Why* it's empty (no guests have scanned your QR yet)
- *What to do* about it (share QR codes, open a table manually, test the flow)

### 3C. Statistics block shows even when meaningless
When `totalOrders === 0`, showing the full "Сегодня" block with channel breakdowns (Hall: 0, Pickup: 0, Delivery: 0) adds visual noise without value. It's useful once orders start coming in; before that, it's clutter.

### 3D. No distinction between "new partner" and "slow morning"
A partner who just completed onboarding 5 minutes ago needs different guidance than one who's been operating for weeks and just hasn't had orders yet today. The current empty state treats both identically.

### 3E. The tables banner is clickable but visually passive
The "Нет открытых столов" card (lines 478-505) is a full-width clickable button, but the screenshot shows it as a nearly blank white card. The hover state (`hover:border-indigo-300 hover:shadow-md`) only works on desktop. On mobile, there's no affordance indicating it's tappable.

---

## 4. Recommendations

### Recommendation A: Replace hint banner with actionable empty state card
**Priority: High | Effort: Low**

Replace the current single-line "Пока здесь пусто" banner with a structured empty state card containing:

```
[Icon: coffee cup or clock illustration]

"Ожидание первых гостей"
"Столы созданы, меню готово — осталось дождаться первого сканирования QR-кода."

[Button: "Попробовать самому →"]  [Button: "Поделиться QR"]
```

**"Попробовать самому"** opens the guest menu in a new tab (`/x?partner=...&mode=hall`). This lets the partner experience the guest flow themselves — powerful for building confidence.

**"Поделиться QR"** navigates to `/partnertables` where they can download/share QR codes.

**Why this works:**
- Explains *why* the dashboard is empty (waiting for scans)
- Gives two concrete next actions
- Reuses existing routes (no new backend work)
- Only 3-4 new i18n keys

### Recommendation B: Collapse statistics block when empty
**Priority: Medium | Effort: Low**

When `totalOrders === 0 && openTables === 0`, either:
- **(B1)** Hide the "Сегодня" statistics block entirely, OR
- **(B2)** Collapse it to a single summary line: "Сегодня: пока нет заказов" (expandable)

I recommend **B1** (hide entirely). The statistics block's purpose is to show today's performance at a glance. When performance is zero, there's nothing to glance at. Showing it creates visual noise that pushes the actionable empty state card further down the screen.

The block should appear as soon as the first order comes in — this creates a satisfying "the dashboard came alive" moment.

**Tradeoff:** Some partners may expect to always see the stats area, even when empty. B2 addresses this by keeping it present but compact.

### Recommendation C: Add a visual illustration to the empty state
**Priority: Medium | Effort: Medium**

An illustration (simple line art or icon composition) of a restaurant scene with a QR code on the table communicates "this is a QR menu app waiting for guests" without words. This is standard practice in modern SaaS dashboards.

**Options:**
1. **Lucide icon composition** (e.g., `Coffee` + `QrCode` icons arranged together) — easiest, no asset management
2. **Simple SVG illustration** — more polished, but needs design + maintenance
3. **Emoji approach** (current: 💡) — cheapest but least professional

I recommend **Option 1** (icon composition) for now. It's consistent with the existing design system (Lucide icons used throughout), requires no external assets, and works across all screen sizes.

### Recommendation D: Quick action buttons row
**Priority: Medium | Effort: Low**

Add 2-3 quick action buttons to the empty state, contextual to the partner's situation:

| Action | When to show | Route |
|--------|-------------|-------|
| "Открыть гостевое меню" | Always | `/x?partner=...&mode=hall` (new tab) |
| "Управление столами" | Always | `/partnertables` |
| "История заказов" | Only if partner has had past orders | `/partnerorders` (if exists) |
| "Редактировать меню" | Always | `/menumanage` |

Show at most 3 buttons to avoid decision paralysis. The first two are the most important — they help the partner either test the flow or manage their setup.

### Recommendation E: Differentiate new vs. returning partner empty state
**Priority: Low | Effort: Medium**

Use the onboarding completion status to tailor the message:

- **Onboarding incomplete:** The onboarding checklist already covers this — no changes needed. The empty hint can be hidden entirely since the checklist provides guidance.
- **Onboarding complete, first day:** Show the "Ожидание первых гостей" card (Recommendation A) with emphasis on testing the QR flow.
- **Onboarding complete, has past orders:** Show a lighter message like "Спокойное утро — новые заказы появятся здесь" with just the stats area collapsed.

**Implementation signal:** Check if `ordersQ.data` has any historical orders (not just today's). If `totalHistoricalOrders > 0`, the partner is returning; if zero, they're new.

**Tradeoff:** This requires either a separate query or expanding the existing orders query beyond today. Given the 6 existing queries, this should be weighed against performance.

---

## 5. Tradeoffs and Risks

### What competitors do (for context)

| System | Empty dashboard approach |
|--------|------------------------|
| **Square Dashboard** | Shows "Getting started" checklist + placeholder cards where stats will appear, with "0" values grayed out rather than bold |
| **Toast POS** | Full-screen "Welcome" flow on first login, then persistent "Set up" sidebar until complete. Empty stats are hidden. |
| **iiko** | Minimal — shows empty tables map and zero stats. More operational, less guided. |
| **Poster POS** | Shows a "Your first steps" block with 3 actions, hides stats until first transaction |

**Pattern:** Modern POS systems generally *hide empty statistics* and *replace them with guidance or quick actions*. The "wall of zeroes" approach (which MenuApp currently uses) is common in older/enterprise tools but not in modern mobile-first products.

### Risk: Over-engineering the empty state
The empty state is seen briefly — once orders start flowing, the partner never sees it again (except on slow mornings). Investing too much in animations, illustrations, or complex logic may not justify the effort. **Keep it simple: better copy + quick actions + hide zeroes.**

### Risk: i18n burden
Each new string needs translation to ru, en, kk. The recommendations above add approximately:
- Rec A: 3-4 keys (title, description, 2 button labels)
- Rec B: 0-1 keys
- Rec C: 0 keys (icons only)
- Rec D: 2-3 keys (button labels, may reuse existing)
Total: ~6-8 new i18n keys. Manageable.

### Risk: Query performance
Recommendation E (differentiate new vs. returning) would ideally check historical order count. This could be done by reusing the existing orders query if it already fetches all orders (not just today's) — which it currently does (line 318: `Order.filter({ partner: partnerId })` fetches ALL orders, then filters client-side for today). So this data is **already available** at no extra cost.

### Tradeoff: Hiding stats vs. showing zeroes
Hiding the statistics block (Rec B1) makes the empty state cleaner but means the layout "jumps" when the first order arrives. Some partners may find the layout shift jarring. Alternative: keep the stats block but use a muted/skeleton style (gray text, lighter background) to signal "nothing yet."

---

## 6. Open Questions

### For product owner (Arman):

1. **Do we have data on how long partners spend on the empty dashboard?** If most partners get their first order within minutes of setup, the empty state matters less. If there's a multi-day gap between setup and first order, it matters a lot.

2. **Is there a "test order" flow?** Can the partner place a test order on their own restaurant? If yes, the empty state should prominently suggest this. If not, should we build one?

3. **Should the "Сегодня" block show yesterday's stats as a comparison?** E.g., "Вчера: 12 заказов, 45K ₸ — Сегодня: пока нет." This turns the empty state into a motivational comparison rather than a dead screen.

4. **Do we want to show a "time since last order" indicator?** For returning partners on a slow day, showing "Последний заказ: 14 часов назад" might be useful (or anxiety-inducing — needs UX judgment).

5. **Are there any planned features (like push notifications for new orders) that would change the dashboard's role?** If the partner gets push notifications, the dashboard becomes less critical as a monitoring tool and more of a reporting/summary view.

### For Round 2 (Codex):

6. **Do you agree that hiding the statistics block when empty is better than showing zeroes?** This is the most impactful visual change and I want to validate the approach.

7. **For the quick action buttons: should they be icon-only (compact) or icon+text (clear but larger)?** Mobile screen real estate is tight.

8. **Any concern about the "Попробовать самому" CTA creating confusion?** (Partner might place a real order on their own restaurant by accident.)

---

## Summary of Recommendations

| # | Recommendation | Priority | Effort | Impact |
|---|---------------|----------|--------|--------|
| A | Actionable empty state card (replaces vague banner) | **High** | Low | High — gives partners clear next steps |
| B | Hide/collapse statistics when zero orders | **Medium** | Low | Medium — removes visual noise |
| C | Visual icon/illustration for empty state | **Medium** | Medium | Medium — more professional feel |
| D | Quick action buttons (test menu, manage tables) | **Medium** | Low | Medium — reduces navigation friction |
| E | Differentiate new vs. returning partner | **Low** | Medium | Low-Medium — better messaging |

**Suggested implementation order:** A → B → D → C → E

Recommendations A, B, and D can likely be implemented together in a single session (~30-45 min of code changes + i18n keys). C and E are independent follow-ups.
