---
task_type: simple
page: Infra
topic: Smoke test — named watcher v0.1
budget: "10"
---

# Smoke Test: task-watcher-named.py

This is a smoke test for the experimental named watcher instance.

## Task

Write a single line to a file `pipeline/queue-exp/smoke-result.txt` with content:
```
named-watcher-smoke: OK at <current datetime>
```

Use the Write tool to create the file. Then verify it exists with Read.

That's all — this confirms the named watcher can pick up tasks and run CC successfully.
