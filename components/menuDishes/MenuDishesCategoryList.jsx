import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { normStr } from "@/components/_shared/utils/normStr";
import { CategorySection } from "@/components/menuDishes/CategorySection";

const CURRENCY_SYMBOL_BY_CODE = {
  KZT: "₸",
  USD: "$",
  EUR: "€",
  RUB: "₽",
  GBP: "£",
  TRY: "₺",
  AED: "د.إ",
  CNY: "¥",
};

function formatPriceDisplay(price, currencyCode = "KZT") {
  const n = Number(price || 0);
  const decimals = ["KZT", "RUB", "JPY", "KRW"].includes(currencyCode) ? 0 : 2;
  const formatted = n.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  const symbol = CURRENCY_SYMBOL_BY_CODE[currencyCode] || currencyCode;
  return `${formatted} ${symbol}`;
}

export function MenuDishesCategoryList({
  categories,
  showNoSearchResults,
  search,
  onSearchClear,
  onCreateCategory,
  displayCategories,
  dishesByCategory,
  getOrderedDishesForCategory,
  draggingDishId,
  dragOverCategoryId,
  draggingDishSourceCatId,
  dragOverDishId,
  dragAtEnd,
  pendingMoveDish,
  isSavingDish,
  sectionRefs,
  dishGridRefs,
  dishItemRefs,
  defaultCurrencyCode,
  onAddDish,
  onDishGripPointerDown,
  onEditDish,
  onArchiveDish,
}) {
  return (
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
              onClick={onCreateCategory}
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
            <Button variant="outline" onClick={onSearchClear}>
              Очистить поиск
            </Button>
          </CardContent>
        </Card>
      ) : (
        displayCategories.map((cat) => {
          const listBase = dishesByCategory.get(cat.id) || [];
          const listOrdered = getOrderedDishesForCategory(cat.id, listBase);
          const isDragTarget = draggingDishId && dragOverCategoryId === cat.id;

          return (
            <CategorySection
              key={cat.id}
              category={cat}
              dishes={listOrdered}
              isDragTarget={Boolean(isDragTarget)}
              isSectionDropActive={Boolean(isDragTarget && draggingDishSourceCatId !== cat.id)}
              draggingDishId={draggingDishId}
              dragOverDishId={dragOverDishId}
              dragAtEnd={dragAtEnd}
              pendingMoveDishId={pendingMoveDish?.dishId || ""}
              isSavingDish={isSavingDish}
              registerSectionRef={(el) => {
                if (el) sectionRefs.current[cat.id] = el;
                else delete sectionRefs.current[cat.id];
              }}
              registerDishGridRef={(el) => {
                if (el) dishGridRefs.current[cat.id] = el;
                else delete dishGridRefs.current[cat.id];
              }}
              registerDishRef={(dishId, el) => {
                const refKey = `${cat.id}-${dishId}`;
                if (el) dishItemRefs.current[refKey] = el;
                else delete dishItemRefs.current[refKey];
              }}
              formatDishPrice={(dish) =>
                formatPriceDisplay(dish.price, defaultCurrencyCode)
              }
              onAddDish={() => onAddDish(cat.id)}
              onDishGripPointerDown={(e, dishId) =>
                onDishGripPointerDown(e, cat.id, dishId)
              }
              onEditDish={onEditDish}
              onArchiveDish={onArchiveDish}
            />
          );
        })
      )}
    </div>
  );
}
