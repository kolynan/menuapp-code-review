param(
    [Parameter(Mandatory = $true)][string]$TaskJsonPath
)

$commonPath = Join-Path $PSScriptRoot 'V7.Common.ps1'
. $commonPath
$task = Read-V7Json -Path $TaskJsonPath
if (@('code-review', 'parallel-write') -contains [string]$task.workflow) {
    Remove-V7Worktree -RepoRoot $task.paths.repo_root -Path $task.paths.writer_worktree
    Remove-V7Worktree -RepoRoot $task.paths.repo_root -Path $task.paths.review_worktree
    Remove-V7Worktree -RepoRoot $task.paths.repo_root -Path $task.paths.merge_worktree
}
