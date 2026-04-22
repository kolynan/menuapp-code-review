param(
    [string]$ConfigPath,
    [string]$Text = 'V7 Test-Telegram.ps1 validation from Codex'
)

$commonPath = Join-Path $PSScriptRoot 'V7.Common.ps1'
. $commonPath

$resolvedConfigPath = $ConfigPath
if (-not $resolvedConfigPath) {
    $resolvedConfigPath = Join-Path (Join-Path (Split-Path -Parent (Split-Path -Parent (Split-Path -Parent $PSScriptRoot))) 'scripts') 'task-watcher-config.json'
}

$config = Get-V7Config -ConfigPath $resolvedConfigPath
$diagnosticsPath = Join-Path (Split-Path -Parent $resolvedConfigPath) 'telegram-test.error.log'
$sent = Send-V7Telegram -Config $config -Text $Text -DiagnosticsPath $diagnosticsPath
if ($sent) {
    Write-Host 'Telegram OK'
    exit 0
}

Write-Host ('Telegram FAILED. Diagnostics: ' + $diagnosticsPath)
if (Test-Path -LiteralPath $diagnosticsPath) {
    Get-Content -LiteralPath $diagnosticsPath | Select-Object -Last 40
}
exit 1
