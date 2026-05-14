import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export function ConfirmDialog({
  open,
  title,
  description,
  actionText,
  variant = "danger",
  showCancel = true,
  onOpenChange,
  onCancel,
  onConfirm,
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {variant === "warning" && (
              <AlertTriangle className="w-5 h-5 text-amber-500" />
            )}
            {title}
          </DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <DialogFooter>
          {showCancel && (
            <Button variant="outline" onClick={onCancel}>
              Отмена
            </Button>
          )}
          <Button
            className={
              variant === "warning"
                ? "bg-amber-500 hover:bg-amber-600"
                : "bg-red-600 hover:bg-red-700"
            }
            onClick={onConfirm}
          >
            {actionText || "Подтвердить"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
