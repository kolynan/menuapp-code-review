import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Save } from "lucide-react";

export function DishEditModal({
  open,
  editingDish,
  dishForm,
  dishLangTab,
  categories,
  enabledLanguages,
  defaultLanguage,
  showLangTabs,
  isDefaultLang,
  currencySymbol,
  isSaving,
  onOpenChange,
  onLangTabChange,
  onDishFormChange,
  onDishFieldChange,
  onToggleCategory,
  onSave,
  getDishFieldValue,
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>
            {editingDish ? "Изменить блюдо" : "Новое блюдо"}
          </DialogTitle>
          <DialogDescription>Заполните информацию о блюде</DialogDescription>
        </DialogHeader>

        {/* P1.2: Scrollable content area */}
        <div className="flex-1 overflow-y-auto space-y-4 py-4">
          {showLangTabs && (
            <div className="flex gap-2 border-b pb-3">
              {enabledLanguages.map((langCode) => {
                const isDefault = langCode === defaultLanguage;
                const isActive = dishLangTab === langCode;
                return (
                  <button
                    key={langCode}
                    type="button"
                    onClick={() => onLangTabChange(langCode)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                      isActive
                        ? "bg-indigo-600 text-white"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    {langCode}
                    {isDefault && (
                      <span className="ml-1 text-xs opacity-70">(осн.)</span>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          <div className="grid grid-cols-[1fr,auto] gap-3">
            <div className="space-y-2">
              <Label>
                Название *
                {showLangTabs && !isDefaultLang && (
                  <span className="ml-2 text-xs text-slate-500">
                    ({dishLangTab})
                  </span>
                )}
              </Label>
              {isDefaultLang ? (
                <Input
                  value={dishForm.name}
                  onChange={(e) => onDishFormChange("name", e.target.value)}
                  placeholder="Борщ"
                />
              ) : (
                <Input
                  value={getDishFieldValue("name")}
                  onChange={(e) => onDishFieldChange("name", e.target.value)}
                  placeholder={dishForm.name || "Перевод названия"}
                />
              )}
            </div>
            <div className="space-y-2">
              <Label>Цена ({currencySymbol}) *</Label>
              <Input
                value={dishForm.price}
                onChange={(e) => onDishFormChange("price", e.target.value)}
                placeholder="0"
                inputMode="decimal"
                className="w-24"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>
              Описание
              {showLangTabs && !isDefaultLang && (
                <span className="ml-2 text-xs text-slate-500">
                  ({dishLangTab})
                </span>
              )}
            </Label>
            {isDefaultLang ? (
              <Textarea
                value={dishForm.description}
                onChange={(e) =>
                  onDishFormChange("description", e.target.value)
                }
                placeholder="Краткое описание"
                rows={2}
              />
            ) : (
              <Textarea
                value={getDishFieldValue("description")}
                onChange={(e) =>
                  onDishFieldChange("description", e.target.value)
                }
                placeholder={dishForm.description || "Перевод описания"}
                rows={2}
              />
            )}
          </div>

          <div className="space-y-2">
            <Label>Категории</Label>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => {
                const checked =
                  Array.isArray(dishForm.categories) &&
                  dishForm.categories.includes(category.id);
                const isPrimary = dishForm.category === category.id;
                return (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => onToggleCategory(category.id)}
                    className={`px-3 py-1.5 rounded-lg text-sm border transition ${
                      checked
                        ? "bg-indigo-50 border-indigo-300 text-indigo-700"
                        : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                    }`}
                  >
                    {checked && <span className="mr-1">✓</span>}
                    {category.name}
                    {isPrimary && (
                      <span className="ml-1 text-xs opacity-70">(осн.)</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Изображение (URL)</Label>
            <Input
              value={dishForm.image}
              onChange={(e) => onDishFormChange("image", e.target.value)}
              placeholder="https://..."
            />
            {dishForm.image && (
              <img
                src={dishForm.image}
                alt="Preview"
                className="w-full h-32 object-cover rounded-lg border"
                onError={(e) => {
                  e.target.style.display = "none";
                }}
              />
            )}
          </div>

          <div className="border rounded-lg p-3 bg-slate-50 space-y-2">
            <Label>Доступность по каналам</Label>
            <div className="flex items-center gap-4 flex-wrap">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={dishForm.enabled_hall !== false}
                  onChange={(e) =>
                    onDishFormChange("enabled_hall", e.target.checked)
                  }
                  className="w-4 h-4"
                />
                Зал
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={dishForm.enabled_pickup !== false}
                  onChange={(e) =>
                    onDishFormChange("enabled_pickup", e.target.checked)
                  }
                  className="w-4 h-4"
                />
                Самовывоз
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={dishForm.enabled_delivery !== false}
                  onChange={(e) =>
                    onDishFormChange("enabled_delivery", e.target.checked)
                  }
                  className="w-4 h-4"
                />
                Доставка
              </label>
            </div>
          </div>
        </div>

        {/* P1.2: Sticky footer */}
        <div className="flex gap-2 pt-4 border-t mt-auto shrink-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Отмена
          </Button>
          <Button
            className="bg-indigo-600 hover:bg-indigo-700 gap-2 ml-auto"
            onClick={onSave}
            disabled={isSaving}
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Сохранить
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
