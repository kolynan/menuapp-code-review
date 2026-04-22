param(
    [Parameter(Mandatory = $true)][string]$Text,
    [string]$ConfigPath,
    [string]$EditMessageId
)

$commonPath = Join-Path $PSScriptRoot 'V7.Common.ps1'
. $commonPath
$config = Get-V7Config -ConfigPath $ConfigPath

$result = if ([string]::IsNullOrWhiteSpace($EditMessageId)) {
    Send-V7TelegramMessage -Config $config -Text $Text
} else {
    Edit-V7TelegramMessage -Config $config -MessageId $EditMessageId -Text $Text
}

if (-not $result.ok) {
    exit 1
}

if (-not [string]::IsNullOrWhiteSpace([string]$result.message_id)) {
    Write-Output ([string]$result.message_id)
}
