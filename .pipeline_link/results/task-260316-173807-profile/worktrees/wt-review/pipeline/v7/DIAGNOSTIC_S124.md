# S124 Diagnostic

Date: 2026-03-14
Workspace: C:\Dev\menuapp-code-review

## Commands Run

- `codex exec --help`
- `Select-String -Path pipeline\v7\scripts\*.ps1 -Pattern '\$args\s*='`
- `Select-String -Path pipeline\v7\scripts\Start-TaskSupervisor.ps1 -Pattern '\.(error|exit_code|status|worker)'`
- Focused readback of `Invoke-CodexReviewer.ps1`, `Invoke-CodexAnalyst.ps1`, `Invoke-UxDiscussion.ps1`, `V7.Common.ps1`, and `Start-TaskSupervisor.ps1`

## Findings

### 1. Codex reviewer silent death

`codex exec --help` confirms both invocation modes are supported:
- positional `PROMPT`
- stdin when prompt is omitted or `-` is used

Before the fix, the Codex launchers had been changed away from stdin and into positional prompt arguments. That introduced two risks:
- large prompts are pushed into the Windows command line instead of stdin
- the scripts still used the automatic PowerShell variable name `$args`, which is confusing and error-prone in script/function scope

Affected scripts found during diagnosis:
- `pipeline/v7/scripts/Invoke-CodexReviewer.ps1`
- `pipeline/v7/scripts/Invoke-CodexAnalyst.ps1`
- `pipeline/v7/scripts/Invoke-CodexWriter.ps1`
- `pipeline/v7/scripts/Invoke-UxDiscussion.ps1` (Codex round)

The best stable fix is:
- keep Codex prompts on stdin using `-`
- make `Invoke-V7CommandToFiles` write stdin as explicit UTF-8 bytes without BOM
- rename local `$args` variables to non-automatic names

### 2. Supervisor property errors

The recurring `property 'error' cannot be found` and `property 'exit_code' cannot be found` errors came from strict-mode reads against optional fields on ordered dictionaries / result objects.

Confirmed risky accesses in `Start-TaskSupervisor.ps1` included:
- summary generation reading `processInfo.exit_code`
- summary generation reading `Status.error`
- merge / UX completion blocks reading optional result fields directly
- completion/telemetry event payloads reading optional process and git fields directly

These reads were not consistently using the existing safe getter pattern.

### 3. Dead process detection

The wait loop in `Start-TaskSupervisor.ps1` only used `$proc.HasExited`.

That is not robust enough if the backing process object is stale while the PID is already gone. In that case the supervisor can continue heartbeating with dead PIDs.

The fix is to refresh the process object and also verify the PID via `Get-Process -Id <pid> -ErrorAction SilentlyContinue`.

## Conclusions

Root causes for S124 were:
1. Codex launcher regression from UTF-8-safe stdin to positional prompt arguments
2. optional field reads under strict mode without safe accessors
3. process-liveness checks that trusted stale `Process` objects too much

## Implemented Fix Direction

- restored Codex launchers to stdin mode using `-` plus `-InputText`
- changed `Invoke-V7CommandToFiles` to send stdin as BOM-free UTF-8 bytes
- removed `$args =` assignments from V7 scripts in favor of explicit variable names
- added safe state/result getters in the supervisor and replaced unsafe optional reads
- added a PID-backed liveness check in the supervisor wait loop