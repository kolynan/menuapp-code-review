---
task_id: pssk-som-b1-cc-v1
page: StaffOrdersMobile
code_file: pages/StaffOrdersMobile/260414-02 StaffOrdersMobile RELEASE.jsx
budget: 5
agent: cc
model: claude-sonnet-4-5
ws: WS-SOM
created: 2026-04-15
session: 281
scope_summary: "SOM Батч Б1 — независимый CC-анализ (simple task на старом ВЧР). Параллельно с pssk-som-b1-codex-v1."
---

# START PROMPT — SOM Батч Б1 (CC-only analysis)

**Role:** You are Claude Code. Analyze the SOM code independently and produce findings. DO NOT launch Codex. DO NOT modify code. This is a **review/analysis task only**.

**Output file:** write your findings to `pipeline/cc-analysis-pssk-som-b1-cc-v1.txt` in the work directory. Use Markdown. Aim for 500–1500 lines (concise, grep-backed, with line numbers).

---

## Context

**Workstream:** WS-SOM (Staff Orders Mobile — waiter interface for processing orders).

**Batch Б1 scope** (from `outputs/HO_SOM_Batch_Plan_S277.md`):

1. **SOM-BUG-S270-02** (P1) — "Close table" action does NOT move the table to the «Завершённые» (Completed) tab. Root hypothesis: `closeSession()` in `components/sessionHelpers.js` updates `TableSession.status = "closed"` + bulk-closes Orders, but it does NOT touch `Table.status` (the new field added to `Table` entity in S271 per `B44_Entity_Schemas.md v3.0`). The Completed tab likely filters by `Table.status`.

2. **SOM-BUG-S270-01 re-check** (P0) — Rate limit 429 on single mutations. The `__batch` flag pattern is applied to batch mutations (see grep hits around 1917, 1959, 1990, 3550, 3551), but single mutations (handleAccept/handleReady/handleServe) may not set `__batch`, causing per-click `invalidateQueries` storms → 429 from B44.

**Reference files:**
- `menuapp-code-review/pages/StaffOrdersMobile/260414-02 StaffOrdersMobile RELEASE.jsx` — main waiter component (~4500 lines)
- `menuapp-code-review/components/sessionHelpers.js` — `closeSession` lives here (lines 155–171)
- `BUGS_MASTER.md` — SOM-BUG-S270-01, SOM-BUG-S270-02 entries
- `ux-concepts/StaffOrdersMobile/SOM_Progress_S274.md` — batch plan overview
- `B44_Entity_Schemas.md v3.0` — Table/TableSession/Order entity fields (authoritative)

---

## Your deliverable (findings)

### Section 1 — SOM-BUG-S270-02 (close table → Completed)

1. **Confirm with grep + read:** does `closeSession()` in `components/sessionHelpers.js` currently touch `Table.status`? Quote the function verbatim with line numbers.
2. **Grep where the «Завершённые» (Completed) tab filters tables/orders** in the RELEASE file. Look for: `status === "closed"`, `status === "completed"`, `Table.filter`, `completedTables`, `archivedTables`, tab switcher logic. Return every match with line number + 2 lines of context.
3. **Determine the minimal fix:**
   - Option A: add `Table.update(tableId, { status: 'closed' })` inside `closeSession()` — but `closeSession` receives `sessionId`, not `tableId`. Need to resolve tableId first (e.g., from `TableSession.filter({ id: sessionId })` or pass `tableId` as a new parameter).
   - Option B: update Table.status at the call-site in the RELEASE file (line 4148) where `closeSession(sessionId)` is called — we already have tableId in scope there.
   - Recommend which option is safer and why.
4. **Regression risks:** name 3 things that could break (e.g. other callers of `closeSession`, stale queries, UI relying on old Table.status semantics).
5. **Test plan:** 3 steps a waiter would take to verify the fix manually.

### Section 2 — SOM-BUG-S270-01 re-check (rate limit diagnostic)

1. **Grep in RELEASE file** (`260414-02 StaffOrdersMobile RELEASE.jsx`) for all handlers that call B44 mutations without `__batch` flag. Check every mutation wrapper (`advanceMutation.mutateAsync`, `updateRequestMutation.mutateAsync`, any `base44.entities.*.update` direct). Return every single-mutation call with line number.
2. **List concrete handlers that DO NOT set `__batch`** (these are the 429 culprits). For each: line number, handler name, 1-line description.
3. **Check `onSuccess` of each mutation:** does it call `queryClient.invalidateQueries` unconditionally? If yes, every single-click → full refetch → rate limit.
4. **Propose a minimal fix pattern** (pseudo-code, 5–10 lines) — e.g., debounced invalidate, `__batch` flag always set, throttle at the handler level. Pick the safest approach.
5. **Do NOT design the fix** — just diagnose and recommend.

### Section 3 — Prompt Clarity rating

Rate 1–5 how clearly this Б1 scope was communicated. If <5, list specific ambiguities.

### Section 4 — Risks I see that are NOT in the scope

Anything you noticed while grepping that looks broken or risky for Б1 but wasn't asked. Max 5 items. 1-line each.

---

## ⛔ SCOPE LOCK

- DO NOT modify any code files.
- DO NOT launch Codex, subagents, or other tools beyond Read/Grep/Bash for inspection.
- DO NOT design the КС prompt — that's the next step after both ПССК files are synthesized.
- Output file: `pipeline/cc-analysis-pssk-som-b1-cc-v1.txt` (and nothing else).

Begin analysis.
