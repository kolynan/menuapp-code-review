import { GripVertical } from "lucide-react";

export function MenuDishesDragPreview({ dragPreview, dragPreviewPos }) {
  if (!dragPreview) return null;

  return (
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
  );
}
