// ======================================================
// pages/x.jsx — PUBLIC MENU with i18n + Channels Visibility + Gating
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
    // Migrate legacy format (plain array) — accept but rewrite with timestamp
    if (Array.isArray(data)) {
      try {
        localStorage.setItem(key, JSON.stringify({ items: data, ts: Date.now() }));
      } catch {}
      return data;
    }
    if (!data || !Array.isArray(data.items)) return null;
    // TTL check — require valid ts
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
  } catch { /* private browsing — ignore */ }
};

/**
 * Находит стартовый этап для заказа
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
// i18n FALLBACK MAP — prevents raw keys from showing to guests
// Chain: selected lang → EN fallback → RU fallback → empty string
// ============================================================
const I18N_FALLBACKS = {
  // Order statuses (OrderStatusBadge)
  "status.new": "Новый",
  "status.cooking": "Готовится",
  "status.ready": "Готов",
  "status.accepted": "Принят",
  "status.served": "Подан",
  // Order Status Screen
  "order_status.status_new": "Принят",
  "order_status.status_preparing": "Готовится",
  "order_status.status_ready": "Готов",
  "order_status.status_served": "Выполнен",
  "order_status.status_cancelled": "Отменён",
  "order_status.step_received": "Получен",
  "order_status.step_preparing": "Готовится",
  "order_status.step_ready": "Готов",
  "order_status.no_token": "Ссылка на заказ отсутствует",
  "order_status.check_link": "Проверьте ссылку и попробуйте снова",
  "order_status.back_to_menu": "Вернуться в меню",
  "order_status.not_found": "Заказ не найден",
  "order_status.expired": "Заказ устарел",
  "order_status.order_number": "Заказ",
  "order_status.last_updated": "Обновлено",
  "order_status.just_now": "только что",
  "order_status.seconds_ago": "{seconds} сек. назад",
  "order_status.your_order": "Ваш заказ",
  "order_status.total": "Итого",
  "order_status.discount": "Скидка",
  "order_status.questions": "Есть вопросы?",
  "order_status.order_cancelled_info": "Заказ отменён",
  "order_status.order_complete_info": "Спасибо! Ваш заказ выполнен",
  "order_status.refresh": "Обновить",
  // Mode labels
  "mode.hall": "В зале",
  "mode.pickup": "С собой",
  "mode.delivery": "Доставка",
  "mode.hall.desc": "Заказ в зале",
  "mode.pickup.desc": "Заберу с собой",
  "mode.delivery.desc": "Доставка по адресу",
  // Hall verification
  "hall.verify.title": "Чтобы официант получил заказ сразу",
  "hall.verify.subtitle": "Введите код со стола или назовите его официанту",
  "hall.verify.benefit": "После этого заказы будут приходить официанту напрямую",
  "hall.verify.online_benefits": "Бонусы и скидки за онлайн-заказы",
  // Errors
  "error.invalid_link": "Неверная ссылка",
  "error.save_failed": "Ошибка сохранения",
  "error.phone_invalid": "Неверный формат",
  "error.phone_short": "Слишком короткий номер",
  "error.phone_long": "Слишком длинный номер",
  "error.table_required": "Выберите стол",
  "error.name_required": "Введите имя",
  "error.phone_required": "Введите телефон",
  "error.address_required": "Введите адрес",
  "error.submit_failed": "Ошибка отправки",
  "error.session_expired": "Сессия истекла",
  "error.rate_limit": "Слишком много запросов, попробуйте позже",
  "error.partner_missing": "Ресторан не указан",
  "error.partner_hint": "Добавьте параметр",
  "error.partner_not_found": "Ресторан не найден",
  // Loyalty
  "loyalty.insufficient_points": "Недостаточно баллов",
  "loyalty.transaction.redeem": "Списание баллов",
  "loyalty.transaction.earn_order": "Начисление за заказ #{orderNumber}",
  // Cart / checkout
  "cart.checkout": "Оформить заказ",
  "cart.my_bill": "Мой счёт",
  "cart.table_orders": "Заказы стола",
  "cart.your_orders": "Ваши заказы",
  "cart.view": "Открыть",
  "cart.empty": "Корзина пуста",
  "cart.bill_already_requested": "Счёт уже запрошен",
  "cart.bill_requested": "Официант скоро принесёт счёт",
  "cart.title": "Корзина",
  "cart.your_order": "Ваш заказ",
  "cart.back_to_menu": "Назад к меню",
  "cart.total": "Итого",
  "cart.expected_savings": "Ожидаемая выгода",
  "cart.submitting": "Отправка...",
  "cta.sending": "Отправляем...",
  "cta.retry": "Повторить отправку",
  "error.send.title": "Не удалось отправить",
  "error.send.subtitle": "Попробуйте отправить ещё раз",
  "cart.item_added": "Добавлено",
  "cart.send_to_waiter": "Отправить официанту",
  "cart.send_order": "Отправить заказ",
  // Checkout form (CheckoutView)
  "checkout.currency_note": "Конвертация валюты",
  "form.name": "Имя",
  "form.required": "*",
  "form.phone": "Телефон",
  "form.phone_placeholder": "+7...",
  "form.address": "Адрес доставки",
  "form.comment": "Комментарий",
  "form.comment_placeholder": "Пожелания к заказу",
  // Menu (MenuView)
  "menu.add": "Добавить",
  "menu.remove": "Убрать",
  "menu.tile": "Плитка",
  "menu.list": "Список",
  "menu.no_items": "Нет блюд в этой категории",
  // Mode tabs
  "mode.coming_soon": "Скоро",
  // Confirmation screen
  "confirmation.title": "Заказ отправлен!",
  "confirmation.your_order": "Ваш заказ",
  "confirmation.total": "Итого",
  "confirmation.guest_label": "Гость",
  "confirmation.client_name": "Имя",
  "confirmation.back_to_menu": "Вернуться в меню",
  "confirmation.my_orders": "Мои заказы",
  "confirmation.track_order": "Отследить заказ",
  // Reviews & misc
  "review.thanks": "Спасибо за оценку!",
  "review.add_comments": "Добавить комментарии",
  "review.points": "баллов",
  "review.rate_others": "Оценить блюда гостей",
  "guest.name_saved": "Имя сохранено",
  "guest.name_placeholder": "Имя",
  "toast.error": "Ошибка",
  "common.loading": "Загрузка...",
  "common.close": "Закрыть",
  "common.info": "Информация",
  "common.of": "из",
  "common.or": "или",
  "common.save": "Сохранить",
  // CartView — cart details
  "cart.enter_table_code_hint": "Введите код стола чтобы отправить заказ",
  "cart.for_all": "На всех",
  "cart.guest": "Гость",
  "cart.new_order": "Новый заказ",
  "cart.no_orders_yet": "Заказов пока нет",
  "cart.only_me": "Только я",
  "cart.order_total": "Сумма заказа",
  "cart.split_disabled_hint": "(2+ гостей)",
  "cart.split_pick_guests_soon": "Выбрать гостей (скоро)",
  "cart.split_title": "Для кого заказ",
  "cart.table_total": "Счёт стола",
  "cart.tell_code_to_waiter": "Назовите официанту этот код",
  "cart.you": "Вы",
  // CartView — table verification
  "cart.verify.attempts": "Попытки",
  "cart.verify.bonus_label": "Бонусы за онлайн-заказ",
  "cart.verify.discount_label": "Скидка за онлайн-заказ",
  "cart.verify.enter_code_placeholder": "Введите код",
  "cart.verify.enter_table_code": "Введите код стола",
  "cart.verify.info_online_point1": "Заказ сразу попадает официанту",
  "cart.verify.info_online_point2": "Обычно быстрее",
  "cart.verify.info_online_point3": "Скидка и бонусы (если есть) применяются автоматически",
  "cart.verify.info_online_title": "Онлайн-заказ официанту",
  "cart.verify.info_table_code_point1": "Код обычно указан на столе",
  "cart.verify.info_table_code_point2": "Если не видно — спросите у официанта",
  "cart.verify.info_table_code_title": "Код стола",
  "cart.verify.locked": "Слишком много попыток. Повторите через",
  "cart.verify.online_order_title": "Онлайн-заказ официанту",
  "cart.verify.points_discount_label": "Списание баллов",
  "cart.verify.table_verified": "Стол подтверждён",
  // CartView — loyalty
  "loyalty.apply": "Применить",
  "loyalty.email_label": "Email для бонусов",
  "loyalty.email_placeholder": "email@example.com",
  "loyalty.email_saved": "Email сохранён! Бонусы будут начислены.",
  "loyalty.enter_email_for_bonus": "Введите email для начисления бонусов:",
  "loyalty.enter_email_hint": "Введите email для начисления бонусов",
  "loyalty.get_bonus": "Получить бонусы",
  "loyalty.new_customer": "Вы получите {points} бонусов за первый заказ",
  "loyalty.your_balance": "Ваш баланс: {points} баллов",
  "loyalty.max_redeem": "Максимум {max} баллов ({percent}% от заказа)",
  "loyalty.instant_discount": "Скидка {percent}% применена",
  "loyalty.enter_email_for_discount": "Введите email для скидки {percent}%",
  "loyalty.online_bonus_label": "Бонусы за онлайн-заказ",
  "loyalty.points_applied": "Баллы применены",
  "loyalty.points_short": "баллов",
  "loyalty.redeem_points": "Списать баллы",
  "loyalty.review_reward_hint": "За отзыв",
  "loyalty.review_reward_prefix": "за отзыв",
  "loyalty.thanks_for_rating": "Спасибо за оценку!",
  "loyalty.title": "Бонусы",
  // CartView — status (for getSafeStatus)
  "status.cancelled": "Отменён",
  // CartView — misc
  "help.call_waiter": "Позвать официанта",
  "help.active_requests": "Активные запросы",
  "help.sent_suffix": "отправлено",
  "help.undo": "Отменить",
  "help.cancel_request": "Больше не надо",
  "form.table": "Стол",
  // Mode-switch toast
  "cart.items_removed_mode_switch": "Убрано {count} блюд, недоступных в этом режиме",
  // Table confirmation Bottom Sheet (just-in-time)
  "cart.confirm_table.title": "Подтвердите стол",
  "cart.confirm_table.subtitle": "Чтобы отправить заказ официанту",
  "cart.confirm_table.benefit_loyalty": "По онлайн-заказу вы получите бонусы / скидку",
  "cart.confirm_table.benefit_default": "Так официант быстрее найдёт ваш заказ",
  "cart.confirm_table.submit": "Отправить",
  // Menu — dish actions (PM-102, PM-103)
  "menu.added_to_cart": "Добавлено в корзину",
  "menu.add_to_cart": "Добавить в корзину",
};

/**
 * Wraps raw t() to prevent raw i18n keys from reaching the UI.
 * Falls back to I18N_FALLBACKS map, supports {param} interpolation.
 */
function makeSafeT(rawT) {
  return (key, params) => {
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
      const icon = stage.internal_code === 'finish' ? '✅' : 
                   stage.internal_code === 'start' ? '🔵' : '🟠';
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
    new: { icon: '🔵', label: t('status.new'), bg: 'bg-blue-100', color: 'text-blue-700' },
    accepted: { icon: '🔵', label: t('status.accepted'), bg: 'bg-blue-100', color: 'text-blue-700' },
    in_progress: { icon: '🟠', label: t('status.cooking'), bg: 'bg-orange-100', color: 'text-orange-700' },
    ready: { icon: '✅', label: t('status.ready'), bg: 'bg-green-100', color: 'text-green-700' },
    served: { icon: '✅', label: t('status.served'), bg: 'bg-green-100', color: 'text-green-700' },
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
      {/* CSS-only animations — respects prefers-reduced-motion */}
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
        {tr("confirmation.title", "Заказ отправлен!")}
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
                {tr("confirmation.total", "Итого")}
              </span>
              <span className="font-semibold text-slate-800 tabular-nums">
                {formatPrice(parseFloat(Number(totalAmount).toFixed(2)))}
              </span>
            </div>
          </div>

          {/* Client name (pickup/delivery) */}
          {clientName && orderMode !== "hall" && (
            <p className="text-sm text-slate-500 mt-1">
              {tr("confirmation.client_name", "Имя")}: {clientName}
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
          {tr("confirmation.back_to_menu", "Вернуться в меню")}
        </Button>

        <Button
          variant="outline"
          className="w-full h-12"
          onClick={onOpenOrders}
        >
          {tr("confirmation.my_orders", "Мои заказы")}
        </Button>

        {/* Track order — pickup/delivery only (GAP-02: navigate to embedded status view) */}
        {orderMode !== "hall" && publicToken && (
          <Button
            variant="ghost"
            className="w-full h-12"
            style={{color: primaryColor}}
            onClick={() => {
              onTrackOrder(publicToken);
            }}
          >
            {tr("confirmation.track_order", "Отследить заказ")}
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
   Renders inside x.jsx as a view — no separate /orderstatus route.
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

  // "seconds ago" counter — stops when order is terminal (P0 fix)
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

  // Network/backend error — retryable (PM-074)
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
  const t = makeSafeT(rawT);

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

  // Mobile layout preference (tile | list) — S72: default list for mobile-first UX
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

      // Fallback lookup — let errors propagate to React Query (PM-070)
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
        // Default based on partner setting — S72: default list unless partner set 2-col grid
        const mobileGrid = Number(partner.menu_grid_mobile ?? 1);
        const defaultLayout = mobileGrid === 2 ? 'tile' : 'list';
        setMobileLayout(defaultLayout);
      }
    } catch (e) {
      // Failed to load mobile layout preference — silent in prod
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
      // Failed to save mobile layout preference — silent in prod
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

  // GAP-01: Show confirmation screen (no auto-dismiss — user navigates via buttons)
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
      /* silent — localStorage save is best-effort */
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

  // Table code config (for Bottom Sheet — PM-064)
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
  const HELP_COOLDOWN_SECONDS = useMemo(() => ({ call_waiter: 90, bill: 150, napkins: 240, menu: 240, other: 120 }), []);
  const HELP_CARD_LABELS = useMemo(() => ({
    call_waiter: t('help.call_waiter', 'Позвать официанта'),
    bill: t('help.bill', 'Принести счёт'),
    napkins: t('help.napkins', 'Салфетки'),
    menu: t('help.menu', 'Бумажное меню'),
    other: t('help.other_label', 'Другое'),
  }), [t]);
  const HELP_CHIPS = useMemo(() => ['Детский стул', 'Приборы', 'Соус', 'Убрать со стола', 'Вода'], []);

  const [requestStates, setRequestStates] = useState({});
  const hasLoadedHelpStatesRef = useRef(false); // HD-10: prevent save effect from wiping localStorage before load
  // HD-05: Load requestStates from localStorage on mount (restore badge + card state after refresh)
  useEffect(() => {
    if (!currentTableId) return;
    try {
      const key = `helpdrawer_${currentTableId}`;
      const stored = localStorage.getItem(key);
      if (!stored) { hasLoadedHelpStatesRef.current = true; return; }
      const parsed = JSON.parse(stored);
      const now = Date.now();
      const updated = {};
      for (const [type, state] of Object.entries(parsed)) {
        if (type === 'other' && Array.isArray(state)) {
          const validEntries = state.filter(entry => {
            if (!entry.sentAt) return false;
            const cooldownMs = (HELP_COOLDOWN_SECONDS['other'] || 120) * 1000;
            const elapsed = now - entry.sentAt;
            return elapsed < cooldownMs + 60000;
          }).map(entry => {
            const cooldownMs = (HELP_COOLDOWN_SECONDS['other'] || 120) * 1000;
            const elapsed = now - entry.sentAt;
            return elapsed >= cooldownMs ? { ...entry, status: 'repeat' } : { ...entry };
          });
          if (validEntries.length > 0) updated.other = validEntries;
          continue;
        }
        const cooldownMs = (HELP_COOLDOWN_SECONDS[type] || 120) * 1000;
        if ((state.status === 'pending' || state.status === 'repeat') && state.sentAt) {
          const elapsed = now - state.sentAt;
          if (elapsed < cooldownMs + 60000) {
            updated[type] = elapsed >= cooldownMs
              ? { ...state, status: 'repeat' }
              : { ...state };
          }
        }
      }
      if (Object.keys(updated).length > 0) {
        setRequestStates(updated);
      }
    } catch (e) { /* ignore corrupted storage */ }
    hasLoadedHelpStatesRef.current = true;
  }, [currentTableId, HELP_COOLDOWN_SECONDS]);
  // Structure: { call_waiter: { status: 'idle'|'sending'|'pending'|'repeat', sentAt, lastReminderAt, reminderCount, remindCooldownUntil, message? }, other: [...array of entries...] }
  const [undoToast, setUndoToast] = useState(null); // { type, expiresAt, timeoutId }
  const [showOtherForm, setShowOtherForm] = useState(false);
  const [timerTick, setTimerTick] = useState(0);
  const pendingQuickSendRef = useRef(null);
  const ticketBoardRef = useRef(null); // Fix 3: ref for scroll-to-ticket-board
  const [highlightedTicket, setHighlightedTicket] = useState(null); // Fix 3: amber highlight on re-tap
  const [isTicketExpanded, setIsTicketExpanded] = useState(false); // Fix 6: collapse toggle

  // HD-03: Relative time helper
  const getRelativeTime = useCallback((sentAtMs) => {
    const seconds = Math.floor((Date.now() - sentAtMs) / 1000);
    if (seconds < 60) return t('help.just_now', 'Только что');
    const mins = Math.floor(seconds / 60);
    if (seconds >= 600) return `${t('help.waiting', 'Ждёте')} ${mins} ${t('help.min_short', 'мин')}`;
    return `${mins} ${t('help.min_ago', 'мин назад')}`;
  }, [t, timerTick]);

  // Ticket board: active requests list (pending, sending, repeat) sorted by sentAt ascending
  const activeRequests = useMemo(() => {
    const list = [];
    for (const [type, state] of Object.entries(requestStates)) {
      if (type === 'other') {
        // other is an array of entries
        if (Array.isArray(state)) {
          state.forEach(entry => {
            if (entry.status === 'pending' || entry.status === 'sending' || entry.status === 'repeat') {
              list.push({ type: 'other', id: entry.id, ...entry });
            }
          });
        } else if (state && (state.status === 'pending' || state.status === 'sending' || state.status === 'repeat')) {
          // backward compat: single object
          list.push({ type: 'other', id: 'other-0', ...state });
        }
        continue;
      }
      if (state && (state.status === 'pending' || state.status === 'sending' || state.status === 'repeat')) {
        list.push({ type, id: type, ...state });
      }
    }
    return list.sort((a, b) => (a.sentAt || 0) - (b.sentAt || 0));
  }, [requestStates]);

  // HD-07: Active request count for badge (uses activeRequests)
  const activeRequestCount = useMemo(() => activeRequests.length, [activeRequests]);

  // PM-126/PM-125: Help drawer open/close with overlay stack integration
  // PM-133: Guard for null currentTableId — redirect to table code entry
  // PM-135: Reset all help drawer state before opening
  const openHelpDrawer = useCallback(() => {
    if (!currentTableId) {
      setShowTableConfirmSheet(true);
      return;
    }
    // HD-05: Load requestStates from localStorage on open
    try {
      const stored = JSON.parse(localStorage.getItem(`helpdrawer_${currentTableId}`) || '{}');
      const maxCooldownMs = 240 * 1000;
      const now = Date.now();
      const filtered = {};
      for (const [type, state] of Object.entries(stored)) {
        if (type === 'other' && Array.isArray(state)) {
          const validEntries = state.filter(e => e.sentAt && (now - e.sentAt) < maxCooldownMs).map(e => {
            const cooldownMs = (HELP_COOLDOWN_SECONDS['other'] || 120) * 1000;
            return { ...e, status: (now - e.sentAt) >= cooldownMs ? 'repeat' : e.status };
          });
          if (validEntries.length > 0) filtered.other = validEntries;
          continue;
        }
        if (state.sentAt && (now - state.sentAt) < maxCooldownMs) {
          const cooldownMs = (HELP_COOLDOWN_SECONDS[type] || 120) * 1000;
          filtered[type] = {
            ...state,
            status: (now - state.sentAt) >= cooldownMs ? 'repeat' : state.status
          };
        }
      }
      if (Object.keys(filtered).length > 0) setRequestStates(filtered);
      else setRequestStates({});
    } catch (e) { setRequestStates({}); }
    setShowOtherForm(false);
    setHelpComment('');
    setUndoToast(null);
    setIsHelpModalOpen(true);
    pushOverlay('help');
  }, [pushOverlay, currentTableId, setShowTableConfirmSheet, setHelpComment, HELP_COOLDOWN_SECONDS]);

  // HD-01: closeHelpDrawer resets UI state, keeps requestStates (persisted in localStorage)
  const closeHelpDrawer = useCallback(() => {
    popOverlay('help');
    setIsHelpModalOpen(false);
    setShowOtherForm(false);
    setHelpComment('');
    // Clean up any pending undo timeout
    if (undoToast?.timeoutId) clearTimeout(undoToast.timeoutId);
    setUndoToast(null);
  }, [popOverlay, setHelpComment, undoToast]);

  // HD-01 + HD-06: Card tap with 5s undo delay before actual server send
  const handleCardTap = useCallback((type) => {
    // Cancel previous undo if any
    if (undoToast?.timeoutId) clearTimeout(undoToast.timeoutId);

    // Set card to sending visually immediately
    setRequestStates(prev => ({ ...prev, [type]: { status: 'sending', sentAt: Date.now(), lastReminderAt: null, reminderCount: 0, remindCooldownUntil: null } }));

    // Schedule actual send after 5s (undo window)
    const timeoutId = setTimeout(() => {
      // Actually send to server via existing hook chain
      pendingQuickSendRef.current = type;
      handlePresetSelect(type);
      setUndoToast(null);
    }, 5000);

    setUndoToast({ type, expiresAt: Date.now() + 5000, timeoutId });
  }, [handlePresetSelect, undoToast]);

  // HD-06: Undo handler — cancel pending send, return card to idle
  const handleUndo = useCallback(() => {
    if (!undoToast) return;
    clearTimeout(undoToast.timeoutId);
    setRequestStates(prev => {
      if (undoToast.type === 'other' && undoToast.otherId && Array.isArray(prev.other)) {
        const otherArr = prev.other.filter(e => e.id !== undoToast.otherId);
        return { ...prev, other: otherArr.length > 0 ? otherArr : [] };
      }
      const next = { ...prev };
      delete next[undoToast.type];
      return next;
    });
    setUndoToast(null);
  }, [undoToast]);

  // Fix 4A: handleRemind — send reminder without undo, update cooldown
  const REMIND_COOLDOWN_MS = 40000; // 40 seconds
  const handleRemind = useCallback((type, otherId) => {
    const now = Date.now();
    setRequestStates(prev => {
      if (type === 'other' && otherId && Array.isArray(prev.other)) {
        const otherArr = prev.other.map(e => e.id === otherId ? {
          ...e, lastReminderAt: now, reminderCount: (e.reminderCount || 0) + 1, remindCooldownUntil: now + REMIND_COOLDOWN_MS
        } : e);
        return { ...prev, other: otherArr };
      }
      const current = prev[type];
      if (!current) return prev;
      return { ...prev, [type]: { ...current, lastReminderAt: now, reminderCount: (current.reminderCount || 0) + 1, remindCooldownUntil: now + REMIND_COOLDOWN_MS } };
    });
    // Send reminder immediately (no undo)
    pendingQuickSendRef.current = type;
    handlePresetSelect(type);
    toast({ description: t('help.reminder_sent', 'Напоминание отправлено'), duration: 2000 });
  }, [handlePresetSelect, t, toast]);

  // Fix 3: Handle resolve (mark request as done by guest)
  const handleResolve = useCallback((type, otherId) => {
    setRequestStates(prev => {
      if (type === 'other' && otherId && Array.isArray(prev.other)) {
        const otherArr = prev.other.filter(e => e.id !== otherId);
        return { ...prev, other: otherArr.length > 0 ? otherArr : [] };
      }
      const next = { ...prev };
      delete next[type];
      return next;
    });
  }, []);

  // HD-01: Auto-submit when selectedHelpType matches pending quick send
  useEffect(() => {
    if (pendingQuickSendRef.current && selectedHelpType === pendingQuickSendRef.current) {
      const type = pendingQuickSendRef.current;
      pendingQuickSendRef.current = null;
      const result = submitHelpRequest();
      const onSuccess = () => {
        setRequestStates(prev => {
          if (type === 'other' && Array.isArray(prev.other)) {
            // Mark the latest sending entry as pending
            const otherArr = prev.other.map(e => e.status === 'sending' ? { ...e, status: 'pending' } : e);
            return { ...prev, other: otherArr };
          }
          return { ...prev, [type]: { ...prev[type], status: 'pending', sentAt: prev[type]?.sentAt || Date.now(), lastReminderAt: prev[type]?.lastReminderAt || null, reminderCount: prev[type]?.reminderCount || 0, remindCooldownUntil: prev[type]?.remindCooldownUntil || null } };
        });
      };
      const onError = () => {
        setRequestStates(prev => {
          if (type === 'other' && Array.isArray(prev.other)) {
            // Remove sending entries on error
            const otherArr = prev.other.filter(e => e.status !== 'sending');
            return { ...prev, other: otherArr.length > 0 ? otherArr : [] };
          }
          const next = { ...prev };
          delete next[type];
          return next;
        });
      };
      if (result && typeof result.then === 'function') {
        result.then(onSuccess).catch(onError);
      } else {
        onSuccess();
      }
    }
  }, [selectedHelpType, submitHelpRequest]);

  // HD-02 + HD-03: Timer interval — update timers + check cooldown transitions + remind countdown
  const hasAnyRemindCooldown = useMemo(() => {
    const now = Date.now();
    for (const [type, state] of Object.entries(requestStates)) {
      if (type === 'other' && Array.isArray(state)) {
        if (state.some(e => e.remindCooldownUntil && e.remindCooldownUntil > now)) return true;
        continue;
      }
      if (state?.remindCooldownUntil && state.remindCooldownUntil > now) return true;
    }
    return false;
  }, [requestStates, timerTick]);

  useEffect(() => {
    const hasActive = activeRequests.length > 0;
    if (!hasActive && !undoToast && !hasAnyRemindCooldown) return;
    const interval = setInterval(() => {
      setTimerTick(t => t + 1);
      // HD-02: Check cooldown transitions pending → repeat
      setRequestStates(prev => {
        const now = Date.now();
        let changed = false;
        const next = { ...prev };
        for (const [type, state] of Object.entries(next)) {
          if (type === 'other' && Array.isArray(state)) {
            const updatedOther = state.map(entry => {
              if (entry.status === 'pending' && entry.sentAt) {
                const cooldownMs = (HELP_COOLDOWN_SECONDS['other'] || 120) * 1000;
                if ((now - entry.sentAt) >= cooldownMs) {
                  changed = true;
                  return { ...entry, status: 'repeat' };
                }
              }
              return entry;
            });
            if (changed) next.other = updatedOther;
            continue;
          }
          if (state && state.status === 'pending' && state.sentAt) {
            const cooldownMs = (HELP_COOLDOWN_SECONDS[type] || 120) * 1000;
            if ((now - state.sentAt) >= cooldownMs) {
              next[type] = { ...state, status: 'repeat' };
              changed = true;
            }
          }
        }
        return changed ? next : prev;
      });
    }, (undoToast || hasAnyRemindCooldown) ? 1000 : 30000);
    return () => clearInterval(interval);
  }, [requestStates, undoToast, HELP_COOLDOWN_SECONDS, hasAnyRemindCooldown, activeRequests.length]);

  // HD-03: Recalculate on visibility change (tab return)
  useEffect(() => {
    const handler = () => { if (!document.hidden) setTimerTick(t => t + 1); };
    document.addEventListener('visibilitychange', handler);
    return () => document.removeEventListener('visibilitychange', handler);
  }, []);

  // HD-05: Persist requestStates to localStorage on change
  useEffect(() => {
    if (!currentTableId || !hasLoadedHelpStatesRef.current) return; // HD-10: skip until load completes
    const key = `helpdrawer_${currentTableId}`;
    const persistable = {};
    for (const [type, state] of Object.entries(requestStates)) {
      if (type === 'other' && Array.isArray(state)) {
        const activeOthers = state.filter(e => e.status === 'pending' || e.status === 'repeat');
        if (activeOthers.length > 0) persistable.other = activeOthers;
        continue;
      }
      if (state && (state.status === 'pending' || state.status === 'repeat')) {
        persistable[type] = state;
      }
    }
    if (Object.keys(persistable).length === 0) {
      localStorage.removeItem(key);
    } else {
      localStorage.setItem(key, JSON.stringify(persistable));
    }
  }, [requestStates, currentTableId]);

  // PM-125: Cart-to-help sequencing — close cart first, 300ms delay, then open help
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
      // Dish limit reached (100) — silent in prod
    }
    if (allCategories?.length === 100) {
      // Category limit reached (100) — silent in prod
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
        // Failed to fetch category translations — silent in prod
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
        // Failed to fetch dish translations — silent in prod
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
  // TASK-260201-01: StickyBar виден ВСЕГДА при верифицированном столе
  // Это решает проблему F5 — не нужно ждать восстановления session/orders
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

  // PM-128: Deferred pushOverlay for table confirm drawer — avoids disrupting vaul animation
  useEffect(() => {
    if (showTableConfirmSheet) {
      const id = setTimeout(() => pushOverlay('tableConfirm'), 50);
      return () => clearTimeout(id);
    }
  }, [showTableConfirmSheet, pushOverlay]);

  // Hall StickyBar mode: определяем что показывать
  const hallStickyMode =
    (cart?.length || 0) > 0
      ? "cart"
      : (myOrders?.length || 0) > 0
        ? "myBill"
        : (sessionOrders?.length || 0) > 0
          ? "tableOrders"
          : "cartEmpty";

  // Hall StickyBar label: текст кнопки
  const hallStickyButtonLabel =
    hallStickyMode === "cart"
      ? tr("cart.checkout", "Оформить заказ")
      : hallStickyMode === "myBill"
        ? tr("cart.my_bill", "Мой счёт")
        : hallStickyMode === "tableOrders"
          ? tr("cart.table_orders", "Заказы стола")
          : isSessionLoading
            ? tr("common.loading", "Загрузка...")
            : tr("cart.view", "Открыть");

  // Hall StickyBar: заголовок (для режимов без корзины)
  const hallStickyModeLabel =
    hallStickyMode === "myBill"
      ? tr("cart.my_bill", "Мой счёт")
      : hallStickyMode === "tableOrders"
        ? tr("cart.table_orders", "Заказы стола")
        : tr("cart.your_orders", "Ваши заказы");

  // Hall StickyBar: сумма для показа
  const hallStickyBillTotal =
    hallStickyMode === "myBill"
      ? formatPrice(parseFloat((myBill.total || 0).toFixed(2)))
      : hallStickyMode === "tableOrders"
        ? formatPrice(parseFloat((tableTotal || 0).toFixed(2)))
        : "";

  // Hall StickyBar: показывать ли сумму
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

    // FIX P1: Revalidate cart on mode change — drop items not available in new mode
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

  // PM-152: Clear guest name when table changes — localStorage-based (survives Chrome kill)
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
      // PM-107: If popOverlay triggered this back, skip — sheet already closed
      if (isProgrammaticCloseRef.current) {
        isProgrammaticCloseRef.current = false;
        return;
      }
      const stack = overlayStackRef.current;
      if (stack.length === 0) return; // No overlay open — let browser handle normally

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

      // FIX P0: Create order items FIRST — commit point before loyalty side effects
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

      // Post-create side effects — best-effort after items exist
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

      // Earn points after order creation — best-effort
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

      // Update partner counters — best-effort
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
      toast.error(tr('cart.empty', 'Корзина пуста'), { id: 'mm1' });
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
          // Session expired — close it in DB and force new one
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

        // P0-2: Hard guard — reject order if no valid session
        if (!session?.id) {
          toast.error(t('error.session_expired'), { id: 'session-err' });
          submitLockRef.current = false;
          setIsSubmitting(false);
          return;
        }

        // ============================================================
        // FIX-260131-07 FINAL: SAFEGUARD — try restore guest before creating new
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

            // If restored → sync state + storage
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

        // If still no guest after safeguard — create new
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

        // FIX P0: Create order items FIRST — commit point before loyalty side effects
        const orderItemsData = cart.map((item) => ({
          order: order.id,
          dish: item.dishId,
          dish_name: item.name,
          dish_price: item.price,
          quantity: item.quantity,
          line_total: Math.round(item.price * item.quantity * 100) / 100,
        }));

        await base44.entities.OrderItem.bulkCreate(orderItemsData);

        // Post-create side effects — best-effort after items exist
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

        // Earn points after order creation — best-effort
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
      toast.info(tr('cart.bill_already_requested', 'Счёт уже запрошен'), { id: 'mm1' });
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
      toast.success(tr('cart.bill_requested', 'Официант скоро принесёт счёт'), { id: 'mm1' });
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
  // HALL CHECKOUT SCREEN (TASK-260127-01: removed "Стол подтверждён" block)
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
              toast(tr('cart.confirm_table.dismissed', 'Для отправки заказа нужно подтвердить стол'), { id: 'table-dismiss' });
            }
          }
        }}
      >
        <DrawerContent className="max-h-[85dvh] rounded-t-3xl z-[60]">
          <div className="relative">
            {/* #143: Chevron close button — top-right */}
            <button
              onClick={() => { popOverlay('tableConfirm'); pendingSubmitRef.current = false; setShowTableConfirmSheet(false); }}
              className="absolute top-3 right-3 w-11 h-11 flex items-center justify-center rounded-full bg-gray-200 text-gray-500 z-10"
              aria-label={t('common.close', 'Закрыть')}
            >
              <ChevronDown className="w-6 h-6" />
            </button>
            <DrawerHeader className="text-center pb-2">

              <DrawerTitle className="text-lg font-semibold text-slate-900">
                {tr('cart.verify.enter_table_code', 'Введите код стола')}
              </DrawerTitle>
              <p className="text-xs text-gray-400 mt-2 px-4">
                {tr('cart.verify.helper_text', 'Код указан на табличке вашего стола. Он нужен, чтобы официант знал куда нести заказ.')}
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
                aria-label={tr('cart.verify.enter_table_code', 'Введите код стола')}
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
                  {tr('cart.motivation_bonus_short', `+${motivationPoints} бонусов за этот заказ`)}
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
                : tr('cart.confirm_table.submit', 'Отправить')}
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
            <button
              onClick={closeHelpDrawer}
              className="absolute top-3 right-3 w-11 h-11 flex items-center justify-center rounded-full bg-gray-200 text-gray-500 z-10"
              aria-label={t('common.close', 'Закрыть')}
            >
              <ChevronDown className="w-6 h-6" />
            </button>
            <DrawerHeader className="text-center pb-2">
              <DrawerTitle className="text-lg font-semibold text-slate-900">{t('help.modal_title', 'Нужна помощь?')}</DrawerTitle>
              <p className="text-sm text-slate-500 mt-1">{t('help.modal_desc', 'Выберите, чем мы можем помочь')}</p>
            </DrawerHeader>
          </div>
          <div className="px-4 pb-6 space-y-4 overflow-y-auto flex-1">
            {currentTable && (
              <div className="flex items-center justify-center gap-2 text-sm text-slate-600">
                <MapPin className="w-4 h-4" />
                <span>{currentTable?.name || currentTable?.code}</span>
              </div>
            )}
            {/* Ticket board: "Мои запросы" section (Fix 1E + Fix 5 + Fix 6) */}
            {activeRequests.length > 0 && (
              <div ref={ticketBoardRef} className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-gray-700">{t('help.my_requests', 'Мои запросы')}</span>
                  <span className="text-xs text-gray-400">{activeRequests.length} {t('help.active_count', 'активных')}</span>
                </div>
                {/* Ticket rows — sorted by sentAt asc, collapse at 4+ */}
                {(() => {
                  const showAll = activeRequests.length <= 3 || isTicketExpanded;
                  const visibleRequests = showAll ? activeRequests : activeRequests.slice(0, 2);
                  return (
                    <>
                      {visibleRequests.map(req => {
                        const isHighlighted = highlightedTicket === req.id;
                        const cooldownActive = req.remindCooldownUntil && req.remindCooldownUntil > Date.now();
                        const cooldownSec = cooldownActive ? Math.ceil((req.remindCooldownUntil - Date.now()) / 1000) : 0;
                        const cooldownMin = Math.floor(cooldownSec / 60);
                        const cooldownSecRem = cooldownSec % 60;
                        return (
                          <div
                            key={req.id}
                            className={`rounded-lg border p-3 mb-2 transition-colors duration-300 ${isHighlighted ? 'bg-amber-50 border-amber-300' : 'bg-white border-slate-200'}`}
                          >
                            {/* Row title */}
                            <div className="text-sm font-medium text-slate-800 mb-0.5">
                              {HELP_CARD_LABELS[req.type] || req.type}
                              {req.message ? ` — "${req.message.slice(0, 30)}${req.message.length > 30 ? '...' : ''}"` : ''}
                            </div>
                            {/* Timestamp */}
                            <div className="text-xs text-slate-500 mb-2">
                              {getRelativeTime(req.sentAt)}
                              {req.reminderCount > 0 && (
                                <span className="ml-1">· {req.reminderCount} {tr('help.reminders', 'напоминаний')}</span>
                              )}
                            </div>
                            {/* Action buttons — full width, side by side */}
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleRemind(req.type, req.type === 'other' ? req.id : undefined)}
                                disabled={cooldownActive}
                                className={`flex-1 text-xs font-medium py-2 min-h-[36px] rounded-lg ${cooldownActive ? 'text-slate-400 bg-slate-100' : 'text-orange-800 bg-orange-50 active:bg-orange-100'}`}
                              >
                                {cooldownActive
                                  ? `${tr('help.retry_in', 'Через')} ${String(cooldownMin).padStart(2,'0')}:${String(cooldownSecRem).padStart(2,'0')}`
                                  : tr('help.remind', 'Напомнить')}
                              </button>
                              <button
                                onClick={() => handleResolve(req.type, req.type === 'other' ? req.id : undefined)}
                                className="flex-1 text-xs font-medium py-2 min-h-[36px] rounded-lg text-slate-500 bg-slate-100 active:bg-slate-200"
                              >
                                {tr('help.resolved', 'Не нужно')}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                      {/* Fix 6A: Collapse toggle */}
                      {activeRequests.length >= 4 && !isTicketExpanded && (
                        <button
                          onClick={() => setIsTicketExpanded(true)}
                          className="w-full text-center text-xs text-blue-500 py-2 min-h-[36px]"
                        >
                          {t('help.show_more', 'Ещё')} {activeRequests.length - 2} {t('help.requests', 'запросов')}
                        </button>
                      )}
                      {activeRequests.length >= 4 && isTicketExpanded && (
                        <button
                          onClick={() => setIsTicketExpanded(false)}
                          className="w-full text-center text-xs text-blue-500 py-2 min-h-[36px]"
                        >
                          {t('help.show_less', 'Свернуть')}
                        </button>
                      )}
                    </>
                  );
                })()}
                {/* Fix 5: Anxiety copy */}
                <p className="text-xs text-gray-400 mt-1 text-center">{t('help.status_auto_update', 'Статус обновляется автоматически')}</p>
              </div>
            )}
            {/* Fix 1F: Conditional "Отправить ещё" header */}
            {activeRequests.length > 0 && (
              <span className="text-sm font-semibold text-gray-700">{t('help.send_more', 'Отправить ещё')}</span>
            )}
            {/* HD-01: Per-card state help cards — always idle (Fix 1C/1D) */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { id: 'call_waiter', emoji: '\uD83D\uDE4B', label: t('help.call_waiter', 'Позвать официанта') },
                { id: 'bill', emoji: '\uD83E\uDDFE', label: t('help.bill', 'Принести счёт') },
                { id: 'napkins', emoji: null, label: t('help.napkins', 'Салфетки') },
                { id: 'menu', emoji: '\uD83D\uDCC4', label: t('help.menu', 'Бумажное меню') },
              ].map(card => {
                const st = requestStates[card.id];
                const status = st?.status || 'idle';
                return (
                  <button
                    key={card.id}
                    onClick={() => {
                      // Fix 3: Smart redirect — if active, scroll to ticket board
                      if (status !== 'idle') {
                        ticketBoardRef.current?.scrollIntoView({ behavior: 'smooth' });
                        setHighlightedTicket(card.id);
                        setTimeout(() => setHighlightedTicket(null), 1500);
                        toast({ description: t('help.already_sent', 'Запрос уже отправлен — смотри выше'), duration: 2000 });
                        return;
                      }
                      handleCardTap(card.id);
                    }}
                    className="relative rounded-xl border min-h-[80px] flex flex-col items-center justify-center gap-1 bg-white border-slate-200 active:border-blue-400 active:bg-blue-50"
                  >
                    {card.id === 'napkins' ? (
                      <Layers className="w-6 h-6 text-slate-500" />
                    ) : (
                      <span className="text-2xl">{card.emoji}</span>
                    )}
                    <span className="text-sm font-medium text-slate-700 text-center px-1">
                      {card.label}
                    </span>
                  </button>
                );
              })}
              {/* "Другое" card — always idle (Fix 1D), always toggles form */}
              <button
                onClick={() => setShowOtherForm(prev => !prev)}
                className="relative col-span-2 rounded-xl border min-h-[48px] flex flex-row items-center justify-center gap-2 bg-white border-slate-200 active:border-blue-400 active:bg-blue-50"
              >
                <span className="text-xl">{'\u270F\uFE0F'}</span>
                <span className="text-sm font-medium text-slate-700">
                  {t('help.other', 'Другое')}
                </span>
              </button>
            </div>
            {/* HD-04: "Другое" expanded form with chips + textarea */}
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
                  placeholder={t('help.comment_placeholder_other', 'Например: детский стул, приборы, убрать со стола')}
                  className="w-full rounded-lg border border-slate-200 p-3 text-sm min-h-[80px] resize-none focus:outline-none focus:ring-2 focus:ring-blue-200"
                />
                <div className="text-right text-xs text-slate-400">{helpComment.length} / 100</div>
              </div>
            )}
            {/* HD-06: Undo toast */}
            {undoToast && (
              <div className="rounded-lg bg-slate-800 text-white px-4 py-3 flex items-center justify-between text-sm">
                <span>{HELP_CARD_LABELS[undoToast.type] || undoToast.type} {t('help.sent_suffix', 'отправлено')}</span>
                <button onClick={handleUndo} className="text-amber-300 font-medium ml-2 min-h-[44px] min-w-[44px] flex items-center justify-center">
                  {t('help.undo', 'Отменить')} ({Math.max(0, Math.ceil((undoToast.expiresAt - Date.now()) / 1000))})
                </button>
              </div>
            )}
            {helpSubmitError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">{helpSubmitError}</div>
            )}
          </div>
          {/* HD-04: Sticky submit area for "Другое" form — dual buttons */}
          {showOtherForm && (
            <div className="px-4 pb-4 pt-2 border-t border-slate-100 flex gap-3">
              <Button
                variant="outline"
                className="flex-1 min-h-[44px]"
                onClick={() => { setShowOtherForm(false); setHelpComment(''); }}
              >
                {t('common.cancel', 'Отмена')}
              </Button>
              <Button
                className="flex-1 min-h-[44px] text-white"
                style={{ backgroundColor: primaryColor }}
                onClick={() => {
                  if (!helpComment.trim()) return;
                  const msg = helpComment.trim();
                  // Use undo flow: set sending + schedule actual send
                  if (undoToast?.timeoutId) clearTimeout(undoToast.timeoutId);
                  const entryId = Date.now().toString();
                  setRequestStates(prev => {
                    const otherArr = Array.isArray(prev.other) ? prev.other : (prev.other ? [prev.other] : []);
                    return { ...prev, other: [...otherArr, { id: entryId, status: 'sending', sentAt: Date.now(), lastReminderAt: null, reminderCount: 0, remindCooldownUntil: null, message: msg }] };
                  });
                  const timeoutId = setTimeout(() => {
                    pendingQuickSendRef.current = 'other';
                    handlePresetSelect('other');
                    setUndoToast(null);
                  }, 5000);
                  setUndoToast({ type: 'other', otherId: entryId, expiresAt: Date.now() + 5000, timeoutId });
                  setShowOtherForm(false);
                  setHelpComment('');
                }}
                disabled={!helpComment.trim()}
              >
                {t('help.submit_arrow', 'Отправить')}
              </Button>
            </div>
          )}
          {/* cardActionModal removed — replaced by ticket board + smart redirect (Fix 1B) */}
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
                  aria-label={t('common.close', 'Закрыть')}
                >
                  <ChevronDown className="w-6 h-6" />
                </button>
              </div>
              {/* Scrollable content: PM-123 order: Title → Description → Price+Discount → Rating */}
              <div className="overflow-y-auto flex-1 p-4 space-y-3">
                <h2 className="text-lg font-bold text-slate-900">
                  {getDishName(detailDish)}
                </h2>
                {getDishDescription(detailDish) && (
                  <p className="text-sm text-slate-500">
                    {getDishDescription(detailDish)}
                  </p>
                )}
                {/* PM-118: Discount display — partner-level pattern (matches MenuView.jsx) */}
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
                  {t('menu.add_to_cart', 'Добавить в корзину')}
                </Button>
              </div>
            </div>
          )}
        </DrawerContent>
      </Drawer>

      {/* PM-156: Floating bell removed — bell accessible via CartView header + help drawer */}

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
              buttonLabel={tr('cart.checkout', 'Оформить заказ')}
              primaryColor={primaryColor}
            />
          );
        }

        return null;
      })()}
    </div>
  );
}                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          