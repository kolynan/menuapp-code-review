param(
    [Parameter(Mandatory = $true)][string]$Text,
    [string]$ConfigPath
)

$commonPath = Join-Path $PSScriptRoot 'V7.Common.ps1'
. $commonPath
$config = Get-V7Config -ConfigPath $ConfigPath
if (-not (Send-V7Telegram -Config $config -Text $Text)) {
    exit 1
}
