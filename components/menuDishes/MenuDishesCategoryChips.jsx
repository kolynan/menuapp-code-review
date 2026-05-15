import { GripVertical, Pencil, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function MenuDishesCategoryChips({
  displayCategories,
  activeCategoryId,
  draggingCatId,
  dragOverCatId,
  catChipsScrollRef,
  catChipRefs,
  search,
  onSearchChange,
  onCategoryGripPointerDown,
  onScrollToCategory,
  onEditCategory,
  onCreateCategory,
}) {
  return (
    <div className="sticky top-[57px] z-30 bg-white/95 backdrop-blur border-b border-slate-200 py-3 shadow-sm">
      <style>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

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
                      onClick={() => onScrollToCategory(c.id)}
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
                      onClick={() => onEditCategory(c)}
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
            onClick={onCreateCategory}
            className="shrink-0 h-9 px-3 border-2 border-dashed border-slate-300 hover:border-indigo-400 hover:text-indigo-600"
            title="Добавить раздел"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        <Input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Поиск блюд..."
          className="h-10 border-slate-300"
        />
      </div>
    </div>
  );
}
