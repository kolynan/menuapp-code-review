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
        [hashtable]$Base,
        [hashtable]$Override
    )

    foreach ($key in $Override.Keys) {
        $overrideValue = $Override[$key]
        if ($Base.ContainsKey($key) -and $Base[$key] -is [hashtable] -and $overrideValue -is [hashtable]) {
            Merge-V7Hashtable -Base $Base[$key] -Override $overrideValue
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
        $raw = Get-Content -LiteralPath $ConfigPath -Raw -Encoding UTF8 | ConvertFrom-Json
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
    [System.IO.File]::WriteAllText($Path, $json, [System.Text.Encoding]::UTF8)
}

function Read-V7Json {
    param([Parameter(Mandatory = $true)][string]$Path)

    if (-not (Test-Path -LiteralPath $Path)) {
        return $null
    }
    return Get-Content -LiteralPath $Path -Raw -Encoding UTF8 | ConvertFrom-Json
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
    Add-Content -LiteralPath $EventsPath -Value $line -Encoding UTF8
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

    $content = Get-Content -LiteralPath $TaskFile -Raw -Encoding UTF8
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

    if ($Metadata.ContainsKey("images")) {
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

function Get-V7RepoHead {
    param([Parameter(Mandatory = $true)][string]$RepoRoot)
    return (git -C $RepoRoot rev-parse HEAD).Trim()
}

function New-V7Worktree {
    param(
        [Parameter(Mandatory = $true)][string]$RepoRoot,
        [Parameter(Mandatory = $true)][string]$Path,
        [Parameter(Mandatory = $true)][string]$BaseCommit,
        [string]$BranchName
    )

    if (Test-Path -LiteralPath $Path) {
        return
    }
    $parent = Split-Path -Parent $Path
    if ($parent) {
        Ensure-V7Directory -Path $parent | Out-Null
    }
    if ($BranchName) {
        & git -C $RepoRoot worktree add $Path -b $BranchName $BaseCommit | Out-Null
    } else {
        & git -C $RepoRoot worktree add --detach $Path $BaseCommit | Out-Null
    }
}

function Remove-V7Worktree {
    param(
        [Parameter(Mandatory = $true)][string]$RepoRoot,
        [Parameter(Mandatory = $true)][string]$Path
    )

    if (Test-Path -LiteralPath $Path) {
        try {
            & git -C $RepoRoot worktree remove --force $Path | Out-Null
        } catch {
        }
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

    Push-Location $WorkingDirectory
    try {
        $prefixArgs = @()
        if ($CommandPrefix.Length -gt 1) {
            $prefixArgs = $CommandPrefix[1..($CommandPrefix.Length - 1)]
        }
        if ($InputText) {
            $InputText | & $CommandPrefix[0] @prefixArgs @Arguments 1> $StdOutPath 2> $StdErrPath
        } else {
            & $CommandPrefix[0] @prefixArgs @Arguments 1> $StdOutPath 2> $StdErrPath
        }
        return $LASTEXITCODE
    } finally {
        Pop-Location
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

function Send-V7Telegram {
    param(
        [Parameter(Mandatory = $true)][hashtable]$Config,
        [Parameter(Mandatory = $true)][string]$Text
    )

    $token = $Config.telegram.bot_token
    $chatId = $Config.telegram.chat_id
    if ([string]::IsNullOrWhiteSpace($token) -or [string]::IsNullOrWhiteSpace($chatId)) {
        return $false
    }

    $uri = "https://api.telegram.org/bot$token/sendMessage"
    $body = @{ chat_id = $chatId; text = $Text } | ConvertTo-Json

    try {
        Invoke-RestMethod -Uri $uri -Method Post -ContentType "application/json" -Body $body | Out-Null
        return $true
    } catch {
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
