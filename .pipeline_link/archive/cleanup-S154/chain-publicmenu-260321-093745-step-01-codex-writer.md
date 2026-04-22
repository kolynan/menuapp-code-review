---
chain: publicmenu-260321-093745
chain_step: 1
chain_total: 4
chain_step_name: codex-writer
chain_group: writers
chain_group_size: 2
page: PublicMenu
budget: 12.00
runner: codex
type: chain-step
---
Review the file pages/PublicMenu/base/*.jsx for bugs in a React restaurant QR-menu app on Base44 platform.
Also check pages/PublicMenu/README.md and pages/PublicMenu/BUGS.md for context (ONLY these 3 files, nothing else).

SPEED RULES — this is a time-sensitive pipeline step:
- Read ONLY the 3 files above. Do NOT search the repo, do NOT read old findings, do NOT read files outside pages/PublicMenu/.
- Do NOT run rg/grep across the whole repo. Do NOT cross-reference with other pages.
- Limit analysis to the target page code. Be concise.

Find ALL bugs. Focus on: logic errors, missing error handling, i18n issues, UI/UX for mobile-first, React anti-patterns.

For each finding: [P0/P1/P2/P3] Title - Description. FIX: code change needed.

Write findings to: pipeline/chain-state/publicmenu-260321-093745-codex-findings.md

FORMAT:
# Codex Writer Findings — PublicMenu
Chain: publicmenu-260321-093745

## Findings
1. [P0] Title — Description. FIX: ...
2. [P1] Title — Description. FIX: ...

## Summary
Total: N findings (X P0, Y P1, Z P2, W P3)

Do NOT apply fixes — only document findings.

=== TASK CONTEXT ===
# UX Batch 2+3: Drawer Restructure + StickyCartBar + Visit States

Reference: `ux-concepts/public-menu.md` v4.1 (sections D, E), `STYLE_GUIDE.md` v3.2, `BUGS_MASTER.md`.

## Context

This task implements Phase 2 structural improvements for PublicMenu (x.jsx).
Two closely related areas: cart drawer layout and sticky bottom bar visibility logic.

---

## Part 1 — Drawer Restructure (Batch 2)

### Problem

Currently the cart drawer does not distinguish between sent orders and the current draft visually or structurally. The layout is the same regardless of visit state (before first send / after send with new draft / after send no draft).

### Expected Behavior

Implement 3 drawer layouts based on visit + draft state (see `public-menu.md` §E):

**Layout 1 — Before first send (V1+D1 / V2+D1):**
- Top: НОВЫЙ ЗАКАЗ section (draft items with stepper/remove, editable)
- Bottom sticky: draft total + primary CTA "Отправить официанту"
- [If table unknown — V2]: show table confirmation hint inside drawer before CTA

**Layout 2 — After first send + new draft (V4+D1):**
- Top: НОВЫЙ ЗАКАЗ (draft, editable, bright style, steppers visible)
- Middle: МОИ ЗАКАЗЫ (collapsible, sent orders read-only, calm style, status chips)
- Middle: СЧЁТ (collapsible, bill summary)
- Bottom sticky: draft total (line 1) + unpaid total secondary (line 2) + CTA "Отправить новый заказ"

**Layout 3 — After first send, no draft (V3+D0):**
- Top: МОИ ЗАКАЗЫ (expanded, read-only)
- Middle: СЧЁТ
- Bottom sticky: open tab total + CTA "Заказать ещё" + secondary "Открыть счёт"

### Visual separation — sent vs draft

| Zone | Style |
|------|-------|
| Sent orders | No stepper, no remove button, status chip, calm background, slightly less contrast text (but still readable) |
| Draft | Steppers visible, remove visible, section title brighter, CTA active |

**Anti-pattern:** Do NOT use opacity 50% or heavy blur on sent orders — must remain readable.

### CTA Logic per state (from `public-menu.md` §E CTA Logic table)

| State | Primary CTA | Secondary CTA |
|-------|-------------|---------------|
| V1+D0 | — | Вернуться в меню |
| V1+D1 | Отправить официанту | Продолжить выбор |
| V2+D1 | Отправить официанту (→ intercept table confirmation) | Продолжить выбор |
| V3+D0 | Заказать ещё | Открыть счёт |
| V4+D1 | Отправить новый заказ | Мои заказы |
| V5+D2 | Отправляем... (disabled) | — |
| V6+D3 | Повторить отправку | Продолжить выбор |
| V7+D0 | — | Вернуться в меню |

### Totals Logic

1. **Draft total** = sum(draftItems.price × qty + modifiers). Does NOT include sent. Does NOT subtract savings before submit.
2. **Sent unpaid total** = sum of Visit.orders where status != paid. Secondary line.
3. **Estimated savings** = loyalty preview, label "Ожидаемая выгода". Does NOT change draft total.
4. **Bill total** = Visit.total. "Только мои" / "Общий". Do NOT show before open tab.

---

## Part 2 — StickyCartBar + Visit States (Batch 3)

### Problem

StickyCartBar does not implement the 7-state visibility matrix — it either shows or doesn't based on cart count, without considering visit state. Text modes are not implemented (visit mode vs draft mode).

### Expected Behavior

Single bottom panel, 56px height, two text modes (from `public-menu.md` §D):

| Mode | Panel text |
|------|------------|
| Has draft | `2 блюда · Новый заказ · 3400₸` |
| No draft, has sent orders | `Мой заказ · 2 отправлено · Не оплачено 5600₸` |

**7-state visibility matrix:**

| Visit state | Draft state | StickyCartBar | Text |
|-------------|-------------|---------------|------|
| No visit | Empty | Hidden or ghost | — |
| No visit | Has items | Active | draft mode |
| Open, unpaid | Empty | Active (visit mode) | visit mode |
| Open, unpaid | Has items | Active (draft mode) | draft mode |
| Fully paid | Empty | Fade out 5s | — |
| Tab closed by waiter | Empty | Hidden (3s) | — |
| Tab closed by waiter | Has items | Hidden + confirm reset | — |

**Animations:**
- On `+`: subtle count bump animation in StickyCartBar + toast "Добавлено"
- On first item added: bar rises/activates with soft animation
- No complex "flying item" animations

---

## Part 3 — PM-S152-01: Complete Terracotta palette (open bug, P2)

### Problem

After Batch 1 deploy, terracotta was applied only to primary CTA buttons (drawer "Отправить официанту", confirmation "Вернуться в меню"). The following elements still use `bg-indigo-xxx`:
- Tab "В зале" (active state)
- Category pills/chips ("Все", "Блюдо дня", etc.)
- "+" buttons on dish cards

CSS variables `--color-primary` are empty (not defined). Verified via `getComputedStyle` in S152.

### Expected Behavior

All interactive elements that use primary color → terracotta `#B5543A` (consistent with STYLE_GUIDE.md v3.2 Batch 1 palette). No indigo remaining in UI.

---

## Implementation Notes

- Files to modify: `x.jsx` (main), possibly `CartView.jsx` (if drawer logic is there)
- Read `BUGS_MASTER.md` for current open PublicMenu bugs — do not regress any Fixed items
- Read `STYLE_GUIDE.md` for exact color values and component specs
- After all changes: `git add pages/PublicMenu/base/x.jsx pages/PublicMenu/base/CartView.jsx && git commit -m "feat: batch 2+3 drawer restructure + StickyCartBar visit states + terracotta complete" && git push`
=== END ===
