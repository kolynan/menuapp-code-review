import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { ArrowRight, AlertTriangle, Utensils, Package, Truck, LayoutGrid } from "lucide-react";
import PartnerShell, { usePartnerAccess } from "@/components/PartnerShell";
import { useI18n } from "@/components/i18n";

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
  if (count === 0) return t('partnerhome.no_open_tables');
  return t('partnerhome.tables_open', { count });
}

/* =======================
   MAIN COMPONENT
   ======================= */

// FIX BUG-PH-001: use usePartnerAccess() inside PartnerShell wrapper
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

  // Calculate statistics
  const stats = useMemo(() => {
    const sessions = sessionsQ.data || [];
    const orders = ordersQ.data || [];
    const todayStart = getTodayStart();

    // FIX BUG-PH-002: exclude locally-expired from open count to avoid double-counting
    const now = new Date();
    const openSessions = sessions.filter(
      (s) => s.status === "open" && !(s.expires_at && new Date(s.expires_at) < now)
    );
    const expiredSessions = sessions.filter(
      (s) => s.status === "expired" || (s.status === "open" && s.expires_at && new Date(s.expires_at) < now)
    );

    // Today's orders
    const todayOrders = orders.filter((o) => {
      const created = new Date(o.created_at);
      return created >= todayStart;
    });

    // Completed orders (for revenue)
    const completedStatuses = new Set(["completed", "done", "served"]);
    const completedOrders = todayOrders.filter((o) =>
      completedStatuses.has(String(o.status || "").toLowerCase())
    );

    // Total stats
    const totalOrders = todayOrders.length;
    const totalRevenue = completedOrders.reduce(
      (sum, o) => sum + (Number(o.total_amount) || 0),
      0
    );

    // By channel
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
  const isLoading = partnerQ.isLoading || sessionsQ.isLoading || ordersQ.isLoading;

  // Error state
  const hasError = partnerQ.isError || sessionsQ.isError || ordersQ.isError;

  return (
    <>
      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-slate-500">{t('common.loading')}</div>
        </div>
      )}

      {/* Error */}
      {hasError && !isLoading && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="font-semibold text-red-800">{t('error.loading')}</div>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 text-sm text-red-600 underline"
          >
            {t('common.reload')}
          </button>
        </div>
      )}

      {/* No partner */}
      {!isLoading && !hasError && !partner && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 text-center">
          <div className="text-lg font-semibold text-slate-900 mb-2">
            {t('partnerhome.no_restaurant')}
          </div>
          <div className="text-slate-500">
            {t('partnerhome.create_restaurant_hint')}
          </div>
        </div>
      )}

      {/* Main content */}
      {!isLoading && !hasError && partner && (
        <div className="space-y-4">
          {/* NOW BLOCK — Active tables */}
          <button
            onClick={() => navigate("/staffordersmobile")}
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
                      <span>{t('partnerhome.tables_expired', { count: stats.expiredTables })}</span>
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
              📊 {t('partnerhome.today')}
            </div>

            {/* Total */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-slate-50 rounded-lg p-3 text-center">
                <div className="text-2xl sm:text-3xl font-bold text-slate-900">
                  {stats.totalOrders}
                </div>
                <div className="text-xs sm:text-sm text-slate-500 mt-0.5">
                  {t('partnerhome.orders')}
                </div>
              </div>
              <div className="bg-slate-50 rounded-lg p-3 text-center">
                <div className="text-2xl sm:text-3xl font-bold text-slate-900">
                  {formatMoney(stats.totalRevenue)}
                </div>
                <div className="text-xs sm:text-sm text-slate-500 mt-0.5">
                  {t('partnerhome.revenue')}
                </div>
              </div>
            </div>

            {/* By channel */}
            <div className="space-y-2">
              {/* Hall — always visible */}
              <div className="flex items-center justify-between py-2 px-3 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Utensils className="w-4 h-4 text-indigo-500" />
                  <span className="text-sm font-medium text-slate-700">{t('channel.hall')}</span>
                </div>
                <div className="text-sm text-slate-600">
                  {t('partnerhome.orders_short', { count: stats.byChannel.hall.orders })} · {formatMoney(stats.byChannel.hall.revenue)}
                </div>
              </div>

              {/* Pickup — only if channels configured */}
              {hasChannels && (
                <div className="flex items-center justify-between py-2 px-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-emerald-500" />
                    <span className="text-sm font-medium text-slate-700">{t('channel.pickup')}</span>
                  </div>
                  <div className="text-sm text-slate-600">
                    {t('partnerhome.orders_short', { count: stats.byChannel.pickup.orders })} · {formatMoney(stats.byChannel.pickup.revenue)}
                  </div>
                </div>
              )}

              {/* Delivery — only if channels configured */}
              {hasChannels && (
                <div className="flex items-center justify-between py-2 px-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-orange-500" />
                    <span className="text-sm font-medium text-slate-700">{t('channel.delivery')}</span>
                  </div>
                  <div className="text-sm text-slate-600">
                    {t('partnerhome.orders_short', { count: stats.byChannel.delivery.orders })} · {formatMoney(stats.byChannel.delivery.revenue)}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Empty state hint */}
          {stats.totalOrders === 0 && stats.openTables === 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
              <div className="text-blue-800 text-sm">
                💡 {t('partnerhome.empty_hint')}
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}

// FIX BUG-PH-001: wrapper + content pattern (usePartnerAccess inside PartnerShell)
export default function PartnerHome() {
  return (
    <PartnerShell activeTab="home">
      <PartnerHomeContent />
    </PartnerShell>
  );
}
