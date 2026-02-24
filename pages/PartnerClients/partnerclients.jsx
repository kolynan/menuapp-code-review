import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import PartnerShell, { usePartnerAccess } from "@/components/PartnerShell";
import { useI18n } from "@/components/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Loader2, Mail, Star, Search } from "lucide-react";
import { format } from "date-fns";

function getClientNumber(account, allAccounts) {
  const sorted = [...allAccounts].sort((a, b) => 
    new Date(a.created_at || 0) - new Date(b.created_at || 0)
  );
  const index = sorted.findIndex(a => a.id === account.id);
  return index >= 0 ? index + 1 : parseInt(String(account.id).slice(-4), 16) || 0;
}

// FIX BUG-PC-002: removed hardcoded Russian locale — use locale-neutral format
function formatDate(dateStr) {
  if (!dateStr) return "—";
  try {
    return format(new Date(dateStr), "dd.MM.yyyy");
  } catch {
    return "—";
  }
}

function PartnerClientsContent() {
  const { partnerId } = usePartnerAccess();
  const { t } = useI18n();
  const queryClient = useQueryClient();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAccount, setSelectedAccount] = useState(null);
  // FIX BUG-PC-001: separate message target from sheet's selectedAccount
  const [messageTarget, setMessageTarget] = useState(null);
  const [messageDialogOpen, setMessageDialogOpen] = useState(false);
  const [messageForm, setMessageForm] = useState({ title: "", body: "" });

  const { data: accounts, isLoading: loadingAccounts } = useQuery({
    queryKey: ["loyaltyAccounts", partnerId],
    queryFn: () => base44.entities.LoyaltyAccount.filter({ partner: partnerId }),
    enabled: !!partnerId,
  });

  const { data: transactions, isLoading: loadingTransactions } = useQuery({
    queryKey: ["loyaltyTransactions", selectedAccount?.id],
    // FIX BUG-PC-003: optional chaining prevents crash if selectedAccount becomes null mid-revalidation
    queryFn: () => base44.entities.LoyaltyTransaction.filter({ account: selectedAccount?.id }),
    enabled: !!selectedAccount?.id,
  });

  const { data: reviews, isLoading: loadingReviews } = useQuery({
    queryKey: ["dishFeedback", selectedAccount?.id],
    // FIX BUG-PC-003: optional chaining
    queryFn: () => base44.entities.DishFeedback.filter({ reviewed_by: selectedAccount?.id }),
    enabled: !!selectedAccount?.id,
  });

  const { data: dishes } = useQuery({
    queryKey: ["dishes", partnerId],
    queryFn: () => base44.entities.Dish.filter({ partner: partnerId }),
    enabled: !!partnerId && !!selectedAccount?.id,
  });

  const sendMessageMutation = useMutation({
    mutationFn: (data) => base44.entities.ClientMessage.create(data),
    onSuccess: () => {
      toast.success(t("clients.message.sent"), { id: "mm1" });
      setMessageDialogOpen(false);
      setMessageTarget(null);
      setMessageForm({ title: "", body: "" });
    },
    onError: () => {
      toast.error(t("toast.error"), { id: "mm1" });
    },
  });

  const filteredAccounts = useMemo(() => {
    if (!accounts) return [];
    if (!searchQuery) return accounts;
    
    return accounts.filter(account => {
      const clientNum = getClientNumber(account, accounts);
      return String(clientNum).includes(searchQuery);
    });
  }, [accounts, searchQuery]);

  // FIX BUG-PC-001: mail icon from card only opens dialog (not sheet)
  const handleOpenMessage = (account, e) => {
    e?.stopPropagation();
    setMessageTarget(account);
    setMessageDialogOpen(true);
  };

  // FIX BUG-PC-001: use messageTarget (not selectedAccount) for send
  const handleSendMessage = () => {
    if (!messageForm.title.trim() || !messageForm.body.trim()) return;
    if (!messageTarget?.id) return;

    sendMessageMutation.mutate({
      partner: partnerId,
      account: messageTarget.id,
      title: messageForm.title.trim(),
      body: messageForm.body.trim(),
      is_read: false,
    });
  };

  const sortedTransactions = useMemo(() => {
    if (!transactions) return [];
    return [...transactions].sort((a, b) => 
      new Date(b.created_at || 0) - new Date(a.created_at || 0)
    );
  }, [transactions]);

  const sortedReviews = useMemo(() => {
    if (!reviews) return [];
    return [...reviews].sort((a, b) => 
      new Date(b.created_at || 0) - new Date(a.created_at || 0)
    );
  }, [reviews]);

  const getDishName = (dishId) => {
    if (!dishes) return "—";
    const dish = dishes.find(d => d.id === dishId);
    return dish?.name || "—";
  };

  if (loadingAccounts) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2 mb-4">
          👥 {t("clients.title")}
        </h1>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder={t("clients.search")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {filteredAccounts.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-slate-500">
            {searchQuery ? t("clients.no_results") : t("clients.empty")}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAccounts.map((account) => {
            const clientNum = getClientNumber(account, accounts);
            return (
              <Card
                key={account.id}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => setSelectedAccount(account)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-semibold text-slate-900">
                      {t("clients.client_number", { number: clientNum })}
                    </h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={(e) => handleOpenMessage(account, e)}
                    >
                      <Mail className="h-4 w-4 text-indigo-600" />
                    </Button>
                  </div>
                  <div className="text-sm text-slate-600 space-y-1">
                    <div>
                      {t("clients.visits")}: {account.visit_count || 0} · {t("clients.last_visit")}: {formatDate(account.last_visit_at)}
                    </div>
                    <div>
                      {t("clients.balance")}: {account.balance || 0} · {t("clients.spent")}: {account.total_spent || 0}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Detail Sheet */}
      <Sheet open={!!selectedAccount} onOpenChange={() => setSelectedAccount(null)}>
        <SheetContent className="overflow-y-auto">
          {selectedAccount && (
            <>
              <SheetHeader>
                <SheetTitle>
                  {t("clients.client_number", { number: getClientNumber(selectedAccount, accounts || []) })}
                </SheetTitle>
              </SheetHeader>

              <div className="mt-6 space-y-6">
                {/* Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 p-3 rounded-lg">
                    <div className="text-xs text-slate-500">{t("clients.detail.balance")}</div>
                    <div className="text-xl font-bold text-indigo-600">
                      {selectedAccount.balance || 0} {t("clients.detail.points")}
                    </div>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-lg">
                    <div className="text-xs text-slate-500">{t("clients.detail.visits")}</div>
                    <div className="text-xl font-bold text-slate-900">{selectedAccount.visit_count || 0}</div>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-lg">
                    <div className="text-xs text-slate-500">{t("clients.detail.total_earned")}</div>
                    <div className="text-lg font-semibold text-green-600">{selectedAccount.total_earned || 0}</div>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-lg">
                    <div className="text-xs text-slate-500">{t("clients.detail.total_spent")}</div>
                    <div className="text-lg font-semibold text-indigo-600">{selectedAccount.total_spent || 0}</div>
                  </div>
                </div>

                <div className="text-sm text-slate-600 space-y-1">
                  <div>{t("clients.detail.first_visit")}: {formatDate(selectedAccount.created_at)}</div>
                  <div>{t("clients.detail.last_visit")}: {formatDate(selectedAccount.last_visit_at)}</div>
                </div>

                {/* Transaction History */}
                <div>
                  <h3 className="font-semibold text-slate-900 mb-3">{t("clients.detail.history")}</h3>
                  {loadingTransactions ? (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
                    </div>
                  ) : sortedTransactions.length === 0 ? (
                    <p className="text-sm text-slate-500 text-center py-4">{t("clients.detail.no_history")}</p>
                  ) : (
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {sortedTransactions.map((tx) => (
                        <div key={tx.id} className="flex items-start justify-between text-sm border-b pb-2">
                          <div className="flex-1">
                            <div className="text-slate-700">{tx.description}</div>
                            <div className="text-xs text-slate-400">{formatDate(tx.created_at)}</div>
                          </div>
                          <div className={`font-semibold ${tx.amount > 0 ? "text-green-600" : "text-red-600"}`}>
                            {tx.amount > 0 ? "+" : ""}{tx.amount}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Reviews */}
                <div>
                  <h3 className="font-semibold text-slate-900 mb-3">{t("clients.detail.reviews")}</h3>
                  {loadingReviews ? (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
                    </div>
                  ) : sortedReviews.length === 0 ? (
                    <p className="text-sm text-slate-500 text-center py-4">{t("clients.detail.no_reviews")}</p>
                  ) : (
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {sortedReviews.map((review) => (
                        <div key={review.id} className="border-b pb-3">
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-1 text-yellow-500">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-4 w-4 ${i < review.rating ? "fill-yellow-500" : "fill-slate-200"}`}
                                />
                              ))}
                            </div>
                            <span className="text-xs text-slate-400">{formatDate(review.created_at)}</span>
                          </div>
                          <div className="text-sm font-medium text-slate-700">{getDishName(review.dish)}</div>
                          {review.comment && (
                            <p className="text-sm text-slate-600 mt-1">{review.comment}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <Button
                  className="w-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    setMessageTarget(selectedAccount);
                    setMessageDialogOpen(true);
                  }}
                >
                  <Mail className="h-4 w-4 mr-2" />
                  {t("clients.send_message")}
                </Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Message Dialog */}
      {/* FIX BUG-PC-001: clear messageTarget + form when dialog closes */}
      <Dialog open={messageDialogOpen} onOpenChange={(open) => {
        setMessageDialogOpen(open);
        if (!open) {
          setMessageTarget(null);
          setMessageForm({ title: "", body: "" });
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("clients.message.title")}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="message-title">{t("clients.message.subject")}</Label>
              <Input
                id="message-title"
                value={messageForm.title}
                onChange={(e) => setMessageForm(prev => ({ ...prev, title: e.target.value }))}
                placeholder={t("clients.message.subject")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="message-body">{t("clients.message.body")}</Label>
              <Textarea
                id="message-body"
                value={messageForm.body}
                onChange={(e) => setMessageForm(prev => ({ ...prev, body: e.target.value }))}
                placeholder={t("clients.message.body")}
                rows={4}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setMessageDialogOpen(false)}>
              {t("common.cancel")}
            </Button>
            <Button
              onClick={handleSendMessage}
              disabled={!messageForm.title.trim() || !messageForm.body.trim() || !messageTarget?.id || sendMessageMutation.isPending}
            >
              {sendMessageMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {t("common.sending")}
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4 mr-2" />
                  {t("clients.message.send")}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function PartnerClients() {
  return (
    <PartnerShell activeTab="clients">
      <PartnerClientsContent />
    </PartnerShell>
  );
}