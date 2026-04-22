import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FlaskConical, Utensils, Globe, CheckCircle2 } from 'lucide-react';

export default function Lab() {
  const navigate = useNavigate();

  const featuredLabs = [
    {
      label: 'Menu Builder (LAB)',
      path: '/menudishes1',
      description: 'Manage dishes and categories with full CRUD',
      icon: Utensils,
      color: 'indigo'
    },
    {
      label: 'Menu Translations (LAB)',
      path: '/menutranslations1',
      description: 'Add multilingual support for menu items',
      icon: Globe,
      color: 'purple'
    },
  ];

  const otherLabs = [
    { label: 'Partner Home Lab', path: '/partnerhome1' },
    { label: 'Tables Lab', path: '/partnertables1' },
    { label: 'Settings Lab', path: '/partnersettings1' },
    { label: 'Staff Lab', path: '/partnerstaffaccess1' },
    { label: 'Orders Lab', path: '/orderslist1' },
    { label: 'Hall Defaults Migration', path: '/hallmigrate1' },
    { label: 'Table Sessions (Hall)', path: '/tablesessions1' },
  ];

  const promoteChecklist = [
    { text: 'Page loads without console errors', key: 'no-errors' },
    { text: 'Empty states are visible (no blank screens)', key: 'empty-states' },
    { text: 'CRUD tested: create/edit/disable works', key: 'crud' },
    { text: 'Smoke test PROD routes: /partnerhome, /menudishes, /partnertables, /staffordersmobile, /x', key: 'smoke-test' },
    { text: 'After promote: remove or stop using the *1 page to avoid drift', key: 'cleanup' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <FlaskConical className="w-8 h-8 text-indigo-600" />
          <h1 className="text-3xl font-bold text-slate-900">Lab — Experimental Pages</h1>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>About Lab Pages</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-slate-600">
            <p>
              Lab pages (*1) are safe sandboxes where you can test new features and UI changes without affecting production pages.
            </p>
            <p>
              Each lab page preserves code snapshots from both versions (Uppercase and lowercase).
            </p>
            <p className="font-medium text-slate-900">
              ✅ Workflow: Edit and test in *1 pages → Copy tested code into production lowercase pages.
            </p>
          </CardContent>
        </Card>

        {/* Featured Lab Pages */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-slate-900 mb-4">🔬 Featured Lab Pages</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {featuredLabs.map((page) => {
              const Icon = page.icon;
              return (
                <Card key={page.path} className="hover:shadow-lg transition-all border-2 border-slate-200">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-3 mb-4">
                      <div className={`p-2 rounded-lg ${page.color === 'indigo' ? 'bg-indigo-100' : 'bg-purple-100'}`}>
                        <Icon className={`w-6 h-6 ${page.color === 'indigo' ? 'text-indigo-600' : 'text-purple-600'}`} />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-lg text-slate-900 mb-1">{page.label}</h3>
                        <p className="text-sm text-slate-600">{page.description}</p>
                      </div>
                    </div>
                    <Button
                      className={`w-full ${page.color === 'indigo' ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-purple-600 hover:bg-purple-700'}`}
                      onClick={() => navigate(page.path)}
                    >
                      Open Lab Page
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Promote to PROD Checklist */}
        <Card className="mb-8 border-2 border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-900">
              <CheckCircle2 className="w-5 h-5" />
              Promote to PROD — Quick Checklist
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-green-800 mb-4">
              Before copying lab code to production, verify these essentials:
            </p>
            <ul className="space-y-2">
              {promoteChecklist.map((item) => (
                <li key={item.key} className="flex items-start gap-2 text-sm">
                  <span className="text-green-600 mt-0.5">▢</span>
                  <span className="text-slate-700">{item.text}</span>
                </li>
              ))}
            </ul>
            <div className="mt-4 pt-4 border-t border-green-200">
              <p className="text-xs text-green-700 font-medium">
                💡 Tip: Use the browser console (F12) and network tab to catch errors during testing.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Other Lab Pages */}
        <div>
          <h2 className="text-lg font-semibold text-slate-700 mb-3">Other Lab Pages</h2>
          <div className="grid gap-3 sm:grid-cols-3">
            {otherLabs.map((page) => (
              <Card key={page.path} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <h3 className="font-medium text-sm text-slate-900 mb-2">{page.label}</h3>
                  <Button size="sm" variant="outline" className="w-full text-xs" onClick={() => navigate(page.path)}>
                    Open
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
