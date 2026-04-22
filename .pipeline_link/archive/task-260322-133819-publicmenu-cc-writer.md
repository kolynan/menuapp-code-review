---
task_id: task-260322-133819-publicmenu-cc-writer
status: running
started: 2026-03-22T13:38:20+05:00
type: chain-step
page: PublicMenu
work_dir: C:/Dev/menuapp-code-review
budget_usd: 8.00
fallback_model: sonnet
version: 5.10
launcher: python-popen
---

# Task: task-260322-133819-publicmenu-cc-writer

## Config
- Budget: $8.00
- Mode: task-watcher.py launches Claude Code directly via Popen
- Fallback model: sonnet

## Prompt
---
chain: publicmenu-260322-133813
chain_step: 1
chain_total: 4
chain_step_name: cc-writer
chain_group: writers
chain_group_size: 2
page: PublicMenu
budget: 8.00
runner: cc
type: chain-step
---
=== CHAIN STEP: CC Writer (1/4) ===
Chain: publicmenu-260322-133813
Page: PublicMenu

You are the CC Writer in a modular consensus pipeline.
Your job: independently analyze the code and find ALL bugs.

INSTRUCTIONS:
1. Read the code file for PublicMenu in pages/PublicMenu/*.jsx
2. Also read README.md and BUGS.md in the same folder for context
3. Do your OWN independent analysis — find ALL bugs and issues
4. Focus on: logic errors, missing error handling, i18n issues, UI/UX for mobile-first, React anti-patterns
5. For each finding: [P0/P1/P2/P3] Title - Description. FIX: description of code change needed.
6. Write your findings to: pipeline/chain-state/publicmenu-260322-133813-cc-findings.md
7. Do NOT apply any fixes yet — only document findings

FORMAT for findings file:
# CC Writer Findings — PublicMenu
Chain: publicmenu-260322-133813

## Findings
1. [P0] Title — Description. FIX: ...
2. [P1] Title — Description. FIX: ...
...

## Summary
Total: N findings (X P0, Y P1, Z P2, W P3)

## Prompt Clarity
Rate the task description quality (1-5). For any score below 4, explain what was unclear:
- Overall clarity: [1-5]
- Ambiguous Fix descriptions (list Fix # and what was unclear): ...
- Missing context (what info would have helped): ...
- Scope questions (anything you weren't sure if it's in scope): ...

=== TASK CONTEXT ===
# UX Fix: Replace ✕ with chevron ˅ in all bottom sheets (#87 KS-2)

Reference: `ux-concepts/UX_LOCKED_PublicMenu.md`, `BUGS_MASTER.md`.
Production page.

**Context:** All bottom sheets in PublicMenu currently use ✕ (cross/X) as close button. UX decision: replace with chevron ˅ (downward) for softer emotional tone — ✕ feels like "cancel/reject", ˅ feels like "minimize/collapse". This is standard mobile UX for swipeable bottom sheets (Google Maps, Uber, banking apps).

TARGET FILES (modify): x.jsx, CartView.jsx
CONTEXT FILES (read-only): README.md, BUGS.md

---

## Fix 1 — #87c (P2) [MUST-FIX]: Replace ✕ with ˅ chevron in all bottom sheets

### Сейчас (текущее поведение)
All bottom sheets (cart drawer, table code verification, any other BS) have a ✕ (X/cross) button to close/minimize. The ✕ feels dismissive and negative.

### Должно быть (ожидаемое поведение)
Replace ✕ with a downward chevron icon (˅ / ChevronDown) in the **top-right corner** of every bottom sheet:

1. **Icon:** Use `ChevronDown` from lucide-react (or equivalent SVG). Size: w-6 h-6.
2. **Position:** Top-right corner of the BS header area.
3. **Tap zone:** Minimum 44×44px (w-11 h-11 wrapper with flex items-center justify-center).
4. **Behavior:** Identical to current ✕ — collapses/closes the BS. No state is lost (cart items preserved).
5. **Drag handle:** Keep the existing drag handle bar at the top of BS. The chevron is an additional affordance, not a replacement.
6. **Sticky behavior:** For the cart drawer (long content, scrollable): the header row with 🔔 notification + ˅ chevron should be sticky at the top during scroll. For short BS (table code entry): no sticky needed — everything fits on screen.

Apply to ALL bottom sheet instances in x.jsx and CartView.jsx.

### НЕ должно быть (анти-паттерны)
- NO ✕ (X/cross) icons remaining on any bottom sheet
- NO chevron smaller than 44×44px tap zone
- NO removal of drag handle — keep it alongside the chevron
- NO change to close/collapse behavior — only the icon changes
- NO sticky header on short BS (table code entry)

### Файл и локация
Files: `pages/PublicMenu/x.jsx` and `pages/PublicMenu/CartView.jsx`
Look for: all `<button>` or clickable elements with ✕ / X / close icon inside bottom sheet / drawer components. These may use lucide-react `X` icon, or a text "✕", or an SVG.

### Проверка (мини тест-кейс)
1. Open cart drawer → see ˅ chevron in top-right, no ✕
2. Tap ˅ → drawer closes, cart items preserved
3. Open table code BS → see ˅ chevron in top-right, no ✕
4. Scroll cart with 5+ items → header with 🔔 and ˅ stays visible (sticky)
5. All chevrons have comfortable tap zone (44×44px minimum)

---

## ⛔ SCOPE LOCK — менять ТОЛЬКО то, что указано выше
- Изменяй ТОЛЬКО иконки закрытия/сворачивания bottom sheet (✕ → ˅).
- ВСЁ остальное — НЕ ТРОГАТЬ.
- Do NOT change any BS content, layout, or logic.
- Do NOT change the CTA buttons inside BS.
- Do NOT modify the drag handle behavior.
- Do NOT modify MenuView.jsx (already changed by KS-3).
- Locked UX decisions (см. `ux-concepts/UX_LOCKED_PublicMenu.md`) — ЗАПРЕЩЕНО менять.

## Implementation Notes
- TARGET FILES: `x.jsx`, `CartView.jsx`
- CONTEXT FILES: `README.md`, `BUGS.md`
- НЕ ломать: KS-3 changes in MenuView.jsx, PM-063 (stepper), PM-064 (BS trigger), PM-071 (BS z-index)
- If using lucide-react: `import { ChevronDown } from "lucide-react"` — check if lucide-react is already imported
- After all fixes: `git add pages/PublicMenu/x.jsx pages/PublicMenu/CartView.jsx && git commit -m "ux: replace X with chevron in all bottom sheets #87-KS2" && git push`
=== END ===


## Status
Running...
