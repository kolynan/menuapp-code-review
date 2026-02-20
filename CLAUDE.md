# MenuApp Code Review — Claude Code Instructions

This file is automatically loaded by Claude Code when working in this repository.
It contains project rules, code review instructions, and orchestration workflow.

## Project Overview

MenuApp is a QR-menu and ordering system for restaurants built on the **Base44 no-code platform**.
- Guests scan a QR code → see menu → place orders
- Waiters see orders on mobile interface
- Restaurant owners manage via Partner admin panel (partner cabinet)

### Files in This Repo
| File | What it is |
|---|---|
| `partnertables.js` | Main table management page (~2500 lines) |
| `PartnerShell.jsx` | Shell/wrapper component for partner pages |
| `PageHelpButton.jsx` | Help button component with markdown rendering |

## Code Review Workflow

When asked to review a file, follow this process:

### Step 1: Run Sub-Reviewers
Use **both** subagents to analyze the file:
1. **correctness-reviewer** — finds crashes, logic errors, security issues (P0-P1)
2. **style-reviewer** — finds i18n violations, naming issues, code quality (P1-P3)

Example: "Use correctness-reviewer and style-reviewer to analyze partnertables.js"

### Step 2: Synthesize Results
Combine findings from both reviewers into a single report using this format:

```
## Code Review Report: [filename]

### Summary
[1-2 sentences: overall assessment]

### Critical Issues (P0) — Must Fix
[Crashes, data loss, security vulnerabilities]

### High Priority (P1) — Should Fix
[Incorrect behavior, core pattern violations]

### Medium Priority (P2) — Recommended
[Code quality, performance, maintainability]

### Low Priority (P3) — Nice to Have
[Minor style, docs, optional improvements]

### Statistics
- Total issues: X (P0: X, P1: X, P2: X, P3: X)
- Files analyzed: X
- Lines of code: ~X
```

### Step 3: Get Second Opinion from Codex (Optional)
If configured, call Codex via MCP or Bash for an independent review:

```bash
codex exec "You are reviewing Base44/React code. Check for: crashes, security, i18n violations, logic errors. Here is the code and Claude's findings. Give your independent opinion — agree, disagree, add missed issues. File: [filename]"
```

Then compare Claude's and Codex's findings:
- ✅ **Both agree** — high confidence, definitely fix
- ⚠️ **Disagree** — present both views, let Arman decide
- 🆕 **Only one found** — investigate further

---

## Base44 Platform Rules

### Critical Rules (P0 — violations cause crashes)

**1. PartnerShell Wrapper Pattern**
`usePartnerAccess()` must ONLY be called inside a `<PartnerShell>` component:
```jsx
// Content component (has usePartnerAccess)
function PageNameContent() {
  const { partner, role } = usePartnerAccess();
  // ... page logic
}

// Default export (wrapper only)
export default function PageName() {
  return (
    <PartnerShell activeTab="tabname">
      <PageNameContent />
    </PartnerShell>
  );
}
```

**2. TDZ Safety**
All `const`/`let` variables, `useMemo`, `useQuery`, `useEffect` must be declared AFTER every identifier they reference. New computed values go NEAR their usage, not at the top.

**3. No Conditional Hooks**
Never place React hooks inside `if`, loops, or after early returns.

### High Priority Rules (P1 — violations cause incorrect behavior)

**4. i18n Required**
ALL user-facing strings must use `t('key')` from `useI18n`.
- Key format: `page.section.element` (e.g., `partner_tables.form.save`)
- Common keys: `common.save`, `common.cancel`, `common.loading`, `common.error`
- Toast keys: `toast.saved`, `toast.error`
- Do NOT translate: entity/DB names, currencies (`$`, `₸`), language codes
- Arrays/constants with text → functions accepting `t` parameter
- Hardcoded fallbacks like `|| 'Error'` or `|| 'Ошибка'` violate this rule

**5. No Data Model Changes**
Page code cannot modify the Base44 data model. Data model changes require a separate B44 prompt.

**6. No Auth/Security/Layout Changes**
Never modify authentication, security logic, or `Layout.js` from page code.

**7. Context-First**
Always analyze existing context and imports before suggesting changes.

### Code Quality Rules (P2)

**8. Naming Conventions**
- Components: `PascalCase`
- Functions/variables: `camelCase`
- Constants: `UPPER_SNAKE_CASE`
- Event handlers: `handleXxx` or `onXxx`
- Booleans: `isXxx`, `hasXxx`, `canXxx`

**9. No Magic Numbers** — Use named constants for repeated values.

**10. No Debug Logs** — Remove all `console.log` before final code.

**11. No Dynamic Tailwind Classes** — Use mapping objects instead of string interpolation.

**12. Blob URL Cleanup** — Every `URL.createObjectURL()` must have a corresponding `URL.revokeObjectURL()`.

### Routing Rules

**13. Route Stability** — PROD pages use lowercase routes. LAB pages use suffix `1`.

**14. Public Routes** — `/x` must remain public. QR/Hall contract: `/x?partner=<id>&table=<code>&mode=hall`.

**15. PartnerShell Routes** — Partner pages must be registered in `PARTNER_SHELL_ROUTES` in `Layout.js`.

---

## Review Guidelines

- **Be specific**: include line numbers and code snippets
- **Explain WHY** each issue matters, not just WHAT is wrong
- **Suggest fixes**: for P0/P1 issues, provide concrete code
- **Consider Base44 constraints**: no-code backend, entity-based data
- **Don't invent issues**: if code is good, say so
- **Priority matters**: P0 before P1 before P2 before P3
