import React from "react";

export default function CategoryChips({
  sortedCategories,
  activeCategoryKey,
  onCategoryClick,
  getCategoryName,
  chipRefs,
  t,
  activeColor = '#1A1A1A',
}) {
  return (
    <div className="sticky top-0 z-30 bg-slate-50/95 backdrop-blur supports-[backdrop-filter]:bg-slate-50/80 border-b border-slate-200 py-2 shadow-sm">
      <div className="max-w-2xl mx-auto px-4">
        <div className="flex gap-2 overflow-x-auto snap-x pb-1">
          <button
            ref={(el) => (chipRefs.current.all = el)}
            onClick={() => onCategoryClick("all")}
            className={`snap-start flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
              activeCategoryKey === "all"
                ? "text-white border-transparent shadow-sm"
                : "bg-white text-slate-700 border-slate-200 hover:border-slate-300 shadow-sm"
            }`}
            style={activeCategoryKey === "all" ? { backgroundColor: activeColor } : undefined}
          >
            {t('menu.all')}
          </button>

          {sortedCategories.map((cat) => (
            <button
              key={cat.id}
              ref={(el) => (chipRefs.current[cat.id] = el)}
              onClick={() => onCategoryClick(cat.id)}
              className={`snap-start flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                activeCategoryKey === cat.id
                  ? "text-white border-transparent shadow-sm"
                  : "bg-white text-slate-700 border-slate-200 hover:border-slate-300 shadow-sm"
              }`}
              style={activeCategoryKey === cat.id ? { backgroundColor: activeColor } : undefined}
            >
              {getCategoryName(cat)}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}