// ======================================================
// pages/x.jsx â€" PUBLIC MENU with i18n + Channels Visibility + Gating
// UPDATED: Simplified Hall logic (TASK-260123-01b)
// FIXED: P0-1..P0-7 security and functionality fixes
// UPDATED: TASK-260127-01 - session restore, UI cleanup
// PATCHED: 2026-01-28 - P0-1, P0-2, P0-2b, P1-1..P1-4
// PATCHED: 2026-02-01 - FIX-260131-07 FINAL - guest safeguard in submit
// PATCHED: 2026-02-01 - TASK-260201-01 - Hall StickyBar always visible
// PATCHED: 2026-03-03 - GAP-01 - Order Confirmation Screen
// FIXED: 2026-03-03 - GAP-01 fix - Confirmation as full-screen overlay (z-60)
// FIXED: 2026-03-03 - GAP-02 fix - Embed OrderStatusScreen inside x.jsx (no /orderstatus route)
// FIXED: 2026-03-03 - GAP-02 fix - Remove auto-dismiss timer (race condition: ghost click on menu)
// ======================================================

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { useI18n } from "@/components/i18n";
import { toast } from "sonner"; // P0-6: sonner instead of custom toast

import {
  AlertCircle,
  ArrowLeft,
  Bell,
  Check,
  CheckCircle2,
  Clock,
  ChevronDown,
  ChevronUp,
  Image as ImageIcon,
  Loader2,
  MapPin,
  Minus,
  Plus,
  RefreshCw,
  ShoppingCart,
  X as XIcon,
  XCircle,
  Globe,
  Phone,
  Mail,
  MessageCircle,
  Link as LinkIcon,
  Store,
  Package,
  Truck,
  Users,
  Layers,
} from "lucide-react";

import {
  getOrCreateSession,
  addGuestToSession,
  findGuestByDevice,
  getSessionGuests,
  getSessionOrders,
  getDeviceId,
  getGuestDisplayName,
  getNextOrderNumber,
  isSessionExpired,
} from "@/components/sessionHelpers";

import {
  normalizeMode,
  isDishEnabledForMode,
  sortCategoriesStable,
  sortDishesStable,
  buildDishesByCategory,
  getVisibleCategoryIds,
} from "@/components/menuChannelLogic";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// TASK-260203-01: Drawer for cart
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";

import Rating from "@/components/Rating";
import DishRating from "@/components/publicMenu/DishRating";
import PublicMenuHeader from "@/components/publicMenu/PublicMenuHeader";
import HelpFab from "@/components/publicMenu/HelpFab";
import HelpModal from "@/components/publicMenu/HelpModal";
import ReviewDialog from "@/components/publicMenu/ReviewDialog";
import StickyCartBar from "@/components/publicMenu/StickyCartBar";
import MenuView from "@/components/publicMenu/MenuView";
import CartView from "@/components/publicMenu/CartView";
import RedirectBanner from "@/components/publicMenu/refactor/RedirectBanner";
import DishReviewsModal from "@/components/publicMenu/DishReviewsModal";
import ModeTabs from "@/components/publicMenu/refactor/ModeTabs";
import CategoryChips from "@/components/publicMenu/refactor/CategoryChips";
import HallVerifyBlock from "@/components/publicMenu/refactor/HallVerifyBlock";
import ErrorState from "@/components/publicMenu/refactor/ErrorState";
import EmptyMenuState from "@/components/publicMenu/refactor/EmptyMenuState";
import CheckoutView from "@/components/publicMenu/views/CheckoutView";
import { useCurrency } from "@/components/publicMenu/refactor/hooks/useCurrency";
import { useHallTable } from "@/components/publicMenu/refactor/hooks/useHallTable";
import { useHelpRequests } from "@/components/publicMenu/refactor/hooks/useHelpRequests";
import { useLoyalty } from "@/components/publicMenu/refactor/hooks/useLoyalty";
import { useReviews } from "@/components/publicMenu/refactor/hooks/useReviews";
import { useTableSession } from "@/components/publicMenu/refactor/hooks/useTableSession";

// ============================================================
// CONSTANTS & HELPERS
// ============================================================

const isDishArchived = (dish) =>
  !!dish?.description && dish.description.toLowerCase().includes(":::archived:::");

const getCleanDescription = (desc) =>
  desc ? desc.replace(/:::archived:::/gi, "").trim() : "";

const looksLikePartnerId = (value) =>
  /^[0-9a-f]{24}$/i.test(String(value || "").trim());

// P0-5: Rate limit detection
const isRateLimitError = (err) => {
  const msg = (err?.message || "").toLowerCase();
  return msg.includes("rate limit") || msg.includes("429");
};

const shouldRetry = (count, err) => !isRateLimitError(err) && count < 2;

// P1-1: XSS protection for contact URLs
const isSafeUrl = (url) => {
  if (!url) return false;
  const allowed = ['http:', 'https:', 'tel:', 'mailto:', 'whatsapp:'];
  try {
    const parsed = new URL(url, window.location.origin);
    return allowed.includes(parsed.protocol);
  } catch {
    return false;
  }
};

function getContactIcon(type) {
  const map = {
    phone: Phone,
    whatsapp: MessageCircle,
    instagram: LinkIcon,
    facebook: LinkIcon,
    tiktok: LinkIcon,
    website: Globe,
    email: Mail,
    map: MapPin,
    custom: LinkIcon,
  };
  return map[type] || LinkIcon;
}

// Cart persistence helpers
// BUG-PM-005: Cart persistence with 4h TTL
const CART_TTL_MS = 4 * 60 * 60 * 1000; // 4 hours

const saveCartToStorage = (partnerId, cartData) => {
  if (!partnerId) return;
  try {
    const key = `menuapp_cart_${partnerId}`;
    if (!cartData || cartData.length === 0) {
      localStorage.removeItem(key);
      return;
    }
    localStorage.setItem(key, JSON.stringify({ items: cartData, ts: Date.now() }));
  } catch {}
};

const getCartFromStorage = (partnerId) => {
  if (!partnerId) return null;
  try {
    const key = `menuapp_cart_${partnerId}`;
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const data = JSON.parse(raw);
    // Migrate legacy format (plain array) â€" accept but rewrite with timestamp
    if (Array.isArray(data)) {
      try {
        localStorage.setItem(key, JSON.stringify({ items: data, ts: Date.now() }));
      } catch {}
      return data;
    }
    if (!data || !Array.isArray(data.items)) return null;
    // TTL check â€" require valid ts
    if (!data.ts || typeof data.ts !== 'number' || (Date.now() - data.ts) > CART_TTL_MS) {
      localStorage.removeItem(key);
      return null;
    }
    return data.items;
  } catch {
    return null;
  }
};

const clearCartStorage = (partnerId) => {
  if (!partnerId) return;
  try {
    const key = `menuapp_cart_${partnerId}`;
    localStorage.removeItem(key);
  } catch {}
};

/* ============================================================
   CHANNELS VISIBILITY LOGIC (per LOCKED spec)
   ============================================================ */

function isDishAvailableForGuest(dish, mode, categoriesMap) {
  if (!dish) return false;
  if (isDishArchived(dish)) return false;
  if (dish[`enabled_${mode}`] === false) return false;
  if (!dish.name?.trim()) return false;
  if (dish.price == null || dish.price < 0) return false;

  const categoryId = dish.category;
  if (categoryId && categoriesMap) {
    const category = categoriesMap.get(String(categoryId));
    if (category && category.is_active === false) return false;
  }
  return true;
}

function useGuestChannels(partner, dishes, categories) {
  return useMemo(() => {
    const isConfigured = partner?.channels_configured_at != null;
    const categoriesMap = new Map((categories || []).map((c) => [String(c.id), c]));

    const hasDishesForMode = (mode) => {
      return (dishes || []).some((dish) => isDishAvailableForGuest(dish, mode, categoriesMap));
    };

    const hallPublished = partner?.channels_hall_enabled !== false;
    const pickupPublished = partner?.channels_pickup_enabled !== false;
    const deliveryPublished = partner?.channels_delivery_enabled !== false;

    const hallHasContent = hasDishesForMode("hall");
    const pickupHasContent = hasDishesForMode("pickup");
    const deliveryHasContent = hasDishesForMode("delivery");

    return {
      hall: {
        visible: hallPublished,
        available: hallPublished && hallHasContent,
        hasContent: hallHasContent,
        disabled: hallPublished && !hallHasContent,
      },
      pickup: {
        visible: pickupPublished && isConfigured,
        available: pickupPublished && isConfigured && pickupHasContent,
        hasContent: pickupHasContent,
        disabled: pickupPublished && isConfigured && !pickupHasContent,
      },
      delivery: {
        visible: deliveryPublished && isConfigured,
        available: deliveryPublished && isConfigured && deliveryHasContent,
        hasContent: deliveryHasContent,
        disabled: deliveryPublished && isConfigured && !deliveryHasContent,
      },
      isConfigured,
      hasAnyContent: hallHasContent || pickupHasContent || deliveryHasContent,
    };
  }, [partner, dishes, categories]);
}

const SCROLL_SPY_OFFSET_PX = 100;
const MANUAL_SCROLL_LOCK_MS = 800;
const BILL_COOLDOWN_MS = 5 * 60 * 1000; // 5 minutes

// Bill request cooldown helpers
const getBillCooldownKey = (tableId) => `menuapp_bill_requested_${tableId}`;

const isBillOnCooldown = (tableId) => {
  try {
    const key = getBillCooldownKey(tableId);
    const timestamp = localStorage.getItem(key);
    if (!timestamp) return false;
    return Date.now() - parseInt(timestamp, 10) < BILL_COOLDOWN_MS;
  } catch { return false; }
};

const setBillCooldownStorage = (tableId) => {
  try {
    const key = getBillCooldownKey(tableId);
    localStorage.setItem(key, String(Date.now()));
  } catch { /* private browsing â€" ignore */ }
};

/**
 * ÐÐ°Ñ…Ð¾Ð´Ð¸Ñ‚ ÑÑ‚Ð°Ñ€Ñ‚Ð¾Ð²Ñ‹Ð¹ ÑÑ‚Ð°Ð¿ Ð´Ð»Ñ Ð·Ð°ÐºÐ°Ð·Ð°
 */
function getStartStage(stages, orderType) {
  if (!stages?.length) return null;
  
  const channelStages = stages.filter(stage => {
    switch (orderType) {
      case 'hall': return stage.enabled_hall !== false;
      case 'pickup': return stage.enabled_pickup !== false;
      case 'delivery': return stage.enabled_delivery !== false;
      default: return true;
    }
  });
  
  const startStage = channelStages.find(s => s.internal_code === 'start');
  if (startStage) return startStage;
  
  const sorted = [...channelStages].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
  return sorted[0] || null;
}

// ============================================================
// i18n FALLBACK MAP â€" prevents raw keys from showing to guests
// Chain: selected lang â†’ EN fallback â†’ RU fallback â†’ empty string
// ============================================================
const I18N_FALLBACKS = {
  // Order statuses (OrderStatusBadge)
  "status.new": "New",
  "status.cooking": "Cooking",
  "status.ready": "Ready",
  "status.accepted": "Accepted",
  "status.served": "Served",
  // Order Status Screen
  "order_status.status_new": "Accepted",
  "order_status.status_preparing": "Preparing",
  "order_status.status_ready": "Ready",
  "order_status.status_served": "Completed",
  "order_status.status_cancelled": "Cancelled",
  "order_status.step_received": "Received",
  "order_status.step_preparing": "Preparing",
  "order_status.step_ready": "Ready",
  "order_status.no_token": "Order link is missing",
  "order_status.check_link": "Please check the link and try again",
  "order_status.back_to_menu": "Back to menu",
  "order_status.not_found": "Order not found",
  "order_status.expired": "Order expired",
  "order_status.order_number": "Order",
  "order_status.last_updated": "Updated",
  "order_status.just_now": "just now",
  "order_status.seconds_ago": "{seconds} sec. ago",
  "order_status.your_order": "Your order",
  "order_status.total": "Total",
  "order_status.discount": "Discount",
  "order_status.questions": "Any questions?",
  "order_status.order_cancelled_info": "Order cancelled",
  "order_status.order_complete_info": "Thank you! Your order is complete",
  "order_status.refresh": "Refresh",
  // Mode labels
  "mode.hall": "Dine in",
  "mode.pickup": "Takeaway",
  "mode.delivery": "Delivery",
  "mode.hall.desc": "Order in the restaurant",
  "mode.pickup.desc": "I'll take it to go",
  "mode.delivery.desc": "Delivery to your address",
  // Hall verification
  "hall.verify.title": "So the waiter receives your order right away",
  "hall.verify.subtitle": "Enter the table code or tell it to the waiter",
  "hall.verify.benefit": "After this, orders will go directly to the waiter",
  "hall.verify.online_benefits": "Bonuses and discounts for online orders",
  // Errors
  "error.invalid_link": "Invalid link",
  "error.save_failed": "Save error",
  "error.phone_invalid": "Invalid format",
  "error.phone_short": "Number is too short",
  "error.phone_long": "Number is too long",
  "error.table_required": "Please select a table",
  "error.name_required": "Please enter your name",
  "error.phone_required": "Please enter your phone number",
  "error.address_required": "Please enter your address",
  "error.submit_failed": "Submission error",
  "error.session_expired": "Session expired",
  "error.rate_limit": "Too many requests, please try again later",
  "error.partner_missing": "Restaurant not specified",
  "error.partner_hint": "Add the parameter",
  "error.partner_not_found": "Restaurant not found",
  "error.network_error": "Network error",
  "error.check_connection": "Check your connection",
  // Loyalty
  "loyalty.insufficient_points": "Insufficient points",
  "loyalty.transaction.redeem": "Points redeemed",
  "loyalty.transaction.earn_order": "Points earned for order #{orderNumber}",
  // Cart / checkout
  "cart.checkout": "Checkout",
  "cart.my_bill": "My bill",
  "cart.table_orders": "Table orders",
  "cart.your_orders": "Your orders",
  "cart.view": "Open",
  "cart.empty": "Cart is empty",
  "cart.bill_already_requested": "Bill already requested",
  "cart.bill_requested": "Waiter will bring the bill shortly",
  "cart.title": "Cart",
  "cart.your_order": "Your order",
  "cart.back_to_menu": "Back to menu",
  "cart.total": "Total",
  "cart.expected_savings": "Expected savings",
  "cart.submitting": "Sending...",
  "cta.sending": "Sending...",
  "cta.retry": "Retry",
  "error.send.title": "Failed to send",
  "error.send.subtitle": "Please try again",
  "cart.item_added": "Added",
  "cart.send_to_waiter": "Send to waiter",
  "cart.send_order": "Send order",
  // Checkout form (CheckoutView)
  "checkout.currency_note": "Currency conversion",
  "form.name": "Name",
  "form.required": "*",
  "form.phone": "Phone",
  "form.phone_placeholder": "+7...",
  "form.address": "Delivery address",
  "form.comment": "Comment",
  "form.comment_placeholder": "Special requests",
  "form.table": "Table",
  // Menu (MenuView)
  "menu.add": "Add",
  "menu.remove": "Remove",
  "menu.tile": "Grid",
  "menu.list": "List",
  "menu.no_items": "No items in this category",
  "menu.add_to_cart": "Add to cart",
  "menu.added_to_cart": "Added to cart",
  // Mode tabs
  "mode.coming_soon": "Coming soon",
  // Confirmation screen
  "confirmation.title": "Order sent!",
  "confirmation.your_order": "Your order",
  "confirmation.total": "Total",
  "confirmation.guest_label": "Guest",
  "confirmation.client_name": "Name",
  "confirmation.back_to_menu": "Back to menu",
  "confirmation.my_orders": "My orders",
  "confirmation.track_order": "Track order",
  // Reviews & misc
  "review.thanks": "Thank you for your rating!",
  "review.add_comments": "Add comments",
  "review.points": "points",
  "review.rate_others": "Rate other guests' dishes",
  "guest.name_saved": "Name saved",
  "guest.name_placeholder": "Name",
  "toast.error": "Error",
  "common.loading": "Loading...",
  "common.close": "Close",
  "common.info": "Information",
  "common.of": "of",
  "common.or": "or",
  "common.save": "Save",
  "common.cancel": "Cancel",
  "common.retry": "Retry",
  // CartView — cart details
  "cart.enter_table_code_hint": "Enter table code to send your order",
  "cart.for_all": "For everyone",
  "cart.guest": "Guest",
  "cart.new_order": "New order",
  "cart.no_orders_yet": "No orders yet",
  "cart.only_me": "Just me",
  "cart.order_total": "Order total",
  "cart.split_disabled_hint": "(2+ guests)",
  "cart.split_pick_guests_soon": "Select guests (coming soon)",
  "cart.split_title": "Who is this order for",
  "cart.table_total": "Table bill",
  "cart.tell_code_to_waiter": "Tell this code to the waiter",
  "cart.you": "You",
  "cart.motivation_bonus_short": "Earn bonuses",
  // CartView — table verification
  "cart.verify.attempts": "Attempts",
  "cart.verify.bonus_label": "Online order bonus",
  "cart.verify.discount_label": "Online order discount",
  "cart.verify.enter_code_placeholder": "Enter code",
  "cart.verify.enter_table_code": "Enter table code",
  "cart.verify.helper_text": "Enter code from your table",
  "cart.verify.info_online_point1": "Order goes directly to the waiter",
  "cart.verify.info_online_point2": "Usually faster",
  "cart.verify.info_online_point3": "Discounts and bonuses (if any) are applied automatically",
  "cart.verify.info_online_title": "Online order to waiter",
  "cart.verify.info_table_code_point1": "Code is usually shown on the table",
  "cart.verify.info_table_code_point2": "If not visible — ask your waiter",
  "cart.verify.info_table_code_title": "Table code",
  "cart.verify.locked": "Too many attempts. Try again in",
  "cart.verify.online_order_title": "Online order to waiter",
  "cart.verify.points_discount_label": "Points discount",
  "cart.verify.table_verified": "Table confirmed",
  // CartView — loyalty
  "loyalty.apply": "Apply",
  "loyalty.email_label": "Email for bonuses",
  "loyalty.email_placeholder": "email@example.com",
  "loyalty.email_saved": "Email saved! Bonuses will be added.",
  "loyalty.enter_email_for_bonus": "Enter your email to earn bonuses:",
  "loyalty.enter_email_hint": "Enter your email to earn bonuses",
  "loyalty.get_bonus": "Get bonuses",
  "loyalty.new_customer": "You will get {points} bonus points for your first order",
  "loyalty.your_balance": "Your balance: {points} points",
  "loyalty.max_redeem": "Maximum {max} points ({percent}% of order)",
  "loyalty.instant_discount": "{percent}% discount applied",
  "loyalty.enter_email_for_discount": "Enter email for {percent}% discount",
  "loyalty.online_bonus_label": "Online order bonus",
  "loyalty.points_applied": "Points applied",
  "loyalty.points_short": "points",
  "loyalty.redeem_points": "Redeem points",
  "loyalty.review_reward_hint": "For review",
  "loyalty.review_reward_prefix": "for review",
  "loyalty.thanks_for_rating": "Thank you for your rating!",
  "loyalty.title": "Bonuses",
  // CartView — status
  "status.cancelled": "Cancelled",
  // CartView — misc
  "cart.items_removed_mode_switch": "Removed {count} items not available in this mode",
  // Table confirmation Bottom Sheet
  "cart.confirm_table.title": "Confirm your table",
  "cart.confirm_table.subtitle": "To send the order to the waiter",
  "cart.confirm_table.benefit_loyalty": "Online orders earn you bonuses / discount",
  "cart.confirm_table.benefit_default": "This helps the waiter find your order faster",
  "cart.confirm_table.submit": "Send",
  "cart.confirm_table.dismissed": "Got it",
  // Help Drawer (help.*) — English, do not change these
  "help.call_waiter": "Call a waiter",
  "help.active_requests": "Active requests",
  "help.sent_suffix": "sent",
  "help.undo": "Undo",
  "help.cancel_request": "Not needed",
  "help.modal_title": "Need help?",
  "help.modal_desc": "Choose how we can help",
  "help.my_requests": "My requests",
  "help.active_count": "active",
  "help.bill": "Bring the bill",
  "help.napkins": "Napkins",
  "help.menu": "Paper menu",
  "help.other": "Other",
  "help.other_label": "Other",
  "help.send_more": "Send more",
  "help.all_requests_cta": "All requests ({count})",
  "help.back_to_help": "Back to help",
  "help.show_more": "More",
  "help.show_less": "Less",
  "help.requests": "requests",
  "help.already_sent_short": "Already sent",
  "help.comment_placeholder_other": "E.g.: high chair, cutlery, clear the table",
  "help.submit_arrow": "Send",
  "help.closed_by_guest": "✅ No longer needed",
  "help.sending_now": "Sending…",
  "help.retry": "Retry",
  "help.remind": "Remind",
  "help.retry_in": "In",
  "help.just_sent": "Just sent",
  "help.waiting_prefix": "Waiting",
  "help.minutes_short": "min",
  "help.reminded_just_now": "Just reminded",
  "help.reminded_prefix": "Reminded",
  "help.last_reminder_prefix": "Last",
  "help.reminder_sent": "Reminder sent",
  "help.resolved_call_waiter": "✅ Waiter came · Thank you!",
  "help.resolved_bill": "✅ Bill brought · Thank you!",
  "help.resolved_napkins": "✅ Napkins brought · Thank you!",
  "help.resolved_menu": "✅ Menu brought · Thank you!",
  "help.resolved_other": "✅ Done · Thank you!",
  "help.no_connection": "No connection",
  "help.try_again": "Try again",
  "help.remind_failed": "Failed to send reminder",
  "help.send_failed": "Failed to send",
  "help.restoring_status": "Restoring status…",
  "help.offline_status": "No connection · will retry automatically",
  "help.stale_status": "Data may be outdated · no update",
  "help.seconds_short": "sec",
  "help.updated_label": "Updated",
  "help.ago": "ago",
  "help.reminder": "reminder",
  "help.reminders": "reminders",
  // Help Chips (quick suggestions in help drawer)
  "help.chip.high_chair": "High chair",
  "help.chip.cutlery": "Cutlery",
  "help.chip.sauce": "Sauce",
  "help.chip.clear_table": "Clear the table",
  "help.chip.water": "Water",
};

/**
 * Wraps raw t() to prevent raw i18n keys from reaching the UI.
 * Falls back to I18N_FALLBACKS map, supports {param} interpolation.
 */
function makeSafeT(rawT, lang) {
  return (key, params) => {
    // EN mode: I18N_FALLBACKS is the authoritative EN source.
    // Check it FIRST to avoid B44 returning RU for keys with no EN translation.
    if (lang === 'en') {
      let fb = I18N_FALLBACKS[key];
      if (fb != null && fb !== '') {
        if (params && typeof params === "object") {
          Object.entries(params).forEach(([k, v]) => {
            fb = fb.replace(new RegExp(`\\{${k}\\}`, "g"), String(v ?? ""));
          });
        }
        return fb;
      }
    }
    // Try the real translation first
    const val = typeof rawT === "function" ? rawT(key, params) : "";
    if (val && typeof val === "string") {
      const norm = val.trim();
      // If t() returned something other than the raw key, use it
      if (norm !== key && !norm.startsWith(key + ":")) return norm;
    }
    // Fallback from map
    let fb = I18N_FALLBACKS[key];
    if (!fb) return "";
    // Simple {param} interpolation for fallbacks
    if (params && typeof params === "object") {
      Object.entries(params).forEach(([k, v]) => {
        fb = fb.replace(new RegExp(`\\{${k}\\}`, "g"), String(v ?? ""));
      });
    }
    return fb;
  };
}

/**
 * Order Status Badge component (TASK-260126-01)
 */
function OrderStatusBadge({ status, stageId, stages, t }) {
  // Map internal_code to translated labels (don't show raw stage.name to guests)
  const STAGE_LABELS = {
    start: t('status.new'),
    middle: t('status.cooking'),
    finish: t('status.ready'),
  };
  
  // Normalize stageId (can be string, object with id, etc)
  const stageIdNorm = stageId && typeof stageId === 'object' 
    ? (stageId.id ?? stageId._id ?? null) 
    : stageId;
  
  // If has stage_id - use OrderStage config but translated label
  if (stageIdNorm && stages?.length) {
    const stage = stages.find(s => String(s.id) === String(stageIdNorm));
    if (stage) {
      const icon = stage.internal_code === 'finish' ? 'âœ…' : 
                   stage.internal_code === 'start' ? 'ðŸ"µ' : 'ðŸŸ ';
      const label = STAGE_LABELS[stage.internal_code] || t('status.new');
      const color = stage.color || '#64748b';
      return (
        <span 
          className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full"
          style={{ backgroundColor: `${color}20`, color }}
        >
          {icon} {label}
        </span>
      );
    }
  }
  
  // Fallback to status
  const STATUS_CONFIG = {
    new: { icon: 'ðŸ"µ', label: t('status.new'), bg: 'bg-blue-100', color: 'text-blue-700' },
    accepted: { icon: 'ðŸ"µ', label: t('status.accepted'), bg: 'bg-blue-100', color: 'text-blue-700' },
    in_progress: { icon: 'ðŸŸ ', label: t('status.cooking'), bg: 'bg-orange-100', color: 'text-orange-700' },
    ready: { icon: 'âœ…', label: t('status.ready'), bg: 'bg-green-100', color: 'text-green-700' },
    served: { icon: 'âœ…', label: t('status.served'), bg: 'bg-green-100', color: 'text-green-700' },
  };
  
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.new;
  
  return (
    <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full ${config.bg} ${config.color}`}>
      {config.icon} {config.label}
    </span>
  );
}

/* ============================================================
   GAP-01: ORDER CONFIRMATION SCREEN
   Shown after successful order submission. User navigates via buttons.
   (Auto-dismiss removed: caused ghost clicks on menu when timer fired)
   ============================================================ */

function OrderConfirmationScreen({
  items,
  totalAmount,
  guestLabel,
  orderMode,
  publicToken,
  clientName,
  formatPrice,
  onBackToMenu,
  onOpenOrders,
  onTrackOrder,
  t,
  partner,
}) {
  const primaryColor = partner?.primary_color || '#1A1A1A';
  // Safe translation with fallback
  const tr = (key, fallback) => {
    const val = typeof t === "function" ? t(key) : "";
    if (!val || typeof val !== "string") return fallback;
    const norm = val.trim();
    if (norm === key || norm.startsWith(key + ":")) return fallback;
    return norm;
  };

  return (
    <div className="fixed inset-0 z-[60] overflow-y-auto" style={{backgroundColor:'#faf9f7'}}>
    <div className="px-4 py-8 max-w-md mx-auto animate-[fadeInUp_0.3s_ease-out]">
      {/* CSS-only animations â€" respects prefers-reduced-motion */}
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes confirmCircle {
          to { stroke-dashoffset: 0; }
        }
        @keyframes confirmCheck {
          from { opacity: 0; transform: scale(0.5); }
          to { opacity: 1; transform: scale(1); }
        }
        @media (prefers-reduced-motion: reduce) {
          [style*="confirmCircle"],
          [style*="confirmCheck"],
          .animate-\\[fadeInUp_0\\.3s_ease-out\\] {
            animation: none !important;
            opacity: 1 !important;
            transform: none !important;
            stroke-dashoffset: 0 !important;
          }
        }
      `}</style>

      {/* Animated checkmark */}
      <div className="flex justify-center mb-6">
        <div className="relative w-20 h-20">
          <svg
            className="w-20 h-20"
            viewBox="0 0 80 80"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle
              cx="40"
              cy="40"
              r="36"
              stroke="#22c55e"
              strokeWidth="4"
              fill="#f0fdf4"
              style={{
                strokeDasharray: 226,
                strokeDashoffset: 226,
                animation: "confirmCircle 0.4s ease-out forwards",
              }}
            />
          </svg>
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{
              opacity: 0,
              animation: "confirmCheck 0.3s ease-out 0.35s forwards",
            }}
          >
            <Check className="w-10 h-10 text-green-500" strokeWidth={3} />
          </div>
        </div>
      </div>

      {/* Title */}
      <h2 className="text-xl font-semibold text-center text-slate-800 mb-6">
        {tr("confirmation.title", "Order sent!")}
      </h2>

      {/* Order summary card */}
      <Card className="mb-6">
        <CardContent className="p-4">
          {/* Items list */}
          <div className="space-y-2 mb-3">
            {items.map((item, idx) => (
              <div
                key={item.dishId || idx}
                className="flex justify-between items-center text-sm"
              >
                <span className="text-slate-700">
                  {item.name}{" "}
                  <span className="text-slate-400">x{item.quantity}</span>
                </span>
                <span className="text-slate-700 font-medium tabular-nums">
                  {formatPrice(Math.round(item.price * item.quantity * 100) / 100)}
                </span>
              </div>
            ))}
          </div>

          {/* Divider */}
          <div className="border-t border-slate-200 pt-3 mt-3">
            <div className="flex justify-between items-center">
              <span className="font-medium text-slate-800">
                {tr("confirmation.total", "Total")}
              </span>
              <span className="font-semibold text-slate-800 tabular-nums">
                {formatPrice(parseFloat(Number(totalAmount).toFixed(2)))}
              </span>
            </div>
          </div>

          {/* Client name (pickup/delivery) */}
          {clientName && orderMode !== "hall" && (
            <p className="text-sm text-slate-500 mt-1">
              {tr("confirmation.client_name", "Name")}: {clientName}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Action buttons */}
      <div className="space-y-3">
        <Button
          className="w-full h-12 text-white"
          style={{backgroundColor: primaryColor}}
          onClick={onBackToMenu}
        >
          {tr("confirmation.back_to_menu", "Back to menu")}
        </Button>

        <Button
          variant="outline"
          className="w-full h-12"
          onClick={onOpenOrders}
        >
          {tr("confirmation.my_orders", "My orders")}
        </Button>

        {/* Track order â€" pickup/delivery only (GAP-02: navigate to embedded status view) */}
        {orderMode !== "hall" && publicToken && (
          <Button
            variant="ghost"
            className="w-full h-12"
            style={{color: primaryColor}}
            onClick={() => {
              onTrackOrder(publicToken);
            }}
          >
            {tr("confirmation.track_order", "Track order")}
          </Button>
        )}
      </div>
    </div>
    </div>
  );
}

/* ============================================================
   GAP-02: ORDER STATUS SCREEN (embedded)
   Pickup/delivery guests track their order status.
   Renders inside x.jsx as a view â€" no separate /orderstatus route.
   Polls every 10s for status updates.
   ============================================================ */

const OS_POLL_INTERVAL_MS = 10000;
const OS_MAX_AGE_HOURS = 24;
const OS_TERMINAL_STATUSES = ["served", "completed", "cancelled"];
const OS_TOKEN_RE = /^[a-z0-9]{2,20}$/;
const OS_SAFE_TEL_RE = /^tel:[+\d()\-. ]+$/;
const OS_STATUS_STEPS = ["new", "in_progress", "ready"];

function osGetStepIndex(status) {
  if (status === "accepted") return 1;
  const idx = OS_STATUS_STEPS.indexOf(status);
  return idx >= 0 ? idx : 0;
}

function osGetStatusConfig(status, t) {
  const configs = {
    new: { label: t("order_status.status_new"), color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200", icon: Package },
    accepted: { label: t("order_status.status_preparing"), color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-200", icon: Clock },
    in_progress: { label: t("order_status.status_preparing"), color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-200", icon: Clock },
    ready: { label: t("order_status.status_ready"), color: "text-green-600", bg: "bg-green-50", border: "border-green-200", icon: Check },
    served: { label: t("order_status.status_served"), color: "text-slate-500", bg: "bg-slate-50", border: "border-slate-200", icon: Check },
    completed: { label: t("order_status.status_served"), color: "text-slate-500", bg: "bg-slate-50", border: "border-slate-200", icon: Check },
    cancelled: { label: t("order_status.status_cancelled"), color: "text-red-600", bg: "bg-red-50", border: "border-red-200", icon: XCircle },
  };
  return configs[status] || configs.new;
}

function OSStatusProgress({ currentStatus, t }) {
  const currentIdx = osGetStepIndex(currentStatus);
  const isCancelled = currentStatus === "cancelled";
  const isTerminal = OS_TERMINAL_STATUSES.includes(currentStatus) || currentStatus === "ready";

  const steps = [
    { key: "new", label: t("order_status.step_received") },
    { key: "in_progress", label: t("order_status.step_preparing") },
    { key: "ready", label: t("order_status.step_ready") },
  ];

  if (isCancelled) {
    return (
      <div className="flex items-center justify-center gap-2 py-4">
        <XCircle className="w-5 h-5 text-red-500" />
        <span className="text-red-600 font-medium">{t("order_status.status_cancelled")}</span>
      </div>
    );
  }

  return (
    <div className="py-4">
      <div className="flex items-center justify-between relative">
        <div className="absolute top-4 left-8 right-8 h-0.5 bg-slate-200" />
        <div
          className="absolute top-4 left-8 h-0.5 bg-green-500 transition-all duration-500"
          style={{
            width: isTerminal
              ? "calc(100% - 4rem)"
              : `calc(${(currentIdx / (steps.length - 1)) * 100}% - ${currentIdx === 0 ? 0 : 2}rem)`,
          }}
        />
        {steps.map((step, idx) => {
          const isComplete = isTerminal || idx < currentIdx;
          const isCurrent = !isTerminal && idx === currentIdx;
          return (
            <div key={step.key} className="flex flex-col items-center relative z-10">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                  isComplete
                    ? "bg-green-500 border-green-500"
                    : isCurrent
                      ? "bg-white border-orange-400 ring-4 ring-orange-100"
                      : "bg-white border-slate-200"
                }`}
              >
                {isComplete ? (
                  <Check className="w-4 h-4 text-white" />
                ) : isCurrent ? (
                  <div className="w-2 h-2 rounded-full bg-orange-400 animate-pulse" />
                ) : (
                  <div className="w-2 h-2 rounded-full bg-slate-300" />
                )}
              </div>
              <span
                className={`text-xs mt-2 text-center max-w-[80px] ${
                  isComplete ? "text-green-600 font-medium" : isCurrent ? "text-orange-600 font-medium" : "text-slate-400"
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function OrderStatusScreen({ token, partnerId: knownPartnerId, onBackToMenu, t }) {
  const [lastUpdated, setLastUpdated] = useState(null);
  const [secondsAgo, setSecondsAgo] = useState(0);

  const {
    data: orderData,
    isLoading: loadingOrder,
    error: orderError,
    refetch: refetchOrder,
  } = useQuery({
    queryKey: ["orderByToken", token],
    enabled: !!token && OS_TOKEN_RE.test(token),
    retry: 1,
    staleTime: OS_POLL_INTERVAL_MS,
    queryFn: async () => {
      const orders = await base44.entities.Order.filter({ public_token: token });
      if (!orders || orders.length === 0) return null;
      return orders[0];
    },
  });

  const order = orderData || null;
  const partnerId = order?.partner || knownPartnerId;
  const orderId = order?.id;
  const orderStatus = order?.status || "new";
  const isTerminal = OS_TERMINAL_STATUSES.includes(orderStatus);

  const isExpired = useMemo(() => {
    if (!order?.created_date) return false;
    const created = new Date(order.created_date);
    return Date.now() - created > OS_MAX_AGE_HOURS * 60 * 60 * 1000;
  }, [order?.created_date]);

  const { data: partner } = useQuery({
    queryKey: ["statusPartner", partnerId],
    enabled: !!partnerId,
    retry: 1,
    queryFn: async () => {
      const partners = await base44.entities.Partner.filter({ id: partnerId });
      return partners?.[0] || null;
    },
  });
  const statusPrimaryColor = partner?.primary_color || '#1A1A1A';

  const { data: orderItems = [] } = useQuery({
    queryKey: ["statusOrderItems", orderId],
    enabled: !!orderId,
    retry: 1,
    staleTime: Infinity,
    queryFn: async () => {
      return await base44.entities.OrderItem.filter({ order: orderId });
    },
  });

  const { data: contactLinks = [] } = useQuery({
    queryKey: ["statusContactLinks", partnerId],
    enabled: !!partnerId,
    retry: 1,
    staleTime: Infinity,
    queryFn: async () => {
      return await base44.entities.PartnerContactLink.filter({ partner: partnerId });
    },
  });

  const phoneLink = useMemo(() => {
    return contactLinks.find(
      (link) => link.is_active !== false && typeof link.url === "string" && OS_SAFE_TEL_RE.test(link.url)
    );
  }, [contactLinks]);

  // Polling for status updates
  // Polling for status updates (closure variable instead of ref)
  useEffect(() => {
    if (!token || !order || isTerminal || isExpired) return;
    const id = setInterval(async () => {
      try {
        const result = await refetchOrder();
        if (result.data) setLastUpdated(new Date());
      } catch { /* retry on next poll */ }
    }, OS_POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, [token, order?.id, isTerminal, isExpired, refetchOrder]);

  // Set initial lastUpdated
  useEffect(() => {
    if (order && !lastUpdated) setLastUpdated(new Date());
  }, [order, lastUpdated]);

  // "seconds ago" counter â€" stops when order is terminal (P0 fix)
  useEffect(() => {
    if (!lastUpdated || isTerminal) return;
    const tick = () => setSecondsAgo(Math.floor((Date.now() - lastUpdated.getTime()) / 1000));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [lastUpdated, isTerminal]);

  const formatPrice = (amount) => {
    if (amount == null) return "";
    const currency = partner?.currency || "";
    const symbol = partner?.currency_symbol || currency;
    const num = Number(amount);
    if (isNaN(num)) return String(amount);
    const rounded = Math.round(num * 100) / 100;
    const formatted = Number.isInteger(rounded) ? rounded.toLocaleString('ru-KZ') : rounded.toFixed(2);
    return symbol ? `${formatted} ${symbol}` : formatted;
  };

  const itemsTotal = useMemo(() => {
    return orderItems.reduce((sum, item) => {
      const lineTotal = Number(item.line_total) || (Number(item.dish_price) * Number(item.quantity)) || 0;
      return sum + lineTotal;
    }, 0);
  }, [orderItems]);

  const displayTotal = order?.total_amount != null ? order.total_amount : itemsTotal;

  // Invalid token
  if (!token || !OS_TOKEN_RE.test(token)) {
    return (
      <div className="fixed inset-0 z-[60] overflow-y-auto" style={{backgroundColor:'#faf9f7'}}>
        <div className="min-h-screen flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardContent className="p-8 text-center">
              <XCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
              <h2 className="text-lg font-semibold text-slate-800 mb-2">{t("order_status.no_token")}</h2>
              <p className="text-sm text-slate-500 mb-4">{t("order_status.check_link")}</p>
              <Button variant="outline" className="min-h-[44px]" onClick={onBackToMenu}>{t("order_status.back_to_menu")}</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Loading
  if (loadingOrder) {
    return (
      <div className="fixed inset-0 z-[60]" style={{backgroundColor:'#faf9f7'}}>
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin" style={{color: statusPrimaryColor}} />
        </div>
      </div>
    );
  }

  // Network/backend error â€" retryable (PM-074)
  if (orderError) {
    return (
      <div className="fixed inset-0 z-[60] overflow-y-auto" style={{backgroundColor:'#faf9f7'}}>
        <div className="min-h-screen flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardContent className="p-8 text-center">
              <XCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
              <h2 className="text-lg font-semibold text-slate-800 mb-2">{t("error.network_error")}</h2>
              <p className="text-sm text-slate-500 mb-4">{t("error.check_connection")}</p>
              <Button variant="outline" className="min-h-[44px]" onClick={() => refetchOrder()}>
                {t("common.retry")}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Order genuinely not found (query succeeded, returned null)
  if (!order) {
    return (
      <div className="fixed inset-0 z-[60] overflow-y-auto" style={{backgroundColor:'#faf9f7'}}>
        <div className="min-h-screen flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardContent className="p-8 text-center">
              <XCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
              <h2 className="text-lg font-semibold text-slate-800 mb-2">{t("order_status.not_found")}</h2>
              <p className="text-sm text-slate-500 mb-4">{t("order_status.check_link")}</p>
              <Button variant="outline" className="min-h-[44px]" onClick={onBackToMenu}>{t("order_status.back_to_menu")}</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Expired
  if (isExpired) {
    return (
      <div className="fixed inset-0 z-[60] overflow-y-auto" style={{backgroundColor:'#faf9f7'}}>
        <div className="min-h-screen flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardContent className="p-8 text-center">
              <Clock className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <h2 className="text-lg font-semibold text-slate-800 mb-2">{t("order_status.expired")}</h2>
              <Button variant="outline" className="min-h-[44px] mt-4" onClick={onBackToMenu}>{t("order_status.back_to_menu")}</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Main order status view
  const statusConfig = osGetStatusConfig(orderStatus, t);
  const StatusIcon = statusConfig.icon;

  return (
    <div className="fixed inset-0 z-[60] bg-slate-50 overflow-y-auto">
      <div className="max-w-md mx-auto px-4 py-6">
        {/* Back button */}
        <button
          className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 mb-4 min-h-[44px]"
          onClick={onBackToMenu}
        >
          <ArrowLeft className="w-4 h-4" />
          {t("order_status.back_to_menu")}
        </button>

        {/* Restaurant header */}
        <div className="flex items-center gap-3 mb-6">
          {partner?.logo && (
            <img src={partner.logo} alt="" referrerPolicy="no-referrer" className="w-10 h-10 rounded-lg object-cover" />
          )}
          {partner?.name && (
            <h1 className="text-base font-semibold text-slate-800">{partner.name}</h1>
          )}
        </div>

        {/* Order number + status badge */}
        <Card className={`mb-4 border ${statusConfig.border}`}>
          <CardContent className="p-5">
            {order.order_number != null && (
              <>
                <p className="text-sm text-slate-500 mb-1">{t("order_status.order_number")}</p>
                <p className="text-2xl font-bold text-slate-800 mb-4">#{order.order_number}</p>
              </>
            )}
            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${statusConfig.bg} ${statusConfig.color}`}>
              <StatusIcon className="w-4 h-4" />
              {statusConfig.label}
            </div>
            <OSStatusProgress currentStatus={orderStatus} t={t} />
            {lastUpdated && !isTerminal && (
              <p className="text-xs text-slate-400 mt-2">
                {t("order_status.last_updated")}: {secondsAgo < 5
                  ? t("order_status.just_now")
                  : t("order_status.seconds_ago", { seconds: secondsAgo })}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Order items */}
        {orderItems.length > 0 && (
          <Card className="mb-4">
            <CardContent className="p-4">
              <p className="text-sm font-medium text-slate-600 mb-3">{t("order_status.your_order")}</p>
              <div className="space-y-2">
                {orderItems.map((item, idx) => (
                  <div key={item.id || idx} className="flex justify-between items-center text-sm">
                    <span className="text-slate-700">
                      {item.dish_name} <span className="text-slate-400">x{item.quantity}</span>
                    </span>
                    <span className="text-slate-700 font-medium tabular-nums">
                      {formatPrice(item.line_total != null ? item.line_total : item.dish_price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>
              <div className="border-t border-slate-200 pt-3 mt-3">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-slate-800">{t("order_status.total")}</span>
                  <span className="font-semibold text-slate-800 tabular-nums">{formatPrice(displayTotal)}</span>
                </div>
              </div>
              {order.discount_amount > 0 && (
                <p className="text-xs text-green-600 mt-2">
                  {t("order_status.discount")}: -{formatPrice(order.discount_amount)}
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Contact restaurant */}
        {phoneLink && (
          <Card className="mb-4">
            <CardContent className="p-4">
              <p className="text-sm text-slate-600 mb-3">{t("order_status.questions")}</p>
              <a
                href={phoneLink.url}
                className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors min-h-[44px]"
              >
                <Phone className="w-5 h-5" style={{color: statusPrimaryColor}} />
                <span className="text-sm font-medium" style={{color: statusPrimaryColor}}>{phoneLink.url.replace("tel:", "")}</span>
              </a>
            </CardContent>
          </Card>
        )}

        {/* Terminal / refresh info */}
        {isTerminal && (
          <div className="text-center pt-2">
            <p className="text-sm text-slate-500 mb-3">
              {orderStatus === "cancelled" ? t("order_status.order_cancelled_info") : t("order_status.order_complete_info")}
            </p>
          </div>
        )}
        {!isTerminal && (
          <div className="text-center pt-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-slate-400 hover:text-slate-600"
              onClick={async () => {
                const result = await refetchOrder();
                if (result.data) setLastUpdated(new Date());
              }}
            >
              <RefreshCw className="w-4 h-4 mr-1" />
              {t("order_status.refresh")}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ============================================================
   TABLE CODE VERIFICATION HELPERS (simplified)
   P0-3: Only use Table.code for verification
   ============================================================ */

// Extract digits only from any value
const digits = (v) => String(v || "").replace(/\D/g, "");

// Normalize link fields from Base44 (CODE-026)
function getLinkId(field) {
  if (field == null) return null;
  if (typeof field === "string" || typeof field === "number") return String(field);
  if (typeof field === "object") {
    const v = field.id ?? field._id ?? field.value ?? null;
    if (typeof v === "string" || typeof v === "number") return String(v);
    if (v && typeof v === "object") {
      const vv = v.id ?? v._id ?? null;
      if (typeof vv === "string" || typeof vv === "number") return String(vv);
    }
  }
  return null;
}

// Helper: format order creation time (handles created_at or created_date)
function formatOrderTime(order) {
  const ts = order?.created_at || order?.created_date || order?.createdAt || null;
  if (!ts) return "";
  const d = new Date(ts);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
}

export default function X() {
  const { lang, setLang, t: rawT } = useI18n();
  const t = makeSafeT(rawT, lang);

  // Safe translation with explicit fallback (kept for backward compat)
  const tr = (key, fallback) => {
    const val = t(key);
    return val || fallback;
  };

  const location = useLocation();
  const queryClient = useQueryClient();

  const searchParams = useMemo(
    () => new URLSearchParams(location.search),
    [location.search]
  );

  // partner required
  const partnerParamRaw = (searchParams.get("partner") || searchParams.get("p") || "").trim();

  // lang param from URL
  const langParam = (searchParams.get("lang") || "").trim().toUpperCase();

  // UI state
  const [orderMode, setOrderMode] = useState(() => {
    const modeParam = new URLSearchParams(location.search).get("mode");
    return normalizeMode(modeParam);
  });

  // GAP-02: Restore order status view from URL param (?track=<token>)
  const initialTrackToken = useMemo(() => {
    const p = new URLSearchParams(location.search).get("track");
    return p && /^[a-z0-9]{2,20}$/.test(p) ? p : null;
  }, []);

  const [view, setView] = useState(initialTrackToken ? "orderstatus" : "menu"); /* menu | checkout | confirmation | orderstatus */

  // GAP-01: Order Confirmation Screen state
  const [confirmationData, setConfirmationData] = useState(null);

  // GAP-02: Order Status tracking token (refresh-safe via ?track= URL param)
  const [orderStatusToken, setOrderStatusToken] = useState(initialTrackToken);
  
  // TASK-260203-01: Drawer state
  const [drawerMode, setDrawerMode] = useState(null); // 'cart' | null

  // Just-in-time table confirmation (Batch A+5 Fix 1)
  const [showTableConfirmSheet, setShowTableConfirmSheet] = useState(false);
  const pendingSubmitRef = useRef(false);

  // PM-105: Ref-based overlay stack for Android back button priority
  const overlayStackRef = useRef([]);
  const isPopStateClosingRef = useRef(false);
  const isProgrammaticCloseRef = useRef(false);

  const pushOverlay = useCallback((name) => {
    overlayStackRef.current = [...overlayStackRef.current.filter(n => n !== name), name];
    window.history.pushState({ sheet: name }, '');
  }, []);

  const popOverlay = useCallback((name) => {
    overlayStackRef.current = overlayStackRef.current.filter(n => n !== name);
    if (!isPopStateClosingRef.current) {
      isProgrammaticCloseRef.current = true;
      window.history.back();
    }
  }, []);
  
  const [activeCategoryKey, setActiveCategoryKey] = useState("all");
  const [cart, setCart] = useState([]); // { dishId, name, price, quantity }
  const cartRestoredRef = useRef(false);

  // Mobile breakpoint detection
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia("(max-width: 767px)").matches;
  });

  // Mobile layout preference (tile | list) â€" S72: default list for mobile-first UX
  const [mobileLayout, setMobileLayout] = useState('list');

  // Redirect banner state
  const [redirectBanner, setRedirectBanner] = useState(null);

  // Dish reviews modal state
  const [selectedDishId, setSelectedDishId] = useState(null);

  // PM-102: Dish detail dialog state
  const [detailDish, setDetailDish] = useState(null);

  // Form
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [comment, setComment] = useState("");
  const [errors, setErrors] = useState({});

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  // Guest code (4-digit code for showing to waiter)
  const [guestCode, setGuestCode] = useState(null);

  // Hall UI state (not in session hook)
  const [splitType, setSplitType] = useState('single'); // 'single' | 'all'
  const [otherGuestsExpanded, setOtherGuestsExpanded] = useState(false);
  const [guestNameInput, setGuestNameInput] = useState(() => {
    try { return localStorage.getItem('menuapp_guest_name') || ''; } catch (e) { return ''; }
  });
  const [isEditingName, setIsEditingName] = useState(false);

  // Bill request state
  const [billRequested, setBillRequested] = useState(false);
  const [billCooldown, setBillCooldown] = useState(false);

  // Rating flow state (TASK-260130-09)
  const [hasRatedInSession, setHasRatedInSession] = useState(false);
  const [ratingSavingByItemId, setRatingSavingByItemId] = useState({});

  // Partner fetch (id or slug) - MUST BE FIRST before any partner dependencies
  const { data: partner, isLoading: loadingPartner, error: partnerError, refetch: refetchPartner } = useQuery({
    queryKey: ["publicPartner", partnerParamRaw],
    enabled: !!partnerParamRaw,
    retry: shouldRetry,
    queryFn: async () => {
      const p = partnerParamRaw;
      if (!p) return null;

      const byIdFirst = looksLikePartnerId(p);
      let primaryError = null;

      try {
        const res = await base44.entities.Partner.filter(byIdFirst ? { id: p } : { slug: p });
        if (res?.[0]) return res[0];
      } catch (e) {
        primaryError = e;
      }

      // Fallback lookup â€" let errors propagate to React Query (PM-070)
      const res2 = await base44.entities.Partner.filter(byIdFirst ? { slug: p } : { id: p });
      if (res2?.[0]) return res2[0];
      if (primaryError) throw primaryError;
      return null;
    },
  });

  const primaryColor = partner?.primary_color || '#1A1A1A';

  // Breakpoint listener
  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 767px)");
    
    const handleChange = (e) => {
      setIsMobile(e.matches);
    };
    
    mediaQuery.addEventListener('change', handleChange);
    
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  // Load mobile layout preference from localStorage
  useEffect(() => {
    if (!partner) return;
    
    const partnerKey = partner.id || partner._id || partner.slug || partner.code;
    if (!partnerKey) return;
    
    try {
      const storageKey = `menuMobileLayout:${partnerKey}`;
      const saved = localStorage.getItem(storageKey);
      
      if (saved === 'tile' || saved === 'list') {
        setMobileLayout(saved);
      } else {
        // Default based on partner setting â€" S72: default list unless partner set 2-col grid
        const mobileGrid = Number(partner.menu_grid_mobile ?? 1);
        const defaultLayout = mobileGrid === 2 ? 'tile' : 'list';
        setMobileLayout(defaultLayout);
      }
    } catch (e) {
      // Failed to load mobile layout preference â€" silent in prod
    }
  }, [partner?.id, partner?._id, partner?.slug, partner?.code]);

  // Save mobile layout preference to localStorage
  const handleSetMobileLayout = (layout) => {
    setMobileLayout(layout);
    
    if (!partner) return;
    
    const partnerKey = partner.id || partner._id || partner.slug || partner.code;
    if (!partnerKey) return;
    
    try {
      const storageKey = `menuMobileLayout:${partnerKey}`;
      localStorage.setItem(storageKey, layout);
    } catch (e) {
      // Failed to save mobile layout preference â€" silent in prod
    }
  };

  // Save cart to localStorage on every change
  // BUG-PM-005: guard against saving empty cart before restore completes
  useEffect(() => {
    if (!partner?.id) return;
    if (!cartRestoredRef.current) return;
    saveCartToStorage(partner.id, cart);
  }, [cart, partner?.id]);

  // PM-153: Auto-save guest name to localStorage on every change (survives Chrome kill)
  useEffect(() => {
    if (!guestNameInput) return;
    try { localStorage.setItem('menuapp_guest_name', guestNameInput); } catch(e) {}
  }, [guestNameInput]);

  // Restore cart from localStorage on page load (once)
  // BUG-PM-005: mark restored before setCart to prevent save effect from firing on stale empty cart
  useEffect(() => {
    if (cartRestoredRef.current) return;
    if (!partner?.id) return;
    cartRestoredRef.current = true;

    const savedCart = getCartFromStorage(partner.id);
    if (savedCart && savedCart.length > 0 && cart.length === 0) {
      setCart(savedCart);
    }
  }, [partner?.id]);

  // Scroll refs
  const sectionRefs = useRef({});
  const chipRefs = useRef({});
  const listTopRef = useRef(null);
  const isManualScroll = useRef(false);
  const submitLockRef = useRef(false); // CODE-024: protect from double-tap
  const viewTransitionTimerRef = useRef(null);
  const codeInputRef = useRef(null); // PM-088: ref for table code hidden input
  const autoSubmitTimerRef = useRef(null); // PM-075: cleanup for auto-submit timeout

  // Cleanup view transition timer on unmount
  useEffect(() => {
    return () => {
      if (viewTransitionTimerRef.current) clearTimeout(viewTransitionTimerRef.current);
    };
  }, []);

  // GAP-01: Dismiss confirmation screen and return to menu
  const dismissConfirmation = useCallback(() => {
    setConfirmationData(null);
    setOrderStatusToken(null);
    setView("menu");
  }, []);

  // GAP-01: Show confirmation screen (no auto-dismiss â€" user navigates via buttons)
  const showConfirmation = useCallback((data) => {
    setConfirmationData(data);
    setView("confirmation");
    popOverlay('cart');
    setDrawerMode(null);
  }, []);

  // GAP-02: Navigate from confirmation to order status tracking
  const handleTrackOrder = useCallback((token) => {
    setConfirmationData(null);
    setOrderStatusToken(token);
    setView("orderstatus");
    // Mirror token into URL for refresh resilience
    const url = new URL(window.location.href);
    url.searchParams.set("track", token);
    window.history.replaceState({}, "", url.toString());
  }, []);

  // GAP-02: Dismiss order status and return to menu
  const dismissOrderStatus = useCallback(() => {
    setOrderStatusToken(null);
    setView("menu");
    // Remove track param from URL
    const url = new URL(window.location.href);
    url.searchParams.delete("track");
    window.history.replaceState({}, "", url.toString());
  }, []);

  // Change 2a/2c: Scroll to top when switching to checkout, confirmation, or orderstatus
  useEffect(() => {
    if (view === "checkout" || view === "confirmation" || view === "orderstatus") {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [view]);

  // Language change handler (updates URL)
  const handleLangChange = (newLang) => {
    setLang(newLang);
    const url = new URL(window.location.href);
    url.searchParams.set("lang", newLang);
    window.history.replaceState({}, "", url.toString());
  };

  // Contact link click handler (SEC-021: XSS protection + noopener)
  const handleContactClick = (link) => {
    const url = String(link.url || "");
    if (!isSafeUrl(url)) {
      toast.error(t('error.invalid_link'), { id: 'mm1' });
      return;
    }
    if (url.startsWith("tel:") || url.startsWith("mailto:")) {
      window.location.href = url;
    } else {
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  // Hall table verification hook
  const {
    tableCodeParam,
    resolvedTable,
    isHallMode,
    tableCodeInput,
    setTableCodeInput,
    isVerifyingCode,
    verifiedByCode,
    verifiedTableId,
    verifiedTable,
    codeVerificationError,
    verifyTableCode,
  } = useHallTable({ partner, location, orderMode, t });

  // Auto-clear code input after wrong entry (PM-069)
  useEffect(() => {
    if (codeVerificationError && !isVerifyingCode) {
      const timer = setTimeout(() => {
        if (typeof setTableCodeInput === 'function') setTableCodeInput('');
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [codeVerificationError, isVerifyingCode]);

  // Helper for saving table selection (used by help requests and other features)
  const saveTableSelection = (partnerId, tableId) => {
    if (!partnerId || !tableId) return;
    try {
      const key = `menuApp_table_${partnerId}`;
      localStorage.setItem(
        key,
        JSON.stringify({ partnerId, tableId, timestamp: Date.now() })
      );
    } catch (e) {
      /* silent â€" localStorage save is best-effort */
    }
  };

  // Hall settings (simplified - only guest code)
  const hallGuestCodeEnabled = partner?.hall_guest_code_enabled === true;

  // Set language from URL param or partner default
  useEffect(() => {
    if (!partner) return;
    
    const partnerDefault = partner.default_language || "RU";
    const enabledLangs = Array.isArray(partner.enabled_languages) && partner.enabled_languages.length > 0
      ? partner.enabled_languages
      : [partnerDefault];
    
    if (langParam && enabledLangs.includes(langParam)) {
      if (lang !== langParam) setLang(langParam);
    } else if (!enabledLangs.includes(lang)) {
      setLang(partnerDefault);
    }
  }, [partner?.id, partner?.default_language, langParam]);
  // P0-7: Removed hallTableSelectEnabled - no dropdown

  // P0-1: Table verified ONLY when actually resolved or verified by code input
  // Removed hasTableInUrl from condition - URL param alone doesn't mean verified
  const isTableVerified = isHallMode && (!!resolvedTable?.id || verifiedByCode);

  // Table code config (for Bottom Sheet â€" PM-064)
  const tableCodeLength = useMemo(() => {
    const n = Number(partner?.table_code_length);
    return (Number.isFinite(n) && n > 0) ? Math.max(3, Math.min(8, Math.round(n))) : 4;
  }, [partner?.table_code_length]);

  // P0-7: Removed activeTables query - no dropdown needed

  // P0-2: currentTableId only from resolved table or code verification
  const currentTableId = resolvedTable?.id || verifiedTableId || null;
  
  // Current table object for display (from QR resolve or code verify)
  const currentTable = resolvedTable || verifiedTable || null;

  // Help / ServiceRequest hook
  const {
    isHelpModalOpen,
    setIsHelpModalOpen,
    selectedHelpType,
    helpComment,
    setHelpComment,
    isSendingHelp,
    helpSubmitError,
    fabSuccess,
    hasActiveRequest,
    handleOpenHelpModal,
    handlePresetSelect,
    submitHelpRequest,
  } = useHelpRequests({ partner, currentTableId, t, toast, isRateLimitError, saveTableSelection });

  // HD-01..HD-08: Help drawer mini-ticket board state
  const HELP_SYNC_INTERVAL_MS = 5000;
  const HELP_STALE_AFTER_MS = HELP_SYNC_INTERVAL_MS * 3;
  const HELP_RESTORE_TTL_MS = 6 * 60 * 60 * 1000;
  const HELP_MATCH_GRACE_MS = 2 * 60 * 1000;
  const HELP_RESOLVED_HIDE_MS = 4000;
  const HELP_CLOSED_HIDE_MS = 2000;
  const HELP_PREVIEW_LIMIT = 2;
  const HELP_REQUEST_TYPES = useMemo(() => new Set(['call_waiter', 'bill', 'napkins', 'menu', 'other']), []);
  const HELP_ACTIVE_SERVER_STATUSES = useMemo(() => new Set(['new', 'in_progress']), []);
  const HELP_DONE_SERVER_STATUSES = useMemo(() => new Set(['done']), []);
  const HELP_COOLDOWN_SECONDS = useMemo(() => ({ call_waiter: 90, bill: 150, napkins: 240, menu: 240, other: 120 }), []);
  const HELP_CARD_LABELS = useMemo(() => ({
    call_waiter: tr('help.call_waiter', 'Call a waiter'),
    bill: tr('help.bill', 'Bring the bill'),
    napkins: tr('help.napkins', 'Napkins'),
    menu: tr('help.menu', 'Paper menu'),
    other: tr('help.other_label', 'Other'),
  }), [tr]);
  const HELP_CHIPS = useMemo(() => [
    tr('help.chip.high_chair', 'High chair'),
    tr('help.chip.cutlery', 'Cutlery'),
    tr('help.chip.sauce', 'Sauce'),
    tr('help.chip.clear_table', 'Clear the table'),
    tr('help.chip.water', 'Water'),
  ], [tr]);

  const [requestStates, setRequestStates] = useState({});
  const hasLoadedHelpStatesRef = useRef(false);
  const [undoToast, setUndoToast] = useState(null); // { type, rowId, message?, tableId, expiresAt, timeoutId }
  const [showOtherForm, setShowOtherForm] = useState(false);
  const [timerTick, setTimerTick] = useState(0);
  const pendingQuickSendRef = useRef(null); // { type, action, rowId, message }
  const [pendingHelpActionTick, setPendingHelpActionTick] = useState(0);
  const currentTableIdRef = useRef(currentTableId);
  const [isHelpRestoring, setIsHelpRestoring] = useState(false);
  const [isHelpOnline, setIsHelpOnline] = useState(() => (typeof navigator === 'undefined' ? true : navigator.onLine));
  const ticketBoardRef = useRef(null);
  const [highlightedTicket, setHighlightedTicket] = useState(null);
  const [isTicketExpanded, setIsTicketExpanded] = useState(false);

  useEffect(() => {
    currentTableIdRef.current = currentTableId;
  }, [currentTableId]);

  useEffect(() => {
    const handleOnline = () => setIsHelpOnline(true);
    const handleOffline = () => setIsHelpOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const getHelpCooldownMs = useCallback((type) => {
    return (HELP_COOLDOWN_SECONDS[type] || HELP_COOLDOWN_SECONDS.other || 120) * 1000;
  }, [HELP_COOLDOWN_SECONDS]);

  const normalizeHelpMessage = useCallback((value) => String(value || '').trim(), []);
  const getHelpMessageKey = useCallback((value) => normalizeHelpMessage(value).toLowerCase(), [normalizeHelpMessage]);

  const parseHelpTimestamp = useCallback((value) => {
    const ms = value ? new Date(value).getTime() : NaN;
    return Number.isFinite(ms) ? ms : null;
  }, []);

  const getNormalizedHelpState = useCallback((type, state, now = Date.now()) => {
    if (!state) return null;

    const message = normalizeHelpMessage(state.message || state.comment);
    const sentAt = Number(state.sentAt) || parseHelpTimestamp(state.sentAt) || null;
    const reminderCount = Math.max(0, Number(state.reminderCount) || 0);
    const lastReminderAt = Number(state.lastReminderAt) || parseHelpTimestamp(state.lastReminderAt) || null;
    const remindCooldownUntil =
      Number(state.remindCooldownUntil) ||
      parseHelpTimestamp(state.remindCooldownUntil) ||
      ((lastReminderAt || sentAt) ? (lastReminderAt || sentAt) + getHelpCooldownMs(type) : null);

    if (!sentAt && state.status !== 'closed_by_guest' && state.status !== 'resolved') return null;

    if (state.status === 'closed_by_guest' || state.status === 'resolved') {
      return {
        ...state,
        id: state.id || (type === 'other' ? `other-${sentAt || now}` : type),
        message,
        sentAt: sentAt || now,
        reminderCount,
        lastReminderAt,
        remindCooldownUntil,
        isActive: false,
        isVisible: !state.terminalHideAt || state.terminalHideAt > now,
      };
    }

    if (state.status === 'sending') {
      return {
        ...state,
        id: state.id || (type === 'other' ? `other-${sentAt || now}` : type),
        message,
        sentAt,
        reminderCount,
        lastReminderAt,
        remindCooldownUntil,
        isActive: true,
        isVisible: true,
      };
    }

    const cooldownActive = Boolean(remindCooldownUntil && remindCooldownUntil > now);
    const normalizedStatus = cooldownActive
      ? (reminderCount > 0 ? 'reminded' : 'sent')
      : 'remind_available';

    return {
      ...state,
      id: state.id || (type === 'other' ? `other-${sentAt}` : type),
      status: normalizedStatus,
      message,
      sentAt,
      reminderCount,
      lastReminderAt,
      remindCooldownUntil,
      isActive: true,
      isVisible: true,
    };
  }, [getHelpCooldownMs, normalizeHelpMessage, parseHelpTimestamp]);

  const ticketRows = useMemo(() => {
    const now = Date.now();
    const list = [];

    Object.entries(requestStates).forEach(([type, state]) => {
      if (type === 'other') {
        const rows = Array.isArray(state) ? state : [state].filter(Boolean);
        rows.forEach((entry) => {
          const normalized = getNormalizedHelpState('other', entry, now);
          if (normalized && (normalized.isVisible || normalized.isActive)) {
            list.push({ ...normalized, type: 'other', id: normalized.id });
          }
        });
        return;
      }

      const normalized = getNormalizedHelpState(type, state, now);
      if (normalized && (normalized.isVisible || normalized.isActive)) {
        list.push({ ...normalized, type, id: normalized.id || type });
      }
    });

    return list.sort((a, b) => {
      if (a.isActive !== b.isActive) return a.isActive ? -1 : 1;
      return (b.sentAt || 0) - (a.sentAt || 0);
    });
  }, [getNormalizedHelpState, requestStates, timerTick]);

  const activeRequests = useMemo(() => ticketRows.filter((row) => row.isActive), [ticketRows]);
  const activeRequestCount = useMemo(() => activeRequests.length, [activeRequests]);

  // HD-05: Load requestStates from localStorage on mount / table change
  useEffect(() => {
    if (!currentTableId) {
      setRequestStates({});
      setUndoToast((prev) => {
        if (prev?.timeoutId) clearTimeout(prev.timeoutId);
        return null;
      });
      pendingQuickSendRef.current = null;
      setPendingHelpActionTick(0);
      setIsHelpRestoring(false);
      hasLoadedHelpStatesRef.current = true;
      return;
    }

    try {
      const key = `helpdrawer_${currentTableId}`;
      const stored = localStorage.getItem(key);
      if (!stored) {
        setRequestStates({});
        setIsHelpRestoring(false);
        hasLoadedHelpStatesRef.current = true;
        return;
      }

      const parsed = JSON.parse(stored);
      const now = Date.now();
      const restored = {};
      const restoreEntry = (type, rawEntry, fallbackId) => {
        if (!rawEntry) return null;
        const sentAt = Number(rawEntry.sentAt) || parseHelpTimestamp(rawEntry.sentAt) || null;
        if (!sentAt || rawEntry.status === 'sending' || (now - sentAt) > HELP_RESTORE_TTL_MS) return null;

        const mappedStatus =
          rawEntry.status === 'pending'
            ? 'sent'
            : rawEntry.status === 'repeat'
              ? 'remind_available'
              : rawEntry.status;

        if (mappedStatus === 'resolved' || mappedStatus === 'closed_by_guest') return null;

        return {
          id: rawEntry.id || fallbackId,
          status: mappedStatus || 'sent',
          message: normalizeHelpMessage(rawEntry.message || rawEntry.comment),
          sentAt,
          reminderCount: Math.max(0, Number(rawEntry.reminderCount) || 0),
          lastReminderAt: Number(rawEntry.lastReminderAt) || parseHelpTimestamp(rawEntry.lastReminderAt) || null,
          remindCooldownUntil: Number(rawEntry.remindCooldownUntil) || parseHelpTimestamp(rawEntry.remindCooldownUntil) || null,
          pendingAction: null,
          errorKind: null,
          errorMessage: '',
          terminalHideAt: null,
          syncSource: 'local',
        };
      };

      for (const [type, state] of Object.entries(parsed || {})) {
        if (type === 'other') {
          const otherRows = (Array.isArray(state) ? state : [state])
            .map((entry, index) => restoreEntry('other', entry, entry?.id || `other-${index}`))
            .filter(Boolean);
          if (otherRows.length > 0) restored.other = otherRows;
          continue;
        }

        const restoredEntry = restoreEntry(type, state, type);
        if (restoredEntry) restored[type] = restoredEntry;
      }

      setRequestStates(restored);
      setIsHelpRestoring(Object.keys(restored).length > 0);
    } catch (e) {
      setRequestStates({});
      setIsHelpRestoring(false);
    }

    hasLoadedHelpStatesRef.current = true;
  }, [currentTableId, normalizeHelpMessage, parseHelpTimestamp]);

  const hasAnyHelpState = useMemo(() => {
    const now = Date.now();
    return Object.entries(requestStates).some(([type, state]) => {
      if (type === 'other') {
        const rows = Array.isArray(state) ? state : [state].filter(Boolean);
        return rows.some((entry) => {
          const normalized = getNormalizedHelpState('other', entry, now);
          return normalized && (normalized.isActive || normalized.isVisible || normalized.pendingAction || normalized.errorKind);
        });
      }
      const normalized = getNormalizedHelpState(type, state, now);
      return normalized && (normalized.isActive || normalized.isVisible || normalized.pendingAction || normalized.errorKind);
    });
  }, [getNormalizedHelpState, requestStates, timerTick]);

  const helpSyncEnabled = Boolean(partner?.id && currentTableId && (isHelpModalOpen || hasAnyHelpState || isHelpRestoring));
  const { data: helpRequestFeed = [], isError: isHelpSyncError, dataUpdatedAt: helpSyncUpdatedAt } = useQuery({
    queryKey: ['helpDrawerRequests', partner?.id, currentTableId],
    enabled: helpSyncEnabled,
    retry: shouldRetry,
    refetchInterval: helpSyncEnabled ? HELP_SYNC_INTERVAL_MS : false,
    refetchIntervalInBackground: false,
    queryFn: async () => {
      const rows = await base44.entities.ServiceRequest.filter({ partner: partner.id, table: currentTableId });
      return Array.isArray(rows) ? rows.filter((row) => HELP_REQUEST_TYPES.has(row?.request_type)) : [];
    },
  });

  const normalizedHelpRequests = useMemo(() => {
    return (helpRequestFeed || [])
      .map((request) => {
        const type = request?.request_type;
        if (!HELP_REQUEST_TYPES.has(type)) return null;
        return {
          id: String(request.id || `${type}-${request.created_date || Math.random()}`),
          type,
          status: String(request.status || '').toLowerCase(),
          createdAt: parseHelpTimestamp(request.updated_date) || parseHelpTimestamp(request.created_date) || Date.now(),
          message: normalizeHelpMessage(request.comment),
        };
      })
      .filter(Boolean)
      .sort((a, b) => a.createdAt - b.createdAt);
  }, [HELP_REQUEST_TYPES, helpRequestFeed, normalizeHelpMessage, parseHelpTimestamp]);

  const groupOtherServerEntries = useCallback((entries) => {
    const groups = [];

    entries
      .filter((entry) => entry.type === 'other')
      .forEach((entry) => {
        const messageKey = getHelpMessageKey(entry.message) || `other:${entry.id}`;
        const lastGroup = groups[groups.length - 1];
        const canReuse =
          lastGroup &&
          lastGroup.messageKey === messageKey &&
          (entry.createdAt - lastGroup.lastCreatedAt) <= HELP_MATCH_GRACE_MS;

        if (canReuse) {
          lastGroup.entries.push(entry);
          lastGroup.lastCreatedAt = entry.createdAt;
          return;
        }

        groups.push({
          key: `${messageKey}:${entry.createdAt}`,
          messageKey,
          message: entry.message,
          startedAt: entry.createdAt,
          lastCreatedAt: entry.createdAt,
          entries: [entry],
        });
      });

    return groups.map((group) => ({
      ...group,
      activeEntries: group.entries.filter((entry) => HELP_ACTIVE_SERVER_STATUSES.has(entry.status)),
      doneEntries: group.entries.filter((entry) => HELP_DONE_SERVER_STATUSES.has(entry.status)),
    }));
  }, [getHelpMessageKey, HELP_ACTIVE_SERVER_STATUSES, HELP_DONE_SERVER_STATUSES]);

  const findMatchingOtherLocalIndex = useCallback((localRows, group) => {
    return localRows.findIndex((entry) => {
      if (!entry) return false;
      if ((entry.serverRequestIds || []).some((id) => group.entries.some((serverEntry) => serverEntry.id === id))) {
        return true;
      }
      if (getHelpMessageKey(entry.message) !== group.messageKey) return false;
      if (!entry.sentAt) return true;
      return Math.abs(entry.sentAt - group.startedAt) <= (HELP_MATCH_GRACE_MS * 2);
    });
  }, [getHelpMessageKey]);

  useEffect(() => {
    if (!helpSyncUpdatedAt) return;

    setIsHelpRestoring(false);

    setRequestStates((prev) => {
      const now = Date.now();
      const next = {};
      const nonOtherTypes = ['call_waiter', 'bill', 'napkins', 'menu'];

      nonOtherTypes.forEach((type) => {
        const current = prev[type];
        const relevantEntries = normalizedHelpRequests.filter((entry) => (
          entry.type === type &&
          (!current?.sentAt || entry.createdAt >= (current.sentAt - HELP_MATCH_GRACE_MS))
        ));
        const activeEntries = relevantEntries.filter((entry) => HELP_ACTIVE_SERVER_STATUSES.has(entry.status));
        const doneEntries = relevantEntries.filter((entry) => HELP_DONE_SERVER_STATUSES.has(entry.status));

        if (current?.status === 'closed_by_guest') {
          next[type] = current;
          return;
        }

        if (activeEntries.length > 0) {
          const sortedEntries = [...activeEntries].sort((a, b) => a.createdAt - b.createdAt);
          next[type] = {
            id: current?.id || type,
            status: current?.status === 'sending' ? 'sent' : (current?.status || 'sent'),
            message: current?.message || '',
            sentAt: Number(current?.sentAt) || sortedEntries[0]?.createdAt || now,
            reminderCount: Math.max(Number(current?.reminderCount) || 0, Math.max(0, sortedEntries.length - 1)),
            lastReminderAt:
              Number(current?.lastReminderAt) ||
              (sortedEntries.length > 1 ? sortedEntries[sortedEntries.length - 1]?.createdAt : null),
            remindCooldownUntil:
              current?.pendingAction === 'remind'
                ? current.remindCooldownUntil
                : (Number(current?.remindCooldownUntil) || ((Number(current?.lastReminderAt) || Number(current?.sentAt) || sortedEntries[0]?.createdAt || now) + getHelpCooldownMs(type))),
            pendingAction: null,
            errorKind: null,
            errorMessage: '',
            terminalHideAt: null,
            serverRequestIds: sortedEntries.map((entry) => entry.id),
            lastServerCreatedAt: sortedEntries[sortedEntries.length - 1]?.createdAt || now,
            syncSource: 'server',
          };
          return;
        }

        if (doneEntries.length > 0 && current) {
          next[type] = {
            ...current,
            status: 'resolved',
            pendingAction: null,
            errorKind: null,
            errorMessage: '',
            terminalHideAt: current?.status === 'resolved' && current?.terminalHideAt ? current.terminalHideAt : now + HELP_RESOLVED_HIDE_MS,
            serverRequestIds: doneEntries.map((entry) => entry.id),
            lastServerCreatedAt: doneEntries[doneEntries.length - 1]?.createdAt || current?.lastServerCreatedAt || now,
            syncSource: 'server',
          };
          return;
        }

        if (current) {
          next[type] = current;
        }
      });

      const localOtherRows = Array.isArray(prev.other) ? [...prev.other] : (prev.other ? [prev.other] : []);
      const groupedOtherRows = groupOtherServerEntries(normalizedHelpRequests);
      const consumedLocalIndexes = new Set();
      const nextOtherRows = [];

      groupedOtherRows.forEach((group) => {
        const localIndex = findMatchingOtherLocalIndex(localOtherRows, group);
        const current = localIndex >= 0 ? localOtherRows[localIndex] : null;

        if (localIndex >= 0) consumedLocalIndexes.add(localIndex);

        if (current?.status === 'closed_by_guest') {
          nextOtherRows.push(current);
          return;
        }

        if (group.activeEntries.length > 0) {
          const sortedEntries = [...group.activeEntries].sort((a, b) => a.createdAt - b.createdAt);
          nextOtherRows.push({
            id: current?.id || `other-${group.startedAt}`,
            status: current?.status === 'sending' ? 'sent' : (current?.status || 'sent'),
            message: current?.message || group.message,
            sentAt: Number(current?.sentAt) || sortedEntries[0]?.createdAt || now,
            reminderCount: Math.max(Number(current?.reminderCount) || 0, Math.max(0, sortedEntries.length - 1)),
            lastReminderAt:
              Number(current?.lastReminderAt) ||
              (sortedEntries.length > 1 ? sortedEntries[sortedEntries.length - 1]?.createdAt : null),
            remindCooldownUntil:
              current?.pendingAction === 'remind'
                ? current.remindCooldownUntil
                : (Number(current?.remindCooldownUntil) || ((Number(current?.lastReminderAt) || Number(current?.sentAt) || sortedEntries[0]?.createdAt || now) + getHelpCooldownMs('other'))),
            pendingAction: null,
            errorKind: null,
            errorMessage: '',
            terminalHideAt: null,
            serverRequestIds: sortedEntries.map((entry) => entry.id),
            lastServerCreatedAt: sortedEntries[sortedEntries.length - 1]?.createdAt || now,
            syncSource: 'server',
          });
          return;
        }

        if (group.doneEntries.length > 0 && current) {
          nextOtherRows.push({
            ...current,
            status: 'resolved',
            pendingAction: null,
            errorKind: null,
            errorMessage: '',
            terminalHideAt: current?.status === 'resolved' && current?.terminalHideAt ? current.terminalHideAt : now + HELP_RESOLVED_HIDE_MS,
            serverRequestIds: group.doneEntries.map((entry) => entry.id),
            lastServerCreatedAt: group.doneEntries[group.doneEntries.length - 1]?.createdAt || current?.lastServerCreatedAt || now,
            syncSource: 'server',
          });
        }
      });

      localOtherRows.forEach((entry, index) => {
        if (consumedLocalIndexes.has(index)) return;
        nextOtherRows.push(entry);
      });

      if (nextOtherRows.length > 0) {
        next.other = nextOtherRows.sort((a, b) => (a.sentAt || 0) - (b.sentAt || 0));
      }

      return JSON.stringify(prev) === JSON.stringify(next) ? prev : next;
    });
  }, [findMatchingOtherLocalIndex, getHelpCooldownMs, groupOtherServerEntries, helpSyncUpdatedAt, normalizedHelpRequests, HELP_ACTIVE_SERVER_STATUSES, HELP_DONE_SERVER_STATUSES]);

  // PM-126/PM-125: Help drawer open/close with overlay stack integration
  // PM-133: Guard for null currentTableId â€" redirect to table code entry
  const openHelpDrawer = useCallback(() => {
    if (!currentTableId) {
      setShowTableConfirmSheet(true);
      return;
    }
    setShowOtherForm(false);
    setHelpComment('');
    setIsTicketExpanded(false);
    setIsHelpModalOpen(true);
    pushOverlay('help');
  }, [currentTableId, pushOverlay, setHelpComment, setShowTableConfirmSheet]);

  const closeHelpDrawer = useCallback(() => {
    popOverlay('help');
    setIsHelpModalOpen(false);
    setIsTicketExpanded(false);
    setShowOtherForm(false);
    setHelpComment('');
  }, [popOverlay, setHelpComment]);

  // HD-01 + HD-06: Card tap with 5s undo delay before actual server send
  const handleCardTap = useCallback((type) => {
    if (!currentTableId) return;
    if (undoToast?.type === type && undoToast?.tableId === currentTableId) return;
    if (undoToast?.timeoutId) clearTimeout(undoToast.timeoutId);

    const timeoutId = setTimeout(() => {
      if (currentTableIdRef.current !== currentTableId) return;
      const now = Date.now();
      setRequestStates((prev) => ({
        ...prev,
        [type]: {
          id: type,
          status: 'sending',
          message: '',
          sentAt: now,
          reminderCount: 0,
          lastReminderAt: null,
          remindCooldownUntil: null,
          pendingAction: 'send',
          errorKind: null,
          errorMessage: '',
          terminalHideAt: null,
          syncSource: 'local',
        },
      }));
      pendingQuickSendRef.current = { type, action: 'send', rowId: type, message: '' };
      handlePresetSelect(type);
      setPendingHelpActionTick((value) => value + 1);
      setUndoToast((prev) => (prev?.timeoutId === timeoutId ? null : prev));
    }, 5000);

    setUndoToast({ type, rowId: type, tableId: currentTableId, expiresAt: Date.now() + 5000, timeoutId });
  }, [currentTableId, handlePresetSelect, undoToast]);

  // HD-06: Undo handler â€" cancel pending send, return card to idle
  const handleUndo = useCallback(() => {
    if (!undoToast) return;
    clearTimeout(undoToast.timeoutId);
    setUndoToast(null);
  }, [undoToast]);

  // Fix 4A: handleRemind â€" send reminder without undo, update cooldown
  const handleRemind = useCallback((type, otherId) => {
    const row = type === 'other'
      ? (Array.isArray(requestStates.other) ? requestStates.other.find((entry) => entry.id === otherId) : null)
      : requestStates[type];
    const normalized = getNormalizedHelpState(type, row);
    if (!normalized || normalized.pendingAction) return;
    if (normalized.remindCooldownUntil && normalized.remindCooldownUntil > Date.now()) return;

    setRequestStates((prev) => {
      if (type === 'other') {
        const otherRows = Array.isArray(prev.other) ? prev.other : [];
        return {
          ...prev,
          other: otherRows.map((entry) => (
            entry.id === otherId
              ? { ...entry, pendingAction: 'remind', errorKind: null, errorMessage: '' }
              : entry
          )),
        };
      }

      const current = prev[type];
      if (!current) return prev;
      return {
        ...prev,
        [type]: { ...current, pendingAction: 'remind', errorKind: null, errorMessage: '' },
      };
    });

    pendingQuickSendRef.current = {
      type,
      action: 'remind',
      rowId: type === 'other' ? otherId : type,
      message: normalized.message,
    };
    if (type === 'other' && normalized.message) {
      setHelpComment(normalized.message);
    }
    handlePresetSelect(type);
    setPendingHelpActionTick((value) => value + 1);
  }, [getNormalizedHelpState, handlePresetSelect, requestStates, setHelpComment]);

  // Fix 3: Handle resolve (mark request as done by guest)
  const handleResolve = useCallback((type, otherId) => {
    const now = Date.now();

    setRequestStates((prev) => {
      if (type === 'other') {
        const otherRows = Array.isArray(prev.other) ? prev.other : [];
        return {
          ...prev,
          other: otherRows.map((entry) => (
            entry.id === otherId
              ? {
                  ...entry,
                  status: 'closed_by_guest',
                  pendingAction: null,
                  errorKind: null,
                  errorMessage: '',
                  terminalHideAt: now + HELP_CLOSED_HIDE_MS,
                  syncSource: 'local',
                }
              : entry
          )),
        };
      }

      const current = prev[type] || { id: type, sentAt: now };
      return {
        ...prev,
        [type]: {
          ...current,
          status: 'closed_by_guest',
          pendingAction: null,
          errorKind: null,
          errorMessage: '',
          terminalHideAt: now + HELP_CLOSED_HIDE_MS,
          syncSource: 'local',
        },
      };
    });
  }, []);

  // HD-01: Auto-submit when selectedHelpType matches pending quick send
  useEffect(() => {
    const action = pendingQuickSendRef.current;
    if (!action) return;
    if (selectedHelpType !== action.type) return;
    if (action.type === 'other' && action.message && normalizeHelpMessage(helpComment) !== normalizeHelpMessage(action.message)) return;

    pendingQuickSendRef.current = null;

    const onSuccess = () => {
      const now = Date.now();

      setRequestStates((prev) => {
        if (action.type === 'other') {
          const otherRows = Array.isArray(prev.other) ? prev.other : [];
          return {
            ...prev,
            other: otherRows.map((entry) => {
              if (entry.id !== action.rowId) return entry;
              const sentAt = entry.sentAt || now;
              const reminderCount = action.action === 'remind' ? (Number(entry.reminderCount) || 0) + 1 : 0;
              const lastReminderAt = action.action === 'remind' ? now : null;
              const cooldownAnchor = action.action === 'remind' ? now : sentAt;
              return {
                ...entry,
                status: action.action === 'remind' ? 'reminded' : 'sent',
                message: action.action === 'send' ? (normalizeHelpMessage(action.message) || entry.message) : entry.message,
                sentAt,
                reminderCount,
                lastReminderAt,
                remindCooldownUntil: cooldownAnchor + getHelpCooldownMs('other'),
                pendingAction: null,
                errorKind: null,
                errorMessage: '',
                terminalHideAt: null,
                syncSource: 'local',
              };
            }),
          };
        }

        const current = prev[action.type];
        const sentAt = current?.sentAt || now;
        const reminderCount = action.action === 'remind' ? (Number(current?.reminderCount) || 0) + 1 : 0;
        const lastReminderAt = action.action === 'remind' ? now : null;
        const cooldownAnchor = action.action === 'remind' ? now : sentAt;

        return {
          ...prev,
          [action.type]: {
            ...(current || {}),
            id: action.type,
            status: action.action === 'remind' ? 'reminded' : 'sent',
            sentAt,
            reminderCount,
            lastReminderAt,
            remindCooldownUntil: cooldownAnchor + getHelpCooldownMs(action.type),
            pendingAction: null,
            errorKind: null,
            errorMessage: '',
            terminalHideAt: null,
            syncSource: 'local',
          },
        };
      });

      if (action.type === 'other') {
        setHelpComment('');
      }

      if (action.action === 'send') {
        setIsTicketExpanded(false);
        setShowOtherForm(false);
        ticketBoardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        setHighlightedTicket(action.rowId || action.type);
        setTimeout(() => setHighlightedTicket((prev) => (prev === (action.rowId || action.type) ? null : prev)), 1500);
      }

      if (action.action === 'remind') {
        toast({ description: tr('help.reminder_sent', 'Reminder sent'), duration: 2000 });
      }

      queryClient.invalidateQueries({ queryKey: ['helpDrawerRequests', partner?.id, currentTableIdRef.current] });
    };

    const onError = (err) => {
      const msg = String(err?.message || '').toLowerCase();
      const errorMessage = (!isHelpOnline || msg.includes('network') || msg.includes('offline') || msg.includes('fetch')) ? 'offline' : 'generic';

      setRequestStates((prev) => {
        if (action.type === 'other') {
          const otherRows = Array.isArray(prev.other) ? prev.other : [];
          return {
            ...prev,
            other: otherRows.map((entry) => {
              if (entry.id !== action.rowId) return entry;
              return {
                ...entry,
                status: action.action === 'send' ? 'sending' : entry.status,
                pendingAction: null,
                errorKind: action.action,
                errorMessage,
              };
            }),
          };
        }

        const current = prev[action.type] || {
          id: action.type,
          sentAt: Date.now(),
          reminderCount: 0,
          lastReminderAt: null,
          remindCooldownUntil: null,
        };

        return {
          ...prev,
          [action.type]: {
            ...current,
            status: action.action === 'send' ? 'sending' : current.status,
            pendingAction: null,
            errorKind: action.action,
            errorMessage,
          },
        };
      });
    };

    try {
      const result = submitHelpRequest();
      Promise.resolve(result).then(onSuccess).catch(onError);
    } catch (err) {
      onError(err);
    }
  }, [selectedHelpType, submitHelpRequest, pendingHelpActionTick, helpComment, normalizeHelpMessage, getHelpCooldownMs, partner?.id, queryClient, tr, isHelpOnline]);

  const getHelpReminderWord = useCallback((count) => {
    return count === 1 ? tr('help.reminder', 'reminder') : tr('help.reminders', 'reminders');
  }, [tr]);

  const getMinutesAgo = useCallback((timestamp) => {
    return Math.max(1, Math.floor((Date.now() - timestamp) / 60000));
  }, [timerTick]);

  const getHelpWaitLabel = useCallback((row) => {
    if (!row?.sentAt) return '';
    const seconds = Math.max(0, Math.floor((Date.now() - row.sentAt) / 1000));
    if (seconds < 60) return tr('help.just_sent', 'Just sent');
    return `${tr('help.waiting_prefix', 'Waiting')} ${getMinutesAgo(row.sentAt)} ${tr('help.minutes_short', 'min')}`;
  }, [getMinutesAgo, tr]);

  const getHelpReminderLabel = useCallback((row) => {
    if (!row?.lastReminderAt || !row?.reminderCount) return '';
    const minutesAgo = getMinutesAgo(row.lastReminderAt);
    const latestLabel = minutesAgo <= 1
      ? tr('help.reminded_just_now', 'Just reminded')
      : `${tr('help.reminded_prefix', 'Reminded')} ${minutesAgo} ${tr('help.minutes_short', 'min')} ${tr('help.ago', 'ago')}`;

    if (row.reminderCount === 1) return latestLabel;
    return `${row.reminderCount} ${getHelpReminderWord(row.reminderCount)} · ${tr('help.last_reminder_prefix', 'Last')} ${minutesAgo} ${tr('help.minutes_short', 'min')} ${tr('help.ago', 'ago')}`;
  }, [getHelpReminderWord, getMinutesAgo, tr]);

  const getHelpResolvedLabel = useCallback((type) => {
    const byType = {
      call_waiter: tr('help.resolved_call_waiter', '✅ Waiter came · Thank you!'),
      bill: tr('help.resolved_bill', '✅ Bill brought · Thank you!'),
      napkins: tr('help.resolved_napkins', '✅ Napkins brought · Thank you!'),
      menu: tr('help.resolved_menu', '✅ Menu brought · Thank you!'),
      other: tr('help.resolved_other', '✅ Done · Thank you!'),
    };
    return byType[type] || byType.other;
  }, [tr]);

  const getHelpErrorCopy = useCallback((row) => {
    if (!row?.errorKind) return null;
    if (row.errorMessage === 'offline') {
      return {
        title: tr('help.no_connection', 'No connection'),
        detail: tr('help.try_again', 'Try again'),
      };
    }
    return {
      title: row.errorKind === 'remind'
        ? tr('help.remind_failed', 'Failed to send reminder')
        : tr('help.send_failed', 'Failed to send'),
      detail: tr('help.try_again', 'Try again'),
    };
  }, [tr]);

  const getHelpFreshnessLabel = useCallback(() => {
    if (!activeRequests.length) return '';
    if (isHelpRestoring) return tr('help.restoring_status', 'Restoring status…');
    if (!isHelpOnline || isHelpSyncError) return tr('help.offline_status', 'No connection · will retry automatically');
    if (!helpSyncUpdatedAt) return '';

    const seconds = Math.max(0, Math.floor((Date.now() - helpSyncUpdatedAt) / 1000));
    if (seconds >= Math.floor(HELP_STALE_AFTER_MS / 1000)) {
      return `${tr('help.stale_status', 'Data may be outdated · no update')} ${seconds} ${tr('help.seconds_short', 'sec')}`;
    }
    return `${tr('help.updated_label', 'Updated')} ${seconds} ${tr('help.seconds_short', 'sec')} ${tr('help.ago', 'ago')}`;
  }, [activeRequests.length, helpSyncUpdatedAt, isHelpOnline, isHelpRestoring, isHelpSyncError, timerTick, tr]);

  const handleRetry = useCallback((row) => {
    if (!row) return;

    if (row.errorKind === 'remind') {
      setRequestStates((prev) => {
        if (row.type === 'other') {
          const otherRows = Array.isArray(prev.other) ? prev.other : [];
          return {
            ...prev,
            other: otherRows.map((entry) => (
              entry.id === row.id
                ? { ...entry, pendingAction: 'remind', errorKind: null, errorMessage: '' }
                : entry
            )),
          };
        }

        const current = prev[row.type];
        if (!current) return prev;
        return {
          ...prev,
          [row.type]: { ...current, pendingAction: 'remind', errorKind: null, errorMessage: '' },
        };
      });

      pendingQuickSendRef.current = { type: row.type, action: 'remind', rowId: row.id, message: row.message };
      if (row.type === 'other' && row.message) {
        setHelpComment(row.message);
      }
      handlePresetSelect(row.type);
      setPendingHelpActionTick((value) => value + 1);
      return;
    }

    const now = Date.now();
    setRequestStates((prev) => {
      if (row.type === 'other') {
        const otherRows = Array.isArray(prev.other) ? prev.other : [];
        return {
          ...prev,
          other: otherRows.map((entry) => (
            entry.id === row.id
              ? {
                  ...entry,
                  status: 'sending',
                  sentAt: now,
                  reminderCount: 0,
                  lastReminderAt: null,
                  remindCooldownUntil: null,
                  pendingAction: 'send',
                  errorKind: null,
                  errorMessage: '',
                  terminalHideAt: null,
                  syncSource: 'local',
                }
              : entry
          )),
        };
      }

      return {
        ...prev,
        [row.type]: {
          id: row.type,
          status: 'sending',
          message: '',
          sentAt: now,
          reminderCount: 0,
          lastReminderAt: null,
          remindCooldownUntil: null,
          pendingAction: 'send',
          errorKind: null,
          errorMessage: '',
          terminalHideAt: null,
          syncSource: 'local',
        },
      };
    });

    pendingQuickSendRef.current = { type: row.type, action: 'send', rowId: row.id, message: row.message || '' };
    if (row.type === 'other' && row.message) {
      setHelpComment(row.message);
    }
    handlePresetSelect(row.type);
    setPendingHelpActionTick((value) => value + 1);
  }, [handlePresetSelect, setHelpComment]);

  const focusHelpRow = useCallback((rowId) => {
    const rowIndex = activeRequests.findIndex((row) => row.id === rowId);
    setIsTicketExpanded(rowIndex >= HELP_PREVIEW_LIMIT);
    setShowOtherForm(false);
    ticketBoardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setHighlightedTicket(rowId);
    setTimeout(() => setHighlightedTicket((prev) => (prev === rowId ? null : prev)), 1500);
  }, [activeRequests, setShowOtherForm]);

  useEffect(() => {
    const shouldTick = isHelpModalOpen || !!undoToast || ticketRows.length > 0 || isHelpRestoring;
    if (!shouldTick) return;
    const interval = setInterval(() => setTimerTick((value) => value + 1), 1000);
    return () => clearInterval(interval);
  }, [isHelpModalOpen, isHelpRestoring, ticketRows.length, undoToast]);

  // HD-03: Recalculate on visibility change (tab return)
  useEffect(() => {
    const handler = () => { if (!document.hidden) setTimerTick(t => t + 1); };
    document.addEventListener('visibilitychange', handler);
    return () => document.removeEventListener('visibilitychange', handler);
  }, []);

  // HD-05: Persist requestStates to localStorage on change
  useEffect(() => {
    if (!currentTableId || !hasLoadedHelpStatesRef.current) return;

    const key = `helpdrawer_${currentTableId}`;
    const persistable = {};
    const now = Date.now();

    const toPersistedEntry = (type, rawEntry) => {
      const normalized = getNormalizedHelpState(type, rawEntry, now);
      if (!normalized || !normalized.isActive || normalized.status === 'sending' || normalized.pendingAction || normalized.errorKind) return null;
      if ((now - normalized.sentAt) > HELP_RESTORE_TTL_MS) return null;

      return {
        id: normalized.id,
        status: normalized.status,
        message: normalized.message,
        sentAt: normalized.sentAt,
        reminderCount: normalized.reminderCount || 0,
        lastReminderAt: normalized.lastReminderAt || null,
        remindCooldownUntil: normalized.remindCooldownUntil || null,
      };
    };

    Object.entries(requestStates).forEach(([type, state]) => {
      if (type === 'other') {
        const rows = (Array.isArray(state) ? state : [state].filter(Boolean))
          .map((entry) => toPersistedEntry('other', entry))
          .filter(Boolean);
        if (rows.length > 0) persistable.other = rows;
        return;
      }

      const persisted = toPersistedEntry(type, state);
      if (persisted) persistable[type] = persisted;
    });

    if (Object.keys(persistable).length === 0) {
      localStorage.removeItem(key);
    } else {
      localStorage.setItem(key, JSON.stringify(persistable));
    }
  }, [currentTableId, getNormalizedHelpState, requestStates]);

  // PM-125: Cart-to-help sequencing â€" close cart first, 300ms delay, then open help
  const handleHelpFromCart = useCallback(() => {
    popOverlay('cart');
    setDrawerMode(null);
    setTimeout(() => {
      openHelpDrawer();
    }, 300);
  }, [popOverlay, openHelpDrawer]);

  // OrderStages for the partner (for stage_id assignment)
  const { data: orderStages = [] } = useQuery({
    queryKey: ["orderStages", partner?.id],
    enabled: !!partner?.id,
    retry: shouldRetry,
    queryFn: () => base44.entities.OrderStage.filter({ 
      partner: partner.id, 
      is_active: true 
    }),
    staleTime: 5 * 60 * 1000,
  });

  // P0-4: Menu data - filter by partner on server side
  const { data: allDishes, isLoading: loadingDishes, error: dishesError } = useQuery({
    queryKey: ["dishes", partner?.id],
    enabled: !!partner?.id,
    retry: shouldRetry,
    queryFn: () => base44.entities.Dish.filter({ partner: partner.id }),
  });

  const { data: allCategories, error: categoriesError } = useQuery({
    queryKey: ["categories", partner?.id],
    enabled: !!partner?.id,
    retry: shouldRetry,
    queryFn: () => base44.entities.Category.filter({ partner: partner.id }),
  });

  // P0-4: Warning if limit reached
  useEffect(() => {
    if (allDishes?.length === 100) {
      // Dish limit reached (100) â€" silent in prod
    }
    if (allCategories?.length === 100) {
      // Category limit reached (100) â€" silent in prod
    }
  }, [allDishes?.length, allCategories?.length]);

  const { data: partnerContactsRaw = [] } = useQuery({
    queryKey: ["partnerContacts", partner?.id],
    enabled: !!partner?.id,
    retry: shouldRetry,
    queryFn: () => base44.entities.PartnerContacts.filter({ partner: partner.id }),
    initialData: [],
  });

  const { data: contactLinksRaw = [] } = useQuery({
    queryKey: ["partnerContactLinks", partner?.id],
    enabled: !!partner?.id,
    retry: shouldRetry,
    queryFn: () => base44.entities.PartnerContactLink.filter({ partner: partner.id }),
    initialData: [],
  });

  // Fetch translations
  const { data: categoryTranslations } = useQuery({
    queryKey: ["categoryTranslations", partner?.id, lang],
    enabled: !!partner?.id,
    retry: shouldRetry,
    queryFn: async () => {
      try {
        return await base44.entities.CategoryTranslation.filter({
          partner: partner.id,
          lang: lang
        });
      } catch (e) {
        // Failed to fetch category translations â€" silent in prod
        return [];
      }
    },
    initialData: []
  });

  const { data: dishTranslations } = useQuery({
    queryKey: ["dishTranslations", partner?.id, lang],
    enabled: !!partner?.id,
    retry: shouldRetry,
    queryFn: async () => {
      try {
        return await base44.entities.DishTranslation.filter({
          partner: partner.id,
          lang: lang
        });
      } catch (e) {
        // Failed to fetch dish translations â€" silent in prod
        return [];
      }
    },
    initialData: []
  });

  // Dish ratings/reviews
  const showReviews = partner?.show_dish_reviews === true;
  const partnerId = partner?.id || partner?._id;
  
  const { data: partnerFeedbacks = [] } = useQuery({
    queryKey: ["dishFeedbacksRecent", partnerId],
    queryFn: () => base44.entities.DishFeedback.filter({ partner: partnerId }, "-created_date", 100),
    enabled: showReviews && !!partnerId,
    retry: shouldRetry,
    staleTime: 5 * 60 * 1000,
  });

  // Build translation lookup maps
  const categoryTransMap = useMemo(() => {
    const map = {};
    (categoryTranslations || []).forEach(tr => {
      map[tr.category] = tr.name;
    });
    return map;
  }, [categoryTranslations]);

  const dishTransMap = useMemo(() => {
    const map = {};
    (dishTranslations || []).forEach(tr => {
      map[tr.dish] = {
        name: tr.name,
        description: tr.description
      };
    });
    return map;
  }, [dishTranslations]);

  // Aggregate dish ratings
  const dishRatings = useMemo(() => {
    if (!showReviews || !partnerFeedbacks?.length) return {};
    const tmp = {}; // { [dishId]: { sum, count } }

    for (const f of partnerFeedbacks) {
      const dishId = typeof f.dish === "object" ? f.dish?.id : f.dish;
      const rating = Number(f.rating);
      if (!dishId || !rating) continue;

      if (!tmp[dishId]) tmp[dishId] = { sum: 0, count: 0 };
      tmp[dishId].sum += rating;
      tmp[dishId].count += 1;
    }

    const out = {};
    for (const dishId of Object.keys(tmp)) {
      out[dishId] = {
        avg: tmp[dishId].sum / tmp[dishId].count,
        count: tmp[dishId].count,
      };
    }
    return out;
  }, [showReviews, partnerFeedbacks]);

  // Load reviews for selected dish (modal)
  const { data: selectedDishReviews = [], isLoading: loadingDishReviews } = useQuery({
    queryKey: ["dishReviews", partnerId, selectedDishId],
    queryFn: () => base44.entities.DishFeedback.filter(
      { partner: partnerId, dish: selectedDishId },
      "-created_date",
      20
    ),
    enabled: showReviews && !!partnerId && !!selectedDishId,
    retry: shouldRetry,
    staleTime: 5 * 60 * 1000,
  });

  // Helper functions to get translated content with fallback
  const getCategoryName = (category) => {
    return categoryTransMap[category.id] || category.name;
  };

  const getDishName = (dish) => {
    return dishTransMap[dish.id]?.name || dish.name;
  };

  const getDishDescription = (dish) => {
    const translated = dishTransMap[dish.id]?.description;
    if (translated) return getCleanDescription(translated);
    return getCleanDescription(dish.description);
  };

  // P1-8: Sync cart names when language changes
  useEffect(() => {
    if (!cart.length || !dishTransMap || Object.keys(dishTransMap).length === 0) return;
    
    setCart(prev => prev.map(item => {
      const translated = dishTransMap[item.dishId];
      if (translated?.name && translated.name !== item.name) {
        return { ...item, name: translated.name };
      }
      return item;
    }));
  }, [lang, dishTransMap]);

  const partnerContacts = partnerContactsRaw?.[0] || null;
  const viewMode = partner?.contacts_view_mode || partnerContacts?.view_mode || "full";

  const activeContactLinks = useMemo(() => {
    return contactLinksRaw
      .filter((link) => link.is_active !== false)
      .sort((a, b) => {
        const oa = a?.sort_order;
        const ob = b?.sort_order;
        if (oa == null && ob == null) return 0;
        if (oa == null) return 1;
        if (ob == null) return -1;
        return oa - ob;
      });
  }, [contactLinksRaw]);

  // Enabled languages for switcher
  const enabledLanguages = useMemo(() => {
    const partnerDefault = partner?.default_language || "RU";
    const enabled = partner?.enabled_languages;
    if (Array.isArray(enabled) && enabled.length > 0) {
      return enabled;
    }
    return [partnerDefault];
  }, [partner?.default_language, partner?.enabled_languages]);

  // Currency hook
  const {
    activeCurrency,
    enabledCurrencies,
    defaultCurrency,
    currencyRates,
    formatPrice,
    handleCurrencyChange,
    CURRENCY_SYMBOLS,
  } = useCurrency({ partner, location });

  // P0-4: Simplified - server already filters by partner
  const dishesForPartner = useMemo(() => {
    if (!allDishes) return [];
    return allDishes.filter((d) => !isDishArchived(d));
  }, [allDishes]);

  const categoriesForPartner = useMemo(() => {
    return allCategories || [];
  }, [allCategories]);

  // Get dish name for modal (moved here after dishesForPartner is declared)
  const selectedDish = useMemo(() => {
    if (!selectedDishId) return null;
    return dishesForPartner.find(d => d.id === selectedDishId);
  }, [selectedDishId, dishesForPartner]);

  // Channel visibility
  const channels = useGuestChannels(partner, dishesForPartner, categoriesForPartner);

  // Get visible mode tabs
  const visibleModeTabs = useMemo(() => {
    const tabs = [];
    
    if (channels.hall.visible) {
      tabs.push({
        id: "hall",
        label: t('mode.hall'),
        Icon: Store,
        available: channels.hall.available,
        disabled: channels.hall.disabled,
      });
    }
    
    if (channels.pickup.visible) {
      tabs.push({
        id: "pickup",
        label: t('mode.pickup'),
        Icon: Package,
        available: channels.pickup.available,
        disabled: channels.pickup.disabled,
      });
    }
    
    if (channels.delivery.visible) {
      tabs.push({
        id: "delivery",
        label: t('mode.delivery'),
        Icon: Truck,
        available: channels.delivery.available,
        disabled: channels.delivery.disabled,
      });
    }
    
    return tabs;
  }, [channels, t]);

  // Check if current mode is valid and redirect if needed
  useEffect(() => {
    if (!partner || loadingDishes) return;

    const currentModeChannel = channels[orderMode];
    
    if (!currentModeChannel?.visible || !currentModeChannel?.available) {
      const firstAvailable = visibleModeTabs.find((tab) => tab.available);
      
      if (firstAvailable && firstAvailable.id !== orderMode) {
        const originalMode = orderMode;
        setOrderMode(firstAvailable.id);
        
        const url = new URL(window.location.href);
        url.searchParams.set("mode", firstAvailable.id);
        window.history.replaceState({}, "", url.toString());
        
        const modeLabels = {
          hall: t('mode.hall'),
          pickup: t('mode.pickup'),
          delivery: t('mode.delivery'),
        };
        setRedirectBanner({
          originalMode: modeLabels[originalMode] || originalMode,
          newMode: modeLabels[firstAvailable.id] || firstAvailable.id,
        });

        const timerId = setTimeout(() => setRedirectBanner(null), 5000);
        return () => clearTimeout(timerId);
      }
    }
  }, [partner, loadingDishes, channels, orderMode, visibleModeTabs, t]);

  const visibleDishes = useMemo(() => {
    return dishesForPartner.filter((dish) => isDishEnabledForMode(dish, orderMode));
  }, [dishesForPartner, orderMode]);

  const sortedCategoriesAll = useMemo(() => sortCategoriesStable(categoriesForPartner), [categoriesForPartner]);

  const visibleCategoryIds = useMemo(() => {
    return getVisibleCategoryIds({
      categories: sortedCategoriesAll,
      dishes: visibleDishes,
      mode: orderMode,
      includeDisabledCategories: false,
    });
  }, [sortedCategoriesAll, visibleDishes, orderMode]);

  const sortedCategories = useMemo(() => {
    return sortedCategoriesAll.filter((c) => visibleCategoryIds.includes(c.id));
  }, [sortedCategoriesAll, visibleCategoryIds]);

  const groupedDishes = useMemo(() => {
    const dishesByCategory = buildDishesByCategory({
      categories: sortedCategoriesAll,
      dishes: visibleDishes,
      mode: orderMode,
      includeDisabledCategories: false,
    });

    const groups = {};
    for (const [catId, dishList] of dishesByCategory.entries()) {
      if (catId === "__uncat__") {
        if (dishList.length > 0) groups["no-category"] = dishList;
      } else {
        if (dishList.length > 0) groups[catId] = dishList;
      }
    }

    return groups;
  }, [sortedCategoriesAll, visibleDishes, orderMode]);

  const cartTotalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
  const cartTotalAmount = parseFloat(cart.reduce((acc, item) => acc + Math.round(item.price * item.quantity * 100) / 100, 0).toFixed(2));

  // Loyalty hook
  const {
    customerEmail,
    setCustomerEmail,
    loyaltyAccount,
    setLoyaltyAccount,
    loyaltyLoading,
    redeemedPoints,
    setRedeemedPoints,
    discountAmount,
    pointsDiscountAmount,
    finalTotal,
    earnedPoints,
    maxRedeemPoints,
  } = useLoyalty({ partner, cartTotalAmount });

  // Loyalty visibility flags
  const loyaltyEnabled = partner?.loyalty_enabled === true;
  const discountEnabled = partner?.discount_enabled === true;
  const showLoyaltySection = (loyaltyEnabled || discountEnabled) && cart.length > 0;

  // TableSession hook
  const {
    tableSession,
    setTableSession,
    currentGuest,
    setCurrentGuest,
    sessionOrders,
    setSessionOrders,
    sessionGuests,
    setSessionGuests,
    sessionItems,
    setSessionItems,
    itemsByOrder,
    billsByGuest,
    myBill,
    myOrders,
    otherGuestsBills,
    othersTotal,
    tableTotal,
    stagesMap,
    getOrderStatus,
    saveGuestId,
    sessionIdRef,
    currentGuestIdRef,
  } = useTableSession({
    partner,
    isHallMode,
    isTableVerified,
    currentTableId,
    orderStages,
    cartTotalAmount,
    getLinkId,
    isRateLimitError,
    t,
  });

  // Reviews hook
  const {
    reviewedItems,
    draftRatings,
    updateDraftRating,
    reviewableItems,
    otherGuestsReviewableItems,
    openReviewDialog,
    reviewDialogOpen,
    setReviewDialogOpen,
    reviewingItems,
    ratings,
    setRatings,
    submittingReview,
    handleSubmitReviews,
  } = useReviews({
    partner,
    currentTableId,
    currentGuest,
    myOrders,
    sessionOrders,
    itemsByOrder,
    stagesMap,
    getLinkId,
    loyaltyAccount,
    setLoyaltyAccount,
    toast,
    t,
  });

  // Rating-first flow (TASK-260130-09-FIX4): show prompt after first draft rating
  // MOVED HERE after useReviews to avoid TDZ (draftRatings, reviewableItems must exist)
  const hasAnyDraftRating = !!draftRatings && Object.keys(draftRatings).length > 0;
  const showRatingBlock = reviewableItems?.length > 0;
  const showLoginPromptAfterRating = loyaltyEnabled && !loyaltyAccount && showRatingBlock && hasAnyDraftRating;

  // Handle instant dish rating (save on star click)
  const handleRateDish = async ({ itemId, dishId, orderId, rating }) => {
    if (!dishId || !rating || ratingSavingByItemId[itemId]) return;
    
    setRatingSavingByItemId(prev => ({ ...prev, [itemId]: true }));
    
    try {
      await base44.entities.DishFeedback.create({
        partner: partner.id,
        dish: dishId,
        order: orderId,
        rating: rating,
        reviewed_by: currentGuest?.id || 'guest',
        order_item: itemId,
        guest: currentGuest?.id,
        author_type: loyaltyAccount ? 'loyalty' : 'anonymous',
        loyalty_account: loyaltyAccount?.id || undefined,
        points_awarded: 0,
      });
      
      toast.success(t('review.thanks'), { id: 'mm1' });
      
      // Track that user has rated in this session
      setHasRatedInSession(true);
      
      // Refresh ratings
      queryClient.invalidateQueries({ queryKey: ["dishFeedbacksRecent", partnerId] });
      
    } catch (err) {
      // silent
      toast.error(t('error.save_failed'), { id: 'mm1' });
      // BUG-PM-028: Roll back draft rating so user can retry
      updateDraftRating(itemId, 0);
    } finally {
      setRatingSavingByItemId(prev => ({ ...prev, [itemId]: false }));
    }
  };

  // Show cart button in hall mode: always when table verified, or when cart has items (even before verification)
  // TASK-260201-01: StickyBar Ð²Ð¸Ð´ÐµÐ½ Ð’Ð¡Ð•Ð"Ð"Ð Ð¿Ñ€Ð¸ Ð²ÐµÑ€Ð¸Ñ„Ð¸Ñ†Ð¸Ñ€Ð¾Ð²Ð°Ð½Ð½Ð¾Ð¼ ÑÑ‚Ð¾Ð»Ðµ
  // Ð­Ñ‚Ð¾ Ñ€ÐµÑˆÐ°ÐµÑ‚ Ð¿Ñ€Ð¾Ð±Ð»ÐµÐ¼Ñƒ F5 â€" Ð½Ðµ Ð½ÑƒÐ¶Ð½Ð¾ Ð¶Ð´Ð°Ñ‚ÑŒ Ð²Ð¾ÑÑÑ‚Ð°Ð½Ð¾Ð²Ð»ÐµÐ½Ð¸Ñ session/orders
  const showCartButton = isHallMode && (isTableVerified || (cart?.length || 0) > 0);

  // After F5, table is verified from localStorage but session data is still loading from server
  // Time-bounded: after 3s assume no session exists (prevents permanent "loading" for new visits)
  const [sessionCheckTimedOut, setSessionCheckTimedOut] = useState(false);
  useEffect(() => {
    if (!isTableVerified || tableSession) return;
    const timer = setTimeout(() => setSessionCheckTimedOut(true), 3000);
    return () => clearTimeout(timer);
  }, [isTableVerified, tableSession]);
  const isSessionLoading = isTableVerified && !tableSession && !sessionCheckTimedOut;

  // Just-in-time: auto-submit after table verification via confirmation sheet
  useEffect(() => {
    if (pendingSubmitRef.current && isTableVerified && currentTableId) {
      pendingSubmitRef.current = false;
      popOverlay('tableConfirm');
      setShowTableConfirmSheet(false);
      // Slight delay to let state propagate
      if (autoSubmitTimerRef.current) clearTimeout(autoSubmitTimerRef.current);
      autoSubmitTimerRef.current = setTimeout(() => handleSubmitOrder(), 100);
    }
    return () => {
      if (autoSubmitTimerRef.current) clearTimeout(autoSubmitTimerRef.current);
    };
  }, [isTableVerified, currentTableId]);

  // PM-128: Deferred pushOverlay for table confirm drawer â€" avoids disrupting vaul animation
  useEffect(() => {
    if (showTableConfirmSheet) {
      const id = setTimeout(() => pushOverlay('tableConfirm'), 50);
      return () => clearTimeout(id);
    }
  }, [showTableConfirmSheet, pushOverlay]);

  // Hall StickyBar mode: Ð¾Ð¿Ñ€ÐµÐ´ÐµÐ»ÑÐµÐ¼ Ñ‡Ñ‚Ð¾ Ð¿Ð¾ÐºÐ°Ð·Ñ‹Ð²Ð°Ñ‚ÑŒ
  const hallStickyMode =
    (cart?.length || 0) > 0
      ? "cart"
      : (myOrders?.length || 0) > 0
        ? "myBill"
        : (sessionOrders?.length || 0) > 0
          ? "tableOrders"
          : "cartEmpty";

  // Hall StickyBar label: Ñ‚ÐµÐºÑÑ‚ ÐºÐ½Ð¾Ð¿ÐºÐ¸
  const hallStickyButtonLabel =
    hallStickyMode === "cart"
      ? tr("cart.checkout", "Checkout")
      : hallStickyMode === "myBill"
        ? tr("cart.my_bill", "My bill")
        : hallStickyMode === "tableOrders"
          ? tr("cart.table_orders", "Table orders")
          : isSessionLoading
            ? tr("common.loading", "Loading...")
            : tr("cart.view", "Open");

  // Hall StickyBar: Ð·Ð°Ð³Ð¾Ð»Ð¾Ð²Ð¾Ðº (Ð´Ð»Ñ Ñ€ÐµÐ¶Ð¸Ð¼Ð¾Ð² Ð±ÐµÐ· ÐºÐ¾Ñ€Ð·Ð¸Ð½Ñ‹)
  const hallStickyModeLabel =
    hallStickyMode === "myBill"
      ? tr("cart.my_bill", "My bill")
      : hallStickyMode === "tableOrders"
        ? tr("cart.table_orders", "Table orders")
        : tr("cart.your_orders", "Your orders");

  // Hall StickyBar: ÑÑƒÐ¼Ð¼Ð° Ð´Ð»Ñ Ð¿Ð¾ÐºÐ°Ð·Ð°
  const hallStickyBillTotal =
    hallStickyMode === "myBill"
      ? formatPrice(parseFloat((myBill.total || 0).toFixed(2)))
      : hallStickyMode === "tableOrders"
        ? formatPrice(parseFloat((tableTotal || 0).toFixed(2)))
        : "";

  // Hall StickyBar: Ð¿Ð¾ÐºÐ°Ð·Ñ‹Ð²Ð°Ñ‚ÑŒ Ð»Ð¸ ÑÑƒÐ¼Ð¼Ñƒ
  const hallStickyShowBillAmount = hallStickyMode === "myBill" || hallStickyMode === "tableOrders";

  // Hall StickyBar: loading state
  const hallStickyIsLoadingBill = 
    (hallStickyMode === "myBill" || hallStickyMode === "tableOrders") && 
    (sessionItems.length === 0 && sessionOrders.length > 0);

  // Generate guest code for Hall mode (if enabled)
  useEffect(() => {
    if (!isHallMode || !hallGuestCodeEnabled) return;
    
    try {
      // P2-2: Should be tied to partner, but keeping simple for now
      let code = localStorage.getItem("menu_guest_code");
      if (!code) {
        code = String(Math.floor(1000 + Math.random() * 9000));
        localStorage.setItem("menu_guest_code", code);
      }
      setGuestCode(code);
    } catch (e) {
      // silent
    }
  }, [isHallMode, hallGuestCodeEnabled]);

  // P0-2: Removed legacy table_id/table_slug handling
  // Only explicit table code from URL triggers hall mode verification
  useEffect(() => {
    if (tableCodeParam && orderMode !== "hall") {
      setOrderMode("hall");
    }
  }, [tableCodeParam, orderMode]);

  // Scroll spy
  useEffect(() => {
    if (view !== "menu") return;

    let rafId;
    let ticking = false;

    const onScroll = () => {
      if (ticking) return;
      ticking = true;

      rafId = window.requestAnimationFrame(() => {
        if (isManualScroll.current) {
          ticking = false;
          return;
        }

        if (window.scrollY < 50) {
          setActiveCategoryKey("all");
          ticking = false;
          return;
        }

        let currentActive = "all";
        for (const cat of sortedCategories) {
          const el = sectionRefs.current[cat.id];
          if (!el) continue;
          const rect = el.getBoundingClientRect();
          if (rect.top < SCROLL_SPY_OFFSET_PX) currentActive = cat.id;
        }

        setActiveCategoryKey(currentActive);
        ticking = false;
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [sortedCategories, view]);

  useEffect(() => {
    if (view !== "menu") return;
    const chip = chipRefs.current[activeCategoryKey];
    if (chip) chip.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "start" });
  }, [activeCategoryKey, view]);

  const handleCategoryClick = (key) => {
    isManualScroll.current = true;
    setActiveCategoryKey(key);

    if (key === "all") listTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    else sectionRefs.current[key]?.scrollIntoView({ behavior: "smooth", block: "start" });

    setTimeout(() => {
      isManualScroll.current = false;
    }, MANUAL_SCROLL_LOCK_MS);
  };



  const handleModeChange = (mode) => {
    const channel = channels[mode];
    if (!channel?.available) {
      return;
    }

    const normalized = normalizeMode(mode);
    setOrderMode(normalized);

    const url = new URL(window.location.href);
    url.searchParams.set("mode", normalized);
    window.history.replaceState({}, "", url.toString());

    try {
      localStorage.setItem("menu_preview_mode", normalized);
    } catch {}

    // FIX P1: Revalidate cart on mode change â€" drop items not available in new mode
    setCart((prev) => {
      if (!allDishes || prev.length === 0) return prev;
      const filtered = prev.filter((cartItem) => {
        const dish = allDishes.find((d) => d.id === cartItem.dishId);
        return dish && isDishEnabledForMode(dish, normalized);
      });
      if (filtered.length < prev.length) {
        const removed = prev.length - filtered.length;
        toast.info(t('cart.items_removed_mode_switch', { count: removed }), { duration: 3000 });
      }
      return filtered;
    });

    setView("menu");
    setErrors({});
    setSubmitError(null);
    setRedirectBanner(null);
  };

  // Cart handlers - P1-8: use translated name
  const addToCart = (dish) => {
    const translatedName = getDishName(dish);
    setCart((prev) => {
      const existing = prev.find((i) => i.dishId === dish.id);
      if (existing) {
        return prev.map((i) => (i.dishId === dish.id ? { ...i, quantity: i.quantity + 1 } : i));
      }
      return [...prev, {
        dishId: dish.id,
        name: translatedName,
        originalName: dish.name,
        price: dish.price,
        quantity: 1
      }];
    });
    // AC-09: Toast handled by MenuView custom toast (PM-103: removed duplicate sonner call)
  };

  const updateQuantity = (dishId, delta) => {
    setCart((prev) =>
      prev
        .map((item) => (item.dishId === dishId ? { ...item, quantity: item.quantity + delta } : item))
        .filter((item) => item.quantity > 0)
    );
  };

  const clearCart = () => {
    setCart([]);
    setCustomerEmail('');
    setLoyaltyAccount(null);
    setRedeemedPoints(0);
  };

  // Check bill cooldown on mount
  useEffect(() => {
    if (currentTableId) {
      setBillCooldown(isBillOnCooldown(currentTableId));
    }
  }, [currentTableId]);

  // PM-152: Clear guest name when table changes â€" localStorage-based (survives Chrome kill)
  useEffect(() => {
    if (!tableCodeParam) return;
    try {
      const lastTable = localStorage.getItem('menuapp_last_table');
      if (lastTable && lastTable !== tableCodeParam) {
        localStorage.removeItem('menuapp_guest_name');
        setGuestNameInput('');
      }
      localStorage.setItem('menuapp_last_table', tableCodeParam);
    } catch(e) {}
  }, [tableCodeParam]);

  // Debug hook kept as no-op to maintain hook order (BUG-PM-040: removed prod logging)
  useEffect(() => {}, []);

  // PM-S81-15 + PM-105: Android back button closes topmost overlay (stack-based)
  useEffect(() => {
    const handlePopState = () => {
      // PM-107: If popOverlay triggered this back, skip â€" sheet already closed
      if (isProgrammaticCloseRef.current) {
        isProgrammaticCloseRef.current = false;
        return;
      }
      const stack = overlayStackRef.current;
      if (stack.length === 0) return; // No overlay open â€" let browser handle normally

      isPopStateClosingRef.current = true;
      const topOverlay = stack[stack.length - 1];
      overlayStackRef.current = stack.slice(0, -1);

      switch (topOverlay) {
        case 'tableConfirm':
          pendingSubmitRef.current = false;
          setShowTableConfirmSheet(false);
          break;
        case 'cart':
          if (isSubmitting) {
            // Re-push to prevent closing during submit
            overlayStackRef.current = [...overlayStackRef.current, 'cart'];
            window.history.pushState({ sheet: 'cart' }, '');
          } else {
            setDrawerMode(null);
          }
          break;
        case 'detailDish':
          setDetailDish(null);
          break;
        case 'help':
          setIsHelpModalOpen(false);
          break;
      }
      isPopStateClosingRef.current = false;
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [isSubmitting]);

  // P0-7: Removed handleTableSelection - no dropdown

  // Phone input
  const handlePhoneChange = (e) => {
    const val = e.target.value;
    if (!val) {
      setClientPhone("");
      return;
    }
    const hasPlus = val.startsWith("+");
    const digitsOnly = val.replace(/\D/g, "");
    setClientPhone(hasPlus ? "+" + digitsOnly : digitsOnly);
  };

  const handlePhoneFocus = () => {
    if (!clientPhone) setClientPhone("+");
  };

  const validate = () => {
    const newErrors = {};
    const raw = (clientPhone || "").trim();

    const checkPhone = () => {
      if (!/^\+?\d*$/.test(raw)) return t('error.phone_invalid');
      const digitsCount = raw.replace(/\D/g, "").length;
      if (digitsCount < 8) return t('error.phone_short');
      if (digitsCount > 15) return t('error.phone_long');
      return null;
    };

    if (orderMode === "hall") {
      // P0-1: Hall mode - table MUST be verified with real ID
      if (!currentTableId) {
        newErrors.tableSelection = t('error.table_required');
      }
      if (raw) {
        const err = checkPhone();
        if (err) newErrors.clientPhone = err;
      }
    } else {
      if (!clientName.trim()) newErrors.clientName = t('error.name_required');

      if (!raw) newErrors.clientPhone = t('error.phone_required');
      else {
        const err = checkPhone();
        if (err) newErrors.clientPhone = err;
      }

      if (orderMode === "delivery" && !deliveryAddress.trim()) {
        newErrors.deliveryAddress = t('error.address_required');
      }
    }

    setErrors(newErrors);
    // Change 2b: Scroll to first error field on validation failure
    if (Object.keys(newErrors).length > 0) {
      const firstKey = Object.keys(newErrors)[0];
      requestAnimationFrame(() => {
        const el = document.querySelector(`[data-field="${firstKey}"]`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      });
    }
    return Object.keys(newErrors).length === 0;
  };

  // P1-4: Anti-spam with partner filter
  const checkRateLimit = async () => {
    if (!clientPhone) return true;

    try {
      const recentOrders = await base44.entities.Order.filter({
        partner: partner.id,
        client_phone: clientPhone,
      });
      
      const now = new Date();
      const thresholdMinutes = 15;
      const limitCount = 3;
      const activeStatuses = ["new", "accepted", "in_progress", "ready"]; 

      const recentUserOrders = recentOrders.filter((o) => {
        if (!activeStatuses.includes(o.status)) return false;

        const created = new Date(o.created_date);
        const diffMinutes = (now - created) / 1000 / 60;
        return diffMinutes <= thresholdMinutes;
      });

      return recentUserOrders.length < limitCount;
    } catch (e) {
      // silent
      return true;
    }
  };



  // Submit order
  // Process hall order (P0-2: accepts validatedSession to avoid stale closure)
  const processHallOrder = async (guestToUse, validatedSession) => {
    try {
      // Handle loyalty account (find or create if email provided)
      let loyaltyAccountToUse = loyaltyAccount;
      if (customerEmail && customerEmail.trim() && !loyaltyAccountToUse) {
        const emailLower = customerEmail.trim().toLowerCase();
        const existingAccounts = await base44.entities.LoyaltyAccount.filter({
          partner: partner.id,
          email: emailLower
        });
        
        if (existingAccounts && existingAccounts.length > 0) {
          loyaltyAccountToUse = existingAccounts[0];
        } else if (loyaltyEnabled) {
          loyaltyAccountToUse = await base44.entities.LoyaltyAccount.create({
            partner: partner.id,
            email: emailLower,
            balance: 0,
            total_earned: 0,
            total_spent: 0,
            total_expired: 0,
            visit_count: 0
          });
        }
      }

      // Validate points redemption
      if (redeemedPoints > 0) {
        if (!loyaltyAccountToUse || loyaltyAccountToUse.balance < redeemedPoints) {
          toast.error(t('loyalty.insufficient_points'), { id: 'mm1' });
          return false;
        }
      }

      // Get start stage for this order type
      const startStage = getStartStage(orderStages, orderMode);

      // Generate order number (for staff, not shown to guest)
      const { orderNumber, updatedCounters } = getNextOrderNumber(partner, 'hall');

      const orderData = {
        partner: partner.id,
        order_type: 'hall',
        status: "new",
        stage_id: startStage?.id || null,
        payment_status: "unpaid",
        total_amount: finalTotal,
        comment: comment || undefined,
        client_phone: clientPhone || undefined,
        client_email: customerEmail && customerEmail.trim() ? customerEmail.trim().toLowerCase() : undefined,
        public_token: Math.random().toString(36).substring(2, 10),
        table: currentTableId,
        table_session: validatedSession?.id ?? null,
        guest: guestToUse?.id || null,
        order_number: orderNumber,
        loyalty_account: loyaltyAccountToUse?.id || null,
        points_redeemed: redeemedPoints || 0,
        discount_amount: discountAmount + pointsDiscountAmount,
      };

      if (partner?.id && orderData.table) saveTableSelection(partner.id, orderData.table);

      const order = await base44.entities.Order.create(orderData);
      let orderCreated = true;

      // FIX P0: Create order items FIRST â€" commit point before loyalty side effects
      const newItems = cart.map((item) => ({
        order: order.id,
        dish: item.dishId,
        dish_name: item.name,
        dish_price: item.price,
        quantity: item.quantity,
        line_total: Math.round(item.price * item.quantity * 100) / 100,
        split_type: splitType,
      }));

      await base44.entities.OrderItem.bulkCreate(newItems);

      // Post-create side effects â€" best-effort after items exist
      try {
        // Process points redemption AFTER items created (BUG-PM-032, P0 fix)
        if (loyaltyAccountToUse && redeemedPoints > 0) {
          await base44.entities.LoyaltyTransaction.create({
            account: loyaltyAccountToUse.id,
            type: 'redeem',
            amount: -redeemedPoints,
            description: t('loyalty.transaction.redeem')
          });

          await base44.entities.LoyaltyAccount.update(loyaltyAccountToUse.id, {
            balance: loyaltyAccountToUse.balance - redeemedPoints,
            total_spent: (loyaltyAccountToUse.total_spent || 0) + redeemedPoints
          });
        }
      } catch (sideEffectErr) {
        // silent
      }

      // Earn points after order creation â€" best-effort
      try {
        if (loyaltyAccountToUse && loyaltyEnabled && earnedPoints > 0) {
          const expiresAt = new Date();
          expiresAt.setDate(expiresAt.getDate() + (partner.loyalty_expiry_days || 100));

          await base44.entities.LoyaltyTransaction.create({
            account: loyaltyAccountToUse.id,
            type: 'earn_order',
            amount: earnedPoints,
            order: order.id,
            description: t('loyalty.transaction.earn_order', { orderNumber: order.order_number }),
            expires_at: expiresAt.toISOString()
          });

          const newBalance = (loyaltyAccountToUse.balance - redeemedPoints) + earnedPoints;
          await base44.entities.LoyaltyAccount.update(loyaltyAccountToUse.id, {
            balance: newBalance,
            total_earned: (loyaltyAccountToUse.total_earned || 0) + earnedPoints,
            visit_count: (loyaltyAccountToUse.visit_count || 0) + 1,
            last_visit_at: new Date().toISOString()
          });

          await base44.entities.Order.update(order.id, {
            points_earned: earnedPoints
          });
        }
      } catch (earnErr) {
        // silent
      }

      // Update partner counters â€" best-effort
      try { await base44.entities.Partner.update(partner.id, updatedCounters); } catch (e) { /* silent */ }
      
      // Update local partner cache
      queryClient.setQueryData(["publicPartner", partnerParamRaw], (prev) =>
        prev ? { ...prev, ...updatedCounters } : prev
      );

      // Optimistic update session data with proper guest link
      // BUG-PM-004: add _optimisticAt so polling merge preserves this until server confirms
      const optimisticAt = Date.now();
      const orderWithGuest = {
        ...order,
        guest: guestToUse?.id,
        _optimisticAt: optimisticAt,
      };
      // Dedup: skip if a poll already delivered this order
      setSessionOrders(prev => {
        if (prev.some(o => String(o.id) === String(order.id))) return prev;
        return [orderWithGuest, ...prev];
      });
      
      const tempIdBase = typeof crypto !== 'undefined' && crypto.randomUUID 
        ? crypto.randomUUID() 
        : `${Date.now()}_${Math.random().toString(16).slice(2)}`;
      
      // BUG-PM-004: add _optimisticAt so polling merge preserves temp items
      const itemsWithLinks = newItems.map((item, i) => ({
        ...item,
        id: `temp_${tempIdBase}_${i}`,
        order: order.id,
        _optimisticAt: optimisticAt,
      }));
      
      setSessionItems(prev => [...prev, ...itemsWithLinks]);

      // GAP-01: Save cart snapshot for confirmation screen BEFORE clearing
      // FIX P1: Use finalTotal (post-discount) instead of raw cart.reduce
      const confirmedItems = [...cart];
      const confirmedTotal = finalTotal;
      const guestLabel = guestToUse
        ? getGuestDisplayName(guestToUse)
        : null;

      // Clear form
      clearCart();
      clearCartStorage(partner.id);
      setSplitType('single');
      setComment("");
      setCustomerEmail('');
      setLoyaltyAccount(null);
      setRedeemedPoints(0);

      // GAP-01: Show confirmation screen instead of toast
      showConfirmation({
        items: confirmedItems,
        totalAmount: confirmedTotal,
        guestLabel,
        orderMode: "hall",
        publicToken: order.public_token,
        clientName: null,
      });

      return true;
    } catch (err) {
      setSubmitError(t('error.send.title'));
      return false;
    }
  };

  const handleSubmitOrder = async () => {
    // CODE-024: protect from double-tap
    if (submitLockRef.current) return;

    // PM-071: Just-in-time table confirmation BEFORE validate(),
    // because validate() rejects hall submits when !currentTableId,
    // silently blocking the BS trigger.
    if (orderMode === "hall" && !isTableVerified) {
      pendingSubmitRef.current = true;
      setShowTableConfirmSheet(true);
      return;
    }

    if (!validate()) return;

    // Empty cart guard
    if (cart.length === 0) {
      toast.error(tr('cart.empty', 'Cart is empty'), { id: 'mm1' });
      return;
    }

    submitLockRef.current = true;
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Hall mode: handle session and guest
      if (orderMode === "hall" && isTableVerified) {
        // P0-2: Validate existing session is still valid
        let session = tableSession;
        if (session && isSessionExpired(session)) {
          // Session expired â€" close it in DB and force new one
          try {
            await base44.entities.TableSession.update(session.id, {
              status: 'expired',
              closed_at: new Date().toISOString(),
            });
          } catch (e) { /* best effort */ }
          session = null;
        }

        // Ensure we have a valid session
        if (!session) {
          session = await getOrCreateSession(partner.id, currentTableId);
          setTableSession(session);
          sessionIdRef.current = session?.id;
        }

        // P0-2: Hard guard â€" reject order if no valid session
        if (!session?.id) {
          toast.error(t('error.session_expired'), { id: 'session-err' });
          submitLockRef.current = false;
          setIsSubmitting(false);
          return;
        }

        // ============================================================
        // FIX-260131-07 FINAL: SAFEGUARD â€" try restore guest before creating new
        // This prevents "submit races restore" bug where guest is created
        // because currentGuest hasn't been set yet
        // ============================================================
        let guest = currentGuest;
        const normalizeId = (g) => String(g?.id ?? g?._id ?? "");

        if (!guest) {
          try {
            
            // 1) Try device-based lookup (all known device keys)
            const deviceIds = Array.from(new Set(
              [getDeviceId(), localStorage.getItem("menu_device_id"), localStorage.getItem("menuapp_device_id")]
                .filter(Boolean)
                .map(String)
            ));

            for (const dId of deviceIds) {
              if (guest) break;
              const found = await findGuestByDevice(session.id, dId);
              if (found) { guest = found; }
            }

            // 2) Try saved guestId from localStorage (ALL keys, not || )
            if (!guest) {
              const TTL_MS = 8 * 60 * 60 * 1000;
              const readGuestId = (key) => {
                try {
                  const raw = localStorage.getItem(key);
                  if (!raw) return null;
                  const data = JSON.parse(raw);
                  const ts = data?.ts ?? data?.timestamp;
                  const gid = data?.guestId;
                  if (!gid) return null;
                  if (ts && (Date.now() - ts > TTL_MS)) return null;
                  return String(gid);
                } catch { return null; }
              };

              // All possible keys
              const sessionKey = `menuApp_hall_guest_${partner.id}_${session.id}`;
              const tableKey = `menuApp_hall_guest_${partner.id}_${currentTableId}`;
              const legacyKey = `menuapp_guest_${partner.id}_${currentTableId}`;
              
              const sessionSavedId = readGuestId(sessionKey);
              const tableSavedId = readGuestId(tableKey);
              const legacySavedId = readGuestId(legacyKey);

              // Load guests ONCE (optimization)
              const guests = await getSessionGuests(session.id);

              // Try session-key first
              if (sessionSavedId) {
                guest = (guests || []).find(g => normalizeId(g) === sessionSavedId) || null;
              }
              // If not found, try table-key
              if (!guest && tableSavedId) {
                guest = (guests || []).find(g => normalizeId(g) === tableSavedId) || null;
              }
              // If not found, try legacy-key
              if (!guest && legacySavedId) {
                guest = (guests || []).find(g => normalizeId(g) === legacySavedId) || null;
              }
              
              // 3) Try guest_code lookup (using already loaded guests)
              if (!guest) {
                const guestCode = localStorage.getItem("menu_guest_code");
                if (guestCode) {
                  guest = (guests || []).find(g => {
                    const code = g?.guest_code ?? g?.guestCode ?? g?.code ?? g?.menu_guest_code;
                    return code != null && String(code) === String(guestCode);
                  }) || null;
                }
              }
            }

            // If restored â†’ sync state + storage
            if (guest) {
              const gid = normalizeId(guest);
              setCurrentGuest(guest);
              currentGuestIdRef.current = gid || null;
              if (gid) {
                saveGuestId(partner.id, session.id, currentTableId, gid);
              }
              setSessionGuests(prev => {
                const list = Array.isArray(prev) ? prev : [];
                return (gid && list.some(x => normalizeId(x) === gid)) ? list : [...list, guest];
              });
            }
          } catch (e) {
            // Ignore errors, will create new guest below
          }
        }

        // If still no guest after safeguard â€" create new
        if (!guest) {
          const deviceId = getDeviceId();
          guest = await addGuestToSession(session.id, null, deviceId);
          const gid = normalizeId(guest);
          setCurrentGuest(guest);
          currentGuestIdRef.current = gid || null;
          setSessionGuests(prev => [...(Array.isArray(prev) ? prev : []), guest]);
          // Save guest ID for persistence across refreshes
          if (gid) {
            saveGuestId(partner.id, session.id, currentTableId, gid);
          }
        }
        // ============================================================
        // END FIX-260131-07 FINAL
        // ============================================================

        // Process the order (pass validated session to avoid stale closure)
        const success = await processHallOrder(guest, session);
        if (!success) {
          submitLockRef.current = false;
          setIsSubmitting(false);
          return;
        }
      } else {
        // Pickup/Delivery flow (unchanged)
        if (orderMode === "pickup" || orderMode === "delivery" || clientPhone) {
          const isAllowed = await checkRateLimit();
          if (!isAllowed) {
            setSubmitError(t('error.rate_limit'));
            submitLockRef.current = false;
            setIsSubmitting(false);
            return;
          }
        }

        // Handle loyalty account (find or create if email provided)
        let loyaltyAccountToUse = loyaltyAccount;
        if (customerEmail && customerEmail.trim() && !loyaltyAccountToUse) {
          const emailLower = customerEmail.trim().toLowerCase();
          const existingAccounts = await base44.entities.LoyaltyAccount.filter({
            partner: partner.id,
            email: emailLower
          });
          
          if (existingAccounts && existingAccounts.length > 0) {
            loyaltyAccountToUse = existingAccounts[0];
          } else if (loyaltyEnabled) {
            loyaltyAccountToUse = await base44.entities.LoyaltyAccount.create({
              partner: partner.id,
              email: emailLower,
              balance: 0,
              total_earned: 0,
              total_spent: 0,
              total_expired: 0,
              visit_count: 0
            });
          }
        }

        // Validate points redemption
        if (redeemedPoints > 0) {
          if (!loyaltyAccountToUse || loyaltyAccountToUse.balance < redeemedPoints) {
            toast.error(t('loyalty.insufficient_points'), { id: 'mm1' });
            submitLockRef.current = false;
            setIsSubmitting(false);
            return;
          }
        }

        // Get start stage for this order type
        const startStage = getStartStage(orderStages, orderMode);

        const orderData = {
          partner: partner.id,
          order_type: orderMode,
          status: "new",
          stage_id: startStage?.id || null,
          payment_status: "unpaid",
          total_amount: finalTotal,
          comment: comment || undefined,
          client_name: clientName || undefined,
          client_phone: clientPhone || undefined,
          client_email: customerEmail && customerEmail.trim() ? customerEmail.trim().toLowerCase() : undefined,
          delivery_address: orderMode === "delivery" ? deliveryAddress || undefined : undefined,
          public_token: Math.random().toString(36).substring(2, 10),
          loyalty_account: loyaltyAccountToUse?.id || null,
          points_redeemed: redeemedPoints || 0,
          discount_amount: discountAmount + pointsDiscountAmount,
        };

        const order = await base44.entities.Order.create(orderData);

        // FIX P0: Create order items FIRST â€" commit point before loyalty side effects
        const orderItemsData = cart.map((item) => ({
          order: order.id,
          dish: item.dishId,
          dish_name: item.name,
          dish_price: item.price,
          quantity: item.quantity,
          line_total: Math.round(item.price * item.quantity * 100) / 100,
        }));

        await base44.entities.OrderItem.bulkCreate(orderItemsData);

        // Post-create side effects â€" best-effort after items exist
        try {
          // Process points redemption AFTER items created (BUG-PM-032, P0 fix)
          if (loyaltyAccountToUse && redeemedPoints > 0) {
            await base44.entities.LoyaltyTransaction.create({
              account: loyaltyAccountToUse.id,
              type: 'redeem',
              amount: -redeemedPoints,
              description: t('loyalty.transaction.redeem')
            });

            await base44.entities.LoyaltyAccount.update(loyaltyAccountToUse.id, {
              balance: loyaltyAccountToUse.balance - redeemedPoints,
              total_spent: (loyaltyAccountToUse.total_spent || 0) + redeemedPoints
            });
          }
        } catch (sideEffectErr) {
          // silent
        }

        // Earn points after order creation â€" best-effort
        try {
          if (loyaltyAccountToUse && loyaltyEnabled && earnedPoints > 0) {
            const expiresAt = new Date();
            expiresAt.setDate(expiresAt.getDate() + (partner.loyalty_expiry_days || 100));

            await base44.entities.LoyaltyTransaction.create({
              account: loyaltyAccountToUse.id,
              type: 'earn_order',
              amount: earnedPoints,
              order: order.id,
              description: t('loyalty.transaction.earn_order', { orderNumber: order.order_number || order.id }),
              expires_at: expiresAt.toISOString()
            });

            const newBalance = (loyaltyAccountToUse.balance - redeemedPoints) + earnedPoints;
            await base44.entities.LoyaltyAccount.update(loyaltyAccountToUse.id, {
              balance: newBalance,
              total_earned: (loyaltyAccountToUse.total_earned || 0) + earnedPoints,
              visit_count: (loyaltyAccountToUse.visit_count || 0) + 1,
              last_visit_at: new Date().toISOString()
            });

            await base44.entities.Order.update(order.id, {
              points_earned: earnedPoints
            });
          }
        } catch (earnErr) {
          // silent
        }

        // GAP-01: Save cart snapshot for confirmation screen BEFORE clearing
        const confirmedItems = [...cart];
        const confirmedTotal = finalTotal;
        const savedClientName = clientName;

        clearCart();
        clearCartStorage(partner.id);
        setClientName("");
        setClientPhone("");
        setDeliveryAddress("");
        setComment("");
        setCustomerEmail('');
        setLoyaltyAccount(null);
        setRedeemedPoints(0);

        // GAP-01: Show confirmation screen instead of toast + delayed transition
        showConfirmation({
          items: confirmedItems,
          totalAmount: confirmedTotal,
          guestLabel: null,
          orderMode,
          publicToken: order.public_token,
          clientName: savedClientName,
        });

      }
    } catch (err) {
      // silent
      setSubmitError(t('error.send.title'));
    } finally {
      submitLockRef.current = false;
      setIsSubmitting(false);
    }
  };

  // Update guest name (inline on cart page)
  const handleUpdateGuestName = async () => {
    const trimmedName = guestNameInput.trim();
    if (!trimmedName) return;

    try {
      // DB update only if guest record exists
      if (currentGuest?.id) {
        await base44.entities.SessionGuest.update(currentGuest.id, {
          name: trimmedName
        });
        setSessionGuests(prev => prev.map(g =>
          g.id === currentGuest.id ? { ...g, name: trimmedName } : g
        ));
      }

      // Always: persist locally + update state
      try { localStorage.setItem('menuapp_guest_name', trimmedName); } catch (e) { /* quota */ }
      setCurrentGuest(prev => ({ ...(prev || {}), name: trimmedName }));
      setIsEditingName(false);
      setGuestNameInput(trimmedName);

      toast.success(t('guest.name_saved'), { id: 'mm1' });
    } catch (err) {
      // silent
      toast.error(t('error.save_failed'), { id: 'mm1' });
    }
  };

  // Request bill (ServiceRequest)
  const handleCheckoutClick = () => {
    setView("checkout");
  };

  const handleRequestBill = async () => {
    if (billCooldown || billRequested) {
      toast.info(tr('cart.bill_already_requested', 'Bill already requested'), { id: 'mm1' });
      return;
    }
    
    setBillRequested(true);
    try {
      await base44.entities.ServiceRequest.create({
        partner: partner.id,
        table: currentTableId,
        table_session: tableSession?.id,
        request_type: 'bill',
        status: 'new',
        source: 'public'
      });
      
      setBillCooldownStorage(currentTableId);
      setBillCooldown(true);
      toast.success(tr('cart.bill_requested', 'Waiter will bring the bill'), { id: 'mm1' });
    } catch (err) {
      // silent
      toast.error(t('toast.error'), { id: 'mm1' });
      setBillRequested(false);
    }
  };



  // Guards
  if (!partnerParamRaw) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <Card className="w-full max-w-md text-center p-6">
          <p className="text-slate-700 font-medium">{t('error.partner_missing')}</p>
          <p className="text-slate-500 text-sm mt-2">
            {t('error.partner_hint')} <span className="font-mono">?partner=&lt;partner_id|slug&gt;</span>
          </p>
        </Card>
      </div>
    );
  }

  if (loadingPartner) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin" style={{color: '#1A1A1A'}} />
      </div>
    );
  }

  if (partnerError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <Card className="w-full max-w-md text-center p-6">
          <p className="text-slate-500">{t('error.network_error')}</p>
          <p className="text-sm text-slate-400 mt-2">{t('error.check_connection')}</p>
          <Button variant="outline" className="mt-4 min-h-[44px]" onClick={() => refetchPartner()}>
            {t('common.retry')}
          </Button>
        </Card>
      </div>
    );
  }

  if (!partner) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <Card className="w-full max-w-md text-center p-6">
          <p className="text-slate-500">{t('error.partner_not_found')}</p>
        </Card>
      </div>
    );
  }

  // P1-5: Error UI for failed requests
  if ((dishesError || categoriesError) && !isRateLimitError(dishesError) && !isRateLimitError(categoriesError)) {
    return (
      <ErrorState
        onRetry={() => window.location.reload()}
        t={t}
      />
    );
  }

  // Empty state: no content at all
  if (!loadingDishes && !channels.hasAnyContent) {
    return (
      <EmptyMenuState
        partner={partner}
        activeContactLinks={activeContactLinks}
        viewMode={viewMode}
        enabledLanguages={enabledLanguages}
        enabledCurrencies={enabledCurrencies}
        lang={lang}
        activeCurrency={activeCurrency}
        onLangChange={handleLangChange}
        onCurrencyChange={handleCurrencyChange}
        onContactClick={handleContactClick}
        isSafeUrl={isSafeUrl}
        t={t}
        CURRENCY_SYMBOLS={CURRENCY_SYMBOLS}
      />
    );
  }

  const getModeDescription = () => {
    switch (orderMode) {
      case "hall":
        return t('mode.hall.desc');
      case "pickup":
        return t('mode.pickup.desc');
      case "delivery":
        return t('mode.delivery.desc');
      default:
        return "";
    }
  };

  // ============================================================
  // HALL CHECKOUT SCREEN (TASK-260127-01: removed "Ð¡Ñ‚Ð¾Ð» Ð¿Ð¾Ð´Ñ‚Ð²ÐµÑ€Ð¶Ð´Ñ‘Ð½" block)
  // ============================================================
  const renderHallCheckoutContent = () => {
    // Table already verified - nothing special needed here
    // (table info shown in menu header, comment field below)
    if (isTableVerified && currentTableId) {
      return null;
    }

    // Table NOT verified - show verification options (NO dropdown per P0-7)
    const showHallOnlineBenefitsHint = !!(partner?.discount_enabled || partner?.loyalty_enabled);

    return (
      <div className="space-y-3">
        <div className="text-sm text-slate-700 text-center">
          {t('hall.verify.title')}
        </div>
        <div className="text-xs text-slate-500 text-center">
          {t('hall.verify.subtitle')}
        </div>
        <div className="text-xs text-slate-500 text-center">
          {t('hall.verify.benefit')}
        </div>

        <HallVerifyBlock
          tableCodeInput={tableCodeInput}
          setTableCodeInput={setTableCodeInput}
          isVerifyingCode={isVerifyingCode}
          codeVerificationError={codeVerificationError}
          hallGuestCodeEnabled={hallGuestCodeEnabled}
          guestCode={guestCode}
          partner={partner}
          t={t}
        />

        {showHallOnlineBenefitsHint && (
          <div className="text-xs text-slate-500 text-center">
            {t('hall.verify.online_benefits')}
          </div>
        )}
      </div>
    );
};

  return (
    <div className="min-h-screen bg-slate-50 pb-24 font-sans">
      <PublicMenuHeader
        partner={partner}
        activeContactLinks={activeContactLinks}
        viewMode={viewMode}
        enabledLanguages={enabledLanguages}
        enabledCurrencies={enabledCurrencies}
        lang={lang}
        activeCurrency={activeCurrency}
        onLangChange={handleLangChange}
        onCurrencyChange={handleCurrencyChange}
        onContactClick={handleContactClick}
        isSafeUrl={isSafeUrl}
        t={t}
        CURRENCY_SYMBOLS={CURRENCY_SYMBOLS}
      />

      {/* Redirect banner */}
      {redirectBanner && (
        <RedirectBanner
          redirectBanner={redirectBanner}
          onClose={() => setRedirectBanner(null)}
          t={t}
        />
      )}

      {/* Mode tabs */}
      {view === "menu" && visibleModeTabs.length > 0 && (
        <ModeTabs
          visibleModeTabs={visibleModeTabs}
          orderMode={orderMode}
          onModeChange={handleModeChange}
          getModeDescription={getModeDescription}
          isHallMode={isHallMode}
          isTableVerified={isTableVerified}
          currentTableId={currentTableId}
          currentTable={currentTable}
          tableCodeParam={tableCodeParam}
          resolvedTable={resolvedTable}
          verifiedByCode={verifiedByCode}
          t={t}
          primaryColor={primaryColor}
        />
      )}

      {/* Category chips */}
      {view === "menu" && sortedCategories.length > 1 && (
        <CategoryChips
          sortedCategories={sortedCategories}
          activeCategoryKey={activeCategoryKey}
          onCategoryClick={handleCategoryClick}
          getCategoryName={getCategoryName}
          chipRefs={chipRefs}
          t={t}
          activeColor={primaryColor}
        />
      )}

      {/* Menu list */}
      {view === "menu" && (
        <MenuView
          partner={partner}
          isMobile={isMobile}
          mobileLayout={mobileLayout}
          onSetMobileLayout={handleSetMobileLayout}
          showReviews={showReviews}
          dishRatings={dishRatings}
          onOpenReviews={(dishId) => setSelectedDishId(dishId)}
          listTopRef={listTopRef}
          loadingDishes={loadingDishes}
          sortedCategories={sortedCategories}
          groupedDishes={groupedDishes}
          getCategoryName={getCategoryName}
          sectionRefs={sectionRefs}
          cart={cart}
          getDishName={getDishName}
          getDishDescription={getDishDescription}
          formatPrice={formatPrice}
          addToCart={addToCart}
          updateQuantity={updateQuantity}
          onDishClick={(dish) => { setDetailDish(dish); pushOverlay('detailDish'); }}
          t={t}
        />
      )}

      {/* Checkout */}
      {view === "checkout" && (
        <CheckoutView
          t={t}
          setView={setView}
          cart={cart}
          updateQuantity={updateQuantity}
          formatPrice={formatPrice}
          cartTotalItems={cartTotalItems}
          cartTotalAmount={cartTotalAmount}
          clearCart={clearCart}
          showLoyaltySection={showLoyaltySection}
          customerEmail={customerEmail}
          setCustomerEmail={setCustomerEmail}
          loyaltyLoading={loyaltyLoading}
          loyaltyAccount={loyaltyAccount}
          partner={partner}
          earnedPoints={earnedPoints}
          redeemedPoints={redeemedPoints}
          setRedeemedPoints={setRedeemedPoints}
          maxRedeemPoints={maxRedeemPoints}
          discountEnabled={discountEnabled}
          discountAmount={discountAmount}
          pointsDiscountAmount={pointsDiscountAmount}
          finalTotal={finalTotal}
          loyaltyEnabled={loyaltyEnabled}
          activeCurrency={activeCurrency}
          defaultCurrency={defaultCurrency}
          orderMode={orderMode}
          renderHallCheckoutContent={renderHallCheckoutContent}
          clientName={clientName}
          setClientName={setClientName}
          clientPhone={clientPhone}
          handlePhoneChange={handlePhoneChange}
          handlePhoneFocus={handlePhoneFocus}
          deliveryAddress={deliveryAddress}
          setDeliveryAddress={setDeliveryAddress}
          comment={comment}
          setComment={setComment}
          errors={errors}
          submitError={submitError}
          isSubmitting={isSubmitting}
          handleSubmitOrder={handleSubmitOrder}
          isTableVerified={isTableVerified}
          currentTableId={currentTableId}
        />
      )}

      {/* GAP-01: Order Confirmation Screen */}
      {view === "confirmation" && confirmationData && (
        <OrderConfirmationScreen
          items={confirmationData.items}
          totalAmount={confirmationData.totalAmount}
          guestLabel={confirmationData.guestLabel}
          orderMode={confirmationData.orderMode}
          publicToken={confirmationData.publicToken}
          clientName={confirmationData.clientName}
          formatPrice={formatPrice}
          partner={partner}
          onBackToMenu={dismissConfirmation}
          onOpenOrders={() => {
            dismissConfirmation();
            pushOverlay('cart');
            setDrawerMode("cart");
          }}
          onTrackOrder={handleTrackOrder}
          t={t}
        />
      )}

      {/* GAP-02: Order Status Screen (embedded) */}
      {view === "orderstatus" && orderStatusToken && (
        <OrderStatusScreen
          token={orderStatusToken}
          partnerId={partner?.id}
          onBackToMenu={dismissOrderStatus}
          t={t}
        />
      )}

      {/* TASK-260203-01: Cart as Bottom Drawer */}
      <Drawer
        open={drawerMode === 'cart'}
        dismissible={!isSubmitting}
        onOpenChange={(open) => { if (!open && !isSubmitting) { popOverlay('cart'); setDrawerMode(null); } }}
      >
        <DrawerContent className="max-h-[85vh] overflow-hidden">
          <DrawerHeader className="sr-only">
            <DrawerTitle>{t('cart.title')}</DrawerTitle>
          </DrawerHeader>
          <div className="overflow-y-auto max-h-[calc(85vh-2rem)]">
            <CartView
              partner={partner}
              currentTable={currentTable}
              currentGuest={currentGuest}
              t={t}
              setView={setView}
              isEditingName={isEditingName}
              guestNameInput={guestNameInput}
              setGuestNameInput={setGuestNameInput}
              handleUpdateGuestName={handleUpdateGuestName}
              setIsEditingName={setIsEditingName}
              getGuestDisplayName={getGuestDisplayName}
              cart={cart}
              formatPrice={formatPrice}
              updateQuantity={updateQuantity}
              sessionGuests={sessionGuests}
              splitType={splitType}
              setSplitType={setSplitType}
              showLoyaltySection={showLoyaltySection}
              showLoginPromptAfterRating={showLoginPromptAfterRating}
              customerEmail={customerEmail}
              setCustomerEmail={setCustomerEmail}
              loyaltyLoading={loyaltyLoading}
              loyaltyAccount={loyaltyAccount}
              earnedPoints={earnedPoints}
              maxRedeemPoints={maxRedeemPoints}
              redeemedPoints={redeemedPoints}
              setRedeemedPoints={setRedeemedPoints}
              toast={toast}
              cartTotalAmount={cartTotalAmount}
              discountAmount={discountAmount}
              pointsDiscountAmount={pointsDiscountAmount}
              isSubmitting={isSubmitting}
              submitError={submitError}
              setSubmitError={setSubmitError}
              handleSubmitOrder={handleSubmitOrder}
              myOrders={myOrders}
              itemsByOrder={itemsByOrder}
              getOrderStatus={getOrderStatus}
              reviewedItems={reviewedItems}
              draftRatings={draftRatings}
              updateDraftRating={updateDraftRating}
              sessionItems={sessionItems}
              sessionOrders={sessionOrders}
              myBill={myBill}
              reviewableItems={reviewableItems}
              openReviewDialog={openReviewDialog}
              handleRequestBill={handleRequestBill}
              billRequested={billRequested}
              billCooldown={billCooldown}
              otherGuestsBills={otherGuestsBills}
              othersTotal={othersTotal}
              setOtherGuestsExpanded={setOtherGuestsExpanded}
              otherGuestsExpanded={otherGuestsExpanded}
              getLinkId={getLinkId}
              otherGuestsReviewableItems={otherGuestsReviewableItems}
              tableTotal={tableTotal}
              formatOrderTime={formatOrderTime}
              handleRateDish={handleRateDish}
              ratingSavingByItemId={ratingSavingByItemId}
              onClose={() => { popOverlay('cart'); setDrawerMode(null); }}
              onCallWaiter={handleHelpFromCart}
              isTableVerified={isTableVerified}
              tableCodeInput={tableCodeInput}
              setTableCodeInput={setTableCodeInput}
              isVerifyingCode={isVerifyingCode}
              verifyTableCode={verifyTableCode}
              codeVerificationError={codeVerificationError}
              hallGuestCodeEnabled={hallGuestCodeEnabled}
              guestCode={guestCode}
            />
          </div>
        </DrawerContent>
      </Drawer>

      {/* Just-in-time Table Confirmation Bottom Sheet (PM-064) */}
      {/* PM-071: z-[60] on DrawerContent ensures BS renders above cart Drawer (z-50) */}
      <Drawer
        open={showTableConfirmSheet}
        onOpenChange={(open) => {
          if (!open) {
            pendingSubmitRef.current = false;
            popOverlay('tableConfirm');
            setShowTableConfirmSheet(false);
            if (!isTableVerified) {
              toast(tr('cart.confirm_table.dismissed', 'Got it'), { id: 'table-dismiss' });
            }
          }
        }}
      >
        <DrawerContent className="max-h-[85dvh] rounded-t-3xl z-[60]">
          <div className="relative">
            {/* #143: Chevron close button â€" top-right */}
            <button
              onClick={() => { popOverlay('tableConfirm'); pendingSubmitRef.current = false; setShowTableConfirmSheet(false); }}
              className="absolute top-3 right-3 w-11 h-11 flex items-center justify-center rounded-full bg-gray-200 text-gray-500 z-10"
              aria-label={t('common.close', 'Ð—Ð°ÐºÑ€Ñ‹Ñ‚ÑŒ')}
            >
              <ChevronDown className="w-6 h-6" />
            </button>
            <DrawerHeader className="text-center pb-2">

              <DrawerTitle className="text-lg font-semibold text-slate-900">
                {tr('cart.verify.enter_table_code', 'Enter table code')}
              </DrawerTitle>
              <p className="text-xs text-gray-400 mt-2 px-4">
                {tr('cart.verify.helper_text', 'Enter code from your table')}
              </p>
            </DrawerHeader>
          </div>
          <div className="px-6 pb-6">
            {/* Table code input */}
            <div className="flex flex-col items-center gap-4 mt-4">
              <div className="flex gap-2 justify-center">
                {Array.from({ length: tableCodeLength }).map((_, idx) => {
                  const safe = String(tableCodeInput || '').replace(/\D/g, '').slice(0, tableCodeLength);
                  const ch = safe[idx] || '';
                  return (
                    <div
                      key={idx}
                      className="w-10 h-12 rounded-lg border-2 border-slate-200 bg-white flex items-center justify-center text-xl font-mono text-slate-900 cursor-pointer"
                      style={{'--tw-ring-color': primaryColor}}
                      onClick={() => codeInputRef.current?.focus()}
                    >
                      {ch || <span className="text-slate-300">_</span>}
                    </div>
                  );
                })}
              </div>
              <Input
                ref={codeInputRef}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={tableCodeLength}
                autoFocus
                value={String(tableCodeInput || '').replace(/\D/g, '').slice(0, tableCodeLength)}
                onChange={(e) => {
                  const next = String(e.target.value || '').replace(/\D/g, '').slice(0, tableCodeLength);
                  if (typeof setTableCodeInput === 'function') setTableCodeInput(next);
                }}
                className="sr-only"
                placeholder=""
                aria-label={tr('cart.verify.enter_table_code', 'Enter table code')}
              />
              {isVerifyingCode && (
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {t('common.loading')}
                </div>
              )}
              {codeVerificationError && !isVerifyingCode && (
                <p className="text-sm text-red-600 text-center">{codeVerificationError}</p>
              )}
            </div>
            {/* Bonus motivation (PM-082) */}
            {(() => {
              if (!loyaltyEnabled) return null;
              const motivationPoints = Math.round((Number(cartTotalAmount) || 0) * (Number(partner?.loyalty_points_per_currency) || 1));
              if (motivationPoints <= 0) return null;
              return (
                <p className="text-center text-sm text-emerald-600 mt-4">
                  {tr('cart.motivation_bonus_short', `+${motivationPoints} Ð±Ð¾Ð½ÑƒÑÐ¾Ð² Ð·Ð° ÑÑ‚Ð¾Ñ‚ Ð·Ð°ÐºÐ°Ð·`)}
                </p>
              );
            })()}
            {/* Primary CTA: Confirm and submit (PM-064 A3) */}
            <Button
              className="w-full mt-6 text-white"
              style={{ backgroundColor: primaryColor }}
              disabled={isVerifyingCode || String(tableCodeInput || '').replace(/\D/g, '').length < tableCodeLength}
              onClick={() => {
                const code = String(tableCodeInput || '').replace(/\D/g, '').slice(0, tableCodeLength);
                if (code.length === tableCodeLength && typeof verifyTableCode === 'function') {
                  verifyTableCode(code);
                }
              }}
            >
              {isVerifyingCode
                ? t('common.loading')
                : tr('cart.confirm_table.submit', 'Send')}
            </Button>
          </div>
        </DrawerContent>
      </Drawer>

      {/* Floating Help Button - only when table verified in Hall */}
      {orderMode === "hall" && isTableVerified && currentTableId && (
        <div className="relative inline-block">
          <HelpFab
            fabSuccess={fabSuccess}
            isSendingHelp={isSendingHelp}
            isHelpModalOpen={isHelpModalOpen}
            onOpen={openHelpDrawer}
            t={t}
          />
          {/* HD-07: Badge showing active request count */}
          {activeRequestCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-[#B5543A] text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-medium pointer-events-none z-10">
              {activeRequestCount}
            </span>
          )}
        </div>
      )}

      {/* PM-125: Help as Bottom Drawer (replaces HelpModal Dialog) */}
      <Drawer open={isHelpModalOpen} onOpenChange={(open) => { if (!open) closeHelpDrawer(); }}>
        <DrawerContent className="max-h-[85vh] rounded-t-2xl flex flex-col">
          <div className="relative">
            {isTicketExpanded && (
              <button
                onClick={() => { setIsTicketExpanded(false); }}
                className="absolute top-3 left-3 min-h-[44px] px-3 flex items-center gap-1 rounded-full bg-slate-100 text-slate-700 z-10 text-sm font-medium"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>{t('help.back_to_help')}</span>
              </button>
            )}
            <button
              onClick={closeHelpDrawer}
              className="absolute top-3 right-3 w-11 h-11 flex items-center justify-center rounded-full bg-gray-200 text-gray-500 z-10"
              aria-label={t('common.close', 'Закрыть')}
            >
              <ChevronDown className="w-6 h-6" />
            </button>
            <DrawerHeader className="text-center pb-2">
              <DrawerTitle className="text-lg font-semibold text-slate-900">{isTicketExpanded ? t('help.my_requests') : t('help.modal_title')}</DrawerTitle>
              {!isTicketExpanded && (
                <p className="text-sm text-slate-500 mt-1">{t('help.modal_desc')}</p>
              )}
            </DrawerHeader>
          </div>
          <div className="px-4 pb-6 space-y-4 overflow-y-auto flex-1">
            {currentTable && (
              <div className="flex items-center justify-center gap-2 text-sm text-slate-600">
                <MapPin className="w-4 h-4" />
                <span>{currentTable?.name || currentTable?.code}</span>
              </div>
            )}
            {ticketRows.length > 0 && (
              <div ref={ticketBoardRef} className="mb-4">
                {!isTicketExpanded && (
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-gray-700">{t('help.my_requests')}</span>
                    {activeRequestCount > 0 && (
                      <span className="text-xs text-gray-400">{activeRequestCount} {t('help.active_count')}</span>
                    )}
                  </div>
                )}
                {(() => {
                  const visibleRequests = isTicketExpanded
                    ? (activeRequests.length > 0 ? activeRequests : ticketRows)
                    : (activeRequests.length > 0 ? activeRequests.slice(0, HELP_PREVIEW_LIMIT) : ticketRows.slice(0, HELP_PREVIEW_LIMIT));
                  const freshnessLabel = getHelpFreshnessLabel();
                  return (
                    <>
                      {visibleRequests.map(req => {
                        const isHighlighted = highlightedTicket === req.id;
                        const cooldownActive = req.remindCooldownUntil && req.remindCooldownUntil > Date.now();
                        const cooldownSec = cooldownActive ? Math.ceil((req.remindCooldownUntil - Date.now()) / 1000) : 0;
                        const cooldownMin = Math.floor(cooldownSec / 60);
                        const cooldownSecRem = cooldownSec % 60;
                        const reminderLabel = getHelpReminderLabel(req);
                        const errorCopy = getHelpErrorCopy(req);
                        const isSending = req.status === 'sending' || req.pendingAction === 'send' || req.pendingAction === 'remind';
                        const isResolved = req.status === 'resolved';
                        const isClosed = req.status === 'closed_by_guest';
                        return (
                          <div
                            key={req.id}
                            className={`rounded-lg border p-3 mb-2 transition-colors duration-300 ${
                              isHighlighted
                                ? 'bg-amber-50 border-amber-300'
                                : errorCopy
                                  ? 'bg-red-50 border-red-200'
                                  : isResolved || isClosed
                                    ? 'bg-emerald-50 border-emerald-200'
                                    : 'bg-white border-slate-200'
                            }`}
                          >
                            <div className="text-sm font-medium text-slate-800">
                              {HELP_CARD_LABELS[req.type] || req.type}
                            </div>
                            {req.message && (
                              <div className="text-xs text-slate-500 mt-1 break-words">{req.message}</div>
                            )}
                            <div className="mt-2">
                              {isClosed ? (
                                <div className="text-sm font-medium text-emerald-700">{tr('help.closed_by_guest', '✅ No longer needed')}</div>
                              ) : isResolved ? (
                                <div className="text-sm font-medium text-emerald-700">{getHelpResolvedLabel(req.type)}</div>
                              ) : errorCopy ? (
                                <>
                                  <div className="text-sm font-medium text-red-700">{errorCopy.title}</div>
                                  <div className="text-xs text-red-600 mt-1">{errorCopy.detail}</div>
                                </>
                              ) : (
                                <>
                                  <div className="text-sm text-slate-700">
                                    {isSending ? tr('help.sending_now', 'Sending…') : getHelpWaitLabel(req)}
                                  </div>
                                  {reminderLabel && (
                                    <div className="text-xs text-slate-500 mt-1">{reminderLabel}</div>
                                  )}
                                </>
                              )}
                            </div>
                            {!isClosed && !isResolved && (
                              <div className="flex gap-2 mt-3">
                                {errorCopy ? (
                                  <button
                                    onClick={() => handleRetry(req)}
                                    className="flex-1 text-xs font-medium py-2 min-h-[36px] rounded-lg text-red-700 bg-red-100 active:bg-red-200"
                                  >
                                    {tr('help.retry', 'Retry')}
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => handleRemind(req.type, req.type === 'other' ? req.id : undefined)}
                                    disabled={isSending || cooldownActive}
                                    className={`flex-1 text-xs font-medium py-2 min-h-[36px] rounded-lg ${
                                      isSending || cooldownActive
                                        ? 'text-slate-400 bg-slate-100'
                                        : 'text-orange-800 bg-orange-50 active:bg-orange-100'
                                    }`}
                                  >
                                    {isSending
                                      ? tr('help.sending_now', 'Sending…')
                                      : cooldownActive
                                        ? `${tr('help.retry_in', 'In')} ${String(cooldownMin).padStart(2, '0')}:${String(cooldownSecRem).padStart(2, '0')}`
                                        : tr('help.remind', 'Remind')}
                                  </button>
                                )}
                                <button
                                  onClick={() => handleResolve(req.type, req.type === 'other' ? req.id : undefined)}
                                  className="flex-1 text-xs font-medium py-2 min-h-[36px] rounded-lg text-slate-600 bg-slate-100 active:bg-slate-200"
                                >
                                  {t('help.cancel_request')}
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })}
                      {!isTicketExpanded && activeRequestCount > HELP_PREVIEW_LIMIT && (
                        <button
                          onClick={() => { setIsTicketExpanded(true); setShowOtherForm(false); }}
                          className="w-full text-center text-sm font-medium text-blue-600 py-2 min-h-[40px]"
                        >
                          {t('help.all_requests_cta', { count: activeRequestCount })}
                        </button>
                      )}
                      {freshnessLabel && (
                        <p className="text-xs text-gray-400 mt-1 text-center break-words">{freshnessLabel}</p>
                      )}
                    </>
                  );
                })()}
              </div>
            )}
            {!isTicketExpanded && activeRequests.length > 0 && (
              <span className="text-sm font-semibold text-gray-700">{t('help.send_more')}</span>
            )}
            {!isTicketExpanded && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { id: 'call_waiter', emoji: '\uD83D\uDE4B', label: t('help.call_waiter') },
                    { id: 'bill', emoji: '\uD83E\uDDFE', label: t('help.bill') },
                    { id: 'napkins', emoji: null, label: t('help.napkins') },
                    { id: 'menu', emoji: '\uD83D\uDCC4', label: t('help.menu') },
                  ].map(card => {
                    const activeRow = activeRequests.find((row) => row.type === card.id);
                    const isSubdued = Boolean(activeRow);
                    return (
                      <button
                        key={card.id}
                        onClick={() => {
                          if (activeRow) {
                            focusHelpRow(activeRow.id);
                            return;
                          }
                          handleCardTap(card.id);
                        }}
                        className={`relative rounded-xl border min-h-[80px] flex flex-col items-center justify-center gap-1 px-2 ${
                          isSubdued
                            ? 'bg-slate-50 border-slate-200 text-slate-500'
                            : 'bg-white border-slate-200 active:border-blue-400 active:bg-blue-50'
                        }`}
                      >
                        {card.id === 'napkins' ? (
                          <Layers className={`w-6 h-6 ${isSubdued ? 'text-slate-400' : 'text-slate-500'}`} />
                        ) : (
                          <span className={`text-2xl ${isSubdued ? 'opacity-60' : ''}`}>{card.emoji}</span>
                        )}
                        <span className={`text-sm font-medium text-center ${isSubdued ? 'text-slate-500' : 'text-slate-700'}`}>
                          {card.label}
                        </span>
                        {isSubdued && (
                          <span className="text-[11px] font-medium text-slate-400">
                            {t('help.already_sent_short')}
                          </span>
                        )}
                      </button>
                    );
                  })}
                  <button
                    onClick={() => setShowOtherForm(prev => !prev)}
                    className="relative col-span-2 rounded-xl border min-h-[48px] flex flex-row items-center justify-center gap-2 bg-white border-slate-200 active:border-blue-400 active:bg-blue-50"
                  >
                    <span className="text-xl">{'\u270F\uFE0F'}</span>
                    <span className="text-sm font-medium text-slate-700">
                      {t('help.other')}
                    </span>
                  </button>
                </div>
                {showOtherForm && (
                  <div className="space-y-3 pt-1">
                    <div className="flex flex-wrap gap-2">
                      {HELP_CHIPS.map(chip => (
                        <button
                          key={chip}
                          onClick={() => setHelpComment(prev => prev ? `${prev}, ${chip.toLowerCase()}` : chip)}
                          className="px-3 py-1.5 rounded-full border border-slate-200 bg-white text-sm text-slate-700 active:bg-slate-100 min-h-[36px]"
                        >
                          {chip}
                        </button>
                      ))}
                    </div>
                    <textarea
                      autoFocus
                      value={helpComment}
                      onChange={(e) => setHelpComment(e.target.value.slice(0, 100))}
                      maxLength={100}
                      placeholder={t('help.comment_placeholder_other')}
                      className="w-full rounded-lg border border-slate-200 p-3 text-sm min-h-[80px] resize-none focus:outline-none focus:ring-2 focus:ring-blue-200"
                    />
                    <div className="text-right text-xs text-slate-400">{helpComment.length} / 100</div>
                  </div>
                )}
              </>
            )}
            {undoToast && (
              <div className="rounded-lg bg-slate-800 text-white px-4 py-3 flex items-center justify-between text-sm">
                <span>{HELP_CARD_LABELS[undoToast.type] || undoToast.type} {t('help.sent_suffix')}</span>
                <button onClick={handleUndo} className="text-amber-300 font-medium ml-2 min-h-[44px] min-w-[44px] flex items-center justify-center">
                  {t('help.undo')} ({Math.max(0, Math.ceil((undoToast.expiresAt - Date.now()) / 1000))})
                </button>
              </div>
            )}
            {helpSubmitError && !ticketRows.some((row) => row.errorKind) && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">{helpSubmitError}</div>
            )}
          </div>
          {!isTicketExpanded && showOtherForm && (
            <div className="px-4 pb-4 pt-2 border-t border-slate-100 flex gap-3">
              <Button
                variant="outline"
                className="flex-1 min-h-[44px]"
                onClick={() => { setShowOtherForm(false); setHelpComment(''); }}
              >
                {tr('common.cancel', 'Cancel')}
              </Button>
              <Button
                className="flex-1 min-h-[44px] text-white"
                style={{ backgroundColor: primaryColor }}
                onClick={() => {
                  if (!helpComment.trim()) return;
                  const msg = helpComment.trim();
                  if (undoToast?.timeoutId) clearTimeout(undoToast.timeoutId);
                  const entryId = `other-${Date.now()}`;
                  const timeoutId = setTimeout(() => {
                    if (currentTableIdRef.current !== currentTableId) return;
                    const now = Date.now();
                    setRequestStates(prev => {
                      const otherArr = Array.isArray(prev.other) ? prev.other : (prev.other ? [prev.other] : []);
                      return {
                        ...prev,
                        other: [
                          ...otherArr,
                          {
                            id: entryId,
                            status: 'sending',
                            sentAt: now,
                            lastReminderAt: null,
                            reminderCount: 0,
                            remindCooldownUntil: null,
                            message: msg,
                            pendingAction: 'send',
                            errorKind: null,
                            errorMessage: '',
                            terminalHideAt: null,
                            syncSource: 'local',
                          },
                        ],
                      };
                    });
                    setHelpComment(msg);
                    pendingQuickSendRef.current = { type: 'other', action: 'send', rowId: entryId, message: msg };
                    handlePresetSelect('other');
                    setPendingHelpActionTick((value) => value + 1);
                    setUndoToast(prev => (prev?.timeoutId === timeoutId ? null : prev));
                  }, 5000);
                  setUndoToast({ type: 'other', rowId: entryId, tableId: currentTableId, message: msg, expiresAt: Date.now() + 5000, timeoutId });
                  setShowOtherForm(false);
                  setHelpComment('');
                }}
                disabled={!helpComment.trim()}
              >
                {t('help.submit_arrow')}
              </Button>
            </div>
          )}
          {/* cardActionModal removed â€" replaced by ticket board + smart redirect (Fix 1B) */}
        </DrawerContent>
      </Drawer>

      {/* P0-6: Removed custom toast - using sonner */}

      {/* Review Dialog */}
      <ReviewDialog
        open={reviewDialogOpen}
        onOpenChange={setReviewDialogOpen}
        t={t}
        partner={partner}
        reviewingItems={reviewingItems}
        ratings={ratings}
        onChangeRating={(itemId, val) => setRatings(prev => ({
          ...prev,
          [itemId]: { ...prev[itemId], rating: val }
        }))}
        onChangeComment={(itemId, text) => setRatings(prev => ({
          ...prev,
          [itemId]: { ...prev[itemId], comment: text }
        }))}
        submittingReview={submittingReview}
        onSubmit={handleSubmitReviews}
        hasLoyalty={!!loyaltyAccount}
      />

      {/* Dish Reviews Modal (read-only) */}
      <DishReviewsModal
        open={!!selectedDishId}
        onOpenChange={(open) => !open && setSelectedDishId(null)}
        dishTitle={selectedDish ? getDishName(selectedDish) : undefined}
        reviews={selectedDishReviews}
        loading={loadingDishReviews}
      />

      {/* PM-102/PM-122: Dish Detail as Bottom Drawer */}
      <Drawer open={!!detailDish} onOpenChange={(open) => { if (!open) { popOverlay('detailDish'); setDetailDish(null); } }}>
        <DrawerContent className="max-h-[88vh] rounded-t-2xl overflow-hidden p-0">
          <DrawerTitle className="sr-only">{detailDish ? getDishName(detailDish) : ''}</DrawerTitle>
          {detailDish && (
            <div className="flex flex-col h-full">
              {/* Photo with close chevron */}
              <div className="relative w-full flex-shrink-0">
                {detailDish.image && (
                  <div className="w-full aspect-square bg-slate-100">
                    <img
                      src={detailDish.image}
                      alt={getDishName(detailDish)}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <button
                  onClick={() => { popOverlay('detailDish'); setDetailDish(null); }}
                  className="absolute top-3 right-3 w-11 h-11 flex items-center justify-center rounded-full bg-black/40 text-white"
                  aria-label={t('common.close', 'Ð—Ð°ÐºÑ€Ñ‹Ñ‚ÑŒ')}
                >
                  <ChevronDown className="w-6 h-6" />
                </button>
              </div>
              {/* Scrollable content: PM-123 order: Title â†’ Description â†’ Price+Discount â†’ Rating */}
              <div className="overflow-y-auto flex-1 p-4 space-y-3">
                <h2 className="text-lg font-bold text-slate-900">
                  {getDishName(detailDish)}
                </h2>
                {getDishDescription(detailDish) && (
                  <p className="text-sm text-slate-500">
                    {getDishDescription(detailDish)}
                  </p>
                )}
                {/* PM-118: Discount display â€" partner-level pattern (matches MenuView.jsx) */}
                <div className="flex items-baseline gap-2">
                  {partner?.discount_enabled === true && (partner?.discount_percent ?? 0) > 0 ? (
                    <>
                      <span className="text-lg font-bold" style={{ color: partner?.primary_color || '#1A1A1A' }}>
                        {formatPrice(parseFloat((detailDish.price * (1 - partner.discount_percent / 100)).toFixed(2)))}
                      </span>
                      <span className="text-sm text-slate-400 line-through">
                        {formatPrice(detailDish.price)}
                      </span>
                      <span
                        className="text-xs font-bold text-white px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: partner?.discount_color || '#C92A2A' }}
                      >
                        -{partner.discount_percent}%
                      </span>
                    </>
                  ) : (
                    <span className="text-lg font-bold" style={{ color: partner?.primary_color || '#1A1A1A' }}>
                      {formatPrice(detailDish.price)}
                    </span>
                  )}
                </div>
                {showReviews && dishRatings?.[detailDish.id] && (
                  <DishRating
                    avgRating={dishRatings[detailDish.id]?.avg}
                    reviewCount={dishRatings[detailDish.id]?.count}
                  />
                )}
              </div>
              {/* Sticky bottom bar */}
              <div className="sticky bottom-0 bg-white p-4 border-t border-slate-100">
                <Button
                  variant="ghost"
                  className="w-full min-h-[44px]"
                  style={{ backgroundColor: partner?.primary_color || '#1A1A1A', color: '#FFFFFF' }}
                  onClick={() => { addToCart(detailDish); popOverlay('detailDish'); setDetailDish(null); }}
                >
                  {t('menu.add_to_cart', 'Ð"Ð¾Ð±Ð°Ð²Ð¸Ñ‚ÑŒ Ð² ÐºÐ¾Ñ€Ð·Ð¸Ð½Ñƒ')}
                </Button>
              </div>
            </div>
          )}
        </DrawerContent>
      </Drawer>

      {/* PM-156: Floating bell removed â€" bell accessible via CartView header + help drawer */}

      {/* Sticky cart bar - updated for TableSession */}
      {view === "menu" && (() => {
        // Hall mode: show if cart has items OR if there are past orders OR table activity
        if (isHallMode && showCartButton) {
          return (
            <StickyCartBar
              t={t}
              isHallMode={true}
              isDrawerOpen={drawerMode === 'cart'}
              hasCart={(cart?.length || 0) > 0}
              cartTotalItems={cartTotalItems}
              formattedCartTotal={formatPrice(cartTotalAmount)}
              isLoadingBill={hallStickyIsLoadingBill}
              formattedBillTotal={hallStickyBillTotal}
              onButtonClick={() => {
                if (hallStickyMode === 'cartEmpty' && isSessionLoading) {
                  toast.info(t('common.loading'), { id: 'mm1', duration: 1500 });
                  return;
                }
                if (isSubmitting && drawerMode === 'cart') return;
                if (drawerMode !== 'cart') {
                  pushOverlay('cart');
                  setDrawerMode('cart');
                } else {
                  popOverlay('cart');
                  setDrawerMode(null);
                }
              }}
              buttonLabel={hallStickyButtonLabel}
              hallModeLabel={hallStickyModeLabel}
              showBillAmount={hallStickyShowBillAmount}
              primaryColor={primaryColor}
            />
          );
        }

        // Pickup/Delivery: original behavior
        if (cart.length > 0) {
          return (
            <StickyCartBar
              t={t}
              isHallMode={false}
              hasCart={true}
              cartTotalItems={cartTotalItems}
              formattedCartTotal={formatPrice(cartTotalAmount)}
              isLoadingBill={false}
              formattedBillTotal=""
              onButtonClick={handleCheckoutClick}
              buttonLabel={tr('cart.checkout', 'Checkout')}
              primaryColor={primaryColor}
            />
          );
        }

        return null;
      })()}
    </div>
  );
}

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        