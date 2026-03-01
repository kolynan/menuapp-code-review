// ================================
// pages/partnercontacts.jsx — DEPRECATED
// Contacts have been merged into PartnerSettings (Contacts tab)
// This page redirects to /partnersettings
// ================================

import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useI18n } from "@/components/i18n";

export default function PartnerContacts() {
  const navigate = useNavigate();
  const { t } = useI18n();

  useEffect(() => {
    navigate("/partnersettings", { replace: true });
  }, [navigate]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="text-center space-y-3">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400 mx-auto" />
        <p className="text-sm text-slate-500">
          {t('partnercontacts.redirect', 'Перенаправление в настройки...')}
        </p>
      </div>
    </div>
  );
}
