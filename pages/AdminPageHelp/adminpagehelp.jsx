import React, { useState, useEffect, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { useI18n } from "@/components/i18n";
import {
  Loader2,
  Pencil,
  Plus,
  Search,
  ArrowLeft,
  LogOut,
  ShieldX,
  BookOpen,
  Trash2,
} from "lucide-react";

/* ============================================================
   ACCESS CONTROL
   ============================================================ */

const ADMIN_EMAILS = [
  "linkgabinfo@gmail.com",
];

/* ============================================================
   COMPONENTS
   ============================================================ */

function AccessDenied({ userEmail }) {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl border shadow-sm p-8 max-w-md w-full text-center">
        <div className="flex justify-center mb-4">
          <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center">
            <ShieldX className="h-8 w-8 text-red-500" />
          </div>
        </div>
        <h1 className="text-xl font-semibold mb-2">Access Denied</h1>
        <p className="text-slate-500 mb-4">You don't have permission to access this page.</p>
        {userEmail && <p className="text-sm text-slate-400 mb-6">Logged in as: {userEmail}</p>}
        <Button variant="outline" onClick={() => window.history.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />Go Back
        </Button>
      </div>
    </div>
  );
}

function AdminHeader({ onLogout, userEmail, t }) {
  return (
    <div className="bg-white border-b sticky top-0 z-20">
      <div className="max-w-5xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg font-semibold">{t('adminPageHelp.title', 'Справка по страницам')}</h1>
              <p className="text-xs text-slate-500">{t('adminPageHelp.hint', 'Здесь вы редактируете контекстную справку для страниц кабинета партнёра.')}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-xs text-slate-400 hidden sm:block">{userEmail}</div>
            <Button variant="ghost" size="sm" onClick={onLogout} title="Logout">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   MAIN COMPONENT
   ============================================================ */

export default function AdminPageHelp() {
  const { t } = useI18n();
  
  // Auth
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  
  // Data
  const [pageHelps, setPageHelps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // UI
  const [searchQuery, setSearchQuery] = useState('');
  
  // Dialog
  const [showDialog, setShowDialog] = useState(false);
  const [editingHelp, setEditingHelp] = useState(null);
  const [formData, setFormData] = useState({
    pageKey: '',
    title: '',
    markdown: '',
    isActive: true,
  });
  
  // Auth
  useEffect(() => {
    base44.auth.me()
      .then(u => setUser(u))
      .catch(() => setUser(null))
      .finally(() => setAuthLoading(false));
  }, []);

  const logout = async () => {
    try { await base44.auth.logout(); } catch {}
    window.location.href = "/";
  };

  const isAdmin = user?.email && ADMIN_EMAILS.includes(user.email.toLowerCase());
  
  // Load data ONLY for admins
  useEffect(() => {
    if (authLoading) return;
    if (!isAdmin) { setLoading(false); return; }
    
    async function load() {
      setLoading(true);
      try {
        const list = await base44.entities.PageHelp.list();
        setPageHelps(list || []);
      } catch (e) {
        toast.error(t('toast.error', 'Ошибка'), { id: 'mm1' });
      }
      setLoading(false);
    }
    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps -- t excluded: unstable reference causes infinite refetches
  }, [authLoading, isAdmin]);
  
  // Filtered list
  const filteredHelps = useMemo(() => {
    if (!searchQuery.trim()) return pageHelps;
    const q = searchQuery.toLowerCase();
    return pageHelps.filter(h => h.pageKey?.toLowerCase().includes(q));
  }, [pageHelps, searchQuery]);
  
  // Sorted by pageKey
  const sortedHelps = useMemo(() => {
    return [...filteredHelps].sort((a, b) => (a.pageKey || '').localeCompare(b.pageKey || ''));
  }, [filteredHelps]);
  
  // Open create dialog
  const handleCreate = () => {
    setEditingHelp(null);
    setFormData({
      pageKey: '',
      title: '',
      markdown: '',
      isActive: true,
    });
    setShowDialog(true);
  };
  
  // Open edit dialog
  const handleEdit = (help) => {
    setEditingHelp(help);
    setFormData({
      pageKey: help.pageKey || '',
      title: help.title || '',
      markdown: help.markdown || '',
      isActive: help.isActive !== false,
    });
    setShowDialog(true);
  };
  
  // Quick template buttons
  const handleTemplate = (pageKey) => {
    setFormData(prev => ({ ...prev, pageKey }));
  };
  
  // Save (create or update)
  const handleSave = async () => {
    // Normalize pageKey
    let normalizedKey = formData.pageKey.trim();
    if (!normalizedKey.startsWith('/')) {
      normalizedKey = '/' + normalizedKey;
    }
    
    if (!normalizedKey || normalizedKey === '/') {
      toast.error(t('adminPageHelp.pageKeyRequired', 'pageKey обязателен'), { id: 'mm1' });
      return;
    }
    
    setSaving(true);
    
    try {
      const payload = {
        pageKey: normalizedKey,
        title: formData.title.trim() || null,
        markdown: formData.markdown.trim() || null,
        isActive: formData.isActive,
        // NOTE: client-side timestamp — Base44 doesn't expose server timestamps on update
        updatedAt: new Date().toISOString(),
      };
      
      if (editingHelp) {
        // Update
        await base44.entities.PageHelp.update(editingHelp.id, payload);
        setPageHelps(prev => prev.map(h => 
          h.id === editingHelp.id ? { ...h, ...payload } : h
        ));
        toast.success(t('toast.saved', 'Сохранено'), { id: 'mm1' });
      } else {
        // Create
        const created = await base44.entities.PageHelp.create(payload);
        if (created) setPageHelps(prev => [...prev, created]);
        toast.success(t('toast.saved', 'Сохранено'), { id: 'mm1' });
      }
      
      setShowDialog(false);
      setEditingHelp(null);
      setFormData({ pageKey: '', title: '', markdown: '', isActive: true });
    } catch (err) {
      // Check for unique constraint error
      const errMsg = err?.message || '';
      if (errMsg.toLowerCase().includes('duplicate') || errMsg.toLowerCase().includes('unique')) {
        toast.error(t('adminPageHelp.duplicateKey', 'Такой pageKey уже существует'), { id: 'mm1' });
      } else {
        toast.error(t('toast.error', 'Ошибка'), { id: 'mm1' });
      }
    } finally {
      setSaving(false);
    }
  };
  
  // Delete (optional P1)
  const handleDelete = async (help) => {
    if (!confirm(`${t('adminPageHelp.deleteConfirm', 'Удалить')} "${help.pageKey}"?`)) return;
    
    setSaving(true);
    try {
      await base44.entities.PageHelp.delete(help.id);
      setPageHelps(prev => prev.filter(h => h.id !== help.id));
      toast.success(t('toast.deleted', 'Удалено'), { id: 'mm1' });
    } catch (err) {
      toast.error(t('toast.error', 'Ошибка'), { id: 'mm1' });
    } finally {
      setSaving(false);
    }
  };
  
  // Format date
  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    try {
      return new Date(dateStr).toLocaleDateString('ru-RU');
    } catch {
      return '—';
    }
  };
  
  // Loading
  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  if (!isAdmin) return <AccessDenied userEmail={user?.email} />;

  return (
    <div className="min-h-screen bg-slate-50">
      <AdminHeader onLogout={logout} userEmail={user?.email} t={t} />

      <div className="max-w-5xl mx-auto px-4 py-6 space-y-4">
        {/* Controls */}
        <div className="bg-white rounded-xl border p-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <Input 
                  value={searchQuery} 
                  onChange={(e) => setSearchQuery(e.target.value)} 
                  placeholder={t('adminPageHelp.search', 'Поиск по pageKey...')} 
                  className="pl-9" 
                />
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={handleCreate}>
              <Plus className="h-4 w-4 mr-1" />{t('adminPageHelp.create', 'Создать')}
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b">
                <tr>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-700">pageKey</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-700">title</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-700">{t('adminPageHelp.status', 'Статус')}</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-700">{t('adminPageHelp.updated', 'Обновлено')}</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-slate-700">{t('adminPageHelp.actions', 'Действия')}</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {sortedHelps.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-500">
                      {searchQuery ? t('adminPageHelp.noResults', 'Ничего не найдено') : t('adminPageHelp.empty', 'Справка ещё не добавлена')}
                    </td>
                  </tr>
                ) : sortedHelps.map(help => (
                  <tr key={help.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4">
                      <code className="text-sm font-mono bg-slate-100 px-2 py-1 rounded">{help.pageKey}</code>
                    </td>
                    <td className="py-3 px-4 text-sm text-slate-700">{help.title || '—'}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 text-xs rounded-full ${
                        help.isActive !== false 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {help.isActive !== false 
                          ? t('adminPageHelp.active', 'Активна') 
                          : t('adminPageHelp.inactive', 'Выключена')}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-slate-500">{formatDate(help.updatedAt)}</td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleEdit(help)}
                          className="h-8"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleDelete(help)}
                          className="h-8 text-red-500 hover:bg-red-50"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Helper footer */}
        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3">
          <p className="text-xs text-indigo-700">
            💡 {t('adminPageHelp.pagesHint', 'P0 страницы: /partnersettings, /menumanage, /partnertables. (P1: /partnerhome)')}
          </p>
        </div>
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={(open) => { if (!saving) setShowDialog(open); }}>
        <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>
              {editingHelp 
                ? t('adminPageHelp.editTitle', 'Редактировать справку') 
                : t('adminPageHelp.createTitle', 'Создать справку')}
            </DialogTitle>
            <DialogDescription>
              {t('adminPageHelp.dialogHint', 'Заполните поля для контекстной справки')}
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto space-y-4">
            {/* pageKey with quick templates */}
            <div className="space-y-2">
              <Label>{t('adminPageHelp.pageKeyLabel', 'pageKey')} *</Label>
              <Input 
                value={formData.pageKey} 
                onChange={(e) => setFormData({ ...formData, pageKey: e.target.value })} 
                placeholder="/partnersettings"
                disabled={saving}
              />
              <p className="text-xs text-slate-500">{t('adminPageHelp.pageKeyHelp', 'Формат: /route (например /partnersettings)')}</p>
              
              {/* Quick templates */}
              <div className="flex flex-wrap gap-2">
                <span className="text-xs text-slate-500 mr-1">{t('adminPageHelp.quickTemplates', 'Шаблоны')}:</span>
                {['/partnersettings', '/menumanage', '/partnertables'].map(key => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleTemplate(key)}
                    disabled={saving}
                    className="text-xs px-2 py-0.5 rounded bg-indigo-100 text-indigo-700 hover:bg-indigo-200 disabled:opacity-50"
                  >
                    {key}
                  </button>
                ))}
              </div>
            </div>
            
            {/* title */}
            <div className="space-y-2">
              <Label>{t('adminPageHelp.titleLabel', 'Заголовок')}</Label>
              <Input 
                value={formData.title} 
                onChange={(e) => setFormData({ ...formData, title: e.target.value })} 
                placeholder={t('adminPageHelp.titlePlaceholder', 'Настройки партнёра')}
                disabled={saving}
              />
            </div>
            
            {/* isActive */}
            <div className="flex items-center gap-2">
              <Switch 
                checked={formData.isActive} 
                onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                disabled={saving}
              />
              <Label>{t('adminPageHelp.activeLabel', 'Активна')}</Label>
            </div>
            
            {/* markdown */}
            <div className="space-y-2">
              <Label>{t('adminPageHelp.markdownLabel', 'Справка (Markdown)')}</Label>
              <Textarea 
                value={formData.markdown} 
                onChange={(e) => setFormData({ ...formData, markdown: e.target.value })} 
                placeholder={t('adminPageHelp.markdownPlaceholder', '# Инструкция\n\nЗдесь вы можете...')}
                className="min-h-[250px] font-mono text-sm"
                rows={10}
                disabled={saving}
              />
              <p className="text-xs text-slate-500">
                {t('adminPageHelp.markdownHint', 'Поддержка: # заголовок, ## подзаголовок, **жирный**, - список, [ссылка](url)')}
              </p>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)} disabled={saving}>
              {t('common.cancel', 'Отмена')}
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />{t('common.saving', 'Сохранение...')}</> : t('common.save', 'Сохранить')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
