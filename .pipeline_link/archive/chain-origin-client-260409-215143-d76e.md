---
page: Client
code_file: pages/Client/260225-00 client RELEASE.jsx
budget: 2
agent: codex
chain_template: pssk-codex-review
---

# Smoke Test #283 — Inline Source Injection (KB-129)

## Purpose
This is a smoke test to verify that `resolve_inline_source()` correctly injects the Client page source code inline into the Codex reviewer prompt (KB-129 optimization).

## КС Prompt Under Review

```
---
page: Client
---

# Client Page — Quick Fix

## Fix 1: Add loading state
Find the main return statement and add a loading spinner before the content renders.

At approximately line 10, add:
  if (loading) return <div>Loading...</div>;

## Verification
- grep -n "loading" pages/Client/client.jsx → should show 1 result
```

## SOURCE CODE

{{INLINE_SOURCE}}
