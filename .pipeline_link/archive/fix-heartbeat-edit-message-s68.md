---
task: fix-heartbeat-edit-message-s68
budget: 10
type: implementation
created: 2026-03-02
session: S68
priority: normal
---

# Fix: Heartbeat should edit main TG message, not send new ones

## Problem

In `scripts/run-vsc-task.sh` (v4.7), the heartbeat sends NEW Telegram messages every 3 minutes.
This clutters the chat: one [..] start message + separate [?] running messages + [DONE] message.
All heartbeat updates should be part of ONE message.

## Root cause

In the heartbeat block (lines ~221-240), the curl call uses `sendMessage` instead of `editMessageText`:

```bash
curl -s -X POST "https://api.telegram.org/bot${BOT_TOKEN}/sendMessage" \
    -d "chat_id=${CHAT_ID}&text=[⏱] ${TASK_ID}: running ${ELAPSED_MIN}m ${ELAPSED_REM}s" \
    > /dev/null 2>&1 || true
```

## Fix

File: `scripts/run-vsc-task.sh`

In the heartbeat `nohup bash -c "..."` block, replace the `sendMessage` curl call with an `editMessageText` call that:
1. Reads TG_MSG_ID from the `.tg_msg_id` file
2. Reads the full current content of PROG_FILE (which already has `[⏱] running Xm Ys` appended)
3. Calls `editMessageText` with that content

### Exact replacement

Find (inside the nohup block, around line 236):
```bash
        curl -s -X POST "https://api.telegram.org/bot${BOT_TOKEN}/sendMessage" \
            -d "chat_id=${CHAT_ID}&text=[⏱] ${TASK_ID}: running \${ELAPSED_MIN}m \${ELAPSED_REM}s" \
            > /dev/null 2>&1 || true
```

Replace with:
```bash
        TG_ID_HB=\$(cat "${PIPELINE_DIR}/${TASK_ID}.tg_msg_id" 2>/dev/null || echo '')
        if [[ -n "\$TG_ID_HB" ]]; then
            HB_TEXT=\$(cat "\$PROG_FILE" | python -c 'import sys,json; print(json.dumps(sys.stdin.read()))' 2>/dev/null || echo '"[running]"')
            curl -s -X POST "https://api.telegram.org/bot${BOT_TOKEN}/editMessageText" \
                -H 'Content-Type: application/json' \
                -d "{\"chat_id\":\"${CHAT_ID}\",\"message_id\":\"\$TG_ID_HB\",\"text\":\$HB_TEXT}" \
                > /dev/null 2>&1 || true
        fi
```

## Important notes

- The `echo "[⏱] running ..." >> "$PROG_FILE"` line BEFORE the curl stays as-is — it builds the message content
- Be careful with escaping: this is inside `nohup bash -c "..."` so `\$VAR` vs `${VAR}` matters
- Variable `${BOT_TOKEN}`, `${CHAT_ID}`, `${PIPELINE_DIR}`, `${TASK_ID}` are outer shell vars → no backslash
- Variable `\$TG_ID_HB`, `\$HB_TEXT`, `\$PROG_FILE`, `\$ELAPSED_MIN`, `\$ELAPSED_REM` are inner vars → need backslash
- v4.4 was broken by unescaped `"` inside nohup — test carefully

## After implementation

- Update version header to `4.8`
- Update version comment: `v4.8: Heartbeat now edits main TG message (not new message)`
- git add scripts/run-vsc-task.sh, commit, push
- No new RELEASE file needed (scripts don't use that naming)
