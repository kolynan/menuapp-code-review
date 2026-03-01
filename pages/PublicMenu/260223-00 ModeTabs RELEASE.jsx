import React from "react";
import { AlertCircle } from "lucide-react";

export default function ModeTabs({
  visibleModeTabs,
  orderMode,
  onModeChange,
  isHallMode,
  tableCodeParam,
  resolvedTable,
  verifiedByCode,
  t,
}) {
  return (
    <div className="max-w-2xl mx-auto px-4 mt-4">
      {visibleModeTabs.length > 1 ? (
        <div className="flex bg-slate-50 border border-slate-200 rounded-lg p-0.5 max-w-md mx-auto mb-3">
          {visibleModeTabs.map((m) => {
            const isActive = orderMode === m.id;
            const isDisabled = m.disabled;
            
            return (
              <button
                key={m.id}
                onClick={() => onModeChange(m.id)}
                disabled={isDisabled}
                className={`flex-1 py-1 text-xs font-medium rounded-md transition-all relative ${
                  isActive
                    ? "bg-indigo-600 text-white shadow-sm"
                    : isDisabled
                    ? "text-slate-300 cursor-not-allowed"
                    : "text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                }`}
              >
                {m.label}
                {isDisabled && (
                  <span className="ml-1 text-[10px] opacity-70">
                    ({t('mode.coming_soon')})
                  </span>
                )}
              </button>
            );
          })}
        </div>
      ) : null}

      {/* Mode description removed — redundant with tab selection */}
      
      {/* Verified badge removed — shown inside CartView online-order block */}

      {/* Hall: Invalid table code in URL */}
      {isHallMode && tableCodeParam && !resolvedTable && !verifiedByCode && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="font-medium text-amber-900">
                {t('hall.invalid_code')}
              </div>
              <div className="text-sm text-amber-700 mt-1">
                {t('hall.invalid_code_desc')}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}