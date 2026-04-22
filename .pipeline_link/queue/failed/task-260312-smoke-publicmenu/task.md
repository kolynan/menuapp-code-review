---
pipeline: v7
type: code-review
page: PublicMenu
budget: $10
---
Review the PublicMenu page code (all files in pages/PublicMenu/base/).

Focus on:
1. React best practices — hooks usage, missing deps in useEffect, stale closures
2. UX bugs — broken navigation, missing error states, incorrect translations
3. Performance — unnecessary re-renders, missing memoization
4. Base44 platform patterns — correct entity usage, proper SDK calls

Update BUGS.md with any new findings. Update README.md with changes summary.

ОБЯЗАТЕЛЬНО в конце:
git add pages/PublicMenu/base/*.jsx pages/PublicMenu/BUGS.md pages/PublicMenu/README.md
git commit -m "fix: PublicMenu code review V7 smoke test S117"
git push
