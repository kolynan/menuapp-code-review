import React from "react";
import { Card, CardContent } from "@/components/ui/card";

/**
 * R6-2a T1 fix v3 (Codex App): table-code verification side effects.
 *
 * The visible code-entry UI remains in the PublicMenu caller/HallVerifyBlock.
 * This component intentionally renders no unverified UI, so CartView cannot show
 * a second code-entry surface while the upstream verification drawer is active.
 */
export default function TableCodeGateT1CodexApp03({
  isTableVerified,
  tableCodeInput,
  isVerifyingCode,
  verifyTableCode,
  codeVerificationError,
  hallGuestCodeEnabled,
  guestCode,
  t,
  partner,
  currentTable,
  setSubmitError,
  setSubmitPhase,
}) {
  const [codeAttempts, setCodeAttempts] = React.useState(0);
  const [codeLockedUntil, setCodeLockedUntil] = React.useState(null);
  const [nowTs, setNowTs] = React.useState(() => Date.now());

  const lastVerifyCodeRef = React.useRef(null);
  const countedErrorForCodeRef = React.useRef(null);
  const lastSentVerifyCodeRef = React.useRef(null);

  const tr = React.useCallback((key, fallback) => {
    if (typeof t !== "function") return fallback;
    const value = t(key, fallback);
    return typeof value === "string" && value.trim() ? value : fallback;
  }, [t]);

  const tableCodeLength = React.useMemo(() => {
    const n = Number(partner?.table_code_length);
    if (Number.isFinite(n) && n > 0) return Math.max(3, Math.min(8, Math.round(n)));
    return 4;
  }, [partner?.table_code_length]);

  const maxCodeAttempts = React.useMemo(() => {
    const n = Number(partner?.table_code_max_attempts);
    if (Number.isFinite(n) && n > 0) return Math.max(1, Math.min(10, Math.round(n)));
    return 3;
  }, [partner?.table_code_max_attempts]);

  const codeCooldownSeconds = React.useMemo(() => {
    const n = Number(partner?.table_code_cooldown_seconds);
    if (Number.isFinite(n) && n >= 0) return Math.max(0, Math.min(600, Math.round(n)));
    return 60;
  }, [partner?.table_code_cooldown_seconds]);

  const isCodeLocked = Boolean(codeLockedUntil && nowTs < codeLockedUntil);

  React.useEffect(() => {
    if (!isCodeLocked) return;
    if (typeof window === "undefined") return;
    const id = window.setInterval(() => setNowTs(Date.now()), 250);
    return () => window.clearInterval(id);
  }, [isCodeLocked]);

  React.useEffect(() => {
    if (!codeLockedUntil) return;
    if (nowTs < codeLockedUntil) return;
    setCodeLockedUntil(null);
    setCodeAttempts(0);
    lastSentVerifyCodeRef.current = null;
  }, [nowTs, codeLockedUntil]);

  React.useEffect(() => {
    if (isTableVerified !== true) return;
    setCodeAttempts(0);
    setCodeLockedUntil(null);
    // Also clear stale submit feedback after table verification succeeds.
    // Without this, a previous pre-verification send attempt can leave a red
    // retry state visible after the gate has already been satisfied.
    if (typeof setSubmitError === "function") setSubmitError(null);
    if (typeof setSubmitPhase === "function") setSubmitPhase("idle");
    const scrollable = document.querySelector('[data-radix-scroll-area-viewport], [role="dialog"]');
    if (scrollable) scrollable.scrollTop = 0;
  }, [isTableVerified, setSubmitError, setSubmitPhase]);

  React.useEffect(() => {
    if (!codeVerificationError) return;
    if (isVerifyingCode) return;
    const lastCode = lastVerifyCodeRef.current;
    if (!lastCode) return;
    if (countedErrorForCodeRef.current === lastCode) return;
    countedErrorForCodeRef.current = lastCode;
    lastSentVerifyCodeRef.current = null;

    setCodeAttempts((prev) => {
      const next = prev + 1;
      if (maxCodeAttempts > 0 && next >= maxCodeAttempts) {
        if (codeCooldownSeconds > 0) {
          setCodeLockedUntil(Date.now() + codeCooldownSeconds * 1000);
        }
        return maxCodeAttempts;
      }
      return next;
    });
  }, [codeVerificationError, isVerifyingCode, maxCodeAttempts, codeCooldownSeconds]);

  React.useEffect(() => {
    if (typeof verifyTableCode !== "function") return;
    if (isTableVerified === true) return;
    if (isCodeLocked) return;

    const safe = String(tableCodeInput || "").replace(/\D/g, "").slice(0, tableCodeLength);
    if (safe.length !== tableCodeLength) return;
    if (safe === String(lastSentVerifyCodeRef.current || "")) return;

    const id = setTimeout(() => {
      if (typeof verifyTableCode !== "function") return;
      if (isTableVerified === true) return;
      if (isVerifyingCode) return;
      if (codeLockedUntil && Date.now() < codeLockedUntil) return;

      const codeToVerify = String(safe);
      if (codeToVerify.length !== tableCodeLength) return;
      if (codeToVerify === String(lastSentVerifyCodeRef.current || "")) return;

      lastSentVerifyCodeRef.current = codeToVerify;
      lastVerifyCodeRef.current = codeToVerify;
      countedErrorForCodeRef.current = null;

      verifyTableCode(codeToVerify);
    }, 250);

    return () => clearTimeout(id);
  }, [
    tableCodeInput,
    tableCodeLength,
    verifyTableCode,
    isTableVerified,
    isVerifyingCode,
    isCodeLocked,
    codeLockedUntil,
  ]);

  if (!isTableVerified) return null;
  if (!currentTable && !hallGuestCodeEnabled) return null;

  return (
    <Card className="mb-4 border-emerald-100 bg-emerald-50">
      <CardContent className="px-3 py-2 text-sm text-emerald-700">
        {tr("cart.verify.table_verified", "Table confirmed")}
        {currentTable?.name || currentTable?.code ? ` - ${currentTable.name || currentTable.code}` : ""}
        {hallGuestCodeEnabled && guestCode ? ` - #${String(guestCode).replace(/^#/, "")}` : ""}
      </CardContent>
    </Card>
  );
}
