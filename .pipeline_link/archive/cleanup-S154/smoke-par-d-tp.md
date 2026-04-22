---
pipeline: v7
type: code-review
page: TestPage
budget: $1
topic: smoke-par-d
---
SMOKE TEST D. Read pages/TestPage/README.md, append "<!-- smoke-d-tp -->", git add pages/TestPage/README.md && git commit -m "test: smoke-par-d TestPage" && git push || (git pull --rebase && git push)
