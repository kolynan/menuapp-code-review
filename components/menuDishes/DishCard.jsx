import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Image as ImageIcon,
  Loader2,
  GripVertical,
  Pencil,
  Trash2,
} from "lucide-react";

export function DishCard({
  dish,
  catId,
  formattedPrice,
  isDragging,
  isHoverTarget,
  showAfterIndicator,
  isBeingSaved,
  isSavingDish,
  registerRef,
  onGripPointerDown,
  onEdit,
  onArchive,
}) {
  return (
    <div
      data-dish-card="1"
      data-dish-id={dish.id}
      data-cat-id={catId}
      ref={registerRef}
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
              {formattedPrice}
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
            <span className="text-sm font-medium text-indigo-600">
              Сохранение...
            </span>
          </div>
        </div>
      )}

      <div className="absolute top-2 left-2">
        <button
          type="button"
          disabled={isSavingDish}
          onPointerDown={onGripPointerDown}
          className={`h-9 w-9 inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white/95 hover:bg-white shadow-sm transition text-slate-500 hover:text-indigo-600 touch-none ${
            isSavingDish
              ? "opacity-50 cursor-not-allowed"
              : "cursor-grab active:cursor-grabbing"
          }`}
          title={
            isSavingDish
              ? "Сохранение..."
              : "Перетащите для изменения порядка или в другую категорию"
          }
        >
          <GripVertical className="w-5 h-5" />
        </button>
      </div>

      <div className="absolute top-2 right-2 flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          className="h-9 px-3 bg-white/95 hover:bg-white shadow-sm"
          onClick={onEdit}
        >
          <Pencil className="w-3.5 h-3.5 mr-1.5" />
          Изменить
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="h-9 w-9 p-0 bg-white/95 hover:bg-red-50 shadow-sm border-red-200 text-red-600 hover:text-red-700"
          onClick={onArchive}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
