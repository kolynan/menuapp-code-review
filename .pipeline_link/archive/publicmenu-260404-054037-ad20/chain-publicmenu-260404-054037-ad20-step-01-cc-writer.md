---
chain: publicmenu-260404-054037-ad20
chain_step: 1
chain_total: 4
chain_step_name: cc-writer
chain_group: writers
chain_group_size: 2
page: PublicMenu
budget: 10.00
runner: cc
type: chain-step
---
=== CHAIN STEP: CC Writer (1/4) ===
Chain: publicmenu-260404-054037-ad20
Page: PublicMenu

You are the CC Writer in a modular consensus pipeline.
Your job: independently analyze the code and produce findings.

INSTRUCTIONS:
1. Read the file(s) specified in TASK CONTEXT below for PublicMenu
2. Also read README.md and BUGS.md in the same folder for context (read-only, do NOT modify)
3. Do your OWN independent analysis
4. Focus on: logic errors, missing error handling, i18n issues, UI/UX for mobile-first, React anti-patterns
5. For each finding: [P0/P1/P2/P3] Title - Description. FIX: description of code change needed.
6. Write your findings to: pipeline/chain-state/publicmenu-260404-054037-ad20-cc-findings.md
7. Do NOT apply any fixes yet — only document findings

⛔ SCOPE RESTRICTION (MANDATORY):
If the TASK CONTEXT below contains a numbered Fix list (Fix 1, Fix 2, etc.):
- Do NOT report ANY issues outside the numbered Fix list.
- If you see other bugs — IGNORE them completely.
- Your output must contain ONLY findings for Fix 1, Fix 2, etc.
- Extra findings outside the Fix list = task FAILURE.
- BAD example: Task says "Fix 1: button position" → you report touch targets, aria-labels, i18n issues. This is WRONG.
- GOOD example: Task says "Fix 1: button position" → you report ONLY your analysis of Fix 1 (button position). Nothing else.

If there is NO numbered Fix list → find ALL bugs.

FORMAT for findings file:
# CC Writer Findings — PublicMenu
Chain: publicmenu-260404-054037-ad20

## Findings
1. [P0/P1/P2/P3] Title — Description. FIX: ...
2. ...

## Summary
Total: N findings (X P0, Y P1, Z P2, W P3)

⛔ Prompt Clarity (MANDATORY — findings without this section are INCOMPLETE and will be REJECTED):
Rate the task description quality (1-5). For any score below 4, explain what was unclear:
- Overall clarity: [1-5]
- Ambiguous Fix descriptions (list Fix # and what was unclear): ...
- Missing context (what info would have helped): ...
- Scope questions (anything you weren't sure if it's in scope): ...
YOU MUST FILL IN ALL FIELDS ABOVE. Do NOT skip this section.

=== TASK CONTEXT ===
START

Auto-approve all file edits, terminal commands, git operations, and network access without asking. Do not ask for confirmation on any step. Execute autonomously until the task is fully complete. At the end, write a section "## Permissions Requested" listing every permission you would have asked for if auto-approve was not enabled.

Within 5 minutes of starting, begin editing files.

## Goal

Fix EN language mode in PublicMenu (x.jsx). When user selects English, some UI strings remain in Russian because the local I18N_FALLBACKS dictionary has Russian values. Replace all Russian fallback values with English equivalents, and fix 5 hardcoded Russian string edit sites (4 groups: HELP_CHIPS, getHelpReminderWord, and 3× "назад").

## File

`pages/PublicMenu/x.jsx` (5184 lines). Do NOT read the full file.
Inspect only the specific line ranges listed below.

## Fix 1 — Replace I18N_FALLBACKS dictionary (lines 323–569)

Read lines 323–575 to confirm boundaries, then replace the entire block from line 327 (`const I18N_FALLBACKS = {`) through line 569 (`};`) with the following content:

```js
const I18N_FALLBACKS = {
  // Order statuses (OrderStatusBadge)
  "status.new": "New",
  "status.cooking": "Cooking",
  "status.ready": "Ready",
  "status.accepted": "Accepted",
  "status.served": "Served",
  // Order Status Screen
  "order_status.status_new": "Accepted",
  "order_status.status_preparing": "Preparing",
  "order_status.status_ready": "Ready",
  "order_status.status_served": "Completed",
  "order_status.status_cancelled": "Cancelled",
  "order_status.step_received": "Received",
  "order_status.step_preparing": "Preparing",
  "order_status.step_ready": "Ready",
  "order_status.no_token": "Order link is missing",
  "order_status.check_link": "Please check the link and try again",
  "order_status.back_to_menu": "Back to menu",
  "order_status.not_found": "Order not found",
  "order_status.expired": "Order expired",
  "order_status.order_number": "Order",
  "order_status.last_updated": "Updated",
  "order_status.just_now": "just now",
  "order_status.seconds_ago": "{seconds} sec. ago",
  "order_status.your_order": "Your order",
  "order_status.total": "Total",
  "order_status.discount": "Discount",
  "order_status.questions": "Any questions?",
  "order_status.order_cancelled_info": "Order cancelled",
  "order_status.order_complete_info": "Thank you! Your order is complete",
  "order_status.refresh": "Refresh",
  // Mode labels
  "mode.hall": "Dine in",
  "mode.pickup": "Takeaway",
  "mode.delivery": "Delivery",
  "mode.hall.desc": "Order in the restaurant",
  "mode.pickup.desc": "I'll take it to go",
  "mode.delivery.desc": "Delivery to your address",
  // Hall verification
  "hall.verify.title": "So the waiter receives your order right away",
  "hall.verify.subtitle": "Enter the table code or tell it to the waiter",
  "hall.verify.benefit": "After this, orders will go directly to the waiter",
  "hall.verify.online_benefits": "Bonuses and discounts for online orders",
  // Errors
  "error.invalid_link": "Invalid link",
  "error.save_failed": "Save error",
  "error.phone_invalid": "Invalid format",
  "error.phone_short": "Number is too short",
  "error.phone_long": "Number is too long",
  "error.table_required": "Please select a table",
  "error.name_required": "Please enter your name",
  "error.phone_required": "Please enter your phone number",
  "error.address_required": "Please enter your address",
  "error.submit_failed": "Submission error",
  "error.session_expired": "Session expired",
  "error.rate_limit": "Too many requests, please try again later",
  "error.partner_missing": "Restaurant not specified",
  "error.partner_hint": "Add the parameter",
  "error.partner_not_found": "Restaurant not found",
  "error.network_error": "Network error",
  "error.check_connection": "Check your connection",
  // Loyalty
  "loyalty.insufficient_points": "Insufficient points",
  "loyalty.transaction.redeem": "Points redeemed",
  "loyalty.transaction.earn_order": "Points earned for order #{orderNumber}",
  // Cart / checkout
  "cart.checkout": "Checkout",
  "cart.my_bill": "My bill",
  "cart.table_orders": "Table orders",
  "cart.your_orders": "Your orders",
  "cart.view": "Open",
  "cart.empty": "Cart is empty",
  "cart.bill_already_requested": "Bill already requested",
  "cart.bill_requested": "Waiter will bring the bill shortly",
  "cart.title": "Cart",
  "cart.your_order": "Your order",
  "cart.back_to_menu": "Back to menu",
  "cart.total": "Total",
  "cart.expected_savings": "Expected savings",
  "cart.submitting": "Sending...",
  "cta.sending": "Sending...",
  "cta.retry": "Retry",
  "error.send.title": "Failed to send",
  "error.send.subtitle": "Please try again",
  "cart.item_added": "Added",
  "cart.send_to_waiter": "Send to waiter",
  "cart.send_order": "Send order",
  // Checkout form (CheckoutView)
  "checkout.currency_note": "Currency conversion",
  "form.name": "Name",
  "form.required": "*",
  "form.phone": "Phone",
  "form.phone_placeholder": "+7...",
  "form.address": "Delivery address",
  "form.comment": "Comment",
  "form.comment_placeholder": "Special requests",
  "form.table": "Table",
  // Menu (MenuView)
  "menu.add": "Add",
  "menu.remove": "Remove",
  "menu.tile": "Grid",
  "menu.list": "List",
  "menu.no_items": "No items in this category",
  "menu.add_to_cart": "Add to cart",
  "menu.added_to_cart": "Added to cart",
  // Mode tabs
  "mode.coming_soon": "Coming soon",
  // Confirmation screen
  "confirmation.title": "Order sent!",
  "confirmation.your_order": "Your order",
  "confirmation.total": "Total",
  "confirmation.guest_label": "Guest",
  "confirmation.client_name": "Name",
  "confirmation.back_to_menu": "Back to menu",
  "confirmation.my_orders": "My orders",
  "confirmation.track_order": "Track order",
  // Reviews & misc
  "review.thanks": "Thank you for your rating!",
  "review.add_comments": "Add comments",
  "review.points": "points",
  "review.rate_others": "Rate other guests' dishes",
  "guest.name_saved": "Name saved",
  "guest.name_placeholder": "Name",
  "toast.error": "Error",
  "common.loading": "Loading...",
  "common.close": "Close",
  "common.info": "Information",
  "common.of": "of",
  "common.or": "or",
  "common.save": "Save",
  "common.cancel": "Cancel",
  "common.retry": "Retry",
  // CartView — cart details
  "cart.enter_table_code_hint": "Enter table code to send your order",
  "cart.for_all": "For everyone",
  "cart.guest": "Guest",
  "cart.new_order": "New order",
  "cart.no_orders_yet": "No orders yet",
  "cart.only_me": "Just me",
  "cart.order_total": "Order total",
  "cart.split_disabled_hint": "(2+ guests)",
  "cart.split_pick_guests_soon": "Select guests (coming soon)",
  "cart.split_title": "Who is this order for",
  "cart.table_total": "Table bill",
  "cart.tell_code_to_waiter": "Tell this code to the waiter",
  "cart.you": "You",
  "cart.motivation_bonus_short": "Earn bonuses",
  // CartView — table verification
  "cart.verify.attempts": "Attempts",
  "cart.verify.bonus_label": "Online order bonus",
  "cart.verify.discount_label": "Online order discount",
  "cart.verify.enter_code_placeholder": "Enter code",
  "cart.verify.enter_table_code": "Enter table code",
  "cart.verify.helper_text": "Enter code from your table",
  "cart.verify.info_online_point1": "Order goes directly to the waiter",
  "cart.verify.info_online_point2": "Usually faster",
  "cart.verify.info_online_point3": "Discounts and bonuses (if any) are applied automatically",
  "cart.verify.info_online_title": "Online order to waiter",
  "cart.verify.info_table_code_point1": "Code is usually shown on the table",
  "cart.verify.info_table_code_point2": "If not visible — ask your waiter",
  "cart.verify.info_table_code_title": "Table code",
  "cart.verify.locked": "Too many attempts. Try again in",
  "cart.verify.online_order_title": "Online order to waiter",
  "cart.verify.points_discount_label": "Points discount",
  "cart.verify.table_verified": "Table confirmed",
  // CartView — loyalty
  "loyalty.apply": "Apply",
  "loyalty.email_label": "Email for bonuses",
  "loyalty.email_placeholder": "email@example.com",
  "loyalty.email_saved": "Email saved! Bonuses will be added.",
  "loyalty.enter_email_for_bonus": "Enter your email to earn bonuses:",
  "loyalty.enter_email_hint": "Enter your email to earn bonuses",
  "loyalty.get_bonus": "Get bonuses",
  "loyalty.new_customer": "You will get {points} bonus points for your first order",
  "loyalty.your_balance": "Your balance: {points} points",
  "loyalty.max_redeem": "Maximum {max} points ({percent}% of order)",
  "loyalty.instant_discount": "{percent}% discount applied",
  "loyalty.enter_email_for_discount": "Enter email for {percent}% discount",
  "loyalty.online_bonus_label": "Online order bonus",
  "loyalty.points_applied": "Points applied",
  "loyalty.points_short": "points",
  "loyalty.redeem_points": "Redeem points",
  "loyalty.review_reward_hint": "For review",
  "loyalty.review_reward_prefix": "for review",
  "loyalty.thanks_for_rating": "Thank you for your rating!",
  "loyalty.title": "Bonuses",
  // CartView — status
  "status.cancelled": "Cancelled",
  // CartView — misc
  "cart.items_removed_mode_switch": "Removed {count} items not available in this mode",
  // Table confirmation Bottom Sheet
  "cart.confirm_table.title": "Confirm your table",
  "cart.confirm_table.subtitle": "To send the order to the waiter",
  "cart.confirm_table.benefit_loyalty": "Online orders earn you bonuses / discount",
  "cart.confirm_table.benefit_default": "This helps the waiter find your order faster",
  "cart.confirm_table.submit": "Send",
  "cart.confirm_table.dismissed": "Got it",
  // Help Drawer (help.*) — English, do not change these
  "help.call_waiter": "Call a waiter",
  "help.active_requests": "Active requests",
  "help.sent_suffix": "sent",
  "help.undo": "Undo",
  "help.cancel_request": "Not needed",
  "help.modal_title": "Need help?",
  "help.modal_desc": "Choose how we can help",
  "help.my_requests": "My requests",
  "help.active_count": "active",
  "help.bill": "Bring the bill",
  "help.napkins": "Napkins",
  "help.menu": "Paper menu",
  "help.other": "Other",
  "help.other_label": "Other",
  "help.send_more": "Send more",
  "help.all_requests_cta": "All requests ({count})",
  "help.back_to_help": "Back to help",
  "help.show_more": "More",
  "help.show_less": "Less",
  "help.requests": "requests",
  "help.already_sent_short": "Already sent",
  "help.comment_placeholder_other": "E.g.: high chair, cutlery, clear the table",
  "help.submit_arrow": "Send",
  "help.closed_by_guest": "✅ No longer needed",
  "help.sending_now": "Sending…",
  "help.retry": "Retry",
  "help.remind": "Remind",
  "help.retry_in": "In",
  "help.just_sent": "Just sent",
  "help.waiting_prefix": "Waiting",
  "help.minutes_short": "min",
  "help.reminded_just_now": "Just reminded",
  "help.reminded_prefix": "Reminded",
  "help.last_reminder_prefix": "Last",
  "help.reminder_sent": "Reminder sent",
  "help.resolved_call_waiter": "✅ Waiter came · Thank you!",
  "help.resolved_bill": "✅ Bill brought · Thank you!",
  "help.resolved_napkins": "✅ Napkins brought · Thank you!",
  "help.resolved_menu": "✅ Menu brought · Thank you!",
  "help.resolved_other": "✅ Done · Thank you!",
  "help.no_connection": "No connection",
  "help.try_again": "Try again",
  "help.remind_failed": "Failed to send reminder",
  "help.send_failed": "Failed to send",
  "help.restoring_status": "Restoring status…",
  "help.offline_status": "No connection · will retry automatically",
  "help.stale_status": "Data may be outdated · no update",
  "help.seconds_short": "sec",
  "help.updated_label": "Updated",
  "help.ago": "ago",
  "help.reminder": "reminder",
  "help.reminders": "reminders",
  // Help Chips (quick suggestions in help drawer)
  "help.chip.high_chair": "High chair",
  "help.chip.cutlery": "Cutlery",
  "help.chip.sauce": "Sauce",
  "help.chip.clear_table": "Clear the table",
  "help.chip.water": "Water",
};
```

Note: This dictionary adds 15 new keys vs the current version in x.jsx:
- 3 required by Fix 2b/2c: `help.ago`, `help.reminder`, `help.reminders`
- 7 gap-fills (keys already used in code via `t()`/`tr()` but missing from I18N_FALLBACKS):
  `error.network_error`, `error.check_connection`, `common.retry`, `common.cancel`,
  `cart.confirm_table.dismissed`, `cart.verify.helper_text`, `cart.motivation_bonus_short`
- 5 required by Fix 2a: `help.chip.*` (high_chair, cutlery, sauce, clear_table, water)
All additions are intentional. Total after fix: 236 keys (was 221).
The provided dictionary content is approved copy — insert verbatim.

## Fix 2 — Hardcoded Russian strings (4 surgical changes)

Read lines 1713–1716 and 2448–2476 and 2513–2516 only (±3 lines context).

### Fix 2a — HELP_CHIPS (line 1715)

Change:
```js
  const HELP_CHIPS = useMemo(() => ['Детский стул', 'Приборы', 'Соус', 'Убрать со стола', 'Вода'], []);
```
To:
```js
  const HELP_CHIPS = useMemo(() => [
    tr('help.chip.high_chair', 'High chair'),
    tr('help.chip.cutlery', 'Cutlery'),
    tr('help.chip.sauce', 'Sauce'),
    tr('help.chip.clear_table', 'Clear the table'),
    tr('help.chip.water', 'Water'),
  ], [tr]);
```
Note: This uses `tr()` so chips respect the current language. Fallback values (EN) are in I18N_FALLBACKS above. Russian translations require `help.chip.*` keys in the B44 dictionary — if absent, chips fall back to English (better than always-Russian).

### Fix 2b — getHelpReminderWord (lines 2448–2454)

Change:
```js
  const getHelpReminderWord = useCallback((count) => {
    const mod10 = count % 10;
    const mod100 = count % 100;
    if (mod10 === 1 && mod100 !== 11) return 'напоминание';
    if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return 'напоминания';
    return 'напоминаний';
  }, []);
```
To:
```js
  const getHelpReminderWord = useCallback((count) => {
    return count === 1 ? tr('help.reminder', 'reminder') : tr('help.reminders', 'reminders');
  }, [tr]);
```

### Fix 2c — "назад" in template literals (3 occurrences)

**Line 2472** — Change:
```js
      : `${tr('help.reminded_prefix', 'Reminded')} ${minutesAgo} ${tr('help.minutes_short', 'min')} назад`;
```
To:
```js
      : `${tr('help.reminded_prefix', 'Reminded')} ${minutesAgo} ${tr('help.minutes_short', 'min')} ${tr('help.ago', 'ago')}`;
```

**Line 2475** — Change:
```js
    return `${row.reminderCount} ${getHelpReminderWord(row.reminderCount)} · ${tr('help.last_reminder_prefix', 'Last')} ${minutesAgo} ${tr('help.minutes_short', 'min')} назад`;
```
To:
```js
    return `${row.reminderCount} ${getHelpReminderWord(row.reminderCount)} · ${tr('help.last_reminder_prefix', 'Last')} ${minutesAgo} ${tr('help.minutes_short', 'min')} ${tr('help.ago', 'ago')}`;
```

**Line 2515** — Change:
```js
    return `${tr('help.updated_label', 'Updated')} ${seconds} ${tr('help.seconds_short', 'sec')} назад`;
```
To:
```js
    return `${tr('help.updated_label', 'Updated')} ${seconds} ${tr('help.seconds_short', 'sec')} ${tr('help.ago', 'ago')}`;
```

## FROZEN UX (DO NOT CHANGE)

- The `makeSafeT()` function (lines 575–595) — do not touch
- The `tr()` function definition — do not touch
- All JSX component logic — do not touch
- The `help.*` entries in I18N_FALLBACKS are already English in the new content above — preserve them exactly as provided

## Known Issues

KB-095: CC may truncate large files (>3000 lines) in working copy. x.jsx is 5184 lines — risk exists.

**BEFORE COMMIT**: verify line count is in expected range (~5195–5210 after adding ~15 new lines):
```bash
wc -l pages/PublicMenu/x.jsx
```
Expected: ~5184 + 15 new dict entries + ~5 from Fix 2a expansion ≈ 5195–5210.
If count is below 5150 or above 5250 — STOP. Do NOT commit. Restore: `git checkout -- pages/PublicMenu/x.jsx` and report the issue.

## Validation

After all changes:

1. Verify no Cyrillic remains in I18N_FALLBACKS:
```bash
python3 -c "
import re
with open('pages/PublicMenu/x.jsx', 'rb') as f:
    lines = f.read().decode('utf-8', errors='replace').split('\n')
cyrillic = re.compile(r'[\u0400-\u04FF]')
in_fallbacks = False
for i, line in enumerate(lines, 1):
    if 'I18N_FALLBACKS = {' in line: in_fallbacks = True
    if in_fallbacks and line.strip() == '};': in_fallbacks = False; break
    if in_fallbacks and cyrillic.search(line) and not line.strip().startswith('//'):
        print(f'REMAINING CYRILLIC line {i}: {line.strip()}')
print('Scan complete')
"
```

2. Verify no bare "назад" remains after line 1000 (outside comments):
```bash
python3 -c "
with open('pages/PublicMenu/x.jsx', encoding='utf-8') as f:
    for i, line in enumerate(f, 1):
        if i > 1000 and 'назад' in line and not line.strip().startswith('//'):
            print(f'REMAINING назад line {i}: {line.rstrip()}')
print('назад scan complete')
"
```

3. Syntax check:
```bash
node --input-type=module < pages/PublicMenu/x.jsx 2>&1 | head -5 || echo "Note: JSX syntax check via node may not work, check with project build if needed"
```

4. Line count check (expected ~5195–5210):
```bash
wc -l pages/PublicMenu/x.jsx
```

## Execution Order

1. **Fix 1 first** — replace I18N_FALLBACKS dictionary (lines 327–569)
2. **Fix 2a, 2b, 2c in any order** — all targets are above line 1700, no overlap with Fix 1 zone
3. **Validation steps** — run all 4 checks
4. **Git commit** (only if line count passes)

## Git

```bash
git add pages/PublicMenu/x.jsx
git commit -m "fix: replace Russian i18n fallbacks with English, fix hardcoded strings (#235)"
```

## Self-check

Before you start executing, briefly list:
1. Any ambiguities in this prompt
2. Any risks that might cause you to stall
3. Your execution plan (which fix first, which last)

If you see a problem with this prompt, say so and propose a fix before proceeding.

## Post-task review

After completing the task, answer:
1. Rate this prompt 1-10 for clarity and executability
2. What was unclear or caused hesitation?
3. What would you change in this prompt to make it faster to execute?
4. Token efficiency: Where did you spend the most time/tokens? For each inefficiency, suggest a specific prompt change that would fix it.
5. Speed: What specific information, context, or tooling would help you complete this task faster?

## Permissions Requested

END
=== END ===
