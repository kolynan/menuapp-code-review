---
pipeline: v7
type: code-review
page: TestPage
budget: $1
topic: smoke-par-e
---
SMOKE TEST E. Read pages/TestPage/README.md, append "<!-- smoke-e-tp -->", git add pages/TestPage/README.md && git commit -m "test: smoke-par-e TestPage" && git push || (git pull --rebase && git push)
