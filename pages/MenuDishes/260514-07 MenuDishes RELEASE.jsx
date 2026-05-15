// ======================================================
// pages/menudishes.jsx — WYSIWYG Menu Editor v4.9
// AUDIT FIXES (260119):
// - P0.1: Auth error → redirect to login
// - P0.2: Warning when dishes >= 100 (limit detection)
// - P0.3: Rate limit retry protection in useQuery
// - P0.4: Batched updates for mutations
// - P0.5-P0.6: XSS protection (URL encoding + validation)
// - P1.2: Sticky footer in dialogs
// - P1.3: Removed category_ids (use only categories)
// - P1.4: is_archived field instead of :::archived::: marker
// ======================================================
//
// СБОРКА: Склейте PART1 + PART2 + PART3 в один файл
// ======================================================

import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Globe,
  Loader2,
  MapPin,
  Phone,
  Mail,
  MessageCircle,
  Link as LinkIcon,
  AlertTriangle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";

import {
  isDishEnabledForMode,
  sortCategoriesStable,
  sortDishesStable,
} from "@/components/menuChannelLogic";
import { ConfirmDialog } from "@/components/menuDishes/ConfirmDialog";
import { CategoryDialog } from "@/components/menuDishes/CategoryDialog";
import { SettingsDialog } from "@/components/menuDishes/SettingsDialog";
import { DishEditModal } from "@/components/menuDishes/DishEditModal";
import { useMenuDishesDnd } from "@/components/menuDishes/useMenuDishesDnd";
import { MenuDishesDragPreview } from "@/components/menuDishes/MenuDishesDragPreview";
import { MenuDishesToolbar } from "@/components/menuDishes/MenuDishesToolbar";
import { MenuDishesHeader } from "@/components/menuDishes/MenuDishesHeader";
import { MenuDishesCategoryChips } from "@/components/menuDishes/MenuDishesCategoryChips";
import { MenuDishesCategoryList } from "@/components/menuDishes/MenuDishesCategoryList";

// RF-1 Bundle 1 PRIMARY (S393): canonical isRateLimitError v1.5 + shouldRetry
// from shared helper. Replaces local definitions @ ex-line 157-166 (kept here
// pre-S393 with subtle case-sensitivity weakness fixed by canonical).
import {
  isRateLimitError,
  shouldRetry,
} from "@/components/_shared/security/rateLimit";

// RF-1 Bundle 2 (S402): canonical isUrlSafe + ALLOWED_PROTOCOLS from shared
// helper. Replaces local definitions @ ex-line 199-210. Union-set 5 protocols
// (added `whatsapp:` from x.jsx). Audit ref:
// outputs/permanent/Pre_Release_Refactor_Audit.md v2.0 §Final Synth Bundle 2.
import {
  isUrlSafe,
  ALLOWED_PROTOCOLS,
} from "@/components/_shared/security/url";

// RF-1 Bundle 3 (S415): canonical normStr from shared helper (HIGHEST DEDUP
// — 5 pages: MenuDishes / DishAvailability / MenuManage / PartnerContacts /
// partnertables). Replaces local definition @ ex-line 153-155 (no-trim
// variant). Canonical version trims whitespace by default. Audit ref:
// outputs/permanent/Pre_Release_Refactor_Audit.md v2.0 §Final Synth Bundle 3.
import { normStr } from "@/components/_shared/utils/normStr";

// RF-1 Bundle 5 (S436): canonical safeLsGet/safeLsSet from shared helper.
// Replaces local definitions @ ex-lines 143-158 — backward-compat aliases
// preserve exact signatures. Audit ref: outputs/permanent/Pre_Release_
// Refactor_Audit.md v2.0 §Final Synth Bundle 5 (foundation primitives).
import { safeLsGet, safeLsSet } from "@/components/_shared/storage/safeStorage";

// RF-1 Bundle 6 (S443, FINAL): canonical getDishCategoryIds + DnD trio from
// shared helpers. Replaces local definitions @ ex-lines 224-264 — pure utility
// functions with identical signatures. Audit ref: §Final Synth Bundle 6.
import { getDishCategoryIds } from "@/components/_shared/entities/dish";

/* ============================================================
   CONSTANTS
   ============================================================ */

const TOAST_ID = "mm1";

const AVAILABLE_CURRENCIES = [
  { code: "KZT", label: "Тенге", symbol: "₸" },
  { code: "USD", label: "Доллар США", symbol: "$" },
  { code: "EUR", label: "Евро", symbol: "€" },
  { code: "RUB", label: "Рубль", symbol: "₽" },
  { code: "GBP", label: "Фунт", symbol: "£" },
  { code: "TRY", label: "Лира", symbol: "₺" },
  { code: "AED", label: "Дирхам", symbol: "د.إ" },
  { code: "CNY", label: "Юань", symbol: "¥" },
];

const AVAILABLE_LANGUAGES = [
  { code: "RU", label: "Русский" },
  { code: "EN", label: "English" },
  { code: "KK", label: "Қазақша" },
];

const CONTACT_TYPES = [
  { value: "phone", label: "Телефон", icon: Phone },
  { value: "whatsapp", label: "WhatsApp", icon: MessageCircle },
  { value: "instagram", label: "Instagram", icon: LinkIcon },
  { value: "facebook", label: "Facebook", icon: LinkIcon },
  { value: "tiktok", label: "TikTok", icon: LinkIcon },
  { value: "website", label: "Сайт", icon: Globe },
  { value: "email", label: "Email", icon: Mail },
  { value: "map", label: "Карта", icon: MapPin },
  { value: "custom", label: "Другое", icon: LinkIcon },
];

// REMOVED: IS_ARCHIVED_TAG - now using Dish.is_archived field (P1.4)

/* ============================================================
   HELPERS
   ============================================================ */

// safeLsGet / safeLsSet moved to @/components/_shared/storage/safeStorage
// (S436, RF-1 Bundle 5). Imported above. See header comment block for
// migration trail.

// normStr moved to @/components/_shared/utils/normStr (S415, RF-1 Bundle 3)
// Imported above. See header comment block for migration trail.

// P1.4: Use is_archived field instead of marker in description
function isArchivedDish(dish) {
  return dish?.is_archived === true;
}

// REMOVED: ensureArchivedMarker() - no longer needed
// REMOVED: getCleanDescription() - description is now clean

function getContactIcon(type) {
  const found = CONTACT_TYPES.find((t) => t.value === type);
  return found?.icon || LinkIcon;
}

/* ============================================================
   RATE LIMIT HELPERS (P0.3) — migrated S393 RF-1 Bundle 1
   ============================================================ */
// isRateLimitError + shouldRetry imported from @/components/_shared/security/rateLimit
// (canonical v1.5 LOCKED S388 — closes 5-file divergences, see audit v2.0 §Final Synth).

/* ============================================================
   URL SECURITY HELPERS (P0.5-P0.6)
   ----- moved to @/components/_shared/security/url (S402, RF-1 Bundle 2)
   ----- isUrlSafe + ALLOWED_PROTOCOLS imported above
   ============================================================ */

function getDefaultContactLabel(type) {
  const found = CONTACT_TYPES.find((t) => t.value === type);
  return found?.label || "Ссылка";
}

/* ============================================================
   SKELETON COMPONENT
   ============================================================ */

function MenuSkeleton() {
  return (
    <div className="min-h-screen bg-slate-50 animate-pulse">
      <div className="sticky top-0 z-40 bg-white border-b shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            <div className="h-9 w-20 bg-slate-200 rounded" />
            <div className="flex bg-slate-100 rounded-lg p-0.5 gap-1">
              <div className="h-9 w-20 bg-slate-200 rounded-md" />
              <div className="h-9 w-24 bg-slate-200 rounded-md" />
              <div className="h-9 w-20 bg-slate-200 rounded-md" />
            </div>
            <div className="h-9 w-20 bg-slate-200 rounded" />
          </div>
        </div>
      </div>

      <div className="bg-white border-b px-4 py-6">
        <div className="max-w-4xl mx-auto text-center space-y-3">
          <div className="h-8 w-48 bg-slate-200 rounded mx-auto" />
          <div className="h-4 w-64 bg-slate-200 rounded mx-auto" />
          <div className="flex gap-2 justify-center">
            <div className="h-8 w-8 bg-slate-200 rounded-lg" />
            <div className="h-8 w-8 bg-slate-200 rounded-lg" />
            <div className="h-8 w-8 bg-slate-200 rounded-lg" />
          </div>
        </div>
      </div>

      <div className="sticky top-[57px] z-30 bg-white/95 border-b py-3">
        <div className="max-w-4xl mx-auto px-4 space-y-3">
          <div className="flex gap-3">
            {[1,2,3,4].map(i => (
              <div key={i} className="h-10 w-24 bg-slate-200 rounded-full" />
            ))}
          </div>
          <div className="h-10 bg-slate-200 rounded-lg" />
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="space-y-8">
          {[1,2].map(section => (
            <div key={section}>
              <div className="h-7 w-32 bg-slate-200 rounded mb-4" />
              <div className="grid gap-4 sm:grid-cols-2">
                {[1,2,3,4].map(i => (
                  <div key={i} className="bg-white rounded-xl border overflow-hidden">
                    <div className="h-48 bg-slate-200" />
                    <div className="p-4 space-y-2">
                      <div className="h-5 w-32 bg-slate-200 rounded" />
                      <div className="h-4 w-48 bg-slate-200 rounded" />
                      <div className="h-4 w-24 bg-slate-200 rounded" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   MAIN COMPONENT
   ============================================================ */

export default function MenuDishes() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // ─────────────────────────────────────────────────────────────
  // STATE
  // ─────────────────────────────────────────────────────────────

  const [orderMode, setOrderMode] = useState(() => safeLsGet("menu_preview_mode", "hall"));
  const [search, setSearch] = useState("");
  const [activeCategoryId, setActiveCategoryId] = useState("");

  // Restaurant settings dialog (name + address + contacts)
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);
  const [settingsForm, setSettingsForm] = useState({ name: "", address: "" });
  const [editingContactLinks, setEditingContactLinks] = useState([]);
  const [newContactForm, setNewContactForm] = useState({ type: "phone", label: "", url: "" });

  // Category dialog
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryForm, setCategoryForm] = useState({
    name: "",
    sort_order: "",
    is_active: true,
  });

  // Dish dialog
  const [dishDialogOpen, setDishDialogOpen] = useState(false);
  const [editingDish, setEditingDish] = useState(null);
  const [dishForm, setDishForm] = useState({
    name: "",
    description: "",
    price: "",
    image: "",
    enabled_hall: true,
    enabled_pickup: true,
    enabled_delivery: true,
    sort_order: "",
    category: "",
    categories: [],
  });

  // Language tabs for dialogs
  const [dishLangTab, setDishLangTab] = useState("RU");
  const [dishTranslations, setDishTranslations] = useState({});
  const [categoryLangTab, setCategoryLangTab] = useState("RU");
  const [categoryTranslations, setCategoryTranslations] = useState({});

  // Confirm dialog
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmState, setConfirmState] = useState({
    title: "",
    description: "",
    actionText: "",
    onConfirm: null,
    variant: "danger",
    showCancel: true,
  });

  // P0.3: Rate limit state
  const [rateLimitHit, setRateLimitHit] = useState(false);


  // ─────────────────────────────────────────────────────────────
  // QUERIES (P0.3: Added retry and error handling)
  // ─────────────────────────────────────────────────────────────

  const { data: currentUser, isLoading: loadingUser, error: authError } = useQuery({
    queryKey: ["currentUser"],
    queryFn: () => base44.auth.me(),
    retry: shouldRetry,
  });

  const partnerId = currentUser?.partner;

  const { data: partner, isLoading: loadingPartner, error: partnerError } = useQuery({
    queryKey: ["partner", partnerId],
    enabled: !!partnerId && !rateLimitHit,
    retry: shouldRetry,
    queryFn: async () => {
      if (!partnerId) return null;
      try {
        return await base44.entities.Partner.get(partnerId);
      } catch {
        try {
          const rows = await base44.entities.Partner.filter({ id: partnerId });
          return rows?.[0] || null;
        } catch {
          return null;
        }
      }
    },
  });

  const { data: categoriesRaw = [], isLoading: loadingCategories, error: categoriesError } = useQuery({
    queryKey: ["categories", partnerId],
    enabled: !!partnerId && !rateLimitHit,
    retry: shouldRetry,
    queryFn: () => base44.entities.Category.filter({ partner: partnerId }),
    initialData: [],
  });

  // BUG-MD-003 FIX (round 2): Also destructure isFetching for refetch-window guard
  const { data: dishesRaw = [], isLoading: loadingDishes, isFetching: fetchingDishes, error: dishesError } = useQuery({
    queryKey: ["dishes", partnerId],
    enabled: !!partnerId && !rateLimitHit,
    retry: shouldRetry,
    queryFn: () => base44.entities.Dish.filter({ partner: partnerId }),
    initialData: [],
  });

  const { data: contactLinksRaw = [], error: contactsError } = useQuery({
    queryKey: ["partnerContactLinks", partnerId],
    enabled: !!partnerId && !rateLimitHit,
    retry: shouldRetry,
    queryFn: () => base44.entities.PartnerContactLink.filter({ partner: partnerId }),
    initialData: [],
  });

// ═══════════════════════════════════════════════════════════
// КОНЕЦ PART 1 — продолжение в PART 2
// ═══════════════════════════════════════════════════════════
// ═══════════════════════════════════════════════════════════
// PART 2 — DERIVED DATA, MUTATIONS, HANDLERS, DND
// Вставьте сразу после PART 1
// ═══════════════════════════════════════════════════════════

  // ─────────────────────────────────────────────────────────────
  // DERIVED DATA
  // ─────────────────────────────────────────────────────────────

  const defaultCurrencyCode = partner?.default_currency || "KZT";
  const currencySymbol =
    AVAILABLE_CURRENCIES.find((c) => c.code === defaultCurrencyCode)?.symbol ||
    defaultCurrencyCode;

  const enabledLanguages = useMemo(() => {
    const defaultLang = partner?.default_language || "RU";
    const enabled = partner?.enabled_languages;
    if (Array.isArray(enabled) && enabled.length > 0) {
      return enabled;
    }
    return [defaultLang];
  }, [partner?.default_language, partner?.enabled_languages]);

  const defaultLanguage = partner?.default_language || "RU";

  const viewMode = partner?.contacts_view_mode || "full";

  const activeContactLinks = useMemo(() => {
    return (Array.isArray(contactLinksRaw) ? contactLinksRaw : [])
      .filter((link) => link.is_active !== false)
      .sort((a, b) => {
        const oa = a?.sort_order;
        const ob = b?.sort_order;
        if (oa == null && ob == null) return 0;
        if (oa == null) return 1;
        if (ob == null) return -1;
        return oa - ob;
      });
  }, [contactLinksRaw]);

  const categories = useMemo(
    () => sortCategoriesStable(categoriesRaw),
    [categoriesRaw]
  );

  const categoriesMap = useMemo(() => {
    return new Map(categories.map((c) => [c.id, c]));
  }, [categories]);

  const allActiveDishes = useMemo(() => {
    const arr = Array.isArray(dishesRaw) ? dishesRaw : [];
    return arr.filter((d) => !isArchivedDish(d));
  }, [dishesRaw]);

  const dishCountByCategory = useMemo(() => {
    const counts = new Map();
    allActiveDishes.forEach((dish) => {
      const catId = dish?.category;
      if (catId) {
        counts.set(catId, (counts.get(catId) || 0) + 1);
      }
    });
    return counts;
  }, [allActiveDishes]);

  const dishesActive = useMemo(() => {
    return allActiveDishes.filter((d) => isDishEnabledForMode(d, orderMode));
  }, [allActiveDishes, orderMode]);

  const dishesFiltered = useMemo(() => {
    const s = normStr(search).trim().toLowerCase();
    if (!s) return sortDishesStable(dishesActive);
    return sortDishesStable(
      dishesActive.filter((d) =>
        normStr(d?.name).toLowerCase().includes(s)
      )
    );
  }, [dishesActive, search]);

  const {
    displayCategories,
    dishesByCategory,
    getOrderedDishesForCategory,
    draggingCatId,
    dragOverCatId,
    draggingDishId,
    draggingDishSourceCatId,
    dragOverCategoryId,
    dragOverDishId,
    dragAtEnd,
    dragPreview,
    dragPreviewPos,
    pendingMoveDish,
    isSavingDish,
    sectionRefs,
    dishItemRefs,
    dishGridRefs,
    catChipsScrollRef,
    catChipRefs,
    onCategoryGripPointerDown,
    onDishGripPointerDown,
  } = useMenuDishesDnd({
    categories,
    categoriesMap,
    dishesRaw,
    dishesFiltered,
    partnerId,
    queryClient,
    fetchingDishes,
  });

  // Persist order mode
  useEffect(() => {
    safeLsSet("menu_preview_mode", orderMode);
  }, [orderMode]);

  // P0.3: Rate limit detector
  useEffect(() => {
    const errors = [partnerError, categoriesError, dishesError, contactsError];
    const hasRateLimit = errors.some(e => e && isRateLimitError(e));
    if (hasRateLimit && !rateLimitHit) {
      setRateLimitHit(true);
      toast.error("Слишком много запросов. Подождите немного.", { id: TOAST_ID });
    }
  }, [partnerError, categoriesError, dishesError, contactsError, rateLimitHit]);

  // P0.2: Warn if dishes count hits the 100 limit
  useEffect(() => {
    if (dishesRaw && dishesRaw.length === 100) {
      toast.warning("Загружено 100 блюд — возможно, есть ещё. Обратитесь в поддержку.", {
        id: "dishes-limit-warning",
        duration: 10000
      });
    }
  }, [dishesRaw]);

  // ─────────────────────────────────────────────────────────────
  // MUTATIONS
  // ─────────────────────────────────────────────────────────────

  // BUG-MD-005 FIX: Close dialog in onSuccess, not immediately after mutate()
  const savePartnerMutation = useMutation({
    mutationFn: async (payload) => {
      return base44.entities.Partner.update(partnerId, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["partner", partnerId] });
      setSettingsDialogOpen(false);
      toast.success("Настройки сохранены", { id: TOAST_ID });
    },
    onError: () => toast.error("Не удалось сохранить", { id: TOAST_ID }),
  });

  // BUG-MD-006 FIX: Accept sort_order via payload to avoid stale closure
  const createContactLinkMutation = useMutation({
    mutationFn: async (payload) => {
      return base44.entities.PartnerContactLink.create({
        ...payload,
        partner: partnerId,
        is_active: true,
      });
    },
    onSuccess: (newLink) => {
      queryClient.invalidateQueries({ queryKey: ["partnerContactLinks", partnerId] });
      setEditingContactLinks((prev) => [...prev, newLink]);
      setNewContactForm({ type: "phone", label: "", url: "" });
      toast.success("Контакт добавлен", { id: TOAST_ID });
    },
    onError: () => toast.error("Не удалось добавить контакт", { id: TOAST_ID }),
  });

  const deleteContactLinkMutation = useMutation({
    mutationFn: async (id) => {
      return base44.entities.PartnerContactLink.delete(id);
    },
    onSuccess: (_, deletedId) => {
      queryClient.invalidateQueries({ queryKey: ["partnerContactLinks", partnerId] });
      setEditingContactLinks((prev) => prev.filter((c) => c.id !== deletedId));
      toast.success("Контакт удалён", { id: TOAST_ID });
    },
    onError: () => toast.error("Не удалось удалить контакт", { id: TOAST_ID }),
  });

  // BUG-MD-004 FIX: Pass metadata through mutation to avoid stale closure
  const saveCategoryMutation = useMutation({
    mutationFn: async ({ payload, meta }) => {
      if (meta.isEdit) {
        return base44.entities.Category.update(meta.editId, payload);
      }
      return base44.entities.Category.create({ ...payload, partner: partnerId });
    },
    onSuccess: (_, { meta }) => {
      queryClient.invalidateQueries({ queryKey: ["categories", partnerId] });
      setCategoryDialogOpen(false);
      setEditingCategory(null);
      toast.success(
        meta.isEdit
          ? `Раздел «${meta.name}» обновлён`
          : `Раздел «${meta.name}» создан`,
        { id: TOAST_ID }
      );
    },
    onError: () => toast.error("Не удалось сохранить раздел", { id: TOAST_ID }),
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: async (categoryId) => {
      return base44.entities.Category.delete(categoryId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories", partnerId] });
      setCategoryDialogOpen(false);
      setEditingCategory(null);
      toast.success("Раздел удалён", { id: TOAST_ID });
    },
    onError: () => toast.error("Не удалось удалить раздел", { id: TOAST_ID }),
  });

  // BUG-MD-004 FIX: Pass metadata through mutation to avoid stale closure
  const saveDishMutation = useMutation({
    mutationFn: async ({ payload, meta }) => {
      if (meta.isEdit) {
        return base44.entities.Dish.update(meta.editId, payload);
      }
      return base44.entities.Dish.create(payload);
    },
    onSuccess: (_, { meta }) => {
      queryClient.invalidateQueries({ queryKey: ["dishes", partnerId] });
      setDishDialogOpen(false);
      setEditingDish(null);
      toast.success(
        meta.isEdit
          ? `Блюдо «${meta.name}» обновлено`
          : `Блюдо «${meta.name}» добавлено`,
        { id: TOAST_ID }
      );
    },
    onError: () => toast.error("Не удалось сохранить блюдо", { id: TOAST_ID }),
  });

  // P1.4: Use is_archived field instead of description marker
  const archiveDishMutation = useMutation({
    mutationFn: (dish) =>
      base44.entities.Dish.update(dish.id, {
        is_archived: true,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dishes", partnerId] });
      toast.success("Блюдо архивировано", { id: TOAST_ID });
    },
    onError: () => toast.error("Не удалось архивировать блюдо", { id: TOAST_ID }),
  });

  // ─────────────────────────────────────────────────────────────
  // HANDLERS
  // ─────────────────────────────────────────────────────────────

  function handleBack() {
    navigate("/menumanage");
  }

  // P0.5: XSS protection - encode partnerId
  function previewGuestMenu() {
    if (!partnerId) return;
    const modeParam = orderMode === "hall" ? "" : `&mode=${encodeURIComponent(orderMode)}`;
    window.open(
      `/x?partner=${encodeURIComponent(partnerId)}${modeParam}`,
      "_blank",
      "noopener,noreferrer"
    );
  }

  function handleModeChange(mode) {
    setOrderMode(mode);
  }

  function scrollToCategory(id) {
    const el = sectionRefs.current[id];
    if (!el) return;
    const offset = 180;
    const top = window.scrollY + el.getBoundingClientRect().top - offset;
    window.scrollTo({ top, behavior: "smooth" });
    setActiveCategoryId(id);
  }

  // ─── Settings Dialog (Name + Address + Contacts) ───

  function openSettingsDialog() {
    setSettingsForm({
      name: normStr(partner?.name),
      address: normStr(partner?.address),
    });
    setEditingContactLinks([...activeContactLinks]);
    setNewContactForm({ type: "phone", label: "", url: "" });
    setSettingsDialogOpen(true);
  }

  function handleContactClick(url) {
    if (!url) return;
    if (!isUrlSafe(url)) {
      toast.error("Недопустимая ссылка", { id: TOAST_ID });
      return;
    }
    if (url.startsWith("tel:") || url.startsWith("mailto:")) {
      window.location.href = url;
    } else {
      window.open(url, "_blank", "noopener,noreferrer");
    }
  }

  // BUG-MD-005 FIX: Don't close dialog immediately — close in onSuccess
  function saveSettings() {
    const payload = {
      name: normStr(settingsForm.name).trim(),
      address: normStr(settingsForm.address).trim(),
    };
    if (!payload.name) {
      toast.error("Название ресторана обязательно", { id: TOAST_ID });
      return;
    }
    savePartnerMutation.mutate(payload);
  }

  // P0.6: XSS protection - validate URL before saving
  function addNewContact() {
    const url = normStr(newContactForm.url).trim();
    if (!url) {
      toast.error("Укажите ссылку/номер", { id: TOAST_ID });
      return;
    }
    if (!isUrlSafe(url)) {
      toast.error("Недопустимый формат ссылки", { id: TOAST_ID });
      return;
    }
    // BUG-MD-006 FIX: Evaluate sort_order at call time, not closure time
    createContactLinkMutation.mutate({
      type: newContactForm.type,
      label: normStr(newContactForm.label).trim() || getDefaultContactLabel(newContactForm.type),
      url: url,
      sort_order: (editingContactLinks.length + 1) * 10,
    });
  }

  function removeContact(id) {
    deleteContactLinkMutation.mutate(id);
  }

  // ─── Category Dialog ───

  function openCreateCategory() {
    setEditingCategory(null);
    setCategoryForm({ name: "", sort_order: "", is_active: true });
    setCategoryLangTab(defaultLanguage);
    setCategoryTranslations({});
    setCategoryDialogOpen(true);
  }

  function openEditCategory(cat) {
    setEditingCategory(cat);
    setCategoryForm({
      name: normStr(cat?.name),
      sort_order: cat?.sort_order == null ? "" : String(cat.sort_order),
      is_active: cat?.is_active !== false,
    });
    setCategoryLangTab(defaultLanguage);
    setCategoryTranslations(cat?.translations || {});
    setCategoryDialogOpen(true);
  }

  function saveCategory() {
    if (!normStr(categoryForm.name).trim()) {
      toast.error("Название раздела обязательно", { id: TOAST_ID });
      return;
    }
    const payload = {
      name: normStr(categoryForm.name).trim(),
      is_active: categoryForm.is_active !== false,
    };
    const so = normStr(categoryForm.sort_order).trim();
    if (so) payload.sort_order = Number.parseInt(so, 10);

    const cleanTranslations = {};
    Object.entries(categoryTranslations).forEach(([langCode, trans]) => {
      if (trans && trans.name) {
        cleanTranslations[langCode] = { name: normStr(trans.name).trim() };
      }
    });
    if (Object.keys(cleanTranslations).length > 0) {
      payload.translations = cleanTranslations;
    }

    // BUG-MD-004 FIX: Pass metadata to avoid stale closure in onSuccess
    saveCategoryMutation.mutate({
      payload,
      meta: {
        name: normStr(categoryForm.name).trim(),
        isEdit: !!editingCategory,
        editId: editingCategory?.id,
      },
    });
  }

  function handleDeleteCategory() {
    if (!editingCategory) return;

    const dishCount = dishCountByCategory.get(editingCategory.id) || 0;
    const catName = normStr(editingCategory.name);

    if (dishCount > 0) {
      openConfirm({
        title: "Невозможно удалить раздел",
        description: `В разделе «${catName}» ${dishCount} ${dishCount === 1 ? "блюдо" : dishCount < 5 ? "блюда" : "блюд"}. Сначала переместите их в другой раздел.`,
        actionText: "Понятно",
        variant: "warning",
        showCancel: false,
        onConfirm: () => {},
      });
    } else {
      openConfirm({
        title: `Удалить раздел «${catName}»?`,
        description: "Это действие нельзя отменить.",
        actionText: "Удалить",
        variant: "danger",
        showCancel: true,
        onConfirm: () => {
          deleteCategoryMutation.mutate(editingCategory.id);
        },
      });
    }
  }

  // ─── Dish Dialog ───

  function openCreateDish(prefillCategoryId = "") {
    setEditingDish(null);
    setDishForm({
      name: "",
      description: "",
      price: "",
      image: "",
      enabled_hall: true,
      enabled_pickup: true,
      enabled_delivery: true,
      sort_order: "",
      category: prefillCategoryId || "",
      categories: prefillCategoryId ? [prefillCategoryId] : [],
    });
    setDishLangTab(defaultLanguage);
    setDishTranslations({});
    setDishDialogOpen(true);
  }

  function openEditDish(dish) {
    const ids = getDishCategoryIds(dish);
    setEditingDish(dish);
    setDishForm({
      name: normStr(dish?.name),
      description: normStr(dish?.description),
      price: dish?.price == null ? "" : String(dish.price),
      image: normStr(dish?.image),
      enabled_hall: dish?.enabled_hall !== false,
      enabled_pickup: dish?.enabled_pickup !== false,
      enabled_delivery: dish?.enabled_delivery !== false,
      sort_order: dish?.sort_order == null ? "" : String(dish.sort_order),
      category: dish?.category || ids[0] || "",
      categories: ids,
    });
    setDishLangTab(defaultLanguage);
    setDishTranslations(dish?.translations || {});
    setDishDialogOpen(true);
  }

  function toggleDishCategory(catId) {
    setDishForm((f) => {
      const cur = Array.isArray(f.categories) ? f.categories : [];
      const set = new Set(cur);
      if (set.has(catId)) set.delete(catId);
      else set.add(catId);
      const next = Array.from(set);
      const primary =
        f.category && next.includes(f.category) ? f.category : next[0] || "";
      return { ...f, categories: next, category: primary };
    });
  }

  function saveDish() {
    if (!normStr(dishForm.name).trim()) {
      toast.error("Название блюда обязательно", { id: TOAST_ID });
      return;
    }

    const categoriesArr = Array.isArray(dishForm.categories)
      ? dishForm.categories.filter(Boolean)
      : [];
    const primary = dishForm.category || categoriesArr[0] || "";

    const payload = {
      name: normStr(dishForm.name).trim(),
      description: normStr(dishForm.description),
      price: Number.parseFloat(normStr(dishForm.price)) || 0,
      image: normStr(dishForm.image),
      enabled_hall: dishForm.enabled_hall !== false,
      enabled_pickup: dishForm.enabled_pickup !== false,
      enabled_delivery: dishForm.enabled_delivery !== false,
      category: primary,
    };

    const cleanTranslations = {};
    Object.entries(dishTranslations).forEach(([langCode, trans]) => {
      if (trans && (trans.name || trans.description)) {
        cleanTranslations[langCode] = {
          name: normStr(trans.name).trim(),
          description: normStr(trans.description).trim(),
        };
      }
    });
    if (Object.keys(cleanTranslations).length > 0) {
      payload.translations = cleanTranslations;
    }

    const so = normStr(dishForm.sort_order).trim();
    if (so) payload.sort_order = Number.parseInt(so, 10);

    // P1.3: Use only categories field (category_ids removed)
    if (categoriesArr.length) {
      payload.categories = categoriesArr;
    }

    if (!editingDish) payload.partner = partnerId;

    // BUG-MD-004 FIX: Pass metadata to avoid stale closure in onSuccess
    saveDishMutation.mutate({
      payload,
      meta: {
        name: normStr(dishForm.name).trim(),
        isEdit: !!editingDish,
        editId: editingDish?.id,
      },
    });
  }

  function handleArchiveDish(dish) {
    openConfirm({
      title: "Архивировать блюдо?",
      description: `«${dish.name}» будет скрыто из меню.`,
      actionText: "Архивировать",
      variant: "danger",
      showCancel: true,
      onConfirm: () => archiveDishMutation.mutate(dish),
    });
  }

  // Confirm dialog
  function openConfirm({ title, description, actionText, onConfirm, variant = "danger", showCancel = true }) {
    setConfirmState({ title, description, actionText, onConfirm, variant, showCancel });
    setConfirmOpen(true);
  }

  function closeConfirm() {
    setConfirmOpen(false);
    setConfirmState({ title: "", description: "", actionText: "", onConfirm: null, variant: "danger", showCancel: true });
  }

  function handleConfirmAction() {
    const fn = confirmState.onConfirm;
    closeConfirm();
    if (typeof fn === "function") fn();
  }

  // ─────────────────────────────────────────────────────────────
  // SCROLL SPY
  // ─────────────────────────────────────────────────────────────

  useEffect(() => {
    const ids = displayCategories.map((c) => c.id);
    if (!ids.length) return;

    let raf = 0;
    const offset = 200;

    const onScroll = () => {
      if (raf) return;
      raf = window.requestAnimationFrame(() => {
        raf = 0;

        let bestId = ids[0];
        let bestTop = -Infinity;

        ids.forEach((id) => {
          const el = sectionRefs.current[id];
          if (!el) return;
          const rect = el.getBoundingClientRect();
          const top = rect.top;
          if (top <= offset && top > bestTop) {
            bestTop = top;
            bestId = id;
          }
        });

        if (bestTop === -Infinity) {
          for (const id of ids) {
            const el = sectionRefs.current[id];
            if (!el) continue;
            const rect = el.getBoundingClientRect();
            if (rect.top > offset) {
              bestId = id;
              break;
            }
          }
        }

        setActiveCategoryId(bestId);
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) window.cancelAnimationFrame(raf);
    };
  }, [displayCategories]);

// ═══════════════════════════════════════════════════════════
// КОНЕЦ PART 2 — продолжение в PART 3
// ═══════════════════════════════════════════════════════════
// ═══════════════════════════════════════════════════════════
// PART 3 — GUARDS, RENDER (JSX), DIALOGS
// Вставьте сразу после PART 2
// ═══════════════════════════════════════════════════════════

  // ─────────────────────────────────────────────────────────────
  // GUARDS
  // ─────────────────────────────────────────────────────────────

  // P0.1: Auth error → redirect to login
  if (authError) {
    base44.auth.redirectToLogin(window.location.pathname + window.location.search);
    return null;
  }

  // P0.3: Rate limit hit → show recovery UI
  if (rateLimitHit) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <Card className="max-w-md border-amber-200 bg-amber-50">
          <CardContent className="p-6 text-center space-y-4">
            <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto" />
            <h2 className="text-xl font-bold text-slate-900">Слишком много запросов</h2>
            <p className="text-slate-600">
              Сервер временно ограничил количество запросов. Подождите немного и попробуйте снова.
            </p>
            <Button
              onClick={() => {
                setRateLimitHit(false);
                queryClient.invalidateQueries();
              }}
              className="bg-amber-600 hover:bg-amber-700"
            >
              Попробовать снова
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loadingUser) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex items-center gap-3 text-slate-600">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Загрузка...</span>
        </div>
      </div>
    );
  }

  if (!partnerId) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center space-y-3">
            <h1 className="text-xl font-bold text-slate-900">Доступ запрещён</h1>
            <p className="text-slate-600">
              Эта страница доступна только для партнёров.
            </p>
            <Button variant="outline" onClick={() => navigate("/")}>
              На главную
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loadingCategories || loadingDishes) {
    return <MenuSkeleton />;
  }

  // Language helpers for dialogs
  const isDefaultLang = dishLangTab === defaultLanguage;
  const showLangTabs = enabledLanguages.length > 1;

  const getDishFieldValue = (field) => {
    if (isDefaultLang) {
      return dishForm[field] || "";
    }
    return dishTranslations[dishLangTab]?.[field] || "";
  };

  const setDishFieldValue = (field, value) => {
    if (isDefaultLang) {
      setDishForm((f) => ({ ...f, [field]: value }));
    } else {
      setDishTranslations((prev) => ({
        ...prev,
        [dishLangTab]: {
          ...(prev[dishLangTab] || {}),
          [field]: value,
        },
      }));
    }
  };

  const hasAnyDishes = dishesFiltered.length > 0;
  const showNoSearchResults =
    normStr(search).trim() && !hasAnyDishes && categories.length > 0;

  // ─────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-slate-50">
      <MenuDishesDragPreview
        dragPreview={dragPreview}
        dragPreviewPos={dragPreviewPos}
      />

      <MenuDishesToolbar
        orderMode={orderMode}
        onBack={handleBack}
        onModeChange={handleModeChange}
        onPreview={previewGuestMenu}
      />

      <MenuDishesHeader
        loadingPartner={loadingPartner}
        partner={partner}
        activeContactLinks={activeContactLinks}
        viewMode={viewMode}
        getContactIcon={getContactIcon}
        getDefaultContactLabel={getDefaultContactLabel}
        onEditSettings={openSettingsDialog}
        onContactClick={handleContactClick}
      />

      <MenuDishesCategoryChips
        displayCategories={displayCategories}
        activeCategoryId={activeCategoryId}
        draggingCatId={draggingCatId}
        dragOverCatId={dragOverCatId}
        catChipsScrollRef={catChipsScrollRef}
        catChipRefs={catChipRefs}
        search={search}
        onSearchChange={setSearch}
        onCategoryGripPointerDown={onCategoryGripPointerDown}
        onScrollToCategory={scrollToCategory}
        onEditCategory={openEditCategory}
        onCreateCategory={openCreateCategory}
      />

      <MenuDishesCategoryList
        categories={categories}
        showNoSearchResults={showNoSearchResults}
        search={search}
        onSearchClear={() => setSearch("")}
        onCreateCategory={openCreateCategory}
        displayCategories={displayCategories}
        dishesByCategory={dishesByCategory}
        getOrderedDishesForCategory={getOrderedDishesForCategory}
        draggingDishId={draggingDishId}
        dragOverCategoryId={dragOverCategoryId}
        draggingDishSourceCatId={draggingDishSourceCatId}
        dragOverDishId={dragOverDishId}
        dragAtEnd={dragAtEnd}
        pendingMoveDish={pendingMoveDish}
        isSavingDish={isSavingDish}
        sectionRefs={sectionRefs}
        dishGridRefs={dishGridRefs}
        dishItemRefs={dishItemRefs}
        defaultCurrencyCode={defaultCurrencyCode}
        onAddDish={openCreateDish}
        onDishGripPointerDown={onDishGripPointerDown}
        onEditDish={openEditDish}
        onArchiveDish={handleArchiveDish}
      />

      {/* ═══════════════════════════════════════════════════════════
          DIALOGS
          ═══════════════════════════════════════════════════════════ */}

      {/* Settings Dialog (Name + Address + Contacts) */}
      <SettingsDialog
        open={settingsDialogOpen}
        settingsForm={settingsForm}
        editingContactLinks={editingContactLinks}
        newContactForm={newContactForm}
        contactTypes={CONTACT_TYPES}
        isSaving={savePartnerMutation.isPending}
        isCreatingContact={createContactLinkMutation.isPending}
        isDeletingContact={deleteContactLinkMutation.isPending}
        onOpenChange={setSettingsDialogOpen}
        onNameChange={(name) => setSettingsForm((f) => ({ ...f, name }))}
        onAddressChange={(address) =>
          setSettingsForm((f) => ({ ...f, address }))
        }
        onContactTypeChange={(type) =>
          setNewContactForm((f) => ({ ...f, type }))
        }
        onContactUrlChange={(url) =>
          setNewContactForm((f) => ({ ...f, url }))
        }
        onAddContact={addNewContact}
        onRemoveContact={removeContact}
        onSave={saveSettings}
      />

      <CategoryDialog
        open={categoryDialogOpen}
        editingCategory={editingCategory}
        categoryForm={categoryForm}
        categoryLangTab={categoryLangTab}
        categoryTranslations={categoryTranslations}
        enabledLanguages={enabledLanguages}
        defaultLanguage={defaultLanguage}
        isDeleting={deleteCategoryMutation.isPending}
        isSaving={saveCategoryMutation.isPending}
        onOpenChange={setCategoryDialogOpen}
        onLangTabChange={setCategoryLangTab}
        onNameChange={(name) => setCategoryForm((f) => ({ ...f, name }))}
        onTranslationNameChange={(langCode, name) => {
          setCategoryTranslations((prev) => ({
            ...prev,
            [langCode]: { ...prev[langCode], name },
          }));
        }}
        onActiveChange={(isActive) =>
          setCategoryForm((f) => ({ ...f, is_active: isActive }))
        }
        onDelete={handleDeleteCategory}
        onSave={saveCategory}
      />

      {/* Dish Dialog */}
      <DishEditModal
        open={dishDialogOpen}
        editingDish={editingDish}
        dishForm={dishForm}
        dishLangTab={dishLangTab}
        categories={categories}
        enabledLanguages={enabledLanguages}
        defaultLanguage={defaultLanguage}
        showLangTabs={showLangTabs}
        isDefaultLang={isDefaultLang}
        currencySymbol={currencySymbol}
        isSaving={saveDishMutation.isPending}
        onOpenChange={setDishDialogOpen}
        onLangTabChange={setDishLangTab}
        onDishFormChange={(field, value) =>
          setDishForm((f) => ({ ...f, [field]: value }))
        }
        onDishFieldChange={setDishFieldValue}
        onToggleCategory={toggleDishCategory}
        onSave={saveDish}
        getDishFieldValue={getDishFieldValue}
      />

      <ConfirmDialog
        open={confirmOpen}
        title={confirmState.title}
        description={confirmState.description}
        actionText={confirmState.actionText}
        variant={confirmState.variant}
        showCancel={confirmState.showCancel}
        onOpenChange={setConfirmOpen}
        onCancel={closeConfirm}
        onConfirm={handleConfirmAction}
      />
    </div>
  );
}
