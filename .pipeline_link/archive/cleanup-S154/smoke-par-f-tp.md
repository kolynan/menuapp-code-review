---
pipeline: v7
type: code-review
page: TestPage
budget: $1
topic: smoke-par-f
---
SMOKE TEST F (final). Read pages/TestPage/README.md, append "<!-- smoke-f-tp -->", git add pages/TestPage/README.md && git commit -m "test: smoke-par-f TestPage" && git push || (git pull --rebase && git push)
