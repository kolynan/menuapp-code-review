---
pipeline: v7
type: code-review
page: TestPage
budget: $3
chain_template: consensus-with-versioning
---
Review the TestPage page code — all files in pages/TestPage/base/.

Focus on:
1. React best practices
2. UX bugs
3. Performance

Update BUGS.md and README.md.

IMPORTANT — git commit at the end:
git add pages/TestPage/base/*.jsx pages/TestPage/BUGS.md pages/TestPage/README.md
git commit -m "fix: TestPage S6 smoke test S152"
git push
