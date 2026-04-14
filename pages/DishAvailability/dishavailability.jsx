// ================================
// pages/dishavailability1.jsx — LAB ONLY
// Bulk Edit: Dish Availability per Channel + sort_order
// ================================

// ================================
// BLOCK 00: IMPORTS
// ================================
import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  FlaskConical,
  ArrowLeft,
  Loader2,
  Save,
  Search,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";

// ================================
// BLOCK 01: HELPERS
// ================================
function normStr(v) {
  return String(v == null ? "" : v);
}

function isArchivedDish(dish) {
  return normStr(dish?.description).toLowerCase().includes(":::archived:::");
}

function isDirty(original, edited) {
  return (
    original.enabled_hall !== edited.enabled_hall ||
    original.enabled_pickup !== edited.enabled_pickup ||
    original.enabled_delivery !== edited.enabled_delivery ||
    original.sort_order !== edited.sort_order
  );
}

// ================================
// BLOCK 02: ERROR BOUNDARY
// ================================
class PageErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(err) {
    return { hasError: true, error: err };
  }
  componentDidCatch(err) {
    console.error("DishAvailability1 crashed:", err);
  }
  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <div className="min-h-screen bg-slate-50 p-8">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-lg">Ошибка на странице</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-slate-600">Откройте DevTools → Console и пришлите ошибку.</p>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Перезагрузить
            </Button>
            <p className="text-xs text-slate-500 break-words">{normStr(this.state.error?.message || this.state.error)}</p>
          </CardContent>
        </Card>
      </div>
    );
  }
}

// ================================
// BLOCK 03: MAIN COMPONENT
// ================================
export default function DishAvailability1() {
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [showArchived, setShowArchived] = useState(false);
  const [showOnlyMismatched, setShowOnlyMismatched] = useState(false);

  const [editedDishes, setEditedDishes] = useState({});

  const [isBulkRunning, setIsBulkRunning] = useState(false);
  const [bulkProgress, setBulkProgress] = useState({ current: 0, total: 0 });
  const [bulkErrors, setBulkErrors] = useState([]);

  const [normalizeConfirmOpen, setNormalizeConfirmOpen] = useState(false);

  const { data: currentUser } = useQuery({
    queryKey: ["currentUser"],
    queryFn: () => base44.auth.me(),
    retry: false,
  });

  const partnerId = currentUser?.partner;

  const { data: categoriesRaw = [], isLoading: loadingCategories } = useQuery({
    queryKey: ["categories", partnerId],
    enabled: !!partnerId,
    queryFn: () => base44.entities.Category.filter({ partner: partnerId }),
    initialData: [],
  });

  const { data: dishesRaw = [], isLoading: loadingDishes } = useQuery({
    queryKey: ["dishes", partnerId],
    enabled: !!partnerId,
    queryFn: () => base44.entities.Dish.filter({ partner: partnerId }),
    initialData: [],
  });

  const categories = useMemo(() => {
    return [...categoriesRaw].sort((a, b) => {
      const oa = a?.sort_order ?? 999999;
      const ob = b?.sort_order ?? 999999;
      if (oa !== ob) return oa - ob;
      return normStr(a?.name).localeCompare(normStr(b?.name), "ru");
    });
  }, [categoriesRaw]);

  const categoryNameById = useMemo(() => {
    const map = new Map();
    categories.forEach((c) => map.set(c.id, c.name));
    return map;
  }, [categories]);

  const filteredDishes = useMemo(() => {
    let result = dishesRaw;

    if (!showArchived) {
      result = result.filter((d) => !isArchivedDish(d));
    }

    const s = normStr(search).trim().toLowerCase();
    if (s) {
      result = result.filter((d) => normStr(d?.name).toLowerCase().includes(s));
    }

    if (categoryFilter !== "all") {
      result = result.filter((d) => d?.category === categoryFilter);
    }

    if (showOnlyMismatched) {
      result = result.filter((d) => {
        const hall = d.enabled_hall !== (d.is_available !== false);
        const pickup = d.enabled_pickup !== (d.is_online_enabled !== false);
        const delivery = d.enabled_delivery !== (d.is_online_enabled !== false);
        return hall || pickup || delivery;
      });
    }

    return result;
  }, [dishesRaw, search, categoryFilter, showArchived, showOnlyMismatched]);

  const saveDishMutation = useMutation({
    mutationFn: ({ id, payload }) => base44.entities.Dish.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dishes", partnerId] });
    },
  });

  const getEdited = (dishId) => {
    return editedDishes[dishId] || null;
  };

  const setEdited = (dishId, field, value) => {
    setEditedDishes((prev) => ({
      ...prev,
      [dishId]: {
        ...(prev[dishId] || {}),
        [field]: value,
      },
    }));
  };

  const saveDish = async (dish) => {
    const edited = getEdited(dish.id);
    if (!edited) return;

    const original = {
      enabled_hall: dish.enabled_hall,
      enabled_pickup: dish.enabled_pickup,
      enabled_delivery: dish.enabled_delivery,
      sort_order: dish.sort_order,
    };

    const payload = {
      enabled_hall: edited.enabled_hall !== undefined ? edited.enabled_hall : dish.enabled_hall,
      enabled_pickup: edited.enabled_pickup !== undefined ? edited.enabled_pickup : dish.enabled_pickup,
      enabled_delivery: edited.enabled_delivery !== undefined ? edited.enabled_delivery : dish.enabled_delivery,
    };

    if (edited.sort_order !== undefined) {
      const val = edited.sort_order === "" ? null : Number.parseInt(String(edited.sort_order), 10);
      if (val !== null && Number.isFinite(val)) {
        payload.sort_order = val;
      } else {
        payload.sort_order = null;
      }
    }

    try {
      await saveDishMutation.mutateAsync({ id: dish.id, payload });
      setEditedDishes((prev) => {
        const next = { ...prev };
        delete next[dish.id];
        return next;
      });
      toast.success(`${dish.name} сохранено`);
    } catch (err) {
      console.error("Save dish failed:", err);
      toast.error(`Не удалось сохранить ${dish.name}`);
    }
  };

  const discardDish = (dishId) => {
    setEditedDishes((prev) => {
      const next = { ...prev };
      delete next[dishId];
      return next;
    });
  };

  const runBulkUpdate = async (updateFn, description) => {
    if (!filteredDishes.length) {
      toast.error("Нет блюд для обновления");
      return;
    }

    setIsBulkRunning(true);
    setBulkProgress({ current: 0, total: filteredDishes.length });
    setBulkErrors([]);

    const errorList = [];
    let updatedCount = 0;

    try {
      const BATCH_SIZE = 20;
      for (let i = 0; i < filteredDishes.length; i += BATCH_SIZE) {
        const batch = filteredDishes.slice(i, i + BATCH_SIZE);

        const promises = batch.map((dish) => {
          const payload = updateFn(dish);
          return base44.entities.Dish.update(dish.id, payload)
            .then(() => {
              updatedCount++;
              setBulkProgress((p) => ({ ...p, current: p.current + 1 }));
            })
            .catch((err) => {
              const msg = `${dish.name}: ${err.message || err}`;
              errorList.push(msg);
              if (errorList.length <= 5) console.error("Bulk update failed:", err, dish);
              setBulkProgress((p) => ({ ...p, current: p.current + 1 }));
            });
        });

        await Promise.all(promises);
      }

      queryClient.invalidateQueries({ queryKey: ["dishes", partnerId] });
      setEditedDishes({});

      if (errorList.length === 0) {
        toast.success(`${description}: обновлено ${updatedCount} блюд`);
      } else {
        toast.error(`${description}: ${errorList.length} ошибок`);
      }
    } catch (err) {
      console.error("Bulk update failed:", err);
      toast.error("Массовое обновление прервано");
      errorList.push(`Critical: ${err.message || err}`);
    } finally {
      setIsBulkRunning(false);
      setBulkErrors(errorList);
    }
  };

  const normalizeSortOrder = async () => {
    if (!filteredDishes.length) {
      toast.error("Нет блюд для нормализации");
      return;
    }

    const sorted = [...filteredDishes].sort((a, b) => {
      const oa = a?.sort_order;
      const ob = b?.sort_order;
      if (oa == null && ob == null) return normStr(a?.name).localeCompare(normStr(b?.name), "ru");
      if (oa == null) return 1;
      if (ob == null) return -1;
      if (oa !== ob) return oa - ob;
      return normStr(a?.name).localeCompare(normStr(b?.name), "ru");
    });

    setIsBulkRunning(true);
    setBulkProgress({ current: 0, total: sorted.length });
    setBulkErrors([]);

    const errorList = [];
    let updatedCount = 0;

    try {
      const BATCH_SIZE = 20;
      for (let i = 0; i < sorted.length; i += BATCH_SIZE) {
        const batch = sorted.slice(i, i + BATCH_SIZE);

        const promises = batch.map((dish, batchIdx) => {
          const globalIdx = i + batchIdx;
          const newSortOrder = (globalIdx + 1) * 10;

          return base44.entities.Dish.update(dish.id, { sort_order: newSortOrder })
            .then(() => {
              updatedCount++;
              setBulkProgress((p) => ({ ...p, current: p.current + 1 }));
            })
            .catch((err) => {
              const msg = `${dish.name}: ${err.message || err}`;
              errorList.push(msg);
              if (errorList.length <= 5) console.error("Normalize failed:", err, dish);
              setBulkProgress((p) => ({ ...p, current: p.current + 1 }));
            });
        });

        await Promise.all(promises);
      }

      queryClient.invalidateQueries({ queryKey: ["dishes", partnerId] });
      setEditedDishes({});
      setNormalizeConfirmOpen(false);

      if (errorList.length === 0) {
        toast.success(`Нормализация: обновлено ${updatedCount} блюд`);
      } else {
        toast.error(`Нормализация: ${errorList.length} ошибок`);
      }
    } catch (err) {
      console.error("Normalize failed:", err);
      toast.error("Нормализация прервана");
      errorList.push(`Critical: ${err.message || err}`);
    } finally {
      setIsBulkRunning(false);
      setBulkErrors(errorList);
    }
  };

  if (!partnerId) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="bg-yellow-50 border-b border-yellow-200 p-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <FlaskConical className="w-5 h-5 text-yellow-700" />
              <span className="text-sm font-medium text-yellow-800">LAB VERSION — Dish Availability</span>
            </div>
            <Link to="/lab">
              <Button size="sm" variant="outline">Back to Lab hub</Button>
            </Link>
          </div>
        </div>
        <div className="p-8 text-center text-slate-500">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Доступ запрещен</h1>
          <p>Эта страница доступна только для владельцев ресторанов.</p>
        </div>
      </div>
    );
  }

  return (
    <PageErrorBoundary>
      <div className="min-h-screen bg-slate-50">
        <div className="bg-yellow-50 border-b border-yellow-200 p-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <FlaskConical className="w-5 h-5 text-yellow-700" />
              <span className="text-sm font-medium text-yellow-800">LAB VERSION — Dish Availability</span>
            </div>
            <div className="flex gap-2">
              <Link to="/menumanage1">
                <Button size="sm" variant="outline">Settings / Tables</Button>
              </Link>
              <Link to="/lab">
                <Button size="sm" variant="outline">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Lab hub
                </Button>
              </Link>
            </div>
          </div>
        </div>

        <div className="p-8 max-w-7xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-slate-900">Dish Availability (Bulk Edit)</h1>
            <p className="text-slate-500 mt-1">Быстрое редактирование доступности по каналам + порядок</p>
            <p className="text-xs text-slate-400 mt-2 font-mono">Partner ID: {partnerId}</p>
          </div>

          {/* FILTERS */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex flex-col lg:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
                  <Input
                    placeholder="Поиск по названию блюда..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9"
                  />
                </div>

                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-[220px]">
                    <SelectValue placeholder="Категория" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Все категории</SelectItem>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <label className="flex items-center gap-2 text-sm whitespace-nowrap border rounded px-3 py-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showArchived}
                    onChange={(e) => setShowArchived(e.target.checked)}
                    className="w-4 h-4"
                  />
                  Показать архивные
                </label>

                <label className="flex items-center gap-2 text-sm whitespace-nowrap border rounded px-3 py-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showOnlyMismatched}
                    onChange={(e) => setShowOnlyMismatched(e.target.checked)}
                    className="w-4 h-4"
                  />
                  Только несовпадения
                </label>
              </div>
            </CardContent>
          </Card>

          {/* BULK ACTIONS */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Массовые действия</CardTitle>
            </CardHeader>
            <CardContent>
              {isBulkRunning ? (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                    <div>
                      <div className="font-medium text-blue-900">Обновление...</div>
                      <div className="text-sm text-blue-700">
                        {bulkProgress.current} / {bulkProgress.total}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <div className="text-sm text-slate-600 mb-4">
                    Применяется ко всем отфильтрованным блюдам ({filteredDishes.length} шт.)
                  </div>

                  <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                    <Button
                      variant="outline"
                      onClick={() =>
                        runBulkUpdate((d) => ({ enabled_hall: true }), "Включить Hall")
                      }
                      disabled={isBulkRunning || filteredDishes.length === 0}
                    >
                      ✅ Hall ON
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() =>
                        runBulkUpdate((d) => ({ enabled_hall: false }), "Выключить Hall")
                      }
                      disabled={isBulkRunning || filteredDishes.length === 0}
                    >
                      ❌ Hall OFF
                    </Button>

                    <Button
                      variant="outline"
                      onClick={() =>
                        runBulkUpdate((d) => ({ enabled_pickup: true }), "Включить Pickup")
                      }
                      disabled={isBulkRunning || filteredDishes.length === 0}
                    >
                      ✅ Pickup ON
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() =>
                        runBulkUpdate((d) => ({ enabled_pickup: false }), "Выключить Pickup")
                      }
                      disabled={isBulkRunning || filteredDishes.length === 0}
                    >
                      ❌ Pickup OFF
                    </Button>

                    <Button
                      variant="outline"
                      onClick={() =>
                        runBulkUpdate((d) => ({ enabled_delivery: true }), "Включить Delivery")
                      }
                      disabled={isBulkRunning || filteredDishes.length === 0}
                    >
                      ✅ Delivery ON
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() =>
                        runBulkUpdate((d) => ({ enabled_delivery: false }), "Выключить Delivery")
                      }
                      disabled={isBulkRunning || filteredDishes.length === 0}
                    >
                      ❌ Delivery OFF
                    </Button>

                    <Button
                      variant="outline"
                      onClick={() =>
                        runBulkUpdate(
                          (d) => ({ enabled_hall: true, enabled_pickup: true, enabled_delivery: true }),
                          "Все каналы ON"
                        )
                      }
                      disabled={isBulkRunning || filteredDishes.length === 0}
                      className="md:col-span-2 lg:col-span-1"
                    >
                      ✅ Все ON
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() =>
                        runBulkUpdate(
                          (d) => ({ enabled_hall: false, enabled_pickup: false, enabled_delivery: false }),
                          "Все каналы OFF"
                        )
                      }
                      disabled={isBulkRunning || filteredDishes.length === 0}
                      className="md:col-span-2 lg:col-span-1"
                    >
                      ❌ Все OFF
                    </Button>

                    <Button
                      variant="outline"
                      onClick={() => setNormalizeConfirmOpen(true)}
                      disabled={isBulkRunning || filteredDishes.length === 0}
                      className="md:col-span-2 lg:col-span-1 gap-2"
                    >
                      <RotateCcw className="w-4 h-4" />
                      Нормализовать порядок
                    </Button>
                  </div>

                  {bulkErrors.length > 0 && (
                    <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
                      <div className="font-medium text-red-900 mb-2">Ошибки ({bulkErrors.length})</div>
                      <div className="space-y-1 text-xs text-red-700">
                        {bulkErrors.slice(0, 5).map((err, idx) => (
                          <div key={idx} className="font-mono">
                            {err}
                          </div>
                        ))}
                        {bulkErrors.length > 5 && (
                          <div className="text-red-600 mt-2">... и ещё {bulkErrors.length - 5}</div>
                        )}
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          {/* TABLE */}
          {loadingDishes || loadingCategories ? (
            <Card>
              <CardContent className="p-10 text-center">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mx-auto mb-3" />
                <p className="text-slate-500">Загрузка блюд...</p>
              </CardContent>
            </Card>
          ) : filteredDishes.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center text-slate-500">
                {search || categoryFilter !== "all" || showOnlyMismatched
                  ? "Нет блюд, соответствующих фильтрам"
                  : "Нет блюд"}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Название</TableHead>
                      <TableHead className="w-32">Категория</TableHead>
                      <TableHead className="w-20 text-center">Hall</TableHead>
                      <TableHead className="w-20 text-center">Pickup</TableHead>
                      <TableHead className="w-20 text-center">Delivery</TableHead>
                      <TableHead className="w-24">Порядок</TableHead>
                      <TableHead className="w-32 text-right">Действия</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredDishes.map((dish) => {
                      const edited = getEdited(dish.id);
                      const dirty = edited && isDirty(dish, {
                        enabled_hall: edited.enabled_hall !== undefined ? edited.enabled_hall : dish.enabled_hall,
                        enabled_pickup: edited.enabled_pickup !== undefined ? edited.enabled_pickup : dish.enabled_pickup,
                        enabled_delivery: edited.enabled_delivery !== undefined ? edited.enabled_delivery : dish.enabled_delivery,
                        sort_order: edited.sort_order !== undefined ? (edited.sort_order === "" ? null : Number.parseInt(edited.sort_order, 10)) : dish.sort_order,
                      });

                      const hallVal = edited?.enabled_hall !== undefined ? edited.enabled_hall : dish.enabled_hall;
                      const pickupVal = edited?.enabled_pickup !== undefined ? edited.enabled_pickup : dish.enabled_pickup;
                      const deliveryVal = edited?.enabled_delivery !== undefined ? edited.enabled_delivery : dish.enabled_delivery;
                      const sortVal = edited?.sort_order !== undefined ? edited.sort_order : (dish.sort_order == null ? "" : String(dish.sort_order));

                      return (
                        <TableRow key={dish.id} className={dirty ? "bg-amber-50" : ""}>
                          <TableCell className="font-medium">
                            {dish.name}
                            {dirty && <Badge variant="outline" className="ml-2 text-xs">Не сохранено</Badge>}
                          </TableCell>
                          <TableCell className="text-slate-500 text-sm">
                            {categoryNameById.get(dish.category) || "—"}
                          </TableCell>
                          <TableCell className="text-center">
                            <input
                              type="checkbox"
                              checked={hallVal !== false}
                              onChange={(e) => setEdited(dish.id, "enabled_hall", e.target.checked)}
                              className="w-4 h-4"
                            />
                          </TableCell>
                          <TableCell className="text-center">
                            <input
                              type="checkbox"
                              checked={pickupVal !== false}
                              onChange={(e) => setEdited(dish.id, "enabled_pickup", e.target.checked)}
                              className="w-4 h-4"
                            />
                          </TableCell>
                          <TableCell className="text-center">
                            <input
                              type="checkbox"
                              checked={deliveryVal !== false}
                              onChange={(e) => setEdited(dish.id, "enabled_delivery", e.target.checked)}
                              className="w-4 h-4"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              value={sortVal}
                              onChange={(e) => setEdited(dish.id, "sort_order", e.target.value)}
                              placeholder="—"
                              className="h-8 w-20 text-sm"
                            />
                          </TableCell>
                          <TableCell className="text-right">
                            {dirty ? (
                              <div className="inline-flex gap-1">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => saveDish(dish)}
                                  disabled={saveDishMutation.isPending}
                                  title="Сохранить"
                                >
                                  <Save className="w-4 h-4 text-green-600" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => discardDish(dish.id)}
                                  title="Отменить"
                                >
                                  <X className="w-4 h-4 text-slate-500" />
                                </Button>
                              </div>
                            ) : (
                              <Badge variant="outline" className="text-xs text-green-600">
                                Сохранено
                              </Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </div>

        {/* NORMALIZE CONFIRM DIALOG */}
        <Dialog open={normalizeConfirmOpen} onOpenChange={setNormalizeConfirmOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Нормализовать порядок?</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 py-4">
              <p className="text-sm text-slate-600">
                Это обновит sort_order у всех отфильтрованных блюд ({filteredDishes.length} шт.):
              </p>
              <ul className="list-disc ml-6 text-sm text-slate-600">
                <li>Сортировка: текущий sort_order → имя (RU)</li>
                <li>Присвоить: 10, 20, 30, ...</li>
              </ul>
              <div className="text-xs text-amber-600">
                Предыдущие значения sort_order будут перезаписаны.
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setNormalizeConfirmOpen(false)}>
                Отмена
              </Button>
              <Button
                onClick={normalizeSortOrder}
                disabled={isBulkRunning}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                Подтверждаю
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </PageErrorBoundary>
  );
}