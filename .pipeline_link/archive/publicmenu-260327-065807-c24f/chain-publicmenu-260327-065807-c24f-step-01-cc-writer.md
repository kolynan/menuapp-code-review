---
chain: publicmenu-260327-065807-c24f
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
Chain: publicmenu-260327-065807-c24f
Page: PublicMenu

You are the CC Writer in a modular consensus pipeline.
Your job: independently analyze the code and produce findings.

INSTRUCTIONS:
1. Read the file(s) specified in TASK CONTEXT below for PublicMenu
2. Also read README.md and BUGS.md in the same folder for context (read-only, do NOT modify)
3. Do your OWN independent analysis
4. Focus on: logic errors, missing error handling, i18n issues, UI/UX for mobile-first, React anti-patterns
5. For each finding: [P0/P1/P2/P3] Title - Description. FIX: description of code change needed.
6. Write your findings to: pipeline/chain-state/publicmenu-260327-065807-c24f-cc-findings.md
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
Chain: publicmenu-260327-065807-c24f

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
# Small UX Fixes — ModeTabs + CartView (#162 v2)

Reference: `BUGS_MASTER.md` (PM-148, PM-149). UX agreed S182.
Production page: https://menu-app-mvp-49a4f5b2.base44.app

**Context:** Two small guest-facing UX cleanups. Previous attempt (chain 77f1) targeted the wrong file (x.jsx) and was reverted. Root cause found by Cowork: both bugs are in child components, not x.jsx. This task targets the correct files with exact line numbers.

TARGET FILES (modify):
- `pages/PublicMenu/ModeTabs.jsx`
- `pages/PublicMenu/CartView.jsx`

CONTEXT FILES (read-only):
- `BUGS_MASTER.md`

⚠️ DO NOT touch `pages/PublicMenu/x.jsx` — previous failed attempt already reverted from there.

---

## Fix 1 — PM-148 (P3) [MUST-FIX]: Remove table confirmation banner

### File
`pages/PublicMenu/ModeTabs.jsx` — only 84 lines total, easy to scan.

### Сейчас
After confirming table code, a green banner shows on the menu screen:
`✓ Стол 22 подтверждён`

This adds no value — the guest just scanned their own QR code, they already know which table they're at.

### Должно быть
Remove the green banner entirely. The banner block is at **lines 55–65**:
```
{/* Verified badge in menu view */}
{isHallMode && isTableVerified && currentTableId && (
  <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
    <div className="flex items-center justify-center gap-2 text-green-800">
      <CheckCircle2 className="w-5 h-5" />
      <span className="font-medium">
        {t('form.table')} {currentTable?.name || currentTable?.code || ""} {t('x.hall.verified')}
      </span>
    </div>
  </div>
)}
```
Delete this entire block (lines 55–65 including the comment). Nothing else.

### НЕ должно быть
- The green banner must NOT appear after table confirmation
- The amber "invalid table code" warning block (starts at line 67: `{isHallMode && tableCodeParam && !resolvedTable && !verifiedByCode &&`) must remain untouched

### Проверка
1. Scan QR / confirm table code → menu screen opens
2. Green "Стол X подтверждён" banner does NOT appear
3. Menu, categories, mode tabs (В зале / Самовывоз / Доставка) are visible normally

---

## Fix 2 — PM-149 (P3) [MUST-FIX]: Remove guest ID suffix from display

### File
`pages/PublicMenu/CartView.jsx` (~1046 lines).
Search for: `guestDisplay` or `effectiveGuestCode` — around **line 307**.

### Сейчас
Cart header shows: `Вы: Гость 1 #1313 ✏️` or `Вы: Timur #1313 ✏️`

The `#1313` is a system-generated guest code — internal tech detail not meaningful to the guest.

The suffix is explicitly constructed at **lines 307–309**:
```
const guestDisplay = effectiveGuestCode
  ? `${guestBaseName} #${effectiveGuestCode}`
  : guestBaseName;
```

### Должно быть
Change lines 307–309 to simply:
```
const guestDisplay = guestBaseName;
```

The `effectiveGuestCode` variable (line 300) should remain — it is used for backend/data purposes. Only the visual display construction changes. The variable `guestDisplay` is rendered at line 578.

### НЕ должно быть
- `#1313` (or any `#N` suffix) must NOT appear in the cart header
- The guest name save/edit functionality must continue to work
- `effectiveGuestCode` variable must NOT be deleted — only removed from `guestDisplay` construction

### Проверка
1. Open cart (bottom strip) → shows `Вы: Гость 1 ✏️` (no `#1313`)
2. Tap ✏️ → enter "Timur" → save → shows `Вы: Timur ✏️` (no `#1313`)
3. The name saves correctly on next open

---

## ⛔ SCOPE LOCK
- Modify ONLY `pages/PublicMenu/ModeTabs.jsx` (remove lines 55–65) and `pages/PublicMenu/CartView.jsx` (change lines 307–309)
- Do NOT touch `pages/PublicMenu/x.jsx`
- Do NOT touch any other file
- Do NOT change: table code confirmation logic, guest name save/edit logic, `effectiveGuestCode` variable, amber warning block in ModeTabs

## FROZEN UX (DO NOT CHANGE)
- PM-133 ✅: help drawer flow (openHelpDrawer logic) — in x.jsx, not touched
- PM-145 ✅: CartView floating-point total fix — keep all number formatting intact
- PM-139 ✅: guest name saves correctly (setCurrentGuest null guard)

## FROZEN UX grep verification
Before commit, verify these patterns still exist unchanged:
```
grep -n "verifiedByCode" pages/PublicMenu/ModeTabs.jsx
grep -n "effectiveGuestCode" pages/PublicMenu/CartView.jsx
```
Both should return results (variable still present, not deleted).

## MOBILE-FIRST CHECK (MANDATORY before commit)
This is a mobile-first restaurant app. Primary usage: customer phone at the table.
Before committing, verify ALL changes at 375px viewport width:
- [ ] Close/chevron buttons: RIGHT-ALIGNED (not centered), sticky top
- [ ] Touch targets ≥ 44×44px (h-11 w-11)
- [ ] No excessive whitespace/gaps on small screens
- [ ] Bottom sheet content scrollable without losing close/submit button
- [ ] No duplicate visual indicators (e.g. two gray lines that look the same)
- [ ] Text truncation: long item names don't overflow
- [ ] Sticky footer buttons don't overlap content

## Regression Check (MANDATORY after implementation)
- [ ] Table code input still works (Bottom Sheet opens, code accepted)
- [ ] Guest name edit still saves correctly (tap ✏️ → enter name → save)
- [ ] Cart header shows correct name after save
- [ ] Amber "invalid table code" warning still shows for bad QR codes (ModeTabs line 68+)

## Implementation Notes
- TARGET FILES: `pages/PublicMenu/ModeTabs.jsx`, `pages/PublicMenu/CartView.jsx`
- Do NOT use `git add .` — only: `git add pages/PublicMenu/ModeTabs.jsx pages/PublicMenu/CartView.jsx`
- git commit -m "fix(PublicMenu): remove table confirm banner (PM-148) + strip guest ID suffix (PM-149)"
- git push
=== END ===
