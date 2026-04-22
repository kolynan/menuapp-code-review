---
pipeline: v7
type: code-review
page: Profile
budget: $1
topic: smoke-par-d
---
SMOKE TEST D. Read pages/Profile/README.md, append "<!-- smoke-d-pr -->", git add pages/Profile/README.md && git commit -m "test: smoke-par-d Profile" && git push || (git pull --rebase && git push)
