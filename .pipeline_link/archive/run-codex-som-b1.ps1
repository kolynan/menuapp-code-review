Set-Location "C:/Users/ASUS/Dev/Menu AI Cowork/menuapp-code-review"
Get-Content -Raw "C:/Users/ASUS/Dev/Menu AI Cowork/pipeline/codex-prompt-pssk-som-b1-codex-v1.txt" | codex exec --cd "." --skip-git-repo-check --dangerously-bypass-approvals-and-sandbox --output-last-message "C:/Users/ASUS/Dev/Menu AI Cowork/pipeline/codex-findings-pssk-som-b1-codex-v1.txt" -
