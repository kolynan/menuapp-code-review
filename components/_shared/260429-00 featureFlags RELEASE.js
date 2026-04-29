/**
 * featureFlags.js — Unified feature flag checker for Partner entity.
 *
 * B44 schema convention:
 *   - Feature flags are flat boolean fields on Partner: loyalty_enabled, discount_enabled, etc.
 *   - Plan tier is stored in partner.plan_tier as lowercase string: 'paid' | 'free'.
 *
 * Usage:
 *   import { isFeatureEnabled, isPaidPlan } from '@/components/_shared/featureFlags';
 *   isFeatureEnabled(partner, 'loyalty')   // → boolean
 *   isFeatureEnabled(partner, 'discount')  // → boolean
 *   isPaidPlan(partner)                    // → boolean
 *
 * Closes: BACKLOG #495 (RF-2 Pre-Release Refactor, P-1 from Audit v2.0)
 * Unblocks: #407 Loyalty MVP, #180 Free Gate
 */

/** All known feature flag names (without _enabled suffix). */
export const FEATURE_FLAGS = ['loyalty', 'discount', 'reviews', 'feedback'];

/**
 * Check if a feature flag is enabled for a partner.
 *
 * B44 uses flat fields on the Partner entity: loyalty_enabled, discount_enabled, etc.
 * Strict equality (=== true) is intentional: undefined/null → false (same as current x.jsx convention).
 *
 * @param {Object|null|undefined} partner — Partner entity from B44
 * @param {'loyalty'|'discount'|'reviews'|'feedback'|string} flag — flag name (without _enabled suffix)
 * @returns {boolean}
 */
export function isFeatureEnabled(partner, flag) {
  if (!partner) return false;
  return partner[`${flag}_enabled`] === true;
}

/**
 * Check if partner is on a paid plan.
 *
 * B44 uses plan_tier field with lowercase values: 'paid' | 'free'.
 * Note: adminpartners PlanBadge uses partner.plan_tier directly for toggle logic.
 *
 * @param {Object|null|undefined} partner — Partner entity from B44
 * @returns {boolean}
 */
export function isPaidPlan(partner) {
  return partner?.plan_tier === 'paid';
}
