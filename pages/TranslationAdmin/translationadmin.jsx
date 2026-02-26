import React, { useState, useEffect, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { refreshTranslations } from "@/components/i18n";
import {
  Globe,
  Plus,
  Trash2,
  Search,
  Download,
  Upload,
  Check,
  X,
  AlertTriangle,
  Loader2,
  ChevronDown,
  ChevronRight,
  FileCode,
  Eye,
  EyeOff,
  Languages,
  FileText,
  Clock,
  AlertCircle,
  CheckCircle,
  FolderOpen,
  Save,
  ShieldX,
  ArrowLeft,
  LogOut,
  Settings,
  Copy,
  Component,
  File,
  Zap,
} from "lucide-react";

/* ============================================================
   ACCESS CONTROL
   ============================================================ */

const ADMIN_EMAILS = [
  "linkgabinfo@gmail.com",
];

/* ============================================================
   PREDEFINED SOURCES
   ============================================================ */

const PREDEFINED_SOURCES = [
  { name: 'partnershell', display: 'PartnerShell', type: 'component', hint: 'Navigation component' },
  { name: 'imageuploader', display: 'ImageUploader', type: 'component', hint: 'Image upload component' },
  { name: 'helpers', display: 'helpers', type: 'component', hint: 'Helper functions' },
  { name: 'constants', display: 'constants', type: 'component', hint: 'Constants file' },
];

/* ============================================================
   API HELPERS
   ============================================================ */

const Language = base44.entities.Language;
const InterfaceTranslation = base44.entities.InterfaceTranslation;
const PageSource = base44.entities.PageSource;
const PageScanTracker = base44.entities.PageScanTracker;
const UnusedKeyLog = base44.entities.UnusedKeyLog;

async function loadLanguages() {
  try {
    const list = await Language.list();
    return (list || []).sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
  } catch (e) {
    console.error("Failed to load languages:", e);
    return [];
  }
}

async function loadTranslations() {
  try {
    const list = await InterfaceTranslation.list();
    return list || [];
  } catch (e) {
    console.error("Failed to load translations:", e);
    return [];
  }
}

async function loadPageSources() {
  try {
    const list = await PageSource.list();
    return (list || []).filter(p => p.is_active !== false);
  } catch (e) {
    console.error("Failed to load page sources:", e);
    return [];
  }
}

async function loadScanTrackers() {
  try {
    const list = await PageScanTracker.list();
    return list || [];
  } catch (e) {
    console.error("Failed to load scan trackers:", e);
    return [];
  }
}

async function loadUnusedKeyLogs() {
  try {
    const list = await UnusedKeyLog.list();
    return list || [];
  } catch (e) {
    console.error("Failed to load unused key logs:", e);
    return [];
  }
}

/* ============================================================
   HELPERS
   ============================================================ */

function extractKeysFromCode(code) {
  const regex = /t\(\s*["']([^"']+)["']/g;
  const keys = new Set();
  let match;
  while ((match = regex.exec(code)) !== null) {
    keys.add(match[1]);
  }
  return Array.from(keys).sort();
}

function countLines(code) {
  if (!code || code === "// Paste code here") return 0;
  return code.split('\n').length;
}

// FIX P0: Properly escape CSV values (quotes AND newlines)
function escapeCSV(str) {
  if (!str) return '';
  return str
    .replace(/"/g, '""')           // Escape quotes
    .replace(/\r\n/g, '\\n')       // Windows newlines
    .replace(/\n/g, '\\n')         // Unix newlines
    .replace(/\r/g, '\\n');        // Old Mac newlines
}

function formatDate(dateStr) {
  if (!dateStr) return "Never";
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24) return `${diffHours} hours ago`;
  if (diffDays < 7) return `${diffDays} days ago`;

  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function generateCSV(translations, languages) {
  const activeLangs = languages.filter(l => l.is_active);
  const headers = ['key', 'page', 'description', ...activeLangs.map(l => l.code)];

  let csv = headers.join(',') + '\n';

  for (const t of translations) {
    const row = [
      `"${escapeCSV(t.key)}"`,
      `"${escapeCSV(t.page)}"`,
      `"${escapeCSV(t.description)}"`,
      ...activeLangs.map(l => `"${escapeCSV(t.translations?.[l.code])}"`)
    ];
    csv += row.join(',') + '\n';
  }

  return csv;
}

function generateCSVMissing(translations, languages, langCode = null) {
  const activeLangs = languages.filter(l => l.is_active);
  const headers = ['key', 'page', 'description', ...activeLangs.map(l => l.code)];

  const filtered = translations.filter(t => {
    if (langCode) {
      return !t.translations?.[langCode];
    } else {
      return activeLangs.some(l => !t.translations?.[l.code]);
    }
  });

  let csv = headers.join(',') + '\n';

  for (const t of filtered) {
    const row = [
      `"${escapeCSV(t.key)}"`,
      `"${escapeCSV(t.page)}"`,
      `"${escapeCSV(t.description)}"`,
      ...activeLangs.map(l => `"${escapeCSV(t.translations?.[l.code])}"`)
    ];
    csv += row.join(',') + '\n';
  }

  return { csv, count: filtered.length };
}

function parseCSVLine(line) {
  const values = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      values.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  values.push(current);

  return values;
}

// FIX BUG-TA-006: Unescape literal \n back to real newlines (round-trip with escapeCSV)
function unescapeCSV(str) {
  if (!str) return '';
  return str.replace(/\\n/g, '\n');
}

function parseCSV(csvText, languages) {
  const lines = csvText.trim().split('\n');
  if (lines.length < 2) return [];

  const headers = parseCSVLine(lines[0]).map(h => h.trim().toLowerCase());
  const langCodeMap = {};
  languages.forEach(l => { langCodeMap[l.code.toLowerCase()] = l.code; });

  const results = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const values = parseCSVLine(line);
    const obj = { translations: {} };

    headers.forEach((header, idx) => {
      const value = unescapeCSV(values[idx] || '');

      if (header === 'key') obj.key = value;
      else if (header === 'page') obj.page = value;
      else if (header === 'description') obj.description = value;
      else if (langCodeMap[header]) {
        if (value) obj.translations[langCodeMap[header]] = value;
      }
    });

    if (obj.key) results.push(obj);
  }

  return results;
}

function downloadFile(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// FIX: Copy with visual feedback support
function copyToClipboard(text, setCopiedFn) {
  navigator.clipboard.writeText(text).then(() => {
    if (setCopiedFn) {
      setCopiedFn(true);
      setTimeout(() => setCopiedFn(false), 2000);
    } else {
      toast.success('Copied!', { id: 'copy' });
    }
  }).catch(() => {
    toast.error('Failed to copy', { id: 'copy' });
  });
}

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

function ProgressBar({ value, max, color = "bg-indigo-500", showPercent = true }) {
  const percent = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="flex items-center gap-2 flex-1">
      <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
        <div className={`h-full ${color} transition-all duration-300`} style={{ width: `${percent}%` }} />
      </div>
      {showPercent && <span className="text-xs font-medium w-10 text-right">{percent}%</span>}
    </div>
  );
}

function OperationProgress({ progress, color = "bg-indigo-500" }) {
  if (!progress || progress.total === 0) return null;

  const percent = Math.round((progress.current / progress.total) * 100);

  return (
    <div className={`border rounded-lg p-3 mb-3 ${color === "bg-green-500" ? "bg-green-50 border-green-200" : color === "bg-red-500" ? "bg-red-50 border-red-200" : "bg-indigo-50 border-indigo-200"}`}>
      <div className="flex items-center justify-between mb-1.5">
        <span className={`text-xs font-medium ${color === "bg-green-500" ? "text-green-700" : color === "bg-red-500" ? "text-red-700" : "text-indigo-700"}`}>
          {progress.current} / {progress.total}
        </span>
        <span className={`text-xs ${color === "bg-green-500" ? "text-green-600" : color === "bg-red-500" ? "text-red-600" : "text-indigo-600"}`}>
          {percent}%
        </span>
      </div>
      <div className={`h-1.5 rounded-full overflow-hidden ${color === "bg-green-500" ? "bg-green-200" : color === "bg-red-500" ? "bg-red-200" : "bg-indigo-200"}`}>
        <div className={`h-full ${color} transition-all duration-300`} style={{ width: `${percent}%` }} />
      </div>
      {progress.status && (
        <p className={`text-xs mt-1.5 truncate ${color === "bg-green-500" ? "text-green-600" : color === "bg-red-500" ? "text-red-600" : "text-indigo-600"}`}>
          {progress.status}
        </p>
      )}
    </div>
  );
}

function LanguageStats({ langStats, total, onFilterByLang }) {
  if (!langStats || langStats.length === 0) return null;

  return (
    <div className="bg-white border rounded-xl p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-slate-700">Translation Progress</h3>
        <span className="text-xs text-slate-500">{total} keys total</span>
      </div>
      <div className="space-y-2">
        {langStats.map(({ code, name, translated, isDefault }) => {
          const isMissing = translated < total;
          return (
            <div
              key={code}
              className={`flex items-center gap-3 p-1.5 -mx-1.5 rounded-lg transition-colors ${isMissing ? 'cursor-pointer hover:bg-slate-50' : ''}`}
              onClick={() => isMissing && onFilterByLang?.(code)}
            >
              <div className="w-8 flex items-center gap-1">
                <span className="text-xs font-medium text-slate-600">{code.toUpperCase()}</span>
                {isDefault && <span className="text-amber-500 text-xs">★</span>}
              </div>
              <ProgressBar
                value={translated}
                max={total}
                color={translated === total ? "bg-green-500" : translated > total * 0.5 ? "bg-indigo-500" : "bg-amber-500"}
              />
              <span className="text-xs text-slate-500 w-16 text-right">{translated}/{total}</span>
              {isMissing && <ChevronRight className="h-3.5 w-3.5 text-slate-400" />}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function AdminHeader({ stats, saving, onLogout, userEmail }) {
  const overallPercent = stats.total > 0 ? Math.round((stats.complete / stats.total) * 100) : 0;

  return (
    <div className="bg-white border-b sticky top-0 z-20">
      <div className="max-w-5xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600">
              <Globe className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg font-semibold">Translation Admin</h1>
              <div className="flex items-center gap-2">
                <p className="text-xs text-slate-500">
                  {stats.total} keys • {stats.complete} complete • {stats.missing} missing
                  {stats.unusedSafeToDelete > 0 && <span className="text-red-500"> • {stats.unusedSafeToDelete} unused</span>}
                </p>
                <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${
                  overallPercent === 100 ? 'bg-green-100 text-green-700' :
                  overallPercent >= 50 ? 'bg-indigo-100 text-indigo-700' : 'bg-amber-100 text-amber-700'
                }`}>{overallPercent}%</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {saving && <Loader2 className="h-4 w-4 animate-spin text-slate-400" />}
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

function LanguageChip({ lang, isDefault, onSetDefault, onToggle, onDelete }) {
  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${
      lang.is_active ? isDefault ? 'bg-indigo-50 border-indigo-300' : 'bg-white border-slate-200'
        : 'bg-slate-100 border-slate-300 opacity-60'
    }`}>
      <span className="font-medium">{lang.code.toUpperCase()}</span>
      <span className="text-sm text-slate-500">{lang.name}</span>
      {isDefault && <span className="text-xs bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded">default</span>}
      <div className="flex items-center gap-1 ml-2">
        {!isDefault && lang.is_active && (
          <button onClick={() => onSetDefault(lang)} className="text-xs text-slate-500 hover:text-indigo-600" title="Set as default">★</button>
        )}
        <button onClick={() => onToggle(lang)} className="p-1 hover:bg-slate-100 rounded" title={lang.is_active ? "Disable" : "Enable"}>
          {lang.is_active ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5 text-slate-400" />}
        </button>
        {!isDefault && (
          <button onClick={() => onDelete(lang)} className="p-1 hover:bg-red-50 rounded text-red-500" title="Delete">
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}

function SourceRow({ source, tracker, onUpdateCode, onScan, onDelete }) {
  const hasCode = source.source_code && source.source_code !== "// Paste code here";
  const lastScanned = tracker?.last_scanned_at;
  const keysCount = tracker?.keys_count || 0;
  const newKeysCount = tracker?.new_keys_count || 0;
  const linesCount = source.lines_count || 0;
  const version = source.version || "";
  const sourceType = source.source_type || "page";

  let statusIcon, statusColor, statusText;
  if (!hasCode) {
    statusIcon = <AlertCircle className="h-4 w-4" />;
    statusColor = "text-amber-500";
    statusText = "No code";
  } else if (!lastScanned) {
    statusIcon = <Clock className="h-4 w-4" />;
    statusColor = "text-blue-500";
    statusText = "Not scanned";
  } else if (newKeysCount > 0) {
    statusIcon = <AlertTriangle className="h-4 w-4" />;
    statusColor = "text-amber-500";
    statusText = `${newKeysCount} new keys`;
  } else {
    statusIcon = <CheckCircle className="h-4 w-4" />;
    statusColor = "text-green-500";
    statusText = "Up to date";
  }

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg border bg-white hover:bg-slate-50 transition">
      <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${sourceType === 'component' ? 'bg-purple-100' : 'bg-slate-100'}`}>
        {sourceType === 'component' ? <Component className="h-5 w-5 text-purple-500" /> : <FileCode className="h-5 w-5 text-slate-500" />}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium">{source.display_name || source.page_name}</span>
          <span className={`text-xs px-1.5 py-0.5 rounded ${sourceType === 'component' ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-600'}`}>
            {sourceType}
          </span>
          {version && <span className="text-xs bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded font-mono">{version}</span>}
        </div>
        <div className="text-sm text-slate-500 flex items-center gap-2 flex-wrap">
          <span className={`flex items-center gap-1 ${statusColor}`}>{statusIcon}{statusText}</span>
          {hasCode && (
            <>
              <span>•</span><span>{keysCount} keys</span>
              <span>•</span><span>{linesCount} lines</span>
              <span>•</span><span>Updated {formatDate(source.updated_at)}</span>
            </>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1">
        <Button variant="outline" size="sm" onClick={() => onUpdateCode(source)} className="h-8">
          <FileText className="h-3.5 w-3.5 mr-1" />{hasCode ? "Update" : "Add Code"}
        </Button>
        {hasCode && (
          <Button variant="outline" size="sm" onClick={() => onScan(source)} className="h-8">
            <Search className="h-3.5 w-3.5 mr-1" />Scan
          </Button>
        )}
        <Button variant="ghost" size="sm" onClick={() => onDelete(source)} className="h-8 w-8 p-0 text-red-500 hover:bg-red-50">
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}

function TranslationRow({ translation, languages, unusedInfo, onUpdate, onDelete, expanded, onToggleExpand }) {
  const [editing, setEditing] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [editSaving, setEditSaving] = useState(false);

  const activeLangs = languages.filter(l => l.is_active);
  const missingCount = activeLangs.filter(l => !translation.translations?.[l.code]).length;

  const startEdit = (langCode) => {
    setEditing(langCode);
    setEditValue(translation.translations?.[langCode] || '');
  };

  // FIX P1: Keep edit open on error, don't lose user's text
  const saveEdit = async () => {
    if (editing) {
      setEditSaving(true);
      try {
        const newTranslations = { ...translation.translations, [editing]: editValue };
        await onUpdate(translation.id, { translations: newTranslations });
        setEditing(null); // Only close on success
      } catch {
        // Keep editing open, user's text is preserved
        // (error toast already shown by updateTranslation)
      } finally {
        setEditSaving(false);
      }
    }
  };

  const cancelEdit = () => { setEditing(null); setEditValue(''); };

  return (
    <div className="border rounded-lg bg-white overflow-hidden">
      <div className="flex items-center gap-3 p-3 cursor-pointer hover:bg-slate-50" onClick={onToggleExpand}>
        {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        <code className="text-sm font-mono bg-slate-100 px-2 py-0.5 rounded">{translation.key}</code>
        {translation.page && <span className="text-xs bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded">{translation.page}</span>}
        {unusedInfo && (
          <span className={`text-xs px-1.5 py-0.5 rounded flex items-center gap-1 ${unusedInfo.isSafeToDelete ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}`}>
            <Trash2 className="h-3 w-3" />{unusedInfo.isSafeToDelete ? 'Safe to delete' : `Unused (${unusedInfo.scan_count})`}
          </span>
        )}
        {!unusedInfo && missingCount > 0 ? (
          <span className="text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" />{missingCount} missing
          </span>
        ) : !unusedInfo && (
          <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded flex items-center gap-1">
            <Check className="h-3 w-3" />complete
          </span>
        )}
        <div className="ml-auto flex items-center gap-1" onClick={e => e.stopPropagation()}>
          <button onClick={() => onDelete(translation)} className="p-1.5 hover:bg-red-50 rounded text-red-500" title="Delete">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {expanded && (
        <div className="border-t bg-slate-50 p-3 space-y-2">
          {translation.description && <p className="text-xs text-slate-500 mb-3">📝 {translation.description}</p>}
          {unusedInfo && <p className="text-xs text-orange-600 mb-3">⚠️ Not found in code for {unusedInfo.scan_count} scan(s).</p>}
          {activeLangs.map(lang => {
            const value = translation.translations?.[lang.code] || '';
            const isEditing = editing === lang.code;
            const isEmpty = !value;

            return (
              <div key={lang.code} className="flex items-start gap-2">
                <span className={`font-medium text-xs w-8 pt-2 ${isEmpty ? 'text-amber-600' : 'text-slate-500'}`}>{lang.code.toUpperCase()}</span>
                {isEditing ? (
                  <div className="flex-1 flex gap-2">
                    <Input value={editValue} onChange={(e) => setEditValue(e.target.value)} className="flex-1 h-8 text-sm" autoFocus disabled={editSaving}
                      onKeyDown={(e) => { if (e.key === 'Enter' && !editSaving) saveEdit(); if (e.key === 'Escape' && !editSaving) cancelEdit(); }} />
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={saveEdit} disabled={editSaving}>
                      {editSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4 text-green-600" />}
                    </Button>
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={cancelEdit} disabled={editSaving}><X className="h-4 w-4 text-red-500" /></Button>
                  </div>
                ) : (
                  <div className={`flex-1 px-2 py-1.5 rounded text-sm cursor-pointer hover:bg-white ${isEmpty ? 'bg-amber-50 border border-amber-200 text-amber-600 italic' : 'bg-white border'}`}
                    onClick={() => startEdit(lang.code)}>{value || '(empty - click to add)'}</div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ============================================================
   MAIN COMPONENT
   ============================================================ */

export default function TranslationAdmin() {
  // Auth
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Data
  const [languages, setLanguages] = useState([]);
  const [translations, setTranslations] = useState([]);
  const [pageSources, setPageSources] = useState([]);
  const [scanTrackers, setScanTrackers] = useState([]);
  const [unusedKeyLogs, setUnusedKeyLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Settings
  const [unusedThreshold, setUnusedThreshold] = useState(() => {
    try { return parseInt(localStorage.getItem('ta_unused_threshold'), 10) || 3; } catch { return 3; }
  });

  // UI
  const [activeTab, setActiveTab] = useState("translations");
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPage, setFilterPage] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [expandedKeys, setExpandedKeys] = useState(new Set());

  // Dialogs
  const [showAddLang, setShowAddLang] = useState(false);
  const [showAddTranslation, setShowAddTranslation] = useState(false);
  const [showAddSource, setShowAddSource] = useState(false);
  const [showUpdateCode, setShowUpdateCode] = useState(false);
  const [showScanResults, setShowScanResults] = useState(false);
  const [showImportCSV, setShowImportCSV] = useState(false);
  const [showDeleteUnused, setShowDeleteUnused] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showExportText, setShowExportText] = useState(false);

  // Forms
  const [newLang, setNewLang] = useState({ code: '', name: '' });
  const [newTranslation, setNewTranslation] = useState({ key: '', page: '', description: '', translations: {} });
  const [newSource, setNewSource] = useState({ name: '', display: '', type: 'page' });
  const [editingSource, setEditingSource] = useState(null);
  const [editingCode, setEditingCode] = useState('');
  const [editingVersion, setEditingVersion] = useState('');
  const [scanResults, setScanResults] = useState({ new: [], existing: [], unused: [], sourceName: '', isFullScan: false });
  const [importCSV, setImportCSV] = useState('');
  const [importMode, setImportMode] = useState('merge');
  const [exportText, setExportText] = useState({ content: '', filename: '', title: '' });

  // Progress
  const [importProgress, setImportProgress] = useState({ current: 0, total: 0, status: '' });
  const [addKeysProgress, setAddKeysProgress] = useState({ current: 0, total: 0, status: '' });
  const [scanProgress, setScanProgress] = useState({ current: 0, total: 0, status: '' });
  const [deleteProgress, setDeleteProgress] = useState({ current: 0, total: 0, status: '' });
  // FIX 260119: Add progress for Update Code dialog operations
  const [updateCodeProgress, setUpdateCodeProgress] = useState({ current: 0, total: 0, status: '' });

  // Scanning guard
  const [isScanning, setIsScanning] = useState(false);

  // FIX: Copy feedback state
  const [copied, setCopied] = useState(false);

  // FIX 260119: Track if dialog is busy (for Add Source)
  const [addSourceBusy, setAddSourceBusy] = useState(false);

  // Save settings
  useEffect(() => {
    try { localStorage.setItem('ta_unused_threshold', unusedThreshold.toString()); } catch {}
  }, [unusedThreshold]);

  // Auth
  useEffect(() => {
    base44.auth.me().then(u => setUser(u)).catch(() => setUser(null)).finally(() => setAuthLoading(false));
  }, []);

  const logout = async () => {
    try { await base44.auth.logout(); } catch {}
    window.location.href = "/";
  };

  const isAdmin = user?.email && ADMIN_EMAILS.includes(user.email);

  // FIX P0: Load data ONLY for admins (after auth check completes)
  useEffect(() => {
    if (authLoading) return;
    if (!isAdmin) { setLoading(false); return; }

    async function load() {
      setLoading(true);
      const [langs, trans, sources, trackers, unused] = await Promise.all([
        loadLanguages(), loadTranslations(), loadPageSources(), loadScanTrackers(), loadUnusedKeyLogs()
      ]);
      setLanguages(langs);
      setTranslations(trans);
      setPageSources(sources);
      setScanTrackers(trackers);
      setUnusedKeyLogs(unused);
      setLoading(false);
    }
    load();
  }, [authLoading, isAdmin]);

  // Unused key map
  const unusedKeyMap = useMemo(() => {
    const map = new Map();
    for (const log of unusedKeyLogs) {
      map.set(log.translation_key, { ...log, isSafeToDelete: log.scan_count >= unusedThreshold });
    }
    return map;
  }, [unusedKeyLogs, unusedThreshold]);

  // Derived
  const pages = useMemo(() => {
    const set = new Set(translations.map(t => t.page).filter(Boolean));
    return ['all', ...Array.from(set).sort()];
  }, [translations]);

  const activeLangs = useMemo(() => languages.filter(l => l.is_active), [languages]);

  const filteredTranslations = useMemo(() => {
    let result = [...translations];

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(t => t.key.toLowerCase().includes(q) || Object.values(t.translations || {}).some(v => v?.toLowerCase().includes(q)));
    }

    if (filterPage !== 'all') result = result.filter(t => t.page === filterPage);

    if (filterStatus === 'missing') {
      result = result.filter(t => activeLangs.some(l => !t.translations?.[l.code]));
    } else if (filterStatus === 'complete') {
      result = result.filter(t => activeLangs.every(l => t.translations?.[l.code]));
    } else if (filterStatus.startsWith('missing-')) {
      const langCode = filterStatus.replace('missing-', '');
      result = result.filter(t => !t.translations?.[langCode]);
    } else if (filterStatus === 'unused-safe') {
      result = result.filter(t => unusedKeyMap.get(t.key)?.isSafeToDelete);
    }

    return result.sort((a, b) => a.key.localeCompare(b.key));
  }, [translations, searchQuery, filterPage, filterStatus, activeLangs, unusedKeyMap]);

  const stats = useMemo(() => {
    const total = translations.length;
    const complete = translations.filter(t => activeLangs.every(l => t.translations?.[l.code])).length;
    const missing = total - complete;
    const unusedSafeToDelete = unusedKeyLogs.filter(l => l.scan_count >= unusedThreshold).length;

    const langStats = activeLangs.map(lang => ({
      code: lang.code,
      name: lang.name,
      translated: translations.filter(t => t.translations?.[lang.code]).length,
      isDefault: lang.is_default,
    }));

    const sourcesWithCode = pageSources.filter(p => p.source_code && p.source_code !== "// Paste code here").length;

    return { total, complete, missing, langStats, sourcesWithCode, sourcesTotal: pageSources.length, unusedSafeToDelete };
  }, [translations, activeLangs, pageSources, unusedKeyLogs, unusedThreshold]);

  const getTracker = (name) => scanTrackers.find(t => t.page_name === name);

  // === LANGUAGE OPERATIONS ===

  const addLanguage = async () => {
    if (!newLang.code || !newLang.name) return;
    setSaving(true);
    try {
      const maxOrder = Math.max(0, ...languages.map(l => l.sort_order || 0));
      const created = await Language.create({ code: newLang.code.toLowerCase(), name: newLang.name, sort_order: maxOrder + 1, is_active: true, is_default: false });
      setLanguages(prev => [...prev, created]);
      setNewLang({ code: '', name: '' });
      setShowAddLang(false);
      toast.success('Language added', { id: 'ta1' });
    } catch (err) {
      console.error("Failed to add language:", err);
      toast.error('Failed to add language', { id: 'ta1' });
    } finally {
      setSaving(false);
    }
  };

  const toggleLanguage = async (lang) => {
    // FIX P0: Cannot disable default language
    if (lang.is_default) {
      toast.error('Cannot disable default language', { id: 'ta1' });
      return;
    }
    setSaving(true);
    try {
      await Language.update(lang.id, { is_active: !lang.is_active });
      setLanguages(prev => prev.map(l => l.id === lang.id ? { ...l, is_active: !l.is_active } : l));
      toast.success(lang.is_active ? 'Language disabled' : 'Language enabled', { id: 'ta1' });
    } catch (err) {
      console.error("Failed to toggle language:", err);
      toast.error('Failed to update language', { id: 'ta1' });
    } finally {
      setSaving(false);
    }
  };

  // FIX BUG-TA-001: Set new default FIRST to avoid zero-default state on partial failure
  const setDefaultLanguage = async (lang) => {
    setSaving(true);
    try {
      // Set new default FIRST — failure here leaves old default intact (safe)
      await Language.update(lang.id, { is_default: true, is_active: true });
      // Update state right after first call succeeds — UI reflects API truth
      setLanguages(prev => prev.map(l => ({ ...l, is_default: l.id === lang.id, is_active: l.id === lang.id ? true : l.is_active })));
      // Un-set old default SECOND — failure here leaves two defaults (recoverable by retry)
      const currentDefault = languages.find(l => l.is_default && l.id !== lang.id);
      if (currentDefault) await Language.update(currentDefault.id, { is_default: false });
      toast.success(`${lang.name} set as default`, { id: 'ta1' });
    } catch (err) {
      console.error("Failed to set default language:", err);
      toast.error('Failed to set default', { id: 'ta1' });
    } finally {
      setSaving(false);
    }
  };

  const deleteLanguage = async (lang) => {
    if (!confirm(`Delete "${lang.name}"?`)) return;
    setSaving(true);
    try {
      await Language.delete(lang.id);
      setLanguages(prev => prev.filter(l => l.id !== lang.id));
      toast.success('Deleted', { id: 'ta1' });
    } catch (err) {
      console.error("Failed to delete language:", err);
      toast.error('Failed to delete', { id: 'ta1' });
    } finally {
      setSaving(false);
    }
  };

  // === SOURCE OPERATIONS ===

  // FIX P0 260119: Complete rewrite of addSourceDirect with proper error handling
  const addSourceDirect = async (sourceData) => {
    const name = sourceData.name.toLowerCase().replace(/\s+/g, '');

    if (pageSources.find(p => p.page_name === name)) {
      toast.error('Source already exists', { id: 'ta1' });
      return false;
    }

    setSaving(true);
    try {
      const created = await PageSource.create({
        page_name: name,
        display_name: sourceData.display || sourceData.name,
        source_type: sourceData.type || 'page',
        source_code: "// Paste code here",
        is_active: true,
        lines_count: 0,
        version: "",
      });

      if (!created || !created.id) {
        throw new Error("PageSource.create returned invalid result");
      }

      setPageSources(prev => [...prev, created]);
      toast.success('Source added', { id: 'ta1' });
      return true;
    } catch (err) {
      console.error("Failed to add source:", err);
      toast.error(`Failed to add source: ${err.message || 'Unknown error'}`, { id: 'ta1' });
      return false;
    } finally {
      setSaving(false);
    }
  };

  // FIX P0 260119: Rewritten addSource with proper async handling
  const addSource = async () => {
    if (!newSource.name) {
      toast.error('Name is required', { id: 'ta1' });
      return;
    }

    if (addSourceBusy) return;
    setAddSourceBusy(true);

    try {
      const success = await addSourceDirect(newSource);
      if (success) {
        setNewSource({ name: '', display: '', type: 'page' });
        setShowAddSource(false);
      }
    } finally {
      setAddSourceBusy(false);
    }
  };

  const openUpdateCode = (source) => {
    setEditingSource(source);
    setEditingCode(source.source_code === "// Paste code here" ? '' : source.source_code);
    setEditingVersion(source.version || '');
    setUpdateCodeProgress({ current: 0, total: 0, status: '' });
    setShowUpdateCode(true);
  };

  const saveSourceCode = async () => {
    if (!editingSource) return;
    setSaving(true);
    try {
      const code = editingCode || "// Paste code here";
      const lines = countLines(code);
      await PageSource.update(editingSource.id, { source_code: code, lines_count: lines, version: editingVersion });
      setPageSources(prev => prev.map(p => p.id === editingSource.id ? { ...p, source_code: code, lines_count: lines, version: editingVersion, updated_at: new Date().toISOString() } : p));
      setShowUpdateCode(false);
      setEditingSource(null);
      toast.success('Code saved', { id: 'ta1' });
    } catch (err) {
      console.error("Failed to save source code:", err);
      toast.error('Failed to save', { id: 'ta1' });
    } finally {
      setSaving(false);
    }
  };

  const saveAndScan = async () => {
    if (!editingSource || !editingCode) return;
    setSaving(true);
    setUpdateCodeProgress({ current: 1, total: 3, status: 'Saving code...' });

    try {
      const lines = countLines(editingCode);
      await PageSource.update(editingSource.id, { source_code: editingCode, lines_count: lines, version: editingVersion });
      setPageSources(prev => prev.map(p => p.id === editingSource.id ? { ...p, source_code: editingCode, lines_count: lines, version: editingVersion, updated_at: new Date().toISOString() } : p));

      setUpdateCodeProgress({ current: 2, total: 3, status: 'Scanning for keys...' });
      await performScan(editingSource.page_name, editingCode, false);

      setUpdateCodeProgress({ current: 3, total: 3, status: 'Done!' });
      await new Promise(r => setTimeout(r, 300));

      setShowUpdateCode(false);
      setEditingSource(null);
      setUpdateCodeProgress({ current: 0, total: 0, status: '' });
    } catch (err) {
      console.error("Failed to save and scan:", err);
      toast.error('Failed to save and scan', { id: 'ta1' });
      setUpdateCodeProgress({ current: 0, total: 0, status: '' });
    } finally {
      setSaving(false);
    }
  };

  // FIX 260119: New function - Save + Scan + Add all new keys in one action
  const saveAndScanAndAdd = async () => {
    if (!editingSource || !editingCode) return;
    setSaving(true);

    try {
      setUpdateCodeProgress({ current: 1, total: 4, status: 'Saving code...' });
      const lines = countLines(editingCode);
      await PageSource.update(editingSource.id, { source_code: editingCode, lines_count: lines, version: editingVersion });
      setPageSources(prev => prev.map(p => p.id === editingSource.id ? { ...p, source_code: editingCode, lines_count: lines, version: editingVersion, updated_at: new Date().toISOString() } : p));

      setUpdateCodeProgress({ current: 2, total: 4, status: 'Scanning for keys...' });
      const foundKeys = extractKeysFromCode(editingCode);
      const existingKeys = new Set(translations.map(t => t.key));
      const newKeys = foundKeys.filter(k => !existingKeys.has(k));

      // FIX BUG-TA-004: Track tracker ID to avoid stale closure when tracker is newly created
      const now = new Date().toISOString();
      const existingTracker = scanTrackers.find(t => t.page_name === editingSource.page_name);
      let trackerId = existingTracker?.id;
      const trackerData = {
        page_name: editingSource.page_name,
        last_scanned_at: now,
        keys_count: foundKeys.length,
        keys_list: foundKeys,
        new_keys_count: newKeys.length,
        scan_status: newKeys.length > 0 ? "needs_rescan" : "scanned"
      };

      if (existingTracker) {
        await PageScanTracker.update(existingTracker.id, trackerData);
        setScanTrackers(prev => prev.map(t => t.id === existingTracker.id ? { ...t, ...trackerData } : t));
      } else {
        const created = await PageScanTracker.create(trackerData);
        trackerId = created.id;
        setScanTrackers(prev => [...prev, created]);
      }

      if (newKeys.length > 0) {
        setUpdateCodeProgress({ current: 3, total: 4, status: `Adding ${newKeys.length} new keys...` });

        let added = 0;
        for (let i = 0; i < newKeys.length; i++) {
          const key = newKeys[i];
          setUpdateCodeProgress({
            current: 3,
            total: 4,
            status: `Adding key ${i + 1}/${newKeys.length}: ${key}`
          });

          try {
            const page = key.split('.')[0] || '';
            const created = await InterfaceTranslation.create({ key, page, translations: {}, is_active: true });
            setTranslations(prev => [...prev, created]);
            added++;
          } catch (err) {
            console.error(`Failed to add key ${key}:`, err);
          }

          if (i < newKeys.length - 1) await new Promise(r => setTimeout(r, 100));
        }

        // Use trackerId (captures newly created tracker's ID too)
        const updatedTrackerData = { ...trackerData, new_keys_count: 0, scan_status: "scanned" };
        if (trackerId) {
          await PageScanTracker.update(trackerId, updatedTrackerData);
          setScanTrackers(prev => prev.map(t => t.id === trackerId ? { ...t, ...updatedTrackerData } : t));
        }

        toast.success(`Added ${added} new keys`, { id: 'ta1' });
        try { await refreshTranslations(); } catch { toast.error('Live sync failed. Reload to see changes.', { id: 'ta-sync' }); }
      } else {
        toast.success('No new keys found', { id: 'ta1' });
      }

      setUpdateCodeProgress({ current: 4, total: 4, status: 'Complete!' });
      await new Promise(r => setTimeout(r, 500));

      setShowUpdateCode(false);
      setEditingSource(null);
      setUpdateCodeProgress({ current: 0, total: 0, status: '' });

    } catch (err) {
      console.error("Failed to save+scan+add:", err);
      toast.error('Operation failed', { id: 'ta1' });
      setUpdateCodeProgress({ current: 0, total: 0, status: '' });
    } finally {
      setSaving(false);
    }
  };

  const deleteSource = async (source) => {
    if (!confirm(`Delete "${source.display_name || source.page_name}"?`)) return;
    setSaving(true);
    try {
      await PageSource.delete(source.id);
      setPageSources(prev => prev.filter(p => p.id !== source.id));
      const tracker = scanTrackers.find(t => t.page_name === source.page_name);
      if (tracker) {
        await PageScanTracker.delete(tracker.id);
        setScanTrackers(prev => prev.filter(t => t.id !== tracker.id));
      }
      toast.success('Deleted', { id: 'ta1' });
    } catch (err) {
      console.error("Failed to delete source:", err);
      toast.error('Failed to delete', { id: 'ta1' });
    } finally {
      setSaving(false);
    }
  };

  // === SCANNING ===

  const performScan = async (sourceName, code, isFullScan = false) => {
    const foundKeys = extractKeysFromCode(code);
    const existingKeys = new Set(translations.map(t => t.key));
    const foundKeysSet = new Set(foundKeys);

    const newKeys = foundKeys.filter(k => !existingKeys.has(k));
    const existingFound = foundKeys.filter(k => existingKeys.has(k));
    const unusedKeys = translations.filter(t => !foundKeysSet.has(t.key)).map(t => t.key);

    setScanResults({ new: newKeys, existing: existingFound, unused: unusedKeys, sourceName, isFullScan });

    const now = new Date().toISOString();
    const existingTracker = scanTrackers.find(t => t.page_name === sourceName);
    const trackerData = { page_name: sourceName, last_scanned_at: now, keys_count: foundKeys.length, keys_list: foundKeys, new_keys_count: newKeys.length, scan_status: newKeys.length > 0 ? "needs_rescan" : "scanned" };

    try {
      if (existingTracker) {
        await PageScanTracker.update(existingTracker.id, trackerData);
        setScanTrackers(prev => prev.map(t => t.id === existingTracker.id ? { ...t, ...trackerData } : t));
      } else {
        const created = await PageScanTracker.create(trackerData);
        setScanTrackers(prev => [...prev, created]);
      }
    } catch (e) { console.error("Failed to update tracker:", e); }

    if (isFullScan) {
      await updateUnusedKeyLogs(foundKeysSet, existingFound);
    }

    setShowScanResults(true);
  };

  const updateUnusedKeyLogs = async (foundKeysSet, existingFound) => {
    const now = new Date().toISOString();
    let logsUpdated = [...unusedKeyLogs];

    try {
      const unusedKeys = translations.filter(t => !foundKeysSet.has(t.key));

      for (const t of unusedKeys) {
        const existingLog = logsUpdated.find(l => l.translation_key === t.key);

        if (existingLog) {
          const updated = { scan_count: existingLog.scan_count + 1, last_detected_at: now };
          await UnusedKeyLog.update(existingLog.id, updated);
          logsUpdated = logsUpdated.map(l => l.id === existingLog.id ? { ...l, ...updated } : l);
        } else {
          const created = await UnusedKeyLog.create({
            translation_key: t.key,
            translation_id: t.id || null,
            first_detected_at: now,
            last_detected_at: now,
            scan_count: 1,
          });
          logsUpdated.push(created);
        }
      }

      for (const key of existingFound) {
        const existingLog = logsUpdated.find(l => l.translation_key === key);
        if (existingLog) {
          await UnusedKeyLog.delete(existingLog.id);
          logsUpdated = logsUpdated.filter(l => l.id !== existingLog.id);
        }
      }

      setUnusedKeyLogs(logsUpdated);
    } catch (e) {
      console.error("Failed to update UnusedKeyLog:", e);
    }
  };

  const scanSource = (source) => {
    if (!source.source_code || source.source_code === "// Paste code here") {
      toast.error('No code to scan', { id: 'ta1' });
      return;
    }
    performScan(source.page_name, source.source_code, false);
  };

  // FIX BUG-TA-024: Guard against re-entrant scanAllSources
  const scanAllSources = async () => {
    if (isScanning) return;
    setIsScanning(true);

    let allCode = '';
    let count = 0;

    setScanProgress({ current: 0, total: pageSources.length, status: 'Preparing...' });

    for (let i = 0; i < pageSources.length; i++) {
      const source = pageSources[i];
      setScanProgress({ current: i + 1, total: pageSources.length, status: `Scanning: ${source.display_name || source.page_name}` });

      if (source.source_code && source.source_code !== "// Paste code here") {
        allCode += `\n// --- ${source.page_name} ---\n${source.source_code}\n`;
        count++;
      }
      await new Promise(r => setTimeout(r, 50));
    }

    setScanProgress({ current: 0, total: 0, status: '' });

    if (count === 0) {
      toast.error('No sources with code', { id: 'ta1' });
      return;
    }

    const foundKeys = extractKeysFromCode(allCode);
    const existingKeys = new Set(translations.map(t => t.key));
    const foundKeysSet = new Set(foundKeys);

    const newKeys = foundKeys.filter(k => !existingKeys.has(k));
    const existingFound = foundKeys.filter(k => existingKeys.has(k));
    const unusedKeys = translations.filter(t => !foundKeysSet.has(t.key)).map(t => t.key);

    setScanResults({ new: newKeys, existing: existingFound, unused: unusedKeys, sourceName: `${count} sources`, isFullScan: true });

    setSaving(true);
    await updateUnusedKeyLogs(foundKeysSet, existingFound);
    setSaving(false);

    setShowScanResults(true);
  };

  const addScannedKeys = async (keys) => {
    if (keys.length === 0) return;

    setSaving(true);
    setAddKeysProgress({ current: 0, total: keys.length, status: 'Starting...' });

    let added = 0, errors = 0;

    try {
      for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        setAddKeysProgress({ current: i + 1, total: keys.length, status: `Adding: ${key}` });

        try {
          const page = key.split('.')[0] || '';
          const created = await InterfaceTranslation.create({ key, page, translations: {}, is_active: true });
          setTranslations(prev => [...prev, created]);
          added++;
        } catch { errors++; }

        if (i < keys.length - 1) await new Promise(r => setTimeout(r, 100));
      }

      setScanResults(prev => ({ ...prev, new: [] }));
      toast.success(`Added ${added} keys${errors > 0 ? `, ${errors} errors` : ''}`, { id: 'ta1' });

      try { await refreshTranslations(); } catch { toast.error('Live sync failed. Reload to see changes.', { id: 'ta-sync' }); }
    } catch { toast.error('Failed', { id: 'ta1' }); }
    finally { setSaving(false); setAddKeysProgress({ current: 0, total: 0, status: '' }); }
  };

  // === TRANSLATIONS ===

  const addTranslation = async () => {
    if (!newTranslation.key) return;
    if (translations.find(t => t.key === newTranslation.key)) {
      toast.error('Key exists', { id: 'ta1' });
      return;
    }
    setSaving(true);
    try {
      const created = await InterfaceTranslation.create({ key: newTranslation.key, page: newTranslation.page || null, description: newTranslation.description || null, translations: newTranslation.translations || {}, is_active: true });
      setTranslations(prev => [...prev, created]);
      setNewTranslation({ key: '', page: '', description: '', translations: {} });
      setShowAddTranslation(false);
      setExpandedKeys(new Set([...expandedKeys, created.key]));
      toast.success('Added', { id: 'ta1' });
    } catch (err) {
      console.error("Failed to add translation:", err);
      toast.error('Failed', { id: 'ta1' });
    } finally {
      setSaving(false);
    }
  };

  // FIX BUG-TA-002: Re-throw error so TranslationRow.saveEdit keeps edit open on failure
  const updateTranslation = async (id, updates) => {
    setSaving(true);
    try {
      await InterfaceTranslation.update(id, updates);
      setTranslations(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
      toast.success('Saved', { id: 'ta1' });
      refreshTranslations().catch(() => {});
    } catch (err) {
      console.error("Failed to update translation:", err);
      toast.error('Failed to save translation', { id: 'ta1' });
      throw err; // Re-throw so caller (TranslationRow.saveEdit) can keep edit open
    } finally {
      setSaving(false);
    }
  };

  const deleteTranslation = async (translation) => {
    if (!confirm(`Delete "${translation.key}"?`)) return;
    setSaving(true);
    try {
      await InterfaceTranslation.delete(translation.id);
      setTranslations(prev => prev.filter(t => t.id !== translation.id));
      const log = unusedKeyLogs.find(l => l.translation_key === translation.key);
      if (log) {
        await UnusedKeyLog.delete(log.id);
        setUnusedKeyLogs(prev => prev.filter(l => l.id !== log.id));
      }
      toast.success('Deleted', { id: 'ta1' });
    } catch (err) {
      console.error("Failed to delete translation:", err);
      toast.error('Failed', { id: 'ta1' });
    } finally {
      setSaving(false);
    }
  };

  const deleteUnusedKeys = async () => {
    const safeToDelete = unusedKeyLogs.filter(l => l.scan_count >= unusedThreshold);
    if (safeToDelete.length === 0) {
      toast.success('Nothing to delete', { id: 'ta1' });
      setShowDeleteUnused(false);
      return;
    }

    setSaving(true);
    setDeleteProgress({ current: 0, total: safeToDelete.length, status: 'Starting...' });

    let deleted = 0;

    // FIX BUG-TA-003: Track errors, update state only after both API calls succeed
    let errors = 0;

    try {
      for (let i = 0; i < safeToDelete.length; i++) {
        const log = safeToDelete[i];
        setDeleteProgress({ current: i + 1, total: safeToDelete.length, status: `Deleting: ${log.translation_key}` });

        try {
          const translation = translations.find(t => t.key === log.translation_key);
          if (translation) {
            await InterfaceTranslation.delete(translation.id);
          }
          await UnusedKeyLog.delete(log.id);
          // Only update local state after both API calls succeed
          if (translation) setTranslations(prev => prev.filter(t => t.id !== translation.id));
          setUnusedKeyLogs(prev => prev.filter(l => l.id !== log.id));
          deleted++;
        } catch (err) {
          console.error(`Failed to delete key ${log.translation_key}:`, err);
          errors++;
        }

        if (i < safeToDelete.length - 1) await new Promise(r => setTimeout(r, 100));
      }

      toast.success(`Deleted ${deleted} keys${errors > 0 ? `, ${errors} failed` : ''}`, { id: 'ta1' });
      setShowDeleteUnused(false);
    } catch { toast.error('Failed', { id: 'ta1' }); }
    finally { setSaving(false); setDeleteProgress({ current: 0, total: 0, status: '' }); }
  };

  // === IMPORT / EXPORT ===

  const handleExportCSV = (download = true) => {
    const content = generateCSV(translations, languages);
    if (download) {
      downloadFile(content, 'translations.csv', 'text/csv');
      toast.success('Downloaded', { id: 'ta1' });
    } else {
      setExportText({ content, filename: 'translations.csv', title: `CSV Export (${translations.length} keys)` });
      setShowExportText(true);
    }
  };

  const handleExportCSVMissing = (download = true) => {
    let langCode = null;
    if (filterStatus.startsWith('missing-')) langCode = filterStatus.replace('missing-', '');
    const { csv, count } = generateCSVMissing(translations, languages, langCode);
    if (count === 0) {
      toast.success('No missing translations!', { id: 'ta1' });
      return;
    }
    if (download) {
      downloadFile(csv, 'translations_missing.csv', 'text/csv');
      toast.success(`Exported ${count} keys`, { id: 'ta1' });
    } else {
      setExportText({ content: csv, filename: 'translations_missing.csv', title: `Missing Translations (${count} keys)` });
      setShowExportText(true);
    }
  };

  const handleFilterByLang = (langCode) => {
    setFilterStatus(`missing-${langCode}`);
    setActiveTab('translations');
  };

  const handleImportCSV = async () => {
    if (!importCSV.trim()) {
      toast.error('Paste CSV content', { id: 'ta1' });
      return;
    }

    // FIX BUG-TA-005: Deduplicate parsed rows, commit partial progress on error
    const parsed = parseCSV(importCSV, languages);
    if (parsed.length === 0) {
      toast.error('No valid data', { id: 'ta1' });
      return;
    }

    // Deduplicate: last row wins (matches Excel/Sheets behavior)
    const deduped = [...new Map(parsed.map(item => [item.key, item])).values()];

    setSaving(true);
    setImportProgress({ current: 0, total: deduped.length, status: 'Starting...' });

    let created = 0, updated = 0, skipped = 0;
    let localTranslations = [...translations];

    try {
      for (let i = 0; i < deduped.length; i++) {
        const item = deduped[i];
        setImportProgress({ current: i + 1, total: deduped.length, status: `Processing: ${item.key}` });

        const existingIdx = localTranslations.findIndex(t => t.key === item.key);
        const existing = existingIdx >= 0 ? localTranslations[existingIdx] : null;

        if (existing) {
          if (importMode === 'addOnly') { skipped++; continue; }

          let newTrans = { ...existing.translations };
          for (const [lang, value] of Object.entries(item.translations)) {
            if (importMode === 'overwrite' || !newTrans[lang]) {
              if (value) newTrans[lang] = value;
            }
          }

          await InterfaceTranslation.update(existing.id, { translations: newTrans, page: item.page || existing.page, description: item.description || existing.description });
          localTranslations[existingIdx] = { ...existing, translations: newTrans, page: item.page || existing.page, description: item.description || existing.description };
          updated++;
        } else {
          const createdItem = await InterfaceTranslation.create({ key: item.key, page: item.page || null, description: item.description || null, translations: item.translations, is_active: true });
          localTranslations.push(createdItem);
          created++;
        }

        if (i < deduped.length - 1) await new Promise(r => setTimeout(r, 100));
      }

      setTranslations(localTranslations);
      setImportCSV('');
      setShowImportCSV(false);
      setImportProgress({ current: 0, total: 0, status: '' });

      toast.success(`${created} created, ${updated} updated${skipped > 0 ? `, ${skipped} skipped` : ''}`, { id: 'ta1' });

      try {
        await refreshTranslations();
        toast.success('Synced!', { id: 'ta2' });
      } catch {
        toast.error('Import saved, but live sync failed. Reload to see changes.', { id: 'ta2' });
      }
    } catch (e) {
      console.error("Import failed:", e);
      // Commit partial progress so already-saved items reflect in UI
      setTranslations(localTranslations);
      toast.error(`Import failed at row ${created + updated + skipped + 1}`, { id: 'ta1' });
      setImportProgress({ current: 0, total: 0, status: '' });
    } finally { setSaving(false); }
  };

  // UI helpers
  const toggleExpand = (key) => {
    const newSet = new Set(expandedKeys);
    if (newSet.has(key)) newSet.delete(key); else newSet.add(key);
    setExpandedKeys(newSet);
  };

  const expandAll = () => setExpandedKeys(new Set(filteredTranslations.map(t => t.key)));
  const collapseAll = () => setExpandedKeys(new Set());

  // Loading
  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  if (!isAdmin) return <AccessDenied userEmail={user?.email} />;

  const safeToDeleteKeys = unusedKeyLogs.filter(l => l.scan_count >= unusedThreshold);

  return (
    <div className="min-h-screen bg-slate-50">
      <AdminHeader stats={stats} saving={saving} onLogout={logout} userEmail={user?.email} />

      <div className="max-w-5xl mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="translations" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />Translations ({stats.total})
            </TabsTrigger>
            <TabsTrigger value="sources" className="flex items-center gap-2">
              <FolderOpen className="h-4 w-4" />Sources ({stats.sourcesWithCode}/{stats.sourcesTotal})
            </TabsTrigger>
            <TabsTrigger value="languages" className="flex items-center gap-2">
              <Languages className="h-4 w-4" />Languages ({activeLangs.length})
            </TabsTrigger>
          </TabsList>

          {/* TRANSLATIONS TAB */}
          <TabsContent value="translations" className="space-y-4">
            <LanguageStats langStats={stats.langStats} total={stats.total} onFilterByLang={handleFilterByLang} />

            <div className="bg-white rounded-xl border p-4">
              <div className="flex flex-wrap items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => setShowAddTranslation(true)}>
                  <Plus className="h-4 w-4 mr-1" />Add Key
                </Button>
                <div className="h-6 w-px bg-slate-200 mx-1" />

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm"><Download className="h-4 w-4 mr-1" />Export<ChevronDown className="h-3.5 w-3.5 ml-1" /></Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    <DropdownMenuItem onClick={() => handleExportCSV(true)}><Download className="h-4 w-4 mr-2" />Download CSV</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleExportCSV(false)}><Eye className="h-4 w-4 mr-2" />Show CSV (copy)</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => handleExportCSVMissing(true)}><Download className="h-4 w-4 mr-2" />Download Missing</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleExportCSVMissing(false)}><Eye className="h-4 w-4 mr-2" />Show Missing (copy)</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <Button variant="outline" size="sm" onClick={() => setShowImportCSV(true)}>
                  <Upload className="h-4 w-4 mr-1" />Import CSV
                </Button>

                {stats.unusedSafeToDelete > 0 && (
                  <>
                    <div className="h-6 w-px bg-slate-200 mx-1" />
                    <Button variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50" onClick={() => setShowDeleteUnused(true)}>
                      <Trash2 className="h-4 w-4 mr-1" />Delete {stats.unusedSafeToDelete} unused
                    </Button>
                  </>
                )}

                <Button variant="ghost" size="sm" onClick={() => setShowSettings(true)} className="ml-auto">
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="bg-white rounded-xl border p-4">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex-1 min-w-[200px]">
                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search..." className="pl-9" />
                  </div>
                </div>
                <Select value={filterPage} onValueChange={setFilterPage}>
                  <SelectTrigger className="w-[140px]"><SelectValue placeholder="Page" /></SelectTrigger>
                  <SelectContent>{pages.map(p => <SelectItem key={p} value={p}>{p === 'all' ? 'All pages' : p}</SelectItem>)}</SelectContent>
                </Select>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-[160px]"><SelectValue placeholder="Status" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="missing">Missing any</SelectItem>
                    <SelectItem value="complete">Complete</SelectItem>
                    {stats.unusedSafeToDelete > 0 && <SelectItem value="unused-safe">Unused ({stats.unusedSafeToDelete})</SelectItem>}
                  </SelectContent>
                </Select>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="sm" onClick={expandAll}>Expand</Button>
                  <Button variant="ghost" size="sm" onClick={collapseAll}>Collapse</Button>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              {filteredTranslations.length === 0 ? (
                <div className="bg-white rounded-xl border p-8 text-center text-slate-500">No translations found</div>
              ) : filteredTranslations.map(t => (
                <TranslationRow key={t.id} translation={t} languages={languages} unusedInfo={unusedKeyMap.get(t.key)}
                  onUpdate={updateTranslation} onDelete={deleteTranslation} expanded={expandedKeys.has(t.key)} onToggleExpand={() => toggleExpand(t.key)} />
              ))}
            </div>
          </TabsContent>

          {/* SOURCES TAB */}
          <TabsContent value="sources" className="space-y-4">
            {scanProgress.total > 0 && <OperationProgress progress={scanProgress} />}

            <div className="bg-white rounded-xl border p-4">
              <div className="flex flex-wrap items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => setShowAddSource(true)}>
                  <Plus className="h-4 w-4 mr-1" />Add Source
                </Button>
                <Button variant="outline" size="sm" onClick={scanAllSources} disabled={saving}>
                  <Search className="h-4 w-4 mr-1" />Scan All
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm"><Component className="h-4 w-4 mr-1" />Quick Add<ChevronDown className="h-3.5 w-3.5 ml-1" /></Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    {PREDEFINED_SOURCES.filter(p => !pageSources.find(s => s.page_name === p.name)).map(p => (
                      <DropdownMenuItem key={p.name} onClick={() => addSourceDirect({ name: p.name, display: p.display, type: p.type })}>
                        {p.type === 'component' ? <Component className="h-4 w-4 mr-2 text-purple-500" /> : <File className="h-4 w-4 mr-2" />}
                        {p.display} <span className="text-xs text-slate-400 ml-2">{p.hint}</span>
                      </DropdownMenuItem>
                    ))}
                    {PREDEFINED_SOURCES.filter(p => !pageSources.find(s => s.page_name === p.name)).length === 0 && (
                      <DropdownMenuItem disabled>All added</DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            <div className="space-y-2">
              {pageSources.length === 0 ? (
                <div className="bg-white rounded-xl border p-8 text-center text-slate-500">No sources yet</div>
              ) : pageSources.map(source => (
                <SourceRow key={source.id} source={source} tracker={getTracker(source.page_name)}
                  onUpdateCode={openUpdateCode} onScan={scanSource} onDelete={deleteSource} />
              ))}
            </div>
          </TabsContent>

          {/* LANGUAGES TAB */}
          <TabsContent value="languages" className="space-y-4">
            <div className="bg-white rounded-xl border p-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-medium">Available Languages</h2>
                <Button size="sm" variant="outline" onClick={() => setShowAddLang(true)}><Plus className="h-4 w-4 mr-1" />Add</Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {languages.map(lang => (
                  <LanguageChip key={lang.id} lang={lang} isDefault={lang.is_default} onSetDefault={setDefaultLanguage} onToggle={toggleLanguage} onDelete={deleteLanguage} />
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* DIALOGS */}

      {/* Add Language */}
      <Dialog open={showAddLang} onOpenChange={setShowAddLang}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Language</DialogTitle><DialogDescription>Add a new language</DialogDescription></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>Code</Label><Input value={newLang.code} onChange={(e) => setNewLang({ ...newLang, code: e.target.value })} placeholder="uz" maxLength={3} /></div>
            <div className="space-y-2"><Label>Name</Label><Input value={newLang.name} onChange={(e) => setNewLang({ ...newLang, name: e.target.value })} placeholder="O'zbek" /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddLang(false)}>Cancel</Button>
            <Button onClick={addLanguage} disabled={!newLang.code || !newLang.name || saving}>{saving ? 'Adding...' : 'Add'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Source */}
      <Dialog open={showAddSource} onOpenChange={(open) => { if (!addSourceBusy) setShowAddSource(open); }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Source</DialogTitle><DialogDescription>Add a page or component to track</DialogDescription></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Type</Label>
              <div className="flex gap-2">
                <button type="button" onClick={() => setNewSource({ ...newSource, type: 'page' })} disabled={addSourceBusy}
                  className={`flex-1 p-3 rounded-lg border text-left transition-colors ${newSource.type === 'page' ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200 hover:border-slate-300'} ${addSourceBusy ? 'opacity-50 cursor-not-allowed' : ''}`}>
                  <FileCode className="h-5 w-5 mb-1" /><div className="font-medium text-sm">Page</div><div className="text-xs text-slate-500">pages/...</div>
                </button>
                <button type="button" onClick={() => setNewSource({ ...newSource, type: 'component' })} disabled={addSourceBusy}
                  className={`flex-1 p-3 rounded-lg border text-left transition-colors ${newSource.type === 'component' ? 'border-purple-500 bg-purple-50' : 'border-slate-200 hover:border-slate-300'} ${addSourceBusy ? 'opacity-50 cursor-not-allowed' : ''}`}>
                  <Component className="h-5 w-5 mb-1 text-purple-500" /><div className="font-medium text-sm">Component</div><div className="text-xs text-slate-500">components/...</div>
                </button>
              </div>
            </div>
            <div className="space-y-2"><Label>Name *</Label><Input value={newSource.name} onChange={(e) => setNewSource({ ...newSource, name: e.target.value })} placeholder="partnerhome" disabled={addSourceBusy} /></div>
            <div className="space-y-2"><Label>Display Name</Label><Input value={newSource.display} onChange={(e) => setNewSource({ ...newSource, display: e.target.value })} placeholder="Partner Home" disabled={addSourceBusy} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddSource(false)} disabled={addSourceBusy}>Cancel</Button>
            <Button onClick={addSource} disabled={!newSource.name || saving || addSourceBusy}>
              {addSourceBusy ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Adding...</> : 'Add'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Update Code */}
      <Dialog open={showUpdateCode} onOpenChange={(open) => { if (!saving) { setShowUpdateCode(open); if (!open) setUpdateCodeProgress({ current: 0, total: 0, status: '' }); }}}>
        <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Update Code: {editingSource?.display_name || editingSource?.page_name}</DialogTitle>
            <DialogDescription>Paste the full source code from Base44 editor</DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-hidden space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <Label className="text-xs text-slate-500">Version (manual)</Label>
                <Input value={editingVersion} onChange={(e) => setEditingVersion(e.target.value)} placeholder="260119-00" className="h-8 font-mono" disabled={saving} />
              </div>
              <div className="text-sm text-slate-500 pt-5">{countLines(editingCode)} lines</div>
            </div>
            <Textarea value={editingCode} onChange={(e) => setEditingCode(e.target.value)} placeholder="Paste code here..." className="min-h-[350px] max-h-[450px] font-mono text-sm" disabled={saving} />
            <OperationProgress progress={updateCodeProgress} />
            <p className="text-xs text-slate-500">💡 In Base44: Open page → Select all code → Copy → Paste here</p>
          </div>
          <DialogFooter className="flex-col-reverse sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setShowUpdateCode(false)} disabled={saving}>Cancel</Button>
            <Button variant="outline" onClick={saveSourceCode} disabled={saving}>
              <Save className="h-4 w-4 mr-1" />Save Only
            </Button>
            <Button variant="outline" onClick={saveAndScan} disabled={saving || !editingCode}>
              <Search className="h-4 w-4 mr-1" />Save & Scan
            </Button>
            <Button onClick={saveAndScanAndAdd} disabled={saving || !editingCode} className="bg-green-600 hover:bg-green-700">
              <Zap className="h-4 w-4 mr-1" />{saving ? 'Processing...' : 'Save+Scan+Add'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Scan Results */}
      <Dialog open={showScanResults} onOpenChange={setShowScanResults}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Scan Results: {scanResults.sourceName}</DialogTitle>
            <DialogDescription>
              Found {scanResults.new.length + scanResults.existing.length} keys
              {!scanResults.isFullScan && scanResults.unused.length > 0 && (
                <span className="text-amber-600 ml-2">(run "Scan All" to track unused)</span>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 max-h-[60vh] overflow-y-auto">
            {scanResults.new.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-green-700 flex items-center gap-1"><Plus className="h-4 w-4" />New ({scanResults.new.length})</span>
                  <Button size="sm" onClick={() => addScannedKeys(scanResults.new)} disabled={saving}>
                    {saving && addKeysProgress.total > 0 ? <><Loader2 className="h-4 w-4 animate-spin mr-1" />{addKeysProgress.current}/{addKeysProgress.total}</> : <><Plus className="h-4 w-4 mr-1" />Add all</>}
                  </Button>
                </div>
                <OperationProgress progress={addKeysProgress} color="bg-green-500" />
                <div className="flex flex-wrap gap-1">{scanResults.new.map(k => <code key={k} className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">{k}</code>)}</div>
              </div>
            )}

            {scanResults.unused.length > 0 && (
              <div>
                <span className="text-sm font-medium text-amber-700 flex items-center gap-1 mb-2">
                  <AlertTriangle className="h-4 w-4" />
                  {scanResults.isFullScan ? 'Unused' : 'Not in this source'} ({scanResults.unused.length})
                  {!scanResults.isFullScan && <span className="text-xs font-normal text-slate-500 ml-1">(preview)</span>}
                </span>
                <div className="flex flex-wrap gap-1">{scanResults.unused.slice(0, 30).map(k => <code key={k} className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded">{k}</code>)}
                  {scanResults.unused.length > 30 && <span className="text-xs text-slate-500">...+{scanResults.unused.length - 30} more</span>}
                </div>
              </div>
            )}

            {scanResults.existing.length > 0 && (
              <div>
                <span className="text-sm font-medium text-slate-500 flex items-center gap-1 mb-2"><Check className="h-4 w-4" />Existing ({scanResults.existing.length})</span>
                <div className="flex flex-wrap gap-1">{scanResults.existing.slice(0, 20).map(k => <code key={k} className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded">{k}</code>)}
                  {scanResults.existing.length > 20 && <span className="text-xs text-slate-500">...+{scanResults.existing.length - 20} more</span>}
                </div>
              </div>
            )}
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setShowScanResults(false)}>Close</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Translation */}
      <Dialog open={showAddTranslation} onOpenChange={setShowAddTranslation}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Key</DialogTitle><DialogDescription>Add manually</DialogDescription></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>Key *</Label><Input value={newTranslation.key} onChange={(e) => setNewTranslation({ ...newTranslation, key: e.target.value })} placeholder="nav.home" /></div>
            <div className="space-y-2"><Label>Page</Label><Input value={newTranslation.page} onChange={(e) => setNewTranslation({ ...newTranslation, page: e.target.value })} placeholder="common" /></div>
            <div className="space-y-2"><Label>Description</Label><Input value={newTranslation.description} onChange={(e) => setNewTranslation({ ...newTranslation, description: e.target.value })} placeholder="Navigation home" /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddTranslation(false)}>Cancel</Button>
            <Button onClick={addTranslation} disabled={!newTranslation.key || saving}>{saving ? 'Adding...' : 'Add'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Import CSV */}
      <Dialog open={showImportCSV} onOpenChange={setShowImportCSV}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>Import CSV</DialogTitle><DialogDescription>Paste CSV with: key, page, description, ru, en, kk</DialogDescription></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Mode</Label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'merge', label: 'Merge', desc: 'Fill empty only' },
                  { id: 'overwrite', label: 'Overwrite', desc: 'Replace values' },
                  { id: 'addOnly', label: 'Add only', desc: 'New keys only' }
                ].map(m => (
                  <button key={m.id} type="button" onClick={() => setImportMode(m.id)}
                    className={`p-3 rounded-lg border text-left ${importMode === m.id ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200'}`}>
                    <div className="font-medium text-sm">{m.label}</div><div className="text-xs text-slate-500">{m.desc}</div>
                  </button>
                ))}
              </div>
            </div>
            <Textarea value={importCSV} onChange={(e) => setImportCSV(e.target.value)} placeholder='"key","page","description","ru","en","kk"&#10;"nav.home","common","Home","Главная","Home","Басты"' className="min-h-[180px] font-mono text-sm" disabled={saving} />
            <OperationProgress progress={importProgress} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowImportCSV(false); setImportProgress({ current: 0, total: 0, status: '' }); }} disabled={saving}>Cancel</Button>
            <Button onClick={handleImportCSV} disabled={!importCSV.trim() || saving}>{saving ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Importing...</> : `Import (${importMode})`}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Unused */}
      <Dialog open={showDeleteUnused} onOpenChange={setShowDeleteUnused}>
        <DialogContent>
          <DialogHeader><DialogTitle className="text-red-600 flex items-center gap-2"><Trash2 className="h-5 w-5" />Delete Unused</DialogTitle>
            <DialogDescription>{safeToDeleteKeys.length} keys will be deleted</DialogDescription></DialogHeader>
          <div className="space-y-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 max-h-[200px] overflow-y-auto">
              <div className="flex flex-wrap gap-1">{safeToDeleteKeys.map(l => <code key={l.id} className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">{l.translation_key}</code>)}</div>
            </div>
            <OperationProgress progress={deleteProgress} color="bg-red-500" />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteUnused(false)}>Cancel</Button>
            <Button variant="destructive" onClick={deleteUnusedKeys} disabled={saving}>{saving ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Deleting...</> : `Delete ${safeToDeleteKeys.length}`}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Export Text (Copy) */}
      <Dialog open={showExportText} onOpenChange={(open) => { setShowExportText(open); if (!open) setCopied(false); }}>
        <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>{exportText.title}</DialogTitle>
            <DialogDescription>Copy or download</DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-hidden">
            <Textarea value={exportText.content} readOnly className="min-h-[400px] max-h-[500px] font-mono text-xs bg-slate-50" />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowExportText(false)}>Close</Button>
            <Button
              variant="outline"
              onClick={() => copyToClipboard(exportText.content, setCopied)}
              className={copied ? "border-green-500 text-green-600 bg-green-50" : ""}
            >
              {copied ? <><Check className="h-4 w-4 mr-1" />Copied!</> : <><Copy className="h-4 w-4 mr-1" />Copy</>}
            </Button>
            <Button onClick={() => { downloadFile(exportText.content, exportText.filename, 'text/csv'); toast.success('Downloaded', { id: 'ta1' }); }}><Download className="h-4 w-4 mr-1" />Download</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Settings */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent>
          <DialogHeader><DialogTitle>Settings</DialogTitle><DialogDescription>Configure behavior</DialogDescription></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Unused threshold</Label>
              <div className="flex items-center gap-3">
                <Input type="number" min={1} max={10} value={unusedThreshold} onChange={(e) => setUnusedThreshold(Math.max(1, Math.min(10, parseInt(e.target.value) || 3)))} className="w-20" />
                <span className="text-sm text-slate-500">scans</span>
              </div>
              <p className="text-xs text-slate-500">Keys not found for {unusedThreshold}+ scans → "safe to delete"</p>
            </div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setShowSettings(false)}>Close</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
