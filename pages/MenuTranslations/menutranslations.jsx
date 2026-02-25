import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Plus,
  Upload,
  Save,
  Loader2,
  CheckCircle2,
  X as XIcon,
  Search,
  Globe,
  AlertCircle,
  Utensils,
  Copy,
  Download
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import PartnerShell from "@/components/PartnerShell";

const DEFAULT_LANGS = ['ru', 'en', 'kk'];

function isArchivedDish(dish) {
  const d = String(dish?.description || "").toLowerCase();
  return d.includes(":::archived:::");
}

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('MenuTranslations Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <PartnerShell activeTab="menu">
          <div className="p-8 max-w-7xl mx-auto">
            <Card className="max-w-md mx-auto">
              <CardContent className="p-6 text-center space-y-4">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
                <div>
                  <h2 className="text-xl font-bold text-slate-900 mb-2">Page Error</h2>
                  <p className="text-sm text-slate-600 mb-2">
                    {this.state.error?.message || 'An unexpected error occurred'}
                  </p>
                  <pre className="text-xs text-left bg-slate-100 p-2 rounded overflow-auto max-h-32 font-mono">
                    {this.state.error?.stack || String(this.state.error)}
                  </pre>
                </div>
                <div className="flex gap-2">
                  <Button onClick={() => window.location.href = '/menudishes'} className="flex-1">
                    Go to Menu
                  </Button>
                  <Button onClick={() => window.location.reload()} variant="outline" className="flex-1">
                    Reload Page
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </PartnerShell>
      );
    }

    return this.props.children;
  }
}

function MenuTranslationsInner() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Auth & Partner
  const { data: currentUser, isLoading: loadingUser, error: userError } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
    retry: false
  });

  const partnerId = currentUser?.partner;

  // UI State
  const [activeTab, setActiveTab] = useState('categories');
  const [selectedLang, setSelectedLang] = useState('en');
  const [customLangInput, setCustomLangInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Bulk paste modal
  const [isPasteModalOpen, setIsPasteModalOpen] = useState(false);
  const [pasteContent, setPasteContent] = useState('');
  const [isPasting, setIsPasting] = useState(false);
  const [pastePreview, setPastePreview] = useState(null);
  const [pasteResult, setPasteResult] = useState(null);

  // Inline editing
  const [editingTranslations, setEditingTranslations] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  // Recent languages (partner-specific)
  const storageKey = partnerId ? `menu_trans_langs_${partnerId}` : null;
  const [recentLangs, setRecentLangs] = useState(() => {
    if (!storageKey) return [];
    try {
      const saved = localStorage.getItem(storageKey);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const allLangs = useMemo(() => {
    const combined = [...DEFAULT_LANGS, ...recentLangs];
    return [...new Set(combined)];
  }, [recentLangs]);

  // Fetch data
  const { data: categories, isLoading: loadingCategories, error: categoriesError } = useQuery({
    queryKey: ['categories', partnerId],
    queryFn: () => base44.entities.Category.filter({ partner: partnerId }),
    enabled: !!partnerId,
    initialData: [],
    retry: 1
  });

  const { data: dishes, isLoading: loadingDishes, error: dishesError } = useQuery({
    queryKey: ['dishes', partnerId],
    queryFn: () => base44.entities.Dish.filter({ partner: partnerId }),
    enabled: !!partnerId,
    initialData: [],
    retry: 1
  });

  const { data: categoryTranslations, isLoading: loadingCatTrans, error: catTransError } = useQuery({
    queryKey: ['categoryTranslations', partnerId, selectedLang],
    queryFn: () => base44.entities.CategoryTranslation.filter({
      partner: partnerId,
      lang: selectedLang
    }),
    enabled: !!partnerId && !!selectedLang,
    initialData: [],
    retry: 1
  });

  const { data: dishTranslations, isLoading: loadingDishTrans, error: dishTransError } = useQuery({
    queryKey: ['dishTranslations', partnerId, selectedLang],
    queryFn: () => base44.entities.DishTranslation.filter({
      partner: partnerId,
      lang: selectedLang
    }),
    enabled: !!partnerId && !!selectedLang,
    initialData: [],
    retry: 1
  });

  // Filter dishes (exclude archived)
  const activeDishes = useMemo(() =>
    dishes.filter(d => !isArchivedDish(d)),
    [dishes]
  );

  // Build translation maps
  const catTransMap = useMemo(() => {
    const map = {};
    categoryTranslations.forEach(t => {
      map[t.category] = t;
    });
    return map;
  }, [categoryTranslations]);

  const dishTransMap = useMemo(() => {
    const map = {};
    dishTranslations.forEach(t => {
      map[t.dish] = t;
    });
    return map;
  }, [dishTranslations]);

  // Progress stats
  const categoryProgress = useMemo(() => {
    const total = categories.length;
    const translated = categories.filter(c => catTransMap[c.id]).length;
    return { total, translated };
  }, [categories, catTransMap]);

  const dishProgress = useMemo(() => {
    const total = activeDishes.length;
    const translated = activeDishes.filter(d => dishTransMap[d.id]).length;
    return { total, translated };
  }, [activeDishes, dishTransMap]);

  // Filtered data for display
  const filteredCategories = useMemo(() => {
    return categories.filter(c =>
      c.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [categories, searchQuery]);

  const filteredDishes = useMemo(() => {
    return activeDishes.filter(d => {
      const matchesSearch = d.name?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || d.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [activeDishes, searchQuery, categoryFilter]);

  // Add custom language
  const handleAddLanguage = () => {
    const lang = customLangInput.trim().toLowerCase();
    if (!lang) return;

    if (lang.length < 2 || lang.length > 5) {
      toast.error('Language code should be 2-5 characters');
      return;
    }

    if (allLangs.includes(lang)) {
      toast.error('Language already added');
      setCustomLangInput('');
      return;
    }

    if (hasUnsavedChanges) {
      if (!window.confirm('You have unsaved changes. Switch language and discard them?')) return;
    }

    const updated = [...recentLangs, lang];
    setRecentLangs(updated);
    if (storageKey) localStorage.setItem(storageKey, JSON.stringify(updated));
    setEditingTranslations({});
    setSelectedLang(lang);
    setCustomLangInput('');
    toast.success(`Language "${lang}" added`);
  };

  // Copy Template
  const handleCopyTemplate = () => {
    let tsv = '';

    if (activeTab === 'categories') {
      tsv = categories.map(cat => {
        const trans = catTransMap[cat.id];
        return `${cat.id}\t${cat.name || ''}\t${trans?.name || ''}`;
      }).join('\n');
    } else {
      tsv = activeDishes.map(dish => {
        const trans = dishTransMap[dish.id];
        return `${dish.id}\t${dish.name || ''}\t${dish.description || ''}\t${trans?.name || ''}\t${trans?.description || ''}`;
      }).join('\n');
    }

    navigator.clipboard.writeText(tsv).then(() => {
      toast.success('Template copied to clipboard');
    }).catch(() => {
      toast.error('Failed to copy template');
    });
  };

  // Export TSV
  const handleExportTSV = () => {
    let tsv = '';

    if (activeTab === 'categories') {
      tsv = categories.map(cat => {
        const trans = catTransMap[cat.id];
        return `${cat.id}\t${cat.name || ''}\t${trans?.name || ''}`;
      }).join('\n');
    } else {
      tsv = activeDishes.map(dish => {
        const trans = dishTransMap[dish.id];
        return `${dish.id}\t${dish.name || ''}\t${dish.description || ''}\t${trans?.name || ''}\t${trans?.description || ''}`;
      }).join('\n');
    }

    const filename = `translations_${partnerId}_${selectedLang}_${activeTab}.tsv`;
    const blob = new Blob([tsv], { type: 'text/tab-separated-values' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);

    toast.success('TSV file downloaded');
  };

  // Inline editing handlers
  const handleEditChange = (id, field, value) => {
    setEditingTranslations(prev => ({
      ...prev,
      [id]: {
        ...(prev[id] || {}),
        [field]: value
      }
    }));
  };

  const handleSaveTranslations = async () => {
    if (!partnerId) return;

    setIsSaving(true);

    try {
      const promises = [];

      if (activeTab === 'categories') {
        Object.entries(editingTranslations).forEach(([catId, data]) => {
          const existing = catTransMap[catId];

          if (existing) {
            promises.push(
              base44.entities.CategoryTranslation.update(existing.id, {
                name: data.name || existing.name
              })
            );
          } else {
            if (data.name) {
              promises.push(
                base44.entities.CategoryTranslation.create({
                  partner: partnerId,
                  category: catId,
                  lang: selectedLang,
                  name: data.name
                })
              );
            }
          }
        });
      } else {
        Object.entries(editingTranslations).forEach(([dishId, data]) => {
          const existing = dishTransMap[dishId];

          if (existing) {
            promises.push(
              base44.entities.DishTranslation.update(existing.id, {
                name: data.name || existing.name,
                description: data.description !== undefined ? data.description : existing.description
              })
            );
          } else {
            if (data.name) {
              promises.push(
                base44.entities.DishTranslation.create({
                  partner: partnerId,
                  dish: dishId,
                  lang: selectedLang,
                  name: data.name,
                  description: data.description || ''
                })
              );
            }
          }
        });
      }

      const results = await Promise.allSettled(promises);
      const failed = results.filter(r => r.status === 'rejected').length;
      const succeeded = results.filter(r => r.status === 'fulfilled').length;

      queryClient.invalidateQueries({ queryKey: ['categoryTranslations'] });
      queryClient.invalidateQueries({ queryKey: ['dishTranslations'] });

      setEditingTranslations({});

      if (failed > 0) {
        toast.warning(`Saved ${succeeded}, failed: ${failed}`);
      } else {
        toast.success('Translations saved');
      }
    } catch (err) {
      toast.error('Failed to save translations');
    } finally {
      setIsSaving(false);
    }
  };

  // Preview bulk paste
  const handlePreviewBulkPaste = () => {
    if (!pasteContent.trim()) return;

    const lines = pasteContent.trim().split('\n').filter(l => l.trim());

    let willCreate = 0;
    let willUpdate = 0;
    let willSkip = 0;

    if (activeTab === 'categories') {
      lines.forEach(line => {
        const parts = line.split('\t');
        if (parts.length < 2) {
          willSkip++;
          return;
        }

        const [catId, , transName] = parts;
        const trimmedId = catId.trim();
        const trimmedName = transName?.trim() || '';

        if (!trimmedId || !trimmedName) {
          willSkip++;
          return;
        }

        const catExists = categories.find(c => c.id === trimmedId);
        if (!catExists) {
          willSkip++;
          return;
        }

        const existing = catTransMap[trimmedId];
        if (existing) willUpdate++;
        else willCreate++;
      });
    } else {
      lines.forEach(line => {
        const parts = line.split('\t');
        if (parts.length < 2) {
          willSkip++;
          return;
        }

        const [dishId, , , transName, transDesc] = parts;
        const trimmedId = dishId.trim();
        const trimmedName = transName?.trim() || '';

        if (!trimmedId || !trimmedName) {
          willSkip++;
          return;
        }

        const dishExists = activeDishes.find(d => d.id === trimmedId);
        if (!dishExists) {
          willSkip++;
          return;
        }

        const existing = dishTransMap[trimmedId];
        if (existing) willUpdate++;
        else willCreate++;
      });
    }

    setPastePreview({ willCreate, willUpdate, willSkip });
  };

  // Bulk paste handler
  const handleBulkPaste = async () => {
    if (!pasteContent.trim() || !partnerId) return;

    setIsPasting(true);
    setPasteResult(null);

    try {
      const lines = pasteContent.trim().split('\n').filter(l => l.trim());

      let created = 0;
      let updated = 0;
      let skipped = 0;

      const promises = [];

      if (activeTab === 'categories') {
        for (const line of lines) {
          const parts = line.split('\t');
          if (parts.length < 2) {
            skipped++;
            continue;
          }

          const [catId, , transName] = parts;
          const trimmedId = catId.trim();
          const trimmedName = transName?.trim() || '';

          if (!trimmedId || !trimmedName) {
            skipped++;
            continue;
          }

          const catExists = categories.find(c => c.id === trimmedId);
          if (!catExists) {
            skipped++;
            continue;
          }

          const existing = catTransMap[trimmedId];

          if (existing) {
            promises.push(
              base44.entities.CategoryTranslation.update(existing.id, { name: trimmedName })
                .then(() => { updated++; })
                .catch(() => { skipped++; })
            );
          } else {
            promises.push(
              base44.entities.CategoryTranslation.create({
                partner: partnerId,
                category: trimmedId,
                lang: selectedLang,
                name: trimmedName
              })
                .then(() => { created++; })
                .catch(() => { skipped++; })
            );
          }
        }
      } else {
        for (const line of lines) {
          const parts = line.split('\t');
          if (parts.length < 2) {
            skipped++;
            continue;
          }

          const [dishId, , , transName, transDesc] = parts;
          const trimmedId = dishId.trim();
          const trimmedName = transName?.trim() || '';
          const trimmedDesc = transDesc?.trim() || '';

          if (!trimmedId || !trimmedName) {
            skipped++;
            continue;
          }

          const dishExists = activeDishes.find(d => d.id === trimmedId);
          if (!dishExists) {
            skipped++;
            continue;
          }

          const existing = dishTransMap[trimmedId];

          if (existing) {
            promises.push(
              base44.entities.DishTranslation.update(existing.id, {
                name: trimmedName,
                description: trimmedDesc
              })
                .then(() => { updated++; })
                .catch(() => { skipped++; })
            );
          } else {
            promises.push(
              base44.entities.DishTranslation.create({
                partner: partnerId,
                dish: trimmedId,
                lang: selectedLang,
                name: trimmedName,
                description: trimmedDesc
              })
                .then(() => { created++; })
                .catch(() => { skipped++; })
            );
          }
        }
      }

      await Promise.all(promises);

      queryClient.invalidateQueries({ queryKey: ['categoryTranslations'] });
      queryClient.invalidateQueries({ queryKey: ['dishTranslations'] });

      setPasteResult({ created, updated, skipped });
      setPasteContent('');
      setPastePreview(null);

      setTimeout(() => {
        setIsPasteModalOpen(false);
        setPasteResult(null);
      }, 3000);
    } catch (err) {
      console.error('Bulk paste error:', err);
      toast.error('Failed to process bulk paste');
    } finally {
      setIsPasting(false);
    }
  };

  const hasUnsavedChanges = Object.keys(editingTranslations).length > 0;

  // Loading state
  if (loadingUser) {
    return (
      <PartnerShell activeTab="menu">
        <div className="p-8 max-w-7xl mx-auto">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mx-auto mb-3" />
              <p className="text-slate-500">Loading user context...</p>
            </div>
          </div>
        </div>
      </PartnerShell>
    );
  }

  // User error
  if (userError) {
    return (
      <PartnerShell activeTab="menu">
        <div className="p-8 max-w-7xl mx-auto">
          <Card className="max-w-md mx-auto">
            <CardContent className="p-6 text-center space-y-4">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
              <div>
                <h2 className="text-xl font-bold text-slate-900 mb-2">Failed to load user</h2>
                <p className="text-sm text-slate-600 mb-2">
                  {userError.message || 'Unknown error'}
                </p>
                <p className="text-xs text-slate-400">Try logging in again</p>
              </div>
              <Button onClick={() => window.location.reload()} className="w-full">
                Reload Page
              </Button>
            </CardContent>
          </Card>
        </div>
      </PartnerShell>
    );
  }

  // No partner guard
  if (!partnerId) {
    return (
      <PartnerShell activeTab="menu">
        <div className="p-8 max-w-7xl mx-auto">
          <Card className="max-w-md mx-auto">
            <CardContent className="p-6 text-center space-y-4">
              <AlertCircle className="w-12 h-12 text-amber-500 mx-auto" />
              <div>
                <h2 className="text-xl font-bold text-slate-900 mb-2">No partner context</h2>
                <p className="text-sm text-slate-600 mb-2">
                  Open Menu page first or select a partner.
                </p>
                <p className="text-xs text-slate-400 font-mono">
                  partnerId: {partnerId || '(empty)'}
                </p>
              </div>
              <Button onClick={() => navigate('/menudishes')} className="w-full">
                Go to Menu
              </Button>
            </CardContent>
          </Card>
        </div>
      </PartnerShell>
    );
  }

  // Data loading errors
  const dataError = categoriesError || dishesError || catTransError || dishTransError;
  if (dataError) {
    return (
      <PartnerShell activeTab="menu">
        <div className="p-8 max-w-7xl mx-auto">
          <Card className="max-w-md mx-auto">
            <CardContent className="p-6 text-center space-y-4">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
              <div>
                <h2 className="text-xl font-bold text-slate-900 mb-2">Failed to load translations</h2>
                <p className="text-sm text-slate-600 mb-2">
                  {dataError.message || 'Unknown error occurred'}
                </p>
                <pre className="text-xs text-left bg-slate-100 p-2 rounded overflow-auto max-h-32">
                  {JSON.stringify(dataError, null, 2)}
                </pre>
              </div>
              <Button onClick={() => queryClient.invalidateQueries()} className="w-full">
                Retry
              </Button>
            </CardContent>
          </Card>
        </div>
      </PartnerShell>
    );
  }

  // Main content (with loading states for data)
  const isLoadingData = loadingCategories || loadingDishes || loadingCatTrans || loadingDishTrans;

  return (
    <PartnerShell activeTab="menu">
      {/* Main Content */}
      <div className="p-8 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Переводы меню</h1>
            <p className="text-slate-500 mt-1">
              Управление переводами категорий и блюд на разные языки
            </p>
          </div>

          {hasUnsavedChanges && (
            <Button
              onClick={handleSaveTranslations}
              disabled={isSaving}
              className="bg-green-600 hover:bg-green-700"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Сохранение...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Сохранить изменения
                </>
              )}
            </Button>
          )}
        </div>

        {/* Language Selector */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Globe className="w-5 h-5" />
              Выбрать язык
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingData ? (
              <div className="flex items-center gap-2 text-slate-400">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">Загрузка языков...</span>
              </div>
            ) : (
              <>
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  {allLangs.slice(0, 6).map(lang => (
                    <button
                      key={lang}
                      onClick={() => {
                        if (hasUnsavedChanges) {
                          if (!window.confirm('You have unsaved changes. Switch language and discard them?')) return;
                        }
                        setEditingTranslations({});
                        setSelectedLang(lang);
                      }}
                      className={`px-4 py-2 rounded-lg border font-medium transition-all ${
                        selectedLang === lang
                          ? 'bg-indigo-600 text-white border-indigo-600'
                          : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      {lang.toUpperCase()}
                    </button>
                  ))}
                  {allLangs.length > 6 && (
                    <span className="text-xs text-slate-500">+{allLangs.length - 6} more</span>
                  )}
                </div>

                <div className="flex gap-2">
                  <Input
                    value={customLangInput}
                    onChange={(e) => setCustomLangInput(e.target.value)}
                    placeholder="Добавить код языка (e.g., 'es', 'de', 'tr')"
                    className="max-w-sm"
                    onKeyDown={(e) => e.key === 'Enter' && handleAddLanguage()}
                  />
                  <Button onClick={handleAddLanguage} variant="outline">
                    <Plus className="w-4 h-4 mr-2" />
                    Добавить язык
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Tabs */}
        <div className="flex items-center gap-6 border-b border-slate-200 mb-6">
          <button
            onClick={() => {
              if (hasUnsavedChanges) {
                if (!window.confirm('You have unsaved changes. Switch tab and discard them?')) return;
              }
              setEditingTranslations({});
              setActiveTab('categories');
            }}
            className={`pb-3 text-sm font-medium transition-all border-b-2 ${
              activeTab === 'categories'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            Категории ({categoryProgress.translated}/{categoryProgress.total})
          </button>
          <button
            onClick={() => {
              if (hasUnsavedChanges) {
                if (!window.confirm('You have unsaved changes. Switch tab and discard them?')) return;
              }
              setEditingTranslations({});
              setActiveTab('dishes');
            }}
            className={`pb-3 text-sm font-medium transition-all border-b-2 ${
              activeTab === 'dishes'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            Блюда ({dishProgress.translated}/{dishProgress.total})
          </button>
        </div>

        {isLoadingData ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mx-auto mb-3" />
              <p className="text-slate-500">Загрузка данных меню...</p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
                <Input
                  placeholder={activeTab === 'categories' ? 'Поиск категорий...' : 'Поиск блюд...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>

              {activeTab === 'dishes' && (
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Все категории" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Все категории</SelectItem>
                    {categories.map(cat => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              <Button onClick={handleCopyTemplate} variant="outline">
                <Copy className="w-4 h-4 mr-2" />
                Копировать шаблон
              </Button>

              <Button onClick={handleExportTSV} variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Экспорт TSV
              </Button>

              <Button onClick={() => setIsPasteModalOpen(true)} variant="outline">
                <Upload className="w-4 h-4 mr-2" />
                Вставить
              </Button>
            </div>

            {/* Translation Table */}
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50 border-b">
                      <tr>
                        <th className="text-left p-3 text-sm font-medium text-slate-700">ID</th>
                        <th className="text-left p-3 text-sm font-medium text-slate-700">Оригинал</th>
                        {activeTab === 'dishes' && (
                          <th className="text-left p-3 text-sm font-medium text-slate-700">Описание (оригинал)</th>
                        )}
                        <th className="text-left p-3 text-sm font-medium text-slate-700">
                          Перевод ({selectedLang.toUpperCase()})
                        </th>
                        {activeTab === 'dishes' && (
                          <th className="text-left p-3 text-sm font-medium text-slate-700">
                            Описание ({selectedLang.toUpperCase()})
                          </th>
                        )}
                        <th className="text-center p-3 text-sm font-medium text-slate-700 w-20">Статус</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activeTab === 'categories' ? (
                        categories.length === 0 ? (
                          <tr>
                            <td colSpan="4" className="p-0">
                              <Card className="m-4 border-2 border-dashed border-slate-200 shadow-none">
                                <CardContent className="p-8 text-center">
                                  <div className="max-w-md mx-auto space-y-4">
                                    <div className="text-slate-400 mb-4">
                                      <Utensils className="w-12 h-12 mx-auto" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-slate-900">
                                      Нет категорий
                                    </h3>
                                    <p className="text-sm text-slate-600 leading-relaxed">
                                      Создайте категории и назначьте их блюдам, чтобы включить переводы категорий.
                                    </p>
                                    <div className="flex gap-3 justify-center pt-2">
                                      <Button
                                        onClick={() => navigate("/menudishes")}
                                        className="bg-indigo-600 hover:bg-indigo-700"
                                      >
                                        Перейти к меню
                                      </Button>
                                    </div>
                                    <p className="text-xs text-slate-500 pt-2">
                                      Подсказка: Категории можно создать на странице Меню или через вкладку Данные на панели управления.
                                    </p>
                                  </div>
                                </CardContent>
                              </Card>
                            </td>
                          </tr>
                        ) : filteredCategories.length === 0 ? (
                          <tr>
                            <td colSpan="4" className="text-center py-8 text-slate-500">
                              Категории не найдены
                            </td>
                          </tr>
                        ) : (
                          filteredCategories.map(cat => {
                            const translation = catTransMap[cat.id];
                            const editing = editingTranslations[cat.id];
                            const displayName = editing?.name !== undefined ? editing.name : (translation?.name || '');

                            return (
                              <tr key={cat.id} className="border-b hover:bg-slate-50">
                                <td className="p-3 text-xs text-slate-400 font-mono">
                                  {cat.id.slice(-6)}
                                </td>
                                <td className="p-3 text-sm text-slate-900">
                                  {cat.name}
                                </td>
                                <td className="p-3">
                                  <Input
                                    value={displayName}
                                    onChange={(e) => handleEditChange(cat.id, 'name', e.target.value)}
                                    placeholder={`Введите ${selectedLang.toUpperCase()} название...`}
                                    className="h-9"
                                  />
                                </td>
                                <td className="p-3 text-center">
                                  {translation ? (
                                    <CheckCircle2 className="w-4 h-4 text-green-600 mx-auto" />
                                  ) : (
                                    <span className="text-xs text-slate-400">—</span>
                                  )}
                                </td>
                              </tr>
                            );
                          })
                        )
                      ) : (
                        filteredDishes.length === 0 ? (
                          <tr>
                            <td colSpan="6" className="text-center py-8 text-slate-500">
                              Блюда не найдены
                            </td>
                          </tr>
                        ) : (
                          filteredDishes.map(dish => {
                            const translation = dishTransMap[dish.id];
                            const editing = editingTranslations[dish.id];
                            const displayName = editing?.name !== undefined ? editing.name : (translation?.name || '');
                            const displayDesc = editing?.description !== undefined ? editing.description : (translation?.description || '');

                            return (
                              <tr key={dish.id} className="border-b hover:bg-slate-50">
                                <td className="p-3 text-xs text-slate-400 font-mono">
                                  {dish.id.slice(-6)}
                                </td>
                                <td className="p-3 text-sm text-slate-900">
                                  {dish.name}
                                </td>
                                <td className="p-3 text-sm text-slate-600 max-w-xs truncate">
                                  {dish.description || '—'}
                                </td>
                                <td className="p-3">
                                  <Input
                                    value={displayName}
                                    onChange={(e) => handleEditChange(dish.id, 'name', e.target.value)}
                                    placeholder={`Введите ${selectedLang.toUpperCase()} название...`}
                                    className="h-9"
                                  />
                                </td>
                                <td className="p-3">
                                  <Input
                                    value={displayDesc}
                                    onChange={(e) => handleEditChange(dish.id, 'description', e.target.value)}
                                    placeholder={`Введите ${selectedLang.toUpperCase()} описание...`}
                                    className="h-9"
                                  />
                                </td>
                                <td className="p-3 text-center">
                                  {translation ? (
                                    <CheckCircle2 className="w-4 h-4 text-green-600 mx-auto" />
                                  ) : (
                                    <span className="text-xs text-slate-400">—</span>
                                  )}
                                </td>
                              </tr>
                            );
                          })
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Bulk Paste Modal */}
      <Dialog open={isPasteModalOpen} onOpenChange={setIsPasteModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Массовая вставка переводов</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="bg-slate-50 p-4 rounded-lg text-sm space-y-2">
              <p className="font-medium text-slate-900">
                {activeTab === 'categories' ? 'Формат для категорий:' : 'Формат для блюд:'}
              </p>
              {activeTab === 'categories' ? (
                <>
                  <pre className="text-xs text-slate-600 font-mono">
                    category_id{'\t'}original_name{'\t'}translated_name
                  </pre>
                  <p className="text-xs text-slate-500">
                    Пример: Скопируйте шаблон, заполните столбец translated_name в таблице, и вставьте сюда.
                  </p>
                </>
              ) : (
                <>
                  <pre className="text-xs text-slate-600 font-mono">
                    dish_id{'\t'}original_name{'\t'}original_description{'\t'}translated_name{'\t'}translated_description
                  </pre>
                  <p className="text-xs text-slate-500">
                    Пример: Скопируйте шаблон, заполните столбцы переводов в таблице, и вставьте сюда.
                  </p>
                </>
              )}
              <p className="text-xs text-slate-500 font-medium">
                💡 Совет: Используйте кнопку "Копировать шаблон" для получения TSV с ID и оригинальным текстом, редактируйте в Excel/Sheets, затем вставьте обратно.
              </p>
            </div>

            <Textarea
              value={pasteContent}
              onChange={(e) => {
                setPasteContent(e.target.value);
                setPastePreview(null);
              }}
              placeholder={activeTab === 'categories'
                ? "category_id\tOriginal Name\tTranslated Name\ncategory_id\tAnother Name\tПереведённое имя"
                : "dish_id\tOriginal Name\tOriginal Description\tTranslated Name\tTranslated Description"
              }
              className="font-mono text-sm h-64"
            />

            {pastePreview && (
              <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                <div className="flex items-center gap-2 text-blue-800 font-medium mb-2">
                  <AlertCircle className="w-5 h-5" />
                  Предпросмотр
                </div>
                <div className="text-sm text-blue-700 space-y-1">
                  <p>✅ Будет создано: {pastePreview.willCreate}</p>
                  <p>🔄 Будет обновлено: {pastePreview.willUpdate}</p>
                  <p>⏭️ Будет пропущено: {pastePreview.willSkip}</p>
                </div>
              </div>
            )}

            {pasteResult && (
              <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                <div className="flex items-center gap-2 text-green-800 font-medium mb-2">
                  <CheckCircle2 className="w-5 h-5" />
                  Массовая вставка завершена
                </div>
                <div className="text-sm text-green-700 space-y-1">
                  <p>Создано: {pasteResult.created}</p>
                  <p>Обновлено: {pasteResult.updated}</p>
                  <p>Пропущено: {pasteResult.skipped}</p>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsPasteModalOpen(false);
                setPasteContent('');
                setPasteResult(null);
                setPastePreview(null);
              }}
              disabled={isPasting}
            >
              Отмена
            </Button>
            {!pastePreview ? (
              <Button
                onClick={handlePreviewBulkPaste}
                disabled={!pasteContent.trim()}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <AlertCircle className="w-4 h-4 mr-2" />
                Предпросмотр
              </Button>
            ) : (
              <Button
                onClick={handleBulkPaste}
                disabled={isPasting}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                {isPasting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Обработка...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Подтвердить и применить
                  </>
                )}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PartnerShell>
  );
}

export default function MenuTranslations() {
  return (
    <ErrorBoundary>
      <MenuTranslationsInner />
    </ErrorBoundary>
  );
}
