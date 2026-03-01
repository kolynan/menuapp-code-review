// ================================
// pages/partnercontacts.jsx
// Partner Contacts Management (view_mode + unlimited links)
// Version: 260225-03 RELEASE (full i18n cleanup — 42 hardcoded strings → t())
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

function getTypeLabel(type, t) {
  const labels = {
    phone: t('partnercontacts.type.phone', 'Phone'),
    whatsapp: t('partnercontacts.type.whatsapp', 'WhatsApp'),
    instagram: t('partnercontacts.type.instagram', 'Instagram'),
    facebook: t('partnercontacts.type.facebook', 'Facebook'),
    tiktok: t('partnercontacts.type.tiktok', 'TikTok'),
    website: t('partnercontacts.type.website', 'Website'),
    email: t('partnercontacts.type.email', 'Email'),
    map: t('partnercontacts.type.map', 'Map'),
    custom: t('partnercontacts.type.custom', 'Custom'),
  };
  return labels[type] || t('partnercontacts.type.custom', 'Custom');
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
class PageErrorBoundaryInner extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(err) {
    return { hasError: true, error: err };
  }
  componentDidCatch(err) {
    console.error("PartnerContacts crashed:", err);
  }
  render() {
    const { t } = this.props;
    if (!this.state.hasError) return this.props.children;
    return (
      <div className="min-h-screen bg-slate-50 p-8">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-lg">{t('partnercontacts.error_title', 'Something went wrong')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-slate-600">{normStr(this.state.error?.message || this.state.error)}</p>
            <Button variant="outline" onClick={() => window.location.reload()}>
              {t('partnercontacts.error_retry', 'Try Again')}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
}

function PageErrorBoundary({ children }) {
  const { t } = useI18n();
  return <PageErrorBoundaryInner t={t}>{children}</PageErrorBoundaryInner>;
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

  const recordId = partnerContactsRecord?.id;
  const recordViewMode = partnerContactsRecord?.view_mode;

  useEffect(() => {
    if (recordId) {
      setViewMode(recordViewMode || "icons");
      setViewModeDirty(false);
    }
  }, [recordId, recordViewMode]);

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
      toast.success(t('partnercontacts.toast.created', 'PartnerContacts created'));
    },
    onError: () => toast.error(t('partnercontacts.toast.create_error', 'Failed to create PartnerContacts')),
  });

  const updateViewModeMutation = useMutation({
    mutationFn: (vm) =>
      base44.entities.PartnerContacts.update(partnerContactsRecord.id, { view_mode: vm }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["partnerContacts", partnerId] });
      setViewModeDirty(false);
      toast.success(t('partnercontacts.toast.viewmode_saved', 'View mode saved'));
    },
    onError: () => toast.error(t('partnercontacts.toast.viewmode_error', 'Failed to update view mode')),
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
      toast.success(editingLink ? t('partnercontacts.toast.link_updated', 'Link updated') : t('partnercontacts.toast.link_added', 'Link added'));
    },
    onError: () => toast.error(t('partnercontacts.toast.link_save_error', 'Failed to save link')),
  });

  const toggleLinkActiveMutation = useMutation({
    mutationFn: ({ id, is_active }) => base44.entities.PartnerContactLink.update(id, { is_active }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["partnerContactLinks", partnerId] });
      toast.success(t('partnercontacts.toast.link_status_updated', 'Link status updated'));
    },
  });

  const deleteLinkMutation = useMutation({
    mutationFn: (id) => base44.entities.PartnerContactLink.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["partnerContactLinks", partnerId] });
      setDeleteConfirmId(null);
      toast.success(t('partnercontacts.toast.link_deleted', 'Link deleted'));
    },
    onError: () => toast.error(t('partnercontacts.toast.link_delete_error', 'Failed to delete link')),
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
      label: getTypeLabel("phone", t),
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
      toast.error(t('partnercontacts.toast.url_required', 'URL is required'));
      return;
    }

    const payload = {
      type: linkForm.type,
      label: normStr(linkForm.label).trim() || getTypeLabel(linkForm.type, t),
      url: normStr(linkForm.url).trim(),
      is_active: linkForm.is_active !== false,
    };

    const so = normStr(linkForm.sort_order).trim();
    if (so) {
      const sortOrder = Number.parseInt(so, 10);
      if (Number.isNaN(sortOrder)) {
        toast.error(t('partnercontacts.toast.invalid_sort_order', 'Sort order must be a number'));
        return;
      }
      payload.sort_order = sortOrder;
    }

    saveLinkMutation.mutate(payload);
  };

  const handleTypeChange = (newType) => {
    setLinkForm((prev) => ({
      ...prev,
      type: newType,
      label: getTypeLabel(newType, t),
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
              <Button size="sm" variant="outline">{t('partnercontacts.back_to_lab', 'Back to Lab hub')}</Button>
            </Link>
          </div>
        </div>
        <div className="p-8 text-center text-slate-500">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">{t('partnercontacts.access_denied', 'Access denied')}</h1>
          <p>{t('partnercontacts.access_denied_desc', 'This page is only available to restaurant owners.')}</p>
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
              <span className="text-sm font-medium text-yellow-800">{t('partnercontacts.lab_version', 'LAB VERSION — Partner Contacts')}</span>
            </div>
            <div className="flex gap-2">
              <Link to="/menumanage1">
                <Button size="sm" variant="outline">{t('partnercontacts.settings_tables', 'Settings / Tables')}</Button>
              </Link>
              <Link to="/lab">
                <Button size="sm" variant="outline">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  {t('partnercontacts.back_to_lab', 'Back to Lab hub')}
                </Button>
              </Link>
            </div>
          </div>
        </div>

        <div className="p-8 max-w-5xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-slate-900">{t('partnercontacts.page_title', 'Partner Contacts')}</h1>
            <p className="text-slate-500 mt-1">{t('partnercontacts.subtitle', 'Manage how contacts appear in the menu header')}</p>
            <p className="text-xs text-slate-400 mt-2 font-mono">Partner ID: {partnerId}</p>
          </div>

          {/* SECTION A: VIEW MODE */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Eye className="w-5 h-5" />
                {t('partnercontacts.viewmode_title', 'Contact display mode')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm text-slate-600">
                {t('partnercontacts.viewmode_desc', 'Choose how contacts are shown to guests in the menu header.')}
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
                  {t('partnercontacts.viewmode_icons', 'Icons only')}
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
                  {t('partnercontacts.viewmode_full', 'Icon + text')}
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
                    {t('partnercontacts.save_viewmode', 'Save mode')}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setViewMode(recordViewMode || "icons");
                      setViewModeDirty(false);
                    }}
                  >
                    {t('partnercontacts.cancel', 'Cancel')}
                  </Button>
                </div>
              )}

              {!partnerContactsRecord && !loadingContacts && (
                <div className="text-xs text-amber-600">
                  {t('partnercontacts.record_missing', 'PartnerContacts record is missing. It will be created on save.')}
                </div>
              )}
            </CardContent>
          </Card>

          {/* SECTION B: LINKS */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <CardTitle className="text-lg">{t('partnercontacts.links_title', 'Contact links')}</CardTitle>
                <div className="flex items-center gap-2">
                  <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder={t('partnercontacts.search_placeholder', 'Search by name/url...')}
                    className="w-56"
                  />
                  <Button onClick={openCreateLink} className="bg-indigo-600 hover:bg-indigo-700 gap-2">
                    <Plus className="w-4 h-4" />
                    {t('partnercontacts.add_link', 'Add link')}
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
                  {search
                    ? t('partnercontacts.no_results', 'No links found')
                    : t('partnercontacts.empty', 'No links yet. Add your first contact link.')}
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
                            <div className="font-medium text-slate-900">{link.label || getTypeLabel(link.type, t)}</div>
                            <div className="text-xs text-slate-500 truncate">{link.url}</div>
                          </div>
                          <Badge className={`${getTypeBadgeColor(link.type)} text-xs shrink-0`}>
                            {getTypeLabel(link.type, t)}
                          </Badge>
                          {link.is_active === false && (
                            <Badge variant="outline" className="text-xs text-slate-500 shrink-0">
                              {t('partnercontacts.disabled', 'Disabled')}
                            </Badge>
                          )}
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <Button size="sm" variant="ghost" onClick={() => openEditLink(link)} title={t('partnercontacts.edit', 'Edit')}>
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
                            title={link.is_active !== false ? t('partnercontacts.deactivate', 'Deactivate') : t('partnercontacts.activate', 'Activate')}
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
                            title={t('partnercontacts.delete', 'Delete')}
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

          {/* PREVIEW */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-sm">{t('partnercontacts.preview_title', 'Preview: how it will look in the header')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-slate-500 mb-3">
                {t('partnercontacts.preview_mode', 'Mode')}: <strong>{viewMode === "icons" ? t('partnercontacts.viewmode_icons', 'Icons only') : t('partnercontacts.viewmode_full', 'Icon + text')}</strong>
              </div>

              {filteredLinks.filter((l) => l.is_active !== false).length === 0 ? (
                <div className="text-sm text-slate-400">{t('partnercontacts.no_active_links', 'No active links to preview')}</div>
              ) : viewMode === "icons" ? (
                <div className="flex gap-2 flex-wrap">
                  {filteredLinks
                    .filter((l) => l.is_active !== false)
                    .map((link) => {
                      const Icon = getTypeIcon(link.type);
                      return (
                        <button
                          key={link.id}
                          className="h-9 w-9 inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition"
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
                          <span className="text-slate-900">{link.label || getTypeLabel(link.type, t)}</span>
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
              <DialogTitle>{editingLink ? t('partnercontacts.edit_link', 'Edit link') : t('partnercontacts.add_link', 'Add link')}</DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="link_type">{t('partnercontacts.field_type', 'Type')} *</Label>
                <Select value={linkForm.type} onValueChange={handleTypeChange}>
                  <SelectTrigger id="link_type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="phone">{getTypeLabel('phone', t)}</SelectItem>
                    <SelectItem value="whatsapp">{getTypeLabel('whatsapp', t)}</SelectItem>
                    <SelectItem value="instagram">{getTypeLabel('instagram', t)}</SelectItem>
                    <SelectItem value="facebook">{getTypeLabel('facebook', t)}</SelectItem>
                    <SelectItem value="tiktok">{getTypeLabel('tiktok', t)}</SelectItem>
                    <SelectItem value="website">{getTypeLabel('website', t)}</SelectItem>
                    <SelectItem value="email">{getTypeLabel('email', t)}</SelectItem>
                    <SelectItem value="map">{getTypeLabel('map', t)}</SelectItem>
                    <SelectItem value="custom">{getTypeLabel('custom', t)}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="link_label">{t('partnercontacts.field_label', 'Label')}</Label>
                <Input
                  id="link_label"
                  value={linkForm.label}
                  onChange={(e) => setLinkForm({ ...linkForm, label: e.target.value })}
                  placeholder={getTypeLabel(linkForm.type, t)}
                />
                <div className="text-xs text-slate-500">{t('partnercontacts.auto_label', 'Auto')}: {getTypeLabel(linkForm.type, t)}</div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="link_url">{t('partnercontacts.field_url', 'URL')} *</Label>
                <Input
                  id="link_url"
                  value={linkForm.url}
                  onChange={(e) => setLinkForm({ ...linkForm, url: e.target.value })}
                  placeholder={getUrlPrefix(linkForm.type)}
                />
                {linkForm.type === "phone" && !normStr(linkForm.url).startsWith("tel:") && linkForm.url && (
                  <div className="text-xs text-amber-600">{t('partnercontacts.hint_phone', 'Hint: phone usually starts with "tel:"')}</div>
                )}
                {linkForm.type === "email" && !normStr(linkForm.url).startsWith("mailto:") && linkForm.url && (
                  <div className="text-xs text-amber-600">{t('partnercontacts.hint_email', 'Hint: email usually starts with "mailto:"')}</div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="link_sort">{t('partnercontacts.field_sort', 'Display order')}</Label>
                <Input
                  id="link_sort"
                  type="number"
                  value={linkForm.sort_order}
                  onChange={(e) => setLinkForm({ ...linkForm, sort_order: e.target.value })}
                  placeholder="1, 2, 3..."
                />
                <div className="text-xs text-slate-500">{t('partnercontacts.sort_hint', 'Lower number = further left in the list')}</div>
              </div>

              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={linkForm.is_active !== false}
                  onChange={(e) => setLinkForm({ ...linkForm, is_active: e.target.checked })}
                  className="w-4 h-4"
                />
                {t('partnercontacts.is_active', 'Active (visible to guests)')}
              </label>
            </div>

            <div className="sticky bottom-0 bg-white pt-3 border-t">
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsLinkDialogOpen(false)}>
                  {t('partnercontacts.cancel', 'Cancel')}
                </Button>
                <Button onClick={saveLink} disabled={saveLinkMutation.isPending} className="bg-indigo-600 hover:bg-indigo-700">
                  {saveLinkMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {t('partnercontacts.save', 'Save')}
                </Button>
              </DialogFooter>
            </div>
          </DialogContent>
        </Dialog>

        {/* DELETE CONFIRM DIALOG */}
        <Dialog open={!!deleteConfirmId} onOpenChange={() => setDeleteConfirmId(null)}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>{t('partnercontacts.delete_title', 'Delete link?')}</DialogTitle>
            </DialogHeader>
            <div className="py-4 text-sm text-slate-600">
              {t('partnercontacts.delete_confirm', 'This action cannot be undone. The link will be permanently deleted.')}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteConfirmId(null)}>
                {t('partnercontacts.cancel', 'Cancel')}
              </Button>
              <Button
                onClick={() => deleteLinkMutation.mutate(deleteConfirmId)}
                disabled={deleteLinkMutation.isPending}
                className="bg-red-600 hover:bg-red-700"
              >
                {deleteLinkMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {t('partnercontacts.delete', 'Delete')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </PageErrorBoundary>
  );
}
