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
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Link as LinkIcon, Loader2, Plus, Save, X } from "lucide-react";

function getContactDisplay(contactTypes, type) {
  const contactType = contactTypes.find((item) => item.value === type);
  return {
    Icon: contactType?.icon || LinkIcon,
    label: contactType?.label || "Ссылка",
  };
}

export function SettingsDialog({
  open,
  settingsForm,
  editingContactLinks,
  newContactForm,
  contactTypes,
  isSaving,
  isCreatingContact,
  isDeletingContact,
  onOpenChange,
  onNameChange,
  onAddressChange,
  onContactTypeChange,
  onContactUrlChange,
  onAddContact,
  onRemoveContact,
  onSave,
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Настройки ресторана</DialogTitle>
          <DialogDescription>
            Название, адрес и контактная информация
          </DialogDescription>
        </DialogHeader>

        {/* P1.2: Scrollable content area */}
        <div className="flex-1 overflow-y-auto space-y-6 py-4">
          <div className="space-y-2">
            <Label>Название ресторана *</Label>
            <Input
              value={settingsForm.name}
              onChange={(e) => onNameChange(e.target.value)}
              placeholder="Название"
            />
          </div>

          <div className="space-y-2">
            <Label>Адрес</Label>
            <Input
              value={settingsForm.address}
              onChange={(e) => onAddressChange(e.target.value)}
              placeholder="ул. Абая 10, Алматы"
            />
          </div>

          <div className="space-y-3">
            <Label>Контакты</Label>

            {editingContactLinks.length > 0 && (
              <div className="space-y-2">
                {editingContactLinks.map((link) => {
                  const { Icon, label } = getContactDisplay(
                    contactTypes,
                    link.type,
                  );
                  return (
                    <div
                      key={link.id}
                      className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg"
                    >
                      <Icon className="w-4 h-4 text-slate-500 shrink-0" />
                      <span className="text-sm font-medium text-slate-700 min-w-[80px]">
                        {link.label || label}
                      </span>
                      <span className="text-sm text-slate-500 truncate flex-1">
                        {link.url}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                        onClick={() => onRemoveContact(link.id)}
                        disabled={isDeletingContact}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="border-2 border-dashed border-slate-200 rounded-lg p-3 space-y-3">
              <div className="text-sm font-medium text-slate-600">
                Добавить контакт
              </div>
              <div className="flex gap-2">
                <Select
                  value={newContactForm.type}
                  onValueChange={onContactTypeChange}
                >
                  <SelectTrigger className="w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {contactTypes.map((contactType) => (
                      <SelectItem
                        key={contactType.value}
                        value={contactType.value}
                      >
                        {contactType.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  value={newContactForm.url}
                  onChange={(e) => onContactUrlChange(e.target.value)}
                  placeholder={
                    newContactForm.type === "phone"
                      ? "+7 777 123 4567"
                      : newContactForm.type === "email"
                        ? "info@restaurant.kz"
                        : "https://..."
                  }
                  className="flex-1"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onAddContact}
                  disabled={isCreatingContact}
                  className="shrink-0"
                >
                  {isCreatingContact ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Plus className="w-4 h-4" />
                  )}
                </Button>
              </div>
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
