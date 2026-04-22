---
agent: 'Code Review'
description: 'Run full code review on a MenuApp Base44 page file'
---

Review the file `${input:filename:partnertables.js}` for:
- Runtime crashes and logic errors (P0-P1)
- Security vulnerabilities (P0-P1)
- Base44 pattern violations (PartnerShell, i18n, data model rules)
- Code quality and style issues (P2-P3)

Apply rules from [base44-rules](../instructions/base44-rules.instructions.md).

Output a prioritized report with line numbers, explanations, and concrete fix suggestions.
