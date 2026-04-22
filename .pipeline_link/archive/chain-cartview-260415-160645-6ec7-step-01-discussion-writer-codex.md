---
chain: cartview-260415-160645-6ec7
chain_step: 1
chain_total: 1
chain_step_name: discussion-writer-codex
chain_group: writers
chain_group_size: 2
page: CartView
budget: 6.00
runner: codex
type: chain-step
---
**MANDATORY FIRST STEP — run this before anything else:**
```
git fetch origin 2>/dev/null; git reset --hard origin/main
```
This ensures your working copy is in sync with the remote repository.

---

You are the Codex Discussion Writer in a modular discussion pipeline.
Your job: independently analyze each question from the TASK CONTEXT and write your position.
You work in PARALLEL with a CC Discussion Writer — do NOT read CC findings.

SPEED RULES — this is a time-sensitive pipeline step (KB-142 guard):
- The full source file (if applicable) is INLINED below under === SOURCE CODE ===.
  Use that inline content as the authoritative source. Do NOT read the same file from disk.
- Do NOT run ripgrep, Get-ChildItem, Select-String, rg, cat, head, tail, or any other
  filesystem scan on the target page file. This burns your entire time budget on I/O
  and leaves you with no time for analysis (KB-142 pattern seen on files >2000 lines).
- Do NOT dump raw grep / ripgrep output as your answer. Those are not findings.
- You MAY read small auxiliary files explicitly named in the TASK CONTEXT (BUGS.md,
  README.md in the same page folder, UX docs) — but do so with narrow commands, not
  recursive scans.
- Be concise but thorough in your analysis.

INSTRUCTIONS:
1. Read the TASK CONTEXT below — it contains questions for discussion.
2. Use the inline SOURCE CODE block below as the source of truth (if provided).
3. If small auxiliary reference files are mentioned (BUGS.md, UX docs, screenshots) — read them for context with narrow commands.
4. For EACH question: write your analysis with a recommended answer and reasoning.
5. Focus on: mobile-first UX, restaurant app context, real-world user behavior, best practices.
6. When reviewing a code-review prompt (ПССК): verify line numbers against the inline source AND check whether each referenced line sits inside a block comment (`/* ... */`) or a commented-out JSX snapshot. Call out dead-code false positives explicitly.
7. Write your position to (ABSOLUTE PATH — required, see KB-139): C:/Users/ASUS/Dev/Menu AI Cowork/pipeline/chain-state/cartview-260415-160645-6ec7-codex-position.md
8. Do NOT read or reference any CC output.

FORMAT for position file:
# Codex Discussion Position — CartView
Chain: cartview-260415-160645-6ec7
Topic: [title from task]

## Questions Analyzed

### Q1: [question title]
**Recommendation:** [your recommended option]
**Reasoning:** [why this is the best approach]
**Trade-offs:** [what you sacrifice with this choice]
**Mobile UX:** [specific mobile considerations if relevant]

### Q2: [question title]
...

## Summary Table
| # | Question | Codex Recommendation | Confidence |
|---|----------|----------------------|------------|
| 1 | ...      | ...                  | high/medium/low |

## Prompt Clarity
Rate the task description quality (1-5). For any score below 4, explain what was unclear:
- Overall clarity: [1-5]
- Ambiguous questions (list # and what was unclear): ...
- Missing context (what info would have helped): ...

Do NOT apply any code changes.

=== SOURCE CODE (with line numbers) ===
File: 260330-02 CartView RELEASE.jsx (1164 lines)

    1: import React from "react";
    2: import { Loader2, ChevronDown, ChevronUp, Users, Gift, ShoppingBag, Bell, Minus, Plus } from "lucide-react";
    3: import { Card, CardContent } from "@/components/ui/card";
    4: import { Button } from "@/components/ui/button";
    5: import { Input } from "@/components/ui/input";
    6: import Rating from "@/components/Rating";
    7: 
    8: function lightenColor(hex, amount) {
    9:   const num = parseInt(hex.replace('#', ''), 16);
   10:   const r = Math.min(255, (num >> 16) + Math.round((255 - (num >> 16)) * amount));
   11:   const g = Math.min(255, ((num >> 8) & 0x00FF) + Math.round((255 - ((num >> 8) & 0x00FF)) * amount));
   12:   const b = Math.min(255, (num & 0x0000FF) + Math.round((255 - (num & 0x0000FF)) * amount));
   13:   return `#${(r << 16 | g << 8 | b).toString(16).padStart(6, '0')}`;
   14: }
   15: 
   16: export default function CartView({
   17:   partner,
   18:   currentTable,
   19:   currentGuest,
   20:   t,
   21:   setView,
   22:   isEditingName,
   23:   guestNameInput,
   24:   setGuestNameInput,
   25:   handleUpdateGuestName,
   26:   setIsEditingName,
   27:   getGuestDisplayName,
   28:   cart,
   29:   formatPrice,
   30:   updateQuantity,
   31:   sessionGuests,
   32:   splitType,
   33:   setSplitType,
   34:   showLoginPromptAfterRating,
   35:   customerEmail,
   36:   setCustomerEmail,
   37:   loyaltyLoading,
   38:   loyaltyAccount,
   39:   earnedPoints,
   40:   maxRedeemPoints,
   41:   redeemedPoints,
   42:   setRedeemedPoints,
   43:   toast,
   44:   cartTotalAmount,
   45:   discountAmount,
   46:   pointsDiscountAmount,
   47:   isSubmitting,
   48:   submitError,
   49:   setSubmitError,
   50:   handleSubmitOrder,
   51:   myOrders,
   52:   itemsByOrder,
   53:   getOrderStatus,
   54:   reviewedItems,
   55:   draftRatings,
   56:   updateDraftRating,
   57:   sessionItems,
   58:   sessionOrders,
   59:   myBill,
   60:   reviewableItems,
   61:   openReviewDialog,
   62:   setOtherGuestsExpanded,
   63:   otherGuestsExpanded,
   64:   getLinkId,
   65:   otherGuestsReviewableItems,
   66:   tableTotal,
   67:   formatOrderTime,
   68:   handleRateDish,
   69:   ratingSavingByItemId,
   70:   // TASK-260203-01 P0: Drawer props
   71:   onClose,
   72:   onCallWaiter,
   73:   isTableVerified,
   74:   tableCodeInput,
   75:   setTableCodeInput,
   76:   isVerifyingCode,
   77:   verifyTableCode,
   78:   codeVerificationError,
   79:   hallGuestCodeEnabled,
   80:   guestCode,
   81:   showLoyaltySection,
   82: }) {
   83:   const primaryColor = partner?.primary_color || '#1A1A1A';
   84: 
   85:   // ===== P0: Safe prop defaults (BUG-PM-023, BUG-PM-025) =====
   86:   const safeReviewedItems = reviewedItems || new Set();
   87:   const safeDraftRatings = draftRatings || {};
   88: 
   89:   // ===== P1 Expandable States =====
   90:   // CV-33: splitExpanded removed — split-order section removed
   91:   // loyaltyExpanded removed — loyalty section simplified to motivation text (#87 KS-1)
   92:   // CV-01/CV-09: Status-based bucket expand states (replaces old binary split)
   93:   const [expandedStatuses, setExpandedStatuses] = React.useState({
   94:     served: false, // Подано — collapsed by default (CV-10)
   95:     ready: true,
   96:     in_progress: true,
   97:     accepted: true,
   98:     new_order: true, // Отправлено
   99:   });
  100:   // CV-28: expandedOrders removed — flat dish list replaces per-order collapse
  101: 
  102:   // CV-32: Auto-collapse "Подано" when cart is non-empty (D1 state)
  103:   React.useEffect(() => {
  104:     if (cart.length > 0) {
  105:       setExpandedStatuses(prev => ({
  106:         ...prev,
  107:         served: false,
  108:         ready: false,
  109:         in_progress: false,
  110:         accepted: false,
  111:       }));
  112:     }
  113:   }, [cart.length > 0]);
  114:   const [showRewardEmailForm, setShowRewardEmailForm] = React.useState(false);
  115:   const [rewardEmail, setRewardEmail] = React.useState('');
  116:   const [rewardEmailSubmitting, setRewardEmailSubmitting] = React.useState(false);
  117:   const [emailError, setEmailError] = React.useState('');
  118:   // CV-05 v2: Rating mode state (view mode vs rating mode)
  119:   const [isRatingMode, setIsRatingMode] = React.useState(false);
  120:   // CV-38: Post-rating email bottom sheet
  121:   const [showPostRatingEmailSheet, setShowPostRatingEmailSheet] = React.useState(false);
  122: 
  123:   // ===== P0: Table-code verification UX (mask + auto-verify + cooldown) =====
  124:   const [infoModal, setInfoModal] = React.useState(null); // 'online' | 'tableCode' | null
  125:   const [codeAttempts, setCodeAttempts] = React.useState(0);
  126:   const [codeLockedUntil, setCodeLockedUntil] = React.useState(null); // timestamp ms
  127:   const [nowTs, setNowTs] = React.useState(() => Date.now());
  128: 
  129:   const codeInputRef = React.useRef(null);
  130:   const lastVerifyCodeRef = React.useRef(null);
  131:   const countedErrorForCodeRef = React.useRef(null);
  132:   const lastSentVerifyCodeRef = React.useRef(null);
  133:   const rewardTimerRef = React.useRef(null);
  134: 
  135:   // Cleanup reward-email timer on unmount (PM-S140-03)
  136:   React.useEffect(() => () => clearTimeout(rewardTimerRef.current), []);
  137: 
  138:   // Partner-configurable settings (fallbacks until Base44 adds real fields)
  139:   const tableCodeLength = React.useMemo(() => {
  140:     const n = Number(partner?.table_code_length);
  141:     if (Number.isFinite(n) && n > 0) return Math.max(3, Math.min(8, Math.round(n)));
  142:     return 4;
  143:   }, [partner?.table_code_length]);
  144: 
  145:   const maxCodeAttempts = React.useMemo(() => {
  146:     const n = Number(partner?.table_code_max_attempts);
  147:     if (Number.isFinite(n) && n > 0) return Math.max(1, Math.min(10, Math.round(n)));
  148:     return 3;
  149:   }, [partner?.table_code_max_attempts]);
  150: 
  151:   const codeCooldownSeconds = React.useMemo(() => {
  152:     const n = Number(partner?.table_code_cooldown_seconds);
  153:     if (Number.isFinite(n) && n >= 0) return Math.max(0, Math.min(600, Math.round(n)));
  154:     return 60;
  155:   }, [partner?.table_code_cooldown_seconds]);
  156: 
  157:   const isCodeLocked = Boolean(codeLockedUntil && nowTs < codeLockedUntil);
  158:   const codeSecondsLeft = isCodeLocked ? Math.max(0, Math.ceil((codeLockedUntil - nowTs) / 1000)) : 0;
  159: 
  160:   // Tick timer only while locked
  161:   React.useEffect(() => {
  162:     if (!isCodeLocked) return;
  163:     if (typeof window === "undefined") return;
  164:     const id = window.setInterval(() => setNowTs(Date.now()), 250);
  165:     return () => window.clearInterval(id);
  166:   }, [isCodeLocked]);
  167: 
  168:   // Auto-unlock when time passes
  169:   React.useEffect(() => {
  170:     if (!codeLockedUntil) return;
  171:     if (nowTs < codeLockedUntil) return;
  172:     setCodeLockedUntil(null);
  173:     setCodeAttempts(0);
  174:     // BUG-PM-029: Allow retrying same code after cooldown expires
  175:     lastSentVerifyCodeRef.current = null;
  176:   }, [nowTs, codeLockedUntil]);
  177: 
  178:   // Reset attempts on successful verification + scroll to top
  179:   React.useEffect(() => {
  180:     if (isTableVerified === true) {
  181:       setCodeAttempts(0);
  182:       setCodeLockedUntil(null);
  183:       // Scroll drawer back to top after successful verification
  184:       const scrollable = document.querySelector('[data-radix-scroll-area-viewport], [role="dialog"]');
  185:       if (scrollable) scrollable.scrollTop = 0;
  186:     }
  187:   }, [isTableVerified]);
  188: 
  189:   // Count failed attempts (UI-level), and apply cooldown after max attempts.
  190:   React.useEffect(() => {
  191:     if (!codeVerificationError) return;
  192:     if (isVerifyingCode) return;
  193:     const lastCode = lastVerifyCodeRef.current;
  194:     if (!lastCode) return;
  195: 
  196:     // Count once per verified code
  197:     if (countedErrorForCodeRef.current === lastCode) return;
  198:     countedErrorForCodeRef.current = lastCode;
  199: 
  200:     // BUG-PM-029: Clear lastSentVerifyCodeRef so same code can be retried after failure
  201:     lastSentVerifyCodeRef.current = null;
  202: 
  203:     setCodeAttempts((prev) => {
  204:       const next = prev + 1;
  205:       if (maxCodeAttempts > 0 && next >= maxCodeAttempts) {
  206:         if (codeCooldownSeconds > 0) {
  207:           setCodeLockedUntil(Date.now() + codeCooldownSeconds * 1000);
  208:         }
  209:         return maxCodeAttempts;
  210:       }
  211:       return next;
  212:     });
  213:   }, [codeVerificationError, isVerifyingCode, maxCodeAttempts, codeCooldownSeconds]);
  214: 
  215:   // Auto-verify when code is fully entered (debounced)
  216:   React.useEffect(() => {
  217:     if (typeof verifyTableCode !== "function") return;
  218:     if (isTableVerified === true) return;
  219:     if (isCodeLocked) return;
  220: 
  221:     const safe = String(tableCodeInput || "").replace(/\D/g, "").slice(0, tableCodeLength);
  222:     if (safe.length !== tableCodeLength) return;
  223:     if (safe === String(lastSentVerifyCodeRef.current || "")) return;
  224: 
  225:     const id = setTimeout(() => {
  226:       if (typeof verifyTableCode !== "function") return;
  227:       if (isTableVerified === true) return;
  228:       if (isVerifyingCode) return;
  229:       if (codeLockedUntil && Date.now() < codeLockedUntil) return;
  230: 
  231:       const codeToVerify = String(safe);
  232:       if (codeToVerify.length !== tableCodeLength) return;
  233:       if (codeToVerify === String(lastSentVerifyCodeRef.current || "")) return;
  234: 
  235:       lastSentVerifyCodeRef.current = codeToVerify;
  236:       lastVerifyCodeRef.current = codeToVerify;
  237:       countedErrorForCodeRef.current = null;
  238: 
  239:       verifyTableCode(codeToVerify);
  240:     }, 250);
  241: 
  242:     return () => clearTimeout(id);
  243:   }, [
  244:     tableCodeInput,
  245:     tableCodeLength,
  246:     verifyTableCode,
  247:     isTableVerified,
  248:     isVerifyingCode,
  249:     isCodeLocked,
  250:     codeLockedUntil,
  251:   ]);
  252: 
  253: 
  254:   // ===== P0 UX helpers =====
  255: 
  256:   // Safe translation with fallback
  257:   const tr = (key, fallback) => {
  258:     const val = typeof t === "function" ? t(key) : "";
  259:     if (!val || typeof val !== "string") return fallback;
  260:     const norm = val.trim();
  261:     if (norm === key || norm.startsWith(key + ":")) return fallback;
  262:     return norm;
  263:   };
  264: 
  265:   // Translation with params
  266:   const trFormat = (key, params, fallback) => {
  267:     const val = typeof t === "function" ? t(key, params) : "";
  268:     if (!val || typeof val !== "string") return fallback;
  269:     const norm = val.trim();
  270:     if (norm === key || norm.startsWith(key)) return fallback;
  271:     return norm;
  272:   };
  273: 
  274:   // Safe status label - guest-facing (CV-08: 5 statuses)
  275:   const getSafeStatus = (status) => {
  276:     if (!status) {
  277:       return { icon: '🔵', label: tr('status.sent', 'Отправлено'), color: '#6B7280' };
  278:     }
  279: 
  280:     let label = status.label || '';
  281: 
  282:     // Check if label is a raw translation key (contains dots and looks like a key)
  283:     if (label.includes('.') && (label.startsWith('orderprocess') || label.startsWith('status'))) {
  284:       const parts = label.split('.');
  285:       const code = parts[parts.length - 1];
  286: 
  287:       const fallbacks = {
  288:         'new': tr('status.sent', 'Отправлено'),
  289:         'start': tr('status.cooking', 'Готовится'),
  290:         'cook': tr('status.cooking', 'Готовится'),
  291:         'cooking': tr('status.cooking', 'Готовится'),
  292:         'finish': tr('status.ready', 'Готов'),
  293:         'ready': tr('status.ready', 'Готов'),
  294:         'done': tr('status.served', 'Подано'),
  295:         'accepted': tr('status.accepted', 'Принят'),
  296:         'served': tr('status.served', 'Подано'),
  297:         'completed': tr('status.served', 'Подано'),
  298:         'cancel': tr('status.cancelled', 'Отменён'),
  299:         'cancelled': tr('status.cancelled', 'Отменён'),
  300:       };
  301: 
  302:       label = fallbacks[code] || tr('status.sent', 'Отправлено');
  303:     }
  304: 
  305:     return {
  306:       icon: status.icon || '🔵',
  307:       label: label,
  308:       color: status.color || '#6B7280'
  309:     };
  310:   };
  311: 
  312:   // Guest code from localStorage (e.g., "#6475")
  313:   const guestCodeFromStorage = React.useMemo(() => {
  314:     if (typeof window === "undefined") return null;
  315:     try {
  316:       const raw = window.localStorage.getItem("menu_guest_code");
  317:       return raw ? String(raw).trim() : null;
  318:     } catch {
  319:       return null;
  320:     }
  321:   }, []);
  322: 
  323:   // Effective guest code: prop takes priority, fallback to localStorage (only if hall guest codes enabled)
  324:   const effectiveGuestCode = guestCode || (hallGuestCodeEnabled ? guestCodeFromStorage : null);
  325: 
  326:   // Guest display: "Имя #6475" or "Гость #6475"
  327:   // PM-153: Use guestNameInput (from localStorage) as fallback when DB name is empty
  328:   const guestBaseName = currentGuest
  329:     ? (currentGuest.name || guestNameInput || getGuestDisplayName(currentGuest))
  330:     : (guestNameInput || tr("cart.guest", "Гость"));
  331: 
  332:   const guestDisplay = guestBaseName;
  333: 
  334:   // Table label: avoid "Стол Стол 3"
  335:   const tablePrefix = tr("form.table", "Стол");
  336:   const rawTableLabel = currentTable?.name || currentTable?.code || "—";
  337:   const tableLabel = React.useMemo(() => {
  338:     if (typeof rawTableLabel !== "string" || typeof tablePrefix !== "string") {
  339:       return `${tablePrefix} ${rawTableLabel}`;
  340:     }
  341:     if (rawTableLabel.trim().toLowerCase().startsWith(tablePrefix.trim().toLowerCase())) {
  342:       return rawTableLabel;
  343:     }
  344:     return `${tablePrefix} ${rawTableLabel}`;
  345:   }, [rawTableLabel, tablePrefix]);
  346: 
  347:   // Cart grand total (after discounts)
  348:   const cartGrandTotal = Math.max(
  349:     0,
  350:     (Number(cartTotalAmount) || 0) - (Number(discountAmount) || 0) - (Number(pointsDiscountAmount) || 0)
  351:   );
  352: 
  353:   // ===== Guest count (stable, from orders OR guests) =====
  354:   const guestCountFromOrders = React.useMemo(() => {
  355:     try {
  356:       const ids = new Set(
  357:         (sessionOrders || [])
  358:           .map(o => (getLinkId ? getLinkId(o.guest) : o.guest))
  359:           .filter(Boolean)
  360:           .map(x => String(x))
  361:       );
  362:       return ids.size;
  363:     } catch {
  364:       return 0;
  365:     }
  366:   }, [sessionOrders, getLinkId]);
  367: 
  368:   const guestCount = Math.max(
  369:     Array.isArray(sessionGuests) ? sessionGuests.length : 0,
  370:     guestCountFromOrders,
  371:     1
  372:   );
  373:   const canSplit = guestCount > 1;
  374: 
  375:   // ===== PM-142/143/154: Filter myOrders to 06:00 business-day + sort by datetime =====
  376:   const todayMyOrders = React.useMemo(() => {
  377:     const now = new Date();
  378:     const isBeforeSixAM = now.getHours() < 6;
  379:     // Business-day cutoff: before 06:00 → yesterday's shift still active
  380:     const cutoffDate = new Date(now);
  381:     if (isBeforeSixAM) cutoffDate.setDate(cutoffDate.getDate() - 1);
  382:     const cutoffDay = new Date(cutoffDate.getFullYear(), cutoffDate.getMonth(), cutoffDate.getDate());
  383: 
  384:     return (myOrders || [])
  385:       .filter(o => {
  386:         const d = o.created_at || o.created_date || o.createdAt;
  387:         if (!d) return true;
  388:         const orderDate = new Date(d);
  389:         // Compare calendar dates in LOCAL timezone (avoids UTC-offset bugs with date-only strings)
  390:         const orderDay = new Date(orderDate.getFullYear(), orderDate.getMonth(), orderDate.getDate());
  391:         return orderDay >= cutoffDay;
  392:       })
  393:       .filter(o => o.status !== 'cancelled')
  394:       .sort((a, b) => {
  395:         const da = new Date(a.created_at || a.created_date || a.createdAt || 0);
  396:         const db = new Date(b.created_at || b.created_date || b.createdAt || 0);
  397:         return db - da;
  398:       });
  399:   }, [myOrders]);
  400: 
  401:   // ===== CV-01/CV-09: Status-based buckets (replaces binary Выдано/Заказано split) =====
  402:   const statusBuckets = React.useMemo(() => {
  403:     const buckets = { served: [], ready: [], in_progress: [], accepted: [], new_order: [] };
  404:     todayMyOrders.forEach(o => {
  405:       const s = o.status;
  406:       if (s === 'served' || s === 'completed') buckets.served.push(o);
  407:       else if (s === 'ready') buckets.ready.push(o);
  408:       else if (s === 'in_progress') buckets.in_progress.push(o);
  409:       else if (s === 'accepted') buckets.accepted.push(o);
  410:       else if (s === 'new') buckets.new_order.push(o);
  411:       // cancelled: already filtered out
  412:     });
  413:     return buckets;
  414:   }, [todayMyOrders]);
  415: 
  416:   // ===== CV-02: Orders sum for drawer header (replaces ИТОГО ЗА ВИЗИТ) =====
  417:   const ordersSum = React.useMemo(() => {
  418:     const sum = todayMyOrders.reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0);
  419:     return parseFloat(sum.toFixed(2));
  420:   }, [todayMyOrders]);
  421: 
  422:   // ===== Table Orders from sessionOrders =====
  423:   const ordersByGuestId = React.useMemo(() => {
  424:     const map = new Map();
  425:     (sessionOrders || []).forEach((o) => {
  426:       const gid = getLinkId ? getLinkId(o.guest) : o.guest;
  427:       if (!gid) return;
  428:       const k = String(gid);
  429:       if (!map.has(k)) map.set(k, []);
  430:       map.get(k).push(o);
  431:     });
  432:     return map;
  433:   }, [sessionOrders, getLinkId]);
  434: 
  435:   const myGuestId = currentGuest?.id ? String(currentGuest.id) : null;
  436: 
  437:   const otherGuestIdsFromOrders = React.useMemo(() => {
  438:     return Array.from(ordersByGuestId.keys()).filter((gid) => !myGuestId || gid !== myGuestId);
  439:   }, [ordersByGuestId, myGuestId]);
  440: 
  441:   const tableOrdersTotal = React.useMemo(() => {
  442:     let sum = 0;
  443:     otherGuestIdsFromOrders.forEach((gid) => {
  444:       const orders = ordersByGuestId.get(gid) || [];
  445:       orders.forEach((o) => {
  446:         sum += Number(o.total_amount) || 0;
  447:       });
  448:     });
  449:     return sum;
  450:   }, [ordersByGuestId, otherGuestIdsFromOrders]);
  451: 
  452:   const getGuestLabelById = (guestId) => {
  453:     const gid = String(guestId);
  454:     const found = (sessionGuests || []).find((g) => String(g.id) === gid);
  455:     if (found) return getGuestDisplayName(found);
  456:     const suffix = gid.length >= 4 ? gid.slice(-4) : gid;
  457:     return `${tr("cart.guest", "Гость")} ${suffix}`;
  458:   };
  459: 
  460:   const showTableOrdersSection = otherGuestIdsFromOrders.length > 0;
  461: 
  462:   // ===== Review Reward Flow (P1) =====
  463:   const reviewRewardPoints = Number(partner?.loyalty_review_points || 0);
  464:   const isReviewRewardActive = Number.isFinite(reviewRewardPoints) && reviewRewardPoints > 0;
  465: 
  466:   // Звёзды показываем если: show_dish_reviews ИЛИ есть награда за отзыв
  467:   const reviewsEnabled = Boolean(partner?.show_dish_reviews || isReviewRewardActive);
  468: 
  469:   // Есть ли хоть одна оценка (draft или сохранённая)
  470:   const hasAnyRating = React.useMemo(() => {
  471:     const reviewedCount = safeReviewedItems.size ? Number(safeReviewedItems.size) : 0;
  472:     const draftCount = safeDraftRatings ? Object.values(safeDraftRatings).filter(v => Number(v) > 0).length : 0;
  473:     return reviewedCount > 0 || draftCount > 0;
  474:   }, [reviewedItems, draftRatings]);
  475: 
  476:   // Гость идентифицирован?
  477:   const isCustomerIdentified = Boolean(
  478:     loyaltyAccount?.id || loyaltyAccount?._id || loyaltyAccount?.email || (customerEmail && String(customerEmail).trim())
  479:   );
  480: 
  481:   // Показывать hint "За отзыв +N бонусов" только если есть блюда для оценки (BUG-PM-030)
  482:   const shouldShowReviewRewardHint = isReviewRewardActive && (reviewableItems?.length > 0);
  483: 
  484:   // Показывать nudge "Введите email" после первой оценки
  485:   const shouldShowReviewRewardNudge = isReviewRewardActive && hasAnyRating && !isCustomerIdentified;
  486: 
  487:   // CV-33: splitSummary removed — split-order section removed
  488: 
  489:   // loyaltySummary + reviewRewardLabel removed — loyalty section simplified (#87 KS-1)
  490: 
  491:   // ===== CV-01: Bucket display names =====
  492:   const bucketDisplayNames = {
  493:     served: 'Подано',
  494:     ready: 'Готов',
  495:     in_progress: 'Готовится',
  496:     accepted: 'Принят',
  497:     new_order: 'Отправлено',
  498:   };
  499: 
  500: 
  501:   // CV-04: Check if all items in served bucket are rated
  502:   const allServedRated = React.useMemo(() => {
  503:     if (statusBuckets.served.length === 0) return false;
  504:     return statusBuckets.served.every(order => {
  505:       const orderItems = itemsByOrder.get(order.id) || [];
  506:       if (orderItems.length === 0) return true;
  507:       return orderItems.every((item, idx) => {
  508:         const itemId = item.id || `${order.id}_${idx}`;
  509:         return safeReviewedItems.has(itemId) || (safeDraftRatings[itemId] || 0) > 0;
  510:       });
  511:     });
  512:   }, [statusBuckets.served, itemsByOrder, safeReviewedItems, safeDraftRatings]);
  513: 
  514:   // CV-05 v2: Auto-exit rating mode when all served items are rated
  515:   React.useEffect(() => {
  516:     if (allServedRated) setIsRatingMode(false);
  517:   }, [allServedRated]);
  518: 
  519:   // CV-36: Count of unrated served items (for chip counter)
  520:   const unratedServedCount = React.useMemo(() => {
  521:     let count = 0;
  522:     statusBuckets.served.forEach(order => {
  523:       const orderItems = itemsByOrder.get(order.id) || [];
  524:       orderItems.forEach((item, idx) => {
  525:         const itemId = item.id || `${order.id}_${idx}`;
  526:         if (!safeReviewedItems.has(itemId) && !(safeDraftRatings[itemId] > 0)) count++;
  527:       });
  528:     });
  529:     return count;
  530:   }, [statusBuckets.served, itemsByOrder, safeReviewedItems, safeDraftRatings]);
  531: 
  532:   // CV-38: Count of rated served items (for email sheet)
  533:   const ratedServedCount = React.useMemo(() => {
  534:     let count = 0;
  535:     statusBuckets.served.forEach(order => {
  536:       const orderItems = itemsByOrder.get(order.id) || [];
  537:       orderItems.forEach((item, idx) => {
  538:         const itemId = item.id || `${order.id}_${idx}`;
  539:         if (safeReviewedItems.has(itemId) || (safeDraftRatings[itemId] > 0)) count++;
  540:       });
  541:     });
  542:     return count;
  543:   }, [statusBuckets.served, itemsByOrder, safeReviewedItems, safeDraftRatings]);
  544: 
  545:   // CV-28: getOrderSummary/getOrderTime removed — flat dish list replaces per-order collapse
  546: 
  547:   // ===== CV-28: Render flat dish list for a status bucket (grouped by dish name) =====
  548:   const renderBucketOrders = (orders, showRating) => {
  549:     // Collect ALL items from ALL orders in this bucket
  550:     const allItems = [];
  551:     orders.forEach(order => {
  552:       const orderItems = itemsByOrder.get(order.id) || [];
  553:       orderItems.forEach((item, idx) => {
  554:         allItems.push({
  555:           ...item,
  556:           itemId: item.id || `${order.id}_${idx}`,
  557:           orderId: order.id,
  558:         });
  559:       });
  560:     });
  561: 
  562:     // Group by dish_name for display
  563:     const grouped = new Map();
  564:     allItems.forEach(item => {
  565:       const name = item.dish_name || 'Unknown';
  566:       if (!grouped.has(name)) {
  567:         grouped.set(name, { name, totalQty: 0, totalPrice: 0, items: [] });
  568:       }
  569:       const g = grouped.get(name);
  570:       g.totalQty += (item.quantity || 1);
  571:       g.totalPrice += (item.line_total ?? (item.dish_price * (item.quantity || 1)));
  572:       g.items.push(item);
  573:     });
  574: 
  575:     const groups = Array.from(grouped.values());
  576: 
  577:     return (
  578:       <div className="space-y-1 mt-1">
  579:         {groups.map(g => (
  580:           <div key={g.name}>
  581:             <div className="flex justify-between items-center text-sm py-1">
  582:               <span className="text-slate-700">
  583:                 {g.name}{g.totalQty > 1 ? ` ×${g.totalQty}` : ''}
  584:               </span>
  585:               <div className="flex items-center gap-2">
  586:                 <span className="text-slate-600">{formatPrice(parseFloat(g.totalPrice.toFixed(2)))}</span>
  587:                 {/* CV-05 v2 view mode: rating text indicators (no star widgets) */}
  588:                 {showRating && reviewsEnabled && !isRatingMode && (() => {
  589:                   const anyRated = g.items.some(i => safeReviewedItems.has(i.itemId) || (safeDraftRatings[i.itemId] || 0) > 0);
  590:                   if (anyRated) {
  591:                     const bestRating = Math.max(...g.items.map(i => safeDraftRatings[i.itemId] || 0));
  592:                     return <span className="text-xs text-amber-500">⭐{bestRating}</span>;
  593:                   }
  594:                   return <span className="text-xs text-slate-400">{tr('review.rate_action', 'Оценить')}</span>;
  595:                 })()}
  596:               </div>
  597:             </div>
  598:             {/* CV-04/CV-05 v2: Per-item ratings — view mode vs rating mode */}
  599:             {showRating && reviewsEnabled && g.items.map((item, itemIdx) => {
  600:               const hasReview = safeReviewedItems.has(item.itemId);
  601:               const draftRating = safeDraftRatings[item.itemId] || 0;
  602:               const isRated = hasReview || draftRating > 0;
  603:               const isFirstUnrated = !isRated && itemIdx === g.items.findIndex(i => {
  604:                 const dr = safeDraftRatings[i.itemId] || 0;
  605:                 return !safeReviewedItems.has(i.itemId) && !(dr > 0);
  606:               });
  607: 
  608:               if (!isRatingMode) {
  609:                 // View mode: show text indicators inline, no star widgets
  610:                 return null; // Rating text is shown inline in the dish row above
  611:               }
  612: 
  613:               // Rating mode: show star widgets
  614:               return (
  615:                 <div
  616:                   key={item.itemId}
  617:                   className="flex items-center gap-2 pl-2 min-h-[44px]"
  618:                   {...(isFirstUnrated ? {'data-first-unrated': true} : {})}
  619:                 >
  620:                   <Rating
  621:                     value={draftRating}
  622:                     onChange={(val) => {
  623:                       if (ratingSavingByItemId?.[item.itemId] === true) return;
  624:                       updateDraftRating(item.itemId, val);
  625:                       if (val > 0 && handleRateDish) {
  626:                         const dishId = typeof item.dish === 'object' ? item.dish?.id : item.dish;
  627:                         handleRateDish({
  628:                           itemId: item.itemId,
  629:                           dishId,
  630:                           orderId: item.orderId,
  631:                           rating: val,
  632:                         });
  633:                       }
  634:                     }}
  635:                     size="md"
  636:                     readonly={ratingSavingByItemId?.[item.itemId] === true}
  637:                   />
  638:                   {ratingSavingByItemId?.[item.itemId] === true && (
  639:                     <span className="text-xs text-slate-400 flex items-center gap-1">
  640:                       <Loader2 className="w-3 h-3 animate-spin" />
  641:                       {tr('review.saving', 'Сохраняем...')}
  642:                     </span>
  643:                   )}
  644:                   {isRated && ratingSavingByItemId?.[item.itemId] !== true && (
  645:                     <span className="text-xs text-green-600">✓ {tr('review.saved', 'Сохранено')}</span>
  646:                   )}
  647:                   {ratingSavingByItemId?.[item.itemId] === 'error' && (
  648:                     <span className="text-xs text-red-500">{tr('review.save_error', 'Ошибка. Повторить')}</span>
  649:                   )}
  650:                 </div>
  651:               );
  652:             })}
  653:           </div>
  654:         ))}
  655:         {groups.length === 0 && orders.length > 0 && (
  656:           <div className="text-sm text-slate-500 py-1">
  657:             {tr('cart.order_total', 'Сумма заказа')}: {formatPrice(parseFloat(orders.reduce((s, o) => s + (Number(o.total_amount) || 0), 0).toFixed(2)))}
  658:           </div>
  659:         )}
  660:       </div>
  661:     );
  662:   };
  663: 
  664:   return (
  665:     <div className="max-w-2xl mx-auto px-4 mt-2 pb-4">
  666:       {/* P0 Header: [🔔] Стол · Гость · [˅] — #140: chevron moved into table card, not sticky */}
  667:       <div className="bg-white rounded-lg shadow-sm border px-3 py-2 mb-4 mt-2">
  668:         <div className="flex items-center justify-between">
  669:           {/* Left: Call waiter */}
  670:           {onCallWaiter && (
  671:             <button
  672:               onClick={onCallWaiter}
  673:               className="min-w-[44px] min-h-[44px] p-2 rounded-full bg-amber-50 text-amber-600 hover:bg-amber-100 flex items-center justify-center"
  674:               aria-label={tr('help.call_waiter', 'Позвать официанта')}
  675:             >
  676:               <Bell className="w-5 h-5" />
  677:             </button>
  678:           )}
  679: 
  680:           {/* Center: Table & Guest on one line (CV-31) + orders sum */}
  681:           <div className="text-center flex-1 mx-2">
  682:             <div className="flex items-center justify-center gap-1 text-sm">
  683:               <span className="font-medium text-slate-700">{tableLabel}</span>
  684:               <span className="text-slate-400">·</span>
  685:               {isEditingName ? (
  686:                 <span className="inline-flex items-center gap-1">
  687:                   <input
  688:                     type="text"
  689:                     value={guestNameInput}
  690:                     onChange={(e) => setGuestNameInput(e.target.value)}
  691:                     placeholder={tr('guest.name_placeholder', 'Имя')}
  692:                     className="w-20 px-1 py-0.5 text-xs border rounded"
  693:                     autoFocus
  694:                     onKeyDown={(e) => {
  695:                       if (e.key === 'Enter' && guestNameInput.trim()) handleUpdateGuestName();
  696:                       if (e.key === 'Escape') { setIsEditingName(false); setGuestNameInput(''); }
  697:                     }}
  698:                   />
  699:                   <button onClick={handleUpdateGuestName} disabled={!guestNameInput.trim()} className="text-green-600 min-w-[44px] min-h-[44px] flex items-center justify-center" aria-label={tr('common.save', 'Сохранить')}>✓</button>
  700:                   <button onClick={() => { setIsEditingName(false); setGuestNameInput(''); }} className="text-slate-400 min-w-[44px] min-h-[44px] flex items-center justify-center" aria-label={tr('common.cancel', 'Отмена')}>✕</button>
  701:                 </span>
  702:               ) : (
  703:                 <button
  704:                   onClick={() => { setGuestNameInput(currentGuest?.name || ''); setIsEditingName(true); }}
  705:                   className="min-h-[32px] flex items-center hover:underline"
  706:                   style={{color: primaryColor}}
  707:                 >
  708:                   {guestDisplay} <span className="text-xs ml-0.5">›</span>
  709:                 </button>
  710:               )}
  711:             </div>
  712:             {/* CV-30: Order count + sum in drawer header */}
  713:             {ordersSum > 0 && (() => {
  714:               const cnt = todayMyOrders.length;
  715:               const plural = cnt === 1 ? tr('cart.order_one', 'заказ')
  716:                 : (cnt >= 2 && cnt <= 4) ? tr('cart.order_few', 'заказа')
  717:                 : tr('cart.order_many', 'заказов');
  718:               return (
  719:                 <div className="text-xs text-slate-500 mt-0.5">
  720:                   {cnt} {plural} · {formatPrice(ordersSum)}
  721:                 </div>
  722:               );
  723:             })()}
  724:           </div>
  725: 
  726:           {/* Right: Chevron close — #140 moved from sticky row into table card */}
  727:           <button
  728:             className="min-w-[44px] min-h-[44px] flex items-center justify-center"
  729:             onClick={() => { if (isSubmitting) return; onClose ? onClose() : setView("menu"); }}
  730:             aria-label="Close cart"
  731:           >
  732:             <ChevronDown
  733:               className={`w-7 h-7 ${isSubmitting ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500'}`}
  734:             />
  735:           </button>
  736:         </div>
  737:       </div>
  738: 
  739:       {/* SECTION 5: TABLE ORDERS (other guests) - STABLE based on sessionOrders */}
  740:       {showTableOrdersSection && (
  741:         <Card className="mb-4">
  742:           <CardContent className="p-4">
  743:             <button
  744:               onClick={() => setOtherGuestsExpanded(!otherGuestsExpanded)}
  745:               className="w-full flex items-center justify-between text-left"
  746:             >
  747:               <div className="flex items-center gap-2">
  748:                 <Users className="w-4 h-4 text-slate-500" />
  749:                 <span className="text-sm font-semibold text-slate-600">
  750:                   {tr('cart.table_orders', 'Заказы стола')} ({otherGuestIdsFromOrders.length})
  751:                 </span>
  752:               </div>
  753:               <div className="flex items-center gap-2">
  754:                 {sessionItems.length === 0 && sessionOrders.length > 0 ? (
  755:                   <span className="text-sm text-slate-400">{tr('common.loading', 'Загрузка')}</span>
  756:                 ) : (
  757:                   <span className="font-bold text-slate-700">{formatPrice(tableOrdersTotal)}</span>
  758:                 )}
  759:                 {otherGuestsExpanded ? (
  760:                   <ChevronUp className="w-4 h-4 text-slate-400" />
  761:                 ) : (
  762:                   <ChevronDown className="w-4 h-4 text-slate-400" />
  763:                 )}
  764:               </div>
  765:             </button>
  766: 
  767:             {otherGuestsExpanded && (
  768:               <div className="mt-4 pt-4 border-t space-y-4">
  769:                 {otherGuestIdsFromOrders.map((gid) => {
  770:                   const guestOrders = ordersByGuestId.get(gid) || [];
  771:                   const guestTotal = guestOrders.reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0);
  772: 
  773:                   return (
  774:                     <div key={gid} className="text-sm">
  775:                       <div className="flex items-center justify-between mb-2">
  776:                         <span className="font-medium text-slate-700">{getGuestLabelById(gid)}</span>
  777:                         {sessionItems.length === 0 && sessionOrders.length > 0 ? (
  778:                           <span className="text-slate-400">{tr('common.loading', 'Загрузка')}</span>
  779:                         ) : (
  780:                           <span className="font-bold text-slate-600">{formatPrice(guestTotal)}</span>
  781:                         )}
  782:                       </div>
  783: 
  784:                       {guestOrders.length > 0 ? (
  785:                         <div className="pl-2 border-l-2 border-slate-200 space-y-1">
  786:                           {guestOrders.map((order) => {
  787:                             const items = itemsByOrder.get(order.id) || [];
  788:                             const status = getSafeStatus(getOrderStatus(order));
  789: 
  790:                             if (items.length === 0) {
  791:                               return (
  792:                                 <div key={order.id} className="flex justify-between items-center text-xs">
  793:                                   <span className="text-slate-600">
  794:                                     {tr('cart.order_total', 'Сумма заказа')}: {formatPrice(order.total_amount)}
  795:                                   </span>
  796:                                   <span className="text-xs" style={{ color: status.color }}>{status.icon} {status.label}</span>
  797:                                 </div>
  798:                               );
  799:                             }
  800: 
  801:                             return items.map((item, idx) => (
  802:                               <div key={`${order.id}-${idx}`} className="flex justify-between items-center text-xs">
  803:                                 <span className="text-slate-600">{item.dish_name} × {item.quantity}</span>
  804:                                 <span className="text-xs" style={{ color: status.color }}>{status.icon} {status.label}</span>
  805:                               </div>
  806:                             ));
  807:                           })}
  808:                         </div>
  809:                       ) : (
  810:                         <div className="pl-2 text-xs text-slate-400">
  811:                           {tr('cart.no_orders_yet', 'Заказов пока нет')}
  812:                         </div>
  813:                       )}
  814:                     </div>
  815:                   );
  816:                 })}
  817: 
  818:                 {/* Review button for other guests' dishes */}
  819:                 {otherGuestsReviewableItems.length > 0 && (
  820:                   <Button
  821:                     variant="outline"
  822:                     size="sm"
  823:                     className="w-full mt-2"
  824:                     onClick={() => openReviewDialog(otherGuestsReviewableItems)}
  825:                   >
  826:                     ⭐ {tr('review.rate_others', 'Оценить блюда гостей')}
  827:                     {loyaltyAccount && (partner?.loyalty_review_points ?? 0) > 0 && ` (+${otherGuestsReviewableItems.length * (partner?.loyalty_review_points ?? 0)} ${tr('review.points', 'баллов')})`}
  828:                   </Button>
  829:                 )}
  830:               </div>
  831:             )}
  832:           </CardContent>
  833:         </Card>
  834:       )}
  835: 
  836:       {/* SECTION 6: TABLE TOTAL */}
  837:       {(sessionGuests.length > 1 || showTableOrdersSection) && (
  838:         <Card className="mb-4 bg-slate-50">
  839:           <CardContent className="p-4">
  840:             <div className="flex items-center justify-between">
  841:               <span className="font-medium text-slate-700">{tr('cart.table_total', 'Счёт стола')}:</span>
  842:               <span className="text-xl font-bold text-slate-900">{formatPrice(parseFloat(Number(tableTotal).toFixed(2)))}</span>
  843:             </div>
  844:           </CardContent>
  845:         </Card>
  846:       )}
  847: 
  848:       {/* Fix 9 — D3: All served + cart empty → «Ничего не ждёте» screen */}
  849:       {(() => {
  850:         const isV8 = statusBuckets.accepted.length === 0
  851:           && statusBuckets.in_progress.length === 0
  852:           && statusBuckets.ready.length === 0
  853:           && statusBuckets.new_order.length === 0
  854:           && statusBuckets.served.length > 0
  855:           && cart.length === 0;
  856: 
  857:         if (isV8) {
  858:           const servedSubtotal = parseFloat(statusBuckets.served.reduce((s, o) => s + (Number(o.total_amount) || 0), 0).toFixed(2));
  859:           return (
  860:             <>
  861:               <div className="text-center py-6 mb-4">
  862:                 <p className="text-base font-medium text-slate-700">✅ {tr('cart.nothing_waiting', 'Ничего не ждёте.')}</p>
  863:                 <p className="text-sm text-slate-500 mt-1">{tr('cart.can_order_or_rate', 'Можно заказать ещё или оценить.')}</p>
  864:               </div>
  865: 
  866:               {/* Подано bucket — collapsed with accent chip */}
  867:               <Card className="mb-4">
  868:                 <CardContent className="px-3 py-1.5">
  869:                   <button
  870:                     type="button"
  871:                     className="w-full flex items-center justify-between text-left min-h-[44px]"
  872:                     onClick={() => setExpandedStatuses(prev => ({ ...prev, served: !prev.served }))}
  873:                   >
  874:                     <div className="flex items-center gap-2">
  875:                       <span className="text-base font-semibold text-slate-800">
  876:                         {bucketDisplayNames.served} ({statusBuckets.served.length})
  877:                       </span>
  878:                       {reviewsEnabled && (
  879:                         allServedRated
  880:                           ? <span className="ml-1 text-xs text-green-600 font-medium">✓ {tr('review.all_rated_chip', 'Оценено')}</span>
  881:                           : isRatingMode
  882:                             ? <span
  883:                                 role="button"
  884:                                 tabIndex={0}
  885:                                 className="ml-1 text-xs font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full cursor-pointer"
  886:                                 onClick={(e) => {
  887:                                   e.stopPropagation();
  888:                                   setIsRatingMode(false);
  889:                                   if (shouldShowReviewRewardNudge) setShowPostRatingEmailSheet(true);
  890:                                 }}
  891:                               >{tr('review.done', 'Готово')}</span>
  892:                             : <span
  893:                                 role="button"
  894:                                 tabIndex={0}
  895:                                 className="ml-1 text-xs font-medium text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full cursor-pointer"
  896:                                 onClick={() => {
  897:                                   setExpandedStatuses(prev => ({ ...prev, served: true }));
  898:                                   setIsRatingMode(true);
  899:                                   setTimeout(() => { document.querySelector('[data-first-unrated]')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); }, 100);
  900:                                 }}
  901:                               >{tr('review.rate', 'Оценить')} ({unratedServedCount})</span>
  902:                       )}
  903:                     </div>
  904:                     <div className="flex items-center gap-2">
  905:                       <span className="text-sm font-medium text-slate-600">{formatPrice(servedSubtotal)}</span>
  906:                       <div className="min-w-[44px] min-h-[44px] flex items-center justify-end">
  907:                         {expandedStatuses.served ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
  908:                       </div>
  909:                     </div>
  910:                   </button>
  911:                   {/* CV-05 v2: Rating mode micro-label */}
  912:                   {isRatingMode && !allServedRated && (
  913:                     <p className="text-xs text-slate-500 mt-0.5">{tr('review.rating_mode', 'Режим оценки')}</p>
  914:                   )}
  915:                   {/* CV-37: Bonus subline below header (visible collapsed or expanded) */}
  916:                   {shouldShowReviewRewardHint && (
  917:                     <p className="text-xs text-slate-500 mt-0.5 pb-1">
  918:                       {tr('loyalty.review_bonus_hint', 'За отзыв можно получить')} +{reviewRewardPoints} {tr('loyalty.points_short', 'баллов')}
  919:                     </p>
  920:                   )}
  921:                   {expandedStatuses.served && (
  922:                     <>
  923:                       {renderBucketOrders(statusBuckets.served, true)}
  924:                     </>
  925:                   )}
  926:                 </CardContent>
  927:               </Card>
  928:             </>
  929:           );
  930:         }
  931: 
  932:         // Normal rendering: status buckets in order
  933:         const bucketOrder = ['served', 'ready', 'in_progress', 'accepted', 'new_order'];
  934:         return bucketOrder.map(key => {
  935:           const orders = statusBuckets[key];
  936:           if (orders.length === 0) return null;
  937:           const isExpanded = !!expandedStatuses[key];
  938:           const subtotal = parseFloat(orders.reduce((s, o) => s + (Number(o.total_amount) || 0), 0).toFixed(2));
  939:           const isServed = key === 'served';
  940:           const showRating = isServed;
  941: 
  942:           return (
  943:             <Card key={key} className="mb-4">
  944:               <CardContent className="px-3 py-1.5">
  945:                 <button
  946:                   type="button"
  947:                   className="w-full flex items-center justify-between text-left min-h-[44px]"
  948:                   onClick={() => setExpandedStatuses(prev => ({ ...prev, [key]: !prev[key] }))}
  949:                 >
  950:                   <div className="flex items-center gap-2">
  951:                     <span className="text-base font-semibold text-slate-800">
  952:                       {bucketDisplayNames[key]} ({orders.length})
  953:                     </span>
  954:                     {/* CV-05 v2: Accent chip on Подано only */}
  955:                     {isServed && reviewsEnabled && (
  956:                       allServedRated
  957:                         ? <span className="ml-1 text-xs text-green-600 font-medium">✓ {tr('review.all_rated_chip', 'Оценено')}</span>
  958:                         : isRatingMode
  959:                           ? <span
  960:                               role="button"
  961:                               tabIndex={0}
  962:                               className="ml-1 text-xs font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full cursor-pointer"
  963:                               onClick={(e) => {
  964:                                 e.stopPropagation();
  965:                                 setIsRatingMode(false);
  966:                                 if (shouldShowReviewRewardNudge) setShowPostRatingEmailSheet(true);
  967:                               }}
  968:                             >{tr('review.done', 'Готово')}</span>
  969:                           : <span
  970:                               role="button"
  971:                               tabIndex={0}
  972:                               className="ml-1 text-xs font-medium text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full cursor-pointer"
  973:                               onClick={() => {
  974:                                 setExpandedStatuses(prev => ({ ...prev, served: true }));
  975:                                 setIsRatingMode(true);
  976:                                 setTimeout(() => { document.querySelector('[data-first-unrated]')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); }, 100);
  977:                               }}
  978:                             >{tr('review.rate', 'Оценить')} ({unratedServedCount})</span>
  979:                     )}
  980:                   </div>
  981:                   <div className="flex items-center gap-2">
  982:                     <span className="text-sm font-medium text-slate-600">{formatPrice(subtotal)}</span>
  983:                     <div className="min-w-[44px] min-h-[44px] flex items-center justify-end">
  984:                       {isExpanded ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
  985:                     </div>
  986:                   </div>
  987:                 </button>
  988:                 {/* CV-05 v2: Rating mode micro-label */}
  989:                 {isServed && isRatingMode && !allServedRated && (
  990:                   <p className="text-xs text-slate-500 mt-0.5">{tr('review.rating_mode', 'Режим оценки')}</p>
  991:                 )}
  992:                 {/* CV-37: Bonus subline below header (visible collapsed or expanded) */}
  993:                 {isServed && shouldShowReviewRewardHint && (
  994:                   <p className="text-xs text-slate-500 mt-0.5 pb-1">
  995:                     {tr('loyalty.review_bonus_hint', 'За отзыв можно получить')} +{reviewRewardPoints} {tr('loyalty.points_short', 'баллов')}
  996:                   </p>
  997:                 )}
  998:                 {isExpanded && renderBucketOrders(orders, showRating)}
  999:               </CardContent>
 1000:             </Card>
 1001:           );
 1002:         });
 1003:       })()}
 1004: 
 1005:       {/* SECTION 2: NEW ORDER */}
 1006:       {cart.length > 0 && (
 1007:         <Card className="mb-4">
 1008:           <CardContent className="px-3 py-2">
 1009:             <div className="flex items-center justify-between mb-3">
 1010:               <h2 className="text-base font-semibold text-slate-800 flex items-center gap-2">
 1011:                 {tr('cart.new_order', 'Новый заказ')}
 1012:               </h2>
 1013:               <span className="text-sm font-medium text-slate-600">{formatPrice(parseFloat((Number(cartTotalAmount) || 0).toFixed(2)))}</span>
 1014:             </div>
 1015: 
 1016:             <div className="space-y-2">
 1017:               {cart.map((item) => (
 1018:                 <div key={item.dishId} className="flex items-center justify-between py-2 border-b last:border-0">
 1019:                   <div className="flex-1">
 1020:                     <div className="font-medium text-slate-900">{item.name}</div>
 1021:                     {item.quantity > 1 && <div className="text-xs text-slate-500">{formatPrice(item.price)} × {item.quantity}</div>}
 1022:                   </div>
 1023:                   <div className="flex items-center gap-2">
 1024:                     <span className="font-semibold text-slate-900">{formatPrice(parseFloat((item.price * item.quantity).toFixed(2)))}</span>
 1025:                     {/* FIX P2: Stepper (-/count/+) instead of just remove-all */}
 1026:                     <div className="flex items-center bg-slate-100 rounded-lg p-0.5">
 1027:                       <button
 1028:                         onClick={() => updateQuantity(item.dishId, -1)}
 1029:                         className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-white transition-colors"
 1030:                         aria-label={tr('menu.remove', 'Убрать')}
 1031:                       >
 1032:                         <Minus className="w-3.5 h-3.5 text-slate-600" />
 1033:                       </button>
 1034:                       <span className="mx-1.5 text-sm font-semibold text-slate-900 min-w-[20px] text-center">{item.quantity}</span>
 1035:                       <button
 1036:                         onClick={() => updateQuantity(item.dishId, 1)}
 1037:                         className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-white transition-colors"
 1038:                         aria-label={tr('menu.add', 'Добавить')}
 1039:                       >
 1040:                         <Plus className="w-3.5 h-3.5 text-slate-600" />
 1041:                       </button>
 1042:                     </div>
 1043:                   </div>
 1044:                 </div>
 1045:               ))}
 1046:             </div>
 1047: 
 1048:             {/* CV-33: Split-order section removed — each guest orders for themselves */}
 1049: 
 1050:             {/* PM-086: Pre-checkout loyalty email removed — motivation text near submit button is sufficient */}
 1051: 
 1052:           </CardContent>
 1053:         </Card>
 1054:       )}
 1055: 
 1056:       {/* Spacer so sticky footer doesn't overlap last content */}
 1057:       {(cart.length > 0 || todayMyOrders.length > 0) && <div className="h-14" />}
 1058: 
 1059:       {/* AC-08: Error state with retry */}
 1060:       {submitError && cart.length > 0 && (
 1061:         <div className="mx-0 mb-2 p-3 bg-red-50 border border-red-200 rounded-lg text-center">
 1062:           <p className="text-sm font-medium text-red-700">{submitError}</p>
 1063:           <p className="text-xs text-red-500 mt-1">
 1064:             {tr('error.send.subtitle', 'Не удалось отправить. Попробуйте снова')}
 1065:           </p>
 1066:         </div>
 1067:       )}
 1068: 
 1069:       {/* CV-38: Post-rating email bottom sheet */}
 1070:       {showPostRatingEmailSheet && (
 1071:         <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/30" onClick={() => setShowPostRatingEmailSheet(false)}>
 1072:           <div className="bg-white rounded-t-xl w-full max-w-lg p-4 pb-6" onClick={e => e.stopPropagation()}>
 1073:             <h3 className="text-base font-semibold text-slate-800 mb-2">{tr('review.get_bonus_title', 'Получить баллы за отзыв')}</h3>
 1074:             <p className="text-sm text-slate-600 mb-1">{tr('review.rated_count', 'Вы оценили')} {ratedServedCount} {tr('review.dishes_word', 'блюд')}.</p>
 1075:             <p className="text-sm text-slate-600 mb-3">{tr('review.enter_email_for_points', 'Введите email, чтобы получить')} {ratedServedCount * reviewRewardPoints} {tr('loyalty.points_short', 'баллов')}.</p>
 1076:             <Input
 1077:               type="email"
 1078:               value={rewardEmail}
 1079:               onChange={e => setRewardEmail(e.target.value)}
 1080:               placeholder="email@example.com"
 1081:               className="mb-3 h-10"
 1082:             />
 1083:             <Button
 1084:               className="w-full h-11 mb-2 text-white"
 1085:               style={{backgroundColor: primaryColor}}
 1086:               disabled={!rewardEmail.trim() || rewardEmailSubmitting}
 1087:               onClick={() => {
 1088:                 if (!rewardEmail.trim()) return;
 1089:                 if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(rewardEmail.trim())) {
 1090:                   if (toast) toast.error(tr('loyalty.invalid_email', 'Введите корректный email'));
 1091:                   return;
 1092:                 }
 1093:                 setRewardEmailSubmitting(true);
 1094:                 if (setCustomerEmail) setCustomerEmail(rewardEmail);
 1095:                 if (toast) toast.success(tr('loyalty.email_saved', 'Email сохранён! Бонусы будут начислены.'));
 1096:                 rewardTimerRef.current = setTimeout(() => {
 1097:                   setRewardEmailSubmitting(false);
 1098:                   setShowPostRatingEmailSheet(false);
 1099:                 }, 1000);
 1100:               }}
 1101:             >
 1102:               {rewardEmailSubmitting ? '...' : tr('review.get_bonus_btn', 'Получить баллы')}
 1103:             </Button>
 1104:             <button type="button" className="w-full text-center text-sm text-slate-500 py-2" onClick={() => setShowPostRatingEmailSheet(false)}>
 1105:               {tr('review.skip', 'Пропустить')}
 1106:             </button>
 1107:             <p className="text-xs text-slate-400 text-center mt-1">{tr('review.ratings_saved_note', 'Оценки уже сохранены')}</p>
 1108:           </div>
 1109:         </div>
 1110:       )}
 1111: 
 1112:       {/* CV-02: Sticky footer — always visible when cart or orders exist */}
 1113:       {(cart.length > 0 || todayMyOrders.length > 0) && (
 1114:         <div className="sticky bottom-0 bg-white border-t border-slate-200 p-4 -mx-4">
 1115:           {cart.length > 0 ? (
 1116:             <>
 1117:               {/* Motivation text — only if loyalty enabled (#87 KS-1 Fix 1) */}
 1118:               {partner?.loyalty_enabled && (() => {
 1119:                 const motivationPoints = Math.round((Number(cartTotalAmount) || 0) * (Number(partner?.loyalty_points_per_currency) || 1));
 1120:                 return motivationPoints > 0 ? (
 1121:                   <p className="text-sm text-gray-500 text-center mt-1 mb-1">
 1122:                     {trFormat('cart.motivation_bonus', { points: motivationPoints }, `Отправьте заказ официанту и получите +${motivationPoints} бонусов`)}
 1123:                   </p>
 1124:                 ) : null;
 1125:               })()}
 1126:               <Button
 1127:                 size="lg"
 1128:                 className={`w-full text-white ${
 1129:                   isSubmitting || emailError
 1130:                     ? 'bg-slate-100 text-slate-400 cursor-not-allowed hover:bg-slate-100'
 1131:                     : submitError
 1132:                       ? 'bg-red-600 hover:bg-red-700'
 1133:                       : ''
 1134:                 }`}
 1135:                 style={!isSubmitting && !submitError && !emailError ? {backgroundColor: primaryColor} : undefined}
 1136:                 onClick={() => {
 1137:                   if (submitError && setSubmitError) setSubmitError(null);
 1138:                   handleSubmitOrder();
 1139:                 }}
 1140:                 disabled={isSubmitting || !!emailError}
 1141:               >
 1142:                 {isSubmitting
 1143:                   ? tr('cta.sending', 'Отправляем...')
 1144:                   : submitError
 1145:                     ? tr('cta.retry', 'Повторить отправку')
 1146:                     : tr('cart.send_to_waiter', 'Отправить заказ официанту')}
 1147:               </Button>
 1148:             </>
 1149:           ) : (
 1150:             <Button
 1151:               variant="outline"
 1152:               size="lg"
 1153:               className="w-full min-h-[44px]"
 1154:               style={{borderColor: primaryColor, color: primaryColor}}
 1155:               onClick={() => { onClose ? onClose() : setView("menu"); }}
 1156:             >
 1157:               {tr('cart.order_more', 'Заказать ещё')}
 1158:             </Button>
 1159:           )}
 1160:         </div>
 1161:       )}
 1162:     </div>
 1163:   );
 1164: }
=== END SOURCE CODE ===

=== TASK CONTEXT ===
# Д2 Smoke-test: CV-BUG-03 Scroll-to-new-order impl plan

## Контекст

**Это smoke-тест chain `discussion-cc-codex-lean` (Д2, BACKLOG #332).** Цель — проверить, что writers (CC + Codex) запускаются параллельно, chain завершается после обоих writers DONE без synthesizer-шага. Предмет обсуждения выбран нарочито узкий и дешёвый.

**CV-BUG-03 (BACKLOG #325):** после оформления нового заказа корзина CartView остаётся наверху, гость не видит свежий заказ. Нужно проскроллить drawer к новому Order card.

Текущий код: `pages/PublicMenu/CartView.jsx` HEAD 1223 строки. Заказы рендерятся в списке через `activeOrders.map(...)` (секция «Мои» и «Стол»). Drawer — `vaul` Drawer с внутренним scroll.

## Constraints

- Не ломать существующий scroll/focus behavior.
- Mobile 320-420px, vaul drawer.
- Никаких новых deps.

## 2 вопроса

### Q1: Как детектить «новый заказ» для scroll?

Варианты:
- **A)** Ref на последний order.id в `activeOrders` + `useEffect` по длине массива.
- **B)** Явный prop `lastSubmittedOrderId` снаружи (из submit flow).
- **C)** Сравнение `activeOrders[0].created_date` с mount timestamp.

Обсудить: race с polling (CV-80), false trigger при restore после kill Chrome (CV-74), tab context (если гость на табе «Стол» — скроллить там же?).

### Q2: Куда именно скроллить и как?

- `scrollIntoView({ behavior: 'smooth', block: 'start' })` на Order card ref?
- Или scrollTop контейнера drawer?
- Offset под sticky header (CV-19 «Заказано на стол»)?
- Что если новый order уже виден (no-op)?

## Deliverable (каждый writer)

Файл `pipeline/chain-state/<chain-id>-{cc,codex}-position.md`:
- Рекомендация по Q1 (A/B/C + обоснование)
- Рекомендация по Q2 (метод + offset + no-op logic)
- Риски / edge-cases
- 1-2 строки псевдокода если уместно

Cowork потом читает обе позиции и синтезирует с Arman в чате (Д2 flow).
=== END ===
