import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useI18n } from '@/components/i18n';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

import { useClientAccounts } from '@/components/clientAccount/hooks/useClientAccounts';
import { useTransactions } from '@/components/clientAccount/hooks/useTransactions';
import { useExpiration } from '@/components/clientAccount/hooks/useExpiration';
import BalanceCard from '@/components/clientAccount/BalanceCard';
import RestaurantList from '@/components/clientAccount/RestaurantList';
import TransactionList from '@/components/clientAccount/TransactionList';

export default function ClientAccount() {
  // 1. useI18n, useNavigate
  const { t } = useI18n();
  const navigate = useNavigate();

  // 2. URL params
  const email = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('email');
  }, []);

  // Redirect if no email
  useEffect(() => {
    if (!email || !email.trim()) {
      navigate('/client');
    }
  }, [email, navigate]);

  // 3. useClientAccounts(email)
  const { accounts, isLoading: accountsLoading, totalBalance, error: accountsError, refetch: refetchAccounts } = useClientAccounts(email);

  // 4. useState for selectedAccountId
  const [selectedAccountId, setSelectedAccountId] = useState(null);

  // 5. useEffect to set selectedAccountId when accounts load
  useEffect(() => {
    if (accounts && accounts.length > 0 && !selectedAccountId) {
      setSelectedAccountId(accounts[0].id);
    }
  }, [accounts, selectedAccountId]);

  // 6. Derive selectedAccount
  const selectedAccount = useMemo(() => {
    return accounts?.find(a => a.id === selectedAccountId);
  }, [accounts, selectedAccountId]);

  // 7. useTransactions(selectedAccountId)
  const { transactions, isLoading: txLoading, error: txError, refetch: refetchTransactions } = useTransactions(selectedAccountId);

  // 8. Derive expiryDays
  const expiryDays = selectedAccount?.partner?.loyalty_expiry_days || 365;

  // 9. useExpiration
  const { nearestExpiry } = useExpiration(transactions, expiryDays);

  // Loading state
  if (accountsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }
  // Error loading accounts
  if (accountsError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-sm p-6 text-center max-w-md">
          <p className="text-slate-700 mb-4">{t('client.error_loading_accounts', 'Ошибка загрузки аккаунтов')}</p>
          <Button onClick={() => refetchAccounts?.()} className="w-full">
            {t('common.retry', 'Повторить')}
          </Button>
        </div>
      </div>
    );
  }

  // No accounts edge case
  if (!accounts || accounts.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-sm p-6 text-center max-w-md">
          <p className="text-slate-700 mb-4">
            {t('client.no_accounts', 'У вас пока нет бонусов')}
          </p>
          <Button onClick={() => navigate('/client')} className="w-full">
            {t('client.back', 'Назад')}
          </Button>
        </div>
      </div>
    );
  }

  // Handle logout
  const handleLogout = () => {
    navigate('/client');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8">
      <div className="px-4 max-w-md mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {t('client.cabinet_title', 'Личный кабинет')}
          </h1>
          <p className="text-sm text-gray-500 mt-1">{email}</p>
        </div>

        {/* Balance Card */}
        <BalanceCard 
          totalBalance={totalBalance} 
          nearestExpiry={nearestExpiry} 
        />

        {/* Restaurant List (only if multiple accounts) */}
        {accounts.length > 1 && (
          <div>
            <h2 className="text-lg font-semibold text-slate-900 mb-3">
              {t('client.restaurants', 'Рестораны')}
            </h2>
            <RestaurantList 
              accounts={accounts}
              selectedId={selectedAccountId}
              onSelect={setSelectedAccountId}
            />
          </div>
        )}

        {/* Transaction List */}
        <div>
          <h2 className="text-lg font-semibold text-slate-900 mb-3">
            {t('client.transactions', 'История операций')}
          </h2>
          {txLoading ? (
            <div className="bg-white rounded-lg shadow-sm p-8 flex items-center justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
            </div>
          ) : txError ? (
            <div className="bg-white rounded-lg shadow-sm p-6 text-center">
              <p className="text-slate-700 mb-4">{t('client.error_loading_transactions', 'Ошибка загрузки истории')}</p>
              <Button onClick={() => refetchTransactions?.()} className="w-full">
                {t('common.retry', 'Повторить')}
              </Button>
            </div>
          ) : (
            <TransactionList transactions={transactions} />
          )}
        </div>

        {/* Logout Button */}
        <Button 
          onClick={handleLogout}
          variant="outline"
          className="w-full mt-6"
        >
          {t('client.logout', 'Выйти')}
        </Button>
      </div>
    </div>
  );
}