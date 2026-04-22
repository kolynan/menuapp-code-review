---
task_id: redesign-cart-drawer-v2-s74
type: feature
priority: P1
created: 2026-03-03
session: S74
budget: 15.00
---

# Task: Cart Drawer v2 — Two-Mode Design (Заказ / Чеки)

## Git first
```
git add . && git commit -m "S74 pre-drawer-v2 snapshot" && git push
```

## Context

Cart Drawer redesign for `/x` (PublicMenu). Replace the current overloaded single-view drawer with a clean two-mode design based on cart state. Consensus: Claude + ChatGPT + Arman across 4 rounds.

**Key principle:** The drawer shows ONLY what's relevant to the guest's current intent.

## Files to change

| File | Action |
|------|--------|
| `menuapp-code-review/pages/StaffOrdersMobile/260303-06 StaffOrdersMobile RELEASE.jsx` | Read for context only (do not modify) |
| `menuapp-code-review/pages/PublicMenu/260303-05 CartView RELEASE.jsx` | Edit — main drawer component |
| `menuapp-code-review/pages/PublicMenu/260303-04 x RELEASE.jsx` or `260303-05 x RELEASE.jsx` | Edit — drawer state + StickyCartBar visibility |

> Note: Check if `StickyCartBar.jsx` exists as a separate component in `base/`. If yes, modify it too for sticky footer conditional visibility.

## Mode Logic

```
cartItemsCount > 0  →  Mode "Заказ"   (action-first: send new order)
cartItemsCount === 0 →  Mode "Чеки"   (history: view past orders + bill)
```

Mode switches automatically and instantly (crossfade 150–200ms). Header (Стол / Гость / ✕) stays the same — no "screen change" feeling.

---

## Mode 1: "Заказ" (cart > 0)

### What to show

```
┌─────────────────────────────────────┐
│ Стол 22 · Гость 2               ✕  │
├─────────────────────────────────────┤
│ 🛒 НОВЫЙ ЗАКАЗ                      │
│ Стейк        ×1   [− 1 +]   56 ₸    │
│ Капучино     ×2   [− 2 +]   24 ₸    │
│                                     │
│ Подробности ▸                        │
│  (внутри: скидка онлайн, бонус +2Б) │
│                                     │
│ 📋 Мои заказы (1) · 56 ₸        ▸   │
│ 💳 Счёт · Только я: 56 ₸        ▸   │
│                                     │
│ ─── sticky footer ───────────────── │
│ Итого: 77 ₸   [Отправить официанту] │
└─────────────────────────────────────┘
```

### Rules
- "Новый заказ" section: full items list with steppers. This is always visible (not collapsible).
- "Подробности ▸": collapsible block for discounts/bonuses. Collapsed by default.
- "📋 Мои заказы (N) · сумма ▸": collapsed row. On tap — expands inline (1–2 latest + "Показать все (N)"). Expanding does NOT hide the sticky footer.
- "💳 Счёт · Только я: X ▸": collapsed row. On tap — expands toggle [Только я / На всех] + "Другие гости" (only visible inside "На всех").
- **Sticky footer**: always visible when `cart > 0`. Shows: total + [Отправить официанту] button.
- When all items removed from cart → instantly switch to Mode "Чеки" (crossfade).

### "Отправить" action
1. Button → "Отправляем…" (disabled state)
2. On success → toast "Заказ отправлен официанту" (1 sec)
3. Cart cleared → drawer auto-switches to Mode "Чеки"
4. New receipt appears at top with status 🟡 "Отправлен"

---

## Mode 2: "Чеки" (cart = 0)

### What to show

```
┌─────────────────────────────────────┐
│ Стол 22 · Гость 2               ✕  │
├─────────────────────────────────────┤
│ 📋 МОИ ЗАКАЗЫ                       │
│                                     │
│ 11:15  Заказ #2                     │
│ Стейк ×1, Капучино ×2       77 ₸    │
│ 🟡 Отправлен (ожидает подтверждения) │
│                                     │
│ 11:02  Заказ #1                     │
│ Стейк ×1                     56 ₸   │
│ ✅ Готов                             │
│ ★ Оценить +10Б  ← only if not rated │
│                                     │
│ [＋ Заказать ещё]                    │
├─────────────────────────────────────┤
│ 💳 СЧЁТ                              │
│ [ Только я: 133₸ ] [ На всех: 187₸ ]│
│  ▸ Другие гости (1)                  │
└─────────────────────────────────────┘
```

### Rules
- List orders newest-first. Newest order: expanded by default. Older orders: collapsed.
- If 3+ orders: show last 2–3 expanded, rest under "Показать все (N)".
- Status badges per order:
  - 🟡 Отправлен
  - 🟢 Принят
  - 🔵 Готовится
  - ✅ Готов
  - Use `OrderStage` if available; fallback to default flow.
- Rating prompt "★ Оценить +10Б": show ONLY when order status = ✅ Готов AND not yet rated.
- After rating: show "Спасибо! +10Б начислено" inline next to stars (not a top banner).
- "[＋ Заказать ещё]": closes drawer and returns guest to menu.
- No sticky footer in Mode "Чеки" (no action to perform).
- **Счёт section**: toggle [Только я / На всех]. "Другие гости" row visible only inside "На всех" mode. Collapsed by default.
- Empty state (no orders yet): "Пока нет заказов" + button "Выбрать блюда" (closes drawer).

---

## Edge Cases

1. **Guest in "Чеки", taps "Заказать ещё", adds item, opens drawer** → Mode "Заказ" (cart > 0 rule).
2. **Guest in "Заказ", removes all items** → instant switch to Mode "Чеки" (crossfade 150ms).
3. **Guest in "Заказ" wants to see previous order status** → tap "📋 Мои заказы ▸" → expands inline. Sticky footer stays visible.
4. **3+ orders in "Чеки"** → show last 2–3, "Показать все (N)" for more.
5. **No past orders, cart empty** → Mode "Чеки" with empty state.

---

## What NOT to do
- Do NOT add payment/split-payment (out of scope).
- Do NOT change session logic (8h/4h thresholds).
- Do NOT add new entities or fields.
- Do NOT use navigation tabs for [Только я / На всех] — it's a content filter toggle within "Счёт" section only.
- Do NOT break BUG-3 fix (drawer snap 80-85% height) from task fix-guest-cart-ux-p0-s74.

## Dependencies
- This task DEPENDS on `fix-guest-cart-ux-p0-s74` completing first:
  - BUG-3 (drawer height) must already be fixed
  - Status badges code may already exist from that task — check and reuse
  - "Заказ отправлен" text (not "Принят") must already be in place

## CC + Codex: investigate first
- How is the current CartView structured? Is it one component or split?
- Does StickyCartBar exist as a separate component?
- How is `cartItemsCount` / cart state currently tracked (context? local state? hook)?
- How are past orders fetched for the guest — polling? event-based?
- Does `OrderStage` entity exist with status values? What are they?
- Check if any animation library (framer-motion etc.) is already used for transitions.

---

## Acceptance criteria
- [ ] `cartItemsCount > 0` → drawer shows Mode "Заказ": new order items + steppers + sticky CTA
- [ ] `cartItemsCount === 0` → drawer shows Mode "Чеки": order history + statuses + "Заказать ещё" + Счёт
- [ ] After "Отправить": toast → drawer auto-switches to "Чеки" → new order at top with 🟡 status
- [ ] In Mode "Заказ": "Мои заказы ▸" expands inline without hiding sticky footer
- [ ] Toggle [Только я / На всех] works; "Другие гости" only shown inside "На всех"
- [ ] Rating prompt only for ✅ Готов and unrated orders
- [ ] After rating: inline "Спасибо! +10Б начислено" (not top banner)
- [ ] "Заказать ещё" closes drawer
- [ ] Crossfade transition 150–200ms between modes
- [ ] Empty state shown when no orders and cart empty
- [ ] No console errors
- [ ] Mobile 320px — sticky footer does NOT overlap content

## Output
- RELEASE: `260303-NN CartView RELEASE.jsx` (increment from current)
- RELEASE: `260303-NN x RELEASE.jsx` (if x.jsx modified)
- RELEASE: `260303-NN StickyCartBar RELEASE.jsx` (if component exists and modified)
- Updated `PublicMenu README.md` with changelog
- Updated `BUGS.md` with fixed items (BUG-6 auto-scroll resolved by mode switch)
- CC + Codex both review before RELEASE
