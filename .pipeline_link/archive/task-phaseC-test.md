## PHASE C TEST — Subagent Pipeline Verification
## Page: Profile (profile.jsx, ~244 lines)
## Budget: $5.00 | Test goal: verify subagents launch and complete

---

## CONTEXT

This is a PIPELINE TEST to verify that subagents (code-reviewer, code-fixer) work correctly.
The page is Profile — user profile management page.

File: `pages/Profile/profile.jsx` (~244 lines)

**What this page does:**
User profile page. Allows users to view and edit their profile information.

**Platform rules** are in the system rules file (loaded via --append-system-prompt-file).

---

## YOUR WORKFLOW — USE SUBAGENTS

⚠️ CRITICAL: You MUST delegate to subagents. This is a test of the subagent pipeline.

### Phase 1: Delegate to @code-reviewer
Run: @code-reviewer with this context:
"Review pages/Profile/profile.jsx (~244 lines). This is a user profile page. Find real bugs: security issues, error handling gaps, i18n violations, React anti-patterns. Skip style-only nitpicks. For each issue: priority (P0-P3), line numbers, symptom, root cause, proposed fix."

Wait for code-reviewer to finish. Read its output.

### Phase 2: Delegate to @code-fixer
Pass the code-reviewer's findings to @code-fixer:
"Fix the CONFIRMED issues found by code-reviewer in pages/Profile/profile.jsx. Follow the fix workflow: one commit per fix, git push after all fixes, then RELEASE process."

Wait for code-fixer to finish.

### Phase 3: Verify
1. Check that RELEASE file exists in ../../code/Profile/
2. Check that BUGS.md exists in ../../code/Profile/
3. Run git log --oneline -10 to see commits
4. Output a summary:
   - Subagents used: yes/no (which ones)
   - Bugs found: N
   - Bugs fixed: N
   - Files changed: list
   - RELEASE created: yes/no

### Git
First action: git add . && git commit -m "pre-review Profile" && git push
Final: git add . && git commit -m "release: Profile subagent test" && git push

---

## SUCCESS CRITERIA (for Cowork to verify)
1. ✅ code-reviewer subagent was invoked
2. ✅ code-fixer subagent was invoked
3. ✅ Bugs were found and fixed
4. ✅ RELEASE file created in code/Profile/
5. ✅ BUGS.md created/updated in code/Profile/
6. ✅ Total cost < $5.00
