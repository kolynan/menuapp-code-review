---
chain: staffordersmobile-260412-125128-6328
chain_step: 1
chain_total: 1
chain_step_name: pssk-codex-reviewer
page: StaffOrdersMobile
budget: 3.00
runner: codex
type: chain-step
---
You are a Codex code reviewer evaluating the QUALITY of a КС implementation prompt (NOT executing it).

A КС prompt is an instruction document for Claude Code + Codex pipeline to fix code in a React/Base44 app.
Your role: find issues with the PROMPT DESIGN that could cause the execution to fail, produce wrong results, or require clarification.

⛔ DO NOT: run any commands (no shell, no PowerShell, no exec), make any code changes, modify files, read files from disk.
⛔ DO NOT: use Get-Content, Select-String, rg, cat, head, or any file-reading command. ALL source code you need is provided INLINE below.
✅ DO: analyze the prompt text AND the inline source code provided in the SOURCE CODE section below.

To verify the prompt's code references — use ONLY the inline source code below:
1. Check line numbers against the provided source (line numbers are included)
2. Verify function names, variable names, and code snippets match the inline source
3. Check that code snippets in the prompt match actual code (correct field names, function signatures, etc.)

⚡ PERFORMANCE: The full source file is included inline in this prompt. Do NOT attempt to read it from disk — this wastes 15-30 minutes on PowerShell I/O. Everything you need is already here.

For each issue: [CRITICAL/MEDIUM/LOW] Title — Description. PROMPT FIX: what to change in the prompt.

Focus on:
- Incorrect code snippets in the prompt (wrong syntax, wrong function calls, wrong variable names) — verify against actual code
- Missing edge cases the prompt doesn't cover
- Ambiguous instructions Codex might misinterpret
- Safety risks: will this cause unintended file changes?
- Missing context: what info would help Codex execute without hesitation?
- Fix order: are there dependencies between fixes that need explicit sequencing?
- Validation: are the post-fix verification steps sufficient?
- Line numbers: verify all ~line N references against the actual file

Write your findings to: pipeline/chain-state/staffordersmobile-260412-125128-6328-codex-findings.md

FORMAT:
# Codex Reviewer Findings — ПССК Prompt Quality Review
Chain: staffordersmobile-260412-125128-6328

## Issues Found
1. [CRITICAL/MEDIUM/LOW] Title — Description. PROMPT FIX: ...
2. ...

## Summary
Total: N issues (X CRITICAL, Y MEDIUM, Z LOW)

## Additional Risks
Any risks the prompt author may not have considered.

## Prompt Clarity (MANDATORY — do NOT skip)
- Overall clarity: [1-5]
- What was most clear:
- What was ambiguous or could cause hesitation:
- Missing context:

Do NOT apply any fixes to code files. Analysis only.

=== SOURCE CODE (with line numbers) ===
File: 260408-00 StaffOrdersMobile RELEASE.jsx (4429 lines)

    1: ﻿/* ═══════════════════════════════════════════════════════════════════════════
    2:    STAFFORDERSMOBILE — v4.0.0 (2026-03-05) UX Redesign — Expand/Collapse Cards
    3: 
    4:    CHANGES in v4.0.0 (UX Redesign — Expand/Collapse Cards — S77):
    5:    - Replaced detail view navigation with inline expand/collapse cards
    6:    - Collapsed card: identifier + elapsed time + channel + status + items preview + request badges
    7:    - Expanded card (Hall): Block A (active orders) + Block B (action) + Block C (requests)
    8:      + Block E (bill summary) + Block F (completed orders) + Block D (close table)
    9:    - Expanded card (Pickup/Delivery): Block A (full items) + Block B (action) + contacts
   10:    - Max 1 expanded card at a time; tap to toggle
   11:    - Animation: height 200ms ease-out, content opacity transition
   12:    - Items loaded per-order via useQueries, cached 60s
   13:    - Human-readable status labels, no system IDs or raw i18n keys
   14:    - Order number displayed as secondary gray text
   15:    - Request badges (bill/waiter) on collapsed hall cards
   16:    - Bill summary with per-guest breakdown
   17:    - Close table with disable reasons
   18: 
   19:    CHANGES in v3.7.0 (Bug Fixes — S76):
   20:    - BUG-S76-01: Fixed i18n — status badge now translates OrderStage names via t()
   21:    - BUG-S76-02: Fixed i18n — action button text now translates OrderStage names via t()
   22:    - BUG-S76-03: Fixed client_name display in detail view for Pickup/Delivery orders
   23: 
   24:    CHANGES in v3.6.0 (P0 Stale Data + Close Table Confirm — S74):
   25:    - P0: Detail view forces refetch on open (prevents stale order list)
   26:    - P0: Notification effect invalidates orders query when new orders detected
   27:    - P0: computeTableStatus reordered — NEW before STALE (new orders clear ПРОСРОЧЕН)
   28:    - P0: "Закрыть стол" replaced browser confirm() with React confirmation dialog
   29:    - Dialog: table name in title, destructive red button, 44px touch targets, mobile 320px safe
   30: 
   31:    CHANGES in v3.5.0 (SESS-016 — Session Cleanup Integration):
   32:    - Added runSessionCleanup() import from @/components/sessionCleanupJob
   33:    - Added useEffect + setInterval(5min) to auto-expire stale sessions
   34:    - Silent background job: logs only when actions taken or errors occur
   35:    - Idempotent: safe to run on each mount + every 5 minutes
   36: 
   37:    CHANGES in v3.4.0 (UI Bug Fixes — 4 bugs from Deep Test S66):
   38:    - BUG-S66-01: Detail view now opens reliably (removed translate-x animation, z-40)
   39:    - BUG-S66-02: PREPARING cards show CTA for advanceable orders (was hidden)
   40:    - BUG-S65-04: First-stage CTA opens detail view (prevents blind accept)
   41:    - BUG-S65-05: Fixed double "Стол" prefix (displayName + banner)
   42: 
   43:    CHANGES in v3.2.0 (Sprint D — Waiter Screen V2):
   44:    - V2-09: BannerNotification — in-app banner overlay for new order events
   45:    - Fixed position at top of viewport, z-60 (above everything)
   46:    - Content: "Стол N: Новый заказ" with table name + event type
   47:    - Auto-hide after 5 seconds, swipe-up to dismiss early
   48:    - Tap banner → scroll to relevant table card with brief highlight
   49:    - De-duplication: multiple events in same cycle → "3 новых заказа"
   50:    - Works on all screens (Mine, Free, Others, Detail view)
   51:    - Non-blocking: content below remains interactive
   52: 
   53:    CHANGES in v3.1.0 (Sprint B — Waiter Screen V2):
   54:    - V2-02: TableDetailScreen — full-screen detail view, slide-in from right
   55:    - V2-03: Split-tap — CTA button executes action, card body opens detail view
   56:    - Scroll position preserved when returning from detail view
   57:    - DetailOrderRow — auto-fetches items in detail view (no lazy loading needed)
   58:    - GuestOrderSection — per-guest action buttons (48px min, full-width)
   59:    - Swipe-right back navigation on TableDetailScreen
   60:    - liveDetailGroup: detail view auto-updates via polling
   61: 
   62:    CHANGES in v3.0.0 (Sprint A — Waiter Screen V2):
   63:    - V2-01: Compact card layout (table name + zone, status badge, guest/order count, elapsed time, 1 CTA)
   64:    - V2-05: Color-coded left borders (purple/blue/amber/green/gray/red per status)
   65:    - V2-06: Muted Preparing cards (gray bg, 2px border, no CTA)
   66:    - V2-08: Guest-labeled CTA ("Accept (Guest #N)" format)
   67:    - V2-10: 52px min-height full-width primary CTA button
   68:    - Sort: Mine tab sorted BILL_REQUESTED > NEW > READY > ALL_SERVED > PREPARING (oldest first within group)
   69:    - Added computeTableStatus() and computeGroupCTA() helpers
   70:    - Added TABLE_STATUS_STYLES and TABLE_STATUS_SORT_PRIORITY mappings
   71: 
   72:    STAFFORDERSMOBILE — v2.7.3 (2026-02-02)
   73:    
   74:    CHANGES in v2.7.3 (shift filtering):
   75:    - Added shift-based filtering: orders/requests only from current shift
   76:    - Added getShiftStartTime helper (supports overnight shifts)
   77:    - Filters use partner.working_hours to determine shift boundaries
   78:    
   79:    CHANGES in v2.7.2 (hotfix):
   80:    - Fixed duplicate "Стол" in group header (removed prefix, displayName already contains full label)
   81:    - Fixed empty state condition for non-kitchen (check finalGroups + finalRequests, not visibleOrders)
   82:    
   83:    CHANGES in v2.7.1 (tabs + overdue + favorites filter):
   84:    - Added Active/Completed tabs (non-kitchen only)
   85:    - Added overdue badge (red clock) on orders waiting too long
   86:    - Added "★ Мои" favorites filter toggle
   87:    - Added ★ button on ServiceRequests
   88:    - Added "Закрыть стол" button when all orders ready
   89:    
   90:    CHANGES in v2.7.0 (grouping):
   91:    - OrderGroupCard: hall grouped by table, pickup/delivery individual
   92:    - Favorites format: plain IDs → prefixed keys (table:id)
   93:    - Sorted by oldest unaccepted order
   94:    - Auto-expand first 5 + favorites
   95:    - Kitchen unchanged (flat list)
   96:    
   97:    CHANGES in v2.6.6 (hardening):
   98:    - Stage ID сравнения теперь через getLinkId() везде (getStagesForOrder, getStatusConfig)
   99:    - stagesMap собирается по нормализованным ключам
  100:    - handleAction проверяет assignee через getAssigneeId() (не !order.assignee)
  101:    
  102:    CHANGES in v2.6.5 (hardening):
  103:    - isOrderFree() теперь использует getLinkId() (унификация)
  104:    - favorites нормализация: все ID приводятся к строке через getLinkId()
  105:    - MyTablesModal использует getLinkId() для сравнений
  106:    
  107:    CHANGES in v2.6.4 (hotfix):
  108:    - getAssigneeId() теперь использует getLinkId() (унификация)
  109:    - Сброс guest-кэша при смене partnerId (защита от stale data)
  110:    
  111:    CHANGES in v2.6.3 (hotfix):
  112:    - getLinkId() финальный: null-check (== null), консистентный String() везде
  113:    
  114:    CHANGES in v2.6.2 (hotfix):
  115:    - getLinkId() типобезопасный: string/number/object/value-object
  116:    
  117:    CHANGES in v2.6.1 (hotfix):
  118:    - getLinkId() расширен: теперь обрабатывает _id и value (не только id)
  119:    - onCloseTable передаёт нормализованный tableSessionId
  120:    
  121:    CHANGES in v2.6 (P0 FIXES):
  122:    - P0-1: Applied getLinkId() everywhere for order.table, order.stage_id, req.table
  123:    - P0-2: Removed .list() from OrderStage query (consistent with other .filter() calls)
  124:    - P0-3: Lazy loading for OrderItem (itemsOpen state + enabled flag) - fixes N+1 429
  125:    - P0-4: Added loadedGuestIdsRef to prevent repeated SessionGuest requests on polling
  126:    - P0-5: Added currentUserId fallback (id ?? _id ?? user_id ?? null)
  127:    
  128:    Previous changes (v2.5):
  129:    - D1: Added order_number badge (gray) - NOT for kitchen
  130:    - D1: Added guest name badge (blue) with batch loading - NOT for kitchen
  131:    - D1: Added "Close table" button - NOT for kitchen
  132:    - D1: Kitchen optimization: no SessionGuest requests
  133:    - D1: getLinkId helper for normalizing link fields
  134:    
  135:    Previous changes (v2.4):
  136:    - P1: Added OrderStage integration (dynamic stages instead of hardcoded STATUS_FLOW)
  137:    - P1: getStatusConfig function with fallback to STATUS_FLOW
  138:    - P1: Stage filtering by order channel (enabled_hall/pickup/delivery)
  139:    - P1: Badge now shows stage.color when using OrderStage
  140:    - P1: handleAction updates stage_id instead of status for new orders
  141:    
  142:    Previous changes (v2.3):
  143:    - P0: Added CABINET_ACCESS_ROLES constant
  144:    - P0: Added auto-bind for directors (if logged in + email matches)
  145:    - P0: Added Cabinet button in header for directors after bind
  146:    
  147:    Previous changes (v2.2):
  148:    - Added ProfileSheet with staff name, role, restaurant name
  149:    - Moved "My Tables" (⭐) into ProfileSheet
  150:    - Added role-based help instructions (waiter vs kitchen)
  151:    - Added kitchen filter: kitchen only sees accepted/in_progress/ready orders
  152:    - Simplified header: [👤] [🔔] [⚙️]
  153:    - Added logout functionality
  154:    
  155:    Previous fixes (v2.1):
  156:    - Rate limit fix (infinite loop prevention)
  157: ═══════════════════════════════════════════════════════════════════════════ */
  158: 
  159: import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
  160: import { base44 } from "@/api/base44Client";
  161: import { useMutation, useQuery, useQueryClient, useQueries } from "@tanstack/react-query";
  162: import {
  163:   ArrowDown,
  164:   ArrowUp,
  165:   Bell,
  166:   Briefcase,
  167:   ChevronDown,
  168:   ChevronLeft,
  169:   ChevronUp,
  170:   Clock,
  171:   Hand,
  172:   Loader2,
  173:   RefreshCcw,
  174:   Search,
  175:   Settings,
  176:   ShoppingBag,
  177:   Sparkles,
  178:   Star,
  179:   Trash2,
  180:   Truck,
  181:   Utensils,
  182:   UtensilsCrossed,
  183:   AlertTriangle,
  184:   X,
  185:   User,
  186:   LogOut,
  187:   ChevronRight,
  188:   HelpCircle,
  189:   Phone,
  190:   MapPin,
  191:   DollarSign,
  192:   CheckCircle2,
  193:   Lock,
  194:   Receipt,
  195: } from "lucide-react";
  196: import { formatDistanceToNow } from "date-fns";
  197: import { ru } from "date-fns/locale";
  198: import { Card, CardContent } from "@/components/ui/card";
  199: import { Button } from "@/components/ui/button";
  200: import { Badge } from "@/components/ui/badge";
  201: // D1: Import session helpers
  202: import { getGuestDisplayName, closeSession } from "@/components/sessionHelpers";
  203: // SESS-016: Import session cleanup job (auto-expire stale sessions)
  204: import { runSessionCleanup } from "@/components/sessionCleanupJob";
  205: // BUG-S76-01/02: i18n for OrderStage names
  206: import { useI18n } from "@/components/i18n";
  207: 
  208: /* ═══════════════════════════════════════════════════════════════════════════
  209:    CONSTANTS
  210: ═══════════════════════════════════════════════════════════════════════════ */
  211: 
  212: // FALLBACK: Used when order has no stage_id or stages not loaded
  213: const STATUS_FLOW = {
  214:   new: {
  215:     label: "Новый",
  216:     actionLabel: "Принять",
  217:     nextStatus: "accepted",
  218:     badgeClass: "bg-blue-50 text-blue-700 border border-blue-200",
  219:   },
  220:   accepted: {
  221:     label: "Принят",
  222:     actionLabel: "В работу",
  223:     nextStatus: "in_progress",
  224:     badgeClass: "bg-slate-50 text-slate-600 border border-slate-200",
  225:   },
  226:   in_progress: {
  227:     label: "Готовится",
  228:     actionLabel: "Готово",
  229:     nextStatus: "ready",
  230:     badgeClass: "bg-yellow-50 text-yellow-700 border border-yellow-200",
  231:   },
  232:   ready: {
  233:     label: "Готов",
  234:     actionLabel: "Выдать",
  235:     nextStatus: "served",
  236:     badgeClass: "bg-green-50 text-green-700 border border-green-200",
  237:   },
  238: };
  239: 
  240: const TYPE_THEME = {
  241:   hall: {
  242:     label: "Зал",
  243:     icon: Utensils,
  244:     stripeClass: "bg-indigo-500",
  245:     badgeClass: "bg-indigo-50 text-indigo-700 border-indigo-200",
  246:   },
  247:   pickup: {
  248:     label: "Самовывоз",
  249:     icon: ShoppingBag,
  250:     stripeClass: "bg-fuchsia-500",
  251:     badgeClass: "bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200",
  252:   },
  253:   delivery: {
  254:     label: "Доставка",
  255:     icon: Truck,
  256:     stripeClass: "bg-teal-500",
  257:     badgeClass: "bg-teal-50 text-teal-700 border-teal-200",
  258:   },
  259: };
  260: 
  261: // FIX SO-S89-01 (v2): OrderStage.name may contain raw i18n keys like "orderprocess.default.new"
  262: // Map known keys AND short names to Russian display names as fallback
  263: const STAGE_NAME_FALLBACKS = {
  264:   "orderprocess.default.new": "Новый",
  265:   "orderprocess.default.accepted": "Принят",
  266:   "orderprocess.default.in_progress": "Готовится",
  267:   "orderprocess.default.ready": "Готов",
  268:   "orderprocess.default.served": "Выдан",
  269:   "orderprocess.default.cancelled": "Отменён",
  270:   "new": "Новый",
  271:   "accepted": "Принят",
  272:   "in_progress": "Готовится",
  273:   "ready": "Готов",
  274:   "served": "Выдан",
  275:   "cancelled": "Отменён",
  276: };
  277: 
  278: function getStageName(stage, t) {
  279:   if (!stage?.name) return "—";
  280:   const name = stage.name;
  281:   // 1. Try t() if available (proper B44 i18n)
  282:   if (t) {
  283:     const translated = t(name);
  284:     if (translated && translated !== name) return translated;
  285:   }
  286:   // 2. Direct lookup in fallback map (exact key or short name)
  287:   if (STAGE_NAME_FALLBACKS[name]) return STAGE_NAME_FALLBACKS[name];
  288:   // 3. Extract last segment from dotted key (e.g. "orderprocess.foo.new" → "new")
  289:   if (name.includes('.')) {
  290:     const lastSegment = name.split('.').pop();
  291:     if (STAGE_NAME_FALLBACKS[lastSegment]) return STAGE_NAME_FALLBACKS[lastSegment];
  292:   }
  293:   // 4. Return raw name as last resort
  294:   return name;
  295: }
  296: 
  297: const REQUEST_TYPE_LABELS = {
  298:   call_waiter: "\u041F\u043E\u0437\u0432\u0430\u0442\u044C \u043E\u0444\u0438\u0446\u0438\u0430\u043D\u0442\u0430",
  299:   bill: "\u041F\u0440\u0438\u043D\u0435\u0441\u0442\u0438 \u0441\u0447\u0451\u0442",
  300:   napkins: "\u041F\u0440\u0438\u043D\u0435\u0441\u0442\u0438 \u0441\u0430\u043B\u0444\u0435\u0442\u043A\u0438",
  301:   menu: "\u041F\u0440\u0438\u043D\u0435\u0441\u0442\u0438 \u043C\u0435\u043D\u044E",
  302:   other: "\u0414\u0440\u0443\u0433\u043E\u0439 \u0437\u0430\u043F\u0440\u043E\u0441",
  303: };
  304: 
  305: const HALL_UI_TEXT = {
  306:   requests: "\u0417\u0410\u041F\u0420\u041E\u0421\u042B",
  307:   requestsShort: "\u0417\u0430\u043F\u0440\u043E\u0441\u044B",
  308:   new: "\u041D\u041E\u0412\u042B\u0415",
  309:   newShort: "\u041D\u043E\u0432\u044B\u0435",
  310:   ready: "\u0413\u041E\u0422\u041E\u0412\u041E",
  311:   readyShort: "\u0413\u043E\u0442\u043E\u0432\u043E",
  312:   inProgress: "\u0412 \u0420\u0410\u0411\u041E\u0422\u0415",
  313:   served: "\u0412\u042B\u0414\u0410\u041D\u041E",
  314:   bill: "\u0421\u0427\u0401\u0422",
  315:   total: "\u0418\u0442\u043E\u0433\u043E",
  316:   remaining: "\u041A \u043E\u043F\u043B\u0430\u0442\u0435",
  317:   paid: "\u041E\u043F\u043B\u0430\u0447\u0435\u043D\u043E",
  318:   done: "\u0412\u044B\u043F\u043E\u043B\u043D\u0435\u043D\u043E",
  319:   accept: "\u041F\u0440\u0438\u043D\u044F\u0442\u044C",
  320:   acceptAll: "\u041F\u0440\u0438\u043D\u044F\u0442\u044C \u0432\u0441\u0435",
  321:   serve: "\u0412\u044B\u0434\u0430\u0442\u044C",
  322:   serveAll: "\u0412\u044B\u0434\u0430\u0442\u044C \u0432\u0441\u0435",
  323:   show: "\u041F\u043E\u043A\u0430\u0437\u0430\u0442\u044C",
  324:   hide: "\u0421\u043A\u0440\u044B\u0442\u044C",
  325:   collapse: "\u0421\u0432\u0435\u0440\u043D\u0443\u0442\u044C",
  326:   closeTable: "\u0417\u0430\u043A\u0440\u044B\u0442\u044C \u0441\u0442\u043E\u043B",
  327:   loading: "\u0417\u0430\u0433\u0440\u0443\u0437\u043A\u0430...",
  328:   noActions: "\u041D\u0435\u0442 \u0430\u043A\u0442\u0438\u0432\u043D\u044B\u0445 \u0434\u0435\u0439\u0441\u0442\u0432\u0438\u0439",
  329:   otherTableTitle: "\u0427\u0443\u0436\u043E\u0439 \u0441\u0442\u043E\u043B",
  330:   otherTableHint: "\u0417\u0430\u043A\u0440\u0435\u043F\u043B\u0451\u043D \u0437\u0430 \u0434\u0440\u0443\u0433\u0438\u043C \u0441\u043E\u0442\u0440\u0443\u0434\u043D\u0438\u043A\u043E\u043C",
  331:   requestsBlocker: "\u0415\u0441\u0442\u044C \u043D\u0435\u0432\u044B\u043F\u043E\u043B\u043D\u0435\u043D\u043D\u044B\u0435 \u0437\u0430\u043F\u0440\u043E\u0441\u044B",
  332:   newBlocker: "\u0415\u0441\u0442\u044C \u043D\u043E\u0432\u044B\u0435 \u0431\u043B\u044E\u0434\u0430",
  333:   inProgressBlocker: "\u0415\u0441\u0442\u044C \u0431\u043B\u044E\u0434\u0430 \u0432 \u0440\u0430\u0431\u043E\u0442\u0435",
  334:   readyBlocker: "\u0415\u0441\u0442\u044C \u0431\u043B\u044E\u0434\u0430 \u0432 \u0441\u0435\u043A\u0446\u0438\u0438 \u00AB\u0413\u043E\u0442\u043E\u0432\u043E\u00BB",
  335:   acceptRequest: "\u041F\u0440\u0438\u043D\u044F\u0442\u044C",
  336:   serveRequest: "\u0412\u044B\u0434\u0430\u0442\u044C",
  337:   acceptAllRequests: "\u041F\u0440\u0438\u043D\u044F\u0442\u044C \u0432\u0441\u0435",
  338:   serveAllRequests: "\u0412\u044B\u0434\u0430\u0442\u044C \u0432\u0441\u0435",
  339:   undoLabel: "\u0412\u044B\u0434\u0430\u043D \u0433\u043E\u0441\u0442\u044E",
  340:   undo: "\u041E\u0442\u043C\u0435\u043D\u0438\u0442\u044C",
  341:   guests: "\u0433\u043E\u0441\u0442",
  342:   dishes: "\u0431\u043B\u044E\u0434",
  343:   inProgressShort: "\u0412 \u0440\u0430\u0431\u043E\u0442\u0435",
  344:   closeHint: "\u0427\u0442\u043E\u0431\u044B \u0437\u0430\u043A\u0440\u044B\u0442\u044C:",
  345:   closeActionRequests: "\u043F\u0440\u0438\u043D\u044F\u0442\u044C",
  346:   closeActionNew: "\u043F\u0440\u0438\u043D\u044F\u0442\u044C",
  347:   closeActionReady: "\u0432\u044B\u0434\u0430\u0442\u044C",
  348:   closeActionInProgress: "\u0434\u043E\u0436\u0434\u0430\u0442\u044C\u0441\u044F",
  349: };
  350: 
  351: const HALL_CHIP_STYLES = {
  352:   red:   "bg-red-50 border-red-300 text-red-600",
  353:   blue:  "bg-blue-50 border-blue-300 text-blue-600",
  354:   green: "bg-green-50 border-green-300 text-green-600",
  355:   amber: "bg-amber-50 border-amber-300 text-amber-600",
  356:   gray:  "bg-slate-100 border-slate-300 text-slate-500",
  357: };
  358: 
  359: function formatCompactMinutes(totalMinutes) {
  360:   if (!Number.isFinite(totalMinutes) || totalMinutes <= 0) return "0\u043C";
  361:   if (totalMinutes < 60) return `${totalMinutes}\u043C`;
  362:   const hours = Math.floor(totalMinutes / 60);
  363:   const minutes = totalMinutes % 60;
  364:   return minutes > 0 ? `${hours}\u0447 ${minutes}\u043C` : `${hours}\u0447`;
  365: }
  366: 
  367: function formatHallMoney(amount) {
  368:   const value = Number(amount || 0);
  369:   const hasFraction = Math.abs(value % 1) > 0;
  370:   return `${value.toLocaleString("ru-RU", {
  371:     minimumFractionDigits: hasFraction ? 2 : 0,
  372:     maximumFractionDigits: 2,
  373:   })} \u20B8`;
  374: }
  375: 
  376: function formatClockTime(dateStr) {
  377:   return new Date(safeParseDate(dateStr)).toLocaleTimeString("ru", { hour: "2-digit", minute: "2-digit" });
  378: }
  379: 
  380: function getAgeMinutes(dateStr) {
  381:   return Math.max(0, Math.floor((Date.now() - safeParseDate(dateStr).getTime()) / 60000));
  382: }
  383: 
  384: function stripTablePrefix(label) {
  385:   if (!label) return "";
  386:   return String(label).replace(/^\s*\u0421\u0442\u043E\u043B\s*/i, "").trim();
  387: }
  388: 
  389: function extractGuestMarker(label) {
  390:   if (!label) return null;
  391:   const match = String(label).match(/(\d+)/);
  392:   return match ? match[1] : null;
  393: }
  394: 
  395: const ROLE_LABELS = {
  396:   partner_staff: "Официант",
  397:   kitchen: "Кухня",
  398:   partner_manager: "Менеджер",
  399:   director: "Директор",
  400:   managing_director: "Управляющий директор",
  401: };
  402: 
  403: const DEVICE_ID_STORAGE_KEY = "menuapp_staff_device_id";
  404: const NOTIF_PREFS_STORAGE_KEY = "menuapp_staff_notif_prefs_v2";
  405: const POLLING_INTERVAL_KEY = "menuapp_staff_polling_interval";
  406: const SORT_MODE_KEY = "menuapp_staff_sort_mode";
  407: const SORT_ORDER_KEY = "menuapp_staff_sort_order";
  408: 
  409: // P0: Роли с доступом к кабинету
  410: const CABINET_ACCESS_ROLES = ['director', 'managing_director'];
  411: 
  412: // V2-05: Table-level status color/style mapping (Sprint A)
  413: const TABLE_STATUS_STYLES = {
  414:   BILL_REQUESTED: {
  415:     borderClass: 'border-l-4 border-l-violet-500',
  416:     bgClass: 'bg-violet-50',
  417:     badgeClass: 'bg-violet-500 text-white',
  418:     textClass: 'text-slate-900',
  419:     ctaBgClass: 'bg-violet-600 hover:bg-violet-700 text-white',
  420:     label: 'СЧЁТ',
  421:   },
  422:   NEW: {
  423:     borderClass: 'border-l-4 border-l-blue-500',
  424:     bgClass: 'bg-blue-50',
  425:     badgeClass: 'bg-blue-500 text-white',
  426:     textClass: 'text-slate-900',
  427:     ctaBgClass: 'bg-blue-600 hover:bg-blue-700 text-white',
  428:     label: 'НОВЫЙ',
  429:   },
  430:   READY: {
  431:     borderClass: 'border-l-4 border-l-amber-500',
  432:     bgClass: 'bg-amber-50',
  433:     badgeClass: 'bg-amber-500 text-white',
  434:     textClass: 'text-slate-900',
  435:     ctaBgClass: 'bg-amber-600 hover:bg-amber-700 text-white',
  436:     label: 'ГОТОВ',
  437:   },
  438:   ALL_SERVED: {
  439:     borderClass: 'border-l-4 border-l-green-500',
  440:     bgClass: 'bg-green-50',
  441:     badgeClass: 'bg-green-500 text-white',
  442:     textClass: 'text-slate-900',
  443:     ctaBgClass: 'bg-green-600 hover:bg-green-700 text-white',
  444:     label: 'ОБСЛУЖЕНО',
  445:   },
  446:   PREPARING: {
  447:     borderClass: 'border-l-2 border-l-slate-300',
  448:     bgClass: 'bg-slate-50',
  449:     badgeClass: 'bg-slate-400 text-white',
  450:     textClass: 'text-slate-500',
  451:     ctaBgClass: 'bg-slate-600 hover:bg-slate-700 text-white',
  452:     label: 'ГОТОВИТСЯ',
  453:   },
  454:   STALE: {
  455:     borderClass: 'border-l-4 border-l-red-500',
  456:     bgClass: 'bg-red-50',
  457:     badgeClass: 'bg-red-500 text-white',
  458:     textClass: 'text-slate-900',
  459:     ctaBgClass: 'bg-red-600 hover:bg-red-700 text-white',
  460:     label: 'ПРОСРОЧЕН',
  461:   },
  462: };
  463: 
  464: // V2: Sort priority for Mine tab (0 = highest priority)
  465: const TABLE_STATUS_SORT_PRIORITY = {
  466:   BILL_REQUESTED: 0,
  467:   STALE: 0,
  468:   NEW: 1,
  469:   READY: 2,
  470:   ALL_SERVED: 3,
  471:   PREPARING: 4,
  472: };
  473: 
  474: const ALL_CHANNELS = ["hall", "pickup", "delivery"];
  475: const ALL_ASSIGN_FILTERS = ["mine", "others", "free"];
  476: 
  477: const POLLING_OPTIONS = [
  478:   { value: 5000, label: "5с" },
  479:   { value: 15000, label: "15с" },
  480:   { value: 30000, label: "30с" },
  481:   { value: 60000, label: "60с" },
  482:   { value: 0, label: "Вручную" },
  483: ];
  484: 
  485: const DEFAULT_POLLING_INTERVAL = 5000;
  486: const DEFAULT_SORT_MODE = "priority";
  487: const DEFAULT_SORT_ORDER = "newest";
  488: 
  489: /* ═══════════════════════════════════════════════════════════════════════════
  490:    HELPERS
  491: ═══════════════════════════════════════════════════════════════════════════ */
  492: 
  493: function isRateLimitError(error) {
  494:   if (!error) return false;
  495:   const msg = error.message || error.toString() || "";
  496:   return msg.toLowerCase().includes("rate limit") || msg.includes("429");
  497: }
  498: 
  499: function shouldRetry(failureCount, error) {
  500:   if (isRateLimitError(error)) return false;
  501:   return failureCount < 2;
  502: }
  503: 
  504: // D1-006: Normalize link fields (type-safe: string/number/object/value-object)
  505: function getLinkId(field) {
  506:   if (field == null) return null; // only null/undefined
  507: 
  508:   if (typeof field === "string" || typeof field === "number") return String(field);
  509: 
  510:   if (typeof field === "object") {
  511:     const v = field.id ?? field._id ?? field.value ?? null;
  512: 
  513:     if (typeof v === "string" || typeof v === "number") return String(v);
  514: 
  515:     if (v && typeof v === "object") {
  516:       const vv = v.id ?? v._id ?? null;
  517:       if (typeof vv === "string" || typeof vv === "number") return String(vv);
  518:     }
  519:   }
  520: 
  521:   return null;
  522: }
  523: /*
  524:     <div data-group-id={group.id} className={`mb-3 rounded-lg border border-slate-200 overflow-hidden transition-all duration-300 ${style.bgClass} ${style.borderClass} ${highlightRing}`}>
  525:       <div className="px-4 pt-3 pb-3 cursor-pointer active:opacity-80" onClick={onToggleExpand} role="button" aria-expanded={isExpanded} aria-label={group.type === "table" ? identifier : `${identifier}: ${statusLabel}`}>
  526:         {group.type === "table" ? (
  527:           <div className="space-y-2">
  528:             <div className="flex items-start justify-between gap-3">
  529:               <div className="flex items-center gap-2 min-w-0">
  530:                 {ownershipState === "mine" ? (
  531:                   <span className="shrink-0"><Star className="w-4 h-4 fill-yellow-400 text-yellow-400" /></span>
  532:                 ) : ownershipState === "other" ? (
  533:                   <button type="button" onClick={showOtherTableHint} className="shrink-0 rounded-full p-0.5 -m-0.5" aria-label={HALL_UI_TEXT.otherTableTitle}>
  534:                     <Lock className="w-4 h-4 text-slate-400" />
  535:                   </button>
  536:                 ) : (
  537:                   <span className="shrink-0"><Star className="w-4 h-4 text-slate-300" /></span>
  538:                 )}
  539:                 <span className="inline-flex min-w-[2rem] items-center justify-center rounded-lg bg-slate-900 px-2.5 py-1 text-sm font-bold text-white">{compactTableLabel}</span>
  540:                 {tableData?.zone_name && <span className="rounded-full bg-white/80 px-2 py-1 text-[11px] font-medium text-slate-600 border border-slate-200 truncate">{tableData.zone_name}</span>}
  541:               </div>
  542:               {isExpanded && <span className="text-xs font-semibold text-slate-500 shrink-0">{HALL_UI_TEXT.collapse}</span>}
  543:             </div>
  544:             {ownerHintVisible && (
  545:               <div className="rounded-lg bg-slate-900 px-3 py-2 text-white">
  546:                 <div className="text-xs font-semibold">{HALL_UI_TEXT.otherTableTitle}</div>
  547:                 <div className="text-[11px] text-slate-200">{HALL_UI_TEXT.otherTableHint}</div>
  548:               </div>
  549:             )}
  550:             {hallSummaryItems.length > 0 ? (
  551:               <div className="flex flex-wrap items-center gap-x-3 gap-y-1">{hallSummaryItems.map(renderHallSummaryItem)}</div>
  552:             ) : (
  553:               <div className="text-xs text-slate-400">{HALL_UI_TEXT.noActions}</div>
  554:             )}
  555:           </div>
  556:         ) : (
  557:           <React.Fragment>
  558:             <div className="flex items-start justify-between gap-2 mb-1">
  559:               <span className="font-bold text-base leading-tight flex-1 min-w-0 text-slate-900 truncate">{identifier}</span>
  560:               <span className={`text-xs font-medium shrink-0 flex items-center gap-0.5 ${isOverdue ? "text-red-600" : "text-slate-500"}`}>
  561:                 <Clock className={`w-3 h-3 ${isOverdue ? "text-red-500" : ""}`} />
  562:                 {elapsedLabel}
  563:               </span>
  564:             </div>
  565:             <div className="flex items-center gap-1.5 mb-1 flex-wrap">
  566:               <span className="flex items-center gap-1 text-xs text-slate-500"><ChannelIcon className="w-3.5 h-3.5" />{channelConfig.label}</span>
  567:               <span className="text-slate-300">{'\u00B7'}</span>
  568:               <span className={`text-xs font-semibold ${style.textClass || "text-slate-700"}`}>{statusLabel}</span>
  569:               {(newOrders.length > 0 || readyOrders.length > 0) && <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />}
  570:               {contactInfo && (contactInfo.name || contactInfo.phone) && (
  571:                 <React.Fragment>
  572:                   <span className="text-xs text-slate-500 ml-auto truncate max-w-[120px]">{contactInfo.name || ""}</span>
  573:                   {contactInfo.phone && <a href={`tel:${contactInfo.phone}`} onClick={(event) => event.stopPropagation()} className="text-xs text-blue-600 shrink-0">+7{'\u2026'}{contactInfo.phone.slice(-4)}</a>}
  574:                 </React.Fragment>
  575:               )}
  576:             </div>
  577:             {legacySummaryLines.length > 0 ? (
  578:               <div className="space-y-0.5 mt-0.5">
  579:                 {legacySummaryLines.map((line) => (
  580:                   <div key={line.key} className="text-xs text-slate-700 flex items-center gap-1 leading-snug">
  581:                     <span className="font-medium">{`${line.count} ${line.label}`}</span>
  582:                     <span className="text-slate-300">{'\u00B7'}</span>
  583:                     <span>{`${line.ageMin} \u043C\u0438\u043D`}</span>
  584:                   </div>
  585:                 ))}
  586:               </div>
  587:             ) : (
  588:               <div className="text-xs text-slate-400">{'\u041D\u0435\u0442 \u0430\u043A\u0442\u0438\u0432\u043D\u044B\u0445 \u0437\u0430\u043A\u0430\u0437\u043E\u0432'}</div>
  589:             )}
  590:           </React.Fragment>
  591:         )}
  592:       </div>
  593: 
  594:       <div className={`overflow-hidden transition-all duration-200 ease-out ${isExpanded ? "max-h-[3000px] opacity-100" : "max-h-0 opacity-0"}`}>
  595:         <div className="border-t border-slate-200 px-4 py-3 space-y-4">
  596:           {group.type === "table" ? (
  597:             <React.Fragment>
  598:               <div className="rounded-xl border border-slate-200 bg-white/80 p-3 space-y-2">
  599:                 <div className="flex items-center justify-between gap-3">
  600:                   <div className="flex items-center gap-2 min-w-0">
  601:                     {ownershipState === "mine" ? <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 shrink-0" /> : ownershipState === "other" ? <button type="button" onClick={showOtherTableHint} className="shrink-0 rounded-full p-0.5 -m-0.5" aria-label={HALL_UI_TEXT.otherTableTitle}><Lock className="w-4 h-4 text-slate-400 shrink-0" /></button> : <Star className="w-4 h-4 text-slate-300 shrink-0" />}
  602:                     <span className="inline-flex min-w-[2rem] items-center justify-center rounded-lg bg-slate-900 px-2.5 py-1 text-sm font-bold text-white">{compactTableLabel}</span>
  603:                     {tableData?.zone_name && <span className="rounded-full bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-600 border border-slate-200">{tableData.zone_name}</span>}
  604:                   </div>
  605:                   <button type="button" onClick={onToggleExpand} className="text-xs font-semibold text-slate-500 min-h-[36px]">{HALL_UI_TEXT.collapse}</button>
  606:                 </div>
  607:                 {ownerHintVisible && <div className="rounded-lg bg-slate-900 px-3 py-2 text-white"><div className="text-xs font-semibold">{HALL_UI_TEXT.otherTableTitle}</div><div className="text-[11px] text-slate-200">{HALL_UI_TEXT.otherTableHint}</div></div>}
  608:                 <div className="flex flex-wrap items-center gap-x-3 gap-y-1">{hallSummaryItems.length > 0 ? hallSummaryItems.map(renderHallSummaryItem) : <span className="text-xs text-slate-400">{HALL_UI_TEXT.noActions}</span>}</div>
  609:                 {billData && billData.total > 0 && <div className="text-xs font-semibold text-slate-700">{`${HALL_UI_TEXT.bill} \u00B7 ${HALL_UI_TEXT.total} ${formatHallMoney(billData.total)}`}</div>}
  610:               </div>
  611: 
  612:               {tableRequests.length > 0 && (
  613:                 <div>
  614:                   <div className="mb-2 flex items-center justify-between gap-3">
  615:                     <div className="text-[11px] font-bold uppercase tracking-wider text-violet-600"><span className="bg-violet-50 rounded-md px-2 py-0.5">{`${HALL_UI_TEXT.requests} (${tableRequests.length})`}</span></div>
  616:                     {tableRequests.length > 1 && (() => { const allNew = tableRequests.every(r => !r.status || r.status === 'new' || r.status === 'open'); const allAccepted = tableRequests.every(r => r.status === 'accepted'); if (allNew) return <button type="button" onClick={() => tableRequests.forEach(r => onCloseRequest(r.id, 'accepted', { assignee: effectiveUserId, assigned_at: new Date().toISOString() }))} disabled={isRequestPending} className="rounded-lg border border-violet-200 bg-violet-50 px-3 py-2 text-xs font-semibold text-violet-700 min-h-[36px] active:scale-[0.98] disabled:opacity-60">{`${HALL_UI_TEXT.acceptAllRequests} (${tableRequests.length})`}</button>; if (allAccepted) return <button type="button" onClick={() => tableRequests.forEach(r => onCloseRequest(r.id, 'done'))} disabled={isRequestPending} className="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-xs font-semibold text-green-700 min-h-[36px] active:scale-[0.98] disabled:opacity-60">{`${HALL_UI_TEXT.serveAllRequests} (${tableRequests.length})`}</button>; return null; })()}
  617:                   </div>
  618:                   <div className="space-y-1.5">
  619:                     {tableRequests.map((request) => {
  620:                       const ageMin = getAgeMinutes(request.created_date);
  621:                       const label = REQUEST_TYPE_LABELS[request.request_type] || request.request_type;
  622:                       const isAccepted = request.status === 'accepted';
  623:                       const isAssignedToMe = request.assignee === effectiveUserId;
  624:                       return (
  625:                         <div key={request.id} className="rounded-lg border border-violet-200 bg-violet-50/80 px-3 py-2">
  626:                           <div className="flex items-center gap-3">
  627:                             <div className="min-w-0 flex-1">
  628:                               <div className="flex items-center gap-2 min-w-0">
  629:                                 <span className="truncate text-sm font-medium text-slate-900">{label}</span>
  630:                                 <span className="text-xs text-violet-500 shrink-0">{formatCompactMinutes(ageMin)}</span>
  631:                                 {isAccepted && isAssignedToMe && staffName && <span className="shrink-0 rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-medium text-blue-700">{staffName}</span>}
  632:                               </div>
  633:                               {request.comment && <div className="mt-0.5 text-xs text-slate-500 truncate">{request.comment}</div>}
  634:                             </div>
  635:                             {onCloseRequest && (isAccepted ? <button type="button" onClick={() => onCloseRequest(request.id, "done")} disabled={isRequestPending} className="shrink-0 rounded-lg border border-green-200 bg-white px-3 py-2 text-xs font-semibold text-green-700 min-h-[36px] active:scale-[0.98] disabled:opacity-60">{HALL_UI_TEXT.serveRequest}</button> : <button type="button" onClick={() => onCloseRequest(request.id, "accepted", { assignee: effectiveUserId, assigned_at: new Date().toISOString() })} disabled={isRequestPending} className="shrink-0 rounded-lg border border-blue-200 bg-white px-3 py-2 text-xs font-semibold text-blue-700 min-h-[36px] active:scale-[0.98] disabled:opacity-60">{HALL_UI_TEXT.acceptRequest}</button>)}
  636:                           </div>
  637:                         </div>
  638:                       );
  639:                     })}
  640:                   </div>
  641:                 </div>
  642:               )}
  643: 
  644:               {newOrders.length > 0 && (
  645:                 <div>
  646:                   <div className="flex items-center justify-between gap-3 mb-2">
  647:                     <div className="text-[11px] font-bold uppercase tracking-wider text-blue-600"><span className="bg-blue-50 rounded-md px-2 py-0.5">{`${HALL_UI_TEXT.new} (${newOrders.length} ${pluralRu(newOrders.length, HALL_UI_TEXT.guests + '\u044C', HALL_UI_TEXT.guests + '\u044F', HALL_UI_TEXT.guests + '\u0435\u0439')} \u00B7 ${countRows(newRows, newOrders.length)} ${pluralRu(countRows(newRows, newOrders.length), HALL_UI_TEXT.dishes + '\u043E', HALL_UI_TEXT.dishes + '\u0430', HALL_UI_TEXT.dishes)})`}</span></div>
  648:                     <button type="button" onClick={() => handleOrdersAction(newOrders)} disabled={advanceMutation.isPending} className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700 min-h-[36px] active:scale-[0.98] disabled:opacity-60">{getOrderActionMeta(newOrders[0]).willServe ? HALL_UI_TEXT.serveAll : HALL_UI_TEXT.acceptAll}</button>
  649:                   </div>
  650:                   {renderHallRows(newRows, "blue")}
  651:                 </div>
  652:               )}
  653: 
  654:               {inProgressSections.length > 0 && (
  655:                 <div>
  656:                   <button type="button" onClick={() => setInProgressExpanded((prev) => !prev)} className="mb-2 flex w-full items-center justify-between text-left">
  657:                     <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 opacity-60">{`${HALL_UI_TEXT.inProgress} (${inProgressOrders.length} ${pluralRu(inProgressOrders.length, HALL_UI_TEXT.guests + '\u044C', HALL_UI_TEXT.guests + '\u044F', HALL_UI_TEXT.guests + '\u0435\u0439')} \u00B7 ${inProgressSections.reduce((sum, section) => sum + section.rowCount, 0)} ${pluralRu(inProgressSections.reduce((sum, section) => sum + section.rowCount, 0), HALL_UI_TEXT.dishes + '\u043E', HALL_UI_TEXT.dishes + '\u0430', HALL_UI_TEXT.dishes)})`}</span>
  658:                     <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${inProgressExpanded ? "rotate-180" : ""}`} />
  659:                   </button>
  660:                   {inProgressExpanded && (
  661:                     <div className="space-y-3 opacity-60">
  662:                       {inProgressSections.map((section) => {
  663:                         const isSubExpanded = !!expandedSubGroups[section.sid];
  664:                         return (
  665:                           <div key={section.sid}>
  666:                             <div className="mb-1.5 flex items-center justify-between gap-3 cursor-pointer" onClick={() => setExpandedSubGroups((prev) => ({ ...prev, [section.sid]: !prev[section.sid] }))}>
  667:                               <div className="flex items-center gap-2 min-w-0">
  668:                                 <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${isSubExpanded ? "rotate-180" : ""}`} />
  669:                                 <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 opacity-60">{`${section.label} (${section.rowCount})`}</span>
  670:                               </div>
  671:                               <button type="button" onClick={(event) => { event.stopPropagation(); handleOrdersAction(section.orders); }} disabled={advanceMutation.isPending} className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-700 min-h-[36px] active:scale-[0.98] disabled:opacity-60">{section.bulkLabel}</button>
  672:                             </div>
  673:                             {isSubExpanded && renderHallRows(section.rows, "amber")}
  674:                           </div>
  675:                         );
  676:                       })}
  677:                     </div>
  678:                   )}
  679:                 </div>
  680:               )}
  681: 
  682:               {readyOrders.length > 0 && (
  683:                 <div>
  684:                   <div className="flex items-center justify-between gap-3 mb-2">
  685:                     <div className="text-[11px] font-bold uppercase tracking-wider text-green-600"><span className="bg-green-50 rounded-md px-2 py-0.5">{`${HALL_UI_TEXT.ready} (${readyOrders.length} ${pluralRu(readyOrders.length, HALL_UI_TEXT.guests + '\u044C', HALL_UI_TEXT.guests + '\u044F', HALL_UI_TEXT.guests + '\u0435\u0439')} \u00B7 ${countRows(readyRows, readyOrders.length)} ${pluralRu(countRows(readyRows, readyOrders.length), HALL_UI_TEXT.dishes + '\u043E', HALL_UI_TEXT.dishes + '\u0430', HALL_UI_TEXT.dishes)})`}</span></div>
  686:                     <button type="button" onClick={() => handleOrdersAction(readyOrders)} disabled={advanceMutation.isPending} className="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-xs font-semibold text-green-700 min-h-[36px] active:scale-[0.98] disabled:opacity-60">{HALL_UI_TEXT.serveAll}</button>
  687:                   </div>
  688:                   {renderHallRows(readyRows, "green")}
  689:                 </div>
  690:               )}
  691: 
  692:               {servedOrders.length > 0 && (
  693:                 <div>
  694:                   <button type="button" onClick={() => setServedExpanded((prev) => !prev)} className="mb-2 flex w-full items-center justify-between text-left">
  695:                     <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 opacity-60">{`${HALL_UI_TEXT.served} (${countRows(servedRows, servedOrders.length)})`}</span>
  696:                     <span className="text-xs font-medium text-slate-400">{servedExpanded ? HALL_UI_TEXT.hide : HALL_UI_TEXT.show}</span>
  697:                   </button>
  698:                   {servedExpanded && <div className="opacity-60">{renderHallRows(servedRows, "slate", true)}</div>}
  699:                 </div>
  700:               )}
  701: 
  702:               {billData && billData.total > 0 && (
  703:                 <div className={`rounded-xl border p-3 ${hasBillRequest ? "border-violet-300 bg-violet-50/80" : "border-slate-200 bg-slate-50"}`}>
  704:                   <button type="button" onClick={() => setBillExpanded((prev) => !prev)} className="flex w-full items-start justify-between gap-3 text-left">
  705:                     <div className="min-w-0 flex-1">
  706:                       <div className="text-[11px] font-bold uppercase tracking-wider text-slate-600">{HALL_UI_TEXT.bill}</div>
  707:                       <div className="mt-1 text-sm font-semibold text-slate-900">{`${HALL_UI_TEXT.total} ${formatHallMoney(billData.total)}`}</div>
  708:                       {!billExpanded && billData.remaining < billData.total && <div className="mt-1 text-xs text-slate-500">{`${HALL_UI_TEXT.remaining} ${formatHallMoney(billData.remaining)}`}</div>}
  709:                     </div>
  710:                     {billExpanded ? <ChevronUp className="w-4 h-4 text-slate-400 mt-1" /> : <ChevronDown className="w-4 h-4 text-slate-400 mt-1" />}
  711:                   </button>
  712:                   {billExpanded && (
  713:                     <div className="mt-3 space-y-2 border-t border-slate-200 pt-3">
  714:                       {billData.guests.map((guest, index) => <div key={`${guest.id}:${index}`} className="flex items-center justify-between gap-3 text-sm"><span className="text-slate-600">{guest.name}</span><span className="font-medium text-slate-900">{formatHallMoney(guest.total)}</span></div>)}
  715:                       <div className="border-t border-slate-200 pt-2 space-y-1 text-sm">
  716:                         <div className="flex items-center justify-between gap-3"><span className="text-slate-500">{HALL_UI_TEXT.paid}</span><span className="font-medium text-slate-700">{formatHallMoney(billData.paid)}</span></div>
  717:                         <div className="flex items-center justify-between gap-3 font-semibold text-slate-900"><span>{HALL_UI_TEXT.remaining}</span><span>{formatHallMoney(billData.remaining)}</span></div>
  718:                       </div>
  719:                     </div>
  720:                   )}
  721:                 </div>
  722:               )}
  723: 
  724:               {onCloseTable && group.orders.length > 0 && (
  725:                 <div className="pt-2 border-t border-slate-200">
  726:                   <button type="button" onClick={handleCloseTableClick} disabled={!!closeDisabledReason} className={`w-full min-h-[44px] flex items-center justify-center gap-2 font-medium text-sm rounded-lg border transition-all active:scale-[0.99] ${closeDisabledReason ? "bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed" : "bg-red-50 text-red-600 border-red-200 hover:bg-red-100"}`}>
  727:                     <X className="w-4 h-4" />
  728:                     {HALL_UI_TEXT.closeTable}
  729:                   </button>
  730:                   {closeDisabledReasons.length > 0 && <div className="mt-1 space-y-0.5">{closeDisabledReasons.map((reason, i) => <p key={i} className="text-[10px] text-slate-400 text-center">{reason}</p>)}</div>}
  731:                 </div>
  732:               )}
  733:             </React.Fragment>
  734:           ) : (
  735:             <React.Fragment>
  736:               {newOrders.length > 0 && <div><div className="flex items-center justify-between mb-2"><p className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">{`\u041D\u043E\u0432\u044B\u0435 (${newOrders.length})`}</p><button type="button" onClick={() => handleOrdersAction(newOrders)} disabled={advanceMutation.isPending} className="text-xs font-semibold text-blue-600 bg-blue-50 border border-blue-200 px-3 py-1 rounded min-h-[44px] active:scale-95 disabled:opacity-60">{'\u041F\u0440\u0438\u043D\u044F\u0442\u044C \u0432\u0441\u0435'}</button></div><div className="space-y-2">{newOrders.map(renderLegacyOrderCard)}</div></div>}
  737:               {readyOrders.length > 0 && <div><div className="flex items-center justify-between mb-2"><p className="text-[11px] font-bold text-green-600 uppercase tracking-wider">{`\u0413\u043E\u0442\u043E\u0432\u043E \u043A \u0432\u044B\u0434\u0430\u0447\u0435 (${readyOrders.length})`}</p><button type="button" onClick={() => handleOrdersAction(readyOrders)} disabled={advanceMutation.isPending} className="text-xs font-semibold text-green-600 bg-green-50 border border-green-200 px-3 py-1 rounded min-h-[44px] active:scale-95 disabled:opacity-60">{'\u0412\u044B\u0434\u0430\u0442\u044C \u0432\u0441\u0435'}</button></div><div className="space-y-2">{readyOrders.map(renderLegacyOrderCard)}</div></div>}
  738:               {inProgressOrders.length > 0 && (
  739:                 <div>
  740:                   <div className="flex items-center justify-between mb-2 cursor-pointer min-h-[44px]" onClick={() => setInProgressExpanded((prev) => !prev)}>
  741:                     <p className="text-[11px] font-bold text-amber-600 uppercase tracking-wider">{`\u0412 \u0440\u0430\u0431\u043E\u0442\u0435 (${inProgressOrders.length})`}</p>
  742:                     <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${inProgressExpanded ? "rotate-180" : ""}`} />
  743:                   </div>
  744:                   {inProgressExpanded && <div className="space-y-3">{subGroups.map(({ sid, orders, cfg }) => { const isSubExpanded = !!expandedSubGroups[sid]; const actionMeta = getOrderActionMeta(orders[0]); const subGroupLabel = sid === "__null__" ? '\u0412 \u0420\u0410\u0411\u041E\u0422\u0415' : cfg.label; if (subGroups.length === 1) return <div key={sid} className="space-y-2">{orders.map(renderLegacyOrderCard)}</div>; return <div key={sid}><div className="flex items-center justify-between mb-1.5 cursor-pointer min-h-[44px]" onClick={() => setExpandedSubGroups((prev) => ({ ...prev, [sid]: !prev[sid] }))}><div className="flex items-center gap-2"><ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${isSubExpanded ? "rotate-180" : ""}`} /><span className="text-[11px] font-bold text-amber-600 uppercase tracking-wider">{`${subGroupLabel} (${orders.length})`}</span></div><button type="button" onClick={(event) => { event.stopPropagation(); handleOrdersAction(orders); }} disabled={advanceMutation.isPending} className="text-xs font-semibold text-amber-600 bg-amber-50 border border-amber-200 px-3 py-1 rounded min-h-[36px] active:scale-95 disabled:opacity-60">{actionMeta.bulkLabel}</button></div>{isSubExpanded && <div className="space-y-2">{orders.map(renderLegacyOrderCard)}</div>}</div>; })}</div>}
  745:                 </div>
  746:               )}
  747:               {contactInfo && (
  748:                 <div className="space-y-2 pt-2 border-t border-slate-200">
  749:                   {contactInfo.name && <div className="flex items-center gap-2 text-sm"><User className="w-4 h-4 text-slate-400" /><span className="text-slate-700">{contactInfo.name}</span></div>}
  750:                   {contactInfo.phone && <div className="flex items-center gap-2 text-sm"><Phone className="w-4 h-4 text-slate-400" /><a href={`tel:${contactInfo.phone}`} className="text-blue-600 underline">{contactInfo.phone}</a></div>}
  751:                   {contactInfo.address && <div className="flex items-center gap-2 text-sm"><MapPin className="w-4 h-4 text-slate-400" /><span className="text-slate-600">{contactInfo.address}</span></div>}
  752:                 </div>
  753:               )}
  754:             </React.Fragment>
  755:           )}
  756:         </div>
  757:       </div>
  758:     </div>
  759:   );
  760: }
  761: 
  762: */
  763: function getAssignee(order) {
  764:   return order.assignee || null;
  765: }
  766: 
  767: function getAssigneeId(order) {
  768:   return getLinkId(order.assignee);
  769: }
  770: 
  771: function isOrderFree(order) {
  772:   return !getLinkId(order.assignee);
  773: }
  774: 
  775: function isOrderMine(order, effectiveUserId) {
  776:   if (!effectiveUserId) return false;
  777:   const assigneeId = getAssigneeId(order);
  778:   if (!assigneeId) return false;
  779:   return assigneeId === effectiveUserId;
  780: }
  781: 
  782: function safeParseDate(dateStr) {
  783:   if (!dateStr) return new Date();
  784:   try {
  785:     const safe = !String(dateStr).endsWith("Z") ? `${dateStr}Z` : dateStr;
  786:     const d = new Date(safe);
  787:     if (isNaN(d.getTime())) return new Date();
  788:     return d;
  789:   } catch {
  790:     return new Date();
  791:   }
  792: }
  793: 
  794: /**
  795:  * Calculate when current shift started based on working_hours
  796:  * @param {Object} workingHours - partner.working_hours object
  797:  * @returns {Date} - shift start datetime
  798:  */
  799: function getShiftStartTime(workingHours) {
  800:   const FALLBACK_HOURS = 12;
  801:   const now = new Date();
  802:   
  803:   // No working hours → fallback to start of today
  804:   if (!workingHours || typeof workingHours !== 'object') {
  805:     const startOfToday = new Date(now);
  806:     startOfToday.setHours(0, 0, 0, 0);
  807:     return startOfToday;
  808:   }
  809:   
  810:   const dayKeys = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
  811:   const todayIndex = now.getDay(); // 0=Sun, 1=Mon, ...
  812:   const todayKey = dayKeys[todayIndex];
  813:   const yesterdayKey = dayKeys[(todayIndex + 6) % 7];
  814:   
  815:   const todayHours = workingHours[todayKey];
  816:   const yesterdayHours = workingHours[yesterdayKey];
  817:   
  818:   const nowMinutes = now.getHours() * 60 + now.getMinutes();
  819:   
  820:   // Parse time string "HH:MM" to minutes since midnight
  821:   const parseTime = (timeStr) => {
  822:     if (!timeStr) return null;
  823:     const [h, m] = timeStr.split(':').map(Number);
  824:     return h * 60 + m;
  825:   };
  826:   
  827:   // Check if we're still in yesterday's overnight shift
  828:   if (yesterdayHours?.active) {
  829:     const yOpen = parseTime(yesterdayHours.open);
  830:     const yClose = parseTime(yesterdayHours.close);
  831:     
  832:     // Overnight shift: close < open (e.g., 01:29 < 10:00)
  833:     if (yClose !== null && yOpen !== null && yClose < yOpen) {
  834:       // We're in overnight portion if now < close time
  835:       if (nowMinutes < yClose) {
  836:         // Shift started yesterday at open time
  837:         const shiftStart = new Date(now);
  838:         shiftStart.setDate(shiftStart.getDate() - 1);
  839:         shiftStart.setHours(Math.floor(yOpen / 60), yOpen % 60, 0, 0);
  840:         return shiftStart;
  841:       }
  842:     }
  843:   }
  844:   
  845:   // Check today's shift
  846:   if (todayHours?.active) {
  847:     const tOpen = parseTime(todayHours.open);
  848:     
  849:     if (tOpen !== null && nowMinutes >= tOpen) {
  850:       // Shift started today at open time
  851:       const shiftStart = new Date(now);
  852:       shiftStart.setHours(Math.floor(tOpen / 60), tOpen % 60, 0, 0);
  853:       return shiftStart;
  854:     }
  855:   }
  856:   
  857:   // Before today's opening: find most recent shift start
  858:   // Check yesterday's opening
  859:   if (yesterdayHours?.active) {
  860:     const yOpen = parseTime(yesterdayHours.open);
  861:     if (yOpen !== null) {
  862:       const shiftStart = new Date(now);
  863:       shiftStart.setDate(shiftStart.getDate() - 1);
  864:       shiftStart.setHours(Math.floor(yOpen / 60), yOpen % 60, 0, 0);
  865:       return shiftStart;
  866:     }
  867:   }
  868:   
  869:   // Fallback: start of today
  870:   const startOfToday = new Date(now);
  871:   startOfToday.setHours(0, 0, 0, 0);
  872:   return startOfToday;
  873: }
  874: 
  875: 
  876: function formatRelativeTime(dateStr) {
  877:   const date = safeParseDate(dateStr);
  878:   return formatDistanceToNow(date, { addSuffix: true, locale: ru });
  879: }
  880: 
  881: function genDeviceId() {
  882:   try {
  883:     if (crypto?.randomUUID) return crypto.randomUUID();
  884:   } catch { /* ignore */ }
  885:   return `dev_${Math.random().toString(16).slice(2)}_${Date.now()}`;
  886: }
  887: 
  888: function getOrCreateDeviceId() {
  889:   try {
  890:     const existing = localStorage.getItem(DEVICE_ID_STORAGE_KEY);
  891:     if (existing) return existing;
  892:     const id = genDeviceId();
  893:     localStorage.setItem(DEVICE_ID_STORAGE_KEY, id);
  894:     return id;
  895:   } catch {
  896:     return genDeviceId();
  897:   }
  898: }
  899: 
  900: function loadNotifPrefs() {
  901:   const defaults = { enabled: true, sound: false, vibrate: true, system: false };
  902:   try {
  903:     const raw = localStorage.getItem(NOTIF_PREFS_STORAGE_KEY);
  904:     if (!raw) return defaults;
  905:     return { ...defaults, ...JSON.parse(raw) };
  906:   } catch {
  907:     return defaults;
  908:   }
  909: }
  910: 
  911: function saveNotifPrefs(prefs) {
  912:   try {
  913:     localStorage.setItem(NOTIF_PREFS_STORAGE_KEY, JSON.stringify(prefs));
  914:   } catch { /* ignore */ }
  915: }
  916: 
  917: function loadPollingInterval() {
  918:   try {
  919:     const raw = sessionStorage.getItem(POLLING_INTERVAL_KEY);
  920:     if (!raw) return DEFAULT_POLLING_INTERVAL;
  921:     const val = parseInt(raw, 10);
  922:     if (POLLING_OPTIONS.some((o) => o.value === val)) return val;
  923:     return DEFAULT_POLLING_INTERVAL;
  924:   } catch {
  925:     return DEFAULT_POLLING_INTERVAL;
  926:   }
  927: }
  928: 
  929: function savePollingInterval(val) {
  930:   try {
  931:     sessionStorage.setItem(POLLING_INTERVAL_KEY, String(val));
  932:   } catch { /* ignore */ }
  933: }
  934: 
  935: function loadSortMode() {
  936:   try {
  937:     const raw = sessionStorage.getItem(SORT_MODE_KEY);
  938:     if (raw === "priority" || raw === "time") return raw;
  939:     return DEFAULT_SORT_MODE;
  940:   } catch {
  941:     return DEFAULT_SORT_MODE;
  942:   }
  943: }
  944: 
  945: function saveSortMode(val) {
  946:   try {
  947:     sessionStorage.setItem(SORT_MODE_KEY, val);
  948:   } catch { /* ignore */ }
  949: }
  950: 
  951: function loadSortOrder() {
  952:   try {
  953:     const raw = sessionStorage.getItem(SORT_ORDER_KEY);
  954:     if (raw === "newest" || raw === "oldest") return raw;
  955:     return DEFAULT_SORT_ORDER;
  956:   } catch {
  957:     return DEFAULT_SORT_ORDER;
  958:   }
  959: }
  960: 
  961: function saveSortOrder(val) {
  962:   try {
  963:     sessionStorage.setItem(SORT_ORDER_KEY, val);
  964:   } catch { /* ignore */ }
  965: }
  966: 
  967: function getMyTablesKey(userIdOrToken) {
  968:   return `staff_my_tables_${userIdOrToken || "anon"}`;
  969: }
  970: 
  971: function loadMyTables(userIdOrToken) {
  972:   try {
  973:     const raw = localStorage.getItem(getMyTablesKey(userIdOrToken));
  974:     return raw ? JSON.parse(raw) : [];
  975:   } catch {
  976:     return [];
  977:   }
  978: }
  979: 
  980: function saveMyTables(userIdOrToken, tables) {
  981:   try {
  982:     localStorage.setItem(getMyTablesKey(userIdOrToken), JSON.stringify(tables));
  983:   } catch { /* ignore */ }
  984: }
  985: 
  986: function tryVibrate(enabled) {
  987:   if (!enabled) return;
  988:   try {
  989:     if (navigator?.vibrate) navigator.vibrate(60);
  990:   } catch { /* ignore */ }
  991: }
  992: 
  993: function createBeep() {
  994:   try {
  995:     const AudioCtx = window.AudioContext || window.webkitAudioContext;
  996:     if (!AudioCtx) return null;
  997:     const ctx = new AudioCtx();
  998:     return {
  999:       ctx,
 1000:       play: () => {
 1001:         const o = ctx.createOscillator();
 1002:         const g = ctx.createGain();
 1003:         o.type = "sine";
 1004:         o.frequency.value = 880;
 1005:         g.gain.value = 0.03;
 1006:         o.connect(g);
 1007:         g.connect(ctx.destination);
 1008:         o.start();
 1009:         o.stop(ctx.currentTime + 0.08);
 1010:       },
 1011:       resume: async () => {
 1012:         try {
 1013:           if (ctx.state === "suspended") await ctx.resume();
 1014:         } catch { /* ignore */ }
 1015:       },
 1016:     };
 1017:   } catch {
 1018:     return null;
 1019:   }
 1020: }
 1021: 
 1022: function canUseNotifications() {
 1023:   try {
 1024:     return typeof Notification !== "undefined";
 1025:   } catch {
 1026:     return false;
 1027:   }
 1028: }
 1029: 
 1030: function clearAllStaffData() {
 1031:   try {
 1032:     localStorage.removeItem(DEVICE_ID_STORAGE_KEY);
 1033:     localStorage.removeItem(NOTIF_PREFS_STORAGE_KEY);
 1034:     sessionStorage.removeItem(POLLING_INTERVAL_KEY);
 1035:     sessionStorage.removeItem(SORT_MODE_KEY);
 1036:     sessionStorage.removeItem(SORT_ORDER_KEY);
 1037:     // Clear all staff_my_tables_* keys
 1038:     Object.keys(localStorage).forEach(key => {
 1039:       if (key.startsWith('staff_my_tables_')) {
 1040:         localStorage.removeItem(key);
 1041:       }
 1042:     });
 1043:   } catch { /* ignore */ }
 1044: }
 1045: 
 1046: /**
 1047:  * Фильтрует этапы по каналу заказа (ORD-001, ORD-003)
 1048:  * @param {Object} order - заказ с order_type
 1049:  * @param {Array} stages - все этапы партнёра (sorted)
 1050:  * @returns {Array} - отфильтрованные этапы
 1051:  */
 1052: function getStagesForOrder(order, stages) {
 1053:   if (!order?.order_type || !stages?.length) return stages || [];
 1054:   
 1055:   const filtered = stages.filter(stage => {
 1056:     switch (order.order_type) {
 1057:       case 'hall': 
 1058:         return stage.enabled_hall !== false; // default true
 1059:       case 'pickup': 
 1060:         return stage.enabled_pickup !== false;
 1061:       case 'delivery': 
 1062:         return stage.enabled_delivery !== false;
 1063:       default: 
 1064:         return true;
 1065:     }
 1066:   });
 1067:   
 1068:   // P0-1: Normalize stage_id before comparison
 1069:   const orderStageId = getLinkId(order.stage_id);
 1070:   
 1071:   // Edge case: если текущий этап не попал в список — добавить его
 1072:   if (orderStageId) {
 1073:     const currentStage = stages.find(s => getLinkId(s.id) === orderStageId);
 1074:     if (currentStage && !filtered.find(s => getLinkId(s.id) === getLinkId(currentStage.id))) {
 1075:       filtered.push(currentStage);
 1076:       filtered.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
 1077:     }
 1078:   }
 1079:   
 1080:   return filtered;
 1081: }
 1082: 
 1083: // V2-05: Compute table-level status from group orders + service requests
 1084: function computeTableStatus(group, activeRequests, getStatusConfig) {
 1085:   const orders = group.orders.filter(o => o.status !== 'cancelled');
 1086: 
 1087:   // 1. Bill request check (table groups only, highest priority)
 1088:   if (group.type === 'table') {
 1089:     const tableRequests = (activeRequests || []).filter(
 1090:       r => getLinkId(r.table) === group.id
 1091:     );
 1092:     const hasBillRequest = tableRequests.some(r => r.request_type === 'bill');
 1093:     if (hasBillRequest) return 'BILL_REQUESTED';
 1094:     if (tableRequests.length > 0 && orders.length === 0) return 'NEW';
 1095:   }
 1096: 
 1097:   if (orders.length === 0) return 'ALL_SERVED';
 1098: 
 1099:   // 2. Any order needs accepting (first stage)? — takes priority over STALE
 1100:   // v3.6.0: Moved before STALE so new orders clear ПРОСРОЧЕН label
 1101:   if (orders.some(o => getStatusConfig(o).isFirstStage)) return 'NEW';
 1102: 
 1103:   // 3. STALE: all orders have no assignee and oldest is >3 min (Free tab signal)
 1104:   const allFree = orders.every(o => !getLinkId(o.assignee));
 1105:   if (allFree) {
 1106:     const oldest = Math.min(...orders.map(o => safeParseDate(o.created_date).getTime()));
 1107:     if (Date.now() - oldest > 3 * 60 * 1000) return 'STALE';
 1108:   }
 1109: 
 1110:   // 4. All orders at finish stage → waiter should close the table
 1111:   if (orders.every(o => getStatusConfig(o).isFinishStage)) return 'ALL_SERVED';
 1112: 
 1113:   // 5. Some orders at finish stage (food ready, needs serving)
 1114:   if (orders.some(o => getStatusConfig(o).isFinishStage)) return 'READY';
 1115: 
 1116:   // 6. All in middle stages (kitchen working)
 1117:   return 'PREPARING';
 1118: }
 1119: 
 1120: 
 1121: /* ═══════════════════════════════════════════════════════════════════════════
 1122:    SUB-COMPONENTS
 1123: ═══════════════════════════════════════════════════════════════════════════ */
 1124: 
 1125: /* function RateLimitScreen({ onRetry }) {
 1126:   return (
 1127:     <div
 1128:       data-group-id={group.id}
 1129:       className={`mb-3 rounded-lg border border-slate-200 overflow-hidden transition-all duration-300 ${style.bgClass} ${style.borderClass} ${highlightRing}`}
 1130:     >
 1131:       <div
 1132:         className="px-4 pt-3 pb-3 cursor-pointer active:opacity-80"
 1133:         onClick={onToggleExpand}
 1134:         role="button"
 1135:         aria-expanded={isExpanded}
 1136:         aria-label={group.type === 'table' ? `${identifier}` : `${identifier}: ${statusLabel}`}
 1137:       >
 1138:         {group.type === 'table' ? (
 1139:           <div className="space-y-2">
 1140:             <div className="flex items-start justify-between gap-3">
 1141:               <div className="flex items-center gap-2 min-w-0">
 1142:                 {ownershipState === 'mine' ? (
 1143:                   <span className="shrink-0"><Star className="w-4 h-4 fill-yellow-400 text-yellow-400" /></span>
 1144:                 ) : ownershipState === 'other' ? (
 1145:                   <button type="button" onClick={showOtherTableHint} className="shrink-0 rounded-full p-0.5 -m-0.5" aria-label={HALL_UI_TEXT.otherTableTitle}>
 1146:                     <Lock className="w-4 h-4 text-slate-400" />
 1147:                   </button>
 1148:                 ) : (
 1149:                   <span className="shrink-0"><Star className="w-4 h-4 text-slate-300" /></span>
 1150:                 )}
 1151:                 <span className="inline-flex min-w-[2rem] items-center justify-center rounded-lg bg-slate-900 px-2.5 py-1 text-sm font-bold text-white">{compactTableLabel}</span>
 1152:                 {tableData?.zone_name && <span className="rounded-full bg-white/80 px-2 py-1 text-[11px] font-medium text-slate-600 border border-slate-200 truncate">{tableData.zone_name}</span>}
 1153:               </div>
 1154:               {isExpanded && <span className="text-xs font-semibold text-slate-500 shrink-0">{HALL_UI_TEXT.collapse}</span>}
 1155:             </div>
 1156:             {ownerHintVisible && (
 1157:               <div className="rounded-lg bg-slate-900 px-3 py-2 text-white">
 1158:                 <div className="text-xs font-semibold">{HALL_UI_TEXT.otherTableTitle}</div>
 1159:                 <div className="text-[11px] text-slate-200">{HALL_UI_TEXT.otherTableHint}</div>
 1160:               </div>
 1161:             )}
 1162:             {hallSummaryItems.length > 0 ? (
 1163:               <div className="flex flex-wrap items-center gap-x-3 gap-y-1">{hallSummaryItems.map(renderHallSummaryItem)}</div>
 1164:             ) : (
 1165:               <div className="text-xs text-slate-400">{HALL_UI_TEXT.noActions}</div>
 1166:             )}
 1167:           </div>
 1168:         ) : (
 1169:           <React.Fragment>
 1170:             <div className="flex items-start justify-between gap-2 mb-1">
 1171:               <span className="font-bold text-base leading-tight flex-1 min-w-0 text-slate-900 truncate">{identifier}</span>
 1172:               <span className={`text-xs font-medium shrink-0 flex items-center gap-0.5 ${isOverdue ? 'text-red-600' : 'text-slate-500'}`}>
 1173:                 <Clock className={`w-3 h-3 ${isOverdue ? 'text-red-500' : ''}`} />
 1174:                 {elapsedLabel}
 1175:               </span>
 1176:             </div>
 1177:             <div className="flex items-center gap-1.5 mb-1 flex-wrap">
 1178:               <span className="flex items-center gap-1 text-xs text-slate-500"><ChannelIcon className="w-3.5 h-3.5" />{channelConfig.label}</span>
 1179:               <span className="text-slate-300">{'\u00B7'}</span>
 1180:               <span className={`text-xs font-semibold ${style.textClass || 'text-slate-700'}`}>{statusLabel}</span>
 1181:               {needsAction && <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />}
 1182:               {contactInfo && (contactInfo.name || contactInfo.phone) && (
 1183:                 <React.Fragment>
 1184:                   <span className="text-xs text-slate-500 ml-auto truncate max-w-[120px]">{contactInfo.name || ''}</span>
 1185:                   {contactInfo.phone && <a href={`tel:${contactInfo.phone}`} onClick={e => e.stopPropagation()} className="text-xs text-blue-600 shrink-0">+7{'\u2026'}{contactInfo.phone.slice(-4)}</a>}
 1186:                 </React.Fragment>
 1187:               )}
 1188:             </div>
 1189:             {legacySummaryLines.length > 0 ? (
 1190:               <div className="space-y-0.5 mt-0.5">
 1191:                 {legacySummaryLines.map((line, idx) => (
 1192:                   <div key={idx} className="text-xs text-slate-700 flex items-center gap-1 leading-snug">
 1193:                     <span className="font-medium">{`${line.count} ${line.label}`}</span>
 1194:                     <span className="text-slate-300">{'\u00B7'}</span>
 1195:                     <span>{`${line.ageMin} \u043C\u0438\u043D`}</span>
 1196:                   </div>
 1197:                 ))}
 1198:               </div>
 1199:             ) : (
 1200:               <div className="text-xs text-slate-400">{'\u041D\u0435\u0442 \u0430\u043A\u0442\u0438\u0432\u043D\u044B\u0445 \u0437\u0430\u043A\u0430\u0437\u043E\u0432'}</div>
 1201:             )}
 1202:           </React.Fragment>
 1203:         )}
 1204:       </div>
 1205: 
 1206:       <div className={`overflow-hidden transition-all duration-200 ease-out ${isExpanded ? 'max-h-[3000px] opacity-100' : 'max-h-0 opacity-0'}`}>
 1207:         <div className="border-t border-slate-200 px-4 py-3 space-y-4">
 1208:           {group.type === 'table' ? (
 1209:             <React.Fragment>
 1210:               <div className="rounded-xl border border-slate-200 bg-white/80 p-3 space-y-2">
 1211:                 <div className="flex items-center justify-between gap-3">
 1212:                   <div className="flex items-center gap-2 min-w-0">
 1213:                     {ownershipState === 'mine' ? <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 shrink-0" /> : ownershipState === 'other' ? <Lock className="w-4 h-4 text-slate-400 shrink-0" /> : <Star className="w-4 h-4 text-slate-300 shrink-0" />}
 1214:                     <span className="inline-flex min-w-[2rem] items-center justify-center rounded-lg bg-slate-900 px-2.5 py-1 text-sm font-bold text-white">{compactTableLabel}</span>
 1215:                     {tableData?.zone_name && <span className="rounded-full bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-600 border border-slate-200">{tableData.zone_name}</span>}
 1216:                   </div>
 1217:                   <button type="button" onClick={onToggleExpand} className="text-xs font-semibold text-slate-500 min-h-[36px]">{HALL_UI_TEXT.collapse}</button>
 1218:                 </div>
 1219:                 <div className="flex flex-wrap items-center gap-x-3 gap-y-1">{hallSummaryItems.length > 0 ? hallSummaryItems.map(renderHallSummaryItem) : <span className="text-xs text-slate-400">{HALL_UI_TEXT.noActions}</span>}</div>
 1220:                 {billData && billData.total > 0 && <div className="text-xs font-semibold text-slate-700">{`${HALL_UI_TEXT.bill} \u00B7 ${HALL_UI_TEXT.total} ${formatHallMoney(billData.total)}`}</div>}
 1221:               </div>
 1222: 
 1223:               {tableRequests.length > 0 && (
 1224:                 <div>
 1225:                   <div className="mb-2 flex items-center justify-between gap-3">
 1226:                     <div className="text-[11px] font-bold uppercase tracking-wider text-violet-600"><span className="bg-violet-50 rounded-md px-2 py-0.5">{`${HALL_UI_TEXT.requests} (${tableRequests.length})`}</span></div>
 1227:                     {tableRequests.length > 1 && (() => { const allNew = tableRequests.every(r => !r.status || r.status === 'new' || r.status === 'open'); const allAccepted = tableRequests.every(r => r.status === 'accepted'); if (allNew) return <button type="button" onClick={() => tableRequests.forEach(r => onCloseRequest(r.id, 'accepted', { assignee: effectiveUserId, assigned_at: new Date().toISOString() }))} disabled={isRequestPending} className="rounded-lg border border-violet-200 bg-violet-50 px-3 py-2 text-xs font-semibold text-violet-700 min-h-[36px] active:scale-[0.98] disabled:opacity-60">{`${HALL_UI_TEXT.acceptAllRequests} (${tableRequests.length})`}</button>; if (allAccepted) return <button type="button" onClick={() => tableRequests.forEach(r => onCloseRequest(r.id, 'done'))} disabled={isRequestPending} className="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-xs font-semibold text-green-700 min-h-[36px] active:scale-[0.98] disabled:opacity-60">{`${HALL_UI_TEXT.serveAllRequests} (${tableRequests.length})`}</button>; return null; })()}
 1228:                   </div>
 1229:                   <div className="space-y-1.5">
 1230:                     {tableRequests.map(request => {
 1231:                       const ageMin = getAgeMinutes(request.created_date);
 1232:                       const label = REQUEST_TYPE_LABELS[request.request_type] || request.request_type;
 1233:                       const isAccepted = request.status === 'accepted';
 1234:                       const isAssignedToMe = request.assignee === effectiveUserId;
 1235:                       return (
 1236:                         <div key={request.id} className="rounded-lg border border-violet-200 bg-violet-50/80 px-3 py-2">
 1237:                           <div className="flex items-center gap-3">
 1238:                             <div className="min-w-0 flex-1">
 1239:                               <div className="flex items-center gap-2 min-w-0">
 1240:                                 <span className="truncate text-sm font-medium text-slate-900">{label}</span>
 1241:                                 <span className="text-xs text-violet-500 shrink-0">{formatCompactMinutes(ageMin)}</span>
 1242:                                 {isAccepted && isAssignedToMe && staffName && <span className="shrink-0 rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-medium text-blue-700">{staffName}</span>}
 1243:                               </div>
 1244:                               {request.comment && <div className="mt-0.5 text-xs text-slate-500 truncate">{request.comment}</div>}
 1245:                             </div>
 1246:                             {onCloseRequest && (isAccepted ? <button type="button" onClick={() => onCloseRequest(request.id, 'done')} disabled={isRequestPending} className="shrink-0 rounded-lg border border-green-200 bg-white px-3 py-2 text-xs font-semibold text-green-700 min-h-[36px] active:scale-[0.98] disabled:opacity-60">{HALL_UI_TEXT.serveRequest}</button> : <button type="button" onClick={() => onCloseRequest(request.id, 'accepted', { assignee: effectiveUserId, assigned_at: new Date().toISOString() })} disabled={isRequestPending} className="shrink-0 rounded-lg border border-blue-200 bg-white px-3 py-2 text-xs font-semibold text-blue-700 min-h-[36px] active:scale-[0.98] disabled:opacity-60">{HALL_UI_TEXT.acceptRequest}</button>)}
 1247:                           </div>
 1248:                         </div>
 1249:                       );
 1250:                     })}
 1251:                   </div>
 1252:                 </div>
 1253:               )}
 1254: 
 1255:               {newOrders.length > 0 && (
 1256:                 <div>
 1257:                   <div className="flex items-center justify-between gap-3 mb-2">
 1258:                     <div className="text-[11px] font-bold uppercase tracking-wider text-blue-600"><span className="bg-blue-50 rounded-md px-2 py-0.5">{`${HALL_UI_TEXT.new} (${newOrders.length} ${pluralRu(newOrders.length, HALL_UI_TEXT.guests + '\u044C', HALL_UI_TEXT.guests + '\u044F', HALL_UI_TEXT.guests + '\u0435\u0439')} \u00B7 ${newRows.length || newOrders.length} ${pluralRu(newRows.length || newOrders.length, HALL_UI_TEXT.dishes + '\u043E', HALL_UI_TEXT.dishes + '\u0430', HALL_UI_TEXT.dishes)})`}</span></div>
 1259:                     <button type="button" onClick={() => handleOrdersAction(newOrders)} disabled={advanceMutation.isPending} className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700 min-h-[36px] active:scale-[0.98] disabled:opacity-60">{newOrders.length > 0 && getOrderActionMeta(newOrders[0]).willServe ? HALL_UI_TEXT.serveAll : HALL_UI_TEXT.acceptAll}</button>
 1260:                   </div>
 1261:                   {renderHallRows(newRows, 'blue')}
 1262:                 </div>
 1263:               )}
 1264: 
 1265:               {inProgressSections.length > 0 && (
 1266:                 <div>
 1267:                   <button type="button" onClick={() => setInProgressExpanded(prev => !prev)} className="mb-2 flex w-full items-center justify-between text-left">
 1268:                     <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 opacity-60">{`${HALL_UI_TEXT.inProgress} (${inProgressOrders.length} ${pluralRu(inProgressOrders.length, HALL_UI_TEXT.guests + '\u044C', HALL_UI_TEXT.guests + '\u044F', HALL_UI_TEXT.guests + '\u0435\u0439')} \u00B7 ${inProgressSections.reduce((sum, section) => sum + section.rowCount, 0)} ${pluralRu(inProgressSections.reduce((sum, section) => sum + section.rowCount, 0), HALL_UI_TEXT.dishes + '\u043E', HALL_UI_TEXT.dishes + '\u0430', HALL_UI_TEXT.dishes)})`}</span>
 1269:                     <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${inProgressExpanded ? 'rotate-180' : ''}`} />
 1270:                   </button>
 1271:                   {inProgressExpanded && (
 1272:                     <div className="space-y-3 opacity-60">
 1273:                       {inProgressSections.map(section => {
 1274:                         const isSubExpanded = !!expandedSubGroups[section.sid];
 1275:                         return (
 1276:                           <div key={section.sid}>
 1277:                             <div className="mb-1.5 flex items-center justify-between gap-3 cursor-pointer" onClick={() => setExpandedSubGroups(prev => ({ ...prev, [section.sid]: !prev[section.sid] }))}>
 1278:                               <div className="flex items-center gap-2 min-w-0">
 1279:                                 <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${isSubExpanded ? 'rotate-180' : ''}`} />
 1280:                                 <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 opacity-60">{`${section.label} (${section.rowCount})`}</span>
 1281:                               </div>
 1282:                               <button type="button" onClick={(e) => { e.stopPropagation(); handleOrdersAction(section.orders); }} disabled={advanceMutation.isPending} className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-700 min-h-[36px] active:scale-[0.98] disabled:opacity-60">{section.bulkLabel}</button>
 1283:                             </div>
 1284:                             {isSubExpanded && renderHallRows(section.rows)}
 1285:                           </div>
 1286:                         );
 1287:                       })}
 1288:                     </div>
 1289:                   )}
 1290:                 </div>
 1291:               )}
 1292: 
 1293:               {readyOrders.length > 0 && (
 1294:                 <div>
 1295:                   <div className="flex items-center justify-between gap-3 mb-2">
 1296:                     <div className="text-[11px] font-bold uppercase tracking-wider text-green-600"><span className="bg-green-50 rounded-md px-2 py-0.5">{`${HALL_UI_TEXT.ready} (${readyOrders.length} ${pluralRu(readyOrders.length, HALL_UI_TEXT.guests + '\u044C', HALL_UI_TEXT.guests + '\u044F', HALL_UI_TEXT.guests + '\u0435\u0439')} \u00B7 ${readyRows.length || readyOrders.length} ${pluralRu(readyRows.length || readyOrders.length, HALL_UI_TEXT.dishes + '\u043E', HALL_UI_TEXT.dishes + '\u0430', HALL_UI_TEXT.dishes)})`}</span></div>
 1297:                     <button type="button" onClick={() => handleOrdersAction(readyOrders)} disabled={advanceMutation.isPending} className="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-xs font-semibold text-green-700 min-h-[36px] active:scale-[0.98] disabled:opacity-60">{HALL_UI_TEXT.serveAll}</button>
 1298:                   </div>
 1299:                   {renderHallRows(readyRows, 'green')}
 1300:                 </div>
 1301:               )}
 1302: 
 1303:               {servedOrders.length > 0 && (
 1304:                 <div>
 1305:                   <button type="button" onClick={() => setServedExpanded(prev => !prev)} className="mb-2 flex w-full items-center justify-between text-left">
 1306:                     <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 opacity-60">{`${HALL_UI_TEXT.served} (${servedRows.length || servedOrders.length})`}</span>
 1307:                     <span className="text-xs font-medium text-slate-400">{servedExpanded ? HALL_UI_TEXT.hide : HALL_UI_TEXT.show}</span>
 1308:                   </button>
 1309:                   {servedExpanded && <div className="opacity-60">{renderHallRows(servedRows)}</div>}
 1310:                 </div>
 1311:               )}
 1312: 
 1313:               {billData && billData.total > 0 && (
 1314:                 <div className={`rounded-xl border p-3 ${hasBillRequest ? 'border-violet-300 bg-violet-50/80' : 'border-slate-200 bg-slate-50'}`}>
 1315:                   <button type="button" onClick={() => setBillExpanded(prev => !prev)} className="flex w-full items-start justify-between gap-3 text-left">
 1316:                     <div className="min-w-0 flex-1">
 1317:                       <div className="text-[11px] font-bold uppercase tracking-wider text-slate-600">{HALL_UI_TEXT.bill}</div>
 1318:                       <div className="mt-1 text-sm font-semibold text-slate-900">{`${HALL_UI_TEXT.total} ${formatHallMoney(billData.total)}`}</div>
 1319:                       {!billExpanded && <div className="mt-1 text-xs text-slate-500">{`${HALL_UI_TEXT.remaining} ${formatHallMoney(billData.remaining)}`}</div>}
 1320:                     </div>
 1321:                     {billExpanded ? <ChevronUp className="w-4 h-4 text-slate-400 mt-1" /> : <ChevronDown className="w-4 h-4 text-slate-400 mt-1" />}
 1322:                   </button>
 1323:                   {billExpanded && (
 1324:                     <div className="mt-3 space-y-2 border-t border-slate-200 pt-3">
 1325:                       {billData.guests.map((guest, idx) => <div key={idx} className="flex items-center justify-between gap-3 text-sm"><span className="text-slate-600">{guest.name}</span><span className="font-medium text-slate-900">{formatHallMoney(guest.total)}</span></div>)}
 1326:                       <div className="border-t border-slate-200 pt-2 space-y-1 text-sm">
 1327:                         <div className="flex items-center justify-between gap-3"><span className="text-slate-500">{HALL_UI_TEXT.paid}</span><span className="font-medium text-slate-700">{formatHallMoney(billData.paid)}</span></div>
 1328:                         <div className="flex items-center justify-between gap-3 font-semibold text-slate-900"><span>{HALL_UI_TEXT.remaining}</span><span>{formatHallMoney(billData.remaining)}</span></div>
 1329:                       </div>
 1330:                     </div>
 1331:                   )}
 1332:                 </div>
 1333:               )}
 1334: 
 1335:               {onCloseTable && group.orders.length > 0 && (
 1336:                 <div className="pt-2 border-t border-slate-200">
 1337:                   <button type="button" onClick={handleCloseTableClick} disabled={!!closeDisabledReason} className={`w-full min-h-[44px] flex items-center justify-center gap-2 font-medium text-sm rounded-lg border transition-all active:scale-[0.99] ${closeDisabledReason ? 'bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed' : 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100'}`}>
 1338:                     <X className="w-4 h-4" />
 1339:                     {HALL_UI_TEXT.closeTable}
 1340:                   </button>
 1341:                   {closeDisabledReasons.length > 0 && <div className="mt-1 space-y-0.5">{closeDisabledReasons.map((reason, i) => <p key={i} className="text-[10px] text-slate-400 text-center">{reason}</p>)}</div>}
 1342:                 </div>
 1343:               )}
 1344:             </React.Fragment>
 1345:           ) : (
 1346:             <React.Fragment>
 1347:               {newOrders.length > 0 && <div><div className="flex items-center justify-between mb-2"><p className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">{`\u041D\u043E\u0432\u044B\u0435 (${newOrders.length})`}</p><button type="button" onClick={() => handleOrdersAction(newOrders)} disabled={advanceMutation.isPending} className="text-xs font-semibold text-blue-600 bg-blue-50 border border-blue-200 px-3 py-1 rounded min-h-[44px] active:scale-95 disabled:opacity-60">{'\u041F\u0440\u0438\u043D\u044F\u0442\u044C \u0432\u0441\u0435'}</button></div><div className="space-y-2">{newOrders.map(renderLegacyOrderCard)}</div></div>}
 1348:               {readyOrders.length > 0 && <div><div className="flex items-center justify-between mb-2"><p className="text-[11px] font-bold text-green-600 uppercase tracking-wider">{`\u0413\u043E\u0442\u043E\u0432\u043E \u043A \u0432\u044B\u0434\u0430\u0447\u0435 (${readyOrders.length})`}</p><button type="button" onClick={() => handleOrdersAction(readyOrders)} disabled={advanceMutation.isPending} className="text-xs font-semibold text-green-600 bg-green-50 border border-green-200 px-3 py-1 rounded min-h-[44px] active:scale-95 disabled:opacity-60">{'\u0412\u044B\u0434\u0430\u0442\u044C \u0432\u0441\u0435'}</button></div><div className="space-y-2">{readyOrders.map(renderLegacyOrderCard)}</div></div>}
 1349:               {inProgressOrders.length > 0 && (
 1350:                 <div>
 1351:                   <div className="flex items-center justify-between mb-2 cursor-pointer min-h-[44px]" onClick={() => setInProgressExpanded(prev => !prev)}>
 1352:                     <p className="text-[11px] font-bold text-amber-600 uppercase tracking-wider">{`\u0412 \u0440\u0430\u0431\u043E\u0442\u0435 (${inProgressOrders.length})`}</p>
 1353:                     <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${inProgressExpanded ? 'rotate-180' : ''}`} />
 1354:                   </div>
 1355:                   {inProgressExpanded && (
 1356:                     <div className="space-y-3">
 1357:                       {subGroups.map(({ sid, orders, cfg }) => {
 1358:                         const isSubExpanded = !!expandedSubGroups[sid];
 1359:                         const meta = getOrderActionMeta(orders[0]);
 1360:                         const actionName = meta.willServe ? HALL_UI_TEXT.serve : meta.label;
 1361:                         const subGroupLabel = sid === '__null__' ? '\u0412 \u0420\u0410\u0411\u041E\u0422\u0415' : cfg.label;
 1362:                         if (subGroups.length === 1) return <div key={sid} className="space-y-2">{orders.map(renderLegacyOrderCard)}</div>;
 1363:                         return (
 1364:                           <div key={sid}>
 1365:                             <div className="flex items-center justify-between mb-1.5 cursor-pointer min-h-[44px]" onClick={() => setExpandedSubGroups(prev => ({ ...prev, [sid]: !prev[sid] }))}>
 1366:                               <div className="flex items-center gap-2"><ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${isSubExpanded ? 'rotate-180' : ''}`} /><span className="text-[11px] font-bold text-amber-600 uppercase tracking-wider">{`${subGroupLabel} (${orders.length})`}</span></div>
 1367:                               <button type="button" onClick={(e) => { e.stopPropagation(); handleOrdersAction(orders); }} disabled={advanceMutation.isPending} className="text-xs font-semibold text-amber-600 bg-amber-50 border border-amber-200 px-3 py-1 rounded min-h-[36px] active:scale-95 disabled:opacity-60">{`\u0412\u0441\u0435 \u2192 ${actionName}`}</button>
 1368:                             </div>
 1369:                             {isSubExpanded && <div className="space-y-2">{orders.map(renderLegacyOrderCard)}</div>}
 1370:                           </div>
 1371:                         );
 1372:                       })}
 1373:                     </div>
 1374:                   )}
 1375:                 </div>
 1376:               )}
 1377:               {contactInfo && (
 1378:                 <div className="space-y-2 pt-2 border-t border-slate-200">
 1379:                   {contactInfo.name && <div className="flex items-center gap-2 text-sm"><User className="w-4 h-4 text-slate-400" /><span className="text-slate-700">{contactInfo.name}</span></div>}
 1380:                   {contactInfo.phone && <div className="flex items-center gap-2 text-sm"><Phone className="w-4 h-4 text-slate-400" /><a href={`tel:${contactInfo.phone}`} className="text-blue-600 underline">{contactInfo.phone}</a></div>}
 1381:                   {contactInfo.address && <div className="flex items-center gap-2 text-sm"><MapPin className="w-4 h-4 text-slate-400" /><span className="text-slate-600">{contactInfo.address}</span></div>}
 1382:                 </div>
 1383:               )}
 1384:             </React.Fragment>
 1385:           )}
 1386:         </div>
 1387:       </div>
 1388:     </div>
 1389:   );
 1390: }
 1391: */
 1392: 
 1393: function RateLimitScreen({ onRetry }) {
 1394:   return (
 1395:     <div className="min-h-screen flex items-center justify-center bg-slate-100 p-6">
 1396:       <Card className="max-w-md w-full border-amber-200 bg-amber-50">
 1397:         <CardContent className="p-6 text-center space-y-4">
 1398:           <div className="w-12 h-12 mx-auto rounded-full bg-amber-100 flex items-center justify-center">
 1399:             <AlertTriangle className="w-6 h-6 text-amber-600" />
 1400:           </div>
 1401:           <div className="text-xl font-bold text-slate-900">{'\u0421\u043B\u0438\u0448\u043A\u043E\u043C \u043C\u043D\u043E\u0433\u043E \u0437\u0430\u043F\u0440\u043E\u0441\u043E\u0432'}</div>
 1402:           <div className="text-sm text-slate-600">{'\u0421\u0435\u0440\u0432\u0435\u0440 \u0432\u0440\u0435\u043C\u0435\u043D\u043D\u043E \u043E\u0433\u0440\u0430\u043D\u0438\u0447\u0438\u043B \u0434\u043E\u0441\u0442\u0443\u043F. \u041F\u043E\u0434\u043E\u0436\u0434\u0438\u0442\u0435 \u043C\u0438\u043D\u0443\u0442\u0443 \u0438 \u043F\u043E\u043F\u0440\u043E\u0431\u0443\u0439\u0442\u0435 \u0441\u043D\u043E\u0432\u0430.'}</div>
 1403:           <Button onClick={onRetry} className="w-full bg-amber-600 hover:bg-amber-700 text-white">
 1404:             <RefreshCcw className="w-4 h-4 mr-2" />
 1405:             {'\u041F\u043E\u043F\u0440\u043E\u0431\u043E\u0432\u0430\u0442\u044C \u0441\u043D\u043E\u0432\u0430'}
 1406:           </Button>
 1407:         </CardContent>
 1408:       </Card>
 1409:     </div>
 1410:   );
 1411: }
 1412: 
 1413: function LockedScreen() {
 1414:   return (
 1415:     <div className="min-h-screen flex items-center justify-center bg-slate-100 p-6">
 1416:       <Card className="max-w-md w-full border-slate-200">
 1417:         <CardContent className="p-6 text-center space-y-3">
 1418:           <div className="text-xl font-bold text-slate-900">{'\u0421\u0441\u044B\u043B\u043A\u0430 \u0437\u0430\u043D\u044F\u0442\u0430'}</div>
 1419:           <div className="text-sm text-slate-600">{'\u042D\u0442\u0430 \u0441\u0441\u044B\u043B\u043A\u0430 \u043E\u0444\u0438\u0446\u0438\u0430\u043D\u0442\u0430 \u0443\u0436\u0435 \u0438\u0441\u043F\u043E\u043B\u044C\u0437\u0443\u0435\u0442\u0441\u044F \u043D\u0430 \u0434\u0440\u0443\u0433\u043E\u043C \u0443\u0441\u0442\u0440\u043E\u0439\u0441\u0442\u0432\u0435.'}</div>
 1420:           <div className="text-xs text-slate-500">{'\u041F\u043E\u043F\u0440\u043E\u0441\u0438\u0442\u0435 \u043C\u0435\u043D\u0435\u0434\u0436\u0435\u0440\u0430 \u043F\u0435\u0440\u0435\u0432\u044B\u043F\u0443\u0441\u0442\u0438\u0442\u044C \u0441\u0441\u044B\u043B\u043A\u0443 \u0432 \u043A\u0430\u0431\u0438\u043D\u0435\u0442\u0435.'}</div>
 1421:         </CardContent>
 1422:       </Card>
 1423:     </div>
 1424:   );
 1425: }
 1426: 
 1427: function BindingScreen() {
 1428:   return (
 1429:     <div className="min-h-screen flex items-center justify-center bg-slate-100 p-6">
 1430:       <Card className="max-w-md w-full border-slate-200">
 1431:         <CardContent className="p-6 text-center space-y-3">
 1432:           <div className="text-xl font-bold text-slate-900">{'\u0410\u043A\u0442\u0438\u0432\u0430\u0446\u0438\u044F...'}</div>
 1433:           <div className="text-sm text-slate-600">{'\u041F\u0440\u0438\u0432\u044F\u0437\u044B\u0432\u0430\u0435\u043C \u0441\u0441\u044B\u043B\u043A\u0443 \u043A \u044D\u0442\u043E\u043C\u0443 \u0443\u0441\u0442\u0440\u043E\u0439\u0441\u0442\u0432\u0443.'}</div>
 1434:           <div className="flex justify-center pt-2">
 1435:             <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
 1436:           </div>
 1437:         </CardContent>
 1438:       </Card>
 1439:     </div>
 1440:   );
 1441: }
 1442: 
 1443: function IconToggle({ icon: Icon, label, count, selected, onClick, tone = "neutral", countAsIcon = false }) {
 1444:   const base = "flex flex-col items-center justify-center rounded-xl border transition-all select-none active:scale-[0.97]";
 1445:   const size = "flex-1 min-w-[52px] max-w-[120px] h-14";
 1446:   const isEmpty = count === 0;
 1447: 
 1448:   let cls = "";
 1449:   if (tone === "neutral") {
 1450:     cls = selected
 1451:       ? (isEmpty ? "bg-slate-600 text-slate-300 border-slate-600" : "bg-slate-900 text-white border-slate-900")
 1452:       : (isEmpty ? "bg-white text-slate-300 border-slate-200" : "bg-white text-slate-600 border-slate-200");
 1453:   } else if (tone === "indigo") {
 1454:     cls = selected
 1455:       ? (isEmpty ? "bg-indigo-100/50 text-indigo-300 border-indigo-200" : "bg-indigo-50 text-indigo-700 border-indigo-300 ring-1 ring-indigo-200")
 1456:       : (isEmpty ? "bg-white text-slate-300 border-slate-200" : "bg-white text-slate-500 border-slate-200");
 1457:   } else if (tone === "fuchsia") {
 1458:     cls = selected
 1459:       ? (isEmpty ? "bg-fuchsia-100/50 text-fuchsia-300 border-fuchsia-200" : "bg-fuchsia-50 text-fuchsia-700 border-fuchsia-300 ring-1 ring-fuchsia-200")
 1460:       : (isEmpty ? "bg-white text-slate-300 border-slate-200" : "bg-white text-slate-500 border-slate-200");
 1461:   } else {
 1462:     cls = selected
 1463:       ? (isEmpty ? "bg-teal-100/50 text-teal-300 border-teal-200" : "bg-teal-50 text-teal-700 border-teal-300 ring-1 ring-teal-200")
 1464:       : (isEmpty ? "bg-white text-slate-300 border-slate-200" : "bg-white text-slate-500 border-slate-200");
 1465:   }
 1466: 
 1467:   return (
 1468:     <button type="button" onClick={onClick} className={`${base} ${size} ${cls}`} aria-pressed={selected}>
 1469:       {countAsIcon ? (
 1470:         <span className={`text-xl font-bold leading-none ${isEmpty && selected ? "opacity-60" : ""}`}>{count}</span>
 1471:       ) : (
 1472:         <React.Fragment>
 1473:           <Icon className="w-5 h-5" />
 1474:           <span className="text-[10px] leading-tight opacity-70 mt-0.5">{count}</span>
 1475:         </React.Fragment>
 1476:       )}
 1477:       <span className="text-[10px] leading-tight mt-1 font-medium">{label}</span>
 1478:     </button>
 1479:   );
 1480: }
 1481: 
 1482: function RequestCard({ request, tableData, onAction, isPending, isFavorite, onToggleFavorite }) {
 1483:   const typeLabel = REQUEST_TYPE_LABELS[request.request_type] || request.request_type;
 1484:   const reqTableId = getLinkId(request.table);
 1485:   const tableLabel = reqTableId && tableData ? `\u0421\u0442\u043E\u043B ${tableData.name}` : request.table ? '\u0421\u0442\u043E\u043B ...' : '\u2014';
 1486:   const statusLabel = request.status === "new" ? '\u041D\u043E\u0432\u044B\u0439' : '\u0412 \u0440\u0430\u0431\u043E\u0442\u0435';
 1487:   const statusBadgeClass = request.status === "new" ? "bg-blue-50 text-blue-700 border-blue-200" : "bg-yellow-50 text-yellow-700 border-yellow-200";
 1488:   const actionLabel = request.status === "new" ? '\u0412 \u0440\u0430\u0431\u043E\u0442\u0443' : '\u0413\u043E\u0442\u043E\u0432\u043E';
 1489: 
 1490:   return (
 1491:     <div className="bg-white border border-slate-200 rounded-lg p-3 mb-2 shadow-sm">
 1492:       <div className="flex justify-between items-start mb-1">
 1493:         <div className="flex items-center gap-2">
 1494:           <Bell className="w-4 h-4 text-indigo-600" />
 1495:           <span className="font-semibold text-slate-900 text-sm">{typeLabel}</span>
 1496:           <button
 1497:             onClick={(event) => {
 1498:               event.stopPropagation();
 1499:               onToggleFavorite('request', request.id);
 1500:             }}
 1501:             className="p-1 -m-1 active:scale-90"
 1502:             aria-label={isFavorite ? '\u0423\u0431\u0440\u0430\u0442\u044C \u0438\u0437 \u0438\u0437\u0431\u0440\u0430\u043D\u043D\u043E\u0433\u043E' : '\u0412 \u0438\u0437\u0431\u0440\u0430\u043D\u043D\u043E\u0435'}
 1503:           >
 1504:             <Star className={`w-4 h-4 ${isFavorite ? "fill-yellow-400 text-yellow-400" : "text-slate-300"}`} />
 1505:           </button>
 1506:         </div>
 1507:         <span className="text-[10px] text-slate-400">{formatRelativeTime(request.created_date)}</span>
 1508:       </div>
 1509:       <div className="text-xs text-slate-500 mb-2">{tableLabel}</div>
 1510:       {request.comment && <div className="text-xs bg-slate-50 text-slate-600 p-2 rounded mb-2 border border-slate-100">{request.comment}</div>}
 1511:       <div className="flex items-center justify-between">
 1512:         <Badge variant="outline" className={`text-[10px] ${statusBadgeClass}`}>{statusLabel}</Badge>
 1513:         <Button size="sm" onClick={onAction} disabled={isPending} className="h-7 px-3 text-xs bg-indigo-600 hover:bg-indigo-700 text-white">
 1514:           {isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : actionLabel}
 1515:         </Button>
 1516:       </div>
 1517:     </div>
 1518:   );
 1519: }
 1520: 
 1521: function OrderCard({
 1522:   order,
 1523:   tableData,
 1524:   isFavorite,
 1525:   onToggleFavorite,
 1526:   disableServe,
 1527:   onMutate,
 1528:   effectiveUserId,
 1529:   isNotified,
 1530:   onClearNotified,
 1531:   getStatusConfig,
 1532:   isKitchen,
 1533:   guestsMap,
 1534:   onCloseTable,
 1535: }) {
 1536:   const queryClient = useQueryClient();
 1537:   const [itemsOpen, setItemsOpen] = useState(false);
 1538:   const tableId = getLinkId(order.table);
 1539:   const tableSessionId = getLinkId(order.table_session);
 1540:   const guestId = getLinkId(order.guest);
 1541:   const { data: items } = useQuery({
 1542:     queryKey: ["orderItems", order.id],
 1543:     queryFn: () => base44.entities.OrderItem.filter({ order: order.id }),
 1544:     staleTime: 30000,
 1545:     retry: shouldRetry,
 1546:     enabled: itemsOpen,
 1547:   });
 1548:   const statusConfig = getStatusConfig(order);
 1549:   const updateStatusMutation = useMutation({
 1550:     mutationFn: ({ id, payload }) => base44.entities.Order.update(id, payload),
 1551:     onMutate: async ({ id, payload }) => {
 1552:       if (onMutate) onMutate(id, payload.status || payload.stage_id);
 1553:       await queryClient.cancelQueries({ queryKey: ["orders"] });
 1554:       const prev = queryClient.getQueriesData({ queryKey: ["orders"] });
 1555:       queryClient.setQueriesData({ queryKey: ["orders"] }, (old) => Array.isArray(old) ? old.map((row) => (row.id === id ? { ...row, ...payload } : row)) : old);
 1556:       return { prev };
 1557:     },
 1558:     onError: (_err, _vars, ctx) => {
 1559:       if (ctx?.prev) ctx.prev.forEach(([key, data]) => queryClient.setQueryData(key, data));
 1560:     },
 1561:     onSettled: () => queryClient.invalidateQueries({ queryKey: ["orders"] }),
 1562:   });
 1563: 
 1564:   const handleAction = (event) => {
 1565:     event.stopPropagation();
 1566:     const payload = {};
 1567:     if (statusConfig.nextStageId) {
 1568:       payload.stage_id = statusConfig.nextStageId;
 1569:       if (statusConfig.derivedNextStatus) payload.status = statusConfig.derivedNextStatus;
 1570:     } else if (statusConfig.nextStatus) {
 1571:       payload.status = statusConfig.nextStatus;
 1572:     } else if (statusConfig.isFinishStage) {
 1573:       payload.status = "served";
 1574:     } else {
 1575:       return;
 1576:     }
 1577:     if ((order.status === "new" || statusConfig.isFirstStage) && effectiveUserId && !getAssigneeId(order)) {
 1578:       payload.assignee = effectiveUserId;
 1579:       payload.assigned_at = new Date().toISOString();
 1580:     }
 1581:     if (onClearNotified) onClearNotified(order.id);
 1582:     updateStatusMutation.mutate({ id: order.id, payload });
 1583:   };
 1584: 
 1585:   const typeConfig = TYPE_THEME[order.order_type] || TYPE_THEME.hall;
 1586:   const TypeIcon = typeConfig.icon;
 1587:   const badgeStyle = statusConfig.color ? { backgroundColor: `${statusConfig.color}20`, borderColor: statusConfig.color, color: statusConfig.color } : undefined;
 1588:   const guest = guestId && guestsMap ? guestsMap[guestId] : null;
 1589:   const mainText = order.order_type === "hall"
 1590:     ? (tableId && tableData ? `\u0421\u0442\u043E\u043B ${tableData.name}` : '\u0421\u0442\u043E\u043B \u043D\u0435 \u0443\u043A\u0430\u0437\u0430\u043D')
 1591:     : order.order_type === "pickup"
 1592:       ? '\u0421\u0430\u043C\u043E\u0432\u044B\u0432\u043E\u0437'
 1593:       : '\u0414\u043E\u0441\u0442\u0430\u0432\u043A\u0430';
 1594:   const secondaryText = order.order_type === "hall"
 1595:     ? tableData?.zone_name
 1596:     : order.order_type === "pickup"
 1597:       ? [order.client_name, order.client_phone].filter(Boolean).join(", ")
 1598:       : order.delivery_address;
 1599:   const showActionButton = !!(statusConfig.nextStageId || statusConfig.nextStatus) || !!(statusConfig.actionLabel && !statusConfig.isFinishStage);
 1600:   const isServeStep = statusConfig.nextStatus === "served" || statusConfig.isFinishStage;
 1601:   const actionDisabled = updateStatusMutation.isPending || (disableServe && isServeStep);
 1602:   const ctaClass = order.status === "ready" || statusConfig.isFinishStage ? "bg-green-600 hover:bg-green-700 ring-2 ring-green-400 ring-offset-1" : order.status === "new" || statusConfig.isFirstStage ? "bg-blue-600 hover:bg-blue-700" : "bg-indigo-600 hover:bg-indigo-700";
 1603: 
 1604:   return (
 1605:     <Card className="mb-3 overflow-hidden relative bg-white border-slate-200 border-l-0 rounded-l-md cursor-pointer" onClick={() => setItemsOpen((prev) => !prev)}>
 1606:       <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${typeConfig.stripeClass}`} />
 1607:       <CardContent className="p-3 pl-4">
 1608:         <div className="flex justify-between items-start mb-2">
 1609:           <div className="flex-1 min-w-0 mr-2">
 1610:             <div className="flex items-center gap-2 flex-wrap">
 1611:               <span className="font-bold text-base text-slate-900">{mainText}</span>
 1612:               {!isKitchen && order.order_number && <span className="text-sm text-gray-500 bg-gray-100 px-2 py-0.5 rounded">{order.order_number}</span>}
 1613:               <Badge variant="outline" className={`text-[9px] px-1 py-0 h-4 gap-0.5 ${typeConfig.badgeClass}`}>
 1614:                 <TypeIcon className="w-3 h-3" />
 1615:                 {typeConfig.label}
 1616:               </Badge>
 1617:               {order.order_type === "hall" && tableId && (
 1618:                 <button onClick={(event) => { event.stopPropagation(); onToggleFavorite('table', tableId); }} className="p-1.5 -m-1 active:scale-90" aria-label={isFavorite ? '\u0423\u0431\u0440\u0430\u0442\u044C \u0438\u0437 \u0438\u0437\u0431\u0440\u0430\u043D\u043D\u043E\u0433\u043E' : '\u0412 \u0438\u0437\u0431\u0440\u0430\u043D\u043D\u043E\u0435'}>
 1619:                   <Star className={`w-4 h-4 ${isFavorite ? "fill-yellow-400 text-yellow-400" : "text-slate-300"}`} />
 1620:                 </button>
 1621:               )}
 1622:             </div>
 1623:             {!isKitchen && guest && <span className="inline-block mt-1 text-sm bg-blue-50 text-blue-700 px-2 py-0.5 rounded">{getGuestDisplayName(guest)}</span>}
 1624:             {secondaryText && <div className="text-xs text-slate-500 truncate mt-0.5">{secondaryText}</div>}
 1625:           </div>
 1626:           <div className="text-[10px] text-slate-400 whitespace-nowrap flex items-center gap-1 bg-white/60 px-1.5 py-0.5 rounded border border-slate-100">
 1627:             {isNotified && <Sparkles className="w-3 h-3 text-orange-500 animate-pulse" />}
 1628:             <Clock className="w-3 h-3" />
 1629:             {formatRelativeTime(order.created_date)}
 1630:           </div>
 1631:         </div>
 1632:         <div className="mb-3 space-y-1">
 1633:           {itemsOpen ? (
 1634:             items ? items.slice(0, 5).map((item, idx) => (
 1635:               <div key={item.id || idx} className="text-sm text-slate-800">
 1636:                 <span className="font-semibold mr-1">{item.quantity}{'\u00D7'}</span>
 1637:                 {item.dish_name}
 1638:               </div>
 1639:             )) : <div className="flex items-center gap-1 text-xs text-slate-400"><Loader2 className="w-3 h-3 animate-spin" />{'\u0417\u0430\u0433\u0440\u0443\u0437\u043A\u0430'}</div>
 1640:           ) : (
 1641:             <div className="text-xs text-slate-400">{'\u041D\u0430\u0436\u043C\u0438\u0442\u0435, \u0447\u0442\u043E\u0431\u044B \u043F\u043E\u043A\u0430\u0437\u0430\u0442\u044C \u043F\u043E\u0437\u0438\u0446\u0438\u0438'}</div>
 1642:           )}
 1643:         </div>
 1644:         {order.comment && <div className="mb-3 text-xs bg-yellow-50 text-yellow-800 p-2 rounded border border-yellow-100"><span className="font-semibold">{'\u041A\u043E\u043C\u043C\u0435\u043D\u0442\u0430\u0440\u0438\u0439:'}</span> {order.comment}</div>}
 1645:         <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 gap-2">
 1646:           <Badge variant="outline" className={`text-xs px-2 py-0.5 ${statusConfig.badgeClass || ""}`} style={badgeStyle}>{statusConfig.label}</Badge>
 1647:           <div className="flex items-center gap-2">
 1648:             {!isKitchen && order.order_type === "hall" && tableSessionId && onCloseTable && (
 1649:               <Button variant="outline" size="sm" onClick={(event) => { event.stopPropagation(); onCloseTable(tableSessionId, tableData?.name || '\u0441\u0442\u043E\u043B'); }} className="h-8 px-2 text-xs text-red-600 border-red-200 hover:bg-red-50">
 1650:                 <X className="h-3 w-3 mr-1" />
 1651:                 {'\u0417\u0430\u043A\u0440\u044B\u0442\u044C \u0441\u0442\u043E\u043B'}
 1652:               </Button>
 1653:             )}
 1654:             {showActionButton && statusConfig.actionLabel && (
 1655:               <Button onClick={handleAction} disabled={actionDisabled} className={`text-white font-medium px-4 h-9 min-w-[100px] ${ctaClass}`}>
 1656:                 {updateStatusMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : statusConfig.actionLabel}
 1657:               </Button>
 1658:             )}
 1659:           </div>
 1660:         </div>
 1661:       </CardContent>
 1662:     </Card>
 1663:   );
 1664: }
 1665: 
 1666: function pluralRu(n, one, few, many) {
 1667:   const abs = Math.abs(n) % 100;
 1668:   const last = abs % 10;
 1669:   if (abs > 10 && abs < 20) return many;
 1670:   if (last > 1 && last < 5) return few;
 1671:   if (last === 1) return one;
 1672:   return many;
 1673: }
 1674: 
 1675: function OrderGroupCard({
 1676:   group,
 1677:   isExpanded,
 1678:   onToggleExpand,
 1679:   isHighlighted,
 1680:   isFavorite,
 1681:   onToggleFavorite,
 1682:   getStatusConfig,
 1683:   guestsMap,
 1684:   effectiveUserId,
 1685:   onMutate,
 1686:   onCloseTable,
 1687:   overdueMinutes,
 1688:   notifiedOrderIds,
 1689:   onClearNotified,
 1690:   tableMap,
 1691:   activeRequests,
 1692:   onCloseAllOrders,
 1693:   onCloseRequest,
 1694:   orderStages = [],
 1695:   setUndoToast,
 1696:   undoToast,
 1697:   staffName,
 1698:   isRequestPending,
 1699: }) {
 1700:   const queryClient = useQueryClient();
 1701:   const tableId = group.type === "table" ? group.id : null;
 1702:   const tableData = tableId ? tableMap[tableId] : null;
 1703:   const tableStatus = computeTableStatus(group, activeRequests, getStatusConfig);
 1704:   const style = TABLE_STATUS_STYLES[tableStatus] || TABLE_STATUS_STYLES.PREPARING;
 1705: 
 1706:   const workOrders = useMemo(
 1707:     () => group.orders.filter((order) => !["served", "closed", "cancelled"].includes(order.status)),
 1708:     [group.orders]
 1709:   );
 1710:   const newOrders = useMemo(() => workOrders.filter((order) => getStatusConfig(order).isFirstStage), [workOrders, getStatusConfig]);
 1711:   const readyOrders = useMemo(() => workOrders.filter((order) => {
 1712:     const config = getStatusConfig(order);
 1713:     return !config.isFirstStage && config.isFinishStage;
 1714:   }), [workOrders, getStatusConfig]);
 1715:   const inProgressOrders = useMemo(() => workOrders.filter((order) => {
 1716:     const config = getStatusConfig(order);
 1717:     return !config.isFirstStage && !config.isFinishStage;
 1718:   }), [workOrders, getStatusConfig]);
 1719: 
 1720:   const subGroups = useMemo(() => {
 1721:     const bucket = {};
 1722:     inProgressOrders.forEach((order) => {
 1723:       const sid = getLinkId(order.stage_id) || "__null__";
 1724:       if (!bucket[sid]) bucket[sid] = [];
 1725:       bucket[sid].push(order);
 1726:     });
 1727: 
 1728:     const getStageIndex = (sid) => {
 1729:       if (sid === "__null__") return Number.MAX_SAFE_INTEGER;
 1730:       const index = orderStages.findIndex((stage) => getLinkId(stage.id) === sid);
 1731:       return index >= 0 ? index : Number.MAX_SAFE_INTEGER - 1;
 1732:     };
 1733: 
 1734:     return Object.entries(bucket)
 1735:       .map(([sid, orders]) => ({ sid, orders, cfg: getStatusConfig(orders[0]) }))
 1736:       .sort((a, b) => getStageIndex(a.sid) - getStageIndex(b.sid));
 1737:   }, [getStatusConfig, inProgressOrders, orderStages]);
 1738: 
 1739:   const itemResults = useQueries({
 1740:     queries: group.orders.map((order) => ({
 1741:       queryKey: ["orderItems", order.id],
 1742:       queryFn: () => base44.entities.OrderItem.filter({ order: order.id }),
 1743:       staleTime: 60000,
 1744:       retry: shouldRetry,
 1745:       enabled: isExpanded,
 1746:     })),
 1747:   });
 1748: 
 1749:   const { data: servedOrders = [] } = useQuery({
 1750:     queryKey: ["servedOrders", group.id],
 1751:     queryFn: () => base44.entities.Order.filter({ table: group.id, status: "served" }),
 1752:     enabled: isExpanded && group.type === "table",
 1753:     staleTime: 30000,
 1754:   });
 1755: 
 1756:   const [billExpanded, setBillExpanded] = useState(false);
 1757:   const [inProgressExpanded, setInProgressExpanded] = useState(true);
 1758:   const [expandedSubGroups, setExpandedSubGroups] = useState({});
 1759:   const [servedExpanded, setServedExpanded] = useState(false);
 1760:   const [ownerHintVisible, setOwnerHintVisible] = useState(false);
 1761:   const ownerHintTimerRef = useRef(null);
 1762:   const requestsSectionRef = useRef(null);
 1763:   const newSectionRef = useRef(null);
 1764:   const inProgressSectionRef = useRef(null);
 1765:   const readySectionRef = useRef(null);
 1766: 
 1767:   const scrollToSection = useCallback((kind) => {
 1768:     const refMap = {
 1769:       requests: requestsSectionRef,
 1770:       new: newSectionRef,
 1771:       inProgress: inProgressSectionRef,
 1772:       ready: readySectionRef,
 1773:     };
 1774:     const ref = refMap[kind];
 1775:     if (ref?.current) {
 1776:       ref.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
 1777:     }
 1778:   }, []);
 1779: 
 1780:   const servedItemResults = useQueries({
 1781:     queries: servedOrders.map((order) => ({
 1782:       queryKey: ["orderItems", order.id],
 1783:       queryFn: () => base44.entities.OrderItem.filter({ order: order.id }),
 1784:       staleTime: 60000,
 1785:       retry: shouldRetry,
 1786:       enabled: isExpanded && servedExpanded && group.type === "table",
 1787:     })),
 1788:   });
 1789: 
 1790:   useEffect(() => () => ownerHintTimerRef.current && clearTimeout(ownerHintTimerRef.current), []);
 1791: 
 1792:   useEffect(() => {
 1793:     if (!inProgressExpanded) {
 1794:       setExpandedSubGroups({});
 1795:       return;
 1796:     }
 1797:     if (subGroups.length > 0) {
 1798:       setExpandedSubGroups((prev) => (Object.keys(prev).length > 0 ? prev : { [subGroups[0].sid]: true }));
 1799:     }
 1800:   }, [inProgressExpanded, subGroups]);
 1801: 
 1802:   const itemsByOrder = useMemo(() => {
 1803:     const map = {};
 1804:     group.orders.forEach((order, index) => {
 1805:       if (itemResults[index]?.data) map[order.id] = itemResults[index].data;
 1806:     });
 1807:     return map;
 1808:   }, [group.orders, itemResults]);
 1809: 
 1810:   const servedItemsByOrder = useMemo(() => {
 1811:     const map = {};
 1812:     servedOrders.forEach((order, index) => {
 1813:       if (servedItemResults[index]?.data) map[order.id] = servedItemResults[index].data;
 1814:     });
 1815:     return map;
 1816:   }, [servedItemResults, servedOrders]);
 1817: 
 1818:   const oldestOrderTs = useMemo(() => {
 1819:     if (!group.orders.length) return null;
 1820:     return Math.min(...group.orders.map((order) => safeParseDate(order.created_date).getTime()));
 1821:   }, [group.orders]);
 1822:   const elapsedMin = oldestOrderTs ? Math.max(0, Math.floor((Date.now() - oldestOrderTs) / 60000)) : 0;
 1823:   const elapsedLabel = formatCompactMinutes(elapsedMin);
 1824:   const isOverdue = newOrders.length > 0 && elapsedMin > (overdueMinutes || 10);
 1825: 
 1826:   const tableRequests = useMemo(() => {
 1827:     if (group.type !== "table") return [];
 1828:     return (activeRequests || []).filter((request) => getLinkId(request.table) === group.id);
 1829:   }, [activeRequests, group.id, group.type]);
 1830: 
 1831:   const hasBillRequest = tableRequests.some((request) => request.request_type === "bill");
 1832:   const channelType = group.type === "table" ? "hall" : group.type;
 1833:   const channelConfig = TYPE_THEME[channelType] || TYPE_THEME.hall;
 1834:   const ChannelIcon = channelConfig.icon;
 1835:   const identifier = useMemo(() => {
 1836:     if (group.type === "table") {
 1837:       if (tableData?.name) {
 1838:         return String(tableData.name).startsWith('\u0421\u0442\u043E\u043B') ? tableData.name : `\u0421\u0442\u043E\u043B ${tableData.name}`;
 1839:       }
 1840:       return group.displayName;
 1841:     }
 1842:     const order = group.orders[0];
 1843:     const prefix = group.type === "pickup" ? "\u0421\u0412" : "\u0414\u041E\u0421";
 1844:     return `\u0417\u0430\u043A\u0430\u0437 ${prefix}-${order?.order_number || order?.id?.slice(-3) || "???"}`;
 1845:   }, [group.displayName, group.orders, group.type, tableData?.name]);
 1846:   const compactTableLabel = stripTablePrefix(identifier) || group.displayName || "?";
 1847:   const statusLabel = group.type === "table" ? style.label : (group.orders[0] ? getStatusConfig(group.orders[0]).label : "");
 1848:   const contactInfo = group.type !== "table"
 1849:     ? (() => {
 1850:         const order = group.orders[0];
 1851:         return order ? { name: order.client_name, phone: order.client_phone, address: order.delivery_address } : null;
 1852:       })()
 1853:     : null;
 1854: 
 1855:   const advanceMutation = useMutation({
 1856:     mutationFn: ({ id, payload }) => base44.entities.Order.update(id, payload),
 1857:     onMutate: async ({ id, payload }) => {
 1858:       if (onMutate) onMutate(id, payload.status || payload.stage_id);
 1859:       await queryClient.cancelQueries({ queryKey: ["orders"] });
 1860:       const prev = queryClient.getQueriesData({ queryKey: ["orders"] });
 1861:       queryClient.setQueriesData({ queryKey: ["orders"] }, (old) => Array.isArray(old) ? old.map((row) => (row.id === id ? { ...row, ...payload } : row)) : old);
 1862:       return { prev };
 1863:     },
 1864:     onError: (_err, _vars, ctx) => {
 1865:       if (ctx?.prev) ctx.prev.forEach(([key, data]) => queryClient.setQueryData(key, data));
 1866:     },
 1867:     onSettled: () => {
 1868:       queryClient.invalidateQueries({ queryKey: ["orders"] });
 1869:       queryClient.invalidateQueries({ queryKey: ["servedOrders", group.id] });
 1870:     },
 1871:   });
 1872: 
 1873:   const buildAdvancePayload = useCallback((order) => {
 1874:     const config = getStatusConfig(order);
 1875:     const payload = {};
 1876:     if (config.nextStageId) {
 1877:       payload.stage_id = config.nextStageId;
 1878:       if (config.derivedNextStatus) payload.status = config.derivedNextStatus;
 1879:     } else if (config.nextStatus) {
 1880:       payload.status = config.nextStatus;
 1881:     } else if (config.isFinishStage) {
 1882:       payload.status = "served";
 1883:     } else {
 1884:       return null;
 1885:     }
 1886:     if (config.isFirstStage && effectiveUserId && !getAssigneeId(order)) {
 1887:       payload.assignee = effectiveUserId;
 1888:       payload.assigned_at = new Date().toISOString();
 1889:     }
 1890:     return payload;
 1891:   }, [effectiveUserId, getStatusConfig]);
 1892: 
 1893:   const startUndoWindow = useCallback((orders, rowId) => {
 1894:     if (!setUndoToast || orders.length === 0) return;
 1895:     const snapshots = orders.map((order) => ({ orderId: order.id, prevStatus: order.status, prevStageId: getLinkId(order.stage_id) }));
 1896:     setUndoToast((prev) => {
 1897:       if (prev?.timerId) clearTimeout(prev.timerId);
 1898:       const timerId = setTimeout(() => setUndoToast(null), 3000);
 1899:       return {
 1900:         snapshots,
 1901:         timerId,
 1902:         orderId: orders[orders.length - 1].id,
 1903:         rowId,
 1904:         label: HALL_UI_TEXT.undoLabel,
 1905:         onUndo: () => {
 1906:           snapshots.forEach(({ orderId, prevStatus, prevStageId }) => {
 1907:             const payload = { status: prevStatus };
 1908:             if (prevStageId) payload.stage_id = prevStageId;
 1909:             advanceMutation.mutate({ id: orderId, payload });
 1910:           });
 1911:         },
 1912:       };
 1913:     });
 1914:   }, [advanceMutation, setUndoToast]);
 1915: 
 1916:   const getOrderActionMeta = useCallback((order) => {
 1917:     const config = getStatusConfig(order);
 1918:     const nextLabel = (config.actionLabel || "").replace(/^\u2192\s*/, "");
 1919:     const willServe = config.isFinishStage || config.derivedNextStatus === "served" || config.nextStatus === "served";
 1920:     return {
 1921:       config,
 1922:       nextLabel,
 1923:       willServe,
 1924:       rowLabel: willServe ? HALL_UI_TEXT.serve : config.isFirstStage ? HALL_UI_TEXT.accept : `\u2192 ${nextLabel}`,
 1925:       bulkLabel: willServe ? HALL_UI_TEXT.serveAll : config.isFirstStage ? HALL_UI_TEXT.acceptAll : `\u0412\u0441\u0435 \u2192 ${nextLabel}`,
 1926:     };
 1927:   }, [getStatusConfig]);
 1928: 
 1929:   const handleOrdersAction = useCallback((orders, rowId) => {
 1930:     if (advanceMutation.isPending) return;
 1931:     const actionable = orders.map((order) => ({ order, payload: buildAdvancePayload(order), meta: getOrderActionMeta(order) })).filter((entry) => entry.payload);
 1932:     if (actionable.length === 0) return;
 1933:     actionable.forEach(({ order, payload }) => {
 1934:       if (onClearNotified) onClearNotified(order.id);
 1935:       advanceMutation.mutate({ id: order.id, payload });
 1936:     });
 1937:     if (actionable.every(({ meta }) => meta.willServe)) startUndoWindow(actionable.map(({ order }) => order), rowId);
 1938:   }, [advanceMutation, buildAdvancePayload, getOrderActionMeta, onClearNotified, startUndoWindow]);
 1939:   const handleSingleAction = useCallback((order, rowId) => handleOrdersAction([order], rowId), [handleOrdersAction]);
 1940: 
 1941:   const guestName = useCallback((order) => {
 1942:     const guestId = getLinkId(order.guest);
 1943:     const guest = guestId && guestsMap ? guestsMap[guestId] : null;
 1944:     if (guest) return getGuestDisplayName(guest);
 1945:     if (order.client_name) return order.client_name;
 1946:     return '\u0413\u043E\u0441\u0442\u044C';
 1947:   }, [guestsMap]);
 1948:   const guestMarker = useCallback((order) => {
 1949:     const label = guestName(order);
 1950:     const marker = extractGuestMarker(label);
 1951:     return marker ? `\uD83D\uDC64${marker}` : label;
 1952:   }, [guestName]);
 1953: 
 1954:   const billData = useMemo(() => {
 1955:     if (group.type !== "table") return null;
 1956:     const guests = {};
 1957:     let total = 0;
 1958:     group.orders.filter((order) => order.status !== "cancelled").forEach((order) => {
 1959:       const gid = getLinkId(order.guest) || "__default";
 1960:       if (!guests[gid]) {
 1961:         const guest = gid !== "__default" && guestsMap ? guestsMap[gid] : null;
 1962:         const label = guest ? getGuestDisplayName(guest) : '\u0413\u043E\u0441\u0442\u044C';
 1963:         guests[gid] = { id: gid, name: label, marker: extractGuestMarker(label), total: 0 };
 1964:       }
 1965:       guests[gid].total += Number(order.total_amount || 0);
 1966:       total += Number(order.total_amount || 0);
 1967:     });
 1968:     return {
 1969:       guests: Object.values(guests).sort((a, b) => {
 1970:         const aMarker = Number(a.marker || Number.MAX_SAFE_INTEGER);
 1971:         const bMarker = Number(b.marker || Number.MAX_SAFE_INTEGER);
 1972:         if (aMarker !== bMarker) return aMarker - bMarker;
 1973:         return String(a.name || "").localeCompare(String(b.name || ""));
 1974:       }),
 1975:       total,
 1976:       paid: 0,
 1977:       remaining: total,
 1978:     };
 1979:   }, [group.orders, group.type, guestsMap]);
 1980: 
 1981:   const countRows = useCallback((rows, fallback) => {
 1982:     const count = rows.filter((row) => !row.loading).length;
 1983:     return count > 0 ? count : fallback;
 1984:   }, []);
 1985:   const getOldestAgeMinutes = useCallback((entries, getDate) => {
 1986:     if (!entries.length) return null;
 1987:     const oldest = Math.min(...entries.map((entry) => safeParseDate(getDate(entry)).getTime()));
 1988:     return Math.max(0, Math.floor((Date.now() - oldest) / 60000));
 1989:   }, []);
 1990: 
 1991:   const buildHallRows = useCallback((orders, { served = false } = {}) => {
 1992:     return orders.flatMap((order) => {
 1993:       const orderItems = served ? servedItemsByOrder[order.id] : itemsByOrder[order.id];
 1994:       const meta = getOrderActionMeta(order);
 1995:       const secondary = guestMarker(order);
 1996:       const timeLabel = served ? formatClockTime(order.updated_date || order.created_date) : null;
 1997:       if (!orderItems || orderItems.length === 0) {
 1998:         return [{ id: `${order.id}:${served ? "served" : "active"}:loading`, order, primary: HALL_UI_TEXT.loading, secondary, actionLabel: served ? null : meta.rowLabel, willServe: meta.willServe, loading: true, timeLabel }];
 1999:       }
 2000:       return orderItems.map((item, index) => ({ id: `${order.id}:${item.id || index}`, order, primary: `${item.dish_name || HALL_UI_TEXT.loading} \u00D7${item.quantity || 1}`, secondary, actionLabel: served ? null : meta.rowLabel, willServe: meta.willServe, loading: false, timeLabel }));
 2001:     });
 2002:   }, [getOrderActionMeta, guestMarker, itemsByOrder, servedItemsByOrder]);
 2003: 
 2004:   const newRows = useMemo(() => buildHallRows(newOrders), [buildHallRows, newOrders]);
 2005:   const readyRows = useMemo(() => buildHallRows(readyOrders), [buildHallRows, readyOrders]);
 2006:   const servedRows = useMemo(() => buildHallRows(servedOrders, { served: true }), [buildHallRows, servedOrders]);
 2007:   const requestSummary = tableRequests.length > 0 ? { key: "requests", kind: "requests", icon: Bell, label: null, count: tableRequests.length, ageMin: getOldestAgeMinutes(tableRequests, (request) => request.created_date) || 0 } : null;
 2008:   const newSummary = newOrders.length > 0 ? { key: "new", kind: "new", icon: null, label: HALL_UI_TEXT.newShort, count: countRows(newRows, newOrders.length), ageMin: getOldestAgeMinutes(newOrders, (order) => order.created_date) || 0 } : null;
 2009:   const readySummary = readyOrders.length > 0 ? { key: "ready", kind: "ready", icon: null, label: HALL_UI_TEXT.readyShort, count: countRows(readyRows, readyOrders.length), ageMin: getOldestAgeMinutes(readyOrders, (order) => order.stage_entered_at || order.created_date) || 0 } : null;
 2010:   const hallSummaryItems = [requestSummary, newSummary, readySummary].filter(Boolean);
 2011: 
 2012:   const inProgressSections = useMemo(() => subGroups.map(({ sid, orders, cfg }) => {
 2013:     const rows = buildHallRows(orders);
 2014:     const actionMeta = getOrderActionMeta(orders[0]);
 2015:     return { sid, orders, rows, rowCount: countRows(rows, orders.length), label: sid === "__null__" ? HALL_UI_TEXT.inProgress : cfg.label, bulkLabel: actionMeta.bulkLabel };
 2016:   }).filter((section) => section.orders.length > 0), [buildHallRows, countRows, getOrderActionMeta, subGroups]);
 2017: 
 2018:   const jumpChips = [
 2019:     tableRequests.length > 0 && { label: HALL_UI_TEXT.requestsShort, count: tableRequests.length, kind: "requests", tone: "red" },
 2020:     newOrders.length > 0 && { label: HALL_UI_TEXT.newShort, count: countRows(newRows, newOrders.length), kind: "new", tone: "blue" },
 2021:     inProgressOrders.length > 0 && { label: HALL_UI_TEXT.inProgressShort, count: inProgressSections.reduce((s, sec) => s + sec.rowCount, 0), kind: "inProgress", tone: "amber" },
 2022:     readyOrders.length > 0 && { label: HALL_UI_TEXT.readyShort, count: countRows(readyRows, readyOrders.length), kind: "ready", tone: "green" },
 2023:     billData && billData.total > 0 && { label: HALL_UI_TEXT.bill, count: formatHallMoney(billData.total), kind: "bill", tone: "gray" },
 2024:   ].filter(Boolean);
 2025: 
 2026:   const legacySummaryLines = useMemo(() => {
 2027:     const lines = [];
 2028:     if (newOrders.length > 0) lines.push({ key: "new", label: '\u041D\u043E\u0432\u044B\u0435', count: newOrders.length, ageMin: getOldestAgeMinutes(newOrders, (order) => order.created_date) || 0 });
 2029:     if (readyOrders.length > 0) lines.push({ key: "ready", label: '\u0413\u043E\u0442\u043E\u0432\u043E', count: readyOrders.length, ageMin: getOldestAgeMinutes(readyOrders, (order) => order.stage_entered_at || order.created_date) || 0 });
 2030:     if (inProgressOrders.length > 0) lines.push({ key: "progress", label: '\u0412 \u0440\u0430\u0431\u043E\u0442\u0435', count: inProgressOrders.length, ageMin: getOldestAgeMinutes(inProgressOrders, (order) => order.stage_entered_at || order.created_date) || 0 });
 2031:     return lines;
 2032:   }, [getOldestAgeMinutes, inProgressOrders, newOrders, readyOrders]);
 2033: 
 2034:   const ownershipState = useMemo(() => {
 2035:     if (group.type !== "table") return null;
 2036:     if (group.orders.some((order) => isOrderMine(order, effectiveUserId))) return "mine";
 2037:     if (group.orders.some((order) => !!getAssigneeId(order))) return "other";
 2038:     return "free";
 2039:   }, [effectiveUserId, group.orders, group.type]);
 2040: 
 2041:   const closeDisabledReasons = useMemo(() => {
 2042:     if (group.type !== "table") return [];
 2043:     const reasons = [];
 2044:     if (tableRequests.length > 0) reasons.push(HALL_UI_TEXT.requestsBlocker);
 2045:     if (newOrders.length > 0) reasons.push(HALL_UI_TEXT.newBlocker);
 2046:     if (inProgressOrders.length > 0) reasons.push(HALL_UI_TEXT.inProgressBlocker);
 2047:     if (readyOrders.length > 0) reasons.push(HALL_UI_TEXT.readyBlocker);
 2048:     return reasons;
 2049:   }, [group.type, tableRequests.length, newOrders.length, inProgressOrders.length, readyOrders.length]);
 2050:   const closeDisabledReason = closeDisabledReasons[0] || null;
 2051:   const reasonToKind = useMemo(() => ({
 2052:     [HALL_UI_TEXT.requestsBlocker]: "requests",
 2053:     [HALL_UI_TEXT.newBlocker]: "new",
 2054:     [HALL_UI_TEXT.inProgressBlocker]: "inProgress",
 2055:     [HALL_UI_TEXT.readyBlocker]: "ready",
 2056:   }), []);
 2057:   const handleCloseTableClick = useCallback(() => {
 2058:     const sessionId = group.orders.map((order) => getLinkId(order.table_session)).find(Boolean);
 2059:     if (onCloseTable && sessionId) {
 2060:       onCloseTable(sessionId, identifier);
 2061:       return;
 2062:     }
 2063:     if (onCloseAllOrders) onCloseAllOrders(group.orders);
 2064:   }, [group.orders, identifier, onCloseAllOrders, onCloseTable]);
 2065:   const showOtherTableHint = useCallback((event) => {
 2066:     event?.stopPropagation();
 2067:     if (ownershipState !== "other") return;
 2068:     setOwnerHintVisible(true);
 2069:     if (ownerHintTimerRef.current) clearTimeout(ownerHintTimerRef.current);
 2070:     ownerHintTimerRef.current = setTimeout(() => setOwnerHintVisible(false), 1600);
 2071:   }, [ownershipState]);
 2072: 
 2073:   const getSummaryTone = useCallback((kind, ageMin) => {
 2074:     if (kind === "requests") return ageMin >= 3 ? "text-red-600" : "text-violet-600";
 2075:     if (kind === "ready") return ageMin >= 5 ? "text-red-600" : "text-green-600";
 2076:     return ageMin >= (overdueMinutes || 10) ? "text-red-600" : "text-blue-600";
 2077:   }, [overdueMinutes]);
 2078: 
 2079:   const renderHallSummaryItem = useCallback((item) => {
 2080:     const Icon = item.icon;
 2081:     return (
 2082:       <button
 2083:         type="button"
 2084:         key={item.key}
 2085:         onClick={(e) => { e.stopPropagation(); scrollToSection(item.kind); }}
 2086:         className={`inline-flex items-center gap-1.5 text-xs font-medium cursor-pointer active:opacity-70 ${getSummaryTone(item.kind, item.ageMin)}`}
 2087:       >
 2088:         {Icon && <Icon className="w-3.5 h-3.5 shrink-0" />}
 2089:         {item.label && <span>{item.label}</span>}
 2090:         <span className="font-semibold text-slate-900">{item.count}</span>
 2091:         <span className="text-slate-300">{'\u00B7'}</span>
 2092:         <span>{formatCompactMinutes(item.ageMin)}</span>
 2093:       </button>
 2094:     );
 2095:   }, [getSummaryTone, scrollToSection]);
 2096: 
 2097:   const renderHallRows = useCallback((rows, tone = "slate", readOnly = false) => {
 2098:     const palette = {
 2099:       blue: { bg: "bg-blue-50/80", border: "border-blue-200", button: "border-blue-200 bg-white text-blue-700" },
 2100:       green: { bg: "bg-green-50/80", border: "border-green-200", button: "border-green-200 bg-white text-green-700" },
 2101:       amber: { bg: "bg-amber-50/80", border: "border-amber-200", button: "border-amber-200 bg-white text-amber-700" },
 2102:       slate: { bg: "bg-slate-50", border: "border-slate-200", button: "border-slate-200 bg-white text-slate-700" },
 2103:     }[tone] || { bg: "bg-slate-50", border: "border-slate-200", button: "border-slate-200 bg-white text-slate-700" };
 2104: 
 2105:     const toastOrderId = undoToast?.orderId;
 2106:     const renderedToast = new Set();
 2107: 
 2108:     return (
 2109:       <div className="space-y-1.5">
 2110:         {rows.map((row, idx) => {
 2111:           const isLastOfOrder = !rows[idx + 1] || rows[idx + 1].order?.id !== row.order?.id;
 2112:           const showToast = toastOrderId && row.order?.id === toastOrderId && (undoToast.rowId ? row.id === undoToast.rowId : isLastOfOrder) && !renderedToast.has(toastOrderId);
 2113:           if (showToast) renderedToast.add(toastOrderId);
 2114:           const ageMin = getAgeMinutes(row.order?.created_date);
 2115:           const overdueThreshold = overdueMinutes || 10;
 2116:           const urgencyClass = ageMin >= overdueThreshold + 5 ? "border-l-4 border-l-red-500" : ageMin >= overdueThreshold ? "border-l-4 border-l-amber-400" : "";
 2117: 
 2118:           return (
 2119:             <React.Fragment key={row.id}>
 2120:               <div className={`rounded-lg border ${palette.border} ${palette.bg} px-3 py-2 ${urgencyClass}`}>
 2121:                 <div className="flex items-center gap-3">
 2122:                   <div className="min-w-0 flex-1">
 2123:                     <div className="flex items-center gap-2 min-w-0">
 2124:                       <span className={`truncate text-sm ${row.loading ? "text-slate-400" : "font-medium text-slate-900"}`}>{row.primary}</span>
 2125:                       {row.secondary && <span className="shrink-0 text-xs text-slate-500">{row.secondary}</span>}
 2126:                     </div>
 2127:                   </div>
 2128:                   {readOnly ? (
 2129:                     <span className="shrink-0 text-xs text-slate-400">{row.timeLabel}</span>
 2130:                   ) : row.actionLabel ? (
 2131:                     <button type="button" onClick={() => handleSingleAction(row.order, row.id)} disabled={advanceMutation.isPending || row.loading} className={`shrink-0 rounded-lg border px-3 py-2 text-xs font-semibold min-h-[36px] active:scale-[0.98] disabled:opacity-60 ${row.willServe ? "border-green-200 bg-white text-green-700" : row.actionLabel === HALL_UI_TEXT.accept ? "border-blue-200 bg-white text-blue-700" : palette.button}`}>
 2132:                       {advanceMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : row.actionLabel}
 2133:                     </button>
 2134:                   ) : null}
 2135:                 </div>
 2136:               </div>
 2137:               {showToast && (
 2138:                 <div className="flex items-center justify-between bg-slate-800 text-white text-xs rounded-lg px-3 py-2">
 2139:                   <span>{undoToast.label || HALL_UI_TEXT.undoLabel}</span>
 2140:                   <button type="button" onClick={() => { if (undoToast.timerId) clearTimeout(undoToast.timerId); undoToast.onUndo(); setUndoToast(null); }} className="ml-3 font-semibold text-amber-300 underline min-h-[36px] flex items-center">{HALL_UI_TEXT.undo}</button>
 2141:                 </div>
 2142:               )}
 2143:             </React.Fragment>
 2144:           );
 2145:         })}
 2146:       </div>
 2147:     );
 2148:   }, [advanceMutation.isPending, handleSingleAction, undoToast, setUndoToast]);
 2149: 
 2150:   const renderLegacyOrderCard = useCallback((order) => {
 2151:     const config = getStatusConfig(order);
 2152:     const actionMeta = getOrderActionMeta(order);
 2153:     const orderItems = itemsByOrder[order.id] || [];
 2154:     const badgeStyle = config.color ? { backgroundColor: `${config.color}20`, borderColor: config.color, color: config.color } : undefined;
 2155:     const actionLabel = actionMeta.willServe ? HALL_UI_TEXT.serve : config.isFirstStage ? HALL_UI_TEXT.accept : actionMeta.nextLabel || config.actionLabel || '\u0414\u0430\u043B\u0435\u0435';
 2156:     return (
 2157:       <div key={order.id} className="rounded-lg border border-slate-200 bg-white px-3 py-3 space-y-2">
 2158:         <div className="flex items-center justify-between gap-3">
 2159:           <div className="min-w-0">
 2160:             <div className="truncate text-sm font-medium text-slate-900">{guestName(order)}</div>
 2161:             <div className="text-xs text-slate-400">{formatClockTime(order.created_date)}</div>
 2162:           </div>
 2163:           <Badge variant="outline" className={`text-[10px] ${config.badgeClass || ""}`} style={badgeStyle}>{config.label}</Badge>
 2164:         </div>
 2165:         <div className="space-y-1">
 2166:           {orderItems.length > 0 ? orderItems.map((item, index) => <div key={item.id || index} className="text-xs text-slate-600">{`${item.dish_name} \u00D7${item.quantity || 1}`}</div>) : <div className="text-xs text-slate-400">{HALL_UI_TEXT.loading}</div>}
 2167:         </div>
 2168:         <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-100">
 2169:           {order.order_number ? <span className="text-[10px] text-slate-400">{order.order_number}</span> : <span />}
 2170:           {buildAdvancePayload(order) && <button type="button" onClick={() => handleSingleAction(order)} disabled={advanceMutation.isPending} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 min-h-[36px] active:scale-[0.98] disabled:opacity-60">{advanceMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : actionLabel}</button>}
 2171:         </div>
 2172:       </div>
 2173:     );
 2174:   }, [advanceMutation.isPending, buildAdvancePayload, getOrderActionMeta, getStatusConfig, guestName, handleSingleAction, itemsByOrder]);
 2175: 
 2176:   const highlightRing = isHighlighted ? "ring-2 ring-indigo-400 ring-offset-1" : "";
 2177: 
 2178:   return (
 2179:     <div data-group-id={group.id} className={`mb-3 rounded-lg border border-slate-200 overflow-hidden transition-all duration-300 ${style.bgClass} ${style.borderClass} ${highlightRing}`}>
 2180:       <div className="px-4 pt-3 pb-3 cursor-pointer active:opacity-80" onClick={onToggleExpand} role="button" aria-expanded={isExpanded} aria-label={group.type === "table" ? identifier : `${identifier}: ${statusLabel}`}>
 2181:         {group.type === "table" ? (
 2182:           <div className="space-y-2">
 2183:             <div className="flex items-start justify-between gap-3">
 2184:               <div className="flex items-center gap-2 min-w-0">
 2185:                 {ownershipState === "mine" ? (
 2186:                   <span className="shrink-0"><Star className="w-4 h-4 fill-yellow-400 text-yellow-400" /></span>
 2187:                 ) : ownershipState === "other" ? (
 2188:                   <button type="button" onClick={showOtherTableHint} className="shrink-0 rounded-full p-0.5 -m-0.5" aria-label={HALL_UI_TEXT.otherTableTitle}>
 2189:                     <Lock className="w-4 h-4 text-slate-400" />
 2190:                   </button>
 2191:                 ) : (
 2192:                   <span className="shrink-0"><Star className="w-4 h-4 text-slate-300" /></span>
 2193:                 )}
 2194:                 <span className="inline-flex min-w-[2rem] items-center justify-center rounded-lg bg-slate-900 px-2.5 py-1 text-sm font-bold text-white">{compactTableLabel}</span>
 2195:                 {tableData?.zone_name && <span className="rounded-full bg-white/80 px-2 py-1 text-[11px] font-medium text-slate-600 border border-slate-200 truncate">{tableData.zone_name}</span>}
 2196:               </div>
 2197:               {isExpanded && <span className="text-xs font-semibold text-slate-500 shrink-0">{HALL_UI_TEXT.collapse}</span>}
 2198:             </div>
 2199:             {ownerHintVisible && (
 2200:               <div className="rounded-lg bg-slate-900 px-3 py-2 text-white">
 2201:                 <div className="text-xs font-semibold">{HALL_UI_TEXT.otherTableTitle}</div>
 2202:                 <div className="text-[11px] text-slate-200">{HALL_UI_TEXT.otherTableHint}</div>
 2203:               </div>
 2204:             )}
 2205:             {jumpChips.length > 0 ? <div className="flex flex-wrap items-center gap-1.5 mt-1">{jumpChips.map(chip => <button key={chip.kind} type="button" onClick={(e) => { e.stopPropagation(); setIsExpanded(true); scrollToSection(chip.kind); }} className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold border min-h-[32px] ${HALL_CHIP_STYLES[chip.tone]}`}>{`${chip.label} ${chip.count}`}</button>)}</div> : <div className="text-xs text-slate-400">{HALL_UI_TEXT.noActions}</div>}
 2206:           </div>
 2207:         ) : (
 2208:           <React.Fragment>
 2209:             <div className="flex items-start justify-between gap-2 mb-1">
 2210:               <span className="font-bold text-base leading-tight flex-1 min-w-0 text-slate-900 truncate">{identifier}</span>
 2211:               <span className={`text-xs font-medium shrink-0 flex items-center gap-0.5 ${isOverdue ? "text-red-600" : "text-slate-500"}`}><Clock className={`w-3 h-3 ${isOverdue ? "text-red-500" : ""}`} />{elapsedLabel}</span>
 2212:             </div>
 2213:             <div className="flex items-center gap-1.5 mb-1 flex-wrap">
 2214:               <span className="flex items-center gap-1 text-xs text-slate-500"><ChannelIcon className="w-3.5 h-3.5" />{channelConfig.label}</span>
 2215:               <span className="text-slate-300">{'\u00B7'}</span>
 2216:               <span className={`text-xs font-semibold ${style.textClass || "text-slate-700"}`}>{statusLabel}</span>
 2217:               {(newOrders.length > 0 || readyOrders.length > 0) && <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />}
 2218:               {contactInfo && (contactInfo.name || contactInfo.phone) && (
 2219:                 <React.Fragment>
 2220:                   <span className="text-xs text-slate-500 ml-auto truncate max-w-[120px]">{contactInfo.name || ""}</span>
 2221:                   {contactInfo.phone && <a href={`tel:${contactInfo.phone}`} onClick={(event) => event.stopPropagation()} className="text-xs text-blue-600 shrink-0">+7{'\u2026'}{contactInfo.phone.slice(-4)}</a>}
 2222:                 </React.Fragment>
 2223:               )}
 2224:             </div>
 2225:             {legacySummaryLines.length > 0 ? <div className="space-y-0.5 mt-0.5">{legacySummaryLines.map((line) => <div key={line.key} className="text-xs text-slate-700 flex items-center gap-1 leading-snug"><span className="font-medium">{`${line.count} ${line.label}`}</span><span className="text-slate-300">{'\u00B7'}</span><span>{`${line.ageMin} \u043C\u0438\u043D`}</span></div>)}</div> : <div className="text-xs text-slate-400">{'\u041D\u0435\u0442 \u0430\u043A\u0442\u0438\u0432\u043D\u044B\u0445 \u0437\u0430\u043A\u0430\u0437\u043E\u0432'}</div>}
 2226:           </React.Fragment>
 2227:         )}
 2228:       </div>
 2229: 
 2230:       <div className={`overflow-hidden transition-all duration-200 ease-out ${isExpanded ? "max-h-[3000px] opacity-100" : "max-h-0 opacity-0"}`}>
 2231:         <div className="border-t border-slate-200 px-4 py-3 space-y-4">
 2232:           {group.type === "table" ? (
 2233:             <React.Fragment>
 2234:               {tableRequests.length > 0 && <div ref={requestsSectionRef}><div className="mb-2 flex items-center justify-between gap-3"><div className="text-[11px] font-bold uppercase tracking-wider text-violet-600"><span className="bg-violet-50 rounded-md px-2 py-0.5">{`${HALL_UI_TEXT.requests} (${tableRequests.length})`}</span></div><ChevronDown className="w-4 h-4 text-slate-400" /></div><div className="space-y-1.5">{tableRequests.map((request) => { const ageMin = getAgeMinutes(request.created_date); const label = REQUEST_TYPE_LABELS[request.request_type] || request.request_type; const isAccepted = request.status === 'accepted'; const isAssignedToMe = request.assignee === effectiveUserId; return <div key={request.id} className="rounded-lg border border-violet-200 bg-violet-50/80 px-3 py-2"><div className="flex items-center gap-3"><div className="min-w-0 flex-1"><div className="flex items-center gap-2 min-w-0"><span className="truncate text-sm font-medium text-slate-900">{label}</span><span className="text-xs text-violet-500 shrink-0">{formatCompactMinutes(ageMin)}</span>{isAccepted && isAssignedToMe && staffName && <span className="shrink-0 rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-medium text-blue-700">{staffName}</span>}</div>{request.comment && <div className="mt-0.5 text-xs text-slate-500 truncate">{request.comment}</div>}</div>{onCloseRequest && (isAccepted ? <button type="button" onClick={() => onCloseRequest(request.id, "done")} disabled={isRequestPending} className="shrink-0 rounded-lg border border-green-200 bg-white px-3 py-2 text-xs font-semibold text-green-700 min-h-[36px] active:scale-[0.98] disabled:opacity-60">{HALL_UI_TEXT.serveRequest}</button> : <button type="button" onClick={() => onCloseRequest(request.id, "accepted", { assignee: effectiveUserId, assigned_at: new Date().toISOString() })} disabled={isRequestPending} className="shrink-0 rounded-lg border border-blue-200 bg-white px-3 py-2 text-xs font-semibold text-blue-700 min-h-[36px] active:scale-[0.98] disabled:opacity-60">{HALL_UI_TEXT.acceptRequest}</button>)}</div></div>; })}</div>{tableRequests.length > 0 && (() => { const allNew = tableRequests.every(r => !r.status || r.status === 'new' || r.status === 'open'); const allAccepted = tableRequests.every(r => r.status === 'accepted'); if (!allNew && !allAccepted) return null; return <div className="border-t border-red-100 pt-2 mt-2"><button type="button" onClick={allNew ? () => tableRequests.forEach(r => onCloseRequest(r.id, 'accepted', { assignee: effectiveUserId, assigned_at: new Date().toISOString() })) : () => tableRequests.forEach(r => onCloseRequest(r.id, 'done'))} disabled={isRequestPending} className="w-full rounded-lg bg-red-500 text-white px-4 py-2.5 text-sm font-semibold min-h-[44px] active:scale-[0.99] disabled:opacity-60">{allNew ? `${HALL_UI_TEXT.acceptAllRequests} (${tableRequests.length})` : `${HALL_UI_TEXT.serveAllRequests} (${tableRequests.length})`}</button></div>; })()}</div>}
 2235: 
 2236:               {newOrders.length > 0 && <div ref={newSectionRef}><div className="flex items-center justify-between gap-3 mb-2"><div className="text-[11px] font-bold uppercase tracking-wider text-blue-600"><span className="bg-blue-50 rounded-md px-2 py-0.5">{`${HALL_UI_TEXT.new} (${newOrders.length} ${pluralRu(newOrders.length, "\u0433\u043E\u0441\u0442\u044C", "\u0433\u043E\u0441\u0442\u044F", "\u0433\u043E\u0441\u0442\u0435\u0439")} \u00B7 ${countRows(newRows, newOrders.length)} ${pluralRu(countRows(newRows, newOrders.length), "\u0431\u043B\u044E\u0434\u043E", "\u0431\u043B\u044E\u0434\u0430", "\u0431\u043B\u044E\u0434")})`}</span></div><ChevronDown className="w-4 h-4 text-slate-400" /></div>{renderHallRows(newRows, "blue")}<div className="border-t border-blue-100 pt-2 mt-2"><button type="button" onClick={() => handleOrdersAction(newOrders)} disabled={advanceMutation.isPending} className="w-full rounded-lg bg-blue-600 text-white px-4 py-2.5 text-sm font-semibold min-h-[44px] active:scale-[0.99] disabled:opacity-60">{getOrderActionMeta(newOrders[0]).willServe ? `${HALL_UI_TEXT.serveAll} (${countRows(newRows, newOrders.length)})` : `${HALL_UI_TEXT.acceptAll} (${countRows(newRows, newOrders.length)})`}</button></div></div>}
 2237: 
 2238:               {inProgressSections.map((section, idx) => { const isSubExpanded = !!expandedSubGroups[section.sid]; return <div key={section.sid} ref={idx === 0 ? inProgressSectionRef : undefined}><button type="button" onClick={() => setExpandedSubGroups(prev => ({ ...prev, [section.sid]: !prev[section.sid] }))} className="mb-2 flex w-full items-center justify-between text-left"><div className="flex items-center gap-2 opacity-60"><span className="text-[11px] font-bold uppercase tracking-wider text-amber-600">{section.label}</span><span className="text-[11px] text-slate-400">{`\u00B7 ${section.orders.length} ${pluralRu(section.orders.length, "\u0433\u043E\u0441\u0442\u044C", "\u0433\u043E\u0441\u0442\u044F", "\u0433\u043E\u0441\u0442\u0435\u0439")} \u00B7 ${section.rowCount} ${pluralRu(section.rowCount, "\u0431\u043B\u044E\u0434\u043E", "\u0431\u043B\u044E\u0434\u0430", "\u0431\u043B\u044E\u0434")}`}</span></div><ChevronDown className={`w-4 h-4 text-slate-400 opacity-60 transition-transform ${isSubExpanded ? "rotate-180" : ""}`} /></button>{isSubExpanded && <div className="opacity-60">{renderHallRows(section.rows, "amber")}<div className="border-t border-amber-100 pt-2 mt-2"><button type="button" onClick={(e) => { e.stopPropagation(); handleOrdersAction(section.orders); }} disabled={advanceMutation.isPending} className="w-full rounded-lg bg-amber-500 text-white px-4 py-2.5 text-sm font-semibold min-h-[44px] active:scale-[0.99] disabled:opacity-60">{`${section.bulkLabel} (${section.rowCount})`}</button></div></div>}</div>; })}
 2239: 
 2240:               {readyOrders.length > 0 && <div ref={readySectionRef}><div className="flex items-center justify-between gap-3 mb-2"><div className="text-[11px] font-bold uppercase tracking-wider text-green-600"><span className="bg-green-50 rounded-md px-2 py-0.5">{`${HALL_UI_TEXT.ready} (${readyOrders.length} ${pluralRu(readyOrders.length, "\u0433\u043E\u0441\u0442\u044C", "\u0433\u043E\u0441\u0442\u044F", "\u0433\u043E\u0441\u0442\u0435\u0439")} \u00B7 ${countRows(readyRows, readyOrders.length)} ${pluralRu(countRows(readyRows, readyOrders.length), "\u0431\u043B\u044E\u0434\u043E", "\u0431\u043B\u044E\u0434\u0430", "\u0431\u043B\u044E\u0434")})`}</span></div><ChevronDown className="w-4 h-4 text-slate-400" /></div>{renderHallRows(readyRows, "green")}<div className="border-t border-green-100 pt-2 mt-2"><button type="button" onClick={() => handleOrdersAction(readyOrders)} disabled={advanceMutation.isPending} className="w-full rounded-lg bg-green-600 text-white px-4 py-2.5 text-sm font-semibold min-h-[44px] active:scale-[0.99] disabled:opacity-60">{`${HALL_UI_TEXT.serveAll} (${countRows(readyRows, readyOrders.length)})`}</button></div></div>}
 2241: 
 2242:               {servedOrders.length > 0 && <div><button type="button" onClick={() => setServedExpanded((prev) => !prev)} className="mb-2 flex w-full items-center justify-between text-left"><span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 opacity-60">{`${HALL_UI_TEXT.served} (${servedOrders.length} ${pluralRu(servedOrders.length, "\u0433\u043E\u0441\u0442\u044C", "\u0433\u043E\u0441\u0442\u044F", "\u0433\u043E\u0441\u0442\u0435\u0439")} \u00B7 ${countRows(servedRows, servedOrders.length)} ${pluralRu(countRows(servedRows, servedOrders.length), "\u0431\u043B\u044E\u0434\u043E", "\u0431\u043B\u044E\u0434\u0430", "\u0431\u043B\u044E\u0434")})`}</span><span className="text-xs font-medium text-slate-400">{servedExpanded ? HALL_UI_TEXT.hide : HALL_UI_TEXT.show}</span></button>{servedExpanded && <div className="opacity-60">{renderHallRows(servedRows, "slate", true)}</div>}</div>}
 2243: 
 2244:               {billData && billData.total > 0 && <div className={`rounded-xl border p-3 ${hasBillRequest ? "border-violet-300 bg-violet-50/80" : "border-slate-200 bg-slate-50"}`}><button type="button" onClick={() => setBillExpanded((prev) => !prev)} className="flex w-full items-start justify-between gap-3 text-left"><div className="min-w-0 flex-1"><div className="text-[11px] font-bold uppercase tracking-wider text-slate-600">{HALL_UI_TEXT.bill}</div><div className="mt-1 text-sm font-semibold text-slate-900">{`${HALL_UI_TEXT.total} ${formatHallMoney(billData.total)}`}</div>{!billExpanded && billData.remaining < billData.total && <div className="mt-1 text-xs text-slate-500">{`${HALL_UI_TEXT.remaining} ${formatHallMoney(billData.remaining)}`}</div>}</div>{billExpanded ? <ChevronUp className="w-4 h-4 text-slate-400 mt-1" /> : <ChevronDown className="w-4 h-4 text-slate-400 mt-1" />}</button>{billExpanded && <div className="mt-3 space-y-2 border-t border-slate-200 pt-3">{billData.guests.map((guest, index) => <div key={`${guest.id}:${index}`} className="flex items-center justify-between gap-3 text-sm"><span className="text-slate-600">{guest.name}</span><span className="font-medium text-slate-900">{formatHallMoney(guest.total)}</span></div>)}<div className="border-t border-slate-200 pt-2 space-y-1 text-sm"><div className="flex items-center justify-between gap-3"><span className="text-slate-500">{HALL_UI_TEXT.paid}</span><span className="font-medium text-slate-700">{formatHallMoney(billData.paid)}</span></div><div className="flex items-center justify-between gap-3 font-semibold text-slate-900"><span>{HALL_UI_TEXT.remaining}</span><span>{formatHallMoney(billData.remaining)}</span></div></div></div>}</div>}
 2245: 
 2246:               {onCloseTable && group.orders.length > 0 && <div className="pt-2 border-t border-slate-200"><button type="button" onClick={handleCloseTableClick} disabled={!!closeDisabledReason} className={`w-full min-h-[44px] flex items-center justify-center gap-2 font-medium text-sm rounded-lg border transition-all active:scale-[0.99] ${closeDisabledReason ? "bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed" : "bg-red-50 text-red-600 border-red-200 hover:bg-red-100"}`}><X className="w-4 h-4" />{HALL_UI_TEXT.closeTable}</button>{closeDisabledReasons.length > 0 && <p className="mt-1.5 text-[11px] text-slate-400 text-center leading-relaxed">{`${HALL_UI_TEXT.closeHint} `}{closeDisabledReasons.map((reason, i) => { const kind = reasonToKind[reason]; const countMap = { requests: `${tableRequests.length} \u0437\u0430\u043F\u0440.`, new: `${newOrders.length} \u043D\u043E\u0432.`, inProgress: `${inProgressOrders.length} \u0432 \u0440\u0430\u0431\u043E\u0442\u0435`, ready: `${readyOrders.length} \u0433\u043E\u0442.` }; const actionMap = { requests: HALL_UI_TEXT.closeActionRequests, new: HALL_UI_TEXT.closeActionNew, inProgress: HALL_UI_TEXT.closeActionInProgress, ready: HALL_UI_TEXT.closeActionReady }; const actionText = actionMap[kind] ? `${actionMap[kind]} ${countMap[kind] || ""}` : reason; return <React.Fragment key={kind || i}>{i > 0 && <span> · </span>}<button type="button" onClick={() => scrollToSection(kind)} className="text-red-500 font-medium active:text-red-700">{`\u2192 ${actionText}`}</button></React.Fragment>; })}</p>}</div>}
 2247:             </React.Fragment>
 2248:           ) : (
 2249:             <React.Fragment>
 2250:               {newOrders.length > 0 && <div><div className="flex items-center justify-between mb-2"><p className="text-[11px] font-bold text-blue-600 uppercase tracking-wider"><span className="bg-blue-50 rounded-md px-2 py-0.5">{`\u041D\u043E\u0432\u044B\u0435 (${newOrders.length})`}</span></p><button type="button" onClick={() => handleOrdersAction(newOrders)} disabled={advanceMutation.isPending} className="text-xs font-semibold text-blue-600 bg-blue-50 border border-blue-200 px-3 py-1 rounded min-h-[44px] active:scale-95 disabled:opacity-60">{'\u041F\u0440\u0438\u043D\u044F\u0442\u044C \u0432\u0441\u0435'}</button></div><div className="space-y-2">{newOrders.map(renderLegacyOrderCard)}</div></div>}
 2251:               {inProgressOrders.length > 0 && <div><div className="flex items-center justify-between mb-2 cursor-pointer min-h-[44px]" onClick={() => setInProgressExpanded((prev) => !prev)}><p className="text-[11px] font-bold text-amber-400 uppercase tracking-wider opacity-60">{`\u0412 \u0440\u0430\u0431\u043E\u0442\u0435 (${inProgressOrders.length})`}</p><ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${inProgressExpanded ? "rotate-180" : ""}`} /></div>{inProgressExpanded && <div className="space-y-3">{subGroups.map(({ sid, orders, cfg }) => { const isSubExpanded = !!expandedSubGroups[sid]; const actionMeta = getOrderActionMeta(orders[0]); const subGroupLabel = sid === "__null__" ? '\u0412 \u0420\u0410\u0411\u041E\u0422\u0415' : cfg.label; if (subGroups.length === 1) return <div key={sid} className="space-y-2">{orders.map(renderLegacyOrderCard)}</div>; return <div key={sid}><div className="flex items-center justify-between mb-1.5 cursor-pointer min-h-[44px]" onClick={() => setExpandedSubGroups((prev) => ({ ...prev, [sid]: !prev[sid] }))}><div className="flex items-center gap-2"><ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${isSubExpanded ? "rotate-180" : ""}`} /><span className="text-[11px] font-bold text-amber-600 uppercase tracking-wider">{`${subGroupLabel} (${orders.length})`}</span></div><button type="button" onClick={(event) => { event.stopPropagation(); handleOrdersAction(orders); }} disabled={advanceMutation.isPending} className="text-xs font-semibold text-amber-600 bg-amber-50 border border-amber-200 px-3 py-1 rounded min-h-[36px] active:scale-95 disabled:opacity-60">{actionMeta.bulkLabel}</button></div>{isSubExpanded && <div className="space-y-2">{orders.map(renderLegacyOrderCard)}</div>}</div>; })}</div>}</div>}
 2252:               {readyOrders.length > 0 && <div><div className="flex items-center justify-between mb-2"><p className="text-[11px] font-bold text-green-600 uppercase tracking-wider"><span className="bg-green-50 rounded-md px-2 py-0.5">{`\u0413\u043E\u0442\u043E\u0432\u043E \u043A \u0432\u044B\u0434\u0430\u0447\u0435 (${readyOrders.length})`}</span></p><button type="button" onClick={() => handleOrdersAction(readyOrders)} disabled={advanceMutation.isPending} className="text-xs font-semibold text-green-600 bg-green-50 border border-green-200 px-3 py-1 rounded min-h-[44px] active:scale-95 disabled:opacity-60">{'\u0412\u044B\u0434\u0430\u0442\u044C \u0432\u0441\u0435'}</button></div><div className="space-y-2">{readyOrders.map(renderLegacyOrderCard)}</div></div>}
 2253:               {contactInfo && <div className="space-y-2 pt-2 border-t border-slate-200">{contactInfo.name && <div className="flex items-center gap-2 text-sm"><User className="w-4 h-4 text-slate-400" /><span className="text-slate-700">{contactInfo.name}</span></div>}{contactInfo.phone && <div className="flex items-center gap-2 text-sm"><Phone className="w-4 h-4 text-slate-400" /><a href={`tel:${contactInfo.phone}`} className="text-blue-600 underline">{contactInfo.phone}</a></div>}{contactInfo.address && <div className="flex items-center gap-2 text-sm"><MapPin className="w-4 h-4 text-slate-400" /><span className="text-slate-600">{contactInfo.address}</span></div>}</div>}
 2254:             </React.Fragment>
 2255:           )}
 2256:         </div>
 2257:       </div>
 2258:     </div>
 2259:   );
 2260: }
 2261: 
 2262: function MyTablesModal({ open, onClose, tables, favorites, onToggleFavorite, onClearAll }) {
 2263:   const [search, setSearch] = useState("");
 2264: 
 2265:   if (!open) return null;
 2266: 
 2267:   const filteredTables = tables.filter((t) => {
 2268:     if (!search.trim()) return true;
 2269:     const q = search.toLowerCase();
 2270:     return (t.name && t.name.toLowerCase().includes(q)) || (t.zone_name && t.zone_name.toLowerCase().includes(q));
 2271:   });
 2272: 
 2273:   const sortedTables = [...filteredTables].sort((a, b) => {
 2274:     const aId = getLinkId(a.id);
 2275:     const bId = getLinkId(b.id);
 2276:     const aFav = aId && favorites.includes(`table:${aId}`);
 2277:     const bFav = bId && favorites.includes(`table:${bId}`);
 2278:     if (aFav && !bFav) return -1;
 2279:     if (!aFav && bFav) return 1;
 2280:     return (a.name || "").localeCompare(b.name || "");
 2281:   });
 2282: 
 2283:   return (
 2284:     <div className="fixed inset-0 z-50">
 2285:       <button type="button" className="absolute inset-0 bg-black/40" onClick={onClose} aria-label="Закрыть" />
 2286:       <div className="absolute inset-x-0 bottom-0 max-h-[80vh] bg-white rounded-t-2xl shadow-xl flex flex-col">
 2287:         <div className="flex items-center justify-between p-4 border-b border-slate-200">
 2288:           <div className="flex items-center gap-2">
 2289:             <Star className="w-5 h-5 text-yellow-500 fill-yellow-400" />
 2290:             <span className="font-bold text-slate-900">Мои столы</span>
 2291:             <span className="text-sm text-slate-500">({favorites.length})</span>
 2292:           </div>
 2293:           <button type="button" onClick={onClose} className="p-2 -m-2 text-slate-400 hover:text-slate-600">
 2294:             <X className="w-5 h-5" />
 2295:           </button>
 2296:         </div>
 2297: 
 2298:         <div className="p-3 border-b border-slate-100">
 2299:           <div className="relative">
 2300:             <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
 2301:             <input
 2302:               type="text"
 2303:               placeholder="Поиск по номеру или зоне…"
 2304:               value={search}
 2305:               onChange={(e) => setSearch(e.target.value)}
 2306:               className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200"
 2307:             />
 2308:           </div>
 2309:         </div>
 2310: 
 2311:         <div className="flex-1 overflow-y-auto p-3 space-y-1">
 2312:           {sortedTables.length === 0 ? (
 2313:             <div className="text-center py-8 text-slate-400 text-sm">
 2314:               {search ? "Ничего не найдено" : "Нет столов"}
 2315:             </div>
 2316:           ) : (
 2317:             sortedTables.map((table) => {
 2318:               const tId = getLinkId(table.id);
 2319:               const isFav = tId && favorites.includes(`table:${tId}`);
 2320:               return (
 2321:                 <button
 2322:                   key={table.id}
 2323:                   type="button"
 2324:                   onClick={() => tId && onToggleFavorite('table', tId)}
 2325:                   className={`w-full flex items-center justify-between p-3 rounded-lg border transition-all ${
 2326:                     isFav ? "bg-yellow-50 border-yellow-200" : "bg-white border-slate-200 hover:border-slate-300"
 2327:                   }`}
 2328:                 >
 2329:                   <div className="flex items-center gap-3">
 2330:                     <Star className={`w-5 h-5 ${isFav ? "fill-yellow-400 text-yellow-400" : "text-slate-300"}`} />
 2331:                     <div className="text-left">
 2332:                       <div className="font-medium text-slate-900">Стол {table.name}</div>
 2333:                       {table.zone_name && <div className="text-xs text-slate-500">{table.zone_name}</div>}
 2334:                     </div>
 2335:                   </div>
 2336:                   {isFav && <span className="text-xs text-yellow-600 bg-yellow-100 px-2 py-0.5 rounded">Мой</span>}
 2337:                 </button>
 2338:               );
 2339:             })
 2340:           )}
 2341:         </div>
 2342: 
 2343:         {favorites.length > 0 && (
 2344:           <div className="p-3 border-t border-slate-200">
 2345:             <Button
 2346:               variant="outline"
 2347:               size="sm"
 2348:               onClick={onClearAll}
 2349:               className="w-full text-red-600 border-red-200 hover:bg-red-50"
 2350:             >
 2351:               <Trash2 className="w-4 h-4 mr-2" />
 2352:               Очистить мои столы ({favorites.length})
 2353:             </Button>
 2354:           </div>
 2355:         )}
 2356:       </div>
 2357:     </div>
 2358:   );
 2359: }
 2360: 
 2361: function ProfileSheet({ 
 2362:   open, 
 2363:   onClose, 
 2364:   staffName, 
 2365:   staffRole, 
 2366:   partnerName, 
 2367:   isKitchen,
 2368:   favoritesCount,
 2369:   onOpenMyTables,
 2370:   onLogout,
 2371: }) {
 2372:   const [helpExpanded, setHelpExpanded] = useState(false);
 2373: 
 2374:   if (!open) return null;
 2375: 
 2376:   const roleLabel = ROLE_LABELS[staffRole] || staffRole || "Сотрудник";
 2377: 
 2378:   const waiterHelpItems = [
 2379:     "«Мои» — заказы, которые вы взяли в работу",
 2380:     "«Свободные» — новые заказы, возьмите любой",
 2381:     "«Принять» — взять заказ себе",
 2382:     "«Выдать» — когда отдали заказ гостю",
 2383:     "⭐ — отметьте свои столы для быстрого доступа",
 2384:   ];
 2385: 
 2386:   const kitchenHelpItems = [
 2387:     "Здесь только заказы, переданные на кухню",
 2388:     "«Готово» — блюдо готово, официант заберёт",
 2389:     "Запросы гостей (счёт, салфетки) вам не показываются",
 2390:     "Заказы со статусом «Новый» вам не видны",
 2391:   ];
 2392: 
 2393:   const helpItems = isKitchen ? kitchenHelpItems : waiterHelpItems;
 2394: 
 2395:   return (
 2396:     <div className="fixed inset-0 z-50">
 2397:       <button type="button" className="absolute inset-0 bg-black/40" onClick={onClose} aria-label="Закрыть" />
 2398:       <div className="absolute inset-x-0 bottom-0 max-h-[85vh] bg-white rounded-t-2xl shadow-xl flex flex-col">
 2399:         {/* Header */}
 2400:         <div className="p-4 border-b border-slate-200">
 2401:           <div className="flex items-center justify-between mb-3">
 2402:             <div className="flex items-center gap-3">
 2403:               <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center">
 2404:                 <User className="w-6 h-6 text-indigo-600" />
 2405:               </div>
 2406:               <div>
 2407:                 <div className="font-bold text-lg text-slate-900">{staffName || "Сотрудник"}</div>
 2408:                 <div className="text-sm text-slate-500">
 2409:                   {roleLabel} · {partnerName || "Ресторан"}
 2410:                 </div>
 2411:               </div>
 2412:             </div>
 2413:             <button type="button" onClick={onClose} className="p-2 -m-2 text-slate-400 hover:text-slate-600">
 2414:               <X className="w-5 h-5" />
 2415:             </button>
 2416:           </div>
 2417:         </div>
 2418: 
 2419:         {/* Content */}
 2420:         <div className="flex-1 overflow-y-auto">
 2421:           {/* My Tables (only for non-kitchen) */}
 2422:           {!isKitchen && (
 2423:             <button
 2424:               type="button"
 2425:               onClick={() => {
 2426:                 onClose();
 2427:                 onOpenMyTables();
 2428:               }}
 2429:               className="w-full flex items-center justify-between p-4 border-b border-slate-100 hover:bg-slate-50 transition-colors"
 2430:             >
 2431:               <div className="flex items-center gap-3">
 2432:                 <Star className={`w-5 h-5 ${favoritesCount > 0 ? "fill-yellow-400 text-yellow-400" : "text-slate-400"}`} />
 2433:                 <span className="font-medium text-slate-900">Мои столы</span>
 2434:                 {favoritesCount > 0 && (
 2435:                   <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">
 2436:                     {favoritesCount}
 2437:                   </span>
 2438:                 )}
 2439:               </div>
 2440:               <ChevronRight className="w-5 h-5 text-slate-400" />
 2441:             </button>
 2442:           )}
 2443: 
 2444:           {/* Help Section */}
 2445:           <div className="border-b border-slate-100">
 2446:             <button
 2447:               type="button"
 2448:               onClick={() => setHelpExpanded(!helpExpanded)}
 2449:               className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors"
 2450:             >
 2451:               <div className="flex items-center gap-3">
 2452:                 <HelpCircle className="w-5 h-5 text-slate-400" />
 2453:                 <span className="font-medium text-slate-900">Как работать</span>
 2454:               </div>
 2455:               <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${helpExpanded ? "rotate-180" : ""}`} />
 2456:             </button>
 2457:             
 2458:             {helpExpanded && (
 2459:               <div className="px-4 pb-4">
 2460:                 <div className="bg-slate-50 rounded-lg p-3 space-y-2">
 2461:                   {helpItems.map((item, idx) => (
 2462:                     <div key={idx} className="flex items-start gap-2 text-sm text-slate-600">
 2463:                       <span className="text-slate-400 mt-0.5">•</span>
 2464:                       <span>{item}</span>
 2465:                     </div>
 2466:                   ))}
 2467:                 </div>
 2468:               </div>
 2469:             )}
 2470:           </div>
 2471:         </div>
 2472: 
 2473:         {/* Footer - Logout */}
 2474:         <div className="p-4 border-t border-slate-200">
 2475:           <Button
 2476:             variant="outline"
 2477:             onClick={onLogout}
 2478:             className="w-full text-red-600 border-red-200 hover:bg-red-50"
 2479:           >
 2480:             <LogOut className="w-4 h-4 mr-2" />
 2481:             Выйти
 2482:           </Button>
 2483:         </div>
 2484:       </div>
 2485:     </div>
 2486:   );
 2487: }
 2488: 
 2489: function SettingsPanel({ 
 2490:   open, 
 2491:   onClose, 
 2492:   pollingInterval, 
 2493:   onChangePollingInterval, 
 2494:   sortMode, 
 2495:   onChangeSortMode,
 2496:   selectedTypes,
 2497:   onToggleChannel,
 2498:   channelCounts,
 2499: }) {
 2500:   if (!open) return null;
 2501: 
 2502:   return (
 2503:     <div className="fixed inset-0 z-40">
 2504:       <button type="button" className="absolute inset-0 bg-black/30" onClick={onClose} aria-label="Закрыть" />
 2505:       <div className="absolute inset-x-0 bottom-0 max-h-[80vh] bg-white rounded-t-2xl shadow-xl flex flex-col">
 2506:         <div className="flex items-center justify-between p-4 border-b border-slate-200">
 2507:           <span className="font-bold text-slate-900">Настройки</span>
 2508:           <button type="button" onClick={onClose} className="p-2 -m-2 text-slate-400 hover:text-slate-600">
 2509:             <X className="w-5 h-5" />
 2510:           </button>
 2511:         </div>
 2512:         
 2513:         <div className="flex-1 overflow-y-auto p-4 space-y-5">
 2514:           {/* Channels */}
 2515:           <div className="space-y-2">
 2516:             <div className="text-sm font-medium text-slate-700">Каналы заказов</div>
 2517:             <div className="flex gap-2">
 2518:               <IconToggle 
 2519:                 icon={Utensils} 
 2520:                 label="Зал" 
 2521:                 count={channelCounts.hall} 
 2522:                 selected={selectedTypes.includes("hall")} 
 2523:                 onClick={() => onToggleChannel("hall")} 
 2524:                 tone="indigo" 
 2525:               />
 2526:               <IconToggle 
 2527:                 icon={ShoppingBag} 
 2528:                 label="Самовыв" 
 2529:                 count={channelCounts.pickup} 
 2530:                 selected={selectedTypes.includes("pickup")} 
 2531:                 onClick={() => onToggleChannel("pickup")} 
 2532:                 tone="fuchsia" 
 2533:               />
 2534:               <IconToggle 
 2535:                 icon={Truck} 
 2536:                 label="Доставка" 
 2537:                 count={channelCounts.delivery} 
 2538:                 selected={selectedTypes.includes("delivery")} 
 2539:                 onClick={() => onToggleChannel("delivery")} 
 2540:                 tone="teal" 
 2541:               />
 2542:             </div>
 2543:           </div>
 2544: 
 2545:           {/* Polling */}
 2546:           <div className="space-y-2">
 2547:             <div className="text-sm font-medium text-slate-700">Автообновление</div>
 2548:             <div className="grid grid-cols-5 gap-2">
 2549:               {POLLING_OPTIONS.map((opt) => (
 2550:                 <button
 2551:                   key={opt.value}
 2552:                   type="button"
 2553:                   onClick={() => onChangePollingInterval(opt.value)}
 2554:                   className={`py-2 px-1 text-sm rounded-lg border transition-all ${
 2555:                     pollingInterval === opt.value
 2556:                       ? "bg-indigo-600 text-white border-indigo-600"
 2557:                       : "bg-white text-slate-600 border-slate-200 hover:border-indigo-300"
 2558:                   }`}
 2559:                 >
 2560:                   {opt.label}
 2561:                 </button>
 2562:               ))}
 2563:             </div>
 2564:           </div>
 2565: 
 2566:           {/* Sort Mode */}
 2567:           <div className="space-y-2">
 2568:             <div className="text-sm font-medium text-slate-700">Сортировка</div>
 2569:             <div className="space-y-2">
 2570:               <label 
 2571:                 className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
 2572:                   sortMode === "priority" 
 2573:                     ? "bg-indigo-50 border-indigo-300 ring-1 ring-indigo-200" 
 2574:                     : "bg-white border-slate-200 hover:border-slate-300"
 2575:                 }`}
 2576:                 onClick={() => onChangeSortMode("priority")}
 2577:               >
 2578:                 <input 
 2579:                   type="radio" 
 2580:                   name="sortMode" 
 2581:                   checked={sortMode === "priority"} 
 2582:                   onChange={() => onChangeSortMode("priority")}
 2583:                   className="mt-0.5"
 2584:                 />
 2585:                 <div>
 2586:                   <div className="text-sm font-medium text-slate-900">По приоритету</div>
 2587:                   <div className="text-[11px] text-slate-500 mt-0.5">
 2588:                     Готов → Новый → Готовится → Принят
 2589:                   </div>
 2590:                 </div>
 2591:               </label>
 2592:               
 2593:               <label 
 2594:                 className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
 2595:                   sortMode === "time" 
 2596:                     ? "bg-indigo-50 border-indigo-300 ring-1 ring-indigo-200" 
 2597:                     : "bg-white border-slate-200 hover:border-slate-300"
 2598:                 }`}
 2599:                 onClick={() => onChangeSortMode("time")}
 2600:               >
 2601:                 <input 
 2602:                   type="radio" 
 2603:                   name="sortMode" 
 2604:                   checked={sortMode === "time"} 
 2605:                   onChange={() => onChangeSortMode("time")}
 2606:                   className="mt-0.5"
 2607:                 />
 2608:                 <div>
 2609:                   <div className="text-sm font-medium text-slate-900">По времени</div>
 2610:                   <div className="text-[11px] text-slate-500 mt-0.5">
 2611:                     Используйте ↑↓ для переключения направления
 2612:                   </div>
 2613:                 </div>
 2614:               </label>
 2615:             </div>
 2616:           </div>
 2617:         </div>
 2618:       </div>
 2619:     </div>
 2620:   );
 2621: }
 2622: 
 2623: /* ═══════════════════════════════════════════════════════════════════════════
 2624:    SPRINT D: V2-09 Banner Notification Component
 2625: ═══════════════════════════════════════════════════════════════════════════ */
 2626: 
 2627: /**
 2628:  * BannerNotification — in-app overlay banner for new order events.
 2629:  * Fixed at top of viewport, z-60 (above sticky header z-20, detail view z-30, modals z-40).
 2630:  * Auto-hides after 5s. Swipe-up or tap X to dismiss. Tap body → navigate to relevant group.
 2631:  * Non-blocking: pointer-events only on the banner itself, not full-screen overlay.
 2632:  *
 2633:  * Props:
 2634:  *   banner: { id, text, groupId, count } | null
 2635:  *   onDismiss: () => void
 2636:  *   onNavigate: (groupId) => void
 2637:  */
 2638: function BannerNotification({ banner, onDismiss, onNavigate }) {
 2639:   const [visible, setVisible] = useState(false);
 2640:   const [dismissing, setDismissing] = useState(false);
 2641:   const touchStartY = useRef(null);
 2642:   const autoHideTimer = useRef(null);
 2643:   const dismissAnimTimer = useRef(null);
 2644: 
 2645:   // Clear all pending timers
 2646:   const clearTimers = useCallback(() => {
 2647:     if (autoHideTimer.current) { clearTimeout(autoHideTimer.current); autoHideTimer.current = null; }
 2648:     if (dismissAnimTimer.current) { clearTimeout(dismissAnimTimer.current); dismissAnimTimer.current = null; }
 2649:   }, []);
 2650: 
 2651:   // Animate in on mount / new banner
 2652:   useEffect(() => {
 2653:     if (!banner) {
 2654:       setVisible(false);
 2655:       setDismissing(false);
 2656:       return;
 2657:     }
 2658:     setDismissing(false);
 2659:     // Small delay to trigger CSS transition
 2660:     const raf = requestAnimationFrame(() => setVisible(true));
 2661:     // Auto-hide after 5s
 2662:     autoHideTimer.current = setTimeout(() => {
 2663:       setDismissing(true);
 2664:       dismissAnimTimer.current = setTimeout(() => onDismiss(), 300);
 2665:     }, 5000);
 2666:     return () => {
 2667:       cancelAnimationFrame(raf);
 2668:       clearTimers();
 2669:     };
 2670:   }, [banner?.id]);
 2671: 
 2672:   const handleDismiss = useCallback(() => {
 2673:     clearTimers();
 2674:     setDismissing(true);
 2675:     dismissAnimTimer.current = setTimeout(() => onDismiss(), 300);
 2676:   }, [onDismiss, clearTimers]);
 2677: 
 2678:   const handleTap = useCallback(() => {
 2679:     clearTimers();
 2680:     if (banner?.groupId) {
 2681:       onNavigate(banner.groupId);
 2682:     }
 2683:     setDismissing(true);
 2684:     dismissAnimTimer.current = setTimeout(() => onDismiss(), 200);
 2685:   }, [banner, onNavigate, onDismiss, clearTimers]);
 2686: 
 2687:   const handleTouchStart = useCallback((e) => {
 2688:     touchStartY.current = e.touches[0].clientY;
 2689:   }, []);
 2690: 
 2691:   const handleTouchEnd = useCallback((e) => {
 2692:     if (touchStartY.current === null) return;
 2693:     const deltaY = e.changedTouches[0].clientY - touchStartY.current;
 2694:     touchStartY.current = null;
 2695:     // Swipe up to dismiss (threshold: 30px)
 2696:     if (deltaY < -30) handleDismiss();
 2697:   }, [handleDismiss]);
 2698: 
 2699:   if (!banner) return null;
 2700: 
 2701:   const translateClass = visible && !dismissing
 2702:     ? 'translate-y-0 opacity-100'
 2703:     : '-translate-y-full opacity-0';
 2704: 
 2705:   return (
 2706:     <div
 2707:       className={`fixed top-0 left-0 right-0 z-[60] flex justify-center px-3 pt-2 transition-all duration-300 ease-out ${translateClass}`}
 2708:       style={{ pointerEvents: 'none' }}
 2709:     >
 2710:       <div
 2711:         className="w-full max-w-md bg-indigo-600 text-white rounded-xl shadow-lg px-4 py-3 flex items-center gap-3"
 2712:         style={{ pointerEvents: 'auto' }}
 2713:         onClick={handleTap}
 2714:         onTouchStart={handleTouchStart}
 2715:         onTouchEnd={handleTouchEnd}
 2716:         role="alert"
 2717:         aria-live="assertive"
 2718:       >
 2719:         <Bell className="w-5 h-5 shrink-0" />
 2720:         <span className="flex-1 text-sm font-medium leading-tight">{banner.text}</span>
 2721:         <button
 2722:           type="button"
 2723:           onClick={(e) => { e.stopPropagation(); handleDismiss(); }}
 2724:           className="shrink-0 w-7 h-7 flex items-center justify-center rounded-full bg-white/20 active:bg-white/30"
 2725:           aria-label="Закрыть"
 2726:         >
 2727:           <X className="w-4 h-4" />
 2728:         </button>
 2729:       </div>
 2730:     </div>
 2731:   );
 2732: }
 2733: 
 2734: /* ═══════════════════════════════════════════════════════════════════════════
 2735:    MAIN COMPONENT
 2736: ═══════════════════════════════════════════════════════════════════════════ */
 2737: 
 2738: export default function StaffOrdersMobile() {
 2739:   const queryClient = useQueryClient();
 2740:   const { t } = useI18n(); // BUG-S76-01/02: translate stage names
 2741: 
 2742:   const [urlParams] = useState(() => new URLSearchParams(window.location.search));
 2743:   const token = urlParams.get("token");
 2744:   const isTokenMode = !!token;
 2745: 
 2746:   const deviceId = useMemo(() => getOrCreateDeviceId(), []);
 2747:   const didBindRef = useRef(false);
 2748:   const didUpdateLastActiveRef = useRef(false);
 2749:   const didAutoBindRef = useRef(false);
 2750:   
 2751:   // P0-4: Ref to track loaded guest IDs (prevents re-fetching on each poll)
 2752:   const loadedGuestIdsRef = useRef(new Set());
 2753: 
 2754:   const [rateLimitHit, setRateLimitHit] = useState(false);
 2755: 
 2756:   const [toastMsg, setToastMsg] = useState(null);
 2757:   const toastTimerRef = useRef(null);
 2758:   const showToast = (msg) => {
 2759:     setToastMsg(msg);
 2760:     if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
 2761:     toastTimerRef.current = setTimeout(() => setToastMsg(null), 1400);
 2762:   };
 2763:   useEffect(() => () => toastTimerRef.current && clearTimeout(toastTimerRef.current), []);
 2764: 
 2765:   const [selectedTypes, setSelectedTypes] = useState(() => [...ALL_CHANNELS]);
 2766:   const [assignFilters, setAssignFilters] = useState(() => [...ALL_ASSIGN_FILTERS]);
 2767:   
 2768:   const [sortMode, setSortMode] = useState(() => loadSortMode());
 2769:   const [sortOrder, setSortOrder] = useState(() => loadSortOrder());
 2770:   
 2771:   const [manualRefreshTs, setManualRefreshTs] = useState(null);
 2772:   const [pollingInterval, setPollingInterval] = useState(() => loadPollingInterval());
 2773:   const [settingsOpen, setSettingsOpen] = useState(false);
 2774:   const [profileOpen, setProfileOpen] = useState(false);
 2775: 
 2776:   // D1-005: State for batch-loaded guests
 2777:   const [guestsMap, setGuestsMap] = useState({});
 2778: 
 2779:   const handleChangePollingInterval = (val) => {
 2780:     setPollingInterval(val);
 2781:     savePollingInterval(val);
 2782:     showToast(val === 0 ? "Ручное обновление" : `Авто ${val / 1000}с`);
 2783:   };
 2784: 
 2785:   const handleChangeSortMode = (mode) => {
 2786:     setSortMode(mode);
 2787:     saveSortMode(mode);
 2788:     showToast(mode === "priority" ? "По приоритету" : "По времени");
 2789:   };
 2790: 
 2791:   const toggleSortOrder = () => {
 2792:     setSortOrder((prev) => {
 2793:       const next = prev === "newest" ? "oldest" : "newest";
 2794:       saveSortOrder(next);
 2795:       showToast(next === "newest" ? "Сначала новые" : "Сначала старые");
 2796:       return next;
 2797:     });
 2798:   };
 2799: 
 2800:   const lastFilterChangeRef = useRef(0);
 2801: 
 2802:   const [notifPrefs, setNotifPrefs] = useState(() => loadNotifPrefs());
 2803:   const [notifDot, setNotifDot] = useState(false);
 2804:   const [notifOpen, setNotifOpen] = useState(false);
 2805:   
 2806:   const [notifiedOrderIds, setNotifiedOrderIds] = useState(() => new Set());
 2807: 
 2808:   // V2-09: Sprint D — Banner notification state
 2809:   const [bannerData, setBannerData] = useState(null);
 2810:   const bannerIdCounter = useRef(0);
 2811: 
 2812:   // v3.6.0: Close table confirmation dialog state
 2813:   const [closeTableConfirm, setCloseTableConfirm] = useState(null); // { sessionId, tableName } | null
 2814:   const [undoToast, setUndoToast] = useState(null); // lifted from OrderGroupCard — survives card unmount
 2815: 
 2816:   const updateNotifPrefs = (patch) => {
 2817:     setNotifPrefs((prev) => {
 2818:       const next = { ...prev, ...patch };
 2819:       saveNotifPrefs(next);
 2820:       return next;
 2821:     });
 2822:   };
 2823: 
 2824:   const audioRef = useRef(null);
 2825:   const audioUnlockedRef = useRef(false);
 2826:   useEffect(() => {
 2827:     audioRef.current = createBeep();
 2828:   }, []);
 2829:   const unlockAudio = async () => {
 2830:     if (audioUnlockedRef.current) return;
 2831:     audioUnlockedRef.current = true;
 2832:     if (audioRef.current?.resume) await audioRef.current.resume();
 2833:   };
 2834:   useEffect(() => {
 2835:     const h = () => {
 2836:       unlockAudio();
 2837:       window.removeEventListener("pointerdown", h);
 2838:     };
 2839:     window.addEventListener("pointerdown", h, { passive: true });
 2840:     return () => window.removeEventListener("pointerdown", h);
 2841:   }, []);
 2842: 
 2843:   // SESS-016: Auto-expire stale sessions (runs every 5 min while page is open)
 2844:   useEffect(() => {
 2845:     const cleanup = async () => {
 2846:       try {
 2847:         const result = await runSessionCleanup({ dryRun: false });
 2848:         if (result.expired > 0 || result.skipped_stale > 0 || result.errors.length > 0) {
 2849:           console.log('[SessionCleanup]', result);
 2850:         }
 2851:       } catch (err) {
 2852:         console.log('[SessionCleanup] error:', err.message);
 2853:       }
 2854:     };
 2855:     cleanup();
 2856:     const interval = setInterval(cleanup, 5 * 60 * 1000);
 2857:     return () => clearInterval(interval);
 2858:   }, []);
 2859: 
 2860:   const ownMutationRef = useRef(null);
 2861:   const trackOwnMutation = (orderId, nextStatus) => {
 2862:     ownMutationRef.current = { orderId, nextStatus, ts: Date.now() };
 2863:   };
 2864: 
 2865:   const { data: links, isLoading: loadingToken, error: linkError } = useQuery({
 2866:     queryKey: ["staffLink", token],
 2867:     queryFn: () => base44.entities.StaffAccessLink.filter({ token }),
 2868:     enabled: !!token,
 2869:     retry: shouldRetry,
 2870:   });
 2871: 
 2872:   useEffect(() => {
 2873:     if (linkError && isRateLimitError(linkError)) {
 2874:       queryClient.cancelQueries();
 2875:       setRateLimitHit(true);
 2876:     }
 2877:   }, [linkError]);
 2878: 
 2879:   const link = links?.[0];
 2880: 
 2881:   const { data: currentUser, isLoading: loadingUser, error: userError } = useQuery({
 2882:     queryKey: ["currentUser"],
 2883:     queryFn: () => base44.auth.me(),
 2884:     retry: shouldRetry,
 2885:     enabled: !isTokenMode || (!!link && CABINET_ACCESS_ROLES.includes(link.staff_role) && !link.invited_user && !!link.invite_email),
 2886:   });
 2887: 
 2888:   useEffect(() => {
 2889:     if (userError && isRateLimitError(userError)) {
 2890:       queryClient.cancelQueries();
 2891:       setRateLimitHit(true);
 2892:     }
 2893:   }, [userError]);
 2894: 
 2895:   // P0-5: Safe currentUserId with fallback chain
 2896:   const currentUserId = currentUser?.id ?? currentUser?._id ?? currentUser?.user_id ?? null;
 2897: 
 2898:   const effectiveUserId = useMemo(() => {
 2899:     if (isTokenMode && link?.id) return link.id;
 2900:     if (currentUserId) return currentUserId;
 2901:     return null;
 2902:   }, [isTokenMode, link?.id, currentUserId]);
 2903: 
 2904:   const userOrTokenId = useMemo(() => {
 2905:     if (isTokenMode && link?.id) return `token_${link.id}`;
 2906:     if (currentUserId) return `user_${currentUserId}`;
 2907:     // P0-5: Fallback to email for localStorage key if no id
 2908:     if (currentUser?.email) return `email_${currentUser.email}`;
 2909:     return "anon";
 2910:   }, [isTokenMode, link?.id, currentUserId, currentUser?.email]);
 2911: 
 2912:   const [favorites, setFavorites] = useState([]);
 2913:   const [myTablesOpen, setMyTablesOpen] = useState(false);
 2914:   const favoritesInitializedRef = useRef(false);
 2915: 
 2916:   // v2.7.0: Expanded groups state
 2917:   const [expandedGroups, setExpandedGroups] = useState(new Set());
 2918: 
 2919:   // v2.7.1: Tabs and favorites filter state
 2920:   const [activeTab, setActiveTab] = useState('active'); // 'active' | 'completed'
 2921:   const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);
 2922: 
 2923:   // v4.0.0: Expand/collapse — max 1 expanded card at a time
 2924:   const [expandedGroupId, setExpandedGroupId] = useState(null);
 2925: 
 2926:   useEffect(() => {
 2927:     if (favoritesInitializedRef.current) return;
 2928:     if (userOrTokenId === "anon") return;
 2929:     
 2930:     // v2.7.0: Helper to normalize favorites array with prefix migration
 2931:     const normalizeFavorites = (arr) => 
 2932:       (arr || []).map(item => {
 2933:         const id = getLinkId(item);
 2934:         if (!id) return null;
 2935:         if (!id.includes(':')) return `table:${id}`; // migrate old format
 2936:         return id;
 2937:       }).filter(Boolean);
 2938:     
 2939:     if (isTokenMode && link) {
 2940:       favoritesInitializedRef.current = true;
 2941:       if (Array.isArray(link.favorite_tables) && link.favorite_tables.length > 0) {
 2942:         setFavorites(normalizeFavorites(link.favorite_tables));
 2943:       } else {
 2944:         setFavorites(normalizeFavorites(loadMyTables(userOrTokenId)));
 2945:       }
 2946:     } else if (!isTokenMode && currentUser) {
 2947:       favoritesInitializedRef.current = true;
 2948:       setFavorites(normalizeFavorites(loadMyTables(userOrTokenId)));
 2949:     }
 2950:   }, [userOrTokenId, isTokenMode, link, currentUser]);
 2951: 
 2952:   const updateLinkMutation = useMutation({
 2953:     mutationFn: ({ id, payload }) => base44.entities.StaffAccessLink.update(id, payload),
 2954:     onSuccess: (_data, vars) => {
 2955:       const keys = Object.keys(vars?.payload || {});
 2956:       const needRefetch = keys.includes("bound_device_id") || 
 2957:                           keys.includes("is_active") ||
 2958:                           keys.includes("favorite_tables") ||
 2959:                           keys.includes("invited_user");
 2960:       if (needRefetch) {
 2961:         queryClient.invalidateQueries({ queryKey: ["staffLink", token] });
 2962:       }
 2963:     },
 2964:     onError: (err) => {
 2965:       if (isRateLimitError(err)) {
 2966:         queryClient.cancelQueries();
 2967:         setRateLimitHit(true);
 2968:       }
 2969:     },
 2970:   });
 2971: 
 2972:   // v2.7.0: Updated signature to (type, id)
 2973:   const toggleFavorite = useCallback((type, id) => {
 2974:     const normalizedId = getLinkId(id);
 2975:     if (!normalizedId) return;
 2976:     const key = `${type}:${normalizedId}`;
 2977:     
 2978:     setFavorites((prev) => {
 2979:       const next = prev.includes(key) ? prev.filter((x) => x !== key) : [...prev, key];
 2980:       
 2981:       saveMyTables(userOrTokenId, next);
 2982:       
 2983:       if (isTokenMode && link?.id) {
 2984:         updateLinkMutation.mutate({
 2985:           id: link.id,
 2986:           payload: { favorite_tables: next },
 2987:         });
 2988:       }
 2989:       
 2990:       return next;
 2991:     });
 2992:   }, [userOrTokenId, isTokenMode, link?.id, updateLinkMutation]);
 2993: 
 2994:   // v2.7.0: Helper to check if item is favorite
 2995:   const isFavorite = useCallback((type, id) => 
 2996:     favorites.includes(`${type}:${id}`), [favorites]);
 2997: 
 2998:   const clearAllFavorites = () => {
 2999:     setFavorites([]);
 3000:     saveMyTables(userOrTokenId, []);
 3001:     
 3002:     if (isTokenMode && link?.id) {
 3003:       updateLinkMutation.mutate({
 3004:         id: link.id,
 3005:         payload: { favorite_tables: [] },
 3006:       });
 3007:     }
 3008:     
 3009:     showToast("Столы очищены");
 3010:   };
 3011:   
 3012:   const clearNotified = (orderId) => {
 3013:     setNotifiedOrderIds((prev) => {
 3014:       const next = new Set(prev);
 3015:       next.delete(orderId);
 3016:       return next;
 3017:     });
 3018:   };
 3019: 
 3020:   const effectiveRole = isTokenMode ? link?.staff_role : currentUser?.user_role;
 3021:   const isKitchen = effectiveRole === "kitchen";
 3022:   const staffName = isTokenMode ? link?.staff_name : currentUser?.full_name;
 3023: 
 3024:   const tokenState = useMemo(() => {
 3025:     if (!isTokenMode) return "no_token";
 3026:     if (loadingToken) return "loading_link";
 3027:     if (!link || !link.is_active) return "inactive";
 3028:     const bound = String(link.bound_device_id || "").trim();
 3029:     if (!bound) return "bind_needed";
 3030:     if (bound !== deviceId) return "locked";
 3031:     return "ok";
 3032:   }, [isTokenMode, loadingToken, link, deviceId]);
 3033: 
 3034:   useEffect(() => {
 3035:     didBindRef.current = false;
 3036:   }, [token]);
 3037: 
 3038:   useEffect(() => {
 3039:     if (!isTokenMode || !link || tokenState !== "bind_needed" || didBindRef.current || rateLimitHit) return;
 3040:     didBindRef.current = true;
 3041:     updateLinkMutation.mutate({
 3042:       id: link.id,
 3043:       payload: { bound_device_id: deviceId, bound_at: new Date().toISOString(), last_used_at: new Date().toISOString() },
 3044:     });
 3045:   }, [isTokenMode, link?.id, tokenState, deviceId, rateLimitHit]);
 3046: 
 3047:   const linkIdRef = useRef(null);
 3048:   useEffect(() => {
 3049:     linkIdRef.current = link?.id || null;
 3050:   }, [link?.id]);
 3051: 
 3052:   useEffect(() => {
 3053:     if (!isTokenMode || tokenState !== "ok" || rateLimitHit) return;
 3054:     
 3055:     const tick = () => {
 3056:       const currentLinkId = linkIdRef.current;
 3057:       if (!currentLinkId) return;
 3058:       base44.entities.StaffAccessLink.update(currentLinkId, { 
 3059:         last_used_at: new Date().toISOString() 
 3060:       }).catch((err) => {
 3061:         if (isRateLimitError(err)) {
 3062:           queryClient.cancelQueries();
 3063:           setRateLimitHit(true);
 3064:         }
 3065:       });
 3066:     };
 3067:     
 3068:     const t = setInterval(tick, 60000);
 3069:     return () => clearInterval(t);
 3070:   }, [isTokenMode, tokenState, rateLimitHit, queryClient]);
 3071: 
 3072:   // Global undo handler — works after OrderGroupCard unmounts
 3073:   const handleUndoGlobal = () => {
 3074:     if (!undoToast) return;
 3075:     clearTimeout(undoToast.timerId);
 3076:     undoToast.onUndo();
 3077:     setUndoToast(null);
 3078:   };
 3079: 
 3080:   useEffect(() => {
 3081:     if (didUpdateLastActiveRef.current) return;
 3082:     if (!isTokenMode || !link?.id || tokenState !== "ok" || rateLimitHit) return;
 3083:     
 3084:     didUpdateLastActiveRef.current = true;
 3085:     
 3086:     base44.entities.StaffAccessLink.update(link.id, {
 3087:       last_active_at: new Date().toISOString()
 3088:     }).catch((err) => {
 3089:       if (isRateLimitError(err)) {
 3090:         queryClient.cancelQueries();
 3091:         setRateLimitHit(true);
 3092:       }
 3093:     });
 3094:   }, [isTokenMode, link?.id, tokenState, rateLimitHit, queryClient]);
 3095: 
 3096:   // P0: Авто-bind для директоров - P0-5: only if currentUserId exists
 3097:   useEffect(() => {
 3098:     if (!isTokenMode || !link || tokenState !== "ok" || rateLimitHit) return;
 3099:     if (!currentUserId || !currentUser?.email) return; // P0-5: check currentUserId, not currentUser?.id
 3100:     if (didAutoBindRef.current) return;
 3101:     
 3102:     if (!CABINET_ACCESS_ROLES.includes(link.staff_role)) return;
 3103:     if (link.invited_user) return;
 3104:     if (!link.invite_email) return;
 3105:     
 3106:     const userEmail = currentUser.email.toLowerCase().trim();
 3107:     const inviteEmail = link.invite_email.toLowerCase().trim();
 3108:     if (userEmail !== inviteEmail) return;
 3109:     
 3110:     didAutoBindRef.current = true;
 3111:     
 3112:     base44.entities.StaffAccessLink.update(link.id, {
 3113:       invited_user: currentUserId, // P0-5: use currentUserId, not currentUser.id
 3114:       invite_accepted_at: new Date().toISOString()
 3115:     }).then(() => {
 3116:       showToast("Доступ к кабинету активирован");
 3117:       queryClient.invalidateQueries({ queryKey: ["staffLink", token] });
 3118:     }).catch((err) => {
 3119:       if (isRateLimitError(err)) {
 3120:         queryClient.cancelQueries();
 3121:         setRateLimitHit(true);
 3122:       }
 3123:     });
 3124:   }, [isTokenMode, link, tokenState, currentUser, currentUserId, rateLimitHit, token, queryClient]);
 3125: 
 3126:   const handleLogout = () => {
 3127:     if (isTokenMode && link?.id) {
 3128:       updateLinkMutation.mutate({
 3129:         id: link.id,
 3130:         payload: { bound_device_id: null, bound_at: null },
 3131:       });
 3132:     }
 3133:     
 3134:     clearAllStaffData();
 3135:     showToast("Выход выполнен");
 3136:     setTimeout(() => {
 3137:       window.location.href = "/";
 3138:     }, 500);
 3139:   };
 3140: 
 3141:   const gateView = useMemo(() => {
 3142:     if (rateLimitHit) {
 3143:       return (
 3144:         <RateLimitScreen 
 3145:           onRetry={() => {
 3146:             setRateLimitHit(false);
 3147:             didBindRef.current = false;
 3148:             didUpdateLastActiveRef.current = false;
 3149:             didAutoBindRef.current = false;
 3150:             loadedGuestIdsRef.current = new Set(); // P0-4: reset loaded guests on retry
 3151:             queryClient.invalidateQueries();
 3152:           }} 
 3153:         />
 3154:       );
 3155:     }
 3156:     if (loadingToken || loadingUser) {
 3157:       return (
 3158:         <div className="min-h-screen flex items-center justify-center bg-slate-100">
 3159:           <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
 3160:         </div>
 3161:       );
 3162:     }
 3163:     if (isTokenMode) {
 3164:       if (tokenState === "locked") return <LockedScreen />;
 3165:       if (tokenState === "bind_needed" || updateLinkMutation.isPending) return <BindingScreen />;
 3166:       if (tokenState !== "ok") {
 3167:         return (
 3168:           <div className="min-h-screen flex items-center justify-center bg-slate-100 p-6">
 3169:             <Card className="p-6 text-center text-red-500">Ссылка недействительна.</Card>
 3170:           </div>
 3171:         );
 3172:       }
 3173:     }
 3174:     if (!token && !currentUser) {
 3175:       return (
 3176:         <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4 text-center">
 3177:           <div>
 3178:             <h1 className="text-xl font-bold text-slate-900 mb-2">Необходимо войти</h1>
 3179:             <p className="text-slate-500 text-sm">Доступ по приглашению или ссылке ресторана.</p>
 3180:           </div>
 3181:         </div>
 3182:       );
 3183:     }
 3184:     if (!token) {
 3185:       const role = currentUser?.user_role;
 3186:       const valid = ["admin", "partner_owner", "partner_manager", "partner_staff", "kitchen", "director", "managing_director"];
 3187:       if (!role || !valid.includes(role)) {
 3188:         return (
 3189:           <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4 text-center">
 3190:             <div>
 3191:               <h1 className="text-xl font-bold text-slate-900 mb-2">Нет доступа</h1>
 3192:               <p className="text-slate-500 text-sm">Роль не настроена.</p>
 3193:             </div>
 3194:           </div>
 3195:         );
 3196:       }
 3197:       if (["partner_staff", "kitchen", "partner_owner", "partner_manager", "director", "managing_director"].includes(role) && !currentUser.partner) {
 3198:         return (
 3199:           <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4 text-center">
 3200:             <div>
 3201:               <h1 className="text-xl font-bold text-slate-900 mb-2">Нет доступа</h1>
 3202:               <p className="text-slate-500 text-sm">Ресторан не выбран.</p>
 3203:             </div>
 3204:           </div>
 3205:         );
 3206:       }
 3207:     }
 3208:     return null;
 3209:   }, [loadingToken, token, loadingUser, isTokenMode, tokenState, updateLinkMutation.isPending, currentUser, rateLimitHit]);
 3210: 
 3211:   const partnerId = useMemo(() => {
 3212:     if (isTokenMode) return link?.partner || null;
 3213:     return currentUser?.partner || null;
 3214:   }, [isTokenMode, link?.partner, currentUser?.partner]);
 3215: 
 3216:   const canFetch = useMemo(() => {
 3217:     if (isTokenMode) return tokenState === "ok";
 3218:     return !!currentUser;
 3219:   }, [isTokenMode, tokenState, currentUser]);
 3220: 
 3221:   const { data: partnerData } = useQuery({
 3222:     queryKey: ["partner", partnerId],
 3223:     queryFn: () => base44.entities.Partner.filter({ id: partnerId }),
 3224:     enabled: canFetch && !!partnerId,
 3225:     retry: shouldRetry,
 3226:     select: (data) => data?.[0],
 3227:   });
 3228:   const partnerName = partnerData?.name || "Ресторан";
 3229: 
 3230:   const shiftStartTime = useMemo(() => {
 3231:     return getShiftStartTime(partnerData?.working_hours);
 3232:   }, [partnerData?.working_hours]);
 3233: 
 3234:   const { data: tables } = useQuery({
 3235:     queryKey: ["tables", partnerId],
 3236:     queryFn: () => (partnerId ? base44.entities.Table.filter({ partner: partnerId }) : base44.entities.Table.list()),
 3237:     enabled: canFetch,
 3238:     retry: shouldRetry,
 3239:   });
 3240:   const tableMap = useMemo(
 3241:     () => tables?.reduce((acc, t) => ({ ...acc, [t.id]: { name: t.name, zone_name: t.zone_name } }), {}) || {},
 3242:     [tables]
 3243:   );
 3244: 
 3245:   // ═══════════════════════════════════════════════════════════════════════════
 3246:   // P0-2: FIXED - removed .list() to be consistent with other .filter() calls
 3247:   // ═══════════════════════════════════════════════════════════════════════════
 3248:   const { data: orderStages = [], error: stagesError } = useQuery({
 3249:     queryKey: ["orderStages", partnerId],
 3250:     queryFn: () => base44.entities.OrderStage.filter({ 
 3251:       partner: partnerId, 
 3252:       is_active: true 
 3253:     }), // P0-2: removed .list()
 3254:     enabled: canFetch && !!partnerId && !rateLimitHit,
 3255:     staleTime: 60000, // 1 minute — stages rarely change
 3256:     retry: shouldRetry,
 3257:   });
 3258: 
 3259:   useEffect(() => {
 3260:     if (stagesError && isRateLimitError(stagesError)) {
 3261:       queryClient.cancelQueries();
 3262:       setRateLimitHit(true);
 3263:     }
 3264:   }, [stagesError]);
 3265: 
 3266:   // Sorted stages by sort_order
 3267:   const sortedStages = useMemo(() => {
 3268:     return [...orderStages].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
 3269:   }, [orderStages]);
 3270: 
 3271:   // Map for quick lookup by ID
 3272:   // Map for quick lookup by normalized ID
 3273:   const stagesMap = useMemo(() => {
 3274:     return orderStages.reduce((acc, stage) => {
 3275:       const normalizedId = getLinkId(stage.id);
 3276:       if (normalizedId) {
 3277:         acc[normalizedId] = stage;
 3278:       }
 3279:       return acc;
 3280:     }, {});
 3281:   }, [orderStages]);
 3282: 
 3283:   /**
 3284:    * Gets status configuration for an order (ORD-005, ORD-009)
 3285:    * Priority: stage_id → fallback to STATUS_FLOW
 3286:    * P0-1: Uses normalized stageId
 3287:    */
 3288:   const getStatusConfig = useCallback((order) => {
 3289:     // P0-1: Normalize stage_id before lookup
 3290:     const stageId = getLinkId(order.stage_id);
 3291:     
 3292:     // Priority 1: If stage_id exists and stage is found
 3293:     if (stageId && stagesMap[stageId]) {
 3294:       const stage = stagesMap[stageId];
 3295:       
 3296:       // Filter stages by order channel (ORD-001, ORD-003)
 3297:       const relevantStages = getStagesForOrder(order, sortedStages);
 3298:       
 3299:       // Find current stage index and next stage (normalize stage.id for comparison)
 3300:       const currentIndex = relevantStages.findIndex(s => getLinkId(s.id) === stageId);
 3301:       const nextStage = currentIndex >= 0 && currentIndex < relevantStages.length - 1
 3302:         ? relevantStages[currentIndex + 1]
 3303:         : null;
 3304:       
 3305:       // Determine if this is first or finish stage
 3306:       const isFirstStage = stage.internal_code === 'start' || currentIndex === 0;
 3307:       const isFinishStage = stage.internal_code === 'finish' || currentIndex === relevantStages.length - 1;
 3308:       const nextIsFinish = nextStage && (
 3309:         nextStage.internal_code === 'finish' ||
 3310:         (currentIndex + 1) === relevantStages.length - 1
 3311:       );
 3312:       const directServeFromStart = isFirstStage && nextIsFinish && relevantStages.length <= 2;
 3313: 
 3314:       return {
 3315:         label: getStageName(stage, t),
 3316:         color: stage.color,
 3317:         actionLabel: nextStage ? (nextIsFinish ? 'Выдать' : `→ ${getStageName(nextStage, t)}`) : null,
 3318:         nextStageId: nextStage?.id || null,
 3319:         derivedNextStatus: (() => {
 3320:           if (!nextStage) return null;
 3321:           const nextIsLast = currentIndex + 1 === relevantStages.length - 1;
 3322:           if (directServeFromStart) return 'served';
 3323:           if (isFirstStage) return 'accepted';
 3324:           if (nextIsLast) return 'served';
 3325:           return 'in_progress';
 3326:         })(),
 3327:         nextStatus: null, // don't use old status
 3328:         badgeClass: '', // will use inline style with color
 3329:         isStageMode: true,
 3330:         isFirstStage,
 3331:         isFinishStage,
 3332:       };
 3333:     }
 3334:     
 3335:     // Priority 2: Fallback to STATUS_FLOW
 3336:     const flow = STATUS_FLOW[order.status];
 3337:     return {
 3338:       label: flow?.label || STAGE_NAME_FALLBACKS[order.status] || order.status,
 3339:       color: null,
 3340:       actionLabel: flow?.actionLabel || null,
 3341:       nextStageId: null,
 3342:       nextStatus: flow?.nextStatus || null,
 3343:       badgeClass: flow?.badgeClass || "bg-slate-100",
 3344:       isStageMode: false,
 3345:       isFirstStage: order.status === 'new',
 3346:       isFinishStage: order.status === 'ready' || order.status === 'served',
 3347:     };
 3348:   }, [stagesMap, sortedStages, t]);
 3349: 
 3350:   const effectivePollingInterval = rateLimitHit ? false : (pollingInterval === 0 ? false : pollingInterval);
 3351: 
 3352:   const {
 3353:     data: orders,
 3354:     isLoading: loadingOrders,
 3355:     isError: ordersError,
 3356:     error: ordersErrorObj,
 3357:     refetch: refetchOrders,
 3358:     dataUpdatedAt: ordersUpdatedAt,
 3359:   } = useQuery({
 3360:     queryKey: ["orders", partnerId],
 3361:     queryFn: () => (partnerId ? base44.entities.Order.filter({ partner: partnerId }) : base44.entities.Order.list("-created_date", 1000)),
 3362:     enabled: canFetch && !rateLimitHit,
 3363:     refetchInterval: effectivePollingInterval,
 3364:     refetchIntervalInBackground: false,
 3365:     retry: shouldRetry,
 3366:   });
 3367: 
 3368:   useEffect(() => {
 3369:     if (ordersErrorObj && isRateLimitError(ordersErrorObj)) {
 3370:       queryClient.cancelQueries();
 3371:       setRateLimitHit(true);
 3372:     }
 3373:   }, [ordersErrorObj]);
 3374: 
 3375:   const {
 3376:     data: allRequests,
 3377:     isError: requestsError,
 3378:     error: requestsErrorObj,
 3379:     refetch: refetchRequests,
 3380:     dataUpdatedAt: requestsUpdatedAt,
 3381:   } = useQuery({
 3382:     queryKey: ["serviceRequests", partnerId],
 3383:     queryFn: () => (partnerId ? base44.entities.ServiceRequest.filter({ partner: partnerId }) : base44.entities.ServiceRequest.list()),
 3384:     enabled: canFetch && !isKitchen && !rateLimitHit,
 3385:     refetchInterval: effectivePollingInterval,
 3386:     refetchIntervalInBackground: false,
 3387:     retry: shouldRetry,
 3388:   });
 3389: 
 3390:   useEffect(() => {
 3391:     if (requestsErrorObj && isRateLimitError(requestsErrorObj)) {
 3392:       queryClient.cancelQueries();
 3393:       setRateLimitHit(true);
 3394:     }
 3395:   }, [requestsErrorObj]);
 3396: 
 3397:   const lastUpdatedAt = Math.max(ordersUpdatedAt || 0, requestsUpdatedAt || 0) || null;
 3398: 
 3399:   const activeRequests = useMemo(() => {
 3400:     if (!allRequests || isKitchen) return [];
 3401:     
 3402:     const shiftCutoff = shiftStartTime.getTime();
 3403:     
 3404:     return allRequests.filter((r) => {
 3405:       // SHIFT FILTER
 3406:       const createdAt = safeParseDate(r.created_date).getTime();
 3407:       if (createdAt < shiftCutoff) return false;
 3408:       
 3409:       // Existing status filter
 3410:       return !["done", "cancelled"].includes(r.status);
 3411:     });
 3412:   }, [allRequests, isKitchen, shiftStartTime]);
 3413: 
 3414:   const updateRequestMutation = useMutation({
 3415:     mutationFn: (payload) => { const { id, ...fields } = payload; return base44.entities.ServiceRequest.update(id, fields); },
 3416:     onSuccess: () => queryClient.invalidateQueries({ queryKey: ["serviceRequests"] }),
 3417:     onError: (err) => {
 3418:       if (isRateLimitError(err)) {
 3419:         queryClient.cancelQueries();
 3420:         setRateLimitHit(true);
 3421:       }
 3422:     },
 3423:   });
 3424: 
 3425:   // Filter orders by status (using both stage_id and status for hybrid support)
 3426:   // P0-1: Uses normalized stageId
 3427:   const activeOrders = useMemo(() => {
 3428:     if (!orders) return [];
 3429:     
 3430:     const shiftCutoff = shiftStartTime.getTime();
 3431:     
 3432:     return orders.filter((o) => {
 3433:       // P0-3: For hall orders, require table_session (filter out legacy/orphan orders)
 3434:       if (o.order_type === 'hall' && !getLinkId(o.table_session)) return false;
 3435: 
 3436:       // SHIFT FILTER: only orders created after shift start
 3437:       const createdAt = safeParseDate(o.created_date).getTime();
 3438:       if (createdAt < shiftCutoff) return false;
 3439: 
 3440:       // Existing status filter (unchanged)
 3441:       const stageId = getLinkId(o.stage_id);
 3442:       if (stageId && stagesMap[stageId]) {
 3443:         const stage = stagesMap[stageId];
 3444:         if (stage.internal_code === 'finish') {
 3445:           return o.status !== 'served' && o.status !== 'closed' && o.status !== 'cancelled';
 3446:         }
 3447:         return true;
 3448:       }
 3449:       return ["new", "accepted", "in_progress", "ready"].includes(o.status);
 3450:     });
 3451:   }, [orders, stagesMap, shiftStartTime]);
 3452: 
 3453:   // Kitchen filter: only see accepted, in_progress, ready (NOT new)
 3454:   // P0-1: Uses normalized stageId
 3455:   const roleFilteredOrders = useMemo(() => {
 3456:     if (!isKitchen) return activeOrders;
 3457:     return activeOrders.filter((o) => {
 3458:       // P0-1: Normalize stage_id
 3459:       const stageId = getLinkId(o.stage_id);
 3460:       
 3461:       // For stage mode: check if it's past the start stage
 3462:       if (stageId && stagesMap[stageId]) {
 3463:         const stage = stagesMap[stageId];
 3464:         return stage.internal_code !== 'start';
 3465:       }
 3466:       // Fallback: legacy status
 3467:       return ["accepted", "in_progress", "ready"].includes(o.status);
 3468:     });
 3469:   }, [activeOrders, isKitchen, stagesMap]);
 3470: 
 3471:   // P0-4.1: Reset guest cache when partnerId changes (prevents stale data across restaurants)
 3472:   useEffect(() => {
 3473:     loadedGuestIdsRef.current = new Set();
 3474:     setGuestsMap({});
 3475:   }, [partnerId]);
 3476: 
 3477:   // P0-4: Batch load guests with loadedGuestIdsRef to prevent re-fetching
 3478:   useEffect(() => {
 3479:     // Kitchen doesn't see guest badges — don't load guests
 3480:     if (isKitchen) return;
 3481:     
 3482:     async function loadGuestsBatch() {
 3483:       // Protect from undefined (orders may be undefined before loading)
 3484:       const list = roleFilteredOrders || [];
 3485:       
 3486:       // P0-4: Use ref to filter already-attempted IDs (not just guestsMap)
 3487:       const guestIds = [...new Set(
 3488:         list
 3489:           .map(o => getLinkId(o.guest))
 3490:           .filter(Boolean)
 3491:           .filter(id => !loadedGuestIdsRef.current.has(id)) // P0-4: check ref instead of guestsMap
 3492:       )];
 3493:       
 3494:       if (guestIds.length === 0) return;
 3495:       
 3496:       // P0-4: Mark as attempted BEFORE loading (prevents parallel duplicate requests)
 3497:       guestIds.forEach(id => loadedGuestIdsRef.current.add(id));
 3498:       
 3499:       try {
 3500:         // Load in parallel
 3501:         const guestPromises = guestIds.map(id => 
 3502:           base44.entities.SessionGuest.get(id).catch(() => null)
 3503:         );
 3504:         const guests = await Promise.all(guestPromises);
 3505:         
 3506:         // Single setState
 3507:         const newMap = {};
 3508:         guests.forEach((guest, idx) => {
 3509:           if (guest) newMap[guestIds[idx]] = guest;
 3510:         });
 3511:         
 3512:         if (Object.keys(newMap).length > 0) {
 3513:           setGuestsMap(prev => ({ ...prev, ...newMap }));
 3514:         }
 3515:       } catch (err) {
 3516:         console.error("Error loading guests batch:", err);
 3517:         // P0-4: On error, we keep IDs in ref to avoid retrying failed IDs repeatedly
 3518:       }
 3519:     }
 3520:     
 3521:     loadGuestsBatch();
 3522:   }, [roleFilteredOrders, isKitchen]); // P0-4: deps are correct now (loadedGuestIdsRef is ref, doesn't need to be in deps)
 3523: 
 3524:   const applyChannels = (list, types) => {
 3525:     const s = new Set(types);
 3526:     return list.filter((o) => s.has(o.order_type || "hall"));
 3527:   };
 3528: 
 3529:   const applyAssign = (list, filters, userId) => {
 3530:     const s = new Set(filters);
 3531:     return list.filter((o) => {
 3532:       const mine = isOrderMine(o, userId);
 3533:       const free = isOrderFree(o);
 3534:       const others = !mine && !free;
 3535:       return (mine && s.has("mine")) || (free && s.has("free")) || (others && s.has("others"));
 3536:     });
 3537:   };
 3538: 
 3539:   const channelCounts = useMemo(() => {
 3540:     const base = applyAssign(roleFilteredOrders, assignFilters, effectiveUserId);
 3541:     const c = { hall: 0, pickup: 0, delivery: 0 };
 3542:     base.forEach((o) => {
 3543:       const t = o.order_type || "hall";
 3544:       if (c[t] !== undefined) c[t]++;
 3545:     });
 3546:     return c;
 3547:   }, [roleFilteredOrders, assignFilters, effectiveUserId]);
 3548: 
 3549:   const assignCounts = useMemo(() => {
 3550:     const base = applyChannels(roleFilteredOrders, selectedTypes);
 3551:     let mine = 0, free = 0, others = 0;
 3552:     base.forEach((o) => {
 3553:       if (isOrderMine(o, effectiveUserId)) mine++;
 3554:       else if (isOrderFree(o)) free++;
 3555:       else others++;
 3556:     });
 3557:     return { mine, others, free };
 3558:   }, [roleFilteredOrders, selectedTypes, effectiveUserId]);
 3559: 
 3560:   // Updated statusRank to support stage mode - P0-1: uses normalized stageId
 3561:   const statusRank = (order) => {
 3562:     // P0-1: Normalize stage_id
 3563:     const stageId = getLinkId(order.stage_id);
 3564:     
 3565:     // If using stage mode
 3566:     if (stageId && stagesMap[stageId]) {
 3567:       const stage = stagesMap[stageId];
 3568:       // Ready/finish = highest priority (0)
 3569:       if (stage.internal_code === 'finish') return 0;
 3570:       // Start = second priority (1)
 3571:       if (stage.internal_code === 'start') return 1;
 3572:       // Middle stages by sort_order (2+)
 3573:       return 2 + (stage.sort_order || 0);
 3574:     }
 3575:     // Fallback: legacy status
 3576:     const s = order.status;
 3577:     return s === "ready" ? 0 : s === "new" ? 1 : s === "in_progress" ? 2 : s === "accepted" ? 3 : 9;
 3578:   };
 3579: 
 3580:   const visibleOrders = useMemo(() => {
 3581:     let r = applyChannels(roleFilteredOrders, selectedTypes);
 3582:     r = applyAssign(r, assignFilters, effectiveUserId);
 3583:     
 3584:     r.sort((a, b) => {
 3585:       if (sortMode === "priority") {
 3586:         const ra = statusRank(a), rb = statusRank(b);
 3587:         if (ra !== rb) return ra - rb;
 3588:         const ta = safeParseDate(a.created_date).getTime();
 3589:         const tb = safeParseDate(b.created_date).getTime();
 3590:         return ta - tb;
 3591:       } else {
 3592:         const ta = safeParseDate(a.created_date).getTime();
 3593:         const tb = safeParseDate(b.created_date).getTime();
 3594:         return sortOrder === "newest" ? tb - ta : ta - tb;
 3595:       }
 3596:     });
 3597:     
 3598:     return r;
 3599:   }, [roleFilteredOrders, selectedTypes, assignFilters, sortMode, sortOrder, effectiveUserId, stagesMap]);
 3600: 
 3601:   // v2.7.0: Order groups model (hall by table, pickup/delivery individual)
 3602:   const orderGroups = useMemo(() => {
 3603:     if (isKitchen) return null;
 3604:     
 3605:     const groups = [];
 3606:     const tableGroups = {};
 3607:     
 3608:     visibleOrders.forEach(o => {
 3609:       if (o.order_type === 'hall') {
 3610:         const tableId = getLinkId(o.table);
 3611:         if (!tableId) return;
 3612:         if (!tableGroups[tableId]) {
 3613:           const tableName = tableMap[tableId]?.name || '?';
 3614:           tableGroups[tableId] = {
 3615:             type: 'table',
 3616:             id: tableId,
 3617:             displayName: tableName,
 3618:             orders: [],
 3619:           };
 3620:           groups.push(tableGroups[tableId]);
 3621:         }
 3622:         tableGroups[tableId].orders.push(o);
 3623:       } else {
 3624:         groups.push({
 3625:           type: o.order_type,
 3626:           id: o.id,
 3627:           displayName: o.order_type === 'pickup' 
 3628:             ? `СВ-${o.order_number || o.id.slice(-3)}` 
 3629:             : `ДОС-${o.order_number || o.id.slice(-3)}`,
 3630:           orders: [o],
 3631:         });
 3632:       }
 3633:     });
 3634: 
 3635:     activeRequests.forEach((req) => {
 3636:       const tableId = getLinkId(req.table);
 3637:       if (!tableId) return;
 3638:       if (!tableGroups[tableId]) {
 3639:         const tableName = tableMap[tableId]?.name || '?';
 3640:         tableGroups[tableId] = {
 3641:           type: 'table',
 3642:           id: tableId,
 3643:           displayName: tableName,
 3644:           orders: [],
 3645:         };
 3646:         groups.push(tableGroups[tableId]);
 3647:       }
 3648:     });
 3649:     
 3650:     return groups;
 3651:   }, [visibleOrders, tableMap, isKitchen, activeRequests]);
 3652: 
 3653:   // v2.7.0: Sorted groups by oldest unaccepted order
 3654:   const sortedGroups = useMemo(() => {
 3655:     if (!orderGroups) return [];
 3656:     
 3657:     return [...orderGroups].sort((a, b) => {
 3658:       const getPriority = (group) => {
 3659:         const unaccepted = group.orders.filter(o => getStatusConfig(o).isFirstStage);
 3660:         if (unaccepted.length === 0) return Infinity;
 3661:         return Math.min(...unaccepted.map(o => safeParseDate(o.created_date).getTime()));
 3662:       };
 3663:       return getPriority(a) - getPriority(b);
 3664:     });
 3665:   }, [orderGroups, getStatusConfig]);
 3666: 
 3667:   // v2.7.0: Auto-expand effect
 3668:   useEffect(() => {
 3669:     if (!sortedGroups?.length) return;
 3670:     
 3671:     setExpandedGroups(prev => {
 3672:       const next = new Set(prev);
 3673:       sortedGroups.slice(0, 5).forEach(g => next.add(g.id));
 3674:       sortedGroups.forEach(g => {
 3675:         if (isFavorite(g.type === 'table' ? 'table' : 'order', g.id)) {
 3676:           next.add(g.id);
 3677:         }
 3678:       });
 3679:       return next;
 3680:     });
 3681:   }, [sortedGroups, isFavorite]);
 3682: 
 3683:   // v2.7.0: Toggle group expand
 3684:   const toggleGroupExpand = useCallback((groupId) => {
 3685:     setExpandedGroups(prev => {
 3686:       const next = new Set(prev);
 3687:       if (next.has(groupId)) next.delete(groupId);
 3688:       else next.add(groupId);
 3689:       return next;
 3690:     });
 3691:   }, []);
 3692: 
 3693:   // v2.7.1: Tab filtering (active vs completed)
 3694:   const filteredGroups = useMemo(() => {
 3695:     if (!orderGroups) return [];
 3696:     
 3697:     return orderGroups.filter(group => {
 3698:       const hasActiveOrder = group.orders.some(o => {
 3699:         const config = getStatusConfig(o);
 3700:         return !config.isFinishStage && o.status !== 'cancelled';
 3701:       });
 3702:       const hasActiveRequest = group.type === 'table' && activeRequests.some(r => getLinkId(r.table) === group.id);
 3703:       
 3704:       return activeTab === 'active' ? (hasActiveOrder || hasActiveRequest) : (!hasActiveOrder && !hasActiveRequest);
 3705:     });
 3706:   }, [orderGroups, activeTab, getStatusConfig, activeRequests]);
 3707: 
 3708:   // v2.7.1: Tab counts
 3709:   const tabCounts = useMemo(() => {
 3710:     if (!orderGroups) return { active: 0, completed: 0 };
 3711:     
 3712:     let active = 0, completed = 0;
 3713:     orderGroups.forEach(group => {
 3714:       const hasActiveOrder = group.orders.some(o => {
 3715:         const config = getStatusConfig(o);
 3716:         return !config.isFinishStage && o.status !== 'cancelled';
 3717:       });
 3718:       const hasActiveRequest = group.type === 'table' && activeRequests.some(r => getLinkId(r.table) === group.id);
 3719:       if (hasActiveOrder || hasActiveRequest) active++; else completed++;
 3720:     });
 3721:     
 3722:     return { active, completed };
 3723:   }, [orderGroups, getStatusConfig, activeRequests]);
 3724: 
 3725:   // v2.7.1: Favorites filter
 3726:   const finalGroups = useMemo(() => {
 3727:     if (!showOnlyFavorites) return filteredGroups;
 3728:     
 3729:     return filteredGroups.filter(group => {
 3730:       if (isFavorite(group.type === 'table' ? 'table' : 'order', group.id)) return true;
 3731:       if (group.type !== 'table') return false;
 3732:       return activeRequests.some(req =>
 3733:         getLinkId(req.table) === group.id && favorites.includes(`request:${req.id}`)
 3734:       );
 3735:     });
 3736:   }, [filteredGroups, showOnlyFavorites, isFavorite, activeRequests, favorites]);
 3737: 
 3738:   const finalRequests = useMemo(() => {
 3739:     const base = showOnlyFavorites
 3740:       ? activeRequests.filter(req => favorites.includes(`request:${req.id}`))
 3741:       : activeRequests;
 3742:     return base.filter(req => !getLinkId(req.table));
 3743:   }, [activeRequests, showOnlyFavorites, favorites]);
 3744: 
 3745:   // V2: Sort groups by table status priority (Mine tab sort order spec)
 3746:   const v2SortedGroups = useMemo(() => {
 3747:     if (!finalGroups.length) return finalGroups;
 3748:     return [...finalGroups].sort((a, b) => {
 3749:       const statusA = computeTableStatus(a, activeRequests, getStatusConfig);
 3750:       const statusB = computeTableStatus(b, activeRequests, getStatusConfig);
 3751:       const pa = TABLE_STATUS_SORT_PRIORITY[statusA] ?? 5;
 3752:       const pb = TABLE_STATUS_SORT_PRIORITY[statusB] ?? 5;
 3753:       if (pa !== pb) return pa - pb;
 3754:       // Within same status group: oldest order first
 3755:       const ta = Math.min(...a.orders.map(o => safeParseDate(o.created_date).getTime()));
 3756:       const tb = Math.min(...b.orders.map(o => safeParseDate(o.created_date).getTime()));
 3757:       return ta - tb;
 3758:     });
 3759:   }, [finalGroups, activeRequests, getStatusConfig]);
 3760: 
 3761:   // v2.7.0: Removed favoriteOrders/otherOrders (replaced by orderGroups)
 3762: 
 3763:   const prevDigestRef = useRef(null);
 3764:   const prevStatusMapRef = useRef({});
 3765: 
 3766:   const pushNotify = (title, newOrderIds = [], bannerInfo = null) => {
 3767:     if (!notifPrefs?.enabled) return;
 3768:     setNotifDot(true);
 3769: 
 3770:     if (newOrderIds.length > 0) {
 3771:       setNotifiedOrderIds((prev) => {
 3772:         const next = new Set(prev);
 3773:         newOrderIds.forEach((id) => next.add(id));
 3774:         return next;
 3775:       });
 3776:     }
 3777: 
 3778:     if (notifPrefs.sound && audioUnlockedRef.current && audioRef.current?.play) {
 3779:       try { audioRef.current.play(); } catch { /* ignore */ }
 3780:     }
 3781:     tryVibrate(notifPrefs.vibrate);
 3782:     // V2-09: Show banner instead of toast for richer notification
 3783:     if (bannerInfo) {
 3784:       bannerIdCounter.current += 1;
 3785:       setBannerData({
 3786:         id: bannerIdCounter.current,
 3787:         text: bannerInfo.text || title,
 3788:         groupId: bannerInfo.groupId || null,
 3789:         count: bannerInfo.count || 1,
 3790:       });
 3791:     } else {
 3792:       showToast(title);
 3793:     }
 3794:     if (notifPrefs.system && canUseNotifications() && Notification.permission === "granted") {
 3795:       try { new Notification(title); } catch { /* ignore */ }
 3796:     }
 3797:   };
 3798: 
 3799:   // P0-1: Notification effect uses normalized stageId
 3800:   useEffect(() => {
 3801:     if (!canFetch) return;
 3802: 
 3803:     const filterAge = Date.now() - lastFilterChangeRef.current;
 3804:     if (filterAge < 1500) {
 3805:       const eligibleOrders = applyChannels(applyAssign(roleFilteredOrders, assignFilters, effectiveUserId), selectedTypes);
 3806:       const digest = eligibleOrders.map((o) => {
 3807:         const stageId = getLinkId(o.stage_id); // P0-1
 3808:         return `${o.id}:${o.status}:${stageId || ''}`;
 3809:       }).sort().join("|");
 3810:       prevDigestRef.current = digest;
 3811:       const m = {};
 3812:       eligibleOrders.forEach((o) => {
 3813:         const stageId = getLinkId(o.stage_id); // P0-1
 3814:         m[o.id] = { status: o.status, stage_id: stageId };
 3815:       });
 3816:       prevStatusMapRef.current = m;
 3817:       return;
 3818:     }
 3819: 
 3820:     const eligibleOrders = applyChannels(applyAssign(roleFilteredOrders, assignFilters, effectiveUserId), selectedTypes);
 3821:     const digest = eligibleOrders.map((o) => {
 3822:       const stageId = getLinkId(o.stage_id); // P0-1
 3823:       return `${o.id}:${o.status}:${stageId || ''}`;
 3824:     }).sort().join("|");
 3825: 
 3826:     const prev = prevDigestRef.current;
 3827:     prevDigestRef.current = digest;
 3828: 
 3829:     if (!prev) {
 3830:       const m = {};
 3831:       eligibleOrders.forEach((o) => {
 3832:         const stageId = getLinkId(o.stage_id); // P0-1
 3833:         m[o.id] = { status: o.status, stage_id: stageId };
 3834:       });
 3835:       prevStatusMapRef.current = m;
 3836:       return;
 3837:     }
 3838:     if (prev === digest) return;
 3839: 
 3840:     const prevMap = prevStatusMapRef.current || {};
 3841:     const currMap = {};
 3842:     eligibleOrders.forEach((o) => {
 3843:       const stageId = getLinkId(o.stage_id); // P0-1
 3844:       currMap[o.id] = { status: o.status, stage_id: stageId };
 3845:     });
 3846:     prevStatusMapRef.current = currMap;
 3847: 
 3848:     const own = ownMutationRef.current;
 3849:     const ownRecent = own && Date.now() - own.ts < 6000;
 3850: 
 3851:     let becameReady = 0;
 3852:     const newOrderIds = [];
 3853:     const readyOrderIds = [];
 3854: 
 3855:     eligibleOrders.forEach((o) => {
 3856:       if (ownRecent && own.orderId === o.id) return;
 3857:       const pst = prevMap[o.id];
 3858:       if (!pst) {
 3859:         newOrderIds.push(o.id);
 3860:         return;
 3861:       }
 3862:       // Check if became ready (either by status or by stage) - P0-1: use normalized ids
 3863:       const pstStageId = pst.stage_id; // already normalized in prevMap
 3864:       const currStageId = getLinkId(o.stage_id);
 3865:       const wasReady = pst.status === 'ready' || (pstStageId && stagesMap[pstStageId]?.internal_code === 'finish');
 3866:       const isReady = o.status === 'ready' || (currStageId && stagesMap[currStageId]?.internal_code === 'finish');
 3867:       if (!wasReady && isReady) { becameReady++; readyOrderIds.push(o.id); }
 3868:     });
 3869: 
 3870:     // V2-09: Build banner info with table context
 3871:     const buildBannerInfo = (orderIds, eventType) => {
 3872:       if (!orderIds.length) return null;
 3873:       // Find which table(s) these orders belong to
 3874:       const orderMap = {};
 3875:       eligibleOrders.forEach(o => { orderMap[o.id] = o; });
 3876:       const tableIds = new Set();
 3877:       orderIds.forEach(id => {
 3878:         const o = orderMap[id];
 3879:         if (o) {
 3880:           const tId = getLinkId(o.table);
 3881:           if (tId) tableIds.add(tId);
 3882:         }
 3883:       });
 3884:       const tableNames = [...tableIds].map(tId => {
 3885:         const t = tableMap[tId];
 3886:         return t?.name ? `${t.name}` : null;
 3887:       }).filter(Boolean);
 3888: 
 3889:       // Single table: "Стол 5: Новый заказ"
 3890:       if (tableNames.length === 1 && orderIds.length === 1) {
 3891:         const label = eventType === 'ready' ? 'Заказ готов' : 'Новый заказ';
 3892:         return {
 3893:           text: `${tableNames[0]}: ${label}`,
 3894:           groupId: [...tableIds][0],
 3895:           count: 1,
 3896:         };
 3897:       }
 3898:       // Multiple: "3 новых заказа" or "2 заказа готовы"
 3899:       const count = orderIds.length;
 3900:       if (eventType === 'ready') {
 3901:         const word = count === 1 ? 'заказ готов' : count < 5 ? 'заказа готовы' : 'заказов готовы';
 3902:         return { text: `${count} ${word}`, groupId: tableIds.size === 1 ? [...tableIds][0] : null, count };
 3903:       }
 3904:       const word = count === 1 ? 'новый заказ' : count < 5 ? 'новых заказа' : 'новых заказов';
 3905:       return { text: `${count} ${word}`, groupId: tableIds.size === 1 ? [...tableIds][0] : null, count };
 3906:     };
 3907: 
 3908:     if (becameReady > 0) {
 3909:       const banner = buildBannerInfo(readyOrderIds, 'ready');
 3910:       pushNotify(`Готово: +${becameReady}`, [], banner);
 3911:       return;
 3912:     }
 3913:     if (newOrderIds.length > 0) {
 3914:       const banner = buildBannerInfo(newOrderIds, 'new');
 3915:       pushNotify(`Новые: +${newOrderIds.length}`, newOrderIds, banner);
 3916:       // v3.6.0: Force refetch to ensure detail view gets fresh data immediately
 3917:       queryClient.invalidateQueries({ queryKey: ['orders'] });
 3918:     }
 3919:   }, [roleFilteredOrders, assignFilters, selectedTypes, canFetch, notifPrefs, effectiveUserId, stagesMap, tableMap, queryClient]);
 3920: 
 3921:   const toggleChannel = (type) => {
 3922:     const on = selectedTypes.includes(type);
 3923:     if (on && selectedTypes.length === 1) {
 3924:       showToast("Минимум 1 канал");
 3925:       return;
 3926:     }
 3927:     if (!on && (channelCounts[type] || 0) === 0) {
 3928:       showToast("Пока 0 заказов");
 3929:     }
 3930:     lastFilterChangeRef.current = Date.now();
 3931:     setSelectedTypes((p) => (p.includes(type) ? p.filter((t) => t !== type) : [...p, type]));
 3932:   };
 3933: 
 3934:   const toggleAssign = (key) => {
 3935:     const on = assignFilters.includes(key);
 3936:     if (on && assignFilters.length === 1) {
 3937:       showToast("Минимум 1 фильтр");
 3938:       return;
 3939:     }
 3940:     if (!on && (assignCounts[key] || 0) === 0) {
 3941:       showToast("Пока 0 заказов");
 3942:     }
 3943:     lastFilterChangeRef.current = Date.now();
 3944:     setAssignFilters((p) => (p.includes(key) ? p.filter((x) => x !== key) : [...p, key]));
 3945:   };
 3946: 
 3947:   // v4.0.0: Toggle expand/collapse — max 1 card expanded
 3948:   const handleToggleExpand = useCallback((groupId) => {
 3949:     setExpandedGroupId(prev => prev === groupId ? null : groupId);
 3950:   }, []);
 3951: 
 3952:   // V2-09: Sprint D — Highlight state for banner-navigate
 3953:   const [highlightGroupId, setHighlightGroupId] = useState(null);
 3954:   const highlightTimerRef = useRef(null);
 3955: 
 3956:   // v4.0.0: Banner tap → expand card + scroll to it + highlight briefly
 3957:   const handleBannerNavigate = useCallback((groupId) => {
 3958:     if (!groupId) return;
 3959:     setExpandedGroupId(groupId);
 3960:     requestAnimationFrame(() => {
 3961:       requestAnimationFrame(() => {
 3962:         const el = document.querySelector(`[data-group-id="${CSS.escape(String(groupId))}"]`);
 3963:         if (el) {
 3964:           el.scrollIntoView({ behavior: 'smooth', block: 'center' });
 3965:           setHighlightGroupId(groupId);
 3966:           if (highlightTimerRef.current) clearTimeout(highlightTimerRef.current);
 3967:           highlightTimerRef.current = setTimeout(() => setHighlightGroupId(null), 1500);
 3968:         }
 3969:       });
 3970:     });
 3971:   }, []);
 3972: 
 3973:   // Cleanup highlight timer
 3974:   useEffect(() => () => {
 3975:     if (highlightTimerRef.current) clearTimeout(highlightTimerRef.current);
 3976:   }, []);
 3977: 
 3978:   // V2-09: Banner dismiss handler
 3979:   const handleBannerDismiss = useCallback(() => {
 3980:     setBannerData(null);
 3981:   }, []);
 3982: 
 3983:   const handleRefresh = () => {
 3984:     setManualRefreshTs(Date.now());
 3985:     refetchOrders();
 3986:     if (!isKitchen) refetchRequests();
 3987:   };
 3988: 
 3989:   // D1-007, D1-008, D1-009: Close table handler
 3990:   // v3.6.0: Shows confirmation dialog instead of browser confirm()
 3991:   const handleCloseTable = (tableSessionField, tableName) => {
 3992:     const sessionId = getLinkId(tableSessionField);
 3993:     if (!sessionId) return;
 3994:     setCloseTableConfirm({ sessionId, tableName: tableName || 'стол' });
 3995:   };
 3996: 
 3997:   // v3.6.0: Confirmation dialog — executes close after user confirms
 3998:   const confirmCloseTable = async () => {
 3999:     if (!closeTableConfirm) return;
 4000:     const { sessionId } = closeTableConfirm;
 4001:     setCloseTableConfirm(null);
 4002:     try {
 4003:       await closeSession(sessionId);
 4004:       showToast("Стол закрыт");
 4005:       setExpandedGroupId(null); // Collapse expanded card — table no longer active
 4006:       refetchOrders();
 4007:     } catch (err) {
 4008:       showToast("Ошибка при закрытии");
 4009:     }
 4010:   };
 4011: 
 4012:   // v2.7.1: Close all orders handler (move all to finish stage)
 4013:   const handleCloseAllOrders = useCallback(async (orders) => {
 4014:     if (!orders?.length) return;
 4015:     
 4016:     const finishStage = sortedStages.find(s => s.internal_code === 'finish');
 4017:     if (!finishStage) {
 4018:       showToast('Нет этапа "Завершён"');
 4019:       return;
 4020:     }
 4021:     
 4022:     try {
 4023:       await Promise.all(orders.map(o => 
 4024:         base44.entities.Order.update(o.id, { stage_id: finishStage.id })
 4025:       ));
 4026:       queryClient.invalidateQueries({ queryKey: ["orders"] });
 4027:       showToast('Стол закрыт');
 4028:     } catch (err) {
 4029:       if (isRateLimitError(err)) {
 4030:         queryClient.cancelQueries();
 4031:         setRateLimitHit(true);
 4032:       }
 4033:     }
 4034:   }, [sortedStages, queryClient]);
 4035: 
 4036:   const requestNotifPermission = async () => {
 4037:     if (!canUseNotifications()) { showToast("Не поддерживается"); return; }
 4038:     try {
 4039:       const r = await Notification.requestPermission();
 4040:       showToast(r === "granted" ? "Разрешено" : "Не разрешено");
 4041:     } catch { showToast("Ошибка"); }
 4042:   };
 4043: 
 4044:   if (gateView) return gateView;
 4045: 
 4046:   const hasErrors = (ordersError || requestsError) && !rateLimitHit;
 4047:   const hasFavorites = favorites.length > 0;
 4048:   const notifEnabled = !!notifPrefs?.enabled;
 4049:   const notifPermission = canUseNotifications() ? Notification.permission : "unsupported";
 4050: 
 4051:   const channelLabels = selectedTypes.map((t) => TYPE_THEME[t]?.label || t).join(", ");
 4052:   const assignLabels = assignFilters.map((f) => (f === "mine" ? "Мои" : f === "others" ? "Чужие" : "Свободные")).join(", ");
 4053: 
 4054:   const manualAge = manualRefreshTs ? Math.floor((Date.now() - manualRefreshTs) / 1000) : 9999;
 4055:   const refreshLabelText = manualAge <= 2 
 4056:     ? "Готово ✓" 
 4057:     : pollingInterval === 0 
 4058:       ? "Вручную" 
 4059:       : `Авто ${pollingInterval / 1000}с`;
 4060:   const refreshLabelColor = manualAge <= 2 ? "text-green-600" : "text-slate-400";
 4061: 
 4062:   const CABINET_USER_ROLES = ['partner_owner', 'partner_manager', 'director', 'managing_director'];
 4063:   const canAccessCabinet = isTokenMode
 4064:     ? (CABINET_ACCESS_ROLES.includes(effectiveRole) && link?.invited_user)
 4065:     : CABINET_USER_ROLES.includes(currentUser?.user_role);
 4066: 
 4067:   // D1-007: Determine who can close tables (NOT kitchen)
 4068:   const canCloseTable = !isKitchen && 
 4069:     ['partner_manager', 'partner_staff', 'director', 'managing_director', 'partner_owner']
 4070:       .includes(effectiveRole);
 4071: 
 4072:   return (
 4073:     <div className="min-h-screen bg-slate-100 pb-24 font-sans">
 4074:       <div className="bg-white border-b sticky top-0 z-20 shadow-sm">
 4075:         <div className="max-w-md mx-auto">
 4076:           <div className="px-4 pt-3 pb-2 flex items-center justify-between">
 4077:             <div>
 4078:               <h1 className="font-bold text-lg text-slate-900 leading-tight">Заказы</h1>
 4079:               <div className="text-[11px] text-slate-500">Активные: {visibleOrders.length}</div>
 4080:             </div>
 4081:             <div className="flex items-center gap-1.5">
 4082:               {canAccessCabinet && (
 4083:                 <button
 4084:                   type="button"
 4085:                   onClick={() => window.location.href = '/partnerhome'}
 4086:                   className="w-9 h-9 rounded-lg border border-indigo-200 bg-indigo-50 flex items-center justify-center active:scale-95"
 4087:                   aria-label="Перейти в кабинет"
 4088:                 >
 4089:                   <Briefcase className="w-5 h-5 text-indigo-600" />
 4090:                 </button>
 4091:               )}
 4092:               <button
 4093:                 type="button"
 4094:                 onClick={() => setProfileOpen(true)}
 4095:                 className="w-9 h-9 rounded-lg border border-slate-200 bg-white flex items-center justify-center active:scale-95"
 4096:                 aria-label="Профиль"
 4097:               >
 4098:                 <User className="w-5 h-5 text-slate-600" />
 4099:               </button>
 4100:               <button
 4101:                 type="button"
 4102:                 onClick={() => { setNotifOpen((v) => !v); setNotifDot(false); }}
 4103:                 className="relative w-9 h-9 rounded-lg border border-slate-200 bg-white flex items-center justify-center active:scale-95"
 4104:                 aria-label="Настройки уведомлений"
 4105:               >
 4106:                 <Bell className="w-5 h-5 text-slate-600" />
 4107:                 {notifEnabled && notifDot && <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500" />}
 4108:               </button>
 4109:               <button
 4110:                 type="button"
 4111:                 onClick={() => setSettingsOpen(true)}
 4112:                 className="w-9 h-9 rounded-lg border border-slate-200 bg-white flex items-center justify-center active:scale-95"
 4113:                 aria-label="Настройки"
 4114:               >
 4115:                 <Settings className="w-5 h-5 text-slate-600" />
 4116:               </button>
 4117:             </div>
 4118:           </div>
 4119: 
 4120:           <div className="px-4 pb-3 flex items-start justify-between gap-2">
 4121:             <div className="flex gap-2 flex-1 min-w-0">
 4122:               <IconToggle label="Мои" count={assignCounts.mine} selected={assignFilters.includes("mine")} onClick={() => toggleAssign("mine")} countAsIcon />
 4123:               <IconToggle label="Чужие" count={assignCounts.others} selected={assignFilters.includes("others")} onClick={() => toggleAssign("others")} countAsIcon />
 4124:               <IconToggle label="Свободные" count={assignCounts.free} selected={assignFilters.includes("free")} onClick={() => toggleAssign("free")} countAsIcon />
 4125:             </div>
 4126:             <div className="flex items-start gap-2">
 4127:               <div className="flex flex-col items-center">
 4128:                 <button
 4129:                   type="button"
 4130:                   onClick={handleRefresh}
 4131:                   className="w-9 h-9 rounded-lg border border-slate-200 bg-white flex items-center justify-center active:scale-95"
 4132:                   aria-label="Обновить"
 4133:                 >
 4134:                   {loadingOrders ? <Loader2 className="w-5 h-5 animate-spin text-slate-400" /> : <RefreshCcw className="w-5 h-5 text-slate-600" />}
 4135:                 </button>
 4136:                 <span className={`text-[10px] mt-1 min-w-[56px] text-center ${refreshLabelColor}`}>{refreshLabelText}</span>
 4137:               </div>
 4138:               {sortMode === "time" && (
 4139:                 <div className="flex flex-col items-center">
 4140:                   <button
 4141:                     type="button"
 4142:                     onClick={toggleSortOrder}
 4143:                     className="w-9 h-9 rounded-lg border border-slate-200 bg-white flex items-center justify-center active:scale-95"
 4144:                     aria-label="Сортировка"
 4145:                   >
 4146:                     {sortOrder === "newest" ? <ArrowDown className="w-5 h-5 text-slate-600" /> : <ArrowUp className="w-5 h-5 text-slate-600" />}
 4147:                   </button>
 4148:                   <span className="text-[10px] text-slate-400 mt-1 min-w-[56px] text-center">
 4149:                     {sortOrder === "newest" ? "Новые" : "Старые"}
 4150:                   </span>
 4151:                 </div>
 4152:               )}
 4153:             </div>
 4154:           </div>
 4155:         </div>
 4156:       </div>
 4157: 
 4158:       <div className="max-w-md mx-auto p-4 space-y-4">
 4159:         {hasErrors && (
 4160:           <Card className="border-red-200 bg-red-50">
 4161:             <CardContent className="p-3 flex items-center justify-between gap-2">
 4162:               <span className="text-sm text-red-700">Ошибка загрузки</span>
 4163:               <Button variant="outline" size="sm" onClick={handleRefresh} className="border-red-300 text-red-600">Повторить</Button>
 4164:             </CardContent>
 4165:           </Card>
 4166:         )}
 4167: 
 4168:         {!isKitchen && (
 4169:           <div className="flex gap-2">
 4170:             <button
 4171:               onClick={() => setActiveTab('active')}
 4172:               className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
 4173:                 activeTab === 'active'
 4174:                   ? 'bg-indigo-600 text-white'
 4175:                   : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
 4176:               }`}
 4177:             >
 4178:               Активные ({tabCounts.active})
 4179:             </button>
 4180:             <button
 4181:               onClick={() => setActiveTab('completed')}
 4182:               className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
 4183:                 activeTab === 'completed'
 4184:                   ? 'bg-slate-600 text-white'
 4185:                   : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
 4186:               }`}
 4187:             >
 4188:               Завершённые ({tabCounts.completed})
 4189:             </button>
 4190:             <button
 4191:               onClick={() => setShowOnlyFavorites(v => !v)}
 4192:               className={`px-3 py-2 rounded-lg transition-colors ${
 4193:                 showOnlyFavorites
 4194:                   ? 'bg-yellow-100 text-yellow-700 border border-yellow-300'
 4195:                   : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
 4196:               }`}
 4197:               aria-label="Только избранные"
 4198:             >
 4199:               <Star className={`w-4 h-4 ${showOnlyFavorites ? 'fill-yellow-400' : ''}`} />
 4200:             </button>
 4201:           </div>
 4202:         )}
 4203: 
 4204:         {!isKitchen && finalRequests.length > 0 && (
 4205:           <div>
 4206:             {finalRequests.map((req) => {
 4207:               // P0-1: Normalize table for RequestCard
 4208:               const reqTableId = getLinkId(req.table);
 4209:               return (
 4210:                 <RequestCard
 4211:                   key={req.id}
 4212:                   request={req}
 4213:                   tableData={reqTableId ? tableMap[reqTableId] : null}
 4214:                   isPending={updateRequestMutation.isPending}
 4215:                   onAction={() => updateRequestMutation.mutate({ id: req.id, status: req.status === "new" ? "in_progress" : "done" })}
 4216:                   isFavorite={favorites.includes(`request:${req.id}`)}
 4217:                   onToggleFavorite={toggleFavorite}
 4218:                 />
 4219:               );
 4220:             })}
 4221:           </div>
 4222:         )}
 4223: 
 4224:         {(isKitchen ? visibleOrders.length === 0 : (v2SortedGroups.length === 0 && finalRequests.length === 0)) && !hasErrors ? (
 4225:           <div className="text-center py-10 text-slate-400">
 4226:             <div className="mb-2">
 4227:               {isKitchen 
 4228:                 ? "Нет заказов для кухни" 
 4229:                 : showOnlyFavorites 
 4230:                   ? "Нет избранных" 
 4231:                   : activeTab === 'active' 
 4232:                     ? "Нет активных заказов" 
 4233:                     : "Нет завершённых заказов"}
 4234:             </div>
 4235:             {isKitchen && <div className="text-xs mb-4">Фильтры: {channelLabels} · {assignLabels}</div>}
 4236:             <Button variant="outline" size="sm" onClick={handleRefresh}>Обновить</Button>
 4237:           </div>
 4238:         ) : (
 4239:           <React.Fragment>
 4240:             {(isKitchen ? visibleOrders.length > 0 : v2SortedGroups.length > 0) && (
 4241:               <h2 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
 4242:                 <UtensilsCrossed className="w-3 h-3" /> ЗАКАЗЫ
 4243:               </h2>
 4244:             )}
 4245:             
 4246:             {/* v2.7.0: Kitchen sees flat list, non-kitchen sees grouped cards */}
 4247:             {isKitchen ? (
 4248:               visibleOrders.map((o) => {
 4249:                 const tableId = getLinkId(o.table);
 4250:                 return (
 4251:                   <OrderCard 
 4252:                     key={o.id} 
 4253:                     order={o} 
 4254:                     tableData={tableId ? tableMap[tableId] : null}
 4255:                     isFavorite={false}
 4256:                     onToggleFavorite={() => {}}
 4257:                     disableServe={isKitchen} 
 4258:                     onMutate={trackOwnMutation}
 4259:                     effectiveUserId={effectiveUserId}
 4260:                     isNotified={notifiedOrderIds.has(o.id)}
 4261:                     onClearNotified={clearNotified}
 4262:                     getStatusConfig={getStatusConfig}
 4263:                     isKitchen={isKitchen}
 4264:                     guestsMap={guestsMap}
 4265:                     onCloseTable={null}
 4266:                   />
 4267:                 );
 4268:               })
 4269:             ) : (
 4270:               v2SortedGroups.map(group => (
 4271:                 <OrderGroupCard
 4272:                   key={group.id}
 4273:                   group={group}
 4274:                   isExpanded={expandedGroupId === group.id}
 4275:                   onToggleExpand={() => handleToggleExpand(group.id)}
 4276:                   isHighlighted={highlightGroupId === group.id}
 4277:                   isFavorite={isFavorite(group.type === 'table' ? 'table' : 'order', group.id)}
 4278:                   onToggleFavorite={toggleFavorite}
 4279:                   getStatusConfig={getStatusConfig}
 4280:                   guestsMap={guestsMap}
 4281:                   effectiveUserId={effectiveUserId}
 4282:                   onMutate={trackOwnMutation}
 4283:                   onCloseTable={canCloseTable ? handleCloseTable : null}
 4284:                   overdueMinutes={partnerData?.order_overdue_minutes}
 4285:                   notifiedOrderIds={notifiedOrderIds}
 4286:                   onClearNotified={clearNotified}
 4287:                   tableMap={tableMap}
 4288:                   onCloseAllOrders={handleCloseAllOrders}
 4289:                   activeRequests={activeRequests}
 4290:                   onCloseRequest={(reqId, newStatus, extraFields) => updateRequestMutation.mutate({ id: reqId, status: newStatus, ...extraFields })}
 4291:                   orderStages={sortedStages}
 4292:                   setUndoToast={setUndoToast}
 4293:                   undoToast={undoToast}
 4294:                   staffName={staffName}
 4295:                   isRequestPending={updateRequestMutation.isPending}
 4296:                 />
 4297:               ))
 4298:             )}
 4299: 
 4300:           </React.Fragment>
 4301:         )}
 4302:       </div>
 4303: 
 4304:       {/* Modals */}
 4305:       <MyTablesModal
 4306:         open={myTablesOpen}
 4307:         onClose={() => setMyTablesOpen(false)}
 4308:         tables={tables || []}
 4309:         favorites={favorites}
 4310:         onToggleFavorite={toggleFavorite}
 4311:         onClearAll={clearAllFavorites}
 4312:       />
 4313:       
 4314:       <ProfileSheet
 4315:         open={profileOpen}
 4316:         onClose={() => setProfileOpen(false)}
 4317:         staffName={staffName}
 4318:         staffRole={effectiveRole}
 4319:         partnerName={partnerName}
 4320:         isKitchen={isKitchen}
 4321:         favoritesCount={favorites.length}
 4322:         onOpenMyTables={() => setMyTablesOpen(true)}
 4323:         onLogout={handleLogout}
 4324:       />
 4325:       
 4326:       <SettingsPanel 
 4327:         open={settingsOpen} 
 4328:         onClose={() => setSettingsOpen(false)} 
 4329:         pollingInterval={pollingInterval} 
 4330:         onChangePollingInterval={handleChangePollingInterval}
 4331:         sortMode={sortMode}
 4332:         onChangeSortMode={handleChangeSortMode}
 4333:         selectedTypes={selectedTypes}
 4334:         onToggleChannel={toggleChannel}
 4335:         channelCounts={channelCounts}
 4336:       />
 4337: 
 4338:       {notifOpen && (
 4339:         <div className="fixed inset-0 z-40">
 4340:           <button type="button" className="absolute inset-0 bg-black/30" onClick={() => setNotifOpen(false)} aria-label="Закрыть" />
 4341:           <div className="absolute inset-x-0 bottom-0 max-h-[70vh] bg-white rounded-t-2xl shadow-xl">
 4342:             <div className="flex items-center justify-between p-4 border-b border-slate-200">
 4343:               <span className="font-bold text-slate-900">Уведомления</span>
 4344:               <button type="button" onClick={() => setNotifOpen(false)} className="p-2 -m-2 text-slate-400 hover:text-slate-600">
 4345:                 <X className="w-5 h-5" />
 4346:               </button>
 4347:             </div>
 4348:             <div className="p-4 space-y-3">
 4349:               <label className="flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-slate-50">
 4350:                 <span className="text-sm font-medium text-slate-800">Уведомления</span>
 4351:                 <input type="checkbox" checked={notifEnabled} onChange={(e) => updateNotifPrefs({ enabled: e.target.checked })} className="h-5 w-5" />
 4352:               </label>
 4353:               <div className={notifEnabled ? "" : "opacity-50 pointer-events-none"}>
 4354:                 <div className="space-y-2">
 4355:                   <label className="flex items-center justify-between px-3 py-2 rounded-lg border border-slate-200 bg-white">
 4356:                     <span className="text-sm text-slate-700">Вибрация</span>
 4357:                     <input type="checkbox" checked={!!notifPrefs.vibrate} onChange={(e) => updateNotifPrefs({ vibrate: e.target.checked })} className="h-5 w-5" />
 4358:                   </label>
 4359:                   <label className="flex items-center justify-between px-3 py-2 rounded-lg border border-slate-200 bg-white">
 4360:                     <span className="text-sm text-slate-700">Звук</span>
 4361:                     <input type="checkbox" checked={!!notifPrefs.sound} onChange={(e) => updateNotifPrefs({ sound: e.target.checked })} className="h-5 w-5" />
 4362:                   </label>
 4363:                   <div className="flex items-center justify-between px-3 py-2 rounded-lg border border-slate-200 bg-white">
 4364:                     <div className="flex-1">
 4365:                       <span className="text-sm text-slate-700">Push-уведомления</span>
 4366:                       {notifPermission !== "granted" && <div className="text-[10px] text-slate-400">Нужно разрешение браузера</div>}
 4367:                     </div>
 4368:                     {notifPermission === "granted" ? (
 4369:                       <input type="checkbox" checked={!!notifPrefs.system} onChange={(e) => updateNotifPrefs({ system: e.target.checked })} className="h-5 w-5" />
 4370:                     ) : (
 4371:                       <Button variant="outline" size="sm" onClick={requestNotifPermission} className="h-7 text-xs">Разрешить</Button>
 4372:                     )}
 4373:                   </div>
 4374:                 </div>
 4375:                 <div className="mt-3 text-[11px] text-slate-500 bg-slate-50 p-2 rounded-lg">Уведомления приходят по активным фильтрам.</div>
 4376:               </div>
 4377:             </div>
 4378:           </div>
 4379:         </div>
 4380:       )}
 4381: 
 4382:       {/* v3.6.0: Close table confirmation dialog */}
 4383:       {closeTableConfirm && (
 4384:         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
 4385:           <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6">
 4386:             <h3 className="text-lg font-bold text-slate-900 mb-2">
 4387:               {`Закрыть ${closeTableConfirm.tableName}?`}
 4388:             </h3>
 4389:             <p className="text-sm text-slate-600 mb-6">
 4390:               Гости больше не смогут отправлять заказы.
 4391:             </p>
 4392:             <div className="flex gap-3">
 4393:               <button
 4394:                 type="button"
 4395:                 onClick={() => setCloseTableConfirm(null)}
 4396:                 className="flex-1 min-h-[44px] rounded-lg border border-slate-300 bg-white text-sm font-medium text-slate-700 active:scale-[0.98]"
 4397:               >
 4398:                 Отмена
 4399:               </button>
 4400:               <button
 4401:                 type="button"
 4402:                 onClick={confirmCloseTable}
 4403:                 className="flex-1 min-h-[44px] rounded-lg bg-red-600 text-white text-sm font-semibold active:scale-[0.98]"
 4404:               >
 4405:                 Закрыть
 4406:               </button>
 4407:             </div>
 4408:           </div>
 4409:         </div>
 4410:       )}
 4411: 
 4412:       {toastMsg && (
 4413:         <div className="fixed left-0 right-0 bottom-6 z-50 flex justify-center px-4 pointer-events-none">
 4414:           <div className="bg-slate-900 text-white text-sm px-4 py-2 rounded-full shadow-lg">{toastMsg}</div>
 4415:         </div>
 4416:       )}
 4417: 
 4418:       {/* V2-09: Sprint D — Banner notification overlay */}
 4419:       <BannerNotification
 4420:         banner={bannerData}
 4421:         onDismiss={handleBannerDismiss}
 4422:         onNavigate={handleBannerNavigate}
 4423:       />
 4424:     </div>
 4425:   );
 4426: }
 4427: 
 4428: 
 4429: 
=== END SOURCE CODE ===

=== TASK CONTEXT ===
# Feature: Implement collapsed table card (скс) — identity block + status chips (#288)

Reference: `ux-concepts/StaffOrdersMobile/GPT_SOM_CollapsedCard_S250.md`, `ux-concepts/StaffOrdersMobile/GPT_SOM_UXSpec_S250.md`, `BUGS_MASTER.md`.
Production page: https://menu-app-mvp-49a4f5b2.base44.app/staffordersmobile

**Context:** `staffordersmobile.jsx` is 4429 lines. The active `OrderGroupCard` component starts at line 1675. ⚠️ IMPORTANT: Lines 523-620 and lines 1121-~1390 are COMMENTED-OUT legacy code (inside `/* */` blocks) — do NOT modify these. Target ONLY the ACTIVE code inside `OrderGroupCard` (line 1675+).

The collapsed card header is inside `OrderGroupCard`, approximately lines 2178-2210, inside the `onClick={onToggleExpand}` div. Currently for `group.type === "table"` it shows: ownership icon (★/🔒) + compact table badge + jump chips (Запросы N, Новые N, Готово N). This layout must be replaced with a new identity block + status chips design. Jump chips move to expanded view only.

---

## HTML Mockup Reference (inline, authoritative — v13, GPT R6, S250)

**When this spec and the Fix description conflict — values below WIN.**

```css
/* ── Collapsed Card layout ── */
.card {
  min-height: 72px;
  padding: 10px 12px 10px 16px;
  border-radius: 14px;
  display: flex;
  gap: 10px;
  align-items: center;
  background: #fff;
}

/* ── Identity Wrapper (v11: ownership badge outside — GPT R5) ── */
/* 84px wide to accommodate badge overlap at top-left corner */
.identity-wrapper {
  position: relative;
  flex: 0 0 84px;
  width: 84px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
}

/* Identity block: 78×54px (GPT R3) */
.identity {
  width: 78px;
  height: 54px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* v12 (GPT R6): 3 urgency levels — "normal/мятный" REMOVED */
.identity.danger  { background: #FFE8E5; }
.identity.warning { background: #FFF1DD; }
.identity.calm    { background: #F2F2F7; border: 1.5px solid #D9D9E0; }
/* Tappable free table: green ring = "tap to claim" affordance */
.identity.tappable { outline: 2.5px solid #34c75980; outline-offset: 3px; cursor: pointer; }

/* GPT R3: table number 26px, centered, ALWAYS dark */
.identity__table {
  font-size: 26px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  color: #1c1c1e;  /* ALWAYS #1c1c1e — GPT R3: do NOT color by urgency */
}

/* ── Ownership badge: OUTSIDE identity block (GPT R5) ── */
/* Overlap-badge at top-left corner of wrapper — doesn't compete with number or urgency color */
.ownership-badge {
  position: absolute;
  top: -7px;
  left: -7px;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: #fff;
  border: 1.5px solid rgba(0,0,0,0.08);
  box-shadow: 0 1px 4px rgba(0,0,0,0.13);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  z-index: 2;
}
.ownership-badge.mine   { background: #FFF8E7; border-color: #FFD60A50; }
.ownership-badge.free   { background: #EAF7EE; border-color: #34c75940; }
.ownership-badge.locked { background: #f2f2f7; border-color: #d1d1d6; }

/* ── Right zone ── */
.rightZone {
  min-height: 54px;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
  justify-content: center;
}

/* Chips: GPT R3: height 26px, font 13px */
.chip {
  height: 26px;
  padding: 0 9px;
  border-radius: 13px;
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
}
.chip.serve   { background: #34c75920; color: #30a14e; }
.chip.request { background: #ff3b3020; color: #ff3b30; }
.chip.new     { background: #007aff20; color: #007aff; }
.chip.work    { background: #f2f2f7;   color: #8e8e93; }
/* Longest-chip highlight */
.chip.longest.serve   { background: #34c759; color: #fff; }
.chip.longest.request { background: #ff3b30; color: #fff; }
.chip.longest.new     { background: #007aff; color: #fff; }
```

**Card HTML example** (Стол 5, danger, ownershipState='mine'):
```html
<div class="card">
  <div class="identity-wrapper">
    <div class="ownership-badge mine">★</div>
    <div class="identity danger">
      <span class="identity__table">5</span>
    </div>
  </div>
  <div class="rightZone">
    <div class="chips">
      <span class="chip serve">Готово 1 · 4м</span>
      <span class="chip request">Запросы 1 · 2м</span>
      <span class="chip longest new">Новые 2 · 23м</span>
    </div>
  </div>
</div>
```

**Card HTML example** (Стол 8, danger, фильтр «Все», чужой — badge 🔒 виден):
```html
<div class="card">
  <div class="identity-wrapper">
    <div class="ownership-badge locked">🔒</div>
    <div class="identity danger">
      <span class="identity__table">8</span>
    </div>
  </div>
  <div class="rightZone"><div class="chips">
    <span class="chip longest serve">Готово 2 · 9м</span>
    <span class="chip work">Принято 1</span>
  </div></div>
</div>
```

---

## Fix 1 — #288 (P1) [MUST-FIX]: Replace collapsed table card with identity block + status chips

### Сейчас (current behavior)
In `OrderGroupCard` (~lines 2181-2206), the `group.type === "table"` branch shows:
- Row 1: ownership icon (★/🔒) + compact badge with table number + optional zone name chip
- Row 2: `jumpChips` (computed at line 2018) rendered as colored border chips. These appear in BOTH collapsed and expanded states because the header is always visible.

### Должно быть (expected behavior)

**A. New collapsed card layout** — replace the `group.type === "table"` header branch:

```
┌──────────────────────────────────────────────────────┐
│ ★┐  ┌────────┐  [Готово 1 · 4м]  [Запросы 2 · 2м]   │
│  └─►│   22   │  [Новые 3 · 23м●]  [Принято 2]        │
│     └────────┘                                        │
│  badge  identity  chips zone (flex-wrap, right side)  │
└──────────────────────────────────────────────────────┘
● = longest-chip highlight (solid fill + white text)
★ badge = outside identity block, top-left overlap
```

**Card outer layout:** `flex items-center gap-[10px] min-h-[72px]` (replaces `space-y-2`)

**Left — identity wrapper** (`flex-shrink-0`, 84px wide, `position: relative`):

1. **Ownership badge** — rendered OUTSIDE the identity block, absolute positioned in wrapper. **ALWAYS show** based on `ownershipState` alone — do NOT add a filter check (NOTE: `assignFilters` is NOT a prop of `OrderGroupCard`, verified call-site lines 4271-4296; do NOT add new props). Filter-based badge hiding is a separate BACKLOG item:
   - `ownershipState === 'mine'`: round 26×26px badge `top-[-7px] left-[-7px]`, bg `#FFF8E7`, border `#FFD60A50`, shows ★
   - `ownershipState === 'other'`: same position, bg `#f2f2f7`, border `#d1d1d6`, shows 🔒. Render as `<button>` with `onClick={(e) => { e.stopPropagation(); showOtherTableHint(e); }}` + `aria-label={HALL_UI_TEXT.otherTableTitle}`
   - `ownershipState === 'free'`: bg `#EAF7EE`, border `#34c75940`, shows ☆

2. **Identity block** — 78×54px, `border-radius: 12px`, centered number:
   - Urgency background via inline style (see C below) — NOT Tailwind color classes (pastels not in Tailwind)
   - **Table number**: centered (`display: flex; align-items: center; justify-content: center`), `font-size: 26px`, `font-weight: 700`, `tabular-nums`, **ALWAYS `color: #1c1c1e`** — NEVER white, never colored by urgency
   - Value: `compactTableLabel` (confirmed at line 2194 in active OrderGroupCard)
   - Free table tappable: add `style={{outline: '2.5px solid #34c75980', outlineOffset: '3px'}}` when `ownershipState === 'free'`

**Right — chips zone** (`flex-1`, `display: flex; flex-wrap: wrap; gap: 6px; min-width: 0; align-content: center`):
- Show `scsChips` (see computation below) — non-zero only, fixed order
- **Chip base**: `height: 26px; padding: 0 9px; border-radius: 13px; font-size: 13px; font-weight: 600; white-space: nowrap`
- **Default style** (outline): use HALL_CHIP_STYLES-equivalent colors per tone (see HTML mockup CSS — serve/request/new/work)
  - Alternatively: reuse `HALL_CHIP_STYLES[chip.tone]` from line 351 if existing classes are close enough — CC judgment call
- **Highlighted chip** (longest actionable): `SCS_SOLID_CHIP[chip.tone]` — solid fill + white text
- **Format**:
  - Actionable (Готово/Запросы/Новые): `` `${chip.label} ${chip.count} · ${formatCompactMinutes(chip.ageMin)}` ``
  - Non-actionable (Принято/Готовится/В работе): `` `${chip.label} ${chip.count}` ``
- Chips are `<span>` (not interactive — card tap expands)
- Empty (no chips): show `{HALL_UI_TEXT.noActions}` (line 328)

**Keep unchanged:**
- `ownerHintVisible` tooltip block (lines 2199-2204) — keep it below the new layout, same as before

**B. Jump chips → expanded view only:**
- REMOVE jump chips rendering from the always-visible header area (line 2205 currently)
- ADD jump chips rendering INSIDE the expanded content block (when `isExpanded`, ABOVE the sections):
```jsx
{jumpChips.length > 0 && (
  <div className="flex flex-wrap items-center gap-1.5 pb-3">
    {jumpChips.map(chip => (
      <button key={chip.kind} type="button"
        onClick={(e) => { e.stopPropagation(); scrollToSection(chip.kind); }}
        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold border min-h-[32px] ${HALL_CHIP_STYLES[chip.tone]}`}>
        {`${chip.label} ${chip.count}`}
      </button>
    ))}
  </div>
)}
```
Note: `setIsExpanded(true)` is dropped from onClick (already expanded). Rest unchanged (SOM-S235-01 ✅ FROZEN).

**C. Urgency color model** (identity block background — inline styles, pastels):

| Level | Condition | Inline style |
|-------|-----------|-------------|
| calm | no actionable chips | `{{background:'#F2F2F7', border:'1.5px solid #D9D9E0'}}` |
| warning | oldest actionable 3–5м | `{{background:'#FFF1DD'}}` |
| danger | oldest actionable ≥6м | `{{background:'#FFE8E5'}}` |

⚠️ "normal" level does NOT exist — removed in v12 (GPT R6). 3 levels only: calm/warning/danger.
"Oldest actionable" = max `ageMin` among Готово/Запросы/Новые chips (if any). 0–2м → calm (no urgency yet).

### НЕ должно быть
- ❌ Do NOT show jump chips in collapsed header (move to expanded only)
- ❌ Do NOT show max-wait badge (replaced by longest-chip highlight in S250)
- ❌ Do NOT show zone name chip in new collapsed header
- ❌ Do NOT use solid-color urgency backgrounds (green-500/amber-400/red-500) — pastels only
- ❌ Do NOT color table number white or by urgency — always `color: #1c1c1e`
- ❌ Do NOT put ownership icon inside identity block — badge goes OUTSIDE (in wrapper)
- ❌ Do NOT modify commented-out code blocks (lines 523-620, lines 1121-~1390)
- ❌ Do NOT change expanded card content (sections, bulk bars, inline toast)
- ❌ Do NOT change the OrderGroupCard component props or call-site

### Файл и локация
File: `pages/StaffOrdersMobile/staffordersmobile.jsx` (4429 lines)
Component: `OrderGroupCard` (line 1675) — ONLY target ACTIVE code here

**Step 1 — Add helpers near line 376** (after `formatClockTime` function, line 376):
```js
function getUrgencyLevel(ageMin) {
  // v12: 3 levels only — calm/warning/danger (no "normal")
  if (!Number.isFinite(ageMin) || ageMin <= 0) return 'calm';
  if (ageMin >= 6) return 'danger';
  if (ageMin >= 3) return 'warning';
  return 'calm'; // 0–2м = calm (no urgency action needed yet)
}
const URGENCY_IDENTITY_STYLE = {
  calm:    { background: '#F2F2F7', border: '1.5px solid #D9D9E0' },
  warning: { background: '#FFF1DD' },
  danger:  { background: '#FFE8E5' },
};
const SCS_SOLID_CHIP = {
  green: 'bg-green-500 text-white border-green-500',
  red:   'bg-red-500 text-white border-red-500',
  blue:  'bg-blue-500 text-white border-blue-500',
};
```

**Step 2 — Add scsChips computation inside OrderGroupCard** (after `jumpChips` const, ~line 2025):
```js
const scsChips = useMemo(() => {
  const chips = [];
  if (readyOrders.length > 0) {
    const ageMin = getOldestAgeMinutes(readyOrders, o => o.stage_entered_at || o.created_date) || 0;
    chips.push({ key: 'ready', label: 'Готово', count: readyOrders.length, ageMin, isActionable: true, tone: 'green' });
  }
  if (tableRequests.length > 0) {
    const ageMin = getOldestAgeMinutes(tableRequests, r => r.created_date) || 0;
    chips.push({ key: 'requests', label: 'Запросы', count: tableRequests.length, ageMin, isActionable: true, tone: 'red' });
  }
  if (newOrders.length > 0) {
    const ageMin = getOldestAgeMinutes(newOrders, o => o.created_date) || 0;
    chips.push({ key: 'new', label: 'Новые', count: newOrders.length, ageMin, isActionable: true, tone: 'blue' });
  }
  inProgressSections.forEach(section => {
    if (section.rowCount > 0) {
      const label = section.sid === '__null__' ? 'В работе' : section.label;
      chips.push({ key: section.sid, label, count: section.rowCount, ageMin: 0, isActionable: false, tone: 'gray' });
    }
  });
  return chips;
}, [readyOrders, tableRequests, newOrders, inProgressSections, getOldestAgeMinutes]);

const scsOldestActionable = useMemo(() => {
  const ages = scsChips.filter(c => c.isActionable && c.ageMin > 0).map(c => c.ageMin);
  return ages.length > 0 ? Math.max(...ages) : 0;
}, [scsChips]);

const scsUrgency = getUrgencyLevel(scsOldestActionable);

const scsHighlightKey = useMemo(() => {
  const actionable = scsChips.filter(c => c.isActionable && c.ageMin > 0);
  if (actionable.length === 0) return null;
  const maxAge = Math.max(...actionable.map(c => c.ageMin));
  // Tie rule: Готово > Запросы > Новые
  for (const key of ['ready', 'requests', 'new']) {
    const chip = actionable.find(c => c.key === key && c.ageMin === maxAge);
    if (chip) return chip.key;
  }
  return actionable.find(c => c.ageMin === maxAge)?.key || null;
}, [scsChips]);
```

**Step 3 — Replace collapsed card JSX** inside OrderGroupCard (lines ~2181-2206):
- Search for: `{group.type === "table" ? (` (inside the onClick div, ~line 2181)
- Replace the `<div className="space-y-2">` block with the new layout:
  - Outer: `<div style={{display:'flex', alignItems:'center', gap:'10px', minHeight:'72px'}}>` (or Tailwind equivalent)
  - Identity wrapper: `<div style={{position:'relative', flexShrink:0, width:'84px', display:'flex', alignItems:'center', justifyContent:'flex-end'}}>` 
  - Ownership badge (absolute, top-left of wrapper, shown only when filter==='all' or equivalent)
  - Identity block: `<div style={{width:'78px', height:'54px', borderRadius:'12px', display:'flex', alignItems:'center', justifyContent:'center', ...URGENCY_IDENTITY_STYLE[scsUrgency], ...(ownershipState==='free' ? {outline:'2.5px solid #34c75980', outlineOffset:'3px'} : {})}}>`
  - Table number: `<span style={{fontSize:'26px', fontWeight:700, color:'#1c1c1e', fontVariantNumeric:'tabular-nums'}}>{compactTableLabel}</span>`
  - Right zone: chips list from `scsChips`

**Step 4 — Move jump chips** to expanded content block inside OrderGroupCard:
- Search: `{isExpanded &&` or the expanded content conditional (after line 2225)
- Add jump chips div at the TOP of the expanded content, before section renders

### Уже пробовали
First implementation — no prior attempts.

### Проверка (мини тест-кейс)
1. Open /staffordersmobile, find a table with active orders
2. **Collapsed**: Left = 84px wrapper containing 78×54px identity block. Right = status chips «Готово 1 · 4м» / «Запросы 2 · 2м» / «Новые 3 · 23м». No jump chips visible when collapsed.
3. **Urgency colors**: Table with Готово 1 · 7м → identity background #FFE8E5 (pastel pink). Table with Новые 2 · 1м → #F2F2F7 (calm, 0–2м = no urgency). Table with Новые 2 · 4м → #FFF1DD (warning).
4. **Table number**: always dark `#1c1c1e` regardless of urgency — NEVER white.
5. **Longest-chip highlight**: «Новые 3 · 23м» = solid blue fill + white text (longest actionable).
6. **Expand**: jump chips appear at top of expanded content. Sections unchanged.
7. **Lock icon**: tap on 🔒 badge (outside identity block, top-left) → shows owner hint tooltip. Card does NOT expand on this tap.

---

## FROZEN UX (DO NOT CHANGE)

The following are implemented and tested in RELEASE 260408-00. Do NOT modify:

- **Jump chips style** (SOM-S235-01 ✅): `HALL_CHIP_STYLES` line 351. Classes `bg-red-50 border-red-300 text-red-600` etc. — keep exactly. Only move render location from header → expanded view.
- **Bulk bar position** (SOM-S235-02 ✅): bulk action bar renders BELOW section cards, NOT in section header
- **Dual metric** (SOM-S235-04 ✅): collapsed sections show `«N гостей · N блюд»` format
- **Verb-first labels** (SOM-S235-05 ✅): «Принять», «В работу», «Готово», «Выдать» in OrderCard
- **Close table text** (SOM-S235-06 ✅): action-oriented format in closeDisabledReason
- **Inline toast** (SOM-S211-01 ✅): lifted to StaffOrdersMobile parent (line 2814: `// lifted from OrderGroupCard`). Do NOT move or refactor this.
- **Auto-expand В РАБОТЕ** (SOM-S208-01 ✅): `expandedSubGroups` state logic — do NOT change
- **No nested card duplicate** (SOM-S231-01 ✅): do NOT add any nested wrapper around expanded content

---

## ⛔ SCOPE LOCK — change ONLY what is described in Fix 1

- Edit ONLY `pages/StaffOrdersMobile/staffordersmobile.jsx`
- Change ONLY: (1) collapsed card header JSX in active OrderGroupCard (~2181-2206), (2) jump chips location (header → expanded), (3) add scsChips computed values (~line 2025), (4) add urgency helpers (~line 376)
- Do NOT modify: expanded card sections, bulk bars, OrderCard component, StaffOrdersMobile main component (line 2738+), any other file
- Do NOT introduce new imports (Star, Lock, useMemo already used; `formatCompactMinutes` already defined)
- Do NOT touch commented-out code blocks (lines 523-620, lines 1121-~1390)
- If you see another issue outside this scope — SKIP IT

## Implementation Notes

Files: `pages/StaffOrdersMobile/staffordersmobile.jsx` (4429 lines)

Do not read the full file. Targeted excerpts only:
- Lines 370–390: formatClockTime area (add urgency helpers here)
- Lines 2018–2045: jumpChips + ownershipState (add scsChips after jumpChips)
- Lines 2175–2230: collapsed card header + start of expanded content (main replacement)
- Find expanded content: `grep -n "isExpanded" staffordersmobile.jsx` → look for the expanded content block after line 2225

Grep verification (run before commit to confirm FROZEN UX unchanged):
- `grep -n "HALL_CHIP_STYLES" staffordersmobile.jsx` → confirm line 351 definition unchanged
- `grep -n "bulk.*bar\|section-bulk" staffordersmobile.jsx` → confirm bulk bar still below sections
- `grep -n "lifted from OrderGroupCard" staffordersmobile.jsx` → confirm comment still at line ~2814
- `grep -n "space-y-2" staffordersmobile.jsx` → should be 0 results inside active OrderGroupCard (we replaced it)
- `grep -n "bg-green-500\|bg-amber-400\|bg-red-500" staffordersmobile.jsx` → should NOT appear in identity block (pastels use inline style, not Tailwind)

## MOBILE-FIRST CHECK (MANDATORY before commit)
This is a staff mobile app, used one-handed on the go.
At 375px viewport width:
- [ ] Identity block is exactly 78×54px, wrapper 84px `flex-shrink-0` — does not compress
- [ ] Table number (26px, dark #1c1c1e) readable on ALL urgency background colors (calm/warning/danger — all pastel, all readable)
- [ ] Ownership badge (26×26px circle) does not overlap card content — badge is above/outside
- [ ] Chips wrap correctly, max 2 rows on small screens
- [ ] Overall card min-height ≥72px
- [ ] Card tap area covers full card width (unchanged)
- [ ] Lock badge tap shows hint without expanding card (`e.stopPropagation()` on badge onClick)
- [ ] No jump chips visible in collapsed state

## Regression Check (MANDATORY after implementation)
Verify these existing features still work after changes:

- [ ] **Table expansion**: tap card → expands, jump chips appear at top, sections visible
- [ ] **Jump chip navigation**: tap «Готово N» chip (in expanded) → scrolls to Готово section
- [ ] **Bulk action**: «Принять все (N)» button appears below section cards (not in header)
- [ ] **Inline toast**: after bulk serve, undo toast appears (lifted state — survives unmount)
- [ ] **Close table**: «Закрыть стол» disabled with action-oriented hint when orders pending
- [ ] **Owner hint**: tap 🔒 badge → shows tooltip, does NOT expand card

## Git
```bash
git add pages/StaffOrdersMobile/staffordersmobile.jsx
git commit -m "feat(SOM): implement collapsed table card (скс) — identity block + status chips (#288)"
git push
```

## Self-check
Before executing, briefly list:
1. Any ambiguities in this prompt
2. Any risks that might cause you to stall (e.g. can't find the right lines, wrong comment block)
3. Your execution plan (grep first, then which steps in order)
If you see a problem, say so and propose a fix before proceeding.

## Post-task review
After completing the task, answer:
1. Rate this prompt 1-10 for clarity and executability
2. What was unclear or caused hesitation?
3. What would you change to make it faster to execute?
4. Token efficiency: Where did you spend the most tokens? Suggest specific prompt changes.
5. Speed: What information would help complete this faster?
=== END ===
