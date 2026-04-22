---
pipeline: v7
type: code-review
page: _infrastructure
budget: $5
---

Auto-approve all file edits, terminal commands, and git operations without asking.
Do not ask for confirmation on any step.
Execute autonomously until the task is fully complete.

## Fix KB-029: Codex schema validation error — Missing 'line' in required

### Problem
Codex reviewer crashes immediately with:
```
Invalid schema for response_format 'codex_output_schema':
In context=('properties', 'findings', 'items'), 'required' is required to be supplied
and to be an array including every key in properties. Missing 'line'.
```

### Root cause
OpenAI strict mode for `response_format` requires ALL keys from `properties` to be listed in the `required` array at the same level. The schema file `pipeline/v7/schemas/review-findings.schema.json` has a property `line` in `findings[].items.properties` that is NOT included in the corresponding `required` array.

### Task
1. Open ALL 4 schema files in `pipeline/v7/schemas/`:
   - `review-findings.schema.json`
   - `codex-output.schema.json` (if exists)
   - Any other `.schema.json` files
2. For EACH schema file: audit every `properties` object at every nesting level. Ensure the sibling `required` array contains ALL keys from that `properties` object. No exceptions.
3. Specifically fix the `findings.items` level — add `"line"` to `required`.
4. Validate each JSON file is valid (no BOM, no trailing commas, proper escaping).
5. Write files using BOM-free UTF-8: `[System.Text.UTF8Encoding]::new($false)`.

### Commit
```
git add pipeline/v7/schemas/*.json
git commit -m "fix: KB-029 add missing 'line' to required in all V7 schemas"
git push
```

Before marking complete: verify each schema with `python -c "import json; json.load(open('path'))"` to confirm valid JSON without BOM.
If any test fails — fix and re-test, do not submit broken code.
