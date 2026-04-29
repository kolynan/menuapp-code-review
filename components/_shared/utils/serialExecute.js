// ============================================================
// SERIAL EXECUTE — canonical v1.5 LOCKED (S388 Final Synth)
// ============================================================
// Source of truth для всего проекта. NEW helper that supersedes:
//   - SOM:542         runBatchSequential (one-at-a-time, 120ms delay)
//   - MenuDishes:181  batchedUpdates     (Promise.allSettled chunks of 5)
//   - partnertables   inline batched reindex (no inter-chunk delay)
//
// Resolves audit P-9/P-10 unified decision: single helper with `mode`
// parameter that consumers pass per use-case. Defaults match SOM's pattern
// (sequential, 120ms, isRateLimitError early-exit).
//
// Modes:
//   - 'sequential'        — process one item at a time; await each; delayMs
//                           between items. Stops early on isRetryable error.
//                           (SOM `runBatchSequential` migration)
//   - 'parallel-batched'  — process in chunks of `batchSize` via
//                           Promise.allSettled; delayMs between chunks. Throws
//                           aggregated error if any items failed (with
//                           `.results` and `.failed` sidecars).
//                           (MenuDishes `batchedUpdates` migration)
//
// B44 path: src/components/_shared/utils/serialExecute.js
// Local mirror path: components/_shared/utils/serialExecute.js
// Import alias: @/components/_shared/utils/serialExecute
//
// BACKLOG: #493 RF-1 batch (Bundle 3 — generic utils)
// Audit ref: outputs/permanent/Pre_Release_Refactor_Audit.md v2.0 §Final Synth Bundle 3
//   line 594 (LOCKED signature) and line 754 (mode parameter rationale).

import { isRateLimitError } from "../security/rateLimit";

/**
 * Execute `fn` against each item with sequential or parallel-batched control.
 *
 * @template TItem, TResult
 * @param {TItem[]} items - Items to process.
 * @param {(item: TItem, index: number) => Promise<TResult>} fn - Async worker.
 * @param {object} [opts]
 * @param {number} [opts.batchSize=5] - Chunk size for parallel-batched mode.
 * @param {number} [opts.delayMs=120] - Delay between items (sequential) or chunks (parallel).
 * @param {(error: any) => boolean} [opts.isRetryable=isRateLimitError] - Predicate for early-exit.
 * @param {'sequential'|'parallel-batched'} [opts.mode='sequential'] - Execution mode.
 * @returns {Promise<TResult[]>} Array of results (with `{error}` placeholders for sequential failures).
 *                                Throws aggregated error in parallel-batched mode if any item failed.
 */
export async function serialExecute(items, fn, {
  batchSize = 5,
  delayMs = 120,
  isRetryable = isRateLimitError,
  mode = "sequential",
} = {}) {
  if (!Array.isArray(items) || items.length === 0) return [];

  if (mode === "sequential") {
    // SOM pattern: one-at-a-time, early-exit on rate limit
    const results = [];
    for (let i = 0; i < items.length; i++) {
      try {
        results.push(await fn(items[i], i));
      } catch (err) {
        results.push({ error: err });
        if (isRetryable(err)) break;
      }
      if (i < items.length - 1 && delayMs > 0) {
        await new Promise((r) => setTimeout(r, delayMs));
      }
    }
    return results;
  }

  // 'parallel-batched' — MenuDishes pattern
  const results = [];
  const failed = [];
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const settled = await Promise.allSettled(
      batch.map((item, idx) => fn(item, i + idx)),
    );
    settled.forEach((r, idx) => {
      if (r.status === "fulfilled") {
        results.push(r.value);
      } else {
        failed.push({ item: batch[idx], reason: r.reason });
      }
    });
    if (i + batchSize < items.length && delayMs > 0) {
      await new Promise((r) => setTimeout(r, delayMs));
    }
  }
  if (failed.length > 0) {
    const err = new Error(`${failed.length} of ${items.length} updates failed`);
    err.failed = failed;
    err.results = results;
    throw err;
  }
  return results;
}
