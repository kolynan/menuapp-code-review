---
page: CartView
ws: WS-CV
budget: 10
agent: cc+codex
chain_template: consensus
session: 271
created: 2026-04-14
---

# Synthesizer: CartView Persist Final Spec (CV-BUG-01)

## Task

Consolidate CC strategy + Codex review into a single **Final Spec** document. CC writes the merged spec, Codex independently verifies the merge is complete and correct.

**Do NOT** re-do the analysis. Both source documents are APPROVED. Your job is **synthesis + correction**, not re-review.

## Source documents (read ENTIRELY, both files)

1. `ux-concepts/CartView/CV-BUG-01_Persist_Strategy_S271.md` (408 lines) — CC strategy, Variant B chosen, 15 AC
2. `ux-concepts/CartView/CV-BUG-01_Codex_Review_S271.md` (385 lines) — Codex APPROVE WITH CHANGES verdict, 5 required corrections

## Deliverable

Create new file: `ux-concepts/CartView/CV-BUG-01_Final_Spec_S271.md`

Structure:

```
---
version: "1.0"
status: FINAL
session: 271
date: 2026-04-14
supersedes:
  - CV-BUG-01_Persist_Strategy_S271.md (DRAFT)
  - CV-BUG-01_Codex_Review_S271.md (review)
---

# CV-BUG-01 — Persist Strategy Final Spec

## Chosen approach
[Variant B — Lightweight Snapshot. One paragraph summary from CC doc.]

## localStorage schema
[From CC doc Q1. Include full JSON shape with schema version, key format.]

## Restore flow (4-state machine)
[From CC doc Q2, with Codex corrections:]
- State machine diagram
- Fetch strategy with timeout rules:
  - **CHANGED per Codex V1:** 8s UX deadline applies ONLY to session + guests + order headers.
  - **CHANGED per Codex V1:** OrderItem loading is lazy-loaded AFTER S-restored, not inside restore gate.
  - Alternative documented: if items stay in gate, timeout = 10-12s (NOT chosen default).
- Transition rules table
- No debounce/retry before S-failed-network (CC rule kept)

## Invalidation rules
[From CC doc Q3, with Codex correction:]
- 12h TTL (CC choice kept, rationale retained)
- Session "not found" handling: **CHANGED per Codex Additional #2.** B44 uses `.filter()` returning arrays. Treat empty result `[]` as "session gone" → clear persist + S-lost. Do NOT use 404/410 HTTP wording (inaccurate for B44).
- Shared phone edge case (kept from CC doc)
- Schema version migration (kept)
- Table/partner change (kept — PM-152 pattern)

## Kill-during-submit (pendingSubmit)
[From CC doc Q4, with Codex corrections V2:]
- **CHANGED per Codex V2:** pendingSubmit matcher scoped to **current guest's orders only**, NOT all session orders. Multi-guest app → false negatives otherwise. Use persisted `sessionGuestId` to filter.
- **CHANGED per Codex V2:** Clock skew tolerance widened from 5s to **30-60s** (mobile clock jitter > 5s common).
- **DOCUMENTED per Codex V2:** `pendingSubmit` is a **recovery heuristic, NOT idempotency**. No B44-side dedupe exists. Banner copy MUST advise "check your orders before retrying". Duplicate risk is accepted.
- Fingerprint addition (optional, recommended per Codex): sorted item-ids + quantities hash in pendingSubmit for improved matching.
- cartSnapshot {itemCount, totalAmount} — sufficient for banner only (Codex confirmed).
- State transitions: likely-sent / maybe-lost / stale (>5 min).

## Polling vs persist race (V3)
[NEW section from Codex V3:]
- **React-state race:** already mitigated by existing 30s optimistic-merge window in `useTableSession.jsx:580-589` (TTL constant at :10-15). Do NOT re-implement.
- **Persist-state race:** NEW rule — "polling must never downgrade persist state while `pendingSubmit` is active". Submit owns pendingSubmit lifecycle (write before network I/O, clear only on success/fail paths). Polling may update UI state, MUST NOT rewrite persisted `orderIds` or `pendingSubmit`.
- Implementation hint: `isSubmittingRef` gate in useTableSession before any persist write from poll path.

## What already exists (do NOT re-implement)
[NEW section from Codex Additional #3:]
- 8h session TTL in `useTableSession.jsx:10-15, 29-64`
- Guest persistence with legacy fallback keys: `useTableSession.jsx:69-145`
- A-G guest restore fallback chain: `useTableSession.jsx:346-429`
- Polling-only-after-session + dynamic backoff: `useTableSession.jsx:490-685`
- Session creation already uses `status: "open"` (NOT "active"): `components/sessionHelpers.js:62-79`

## Ownership
[NEW section from Codex Additional #4:]
Persist lifecycle lives in `useTableSession` + submit flow, NOT in `CartView.jsx`. CartView currently only touches localStorage for guest-code display (`CartView.jsx:337-355`) — keep it that way.

## Acceptance Criteria (revised)
[From CC doc AC-1..AC-15 with Codex changes applied. 15 items total. Must/Should/Nice grouping retained. Explicitly mark each AC as:]
- AC-X ✅ unchanged
- AC-X 🔄 REVISED per Codex V[N]: [what changed]
- AC-X ⚠️ CAVEAT per Codex: [caveat] (e.g., AC-10 "No B44 schema changes" → only valid if heuristic dedup is accepted; true idempotency needs server-side submit token)

## Explicitly corrected errors from CC draft
- ❌ "active vs open unfixed" — already fixed in S70 (sessionHelpers.js:62-79). Remove from Open Items.
- ❌ "404/410 semantics" — B44 uses .filter() arrays, not HTTP errors. Rephrase as "empty result".

## Open Items (trimmed)
- OrderItems lazy-load specifics (what triggers fetch — expand gesture? on-scroll?) — defer to CV-B3 implementation
- Migration path: old keys → unified key (one-shot on first load with new schema)
- "Новый гость" button for shared device (P3)
```

## Scope lock

- ONLY create the Final Spec file above.
- Do NOT modify `CV-BUG-01_Persist_Strategy_S271.md` or `CV-BUG-01_Codex_Review_S271.md` (historical record).
- Do NOT touch .jsx / .js files. This is doc-only synthesis.
- Do NOT re-review or re-argue decisions. Both source docs are approved for synthesis.

## Codex verification role

After CC writes the Final Spec, Codex independently checks:
1. All 5 Codex corrections (V1 timeout, V2 guest-scoped matcher, V2 clock skew, V3 race, Additional #2 empty-result) are applied and traceable to source line refs.
2. No contradictions between sections (e.g., 8s timeout mentioned somewhere AND 10-12s elsewhere without clear "chosen vs alternative" marking).
3. All 15 AC have correct ✅ / 🔄 / ⚠️ tags.
4. The "already exists" and "ownership" sections match actual code line refs from Codex review.
5. If discrepancy → write finding, CC fixes in same task.

## Git

```
git add "ux-concepts/CartView/CV-BUG-01_Final_Spec_S271.md"
git commit -m "CV-BUG-01 final persist spec (CC+Codex synthesis, S271)"
```

## Validation

- `wc -l ux-concepts/CartView/CV-BUG-01_Final_Spec_S271.md` → expect 300-500 lines
- `grep -c "🔄 REVISED\|⚠️ CAVEAT" ux-concepts/CartView/CV-BUG-01_Final_Spec_S271.md` → expect ≥5 (one per Codex correction)
- `grep "active.*unfixed\|status.*active" ux-concepts/CartView/CV-BUG-01_Final_Spec_S271.md` → expect 0 outside "Explicitly corrected" section
