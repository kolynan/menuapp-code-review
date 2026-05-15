import { MapPin, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { normStr } from "@/components/_shared/utils/normStr";

export function MenuDishesHeader({
  loadingPartner,
  partner,
  activeContactLinks,
  viewMode,
  getContactIcon,
  getDefaultContactLabel,
  onEditSettings,
  onContactClick,
}) {
  const visibleContactLinks = activeContactLinks.filter((c) => c.type !== "map");

  return (
    <div className="bg-white border-b px-4 py-6">
      <div className="max-w-4xl mx-auto">
        <div className="relative">
          <Button
            variant="outline"
            size="sm"
            onClick={onEditSettings}
            className="absolute top-0 right-0 h-9 w-9 p-0 text-slate-500 hover:text-indigo-600"
            title="Редактировать"
          >
            <Pencil className="w-4 h-4" />
          </Button>

          <div className="text-center space-y-3 pt-1">
            <h1 className="text-2xl font-bold text-slate-900 pr-12 sm:pr-0">
              {loadingPartner ? "Загрузка..." : partner?.name || "Ресторан"}
            </h1>

            {partner?.address && (
              <p className="flex items-center justify-center gap-1 text-slate-500 text-sm">
                <MapPin className="w-3.5 h-3.5" />
                {partner.address}
              </p>
            )}

            {visibleContactLinks.length > 0 && (
              <div className="flex items-center justify-center gap-2 flex-wrap">
                {visibleContactLinks.map((link) => {
                  const Icon = getContactIcon(link.type);
                  const displayLabel =
                    normStr(link.label).trim() || getDefaultContactLabel(link.type);
                  const url = normStr(link.url);
                  const handleClick = () => onContactClick(url);

                  if (viewMode === "full") {
                    return (
                      <button
                        key={link.id}
                        onClick={handleClick}
                        className="h-8 inline-flex items-center gap-1.5 px-2.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 active:bg-slate-100 transition text-sm"
                        title={displayLabel}
                      >
                        <Icon className="w-4 h-4 text-slate-600" />
                        <span className="hidden sm:inline text-slate-700">
                          {displayLabel}
                        </span>
                      </button>
                    );
                  }

                  return (
                    <button
                      key={link.id}
                      onClick={handleClick}
                      className="h-8 w-8 inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white hover:bg-slate-50 active:bg-slate-100 transition"
                      title={displayLabel}
                    >
                      <Icon className="w-4 h-4 text-slate-600" />
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
