---
pipeline: v7
type: code-review
page: Profile
budget: $1
topic: smoke-par-f
---
SMOKE TEST F (final). Read pages/Profile/README.md, append "<!-- smoke-f-pr -->", git add pages/Profile/README.md && git commit -m "test: smoke-par-f Profile" && git push || (git pull --rebase && git push)
