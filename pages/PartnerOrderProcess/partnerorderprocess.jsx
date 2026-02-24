import React, { useState, useEffect, useMemo, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { 
  Plus, Pencil, Trash2, Lock, Loader2, AlertTriangle, RefreshCcw,
  ChevronUp, ChevronDown, GripVertical, ArrowRight,
  Utensils, Package, Truck
} from "lucide-react";
import PartnerShell, { usePartnerAccess } from "@/components/PartnerShell";
import { useI18n } from "@/components/i18n";

// ============================================================
// CONSTANTS
// ============================================================

const TOAST_ID = "mm1"; // FIX P0: использовать стандартный id
const ORDER_STEP = 10;

const STAGE_COLORS = [
  { name: "blue", value: "#3b82f6" },
  { name: "orange", value: "#f59e0b" },
  { name: "green", value: "#22c55e" },
  { name: "red", value: "#ef4444" },
  { name: "purple", value: "#8b5cf6" },
  { name: "gray", value: "#6b7280" },
];

const CHANNEL_FILTERS = [
  { key: "all", field: null },
  { key: "hall", field: "enabled_hall" },
  { key: "pickup", field: "enabled_pickup" },
  { key: "delivery", field: "enabled_delivery" },
];

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
  return failureCount < 2;
}

function isStart(stage) {
  return stage?.internal_code === "start";
}

function isFinish(stage) {
  return stage?.internal_code === "finish";
}

function isLocked(stage) {
  return isStart(stage) || isFinish(stage);
}

function isMiddle(stage) {
  return stage?.internal_code === "middle";
}

// FIX P1: Защита от undefined + убраны RU fallback
function getDisplayName(stage, t) {
  if (!stage) return t("orderprocess.default.stage");
  
  // Если name есть и не похож на ключ перевода — использовать напрямую
  if (stage.name && !stage.name.startsWith("orderprocess.")) {
    return stage.name;
  }
  
  // Если name есть и похож на ключ — пробуем перевести
  if (stage.name) {
    const translated = t(stage.name);
    if (translated && translated !== stage.name) {
      return translated;
    }
  }
  
  // Fallback по internal_code через i18n
  if (stage.internal_code === "start") return t("orderprocess.default.new");
  if (stage.internal_code === "finish") return t("orderprocess.default.served");
  
  return t("orderprocess.default.stage");
}

// FIX P1: Rebalance sort_order шагом ORDER_STEP
async function rebalanceSortOrder(stages, partnerId) {
  const sorted = [...stages].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
  const updates = [];
  
  for (let i = 0; i < sorted.length; i++) {
    const expectedOrder = i * ORDER_STEP;
    if (sorted[i].sort_order !== expectedOrder) {
      updates.push({ id: sorted[i].id, sort_order: expectedOrder });
    }
  }
  
  // Batch update только изменённые
  for (const update of updates) {
    await base44.entities.OrderStage.update(update.id, { sort_order: update.sort_order });
  }
  
  return updates.length > 0;
}

// ============================================================
// PIPELINE PREVIEW COMPONENT
// ============================================================

function PipelinePreview({ stages, t }) {
  if (!stages || stages.length === 0) return null;

  return (
    <div className="bg-slate-50 rounded-lg p-4 mb-4 overflow-x-auto">
      <div className="flex items-center justify-center gap-2 min-w-max">
        {stages.map((stage, idx) => (
          <React.Fragment key={stage.id}>
            <div className="flex flex-col items-center">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm"
                style={{ backgroundColor: stage.color }}
              >
                {idx + 1}
              </div>
              <span className="text-xs text-slate-600 mt-1.5 max-w-[80px] truncate text-center">
                {getDisplayName(stage, t)}
              </span>
            </div>
            
            {idx < stages.length - 1 && (
              <ArrowRight className="h-5 w-5 text-slate-400 mx-1 flex-shrink-0" />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// CHANNEL FILTER COMPONENT
// ============================================================

function ChannelFilter({ value, onChange, t }) {
  const getLabel = (key) => {
    const labels = {
      all: t("orderprocess.filter.all"),
      hall: t("channel.hall"),
      pickup: t("channel.pickup"),
      delivery: t("channel.delivery"),
    };
    return labels[key] || key;
  };

  const getIcon = (key) => {
    const icons = {
      all: null,
      hall: <Utensils className="h-4 w-4" />,
      pickup: <Package className="h-4 w-4" />,
      delivery: <Truck className="h-4 w-4" />,
    };
    return icons[key];
  };

  return (
    <div className="flex items-center justify-center mb-4">
      <div className="inline-flex rounded-lg border bg-slate-100 p-1">
        {CHANNEL_FILTERS.map((filter) => {
          const isActive = value === filter.key;
          const icon = getIcon(filter.key);
          
          return (
            <button
              key={filter.key}
              onClick={() => onChange(filter.key)}
              className={`
                flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md transition-all
                ${isActive 
                  ? "bg-white text-slate-900 shadow-sm" 
                  : "text-slate-600 hover:text-slate-900"
                }
              `}
            >
              {icon}
              <span className="hidden sm:inline">{getLabel(filter.key)}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================
// STAGE ROW COMPONENT
// ============================================================

function StageRow({ 
  stage, 
  index, 
  canMoveUp, 
  canMoveDown,
  moveBusy,
  onEdit, 
  onDelete, 
  onMoveUp, 
  onMoveDown,
  onDragStart,
  onDragOver,
  onDrop,
  isDragOver,
  t 
}) {
  const locked = isLocked(stage);
  const middle = isMiddle(stage);

  const getRoleLabel = useCallback((role) => {
    const labels = {
      partner_staff: t("orderprocess.role.staff"),
      kitchen: t("orderprocess.role.kitchen"),
      partner_manager: t("orderprocess.role.manager"),
    };
    return labels[role] || role;
  }, [t]);

  return (
    <div
      className={`flex items-center gap-2 px-3 py-3 border-b last:border-b-0 hover:bg-slate-50 transition-colors ${
        isDragOver ? "bg-indigo-50 border-indigo-200" : ""
      }`}
      draggable={middle && !moveBusy}
      onDragStart={(e) => middle && !moveBusy && onDragStart(e, stage)}
      onDragOver={(e) => {
        if (middle) {
          e.preventDefault();
          onDragOver(stage.id);
        }
      }}
      onDragLeave={() => onDragOver(null)}
      onDrop={(e) => {
        e.preventDefault();
        onDrop(e, stage);
      }}
    >
      {/* Number */}
      <div className="w-6 text-center text-sm font-medium text-slate-400">
        {index + 1}
      </div>

      {/* Move buttons / Grip */}
      <div className="flex items-center w-10 justify-center">
        {middle ? (
          <>
            {/* Mobile: up/down buttons */}
            <div className="flex flex-col sm:hidden">
              <button
                onClick={() => canMoveUp && !moveBusy && onMoveUp(stage)}
                disabled={!canMoveUp || moveBusy}
                className={`p-0.5 ${canMoveUp && !moveBusy ? "text-slate-500 hover:text-slate-700" : "text-slate-200 cursor-not-allowed"}`}
                aria-label={t("orderprocess.aria.move_up")}
              >
                <ChevronUp className="h-4 w-4" />
              </button>
              <button
                onClick={() => canMoveDown && !moveBusy && onMoveDown(stage)}
                disabled={!canMoveDown || moveBusy}
                className={`p-0.5 ${canMoveDown && !moveBusy ? "text-slate-500 hover:text-slate-700" : "text-slate-200 cursor-not-allowed"}`}
                aria-label={t("orderprocess.aria.move_down")}
              >
                <ChevronDown className="h-4 w-4" />
              </button>
            </div>
            {/* Desktop: grip */}
            <div className={`hidden sm:flex ${moveBusy ? "cursor-not-allowed text-slate-200" : "cursor-grab active:cursor-grabbing text-slate-400 hover:text-slate-600"}`}>
              <GripVertical className="h-5 w-5" />
            </div>
          </>
        ) : (
          <div className="w-5 h-5" />
        )}
      </div>

      {/* Color dot + Name */}
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <div
          className="w-3.5 h-3.5 rounded-full flex-shrink-0 ring-2 ring-white shadow-sm"
          style={{ backgroundColor: stage.color }}
        />
        <span className="font-medium text-slate-800 truncate">
          {getDisplayName(stage, t)}
        </span>
        {locked && (
          <Lock className="h-3.5 w-3.5 text-amber-500 flex-shrink-0" />
        )}
      </div>

      {/* Channel badges */}
      <div className="hidden sm:flex items-center gap-1 flex-shrink-0">
        {stage.enabled_hall !== false && (
          <span className="p-1 rounded bg-blue-50 text-blue-600" title={t("channel.hall")}>
            <Utensils className="h-3.5 w-3.5" />
          </span>
        )}
        {stage.enabled_pickup !== false && (
          <span className="p-1 rounded bg-amber-50 text-amber-600" title={t("channel.pickup")}>
            <Package className="h-3.5 w-3.5" />
          </span>
        )}
        {stage.enabled_delivery !== false && (
          <span className="p-1 rounded bg-green-50 text-green-600" title={t("channel.delivery")}>
            <Truck className="h-3.5 w-3.5" />
          </span>
        )}
      </div>

      {/* Role badges */}
      <div className="hidden sm:flex items-center gap-1 flex-shrink-0 flex-wrap justify-end max-w-[200px]">
        {(stage.allowed_roles || []).map((role) => (
          <span
            key={role}
            className="px-2 py-0.5 text-xs rounded-full bg-slate-100 text-slate-600 whitespace-nowrap"
          >
            {getRoleLabel(role)}
          </span>
        ))}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 flex-shrink-0">
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9"
          onClick={() => onEdit(stage)}
          aria-label={t("orderprocess.aria.edit")}
        >
          <Pencil className="h-4 w-4 text-slate-500" />
        </Button>
        
        {middle && (
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 text-red-500 hover:text-red-600 hover:bg-red-50"
            onClick={() => onDelete(stage)}
            aria-label={t("orderprocess.aria.delete")}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}

// ============================================================
// EDIT DIALOG
// ============================================================

function EditStageDialog({ open, stage, onClose, onSave, saving, t }) {
  const [name, setName] = useState("");
  const [color, setColor] = useState("#3b82f6");
  const [roles, setRoles] = useState([]);
  const [channels, setChannels] = useState({
    enabled_hall: true,
    enabled_pickup: true,
    enabled_delivery: true,
  });

  const locked = isLocked(stage);
  const isNew = stage?.isNew === true;

  // Check if at least one channel is selected
  const hasValidChannels = channels.enabled_hall || channels.enabled_pickup || channels.enabled_delivery;

  useEffect(() => {
    if (stage) {
      const displayName = stage.isNew ? (stage.name || "") : getDisplayName(stage, t);
      setName(displayName);
      setColor(stage.color || "#3b82f6");
      setRoles(stage.allowed_roles || []);
      setChannels({
        enabled_hall: stage.enabled_hall !== false,
        enabled_pickup: stage.enabled_pickup !== false,
        enabled_delivery: stage.enabled_delivery !== false,
      });
    }
  }, [stage, t]);

  const toggleRole = (role) => {
    setRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
    );
  };

  const toggleChannel = (channel) => {
    setChannels((prev) => {
      const newValue = !prev[channel];
      const newChannels = { ...prev, [channel]: newValue };
      
      // Prevent unchecking if it's the last enabled channel
      const enabledCount = Object.values(newChannels).filter(Boolean).length;
      if (enabledCount === 0) {
        toast.error(t("orderprocess.error.min_one_channel"), { id: TOAST_ID });
        return prev;
      }
      
      return newChannels;
    });
  };

  const handleSave = () => {
    if (!name.trim()) {
      toast.error(t("error.enter_name"), { id: TOAST_ID });
      return;
    }
    if (roles.length === 0) {
      toast.error(t("orderprocess.error.select_role"), { id: TOAST_ID });
      return;
    }
    if (!hasValidChannels) {
      toast.error(t("orderprocess.error.min_one_channel"), { id: TOAST_ID });
      return;
    }
    onSave({ 
      name: name.trim(), 
      color, 
      allowed_roles: roles,
      enabled_hall: channels.enabled_hall,
      enabled_pickup: channels.enabled_pickup,
      enabled_delivery: channels.enabled_delivery,
    });
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSave();
    }
  };

  const ROLE_OPTIONS = [
    { value: "partner_staff", label: t("orderprocess.role.staff") },
    { value: "kitchen", label: t("orderprocess.role.kitchen") },
    { value: "partner_manager", label: t("orderprocess.role.manager") },
  ];

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      {/* FIX P1: sticky footer pattern */}
      <DialogContent className="sm:max-w-md max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>
            {isNew ? t("orderprocess.add_stage") : t("orderprocess.edit_stage")}
          </DialogTitle>
          {/* FIX P0: DialogDescription всегда рендерится */}
          <DialogDescription className={locked ? "flex items-center gap-2 text-amber-600" : "sr-only"}>
            {locked ? (
              <>
                <Lock className="h-4 w-4" />
                {t("orderprocess.locked_hint")}
              </>
            ) : (
              t("orderprocess.edit_description")
            )}
          </DialogDescription>
        </DialogHeader>

        {/* FIX P1: scrollable content area */}
        <div className="flex-1 overflow-y-auto space-y-4 py-4">
          {/* Name */}
          <div className="space-y-2">
            <Label>{t("orderprocess.stage_name")}</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t("orderprocess.stage_name_placeholder")}
              className="h-11"
              autoFocus
            />
          </div>

          {/* Color */}
          <div className="space-y-2">
            <Label>{t("orderprocess.stage_color")}</Label>
            <div className="flex flex-wrap gap-2">
              {STAGE_COLORS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setColor(c.value)}
                  className={`w-10 h-10 rounded-lg border-2 transition-all ${
                    color === c.value
                      ? "ring-2 ring-offset-2 ring-indigo-500 scale-110"
                      : "hover:scale-105"
                  }`}
                  style={{
                    backgroundColor: c.value,
                    borderColor: color === c.value ? c.value : "transparent",
                  }}
                  aria-label={c.name}
                />
              ))}
            </div>
          </div>

          {/* Roles */}
          <div className="space-y-2">
            <Label>{t("orderprocess.allowed_roles")}</Label>
            <div className="space-y-2">
              {ROLE_OPTIONS.map((role) => (
                <label
                  key={role.value}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 cursor-pointer"
                >
                  <Checkbox
                    checked={roles.includes(role.value)}
                    onCheckedChange={() => toggleRole(role.value)}
                  />
                  <span className="text-sm">{role.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div className="border-t pt-4">
            {/* Channels */}
            <div className="space-y-2">
              <Label>{t("orderprocess.channels")}</Label>
              <p className="text-xs text-slate-500 mb-2">
                {t("orderprocess.channels_hint")}
              </p>
              <div className="space-y-2">
                <label className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 cursor-pointer">
                  <Checkbox
                    checked={channels.enabled_hall}
                    onCheckedChange={() => toggleChannel("enabled_hall")}
                  />
                  <Utensils className="h-4 w-4 text-blue-600" />
                  <span className="text-sm">{t("channel.hall")}</span>
                </label>
                <label className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 cursor-pointer">
                  <Checkbox
                    checked={channels.enabled_pickup}
                    onCheckedChange={() => toggleChannel("enabled_pickup")}
                  />
                  <Package className="h-4 w-4 text-amber-600" />
                  <span className="text-sm">{t("channel.pickup")}</span>
                </label>
                <label className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 cursor-pointer">
                  <Checkbox
                    checked={channels.enabled_delivery}
                    onCheckedChange={() => toggleChannel("enabled_delivery")}
                  />
                  <Truck className="h-4 w-4 text-green-600" />
                  <span className="text-sm">{t("channel.delivery")}</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* FIX P1: sticky footer */}
        <DialogFooter className="flex-col sm:flex-row gap-2 pt-4 border-t mt-auto">
          <Button variant="outline" onClick={onClose} className="w-full sm:w-auto h-11">
            {t("common.cancel")}
          </Button>
          <Button onClick={handleSave} disabled={saving} className="w-full sm:w-auto h-11">
            {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {t("common.save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============================================================
// DELETE CONFIRM DIALOG
// ============================================================

function DeleteConfirmDialog({ open, stage, onClose, onConfirm, deleting, t }) {
  // FIX P1: использовать getDisplayName вместо stage.name
  const stageName = getDisplayName(stage, t);
  
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      {/* FIX P1: sticky footer pattern */}
      <DialogContent className="sm:max-w-sm max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            {t("orderprocess.delete_confirm_title")}
          </DialogTitle>
          {/* FIX P0: DialogDescription всегда рендерится */}
          <DialogDescription>
            {t("orderprocess.delete_confirm").replace("{name}", stageName)}
          </DialogDescription>
        </DialogHeader>
        
        {/* FIX P1: sticky footer */}
        <DialogFooter className="flex-col sm:flex-row gap-2 pt-4 border-t mt-auto">
          <Button variant="outline" onClick={onClose} className="w-full sm:w-auto h-11">
            {t("common.cancel")}
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={deleting}
            className="w-full sm:w-auto h-11"
          >
            {deleting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {t("common.delete")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============================================================
// EMPTY STATE COMPONENT (вместо авто-инициализации)
// ============================================================

function EmptyState({ onCreateDefaults, creating, t }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
        <ArrowRight className="h-8 w-8 text-slate-400" />
      </div>
      <h2 className="text-lg font-semibold text-slate-900 mb-2">
        {t("orderprocess.empty.title")}
      </h2>
      <p className="text-sm text-slate-500 text-center max-w-md mb-6">
        {t("orderprocess.empty.description")}
      </p>
      <Button onClick={onCreateDefaults} disabled={creating} size="lg">
        {creating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
        {t("orderprocess.empty.create_button")}
      </Button>
    </div>
  );
}

// ============================================================
// MAIN CONTENT COMPONENT
// ============================================================

function OrderProcessContent() {
  const { t } = useI18n();
  const { partnerId } = usePartnerAccess();
  const queryClient = useQueryClient();

  // State
  const [rateLimitHit, setRateLimitHit] = useState(false);
  const [isCreatingDefaults, setIsCreatingDefaults] = useState(false);
  const [moveBusy, setMoveBusy] = useState(false);
  const [editDialog, setEditDialog] = useState({ open: false, stage: null });
  const [deleteDialog, setDeleteDialog] = useState({ open: false, stage: null });
  const [dragOverId, setDragOverId] = useState(null);
  const [channelFilter, setChannelFilter] = useState("all");

  // Fetch stages
  const { data: stages = [], isLoading, error, refetch } = useQuery({
    queryKey: ["orderStages", partnerId],
    queryFn: () => base44.entities.OrderStage.filter({ partner: partnerId }),
    retry: shouldRetry,
    enabled: !!partnerId && !rateLimitHit,
  });

  // Rate limit detection
  useEffect(() => {
    if (error && isRateLimitError(error)) {
      queryClient.cancelQueries({ queryKey: ["orderStages", partnerId] });
      setRateLimitHit(true);
    }
  }, [error, queryClient, partnerId]);

  // Handler: создать дефолтные этапы (по кнопке, НЕ автоматически!)
  const handleCreateDefaults = async () => {
    if (isCreatingDefaults) return;
    
    setIsCreatingDefaults(true);
    try {
      // КРИТИЧНО: Проверяем ещё раз перед созданием
      const existingCheck = await base44.entities.OrderStage.filter({ partner: partnerId });
      if (existingCheck.length > 0) {
        toast.info(t("orderprocess.toast.already_exists"), { id: TOAST_ID });
        queryClient.invalidateQueries({ queryKey: ["orderStages", partnerId] });
        return;
      }
      
      const defaultStages = [
        { 
          name: t("orderprocess.default.new"), 
          internal_code: "start", 
          sort_order: 0, 
          color: "#3b82f6",
          is_locked: true,
          allowed_roles: ["partner_manager", "partner_staff"],
          enabled_hall: true,
          enabled_pickup: true,
          enabled_delivery: true,
        },
        { 
          name: t("orderprocess.default.accepted"), 
          internal_code: "middle", 
          sort_order: 10, 
          color: "#f59e0b",
          is_locked: false,
          allowed_roles: ["partner_manager", "partner_staff"],
          enabled_hall: true,
          enabled_pickup: true,
          enabled_delivery: true,
        },
        { 
          name: t("orderprocess.default.served"), 
          internal_code: "finish", 
          sort_order: 20, 
          color: "#6b7280",
          is_locked: true,
          allowed_roles: ["partner_manager", "partner_staff"],
          enabled_hall: true,
          enabled_pickup: true,
          enabled_delivery: true,
        },
      ];
      
      for (const stage of defaultStages) {
        await base44.entities.OrderStage.create({
          ...stage,
          partner: partnerId,
          is_active: true,
        });
      }
      
      queryClient.invalidateQueries({ queryKey: ["orderStages", partnerId] });
      toast.success(t("orderprocess.toast.initialized"), { id: TOAST_ID });
    } catch (err) {
      console.error("Failed to create stages:", err);
      toast.error(t("toast.error"), { id: TOAST_ID });
    } finally {
      setIsCreatingDefaults(false);
    }
  };

  // Sorted stages
  const sortedStages = useMemo(() => {
    return [...stages].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
  }, [stages]);

  // Middle stages for move checks
  const middleStages = useMemo(() => {
    return sortedStages.filter((s) => s.internal_code === "middle");
  }, [sortedStages]);

  // Filtered stages by channel
  const filteredStages = useMemo(() => {
    if (channelFilter === "all") return sortedStages;
    
    const filterConfig = CHANNEL_FILTERS.find((f) => f.key === channelFilter);
    if (!filterConfig || !filterConfig.field) return sortedStages;
    
    return sortedStages.filter((stage) => stage[filterConfig.field] !== false);
  }, [sortedStages, channelFilter]);

  // Mutations
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.OrderStage.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orderStages", partnerId] });
      toast.success(t("toast.saved"), { id: TOAST_ID });
      setEditDialog({ open: false, stage: null });
    },
    onError: () => toast.error(t("toast.error"), { id: TOAST_ID }),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.OrderStage.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orderStages", partnerId] });
      toast.success(t("toast.saved"), { id: TOAST_ID });
      setEditDialog({ open: false, stage: null });
    },
    onError: () => toast.error(t("toast.error"), { id: TOAST_ID }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.OrderStage.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orderStages", partnerId] });
      toast.success(t("toast.deleted"), { id: TOAST_ID });
      setDeleteDialog({ open: false, stage: null });
    },
    onError: () => toast.error(t("toast.error"), { id: TOAST_ID }),
  });

  // Handlers
  const handleAddStage = () => {
    const finishStage = sortedStages.find((s) => s.internal_code === "finish");
    let newSortOrder = 15;
    
    if (middleStages.length > 0) {
      const lastMiddle = middleStages[middleStages.length - 1];
      newSortOrder = (lastMiddle.sort_order || 20) + ORDER_STEP / 2;
    }
    if (finishStage && newSortOrder >= (finishStage.sort_order || 30)) {
      newSortOrder = (finishStage.sort_order || 30) - ORDER_STEP / 2;
    }

    setEditDialog({
      open: true,
      stage: {
        name: "",
        color: "#9ca3af",
        allowed_roles: ["partner_manager", "partner_staff", "kitchen"],
        internal_code: "middle",
        sort_order: newSortOrder,
        enabled_hall: true,
        enabled_pickup: true,
        enabled_delivery: true,
        isNew: true,
      },
    });
  };

  const handleEditStage = (stage) => {
    setEditDialog({ open: true, stage });
  };

  const handleSaveStage = async (data) => {
    if (editDialog.stage?.isNew) {
      await createMutation.mutateAsync({
        ...data,
        partner: partnerId,
        internal_code: "middle",
        sort_order: editDialog.stage.sort_order,
        is_active: true,
      });
      // FIX P1: rebalance после создания
      const updatedStages = await base44.entities.OrderStage.filter({ partner: partnerId });
      await rebalanceSortOrder(updatedStages, partnerId);
      queryClient.invalidateQueries({ queryKey: ["orderStages", partnerId] });
    } else if (editDialog.stage?.id) {
      updateMutation.mutate({ id: editDialog.stage.id, data });
    }
  };

  const handleDeleteStage = (stage) => {
    setDeleteDialog({ open: true, stage });
  };

  const handleConfirmDelete = async () => {
    if (deleteDialog.stage?.id) {
      await deleteMutation.mutateAsync(deleteDialog.stage.id);
      // FIX P1: rebalance после удаления
      const updatedStages = await base44.entities.OrderStage.filter({ partner: partnerId });
      await rebalanceSortOrder(updatedStages, partnerId);
      queryClient.invalidateQueries({ queryKey: ["orderStages", partnerId] });
    }
  };

  // FIX P1: Move handlers с busy state
  const handleMoveUp = async (stage) => {
    if (moveBusy) return;
    
    const idx = middleStages.findIndex((s) => s.id === stage.id);
    if (idx <= 0) return;

    setMoveBusy(true);
    try {
      const prevStage = middleStages[idx - 1];
      const newOrder = (prevStage.sort_order || 0) - 1;
      
      await base44.entities.OrderStage.update(stage.id, { sort_order: newOrder });
      
      // Rebalance для чистых значений
      const updatedStages = await base44.entities.OrderStage.filter({ partner: partnerId });
      await rebalanceSortOrder(updatedStages, partnerId);
      
      queryClient.invalidateQueries({ queryKey: ["orderStages", partnerId] });
    } catch {
      toast.error(t("toast.error"), { id: TOAST_ID });
    } finally {
      setMoveBusy(false);
    }
  };

  const handleMoveDown = async (stage) => {
    if (moveBusy) return;
    
    const idx = middleStages.findIndex((s) => s.id === stage.id);
    if (idx < 0 || idx >= middleStages.length - 1) return;

    setMoveBusy(true);
    try {
      const nextStage = middleStages[idx + 1];
      const newOrder = (nextStage.sort_order || 0) + 1;
      
      await base44.entities.OrderStage.update(stage.id, { sort_order: newOrder });
      
      // Rebalance для чистых значений
      const updatedStages = await base44.entities.OrderStage.filter({ partner: partnerId });
      await rebalanceSortOrder(updatedStages, partnerId);
      
      queryClient.invalidateQueries({ queryKey: ["orderStages", partnerId] });
    } catch {
      toast.error(t("toast.error"), { id: TOAST_ID });
    } finally {
      setMoveBusy(false);
    }
  };

  const handleDragStart = (e, stage) => {
    if (moveBusy) return;
    e.dataTransfer.setData("stage-id", String(stage.id));
  };

  const handleDrop = async (e, targetStage) => {
    setDragOverId(null);
    if (moveBusy) return;
    
    const fromId = e.dataTransfer.getData("stage-id");
    if (!fromId || fromId === String(targetStage.id)) return;
    if (!isMiddle(targetStage)) return;

    const fromStage = stages.find((s) => String(s.id) === fromId);
    if (!fromStage || !isMiddle(fromStage)) return;

    setMoveBusy(true);
    try {
      const newOrder = (targetStage.sort_order || 0) - 0.5;
      
      await base44.entities.OrderStage.update(fromStage.id, { sort_order: newOrder });
      
      // Rebalance для чистых значений
      const updatedStages = await base44.entities.OrderStage.filter({ partner: partnerId });
      await rebalanceSortOrder(updatedStages, partnerId);
      
      queryClient.invalidateQueries({ queryKey: ["orderStages", partnerId] });
    } catch {
      toast.error(t("toast.error"), { id: TOAST_ID });
    } finally {
      setMoveBusy(false);
    }
  };

  // ============================================================
  // GUARDS (после всех хуков!)
  // ============================================================

  if (!partnerId) {
    return (
      <div className="text-center py-12 text-slate-500">
        {t("error.access_denied")}
      </div>
    );
  }

  // Rate limit UI
  if (rateLimitHit) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-6 w-6 text-amber-600 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="font-semibold text-amber-900 mb-1">
                {t("error.rate_limit")}
              </h3>
              <p className="text-sm text-amber-700 mb-4">
                {t("error.rate_limit_message")}
              </p>
              <Button
                onClick={() => {
                  setRateLimitHit(false);
                  refetch();
                }}
                variant="outline"
                size="sm"
              >
                <RefreshCcw className="h-4 w-4 mr-2" />
                {t("common.retry")}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // FIX P2: Error state для не-429 ошибок
  if (error && !isRateLimitError(error)) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-6 w-6 text-red-600 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="font-semibold text-red-900 mb-1">
                {t("error.loading")}
              </h3>
              <p className="text-sm text-red-700 mb-4">
                {t("error.loading_message")}
              </p>
              <Button
                onClick={() => refetch()}
                variant="outline"
                size="sm"
              >
                <RefreshCcw className="h-4 w-4 mr-2" />
                {t("common.retry")}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  // Empty state - показываем кнопку создания (НЕ автоматически!)
  if (stages.length === 0) {
    return (
      <EmptyState 
        onCreateDefaults={handleCreateDefaults} 
        creating={isCreatingDefaults} 
        t={t} 
      />
    );
  }

  // ============================================================
  // MAIN RENDER
  // ============================================================

  return (
    <>
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">
            {t("orderprocess.title")}
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {t("orderprocess.subtitle")}
          </p>
        </div>
        <Button onClick={handleAddStage} className="h-10 shrink-0">
          <Plus className="h-4 w-4 sm:mr-2" />
          <span className="hidden sm:inline">
            {t("orderprocess.add_stage")}
          </span>
        </Button>
      </div>

      {/* Channel Filter */}
      <ChannelFilter value={channelFilter} onChange={setChannelFilter} t={t} />

      {/* Pipeline Preview */}
      <PipelinePreview stages={filteredStages} t={t} />

      {/* Stages Table */}
      <div className="bg-white rounded-xl border overflow-hidden">
        {/* Table Header (desktop) */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-2 bg-slate-50 border-b text-xs font-medium text-slate-500 uppercase tracking-wide">
          <div className="w-6 text-center">№</div>
          <div className="w-10"></div>
          <div className="flex-1">{t("orderprocess.table.stage")}</div>
          <div className="w-[80px] text-center">{t("orderprocess.table.channels")}</div>
          <div className="w-[200px] text-right">{t("orderprocess.table.roles")}</div>
          <div className="w-20"></div>
        </div>

        {/* Rows */}
        {filteredStages.map((stage, idx) => {
          const middleIdx = middleStages.findIndex((s) => s.id === stage.id);
          const canMoveUp = isMiddle(stage) && middleIdx > 0;
          const canMoveDown = isMiddle(stage) && middleIdx >= 0 && middleIdx < middleStages.length - 1;

          return (
            <StageRow
              key={stage.id}
              stage={stage}
              index={idx}
              canMoveUp={canMoveUp}
              canMoveDown={canMoveDown}
              moveBusy={moveBusy}
              onEdit={handleEditStage}
              onDelete={handleDeleteStage}
              onMoveUp={handleMoveUp}
              onMoveDown={handleMoveDown}
              onDragStart={handleDragStart}
              onDragOver={setDragOverId}
              onDrop={handleDrop}
              isDragOver={dragOverId === stage.id}
              t={t}
            />
          );
        })}
      </div>

      {/* Hint */}
      <div className="mt-4 bg-amber-50 border border-amber-100 rounded-lg p-3 text-sm text-amber-700">
        <div className="flex gap-2">
          <Lock className="h-4 w-4 mt-0.5 shrink-0" />
          <span>{t("orderprocess.locked_hint")}</span>
        </div>
      </div>

      {/* Edit Dialog */}
      <EditStageDialog
        open={editDialog.open}
        stage={editDialog.stage}
        onClose={() => setEditDialog({ open: false, stage: null })}
        onSave={handleSaveStage}
        saving={updateMutation.isPending || createMutation.isPending}
        t={t}
      />

      {/* Delete Dialog */}
      <DeleteConfirmDialog
        open={deleteDialog.open}
        stage={deleteDialog.stage}
        onClose={() => setDeleteDialog({ open: false, stage: null })}
        onConfirm={handleConfirmDelete}
        deleting={deleteMutation.isPending}
        t={t}
      />
    </>
  );
}

// ============================================================
// EXPORT WRAPPER
// ============================================================

export default function PartnerOrderProcess() {
  return (
    <PartnerShell activeTab="process">
      <OrderProcessContent />
    </PartnerShell>
  );
}
