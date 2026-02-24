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

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Eye,
  Globe,
  GripVertical,
  Loader2,
  MapPin,
  Pencil,
  Phone,
  Mail,
  MessageCircle,
  Link as LinkIcon,
  Plus,
  Save,
  Store,
  Package,
  Truck,
  Trash2,
  Image as ImageIcon,
  X,
  AlertTriangle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { toast } from "sonner";

import {
  isDishEnabledForMode,
  sortCategoriesStable,
  sortDishesStable,
} from "@/components/menuChannelLogic";

/* ============================================================
   CONSTANTS
   ============================================================ */

const TOAST_ID = "mm1";

// BUG 2 FIX: Header height for auto-scroll calculation
const HEADER_HEIGHT = 180;
const SCROLL_PAD = 80;
const SCROLL_SPEED = 12;

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

function safeLsGet(key, fallback) {
  try {
    const v = localStorage.getItem(key);
    return v == null ? fallback : v;
  } catch {
    return fallback;
  }
}

function safeLsSet(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* ignore */
  }
}

function normStr(v) {
  return String(v == null ? "" : v);
}

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
   RATE LIMIT HELPERS (P0.3)
   ============================================================ */

function isRateLimitError(error) {
  if (!error) return false;
  const msg = (error.message || error.toString() || "").toLowerCase();
  return msg.includes("rate limit") || msg.includes("429");
}

function shouldRetry(failureCount, error) {
  if (isRateLimitError(error)) return false;
  return failureCount < 2;
}

/* ============================================================
   BATCHED UPDATES HELPER (P0.4)
   ============================================================ */

// BUG-MD-002 FIX: Use Promise.allSettled to avoid partial failure leaving DB inconsistent
async function batchedUpdates(items, updateFn, batchSize = 5, delayMs = 100) {
  const results = [];
  const failed = [];
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const settled = await Promise.allSettled(batch.map(updateFn));
    settled.forEach((r, idx) => {
      if (r.status === "fulfilled") results.push(r.value);
      else failed.push({ item: batch[idx], reason: r.reason });
    });
    if (i + batchSize < items.length) {
      await new Promise(r => setTimeout(r, delayMs));
    }
  }
  if (failed.length > 0) {
    const err = new Error(`${failed.length} of ${items.length} updates failed`);
    err.failed = failed;
    err.results = results;
    throw err;
  }
  return results;
}

/* ============================================================
   URL SECURITY HELPERS (P0.5-P0.6)
   ============================================================ */

const ALLOWED_PROTOCOLS = ['http:', 'https:', 'tel:', 'mailto:'];

function isUrlSafe(url) {
  if (!url) return false;
  if (url.startsWith('tel:') || url.startsWith('mailto:')) return true;
  try {
    const parsed = new URL(url);
    return ALLOWED_PROTOCOLS.includes(parsed.protocol);
  } catch {
    return false;
  }
}

function getDefaultContactLabel(type) {
  const found = CONTACT_TYPES.find((t) => t.value === type);
  return found?.label || "Ссылка";
}

function formatPriceDisplay(price, currencyCode = "KZT") {
  const n = Number(price || 0);
  const curr = AVAILABLE_CURRENCIES.find((c) => c.code === currencyCode);
  const symbol = curr?.symbol || currencyCode;
  const decimals = ["KZT", "RUB", "JPY", "KRW"].includes(currencyCode) ? 0 : 2;
  const formatted = n.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  return `${formatted} ${symbol}`;
}

// Get ALL category IDs for a dish (not just primary)
function getDishCategoryIds(dish) {
  const a = dish?.categories;
  const b = dish?.category_ids;
  if (Array.isArray(a) && a.length) return a.filter(Boolean);
  if (Array.isArray(b) && b.length) return b.filter(Boolean);
  const single = dish?.category;
  return single ? [single] : [];
}

function syncOrderIds(prevIds, currentIds) {
  const set = new Set(currentIds);
  const filtered = (Array.isArray(prevIds) ? prevIds : []).filter((id) => set.has(id));
  const filteredSet = new Set(filtered);
  const missing = currentIds.filter((id) => !filteredSet.has(id));
  return [...filtered, ...missing];
}

function moveToIndex(ids, id, index) {
  const cur = Array.isArray(ids) ? [...ids] : [];
  const from = cur.indexOf(id);
  if (from === -1) return cur;
  const clamped = Math.max(0, Math.min(Number(index ?? 0), cur.length));
  cur.splice(from, 1);
  const nextIndex = from < clamped ? clamped - 1 : clamped;
  cur.splice(nextIndex, 0, id);
  return cur;
}

function reorderInsert(ids, movingId, insertIndex) {
  const cur = Array.isArray(ids) ? [...ids] : [];
  const from = cur.indexOf(movingId);
  if (from !== -1) {
    cur.splice(from, 1);
  }
  let idx = Number(insertIndex ?? 0);
  if (Number.isNaN(idx)) idx = 0;
  if (from !== -1 && from < idx) idx -= 1;
  idx = Math.max(0, Math.min(idx, cur.length));
  cur.splice(idx, 0, movingId);
  return cur;
}

// BUG 1 FIX: Row-based grid insert calculation
function getGridInsertIndex(pointerX, pointerY, gridEl, dishItemRefs, targetCatId, orderedIds, excludeDishId) {
  if (!gridEl || !orderedIds.length) return 0;
  
  const cards = [];
  for (let i = 0; i < orderedIds.length; i++) {
    const id = orderedIds[i];
    if (id === excludeDishId) continue;
    const refKey = `${targetCatId}-${id}`;
    const el = dishItemRefs[refKey];
    if (!el) continue;
    const rect = el.getBoundingClientRect();
    cards.push({
      id,
      originalIndex: i,
      centerX: rect.left + rect.width / 2,
      centerY: rect.top + rect.height / 2,
      top: rect.top,
      bottom: rect.bottom,
      left: rect.left,
      right: rect.right,
    });
  }
  
  if (cards.length === 0) return 0;
  
  const ROW_TOLERANCE = 50;
  const rows = [];
  
  const sortedByY = [...cards].sort((a, b) => a.centerY - b.centerY);
  
  for (const card of sortedByY) {
    let foundRow = null;
    for (const row of rows) {
      if (Math.abs(row.centerY - card.centerY) < ROW_TOLERANCE) {
        foundRow = row;
        break;
      }
    }
    
    if (foundRow) {
      foundRow.cards.push(card);
      foundRow.minY = Math.min(foundRow.minY, card.top);
      foundRow.maxY = Math.max(foundRow.maxY, card.bottom);
    } else {
      rows.push({
        centerY: card.centerY,
        minY: card.top,
        maxY: card.bottom,
        cards: [card],
      });
    }
  }
  
  for (const row of rows) {
    row.cards.sort((a, b) => a.centerX - b.centerX);
  }
  
  rows.sort((a, b) => a.centerY - b.centerY);
  
  let targetRowIndex = rows.length - 1;
  for (let r = 0; r < rows.length; r++) {
    const row = rows[r];
    if (pointerY < row.centerY) {
      targetRowIndex = r;
      break;
    }
  }
  
  const targetRow = rows[targetRowIndex];
  if (!targetRow) return orderedIds.length;
  
  let insertInRow = targetRow.cards.length;
  for (let c = 0; c < targetRow.cards.length; c++) {
    const card = targetRow.cards[c];
    if (pointerX < card.centerX) {
      insertInRow = c;
      break;
    }
  }
  
  let globalIndex = 0;
  for (let r = 0; r < targetRowIndex; r++) {
    globalIndex += rows[r].cards.length;
  }
  globalIndex += insertInRow;
  
  const insertedCards = [];
  for (let r = 0; r <= targetRowIndex; r++) {
    const cardsInRow = r < targetRowIndex ? rows[r].cards : rows[r].cards.slice(0, insertInRow);
    insertedCards.push(...cardsInRow);
  }
  
  return insertedCards.length;
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

  // DnD state - categories
  const [catOrderIds, setCatOrderIds] = useState([]);
  const [draggingCatId, setDraggingCatId] = useState("");
  const [dragOverCatId, setDragOverCatId] = useState("");

  // DnD state - dishes (cross-category)
  const [dishOrderByCat, setDishOrderByCat] = useState({});
  const [draggingDishId, setDraggingDishId] = useState("");
  const [draggingDishSourceCatId, setDraggingDishSourceCatId] = useState("");
  const [dragOverCategoryId, setDragOverCategoryId] = useState("");
  const [dragOverDishId, setDragOverDishId] = useState("");
  const [dragInsertIndex, setDragInsertIndex] = useState(0);
  
  // BUG 4 FIX: Track if dropping at end of category
  const [dragAtEnd, setDragAtEnd] = useState(false);
  
  // Pending move - for optimistic UI update
  const [pendingMoveDish, setPendingMoveDish] = useState(null);

  // P0.3: Rate limit state
  const [rateLimitHit, setRateLimitHit] = useState(false);

  // Drag preview
  const [dragPreview, setDragPreview] = useState(null);
  const [dragPreviewPos, setDragPreviewPos] = useState({ x: 0, y: 0 });

  // Refs
  const sectionRefs = useRef({});
  const dishItemRefs = useRef({});
  const dishGridRefs = useRef({});
  const catChipsScrollRef = useRef(null);
  const catChipRefs = useRef({});
  const catOrderIdsRef = useRef([]);
  const dishOrderByCatRef = useRef({});
  const draggingCatIdRef = useRef("");
  const draggingDishIdRef = useRef("");
  const draggingDishSourceCatIdRef = useRef("");
  const dragOverCategoryIdRef = useRef("");
  const dragInsertIndexRef = useRef(0);
  const dragStartCatIdsRef = useRef([]);
  const dragStartDishIdsRef = useRef({});
  const dragMovePosRef = useRef({ x: 0, y: 0 });
  const dragDishMovePosRef = useRef({ x: 0, y: 0 });
  const dragRafRef = useRef(0);
  const dragDishRafRef = useRef(0);
  const dragPreviewDimsRef = useRef({ width: 180, height: 36 });

  // Sync refs
  useEffect(() => {
    catOrderIdsRef.current = catOrderIds;
  }, [catOrderIds]);

  useEffect(() => {
    dishOrderByCatRef.current = dishOrderByCat;
  }, [dishOrderByCat]);

  useEffect(() => {
    draggingCatIdRef.current = draggingCatId;
  }, [draggingCatId]);

  useEffect(() => {
    draggingDishIdRef.current = draggingDishId;
  }, [draggingDishId]);

  useEffect(() => {
    draggingDishSourceCatIdRef.current = draggingDishSourceCatId;
  }, [draggingDishSourceCatId]);

  useEffect(() => {
    dragOverCategoryIdRef.current = dragOverCategoryId;
  }, [dragOverCategoryId]);

  useEffect(() => {
    dragInsertIndexRef.current = dragInsertIndex;
  }, [dragInsertIndex]);

  useEffect(() => {
    if (dragPreview) {
      dragPreviewDimsRef.current = {
        width: Number(dragPreview.width || 180),
        height: Number(dragPreview.height || 36),
      };
    }
  }, [dragPreview]);

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

  // BUG 3 FIX: Build dishes by category - use Set to prevent duplicates
  const dishesByCategory = useMemo(() => {
    const result = new Map();
    
    categories.forEach((cat) => {
      result.set(cat.id, []);
    });
    
    dishesFiltered.forEach((dish) => {
      if (pendingMoveDish && dish.id === pendingMoveDish.dishId) {
        if (result.has(pendingMoveDish.toCatId)) {
          result.get(pendingMoveDish.toCatId).push(dish);
        }
        return;
      }
      
      const addedToCats = new Set();
      const catIds = getDishCategoryIds(dish);
      
      catIds.forEach((catId) => {
        if (result.has(catId) && !addedToCats.has(catId)) {
          result.get(catId).push(dish);
          addedToCats.add(catId);
        }
      });
      
      if (catIds.length === 0 && dish.category && result.has(dish.category) && !addedToCats.has(dish.category)) {
        result.get(dish.category).push(dish);
      }
    });
    
    result.forEach((dishes, catId) => {
      result.set(catId, sortDishesStable(dishes));
    });
    
    return result;
  }, [categories, dishesFiltered, pendingMoveDish]);

  const displayCategories = useMemo(() => {
    const currentIds = categories.map((c) => c.id);
    const order = syncOrderIds(catOrderIds, currentIds);
    const map = new Map(categories.map((c) => [c.id, c]));
    return order.map((id) => map.get(id)).filter(Boolean);
  }, [categories, catOrderIds]);

  // Initialize category order
  useEffect(() => {
    const currentIds = categories.map((c) => c.id);
    setCatOrderIds((prev) =>
      prev && prev.length ? syncOrderIds(prev, currentIds) : currentIds
    );
  }, [categories]);

  // Initialize dish order per category
  useEffect(() => {
    const next = {};
    let changed = false;

    displayCategories.forEach((cat) => {
      const baseList = dishesByCategory.get(cat.id) || [];
      const ids = baseList.map((d) => d.id);
      if (!ids.length) return;
      const prevIds = dishOrderByCatRef.current?.[cat.id];
      const synced = syncOrderIds(prevIds, ids);
      if (
        !Array.isArray(prevIds) ||
        prevIds.join("|") !== synced.join("|")
      ) {
        next[cat.id] = synced;
        changed = true;
      }
    });

    if (changed) {
      setDishOrderByCat((prev) => ({ ...prev, ...next }));
    }
  }, [displayCategories, dishesByCategory]);

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

  // Move dish mutation
  const moveDishToCategoryMutation = useMutation({
    mutationFn: async ({ dishId, targetCatId, categories: newCategories, newOrderIds }) => {
      const payload = {
        category: targetCatId,
      };
      // P1.3: Use only categories field (category_ids removed)
      if (newCategories) {
        payload.categories = newCategories;
      }
      await base44.entities.Dish.update(dishId, payload);
      
      if (newOrderIds && newOrderIds.length > 0) {
        const updates = newOrderIds.map((id, idx) => ({
          id,
          sort_order: (idx + 1) * 10
        }));
        await batchedUpdates(updates, (u) => 
          base44.entities.Dish.update(u.id, { sort_order: u.sort_order })
        );
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dishes", partnerId] });
    },
    onError: () => toast.error("Не удалось переместить блюдо", { id: TOAST_ID }),
  });

  // P0.4: Use batched updates to avoid rate limit
  const saveCategoryOrderMutation = useMutation({
    mutationFn: async ({ ids }) => {
      const map = new Map(categories.map((c) => [c.id, c]));
      const updates = [];
      ids.forEach((id, idx) => {
        const cat = map.get(id);
        if (!cat) return;
        const nextSort = (idx + 1) * 10;
        if (cat.sort_order !== nextSort) {
          updates.push({ id, sort_order: nextSort });
        }
      });
      await batchedUpdates(updates, (u) => 
        base44.entities.Category.update(u.id, { sort_order: u.sort_order })
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories", partnerId] });
    },
    onError: () => toast.error("Не удалось сохранить порядок", { id: TOAST_ID }),
  });

  // P0.4: Use batched updates to avoid rate limit
  const saveDishOrderMutation = useMutation({
    mutationFn: async ({ catId, ids }) => {
      const map = new Map(
        (Array.isArray(dishesRaw) ? dishesRaw : []).map((d) => [d.id, d])
      );
      const updates = [];
      ids.forEach((id, idx) => {
        const dish = map.get(id);
        if (!dish) return;
        const nextSort = (idx + 1) * 10;
        if (dish.sort_order !== nextSort) {
          updates.push({ id, sort_order: nextSort });
        }
      });
      await batchedUpdates(updates, (u) => 
        base44.entities.Dish.update(u.id, { sort_order: u.sort_order })
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dishes", partnerId] });
    },
    onError: () =>
      toast.error("Не удалось сохранить порядок блюд", { id: TOAST_ID }),
  });

  // BUG-MD-003 FIX: Also block during refetch after successful cross-category move
  // Uses fetchingDishes (isFetching) not loadingDishes (isLoading) — isLoading is false during background refetch
  const isSavingDish = moveDishToCategoryMutation.isPending || saveDishOrderMutation.isPending ||
    (moveDishToCategoryMutation.isSuccess && fetchingDishes);

  // ─────────────────────────────────────────────────────────────
  // HANDLERS
  // ─────────────────────────────────────────────────────────────

  function persistCategoryOrder(ids) {
    const safe = Array.isArray(ids) ? ids.filter(Boolean) : [];
    if (!safe.length) return;
    saveCategoryOrderMutation.mutate({ ids: safe });
  }

  function persistDishOrder(catId, ids) {
    const safe = Array.isArray(ids) ? ids.filter(Boolean) : [];
    if (!catId || !safe.length) return;
    saveDishOrderMutation.mutate({ catId, ids: safe });
  }

  function getOrderedDishesForCategory(catId, listBase) {
    const base = Array.isArray(listBase) ? listBase : [];
    const idsCurrent = base.map((d) => d.id);
    const stored = dishOrderByCatRef.current?.[catId];
    const order = syncOrderIds(stored, idsCurrent);
    const map = new Map(base.map((d) => [d.id, d]));
    return order.map((id) => map.get(id)).filter(Boolean);
  }

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

  // Confirm dialog
  function openConfirm({ title, description, actionText, onConfirm, variant = "danger", showCancel = true }) {
    setConfirmState({ title, description, actionText, onConfirm, variant, showCancel });
    setConfirmOpen(true);
  }

  function closeConfirm() {
    setConfirmOpen(false);
    setConfirmState({ title: "", description: "", actionText: "", onConfirm: null, variant: "danger", showCancel: true });
  }

  // ─────────────────────────────────────────────────────────────
  // CATEGORY DND
  // ─────────────────────────────────────────────────────────────

  function onCategoryGripPointerDown(e, id) {
    e.preventDefault();
    e.stopPropagation();

    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      /* no capture */
    }

    // BUG-MD-007 FIX: Cancel any in-flight dish RAF before starting category drag
    if (dragDishRafRef.current) {
      window.cancelAnimationFrame(dragDishRafRef.current);
      dragDishRafRef.current = 0;
    }

    setDraggingDishId("");
    setDraggingDishSourceCatId("");
    setDragOverDishId("");
    setDragOverCategoryId("");
    setDragAtEnd(false);

    const baseIds = categories.map((c) => c.id);
    const synced = syncOrderIds(catOrderIdsRef.current, baseIds);
    dragStartCatIdsRef.current = synced;

    if (!catOrderIdsRef.current || !catOrderIdsRef.current.length) {
      setCatOrderIds(synced);
    }

    setDraggingCatId(id);
    setDragOverCatId(id);

    const tabEl = catChipRefs.current[id];
    if (tabEl && typeof tabEl.getBoundingClientRect === "function") {
      const r = tabEl.getBoundingClientRect();
      setDragPreview({
        type: "category",
        title: normStr(categories.find((c) => c.id === id)?.name || "Раздел"),
        width: r.width,
        height: r.height,
      });
      dragPreviewDimsRef.current = { width: r.width || 180, height: r.height || 36 };
      setDragPreviewPos({ x: e.clientX - r.width / 2, y: e.clientY - r.height / 2 });
    } else {
      setDragPreview({ type: "category", title: "Раздел", width: 180, height: 36 });
      dragPreviewDimsRef.current = { width: 180, height: 36 };
      setDragPreviewPos({ x: e.clientX - 90, y: e.clientY - 18 });
    }
  }

  useEffect(() => {
    if (!draggingCatId) return;

    const onMove = (e) => {
      dragMovePosRef.current = { x: e.clientX, y: e.clientY };
      if (dragRafRef.current) return;

      dragRafRef.current = window.requestAnimationFrame(() => {
        dragRafRef.current = 0;

        const baseIds = categories.map((c) => c.id);
        const ids = syncOrderIds(catOrderIdsRef.current, baseIds);
        if (!ids.length) return;

        const p = dragMovePosRef.current;
        setDragPreviewPos({
          x: p.x - dragPreviewDimsRef.current.width / 2,
          y: p.y - dragPreviewDimsRef.current.height / 2,
        });

        const scrollEl = catChipsScrollRef.current;
        const x = p.x;
        if (scrollEl && typeof scrollEl.getBoundingClientRect === "function") {
          const r = scrollEl.getBoundingClientRect();
          const pad = 36;
          if (x < r.left + pad) scrollEl.scrollLeft -= 12;
          if (x > r.right - pad) scrollEl.scrollLeft += 12;
        }

        let dropIndex = ids.length;
        let hoverId = ids[ids.length - 1] || "";

        for (let i = 0; i < ids.length; i += 1) {
          const cid = ids[i];
          const el = catChipRefs.current[cid];
          if (!el) continue;
          const rect = el.getBoundingClientRect();
          const center = rect.left + rect.width / 2;
          if (x < center) {
            dropIndex = i;
            hoverId = cid;
            break;
          }
        }

        setDragOverCatId(hoverId);

        setCatOrderIds((prev) => {
          const syncedPrev = syncOrderIds(prev, baseIds);
          return moveToIndex(syncedPrev, draggingCatIdRef.current, dropIndex);
        });
      });
    };

    const onUp = () => {
      if (dragRafRef.current) {
        window.cancelAnimationFrame(dragRafRef.current);
        dragRafRef.current = 0;
      }

      const baseIds = categories.map((c) => c.id);
      const nextIds = syncOrderIds(catOrderIdsRef.current, baseIds);
      const prevIds = Array.isArray(dragStartCatIdsRef.current)
        ? dragStartCatIdsRef.current
        : [];

      setDraggingCatId("");
      setDragOverCatId("");
      setDragPreview(null);

      const changed = prevIds.join("|") !== nextIds.join("|");
      if (!changed) return;

      persistCategoryOrder(nextIds);

      toast("Порядок сохранён", {
        id: TOAST_ID,
        duration: 8000,
        action: {
          label: "Отменить",
          onClick: () => {
            setCatOrderIds(prevIds);
            persistCategoryOrder(prevIds);
            toast.message("Отменено", { id: TOAST_ID });
          },
        },
      });
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);

    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
      if (dragRafRef.current) {
        window.cancelAnimationFrame(dragRafRef.current);
        dragRafRef.current = 0;
      }
    };
  }, [draggingCatId, categories]);

  // ─────────────────────────────────────────────────────────────
  // DISH DND (FIXED v4.8)
  // ─────────────────────────────────────────────────────────────

  function onDishGripPointerDown(e, sourceCatId, dishId) {
    if (isSavingDish) return;

    e.preventDefault();
    e.stopPropagation();

    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      /* no capture */
    }

    // BUG-MD-007 FIX: Cancel any in-flight category RAF before starting dish drag
    if (dragRafRef.current) {
      window.cancelAnimationFrame(dragRafRef.current);
      dragRafRef.current = 0;
    }

    setDraggingCatId("");
    setDragOverCatId("");

    const startState = {};
    displayCategories.forEach((cat) => {
      const baseList = dishesByCategory.get(cat.id) || [];
      const ids = baseList.map((d) => d.id);
      startState[cat.id] = syncOrderIds(dishOrderByCatRef.current?.[cat.id], ids);
    });
    dragStartDishIdsRef.current = startState;

    setDraggingDishId(dishId);
    setDraggingDishSourceCatId(sourceCatId);
    setDragOverCategoryId(sourceCatId);
    setDragOverDishId(dishId);
    setDragInsertIndex(0);
    setDragAtEnd(false);

    const el =
      dishItemRefs.current[`${sourceCatId}-${dishId}`] ||
      e.currentTarget?.closest?.('[data-dish-card="1"]');
    if (el && typeof el.getBoundingClientRect === "function") {
      const r = el.getBoundingClientRect();
      setDragPreview({
        type: "dish",
        title: normStr(
          (dishesRaw || []).find((d) => d.id === dishId)?.name || "Блюдо"
        ),
        width: Math.min(r.width, 280),
        height: Math.min(r.height, 200),
      });
      dragPreviewDimsRef.current = { width: Math.min(r.width, 280), height: Math.min(r.height, 200) };
      setDragPreviewPos({ x: e.clientX - r.width / 2, y: e.clientY - 30 });
    } else {
      setDragPreview({ type: "dish", title: "Блюдо", width: 240, height: 120 });
      dragPreviewDimsRef.current = { width: 240, height: 120 };
      setDragPreviewPos({ x: e.clientX - 120, y: e.clientY - 60 });
    }
  }

  useEffect(() => {
    if (!draggingDishId) return;

    const onMove = (e) => {
      dragDishMovePosRef.current = { x: e.clientX, y: e.clientY };
      if (dragDishRafRef.current) return;

      dragDishRafRef.current = window.requestAnimationFrame(() => {
        dragDishRafRef.current = 0;

        const p = dragDishMovePosRef.current;
        setDragPreviewPos({
          x: p.x - dragPreviewDimsRef.current.width / 2,
          y: p.y - 30,
        });

        // BUG 2 FIX: AUTO-SCROLL accounting for header height
        if (p.y < HEADER_HEIGHT + SCROLL_PAD) {
          window.scrollBy({ top: -SCROLL_SPEED, behavior: "instant" });
        } else if (p.y > window.innerHeight - SCROLL_PAD) {
          window.scrollBy({ top: SCROLL_SPEED, behavior: "instant" });
        }

        const sourceCatId = draggingDishSourceCatIdRef.current;
        const dishId = draggingDishIdRef.current;

        let targetCatId = sourceCatId;
        for (const cat of displayCategories) {
          const sectionEl = sectionRefs.current[cat.id];
          if (!sectionEl) continue;
          const r = sectionEl.getBoundingClientRect();
          if (p.y >= r.top && p.y <= r.bottom) {
            targetCatId = cat.id;
            break;
          }
        }

        setDragOverCategoryId(targetCatId);

        const baseList = dishesByCategory.get(targetCatId) || [];
        const baseIds = baseList.map((d) => d.id);
        const currentStoredIds = dishOrderByCatRef.current?.[targetCatId] || [];
        const targetIds = syncOrderIds(currentStoredIds, baseIds);

        const gridEl = dishGridRefs.current[targetCatId];
        const insertIndex = getGridInsertIndex(
          p.x,
          p.y,
          gridEl,
          dishItemRefs.current,
          targetCatId,
          targetIds,
          dishId
        );

        const isAtEnd = insertIndex >= targetIds.length;
        setDragAtEnd(isAtEnd);

        const hoverId = isAtEnd 
          ? (targetIds[targetIds.length - 1] || "")
          : (targetIds[insertIndex] || "");

        setDragOverDishId(hoverId);
        setDragInsertIndex(insertIndex);
        dragInsertIndexRef.current = insertIndex;

        if (targetCatId === sourceCatId) {
          setDishOrderByCat((prev) => {
            const prevIds = prev[targetCatId] || [];
            const syncedIds = syncOrderIds(prevIds, baseIds);
            const newIds = reorderInsert(syncedIds, dishId, insertIndex);
            
            if (newIds.join("|") === syncedIds.join("|")) {
              return prev;
            }
            
            return { ...prev, [targetCatId]: newIds };
          });
        }
      });
    };

    const onUp = (e) => {
      if (dragDishRafRef.current) {
        window.cancelAnimationFrame(dragDishRafRef.current);
        dragDishRafRef.current = 0;
      }

      const dishId = draggingDishIdRef.current;
      const sourceCatId = draggingDishSourceCatIdRef.current;
      const pointerY = e?.clientY ?? dragDishMovePosRef.current.y;
      const pointerX = e?.clientX ?? dragDishMovePosRef.current.x;

      setDraggingDishId("");
      setDraggingDishSourceCatId("");
      setDragOverCategoryId("");
      setDragOverDishId("");
      setDragInsertIndex(0);
      setDragAtEnd(false);
      setDragPreview(null);

      if (!dishId) return;

      let targetCatId = sourceCatId;
      for (const cat of displayCategories) {
        const sectionEl = sectionRefs.current[cat.id];
        if (!sectionEl) continue;
        const r = sectionEl.getBoundingClientRect();
        if (pointerY >= r.top && pointerY <= r.bottom) {
          targetCatId = cat.id;
          break;
        }
      }

      if (sourceCatId === targetCatId) {
        const baseList = dishesByCategory.get(targetCatId) || [];
        const baseIds = baseList.map((d) => d.id);
        const currentIds = syncOrderIds(dishOrderByCatRef.current?.[targetCatId], baseIds);
        const prevIds = dragStartDishIdsRef.current?.[targetCatId] || [];

        const changed = prevIds.join("|") !== currentIds.join("|");
        if (!changed) return;

        persistDishOrder(targetCatId, currentIds);

        toast("Порядок блюд сохранён", {
          id: TOAST_ID,
          duration: 8000,
          action: {
            label: "Отменить",
            onClick: () => {
              setDishOrderByCat((prev) => ({ ...prev, [targetCatId]: prevIds }));
              persistDishOrder(targetCatId, prevIds);
              toast.message("Отменено", { id: TOAST_ID });
            },
          },
        });
        return;
      }

      // CROSS-CATEGORY MOVE
      const targetBaseList = dishesByCategory.get(targetCatId) || [];
      const targetBaseIds = targetBaseList.map((d) => d.id);
      const targetStoredIds = dishOrderByCatRef.current?.[targetCatId] || [];
      const targetOrderedIds = syncOrderIds(targetStoredIds, targetBaseIds);

      const gridEl = dishGridRefs.current[targetCatId];
      const insertIndex = getGridInsertIndex(
        pointerX,
        pointerY,
        gridEl,
        dishItemRefs.current,
        targetCatId,
        targetOrderedIds,
        dishId
      );

      const newOrderIds = [...targetOrderedIds];
      const safeIndex = Math.max(0, Math.min(insertIndex, newOrderIds.length));
      newOrderIds.splice(safeIndex, 0, dishId);

      // BUG-MD-001 FIX: Snapshot order state before optimistic update for rollback
      const snapshotOrderByCat = { ...dishOrderByCatRef.current };

      setPendingMoveDish({ dishId, fromCatId: sourceCatId, toCatId: targetCatId });
      setDishOrderByCat((prev) => {
        const newState = { ...prev };
        newState[targetCatId] = newOrderIds;
        if (prev[sourceCatId]) {
          newState[sourceCatId] = prev[sourceCatId].filter((id) => id !== dishId);
        }
        return newState;
      });

      const dish = dishesRaw.find((d) => d.id === dishId);
      // BUG-MD-001 FIX: Guard against undefined dish (deleted/archived during drag)
      if (!dish) {
        setPendingMoveDish(null);
        setDishOrderByCat(snapshotOrderByCat);
        return;
      }
      const currentCats = getDishCategoryIds(dish);

      const newCategories = currentCats.filter((id) => id !== sourceCatId);
      if (!newCategories.includes(targetCatId)) {
        newCategories.push(targetCatId);
      }

      const targetCatName = categoriesMap.get(targetCatId)?.name || "раздел";

      moveDishToCategoryMutation.mutate({
        dishId,
        targetCatId,
        categories: newCategories,
        newOrderIds,
      }, {
        onSuccess: () => {
          setPendingMoveDish(null);

          toast.success(`Перемещено в «${targetCatName}»`, { id: TOAST_ID });

          setTimeout(() => {
            const movedDishRefKey = `${targetCatId}-${dishId}`;
            const movedDishEl = dishItemRefs.current[movedDishRefKey];
            if (movedDishEl) {
              movedDishEl.scrollIntoView({ behavior: "smooth", block: "center" });
              movedDishEl.classList.add("ring-2", "ring-indigo-500", "ring-offset-2");
              setTimeout(() => {
                movedDishEl.classList.remove("ring-2", "ring-indigo-500", "ring-offset-2");
              }, 2000);
            }
          }, 500);
        },
        onError: () => {
          // BUG-MD-001 FIX: Restore pre-drag order state on error
          setPendingMoveDish(null);
          setDishOrderByCat(snapshotOrderByCat);
        }
      });
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);

    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
      if (dragDishRafRef.current) {
        window.cancelAnimationFrame(dragDishRafRef.current);
        dragDishRafRef.current = 0;
      }
    };
  }, [draggingDishId, displayCategories, dishesByCategory, dishesRaw, categoriesMap]);

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
      {/* Hidden scrollbar styles */}
      <style>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

      {/* Drag Preview */}
      {dragPreview && (
        <div
          className="fixed z-[999] pointer-events-none"
          style={{
            left: `${dragPreviewPos.x}px`,
            top: `${dragPreviewPos.y}px`,
            width: dragPreview.width || (dragPreview.type === "dish" ? 280 : 180),
            height: dragPreview.height || (dragPreview.type === "dish" ? 200 : 40),
          }}
        >
          {dragPreview.type === "category" ? (
            <div
              className="h-full rounded-full border-2 border-indigo-500 bg-white shadow-xl flex items-center gap-2 px-4"
              style={{ minWidth: dragPreview.width || 180 }}
            >
              <GripVertical className="w-4 h-4 text-indigo-500 shrink-0" />
              <span className="text-sm font-semibold text-slate-900 truncate">
                {dragPreview.title}
              </span>
            </div>
          ) : (
            <div className="h-full rounded-xl border-2 border-indigo-500 bg-white shadow-xl overflow-hidden flex flex-col">
              <div className="flex-1 bg-indigo-50 flex items-center justify-center min-h-[80px]">
                <GripVertical className="w-8 h-8 text-indigo-400" />
              </div>
              <div className="p-3 border-t border-slate-100">
                <div className="text-sm font-bold text-slate-900 truncate">
                  {dragPreview.title}
                </div>
                <div className="text-xs text-indigo-600 mt-0.5">Перемещение…</div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════
          TOOLBAR (sticky top)
          ═══════════════════════════════════════════════════════════ */}
      <div className="sticky top-0 z-40 bg-white border-b shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBack}
              className="gap-1 text-slate-600 hover:text-slate-900"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Назад</span>
            </Button>

            <div className="flex bg-slate-100 rounded-lg p-0.5">
              <button
                onClick={() => handleModeChange("hall")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition ${
                  orderMode === "hall"
                    ? "bg-white text-indigo-600 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Store className="w-4 h-4" />
                <span className="hidden sm:inline">Зал</span>
              </button>
              <button
                onClick={() => handleModeChange("pickup")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition ${
                  orderMode === "pickup"
                    ? "bg-white text-indigo-600 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Package className="w-4 h-4" />
                <span className="hidden sm:inline">Самовывоз</span>
              </button>
              <button
                onClick={() => handleModeChange("delivery")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition ${
                  orderMode === "delivery"
                    ? "bg-white text-indigo-600 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Truck className="w-4 h-4" />
                <span className="hidden sm:inline">Доставка</span>
              </button>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={previewGuestMenu}
              className="gap-1.5"
            >
              <Eye className="w-4 h-4" />
              <span className="hidden sm:inline">Preview</span>
            </Button>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          HEADER (restaurant name, address, contacts) + Edit button
          ═══════════════════════════════════════════════════════════ */}
      <div className="bg-white border-b px-4 py-6">
        <div className="max-w-4xl mx-auto">
          <div className="relative">
            <Button
              variant="outline"
              size="sm"
              onClick={openSettingsDialog}
              className="absolute top-0 right-0 h-9 w-9 p-0 text-slate-500 hover:text-indigo-600"
              title="Редактировать"
            >
              <Pencil className="w-4 h-4" />
            </Button>

            <div className="text-center space-y-3 pt-1">
              <h1 className="text-2xl font-bold text-slate-900 pr-12 sm:pr-0">
                {loadingPartner ? "Загрузка..." : partner?.name || "Ресторан"}
              </h1>

              {partner?.address && (
                <p className="flex items-center justify-center gap-1 text-slate-500 text-sm">
                  <MapPin className="w-3.5 h-3.5" />
                  {partner.address}
                </p>
              )}

              {activeContactLinks.filter((c) => c.type !== "map").length > 0 && (
                <div className="flex items-center justify-center gap-2 flex-wrap">
                  {activeContactLinks
                    .filter((c) => c.type !== "map")
                    .map((link) => {
                      const Icon = getContactIcon(link.type);
                      const displayLabel =
                        normStr(link.label).trim() || getDefaultContactLabel(link.type);
                      const url = normStr(link.url);

                      // P0.6: XSS protection - validate URL before navigation
                      const handleClick = () => {
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
                      };

                      if (viewMode === "full") {
                        return (
                          <button
                            key={link.id}
                            onClick={handleClick}
                            className="h-8 inline-flex items-center gap-1.5 px-2.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 active:bg-slate-100 transition text-sm"
                            title={displayLabel}
                          >
                            <Icon className="w-4 h-4 text-slate-600" />
                            <span className="hidden sm:inline text-slate-700">
                              {displayLabel}
                            </span>
                          </button>
                        );
                      }

                      return (
                        <button
                          key={link.id}
                          onClick={handleClick}
                          className="h-8 w-8 inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white hover:bg-slate-50 active:bg-slate-100 transition"
                          title={displayLabel}
                        >
                          <Icon className="w-4 h-4 text-slate-600" />
                        </button>
                      );
                    })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          CATEGORY CHIPS (sticky) + Search — HIDDEN SCROLLBAR
          ═══════════════════════════════════════════════════════════ */}
      <div className="sticky top-[57px] z-30 bg-white/95 backdrop-blur border-b border-slate-200 py-3 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 space-y-3">
          <div className="flex items-center gap-2">
            <div
              className="hide-scrollbar flex-1 overflow-x-auto"
              ref={catChipsScrollRef}
            >
              <div className="flex items-center gap-3 min-w-max pr-2">
                {displayCategories.map((c) => {
                  const isActive = activeCategoryId === c.id;
                  const isDropTarget =
                    dragOverCatId === c.id &&
                    draggingCatId &&
                    draggingCatId !== c.id;

                  return (
                    <div
                      key={c.id}
                      ref={(el) => {
                        if (el) catChipRefs.current[c.id] = el;
                        else delete catChipRefs.current[c.id];
                      }}
                      className={`relative inline-flex items-center ${
                        isDropTarget
                          ? "ring-2 ring-indigo-500 ring-offset-2 rounded-full"
                          : ""
                      }`}
                    >
                      <button
                        type="button"
                        onPointerDown={(e) => onCategoryGripPointerDown(e, c.id)}
                        className="h-9 w-6 flex items-center justify-center text-slate-400 hover:text-indigo-500 cursor-grab active:cursor-grabbing touch-none transition"
                        title="Перетащите для изменения порядка"
                      >
                        <GripVertical className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => scrollToCategory(c.id)}
                        className={`px-4 py-2 rounded-full text-sm font-semibold border-2 transition shadow-sm ${
                          isActive
                            ? "bg-indigo-600 border-indigo-600 text-white shadow-md"
                            : "bg-white border-slate-300 text-slate-800 hover:border-indigo-400 hover:text-indigo-600"
                        } ${c.is_active === false ? "opacity-50" : ""}`}
                      >
                        {c.name}
                      </button>

                      <button
                        type="button"
                        onClick={() => openEditCategory(c)}
                        className="ml-1 h-7 w-7 inline-flex items-center justify-center rounded-full hover:bg-slate-100 transition text-slate-400 hover:text-indigo-600"
                        title="Редактировать"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={openCreateCategory}
              className="shrink-0 h-9 px-3 border-2 border-dashed border-slate-300 hover:border-indigo-400 hover:text-indigo-600"
              title="Добавить раздел"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Поиск блюд..."
            className="h-10 border-slate-300"
          />
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          DISH CARDS (by category) — EQUAL HEIGHT CARDS
          ═══════════════════════════════════════════════════════════ */}
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-8">
        {categories.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center space-y-4">
              <div className="text-4xl">🍽</div>
              <h2 className="text-xl font-bold text-slate-900">
                Начните создавать меню
              </h2>
              <p className="text-slate-600">
                Создайте первый раздел — например, «Завтраки» или «Напитки».
              </p>
              <Button
                className="bg-indigo-600 hover:bg-indigo-700 gap-2"
                onClick={openCreateCategory}
              >
                <Plus className="w-4 h-4" />
                Создать первый раздел
              </Button>
            </CardContent>
          </Card>
        ) : showNoSearchResults ? (
          <Card>
            <CardContent className="p-8 text-center space-y-3">
              <h2 className="text-lg font-semibold text-slate-900">
                Ничего не найдено
              </h2>
              <p className="text-slate-600">
                По запросу «{normStr(search).trim()}» ничего нет.
              </p>
              <Button variant="outline" onClick={() => setSearch("")}>
                Очистить поиск
              </Button>
            </CardContent>
          </Card>
        ) : (
          displayCategories.map((cat) => {
            const listBase = dishesByCategory.get(cat.id) || [];
            const listOrdered = getOrderedDishesForCategory(cat.id, listBase);
            const emptyCategory = listOrdered.length === 0;
            const isDragTarget = draggingDishId && dragOverCategoryId === cat.id;

            return (
              <div
                key={cat.id}
                id={`section-${cat.id}`}
                ref={(el) => {
                  if (el) sectionRefs.current[cat.id] = el;
                  else delete sectionRefs.current[cat.id];
                }}
                className={`scroll-mt-[180px] p-4 -mx-4 rounded-xl transition-colors ${
                  isDragTarget && draggingDishSourceCatId !== cat.id
                    ? "bg-indigo-50 ring-2 ring-indigo-300"
                    : ""
                }`}
              >
                <div className="flex items-center justify-between gap-4 mb-4">
                  <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    {cat.name}
                    {cat.is_active === false && (
                      <Badge variant="outline" className="text-xs">
                        Скрыт
                      </Badge>
                    )}
                  </h3>
                  <Button
                    size="sm"
                    className="bg-indigo-600 hover:bg-indigo-700 gap-1.5"
                    onClick={() => openCreateDish(cat.id)}
                  >
                    <Plus className="w-4 h-4" />
                    Блюдо
                  </Button>
                </div>

                {emptyCategory ? (
                  <Card className={`border-dashed ${isDragTarget ? "border-indigo-400 bg-indigo-50" : ""}`}>
                    <CardContent className="p-6 text-center space-y-3">
                      <p className="text-slate-600">
                        {isDragTarget ? "Отпустите здесь" : "Раздел пока пустой"}
                      </p>
                      {!isDragTarget && (
                        <Button
                          variant="outline"
                          className="gap-2"
                          onClick={() => openCreateDish(cat.id)}
                        >
                          <Plus className="w-4 h-4" />
                          Добавить блюдо
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ) : (
                  <div 
                    className="grid gap-4 sm:grid-cols-2"
                    ref={(el) => {
                      if (el) dishGridRefs.current[cat.id] = el;
                      else delete dishGridRefs.current[cat.id];
                    }}
                  >
                    {listOrdered.map((dish, dishIndex) => {
                      const isDragging = draggingDishId === dish.id;
                      const isHoverTarget =
                        draggingDishId &&
                        dragOverCategoryId === cat.id &&
                        dragOverDishId === dish.id &&
                        draggingDishId !== dish.id;
                      
                      const isLastCard = dishIndex === listOrdered.length - 1;
                      const showAfterIndicator = 
                        draggingDishId &&
                        dragOverCategoryId === cat.id &&
                        dragAtEnd &&
                        isLastCard &&
                        draggingDishId !== dish.id;
                      
                      const isBeingSaved = isSavingDish && pendingMoveDish?.dishId === dish.id;

                      return (
                        <div
                          key={`${cat.id}-${dish.id}`}
                          data-dish-card="1"
                          data-dish-id={dish.id}
                          data-cat-id={cat.id}
                          ref={(el) => {
                            const refKey = `${cat.id}-${dish.id}`;
                            if (el) dishItemRefs.current[refKey] = el;
                            else delete dishItemRefs.current[refKey];
                          }}
                          className={`relative transition-all ${
                            isDragging ? "opacity-30 scale-95" : ""
                          } ${
                            isHoverTarget
                              ? "ring-2 ring-indigo-500 ring-offset-2 rounded-xl"
                              : ""
                          } ${
                            showAfterIndicator
                              ? "after:absolute after:inset-y-0 after:-right-2 after:w-1 after:bg-indigo-500 after:rounded-full"
                              : ""
                          }`}
                        >
                          <Card className="overflow-hidden hover:shadow-md transition-shadow group h-full flex flex-col">
                            <div className="w-full h-48 bg-slate-100 relative shrink-0">
                              {dish.image ? (
                                <img
                                  src={dish.image}
                                  alt={dish.name}
                                  className="w-full h-full object-cover"
                                  loading="lazy"
                                />
                              ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center text-slate-300">
                                  <ImageIcon className="w-8 h-8 mb-1 opacity-50" />
                                  <span className="text-xs">Нет фото</span>
                                </div>
                              )}

                              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 sm:opacity-0 transition-opacity pointer-events-none" />
                            </div>

                            <CardContent className="p-4 min-h-[120px] flex flex-col flex-1">
                              <div className="flex justify-between gap-3 flex-1">
                                <div className="min-w-0 flex-1">
                                  <h4 className="font-semibold text-lg text-slate-900 truncate">
                                    {dish.name}
                                  </h4>
                                  {/* P1.4: description is now clean (no marker) */}
                                  {dish.description ? (
                                    <p className="text-sm text-slate-500 mt-1 line-clamp-2">
                                      {dish.description}
                                    </p>
                                  ) : (
                                    <p className="text-sm text-slate-300 mt-1 italic">
                                      Нет описания
                                    </p>
                                  )}
                                </div>
                                <div className="text-lg font-bold text-indigo-600 whitespace-nowrap">
                                  {formatPriceDisplay(dish.price, defaultCurrencyCode)}
                                </div>
                              </div>

                              <div className="flex items-center gap-2 mt-auto pt-3">
                                {dish.enabled_hall !== false && (
                                  <Badge variant="outline" className="text-xs">
                                    Зал
                                  </Badge>
                                )}
                                {dish.enabled_pickup !== false && (
                                  <Badge variant="outline" className="text-xs">
                                    Самовывоз
                                  </Badge>
                                )}
                                {dish.enabled_delivery !== false && (
                                  <Badge variant="outline" className="text-xs">
                                    Доставка
                                  </Badge>
                                )}
                              </div>
                            </CardContent>
                          </Card>

                          {isBeingSaved && (
                            <div className="absolute inset-0 bg-white/90 backdrop-blur-sm flex items-center justify-center rounded-xl z-10">
                              <div className="flex flex-col items-center gap-2">
                                <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
                                <span className="text-sm font-medium text-indigo-600">Сохранение...</span>
                              </div>
                            </div>
                          )}

                          <div className="absolute top-2 left-2">
                            <button
                              type="button"
                              disabled={isSavingDish}
                              onPointerDown={(e) =>
                                onDishGripPointerDown(e, cat.id, dish.id)
                              }
                              className={`h-9 w-9 inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white/95 hover:bg-white shadow-sm transition text-slate-500 hover:text-indigo-600 touch-none ${
                                isSavingDish ? "opacity-50 cursor-not-allowed" : "cursor-grab active:cursor-grabbing"
                              }`}
                              title={isSavingDish ? "Сохранение..." : "Перетащите для изменения порядка или в другую категорию"}
                            >
                              <GripVertical className="w-5 h-5" />
                            </button>
                          </div>

                          <div className="absolute top-2 right-2 flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-9 px-3 bg-white/95 hover:bg-white shadow-sm"
                              onClick={() => openEditDish(dish)}
                            >
                              <Pencil className="w-3.5 h-3.5 mr-1.5" />
                              Изменить
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-9 w-9 p-0 bg-white/95 hover:bg-red-50 shadow-sm border-red-200 text-red-600 hover:text-red-700"
                              onClick={() => {
                                openConfirm({
                                  title: "Архивировать блюдо?",
                                  description: `«${dish.name}» будет скрыто из меню.`,
                                  actionText: "Архивировать",
                                  variant: "danger",
                                  showCancel: true,
                                  onConfirm: () => archiveDishMutation.mutate(dish),
                                });
                              }}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      );
                    })}

                    <Card
                      className="border-2 border-dashed cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/50 transition h-full"
                      onClick={() => openCreateDish(cat.id)}
                    >
                      <CardContent className="p-6 flex flex-col items-center justify-center h-full min-h-[312px] text-slate-400 hover:text-indigo-600 transition">
                        <Plus className="w-8 h-8 mb-2" />
                        <span className="font-medium">Добавить блюдо</span>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* ═══════════════════════════════════════════════════════════
          DIALOGS
          ═══════════════════════════════════════════════════════════ */}

      {/* Settings Dialog (Name + Address + Contacts) */}
      {/* P1.2: Sticky footer */}
      <Dialog open={settingsDialogOpen} onOpenChange={setSettingsDialogOpen}>
        <DialogContent className="max-w-lg max-h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Настройки ресторана</DialogTitle>
            <DialogDescription>
              Название, адрес и контактная информация
            </DialogDescription>
          </DialogHeader>

          {/* P1.2: Scrollable content area */}
          <div className="flex-1 overflow-y-auto space-y-6 py-4">
            <div className="space-y-2">
              <Label>Название ресторана *</Label>
              <Input
                value={settingsForm.name}
                onChange={(e) =>
                  setSettingsForm((f) => ({ ...f, name: e.target.value }))
                }
                placeholder="Название"
              />
            </div>

            <div className="space-y-2">
              <Label>Адрес</Label>
              <Input
                value={settingsForm.address}
                onChange={(e) =>
                  setSettingsForm((f) => ({ ...f, address: e.target.value }))
                }
                placeholder="ул. Абая 10, Алматы"
              />
            </div>

            <div className="space-y-3">
              <Label>Контакты</Label>

              {editingContactLinks.length > 0 && (
                <div className="space-y-2">
                  {editingContactLinks.map((link) => {
                    const Icon = getContactIcon(link.type);
                    return (
                      <div
                        key={link.id}
                        className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg"
                      >
                        <Icon className="w-4 h-4 text-slate-500 shrink-0" />
                        <span className="text-sm font-medium text-slate-700 min-w-[80px]">
                          {link.label || getDefaultContactLabel(link.type)}
                        </span>
                        <span className="text-sm text-slate-500 truncate flex-1">
                          {link.url}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                          onClick={() => removeContact(link.id)}
                          disabled={deleteContactLinkMutation.isPending}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="border-2 border-dashed border-slate-200 rounded-lg p-3 space-y-3">
                <div className="text-sm font-medium text-slate-600">Добавить контакт</div>
                <div className="flex gap-2">
                  <Select
                    value={newContactForm.type}
                    onValueChange={(v) =>
                      setNewContactForm((f) => ({ ...f, type: v }))
                    }
                  >
                    <SelectTrigger className="w-[140px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CONTACT_TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>
                          {t.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    value={newContactForm.url}
                    onChange={(e) =>
                      setNewContactForm((f) => ({ ...f, url: e.target.value }))
                    }
                    placeholder={
                      newContactForm.type === "phone"
                        ? "+7 777 123 4567"
                        : newContactForm.type === "email"
                        ? "info@restaurant.kz"
                        : "https://..."
                    }
                    className="flex-1"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={addNewContact}
                    disabled={createContactLinkMutation.isPending}
                    className="shrink-0"
                  >
                    {createContactLinkMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Plus className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* P1.2: Sticky footer */}
          <div className="flex gap-2 pt-4 border-t mt-auto shrink-0">
            <Button
              variant="outline"
              onClick={() => setSettingsDialogOpen(false)}
            >
              Отмена
            </Button>
            <Button
              className="bg-indigo-600 hover:bg-indigo-700 gap-2 ml-auto"
              onClick={saveSettings}
              disabled={savePartnerMutation.isPending}
            >
              {savePartnerMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              Сохранить
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Category Dialog — with Delete button */}
      <Dialog open={categoryDialogOpen} onOpenChange={setCategoryDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? "Редактировать раздел" : "Новый раздел"}
            </DialogTitle>
            <DialogDescription>
              {editingCategory
                ? "Измените название и настройки раздела"
                : "Создайте новый раздел меню"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {enabledLanguages.length > 1 && (
              <div className="flex gap-1 border-b pb-2">
                {enabledLanguages.map((langCode) => {
                  const isDefault = langCode === defaultLanguage;
                  const isActive = categoryLangTab === langCode;
                  return (
                    <button
                      key={langCode}
                      type="button"
                      onClick={() => setCategoryLangTab(langCode)}
                      className={`px-3 py-1.5 text-sm rounded-md transition ${
                        isActive
                          ? "bg-indigo-600 text-white"
                          : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                      }`}
                    >
                      {langCode}
                      {isDefault && " (осн.)"}
                    </button>
                  );
                })}
              </div>
            )}

            <div className="space-y-2">
              <Label>Название *</Label>
              {categoryLangTab === defaultLanguage ? (
                <Input
                  value={categoryForm.name}
                  onChange={(e) =>
                    setCategoryForm((f) => ({ ...f, name: e.target.value }))
                  }
                  placeholder="Например: Завтраки"
                />
              ) : (
                <Input
                  value={categoryTranslations[categoryLangTab]?.name || ""}
                  onChange={(e) => {
                    setCategoryTranslations((prev) => ({
                      ...prev,
                      [categoryLangTab]: {
                        ...prev[categoryLangTab],
                        name: e.target.value,
                      },
                    }));
                  }}
                  placeholder={categoryForm.name || "Перевод названия"}
                />
              )}
            </div>

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={categoryForm.is_active !== false}
                onChange={(e) =>
                  setCategoryForm((f) => ({ ...f, is_active: e.target.checked }))
                }
                className="w-4 h-4"
              />
              Виден гостям
            </label>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            {editingCategory && (
              <Button
                variant="outline"
                className="sm:mr-auto border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 gap-1.5"
                onClick={handleDeleteCategory}
                disabled={deleteCategoryMutation.isPending}
              >
                <Trash2 className="w-4 h-4" />
                Удалить
              </Button>
            )}
            
            <Button
              variant="outline"
              onClick={() => setCategoryDialogOpen(false)}
            >
              Отмена
            </Button>
            <Button
              className="bg-indigo-600 hover:bg-indigo-700 gap-2"
              onClick={saveCategory}
              disabled={saveCategoryMutation.isPending}
            >
              {saveCategoryMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              Сохранить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dish Dialog */}
      {/* P1.2: Sticky footer */}
      <Dialog open={dishDialogOpen} onOpenChange={setDishDialogOpen}>
        <DialogContent className="max-w-md max-h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>
              {editingDish ? "Изменить блюдо" : "Новое блюдо"}
            </DialogTitle>
            <DialogDescription>
              Заполните информацию о блюде
            </DialogDescription>
          </DialogHeader>

          {/* P1.2: Scrollable content area */}
          <div className="flex-1 overflow-y-auto space-y-4 py-4">
            {showLangTabs && (
              <div className="flex gap-2 border-b pb-3">
                {enabledLanguages.map((langCode) => {
                  const isDefault = langCode === defaultLanguage;
                  const isActive = dishLangTab === langCode;
                  return (
                    <button
                      key={langCode}
                      type="button"
                      onClick={() => setDishLangTab(langCode)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                        isActive
                          ? "bg-indigo-600 text-white"
                          : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                      }`}
                    >
                      {langCode}
                      {isDefault && (
                        <span className="ml-1 text-xs opacity-70">(осн.)</span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            <div className="grid grid-cols-[1fr,auto] gap-3">
              <div className="space-y-2">
                <Label>
                  Название *
                  {showLangTabs && !isDefaultLang && (
                    <span className="ml-2 text-xs text-slate-500">
                      ({dishLangTab})
                    </span>
                  )}
                </Label>
                {isDefaultLang ? (
                  <Input
                    value={dishForm.name}
                    onChange={(e) =>
                      setDishForm((f) => ({ ...f, name: e.target.value }))
                    }
                    placeholder="Борщ"
                  />
                ) : (
                  <Input
                    value={getDishFieldValue("name")}
                    onChange={(e) => setDishFieldValue("name", e.target.value)}
                    placeholder={dishForm.name || "Перевод названия"}
                  />
                )}
              </div>
              <div className="space-y-2">
                <Label>Цена ({currencySymbol}) *</Label>
                <Input
                  value={dishForm.price}
                  onChange={(e) =>
                    setDishForm((f) => ({ ...f, price: e.target.value }))
                  }
                  placeholder="0"
                  inputMode="decimal"
                  className="w-24"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>
                Описание
                {showLangTabs && !isDefaultLang && (
                  <span className="ml-2 text-xs text-slate-500">
                    ({dishLangTab})
                  </span>
                )}
              </Label>
              {isDefaultLang ? (
                <Textarea
                  value={dishForm.description}
                  onChange={(e) =>
                    setDishForm((f) => ({ ...f, description: e.target.value }))
                  }
                  placeholder="Краткое описание"
                  rows={2}
                />
              ) : (
                <Textarea
                  value={getDishFieldValue("description")}
                  onChange={(e) =>
                    setDishFieldValue("description", e.target.value)
                  }
                  placeholder={dishForm.description || "Перевод описания"}
                  rows={2}
                />
              )}
            </div>

            <div className="space-y-2">
              <Label>Категории</Label>
              <div className="flex flex-wrap gap-2">
                {categories.map((c) => {
                  const checked =
                    Array.isArray(dishForm.categories) &&
                    dishForm.categories.includes(c.id);
                  const isPrimary = dishForm.category === c.id;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => toggleDishCategory(c.id)}
                      className={`px-3 py-1.5 rounded-lg text-sm border transition ${
                        checked
                          ? "bg-indigo-50 border-indigo-300 text-indigo-700"
                          : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                      }`}
                    >
                      {checked && <span className="mr-1">✓</span>}
                      {c.name}
                      {isPrimary && (
                        <span className="ml-1 text-xs opacity-70">(осн.)</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Изображение (URL)</Label>
              <Input
                value={dishForm.image}
                onChange={(e) =>
                  setDishForm((f) => ({ ...f, image: e.target.value }))
                }
                placeholder="https://..."
              />
              {dishForm.image && (
                <img
                  src={dishForm.image}
                  alt="Preview"
                  className="w-full h-32 object-cover rounded-lg border"
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
              )}
            </div>

            <div className="border rounded-lg p-3 bg-slate-50 space-y-2">
              <Label>Доступность по каналам</Label>
              <div className="flex items-center gap-4 flex-wrap">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={dishForm.enabled_hall !== false}
                    onChange={(e) =>
                      setDishForm((f) => ({
                        ...f,
                        enabled_hall: e.target.checked,
                      }))
                    }
                    className="w-4 h-4"
                  />
                  Зал
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={dishForm.enabled_pickup !== false}
                    onChange={(e) =>
                      setDishForm((f) => ({
                        ...f,
                        enabled_pickup: e.target.checked,
                      }))
                    }
                    className="w-4 h-4"
                  />
                  Самовывоз
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={dishForm.enabled_delivery !== false}
                    onChange={(e) =>
                      setDishForm((f) => ({
                        ...f,
                        enabled_delivery: e.target.checked,
                      }))
                    }
                    className="w-4 h-4"
                  />
                  Доставка
                </label>
              </div>
            </div>
          </div>

          {/* P1.2: Sticky footer */}
          <div className="flex gap-2 pt-4 border-t mt-auto shrink-0">
            <Button variant="outline" onClick={() => setDishDialogOpen(false)}>
              Отмена
            </Button>
            <Button
              className="bg-indigo-600 hover:bg-indigo-700 gap-2 ml-auto"
              onClick={saveDish}
              disabled={saveDishMutation.isPending}
            >
              {saveDishMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              Сохранить
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Confirm Dialog — supports warning variant */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {confirmState.variant === "warning" && (
                <AlertTriangle className="w-5 h-5 text-amber-500" />
              )}
              {confirmState.title}
            </DialogTitle>
            <DialogDescription>{confirmState.description}</DialogDescription>
          </DialogHeader>

          <DialogFooter>
            {confirmState.showCancel && (
              <Button variant="outline" onClick={closeConfirm}>
                Отмена
              </Button>
            )}
            <Button
              className={
                confirmState.variant === "warning"
                  ? "bg-amber-500 hover:bg-amber-600"
                  : "bg-red-600 hover:bg-red-700"
              }
              onClick={() => {
                const fn = confirmState.onConfirm;
                closeConfirm();
                if (typeof fn === "function") fn();
              }}
            >
              {confirmState.actionText || "Подтвердить"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
