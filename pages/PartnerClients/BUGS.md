# PartnerClients — Bug Tracker

**Last updated:** 2026-03-06

---

## Fixed (in RELEASE 260306-01)

| ID | Priority | Description | Commit |
|----|----------|-------------|--------|
| BUG-PC-S87-01 | P2 | `loyalty.transaction.earn_order` raw i18n key visible in transaction history — added translateDescription() with fallback mapping | `07f7f25` |

## Fixed (in RELEASE 260224-00)

| ID | Priority | Description | Commit |
|----|----------|-------------|--------|
| BUG-PC-001 | P1 | Mail icon opens Sheet+Dialog simultaneously — dual-modal + null crash on send | `ce948f7` |
| BUG-PC-002 | P1 | formatDate hardcodes Russian locale `{ locale: ru }` — wrong date language | `ce948f7` |
| BUG-PC-003 | P1 | queryFn accesses selectedAccount.id without optional chaining — crash on stale revalidation | `ce948f7` |
| BUG-PC-004 | P1 | messageForm not reset on dialog cancel/dismiss — stale text sent to wrong client | `982386f` |
| BUG-PC-005 | P1 | getClientNumber crashes if account.id is numeric — TypeError on `.slice()` | `982386f` |

---

## Fixed (in RELEASE 260306-03)

| ID | Priority | Description | Commit |
|----|----------|-------------|--------|
| BUG-PC-S89-01 | P2 | "1 Баллы" — wrong Russian declension in client detail balance. v1 (260306-02) added pluralPoints() with t() but bug persisted (B44 translations may have all forms set to "Баллы"). v2 uses hardcoded Russian directly — guaranteed correct. | `336dea5` |

## Fixed (in RELEASE 260306-02)

| ID | Priority | Description | Commit |
|----|----------|-------------|--------|
| BUG-PC-S89-01-v1 | P2 | First attempt at pluralPoints() with t()-based translation. Deployed but didn't work — t() returned wrong translations. | `a2acbd4` |

## Active

| ID | Priority | Description | Line(s) | Notes |
|----|----------|-------------|---------|-------|
| BUG-PC-006 | P2 | getClientNumber O(n²) — sorts all accounts per card render | 18-24 | Pre-compute clientNumberMap in useMemo |
| BUG-PC-007 | P2 | Client numbers are index-based, unstable across data changes | 18-24 | Add stable tie-break by id |
| BUG-PC-008 | P2 | Search only filters by client number, not phone/name | 81-89 | Extend filter if fields available |
| BUG-PC-009 | P3 | Mail icon button 32x32 — below 44px touch target minimum | 178 | Change to h-11 w-11 |
| BUG-PC-010 | P3 | Mail icon button missing aria-label | 178 | |
| BUG-PC-011 | P3 | Sheet missing SheetDescription for accessibility | 205-209 | |
