import React from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Bell } from "lucide-react";

export default function HelpFab({ fabSuccess, isSendingHelp, isHelpModalOpen, onOpen, t }) {
  return (
    <div className="fixed bottom-24 right-4 z-40 md:bottom-8 md:right-8">
      <Button
        variant={fabSuccess ? "default" : "secondary"}
        onClick={onOpen}
        disabled={isSendingHelp && isHelpModalOpen}
        className={`shadow-lg rounded-full transition-all duration-300 flex items-center justify-center
          w-12 h-12 p-0
          md:w-auto md:h-14 md:px-6 md:gap-2
          ${fabSuccess ? "bg-green-600 hover:bg-green-700 text-white" : "bg-white hover:bg-slate-50 border border-slate-200 text-slate-700"}`}
      >
        {fabSuccess ? (
          <>
            <CheckCircle2 className="w-5 h-5" />
            <span className="hidden md:inline font-medium">{t('help.sent')}</span>
          </>
        ) : (
          <>
            <Bell className="w-5 h-5 text-indigo-600" />
            <span className="hidden md:inline font-medium">{t('help.call_waiter')}</span>
          </>
        )}
      </Button>
    </div>
  );
}