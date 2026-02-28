import React, { useEffect, useMemo, useState, useRef, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import {
  AlertTriangle,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  Coins,
  Copy,
  Eye,
  Languages,
  Loader2,
  Pencil,
  Plus,
  Store,
  Package,
  Truck,
  Trash2,
  Phone,
  Mail,
  Instagram,
  Facebook,
  MessageCircle,
  Link as LinkIcon,
  Globe,
  Building2,
  MapPin,
  Type,
  RefreshCw,
  Utensils,
  Wifi,
} from "lucide-react";
import PartnerShell from "@/components/PartnerShell";
import ImageUploader from "@/components/ImageUploader";
import { useI18n } from "@/components/i18n";
import PageHelpButton from "@/components/PageHelpButton";

/* ============================================================
   CONSTANTS (with i18n support)
   ============================================================ */

// Static constants (no translation needed)
const AVAILABLE_LANGUAGES = [
  { code: "RU", label: "Русский" },
  { code: "EN", label: "English" },
  { code: "KK", label: "Қазақша" },
  { code: "DE", label: "Deutsch" },
  { code: "TR", label: "Türkçe" },
  { code: "ZH", label: "中文" },
  { code: "AR", label: "العربية" },
  { code: "ES", label: "Español" },
  { code: "FR", label: "Français" },
];

const AVAILABLE_CURRENCIES = [
  { code: "KZT", symbol: "₸" },
  { code: "USD", symbol: "$" },
  { code: "EUR", symbol: "€" },
  { code: "RUB", symbol: "₽" },
  { code: "GBP", symbol: "£" },
  { code: "TRY", symbol: "₺" },
  { code: "AED", symbol: "د.إ" },
  { code: "CNY", symbol: "¥" },
];

const DEFAULT_HOURS = {
  mon: { open: "10:00", close: "22:00", active: true },
  tue: { open: "10:00", close: "22:00", active: true },
  wed: { open: "10:00", close: "22:00", active: true },
  thu: { open: "10:00", close: "22:00", active: true },
  fri: { open: "10:00", close: "22:00", active: true },
  sat: { open: "10:00", close: "22:00", active: true },
  sun: { open: "10:00", close: "22:00", active: true },
};

// Dynamic constants (translation functions)
function getChannels(t) {
  return [
    { key: "hall", label: t("settings.channels.hall"), Icon: Store, description: t("settings.channels.hallDesc") },
    { key: "pickup", label: t("settings.channels.pickup"), Icon: Package, description: t("settings.channels.pickupDesc") },
    { key: "delivery", label: t("settings.channels.delivery"), Icon: Truck, description: t("settings.channels.deliveryDesc") },
  ];
}

function getContactTypes(t) {
  return [
    { value: "phone", label: t("settings.contacts.types.phone"), Icon: Phone },
    { value: "email", label: t("settings.contacts.types.email"), Icon: Mail },
    { value: "instagram", label: "Instagram", Icon: Instagram },
    { value: "facebook", label: "Facebook", Icon: Facebook },
    { value: "whatsapp", label: "WhatsApp", Icon: MessageCircle },
    { value: "telegram", label: "Telegram", Icon: MessageCircle },
    { value: "website", label: t("settings.contacts.types.website"), Icon: Globe },
    { value: "other", label: t("settings.contacts.types.other"), Icon: LinkIcon },
  ];
}

function getWeekdays(t) {
  return [
    { key: "mon", label: t("settings.hours.weekdays.monShort"), full: t("settings.hours.weekdays.mon") },
    { key: "tue", label: t("settings.hours.weekdays.tueShort"), full: t("settings.hours.weekdays.tue") },
    { key: "wed", label: t("settings.hours.weekdays.wedShort"), full: t("settings.hours.weekdays.wed") },
    { key: "thu", label: t("settings.hours.weekdays.thuShort"), full: t("settings.hours.weekdays.thu") },
    { key: "fri", label: t("settings.hours.weekdays.friShort"), full: t("settings.hours.weekdays.fri") },
    { key: "sat", label: t("settings.hours.weekdays.satShort"), full: t("settings.hours.weekdays.sat") },
    { key: "sun", label: t("settings.hours.weekdays.sunShort"), full: t("settings.hours.weekdays.sun") },
  ];
}

function getContactViewModes(t) {
  return [
    { value: "icons", label: t("settings.contacts.viewMode.iconsOnly"), Icon: Eye },
    { value: "full", label: t("settings.contacts.viewMode.iconText"), Icon: Type },
  ];
}

function getSectionTabs(t) {
  return [
    { id: "profile", label: t("settings.tabs.profile"), Icon: Building2 },
    { id: "hours", label: t("settings.tabs.hours"), Icon: Clock },
    { id: "channels", label: t("settings.tabs.channels"), Icon: Store },
    { id: "hall", label: t("settings.tabs.hall"), Icon: Utensils },
    { id: "wifi", label: t("settings.tabs.wifi"), Icon: Wifi },
    { id: "languages", label: t("settings.tabs.languages"), Icon: Languages },
    { id: "currencies", label: t("settings.tabs.currencies"), Icon: Coins },
    { id: "contacts", label: t("settings.tabs.contacts"), Icon: Phone },
  ];
}

/* ============================================================
   HELPERS
   ============================================================ */

function normStr(s) {
  return (s ?? "").toString().trim();
}

function sortByOrder(arr) {
  return [...(arr || [])].sort((a, b) => {
    const ao = Number.isFinite(+a?.sort_order) ? +a.sort_order : 1e9;
    const bo = Number.isFinite(+b?.sort_order) ? +b.sort_order : 1e9;
    if (ao !== bo) return ao - bo;
    return normStr(a?.name || a?.label).localeCompare(normStr(b?.name || b?.label), "ru");
  });
}

function getContactIcon(type, t) {
  const CONTACT_TYPES = getContactTypes(t);
  const found = CONTACT_TYPES.find((ct) => ct.value === type);
  return found ? found.Icon : LinkIcon;
}

function parseWorkingHours(raw) {
  const WEEKDAYS_KEYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
  if (!raw || typeof raw === "string") {
    try { raw = JSON.parse(raw); } catch { return { ...DEFAULT_HOURS }; }
  }
  if (!raw || typeof raw !== "object") return { ...DEFAULT_HOURS };
  const result = { ...DEFAULT_HOURS };
  for (const key of WEEKDAYS_KEYS) {
    if (raw[key]) {
      result[key] = {
        open: raw[key].open || "10:00",
        close: raw[key].close || "22:00",
        active: raw[key].active !== false,
      };
    }
  }
  return result;
}

/* ============================================================
   DEBOUNCE HOOK (P1-2: исправленный с cleanup внутри)
   ============================================================ */

function useDebouncedCallback(callback, delay) {
  const timeoutRef = useRef(null);
  const callbackRef = useRef(callback);

  // Обновляем callback ref без пересоздания функции
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  // Cleanup внутри хука
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return useCallback((...args) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      callbackRef.current(...args);
    }, delay);
  }, [delay]);
}

/* ============================================================
   API HELPERS (P1-1: проброс rate limit ошибок)
   ============================================================ */

function isRateLimitError(error) {
  if (!error) return false;
  const msg = (error.message || error.toString() || "").toLowerCase();
  return msg.includes("rate limit") || msg.includes("429") || msg.includes("503");
}

async function getUser() {
  try { 
    return await base44.auth.me(); 
  } catch (e) { 
    // Пробрасываем rate limit, остальные ошибки → null
    if (isRateLimitError(e)) throw e;
    return null; 
  }
}

async function listFor(entity, pid) {
  if (!pid) return [];
  try {
    const res = await base44.entities[entity].filter({ partner: pid });
    return Array.isArray(res) ? res : [];
  } catch (e) {
    // P1-1: Пробрасываем rate limit ошибки
    if (isRateLimitError(e)) throw e;
    return [];
  }
}

// P0-1: Убран Partner.list() fallback — если нет pid, возвращаем null
async function loadPartner(pid) {
  if (!pid) return null;
  try {
    const res = await base44.entities.Partner.get(pid);
    return res || null;
  } catch (e) {
    // P1-1: Пробрасываем rate limit ошибки
    if (isRateLimitError(e)) throw e;
    return null;
  }
}

async function loadPartnerContacts(pid) {
  if (!pid) return null;
  try {
    const list = await listFor("PartnerContacts", pid);
    return list?.[0] || null;
  } catch (e) {
    // P1-1: Пробрасываем rate limit ошибки
    if (isRateLimitError(e)) throw e;
    return null;
  }
}

async function loadWifiConfig(pid) {
  if (!pid) return null;
  try {
    const list = await listFor("WiFiConfig", pid);
    return list?.[0] || null;
  } catch (e) {
    if (isRateLimitError(e)) throw e;
    return null;
  }
}

async function createRec(entity, data) {
  return await base44.entities[entity].create(data);
}

async function updateRec(entity, id, data) {
  return await base44.entities[entity].update(id, data);
}

async function deleteRec(entity, id) {
  return await base44.entities[entity].delete(id);
}

async function createWithPartner(entity, data, pid) {
  return await createRec(entity, { ...data, partner: pid });
}

/* ============================================================
   TOAST HELPERS (P0-2: id = "mm1" — LOCKED)
   ============================================================ */

function showToast(title) {
  toast.success(title, { id: "mm1", duration: 2500 });
}

function showError(title, description) {
  toast.error(description ? `${title}: ${description}` : title, { id: "mm1", duration: 4000 });
}

/* ============================================================
   RATE LIMIT SCREEN
   ============================================================ */

function RateLimitScreen({ onRetry, t }) {
  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <div className="rounded-xl border-2 border-amber-200 bg-amber-50 p-6 text-center">
        <AlertTriangle className="h-12 w-12 mx-auto text-amber-500 mb-4" />
        <h2 className="text-lg font-semibold text-amber-800 mb-2">{t("settings.errors.rateLimit")}</h2>
        <p className="text-sm text-amber-700 mb-4">
          {t("settings.errors.rateLimitDesc")}
        </p>
        <Button onClick={onRetry} variant="outline" className="gap-2">
          <RefreshCw className="h-4 w-4" />
          {t("settings.errors.retry")}
        </Button>
      </div>
    </div>
  );
}

/* ============================================================
   NO PARTNER ACCESS SCREEN (P0-1: показываем если нет partner)
   ============================================================ */

function NoPartnerAccessScreen({ t }) {
  const handleLogin = () => {
    base44.auth.redirectToLogin(window.location.pathname + window.location.search);
  };

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <div className="rounded-xl border-2 border-red-200 bg-red-50 p-6 text-center">
        <AlertTriangle className="h-12 w-12 mx-auto text-red-500 mb-4" />
        <h2 className="text-lg font-semibold text-red-800 mb-2">
          {t("settings.errors.connectionFailed")}
        </h2>
        <Button onClick={handleLogin} variant="outline" className="gap-2 mt-4">
          <RefreshCw className="h-4 w-4" />
          {t("settings.errors.retry")}
        </Button>
      </div>
    </div>
  );
}

/* ============================================================
   SECTION COMPONENTS
   ============================================================ */

function ProfileSection({ partner, setPartner, logoSaved, onLogoChange, t }) {
  return (
    <div id="section-profile" className="rounded-xl border bg-white p-4 sm:p-6 space-y-4 scroll-mt-20">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
          <Building2 className="h-5 w-5" />
        </div>
        <div>
          <h2 className="font-semibold text-lg">{t("settings.profile.title")}</h2>
          <p className="text-sm text-slate-500">{t("settings.profile.subtitle")}</p>
        </div>
      </div>

      {/* Logo with ImageUploader v2 */}
      <div className="space-y-2 pt-2">
        <Label className="text-sm">{t("settings.profile.logo")}</Label>
        <ImageUploader
          value={partner?.logo || ""}
          onChange={onLogoChange}
          placeholder={t("settings.profile.uploadLogo")}
          size={150}
          saved={logoSaved}
        />
      </div>

      {/* Name & Address */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label className="text-sm">{t("settings.profile.name")}</Label>
          <Input 
            value={partner?.name || ""} 
            onChange={(e) => setPartner(p => ({ ...p, name: e.target.value }))} 
            placeholder={t("settings.profile.namePlaceholder")} 
          />
        </div>
        <div className="space-y-2">
          <Label className="text-sm">{t("settings.profile.address")}</Label>
          <div className="relative">
            <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input 
              value={partner?.address || ""} 
              onChange={(e) => setPartner(p => ({ ...p, address: e.target.value }))} 
              placeholder={t("settings.profile.addressPlaceholder")} 
              className="pl-9"
            />
          </div>
        </div>
      </div>

      {/* Map Link — P2: placeholder через t() */}
      <div className="space-y-2">
        <Label className="text-sm">{t("settings.profile.mapLink")}</Label>
        <div className="relative">
          <LinkIcon className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <Input 
            value={partner?.address_map_url || ""} 
            onChange={(e) => setPartner(p => ({ ...p, address_map_url: e.target.value }))} 
            placeholder={t("settings.profile.mapLinkPlaceholder")}
            className="pl-9"
          />
        </div>
        <p className="text-xs text-slate-500">{t("settings.profile.mapLinkHint")}</p>
      </div>

      {/* Save button moved to sticky bar at bottom of viewport */}
    </div>
  );
}

function WorkingHoursSection({ partner, onSave, saving, t }) {
  const WEEKDAYS = useMemo(() => getWeekdays(t), [t]);
  const [hours, setHours] = useState(() => parseWorkingHours(partner?.working_hours));
  const [note, setNote] = useState(partner?.working_hours_note || "");
  const [pendingCount, setPendingCount] = useState(0); // pending counter вместо boolean

  useEffect(() => {
    setHours(parseWorkingHours(partner?.working_hours));
    setNote(partner?.working_hours_note || "");
  }, [partner?.id, partner?.working_hours, partner?.working_hours_note]);

  // P1-2: Debounced auto-save
  const debouncedSave = useDebouncedCallback(
    async (newHours, newNote) => {
      setPendingCount(c => c + 1);
      try {
        await onSave({ working_hours: newHours, working_hours_note: newNote });
      } finally {
        setPendingCount(c => c - 1);
      }
    },
    500
  );

  const handleTimeChange = (day, field, value) => {
    const newHours = { ...hours, [day]: { ...hours[day], [field]: value } };
    setHours(newHours);
  };

  const handleActiveToggle = (day) => {
    const newHours = { ...hours, [day]: { ...hours[day], active: !hours[day].active } };
    setHours(newHours);
    debouncedSave(newHours, note);
  };

  const handleBlur = () => {
    debouncedSave(hours, note);
  };

  const copyToAll = () => {
    const first = hours.mon;
    const newHours = {};
    for (const day of WEEKDAYS) {
      newHours[day.key] = { ...first };
    }
    setHours(newHours);
    debouncedSave(newHours, note);
  };

  const isSaving = saving || pendingCount > 0;

  return (
    <div id="section-hours" className="rounded-xl border bg-white p-4 sm:p-6 space-y-4 scroll-mt-20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-50 text-orange-600">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-semibold text-lg flex items-center gap-2">
              {t("settings.hours.title")}
              {isSaving && <Loader2 className="h-4 w-4 animate-spin text-slate-400" />}
            </h2>
            <p className="text-sm text-slate-500">{t("settings.hours.subtitle")}</p>
          </div>
        </div>
        <Button 
          size="sm" 
          variant="outline" 
          onClick={copyToAll}
          disabled={isSaving}
          className="hidden sm:flex min-h-[44px]"
        >
          <Copy className="mr-1 h-4 w-4" />
          {t("settings.hours.copyToAll")}
        </Button>
      </div>

      <Button 
        size="sm" 
        variant="outline" 
        onClick={copyToAll}
        disabled={isSaving}
        className="w-full sm:hidden min-h-[44px]"
      >
        <Copy className="mr-1 h-4 w-4" />
        {t("settings.hours.copyMonToAll")}
      </Button>

      <div className="space-y-2">
        {WEEKDAYS.map(({ key, label }) => {
          const day = hours[key];
          const isActive = day?.active !== false;
          return (
            <div 
              key={key} 
              className={`flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg border transition ${
                isActive ? "bg-slate-50 border-slate-200" : "bg-slate-100 border-slate-300 opacity-60"
              }`}
            >
              <span className="font-medium text-sm w-8 sm:w-10">{label}</span>
              
              <Input
                type="time"
                value={day?.open || "10:00"}
                onChange={(e) => handleTimeChange(key, "open", e.target.value)}
                onBlur={handleBlur}
                disabled={!isActive || isSaving}
                className="w-24 sm:w-28 h-11 text-sm"
              />
              
              <span className="text-slate-400">—</span>
              
              <Input
                type="time"
                value={day?.close || "22:00"}
                onChange={(e) => handleTimeChange(key, "close", e.target.value)}
                onBlur={handleBlur}
                disabled={!isActive || isSaving}
                className="w-24 sm:w-28 h-11 text-sm"
              />
              
              <div 
                className="flex items-center gap-1 sm:gap-2 ml-auto cursor-pointer min-h-[44px]"
                onClick={() => !isSaving && handleActiveToggle(key)}
              >
                <Checkbox
                  checked={isActive}
                  onCheckedChange={() => handleActiveToggle(key)}
                  onClick={(e) => e.stopPropagation()}
                  disabled={isSaving}
                />
                <span className="text-xs sm:text-sm text-slate-600 hidden sm:inline">
                  {isActive ? t("settings.hours.working") : t("settings.hours.dayOff")}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="space-y-2 pt-2">
        <Label className="text-sm">{t("settings.hours.note")}</Label>
        <Input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          onBlur={handleBlur}
          placeholder={t("settings.hours.notePlaceholder")}
          disabled={isSaving}
        />
        <p className="text-xs text-slate-500">{t("settings.hours.noteHint")}</p>
      </div>
    </div>
  );
}

function ChannelsSection({ partner, onSave, saving, t }) {
  const CHANNELS = useMemo(() => getChannels(t), [t]);
  const [channels, setChannels] = useState({
    hall: partner?.channels_hall_enabled ?? true,
    pickup: partner?.channels_pickup_enabled ?? true,
    delivery: partner?.channels_delivery_enabled ?? true,
  });
  const [localSaving, setLocalSaving] = useState(false);

  useEffect(() => {
    setChannels({
      hall: partner?.channels_hall_enabled ?? true,
      pickup: partner?.channels_pickup_enabled ?? true,
      delivery: partner?.channels_delivery_enabled ?? true,
    });
  }, [partner?.id, partner?.channels_updated_at]);

  const handleToggle = async (key) => {
    const prevChannels = { ...channels };
    const newChannels = { ...channels, [key]: !channels[key] };
    setChannels(newChannels);
    setLocalSaving(true);
    try {
      await onSave(newChannels);
    } catch (e) {
      setChannels(prevChannels); // откат UI при ошибке
    } finally {
      setLocalSaving(false);
    }
  };

  const isSaving = saving || localSaving;

  return (
    <div id="section-channels" className="rounded-xl border bg-white p-4 sm:p-6 space-y-4 scroll-mt-20">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-50 text-green-600">
          <Store className="h-5 w-5" />
        </div>
        <div>
          <h2 className="font-semibold text-lg flex items-center gap-2">
            {t("settings.channels.title")}
            {isSaving && <Loader2 className="h-4 w-4 animate-spin text-slate-400" />}
          </h2>
          <p className="text-sm text-slate-500">{t("settings.channels.subtitle")}</p>
        </div>
      </div>

      <div className="space-y-3 pt-2">
        {CHANNELS.map(({ key, label, Icon, description }) => (
          <div
            key={key}
            onClick={() => !isSaving && handleToggle(key)}
            className={`flex items-center gap-3 p-3 rounded-lg border bg-slate-50 hover:bg-slate-100 cursor-pointer transition-colors ${isSaving ? "opacity-50 pointer-events-none" : ""}`}
          >
            <div className={`flex h-10 w-10 items-center justify-center rounded-full border ${channels[key] ? "bg-green-50 border-green-200 text-green-600" : "bg-slate-100 border-slate-200 text-slate-400"}`}>
              <Icon className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <div className="font-medium">{label}</div>
              <div className="text-sm text-slate-500">{description}</div>
            </div>
            <Checkbox 
              checked={channels[key]} 
              onCheckedChange={() => handleToggle(key)}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        ))}
      </div>
      <div className="text-xs text-slate-500">{t("settings.common.autoSave")}</div>
    </div>
  );
}

// HallOrderingSection — Hall variant C (HALL-017) + Table Code Settings
function HallOrderingSection({ partner, onSave, saving, t }) {
  const [guestCodeEnabled, setGuestCodeEnabled] = useState(!!partner?.hall_guest_code_enabled);
  const [codeLength, setCodeLength] = useState(partner?.table_code_length || 5);
  const [maxAttempts, setMaxAttempts] = useState(partner?.table_code_max_attempts || 3);
  const [cooldownSeconds, setCooldownSeconds] = useState(partner?.table_code_cooldown_seconds || 60);
  const [localSaving, setLocalSaving] = useState(false);
  const [hasCodeChanges, setHasCodeChanges] = useState(false);

  useEffect(() => {
    setGuestCodeEnabled(!!partner?.hall_guest_code_enabled);
    setCodeLength(partner?.table_code_length || 5);
    setMaxAttempts(partner?.table_code_max_attempts || 3);
    setCooldownSeconds(partner?.table_code_cooldown_seconds || 60);
    setHasCodeChanges(false);
  }, [partner?.id, partner?.hall_guest_code_enabled, partner?.table_code_length, partner?.table_code_max_attempts, partner?.table_code_cooldown_seconds]);

  const handleToggle = async (checked) => {
    // Нормализация: shadcn Checkbox может вернуть "indeterminate"
    const next = checked === true;
    const prev = guestCodeEnabled;
    
    setGuestCodeEnabled(next);
    setLocalSaving(true);
    try {
      await onSave({ hall_guest_code_enabled: next });
    } catch (e) {
      setGuestCodeEnabled(prev); // откат UI при ошибке
      // Ошибка покажется через showError в onSave
    } finally {
      setLocalSaving(false);
    }
  };

  const handleCodeSave = async () => {
    const prev = { codeLength, maxAttempts, cooldownSeconds };
    setLocalSaving(true);
    try {
      await onSave({ 
        table_code_length: codeLength,
        table_code_max_attempts: maxAttempts,
        table_code_cooldown_seconds: cooldownSeconds
      });
      setHasCodeChanges(false);
    } catch (e) {
      setCodeLength(prev.codeLength);
      setMaxAttempts(prev.maxAttempts);
      setCooldownSeconds(prev.cooldownSeconds);
      throw e;
    } finally {
      setLocalSaving(false);
    }
  };

  const isSaving = saving || localSaving;

  return (
    <div id="section-hall" className="rounded-xl border bg-white p-4 sm:p-6 space-y-4 scroll-mt-20">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-50 text-amber-600">
          <Utensils className="h-5 w-5" />
        </div>
        <div>
          <h2 className="font-semibold text-lg flex items-center gap-2">
            {t("settings.hall.title")}
            {isSaving && <Loader2 className="h-4 w-4 animate-spin text-slate-400" />}
          </h2>
          <p className="text-sm text-slate-500">{t("settings.hall.description")}</p>
        </div>
      </div>

      {/* Table Code Verification Settings */}
      <div className="space-y-3 pt-2 pb-2 border-b">
        <Label className="text-sm font-medium">{t("settings.hall.code_settings")}</Label>
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="space-y-1.5">
            <Label className="text-xs text-slate-600">{t("settings.hall.code_length")}</Label>
            <Input
              type="number"
              min={3}
              max={8}
              value={codeLength}
              onChange={(e) => {
                const val = Math.max(3, Math.min(8, parseInt(e.target.value) || 5));
                setCodeLength(val);
                setHasCodeChanges(true);
              }}
              className="h-11 text-sm"
              disabled={isSaving}
            />
            <p className="text-xs text-slate-500">{t("settings.hall.code_length_hint")}</p>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-slate-600">{t("settings.hall.max_attempts")}</Label>
            <Input
              type="number"
              min={1}
              max={10}
              value={maxAttempts}
              onChange={(e) => {
                const val = Math.max(1, Math.min(10, parseInt(e.target.value) || 3));
                setMaxAttempts(val);
                setHasCodeChanges(true);
              }}
              className="h-11 text-sm"
              disabled={isSaving}
            />
            <p className="text-xs text-slate-500">{t("settings.hall.max_attempts_hint")}</p>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-slate-600">{t("settings.hall.cooldown_seconds")}</Label>
            <Input
              type="number"
              min={0}
              max={600}
              value={cooldownSeconds}
              onChange={(e) => {
                const val = Math.max(0, Math.min(600, parseInt(e.target.value) || 60));
                setCooldownSeconds(val);
                setHasCodeChanges(true);
              }}
              className="h-11 text-sm"
              disabled={isSaving}
            />
            <p className="text-xs text-slate-500">{t("settings.hall.cooldown_hint")}</p>
          </div>
        </div>

        {hasCodeChanges && (
          <Button
            size="sm"
            onClick={handleCodeSave}
            disabled={isSaving}
            className="w-full sm:w-auto min-h-[44px]"
          >
            {isSaving ? (
              <><Loader2 className="h-4 w-4 mr-2 animate-spin" />{t("common.saving")}</>
            ) : (
              <><Check className="h-4 w-4 mr-2" />{t("common.save")}</>
            )}
          </Button>
        )}
      </div>

      <div className="space-y-1 pt-2">
        <Label className="text-sm font-medium">{t("settings.hall.extra_methods")}</Label>
      </div>

      <div className="space-y-4">
        {/* Guest Code Checkbox */}
        <label 
          className={`flex items-start space-x-3 p-3 rounded-lg border bg-slate-50 hover:bg-slate-100 cursor-pointer transition-colors ${isSaving ? "opacity-50 pointer-events-none" : ""}`}
          onClick={(e) => {
            if (e.target.closest('[role="checkbox"]')) return;
            handleToggle(!guestCodeEnabled);
          }}
        >
          <Checkbox
            id="hall_guest_code"
            checked={guestCodeEnabled}
            onCheckedChange={handleToggle}
            disabled={isSaving}
          />
          <div className="grid gap-1.5 leading-none">
            <span className="font-medium">
              {t("settings.hall.guest_code")}
            </span>
            <p className="text-sm text-muted-foreground">
              {t("settings.hall.guest_code_desc")}
            </p>
          </div>
        </label>
      </div>

      <div className="text-xs text-slate-500">{t("settings.common.autoSave")}</div>
    </div>
  );
}

// WifiSection — Wi-Fi verification and plan display
function WifiSection({ partner, wifiConfig, onSave, saving, t }) {
  const [enabled, setEnabled] = useState(wifiConfig?.enabled ?? false);
  const [ssid, setSsid] = useState(wifiConfig?.ssid || "");
  const [password, setPassword] = useState(wifiConfig?.password || "");
  const [securityType, setSecurityType] = useState(wifiConfig?.security_type || "wpa2");
  const [showPassword, setShowPassword] = useState(false);
  const [localSaving, setLocalSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Sync state when wifiConfig changes
  useEffect(() => {
    setEnabled(wifiConfig?.enabled ?? false);
    setSsid(wifiConfig?.ssid || "");
    setPassword(wifiConfig?.password || "");
    setSecurityType(wifiConfig?.security_type || "wpa2");
    setHasChanges(false);
  }, [wifiConfig?.id, wifiConfig?.enabled, wifiConfig?.ssid, wifiConfig?.password, wifiConfig?.security_type]);

  const isPaid = partner?.plan_tier === "paid";
  const isSaving = saving || localSaving;

  const handleSave = async () => {
    setLocalSaving(true);
    try {
      await onSave({ enabled, ssid, password, security_type: securityType });
      setHasChanges(false);
    } catch (e) {
      // Error handled in parent
    } finally {
      setLocalSaving(false);
    }
  };

  const markChanged = () => setHasChanges(true);

  return (
    <div id="section-wifi" className="rounded-xl border bg-white p-4 sm:p-6 space-y-4 scroll-mt-20">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-600">
          <Wifi className="h-5 w-5" />
        </div>
        <div>
          <h2 className="font-semibold text-lg flex items-center gap-2">
            {t("settings.wifi.title")}
            {isSaving && <Loader2 className="h-4 w-4 animate-spin text-slate-400" />}
          </h2>
          <p className="text-sm text-slate-500">{t("settings.wifi.subtitle")}</p>
        </div>
      </div>

      {/* Plan Badge */}
      <div className="flex items-center gap-3 pt-2">
        <span className="text-sm font-medium text-slate-600">{t("settings.wifi.planLabel")}</span>
        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
          isPaid 
            ? "bg-green-100 text-green-700" 
            : "bg-gray-100 text-gray-600"
        }`}>
          {isPaid ? t("settings.wifi.planPaid") : t("settings.wifi.planFree")}
        </span>
      </div>

      {isPaid ? (
        /* Paid Plan - No WiFi config needed */
        <div className="p-4 rounded-lg bg-green-50 border border-green-200">
          <p className="text-sm text-green-700">
            {t("settings.wifi.paidDesc")}
          </p>
        </div>
      ) : (
        /* Free Plan - WiFi Configuration Form */
        <div className="space-y-4">
          <div className="p-4 rounded-lg bg-amber-50 border border-amber-200">
            <p className="text-sm text-amber-700">
              {t("settings.wifi.freeDesc")}
            </p>
          </div>

          {/* Enable WiFi Checkbox */}
          <label 
            className={`flex items-start space-x-3 p-3 rounded-lg border bg-slate-50 hover:bg-slate-100 cursor-pointer transition-colors ${isSaving ? "opacity-50 pointer-events-none" : ""}`}
            onClick={(e) => {
              if (e.target.closest('[role="checkbox"]')) return;
              setEnabled(!enabled);
              markChanged();
            }}
          >
            <Checkbox
              id="wifi_enabled"
              checked={enabled}
              onCheckedChange={(checked) => {
                setEnabled(checked === true);
                markChanged();
              }}
              disabled={isSaving}
            />
            <div className="grid gap-1.5 leading-none">
              <span className="font-medium">
                {t("settings.wifi.enableWifi")}
              </span>
              <p className="text-sm text-muted-foreground">
                {t("settings.wifi.enableWifiDesc")}
              </p>
            </div>
          </label>

          {/* WiFi Config Fields (shown when enabled) */}
          {enabled && (
            <div className="space-y-4 pt-2">
              {/* SSID */}
              <div className="space-y-2">
                <Label htmlFor="wifi_ssid">{t("settings.wifi.ssid")}</Label>
                <Input
                  id="wifi_ssid"
                  value={ssid}
                  onChange={(e) => { setSsid(e.target.value); markChanged(); }}
                  placeholder={t("settings.wifi.ssidPlaceholder")}
                  disabled={isSaving}
                />
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="wifi_password">{t("settings.wifi.password")}</Label>
                <div className="relative">
                  <Input
                    id="wifi_password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); markChanged(); }}
                    placeholder={t("settings.wifi.passwordPlaceholder")}
                    disabled={isSaving}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-0 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 flex items-center justify-center min-h-[44px] min-w-[44px]"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Security Type */}
              <div className="space-y-2">
                <Label htmlFor="wifi_security">{t("settings.wifi.security")}</Label>
                <Select
                  value={securityType}
                  onValueChange={(v) => { setSecurityType(v); markChanged(); }}
                  disabled={isSaving}
                >
                  <SelectTrigger id="wifi_security">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="wpa2">{t("settings.wifi.securityWpa2")}</SelectItem>
                    <SelectItem value="wpa3">{t("settings.wifi.securityWpa3")}</SelectItem>
                    <SelectItem value="open">{t("settings.wifi.securityOpen")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Save Button */}
              <div className="pt-2">
                <Button
                  onClick={handleSave}
                  disabled={isSaving || !hasChanges}
                  className="w-full sm:w-auto min-h-[44px]"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      {t("common.saving")}
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      {t("common.save")}
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function LanguagesSection({ partner, onSave, saving, t }) {
  const [defaultLang, setDefaultLang] = useState(partner?.default_language || "RU");
  const [enabledLangs, setEnabledLangs] = useState(() => {
    const saved = partner?.enabled_languages;
    return Array.isArray(saved) && saved.length > 0 ? saved : ["RU"];
  });
  const [pendingCount, setPendingCount] = useState(0); // pending counter вместо boolean

  useEffect(() => {
    setDefaultLang(partner?.default_language || "RU");
    const saved = partner?.enabled_languages;
    setEnabledLangs(Array.isArray(saved) && saved.length > 0 ? saved : ["RU"]);
  }, [partner?.id, partner?.default_language, partner?.enabled_languages]);

  // P1-2: Debounced auto-save
  const debouncedSave = useDebouncedCallback(
    async (newDefault, newEnabled) => {
      setPendingCount(c => c + 1);
      try {
        await onSave({ default_language: newDefault, enabled_languages: newEnabled });
      } finally {
        setPendingCount(c => c - 1);
      }
    },
    500
  );

  // BUG-PS-008 FIX: Compute outside state setter to avoid stale closure
  const toggleLang = (code) => {
    const set = new Set(enabledLangs);
    if (set.has(code)) {
      if (set.size <= 1 || code === defaultLang) return;
      set.delete(code);
    } else {
      set.add(code);
    }
    const newEnabled = Array.from(set);
    setEnabledLangs(newEnabled);
    debouncedSave(defaultLang, newEnabled);
  };

  const handleDefaultChange = (code) => {
    setDefaultLang(code);
    const newEnabled = Array.from(new Set([...enabledLangs, code]));
    setEnabledLangs(newEnabled);
    debouncedSave(code, newEnabled);
  };

  const isSaving = saving || pendingCount > 0;

  return (
    <div id="section-languages" className="rounded-xl border bg-white p-4 sm:p-6 space-y-4 scroll-mt-20">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-600">
          <Languages className="h-5 w-5" />
        </div>
        <div>
          <h2 className="font-semibold text-lg flex items-center gap-2">
            {t("settings.languages.title")}
            {isSaving && <Loader2 className="h-4 w-4 animate-spin text-slate-400" />}
          </h2>
          <p className="text-sm text-slate-500">{t("settings.languages.subtitle")}</p>
        </div>
      </div>

      <div className="space-y-4 pt-2">
        <div className="space-y-2">
          <Label className="text-sm">{t("settings.languages.defaultLang")}</Label>
          <Select value={defaultLang} onValueChange={handleDefaultChange} disabled={isSaving}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {AVAILABLE_LANGUAGES.map((l) => (
                <SelectItem key={l.code} value={l.code}>{l.code} — {l.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label className="text-sm">{t("settings.languages.availableLangs")}</Label>
          <div className="flex flex-wrap gap-2">
            {AVAILABLE_LANGUAGES.map((l) => {
              const isEnabled = enabledLangs.includes(l.code);
              const isDefault = l.code === defaultLang;
              return (
                <button
                  key={l.code}
                  type="button"
                  onClick={() => toggleLang(l.code)}
                  disabled={isDefault || isSaving}
                  className={`px-3 py-2 rounded-lg border text-sm font-medium transition flex items-center gap-2 min-h-[44px] ${isEnabled ? "bg-indigo-50 border-indigo-200 text-indigo-700" : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"} ${isDefault ? "ring-2 ring-indigo-400 ring-offset-1" : ""} ${isSaving ? "opacity-50" : ""}`}
                >
                  {isEnabled && <Check className="h-3.5 w-3.5" />}
                  {l.code}
                  {isDefault && <span className="text-xs opacity-60">({t("settings.languages.default")})</span>}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function CurrenciesSection({ partner, onSave, saving, t }) {
  const [defaultCurrency, setDefaultCurrency] = useState(partner?.default_currency || "KZT");
  const [enabledCurrencies, setEnabledCurrencies] = useState(() => {
    const saved = partner?.enabled_currencies;
    return Array.isArray(saved) && saved.length > 0 ? saved : ["KZT"];
  });
  const [rates, setRates] = useState(() => partner?.currency_rates || {});
  // BUG-PS-005 FIX: Ref to always have fresh rates for onBlur handler
  const ratesRef = useRef(rates);
  useEffect(() => { ratesRef.current = rates; }, [rates]);
  const [pendingCount, setPendingCount] = useState(0); // pending counter вместо boolean
  const [customCurrency, setCustomCurrency] = useState("");

  useEffect(() => {
    setDefaultCurrency(partner?.default_currency || "KZT");
    const saved = partner?.enabled_currencies;
    setEnabledCurrencies(Array.isArray(saved) && saved.length > 0 ? saved : ["KZT"]);
    setRates(partner?.currency_rates || {});
  }, [partner?.id, partner?.default_currency, partner?.enabled_currencies, partner?.currency_rates]);

  // P1-2: Debounced auto-save
  const debouncedSave = useDebouncedCallback(
    async (newDefault, newEnabled, newRates) => {
      setPendingCount(c => c + 1);
      try {
        await onSave({ default_currency: newDefault, enabled_currencies: newEnabled, currency_rates: newRates });
      } finally {
        setPendingCount(c => c - 1);
      }
    },
    500
  );

  // BUG-PS-008 FIX: Compute outside state setter to avoid stale closure
  const toggleCurrency = (code) => {
    const set = new Set(enabledCurrencies);
    if (set.has(code)) {
      if (set.size <= 1 || code === defaultCurrency) return;
      set.delete(code);
    } else {
      set.add(code);
    }
    const newEnabled = Array.from(set);
    setEnabledCurrencies(newEnabled);
    debouncedSave(defaultCurrency, newEnabled, ratesRef.current);
  };

  const handleDefaultChange = (code) => {
    setDefaultCurrency(code);
    const newEnabled = Array.from(new Set([...enabledCurrencies, code]));
    setEnabledCurrencies(newEnabled);
    debouncedSave(code, newEnabled, rates);
  };

  // BUG-PS-005 FIX: Pass updated rates directly to avoid stale closure
  const handleRateChange = (code, value) => {
    const num = parseFloat(value) || 0;
    const newRates = { ...rates, [code]: num };
    setRates(newRates);
  };

  // BUG-PS-005 FIX: Read from ref to get post-setRates value on blur
  const saveRate = () => debouncedSave(defaultCurrency, enabledCurrencies, ratesRef.current);

  const addCustomCurrency = () => {
    const code = customCurrency.trim().toUpperCase();
    if (code.length < 2 || code.length > 4 || enabledCurrencies.includes(code)) return;
    const newEnabled = [...enabledCurrencies, code];
    setEnabledCurrencies(newEnabled);
    setCustomCurrency("");
    debouncedSave(defaultCurrency, newEnabled, rates);
  };

  const isSaving = saving || pendingCount > 0;
  const defaultSymbol = AVAILABLE_CURRENCIES.find(c => c.code === defaultCurrency)?.symbol || defaultCurrency;

  return (
    <div id="section-currencies" className="rounded-xl border bg-white p-4 sm:p-6 space-y-4 scroll-mt-20">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-50 text-amber-600">
          <Coins className="h-5 w-5" />
        </div>
        <div>
          <h2 className="font-semibold text-lg flex items-center gap-2">
            {t("settings.currencies.title")}
            {isSaving && <Loader2 className="h-4 w-4 animate-spin text-slate-400" />}
          </h2>
          <p className="text-sm text-slate-500">{t("settings.currencies.subtitle")}</p>
        </div>
      </div>

      <div className="space-y-4 pt-2">
        <div className="space-y-2">
          <Label className="text-sm">{t("settings.currencies.defaultCurrency")}</Label>
          <Select value={defaultCurrency} onValueChange={handleDefaultChange} disabled={isSaving}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {AVAILABLE_CURRENCIES.map((c) => (
                <SelectItem key={c.code} value={c.code}>{c.symbol} {c.code}</SelectItem>
              ))}
              {enabledCurrencies.filter(code => !AVAILABLE_CURRENCIES.find(c => c.code === code)).map(code => (
                <SelectItem key={code} value={code}>{code}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-sm">{t("settings.currencies.additionalCurrencies")}</Label>
          <div className="space-y-2">
            {enabledCurrencies.filter(code => code !== defaultCurrency).map((code) => {
              const curr = AVAILABLE_CURRENCIES.find(c => c.code === code);
              const symbol = curr?.symbol || code;
              const rateValue = rates[code];
              const hasValidRate = rateValue && rateValue > 0;
              return (
                <div key={code} className={`flex items-center gap-2 p-2 rounded-lg border ${hasValidRate ? "bg-slate-50 border-slate-200" : "bg-amber-50 border-amber-300"}`}>
                  <span className="font-medium text-sm w-16">{symbol} {code}</span>
                  <span className="text-sm text-slate-500">=</span>
                  <Input 
                    type="number" 
                    value={rateValue || ""} 
                    onChange={(e) => handleRateChange(code, e.target.value)} 
                    onBlur={saveRate} 
                    className={`w-24 h-11 text-sm ${!hasValidRate ? "border-amber-400" : ""}`}
                    placeholder={t("settings.currencies.ratePlaceholder")}
                  />
                  <span className="text-sm text-slate-500">{defaultSymbol}</span>
                  {!hasValidRate && <span className="text-xs text-amber-600">← {t("settings.currencies.specifyRate")}</span>}
                  <button 
                    type="button" 
                    onClick={() => toggleCurrency(code)} 
                    disabled={isSaving} 
                    className="text-red-500 hover:text-red-700 p-2.5 ml-auto flex items-center justify-center min-w-[44px] min-h-[44px]"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              );
            })}
          </div>
          <div className="flex flex-wrap gap-2 mt-3">
            {AVAILABLE_CURRENCIES.filter(c => !enabledCurrencies.includes(c.code)).slice(0, 4).map((c) => (
              <button 
                key={c.code} 
                type="button" 
                onClick={() => toggleCurrency(c.code)} 
                disabled={isSaving} 
                className="px-3 py-2.5 rounded-lg border text-sm font-medium bg-white border-slate-200 text-slate-600 hover:border-indigo-300 hover:bg-indigo-50 transition flex items-center gap-1 min-h-[44px]"
              >
                <Plus className="h-3 w-3" />{c.symbol} {c.code}
              </button>
            ))}
            <div className="flex items-center gap-1">
              <Input 
                value={customCurrency} 
                onChange={(e) => setCustomCurrency(e.target.value.toUpperCase())} 
                placeholder={t("settings.currencies.code")} 
                className="w-16 h-11 text-sm text-center"
                maxLength={4} 
              />
              <Button 
                size="sm" 
                variant="outline" 
                onClick={addCustomCurrency} 
                disabled={isSaving || customCurrency.length < 2} 
                className="min-h-[44px] px-3"
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ContactsSection({ 
  contacts, 
  contactSettings, 
  onAdd, 
  onEdit, 
  onDelete, 
  onViewModeChange,
  saving, 
  apiReady,
  t
}) {
  const CONTACT_VIEW_MODES = useMemo(() => getContactViewModes(t), [t]);
  const viewMode = contactSettings?.view_mode || "full";

  return (
    <div id="section-contacts" className="rounded-xl border bg-white p-4 sm:p-6 space-y-4 scroll-mt-20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-50 text-purple-600">
            <Phone className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-semibold text-lg">{t("settings.contacts.title")}{contacts.length > 0 && ` (${contacts.length})`}</h2>
            <p className="text-sm text-slate-500">{t("settings.contacts.subtitle")}</p>
          </div>
        </div>
        <Button size="sm" variant="outline" onClick={onAdd} disabled={!apiReady || saving} className="min-h-[44px]">
          <Plus className="mr-1 h-4 w-4" />{t("settings.common.add")}
        </Button>
      </div>

      {/* View Mode Toggle */}
      <div className="space-y-2">
        <Label className="text-sm">{t("settings.contacts.displayInMenu")}</Label>
        <div className="flex gap-2">
          {CONTACT_VIEW_MODES.map(({ value, label, Icon }) => (
            <button
              key={value}
              type="button"
              onClick={() => onViewModeChange(value)}
              disabled={saving}
              className={`flex-1 px-3 py-2 rounded-lg border text-sm font-medium transition flex items-center justify-center gap-2 min-h-[44px] ${
                viewMode === value 
                  ? "bg-indigo-50 border-indigo-300 text-indigo-700" 
                  : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
              } ${saving ? "opacity-50" : ""}`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>
        <p className="text-xs text-slate-500">
          {viewMode === "icons" 
            ? t("settings.contacts.viewMode.iconsOnlyHint") 
            : t("settings.contacts.viewMode.iconTextHint")}
        </p>
      </div>

      {/* Preview */}
      {contacts.length > 0 && (
        <div className="space-y-1">
          <Label className="text-xs text-slate-400">{t("settings.contacts.preview")}</Label>
          <div className="flex flex-wrap gap-2 p-3 rounded-lg bg-slate-100">
            {contacts.map((c) => {
              const Icon = getContactIcon(c.type, t);
              const displayText = c.url?.replace(/^(https?:\/\/)?(www\.)?/, "").split("/")[0] || c.label;
              return (
                <div 
                  key={c.id} 
                  className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-white border text-sm"
                >
                  <Icon className="h-4 w-4 text-slate-600" />
                  {viewMode === "full" && (
                    <span className="text-slate-700 truncate max-w-[120px]">{displayText}</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Contact List */}
      {contacts.length === 0 ? (
        <div className="rounded-lg border-2 border-dashed bg-slate-50 p-6 text-center">
          <Phone className="h-8 w-8 mx-auto text-slate-300 mb-2" />
          <div className="text-sm text-slate-500">{t("settings.contacts.noContacts")}</div>
          <Button variant="link" size="sm" className="mt-2" onClick={onAdd}>
            {t("settings.contacts.addFirst")}
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          {contacts.map((c) => {
            const CONTACT_TYPES = getContactTypes(t);
            const Icon = getContactIcon(c.type, t);
            const typeLabel = CONTACT_TYPES.find(ct => ct.value === c.type)?.label || c.type;
            return (
              <div key={c.id} className="flex items-center gap-3 p-3 rounded-lg border bg-slate-50 hover:bg-slate-100 transition">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white border">
                  <Icon className="h-5 w-5 text-slate-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{c.label || typeLabel}</div>
                  <div className="text-sm text-slate-500 truncate">{c.url}</div>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-11 w-11" onClick={() => onEdit(c)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-11 w-11 text-red-600 hover:bg-red-50" onClick={() => onDelete(c)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ============================================================
   SECTION NAVIGATION (P1-3: useMemo для стабилизации)
   ============================================================ */

function SectionNav({ activeSection, t }) {
  // P1-3: useMemo для стабильного массива
  const SECTION_TABS = useMemo(() => getSectionTabs(t), [t]);
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [needsScroll, setNeedsScroll] = useState(false);

  const checkScrollPosition = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    
    const { scrollLeft, scrollWidth, clientWidth } = el;
    const threshold = 5;
    
    const hasOverflow = scrollWidth > clientWidth + threshold;
    setNeedsScroll(hasOverflow);
    setCanScrollLeft(scrollLeft > threshold);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - threshold);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    checkScrollPosition();
    el.addEventListener("scroll", checkScrollPosition);
    window.addEventListener("resize", checkScrollPosition);

    return () => {
      el.removeEventListener("scroll", checkScrollPosition);
      window.removeEventListener("resize", checkScrollPosition);
    };
  }, [checkScrollPosition]);

  useEffect(() => {
    const timer = setTimeout(checkScrollPosition, 50);
    return () => clearTimeout(timer);
  }, [SECTION_TABS, checkScrollPosition]);

  const scrollToSection = (id) => {
    const el = document.getElementById(`section-${id}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const scrollTabs = (direction) => {
    const el = scrollRef.current;
    if (!el) return;
    
    const scrollAmount = 200;
    el.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth"
    });
  };

  return (
    <div className="sm:sticky sm:top-[60px] z-10 bg-slate-50 border-b mb-4">
      <div className="flex items-center gap-2 px-3 py-3 md:px-6">
        {/* Left arrow — P2: aria-label через t() */}
        {needsScroll && (
          <button
            type="button"
            onClick={() => scrollTabs("left")}
            disabled={!canScrollLeft}
            className={`hidden sm:flex flex-shrink-0 items-center justify-center w-11 h-11 rounded-full border transition-all ${
              canScrollLeft 
                ? "bg-white hover:bg-slate-100 text-slate-700 shadow-sm border-slate-200 cursor-pointer" 
                : "bg-slate-100 text-slate-300 border-slate-200 cursor-not-allowed"
            }`}
            aria-label={t("settings.nav.scrollLeft")}
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        )}

        <div className="relative flex-1 min-w-0">
          {canScrollLeft && (
            <div className="hidden sm:block absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-slate-50 to-transparent z-10 pointer-events-none" />
          )}

          <div
            ref={scrollRef}
            className="flex justify-start sm:justify-start gap-2 sm:gap-3 overflow-x-auto scrollbar-hide scroll-smooth py-0.5"
          >
            {SECTION_TABS.map(({ id, label, Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => scrollToSection(id)}
                title={label}
                className={`flex items-center justify-center gap-2 px-3 sm:px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all min-h-[44px] ${
                  activeSection === id
                    ? "bg-indigo-100 text-indigo-700 shadow-sm"
                    : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300 hover:shadow-sm"
                }`}
              >
                <Icon className="h-5 w-5 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">{label}</span>
              </button>
            ))}
          </div>

          {canScrollRight && (
            <div className="hidden sm:block absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-slate-50 to-transparent z-10 pointer-events-none" />
          )}
        </div>

        {/* Right arrow — P2: aria-label через t() */}
        {needsScroll && (
          <button
            type="button"
            onClick={() => scrollTabs("right")}
            disabled={!canScrollRight}
            className={`hidden sm:flex flex-shrink-0 items-center justify-center w-11 h-11 rounded-full border transition-all ${
              canScrollRight 
                ? "bg-white hover:bg-slate-100 text-slate-700 shadow-sm border-slate-200 cursor-pointer" 
                : "bg-slate-100 text-slate-300 border-slate-200 cursor-not-allowed"
            }`}
            aria-label={t("settings.nav.scrollRight")}
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        )}
      </div>
    </div>
  );
}

/* ============================================================
   MAIN COMPONENT
   ============================================================ */

export default function PartnerSettings() {
  const { t } = useI18n();
  
  // Core state
  const [loading, setLoading] = useState(true);
  // BUG-PS-001/002 FIX: Replace boolean with counter to avoid early unlock on overlapping saves
  const [savingCount, setSavingCount] = useState(0);
  const saving = savingCount > 0;
  const [rateLimitHit, setRateLimitHit] = useState(false);
  const [loadError, setLoadError] = useState(null);
  const [user, setUser] = useState(null);
  const [partner, setPartner] = useState(null);
  const [contactsRaw, setContactsRaw] = useState([]);
  const [contactSettings, setContactSettings] = useState(null);
  const [wifiConfig, setWifiConfig] = useState(null);
  const [activeSection, setActiveSection] = useState("profile");
  
  // Logo save state
  const [logoSaved, setLogoSaved] = useState(true);
  const [initialLogo, setInitialLogo] = useState(null);

  // Sticky save bar: track last-saved profile values for dirty detection
  const savedProfileRef = useRef(null);

  // Dialog state
  const [contactDialog, setContactDialog] = useState(false);
  const [contactForm, setContactForm] = useState({ id: null, type: "phone", label: "", url: "" });

  // P0-1: Только canonical partner key, без fallback chain
  const pid = user?.partner || "";
  const apiReady = !!base44?.entities && !!pid;
  const contacts = useMemo(() => sortByOrder(contactsRaw), [contactsRaw]);

  // P1-12: Sequence counters для защиты от out-of-order ответов в debounced секциях
  const saveSeq = useRef({ hours: 0, languages: 0, currencies: 0 });

  // P1-3: useMemo для стабильного массива
  const SECTION_TABS = useMemo(() => getSectionTabs(t), [t]);
  const CONTACT_TYPES = useMemo(() => getContactTypes(t), [t]);

  // Scroll spy for active section
  useEffect(() => {
    const handleScroll = () => {
      const sections = SECTION_TABS.map(tab => ({
        id: tab.id,
        el: document.getElementById(`section-${tab.id}`)
      })).filter(s => s.el);

      const scrollTop = window.scrollY + 120;
      
      for (let i = sections.length - 1; i >= 0; i--) {
        if (sections[i].el.offsetTop <= scrollTop) {
          setActiveSection(sections[i].id);
          break;
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [SECTION_TABS]);

  // Data loading
  async function reload() {
    setLoading(true);
    setLoadError(null);
    try {
      const u = await getUser();
      setUser(u);
      // P0-1: Только canonical partner key
      const pId = u?.partner || "";
      const [p, contactsList, contactsSettingsData, wifiData] = await Promise.all([
        loadPartner(pId),
        listFor("PartnerContactLink", pId).catch((e) => { if (isRateLimitError(e)) throw e; return []; }),
        loadPartnerContacts(pId).catch((e) => { if (isRateLimitError(e)) throw e; return null; }),
        loadWifiConfig(pId).catch((e) => { if (isRateLimitError(e)) throw e; return null; }),
      ]);
      setPartner(p);
      setInitialLogo(p?.logo || null);
      setLogoSaved(true);
      savedProfileRef.current = { name: p?.name || "", address: p?.address || "", logo: p?.logo || "", address_map_url: p?.address_map_url || "" };
      setContactsRaw(contactsList || []);
      setContactSettings(contactsSettingsData);
      setWifiConfig(wifiData);
      setRateLimitHit(false);
    } catch (e) {
      // P1-1: Rate limit теперь пробрасывается из API helpers
      if (isRateLimitError(e)) {
        setRateLimitHit(true);
      } else {
        setLoadError(String(e?.message || e));
        showError(t("settings.errors.loadError"), String(e?.message || e));
      }
    } finally {
      setLoading(false);
    }
  }

  const handleRetry = () => {
    setRateLimitHit(false);
    setLoadError(null);
    reload();
  };

  useEffect(() => { reload(); }, []);

  const handleLogoChange = (url) => {
    setPartner(p => ({ ...p, logo: url }));
    setLogoSaved(url === initialLogo);
  };

  // Sticky save bar: detect unsaved profile changes
  const hasProfileChanges = !loading && !!partner && !!savedProfileRef.current && (
    (partner.name || "") !== (savedProfileRef.current.name || "") ||
    (partner.address || "") !== (savedProfileRef.current.address || "") ||
    (partner.logo || "") !== (savedProfileRef.current.logo || "") ||
    (partner.address_map_url || "") !== (savedProfileRef.current.address_map_url || "")
  );

  const discardProfileChanges = () => {
    if (savedProfileRef.current) {
      setPartner(p => ({ ...p, ...savedProfileRef.current }));
      setInitialLogo(savedProfileRef.current.logo || null);
      setLogoSaved(true);
    }
  };

  // Partner saves
  async function saveProfile() {
    if (!partner?.id) return;
    setSavingCount(c => c + 1);
    try {
      await updateRec("Partner", partner.id, { 
        name: partner?.name, 
        address: partner?.address,
        logo: partner?.logo || null,
        address_map_url: partner?.address_map_url || null,
      });
      setInitialLogo(partner?.logo || null);
      setLogoSaved(true);
      savedProfileRef.current = { name: partner?.name || "", address: partner?.address || "", logo: partner?.logo || "", address_map_url: partner?.address_map_url || "" };
      showToast(t("settings.toasts.profileSaved"));
    } catch (e) {
      showError(t("settings.errors.error"), String(e?.message || e));
    } finally {
      setSavingCount(c => c - 1);
    }
  }

  async function saveWorkingHours(data) {
    if (!partner?.id) return;
    const seq = ++saveSeq.current.hours;
    setSavingCount(c => c + 1);
    try {
      await updateRec("Partner", partner.id, data);
      if (seq !== saveSeq.current.hours) return; // устаревший ответ — игнор
      setPartner(prev => ({ ...prev, ...data }));
      showToast(t("settings.toasts.hoursSaved"));
    } catch (e) {
      if (seq !== saveSeq.current.hours) return; // устаревшая ошибка — игнор
      showError(t("settings.errors.error"), String(e?.message || e));
    } finally {
      setSavingCount(c => c - 1);
    }
  }

  async function saveChannels(channels) {
    if (!partner?.id) return;
    setSavingCount(c => c + 1);
    const now = new Date().toISOString();
    const payload = {
      channels_hall_enabled: channels.hall, 
      channels_pickup_enabled: channels.pickup, 
      channels_delivery_enabled: channels.delivery,
      ...(partner.channels_configured_at ? {} : { channels_configured_at: now }),
      channels_updated_at: now,
    };
    try {
      await updateRec("Partner", partner.id, payload);
      setPartner(prev => ({ ...prev, ...payload }));
      showToast(t("settings.toasts.channelsSaved"));
    } catch (e) {
      showError(t("settings.errors.error"), String(e?.message || e));
      throw e; // re-throw для отката UI в секции
    } finally {
      setSavingCount(c => c - 1);
    }
  }

  async function saveHallOrdering(data) {
    if (!partner?.id) return;
    setSavingCount(c => c + 1);
    try {
      await updateRec("Partner", partner.id, data);
      setPartner(prev => ({ ...prev, ...data }));
      showToast(t("settings.toasts.hallSaved"));
    } catch (e) {
      showError(t("settings.errors.error"), String(e?.message || e));
      throw e; // re-throw для отката UI в секции
    } finally {
      setSavingCount(c => c - 1);
    }
  }

  async function saveLanguages(data) {
    if (!partner?.id) return;
    const seq = ++saveSeq.current.languages;
    setSavingCount(c => c + 1);
    try {
      await updateRec("Partner", partner.id, data);
      if (seq !== saveSeq.current.languages) return; // устаревший ответ — игнор
      setPartner(prev => ({ ...prev, ...data }));
      showToast(t("settings.toasts.languagesSaved"));
    } catch (e) {
      if (seq !== saveSeq.current.languages) return; // устаревшая ошибка — игнор
      showError(t("settings.errors.error"), String(e?.message || e));
    } finally {
      setSavingCount(c => c - 1);
    }
  }

  async function saveCurrencies(data) {
    if (!partner?.id) return;
    const seq = ++saveSeq.current.currencies;
    setSavingCount(c => c + 1);
    try {
      await updateRec("Partner", partner.id, data);
      if (seq !== saveSeq.current.currencies) return; // устаревший ответ — игнор
      setPartner(prev => ({ ...prev, ...data }));
      showToast(t("settings.toasts.currenciesSaved"));
    } catch (e) {
      if (seq !== saveSeq.current.currencies) return; // устаревшая ошибка — игнор
      showError(t("settings.errors.error"), String(e?.message || e));
    } finally {
      setSavingCount(c => c - 1);
    }
  }

  // BUG-PS-004 FIX: Add pid guard to prevent creating orphaned records
  async function saveContactViewMode(viewMode) {
    if (!pid) return;
    setSavingCount(c => c + 1);
    try {
      if (contactSettings?.id) {
        await updateRec("PartnerContacts", contactSettings.id, { view_mode: viewMode });
        setContactSettings(prev => ({ ...prev, view_mode: viewMode }));
      } else {
        const created = await createWithPartner("PartnerContacts", { view_mode: viewMode }, pid);
        setContactSettings(created);
      }
      showToast(t("settings.toasts.viewModeSaved"));
    } catch (e) {
      showError(t("settings.errors.error"), String(e?.message || e));
    } finally {
      setSavingCount(c => c - 1);
    }
  }

  // WiFi Config Save
  async function saveWifiConfig(data) {
    if (!partner?.id) return;
    setSavingCount(c => c + 1);
    try {
      if (wifiConfig?.id) {
        await updateRec("WiFiConfig", wifiConfig.id, data);
        setWifiConfig(prev => ({ ...prev, ...data }));
      } else {
        const created = await createWithPartner("WiFiConfig", data, pid);
        setWifiConfig(created);
      }
      showToast(t("settings.toasts.wifiSaved"));
    } catch (e) {
      showError(t("settings.errors.error"), String(e?.message || e));
      throw e;
    } finally {
      setSavingCount(c => c - 1);
    }
  }

  // Contact CRUD
  function openNewContact() { 
    setContactForm({ id: null, type: "phone", label: "", url: "" }); 
    setContactDialog(true); 
  }

  function openEditContact(c) { 
    setContactForm({ id: c.id, type: c.type || "phone", label: c.label || "", url: c.url || "" }); 
    setContactDialog(true); 
  }

  async function saveContact() {
    const url = normStr(contactForm.url);
    if (!url) { showError(t("settings.errors.error"), t("settings.contacts.enterValue")); return; }
    
    // Fix: при редактировании сохраняем текущий sort_order
    const existing = contactForm.id ? contactsRaw.find(c => c.id === contactForm.id) : null;
    const sort_order = contactForm.id
      ? (existing?.sort_order ?? 0)
      : Math.max(0, ...contactsRaw.map(c => c.sort_order || 0)) + 10;
    
    const payload = { 
      type: contactForm.type, 
      label: normStr(contactForm.label), 
      url, 
      is_active: true, 
      sort_order
    };
    setSavingCount(c => c + 1);
    try {
      if (contactForm.id) {
        await updateRec("PartnerContactLink", contactForm.id, payload);
        setContactsRaw(old => old.map(c => c.id === contactForm.id ? { ...c, ...payload } : c));
        showToast(t("settings.toasts.contactSaved"));
      } else {
        const created = await createWithPartner("PartnerContactLink", payload, pid);
        setContactsRaw(old => sortByOrder([...old, created]));
        showToast(t("settings.toasts.contactAdded"));
      }
      setContactDialog(false);
    } catch (e) {
      showError(t("settings.errors.error"), String(e?.message || e));
    } finally {
      setSavingCount(c => c - 1);
    }
  }

  // BUG-PS-003 FIX: Add optimistic rollback on error + saving guard
  async function deleteContact(c) {
    if (!window.confirm(t("settings.contacts.deleteConfirm"))) return;
    setSavingCount(cnt => cnt + 1);
    const snapshot = [...contactsRaw];
    setContactsRaw(old => old.filter(x => x.id !== c.id));
    try {
      await deleteRec("PartnerContactLink", c.id);
      showToast(t("settings.toasts.contactDeleted"));
    } catch (e) {
      setContactsRaw(snapshot);
      showError(t("settings.errors.error"), String(e?.message || e));
    } finally {
      setSavingCount(cnt => cnt - 1);
    }
  }

  // Rate limit check — FIRST
  if (rateLimitHit) {
    return (
      <PartnerShell partnerName={partner?.name} activeTab="settings">
        <RateLimitScreen onRetry={handleRetry} t={t} />
      </PartnerShell>
    );
  }

  // P0-1: No partner access — показываем ошибку, не грузим чужие данные
  if (!loading && !pid) {
    return (
      <PartnerShell partnerName="" activeTab="settings">
        <NoPartnerAccessScreen t={t} />
      </PartnerShell>
    );
  }

  return (
    <PartnerShell partnerName={partner?.name} activeTab="settings">
      {/* Header */}
      <div className="mx-auto max-w-2xl px-3 pt-4 md:px-6 md:pt-6">
        <div className="mb-4 flex items-start justify-between gap-2">
          <div>
            <h1 className="text-xl font-semibold flex items-center gap-2">
              {t("settings.pageTitle")}
              {loading && <Loader2 className="h-4 w-4 animate-spin text-indigo-500" />}
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              {t("settings.pageSubtitle")}
            </p>
          </div>
          <PageHelpButton pageKey="/partnersettings" />
        </div>
      </div>

      {/* Section Navigation */}
      {!loading && <SectionNav activeSection={activeSection} t={t} />}

      {/* Content */}
      <div className={`mx-auto max-w-2xl px-3 md:px-6 ${hasProfileChanges ? "pb-24" : "pb-4 md:pb-6"}`}>
        {!loading && !apiReady && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800 mb-4">
            {t("settings.errors.connectionFailed")}
          </div>
        )}

        {loading ? (
          <div className="py-12 flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
          </div>
        ) : (
          <div className="space-y-4">
            <ProfileSection
              partner={partner}
              setPartner={setPartner}
              logoSaved={logoSaved}
              onLogoChange={handleLogoChange}
              t={t}
            />

            <WorkingHoursSection
              partner={partner}
              onSave={saveWorkingHours}
              saving={saving}
              t={t}
            />

            <ChannelsSection 
              partner={partner} 
              onSave={saveChannels} 
              saving={saving}
              t={t}
            />

            {/* Hall variant C (HALL-017) */}
            <HallOrderingSection 
              partner={partner}
              onSave={saveHallOrdering}
              saving={saving}
              t={t} 
            />

            {/* WiFi and Plan Section */}
            <WifiSection 
              partner={partner}
              wifiConfig={wifiConfig}
              onSave={saveWifiConfig}
              saving={saving}
              t={t}
            />

            <LanguagesSection 
              partner={partner} 
              onSave={saveLanguages} 
              saving={saving}
              t={t}
            />

            <CurrenciesSection 
              partner={partner} 
              onSave={saveCurrencies} 
              saving={saving}
              t={t}
            />

            <ContactsSection 
              contacts={contacts}
              contactSettings={contactSettings}
              onAdd={openNewContact}
              onEdit={openEditContact}
              onDelete={deleteContact}
              onViewModeChange={saveContactViewMode}
              saving={saving}
              apiReady={apiReady}
              t={t}
            />
          </div>
        )}
      </div>

      {/* Sticky Save/Discard bar for unsaved profile changes */}
      {hasProfileChanges && (
        <div className="fixed bottom-0 left-0 right-0 z-50 border-t bg-white/95 backdrop-blur-sm shadow-[0_-2px_10px_rgba(0,0,0,0.1)]">
          <div className="mx-auto max-w-2xl flex items-center justify-between gap-3 px-4 py-3">
            <div className="flex items-center gap-2 text-sm font-medium text-amber-600">
              <AlertTriangle className="h-4 w-4 flex-shrink-0" />
              <span>{t("settings.common.unsavedChanges")}</span>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={discardProfileChanges} disabled={saving} className="min-h-[44px] px-4">
                {t("settings.common.cancel")}
              </Button>
              <Button size="sm" onClick={saveProfile} disabled={!apiReady || !partner?.id || saving} className="min-h-[44px] px-4">
                {saving ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" />{t("settings.common.saving")}</>
                ) : (
                  <><Check className="mr-2 h-4 w-4" />{t("settings.profile.saveProfile")}</>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* P1-4: DIALOG Contact — sticky footer pattern */}
      <Dialog open={contactDialog} onOpenChange={setContactDialog}>
        <DialogContent className="max-w-md max-h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>{contactForm.id ? t("settings.contacts.dialog.editTitle") : t("settings.contacts.dialog.newTitle")}</DialogTitle>
            <DialogDescription>{t("settings.contacts.dialog.description")}</DialogDescription>
          </DialogHeader>
          
          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto space-y-4 py-4">
            <div className="space-y-2">
              <Label>{t("settings.contacts.dialog.type")}</Label>
              <Select value={contactForm.type} onValueChange={(v) => setContactForm(f => ({ ...f, type: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CONTACT_TYPES.map((ct) => (
                    <SelectItem key={ct.value} value={ct.value}>{ct.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t("settings.contacts.dialog.value")} *</Label>
              <Input
                value={contactForm.url}
                onChange={(e) => setContactForm(f => ({ ...f, url: e.target.value }))}
                placeholder={
                  contactForm.type === "phone" ? t("settings.contacts.placeholder.phone") : 
                  contactForm.type === "email" ? t("settings.contacts.placeholder.email") : 
                  t("settings.contacts.placeholder.url")
                }
              />
            </div>
            <div className="space-y-2">
              <Label>{t("settings.contacts.dialog.label")}</Label>
              <Input 
                value={contactForm.label} 
                onChange={(e) => setContactForm(f => ({ ...f, label: e.target.value }))} 
                placeholder={t("settings.contacts.dialog.labelPlaceholder")} 
              />
            </div>
          </div>
          
          {/* Sticky footer */}
          <div className="flex gap-2 pt-4 border-t mt-auto flex-col-reverse sm:flex-row sm:justify-end">
            <Button variant="outline" onClick={() => setContactDialog(false)} disabled={saving}>
              {t("settings.common.cancel")}
            </Button>
            <Button onClick={saveContact} disabled={!apiReady || saving}>
              {saving ? t("settings.common.saving") : t("settings.common.save")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </PartnerShell>
  );
}