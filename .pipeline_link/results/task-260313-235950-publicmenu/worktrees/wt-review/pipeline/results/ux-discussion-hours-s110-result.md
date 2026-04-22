# UX Discussion: Working Hours Display for Guests on /x (PublicMenu)

**Session:** S110
**Date:** 2026-03-11
**Type:** UX Discussion (ST-02 Sticky Task, Stage B)
**Participants:** Claude Code (analysis + recommendation)

---

## Current State

### What exists
- **PartnerSettings** has a full `WorkingHoursSection` where partner configures:
  - Per-day schedule: `{ mon: { open: "10:00", close: "22:00", active: true }, ... }`
  - Stored as `partner.working_hours` (JSON) + `partner.working_hours_note` (text)
  - Default: all days 10:00-22:00, all active
- **i18n keys** already exist (from S79): `public.closed_banner.title`, `public.closed_banner.subtitle`

### What is missing
- **PublicMenu (x.jsx)** does NOT read `partner.working_hours` at all
- No open/closed status check on /x
- No display of hours to guest
- No order blocking when closed

---

## Question 1: Where to show working hours to guests?

### Recommendation: **Banner below header + info in restaurant card**

**Primary: Contextual status banner (below header, above menu)**
- When OPEN: no banner (clean UX, don't clutter)
- When CLOSED: yellow/amber banner — "Закрыто. Меню доступно для просмотра"
- When CLOSING SOON (<=30 min): subtle info banner — "Открыто до 22:00"

**Secondary: Tap-to-expand schedule (in header area)**
- Small clock icon + "Открыто до 22:00" next to restaurant name
- Tap → expandable section showing full weekly schedule
- Uses minimal space, accessible on demand

**Why not other options:**
- Modal on entry — too aggressive, interrupts browsing. Guests scanning QR just want to see the menu.
- Separate section below menu — too far down, guests may not scroll to it.
- Footer — invisible on mobile.

### Implementation sketch
```
[Header: Logo + Restaurant Name + (Clock icon "до 22:00" ▾)]
[CLOSED BANNER — only when closed]                           ← amber/yellow
[Category tabs]
[Menu grid]
```

---

## Question 2: What to do when restaurant is CLOSED?

### Recommendation: **Option C — Show menu + disable ordering**

| Option | Behavior | Verdict |
|--------|----------|---------|
| A. Block everything, show "closed" page | Guest can't see menu at all | Too restrictive. Guests want to browse before visiting. |
| B. Show menu + warning, allow ordering | Orders pile up while closed | Dangerous. Kitchen gets ghost orders. |
| **C. Show menu + warning, disable order button** | **Browse only, no ordering** | **Best balance. Clear intent, no confusion.** |

**Detailed behavior when CLOSED:**

1. **Banner appears** at top: "Закрыто — Меню доступно для просмотра" (amber background)
2. **Menu is fully browsable** — categories, dishes, descriptions, photos, prices
3. **"Add to cart" buttons hidden or disabled** — guest cannot add items
4. **Cart icon hidden or shows badge "closed"**
5. **If guest had items in cart from before closing** — show message in cart: "Ресторан закрылся. Ваша корзина сохранена до открытия."

**This aligns with existing i18n:**
- `public.closed_banner.title` = "Закрыто"
- `public.closed_banner.subtitle` = "Меню доступно для просмотра"
- `settings.hours.status_closed_hint` = "Заказы недоступны. Гости видят меню."

### Edge case: What about pickup/delivery?
- Same rule — if restaurant is closed, no ordering on any channel
- Partner can override via a manual "force open" toggle in PartnerSettings (future feature, not for Stage B)

---

## Question 3: Format of hours display

### Recommendation: **"Today" status as primary, full schedule on tap**

**Primary display (always visible in header):**
```
Clock icon  Открыто до 22:00           ← if open
Clock icon  Закрыто · откроется в 10:00 ← if closed
Clock icon  Закрывается в 22:00 (скоро) ← if closing within 30 min
```

**Expanded view (tap on clock/schedule text):**
```
Пн  10:00 — 22:00
Вт  10:00 — 22:00
Ср  10:00 — 22:00    ← today highlighted
Чт  10:00 — 22:00
Пт  10:00 — 23:00
Сб  11:00 — 23:00
Вс  Выходной
```
Plus `working_hours_note` if set (e.g., "Кухня закрывается за 30 мин до закрытия").

**Why this format:**
- Google Maps / 2GIS / Yandex Maps all use "Open until X" as primary — users expect it
- Full schedule is important for planning but shouldn't take prime screen space
- "Closing soon" warning prevents frustration (guest orders, kitchen can't fulfill)

### i18n keys needed
```
public.hours.open_until      → "Открыто до {time}"
public.hours.closed_opens_at → "Закрыто · откроется в {time}"
public.hours.closing_soon    → "Закрывается в {time}"
public.hours.day_off         → "Выходной"
public.hours.schedule_title  → "Часы работы"
public.hours.note_label      → "Примечание"
```

---

## Question 4: Timezones and edge cases

### 4a. Timezone handling

**Recommendation: Server-side timezone from partner settings**

- Partner entity should store `timezone` (e.g., "Asia/Almaty")
- Working hours are in partner's local time
- Client computes "is open now" using:
  ```js
  const now = new Date().toLocaleTimeString('en-GB', {
    timeZone: partner.timezone || 'Asia/Almaty',
    hour: '2-digit', minute: '2-digit'
  });
  ```
- If `partner.timezone` is not set, default to `Asia/Almaty` (most MenuApp partners are in Kazakhstan)
- Guest's device timezone is irrelevant — the restaurant is in a fixed location

**Data model change needed:** `partner.timezone` field (string). This requires a B44 prompt.

**Fallback for Stage B (no data model change):** Default to `Asia/Almaty` for all partners. Add timezone support in Stage C.

### 4b. Edge case: Closing in <30 minutes

**Show "closing soon" warning:**
- Threshold: 30 minutes before closing time
- Display: amber text "Закрывается в 22:00" in header
- If guest has items in cart: show additional warning in cart — "Ресторан закрывается через N минут. Отправьте заказ сейчас."
- Do NOT auto-block ordering — let guest decide (they might be quick)

### 4c. Edge case: Restaurant transitions to closed while guest is browsing

**Handle gracefully:**
- Poll partner data every 5 minutes (already happening via react-query)
- When status changes open→closed:
  - Show banner with animation (slide down)
  - If cart is open: show inline message "Ресторан закрылся"
  - Disable "Send to waiter" / "Submit order" button
  - Do NOT clear the cart (guest may want to save for later)
  - Do NOT force-close the drawer

### 4d. Edge case: Partner has NOT configured working hours

**Default: treat as always open**
- If `partner.working_hours` is null/undefined → no banner, no restrictions
- This is the current behavior (backwards compatible)
- Partners opt-in to schedule by configuring it in PartnerSettings

### 4e. Edge case: Midnight crossover (e.g., Fri 10:00-02:00 Sat)

**Stage B: NOT supported**
- Current data model stores `close: "22:00"` — times are within a single day
- Supporting "02:00 next day" requires data model change (either `close_next_day: true` flag or 24+ hour notation like "26:00")
- For Stage B: if close time < open time, treat as next-day closing (simple heuristic)
- Flag for Stage C: proper overnight schedule support

---

## Technical Implementation Plan (Stage B)

### Changes needed

**1. x.jsx — Add working hours logic (~50 lines)**
```
- Parse partner.working_hours (reuse parseWorkingHours from PartnerSettings)
- Compute isOpen / closingTime / nextOpenTime
- Render ClosedBanner component
- Render hours info in header
- Conditionally disable cart/ordering when closed
```

**2. x.jsx — ClosedBanner component (~20 lines)**
```
- Amber banner with Clock icon
- Title: tr("public.closed_banner.title", "Закрыто")
- Subtitle: tr("public.closed_banner.subtitle", "Меню доступно для просмотра")
```

**3. x.jsx — SchedulePopover component (~40 lines)**
```
- Triggered by clock icon in header
- Shows full weekly schedule
- Highlights today
- Shows working_hours_note if set
```

**4. CartView.jsx — Closed state handling (~10 lines)**
```
- Accept isRestaurantOpen prop
- When closed: disable submit button, show message
```

**5. i18n — New keys (~10 keys)**
```
- public.hours.* keys as listed above
```

### No data model changes needed for Stage B
- `partner.working_hours` and `partner.working_hours_note` already exist
- Timezone defaults to Asia/Almaty (no new field)

### Estimated scope
- x.jsx: ~100 new lines (helper function + 2 components + banner logic)
- CartView.jsx: ~10 modified lines (disabled state when closed)
- i18n CSV: ~10 new keys
- No new files needed

---

## Summary of Recommendations

| Question | Recommendation |
|----------|---------------|
| 1. Where to show? | Status line in header + closed banner above menu |
| 2. When closed? | Show menu for browsing, disable ordering |
| 3. Format? | "Open until X" primary, full schedule on tap |
| 4a. Timezone? | Use partner timezone, default Asia/Almaty |
| 4b. Closing soon? | Warning at 30 min, don't block ordering |
| 4c. Transition? | Graceful banner + disable submit, keep cart |
| 4d. No hours set? | Treat as always open (backwards compatible) |
| 4e. Midnight cross? | Heuristic for Stage B, proper support in Stage C |

### Decision needed from Arman

1. **Confirm Option C** (browse menu when closed, no ordering) vs Option B (allow ordering anytime)
2. **Closing soon threshold** — 30 minutes? 15 minutes? Configurable per partner?
3. **Should "Add to cart" be disabled when closed?** Or only the final submit button? (Recommendation: disable Add to cart — cleaner UX)
4. **Timezone: OK to default Asia/Almaty for Stage B?** Or need B44 prompt for timezone field first?
5. **Priority for implementation** — should this be next task or after other pending items?
