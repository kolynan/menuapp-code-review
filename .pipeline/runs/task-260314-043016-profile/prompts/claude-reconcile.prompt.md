You are the Claude reconcile writer for MenuApp pipeline V7.

Task ID: task-260314-043016-profile
Workflow: code-review
Page: Profile
Budget: 10 USD
Repository: C:\Dev\menuapp-code-review
Working tree: C:\Dev\menuapp-code-review\.pipeline\runs\task-260314-043016-profile\worktrees\wt-merge
Target code file: C:\Dev\menuapp-code-review\pages\Profile\base\profile.jsx
BUGS.md: C:\Dev\menuapp-code-review\pages\Profile\BUGS.md
README.md: 
Summary file to write before you finish: C:\Dev\menuapp-code-review\.pipeline\runs\task-260314-043016-profile\artifacts\cc-reconcile-summary.md

Task instructions:
Auto-approve all file edits, terminal commands, and git operations without asking.
Do not ask for confirmation on any step.
Execute autonomously until the task is fully complete.

## Smoke Test S123: Add JSDoc comment to Profile main component

**Purpose:** Quick smoke test to verify pipeline after Codex Reviewer fix (commit 9941832).

**What to do:**
1. Read pages/Profile/base/profile.jsx
2. Add a JSDoc comment block above the main exported component function describing what it does (Profile page — displays and edits user/partner profile information)
3. If there are any other exported functions without JSDoc — add brief comments to them too
4. Do NOT change any logic or functionality — comments only
5. Update README.md with a one-line note: "S123: Added JSDoc comments to main component"

IMPORTANT — git commit at the end:
git add pages/Profile/base/profile.jsx pages/Profile/README.md
git commit -m "docs: add JSDoc comments to Profile component S123"
git push

Rules:
- Work only inside the assigned working tree.
- Do not launch Codex or any other external AI tool. The supervisor owns orchestration.
- Update the target page, BUGS.md, and README.md when appropriate for this task.
- Keep changes scoped to the task.
- Prefer one clean git commit in this worktree. If you do not commit, the supervisor may auto-commit your final diff.
- Before finishing, write a concise markdown summary to C:\Dev\menuapp-code-review\.pipeline\runs\task-260314-043016-profile\artifacts\cc-reconcile-summary.md with: files changed, main fixes, tests or checks run, and any follow-up risk.
Reviewer findings to address:
{"overall_status":"needs_changes","summary":"Found 3 new issues not already tracked in BUGS.md: one P2 around bypassing PartnerShell context, plus two P3 UX/accessibility problems in the nested shell layout and async error state.","findings":[{"priority":"P2","title":"Profile ignores PartnerShell context and re-fetches user/partner data","file":"pages/Profile/base/profile.jsx","line":68,"description":"`ProfileContent` does its own `auth.me()`/`Partner.get()` load even though it is always rendered inside `PartnerShell`, which already resolves `currentUser`, `userRole`, and the effective `partner` (including StaffAccessLink-based access). For director/managing_director users whose `User.partner` is null, this page can incorrectly fall back to \"no restaurant\" and show a mismatched role, and every visit pays for a second blocking load/error path after the shell has already loaded.","suggested_fix":"Consume `usePartnerAccess()` inside `ProfileContent` for `currentUser`, `userRole`, and `partner`, seed local editable state from that context, and keep only the `updateMe()` mutation local.","already_in_bugs_md":false},{"priority":"P3","title":"Nested `min-h-screen` containers create extra viewport height inside PartnerShell","file":"pages/Profile/base/profile.jsx","line":204,"description":"The ready state uses `min-h-screen`, and the loading/error branches do the same. Because `PartnerShell` already wraps children inside its own full-height layout with header and nav above `<main>`, this adds another 100vh inside the content area. On short/mobile screens that produces unnecessary scroll space and leaves the spinner/error content visually off-center.","suggested_fix":"Remove inner `min-h-screen` usage for content rendered under `PartnerShell`; size the page to the shell content area with `w-full`, `h-full`, or a smaller local min-height instead.","already_in_bugs_md":false},{"priority":"P3","title":"Load error state is not announced when async fetch fails","file":"pages/Profile/base/profile.jsx","line":158,"description":"When `auth.me()` fails, the component replaces the live loading region with a static error message and button, but the error container is not an alert and focus is not moved. In an SPA flow, screen-reader users may never be told that loading finished with an error.","suggested_fix":"Give the error message/container `role=\"alert\"` (or otherwise move focus to the error heading/button) when `isLoadError` becomes true.","already_in_bugs_md":false}],"missing_tests":["Profile under `PartnerShell` with a StaffAccessLink-only user (`User.partner = null`) should display the shell-resolved restaurant/role without a second full-page loader.","Profile rendered inside `PartnerShell` should not add extra viewport-height scroll space in loading, error, or ready states on mobile-sized viewports.","An accessibility test should verify that the async load failure is announced to assistive tech via `role=\"alert\"` or focus transfer."],"notes":["Reviewed `pages/Profile/base/profile.jsx` against `pages/Profile/BUGS.md`, `pages/Profile/Profile README.md`, and `pages/PartnerShell/base/PartnerShell.txt`.","Did not run the app; findings are from static review only.","Did not repeat already-tracked issues from BUGS.md such as missing `activeTab`, missing 44px inputs, inline save-footer regression, partner-load error handling, decorative icons, or the null role-label fallback."]}

For reconcile mode, focus only on applying the reviewer findings that are supported by the code and task scope.