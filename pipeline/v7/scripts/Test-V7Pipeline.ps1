# Test-V7Pipeline.ps1 — Runtime tests for V7 helper functions
# Run: powershell.exe -ExecutionPolicy Bypass -File pipeline/v7/scripts/Test-V7Pipeline.ps1
# Exit code 0 = all pass, 1 = any fail

Set-StrictMode -Version 2
$ErrorActionPreference = "Stop"

# Dot-source V7.Common.ps1 from the same directory
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
. (Join-Path $scriptDir 'V7.Common.ps1')

$passed = 0
$failed = 0

function Script:Assert-Test {
    param(
        [string]$Name,
        [bool]$Condition
    )
    if ($Condition) {
        Write-Host "[PASS] $Name"
        $script:passed++
    } else {
        Write-Host "[FAIL] $Name"
        $script:failed++
    }
}

Write-Host "=== V7 Pipeline Runtime Tests ==="
Write-Host ""

# --- Test-V7HasProperty ---

# Test 1: hashtable with existing key
$ht = @{ foo = 'bar' }
Assert-Test "Test-V7HasProperty: hashtable existing key" (Test-V7HasProperty -InputObject $ht -Name 'foo')

# Test 2: hashtable with missing key
Assert-Test "Test-V7HasProperty: hashtable missing key" (-not (Test-V7HasProperty -InputObject $ht -Name 'baz'))

# Test 3: PSCustomObject with existing property
$pso = [PSCustomObject]@{ foo = 'bar' }
Assert-Test "Test-V7HasProperty: PSCustomObject existing prop" (Test-V7HasProperty -InputObject $pso -Name 'foo')

# Test 4: PSCustomObject with missing property
Assert-Test "Test-V7HasProperty: PSCustomObject missing prop" (-not (Test-V7HasProperty -InputObject $pso -Name 'baz'))

# Test 5: OrderedDictionary with existing key
$od = [ordered]@{ foo = 'bar' }
Assert-Test "Test-V7HasProperty: OrderedDictionary existing key" (Test-V7HasProperty -InputObject $od -Name 'foo')

# Test 6: OrderedDictionary with missing key
Assert-Test "Test-V7HasProperty: OrderedDictionary missing key" (-not (Test-V7HasProperty -InputObject $od -Name 'baz'))

# Test 7: $null input — Mandatory param rejects $null, so we verify it doesn't silently return $true
$nullSafe = $false
try {
    $r = Test-V7HasProperty -InputObject $null -Name 'foo'
    $nullSafe = (-not $r)
} catch {
    # Parameter binding error is expected; $null is safely rejected
    $nullSafe = $true
}
Assert-Test "Test-V7HasProperty: null input safely rejected" $nullSafe

# Test 8: nested PSCustomObject from ConvertFrom-Json
$json = '{"outer":{"inner":"value"}}' | ConvertFrom-Json
Assert-Test "Test-V7HasProperty: nested PSCustomObject (ConvertFrom-Json)" (Test-V7HasProperty -InputObject $json -Name 'outer')

# Test 9: empty hashtable
$empty = @{}
Assert-Test "Test-V7HasProperty: empty hashtable" (-not (Test-V7HasProperty -InputObject $empty -Name 'foo'))

# --- Write-V7Json + Read ---

# Test 10: Write JSON, read back, verify no BOM
$tempDir = Join-Path ([System.IO.Path]::GetTempPath()) ("v7-test-" + [guid]::NewGuid().ToString("N"))
New-Item -ItemType Directory -Path $tempDir -Force | Out-Null
try {
    $tempJson = Join-Path $tempDir 'test.json'
    Write-V7Json -Path $tempJson -Data @{ hello = 'world' }

    $bytes = [System.IO.File]::ReadAllBytes($tempJson)
    $hasBom = ($bytes.Length -ge 3 -and $bytes[0] -eq 0xEF -and $bytes[1] -eq 0xBB -and $bytes[2] -eq 0xBF)
    Assert-Test "Write-V7Json: no BOM in output file" (-not $hasBom)

    # Test 11: Written JSON is valid
    $parsed = $null
    $jsonValid = $false
    try {
        $content = [System.IO.File]::ReadAllText($tempJson)
        $parsed = $content | ConvertFrom-Json
        $jsonValid = ($null -ne $parsed)
    } catch {
        $jsonValid = $false
    }
    Assert-Test "Write-V7Json: output is valid JSON" $jsonValid
} finally {
    Remove-Item -LiteralPath $tempDir -Recurse -Force -ErrorAction SilentlyContinue
}

# --- Invoke-V7Git ---

# Test 12: Invoke-V7Git 'status' succeeds
$repoRoot = (Resolve-Path (Join-Path $scriptDir '..\..\..'))
$gitOk = $false
try {
    $result = Invoke-V7Git -RepoRoot $repoRoot -Arguments @('status')
    $gitOk = ($result.exit_code -eq 0)
} catch {
    $gitOk = $false
}
Assert-Test "Invoke-V7Git: git status succeeds" $gitOk

# Test 13: Invoke-V7Git with invalid command returns error gracefully
$gitErrorGraceful = $false
try {
    $result = Invoke-V7Git -RepoRoot $repoRoot -Arguments @('not-a-real-command-xyz') -FailureMessage 'Expected failure'
    $gitErrorGraceful = $false  # should have thrown
} catch {
    # Expected: the function should throw, not crash the process
    $gitErrorGraceful = ($_.Exception.Message -match 'Expected failure')
}
Assert-Test "Invoke-V7Git: invalid command throws gracefully" $gitErrorGraceful

# --- V7.Common.ps1 health checks ---

$commonPath = Join-Path $scriptDir 'V7.Common.ps1'
$commonContent = [System.IO.File]::ReadAllText($commonPath)

# Test 14: No .Contains( calls outside Test-V7HasProperty function
# Strategy: remove the Test-V7HasProperty function body, then check remainder
$outsideHasProp = $commonContent
# Remove the Test-V7HasProperty function block
$startMarker = 'function Test-V7HasProperty {'
$startIdx = $outsideHasProp.IndexOf($startMarker)
if ($startIdx -ge 0) {
    # Find the closing brace by counting braces
    $depth = 0
    $inFunction = $false
    $endIdx = $startIdx
    for ($i = $startIdx; $i -lt $outsideHasProp.Length; $i++) {
        if ($outsideHasProp[$i] -eq '{') {
            $depth++
            $inFunction = $true
        } elseif ($outsideHasProp[$i] -eq '}') {
            $depth--
            if ($inFunction -and $depth -eq 0) {
                $endIdx = $i + 1
                break
            }
        }
    }
    $outsideHasProp = $outsideHasProp.Substring(0, $startIdx) + $outsideHasProp.Substring($endIdx)
}
$containsCalls = [regex]::Matches($outsideHasProp, '\.Contains\(')
Assert-Test "V7.Common.ps1 health: no .Contains( outside Test-V7HasProperty" ($containsCalls.Count -eq 0)

# Test 15: No .ContainsKey( calls anywhere
$containsKeyCalls = [regex]::Matches($commonContent, '\.ContainsKey\(')
Assert-Test "V7.Common.ps1 health: no .ContainsKey( anywhere" ($containsKeyCalls.Count -eq 0)

# Test 16: No [System.Text.Encoding]::UTF8 (BOM-producing) calls
$bomCalls = [regex]::Matches($commonContent, '\[System\.Text\.Encoding\]::UTF8[^E]')
Assert-Test "V7.Common.ps1 health: no BOM-producing [System.Text.Encoding]::UTF8" ($bomCalls.Count -eq 0)

# --- Summary ---

Write-Host ""
$total = $passed + $failed
Write-Host "=== Results: $passed/$total passed, $failed failed ==="

if ($failed -gt 0) {
    exit 1
}
exit 0
