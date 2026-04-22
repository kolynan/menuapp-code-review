import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import {
  ArrowRight,
  AlertTriangle,
  Utensils,
  Package,
  Truck,
  LayoutGrid,
  CheckCircle2,
  Circle,
  Users,
  Settings,
  ExternalLink,
} from "lucide-react";
import PartnerShell, { usePartnerAccess } from "@/components/PartnerShell";
import { useI18n } from "@/components/i18n";

/* =======================
   CONSTANTS
   ======================= */

const PROGRESS_WIDTH_CLASS = {
  0: "w-0",
  1: "w-1/4",
  2: "w-2/4",
  3: "w-3/4",
  4: "w-full",
};

const STEP_CARD_CLASS = {
  done: "bg-emerald-50 border-emerald-200",
  pending: "bg-slate-50 border-slate-200",
};

const STEP_ICON_CLASS = {
  done: "text-emerald-600",
  pending: "text-slate-400",
};

const STEP_TITLE_CLASS = {
  done: "text-emerald-800 line-through",
  pending: "text-slate-900",
};

/* =======================
   HELPERS
   ======================= */

function getTodayStart() {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return now;
}

function formatMoney(amount) {
  const num = Number(amount) || 0;
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M ₸`;
  }
  if (num >= 1000) {
    return `${Math.round(num / 1000)}K ₸`;
  }
  return `${num} ₸`;
}

function getTablesText(count, t) {
  if (count === 0) return t("partnerhome.no_open_tables");
  return t("partnerhome.tables_open", { count });
}

/* =======================
   ONBOARDING CHECKLIST
   ======================= */

function OnboardingChecklist({
  partner,
  dishes,
  tables,
  staff,
  partnerId,
  navigate,
  t,
}) {
  const steps = useMemo(() => {
    const hasMenu = (dishes || []).length > 0;
    const hasTables = (tables || []).length > 0;
    const hasChannels =
      !!partner?.channels_hall_enabled ||
      !!partner?.channels_pickup_enabled ||
      !!partner?.channels_delivery_enabled;
    const hasStaff = (staff || []).length > 0;

    return [
      {
        key: "step1",
        done: hasMenu,
        icon: Utensils,
        title: t("partnerhome.onboarding.step1.title"),
        desc: t("partnerhome.onboarding.step1.desc"),
        ctaText: t("partnerhome.onboarding.step1.cta_primary"),
        ctaAction: () => navigate("/menumanage"),
      },
      {
        key: "step2",
        done: hasTables,
        icon: LayoutGrid,
        title: t("partnerhome.onboarding.step2.title"),
        desc: t("partnerhome.onboarding.step2.desc"),
        ctaText: t("partnerhome.onboarding.step2.cta_primary"),
        ctaAction: () => navigate("/partnertables"),
        secondaryText: hasTables
          ? t("partnerhome.onboarding.step2.cta_download_qr_pdf")
          : null,
        secondaryAction: hasTables ? () => navigate("/partnertables") : null,
      },
      {
        key: "step3",
        done: hasChannels,
        icon: Settings,
        title: t("partnerhome.onboarding.step3.title"),
        desc: t("partnerhome.onboarding.step3.desc"),
        ctaText: t("partnerhome.onboarding.step3.cta_primary"),
        ctaAction: () => navigate("/partnersettings"),
        micro: t("partnerhome.onboarding.step3.micro_later"),
      },
      {
        key: "step4",
        done: hasStaff,
        icon: Users,
        title: t("partnerhome.onboarding.step4.title"),
        desc: t("partnerhome.onboarding.step4.desc"),
        ctaText: t("partnerhome.onboarding.step4.cta_primary"),
        ctaAction: () => navigate("/partnerstaffaccess"),
        secondaryText: t("partnerhome.onboarding.step4.link_copy_invite"),
        secondaryAction: async () => {
          const url = `${window.location.origin}/partnerstaffaccess?partner=${encodeURIComponent(partnerId)}`;
          try {
            if (navigator.clipboard && navigator.clipboard.writeText) {
              await navigator.clipboard.writeText(url);
            }
          } catch (_) {
            /* clipboard unavailable */
          }
        },
      },
    ];
  }, [dishes, tables, staff, partner, partnerId, navigate, t]);

  const doneCount = steps.filter((s) => s.done).length;
  const totalSteps = steps.length;
  const allDone = doneCount === totalSteps;

  /* Completion state */
  if (allDone) {
    return (
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 text-center">
        <div className="text-lg font-semibold text-emerald-800 mb-3">
          {t("partnerhome.onboarding.completed.title")}
        </div>
        <button
          onClick={() => navigate("/partnertables")}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors min-h-[44px]"
        >
          {t("partnerhome.onboarding.completed.cta_download_qr_pdf")}
        </button>
      </div>
    );
  }

  /* Checklist */
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5">
      {/* Header */}
      <div className="mb-4">
        <div className="text-lg font-semibold text-slate-900">
          {t("partnerhome.onboarding.block_title")}
        </div>
        <div className="text-sm text-slate-500 mt-0.5">
          {t("partnerhome.onboarding.block_subtitle")}
        </div>
        {/* Progress bar */}
        <div className="mt-2 flex items-center gap-2">
          <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full bg-indigo-500 rounded-full transition-all ${PROGRESS_WIDTH_CLASS[doneCount] || "w-0"}`}
            />
          </div>
          <span className="text-xs font-medium text-slate-500 whitespace-nowrap">
            {t("partnerhome.onboarding.progress_label", {
              done: doneCount,
              total: totalSteps,
            })}
          </span>
        </div>
      </div>

      {/* Steps */}
      <div className="space-y-3">
        {steps.map((step) => {
          const StepIcon = step.icon;
          return (
            <div
              key={step.key}
              className={`flex gap-3 p-3 rounded-lg border ${STEP_CARD_CLASS[step.done ? "done" : "pending"]}`}
            >
              {/* Status indicator */}
              <div className="flex-shrink-0 mt-0.5">
                {step.done ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                ) : (
                  <Circle className="w-5 h-5 text-slate-300" />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <StepIcon
                    className={`w-4 h-4 ${STEP_ICON_CLASS[step.done ? "done" : "pending"]}`}
                  />
                  <span
                    className={`text-sm font-medium ${STEP_TITLE_CLASS[step.done ? "done" : "pending"]}`}
                  >
                    {step.title}
                  </span>
                </div>

                {/* Show description + CTA only for incomplete steps */}
                {!step.done && (
                  <>
                    <p className="text-xs text-slate-500 mt-1">{step.desc}</p>
                    <div className="mt-2 flex items-center gap-2 flex-wrap">
                      <button
                        onClick={step.ctaAction}
                        className="inline-flex items-center gap-1 px-3 py-2 bg-indigo-600 text-white rounded-md text-xs font-medium hover:bg-indigo-700 transition-colors min-h-[44px]"
                      >
                        {step.ctaText}
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                      {step.micro && (
                        <span className="text-xs text-slate-400">
                          {step.micro}
                        </span>
                      )}
                    </div>
                  </>
                )}

                {/* Show secondary action for completed steps */}
                {step.done && step.secondaryText && step.secondaryAction && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      step.secondaryAction();
                    }}
                    className="mt-1 text-xs text-emerald-600 underline hover:text-emerald-700 min-h-[44px] inline-flex items-center"
                  >
                    {step.secondaryText}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick button — open guest menu */}
      <div className="mt-4 pt-3 border-t border-slate-100">
        <button
          onClick={() =>
            window.open(
              `/x?partner=${encodeURIComponent(partnerId)}&mode=hall&lang=RU`,
              "_blank"
            )
          }
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200 transition-colors min-h-[44px]"
        >
          <ExternalLink className="w-4 h-4" />
          {t("partnerhome.onboarding.quick.cta_open_guest_menu")}
        </button>
      </div>
    </div>
  );
}

/* =======================
   MAIN COMPONENT
   ======================= */

function PartnerHomeContent() {
  const navigate = useNavigate();
  const { t } = useI18n();
  const { partnerId } = usePartnerAccess();

  // Load partner details
  const partnerQ = useQuery({
    queryKey: ["partner", partnerId],
    queryFn: () => base44.entities.Partner.get(partnerId),
    enabled: !!partnerId,
  });

  const partner = partnerQ.data || null;

  // Load active table sessions (status = open)
  const sessionsQ = useQuery({
    queryKey: ["TableSession", "byPartner", partnerId],
    enabled: !!partnerId,
    queryFn: () => base44.entities.TableSession.filter({ partner: partnerId }),
  });

  // Load today's orders
  const ordersQ = useQuery({
    queryKey: ["Order", "byPartner", partnerId],
    enabled: !!partnerId,
    queryFn: () => base44.entities.Order.filter({ partner: partnerId }),
  });

  // --- Onboarding queries ---
  const dishesQ = useQuery({
    queryKey: ["Dish", "byPartner", partnerId],
    enabled: !!partnerId,
    staleTime: 60_000,
    queryFn: () => base44.entities.Dish.filter({ partner: partnerId }),
  });

  const tablesQ = useQuery({
    queryKey: ["Table", "byPartner", partnerId],
    enabled: !!partnerId,
    staleTime: 60_000,
    queryFn: () => base44.entities.Table.filter({ partner: partnerId }),
  });

  const staffQ = useQuery({
    queryKey: ["StaffAccessLink", "byPartner", partnerId],
    enabled: !!partnerId,
    staleTime: 60_000,
    queryFn: () =>
      base44.entities.StaffAccessLink.filter({ partner: partnerId }),
  });

  // Calculate statistics
  const stats = useMemo(() => {
    const sessions = sessionsQ.data || [];
    const orders = ordersQ.data || [];
    const todayStart = getTodayStart();

    const now = new Date();
    const openSessions = sessions.filter(
      (s) =>
        s.status === "open" &&
        !(s.expires_at && new Date(s.expires_at) < now)
    );
    const expiredSessions = sessions.filter(
      (s) =>
        s.status === "expired" ||
        (s.status === "open" &&
          s.expires_at &&
          new Date(s.expires_at) < now)
    );

    const todayOrders = orders.filter((o) => {
      const created = new Date(o.created_at);
      return created >= todayStart;
    });

    const completedStatuses = new Set(["completed", "done", "served"]);
    const completedOrders = todayOrders.filter((o) =>
      completedStatuses.has(String(o.status || "").toLowerCase())
    );

    const totalOrders = todayOrders.length;
    const totalRevenue = completedOrders.reduce(
      (sum, o) => sum + (Number(o.total_amount) || 0),
      0
    );

    const byChannel = {
      hall: { orders: 0, revenue: 0 },
      pickup: { orders: 0, revenue: 0 },
      delivery: { orders: 0, revenue: 0 },
    };

    todayOrders.forEach((o) => {
      const type = String(o.order_type || "").toLowerCase();
      if (byChannel[type]) {
        byChannel[type].orders += 1;
      }
    });

    completedOrders.forEach((o) => {
      const type = String(o.order_type || "").toLowerCase();
      const amount = Number(o.total_amount) || 0;
      if (byChannel[type]) {
        byChannel[type].revenue += amount;
      }
    });

    return {
      openTables: openSessions.length,
      expiredTables: expiredSessions.length,
      totalOrders,
      totalRevenue,
      byChannel,
    };
  }, [sessionsQ.data, ordersQ.data]);

  // Check if channels are configured
  const hasChannels = !!partner?.channels_configured_at;

  // Loading state
  const isLoading =
    partnerQ.isLoading || sessionsQ.isLoading || ordersQ.isLoading;

  // Error state
  const hasError =
    partnerQ.isError || sessionsQ.isError || ordersQ.isError;

  // Onboarding data ready (don't block main content for onboarding queries)
  const onboardingReady =
    !dishesQ.isLoading && !tablesQ.isLoading && !staffQ.isLoading;

  return (
    <>
      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-slate-500">{t("common.loading")}</div>
        </div>
      )}

      {/* Error */}
      {hasError && !isLoading && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="font-semibold text-red-800">
            {t("error.loading")}
          </div>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 text-sm text-red-600 underline"
          >
            {t("common.reload")}
          </button>
        </div>
      )}

      {/* No partner */}
      {!isLoading && !hasError && !partner && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 text-center">
          <div className="text-lg font-semibold text-slate-900 mb-2">
            {t("partnerhome.no_restaurant")}
          </div>
          <div className="text-slate-500">
            {t("partnerhome.create_restaurant_hint")}
          </div>
        </div>
      )}

      {/* Main content */}
      {!isLoading && !hasError && partner && (
        <div className="space-y-4">
          {/* ONBOARDING CHECKLIST — shows above dashboard content */}
          {onboardingReady && (
            <OnboardingChecklist
              partner={partner}
              dishes={dishesQ.data || []}
              tables={tablesQ.data || []}
              staff={staffQ.data || []}
              partnerId={partnerId}
              navigate={navigate}
              t={t}
            />
          )}

          {/* NOW BLOCK — Active tables */}
          <button
            onClick={() => navigate("/partnertables")}
            className="w-full bg-white border border-slate-200 rounded-xl p-4 sm:p-5 hover:border-indigo-300 hover:shadow-md transition-all text-left group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <LayoutGrid className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <div className="text-lg sm:text-xl font-bold text-slate-900">
                    {getTablesText(stats.openTables, t)}
                  </div>
                  {stats.expiredTables > 0 && (
                    <div className="flex items-center gap-1 text-amber-600 text-sm mt-0.5">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>
                        {t("partnerhome.tables_expired", {
                          count: stats.expiredTables,
                        })}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-indigo-500 transition-colors" />
            </div>
          </button>

          {/* TODAY BLOCK — Statistics */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5">
            <div className="text-sm font-medium text-slate-500 mb-3">
              {t("partnerhome.today")}
            </div>

            {/* Total */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-slate-50 rounded-lg p-3 text-center">
                <div className="text-2xl sm:text-3xl font-bold text-slate-900">
                  {stats.totalOrders}
                </div>
                <div className="text-xs sm:text-sm text-slate-500 mt-0.5">
                  {t("partnerhome.orders")}
                </div>
              </div>
              <div className="bg-slate-50 rounded-lg p-3 text-center">
                <div className="text-2xl sm:text-3xl font-bold text-slate-900">
                  {formatMoney(stats.totalRevenue)}
                </div>
                <div className="text-xs sm:text-sm text-slate-500 mt-0.5">
                  {t("partnerhome.revenue")}
                </div>
              </div>
            </div>

            {/* By channel */}
            <div className="space-y-2">
              {/* Hall — always visible */}
              <div className="flex items-center justify-between py-2 px-3 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Utensils className="w-4 h-4 text-indigo-500" />
                  <span className="text-sm font-medium text-slate-700">
                    {t("channel.hall")}
                  </span>
                </div>
                <div className="text-sm text-slate-600">
                  {t("partnerhome.orders_short", {
                    count: stats.byChannel.hall.orders,
                  })}{" "}
                  · {formatMoney(stats.byChannel.hall.revenue)}
                </div>
              </div>

              {/* Pickup — only if channels configured */}
              {hasChannels && (
                <div className="flex items-center justify-between py-2 px-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-emerald-500" />
                    <span className="text-sm font-medium text-slate-700">
                      {t("channel.pickup")}
                    </span>
                  </div>
                  <div className="text-sm text-slate-600">
                    {t("partnerhome.orders_short", {
                      count: stats.byChannel.pickup.orders,
                    })}{" "}
                    · {formatMoney(stats.byChannel.pickup.revenue)}
                  </div>
                </div>
              )}

              {/* Delivery — only if channels configured */}
              {hasChannels && (
                <div className="flex items-center justify-between py-2 px-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-orange-500" />
                    <span className="text-sm font-medium text-slate-700">
                      {t("channel.delivery")}
                    </span>
                  </div>
                  <div className="text-sm text-slate-600">
                    {t("partnerhome.orders_short", {
                      count: stats.byChannel.delivery.orders,
                    })}{" "}
                    · {formatMoney(stats.byChannel.delivery.revenue)}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Empty state hint */}
          {stats.totalOrders === 0 && stats.openTables === 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
              <div className="text-blue-800 text-sm">
                {t("partnerhome.empty_hint")}
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}

export default function PartnerHome() {
  return (
    <PartnerShell activeTab="home">
      <PartnerHomeContent />
    </PartnerShell>
  );
}
