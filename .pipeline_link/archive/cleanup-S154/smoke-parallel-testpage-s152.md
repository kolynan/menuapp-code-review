---
pipeline: v7
type: code-review
page: TestPage
budget: $1
topic: smoke-parallel-v3
---
SMOKE TEST for parallel chains (task-watcher-v3.py). Page: TestPage.

This is a minimal smoke test. Please do the following:
1. Read pages/TestPage/README.md
2. Append one line to it: "<!-- smoke-parallel-v3-testpage -->"
3. Run:
   git add pages/TestPage/README.md
   git commit -m "test: smoke-parallel-v3 TestPage S152"
   git push || (git pull --rebase && git push)

Do not make any other changes. This is a parallel chains smoke test.
