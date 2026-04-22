Set-StrictMode -Version 2
$ErrorActionPreference = "Stop"

function Get-V7DefaultConfig {
    return [ordered]@{
        paths = [ordered]@{
            onedrive_root = "C:\Users\ASUS\OneDrive\002 Menu\Claude AI Cowork"
            repo_dir = "C:\Dev\menuapp-code-review"
            claude_cli = "C:\Users\ASUS\AppData\Roaming\npm\claude"
            codex_cli = "codex"
            powershell_exe = "$env:SystemRoot\System32\WindowsPowerShell\v1.0\powershell.exe"
        }
        telegram = [ordered]@{
            bot_token = ""
            chat_id = "165692508"
        }
        watcher = [ordered]@{
            poll_interval = 5
            supervisor_timeout_minutes = 180
        }
        pipeline = [ordered]@{
            local_run_root = "C:\Dev\menuapp-code-review\.pipeline\runs"
            queue_dir = "pipeline\queue"
            results_dir = "pipeline\results"
            auto_reconcile = $true
            code_review_timeout_minutes = 90
            ux_discussion_timeout_minutes = 60
        }
    }
}

function Merge-V7Hashtable {
    param(
        [System.Collections.IDictionary]$Base,
        [System.Collections.IDictionary]$Override
    )

    foreach ($key in $Override.Keys) {
        $overrideValue = $Override[$key]
        $baseValue = $Base[$key]
        if ($Base.Contains($key) -and $baseValue -is [System.Collections.IDictionary] -and $overrideValue -is [System.Collections.IDictionary]) {
            Merge-V7Hashtable -Base $baseValue -Override $overrideValue
            continue
        }
        $Base[$key] = $overrideValue
    }
}

function ConvertTo-V7Hashtable {
    param([Parameter(Mandatory = $true)]$InputObject)

    if ($null -eq $InputObject) {
        return @{}
    }
    if ($InputObject -is [hashtable]) {
        return $InputObject
    }

    $hash = @{}
    foreach ($property in $InputObject.PSObject.Properties) {
        $value = $property.Value
        if ($value -is [pscustomobject]) {
            $hash[$property.Name] = ConvertTo-V7Hashtable -InputObject $value
        } else {
            $hash[$property.Name] = $value
        }
    }
    return $hash
}

function Get-V7Config {
    param([string]$ConfigPath)

    $config = Get-V7DefaultConfig
    if ($ConfigPath -and (Test-Path -LiteralPath $ConfigPath)) {
        $raw = (Read-V7TextFile -Path $ConfigPath) | ConvertFrom-Json
        $override = ConvertTo-V7Hashtable -InputObject $raw
        Merge-V7Hashtable -Base $config -Override $override
    }
    return $config
}

function Ensure-V7Directory {
    param([Parameter(Mandatory = $true)][string]$Path)

    if (-not (Test-Path -LiteralPath $Path)) {
        New-Item -ItemType Directory -Path $Path -Force | Out-Null
    }
    return (Resolve-Path -LiteralPath $Path).Path
}

function Get-V7Timestamp {
    return (Get-Date).ToString("yyyy-MM-ddTHH:mm:ssK")
}

function ConvertTo-V7Slug {
    param([string]$Value)

    if ([string]::IsNullOrWhiteSpace($Value)) {
        return "task"
    }

    $slug = $Value.ToLowerInvariant()
    $slug = [regex]::Replace($slug, "[^a-z0-9]+", "-")
    $slug = $slug.Trim("-")
    if ([string]::IsNullOrWhiteSpace($slug)) {
        return "task"
    }
    return $slug
}

function Get-V7Utf8NoBomEncoding {
    return [System.Text.UTF8Encoding]::new($false)
}

function Write-V7TextFile {
    param(
        [Parameter(Mandatory = $true)][string]$Path,
        [Parameter(Mandatory = $true)][AllowEmptyString()][string]$Content
    )

    $parent = Split-Path -Parent $Path
    if ($parent) {
        Ensure-V7Directory -Path $parent | Out-Null
    }

    [System.IO.File]::WriteAllText($Path, $Content, (Get-V7Utf8NoBomEncoding))
}

function Append-V7TextFile {
    param(
        [Parameter(Mandatory = $true)][string]$Path,
        [Parameter(Mandatory = $true)][AllowEmptyString()][string]$Content
    )

    $parent = Split-Path -Parent $Path
    if ($parent) {
        Ensure-V7Directory -Path $parent | Out-Null
    }

    $writer = New-Object System.IO.StreamWriter($Path, $true, (Get-V7Utf8NoBomEncoding))
    try {
        $writer.Write($Content)
    } finally {
        $writer.Dispose()
    }
}

function Write-V7Json {
    param(
        [Parameter(Mandatory = $true)][string]$Path,
        [Parameter(Mandatory = $true)]$Data
    )

    $parent = Split-Path -Parent $Path
    if ($parent) {
        Ensure-V7Directory -Path $parent | Out-Null
    }
    $json = $Data | ConvertTo-Json -Depth 12
    Write-V7TextFile -Path $Path -Content $json
}

function Read-V7TextFile {
    param([Parameter(Mandatory = $true)][string]$Path)

    $reader = New-Object System.IO.StreamReader($Path, $true)
    try {
        return $reader.ReadToEnd()
    } finally {
        $reader.Dispose()
    }
}

function Read-V7Json {
    param([Parameter(Mandatory = $true)][string]$Path)

    if (-not (Test-Path -LiteralPath $Path)) {
        return $null
    }
    return (Read-V7TextFile -Path $Path) | ConvertFrom-Json
}

function Add-V7Event {
    param(
        [Parameter(Mandatory = $true)][string]$EventsPath,
        [Parameter(Mandatory = $true)][string]$State,
        [Parameter(Mandatory = $true)][string]$Message,
        $Data
    )

    $entry = [ordered]@{
        timestamp = Get-V7Timestamp
        state = $State
        message = $Message
    }
    if ($null -ne $Data) {
        $entry.data = $Data
    }
    $line = $entry | ConvertTo-Json -Compress -Depth 10
    Append-V7TextFile -Path $EventsPath -Content ($line + [Environment]::NewLine)
}

function Set-V7Status {
    param(
        [Parameter(Mandatory = $true)][string]$StatusPath,
        [Parameter(Mandatory = $true)][hashtable]$Status
    )

    $Status.updated_at = Get-V7Timestamp
    Write-V7Json -Path $StatusPath -Data $Status
}

function Get-V7TaskParts {
    param([Parameter(Mandatory = $true)][string]$TaskFile)

    $content = Read-V7TextFile -Path $TaskFile
    $meta = [ordered]@{}
    $body = $content

    if ($content.StartsWith("---")) {
        $match = [regex]::Match($content, "^(---\r?\n)(.*?)(\r?\n---\r?\n?)", [System.Text.RegularExpressions.RegexOptions]::Singleline)
        if ($match.Success) {
            $frontmatter = $match.Groups[2].Value
            $body = $content.Substring($match.Length)
            foreach ($line in ($frontmatter -split "`r?`n")) {
                $trimmed = $line.Trim()
                if (-not $trimmed -or $trimmed.StartsWith("#") -or -not $trimmed.Contains(":")) {
                    continue
                }
                $parts = $trimmed.Split(":", 2)
                $key = $parts[0].Trim()
                $value = $parts[1].Trim().Trim("'").Trim('"')
                $meta[$key] = $value
            }
        }
    }

    return [ordered]@{
        metadata = $meta
        body = $body.Trim()
        raw = $content
    }
}

function Resolve-V7Path {
    param(
        [Parameter(Mandatory = $true)][string]$BasePath,
        [Parameter(Mandatory = $true)][string]$Candidate
    )

    if ([string]::IsNullOrWhiteSpace($Candidate)) {
        return $null
    }
    if ([System.IO.Path]::IsPathRooted($Candidate)) {
        if (Test-Path -LiteralPath $Candidate) {
            return (Resolve-Path -LiteralPath $Candidate).Path
        }
        return $null
    }

    $combined = Join-Path $BasePath $Candidate
    if (Test-Path -LiteralPath $combined) {
        return (Resolve-Path -LiteralPath $combined).Path
    }
    return $null
}

function Get-V7TaskImages {
    param(
        [Parameter(Mandatory = $true)][string]$TaskDir,
        [Parameter(Mandatory = $true)][hashtable]$Metadata,
        [Parameter(Mandatory = $true)][string]$Body
    )

    $images = New-Object System.Collections.Generic.List[string]
    $extensions = @("*.png", "*.jpg", "*.jpeg", "*.webp")

    foreach ($ext in $extensions) {
        foreach ($file in Get-ChildItem -Path $TaskDir -Filter $ext -File -Recurse -ErrorAction SilentlyContinue) {
            $images.Add($file.FullName)
        }
    }

    if ($Metadata.Contains("images")) {
        foreach ($item in ($Metadata["images"] -split ",")) {
            $resolved = Resolve-V7Path -BasePath $TaskDir -Candidate $item.Trim()
            if ($resolved) {
                $images.Add($resolved)
            }
        }
    }

    $patterns = @(
        '([A-Za-z]:\\[^\r\n]+\.(png|jpg|jpeg|webp))',
        '!\\[[^\\]]*\\]\\(([^)]+\\.(png|jpg|jpeg|webp))\\)'
    )

    foreach ($pattern in $patterns) {
        foreach ($match in [regex]::Matches($Body, $pattern, [System.Text.RegularExpressions.RegexOptions]::IgnoreCase)) {
            $candidate = $match.Groups[1].Value
            $resolved = Resolve-V7Path -BasePath $TaskDir -Candidate $candidate
            if ($resolved) {
                $images.Add($resolved)
            }
        }
    }

    return $images | Sort-Object -Unique
}

function Invoke-V7CapturedCommand {
    param(
        [Parameter(Mandatory = $true)][string[]]$CommandPrefix,
        [Parameter(Mandatory = $true)][string[]]$Arguments,
        [Parameter(Mandatory = $true)][string]$WorkingDirectory,
        [string]$InputText
    )

    $tempRoot = Join-Path ([System.IO.Path]::GetTempPath()) ("v7-cmd-" + [guid]::NewGuid().ToString("N"))
    Ensure-V7Directory -Path $tempRoot | Out-Null
    $stdoutPath = Join-Path $tempRoot 'stdout.log'
    $stderrPath = Join-Path $tempRoot 'stderr.log'

    try {
        $exitCode = Invoke-V7CommandToFiles -CommandPrefix $CommandPrefix -Arguments $Arguments -WorkingDirectory $WorkingDirectory -StdOutPath $stdoutPath -StdErrPath $stderrPath -InputText $InputText
        $stdout = if (Test-Path -LiteralPath $stdoutPath) { (Read-V7TextFile -Path $stdoutPath).TrimEnd([char[]]"`r`n") } else { '' }
        $stderr = if (Test-Path -LiteralPath $stderrPath) { (Read-V7TextFile -Path $stderrPath).TrimEnd([char[]]"`r`n") } else { '' }

        return [ordered]@{
            exit_code = $exitCode
            stdout = $stdout
            stderr = $stderr
        }
    } finally {
        if (Test-Path -LiteralPath $tempRoot) {
            Remove-Item -LiteralPath $tempRoot -Recurse -Force -ErrorAction SilentlyContinue
        }
    }
}

function Invoke-V7Git {
    param(
        [Parameter(Mandatory = $true)][string]$RepoRoot,
        [Parameter(Mandatory = $true)][string[]]$Arguments,
        [string]$FailureMessage = 'Git command failed'
    )

    $result = Invoke-V7CapturedCommand -CommandPrefix @('git') -Arguments (@('-C', $RepoRoot) + $Arguments) -WorkingDirectory $RepoRoot
    if ($result.exit_code -ne 0) {
        $details = @()
        if (-not [string]::IsNullOrWhiteSpace([string]$result.stderr)) {
            $details += [string]$result.stderr
        }
        if (-not [string]::IsNullOrWhiteSpace([string]$result.stdout)) {
            $details += [string]$result.stdout
        }
        $suffix = if ($details.Count -gt 0) { ': ' + (($details -join [Environment]::NewLine).Trim()) } else { '' }
        throw ($FailureMessage + $suffix)
    }
    return $result
}

function Get-V7ChangedFiles {
    param(
        [Parameter(Mandatory = $true)][string]$RepoRoot,
        [string]$BaseCommit,
        [string]$HeadRef = 'HEAD'
    )

    if ([string]::IsNullOrWhiteSpace([string]$BaseCommit)) {
        return @()
    }

    $result = Invoke-V7Git -RepoRoot $RepoRoot -Arguments @('diff', '--name-only', "$BaseCommit..$HeadRef") -FailureMessage 'Unable to list changed files'
    if ([string]::IsNullOrWhiteSpace([string]$result.stdout)) {
        return @()
    }

    return @(
        ($result.stdout -split "`r?`n") |
            Where-Object { -not [string]::IsNullOrWhiteSpace([string]$_) }
    )
}
function Get-V7NormalizedPath {
    param([string]$Path)

    if ([string]::IsNullOrWhiteSpace($Path)) {
        return ''
    }

    try {
        return ([System.IO.Path]::GetFullPath($Path)).TrimEnd([char[]]'\/').ToLowerInvariant()
    } catch {
        return $Path.TrimEnd([char[]]'\/').ToLowerInvariant()
    }
}

function Get-V7WorktreeRecords {
    param([Parameter(Mandatory = $true)][string]$RepoRoot)

    $result = Invoke-V7Git -RepoRoot $RepoRoot -Arguments @('worktree', 'list', '--porcelain') -FailureMessage 'Unable to list worktrees'
    $records = @()
    $lines = @()
    if (-not [string]::IsNullOrWhiteSpace([string]$result.stdout)) {
        $lines += ($result.stdout -split "`r?`n")
    }
    $lines += ''

    $current = $null
    foreach ($line in $lines) {
        if ([string]::IsNullOrWhiteSpace([string]$line)) {
            if ($null -ne $current) {
                $records += [pscustomobject]$current
                $current = $null
            }
            continue
        }

        if ($line.StartsWith('worktree ')) {
            if ($null -ne $current) {
                $records += [pscustomobject]$current
            }
            $current = [ordered]@{
                path = $line.Substring(9)
                branch = ''
                head = ''
                detached = $false
                locked = $false
            }
            continue
        }

        if ($null -eq $current) {
            continue
        }

        if ($line.StartsWith('branch ')) {
            $branchRef = $line.Substring(7)
            $current.branch = $branchRef -replace '^refs/heads/', ''
        } elseif ($line.StartsWith('HEAD ')) {
            $current.head = $line.Substring(5)
        } elseif ($line -eq 'detached') {
            $current.detached = $true
        } elseif ($line.StartsWith('locked')) {
            $current.locked = $true
        }
    }

    return @($records)
}

function Get-V7WorktreeRecordByPath {
    param(
        [Parameter(Mandatory = $true)][string]$RepoRoot,
        [Parameter(Mandatory = $true)][string]$Path
    )

    $target = Get-V7NormalizedPath -Path $Path
    foreach ($record in (Get-V7WorktreeRecords -RepoRoot $RepoRoot)) {
        if ((Get-V7NormalizedPath -Path $record.path) -eq $target) {
            return $record
        }
    }
    return $null
}

function Get-V7WorktreeRecordByBranch {
    param(
        [Parameter(Mandatory = $true)][string]$RepoRoot,
        [Parameter(Mandatory = $true)][string]$BranchName
    )

    foreach ($record in (Get-V7WorktreeRecords -RepoRoot $RepoRoot)) {
        if (-not [string]::IsNullOrWhiteSpace([string]$record.branch) -and $record.branch -ieq $BranchName) {
            return $record
        }
    }
    return $null
}

function Test-V7BranchExists {
    param(
        [Parameter(Mandatory = $true)][string]$RepoRoot,
        [Parameter(Mandatory = $true)][string]$BranchName
    )

    if ([string]::IsNullOrWhiteSpace($BranchName)) {
        return $false
    }

    $result = Invoke-V7CapturedCommand -CommandPrefix @('git') -Arguments @('-C', $RepoRoot, 'show-ref', '--verify', '--quiet', ('refs/heads/' + $BranchName)) -WorkingDirectory $RepoRoot
    return $result.exit_code -eq 0
}

function Remove-V7Branch {
    param(
        [Parameter(Mandatory = $true)][string]$RepoRoot,
        [Parameter(Mandatory = $true)][string]$BranchName
    )

    if (-not (Test-V7BranchExists -RepoRoot $RepoRoot -BranchName $BranchName)) {
        return
    }

    $result = Invoke-V7CapturedCommand -CommandPrefix @('git') -Arguments @('-C', $RepoRoot, 'branch', '-D', $BranchName) -WorkingDirectory $RepoRoot
    if ($result.exit_code -ne 0) {
        $details = @($result.stderr, $result.stdout) | Where-Object { -not [string]::IsNullOrWhiteSpace([string]$_) }
        $suffix = if ($details.Count -gt 0) { ': ' + (($details -join [Environment]::NewLine).Trim()) } else { '' }
        throw ('Unable to delete existing branch ' + $BranchName + $suffix)
    }
}

function Get-V7RepoHead {
    param([Parameter(Mandatory = $true)][string]$RepoRoot)
    return (Invoke-V7Git -RepoRoot $RepoRoot -Arguments @('rev-parse', 'HEAD') -FailureMessage 'Unable to resolve repository HEAD').stdout.Trim()
}

function New-V7Worktree {
    param(
        [Parameter(Mandatory = $true)][string]$RepoRoot,
        [Parameter(Mandatory = $true)][string]$Path,
        [Parameter(Mandatory = $true)][string]$BaseCommit,
        [string]$BranchName
    )

    $normalizedPath = Get-V7NormalizedPath -Path $Path
    $existingPathRecord = Get-V7WorktreeRecordByPath -RepoRoot $RepoRoot -Path $Path
    if ($existingPathRecord) {
        Remove-V7Worktree -RepoRoot $RepoRoot -Path $existingPathRecord.path
    }

    if ($BranchName) {
        $existingBranchRecord = Get-V7WorktreeRecordByBranch -RepoRoot $RepoRoot -BranchName $BranchName
        if ($existingBranchRecord -and ((Get-V7NormalizedPath -Path $existingBranchRecord.path) -ne $normalizedPath)) {
            Remove-V7Worktree -RepoRoot $RepoRoot -Path $existingBranchRecord.path
        }
        if (Test-V7BranchExists -RepoRoot $RepoRoot -BranchName $BranchName) {
            Remove-V7Branch -RepoRoot $RepoRoot -BranchName $BranchName
        }
    }

    if (Test-Path -LiteralPath $Path) {
        Remove-Item -LiteralPath $Path -Recurse -Force -ErrorAction SilentlyContinue
    }

    $parent = Split-Path -Parent $Path
    if ($parent) {
        Ensure-V7Directory -Path $parent | Out-Null
    }

    if ($BranchName) {
        Invoke-V7Git -RepoRoot $RepoRoot -Arguments @('worktree', 'add', '--force', '-B', $BranchName, $Path, $BaseCommit) -FailureMessage 'Unable to create worktree' | Out-Null
    } else {
        Invoke-V7Git -RepoRoot $RepoRoot -Arguments @('worktree', 'add', '--force', '--detach', $Path, $BaseCommit) -FailureMessage 'Unable to create detached worktree' | Out-Null
    }
}

function Remove-V7Worktree {
    param(
        [Parameter(Mandatory = $true)][string]$RepoRoot,
        [Parameter(Mandatory = $true)][string]$Path
    )

    $record = Get-V7WorktreeRecordByPath -RepoRoot $RepoRoot -Path $Path
    $removePath = if ($record) { [string]$record.path } else { $Path }
    $branchName = if ($record -and -not [string]::IsNullOrWhiteSpace([string]$record.branch)) { [string]$record.branch } else { '' }

    $shouldAttemptRemove = $record -or (Test-Path -LiteralPath $removePath)
    if ($shouldAttemptRemove) {
        $result = Invoke-V7CapturedCommand -CommandPrefix @('git') -Arguments @('-C', $RepoRoot, 'worktree', 'remove', '--force', $removePath) -WorkingDirectory $RepoRoot
        if ($result.exit_code -ne 0) {
            $details = @($result.stderr, $result.stdout) | Where-Object { -not [string]::IsNullOrWhiteSpace([string]$_) }
            $suffix = if ($details.Count -gt 0) { ': ' + (($details -join [Environment]::NewLine).Trim()) } else { '' }
            throw ('Unable to remove worktree ' + $removePath + $suffix)
        }
    }

    if (Test-Path -LiteralPath $removePath) {
        Remove-Item -LiteralPath $removePath -Recurse -Force -ErrorAction SilentlyContinue
    }

    if (-not [string]::IsNullOrWhiteSpace($branchName) -and $branchName.StartsWith('task/')) {
        Remove-V7Branch -RepoRoot $RepoRoot -BranchName $branchName
    }
}

function Stop-V7ProcessTree {
    param([int]$ProcessId)

    if ($ProcessId -le 0) {
        return
    }

    if ($env:OS -like "*Windows*") {
        Start-Process -FilePath "taskkill.exe" -ArgumentList @("/PID", $ProcessId, "/T", "/F") -NoNewWindow -Wait | Out-Null
        return
    }

    try {
        Stop-Process -Id $ProcessId -Force -ErrorAction Stop
    } catch {
    }
}

function Get-V7ClaudeCommandPrefix {
    param([Parameter(Mandatory = $true)][string]$RawPath)

    $path = [System.IO.Path]::GetFullPath($RawPath)
    $nodeModulesCli = Join-Path (Split-Path $path -Parent) "node_modules\@anthropic-ai\claude-code\cli.js"
    $nodeExe = Join-Path (Split-Path $path -Parent) "node.exe"

    if (Test-Path -LiteralPath $nodeModulesCli) {
        if (Test-Path -LiteralPath $nodeExe) {
            return @($nodeExe, $nodeModulesCli)
        }
        $nodeCmd = (Get-Command node -ErrorAction SilentlyContinue | Select-Object -First 1).Source
        if ($nodeCmd) {
            return @($nodeCmd, $nodeModulesCli)
        }
    }

    $cmdPath = "$path.cmd"
    if (Test-Path -LiteralPath $cmdPath) {
        return @($cmdPath)
    }

    if (Test-Path -LiteralPath $path) {
        return @($path)
    }

    return @($RawPath)
}

function ConvertTo-V7ProcessArgument {
    param([AllowEmptyString()][string]$Value)

    if ($null -eq $Value) {
        $Value = ''
    }
    if ($Value.Length -eq 0) {
        return '""'
    }
    if ($Value -notmatch '[\s"]') {
        return $Value
    }

    $escaped = $Value -replace '(\\*)"', '$1$1\"'
    $escaped = $escaped -replace '(\\+)$', '$1$1'
    return '"' + $escaped + '"'
}

function Invoke-V7CommandToFiles {
    param(
        [Parameter(Mandatory = $true)][string[]]$CommandPrefix,
        [Parameter(Mandatory = $true)][string[]]$Arguments,
        [Parameter(Mandatory = $true)][string]$WorkingDirectory,
        [Parameter(Mandatory = $true)][string]$StdOutPath,
        [Parameter(Mandatory = $true)][string]$StdErrPath,
        [string]$InputText
    )

    $parentOut = Split-Path -Parent $StdOutPath
    $parentErr = Split-Path -Parent $StdErrPath
    if ($parentOut) { Ensure-V7Directory -Path $parentOut | Out-Null }
    if ($parentErr) { Ensure-V7Directory -Path $parentErr | Out-Null }

    Write-V7TextFile -Path $StdOutPath -Content ''
    Write-V7TextFile -Path $StdErrPath -Content ''

    $allArguments = @()
    if ($CommandPrefix.Length -gt 1) {
        $allArguments += $CommandPrefix[1..($CommandPrefix.Length - 1)]
    }
    $allArguments += $Arguments
    $argumentString = (@($allArguments | ForEach-Object { ConvertTo-V7ProcessArgument -Value ([string]$_) }) -join ' ')

    $psi = New-Object System.Diagnostics.ProcessStartInfo
    $psi.FileName = $CommandPrefix[0]
    $psi.Arguments = $argumentString
    $psi.WorkingDirectory = $WorkingDirectory
    $psi.UseShellExecute = $false
    $psi.CreateNoWindow = $true
    $psi.RedirectStandardOutput = $true
    $psi.RedirectStandardError = $true

    $hasInput = $PSBoundParameters.ContainsKey('InputText') -and $null -ne $InputText
    $psi.RedirectStandardInput = $hasInput

    $process = New-Object System.Diagnostics.Process
    $process.StartInfo = $psi

    try {
        if (-not $process.Start()) {
            throw 'Failed to start external command process.'
        }

        $stdoutTask = $process.StandardOutput.ReadToEndAsync()
        $stderrTask = $process.StandardError.ReadToEndAsync()

        if ($hasInput) {
            $process.StandardInput.Write($InputText)
            $process.StandardInput.Close()
        }

        $process.WaitForExit()
        $stdout = $stdoutTask.GetAwaiter().GetResult()
        $stderr = $stderrTask.GetAwaiter().GetResult()

        Write-V7TextFile -Path $StdOutPath -Content $stdout
        Write-V7TextFile -Path $StdErrPath -Content $stderr
        return $process.ExitCode
    } finally {
        $process.Dispose()
    }
}

function Get-V7ResultsRoot {
    param([hashtable]$Config)
    return Ensure-V7Directory -Path (Join-Path $Config.paths.onedrive_root $Config.pipeline.results_dir)
}

function Get-V7QueueRoot {
    param([hashtable]$Config)
    return Ensure-V7Directory -Path (Join-Path $Config.paths.onedrive_root $Config.pipeline.queue_dir)
}

function Copy-V7ArtifactsToResults {
    param(
        [Parameter(Mandatory = $true)][string]$LocalRunDir,
        [Parameter(Mandatory = $true)][string]$ResultsDir
    )

    Ensure-V7Directory -Path $ResultsDir | Out-Null
    foreach ($item in Get-ChildItem -Path $LocalRunDir -Recurse -File -ErrorAction SilentlyContinue) {
        $relative = $item.FullName.Substring($LocalRunDir.Length).TrimStart("\\")
        $destination = Join-Path $ResultsDir $relative
        $destinationParent = Split-Path -Parent $destination
        if ($destinationParent) {
            Ensure-V7Directory -Path $destinationParent | Out-Null
        }
        Copy-Item -LiteralPath $item.FullName -Destination $destination -Force
    }
}

function Move-V7QueueRunDir {
    param(
        [Parameter(Mandatory = $true)][string]$QueueRunDir,
        [Parameter(Mandatory = $true)][string]$State
    )

    $queueRoot = Split-Path -Parent (Split-Path -Parent $QueueRunDir)
    if (-not $queueRoot) {
        return $QueueRunDir
    }
    $targetRoot = Ensure-V7Directory -Path (Join-Path $queueRoot $State)
    $destination = Join-Path $targetRoot (Split-Path -Leaf $QueueRunDir)
    if (Test-Path -LiteralPath $destination) {
        Remove-Item -LiteralPath $destination -Recurse -Force
    }
    Move-Item -LiteralPath $QueueRunDir -Destination $destination
    return $destination
}

function Get-V7TelegramDiagnosticsPath {
    param(
        [string]$EventsPath,
        [string]$DiagnosticsPath
    )

    if ($DiagnosticsPath) {
        return $DiagnosticsPath
    }
    if ($EventsPath) {
        return Join-Path (Split-Path -Parent $EventsPath) 'telegram-error.log'
    }
    return ''
}

function Write-V7TelegramDiagnostic {
    param(
        [string]$EventsPath,
        [string]$DiagnosticsPath,
        [string]$Text,
        [string]$Message,
        [string]$Uri,
        $ErrorRecord
    )

    $path = Get-V7TelegramDiagnosticsPath -EventsPath $EventsPath -DiagnosticsPath $DiagnosticsPath
    if ([string]::IsNullOrWhiteSpace($path)) {
        return
    }

    $parent = Split-Path -Parent $path
    if ($parent) {
        Ensure-V7Directory -Path $parent | Out-Null
    }

    $responseBody = ''
    if ($ErrorRecord -and $ErrorRecord.Exception -and $ErrorRecord.Exception.Response) {
        try {
            $stream = $ErrorRecord.Exception.Response.GetResponseStream()
            if ($stream) {
                $reader = New-Object System.IO.StreamReader($stream)
                $responseBody = $reader.ReadToEnd()
                $reader.Dispose()
            }
        } catch {
        }
    }

    $lines = @(
        ('timestamp: ' + (Get-V7Timestamp)),
        ('message: ' + $Message),
        ('uri: ' + $Uri),
        ('text: ' + $Text)
    )
    if ($ErrorRecord) {
        $lines += @(
            ('exception: ' + $ErrorRecord.Exception.Message),
            ('script_stack_trace: ' + $ErrorRecord.ScriptStackTrace),
            'error_record:',
            ($ErrorRecord | Out-String).TrimEnd()
        )
    }
    if ($responseBody) {
        $lines += @('response:', $responseBody)
    }
    $lines += ''

    Append-V7TextFile -Path $path -Content (($lines -join "`n") + "`n")
}

function Send-V7Telegram {
    param(
        [Parameter(Mandatory = $true)][hashtable]$Config,
        [Parameter(Mandatory = $true)][string]$Text,
        [string]$EventsPath,
        [string]$DiagnosticsPath
    )

    $token = $Config.telegram.bot_token
    $chatId = $Config.telegram.chat_id
    $uri = if ([string]::IsNullOrWhiteSpace($token)) { 'https://api.telegram.org/bot<missing>/sendMessage' } else { "https://api.telegram.org/bot$token/sendMessage" }
    if ([string]::IsNullOrWhiteSpace($token) -or [string]::IsNullOrWhiteSpace($chatId)) {
        Write-V7TelegramDiagnostic -EventsPath $EventsPath -DiagnosticsPath $DiagnosticsPath -Text $Text -Message 'Telegram credentials missing' -Uri $uri -ErrorRecord $null
        return $false
    }

    $body = @{ chat_id = $chatId; text = $Text } | ConvertTo-Json
    [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

    try {
        Invoke-RestMethod -Uri $uri -Method Post -ContentType "application/json" -Body $body | Out-Null
        return $true
    } catch {
        Write-V7TelegramDiagnostic -EventsPath $EventsPath -DiagnosticsPath $DiagnosticsPath -Text $Text -Message 'Invoke-RestMethod failed while sending Telegram message' -Uri $uri -ErrorRecord $_
        return $false
    }
}
function New-V7StatusObject {
    param(
        [Parameter(Mandatory = $true)][string]$TaskId,
        [Parameter(Mandatory = $true)][string]$Workflow,
        [Parameter(Mandatory = $true)][string]$QueueRunDir,
        [Parameter(Mandatory = $true)][string]$LocalRunDir,
        [Parameter(Mandatory = $true)]$Metadata
    )

    return [ordered]@{
        task_id = $TaskId
        workflow = $Workflow
        state = "CLAIMED"
        current_step = "claimed"
        started_at = Get-V7Timestamp
        updated_at = Get-V7Timestamp
        page = $Metadata.page
        topic = $Metadata.topic
        budget = [ordered]@{
            requested = $Metadata.budget
            cc_reported = $null
            codex_reported = $null
        }
        paths = [ordered]@{
            queue_run_dir = $QueueRunDir
            local_run_dir = $LocalRunDir
        }
        processes = [ordered]@{}
        artifacts = [ordered]@{}
        git = [ordered]@{
            base_commit = $null
            merge_commit = $null
            writer_commit = $null
        }
    }
}
