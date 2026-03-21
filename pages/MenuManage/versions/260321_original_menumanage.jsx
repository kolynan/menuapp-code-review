import React, { useEffect, useMemo, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "sonner";
import {
  AlertTriangle,
  Archive,
  ArchiveRestore,
  ArrowDown,
  ArrowUp,
  Check,
  ChevronDown,
  ChevronRight,
  ChevronsDownUp,
  ChevronsUpDown,
  ExternalLink,
  Eye,
  GripVertical,
  Image as ImageIcon,
  Info,
  Languages,
  Loader2,
  Pencil,
  Plus,
  Search,
  Store,
  Package,
  Truck,
  Trash2,
} from "lucide-react";
import PartnerShell from "@/components/PartnerShell";
import ImageUploader from "@/components/ImageUploader";
import { useI18n } from "@/components/i18n";
import PageHelpButton from "@/components/PageHelpButton";

/* ============================================================
   CONSTANTS
   ============================================================ */

const ORDER_STEP = 1000;
const BATCH_SIZE = 5;
const INITIAL_VISIBLE = 50;
const LOAD_MORE_COUNT = 30;

const getChannels = (t) => [
  { key: "hall", label: t('channel.hall'), Icon: Store },
  { key: "pickup", label: t('channel.pickup'), Icon: Package },
  { key: "delivery", label: t('channel.delivery'), Icon: Truck },
];

const AVAILABLE_LANGUAGES = [
  { code: "RU", label: "Русский" },
  { code: "EN", label: "English" },
  { code: "KK", label: "Қазақша" },
  { code: "DE", label: "Deutsch" },
  { code: "TR", label: "Türkçe" },
  { code: "ZH", label: "中文" },
  { code: "AR", label: "العربية" },
  { code: "ES", label: "Español" },
  { code: "FR", label: "Français" },
];

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

/* ============================================================
   HELPERS
   ============================================================ */

function normStr(s) {
  return (s ?? "").toString().trim();
}

function toNum(v) {
  const n = Number(String(v ?? "").replace(/\s/g, "").replace(",", "."));
  return Number.isFinite(n) ? n : undefined;
}

function sortByOrder(arr) {
  return [...(arr || [])].sort((a, b) => {
    const ao = Number.isFinite(+a?.sort_order) ? +a.sort_order : 1e9;
    const bo = Number.isFinite(+b?.sort_order) ? +b.sort_order : 1e9;
    if (ao !== bo) return ao - bo;
    return normStr(a?.name || a?.label).localeCompare(normStr(b?.name || b?.label), "ru");
  });
}

function moveIndex(list, from, to) {
  const next = [...list];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

function getDishCategoryIds(dish) {
  if (Array.isArray(dish?.category_ids) && dish.category_ids.length > 0) {
    return dish.category_ids.map(String).filter(Boolean);
  }
  if (dish?.category) {
    return [String(dish.category)];
  }
  return [];
}

function dishInCategory(dish, catId) {
  const ids = getDishCategoryIds(dish);
  return ids.includes(String(catId));
}

function buildPreviewUrl(pid, lang) {
  return `/x?partner=${encodeURIComponent(pid || "")}&mode=hall&lang=${encodeURIComponent(lang || "RU")}`;
}

function detectPartnerKey(samples) {
  for (const s of samples || []) {
    if (s && typeof s === "object") {
      if ("partner" in s) return "partner";
      if ("partner_id" in s) return "partner_id";
      if ("partnerId" in s) return "partnerId";
    }
  }
  return localStorage.getItem("mm1_partnerKey") || "partner";
}

function detectSortOrderType(samples) {
  for (const s of samples || []) {
    const v = s?.sort_order;
    if (typeof v === "number" && !Number.isInteger(v)) return "float";
  }
  return "int";
}

function computeMidOrder(prev, next, isFloat) {
  const p = typeof prev === "number" ? prev : null;
  const n = typeof next === "number" ? next : null;
  if (p !== null && n !== null) {
    const mid = isFloat ? (p + n) / 2 : Math.floor((p + n) / 2);
    const minGap = isFloat ? 0.001 : 2;
    if (mid > p + minGap && mid < n - minGap) return mid;
    return null;
  }
  if (p !== null) return p + ORDER_STEP;
  if (n !== null) return n - ORDER_STEP;
  return ORDER_STEP;
}

function pluralize(n, one, few, many) {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod100 >= 11 && mod100 <= 19) return many;
  if (mod10 === 1) return one;
  if (mod10 >= 2 && mod10 <= 4) return few;
  return many;
}

/* ============================================================
   API HELPERS
   ============================================================ */

async function getUser() {
  try { return await base44.auth.me(); } catch { return null; }
}

async function listFor(entity, pid) {
  if (!pid) return [];
  for (const key of ["partner", "partner_id", "partnerId"]) {
    try {
      const res = await base44.entities[entity].filter({ [key]: pid });
      if (Array.isArray(res)) return res;
    } catch {}
  }
  try { return await base44.entities[entity].list(); } catch { return []; }
}

async function loadPartner(pid) {
  if (!pid) {
    try {
      const all = await base44.entities.Partner.list();
      return all?.[0] || null;
    } catch { return null; }
  }
  for (const key of ["id", "partner", "partner_id", "partnerId"]) {
    try {
      const res = await base44.entities.Partner.filter({ [key]: pid });
      if (res?.[0]) return res[0];
    } catch {}
  }
  return null;
}

async function createRec(entity, data) {
  return await base44.entities[entity].create(data);
}

async function updateRec(entity, id, data) {
  return await base44.entities[entity].update(id, data);
}

async function deleteRec(entity, id) {
  return await base44.entities[entity].delete(id);
}

async function createWithPartnerRetry(entity, data, pid, existingSamples) {
  const detected = detectPartnerKey(existingSamples);
  if (detected) {
    try { return await createRec(entity, { ...data, [detected]: pid }); } catch {}
  }
  for (const key of ["partner", "partner_id", "partnerId"]) {
    try {
      const result = await createRec(entity, { ...data, [key]: pid });
      localStorage.setItem("mm1_partnerKey", key);
      return result;
    } catch (e) {
      if (!String(e).toLowerCase().includes("partner")) throw e;
    }
  }
  throw new Error("Failed to create: unknown partner field");
}

/* ============================================================
   MAIN COMPONENT
   ============================================================ */

export default function MenuManage() {
  const nav = useNavigate();
  const { t, lang: uiLang, setLang: setUiLang } = useI18n();

  // Core state
  const [lang, setLang] = useState("RU");
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [partner, setPartner] = useState(null);
  const [catsRaw, setCatsRaw] = useState([]);
  const [dishesRaw, setDishesRaw] = useState([]);
  const [dishTranslationsRaw, setDishTranslationsRaw] = useState([]);

  // UI state
  const [searchQuery, setSearchQuery] = useState("");
  const [collapsedCats, setCollapsedCats] = useState(new Set());
  const [savedExpandedState, setSavedExpandedState] = useState(null);
  const [visibleDishesCount, setVisibleDishesCount] = useState({});

  // Dialogs
  const [catDialog, setCatDialog] = useState(false);
  const [dishDialog, setDishDialog] = useState(false);
  const [deleteBlockedDialog, setDeleteBlockedDialog] = useState(null);

  // Forms
  const [catForm, setCatForm] = useState({ id: null, name: "" });
  const [dishForm, setDishForm] = useState({
    id: null, name: "", description: "", price: "", category: "", category_ids: [],
    image: "", enabled_hall: true, enabled_pickup: true, enabled_delivery: true, translations: {},
  });
  const [dishFormErrors, setDishFormErrors] = useState({});
  const [dishDialogLang, setDishDialogLang] = useState("");
  const [showArchived, setShowArchived] = useState(false);

  // Processing state
  const [saving, setSaving] = useState(false);
  const [reordering, setReordering] = useState(false);
  const [dragOverId, setDragOverId] = useState(null);
  const [dragOverCatId, setDragOverCatId] = useState(null);

  // Refs for infinite scroll
  const loaderRefs = useRef({});

  // Derived values
  const pid = user?.partner || user?.partner_id || user?.partnerId || partner?.id || "";
  const apiReady = !!base44?.entities && !!pid;
  const sortOrderType = useMemo(() => detectSortOrderType([...catsRaw, ...dishesRaw]), [catsRaw, dishesRaw]);
  const isFloat = sortOrderType === "float";
  const previewUrl = buildPreviewUrl(pid, lang);
  const currencySymbol = AVAILABLE_CURRENCIES.find(c => c.code === partner?.default_currency)?.symbol || "₸";

  const enabledLanguages = useMemo(() => {
    const defaultLang = partner?.default_language || "RU";
    const enabled = partner?.enabled_languages;
    return Array.isArray(enabled) && enabled.length > 0 ? enabled : [defaultLang];
  }, [partner?.default_language, partner?.enabled_languages]);

  const defaultLanguage = partner?.default_language || "RU";

  // Get translated dish name/description based on selected language
  const getTranslatedDish = (dish) => {
    if (!dish) return { name: "", description: "" };
    if (lang === defaultLanguage) {
      return { name: dish.name || "", description: dish.description || "" };
    }
    const tr = dishTranslationsRaw.find(
      t => String(t.dish) === String(dish.id) && t.lang === lang
    );
    return {
      name: tr?.name || dish.name || "",
      description: tr?.description || dish.description || "",
    };
  };

  // Sorted data
  const cats = useMemo(() => sortByOrder(catsRaw), [catsRaw]);
  const allDishes = useMemo(() => sortByOrder(dishesRaw), [dishesRaw]);
  const dishes = useMemo(() => allDishes.filter(d => !d.is_archived), [allDishes]);
  const archivedDishes = useMemo(() => allDishes.filter(d => d.is_archived), [allDishes]);

  // Filter by search
  const filteredCats = useMemo(() => {
    const q = normStr(searchQuery).toLowerCase();
    if (!q) return cats;
    return cats.filter(c => {
      const catMatch = normStr(c.name).toLowerCase().includes(q);
      const hasDishMatch = dishes.some(d => dishInCategory(d, c.id) && normStr(d.name).toLowerCase().includes(q));
      return catMatch || hasDishMatch;
    });
  }, [cats, dishes, searchQuery]);

  const filteredDishesMap = useMemo(() => {
    const q = normStr(searchQuery).toLowerCase();
    const map = new Map();
    for (const cat of cats) {
      const catDishes = dishes.filter(d => dishInCategory(d, cat.id));
      if (q) {
        map.set(cat.id, catDishes.filter(d => normStr(d.name).toLowerCase().includes(q)));
      } else {
        map.set(cat.id, catDishes);
      }
    }
    const noCatDishes = dishes.filter(d => !d.category && getDishCategoryIds(d).length === 0);
    if (q) {
      map.set("none", noCatDishes.filter(d => normStr(d.name).toLowerCase().includes(q)));
    } else {
      map.set("none", noCatDishes);
    }
    return map;
  }, [cats, dishes, searchQuery]);

  // Collapse logic
  const allCollapsed = collapsedCats.size >= cats.length;
  const canReorder = !reordering && !normStr(searchQuery);

  const handleCollapseAll = () => {
    if (allCollapsed && savedExpandedState) {
      setCollapsedCats(savedExpandedState);
      setSavedExpandedState(null);
    } else {
      setSavedExpandedState(new Set(collapsedCats));
      setCollapsedCats(new Set(cats.map(c => c.id)));
    }
  };

  const toggleCollapse = (catId) => {
    setCollapsedCats(prev => {
      const next = new Set(prev);
      if (next.has(catId)) next.delete(catId);
      else next.add(catId);
      return next;
    });
  };

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const catId = entry.target.dataset.catId;
            if (catId) {
              setVisibleDishesCount(prev => ({
                ...prev,
                [catId]: Math.min((prev[catId] || INITIAL_VISIBLE) + LOAD_MORE_COUNT, filteredDishesMap.get(catId)?.length || 0)
              }));
            }
          }
        });
      },
      { threshold: 0.1 }
    );

    Object.values(loaderRefs.current).forEach(ref => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, [filteredDishesMap, collapsedCats]);

  // LocalStorage persistence
  useEffect(() => {
    try {
      const s = JSON.parse(localStorage.getItem("mm1") || "{}");
      if (s.lang) setLang(s.lang);
    } catch {}
  }, []);

  useEffect(() => {
    localStorage.setItem("mm1", JSON.stringify({ lang }));
  }, [lang]);

  // Data loading
  async function reload() {
    setLoading(true);
    try {
      const u = await getUser();
      setUser(u);
      const pId = u?.partner || u?.partner_id || u?.partnerId || "";
      const [p, c, d, dishTrans] = await Promise.all([
        loadPartner(pId),
        listFor("Category", pId),
        listFor("Dish", pId),
        listFor("DishTranslation", pId).catch(() => []),
      ]);
      setPartner(p);
      setCatsRaw(c || []);
      setDishesRaw(d || []);
      setDishTranslationsRaw(dishTrans || []);
      if (p?.default_language) {
        setLang(p.default_language);
      }
    } catch (e) {
      toast.error(t('error.loading'), { id: "mm1" });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { reload(); }, []);

  // Drag helpers
  function setDragImage(e) {
    const el = e.currentTarget?.closest?.(".drag-row");
    if (el) e.dataTransfer.setDragImage(el, 40, 20);
  }

  // Batch reindex
  async function batchedReindex(entity, items, setter) {
    const stepped = items.map((it, i) => ({ ...it, sort_order: (i + 1) * ORDER_STEP }));
    setter(old => {
      const map = new Map(stepped.map(x => [String(x.id), x]));
      return old.map(x => map.get(String(x.id)) || x);
    });
    for (let i = 0; i < stepped.length; i += BATCH_SIZE) {
      const chunk = stepped.slice(i, i + BATCH_SIZE);
      await Promise.all(chunk.map(it => updateRec(entity, it.id, { sort_order: it.sort_order })));
    }
  }

  // Category reorder
  async function reorderCats(from, to) {
    if (!canReorder || from === to) return;
    const sorted = sortByOrder(catsRaw);
    const next = moveIndex(sorted, from, to);
    setCatsRaw(next);
    setReordering(true);
    try {
      await batchedReindex("Category", next, setCatsRaw);
    } catch (e) {
      toast.error(t('toast.error'), { id: "mm1" });
    } finally {
      setReordering(false);
    }
  }

  // Move category up/down with buttons (for mobile)
  async function moveCatUp(catIndex) {
    if (catIndex <= 0 || !canReorder) return;
    await reorderCats(catIndex, catIndex - 1);
  }

  async function moveCatDown(catIndex) {
    const sorted = sortByOrder(catsRaw);
    if (catIndex >= sorted.length - 1 || !canReorder) return;
    await reorderCats(catIndex, catIndex + 1);
  }

  // Move dish up/down - supports cross-category at boundaries
  async function moveDishInCategory(dishId, catId, direction) {
    if (reordering) return;
    const catDishes = sortByOrder(dishesRaw.filter(d => dishInCategory(d, catId) && !d.is_archived));
    const currentIndex = catDishes.findIndex(d => String(d.id) === String(dishId));
    if (currentIndex < 0) return;
    
    const isFirst = currentIndex === 0;
    const isLast = currentIndex === catDishes.length - 1;
    
    // Cross-category move: up from first → previous category (end)
    if (direction === "up" && isFirst) {
      const currentCatIndex = cats.findIndex(c => String(c.id) === String(catId));
      if (currentCatIndex > 0) {
        const prevCat = cats[currentCatIndex - 1];
        const prevCatDishes = sortByOrder(dishesRaw.filter(d => dishInCategory(d, prevCat.id) && !d.is_archived));
        await moveDish(dishId, prevCat.id, prevCatDishes.length); // to end
      }
      return;
    }
    
    // Cross-category move: down from last → next category (start)
    if (direction === "down" && isLast) {
      const currentCatIndex = cats.findIndex(c => String(c.id) === String(catId));
      if (currentCatIndex < cats.length - 1) {
        const nextCat = cats[currentCatIndex + 1];
        await moveDish(dishId, nextCat.id, 0); // to start
      }
      return;
    }
    
    // Normal within-category move
    const newIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= catDishes.length) return;
    
    await moveDish(dishId, catId, newIndex);
  }

  // Dish move (supports cross-category with duplicate protection)
  async function moveDish(dishId, targetCatId, targetIndex) {
    if (reordering) return;
    const dish = dishesRaw.find(d => String(d.id) === String(dishId));
    if (!dish) return;
    
    const newCatId = String(targetCatId || "none");
    const currentCatIds = getDishCategoryIds(dish);
    
    // Check if dish is already in target category (duplicate protection)
    if (currentCatIds.includes(newCatId)) {
      // Dish already in this category - just reorder within category
      setReordering(true);
      try {
        const allSorted = sortByOrder(dishesRaw);
        const targetCatDishes = allSorted.filter(d => dishInCategory(d, newCatId) && String(d.id) !== String(dishId));
        const insertAt = Math.max(0, Math.min(targetIndex, targetCatDishes.length));
        const prev = targetCatDishes[insertAt - 1];
        const next = targetCatDishes[insertAt];
        let newOrder = computeMidOrder(prev?.sort_order, next?.sort_order, isFloat);
        if (newOrder !== null) {
          const updatedDish = { ...dish, sort_order: newOrder };
          setDishesRaw(old => old.map(d => String(d.id) === String(dishId) ? updatedDish : d));
          await updateRec("Dish", dishId, { sort_order: newOrder });
        } else {
          targetCatDishes.splice(insertAt, 0, dish);
          await batchedReindex("Dish", targetCatDishes, setDishesRaw);
        }
      } catch (e) {
        toast.error(t('toast.error'), { id: "mm1" });
      } finally {
        setReordering(false);
        setDragOverId(null);
        setDragOverCatId(null);
      }
      return;
    }
    
    // Moving to a different category - update category assignment
    setReordering(true);
    try {
      const allSorted = sortByOrder(dishesRaw);
      const targetCatDishes = allSorted.filter(d => dishInCategory(d, newCatId) && String(d.id) !== String(dishId));
      const insertAt = Math.max(0, Math.min(targetIndex, targetCatDishes.length));
      const prev = targetCatDishes[insertAt - 1];
      const next = targetCatDishes[insertAt];
      let newOrder = computeMidOrder(prev?.sort_order, next?.sort_order, isFloat);
      
      // Build new category_ids: remove from old, add to new
      const newCategoryIds = [newCatId === "none" ? null : newCatId].filter(Boolean);
      const newPrimaryCategory = newCatId === "none" ? null : newCatId;
      
      if (newOrder !== null) {
        const updatedDish = { 
          ...dish, 
          sort_order: newOrder, 
          category: newPrimaryCategory,
          category_ids: newCategoryIds 
        };
        setDishesRaw(old => old.map(d => String(d.id) === String(dishId) ? updatedDish : d));
        await updateRec("Dish", dishId, { 
          sort_order: newOrder, 
          category: newPrimaryCategory,
          category_ids: newCategoryIds 
        });
        toast.success(t('toast.dish_moved'), { id: "mm1" });
      } else {
        const updatedDish = { 
          ...dish, 
          category: newPrimaryCategory,
          category_ids: newCategoryIds 
        };
        targetCatDishes.splice(insertAt, 0, updatedDish);
        setDishesRaw(old => old.map(d => String(d.id) === String(dishId) ? updatedDish : d));
        await batchedReindex("Dish", targetCatDishes, setDishesRaw);
        await updateRec("Dish", dishId, { 
          category: newPrimaryCategory,
          category_ids: newCategoryIds 
        });
        toast.success(t('toast.dish_moved'), { id: "mm1" });
      }
    } catch (e) {
      toast.error(t('toast.error'), { id: "mm1" });
    } finally {
      setReordering(false);
      setDragOverId(null);
      setDragOverCatId(null);
    }
  }

  // Category CRUD
  function openNewCat() {
    setCatForm({ id: null, name: "" });
    setCatDialog(true);
  }

  function openEditCat(c) {
    setCatForm({ id: c.id, name: c.name || "" });
    setCatDialog(true);
  }

  async function saveCat() {
    const name = normStr(catForm.name);
    if (!name) { toast.error(t('error.enter_name'), { id: "mm1" }); return; }
    setSaving(true);
    try {
      if (catForm.id) {
        await updateRec("Category", catForm.id, { name });
        setCatsRaw(old => old.map(c => c.id === catForm.id ? { ...c, name } : c));
        toast.success(t('toast.category_saved'), { id: "mm1" });
      } else {
        const created = await createWithPartnerRetry("Category", { name, sort_order: (catsRaw.length + 1) * ORDER_STEP }, pid, catsRaw);
        setCatsRaw(old => sortByOrder([...old, created]));
        toast.success(t('toast.category_created'), { id: "mm1" });
      }
      setCatDialog(false);
    } catch (e) {
      toast.error(t('toast.error'), { id: "mm1" });
    } finally {
      setSaving(false);
    }
  }

  function deleteCat(c) {
    const dishCount = dishesRaw.filter(d => dishInCategory(d, c.id)).length;
    if (dishCount > 0) {
      setDeleteBlockedDialog({ category: c, dishCount });
      return;
    }
    if (!window.confirm(t('menumanage.confirm.delete_category', { name: c.name }))) return;
    doDeleteCat(c);
  }

  async function doDeleteCat(c) {
    try {
      await deleteRec("Category", c.id);
      setCatsRaw(old => old.filter(x => x.id !== c.id));
      toast.success(t('toast.category_deleted'), { id: "mm1" });
    } catch (e) {
      toast.error(t('toast.error'), { id: "mm1" });
    }
  }

  // Dish CRUD
  function openNewDish(catId) {
    setDishForm({
      id: null, name: "", description: "", price: "", category: catId ? String(catId) : "",
      category_ids: catId ? [String(catId)] : [], image: "",
      enabled_hall: true, enabled_pickup: true, enabled_delivery: true, translations: {},
    });
    setDishFormErrors({});
    setDishDialogLang(defaultLanguage);
    setDishDialog(true);
  }

  function openEditDish(d) {
    const catIds = getDishCategoryIds(d);
    const translations = {};
    dishTranslationsRaw.filter(tr => String(tr.dish) === String(d.id)).forEach(tr => {
      translations[tr.lang] = { id: tr.id, name: tr.name || "", description: tr.description || "" };
    });
    setDishForm({
      id: d.id, name: d.name || "", description: d.description || "", price: String(d.price ?? ""),
      category: d.category ? String(d.category) : catIds[0] || "", category_ids: catIds,
      image: d.image || "", enabled_hall: d.enabled_hall !== false, enabled_pickup: d.enabled_pickup !== false,
      enabled_delivery: d.enabled_delivery !== false, translations,
    });
    setDishFormErrors({});
    setDishDialogLang(defaultLanguage);
    setDishDialog(true);
  }

  function toggleDishCategory(catId) {
    setDishForm(f => {
      const set = new Set(f.category_ids || []);
      if (set.has(catId)) set.delete(catId);
      else set.add(catId);
      const arr = Array.from(set);
      const primary = f.category && arr.includes(f.category) ? f.category : arr[0] || "";
      return { ...f, category_ids: arr, category: primary };
    });
  }

  async function saveDish() {
    const name = normStr(dishForm.name);
    const price = toNum(dishForm.price);
    
    const errors = {};
    if (!name) errors.name = t('error.enter_name');
    if (price === undefined) errors.price = t('error.enter_number');
    
    if (Object.keys(errors).length > 0) {
      setDishFormErrors(errors);
      return;
    }
    
    const categoryIds = (dishForm.category_ids || []).filter(Boolean);
    const primaryCategory = dishForm.category || categoryIds[0] || null;
    const payload = {
      name, description: normStr(dishForm.description), price, category: primaryCategory,
      category_ids: categoryIds, image: normStr(dishForm.image),
      enabled_hall: dishForm.enabled_hall, enabled_pickup: dishForm.enabled_pickup, enabled_delivery: dishForm.enabled_delivery,
    };
    setSaving(true);
    setDishFormErrors({});
    try {
      let dishId = dishForm.id;
      if (dishForm.id) {
        await updateRec("Dish", dishForm.id, payload);
        setDishesRaw(old => old.map(d => d.id === dishForm.id ? { ...d, ...payload } : d));
      } else {
        const catDishes = dishesRaw.filter(d => dishInCategory(d, primaryCategory));
        const created = await createWithPartnerRetry("Dish", { ...payload, sort_order: (catDishes.length + 1) * ORDER_STEP }, pid, dishesRaw);
        dishId = created.id;
        setDishesRaw(old => sortByOrder([...old, created]));
      }
      // Save translations
      const translations = dishForm.translations || {};
      const updatedTranslations = [...dishTranslationsRaw];
      for (const langCode of Object.keys(translations)) {
        if (langCode === defaultLanguage) continue;
        const tr = translations[langCode];
        const trName = normStr(tr?.name);
        const trDesc = normStr(tr?.description);
        if (!trName && !trDesc) continue;
        if (tr?.id) {
          await updateRec("DishTranslation", tr.id, { name: trName, description: trDesc });
          const idx = updatedTranslations.findIndex(t => t.id === tr.id);
          if (idx >= 0) updatedTranslations[idx] = { ...updatedTranslations[idx], name: trName, description: trDesc };
        } else {
          const newTr = await createWithPartnerRetry("DishTranslation", { dish: dishId, lang: langCode, name: trName, description: trDesc }, pid, dishTranslationsRaw);
          updatedTranslations.push(newTr);
        }
      }
      setDishTranslationsRaw(updatedTranslations);
      toast.success(dishForm.id ? t('toast.dish_saved') : t('toast.dish_created'), { id: "mm1" });
      setDishDialog(false);
    } catch (e) {
      toast.error(t('toast.error'), { id: "mm1" });
    } finally {
      setSaving(false);
    }
  }

  async function deleteDish(d) {
    try {
      const orderItems = await base44.entities.OrderItem.filter({ dish: d.id });
      const orderCount = Array.isArray(orderItems) ? orderItems.length : 0;
      
      if (orderCount > 0) {
        setDeleteBlockedDialog({
          type: "dish",
          dish: d,
          orderCount,
        });
        return;
      }
    } catch (e) {
      console.warn("Could not check OrderItem:", e);
    }
    
    if (!window.confirm(t('menumanage.confirm.delete_dish', { name: d.name }))) return;
    try {
      await deleteRec("Dish", d.id);
      setDishesRaw(old => old.filter(x => x.id !== d.id));
      toast.success(t('toast.dish_deleted'), { id: "mm1" });
    } catch (e) {
      toast.error(t('toast.error'), { id: "mm1" });
    }
  }

  async function archiveDish(d) {
    if (!window.confirm(t('menumanage.confirm.archive_dish', { name: d.name }))) return;
    try {
      await updateRec("Dish", d.id, { is_archived: true });
      setDishesRaw(old => old.map(x => x.id === d.id ? { ...x, is_archived: true } : x));
      toast.success(t('toast.dish_archived'), { id: "mm1" });
    } catch (e) {
      toast.error(t('toast.error'), { id: "mm1" });
    }
  }

  async function restoreDish(d) {
    try {
      await updateRec("Dish", d.id, { is_archived: false });
      setDishesRaw(old => old.map(x => x.id === d.id ? { ...x, is_archived: false } : x));
      toast.success(t('toast.dish_restored'), { id: "mm1" });
    } catch (e) {
      toast.error(t('toast.error'), { id: "mm1" });
    }
  }

  // Stats
  const totalDishes = dishesRaw.length;
  const totalCats = catsRaw.length;

  // Render category row
  function renderCategory(cat, catIndex) {
    const catId = cat.id;
    const isCollapsed = collapsedCats.has(catId);
    const catDishes = filteredDishesMap.get(catId) || [];
    const dishCount = catDishes.length;
    const visibleCount = visibleDishesCount[catId] || INITIAL_VISIBLE;
    const visibleDishes = catDishes.slice(0, visibleCount);
    const hasMore = catDishes.length > visibleCount;

    return (
      <div key={catId} className="border rounded-lg bg-white overflow-hidden">
        {/* Category header - 2 lines for better readability */}
        <div
          className={`bg-slate-100 border-b-2 border-slate-200 cursor-pointer hover:bg-slate-200 transition drag-row ${dragOverCatId === catId ? "ring-2 ring-indigo-400 ring-inset bg-indigo-100" : ""}`}
          onDragOver={(e) => { if (canReorder) { e.preventDefault(); setDragOverCatId(catId); } }}
          onDragLeave={() => setDragOverCatId(null)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOverCatId(null);
            const dishId = e.dataTransfer.getData("dish");
            if (dishId) moveDish(dishId, catId, catDishes.length);
            const fromCatIdx = e.dataTransfer.getData("cat");
            if (fromCatIdx !== "" && fromCatIdx !== String(catIndex)) {
              reorderCats(Number(fromCatIdx), catIndex);
            }
          }}
        >
          {/* Line 1: Chevron + Name + Count */}
          <div 
            className="flex items-center gap-2 px-3 py-2"
            onClick={() => toggleCollapse(catId)}
          >
            <div className="flex h-6 w-6 items-center justify-center flex-shrink-0">
              {isCollapsed ? <ChevronRight className="h-5 w-5 text-slate-500" /> : <ChevronDown className="h-5 w-5 text-slate-500" />}
            </div>
            <div className="flex-1 min-w-0">
              <span className="font-semibold text-slate-800">{cat.name}</span>
              <span className="text-sm text-slate-500 ml-2">({dishCount})</span>
            </div>
          </div>
          
          {/* Line 2: Reorder + Edit + Add + Delete */}
          <div 
            className="flex items-center gap-1 px-3 pb-2"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Reorder buttons */}
            <Button
              variant="outline"
              size="sm"
              disabled={catIndex === 0 || !canReorder}
              onClick={() => moveCatUp(catIndex)}
              className="h-8 px-2 gap-1"
            >
              <ArrowUp className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{t('menumanage.up')}</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={catIndex >= cats.length - 1 || !canReorder}
              onClick={() => moveCatDown(catIndex)}
              className="h-8 px-2 gap-1"
            >
              <ArrowDown className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{t('menumanage.down')}</span>
            </Button>
            
            {/* Desktop: grip for drag */}
            <div
              className={`h-8 w-6 items-center justify-center text-slate-400 rounded border border-transparent ${canReorder ? "cursor-grab hover:bg-slate-300 hover:border-slate-300 active:cursor-grabbing" : "opacity-30"} hidden sm:flex`}
              draggable={canReorder}
              onDragStart={(e) => {
                e.dataTransfer.setData("cat", String(catIndex));
                setDragImage(e);
              }}
            >
              <GripVertical className="h-4 w-4" />
            </div>
            
            {/* Edit category */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => openEditCat(cat)}
              className="h-8 px-2 gap-1"
            >
              <Pencil className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{t('common.edit')}</span>
            </Button>
            
            {/* Add dish */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => openNewDish(catId)}
              className="h-8 px-2 gap-1"
            >
              <Plus className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{t('menumanage.dish')}</span>
            </Button>
            
            {/* Spacer */}
            <div className="flex-1" />
            
            {/* Delete */}
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50" 
              onClick={() => deleteCat(cat)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Dishes list */}
        {!isCollapsed && (
          <div className="divide-y">
            {visibleDishes.length === 0 ? (
              <div className="px-4 py-6 text-center text-slate-400 text-sm">
                {t('menumanage.no_dishes')}
                <Button variant="link" size="sm" className="ml-2" onClick={() => openNewDish(catId)}>
                  {t('common.add')}
                </Button>
              </div>
            ) : (
              visibleDishes.map((dish, dishIndex) => {
                const tr = getTranslatedDish(dish);
                return (
                  <div
                    key={dish.id}
                    className={`flex items-start gap-1.5 px-2 py-2 hover:bg-slate-50 transition drag-row ${dragOverId === dish.id ? "bg-indigo-50 ring-1 ring-indigo-300 ring-inset" : ""}`}
                    onDragOver={(e) => { if (canReorder) { e.preventDefault(); setDragOverId(dish.id); } }}
                    onDragLeave={() => setDragOverId(null)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setDragOverId(null);
                      const fromId = e.dataTransfer.getData("dish");
                      if (fromId && fromId !== String(dish.id)) {
                        moveDish(fromId, catId, dishIndex);
                      }
                    }}
                  >
                    {/* Reorder: ↑ [grip] ↓ */}
                    <div className="flex items-center flex-shrink-0 mt-1">
                      {(() => {
                        // Check if can move up (within category or to previous category)
                        const catIndex = cats.findIndex(c => String(c.id) === String(catId));
                        const canMoveUp = canReorder && (dishIndex > 0 || catIndex > 0);
                        const canMoveDown = canReorder && (dishIndex < visibleDishes.length - 1 || catIndex < cats.length - 1);
                        
                        return (
                          <>
                            <button
                              type="button"
                              disabled={!canMoveUp}
                              onClick={() => moveDishInCategory(dish.id, catId, "up")}
                              className={`h-7 w-6 flex items-center justify-center rounded text-slate-400 ${!canMoveUp ? "opacity-30" : "hover:bg-slate-200 active:bg-slate-300"}`}
                              title={dishIndex === 0 && catIndex > 0 ? t('menumanage.to_category', { name: cats[catIndex - 1]?.name }) : t('menumanage.up')}
                            >
                              <ArrowUp className="h-3.5 w-3.5" />
                            </button>
                            <div
                              className={`h-7 w-5 items-center justify-center text-slate-300 ${canReorder ? "cursor-grab hover:bg-slate-100 hover:text-slate-500 active:cursor-grabbing" : "opacity-30"} hidden sm:flex`}
                              draggable={canReorder}
                              onDragStart={(e) => {
                                e.dataTransfer.setData("dish", String(dish.id));
                                setDragImage(e);
                              }}
                            >
                              <GripVertical className="h-3.5 w-3.5" />
                            </div>
                            <button
                              type="button"
                              disabled={!canMoveDown}
                              onClick={() => moveDishInCategory(dish.id, catId, "down")}
                              className={`h-7 w-6 flex items-center justify-center rounded text-slate-400 ${!canMoveDown ? "opacity-30" : "hover:bg-slate-200 active:bg-slate-300"}`}
                              title={dishIndex === visibleDishes.length - 1 && catIndex < cats.length - 1 ? t('menumanage.to_category', { name: cats[catIndex + 1]?.name }) : t('menumanage.down')}
                            >
                              <ArrowDown className="h-3.5 w-3.5" />
                            </button>
                          </>
                        );
                      })()}
                    </div>

                    {/* Image */}
                    <div className="flex-shrink-0 mt-0.5">
                      {dish.image ? (
                        <img src={dish.image} alt="" className="h-11 w-11 rounded object-cover" />
                      ) : (
                        <div className="h-11 w-11 rounded bg-slate-100 flex items-center justify-center text-slate-300">
                          <ImageIcon className="h-5 w-5" />
                        </div>
                      )}
                    </div>

                    {/* Content - 2 lines */}
                    <div className="flex-1 min-w-0 py-0.5">
                      {/* Line 1: Name + Actions */}
                      <div className="flex items-center gap-1">
                        <div className="flex-1 font-medium text-slate-700 truncate">{tr.name}</div>
                        <div className="flex items-center flex-shrink-0">
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEditDish(dish)}>
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-amber-600 hover:text-amber-700 hover:bg-amber-50" onClick={() => archiveDish(dish)}>
                            <Archive className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                      {/* Line 2: Description + Price */}
                      <div className="flex items-center gap-2 mt-0.5">
                        <div className="flex-1 text-sm text-slate-500 truncate">
                          {tr.description || <span className="text-slate-300">—</span>}
                        </div>
                        <div className="text-sm font-medium text-slate-600 whitespace-nowrap flex-shrink-0">
                          {typeof dish.price === "number" ? dish.price.toFixed(0) : "—"} {currencySymbol}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}

            {/* Infinite scroll loader */}
            {hasMore && (
              <div
                ref={(el) => { loaderRefs.current[catId] = el; }}
                data-cat-id={catId}
                className="px-4 py-3 text-center text-slate-400"
              >
                <Loader2 className="h-5 w-5 animate-spin inline" />
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <PartnerShell partnerName={partner?.name} activeTab="menu">
      <TooltipProvider>
        <div className="mx-auto max-w-5xl px-3 py-4 md:px-6 md:py-6">
          {/* Header - Line 1: Title + Actions */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <h1 className="text-lg font-semibold truncate">{t('menumanage.title')}</h1>
              {loading && <Loader2 className="h-4 w-4 animate-spin text-indigo-500 flex-shrink-0" />}
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              <PageHelpButton pageKey="/menumanage" />
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => nav('/menudishes')}>
                    <Eye className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{t('menumanage.visual_editor')}</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => window.open(previewUrl, "_blank")}>
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{t('menumanage.client_menu')}</TooltipContent>
              </Tooltip>
            </div>
          </div>

          {/* Header - Line 2: Stats */}
          <div className="text-sm text-slate-400 mt-1">
            {totalCats} {pluralize(totalCats, t('menumanage.category_one'), t('menumanage.category_few'), t('menumanage.category_many'))} · {totalDishes} {pluralize(totalDishes, t('menumanage.dish_one'), t('menumanage.dish_few'), t('menumanage.dish_many'))}
          </div>

          {!loading && !apiReady && (
            <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
              {t('menumanage.connection_error')}
            </div>
          )}

          {/* Toolbar - Line 3: Search + Controls */}
          <div className="flex items-center gap-2 mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                className="w-full pl-9 h-10"
                placeholder={t('common.search') + '...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={lang} onValueChange={setLang}>
              <SelectTrigger className="w-[72px] h-10"><SelectValue /></SelectTrigger>
              <SelectContent>
                {enabledLanguages.map((code) => (
                  <SelectItem key={code} value={code}>{code}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-10 w-10"
                  onClick={handleCollapseAll}
                  disabled={cats.length < 2}
                >
                  {allCollapsed ? <ChevronsUpDown className="h-4 w-4" /> : <ChevronsDownUp className="h-4 w-4" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>{allCollapsed ? t('menumanage.expand_all') : t('menumanage.collapse_all')}</TooltipContent>
            </Tooltip>
            <Button className="h-10 gap-1.5" onClick={openNewCat} disabled={!apiReady || saving}>
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">{t('menumanage.category')}</span>
            </Button>
          </div>

          {/* Categories tree */}
          <div className="mt-4">
            {loading ? (
              <div className="py-12 flex justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
              </div>
            ) : filteredCats.length === 0 && !normStr(searchQuery) ? (
              <div className="rounded-xl border-2 border-dashed bg-slate-50 p-8 text-center">
                <div className="text-4xl mb-3">📋</div>
                <div className="font-medium text-slate-700">{t('menumanage.empty.title')}</div>
                <div className="text-sm text-slate-500 mt-1">{t('menumanage.empty.hint')}</div>
                <Button className="mt-4" onClick={openNewCat} disabled={!apiReady}>
                  <Plus className="mr-2 h-4 w-4" />{t('menumanage.create_category')}
                </Button>
              </div>
            ) : filteredCats.length === 0 && normStr(searchQuery) ? (
              <div className="rounded-xl border bg-white p-8 text-center">
                <div className="text-4xl mb-3">🔍</div>
                <div className="font-medium text-slate-700">{t('common.not_found')}</div>
                <div className="text-sm text-slate-500 mt-1">{t('menumanage.search.hint')}</div>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredCats.map((cat, idx) => renderCategory(cat, idx))}
              </div>
            )}

            {/* Archive section */}
            {archivedDishes.length > 0 && (
              <div className="mt-6 border rounded-lg bg-slate-50 overflow-hidden">
                <button
                  type="button"
                  onClick={() => setShowArchived(!showArchived)}
                  className="w-full flex items-center gap-2 px-4 py-3 text-left hover:bg-slate-100 transition"
                >
                  {showArchived ? <ChevronDown className="h-4 w-4 text-slate-400" /> : <ChevronRight className="h-4 w-4 text-slate-400" />}
                  <Archive className="h-4 w-4 text-slate-400" />
                  <span className="font-medium text-slate-600">{t('menumanage.archive.title')}</span>
                  <span className="text-sm text-slate-400">({archivedDishes.length} {pluralize(archivedDishes.length, t('menumanage.dish_one'), t('menumanage.dish_few'), t('menumanage.dish_many'))})</span>
                </button>
                {showArchived && (
                  <div className="border-t divide-y">
                    {archivedDishes.map(dish => {
                      const tr = getTranslatedDish(dish);
                      return (
                        <div key={dish.id} className="flex items-center gap-3 px-4 py-2 bg-white">
                          {dish.image ? (
                            <img src={dish.image} alt="" className="h-10 w-10 rounded object-cover flex-shrink-0 opacity-60" />
                          ) : (
                            <div className="h-10 w-10 rounded bg-slate-100 flex items-center justify-center text-slate-300 flex-shrink-0">
                              <ImageIcon className="h-5 w-5" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-slate-500 truncate">{tr.name}</div>
                            {tr.description && <div className="text-sm text-slate-400 truncate">{tr.description}</div>}
                          </div>
                          <div className="text-sm text-slate-400 whitespace-nowrap">
                            {typeof dish.price === "number" ? dish.price.toFixed(0) : "—"} {currencySymbol}
                          </div>
                          <div className="flex items-center gap-1">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50" onClick={() => restoreDish(dish)}>
                                  <ArchiveRestore className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>{t('menumanage.restore')}</TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => deleteDish(dish)}>
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>{t('menumanage.delete_forever')}</TooltipContent>
                            </Tooltip>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* DIALOG: Category */}
        <Dialog open={catDialog} onOpenChange={setCatDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{catForm.id ? t('menumanage.dialog.category.edit') : t('menumanage.dialog.category.new')}</DialogTitle>
              <DialogDescription>{t('menumanage.dialog.category.description')}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>{t('common.name')} *</Label>
                <Input value={catForm.name} onChange={(e) => setCatForm(f => ({ ...f, name: e.target.value }))} placeholder={t('menumanage.dialog.category.placeholder')} autoFocus />
              </div>
            </div>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button variant="outline" onClick={() => setCatDialog(false)} disabled={saving}>{t('common.cancel')}</Button>
              <Button onClick={saveCat} disabled={!apiReady || saving}>{saving ? t('common.saving') : t('common.save')}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* DIALOG: Delete blocked */}
        <Dialog open={!!deleteBlockedDialog} onOpenChange={() => setDeleteBlockedDialog(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                {deleteBlockedDialog?.type === "dish" ? t('menumanage.dialog.delete_blocked.dish_title') : t('menumanage.dialog.delete_blocked.category_title')}
              </DialogTitle>
            </DialogHeader>
            <div className="text-slate-600">
              {deleteBlockedDialog?.type === "dish" ? (
                <>
                  {t('menumanage.dialog.delete_blocked.dish_message', { name: deleteBlockedDialog?.dish?.name, count: deleteBlockedDialog?.orderCount })}
                  <br /><br />
                  {t('menumanage.dialog.delete_blocked.dish_hint')}
                </>
              ) : (
                <>
                  {t('menumanage.dialog.delete_blocked.category_message', { name: deleteBlockedDialog?.category?.name, count: deleteBlockedDialog?.dishCount })}
                </>
              )}
            </div>
            <DialogFooter className="gap-2 sm:gap-0">
              {deleteBlockedDialog?.type === "dish" && (
                <Button 
                  variant="outline" 
                  onClick={() => {
                    archiveDish(deleteBlockedDialog.dish);
                    setDeleteBlockedDialog(null);
                  }}
                >
                  <Archive className="mr-2 h-4 w-4" />
                  {t('menumanage.to_archive')}
                </Button>
              )}
              <Button onClick={() => setDeleteBlockedDialog(null)}>{t('common.ok')}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* DIALOG: Dish */}
        <Dialog modal={false} open={dishDialog} onOpenChange={(open) => { setDishDialog(open); if (!open) setDishFormErrors({}); }}>
          <DialogContent className="max-w-lg max-h-[90vh] flex flex-col p-0">
            <DialogHeader className="px-6 pt-6 pb-2">
              <DialogTitle>{dishForm.id ? t('menumanage.dialog.dish.edit') : t('menumanage.dialog.dish.new')}</DialogTitle>
              <DialogDescription>{t('menumanage.dialog.dish.description')}</DialogDescription>
            </DialogHeader>
            
            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto px-6 pb-4 space-y-4">
              {enabledLanguages.length > 1 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Languages className="h-4 w-4 text-slate-500" />
                    <span className="text-sm font-medium text-slate-700">{t('common.language')}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {enabledLanguages.map((langCode) => {
                      const isDefault = langCode === defaultLanguage;
                      const activeLang = enabledLanguages.includes(dishDialogLang) ? dishDialogLang : defaultLanguage;
                      const isActive = activeLang === langCode;
                      const hasTranslation = isDefault ? true : !!(dishForm.translations?.[langCode]?.name);
                      return (
                        <button
                          key={langCode}
                          type="button"
                          onClick={() => setDishDialogLang(langCode)}
                          className={`px-3 py-1.5 rounded-lg border text-sm font-medium transition flex items-center gap-1.5 ${isActive ? "bg-indigo-600 border-indigo-600 text-white" : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"}`}
                        >
                          {langCode}
                          {isDefault && <span className="text-xs opacity-70">({t('menumanage.primary_short')})</span>}
                          {!isDefault && <span className={`text-xs ${isActive ? "opacity-70" : hasTranslation ? "text-green-600" : "text-slate-400"}`}>{hasTranslation ? "✓" : "○"}</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {(() => {
                const activeLang = enabledLanguages.includes(dishDialogLang) ? dishDialogLang : defaultLanguage;
                const isDefaultLang = activeLang === defaultLanguage;
                const showLangLabel = enabledLanguages.length > 1 && !isDefaultLang;
                return (
                  <>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label>{t('common.name')} *{showLangLabel && <span className="ml-2 text-xs text-slate-500">({activeLang})</span>}</Label>
                        {isDefaultLang ? (
                          <Input 
                            value={dishForm.name} 
                            onChange={(e) => { setDishForm(f => ({ ...f, name: e.target.value })); setDishFormErrors(e => ({ ...e, name: "" })); }} 
                            placeholder={t('menumanage.dialog.dish.name_placeholder')} 
                            autoFocus 
                            className={dishFormErrors.name ? "border-red-500 focus-visible:ring-red-500" : ""}
                          />
                        ) : (
                          <Input
                            value={dishForm.translations?.[activeLang]?.name || ""}
                            onChange={(e) => setDishForm(f => ({ ...f, translations: { ...f.translations, [activeLang]: { ...f.translations?.[activeLang], name: e.target.value } } }))}
                            placeholder={dishForm.name || t('menumanage.translation')}
                          />
                        )}
                        {dishFormErrors.name && <div className="text-sm text-red-500 flex items-center gap-1"><AlertTriangle className="h-3 w-3" />{dishFormErrors.name}</div>}
                      </div>
                      <div className="space-y-2">
                        <Label>{t('menumanage.price')} *</Label>
                        <Input 
                          value={dishForm.price} 
                          onChange={(e) => { setDishForm(f => ({ ...f, price: e.target.value })); setDishFormErrors(e => ({ ...e, price: "" })); }} 
                          placeholder="0" 
                          inputMode="decimal" 
                          className={dishFormErrors.price ? "border-red-500 focus-visible:ring-red-500" : ""}
                        />
                        {dishFormErrors.price && <div className="text-sm text-red-500 flex items-center gap-1"><AlertTriangle className="h-3 w-3" />{dishFormErrors.price}</div>}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>{t('common.description')}{showLangLabel && <span className="ml-2 text-xs text-slate-500">({activeLang})</span>}</Label>
                      {isDefaultLang ? (
                        <Input value={dishForm.description} onChange={(e) => setDishForm(f => ({ ...f, description: e.target.value }))} placeholder={t('menumanage.dialog.dish.description_placeholder')} />
                      ) : (
                        <Input
                          value={dishForm.translations?.[activeLang]?.description || ""}
                          onChange={(e) => setDishForm(f => ({ ...f, translations: { ...f.translations, [activeLang]: { ...f.translations?.[activeLang], description: e.target.value } } }))}
                          placeholder={dishForm.description || t('menumanage.translation')}
                        />
                      )}
                    </div>
                  </>
                );
              })()}

              <div className="space-y-2">
                <Label>{t('menumanage.categories')}</Label>
                <div className="rounded-lg border p-3 space-y-2">
                  {catsRaw.length === 0 ? (
                    <div className="text-sm text-slate-500">{t('menumanage.no_categories')}</div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {sortByOrder(catsRaw).map((c) => {
                        const isSelected = (dishForm.category_ids || []).includes(String(c.id));
                        const isPrimary = dishForm.category === String(c.id);
                        return (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => toggleDishCategory(String(c.id))}
                            className={`px-3 py-1.5 rounded-lg border text-sm font-medium transition flex items-center gap-1.5 ${isSelected ? "bg-indigo-50 border-indigo-200 text-indigo-700" : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"} ${isPrimary ? "ring-2 ring-indigo-400 ring-offset-1" : ""}`}
                          >
                            {isSelected && <Check className="h-3.5 w-3.5" />}
                            {c.name}
                            {isPrimary && <span className="text-xs opacity-60">({t('menumanage.primary_short')})</span>}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Фото блюда section */}
              <div className="space-y-3">
                <Label>{t('menumanage.dish_photo')}</Label>
                
                {/* ImageUploader for drag-drop/click upload */}
                <ImageUploader
                  value={dishForm.image || ""}
                  onChange={(url) => setDishForm(f => ({ ...f, image: url }))}
                  placeholder={t('menumanage.upload_photo')}
                  size={120}
                />
                
                {/* Alternative: URL input */}
                <div className="space-y-1.5">
                  <div className="text-sm text-slate-500">{t('menumanage.or_url')}:</div>
                  <Input 
                    value={dishForm.image} 
                    onChange={(e) => setDishForm(f => ({ ...f, image: e.target.value }))} 
                    placeholder="https://example.com/photo.jpg" 
                  />
                  <p className="text-xs text-slate-400 flex items-start gap-1.5">
                    <Info className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
                    <span>{t('menumanage.photo_hint')}</span>
                  </p>
                </div>
              </div>

              <div className="rounded-lg border p-4">
                <div className="font-medium text-sm">{t('menumanage.sales_channels')}</div>
                <div className="mt-3 flex flex-wrap gap-4">
                  {getChannels(t).map(({ key, label }) => (
                    <label key={key} className="flex items-center gap-2 text-sm cursor-pointer">
                      <input type="checkbox" checked={dishForm[`enabled_${key}`]} onChange={(e) => setDishForm(f => ({ ...f, [`enabled_${key}`]: e.target.checked }))} className="h-4 w-4 rounded" />
                      {label}
                    </label>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Sticky footer */}
            <div className="border-t bg-slate-50 px-6 py-4 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDishDialog(false)} disabled={saving}>{t('common.cancel')}</Button>
              <Button onClick={saveDish} disabled={!apiReady || saving}>{saving ? t('common.saving') : t('common.save')}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </TooltipProvider>
    </PartnerShell>
  );
}