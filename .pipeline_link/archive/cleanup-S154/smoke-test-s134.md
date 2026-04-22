---
task_id: smoke-test-s134
type: code-review
page: Profile
budget: "$10"
agent: cc+codex
---

# Smoke Test S134 — Pipeline UX heartbeat

Review `pages/Profile/base/profile.jsx` for any obvious issues.
This is a smoke test to verify pipeline V7 heartbeat changes work correctly.
Focus: verify TG messages update every 2 min with per-worker status.
