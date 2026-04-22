---
pipeline: v7
type: code-review
page: Profile
budget: $1
topic: smoke-par-e
---
SMOKE TEST E. Read pages/Profile/README.md, append "<!-- smoke-e-pr -->", git add pages/Profile/README.md && git commit -m "test: smoke-par-e Profile" && git push || (git pull --rebase && git push)
