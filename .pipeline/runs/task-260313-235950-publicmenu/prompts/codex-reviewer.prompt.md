You are the independent reviewer in MenuApp pipeline V7.

Task ID: task-260313-235950-publicmenu
Workflow: code-review
Page: PublicMenu
Code file: C:\Dev\menuapp-code-review\pages\PublicMenu\base\CartView.jsx
BUGS.md: C:\Dev\menuapp-code-review\pages\PublicMenu\BUGS.md
README.md: C:\Dev\menuapp-code-review\pages\PublicMenu\README.md
Repository root: C:\Dev\menuapp-code-review

Task instructions:
Auto-approve all file edits, terminal commands, and git operations without asking.
Do not ask for confirmation on any step.
Execute autonomously until the task is fully complete.

## TASK-260303-01: P0 — Guest/Staff Quick UX Fixes (statuses, rating, confirm)

Based on UX review with ChatGPT (S74). Fix UX issues that break guest trust and understanding.

**Files to modify:**
- `pages/PublicMenu/base/CartView.jsx`
- `pages/PublicMenu/base/x.jsx`

### What to do:

#### 1. Order confirmation text
After "Send to waiter" — change confirmation from "Заказ принят" to "Заказ отправлен официанту".
New order status in "My Orders" list: 🟡 "Отправлен (ожидает подтверждения)"

#### 2. Guest order status badges
In "My Orders" section, show colored status badges:
- 🟡 Отправлен (Sent, waiting for waiter)
- 🟢 Принят (Accepted by waiter)
- 🔵 Готовится (Being prepared)
- ✅ Готов (Ready)
Use OrderStage values if available, otherwise fallback to default flow.

#### 3. Remove session ID from header
Remove `#1313` (or any raw session/visit ID) from guest UI header.
Keep guest name like "Гость 2" or displayName. Session ID can stay in console.log for debug.

#### 4. Rating/bonus prompt logic
Show "Rate and earn +10 bonus" prompt ONLY when:
- Item has status ✅ Готов (Ready/Delivered)
- AND item is not yet rated
After rating: show inline "Спасибо! +10Б начислено" near the stars (not a top banner).

#### 5. i18n compliance
- Use existing i18n keys where available
- For new strings: add them via tr() with descriptive keys like `order.status.sent`, `order.rating.thank_you`
- Do NOT hardcode Russian text

### What NOT to do:
- Do NOT change routing, auth, or page layout structure
- Do NOT modify entity models or database fields
- Do NOT redesign the cart drawer layout (that's a separate task)
- Do NOT touch StaffOrdersMobile (separate task)

### Acceptance criteria:
- After sending order, guest sees "Отправлен" not "Принят"
- In "My Orders", statuses are visually distinct (colored badges)
- No raw session/visit ID (#1313) visible in guest UI
- Rating prompt appears only for ✅ Ready items that are unrated
- After rating, inline "Thank you" message appears near stars
- No console errors
- Mobile 320px width — layout doesn't break

### After fixing:
1. Update `pages/PublicMenu/BUGS.md` with fix details for each item
2. Update `pages/PublicMenu/README.md` with UX changelog entry

IMPORTANT — git operations at the end:
```
git add pages/PublicMenu/base/CartView.jsx pages/PublicMenu/base/x.jsx pages/PublicMenu/BUGS.md pages/PublicMenu/README.md
git commit -m "fix: TASK-260303-01 guest UX quick fixes - statuses, rating, session ID S121"
git push
```

Your job:
- Review the target page and nearby context files.
- Report only NEW issues that are NOT already listed in BUGS.md.
- Focus on: missing error handling, i18n, mobile UX, React best practices, accessibility, performance.
- Do not edit files.
- Return JSON that matches the provided schema.