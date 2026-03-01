// Version: 1.6 (2026-03-01) — Phase 1v2: zone overflow menu, 8px button spacing, CC+Codex verified
import React, { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import QRCode from "qrcode";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "sonner";
import {
  ChevronRight,
  ChevronUp,
  ChevronDown,
  Copy,
  GripVertical,
  Loader2,
  MoreVertical,
  Pencil,
  Plus,
  Search,
  Settings,
  Trash2,
  RefreshCw,
  Circle,
  QrCode,
  Download,
  Printer,
  X,
} from "lucide-react";
import PartnerShell from "@/components/PartnerShell";
import { useI18n } from "@/components/i18n";
import { isSessionExpired, closeSession, getSessionGuests, getSessionOrders } from "@/components/sessionHelpers";
import PageHelpButton from "@/components/PageHelpButton";

/* ============================================================
   CONSTANTS
   ============================================================ */

const ORDER_STEP = 1000;
const BATCH_SIZE = 5;
const MAX_CODE_GENERATION_ATTEMPTS = 20;
const UNDO_TIMEOUT_MS = 5000; // 5 seconds for undo
const PRINT_WINDOW_RENDER_DELAY_MS = 250; // P2-4: delay for print window to render QR codes

// P0-1: Toast id changed to 'mm1' (was 'pt')
const STORAGE_KEYS = {
  UI_STATE: 'partnertables_ui',
  TOAST_ID: 'mm1',
};

const getQrSizes = (t) => ({
  // P0-6: Removed || fallbacks
  small: { size: 128, label: t('partnertables.qr.size.small') },
  medium: { size: 200, label: t('partnertables.qr.size.medium') },
  large: { size: 300, label: t('partnertables.qr.size.large') },
  xlarge: { size: 400, label: t('partnertables.qr.size.xlarge') },
});

// Layout = columns per row (not per page)
// P0-6: Removed || fallbacks
const getPrintLayouts = (t) => [
  { value: "2", label: t('partnertables.qr.cols.two'), cols: 2 },
  { value: "3", label: t('partnertables.qr.cols.three'), cols: 3 },
  { value: "4", label: t('partnertables.qr.cols.four'), cols: 4 },
];

// Roles that can close tables (D2-005)
const CLOSE_TABLE_ROLES = ['partner_manager', 'partner_staff', 'director', 'managing_director', 'partner_owner'];

/* ============================================================
   HELPERS
   ============================================================ */

// D2-003: Normalize link fields (can be string ID or object with id/_id/value)
// P0-7: Expanded to handle _id, value; validates result type
function getLinkId(field) {
  if (!field) return null;
  if (typeof field === 'string') return field;
  if (typeof field === 'number') return String(field);
  if (typeof field === 'object') {
    const candidate = field.id ?? field._id ?? field.value;
    // Only return string/number, not nested objects
    if (typeof candidate === 'string') return candidate;
    if (typeof candidate === 'number') return String(candidate);
  }
  return null;
}

function normStr(s) {
  return (s ?? "").toString().trim();
}

function sortByOrder(arr) {
  return [...(arr || [])].sort((a, b) => {
    const ao = Number.isFinite(+a?.sort_order) ? +a.sort_order : 1e9;
    const bo = Number.isFinite(+b?.sort_order) ? +b.sort_order : 1e9;
    if (ao !== bo) return ao - bo;
    const aNum = getTableNumber(a);
    const bNum = getTableNumber(b);
    if (aNum !== bNum) return aNum - bNum;
    return normStr(a?.name || a?.code).localeCompare(normStr(b?.name || b?.code), "ru");
  });
}

function getTableNumber(table) {
  if (!table) return 0;
  if (table.number != null && table.number !== "") {
    return Number(table.number) || 0;
  }
  const name = normStr(table.name);
  const match = name.match(/(\d+)/);
  return match ? Number(match[1]) : 0;
}

function displayTableNumber(table) {
  const num = getTableNumber(table);
  return num > 0 ? String(num) : "—";
}

function escapeHtml(input) {
  const s = String(input ?? "");
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function moveIndex(list, from, to) {
  const next = [...list];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

function generate4DigitCode() {
  return String(Math.floor(Math.random() * 10000)).padStart(4, "0");
}

function generateUniqueCode(existingCodes, maxAttempts = MAX_CODE_GENERATION_ATTEMPTS) {
  for (let i = 0; i < maxAttempts; i++) {
    const code = generate4DigitCode();
    if (!existingCodes.has(code)) {
      return code;
    }
  }
  return null;
}

function computeMidOrder(prev, next) {
  const p = typeof prev === "number" ? prev : null;
  const n = typeof next === "number" ? next : null;

  if (p !== null && n !== null) {
    const mid = Math.floor((p + n) / 2);
    if (mid > p + 2 && mid < n - 2) return mid;
    return null;
  }
  if (p !== null) return p + ORDER_STEP;
  if (n !== null) return n - ORDER_STEP;
  return ORDER_STEP;
}

function pluralize(count, one, few, many) {
  const n = Math.abs(count) % 100;
  const n1 = n % 10;
  if (n > 10 && n < 20) return many;
  if (n1 > 1 && n1 < 5) return few;
  if (n1 === 1) return one;
  return many;
}

/* ============================================================
   QR CODE HELPERS (Client-side with logo support)
   ============================================================ */

function getTableQRUrl(partner, table) {
  const baseUrl = window.location.origin;
  const partnerSlug = encodeURIComponent(partner?.slug || partner?.id || "");
  const tableCode = encodeURIComponent(table?.code || table?.id || "");
  return `${baseUrl}/x?partner=${partnerSlug}&table=${tableCode}&mode=hall`;
}

// P0-10: Normalize areaField via getLinkId (handles string/object/link)
function getAreaName(areaField, areas, t) {
  const id = getLinkId(areaField);
  if (!id) return t('partnertables.no_area');
  const area = areas.find((a) => String(a.id) === String(id));
  return area?.name || t('partnertables.no_area');
}

// Load image as HTMLImageElement with CORS handling
async function loadImage(src) {
  // Try direct loading first
  try {
    const img = new Image();
    img.crossOrigin = "anonymous";
    
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
      img.src = src;
    });
    
    return img;
  } catch {
    // Fallback: fetch as blob
    try {
      const response = await fetch(src, { mode: 'cors' });
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      
      const img = new Image();
      await new Promise((resolve, reject) => {
        img.onload = () => {
          URL.revokeObjectURL(objectUrl);
          resolve();
        };
        img.onerror = () => {
          URL.revokeObjectURL(objectUrl);
          reject(new Error("Failed to load image from blob"));
        };
        img.src = objectUrl;
      });
      
      return img;
    } catch {
      throw new Error("Failed to load image");
    }
  }
}

// Generate QR code as data URL with optional logo overlay
async function generateQRDataUrl(value, size = 200, logoUrl = null) {
  try {
    // Create canvas and generate QR
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    
    await QRCode.toCanvas(canvas, value, {
      width: size,
      margin: 2,
      errorCorrectionLevel: logoUrl ? 'H' : 'M', // Higher error correction when using logo
      color: { dark: '#000000', light: '#ffffff' }
    });
    
    // Add logo if provided
    if (logoUrl) {
      try {
        const ctx = canvas.getContext('2d');
        const logo = await loadImage(logoUrl);
        
        // Logo size: 20% of QR code
        const logoSize = size * 0.2;
        const logoX = (size - logoSize) / 2;
        const logoY = (size - logoSize) / 2;
        
        // White background for logo (circle)
        ctx.beginPath();
        ctx.arc(size / 2, size / 2, logoSize / 2 + 4, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
        
        // Draw logo (circular clip)
        ctx.save();
        ctx.beginPath();
        ctx.arc(size / 2, size / 2, logoSize / 2, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(logo, logoX, logoY, logoSize, logoSize);
        ctx.restore();
      } catch (logoErr) {
        // If logo fails to load, continue without it
      }
    }
    
    return canvas.toDataURL('image/png');
  } catch {
    return null;
  }
}

// Download QR as PNG file
async function downloadQRCode(value, filename, size = 300, logoUrl = null) {
  try {
    const dataUrl = await generateQRDataUrl(value, size, logoUrl);
    if (!dataUrl) return false;
    
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = filename;
    link.click();
    return true;
  } catch {
    return false;
  }
}

// Client-side QR Code component using canvas with optional logo
function QRCodeImage({ value, size = 200, className = "", logoUrl = null }) {
  const canvasRef = useRef(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!canvasRef.current || !value) return;
    setReady(false);
    let cancelled = false;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    QRCode.toCanvas(canvas, value, {
      width: size,
      margin: 2,
      errorCorrectionLevel: logoUrl ? 'H' : 'M',
    }, async (err) => {
      if (err || cancelled) return;

      if (logoUrl) {
        try {
          const logo = await loadImage(logoUrl);
          if (cancelled) return;
          const logoSize = size * 0.2;
          const logoX = (size - logoSize) / 2;
          const logoY = (size - logoSize) / 2;

          ctx.beginPath();
          ctx.arc(size / 2, size / 2, logoSize / 2 + 3, 0, Math.PI * 2);
          ctx.fillStyle = '#ffffff';
          ctx.fill();

          ctx.save();
          ctx.beginPath();
          ctx.arc(size / 2, size / 2, logoSize / 2, 0, Math.PI * 2);
          ctx.clip();
          ctx.drawImage(logo, logoX, logoY, logoSize, logoSize);
          ctx.restore();
        } catch {}
      }

      if (!cancelled) setReady(true);
    });

    return () => { cancelled = true; };
  }, [value, size, logoUrl]);

  return (
    <canvas 
      ref={canvasRef}
      width={size}
      height={size}
      className={`${className} ${ready ? '' : 'opacity-50'}`}
      style={{ width: size, height: size }}
    />
  );
}

/* ============================================================
   API HELPERS
   ============================================================ */

async function getUser() {
  try {
    return await base44.auth.me();
  } catch {
    return null;
  }
}

async function listFor(entity, pid) {
  if (!pid) return [];
  
  try {
    const res = await base44.entities[entity].filter({ partner: pid });
    return Array.isArray(res) ? res : [];
  } catch (e) {
    const msg = String(e?.message || e).toLowerCase();
    if (msg.includes("rate limit") || msg.includes("429") || msg.includes("too many")) {
      throw new Error(`Rate limit exceeded for ${entity}`);
    }
    return [];
  }
}

// P0-3: Removed fallback to first partner - security fix
async function loadPartner(pid) {
  if (!pid) return null;
  
  try {
    const direct = await base44.entities.Partner.get(pid);
    if (direct) return direct;
  } catch {}
  
  try {
    const res = await base44.entities.Partner.filter({ id: pid });
    if (res?.[0]) return res[0];
  } catch {}
  
  return null;
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
   UI COMPONENTS (OUTSIDE main component)
   ============================================================ */

// FIX P1: Touch target 44px (h-11 w-11)
function GripHandle({ onDragStart, disabled }) {
  const { t } = useI18n();
  return (
    <div
      className={`flex h-11 w-11 items-center justify-center rounded transition-colors ${
        disabled
          ? "text-slate-200 cursor-not-allowed"
          : "text-slate-400 cursor-grab active:cursor-grabbing hover:text-slate-600 hover:bg-slate-100"
      }`}
      draggable={!disabled}
      onDragStart={disabled ? undefined : onDragStart}
      role="button"
      aria-label={t('partnertables.drag_to_reorder')}
      tabIndex={disabled ? -1 : 0}
    >
      <GripVertical className="h-5 w-5" />
    </div>
  );
}

// FIX P1: Better contrast (fill-slate-500 instead of fill-slate-400) + 44px touch target
function StatusDot({ active, onClick, label }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          onClick={onClick}
          aria-label={label}
          aria-pressed={active}
          className={`p-2 rounded-full transition-colors hover:bg-slate-100 h-11 w-11 flex items-center justify-center ${
            active ? "text-green-600" : "text-slate-500"
          }`}
        >
          <Circle className={`h-4 w-4 ${active ? "fill-green-500 stroke-green-600" : "fill-slate-500 stroke-slate-600"}`} />
        </button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}

// Reusable dialog footer
function DialogActions({ onCancel, onSave, saving, disabled, t }) {
  return (
    <DialogFooter className="flex-col gap-2 sm:flex-row sm:gap-2 pt-4">
      <Button 
        variant="outline" 
        type="button" onClick={onCancel} 
        disabled={saving}
        className="w-full sm:w-auto h-11"
      >
        {t('common.cancel')}
      </Button>
      <Button 
        type="button" onClick={onSave} 
        disabled={disabled || saving}
        className="w-full sm:w-auto h-11"
      >
        {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
        {saving ? t('common.saving') : t('common.save')}
      </Button>
    </DialogFooter>
  );
}

// Table code display
function TableCodeDisplay({ table, codeMode, unifiedCode }) {
  const { t } = useI18n();
  const code = table?.code || t('partnertables.table.code_missing');
  
  if (codeMode === "shared" && unifiedCode && code.startsWith(unifiedCode)) {
    const suffix = code.slice(unifiedCode.length);
    return (
      <code className="text-sm bg-slate-100 px-2 py-1 rounded font-mono inline-flex items-center">
        <span className="text-slate-500">{unifiedCode}</span>
        {suffix && (
          <span className="text-indigo-700 font-bold bg-indigo-100 px-1 rounded ml-0.5">{suffix}</span>
        )}
      </code>
    );
  }
  
  return (
    <code className="text-sm text-slate-600 bg-slate-100 px-2 py-1 rounded font-mono">
      {code}
    </code>
  );
}

/* ============================================================
   TableSessionInfo Component (D2-004)
   Shows session details: guests, orders, total amount
   ============================================================ */
function TableSessionInfo({ session, onClose, userRole, t }) {
  const [guests, setGuests] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // D2-011: Normalize session.id
  const sessionId = typeof session?.id === 'string' ? session.id : getLinkId(session);
  
  // D2-005: Check if user can close tables
  const canCloseTable = CLOSE_TABLE_ROLES.includes(userRole);
  
  useEffect(() => {
    if (!sessionId) return;
    
    // D2-010: Reset state on sessionId change
    setLoading(true);
    setGuests([]);
    setOrders([]);
    
    // D2-010: Race condition protection
    let cancelled = false;
    
    async function load() {
      try {
        const [g, o] = await Promise.all([
          getSessionGuests(sessionId),
          getSessionOrders(sessionId)
        ]);
        
        if (cancelled) return;
        
        setGuests(g || []);
        setOrders(o || []);
      } catch (err) {
        if (cancelled) return;
        if (process.env.NODE_ENV !== 'production') console.error("Error loading session info:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    
    load();
    
    return () => { cancelled = true; };
  }, [sessionId]);
  
  // Guard: no valid sessionId
  if (!sessionId) return null;
  
  if (loading) {
    return (
      <div className="mt-2 text-sm text-gray-400 flex items-center gap-2">
        <Loader2 className="h-3 w-3 animate-spin" />
        {t('common.loading')}
      </div>
    );
  }
  
  const totalAmount = orders.reduce((sum, o) => sum + (o.total_amount || 0), 0);
  
  // P0-6: Removed || fallbacks - using only t()
  return (
    <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
      <div className="flex justify-between text-gray-600">
        <span>{t('tables.guests_count', { count: guests.length })}</span>
        <span>{t('tables.orders_count', { count: orders.length })}</span>
      </div>
      <div className="flex justify-between mt-1">
        <span className="font-medium">{t('tables.total')}</span>
        <span className="font-medium">{totalAmount} ₸</span>
      </div>
      
      {/* D2-005: Button only for roles with permissions */}
      {canCloseTable && (
        <Button
          size="sm"
          variant="outline"
          onClick={onClose}
          className="w-full mt-2 text-red-600 border-red-200 hover:bg-red-50"
        >
          {t('tables.close_table')}
        </Button>
      )}
    </div>
  );
}

// AreaSection component (moved outside for stable reference)
// D2-003, D2-004: Now includes session status display
function AreaSection({
  area,
  tables,
  isNone,
  isExpanded,
  canReorder,
  dragOverAreaId,
  dragOverId,
  codeMode,
  unifiedCode,
  areas,
  sessionsByTable,
  userRole,
  t,
  onToggle,
  onDragOverArea,
  onDragLeaveArea,
  onDropArea,
  onAreaDragStart,
  onAreaDragOver,
  onAreaDrop,
  onTableDragOver,
  onTableDragLeave,
  onTableDrop,
  onTableDragStart,
  onOpenNewTable,
  onOpenQrForArea,
  onOpenEditArea,
  onDeleteArea,
  onToggleTableActive,
  onOpenQrSingle,
  onRegenerateCode,
  onOpenEditTable,
  onDeleteTable,
  onMoveTableUp,
  onMoveTableDown,
  onCloseSession,
}) {
  const areaId = isNone ? "none" : String(area.id);
  const count = tables.length;

  return (
    <div
      className={`rounded-lg border bg-white mb-3 ${
        dragOverAreaId === areaId ? "ring-2 ring-indigo-400" : ""
      }`}
      onDragOver={(e) => {
        e.preventDefault();
        if (e.dataTransfer.types.includes("table-id")) {
          onDragOverArea(areaId);
        }
      }}
      onDragLeave={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) {
          onDragLeaveArea();
        }
      }}
      onDrop={(e) => {
        onDragLeaveArea();
        if (e.dataTransfer.types.includes("table-id")) {
          onDropArea(e, areaId);
        }
      }}
    >
      {/* Area Header */}
      <div
        className={`px-3 py-2 ${isNone ? "bg-slate-50" : ""}`}
        draggable={!isNone && canReorder}
        onDragStart={(e) => {
          if (isNone) return;
          onAreaDragStart(e, areaId);
        }}
        onDragOver={(e) => {
          if (!isNone && e.dataTransfer.types.includes("area-id")) {
            e.preventDefault();
            onAreaDragOver(areaId);
          }
        }}
        onDrop={(e) => {
          if (!isNone && e.dataTransfer.types.includes("area-id")) {
            onAreaDrop(e, areaId);
          }
        }}
      >
        {/* Row 1: Info */}
        <div 
          className={`flex items-center gap-2 ${!isNone ? "cursor-pointer" : ""}`}
          onClick={() => onToggle(areaId)}
        >
          {/* P0-13: Fixed - pass real onDragStart to enable area drag */}
          {!isNone && (
            <GripHandle
              disabled={!canReorder}
              onDragStart={(e) => onAreaDragStart(e, areaId)}
            />
          )}
          
          {/* FIX P1: aria-expanded + 44px touch target */}
          <button 
            className="p-2 hover:bg-slate-100 rounded h-11 w-11 flex items-center justify-center"
            aria-label={isExpanded ? t('partnertables.collapse') : t('partnertables.expand')}
            aria-expanded={isExpanded}
          >
            <ChevronRight 
              className={`h-4 w-4 text-slate-500 transition-transform duration-200 ${
                isExpanded ? 'rotate-90' : ''
              }`} 
            />
          </button>

          <span className={`font-medium ${isNone ? "text-slate-500" : "text-slate-800"}`}>
            {isNone ? t('partnertables.no_area') : area.name}
          </span>
          
          <span className="text-sm text-slate-400">({count})</span>
        </div>

        {/* Row 2: Actions — primary + overflow menu */}
        <div className="flex items-center gap-2 mt-1.5 ml-6 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            className="h-11 text-xs"
            onClick={(e) => {
              e.stopPropagation();
              onOpenNewTable(areaId);
            }}
          >
            <Plus className="h-3.5 w-3.5 mr-1" />
            {t('partnertables.table')}
          </Button>

          {(!isNone || count > 0) && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-11 w-11 p-0"
                  aria-label={t('common.actions')}
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreVertical className="h-4 w-4 text-slate-400" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {count > 0 && (
                  <DropdownMenuItem onClick={(e) => onOpenQrForArea(areaId, e)}>
                    <QrCode className="h-4 w-4 mr-2" />
                    {t('partnertables.qr_area')}
                  </DropdownMenuItem>
                )}
                {!isNone && (
                  <>
                    {count > 0 && <DropdownMenuSeparator />}
                    <DropdownMenuItem onClick={(e) => onOpenEditArea(area, e)}>
                      <Pencil className="h-4 w-4 mr-2" />
                      {t('common.edit')}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={(e) => onDeleteArea(area, e)}
                      className="text-red-600 focus:text-red-600"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      {t('common.delete')}
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {/* Tables */}
      {isExpanded && (
        <div className="border-t">
          {tables.length === 0 ? (
            <div className="px-4 py-6 text-center text-slate-400 text-sm">
              {isNone ? t('partnertables.all_tables_assigned') : t('partnertables.no_tables_in_area_short')}
            </div>
          ) : (
            <div className="divide-y">
              {tables.map((tbl, index) => {
                // D2-011: Normalize table.id for sessionsByTable lookup
                const tableId = typeof tbl?.id === 'string' ? tbl.id : getLinkId(tbl);
                const tableSession = tableId ? sessionsByTable[tableId] : null;
                
                return (
                  <div
                    key={tbl.id}
                    className={`table-item flex flex-col gap-1 px-3 py-2 hover:bg-slate-50 ${
                      dragOverId === tbl.id ? "bg-indigo-50" : ""
                    }`}
                    onDragOver={(e) => {
                      if (canReorder && e.dataTransfer.types.includes("table-id")) {
                        e.preventDefault();
                        e.stopPropagation();
                        onTableDragOver(tbl.id);
                      }
                    }}
                    onDragLeave={() => onTableDragLeave()}
                    onDrop={(e) => {
                      onTableDragLeave();
                      onTableDrop(e, tbl, areaId);
                    }}
                  >
                    {/* Main row */}
                    <div className="flex items-center gap-2">
                      {/* Desktop: Grip handle */}
                      <div className="hidden sm:block">
                        <GripHandle
                          disabled={!canReorder}
                          onDragStart={(e) => onTableDragStart(e, tbl)}
                        />
                      </div>
                      
                      {/* Mobile: Up/Down buttons — 48x48px touch targets (UX consensus) */}
                      <div className="flex flex-col gap-2 sm:hidden">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-12 w-12 p-0"
                          disabled={!canReorder || index === 0}
                          onClick={() => onMoveTableUp(tbl, areaId, index)}
                          aria-label={t('partnertables.move_up')}
                        >
                          <ChevronUp className="h-5 w-5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-12 w-12 p-0"
                          disabled={!canReorder || index === tables.length - 1}
                          onClick={() => onMoveTableDown(tbl, areaId, index)}
                          aria-label={t('partnertables.move_down')}
                        >
                          <ChevronDown className="h-5 w-5" />
                        </Button>
                      </div>

                      <div className="font-medium text-slate-700 min-w-[2.5rem]">
                        №{displayTableNumber(tbl)}
                      </div>

                      <TableCodeDisplay table={tbl} codeMode={codeMode} unifiedCode={unifiedCode} />
                      
                      {/* P0-6: Session status badge - removed || fallbacks */}
                      {tableSession ? (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                          {t('tables.status_occupied')}
                        </span>
                      ) : (
                        <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded">
                          {t('tables.status_free')}
                        </span>
                      )}

                      <div className="flex-1" />

                      <StatusDot
                        active={tbl.is_active !== false}
                        onClick={(e) => onToggleTableActive(tbl, e)}
                        label={tbl.is_active !== false ? t('partnertables.status.available') : t('partnertables.status.unavailable')}
                      />

                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-11 w-11 p-0 text-slate-500 hover:text-indigo-600"
                        onClick={(e) => onOpenQrSingle(tbl, e)}
                        aria-label={t('partnertables.qr_table')}
                      >
                        <QrCode className="h-4 w-4" />
                      </Button>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-11 w-11 p-0"
                            aria-label={t('common.actions')}
                          >
                            <MoreVertical className="h-4 w-4 text-slate-400" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {codeMode === "individual" && (
                            <>
                              <DropdownMenuItem onClick={() => onRegenerateCode(tbl.id)}>
                                <RefreshCw className="h-4 w-4 mr-2" />
                                {t('partnertables.new_code')}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                            </>
                          )}
                          <DropdownMenuItem onClick={(e) => onOpenEditTable(tbl, e)}>
                            <Pencil className="h-4 w-4 mr-2" />
                            {t('common.edit')}
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={(e) => onDeleteTable(tbl, e)}
                            className="text-red-600 focus:text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            {t('common.delete')}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    
                    {/* D2-004: Session info block */}
                    {tableSession && (
                      <TableSessionInfo 
                        session={tableSession}
                        onClose={() => onCloseSession(tableSession.id)}
                        userRole={userRole}
                        t={t}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ============================================================
   CODE SETTINGS FORM
   ============================================================ */

function CodeSettingsForm({ initialMode, initialCode, initialDigits, saving, onSave, onCancel, t }) {
  const normalizedInitialMode = (initialMode === "unified" ? "shared" : (initialMode || "individual"));
  const [mode, setMode] = useState(normalizedInitialMode);
  const [code, setCode] = useState(initialCode || "");
  const [digits, setDigits] = useState(() => {
    const n = Number(initialDigits);
    if (Number.isFinite(n) && n > 0) return Math.max(1, Math.min(4, Math.round(n)));
    return 2;
  });

  const hasChanges =
    mode !== normalizedInitialMode ||
    (mode === "shared" && (code !== (initialCode || "") || digits !== (Number(initialDigits) || 2)));

  function handleCodeChange(e) {
    const maxPrefixLen = Math.max(0, 8 - digits);
    const val = e.target.value.replace(/\D/g, "").slice(0, maxPrefixLen);
    setCode(val);
  }

  function generateNewCode() {
    const maxPrefixLen = Math.max(0, 8 - digits);
    const len = Math.min(4, Math.max(1, maxPrefixLen));
    const max = Math.pow(10, len);
    setCode(String(Math.floor(Math.random() * max)).padStart(len, "0"));
  }

  // FIX P1: Enter submit
  function handleKeyDown(e) {
    if (e.key === 'Enter' && hasChanges) {
      e.preventDefault();
      handleSave();
    }
  }

  async function handleSave() {
    if (mode === "shared") {
      const totalLen = String(code || "").length + digits;
      if (totalLen < 3 || totalLen > 8) {
        toast.error(t('partnertables.error.total_length_range', { min: 3, max: 8 }), { id: STORAGE_KEYS.TOAST_ID });
        return;
      }
    }
    await onSave(mode, mode === "shared" ? code : "", digits);
  }

  return (
    <>
      <div className="space-y-4">
        <label
          className={`block p-4 rounded-lg border-2 cursor-pointer transition ${
            mode === "shared"
              ? "border-indigo-500 bg-indigo-50"
              : "border-slate-200 hover:border-slate-300"
          }`}
          onClick={() => {
            setMode("shared");
            if (!code) generateNewCode();
          }}
        >
          <div className="flex items-start gap-3">
            <input type="radio" checked={mode === "shared"} onChange={() => {}} className="mt-1" />
            <div className="flex-1">
              <div className="font-medium">{t('partnertables.code_settings.unified_title')}</div>
              <div className="text-sm text-slate-600 mt-1">
                {t('partnertables.code_settings.unified_description')}
              </div>
              {mode === "shared" && (
                <div className="mt-3 space-y-3" onClick={(e) => e.stopPropagation()}>
                  {/* Row 1: Единый код + refresh */}
                  <div className="space-y-1">
                    <Label className="text-xs text-slate-600">
                      {t('partnertables.code_settings.unified_title')}
                    </Label>
                    <div className="flex items-center gap-2">
                      <Input
                        value={code}
                        onChange={handleCodeChange}
                        onKeyDown={handleKeyDown}
                        className="w-24 font-mono text-center"
                        maxLength={Math.max(1, 8 - digits)}
                        placeholder={t('partnertables.code_settings.prefix_placeholder')}
                        inputMode="numeric"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={(e) => { e.stopPropagation(); generateNewCode(); }}
                        className="h-11 w-11 shrink-0"
                      >
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Row 2: Цифр для номера стола */}
                  <div className="space-y-1">
                    <Label className="text-xs text-slate-600">
                      {t('partnertables.code_settings.digits_label')}
                    </Label>
                    <Input
                      type="number"
                      min={1}
                      max={4}
                      value={digits}
                      onChange={(e) => setDigits(Math.max(1, Math.min(4, parseInt(e.target.value) || 2)))}
                      className="w-20 text-center"
                      inputMode="numeric"
                    />
                  </div>

                  {/* Row 3: Пример + длина кода */}
                  <div className="p-3 bg-slate-50 rounded-lg text-sm text-slate-600 space-y-1">
                    <div>
                      <span>{t('partnertables.code_settings.example')}: </span>
                      <span className="font-mono font-semibold text-slate-900">
                        {code || t('partnertables.code_settings.prefix_placeholder')} + {String(1).padStart(digits, '0')} = {(code || t('partnertables.code_settings.prefix_placeholder')) + String(1).padStart(digits, '0')}
                      </span>
                      <span>{t('partnertables.code_settings.example_result', { number: 1 })}</span>
                    </div>
                    <div className="text-xs text-slate-500">
                      {t('partnertables.code_settings.total_length_label')}: {(code?.length || 0) + digits} {t('partnertables.code_settings.digits_suffix')}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </label>

        <label
          className={`block p-4 rounded-lg border-2 cursor-pointer transition ${
            mode === "individual"
              ? "border-indigo-500 bg-indigo-50"
              : "border-slate-200 hover:border-slate-300"
          }`}
          onClick={() => setMode("individual")}
        >
          <div className="flex items-start gap-3">
            <input type="radio" checked={mode === "individual"} onChange={() => {}} className="mt-1" />
            <div>
              <div className="font-medium">{t('partnertables.code_settings.individual_title')}</div>
              <div className="text-sm text-slate-600 mt-1">
                {t('partnertables.code_settings.individual_description')}
              </div>
              <div className="mt-2 text-xs text-slate-500">
                {t('partnertables.code_settings.example')}: 3847, 9124, 0562
              </div>
            </div>
          </div>
        </label>
      </div>
      <DialogActions onCancel={onCancel} onSave={handleSave} saving={saving} disabled={!hasChanges} t={t} />
    </>
  );
}

/* ============================================================
   MAIN COMPONENT
   ============================================================ */

export default function PartnerTables() {
  const nav = useNavigate();
  const { t } = useI18n();

  // Data state
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [user, setUser] = useState(null);
  const [partner, setPartner] = useState(null);
  const [areasRaw, setAreasRaw] = useState([]);
  const [tablesRaw, setTablesRaw] = useState([]);
  const [activeSessions, setActiveSessions] = useState([]); // D2: Session data

  // UI state
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const saveTableInFlightRef = useRef(false);
  const [reordering, setReordering] = useState(false);
  const [dragOverId, setDragOverId] = useState(null);
  const [dragOverAreaId, setDragOverAreaId] = useState(null);
  const [expandedAreas, setExpandedAreas] = useState(new Set(["none"]));
  const [expandAll, setExpandAll] = useState(true);
  const [uiStateLoaded, setUiStateLoaded] = useState(false);

  // Dialog state
  const [areaDialog, setAreaDialog] = useState(false);
  const [tableDialog, setTableDialog] = useState(false);
  const [codeSettingsDialog, setCodeSettingsDialog] = useState(false);

  // Form state
  const [areaForm, setAreaForm] = useState({ id: null, name: "", is_active: true });
  const [tableForm, setTableForm] = useState({ id: null, number: "", area: "", is_active: true, code: "" });

  // Undo delete refs
  const undoTimeoutRef = useRef(null);
  // P0-9: Store commit function for flush pattern
  const pendingCommitRef = useRef(null);
  // P1-6: Track if we've auto-expanded areas once
  const hasAutoExpandedRef = useRef(false);

  // QR state
  const [qrSingleDialog, setQrSingleDialog] = useState(false);
  const [qrSingleTable, setQrSingleTable] = useState(null);
  const [qrBatchDialog, setQrBatchDialog] = useState(false);
  const [qrBatchTables, setQrBatchTables] = useState([]);
  const [qrSelectedTables, setQrSelectedTables] = useState(new Set());
  const [qrBatchTitle, setQrBatchTitle] = useState("");
  const [qrSize, setQrSize] = useState("medium");
  const [qrPrintLayout, setQrPrintLayout] = useState("3");
  const [qrShowNumber, setQrShowNumber] = useState(true);
  const [qrShowArea, setQrShowArea] = useState(true);
  const [qrShowLogo, setQrShowLogo] = useState(true);
  const [qrHeaderText, setQrHeaderText] = useState("");
  const [qrFooterText, setQrFooterText] = useState("");

  // "Save & Create Another" feature

  // Computed
  const QR_SIZES = getQrSizes(t);
  const PRINT_LAYOUTS = getPrintLayouts(t);
  const qrPreviewCols = Math.max(1, Math.min(4, Number(qrPrintLayout) || 3));
  const qrPreviewSize = (() => {
    const px = QR_SIZES[qrSize]?.size || 200;
    return Math.max(56, Math.min(110, Math.round(px / 3)));
  })();
  // P0-4: Removed partner_id/partnerId - only using partner key
  const pid = user?.partner || partner?.id || "";
  const apiReady = !!base44?.entities && !!pid;
  const codeModeRaw = partner?.table_code_mode || "individual";
  // Backward-compat: some legacy data may still use "unified" instead of "shared"
  const codeMode = codeModeRaw === "unified" ? "shared" : codeModeRaw;
  const unifiedCode = partner?.shared_table_code || "";
  const codeDigits = useMemo(() => {
    const n = Number(partner?.table_code_digits);
    if (Number.isFinite(n) && n > 0) return Math.max(1, Math.min(4, Math.round(n)));
    return 2;
  }, [partner?.table_code_digits]);
  const partnerLogoUrl = partner?.logo || partner?.logo_url || null;
  const qrSelectedCount = qrSelectedTables.size;
  const qrTablesToPrint = qrBatchTables.filter(t => qrSelectedTables.has(String(t.id)));
  const userRole = user?.user_role || null; // D2: For canCloseTable check

  // Inline validation: table number uniqueness (for dialog)
  const tableNumberConflict = useMemo(() => {
    const n = parseInt(tableForm?.number, 10);
    if (!Number.isFinite(n) || n < 1) return null;
    return tablesRaw.find(
      (tbl) => getTableNumber(tbl) === n && String(tbl.id) !== String(tableForm?.id)
    ) || null;
  }, [tablesRaw, tableForm?.number, tableForm?.id]);

  const tableNumberConflictMsg = useMemo(() => {
    if (!tableNumberConflict) return '';
    const num = parseInt(tableForm?.number, 10);
    const areaName = tableNumberConflict.area ? getAreaName(tableNumberConflict.area, areasRaw, t) : '';
    const baseMsg = t('partnertables.error.table_exists', { number: num });
    return areaName ? `${baseMsg} (${areaName})` : baseMsg;
  }, [tableNumberConflict, tableForm?.number, areasRaw, t]);

  // Load UI state
  useEffect(() => {
    try {
      const s = JSON.parse(localStorage.getItem(STORAGE_KEYS.UI_STATE) || "{}");
      if (Array.isArray(s.expanded)) setExpandedAreas(new Set(s.expanded));
      if (typeof s.expandAll === "boolean") setExpandAll(s.expandAll);
    } catch {}
    setUiStateLoaded(true);
  }, []);

  // Save UI state
  useEffect(() => {
    if (uiStateLoaded) {
      localStorage.setItem(STORAGE_KEYS.UI_STATE, JSON.stringify({ 
        expanded: Array.from(expandedAreas),
        expandAll 
      }));
    }
  }, [expandedAreas, expandAll, uiStateLoaded]);

  // P1-2: Commit pending delete on unmount (user leaves page before undo timeout)
  useEffect(() => {
    return () => {
      // grab commit before nulling to prevent race conditions
      const commit = pendingCommitRef.current;
      pendingCommitRef.current = null;
      if (commit) {
        // best-effort commit (can't await in unmount) + guaranteed catch
        Promise.resolve()
          .then(() => commit())
          .catch(() => {});
      }

      if (undoTimeoutRef.current) {
        clearTimeout(undoTimeoutRef.current);
        undoTimeoutRef.current = null;
      }
    };
  }, []);

  // D2: Load active sessions
  const loadSessions = useCallback(async (partnerId) => {
    if (!partnerId) return [];
    try {
      const sessions = await base44.entities.TableSession.filter({
        partner: partnerId,
        status: "active"
      });
      return sessions || [];
    } catch (err) {
      if (process.env.NODE_ENV !== 'production') console.error("Error loading sessions:", err);
      return [];
    }
  }, []);

  const reload = useCallback(async () => {
    setLoading(true);
    setLoadError(false);
    try {
      const u = await getUser();
      setUser(u);
      // P0-4: Removed partner_id/partnerId - only using partner key
      const pId = u?.partner || "";
      const [p, areasData, tablesData, sessionsData] = await Promise.all([
        loadPartner(pId),
        listFor("Area", pId),
        listFor("Table", pId),
        loadSessions(pId), // D2: Load sessions
      ]);

      setPartner(p);
      setAreasRaw(areasData || []);
      setTablesRaw(tablesData || []);
      setActiveSessions(sessionsData || []); // D2

      if (!hasAutoExpandedRef.current) {
        hasAutoExpandedRef.current = true;
        const allAreaIds = (areasData || []).map(a => String(a.id));
        allAreaIds.push("none");
        setExpandedAreas(new Set(allAreaIds));
      }
    } catch (e) {
      setLoadError(true);
      toast.error(t('partnertables.error.load'), { id: STORAGE_KEYS.TOAST_ID });
    } finally {
      setLoading(false);
    }
  }, [t, loadSessions]);

  useEffect(() => {
    if (uiStateLoaded) reload();
  }, [uiStateLoaded, reload]);

  // Memoized data
  const areas = useMemo(() => sortByOrder(areasRaw), [areasRaw]);
  
  const filteredTables = useMemo(() => {
    let list = sortByOrder(tablesRaw);
    const q = normStr(searchQuery).toLowerCase();
    if (q) {
      list = list.filter(tbl =>
        String(getTableNumber(tbl)).includes(q) ||
        normStr(tbl.code).toLowerCase().includes(q) ||
        normStr(tbl.name).toLowerCase().includes(q)
      );
    }
    return list;
  }, [tablesRaw, searchQuery]);

  const tablesByArea = useMemo(() => {
    const map = new Map();
    map.set("none", []);
    for (const area of areas) map.set(String(area.id), []);
    for (const tbl of filteredTables) {
      // P0-8: Normalize tbl.area via getLinkId (handles link-objects)
      const areaLinkId = getLinkId(tbl.area);
      const areaId = areaLinkId ? String(areaLinkId) : "none";
      if (!map.has(areaId)) map.set(areaId, []);
      map.get(areaId).push(tbl);
    }
    return map;
  }, [areas, filteredTables]);

  // D2-001, D2-002: Map sessions by table (filter expired, pick freshest)
  const sessionsByTable = useMemo(() => {
    const map = {};
    
    (activeSessions || []).forEach(session => {
      // D2-001: Ignore expired sessions
      if (isSessionExpired(session)) return;
      
      // D2-003: Normalize link field
      const tableId = getLinkId(session.table);
      if (!tableId) return;
      
      const existing = map[tableId];
      
      if (!existing) {
        map[tableId] = session;
      } else {
        // D2-002: Pick the freshest session (fallback dates)
        const existingDate = new Date(existing.opened_at || existing.created_at || existing.updated_at || 0);
        const newDate = new Date(session.opened_at || session.created_at || session.updated_at || 0);
        
        if (newDate > existingDate) {
          map[tableId] = session;
        }
      }
    });
    
    return map;
  }, [activeSessions]);

  const existingCodes = useMemo(() => new Set(tablesRaw.map(t => t.code).filter(Boolean)), [tablesRaw]);

  const canReorder = !reordering && !normStr(searchQuery);
  const areasCount = areasRaw.length;
  const tablesCount = tablesRaw.length;
  const filteredTablesCount = filteredTables.length;

  // Handlers
  function toggleArea(areaId) {
    setExpandedAreas(prev => {
      const next = new Set(prev);
      next.has(areaId) ? next.delete(areaId) : next.add(areaId);
      return next;
    });
  }

  function toggleExpandAll() {
    if (expandAll) {
      setExpandedAreas(new Set());
    } else {
      const allIds = [...areas.map(a => String(a.id)), "none"];
      setExpandedAreas(new Set(allIds));
    }
    setExpandAll(!expandAll);
  }

  function setDragImage(e) {
    const row = e.currentTarget?.closest?.(".table-item");
    if (row) e.dataTransfer.setDragImage(row, 40, 20);
  }

  async function batchedReindex(entity, items, setter) {
    const stepped = items.map((it, i) => ({ ...it, sort_order: (i + 1) * ORDER_STEP }));
    setter(old => {
      const map = new Map(stepped.map(x => [String(x.id), x]));
      return old.map(x => map.get(String(x.id)) || x);
    });
    for (let i = 0; i < stepped.length; i += BATCH_SIZE) {
      const chunk = stepped.slice(i, i + BATCH_SIZE);
      await Promise.all(chunk.map(it => updateRec(entity, it.id, { sort_order: it.sort_order })));
    }
  }

  async function regenerateTableCode(tableId) {
    if (codeMode === "shared") return;
    
    const codesExcludingSelf = new Set(
      tablesRaw.filter(tbl => String(tbl.id) !== String(tableId)).map(tbl => tbl.code).filter(Boolean)
    );
    
    const newCode = generateUniqueCode(codesExcludingSelf);
    if (!newCode) {
      toast.error(t('partnertables.error.code_generation_failed'), { id: STORAGE_KEYS.TOAST_ID });
      return;
    }

    try {
      await updateRec("Table", tableId, { code: newCode, verification_code: newCode });
      setTablesRaw(old => old.map(tbl => String(tbl.id) === String(tableId) ? { ...tbl, code: newCode, verification_code: newCode } : tbl));
      toast.success(t('partnertables.toast.code_updated'), { id: STORAGE_KEYS.TOAST_ID });
    } catch {
      toast.error(t('toast.error'), { id: STORAGE_KEYS.TOAST_ID });
    }
  }

  // P0-5: Updated to use batched updates to avoid rate limit
  async function saveCodeSettings(mode, code, digits) {
    if (!partner?.id) return;

    // Normalize mode (UI may still send legacy "unified")
    const nextModeRaw = mode || "individual";
    const nextMode = nextModeRaw === "unified" ? "shared" : nextModeRaw;

    const safeDigits = Math.max(1, Math.min(4, Math.round(Number(digits) || 2)));
    const rawPrefix = String(code || "");
    const prefixDigitsOnly = rawPrefix.replace(/\D/g, "");

    // For shared mode we compute & enforce fixed total length (3..8)
    if (nextMode === "shared") {
      const maxPrefixLen = Math.max(0, 8 - safeDigits);
      const prefix = prefixDigitsOnly.slice(0, maxPrefixLen);

      const totalLen = prefix.length + safeDigits;
      if (totalLen < 3 || totalLen > 8) {
        toast.error(t('partnertables.error.total_length_range', { min: 3, max: 8 }), { id: STORAGE_KEYS.TOAST_ID });
        return;
      }

      // Guard: digits must fit the largest existing table number
      const maxTableDigits = Math.max(
        1,
        ...tablesRaw.map((tbl) => String(Math.max(0, getTableNumber(tbl))).length)
      );

      if (safeDigits < maxTableDigits) {
        toast.error(t('partnertables.error.digits_too_small', { required: maxTableDigits }), { id: STORAGE_KEYS.TOAST_ID });
        return;
      }

      // Guard: ensure no duplicate full codes will be generated (e.g., if data already has duplicate table numbers)
      const codes = tablesRaw.map((tbl) => {
        const num = Math.max(0, getTableNumber(tbl));
        const suffix = String(num).padStart(safeDigits, "0");
        return `${prefix}${suffix}`;
      });
      const uniqueCount = new Set(codes).size;
      if (uniqueCount !== codes.length) {
        toast.error(t('partnertables.error.duplicate_table_numbers'), { id: STORAGE_KEYS.TOAST_ID });
        return;
      }

      setSaving(true);
      try {
        // Save Partner first only after all validations pass
        const payload = {
          table_code_mode: "shared",
          shared_table_code: prefix,
          table_code_digits: safeDigits,
          table_code_length: totalLen,
        };
        await updateRec("Partner", partner.id, payload);
        setPartner((p) => ({ ...p, ...payload }));

        // Batch update tables to avoid rate limit (429)
        const updatedTables = [...tablesRaw];
        for (let i = 0; i < tablesRaw.length; i += BATCH_SIZE) {
          const chunk = tablesRaw.slice(i, i + BATCH_SIZE);
          await Promise.all(
            chunk.map(async (tbl) => {
              const num = Math.max(0, getTableNumber(tbl));
              const suffix = String(num).padStart(safeDigits, "0");
              const fullCode = `${prefix}${suffix}`;

              // Update both fields:
              // - code: used in QR URLs / table param
              // - verification_code: used for manual verification flow
              await updateRec("Table", tbl.id, { code: fullCode, verification_code: fullCode });

              const idx = updatedTables.findIndex((x) => x.id === tbl.id);
              if (idx >= 0) updatedTables[idx] = { ...updatedTables[idx], code: fullCode, verification_code: fullCode };
            })
          );
        }

        setTablesRaw(updatedTables);
        toast.success(t('partnertables.toast.settings_saved'), { id: STORAGE_KEYS.TOAST_ID });
        setCodeSettingsDialog(false);
      } catch {
        toast.error(t('toast.error'), { id: STORAGE_KEYS.TOAST_ID });
      } finally {
        setSaving(false);
      }
      return;
    }

    // Individual mode: keep existing behavior (do not auto-compute table_code_length here)
    setSaving(true);
    try {
      const payload = { table_code_mode: "individual", shared_table_code: "" };
      await updateRec("Partner", partner.id, payload);
      setPartner((p) => ({ ...p, ...payload }));
      toast.success(t('partnertables.toast.settings_saved'), { id: STORAGE_KEYS.TOAST_ID });
      setCodeSettingsDialog(false);
    } catch {
      toast.error(t('toast.error'), { id: STORAGE_KEYS.TOAST_ID });
    } finally {
      setSaving(false);
    }
  }

  async function saveAreaOrder(newList) {
    if (reordering) return;
    setReordering(true);
    try {
      await batchedReindex("Area", newList, setAreasRaw);
      toast.success(t('partnertables.toast.order_saved'), { id: STORAGE_KEYS.TOAST_ID });
    } catch {
      toast.error(t('toast.error'), { id: STORAGE_KEYS.TOAST_ID });
    } finally {
      setReordering(false);
    }
  }

  function handleAreaDrop(e, targetAreaId) {
    e.preventDefault();
    const fromId = e.dataTransfer.getData("area-id");
    if (!fromId) return;
    
    const sorted = sortByOrder(areasRaw);
    const fromIdx = sorted.findIndex(a => String(a.id) === fromId);
    const targetIdx = sorted.findIndex(a => String(a.id) === targetAreaId);
    if (fromIdx < 0 || fromIdx === targetIdx) return;
    
    const next = moveIndex(sorted, fromIdx, targetIdx);
    setAreasRaw(next);
    saveAreaOrder(next);
    setDragOverAreaId(null);
  }

  function openNewArea() {
    setAreaForm({ id: null, name: "", is_active: true });
    setAreaDialog(true);
  }

  function openEditArea(a, e) {
    e?.stopPropagation();
    setAreaForm({ id: a.id, name: a.name || "", is_active: a.is_active !== false });
    setAreaDialog(true);
  }

  async function saveArea() {
    const name = normStr(areaForm.name);
    if (!name) {
      toast.error(t('error.enter_name'), { id: STORAGE_KEYS.TOAST_ID });
      return;
    }
    setSaving(true);
    try {
      if (areaForm.id) {
        await updateRec("Area", areaForm.id, { name, is_active: areaForm.is_active });
        setAreasRaw(old => old.map(a => a.id === areaForm.id ? { ...a, name, is_active: areaForm.is_active } : a));
        toast.success(t('partnertables.toast.area_saved'), { id: STORAGE_KEYS.TOAST_ID });
      } else {
        const created = await createWithPartner("Area", { name, is_active: areaForm.is_active, sort_order: (areasRaw.length + 1) * ORDER_STEP }, pid);
        setAreasRaw(old => sortByOrder([...old, created]));
        setExpandedAreas(prev => new Set([...prev, String(created.id)]));
        toast.success(t('partnertables.toast.area_created'), { id: STORAGE_KEYS.TOAST_ID });
      }
      setAreaDialog(false);
    } catch {
      toast.error(t('toast.error'), { id: STORAGE_KEYS.TOAST_ID });
    } finally {
      setSaving(false);
    }
  }

  // P0-9: Flush pending delete - immediately commit previous delete before starting new one
  async function flushPendingDelete() {
    const commit = pendingCommitRef.current;
    if (!commit) return;
    
    // Clear refs first to prevent race conditions
    pendingCommitRef.current = null;
    if (undoTimeoutRef.current) {
      clearTimeout(undoTimeoutRef.current);
      undoTimeoutRef.current = null;
    }
    
    try {
      await commit();
    } catch (e) {
      // Silent fail - UI already updated, server will be consistent on next reload
      if (process.env.NODE_ENV !== 'production') console.error("flushPendingDelete error:", e);
    }
  }

  // P0-1: Updated to use mm1 toast id for undo (was undo-area-*)
  // P0-9: Now flushes previous pending delete before starting new one
  async function deleteAreaWithUndo(a, e) {
    e?.stopPropagation();
    
    // P0-9: Commit any pending delete first (prevents ghost records)
    await flushPendingDelete();
    
    // P0-8: Normalize tbl.area via getLinkId
    const areaIdStr = String(a.id);
    const affectedTables = tablesRaw.filter(tbl => {
      const tblAreaId = getLinkId(tbl.area);
      return tblAreaId && String(tblAreaId) === areaIdStr;
    });
    
    setAreasRaw(old => old.filter(x => x.id !== a.id));
    setTablesRaw(old => old.map(tbl => {
      const tblAreaId = getLinkId(tbl.area);
      return (tblAreaId && String(tblAreaId) === areaIdStr) ? { ...tbl, area: null } : tbl;
    }));
    
    // P0-1: Using mm1 instead of undo-area-* for consistent single toast
    toast(t('partnertables.toast.area_deleted'), {
      id: STORAGE_KEYS.TOAST_ID,
      duration: UNDO_TIMEOUT_MS,
      action: {
        label: t('common.undo'),
        onClick: () => {
          setAreasRaw(old => sortByOrder([...old, a]));
          setTablesRaw(old => old.map(tbl => {
            // P0-11: Safe id comparison
            const wasAffected = affectedTables.find(at => String(at.id) === String(tbl.id));
            return wasAffected ? { ...tbl, area: a.id } : tbl;
          }));
          // P0-9: Clear all pending refs on undo
          clearTimeout(undoTimeoutRef.current);
          undoTimeoutRef.current = null;
          pendingCommitRef.current = null;
          toast.success(t('partnertables.toast.restored'), { id: STORAGE_KEYS.TOAST_ID });
        },
      },
      icon: <Trash2 className="h-4 w-4 text-red-500" />,
    });

    // P0-9: Define commit function for this delete
    const commitDelete = async () => {
      if (affectedTables.length > 0) {
        await Promise.all(affectedTables.map(tbl => updateRec("Table", tbl.id, { area: null })));
      }
      await deleteRec("Area", a.id);
    };
    
    // P0-9: Store commit for potential flush
    pendingCommitRef.current = commitDelete;

    undoTimeoutRef.current = setTimeout(async () => {
      // P0-9: Check if this is still the current pending (not flushed)
      if (pendingCommitRef.current !== commitDelete) return;
      
      try {
        await commitDelete();
      } catch {
        setAreasRaw(old => sortByOrder([...old, a]));
        setTablesRaw(old => old.map(tbl => {
          // P0-11: Safe id comparison
          const wasAffected = affectedTables.find(at => String(at.id) === String(tbl.id));
          return wasAffected ? { ...tbl, area: a.id } : tbl;
        }));
        toast.error(t('toast.error'), { id: STORAGE_KEYS.TOAST_ID });
      }
      pendingCommitRef.current = null;
    }, UNDO_TIMEOUT_MS);
  }

  async function moveTableToArea(tableId, newAreaId, targetIndex) {
    if (reordering) return;
    setReordering(true);

    const table = tablesRaw.find(tbl => String(tbl.id) === String(tableId));
    if (!table) { setReordering(false); return; }

    const actualAreaId = newAreaId === "none" ? null : newAreaId;

    try {
      const allSorted = sortByOrder(tablesRaw);
      // P0-8: Normalize tbl.area via getLinkId
      const targetAreaTables = allSorted.filter(tbl => {
        const tblAreaId = getLinkId(tbl.area);
        const tblAreaKey = tblAreaId ? String(tblAreaId) : "none";
        return tblAreaKey === String(newAreaId) && String(tbl.id) !== String(tableId);
      });
      const insertAt = Math.max(0, Math.min(targetIndex ?? targetAreaTables.length, targetAreaTables.length));
      const prev = targetAreaTables[insertAt - 1];
      const next = targetAreaTables[insertAt];

      let newOrder = computeMidOrder(prev?.sort_order, next?.sort_order);
      if (newOrder !== null) {
        setTablesRaw(old => old.map(tbl => String(tbl.id) === String(tableId) ? { ...tbl, sort_order: newOrder, area: actualAreaId } : tbl));
        await updateRec("Table", tableId, { sort_order: newOrder, area: actualAreaId });
      } else {
        targetAreaTables.splice(insertAt, 0, { ...table, area: actualAreaId });
        await batchedReindex("Table", targetAreaTables, setTablesRaw);
        await updateRec("Table", tableId, { area: actualAreaId });
      }
      toast.success(t('toast.saved'), { id: STORAGE_KEYS.TOAST_ID });
    } catch {
      toast.error(t('toast.error'), { id: STORAGE_KEYS.TOAST_ID });
    } finally {
      setReordering(false);
      setDragOverId(null);
      setDragOverAreaId(null);
    }
  }

  function handleTableDrop(e, targetTable, areaId) {
    e.preventDefault();
    e.stopPropagation();
    const fromId = e.dataTransfer.getData("table-id");
    if (!fromId || fromId === String(targetTable?.id)) return;
    const areaTables = tablesByArea.get(areaId) || [];
    const targetIdx = targetTable ? areaTables.findIndex(tbl => String(tbl.id) === String(targetTable.id)) : areaTables.length;
    moveTableToArea(fromId, areaId, targetIdx);
  }

  function handleAreaDropZone(e, areaId) {
    e.preventDefault();
    const fromId = e.dataTransfer.getData("table-id");
    if (!fromId) return;
    moveTableToArea(fromId, areaId, (tablesByArea.get(areaId) || []).length);
  }

  async function moveTableUp(table, areaId, currentIndex) {
    if (reordering || currentIndex <= 0) return;
    const areaTables = tablesByArea.get(areaId) || [];
    const newList = moveIndex(areaTables, currentIndex, currentIndex - 1);
    setReordering(true);
    try {
      await batchedReindex("Table", newList, setTablesRaw);
      toast.success(t('partnertables.toast.order_saved'), { id: STORAGE_KEYS.TOAST_ID });
    } catch {
      toast.error(t('toast.error'), { id: STORAGE_KEYS.TOAST_ID });
    } finally {
      setReordering(false);
    }
  }

  async function moveTableDown(table, areaId, currentIndex) {
    if (reordering) return;
    const areaTables = tablesByArea.get(areaId) || [];
    if (currentIndex >= areaTables.length - 1) return;
    const newList = moveIndex(areaTables, currentIndex, currentIndex + 1);
    setReordering(true);
    try {
      await batchedReindex("Table", newList, setTablesRaw);
      toast.success(t('partnertables.toast.order_saved'), { id: STORAGE_KEYS.TOAST_ID });
    } catch {
      toast.error(t('toast.error'), { id: STORAGE_KEYS.TOAST_ID });
    } finally {
      setReordering(false);
    }
  }

  function openNewTable(prefillAreaId) {
    const usedNumbers = tablesRaw.map(tbl => getTableNumber(tbl));
    let nextNumber = 1;
    while (usedNumbers.includes(nextNumber)) nextNumber++;

    // Shared mode: ensure next number fits into configured digits
    if (codeMode === "shared" && String(nextNumber).length > codeDigits) {
      toast.error(t('partnertables.error.digits_too_small', { required: String(nextNumber).length }), { id: STORAGE_KEYS.TOAST_ID });
      return;
    }

    let code = codeMode === "shared" ? `${unifiedCode}${String(nextNumber).padStart(codeDigits, "0")}` : (generateUniqueCode(existingCodes) || generate4DigitCode());

    setTableForm({ id: null, number: String(nextNumber), area: prefillAreaId === "none" ? "" : (prefillAreaId || ""), is_active: true, code });
    setTableDialog(true);
  }

  function openEditTable(tbl, e) {
    e?.stopPropagation();
    const num = getTableNumber(tbl);
    // P0-8: Normalize tbl.area via getLinkId
    const areaId = getLinkId(tbl.area);
    setTableForm({ id: tbl.id, number: num > 0 ? String(num) : "", area: areaId ? String(areaId) : "", is_active: tbl.is_active !== false, code: tbl.code || "" });
    setTableDialog(true);
  }

  async function saveTable() {
    if (saveTableInFlightRef.current) return;
    const number = parseInt(tableForm.number, 10);
    if (!number || number < 1) {
      toast.error(t('partnertables.error.enter_table_number'), { id: STORAGE_KEYS.TOAST_ID });
      return;
    }

    // Shared mode: table number must fit into codeDigits
    if (codeMode === "shared" && String(number).length > codeDigits) {
      toast.error(t('partnertables.error.digits_too_small', { required: String(number).length }), { id: STORAGE_KEYS.TOAST_ID });
      return;
    }

    const taken = tablesRaw.find(tbl => getTableNumber(tbl) === number && String(tbl.id) !== String(tableForm.id));
    if (taken) {
      const takenAreaName = taken.area ? getAreaName(taken.area, areasRaw, t) : '';
      const baseMsg = t('partnertables.error.table_exists', { number });
      toast.error(takenAreaName ? `${baseMsg} (${takenAreaName})` : baseMsg, { id: STORAGE_KEYS.TOAST_ID });
      return;
    }

    let fullCode = codeMode === "shared" ? `${unifiedCode}${String(number).padStart(codeDigits, "0")}` : normStr(tableForm.code);

    // Shared mode: defensive check for code collision
    if (codeMode === "shared") {
      const conflictByCode = tablesRaw.find(tbl => normStr(tbl?.code) === fullCode && String(tbl.id) !== String(tableForm.id));
      if (conflictByCode) {
        const areaName = conflictByCode.area ? getAreaName(conflictByCode.area, areasRaw, t) : '';
        const baseMsg = t('partnertables.error.code_exists', { code: fullCode });
        toast.error(areaName ? `${baseMsg} (${areaName})` : baseMsg, { id: STORAGE_KEYS.TOAST_ID });
        return;
      }
    }

    if (codeMode === "individual") {
      if (!fullCode || fullCode.length < 2) {
        toast.error(t('partnertables.error.code_min_length'), { id: STORAGE_KEYS.TOAST_ID });
        return;
      }
      if (tablesRaw.find(tbl => tbl.code === fullCode && String(tbl.id) !== String(tableForm.id))) {
        toast.error(t('partnertables.error.code_exists', { code: fullCode }), { id: STORAGE_KEYS.TOAST_ID });
        return;
      }
    }

    const payload = { name: `${t('partnertables.table')} ${number}`, code: fullCode, is_active: tableForm.is_active };
    payload.verification_code = fullCode;
    if (tableForm.area) payload.area = tableForm.area;

    saveTableInFlightRef.current = true;
    setSaving(true);
    try {
      if (tableForm.id) {
        await updateRec("Table", tableForm.id, payload);
        setTablesRaw(old => old.map(tbl => tbl.id === tableForm.id ? { ...tbl, ...payload } : tbl));
        toast.success(t('partnertables.toast.table_saved'), { id: STORAGE_KEYS.TOAST_ID });
        setTableDialog(false);
      } else {
        const created = await createWithPartner("Table", { ...payload, sort_order: (tablesRaw.length + 1) * ORDER_STEP }, pid);
        setTablesRaw(old => sortByOrder([...old, created]));
        toast.success(t('partnertables.toast.table_created'), { id: STORAGE_KEYS.TOAST_ID });
        setTableDialog(false);
      }
    } catch (e) {
      if (process.env.NODE_ENV !== 'production') console.error('saveTable error:', e);
      toast.error(t('toast.error'), { id: STORAGE_KEYS.TOAST_ID });
    } finally {
      saveTableInFlightRef.current = false;
      setSaving(false);
    }
  }

  // P0-2: Fixed toggle logic for is_active = undefined case
  async function toggleTableActive(tbl, e) {
    e?.stopPropagation();
    // P0-2: Correctly handle undefined - treat as active, then toggle
    const currentlyActive = tbl?.is_active !== false;
    const newActive = !currentlyActive;
    try {
      await updateRec("Table", tbl.id, { is_active: newActive });
      setTablesRaw(old => old.map(x => x.id === tbl.id ? { ...x, is_active: newActive } : x));
      toast.success(newActive ? t('partnertables.toast.table_available') : t('partnertables.toast.table_unavailable'), { id: STORAGE_KEYS.TOAST_ID });
    } catch {
      toast.error(t('toast.error'), { id: STORAGE_KEYS.TOAST_ID });
    }
  }

  // P0-1: Updated to use mm1 toast id for undo (was undo-table-*)
  // P0-9: Now flushes previous pending delete before starting new one
  async function deleteTableWithUndo(tbl, e) {
    e?.stopPropagation();
    
    // P0-9: Commit any pending delete first (prevents ghost records)
    await flushPendingDelete();
    
    setTablesRaw(old => old.filter(x => x.id !== tbl.id));
    
    const num = displayTableNumber(tbl);
    
    // P0-1: Using mm1 instead of undo-table-* for consistent single toast
    toast(t('partnertables.toast.table_deleted_with_number', { number: num }), {
      id: STORAGE_KEYS.TOAST_ID,
      duration: UNDO_TIMEOUT_MS,
      action: {
        label: t('common.undo'),
        onClick: () => {
          setTablesRaw(old => sortByOrder([...old, tbl]));
          // P0-9: Clear all pending refs on undo
          clearTimeout(undoTimeoutRef.current);
          undoTimeoutRef.current = null;
          pendingCommitRef.current = null;
          toast.success(t('partnertables.toast.restored'), { id: STORAGE_KEYS.TOAST_ID });
        },
      },
      icon: <Trash2 className="h-4 w-4 text-red-500" />,
    });

    // P0-9: Define commit function for this delete
    const commitDelete = async () => {
      await deleteRec("Table", tbl.id);
    };
    
    // P0-9: Store commit for potential flush
    pendingCommitRef.current = commitDelete;

    undoTimeoutRef.current = setTimeout(async () => {
      // P0-9: Check if this is still the current pending (not flushed)
      if (pendingCommitRef.current !== commitDelete) return;
      
      try {
        await commitDelete();
      } catch {
        setTablesRaw(old => sortByOrder([...old, tbl]));
        toast.error(t('toast.error'), { id: STORAGE_KEYS.TOAST_ID });
      }
      pendingCommitRef.current = null;
    }, UNDO_TIMEOUT_MS);
  }

  // D2-006, D2-007: Handle close session
  // P0-6: Removed || fallbacks
  const handleCloseSession = async (sessionId) => {
    // Normalize in case object is passed
    const id = typeof sessionId === 'string' ? sessionId : getLinkId(sessionId);
    if (!id) return;
    
    // D2-006: Confirm before closing
    if (!confirm(t('partnertables.confirm.delete_table'))) return;
    
    try {
      await closeSession(id);
      // P0-1: Using mm1 for consistency
      toast.success(t('partnertables.toast.table_closed'), { id: STORAGE_KEYS.TOAST_ID });
      // D2-007: Refetch sessions
      const newSessions = await loadSessions(pid);
      setActiveSessions(newSessions);
    } catch (err) {
      if (process.env.NODE_ENV !== 'production') console.error("Error closing session:", err);
      toast.error(t('toast.error'), { id: STORAGE_KEYS.TOAST_ID });
    }
  };

  // QR functions
  function openQrSingle(table, e) { e?.stopPropagation(); setQrSingleTable(table); setQrSingleDialog(true); }
  
  function openQrForArea(areaId, e) {
    e?.stopPropagation();
    // P0-8: Normalize tbl.area via getLinkId
    const areaTables = filteredTables.filter(tbl => {
      const tblAreaId = getLinkId(tbl.area);
      const tblAreaKey = tblAreaId ? String(tblAreaId) : "none";
      return tblAreaKey === String(areaId);
    });
    if (areaTables.length === 0) { toast.error(t('partnertables.error.no_tables_in_area'), { id: STORAGE_KEYS.TOAST_ID }); return; }
    setQrBatchTables(areaTables);
    setQrSelectedTables(new Set(areaTables.map(t => String(t.id))));
    setQrBatchTitle(t('partnertables.qr.batch_title_area', { area: areaId === "none" ? t('partnertables.no_area') : getAreaName(areaId, areas, t) }));
    setQrBatchDialog(true);
  }

  function openQrAll() {
    if (tablesRaw.length === 0) { toast.error(t('partnertables.error.no_tables'), { id: STORAGE_KEYS.TOAST_ID }); return; }
    const sorted = sortByOrder(tablesRaw);
    setQrBatchTables(sorted);
    setQrSelectedTables(new Set(sorted.map(t => String(t.id))));
    setQrBatchTitle(t('partnertables.qr.batch_title_all'));
    setQrBatchDialog(true);
  }

  function toggleQrTableSelection(tableId) {
    setQrSelectedTables(prev => {
      const next = new Set(prev);
      const id = String(tableId);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  function selectAllQrTables() {
    setQrSelectedTables(new Set(qrBatchTables.map(t => String(t.id))));
  }

  function deselectAllQrTables() {
    setQrSelectedTables(new Set());
  }

  async function downloadSingleQR() {
    if (!qrSingleTable) return;
    const url = getTableQRUrl(partner, qrSingleTable);
    const logoUrl = qrShowLogo ? partnerLogoUrl : null;
    const success = await downloadQRCode(url, `table-${displayTableNumber(qrSingleTable)}-qr.png`, 300, logoUrl);
    if (success) {
      toast.success(t('partnertables.toast.qr_downloading'), { id: STORAGE_KEYS.TOAST_ID });
    } else {
      toast.error(t('toast.error'), { id: STORAGE_KEYS.TOAST_ID });
    }
  }

  async function printSingleQR() {
    if (!qrSingleTable) return;
    const url = getTableQRUrl(partner, qrSingleTable);
    const logoUrl = qrShowLogo ? partnerLogoUrl : null;
    const qrDataUrl = await generateQRDataUrl(url, 300, logoUrl);
    if (!qrDataUrl) { toast.error(t('toast.error'), { id: STORAGE_KEYS.TOAST_ID }); return; }
    
    const num = displayTableNumber(qrSingleTable);
    const areaName = qrSingleTable?.area ? getAreaName(qrSingleTable.area, areas, t) : "";
    
    const printWindow = window.open("", "_blank");
    if (!printWindow) { toast.error(t('partnertables.error.popup_blocked'), { id: STORAGE_KEYS.TOAST_ID }); return; }
    
    const tableLabel = t('partnertables.table');
    printWindow.document.write(`<!DOCTYPE html><html><head><title>${escapeHtml(tableLabel)} &#8470;${escapeHtml(num)}</title><style>body{display:flex;justify-content:center;align-items:center;min-height:100vh;margin:0;font-family:system-ui,-apple-system,sans-serif}.qr-card{text-align:center;padding:20px}.table-number{font-size:24px;font-weight:bold;margin-top:16px}.table-area{font-size:14px;color:#666;margin-top:4px}.scan-text{font-size:12px;color:#999;margin-top:8px}</style></head><body><div class="qr-card"><img src="${qrDataUrl}" width="300" height="300" alt="${escapeHtml(t('partnertables.qr.alt'))}"/><div class="table-number">${escapeHtml(tableLabel)} &#8470;${escapeHtml(num)}</div>${areaName ? `<div class="table-area">${escapeHtml(areaName)}</div>` : ""}<div class="scan-text">${escapeHtml(t('partnertables.qr.scan_hint'))}</div></div></body></html>`);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => { printWindow.print(); printWindow.close(); }, PRINT_WINDOW_RENDER_DELAY_MS);
  }

  async function printBatchQR() {
    if (qrSelectedCount === 0) {
      toast.error(t('partnertables.error.no_tables_selected'), { id: STORAGE_KEYS.TOAST_ID });
      return;
    }

    const layout = PRINT_LAYOUTS.find(l => l.value === qrPrintLayout);
    const cols = layout?.cols || 2;
    const logoUrl = qrShowLogo ? partnerLogoUrl : null;

    // Calculate max QR size that fits A4 width (210mm) with padding and gaps
    const A4_WIDTH_MM = 210;
    const PRINT_PADDING_MM = 10;
    const CARD_GAP_MM = 8;
    const CARD_PADDING_MM = 4;
    const MM_TO_PX = 3.78; // ~96dpi
    const usableWidth = A4_WIDTH_MM - 2 * PRINT_PADDING_MM;
    const cardWidth = (usableWidth - (cols - 1) * CARD_GAP_MM) / cols;
    const maxQrPx = Math.floor((cardWidth - 2 * CARD_PADDING_MM) * MM_TO_PX);
    const size = Math.min(QR_SIZES[qrSize]?.size || 200, maxQrPx);

    const qrDataPromises = qrTablesToPrint.map(async (table) => {
      const url = getTableQRUrl(partner, table);
      const dataUrl = await generateQRDataUrl(url, size, logoUrl);
      return { table, dataUrl };
    });

    const qrData = await Promise.all(qrDataPromises);

    const printWindow = window.open("", "_blank");
    if (!printWindow) { toast.error(t('partnertables.error.popup_blocked'), { id: STORAGE_KEYS.TOAST_ID }); return; }

    const cardHeaderHtml = qrHeaderText ? `<div class="card-header-text">${escapeHtml(qrHeaderText)}</div>` : "";
    const cardFooterHtml = qrFooterText ? `<div class="card-footer-text">${escapeHtml(qrFooterText)}</div>` : "";

    const tableLabel = t('partnertables.table');
    const qrCards = qrData.map(({ table, dataUrl }) => {
      const num = displayTableNumber(table);
      const areaName = getAreaName(table.area, areas, t);
      return `<div class="qr-card">${cardHeaderHtml}<img src="${dataUrl}" width="${size}" height="${size}" alt="${escapeHtml(t('partnertables.qr.alt'))}"/>${qrShowNumber ? `<div class="table-number">${escapeHtml(tableLabel)} &#8470;${escapeHtml(num)}</div>` : ""}${qrShowArea ? `<div class="table-area">${escapeHtml(areaName)}</div>` : ""}<div class="scan-text">${escapeHtml(t('partnertables.qr.scan_hint'))}</div>${cardFooterHtml}</div>`;
    }).join("");

    printWindow.document.write(`<!DOCTYPE html><html><head><title>${escapeHtml(t('partnertables.qr.print_title'))}</title><style>@page{margin:0;size:A4}*{box-sizing:border-box}body{margin:0;padding:10mm;font-family:system-ui,-apple-system,sans-serif;width:210mm}.grid{display:grid;grid-template-columns:repeat(${cols},1fr);gap:8mm}.qr-card{text-align:center;padding:4mm;border:1px solid #ddd;border-radius:4px;page-break-inside:avoid;display:flex;flex-direction:column;align-items:center;justify-content:center}.qr-card img{max-width:100%;height:auto}.table-number{font-size:16px;font-weight:bold;margin-top:6px}.table-area{font-size:11px;color:#666;margin-top:2px}.scan-text{font-size:9px;color:#999;margin-top:3px}.card-header-text{font-size:10px;color:#333;margin-bottom:4px;white-space:pre-wrap;text-align:center;max-width:100%;overflow:hidden;text-overflow:ellipsis}.card-footer-text{font-size:10px;color:#333;margin-top:4px;white-space:pre-wrap;text-align:center;max-width:100%;overflow:hidden;text-overflow:ellipsis}</style></head><body><div class="grid">${qrCards}</div><script>setTimeout(()=>window.print(),100)<\/script></body></html>`);
    printWindow.document.close();
  }

  // FIX P1: Handle Enter key for forms
  function handleAreaFormKeyDown(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      saveArea();
    }
  }

  function handleTableFormKeyDown(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      saveTable();
    }
  }

  /* ============================================================
     RENDER
     ============================================================ */

  if (!loading && !user) {
    return (
      <PartnerShell activeTab="tables">
        <div className="rounded-lg border-2 border-dashed border-red-200 bg-red-50 p-8 text-center">
          <div className="text-4xl mb-3">🔒</div>
          <div className="font-medium text-red-700 mb-1">{t('partnertables.auth.access_denied')}</div>
          <div className="text-sm text-red-600 mb-4">{t('partnertables.auth.login_required')}</div>
          <Button onClick={() => nav("/login")} variant="outline" className="border-red-300 text-red-700 hover:bg-red-100">{t('partnertables.auth.login')}</Button>
        </div>
      </PartnerShell>
    );
  }

  return (
    <PartnerShell activeTab="tables" partnerName={partner?.name}>
      <TooltipProvider>
        {!loading && !apiReady && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">{t('partnertables.error.connection')}</div>
        )}

        {/* Header */}
        <div className="mb-4 flex items-start justify-between gap-2">
          <div>
            <h1 className="text-xl font-semibold text-slate-800">{t('partnertables.title')}</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              {areasCount} {pluralize(areasCount, t('partnertables.area_one'), t('partnertables.area_few'), t('partnertables.area_many'))} • {tablesCount} {pluralize(tablesCount, t('partnertables.table_one'), t('partnertables.table_few'), t('partnertables.table_many'))}
            </p>
          </div>
          <PageHelpButton pageKey="/partnertables" />
        </div>

        {/* Toolbar */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 flex-wrap">
            <Tooltip><TooltipTrigger asChild><Button variant={showSearch || searchQuery ? "default" : "outline"} size="icon" className="h-11 w-11" aria-label={t('common.search')} onClick={() => { if (showSearch && !searchQuery) setShowSearch(false); else if (!showSearch) setShowSearch(true); else if (searchQuery) setSearchQuery(""); }}><Search className="h-4 w-4" /></Button></TooltipTrigger><TooltipContent>{t('common.search')}</TooltipContent></Tooltip>
            <Tooltip><TooltipTrigger asChild><Button variant="outline" size="icon" className="h-11 w-11" aria-label={t('partnertables.qr_all')} onClick={openQrAll} disabled={tablesCount === 0}><QrCode className="h-4 w-4" /></Button></TooltipTrigger><TooltipContent>{t('partnertables.qr_all')}</TooltipContent></Tooltip>
            <Tooltip><TooltipTrigger asChild><Button variant="outline" size="icon" className="h-11 w-11" aria-label={expandAll ? t('partnertables.collapse_all') : t('partnertables.expand_all')} onClick={toggleExpandAll}><ChevronRight className={`h-4 w-4 transition-transform ${expandAll ? 'rotate-90' : ''}`} /></Button></TooltipTrigger><TooltipContent>{expandAll ? t('partnertables.collapse_all') : t('partnertables.expand_all')}</TooltipContent></Tooltip>
            <Tooltip><TooltipTrigger asChild><Button variant="outline" size="icon" className="h-11 w-11" aria-label={t('partnertables.code_settings')} onClick={() => setCodeSettingsDialog(true)}><Settings className="h-4 w-4" /></Button></TooltipTrigger><TooltipContent>{t('partnertables.code_settings')}</TooltipContent></Tooltip>
            <Button size="sm" className="h-11" onClick={openNewArea} disabled={!apiReady || saving}><Plus className="h-4 w-4" /><span className="ml-1">{t('partnertables.area')}</span></Button>
          </div>

          {(showSearch || searchQuery) && (
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <Input className="w-full pl-9 pr-9 h-11" placeholder={t('partnertables.search_placeholder')} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} onBlur={() => { if (!searchQuery) setShowSearch(false); }} autoFocus />
              {searchQuery && <button onClick={() => { setSearchQuery(""); setShowSearch(false); }} className="absolute right-0 top-0 h-11 w-11 flex items-center justify-center text-slate-400 hover:text-slate-600" aria-label={t('common.close')}><X className="h-4 w-4" /></button>}
            </div>
          )}
          
          {searchQuery && <div className="text-sm"><span className={filteredTablesCount > 0 ? "text-slate-600" : "text-orange-600"}>{filteredTablesCount > 0 ? t('partnertables.search_found', { count: filteredTablesCount }) : t('partnertables.search_not_found')}</span></div>}
        </div>

        {/* Code mode hint */}
        <div className="mb-4 px-3 py-2 rounded-lg bg-blue-50 border border-blue-100 text-sm text-blue-700 flex items-center justify-between gap-2">
          <span className="truncate">{codeMode === "shared" ? <>{t('partnertables.code_mode.unified')}: <code className="font-mono font-bold">{unifiedCode}</code> + {t('partnertables.code_mode.plus_number')}</> : <>{t('partnertables.code_mode.individual')}</>}</span>
          <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700 hover:bg-blue-100 shrink-0 h-11" onClick={() => setCodeSettingsDialog(true)}>{t('common.edit')}</Button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-slate-400" /></div>
        ) : loadError ? (
          <div className="rounded-lg border-2 border-dashed border-red-200 bg-red-50 p-8 text-center">
            <div className="text-4xl mb-3">⚠️</div>
            <div className="font-medium text-red-700 mb-1">{t('partnertables.error.load_title')}</div>
            <div className="text-sm text-red-600 mb-4">{t('partnertables.error.load_description')}</div>
            <Button onClick={reload} variant="outline" className="border-red-300 text-red-700 hover:bg-red-100"><RefreshCw className="h-4 w-4 mr-2" />{t('partnertables.retry')}</Button>
          </div>
        ) : (
          <>
            {areas.map(area => (
              <AreaSection 
                key={area.id} 
                area={area} 
                tables={tablesByArea.get(String(area.id)) || []} 
                isNone={false} 
                isExpanded={expandedAreas.has(String(area.id))} 
                canReorder={canReorder} 
                dragOverAreaId={dragOverAreaId} 
                dragOverId={dragOverId} 
                codeMode={codeMode} 
                unifiedCode={unifiedCode} 
                areas={areas}
                sessionsByTable={sessionsByTable}
                userRole={userRole}
                t={t} 
                onToggle={toggleArea} 
                onDragOverArea={setDragOverAreaId} 
                onDragLeaveArea={() => setDragOverAreaId(null)} 
                onDropArea={handleAreaDropZone} 
                onAreaDragStart={(e, areaId) => e.dataTransfer.setData("area-id", areaId)} 
                onAreaDragOver={setDragOverAreaId} 
                onAreaDrop={(e, targetAreaId) => handleAreaDrop(e, targetAreaId)} 
                onTableDragOver={setDragOverId} 
                onTableDragLeave={() => setDragOverId(null)} 
                onTableDrop={handleTableDrop} 
                onTableDragStart={(e, tbl) => { e.dataTransfer.setData("table-id", String(tbl.id)); setDragImage(e); }} 
                onOpenNewTable={openNewTable} 
                onOpenQrForArea={openQrForArea} 
                onOpenEditArea={openEditArea} 
                onDeleteArea={deleteAreaWithUndo} 
                onToggleTableActive={toggleTableActive} 
                onOpenQrSingle={openQrSingle} 
                onRegenerateCode={regenerateTableCode} 
                onOpenEditTable={openEditTable} 
                onDeleteTable={deleteTableWithUndo} 
                onMoveTableUp={moveTableUp} 
                onMoveTableDown={moveTableDown}
                onCloseSession={handleCloseSession}
              />
            ))}

            <AreaSection 
              area={null} 
              tables={tablesByArea.get("none") || []} 
              isNone={true} 
              isExpanded={expandedAreas.has("none")} 
              canReorder={canReorder} 
              dragOverAreaId={dragOverAreaId} 
              dragOverId={dragOverId} 
              codeMode={codeMode} 
              unifiedCode={unifiedCode} 
              areas={areas}
              sessionsByTable={sessionsByTable}
              userRole={userRole}
              t={t} 
              onToggle={toggleArea} 
              onDragOverArea={setDragOverAreaId} 
              onDragLeaveArea={() => setDragOverAreaId(null)} 
              onDropArea={handleAreaDropZone} 
              onAreaDragStart={() => {}} 
              onAreaDragOver={() => {}} 
              onAreaDrop={() => {}} 
              onTableDragOver={setDragOverId} 
              onTableDragLeave={() => setDragOverId(null)} 
              onTableDrop={handleTableDrop} 
              onTableDragStart={(e, tbl) => { e.dataTransfer.setData("table-id", String(tbl.id)); setDragImage(e); }} 
              onOpenNewTable={openNewTable} 
              onOpenQrForArea={openQrForArea} 
              onOpenEditArea={() => {}} 
              onDeleteArea={() => {}} 
              onToggleTableActive={toggleTableActive} 
              onOpenQrSingle={openQrSingle} 
              onRegenerateCode={regenerateTableCode} 
              onOpenEditTable={openEditTable} 
              onDeleteTable={deleteTableWithUndo} 
              onMoveTableUp={moveTableUp} 
              onMoveTableDown={moveTableDown}
              onCloseSession={handleCloseSession}
            />

            {areasCount === 0 && tablesCount === 0 && (
              <div className="rounded-lg border-2 border-dashed bg-white p-8 text-center">
                <div className="text-4xl mb-3">🪑</div>
                <div className="font-medium text-slate-700 mb-1">{t('partnertables.empty.title')}</div>
                <div className="text-sm text-slate-500 mb-4">{t('partnertables.empty.description')}</div>
                <div className="flex justify-center gap-2">
                  <Button onClick={openNewArea}><Plus className="h-4 w-4 mr-1" />{t('partnertables.create_area')}</Button>
                  <Button variant="outline" onClick={() => openNewTable("none")}><Plus className="h-4 w-4 mr-1" />{t('partnertables.create_table')}</Button>
                </div>
              </div>
            )}
          </>
        )}

        {/* Area Dialog */}
        <Dialog open={areaDialog} onOpenChange={setAreaDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader><DialogTitle>{areaForm.id ? t('partnertables.dialog.area.edit') : t('partnertables.dialog.area.new')}</DialogTitle><DialogDescription>{t('partnertables.dialog.area.description')}</DialogDescription></DialogHeader>
            <form onSubmit={(e) => { e.preventDefault(); saveArea(); }}>
              <div className="space-y-4 py-2"><div className="space-y-2"><Label>{t('partnertables.dialog.area.name_label')} *</Label><Input value={areaForm.name} onChange={(e) => setAreaForm(f => ({ ...f, name: e.target.value }))} onKeyDown={handleAreaFormKeyDown} placeholder={t('partnertables.dialog.area.name_placeholder')} className="text-lg h-12" autoFocus /></div></div>
              <DialogActions onCancel={() => setAreaDialog(false)} onSave={saveArea} saving={saving} disabled={!apiReady} t={t} />
            </form>
          </DialogContent>
        </Dialog>

        {/* Table Dialog */}
        <Dialog open={tableDialog} onOpenChange={(open) => { setTableDialog(open); }}>
          <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
            <DialogHeader><DialogTitle>{tableForm.id ? t('partnertables.dialog.table.edit') : t('partnertables.dialog.table.new')}</DialogTitle><DialogDescription>{codeMode === "shared" ? t('partnertables.dialog.table.code_unified', { code: unifiedCode, number: tableForm.number || t('partnertables.dialog.table.unknown_number') }) : t('partnertables.dialog.table.code_auto')}</DialogDescription></DialogHeader>
            <form onSubmit={(e) => { e.preventDefault(); saveTable(); }}>
              <div className="space-y-4 py-2">
                <div className="space-y-2"><Label>{t('partnertables.dialog.table.number_label')} *</Label><Input type="number" min="1" inputMode="numeric" value={tableForm.number} onChange={(e) => { const num = e.target.value; setTableForm(f => ({ ...f, number: num, code: codeMode === "shared" ? `${unifiedCode}${String(num).padStart(codeDigits, "0")}` : f.code })); }} onKeyDown={handleTableFormKeyDown} placeholder={t('partnertables.dialog.table.number_placeholder')} className="text-lg h-12" autoFocus />{tableNumberConflictMsg && <p className="text-xs text-red-600">{tableNumberConflictMsg}</p>}</div>
                <div className="space-y-2"><Label>{t('partnertables.area')}</Label><Select value={tableForm.area || "none"} onValueChange={(v) => setTableForm(f => ({ ...f, area: v === "none" ? "" : v }))}><SelectTrigger className="h-12"><SelectValue placeholder={t('partnertables.dialog.table.select_area')} /></SelectTrigger><SelectContent><SelectItem value="none">{t('partnertables.no_area')}</SelectItem>{areas.map(a => <SelectItem key={a.id} value={String(a.id)}>{a.name}</SelectItem>)}</SelectContent></Select></div>
                {codeMode === "individual" && <div className="space-y-2"><Label>{t('partnertables.dialog.table.code_label')}</Label><div className="flex items-center gap-2"><Input value={tableForm.code} onChange={(e) => setTableForm(f => ({ ...f, code: e.target.value.replace(/\D/g, "") }))} onKeyDown={handleTableFormKeyDown} className="font-mono text-lg" placeholder={t('partnertables.dialog.table.code_placeholder')} maxLength={6} /><Tooltip><TooltipTrigger asChild><Button type="button" variant="outline" size="icon" className="h-11 w-11" onClick={() => setTableForm(f => ({ ...f, code: generateUniqueCode(existingCodes) || generate4DigitCode() }))}><RefreshCw className="h-4 w-4" /></Button></TooltipTrigger><TooltipContent>{t('partnertables.generate_code')}</TooltipContent></Tooltip></div><p className="text-xs text-slate-500">{t('partnertables.dialog.table.code_hint')}</p></div>}
                
              </div>
              <DialogActions onCancel={() => setTableDialog(false)} onSave={saveTable} saving={saving} disabled={!apiReady} t={t} />
            </form>
          </DialogContent>
        </Dialog>

        {/* Code Settings Dialog */}
        <Dialog open={codeSettingsDialog} onOpenChange={setCodeSettingsDialog}><DialogContent className="max-w-md"><DialogHeader><DialogTitle>{t('partnertables.dialog.code_settings.title')}</DialogTitle><DialogDescription>{t('partnertables.dialog.code_settings.description')}</DialogDescription></DialogHeader><CodeSettingsForm initialMode={codeMode} initialCode={unifiedCode} initialDigits={codeDigits} saving={saving} onSave={saveCodeSettings} onCancel={() => setCodeSettingsDialog(false)} t={t} /></DialogContent></Dialog>

        {/* QR Single Dialog */}
        <Dialog open={qrSingleDialog} onOpenChange={(open) => { setQrSingleDialog(open); if (!open) setQrSingleTable(null); }}>
          <DialogContent className="w-[calc(100vw-24px)] max-w-[440px] overflow-hidden">
            <DialogHeader className="text-center">
              <DialogTitle className="text-center">{t('partnertables.qr.single_title', { number: qrSingleTable ? displayTableNumber(qrSingleTable) : "" })}</DialogTitle>
              <DialogDescription className="text-center">{qrSingleTable?.area ? getAreaName(qrSingleTable.area, areas, t) : t('partnertables.qr.scan_hint')}</DialogDescription>
            </DialogHeader>
            {qrSingleTable && (
              <div className="flex flex-col items-center gap-4 py-1">
                <div className="rounded-xl border bg-white p-4 shadow-sm">
                  <QRCodeImage 
                    value={getTableQRUrl(partner, qrSingleTable)} 
                    size={200} 
                    className="block"
                    logoUrl={qrShowLogo ? partnerLogoUrl : null}
                  />
                </div>
                {partnerLogoUrl && (
                  <div className="flex items-center gap-2">
                    <Checkbox id="qr-single-logo" checked={qrShowLogo} onCheckedChange={setQrShowLogo} />
                    <label htmlFor="qr-single-logo" className="text-sm cursor-pointer">{t('partnertables.qr.show_logo')}</label>
                  </div>
                )}
                <div className="w-full">
                  <Label className="text-xs text-slate-500">{t('partnertables.qr.link')}</Label>
                  <div className="mt-1 flex items-center gap-2">
                    <Input readOnly value={getTableQRUrl(partner, qrSingleTable)} className="min-w-0 flex-1 h-10 text-xs font-mono" onFocus={(e) => e.target.select()} />
                    <Button variant="outline" size="icon" className="h-11 w-11 shrink-0" onClick={() => { navigator.clipboard.writeText(getTableQRUrl(partner, qrSingleTable)).then(() => toast.success(t('toast.copied'), { id: STORAGE_KEYS.TOAST_ID })).catch(() => toast.error(t('toast.error'), { id: STORAGE_KEYS.TOAST_ID })); }}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}
            <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-3">
              <Button variant="outline" onClick={() => setQrSingleDialog(false)} className="h-11 w-full">{t('common.close')}</Button>
              <Button variant="outline" onClick={downloadSingleQR} className="h-11 w-full"><Download className="h-4 w-4 mr-2" />{t('partnertables.qr.download')}</Button>
              <Button onClick={printSingleQR} className="h-11 w-full"><Printer className="h-4 w-4 mr-2" />{t('partnertables.qr.print')}</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* QR Batch Dialog - P0-6: Removed all || fallbacks */}
        <Dialog open={qrBatchDialog} onOpenChange={setQrBatchDialog}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            <DialogHeader>
              <DialogTitle>{qrBatchTitle}</DialogTitle>
              <DialogDescription>
                {qrSelectedCount} {t('partnertables.qr.of')} {qrBatchTables.length} {pluralize(qrBatchTables.length, t('partnertables.table_one'), t('partnertables.table_few'), t('partnertables.table_many'))} {t('partnertables.qr.selected')}
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-3 border-b">
              <div className="space-y-3">
                <div>
                  <Label className="text-sm text-slate-600 mb-1.5 block">{t('partnertables.qr.size_label')}</Label>
                  <Select value={qrSize} onValueChange={setQrSize}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{Object.entries(QR_SIZES).map(([key, { label }]) => <SelectItem key={key} value={key}>{label}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-sm text-slate-600 mb-1.5 block">{t('partnertables.qr.cols_label')}</Label>
                  <Select value={qrPrintLayout} onValueChange={setQrPrintLayout}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{PRINT_LAYOUTS.map(({ value, label }) => <SelectItem key={value} value={value}>{label}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-3">
                <Label className="text-sm text-slate-600 mb-1.5 block">{t('partnertables.qr.show_label')}</Label>
                <div className="flex items-center gap-2">
                  <Checkbox id="qr-show-number" checked={qrShowNumber} onCheckedChange={setQrShowNumber} />
                  <label htmlFor="qr-show-number" className="text-sm cursor-pointer">{t('partnertables.qr.show_number')}</label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox id="qr-show-area" checked={qrShowArea} onCheckedChange={setQrShowArea} />
                  <label htmlFor="qr-show-area" className="text-sm cursor-pointer">{t('partnertables.qr.show_area')}</label>
                </div>
                {partnerLogoUrl ? (
                  <div className="flex items-center gap-2">
                    <Checkbox id="qr-show-logo" checked={qrShowLogo} onCheckedChange={setQrShowLogo} />
                    <label htmlFor="qr-show-logo" className="text-sm cursor-pointer">{t('partnertables.qr.show_logo')}</label>
                  </div>
                ) : (
                  <div className="text-sm text-slate-500">
                    <a href="/partnersettings" className="flex items-center gap-1 text-indigo-600 hover:underline" onClick={() => setQrBatchDialog(false)}>{t('partnertables.qr.add_logo_hint')} <ChevronRight className="h-4 w-4" aria-hidden="true" /></a>
                  </div>
                )}
              <div className="pt-2 space-y-3">
                <div>
                  <Label className="text-sm text-slate-600 mb-1.5 block">{t('partnertables.qr.text_top')}</Label>
                  <Input
                    value={qrHeaderText}
                    onChange={(e) => setQrHeaderText(e.target.value)}
                    placeholder={t('partnertables.qr.text_top_placeholder')}
                    className="h-9"
                  />
                </div>
                <div>
                  <Label className="text-sm text-slate-600 mb-1.5 block">{t('partnertables.qr.text_bottom')}</Label>
                  <Input
                    value={qrFooterText}
                    onChange={(e) => setQrFooterText(e.target.value)}
                    placeholder={t('partnertables.qr.text_bottom_placeholder')}
                    className="h-9"
                  />
                </div>
              </div>
              </div>
            </div>

            <div className="flex items-center gap-2 py-2">
              <Button variant="outline" size="sm" onClick={selectAllQrTables} className="h-11 text-xs">
                {t('partnertables.qr.select_all')}
              </Button>
              <Button variant="outline" size="sm" onClick={deselectAllQrTables} className="h-11 text-xs">
                {t('partnertables.qr.deselect_all')}
              </Button>
              <span className="text-xs text-slate-500 ml-auto">
                {qrSelectedCount === qrBatchTables.length 
                  ? t('partnertables.qr.all_selected')
                  : `${qrSelectedCount} ${t('partnertables.qr.selected')}`}
              </span>
            </div>

            <div className="flex-1 overflow-auto border rounded-lg bg-slate-50 p-3">
              <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${Math.min(qrPreviewCols, Math.max(1, qrBatchTables.length))}, 1fr)` }}>
                {qrBatchTables.map(table => {
                  const isSelected = qrSelectedTables.has(String(table.id));
                  return (
                    <label
                      key={table.id}
                      className={`relative flex flex-col items-center p-3 rounded-lg cursor-pointer transition-all border-2 ${
                        isSelected
                          ? 'bg-indigo-50 border-indigo-400 shadow-sm'
                          : 'bg-white border-transparent hover:border-slate-300'
                      }`}
                    >
                      <div className="absolute top-2 left-2">
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => toggleQrTableSelection(table.id)}
                        />
                      </div>

                      {qrHeaderText && (
                        <div className="text-center text-xs text-slate-600 mt-2 w-full truncate whitespace-pre-wrap">{qrHeaderText}</div>
                      )}

                      <div className={qrHeaderText ? "mt-1" : "mt-2"}>
                        <QRCodeImage
                          value={getTableQRUrl(partner, table)}
                          size={qrPreviewSize}
                          logoUrl={qrShowLogo ? partnerLogoUrl : null}
                          className="rounded"
                        />
                      </div>

                      <div className="text-center mt-2 w-full">
                        {qrShowNumber && (
                          <div className="font-medium text-sm text-slate-800">
                            {t('partnertables.table')} №{displayTableNumber(table)}
                          </div>
                        )}
                        {qrShowArea && (
                          <div className="text-xs text-slate-500 truncate">
                            {getAreaName(table.area, areas, t)}
                          </div>
                        )}
                      </div>

                      {qrFooterText && (
                        <div className="text-center text-xs text-slate-600 mt-1 w-full truncate whitespace-pre-wrap">{qrFooterText}</div>
                      )}
                    </label>
                  );
                })}
              </div>
            </div>

            <DialogFooter className="flex-row gap-2 mt-4">
              <Button variant="outline" onClick={() => setQrBatchDialog(false)} className="flex-1 h-11">
                {t('common.cancel')}
              </Button>
              <Button
                onClick={printBatchQR} 
                className="flex-1 h-11"
                disabled={qrSelectedCount === 0}
              >
                <Printer className="h-4 w-4 mr-2" />
                {t('partnertables.qr.print')} ({qrSelectedCount})
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </TooltipProvider>
    </PartnerShell>
  );
}