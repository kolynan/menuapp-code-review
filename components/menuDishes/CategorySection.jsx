import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";
import { DishCard } from "@/components/menuDishes/DishCard";

export function CategorySection({
  category,
  dishes,
  isDragTarget,
  isSectionDropActive,
  draggingDishId,
  dragOverDishId,
  dragAtEnd,
  pendingMoveDishId,
  isSavingDish,
  registerSectionRef,
  registerDishGridRef,
  registerDishRef,
  formatDishPrice,
  onAddDish,
  onDishGripPointerDown,
  onEditDish,
  onArchiveDish,
}) {
  const emptyCategory = dishes.length === 0;

  return (
    <div
      id={`section-${category.id}`}
      ref={registerSectionRef}
      className={`scroll-mt-[180px] p-4 -mx-4 rounded-xl transition-colors ${
        isSectionDropActive ? "bg-indigo-50 ring-2 ring-indigo-300" : ""
      }`}
    >
      <div className="flex items-center justify-between gap-4 mb-4">
        <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          {category.name}
          {category.is_active === false && (
            <Badge variant="outline" className="text-xs">
              Скрыт
            </Badge>
          )}
        </h3>
        <Button
          size="sm"
          className="bg-indigo-600 hover:bg-indigo-700 gap-1.5"
          onClick={onAddDish}
        >
          <Plus className="w-4 h-4" />
          Блюдо
        </Button>
      </div>

      {emptyCategory ? (
        <Card
          className={`border-dashed ${
            isDragTarget ? "border-indigo-400 bg-indigo-50" : ""
          }`}
        >
          <CardContent className="p-6 text-center space-y-3">
            <p className="text-slate-600">
              {isDragTarget
                ? "Отпустите здесь"
                : "Раздел пока пустой"}
            </p>
            {!isDragTarget && (
              <Button
                variant="outline"
                className="gap-2"
                onClick={onAddDish}
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
          ref={registerDishGridRef}
        >
          {dishes.map((dish, dishIndex) => {
            const isDragging = draggingDishId === dish.id;
            const isHoverTarget =
              draggingDishId &&
              isDragTarget &&
              dragOverDishId === dish.id &&
              draggingDishId !== dish.id;

            const isLastCard = dishIndex === dishes.length - 1;
            const showAfterIndicator =
              draggingDishId &&
              isDragTarget &&
              dragAtEnd &&
              isLastCard &&
              draggingDishId !== dish.id;

            const isBeingSaved = isSavingDish && pendingMoveDishId === dish.id;
            const formattedPrice = formatDishPrice(dish);

            return (
              <DishCard
                key={`${category.id}-${dish.id}`}
                dish={dish}
                catId={category.id}
                formattedPrice={formattedPrice}
                isDragging={isDragging}
                isHoverTarget={isHoverTarget}
                showAfterIndicator={showAfterIndicator}
                isBeingSaved={isBeingSaved}
                isSavingDish={isSavingDish}
                registerRef={(el) =>
                  registerDishRef(dish.id, el)
                }
                onGripPointerDown={(e) =>
                  onDishGripPointerDown(e, dish.id)
                }
                onEdit={() => onEditDish(dish)}
                onArchive={() => onArchiveDish(dish)}
              />
            );
          })}

          <Card
            className="border-2 border-dashed cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/50 transition h-full"
            onClick={onAddDish}
          >
            <CardContent className="p-6 flex flex-col items-center justify-center h-full min-h-[312px] text-slate-400 hover:text-indigo-600 transition">
              <Plus className="w-8 h-8 mb-2" />
              <span className="font-medium">
                Добавить блюдо
              </span>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
