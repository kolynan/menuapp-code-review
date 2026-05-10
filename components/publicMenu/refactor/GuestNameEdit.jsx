import React from "react";

export default function GuestNameEdit({
  isEditingName,
  guestNameInput,
  setGuestNameInput,
  handleUpdateGuestName,
  setIsEditingName,
  currentGuest,
  guestDisplay,
  primaryColor,
  tr,
}) {
  if (isEditingName) {
    return (
      <span className="inline-flex items-center gap-1">
        <input
          type="text"
          value={guestNameInput}
          onChange={(e) => setGuestNameInput(e.target.value)}
          placeholder={tr("guest.name_placeholder", "Имя")}
          className="w-20 px-1 py-0.5 text-xs border rounded"
          autoFocus
          onKeyDown={(e) => {
            if (e.key === "Enter" && guestNameInput.trim())
              handleUpdateGuestName();
            if (e.key === "Escape") {
              setIsEditingName(false);
              setGuestNameInput("");
            }
          }}
        />
        <button
          onClick={handleUpdateGuestName}
          disabled={!guestNameInput.trim()}
          className="text-green-600 min-w-[44px] min-h-[44px] flex items-center justify-center"
          aria-label={tr("common.save", "Сохранить")}
        >
          ✓
        </button>
        <button
          onClick={() => {
            setIsEditingName(false);
            setGuestNameInput("");
          }}
          className="text-slate-400 min-w-[44px] min-h-[44px] flex items-center justify-center"
          aria-label={tr("common.cancel", "Отмена")}
        >
          ✕
        </button>
      </span>
    );
  }

  return (
    <button
      onClick={() => {
        setGuestNameInput(currentGuest?.name || "");
        setIsEditingName(true);
      }}
      className="min-h-[32px] flex items-center hover:underline"
      style={{ color: primaryColor }}
    >
      {guestDisplay} <span className="text-xs ml-0.5">›</span>
    </button>
  );
}
