import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2, Loader2, Save } from "lucide-react";

export function CategoryDialog({
  open,
  editingCategory,
  categoryForm,
  categoryLangTab,
  categoryTranslations,
  enabledLanguages,
  defaultLanguage,
  isDeleting,
  isSaving,
  onOpenChange,
  onLangTabChange,
  onNameChange,
  onTranslationNameChange,
  onActiveChange,
  onDelete,
  onSave,
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {editingCategory ? "Редактировать раздел" : "Новый раздел"}
          </DialogTitle>
          <DialogDescription>
            {editingCategory
              ? "Измените название и настройки раздела"
              : "Создайте новый раздел меню"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {enabledLanguages.length > 1 && (
            <div className="flex gap-1 border-b pb-2">
              {enabledLanguages.map((langCode) => {
                const isDefault = langCode === defaultLanguage;
                const isActive = categoryLangTab === langCode;

                return (
                  <button
                    key={langCode}
                    type="button"
                    onClick={() => onLangTabChange(langCode)}
                    className={`px-3 py-1.5 text-sm rounded-md transition ${
                      isActive
                        ? "bg-indigo-600 text-white"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    {langCode}
                    {isDefault && " (осн.)"}
                  </button>
                );
              })}
            </div>
          )}

          <div className="space-y-2">
            <Label>Название *</Label>
            {categoryLangTab === defaultLanguage ? (
              <Input
                value={categoryForm.name}
                onChange={(e) => onNameChange(e.target.value)}
                placeholder="Например: Завтраки"
              />
            ) : (
              <Input
                value={categoryTranslations[categoryLangTab]?.name || ""}
                onChange={(e) =>
                  onTranslationNameChange(categoryLangTab, e.target.value)
                }
                placeholder={categoryForm.name || "Перевод названия"}
              />
            )}
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={categoryForm.is_active !== false}
              onChange={(e) => onActiveChange(e.target.checked)}
              className="w-4 h-4"
            />
            Виден гостям
          </label>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          {editingCategory && (
            <Button
              variant="outline"
              className="sm:mr-auto border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 gap-1.5"
              onClick={onDelete}
              disabled={isDeleting}
            >
              <Trash2 className="w-4 h-4" />
              Удалить
            </Button>
          )}

          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Отмена
          </Button>
          <Button
            className="bg-indigo-600 hover:bg-indigo-700 gap-2"
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
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
