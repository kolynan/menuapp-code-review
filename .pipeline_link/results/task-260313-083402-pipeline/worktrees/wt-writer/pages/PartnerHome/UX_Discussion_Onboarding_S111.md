# UX Discussion S111 — Partner Onboarding: First Steps After Registration

**Date:** 2026-03-11
**Participants:** CC (Claude Code)
**Session:** S111
**Page:** PartnerHome

---

## Current State

RELEASE 260305-00 already includes a **4-step onboarding checklist** on PartnerHome:
1. Add menu items → `/menumanage`
2. Add tables → `/partnertables` (+ "Download QR PDF" when done)
3. Configure channels → `/partnersettings`
4. Add staff → `/partnerstaffaccess` (+ copy invite link)

Features: progress bar (0/4 → 4/4), per-step CTA buttons, completion state with "Download QR PDF" button, "Open guest menu" preview link.

**Screenshot observation:** The BASE version (without checklist) shows an empty white card + "Пока здесь пусто" — a completely blank experience for a new partner.

---

## Options Analysis

### Option 1: Checklist Widget (CURRENT — already implemented)

**What exists:** 4-step checklist card at the top of PartnerHome dashboard.

**Strengths:**
- Already built and deployed (260305-00)
- Non-blocking — partner can explore freely, checklist is just guidance
- Shows progress visually (progress bar)
- Each step has a clear CTA with direct navigation
- Completion state celebrates and gives next action (QR PDF)
- Mobile-friendly — vertical layout, 44px touch targets

**Weaknesses:**
- All 4 steps shown at once — can feel overwhelming on mobile (small screen)
- No "why" explanation — partner doesn't understand the value of each step
- No estimated time ("this takes 2 minutes")
- Step 3 (channels) may confuse new partners who just want basic hall service
- Checklist disappears completely after all 4 done — no way to revisit setup

**Verdict:** Good foundation. Needs refinements, not replacement.

### Option 2: Step-by-Step Wizard (Full-Screen Guided Flow)

**Strengths:**
- Lowest cognitive load — one screen, one decision at a time
- Can include explanations, examples, and tips per step
- Guarantees sequential completion (menu before tables makes sense)
- Common pattern in SaaS onboarding (Stripe, Shopify, etc.)

**Weaknesses:**
- Heavy to build — needs its own route, state management, navigation
- Blocks exploration — partner can't see the dashboard until wizard is done
- Hard to resume — if partner closes browser mid-wizard, where do they land?
- Some partners (experienced restaurateurs) will find it patronizing
- i18n burden — many more strings for wizard screens (ru/en/kk)
- Base44 constraint — complex multi-step flows are harder to maintain on no-code platform

**Verdict:** Too heavy for current stage. Consider later when MenuApp has 100+ partners.

### Option 3: Empty State Prompts (Smart Empty States per Section)

**Strengths:**
- Contextual — guidance appears exactly where partner needs it
- No separate onboarding component needed
- Each page (menu, tables, etc.) owns its own empty state
- Works well for partners who navigate freely

**Weaknesses:**
- No centralized progress tracking — partner doesn't know overall status
- Requires changes across multiple pages (not just PartnerHome)
- Partner might not visit all pages → never discover some features
- Harder to maintain consistency across empty states
- Current pages may already have their own empty states

**Verdict:** Good supplementary approach, but not sufficient alone.

### Option 4: Combination — Checklist + Targeted Improvements

**Recommendation: This is the best path forward.**

Keep the existing checklist (Option 1) as the central hub, and enhance it with the best ideas from Options 2 and 3.

---

## Recommended Approach: Enhanced Checklist (Option 4)

### Phase 1: Quick Wins (can implement now)

#### 1A. Focus mode — highlight next uncompleted step
Instead of showing all 4 steps equally, visually emphasize the NEXT step to complete. Completed steps collapse to a single line. The next pending step gets expanded with description + CTA.

**Why:** Reduces cognitive load from "4 things to do" to "1 thing to do next."

**Implementation:** Add `isNext` flag to the first incomplete step. Render it with a highlighted border (e.g., `border-indigo-300 bg-indigo-50`). Other incomplete steps show title only, no description/CTA until they become "next."

#### 1B. Add time estimates per step
```
Step 1: Добавьте блюда в меню (~3 мин)
Step 2: Создайте столы и QR-коды (~2 мин)
Step 3: Настройте каналы заказов (~1 мин)
Step 4: Пригласите официантов (~1 мин)
```

**Why:** Reduces anxiety. "7 minutes total" feels manageable.

**Implementation:** Add `estimate` field to each step config. Show as small text next to step title. i18n key: `partnerhome.onboarding.stepN.estimate`.

#### 1C. Mark Step 3 (Channels) as optional
Most new restaurants only need hall service. Channels (pickup/delivery) are an advanced feature.

**Why:** Reduces the "must do 4 things" to "must do 3 things + 1 optional." Faster time-to-publish.

**Implementation:** Add `optional: true` flag. Show "(необязательно)" label. Don't count it toward progress bar unless completed. Progress bar: "2/3 обязательных шагов".

### Phase 2: Medium-term improvements

#### 2A. "Test your menu" prompt after Step 1
After partner adds their first dish, show a mini-prompt: "Preview how guests will see your menu" with a link to `/x?partner=...&mode=hall`. This gives immediate gratification — they see their restaurant come to life.

**Why:** Emotional reward loop. Partner sees results immediately, motivating them to continue.

#### 2B. Smart empty states on target pages
When partner clicks "Add menu items" and lands on `/menumanage` with zero dishes, that page should show a friendly empty state: "Add your first dish to get started" with an "Add dish" button. Same for `/partnertables`.

**Why:** Continuity. The checklist sends them to a page; that page should continue the guided experience.

**Note:** This requires changes to MenuManage, PartnerTables, etc. — separate tasks.

#### 2C. Persistent "Setup incomplete" indicator
After partner dismisses/scrolls past the checklist, show a small persistent badge on the PartnerHome tab (or a floating indicator) reminding them setup is incomplete.

**Why:** Partners who get distracted can easily resume onboarding.

### Phase 3: Future (when scale justifies)

#### 3A. Full wizard for first-time setup
If analytics show that partners drop off during onboarding, build a full-screen wizard as the very first experience (before showing the dashboard). Should be skippable.

#### 3B. Onboarding email sequence
Trigger emails: "You created your restaurant! Next: add your first dish." → "You added 5 dishes! Now create tables." etc.

**Note:** Requires backend/B44 automation, not a frontend task.

---

## Evaluation Against Criteria

| Criterion | Option 1 (Current) | Option 2 (Wizard) | Option 3 (Empty States) | Option 4 (Enhanced Checklist) |
|-----------|--------------------|--------------------|------------------------|-------------------------------|
| Time to first published menu | Medium | Fast (forced) | Slow (undirected) | **Fast (guided + focused)** |
| Cognitive load | Medium (4 steps) | **Low** (1 at a time) | Low per page | **Low (focus mode)** |
| Mobile-first | Good | Complex | Good | **Good** |
| Skip-ability | **Full** | Poor | **Full** | **Full** |
| i18n effort | Low (done) | High | Medium | **Low (incremental)** |
| Build effort | **Done** | High | Medium | **Low (Phase 1)** |
| Base44 compatibility | **Good** | Poor | Good | **Good** |

---

## Decision Needed from Arman

### Priority 1: Focus mode (1A)
- [ ] **Yes** — Highlight next step, collapse completed steps
- [ ] **No** — Keep all steps equally visible (current behavior)
- [ ] **Modified** — (describe)

### Priority 2: Time estimates (1B)
- [ ] **Yes** — Add "~N мин" to each step
- [ ] **No** — Keep clean without estimates

### Priority 3: Optional channels step (1C)
- [ ] **Yes** — Mark Step 3 as optional, 3-step progress bar
- [ ] **No** — Keep all 4 steps required
- [ ] **Modified** — Hide Step 3 entirely for new partners

### Priority 4: "Test your menu" prompt (2A)
- [ ] **Yes** — Add preview prompt after first dish added
- [ ] **Later** — Good idea, but not now
- [ ] **No**

### Priority 5: Smart empty states on other pages (2B)
- [ ] **Yes** — Add to MenuManage, PartnerTables as separate tasks
- [ ] **Later**
- [ ] **No**

---

## Summary

The existing checklist (260305-00) is a solid foundation. The recommended path is **Option 4: Enhanced Checklist** — keep what works, add focus mode + time estimates + optional step marking. This gives the best ratio of UX improvement to implementation effort, stays mobile-friendly, and works within Base44 constraints.

**Estimated implementation effort for Phase 1:** ~1 session (3 small changes to OnboardingChecklist component).
