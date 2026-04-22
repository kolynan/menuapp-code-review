# UX Discussion: Working Hours Display on Partner Settings

**Session:** S111
**Date:** 2026-03-11
**Type:** Quick smoke test (1 round)
**Page:** PartnerSettings

---

## Question

Should working hours be shown as a simple text field or as a structured day-by-day picker?

- **Option A:** Single text field (e.g. "Mon-Fri 9:00-22:00, Sat-Sun 10:00-23:00")
- **Option B:** Structured picker — each day of week has open/close time inputs

## Current State

The screenshot (`pages/PartnerSettings/ux/screenshot.png`) shows that **Option B is already implemented**. The current UI has:

- 7 rows (Mon-Sun), each with open time + close time inputs
- A checkbox "Рабочий день" (Working day) to toggle each day on/off
- A "Скопировать на все дни" (Copy to all days) button for quick fill
- A "Примечание" (Note) text field below for free-text notes (e.g. "Kitchen closes 30 min before closing")

## Analysis

| Criteria | Option A: Text Field | Option B: Structured Picker (current) |
|---|---|---|
| **Mobile UX** | Faster entry but error-prone; hard to tap-edit on phone | More taps, but each input is a simple time picker — native mobile time selectors work well |
| **Ease of entry** | Quick for simple schedules ("9-22 daily") | More clicks, but "Copy to all days" button mitigates this significantly |
| **Data consistency** | Free text = no validation, inconsistent formats | Structured = guaranteed valid times, easy to query/filter |
| **i18n** | Day names must be parsed or hardcoded in text | Day labels are simple i18n keys (`common.monday`, etc.) — clean separation |
| **Guest display** | Must parse free text to render nicely | Structured data renders consistently on guest-facing `/x` page |
| **Edge cases** | Handles "24/7", "by appointment", split shifts naturally | Needs special handling for overnight hours (e.g. Tue 10:00-01:29 as shown in screenshot), 24/7, or split shifts |

## Recommendation

**Keep Option B (structured picker)** — it is already implemented and working. The structured approach is clearly superior for:

1. **Data quality** — no ambiguous formats, guaranteed valid times
2. **Guest experience** — consistent rendering across languages
3. **Mobile** — native time pickers are touch-friendly; "Copy to all" reduces taps
4. **Overnight hours** — already handled (screenshot shows Tue 10:00-01:29)

The free-text "Примечание" field covers edge cases (split shifts, seasonal notes, "kitchen closes early").

### Minor improvements to consider (not blockers):

- **P3:** Add i18n for day abbreviations (Пн/Вт/Ср... currently appear hardcoded in Russian)
- **P3:** Consider a "24/7" toggle that auto-fills all days with 00:00-00:00
- **P3:** Consider split-shift support (lunch break) if restaurants request it — low priority

## Verdict

**No design change needed.** Option B (structured picker) is already live and is the right choice. The "Copy to all days" + "Note" field combination covers both common and edge-case scenarios well.
