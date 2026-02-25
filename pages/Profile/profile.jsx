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
import { ArrowLeft, Loader2, Check, AlertCircle } from "lucide-react";
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

  const [user, setUser] = useState(null);
  const [partnerName, setPartnerName] = useState(null);
  const [fullName, setFullName] = useState("");
  const [initialFullName, setInitialFullName] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
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
        setLoadError(true);
        toast.error(t("toast.error"), { id: "mm1" });
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      toast.success(t("toast.saved"), { id: "mm1" });

      setTimeout(() => setSaveStatus("idle"), 2000);
    } catch (error) {
      console.error("Failed to save:", error);
      toast.error(t("toast.error"), { id: "mm1" });
      setSaveStatus("idle");
    }
  };

  const getRoleLabel = (userRole) => {
    if (!userRole) return t("profile.role.unknown");
    return t(`profile.role.${userRole}`);
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
          <span>{t("common.loading")}</span>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-gray-500">
          <AlertCircle className="w-8 h-8 text-red-400" />
          <p className="text-sm">{t("profile.load_error")}</p>
          <Button variant="outline" size="sm" onClick={() => navigate("/partnerhome")}>
            {t("common.back")}
          </Button>
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
          {t("common.saving")}
        </>
      );
    }
    if (saveStatus === "success") {
      return (
        <>
          <Check className="w-4 h-4 mr-2" />
          {t("common.saved")}
        </>
      );
    }
    return t("common.save");
  };

  // ============================================================
  // BLOCK 06 — RENDER
  // ============================================================

  const restaurantDisplay = partnerName || t("profile.no_restaurant");

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
          {t("common.back")}
        </Button>
      </div>

      {/* Content */}
      <div className="p-4 max-w-lg mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>{t("profile.title")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Full Name - editable */}
            <div className="space-y-2">
              <Label htmlFor="fullName">{t("profile.fullName")}</Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                autoFocus
              />
            </div>

            {/* Email - readonly */}
            <div className="space-y-2">
              <Label htmlFor="email">{t("profile.email")}</Label>
              <Input
                id="email"
                value={user?.email || ""}
                readOnly
                className="bg-gray-50 text-gray-600"
              />
            </div>

            {/* Role - badge */}
            <div className="space-y-2">
              <Label>{t("profile.role")}</Label>
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
              <Label>{t("profile.restaurant")}</Label>
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
