import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Loader2, CheckCircle, XCircle, AlertCircle, Mail, AlertTriangle, RefreshCcw } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useI18n } from "@/components/i18n";

// ============================================================
// HELPERS
// ============================================================

function isRateLimitError(error) {
  if (!error) return false;
  const msg = (error.message || error.toString() || "").toLowerCase();
  return msg.includes("rate limit") || msg.includes("429");
}

// LOCKED DM-027: Role mapping StaffAccessLink.staff_role → User.user_role
// Note: 'partner_manager' as staff_role = "старший официант" (senior staff)
// This is NOT the same as User.user_role='partner_manager' (управляющий)
function mapStaffRoleToUserRole(staffRole) {
    const mapping = {
        'director': 'partner_owner',
        'managing_director': 'partner_manager',
        'partner_manager': 'partner_staff',  // senior staff → staff page
        'partner_staff': 'partner_staff',
        'kitchen': 'kitchen'
    };
    return mapping[staffRole] || null;
}

// LOCKED DM-027: Roles with cabinet access
function hasCabinetAccess(staffRole) {
    return ['director', 'managing_director'].includes(staffRole);
}

// Retry helper with delay
async function retryAsync(fn, maxRetries = 2, delayMs = 500) {
    let lastError;
    for (let i = 0; i <= maxRetries; i++) {
        try {
            return await fn();
        } catch (err) {
            lastError = err;
            if (i < maxRetries) {
                await new Promise(resolve => setTimeout(resolve, delayMs));
            }
        }
    }
    throw lastError;
}

// ============================================================
// MAIN COMPONENT
// ============================================================

export default function AcceptInvitePage() {
    const { t } = useI18n();
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const [status, setStatus] = useState('loading');
    const [error, setError] = useState(null);
    const [linkData, setLinkData] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    const processingRef = useRef(false);
    const timeoutRef = useRef(null);

    // Get redirect URL based on role (LOCKED DM-027)
    function getRedirectUrl(link) {
        if (hasCabinetAccess(link.staff_role)) {
            return '/partnerhome';  // Cabinet access - no token needed
        }
        return `/staffordersmobile?token=${encodeURIComponent(token)}`;
    }

    function scheduleRedirect(url, delayMs) {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => {
            window.location.href = url;
        }, delayMs);
    }

    async function processInvite() {
        try {
            setStatus('loading');
            const links = await base44.entities.StaffAccessLink.filter({ token });

            if (!links || links.length === 0) {
                setStatus('invalid_token');
                return;
            }

            const link = links[0];
            setLinkData(link);

            if (!link.is_active) {
                setStatus('error');
                setError(t('acceptinvite.link_disabled'));
                return;
            }

            // ============================================================
            // BRANCH: No email required (link-only access)
            // ============================================================
            if (!link.invite_email) {
                // P0 SEC: No-email links with cabinet roles are rejected
                if (hasCabinetAccess(link.staff_role)) {
                    setStatus('error');
                    setError(t('acceptinvite.error.email_required_for_cabinet'));
                    return;
                }

                setStatus('no_email_required');
                scheduleRedirect(getRedirectUrl(link), 1500);
                return;
            }

            // ============================================================
            // Check auth (moved BEFORE already_accepted — SEC fix)
            // ============================================================
            setStatus('checking');
            const isAuthenticated = await base44.auth.isAuthenticated();

            if (!isAuthenticated) {
                const currentUrl = window.location.href;
                base44.auth.redirectToLogin(currentUrl);
                return;
            }

            const user = await base44.auth.me();
            setCurrentUser(user);

            // ============================================================
            // BRANCH: Already accepted (with user identity verification)
            // ============================================================
            if (link.invite_accepted_at) {
                if (link.invited_user && link.invited_user !== user.id) {
                    setStatus('email_mismatch');
                    return;
                }
                setStatus('already_accepted');
                scheduleRedirect(getRedirectUrl(link), 2000);
                return;
            }

            // ============================================================
            // Verify email match
            // ============================================================
            const userEmail = (user.email || '').toLowerCase().trim();
            const inviteEmail = (link.invite_email || '').toLowerCase().trim();

            if (userEmail !== inviteEmail) {
                setStatus('email_mismatch');
                return;
            }

            // ============================================================
            // Validate role mapping
            // ============================================================
            const userRole = mapStaffRoleToUserRole(link.staff_role);
            if (!userRole) {
                setStatus('error');
                setError(t('acceptinvite.error.invalid_role'));
                return;
            }

            // ============================================================
            // Accept invitation: updateMe FIRST, then mark link accepted
            // (prevents partial state if updateMe fails — link stays reusable)
            // ============================================================
            try {
                await retryAsync(async () => {
                    await base44.auth.updateMe({
                        user_role: userRole,
                        partner: link.partner
                    });
                }, 2, 500);
            } catch (updateErr) {
                setStatus('error');
                setError(t('acceptinvite.error.cabinet_setup_failed'));
                return;
            }

            try {
                await base44.entities.StaffAccessLink.update(link.id, {
                    invited_user: user.id,
                    invite_accepted_at: new Date().toISOString()
                });
            } catch (linkUpdateErr) {
                // updateMe already succeeded — user is onboarded.
                // Link stays re-usable but user can access their page.
            }

            // ============================================================
            // Success - redirect
            // ============================================================
            setStatus('success');
            scheduleRedirect(getRedirectUrl(link), 2000);

        } catch (err) {
            if (isRateLimitError(err)) {
                setStatus('rate_limit');
                return;
            }
            setStatus('error');
            setError(t('acceptinvite.error.generic'));
        }
    }

    useEffect(() => {
        if (!token) {
            setStatus('no_token');
            return;
        }
        if (processingRef.current) return;
        processingRef.current = true;
        processInvite().finally(() => { processingRef.current = false; });

        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, [token]);

    function handleRetry() {
        if (processingRef.current) return;
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        processingRef.current = true;
        setStatus('loading');
        processInvite().finally(() => { processingRef.current = false; });
    }

    function handleLogoutAndRetry() {
        base44.auth.logout();
        setTimeout(() => {
            window.location.reload();
        }, 500);
    }

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-md">
                <CardContent className="pt-6">

                    {/* Loading / Checking */}
                    {(status === 'loading' || status === 'checking') && (
                        <div className="text-center py-8">
                            <Loader2 className="w-12 h-12 animate-spin text-indigo-600 mx-auto mb-4" />
                            <p className="text-slate-600">
                                {status === 'loading'
                                    ? t('acceptinvite.loading')
                                    : t('acceptinvite.checking_auth')}
                            </p>
                        </div>
                    )}

                    {/* Success */}
                    {status === 'success' && (
                        <div className="text-center py-8">
                            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                            <h1 className="text-xl font-bold text-slate-900 mb-2">
                                {t('acceptinvite.success.title')}
                            </h1>
                            <p className="text-slate-600 mb-4">
                                {t('acceptinvite.success.message')}
                            </p>
                            <Loader2 className="w-5 h-5 animate-spin text-slate-400 mx-auto" />
                        </div>
                    )}

                    {/* Already Accepted */}
                    {status === 'already_accepted' && (
                        <div className="text-center py-8">
                            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                            <h1 className="text-xl font-bold text-slate-900 mb-2">
                                {t('acceptinvite.already_accepted.title')}
                            </h1>
                            <p className="text-slate-600 mb-4">
                                {t('acceptinvite.already_accepted.message')}
                            </p>
                            <Loader2 className="w-5 h-5 animate-spin text-slate-400 mx-auto" />
                        </div>
                    )}

                    {/* No Email Required */}
                    {status === 'no_email_required' && (
                        <div className="text-center py-8">
                            <CheckCircle className="w-16 h-16 text-blue-500 mx-auto mb-4" />
                            <h1 className="text-xl font-bold text-slate-900 mb-2">
                                {t('acceptinvite.no_email_required.title')}
                            </h1>
                            <p className="text-slate-600 mb-4">
                                {t('acceptinvite.no_email_required.message')}
                            </p>
                            <Loader2 className="w-5 h-5 animate-spin text-slate-400 mx-auto" />
                        </div>
                    )}

                    {/* No Token */}
                    {status === 'no_token' && (
                        <div className="text-center py-8">
                            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                            <h1 className="text-xl font-bold text-slate-900 mb-2">
                                {t('acceptinvite.no_token.title')}
                            </h1>
                            <p className="text-slate-600">
                                {t('acceptinvite.no_token.message')}
                            </p>
                        </div>
                    )}

                    {/* Invalid Token */}
                    {status === 'invalid_token' && (
                        <div className="text-center py-8">
                            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                            <h1 className="text-xl font-bold text-slate-900 mb-2">
                                {t('acceptinvite.invalid_token.title')}
                            </h1>
                            <p className="text-slate-600">
                                {t('acceptinvite.invalid_token.message')}
                            </p>
                        </div>
                    )}

                    {/* Email Mismatch */}
                    {status === 'email_mismatch' && (
                        <div className="text-center py-8">
                            <AlertCircle className="w-16 h-16 text-amber-500 mx-auto mb-4" />
                            <h1 className="text-xl font-bold text-slate-900 mb-2">
                                {t('acceptinvite.email_mismatch.title')}
                            </h1>
                            <p className="text-slate-600 mb-4">
                                {t('acceptinvite.email_mismatch.message', {
                                    currentEmail: currentUser?.email,
                                    inviteEmail: linkData?.invite_email
                                })}
                            </p>
                            <Button onClick={handleLogoutAndRetry} className="w-full">
                                <Mail className="w-4 h-4 mr-2" />
                                {t('acceptinvite.email_mismatch.button')}
                            </Button>
                        </div>
                    )}

                    {/* Rate Limit */}
                    {status === 'rate_limit' && (
                        <div className="text-center py-8">
                            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-amber-100 flex items-center justify-center">
                                <AlertTriangle className="w-8 h-8 text-amber-600" />
                            </div>
                            <h1 className="text-xl font-bold text-slate-900 mb-2">
                                {t('acceptinvite.rate_limit.title')}
                            </h1>
                            <p className="text-slate-600 mb-4">
                                {t('acceptinvite.rate_limit.message')}
                            </p>
                            <Button
                                onClick={handleRetry}
                                className="w-full bg-amber-600 hover:bg-amber-700"
                            >
                                <RefreshCcw className="w-4 h-4 mr-2" />
                                {t('common.retry')}
                            </Button>
                        </div>
                    )}

                    {/* Error */}
                    {status === 'error' && (
                        <div className="text-center py-8">
                            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                            <h1 className="text-xl font-bold text-slate-900 mb-2">
                                {t('acceptinvite.error.title')}
                            </h1>
                            <p className="text-slate-600 mb-4">
                                {error || t('acceptinvite.error.generic')}
                            </p>
                            <Button variant="outline" onClick={() => window.location.reload()}>
                                {t('common.retry')}
                            </Button>
                        </div>
                    )}

                </CardContent>
            </Card>
        </div>
    );
}
