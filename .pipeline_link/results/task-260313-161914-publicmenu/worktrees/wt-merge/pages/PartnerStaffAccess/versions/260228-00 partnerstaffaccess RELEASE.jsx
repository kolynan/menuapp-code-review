import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
    Loader2, Plus, Copy, QrCode, Mail, Link2, MoreVertical,
    User, ChefHat, Briefcase, Check, Clock, Send, X,
    Users, RefreshCw, Trash2, Edit2, Lock, Info, Calendar, 
    MessageSquare, AlertTriangle, Search, Filter, Printer, Square, CheckSquare,
    Crown, Shield
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { toast } from "sonner";
import PartnerShell, { usePartnerAccess } from "@/components/PartnerShell";
import { useI18n } from "@/components/i18n";

// ============================================================
// CONSTANTS
// ============================================================

const getRoles = (t) => ({
    director: { 
        label: t('partnerstaffaccess.role.director'), 
        icon: Crown,
        color: 'text-amber-600', 
        bg: 'bg-amber-50',
        description: t('partnerstaffaccess.role.director_desc')
    },
    managing_director: { 
        label: t('partnerstaffaccess.role.managing_director'), 
        icon: Shield,
        color: 'text-emerald-600', 
        bg: 'bg-emerald-50',
        description: t('partnerstaffaccess.role.managing_director_desc')
    },
    partner_staff: { 
        label: t('partnerstaffaccess.role.partner_staff'), 
        icon: User, 
        color: 'text-blue-600', 
        bg: 'bg-blue-50',
        description: t('partnerstaffaccess.role.partner_staff_desc')
    },
    kitchen: { 
        label: t('partnerstaffaccess.role.kitchen'), 
        icon: ChefHat, 
        color: 'text-orange-600', 
        bg: 'bg-orange-50',
        description: t('partnerstaffaccess.role.kitchen_desc')
    },
    partner_manager: { 
        label: t('partnerstaffaccess.role.partner_manager'), 
        icon: Briefcase, 
        color: 'text-purple-600', 
        bg: 'bg-purple-50',
        description: t('partnerstaffaccess.role.partner_manager_desc')
    }
});

const INVITE_METHOD = {
    LINK: 'link',
    EMAIL: 'email'
};

const FILTER_STATUS = {
    ALL: 'all',
    ACTIVE: 'active',
    PENDING: 'pending',
    DISABLED: 'disabled'
};

// P0: Роли с доступом к кабинету (требуют email)
const CABINET_ACCESS_ROLES = ['director', 'managing_director'];

// ============================================================
// HELPERS
// ============================================================

// P0 SECURITY: Безопасная генерация токена
function generateToken() {
    if (crypto.randomUUID) {
        return crypto.randomUUID().replace(/-/g, '');
    }
    // Безопасный fallback через crypto.getRandomValues
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    return Array.from(array, b => b.toString(16).padStart(2, '0')).join('');
}

function getStaffLink(token) {
    return `${window.location.origin}/staffordersmobile?token=${token}`;
}

// Locale mapping для i18n
function getLocaleForLang(lang) {
    const map = { ru: 'ru-RU', en: 'en-US', kk: 'kk-KZ' };
    return map[lang] || 'ru-RU';
}

// Rate limit detection
function isRateLimitError(error) {
    if (!error) return false;
    const msg = (error.message || error.toString() || "").toLowerCase();
    return msg.includes("rate limit") || msg.includes("429");
}

function shouldRetry(failureCount, error) {
    if (isRateLimitError(error)) return false;
    return failureCount < 2;
}

// HTML sanitization for document.write contexts (XSS prevention)
function escapeHtml(str) {
    if (!str) return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;');
}

// Clipboard with fallback
async function copyToClipboard(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
        return true;
    }
    // Fallback для старых браузеров
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    try {
        return document.execCommand('copy');
    } catch (e) {
        return false;
    } finally {
        document.body.removeChild(textarea);
    }
}

// ============================================================
// P0 SECURITY: LOCAL QR CODE GENERATION
// ============================================================

function generateQRCode(text, size = 280) {
    // QR Code generator using canvas (no external API)
    // Simplified implementation - for production use 'qrcode' npm package
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    
    // Use dynamic import of qrcode library
    return new Promise((resolve, reject) => {
        import('qrcode').then(QRCode => {
            QRCode.toCanvas(canvas, text, {
                width: size,
                margin: 2,
                color: { dark: '#000000', light: '#ffffff' }
            }, (error) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(canvas.toDataURL('image/png'));
                }
            });
        }).catch(() => {
            // Fallback: show link as text if QR library not available
            ctx.fillStyle = '#f8fafc';
            ctx.fillRect(0, 0, size, size);
            ctx.fillStyle = '#334155';
            ctx.font = '14px system-ui';
            ctx.textAlign = 'center';
            ctx.fillText('QR Library not loaded', size/2, size/2 - 10);
            ctx.fillText('Copy link instead', size/2, size/2 + 10);
            resolve(canvas.toDataURL('image/png'));
        });
    });
}

// ============================================================
// SKELETON COMPONENTS
// ============================================================

function StaffCardSkeleton() {
    return (
        <Card className="overflow-hidden">
            <div className="h-1 bg-slate-200 animate-pulse" />
            <CardContent className="p-3">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-200 animate-pulse shrink-0" />
                    <div className="flex-1 space-y-2">
                        <div className="h-4 bg-slate-200 rounded w-28 animate-pulse" />
                        <div className="h-3 bg-slate-200 rounded w-20 animate-pulse" />
                    </div>
                    <div className="flex gap-1">
                        <div className="w-10 h-10 bg-slate-200 rounded animate-pulse" />
                        <div className="w-10 h-10 bg-slate-200 rounded animate-pulse" />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

// ============================================================
// CONFIRM DIALOG (replaces window.confirm)
// ============================================================

function ConfirmDialog({ isOpen, onClose, onConfirm, title, description, confirmText, variant = 'destructive', isLoading, t }) {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-sm">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        {variant === 'destructive' && <AlertTriangle className="w-5 h-5 text-red-500" />}
                        {title}
                    </DialogTitle>
                    <DialogDescription>{description}</DialogDescription>
                </DialogHeader>
                <DialogFooter className="flex-row gap-2 sm:flex-row">
                    <Button variant="outline" onClick={onClose} className="flex-1" disabled={isLoading}>
                        {t('common.cancel')}
                    </Button>
                    <Button 
                        variant={variant} 
                        onClick={onConfirm} 
                        className="flex-1"
                        disabled={isLoading}
                    >
                        {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        {confirmText || t('common.confirm')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

// ============================================================
// RATE LIMIT WARNING
// ============================================================

function RateLimitWarning({ onRetry, t }) {
    return (
        <Card className="border-amber-200 bg-amber-50">
            <CardContent className="py-8 text-center">
                <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                    {t('error.rate_limit_title')}
                </h3>
                <p className="text-slate-600 mb-4">
                    {t('error.rate_limit_desc')}
                </p>
                <Button onClick={onRetry}>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    {t('common.retry')}
                </Button>
            </CardContent>
        </Card>
    );
}

// ============================================================
// NETWORK ERROR
// ============================================================

function NetworkError({ onRetry, t }) {
    return (
        <Card className="border-red-200 bg-red-50">
            <CardContent className="py-8 text-center">
                <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                    {t('error.network_title')}
                </h3>
                <p className="text-slate-600 mb-4">
                    {t('error.network_desc')}
                </p>
                <Button onClick={onRetry} variant="outline">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    {t('common.retry')}
                </Button>
            </CardContent>
        </Card>
    );
}

// ============================================================
// QR CODE MODAL (P0: Local generation, no external API)
// ============================================================

function QRCodeModal({ isOpen, onClose, token, staffName, t }) {
    const [qrDataUrl, setQrDataUrl] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [copySuccess, setCopySuccess] = useState(false);
    const qrRef = useRef(null);
    
    const link = getStaffLink(token);
    
    // Truncate link for display: show start and end
    const displayLink = useMemo(() => {
        if (!link) return '';
        if (link.length <= 50) return link;
        const tokenStart = link.indexOf('?token=');
        if (tokenStart === -1) return link.substring(0, 47) + '...';
        // Show: domain/path?token=abc...xyz
        const tokenValue = link.substring(tokenStart + 7);
        const shortToken = tokenValue.length > 12 
            ? tokenValue.substring(0, 6) + '...' + tokenValue.substring(tokenValue.length - 4)
            : tokenValue;
        return link.substring(0, tokenStart + 7) + shortToken;
    }, [link]);

    useEffect(() => {
        if (isOpen && token) {
            setLoading(true);
            setError(null);
            setCopySuccess(false);
            generateQRCode(link, 280)
                .then(dataUrl => {
                    setQrDataUrl(dataUrl);
                    setLoading(false);
                })
                .catch(err => {
                    setError(err.message);
                    setLoading(false);
                });
        }
    }, [isOpen, token, link]);

    const downloadQR = async () => {
        if (!qrDataUrl) return;
        
        let url = null;
        try {
            // Convert data URL to blob
            const response = await fetch(qrDataUrl);
            const blob = await response.blob();
            url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = `qr-${staffName || 'staff'}.png`;
            a.click();
            
            toast.success(t('partnerstaffaccess.toast.qr_downloaded'), { id: 'mm1' });
        } catch (err) {
            toast.error(t('partnerstaffaccess.toast.qr_download_error'), { id: 'mm1' });
        } finally {
            if (url) URL.revokeObjectURL(url);
        }
    };

    // #2: Print QR (BUG-SA-001: sanitize staffName to prevent XSS)
    const printQR = () => {
        if (!qrDataUrl) return;

        const printWindow = window.open('', '_blank');
        if (!printWindow) {
            toast.error(t('partnerstaffaccess.toast.print_blocked'), { id: 'mm1' });
            return;
        }

        const safeName = escapeHtml(staffName);
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>QR - ${safeName || 'Staff'}</title>
                <style>
                    body { 
                        display: flex; 
                        flex-direction: column;
                        align-items: center; 
                        justify-content: center; 
                        min-height: 100vh;
                        margin: 0;
                        font-family: system-ui, sans-serif;
                    }
                    img { width: 300px; height: 300px; }
                    h2 { margin: 20px 0 5px; font-size: 18px; }
                    p { margin: 0; color: #666; font-size: 12px; }
                </style>
            </head>
            <body>
                <img src="${qrDataUrl}" alt="QR Code" />
                <h2>${safeName || ''}</h2>
                <p>${t('partnerstaffaccess.qr.print_hint')}</p>
                <script>
                    window.onload = function() {
                        window.print();
                        window.onafterprint = function() { window.close(); };
                    };
                </script>
            </body>
            </html>
        `);
        printWindow.document.close();
    };

    const handleCopyLink = async () => {
        const success = await copyToClipboard(link);
        if (success) {
            setCopySuccess(true);
            toast.success(t('toast.copied'), { id: 'mm1' });
            setTimeout(() => setCopySuccess(false), 2000);
        } else {
            toast.error(t('error.clipboard_failed'), { id: 'mm1' });
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-xs">
                <DialogHeader>
                    <DialogTitle className="text-center">{t('partnerstaffaccess.qr.title')}</DialogTitle>
                    <DialogDescription className="text-center">{staffName}</DialogDescription>
                </DialogHeader>
                <div className="flex flex-col items-center py-4">
                    {loading ? (
                        <div className="w-[280px] h-[280px] flex items-center justify-center bg-slate-50 rounded-lg">
                            <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
                        </div>
                    ) : error ? (
                        /* #1: Improved fallback UI */
                        <div className="w-[280px] flex flex-col items-center justify-center bg-amber-50 border border-amber-200 rounded-lg p-4">
                            <AlertTriangle className="w-8 h-8 text-amber-500 mb-3" />
                            <p className="text-sm font-medium text-slate-700 text-center mb-2">
                                {t('partnerstaffaccess.qr.generation_error')}
                            </p>
                            <p className="text-xs text-slate-500 text-center mb-4">
                                {t('partnerstaffaccess.qr.fallback_hint')}
                            </p>
                            <div className="flex flex-col gap-2 w-full">
                                <Button size="sm" onClick={handleCopyLink} className="w-full">
                                    {copySuccess ? (
                                        <Check className="w-4 h-4 mr-2 text-green-500" />
                                    ) : (
                                        <Copy className="w-4 h-4 mr-2" />
                                    )}
                                    {copySuccess ? t('toast.copied') : t('partnerstaffaccess.invite.copy_link')}
                                </Button>
                                <a 
                                    href={`https://www.qr-code-generator.com/`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-indigo-600 hover:underline text-center"
                                >
                                    {t('partnerstaffaccess.qr.external_generator')}
                                </a>
                            </div>
                        </div>
                    ) : (
                        <img 
                            ref={qrRef}
                            src={qrDataUrl} 
                            alt={t('partnerstaffaccess.qr.alt')}
                            className="rounded-lg border w-[280px] h-[280px]"
                        />
                    )}
                    <p className="text-xs text-slate-500 mt-3 text-center">
                        {t('partnerstaffaccess.qr.hint')}
                    </p>
                </div>
                
                {/* Link display */}
                <div className="px-2 -mt-2 mb-2 overflow-hidden">
                    <div 
                        className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-100 transition-colors min-w-0"
                        onClick={handleCopyLink}
                        title={link}
                    >
                        <Link2 className="w-4 h-4 text-slate-400 shrink-0" />
                        <span className="text-xs text-slate-600 truncate flex-1 font-mono min-w-0">
                            {displayLink}
                        </span>
                        {copySuccess ? (
                            <Check className="w-4 h-4 text-green-500 shrink-0" />
                        ) : (
                            <Copy className="w-4 h-4 text-slate-400 shrink-0" />
                        )}
                    </div>
                </div>
                
                <DialogFooter className="flex-col gap-2 sm:flex-col">
                    {/* Download and Print buttons */}
                    <div className="flex gap-2 w-full">
                        <Button onClick={downloadQR} className="flex-1" disabled={loading || error}>
                            {t('partnerstaffaccess.qr.download')}
                        </Button>
                        <Button onClick={printQR} variant="outline" disabled={loading || error} aria-label={t('partnerstaffaccess.qr.print')}>
                            <Printer className="w-4 h-4" />
                        </Button>
                    </div>
                    <Button variant="ghost" onClick={onClose} className="w-full">
                        {t('common.close')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

// ============================================================
// INVITE LINK MODAL
// ============================================================

function InviteLinkModal({ isOpen, onClose, link, email, staffName, t }) {
    // P0 UX: Copy feedback states
    const [copyLinkSuccess, setCopyLinkSuccess] = useState(false);
    const [copyTextSuccess, setCopyTextSuccess] = useState(false);

    // Reset states when modal closes
    useEffect(() => {
        if (!isOpen) {
            setCopyLinkSuccess(false);
            setCopyTextSuccess(false);
        }
    }, [isOpen]);

    const handleCopyLink = async () => {
        const success = await copyToClipboard(link);
        if (success) {
            setCopyLinkSuccess(true);
            toast.success(t('toast.copied'), { id: 'mm1' });
            setTimeout(() => setCopyLinkSuccess(false), 2000);
        } else {
            toast.error(t('error.clipboard_failed'), { id: 'mm1' });
        }
    };

    const handleCopyText = async () => {
        const text = t('partnerstaffaccess.invite.copy_text_template', { link, email });
        const success = await copyToClipboard(text);
        if (success) {
            setCopyTextSuccess(true);
            toast.success(t('toast.copied'), { id: 'mm1' });
            setTimeout(() => setCopyTextSuccess(false), 2000);
        } else {
            toast.error(t('error.clipboard_failed'), { id: 'mm1' });
        }
    };

    const message = t('partnerstaffaccess.invite.share_message', { link });
    const encodedMessage = encodeURIComponent(message);

    const handleEmail = () => {
        const subject = encodeURIComponent(t('partnerstaffaccess.invite.email_subject'));
        const body = encodeURIComponent(t('partnerstaffaccess.invite.email_body', { link, email }));
        window.open(`mailto:${email}?subject=${subject}&body=${body}`, '_self');
    };

    const handleWhatsApp = () => {
        window.open(`https://wa.me/?text=${encodedMessage}`, '_blank');
    };

    const handleTelegram = () => {
        window.open(`https://t.me/share/url?url=${encodeURIComponent(link)}&text=${encodeURIComponent(t('partnerstaffaccess.invite.telegram_text'))}`, '_blank');
    };

    const handleSMS = () => {
        window.open(`sms:?body=${encodedMessage}`, '_self');
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Check className="w-5 h-5 text-green-500" />
                        {t('partnerstaffaccess.invite.created_title')}
                    </DialogTitle>
                    <DialogDescription>
                        {t('partnerstaffaccess.invite.created_desc')}
                    </DialogDescription>
                </DialogHeader>
                
                <div className="py-4 space-y-4">
                    {/* Staff info */}
                    <div className="p-3 bg-slate-50 rounded-lg">
                        <div className="text-sm font-medium">{staffName}</div>
                        <div className="text-xs text-slate-500">{email}</div>
                    </div>

                    {/* Send options */}
                    <div className="grid grid-cols-2 gap-2">
                        <Button 
                            variant="outline" 
                            onClick={handleEmail}
                            className="h-auto py-3 flex-col gap-1 hover:bg-blue-50 hover:border-blue-300 active:scale-95 transition-all"
                            aria-label={t('partnerstaffaccess.invite.send_via_email')}
                        >
                            <Mail className="w-5 h-5 text-blue-600" aria-hidden="true" />
                            <span className="text-xs">Email</span>
                        </Button>
                        <Button 
                            variant="outline" 
                            onClick={handleWhatsApp}
                            className="h-auto py-3 flex-col gap-1 hover:bg-green-50 hover:border-green-300 active:scale-95 transition-all"
                            aria-label={t('partnerstaffaccess.invite.send_via_whatsapp')}
                        >
                            <svg className="w-5 h-5 text-green-600" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                            </svg>
                            <span className="text-xs">WhatsApp</span>
                        </Button>
                        <Button 
                            variant="outline" 
                            onClick={handleTelegram}
                            className="h-auto py-3 flex-col gap-1 hover:bg-sky-50 hover:border-sky-300 active:scale-95 transition-all"
                            aria-label={t('partnerstaffaccess.invite.send_via_telegram')}
                        >
                            <svg className="w-5 h-5 text-sky-500" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                                <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                            </svg>
                            <span className="text-xs">Telegram</span>
                        </Button>
                        <Button 
                            variant="outline" 
                            onClick={handleSMS}
                            className="h-auto py-3 flex-col gap-1 hover:bg-slate-100 hover:border-slate-400 active:scale-95 transition-all"
                            aria-label={t('partnerstaffaccess.invite.send_via_sms')}
                        >
                            <MessageSquare className="w-5 h-5 text-slate-600" aria-hidden="true" />
                            <span className="text-xs">SMS</span>
                        </Button>
                    </div>

                    {/* Copy options - P0 UX: with visual feedback */}
                    <div className="flex gap-2">
                        <Button 
                            variant="outline" 
                            onClick={handleCopyLink}
                            className={`flex-1 text-xs h-10 active:scale-95 transition-all ${
                                copyLinkSuccess 
                                    ? 'bg-green-50 border-green-400 text-green-700' 
                                    : 'hover:bg-indigo-50 hover:border-indigo-300'
                            }`}
                        >
                            {copyLinkSuccess ? (
                                <Check className="w-4 h-4 mr-1 text-green-600" aria-hidden="true" />
                            ) : (
                                <Link2 className="w-4 h-4 mr-1" aria-hidden="true" />
                            )}
                            {copyLinkSuccess ? t('toast.copied') : t('partnerstaffaccess.invite.copy_link')}
                        </Button>
                        <Button 
                            variant="outline" 
                            onClick={handleCopyText}
                            className={`flex-1 text-xs h-10 active:scale-95 transition-all ${
                                copyTextSuccess 
                                    ? 'bg-green-50 border-green-400 text-green-700' 
                                    : 'hover:bg-indigo-50 hover:border-indigo-300'
                            }`}
                        >
                            {copyTextSuccess ? (
                                <Check className="w-4 h-4 mr-1 text-green-600" aria-hidden="true" />
                            ) : (
                                <Copy className="w-4 h-4 mr-1" aria-hidden="true" />
                            )}
                            {copyTextSuccess ? t('toast.copied') : t('partnerstaffaccess.invite.copy_text')}
                        </Button>
                    </div>

                    {/* Important note */}
                    <div className="text-xs text-slate-500 bg-amber-50 p-3 rounded-lg">
                        <strong>{t('partnerstaffaccess.invite.important')}:</strong> {t('partnerstaffaccess.invite.important_note', { email })}
                    </div>
                </div>

                <DialogFooter>
                    <Button onClick={onClose} className="w-full">
                        {t('partnerstaffaccess.invite.done')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

// ============================================================
// CREATE STAFF DIALOG
// ============================================================

function CreateStaffDialog({ isOpen, onClose, onSubmit, isLoading, existingLinks = [], canInviteRole, t }) {
    const [name, setName] = useState('');
    const [role, setRole] = useState('partner_staff');
    const [method, setMethod] = useState(INVITE_METHOD.LINK);
    const [email, setEmail] = useState('');
    const [validationError, setValidationError] = useState(null);

    const allRoles = useMemo(() => getRoles(t), [t]);
    const ROLES = useMemo(() => {
        if (!canInviteRole) return allRoles;
        return Object.fromEntries(
            Object.entries(allRoles).filter(([key]) => canInviteRole(key))
        );
    }, [allRoles, canInviteRole]);

    // P0: Email обязателен для директоров
    const emailRequired = CABINET_ACCESS_ROLES.includes(role);

    // P0: Reset state when dialog closes
    useEffect(() => {
        if (!isOpen) {
            setName('');
            setRole('partner_staff');
            setMethod(INVITE_METHOD.LINK);
            setEmail('');
            setValidationError(null);
        }
    }, [isOpen]);

    // Clear validation error when inputs change
    useEffect(() => {
        setValidationError(null);
    }, [name, role, email, method]);

    const handleSubmit = () => {
        if (!name.trim()) return;
        
        // P0: Email обязателен для директоров
        if (emailRequired && !email.trim()) {
            setValidationError(t('partnerstaffaccess.create.email_required_for_director'));
            return;
        }
        
        if (method === INVITE_METHOD.EMAIL && !email.trim()) return;
        
        // Validation: check for duplicate email
        if (method === INVITE_METHOD.EMAIL) {
            const emailLower = email.trim().toLowerCase();
            const duplicateEmail = existingLinks.find(
                link => link.invite_email?.toLowerCase() === emailLower
            );
            if (duplicateEmail) {
                setValidationError(t('partnerstaffaccess.create.error_duplicate_email'));
                return;
            }
        }
        
        // Validation: check for duplicate name + role
        const nameTrimmed = name.trim().toLowerCase();
        const duplicateNameRole = existingLinks.find(
            link => link.staff_name?.toLowerCase() === nameTrimmed && link.staff_role === role
        );
        if (duplicateNameRole) {
            setValidationError(t('partnerstaffaccess.create.error_duplicate_name_role'));
            return;
        }
        
        onSubmit({
            staff_name: name.trim(),
            staff_role: role,
            invite_email: method === INVITE_METHOD.EMAIL ? email.trim() : null
        });
    };

    // P0: Для директоров email обязателен независимо от метода
    const isValid = name.trim() && (
        emailRequired 
            ? email.trim() 
            : (method === INVITE_METHOD.LINK || email.trim())
    );

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>{t('partnerstaffaccess.create.title')}</DialogTitle>
                    <DialogDescription>
                        {t('partnerstaffaccess.create.description')}
                    </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4 py-2">
                    {/* Name */}
                    <div className="space-y-2">
                        <Label htmlFor="staff-name">{t('partnerstaffaccess.create.name_label')} *</Label>
                        <Input 
                            id="staff-name"
                            value={name} 
                            onChange={(e) => setName(e.target.value)}
                            placeholder={t('partnerstaffaccess.create.name_placeholder')}
                            autoComplete="off"
                        />
                    </div>

                    {/* Role */}
                    <div className="space-y-2">
                        <Label htmlFor="staff-role">{t('partnerstaffaccess.create.role_label')}</Label>
                        <Select value={role} onValueChange={setRole}>
                            <SelectTrigger id="staff-role">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {Object.entries(ROLES).map(([key, { label, icon: Icon }]) => (
                                    <SelectItem key={key} value={key}>
                                        <div className="flex items-center gap-2">
                                            <Icon className="w-4 h-4" aria-hidden="true" />
                                            {label}
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <p className="text-xs text-slate-500 px-1">
                            {ROLES[role]?.description}
                        </p>
                        {/* P0: Подсказка для директоров */}
                        {emailRequired && (
                            <p className="text-xs text-amber-600 px-1 mt-1 flex items-center gap-1">
                                <Mail className="w-3 h-3" />
                                {t('partnerstaffaccess.create.email_required_hint')}
                            </p>
                        )}
                    </div>

                    {/* Invite method */}
                    <div className="space-y-3">
                        <Label>{t('partnerstaffaccess.create.method_label')}</Label>
                        
                        {/* Link option */}
                        <button
                            type="button"
                            className={`w-full p-3 rounded-lg border-2 text-left transition-colors ${
                                method === INVITE_METHOD.LINK 
                                    ? 'border-indigo-500 bg-indigo-50' 
                                    : 'border-slate-200 hover:border-slate-300'
                            }`}
                            onClick={() => setMethod(INVITE_METHOD.LINK)}
                            aria-pressed={method === INVITE_METHOD.LINK}
                        >
                            <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                    method === INVITE_METHOD.LINK ? 'bg-indigo-500 text-white' : 'bg-slate-100'
                                }`}>
                                    <Link2 className="w-4 h-4" aria-hidden="true" />
                                </div>
                                <div className="flex-1">
                                    <div className="font-medium">{t('partnerstaffaccess.create.method_link')}</div>
                                    <div className="text-xs text-slate-500">{t('partnerstaffaccess.create.method_link_desc')}</div>
                                </div>
                                {method === INVITE_METHOD.LINK && (
                                    <Check className="w-5 h-5 text-indigo-500" aria-hidden="true" />
                                )}
                            </div>
                        </button>

                        {/* Email option */}
                        <div
                            className={`p-3 rounded-lg border-2 transition-colors ${
                                method === INVITE_METHOD.EMAIL 
                                    ? 'border-indigo-500 bg-indigo-50' 
                                    : 'border-slate-200 hover:border-slate-300'
                            }`}
                        >
                            <button
                                type="button"
                                className="w-full text-left"
                                onClick={() => setMethod(INVITE_METHOD.EMAIL)}
                                aria-pressed={method === INVITE_METHOD.EMAIL}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                        method === INVITE_METHOD.EMAIL ? 'bg-indigo-500 text-white' : 'bg-slate-100'
                                    }`}>
                                        <Mail className="w-4 h-4" aria-hidden="true" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="font-medium">{t('partnerstaffaccess.create.method_email')}</div>
                                        <div className="text-xs text-slate-500">{t('partnerstaffaccess.create.method_email_desc')}</div>
                                        <div className="flex items-center gap-1 text-xs text-green-600 mt-0.5">
                                            <Lock className="w-3 h-3" aria-hidden="true" />
                                            {t('partnerstaffaccess.create.method_email_secure')}
                                        </div>
                                    </div>
                                    {method === INVITE_METHOD.EMAIL && (
                                        <Check className="w-5 h-5 text-indigo-500" aria-hidden="true" />
                                    )}
                                </div>
                            </button>
                            
                            {method === INVITE_METHOD.EMAIL && (
                                <div className="mt-3 pt-3 border-t border-indigo-200">
                                    <Input 
                                        type="email"
                                        value={email} 
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="email@example.com"
                                        className="bg-white"
                                        aria-label={t('partnerstaffaccess.create.email_placeholder')}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <DialogFooter className="flex-row gap-2">
                    <Button variant="outline" onClick={onClose} className="flex-1" disabled={isLoading}>
                        {t('common.cancel')}
                    </Button>
                    <Button 
                        onClick={handleSubmit} 
                        disabled={!isValid || isLoading}
                        className="flex-1 bg-indigo-600 hover:bg-indigo-700"
                    >
                        {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        {t('partnerstaffaccess.create.submit')}
                    </Button>
                </DialogFooter>
                
                {/* Validation error */}
                {validationError && (
                    <p className="text-xs text-red-600 text-center -mt-2 pb-2 flex items-center justify-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        {validationError}
                    </p>
                )}
                
                {/* Validation hint */}
                {!validationError && !isValid && (name.trim() || email.trim()) && (
                    <p className="text-xs text-amber-600 text-center -mt-2 pb-2">
                        {!name.trim() ? t('partnerstaffaccess.create.hint_name') : 
                         method === INVITE_METHOD.EMAIL && !email.trim() ? t('partnerstaffaccess.create.hint_email') : ''}
                    </p>
                )}
            </DialogContent>
        </Dialog>
    );
}

// ============================================================
// STAFF CARD
// ============================================================

function StaffCard({ link, onCopy, onQR, onToggle, onDelete, onEdit, onResetToken, onResendInvite, isUpdating, isSelected, onSelect, selectionMode, canDelete = true, t, lang }) {
    const ROLES = useMemo(() => getRoles(t), [t]);
    const roleConfig = ROLES[link.staff_role] || ROLES.partner_staff;
    const RoleIcon = roleConfig.icon;
    
    const hasEmail = !!link.invite_email;
    const isAccepted = !!link.invite_accepted_at;
    const hasBeenActive = !!link.last_active_at;
    // Pending: Email без принятия ИЛИ Link без первого входа
    const isPending = hasEmail ? !isAccepted : !hasBeenActive;

    // State for copy button checkmark
    const [copySuccess, setCopySuccess] = useState(false);

    let statusBarColor = 'bg-green-500';
    
    if (!link.is_active) {
        statusBarColor = 'bg-slate-300';
    } else if (isPending) {
        statusBarColor = 'bg-amber-400';
    }

    // Format date with proper locale
    const formatDate = (dateStr) => {
        if (!dateStr) return null;
        const date = new Date(dateStr);
        return date.toLocaleDateString(getLocaleForLang(lang), { 
            day: 'numeric', 
            month: 'short'
        });
    };

    // Format relative time for last active (#5)
    const formatLastActive = (dateStr) => {
        if (!dateStr) return null;
        const date = new Date(dateStr);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);
        
        if (diffMins < 1) return t('partnerstaffaccess.last_active.now');
        if (diffMins < 60) return t('partnerstaffaccess.last_active.minutes', { count: diffMins });
        if (diffHours < 24) return t('partnerstaffaccess.last_active.hours', { count: diffHours });
        if (diffDays < 7) return t('partnerstaffaccess.last_active.days', { count: diffDays });
        return formatDate(dateStr);
    };

    // Handle copy with visual feedback
    const handleCopyWithFeedback = async () => {
        await onCopy();
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
    };

    return (
        <Card className={`overflow-hidden transition-all ${!link.is_active ? 'bg-slate-50 border-slate-200' : ''} ${isSelected ? 'ring-2 ring-indigo-500' : ''}`}>
            {/* Status bar */}
            <div className={`h-1.5 ${statusBarColor}`} aria-hidden="true" />
            
            <CardContent className="p-3">
                {/* Main row */}
                <div className="flex items-center gap-3">
                    {/* #3: Checkbox for bulk selection */}
                    {selectionMode && (
                        <button
                            onClick={() => onSelect(link.id)}
                            className="shrink-0 min-h-[44px] min-w-[44px] flex items-center justify-center -ml-1"
                            aria-label={isSelected ? t('partnerstaffaccess.bulk.deselect') : t('partnerstaffaccess.bulk.select')}
                        >
                            {isSelected ? (
                                <CheckSquare className="w-5 h-5 text-indigo-600" />
                            ) : (
                                <Square className="w-5 h-5 text-slate-400" />
                            )}
                        </button>
                    )}
                    
                    {/* Avatar/Icon */}
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${roleConfig.bg}`}>
                        <RoleIcon className={`w-5 h-5 ${roleConfig.color}`} aria-hidden="true" />
                    </div>
                    
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                            <span className="font-semibold text-slate-900 truncate">
                                {link.staff_name}
                            </span>
                            {!link.is_active && (
                                <Badge variant="outline" className="text-xs text-slate-400 px-1.5 py-0">
                                    {t('partnerstaffaccess.card.disabled')}
                                </Badge>
                            )}
                        </div>
                        
                        {/* Role badge - clickable */}
                        <Popover>
                            <PopoverTrigger asChild>
                                <button 
                                    className="text-xs text-slate-500 hover:text-slate-700 flex items-center gap-1 mt-0.5"
                                    aria-label={t('partnerstaffaccess.card.role_info', { role: roleConfig.label })}
                                >
                                    {roleConfig.label}
                                    <Info className="w-3 h-3 opacity-40" aria-hidden="true" />
                                </button>
                            </PopoverTrigger>
                            <PopoverContent className="w-56 p-2 text-xs" side="top">
                                <div className="font-medium">{roleConfig.label}</div>
                                <div className="text-slate-500 mt-0.5">{roleConfig.description}</div>
                            </PopoverContent>
                        </Popover>
                    </div>

                    {/* Quick actions - Touch targets 44px min */}
                    {link.is_active && !selectionMode && (
                        <div className="flex items-center gap-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={onQR}
                                className="h-11 w-11 p-0"
                                aria-label={t('partnerstaffaccess.card.qr_title')}
                                disabled={isUpdating}
                            >
                                <QrCode className="w-5 h-5" aria-hidden="true" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleCopyWithFeedback}
                                className="h-11 w-11 p-0"
                                aria-label={t('partnerstaffaccess.card.copy_link_title')}
                                disabled={isUpdating}
                            >
                                {copySuccess ? (
                                    <Check className="w-5 h-5 text-green-500" aria-hidden="true" />
                                ) : (
                                    <Copy className="w-5 h-5" aria-hidden="true" />
                                )}
                            </Button>
                        </div>
                    )}

                    {/* Menu */}
                    {!selectionMode && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-11 w-11 p-0"
                                    aria-label={t('common.actions')}
                                    disabled={isUpdating}
                                >
                                    {isUpdating ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <MoreVertical className="w-4 h-4" aria-hidden="true" />
                                    )}
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={onEdit}>
                                    <Edit2 className="w-4 h-4 mr-2" aria-hidden="true" />
                                    {t('common.edit')}
                                </DropdownMenuItem>
                                {/* Resend only for pending email invites */}
                                {hasEmail && !isAccepted && (
                                    <DropdownMenuItem onClick={onResendInvite}>
                                        <Send className="w-4 h-4 mr-2" aria-hidden="true" />
                                        {t('partnerstaffaccess.card.resend_invite')}
                                    </DropdownMenuItem>
                                )}
                                {/* Show link / Reset link only for link-based invites (not email) */}
                                {!hasEmail && (
                                    <>
                                        <DropdownMenuItem onClick={onQR}>
                                            <Link2 className="w-4 h-4 mr-2" aria-hidden="true" />
                                            {t('partnerstaffaccess.card.show_link')}
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={onResetToken}>
                                            <RefreshCw className="w-4 h-4 mr-2" aria-hidden="true" />
                                            {t('partnerstaffaccess.card.reset_link')}
                                        </DropdownMenuItem>
                                    </>
                                )}
                                <DropdownMenuItem onClick={() => onToggle(!link.is_active)}>
                                    {link.is_active ? (
                                        <>
                                            <X className="w-4 h-4 mr-2" aria-hidden="true" />
                                            {t('partnerstaffaccess.card.disable')}
                                        </>
                                    ) : (
                                        <>
                                            <Check className="w-4 h-4 mr-2" aria-hidden="true" />
                                            {t('partnerstaffaccess.card.enable')}
                                        </>
                                    )}
                                </DropdownMenuItem>
                                {canDelete && (
                                    <>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem onClick={onDelete} className="text-red-600">
                                            <Trash2 className="w-4 h-4 mr-2" aria-hidden="true" />
                                            {t('common.delete')}
                                        </DropdownMenuItem>
                                    </>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                </div>

                {/* Meta row */}
                <div className={`flex items-center flex-wrap gap-x-3 gap-y-1 mt-2 text-xs text-slate-400 ${selectionMode ? 'pl-[76px]' : 'pl-[52px]'}`}>
                    {/* Invite method */}
                    <span className="inline-flex items-center gap-1">
                        {hasEmail ? <Mail className="w-3 h-3" aria-hidden="true" /> : <Link2 className="w-3 h-3" aria-hidden="true" />}
                        {hasEmail ? 'Email' : t('partnerstaffaccess.card.method_link')}
                    </span>
                    
                    {/* #5: Last active - if field exists */}
                    {link.last_active_at && (
                        <span className="inline-flex items-center gap-1 text-green-600">
                            <Clock className="w-3 h-3" aria-hidden="true" />
                            {formatLastActive(link.last_active_at)}
                        </span>
                    )}
                    
                    {/* Date - contextual: joined vs invited */}
                    {!link.last_active_at && (
                        <span className="inline-flex items-center gap-1">
                            <Calendar className="w-3 h-3" aria-hidden="true" />
                            {isAccepted && link.invite_accepted_at ? (
                                <>{t('partnerstaffaccess.card.joined_date')}: {formatDate(link.invite_accepted_at)}</>
                            ) : (
                                <>{formatDate(link.created_at || link.created_date)}</>
                            )}
                        </span>
                    )}
                    
                    {/* Status indicator */}
                    {isPending && link.is_active && (
                        <span className="inline-flex items-center gap-1 text-amber-500">
                            <Clock className="w-3 h-3" aria-hidden="true" />
                            {t('partnerstaffaccess.card.pending')}
                        </span>
                    )}
                    {hasEmail && isAccepted && (
                        <span className="inline-flex items-center gap-1 text-green-600">
                            <Check className="w-3 h-3" aria-hidden="true" />
                            {t('partnerstaffaccess.card.accepted')}
                        </span>
                    )}
                </div>

                {/* Email address if exists */}
                {hasEmail && (
                    <div className={`mt-1 text-xs text-slate-400 truncate ${selectionMode ? 'pl-[76px]' : 'pl-[52px]'}`}>
                        {link.invite_email}
                    </div>
                )}

                {/* Pending action button visible on ALL pending cards */}
                {isPending && link.is_active && !selectionMode && (
                    <div className="mt-2 pl-[52px]">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={hasEmail ? onResendInvite : onQR}
                            className="h-11 text-sm text-amber-600 border-amber-300 hover:bg-amber-50"
                            disabled={isUpdating}
                        >
                            <Send className="w-4 h-4 mr-1.5" aria-hidden="true" />
                            {hasEmail
                                ? t('partnerstaffaccess.card.send_invite_now')
                                : t('partnerstaffaccess.card.share_link')}
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

// ============================================================
// EDIT DIALOG
// ============================================================

function EditDialog({ isOpen, onClose, currentName, currentRole, currentEmail, hasEmail, isAccepted, onSubmit, isLoading, t }) {
    const [name, setName] = useState(currentName || '');
    const [role, setRole] = useState(currentRole || 'partner_staff');
    const [email, setEmail] = useState(currentEmail || '');
    const [emailChanged, setEmailChanged] = useState(false);

    const ROLES = useMemo(() => getRoles(t), [t]);

    useEffect(() => {
        if (isOpen) {
            setName(currentName || '');
            setRole(currentRole || 'partner_staff');
            setEmail(currentEmail || '');
            setEmailChanged(false);
        }
    }, [isOpen, currentName, currentRole, currentEmail]);

    const handleEmailChange = (value) => {
        setEmail(value);
        setEmailChanged(value !== currentEmail);
    };

    const handleSubmit = () => {
        if (!name.trim()) return;
        const data = { staff_name: name.trim(), staff_role: role };
        if (hasEmail && emailChanged) {
            data.invite_email = email.trim();
            data.invite_accepted_at = null; // Reset acceptance status
        }
        onSubmit(data);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-sm">
                <DialogHeader>
                    <DialogTitle>{t('common.edit')}</DialogTitle>
                    <DialogDescription>{t('partnerstaffaccess.edit.description')}</DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="edit-name">{t('common.name')}</Label>
                        <Input 
                            id="edit-name"
                            value={name} 
                            onChange={(e) => setName(e.target.value)}
                            placeholder={t('partnerstaffaccess.edit.name_placeholder')}
                            autoFocus
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="edit-role">{t('partnerstaffaccess.create.role_label')}</Label>
                        <Select value={role} onValueChange={setRole}>
                            <SelectTrigger id="edit-role">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {Object.entries(ROLES).map(([key, { label, icon: Icon }]) => (
                                    <SelectItem key={key} value={key}>
                                        <div className="flex items-center gap-2">
                                            <Icon className="w-4 h-4" aria-hidden="true" />
                                            {label}
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <p className="text-xs text-slate-500 px-1">
                            {ROLES[role]?.description}
                        </p>
                    </div>
                    {/* Email field for email-based invites */}
                    {hasEmail && (
                        <div className="space-y-2">
                            <Label htmlFor="edit-email">{t('partnerstaffaccess.edit.email_label')}</Label>
                            <Input 
                                id="edit-email"
                                type="email"
                                value={email} 
                                onChange={(e) => handleEmailChange(e.target.value)}
                                placeholder="email@example.com"
                            />
                            {emailChanged && isAccepted && (
                                <p className="text-xs text-amber-600 flex items-center gap-1">
                                    <AlertTriangle className="w-3 h-3" />
                                    {t('partnerstaffaccess.edit.email_warning')}
                                </p>
                            )}
                        </div>
                    )}
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={isLoading}>
                        {t('common.cancel')}
                    </Button>
                    <Button 
                        onClick={handleSubmit} 
                        disabled={!name.trim() || isLoading}
                    >
                        {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        {t('common.save')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

// ============================================================
// EMPTY STATE
// ============================================================

function EmptyState({ onAdd, t }) {
    return (
        <Card>
            <CardContent className="py-12 text-center">
                <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center mx-auto mb-4">
                    <Users className="w-8 h-8 text-indigo-600" aria-hidden="true" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                    {t('partnerstaffaccess.empty.title')}
                </h3>
                <p className="text-slate-500 mb-4 max-w-sm mx-auto">
                    {t('partnerstaffaccess.empty.description')}
                </p>
                
                {/* Benefits list */}
                <div className="text-left text-sm text-slate-600 space-y-2 mb-6 max-w-xs mx-auto">
                    <div className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-green-500 mt-0.5 shrink-0" aria-hidden="true" />
                        <span>{t('partnerstaffaccess.empty.benefit_1')}</span>
                    </div>
                    <div className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-green-500 mt-0.5 shrink-0" aria-hidden="true" />
                        <span>{t('partnerstaffaccess.empty.benefit_2')}</span>
                    </div>
                    <div className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-green-500 mt-0.5 shrink-0" aria-hidden="true" />
                        <span>{t('partnerstaffaccess.empty.benefit_3')}</span>
                    </div>
                </div>
                
                <Button onClick={onAdd} className="bg-indigo-600 hover:bg-indigo-700">
                    <Plus className="w-4 h-4 mr-2" aria-hidden="true" />
                    {t('partnerstaffaccess.add_staff')}
                </Button>
            </CardContent>
        </Card>
    );
}

// ============================================================
// SEARCH & FILTER BAR
// ============================================================

function SearchFilterBar({ searchQuery, onSearchChange, statusFilter, onStatusFilterChange, roleFilter, onRoleFilterChange, counts, t }) {
    return (
        <div className="flex flex-col sm:flex-row gap-2 mb-4">
            <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" aria-hidden="true" />
                <Input
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    placeholder={t('partnerstaffaccess.search_placeholder')}
                    className="pl-9"
                    aria-label={t('partnerstaffaccess.search_label')}
                />
            </div>
            <div className="flex gap-2">
                <Select value={statusFilter} onValueChange={onStatusFilterChange}>
                    <SelectTrigger className="w-[140px]" aria-label={t('partnerstaffaccess.filter_label')}>
                        <Filter className="w-4 h-4 mr-2 shrink-0" aria-hidden="true" />
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value={FILTER_STATUS.ALL}>
                            {t('partnerstaffaccess.filter.all')} ({counts.total})
                        </SelectItem>
                        <SelectItem value={FILTER_STATUS.ACTIVE}>
                            {t('partnerstaffaccess.filter.active')} ({counts.active})
                        </SelectItem>
                        <SelectItem value={FILTER_STATUS.PENDING}>
                            {t('partnerstaffaccess.filter.pending')} ({counts.pending})
                        </SelectItem>
                        <SelectItem value={FILTER_STATUS.DISABLED}>
                            {t('partnerstaffaccess.filter.disabled')} ({counts.disabled})
                        </SelectItem>
                    </SelectContent>
                </Select>
                <Select value={roleFilter} onValueChange={onRoleFilterChange}>
                    <SelectTrigger className="w-[130px]" aria-label={t('partnerstaffaccess.filter_role_label')}>
                        <User className="w-4 h-4 mr-2 shrink-0" aria-hidden="true" />
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">{t('partnerstaffaccess.filter.all_roles')}</SelectItem>
                        <SelectItem value="director">{t('partnerstaffaccess.role.director')}</SelectItem>
                        <SelectItem value="managing_director">{t('partnerstaffaccess.role.managing_director')}</SelectItem>
                        <SelectItem value="partner_staff">{t('partnerstaffaccess.role.partner_staff')}</SelectItem>
                        <SelectItem value="kitchen">{t('partnerstaffaccess.role.kitchen')}</SelectItem>
                        <SelectItem value="partner_manager">{t('partnerstaffaccess.role.partner_manager')}</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>
    );
}

// ============================================================
// BULK ACTIONS TOOLBAR (#3)
// ============================================================

function BulkActionsToolbar({ selectedCount, onDisable, onEnable, onDelete, onCancel, isLoading, t }) {
    return (
        <div className="flex items-center justify-between p-3 mb-4 bg-indigo-50 border border-indigo-200 rounded-lg">
            <div className="flex items-center gap-2">
                <CheckSquare className="w-5 h-5 text-indigo-600" aria-hidden="true" />
                <span className="font-medium text-indigo-900">
                    {t('partnerstaffaccess.bulk.selected', { count: selectedCount })}
                </span>
            </div>
            <div className="flex items-center gap-2">
                <Button
                    size="sm"
                    variant="outline"
                    onClick={onEnable}
                    disabled={isLoading}
                    className="h-8"
                >
                    <Check className="w-4 h-4 mr-1" aria-hidden="true" />
                    {t('partnerstaffaccess.bulk.enable')}
                </Button>
                <Button
                    size="sm"
                    variant="outline"
                    onClick={onDisable}
                    disabled={isLoading}
                    className="h-8"
                >
                    <X className="w-4 h-4 mr-1" aria-hidden="true" />
                    {t('partnerstaffaccess.bulk.disable')}
                </Button>
                <Button
                    size="sm"
                    variant="outline"
                    onClick={onDelete}
                    disabled={isLoading}
                    className="h-8 text-red-600 border-red-300 hover:bg-red-50"
                >
                    {isLoading ? (
                        <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                    ) : (
                        <Trash2 className="w-4 h-4 mr-1" aria-hidden="true" />
                    )}
                    {t('common.delete')}
                </Button>
                <Button
                    size="sm"
                    variant="ghost"
                    onClick={onCancel}
                    disabled={isLoading}
                    className="h-8"
                >
                    {t('common.cancel')}
                </Button>
            </div>
        </div>
    );
}

// ============================================================
// MAIN COMPONENT (Content - rendered INSIDE PartnerShell)
// ============================================================

function PartnerStaffAccessContent() {
    const { t, lang } = useI18n();
    const { userRole, partnerId, currentUser } = usePartnerAccess();
    
    // UI State
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [qrModal, setQrModal] = useState({ isOpen: false, token: null, name: null });
    const [editModal, setEditModal] = useState({ isOpen: false, id: null, name: null, role: null, email: null, hasEmail: false, isAccepted: false });
    const [inviteLinkModal, setInviteLinkModal] = useState({ isOpen: false, link: null, email: null, name: null });
    const [confirmModal, setConfirmModal] = useState({ isOpen: false, type: null, data: null });
    
    // Search & Filter
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState(FILTER_STATUS.ALL);
    const [roleFilter, setRoleFilter] = useState('all');
    
    // #3: Bulk selection
    const [selectedIds, setSelectedIds] = useState(new Set());
    const [bulkLoading, setBulkLoading] = useState(false);
    
    // Rate limit & per-card loading
    const [rateLimitHit, setRateLimitHit] = useState(false);
    const [updatingId, setUpdatingId] = useState(null);
    
    const queryClient = useQueryClient();
    
    // Selection mode is active when at least one item is selected
    const selectionMode = selectedIds.size > 0;

    // Partner query
    const { data: partner } = useQuery({
        queryKey: ['partner', partnerId],
        queryFn: () => base44.entities.Partner.get(partnerId),
        enabled: !!partnerId,
        retry: shouldRetry
    });

    // Staff links query with rate limit handling
    const { 
        data: links, 
        isLoading: loadingLinks, 
        error: linksError,
        refetch: refetchLinks 
    } = useQuery({
        queryKey: ['staffAccessLinks', partnerId],
        queryFn: () => base44.entities.StaffAccessLink.filter({ partner: partnerId }),
        enabled: !!partnerId && !rateLimitHit,
        retry: shouldRetry
    });

    // Rate limit detection
    useEffect(() => {
        if (linksError && isRateLimitError(linksError)) {
            setRateLimitHit(true);
        }
    }, [linksError]);

    // Permission helpers (STAFF-015..018)
    const canInviteRole = (role) => {
        if (userRole === 'owner') return true;
        if (userRole === 'director') return role !== 'director';
        if (userRole === 'managing_director') return !['director', 'managing_director'].includes(role);
        return false;
    };

    const canDeleteLink = (link) => {
        if (userRole === 'owner') return true;
        if (userRole === 'director') return link.staff_role !== 'director';
        if (userRole === 'managing_director') return !['director', 'managing_director'].includes(link.staff_role);
        return false;
    };

    const canInviteAnyone = ['owner', 'director', 'managing_director'].includes(userRole);

    // Calculate counts for filters
    const counts = useMemo(() => {
        if (!links) return { total: 0, active: 0, pending: 0, disabled: 0 };
        
        let active = 0, pending = 0, disabled = 0;
        
        links.forEach(link => {
            const hasEmail = !!link.invite_email;
            const isAccepted = !!link.invite_accepted_at;
            const hasBeenActive = !!link.last_active_at;
            // Pending: Email без принятия ИЛИ Link без первого входа
            const isPending = hasEmail ? !isAccepted : !hasBeenActive;
            
            if (!link.is_active) {
                disabled++;
            } else if (isPending) {
                pending++;
            } else {
                active++;
            }
        });
        
        return { total: links.length, active, pending, disabled };
    }, [links]);

    // Filter & search logic
    const filteredLinks = useMemo(() => {
        if (!links) return [];
        
        let result = [...links];
        
        // Search filter
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            result = result.filter(link => 
                link.staff_name?.toLowerCase().includes(query) ||
                link.invite_email?.toLowerCase().includes(query)
            );
        }
        
        // Status filter
        if (statusFilter !== FILTER_STATUS.ALL) {
            result = result.filter(link => {
                const hasEmail = !!link.invite_email;
                const isAccepted = !!link.invite_accepted_at;
                const hasBeenActive = !!link.last_active_at;
                // Pending: Email без принятия ИЛИ Link без первого входа
                const isPending = hasEmail ? !isAccepted : !hasBeenActive;
                
                switch (statusFilter) {
                    case FILTER_STATUS.ACTIVE:
                        return link.is_active && !isPending;
                    case FILTER_STATUS.PENDING:
                        return link.is_active && isPending;
                    case FILTER_STATUS.DISABLED:
                        return !link.is_active;
                    default:
                        return true;
                }
            });
        }
        
        // Role filter
        if (roleFilter !== 'all') {
            result = result.filter(link => link.staff_role === roleFilter);
        }
        
        // Sort: active first, then by name
        return result.sort((a, b) => {
            if (a.is_active !== b.is_active) return b.is_active - a.is_active;
            return (a.staff_name || '').localeCompare(b.staff_name || '');
        });
    }, [links, searchQuery, statusFilter, roleFilter]);

    const showSearchFilter = (links?.length || 0) > 5;

    // Create mutation
    const createMutation = useMutation({
        mutationFn: async (data) => {
            const token = generateToken();
            const payload = {
                partner: partnerId,
                staff_name: data.staff_name,
                staff_role: data.staff_role,
                token: token,
                is_active: true,
                invited_by: currentUser?.email || null,
                created_at: new Date().toISOString()
            };

            if (data.invite_email) {
                payload.invite_email = data.invite_email;
            }

            const record = await base44.entities.StaffAccessLink.create(payload);
            return { record, token, inviteEmail: data.invite_email };
        },
        onSuccess: ({ record, token, inviteEmail }) => {
            queryClient.invalidateQueries({ queryKey: ['staffAccessLinks', partnerId] });
            setIsCreateOpen(false);
            
            if (inviteEmail) {
                const inviteLink = `${window.location.origin}/acceptinvite?token=${token}`;
                setInviteLinkModal({ 
                    isOpen: true, 
                    link: inviteLink, 
                    email: inviteEmail,
                    name: record.staff_name 
                });
            } else {
                // P1 UX: After link creation, offer to copy/show QR
                setQrModal({ isOpen: true, token: token, name: record.staff_name });
                toast.success(t('partnerstaffaccess.toast.staff_added'), { id: 'mm1' });
            }
        },
        onError: (err) => {
            if (isRateLimitError(err)) {
                setRateLimitHit(true);
            } else {
                toast.error(t('toast.error') + ': ' + (err.message || t('partnerstaffaccess.toast.create_error')), { id: 'mm1' });
            }
        }
    });

    // Update mutation with per-card tracking + Optimistic UI
    const updateMutation = useMutation({
        mutationFn: async ({ id, ...data }) => {
            setUpdatingId(id);
            return base44.entities.StaffAccessLink.update(id, data);
        },
        // Optimistic update
        onMutate: async ({ id, ...data }) => {
            // Cancel outgoing refetches
            await queryClient.cancelQueries({ queryKey: ['staffAccessLinks', partnerId] });
            
            // Snapshot previous value
            const previousLinks = queryClient.getQueryData(['staffAccessLinks', partnerId]);
            
            // Optimistically update (skip if token reset - wait for server)
            if (!data.token) {
                queryClient.setQueryData(['staffAccessLinks', partnerId], old => 
                    old?.map(link => link.id === id ? { ...link, ...data } : link)
                );
            }
            
            return { previousLinks };
        },
        onSuccess: (_, variables) => {
            // P1 UX: If token was reset, show new link
            if (variables.token) {
                copyToClipboard(getStaffLink(variables.token)).then(success => {
                    if (success) {
                        toast.success(t('partnerstaffaccess.toast.link_reset_copied'), { id: 'mm1' });
                    } else {
                        toast.success(t('partnerstaffaccess.toast.link_reset'), { id: 'mm1' });
                    }
                });
            } else {
                toast.success(t('toast.saved'), { id: 'mm1' });
            }
        },
        onError: (err, variables, context) => {
            // Rollback on error
            if (context?.previousLinks) {
                queryClient.setQueryData(['staffAccessLinks', partnerId], context.previousLinks);
            }
            
            if (isRateLimitError(err)) {
                setRateLimitHit(true);
            } else {
                toast.error(t('toast.error') + ': ' + (err.message || t('partnerstaffaccess.toast.update_error')), { id: 'mm1' });
            }
        },
        onSettled: () => {
            setUpdatingId(null);
            queryClient.invalidateQueries({ queryKey: ['staffAccessLinks', partnerId] });
        }
    });

    // Delete mutation with Optimistic UI
    const deleteMutation = useMutation({
        mutationFn: (id) => {
            setUpdatingId(id);
            return base44.entities.StaffAccessLink.delete(id);
        },
        // Optimistic delete
        onMutate: async (id) => {
            await queryClient.cancelQueries({ queryKey: ['staffAccessLinks', partnerId] });
            const previousLinks = queryClient.getQueryData(['staffAccessLinks', partnerId]);
            
            // Optimistically remove from list
            queryClient.setQueryData(['staffAccessLinks', partnerId], old => 
                old?.filter(link => link.id !== id)
            );
            
            return { previousLinks };
        },
        onSuccess: () => {
            toast.success(t('toast.deleted'), { id: 'mm1' });
            setConfirmModal({ isOpen: false, type: null, data: null });
        },
        onError: (err, id, context) => {
            // Rollback on error
            if (context?.previousLinks) {
                queryClient.setQueryData(['staffAccessLinks', partnerId], context.previousLinks);
            }
            
            if (isRateLimitError(err)) {
                setRateLimitHit(true);
            } else {
                toast.error(t('toast.error') + ': ' + (err.message || t('partnerstaffaccess.toast.delete_error')), { id: 'mm1' });
            }
        },
        onSettled: () => {
            setUpdatingId(null);
            queryClient.invalidateQueries({ queryKey: ['staffAccessLinks', partnerId] });
        }
    });

    // Handlers
    const handleCopy = async (token) => {
        const success = await copyToClipboard(getStaffLink(token));
        if (success) {
            toast.success(t('toast.copied'), { id: 'mm1' });
        } else {
            toast.error(t('error.clipboard_failed'), { id: 'mm1' });
        }
    };

    const handleToggle = (id, active) => {
        updateMutation.mutate({ id, is_active: active });
    };

    const handleEdit = (data) => {
        if (!editModal.id) return;
        updateMutation.mutate({ id: editModal.id, ...data });
        setEditModal({ isOpen: false, id: null, name: null, role: null, email: null, hasEmail: false, isAccepted: false });
    };

    const handleDeleteConfirm = () => {
        if (confirmModal.type === 'delete' && confirmModal.data?.id) {
            deleteMutation.mutate(confirmModal.data.id);
        } else if (confirmModal.type === 'reset' && confirmModal.data?.id) {
            const newToken = generateToken();
            updateMutation.mutate({ id: confirmModal.data.id, token: newToken });
            setConfirmModal({ isOpen: false, type: null, data: null });
        } else if (confirmModal.type === 'bulk_delete') {
            handleBulkDeleteConfirm();
        }
    };

    const handleDelete = (id, name) => {
        setConfirmModal({
            isOpen: true,
            type: 'delete',
            data: { id, name }
        });
    };

    const handleResetToken = (id, staffName) => {
        setConfirmModal({
            isOpen: true,
            type: 'reset',
            data: { id, name: staffName }
        });
    };

    const handleResendInvite = (link) => {
        const inviteLink = `${window.location.origin}/acceptinvite?token=${link.token}`;
        setInviteLinkModal({
            isOpen: true,
            link: inviteLink,
            email: link.invite_email,
            name: link.staff_name
        });
    };

    const handleRetryRateLimit = () => {
        setRateLimitHit(false);
        queryClient.invalidateQueries({ queryKey: ['staffAccessLinks', partnerId] });
    };

    // Open edit modal with all needed data
    const openEditModal = (link) => {
        const hasEmail = !!link.invite_email;
        const isAccepted = !!link.invite_accepted_at;
        setEditModal({ 
            isOpen: true, 
            id: link.id, 
            name: link.staff_name, 
            role: link.staff_role,
            email: link.invite_email || '',
            hasEmail,
            isAccepted
        });
    };

    // #3: Bulk selection handlers
    const handleSelectToggle = (id) => {
        setSelectedIds(prev => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    };

    const handleBulkCancel = () => {
        setSelectedIds(new Set());
    };

    // BUG-SA-002: Filter bulk operations through permission checks
    const getPermittedBulkIds = () => {
        if (!links) return [];
        return links
            .filter(l => selectedIds.has(l.id) && canDeleteLink(l))
            .map(l => l.id);
    };

    const handleBulkEnable = async () => {
        const permittedIds = getPermittedBulkIds();
        if (permittedIds.length === 0) return;
        setBulkLoading(true);
        try {
            const promises = permittedIds.map(id =>
                base44.entities.StaffAccessLink.update(id, { is_active: true })
            );
            await Promise.all(promises);
            queryClient.invalidateQueries({ queryKey: ['staffAccessLinks', partnerId] });
            toast.success(t('partnerstaffaccess.bulk.enabled_success', { count: permittedIds.length }), { id: 'mm1' });
            setSelectedIds(new Set());
        } catch (err) {
            toast.error(t('toast.error'), { id: 'mm1' });
        } finally {
            setBulkLoading(false);
        }
    };

    const handleBulkDisable = async () => {
        const permittedIds = getPermittedBulkIds();
        if (permittedIds.length === 0) return;
        setBulkLoading(true);
        try {
            const promises = permittedIds.map(id =>
                base44.entities.StaffAccessLink.update(id, { is_active: false })
            );
            await Promise.all(promises);
            queryClient.invalidateQueries({ queryKey: ['staffAccessLinks', partnerId] });
            toast.success(t('partnerstaffaccess.bulk.disabled_success', { count: permittedIds.length }), { id: 'mm1' });
            setSelectedIds(new Set());
        } catch (err) {
            toast.error(t('toast.error'), { id: 'mm1' });
        } finally {
            setBulkLoading(false);
        }
    };

    const handleBulkDelete = () => {
        setConfirmModal({
            isOpen: true,
            type: 'bulk_delete',
            data: { count: getPermittedBulkIds().length, ids: Array.from(selectedIds) }
        });
    };

    const handleBulkDeleteConfirm = async () => {
        if (confirmModal.type !== 'bulk_delete') return;

        // BUG-SA-002: re-check permissions before deleting
        const permittedIds = (confirmModal.data.ids || []).filter(id => {
            const link = links?.find(l => l.id === id);
            return link && canDeleteLink(link);
        });
        if (permittedIds.length === 0) return;

        setBulkLoading(true);
        try {
            const promises = permittedIds.map(id =>
                base44.entities.StaffAccessLink.delete(id)
            );
            await Promise.all(promises);
            queryClient.invalidateQueries({ queryKey: ['staffAccessLinks', partnerId] });
            toast.success(t('partnerstaffaccess.bulk.deleted_success', { count: confirmModal.data.count }), { id: 'mm1' });
            setSelectedIds(new Set());
            setConfirmModal({ isOpen: false, type: null, data: null });
        } catch (err) {
            toast.error(t('toast.error'), { id: 'mm1' });
        } finally {
            setBulkLoading(false);
        }
    };

    // No partner access - should not happen if PartnerShell works correctly
    if (!partnerId) {
        return (
            <Card className="max-w-md mx-auto">
                <CardContent className="py-8 text-center">
                    <h1 className="text-xl font-bold text-slate-900 mb-2">{t('error.access_denied')}</h1>
                    <p className="text-slate-500">{t('partnerstaffaccess.error.partner_only')}</p>
                </CardContent>
            </Card>
        );
    }

    // Rate limit hit
    if (rateLimitHit) {
        return <RateLimitWarning onRetry={handleRetryRateLimit} t={t} />;
    }

    return (
        <>
            {/* Page header */}
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h2 className="text-xl font-bold text-slate-900">{t('partnerstaffaccess.title')}</h2>
                    {links && links.length > 0 && (
                        <p className="text-sm text-slate-500">
                            {t('partnerstaffaccess.filter.active')} ({counts.active})
                            {counts.pending > 0 && ` · ${t('partnerstaffaccess.filter.pending')} (${counts.pending})`}
                            {counts.disabled > 0 && ` · ${t('partnerstaffaccess.filter.disabled')} (${counts.disabled})`}
                        </p>
                    )}
                </div>
                {canInviteAnyone && (
                    <Button 
                        onClick={() => setIsCreateOpen(true)} 
                        size="sm"
                        className="bg-indigo-600 hover:bg-indigo-700"
                    >
                        <Plus className="w-4 h-4 sm:mr-1" aria-hidden="true" />
                        <span className="hidden sm:inline">{t('common.add')}</span>
                        <span className="sm:hidden">{t('common.add')}</span>
                    </Button>
                )}
            </div>

            {/* Search & Filter */}
            {showSearchFilter && (
                <SearchFilterBar
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    statusFilter={statusFilter}
                    onStatusFilterChange={setStatusFilter}
                    roleFilter={roleFilter}
                    onRoleFilterChange={setRoleFilter}
                    counts={counts}
                    t={t}
                />
            )}

            {/* Content */}
            {loadingLinks ? (
                <div className="space-y-3">
                    <StaffCardSkeleton />
                    <StaffCardSkeleton />
                    <StaffCardSkeleton />
                </div>
            ) : !links || links.length === 0 ? (
                <EmptyState onAdd={() => setIsCreateOpen(true)} t={t} />
            ) : filteredLinks.length === 0 ? (
                <Card>
                    <CardContent className="py-8 text-center">
                        <Search className="w-8 h-8 text-slate-300 mx-auto mb-2" aria-hidden="true" />
                        <p className="text-slate-500">{t('partnerstaffaccess.no_results')}</p>
                        <Button 
                            variant="link" 
                            onClick={() => { setSearchQuery(''); setStatusFilter(FILTER_STATUS.ALL); setRoleFilter('all'); }}
                            className="mt-2"
                        >
                            {t('partnerstaffaccess.clear_filters')}
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <>
                    {/* #3: Bulk Actions Toolbar */}
                    {selectionMode && (
                        <BulkActionsToolbar
                            selectedCount={selectedIds.size}
                            onEnable={handleBulkEnable}
                            onDisable={handleBulkDisable}
                            onDelete={handleBulkDelete}
                            onCancel={handleBulkCancel}
                            isLoading={bulkLoading}
                            t={t}
                        />
                    )}
                    
                    <div className="space-y-3">
                        {filteredLinks.map(link => (
                            <StaffCard
                                key={link.id}
                                link={link}
                                canDelete={canDeleteLink(link)}
                                onCopy={() => handleCopy(link.token)}
                                onQR={() => setQrModal({ isOpen: true, token: link.token, name: link.staff_name })}
                                onToggle={(active) => handleToggle(link.id, active)}
                                onDelete={() => handleDelete(link.id, link.staff_name)}
                                onEdit={() => openEditModal(link)}
                                onResetToken={() => handleResetToken(link.id, link.staff_name)}
                                onResendInvite={() => handleResendInvite(link)}
                                isUpdating={updatingId === link.id}
                                isSelected={selectedIds.has(link.id)}
                                onSelect={handleSelectToggle}
                                selectionMode={selectionMode}
                                t={t}
                                lang={lang}
                            />
                        ))}
                    </div>
                    
                    {/* Hint to select */}
                    {!selectionMode && filteredLinks.length > 3 && (
                        <p className="text-xs text-slate-400 text-center mt-4">
                            {t('partnerstaffaccess.bulk.hint')}
                        </p>
                    )}
                </>
            )}

            {/* Create Dialog */}
            <CreateStaffDialog
                isOpen={isCreateOpen}
                onClose={() => setIsCreateOpen(false)}
                onSubmit={(data) => createMutation.mutate(data)}
                isLoading={createMutation.isPending}
                existingLinks={links || []}
                canInviteRole={canInviteRole}
                t={t}
            />

            {/* QR Modal */}
            <QRCodeModal
                isOpen={qrModal.isOpen}
                onClose={() => setQrModal({ isOpen: false, token: null, name: null })}
                token={qrModal.token}
                staffName={qrModal.name}
                t={t}
            />

            {/* Edit Dialog */}
            <EditDialog
                isOpen={editModal.isOpen}
                onClose={() => setEditModal({ isOpen: false, id: null, name: null, role: null, email: null, hasEmail: false, isAccepted: false })}
                currentName={editModal.name}
                currentRole={editModal.role}
                currentEmail={editModal.email}
                hasEmail={editModal.hasEmail}
                isAccepted={editModal.isAccepted}
                onSubmit={handleEdit}
                isLoading={updateMutation.isPending && updatingId === editModal.id}
                t={t}
            />

            {/* Invite Link Modal */}
            <InviteLinkModal
                isOpen={inviteLinkModal.isOpen}
                onClose={() => setInviteLinkModal({ isOpen: false, link: null, email: null, name: null })}
                link={inviteLinkModal.link}
                email={inviteLinkModal.email}
                staffName={inviteLinkModal.name}
                t={t}
            />

            {/* Confirm Dialog */}
            <ConfirmDialog
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal({ isOpen: false, type: null, data: null })}
                onConfirm={handleDeleteConfirm}
                title={
                    confirmModal.type === 'delete' 
                        ? t('partnerstaffaccess.confirm.delete_title')
                        : confirmModal.type === 'bulk_delete'
                            ? t('partnerstaffaccess.bulk.delete_title')
                            : t('partnerstaffaccess.confirm.reset_title')
                }
                description={
                    confirmModal.type === 'delete'
                        ? t('partnerstaffaccess.confirm.delete', { name: confirmModal.data?.name })
                        : confirmModal.type === 'bulk_delete'
                            ? t('partnerstaffaccess.bulk.delete_confirm', { count: confirmModal.data?.count })
                            : t('partnerstaffaccess.confirm.reset_link', { name: confirmModal.data?.name })
                }
                confirmText={
                    confirmModal.type === 'delete' || confirmModal.type === 'bulk_delete'
                        ? t('common.delete')
                        : t('partnerstaffaccess.confirm.reset_button')
                }
                variant={confirmModal.type === 'delete' || confirmModal.type === 'bulk_delete' ? 'destructive' : 'default'}
                isLoading={deleteMutation.isPending || bulkLoading || (updateMutation.isPending && confirmModal.type === 'reset')}
                t={t}
            />
        </>
    );
}

// ============================================================
// EXPORT WRAPPER (PartnerShell provides context)
// ============================================================

export default function PartnerStaffAccess() {
    return (
        <PartnerShell activeTab="staff">
            <PartnerStaffAccessContent />
        </PartnerShell>
    );
}
