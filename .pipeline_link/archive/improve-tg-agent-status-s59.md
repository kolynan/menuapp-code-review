---
type: script improvement
file: scripts/run-vsc-task.sh
budget: 1.50
session: 59
---

# Task: Add CC + Codex status line to Telegram final message

## Problem

Arman can't easily tell from TG messages whether both CC and Codex finished
successfully. Current final message just says "TASK COMPLETE" without explicit
per-agent status.

## Goal

Add one summary line to the final Telegram message:
```
CC ✅ | Codex ✅ | Ошибок: 0 | Споров: 0
```

Or if something went wrong:
```
CC ✅ | Codex ❌ не запустился | Ошибок: 1 | Споров: 2
```

## Instructions

git add . && git commit -m "pre-task: tg agent status line" && git push

### Step 1: Find where the final TG message is sent in `scripts/run-vsc-task.sh`

Look for the section that sends the final "TASK COMPLETE" Telegram notification.

### Step 2: Read the result file to extract agent status

The result file (`pipeline/result-*.md`) already contains:
- `is_error: true/false`
- `codex_used: yes/no`
- `disputes: N`
- `bugs_found: N`

Parse these fields using grep/sed when composing the final TG message.

### Step 3: Add the summary line

Just before or after the "TASK COMPLETE" line, append:
```
CC ✅ | Codex ✅/❌ | Ошибок: N | Споров: N
```

Logic:
- CC status: always ✅ if we reached this point (CC finished = task ran to completion)
- Codex status: ✅ if `codex_used: yes`, ❌ + reason if `codex_used: no`
- Ошибок: value of `is_error` (0 if false, 1 if true)
- Споров: value of `disputes`

### Step 4: Test

Check that the format looks correct by reviewing the script logic.
No need to run a full task — just verify the bash logic is sound.

git add . && git commit -m "feat: add CC+Codex status line to TG final message" && git push

## Notes
- Small focused change, only affects the final TG notification
- Don't change any other part of the script
