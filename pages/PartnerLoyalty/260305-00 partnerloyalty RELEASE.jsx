import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import PartnerShell, { usePartnerAccess } from "@/components/PartnerShell";
import { useI18n } from "@/components/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Loader2, Check, Gift, AlertTriangle } from "lucide-react";

/* ============================================================
   STICKY SAVE BAR COMPONENT
   5 states: idle | dirty | saving | saved | error
   ============================================================ */

const BAR_STYLES = {
  idle: "bg-slate-50/80 border-slate-200",
  dirty: "bg-white border-amber-300 shadow-[0_-2px_10px_rgba(0,0,0,0.1)]",
  saving: "bg-white border-blue-300 shadow-[0_-2px_10px_rgba(0,0,0,0.05)]",
  saved: "bg-green-50/90 border-green-300",
  error: "bg-red-50 border-red-300 shadow-[0_-2px_10px_rgba(0,0,0,0.1)]",
};

const TEXT_STYLES = {
  idle: "text-slate-400",
  dirty: "text-amber-600",
  saving: "text-blue-600",
  saved: "text-green-600",
  error: "text-red-600",
};

function StickySaveBar({ barState, onSave, onRetry, onCancel, t }) {
  const statusIcon = {
    idle: <Check className="h-4 w-4" />,
    dirty: <AlertTriangle className="h-4 w-4" />,
    saving: <Loader2 className="h-4 w-4 animate-spin" />,
    saved: <Check className="h-4 w-4" />,
    error: <AlertTriangle className="h-4 w-4" />,
  };

  const statusText = {
    idle: t("common.stickySave.status.idle"),
    dirty: t("common.stickySave.status.changed"),
    saving: t("common.stickySave.status.saving"),
    saved: t("common.stickySave.status.saved"),
    error: t("common.stickySave.status.error"),
  };

  return (
    <div className={`fixed bottom-0 left-0 right-0 z-50 border-t transition-all ${BAR_STYLES[barState]}`}>
      <div className="mx-auto max-w-2xl flex items-center justify-between gap-3 px-4 py-3">
        <div className={`flex items-center gap-2 text-sm font-medium ${TEXT_STYLES[barState]}`}>
          {statusIcon[barState]}
          <span>{statusText[barState]}</span>
        </div>
        <div className="flex gap-2">
          {(barState === "dirty" || barState === "error") && (
            <Button
              variant="outline"
              size="sm"
              onClick={onCancel}
              className="min-h-[44px] px-4"
            >
              {t("common.stickySave.action.cancel")}
            </Button>
          )}
          <Button
            size="sm"
            onClick={barState === "error" ? onRetry : onSave}
            disabled={barState === "idle" || barState === "saving" || barState === "saved"}
            className="min-h-[44px] px-4"
          >
            {barState === "saving" ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" />{t("common.stickySave.action.save")}</>
            ) : barState === "error" ? (
              t("common.stickySave.action.retry")
            ) : (
              t("common.stickySave.action.save")
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   MAIN CONTENT
   ============================================================ */

function PartnerLoyaltyContent() {
  const { partnerId } = usePartnerAccess();
  const { t } = useI18n();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    loyalty_enabled: false,
    loyalty_order_percent: 5,
    loyalty_review_enabled: false,
    loyalty_review_points: 10,
    loyalty_redeem_rate: 1,
    loyalty_max_redeem_percent: 100,
    loyalty_expiry_days: 100,
    discount_enabled: false,
    discount_percent: 5,
    discount_allow_anonymous: false,
  });

  // Save status: idle | saving | saved | error
  const [saveStatus, setSaveStatus] = useState("idle");
  // Snapshot of last saved form data for dirty detection
  const [lastSaved, setLastSaved] = useState(null);
  // Financial fields confirm dialog
  const [showLoyaltyConfirm, setShowLoyaltyConfirm] = useState(false);

  const { data: partner, isLoading: loadingPartner } = useQuery({
    queryKey: ["partner", partnerId],
    queryFn: () => base44.entities.Partner.get(partnerId),
    enabled: !!partnerId,
  });

  const { data: stats, isLoading: loadingStats } = useQuery({
    queryKey: ["loyaltyStats", partnerId],
    queryFn: async () => {
      const [accounts, feedbacks] = await Promise.all([
        base44.entities.LoyaltyAccount.filter({ partner: partnerId }),
        base44.entities.DishFeedback.filter({ partner: partnerId }),
      ]);

      const totalEarned = (accounts || []).reduce((sum, a) => sum + (a.total_earned || 0), 0);
      const totalSpent = (accounts || []).reduce((sum, a) => sum + (a.total_spent || 0), 0);
      const totalExpired = (accounts || []).reduce((sum, a) => sum + (a.total_expired || 0), 0);

      return {
        clientsCount: (accounts || []).length,
        totalEarned,
        totalSpent,
        totalExpired,
        reviewsCount: (feedbacks || []).length,
      };
    },
    enabled: !!partnerId,
  });

  // FIX BUG-PL-001: seed form only once to prevent background refetch from discarding unsaved edits
  const formSeeded = useRef(false);

  useEffect(() => {
    if (partner && !formSeeded.current) {
      formSeeded.current = true;
      const snapshot = {
        loyalty_enabled: partner.loyalty_enabled ?? false,
        loyalty_order_percent: partner.loyalty_order_percent ?? 5,
        loyalty_review_enabled: partner.loyalty_review_enabled ?? false,
        loyalty_review_points: partner.loyalty_review_points ?? 10,
        loyalty_redeem_rate: partner.loyalty_redeem_rate ?? 1,
        loyalty_max_redeem_percent: partner.loyalty_max_redeem_percent ?? 100,
        loyalty_expiry_days: partner.loyalty_expiry_days ?? 100,
        discount_enabled: partner.discount_enabled ?? false,
        discount_percent: partner.discount_percent ?? 5,
        discount_allow_anonymous: partner.discount_allow_anonymous ?? false,
      };
      setFormData(snapshot);
      setLastSaved({ ...snapshot });
    }
  }, [partner]);

  const saveMutation = useMutation({
    mutationFn: (data) => base44.entities.Partner.update(partnerId, data),
    onSuccess: (_, variables) => {
      // FIX BUG-PL-001: allow re-seeding after save to pick up server-normalized values
      formSeeded.current = false;
      setLastSaved({ ...variables });
      queryClient.invalidateQueries({ queryKey: ["partner", partnerId] });
      setSaveStatus("saved");
      toast.success(t("partnerloyalty.toast.saved"), { id: "mm1" });
      setTimeout(() => setSaveStatus("idle"), 2000);
    },
    onError: () => {
      setSaveStatus("error");
      toast.error(t("common.stickySave.toast.error_generic"), { id: "mm1" });
    },
  });

  /* ---- Dirty detection ---- */

  const isDirty = useMemo(() => {
    if (!lastSaved) return false;
    return Object.keys(formData).some(key =>
      String(formData[key] ?? "") !== String(lastSaved[key] ?? "")
    );
  }, [formData, lastSaved]);

  // Check if financial fields specifically changed (need confirm before save)
  const FINANCIAL_FIELDS = ["discount_percent", "loyalty_order_percent", "loyalty_max_redeem_percent"];

  const financialFieldsChanged = useMemo(() => {
    if (!lastSaved) return false;
    return FINANCIAL_FIELDS.some(key =>
      String(formData[key] ?? "") !== String(lastSaved[key] ?? "")
    );
  }, [formData, lastSaved]);

  /* ---- Bar state machine ---- */

  const barState = useMemo(() => {
    if (saveStatus === "saving") return "saving";
    if (saveStatus === "error") return "error";
    if (isDirty) return "dirty";
    if (saveStatus === "saved") return "saved";
    return "idle";
  }, [saveStatus, isDirty]);

  /* ---- Validation ---- */

  // FIX BUG-PL-003: validate numeric fields before save to prevent NaN corruption
  const NUMERIC_FIELDS = [
    "loyalty_order_percent", "loyalty_review_points", "loyalty_redeem_rate",
    "loyalty_max_redeem_percent", "loyalty_expiry_days", "discount_percent",
  ];

  const validate = useCallback(() => {
    for (const field of NUMERIC_FIELDS) {
      const val = formData[field];
      const isInvalid = val === "" || val === null || val === undefined || isNaN(val) || val < 0;
      // expiry_days must be >= 1 (0 days = instant expiry, corrupts loyalty data)
      const requiresPositive = field === "loyalty_expiry_days";
      if (isInvalid || (requiresPositive && val <= 0)) {
        toast.error(t("common.stickySave.toast.validation_generic"), { id: "mm1" });
        const el = document.getElementById(field);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
          el.focus();
        }
        return false;
      }
    }
    return true;
  }, [formData, t]);

  /* ---- Save actions ---- */

  const doSave = useCallback(() => {
    setSaveStatus("saving");
    saveMutation.mutate({ ...formData });
  }, [formData, saveMutation]);

  // Save with optional financial-fields confirm
  const handleSave = useCallback(() => {
    if (saveStatus === "saving") return;
    if (!validate()) return;
    if (financialFieldsChanged) {
      setShowLoyaltyConfirm(true);
      return;
    }
    doSave();
  }, [saveStatus, validate, financialFieldsChanged, doSave]);

  // Retry after error
  const handleRetry = useCallback(() => {
    if (!validate()) return;
    doSave();
  }, [validate, doSave]);

  // Cancel — restore from snapshot
  const handleCancel = useCallback(() => {
    if (lastSaved) {
      setFormData({ ...lastSaved });
    }
    setSaveStatus("idle");
  }, [lastSaved]);

  /* ---- Prevent leaving with unsaved changes ---- */

  useEffect(() => {
    if (!isDirty) return;
    const handler = (e) => { e.preventDefault(); };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirty]);

  /* ---- Loading ---- */

  if (loadingPartner || loadingStats) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-24">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          {t("loyalty.title")}
        </h1>
      </div>

      {/* Section 1: Bonus Points */}
      <Card>
        <CardHeader>
          <CardTitle>{t("loyalty.bonus.title")}</CardTitle>
          <CardDescription>{t("loyalty.bonus.description")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2 min-h-[44px]">
            <Checkbox
              id="loyalty_enabled"
              checked={formData.loyalty_enabled}
              onCheckedChange={(val) => setFormData(prev => ({ ...prev, loyalty_enabled: val }))}
            />
            <Label htmlFor="loyalty_enabled" className="cursor-pointer">
              {t("loyalty.bonus.enable")}
            </Label>
          </div>

          {formData.loyalty_enabled && (
            <div className="space-y-2">
              <Label htmlFor="loyalty_order_percent">{t("loyalty.bonus.percent")}</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="loyalty_order_percent"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.loyalty_order_percent}
                  onChange={(e) => setFormData(prev => ({ ...prev, loyalty_order_percent: Number(e.target.value) }))}
                  className="w-32 min-h-[44px]"
                />
                <span className="text-slate-500">%</span>
              </div>
              <p className="text-xs text-slate-500">{t("loyalty.bonus.percent_help")}</p>
            </div>
          )}

          <div className="flex items-center gap-2 min-h-[44px]">
            <Checkbox
              id="loyalty_review_enabled"
              checked={formData.loyalty_review_enabled}
              onCheckedChange={(val) => setFormData(prev => ({ ...prev, loyalty_review_enabled: val }))}
            />
            <Label htmlFor="loyalty_review_enabled" className="cursor-pointer">
              {t("loyalty.bonus.review_enable")}
            </Label>
          </div>

          {formData.loyalty_review_enabled && (
            <div className="space-y-2">
              <Label htmlFor="loyalty_review_points">{t("loyalty.bonus.review_points")}</Label>
              <Input
                id="loyalty_review_points"
                type="number"
                min="0"
                value={formData.loyalty_review_points}
                onChange={(e) => setFormData(prev => ({ ...prev, loyalty_review_points: Number(e.target.value) }))}
                className="w-32 min-h-[44px]"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Section 2: Spending Points */}
      <Card>
        <CardHeader>
          <CardTitle>{t("loyalty.redeem.title")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="loyalty_redeem_rate">{t("loyalty.redeem.rate")}</Label>
            <div className="flex items-center gap-2">
              <Input
                id="loyalty_redeem_rate"
                type="number"
                min="0"
                step="0.1"
                value={formData.loyalty_redeem_rate}
                onChange={(e) => setFormData(prev => ({ ...prev, loyalty_redeem_rate: Number(e.target.value) }))}
                className="w-32 min-h-[44px]"
              />
              <span className="text-slate-500">{"\u20B8"}</span>
            </div>
            <p className="text-xs text-slate-500">{t("loyalty.redeem.rate_help")}</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="loyalty_max_redeem_percent">{t("loyalty.redeem.max_percent")}</Label>
            <div className="flex items-center gap-2">
              <Input
                id="loyalty_max_redeem_percent"
                type="number"
                min="0"
                max="100"
                value={formData.loyalty_max_redeem_percent}
                onChange={(e) => setFormData(prev => ({ ...prev, loyalty_max_redeem_percent: Number(e.target.value) }))}
                className="w-32 min-h-[44px]"
              />
              <span className="text-slate-500">%</span>
            </div>
            <p className="text-xs text-slate-500">{t("loyalty.redeem.max_help")}</p>
          </div>
        </CardContent>
      </Card>

      {/* Section 3: Expiration */}
      <Card>
        <CardHeader>
          <CardTitle>{t("loyalty.expiry.title")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="loyalty_expiry_days">{t("loyalty.expiry.days")}</Label>
            <div className="flex items-center gap-2">
              <Input
                id="loyalty_expiry_days"
                type="number"
                min="1"
                value={formData.loyalty_expiry_days}
                onChange={(e) => setFormData(prev => ({ ...prev, loyalty_expiry_days: Number(e.target.value) }))}
                className="w-32 min-h-[44px]"
              />
              <span className="text-slate-500">{t("loyalty.expiry.days_suffix")}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section 4: Instant Discount */}
      <Card>
        <CardHeader>
          <CardTitle>{t("loyalty.discount.title")}</CardTitle>
          <CardDescription>{t("loyalty.discount.description")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2 min-h-[44px]">
            <Checkbox
              id="discount_enabled"
              checked={formData.discount_enabled}
              onCheckedChange={(val) => setFormData(prev => ({ ...prev, discount_enabled: val }))}
            />
            <Label htmlFor="discount_enabled" className="cursor-pointer">
              {t("loyalty.discount.enable")}
            </Label>
          </div>

          {formData.discount_enabled && (
            <>
              <div className="space-y-2">
                <Label htmlFor="discount_percent">{t("loyalty.discount.percent")}</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="discount_percent"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.discount_percent}
                    onChange={(e) => setFormData(prev => ({ ...prev, discount_percent: Number(e.target.value) }))}
                    className="w-32 min-h-[44px]"
                  />
                  <span className="text-slate-500">%</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 min-h-[44px]">
                  <Checkbox
                    id="discount_allow_anonymous"
                    checked={formData.discount_allow_anonymous}
                    onCheckedChange={(val) => setFormData(prev => ({ ...prev, discount_allow_anonymous: val }))}
                  />
                  <Label htmlFor="discount_allow_anonymous" className="cursor-pointer">
                    {t("loyalty.discount.anonymous")}
                  </Label>
                </div>
                <p className="text-xs text-slate-500">{t("loyalty.discount.anonymous_help")}</p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Section 5: Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>{t("loyalty.stats.title")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-slate-50 p-4 rounded-lg">
              <div className="text-sm text-slate-500">{t("loyalty.stats.clients")}</div>
              <div className="text-2xl font-bold text-slate-900">{stats?.clientsCount || 0}</div>
            </div>
            <div className="bg-slate-50 p-4 rounded-lg">
              <div className="text-sm text-slate-500">{t("loyalty.stats.total_earned")}</div>
              <div className="text-2xl font-bold text-green-600">{stats?.totalEarned || 0} {t("loyalty.stats.points")}</div>
            </div>
            <div className="bg-slate-50 p-4 rounded-lg">
              <div className="text-sm text-slate-500">{t("loyalty.stats.total_spent")}</div>
              <div className="text-2xl font-bold text-indigo-600">{stats?.totalSpent || 0} {t("loyalty.stats.points")}</div>
            </div>
            <div className="bg-slate-50 p-4 rounded-lg">
              <div className="text-sm text-slate-500">{t("loyalty.stats.total_expired")}</div>
              <div className="text-2xl font-bold text-amber-600">{stats?.totalExpired || 0} {t("loyalty.stats.points")}</div>
            </div>
            <div className="bg-slate-50 p-4 rounded-lg">
              <div className="text-sm text-slate-500">{t("loyalty.stats.reviews")}</div>
              <div className="text-2xl font-bold text-slate-900">{stats?.reviewsCount || 0}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sticky Save Bar */}
      <StickySaveBar
        barState={barState}
        onSave={handleSave}
        onRetry={handleRetry}
        onCancel={handleCancel}
        t={t}
      />

      {/* Financial Confirm Dialog */}
      <Dialog open={showLoyaltyConfirm} onOpenChange={setShowLoyaltyConfirm}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{t("partnerloyalty.confirmChange.title")}</DialogTitle>
            <DialogDescription>{t("partnerloyalty.confirmChange.body")}</DialogDescription>
          </DialogHeader>
          <div className="flex gap-2 pt-4 justify-end">
            <Button variant="outline" onClick={() => setShowLoyaltyConfirm(false)} className="min-h-[44px]">
              {t("common.cancel")}
            </Button>
            <Button onClick={() => { setShowLoyaltyConfirm(false); doSave(); }} className="min-h-[44px]">
              {t("common.save")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function PartnerLoyalty() {
  return (
    <PartnerShell activeTab="loyalty">
      <PartnerLoyaltyContent />
    </PartnerShell>
  );
}
