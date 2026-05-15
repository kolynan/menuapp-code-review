import { useEffect, useMemo, useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { base44 } from "@/api/base44Client";
import { sortDishesStable } from "@/components/menuChannelLogic";
import { getDishCategoryIds } from "@/components/_shared/entities/dish";
import { syncOrderIds, moveToIndex, reorderInsert } from "@/components/_shared/dnd/reorderHelpers";
import { normStr } from "@/components/_shared/utils/normStr";
import { isRateLimitError } from "@/components/_shared/security/rateLimit";

const TOAST_ID = "mm1";

// BUG 2 FIX: Header height for auto-scroll calculation
const HEADER_HEIGHT = 180;
const SCROLL_PAD = 80;
const SCROLL_SPEED = 12;

// BUG-MD-002 FIX: Use Promise.allSettled to avoid partial failure leaving DB inconsistent
async function batchedUpdates(items, updateFn, batchSize = 5, delayMs = 100) {
  const results = [];
  const failed = [];
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const settled = await Promise.allSettled(batch.map(updateFn));
    // L-2 FIX: early-exit on 429 - skip remaining batches to prevent partial DB state
    const failed429 = settled.find(r => r.status === "rejected" && isRateLimitError(r.reason));
    if (failed429) throw failed429.reason;
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

export function useMenuDishesDnd({
  categories,
  categoriesMap,
  dishesRaw,
  dishesFiltered,
  partnerId,
  queryClient,
  fetchingDishes,
}) {
  const safeCategories = Array.isArray(categories) ? categories : [];
  const safeDishesRaw = Array.isArray(dishesRaw) ? dishesRaw : [];
  const safeDishesFiltered = Array.isArray(dishesFiltered) ? dishesFiltered : [];

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

  // BUG 3 FIX: Build dishes by category - use Set to prevent duplicates
  const dishesByCategory = useMemo(() => {
    const result = new Map();

    safeCategories.forEach((cat) => {
      result.set(cat.id, []);
    });

    safeDishesFiltered.forEach((dish) => {
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
  }, [safeCategories, safeDishesFiltered, pendingMoveDish]);

  const displayCategories = useMemo(() => {
    const currentIds = safeCategories.map((c) => c.id);
    const order = syncOrderIds(catOrderIds, currentIds);
    const map = new Map(safeCategories.map((c) => [c.id, c]));
    return order.map((id) => map.get(id)).filter(Boolean);
  }, [safeCategories, catOrderIds]);

  // Initialize category order
  useEffect(() => {
    const currentIds = safeCategories.map((c) => c.id);
    setCatOrderIds((prev) =>
      prev && prev.length ? syncOrderIds(prev, currentIds) : currentIds
    );
  }, [safeCategories]);

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
      const map = new Map(safeCategories.map((c) => [c.id, c]));
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
    onMutate: () => {
      // L-1 FIX: snapshot category order before mutation for rollback on error
      return { snapshot: [...catOrderIdsRef.current] };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories", partnerId] });
    },
    onError: (error, variables, context) => {
      // L-1 FIX: restore pre-drag order on error (mirrors cross-cat snapshotOrderByCat pattern)
      if (context?.snapshot) setCatOrderIds(context.snapshot);
      toast.error("Не удалось сохранить порядок", { id: TOAST_ID });
    },
  });

  // P0.4: Use batched updates to avoid rate limit
  const saveDishOrderMutation = useMutation({
    mutationFn: async ({ catId, ids }) => {
      const map = new Map(safeDishesRaw.map((d) => [d.id, d]));
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
    onMutate: () => {
      // L-1 FIX: snapshot dish order before mutation for rollback on error
      return { snapshot: dishOrderByCatRef.current ? { ...dishOrderByCatRef.current } : null };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dishes", partnerId] });
    },
    onError: (error, variables, context) => {
      // L-1 FIX: restore pre-drag dish order on error (mirrors cross-cat snapshotOrderByCat pattern)
      if (context?.snapshot) setDishOrderByCat(context.snapshot);
      toast.error("Не удалось сохранить порядок блюд", { id: TOAST_ID });
    },
  });

  // BUG-MD-003 FIX: Also block during refetch after successful cross-category move
  // Uses fetchingDishes (isFetching) not loadingDishes (isLoading) - isLoading is false during background refetch
  const isSavingDish = moveDishToCategoryMutation.isPending || saveDishOrderMutation.isPending ||
    (moveDishToCategoryMutation.isSuccess && fetchingDishes);

  function persistCategoryOrder(ids) {
    const safe = Array.isArray(ids) ? ids.filter(Boolean) : [];
    if (!safe.length) return;
    saveCategoryOrderMutation.mutate({ ids: safe });
  }

  function persistDishOrder(catId, ids) {
    const safe = Array.isArray(ids) ? ids.filter(Boolean) : [];
    if (!catId || !safe.length) return;
    saveDishOrderMutation.reset(); // L-3 FIX: clear any stuck pending state before new mutate
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

    const baseIds = safeCategories.map((c) => c.id);
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
        title: normStr(safeCategories.find((c) => c.id === id)?.name || "Раздел"),
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

        const baseIds = safeCategories.map((c) => c.id);
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

      const baseIds = safeCategories.map((c) => c.id);
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
  }, [draggingCatId, safeCategories]);

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
          safeDishesRaw.find((d) => d.id === dishId)?.name || "Блюдо"
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

      const dish = safeDishesRaw.find((d) => d.id === dishId);
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
  }, [draggingDishId, displayCategories, dishesByCategory, safeDishesRaw, categoriesMap]);

  return {
    displayCategories,
    dishesByCategory,
    getOrderedDishesForCategory,
    catOrderIds,
    dishOrderByCat,
    draggingCatId,
    dragOverCatId,
    draggingDishId,
    draggingDishSourceCatId,
    dragOverCategoryId,
    dragOverDishId,
    dragInsertIndex,
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
  };
}
