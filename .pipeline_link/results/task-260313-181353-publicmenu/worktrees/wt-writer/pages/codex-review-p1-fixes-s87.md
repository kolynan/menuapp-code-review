# Codex Review: P1 Bug Fixes from S87

**Task:** codex-review-p1-fixes-s87
**Date:** 2026-03-06
**Reviewers:** CC (correctness-reviewer subagent) + Codex (delayed, completed after ~5min)
**Commits reviewed:** c534bf0..ece5c64 (7 fixes across 6 files)

---

## Verdict: ALL 7 FIXES CORRECT — No regressions introduced

---

## Fix-by-Fix Review

### FIX 1: BUG-PM-S87-01 — Case-insensitive `:::ARCHIVED:::` (x.jsx)
**Status: APPROVED**
- Changed `IS_ARCHIVED_TAG` constant + `.includes()` to `.toLowerCase().includes(":::archived:::")`
- Changed `desc.replace(IS_ARCHIVED_TAG, "")` to `desc.replace(/:::archived:::/gi, "")`
- Correctly handles mixed-case markers in old data
- Also applies `getCleanDescription()` to translated descriptions — good catch

### FIX 2: BUG-PM-S87-02 — `tr()` fallbacks in PublicMenu (x.jsx)
**Status: APPROVED**
- `tr(key, fallback)` correctly detects when `t()` returns the raw key
- Applied to all `confirmation.*` and `cart.*` i18n keys with Russian fallbacks
- Dual definition (inside OrderConfirmationScreen and inside X()) is intentional — different scopes

**Note (P2, latent):** At lines 1455 and 1463, `forEach(tr =>` parameter name shadows the outer `tr()` helper. No crash today since the callback only accesses `tr.category`, `tr.name` etc. Would only crash if someone adds a `tr("key", "fallback")` call inside those callbacks in the future.

### FIX 3: BUG-MD-S87-01 — `getCleanDescription()` in MenuDishes (menudishes.jsx)
**Status: APPROVED**
- Restored `getCleanDescription()` with `/:::archived:::/gi` regex
- Applied to both card display (line 2353) and edit form loading (line 1210)
- Correct order: `getCleanDescription(normStr(dish?.description))` — normalize first, then strip
- Saved data won't re-write the marker since `dishForm.description` is already cleaned on load

### FIX 4: BUG-PR-S83-04 — `tr()` fallbacks in Profile (profile.jsx)
**Status: APPROVED**
- Same `tr()` pattern as PublicMenu — consistent
- Applied to all 13 i18n key usages in Profile
- Fallbacks match the i18n_pending.csv values

**Note (P2, pre-existing):** `useEffect` at line 80 has `[t]` dependency — this was already there BEFORE the fix (confirmed via `git show c534bf0`). If `t` changes identity between renders, it could cause repeated `auth.me()` API calls. NOT a regression.

### FIX 5: BUG-SO-S61-07 — `withTablePrefix()` in StaffOrdersMobile (staffordersmobile.jsx)
**Status: APPROVED**
- `withTablePrefix(name)` correctly guards against null (`"Стол …"` fallback) and double prefix (`startsWith("Стол ")`)
- Applied consistently to all 5 table name display sites
- Handles `String(name)` conversion for non-string inputs

### FIX 6: BUG-PC-S87-01 — `translateDescription()` in PartnerClients (partnerclients.jsx)
**Status: APPROVED**
- `TRANSACTION_FALLBACKS` map covers all 5 known transaction types
- Logic: tries `t()` first, falls back to Russian if translation missing
- Returns `"—"` for null/undefined descriptions

**Note (P3):** No type guard for non-string `desc` — if `tx.description` were an object, it would render `[object Object]`. Extremely unlikely with Base44 data.

### FIX 7: BUG-PL-S83-02 — `pluralPoints()` in PartnerLoyalty (partnerloyalty.jsx)
**Status: APPROVED**
- Standard Russian plural rules: 11-14 → "many", ones=1 → "one", ones=2-4 → "few", else → "many"
- `Math.abs(n)` handles negative values correctly
- Applied to all 3 stats displays (totalEarned, totalSpent, totalExpired)
- `stats?.totalEarned || 0` → `pluralPoints(0, t)` → "many" ("0 баллов") — correct

---

## Pre-existing Concerns (NOT regressions, noted for future)

| # | File | Issue | Priority | Note |
|---|------|-------|----------|------|
| 1 | x.jsx:1455,1463 | `forEach(tr =>` shadows outer `tr()` helper | P2 | Latent — no crash today |
| 2 | x.jsx:121 | `isDishArchived` checks description only, not `is_archived` field | P2 | Architectural gap with menudishes.jsx |
| 3 | profile.jsx:80 | `useEffect([t])` may re-fire if `t` changes identity | P2 | Pre-existing, not from this fix |
| 4 | menudishes.jsx:2353 | `getCleanDescription()` called twice per card render | P3 | Micro-optimization |

---

## Codex Results (delayed ~5min, completed)

Codex reviewed all 7 fixes independently:

| # | Bug | Codex Verdict | CC Verdict | Notes |
|---|-----|--------------|------------|-------|
| 1 | BUG-PM-S87-01 | APPROVE | APPROVE | Both agree |
| 2 | BUG-PM-S87-02 | APPROVE | APPROVE | Both agree |
| 3 | BUG-MD-S87-01 | IMPROVE | APPROVE | Codex suggests computing once + `String(desc ?? "")` coercion — P3 optimization |
| 4 | BUG-PR-S83-04 | APPROVE | APPROVE | Both agree |
| 5 | BUG-SO-S61-07 | IMPROVE | APPROVE | Codex suggests case-insensitive regex for prefix — P3 edge case |
| 6 | BUG-PC-S87-01 | IMPROVE | APPROVE | Codex suggests `String(desc ?? "").trim()` + `t` type guard — P3 hardening |
| 7 | BUG-PL-S83-02 | APPROVE | APPROVE | Both agree |

**Consensus:** 0 REJECT. All fixes are correct. Codex's 3 "IMPROVE" suggestions are minor optimizations (P3), not correctness issues.

## Summary
- **Fixes reviewed:** 7/7
- **Fixes approved:** 7/7 (CC: 7 APPROVE, Codex: 4 APPROVE + 3 IMPROVE)
- **Regressions found:** 0
- **Pre-existing notes:** 4 (none blocking)
- **Codex participation:** Completed (delayed ~5min)
