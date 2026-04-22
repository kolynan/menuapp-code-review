---
chain: publicmenu-260323-103001-4112
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
Review the file(s) specified in TASK CONTEXT below for a React restaurant QR-menu app on Base44 platform.
Also check README.md and BUGS.md in the same page folder for context (read-only, do NOT modify).

SPEED RULES — this is a time-sensitive pipeline step:
- Read ONLY the TARGET files + README/BUGS for context. Do NOT search the repo, do NOT read old findings, do NOT read files outside the page folder.
- Do NOT run rg/grep across the whole repo. Do NOT cross-reference with other pages.
- Limit analysis to the target page code. Be concise.

⛔ SCOPE RESTRICTION (MANDATORY):
If the TASK CONTEXT below contains a numbered Fix list (Fix 1, Fix 2, etc.):
- Do NOT report ANY issues outside the numbered Fix list.
- If you see other bugs — IGNORE them completely.
- Your output must contain ONLY findings for Fix 1, Fix 2, etc.
- Extra findings outside the Fix list = task FAILURE.
- BAD example: Task says "Fix 1: button position" → you report touch targets, aria-labels, i18n issues. This is WRONG.
- GOOD example: Task says "Fix 1: button position" → you report ONLY your analysis of Fix 1 (button position). Nothing else.

If there is NO numbered Fix list → find ALL bugs. Focus on: logic errors, missing error handling, i18n issues, UI/UX for mobile-first, React anti-patterns.

For each finding: [P0/P1/P2/P3] Title - Description. FIX: code change needed.

Write findings to: pipeline/chain-state/publicmenu-260323-103001-4112-codex-findings.md

FORMAT:
# Codex Writer Findings — PublicMenu
Chain: publicmenu-260323-103001-4112

## Findings
1. [P0/P1/P2/P3] Title — Description. FIX: ...
2. ...

## Summary
Total: N findings (X P0, Y P1, Z P2, W P3)

## Prompt Clarity (MANDATORY — do NOT skip this section)
Rate the task description quality (1-5). For any score below 4, explain what was unclear:
- Overall clarity: [1-5]
- Ambiguous Fix descriptions (list Fix # and what was unclear): ...
- Missing context (what info would have helped): ...
- Scope questions (anything you weren't sure if it's in scope): ...
YOU MUST FILL IN ALL FIELDS ABOVE. Findings without Prompt Clarity are incomplete.

Do NOT apply fixes — only document findings.

=== TASK CONTEXT ===
# Bugfix: PublicMenu x.jsx logic fixes — error paths, session, cooldown, timer (#70, #74, #73, #69, #75)

Reference: `BUGS_MASTER.md`, `menuapp-code-review/pages/PublicMenu/`.

**Production page** — `https://menu-app-mvp-49a4f5b2.base44.app/x?partner=69540a85f2492cff3e46a283&mode=hall&lang=RU`

**Context:** Five M-weight logic bugs in x.jsx. Two are about error handling (PM-070, PM-074):
currently backend failures and "not found" conditions result in identical UI, making retryable
errors indistinguishable from permanent ones. PM-073 and PM-069 are about table session state.
PM-075 is a React anti-pattern: untracked setTimeout.

TARGET FILES (modify):
- `pages/PublicMenu/x.jsx`

CONTEXT FILES (read-only, do NOT modify):
- `pages/PublicMenu/CartView.jsx`
- `pages/PublicMenu/MenuView.jsx`
- `pages/PublicMenu/useTableSession.jsx`

**NOTE:** x.jsx is ~3500 lines. Each Fix section provides exact line numbers and grep hints.

---

## Fix 1 — PM-070 (P1) [MUST-FIX]: Partner lookup masks backend errors as "not found"

### Сейчас (текущее поведение)
x.jsx partner useQuery (line ~1325) has two try/catch blocks. Both catch blocks return null on failure,
including transient backend errors. The error UI (line ~3046) shows "Ресторан не найден" for ALL
failure cases — including when the backend itself is down or the network fails.
This means a user with a valid QR code but transient network error sees "Restaurant not found"
and cannot retry — a dead end.

### Должно быть (ожидаемое поведение)
Separate two failure paths:
1. **Genuine not-found**: both partner lookups return empty array (`res?.[0]` is null/undefined) → show existing "Ресторан не найден" UI.
2. **Backend/network failure**: a `catch` was triggered on BOTH lookups → show retryable error UI:
   "Не удалось загрузить меню. Проверьте соединение." + retry button (calls `refetch()`).

Add a boolean flag (e.g. `partnerNetworkError`) to the query or via a `useState`:
- If both lookups throw → set flag true → show retry UI.
- If at least one returns null (no throw) → show "not found" UI.

### НЕ должно быть (анти-паттерны)
- Do NOT change partner lookup logic (id-first, slug-fallback) — only error handling.
- Do NOT show technical error messages. Keep user-facing text simple and non-technical.
- Do NOT add console.error calls for production (see PM-076).
- Do NOT remove the existing `shouldRetry` logic.

### Файл и локация
`pages/PublicMenu/x.jsx`
- Lines ~1325–1352: `useQuery` for partner, `queryFn` with two try/catch blocks.
- Line ~3046: `<p className="text-slate-500">{t('error.partner_not_found')}</p>` — error UI.
- Line ~3029: surrounding `if (!partner && !loadingPartner)` block — add `partnerNetworkError` branch here.
Search: `queryKey: ["publicPartner"` to find the query. Search `partner_not_found` to find the error UI.

### Проверка (мини тест-кейс)
1. Backend failure (mock network error): retry button appears, not "not found".
2. Invalid partner ID: "Ресторан не найден" message appears (no retry button).

---

## Fix 2 — PM-074 (P1) [MUST-FIX]: OrderStatusScreen masks backend fetch errors as "not found"

### Сейчас (текущее поведение)
In `OrderStatusScreen` component (~line 895), the query catches order fetch results.
Line ~1033: `if (orderError || !order)` — BOTH backend failure AND "order not found" result in
the same UI: `order_status.not_found` message. User with a valid order token but transient
network error sees "Order not found" and cannot retry.

### Должно быть (ожидаемое поведение)
Separate two paths:
1. `orderError` (query threw an exception / network failure) → show retryable UI:
   "Не удалось загрузить заказ. Проверьте соединение." + retry button (calls `refetchOrder()`).
2. `!order` (query succeeded but returned null — token invalid) → show existing "not found" UI.

The condition `if (orderError || !order)` must be split into two separate `if` blocks.

### НЕ должно быть (анти-паттерны)
- Do NOT change the order polling interval or retry logic.
- Do NOT change the UI for the valid order flow.
- Do NOT merge retry UI with the "expired" order UI (already separate at ~line 1050+).
- Do NOT add console.error.

### Файл и локация
`pages/PublicMenu/x.jsx`
- Line ~900: `OrderStatusScreen` component, `useQuery` with `queryKey: ["orderByToken"`.
- Line ~1033: `if (orderError || !order)` — SPLIT this condition into two separate ifs.
Search: `orderError \|\| !order` to find the exact location.

### Проверка (мини тест-кейс)
1. Valid token + network error: shows retry button, NOT "not found".
2. Invalid/expired token (returns null): shows "not found" UI as before.

---

## Fix 3 — PM-073 (P2) [MUST-FIX]: useTableSession: restored guest loses table binding due to direct .id usage

### Сейчас (текущее поведение)
In x.jsx ~line 2778, when creating a new guest after session restore failure:
`const gid = String(guest?.id ?? guest?._id ?? "");`
This correctly handles `_id` fallback. BUT in the "restore guest" path (~line 2756):
`const gid = normalizeId(guest);`
`normalizeId` (if defined) may not behave identically to `normalizeGuestId` from useTableSession.
useTableSession.jsx uses `normalizeGuestId = (g) => String(g?.id ?? g?._id ?? "")`.

The inconsistency means that a guest object returned with only `_id` (no `id`) might produce
an empty string for `gid` in the restore path, causing `currentGuestIdRef.current = null`,
which loses the table-session binding on page refresh.

### Должно быть (ожидаемое поведение)
Both places that set `currentGuestIdRef.current = gid` (lines ~2758 and ~2778) must use
the same normalization: `String(g?.id ?? g?._id ?? "")`.
If `normalizeId` is a local function doing this correctly, verify it handles `_id` fallback.
If not — replace with explicit `String(guest?.id ?? guest?._id ?? "")`.

### НЕ должно быть (анти-паттерны)
- Do NOT change the overall guest restore or create flow.
- Do NOT modify useTableSession.jsx.
- Do NOT change any other uses of `normalizeId` in x.jsx.

### Файл и локация
`pages/PublicMenu/x.jsx`
- Line ~2756: `const gid = normalizeId(guest);`
- Line ~2778: `const gid = String(guest?.id ?? guest?._id ?? "");`
Both should use `String(g?.id ?? g?._id ?? "")` pattern.
Search: `currentGuestIdRef.current = gid` to find both occurrences. Verify what `normalizeId` does.

### Проверка (мини тест-кейс)
1. Guest object with only `_id` (no `id`): `gid` must be non-empty string equal to `_id`.
2. `currentGuestIdRef.current` is not null after restore when guest has only `_id`.

---

## Fix 4 — PM-069 (P2) [MUST-FIX]: BS table code: no lockout countdown UI after wrong code attempts

### Сейчас (текущее поведение)
The Bottom Sheet for table code verification shows "Неверный код" but:
1. Code input is NOT cleared after wrong entry (user must delete digits manually).
2. No lockout/cooldown countdown: `codeAttempts` and `codeLockedUntil` state is NOT accessible
   in x.jsx scope — it lives inside the BS component or useTableSession hook. After 3+ wrong
   attempts, there may be a lockout but no UI feedback showing "Заблокировано на 30 сек" etc.

### Должно быть (ожидаемое поведение)
**Part A — Clear on wrong code (LMP: banking apps, Telegram):**
After wrong code entry → auto-clear the 4-digit input fields after ~500ms.
This lets the user immediately start retyping without deleting manually.

**Part B — Lockout countdown display:**
If `codeAttempts`, `codeLockedUntil`, or similar state already exists in the BS logic:
Surface it to show user-visible message: "Попробуйте через 30 сек" (countdown).
If state is not yet accessible from the BS render location in x.jsx, add a `codeLockedUntil` state
in x.jsx scope and pass down to the BS component.

NOTE: If Part B is too complex in scope (requires significant state refactor) — implement Part A
only and note Part B as SKIPPED with explanation.

### НЕ должно быть (анти-паттерны)
- Do NOT change the 4-cell visual layout (keep the 4 separate digit cells).
- Do NOT change the "Неверный код" text itself.
- Do NOT add animations that block the user from immediately retyping after clear.

### Файл и локация
`pages/PublicMenu/x.jsx`
- The BS for table code is around line ~3395–3470 (search `Введите код стола` or `showTableCodeSheet`).
- Look for where wrong code is detected and "Неверный код" is displayed.
- `codeAttempts` / `codeLockedUntil` — search these names to find where they live.

### Проверка (мини тест-кейс)
1. Enter wrong code → 4 cells clear automatically after ~500ms.
2. Enter wrong code 3+ times → lockout message appears with countdown (if Part B implemented).

---

## Fix 5 — PM-075 (P2) [MUST-FIX]: Auto-submit setTimeout without cleanup causes stale submit

### Сейчас (текущее поведение)
x.jsx line ~2101: `setTimeout(() => handleSubmitOrder(), 100);` inside a `useEffect`.
The timeout ID is NOT stored in a ref and NOT cleaned up on unmount. If the component re-renders
or unmounts between the 100ms delay and execution, `handleSubmitOrder` fires on stale state —
a React anti-pattern that can cause double-submit or errors.

### Должно быть (ожидаемое поведение)
1. Store the timeout ID in a ref: `const autoSubmitTimerRef = useRef(null);`
2. Before setting new timeout: `if (autoSubmitTimerRef.current) clearTimeout(autoSubmitTimerRef.current);`
3. Store the ID: `autoSubmitTimerRef.current = setTimeout(() => handleSubmitOrder(), 100);`
4. Add cleanup in the useEffect return: `return () => clearTimeout(autoSubmitTimerRef.current);`

### НЕ должно быть (анти-паттерны)
- Do NOT change the 100ms delay value.
- Do NOT change when the auto-submit triggers (condition: `pendingSubmitRef.current && isTableVerified && currentTableId`).
- Do NOT change `handleSubmitOrder` function.

### Файл и локация
`pages/PublicMenu/x.jsx`
- Lines ~2097–2104: `useEffect` with `pendingSubmitRef.current` check and `setTimeout`.
Search: `pendingSubmitRef.current && isTableVerified` to find exact location.

### Проверка (мини тест-кейс)
1. `autoSubmitTimerRef` exists as a ref.
2. The useEffect returns a cleanup function that calls `clearTimeout`.
3. No double-submit on rapid re-renders.

---

## ⛔ SCOPE LOCK — менять ТОЛЬКО то, что указано выше
- Modify ONLY: `pages/PublicMenu/x.jsx`
- Do NOT touch: CartView.jsx, MenuView.jsx, CheckoutView.jsx, useTableSession.jsx
- Do NOT fix bugs outside the 5 Fix sections above — even if you spot them.
- Do NOT change routing, authentication, or any partner/order data fetching beyond what's described.
- Extra findings = task FAILURE.

## Implementation Notes
- File: `pages/PublicMenu/x.jsx` (~3500 lines)
- НЕ ломать: table verification flow, cart submit, order status polling, guest session
- Fix order: 5 → 1 → 2 → 3 → 4 (simplest first: PM-075 timer, PM-070/074 error paths, PM-073/069 state)
- git add pages/PublicMenu/x.jsx && git commit -m "fix: partner/order error paths, guest id normalization, BS cooldown, timer cleanup" && git push

## MOBILE-FIRST CHECK (MANDATORY before commit)
- [ ] BS table code: wrong code clears input → works on mobile viewport
- [ ] Retry buttons: min-h-[44px] touch target
- [ ] No new console.error calls added
- [ ] Error messages legible at 375px width
=== END ===
