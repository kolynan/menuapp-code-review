// ============================================================
// BLOCK 00 — IMPORTS & CONSTANTS
// ============================================================

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useI18n } from "@/components/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Loader2, Check } from "lucide-react";
import { toast } from "sonner";

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

export default function Profile() {
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
  const [isLoading, setIsLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState("idle"); // idle | saving | success

  // ============================================================
  // BLOCK 02 — DATA LOADING
  // ============================================================

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await base44.auth.me();
        setUser(userData);
        setFullName(userData.full_name || "");
        setInitialFullName(userData.full_name || "");

        // Load partner name if exists
        if (userData.partner && userData.partner !== "global_admin") {
          try {
            const partner = await base44.entities.Partner.get(userData.partner);
            if (partner) {
              setPartnerName(partner.name);
            }
          } catch (err) {
            console.error("Failed to load partner:", err);
          }
        }
      } catch (error) {
        console.error("Failed to load user:", error);
        toast.error(tr("toast.error", "Ошибка"), { id: "mm1" });
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, [t]);

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
      setInitialFullName(fullName.trim());
      setSaveStatus("success");
      toast.success(tr("toast.profile_saved", "Профиль сохранён"), { id: "mm1" });

      setTimeout(() => setSaveStatus("idle"), 2000);
    } catch (error) {
      console.error("Failed to save:", error);
      toast.error(tr("toast.error", "Ошибка"), { id: "mm1" });
      setSaveStatus("idle");
    }
  };

  const getRoleLabel = (userRole) => {
    return tr(`profile.role.${userRole}`, userRole);
  };

  const getRoleBadgeClass = (userRole) => {
    return ROLE_BADGE_CLASSES[userRole] || "bg-gray-100 text-gray-800";
  };

  // ============================================================
  // BLOCK 04 — LOADING STATE
  // ============================================================

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center gap-2 text-gray-500">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>{tr("common.loading", "Загрузка...")}</span>
        </div>
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
          onClick={() => navigate("/partnerhome")}
          className="flex items-center gap-1 -ml-2"
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
          <CardContent className="space-y-4">
            {/* Full Name - editable */}
            <div className="space-y-2">
              <Label htmlFor="fullName">{tr("profile.fullName", "Полное имя")}</Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                autoFocus
              />
            </div>

            {/* Email - readonly */}
            <div className="space-y-2">
              <Label htmlFor="email">{tr("profile.email", "Email")}</Label>
              <Input
                id="email"
                value={user?.email || ""}
                readOnly
                className="bg-gray-50 text-gray-600"
              />
            </div>

            {/* Role - badge */}
            <div className="space-y-2">
              <Label>{tr("profile.role", "Роль")}</Label>
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
              <Label>{tr("profile.restaurant", "Ресторан")}</Label>
              <p className="text-sm text-gray-700">{restaurantDisplay}</p>
            </div>

            {/* Save Button */}
            <Button
              onClick={handleSave}
              disabled={!canSave || saveStatus !== "idle"}
              className="w-full"
            >
              {getSaveButtonContent()}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
