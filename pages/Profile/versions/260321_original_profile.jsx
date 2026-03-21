// ============================================================
// BLOCK 00 — IMPORTS & CONSTANTS
// ============================================================

import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useI18n } from "@/components/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, AlertCircle, Loader2, Check } from "lucide-react";
import { toast } from "sonner";
import PartnerShell from "@/components/PartnerShell";

const GLOBAL_ADMIN_PARTNER = "global_admin";
const BACK_ROUTE = "/partnerhome";

const ROLE_BADGE_CLASSES = {
  admin: "bg-red-100 text-red-800",
  partner_owner: "bg-purple-100 text-purple-800",
  partner_manager: "bg-blue-100 text-blue-800",
  partner_staff: "bg-green-100 text-green-800",
  kitchen: "bg-orange-100 text-orange-800",
};

// ============================================================
// BLOCK 01 — MAIN COMPONENT
// ============================================================

/**
 * ProfileContent — inner component rendered inside PartnerShell.
 * Loads and displays the current user's profile (name, email, role, restaurant).
 * Allows editing the full name field and saving changes via base44.auth.updateMe().
 */
function ProfileContent() {
  const navigate = useNavigate();
  const { t } = useI18n();

  // Safe translation with fallback (t() returns key when missing)
  const tr = (key, fallback) => {
    const val = typeof t === "function" ? t(key) : "";
    if (!val || typeof val !== "string") return fallback;
    const norm = val.trim();
    if (norm === key || norm.startsWith(key + ":")) return fallback;
    return norm;
  };

  const [user, setUser] = useState(null);
  const [partnerName, setPartnerName] = useState(null);
  const [fullName, setFullName] = useState("");
  const [initialFullName, setInitialFullName] = useState("");
  const [isUserLoading, setIsUserLoading] = useState(true);
  const [isLoadError, setIsLoadError] = useState(false);
  const [isPartnerLoading, setIsPartnerLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState("idle"); // idle | saving | success
  const timerRef = useRef(null);
  const isMountedRef = useRef(true);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  // ============================================================
  // BLOCK 02 — DATA LOADING
  // ============================================================

  useEffect(() => {
    let isMounted = true;
    const loadUser = async () => {
      try {
        const userData = await base44.auth.me();
        if (!isMounted) return;
        setUser(userData);
        setFullName((userData.full_name || "").trim());
        setInitialFullName((userData.full_name || "").trim());

        if (isMounted) setIsUserLoading(false);

        // Load partner name if exists
        if (userData.partner && userData.partner !== GLOBAL_ADMIN_PARTNER) {
          if (isMounted) setIsPartnerLoading(true);
          try {
            const partner = await base44.entities.Partner.get(userData.partner);
            if (isMounted && partner) {
              setPartnerName(partner.name);
            }
          } catch (err) {
            // Partner load failed — falls back to "no restaurant" label
          } finally {
            if (isMounted) setIsPartnerLoading(false);
          }
        }
      } catch (error) {
        if (!isMounted) return;
        setIsLoadError(true);
        setIsUserLoading(false);
      }
    };

    loadUser();
    return () => { isMounted = false; };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ============================================================
  // BLOCK 03 — HANDLERS
  // ============================================================

  const hasChanges = fullName.trim() !== initialFullName;
  const canSave = hasChanges && fullName.trim().length > 0;

  const handleSave = async () => {
    if (!canSave || saveStatus === "saving") return;

    setSaveStatus("saving");
    try {
      await base44.auth.updateMe({ full_name: fullName.trim() });
      if (!isMountedRef.current) return;
      setInitialFullName(fullName.trim());
      setSaveStatus("success");
      toast.success(tr("toast.saved", "Сохранено"), { id: "mm1" });

      timerRef.current = setTimeout(() => {
        if (isMountedRef.current) setSaveStatus("idle");
      }, 2000);
    } catch (error) {
      if (!isMountedRef.current) return;
      toast.error(tr("toast.error", "Ошибка"), { id: "mm1" });
      setSaveStatus("idle");
    }
  };

  const getRoleLabel = (userRole) => {
    if (!userRole) return tr("profile.role.unknown", "Неизвестная роль");
    return tr(`profile.role.${userRole}`, userRole);
  };

  const getRoleBadgeClass = (userRole) => {
    return ROLE_BADGE_CLASSES[userRole] || "bg-gray-100 text-gray-800";
  };

  // ============================================================
  // BLOCK 04 — LOADING STATE
  // ============================================================

  if (isUserLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center gap-2 text-gray-500" role="status" aria-live="polite">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>{tr("common.loading", "Загрузка...")}</span>
        </div>
      </div>
    );
  }

  if (isLoadError) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4 p-4" role="alert">
        <AlertCircle className="w-10 h-10 text-red-400" />
        <p className="text-gray-600 text-center">{tr("profile.load_error", "Не удалось загрузить профиль")}</p>
        <Button
          variant="outline"
          onClick={() => navigate(BACK_ROUTE)}
          className="min-h-[44px] min-w-[44px]"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          {tr("common.back", "Назад")}
        </Button>
      </div>
    );
  }

  // ============================================================
  // BLOCK 05 — SAVE BUTTON CONTENT
  // ============================================================

  const getSaveButtonContent = () => {
    if (saveStatus === "saving") {
      return (
        <>
          <Loader2 className="w-4 h-4 animate-spin mr-2" />
          {tr("common.saving", "Сохранение...")}
        </>
      );
    }
    if (saveStatus === "success") {
      return (
        <>
          <Check className="w-4 h-4 mr-2" />
          {tr("common.saved", "Сохранено")}
        </>
      );
    }
    return tr("common.save", "Сохранить");
  };

  // ============================================================
  // BLOCK 06 — RENDER
  // ============================================================

  const restaurantDisplay = partnerName || tr("profile.no_restaurant", "Не привязан");

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-4 py-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(BACK_ROUTE)}
          className="flex items-center gap-1 -ml-2 min-h-[44px]"
        >
          <ArrowLeft className="w-4 h-4" />
          {tr("common.back", "Назад")}
        </Button>
      </div>

      {/* Content */}
      <div className="p-4 max-w-lg mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>{tr("profile.title", "Профиль")}</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
            {/* Full Name - editable */}
            <div className="space-y-2">
              <Label htmlFor="fullName">{tr("profile.full_name", "Полное имя")}</Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="min-h-[44px]"
              />
            </div>

            {/* Email - readonly */}
            <div className="space-y-2">
              <Label htmlFor="email">{tr("profile.email", "Email")}</Label>
              <Input
                id="email"
                value={user?.email || ""}
                readOnly
                className="bg-gray-50 text-gray-600 min-h-[44px]"
              />
            </div>

            {/* Role - badge */}
            <div className="space-y-2">
              <p className="text-sm font-medium">{tr("profile.role", "Роль")}</p>
              <div>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeClass(user?.user_role)}`}
                >
                  {getRoleLabel(user?.user_role)}
                </span>
              </div>
            </div>

            {/* Restaurant - text */}
            <div className="space-y-2">
              <p className="text-sm font-medium">{tr("profile.restaurant", "Ресторан")}</p>
              {isPartnerLoading ? (
                <div className="flex items-center gap-1 text-gray-400" role="status" aria-live="polite">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  <span className="text-sm">{tr("common.loading", "Загрузка...")}</span>
                </div>
              ) : (
                <p className="text-sm text-gray-700">{restaurantDisplay}</p>
              )}
            </div>

              {/* Save Button */}
              <Button
                type="submit"
                disabled={!canSave || saveStatus !== "idle"}
                className="w-full min-h-[44px]"
              >
                {getSaveButtonContent()}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ============================================================
// BLOCK 07 — PARTNERSHELL WRAPPER
// ============================================================

/**
 * Profile — default export. Wraps ProfileContent in PartnerShell
 * to provide partner context, navigation tabs, and auth gating.
 */
export default function Profile() {
  return (
    <PartnerShell>
      <ProfileContent />
    </PartnerShell>
  );
}
