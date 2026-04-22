---
chain: staffordersmobile-260415-094104-4d54
chain_step: 1
chain_total: 2
chain_step_name: discussion-writer-codex
chain_group: writers
chain_group_size: 2
page: StaffOrdersMobile
budget: 10.00
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
7. Write your position to (ABSOLUTE PATH — required, see KB-139): C:/Users/ASUS/Dev/Menu AI Cowork/pipeline/chain-state/staffordersmobile-260415-094104-4d54-codex-position.md
8. Do NOT read or reference any CC output.

FORMAT for position file:
# Codex Discussion Position — StaffOrdersMobile
Chain: staffordersmobile-260415-094104-4d54
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
File: 260414-02 StaffOrdersMobile RELEASE.jsx (4575 lines)

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
  384: function getUrgencyLevel(ageMin) {
  385:   if (!Number.isFinite(ageMin) || ageMin <= 0) return 'calm';
  386:   if (ageMin >= 6) return 'danger';
  387:   if (ageMin >= 3) return 'warning';
  388:   return 'calm';
  389: }
  390: const URGENCY_IDENTITY_STYLE = {
  391:   calm:    { background: '#F2F2F7', border: '1.5px solid #D9D9E0' },
  392:   warning: { background: '#FFF1DD' },
  393:   danger:  { background: '#FFE8E5' },
  394: };
  395: const SCS_CHIP_STYLES = {
  396:   green: { background: '#34c75920', color: '#30a14e' },
  397:   red:   { background: '#ff3b3020', color: '#ff3b30' },
  398:   blue:  { background: '#007aff20', color: '#007aff' },
  399:   gray:  { background: '#f2f2f7',   color: '#8e8e93' },
  400: };
  401: const SCS_SOLID_CHIP = {
  402:   green: { background: '#34c759', color: '#fff' },
  403:   red:   { background: '#ff3b30', color: '#fff' },
  404:   blue:  { background: '#007aff', color: '#fff' },
  405: };
  406: 
  407: function stripTablePrefix(label) {
  408:   if (!label) return "";
  409:   return String(label).replace(/^\s*\u0421\u0442\u043E\u043B\s*/i, "").trim();
  410: }
  411: 
  412: function extractGuestMarker(label) {
  413:   if (!label) return null;
  414:   const match = String(label).match(/(\d+)/);
  415:   return match ? match[1] : null;
  416: }
  417: 
  418: const ROLE_LABELS = {
  419:   partner_staff: "Официант",
  420:   kitchen: "Кухня",
  421:   partner_manager: "Менеджер",
  422:   director: "Директор",
  423:   managing_director: "Управляющий директор",
  424: };
  425: 
  426: const DEVICE_ID_STORAGE_KEY = "menuapp_staff_device_id";
  427: const NOTIF_PREFS_STORAGE_KEY = "menuapp_staff_notif_prefs_v2";
  428: const POLLING_INTERVAL_KEY = "menuapp_staff_polling_interval";
  429: const SORT_MODE_KEY = "menuapp_staff_sort_mode";
  430: const SORT_ORDER_KEY = "menuapp_staff_sort_order";
  431: 
  432: // P0: Роли с доступом к кабинету
  433: const CABINET_ACCESS_ROLES = ['director', 'managing_director'];
  434: 
  435: // V2-05: Table-level status color/style mapping (Sprint A)
  436: const TABLE_STATUS_STYLES = {
  437:   BILL_REQUESTED: {
  438:     borderClass: 'border-l-4 border-l-violet-500',
  439:     bgClass: 'bg-violet-50',
  440:     badgeClass: 'bg-violet-500 text-white',
  441:     textClass: 'text-slate-900',
  442:     ctaBgClass: 'bg-violet-600 hover:bg-violet-700 text-white',
  443:     label: 'СЧЁТ',
  444:   },
  445:   NEW: {
  446:     borderClass: 'border-l-4 border-l-blue-500',
  447:     bgClass: 'bg-blue-50',
  448:     badgeClass: 'bg-blue-500 text-white',
  449:     textClass: 'text-slate-900',
  450:     ctaBgClass: 'bg-blue-600 hover:bg-blue-700 text-white',
  451:     label: 'НОВЫЙ',
  452:   },
  453:   READY: {
  454:     borderClass: 'border-l-4 border-l-amber-500',
  455:     bgClass: 'bg-amber-50',
  456:     badgeClass: 'bg-amber-500 text-white',
  457:     textClass: 'text-slate-900',
  458:     ctaBgClass: 'bg-amber-600 hover:bg-amber-700 text-white',
  459:     label: 'ГОТОВ',
  460:   },
  461:   ALL_SERVED: {
  462:     borderClass: 'border-l-4 border-l-green-500',
  463:     bgClass: 'bg-green-50',
  464:     badgeClass: 'bg-green-500 text-white',
  465:     textClass: 'text-slate-900',
  466:     ctaBgClass: 'bg-green-600 hover:bg-green-700 text-white',
  467:     label: 'ОБСЛУЖЕНО',
  468:   },
  469:   PREPARING: {
  470:     borderClass: 'border-l-2 border-l-slate-300',
  471:     bgClass: 'bg-slate-50',
  472:     badgeClass: 'bg-slate-400 text-white',
  473:     textClass: 'text-slate-500',
  474:     ctaBgClass: 'bg-slate-600 hover:bg-slate-700 text-white',
  475:     label: 'ГОТОВИТСЯ',
  476:   },
  477:   STALE: {
  478:     borderClass: 'border-l-4 border-l-red-500',
  479:     bgClass: 'bg-red-50',
  480:     badgeClass: 'bg-red-500 text-white',
  481:     textClass: 'text-slate-900',
  482:     ctaBgClass: 'bg-red-600 hover:bg-red-700 text-white',
  483:     label: 'ПРОСРОЧЕН',
  484:   },
  485: };
  486: 
  487: // V2: Sort priority for Mine tab (0 = highest priority)
  488: const TABLE_STATUS_SORT_PRIORITY = {
  489:   BILL_REQUESTED: 0,
  490:   STALE: 0,
  491:   NEW: 1,
  492:   READY: 2,
  493:   ALL_SERVED: 3,
  494:   PREPARING: 4,
  495: };
  496: 
  497: const ALL_CHANNELS = ["hall", "pickup", "delivery"];
  498: const ALL_ASSIGN_FILTERS = ["mine", "others", "free"];
  499: 
  500: const POLLING_OPTIONS = [
  501:   { value: 5000, label: "5с" },
  502:   { value: 15000, label: "15с" },
  503:   { value: 30000, label: "30с" },
  504:   { value: 60000, label: "60с" },
  505:   { value: 0, label: "Вручную" },
  506: ];
  507: 
  508: const DEFAULT_POLLING_INTERVAL = 5000;
  509: const DEFAULT_SORT_MODE = "priority";
  510: const DEFAULT_SORT_ORDER = "newest";
  511: 
  512: /* ═══════════════════════════════════════════════════════════════════════════
  513:    HELPERS
  514: ═══════════════════════════════════════════════════════════════════════════ */
  515: 
  516: function isRateLimitError(error) {
  517:   if (!error) return false;
  518:   const msg = error.message || error.toString() || "";
  519:   return msg.toLowerCase().includes("rate limit") || msg.includes("429");
  520: }
  521: 
  522: function shouldRetry(failureCount, error) {
  523:   if (isRateLimitError(error)) return false;
  524:   return failureCount < 2;
  525: }
  526: 
  527: // SOM-BUG-S270-01: Sequential batch to prevent B44 429 on bulk operations.
  528: const BATCH_DELAY_MS = 120;
  529: async function runBatchSequential(items, fn, { delayMs = BATCH_DELAY_MS } = {}) {
  530:   const results = [];
  531:   for (let i = 0; i < items.length; i++) {
  532:     try {
  533:       results.push(await fn(items[i], i));
  534:     } catch (err) {
  535:       results.push({ error: err });
  536:       if (isRateLimitError(err)) break;
  537:     }
  538:     if (i < items.length - 1 && delayMs > 0) {
  539:       await new Promise((r) => setTimeout(r, delayMs));
  540:     }
  541:   }
  542:   return results;
  543: }
  544: 
  545: // D1-006: Normalize link fields (type-safe: string/number/object/value-object)
  546: function getLinkId(field) {
  547:   if (field == null) return null; // only null/undefined
  548: 
  549:   if (typeof field === "string" || typeof field === "number") return String(field);
  550: 
  551:   if (typeof field === "object") {
  552:     const v = field.id ?? field._id ?? field.value ?? null;
  553: 
  554:     if (typeof v === "string" || typeof v === "number") return String(v);
  555: 
  556:     if (v && typeof v === "object") {
  557:       const vv = v.id ?? v._id ?? null;
  558:       if (typeof vv === "string" || typeof vv === "number") return String(vv);
  559:     }
  560:   }
  561: 
  562:   return null;
  563: }
  564: /*
  565:     <div data-group-id={group.id} className={`mb-3 rounded-lg border border-slate-200 overflow-hidden transition-all duration-300 ${style.bgClass} ${style.borderClass} ${highlightRing}`}>
  566:       <div className="px-4 pt-3 pb-3 cursor-pointer active:opacity-80" onClick={onToggleExpand} role="button" aria-expanded={isExpanded} aria-label={group.type === "table" ? identifier : `${identifier}: ${statusLabel}`}>
  567:         {group.type === "table" ? (
  568:           <div className="space-y-2">
  569:             <div className="flex items-start justify-between gap-3">
  570:               <div className="flex items-center gap-2 min-w-0">
  571:                 {ownershipState === "mine" ? (
  572:                   <span className="shrink-0"><Star className="w-4 h-4 fill-yellow-400 text-yellow-400" /></span>
  573:                 ) : ownershipState === "other" ? (
  574:                   <button type="button" onClick={showOtherTableHint} className="shrink-0 rounded-full p-0.5 -m-0.5" aria-label={HALL_UI_TEXT.otherTableTitle}>
  575:                     <Lock className="w-4 h-4 text-slate-400" />
  576:                   </button>
  577:                 ) : (
  578:                   <span className="shrink-0"><Star className="w-4 h-4 text-slate-300" /></span>
  579:                 )}
  580:                 <span className="inline-flex min-w-[2rem] items-center justify-center rounded-lg bg-slate-900 px-2.5 py-1 text-sm font-bold text-white">{compactTableLabel}</span>
  581:                 {tableData?.zone_name && <span className="rounded-full bg-white/80 px-2 py-1 text-[11px] font-medium text-slate-600 border border-slate-200 truncate">{tableData.zone_name}</span>}
  582:               </div>
  583:               {isExpanded && <span className="text-xs font-semibold text-slate-500 shrink-0">{HALL_UI_TEXT.collapse}</span>}
  584:             </div>
  585:             {ownerHintVisible && (
  586:               <div className="rounded-lg bg-slate-900 px-3 py-2 text-white">
  587:                 <div className="text-xs font-semibold">{HALL_UI_TEXT.otherTableTitle}</div>
  588:                 <div className="text-[11px] text-slate-200">{HALL_UI_TEXT.otherTableHint}</div>
  589:               </div>
  590:             )}
  591:             {hallSummaryItems.length > 0 ? (
  592:               <div className="flex flex-wrap items-center gap-x-3 gap-y-1">{hallSummaryItems.map(renderHallSummaryItem)}</div>
  593:             ) : (
  594:               <div className="text-xs text-slate-400">{HALL_UI_TEXT.noActions}</div>
  595:             )}
  596:           </div>
  597:         ) : (
  598:           <React.Fragment>
  599:             <div className="flex items-start justify-between gap-2 mb-1">
  600:               <span className="font-bold text-base leading-tight flex-1 min-w-0 text-slate-900 truncate">{identifier}</span>
  601:               <span className={`text-xs font-medium shrink-0 flex items-center gap-0.5 ${isOverdue ? "text-red-600" : "text-slate-500"}`}>
  602:                 <Clock className={`w-3 h-3 ${isOverdue ? "text-red-500" : ""}`} />
  603:                 {elapsedLabel}
  604:               </span>
  605:             </div>
  606:             <div className="flex items-center gap-1.5 mb-1 flex-wrap">
  607:               <span className="flex items-center gap-1 text-xs text-slate-500"><ChannelIcon className="w-3.5 h-3.5" />{channelConfig.label}</span>
  608:               <span className="text-slate-300">{'\u00B7'}</span>
  609:               <span className={`text-xs font-semibold ${style.textClass || "text-slate-700"}`}>{statusLabel}</span>
  610:               {(newOrders.length > 0 || readyOrders.length > 0) && <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />}
  611:               {contactInfo && (contactInfo.name || contactInfo.phone) && (
  612:                 <React.Fragment>
  613:                   <span className="text-xs text-slate-500 ml-auto truncate max-w-[120px]">{contactInfo.name || ""}</span>
  614:                   {contactInfo.phone && <a href={`tel:${contactInfo.phone}`} onClick={(event) => event.stopPropagation()} className="text-xs text-blue-600 shrink-0">+7{'\u2026'}{contactInfo.phone.slice(-4)}</a>}
  615:                 </React.Fragment>
  616:               )}
  617:             </div>
  618:             {legacySummaryLines.length > 0 ? (
  619:               <div className="space-y-0.5 mt-0.5">
  620:                 {legacySummaryLines.map((line) => (
  621:                   <div key={line.key} className="text-xs text-slate-700 flex items-center gap-1 leading-snug">
  622:                     <span className="font-medium">{`${line.count} ${line.label}`}</span>
  623:                     <span className="text-slate-300">{'\u00B7'}</span>
  624:                     <span>{`${line.ageMin} \u043C\u0438\u043D`}</span>
  625:                   </div>
  626:                 ))}
  627:               </div>
  628:             ) : (
  629:               <div className="text-xs text-slate-400">{'\u041D\u0435\u0442 \u0430\u043A\u0442\u0438\u0432\u043D\u044B\u0445 \u0437\u0430\u043A\u0430\u0437\u043E\u0432'}</div>
  630:             )}
  631:           </React.Fragment>
  632:         )}
  633:       </div>
  634: 
  635:       <div className={`overflow-hidden transition-all duration-200 ease-out ${isExpanded ? "max-h-[3000px] opacity-100" : "max-h-0 opacity-0"}`}>
  636:         <div className="border-t border-slate-200 px-4 py-3 space-y-4">
  637:           {group.type === "table" ? (
  638:             <React.Fragment>
  639:               <div className="rounded-xl border border-slate-200 bg-white/80 p-3 space-y-2">
  640:                 <div className="flex items-center justify-between gap-3">
  641:                   <div className="flex items-center gap-2 min-w-0">
  642:                     {ownershipState === "mine" ? <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 shrink-0" /> : ownershipState === "other" ? <button type="button" onClick={showOtherTableHint} className="shrink-0 rounded-full p-0.5 -m-0.5" aria-label={HALL_UI_TEXT.otherTableTitle}><Lock className="w-4 h-4 text-slate-400 shrink-0" /></button> : <Star className="w-4 h-4 text-slate-300 shrink-0" />}
  643:                     <span className="inline-flex min-w-[2rem] items-center justify-center rounded-lg bg-slate-900 px-2.5 py-1 text-sm font-bold text-white">{compactTableLabel}</span>
  644:                     {tableData?.zone_name && <span className="rounded-full bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-600 border border-slate-200">{tableData.zone_name}</span>}
  645:                   </div>
  646:                   <button type="button" onClick={onToggleExpand} className="text-xs font-semibold text-slate-500 min-h-[36px]">{HALL_UI_TEXT.collapse}</button>
  647:                 </div>
  648:                 {ownerHintVisible && <div className="rounded-lg bg-slate-900 px-3 py-2 text-white"><div className="text-xs font-semibold">{HALL_UI_TEXT.otherTableTitle}</div><div className="text-[11px] text-slate-200">{HALL_UI_TEXT.otherTableHint}</div></div>}
  649:                 <div className="flex flex-wrap items-center gap-x-3 gap-y-1">{hallSummaryItems.length > 0 ? hallSummaryItems.map(renderHallSummaryItem) : <span className="text-xs text-slate-400">{HALL_UI_TEXT.noActions}</span>}</div>
  650:                 {billData && billData.total > 0 && <div className="text-xs font-semibold text-slate-700">{`${HALL_UI_TEXT.bill} \u00B7 ${HALL_UI_TEXT.total} ${formatHallMoney(billData.total)}`}</div>}
  651:               </div>
  652: 
  653:               {tableRequests.length > 0 && (
  654:                 <div>
  655:                   <div className="mb-2 flex items-center justify-between gap-3">
  656:                     <div className="text-[11px] font-bold uppercase tracking-wider text-violet-600"><span className="bg-violet-50 rounded-md px-2 py-0.5">{`${HALL_UI_TEXT.requests} (${tableRequests.length})`}</span></div>
  657:                     {tableRequests.length > 1 && (() => { const allNew = tableRequests.every(r => !r.status || r.status === 'new' || r.status === 'open'); const allAccepted = tableRequests.every(r => r.status === 'accepted'); if (allNew) return <button type="button" onClick={() => tableRequests.forEach(r => onCloseRequest(r.id, 'accepted', { assignee: effectiveUserId, assigned_at: new Date().toISOString() }))} disabled={isRequestPending} className="rounded-lg border border-violet-200 bg-violet-50 px-3 py-2 text-xs font-semibold text-violet-700 min-h-[36px] active:scale-[0.98] disabled:opacity-60">{`${HALL_UI_TEXT.acceptAllRequests} (${tableRequests.length})`}</button>; if (allAccepted) return <button type="button" onClick={() => tableRequests.forEach(r => onCloseRequest(r.id, 'done'))} disabled={isRequestPending} className="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-xs font-semibold text-green-700 min-h-[36px] active:scale-[0.98] disabled:opacity-60">{`${HALL_UI_TEXT.serveAllRequests} (${tableRequests.length})`}</button>; return null; })()}
  658:                   </div>
  659:                   <div className="space-y-1.5">
  660:                     {tableRequests.map((request) => {
  661:                       const ageMin = getAgeMinutes(request.created_date);
  662:                       const label = REQUEST_TYPE_LABELS[request.request_type] || request.request_type;
  663:                       const isAccepted = request.status === 'accepted';
  664:                       const isAssignedToMe = request.assignee === effectiveUserId;
  665:                       return (
  666:                         <div key={request.id} className="rounded-lg border border-violet-200 bg-violet-50/80 px-3 py-2">
  667:                           <div className="flex items-center gap-3">
  668:                             <div className="min-w-0 flex-1">
  669:                               <div className="flex items-center gap-2 min-w-0">
  670:                                 <span className="truncate text-sm font-medium text-slate-900">{label}</span>
  671:                                 <span className="text-xs text-violet-500 shrink-0">{formatCompactMinutes(ageMin)}</span>
  672:                                 {isAccepted && isAssignedToMe && staffName && <span className="shrink-0 rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-medium text-blue-700">{staffName}</span>}
  673:                               </div>
  674:                               {request.comment && <div className="mt-0.5 text-xs text-slate-500 truncate">{request.comment}</div>}
  675:                             </div>
  676:                             {onCloseRequest && (isAccepted ? <button type="button" onClick={() => onCloseRequest(request.id, "done")} disabled={isRequestPending} className="shrink-0 rounded-lg border border-green-200 bg-white px-3 py-2 text-xs font-semibold text-green-700 min-h-[36px] active:scale-[0.98] disabled:opacity-60">{HALL_UI_TEXT.serveRequest}</button> : <button type="button" onClick={() => onCloseRequest(request.id, "accepted", { assignee: effectiveUserId, assigned_at: new Date().toISOString() })} disabled={isRequestPending} className="shrink-0 rounded-lg border border-blue-200 bg-white px-3 py-2 text-xs font-semibold text-blue-700 min-h-[36px] active:scale-[0.98] disabled:opacity-60">{HALL_UI_TEXT.acceptRequest}</button>)}
  677:                           </div>
  678:                         </div>
  679:                       );
  680:                     })}
  681:                   </div>
  682:                 </div>
  683:               )}
  684: 
  685:               {newOrders.length > 0 && (
  686:                 <div>
  687:                   <div className="flex items-center justify-between gap-3 mb-2">
  688:                     <div className="text-[11px] font-bold uppercase tracking-wider text-blue-600"><span className="bg-blue-50 rounded-md px-2 py-0.5">{`${HALL_UI_TEXT.new} (${newOrders.length} ${pluralRu(newOrders.length, HALL_UI_TEXT.guests + '\u044C', HALL_UI_TEXT.guests + '\u044F', HALL_UI_TEXT.guests + '\u0435\u0439')} \u00B7 ${countRows(newRows, newOrders.length)} ${pluralRu(countRows(newRows, newOrders.length), HALL_UI_TEXT.dishes + '\u043E', HALL_UI_TEXT.dishes + '\u0430', HALL_UI_TEXT.dishes)})`}</span></div>
  689:                     <button type="button" onClick={() => handleOrdersAction(newOrders)} disabled={advanceMutation.isPending || batchInFlight} className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700 min-h-[36px] active:scale-[0.98] disabled:opacity-60">{getOrderActionMeta(newOrders[0]).willServe ? HALL_UI_TEXT.serveAll : HALL_UI_TEXT.acceptAll}</button>
  690:                   </div>
  691:                   {renderHallRows(newRows, "blue")}
  692:                 </div>
  693:               )}
  694: 
  695:               {inProgressSections.length > 0 && (
  696:                 <div>
  697:                   <button type="button" onClick={() => setInProgressExpanded((prev) => !prev)} className="mb-2 flex w-full items-center justify-between text-left">
  698:                     <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 opacity-60">{`${HALL_UI_TEXT.inProgress} (${inProgressOrders.length} ${pluralRu(inProgressOrders.length, HALL_UI_TEXT.guests + '\u044C', HALL_UI_TEXT.guests + '\u044F', HALL_UI_TEXT.guests + '\u0435\u0439')} \u00B7 ${inProgressSections.reduce((sum, section) => sum + section.rowCount, 0)} ${pluralRu(inProgressSections.reduce((sum, section) => sum + section.rowCount, 0), HALL_UI_TEXT.dishes + '\u043E', HALL_UI_TEXT.dishes + '\u0430', HALL_UI_TEXT.dishes)})`}</span>
  699:                     <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${inProgressExpanded ? "rotate-180" : ""}`} />
  700:                   </button>
  701:                   {inProgressExpanded && (
  702:                     <div className="space-y-3 opacity-60">
  703:                       {inProgressSections.map((section) => {
  704:                         const isSubExpanded = !!expandedSubGroups[section.sid];
  705:                         return (
  706:                           <div key={section.sid}>
  707:                             <div className="mb-1.5 flex items-center justify-between gap-3 cursor-pointer" onClick={() => setExpandedSubGroups((prev) => ({ ...prev, [section.sid]: !prev[section.sid] }))}>
  708:                               <div className="flex items-center gap-2 min-w-0">
  709:                                 <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${isSubExpanded ? "rotate-180" : ""}`} />
  710:                                 <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 opacity-60">{`${section.label} (${section.rowCount})`}</span>
  711:                               </div>
  712:                               <button type="button" onClick={(event) => { event.stopPropagation(); handleOrdersAction(section.orders); }} disabled={advanceMutation.isPending || batchInFlight} className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-700 min-h-[36px] active:scale-[0.98] disabled:opacity-60">{section.bulkLabel}</button>
  713:                             </div>
  714:                             {isSubExpanded && renderHallRows(section.rows, "amber")}
  715:                           </div>
  716:                         );
  717:                       })}
  718:                     </div>
  719:                   )}
  720:                 </div>
  721:               )}
  722: 
  723:               {readyOrders.length > 0 && (
  724:                 <div>
  725:                   <div className="flex items-center justify-between gap-3 mb-2">
  726:                     <div className="text-[11px] font-bold uppercase tracking-wider text-green-600"><span className="bg-green-50 rounded-md px-2 py-0.5">{`${HALL_UI_TEXT.ready} (${readyOrders.length} ${pluralRu(readyOrders.length, HALL_UI_TEXT.guests + '\u044C', HALL_UI_TEXT.guests + '\u044F', HALL_UI_TEXT.guests + '\u0435\u0439')} \u00B7 ${countRows(readyRows, readyOrders.length)} ${pluralRu(countRows(readyRows, readyOrders.length), HALL_UI_TEXT.dishes + '\u043E', HALL_UI_TEXT.dishes + '\u0430', HALL_UI_TEXT.dishes)})`}</span></div>
  727:                     <button type="button" onClick={() => handleOrdersAction(readyOrders)} disabled={advanceMutation.isPending || batchInFlight} className="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-xs font-semibold text-green-700 min-h-[36px] active:scale-[0.98] disabled:opacity-60">{HALL_UI_TEXT.serveAll}</button>
  728:                   </div>
  729:                   {renderHallRows(readyRows, "green")}
  730:                 </div>
  731:               )}
  732: 
  733:               {servedOrders.length > 0 && (
  734:                 <div>
  735:                   <button type="button" onClick={() => setServedExpanded((prev) => !prev)} className="mb-2 flex w-full items-center justify-between text-left">
  736:                     <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 opacity-60">{`${HALL_UI_TEXT.served} (${countRows(servedRows, servedOrders.length)})`}</span>
  737:                     <span className="text-xs font-medium text-slate-400">{servedExpanded ? HALL_UI_TEXT.hide : HALL_UI_TEXT.show}</span>
  738:                   </button>
  739:                   {servedExpanded && <div className="opacity-60">{renderHallRows(servedRows, "slate", true)}</div>}
  740:                 </div>
  741:               )}
  742: 
  743:               {billData && billData.total > 0 && (
  744:                 <div className={`rounded-xl border p-3 ${hasBillRequest ? "border-violet-300 bg-violet-50/80" : "border-slate-200 bg-slate-50"}`}>
  745:                   <button type="button" onClick={() => setBillExpanded((prev) => !prev)} className="flex w-full items-start justify-between gap-3 text-left">
  746:                     <div className="min-w-0 flex-1">
  747:                       <div className="text-[11px] font-bold uppercase tracking-wider text-slate-600">{HALL_UI_TEXT.bill}</div>
  748:                       <div className="mt-1 text-sm font-semibold text-slate-900">{`${HALL_UI_TEXT.total} ${formatHallMoney(billData.total)}`}</div>
  749:                       {!billExpanded && billData.remaining < billData.total && <div className="mt-1 text-xs text-slate-500">{`${HALL_UI_TEXT.remaining} ${formatHallMoney(billData.remaining)}`}</div>}
  750:                     </div>
  751:                     {billExpanded ? <ChevronUp className="w-4 h-4 text-slate-400 mt-1" /> : <ChevronDown className="w-4 h-4 text-slate-400 mt-1" />}
  752:                   </button>
  753:                   {billExpanded && (
  754:                     <div className="mt-3 space-y-2 border-t border-slate-200 pt-3">
  755:                       {billData.guests.map((guest, index) => <div key={`${guest.id}:${index}`} className="flex items-center justify-between gap-3 text-sm"><span className="text-slate-600">{guest.name}</span><span className="font-medium text-slate-900">{formatHallMoney(guest.total)}</span></div>)}
  756:                       <div className="border-t border-slate-200 pt-2 space-y-1 text-sm">
  757:                         <div className="flex items-center justify-between gap-3"><span className="text-slate-500">{HALL_UI_TEXT.paid}</span><span className="font-medium text-slate-700">{formatHallMoney(billData.paid)}</span></div>
  758:                         <div className="flex items-center justify-between gap-3 font-semibold text-slate-900"><span>{HALL_UI_TEXT.remaining}</span><span>{formatHallMoney(billData.remaining)}</span></div>
  759:                       </div>
  760:                     </div>
  761:                   )}
  762:                 </div>
  763:               )}
  764: 
  765:               {onCloseTable && group.orders.length > 0 && (
  766:                 <div className="pt-2 border-t border-slate-200">
  767:                   <button type="button" onClick={handleCloseTableClick} disabled={!!closeDisabledReason} className={`w-full min-h-[44px] flex items-center justify-center gap-2 font-medium text-sm rounded-lg border transition-all active:scale-[0.99] ${closeDisabledReason ? "bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed" : "bg-red-50 text-red-600 border-red-200 hover:bg-red-100"}`}>
  768:                     <X className="w-4 h-4" />
  769:                     {HALL_UI_TEXT.closeTable}
  770:                   </button>
  771:                   {closeDisabledReasons.length > 0 && <div className="mt-1 space-y-0.5">{closeDisabledReasons.map((reason, i) => <p key={i} className="text-[10px] text-slate-400 text-center">{reason}</p>)}</div>}
  772:                 </div>
  773:               )}
  774:             </React.Fragment>
  775:           ) : (
  776:             <React.Fragment>
  777:               {newOrders.length > 0 && <div><div className="flex items-center justify-between mb-2"><p className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">{`\u041D\u043E\u0432\u044B\u0435 (${newOrders.length})`}</p><button type="button" onClick={() => handleOrdersAction(newOrders)} disabled={advanceMutation.isPending || batchInFlight} className="text-xs font-semibold text-blue-600 bg-blue-50 border border-blue-200 px-3 py-1 rounded min-h-[44px] active:scale-95 disabled:opacity-60">{'\u041F\u0440\u0438\u043D\u044F\u0442\u044C \u0432\u0441\u0435'}</button></div><div className="space-y-2">{newOrders.map(renderLegacyOrderCard)}</div></div>}
  778:               {readyOrders.length > 0 && <div><div className="flex items-center justify-between mb-2"><p className="text-[11px] font-bold text-green-600 uppercase tracking-wider">{`\u0413\u043E\u0442\u043E\u0432\u043E \u043A \u0432\u044B\u0434\u0430\u0447\u0435 (${readyOrders.length})`}</p><button type="button" onClick={() => handleOrdersAction(readyOrders)} disabled={advanceMutation.isPending || batchInFlight} className="text-xs font-semibold text-green-600 bg-green-50 border border-green-200 px-3 py-1 rounded min-h-[44px] active:scale-95 disabled:opacity-60">{'\u0412\u044B\u0434\u0430\u0442\u044C \u0432\u0441\u0435'}</button></div><div className="space-y-2">{readyOrders.map(renderLegacyOrderCard)}</div></div>}
  779:               {inProgressOrders.length > 0 && (
  780:                 <div>
  781:                   <div className="flex items-center justify-between mb-2 cursor-pointer min-h-[44px]" onClick={() => setInProgressExpanded((prev) => !prev)}>
  782:                     <p className="text-[11px] font-bold text-amber-600 uppercase tracking-wider">{`\u0412 \u0440\u0430\u0431\u043E\u0442\u0435 (${inProgressOrders.length})`}</p>
  783:                     <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${inProgressExpanded ? "rotate-180" : ""}`} />
  784:                   </div>
  785:                   {inProgressExpanded && <div className="space-y-3">{subGroups.map(({ sid, orders, cfg }) => { const isSubExpanded = !!expandedSubGroups[sid]; const actionMeta = getOrderActionMeta(orders[0]); const subGroupLabel = sid === "__null__" ? '\u0412 \u0420\u0410\u0411\u041E\u0422\u0415' : cfg.label; if (subGroups.length === 1) return <div key={sid} className="space-y-2">{orders.map(renderLegacyOrderCard)}</div>; return <div key={sid}><div className="flex items-center justify-between mb-1.5 cursor-pointer min-h-[44px]" onClick={() => setExpandedSubGroups((prev) => ({ ...prev, [sid]: !prev[sid] }))}><div className="flex items-center gap-2"><ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${isSubExpanded ? "rotate-180" : ""}`} /><span className="text-[11px] font-bold text-amber-600 uppercase tracking-wider">{`${subGroupLabel} (${orders.length})`}</span></div><button type="button" onClick={(event) => { event.stopPropagation(); handleOrdersAction(orders); }} disabled={advanceMutation.isPending || batchInFlight} className="text-xs font-semibold text-amber-600 bg-amber-50 border border-amber-200 px-3 py-1 rounded min-h-[36px] active:scale-95 disabled:opacity-60">{actionMeta.bulkLabel}</button></div>{isSubExpanded && <div className="space-y-2">{orders.map(renderLegacyOrderCard)}</div>}</div>; })}</div>}
  786:                 </div>
  787:               )}
  788:               {contactInfo && (
  789:                 <div className="space-y-2 pt-2 border-t border-slate-200">
  790:                   {contactInfo.name && <div className="flex items-center gap-2 text-sm"><User className="w-4 h-4 text-slate-400" /><span className="text-slate-700">{contactInfo.name}</span></div>}
  791:                   {contactInfo.phone && <div className="flex items-center gap-2 text-sm"><Phone className="w-4 h-4 text-slate-400" /><a href={`tel:${contactInfo.phone}`} className="text-blue-600 underline">{contactInfo.phone}</a></div>}
  792:                   {contactInfo.address && <div className="flex items-center gap-2 text-sm"><MapPin className="w-4 h-4 text-slate-400" /><span className="text-slate-600">{contactInfo.address}</span></div>}
  793:                 </div>
  794:               )}
  795:             </React.Fragment>
  796:           )}
  797:         </div>
  798:       </div>
  799:     </div>
  800:   );
  801: }
  802: 
  803: */
  804: // SOM-S256-02 (#293): Counts unique guests across orders.
  805: // null/undefined guest collapses into one bucket via Set semantics.
  806: const uniqueGuests = (orders) => new Set(orders.map(o => getLinkId(o.guest))).size;
  807: 
  808: function getAssignee(order) {
  809:   return order.assignee || null;
  810: }
  811: 
  812: function getAssigneeId(order) {
  813:   return getLinkId(order.assignee);
  814: }
  815: 
  816: function isOrderFree(order) {
  817:   return !getLinkId(order.assignee);
  818: }
  819: 
  820: function isOrderMine(order, effectiveUserId) {
  821:   if (!effectiveUserId) return false;
  822:   const assigneeId = getAssigneeId(order);
  823:   if (!assigneeId) return false;
  824:   return assigneeId === effectiveUserId;
  825: }
  826: 
  827: function safeParseDate(dateStr) {
  828:   if (!dateStr) return new Date();
  829:   try {
  830:     const safe = !String(dateStr).endsWith("Z") ? `${dateStr}Z` : dateStr;
  831:     const d = new Date(safe);
  832:     if (isNaN(d.getTime())) return new Date();
  833:     return d;
  834:   } catch {
  835:     return new Date();
  836:   }
  837: }
  838: 
  839: /**
  840:  * Calculate when current shift started based on working_hours
  841:  * @param {Object} workingHours - partner.working_hours object
  842:  * @returns {Date} - shift start datetime
  843:  */
  844: function getShiftStartTime(workingHours) {
  845:   const FALLBACK_HOURS = 12;
  846:   const now = new Date();
  847:   
  848:   // No working hours → fallback to start of today
  849:   if (!workingHours || typeof workingHours !== 'object') {
  850:     const startOfToday = new Date(now);
  851:     startOfToday.setHours(0, 0, 0, 0);
  852:     return startOfToday;
  853:   }
  854:   
  855:   const dayKeys = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
  856:   const todayIndex = now.getDay(); // 0=Sun, 1=Mon, ...
  857:   const todayKey = dayKeys[todayIndex];
  858:   const yesterdayKey = dayKeys[(todayIndex + 6) % 7];
  859:   
  860:   const todayHours = workingHours[todayKey];
  861:   const yesterdayHours = workingHours[yesterdayKey];
  862:   
  863:   const nowMinutes = now.getHours() * 60 + now.getMinutes();
  864:   
  865:   // Parse time string "HH:MM" to minutes since midnight
  866:   const parseTime = (timeStr) => {
  867:     if (!timeStr) return null;
  868:     const [h, m] = timeStr.split(':').map(Number);
  869:     return h * 60 + m;
  870:   };
  871:   
  872:   // Check if we're still in yesterday's overnight shift
  873:   if (yesterdayHours?.active) {
  874:     const yOpen = parseTime(yesterdayHours.open);
  875:     const yClose = parseTime(yesterdayHours.close);
  876:     
  877:     // Overnight shift: close < open (e.g., 01:29 < 10:00)
  878:     if (yClose !== null && yOpen !== null && yClose < yOpen) {
  879:       // We're in overnight portion if now < close time
  880:       if (nowMinutes < yClose) {
  881:         // Shift started yesterday at open time
  882:         const shiftStart = new Date(now);
  883:         shiftStart.setDate(shiftStart.getDate() - 1);
  884:         shiftStart.setHours(Math.floor(yOpen / 60), yOpen % 60, 0, 0);
  885:         return shiftStart;
  886:       }
  887:     }
  888:   }
  889:   
  890:   // Check today's shift
  891:   if (todayHours?.active) {
  892:     const tOpen = parseTime(todayHours.open);
  893:     
  894:     if (tOpen !== null && nowMinutes >= tOpen) {
  895:       // Shift started today at open time
  896:       const shiftStart = new Date(now);
  897:       shiftStart.setHours(Math.floor(tOpen / 60), tOpen % 60, 0, 0);
  898:       return shiftStart;
  899:     }
  900:   }
  901:   
  902:   // Before today's opening: find most recent shift start
  903:   // Check yesterday's opening
  904:   if (yesterdayHours?.active) {
  905:     const yOpen = parseTime(yesterdayHours.open);
  906:     if (yOpen !== null) {
  907:       const shiftStart = new Date(now);
  908:       shiftStart.setDate(shiftStart.getDate() - 1);
  909:       shiftStart.setHours(Math.floor(yOpen / 60), yOpen % 60, 0, 0);
  910:       return shiftStart;
  911:     }
  912:   }
  913:   
  914:   // Fallback: start of today
  915:   const startOfToday = new Date(now);
  916:   startOfToday.setHours(0, 0, 0, 0);
  917:   return startOfToday;
  918: }
  919: 
  920: 
  921: function formatRelativeTime(dateStr) {
  922:   const date = safeParseDate(dateStr);
  923:   return formatDistanceToNow(date, { addSuffix: true, locale: ru });
  924: }
  925: 
  926: function genDeviceId() {
  927:   try {
  928:     if (crypto?.randomUUID) return crypto.randomUUID();
  929:   } catch { /* ignore */ }
  930:   return `dev_${Math.random().toString(16).slice(2)}_${Date.now()}`;
  931: }
  932: 
  933: function getOrCreateDeviceId() {
  934:   try {
  935:     const existing = localStorage.getItem(DEVICE_ID_STORAGE_KEY);
  936:     if (existing) return existing;
  937:     const id = genDeviceId();
  938:     localStorage.setItem(DEVICE_ID_STORAGE_KEY, id);
  939:     return id;
  940:   } catch {
  941:     return genDeviceId();
  942:   }
  943: }
  944: 
  945: function loadNotifPrefs() {
  946:   const defaults = { enabled: true, sound: false, vibrate: true, system: false };
  947:   try {
  948:     const raw = localStorage.getItem(NOTIF_PREFS_STORAGE_KEY);
  949:     if (!raw) return defaults;
  950:     return { ...defaults, ...JSON.parse(raw) };
  951:   } catch {
  952:     return defaults;
  953:   }
  954: }
  955: 
  956: function saveNotifPrefs(prefs) {
  957:   try {
  958:     localStorage.setItem(NOTIF_PREFS_STORAGE_KEY, JSON.stringify(prefs));
  959:   } catch { /* ignore */ }
  960: }
  961: 
  962: function loadPollingInterval() {
  963:   try {
  964:     const raw = sessionStorage.getItem(POLLING_INTERVAL_KEY);
  965:     if (!raw) return DEFAULT_POLLING_INTERVAL;
  966:     const val = parseInt(raw, 10);
  967:     if (POLLING_OPTIONS.some((o) => o.value === val)) return val;
  968:     return DEFAULT_POLLING_INTERVAL;
  969:   } catch {
  970:     return DEFAULT_POLLING_INTERVAL;
  971:   }
  972: }
  973: 
  974: function savePollingInterval(val) {
  975:   try {
  976:     sessionStorage.setItem(POLLING_INTERVAL_KEY, String(val));
  977:   } catch { /* ignore */ }
  978: }
  979: 
  980: function loadSortMode() {
  981:   try {
  982:     const raw = sessionStorage.getItem(SORT_MODE_KEY);
  983:     if (raw === "priority" || raw === "time") return raw;
  984:     return DEFAULT_SORT_MODE;
  985:   } catch {
  986:     return DEFAULT_SORT_MODE;
  987:   }
  988: }
  989: 
  990: function saveSortMode(val) {
  991:   try {
  992:     sessionStorage.setItem(SORT_MODE_KEY, val);
  993:   } catch { /* ignore */ }
  994: }
  995: 
  996: function loadSortOrder() {
  997:   try {
  998:     const raw = sessionStorage.getItem(SORT_ORDER_KEY);
  999:     if (raw === "newest" || raw === "oldest") return raw;
 1000:     return DEFAULT_SORT_ORDER;
 1001:   } catch {
 1002:     return DEFAULT_SORT_ORDER;
 1003:   }
 1004: }
 1005: 
 1006: function saveSortOrder(val) {
 1007:   try {
 1008:     sessionStorage.setItem(SORT_ORDER_KEY, val);
 1009:   } catch { /* ignore */ }
 1010: }
 1011: 
 1012: function getMyTablesKey(userIdOrToken) {
 1013:   return `staff_my_tables_${userIdOrToken || "anon"}`;
 1014: }
 1015: 
 1016: function loadMyTables(userIdOrToken) {
 1017:   try {
 1018:     const raw = localStorage.getItem(getMyTablesKey(userIdOrToken));
 1019:     return raw ? JSON.parse(raw) : [];
 1020:   } catch {
 1021:     return [];
 1022:   }
 1023: }
 1024: 
 1025: function saveMyTables(userIdOrToken, tables) {
 1026:   try {
 1027:     localStorage.setItem(getMyTablesKey(userIdOrToken), JSON.stringify(tables));
 1028:   } catch { /* ignore */ }
 1029: }
 1030: 
 1031: function tryVibrate(enabled) {
 1032:   if (!enabled) return;
 1033:   try {
 1034:     if (navigator?.vibrate) navigator.vibrate(60);
 1035:   } catch { /* ignore */ }
 1036: }
 1037: 
 1038: function createBeep() {
 1039:   try {
 1040:     const AudioCtx = window.AudioContext || window.webkitAudioContext;
 1041:     if (!AudioCtx) return null;
 1042:     const ctx = new AudioCtx();
 1043:     return {
 1044:       ctx,
 1045:       play: () => {
 1046:         const o = ctx.createOscillator();
 1047:         const g = ctx.createGain();
 1048:         o.type = "sine";
 1049:         o.frequency.value = 880;
 1050:         g.gain.value = 0.03;
 1051:         o.connect(g);
 1052:         g.connect(ctx.destination);
 1053:         o.start();
 1054:         o.stop(ctx.currentTime + 0.08);
 1055:       },
 1056:       resume: async () => {
 1057:         try {
 1058:           if (ctx.state === "suspended") await ctx.resume();
 1059:         } catch { /* ignore */ }
 1060:       },
 1061:     };
 1062:   } catch {
 1063:     return null;
 1064:   }
 1065: }
 1066: 
 1067: function canUseNotifications() {
 1068:   try {
 1069:     return typeof Notification !== "undefined";
 1070:   } catch {
 1071:     return false;
 1072:   }
 1073: }
 1074: 
 1075: function clearAllStaffData() {
 1076:   try {
 1077:     localStorage.removeItem(DEVICE_ID_STORAGE_KEY);
 1078:     localStorage.removeItem(NOTIF_PREFS_STORAGE_KEY);
 1079:     sessionStorage.removeItem(POLLING_INTERVAL_KEY);
 1080:     sessionStorage.removeItem(SORT_MODE_KEY);
 1081:     sessionStorage.removeItem(SORT_ORDER_KEY);
 1082:     // Clear all staff_my_tables_* keys
 1083:     Object.keys(localStorage).forEach(key => {
 1084:       if (key.startsWith('staff_my_tables_')) {
 1085:         localStorage.removeItem(key);
 1086:       }
 1087:     });
 1088:   } catch { /* ignore */ }
 1089: }
 1090: 
 1091: /**
 1092:  * Фильтрует этапы по каналу заказа (ORD-001, ORD-003)
 1093:  * @param {Object} order - заказ с order_type
 1094:  * @param {Array} stages - все этапы партнёра (sorted)
 1095:  * @returns {Array} - отфильтрованные этапы
 1096:  */
 1097: function getStagesForOrder(order, stages) {
 1098:   if (!order?.order_type || !stages?.length) return stages || [];
 1099:   
 1100:   const filtered = stages.filter(stage => {
 1101:     switch (order.order_type) {
 1102:       case 'hall': 
 1103:         return stage.enabled_hall !== false; // default true
 1104:       case 'pickup': 
 1105:         return stage.enabled_pickup !== false;
 1106:       case 'delivery': 
 1107:         return stage.enabled_delivery !== false;
 1108:       default: 
 1109:         return true;
 1110:     }
 1111:   });
 1112:   
 1113:   // P0-1: Normalize stage_id before comparison
 1114:   const orderStageId = getLinkId(order.stage_id);
 1115:   
 1116:   // Edge case: если текущий этап не попал в список — добавить его
 1117:   if (orderStageId) {
 1118:     const currentStage = stages.find(s => getLinkId(s.id) === orderStageId);
 1119:     if (currentStage && !filtered.find(s => getLinkId(s.id) === getLinkId(currentStage.id))) {
 1120:       filtered.push(currentStage);
 1121:       filtered.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
 1122:     }
 1123:   }
 1124:   
 1125:   return filtered;
 1126: }
 1127: 
 1128: // V2-05: Compute table-level status from group orders + service requests
 1129: function computeTableStatus(group, activeRequests, getStatusConfig) {
 1130:   const orders = group.orders.filter(o => o.status !== 'cancelled');
 1131: 
 1132:   // 1. Bill request check (table groups only, highest priority)
 1133:   if (group.type === 'table') {
 1134:     const tableRequests = (activeRequests || []).filter(
 1135:       r => getLinkId(r.table) === group.id
 1136:     );
 1137:     const hasBillRequest = tableRequests.some(r => r.request_type === 'bill');
 1138:     if (hasBillRequest) return 'BILL_REQUESTED';
 1139:     if (tableRequests.length > 0 && orders.length === 0) return 'NEW';
 1140:   }
 1141: 
 1142:   if (orders.length === 0) return 'ALL_SERVED';
 1143: 
 1144:   // 2. Any order needs accepting (first stage)? — takes priority over STALE
 1145:   // v3.6.0: Moved before STALE so new orders clear ПРОСРОЧЕН label
 1146:   if (orders.some(o => getStatusConfig(o).isFirstStage)) return 'NEW';
 1147: 
 1148:   // 3. STALE: all orders have no assignee and oldest is >3 min (Free tab signal)
 1149:   const allFree = orders.every(o => !getLinkId(o.assignee));
 1150:   if (allFree) {
 1151:     const oldest = Math.min(...orders.map(o => safeParseDate(o.created_date).getTime()));
 1152:     if (Date.now() - oldest > 3 * 60 * 1000) return 'STALE';
 1153:   }
 1154: 
 1155:   // 4. All orders at finish stage → waiter should close the table
 1156:   if (orders.every(o => getStatusConfig(o).isFinishStage)) return 'ALL_SERVED';
 1157: 
 1158:   // 5. Some orders at finish stage (food ready, needs serving)
 1159:   if (orders.some(o => getStatusConfig(o).isFinishStage)) return 'READY';
 1160: 
 1161:   // 6. All in middle stages (kitchen working)
 1162:   return 'PREPARING';
 1163: }
 1164: 
 1165: 
 1166: /* ═══════════════════════════════════════════════════════════════════════════
 1167:    SUB-COMPONENTS
 1168: ═══════════════════════════════════════════════════════════════════════════ */
 1169: 
 1170: /* function RateLimitScreen({ onRetry }) {
 1171:   return (
 1172:     <div
 1173:       data-group-id={group.id}
 1174:       className={`mb-3 rounded-lg border border-slate-200 overflow-hidden transition-all duration-300 ${style.bgClass} ${style.borderClass} ${highlightRing}`}
 1175:     >
 1176:       <div
 1177:         className="px-4 pt-3 pb-3 cursor-pointer active:opacity-80"
 1178:         onClick={onToggleExpand}
 1179:         role="button"
 1180:         aria-expanded={isExpanded}
 1181:         aria-label={group.type === 'table' ? `${identifier}` : `${identifier}: ${statusLabel}`}
 1182:       >
 1183:         {group.type === 'table' ? (
 1184:           <div className="space-y-2">
 1185:             <div className="flex items-start justify-between gap-3">
 1186:               <div className="flex items-center gap-2 min-w-0">
 1187:                 {ownershipState === 'mine' ? (
 1188:                   <span className="shrink-0"><Star className="w-4 h-4 fill-yellow-400 text-yellow-400" /></span>
 1189:                 ) : ownershipState === 'other' ? (
 1190:                   <button type="button" onClick={showOtherTableHint} className="shrink-0 rounded-full p-0.5 -m-0.5" aria-label={HALL_UI_TEXT.otherTableTitle}>
 1191:                     <Lock className="w-4 h-4 text-slate-400" />
 1192:                   </button>
 1193:                 ) : (
 1194:                   <span className="shrink-0"><Star className="w-4 h-4 text-slate-300" /></span>
 1195:                 )}
 1196:                 <span className="inline-flex min-w-[2rem] items-center justify-center rounded-lg bg-slate-900 px-2.5 py-1 text-sm font-bold text-white">{compactTableLabel}</span>
 1197:                 {tableData?.zone_name && <span className="rounded-full bg-white/80 px-2 py-1 text-[11px] font-medium text-slate-600 border border-slate-200 truncate">{tableData.zone_name}</span>}
 1198:               </div>
 1199:               {isExpanded && <span className="text-xs font-semibold text-slate-500 shrink-0">{HALL_UI_TEXT.collapse}</span>}
 1200:             </div>
 1201:             {ownerHintVisible && (
 1202:               <div className="rounded-lg bg-slate-900 px-3 py-2 text-white">
 1203:                 <div className="text-xs font-semibold">{HALL_UI_TEXT.otherTableTitle}</div>
 1204:                 <div className="text-[11px] text-slate-200">{HALL_UI_TEXT.otherTableHint}</div>
 1205:               </div>
 1206:             )}
 1207:             {hallSummaryItems.length > 0 ? (
 1208:               <div className="flex flex-wrap items-center gap-x-3 gap-y-1">{hallSummaryItems.map(renderHallSummaryItem)}</div>
 1209:             ) : (
 1210:               <div className="text-xs text-slate-400">{HALL_UI_TEXT.noActions}</div>
 1211:             )}
 1212:           </div>
 1213:         ) : (
 1214:           <React.Fragment>
 1215:             <div className="flex items-start justify-between gap-2 mb-1">
 1216:               <span className="font-bold text-base leading-tight flex-1 min-w-0 text-slate-900 truncate">{identifier}</span>
 1217:               <span className={`text-xs font-medium shrink-0 flex items-center gap-0.5 ${isOverdue ? 'text-red-600' : 'text-slate-500'}`}>
 1218:                 <Clock className={`w-3 h-3 ${isOverdue ? 'text-red-500' : ''}`} />
 1219:                 {elapsedLabel}
 1220:               </span>
 1221:             </div>
 1222:             <div className="flex items-center gap-1.5 mb-1 flex-wrap">
 1223:               <span className="flex items-center gap-1 text-xs text-slate-500"><ChannelIcon className="w-3.5 h-3.5" />{channelConfig.label}</span>
 1224:               <span className="text-slate-300">{'\u00B7'}</span>
 1225:               <span className={`text-xs font-semibold ${style.textClass || 'text-slate-700'}`}>{statusLabel}</span>
 1226:               {needsAction && <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />}
 1227:               {contactInfo && (contactInfo.name || contactInfo.phone) && (
 1228:                 <React.Fragment>
 1229:                   <span className="text-xs text-slate-500 ml-auto truncate max-w-[120px]">{contactInfo.name || ''}</span>
 1230:                   {contactInfo.phone && <a href={`tel:${contactInfo.phone}`} onClick={e => e.stopPropagation()} className="text-xs text-blue-600 shrink-0">+7{'\u2026'}{contactInfo.phone.slice(-4)}</a>}
 1231:                 </React.Fragment>
 1232:               )}
 1233:             </div>
 1234:             {legacySummaryLines.length > 0 ? (
 1235:               <div className="space-y-0.5 mt-0.5">
 1236:                 {legacySummaryLines.map((line, idx) => (
 1237:                   <div key={idx} className="text-xs text-slate-700 flex items-center gap-1 leading-snug">
 1238:                     <span className="font-medium">{`${line.count} ${line.label}`}</span>
 1239:                     <span className="text-slate-300">{'\u00B7'}</span>
 1240:                     <span>{`${line.ageMin} \u043C\u0438\u043D`}</span>
 1241:                   </div>
 1242:                 ))}
 1243:               </div>
 1244:             ) : (
 1245:               <div className="text-xs text-slate-400">{'\u041D\u0435\u0442 \u0430\u043A\u0442\u0438\u0432\u043D\u044B\u0445 \u0437\u0430\u043A\u0430\u0437\u043E\u0432'}</div>
 1246:             )}
 1247:           </React.Fragment>
 1248:         )}
 1249:       </div>
 1250: 
 1251:       <div className={`overflow-hidden transition-all duration-200 ease-out ${isExpanded ? 'max-h-[3000px] opacity-100' : 'max-h-0 opacity-0'}`}>
 1252:         <div className="border-t border-slate-200 px-4 py-3 space-y-4">
 1253:           {group.type === 'table' ? (
 1254:             <React.Fragment>
 1255:               <div className="rounded-xl border border-slate-200 bg-white/80 p-3 space-y-2">
 1256:                 <div className="flex items-center justify-between gap-3">
 1257:                   <div className="flex items-center gap-2 min-w-0">
 1258:                     {ownershipState === 'mine' ? <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 shrink-0" /> : ownershipState === 'other' ? <Lock className="w-4 h-4 text-slate-400 shrink-0" /> : <Star className="w-4 h-4 text-slate-300 shrink-0" />}
 1259:                     <span className="inline-flex min-w-[2rem] items-center justify-center rounded-lg bg-slate-900 px-2.5 py-1 text-sm font-bold text-white">{compactTableLabel}</span>
 1260:                     {tableData?.zone_name && <span className="rounded-full bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-600 border border-slate-200">{tableData.zone_name}</span>}
 1261:                   </div>
 1262:                   <button type="button" onClick={onToggleExpand} className="text-xs font-semibold text-slate-500 min-h-[36px]">{HALL_UI_TEXT.collapse}</button>
 1263:                 </div>
 1264:                 <div className="flex flex-wrap items-center gap-x-3 gap-y-1">{hallSummaryItems.length > 0 ? hallSummaryItems.map(renderHallSummaryItem) : <span className="text-xs text-slate-400">{HALL_UI_TEXT.noActions}</span>}</div>
 1265:                 {billData && billData.total > 0 && <div className="text-xs font-semibold text-slate-700">{`${HALL_UI_TEXT.bill} \u00B7 ${HALL_UI_TEXT.total} ${formatHallMoney(billData.total)}`}</div>}
 1266:               </div>
 1267: 
 1268:               {tableRequests.length > 0 && (
 1269:                 <div>
 1270:                   <div className="mb-2 flex items-center justify-between gap-3">
 1271:                     <div className="text-[11px] font-bold uppercase tracking-wider text-violet-600"><span className="bg-violet-50 rounded-md px-2 py-0.5">{`${HALL_UI_TEXT.requests} (${tableRequests.length})`}</span></div>
 1272:                     {tableRequests.length > 1 && (() => { const allNew = tableRequests.every(r => !r.status || r.status === 'new' || r.status === 'open'); const allAccepted = tableRequests.every(r => r.status === 'accepted'); if (allNew) return <button type="button" onClick={() => tableRequests.forEach(r => onCloseRequest(r.id, 'accepted', { assignee: effectiveUserId, assigned_at: new Date().toISOString() }))} disabled={isRequestPending} className="rounded-lg border border-violet-200 bg-violet-50 px-3 py-2 text-xs font-semibold text-violet-700 min-h-[36px] active:scale-[0.98] disabled:opacity-60">{`${HALL_UI_TEXT.acceptAllRequests} (${tableRequests.length})`}</button>; if (allAccepted) return <button type="button" onClick={() => tableRequests.forEach(r => onCloseRequest(r.id, 'done'))} disabled={isRequestPending} className="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-xs font-semibold text-green-700 min-h-[36px] active:scale-[0.98] disabled:opacity-60">{`${HALL_UI_TEXT.serveAllRequests} (${tableRequests.length})`}</button>; return null; })()}
 1273:                   </div>
 1274:                   <div className="space-y-1.5">
 1275:                     {tableRequests.map(request => {
 1276:                       const ageMin = getAgeMinutes(request.created_date);
 1277:                       const label = REQUEST_TYPE_LABELS[request.request_type] || request.request_type;
 1278:                       const isAccepted = request.status === 'accepted';
 1279:                       const isAssignedToMe = request.assignee === effectiveUserId;
 1280:                       return (
 1281:                         <div key={request.id} className="rounded-lg border border-violet-200 bg-violet-50/80 px-3 py-2">
 1282:                           <div className="flex items-center gap-3">
 1283:                             <div className="min-w-0 flex-1">
 1284:                               <div className="flex items-center gap-2 min-w-0">
 1285:                                 <span className="truncate text-sm font-medium text-slate-900">{label}</span>
 1286:                                 <span className="text-xs text-violet-500 shrink-0">{formatCompactMinutes(ageMin)}</span>
 1287:                                 {isAccepted && isAssignedToMe && staffName && <span className="shrink-0 rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-medium text-blue-700">{staffName}</span>}
 1288:                               </div>
 1289:                               {request.comment && <div className="mt-0.5 text-xs text-slate-500 truncate">{request.comment}</div>}
 1290:                             </div>
 1291:                             {onCloseRequest && (isAccepted ? <button type="button" onClick={() => onCloseRequest(request.id, 'done')} disabled={isRequestPending} className="shrink-0 rounded-lg border border-green-200 bg-white px-3 py-2 text-xs font-semibold text-green-700 min-h-[36px] active:scale-[0.98] disabled:opacity-60">{HALL_UI_TEXT.serveRequest}</button> : <button type="button" onClick={() => onCloseRequest(request.id, 'accepted', { assignee: effectiveUserId, assigned_at: new Date().toISOString() })} disabled={isRequestPending} className="shrink-0 rounded-lg border border-blue-200 bg-white px-3 py-2 text-xs font-semibold text-blue-700 min-h-[36px] active:scale-[0.98] disabled:opacity-60">{HALL_UI_TEXT.acceptRequest}</button>)}
 1292:                           </div>
 1293:                         </div>
 1294:                       );
 1295:                     })}
 1296:                   </div>
 1297:                 </div>
 1298:               )}
 1299: 
 1300:               {newOrders.length > 0 && (
 1301:                 <div>
 1302:                   <div className="flex items-center justify-between gap-3 mb-2">
 1303:                     <div className="text-[11px] font-bold uppercase tracking-wider text-blue-600"><span className="bg-blue-50 rounded-md px-2 py-0.5">{`${HALL_UI_TEXT.new} (${newOrders.length} ${pluralRu(newOrders.length, HALL_UI_TEXT.guests + '\u044C', HALL_UI_TEXT.guests + '\u044F', HALL_UI_TEXT.guests + '\u0435\u0439')} \u00B7 ${newRows.length || newOrders.length} ${pluralRu(newRows.length || newOrders.length, HALL_UI_TEXT.dishes + '\u043E', HALL_UI_TEXT.dishes + '\u0430', HALL_UI_TEXT.dishes)})`}</span></div>
 1304:                     <button type="button" onClick={() => handleOrdersAction(newOrders)} disabled={advanceMutation.isPending || batchInFlight} className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700 min-h-[36px] active:scale-[0.98] disabled:opacity-60">{newOrders.length > 0 && getOrderActionMeta(newOrders[0]).willServe ? HALL_UI_TEXT.serveAll : HALL_UI_TEXT.acceptAll}</button>
 1305:                   </div>
 1306:                   {renderHallRows(newRows, 'blue')}
 1307:                 </div>
 1308:               )}
 1309: 
 1310:               {inProgressSections.length > 0 && (
 1311:                 <div>
 1312:                   <button type="button" onClick={() => setInProgressExpanded(prev => !prev)} className="mb-2 flex w-full items-center justify-between text-left">
 1313:                     <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 opacity-60">{`${HALL_UI_TEXT.inProgress} (${inProgressOrders.length} ${pluralRu(inProgressOrders.length, HALL_UI_TEXT.guests + '\u044C', HALL_UI_TEXT.guests + '\u044F', HALL_UI_TEXT.guests + '\u0435\u0439')} \u00B7 ${inProgressSections.reduce((sum, section) => sum + section.rowCount, 0)} ${pluralRu(inProgressSections.reduce((sum, section) => sum + section.rowCount, 0), HALL_UI_TEXT.dishes + '\u043E', HALL_UI_TEXT.dishes + '\u0430', HALL_UI_TEXT.dishes)})`}</span>
 1314:                     <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${inProgressExpanded ? 'rotate-180' : ''}`} />
 1315:                   </button>
 1316:                   {inProgressExpanded && (
 1317:                     <div className="space-y-3 opacity-60">
 1318:                       {inProgressSections.map(section => {
 1319:                         const isSubExpanded = !!expandedSubGroups[section.sid];
 1320:                         return (
 1321:                           <div key={section.sid}>
 1322:                             <div className="mb-1.5 flex items-center justify-between gap-3 cursor-pointer" onClick={() => setExpandedSubGroups(prev => ({ ...prev, [section.sid]: !prev[section.sid] }))}>
 1323:                               <div className="flex items-center gap-2 min-w-0">
 1324:                                 <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${isSubExpanded ? 'rotate-180' : ''}`} />
 1325:                                 <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 opacity-60">{`${section.label} (${section.rowCount})`}</span>
 1326:                               </div>
 1327:                               <button type="button" onClick={(e) => { e.stopPropagation(); handleOrdersAction(section.orders); }} disabled={advanceMutation.isPending || batchInFlight} className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-700 min-h-[36px] active:scale-[0.98] disabled:opacity-60">{section.bulkLabel}</button>
 1328:                             </div>
 1329:                             {isSubExpanded && renderHallRows(section.rows)}
 1330:                           </div>
 1331:                         );
 1332:                       })}
 1333:                     </div>
 1334:                   )}
 1335:                 </div>
 1336:               )}
 1337: 
 1338:               {readyOrders.length > 0 && (
 1339:                 <div>
 1340:                   <div className="flex items-center justify-between gap-3 mb-2">
 1341:                     <div className="text-[11px] font-bold uppercase tracking-wider text-green-600"><span className="bg-green-50 rounded-md px-2 py-0.5">{`${HALL_UI_TEXT.ready} (${readyOrders.length} ${pluralRu(readyOrders.length, HALL_UI_TEXT.guests + '\u044C', HALL_UI_TEXT.guests + '\u044F', HALL_UI_TEXT.guests + '\u0435\u0439')} \u00B7 ${readyRows.length || readyOrders.length} ${pluralRu(readyRows.length || readyOrders.length, HALL_UI_TEXT.dishes + '\u043E', HALL_UI_TEXT.dishes + '\u0430', HALL_UI_TEXT.dishes)})`}</span></div>
 1342:                     <button type="button" onClick={() => handleOrdersAction(readyOrders)} disabled={advanceMutation.isPending || batchInFlight} className="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-xs font-semibold text-green-700 min-h-[36px] active:scale-[0.98] disabled:opacity-60">{HALL_UI_TEXT.serveAll}</button>
 1343:                   </div>
 1344:                   {renderHallRows(readyRows, 'green')}
 1345:                 </div>
 1346:               )}
 1347: 
 1348:               {servedOrders.length > 0 && (
 1349:                 <div>
 1350:                   <button type="button" onClick={() => setServedExpanded(prev => !prev)} className="mb-2 flex w-full items-center justify-between text-left">
 1351:                     <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 opacity-60">{`${HALL_UI_TEXT.served} (${servedRows.length || servedOrders.length})`}</span>
 1352:                     <span className="text-xs font-medium text-slate-400">{servedExpanded ? HALL_UI_TEXT.hide : HALL_UI_TEXT.show}</span>
 1353:                   </button>
 1354:                   {servedExpanded && <div className="opacity-60">{renderHallRows(servedRows)}</div>}
 1355:                 </div>
 1356:               )}
 1357: 
 1358:               {billData && billData.total > 0 && (
 1359:                 <div className={`rounded-xl border p-3 ${hasBillRequest ? 'border-violet-300 bg-violet-50/80' : 'border-slate-200 bg-slate-50'}`}>
 1360:                   <button type="button" onClick={() => setBillExpanded(prev => !prev)} className="flex w-full items-start justify-between gap-3 text-left">
 1361:                     <div className="min-w-0 flex-1">
 1362:                       <div className="text-[11px] font-bold uppercase tracking-wider text-slate-600">{HALL_UI_TEXT.bill}</div>
 1363:                       <div className="mt-1 text-sm font-semibold text-slate-900">{`${HALL_UI_TEXT.total} ${formatHallMoney(billData.total)}`}</div>
 1364:                       {!billExpanded && <div className="mt-1 text-xs text-slate-500">{`${HALL_UI_TEXT.remaining} ${formatHallMoney(billData.remaining)}`}</div>}
 1365:                     </div>
 1366:                     {billExpanded ? <ChevronUp className="w-4 h-4 text-slate-400 mt-1" /> : <ChevronDown className="w-4 h-4 text-slate-400 mt-1" />}
 1367:                   </button>
 1368:                   {billExpanded && (
 1369:                     <div className="mt-3 space-y-2 border-t border-slate-200 pt-3">
 1370:                       {billData.guests.map((guest, idx) => <div key={idx} className="flex items-center justify-between gap-3 text-sm"><span className="text-slate-600">{guest.name}</span><span className="font-medium text-slate-900">{formatHallMoney(guest.total)}</span></div>)}
 1371:                       <div className="border-t border-slate-200 pt-2 space-y-1 text-sm">
 1372:                         <div className="flex items-center justify-between gap-3"><span className="text-slate-500">{HALL_UI_TEXT.paid}</span><span className="font-medium text-slate-700">{formatHallMoney(billData.paid)}</span></div>
 1373:                         <div className="flex items-center justify-between gap-3 font-semibold text-slate-900"><span>{HALL_UI_TEXT.remaining}</span><span>{formatHallMoney(billData.remaining)}</span></div>
 1374:                       </div>
 1375:                     </div>
 1376:                   )}
 1377:                 </div>
 1378:               )}
 1379: 
 1380:               {onCloseTable && group.orders.length > 0 && (
 1381:                 <div className="pt-2 border-t border-slate-200">
 1382:                   <button type="button" onClick={handleCloseTableClick} disabled={!!closeDisabledReason} className={`w-full min-h-[44px] flex items-center justify-center gap-2 font-medium text-sm rounded-lg border transition-all active:scale-[0.99] ${closeDisabledReason ? 'bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed' : 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100'}`}>
 1383:                     <X className="w-4 h-4" />
 1384:                     {HALL_UI_TEXT.closeTable}
 1385:                   </button>
 1386:                   {closeDisabledReasons.length > 0 && <div className="mt-1 space-y-0.5">{closeDisabledReasons.map((reason, i) => <p key={i} className="text-[10px] text-slate-400 text-center">{reason}</p>)}</div>}
 1387:                 </div>
 1388:               )}
 1389:             </React.Fragment>
 1390:           ) : (
 1391:             <React.Fragment>
 1392:               {newOrders.length > 0 && <div><div className="flex items-center justify-between mb-2"><p className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">{`\u041D\u043E\u0432\u044B\u0435 (${newOrders.length})`}</p><button type="button" onClick={() => handleOrdersAction(newOrders)} disabled={advanceMutation.isPending || batchInFlight} className="text-xs font-semibold text-blue-600 bg-blue-50 border border-blue-200 px-3 py-1 rounded min-h-[44px] active:scale-95 disabled:opacity-60">{'\u041F\u0440\u0438\u043D\u044F\u0442\u044C \u0432\u0441\u0435'}</button></div><div className="space-y-2">{newOrders.map(renderLegacyOrderCard)}</div></div>}
 1393:               {readyOrders.length > 0 && <div><div className="flex items-center justify-between mb-2"><p className="text-[11px] font-bold text-green-600 uppercase tracking-wider">{`\u0413\u043E\u0442\u043E\u0432\u043E \u043A \u0432\u044B\u0434\u0430\u0447\u0435 (${readyOrders.length})`}</p><button type="button" onClick={() => handleOrdersAction(readyOrders)} disabled={advanceMutation.isPending || batchInFlight} className="text-xs font-semibold text-green-600 bg-green-50 border border-green-200 px-3 py-1 rounded min-h-[44px] active:scale-95 disabled:opacity-60">{'\u0412\u044B\u0434\u0430\u0442\u044C \u0432\u0441\u0435'}</button></div><div className="space-y-2">{readyOrders.map(renderLegacyOrderCard)}</div></div>}
 1394:               {inProgressOrders.length > 0 && (
 1395:                 <div>
 1396:                   <div className="flex items-center justify-between mb-2 cursor-pointer min-h-[44px]" onClick={() => setInProgressExpanded(prev => !prev)}>
 1397:                     <p className="text-[11px] font-bold text-amber-600 uppercase tracking-wider">{`\u0412 \u0440\u0430\u0431\u043E\u0442\u0435 (${inProgressOrders.length})`}</p>
 1398:                     <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${inProgressExpanded ? 'rotate-180' : ''}`} />
 1399:                   </div>
 1400:                   {inProgressExpanded && (
 1401:                     <div className="space-y-3">
 1402:                       {subGroups.map(({ sid, orders, cfg }) => {
 1403:                         const isSubExpanded = !!expandedSubGroups[sid];
 1404:                         const meta = getOrderActionMeta(orders[0]);
 1405:                         const actionName = meta.willServe ? HALL_UI_TEXT.serve : meta.label;
 1406:                         const subGroupLabel = sid === '__null__' ? '\u0412 \u0420\u0410\u0411\u041E\u0422\u0415' : cfg.label;
 1407:                         if (subGroups.length === 1) return <div key={sid} className="space-y-2">{orders.map(renderLegacyOrderCard)}</div>;
 1408:                         return (
 1409:                           <div key={sid}>
 1410:                             <div className="flex items-center justify-between mb-1.5 cursor-pointer min-h-[44px]" onClick={() => setExpandedSubGroups(prev => ({ ...prev, [sid]: !prev[sid] }))}>
 1411:                               <div className="flex items-center gap-2"><ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${isSubExpanded ? 'rotate-180' : ''}`} /><span className="text-[11px] font-bold text-amber-600 uppercase tracking-wider">{`${subGroupLabel} (${orders.length})`}</span></div>
 1412:                               <button type="button" onClick={(e) => { e.stopPropagation(); handleOrdersAction(orders); }} disabled={advanceMutation.isPending || batchInFlight} className="text-xs font-semibold text-amber-600 bg-amber-50 border border-amber-200 px-3 py-1 rounded min-h-[36px] active:scale-95 disabled:opacity-60">{`\u0412\u0441\u0435 \u2192 ${actionName}`}</button>
 1413:                             </div>
 1414:                             {isSubExpanded && <div className="space-y-2">{orders.map(renderLegacyOrderCard)}</div>}
 1415:                           </div>
 1416:                         );
 1417:                       })}
 1418:                     </div>
 1419:                   )}
 1420:                 </div>
 1421:               )}
 1422:               {contactInfo && (
 1423:                 <div className="space-y-2 pt-2 border-t border-slate-200">
 1424:                   {contactInfo.name && <div className="flex items-center gap-2 text-sm"><User className="w-4 h-4 text-slate-400" /><span className="text-slate-700">{contactInfo.name}</span></div>}
 1425:                   {contactInfo.phone && <div className="flex items-center gap-2 text-sm"><Phone className="w-4 h-4 text-slate-400" /><a href={`tel:${contactInfo.phone}`} className="text-blue-600 underline">{contactInfo.phone}</a></div>}
 1426:                   {contactInfo.address && <div className="flex items-center gap-2 text-sm"><MapPin className="w-4 h-4 text-slate-400" /><span className="text-slate-600">{contactInfo.address}</span></div>}
 1427:                 </div>
 1428:               )}
 1429:             </React.Fragment>
 1430:           )}
 1431:         </div>
 1432:       </div>
 1433:     </div>
 1434:   );
 1435: }
 1436: */
 1437: 
 1438: function RateLimitScreen({ onRetry }) {
 1439:   return (
 1440:     <div className="min-h-screen flex items-center justify-center bg-slate-100 p-6">
 1441:       <Card className="max-w-md w-full border-amber-200 bg-amber-50">
 1442:         <CardContent className="p-6 text-center space-y-4">
 1443:           <div className="w-12 h-12 mx-auto rounded-full bg-amber-100 flex items-center justify-center">
 1444:             <AlertTriangle className="w-6 h-6 text-amber-600" />
 1445:           </div>
 1446:           <div className="text-xl font-bold text-slate-900">{'\u0421\u043B\u0438\u0448\u043A\u043E\u043C \u043C\u043D\u043E\u0433\u043E \u0437\u0430\u043F\u0440\u043E\u0441\u043E\u0432'}</div>
 1447:           <div className="text-sm text-slate-600">{'\u0421\u0435\u0440\u0432\u0435\u0440 \u0432\u0440\u0435\u043C\u0435\u043D\u043D\u043E \u043E\u0433\u0440\u0430\u043D\u0438\u0447\u0438\u043B \u0434\u043E\u0441\u0442\u0443\u043F. \u041F\u043E\u0434\u043E\u0436\u0434\u0438\u0442\u0435 \u043C\u0438\u043D\u0443\u0442\u0443 \u0438 \u043F\u043E\u043F\u0440\u043E\u0431\u0443\u0439\u0442\u0435 \u0441\u043D\u043E\u0432\u0430.'}</div>
 1448:           <Button onClick={onRetry} className="w-full bg-amber-600 hover:bg-amber-700 text-white">
 1449:             <RefreshCcw className="w-4 h-4 mr-2" />
 1450:             {'\u041F\u043E\u043F\u0440\u043E\u0431\u043E\u0432\u0430\u0442\u044C \u0441\u043D\u043E\u0432\u0430'}
 1451:           </Button>
 1452:         </CardContent>
 1453:       </Card>
 1454:     </div>
 1455:   );
 1456: }
 1457: 
 1458: function LockedScreen() {
 1459:   return (
 1460:     <div className="min-h-screen flex items-center justify-center bg-slate-100 p-6">
 1461:       <Card className="max-w-md w-full border-slate-200">
 1462:         <CardContent className="p-6 text-center space-y-3">
 1463:           <div className="text-xl font-bold text-slate-900">{'\u0421\u0441\u044B\u043B\u043A\u0430 \u0437\u0430\u043D\u044F\u0442\u0430'}</div>
 1464:           <div className="text-sm text-slate-600">{'\u042D\u0442\u0430 \u0441\u0441\u044B\u043B\u043A\u0430 \u043E\u0444\u0438\u0446\u0438\u0430\u043D\u0442\u0430 \u0443\u0436\u0435 \u0438\u0441\u043F\u043E\u043B\u044C\u0437\u0443\u0435\u0442\u0441\u044F \u043D\u0430 \u0434\u0440\u0443\u0433\u043E\u043C \u0443\u0441\u0442\u0440\u043E\u0439\u0441\u0442\u0432\u0435.'}</div>
 1465:           <div className="text-xs text-slate-500">{'\u041F\u043E\u043F\u0440\u043E\u0441\u0438\u0442\u0435 \u043C\u0435\u043D\u0435\u0434\u0436\u0435\u0440\u0430 \u043F\u0435\u0440\u0435\u0432\u044B\u043F\u0443\u0441\u0442\u0438\u0442\u044C \u0441\u0441\u044B\u043B\u043A\u0443 \u0432 \u043A\u0430\u0431\u0438\u043D\u0435\u0442\u0435.'}</div>
 1466:         </CardContent>
 1467:       </Card>
 1468:     </div>
 1469:   );
 1470: }
 1471: 
 1472: function BindingScreen() {
 1473:   return (
 1474:     <div className="min-h-screen flex items-center justify-center bg-slate-100 p-6">
 1475:       <Card className="max-w-md w-full border-slate-200">
 1476:         <CardContent className="p-6 text-center space-y-3">
 1477:           <div className="text-xl font-bold text-slate-900">{'\u0410\u043A\u0442\u0438\u0432\u0430\u0446\u0438\u044F...'}</div>
 1478:           <div className="text-sm text-slate-600">{'\u041F\u0440\u0438\u0432\u044F\u0437\u044B\u0432\u0430\u0435\u043C \u0441\u0441\u044B\u043B\u043A\u0443 \u043A \u044D\u0442\u043E\u043C\u0443 \u0443\u0441\u0442\u0440\u043E\u0439\u0441\u0442\u0432\u0443.'}</div>
 1479:           <div className="flex justify-center pt-2">
 1480:             <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
 1481:           </div>
 1482:         </CardContent>
 1483:       </Card>
 1484:     </div>
 1485:   );
 1486: }
 1487: 
 1488: function IconToggle({ icon: Icon, label, count, selected, onClick, tone = "neutral", countAsIcon = false }) {
 1489:   const base = "flex flex-col items-center justify-center rounded-xl border transition-all select-none active:scale-[0.97]";
 1490:   const size = "flex-1 min-w-[52px] max-w-[120px] h-14";
 1491:   const isEmpty = count === 0;
 1492: 
 1493:   let cls = "";
 1494:   if (tone === "neutral") {
 1495:     cls = selected
 1496:       ? (isEmpty ? "bg-slate-600 text-slate-300 border-slate-600" : "bg-slate-900 text-white border-slate-900")
 1497:       : (isEmpty ? "bg-white text-slate-300 border-slate-200" : "bg-white text-slate-600 border-slate-200");
 1498:   } else if (tone === "indigo") {
 1499:     cls = selected
 1500:       ? (isEmpty ? "bg-indigo-100/50 text-indigo-300 border-indigo-200" : "bg-indigo-50 text-indigo-700 border-indigo-300 ring-1 ring-indigo-200")
 1501:       : (isEmpty ? "bg-white text-slate-300 border-slate-200" : "bg-white text-slate-500 border-slate-200");
 1502:   } else if (tone === "fuchsia") {
 1503:     cls = selected
 1504:       ? (isEmpty ? "bg-fuchsia-100/50 text-fuchsia-300 border-fuchsia-200" : "bg-fuchsia-50 text-fuchsia-700 border-fuchsia-300 ring-1 ring-fuchsia-200")
 1505:       : (isEmpty ? "bg-white text-slate-300 border-slate-200" : "bg-white text-slate-500 border-slate-200");
 1506:   } else {
 1507:     cls = selected
 1508:       ? (isEmpty ? "bg-teal-100/50 text-teal-300 border-teal-200" : "bg-teal-50 text-teal-700 border-teal-300 ring-1 ring-teal-200")
 1509:       : (isEmpty ? "bg-white text-slate-300 border-slate-200" : "bg-white text-slate-500 border-slate-200");
 1510:   }
 1511: 
 1512:   return (
 1513:     <button type="button" onClick={onClick} className={`${base} ${size} ${cls}`} aria-pressed={selected}>
 1514:       {countAsIcon ? (
 1515:         <span className={`text-xl font-bold leading-none ${isEmpty && selected ? "opacity-60" : ""}`}>{count}</span>
 1516:       ) : (
 1517:         <React.Fragment>
 1518:           <Icon className="w-5 h-5" />
 1519:           <span className="text-[10px] leading-tight opacity-70 mt-0.5">{count}</span>
 1520:         </React.Fragment>
 1521:       )}
 1522:       <span className="text-[10px] leading-tight mt-1 font-medium">{label}</span>
 1523:     </button>
 1524:   );
 1525: }
 1526: 
 1527: function RequestCard({ request, tableData, onAction, isPending, isFavorite, onToggleFavorite }) {
 1528:   const typeLabel = REQUEST_TYPE_LABELS[request.request_type] || request.request_type;
 1529:   const reqTableId = getLinkId(request.table);
 1530:   const tableLabel = reqTableId && tableData ? `\u0421\u0442\u043E\u043B ${tableData.name}` : request.table ? '\u0421\u0442\u043E\u043B ...' : '\u2014';
 1531:   const statusLabel = request.status === "new" ? '\u041D\u043E\u0432\u044B\u0439' : '\u0412 \u0440\u0430\u0431\u043E\u0442\u0435';
 1532:   const statusBadgeClass = request.status === "new" ? "bg-blue-50 text-blue-700 border-blue-200" : "bg-yellow-50 text-yellow-700 border-yellow-200";
 1533:   const actionLabel = request.status === "new" ? '\u0412 \u0440\u0430\u0431\u043E\u0442\u0443' : '\u0413\u043E\u0442\u043E\u0432\u043E';
 1534: 
 1535:   return (
 1536:     <div className="bg-white border border-slate-200 rounded-lg p-3 mb-2 shadow-sm">
 1537:       <div className="flex justify-between items-start mb-1">
 1538:         <div className="flex items-center gap-2">
 1539:           <Bell className="w-4 h-4 text-indigo-600" />
 1540:           <span className="font-semibold text-slate-900 text-sm">{typeLabel}</span>
 1541:           <button
 1542:             onClick={(event) => {
 1543:               event.stopPropagation();
 1544:               onToggleFavorite('request', request.id);
 1545:             }}
 1546:             className="p-1 -m-1 active:scale-90"
 1547:             aria-label={isFavorite ? '\u0423\u0431\u0440\u0430\u0442\u044C \u0438\u0437 \u0438\u0437\u0431\u0440\u0430\u043D\u043D\u043E\u0433\u043E' : '\u0412 \u0438\u0437\u0431\u0440\u0430\u043D\u043D\u043E\u0435'}
 1548:           >
 1549:             <Star className={`w-4 h-4 ${isFavorite ? "fill-yellow-400 text-yellow-400" : "text-slate-300"}`} />
 1550:           </button>
 1551:         </div>
 1552:         <span className="text-[10px] text-slate-400">{formatRelativeTime(request.created_date)}</span>
 1553:       </div>
 1554:       <div className="text-xs text-slate-500 mb-2">{tableLabel}</div>
 1555:       {request.comment && <div className="text-xs bg-slate-50 text-slate-600 p-2 rounded mb-2 border border-slate-100">{request.comment}</div>}
 1556:       <div className="flex items-center justify-between">
 1557:         <Badge variant="outline" className={`text-[10px] ${statusBadgeClass}`}>{statusLabel}</Badge>
 1558:         <Button size="sm" onClick={onAction} disabled={isPending} className="h-7 px-3 text-xs bg-indigo-600 hover:bg-indigo-700 text-white">
 1559:           {isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : actionLabel}
 1560:         </Button>
 1561:       </div>
 1562:     </div>
 1563:   );
 1564: }
 1565: 
 1566: function OrderCard({
 1567:   order,
 1568:   tableData,
 1569:   isFavorite,
 1570:   onToggleFavorite,
 1571:   disableServe,
 1572:   onMutate,
 1573:   effectiveUserId,
 1574:   isNotified,
 1575:   onClearNotified,
 1576:   getStatusConfig,
 1577:   isKitchen,
 1578:   guestsMap,
 1579:   onCloseTable,
 1580: }) {
 1581:   const queryClient = useQueryClient();
 1582:   const [itemsOpen, setItemsOpen] = useState(false);
 1583:   const tableId = getLinkId(order.table);
 1584:   const tableSessionId = getLinkId(order.table_session);
 1585:   const guestId = getLinkId(order.guest);
 1586:   const { data: items } = useQuery({
 1587:     queryKey: ["orderItems", order.id],
 1588:     queryFn: () => base44.entities.OrderItem.filter({ order: order.id }),
 1589:     staleTime: 30000,
 1590:     retry: shouldRetry,
 1591:     enabled: itemsOpen,
 1592:   });
 1593:   const statusConfig = getStatusConfig(order);
 1594:   const updateStatusMutation = useMutation({
 1595:     mutationFn: ({ id, payload }) => base44.entities.Order.update(id, payload),
 1596:     onMutate: async ({ id, payload }) => {
 1597:       if (onMutate) onMutate(id, payload.status || payload.stage_id);
 1598:       await queryClient.cancelQueries({ queryKey: ["orders"] });
 1599:       const prev = queryClient.getQueriesData({ queryKey: ["orders"] });
 1600:       queryClient.setQueriesData({ queryKey: ["orders"] }, (old) => Array.isArray(old) ? old.map((row) => (row.id === id ? { ...row, ...payload } : row)) : old);
 1601:       return { prev };
 1602:     },
 1603:     onError: (_err, _vars, ctx) => {
 1604:       if (ctx?.prev) ctx.prev.forEach(([key, data]) => queryClient.setQueryData(key, data));
 1605:     },
 1606:     onSettled: () => queryClient.invalidateQueries({ queryKey: ["orders"] }),
 1607:   });
 1608: 
 1609:   const handleAction = (event) => {
 1610:     event.stopPropagation();
 1611:     const payload = {};
 1612:     if (statusConfig.nextStageId) {
 1613:       payload.stage_id = statusConfig.nextStageId;
 1614:       if (statusConfig.derivedNextStatus) payload.status = statusConfig.derivedNextStatus;
 1615:     } else if (statusConfig.nextStatus) {
 1616:       payload.status = statusConfig.nextStatus;
 1617:     } else if (statusConfig.isFinishStage) {
 1618:       payload.status = "served";
 1619:     } else {
 1620:       return;
 1621:     }
 1622:     if ((order.status === "new" || statusConfig.isFirstStage) && effectiveUserId && !getAssigneeId(order)) {
 1623:       payload.assignee = effectiveUserId;
 1624:       payload.assigned_at = new Date().toISOString();
 1625:     }
 1626:     if (onClearNotified) onClearNotified(order.id);
 1627:     updateStatusMutation.mutate({ id: order.id, payload });
 1628:   };
 1629: 
 1630:   const typeConfig = TYPE_THEME[order.order_type] || TYPE_THEME.hall;
 1631:   const TypeIcon = typeConfig.icon;
 1632:   const badgeStyle = statusConfig.color ? { backgroundColor: `${statusConfig.color}20`, borderColor: statusConfig.color, color: statusConfig.color } : undefined;
 1633:   const guest = guestId && guestsMap ? guestsMap[guestId] : null;
 1634:   const mainText = order.order_type === "hall"
 1635:     ? (tableId && tableData ? `\u0421\u0442\u043E\u043B ${tableData.name}` : '\u0421\u0442\u043E\u043B \u043D\u0435 \u0443\u043A\u0430\u0437\u0430\u043D')
 1636:     : order.order_type === "pickup"
 1637:       ? '\u0421\u0430\u043C\u043E\u0432\u044B\u0432\u043E\u0437'
 1638:       : '\u0414\u043E\u0441\u0442\u0430\u0432\u043A\u0430';
 1639:   const secondaryText = order.order_type === "hall"
 1640:     ? tableData?.zone_name
 1641:     : order.order_type === "pickup"
 1642:       ? [order.client_name, order.client_phone].filter(Boolean).join(", ")
 1643:       : order.delivery_address;
 1644:   const showActionButton = !!(statusConfig.nextStageId || statusConfig.nextStatus) || !!(statusConfig.actionLabel && !statusConfig.isFinishStage);
 1645:   const isServeStep = statusConfig.nextStatus === "served" || statusConfig.isFinishStage;
 1646:   const actionDisabled = updateStatusMutation.isPending || (disableServe && isServeStep);
 1647:   const ctaClass = order.status === "ready" || statusConfig.isFinishStage ? "bg-green-600 hover:bg-green-700 ring-2 ring-green-400 ring-offset-1" : order.status === "new" || statusConfig.isFirstStage ? "bg-blue-600 hover:bg-blue-700" : "bg-indigo-600 hover:bg-indigo-700";
 1648: 
 1649:   return (
 1650:     <Card className="mb-3 overflow-hidden relative bg-white border-slate-200 border-l-0 rounded-l-md cursor-pointer" onClick={() => setItemsOpen((prev) => !prev)}>
 1651:       <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${typeConfig.stripeClass}`} />
 1652:       <CardContent className="p-3 pl-4">
 1653:         <div className="flex justify-between items-start mb-2">
 1654:           <div className="flex-1 min-w-0 mr-2">
 1655:             <div className="flex items-center gap-2 flex-wrap">
 1656:               <span className="font-bold text-base text-slate-900">{mainText}</span>
 1657:               {!isKitchen && order.order_number && <span className="text-sm text-gray-500 bg-gray-100 px-2 py-0.5 rounded">{order.order_number}</span>}
 1658:               <Badge variant="outline" className={`text-[9px] px-1 py-0 h-4 gap-0.5 ${typeConfig.badgeClass}`}>
 1659:                 <TypeIcon className="w-3 h-3" />
 1660:                 {typeConfig.label}
 1661:               </Badge>
 1662:               {order.order_type === "hall" && tableId && (
 1663:                 <button onClick={(event) => { event.stopPropagation(); onToggleFavorite('table', tableId); }} className="p-1.5 -m-1 active:scale-90" aria-label={isFavorite ? '\u0423\u0431\u0440\u0430\u0442\u044C \u0438\u0437 \u0438\u0437\u0431\u0440\u0430\u043D\u043D\u043E\u0433\u043E' : '\u0412 \u0438\u0437\u0431\u0440\u0430\u043D\u043D\u043E\u0435'}>
 1664:                   <Star className={`w-4 h-4 ${isFavorite ? "fill-yellow-400 text-yellow-400" : "text-slate-300"}`} />
 1665:                 </button>
 1666:               )}
 1667:             </div>
 1668:             {!isKitchen && guest && <span className="inline-block mt-1 text-sm bg-blue-50 text-blue-700 px-2 py-0.5 rounded">{getGuestDisplayName(guest)}</span>}
 1669:             {secondaryText && <div className="text-xs text-slate-500 truncate mt-0.5">{secondaryText}</div>}
 1670:           </div>
 1671:           <div className="text-[10px] text-slate-400 whitespace-nowrap flex items-center gap-1 bg-white/60 px-1.5 py-0.5 rounded border border-slate-100">
 1672:             {isNotified && <Sparkles className="w-3 h-3 text-orange-500 animate-pulse" />}
 1673:             <Clock className="w-3 h-3" />
 1674:             {formatRelativeTime(order.created_date)}
 1675:           </div>
 1676:         </div>
 1677:         <div className="mb-3 space-y-1">
 1678:           {itemsOpen ? (
 1679:             items ? items.slice(0, 5).map((item, idx) => (
 1680:               <div key={item.id || idx} className="text-sm text-slate-800">
 1681:                 <span className="font-semibold mr-1">{item.quantity}{'\u00D7'}</span>
 1682:                 {item.dish_name}
 1683:               </div>
 1684:             )) : <div className="flex items-center gap-1 text-xs text-slate-400"><Loader2 className="w-3 h-3 animate-spin" />{'\u0417\u0430\u0433\u0440\u0443\u0437\u043A\u0430'}</div>
 1685:           ) : (
 1686:             <div className="text-xs text-slate-400">{'\u041D\u0430\u0436\u043C\u0438\u0442\u0435, \u0447\u0442\u043E\u0431\u044B \u043F\u043E\u043A\u0430\u0437\u0430\u0442\u044C \u043F\u043E\u0437\u0438\u0446\u0438\u0438'}</div>
 1687:           )}
 1688:         </div>
 1689:         {order.comment && <div className="mb-3 text-xs bg-yellow-50 text-yellow-800 p-2 rounded border border-yellow-100"><span className="font-semibold">{'\u041A\u043E\u043C\u043C\u0435\u043D\u0442\u0430\u0440\u0438\u0439:'}</span> {order.comment}</div>}
 1690:         <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 gap-2">
 1691:           <Badge variant="outline" className={`text-xs px-2 py-0.5 ${statusConfig.badgeClass || ""}`} style={badgeStyle}>{statusConfig.label}</Badge>
 1692:           <div className="flex items-center gap-2">
 1693:             {!isKitchen && order.order_type === "hall" && tableSessionId && onCloseTable && (
 1694:               <Button variant="outline" size="sm" onClick={(event) => { event.stopPropagation(); onCloseTable(tableSessionId, tableData?.name || '\u0441\u0442\u043E\u043B'); }} className="h-8 px-2 text-xs text-red-600 border-red-200 hover:bg-red-50">
 1695:                 <X className="h-3 w-3 mr-1" />
 1696:                 {'\u0417\u0430\u043A\u0440\u044B\u0442\u044C \u0441\u0442\u043E\u043B'}
 1697:               </Button>
 1698:             )}
 1699:             {showActionButton && statusConfig.actionLabel && (
 1700:               <Button onClick={handleAction} disabled={actionDisabled} className={`text-white font-medium px-4 h-9 min-w-[100px] ${ctaClass}`}>
 1701:                 {updateStatusMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : statusConfig.actionLabel}
 1702:               </Button>
 1703:             )}
 1704:           </div>
 1705:         </div>
 1706:       </CardContent>
 1707:     </Card>
 1708:   );
 1709: }
 1710: 
 1711: function pluralRu(n, one, few, many) {
 1712:   const abs = Math.abs(n) % 100;
 1713:   const last = abs % 10;
 1714:   if (abs > 10 && abs < 20) return many;
 1715:   if (last > 1 && last < 5) return few;
 1716:   if (last === 1) return one;
 1717:   return many;
 1718: }
 1719: 
 1720: function OrderGroupCard({
 1721:   group,
 1722:   isExpanded,
 1723:   onToggleExpand,
 1724:   isHighlighted,
 1725:   isFavorite,
 1726:   onToggleFavorite,
 1727:   getStatusConfig,
 1728:   guestsMap,
 1729:   effectiveUserId,
 1730:   onMutate,
 1731:   onCloseTable,
 1732:   overdueMinutes,
 1733:   notifiedOrderIds,
 1734:   onClearNotified,
 1735:   tableMap,
 1736:   activeRequests,
 1737:   onCloseAllOrders,
 1738:   onCloseRequest,
 1739:   onBatchCloseRequestAsync = () => Promise.resolve(),
 1740:   orderStages = [],
 1741:   setUndoToast,
 1742:   undoToast,
 1743:   staffName,
 1744:   isRequestPending,
 1745: }) {
 1746:   const queryClient = useQueryClient();
 1747:   const tableId = group.type === "table" ? group.id : null;
 1748:   const tableData = tableId ? tableMap[tableId] : null;
 1749:   const tableStatus = computeTableStatus(group, activeRequests, getStatusConfig);
 1750:   const style = TABLE_STATUS_STYLES[tableStatus] || TABLE_STATUS_STYLES.PREPARING;
 1751: 
 1752:   const workOrders = useMemo(
 1753:     () => group.orders.filter((order) => !["served", "closed", "cancelled"].includes(order.status)),
 1754:     [group.orders]
 1755:   );
 1756:   const newOrders = useMemo(() => workOrders.filter((order) => getStatusConfig(order).isFirstStage), [workOrders, getStatusConfig]);
 1757:   const readyOrders = useMemo(() => workOrders.filter((order) => {
 1758:     const config = getStatusConfig(order);
 1759:     return !config.isFirstStage && config.isFinishStage;
 1760:   }), [workOrders, getStatusConfig]);
 1761:   const inProgressOrders = useMemo(() => workOrders.filter((order) => {
 1762:     const config = getStatusConfig(order);
 1763:     return !config.isFirstStage && !config.isFinishStage;
 1764:   }), [workOrders, getStatusConfig]);
 1765: 
 1766:   const subGroups = useMemo(() => {
 1767:     const bucket = {};
 1768:     inProgressOrders.forEach((order) => {
 1769:       const sid = getLinkId(order.stage_id) || "__null__";
 1770:       if (!bucket[sid]) bucket[sid] = [];
 1771:       bucket[sid].push(order);
 1772:     });
 1773: 
 1774:     const getStageIndex = (sid) => {
 1775:       if (sid === "__null__") return Number.MAX_SAFE_INTEGER;
 1776:       const index = orderStages.findIndex((stage) => getLinkId(stage.id) === sid);
 1777:       return index >= 0 ? index : Number.MAX_SAFE_INTEGER - 1;
 1778:     };
 1779: 
 1780:     return Object.entries(bucket)
 1781:       .map(([sid, orders]) => ({ sid, orders, cfg: getStatusConfig(orders[0]) }))
 1782:       .sort((a, b) => getStageIndex(a.sid) - getStageIndex(b.sid));
 1783:   }, [getStatusConfig, inProgressOrders, orderStages]);
 1784: 
 1785:   const itemResults = useQueries({
 1786:     queries: group.orders.map((order) => ({
 1787:       queryKey: ["orderItems", order.id],
 1788:       queryFn: () => base44.entities.OrderItem.filter({ order: order.id }),
 1789:       staleTime: 60000,
 1790:       retry: shouldRetry,
 1791:       enabled: isExpanded,
 1792:     })),
 1793:   });
 1794: 
 1795:   const { data: servedOrders = [] } = useQuery({
 1796:     queryKey: ["servedOrders", group.id],
 1797:     queryFn: () => base44.entities.Order.filter({ table: group.id, status: "served" }),
 1798:     enabled: isExpanded && group.type === "table",
 1799:     staleTime: 30000,
 1800:   });
 1801: 
 1802:   const [billExpanded, setBillExpanded] = useState(false);
 1803:   const [inProgressExpanded, setInProgressExpanded] = useState(true);
 1804:   const [expandedSubGroups, setExpandedSubGroups] = useState({});
 1805:   const [servedExpanded, setServedExpanded] = useState(false);
 1806:   const [ownerHintVisible, setOwnerHintVisible] = useState(false);
 1807:   const ownerHintTimerRef = useRef(null);
 1808:   const requestsSectionRef = useRef(null);
 1809:   const newSectionRef = useRef(null);
 1810:   const inProgressSectionRef = useRef(null);
 1811:   const readySectionRef = useRef(null);
 1812: 
 1813:   const scrollToSection = useCallback((kind) => {
 1814:     const refMap = {
 1815:       requests: requestsSectionRef,
 1816:       new: newSectionRef,
 1817:       inProgress: inProgressSectionRef,
 1818:       ready: readySectionRef,
 1819:     };
 1820:     const ref = refMap[kind];
 1821:     if (ref?.current) {
 1822:       ref.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
 1823:     }
 1824:   }, []);
 1825: 
 1826:   const servedItemResults = useQueries({
 1827:     queries: servedOrders.map((order) => ({
 1828:       queryKey: ["orderItems", order.id],
 1829:       queryFn: () => base44.entities.OrderItem.filter({ order: order.id }),
 1830:       staleTime: 60000,
 1831:       retry: shouldRetry,
 1832:       enabled: isExpanded && servedExpanded && group.type === "table",
 1833:     })),
 1834:   });
 1835: 
 1836:   useEffect(() => () => ownerHintTimerRef.current && clearTimeout(ownerHintTimerRef.current), []);
 1837: 
 1838:   useEffect(() => {
 1839:     if (!inProgressExpanded) {
 1840:       setExpandedSubGroups({});
 1841:       return;
 1842:     }
 1843:     if (subGroups.length > 0) {
 1844:       setExpandedSubGroups((prev) => (Object.keys(prev).length > 0 ? prev : { [subGroups[0].sid]: true }));
 1845:     }
 1846:   }, [inProgressExpanded, subGroups]);
 1847: 
 1848:   const itemsByOrder = useMemo(() => {
 1849:     const map = {};
 1850:     group.orders.forEach((order, index) => {
 1851:       if (itemResults[index]?.data) map[order.id] = itemResults[index].data;
 1852:     });
 1853:     return map;
 1854:   }, [group.orders, itemResults]);
 1855: 
 1856:   const servedItemsByOrder = useMemo(() => {
 1857:     const map = {};
 1858:     servedOrders.forEach((order, index) => {
 1859:       if (servedItemResults[index]?.data) map[order.id] = servedItemResults[index].data;
 1860:     });
 1861:     return map;
 1862:   }, [servedItemResults, servedOrders]);
 1863: 
 1864:   const oldestOrderTs = useMemo(() => {
 1865:     if (!group.orders.length) return null;
 1866:     return Math.min(...group.orders.map((order) => safeParseDate(order.created_date).getTime()));
 1867:   }, [group.orders]);
 1868:   const elapsedMin = oldestOrderTs ? Math.max(0, Math.floor((Date.now() - oldestOrderTs) / 60000)) : 0;
 1869:   const elapsedLabel = formatCompactMinutes(elapsedMin);
 1870:   const isOverdue = newOrders.length > 0 && elapsedMin > (overdueMinutes || 10);
 1871: 
 1872:   const tableRequests = useMemo(() => {
 1873:     if (group.type !== "table") return [];
 1874:     return (activeRequests || []).filter((request) => getLinkId(request.table) === group.id);
 1875:   }, [activeRequests, group.id, group.type]);
 1876: 
 1877:   const hasBillRequest = tableRequests.some((request) => request.request_type === "bill");
 1878:   const channelType = group.type === "table" ? "hall" : group.type;
 1879:   const channelConfig = TYPE_THEME[channelType] || TYPE_THEME.hall;
 1880:   const ChannelIcon = channelConfig.icon;
 1881:   const identifier = useMemo(() => {
 1882:     if (group.type === "table") {
 1883:       if (tableData?.name) {
 1884:         return String(tableData.name).startsWith('\u0421\u0442\u043E\u043B') ? tableData.name : `\u0421\u0442\u043E\u043B ${tableData.name}`;
 1885:       }
 1886:       return group.displayName;
 1887:     }
 1888:     const order = group.orders[0];
 1889:     const prefix = group.type === "pickup" ? "\u0421\u0412" : "\u0414\u041E\u0421";
 1890:     return `\u0417\u0430\u043A\u0430\u0437 ${prefix}-${order?.order_number || order?.id?.slice(-3) || "???"}`;
 1891:   }, [group.displayName, group.orders, group.type, tableData?.name]);
 1892:   const compactTableLabel = stripTablePrefix(identifier) || group.displayName || "?";
 1893:   const statusLabel = group.type === "table" ? style.label : (group.orders[0] ? getStatusConfig(group.orders[0]).label : "");
 1894:   const contactInfo = group.type !== "table"
 1895:     ? (() => {
 1896:         const order = group.orders[0];
 1897:         return order ? { name: order.client_name, phone: order.client_phone, address: order.delivery_address } : null;
 1898:       })()
 1899:     : null;
 1900: 
 1901:   const batchInFlightRef = useRef(false);
 1902:   const [batchInFlight, setBatchInFlight] = useState(false);
 1903: 
 1904:   const advanceMutation = useMutation({
 1905:     mutationFn: ({ id, payload }) => base44.entities.Order.update(id, payload),
 1906:     onMutate: async ({ id, payload }) => {
 1907:       if (onMutate) onMutate(id, payload.status || payload.stage_id);
 1908:       await queryClient.cancelQueries({ queryKey: ["orders"] });
 1909:       const prev = queryClient.getQueriesData({ queryKey: ["orders"] });
 1910:       queryClient.setQueriesData({ queryKey: ["orders"] }, (old) => Array.isArray(old) ? old.map((row) => (row.id === id ? { ...row, ...payload } : row)) : old);
 1911:       return { prev };
 1912:     },
 1913:     onError: (_err, _vars, ctx) => {
 1914:       if (ctx?.prev) ctx.prev.forEach(([key, data]) => queryClient.setQueryData(key, data));
 1915:     },
 1916:     onSettled: (_data, _err, vars) => {
 1917:       if (vars?.__batch) return;
 1918:       queryClient.invalidateQueries({ queryKey: ["orders"] });
 1919:       queryClient.invalidateQueries({ queryKey: ["servedOrders", group.id] });
 1920:     },
 1921:   });
 1922: 
 1923:   const buildAdvancePayload = useCallback((order) => {
 1924:     const config = getStatusConfig(order);
 1925:     const payload = {};
 1926:     if (config.nextStageId) {
 1927:       payload.stage_id = config.nextStageId;
 1928:       if (config.derivedNextStatus) payload.status = config.derivedNextStatus;
 1929:     } else if (config.nextStatus) {
 1930:       payload.status = config.nextStatus;
 1931:     } else if (config.isFinishStage) {
 1932:       payload.status = "served";
 1933:     } else {
 1934:       return null;
 1935:     }
 1936:     if (config.isFirstStage && effectiveUserId && !getAssigneeId(order)) {
 1937:       payload.assignee = effectiveUserId;
 1938:       payload.assigned_at = new Date().toISOString();
 1939:     }
 1940:     return payload;
 1941:   }, [effectiveUserId, getStatusConfig]);
 1942: 
 1943:   const startUndoWindow = useCallback((orders, rowId) => {
 1944:     if (!setUndoToast || orders.length === 0) return;
 1945:     const snapshots = orders.map((order) => ({ orderId: order.id, prevStatus: order.status, prevStageId: getLinkId(order.stage_id) }));
 1946:     setUndoToast((prev) => {
 1947:       if (prev?.timerId) clearTimeout(prev.timerId);
 1948:       const timerId = setTimeout(() => setUndoToast(null), 3000);
 1949:       return {
 1950:         snapshots,
 1951:         timerId,
 1952:         orderId: orders[orders.length - 1].id,
 1953:         rowId,
 1954:         label: HALL_UI_TEXT.undoLabel,
 1955:         onUndo: async () => {
 1956:           await runBatchSequential(snapshots, async ({ orderId, prevStatus, prevStageId }) => {
 1957:             const payload = { status: prevStatus };
 1958:             if (prevStageId) payload.stage_id = prevStageId;
 1959:             return advanceMutation.mutateAsync({ id: orderId, payload, __batch: true });
 1960:           });
 1961:           queryClient.invalidateQueries({ queryKey: ["orders"] });
 1962:           queryClient.invalidateQueries({ queryKey: ["servedOrders", group.id] });
 1963:         },
 1964:       };
 1965:     });
 1966:   }, [advanceMutation, setUndoToast]);
 1967: 
 1968:   const getOrderActionMeta = useCallback((order) => {
 1969:     const config = getStatusConfig(order);
 1970:     const nextLabel = (config.actionLabel || "").replace(/^\u2192\s*/, "");
 1971:     const willServe = config.isFinishStage || config.derivedNextStatus === "served" || config.nextStatus === "served";
 1972:     return {
 1973:       config,
 1974:       nextLabel,
 1975:       willServe,
 1976:       rowLabel: willServe ? HALL_UI_TEXT.serve : config.isFirstStage ? HALL_UI_TEXT.accept : `\u2192 ${nextLabel}`,
 1977:       bulkLabel: willServe ? HALL_UI_TEXT.serveAll : config.isFirstStage ? HALL_UI_TEXT.acceptAll : `\u0412\u0441\u0435 \u2192 ${nextLabel}`,
 1978:     };
 1979:   }, [getStatusConfig]);
 1980: 
 1981:   const handleOrdersAction = useCallback(async (orders, rowId) => {
 1982:     if (advanceMutation.isPending || batchInFlightRef.current) return;
 1983:     const actionable = orders.map((order) => ({ order, payload: buildAdvancePayload(order), meta: getOrderActionMeta(order) })).filter((entry) => entry.payload);
 1984:     if (actionable.length === 0) return;
 1985:     batchInFlightRef.current = true;
 1986:     setBatchInFlight(true);
 1987:     try {
 1988:       await runBatchSequential(actionable, async ({ order, payload }) => {
 1989:         if (onClearNotified) onClearNotified(order.id);
 1990:         return advanceMutation.mutateAsync({ id: order.id, payload, __batch: true });
 1991:       });
 1992:       queryClient.invalidateQueries({ queryKey: ["orders"] });
 1993:       queryClient.invalidateQueries({ queryKey: ["servedOrders", group.id] });
 1994:       if (actionable.every(({ meta }) => meta.willServe)) {
 1995:         startUndoWindow(actionable.map(({ order }) => order), rowId);
 1996:       }
 1997:     } finally {
 1998:       batchInFlightRef.current = false;
 1999:       setBatchInFlight(false);
 2000:     }
 2001:   }, [advanceMutation, buildAdvancePayload, getOrderActionMeta, onClearNotified, startUndoWindow, queryClient, group.id]);
 2002:   const handleSingleAction = useCallback((order, rowId) => handleOrdersAction([order], rowId), [handleOrdersAction]);
 2003: 
 2004:   const guestName = useCallback((order) => {
 2005:     const guestId = getLinkId(order.guest);
 2006:     const guest = guestId && guestsMap ? guestsMap[guestId] : null;
 2007:     if (guest) return getGuestDisplayName(guest);
 2008:     if (order.client_name) return order.client_name;
 2009:     return '\u0413\u043E\u0441\u0442\u044C';
 2010:   }, [guestsMap]);
 2011:   const guestMarker = useCallback((order) => {
 2012:     const label = guestName(order);
 2013:     const marker = extractGuestMarker(label);
 2014:     return marker ? `\uD83D\uDC64${marker}` : label;
 2015:   }, [guestName]);
 2016: 
 2017:   const billData = useMemo(() => {
 2018:     if (group.type !== "table") return null;
 2019:     const guests = {};
 2020:     let total = 0;
 2021:     group.orders.filter((order) => order.status !== "cancelled").forEach((order) => {
 2022:       const gid = getLinkId(order.guest) || "__default";
 2023:       if (!guests[gid]) {
 2024:         const guest = gid !== "__default" && guestsMap ? guestsMap[gid] : null;
 2025:         const label = guest ? getGuestDisplayName(guest) : '\u0413\u043E\u0441\u0442\u044C';
 2026:         guests[gid] = { id: gid, name: label, marker: extractGuestMarker(label), total: 0 };
 2027:       }
 2028:       guests[gid].total += Number(order.total_amount || 0);
 2029:       total += Number(order.total_amount || 0);
 2030:     });
 2031:     return {
 2032:       guests: Object.values(guests).sort((a, b) => {
 2033:         const aMarker = Number(a.marker || Number.MAX_SAFE_INTEGER);
 2034:         const bMarker = Number(b.marker || Number.MAX_SAFE_INTEGER);
 2035:         if (aMarker !== bMarker) return aMarker - bMarker;
 2036:         return String(a.name || "").localeCompare(String(b.name || ""));
 2037:       }),
 2038:       total,
 2039:       paid: 0,
 2040:       remaining: total,
 2041:     };
 2042:   }, [group.orders, group.type, guestsMap]);
 2043: 
 2044:   const countRows = useCallback((rows, fallback) => {
 2045:     const count = rows.filter((row) => !row.loading).length;
 2046:     return count > 0 ? count : fallback;
 2047:   }, []);
 2048:   const getOldestAgeMinutes = useCallback((entries, getDate) => {
 2049:     if (!entries.length) return null;
 2050:     const oldest = Math.min(...entries.map((entry) => safeParseDate(getDate(entry)).getTime()));
 2051:     return Math.max(0, Math.floor((Date.now() - oldest) / 60000));
 2052:   }, []);
 2053: 
 2054:   const buildHallRows = useCallback((orders, { served = false } = {}) => {
 2055:     return orders.flatMap((order) => {
 2056:       const orderItems = served ? servedItemsByOrder[order.id] : itemsByOrder[order.id];
 2057:       const meta = getOrderActionMeta(order);
 2058:       const secondary = guestMarker(order);
 2059:       const timeLabel = served ? formatClockTime(order.updated_date || order.created_date) : null;
 2060:       if (!orderItems || orderItems.length === 0) {
 2061:         return [{ id: `${order.id}:${served ? "served" : "active"}:loading`, order, primary: HALL_UI_TEXT.loading, secondary, actionLabel: served ? null : meta.rowLabel, willServe: meta.willServe, loading: true, timeLabel }];
 2062:       }
 2063:       return orderItems.map((item, index) => ({ id: `${order.id}:${item.id || index}`, order, primary: `${item.dish_name || HALL_UI_TEXT.loading} \u00D7${item.quantity || 1}`, secondary, actionLabel: served ? null : meta.rowLabel, willServe: meta.willServe, loading: false, timeLabel }));
 2064:     });
 2065:   }, [getOrderActionMeta, guestMarker, itemsByOrder, servedItemsByOrder]);
 2066: 
 2067:   const newRows = useMemo(() => buildHallRows(newOrders), [buildHallRows, newOrders]);
 2068:   const readyRows = useMemo(() => buildHallRows(readyOrders), [buildHallRows, readyOrders]);
 2069:   const servedRows = useMemo(() => buildHallRows(servedOrders, { served: true }), [buildHallRows, servedOrders]);
 2070:   const requestSummary = tableRequests.length > 0 ? { key: "requests", kind: "requests", icon: Bell, label: null, count: tableRequests.length, ageMin: getOldestAgeMinutes(tableRequests, (request) => request.created_date) || 0 } : null;
 2071:   const newSummary = newOrders.length > 0 ? { key: "new", kind: "new", icon: null, label: HALL_UI_TEXT.newShort, count: countRows(newRows, newOrders.length), ageMin: getOldestAgeMinutes(newOrders, (order) => order.created_date) || 0 } : null;
 2072:   const readySummary = readyOrders.length > 0 ? { key: "ready", kind: "ready", icon: null, label: HALL_UI_TEXT.readyShort, count: countRows(readyRows, readyOrders.length), ageMin: getOldestAgeMinutes(readyOrders, (order) => order.stage_entered_at || order.created_date) || 0 } : null;
 2073:   const hallSummaryItems = [requestSummary, newSummary, readySummary].filter(Boolean);
 2074: 
 2075:   const inProgressSections = useMemo(() => subGroups.map(({ sid, orders, cfg }) => {
 2076:     const rows = buildHallRows(orders);
 2077:     const actionMeta = getOrderActionMeta(orders[0]);
 2078:     return { sid, orders, rows, rowCount: countRows(rows, orders.length), label: sid === "__null__" ? HALL_UI_TEXT.inProgress : cfg.label, bulkLabel: actionMeta.bulkLabel };
 2079:   }).filter((section) => section.orders.length > 0), [buildHallRows, countRows, getOrderActionMeta, subGroups]);
 2080: 
 2081:   const jumpChips = [
 2082:     tableRequests.length > 0 && { label: HALL_UI_TEXT.requestsShort, count: tableRequests.length, kind: "requests", tone: "red" },
 2083:     newOrders.length > 0 && { label: HALL_UI_TEXT.newShort, count: countRows(newRows, newOrders.length), kind: "new", tone: "blue" },
 2084:     inProgressOrders.length > 0 && { label: HALL_UI_TEXT.inProgressShort, count: inProgressSections.reduce((s, sec) => s + sec.rowCount, 0), kind: "inProgress", tone: "amber" },
 2085:     readyOrders.length > 0 && { label: HALL_UI_TEXT.readyShort, count: countRows(readyRows, readyOrders.length), kind: "ready", tone: "green" },
 2086:     billData && billData.total > 0 && { label: HALL_UI_TEXT.bill, count: formatHallMoney(billData.total), kind: "bill", tone: "gray" },
 2087:   ].filter(Boolean);
 2088: 
 2089:   const scsChips = useMemo(() => {
 2090:     const chips = [];
 2091:     if (readyOrders.length > 0) {
 2092:       const ageMin = getOldestAgeMinutes(readyOrders, o => o.stage_entered_at || o.created_date) || 0;
 2093:       chips.push({ key: 'ready', label: '\u0413\u043E\u0442\u043E\u0432\u043E', count: readyOrders.length, ageMin, isActionable: true, tone: 'green' });
 2094:     }
 2095:     if (tableRequests.length > 0) {
 2096:       const ageMin = getOldestAgeMinutes(tableRequests, r => r.created_date) || 0;
 2097:       chips.push({ key: 'requests', label: '\u0417\u0430\u043F\u0440\u043E\u0441\u044B', count: tableRequests.length, ageMin, isActionable: true, tone: 'red' });
 2098:     }
 2099:     if (newOrders.length > 0) {
 2100:       const ageMin = getOldestAgeMinutes(newOrders, o => o.created_date) || 0;
 2101:       chips.push({ key: 'new', label: '\u041D\u043E\u0432\u044B\u0435', count: newOrders.length, ageMin, isActionable: true, tone: 'blue' });
 2102:     }
 2103:     inProgressSections.forEach(section => {
 2104:       if (section.rowCount > 0) {
 2105:         const label = section.sid === '__null__' ? HALL_UI_TEXT.inProgressShort : section.label;
 2106:         chips.push({ key: section.sid, label, count: section.rowCount, ageMin: 0, isActionable: false, tone: 'gray' });
 2107:       }
 2108:     });
 2109:     return chips;
 2110:   }, [readyOrders, tableRequests, newOrders, inProgressSections, getOldestAgeMinutes]);
 2111: 
 2112:   const scsOldestActionable = useMemo(() => {
 2113:     const ages = scsChips.filter(c => c.isActionable && c.ageMin > 0).map(c => c.ageMin);
 2114:     return ages.length > 0 ? Math.max(...ages) : 0;
 2115:   }, [scsChips]);
 2116: 
 2117:   const scsUrgency = getUrgencyLevel(scsOldestActionable);
 2118: 
 2119:   const scsHighlightKey = useMemo(() => {
 2120:     const actionable = scsChips.filter(c => c.isActionable && c.ageMin > 0);
 2121:     if (actionable.length === 0) return null;
 2122:     const maxAge = Math.max(...actionable.map(c => c.ageMin));
 2123:     for (const key of ['ready', 'requests', 'new']) {
 2124:       const chip = actionable.find(c => c.key === key && c.ageMin === maxAge);
 2125:       if (chip) return chip.key;
 2126:     }
 2127:     return actionable.find(c => c.ageMin === maxAge)?.key || null;
 2128:   }, [scsChips]);
 2129: 
 2130:   const legacySummaryLines = useMemo(() => {
 2131:     const lines = [];
 2132:     if (newOrders.length > 0) lines.push({ key: "new", label: '\u041D\u043E\u0432\u044B\u0435', count: newOrders.length, ageMin: getOldestAgeMinutes(newOrders, (order) => order.created_date) || 0 });
 2133:     if (readyOrders.length > 0) lines.push({ key: "ready", label: '\u0413\u043E\u0442\u043E\u0432\u043E', count: readyOrders.length, ageMin: getOldestAgeMinutes(readyOrders, (order) => order.stage_entered_at || order.created_date) || 0 });
 2134:     if (inProgressOrders.length > 0) lines.push({ key: "progress", label: '\u0412 \u0440\u0430\u0431\u043E\u0442\u0435', count: inProgressOrders.length, ageMin: getOldestAgeMinutes(inProgressOrders, (order) => order.stage_entered_at || order.created_date) || 0 });
 2135:     return lines;
 2136:   }, [getOldestAgeMinutes, inProgressOrders, newOrders, readyOrders]);
 2137: 
 2138:   const ownershipState = useMemo(() => {
 2139:     if (group.type !== "table") return null;
 2140:     if (group.orders.some((order) => isOrderMine(order, effectiveUserId))) return "mine";
 2141:     if (group.orders.some((order) => !!getAssigneeId(order))) return "other";
 2142:     return "free";
 2143:   }, [effectiveUserId, group.orders, group.type]);
 2144: 
 2145:   const closeDisabledReasons = useMemo(() => {
 2146:     if (group.type !== "table") return [];
 2147:     const reasons = [];
 2148:     if (tableRequests.length > 0) reasons.push(HALL_UI_TEXT.requestsBlocker);
 2149:     if (newOrders.length > 0) reasons.push(HALL_UI_TEXT.newBlocker);
 2150:     if (inProgressOrders.length > 0) reasons.push(HALL_UI_TEXT.inProgressBlocker);
 2151:     if (readyOrders.length > 0) reasons.push(HALL_UI_TEXT.readyBlocker);
 2152:     return reasons;
 2153:   }, [group.type, tableRequests.length, newOrders.length, inProgressOrders.length, readyOrders.length]);
 2154:   const closeDisabledReason = closeDisabledReasons[0] || null;
 2155:   const reasonToKind = useMemo(() => ({
 2156:     [HALL_UI_TEXT.requestsBlocker]: "requests",
 2157:     [HALL_UI_TEXT.newBlocker]: "new",
 2158:     [HALL_UI_TEXT.inProgressBlocker]: "inProgress",
 2159:     [HALL_UI_TEXT.readyBlocker]: "ready",
 2160:   }), []);
 2161:   const handleCloseTableClick = useCallback(() => {
 2162:     const sessionId = group.orders.map((order) => getLinkId(order.table_session)).find(Boolean);
 2163:     if (onCloseTable && sessionId) {
 2164:       onCloseTable(sessionId, identifier);
 2165:       return;
 2166:     }
 2167:     if (onCloseAllOrders) onCloseAllOrders(group.orders);
 2168:   }, [group.orders, identifier, onCloseAllOrders, onCloseTable]);
 2169:   const showOtherTableHint = useCallback((event) => {
 2170:     event?.stopPropagation();
 2171:     if (ownershipState !== "other") return;
 2172:     setOwnerHintVisible(true);
 2173:     if (ownerHintTimerRef.current) clearTimeout(ownerHintTimerRef.current);
 2174:     ownerHintTimerRef.current = setTimeout(() => setOwnerHintVisible(false), 1600);
 2175:   }, [ownershipState]);
 2176: 
 2177:   const getSummaryTone = useCallback((kind, ageMin) => {
 2178:     if (kind === "requests") return ageMin >= 3 ? "text-red-600" : "text-violet-600";
 2179:     if (kind === "ready") return ageMin >= 5 ? "text-red-600" : "text-green-600";
 2180:     return ageMin >= (overdueMinutes || 10) ? "text-red-600" : "text-blue-600";
 2181:   }, [overdueMinutes]);
 2182: 
 2183:   const renderHallSummaryItem = useCallback((item) => {
 2184:     const Icon = item.icon;
 2185:     return (
 2186:       <button
 2187:         type="button"
 2188:         key={item.key}
 2189:         onClick={(e) => { e.stopPropagation(); scrollToSection(item.kind); }}
 2190:         className={`inline-flex items-center gap-1.5 text-xs font-medium cursor-pointer active:opacity-70 ${getSummaryTone(item.kind, item.ageMin)}`}
 2191:       >
 2192:         {Icon && <Icon className="w-3.5 h-3.5 shrink-0" />}
 2193:         {item.label && <span>{item.label}</span>}
 2194:         <span className="font-semibold text-slate-900">{item.count}</span>
 2195:         <span className="text-slate-300">{'\u00B7'}</span>
 2196:         <span>{formatCompactMinutes(item.ageMin)}</span>
 2197:       </button>
 2198:     );
 2199:   }, [getSummaryTone, scrollToSection]);
 2200: 
 2201:   const renderHallRows = useCallback((rows, tone = "slate", readOnly = false) => {
 2202:     const palette = {
 2203:       blue: { bg: "bg-blue-50/80", border: "border-blue-200", button: "border-blue-200 bg-white text-blue-700" },
 2204:       green: { bg: "bg-green-50/80", border: "border-green-200", button: "border-green-200 bg-white text-green-700" },
 2205:       amber: { bg: "bg-amber-50/80", border: "border-amber-200", button: "border-amber-200 bg-white text-amber-700" },
 2206:       slate: { bg: "bg-slate-50", border: "border-slate-200", button: "border-slate-200 bg-white text-slate-700" },
 2207:     }[tone] || { bg: "bg-slate-50", border: "border-slate-200", button: "border-slate-200 bg-white text-slate-700" };
 2208: 
 2209:     const toastOrderId = undoToast?.orderId;
 2210:     const renderedToast = new Set();
 2211: 
 2212:     return (
 2213:       <div className="space-y-1.5">
 2214:         {rows.map((row, idx) => {
 2215:           const isLastOfOrder = !rows[idx + 1] || rows[idx + 1].order?.id !== row.order?.id;
 2216:           const showToast = toastOrderId && row.order?.id === toastOrderId && (undoToast.rowId ? row.id === undoToast.rowId : isLastOfOrder) && !renderedToast.has(toastOrderId);
 2217:           if (showToast) renderedToast.add(toastOrderId);
 2218:           const ageMin = getAgeMinutes(row.order?.created_date);
 2219:           const overdueThreshold = overdueMinutes || 10;
 2220:           const urgencyClass = ageMin >= overdueThreshold + 5 ? "border-l-4 border-l-red-500" : ageMin >= overdueThreshold ? "border-l-4 border-l-amber-400" : "";
 2221: 
 2222:           return (
 2223:             <React.Fragment key={row.id}>
 2224:               <div className={`rounded-lg border ${palette.border} ${palette.bg} px-3 py-2 ${urgencyClass}`}>
 2225:                 <div className="flex items-center gap-3">
 2226:                   <div className="min-w-0 flex-1">
 2227:                     <div className="flex items-center gap-2 min-w-0">
 2228:                       <span className={`truncate text-sm ${row.loading ? "text-slate-400" : "font-medium text-slate-900"}`}>{row.primary}</span>
 2229:                       {row.secondary && <span className="shrink-0 text-xs text-slate-500">{row.secondary}</span>}
 2230:                     </div>
 2231:                   </div>
 2232:                   {readOnly ? (
 2233:                     <span className="shrink-0 text-xs text-slate-400">{row.timeLabel}</span>
 2234:                   ) : row.actionLabel ? (
 2235:                     <button type="button" onClick={() => handleSingleAction(row.order, row.id)} disabled={advanceMutation.isPending || row.loading} className={`shrink-0 rounded-lg border px-3 py-2 text-xs font-semibold min-h-[36px] active:scale-[0.98] disabled:opacity-60 ${row.willServe ? "border-green-200 bg-white text-green-700" : row.actionLabel === HALL_UI_TEXT.accept ? "border-blue-200 bg-white text-blue-700" : palette.button}`}>
 2236:                       {advanceMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : row.actionLabel}
 2237:                     </button>
 2238:                   ) : null}
 2239:                 </div>
 2240:               </div>
 2241:               {showToast && (
 2242:                 <div className="flex items-center justify-between bg-slate-800 text-white text-xs rounded-lg px-3 py-2">
 2243:                   <span>{undoToast.label || HALL_UI_TEXT.undoLabel}</span>
 2244:                   <button type="button" onClick={() => { if (undoToast.timerId) clearTimeout(undoToast.timerId); undoToast.onUndo(); setUndoToast(null); }} className="ml-3 font-semibold text-amber-300 underline min-h-[36px] flex items-center">{HALL_UI_TEXT.undo}</button>
 2245:                 </div>
 2246:               )}
 2247:             </React.Fragment>
 2248:           );
 2249:         })}
 2250:       </div>
 2251:     );
 2252:   }, [advanceMutation.isPending, handleSingleAction, undoToast, setUndoToast]);
 2253: 
 2254:   const renderLegacyOrderCard = useCallback((order) => {
 2255:     const config = getStatusConfig(order);
 2256:     const actionMeta = getOrderActionMeta(order);
 2257:     const orderItems = itemsByOrder[order.id] || [];
 2258:     const badgeStyle = config.color ? { backgroundColor: `${config.color}20`, borderColor: config.color, color: config.color } : undefined;
 2259:     const actionLabel = actionMeta.willServe ? HALL_UI_TEXT.serve : config.isFirstStage ? HALL_UI_TEXT.accept : actionMeta.nextLabel || config.actionLabel || '\u0414\u0430\u043B\u0435\u0435';
 2260:     return (
 2261:       <div key={order.id} className="rounded-lg border border-slate-200 bg-white px-3 py-3 space-y-2">
 2262:         <div className="flex items-center justify-between gap-3">
 2263:           <div className="min-w-0">
 2264:             <div className="truncate text-sm font-medium text-slate-900">{guestName(order)}</div>
 2265:             <div className="text-xs text-slate-400">{formatClockTime(order.created_date)}</div>
 2266:           </div>
 2267:           <Badge variant="outline" className={`text-[10px] ${config.badgeClass || ""}`} style={badgeStyle}>{config.label}</Badge>
 2268:         </div>
 2269:         <div className="space-y-1">
 2270:           {orderItems.length > 0 ? orderItems.map((item, index) => <div key={item.id || index} className="text-xs text-slate-600">{`${item.dish_name} \u00D7${item.quantity || 1}`}</div>) : <div className="text-xs text-slate-400">{HALL_UI_TEXT.loading}</div>}
 2271:         </div>
 2272:         <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-100">
 2273:           {order.order_number ? <span className="text-[10px] text-slate-400">{order.order_number}</span> : <span />}
 2274:           {buildAdvancePayload(order) && <button type="button" onClick={() => handleSingleAction(order)} disabled={advanceMutation.isPending || batchInFlight} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 min-h-[36px] active:scale-[0.98] disabled:opacity-60">{advanceMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : actionLabel}</button>}
 2275:         </div>
 2276:       </div>
 2277:     );
 2278:   }, [advanceMutation.isPending, buildAdvancePayload, getOrderActionMeta, getStatusConfig, guestName, handleSingleAction, itemsByOrder]);
 2279: 
 2280:   const highlightRing = isHighlighted ? "ring-2 ring-indigo-400 ring-offset-1" : "";
 2281: 
 2282:   return (
 2283:     <div data-group-id={group.id} className={`mb-3 rounded-lg border border-slate-200 overflow-hidden transition-all duration-300 ${style.bgClass} ${style.borderClass} ${highlightRing}`}>
 2284:       <div className="px-4 pt-3 pb-3 cursor-pointer active:opacity-80" onClick={onToggleExpand} role="button" aria-expanded={isExpanded} aria-label={group.type === "table" ? identifier : `${identifier}: ${statusLabel}`}>
 2285:         {group.type === "table" ? (
 2286:           <div>
 2287:             <div style={{display:'flex', alignItems:'center', gap:'10px', minHeight:'72px'}}>
 2288:               <div style={{position:'relative', flexShrink:0, width:'84px', display:'flex', alignItems:'center', justifyContent:'flex-end'}}>
 2289:                 {ownershipState === "mine" && (
 2290:                   <div style={{position:'absolute', top:'-7px', left:'-7px', width:'26px', height:'26px', borderRadius:'50%', background:'#FFF8E7', border:'1.5px solid #FFD60A50', boxShadow:'0 1px 4px rgba(0,0,0,0.13)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'13px', zIndex:2}} aria-label={"\u041C\u043E\u0439 \u0441\u0442\u043E\u043B"} onClick={(e) => e.stopPropagation()}>
 2291:                     {'\u2605'}
 2292:                   </div>
 2293:                 )}
 2294:                 {ownershipState === "other" && (
 2295:                   <button type="button" onClick={(e) => { e.stopPropagation(); showOtherTableHint(e); }} aria-label={HALL_UI_TEXT.otherTableTitle} style={{position:'absolute', top:'-7px', left:'-7px', width:'26px', height:'26px', borderRadius:'50%', background:'#f2f2f7', border:'1.5px solid #d1d1d6', boxShadow:'0 1px 4px rgba(0,0,0,0.13)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'13px', zIndex:2, cursor:'pointer', padding:0}}>
 2296:                     {'\uD83D\uDD12'}
 2297:                   </button>
 2298:                 )}
 2299:                 {ownershipState === "free" && (
 2300:                   <div style={{position:'absolute', top:'-7px', left:'-7px', width:'26px', height:'26px', borderRadius:'50%', background:'#EAF7EE', border:'1.5px solid #34c75940', boxShadow:'0 1px 4px rgba(0,0,0,0.13)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'13px', zIndex:2}} aria-label={"\u0421\u0432\u043E\u0431\u043E\u0434\u043D\u044B\u0439 \u0441\u0442\u043E\u043B"} onClick={(e) => e.stopPropagation()}>
 2301:                     {'\u2606'}
 2302:                   </div>
 2303:                 )}
 2304:                 <div style={{width:'78px', height:'54px', borderRadius:'12px', display:'flex', alignItems:'center', justifyContent:'center', ...URGENCY_IDENTITY_STYLE[scsUrgency], ...(ownershipState === 'free' ? {outline:'2.5px solid #34c75980', outlineOffset:'3px'} : {})}}>
 2305:                   <span style={{fontSize:'26px', fontWeight:700, color:'#1c1c1e', fontVariantNumeric:'tabular-nums'}}>{compactTableLabel}</span>
 2306:                 </div>
 2307:               </div>
 2308:               <div style={{flex:1, display:'flex', flexWrap:'wrap', gap:'6px', minWidth:0, alignContent:'center'}}>
 2309:                 {scsChips.length > 0 ? scsChips.map(chip => {
 2310:                   const isHighlight = chip.key === scsHighlightKey;
 2311:                   const chipStyle = isHighlight ? SCS_SOLID_CHIP[chip.tone] : SCS_CHIP_STYLES[chip.tone];
 2312:                   const text = chip.isActionable
 2313:                     ? `${chip.label} ${chip.count} \u00B7 ${formatCompactMinutes(chip.ageMin)}`
 2314:                     : `${chip.label} ${chip.count}`;
 2315:                   return (
 2316:                     <span key={chip.key} style={{height:'26px', padding:'0 9px', borderRadius:'13px', fontSize:'13px', fontWeight:600, whiteSpace:'nowrap', display:'inline-flex', alignItems:'center', ...chipStyle}}>{text}</span>
 2317:                   );
 2318:                 }) : (
 2319:                   <span className="text-xs text-slate-400">{HALL_UI_TEXT.noActions}</span>
 2320:                 )}
 2321:               </div>
 2322:               {isExpanded && <span className="text-xs font-semibold text-slate-500 shrink-0 self-start">{HALL_UI_TEXT.collapse}</span>}
 2323:             </div>
 2324:             {ownerHintVisible && (
 2325:               <div className="rounded-lg bg-slate-900 px-3 py-2 text-white mt-2">
 2326:                 <div className="text-xs font-semibold">{HALL_UI_TEXT.otherTableTitle}</div>
 2327:                 <div className="text-[11px] text-slate-200">{HALL_UI_TEXT.otherTableHint}</div>
 2328:               </div>
 2329:             )}
 2330:           </div>
 2331:         ) : (
 2332:           <React.Fragment>
 2333:             <div className="flex items-start justify-between gap-2 mb-1">
 2334:               <span className="font-bold text-base leading-tight flex-1 min-w-0 text-slate-900 truncate">{identifier}</span>
 2335:               <span className={`text-xs font-medium shrink-0 flex items-center gap-0.5 ${isOverdue ? "text-red-600" : "text-slate-500"}`}><Clock className={`w-3 h-3 ${isOverdue ? "text-red-500" : ""}`} />{elapsedLabel}</span>
 2336:             </div>
 2337:             <div className="flex items-center gap-1.5 mb-1 flex-wrap">
 2338:               <span className="flex items-center gap-1 text-xs text-slate-500"><ChannelIcon className="w-3.5 h-3.5" />{channelConfig.label}</span>
 2339:               <span className="text-slate-300">{'\u00B7'}</span>
 2340:               <span className={`text-xs font-semibold ${style.textClass || "text-slate-700"}`}>{statusLabel}</span>
 2341:               {(newOrders.length > 0 || readyOrders.length > 0) && <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />}
 2342:               {contactInfo && (contactInfo.name || contactInfo.phone) && (
 2343:                 <React.Fragment>
 2344:                   <span className="text-xs text-slate-500 ml-auto truncate max-w-[120px]">{contactInfo.name || ""}</span>
 2345:                   {contactInfo.phone && <a href={`tel:${contactInfo.phone}`} onClick={(event) => event.stopPropagation()} className="text-xs text-blue-600 shrink-0">+7{'\u2026'}{contactInfo.phone.slice(-4)}</a>}
 2346:                 </React.Fragment>
 2347:               )}
 2348:             </div>
 2349:             {legacySummaryLines.length > 0 ? <div className="space-y-0.5 mt-0.5">{legacySummaryLines.map((line) => <div key={line.key} className="text-xs text-slate-700 flex items-center gap-1 leading-snug"><span className="font-medium">{`${line.count} ${line.label}`}</span><span className="text-slate-300">{'\u00B7'}</span><span>{`${line.ageMin} \u043C\u0438\u043D`}</span></div>)}</div> : <div className="text-xs text-slate-400">{'\u041D\u0435\u0442 \u0430\u043A\u0442\u0438\u0432\u043D\u044B\u0445 \u0437\u0430\u043A\u0430\u0437\u043E\u0432'}</div>}
 2350:           </React.Fragment>
 2351:         )}
 2352:       </div>
 2353: 
 2354:       <div className={`overflow-hidden transition-all duration-200 ease-out ${isExpanded ? "max-h-[3000px] opacity-100" : "max-h-0 opacity-0"}`}>
 2355:         <div className="border-t border-slate-200 px-4 py-3 space-y-4">
 2356:           {group.type === "table" ? (
 2357:             <React.Fragment>
 2358:               {jumpChips.length > 0 && (
 2359:                 <div className="flex flex-wrap items-center gap-1.5 pb-3">
 2360:                   {jumpChips.map(chip => (
 2361:                     <button key={chip.kind} type="button"
 2362:                       onClick={(e) => { e.stopPropagation(); scrollToSection(chip.kind); }}
 2363:                       className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold border min-h-[32px] ${HALL_CHIP_STYLES[chip.tone]}`}>
 2364:                       {`${chip.label} ${chip.count}`}
 2365:                     </button>
 2366:                   ))}
 2367:                 </div>
 2368:               )}
 2369:               {tableRequests.length > 0 && <div ref={requestsSectionRef}><div className="mb-2 flex items-center justify-between gap-3"><div className="text-[11px] font-bold uppercase tracking-wider text-violet-600"><span className="bg-violet-50 rounded-md px-2 py-0.5">{`${HALL_UI_TEXT.requests} (${tableRequests.length})`}</span></div><ChevronDown className="w-4 h-4 text-slate-400" /></div><div className="space-y-1.5">{tableRequests.map((request) => { const ageMin = getAgeMinutes(request.created_date); const label = REQUEST_TYPE_LABELS[request.request_type] || request.request_type; const isAccepted = request.status === 'accepted'; const isAssignedToMe = request.assignee === effectiveUserId; return <div key={request.id} className="rounded-lg border border-violet-200 bg-violet-50/80 px-3 py-2"><div className="flex items-center gap-3"><div className="min-w-0 flex-1"><div className="flex items-center gap-2 min-w-0"><span className="truncate text-sm font-medium text-slate-900">{label}</span><span className="text-xs text-violet-500 shrink-0">{formatCompactMinutes(ageMin)}</span>{isAccepted && isAssignedToMe && staffName && <span className="shrink-0 rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-medium text-blue-700">{staffName}</span>}</div>{request.comment && <div className="mt-0.5 text-xs text-slate-500 truncate">{request.comment}</div>}</div>{onCloseRequest && (isAccepted ? <button type="button" onClick={() => onCloseRequest(request.id, "done")} disabled={isRequestPending} className="shrink-0 rounded-lg border border-green-200 bg-white px-3 py-2 text-xs font-semibold text-green-700 min-h-[36px] active:scale-[0.98] disabled:opacity-60">{HALL_UI_TEXT.serveRequest}</button> : <button type="button" onClick={() => onCloseRequest(request.id, "accepted", { assignee: effectiveUserId, assigned_at: new Date().toISOString() })} disabled={isRequestPending} className="shrink-0 rounded-lg border border-blue-200 bg-white px-3 py-2 text-xs font-semibold text-blue-700 min-h-[36px] active:scale-[0.98] disabled:opacity-60">{HALL_UI_TEXT.acceptRequest}</button>)}</div></div>; })}</div>{tableRequests.length > 0 && (() => { const allNew = tableRequests.every(r => !r.status || r.status === 'new' || r.status === 'open'); const allAccepted = tableRequests.every(r => r.status === 'accepted'); if (!allNew && !allAccepted) return null; return <div className="border-t border-red-100 pt-2 mt-2"><button type="button" onClick={async () => { if (allNew) { await runBatchSequential(tableRequests, (r) => onBatchCloseRequestAsync(r.id, 'accepted', { assignee: effectiveUserId, assigned_at: new Date().toISOString() })); } else { await runBatchSequential(tableRequests, (r) => onBatchCloseRequestAsync(r.id, 'done')); } queryClient.invalidateQueries({ queryKey: ["serviceRequests"] }); }} disabled={isRequestPending} className="w-full rounded-lg bg-red-500 text-white px-4 py-2.5 text-sm font-semibold min-h-[44px] active:scale-[0.99] disabled:opacity-60">{allNew ? `${HALL_UI_TEXT.acceptAllRequests} (${tableRequests.length})` : `${HALL_UI_TEXT.serveAllRequests} (${tableRequests.length})`}</button></div>; })()}</div>}
 2370: 
 2371:               {newOrders.length > 0 && <div ref={newSectionRef}><div className="flex items-center justify-between gap-3 mb-2"><div className="text-[11px] font-bold uppercase tracking-wider text-blue-600"><span className="bg-blue-50 rounded-md px-2 py-0.5">{`${HALL_UI_TEXT.new} (${uniqueGuests(newOrders)} ${pluralRu(uniqueGuests(newOrders), "\u0433\u043E\u0441\u0442\u044C", "\u0433\u043E\u0441\u0442\u044F", "\u0433\u043E\u0441\u0442\u0435\u0439")} \u00B7 ${countRows(newRows, newOrders.length)} ${pluralRu(countRows(newRows, newOrders.length), "\u0431\u043B\u044E\u0434\u043E", "\u0431\u043B\u044E\u0434\u0430", "\u0431\u043B\u044E\u0434")})`}</span></div><ChevronDown className="w-4 h-4 text-slate-400" /></div>{renderHallRows(newRows, "blue")}<div className="border-t border-blue-100 pt-2 mt-2"><button type="button" onClick={() => handleOrdersAction(newOrders)} disabled={advanceMutation.isPending || batchInFlight} className="w-full rounded-lg bg-blue-600 text-white px-4 py-2.5 text-sm font-semibold min-h-[44px] active:scale-[0.99] disabled:opacity-60">{getOrderActionMeta(newOrders[0]).willServe ? `${HALL_UI_TEXT.serveAll} (${countRows(newRows, newOrders.length)})` : `${HALL_UI_TEXT.acceptAll} (${countRows(newRows, newOrders.length)})`}</button></div></div>}
 2372: 
 2373:               {inProgressSections.map((section, idx) => { const isSubExpanded = !!expandedSubGroups[section.sid]; return <div key={section.sid} ref={idx === 0 ? inProgressSectionRef : undefined}><button type="button" onClick={() => setExpandedSubGroups(prev => ({ ...prev, [section.sid]: !prev[section.sid] }))} className="mb-2 flex w-full items-center justify-between text-left"><div className="flex items-center gap-2 opacity-60"><span className="text-[11px] font-bold uppercase tracking-wider text-amber-600">{section.label}</span><span className="text-[11px] text-slate-400">{`\u00B7 ${uniqueGuests(section.orders)} ${pluralRu(uniqueGuests(section.orders), "\u0433\u043E\u0441\u0442\u044C", "\u0433\u043E\u0441\u0442\u044F", "\u0433\u043E\u0441\u0442\u0435\u0439")} \u00B7 ${section.rowCount} ${pluralRu(section.rowCount, "\u0431\u043B\u044E\u0434\u043E", "\u0431\u043B\u044E\u0434\u0430", "\u0431\u043B\u044E\u0434")}`}</span></div><ChevronDown className={`w-4 h-4 text-slate-400 opacity-60 transition-transform ${isSubExpanded ? "rotate-180" : ""}`} /></button>{isSubExpanded && <div className="opacity-60">{renderHallRows(section.rows, "amber")}<div className="border-t border-amber-100 pt-2 mt-2"><button type="button" onClick={(e) => { e.stopPropagation(); handleOrdersAction(section.orders); }} disabled={advanceMutation.isPending || batchInFlight} className="w-full rounded-lg bg-amber-500 text-white px-4 py-2.5 text-sm font-semibold min-h-[44px] active:scale-[0.99] disabled:opacity-60">{`${section.bulkLabel} (${section.rowCount})`}</button></div></div>}</div>; })}
 2374: 
 2375:               {readyOrders.length > 0 && <div ref={readySectionRef}><div className="flex items-center justify-between gap-3 mb-2"><div className="text-[11px] font-bold uppercase tracking-wider text-green-600"><span className="bg-green-50 rounded-md px-2 py-0.5">{`${HALL_UI_TEXT.ready} (${uniqueGuests(readyOrders)} ${pluralRu(uniqueGuests(readyOrders), "\u0433\u043E\u0441\u0442\u044C", "\u0433\u043E\u0441\u0442\u044F", "\u0433\u043E\u0441\u0442\u0435\u0439")} \u00B7 ${countRows(readyRows, readyOrders.length)} ${pluralRu(countRows(readyRows, readyOrders.length), "\u0431\u043B\u044E\u0434\u043E", "\u0431\u043B\u044E\u0434\u0430", "\u0431\u043B\u044E\u0434")})`}</span></div><ChevronDown className="w-4 h-4 text-slate-400" /></div>{renderHallRows(readyRows, "green")}<div className="border-t border-green-100 pt-2 mt-2"><button type="button" onClick={() => handleOrdersAction(readyOrders)} disabled={advanceMutation.isPending || batchInFlight} className="w-full rounded-lg bg-green-600 text-white px-4 py-2.5 text-sm font-semibold min-h-[44px] active:scale-[0.99] disabled:opacity-60">{`${HALL_UI_TEXT.serveAll} (${countRows(readyRows, readyOrders.length)})`}</button></div></div>}
 2376: 
 2377:               {servedOrders.length > 0 && <div><button type="button" onClick={() => setServedExpanded((prev) => !prev)} className="mb-2 flex w-full items-center justify-between text-left"><span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 opacity-60">{`${HALL_UI_TEXT.served} (${uniqueGuests(servedOrders)} ${pluralRu(uniqueGuests(servedOrders), "\u0433\u043E\u0441\u0442\u044C", "\u0433\u043E\u0441\u0442\u044F", "\u0433\u043E\u0441\u0442\u0435\u0439")} \u00B7 ${countRows(servedRows, servedOrders.length)} ${pluralRu(countRows(servedRows, servedOrders.length), "\u0431\u043B\u044E\u0434\u043E", "\u0431\u043B\u044E\u0434\u0430", "\u0431\u043B\u044E\u0434")})`}</span><span className="text-xs font-medium text-slate-400">{servedExpanded ? HALL_UI_TEXT.hide : HALL_UI_TEXT.show}</span></button>{servedExpanded && <div className="opacity-60">{renderHallRows(servedRows, "slate", true)}</div>}</div>}
 2378: 
 2379:               {billData && billData.total > 0 && <div className={`rounded-xl border p-3 ${hasBillRequest ? "border-violet-300 bg-violet-50/80" : "border-slate-200 bg-slate-50"}`}><button type="button" onClick={() => setBillExpanded((prev) => !prev)} className="flex w-full items-start justify-between gap-3 text-left"><div className="min-w-0 flex-1"><div className="text-[11px] font-bold uppercase tracking-wider text-slate-600">{HALL_UI_TEXT.bill}</div><div className="mt-1 text-sm font-semibold text-slate-900">{`${HALL_UI_TEXT.total} ${formatHallMoney(billData.total)}`}</div>{!billExpanded && billData.remaining < billData.total && <div className="mt-1 text-xs text-slate-500">{`${HALL_UI_TEXT.remaining} ${formatHallMoney(billData.remaining)}`}</div>}</div>{billExpanded ? <ChevronUp className="w-4 h-4 text-slate-400 mt-1" /> : <ChevronDown className="w-4 h-4 text-slate-400 mt-1" />}</button>{billExpanded && <div className="mt-3 space-y-2 border-t border-slate-200 pt-3">{billData.guests.map((guest, index) => <div key={`${guest.id}:${index}`} className="flex items-center justify-between gap-3 text-sm"><span className="text-slate-600">{guest.name}</span><span className="font-medium text-slate-900">{formatHallMoney(guest.total)}</span></div>)}<div className="border-t border-slate-200 pt-2 space-y-1 text-sm"><div className="flex items-center justify-between gap-3"><span className="text-slate-500">{HALL_UI_TEXT.paid}</span><span className="font-medium text-slate-700">{formatHallMoney(billData.paid)}</span></div><div className="flex items-center justify-between gap-3 font-semibold text-slate-900"><span>{HALL_UI_TEXT.remaining}</span><span>{formatHallMoney(billData.remaining)}</span></div></div></div>}</div>}
 2380: 
 2381:               {onCloseTable && group.orders.length > 0 && <div className="pt-2 border-t border-slate-200"><button type="button" onClick={handleCloseTableClick} disabled={!!closeDisabledReason} className={`w-full min-h-[44px] flex items-center justify-center gap-2 font-medium text-sm rounded-lg border transition-all active:scale-[0.99] ${closeDisabledReason ? "bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed" : "bg-red-50 text-red-600 border-red-200 hover:bg-red-100"}`}><X className="w-4 h-4" />{HALL_UI_TEXT.closeTable}</button>{closeDisabledReasons.length > 0 && <p className="mt-1.5 text-[11px] text-slate-400 text-center leading-relaxed">{`${HALL_UI_TEXT.closeHint} `}{closeDisabledReasons.map((reason, i) => { const kind = reasonToKind[reason]; const countMap = { requests: `${tableRequests.length} \u0437\u0430\u043F\u0440.`, new: `${newOrders.length} \u043D\u043E\u0432.`, inProgress: `${inProgressOrders.length} \u0432 \u0440\u0430\u0431\u043E\u0442\u0435`, ready: `${readyOrders.length} \u0433\u043E\u0442.` }; const actionMap = { requests: HALL_UI_TEXT.closeActionRequests, new: HALL_UI_TEXT.closeActionNew, inProgress: HALL_UI_TEXT.closeActionInProgress, ready: HALL_UI_TEXT.closeActionReady }; const actionText = actionMap[kind] ? `${actionMap[kind]} ${countMap[kind] || ""}` : reason; return <React.Fragment key={kind || i}>{i > 0 && <span> · </span>}<button type="button" onClick={() => scrollToSection(kind)} className="text-red-500 font-medium active:text-red-700">{`\u2192 ${actionText}`}</button></React.Fragment>; })}</p>}</div>}
 2382:             </React.Fragment>
 2383:           ) : (
 2384:             <React.Fragment>
 2385:               {newOrders.length > 0 && <div><div className="flex items-center justify-between mb-2"><p className="text-[11px] font-bold text-blue-600 uppercase tracking-wider"><span className="bg-blue-50 rounded-md px-2 py-0.5">{`\u041D\u043E\u0432\u044B\u0435 (${newOrders.length})`}</span></p><button type="button" onClick={() => handleOrdersAction(newOrders)} disabled={advanceMutation.isPending || batchInFlight} className="text-xs font-semibold text-blue-600 bg-blue-50 border border-blue-200 px-3 py-1 rounded min-h-[44px] active:scale-95 disabled:opacity-60">{'\u041F\u0440\u0438\u043D\u044F\u0442\u044C \u0432\u0441\u0435'}</button></div><div className="space-y-2">{newOrders.map(renderLegacyOrderCard)}</div></div>}
 2386:               {inProgressOrders.length > 0 && <div><div className="flex items-center justify-between mb-2 cursor-pointer min-h-[44px]" onClick={() => setInProgressExpanded((prev) => !prev)}><p className="text-[11px] font-bold text-amber-400 uppercase tracking-wider opacity-60">{`\u0412 \u0440\u0430\u0431\u043E\u0442\u0435 (${inProgressOrders.length})`}</p><ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${inProgressExpanded ? "rotate-180" : ""}`} /></div>{inProgressExpanded && <div className="space-y-3">{subGroups.map(({ sid, orders, cfg }) => { const isSubExpanded = !!expandedSubGroups[sid]; const actionMeta = getOrderActionMeta(orders[0]); const subGroupLabel = sid === "__null__" ? '\u0412 \u0420\u0410\u0411\u041E\u0422\u0415' : cfg.label; if (subGroups.length === 1) return <div key={sid} className="space-y-2">{orders.map(renderLegacyOrderCard)}</div>; return <div key={sid}><div className="flex items-center justify-between mb-1.5 cursor-pointer min-h-[44px]" onClick={() => setExpandedSubGroups((prev) => ({ ...prev, [sid]: !prev[sid] }))}><div className="flex items-center gap-2"><ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${isSubExpanded ? "rotate-180" : ""}`} /><span className="text-[11px] font-bold text-amber-600 uppercase tracking-wider">{`${subGroupLabel} (${orders.length})`}</span></div><button type="button" onClick={(event) => { event.stopPropagation(); handleOrdersAction(orders); }} disabled={advanceMutation.isPending || batchInFlight} className="text-xs font-semibold text-amber-600 bg-amber-50 border border-amber-200 px-3 py-1 rounded min-h-[36px] active:scale-95 disabled:opacity-60">{actionMeta.bulkLabel}</button></div>{isSubExpanded && <div className="space-y-2">{orders.map(renderLegacyOrderCard)}</div>}</div>; })}</div>}</div>}
 2387:               {readyOrders.length > 0 && <div><div className="flex items-center justify-between mb-2"><p className="text-[11px] font-bold text-green-600 uppercase tracking-wider"><span className="bg-green-50 rounded-md px-2 py-0.5">{`\u0413\u043E\u0442\u043E\u0432\u043E \u043A \u0432\u044B\u0434\u0430\u0447\u0435 (${readyOrders.length})`}</span></p><button type="button" onClick={() => handleOrdersAction(readyOrders)} disabled={advanceMutation.isPending || batchInFlight} className="text-xs font-semibold text-green-600 bg-green-50 border border-green-200 px-3 py-1 rounded min-h-[44px] active:scale-95 disabled:opacity-60">{'\u0412\u044B\u0434\u0430\u0442\u044C \u0432\u0441\u0435'}</button></div><div className="space-y-2">{readyOrders.map(renderLegacyOrderCard)}</div></div>}
 2388:               {contactInfo && <div className="space-y-2 pt-2 border-t border-slate-200">{contactInfo.name && <div className="flex items-center gap-2 text-sm"><User className="w-4 h-4 text-slate-400" /><span className="text-slate-700">{contactInfo.name}</span></div>}{contactInfo.phone && <div className="flex items-center gap-2 text-sm"><Phone className="w-4 h-4 text-slate-400" /><a href={`tel:${contactInfo.phone}`} className="text-blue-600 underline">{contactInfo.phone}</a></div>}{contactInfo.address && <div className="flex items-center gap-2 text-sm"><MapPin className="w-4 h-4 text-slate-400" /><span className="text-slate-600">{contactInfo.address}</span></div>}</div>}
 2389:             </React.Fragment>
 2390:           )}
 2391:         </div>
 2392:       </div>
 2393:     </div>
 2394:   );
 2395: }
 2396: 
 2397: function MyTablesModal({ open, onClose, tables, favorites, onToggleFavorite, onClearAll }) {
 2398:   const [search, setSearch] = useState("");
 2399: 
 2400:   if (!open) return null;
 2401: 
 2402:   const filteredTables = tables.filter((t) => {
 2403:     if (!search.trim()) return true;
 2404:     const q = search.toLowerCase();
 2405:     return (t.name && t.name.toLowerCase().includes(q)) || (t.zone_name && t.zone_name.toLowerCase().includes(q));
 2406:   });
 2407: 
 2408:   const sortedTables = [...filteredTables].sort((a, b) => {
 2409:     const aId = getLinkId(a.id);
 2410:     const bId = getLinkId(b.id);
 2411:     const aFav = aId && favorites.includes(`table:${aId}`);
 2412:     const bFav = bId && favorites.includes(`table:${bId}`);
 2413:     if (aFav && !bFav) return -1;
 2414:     if (!aFav && bFav) return 1;
 2415:     return (a.name || "").localeCompare(b.name || "");
 2416:   });
 2417: 
 2418:   return (
 2419:     <div className="fixed inset-0 z-50">
 2420:       <button type="button" className="absolute inset-0 bg-black/40" onClick={onClose} aria-label="Закрыть" />
 2421:       <div className="absolute inset-x-0 bottom-0 max-h-[80vh] bg-white rounded-t-2xl shadow-xl flex flex-col">
 2422:         <div className="flex items-center justify-between p-4 border-b border-slate-200">
 2423:           <div className="flex items-center gap-2">
 2424:             <Star className="w-5 h-5 text-yellow-500 fill-yellow-400" />
 2425:             <span className="font-bold text-slate-900">Мои столы</span>
 2426:             <span className="text-sm text-slate-500">({favorites.length})</span>
 2427:           </div>
 2428:           <button type="button" onClick={onClose} className="p-2 -m-2 text-slate-400 hover:text-slate-600">
 2429:             <X className="w-5 h-5" />
 2430:           </button>
 2431:         </div>
 2432: 
 2433:         <div className="p-3 border-b border-slate-100">
 2434:           <div className="relative">
 2435:             <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
 2436:             <input
 2437:               type="text"
 2438:               placeholder="Поиск по номеру или зоне…"
 2439:               value={search}
 2440:               onChange={(e) => setSearch(e.target.value)}
 2441:               className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200"
 2442:             />
 2443:           </div>
 2444:         </div>
 2445: 
 2446:         <div className="flex-1 overflow-y-auto p-3 space-y-1">
 2447:           {sortedTables.length === 0 ? (
 2448:             <div className="text-center py-8 text-slate-400 text-sm">
 2449:               {search ? "Ничего не найдено" : "Нет столов"}
 2450:             </div>
 2451:           ) : (
 2452:             sortedTables.map((table) => {
 2453:               const tId = getLinkId(table.id);
 2454:               const isFav = tId && favorites.includes(`table:${tId}`);
 2455:               return (
 2456:                 <button
 2457:                   key={table.id}
 2458:                   type="button"
 2459:                   onClick={() => tId && onToggleFavorite('table', tId)}
 2460:                   className={`w-full flex items-center justify-between p-3 rounded-lg border transition-all ${
 2461:                     isFav ? "bg-yellow-50 border-yellow-200" : "bg-white border-slate-200 hover:border-slate-300"
 2462:                   }`}
 2463:                 >
 2464:                   <div className="flex items-center gap-3">
 2465:                     <Star className={`w-5 h-5 ${isFav ? "fill-yellow-400 text-yellow-400" : "text-slate-300"}`} />
 2466:                     <div className="text-left">
 2467:                       <div className="font-medium text-slate-900">Стол {table.name}</div>
 2468:                       {table.zone_name && <div className="text-xs text-slate-500">{table.zone_name}</div>}
 2469:                     </div>
 2470:                   </div>
 2471:                   {isFav && <span className="text-xs text-yellow-600 bg-yellow-100 px-2 py-0.5 rounded">Мой</span>}
 2472:                 </button>
 2473:               );
 2474:             })
 2475:           )}
 2476:         </div>
 2477: 
 2478:         {favorites.length > 0 && (
 2479:           <div className="p-3 border-t border-slate-200">
 2480:             <Button
 2481:               variant="outline"
 2482:               size="sm"
 2483:               onClick={onClearAll}
 2484:               className="w-full text-red-600 border-red-200 hover:bg-red-50"
 2485:             >
 2486:               <Trash2 className="w-4 h-4 mr-2" />
 2487:               Очистить мои столы ({favorites.length})
 2488:             </Button>
 2489:           </div>
 2490:         )}
 2491:       </div>
 2492:     </div>
 2493:   );
 2494: }
 2495: 
 2496: function ProfileSheet({ 
 2497:   open, 
 2498:   onClose, 
 2499:   staffName, 
 2500:   staffRole, 
 2501:   partnerName, 
 2502:   isKitchen,
 2503:   favoritesCount,
 2504:   onOpenMyTables,
 2505:   onLogout,
 2506: }) {
 2507:   const [helpExpanded, setHelpExpanded] = useState(false);
 2508: 
 2509:   if (!open) return null;
 2510: 
 2511:   const roleLabel = ROLE_LABELS[staffRole] || staffRole || "Сотрудник";
 2512: 
 2513:   const waiterHelpItems = [
 2514:     "«Мои» — заказы, которые вы взяли в работу",
 2515:     "«Свободные» — новые заказы, возьмите любой",
 2516:     "«Принять» — взять заказ себе",
 2517:     "«Выдать» — когда отдали заказ гостю",
 2518:     "⭐ — отметьте свои столы для быстрого доступа",
 2519:   ];
 2520: 
 2521:   const kitchenHelpItems = [
 2522:     "Здесь только заказы, переданные на кухню",
 2523:     "«Готово» — блюдо готово, официант заберёт",
 2524:     "Запросы гостей (счёт, салфетки) вам не показываются",
 2525:     "Заказы со статусом «Новый» вам не видны",
 2526:   ];
 2527: 
 2528:   const helpItems = isKitchen ? kitchenHelpItems : waiterHelpItems;
 2529: 
 2530:   return (
 2531:     <div className="fixed inset-0 z-50">
 2532:       <button type="button" className="absolute inset-0 bg-black/40" onClick={onClose} aria-label="Закрыть" />
 2533:       <div className="absolute inset-x-0 bottom-0 max-h-[85vh] bg-white rounded-t-2xl shadow-xl flex flex-col">
 2534:         {/* Header */}
 2535:         <div className="p-4 border-b border-slate-200">
 2536:           <div className="flex items-center justify-between mb-3">
 2537:             <div className="flex items-center gap-3">
 2538:               <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center">
 2539:                 <User className="w-6 h-6 text-indigo-600" />
 2540:               </div>
 2541:               <div>
 2542:                 <div className="font-bold text-lg text-slate-900">{staffName || "Сотрудник"}</div>
 2543:                 <div className="text-sm text-slate-500">
 2544:                   {roleLabel} · {partnerName || "Ресторан"}
 2545:                 </div>
 2546:               </div>
 2547:             </div>
 2548:             <button type="button" onClick={onClose} className="p-2 -m-2 text-slate-400 hover:text-slate-600">
 2549:               <X className="w-5 h-5" />
 2550:             </button>
 2551:           </div>
 2552:         </div>
 2553: 
 2554:         {/* Content */}
 2555:         <div className="flex-1 overflow-y-auto">
 2556:           {/* My Tables (only for non-kitchen) */}
 2557:           {!isKitchen && (
 2558:             <button
 2559:               type="button"
 2560:               onClick={() => {
 2561:                 onClose();
 2562:                 onOpenMyTables();
 2563:               }}
 2564:               className="w-full flex items-center justify-between p-4 border-b border-slate-100 hover:bg-slate-50 transition-colors"
 2565:             >
 2566:               <div className="flex items-center gap-3">
 2567:                 <Star className={`w-5 h-5 ${favoritesCount > 0 ? "fill-yellow-400 text-yellow-400" : "text-slate-400"}`} />
 2568:                 <span className="font-medium text-slate-900">Мои столы</span>
 2569:                 {favoritesCount > 0 && (
 2570:                   <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">
 2571:                     {favoritesCount}
 2572:                   </span>
 2573:                 )}
 2574:               </div>
 2575:               <ChevronRight className="w-5 h-5 text-slate-400" />
 2576:             </button>
 2577:           )}
 2578: 
 2579:           {/* Help Section */}
 2580:           <div className="border-b border-slate-100">
 2581:             <button
 2582:               type="button"
 2583:               onClick={() => setHelpExpanded(!helpExpanded)}
 2584:               className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors"
 2585:             >
 2586:               <div className="flex items-center gap-3">
 2587:                 <HelpCircle className="w-5 h-5 text-slate-400" />
 2588:                 <span className="font-medium text-slate-900">Как работать</span>
 2589:               </div>
 2590:               <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${helpExpanded ? "rotate-180" : ""}`} />
 2591:             </button>
 2592:             
 2593:             {helpExpanded && (
 2594:               <div className="px-4 pb-4">
 2595:                 <div className="bg-slate-50 rounded-lg p-3 space-y-2">
 2596:                   {helpItems.map((item, idx) => (
 2597:                     <div key={idx} className="flex items-start gap-2 text-sm text-slate-600">
 2598:                       <span className="text-slate-400 mt-0.5">•</span>
 2599:                       <span>{item}</span>
 2600:                     </div>
 2601:                   ))}
 2602:                 </div>
 2603:               </div>
 2604:             )}
 2605:           </div>
 2606:         </div>
 2607: 
 2608:         {/* Footer - Logout */}
 2609:         <div className="p-4 border-t border-slate-200">
 2610:           <Button
 2611:             variant="outline"
 2612:             onClick={onLogout}
 2613:             className="w-full text-red-600 border-red-200 hover:bg-red-50"
 2614:           >
 2615:             <LogOut className="w-4 h-4 mr-2" />
 2616:             Выйти
 2617:           </Button>
 2618:         </div>
 2619:       </div>
 2620:     </div>
 2621:   );
 2622: }
 2623: 
 2624: function SettingsPanel({ 
 2625:   open, 
 2626:   onClose, 
 2627:   pollingInterval, 
 2628:   onChangePollingInterval, 
 2629:   sortMode, 
 2630:   onChangeSortMode,
 2631:   selectedTypes,
 2632:   onToggleChannel,
 2633:   channelCounts,
 2634: }) {
 2635:   if (!open) return null;
 2636: 
 2637:   return (
 2638:     <div className="fixed inset-0 z-40">
 2639:       <button type="button" className="absolute inset-0 bg-black/30" onClick={onClose} aria-label="Закрыть" />
 2640:       <div className="absolute inset-x-0 bottom-0 max-h-[80vh] bg-white rounded-t-2xl shadow-xl flex flex-col">
 2641:         <div className="flex items-center justify-between p-4 border-b border-slate-200">
 2642:           <span className="font-bold text-slate-900">Настройки</span>
 2643:           <button type="button" onClick={onClose} className="p-2 -m-2 text-slate-400 hover:text-slate-600">
 2644:             <X className="w-5 h-5" />
 2645:           </button>
 2646:         </div>
 2647:         
 2648:         <div className="flex-1 overflow-y-auto p-4 space-y-5">
 2649:           {/* Channels */}
 2650:           <div className="space-y-2">
 2651:             <div className="text-sm font-medium text-slate-700">Каналы заказов</div>
 2652:             <div className="flex gap-2">
 2653:               <IconToggle 
 2654:                 icon={Utensils} 
 2655:                 label="Зал" 
 2656:                 count={channelCounts.hall} 
 2657:                 selected={selectedTypes.includes("hall")} 
 2658:                 onClick={() => onToggleChannel("hall")} 
 2659:                 tone="indigo" 
 2660:               />
 2661:               <IconToggle 
 2662:                 icon={ShoppingBag} 
 2663:                 label="Самовыв" 
 2664:                 count={channelCounts.pickup} 
 2665:                 selected={selectedTypes.includes("pickup")} 
 2666:                 onClick={() => onToggleChannel("pickup")} 
 2667:                 tone="fuchsia" 
 2668:               />
 2669:               <IconToggle 
 2670:                 icon={Truck} 
 2671:                 label="Доставка" 
 2672:                 count={channelCounts.delivery} 
 2673:                 selected={selectedTypes.includes("delivery")} 
 2674:                 onClick={() => onToggleChannel("delivery")} 
 2675:                 tone="teal" 
 2676:               />
 2677:             </div>
 2678:           </div>
 2679: 
 2680:           {/* Polling */}
 2681:           <div className="space-y-2">
 2682:             <div className="text-sm font-medium text-slate-700">Автообновление</div>
 2683:             <div className="grid grid-cols-5 gap-2">
 2684:               {POLLING_OPTIONS.map((opt) => (
 2685:                 <button
 2686:                   key={opt.value}
 2687:                   type="button"
 2688:                   onClick={() => onChangePollingInterval(opt.value)}
 2689:                   className={`py-2 px-1 text-sm rounded-lg border transition-all ${
 2690:                     pollingInterval === opt.value
 2691:                       ? "bg-indigo-600 text-white border-indigo-600"
 2692:                       : "bg-white text-slate-600 border-slate-200 hover:border-indigo-300"
 2693:                   }`}
 2694:                 >
 2695:                   {opt.label}
 2696:                 </button>
 2697:               ))}
 2698:             </div>
 2699:           </div>
 2700: 
 2701:           {/* Sort Mode */}
 2702:           <div className="space-y-2">
 2703:             <div className="text-sm font-medium text-slate-700">Сортировка</div>
 2704:             <div className="space-y-2">
 2705:               <label 
 2706:                 className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
 2707:                   sortMode === "priority" 
 2708:                     ? "bg-indigo-50 border-indigo-300 ring-1 ring-indigo-200" 
 2709:                     : "bg-white border-slate-200 hover:border-slate-300"
 2710:                 }`}
 2711:                 onClick={() => onChangeSortMode("priority")}
 2712:               >
 2713:                 <input 
 2714:                   type="radio" 
 2715:                   name="sortMode" 
 2716:                   checked={sortMode === "priority"} 
 2717:                   onChange={() => onChangeSortMode("priority")}
 2718:                   className="mt-0.5"
 2719:                 />
 2720:                 <div>
 2721:                   <div className="text-sm font-medium text-slate-900">По приоритету</div>
 2722:                   <div className="text-[11px] text-slate-500 mt-0.5">
 2723:                     Готов → Новый → Готовится → Принят
 2724:                   </div>
 2725:                 </div>
 2726:               </label>
 2727:               
 2728:               <label 
 2729:                 className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
 2730:                   sortMode === "time" 
 2731:                     ? "bg-indigo-50 border-indigo-300 ring-1 ring-indigo-200" 
 2732:                     : "bg-white border-slate-200 hover:border-slate-300"
 2733:                 }`}
 2734:                 onClick={() => onChangeSortMode("time")}
 2735:               >
 2736:                 <input 
 2737:                   type="radio" 
 2738:                   name="sortMode" 
 2739:                   checked={sortMode === "time"} 
 2740:                   onChange={() => onChangeSortMode("time")}
 2741:                   className="mt-0.5"
 2742:                 />
 2743:                 <div>
 2744:                   <div className="text-sm font-medium text-slate-900">По времени</div>
 2745:                   <div className="text-[11px] text-slate-500 mt-0.5">
 2746:                     Используйте ↑↓ для переключения направления
 2747:                   </div>
 2748:                 </div>
 2749:               </label>
 2750:             </div>
 2751:           </div>
 2752:         </div>
 2753:       </div>
 2754:     </div>
 2755:   );
 2756: }
 2757: 
 2758: /* ═══════════════════════════════════════════════════════════════════════════
 2759:    SPRINT D: V2-09 Banner Notification Component
 2760: ═══════════════════════════════════════════════════════════════════════════ */
 2761: 
 2762: /**
 2763:  * BannerNotification — in-app overlay banner for new order events.
 2764:  * Fixed at top of viewport, z-60 (above sticky header z-20, detail view z-30, modals z-40).
 2765:  * Auto-hides after 5s. Swipe-up or tap X to dismiss. Tap body → navigate to relevant group.
 2766:  * Non-blocking: pointer-events only on the banner itself, not full-screen overlay.
 2767:  *
 2768:  * Props:
 2769:  *   banner: { id, text, groupId, count } | null
 2770:  *   onDismiss: () => void
 2771:  *   onNavigate: (groupId) => void
 2772:  */
 2773: function BannerNotification({ banner, onDismiss, onNavigate }) {
 2774:   const [visible, setVisible] = useState(false);
 2775:   const [dismissing, setDismissing] = useState(false);
 2776:   const touchStartY = useRef(null);
 2777:   const autoHideTimer = useRef(null);
 2778:   const dismissAnimTimer = useRef(null);
 2779: 
 2780:   // Clear all pending timers
 2781:   const clearTimers = useCallback(() => {
 2782:     if (autoHideTimer.current) { clearTimeout(autoHideTimer.current); autoHideTimer.current = null; }
 2783:     if (dismissAnimTimer.current) { clearTimeout(dismissAnimTimer.current); dismissAnimTimer.current = null; }
 2784:   }, []);
 2785: 
 2786:   // Animate in on mount / new banner
 2787:   useEffect(() => {
 2788:     if (!banner) {
 2789:       setVisible(false);
 2790:       setDismissing(false);
 2791:       return;
 2792:     }
 2793:     setDismissing(false);
 2794:     // Small delay to trigger CSS transition
 2795:     const raf = requestAnimationFrame(() => setVisible(true));
 2796:     // Auto-hide after 5s
 2797:     autoHideTimer.current = setTimeout(() => {
 2798:       setDismissing(true);
 2799:       dismissAnimTimer.current = setTimeout(() => onDismiss(), 300);
 2800:     }, 5000);
 2801:     return () => {
 2802:       cancelAnimationFrame(raf);
 2803:       clearTimers();
 2804:     };
 2805:   }, [banner?.id]);
 2806: 
 2807:   const handleDismiss = useCallback(() => {
 2808:     clearTimers();
 2809:     setDismissing(true);
 2810:     dismissAnimTimer.current = setTimeout(() => onDismiss(), 300);
 2811:   }, [onDismiss, clearTimers]);
 2812: 
 2813:   const handleTap = useCallback(() => {
 2814:     clearTimers();
 2815:     if (banner?.groupId) {
 2816:       onNavigate(banner.groupId);
 2817:     }
 2818:     setDismissing(true);
 2819:     dismissAnimTimer.current = setTimeout(() => onDismiss(), 200);
 2820:   }, [banner, onNavigate, onDismiss, clearTimers]);
 2821: 
 2822:   const handleTouchStart = useCallback((e) => {
 2823:     touchStartY.current = e.touches[0].clientY;
 2824:   }, []);
 2825: 
 2826:   const handleTouchEnd = useCallback((e) => {
 2827:     if (touchStartY.current === null) return;
 2828:     const deltaY = e.changedTouches[0].clientY - touchStartY.current;
 2829:     touchStartY.current = null;
 2830:     // Swipe up to dismiss (threshold: 30px)
 2831:     if (deltaY < -30) handleDismiss();
 2832:   }, [handleDismiss]);
 2833: 
 2834:   if (!banner) return null;
 2835: 
 2836:   const translateClass = visible && !dismissing
 2837:     ? 'translate-y-0 opacity-100'
 2838:     : '-translate-y-full opacity-0';
 2839: 
 2840:   return (
 2841:     <div
 2842:       className={`fixed top-0 left-0 right-0 z-[60] flex justify-center px-3 pt-2 transition-all duration-300 ease-out ${translateClass}`}
 2843:       style={{ pointerEvents: 'none' }}
 2844:     >
 2845:       <div
 2846:         className="w-full max-w-md bg-indigo-600 text-white rounded-xl shadow-lg px-4 py-3 flex items-center gap-3"
 2847:         style={{ pointerEvents: 'auto' }}
 2848:         onClick={handleTap}
 2849:         onTouchStart={handleTouchStart}
 2850:         onTouchEnd={handleTouchEnd}
 2851:         role="alert"
 2852:         aria-live="assertive"
 2853:       >
 2854:         <Bell className="w-5 h-5 shrink-0" />
 2855:         <span className="flex-1 text-sm font-medium leading-tight">{banner.text}</span>
 2856:         <button
 2857:           type="button"
 2858:           onClick={(e) => { e.stopPropagation(); handleDismiss(); }}
 2859:           className="shrink-0 w-7 h-7 flex items-center justify-center rounded-full bg-white/20 active:bg-white/30"
 2860:           aria-label="Закрыть"
 2861:         >
 2862:           <X className="w-4 h-4" />
 2863:         </button>
 2864:       </div>
 2865:     </div>
 2866:   );
 2867: }
 2868: 
 2869: /* ═══════════════════════════════════════════════════════════════════════════
 2870:    MAIN COMPONENT
 2871: ═══════════════════════════════════════════════════════════════════════════ */
 2872: 
 2873: export default function StaffOrdersMobile() {
 2874:   const queryClient = useQueryClient();
 2875:   const { t } = useI18n(); // BUG-S76-01/02: translate stage names
 2876: 
 2877:   const [urlParams] = useState(() => new URLSearchParams(window.location.search));
 2878:   const token = urlParams.get("token");
 2879:   const isTokenMode = !!token;
 2880: 
 2881:   const deviceId = useMemo(() => getOrCreateDeviceId(), []);
 2882:   const didBindRef = useRef(false);
 2883:   const didUpdateLastActiveRef = useRef(false);
 2884:   const didAutoBindRef = useRef(false);
 2885:   
 2886:   // P0-4: Ref to track loaded guest IDs (prevents re-fetching on each poll)
 2887:   const loadedGuestIdsRef = useRef(new Set());
 2888: 
 2889:   const [rateLimitHit, setRateLimitHit] = useState(false);
 2890: 
 2891:   const [toastMsg, setToastMsg] = useState(null);
 2892:   const toastTimerRef = useRef(null);
 2893:   const showToast = (msg) => {
 2894:     setToastMsg(msg);
 2895:     if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
 2896:     toastTimerRef.current = setTimeout(() => setToastMsg(null), 1400);
 2897:   };
 2898:   useEffect(() => () => toastTimerRef.current && clearTimeout(toastTimerRef.current), []);
 2899: 
 2900:   const [selectedTypes, setSelectedTypes] = useState(() => [...ALL_CHANNELS]);
 2901:   const [assignFilters, setAssignFilters] = useState(() => [...ALL_ASSIGN_FILTERS]);
 2902:   
 2903:   const [sortMode, setSortMode] = useState(() => loadSortMode());
 2904:   const [sortOrder, setSortOrder] = useState(() => loadSortOrder());
 2905:   
 2906:   const [manualRefreshTs, setManualRefreshTs] = useState(null);
 2907:   const [pollingInterval, setPollingInterval] = useState(() => loadPollingInterval());
 2908:   const [settingsOpen, setSettingsOpen] = useState(false);
 2909:   const [profileOpen, setProfileOpen] = useState(false);
 2910: 
 2911:   // D1-005: State for batch-loaded guests
 2912:   const [guestsMap, setGuestsMap] = useState({});
 2913: 
 2914:   const handleChangePollingInterval = (val) => {
 2915:     setPollingInterval(val);
 2916:     savePollingInterval(val);
 2917:     showToast(val === 0 ? "Ручное обновление" : `Авто ${val / 1000}с`);
 2918:   };
 2919: 
 2920:   const handleChangeSortMode = (mode) => {
 2921:     setSortMode(mode);
 2922:     saveSortMode(mode);
 2923:     showToast(mode === "priority" ? "По приоритету" : "По времени");
 2924:   };
 2925: 
 2926:   const toggleSortOrder = () => {
 2927:     setSortOrder((prev) => {
 2928:       const next = prev === "newest" ? "oldest" : "newest";
 2929:       saveSortOrder(next);
 2930:       showToast(next === "newest" ? "Сначала новые" : "Сначала старые");
 2931:       return next;
 2932:     });
 2933:   };
 2934: 
 2935:   const lastFilterChangeRef = useRef(0);
 2936: 
 2937:   const [notifPrefs, setNotifPrefs] = useState(() => loadNotifPrefs());
 2938:   const [notifDot, setNotifDot] = useState(false);
 2939:   const [notifOpen, setNotifOpen] = useState(false);
 2940:   
 2941:   const [notifiedOrderIds, setNotifiedOrderIds] = useState(() => new Set());
 2942: 
 2943:   // V2-09: Sprint D — Banner notification state
 2944:   const [bannerData, setBannerData] = useState(null);
 2945:   const bannerIdCounter = useRef(0);
 2946: 
 2947:   // v3.6.0: Close table confirmation dialog state
 2948:   const [closeTableConfirm, setCloseTableConfirm] = useState(null); // { sessionId, tableName } | null
 2949:   const [undoToast, setUndoToast] = useState(null); // lifted from OrderGroupCard — survives card unmount
 2950: 
 2951:   const updateNotifPrefs = (patch) => {
 2952:     setNotifPrefs((prev) => {
 2953:       const next = { ...prev, ...patch };
 2954:       saveNotifPrefs(next);
 2955:       return next;
 2956:     });
 2957:   };
 2958: 
 2959:   const audioRef = useRef(null);
 2960:   const audioUnlockedRef = useRef(false);
 2961:   useEffect(() => {
 2962:     audioRef.current = createBeep();
 2963:   }, []);
 2964:   const unlockAudio = async () => {
 2965:     if (audioUnlockedRef.current) return;
 2966:     audioUnlockedRef.current = true;
 2967:     if (audioRef.current?.resume) await audioRef.current.resume();
 2968:   };
 2969:   useEffect(() => {
 2970:     const h = () => {
 2971:       unlockAudio();
 2972:       window.removeEventListener("pointerdown", h);
 2973:     };
 2974:     window.addEventListener("pointerdown", h, { passive: true });
 2975:     return () => window.removeEventListener("pointerdown", h);
 2976:   }, []);
 2977: 
 2978:   // SESS-016: Auto-expire stale sessions (runs every 5 min while page is open)
 2979:   useEffect(() => {
 2980:     const cleanup = async () => {
 2981:       try {
 2982:         const result = await runSessionCleanup({ dryRun: false });
 2983:         if (result.expired > 0 || result.skipped_stale > 0 || result.errors.length > 0) {
 2984:           console.log('[SessionCleanup]', result);
 2985:         }
 2986:       } catch (err) {
 2987:         console.log('[SessionCleanup] error:', err.message);
 2988:       }
 2989:     };
 2990:     cleanup();
 2991:     const interval = setInterval(cleanup, 5 * 60 * 1000);
 2992:     return () => clearInterval(interval);
 2993:   }, []);
 2994: 
 2995:   const ownMutationRef = useRef(null);
 2996:   const trackOwnMutation = (orderId, nextStatus) => {
 2997:     ownMutationRef.current = { orderId, nextStatus, ts: Date.now() };
 2998:   };
 2999: 
 3000:   const { data: links, isLoading: loadingToken, error: linkError } = useQuery({
 3001:     queryKey: ["staffLink", token],
 3002:     queryFn: () => base44.entities.StaffAccessLink.filter({ token }),
 3003:     enabled: !!token,
 3004:     retry: shouldRetry,
 3005:   });
 3006: 
 3007:   useEffect(() => {
 3008:     if (linkError && isRateLimitError(linkError)) {
 3009:       queryClient.cancelQueries();
 3010:       setRateLimitHit(true);
 3011:     }
 3012:   }, [linkError]);
 3013: 
 3014:   const link = links?.[0];
 3015: 
 3016:   const { data: currentUser, isLoading: loadingUser, error: userError } = useQuery({
 3017:     queryKey: ["currentUser"],
 3018:     queryFn: () => base44.auth.me(),
 3019:     retry: shouldRetry,
 3020:     enabled: !isTokenMode || (!!link && CABINET_ACCESS_ROLES.includes(link.staff_role) && !link.invited_user && !!link.invite_email),
 3021:   });
 3022: 
 3023:   useEffect(() => {
 3024:     if (userError && isRateLimitError(userError)) {
 3025:       queryClient.cancelQueries();
 3026:       setRateLimitHit(true);
 3027:     }
 3028:   }, [userError]);
 3029: 
 3030:   // P0-5: Safe currentUserId with fallback chain
 3031:   const currentUserId = currentUser?.id ?? currentUser?._id ?? currentUser?.user_id ?? null;
 3032: 
 3033:   const effectiveUserId = useMemo(() => {
 3034:     if (isTokenMode && link?.id) return link.id;
 3035:     if (currentUserId) return currentUserId;
 3036:     return null;
 3037:   }, [isTokenMode, link?.id, currentUserId]);
 3038: 
 3039:   const userOrTokenId = useMemo(() => {
 3040:     if (isTokenMode && link?.id) return `token_${link.id}`;
 3041:     if (currentUserId) return `user_${currentUserId}`;
 3042:     // P0-5: Fallback to email for localStorage key if no id
 3043:     if (currentUser?.email) return `email_${currentUser.email}`;
 3044:     return "anon";
 3045:   }, [isTokenMode, link?.id, currentUserId, currentUser?.email]);
 3046: 
 3047:   const [favorites, setFavorites] = useState([]);
 3048:   const [myTablesOpen, setMyTablesOpen] = useState(false);
 3049:   const favoritesInitializedRef = useRef(false);
 3050: 
 3051:   // v2.7.0: Expanded groups state
 3052:   const [expandedGroups, setExpandedGroups] = useState(new Set());
 3053: 
 3054:   // v2.7.1: Tabs and favorites filter state
 3055:   const [activeTab, setActiveTab] = useState('active'); // 'active' | 'completed'
 3056:   const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);
 3057: 
 3058:   // v4.0.0: Expand/collapse — max 1 expanded card at a time
 3059:   const [expandedGroupId, setExpandedGroupId] = useState(null);
 3060: 
 3061:   useEffect(() => {
 3062:     if (favoritesInitializedRef.current) return;
 3063:     if (userOrTokenId === "anon") return;
 3064:     
 3065:     // v2.7.0: Helper to normalize favorites array with prefix migration
 3066:     const normalizeFavorites = (arr) => 
 3067:       (arr || []).map(item => {
 3068:         const id = getLinkId(item);
 3069:         if (!id) return null;
 3070:         if (!id.includes(':')) return `table:${id}`; // migrate old format
 3071:         return id;
 3072:       }).filter(Boolean);
 3073:     
 3074:     if (isTokenMode && link) {
 3075:       favoritesInitializedRef.current = true;
 3076:       if (Array.isArray(link.favorite_tables) && link.favorite_tables.length > 0) {
 3077:         setFavorites(normalizeFavorites(link.favorite_tables));
 3078:       } else {
 3079:         setFavorites(normalizeFavorites(loadMyTables(userOrTokenId)));
 3080:       }
 3081:     } else if (!isTokenMode && currentUser) {
 3082:       favoritesInitializedRef.current = true;
 3083:       setFavorites(normalizeFavorites(loadMyTables(userOrTokenId)));
 3084:     }
 3085:   }, [userOrTokenId, isTokenMode, link, currentUser]);
 3086: 
 3087:   const updateLinkMutation = useMutation({
 3088:     mutationFn: ({ id, payload }) => base44.entities.StaffAccessLink.update(id, payload),
 3089:     onSuccess: (_data, vars) => {
 3090:       const keys = Object.keys(vars?.payload || {});
 3091:       const needRefetch = keys.includes("bound_device_id") || 
 3092:                           keys.includes("is_active") ||
 3093:                           keys.includes("favorite_tables") ||
 3094:                           keys.includes("invited_user");
 3095:       if (needRefetch) {
 3096:         queryClient.invalidateQueries({ queryKey: ["staffLink", token] });
 3097:       }
 3098:     },
 3099:     onError: (err) => {
 3100:       if (isRateLimitError(err)) {
 3101:         queryClient.cancelQueries();
 3102:         setRateLimitHit(true);
 3103:       }
 3104:     },
 3105:   });
 3106: 
 3107:   // v2.7.0: Updated signature to (type, id)
 3108:   const toggleFavorite = useCallback((type, id) => {
 3109:     const normalizedId = getLinkId(id);
 3110:     if (!normalizedId) return;
 3111:     const key = `${type}:${normalizedId}`;
 3112:     
 3113:     setFavorites((prev) => {
 3114:       const next = prev.includes(key) ? prev.filter((x) => x !== key) : [...prev, key];
 3115:       
 3116:       saveMyTables(userOrTokenId, next);
 3117:       
 3118:       if (isTokenMode && link?.id) {
 3119:         updateLinkMutation.mutate({
 3120:           id: link.id,
 3121:           payload: { favorite_tables: next },
 3122:         });
 3123:       }
 3124:       
 3125:       return next;
 3126:     });
 3127:   }, [userOrTokenId, isTokenMode, link?.id, updateLinkMutation]);
 3128: 
 3129:   // v2.7.0: Helper to check if item is favorite
 3130:   const isFavorite = useCallback((type, id) => 
 3131:     favorites.includes(`${type}:${id}`), [favorites]);
 3132: 
 3133:   const clearAllFavorites = () => {
 3134:     setFavorites([]);
 3135:     saveMyTables(userOrTokenId, []);
 3136:     
 3137:     if (isTokenMode && link?.id) {
 3138:       updateLinkMutation.mutate({
 3139:         id: link.id,
 3140:         payload: { favorite_tables: [] },
 3141:       });
 3142:     }
 3143:     
 3144:     showToast("Столы очищены");
 3145:   };
 3146:   
 3147:   const clearNotified = (orderId) => {
 3148:     setNotifiedOrderIds((prev) => {
 3149:       const next = new Set(prev);
 3150:       next.delete(orderId);
 3151:       return next;
 3152:     });
 3153:   };
 3154: 
 3155:   const effectiveRole = isTokenMode ? link?.staff_role : currentUser?.user_role;
 3156:   const isKitchen = effectiveRole === "kitchen";
 3157:   const staffName = isTokenMode ? link?.staff_name : currentUser?.full_name;
 3158: 
 3159:   const tokenState = useMemo(() => {
 3160:     if (!isTokenMode) return "no_token";
 3161:     if (loadingToken) return "loading_link";
 3162:     if (!link || !link.is_active) return "inactive";
 3163:     const bound = String(link.bound_device_id || "").trim();
 3164:     if (!bound) return "bind_needed";
 3165:     if (bound !== deviceId) return "locked";
 3166:     return "ok";
 3167:   }, [isTokenMode, loadingToken, link, deviceId]);
 3168: 
 3169:   useEffect(() => {
 3170:     didBindRef.current = false;
 3171:   }, [token]);
 3172: 
 3173:   useEffect(() => {
 3174:     if (!isTokenMode || !link || tokenState !== "bind_needed" || didBindRef.current || rateLimitHit) return;
 3175:     didBindRef.current = true;
 3176:     updateLinkMutation.mutate({
 3177:       id: link.id,
 3178:       payload: { bound_device_id: deviceId, bound_at: new Date().toISOString(), last_used_at: new Date().toISOString() },
 3179:     });
 3180:   }, [isTokenMode, link?.id, tokenState, deviceId, rateLimitHit]);
 3181: 
 3182:   const linkIdRef = useRef(null);
 3183:   useEffect(() => {
 3184:     linkIdRef.current = link?.id || null;
 3185:   }, [link?.id]);
 3186: 
 3187:   useEffect(() => {
 3188:     if (!isTokenMode || tokenState !== "ok" || rateLimitHit) return;
 3189:     
 3190:     const tick = () => {
 3191:       const currentLinkId = linkIdRef.current;
 3192:       if (!currentLinkId) return;
 3193:       base44.entities.StaffAccessLink.update(currentLinkId, { 
 3194:         last_used_at: new Date().toISOString() 
 3195:       }).catch((err) => {
 3196:         if (isRateLimitError(err)) {
 3197:           queryClient.cancelQueries();
 3198:           setRateLimitHit(true);
 3199:         }
 3200:       });
 3201:     };
 3202:     
 3203:     const t = setInterval(tick, 60000);
 3204:     return () => clearInterval(t);
 3205:   }, [isTokenMode, tokenState, rateLimitHit, queryClient]);
 3206: 
 3207:   // Global undo handler — works after OrderGroupCard unmounts
 3208:   const handleUndoGlobal = () => {
 3209:     if (!undoToast) return;
 3210:     clearTimeout(undoToast.timerId);
 3211:     undoToast.onUndo();
 3212:     setUndoToast(null);
 3213:   };
 3214: 
 3215:   useEffect(() => {
 3216:     if (didUpdateLastActiveRef.current) return;
 3217:     if (!isTokenMode || !link?.id || tokenState !== "ok" || rateLimitHit) return;
 3218:     
 3219:     didUpdateLastActiveRef.current = true;
 3220:     
 3221:     base44.entities.StaffAccessLink.update(link.id, {
 3222:       last_active_at: new Date().toISOString()
 3223:     }).catch((err) => {
 3224:       if (isRateLimitError(err)) {
 3225:         queryClient.cancelQueries();
 3226:         setRateLimitHit(true);
 3227:       }
 3228:     });
 3229:   }, [isTokenMode, link?.id, tokenState, rateLimitHit, queryClient]);
 3230: 
 3231:   // P0: Авто-bind для директоров - P0-5: only if currentUserId exists
 3232:   useEffect(() => {
 3233:     if (!isTokenMode || !link || tokenState !== "ok" || rateLimitHit) return;
 3234:     if (!currentUserId || !currentUser?.email) return; // P0-5: check currentUserId, not currentUser?.id
 3235:     if (didAutoBindRef.current) return;
 3236:     
 3237:     if (!CABINET_ACCESS_ROLES.includes(link.staff_role)) return;
 3238:     if (link.invited_user) return;
 3239:     if (!link.invite_email) return;
 3240:     
 3241:     const userEmail = currentUser.email.toLowerCase().trim();
 3242:     const inviteEmail = link.invite_email.toLowerCase().trim();
 3243:     if (userEmail !== inviteEmail) return;
 3244:     
 3245:     didAutoBindRef.current = true;
 3246:     
 3247:     base44.entities.StaffAccessLink.update(link.id, {
 3248:       invited_user: currentUserId, // P0-5: use currentUserId, not currentUser.id
 3249:       invite_accepted_at: new Date().toISOString()
 3250:     }).then(() => {
 3251:       showToast("Доступ к кабинету активирован");
 3252:       queryClient.invalidateQueries({ queryKey: ["staffLink", token] });
 3253:     }).catch((err) => {
 3254:       if (isRateLimitError(err)) {
 3255:         queryClient.cancelQueries();
 3256:         setRateLimitHit(true);
 3257:       }
 3258:     });
 3259:   }, [isTokenMode, link, tokenState, currentUser, currentUserId, rateLimitHit, token, queryClient]);
 3260: 
 3261:   const handleLogout = () => {
 3262:     if (isTokenMode && link?.id) {
 3263:       updateLinkMutation.mutate({
 3264:         id: link.id,
 3265:         payload: { bound_device_id: null, bound_at: null },
 3266:       });
 3267:     }
 3268:     
 3269:     clearAllStaffData();
 3270:     showToast("Выход выполнен");
 3271:     setTimeout(() => {
 3272:       window.location.href = "/";
 3273:     }, 500);
 3274:   };
 3275: 
 3276:   const gateView = useMemo(() => {
 3277:     if (rateLimitHit) {
 3278:       return (
 3279:         <RateLimitScreen 
 3280:           onRetry={() => {
 3281:             setRateLimitHit(false);
 3282:             didBindRef.current = false;
 3283:             didUpdateLastActiveRef.current = false;
 3284:             didAutoBindRef.current = false;
 3285:             loadedGuestIdsRef.current = new Set(); // P0-4: reset loaded guests on retry
 3286:             queryClient.invalidateQueries();
 3287:           }} 
 3288:         />
 3289:       );
 3290:     }
 3291:     if (loadingToken || loadingUser) {
 3292:       return (
 3293:         <div className="min-h-screen flex items-center justify-center bg-slate-100">
 3294:           <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
 3295:         </div>
 3296:       );
 3297:     }
 3298:     if (isTokenMode) {
 3299:       if (tokenState === "locked") return <LockedScreen />;
 3300:       if (tokenState === "bind_needed" || updateLinkMutation.isPending) return <BindingScreen />;
 3301:       if (tokenState !== "ok") {
 3302:         return (
 3303:           <div className="min-h-screen flex items-center justify-center bg-slate-100 p-6">
 3304:             <Card className="p-6 text-center text-red-500">Ссылка недействительна.</Card>
 3305:           </div>
 3306:         );
 3307:       }
 3308:     }
 3309:     if (!token && !currentUser) {
 3310:       return (
 3311:         <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4 text-center">
 3312:           <div>
 3313:             <h1 className="text-xl font-bold text-slate-900 mb-2">Необходимо войти</h1>
 3314:             <p className="text-slate-500 text-sm">Доступ по приглашению или ссылке ресторана.</p>
 3315:           </div>
 3316:         </div>
 3317:       );
 3318:     }
 3319:     if (!token) {
 3320:       const role = currentUser?.user_role;
 3321:       const valid = ["admin", "partner_owner", "partner_manager", "partner_staff", "kitchen", "director", "managing_director"];
 3322:       if (!role || !valid.includes(role)) {
 3323:         return (
 3324:           <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4 text-center">
 3325:             <div>
 3326:               <h1 className="text-xl font-bold text-slate-900 mb-2">Нет доступа</h1>
 3327:               <p className="text-slate-500 text-sm">Роль не настроена.</p>
 3328:             </div>
 3329:           </div>
 3330:         );
 3331:       }
 3332:       if (["partner_staff", "kitchen", "partner_owner", "partner_manager", "director", "managing_director"].includes(role) && !currentUser.partner) {
 3333:         return (
 3334:           <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4 text-center">
 3335:             <div>
 3336:               <h1 className="text-xl font-bold text-slate-900 mb-2">Нет доступа</h1>
 3337:               <p className="text-slate-500 text-sm">Ресторан не выбран.</p>
 3338:             </div>
 3339:           </div>
 3340:         );
 3341:       }
 3342:     }
 3343:     return null;
 3344:   }, [loadingToken, token, loadingUser, isTokenMode, tokenState, updateLinkMutation.isPending, currentUser, rateLimitHit]);
 3345: 
 3346:   const partnerId = useMemo(() => {
 3347:     if (isTokenMode) return link?.partner || null;
 3348:     return currentUser?.partner || null;
 3349:   }, [isTokenMode, link?.partner, currentUser?.partner]);
 3350: 
 3351:   const canFetch = useMemo(() => {
 3352:     if (isTokenMode) return tokenState === "ok";
 3353:     return !!currentUser;
 3354:   }, [isTokenMode, tokenState, currentUser]);
 3355: 
 3356:   const { data: partnerData } = useQuery({
 3357:     queryKey: ["partner", partnerId],
 3358:     queryFn: () => base44.entities.Partner.filter({ id: partnerId }),
 3359:     enabled: canFetch && !!partnerId,
 3360:     retry: shouldRetry,
 3361:     select: (data) => data?.[0],
 3362:   });
 3363:   const partnerName = partnerData?.name || "Ресторан";
 3364: 
 3365:   const shiftStartTime = useMemo(() => {
 3366:     return getShiftStartTime(partnerData?.working_hours);
 3367:   }, [partnerData?.working_hours]);
 3368: 
 3369:   const { data: tables } = useQuery({
 3370:     queryKey: ["tables", partnerId],
 3371:     queryFn: () => (partnerId ? base44.entities.Table.filter({ partner: partnerId }) : base44.entities.Table.list()),
 3372:     enabled: canFetch,
 3373:     retry: shouldRetry,
 3374:   });
 3375:   const tableMap = useMemo(
 3376:     () => tables?.reduce((acc, t) => ({ ...acc, [t.id]: { name: t.name, zone_name: t.zone_name } }), {}) || {},
 3377:     [tables]
 3378:   );
 3379: 
 3380:   // ═══════════════════════════════════════════════════════════════════════════
 3381:   // P0-2: FIXED - removed .list() to be consistent with other .filter() calls
 3382:   // ═══════════════════════════════════════════════════════════════════════════
 3383:   const { data: orderStages = [], error: stagesError } = useQuery({
 3384:     queryKey: ["orderStages", partnerId],
 3385:     queryFn: () => base44.entities.OrderStage.filter({ 
 3386:       partner: partnerId, 
 3387:       is_active: true 
 3388:     }), // P0-2: removed .list()
 3389:     enabled: canFetch && !!partnerId && !rateLimitHit,
 3390:     staleTime: 60000, // 1 minute — stages rarely change
 3391:     retry: shouldRetry,
 3392:   });
 3393: 
 3394:   useEffect(() => {
 3395:     if (stagesError && isRateLimitError(stagesError)) {
 3396:       queryClient.cancelQueries();
 3397:       setRateLimitHit(true);
 3398:     }
 3399:   }, [stagesError]);
 3400: 
 3401:   // Sorted stages by sort_order
 3402:   const sortedStages = useMemo(() => {
 3403:     return [...orderStages].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
 3404:   }, [orderStages]);
 3405: 
 3406:   // Map for quick lookup by ID
 3407:   // Map for quick lookup by normalized ID
 3408:   const stagesMap = useMemo(() => {
 3409:     return orderStages.reduce((acc, stage) => {
 3410:       const normalizedId = getLinkId(stage.id);
 3411:       if (normalizedId) {
 3412:         acc[normalizedId] = stage;
 3413:       }
 3414:       return acc;
 3415:     }, {});
 3416:   }, [orderStages]);
 3417: 
 3418:   /**
 3419:    * Gets status configuration for an order (ORD-005, ORD-009)
 3420:    * Priority: stage_id → fallback to STATUS_FLOW
 3421:    * P0-1: Uses normalized stageId
 3422:    */
 3423:   const getStatusConfig = useCallback((order) => {
 3424:     // P0-1: Normalize stage_id before lookup
 3425:     const stageId = getLinkId(order.stage_id);
 3426:     
 3427:     // Priority 1: If stage_id exists and stage is found
 3428:     if (stageId && stagesMap[stageId]) {
 3429:       const stage = stagesMap[stageId];
 3430:       
 3431:       // Filter stages by order channel (ORD-001, ORD-003)
 3432:       const relevantStages = getStagesForOrder(order, sortedStages);
 3433:       
 3434:       // Find current stage index and next stage (normalize stage.id for comparison)
 3435:       const currentIndex = relevantStages.findIndex(s => getLinkId(s.id) === stageId);
 3436:       const nextStage = currentIndex >= 0 && currentIndex < relevantStages.length - 1
 3437:         ? relevantStages[currentIndex + 1]
 3438:         : null;
 3439:       
 3440:       // Determine if this is first or finish stage
 3441:       const isFirstStage = stage.internal_code === 'start' || currentIndex === 0;
 3442:       const isFinishStage = stage.internal_code === 'finish' || currentIndex === relevantStages.length - 1;
 3443:       const nextIsFinish = nextStage && (
 3444:         nextStage.internal_code === 'finish' ||
 3445:         (currentIndex + 1) === relevantStages.length - 1
 3446:       );
 3447:       const directServeFromStart = isFirstStage && nextIsFinish && relevantStages.length <= 2;
 3448: 
 3449:       return {
 3450:         label: getStageName(stage, t),
 3451:         color: stage.color,
 3452:         actionLabel: nextStage ? (nextIsFinish ? 'Выдать' : `→ ${getStageName(nextStage, t)}`) : null,
 3453:         nextStageId: nextStage?.id || null,
 3454:         derivedNextStatus: (() => {
 3455:           if (!nextStage) return null;
 3456:           const nextIsLast = currentIndex + 1 === relevantStages.length - 1;
 3457:           if (directServeFromStart) return 'served';
 3458:           if (isFirstStage) return 'accepted';
 3459:           if (nextIsLast) return 'served';
 3460:           return 'in_progress';
 3461:         })(),
 3462:         nextStatus: null, // don't use old status
 3463:         badgeClass: '', // will use inline style with color
 3464:         isStageMode: true,
 3465:         isFirstStage,
 3466:         isFinishStage,
 3467:       };
 3468:     }
 3469:     
 3470:     // Priority 2: Fallback to STATUS_FLOW
 3471:     const flow = STATUS_FLOW[order.status];
 3472:     return {
 3473:       label: flow?.label || STAGE_NAME_FALLBACKS[order.status] || order.status,
 3474:       color: null,
 3475:       actionLabel: flow?.actionLabel || null,
 3476:       nextStageId: null,
 3477:       nextStatus: flow?.nextStatus || null,
 3478:       badgeClass: flow?.badgeClass || "bg-slate-100",
 3479:       isStageMode: false,
 3480:       isFirstStage: order.status === 'new',
 3481:       isFinishStage: order.status === 'ready' || order.status === 'served',
 3482:     };
 3483:   }, [stagesMap, sortedStages, t]);
 3484: 
 3485:   const effectivePollingInterval = rateLimitHit ? false : (pollingInterval === 0 ? false : pollingInterval);
 3486: 
 3487:   const {
 3488:     data: orders,
 3489:     isLoading: loadingOrders,
 3490:     isError: ordersError,
 3491:     error: ordersErrorObj,
 3492:     refetch: refetchOrders,
 3493:     dataUpdatedAt: ordersUpdatedAt,
 3494:   } = useQuery({
 3495:     queryKey: ["orders", partnerId],
 3496:     queryFn: () => (partnerId ? base44.entities.Order.filter({ partner: partnerId }) : base44.entities.Order.list("-created_date", 1000)),
 3497:     enabled: canFetch && !rateLimitHit,
 3498:     refetchInterval: effectivePollingInterval,
 3499:     refetchIntervalInBackground: false,
 3500:     retry: shouldRetry,
 3501:   });
 3502: 
 3503:   useEffect(() => {
 3504:     if (ordersErrorObj && isRateLimitError(ordersErrorObj)) {
 3505:       queryClient.cancelQueries();
 3506:       setRateLimitHit(true);
 3507:     }
 3508:   }, [ordersErrorObj]);
 3509: 
 3510:   const {
 3511:     data: allRequests,
 3512:     isError: requestsError,
 3513:     error: requestsErrorObj,
 3514:     refetch: refetchRequests,
 3515:     dataUpdatedAt: requestsUpdatedAt,
 3516:   } = useQuery({
 3517:     queryKey: ["serviceRequests", partnerId],
 3518:     queryFn: () => (partnerId ? base44.entities.ServiceRequest.filter({ partner: partnerId }) : base44.entities.ServiceRequest.list()),
 3519:     enabled: canFetch && !isKitchen && !rateLimitHit,
 3520:     refetchInterval: effectivePollingInterval,
 3521:     refetchIntervalInBackground: false,
 3522:     retry: shouldRetry,
 3523:   });
 3524: 
 3525:   useEffect(() => {
 3526:     if (requestsErrorObj && isRateLimitError(requestsErrorObj)) {
 3527:       queryClient.cancelQueries();
 3528:       setRateLimitHit(true);
 3529:     }
 3530:   }, [requestsErrorObj]);
 3531: 
 3532:   const lastUpdatedAt = Math.max(ordersUpdatedAt || 0, requestsUpdatedAt || 0) || null;
 3533: 
 3534:   const activeRequests = useMemo(() => {
 3535:     if (!allRequests || isKitchen) return [];
 3536:     
 3537:     const shiftCutoff = shiftStartTime.getTime();
 3538:     
 3539:     return allRequests.filter((r) => {
 3540:       // SHIFT FILTER
 3541:       const createdAt = safeParseDate(r.created_date).getTime();
 3542:       if (createdAt < shiftCutoff) return false;
 3543:       
 3544:       // Existing status filter
 3545:       return !["done", "cancelled"].includes(r.status);
 3546:     });
 3547:   }, [allRequests, isKitchen, shiftStartTime]);
 3548: 
 3549:   const updateRequestMutation = useMutation({
 3550:     mutationFn: (payload) => { const { id, __batch, ...fields } = payload; return base44.entities.ServiceRequest.update(id, fields); },
 3551:     onSuccess: (_data, vars) => { if (vars?.__batch) return; queryClient.invalidateQueries({ queryKey: ["serviceRequests"] }); },
 3552:     onError: (err) => {
 3553:       if (isRateLimitError(err)) {
 3554:         queryClient.cancelQueries();
 3555:         setRateLimitHit(true);
 3556:       }
 3557:     },
 3558:   });
 3559: 
 3560:   // Filter orders by status (using both stage_id and status for hybrid support)
 3561:   // P0-1: Uses normalized stageId
 3562:   const activeOrders = useMemo(() => {
 3563:     if (!orders) return [];
 3564:     
 3565:     const shiftCutoff = shiftStartTime.getTime();
 3566:     
 3567:     return orders.filter((o) => {
 3568:       // P0-3: For hall orders, require table_session (filter out legacy/orphan orders)
 3569:       if (o.order_type === 'hall' && !getLinkId(o.table_session)) return false;
 3570: 
 3571:       // SHIFT FILTER: only orders created after shift start
 3572:       const createdAt = safeParseDate(o.created_date).getTime();
 3573:       if (createdAt < shiftCutoff) return false;
 3574: 
 3575:       // Existing status filter (unchanged)
 3576:       const stageId = getLinkId(o.stage_id);
 3577:       if (stageId && stagesMap[stageId]) {
 3578:         const stage = stagesMap[stageId];
 3579:         if (stage.internal_code === 'finish') {
 3580:           return o.status !== 'closed' && o.status !== 'cancelled';
 3581:         }
 3582:         return true;
 3583:       }
 3584:       return ["new", "accepted", "in_progress", "ready"].includes(o.status);
 3585:     });
 3586:   }, [orders, stagesMap, shiftStartTime]);
 3587: 
 3588:   // Kitchen filter: only see accepted, in_progress, ready (NOT new)
 3589:   // P0-1: Uses normalized stageId
 3590:   const roleFilteredOrders = useMemo(() => {
 3591:     if (!isKitchen) return activeOrders;
 3592:     return activeOrders.filter((o) => {
 3593:       // P0-1: Normalize stage_id
 3594:       const stageId = getLinkId(o.stage_id);
 3595:       
 3596:       // For stage mode: check if it's past the start stage
 3597:       if (stageId && stagesMap[stageId]) {
 3598:         const stage = stagesMap[stageId];
 3599:         return stage.internal_code !== 'start';
 3600:       }
 3601:       // Fallback: legacy status
 3602:       return ["accepted", "in_progress", "ready"].includes(o.status);
 3603:     });
 3604:   }, [activeOrders, isKitchen, stagesMap]);
 3605: 
 3606:   // P0-4.1: Reset guest cache when partnerId changes (prevents stale data across restaurants)
 3607:   useEffect(() => {
 3608:     loadedGuestIdsRef.current = new Set();
 3609:     setGuestsMap({});
 3610:   }, [partnerId]);
 3611: 
 3612:   // P0-4: Batch load guests with loadedGuestIdsRef to prevent re-fetching
 3613:   useEffect(() => {
 3614:     // Kitchen doesn't see guest badges — don't load guests
 3615:     if (isKitchen) return;
 3616:     
 3617:     async function loadGuestsBatch() {
 3618:       // Protect from undefined (orders may be undefined before loading)
 3619:       const list = roleFilteredOrders || [];
 3620:       
 3621:       // P0-4: Use ref to filter already-attempted IDs (not just guestsMap)
 3622:       const guestIds = [...new Set(
 3623:         list
 3624:           .map(o => getLinkId(o.guest))
 3625:           .filter(Boolean)
 3626:           .filter(id => !loadedGuestIdsRef.current.has(id)) // P0-4: check ref instead of guestsMap
 3627:       )];
 3628:       
 3629:       if (guestIds.length === 0) return;
 3630:       
 3631:       // P0-4: Mark as attempted BEFORE loading (prevents parallel duplicate requests)
 3632:       guestIds.forEach(id => loadedGuestIdsRef.current.add(id));
 3633:       
 3634:       try {
 3635:         // Load in parallel
 3636:         const guestPromises = guestIds.map(id => 
 3637:           base44.entities.SessionGuest.get(id).catch(() => null)
 3638:         );
 3639:         const guests = await Promise.all(guestPromises);
 3640:         
 3641:         // Single setState
 3642:         const newMap = {};
 3643:         guests.forEach((guest, idx) => {
 3644:           if (guest) newMap[guestIds[idx]] = guest;
 3645:         });
 3646:         
 3647:         if (Object.keys(newMap).length > 0) {
 3648:           setGuestsMap(prev => ({ ...prev, ...newMap }));
 3649:         }
 3650:       } catch (err) {
 3651:         console.error("Error loading guests batch:", err);
 3652:         // P0-4: On error, we keep IDs in ref to avoid retrying failed IDs repeatedly
 3653:       }
 3654:     }
 3655:     
 3656:     loadGuestsBatch();
 3657:   }, [roleFilteredOrders, isKitchen]); // P0-4: deps are correct now (loadedGuestIdsRef is ref, doesn't need to be in deps)
 3658: 
 3659:   const applyChannels = (list, types) => {
 3660:     const s = new Set(types);
 3661:     return list.filter((o) => s.has(o.order_type || "hall"));
 3662:   };
 3663: 
 3664:   const applyAssign = (list, filters, userId) => {
 3665:     const s = new Set(filters);
 3666:     return list.filter((o) => {
 3667:       const mine = isOrderMine(o, userId);
 3668:       const free = isOrderFree(o);
 3669:       const others = !mine && !free;
 3670:       return (mine && s.has("mine")) || (free && s.has("free")) || (others && s.has("others"));
 3671:     });
 3672:   };
 3673: 
 3674:   const channelCounts = useMemo(() => {
 3675:     const base = applyAssign(roleFilteredOrders, assignFilters, effectiveUserId);
 3676:     const c = { hall: 0, pickup: 0, delivery: 0 };
 3677:     base.forEach((o) => {
 3678:       const t = o.order_type || "hall";
 3679:       if (c[t] !== undefined) c[t]++;
 3680:     });
 3681:     return c;
 3682:   }, [roleFilteredOrders, assignFilters, effectiveUserId]);
 3683: 
 3684:   const assignCounts = useMemo(() => {
 3685:     const base = applyChannels(roleFilteredOrders, selectedTypes);
 3686:     let mine = 0, free = 0, others = 0;
 3687:     base.forEach((o) => {
 3688:       if (isOrderMine(o, effectiveUserId)) mine++;
 3689:       else if (isOrderFree(o)) free++;
 3690:       else others++;
 3691:     });
 3692:     return { mine, others, free };
 3693:   }, [roleFilteredOrders, selectedTypes, effectiveUserId]);
 3694: 
 3695:   // Updated statusRank to support stage mode - P0-1: uses normalized stageId
 3696:   const statusRank = (order) => {
 3697:     // P0-1: Normalize stage_id
 3698:     const stageId = getLinkId(order.stage_id);
 3699:     
 3700:     // If using stage mode
 3701:     if (stageId && stagesMap[stageId]) {
 3702:       const stage = stagesMap[stageId];
 3703:       // Ready/finish = highest priority (0)
 3704:       if (stage.internal_code === 'finish') return 0;
 3705:       // Start = second priority (1)
 3706:       if (stage.internal_code === 'start') return 1;
 3707:       // Middle stages by sort_order (2+)
 3708:       return 2 + (stage.sort_order || 0);
 3709:     }
 3710:     // Fallback: legacy status
 3711:     const s = order.status;
 3712:     return s === "ready" ? 0 : s === "new" ? 1 : s === "in_progress" ? 2 : s === "accepted" ? 3 : 9;
 3713:   };
 3714: 
 3715:   const visibleOrders = useMemo(() => {
 3716:     let r = applyChannels(roleFilteredOrders, selectedTypes);
 3717:     r = applyAssign(r, assignFilters, effectiveUserId);
 3718:     
 3719:     r.sort((a, b) => {
 3720:       if (sortMode === "priority") {
 3721:         const ra = statusRank(a), rb = statusRank(b);
 3722:         if (ra !== rb) return ra - rb;
 3723:         const ta = safeParseDate(a.created_date).getTime();
 3724:         const tb = safeParseDate(b.created_date).getTime();
 3725:         return ta - tb;
 3726:       } else {
 3727:         const ta = safeParseDate(a.created_date).getTime();
 3728:         const tb = safeParseDate(b.created_date).getTime();
 3729:         return sortOrder === "newest" ? tb - ta : ta - tb;
 3730:       }
 3731:     });
 3732:     
 3733:     return r;
 3734:   }, [roleFilteredOrders, selectedTypes, assignFilters, sortMode, sortOrder, effectiveUserId, stagesMap]);
 3735: 
 3736:   // v2.7.0: Order groups model (hall by table, pickup/delivery individual)
 3737:   const orderGroups = useMemo(() => {
 3738:     if (isKitchen) return null;
 3739:     
 3740:     const groups = [];
 3741:     const tableGroups = {};
 3742:     
 3743:     visibleOrders.forEach(o => {
 3744:       if (o.order_type === 'hall') {
 3745:         const tableId = getLinkId(o.table);
 3746:         if (!tableId) return;
 3747:         if (!tableGroups[tableId]) {
 3748:           const tableName = tableMap[tableId]?.name || '?';
 3749:           tableGroups[tableId] = {
 3750:             type: 'table',
 3751:             id: tableId,
 3752:             displayName: tableName,
 3753:             orders: [],
 3754:           };
 3755:           groups.push(tableGroups[tableId]);
 3756:         }
 3757:         tableGroups[tableId].orders.push(o);
 3758:       } else {
 3759:         groups.push({
 3760:           type: o.order_type,
 3761:           id: o.id,
 3762:           displayName: o.order_type === 'pickup' 
 3763:             ? `СВ-${o.order_number || o.id.slice(-3)}` 
 3764:             : `ДОС-${o.order_number || o.id.slice(-3)}`,
 3765:           orders: [o],
 3766:         });
 3767:       }
 3768:     });
 3769: 
 3770:     activeRequests.forEach((req) => {
 3771:       const tableId = getLinkId(req.table);
 3772:       if (!tableId) return;
 3773:       if (!tableGroups[tableId]) {
 3774:         const tableName = tableMap[tableId]?.name || '?';
 3775:         tableGroups[tableId] = {
 3776:           type: 'table',
 3777:           id: tableId,
 3778:           displayName: tableName,
 3779:           orders: [],
 3780:         };
 3781:         groups.push(tableGroups[tableId]);
 3782:       }
 3783:     });
 3784:     
 3785:     return groups;
 3786:   }, [visibleOrders, tableMap, isKitchen, activeRequests]);
 3787: 
 3788:   // v2.7.0: Sorted groups by oldest unaccepted order
 3789:   const sortedGroups = useMemo(() => {
 3790:     if (!orderGroups) return [];
 3791:     
 3792:     return [...orderGroups].sort((a, b) => {
 3793:       const getPriority = (group) => {
 3794:         const unaccepted = group.orders.filter(o => getStatusConfig(o).isFirstStage);
 3795:         if (unaccepted.length === 0) return Infinity;
 3796:         return Math.min(...unaccepted.map(o => safeParseDate(o.created_date).getTime()));
 3797:       };
 3798:       return getPriority(a) - getPriority(b);
 3799:     });
 3800:   }, [orderGroups, getStatusConfig]);
 3801: 
 3802:   // v2.7.0: Auto-expand effect
 3803:   useEffect(() => {
 3804:     if (!sortedGroups?.length) return;
 3805:     
 3806:     setExpandedGroups(prev => {
 3807:       const next = new Set(prev);
 3808:       sortedGroups.slice(0, 5).forEach(g => next.add(g.id));
 3809:       sortedGroups.forEach(g => {
 3810:         if (isFavorite(g.type === 'table' ? 'table' : 'order', g.id)) {
 3811:           next.add(g.id);
 3812:         }
 3813:       });
 3814:       return next;
 3815:     });
 3816:   }, [sortedGroups, isFavorite]);
 3817: 
 3818:   // v2.7.0: Toggle group expand
 3819:   const toggleGroupExpand = useCallback((groupId) => {
 3820:     setExpandedGroups(prev => {
 3821:       const next = new Set(prev);
 3822:       if (next.has(groupId)) next.delete(groupId);
 3823:       else next.add(groupId);
 3824:       return next;
 3825:     });
 3826:   }, []);
 3827: 
 3828:   // v2.7.1: Tab filtering (active vs completed)
 3829:   const filteredGroups = useMemo(() => {
 3830:     if (!orderGroups) return [];
 3831:     
 3832:     return orderGroups.filter(group => {
 3833:       const hasActiveOrder = group.orders.some(o => {
 3834:         const config = getStatusConfig(o);
 3835:         return !config.isFinishStage && o.status !== 'cancelled';
 3836:       });
 3837:       const hasActiveRequest = group.type === 'table' && activeRequests.some(r => getLinkId(r.table) === group.id);
 3838:       // S267: served-but-not-closed → stay in Active until closeSession
 3839:       const hasServedButNotClosed = group.orders.some(o => {
 3840:         const config = getStatusConfig(o);
 3841:         return config.isFinishStage && o.status !== 'closed' && o.status !== 'cancelled';
 3842:       });
 3843:       return activeTab === 'active'
 3844:         ? (hasActiveOrder || hasActiveRequest || hasServedButNotClosed)
 3845:         : (!hasActiveOrder && !hasActiveRequest && !hasServedButNotClosed);
 3846:     });
 3847:   }, [orderGroups, activeTab, getStatusConfig, activeRequests]);
 3848: 
 3849:   // v2.7.1: Tab counts
 3850:   const tabCounts = useMemo(() => {
 3851:     if (!orderGroups) return { active: 0, completed: 0 };
 3852:     
 3853:     let active = 0, completed = 0;
 3854:     orderGroups.forEach(group => {
 3855:       const hasActiveOrder = group.orders.some(o => {
 3856:         const config = getStatusConfig(o);
 3857:         return !config.isFinishStage && o.status !== 'cancelled';
 3858:       });
 3859:       const hasActiveRequest = group.type === 'table' && activeRequests.some(r => getLinkId(r.table) === group.id);
 3860:       const hasServedButNotClosed = group.orders.some(o => {
 3861:         const config = getStatusConfig(o);
 3862:         return config.isFinishStage && o.status !== 'closed' && o.status !== 'cancelled';
 3863:       });
 3864:       if (hasActiveOrder || hasActiveRequest || hasServedButNotClosed) active++; else completed++;
 3865:     });
 3866:     
 3867:     return { active, completed };
 3868:   }, [orderGroups, getStatusConfig, activeRequests]);
 3869: 
 3870:   // v2.7.1: Favorites filter
 3871:   const finalGroups = useMemo(() => {
 3872:     if (!showOnlyFavorites) return filteredGroups;
 3873:     
 3874:     return filteredGroups.filter(group => {
 3875:       if (isFavorite(group.type === 'table' ? 'table' : 'order', group.id)) return true;
 3876:       if (group.type !== 'table') return false;
 3877:       return activeRequests.some(req =>
 3878:         getLinkId(req.table) === group.id && favorites.includes(`request:${req.id}`)
 3879:       );
 3880:     });
 3881:   }, [filteredGroups, showOnlyFavorites, isFavorite, activeRequests, favorites]);
 3882: 
 3883:   const finalRequests = useMemo(() => {
 3884:     const base = showOnlyFavorites
 3885:       ? activeRequests.filter(req => favorites.includes(`request:${req.id}`))
 3886:       : activeRequests;
 3887:     return base.filter(req => !getLinkId(req.table));
 3888:   }, [activeRequests, showOnlyFavorites, favorites]);
 3889: 
 3890:   // V2: Sort groups by table status priority (Mine tab sort order spec)
 3891:   const v2SortedGroups = useMemo(() => {
 3892:     if (!finalGroups.length) return finalGroups;
 3893:     return [...finalGroups].sort((a, b) => {
 3894:       const statusA = computeTableStatus(a, activeRequests, getStatusConfig);
 3895:       const statusB = computeTableStatus(b, activeRequests, getStatusConfig);
 3896:       const pa = TABLE_STATUS_SORT_PRIORITY[statusA] ?? 5;
 3897:       const pb = TABLE_STATUS_SORT_PRIORITY[statusB] ?? 5;
 3898:       if (pa !== pb) return pa - pb;
 3899:       // Within same status group: oldest order first
 3900:       const ta = Math.min(...a.orders.map(o => safeParseDate(o.created_date).getTime()));
 3901:       const tb = Math.min(...b.orders.map(o => safeParseDate(o.created_date).getTime()));
 3902:       return ta - tb;
 3903:     });
 3904:   }, [finalGroups, activeRequests, getStatusConfig]);
 3905: 
 3906:   // v2.7.0: Removed favoriteOrders/otherOrders (replaced by orderGroups)
 3907: 
 3908:   const prevDigestRef = useRef(null);
 3909:   const prevStatusMapRef = useRef({});
 3910: 
 3911:   const pushNotify = (title, newOrderIds = [], bannerInfo = null) => {
 3912:     if (!notifPrefs?.enabled) return;
 3913:     setNotifDot(true);
 3914: 
 3915:     if (newOrderIds.length > 0) {
 3916:       setNotifiedOrderIds((prev) => {
 3917:         const next = new Set(prev);
 3918:         newOrderIds.forEach((id) => next.add(id));
 3919:         return next;
 3920:       });
 3921:     }
 3922: 
 3923:     if (notifPrefs.sound && audioUnlockedRef.current && audioRef.current?.play) {
 3924:       try { audioRef.current.play(); } catch { /* ignore */ }
 3925:     }
 3926:     tryVibrate(notifPrefs.vibrate);
 3927:     // V2-09: Show banner instead of toast for richer notification
 3928:     if (bannerInfo) {
 3929:       bannerIdCounter.current += 1;
 3930:       setBannerData({
 3931:         id: bannerIdCounter.current,
 3932:         text: bannerInfo.text || title,
 3933:         groupId: bannerInfo.groupId || null,
 3934:         count: bannerInfo.count || 1,
 3935:       });
 3936:     } else {
 3937:       showToast(title);
 3938:     }
 3939:     if (notifPrefs.system && canUseNotifications() && Notification.permission === "granted") {
 3940:       try { new Notification(title); } catch { /* ignore */ }
 3941:     }
 3942:   };
 3943: 
 3944:   // P0-1: Notification effect uses normalized stageId
 3945:   useEffect(() => {
 3946:     if (!canFetch) return;
 3947: 
 3948:     const filterAge = Date.now() - lastFilterChangeRef.current;
 3949:     if (filterAge < 1500) {
 3950:       const eligibleOrders = applyChannels(applyAssign(roleFilteredOrders, assignFilters, effectiveUserId), selectedTypes);
 3951:       const digest = eligibleOrders.map((o) => {
 3952:         const stageId = getLinkId(o.stage_id); // P0-1
 3953:         return `${o.id}:${o.status}:${stageId || ''}`;
 3954:       }).sort().join("|");
 3955:       prevDigestRef.current = digest;
 3956:       const m = {};
 3957:       eligibleOrders.forEach((o) => {
 3958:         const stageId = getLinkId(o.stage_id); // P0-1
 3959:         m[o.id] = { status: o.status, stage_id: stageId };
 3960:       });
 3961:       prevStatusMapRef.current = m;
 3962:       return;
 3963:     }
 3964: 
 3965:     const eligibleOrders = applyChannels(applyAssign(roleFilteredOrders, assignFilters, effectiveUserId), selectedTypes);
 3966:     const digest = eligibleOrders.map((o) => {
 3967:       const stageId = getLinkId(o.stage_id); // P0-1
 3968:       return `${o.id}:${o.status}:${stageId || ''}`;
 3969:     }).sort().join("|");
 3970: 
 3971:     const prev = prevDigestRef.current;
 3972:     prevDigestRef.current = digest;
 3973: 
 3974:     if (!prev) {
 3975:       const m = {};
 3976:       eligibleOrders.forEach((o) => {
 3977:         const stageId = getLinkId(o.stage_id); // P0-1
 3978:         m[o.id] = { status: o.status, stage_id: stageId };
 3979:       });
 3980:       prevStatusMapRef.current = m;
 3981:       return;
 3982:     }
 3983:     if (prev === digest) return;
 3984: 
 3985:     const prevMap = prevStatusMapRef.current || {};
 3986:     const currMap = {};
 3987:     eligibleOrders.forEach((o) => {
 3988:       const stageId = getLinkId(o.stage_id); // P0-1
 3989:       currMap[o.id] = { status: o.status, stage_id: stageId };
 3990:     });
 3991:     prevStatusMapRef.current = currMap;
 3992: 
 3993:     const own = ownMutationRef.current;
 3994:     const ownRecent = own && Date.now() - own.ts < 6000;
 3995: 
 3996:     let becameReady = 0;
 3997:     const newOrderIds = [];
 3998:     const readyOrderIds = [];
 3999: 
 4000:     eligibleOrders.forEach((o) => {
 4001:       if (ownRecent && own.orderId === o.id) return;
 4002:       const pst = prevMap[o.id];
 4003:       if (!pst) {
 4004:         newOrderIds.push(o.id);
 4005:         return;
 4006:       }
 4007:       // Check if became ready (either by status or by stage) - P0-1: use normalized ids
 4008:       const pstStageId = pst.stage_id; // already normalized in prevMap
 4009:       const currStageId = getLinkId(o.stage_id);
 4010:       const wasReady = pst.status === 'ready' || (pstStageId && stagesMap[pstStageId]?.internal_code === 'finish');
 4011:       const isReady = o.status === 'ready' || (currStageId && stagesMap[currStageId]?.internal_code === 'finish');
 4012:       if (!wasReady && isReady) { becameReady++; readyOrderIds.push(o.id); }
 4013:     });
 4014: 
 4015:     // V2-09: Build banner info with table context
 4016:     const buildBannerInfo = (orderIds, eventType) => {
 4017:       if (!orderIds.length) return null;
 4018:       // Find which table(s) these orders belong to
 4019:       const orderMap = {};
 4020:       eligibleOrders.forEach(o => { orderMap[o.id] = o; });
 4021:       const tableIds = new Set();
 4022:       orderIds.forEach(id => {
 4023:         const o = orderMap[id];
 4024:         if (o) {
 4025:           const tId = getLinkId(o.table);
 4026:           if (tId) tableIds.add(tId);
 4027:         }
 4028:       });
 4029:       const tableNames = [...tableIds].map(tId => {
 4030:         const t = tableMap[tId];
 4031:         return t?.name ? `${t.name}` : null;
 4032:       }).filter(Boolean);
 4033: 
 4034:       // Single table: "Стол 5: Новый заказ"
 4035:       if (tableNames.length === 1 && orderIds.length === 1) {
 4036:         const label = eventType === 'ready' ? 'Заказ готов' : 'Новый заказ';
 4037:         return {
 4038:           text: `${tableNames[0]}: ${label}`,
 4039:           groupId: [...tableIds][0],
 4040:           count: 1,
 4041:         };
 4042:       }
 4043:       // Multiple: "3 новых заказа" or "2 заказа готовы"
 4044:       const count = orderIds.length;
 4045:       if (eventType === 'ready') {
 4046:         const word = count === 1 ? 'заказ готов' : count < 5 ? 'заказа готовы' : 'заказов готовы';
 4047:         return { text: `${count} ${word}`, groupId: tableIds.size === 1 ? [...tableIds][0] : null, count };
 4048:       }
 4049:       const word = count === 1 ? 'новый заказ' : count < 5 ? 'новых заказа' : 'новых заказов';
 4050:       return { text: `${count} ${word}`, groupId: tableIds.size === 1 ? [...tableIds][0] : null, count };
 4051:     };
 4052: 
 4053:     if (becameReady > 0) {
 4054:       const banner = buildBannerInfo(readyOrderIds, 'ready');
 4055:       pushNotify(`Готово: +${becameReady}`, [], banner);
 4056:       return;
 4057:     }
 4058:     if (newOrderIds.length > 0) {
 4059:       const banner = buildBannerInfo(newOrderIds, 'new');
 4060:       pushNotify(`Новые: +${newOrderIds.length}`, newOrderIds, banner);
 4061:       // v3.6.0: Force refetch to ensure detail view gets fresh data immediately
 4062:       queryClient.invalidateQueries({ queryKey: ['orders'] });
 4063:     }
 4064:   }, [roleFilteredOrders, assignFilters, selectedTypes, canFetch, notifPrefs, effectiveUserId, stagesMap, tableMap, queryClient]);
 4065: 
 4066:   const toggleChannel = (type) => {
 4067:     const on = selectedTypes.includes(type);
 4068:     if (on && selectedTypes.length === 1) {
 4069:       showToast("Минимум 1 канал");
 4070:       return;
 4071:     }
 4072:     if (!on && (channelCounts[type] || 0) === 0) {
 4073:       showToast("Пока 0 заказов");
 4074:     }
 4075:     lastFilterChangeRef.current = Date.now();
 4076:     setSelectedTypes((p) => (p.includes(type) ? p.filter((t) => t !== type) : [...p, type]));
 4077:   };
 4078: 
 4079:   const toggleAssign = (key) => {
 4080:     const on = assignFilters.includes(key);
 4081:     if (on && assignFilters.length === 1) {
 4082:       showToast("Минимум 1 фильтр");
 4083:       return;
 4084:     }
 4085:     if (!on && (assignCounts[key] || 0) === 0) {
 4086:       showToast("Пока 0 заказов");
 4087:     }
 4088:     lastFilterChangeRef.current = Date.now();
 4089:     setAssignFilters((p) => (p.includes(key) ? p.filter((x) => x !== key) : [...p, key]));
 4090:   };
 4091: 
 4092:   // v4.0.0: Toggle expand/collapse — max 1 card expanded
 4093:   const handleToggleExpand = useCallback((groupId) => {
 4094:     setExpandedGroupId(prev => prev === groupId ? null : groupId);
 4095:   }, []);
 4096: 
 4097:   // V2-09: Sprint D — Highlight state for banner-navigate
 4098:   const [highlightGroupId, setHighlightGroupId] = useState(null);
 4099:   const highlightTimerRef = useRef(null);
 4100: 
 4101:   // v4.0.0: Banner tap → expand card + scroll to it + highlight briefly
 4102:   const handleBannerNavigate = useCallback((groupId) => {
 4103:     if (!groupId) return;
 4104:     setExpandedGroupId(groupId);
 4105:     requestAnimationFrame(() => {
 4106:       requestAnimationFrame(() => {
 4107:         const el = document.querySelector(`[data-group-id="${CSS.escape(String(groupId))}"]`);
 4108:         if (el) {
 4109:           el.scrollIntoView({ behavior: 'smooth', block: 'center' });
 4110:           setHighlightGroupId(groupId);
 4111:           if (highlightTimerRef.current) clearTimeout(highlightTimerRef.current);
 4112:           highlightTimerRef.current = setTimeout(() => setHighlightGroupId(null), 1500);
 4113:         }
 4114:       });
 4115:     });
 4116:   }, []);
 4117: 
 4118:   // Cleanup highlight timer
 4119:   useEffect(() => () => {
 4120:     if (highlightTimerRef.current) clearTimeout(highlightTimerRef.current);
 4121:   }, []);
 4122: 
 4123:   // V2-09: Banner dismiss handler
 4124:   const handleBannerDismiss = useCallback(() => {
 4125:     setBannerData(null);
 4126:   }, []);
 4127: 
 4128:   const handleRefresh = () => {
 4129:     setManualRefreshTs(Date.now());
 4130:     refetchOrders();
 4131:     if (!isKitchen) refetchRequests();
 4132:   };
 4133: 
 4134:   // D1-007, D1-008, D1-009: Close table handler
 4135:   // v3.6.0: Shows confirmation dialog instead of browser confirm()
 4136:   const handleCloseTable = (tableSessionField, tableName) => {
 4137:     const sessionId = getLinkId(tableSessionField);
 4138:     if (!sessionId) return;
 4139:     setCloseTableConfirm({ sessionId, tableName: tableName || 'стол' });
 4140:   };
 4141: 
 4142:   // v3.6.0: Confirmation dialog — executes close after user confirms
 4143:   const confirmCloseTable = async () => {
 4144:     if (!closeTableConfirm) return;
 4145:     const { sessionId } = closeTableConfirm;
 4146:     setCloseTableConfirm(null);
 4147:     try {
 4148:       await closeSession(sessionId);
 4149:       showToast("Стол закрыт");
 4150:       setExpandedGroupId(null); // Collapse expanded card — table no longer active
 4151:       refetchOrders();
 4152:     } catch (err) {
 4153:       showToast("Ошибка при закрытии");
 4154:     }
 4155:   };
 4156: 
 4157:   // v2.7.1: Close all orders handler (move all to finish stage)
 4158:   const handleCloseAllOrders = useCallback(async (orders) => {
 4159:     if (!orders?.length) return;
 4160:     
 4161:     const finishStage = sortedStages.find(s => s.internal_code === 'finish');
 4162:     if (!finishStage) {
 4163:       showToast('Нет этапа "Завершён"');
 4164:       return;
 4165:     }
 4166:     
 4167:     try {
 4168:       await runBatchSequential(orders, (o) =>
 4169:         base44.entities.Order.update(o.id, { stage_id: finishStage.id })
 4170:       );
 4171:       queryClient.invalidateQueries({ queryKey: ["orders"] });
 4172:       showToast('Стол закрыт');
 4173:     } catch (err) {
 4174:       if (isRateLimitError(err)) {
 4175:         queryClient.cancelQueries();
 4176:         setRateLimitHit(true);
 4177:       }
 4178:     }
 4179:   }, [sortedStages, queryClient]);
 4180: 
 4181:   const requestNotifPermission = async () => {
 4182:     if (!canUseNotifications()) { showToast("Не поддерживается"); return; }
 4183:     try {
 4184:       const r = await Notification.requestPermission();
 4185:       showToast(r === "granted" ? "Разрешено" : "Не разрешено");
 4186:     } catch { showToast("Ошибка"); }
 4187:   };
 4188: 
 4189:   if (gateView) return gateView;
 4190: 
 4191:   const hasErrors = (ordersError || requestsError) && !rateLimitHit;
 4192:   const hasFavorites = favorites.length > 0;
 4193:   const notifEnabled = !!notifPrefs?.enabled;
 4194:   const notifPermission = canUseNotifications() ? Notification.permission : "unsupported";
 4195: 
 4196:   const channelLabels = selectedTypes.map((t) => TYPE_THEME[t]?.label || t).join(", ");
 4197:   const assignLabels = assignFilters.map((f) => (f === "mine" ? "Мои" : f === "others" ? "Чужие" : "Свободные")).join(", ");
 4198: 
 4199:   const manualAge = manualRefreshTs ? Math.floor((Date.now() - manualRefreshTs) / 1000) : 9999;
 4200:   const refreshLabelText = manualAge <= 2 
 4201:     ? "Готово ✓" 
 4202:     : pollingInterval === 0 
 4203:       ? "Вручную" 
 4204:       : `Авто ${pollingInterval / 1000}с`;
 4205:   const refreshLabelColor = manualAge <= 2 ? "text-green-600" : "text-slate-400";
 4206: 
 4207:   const CABINET_USER_ROLES = ['partner_owner', 'partner_manager', 'director', 'managing_director'];
 4208:   const canAccessCabinet = isTokenMode
 4209:     ? (CABINET_ACCESS_ROLES.includes(effectiveRole) && link?.invited_user)
 4210:     : CABINET_USER_ROLES.includes(currentUser?.user_role);
 4211: 
 4212:   // D1-007: Determine who can close tables (NOT kitchen)
 4213:   const canCloseTable = !isKitchen && 
 4214:     ['partner_manager', 'partner_staff', 'director', 'managing_director', 'partner_owner']
 4215:       .includes(effectiveRole);
 4216: 
 4217:   return (
 4218:     <div className="min-h-screen bg-slate-100 pb-24 font-sans">
 4219:       <div className="bg-white border-b sticky top-0 z-20 shadow-sm">
 4220:         <div className="max-w-md mx-auto">
 4221:           <div className="px-4 pt-3 pb-2 flex items-center justify-between">
 4222:             <div>
 4223:               <h1 className="font-bold text-lg text-slate-900 leading-tight">Заказы</h1>
 4224:               <div className="text-[11px] text-slate-500">Активные: {visibleOrders.length}</div>
 4225:             </div>
 4226:             <div className="flex items-center gap-1.5">
 4227:               {canAccessCabinet && (
 4228:                 <button
 4229:                   type="button"
 4230:                   onClick={() => window.location.href = '/partnerhome'}
 4231:                   className="w-9 h-9 rounded-lg border border-indigo-200 bg-indigo-50 flex items-center justify-center active:scale-95"
 4232:                   aria-label="Перейти в кабинет"
 4233:                 >
 4234:                   <Briefcase className="w-5 h-5 text-indigo-600" />
 4235:                 </button>
 4236:               )}
 4237:               <button
 4238:                 type="button"
 4239:                 onClick={() => setProfileOpen(true)}
 4240:                 className="w-9 h-9 rounded-lg border border-slate-200 bg-white flex items-center justify-center active:scale-95"
 4241:                 aria-label="Профиль"
 4242:               >
 4243:                 <User className="w-5 h-5 text-slate-600" />
 4244:               </button>
 4245:               <button
 4246:                 type="button"
 4247:                 onClick={() => { setNotifOpen((v) => !v); setNotifDot(false); }}
 4248:                 className="relative w-9 h-9 rounded-lg border border-slate-200 bg-white flex items-center justify-center active:scale-95"
 4249:                 aria-label="Настройки уведомлений"
 4250:               >
 4251:                 <Bell className="w-5 h-5 text-slate-600" />
 4252:                 {notifEnabled && notifDot && <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500" />}
 4253:               </button>
 4254:               <button
 4255:                 type="button"
 4256:                 onClick={() => setSettingsOpen(true)}
 4257:                 className="w-9 h-9 rounded-lg border border-slate-200 bg-white flex items-center justify-center active:scale-95"
 4258:                 aria-label="Настройки"
 4259:               >
 4260:                 <Settings className="w-5 h-5 text-slate-600" />
 4261:               </button>
 4262:             </div>
 4263:           </div>
 4264: 
 4265:           <div className="px-4 pb-3 flex items-start justify-between gap-2">
 4266:             <div className="flex gap-2 flex-1 min-w-0">
 4267:               <IconToggle label="Мои" count={assignCounts.mine} selected={assignFilters.includes("mine")} onClick={() => toggleAssign("mine")} countAsIcon />
 4268:               <IconToggle label="Чужие" count={assignCounts.others} selected={assignFilters.includes("others")} onClick={() => toggleAssign("others")} countAsIcon />
 4269:               <IconToggle label="Свободные" count={assignCounts.free} selected={assignFilters.includes("free")} onClick={() => toggleAssign("free")} countAsIcon />
 4270:             </div>
 4271:             <div className="flex items-start gap-2">
 4272:               <div className="flex flex-col items-center">
 4273:                 <button
 4274:                   type="button"
 4275:                   onClick={handleRefresh}
 4276:                   className="w-9 h-9 rounded-lg border border-slate-200 bg-white flex items-center justify-center active:scale-95"
 4277:                   aria-label="Обновить"
 4278:                 >
 4279:                   {loadingOrders ? <Loader2 className="w-5 h-5 animate-spin text-slate-400" /> : <RefreshCcw className="w-5 h-5 text-slate-600" />}
 4280:                 </button>
 4281:                 <span className={`text-[10px] mt-1 min-w-[56px] text-center ${refreshLabelColor}`}>{refreshLabelText}</span>
 4282:               </div>
 4283:               {sortMode === "time" && (
 4284:                 <div className="flex flex-col items-center">
 4285:                   <button
 4286:                     type="button"
 4287:                     onClick={toggleSortOrder}
 4288:                     className="w-9 h-9 rounded-lg border border-slate-200 bg-white flex items-center justify-center active:scale-95"
 4289:                     aria-label="Сортировка"
 4290:                   >
 4291:                     {sortOrder === "newest" ? <ArrowDown className="w-5 h-5 text-slate-600" /> : <ArrowUp className="w-5 h-5 text-slate-600" />}
 4292:                   </button>
 4293:                   <span className="text-[10px] text-slate-400 mt-1 min-w-[56px] text-center">
 4294:                     {sortOrder === "newest" ? "Новые" : "Старые"}
 4295:                   </span>
 4296:                 </div>
 4297:               )}
 4298:             </div>
 4299:           </div>
 4300:         </div>
 4301:       </div>
 4302: 
 4303:       <div className="max-w-md mx-auto p-4 space-y-4">
 4304:         {hasErrors && (
 4305:           <Card className="border-red-200 bg-red-50">
 4306:             <CardContent className="p-3 flex items-center justify-between gap-2">
 4307:               <span className="text-sm text-red-700">Ошибка загрузки</span>
 4308:               <Button variant="outline" size="sm" onClick={handleRefresh} className="border-red-300 text-red-600">Повторить</Button>
 4309:             </CardContent>
 4310:           </Card>
 4311:         )}
 4312: 
 4313:         {!isKitchen && (
 4314:           <div className="flex gap-2">
 4315:             <button
 4316:               onClick={() => setActiveTab('active')}
 4317:               className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
 4318:                 activeTab === 'active'
 4319:                   ? 'bg-indigo-600 text-white'
 4320:                   : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
 4321:               }`}
 4322:             >
 4323:               Активные ({tabCounts.active})
 4324:             </button>
 4325:             <button
 4326:               onClick={() => setActiveTab('completed')}
 4327:               className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
 4328:                 activeTab === 'completed'
 4329:                   ? 'bg-slate-600 text-white'
 4330:                   : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
 4331:               }`}
 4332:             >
 4333:               Завершённые ({tabCounts.completed})
 4334:             </button>
 4335:             <button
 4336:               onClick={() => setShowOnlyFavorites(v => !v)}
 4337:               className={`px-3 py-2 rounded-lg transition-colors ${
 4338:                 showOnlyFavorites
 4339:                   ? 'bg-yellow-100 text-yellow-700 border border-yellow-300'
 4340:                   : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
 4341:               }`}
 4342:               aria-label="Только избранные"
 4343:             >
 4344:               <Star className={`w-4 h-4 ${showOnlyFavorites ? 'fill-yellow-400' : ''}`} />
 4345:             </button>
 4346:           </div>
 4347:         )}
 4348: 
 4349:         {!isKitchen && finalRequests.length > 0 && (
 4350:           <div>
 4351:             {finalRequests.map((req) => {
 4352:               // P0-1: Normalize table for RequestCard
 4353:               const reqTableId = getLinkId(req.table);
 4354:               return (
 4355:                 <RequestCard
 4356:                   key={req.id}
 4357:                   request={req}
 4358:                   tableData={reqTableId ? tableMap[reqTableId] : null}
 4359:                   isPending={updateRequestMutation.isPending}
 4360:                   onAction={() => updateRequestMutation.mutate({ id: req.id, status: req.status === "new" ? "in_progress" : "done" })}
 4361:                   isFavorite={favorites.includes(`request:${req.id}`)}
 4362:                   onToggleFavorite={toggleFavorite}
 4363:                 />
 4364:               );
 4365:             })}
 4366:           </div>
 4367:         )}
 4368: 
 4369:         {(isKitchen ? visibleOrders.length === 0 : (v2SortedGroups.length === 0 && finalRequests.length === 0)) && !hasErrors ? (
 4370:           <div className="text-center py-10 text-slate-400">
 4371:             <div className="mb-2">
 4372:               {isKitchen 
 4373:                 ? "Нет заказов для кухни" 
 4374:                 : showOnlyFavorites 
 4375:                   ? "Нет избранных" 
 4376:                   : activeTab === 'active' 
 4377:                     ? "Нет активных заказов" 
 4378:                     : "Нет завершённых заказов"}
 4379:             </div>
 4380:             {isKitchen && <div className="text-xs mb-4">Фильтры: {channelLabels} · {assignLabels}</div>}
 4381:             <Button variant="outline" size="sm" onClick={handleRefresh}>Обновить</Button>
 4382:           </div>
 4383:         ) : (
 4384:           <React.Fragment>
 4385:             {(isKitchen ? visibleOrders.length > 0 : v2SortedGroups.length > 0) && (
 4386:               <h2 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
 4387:                 <UtensilsCrossed className="w-3 h-3" /> ЗАКАЗЫ
 4388:               </h2>
 4389:             )}
 4390:             
 4391:             {/* v2.7.0: Kitchen sees flat list, non-kitchen sees grouped cards */}
 4392:             {isKitchen ? (
 4393:               visibleOrders.map((o) => {
 4394:                 const tableId = getLinkId(o.table);
 4395:                 return (
 4396:                   <OrderCard 
 4397:                     key={o.id} 
 4398:                     order={o} 
 4399:                     tableData={tableId ? tableMap[tableId] : null}
 4400:                     isFavorite={false}
 4401:                     onToggleFavorite={() => {}}
 4402:                     disableServe={isKitchen} 
 4403:                     onMutate={trackOwnMutation}
 4404:                     effectiveUserId={effectiveUserId}
 4405:                     isNotified={notifiedOrderIds.has(o.id)}
 4406:                     onClearNotified={clearNotified}
 4407:                     getStatusConfig={getStatusConfig}
 4408:                     isKitchen={isKitchen}
 4409:                     guestsMap={guestsMap}
 4410:                     onCloseTable={null}
 4411:                   />
 4412:                 );
 4413:               })
 4414:             ) : (
 4415:               v2SortedGroups.map(group => (
 4416:                 <OrderGroupCard
 4417:                   key={group.id}
 4418:                   group={group}
 4419:                   isExpanded={expandedGroupId === group.id}
 4420:                   onToggleExpand={() => handleToggleExpand(group.id)}
 4421:                   isHighlighted={highlightGroupId === group.id}
 4422:                   isFavorite={isFavorite(group.type === 'table' ? 'table' : 'order', group.id)}
 4423:                   onToggleFavorite={toggleFavorite}
 4424:                   getStatusConfig={getStatusConfig}
 4425:                   guestsMap={guestsMap}
 4426:                   effectiveUserId={effectiveUserId}
 4427:                   onMutate={trackOwnMutation}
 4428:                   onCloseTable={canCloseTable ? handleCloseTable : null}
 4429:                   overdueMinutes={partnerData?.order_overdue_minutes}
 4430:                   notifiedOrderIds={notifiedOrderIds}
 4431:                   onClearNotified={clearNotified}
 4432:                   tableMap={tableMap}
 4433:                   onCloseAllOrders={handleCloseAllOrders}
 4434:                   activeRequests={activeRequests}
 4435:                   onCloseRequest={(reqId, newStatus, extraFields) => updateRequestMutation.mutate({ id: reqId, status: newStatus, ...extraFields })}
 4436:                   onBatchCloseRequestAsync={(reqId, newStatus, extraFields) => updateRequestMutation.mutateAsync({ id: reqId, status: newStatus, ...extraFields, __batch: true })}
 4437:                   orderStages={sortedStages}
 4438:                   setUndoToast={setUndoToast}
 4439:                   undoToast={undoToast}
 4440:                   staffName={staffName}
 4441:                   isRequestPending={updateRequestMutation.isPending}
 4442:                 />
 4443:               ))
 4444:             )}
 4445: 
 4446:           </React.Fragment>
 4447:         )}
 4448:       </div>
 4449: 
 4450:       {/* Modals */}
 4451:       <MyTablesModal
 4452:         open={myTablesOpen}
 4453:         onClose={() => setMyTablesOpen(false)}
 4454:         tables={tables || []}
 4455:         favorites={favorites}
 4456:         onToggleFavorite={toggleFavorite}
 4457:         onClearAll={clearAllFavorites}
 4458:       />
 4459:       
 4460:       <ProfileSheet
 4461:         open={profileOpen}
 4462:         onClose={() => setProfileOpen(false)}
 4463:         staffName={staffName}
 4464:         staffRole={effectiveRole}
 4465:         partnerName={partnerName}
 4466:         isKitchen={isKitchen}
 4467:         favoritesCount={favorites.length}
 4468:         onOpenMyTables={() => setMyTablesOpen(true)}
 4469:         onLogout={handleLogout}
 4470:       />
 4471:       
 4472:       <SettingsPanel 
 4473:         open={settingsOpen} 
 4474:         onClose={() => setSettingsOpen(false)} 
 4475:         pollingInterval={pollingInterval} 
 4476:         onChangePollingInterval={handleChangePollingInterval}
 4477:         sortMode={sortMode}
 4478:         onChangeSortMode={handleChangeSortMode}
 4479:         selectedTypes={selectedTypes}
 4480:         onToggleChannel={toggleChannel}
 4481:         channelCounts={channelCounts}
 4482:       />
 4483: 
 4484:       {notifOpen && (
 4485:         <div className="fixed inset-0 z-40">
 4486:           <button type="button" className="absolute inset-0 bg-black/30" onClick={() => setNotifOpen(false)} aria-label="Закрыть" />
 4487:           <div className="absolute inset-x-0 bottom-0 max-h-[70vh] bg-white rounded-t-2xl shadow-xl">
 4488:             <div className="flex items-center justify-between p-4 border-b border-slate-200">
 4489:               <span className="font-bold text-slate-900">Уведомления</span>
 4490:               <button type="button" onClick={() => setNotifOpen(false)} className="p-2 -m-2 text-slate-400 hover:text-slate-600">
 4491:                 <X className="w-5 h-5" />
 4492:               </button>
 4493:             </div>
 4494:             <div className="p-4 space-y-3">
 4495:               <label className="flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-slate-50">
 4496:                 <span className="text-sm font-medium text-slate-800">Уведомления</span>
 4497:                 <input type="checkbox" checked={notifEnabled} onChange={(e) => updateNotifPrefs({ enabled: e.target.checked })} className="h-5 w-5" />
 4498:               </label>
 4499:               <div className={notifEnabled ? "" : "opacity-50 pointer-events-none"}>
 4500:                 <div className="space-y-2">
 4501:                   <label className="flex items-center justify-between px-3 py-2 rounded-lg border border-slate-200 bg-white">
 4502:                     <span className="text-sm text-slate-700">Вибрация</span>
 4503:                     <input type="checkbox" checked={!!notifPrefs.vibrate} onChange={(e) => updateNotifPrefs({ vibrate: e.target.checked })} className="h-5 w-5" />
 4504:                   </label>
 4505:                   <label className="flex items-center justify-between px-3 py-2 rounded-lg border border-slate-200 bg-white">
 4506:                     <span className="text-sm text-slate-700">Звук</span>
 4507:                     <input type="checkbox" checked={!!notifPrefs.sound} onChange={(e) => updateNotifPrefs({ sound: e.target.checked })} className="h-5 w-5" />
 4508:                   </label>
 4509:                   <div className="flex items-center justify-between px-3 py-2 rounded-lg border border-slate-200 bg-white">
 4510:                     <div className="flex-1">
 4511:                       <span className="text-sm text-slate-700">Push-уведомления</span>
 4512:                       {notifPermission !== "granted" && <div className="text-[10px] text-slate-400">Нужно разрешение браузера</div>}
 4513:                     </div>
 4514:                     {notifPermission === "granted" ? (
 4515:                       <input type="checkbox" checked={!!notifPrefs.system} onChange={(e) => updateNotifPrefs({ system: e.target.checked })} className="h-5 w-5" />
 4516:                     ) : (
 4517:                       <Button variant="outline" size="sm" onClick={requestNotifPermission} className="h-7 text-xs">Разрешить</Button>
 4518:                     )}
 4519:                   </div>
 4520:                 </div>
 4521:                 <div className="mt-3 text-[11px] text-slate-500 bg-slate-50 p-2 rounded-lg">Уведомления приходят по активным фильтрам.</div>
 4522:               </div>
 4523:             </div>
 4524:           </div>
 4525:         </div>
 4526:       )}
 4527: 
 4528:       {/* v3.6.0: Close table confirmation dialog */}
 4529:       {closeTableConfirm && (
 4530:         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
 4531:           <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6">
 4532:             <h3 className="text-lg font-bold text-slate-900 mb-2">
 4533:               {`Закрыть ${closeTableConfirm.tableName}?`}
 4534:             </h3>
 4535:             <p className="text-sm text-slate-600 mb-6">
 4536:               Гости больше не смогут отправлять заказы.
 4537:             </p>
 4538:             <div className="flex gap-3">
 4539:               <button
 4540:                 type="button"
 4541:                 onClick={() => setCloseTableConfirm(null)}
 4542:                 className="flex-1 min-h-[44px] rounded-lg border border-slate-300 bg-white text-sm font-medium text-slate-700 active:scale-[0.98]"
 4543:               >
 4544:                 Отмена
 4545:               </button>
 4546:               <button
 4547:                 type="button"
 4548:                 onClick={confirmCloseTable}
 4549:                 className="flex-1 min-h-[44px] rounded-lg bg-red-600 text-white text-sm font-semibold active:scale-[0.98]"
 4550:               >
 4551:                 Закрыть
 4552:               </button>
 4553:             </div>
 4554:           </div>
 4555:         </div>
 4556:       )}
 4557: 
 4558:       {toastMsg && (
 4559:         <div className="fixed left-0 right-0 bottom-6 z-50 flex justify-center px-4 pointer-events-none">
 4560:           <div className="bg-slate-900 text-white text-sm px-4 py-2 rounded-full shadow-lg">{toastMsg}</div>
 4561:         </div>
 4562:       )}
 4563: 
 4564:       {/* V2-09: Sprint D — Banner notification overlay */}
 4565:       <BannerNotification
 4566:         banner={bannerData}
 4567:         onDismiss={handleBannerDismiss}
 4568:         onNavigate={handleBannerNavigate}
 4569:       />
 4570:     </div>
 4571:   );
 4572: }
 4573: 
 4574: 
 4575: 
=== END SOURCE CODE ===

=== TASK CONTEXT ===
# ПССК: SOM Б1 — Close Table → Завершённые (P1) + Rate-limit Single-Mutation Audit (diagnostics only)

Это ПССК v1 батча Б1 (надёжность). Scope утверждён Arman S278.

**Source RELEASE:** `pages/StaffOrdersMobile/260414-02 StaffOrdersMobile RELEASE.jsx` (4538 строк). Рабочая копия: `pages/StaffOrdersMobile/staffordersmobile.jsx`. Helper: `components/sessionHelpers.js` (closeSession FUNCTION 8).

**Report target для Fix 2:** `BUGS_MASTER.md` (корень репозитория Cowork), новая секция `## SOM Rate-Limit Single-Mutation Audit (S278 Б1)`.

---

## Задача ревью

Please review the DRAFT КС prompt below. The КС has TWO deliverables:

- **Fix 1 (code change)** — fixes SOM-BUG-S270-02 (close table → Завершённые tab).
- **Fix 2 (report only, NO code)** — rate-limit audit for single mutations. Output: markdown section appended to `BUGS_MASTER.md`.

Check the draft for:

1. **Fix 1 root cause coverage** — do the proposed changes actually close the bug? Specifically:
   - `closeSession` (sessionHelpers.js:158-171) sets `TableSession.status='closed'` + per-order `status='closed'` — is the signal reaching the filter?
   - `filteredGroups` (staffordersmobile.jsx:3829-3847) `hasActiveOrder` check: `!config.isFinishStage && o.status !== 'cancelled'` — a closed order can still have `!config.isFinishStage` if stage_id is earlier. Is this the actual gap?
   - Close-table button (lines 767, 1382, 2381) disabled only via `closeDisabledReason` — after closeSession nothing in `closeDisabledReason` changes locally until refetch; button stays clickable → double-press risk. Is the proposed guard (`table.status === 'closed'` OR `session.status === 'closed'`) the correct disable condition?
2. **Ambiguous Fix descriptions** — anything that could be interpreted 2+ ways.
3. **Wrong/missing line numbers or grep hints** (file: `260414-02 StaffOrdersMobile RELEASE.jsx`, 4538 lines).
4. **Fix 2 audit coverage** — does the draft list cover all single-mutation call sites?
   - `handleSingleAction` (line 2002) delegates to `handleOrdersAction` with `[order]` — already passes `__batch: true` and invalidates once. ✅ Covered.
   - `confirmCloseTable` (line 4143-4155) calls `closeSession(sessionId)` then `refetchOrders()` — does this trigger a cascade? closeSession inside does `Promise.all(sessionOrders.map(... Order.update))` (sessionHelpers.js:166-170) — **potential fan-out**, not covered by __batch.
   - `handleCloseAllOrders` (line 4158+) uses `runBatchSequential` → OK.
   - `updateRequestMutation` single calls (line 3550-3551) use `__batch` gate on success.
   - Any other mutation direct call (Order.update / ServiceRequest.update / TableSession.update) outside the __batch/invalidate-once discipline?
5. **Fix 2 report structure** — is the required markdown schema (Location / Call site / Risk / Recommendation / Estimated LOC) clear enough that CC+Codex write a consistent report?
6. **Scope creep risks** — Fix 2 must be PURE diagnostic: no code edits in staffordersmobile.jsx or sessionHelpers.js. If auditor finds ≤20-LOC fix, it goes into the report under "Proposed fix (NOT applied in this task)", NOT into the patch. Is this guardrail visible enough in the draft?
7. **Regression risks for Fix 1** — close-table flow is cross-cut with bill-payment gate and undo-toast. The draft explicitly protects:
   - `closeDisabledReason` original conditions (all dishes served + bill paid) — kept intact;
   - `activeTab === 'active'` default behavior (only newly closed group moves to completed);
   - Real-time `useQuery` refetch after closeSession — intact.
   Did we miss anything?
8. **Grep hints** — verify the patterns in "Grep verification" actually exist and return the expected counts.

Rate each Fix (1, 2): ✅ Clear / ⚠️ Needs clarification / ❌ Rewrite needed.

**Target for implementation КС:** both Fix ≥ 4/5. Any ❌ blocks queue.

---

## Context for reviewers

**B44 entity model (verified S271):**
- `TableSession.status` — values: `'open' | 'closed'` (S70 changed from `'active'`→`'open'`).
- `Order.status` — after closeSession all non-cancelled orders set to `'closed'`.
- `Table.status` — added in B44-2 (commit `374e7a4`, S271). NOT currently updated by closeSession in sessionHelpers.js — open question: should it be? Draft assumes fix is on the **filter side** (tab filter), not on closeSession side.

**Current filter logic (staffordersmobile.jsx:3829-3847):**
```js
const filteredGroups = useMemo(() => {
  if (!orderGroups) return [];
  return orderGroups.filter(group => {
    const hasActiveOrder = group.orders.some(o => {
      const config = getStatusConfig(o);
      return !config.isFinishStage && o.status !== 'cancelled';  // ← gap: 'closed' still counts
    });
    const hasActiveRequest = group.type === 'table' && activeRequests.some(r => getLinkId(r.table) === group.id);
    const hasServedButNotClosed = group.orders.some(o => {
      const config = getStatusConfig(o);
      return config.isFinishStage && o.status !== 'closed' && o.status !== 'cancelled';
    });
    return activeTab === 'active'
      ? (hasActiveOrder || hasActiveRequest || hasServedButNotClosed)
      : (!hasActiveOrder && !hasActiveRequest && !hasServedButNotClosed);
  });
}, [orderGroups, activeTab, getStatusConfig, activeRequests]);
```

**closeSession helper (components/sessionHelpers.js:158-171):**
```js
export async function closeSession(sessionId) {
  await base44.entities.TableSession.update(sessionId, {
    status: "closed",
    closed_at: new Date().toISOString()
  });
  const sessionOrders = await base44.entities.Order.filter({ table_session: sessionId });
  await Promise.all(
    sessionOrders
      .filter(o => o.status !== 'cancelled')
      .map(o => base44.entities.Order.update(o.id, { status: 'closed' }))
  );
}
```

Root-cause hypothesis: `hasActiveOrder` returns true for `{status:'closed', stage_id:<not finish>}`, because it only excludes `'cancelled'`. After closeSession, orders get `status='closed'` but retain their stage_id. Filter keeps the group in `'active'` tab.

Secondary issue: `Promise.all` fan-out in closeSession on line 166 is a potential rate-limit source (Fix 2 audit — not in Fix 1 scope).

---

## DRAFT КС PROMPT BELOW (do not implement — review only)

---

```yaml
page: StaffOrdersMobile
code_file: pages/StaffOrdersMobile/staffordersmobile.jsx
budget: 12
agent: cc+codex
chain_template: consensus-with-discussion-v2
ws: WS-SOM
session: S278
```

# SOM Б1: Close Table → Завершённые + Rate-Limit Single-Mutation Audit

Reference: `menuapp-code-review/pages/StaffOrdersMobile/BUGS.md` § SOM-BUG-S270-02.
RELEASE source: `260414-02 StaffOrdersMobile RELEASE.jsx` (4538 lines).
Helper: `menuapp-code-review/components/sessionHelpers.js` (FUNCTION 8 closeSession, lines 155-171).

---

## Fix 1 — SOM-BUG-S270-02 (P1) [MUST-FIX]: После «Закрыть стол» карточка не переходит в таб «Завершённые»

### Сейчас (текущее поведение)

Официант открывает стол → все условия выполнены (все блюда выданы + счёт оплачен) → нажимает «Закрыть стол». В БД: `TableSession.status='closed'`, все orders `status='closed'` (sessionHelpers.js:158-171). В UI: карточка сворачивается (expandedGroupId=null), но остаётся в табе «Активные» в свёрнутом виде. Кнопка «Закрыть стол» в свёрнутой карточке остаётся активной. Официант нажимает повторно → `closeSession` снова выполняется (idempotent, но лишние API calls).

### Должно быть (ожидаемое поведение)

После успешного `closeSession`:
1. Скс переходит в таб «Завершённые (N)», из «Активные» исчезает.
2. Таб-счётчики (`tabCounts`) синхронно обновляются: `active--`, `completed++`.
3. Кнопка «Закрыть стол» в скс становится disabled (серый стиль) ИЛИ не рендерится вовсе, если стол уже закрыт.
4. Real-time refetch через `refetchOrders()` в `confirmCloseTable` (line 4151) — intact.

Ref: BUGS.md § SOM-BUG-S270-02, UX-spec S225 §Завершение стола.

### НЕ должно быть (анти-паттерны)

- NO изменения `closeSession` в sessionHelpers.js (scope Fix 1 — только staffordersmobile.jsx).
- NO добавления новых entity полей, новых API routes, новой B44 schema.
- NO изменения `closeDisabledReason` исходных условий (dishes served + bill paid).
- NO изменения `activeTab` default ('active') — открытие страницы без выбора таба работает как раньше.
- NO изменения real-time subscription / polling интервалов.
- NO изменения в FROZEN UX layout (identity block, smart chips, ownership filter bar).

### Файл и локация — 2 места в staffordersmobile.jsx

**Change A — `filteredGroups` (line 3829-3847):** дополнить `hasActiveOrder` check чтобы исключать `status === 'closed'`.

```js
// BEFORE (line 3833-3836)
const hasActiveOrder = group.orders.some(o => {
  const config = getStatusConfig(o);
  return !config.isFinishStage && o.status !== 'cancelled';
});

// AFTER
const hasActiveOrder = group.orders.some(o => {
  const config = getStatusConfig(o);
  return !config.isFinishStage
    && o.status !== 'cancelled'
    && o.status !== 'closed';
});
```

**Apply same change in `tabCounts` useMemo (line 3850-3866) `hasActiveOrder` — строка 3855-3858**, чтобы счётчики совпадали с фильтром.

**Change B — Close-table button guard (lines 767, 1382, 2381):** добавить check `isTableClosed` и применить к `disabled`.

```js
// Near useMemo block (around line 2150, before handleCloseTableClick):
const isTableClosed = useMemo(() => {
  if (group.type !== 'table') return false;
  // group.orders all closed → group effectively closed
  const hasAnyOpen = group.orders.some(o =>
    o.status !== 'closed' && o.status !== 'cancelled'
  );
  return !hasAnyOpen && group.orders.length > 0;
}, [group.orders, group.type]);
```

Then update **all three buttons** (lines 767, 1382, 2381 — все вхождения `onClick={handleCloseTableClick} disabled={!!closeDisabledReason}`):

```jsx
// BEFORE
<button type="button" onClick={handleCloseTableClick}
        disabled={!!closeDisabledReason}
        className={`... ${closeDisabledReason ? "bg-slate-50 text-slate-400 ..." : "bg-red-50 text-red-600 ..."}`}>
  {HALL_UI_TEXT.closeTable}
</button>

// AFTER
<button type="button" onClick={handleCloseTableClick}
        disabled={!!closeDisabledReason || isTableClosed}
        className={`... ${(closeDisabledReason || isTableClosed) ? "bg-slate-50 text-slate-400 ..." : "bg-red-50 text-red-600 ..."}`}>
  {HALL_UI_TEXT.closeTable}
</button>
```

Three button blocks use the same JSX pattern:
- **line 767** — expanded card view (main flow)
- **line 1382** — collapsed card view (скс) inside TableCard branch
- **line 2381** — expanded card internal «Закрыть стол» block (inside `onCloseTable && group.orders.length > 0` conditional)

Apply the same `disabled={!!closeDisabledReason || isTableClosed}` + className change to all three.

**Scope of `isTableClosed` useMemo:** определить внутри того же компонента, где доступен `group.orders` (это тот же scope где `advanceMutation`, `handleCloseTableClick` line 2161). Если кнопки на 767 и 1382/2381 находятся в разных компонентах — определить `isTableClosed` в каждом scope отдельно (duplicate useMemo OK, scope lock важнее DRY).

### Уже пробовали

- S271: B44-2 применён (Table.status added). Но closeSession всё ещё только TableSession+Order (sessionHelpers.js unchanged). Фикс на уровне фильтра (а не schema) — проще и не трогает shared helper.
- S272: SOM-BUG-S270-01 rate-limit fix (batch fan-out). Отдельный bug, fixed, скс reorg не затронут.

### Grep verification (обязательно перед commit)

```bash
grep -n "hasActiveOrder" staffordersmobile.jsx
# expected: 2 hits — в filteredGroups (~3833) и в tabCounts (~3855). Оба должны содержать `o.status !== 'closed'`.

grep -n "o.status !== 'closed'" staffordersmobile.jsx
# expected: ≥3 hits (два новых в hasActiveOrder + один старый в hasServedButNotClosed).

grep -n "disabled={!!closeDisabledReason" staffordersmobile.jsx
# expected: 0 hits after fix — все 3 вхождения (767, 1382, 2381) должны измениться на `|| isTableClosed`.

grep -n "isTableClosed" staffordersmobile.jsx
# expected: ≥7 hits (1-2 useMemo definitions + 3 usages in disabled + 3 usages in className).
```

### Проверка (мини тест-кейс для Fix 1)

1. Открыть SOM с одним активным столом (1 блюдо выдано, счёт оплачен). Нажать «Закрыть стол» → подтвердить в диалоге. Скс должен через ≤1 sec исчезнуть из «Активные», появиться в «Завершённые (1)».
2. Перейти в таб «Завершённые» → скс виден. Развернуть её (если allowed) → кнопка «Закрыть стол» disabled (серый фон, cursor-not-allowed).
3. Regression: открытый стол с незавершёнными блюдами → кнопка «Закрыть стол» disabled по `closeDisabledReason` (как раньше).
4. Regression: открытие SOM по умолчанию — `activeTab='active'`, виден список активных столов. Табов-счётчики правильные.
5. Regression: real-time — закрыть стол в одном планшете → на втором планшете стол исчезает из «Активные» в течение polling interval (~5с).

---

## Fix 2 — Rate-Limit Single-Mutation Audit (P2) [DIAGNOSTIC ONLY, NO CODE CHANGES]

### Цель

Составить отчёт: все места в SOM (staffordersmobile.jsx + sessionHelpers.js), где единичная мутация (Order/ServiceRequest/TableSession) вызывается вне `__batch` флага или вне `runBatchSequential` — потенциальный источник rate-limit 429 при высокой нагрузке (polling + refetch cascade).

**NO code edits.** Output — новая секция в `BUGS_MASTER.md`.

### Метод аудита (для auditor — CC и Codex)

1. Grep all direct calls to entity mutations:
   ```bash
   grep -n "base44\.entities\.Order\.update\|base44\.entities\.ServiceRequest\.update\|base44\.entities\.TableSession\.update" \
     menuapp-code-review/pages/StaffOrdersMobile/staffordersmobile.jsx \
     menuapp-code-review/components/sessionHelpers.js
   ```
2. Для каждого вхождения определить:
   - **Call site** (function + line range).
   - **Guard:** есть ли `__batch: true` во vars? Или внутри `runBatchSequential`? Или внутри `Promise.all`?
   - **Refetch/invalidate**: сразу после — `refetchOrders()`, `queryClient.invalidateQueries(...)`, `await queryClient.cancelQueries`?
3. Grep `refetchOrders\(\)|refetchRequests\(\)|invalidateQueries\(` — для каждого определить, вызывается ли после batch-операции или внутри одиночной мутации.
4. Grep `useQuery.*refetchInterval|refetchInterval:` — найти polling sources (ожидается: `orders` polling, `serviceRequests` polling). Интервал?

### Структура отчёта — append to `BUGS_MASTER.md`

Use this exact markdown skeleton:

```markdown
## SOM Rate-Limit Single-Mutation Audit (S278 Б1)

**Date:** 2026-04-15
**Scope:** `pages/StaffOrdersMobile/staffordersmobile.jsx` + `components/sessionHelpers.js`
**Related:** SOM-BUG-S270-01 (Fixed S272, batch path); SOM-BUG-S270-02 (Fix 1 Б1).

### Summary

- Total mutation call-sites audited: N
- Covered by `__batch: true` / `runBatchSequential`: M
- **Unguarded (potential rate-limit source): K**
- Polling intervals found: …

### Findings

#### Finding 1 — [Title, e.g. "closeSession Promise.all order close"]
- **Location:** `components/sessionHelpers.js:166-170` (function `closeSession`)
- **Call site:** `sessionOrders.filter(...).map(o => base44.entities.Order.update(o.id, { status: 'closed' }))` внутри `Promise.all`
- **Guard status:** ❌ No `__batch`, no delay — concurrent fan-out
- **Risk:** P0 / P1 / P2 — обосновать по числу блюд в типовом столе
- **Cascade check:** после closeSession вызывается `refetchOrders()` (staffordersmobile.jsx:4151) → burst refetch сразу после burst update
- **Proposed fix (NOT applied in this task):** заменить Promise.all на sequential loop с delay 120ms, OR добавить param `{batch:true}` в closeSession и использовать existing runBatchSequential из staffordersmobile.jsx (выделить в shared util)
- **Estimated LOC:** 8-15

#### Finding 2 — …
(same structure)

### Recommendations (prioritized)

1. [P0/P1/P2] — краткое описание + estimated LOC + отдельная задача (Б1-addon? BACKLOG?)
2. …

### Non-findings (verified safe)

- `handleSingleAction` (line 2002) — delegates to `handleOrdersAction` with `[order]` → уже проходит через runBatchSequential + `__batch:true` + invalidate-once. ✅
- `updateRequestMutation` (line 3550-3551) — `onSuccess` skips invalidate when `vars?.__batch`. ✅
- `handleCloseAllOrders` (line 4158+) — uses `runBatchSequential`. ✅
- …

### Polling sources

- `orders` useQuery: refetchInterval = X ms (source: line Y)
- `serviceRequests` useQuery: refetchInterval = X ms (source: line Y)

### Source files

- `menuapp-code-review/pages/StaffOrdersMobile/260414-02 StaffOrdersMobile RELEASE.jsx` (4538 lines, grep queries above)
- `menuapp-code-review/components/sessionHelpers.js` (199 lines, FUNCTION 8)
```

### НЕ должно быть (Fix 2 анти-паттерны)

- NO code edits in `.jsx` / `.js`. This task writes a `.md` report only.
- NO changing BUGS.md (Cowork maintains it separately).
- NO creating new BACKLOG entries — list recommendations at end of report; Cowork will triage.
- NO speculative findings (e.g. "possibly X" without grep evidence). Every finding must cite a grep match with line number.
- NO restructuring existing BUGS_MASTER.md sections — append new section at end of file (or after the most recent S278 section if one exists).

### Grep verification (обязательно перед commit)

```bash
# 1. Mutation call-sites directly (not via React Query mutation hook) — should be enumerated in the report
grep -nE "base44\.entities\.(Order|ServiceRequest|TableSession)\.update" \
  menuapp-code-review/pages/StaffOrdersMobile/staffordersmobile.jsx \
  menuapp-code-review/components/sessionHelpers.js

# 2. __batch flag usage — already-guarded paths
grep -nE "__batch\s*:|vars\?\.__batch" \
  menuapp-code-review/pages/StaffOrdersMobile/staffordersmobile.jsx

# 3. runBatchSequential usage — already-sequential paths
grep -n "runBatchSequential" menuapp-code-review/pages/StaffOrdersMobile/staffordersmobile.jsx

# 4. Polling sources
grep -nE "refetchInterval|useQuery\(" \
  menuapp-code-review/pages/StaffOrdersMobile/staffordersmobile.jsx

# 5. Refetch/invalidate call-sites
grep -nE "refetchOrders\(\)|refetchRequests\(\)|invalidateQueries\(" \
  menuapp-code-review/pages/StaffOrdersMobile/staffordersmobile.jsx \
  menuapp-code-review/components/sessionHelpers.js
```

### Проверка (Fix 2)

- Report записан в `BUGS_MASTER.md` как new section после последней S278 entry (или в конец если секций S278 нет).
- Все findings имеют `Location: file:line_range`, `Guard status`, `Risk`, `Proposed fix`, `Estimated LOC`.
- Все call-sites из grep #1 либо в Findings (unguarded), либо в Non-findings (guarded).
- Recommendations ранжированы по приоритету, для каждой указан estimated LOC.
- NO code edits — `git diff` в `.jsx`/`.js` = пусто.

---

## ⛔ SCOPE LOCK — менять ТОЛЬКО то, что указано выше

### Fix 1:
- Только 2 useMemo (`filteredGroups`, `tabCounts`) + useMemo `isTableClosed` + 2 button disabled/className обновления в `staffordersmobile.jsx`.
- `activeOrders` filter (line 3539-3550), `advanceMutation`, `updateRequestMutation` — НЕ ТРОГАТЬ.
- Single-action buttons, undo-toast, batch buttons — НЕ ТРОГАТЬ.
- `closeSession` в `sessionHelpers.js` — НЕ ТРОГАТЬ (scope Fix 2 audit, не Fix).
- Header redesign, drawer, ownership filter — НЕ ТРОГАТЬ.
- CartView / PublicMenu / OrdersList / ClientHome / Profile — НЕ ТРОГАТЬ.
- i18n строки `HALL_UI_TEXT.closeTable`, `HALL_UI_TEXT.acceptAll`, etc. — НЕ ТРОГАТЬ.

### Fix 2:
- Edits ONLY to `BUGS_MASTER.md` (append one new section).
- ZERO edits to `.jsx`, `.js`, `.md` (кроме BUGS_MASTER.md).
- Если auditor нашёл тривиальный (≤20 LOC) фикс → зафиксировать в `Proposed fix (NOT applied in this task)` поле Finding. НЕ применять в этой КС. Cowork создаст Б1-addon ПССК в той же сессии если Arman подтвердит.

## FROZEN UX (НЕ менять) — locked S225 / GPT S250

- Collapsed card identity block layout (78×54px, urgency colors, badge positions)
- Smart chips on collapsed card
- Ownership filter bar (★ Мои / ☆ Своб / Все)
- Urgency 3 levels (calm/warning/danger)
- Button labels, colors, touch targets min-h 44px
- Tab labels «Активные» / «Завершённые», counter format

## CONTEXT FILES (read before implementing)

- `menuapp-code-review/pages/StaffOrdersMobile/BUGS.md` § Active (SOM-BUG-S270-02 reproduction)
- `menuapp-code-review/pages/StaffOrdersMobile/260414-02 StaffOrdersMobile RELEASE.jsx` (source of truth)
- `menuapp-code-review/components/sessionHelpers.js` (FUNCTION 8 closeSession)
- `ux-concepts/StaffOrdersMobile/260406-00 StaffOrdersMobile UX S225 FINAL.md` §Завершение стола
- `KNOWLEDGE_BASE_VSC.md` — KB-142 (grep "ONLY in X"), KB-149 (dead-code removal), KB-150 (WinError 206)
- `BUGS_MASTER.md` — target file для Fix 2 report

## Implementation Notes

- Fix 1: single file edit (`pages/StaffOrdersMobile/staffordersmobile.jsx`). wc-l до/после должны отличаться на ≤15 строк (1 useMemo + 2 button updates).
- Fix 2: single file append (`BUGS_MASTER.md`). Существующий контент файла не модифицировать.
- Commit: `git add pages/StaffOrdersMobile/staffordersmobile.jsx BUGS_MASTER.md && git commit -m "SOM Б1: close-table → Завершённые fix (SOM-BUG-S270-02) + rate-limit single-mutation audit"`

## MOBILE-FIRST CHECK (MANDATORY before commit for Fix 1)

- [ ] Touch targets кнопки «Закрыть стол» ≥ 44×44px (unchanged)
- [ ] Disabled state visually clear (серый фон, cursor-not-allowed)
- [ ] 375px width: скс layout не ломается при добавлении `isTableClosed` flag
- [ ] Таб-счётчики на 320px экране не переполняют контейнер

## Regression Check (MANDATORY after implementation)

- [ ] Fix 1: Закрыть стол → скс переходит в «Завершённые» в течение 1 sec
- [ ] Fix 1: Кнопка «Закрыть стол» disabled после закрытия (не кликабельна)
- [ ] Fix 1: Открытый стол с незавершёнными блюдами — кнопка «Закрыть стол» disabled по `closeDisabledReason` (original logic preserved)
- [ ] Fix 1: Таб «Активные» по умолчанию показывает стол с активными заказами
- [ ] Fix 1: `activeOrders` filter (line 3539-3550) — unchanged behavior (order cards внутри скс не пропадают)
- [ ] Fix 1: Undo toast после «Выдать все» — по-прежнему работает
- [ ] Fix 1: Real-time polling refetch после close — скс исчезает из «Активные» в других клиентах
- [ ] Fix 2: `git diff` показывает изменения ТОЛЬКО в `BUGS_MASTER.md`
- [ ] Fix 2: Отчёт в BUGS_MASTER.md содержит ≥1 Finding ИЛИ явное утверждение "no unguarded mutations found" с grep evidence
- [ ] Fix 2: Все Findings имеют Location / Guard status / Risk / Proposed fix / LOC

---

## END OF DRAFT КС PROMPT
=== END ===
