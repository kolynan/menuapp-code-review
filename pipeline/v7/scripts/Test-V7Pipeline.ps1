param()

$commonPath = Join-Path $PSScriptRoot 'V7.Common.ps1'
. $commonPath

$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot '..\..\..')).Path
$workspaceTestRoot = Join-Path ([System.IO.Path]::GetTempPath()) ('v7pipeline-test-' + $PID)
$worktreeRepoRoot = Join-Path ([System.IO.Path]::GetTempPath()) ('v7worktree-' + $PID)
$worktreePath = Join-Path $workspaceTestRoot 'worktree'
$worktreeBranch = 'task/test-kb040-cleanup-' + $PID
$copySourceRoot = Join-Path $repoRoot ('.p7-' + $PID)
$script:V7TestFailures = New-Object System.Collections.Generic.List[string]

function Write-TestResult {
    param(
        [string]$Name,
        [bool]$Passed,
        [string]$Message
    )

    if ($Passed) {
        Write-Host ('PASS: ' + $Name)
    } else {
        if ([string]::IsNullOrWhiteSpace($Message)) {
            $Message = 'No details provided.'
        }
        Write-Host ('FAIL: ' + $Name + ' - ' + $Message)
        $script:V7TestFailures.Add($Name) | Out-Null
    }
}

function Invoke-V7TestCase {
    param(
        [string]$Name,
        [scriptblock]$Action
    )

    try {
        & $Action
        Write-TestResult -Name $Name -Passed $true -Message ''
    } catch {
        Write-TestResult -Name $Name -Passed $false -Message $_.Exception.Message
    }
}

function Assert-V7Equal {
    param(
        $Actual,
        $Expected,
        [string]$Message
    )

    if ($Actual -ne $Expected) {
        throw ($Message + ' Expected=' + [string]$Expected + ' Actual=' + [string]$Actual)
    }
}

function Assert-V7True {
    param(
        [bool]$Value,
        [string]$Message
    )

    if (-not $Value) {
        throw $Message
    }
}

function Assert-V7False {
    param(
        [bool]$Value,
        [string]$Message
    )

    if ($Value) {
        throw $Message
    }
}

function New-V7NearLimitPath {
    param(
        [string]$Root,
        [string]$Extension = '.txt'
    )

    $dir = Ensure-V7Directory -Path (Join-Path $Root 'near-limit')
    while ((Join-Path $dir ('probe' + $Extension)).Length -lt ((Get-V7SafePathLimit) - 24)) {
        $dir = Ensure-V7Directory -Path (Join-Path $dir 'segment1234567890')
    }

    $availableLeafLength = (Get-V7SafePathLimit) - $dir.Length - 1
    if ($availableLeafLength -lt ($Extension.Length + 1)) {
        throw 'Unable to build a near-limit path for Write-V7FileWithRetry test.'
    }

    $baseLength = $availableLeafLength - $Extension.Length
    $leaf = ('n' * $baseLength) + $Extension
    return Join-Path $dir $leaf
}

if (Test-Path -LiteralPath $workspaceTestRoot) {
    Remove-Item -LiteralPath $workspaceTestRoot -Recurse -Force -ErrorAction SilentlyContinue
}
Ensure-V7Directory -Path $workspaceTestRoot | Out-Null

try {
    Invoke-V7TestCase -Name 'Test-V7HasProperty hashtable existing key' -Action {
        $ht = @{ a = 1 }
        Assert-V7True -Value (Test-V7HasProperty $ht 'a') -Message 'Hashtable key a should exist.'
    }

    Invoke-V7TestCase -Name 'Test-V7HasProperty hashtable missing key' -Action {
        $ht = @{ a = 1 }
        Assert-V7False -Value (Test-V7HasProperty $ht 'b') -Message 'Hashtable key b should not exist.'
    }

    Invoke-V7TestCase -Name 'Test-V7HasProperty PSCustomObject existing property' -Action {
        $pso = [pscustomobject]@{ x = 1 }
        Assert-V7True -Value (Test-V7HasProperty $pso 'x') -Message 'Property x should exist.'
    }

    Invoke-V7TestCase -Name 'Test-V7HasProperty PSCustomObject missing property' -Action {
        $pso = [pscustomobject]@{ x = 1 }
        Assert-V7False -Value (Test-V7HasProperty $pso 'y') -Message 'Property y should not exist.'
    }

    Invoke-V7TestCase -Name 'Test-V7HasProperty OrderedDictionary existing key' -Action {
        $ordered = New-Object System.Collections.Specialized.OrderedDictionary
        $ordered['k1'] = 1
        Assert-V7True -Value (Test-V7HasProperty $ordered 'k1') -Message 'OrderedDictionary key should exist.'
    }

    Invoke-V7TestCase -Name 'Test-V7HasProperty OrderedDictionary missing key' -Action {
        $ordered = New-Object System.Collections.Specialized.OrderedDictionary
        $ordered['k1'] = 1
        Assert-V7False -Value (Test-V7HasProperty $ordered 'k2') -Message 'OrderedDictionary key should not exist.'
    }

    Invoke-V7TestCase -Name 'Test-V7HasProperty null input' -Action {
        Assert-V7False -Value (Test-V7HasProperty $null 'anything') -Message 'Null input should return false.'
    }

    Invoke-V7TestCase -Name 'Test-V7HasProperty nested ConvertFrom-Json object' -Action {
        $nested = '{"outer":{"inner":1}}' | ConvertFrom-Json
        Assert-V7True -Value (Test-V7HasProperty $nested.outer 'inner') -Message 'Nested PSCustomObject property should exist.'
    }

    Invoke-V7TestCase -Name 'Test-V7HasProperty empty hashtable' -Action {
        $empty = @{}
        Assert-V7False -Value (Test-V7HasProperty $empty 'anything') -Message 'Empty hashtable should not contain key.'
    }

    Invoke-V7TestCase -Name 'ConvertTo-V7Slug truncates long values' -Action {
        $slug = ConvertTo-V7Slug -Value ('topic-' + ('x' * 200)) -MaxLength 80
        Assert-V7True -Value ($slug.Length -le 80) -Message 'Slug should be capped at 80 characters.'
    }

    Invoke-V7TestCase -Name 'Test-V7ExitSuccess exit code 0' -Action {
        Assert-V7True -Value (Test-V7ExitSuccess 0) -Message 'Exit code 0 should be successful.'
    }

    Invoke-V7TestCase -Name 'Test-V7ExitSuccess null exit code' -Action {
        Assert-V7True -Value (Test-V7ExitSuccess $null) -Message 'Null exit code should normalize to success.'
    }

    Invoke-V7TestCase -Name 'Test-V7ExitSuccess empty-string exit code' -Action {
        Assert-V7True -Value (Test-V7ExitSuccess '') -Message 'Empty-string exit code should normalize to success.'
    }

    Invoke-V7TestCase -Name 'Test-V7ExitSuccess nonzero exit code' -Action {
        Assert-V7False -Value (Test-V7ExitSuccess 7) -Message 'Nonzero exit code should fail.'
    }

    Invoke-V7TestCase -Name 'Write-V7Json writes BOM-free valid JSON' -Action {
        $jsonPath = Join-Path $workspaceTestRoot 'sample.json'
        Write-V7Json -Path $jsonPath -Data ([ordered]@{ a = 1; nested = [ordered]@{ b = 2 } })
        $bytes = [System.IO.File]::ReadAllBytes($jsonPath)
        $hasBom = $bytes.Length -ge 3 -and $bytes[0] -eq 0xEF -and $bytes[1] -eq 0xBB -and $bytes[2] -eq 0xBF
        Assert-V7False -Value $hasBom -Message 'JSON file should not have a UTF-8 BOM.'
        $roundTrip = Read-V7Json -Path $jsonPath
        Assert-V7Equal -Actual ([int]$roundTrip.a) -Expected 1 -Message 'JSON round-trip should preserve scalar values.'
        Assert-V7Equal -Actual ([int]$roundTrip.nested.b) -Expected 2 -Message 'JSON round-trip should preserve nested values.'
    }

    Invoke-V7TestCase -Name 'Write-V7FileWithRetry handles near MAX_PATH' -Action {
        $targetPath = New-V7NearLimitPath -Root $workspaceTestRoot -Extension '.txt'
        Write-V7FileWithRetry -Path $targetPath -Content 'near limit content'
        Assert-V7True -Value (Test-Path -LiteralPath $targetPath) -Message 'Near-limit file should exist after write.'
        Assert-V7Equal -Actual (Read-V7TextFile -Path $targetPath) -Expected 'near limit content' -Message 'Near-limit file content mismatch.'
    }

    Invoke-V7TestCase -Name 'Invoke-V7Git status succeeds' -Action {
        $result = Invoke-V7Git -RepoRoot $repoRoot -Arguments @('status', '--short') -FailureMessage 'git status failed'
        Assert-V7True -Value ($null -ne $result) -Message 'Invoke-V7Git should return a result object.'
        Assert-V7Equal -Actual ([int]$result.exit_code) -Expected 0 -Message 'git status should exit cleanly.'
    }

    Invoke-V7TestCase -Name 'Invoke-V7Git invalid command throws cleanly' -Action {
        $threw = $false
        try {
            Invoke-V7Git -RepoRoot $repoRoot -Arguments @('not-a-real-command') -FailureMessage 'expected failure' | Out-Null
        } catch {
            $threw = $true
            Assert-V7True -Value ($_.Exception.Message -like 'expected failure*') -Message 'Invoke-V7Git should preserve the failure prefix.'
        }
        Assert-V7True -Value $threw -Message 'Invoke-V7Git should throw on invalid git commands.'
    }

    Invoke-V7TestCase -Name 'New-V7Worktree handles pre-existing branch and Remove-V7Worktree cleans it up' -Action {
        if (Test-Path -LiteralPath $worktreeRepoRoot) {
            Remove-Item -LiteralPath $worktreeRepoRoot -Recurse -Force -ErrorAction SilentlyContinue
        }
        Ensure-V7Directory -Path $worktreeRepoRoot | Out-Null
        Invoke-V7Git -RepoRoot $worktreeRepoRoot -Arguments @('init') -FailureMessage 'Unable to initialize worktree test repo' | Out-Null
        Invoke-V7Git -RepoRoot $worktreeRepoRoot -Arguments @('config', 'user.email', 'v7-worktree-test@example.com') -FailureMessage 'Unable to configure worktree test repo email' | Out-Null
        Invoke-V7Git -RepoRoot $worktreeRepoRoot -Arguments @('config', 'user.name', 'V7 Worktree Test') -FailureMessage 'Unable to configure worktree test repo user' | Out-Null
        Write-V7TextFile -Path (Join-Path $worktreeRepoRoot 'README.md') -Content 'worktree test'
        Invoke-V7Git -RepoRoot $worktreeRepoRoot -Arguments @('add', 'README.md') -FailureMessage 'Unable to stage worktree test file' | Out-Null
        Invoke-V7Git -RepoRoot $worktreeRepoRoot -Arguments @('commit', '-m', 'initial worktree test commit') -FailureMessage 'Unable to commit worktree test file' | Out-Null
        $baseCommit = Get-V7RepoHead -RepoRoot $worktreeRepoRoot
        Invoke-V7Git -RepoRoot $worktreeRepoRoot -Arguments @('branch', $worktreeBranch, $baseCommit) -FailureMessage 'Unable to create pre-existing worktree test branch' | Out-Null
        Assert-V7True -Value (Test-V7BranchExists -RepoRoot $worktreeRepoRoot -BranchName $worktreeBranch) -Message 'The pre-existing branch should exist before New-V7Worktree runs.'
        if (Test-Path -LiteralPath $worktreePath) {
            Remove-Item -LiteralPath $worktreePath -Recurse -Force -ErrorAction SilentlyContinue
        }
        New-V7Worktree -RepoRoot $worktreeRepoRoot -Path $worktreePath -BaseCommit $baseCommit -BranchName $worktreeBranch
        Assert-V7True -Value (Test-Path -LiteralPath $worktreePath) -Message 'Worktree path should be created.'
        Remove-V7Worktree -RepoRoot $worktreeRepoRoot -Path $worktreePath
        Assert-V7False -Value (Test-Path -LiteralPath $worktreePath) -Message 'Worktree path should be removed.'
        if (Test-V7BranchExists -RepoRoot $worktreeRepoRoot -BranchName $worktreeBranch) {
            Remove-V7Branch -RepoRoot $worktreeRepoRoot -BranchName $worktreeBranch
            throw 'Remove-V7Worktree left the test branch behind.'
        }
    }

    Invoke-V7TestCase -Name 'Copy-V7ArtifactsToResults truncates long destination leaf safely' -Action {
        $localRunDir = Ensure-V7Directory -Path $copySourceRoot
        $resultsDir = Join-Path $workspaceTestRoot 'results-root\task-260314-194301-pipeline\worktrees\wt-merge\pages\_ux-discussions'
        $longLeaf = ('a' * 200) + '.md'
        $sourcePath = Join-Path $localRunDir $longLeaf
        Write-V7TextFile -Path $sourcePath -Content 'long file payload'
        $unsafeDestination = Join-Path $resultsDir $longLeaf
        Assert-V7True -Value ($unsafeDestination.Length -gt (Get-V7SafePathLimit)) -Message 'The initial destination should exceed the safe path limit.'
        Copy-V7ArtifactsToResults -LocalRunDir $localRunDir -ResultsDir $resultsDir
        $copiedFiles = @(Get-ChildItem -Path $resultsDir -Recurse -File -ErrorAction Stop)
        Assert-V7Equal -Actual $copiedFiles.Count -Expected 1 -Message 'Exactly one copied file is expected.'
        Assert-V7True -Value ($copiedFiles[0].FullName.Length -le (Get-V7SafePathLimit)) -Message 'Copied file path should stay under the safe path limit.'
        Assert-V7Equal -Actual $copiedFiles[0].Extension -Expected '.md' -Message 'Copied file extension should be preserved.'
        Assert-V7Equal -Actual (Read-V7TextFile -Path $copiedFiles[0].FullName) -Expected 'long file payload' -Message 'Copied file content mismatch.'
    }

    Invoke-V7TestCase -Name 'Get-V7NormalizedExitCode null returns 0' -Action {
        $result = Get-V7NormalizedExitCode $null
        Assert-V7Equal -Actual $result -Expected 0 -Message 'Null exit code should normalize to 0.'
    }

    Invoke-V7TestCase -Name 'Get-V7NormalizedExitCode 0 returns 0' -Action {
        $result = Get-V7NormalizedExitCode 0
        Assert-V7Equal -Actual $result -Expected 0 -Message 'Zero exit code should remain 0.'
    }

    Invoke-V7TestCase -Name 'Get-V7NormalizedExitCode 1 returns 1' -Action {
        $result = Get-V7NormalizedExitCode 1
        Assert-V7Equal -Actual $result -Expected 1 -Message 'Non-zero exit code should be preserved.'
    }

    Invoke-V7TestCase -Name 'Get-V7NormalizedExitCode negative returns negative' -Action {
        $result = Get-V7NormalizedExitCode (-1)
        Assert-V7Equal -Actual $result -Expected (-1) -Message 'Negative exit code should be preserved.'
    }

    Invoke-V7TestCase -Name 'PS 5.1 null-as-int equals 0 (exit code pattern)' -Action {
        # Verifies the underlying PS behavior that makes Get-V7NormalizedExitCode work
        Assert-V7Equal -Actual ($null -as [int]) -Expected 0 -Message '$null -as [int] should be 0 in PS 5.1.'
    }

    Invoke-V7TestCase -Name 'Static analysis no property Contains or ContainsKey usage remains' -Action {
        $containsPattern = '\.Con' + 'tains\(|\.Con' + 'tainsKey\('
        $matches = Select-String -Path (Join-Path $repoRoot 'pipeline/v7/scripts/*.ps1') -Pattern $containsPattern -SimpleMatch:$false | Where-Object { $_.Line -notmatch '^\s*#' }
        Assert-V7Equal -Actual @($matches).Count -Expected 0 -Message 'No live method-based property checks should remain.'
    }

    Invoke-V7TestCase -Name 'Static analysis no BOM-producing UTF8 encoding remains' -Action {
        $encodingPattern = '\[System\.Text\.Encoding\]::UTF8'
        $matches = Select-String -Path (Join-Path $repoRoot 'pipeline/v7/scripts/*.ps1') -Pattern $encodingPattern -SimpleMatch:$false
        Assert-V7Equal -Actual @($matches).Count -Expected 0 -Message 'BOM-producing UTF8 encoding calls should be absent.'
    }
} finally {
    if (Test-V7BranchExists -RepoRoot $worktreeRepoRoot -BranchName $worktreeBranch) {
        try {
            Remove-V7Branch -RepoRoot $worktreeRepoRoot -BranchName $worktreeBranch
        } catch {
        }
    }
    if (Test-Path -LiteralPath $worktreePath) {
        try {
            Remove-V7Worktree -RepoRoot $worktreeRepoRoot -Path $worktreePath
        } catch {
            Remove-Item -LiteralPath $worktreePath -Recurse -Force -ErrorAction SilentlyContinue
        }
    }
    if (Test-Path -LiteralPath $worktreeRepoRoot) {
        Remove-Item -LiteralPath $worktreeRepoRoot -Recurse -Force -ErrorAction SilentlyContinue
    }
    if (Test-Path -LiteralPath $copySourceRoot) {
        Remove-Item -LiteralPath $copySourceRoot -Recurse -Force -ErrorAction SilentlyContinue
    }
}

if ($script:V7TestFailures.Count -gt 0) {
    Write-Host ('TOTAL FAILURES: ' + $script:V7TestFailures.Count)
    exit 1
}

Write-Host 'ALL TESTS PASSED'
exit 0
