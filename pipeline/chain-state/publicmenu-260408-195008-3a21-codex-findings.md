# Codex Reviewer Findings — ПССК Prompt Quality Review
Chain: publicmenu-260408-195008-3a21

## Issues Found
1. [CRITICAL] Shell commands in the prompt do not match the actual repo environment — The prompt uses bare `diff`, `grep`, `grep -c`, and `wc -l`, but this workspace runs PowerShell on Windows. In this environment, `diff` resolves to `Compare-Object`, `cp` resolves to `Copy-Item`, and `grep` / `wc` are not available. Step 0 and most verification blocks will fail or produce misleading output before implementation starts.
PROMPT FIX: Add a shell-convention note and rewrite command examples to PowerShell-safe forms (`git diff --no-index`, `Select-String`, `(Get-Content).Count`), or explicitly say “use shell-native equivalent”.
REWRITTEN SECTION:
```md
## Shell Convention (Windows / PowerShell)
Use PowerShell-safe commands in this repo. Do not use bare `grep`, `wc`, or `diff`.

Examples:
- Content diff: `git diff --no-index --no-ext-diff --unified=0 -- 'pages/PublicMenu/260408-01 PublicMenu x RELEASE.jsx' 'pages/PublicMenu/x.jsx'`
- Find line(s): `Select-String -Path 'pages/PublicMenu/x.jsx' -Pattern 'handleResolve = useCallback'`
- Count matches: `(Select-String -Path 'pages/PublicMenu/x.jsx' -Pattern 'cancelConfirmTarget').Count`
- Line count: `(Get-Content 'pages/PublicMenu/x.jsx').Count`
```

2. [CRITICAL] Step 0 would false-stop on the current workspace even though the file is safely normalizable — Verified against the actual files: `260408-01 PublicMenu x RELEASE.jsx` is 5458 lines, while `pages/PublicMenu/x.jsx` is 5460 lines, and the diff is EOF noise / trailing NUL bytes after the final `}`. The prompt only allows trailing newline/whitespace drift and says STOP for anything else, so it would abort on a recoverable corruption case.
PROMPT FIX: Treat trailing NUL/EOF garbage as safe-to-normalize; stop only if substantive code differs before EOF.
REWRITTEN SECTION:
```md
### STEP 0 — Preflight: Normalize x.jsx (safe EOF/noise handling)
Compare `pages/PublicMenu/x.jsx` to `pages/PublicMenu/260408-01 PublicMenu x RELEASE.jsx`.

Safe-to-normalize cases:
- trailing newline differences
- trailing whitespace differences
- trailing NUL / EOF garbage after the final closing `}`

If the files are identical after trimming EOF-only noise, proceed with overwrite:
`Copy-Item 'pages/PublicMenu/260408-01 PublicMenu x RELEASE.jsx' 'pages/PublicMenu/x.jsx'`

STOP only if there are substantive code differences before EOF.
Then verify line count:
`(Get-Content 'pages/PublicMenu/x.jsx').Count` → must be `5458` (allow `±1` only for newline normalization).
```

3. [MEDIUM] `<DrawerContent>` count is internally inconsistent — The prompt correctly says the help drawer is the third of 4 `<DrawerContent>` blocks, but the regression section later says there are 3 occurrences. The verified RELEASE file has 4 opening tags at lines 4763, 4858, 4975, and 5319. The fourth block is the dish-detail drawer. This can create false failures or make the implementer inspect the wrong drawer.
PROMPT FIX: Use `4` consistently and name the fourth drawer explicitly.
REWRITTEN SECTION:
```md
## Regression Check (MANDATORY after implementation)
- [ ] CartView drawer still opens and shows orders
- [ ] `<DrawerContent>` count is still 4: CartView (4763), Bottom Sheet (4858), Help (4975), Dish Detail (5319)
- [ ] Bell icon badge still displays `activeRequestCount`
```

4. [MEDIUM] The prompt misstates the request-send flow by attributing ServiceRequest creation to `handleCardTap` — In the verified file, `handleCardTap` at line 2370 only sets undo state and pending quick-send state. The actual submit path is the HD-01 effect at lines 2495-2629, which calls `submitHelpRequest()`. The regression line `handleCardTap sends ServiceRequest.create() correctly` is factually wrong and points the implementer at the wrong code path.
PROMPT FIX: Reframe this as a quick-send pipeline check and explicitly mention `pendingQuickSendRef`, `selectedHelpType`, and `submitHelpRequest()`.
REWRITTEN SECTION:
```md
## FROZEN UX (DO NOT CHANGE)
- `handleCardTap` kickoff logic (line 2370) — keep undo / pending-quick-send behavior intact
- `handleUndo` logic (line 2405) — undo toast still cancels the queued send

## Regression Check (MANDATORY after implementation)
- [ ] One tap still follows the quick-send pipeline: `handleCardTap` sets undo state, then the HD-01 effect (`selectedHelpType` / `pendingQuickSendRef`) calls `submitHelpRequest()` after the 5s window
```

5. [MEDIUM] Mandatory runtime/mobile QA is underspecified for a CLI-only implementation pass — The prompt requires 375px verification, swipe-down/backdrop dismiss, and live tap testing, but it never says where this should be run or what to report if no runtime preview is available. In a terminal-only pass this creates hesitation or fake checkmarks.
PROMPT FIX: Split static code checks from manual QA and define the fallback when no runtime preview is available.
REWRITTEN SECTION:
```md
## POST-IMPLEMENTATION CHECKS

### Static code checks (mandatory in CLI)
- [ ] `cancelConfirmTarget` exists in state + handler + JSX
- [ ] `SOS_BUTTONS` exists and is mapped in the grid
- [ ] `URGENCY_STYLES` exists and is used
- [ ] dead symbols are removed
- [ ] `handleRetry` still exists

### Manual QA (mandatory only if a local preview / deployed preview is available)
- [ ] 375px width: 6 buttons visible in 2 columns × 3 rows
- [ ] Drawer closes via swipe-down / backdrop
- [ ] Tap sends request, ✕ cancels, red cancel shows confirm
- [ ] Drawer scrolls when content exceeds viewport

If no runtime preview is available in the environment, report `Manual QA not run here` instead of checking these off.
```

6. [MEDIUM] `cancelConfirmTarget` only guards confirm-click, not async target disappearance — The prompt adds a guard inside the confirm button, but help state is continuously synced and the targeted row can disappear while the confirm panel is open. In that case the panel stays visible until the user manually dismisses it, even though the target is already gone.
PROMPT FIX: Either declare that stale-panel behavior is acceptable, or add an auto-clear effect keyed to `activeRequests`.
REWRITTEN SECTION:
### STEP 5.5 — Auto-clear stale cancel confirm target
Add this effect after `handleSosCancel`:

```js
useEffect(() => {
  if (!cancelConfirmTarget) return;

  const exists = cancelConfirmTarget.type === 'other'
    ? activeRequests.some((r) => r.id === cancelConfirmTarget.rowId)
    : activeRequests.some((r) => r.type === cancelConfirmTarget.type);

  if (!exists) setCancelConfirmTarget(null);
}, [activeRequests, cancelConfirmTarget]);
```

7. [LOW] Urgency treatment for active `other` rows is ambiguous — `HELP_URGENCY_GROUP` explicitly includes `other` at line 1872, and the prompt’s UX notes say urgency bands matter, but the proposed JSX keeps active `other` rows permanently orange while typed SOS buttons change neutral/amber/red. That leaves the intended UX unspecified and can produce inconsistent visuals for the same urgency model.
PROMPT FIX: State whether `other` rows intentionally stay orange, or instruct the agent to apply the same urgency styling to them.
REWRITTEN SECTION:
```md
### Active custom `other` requests
Use the same urgency model as the 6 SOS buttons unless UX explicitly wants `other` rows to remain orange-only.

Implementation rule:
- compute `const urgency = getHelpUrgency('other', row.sentAt);`
- use `const s = URGENCY_STYLES[urgency] || URGENCY_STYLES.neutral;`
- apply `s.bg`, `s.border`, `s.label`, `s.timer`, `s.xBg`, `s.xColor` to the non-error `other` row
```

8. [LOW] One inline handler comment is easy to paste incorrectly — In Step 6 the confirm button callback includes an inline `// Guard:` comment inside a compact arrow-function body. In a dense copy-paste prompt, flattening that block can accidentally comment out `const targetRow = ...` and change the generated code.
PROMPT FIX: Remove inline `//` comments from embedded JSX handlers or format the handler on multiple lines.
REWRITTEN SECTION:
```jsx
<button
  onClick={() => {
    const { type: cType, rowId: cRowId } = cancelConfirmTarget;
    const targetRow = cType === 'other'
      ? activeRequests.find((r) => r.id === cRowId)
      : activeRequests.find((r) => r.type === cType);

    if (targetRow) {
      handleResolve(cType, cType === 'other' ? cRowId : undefined);
    }
    setCancelConfirmTarget(null);
  }}
  className="flex-1 py-2 rounded-lg bg-red-500 text-white text-sm font-bold"
>
  {tr('help.cancel_do', 'Отменить')}
</button>
```

## Summary
Total: 8 issues (2 CRITICAL, 4 MEDIUM, 2 LOW)

## Additional Risks
- `pages/PublicMenu/x.jsx` currently contains trailing EOF/NUL corruption, so any prompt that assumes a clean text file can fail before code changes begin.
- RELEASE-relative line numbers are accurate for `260408-01 PublicMenu x RELEASE.jsx`, but `pages/PublicMenu/x.jsx` already differs at EOF, so anchor text is safer than raw line numbers after normalization.
- The file is large (5458 lines). Long replacement snippets need strong anchors plus shell-safe search instructions, or the agent can replace the wrong drawer block.

## Prompt Clarity (MANDATORY — do NOT skip)
- Overall clarity: 3/5
- What was most clear: fix ordering (`Fix 3` before `Fix 5`), the intended replacement boundary inside the Help Drawer, and the keep/delete list for dead symbols.
- What was ambiguous or could cause hesitation: shell command expectations, the actual number of `<DrawerContent>` blocks, where the send pipeline really happens, whether runtime/mobile QA is possible in the execution environment, and whether `other` rows should follow urgency styling.
- Missing context: the exact shell convention to use, whether EOF/NUL normalization is allowed, where manual QA should be run, and whether stale `cancelConfirmTarget` / `other` urgency behavior is intentional.
