import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
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
  ChevronUp, ChevronDown, ArrowRight,
  Utensils, Package, Truck, MoreVertical
} from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
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

const SYSTEM_STAGE_SLOTS = [
  {
    key: "new",
    labelKey: "orderprocess.default.new",
    fallbackLabel: "Новый",
    internal_code: "start",
    sort_order: 0,
    color: "#3b82f6",
    locked: true,
    defaultActive: true,
    allowed_roles: ["partner_manager", "partner_staff"],
    enabled_hall: true,
    enabled_pickup: true,
    enabled_delivery: true,
  },
  {
    key: "accepted",
    labelKey: "orderprocess.default.accepted",
    fallbackLabel: "Принято",
    internal_code: "middle",
    sort_order: 10,
    color: "#6b7280",
    locked: false,
    defaultActive: false,
    allowed_roles: ["partner_manager", "partner_staff"],
    enabled_hall: true,
    enabled_pickup: false,
    enabled_delivery: true,
  },
  {
    key: "preparing",
    labelKey: "orderprocess.default.preparing",
    fallbackLabel: "Готовится",
    internal_code: "middle",
    sort_order: 20,
    color: "#f59e0b",
    locked: false,
    defaultActive: false,
    allowed_roles: ["partner_manager", "partner_staff"],
    enabled_hall: true,
    enabled_pickup: true,
    enabled_delivery: true,
  },
  {
    key: "ready",
    labelKey: "orderprocess.default.ready",
    fallbackLabel: "Готово",
    internal_code: "middle",
    sort_order: 30,
    color: "#22c55e",
    locked: false,
    defaultActive: true,
    allowed_roles: ["kitchen"],
    enabled_hall: true,
    enabled_pickup: true,
    enabled_delivery: true,
  },
  {
    key: "served",
    labelKey: "orderprocess.default.served",
    fallbackLabel: "Выдано",
    internal_code: "finish",
    sort_order: 40,
    color: "#6b7280",
    locked: true,
    defaultActive: true,
    allowed_roles: ["partner_manager", "partner_staff"],
    enabled_hall: true,
    enabled_pickup: true,
    enabled_delivery: true,
  },
];

const MIDDLE_SLOT_KEYS = SYSTEM_STAGE_SLOTS
  .filter((slot) => slot.internal_code === "middle")
  .map((slot) => slot.key);

const EXACT_MIDDLE_SLOT_BY_SORT_ORDER = {
  10: "accepted",
  20: "preparing",
  30: "ready",
};

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

function translateWithFallback(t, key, fallback) {
  const translated = typeof t === "function" ? t(key) : key;
  return translated && translated !== key ? translated : fallback;
}

function getSystemStageLabel(slot, t) {
  return translateWithFallback(t, slot.labelKey, slot.fallbackLabel);
}

function getStageChannels(stage, slot) {
  return {
    enabled_hall: stage ? stage.enabled_hall !== false : slot.enabled_hall,
    enabled_pickup: stage ? stage.enabled_pickup !== false : slot.enabled_pickup,
    enabled_delivery: stage ? stage.enabled_delivery !== false : slot.enabled_delivery,
  };
}

function getStageRoles(stage, slot) {
  return Array.isArray(stage?.allowed_roles) && stage.allowed_roles.length > 0
    ? stage.allowed_roles
    : slot.allowed_roles;
}

function isStageActive(stage) {
  return stage?.is_active !== false;
}

function hasSameValues(actual = [], expected = []) {
  const actualSorted = [...new Set(actual)].sort();
  const expectedSorted = [...expected].sort();
  if (actualSorted.length !== expectedSorted.length) return false;
  return actualSorted.every((value, index) => value === expectedSorted[index]);
}

function matchesSlotChannels(stage, slot) {
  return (stage?.enabled_hall !== false) === slot.enabled_hall &&
    (stage?.enabled_pickup !== false) === slot.enabled_pickup &&
    (stage?.enabled_delivery !== false) === slot.enabled_delivery;
}

function matchesStageLabel(stage, label) {
  return String(stage?.name || "").trim().toLowerCase() === String(label || "").trim().toLowerCase();
}

function buildStagePayload(slot, partnerId, t, overrides = {}) {
  return {
    partner: partnerId,
    name: getSystemStageLabel(slot, t),
    internal_code: slot.internal_code,
    sort_order: slot.sort_order,
    color: slot.color,
    is_locked: slot.locked,
    is_active: slot.defaultActive,
    allowed_roles: [...slot.allowed_roles],
    enabled_hall: slot.enabled_hall,
    enabled_pickup: slot.enabled_pickup,
    enabled_delivery: slot.enabled_delivery,
    ...overrides,
  };
}

function analyzeStageSet(stages) {
  const startStages = [];
  const finishStages = [];
  const middleStages = [];

  for (const stage of stages) {
    if (isStart(stage)) {
      startStages.push(stage);
      continue;
    }
    if (isFinish(stage)) {
      finishStages.push(stage);
      continue;
    }
    if (isMiddle(stage)) {
      middleStages.push(stage);
      continue;
    }

    return {
      blocker: "orderprocess.blocker.unsupported_type",
      startStage: null,
      finishStage: null,
      middleStages: [],
    };
  }

  if (startStages.length > 1) {
    return {
      blocker: "orderprocess.blocker.multiple_start",
      startStage: null,
      finishStage: null,
      middleStages: [],
    };
  }

  if (finishStages.length > 1) {
    return {
      blocker: "orderprocess.blocker.multiple_finish",
      startStage: null,
      finishStage: null,
      middleStages: [],
    };
  }

  if (middleStages.length > 3) {
    return {
      blocker: "orderprocess.blocker.too_many_middle",
      startStage: null,
      finishStage: null,
      middleStages: [],
    };
  }

  return {
    blocker: "",
    startStage: startStages[0] || null,
    finishStage: finishStages[0] || null,
    middleStages: [...middleStages].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0)),
  };
}

function isLegacyDefaultConfiguration(analysis, t) {
  if (!analysis || analysis.blocker) return false;
  if (!analysis.startStage || !analysis.finishStage || analysis.middleStages.length !== 1) return false;

  const startSlot = SYSTEM_STAGE_SLOTS[0];
  const acceptedSlot = SYSTEM_STAGE_SLOTS[1];
  const finishSlot = SYSTEM_STAGE_SLOTS[4];
  const middleStage = analysis.middleStages[0];

  const startMatches = hasSameValues(analysis.startStage.allowed_roles, startSlot.allowed_roles) &&
    matchesSlotChannels(analysis.startStage, startSlot) &&
    String(analysis.startStage.color || "").toLowerCase() === startSlot.color;

  const middleMatches = hasSameValues(middleStage.allowed_roles, acceptedSlot.allowed_roles) &&
    middleStage.sort_order === acceptedSlot.sort_order &&
    middleStage.enabled_hall !== false &&
    middleStage.enabled_pickup !== false &&
    middleStage.enabled_delivery !== false &&
    String(middleStage.color || "").toLowerCase() === "#f59e0b";

  const finishMatches = hasSameValues(analysis.finishStage.allowed_roles, finishSlot.allowed_roles) &&
    matchesSlotChannels(analysis.finishStage, finishSlot) &&
    String(analysis.finishStage.color || "").toLowerCase() === finishSlot.color;

  return startMatches && middleMatches && finishMatches;
}

function buildFixedStageSlots(analysis, t) {
  if (!analysis || analysis.blocker) return [];

  const assignedMiddleSlots = new Map();
  const usedMiddleIds = new Set();
  const remainingKeys = [...MIDDLE_SLOT_KEYS];

  analysis.middleStages.forEach((stage) => {
    const exactSlotKey = EXACT_MIDDLE_SLOT_BY_SORT_ORDER[stage.sort_order];
    if (!exactSlotKey || assignedMiddleSlots.has(exactSlotKey)) return;

    assignedMiddleSlots.set(exactSlotKey, stage);
    usedMiddleIds.add(stage.id);

    const remainingIndex = remainingKeys.indexOf(exactSlotKey);
    if (remainingIndex >= 0) {
      remainingKeys.splice(remainingIndex, 1);
    }
  });

  analysis.middleStages.forEach((stage) => {
    if (usedMiddleIds.has(stage.id)) return;

    const nextKey = remainingKeys.shift();
    if (nextKey) {
      assignedMiddleSlots.set(nextKey, stage);
      usedMiddleIds.add(stage.id);
    }
  });

  return SYSTEM_STAGE_SLOTS.map((slot, index) => {
    let stage = null;

    if (slot.internal_code === "start") {
      stage = analysis.startStage;
    } else if (slot.internal_code === "finish") {
      stage = analysis.finishStage;
    } else {
      stage = assignedMiddleSlots.get(slot.key) || null;
    }

    return {
      key: slot.key,
      definition: slot,
      index,
      label: getSystemStageLabel(slot, t),
      stage,
      active: slot.locked ? true : (stage ? isStageActive(stage) : false),
      color: stage?.color || slot.color,
      allowedRoles: getStageRoles(stage, slot),
      channels: getStageChannels(stage, slot),
      canEdit: Boolean(stage),
    };
  });
}

function getNormalizationPlan(analysis, partnerId, t) {
  if (!analysis || analysis.blocker || !partnerId) return null;
  if (!analysis.startStage && !analysis.finishStage && analysis.middleStages.length === 0) return null;

  if (isLegacyDefaultConfiguration(analysis, t)) {
    const steps = [
      {
        kind: "update",
        id: analysis.startStage.id,
        data: {
          name: getSystemStageLabel(SYSTEM_STAGE_SLOTS[0], t),
          sort_order: SYSTEM_STAGE_SLOTS[0].sort_order,
          color: SYSTEM_STAGE_SLOTS[0].color,
          is_locked: true,
          is_active: true,
          allowed_roles: [...SYSTEM_STAGE_SLOTS[0].allowed_roles],
          enabled_hall: true,
          enabled_pickup: true,
          enabled_delivery: true,
        },
      },
      {
        kind: "update",
        id: analysis.middleStages[0].id,
        data: {
          name: getSystemStageLabel(SYSTEM_STAGE_SLOTS[3], t),
          sort_order: SYSTEM_STAGE_SLOTS[3].sort_order,
          color: SYSTEM_STAGE_SLOTS[3].color,
          is_locked: false,
          is_active: true,
          allowed_roles: [...SYSTEM_STAGE_SLOTS[3].allowed_roles],
          enabled_hall: true,
          enabled_pickup: true,
          enabled_delivery: true,
        },
      },
      {
        kind: "update",
        id: analysis.finishStage.id,
        data: {
          name: getSystemStageLabel(SYSTEM_STAGE_SLOTS[4], t),
          sort_order: SYSTEM_STAGE_SLOTS[4].sort_order,
          color: SYSTEM_STAGE_SLOTS[4].color,
          is_locked: true,
          is_active: true,
          allowed_roles: [...SYSTEM_STAGE_SLOTS[4].allowed_roles],
          enabled_hall: true,
          enabled_pickup: true,
          enabled_delivery: true,
        },
      },
      {
        kind: "create",
        data: buildStagePayload(SYSTEM_STAGE_SLOTS[1], partnerId, t, { is_active: false }),
      },
      {
        kind: "create",
        data: buildStagePayload(SYSTEM_STAGE_SLOTS[2], partnerId, t, { is_active: false }),
      },
    ];

    return {
      signature: `legacy:${analysis.startStage.id}:${analysis.middleStages[0].id}:${analysis.finishStage.id}`,
      steps,
    };
  }

  const steps = [];

  if (!analysis.startStage) {
    steps.push({
      kind: "create",
      data: buildStagePayload(SYSTEM_STAGE_SLOTS[0], partnerId, t, { is_active: true }),
    });
  } else {
    const startData = {};

    if (analysis.startStage.sort_order !== SYSTEM_STAGE_SLOTS[0].sort_order) {
      startData.sort_order = SYSTEM_STAGE_SLOTS[0].sort_order;
    }
    if (analysis.startStage.is_locked !== true) {
      startData.is_locked = true;
    }
    if (analysis.startStage.is_active === false) {
      startData.is_active = true;
    }

    if (Object.keys(startData).length > 0) {
      steps.push({ kind: "update", id: analysis.startStage.id, data: startData });
    }
  }

  if (!analysis.finishStage) {
    steps.push({
      kind: "create",
      data: buildStagePayload(SYSTEM_STAGE_SLOTS[4], partnerId, t, { is_active: true }),
    });
  } else {
    const finishData = {};

    if (analysis.finishStage.sort_order !== SYSTEM_STAGE_SLOTS[4].sort_order) {
      finishData.sort_order = SYSTEM_STAGE_SLOTS[4].sort_order;
    }
    if (analysis.finishStage.is_locked !== true) {
      finishData.is_locked = true;
    }
    if (analysis.finishStage.is_active === false) {
      finishData.is_active = true;
    }

    if (Object.keys(finishData).length > 0) {
      steps.push({ kind: "update", id: analysis.finishStage.id, data: finishData });
    }
  }

  if (steps.length === 0) return null;

  const signature = steps
    .map((step) => step.kind === "create"
      ? `create:${step.data.internal_code}:${step.data.sort_order}`
      : `update:${step.id}:${Object.keys(step.data).sort().join(",")}`)
    .join("|");

  return { signature, steps };
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
// STAGE ROW COMPONENT
// ============================================================

function FixedStageRow({ slot, isExpanded, onToggleExpand, onEdit, t }) {
  const locked = slot.definition.locked;

  // preserve from original component — keep useCallback with [t] dependency
  const getRoleLabel = useCallback((role) => {
    const labels = {
      partner_staff: t("orderprocess.role.staff"),
      kitchen: t("orderprocess.role.kitchen"),
      partner_manager: t("orderprocess.role.manager"),
    };
    return labels[role] || role;
  }, [t]);

  return (
    <div className="border-b last:border-b-0">
      {/* Collapsed row — shown always (desktop and mobile) */}
      <div className="flex items-center gap-3 px-4 py-3 min-h-[44px]">
        {/* number + color dot + name */}
        <span className="text-sm text-slate-500 w-5 flex-shrink-0">{slot.index + 1}</span>
        <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: slot.color }} />
        <span className="flex-1 text-sm font-medium text-slate-900">{slot.label}</span>

        {/* channel icons */}
        <div className="flex gap-1">
          {slot.channels.enabled_hall && (
            <Utensils className="h-3.5 w-3.5 text-slate-500" title={t('channel.hall')} />
          )}
          {slot.channels.enabled_pickup && (
            <Package className="h-3.5 w-3.5 text-slate-500" title={t('channel.pickup')} />
          )}
          {slot.channels.enabled_delivery && (
            <Truck className="h-3.5 w-3.5 text-slate-500" title={t('channel.delivery')} />
          )}
        </div>

        {/* role chips — desktop only */}
        <div className="hidden sm:flex gap-1 flex-wrap">
          {slot.allowedRoles.map(role => (
            <span key={role} className="rounded-full px-2 py-0.5 text-xs bg-slate-100 text-slate-600">
              {getRoleLabel(role)}
            </span>
          ))}
        </div>

        {/* status badge */}
        <span className={`text-xs px-2.5 py-1 rounded-full font-medium flex-shrink-0 ${
          locked
            ? 'bg-slate-100 text-slate-500'
            : slot.active
              ? 'bg-emerald-100 text-emerald-700'
              : 'bg-amber-100 text-amber-700'
        }`}>
          {locked ? (
            <><Lock className="h-3 w-3 inline mr-1" />{t('orderprocess.status.locked')}</>
          ) : slot.active ? (
            t('orderprocess.status.active')
          ) : (
            t('orderprocess.status.inactive')
          )}
        </span>

        {/* desktop: pencil for editable unlocked stages */}
        {!locked && slot.canEdit && (
          <button
            onClick={() => onEdit(slot.stage)}
            className="hidden sm:flex p-1 text-slate-400 hover:text-slate-600 min-h-[44px] items-center"
            aria-label={t('orderprocess.aria.edit')}
          >
            <Pencil className="h-4 w-4" />
          </button>
        )}

        {/* mobile: chevron toggle */}
        <button
          onClick={() => onToggleExpand(slot.key)}
          className="sm:hidden p-1 text-slate-400 min-h-[44px] min-w-[44px] flex items-center justify-center"
        >
          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
      </div>

      {/* Expanded panel — mobile only */}
      {isExpanded && (
        <div className="sm:hidden px-4 pb-3 pt-1 bg-slate-50 text-sm space-y-2">
          {/* channels with labels */}
          <div className="flex items-center gap-3 text-slate-600">
            <span className="text-xs font-medium text-slate-500">{t('orderprocess.channels_label')}:</span>
            {slot.channels.enabled_hall && (
              <span className="flex items-center gap-1">
                <Utensils className="h-3.5 w-3.5" />{t('channel.hall')}
              </span>
            )}
            {slot.channels.enabled_pickup && (
              <span className="flex items-center gap-1">
                <Package className="h-3.5 w-3.5" />{t('channel.pickup')}
              </span>
            )}
            {slot.channels.enabled_delivery && (
              <span className="flex items-center gap-1">
                <Truck className="h-3.5 w-3.5" />{t('channel.delivery')}
              </span>
            )}
          </div>

          {/* roles */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-medium text-slate-500">{t('orderprocess.roles_label')}:</span>
            {slot.allowedRoles.map(role => (
              <span key={role} className="rounded-full px-2 py-0.5 text-xs bg-slate-100 text-slate-600">
                {getRoleLabel(role)}
              </span>
            ))}
          </div>

          {/* edit button — only for unlocked stages with DB record */}
          {!locked && slot.canEdit && (
            <button
              onClick={() => onEdit(slot.stage)}
              className="mt-1 text-sm text-blue-600 font-medium min-h-[44px] flex items-center"
            >
              {t('orderprocess.edit_button')}
            </button>
          )}
        </div>
      )}
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
                  className={`w-11 h-11 rounded-lg border-2 transition-all ${
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
  const [isNormalizing, setIsNormalizing] = useState(false);
  const [normalizationError, setNormalizationError] = useState("");
  const [toggleBusyKey, setToggleBusyKey] = useState("");
  const [moveBusy, setMoveBusy] = useState(false); // reserved — do not remove (hook order)
  const [editDialog, setEditDialog] = useState({ open: false, stage: null });
  const [deleteDialog, setDeleteDialog] = useState({ open: false, stage: null });
  const [expandedKey, setExpandedKey] = useState(null); // which stage row is expanded on mobile
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

  // FIX BUG-OP-004: ref guard prevents double-click race (state update is async, ref is sync)
  const creatingRef = useRef(false);
  const normalizationRef = useRef("");

  const handleCreateDefaults = async () => {
    if (creatingRef.current) return;
    creatingRef.current = true;
    setIsCreatingDefaults(true);
    try {
      const existingCheck = await base44.entities.OrderStage.filter({ partner: partnerId });
      if (existingCheck.length > 0) {
        toast.info(t("orderprocess.toast.already_exists"), { id: TOAST_ID });
        queryClient.invalidateQueries({ queryKey: ["orderStages", partnerId] });
        return;
      }

      const defaultStages = SYSTEM_STAGE_SLOTS.map((slot) =>
        buildStagePayload(slot, partnerId, t, { is_active: slot.defaultActive })
      );

      for (const stage of defaultStages) {
        await base44.entities.OrderStage.create(stage);
      }

      queryClient.invalidateQueries({ queryKey: ["orderStages", partnerId] });
      toast.success(t("orderprocess.toast.initialized"), { id: TOAST_ID });
    } catch {
      toast.error(t("toast.error"), { id: TOAST_ID });
    } finally {
      creatingRef.current = false;
      setIsCreatingDefaults(false);
    }
  };

  // Sorted stages
  const sortedStages = useMemo(() => {
    return [...stages].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
  }, [stages]);

  const stageAnalysis = useMemo(() => {
    return analyzeStageSet(sortedStages);
  }, [sortedStages]);

  const fixedStageSlots = useMemo(() => {
    return buildFixedStageSlots(stageAnalysis, t);
  }, [stageAnalysis, t]);

  const currentProcessStages = useMemo(() => {
    return fixedStageSlots.filter((slot) => slot.active);
  }, [fixedStageSlots]);

  const normalizationPlan = useMemo(() => {
    return getNormalizationPlan(stageAnalysis, partnerId, t);
  }, [stageAnalysis, partnerId, t]);

  // Middle stages for move checks
  const middleStages = useMemo(() => {
    return sortedStages.filter((s) => s.internal_code === "middle");
  }, [sortedStages]);

  useEffect(() => {
    if (!partnerId || !normalizationPlan || stageAnalysis.blocker) return;
    if (normalizationRef.current === normalizationPlan.signature) return;

    let cancelled = false;
    normalizationRef.current = normalizationPlan.signature;
    setIsNormalizing(true);
    setNormalizationError("");

    const runNormalization = async () => {
      try {
        for (const step of normalizationPlan.steps) {
          if (step.kind === "update") {
            await base44.entities.OrderStage.update(step.id, step.data);
          } else {
            await base44.entities.OrderStage.create(step.data);
          }
        }

        if (!cancelled) {
          queryClient.invalidateQueries({ queryKey: ["orderStages", partnerId] });
        }
      } catch {
        if (!cancelled) {
          setNormalizationError(t("toast.error"));
          toast.error(t("toast.error"), { id: TOAST_ID });
        }
      } finally {
        if (!cancelled) {
          setIsNormalizing(false);
        }
      }
    };

    runNormalization();

    return () => {
      cancelled = true;
    };
  }, [normalizationPlan, partnerId, queryClient, stageAnalysis.blocker, t]);

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

  // FIX BUG-OP-003: removed invalidateQueries from onSuccess — done manually after rebalance
  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.OrderStage.create(data),
    onSuccess: () => {
      toast.success(t("toast.saved"), { id: TOAST_ID });
      setEditDialog({ open: false, stage: null });
    },
    onError: () => toast.error(t("toast.error"), { id: TOAST_ID }),
  });

  // reserved — do not remove (hook order)
  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.OrderStage.delete(id),
    onSuccess: () => {
      toast.success(t("toast.deleted"), { id: TOAST_ID });
      setDeleteDialog({ open: false, stage: null });
    },
    onError: () => toast.error(t("toast.error"), { id: TOAST_ID }),
  });

  // NOTE: Add/Move/Delete stage handlers removed — fixed 5-stage system (UX v2.0)
  // deleteMutation and deleteDialog kept for React hook order safety

  const handleEditStage = (stage) => {
    setEditDialog({ open: true, stage });
  };

  const handleToggleStage = async (slot) => {
    if (!slot || slot.definition.locked || toggleBusyKey) return;

    setToggleBusyKey(slot.key);
    try {
      if (slot.stage?.id) {
        if (slot.active) {
          const ordersInStage = await base44.entities.Order.filter({
            partner: partnerId,
            current_stage: slot.stage.id,
          });

          if (ordersInStage.length > 0) {
            toast.error(t("orderprocess.error.stage_has_orders", { count: ordersInStage.length }), { id: TOAST_ID });
            return;
          }
        }

        await base44.entities.OrderStage.update(slot.stage.id, {
          is_active: !slot.active,
          internal_code: slot.definition.internal_code,
          sort_order: slot.definition.sort_order,
        });
      } else {
        await base44.entities.OrderStage.create(
          buildStagePayload(slot.definition, partnerId, t, { is_active: true })
        );
      }

      queryClient.invalidateQueries({ queryKey: ["orderStages", partnerId] });
      toast.success(t("toast.saved"), { id: TOAST_ID });
    } catch {
      toast.error(t("toast.error"), { id: TOAST_ID });
    } finally {
      setToggleBusyKey("");
    }
  };

  // FIX BUG-OP-001: wrap entire create+rebalance in try/catch to prevent unhandled rejection
  const handleSaveStage = async (data) => {
    if (editDialog.stage?.isNew) {
      try {
        await createMutation.mutateAsync({
          ...data,
          partner: partnerId,
          internal_code: "middle",
          sort_order: editDialog.stage.sort_order,
          is_active: true,
        });
        // Rebalance after create — non-critical, wrapped separately
        try {
          const updatedStages = await base44.entities.OrderStage.filter({ partner: partnerId });
          await rebalanceSortOrder(updatedStages, partnerId);
        } catch {
          // rebalance failure is non-critical; stage was created successfully
        }
        queryClient.invalidateQueries({ queryKey: ["orderStages", partnerId] });
      } catch {
        // createMutation.onError already shows toast
      }
    } else if (editDialog.stage?.id) {
      updateMutation.mutate({ id: editDialog.stage.id, data });
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

  if (stageAnalysis.blocker) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-6 w-6 text-amber-600 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="font-semibold text-amber-900 mb-1">
                {t('orderprocess.blocker.generic')}
              </h3>
              <p className="text-sm text-amber-700">
                {t(stageAnalysis.blocker)}
              </p>
            </div>
          </div>
        </div>
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

  if (isNormalizing) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
        <p className="text-sm text-slate-500">{t("common.loading")}</p>
      </div>
    );
  }

  if (normalizationError) {
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
                {normalizationError}
              </p>
              <Button
                onClick={() => {
                  normalizationRef.current = "";
                  setNormalizationError("");
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

  // ============================================================
  // MAIN RENDER
  // ============================================================

  return (
    <>
      {/* Header */}
      <div className="mb-4">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">
            {t("orderprocess.title")}
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {t("orderprocess.subtitle")}
          </p>
        </div>
      </div>

      <div className="mb-4 rounded-xl border bg-slate-50 px-4 py-3">
        <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
          {t('orderprocess.current_process')}
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          {currentProcessStages.map((slot, index) => (
            <React.Fragment key={slot.key}>
              <span
                className="inline-flex items-center rounded-full px-3 py-1 text-sm font-medium text-slate-800"
                style={{ backgroundColor: `${slot.color}1a` }}
              >
                {slot.label}
              </span>
              {index < currentProcessStages.length - 1 && (
                <ArrowRight className="h-4 w-4 text-slate-400" />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Channel legend — mobile only */}
      <div className="flex items-center gap-4 px-4 py-2 bg-slate-50 rounded-lg mb-3 text-xs text-slate-600 sm:hidden">
        <span className="flex items-center gap-1"><Utensils className="h-3.5 w-3.5" />{t('channel.hall')}</span>
        <span className="flex items-center gap-1"><Package className="h-3.5 w-3.5" />{t('channel.pickup')}</span>
        <span className="flex items-center gap-1"><Truck className="h-3.5 w-3.5" />{t('channel.delivery')}</span>
      </div>

      <div className="bg-white rounded-xl border overflow-hidden">
        {fixedStageSlots.map((slot) => (
          <FixedStageRow
            key={slot.key}
            slot={slot}
            isExpanded={expandedKey === slot.key}
            onToggleExpand={(key) => setExpandedKey(prev => prev === key ? null : key)}
            onEdit={handleEditStage}
            t={t}
          />
        ))}
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
