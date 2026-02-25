import React from 'react';
import { useI18n } from '@/components/i18n';
import { useClientAuth } from '@/components/clientAccount/hooks/useClientAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, Gift } from 'lucide-react';

export default function ClientLogin() {
  const { t } = useI18n();
  const { email, setEmail, isLoading, error, handleSubmit } = useClientAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
            <Gift className="w-6 h-6 text-indigo-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-slate-900">
            {t('client.login_title', 'Войти в кабинет')}
          </CardTitle>
          <p className="text-sm text-slate-600">
            {t('client.login_subtitle', 'Введите email для доступа к вашим бонусам')}
          </p>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('client.email_placeholder', 'email@example.com')}
                className="w-full"
                disabled={isLoading}
                autoFocus
              />
              {error && (
                <p className="text-sm text-red-600">
                  {t(error, 'Ошибка')}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || !email.trim()}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {t('common.loading', 'Загрузка')}
                </>
              ) : (
                t('client.continue', 'Продолжить')
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}