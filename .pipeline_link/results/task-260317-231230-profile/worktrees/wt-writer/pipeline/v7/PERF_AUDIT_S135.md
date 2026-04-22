# Pipeline V7 Performance Audit (S135)

## Scope

Reviewed all scripts in `pipeline/v7/scripts/`, with primary focus on:

- `Invoke-CodexReviewer.ps1`
- `Invoke-CodexWriter.ps1`
- `Start-TaskSupervisor.ps1`
- `V7.Common.ps1`

I also sampled recent reviewer artifacts under `.pipeline/runs/` to estimate where wall-clock time is actually going. No code changes were made as part of this audit.

## Current Timing Breakdown

Key script observations:

- `Invoke-CodexReviewer.ps1` builds a very small prompt (`lines 102-122`) and then runs:
  `codex exec -C $worktree --full-auto --json -o $resultPath --output-schema $schemaPath -`
  (`lines 152-158`)
- `Invoke-CodexWriter.ps1` uses the same general `codex exec` path, but without `--json` and `--output-schema` (`lines 61-62`)
- `Start-TaskSupervisor.ps1` launches the writer and reviewer in parallel (`lines 2100-2111`), so total stage time is dictated by the slower worker
- `V7.Common.ps1` uses a single process wrapper in `Invoke-V7CommandToFiles` (`lines 1121-1183`); it does not contain any expensive loops that could explain multi-minute delays by itself

Measured and inferred breakdown:

| Component | Current time | Evidence | Why |
|---|---:|---|---|
| Codex reviewer turn | 7.70-13.42 min typical; 35.62 min worst sampled run | `codex-reviewer.result.json` from recent runs | The dominant cost is inside Codex itself after launch, not PowerShell setup |
| Reviewer internal exploration | 22-36 command executions and 5-8 timeout failures in typical runs; 108 command executions and 23 timeout failures in the outlier | `codex-reviewer.stdout.log` JSONL events | `--full-auto` plus "review nearby context files" lets the model explore and retry reads repeatedly |
| Effective context size | 106,979-238,911 input tokens typical; 1,143,974 in the outlier | `turn.completed` usage events in reviewer stdout logs | The prompt file is small, but the live review turn grows much larger because Codex reads context interactively |
| Prompt construction | About 1.1-1.6 KB / 141-226 words in sampled runs | `prompts/codex-reviewer.prompt.md` | Prompt text itself is not the bottleneck |
| Parallel stage peer | `claude-writer` finished in 1.32-3.48 min on the same sampled runs | `claude-writer.result.json` | The code-review stage waits on the reviewer, not the writer |
| Schema + JSON shaping | Probably tens of seconds, not minutes | Schema file is only 1,616 chars / 84 lines | The cost is likely model-side structure/validation, not schema file size |
| PowerShell launch + wrapper I/O | Likely under 20 seconds total | Static code inspection of launcher/wrapper | The scripts do one process spawn, write the prompt, wait, then persist stdout/stderr |

Bottom line:

1. The main bottleneck is not PowerShell process startup.
2. The main bottleneck is not the literal prompt file size.
3. The main bottleneck is Codex reviewer autonomy: repo inspection, repeated file reads, timeout retries, and very large accumulated context.
4. Structured JSON output adds overhead, but it is secondary.

## Flag Assessment

Current reviewer invocation:

```text
codex exec -C <worktree> --full-auto --json -o <result> --output-schema <schema> -
```

Assessment:

- `-C <worktree>` is correct and should stay.
- Reading the prompt from stdin (`-`) is fine and not a meaningful cost.
- `--full-auto` is the most expensive flag in practice because it enables the exploratory tool loop that dominates runtime.
- `--json` is useful for machine-readable logs, but it does create extra stdout volume.
- `--output-schema` is useful for reliable downstream parsing, but it likely adds a smaller model-side structure cost.
- The current reviewer does not pin `--model`, `--profile`, or `--ephemeral`; it inherits the default CLI configuration.

Local CLI note:

- This environment does expose a dedicated `codex review` command, but it is diff/commit-oriented (`--base`, `--commit`, `--uncommitted`). It is not a drop-in replacement for the current page-review workflow.

## Optimization Suggestions

1. Pre-build a single review bundle instead of letting Codex discover context live.
   What to change: Before launching Codex, generate one markdown artifact that contains the exact inputs the reviewer needs: task summary, target code file, BUGS.md, README.md, and any intentionally selected extra context. Then change the reviewer prompt to say "review only the provided bundle unless a missing dependency is explicitly required."
   Expected impact: 2-6 minutes saved in normal runs; 10+ minutes on the worst outliers.
   Risk level: Medium.
   Implementation effort: Medium.
   Why this matters: sampled runs show 22-36 command executions in ordinary cases and 108 in the outlier, even though the prompt on disk is only 141-226 words.

2. Replace "nearby context files" with an explicit read budget.
   What to change: Tighten the reviewer prompt to something like: "Read only the listed files. Do not scan archive/version folders. Do not read more than N extra files unless the task explicitly requires it."
   Expected impact: 1-3 minutes saved in typical runs.
   Risk level: Low to medium.
   Implementation effort: Small.
   Why this matters: the current wording gives the model a large search space, which is exactly what the logs show it using.

3. Re-evaluate `--full-auto` for the reviewer worker.
   What to change: A/B test reviewer runs with a more constrained Codex configuration. If full autonomy must remain, combine it with the smaller review bundle from suggestion 1 so there is less reason to explore.
   Expected impact: 1-4 minutes saved in normal runs; larger savings on exploratory outliers.
   Risk level: Medium to high.
   Implementation effort: Medium.
   Why this matters: the current multi-minute cost is overwhelmingly inside Codex reasoning/tool use, not in the wrapper code.

4. Add `--ephemeral` to reviewer runs.
   What to change: Try `codex exec ... --ephemeral --json ...` for the reviewer worker.
   Expected impact: 5-15 seconds saved per run.
   Risk level: Low.
   Implementation effort: Small.
   Why this matters: the pipeline already persists prompt, result, stdout, stderr, and worker metadata. Reviewer session files are probably not adding enough value to justify extra disk work.

5. Treat strict schema validation as optional and benchmark alternatives.
   What to change: Benchmark three modes: current `--json --output-schema`, `--json` without schema plus PowerShell normalization, and plain final-message JSON/markdown with local parsing.
   Expected impact: 15-60 seconds saved per run.
   Risk level: Low to medium.
   Implementation effort: Small to medium.
   Why this matters: the schema file itself is tiny, so the likely cost is model-side structure compliance rather than file I/O.

6. Shorten the task body before it reaches the reviewer.
   What to change: Strip boilerplate from `$task.task.body` and pass a shorter, reviewer-specific summary instead of the full original task text when possible.
   Expected impact: 30-90 seconds saved per run.
   Risk level: Low to medium.
   Implementation effort: Medium.
   Why this matters: the prompt file is not huge, but every extra open-ended instruction increases the chance of broader exploration.

7. Pre-summarize stable context files instead of repeatedly reading full docs.
   What to change: Generate compact artifacts such as "known bugs already tracked" and "page context summary" once, then feed those summaries to the reviewer rather than the full docs when they are long or repetitive.
   Expected impact: 30-120 seconds saved per run.
   Risk level: Medium.
   Implementation effort: Medium.
   Why this matters: the reviewer is supposed to report only new issues not already in `BUGS.md`, but today it often spends time reading the original docs directly.

8. Exclude irrelevant directories from the reviewer search space.
   What to change: If you keep autonomous file access, explicitly steer the reviewer away from `versions`, `archive`, screenshots, and other non-current artifacts unless the task mentions them.
   Expected impact: 30-120 seconds saved per run, with bigger upside on pages that have long history folders.
   Risk level: Low.
   Implementation effort: Medium.
   Why this matters: autonomous review gets slower when there are many adjacent but low-value files to inspect.

9. Only optimize the PowerShell launcher after the Codex-side reductions.
   What to change: If more speed is still needed after the high-impact items above, consider reducing one-off launcher cost by reusing a long-lived worker process or invoking the CLI from a thinner host.
   Expected impact: 5-20 seconds saved total.
   Risk level: Low.
   Implementation effort: Large.
   Why this matters: `Start-V7WorkerLauncher` and `Invoke-V7CommandToFiles` are not where the current 8-13 minute delay is coming from.

## Recommended Priority Order

1. Build a fixed review bundle and tighten the prompt scope.
2. Limit reviewer autonomy and exploratory reads.
3. Benchmark schema/no-schema variants.
4. Add `--ephemeral`.
5. Only then spend time on launcher-level micro-optimizations.

## Final Assessment

The current reviewer slowdown is primarily a context-management problem, not a PowerShell problem.

The strongest evidence is:

- reviewer prompts are tiny
- reviewer wall time is still 7-13 minutes in normal runs
- reviewer turns accumulate 100k-239k input tokens in normal runs and over 1.1M in the outlier
- reviewer logs show many command executions and timeout retries
- the parallel writer usually finishes several minutes earlier

If the goal is to move reviewer runtime from 8-13 minutes toward something closer to 3-6 minutes, the highest-value work is to reduce live Codex exploration by pre-packaging context and narrowing the task surface area.
