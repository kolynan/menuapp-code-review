// ================================
// pages/partnercontacts1.jsx — LAB ONLY
// Partner Contacts Management (view_mode + unlimited links)
// ================================

// ================================
// BLOCK 00: IMPORTS
// ================================
import React, { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  FlaskConical,
  ArrowLeft,
  Loader2,
  Plus,
  Edit2,
  Trash2,
  Power,
  Save,
  Search,
  Phone,
  Mail,
  Globe,
  MapPin,
  Instagram,
  Facebook,
  Send,
  ExternalLink,
  Eye,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { toast } from "sonner";
import { useI18n } from "@/components/i18n";

// ================================
// BLOCK 01: HELPERS
// ================================
function normStr(v) {
  return String(v == null ? "" : v);
}

function getTypeIcon(type) {
  const map = {
    phone: Phone,
    whatsapp: Send,
    instagram: Instagram,
    facebook: Facebook,
    tiktok: Send,
    website: Globe,
    email: Mail,
    map: MapPin,
    custom: ExternalLink,
  };
  return map[type] || ExternalLink;
}

function getTypeBadgeColor(type) {
  const colors = {
    phone: "bg-blue-100 text-blue-800",
    whatsapp: "bg-green-100 text-green-800",
    instagram: "bg-pink-100 text-pink-800",
    facebook: "bg-indigo-100 text-indigo-800",
    tiktok: "bg-slate-100 text-slate-800",
    website: "bg-purple-100 text-purple-800",
    email: "bg-amber-100 text-amber-800",
    map: "bg-teal-100 text-teal-800",
    custom: "bg-slate-100 text-slate-700",
  };
  return colors[type] || "bg-slate-100 text-slate-700";
}

function getTypeLabel(type) {
  const labels = {
    phone: "Phone",
    whatsapp: "WhatsApp",
    instagram: "Instagram",
    facebook: "Facebook",
    tiktok: "TikTok",
    website: "Website",
    email: "Email",
    map: "Map",
    custom: "Custom",
  };
  return labels[type] || "Link";
}

function getUrlPrefix(type) {
  const prefixes = {
    phone: "tel:",
    email: "mailto:",
    whatsapp: "https://wa.me/",
    instagram: "https://instagram.com/",
    facebook: "https://facebook.com/",
    tiktok: "https://tiktok.com/@",
    website: "https://",
    map: "https://maps.google.com/?q=",
    custom: "https://",
  };
  return prefixes[type] || "";
}

// ================================
// BLOCK 02: ERROR BOUNDARY
// ================================
class PageErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(err) {
    return { hasError: true, error: err };
  }
  componentDidCatch(err) {
    console.error("PartnerContacts1 crashed:", err);
  }
  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <div className="min-h-screen bg-slate-50 p-8">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-lg">{tr('partnercontacts.error.title','Ошибка на странице контактов')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-slate-600">{tr('partnercontacts.error.instruction','Откройте DevTools → Console и пришлите верхнюю ошибку.')}</p>
            <Button variant="outline" onClick={() => window.location.reload()}>
              {tr('common.reload','Перезагрузить')}
            </Button>
            <p className="text-xs text-slate-500 break-words">{normStr(this.state.error?.message || this.state.error)}</p>
          </CardContent>
        </Card>
      </div>
    );
  }
}

// ================================
// BLOCK 03: MAIN COMPONENT
// ================================
export default function PartnerContacts1() {
  const queryClient = useQueryClient();
  const { t } = useI18n();

  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState("icons");
  const [viewModeDirty, setViewModeDirty] = useState(false);

  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false);
  const [editingLink, setEditingLink] = useState(null);
  const [linkForm, setLinkForm] = useState({
    type: "phone",
    label: "",
    url: "",
    sort_order: "",
    is_active: true,
  });

  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const { data: currentUser } = useQuery({
    queryKey: ["currentUser"],
    queryFn: () => base44.auth.me(),
    retry: false,
  });

  const partnerId = currentUser?.partner;

  const { data: partnerContactsRaw = [], isLoading: loadingContacts } = useQuery({
    queryKey: ["partnerContacts", partnerId],
    enabled: !!partnerId,
    queryFn: () => base44.entities.PartnerContacts.filter({ partner: partnerId }),
    initialData: [],
  });

  const { data: links = [], isLoading: loadingLinks } = useQuery({
    queryKey: ["partnerContactLinks", partnerId],
    enabled: !!partnerId,
    queryFn: () => base44.entities.PartnerContactLink.filter({ partner: partnerId }),
    initialData: [],
  });

  const partnerContactsRecord = partnerContactsRaw?.[0] || null;

  useEffect(() => {
    if (partnerContactsRecord) {
      setViewMode(partnerContactsRecord.view_mode || "icons");
      setViewModeDirty(false);
    }
  }, [partnerContactsRecord]);

  const sortedLinks = useMemo(() => {
    return [...links].sort((a, b) => {
      const oa = a?.sort_order;
      const ob = b?.sort_order;
      if (oa == null && ob == null) {
        const ta = normStr(a?.type);
        const tb = normStr(b?.type);
        if (ta !== tb) return ta.localeCompare(tb);
        return normStr(a?.label).localeCompare(normStr(b?.label));
      }
      if (oa == null) return 1;
      if (ob == null) return -1;
      if (oa !== ob) return oa - ob;
      return normStr(a?.label).localeCompare(normStr(b?.label));
    });
  }, [links]);

  const filteredLinks = useMemo(() => {
    const s = normStr(search).trim().toLowerCase();
    if (!s) return sortedLinks;
    return sortedLinks.filter(
      (link) =>
        normStr(link?.label).toLowerCase().includes(s) ||
        normStr(link?.url).toLowerCase().includes(s) ||
        normStr(link?.type).toLowerCase().includes(s)
    );
  }, [sortedLinks, search]);

  const createPartnerContactsMutation = useMutation({
    mutationFn: () =>
      base44.entities.PartnerContacts.create({
        partner: partnerId,
        view_mode: viewMode,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["partnerContacts", partnerId] });
      setViewModeDirty(false);
      toast.success(t('partnercontacts.toast.created', 'Запись контактов создана'));
    },
    onError: () => toast.error(t('partnercontacts.toast.create_failed', 'Не удалось создать запись контактов')),
  });

  const updateViewModeMutation = useMutation({
    mutationFn: (vm) =>
      base44.entities.PartnerContacts.update(partnerContactsRecord.id, { view_mode: vm }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["partnerContacts", partnerId] });
      setViewModeDirty(false);
      toast.success(t('partnercontacts.toast.viewmode_saved', 'Режим отображения сохранён'));
    },
    onError: () => toast.error(t('partnercontacts.toast.viewmode_update_failed', 'Не удалось обновить режим отображения')),
  });

  const saveLinkMutation = useMutation({
    mutationFn: (payload) => {
      if (editingLink) return base44.entities.PartnerContactLink.update(editingLink.id, payload);
      return base44.entities.PartnerContactLink.create({ ...payload, partner: partnerId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["partnerContactLinks", partnerId] });
      setIsLinkDialogOpen(false);
      setEditingLink(null);
      toast.success(editingLink ? t('partnercontacts.toast.link_updated', 'Ссылка обновлена') : t('partnercontacts.toast.link_created', 'Ссылка добавлена'));
    },
    onError: () => toast.error(t('partnercontacts.toast.link_save_failed', 'Не удалось сохранить ссылку')),
  });

  const toggleLinkActiveMutation = useMutation({
    mutationFn: ({ id, is_active }) => base44.entities.PartnerContactLink.update(id, { is_active }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["partnerContactLinks", partnerId] });
      toast.success(t('partnercontacts.toast.link_status_updated','Статус ссылки обновлён'));
    },
    onError: () => {
      toast.error(t('partnercontacts.toast.link_status_failed','Не удалось обновить статус ссылки'));
    },
  });

  const deleteLinkMutation = useMutation({
    mutationFn: (id) => base44.entities.PartnerContactLink.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["partnerContactLinks", partnerId] });
      setDeleteConfirmId(null);
      toast.success(t('partnercontacts.toast.link_deleted','Ссылка удалена'));
    },
    onError: () => toast.error(t('partnercontacts.toast.link_delete_failed','Не удалось удалить ссылку')),
  });

  const saveViewMode = () => {
    if (!partnerContactsRecord) {
      createPartnerContactsMutation.mutate();
    } else {
      updateViewModeMutation.mutate(viewMode);
    }
  };

  const openCreateLink = () => {
    setEditingLink(null);
    setLinkForm({
      type: "phone",
      label: "Phone",
      url: "tel:",
      sort_order: "",
      is_active: true,
    });
    setIsLinkDialogOpen(true);
  };

  const openEditLink = (link) => {
    setEditingLink(link);
    setLinkForm({
      type: link?.type || "phone",
      label: link?.label || "",
      url: link?.url || "",
      sort_order: link?.sort_order == null ? "" : String(link.sort_order),
      is_active: link?.is_active !== false,
    });
    setIsLinkDialogOpen(true);
  };

  const saveLink = () => {
    if (!normStr(linkForm.url).trim()) {
      toast.error("URL обязателен");
      return;
    }

    const payload = {
      type: linkForm.type,
      label: normStr(linkForm.label).trim() || getTypeLabel(linkForm.type),
      url: normStr(linkForm.url).trim(),
      is_active: linkForm.is_active !== false,
    };

    const so = normStr(linkForm.sort_order).trim();
    if (so) payload.sort_order = Number.parseInt(so, 10);

    saveLinkMutation.mutate(payload);
  };

  const handleTypeChange = (newType) => {
    setLinkForm((prev) => ({
      ...prev,
      type: newType,
      label: getTypeLabel(newType),
      url: getUrlPrefix(newType),
    }));
  };

  if (!partnerId) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="bg-yellow-50 border-b border-yellow-200 p-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <FlaskConical className="w-5 h-5 text-yellow-700" />
              <span className="text-sm font-medium text-yellow-800">{t('partnercontacts.lab_version', 'LAB VERSION — Partner Contacts')}</span>
            </div>
            <Link to="/lab">
              <Button size="sm" variant="outline">{t('common.back_to_lab', 'Back to Lab hub')}</Button>
            </Link>
          </div>
        </div>
        <div className="p-8 text-center text-slate-500">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">{t('partnercontacts.access_denied','Доступ запрещен')}</h1>
          <p>{t('partnercontacts.access_denied_hint','Эта страница доступна только для владельцев ресторанов.')}</p>
        </div>
      </div>
    );
  }

  return (
    <PageErrorBoundary>
      <div className="min-h-screen bg-slate-50">
        <div className="bg-yellow-50 border-b border-yellow-200 p-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <FlaskConical className="w-5 h-5 text-yellow-700" />
              <span className="text-sm font-medium text-yellow-800">LAB VERSION — Partner Contacts</span>
            </div>
            <div className="flex gap-2">
              <Link to="/menumanage1">
                <Button size="sm" variant="outline">{t('partnercontacts.header.settings','Settings / Tables')}</Button>
              </Link>
              <Link to="/lab">
                <Button size="sm" variant="outline">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  {t('common.back_to_lab','Back to Lab hub')}
                </Button>
              </Link>
            </div>
          </div>
        </div>

        <div className="p-8 max-w-5xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-slate-900">{t('partnercontacts.title','Partner Contacts')}</h1>
            <p className="text-slate-500 mt-1">{t('partnercontacts.subtitle','Управление отображением контактов в шапке меню')}</p>
            <p className="text-xs text-slate-400 mt-2 font-mono">{t('partnercontacts.partner_id','Partner ID')}: {partnerId}</p>
          </div>

          {/* SECTION A: VIEW MODE */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Eye className="w-5 h-5" />
                {t('partnercontacts.view_mode.title','Режим отображения контактов')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm text-slate-600">
                {t('partnercontacts.view_mode.description','Выберите, как показывать контакты гостю в шапке меню.')}
              </div>

              <div className="flex bg-slate-100 border border-slate-200 rounded-lg p-0.5 max-w-sm">
                  <button
                  onClick={() => {
                    setViewMode("icons");
                    setViewModeDirty(true);
                  }}
                  className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-all ${
                    viewMode === "icons" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  {t('partnercontacts.view_mode.icons','Только иконки')}
                </button>
                <button
                  onClick={() => {
                    setViewMode("full");
                    setViewModeDirty(true);
                  }}
                  className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-all ${
                    viewMode === "full" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  {t('partnercontacts.view_mode.full','Иконка + текст')}
                </button>
              </div>

              {viewModeDirty && (
                <div className="flex gap-2">
                  <Button
                    onClick={saveViewMode}
                    disabled={updateViewModeMutation.isPending || createPartnerContactsMutation.isPending}
                    className="bg-indigo-600 hover:bg-indigo-700"
                  >
                    {(updateViewModeMutation.isPending || createPartnerContactsMutation.isPending) && (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    )}
                    <Save className="w-4 h-4 mr-2" />
                    {t('partnercontacts.view_mode.save','Сохранить режим')}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setViewMode(partnerContactsRecord?.view_mode || "icons");
                      setViewModeDirty(false);
                    }}
                  >
                    {t('common.cancel','Отмена')}
                  </Button>
                </div>
              )}

              {!partnerContactsRecord && !loadingContacts && (
                <div className="text-xs text-amber-600">
                  {t('partnercontacts.view_mode.no_record','Запись PartnerContacts отсутствует. Будет создана при сохранении.')}
                </div>
              )}
            </CardContent>
          </Card>

          {/* SECTION B: LINKS */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <CardTitle className="text-lg">{t('partnercontacts.links.title','Контактные ссылки')}</CardTitle>
                <div className="flex items-center gap-2">
                  <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder={t('partnercontacts.links.search_placeholder','Поиск по названию/url...')}
                    className="w-56"
                  />
                  <Button onClick={openCreateLink} className="bg-indigo-600 hover:bg-indigo-700 gap-2">
                    <Plus className="w-4 h-4" />
                    {t('partnercontacts.links.add','Добавить ссылку')}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loadingLinks ? (
                <div className="flex justify-center py-10">
                  <Loader2 className="animate-spin" />
                </div>
              ) : filteredLinks.length === 0 ? (
                <div className="p-8 text-center text-slate-500">
                  {search ? t('partnercontacts.links.not_found','Ссылок не найдено') : t('partnercontacts.links.empty','Нет ссылок. Добавьте первую контактную ссылку.')}
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredLinks.map((link) => {
                    const Icon = getTypeIcon(link.type);
                    return (
                      <div
                        key={link.id}
                        className={`flex items-center justify-between gap-4 p-3 border rounded-lg ${
                          link.is_active === false ? "opacity-60 bg-slate-50" : "bg-white"
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <Icon className="w-5 h-5 text-slate-500 shrink-0" />
                          <div className="min-w-0">
                            <div className="font-medium text-slate-900">{link.label || getTypeLabel(link.type)}</div>
                            <div className="text-xs text-slate-500 truncate">{link.url}</div>
                          </div>
                          <Badge className={`${getTypeBadgeColor(link.type)} text-xs shrink-0`}>
                            {getTypeLabel(link.type)}
                          </Badge>
                          {link.is_active === false && (
                            <Badge variant="outline" className="text-xs text-slate-500 shrink-0">
                              {t('partnercontacts.links.disabled','Отключена')}
                            </Badge>
                          )}
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <Button size="sm" variant="ghost" onClick={() => openEditLink(link)} title={t('common.edit','Изменить')}>
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() =>
                              toggleLinkActiveMutation.mutate({
                                id: link.id,
                                is_active: !(link.is_active !== false),
                              })
                            }
                            disabled={toggleLinkActiveMutation.isPending}
                            title={link.is_active !== false ? t('partnercontacts.links.disable','Отключить') : t('partnercontacts.links.enable','Включить')}
                          >
                            <Power
                              className={`w-4 h-4 ${
                                link.is_active !== false ? "text-slate-500" : "text-green-700"
                              }`}
                            />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setDeleteConfirmId(link.id)}
                            title={t('common.delete','Удалить')}
                            className="text-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* PREVIEW (optional - local only) */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-sm">{t('partnercontacts.preview.title','Превью: как будет выглядеть в шапке')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-slate-500 mb-3">
                {t('partnercontacts.preview.mode_label','Режим')}: <strong>{viewMode === "icons" ? t('partnercontacts.view_mode.icons','Только иконки') : t('partnercontacts.view_mode.full','Иконка + текст')}</strong>
              </div>

              {filteredLinks.filter((l) => l.is_active !== false).length === 0 ? (
                <div className="text-sm text-slate-400">{t('partnercontacts.preview.no_active','Нет активных ссылок для превью')}</div>
              ) : viewMode === "icons" ? (
                <div className="flex gap-2 flex-wrap">
                  {filteredLinks
                    .filter((l) => l.is_active !== false)
                    .map((link) => {
                      const Icon = getTypeIcon(link.type);
                      return (
                        <button
                          key={link.id}
                          className="h-11 w-11 inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition"
                          title={link.label || link.url}
                        >
                          <Icon className="w-4 h-4 text-slate-700" />
                        </button>
                      );
                    })}
                </div>
              ) : (
                <div className="flex gap-3 flex-wrap">
                  {filteredLinks
                    .filter((l) => l.is_active !== false)
                    .map((link) => {
                      const Icon = getTypeIcon(link.type);
                      return (
                        <button
                          key={link.id}
                          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition text-sm"
                        >
                          <Icon className="w-4 h-4 text-slate-700" />
                          <span className="text-slate-900">{link.label || getTypeLabel(link.type)}</span>
                        </button>
                      );
                    })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* LINK DIALOG */}
        <Dialog open={isLinkDialogOpen} onOpenChange={setIsLinkDialogOpen}>
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingLink ? t('partnercontacts.dialog.edit_title','Изменить ссылку') : t('partnercontacts.dialog.add_title','Добавить ссылку')}</DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="link_type">{t('partnercontacts.dialog.type_label','Тип *')}</Label>
                <Select value={linkForm.type} onValueChange={handleTypeChange}>
                  <SelectTrigger id="link_type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="phone">{t('partnercontacts.type.phone','Phone')}</SelectItem>
                    <SelectItem value="whatsapp">{t('partnercontacts.type.whatsapp','WhatsApp')}</SelectItem>
                    <SelectItem value="instagram">{t('partnercontacts.type.instagram','Instagram')}</SelectItem>
                    <SelectItem value="facebook">{t('partnercontacts.type.facebook','Facebook')}</SelectItem>
                    <SelectItem value="tiktok">{t('partnercontacts.type.tiktok','TikTok')}</SelectItem>
                    <SelectItem value="website">{t('partnercontacts.type.website','Website')}</SelectItem>
                    <SelectItem value="email">{t('partnercontacts.type.email','Email')}</SelectItem>
                    <SelectItem value="map">{t('partnercontacts.type.map','Map')}</SelectItem>
                    <SelectItem value="custom">{t('partnercontacts.type.custom','Custom')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="link_label">{t('partnercontacts.dialog.label','Название')}</Label>
                <Input
                  id="link_label"
                  value={linkForm.label}
                  onChange={(e) => setLinkForm({ ...linkForm, label: e.target.value })}
                  placeholder={getTypeLabel(linkForm.type)}
                />
                <div className="text-xs text-slate-500">{t('partnercontacts.dialog.auto_label','Автоматическое')}: {getTypeLabel(linkForm.type)}</div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="link_url">{t('partnercontacts.dialog.url_label','URL *')}</Label>
                <Input
                  id="link_url"
                  value={linkForm.url}
                  onChange={(e) => setLinkForm({ ...linkForm, url: e.target.value })}
                  placeholder={getUrlPrefix(linkForm.type)}
                />
                {linkForm.type === "phone" && !normStr(linkForm.url).startsWith("tel:") && linkForm.url && (
                  <div className="text-xs text-amber-600">{t('partnercontacts.dialog.hint_phone','Подсказка: телефон обычно начинается с "tel:"')}</div>
                )}
                {linkForm.type === "email" && !normStr(linkForm.url).startsWith("mailto:") && linkForm.url && (
                  <div className="text-xs text-amber-600">{t('partnercontacts.dialog.hint_email','Подсказка: email обычно начинается с "mailto:"')}</div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="link_sort">{t('partnercontacts.dialog.sort_label','Порядок отображения')}</Label>
                <Input
                  id="link_sort"
                  type="number"
                  value={linkForm.sort_order}
                  onChange={(e) => setLinkForm({ ...linkForm, sort_order: e.target.value })}
                  placeholder="1, 2, 3..."
                />
                <div className="text-xs text-slate-500">{t('partnercontacts.dialog.sort_hint','Меньше число = левее в списке')}</div>
              </div>

              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={linkForm.is_active !== false}
                  onChange={(e) => setLinkForm({ ...linkForm, is_active: e.target.checked })}
                  className="w-4 h-4"
                />
                {t('partnercontacts.dialog.active_label','Активна (показывать гостям)')}
              </label>
            </div>

            <div className="sticky bottom-0 bg-white pt-3 border-t">
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsLinkDialogOpen(false)}>
                  {t('common.cancel','Отмена')}
                </Button>
                <Button onClick={saveLink} disabled={saveLinkMutation.isPending} className="bg-indigo-600 hover:bg-indigo-700">
                  {saveLinkMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {t('common.save','Сохранить')}
                </Button>
              </DialogFooter>
            </div>
          </DialogContent>
        </Dialog>

        {/* DELETE CONFIRM DIALOG */}
        <Dialog open={!!deleteConfirmId} onOpenChange={() => setDeleteConfirmId(null)}>
          <DialogContent className="max-w-sm">
              <DialogHeader>
                <DialogTitle>{t('partnercontacts.dialog.delete_title','Удалить ссылку?')}</DialogTitle>
              </DialogHeader>
              <div className="py-4 text-sm text-slate-600">
                {t('partnercontacts.dialog.delete_hint','Это действие нельзя отменить. Ссылка будет удалена навсегда.')}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDeleteConfirmId(null)}>
                  {t('common.cancel','Отмена')}
                </Button>
                <Button
                  onClick={() => deleteLinkMutation.mutate(deleteConfirmId)}
                  disabled={deleteLinkMutation.isPending}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {deleteLinkMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {t('common.delete','Удалить')}
                </Button>
              </DialogFooter>
            </DialogContent>
        </Dialog>
      </div>
    </PageErrorBoundary>
  );
}