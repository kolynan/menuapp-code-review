param()

$commonPath = Join-Path $PSScriptRoot 'V7.Common.ps1'
. $commonPath

$script:PassCount = 0
$script:FailCount = 0

function Write-ParallelTestResult {
    param(
        [string]$Name,
        [bool]$Passed,
        [string]$Message = ''
    )

    if ($Passed) {
        $script:PassCount++
        Write-Host ('[PASS] ' + $Name)
    } else {
        $script:FailCount++
        if ([string]::IsNullOrWhiteSpace($Message)) {
            Write-Host ('[FAIL] ' + $Name)
        } else {
            Write-Host ('[FAIL] ' + $Name + ' - ' + $Message)
        }
    }
}

function Assert-ParallelWriteCondition {
    param(
        [bool]$Condition,
        [string]$Name,
        [string]$Message
    )

    if (-not $Condition) {
        throw $Message
    }
    Write-ParallelTestResult -Name $Name -Passed $true
}

function Get-MockResultValue {
    param(
        $Result,
        [string]$Name,
        $Default = $null
    )

    if (Test-V7HasProperty -InputObject $Result -Name $Name) {
        return $Result[$Name]
    }
    return $Default
}

function Resolve-MockWriterState {
    param($Result)

    $statusText = [string](Get-MockResultValue -Result $Result -Name 'status' -Default '')
    if ($statusText -eq 'skipped') {
        return 'skipped'
    }
    if (($statusText -eq 'completed' -or $statusText -eq 'success') -and (Test-V7ExitSuccess (Get-MockResultValue -Result $Result -Name 'exit_code' -Default $null))) {
        return 'completed'
    }
    return 'failed'
}

function Test-MockReconcilerGate {
    param(
        [bool]$ParallelOk,
        $ClaudeResult,
        $CodexResult
    )

    if (-not $ParallelOk) {
        return $false
    }

    $claudeState = Resolve-MockWriterState -Result $ClaudeResult
    $codexState = Resolve-MockWriterState -Result $CodexResult
    return ($claudeState -eq 'completed' -and $codexState -eq 'completed')
}

Write-Host '=== V7 Parallel-Write Mock Smoke Test ==='

$tempRepo = Join-Path ([System.IO.Path]::GetTempPath()) ('v7-parallel-write-' + [guid]::NewGuid().ToString('N').Substring(0, 8))

try {
    Ensure-V7Directory -Path $tempRepo | Out-Null
    Invoke-V7Git -RepoRoot $tempRepo -Arguments @('init') -FailureMessage 'Unable to initialize mock repo' | Out-Null
    Invoke-V7Git -RepoRoot $tempRepo -Arguments @('config', 'user.email', 'v7-parallel-test@example.com') -FailureMessage 'Unable to configure mock repo email' | Out-Null
    Invoke-V7Git -RepoRoot $tempRepo -Arguments @('config', 'user.name', 'V7 Parallel Test') -FailureMessage 'Unable to configure mock repo user' | Out-Null

    Write-V7TextFile -Path (Join-Path $tempRepo 'writer1.txt') -Content 'writer one'
    Invoke-V7Git -RepoRoot $tempRepo -Arguments @('add', 'writer1.txt') -FailureMessage 'Unable to stage writer1.txt' | Out-Null
    Invoke-V7Git -RepoRoot $tempRepo -Arguments @('commit', '-m', 'mock writer one') -FailureMessage 'Unable to commit writer1.txt' | Out-Null
    $writerOneCommit = (Invoke-V7Git -RepoRoot $tempRepo -Arguments @('rev-parse', 'HEAD') -FailureMessage 'Unable to read writer one commit').stdout.Trim()

    Write-V7TextFile -Path (Join-Path $tempRepo 'writer2.txt') -Content 'writer two'
    Invoke-V7Git -RepoRoot $tempRepo -Arguments @('add', 'writer2.txt') -FailureMessage 'Unable to stage writer2.txt' | Out-Null
    Invoke-V7Git -RepoRoot $tempRepo -Arguments @('commit', '-m', 'mock writer two') -FailureMessage 'Unable to commit writer2.txt' | Out-Null
    $writerTwoCommit = (Invoke-V7Git -RepoRoot $tempRepo -Arguments @('rev-parse', 'HEAD') -FailureMessage 'Unable to read writer two commit').stdout.Trim()

    Assert-ParallelWriteCondition -Condition (Test-V7ExitSuccess 0) -Name 'Exit code 0 detected as success' -Message 'Exit code 0 should be successful.'
    Assert-ParallelWriteCondition -Condition (Test-V7ExitSuccess $null) -Name 'Exit code $null detected as success (KB-039)' -Message 'Null exit code should normalize to success.'
    Assert-ParallelWriteCondition -Condition (-not (Test-V7ExitSuccess 1)) -Name 'Exit code 1 detected as failure' -Message 'Exit code 1 should fail.'
    Assert-ParallelWriteCondition -Condition (Test-V7ExitSuccess '') -Name 'Exit code empty string detected as success' -Message 'Empty string exit code should normalize to success.'

    $claudeOk = [ordered]@{ status = 'completed'; exit_code = $null; commit_hash = $writerOneCommit }
    $codexOk = [ordered]@{ status = 'completed'; exit_code = $null; commit_hash = $writerTwoCommit }
    $codexFailed = [ordered]@{ status = 'failed'; exit_code = 1; commit_hash = '' }

    Assert-ParallelWriteCondition -Condition (-not [string]::IsNullOrWhiteSpace($writerOneCommit) -and -not [string]::IsNullOrWhiteSpace($writerTwoCommit)) -Name 'Mock writers produced commits' -Message 'Mock writer commits were not created.'
    Assert-ParallelWriteCondition -Condition (Test-MockReconcilerGate -ParallelOk $true -ClaudeResult $claudeOk -CodexResult $codexOk) -Name 'Reconciler gate opens when both writers OK' -Message 'Gate should open when both writers completed successfully.'
    Assert-ParallelWriteCondition -Condition (-not (Test-MockReconcilerGate -ParallelOk $true -ClaudeResult $claudeOk -CodexResult $codexFailed)) -Name 'Reconciler gate blocks when one writer failed' -Message 'Gate should block when one writer fails.'
    Assert-ParallelWriteCondition -Condition (-not (Test-MockReconcilerGate -ParallelOk $false -ClaudeResult $claudeOk -CodexResult $codexOk)) -Name 'Reconciler gate blocks when parallel stage timed out' -Message 'Gate should not open when the parallel stage timed out.'
} catch {
    Write-ParallelTestResult -Name 'Unhandled mock smoke test failure' -Passed $false -Message $_.Exception.Message
} finally {
    if (Test-Path -LiteralPath $tempRepo) {
        Remove-Item -LiteralPath $tempRepo -Recurse -Force -ErrorAction SilentlyContinue
    }
}

$total = $script:PassCount + $script:FailCount
Write-Host ('=== Results: ' + $script:PassCount + '/' + $total + ' passed ===')

if ($script:FailCount -gt 0) {
    exit 1
}

exit 0
