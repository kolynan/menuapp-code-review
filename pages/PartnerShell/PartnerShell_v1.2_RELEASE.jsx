// Version: 1.2 | Updated: 2026-03-01 | Session: 59 | Source: v1.1 RELEASE + hamburger Settings item
// Review: pages/PartnerShell/review_2026-02-22.md
// Patches applied: P1-P5, P7-P15, N1 (P6 conceded, N2/N3 rejected)

import React, { createContext, useContext, useMemo, useState, useEffect } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Home, Utensils, Table2, Users, GitBranch, Settings, Menu, LogOut, User, Loader2, AlertTriangle, RefreshCcw, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent } from "@/components/ui/card";
import { useI18n } from "@/components/i18n";
import { cn } from "@/lib/utils"; // P8: cn() utility for safe Tailwind classes

/**
 * PartnerShell - Shared layout for partner cabinet pages
 *
 * Tabs: home | menu | tables | staff | process | settings (LOCKED NAV-006, NAV-009)
 *
 * Access Control (LOCKED STAFF-015..020):
 * - owner: User.partner === partnerId (full access)
 * - director: StaffAccessLink.staff_role === 'director' (cabinet access, can invite MD + staff)
 * - managing_director: StaffAccessLink.staff_role === 'managing_director' (cabinet access, can invite staff only)
 *
 * Usage:
 * ```jsx
 * import PartnerShell, { usePartnerAccess } from "@/components/PartnerShell";
 *
 * // IMPORTANT: Use wrapper pattern!
 * function PageContent() {
 *   const { userRole, partnerId } = usePartnerAccess(); // Works inside PartnerShell
 *   return <div>...</div>;
 * }
 *
 * export default function Page() {
 *   return (
 *     <PartnerShell activeTab="settings">
 *       <PageContent />
 *     </PartnerShell>
 *   );
 * }
 * ```
 */

// ============================================================
// CONSTANTS
// ============================================================

const CACHE_TIME = 5 * 60 * 1000; // 5 minutes

// Language labels are not translated (English is always "English")
// This is a deliberate i18n exception: endonyms are written in their own language (N2 rejected)
const LANGUAGES = [
  { code: "ru", label: "Русский" },
  { code: "kk", label: "Қазақша" },
  { code: "en", label: "English" },
];

// Roles with cabinet access (can view partner cabinet)
const CABINET_ACCESS_ROLES = ['director', 'managing_director'];

// ============================================================
// HELPERS
// ============================================================

function isRateLimitError(error) {
  if (!error) return false;
  const msg = (error.message || error.toString() || "").toLowerCase();
  return msg.includes("rate limit") || msg.includes("429");
}

function shouldRetry(failureCount, error) {
  if (isRateLimitError(error)) return false;
  return failureCount < 1;
}

function getTabs(t) {
  return [
    { id: "home", label: t("nav.home"), Icon: Home, path: "/partnerhome" },
    { id: "menu", label: t("nav.menu"), Icon: Utensils, path: "/menumanage" },
    { id: "tables", label: t("nav.tables"), Icon: Table2, path: "/partnertables" },
    { id: "staff", label: t("nav.staff"), Icon: Users, path: "/partnerstaffaccess" },
    { id: "process", label: t("nav.process"), Icon: GitBranch, path: "/partnerorderprocess" },
    { id: "loyalty", label: t("nav.loyalty"), Icon: Gift, path: "/partnerloyalty" },
    { id: "clients", label: t("nav.clients"), Icon: Users, path: "/partnerclients" },
    { id: "settings", label: t("nav.settings"), Icon: Settings, path: "/partnersettings" },
  ];
}

// ============================================================
// PARTNER ACCESS CONTEXT (STAFF-015..020)
// ============================================================

// N1: Context enforcement — null default allows detecting missing provider
const PartnerAccessContext = createContext(null);

export function usePartnerAccess() {
  const context = useContext(PartnerAccessContext);
  // N1: Throw if called outside PartnerShell provider
  if (!context) {
    throw new Error('usePartnerAccess must be used within <PartnerShell>');
  }
  return context;
}

// ============================================================
// HELPER COMPONENTS
// ============================================================

function RateLimitScreen({ t, onRetry }) {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full border-amber-200 bg-amber-50">
        <CardContent className="py-8 text-center">
          <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4" aria-hidden="true" /> {/* P14 */}
          <h1 className="text-xl font-bold text-slate-900 mb-2">
            {t('partnershell.error.rate_limit_title')} {/* P7: fix namespace */}
          </h1>
          <p className="text-slate-600 mb-4">
            {t('partnershell.error.rate_limit_message')} {/* P7: fix namespace */}
          </p>
          <Button onClick={onRetry} className="bg-amber-600 hover:bg-amber-700">
            <RefreshCcw className="w-4 h-4 mr-2" aria-hidden="true" />
            {t('common.retry')}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

// P4: Error screen for non-rate-limit errors (improved by Codex: handle all errors)
function ErrorScreen({ t, onRetry }) {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardContent className="py-8 text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" aria-hidden="true" /> {/* P14 */}
          <h1 className="text-xl font-bold text-slate-900 mb-2">
            {t('common.error')}
          </h1>
          <p className="text-slate-500 mb-6">
            {t('partnershell.error.load_failed')}
          </p>
          <Button onClick={onRetry}>
            <RefreshCcw className="w-4 h-4 mr-2" aria-hidden="true" />
            {t('common.retry')}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function AccessDenied({ t, onLogout }) {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardContent className="py-8 text-center">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-red-600" aria-hidden="true" /> {/* P14 */}
          </div>
          <h1 className="text-xl font-bold text-slate-900 mb-2">
            {t('error.access_denied')}
          </h1>
          <p className="text-slate-500 mb-6">
            {t('partnershell.error.no_cabinet_access')}
          </p>
          <Button variant="outline" onClick={onLogout}>
            <LogOut className="w-4 h-4 mr-2" aria-hidden="true" />
            {t('nav.logout')}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function LoadingScreen({ t }) {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-indigo-600" aria-label={t('common.loading')} />
    </div>
  );
}

// ============================================================
// MAIN COMPONENT
// ============================================================

export default function PartnerShell({ activeTab, children }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { lang, setLang, t } = useI18n();
  const tabs = getTabs(t); // P12: camelCase inside component body

  // Rate limit state
  const [rateLimitHit, setRateLimitHit] = useState(false);

  // ============================================================
  // AUTH & ACCESS CONTROL (STAFF-015..020)
  // ============================================================

  // 1. Get current user
  const {
    data: currentUser,
    isLoading: loadingUser,
    error: userError,
  } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
    retry: shouldRetry,
    staleTime: CACHE_TIME,
    enabled: !rateLimitHit,
  });

  // 2. Check if user is owner (has User.partner)
  const isOwner = !!currentUser?.partner;
  const ownerPartnerId = currentUser?.partner;

  // 3. Check for cabinet access via StaffAccessLink
  // Skip for owners — they have implicit access via User.partner
  const {
    data: cabinetAccessLinks,
    isLoading: loadingAccess,
    error: accessError,
  } = useQuery({
    queryKey: ['cabinetAccess', currentUser?.id],
    queryFn: async () => {
      const links = await base44.entities.StaffAccessLink.filter({
        invited_user: currentUser.id,
        is_active: true
      });
      return links?.filter(link => CABINET_ACCESS_ROLES.includes(link.staff_role)) || [];
    },
    enabled: !!currentUser?.id && !rateLimitHit && !isOwner,
    retry: shouldRetry,
    staleTime: CACHE_TIME,
  });

  // 4. Determine effective role and partnerId (STAFF-015..020)
  // Owner check is first (StaffAccessLink query skipped for owners)
  const { userRole, effectivePartnerId } = useMemo(() => {
    // Owners have implicit full access via User.partner
    if (isOwner) {
      return { userRole: 'owner', effectivePartnerId: ownerPartnerId };
    }

    // Non-owners: check StaffAccessLink (priority: director > managing_director)
    if (cabinetAccessLinks && cabinetAccessLinks.length > 0) {
      const directorLink = cabinetAccessLinks.find(l => l.staff_role === 'director');
      const mdLink = cabinetAccessLinks.find(l => l.staff_role === 'managing_director');
      const accessLink = directorLink || mdLink;

      if (accessLink) {
        return {
          userRole: accessLink.staff_role,
          effectivePartnerId: accessLink.partner
        };
      }
    }

    return { userRole: null, effectivePartnerId: null };
  }, [isOwner, ownerPartnerId, cabinetAccessLinks]);

  // 5. Load partner data
  const {
    data: partner,
    isLoading: loadingPartner,
    error: partnerError,
  } = useQuery({
    queryKey: ['partner', effectivePartnerId],
    queryFn: () => base44.entities.Partner.get(effectivePartnerId),
    enabled: !!effectivePartnerId && !rateLimitHit,
    retry: shouldRetry,
    staleTime: CACHE_TIME,
    gcTime: CACHE_TIME * 2,
  });

  // ============================================================
  // RATE LIMIT DETECTION
  // ============================================================

  useEffect(() => {
    const errors = [userError, accessError, partnerError].filter(Boolean);
    const hasRateLimit = errors.some(isRateLimitError);

    if (hasRateLimit && !rateLimitHit) {
      setRateLimitHit(true); // P1: set state FIRST to disable query enabled guards
      queryClient.cancelQueries(); // P1: then cancel (best-effort, async)
    }
  }, [userError, accessError, partnerError, rateLimitHit, queryClient]);

  // ============================================================
  // HANDLERS
  // ============================================================

  // P13: handleLangChange removed — inlined to onClick={() => setLang(language.code)}

  const handleLogout = async () => {
    // P5: try/finally ensures redirect happens even if logout API fails
    try {
      await base44.auth.logout();
    } finally {
      window.location.href = "/";
    }
  };

  const handleRetryAfterRateLimit = () => {
    setRateLimitHit(false);
    queryClient.invalidateQueries();
  };

  // ============================================================
  // LOADING & ERROR STATES
  // ============================================================

  // Rate limit screen (check FIRST)
  if (rateLimitHit) {
    return <RateLimitScreen t={t} onRetry={handleRetryAfterRateLimit} />;
  }

  // Loading state — P3: conservative guard prevents flash for non-owner staff
  const isLoading =
    loadingUser ||
    (!isOwner && !!currentUser?.id && (loadingAccess || cabinetAccessLinks === undefined)) ||
    (effectivePartnerId && loadingPartner);

  if (isLoading) {
    return <LoadingScreen t={t} />;
  }

  // P2: Unauthenticated users → redirect to login (improved by Codex: use <Navigate>)
  if (!loadingUser && !currentUser) {
    return <Navigate to="/" replace />;
  }

  // P4: Non-rate-limit errors → show error screen (improved by Codex: handle all errors)
  const anyError = [userError, accessError, partnerError].find(
    (err) => err && !isRateLimitError(err)
  );
  if (anyError) {
    return <ErrorScreen t={t} onRetry={handleRetryAfterRateLimit} />;
  }

  // No access (not owner and no cabinet access link)
  if (!effectivePartnerId || !userRole) {
    return <AccessDenied t={t} onLogout={handleLogout} />;
  }

  // ============================================================
  // CONTEXT VALUE
  // ============================================================

  const contextValue = {
    userRole,
    partnerId: effectivePartnerId,
    partner,
    currentUser,
    isLoading: false,
    error: null,
  };

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <PartnerAccessContext.Provider value={contextValue}>
      <div className="min-h-screen bg-slate-50">
        {/* Header */}
        <header className="bg-white border-b border-slate-200">
          <div className="max-w-[980px] mx-auto px-4 sm:px-6 py-4">
            <div className="flex items-center justify-between">
              {/* Restaurant name with CTA if empty */}
              {partner?.name ? (
                <h1 className="text-lg sm:text-xl font-bold text-slate-900 truncate">
                  {partner.name}
                </h1>
              ) : (
                <Link
                  to="/partnersettings"
                  className="text-lg font-medium text-amber-600 hover:text-amber-700 hover:underline"
                >
                  {t('partnershell.setup_name')}
                </Link>
              )}

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  {/* P10: aria-label on hamburger menu button */}
                  <Button variant="ghost" size="icon" className="h-9 w-9" aria-label={t('partnershell.nav.open_menu')}>
                    <Menu className="h-5 w-5 text-slate-600" aria-hidden="true" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => navigate("/profile")} className="gap-2">
                    <User className="h-4 w-4" aria-hidden="true" />
                    {t("nav.profile")}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/partnersettings")} className="gap-2">
                    <Settings className="h-4 w-4" aria-hidden="true" />
                    {t("nav.settings")}
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  {/* P15: RadioGroup pattern for language selector (Codex version) */}
                  <div role="radiogroup" aria-label={t('partnershell.nav.language')}>
                    {LANGUAGES.map((language) => ( /* P9: renamed l → language */
                      <DropdownMenuItem
                        key={language.code}
                        onClick={() => setLang(language.code)} /* P13: inlined */
                        role="radio"
                        aria-checked={lang === language.code}
                        className={cn('gap-2', lang === language.code && 'bg-indigo-50 text-indigo-700 font-medium')} /* P8: cn() utility */
                      >
                        {lang === language.code && <span className="text-indigo-600" aria-hidden="true">●</span>}
                        {language.label}
                      </DropdownMenuItem>
                    ))}
                  </div>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem onClick={handleLogout} className="gap-2 text-red-600">
                    <LogOut className="h-4 w-4" aria-hidden="true" />
                    {t("nav.logout")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Sticky tabs navigation */}
        <nav className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm" aria-label={t('partnershell.nav.main')}>
          <div className="max-w-[980px] mx-auto px-4 sm:px-6">
            <div className="flex gap-1 sm:gap-4 overflow-x-auto no-scrollbar">
              {tabs.map((tab) => { /* P12: tabs (camelCase) */
                const Icon = tab.Icon;
                const isActive = activeTab === tab.id;

                return (
                  <Link
                    key={tab.id}
                    to={tab.path}
                    aria-label={tab.label} /* P11: accessible label for mobile */
                    aria-current={isActive ? 'page' : undefined} /* P11: current page indicator */
                    className={cn( /* P8: cn() utility */
                      'flex items-center justify-center gap-2 px-3 sm:px-4 py-3 border-b-2 transition-colors whitespace-nowrap',
                      isActive
                        ? 'border-indigo-600 text-indigo-600 font-semibold'
                        : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 font-medium'
                    )}
                  >
                    <Icon className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" /> {/* P11: decorative */}
                    <span className="hidden sm:inline text-sm">{tab.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </nav>

        {/* Page content */}
        <main className="max-w-[980px] mx-auto px-4 sm:px-6 py-4 sm:py-6">
          {children}
        </main>
      </div>
    </PartnerAccessContext.Provider>
  );
}
