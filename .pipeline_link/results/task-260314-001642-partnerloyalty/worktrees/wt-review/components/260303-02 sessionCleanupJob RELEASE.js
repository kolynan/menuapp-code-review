// Version: 1.2 (S73, 2026-03-03)
// SESS-016 — Scheduled Job: Expire Safe Sessions
// Spec: SessionLogic_Consensus_S67.md (LOCKED — do not change semantics)
//
// PURPOSE:
//   Periodically expire table sessions that are safe to close.
//   Sessions with "problem orders" (non-finish or unpaid) are skipped.
//
// INTEGRATION — Base44 has no built-in scheduler. Options:
//
//   RECOMMENDED — Option A: useEffect + setInterval in StaffOrdersMobile
//     StaffOrdersMobile is always open by waiters during service.
//     Add to the page:
//       useEffect(() => {
//         const run = () => runSessionCleanup().catch(console.error);
//         run(); // run once on mount
//         const interval = setInterval(run, 5 * 60 * 1000); // every 5 min
//         return () => clearInterval(interval);
//       }, []);
//     Pro: automatic, no external deps, runs when waiters are active.
//     Con: only runs while StaffOrdersMobile tab is open.
//
//   Option B: Manual "Run Cleanup" button in admin/partner settings page.
//     Pro: explicit control. Con: manual, easy to forget.
//
//   Option C: Make.com scheduled webhook (external cron → B44 API).
//     Pro: reliable schedule. Con: requires Make setup + API auth config.
//
// USAGE:
//   import { runSessionCleanup } from '@/components/sessionCleanupJob';
//   const result = await runSessionCleanup({ dryRun: true });  // test first
//   const result = await runSessionCleanup({ dryRun: false }); // live
//
// IDEMPOTENT: Safe to run multiple times. Already-expired sessions are skipped.
//
// NOTE ON PAYMENT STATUS (v1.2 — P1 fix):
//   Per SESS-016 spec, "problem order" = non-finish OR unpaid.
//   However, payment tracking is NOT yet implemented in MenuApp —
//   pickup/delivery orders are created with payment_status="unpaid",
//   but hall orders are created WITHOUT payment_status (undefined).
//   There is no UI to mark orders as "paid" (see DeepAnalysis_S70.md).
//   Therefore, ignorePaymentStatus defaults to TRUE for now.
//   When payment tracking is implemented, change default to FALSE.
//
//   P1 FIX (S73): Changed check from === 'unpaid' to !== 'paid'.
//   This correctly treats undefined/null/unpaid as "not paid" — preventing
//   false negatives where hall orders (payment_status=undefined) would
//   slip through and allow sessions to close with unverified payments.

import { base44 } from '@/api/base44Client';
import { isSessionExpired } from '@/components/sessionHelpers';

// Terminal order statuses (legacy pipeline) — these orders are "finished"
const LEGACY_FINISH_STATUSES = ['served', 'closed', 'cancelled'];

// Hard-expire timeout in hours (SESS-008/SESS-015, LOCKED)
const HARD_EXPIRE_HOURS = 8;

/**
 * Check if an order is in "finish" state (hybrid pipeline support).
 * Per SESS-016: "Finish order" = OrderStage.internal_code == 'finish'
 *   OR legacy status in {served, closed, cancelled}
 *
 * @param {Object} order - Order entity
 * @param {Object} stageMap - { stageId: { internal_code, name } }
 * @returns {boolean}
 */
function isFinishOrder(order, stageMap) {
  if (LEGACY_FINISH_STATUSES.includes(order.status)) {
    return true;
  }
  if (order.stage_id && stageMap[order.stage_id]) {
    return stageMap[order.stage_id].internal_code === 'finish';
  }
  return false;
}

/**
 * Check if an order is a "problem order".
 * Per SESS-016: "Problem order" = non-finish OR not-paid (undefined/null/unpaid).
 *
 * @param {Object} order - Order entity
 * @param {Object} stageMap - { stageId: { internal_code, name } }
 * @param {boolean} ignorePaymentStatus - Skip unpaid check (see NOTE ON PAYMENT STATUS)
 * @returns {boolean}
 */
function isProblemOrder(order, stageMap, ignorePaymentStatus) {
  if (!isFinishOrder(order, stageMap)) {
    return true;
  }
  // Intentionally broad: only 'paid' is safe. undefined/null/unpaid/failed/refunded all block.
  // This is a conservative safety guard — Codex suggested explicit checks but for session
  // closure we want to err on the side of caution (block unless confirmed paid).
  if (!ignorePaymentStatus && order.payment_status !== 'paid') {
    return true;
  }
  return false;
}

/**
 * Build a stage lookup map: stageId → { internal_code, name }.
 * Pre-fetches all OrderStages to avoid per-order queries.
 *
 * @returns {Object} stageMap
 */
async function buildStageMap() {
  try {
    const stages = await base44.entities.OrderStage.list('-sort_order', 500);
    const map = {};
    for (const stage of (stages || [])) {
      map[stage.id] = {
        internal_code: stage.internal_code,
        name: stage.name
      };
    }
    return map;
  } catch (err) {
    // If stages can't be loaded, fall back to legacy status only
    return {};
  }
}

/**
 * Main cleanup function — SESS-016 implementation.
 *
 * For each open session that is hard-expired (8h):
 *   - No problem orders → expire it (status='expired', closed_at=now)
 *   - Has problem orders → skip (leave open, UI shows STALE badge per SESS-018)
 *
 * @param {Object} options
 * @param {boolean} options.dryRun - If true, logs what would be expired without changing data
 * @param {boolean} options.ignorePaymentStatus - Skip unpaid check (default true — payment tracking not yet implemented)
 * @returns {Promise<{expired: number, skipped_stale: number, skipped_not_expired: number, total_open: number, errors: string[], details: Object[]}>}
 */
export async function runSessionCleanup({ dryRun = false, ignorePaymentStatus = true } = {}) {
  const result = {
    expired: 0,
    skipped_stale: 0,
    skipped_not_expired: 0,
    total_open: 0,
    errors: [],
    details: []
  };

  try {
    // Step 1: Fetch all open sessions
    const openSessions = await base44.entities.TableSession.filter({
      status: 'open'
    });

    if (!openSessions || openSessions.length === 0) {
      return result;
    }

    result.total_open = openSessions.length;

    // Step 2: Pre-fetch stage map for finish-order detection
    const stageMap = await buildStageMap();

    // Step 3: Process each session
    for (const session of openSessions) {
      try {
        // Check if hard-expired (uses existing helper, 8h)
        if (!isSessionExpired(session, HARD_EXPIRE_HOURS)) {
          result.skipped_not_expired++;
          continue;
        }

        // Fetch orders for this session
        const orders = await base44.entities.Order.filter({
          table_session: session.id
        });

        // Check for problem orders
        const problemOrders = (orders || []).filter(
          order => isProblemOrder(order, stageMap, ignorePaymentStatus)
        );

        if (problemOrders.length > 0) {
          // Has problem orders — skip (STALE, waiter sees via SESS-018)
          result.skipped_stale++;
          result.details.push({
            session_id: session.id,
            table: session.table,
            action: 'skipped_stale',
            problem_count: problemOrders.length
          });
          continue;
        }

        // Safe to expire
        if (!dryRun) {
          const now = new Date().toISOString();
          await base44.entities.TableSession.update(session.id, {
            status: 'expired',
            closed_at: now,
            expires_at: now
          });
        }

        result.expired++;
        result.details.push({
          session_id: session.id,
          table: session.table,
          action: dryRun ? 'would_expire' : 'expired',
          order_count: (orders || []).length
        });

      } catch (sessionErr) {
        result.errors.push(`Session ${session.id}: ${sessionErr.message}`);
      }
    }

  } catch (err) {
    result.errors.push(`Fatal: ${err.message}`);
  }

  return result;
}
