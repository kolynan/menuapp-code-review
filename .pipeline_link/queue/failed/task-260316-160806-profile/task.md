---
task_id: smoke-test-s134-v2
pipeline: v7
type: code-review
page: Profile
budget: "$10"
agent: cc+codex
---

# Smoke Test S134 v2 — Verify 2-min heartbeat + worker visibility

Review `pages/Profile/base/profile.jsx` for any obvious issues.
Smoke test to verify:
1. Heartbeat updates in TG every 2 min (was 5 min)
2. Per-worker elapsed times visible during heartbeat (CC Writer, Codex Reviewer)
3. ArtifactsDir guard doesn't crash

Keep changes minimal — this is a PIPELINE test, not a deep code review.
