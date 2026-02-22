import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, X as XIcon, MapPin } from "lucide-react";

const getHelpTypes = (t) => [
  { id: "call_waiter", label: t('help.call_waiter') },
  { id: "bill", label: t('help.bill') },
  { id: "napkins", label: t('help.napkins') },
  { id: "menu", label: t('help.menu') },
  { id: "other", label: t('help.other') },
];

export default function HelpModal({
  onClose,
  t,
  currentTableLabel,
  hasActiveRequest,
  selectedHelpType,
  onSelectHelpType,
  helpComment,
  onChangeHelpComment,
  helpSubmitError,
  isSendingHelp,
  onSubmit,
  disabled
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <Card className="w-full max-w-md bg-white shadow-xl relative animate-in slide-in-from-bottom-4 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-300">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-slate-400 hover:text-slate-600"
        >
          <XIcon className="w-5 h-5" />
        </button>

        <CardContent className="p-6 space-y-5">
          <div>
            <h3 className="text-xl font-bold text-slate-900">{t('help.modal_title')}</h3>
            <p className="text-sm text-slate-500 mt-1">{t('help.modal_desc')}</p>
          </div>

          <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
            <div className="flex items-center gap-2 text-slate-700 font-medium">
              <MapPin className="w-4 h-4 text-indigo-500" />
              {t('form.table')} {currentTableLabel}
            </div>
          </div>

          {hasActiveRequest && (
            <div className="flex items-start gap-3 p-3 bg-blue-50 text-blue-700 rounded-lg text-sm">
              <div className="mt-0.5 shrink-0 w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              <p>{t('help.active_request')}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2">
            {getHelpTypes(t).map((type) => {
              const isSelected = selectedHelpType === type.id;
              return (
                <button
                  key={type.id}
                  onClick={() => onSelectHelpType(type.id)}
                  className={`px-3 py-2 text-sm font-medium rounded-lg border transition-all ${
                    isSelected
                      ? "bg-indigo-50 border-indigo-500 text-indigo-700 shadow-sm"
                      : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                  } ${type.id === "other" ? "col-span-2 sm:col-span-1" : ""}`}
                >
                  {type.label}
                </button>
              );
            })}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">
              {selectedHelpType === "other" ? t('help.comment_required') : t('help.comment_label')}
            </label>
            <Input
              value={helpComment}
              onChange={(e) => onChangeHelpComment(e.target.value)}
              placeholder={selectedHelpType === "other" ? t('help.comment_placeholder_other') : t('help.comment_placeholder')}
              className="h-12"
              autoFocus={selectedHelpType === "other"}
            />
          </div>

          {helpSubmitError && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg">{helpSubmitError}</div>}

          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              className="flex-1 h-12 text-base"
              onClick={onClose}
              disabled={isSendingHelp}
            >
              {t('help.cancel')}
            </Button>
            <Button
              className="flex-1 h-12 text-base bg-indigo-600 hover:bg-indigo-700"
              disabled={isSendingHelp || disabled}
              onClick={onSubmit}
            >
              {isSendingHelp ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> {t('cart.submitting')}
                </>
              ) : (
                t('help.submit')
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}