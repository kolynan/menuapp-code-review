import { useState, useEffect, useMemo, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import PartnerShell, { usePartnerAccess } from "@/components/PartnerShell";
import { useI18n } from "@/components/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Check, Gift } from "lucide-react";

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

  const [saveStatus, setSaveStatus] = useState("idle");

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
      setFormData({
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
      });
    }
  }, [partner]);

  const saveMutation = useMutation({
    mutationFn: (data) => base44.entities.Partner.update(partnerId, data),
    onSuccess: () => {
      // FIX BUG-PL-001: allow re-seeding after save to pick up server-normalized values
      formSeeded.current = false;
      queryClient.invalidateQueries({ queryKey: ["partner", partnerId] });
      setSaveStatus("success");
      toast.success(t("toast.saved"), { id: "mm1" });
      setTimeout(() => setSaveStatus("idle"), 2000);
    },
    onError: () => {
      toast.error(t("toast.error"), { id: "mm1" });
      setSaveStatus("idle");
    },
  });

  // FIX BUG-PL-003: validate numeric fields before save to prevent NaN corruption
  const NUMERIC_FIELDS = [
    "loyalty_order_percent", "loyalty_review_points", "loyalty_redeem_rate",
    "loyalty_max_redeem_percent", "loyalty_expiry_days", "discount_percent",
  ];

  const handleSave = () => {
    if (saveStatus === "saving") return;

    for (const field of NUMERIC_FIELDS) {
      const val = formData[field];
      const isInvalid = val === "" || val === null || val === undefined || isNaN(val) || val < 0;
      // expiry_days must be >= 1 (0 days = instant expiry, corrupts loyalty data)
      const requiresPositive = field === "loyalty_expiry_days";
      if (isInvalid || (requiresPositive && val <= 0)) {
        toast.error(t("error.invalid_number"), { id: "mm1" });
        return;
      }
    }

    setSaveStatus("saving");
    saveMutation.mutate(formData);
  };

  // FIX BUG-PL-002: compare against null (not formData self-reference) so null fields detect changes
  const hasChanges = useMemo(() => {
    if (!partner) return false;
    return Object.keys(formData).some(key => {
      const serverVal = partner[key] ?? null;
      const localVal = formData[key] ?? null;
      return String(serverVal) !== String(localVal);
    });
  }, [formData, partner]);

  if (loadingPartner || loadingStats) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          🎁 {t("loyalty.title")}
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
                  className="w-32"
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
                className="w-32"
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
                className="w-32"
              />
              <span className="text-slate-500">₸</span>
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
                className="w-32"
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
                className="w-32"
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
                    className="w-32"
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

      {/* Save button — sticky at bottom for mobile */}
      <div className="sticky bottom-0 z-10 bg-white border-t border-slate-200 py-3">
        <Button
          onClick={handleSave}
          disabled={!hasChanges || saveStatus === "saving"}
          className="w-full sm:w-auto min-w-[120px] min-h-[44px]"
        >
          {saveStatus === "saving" ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              {t("common.saving")}
            </>
          ) : saveStatus === "success" ? (
            <>
              <Check className="w-4 h-4 mr-2" />
              {t("common.saved")}
            </>
          ) : (
            t("common.save")
          )}
        </Button>
      </div>
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