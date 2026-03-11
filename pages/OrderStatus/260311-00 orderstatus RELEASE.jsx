// ======================================================
// pages/orderstatus.jsx — PUBLIC ORDER STATUS PAGE (GAP-02)
// Created: 2026-03-03, Session 71
// Purpose: Pickup/delivery guests track their order status
// Route: /orderstatus?token=<public_token>
// ======================================================

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { useI18n } from "@/components/i18n";

import {
  Check,
  Clock,
  Loader2,
  Package,
  Phone,
  RefreshCw,
  XCircle,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// ── Constants ──────────────────────────────────────────
const POLL_INTERVAL_MS = 10000;
const ORDER_MAX_AGE_HOURS = 24;
const TERMINAL_STATUSES = ["served", "completed", "cancelled"];
const SAFE_TEL_RE = /^tel:[+\d\s\-().]+$/;
const TOKEN_RE = /^[a-z0-9]{4,20}$/;

// ── Status pipeline for pickup/delivery ────────────────
const STATUS_STEPS = ["new", "in_progress", "ready"];

function getStepIndex(status) {
  if (status === "accepted") return 1; // same as in_progress
  const idx = STATUS_STEPS.indexOf(status);
  return idx >= 0 ? idx : 0;
}

function getStatusConfig(status, t) {
  const configs = {
    new: {
      label: t("order_status.status_new"),
      color: "text-blue-600",
      bg: "bg-blue-50",
      border: "border-blue-200",
      icon: Package,
    },
    accepted: {
      label: t("order_status.status_preparing"),
      color: "text-orange-600",
      bg: "bg-orange-50",
      border: "border-orange-200",
      icon: Clock,
    },
    in_progress: {
      label: t("order_status.status_preparing"),
      color: "text-orange-600",
      bg: "bg-orange-50",
      border: "border-orange-200",
      icon: Clock,
    },
    ready: {
      label: t("order_status.status_ready"),
      color: "text-green-600",
      bg: "bg-green-50",
      border: "border-green-200",
      icon: Check,
    },
    served: {
      label: t("order_status.status_served"),
      color: "text-slate-500",
      bg: "bg-slate-50",
      border: "border-slate-200",
      icon: Check,
    },
    completed: {
      label: t("order_status.status_served"),
      color: "text-slate-500",
      bg: "bg-slate-50",
      border: "border-slate-200",
      icon: Check,
    },
    cancelled: {
      label: t("order_status.status_cancelled"),
      color: "text-red-600",
      bg: "bg-red-50",
      border: "border-red-200",
      icon: XCircle,
    },
  };
  return configs[status] || configs.new;
}

// ── Progress Steps Component ───────────────────────────
function StatusProgress({ currentStatus, t }) {
  const currentIdx = getStepIndex(currentStatus);
  const isCancelled = currentStatus === "cancelled";
  const isTerminal = currentStatus === "served" || currentStatus === "completed" || currentStatus === "ready";

  const steps = [
    { key: "new", label: t("order_status.step_received") },
    { key: "in_progress", label: t("order_status.step_preparing") },
    { key: "ready", label: t("order_status.step_ready") },
  ];

  if (isCancelled) {
    return (
      <div className="flex items-center justify-center gap-2 py-4">
        <XCircle className="w-5 h-5 text-red-500" />
        <span className="text-red-600 font-medium">
          {t("order_status.status_cancelled")}
        </span>
      </div>
    );
  }

  return (
    <div className="py-4">
      <div className="flex items-center justify-between relative">
        {/* Connecting line */}
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
            <div
              key={step.key}
              className="flex flex-col items-center relative z-10"
            >
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
                  isComplete
                    ? "text-green-600 font-medium"
                    : isCurrent
                      ? "text-orange-600 font-medium"
                      : "text-slate-400"
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

// ── Main Page Component ────────────────────────────────
export default function OrderStatus() {
  const { t } = useI18n();
  const location = useLocation();
  const pollTimerRef = useRef(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [secondsAgo, setSecondsAgo] = useState(0);

  // Extract token from URL
  const token = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return params.get("token") || "";
  }, [location.search]);

  // ── Fetch order by public_token ─────────────────────
  const {
    data: orderData,
    isLoading: loadingOrder,
    error: orderError,
    refetch: refetchOrder,
  } = useQuery({
    queryKey: ["orderByToken", token],
    enabled: !!token && TOKEN_RE.test(token),
    retry: 1,
    queryFn: async () => {
      const orders = await base44.entities.Order.filter({
        public_token: token,
      });
      if (!orders || orders.length === 0) return null;
      return orders[0];
    },
  });

  const order = orderData || null;
  const partnerId = order?.partner;
  const orderId = order?.id;
  const orderStatus = order?.status || "new";
  const isTerminal = TERMINAL_STATUSES.includes(orderStatus);

  // Check if order is too old (>24h)
  const isExpired = useMemo(() => {
    if (!order?.created_date) return false;
    const created = new Date(order.created_date);
    const now = new Date();
    return now - created > ORDER_MAX_AGE_HOURS * 60 * 60 * 1000;
  }, [order?.created_date]);

  // ── Fetch partner ───────────────────────────────────
  const { data: partner } = useQuery({
    queryKey: ["statusPartner", partnerId],
    enabled: !!partnerId,
    retry: 1,
    queryFn: async () => {
      const partners = await base44.entities.Partner.filter({ id: partnerId });
      return partners?.[0] || null;
    },
  });

  // ── Fetch order items (once) ────────────────────────
  const { data: orderItems = [] } = useQuery({
    queryKey: ["statusOrderItems", orderId],
    enabled: !!orderId,
    retry: 1,
    staleTime: Infinity,
    queryFn: async () => {
      return await base44.entities.OrderItem.filter({ order: orderId });
    },
  });

  // ── Fetch partner contact links (for phone) ─────────
  const { data: contactLinks = [] } = useQuery({
    queryKey: ["statusContactLinks", partnerId],
    enabled: !!partnerId,
    retry: 1,
    staleTime: Infinity,
    queryFn: async () => {
      return await base44.entities.PartnerContactLink.filter({
        partner: partnerId,
      });
    },
  });

  // Find first phone contact (validated safe tel: URL)
  const phoneLink = useMemo(() => {
    return contactLinks.find(
      (link) =>
        link.is_active !== false &&
        typeof link.url === "string" &&
        SAFE_TEL_RE.test(link.url)
    );
  }, [contactLinks]);

  // ── Polling for status updates ──────────────────────
  useEffect(() => {
    if (!token || !order || isTerminal || isExpired) return;

    const poll = async () => {
      try {
        const result = await refetchOrder();
        if (result.data) {
          setLastUpdated(new Date());
        }
      } catch {
        // Silently retry on next poll
      }
    };

    pollTimerRef.current = setInterval(poll, POLL_INTERVAL_MS);

    return () => {
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
    };
  }, [token, order?.id, isTerminal, isExpired, refetchOrder]);

  // Set initial lastUpdated when order loads
  useEffect(() => {
    if (order && !lastUpdated) {
      setLastUpdated(new Date());
    }
  }, [order, lastUpdated]);

  // ── "seconds ago" counter ───────────────────────────
  useEffect(() => {
    if (!lastUpdated) return;

    const tick = () => {
      setSecondsAgo(Math.floor((Date.now() - lastUpdated.getTime()) / 1000));
    };

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [lastUpdated]);

  // ── Format price helper ─────────────────────────────
  const formatPrice = (amount) => {
    if (amount == null) return "";
    const currency = partner?.currency || "";
    const symbol = partner?.currency_symbol || currency;
    const num = Number(amount);
    if (isNaN(num)) return String(amount);
    const formatted = num.toLocaleString("ru-RU");
    return symbol ? `${formatted} ${symbol}` : formatted;
  };

  // ── Calculated total from items ─────────────────────
  const itemsTotal = useMemo(() => {
    return orderItems.reduce((sum, item) => {
      const lineTotal = item.line_total != null ? Number(item.line_total) : (Number(item.dish_price) * Number(item.quantity)) || 0;
      return sum + lineTotal;
    }, 0);
  }, [orderItems]);

  const displayTotal = order?.total_amount != null ? order.total_amount : itemsTotal;

  // ── Render: Loading ─────────────────────────────────
  if (!token || !TOKEN_RE.test(token)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <XCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-slate-800 mb-2">
              {t("order_status.no_token")}
            </h2>
            <p className="text-sm text-slate-500">
              {t("order_status.check_link")}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loadingOrder) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  if (orderError || !order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <XCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-slate-800 mb-2">
              {t("order_status.not_found")}
            </h2>
            <p className="text-sm text-slate-500">
              {t("order_status.check_link")}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isExpired) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <Clock className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-slate-800 mb-2">
              {t("order_status.expired")}
            </h2>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ── Render: Order Status Page ───────────────────────
  const statusConfig = getStatusConfig(orderStatus, t);
  const StatusIcon = statusConfig.icon;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-md mx-auto px-4 py-6">
        {/* Restaurant header */}
        <div className="flex items-center gap-3 mb-6">
          {partner?.logo && (
            <img
              src={partner.logo}
              alt=""
              referrerPolicy="no-referrer"
              className="w-10 h-10 rounded-lg object-cover"
            />
          )}
          <div>
            {partner?.name && (
              <h1 className="text-base font-semibold text-slate-800">
                {partner.name}
              </h1>
            )}
          </div>
        </div>

        {/* Order number + current status badge */}
        <Card className={`mb-4 border ${statusConfig.border}`}>
          <CardContent className="p-5">
            {order.order_number != null && (
              <>
                <p className="text-sm text-slate-500 mb-1">
                  {t("order_status.order_number")}
                </p>
                <p className="text-2xl font-bold text-slate-800 mb-4">
                  #{order.order_number}
                </p>
              </>
            )}

            {/* Status badge */}
            <div
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${statusConfig.bg} ${statusConfig.color}`}
            >
              <StatusIcon className="w-4 h-4" />
              {statusConfig.label}
            </div>

            {/* Progress steps */}
            <StatusProgress currentStatus={orderStatus} t={t} />

            {/* Last updated */}
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
              <p className="text-sm font-medium text-slate-600 mb-3">
                {t("order_status.your_order")}
              </p>

              <div className="space-y-2">
                {orderItems.map((item, idx) => (
                  <div
                    key={item.id || idx}
                    className="flex justify-between items-center text-sm"
                  >
                    <span className="text-slate-700">
                      {item.dish_name}{" "}
                      <span className="text-slate-400">x{item.quantity}</span>
                    </span>
                    <span className="text-slate-700 font-medium tabular-nums">
                      {formatPrice(item.line_total != null ? item.line_total : item.dish_price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t border-slate-200 pt-3 mt-3">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-slate-800">
                    {t("order_status.total")}
                  </span>
                  <span className="font-semibold text-slate-800 tabular-nums">
                    {formatPrice(displayTotal)}
                  </span>
                </div>
              </div>

              {/* Discount info */}
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
              <p className="text-sm text-slate-600 mb-3">
                {t("order_status.questions")}
              </p>
              <a
                href={phoneLink.url}
                className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors min-h-[44px]"
              >
                <Phone className="w-5 h-5 text-indigo-500" />
                <span className="text-sm font-medium text-indigo-600">
                  {phoneLink.url.replace("tel:", "")}
                </span>
              </a>
            </CardContent>
          </Card>
        )}

        {/* Manual refresh button (for terminal or as fallback) */}
        {isTerminal && (
          <div className="text-center pt-2">
            <p className="text-sm text-slate-500 mb-3">
              {orderStatus === "cancelled"
                ? t("order_status.order_cancelled_info")
                : t("order_status.order_complete_info")}
            </p>
          </div>
        )}

        {!isTerminal && (
          <div className="text-center pt-2">
            <Button
              variant="ghost"
              size="sm"
              aria-label={t("order_status.refresh")}
              className="text-slate-400 hover:text-slate-600 min-h-[44px]"
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
