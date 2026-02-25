import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { useI18n } from "@/components/i18n";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, ArrowLeft, Mail, Circle } from "lucide-react";

export default function ClientMessagesPage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [customerEmail, setCustomerEmail] = useState("");
  const [expandedMessageId, setExpandedMessageId] = useState(null);

  // Check for saved email and redirect if missing
  useEffect(() => {
    const savedEmail = localStorage.getItem("loyalty_client_email");
    if (!savedEmail || !savedEmail.trim()) {
      navigate("/client");
      return;
    }
    setCustomerEmail(savedEmail.toLowerCase());
  }, [navigate]);

  // Load loyalty accounts for this customer
  const { data: accounts, isLoading: loadingAccounts, error: accountsError, refetch: refetchAccounts } = useQuery({
    queryKey: ["customerAccounts", customerEmail],
    queryFn: () => base44.entities.LoyaltyAccount.filter({ email: customerEmail }),
    enabled: !!customerEmail,
    onError: () => {
      toast.error(t('clientmessages.error_accounts', 'Ошибка загрузки аккаунтов'));
    },
  });

  // Load messages for all accounts
  const { data: messages, isLoading: loadingMessages, error: messagesError, refetch: refetchMessages } = useQuery({
    queryKey: ["customerMessages", customerEmail],
    queryFn: async () => {
      if (!accounts || accounts.length === 0) return [];
      
      const accountIds = accounts.map(a => a.id);
      const allMessages = await Promise.all(
        accountIds.map(id => base44.entities.ClientMessage.filter({ account: id }))
      );
      
      return allMessages.flat();
    },
    enabled: !!customerEmail && !!accounts && accounts.length > 0,
    onError: () => {
      toast.error(t('clientmessages.error_loading', 'Ошибка загрузки сообщений'));
    },
  });

  // Load partners for messages
  const { data: partners, error: partnersError, refetch: refetchPartners } = useQuery({
    queryKey: ["messagePartners", messages?.map(m => m.partner)],
    queryFn: async () => {
      if (!messages || messages.length === 0) return [];
      const partnerIds = [...new Set(messages.map(m => m.partner))];
      const results = await Promise.all(
        partnerIds.map(id => base44.entities.Partner.get(id).catch(() => null))
      );
      return results.filter(Boolean);
    },
    enabled: !!messages && messages.length > 0,
    onError: () => {
      toast.error(t('clientmessages.error_partners', 'Ошибка загрузки партнеров'));
    },
  });

  // Mark message as read mutation
  const markReadMutation = useMutation({
    mutationFn: (messageId) => base44.entities.ClientMessage.update(messageId, { is_read: true }),
    onMutate: async (messageId) => {
      await queryClient.cancelQueries(["customerMessages", customerEmail]);
      const previous = queryClient.getQueryData(["customerMessages", customerEmail]);
      queryClient.setQueryData(["customerMessages", customerEmail], (oldMessages) => {
        if (!oldMessages) return oldMessages;
        return oldMessages.map(m => m.id === messageId ? { ...m, is_read: true } : m);
      });
      return { previous };
    },
    onError: (err, messageId, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["customerMessages", customerEmail], context.previous);
      }
      toast.error(t("toast.error"), { id: "mm1" });
    },
    onSettled: () => {
      queryClient.invalidateQueries(["customerMessages", customerEmail]);
    },
  });

  const handleMessageClick = (message) => {
    const wasExpanded = expandedMessageId === message.id;
    
    setExpandedMessageId(wasExpanded ? null : message.id);

    // Mark as read if expanding and not already read
    if (!wasExpanded && !message.is_read) {
      // Use mutation which handles optimistic update + rollback
      markReadMutation.mutate(message.id);
    }
  };

  const getPartner = (partnerId) => {
    if (!partners) return null;
    return partners.find(p => p.id === partnerId);
  };

  const formatMessageDate = (dateStr) => {
    if (!dateStr) return "";

    try {
      const date = new Date(dateStr);
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const messageDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

      const time = date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });

      if (messageDate.getTime() === today.getTime()) {
        return `${t('clientmessages.date_today', 'Сегодня')} ${time}`;
      } else if (messageDate.getTime() === yesterday.getTime()) {
        return `${t('clientmessages.date_yesterday', 'Вчера')} ${time}`;
      } else {
        return date.toLocaleDateString(undefined);
      }
    } catch {
      return "";
    }
  };

  const sortedMessages = useMemo(() => {
    if (!messages) return [];
    return [...messages].sort((a, b) => 
      new Date(b.created_at || 0) - new Date(a.created_at || 0)
    );
  }, [messages]);

  if (!customerEmail) {
    return null;
  }

  if (loadingAccounts || loadingMessages) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
        <div className="h-14 max-w-2xl mx-auto px-4 flex items-center gap-3">
          <button
            onClick={() => navigate("/clientaccount")}
            className="p-2 hover:bg-slate-100 rounded transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-slate-600" />
          </button>
          <h1 className="text-lg font-semibold text-slate-900">
            {t("clientmessages.title")}
          </h1>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-2xl mx-auto px-4 py-6">
        {!sortedMessages || sortedMessages.length === 0 ? (
          <Card className="mt-12">
            <CardContent className="py-12 text-center">
              <Mail className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">{t("clientmessages.empty")}</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {sortedMessages.map((message) => {
              const partner = getPartner(message.partner);
              const isExpanded = expandedMessageId === message.id;
              const isUnread = !message.is_read;

              return (
                <Card
                  key={message.id}
                  className={`cursor-pointer transition-all ${
                    isUnread 
                      ? "shadow-sm hover:shadow-md" 
                      : "shadow-sm hover:shadow-md opacity-75"
                  }`}
                  onClick={() => handleMessageClick(message)}
                >
                  <CardContent className="p-4">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2 flex-1">
                        {isUnread && (
                          <Circle className="w-2 h-2 fill-blue-500 text-blue-500 flex-shrink-0" />
                        )}
                        <span className={`text-sm font-medium ${isUnread ? "text-slate-900" : "text-slate-500"}`}>
                          {partner?.name || t('clientmessages.unknown_partner', '...')}
                        </span>
                      </div>
                      <span className="text-xs text-slate-400 flex-shrink-0 ml-2">
                        {formatMessageDate(message.created_at)}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className={`font-semibold mb-1 ${isUnread ? "text-slate-900" : "text-slate-600"}`}>
                      {message.title}
                    </h3>

                    {/* Body */}
                    {isExpanded ? (
                      <div className="text-slate-700 text-sm whitespace-pre-wrap mt-3">
                        {message.body}
                      </div>
                    ) : (
                      <p className="text-slate-500 text-sm line-clamp-2">
                        {message.body}
                      </p>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}