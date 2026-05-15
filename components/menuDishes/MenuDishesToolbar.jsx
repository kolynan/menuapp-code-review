import { ArrowLeft, Eye, Package, Store, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";

export function MenuDishesToolbar({
  orderMode,
  onBack,
  onModeChange,
  onPreview,
}) {
  return (
    <div className="sticky top-0 z-40 bg-white border-b shadow-sm">
      <div className="max-w-4xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="gap-1 text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Назад</span>
          </Button>

          <div className="flex bg-slate-100 rounded-lg p-0.5">
            <button
              onClick={() => onModeChange("hall")}
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
              onClick={() => onModeChange("pickup")}
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
              onClick={() => onModeChange("delivery")}
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
            onClick={onPreview}
            className="gap-1.5"
          >
            <Eye className="w-4 h-4" />
            <span className="hidden sm:inline">Preview</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
