## Files Changed
- `pages/Profile/base/profile.jsx`

## Main Fixes
- Added a local save-status timer cleanup helper so repeated saves do not leave stale timers behind.
- Hardened `handleSave()` with an explicit mounted check before entering the save flow and before every post-request state update.
- Reused the trimmed full name value for the API call and the success path to preserve existing save behavior while avoiding post-unmount updates.

## Tests Or Checks Run
- `git diff --check`
- Manual diff review of `pages/Profile/base/profile.jsx`

## Follow-up Risk
- The requested summary path outside the worktree was read-only in this sandbox, so this copy was written inside the worktree instead.
- No automated React/runtime test was available in this worktree, so the unmount case was validated by code inspection rather than an executable test.
