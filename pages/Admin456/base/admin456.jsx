// BLOCK 00 — Imports & Constants
import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, Settings, LogOut, AlertTriangle, Loader2, Store } from "lucide-react";

const ADMIN_EMAILS = ["linkgabinfo@gmail.com"];

// BLOCK 01 — Main Component
export default function Admin456Page() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    try {
      const me = await base44.auth.me();
      if (!me || !me.email) {
        base44.auth.redirectToLogin(window.location.pathname);
        return;
      }
      setUser(me);
    } catch (err) {
      base44.auth.redirectToLogin(window.location.pathname);
    } finally {
      setLoading(false);
    }
  }

  function handleLogout() {
    base44.auth.logout();
  }

  // Guards AFTER hooks
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400 mx-auto mb-2" />
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  // Check whitelist
  const isAdmin = user && ADMIN_EMAILS.includes(user.email?.toLowerCase());

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-2" />
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>
              You don't have permission to access this page.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-gray-500 mb-4">
              Logged in as: {user?.email || "Unknown"}
            </p>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // BLOCK 02 — Admin Hub UI
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Shield className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold">Admin Hub</h1>
              <p className="text-sm text-gray-500">{user?.email}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>

        {/* Admin Links */}
        <div className="space-y-4">
          <Card className="hover:shadow-md transition-shadow">
            <a href="/translationadmin" className="block">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Settings className="h-6 w-6 text-gray-600" />
                  <div>
                    <CardTitle className="text-lg">Translation Admin</CardTitle>
                    <CardDescription>
                      Manage interface translations (RU, EN, KK)
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
            </a>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <a href="/adminpartners" className="block">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Store className="h-6 w-6 text-gray-600" />
                  <div>
                    <CardTitle className="text-lg">Рестораны</CardTitle>
                    <CardDescription>
                      Список партнёров, статистика, статус
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
            </a>
          </Card>
        </div>

        {/* Footer info */}
        <p className="text-xs text-gray-400 text-center mt-8">
          MenuApp Admin • Authorized users only
        </p>
      </div>
    </div>
  );
}
