// BLOCK 00 — Imports & Constants
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { 
  Shield, LogOut, AlertTriangle, Loader2, ArrowLeft, 
  ExternalLink, Image, ShoppingCart, Clock, CheckCircle2,
  Store, RefreshCw
} from "lucide-react";
import { toast } from "sonner";
import { useI18n } from "@/components/i18n";

const ADMIN_EMAILS = ["linkgabinfo@gmail.com"];

// BLOCK 01 — Helper Functions
function isRateLimitError(error) {
  if (!error) return false;
  const msg = (error.message || error.toString() || "").toLowerCase();
  return msg.includes("rate limit") || msg.includes("429");
}

function shouldRetry(failureCount, error) {
  if (isRateLimitError(error)) return false;
  return failureCount < 2;
}

function formatDate(dateStr) {
  if (!dateStr) return "—";
  const date = new Date(dateStr);
  return date.toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  });
}

// BLOCK 02 — Main Component
export default function AdminPartnersPage() {
  const { t } = useI18n();
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [rateLimitHit, setRateLimitHit] = useState(false);
  const queryClient = useQueryClient();

  // Admin check — computed from user state, used in query enabled flags
  const isAdmin = user && ADMIN_EMAILS.includes(user.email?.toLowerCase());

  // Auth check
  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    try {
      const me = await base44.auth.me();
      if (!me || !me.email) {
        base44.auth.redirectToLogin(window.location.pathname);
        return;
      }
      setUser(me);
    } catch (err) {
      base44.auth.redirectToLogin(window.location.pathname);
    } finally {
      setAuthLoading(false);
    }
  }

  function handleLogout() {
    base44.auth.logout();
  }

  // BLOCK 03 — Data Queries
  const { data: partners = [], isLoading: partnersLoading, error: partnersError, isError: isPartnersError } = useQuery({
    queryKey: ["admin-partners"],
    queryFn: () => base44.entities.Partner.list("-created_date", 100),
    retry: shouldRetry,
    enabled: !rateLimitHit && !authLoading && !!isAdmin
  });

  const { data: allDishes = [], isLoading: dishesLoading, isError: isDishesError } = useQuery({
    queryKey: ["admin-all-dishes"],
    queryFn: () => base44.entities.Dish.list("-created_date", 1000),
    retry: shouldRetry,
    enabled: !rateLimitHit && !authLoading && !!isAdmin && partners.length > 0
  });

  const { data: allOrders = [], isLoading: ordersLoading, isError: isOrdersError } = useQuery({
    queryKey: ["admin-all-orders"],
    queryFn: () => base44.entities.Order.list("-created_date", 1000),
    retry: shouldRetry,
    enabled: !rateLimitHit && !authLoading && !!isAdmin && partners.length > 0
  });

  const { data: allTables = [], isLoading: tablesLoading, isError: isTablesError } = useQuery({
    queryKey: ["admin-all-tables"],
    queryFn: () => base44.entities.Table.list("-created_date", 500),
    retry: shouldRetry,
    enabled: !rateLimitHit && !authLoading && !!isAdmin && partners.length > 0
  });

  const { data: allStaffLinks = [], isLoading: staffLoading, isError: isStaffError } = useQuery({
    queryKey: ["admin-all-staff"],
    queryFn: () => base44.entities.StaffAccessLink.list("-created_date", 500),
    retry: shouldRetry,
    enabled: !rateLimitHit && !authLoading && !!isAdmin && partners.length > 0
  });

  // Rate limit detection
  useEffect(() => {
    const error = partnersError;
    if (error && isRateLimitError(error)) {
      queryClient.cancelQueries({ queryKey: ["admin-partners"] });
      queryClient.cancelQueries({ queryKey: ["admin-all-dishes"] });
      queryClient.cancelQueries({ queryKey: ["admin-all-orders"] });
      queryClient.cancelQueries({ queryKey: ["admin-all-tables"] });
      queryClient.cancelQueries({ queryKey: ["admin-all-staff"] });
      setRateLimitHit(true);
    }
  }, [partnersError, queryClient]);

  // BLOCK 04 — Mutation for status toggle
  const toggleStatusMutation = useMutation({
    mutationFn: async ({ partnerId, newStatus }) => {
      await base44.entities.Partner.update(partnerId, { is_active: newStatus });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-partners"] });
      toast.success(t('adminPartners.statusUpdated', 'Статус обновлён'), { id: "mm1" });
    },
    onError: () => {
      toast.error(t('adminPartners.statusError', 'Ошибка обновления статуса'), { id: "mm1" });
    }
  });

  // BLOCK 04b — Mutation for plan toggle
  const togglePlanMutation = useMutation({
    mutationFn: async ({ partnerId, newPlan }) => {
      const updates = {
        plan_tier: newPlan,
        orders_mode: newPlan === 'paid' ? 'always' : 'wifi_only',
        image_quality_tier: newPlan
      };
      if (newPlan === 'paid') {
        updates.paid_activated_at = new Date().toISOString();
      }
      await base44.entities.Partner.update(partnerId, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-partners"] });
      toast.success(t('adminPartners.planUpdated', 'План обновлён'), { id: "mm1" });
    },
    onError: () => {
      toast.error(t('adminPartners.planError', 'Ошибка обновления плана'), { id: "mm1" });
    }
  });

  // BLOCK 05 — Compute stats per partner
  function getPartnerStats(partnerId) {
    const dishes = allDishes.filter(d => d.partner === partnerId && !d.is_archived);
    const dishesWithPhoto = dishes.filter(d => d.image);
    const orders = allOrders.filter(o => o.partner === partnerId);
    const tables = allTables.filter(tbl => tbl.partner === partnerId);
    const staff = allStaffLinks.filter(s => s.partner === partnerId && s.is_active);

    const lastOrder = orders.length > 0 
      ? orders.reduce((latest, o) => {
          if (!latest) return o;
          return new Date(o.created_date) > new Date(latest.created_date) ? o : latest;
        }, null)
      : null;

    // Готовность: меню (33%) + столы (33%) + персонал (34%)
    let readiness = 0;
    if (dishes.length > 0) readiness += 33;
    if (tables.length > 0) readiness += 33;
    if (staff.length > 0) readiness += 34;

    return {
      dishCount: dishes.length,
      dishWithPhotoCount: dishesWithPhoto.length,
      orderCount: orders.length,
      lastOrderDate: lastOrder?.created_date,
      tableCount: tables.length,
      staffCount: staff.length,
      readiness
    };
  }

  // BLOCK 06 — Guards (AFTER all hooks)
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400 mx-auto mb-2" />
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-2" />
            <CardTitle>Нет доступа</CardTitle>
            <CardDescription>
              У вас нет прав для просмотра этой страницы.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-gray-500 mb-4">
              Вы вошли как: {user?.email || "Unknown"}
            </p>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Выйти
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (rateLimitHit) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-md border-amber-200 bg-amber-50">
          <CardHeader className="text-center">
            <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-2" />
            <CardTitle>Превышен лимит запросов</CardTitle>
            <CardDescription>
              Подождите немного и попробуйте снова.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button 
              variant="outline" 
              onClick={() => {
                setRateLimitHit(false);
                queryClient.invalidateQueries({ queryKey: ["admin-partners"] });
                queryClient.invalidateQueries({ queryKey: ["admin-all-dishes"] });
                queryClient.invalidateQueries({ queryKey: ["admin-all-orders"] });
                queryClient.invalidateQueries({ queryKey: ["admin-all-tables"] });
                queryClient.invalidateQueries({ queryKey: ["admin-all-staff"] });
              }}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Повторить
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isLoading = partnersLoading || dishesLoading || ordersLoading || tablesLoading || staffLoading;
  // Show "—" only when error AND no cached data (don't hide valid stale data on background refetch failure)
  const dishesUnavailable = isDishesError && allDishes.length === 0;
  const ordersUnavailable = isOrdersError && allOrders.length === 0;
  const tablesUnavailable = isTablesError && allTables.length === 0;
  const staffUnavailable = isStaffError && allStaffLinks.length === 0;
  const readinessUnavailable = dishesUnavailable || tablesUnavailable || staffUnavailable;

  // BLOCK 07 — Render UI
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <a href="/admin456">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </a>
              <Store className="h-6 w-6 text-blue-600" />
              <div>
                <h1 className="text-xl font-bold">Рестораны</h1>
                <p className="text-xs text-gray-500">{partners.length} партнёров</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Выйти
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : isPartnersError && partners.length === 0 ? (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="py-12 text-center">
              <AlertTriangle className="h-12 w-12 text-red-400 mx-auto mb-3" />
              <p className="text-gray-700 font-medium mb-1">{t('adminPartners.loadError', 'Ошибка загрузки')}</p>
              <p className="text-sm text-gray-500 mb-4">{t('adminPartners.loadErrorDesc', 'Не удалось загрузить список ресторанов')}</p>
              <Button
                variant="outline"
                onClick={() => queryClient.invalidateQueries({ queryKey: ["admin-partners"] })}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                {t('common.retry', 'Повторить')}
              </Button>
            </CardContent>
          </Card>
        ) : partners.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Store className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">Нет ресторанов</p>
            </CardContent>
          </Card>
        ) : (
          <div className="bg-white rounded-lg border overflow-hidden">
            {/* Table Header */}
            <div className="hidden md:grid md:grid-cols-[2fr,1fr,1fr,1fr,1fr,80px,1fr,1fr,80px] gap-2 px-4 py-3 bg-gray-50 border-b text-sm font-medium text-gray-600">
              <div>Название</div>
              <div className="text-center">Блюд</div>
              <div className="text-center">Заказов</div>
              <div className="text-center">Последний</div>
              <div className="text-center">Готовность</div>
              <div className="text-center">План</div>
              <div className="text-center">Создан</div>
              <div className="text-center">Статус</div>
              <div></div>
            </div>

            {/* Table Body */}
            <div className="divide-y">
              {partners.map((partner) => {
                const stats = getPartnerStats(partner.id);
                const menuUrl = `/x?partner=${encodeURIComponent(partner.slug || partner.id)}`;
                const isPartnerMutating =
                  (togglePlanMutation.isPending && togglePlanMutation.variables?.partnerId === partner.id) ||
                  (toggleStatusMutation.isPending && toggleStatusMutation.variables?.partnerId === partner.id);
                
                return (
                  <div 
                    key={partner.id} 
                    className="px-4 py-3 hover:bg-gray-50 transition-colors"
                  >
                    {/* Mobile View */}
                    <div className="md:hidden space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{partner.name}</p>
                          <p className="text-xs text-gray-500">{partner.slug || "—"}</p>
                        </div>
                        <a href={menuUrl} target="_blank" rel="noopener noreferrer">
                          <Button variant="outline" size="sm">
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </a>
                      </div>
                      <div className="grid grid-cols-5 gap-2 text-sm">
                        <div className="text-center">
                          <p className="text-gray-500 text-xs">Блюд</p>
                          <p className="font-medium">{dishesUnavailable ? "—" : stats.dishCount}</p>
                          <p className="text-xs text-gray-400">
                            <Image className="h-3 w-3 inline mr-1" />
                            {dishesUnavailable ? "—" : stats.dishWithPhotoCount}
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-gray-500 text-xs">Заказов</p>
                          <p className="font-medium">{ordersUnavailable ? "—" : stats.orderCount}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-gray-500 text-xs">Готовность</p>
                          {readinessUnavailable ? <span className="text-xs text-gray-400">—</span> : <ReadinessBadge value={stats.readiness} />}
                        </div>
                        <div className="text-center">
                          <p className="text-gray-500 text-xs">План</p>
                          <PlanBadge 
                            plan={partner.plan_tier}
                            onClick={() => {
                              const newPlan = partner.plan_tier === 'paid' ? 'free' : 'paid';
                              togglePlanMutation.mutate({ partnerId: partner.id, newPlan });
                            }}
                            disabled={isPartnerMutating}
                          />
                        </div>
                        <div className="text-center">
                          <p className="text-gray-500 text-xs">Статус</p>
                          <StatusToggle 
                            partner={partner} 
                            onToggle={(newStatus) => {
                              toggleStatusMutation.mutate({ 
                                partnerId: partner.id, 
                                newStatus 
                              });
                            }}
                            disabled={isPartnerMutating}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Desktop View */}
                    <div className="hidden md:grid md:grid-cols-[2fr,1fr,1fr,1fr,1fr,80px,1fr,1fr,80px] gap-2 items-center">
                      <div>
                        <p className="font-medium">{partner.name}</p>
                        <p className="text-xs text-gray-500">{partner.slug || "—"}</p>
                      </div>
                      <div className="text-center">
                        <span className="font-medium">{dishesUnavailable ? "—" : stats.dishCount}</span>
                        {!dishesUnavailable && <span className="text-gray-400 text-sm ml-1">
                          (<Image className="h-3 w-3 inline" /> {stats.dishWithPhotoCount})
                        </span>}
                      </div>
                      <div className="text-center font-medium">
                        {ordersUnavailable ? "—" : stats.orderCount}
                      </div>
                      <div className="text-center text-sm text-gray-500">
                        {ordersUnavailable ? "—" : formatDate(stats.lastOrderDate)}
                      </div>
                      <div className="text-center">
                        {readinessUnavailable ? <span className="text-xs text-gray-400">—</span> : <ReadinessBadge value={stats.readiness} />}
                      </div>
                      <div className="text-center">
                        <PlanBadge 
                          plan={partner.plan_tier}
                          onClick={() => {
                            const newPlan = partner.plan_tier === 'paid' ? 'free' : 'paid';
                            togglePlanMutation.mutate({ partnerId: partner.id, newPlan });
                          }}
                          disabled={isPartnerMutating}
                        />
                      </div>
                      <div className="text-center text-sm text-gray-500">
                        {formatDate(partner.created_at)}
                      </div>
                      <div className="text-center">
                        <StatusToggle 
                          partner={partner} 
                          onToggle={(newStatus) => {
                            toggleStatusMutation.mutate({ 
                              partnerId: partner.id, 
                              newStatus 
                            });
                          }}
                          disabled={isPartnerMutating}
                        />
                      </div>
                      <div className="text-center">
                        <a href={menuUrl} target="_blank" rel="noopener noreferrer">
                          <Button variant="ghost" size="sm">
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Footer */}
        <p className="text-xs text-gray-400 text-center mt-6">
          MenuApp Admin • Рестораны
        </p>
      </div>
    </div>
  );
}

// BLOCK 08 — ReadinessBadge Component
function ReadinessBadge({ value }) {
  let colorClass = "bg-red-100 text-red-700";
  if (value >= 100) {
    colorClass = "bg-green-100 text-green-700";
  } else if (value >= 66) {
    colorClass = "bg-yellow-100 text-yellow-700";
  } else if (value >= 33) {
    colorClass = "bg-orange-100 text-orange-700";
  }

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${colorClass}`}>
      {value === 100 && <CheckCircle2 className="h-3 w-3 mr-1" />}
      {value}%
    </span>
  );
}

// BLOCK 09 — StatusToggle Component
function StatusToggle({ partner, onToggle, disabled }) {
  return (
    <Switch
      checked={partner.is_active ?? true}
      onCheckedChange={onToggle}
      disabled={disabled}
    />
  );
}

// BLOCK 10 — PlanBadge Component
function PlanBadge({ plan, onClick, disabled }) {
  const isFree = plan !== 'paid';
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium transition-colors ${
        isFree 
          ? 'bg-gray-100 text-gray-600 hover:bg-gray-200' 
          : 'bg-green-100 text-green-700 hover:bg-green-200'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      {isFree ? 'Free' : 'Paid'}
    </button>
  );
}
