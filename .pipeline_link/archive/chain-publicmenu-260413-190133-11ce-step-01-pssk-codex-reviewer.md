---
chain: publicmenu-260413-190133-11ce
chain_step: 1
chain_total: 1
chain_step_name: pssk-codex-reviewer
chain_group: reviewers
chain_group_size: 2
page: PublicMenu
budget: 5.00
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

Write your findings to: pipeline/chain-state/publicmenu-260413-190133-11ce-codex-findings.md

FORMAT:
# Codex Reviewer Findings — ПССК Prompt Quality Review
Chain: publicmenu-260413-190133-11ce

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
File: 260409-01 PublicMenu x RELEASE.jsx (5320 lines)

    1: // ======================================================
    2: // pages/x.jsx â€" PUBLIC MENU with i18n + Channels Visibility + Gating
    3: // UPDATED: Simplified Hall logic (TASK-260123-01b)
    4: // FIXED: P0-1..P0-7 security and functionality fixes
    5: // UPDATED: TASK-260127-01 - session restore, UI cleanup
    6: // PATCHED: 2026-01-28 - P0-1, P0-2, P0-2b, P1-1..P1-4
    7: // PATCHED: 2026-02-01 - FIX-260131-07 FINAL - guest safeguard in submit
    8: // PATCHED: 2026-02-01 - TASK-260201-01 - Hall StickyBar always visible
    9: // PATCHED: 2026-03-03 - GAP-01 - Order Confirmation Screen
   10: // FIXED: 2026-03-03 - GAP-01 fix - Confirmation as full-screen overlay (z-60)
   11: // FIXED: 2026-03-03 - GAP-02 fix - Embed OrderStatusScreen inside x.jsx (no /orderstatus route)
   12: // FIXED: 2026-03-03 - GAP-02 fix - Remove auto-dismiss timer (race condition: ghost click on menu)
   13: // ======================================================
   14: 
   15: import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
   16: import { useLocation } from "react-router-dom";
   17: import { useQuery, useQueryClient } from "@tanstack/react-query";
   18: import { base44 } from "@/api/base44Client";
   19: import { useI18n } from "@/components/i18n";
   20: import { toast } from "sonner"; // P0-6: sonner instead of custom toast
   21: 
   22: import {
   23:   AlertCircle,
   24:   ArrowLeft,
   25:   Bell,
   26:   Check,
   27:   CheckCircle2,
   28:   Clock,
   29:   ChevronDown,
   30:   ChevronUp,
   31:   Image as ImageIcon,
   32:   Loader2,
   33:   MapPin,
   34:   Minus,
   35:   Plus,
   36:   RefreshCw,
   37:   ShoppingCart,
   38:   X as XIcon,
   39:   XCircle,
   40:   Globe,
   41:   Phone,
   42:   Mail,
   43:   MessageCircle,
   44:   Link as LinkIcon,
   45:   Store,
   46:   Package,
   47:   Truck,
   48:   Users,
   49:   Layers,
   50: } from "lucide-react";
   51: 
   52: import {
   53:   getOrCreateSession,
   54:   addGuestToSession,
   55:   findGuestByDevice,
   56:   getSessionGuests,
   57:   getSessionOrders,
   58:   getDeviceId,
   59:   getGuestDisplayName,
   60:   getNextOrderNumber,
   61:   isSessionExpired,
   62: } from "@/components/sessionHelpers";
   63: 
   64: import {
   65:   normalizeMode,
   66:   isDishEnabledForMode,
   67:   sortCategoriesStable,
   68:   sortDishesStable,
   69:   buildDishesByCategory,
   70:   getVisibleCategoryIds,
   71: } from "@/components/menuChannelLogic";
   72: 
   73: import { Card, CardContent } from "@/components/ui/card";
   74: import { Button } from "@/components/ui/button";
   75: import { Input } from "@/components/ui/input";
   76: import { Textarea } from "@/components/ui/textarea";
   77: import {
   78:   Select,
   79:   SelectContent,
   80:   SelectItem,
   81:   SelectTrigger,
   82:   SelectValue,
   83: } from "@/components/ui/select";
   84: import {
   85:   Dialog,
   86:   DialogContent,
   87:   DialogDescription,
   88:   DialogHeader,
   89:   DialogTitle,
   90: } from "@/components/ui/dialog";
   91: 
   92: // TASK-260203-01: Drawer for cart
   93: import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
   94: 
   95: import Rating from "@/components/Rating";
   96: import DishRating from "@/components/publicMenu/DishRating";
   97: import PublicMenuHeader from "@/components/publicMenu/PublicMenuHeader";
   98: import HelpFab from "@/components/publicMenu/HelpFab";
   99: import HelpModal from "@/components/publicMenu/HelpModal";
  100: import ReviewDialog from "@/components/publicMenu/ReviewDialog";
  101: import StickyCartBar from "@/components/publicMenu/StickyCartBar";
  102: import MenuView from "@/components/publicMenu/MenuView";
  103: import CartView from "@/components/publicMenu/CartView";
  104: import RedirectBanner from "@/components/publicMenu/refactor/RedirectBanner";
  105: import DishReviewsModal from "@/components/publicMenu/DishReviewsModal";
  106: import ModeTabs from "@/components/publicMenu/refactor/ModeTabs";
  107: import CategoryChips from "@/components/publicMenu/refactor/CategoryChips";
  108: import HallVerifyBlock from "@/components/publicMenu/refactor/HallVerifyBlock";
  109: import ErrorState from "@/components/publicMenu/refactor/ErrorState";
  110: import EmptyMenuState from "@/components/publicMenu/refactor/EmptyMenuState";
  111: import CheckoutView from "@/components/publicMenu/views/CheckoutView";
  112: import { useCurrency } from "@/components/publicMenu/refactor/hooks/useCurrency";
  113: import { useHallTable } from "@/components/publicMenu/refactor/hooks/useHallTable";
  114: import { useHelpRequests } from "@/components/publicMenu/refactor/hooks/useHelpRequests";
  115: import { useLoyalty } from "@/components/publicMenu/refactor/hooks/useLoyalty";
  116: import { useReviews } from "@/components/publicMenu/refactor/hooks/useReviews";
  117: import { useTableSession } from "@/components/publicMenu/refactor/hooks/useTableSession";
  118: 
  119: // ============================================================
  120: // CONSTANTS & HELPERS
  121: // ============================================================
  122: 
  123: const isDishArchived = (dish) =>
  124:   !!dish?.description && dish.description.toLowerCase().includes(":::archived:::");
  125: 
  126: const getCleanDescription = (desc) =>
  127:   desc ? desc.replace(/:::archived:::/gi, "").trim() : "";
  128: 
  129: const looksLikePartnerId = (value) =>
  130:   /^[0-9a-f]{24}$/i.test(String(value || "").trim());
  131: 
  132: // P0-5: Rate limit detection
  133: const isRateLimitError = (err) => {
  134:   const msg = (err?.message || "").toLowerCase();
  135:   return msg.includes("rate limit") || msg.includes("429");
  136: };
  137: 
  138: const shouldRetry = (count, err) => !isRateLimitError(err) && count < 2;
  139: 
  140: // P1-1: XSS protection for contact URLs
  141: const isSafeUrl = (url) => {
  142:   if (!url) return false;
  143:   const allowed = ['http:', 'https:', 'tel:', 'mailto:', 'whatsapp:'];
  144:   try {
  145:     const parsed = new URL(url, window.location.origin);
  146:     return allowed.includes(parsed.protocol);
  147:   } catch {
  148:     return false;
  149:   }
  150: };
  151: 
  152: function getContactIcon(type) {
  153:   const map = {
  154:     phone: Phone,
  155:     whatsapp: MessageCircle,
  156:     instagram: LinkIcon,
  157:     facebook: LinkIcon,
  158:     tiktok: LinkIcon,
  159:     website: Globe,
  160:     email: Mail,
  161:     map: MapPin,
  162:     custom: LinkIcon,
  163:   };
  164:   return map[type] || LinkIcon;
  165: }
  166: 
  167: // Cart persistence helpers
  168: // BUG-PM-005: Cart persistence with 4h TTL
  169: const CART_TTL_MS = 4 * 60 * 60 * 1000; // 4 hours
  170: 
  171: const saveCartToStorage = (partnerId, cartData) => {
  172:   if (!partnerId) return;
  173:   try {
  174:     const key = `menuapp_cart_${partnerId}`;
  175:     if (!cartData || cartData.length === 0) {
  176:       localStorage.removeItem(key);
  177:       return;
  178:     }
  179:     localStorage.setItem(key, JSON.stringify({ items: cartData, ts: Date.now() }));
  180:   } catch {}
  181: };
  182: 
  183: const getCartFromStorage = (partnerId) => {
  184:   if (!partnerId) return null;
  185:   try {
  186:     const key = `menuapp_cart_${partnerId}`;
  187:     const raw = localStorage.getItem(key);
  188:     if (!raw) return null;
  189:     const data = JSON.parse(raw);
  190:     // Migrate legacy format (plain array) â€" accept but rewrite with timestamp
  191:     if (Array.isArray(data)) {
  192:       try {
  193:         localStorage.setItem(key, JSON.stringify({ items: data, ts: Date.now() }));
  194:       } catch {}
  195:       return data;
  196:     }
  197:     if (!data || !Array.isArray(data.items)) return null;
  198:     // TTL check â€" require valid ts
  199:     if (!data.ts || typeof data.ts !== 'number' || (Date.now() - data.ts) > CART_TTL_MS) {
  200:       localStorage.removeItem(key);
  201:       return null;
  202:     }
  203:     return data.items;
  204:   } catch {
  205:     return null;
  206:   }
  207: };
  208: 
  209: const clearCartStorage = (partnerId) => {
  210:   if (!partnerId) return;
  211:   try {
  212:     const key = `menuapp_cart_${partnerId}`;
  213:     localStorage.removeItem(key);
  214:   } catch {}
  215: };
  216: 
  217: /* ============================================================
  218:    CHANNELS VISIBILITY LOGIC (per LOCKED spec)
  219:    ============================================================ */
  220: 
  221: function isDishAvailableForGuest(dish, mode, categoriesMap) {
  222:   if (!dish) return false;
  223:   if (isDishArchived(dish)) return false;
  224:   if (dish[`enabled_${mode}`] === false) return false;
  225:   if (!dish.name?.trim()) return false;
  226:   if (dish.price == null || dish.price < 0) return false;
  227: 
  228:   const categoryId = dish.category;
  229:   if (categoryId && categoriesMap) {
  230:     const category = categoriesMap.get(String(categoryId));
  231:     if (category && category.is_active === false) return false;
  232:   }
  233:   return true;
  234: }
  235: 
  236: function useGuestChannels(partner, dishes, categories) {
  237:   return useMemo(() => {
  238:     const isConfigured = partner?.channels_configured_at != null;
  239:     const categoriesMap = new Map((categories || []).map((c) => [String(c.id), c]));
  240: 
  241:     const hasDishesForMode = (mode) => {
  242:       return (dishes || []).some((dish) => isDishAvailableForGuest(dish, mode, categoriesMap));
  243:     };
  244: 
  245:     const hallPublished = partner?.channels_hall_enabled !== false;
  246:     const pickupPublished = partner?.channels_pickup_enabled !== false;
  247:     const deliveryPublished = partner?.channels_delivery_enabled !== false;
  248: 
  249:     const hallHasContent = hasDishesForMode("hall");
  250:     const pickupHasContent = hasDishesForMode("pickup");
  251:     const deliveryHasContent = hasDishesForMode("delivery");
  252: 
  253:     return {
  254:       hall: {
  255:         visible: hallPublished,
  256:         available: hallPublished && hallHasContent,
  257:         hasContent: hallHasContent,
  258:         disabled: hallPublished && !hallHasContent,
  259:       },
  260:       pickup: {
  261:         visible: pickupPublished && isConfigured,
  262:         available: pickupPublished && isConfigured && pickupHasContent,
  263:         hasContent: pickupHasContent,
  264:         disabled: pickupPublished && isConfigured && !pickupHasContent,
  265:       },
  266:       delivery: {
  267:         visible: deliveryPublished && isConfigured,
  268:         available: deliveryPublished && isConfigured && deliveryHasContent,
  269:         hasContent: deliveryHasContent,
  270:         disabled: deliveryPublished && isConfigured && !deliveryHasContent,
  271:       },
  272:       isConfigured,
  273:       hasAnyContent: hallHasContent || pickupHasContent || deliveryHasContent,
  274:     };
  275:   }, [partner, dishes, categories]);
  276: }
  277: 
  278: const SCROLL_SPY_OFFSET_PX = 100;
  279: const MANUAL_SCROLL_LOCK_MS = 800;
  280: const BILL_COOLDOWN_MS = 5 * 60 * 1000; // 5 minutes
  281: 
  282: // Bill request cooldown helpers
  283: const getBillCooldownKey = (tableId) => `menuapp_bill_requested_${tableId}`;
  284: 
  285: const isBillOnCooldown = (tableId) => {
  286:   try {
  287:     const key = getBillCooldownKey(tableId);
  288:     const timestamp = localStorage.getItem(key);
  289:     if (!timestamp) return false;
  290:     return Date.now() - parseInt(timestamp, 10) < BILL_COOLDOWN_MS;
  291:   } catch { return false; }
  292: };
  293: 
  294: const setBillCooldownStorage = (tableId) => {
  295:   try {
  296:     const key = getBillCooldownKey(tableId);
  297:     localStorage.setItem(key, String(Date.now()));
  298:   } catch { /* private browsing â€" ignore */ }
  299: };
  300: 
  301: /**
  302:  * ÐÐ°Ñ…Ð¾Ð´Ð¸Ñ‚ ÑÑ‚Ð°Ñ€Ñ‚Ð¾Ð²Ñ‹Ð¹ ÑÑ‚Ð°Ð¿ Ð´Ð»Ñ Ð·Ð°ÐºÐ°Ð·Ð°
  303:  */
  304: function getStartStage(stages, orderType) {
  305:   if (!stages?.length) return null;
  306:   
  307:   const channelStages = stages.filter(stage => {
  308:     switch (orderType) {
  309:       case 'hall': return stage.enabled_hall !== false;
  310:       case 'pickup': return stage.enabled_pickup !== false;
  311:       case 'delivery': return stage.enabled_delivery !== false;
  312:       default: return true;
  313:     }
  314:   });
  315:   
  316:   const startStage = channelStages.find(s => s.internal_code === 'start');
  317:   if (startStage) return startStage;
  318:   
  319:   const sorted = [...channelStages].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
  320:   return sorted[0] || null;
  321: }
  322: 
  323: // ============================================================
  324: // i18n FALLBACK MAP â€" prevents raw keys from showing to guests
  325: // Chain: selected lang â†’ EN fallback â†’ RU fallback â†’ empty string
  326: // ============================================================
  327: const I18N_FALLBACKS = {
  328:   // Order statuses (OrderStatusBadge)
  329:   "status.new": "New",
  330:   "status.cooking": "Cooking",
  331:   "status.ready": "Ready",
  332:   "status.accepted": "Accepted",
  333:   "status.served": "Served",
  334:   // Order Status Screen
  335:   "order_status.status_new": "Accepted",
  336:   "order_status.status_preparing": "Preparing",
  337:   "order_status.status_ready": "Ready",
  338:   "order_status.status_served": "Completed",
  339:   "order_status.status_cancelled": "Cancelled",
  340:   "order_status.step_received": "Received",
  341:   "order_status.step_preparing": "Preparing",
  342:   "order_status.step_ready": "Ready",
  343:   "order_status.no_token": "Order link is missing",
  344:   "order_status.check_link": "Please check the link and try again",
  345:   "order_status.back_to_menu": "Back to menu",
  346:   "order_status.not_found": "Order not found",
  347:   "order_status.expired": "Order expired",
  348:   "order_status.order_number": "Order",
  349:   "order_status.last_updated": "Updated",
  350:   "order_status.just_now": "just now",
  351:   "order_status.seconds_ago": "{seconds} sec. ago",
  352:   "order_status.your_order": "Your order",
  353:   "order_status.total": "Total",
  354:   "order_status.discount": "Discount",
  355:   "order_status.questions": "Any questions?",
  356:   "order_status.order_cancelled_info": "Order cancelled",
  357:   "order_status.order_complete_info": "Thank you! Your order is complete",
  358:   "order_status.refresh": "Refresh",
  359:   // Mode labels
  360:   "mode.hall": "Dine in",
  361:   "mode.pickup": "Takeaway",
  362:   "mode.delivery": "Delivery",
  363:   "mode.hall.desc": "Order in the restaurant",
  364:   "mode.pickup.desc": "I'll take it to go",
  365:   "mode.delivery.desc": "Delivery to your address",
  366:   // Hall verification
  367:   "hall.verify.title": "So the waiter receives your order right away",
  368:   "hall.verify.subtitle": "Enter the table code or tell it to the waiter",
  369:   "hall.verify.benefit": "After this, orders will go directly to the waiter",
  370:   "hall.verify.online_benefits": "Bonuses and discounts for online orders",
  371:   // Errors
  372:   "error.invalid_link": "Invalid link",
  373:   "error.save_failed": "Save error",
  374:   "error.phone_invalid": "Invalid format",
  375:   "error.phone_short": "Number is too short",
  376:   "error.phone_long": "Number is too long",
  377:   "error.table_required": "Please select a table",
  378:   "error.name_required": "Please enter your name",
  379:   "error.phone_required": "Please enter your phone number",
  380:   "error.address_required": "Please enter your address",
  381:   "error.submit_failed": "Submission error",
  382:   "error.session_expired": "Session expired",
  383:   "error.rate_limit": "Too many requests, please try again later",
  384:   "error.partner_missing": "Restaurant not specified",
  385:   "error.partner_hint": "Add the parameter",
  386:   "error.partner_not_found": "Restaurant not found",
  387:   "error.network_error": "Network error",
  388:   "error.check_connection": "Check your connection",
  389:   // Loyalty
  390:   "loyalty.insufficient_points": "Insufficient points",
  391:   "loyalty.transaction.redeem": "Points redeemed",
  392:   "loyalty.transaction.earn_order": "Points earned for order #{orderNumber}",
  393:   // Cart / checkout
  394:   "cart.checkout": "Checkout",
  395:   "cart.my_bill": "My bill",
  396:   "cart.table_orders": "Table orders",
  397:   "cart.your_orders": "Your orders",
  398:   "cart.view": "Open",
  399:   "cart.empty": "Cart is empty",
  400:   "cart.bill_already_requested": "Bill already requested",
  401:   "cart.bill_requested": "Waiter will bring the bill shortly",
  402:   "cart.title": "Cart",
  403:   "cart.your_order": "Your order",
  404:   "cart.back_to_menu": "Back to menu",
  405:   "cart.total": "Total",
  406:   "cart.expected_savings": "Expected savings",
  407:   "cart.submitting": "Sending...",
  408:   "cta.sending": "Sending...",
  409:   "cta.retry": "Retry",
  410:   "error.send.title": "Failed to send",
  411:   "error.send.subtitle": "Please try again",
  412:   "cart.item_added": "Added",
  413:   "cart.send_to_waiter": "Send to waiter",
  414:   "cart.send_order": "Send order",
  415:   // Checkout form (CheckoutView)
  416:   "checkout.currency_note": "Currency conversion",
  417:   "form.name": "Name",
  418:   "form.required": "*",
  419:   "form.phone": "Phone",
  420:   "form.phone_placeholder": "+7...",
  421:   "form.address": "Delivery address",
  422:   "form.comment": "Comment",
  423:   "form.comment_placeholder": "Special requests",
  424:   "form.table": "Table",
  425:   // Menu (MenuView)
  426:   "menu.add": "Add",
  427:   "menu.remove": "Remove",
  428:   "menu.tile": "Grid",
  429:   "menu.list": "List",
  430:   "menu.no_items": "No items in this category",
  431:   "menu.add_to_cart": "Add to cart",
  432:   "menu.added_to_cart": "Added to cart",
  433:   // Mode tabs
  434:   "mode.coming_soon": "Coming soon",
  435:   // Confirmation screen
  436:   "confirmation.title": "Order sent!",
  437:   "confirmation.your_order": "Your order",
  438:   "confirmation.total": "Total",
  439:   "confirmation.guest_label": "Guest",
  440:   "confirmation.client_name": "Name",
  441:   "confirmation.back_to_menu": "Back to menu",
  442:   "confirmation.my_orders": "My orders",
  443:   "confirmation.track_order": "Track order",
  444:   // Reviews & misc
  445:   "review.thanks": "Thank you for your rating!",
  446:   "review.add_comments": "Add comments",
  447:   "review.points": "points",
  448:   "review.rate_others": "Rate other guests' dishes",
  449:   "guest.name_saved": "Name saved",
  450:   "guest.name_placeholder": "Name",
  451:   "toast.error": "Error",
  452:   "common.loading": "Loading...",
  453:   "common.close": "Close",
  454:   "common.info": "Information",
  455:   "common.of": "of",
  456:   "common.or": "or",
  457:   "common.save": "Save",
  458:   "common.cancel": "Cancel",
  459:   "common.retry": "Retry",
  460:   // CartView — cart details
  461:   "cart.enter_table_code_hint": "Enter table code to send your order",
  462:   "cart.for_all": "For everyone",
  463:   "cart.guest": "Guest",
  464:   "cart.new_order": "New order",
  465:   "cart.no_orders_yet": "No orders yet",
  466:   "cart.only_me": "Just me",
  467:   "cart.order_total": "Order total",
  468:   "cart.split_disabled_hint": "(2+ guests)",
  469:   "cart.split_pick_guests_soon": "Select guests (coming soon)",
  470:   "cart.split_title": "Who is this order for",
  471:   "cart.table_total": "Table bill",
  472:   "cart.tell_code_to_waiter": "Tell this code to the waiter",
  473:   "cart.you": "You",
  474:   "cart.motivation_bonus_short": "Earn bonuses",
  475:   // CartView — table verification
  476:   "cart.verify.attempts": "Attempts",
  477:   "cart.verify.bonus_label": "Online order bonus",
  478:   "cart.verify.discount_label": "Online order discount",
  479:   "cart.verify.enter_code_placeholder": "Enter code",
  480:   "cart.verify.enter_table_code": "Enter table code",
  481:   "cart.verify.helper_text": "Enter code from your table",
  482:   "cart.verify.info_online_point1": "Order goes directly to the waiter",
  483:   "cart.verify.info_online_point2": "Usually faster",
  484:   "cart.verify.info_online_point3": "Discounts and bonuses (if any) are applied automatically",
  485:   "cart.verify.info_online_title": "Online order to waiter",
  486:   "cart.verify.info_table_code_point1": "Code is usually shown on the table",
  487:   "cart.verify.info_table_code_point2": "If not visible — ask your waiter",
  488:   "cart.verify.info_table_code_title": "Table code",
  489:   "cart.verify.locked": "Too many attempts. Try again in",
  490:   "cart.verify.online_order_title": "Online order to waiter",
  491:   "cart.verify.points_discount_label": "Points discount",
  492:   "cart.verify.table_verified": "Table confirmed",
  493:   // CartView — loyalty
  494:   "loyalty.apply": "Apply",
  495:   "loyalty.email_label": "Email for bonuses",
  496:   "loyalty.email_placeholder": "email@example.com",
  497:   "loyalty.email_saved": "Email saved! Bonuses will be added.",
  498:   "loyalty.enter_email_for_bonus": "Enter your email to earn bonuses:",
  499:   "loyalty.enter_email_hint": "Enter your email to earn bonuses",
  500:   "loyalty.get_bonus": "Get bonuses",
  501:   "loyalty.new_customer": "You will get {points} bonus points for your first order",
  502:   "loyalty.your_balance": "Your balance: {points} points",
  503:   "loyalty.max_redeem": "Maximum {max} points ({percent}% of order)",
  504:   "loyalty.instant_discount": "{percent}% discount applied",
  505:   "loyalty.enter_email_for_discount": "Enter email for {percent}% discount",
  506:   "loyalty.online_bonus_label": "Online order bonus",
  507:   "loyalty.points_applied": "Points applied",
  508:   "loyalty.points_short": "points",
  509:   "loyalty.redeem_points": "Redeem points",
  510:   "loyalty.review_reward_hint": "For review",
  511:   "loyalty.review_reward_prefix": "for review",
  512:   "loyalty.thanks_for_rating": "Thank you for your rating!",
  513:   "loyalty.title": "Bonuses",
  514:   // CartView — status
  515:   "status.cancelled": "Cancelled",
  516:   // CartView — misc
  517:   "cart.items_removed_mode_switch": "Removed {count} items not available in this mode",
  518:   // Table confirmation Bottom Sheet
  519:   "cart.confirm_table.title": "Confirm your table",
  520:   "cart.confirm_table.subtitle": "To send the order to the waiter",
  521:   "cart.confirm_table.benefit_loyalty": "Online orders earn you bonuses / discount",
  522:   "cart.confirm_table.benefit_default": "This helps the waiter find your order faster",
  523:   "cart.confirm_table.submit": "Send",
  524:   "cart.confirm_table.dismissed": "Got it",
  525:   // Help Drawer (help.*) — English, do not change these
  526:   "help.call_waiter": "Call a waiter",
  527:   "help.active_requests": "Active requests",
  528:   "help.sent_suffix": "sent",
  529:   "help.undo": "Undo",
  530:   "help.cancel_request": "Not needed",
  531:   "help.modal_title": "Need help?",
  532:   "help.modal_desc": "Choose how we can help",
  533:   "help.my_requests": "My requests",
  534:   "help.active_count": "active",
  535:   "help.bill": "Bring the bill",
  536:   "help.napkins": "Napkins",
  537:   "help.menu": "Paper menu",
  538:   "help.other": "Other",
  539:   "help.other_label": "Other",
  540:   "help.send_more": "Send more",
  541:   "help.all_requests_cta": "All requests ({count})",
  542:   "help.back_to_help": "Back to help",
  543:   "help.show_more": "More",
  544:   "help.show_less": "Less",
  545:   "help.requests": "requests",
  546:   "help.already_sent_short": "Already sent",
  547:   "help.comment_placeholder_other": "E.g.: high chair, cutlery, clear the table",
  548:   "help.submit_arrow": "Send",
  549:   "help.closed_by_guest": "✅ No longer needed",
  550:   "help.sending_now": "Sending…",
  551:   "help.retry": "Retry",
  552:   "help.remind": "Remind",
  553:   "help.retry_in": "In",
  554:   "help.just_sent": "Just sent",
  555:   "help.waiting_prefix": "Waiting",
  556:   "help.minutes_short": "min",
  557:   "help.reminded_just_now": "Just reminded",
  558:   "help.reminded_prefix": "Reminded",
  559:   "help.last_reminder_prefix": "Last",
  560:   "help.reminder_sent": "Reminder sent",
  561:   "help.resolved_call_waiter": "✅ Waiter came · Thank you!",
  562:   "help.resolved_bill": "✅ Bill brought · Thank you!",
  563:   "help.resolved_napkins": "✅ Napkins brought · Thank you!",
  564:   "help.resolved_menu": "✅ Menu brought · Thank you!",
  565:   "help.resolved_other": "✅ Done · Thank you!",
  566:   "help.no_connection": "No connection",
  567:   "help.try_again": "Try again",
  568:   "help.remind_failed": "Failed to send reminder",
  569:   "help.send_failed": "Failed to send",
  570:   "help.restoring_status": "Restoring status…",
  571:   "help.offline_status": "No connection · will retry automatically",
  572:   "help.stale_status": "Data may be outdated · no update",
  573:   "help.seconds_short": "sec",
  574:   "help.updated_label": "Updated",
  575:   "help.ago": "ago",
  576:   "help.reminder": "reminder",
  577:   "help.reminders": "reminders",
  578:   // SOS v6.0 new keys
  579:   "help.get_bill": "Bill",
  580:   "help.plate": "Extra plate",
  581:   "help.utensils": "Utensils",
  582:   "help.clear_table": "Clear the table",
  583:   "help.call_waiter_short": "Call",
  584:   "help.get_bill_short": "Bill",
  585:   "help.plate_short": "Plate",
  586:   "help.napkins_short": "Napkins",
  587:   "help.utensils_short": "Utensils",
  588:   "help.clear_table_short": "Clear",
  589:   "help.subtitle_choose": "Choose what you need",
  590:   "help.table_default": "Table",
  591:   "help.cancel_confirm_q": "Cancel request?",
  592:   "help.cancel_keep": "Keep",
  593:   "help.cancel_do": "Cancel",
  594:   "help.other_request_link": "Something else?",
  595:   "help.other_placeholder": "Describe what you need…",
  596:   "help.send_btn": "Send",
  597:   // Help Chips (quick suggestions in help drawer)
  598:   "help.chip.high_chair": "High chair",
  599:   "help.chip.cutlery": "Cutlery",
  600:   "help.chip.sauce": "Sauce",
  601:   "help.chip.clear_table": "Clear the table",
  602:   "help.chip.water": "Water",
  603: };
  604: 
  605: // i18n RU FALLBACK MAP — RU fallbacks for keys B44 stores with English values
  606: // Checked first in RU mode, same pattern as I18N_FALLBACKS for EN mode.
  607: const I18N_FALLBACKS_RU = {
  608:   "help.title": "Нужна помощь?",
  609:   "help.sent": "Отправлено",
  610:   "help.cancel": "Отмена",
  611:   "help.all_requests_cta": "Все запросы ({count})",
  612:   "help.back_to_help": "Назад",
  613:   "help.show_more": "Ещё",
  614:   "help.call_waiter": "Вызвать официанта",
  615:   "help.get_bill": "Счёт",
  616:   "help.request_napkins": "Салфетки",
  617:   "help.request_menu": "Меню",
  618:   "help.other": "Другое",
  619:   "help.other_label": "Другое",
  620:   "help.send_more": "Ещё запрос",
  621:   "help.sending_now": "Отправляем…",
  622:   "help.retry": "Повторить",
  623:   "help.remind": "Напомнить",
  624:   "help.retry_in": "Через",
  625:   "help.just_sent": "Только что",
  626:   "help.waiting_prefix": "Ожидание",
  627:   "help.minutes_short": "мин",
  628:   "help.reminded_just_now": "Только что напомнили",
  629:   "help.reminded_prefix": "Напомнили",
  630:   "help.last_reminder_prefix": "Последнее",
  631:   "help.reminder_sent": "Напоминание отправлено",
  632:   "help.resolved_call_waiter": "✅ Официант пришёл · Спасибо!",
  633:   "help.resolved_bill": "✅ Счёт принесли · Спасибо!",
  634:   "help.resolved_napkins": "✅ Салфетки принесли · спасибо!",
  635:   "help.resolved_menu": "✅ Меню принесли · Спасибо!",
  636:   "help.resolved_other": "✅ Готово · Спасибо!",
  637:   "help.no_connection": "Нет соединения",
  638:   "help.try_again": "Попробуйте снова",
  639:   "help.remind_failed": "Не удалось напомнить",
  640:   "help.send_failed": "Не удалось отправить",
  641:   "help.restoring_status": "Восстанавливаем…",
  642:   "help.offline_status": "Нет соединения · повторим автоматически",
  643:   "help.stale_status": "Данные могли устареть",
  644:   "help.seconds_short": "сек",
  645:   "help.updated_label": "Обновлено",
  646:   "help.ago": "назад",
  647:   "help.reminder": "напоминание",
  648:   "help.reminders": "напоминания",
  649:   "help.chip.high_chair": "Детское кресло",
  650:   "help.chip.cutlery": "Приборы",
  651:   "help.chip.sauce": "Соус",
  652:   "help.chip.clear_table": "Убрать стол",
  653:   "help.chip.water": "Вода",
  654:   // SOS v6.0 new keys
  655:   "help.plate": "Тарелку",
  656:   "help.utensils": "Приборы",
  657:   "help.clear_table": "Убрать со стола",
  658:   "help.call_waiter_short": "Позвать",
  659:   "help.get_bill_short": "Счёт",
  660:   "help.plate_short": "Тарелку",
  661:   "help.napkins_short": "Салфетки",
  662:   "help.utensils_short": "Приборы",
  663:   "help.clear_table_short": "Убрать",
  664:   "help.subtitle_choose": "Выберите, что нужно",
  665:   "help.table_default": "Стол",
  666:   "help.cancel_confirm_q": "Отменить запрос?",
  667:   "help.cancel_keep": "Оставить",
  668:   "help.cancel_do": "Отменить",
  669:   "help.other_request_link": "Другой запрос?",
  670:   "help.other_placeholder": "Напишите, что нужно…",
  671:   "help.send_btn": "Отправить",
  672:   "help.sent_suffix": "отправлено",
  673:   "help.undo": "Отменить",
  674:   "cart.my_bill": "Мой счёт",
  675: };
  676: 
  677: /**
  678:  * Wraps raw t() to prevent raw i18n keys from reaching the UI.
  679:  * Falls back to I18N_FALLBACKS map, supports {param} interpolation.
  680:  */
  681: function makeSafeT(rawT, lang) {
  682:   return (key, params) => {
  683:     // EN mode: I18N_FALLBACKS is the authoritative EN source.
  684:     // Check it FIRST to avoid B44 returning RU for keys with no EN translation.
  685:     if (lang === 'en') {
  686:       let fb = I18N_FALLBACKS[key];
  687:       if (fb != null && fb !== '') {
  688:         if (params && typeof params === "object") {
  689:           Object.entries(params).forEach(([k, v]) => {
  690:             fb = fb.replace(new RegExp(`\\{${k}\\}`, "g"), String(v ?? ""));
  691:           });
  692:         }
  693:         return fb;
  694:       }
  695:     }
  696:     // RU mode: check RU fallbacks first (B44 may have stored EN values for these keys)
  697:     if (lang === 'ru') {
  698:       let fb = I18N_FALLBACKS_RU[key];
  699:       if (fb != null && fb !== '') {
  700:         if (params && typeof params === "object") {
  701:           Object.entries(params).forEach(([k, v]) => {
  702:             fb = fb.replace(new RegExp(`\\{${k}\\}`, "g"), String(v ?? ""));
  703:           });
  704:         }
  705:         return fb;
  706:       }
  707:     }
  708:     // Try the real translation first
  709:     const val = typeof rawT === "function" ? rawT(key, params) : "";
  710:     if (val && typeof val === "string") {
  711:       const norm = val.trim();
  712:       // If t() returned something other than the raw key, use it
  713:       if (norm !== key && !norm.startsWith(key + ":")) return norm;
  714:     }
  715:     // Fallback from map
  716:     let fb = I18N_FALLBACKS[key];
  717:     if (!fb) return "";
  718:     // Simple {param} interpolation for fallbacks
  719:     if (params && typeof params === "object") {
  720:       Object.entries(params).forEach(([k, v]) => {
  721:         fb = fb.replace(new RegExp(`\\{${k}\\}`, "g"), String(v ?? ""));
  722:       });
  723:     }
  724:     return fb;
  725:   };
  726: }
  727: 
  728: /**
  729:  * Order Status Badge component (TASK-260126-01)
  730:  */
  731: function OrderStatusBadge({ status, stageId, stages, t }) {
  732:   // Map internal_code to translated labels (don't show raw stage.name to guests)
  733:   const STAGE_LABELS = {
  734:     start: t('status.new'),
  735:     middle: t('status.cooking'),
  736:     finish: t('status.ready'),
  737:   };
  738:   
  739:   // Normalize stageId (can be string, object with id, etc)
  740:   const stageIdNorm = stageId && typeof stageId === 'object' 
  741:     ? (stageId.id ?? stageId._id ?? null) 
  742:     : stageId;
  743:   
  744:   // If has stage_id - use OrderStage config but translated label
  745:   if (stageIdNorm && stages?.length) {
  746:     const stage = stages.find(s => String(s.id) === String(stageIdNorm));
  747:     if (stage) {
  748:       const icon = stage.internal_code === 'finish' ? 'âœ…' : 
  749:                    stage.internal_code === 'start' ? 'ðŸ"µ' : 'ðŸŸ ';
  750:       const label = STAGE_LABELS[stage.internal_code] || t('status.new');
  751:       const color = stage.color || '#64748b';
  752:       return (
  753:         <span 
  754:           className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full"
  755:           style={{ backgroundColor: `${color}20`, color }}
  756:         >
  757:           {icon} {label}
  758:         </span>
  759:       );
  760:     }
  761:   }
  762:   
  763:   // Fallback to status
  764:   const STATUS_CONFIG = {
  765:     new: { icon: 'ðŸ"µ', label: t('status.new'), bg: 'bg-blue-100', color: 'text-blue-700' },
  766:     accepted: { icon: 'ðŸ"µ', label: t('status.accepted'), bg: 'bg-blue-100', color: 'text-blue-700' },
  767:     in_progress: { icon: 'ðŸŸ ', label: t('status.cooking'), bg: 'bg-orange-100', color: 'text-orange-700' },
  768:     ready: { icon: 'âœ…', label: t('status.ready'), bg: 'bg-green-100', color: 'text-green-700' },
  769:     served: { icon: 'âœ…', label: t('status.served'), bg: 'bg-green-100', color: 'text-green-700' },
  770:   };
  771:   
  772:   const config = STATUS_CONFIG[status] || STATUS_CONFIG.new;
  773:   
  774:   return (
  775:     <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full ${config.bg} ${config.color}`}>
  776:       {config.icon} {config.label}
  777:     </span>
  778:   );
  779: }
  780: 
  781: /* ============================================================
  782:    GAP-01: ORDER CONFIRMATION SCREEN
  783:    Shown after successful order submission. User navigates via buttons.
  784:    (Auto-dismiss removed: caused ghost clicks on menu when timer fired)
  785:    ============================================================ */
  786: 
  787: function OrderConfirmationScreen({
  788:   items,
  789:   totalAmount,
  790:   guestLabel,
  791:   orderMode,
  792:   publicToken,
  793:   clientName,
  794:   formatPrice,
  795:   onBackToMenu,
  796:   onOpenOrders,
  797:   onTrackOrder,
  798:   t,
  799:   partner,
  800: }) {
  801:   const primaryColor = partner?.primary_color || '#1A1A1A';
  802:   // Safe translation with fallback
  803:   const tr = (key, fallback) => {
  804:     const val = typeof t === "function" ? t(key) : "";
  805:     if (!val || typeof val !== "string") return fallback;
  806:     const norm = val.trim();
  807:     if (norm === key || norm.startsWith(key + ":")) return fallback;
  808:     return norm;
  809:   };
  810: 
  811:   return (
  812:     <div className="fixed inset-0 z-[60] overflow-y-auto" style={{backgroundColor:'#faf9f7'}}>
  813:     <div className="px-4 py-8 max-w-md mx-auto animate-[fadeInUp_0.3s_ease-out]">
  814:       {/* CSS-only animations â€" respects prefers-reduced-motion */}
  815:       <style>{`
  816:         @keyframes fadeInUp {
  817:           from { opacity: 0; transform: translateY(12px); }
  818:           to { opacity: 1; transform: translateY(0); }
  819:         }
  820:         @keyframes confirmCircle {
  821:           to { stroke-dashoffset: 0; }
  822:         }
  823:         @keyframes confirmCheck {
  824:           from { opacity: 0; transform: scale(0.5); }
  825:           to { opacity: 1; transform: scale(1); }
  826:         }
  827:         @media (prefers-reduced-motion: reduce) {
  828:           [style*="confirmCircle"],
  829:           [style*="confirmCheck"],
  830:           .animate-\\[fadeInUp_0\\.3s_ease-out\\] {
  831:             animation: none !important;
  832:             opacity: 1 !important;
  833:             transform: none !important;
  834:             stroke-dashoffset: 0 !important;
  835:           }
  836:         }
  837:       `}</style>
  838: 
  839:       {/* Animated checkmark */}
  840:       <div className="flex justify-center mb-6">
  841:         <div className="relative w-20 h-20">
  842:           <svg
  843:             className="w-20 h-20"
  844:             viewBox="0 0 80 80"
  845:             fill="none"
  846:             xmlns="http://www.w3.org/2000/svg"
  847:           >
  848:             <circle
  849:               cx="40"
  850:               cy="40"
  851:               r="36"
  852:               stroke="#22c55e"
  853:               strokeWidth="4"
  854:               fill="#f0fdf4"
  855:               style={{
  856:                 strokeDasharray: 226,
  857:                 strokeDashoffset: 226,
  858:                 animation: "confirmCircle 0.4s ease-out forwards",
  859:               }}
  860:             />
  861:           </svg>
  862:           <div
  863:             className="absolute inset-0 flex items-center justify-center"
  864:             style={{
  865:               opacity: 0,
  866:               animation: "confirmCheck 0.3s ease-out 0.35s forwards",
  867:             }}
  868:           >
  869:             <Check className="w-10 h-10 text-green-500" strokeWidth={3} />
  870:           </div>
  871:         </div>
  872:       </div>
  873: 
  874:       {/* Title */}
  875:       <h2 className="text-xl font-semibold text-center text-slate-800 mb-6">
  876:         {tr("confirmation.title", "Order sent!")}
  877:       </h2>
  878: 
  879:       {/* Order summary card */}
  880:       <Card className="mb-6">
  881:         <CardContent className="p-4">
  882:           {/* Items list */}
  883:           <div className="space-y-2 mb-3">
  884:             {items.map((item, idx) => (
  885:               <div
  886:                 key={item.dishId || idx}
  887:                 className="flex justify-between items-center text-sm"
  888:               >
  889:                 <span className="text-slate-700">
  890:                   {item.name}{" "}
  891:                   <span className="text-slate-400">x{item.quantity}</span>
  892:                 </span>
  893:                 <span className="text-slate-700 font-medium tabular-nums">
  894:                   {formatPrice(Math.round(item.price * item.quantity * 100) / 100)}
  895:                 </span>
  896:               </div>
  897:             ))}
  898:           </div>
  899: 
  900:           {/* Divider */}
  901:           <div className="border-t border-slate-200 pt-3 mt-3">
  902:             <div className="flex justify-between items-center">
  903:               <span className="font-medium text-slate-800">
  904:                 {tr("confirmation.total", "Total")}
  905:               </span>
  906:               <span className="font-semibold text-slate-800 tabular-nums">
  907:                 {formatPrice(parseFloat(Number(totalAmount).toFixed(2)))}
  908:               </span>
  909:             </div>
  910:           </div>
  911: 
  912:           {/* Client name (pickup/delivery) */}
  913:           {clientName && orderMode !== "hall" && (
  914:             <p className="text-sm text-slate-500 mt-1">
  915:               {tr("confirmation.client_name", "Name")}: {clientName}
  916:             </p>
  917:           )}
  918:         </CardContent>
  919:       </Card>
  920: 
  921:       {/* Action buttons */}
  922:       <div className="space-y-3">
  923:         <Button
  924:           className="w-full h-12 text-white"
  925:           style={{backgroundColor: primaryColor}}
  926:           onClick={onBackToMenu}
  927:         >
  928:           {tr("confirmation.back_to_menu", "Back to menu")}
  929:         </Button>
  930: 
  931:         <Button
  932:           variant="outline"
  933:           className="w-full h-12"
  934:           onClick={onOpenOrders}
  935:         >
  936:           {tr("confirmation.my_orders", "My orders")}
  937:         </Button>
  938: 
  939:         {/* Track order â€" pickup/delivery only (GAP-02: navigate to embedded status view) */}
  940:         {orderMode !== "hall" && publicToken && (
  941:           <Button
  942:             variant="ghost"
  943:             className="w-full h-12"
  944:             style={{color: primaryColor}}
  945:             onClick={() => {
  946:               onTrackOrder(publicToken);
  947:             }}
  948:           >
  949:             {tr("confirmation.track_order", "Track order")}
  950:           </Button>
  951:         )}
  952:       </div>
  953:     </div>
  954:     </div>
  955:   );
  956: }
  957: 
  958: /* ============================================================
  959:    GAP-02: ORDER STATUS SCREEN (embedded)
  960:    Pickup/delivery guests track their order status.
  961:    Renders inside x.jsx as a view â€" no separate /orderstatus route.
  962:    Polls every 10s for status updates.
  963:    ============================================================ */
  964: 
  965: const OS_POLL_INTERVAL_MS = 10000;
  966: const OS_MAX_AGE_HOURS = 24;
  967: const OS_TERMINAL_STATUSES = ["served", "completed", "cancelled"];
  968: const OS_TOKEN_RE = /^[a-z0-9]{2,20}$/;
  969: const OS_SAFE_TEL_RE = /^tel:[+\d()\-. ]+$/;
  970: const OS_STATUS_STEPS = ["new", "in_progress", "ready"];
  971: 
  972: function osGetStepIndex(status) {
  973:   if (status === "accepted") return 1;
  974:   const idx = OS_STATUS_STEPS.indexOf(status);
  975:   return idx >= 0 ? idx : 0;
  976: }
  977: 
  978: function osGetStatusConfig(status, t) {
  979:   const configs = {
  980:     new: { label: t("order_status.status_new"), color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200", icon: Package },
  981:     accepted: { label: t("order_status.status_preparing"), color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-200", icon: Clock },
  982:     in_progress: { label: t("order_status.status_preparing"), color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-200", icon: Clock },
  983:     ready: { label: t("order_status.status_ready"), color: "text-green-600", bg: "bg-green-50", border: "border-green-200", icon: Check },
  984:     served: { label: t("order_status.status_served"), color: "text-slate-500", bg: "bg-slate-50", border: "border-slate-200", icon: Check },
  985:     completed: { label: t("order_status.status_served"), color: "text-slate-500", bg: "bg-slate-50", border: "border-slate-200", icon: Check },
  986:     cancelled: { label: t("order_status.status_cancelled"), color: "text-red-600", bg: "bg-red-50", border: "border-red-200", icon: XCircle },
  987:   };
  988:   return configs[status] || configs.new;
  989: }
  990: 
  991: function OSStatusProgress({ currentStatus, t }) {
  992:   const currentIdx = osGetStepIndex(currentStatus);
  993:   const isCancelled = currentStatus === "cancelled";
  994:   const isTerminal = OS_TERMINAL_STATUSES.includes(currentStatus) || currentStatus === "ready";
  995: 
  996:   const steps = [
  997:     { key: "new", label: t("order_status.step_received") },
  998:     { key: "in_progress", label: t("order_status.step_preparing") },
  999:     { key: "ready", label: t("order_status.step_ready") },
 1000:   ];
 1001: 
 1002:   if (isCancelled) {
 1003:     return (
 1004:       <div className="flex items-center justify-center gap-2 py-4">
 1005:         <XCircle className="w-5 h-5 text-red-500" />
 1006:         <span className="text-red-600 font-medium">{t("order_status.status_cancelled")}</span>
 1007:       </div>
 1008:     );
 1009:   }
 1010: 
 1011:   return (
 1012:     <div className="py-4">
 1013:       <div className="flex items-center justify-between relative">
 1014:         <div className="absolute top-4 left-8 right-8 h-0.5 bg-slate-200" />
 1015:         <div
 1016:           className="absolute top-4 left-8 h-0.5 bg-green-500 transition-all duration-500"
 1017:           style={{
 1018:             width: isTerminal
 1019:               ? "calc(100% - 4rem)"
 1020:               : `calc(${(currentIdx / (steps.length - 1)) * 100}% - ${currentIdx === 0 ? 0 : 2}rem)`,
 1021:           }}
 1022:         />
 1023:         {steps.map((step, idx) => {
 1024:           const isComplete = isTerminal || idx < currentIdx;
 1025:           const isCurrent = !isTerminal && idx === currentIdx;
 1026:           return (
 1027:             <div key={step.key} className="flex flex-col items-center relative z-10">
 1028:               <div
 1029:                 className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
 1030:                   isComplete
 1031:                     ? "bg-green-500 border-green-500"
 1032:                     : isCurrent
 1033:                       ? "bg-white border-orange-400 ring-4 ring-orange-100"
 1034:                       : "bg-white border-slate-200"
 1035:                 }`}
 1036:               >
 1037:                 {isComplete ? (
 1038:                   <Check className="w-4 h-4 text-white" />
 1039:                 ) : isCurrent ? (
 1040:                   <div className="w-2 h-2 rounded-full bg-orange-400 animate-pulse" />
 1041:                 ) : (
 1042:                   <div className="w-2 h-2 rounded-full bg-slate-300" />
 1043:                 )}
 1044:               </div>
 1045:               <span
 1046:                 className={`text-xs mt-2 text-center max-w-[80px] ${
 1047:                   isComplete ? "text-green-600 font-medium" : isCurrent ? "text-orange-600 font-medium" : "text-slate-400"
 1048:                 }`}
 1049:               >
 1050:                 {step.label}
 1051:               </span>
 1052:             </div>
 1053:           );
 1054:         })}
 1055:       </div>
 1056:     </div>
 1057:   );
 1058: }
 1059: 
 1060: function OrderStatusScreen({ token, partnerId: knownPartnerId, onBackToMenu, t }) {
 1061:   const [lastUpdated, setLastUpdated] = useState(null);
 1062:   const [secondsAgo, setSecondsAgo] = useState(0);
 1063: 
 1064:   const {
 1065:     data: orderData,
 1066:     isLoading: loadingOrder,
 1067:     error: orderError,
 1068:     refetch: refetchOrder,
 1069:   } = useQuery({
 1070:     queryKey: ["orderByToken", token],
 1071:     enabled: !!token && OS_TOKEN_RE.test(token),
 1072:     retry: 1,
 1073:     staleTime: OS_POLL_INTERVAL_MS,
 1074:     queryFn: async () => {
 1075:       const orders = await base44.entities.Order.filter({ public_token: token });
 1076:       if (!orders || orders.length === 0) return null;
 1077:       return orders[0];
 1078:     },
 1079:   });
 1080: 
 1081:   const order = orderData || null;
 1082:   const partnerId = order?.partner || knownPartnerId;
 1083:   const orderId = order?.id;
 1084:   const orderStatus = order?.status || "new";
 1085:   const isTerminal = OS_TERMINAL_STATUSES.includes(orderStatus);
 1086: 
 1087:   const isExpired = useMemo(() => {
 1088:     if (!order?.created_date) return false;
 1089:     const created = new Date(order.created_date);
 1090:     return Date.now() - created > OS_MAX_AGE_HOURS * 60 * 60 * 1000;
 1091:   }, [order?.created_date]);
 1092: 
 1093:   const { data: partner } = useQuery({
 1094:     queryKey: ["statusPartner", partnerId],
 1095:     enabled: !!partnerId,
 1096:     retry: 1,
 1097:     queryFn: async () => {
 1098:       const partners = await base44.entities.Partner.filter({ id: partnerId });
 1099:       return partners?.[0] || null;
 1100:     },
 1101:   });
 1102:   const statusPrimaryColor = partner?.primary_color || '#1A1A1A';
 1103: 
 1104:   const { data: orderItems = [] } = useQuery({
 1105:     queryKey: ["statusOrderItems", orderId],
 1106:     enabled: !!orderId,
 1107:     retry: 1,
 1108:     staleTime: Infinity,
 1109:     queryFn: async () => {
 1110:       return await base44.entities.OrderItem.filter({ order: orderId });
 1111:     },
 1112:   });
 1113: 
 1114:   const { data: contactLinks = [] } = useQuery({
 1115:     queryKey: ["statusContactLinks", partnerId],
 1116:     enabled: !!partnerId,
 1117:     retry: 1,
 1118:     staleTime: Infinity,
 1119:     queryFn: async () => {
 1120:       return await base44.entities.PartnerContactLink.filter({ partner: partnerId });
 1121:     },
 1122:   });
 1123: 
 1124:   const phoneLink = useMemo(() => {
 1125:     return contactLinks.find(
 1126:       (link) => link.is_active !== false && typeof link.url === "string" && OS_SAFE_TEL_RE.test(link.url)
 1127:     );
 1128:   }, [contactLinks]);
 1129: 
 1130:   // Polling for status updates
 1131:   // Polling for status updates (closure variable instead of ref)
 1132:   useEffect(() => {
 1133:     if (!token || !order || isTerminal || isExpired) return;
 1134:     const id = setInterval(async () => {
 1135:       try {
 1136:         const result = await refetchOrder();
 1137:         if (result.data) setLastUpdated(new Date());
 1138:       } catch { /* retry on next poll */ }
 1139:     }, OS_POLL_INTERVAL_MS);
 1140:     return () => clearInterval(id);
 1141:   }, [token, order?.id, isTerminal, isExpired, refetchOrder]);
 1142: 
 1143:   // Set initial lastUpdated
 1144:   useEffect(() => {
 1145:     if (order && !lastUpdated) setLastUpdated(new Date());
 1146:   }, [order, lastUpdated]);
 1147: 
 1148:   // "seconds ago" counter â€" stops when order is terminal (P0 fix)
 1149:   useEffect(() => {
 1150:     if (!lastUpdated || isTerminal) return;
 1151:     const tick = () => setSecondsAgo(Math.floor((Date.now() - lastUpdated.getTime()) / 1000));
 1152:     tick();
 1153:     const id = setInterval(tick, 1000);
 1154:     return () => clearInterval(id);
 1155:   }, [lastUpdated, isTerminal]);
 1156: 
 1157:   const formatPrice = (amount) => {
 1158:     if (amount == null) return "";
 1159:     const currency = partner?.currency || "";
 1160:     const symbol = partner?.currency_symbol || currency;
 1161:     const num = Number(amount);
 1162:     if (isNaN(num)) return String(amount);
 1163:     const rounded = Math.round(num * 100) / 100;
 1164:     const formatted = Number.isInteger(rounded) ? rounded.toLocaleString('ru-KZ') : rounded.toFixed(2);
 1165:     return symbol ? `${formatted} ${symbol}` : formatted;
 1166:   };
 1167: 
 1168:   const itemsTotal = useMemo(() => {
 1169:     return orderItems.reduce((sum, item) => {
 1170:       const lineTotal = Number(item.line_total) || (Number(item.dish_price) * Number(item.quantity)) || 0;
 1171:       return sum + lineTotal;
 1172:     }, 0);
 1173:   }, [orderItems]);
 1174: 
 1175:   const displayTotal = order?.total_amount != null ? order.total_amount : itemsTotal;
 1176: 
 1177:   // Invalid token
 1178:   if (!token || !OS_TOKEN_RE.test(token)) {
 1179:     return (
 1180:       <div className="fixed inset-0 z-[60] overflow-y-auto" style={{backgroundColor:'#faf9f7'}}>
 1181:         <div className="min-h-screen flex items-center justify-center p-4">
 1182:           <Card className="w-full max-w-md">
 1183:             <CardContent className="p-8 text-center">
 1184:               <XCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
 1185:               <h2 className="text-lg font-semibold text-slate-800 mb-2">{t("order_status.no_token")}</h2>
 1186:               <p className="text-sm text-slate-500 mb-4">{t("order_status.check_link")}</p>
 1187:               <Button variant="outline" className="min-h-[44px]" onClick={onBackToMenu}>{t("order_status.back_to_menu")}</Button>
 1188:             </CardContent>
 1189:           </Card>
 1190:         </div>
 1191:       </div>
 1192:     );
 1193:   }
 1194: 
 1195:   // Loading
 1196:   if (loadingOrder) {
 1197:     return (
 1198:       <div className="fixed inset-0 z-[60]" style={{backgroundColor:'#faf9f7'}}>
 1199:         <div className="min-h-screen flex items-center justify-center">
 1200:           <Loader2 className="w-8 h-8 animate-spin" style={{color: statusPrimaryColor}} />
 1201:         </div>
 1202:       </div>
 1203:     );
 1204:   }
 1205: 
 1206:   // Network/backend error â€" retryable (PM-074)
 1207:   if (orderError) {
 1208:     return (
 1209:       <div className="fixed inset-0 z-[60] overflow-y-auto" style={{backgroundColor:'#faf9f7'}}>
 1210:         <div className="min-h-screen flex items-center justify-center p-4">
 1211:           <Card className="w-full max-w-md">
 1212:             <CardContent className="p-8 text-center">
 1213:               <XCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
 1214:               <h2 className="text-lg font-semibold text-slate-800 mb-2">{t("error.network_error")}</h2>
 1215:               <p className="text-sm text-slate-500 mb-4">{t("error.check_connection")}</p>
 1216:               <Button variant="outline" className="min-h-[44px]" onClick={() => refetchOrder()}>
 1217:                 {t("common.retry")}
 1218:               </Button>
 1219:             </CardContent>
 1220:           </Card>
 1221:         </div>
 1222:       </div>
 1223:     );
 1224:   }
 1225: 
 1226:   // Order genuinely not found (query succeeded, returned null)
 1227:   if (!order) {
 1228:     return (
 1229:       <div className="fixed inset-0 z-[60] overflow-y-auto" style={{backgroundColor:'#faf9f7'}}>
 1230:         <div className="min-h-screen flex items-center justify-center p-4">
 1231:           <Card className="w-full max-w-md">
 1232:             <CardContent className="p-8 text-center">
 1233:               <XCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
 1234:               <h2 className="text-lg font-semibold text-slate-800 mb-2">{t("order_status.not_found")}</h2>
 1235:               <p className="text-sm text-slate-500 mb-4">{t("order_status.check_link")}</p>
 1236:               <Button variant="outline" className="min-h-[44px]" onClick={onBackToMenu}>{t("order_status.back_to_menu")}</Button>
 1237:             </CardContent>
 1238:           </Card>
 1239:         </div>
 1240:       </div>
 1241:     );
 1242:   }
 1243: 
 1244:   // Expired
 1245:   if (isExpired) {
 1246:     return (
 1247:       <div className="fixed inset-0 z-[60] overflow-y-auto" style={{backgroundColor:'#faf9f7'}}>
 1248:         <div className="min-h-screen flex items-center justify-center p-4">
 1249:           <Card className="w-full max-w-md">
 1250:             <CardContent className="p-8 text-center">
 1251:               <Clock className="w-12 h-12 text-slate-400 mx-auto mb-4" />
 1252:               <h2 className="text-lg font-semibold text-slate-800 mb-2">{t("order_status.expired")}</h2>
 1253:               <Button variant="outline" className="min-h-[44px] mt-4" onClick={onBackToMenu}>{t("order_status.back_to_menu")}</Button>
 1254:             </CardContent>
 1255:           </Card>
 1256:         </div>
 1257:       </div>
 1258:     );
 1259:   }
 1260: 
 1261:   // Main order status view
 1262:   const statusConfig = osGetStatusConfig(orderStatus, t);
 1263:   const StatusIcon = statusConfig.icon;
 1264: 
 1265:   return (
 1266:     <div className="fixed inset-0 z-[60] bg-slate-50 overflow-y-auto">
 1267:       <div className="max-w-md mx-auto px-4 py-6">
 1268:         {/* Back button */}
 1269:         <button
 1270:           className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 mb-4 min-h-[44px]"
 1271:           onClick={onBackToMenu}
 1272:         >
 1273:           <ArrowLeft className="w-4 h-4" />
 1274:           {t("order_status.back_to_menu")}
 1275:         </button>
 1276: 
 1277:         {/* Restaurant header */}
 1278:         <div className="flex items-center gap-3 mb-6">
 1279:           {partner?.logo && (
 1280:             <img src={partner.logo} alt="" referrerPolicy="no-referrer" className="w-10 h-10 rounded-lg object-cover" />
 1281:           )}
 1282:           {partner?.name && (
 1283:             <h1 className="text-base font-semibold text-slate-800">{partner.name}</h1>
 1284:           )}
 1285:         </div>
 1286: 
 1287:         {/* Order number + status badge */}
 1288:         <Card className={`mb-4 border ${statusConfig.border}`}>
 1289:           <CardContent className="p-5">
 1290:             {order.order_number != null && (
 1291:               <>
 1292:                 <p className="text-sm text-slate-500 mb-1">{t("order_status.order_number")}</p>
 1293:                 <p className="text-2xl font-bold text-slate-800 mb-4">#{order.order_number}</p>
 1294:               </>
 1295:             )}
 1296:             <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${statusConfig.bg} ${statusConfig.color}`}>
 1297:               <StatusIcon className="w-4 h-4" />
 1298:               {statusConfig.label}
 1299:             </div>
 1300:             <OSStatusProgress currentStatus={orderStatus} t={t} />
 1301:             {lastUpdated && !isTerminal && (
 1302:               <p className="text-xs text-slate-400 mt-2">
 1303:                 {t("order_status.last_updated")}: {secondsAgo < 5
 1304:                   ? t("order_status.just_now")
 1305:                   : t("order_status.seconds_ago", { seconds: secondsAgo })}
 1306:               </p>
 1307:             )}
 1308:           </CardContent>
 1309:         </Card>
 1310: 
 1311:         {/* Order items */}
 1312:         {orderItems.length > 0 && (
 1313:           <Card className="mb-4">
 1314:             <CardContent className="p-4">
 1315:               <p className="text-sm font-medium text-slate-600 mb-3">{t("order_status.your_order")}</p>
 1316:               <div className="space-y-2">
 1317:                 {orderItems.map((item, idx) => (
 1318:                   <div key={item.id || idx} className="flex justify-between items-center text-sm">
 1319:                     <span className="text-slate-700">
 1320:                       {item.dish_name} <span className="text-slate-400">x{item.quantity}</span>
 1321:                     </span>
 1322:                     <span className="text-slate-700 font-medium tabular-nums">
 1323:                       {formatPrice(item.line_total != null ? item.line_total : item.dish_price * item.quantity)}
 1324:                     </span>
 1325:                   </div>
 1326:                 ))}
 1327:               </div>
 1328:               <div className="border-t border-slate-200 pt-3 mt-3">
 1329:                 <div className="flex justify-between items-center">
 1330:                   <span className="font-medium text-slate-800">{t("order_status.total")}</span>
 1331:                   <span className="font-semibold text-slate-800 tabular-nums">{formatPrice(displayTotal)}</span>
 1332:                 </div>
 1333:               </div>
 1334:               {order.discount_amount > 0 && (
 1335:                 <p className="text-xs text-green-600 mt-2">
 1336:                   {t("order_status.discount")}: -{formatPrice(order.discount_amount)}
 1337:                 </p>
 1338:               )}
 1339:             </CardContent>
 1340:           </Card>
 1341:         )}
 1342: 
 1343:         {/* Contact restaurant */}
 1344:         {phoneLink && (
 1345:           <Card className="mb-4">
 1346:             <CardContent className="p-4">
 1347:               <p className="text-sm text-slate-600 mb-3">{t("order_status.questions")}</p>
 1348:               <a
 1349:                 href={phoneLink.url}
 1350:                 className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors min-h-[44px]"
 1351:               >
 1352:                 <Phone className="w-5 h-5" style={{color: statusPrimaryColor}} />
 1353:                 <span className="text-sm font-medium" style={{color: statusPrimaryColor}}>{phoneLink.url.replace("tel:", "")}</span>
 1354:               </a>
 1355:             </CardContent>
 1356:           </Card>
 1357:         )}
 1358: 
 1359:         {/* Terminal / refresh info */}
 1360:         {isTerminal && (
 1361:           <div className="text-center pt-2">
 1362:             <p className="text-sm text-slate-500 mb-3">
 1363:               {orderStatus === "cancelled" ? t("order_status.order_cancelled_info") : t("order_status.order_complete_info")}
 1364:             </p>
 1365:           </div>
 1366:         )}
 1367:         {!isTerminal && (
 1368:           <div className="text-center pt-2">
 1369:             <Button
 1370:               variant="ghost"
 1371:               size="sm"
 1372:               className="text-slate-400 hover:text-slate-600"
 1373:               onClick={async () => {
 1374:                 const result = await refetchOrder();
 1375:                 if (result.data) setLastUpdated(new Date());
 1376:               }}
 1377:             >
 1378:               <RefreshCw className="w-4 h-4 mr-1" />
 1379:               {t("order_status.refresh")}
 1380:             </Button>
 1381:           </div>
 1382:         )}
 1383:       </div>
 1384:     </div>
 1385:   );
 1386: }
 1387: 
 1388: /* ============================================================
 1389:    TABLE CODE VERIFICATION HELPERS (simplified)
 1390:    P0-3: Only use Table.code for verification
 1391:    ============================================================ */
 1392: 
 1393: // Extract digits only from any value
 1394: const digits = (v) => String(v || "").replace(/\D/g, "");
 1395: 
 1396: // Normalize link fields from Base44 (CODE-026)
 1397: function getLinkId(field) {
 1398:   if (field == null) return null;
 1399:   if (typeof field === "string" || typeof field === "number") return String(field);
 1400:   if (typeof field === "object") {
 1401:     const v = field.id ?? field._id ?? field.value ?? null;
 1402:     if (typeof v === "string" || typeof v === "number") return String(v);
 1403:     if (v && typeof v === "object") {
 1404:       const vv = v.id ?? v._id ?? null;
 1405:       if (typeof vv === "string" || typeof vv === "number") return String(vv);
 1406:     }
 1407:   }
 1408:   return null;
 1409: }
 1410: 
 1411: // Helper: format order creation time (handles created_at or created_date)
 1412: function formatOrderTime(order) {
 1413:   const ts = order?.created_at || order?.created_date || order?.createdAt || null;
 1414:   if (!ts) return "";
 1415:   const d = new Date(ts);
 1416:   if (Number.isNaN(d.getTime())) return "";
 1417:   return d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
 1418: }
 1419: 
 1420: export default function X() {
 1421:   const { lang, setLang, t: rawT } = useI18n();
 1422:   const t = makeSafeT(rawT, lang);
 1423: 
 1424:   // Safe translation with explicit fallback (kept for backward compat)
 1425:   const tr = (key, fallback) => {
 1426:     const val = t(key);
 1427:     return val || fallback;
 1428:   };
 1429: 
 1430:   const location = useLocation();
 1431:   const queryClient = useQueryClient();
 1432: 
 1433:   const searchParams = useMemo(
 1434:     () => new URLSearchParams(location.search),
 1435:     [location.search]
 1436:   );
 1437: 
 1438:   // partner required
 1439:   const partnerParamRaw = (searchParams.get("partner") || searchParams.get("p") || "").trim();
 1440: 
 1441:   // lang param from URL
 1442:   const langParam = (searchParams.get("lang") || "").trim().toUpperCase();
 1443: 
 1444:   // UI state
 1445:   const [orderMode, setOrderMode] = useState(() => {
 1446:     const modeParam = new URLSearchParams(location.search).get("mode");
 1447:     return normalizeMode(modeParam);
 1448:   });
 1449: 
 1450:   // GAP-02: Restore order status view from URL param (?track=<token>)
 1451:   const initialTrackToken = useMemo(() => {
 1452:     const p = new URLSearchParams(location.search).get("track");
 1453:     return p && /^[a-z0-9]{2,20}$/.test(p) ? p : null;
 1454:   }, []);
 1455: 
 1456:   const [view, setView] = useState(initialTrackToken ? "orderstatus" : "menu"); /* menu | checkout | confirmation | orderstatus */
 1457: 
 1458:   // GAP-01: Order Confirmation Screen state
 1459:   const [confirmationData, setConfirmationData] = useState(null);
 1460: 
 1461:   // GAP-02: Order Status tracking token (refresh-safe via ?track= URL param)
 1462:   const [orderStatusToken, setOrderStatusToken] = useState(initialTrackToken);
 1463:   
 1464:   // TASK-260203-01: Drawer state
 1465:   const [drawerMode, setDrawerMode] = useState(null); // 'cart' | null
 1466: 
 1467:   // Just-in-time table confirmation (Batch A+5 Fix 1)
 1468:   const [showTableConfirmSheet, setShowTableConfirmSheet] = useState(false);
 1469:   const pendingSubmitRef = useRef(false);
 1470: 
 1471:   // PM-105: Ref-based overlay stack for Android back button priority
 1472:   const overlayStackRef = useRef([]);
 1473:   const isPopStateClosingRef = useRef(false);
 1474:   const isProgrammaticCloseRef = useRef(false);
 1475: 
 1476:   const pushOverlay = useCallback((name) => {
 1477:     overlayStackRef.current = [...overlayStackRef.current.filter(n => n !== name), name];
 1478:     window.history.pushState({ sheet: name }, '');
 1479:   }, []);
 1480: 
 1481:   const popOverlay = useCallback((name) => {
 1482:     overlayStackRef.current = overlayStackRef.current.filter(n => n !== name);
 1483:     if (!isPopStateClosingRef.current) {
 1484:       isProgrammaticCloseRef.current = true;
 1485:       window.history.back();
 1486:     }
 1487:   }, []);
 1488:   
 1489:   const [activeCategoryKey, setActiveCategoryKey] = useState("all");
 1490:   const [cart, setCart] = useState([]); // { dishId, name, price, quantity }
 1491:   const cartRestoredRef = useRef(false);
 1492: 
 1493:   // Mobile breakpoint detection
 1494:   const [isMobile, setIsMobile] = useState(() => {
 1495:     if (typeof window === 'undefined') return false;
 1496:     return window.matchMedia("(max-width: 767px)").matches;
 1497:   });
 1498: 
 1499:   // Mobile layout preference (tile | list) â€" S72: default list for mobile-first UX
 1500:   const [mobileLayout, setMobileLayout] = useState('list');
 1501: 
 1502:   // Redirect banner state
 1503:   const [redirectBanner, setRedirectBanner] = useState(null);
 1504: 
 1505:   // Dish reviews modal state
 1506:   const [selectedDishId, setSelectedDishId] = useState(null);
 1507: 
 1508:   // PM-102: Dish detail dialog state
 1509:   const [detailDish, setDetailDish] = useState(null);
 1510: 
 1511:   // Form
 1512:   const [clientName, setClientName] = useState("");
 1513:   const [clientPhone, setClientPhone] = useState("");
 1514:   const [deliveryAddress, setDeliveryAddress] = useState("");
 1515:   const [comment, setComment] = useState("");
 1516:   const [errors, setErrors] = useState({});
 1517: 
 1518:   const [isSubmitting, setIsSubmitting] = useState(false);
 1519:   const [submitError, setSubmitError] = useState(null);
 1520: 
 1521:   // Guest code (4-digit code for showing to waiter)
 1522:   const [guestCode, setGuestCode] = useState(null);
 1523: 
 1524:   // Hall UI state (not in session hook)
 1525:   const [splitType, setSplitType] = useState('single'); // 'single' | 'all'
 1526:   const [otherGuestsExpanded, setOtherGuestsExpanded] = useState(false);
 1527:   const [guestNameInput, setGuestNameInput] = useState(() => {
 1528:     try { return localStorage.getItem('menuapp_guest_name') || ''; } catch (e) { return ''; }
 1529:   });
 1530:   const [isEditingName, setIsEditingName] = useState(false);
 1531: 
 1532:   // Bill request state
 1533:   const [billRequested, setBillRequested] = useState(false);
 1534:   const [billCooldown, setBillCooldown] = useState(false);
 1535: 
 1536:   // Rating flow state (TASK-260130-09)
 1537:   const [hasRatedInSession, setHasRatedInSession] = useState(false);
 1538:   const [ratingSavingByItemId, setRatingSavingByItemId] = useState({});
 1539: 
 1540:   // Partner fetch (id or slug) - MUST BE FIRST before any partner dependencies
 1541:   const { data: partner, isLoading: loadingPartner, error: partnerError, refetch: refetchPartner } = useQuery({
 1542:     queryKey: ["publicPartner", partnerParamRaw],
 1543:     enabled: !!partnerParamRaw,
 1544:     retry: shouldRetry,
 1545:     queryFn: async () => {
 1546:       const p = partnerParamRaw;
 1547:       if (!p) return null;
 1548: 
 1549:       const byIdFirst = looksLikePartnerId(p);
 1550:       let primaryError = null;
 1551: 
 1552:       try {
 1553:         const res = await base44.entities.Partner.filter(byIdFirst ? { id: p } : { slug: p });
 1554:         if (res?.[0]) return res[0];
 1555:       } catch (e) {
 1556:         primaryError = e;
 1557:       }
 1558: 
 1559:       // Fallback lookup â€" let errors propagate to React Query (PM-070)
 1560:       const res2 = await base44.entities.Partner.filter(byIdFirst ? { slug: p } : { id: p });
 1561:       if (res2?.[0]) return res2[0];
 1562:       if (primaryError) throw primaryError;
 1563:       return null;
 1564:     },
 1565:   });
 1566: 
 1567:   const primaryColor = partner?.primary_color || '#1A1A1A';
 1568: 
 1569:   // Breakpoint listener
 1570:   useEffect(() => {
 1571:     const mediaQuery = window.matchMedia("(max-width: 767px)");
 1572:     
 1573:     const handleChange = (e) => {
 1574:       setIsMobile(e.matches);
 1575:     };
 1576:     
 1577:     mediaQuery.addEventListener('change', handleChange);
 1578:     
 1579:     return () => {
 1580:       mediaQuery.removeEventListener('change', handleChange);
 1581:     };
 1582:   }, []);
 1583: 
 1584:   // Load mobile layout preference from localStorage
 1585:   useEffect(() => {
 1586:     if (!partner) return;
 1587:     
 1588:     const partnerKey = partner.id || partner._id || partner.slug || partner.code;
 1589:     if (!partnerKey) return;
 1590:     
 1591:     try {
 1592:       const storageKey = `menuMobileLayout:${partnerKey}`;
 1593:       const saved = localStorage.getItem(storageKey);
 1594:       
 1595:       if (saved === 'tile' || saved === 'list') {
 1596:         setMobileLayout(saved);
 1597:       } else {
 1598:         // Default based on partner setting â€" S72: default list unless partner set 2-col grid
 1599:         const mobileGrid = Number(partner.menu_grid_mobile ?? 1);
 1600:         const defaultLayout = mobileGrid === 2 ? 'tile' : 'list';
 1601:         setMobileLayout(defaultLayout);
 1602:       }
 1603:     } catch (e) {
 1604:       // Failed to load mobile layout preference â€" silent in prod
 1605:     }
 1606:   }, [partner?.id, partner?._id, partner?.slug, partner?.code]);
 1607: 
 1608:   // Save mobile layout preference to localStorage
 1609:   const handleSetMobileLayout = (layout) => {
 1610:     setMobileLayout(layout);
 1611:     
 1612:     if (!partner) return;
 1613:     
 1614:     const partnerKey = partner.id || partner._id || partner.slug || partner.code;
 1615:     if (!partnerKey) return;
 1616:     
 1617:     try {
 1618:       const storageKey = `menuMobileLayout:${partnerKey}`;
 1619:       localStorage.setItem(storageKey, layout);
 1620:     } catch (e) {
 1621:       // Failed to save mobile layout preference â€" silent in prod
 1622:     }
 1623:   };
 1624: 
 1625:   // Save cart to localStorage on every change
 1626:   // BUG-PM-005: guard against saving empty cart before restore completes
 1627:   useEffect(() => {
 1628:     if (!partner?.id) return;
 1629:     if (!cartRestoredRef.current) return;
 1630:     saveCartToStorage(partner.id, cart);
 1631:   }, [cart, partner?.id]);
 1632: 
 1633:   // PM-153: Auto-save guest name to localStorage on every change (survives Chrome kill)
 1634:   useEffect(() => {
 1635:     if (!guestNameInput) return;
 1636:     try { localStorage.setItem('menuapp_guest_name', guestNameInput); } catch(e) {}
 1637:   }, [guestNameInput]);
 1638: 
 1639:   // Restore cart from localStorage on page load (once)
 1640:   // BUG-PM-005: mark restored before setCart to prevent save effect from firing on stale empty cart
 1641:   useEffect(() => {
 1642:     if (cartRestoredRef.current) return;
 1643:     if (!partner?.id) return;
 1644:     cartRestoredRef.current = true;
 1645: 
 1646:     const savedCart = getCartFromStorage(partner.id);
 1647:     if (savedCart && savedCart.length > 0 && cart.length === 0) {
 1648:       setCart(savedCart);
 1649:     }
 1650:   }, [partner?.id]);
 1651: 
 1652:   // Scroll refs
 1653:   const sectionRefs = useRef({});
 1654:   const chipRefs = useRef({});
 1655:   const listTopRef = useRef(null);
 1656:   const isManualScroll = useRef(false);
 1657:   const submitLockRef = useRef(false); // CODE-024: protect from double-tap
 1658:   const viewTransitionTimerRef = useRef(null);
 1659:   const codeInputRef = useRef(null); // PM-088: ref for table code hidden input
 1660:   const autoSubmitTimerRef = useRef(null); // PM-075: cleanup for auto-submit timeout
 1661: 
 1662:   // Cleanup view transition timer on unmount
 1663:   useEffect(() => {
 1664:     return () => {
 1665:       if (viewTransitionTimerRef.current) clearTimeout(viewTransitionTimerRef.current);
 1666:     };
 1667:   }, []);
 1668: 
 1669:   // GAP-01: Dismiss confirmation screen and return to menu
 1670:   const dismissConfirmation = useCallback(() => {
 1671:     setConfirmationData(null);
 1672:     setOrderStatusToken(null);
 1673:     setView("menu");
 1674:   }, []);
 1675: 
 1676:   // GAP-01: Show confirmation screen (no auto-dismiss â€" user navigates via buttons)
 1677:   const showConfirmation = useCallback((data) => {
 1678:     setConfirmationData(data);
 1679:     setView("confirmation");
 1680:     popOverlay('cart');
 1681:     setDrawerMode(null);
 1682:   }, []);
 1683: 
 1684:   // GAP-02: Navigate from confirmation to order status tracking
 1685:   const handleTrackOrder = useCallback((token) => {
 1686:     setConfirmationData(null);
 1687:     setOrderStatusToken(token);
 1688:     setView("orderstatus");
 1689:     // Mirror token into URL for refresh resilience
 1690:     const url = new URL(window.location.href);
 1691:     url.searchParams.set("track", token);
 1692:     window.history.replaceState({}, "", url.toString());
 1693:   }, []);
 1694: 
 1695:   // GAP-02: Dismiss order status and return to menu
 1696:   const dismissOrderStatus = useCallback(() => {
 1697:     setOrderStatusToken(null);
 1698:     setView("menu");
 1699:     // Remove track param from URL
 1700:     const url = new URL(window.location.href);
 1701:     url.searchParams.delete("track");
 1702:     window.history.replaceState({}, "", url.toString());
 1703:   }, []);
 1704: 
 1705:   // Change 2a/2c: Scroll to top when switching to checkout, confirmation, or orderstatus
 1706:   useEffect(() => {
 1707:     if (view === "checkout" || view === "confirmation" || view === "orderstatus") {
 1708:       window.scrollTo({ top: 0, behavior: 'smooth' });
 1709:     }
 1710:   }, [view]);
 1711: 
 1712:   // Language change handler (updates URL)
 1713:   const handleLangChange = (newLang) => {
 1714:     setLang(newLang);
 1715:     const url = new URL(window.location.href);
 1716:     url.searchParams.set("lang", newLang);
 1717:     window.history.replaceState({}, "", url.toString());
 1718:   };
 1719: 
 1720:   // Contact link click handler (SEC-021: XSS protection + noopener)
 1721:   const handleContactClick = (link) => {
 1722:     const url = String(link.url || "");
 1723:     if (!isSafeUrl(url)) {
 1724:       toast.error(t('error.invalid_link'), { id: 'mm1' });
 1725:       return;
 1726:     }
 1727:     if (url.startsWith("tel:") || url.startsWith("mailto:")) {
 1728:       window.location.href = url;
 1729:     } else {
 1730:       window.open(url, "_blank", "noopener,noreferrer");
 1731:     }
 1732:   };
 1733: 
 1734:   // Hall table verification hook
 1735:   const {
 1736:     tableCodeParam,
 1737:     resolvedTable,
 1738:     isHallMode,
 1739:     tableCodeInput,
 1740:     setTableCodeInput,
 1741:     isVerifyingCode,
 1742:     verifiedByCode,
 1743:     verifiedTableId,
 1744:     verifiedTable,
 1745:     codeVerificationError,
 1746:     verifyTableCode,
 1747:   } = useHallTable({ partner, location, orderMode, t });
 1748: 
 1749:   // Auto-clear code input after wrong entry (PM-069)
 1750:   useEffect(() => {
 1751:     if (codeVerificationError && !isVerifyingCode) {
 1752:       const timer = setTimeout(() => {
 1753:         if (typeof setTableCodeInput === 'function') setTableCodeInput('');
 1754:       }, 500);
 1755:       return () => clearTimeout(timer);
 1756:     }
 1757:   }, [codeVerificationError, isVerifyingCode]);
 1758: 
 1759:   // Helper for saving table selection (used by help requests and other features)
 1760:   const saveTableSelection = (partnerId, tableId) => {
 1761:     if (!partnerId || !tableId) return;
 1762:     try {
 1763:       const key = `menuApp_table_${partnerId}`;
 1764:       localStorage.setItem(
 1765:         key,
 1766:         JSON.stringify({ partnerId, tableId, timestamp: Date.now() })
 1767:       );
 1768:     } catch (e) {
 1769:       /* silent â€" localStorage save is best-effort */
 1770:     }
 1771:   };
 1772: 
 1773:   // Hall settings (simplified - only guest code)
 1774:   const hallGuestCodeEnabled = partner?.hall_guest_code_enabled === true;
 1775: 
 1776:   // Set language from URL param or partner default
 1777:   useEffect(() => {
 1778:     if (!partner) return;
 1779:     
 1780:     const partnerDefault = partner.default_language || "RU";
 1781:     const enabledLangs = Array.isArray(partner.enabled_languages) && partner.enabled_languages.length > 0
 1782:       ? partner.enabled_languages
 1783:       : [partnerDefault];
 1784:     
 1785:     if (langParam && enabledLangs.includes(langParam)) {
 1786:       if (lang !== langParam) setLang(langParam);
 1787:     } else if (!enabledLangs.includes(lang)) {
 1788:       setLang(partnerDefault);
 1789:     }
 1790:   }, [partner?.id, partner?.default_language, langParam]);
 1791:   // P0-7: Removed hallTableSelectEnabled - no dropdown
 1792: 
 1793:   // P0-1: Table verified ONLY when actually resolved or verified by code input
 1794:   // Removed hasTableInUrl from condition - URL param alone doesn't mean verified
 1795:   const isTableVerified = isHallMode && (!!resolvedTable?.id || verifiedByCode);
 1796: 
 1797:   // Table code config (for Bottom Sheet â€" PM-064)
 1798:   const tableCodeLength = useMemo(() => {
 1799:     const n = Number(partner?.table_code_length);
 1800:     return (Number.isFinite(n) && n > 0) ? Math.max(3, Math.min(8, Math.round(n))) : 4;
 1801:   }, [partner?.table_code_length]);
 1802: 
 1803:   // P0-7: Removed activeTables query - no dropdown needed
 1804: 
 1805:   // P0-2: currentTableId only from resolved table or code verification
 1806:   const currentTableId = resolvedTable?.id || verifiedTableId || null;
 1807:   
 1808:   // Current table object for display (from QR resolve or code verify)
 1809:   const currentTable = resolvedTable || verifiedTable || null;
 1810: 
 1811:   // Help / ServiceRequest hook
 1812:   const {
 1813:     isHelpModalOpen,
 1814:     setIsHelpModalOpen,
 1815:     selectedHelpType,
 1816:     helpComment,
 1817:     setHelpComment,
 1818:     isSendingHelp,
 1819:     helpSubmitError,
 1820:     fabSuccess,
 1821:     hasActiveRequest,
 1822:     handleOpenHelpModal,
 1823:     handlePresetSelect,
 1824:     submitHelpRequest,
 1825:   } = useHelpRequests({ partner, currentTableId, t, toast, isRateLimitError, saveTableSelection });
 1826: 
 1827:   // HD-01..HD-08: Help drawer mini-ticket board state
 1828:   const HELP_SYNC_INTERVAL_MS = 5000;
 1829:   const HELP_STALE_AFTER_MS = HELP_SYNC_INTERVAL_MS * 3;
 1830:   const HELP_RESTORE_TTL_MS = 6 * 60 * 60 * 1000;
 1831:   const HELP_MATCH_GRACE_MS = 2 * 60 * 1000;
 1832:   const HELP_RESOLVED_HIDE_MS = 4000;
 1833:   const HELP_CLOSED_HIDE_MS = 2000;
 1834:   const HELP_REQUEST_TYPES = useMemo(() => new Set([
 1835:     'call_waiter', 'bill', 'plate', 'napkins', 'utensils', 'clear_table', 'other',
 1836:     'menu', // legacy — keep readable for backward compat; NOT shown in SOS grid
 1837:   ]), []);
 1838:   const HELP_ACTIVE_SERVER_STATUSES = useMemo(() => new Set(['new', 'in_progress']), []);
 1839:   const HELP_DONE_SERVER_STATUSES = useMemo(() => new Set(['done']), []);
 1840:   const HELP_COOLDOWN_SECONDS = useMemo(() => ({
 1841:     call_waiter: 90, bill: 150, plate: 120, napkins: 120,
 1842:     utensils: 120, clear_table: 120, other: 120,
 1843:     menu: 240, // legacy
 1844:   }), []);
 1845:   const HELP_CARD_LABELS = useMemo(() => ({
 1846:     call_waiter: tr('help.call_waiter', 'Call a waiter'),
 1847:     bill: tr('help.get_bill', 'Bill'),
 1848:     plate: tr('help.plate', 'Extra plate'),
 1849:     napkins: tr('help.napkins', 'Napkins'),
 1850:     utensils: tr('help.utensils', 'Utensils'),
 1851:     clear_table: tr('help.clear_table', 'Clear the table'),
 1852:     other: tr('help.other_label', 'Other'),
 1853:     menu: tr('help.menu', 'Paper menu'), // legacy
 1854:   }), [tr]);
 1855:   const HELP_CARD_SHORT_LABELS = useMemo(() => ({
 1856:     call_waiter: tr('help.call_waiter_short', 'Call'),
 1857:     bill: tr('help.get_bill_short', 'Bill'),
 1858:     plate: tr('help.plate_short', 'Plate'),
 1859:     napkins: tr('help.napkins_short', 'Napkins'),
 1860:     utensils: tr('help.utensils_short', 'Utensils'),
 1861:     clear_table: tr('help.clear_table_short', 'Clear'),
 1862:     other: tr('help.other_label', 'Other'),
 1863:   }), [tr]);
 1864:   // SOS v6.0: Urgency thresholds (seconds)
 1865:   const HELP_URGENCY_THRESHOLDS = useMemo(() => ({
 1866:     std:  { amber: 480, red: 900  },   // 8m / 15m
 1867:     bill: { amber: 300, red: 600  },   // 5m / 10m
 1868:   }), []);
 1869:   const HELP_URGENCY_GROUP = useMemo(() => ({
 1870:     call_waiter: 'std', bill: 'bill', plate: 'std', napkins: 'std',
 1871:     utensils: 'std', clear_table: 'std', other: 'std',
 1872:   }), []);
 1873:   const SOS_BUTTONS = useMemo(() => [
 1874:     { id: 'call_waiter', emoji: '🙋', label: HELP_CARD_LABELS.call_waiter, shortLabel: HELP_CARD_SHORT_LABELS.call_waiter },
 1875:     { id: 'bill', emoji: '🧾', label: HELP_CARD_LABELS.bill, shortLabel: HELP_CARD_SHORT_LABELS.bill },
 1876:     { id: 'plate', emoji: '🍽️', label: HELP_CARD_LABELS.plate, shortLabel: HELP_CARD_SHORT_LABELS.plate },
 1877:     { id: 'napkins', icon: 'layers', label: HELP_CARD_LABELS.napkins, shortLabel: HELP_CARD_SHORT_LABELS.napkins },
 1878:     { id: 'utensils', emoji: '🍴', label: HELP_CARD_LABELS.utensils, shortLabel: HELP_CARD_SHORT_LABELS.utensils },
 1879:     { id: 'clear_table', emoji: '🗑️', label: HELP_CARD_LABELS.clear_table, shortLabel: HELP_CARD_SHORT_LABELS.clear_table },
 1880:   ], [HELP_CARD_LABELS, HELP_CARD_SHORT_LABELS]);
 1881: 
 1882:   const URGENCY_STYLES = {
 1883:     neutral: { bg: 'bg-orange-50', border: 'border-orange-500', label: 'text-orange-800', timer: 'text-orange-500', xBg: 'bg-orange-500/15', xColor: 'text-orange-800' },
 1884:     amber: { bg: 'bg-amber-50', border: 'border-amber-500', label: 'text-amber-900', timer: 'text-amber-600', xBg: 'bg-amber-500/20', xColor: 'text-amber-800' },
 1885:     red: { bg: 'bg-red-50', border: 'border-red-500', label: 'text-red-900', timer: 'text-red-600', xBg: 'bg-red-500/20', xColor: 'text-red-800' },
 1886:   };
 1887: 
 1888:   const getHelpUrgency = useCallback((type, sentAt) => {
 1889:     if (!sentAt) return 'neutral';
 1890:     const elapsedSec = Math.floor((Date.now() - sentAt) / 1000);
 1891:     const group = HELP_URGENCY_GROUP[type] || 'std';
 1892:     const thr = HELP_URGENCY_THRESHOLDS[group];
 1893:     if (elapsedSec >= thr.red) return 'red';
 1894:     if (elapsedSec >= thr.amber) return 'amber';
 1895:     return 'neutral';
 1896:   }, [HELP_URGENCY_GROUP, HELP_URGENCY_THRESHOLDS]);
 1897: 
 1898:   const getHelpTimerStr = useCallback((sentAt) => {
 1899:     if (!sentAt) return '';
 1900:     const elapsedSec = Math.floor((Date.now() - sentAt) / 1000);
 1901:     if (elapsedSec < 60) return '<1м';
 1902:     const min = Math.floor(elapsedSec / 60);
 1903:     return `${min}м`;
 1904:   }, []);
 1905: 
 1906:   const [requestStates, setRequestStates] = useState({});
 1907:   const hasLoadedHelpStatesRef = useRef(false);
 1908:   const [undoToast, setUndoToast] = useState(null); // { type, rowId, message?, tableId, expiresAt, timeoutId }
 1909:   const [showOtherForm, setShowOtherForm] = useState(false);
 1910:   const [timerTick, setTimerTick] = useState(0);
 1911:   const pendingQuickSendRef = useRef(null); // { type, action, rowId, message }
 1912:   const [pendingHelpActionTick, setPendingHelpActionTick] = useState(0);
 1913:   const currentTableIdRef = useRef(currentTableId);
 1914:   const [isHelpRestoring, setIsHelpRestoring] = useState(false);
 1915:   const [isHelpOnline, setIsHelpOnline] = useState(() => (typeof navigator === 'undefined' ? true : navigator.onLine));
 1916:   const [highlightedTicket, setHighlightedTicket] = useState(null); // SOS v6.0 — kept for hook order, no longer used in JSX
 1917:   const [isTicketExpanded, setIsTicketExpanded] = useState(false); // SOS v6.0 — kept for hook order, no longer used in JSX
 1918:   const [cancelConfirmType, setCancelConfirmType] = useState(null); // SOS v6.0 cancel confirm
 1919: 
 1920:   useEffect(() => {
 1921:     currentTableIdRef.current = currentTableId;
 1922:   }, [currentTableId]);
 1923: 
 1924:   useEffect(() => {
 1925:     const handleOnline = () => setIsHelpOnline(true);
 1926:     const handleOffline = () => setIsHelpOnline(false);
 1927:     window.addEventListener('online', handleOnline);
 1928:     window.addEventListener('offline', handleOffline);
 1929:     return () => {
 1930:       window.removeEventListener('online', handleOnline);
 1931:       window.removeEventListener('offline', handleOffline);
 1932:     };
 1933:   }, []);
 1934: 
 1935:   const getHelpCooldownMs = useCallback((type) => {
 1936:     return (HELP_COOLDOWN_SECONDS[type] || HELP_COOLDOWN_SECONDS.other || 120) * 1000;
 1937:   }, [HELP_COOLDOWN_SECONDS]);
 1938: 
 1939:   const normalizeHelpMessage = useCallback((value) => String(value || '').trim(), []);
 1940:   const getHelpMessageKey = useCallback((value) => normalizeHelpMessage(value).toLowerCase(), [normalizeHelpMessage]);
 1941: 
 1942:   const parseHelpTimestamp = useCallback((value) => {
 1943:     const ms = value ? new Date(value).getTime() : NaN;
 1944:     return Number.isFinite(ms) ? ms : null;
 1945:   }, []);
 1946: 
 1947:   const getNormalizedHelpState = useCallback((type, state, now = Date.now()) => {
 1948:     if (!state) return null;
 1949: 
 1950:     const message = normalizeHelpMessage(state.message || state.comment);
 1951:     const sentAt = Number(state.sentAt) || parseHelpTimestamp(state.sentAt) || null;
 1952:     const reminderCount = Math.max(0, Number(state.reminderCount) || 0);
 1953:     const lastReminderAt = Number(state.lastReminderAt) || parseHelpTimestamp(state.lastReminderAt) || null;
 1954:     const remindCooldownUntil =
 1955:       Number(state.remindCooldownUntil) ||
 1956:       parseHelpTimestamp(state.remindCooldownUntil) ||
 1957:       ((lastReminderAt || sentAt) ? (lastReminderAt || sentAt) + getHelpCooldownMs(type) : null);
 1958: 
 1959:     if (!sentAt && state.status !== 'closed_by_guest' && state.status !== 'resolved') return null;
 1960: 
 1961:     if (state.status === 'closed_by_guest' || state.status === 'resolved') {
 1962:       return {
 1963:         ...state,
 1964:         id: state.id || (type === 'other' ? `other-${sentAt || now}` : type),
 1965:         message,
 1966:         sentAt: sentAt || now,
 1967:         reminderCount,
 1968:         lastReminderAt,
 1969:         remindCooldownUntil,
 1970:         isActive: false,
 1971:         isVisible: !state.terminalHideAt || state.terminalHideAt > now,
 1972:       };
 1973:     }
 1974: 
 1975:     if (state.status === 'sending') {
 1976:       return {
 1977:         ...state,
 1978:         id: state.id || (type === 'other' ? `other-${sentAt || now}` : type),
 1979:         message,
 1980:         sentAt,
 1981:         reminderCount,
 1982:         lastReminderAt,
 1983:         remindCooldownUntil,
 1984:         isActive: true,
 1985:         isVisible: true,
 1986:       };
 1987:     }
 1988: 
 1989:     const cooldownActive = Boolean(remindCooldownUntil && remindCooldownUntil > now);
 1990:     const normalizedStatus = cooldownActive
 1991:       ? (reminderCount > 0 ? 'reminded' : 'sent')
 1992:       : 'remind_available';
 1993: 
 1994:     return {
 1995:       ...state,
 1996:       id: state.id || (type === 'other' ? `other-${sentAt}` : type),
 1997:       status: normalizedStatus,
 1998:       message,
 1999:       sentAt,
 2000:       reminderCount,
 2001:       lastReminderAt,
 2002:       remindCooldownUntil,
 2003:       isActive: true,
 2004:       isVisible: true,
 2005:     };
 2006:   }, [getHelpCooldownMs, normalizeHelpMessage, parseHelpTimestamp]);
 2007: 
 2008:   const ticketRows = useMemo(() => {
 2009:     const now = Date.now();
 2010:     const list = [];
 2011: 
 2012:     Object.entries(requestStates).forEach(([type, state]) => {
 2013:       if (type === 'other') {
 2014:         const rows = Array.isArray(state) ? state : [state].filter(Boolean);
 2015:         rows.forEach((entry) => {
 2016:           const normalized = getNormalizedHelpState('other', entry, now);
 2017:           if (normalized && (normalized.isVisible || normalized.isActive)) {
 2018:             list.push({ ...normalized, type: 'other', id: normalized.id });
 2019:           }
 2020:         });
 2021:         return;
 2022:       }
 2023: 
 2024:       const normalized = getNormalizedHelpState(type, state, now);
 2025:       if (normalized && (normalized.isVisible || normalized.isActive)) {
 2026:         list.push({ ...normalized, type, id: normalized.id || type });
 2027:       }
 2028:     });
 2029: 
 2030:     return list.sort((a, b) => {
 2031:       if (a.isActive !== b.isActive) return a.isActive ? -1 : 1;
 2032:       return (b.sentAt || 0) - (a.sentAt || 0);
 2033:     });
 2034:   }, [getNormalizedHelpState, requestStates, timerTick]);
 2035: 
 2036:   const activeRequests = useMemo(() => ticketRows.filter((row) => row.isActive), [ticketRows]);
 2037:   const activeRequestCount = useMemo(() =>
 2038:     activeRequests.filter(r => r.type !== 'menu').length,
 2039:   [activeRequests]);
 2040: 
 2041:   // HD-05: Load requestStates from localStorage on mount / table change
 2042:   useEffect(() => {
 2043:     if (!currentTableId) {
 2044:       setRequestStates({});
 2045:       setUndoToast((prev) => {
 2046:         if (prev?.timeoutId) clearTimeout(prev.timeoutId);
 2047:         return null;
 2048:       });
 2049:       pendingQuickSendRef.current = null;
 2050:       setPendingHelpActionTick(0);
 2051:       setIsHelpRestoring(false);
 2052:       hasLoadedHelpStatesRef.current = true;
 2053:       return;
 2054:     }
 2055: 
 2056:     try {
 2057:       const key = `helpdrawer_${currentTableId}`;
 2058:       const stored = localStorage.getItem(key);
 2059:       if (!stored) {
 2060:         setRequestStates({});
 2061:         setIsHelpRestoring(false);
 2062:         hasLoadedHelpStatesRef.current = true;
 2063:         return;
 2064:       }
 2065: 
 2066:       const parsed = JSON.parse(stored);
 2067:       const now = Date.now();
 2068:       const restored = {};
 2069:       const restoreEntry = (type, rawEntry, fallbackId) => {
 2070:         if (!rawEntry) return null;
 2071:         const sentAt = Number(rawEntry.sentAt) || parseHelpTimestamp(rawEntry.sentAt) || null;
 2072:         if (!sentAt || rawEntry.status === 'sending' || (now - sentAt) > HELP_RESTORE_TTL_MS) return null;
 2073: 
 2074:         const mappedStatus =
 2075:           rawEntry.status === 'pending'
 2076:             ? 'sent'
 2077:             : rawEntry.status === 'repeat'
 2078:               ? 'remind_available'
 2079:               : rawEntry.status;
 2080: 
 2081:         if (mappedStatus === 'resolved' || mappedStatus === 'closed_by_guest') return null;
 2082: 
 2083:         return {
 2084:           id: rawEntry.id || fallbackId,
 2085:           status: mappedStatus || 'sent',
 2086:           message: normalizeHelpMessage(rawEntry.message || rawEntry.comment),
 2087:           sentAt,
 2088:           reminderCount: Math.max(0, Number(rawEntry.reminderCount) || 0),
 2089:           lastReminderAt: Number(rawEntry.lastReminderAt) || parseHelpTimestamp(rawEntry.lastReminderAt) || null,
 2090:           remindCooldownUntil: Number(rawEntry.remindCooldownUntil) || parseHelpTimestamp(rawEntry.remindCooldownUntil) || null,
 2091:           pendingAction: null,
 2092:           errorKind: null,
 2093:           errorMessage: '',
 2094:           terminalHideAt: null,
 2095:           syncSource: 'local',
 2096:         };
 2097:       };
 2098: 
 2099:       for (const [type, state] of Object.entries(parsed || {})) {
 2100:         if (type === 'other') {
 2101:           const otherRows = (Array.isArray(state) ? state : [state])
 2102:             .map((entry, index) => restoreEntry('other', entry, entry?.id || `other-${index}`))
 2103:             .filter(Boolean);
 2104:           if (otherRows.length > 0) restored.other = otherRows;
 2105:           continue;
 2106:         }
 2107: 
 2108:         const restoredEntry = restoreEntry(type, state, type);
 2109:         if (restoredEntry) restored[type] = restoredEntry;
 2110:       }
 2111: 
 2112:       setRequestStates(restored);
 2113:       setIsHelpRestoring(Object.keys(restored).length > 0);
 2114:     } catch (e) {
 2115:       setRequestStates({});
 2116:       setIsHelpRestoring(false);
 2117:     }
 2118: 
 2119:     hasLoadedHelpStatesRef.current = true;
 2120:   }, [currentTableId, normalizeHelpMessage, parseHelpTimestamp]);
 2121: 
 2122:   const hasAnyHelpState = useMemo(() => {
 2123:     const now = Date.now();
 2124:     return Object.entries(requestStates).some(([type, state]) => {
 2125:       if (type === 'other') {
 2126:         const rows = Array.isArray(state) ? state : [state].filter(Boolean);
 2127:         return rows.some((entry) => {
 2128:           const normalized = getNormalizedHelpState('other', entry, now);
 2129:           return normalized && (normalized.isActive || normalized.isVisible || normalized.pendingAction || normalized.errorKind);
 2130:         });
 2131:       }
 2132:       const normalized = getNormalizedHelpState(type, state, now);
 2133:       return normalized && (normalized.isActive || normalized.isVisible || normalized.pendingAction || normalized.errorKind);
 2134:     });
 2135:   }, [getNormalizedHelpState, requestStates, timerTick]);
 2136: 
 2137:   const helpSyncEnabled = Boolean(partner?.id && currentTableId && (isHelpModalOpen || hasAnyHelpState || isHelpRestoring));
 2138:   const { data: helpRequestFeed = [], isError: isHelpSyncError, dataUpdatedAt: helpSyncUpdatedAt } = useQuery({
 2139:     queryKey: ['helpDrawerRequests', partner?.id, currentTableId],
 2140:     enabled: helpSyncEnabled,
 2141:     retry: shouldRetry,
 2142:     refetchInterval: helpSyncEnabled ? HELP_SYNC_INTERVAL_MS : false,
 2143:     refetchIntervalInBackground: false,
 2144:     queryFn: async () => {
 2145:       const rows = await base44.entities.ServiceRequest.filter({ partner: partner.id, table: currentTableId });
 2146:       return Array.isArray(rows) ? rows.filter((row) => HELP_REQUEST_TYPES.has(row?.request_type)) : [];
 2147:     },
 2148:   });
 2149: 
 2150:   const normalizedHelpRequests = useMemo(() => {
 2151:     return (helpRequestFeed || [])
 2152:       .map((request) => {
 2153:         const type = request?.request_type;
 2154:         if (!HELP_REQUEST_TYPES.has(type)) return null;
 2155:         return {
 2156:           id: String(request.id || `${type}-${request.created_date || Math.random()}`),
 2157:           type,
 2158:           status: String(request.status || '').toLowerCase(),
 2159:           createdAt: parseHelpTimestamp(request.updated_date) || parseHelpTimestamp(request.created_date) || Date.now(),
 2160:           message: normalizeHelpMessage(request.comment),
 2161:         };
 2162:       })
 2163:       .filter(Boolean)
 2164:       .sort((a, b) => a.createdAt - b.createdAt);
 2165:   }, [HELP_REQUEST_TYPES, helpRequestFeed, normalizeHelpMessage, parseHelpTimestamp]);
 2166: 
 2167:   const groupOtherServerEntries = useCallback((entries) => {
 2168:     const groups = [];
 2169: 
 2170:     entries
 2171:       .filter((entry) => entry.type === 'other')
 2172:       .forEach((entry) => {
 2173:         const messageKey = getHelpMessageKey(entry.message) || `other:${entry.id}`;
 2174:         const lastGroup = groups[groups.length - 1];
 2175:         const canReuse =
 2176:           lastGroup &&
 2177:           lastGroup.messageKey === messageKey &&
 2178:           (entry.createdAt - lastGroup.lastCreatedAt) <= HELP_MATCH_GRACE_MS;
 2179: 
 2180:         if (canReuse) {
 2181:           lastGroup.entries.push(entry);
 2182:           lastGroup.lastCreatedAt = entry.createdAt;
 2183:           return;
 2184:         }
 2185: 
 2186:         groups.push({
 2187:           key: `${messageKey}:${entry.createdAt}`,
 2188:           messageKey,
 2189:           message: entry.message,
 2190:           startedAt: entry.createdAt,
 2191:           lastCreatedAt: entry.createdAt,
 2192:           entries: [entry],
 2193:         });
 2194:       });
 2195: 
 2196:     return groups.map((group) => ({
 2197:       ...group,
 2198:       activeEntries: group.entries.filter((entry) => HELP_ACTIVE_SERVER_STATUSES.has(entry.status)),
 2199:       doneEntries: group.entries.filter((entry) => HELP_DONE_SERVER_STATUSES.has(entry.status)),
 2200:     }));
 2201:   }, [getHelpMessageKey, HELP_ACTIVE_SERVER_STATUSES, HELP_DONE_SERVER_STATUSES]);
 2202: 
 2203:   const findMatchingOtherLocalIndex = useCallback((localRows, group) => {
 2204:     return localRows.findIndex((entry) => {
 2205:       if (!entry) return false;
 2206:       if ((entry.serverRequestIds || []).some((id) => group.entries.some((serverEntry) => serverEntry.id === id))) {
 2207:         return true;
 2208:       }
 2209:       if (getHelpMessageKey(entry.message) !== group.messageKey) return false;
 2210:       if (!entry.sentAt) return true;
 2211:       return Math.abs(entry.sentAt - group.startedAt) <= (HELP_MATCH_GRACE_MS * 2);
 2212:     });
 2213:   }, [getHelpMessageKey]);
 2214: 
 2215:   useEffect(() => {
 2216:     if (!helpSyncUpdatedAt) return;
 2217: 
 2218:     setIsHelpRestoring(false);
 2219: 
 2220:     setRequestStates((prev) => {
 2221:       const now = Date.now();
 2222:       const next = {};
 2223:       const nonOtherTypes = ['call_waiter', 'bill', 'plate', 'napkins', 'utensils', 'clear_table', 'menu'];
 2224: 
 2225:       nonOtherTypes.forEach((type) => {
 2226:         const current = prev[type];
 2227:         const relevantEntries = normalizedHelpRequests.filter((entry) => (
 2228:           entry.type === type &&
 2229:           (!current?.sentAt || entry.createdAt >= (current.sentAt - HELP_MATCH_GRACE_MS))
 2230:         ));
 2231:         const activeEntries = relevantEntries.filter((entry) => HELP_ACTIVE_SERVER_STATUSES.has(entry.status));
 2232:         const doneEntries = relevantEntries.filter((entry) => HELP_DONE_SERVER_STATUSES.has(entry.status));
 2233: 
 2234:         if (current?.status === 'closed_by_guest') {
 2235:           next[type] = current;
 2236:           return;
 2237:         }
 2238: 
 2239:         if (activeEntries.length > 0) {
 2240:           const sortedEntries = [...activeEntries].sort((a, b) => a.createdAt - b.createdAt);
 2241:           next[type] = {
 2242:             id: current?.id || type,
 2243:             status: current?.status === 'sending' ? 'sent' : (current?.status || 'sent'),
 2244:             message: current?.message || '',
 2245:             sentAt: Number(current?.sentAt) || sortedEntries[0]?.createdAt || now,
 2246:             reminderCount: Math.max(Number(current?.reminderCount) || 0, Math.max(0, sortedEntries.length - 1)),
 2247:             lastReminderAt:
 2248:               Number(current?.lastReminderAt) ||
 2249:               (sortedEntries.length > 1 ? sortedEntries[sortedEntries.length - 1]?.createdAt : null),
 2250:             remindCooldownUntil:
 2251:               current?.pendingAction === 'remind'
 2252:                 ? current.remindCooldownUntil
 2253:                 : (Number(current?.remindCooldownUntil) || ((Number(current?.lastReminderAt) || Number(current?.sentAt) || sortedEntries[0]?.createdAt || now) + getHelpCooldownMs(type))),
 2254:             pendingAction: null,
 2255:             errorKind: null,
 2256:             errorMessage: '',
 2257:             terminalHideAt: null,
 2258:             serverRequestIds: sortedEntries.map((entry) => entry.id),
 2259:             lastServerCreatedAt: sortedEntries[sortedEntries.length - 1]?.createdAt || now,
 2260:             syncSource: 'server',
 2261:           };
 2262:           return;
 2263:         }
 2264: 
 2265:         if (doneEntries.length > 0 && current) {
 2266:           next[type] = {
 2267:             ...current,
 2268:             status: 'resolved',
 2269:             pendingAction: null,
 2270:             errorKind: null,
 2271:             errorMessage: '',
 2272:             terminalHideAt: current?.status === 'resolved' && current?.terminalHideAt ? current.terminalHideAt : now + HELP_RESOLVED_HIDE_MS,
 2273:             serverRequestIds: doneEntries.map((entry) => entry.id),
 2274:             lastServerCreatedAt: doneEntries[doneEntries.length - 1]?.createdAt || current?.lastServerCreatedAt || now,
 2275:             syncSource: 'server',
 2276:           };
 2277:           return;
 2278:         }
 2279: 
 2280:         if (current) {
 2281:           next[type] = current;
 2282:         }
 2283:       });
 2284: 
 2285:       const localOtherRows = Array.isArray(prev.other) ? [...prev.other] : (prev.other ? [prev.other] : []);
 2286:       const groupedOtherRows = groupOtherServerEntries(normalizedHelpRequests);
 2287:       const consumedLocalIndexes = new Set();
 2288:       const nextOtherRows = [];
 2289: 
 2290:       groupedOtherRows.forEach((group) => {
 2291:         const localIndex = findMatchingOtherLocalIndex(localOtherRows, group);
 2292:         const current = localIndex >= 0 ? localOtherRows[localIndex] : null;
 2293: 
 2294:         if (localIndex >= 0) consumedLocalIndexes.add(localIndex);
 2295: 
 2296:         if (current?.status === 'closed_by_guest') {
 2297:           nextOtherRows.push(current);
 2298:           return;
 2299:         }
 2300: 
 2301:         if (group.activeEntries.length > 0) {
 2302:           const sortedEntries = [...group.activeEntries].sort((a, b) => a.createdAt - b.createdAt);
 2303:           nextOtherRows.push({
 2304:             id: current?.id || `other-${group.startedAt}`,
 2305:             status: current?.status === 'sending' ? 'sent' : (current?.status || 'sent'),
 2306:             message: current?.message || group.message,
 2307:             sentAt: Number(current?.sentAt) || sortedEntries[0]?.createdAt || now,
 2308:             reminderCount: Math.max(Number(current?.reminderCount) || 0, Math.max(0, sortedEntries.length - 1)),
 2309:             lastReminderAt:
 2310:               Number(current?.lastReminderAt) ||
 2311:               (sortedEntries.length > 1 ? sortedEntries[sortedEntries.length - 1]?.createdAt : null),
 2312:             remindCooldownUntil:
 2313:               current?.pendingAction === 'remind'
 2314:                 ? current.remindCooldownUntil
 2315:                 : (Number(current?.remindCooldownUntil) || ((Number(current?.lastReminderAt) || Number(current?.sentAt) || sortedEntries[0]?.createdAt || now) + getHelpCooldownMs('other'))),
 2316:             pendingAction: null,
 2317:             errorKind: null,
 2318:             errorMessage: '',
 2319:             terminalHideAt: null,
 2320:             serverRequestIds: sortedEntries.map((entry) => entry.id),
 2321:             lastServerCreatedAt: sortedEntries[sortedEntries.length - 1]?.createdAt || now,
 2322:             syncSource: 'server',
 2323:           });
 2324:           return;
 2325:         }
 2326: 
 2327:         if (group.doneEntries.length > 0 && current) {
 2328:           nextOtherRows.push({
 2329:             ...current,
 2330:             status: 'resolved',
 2331:             pendingAction: null,
 2332:             errorKind: null,
 2333:             errorMessage: '',
 2334:             terminalHideAt: current?.status === 'resolved' && current?.terminalHideAt ? current.terminalHideAt : now + HELP_RESOLVED_HIDE_MS,
 2335:             serverRequestIds: group.doneEntries.map((entry) => entry.id),
 2336:             lastServerCreatedAt: group.doneEntries[group.doneEntries.length - 1]?.createdAt || current?.lastServerCreatedAt || now,
 2337:             syncSource: 'server',
 2338:           });
 2339:         }
 2340:       });
 2341: 
 2342:       localOtherRows.forEach((entry, index) => {
 2343:         if (consumedLocalIndexes.has(index)) return;
 2344:         nextOtherRows.push(entry);
 2345:       });
 2346: 
 2347:       if (nextOtherRows.length > 0) {
 2348:         next.other = nextOtherRows.sort((a, b) => (a.sentAt || 0) - (b.sentAt || 0));
 2349:       }
 2350: 
 2351:       return JSON.stringify(prev) === JSON.stringify(next) ? prev : next;
 2352:     });
 2353:   }, [findMatchingOtherLocalIndex, getHelpCooldownMs, groupOtherServerEntries, helpSyncUpdatedAt, normalizedHelpRequests, HELP_ACTIVE_SERVER_STATUSES, HELP_DONE_SERVER_STATUSES]);
 2354: 
 2355:   // PM-126/PM-125: Help drawer open/close with overlay stack integration
 2356:   // PM-133: Guard for null currentTableId â€" redirect to table code entry
 2357:   const openHelpDrawer = useCallback(() => {
 2358:     if (!currentTableId) {
 2359:       setShowTableConfirmSheet(true);
 2360:       return;
 2361:     }
 2362:     setShowOtherForm(false);
 2363:     setHelpComment('');
 2364:     setIsTicketExpanded(false);
 2365:     setCancelConfirmType(null);
 2366:     setIsHelpModalOpen(true);
 2367:     pushOverlay('help');
 2368:   }, [currentTableId, pushOverlay, setHelpComment, setShowTableConfirmSheet]);
 2369: 
 2370:   const closeHelpDrawer = useCallback(() => {
 2371:     popOverlay('help');
 2372:     setIsHelpModalOpen(false);
 2373:     setIsTicketExpanded(false);
 2374:     setShowOtherForm(false);
 2375:     setHelpComment('');
 2376:     setCancelConfirmType(null);
 2377:   }, [popOverlay, setHelpComment]);
 2378: 
 2379:   // HD-01 + HD-06: Card tap with 5s undo delay before actual server send
 2380:   const handleCardTap = useCallback((type) => {
 2381:     if (!currentTableId) return;
 2382:     if (undoToast?.type === type && undoToast?.tableId === currentTableId) return;
 2383:     if (undoToast?.timeoutId) clearTimeout(undoToast.timeoutId);
 2384: 
 2385:     const timeoutId = setTimeout(() => {
 2386:       if (currentTableIdRef.current !== currentTableId) return;
 2387:       const now = Date.now();
 2388:       setRequestStates((prev) => ({
 2389:         ...prev,
 2390:         [type]: {
 2391:           id: type,
 2392:           status: 'sending',
 2393:           message: '',
 2394:           sentAt: now,
 2395:           reminderCount: 0,
 2396:           lastReminderAt: null,
 2397:           remindCooldownUntil: null,
 2398:           pendingAction: 'send',
 2399:           errorKind: null,
 2400:           errorMessage: '',
 2401:           terminalHideAt: null,
 2402:           syncSource: 'local',
 2403:         },
 2404:       }));
 2405:       pendingQuickSendRef.current = { type, action: 'send', rowId: type, message: '' };
 2406:       handlePresetSelect(type);
 2407:       setPendingHelpActionTick((value) => value + 1);
 2408:       setUndoToast((prev) => (prev?.timeoutId === timeoutId ? null : prev));
 2409:     }, 5000);
 2410: 
 2411:     setUndoToast({ type, rowId: type, tableId: currentTableId, expiresAt: Date.now() + 5000, timeoutId });
 2412:   }, [currentTableId, handlePresetSelect, undoToast]);
 2413: 
 2414:   // HD-06: Undo handler â€" cancel pending send, return card to idle
 2415:   const handleUndo = useCallback(() => {
 2416:     if (!undoToast) return;
 2417:     clearTimeout(undoToast.timeoutId);
 2418:     setUndoToast(null);
 2419:   }, [undoToast]);
 2420: 
 2421:   // Fix 4A: handleRemind â€" send reminder without undo, update cooldown
 2422:   const handleRemind = useCallback((type, otherId) => {
 2423:     const row = type === 'other'
 2424:       ? (Array.isArray(requestStates.other) ? requestStates.other.find((entry) => entry.id === otherId) : null)
 2425:       : requestStates[type];
 2426:     const normalized = getNormalizedHelpState(type, row);
 2427:     if (!normalized || normalized.pendingAction) return;
 2428:     if (normalized.remindCooldownUntil && normalized.remindCooldownUntil > Date.now()) return;
 2429: 
 2430:     setRequestStates((prev) => {
 2431:       if (type === 'other') {
 2432:         const otherRows = Array.isArray(prev.other) ? prev.other : [];
 2433:         return {
 2434:           ...prev,
 2435:           other: otherRows.map((entry) => (
 2436:             entry.id === otherId
 2437:               ? { ...entry, pendingAction: 'remind', errorKind: null, errorMessage: '' }
 2438:               : entry
 2439:           )),
 2440:         };
 2441:       }
 2442: 
 2443:       const current = prev[type];
 2444:       if (!current) return prev;
 2445:       return {
 2446:         ...prev,
 2447:         [type]: { ...current, pendingAction: 'remind', errorKind: null, errorMessage: '' },
 2448:       };
 2449:     });
 2450: 
 2451:     pendingQuickSendRef.current = {
 2452:       type,
 2453:       action: 'remind',
 2454:       rowId: type === 'other' ? otherId : type,
 2455:       message: normalized.message,
 2456:     };
 2457:     if (type === 'other' && normalized.message) {
 2458:       setHelpComment(normalized.message);
 2459:     }
 2460:     handlePresetSelect(type);
 2461:     setPendingHelpActionTick((value) => value + 1);
 2462:   }, [getNormalizedHelpState, handlePresetSelect, requestStates, setHelpComment]);
 2463: 
 2464:   // Fix 3: Handle resolve (mark request as done by guest)
 2465:   const handleResolve = useCallback((type, otherId) => {
 2466:     const now = Date.now();
 2467: 
 2468:     setRequestStates((prev) => {
 2469:       if (type === 'other') {
 2470:         const otherRows = Array.isArray(prev.other) ? prev.other : [];
 2471:         return {
 2472:           ...prev,
 2473:           other: otherRows.map((entry) => (
 2474:             entry.id === otherId
 2475:               ? {
 2476:                   ...entry,
 2477:                   status: 'closed_by_guest',
 2478:                   pendingAction: null,
 2479:                   errorKind: null,
 2480:                   errorMessage: '',
 2481:                   terminalHideAt: now + HELP_CLOSED_HIDE_MS,
 2482:                   syncSource: 'local',
 2483:                 }
 2484:               : entry
 2485:           )),
 2486:         };
 2487:       }
 2488: 
 2489:       const current = prev[type] || { id: type, sentAt: now };
 2490:       return {
 2491:         ...prev,
 2492:         [type]: {
 2493:           ...current,
 2494:           status: 'closed_by_guest',
 2495:           pendingAction: null,
 2496:           errorKind: null,
 2497:           errorMessage: '',
 2498:           terminalHideAt: now + HELP_CLOSED_HIDE_MS,
 2499:           syncSource: 'local',
 2500:         },
 2501:       };
 2502:     });
 2503:   }, []);
 2504: 
 2505:   const handleSosCancel = useCallback((type) => {
 2506:     const activeRow = activeRequests.find(r => r.type === type);
 2507:     if (!activeRow) return;
 2508:     const urgency = getHelpUrgency(type, activeRow.sentAt);
 2509:     if (urgency === 'red') {
 2510:       setCancelConfirmType(type);
 2511:     } else {
 2512:       handleResolve(type, type === 'other' ? activeRow.id : undefined);
 2513:     }
 2514:   }, [activeRequests, getHelpUrgency, handleResolve]);
 2515: 
 2516:   useEffect(() => {
 2517:     if (!cancelConfirmType) return;
 2518:     const exists = activeRequests.some(r => r.type === cancelConfirmType);
 2519:     if (!exists) setCancelConfirmType(null);
 2520:   }, [activeRequests, cancelConfirmType]);
 2521: 
 2522:   // HD-01: Auto-submit when selectedHelpType matches pending quick send
 2523:   useEffect(() => {
 2524:     const action = pendingQuickSendRef.current;
 2525:     if (!action) return;
 2526:     if (selectedHelpType !== action.type) return;
 2527:     if (action.type === 'other' && action.message && normalizeHelpMessage(helpComment) !== normalizeHelpMessage(action.message)) return;
 2528: 
 2529:     pendingQuickSendRef.current = null;
 2530: 
 2531:     const onSuccess = () => {
 2532:       const now = Date.now();
 2533: 
 2534:       setRequestStates((prev) => {
 2535:         if (action.type === 'other') {
 2536:           const otherRows = Array.isArray(prev.other) ? prev.other : [];
 2537:           return {
 2538:             ...prev,
 2539:             other: otherRows.map((entry) => {
 2540:               if (entry.id !== action.rowId) return entry;
 2541:               const sentAt = entry.sentAt || now;
 2542:               const reminderCount = action.action === 'remind' ? (Number(entry.reminderCount) || 0) + 1 : 0;
 2543:               const lastReminderAt = action.action === 'remind' ? now : null;
 2544:               const cooldownAnchor = action.action === 'remind' ? now : sentAt;
 2545:               return {
 2546:                 ...entry,
 2547:                 status: action.action === 'remind' ? 'reminded' : 'sent',
 2548:                 message: action.action === 'send' ? (normalizeHelpMessage(action.message) || entry.message) : entry.message,
 2549:                 sentAt,
 2550:                 reminderCount,
 2551:                 lastReminderAt,
 2552:                 remindCooldownUntil: cooldownAnchor + getHelpCooldownMs('other'),
 2553:                 pendingAction: null,
 2554:                 errorKind: null,
 2555:                 errorMessage: '',
 2556:                 terminalHideAt: null,
 2557:                 syncSource: 'local',
 2558:               };
 2559:             }),
 2560:           };
 2561:         }
 2562: 
 2563:         const current = prev[action.type];
 2564:         const sentAt = current?.sentAt || now;
 2565:         const reminderCount = action.action === 'remind' ? (Number(current?.reminderCount) || 0) + 1 : 0;
 2566:         const lastReminderAt = action.action === 'remind' ? now : null;
 2567:         const cooldownAnchor = action.action === 'remind' ? now : sentAt;
 2568: 
 2569:         return {
 2570:           ...prev,
 2571:           [action.type]: {
 2572:             ...(current || {}),
 2573:             id: action.type,
 2574:             status: action.action === 'remind' ? 'reminded' : 'sent',
 2575:             sentAt,
 2576:             reminderCount,
 2577:             lastReminderAt,
 2578:             remindCooldownUntil: cooldownAnchor + getHelpCooldownMs(action.type),
 2579:             pendingAction: null,
 2580:             errorKind: null,
 2581:             errorMessage: '',
 2582:             terminalHideAt: null,
 2583:             syncSource: 'local',
 2584:           },
 2585:         };
 2586:       });
 2587: 
 2588:       if (action.type === 'other') {
 2589:         setHelpComment('');
 2590:       }
 2591: 
 2592:       if (action.action === 'send') {
 2593:         setIsTicketExpanded(false);
 2594:         setShowOtherForm(false);
 2595:       }
 2596: 
 2597:       if (action.action === 'remind') {
 2598:         toast({ description: tr('help.reminder_sent', 'Reminder sent'), duration: 2000 });
 2599:       }
 2600: 
 2601:       queryClient.invalidateQueries({ queryKey: ['helpDrawerRequests', partner?.id, currentTableIdRef.current] });
 2602:     };
 2603: 
 2604:     const onError = (err) => {
 2605:       const msg = String(err?.message || '').toLowerCase();
 2606:       const errorMessage = (!isHelpOnline || msg.includes('network') || msg.includes('offline') || msg.includes('fetch')) ? 'offline' : 'generic';
 2607: 
 2608:       setRequestStates((prev) => {
 2609:         if (action.type === 'other') {
 2610:           const otherRows = Array.isArray(prev.other) ? prev.other : [];
 2611:           return {
 2612:             ...prev,
 2613:             other: otherRows.map((entry) => {
 2614:               if (entry.id !== action.rowId) return entry;
 2615:               return {
 2616:                 ...entry,
 2617:                 status: action.action === 'send' ? 'sending' : entry.status,
 2618:                 pendingAction: null,
 2619:                 errorKind: action.action,
 2620:                 errorMessage,
 2621:               };
 2622:             }),
 2623:           };
 2624:         }
 2625: 
 2626:         const current = prev[action.type] || {
 2627:           id: action.type,
 2628:           sentAt: Date.now(),
 2629:           reminderCount: 0,
 2630:           lastReminderAt: null,
 2631:           remindCooldownUntil: null,
 2632:         };
 2633: 
 2634:         return {
 2635:           ...prev,
 2636:           [action.type]: {
 2637:             ...current,
 2638:             status: action.action === 'send' ? 'sending' : current.status,
 2639:             pendingAction: null,
 2640:             errorKind: action.action,
 2641:             errorMessage,
 2642:           },
 2643:         };
 2644:       });
 2645:     };
 2646: 
 2647:     try {
 2648:       const result = submitHelpRequest();
 2649:       Promise.resolve(result).then(onSuccess).catch(onError);
 2650:     } catch (err) {
 2651:       onError(err);
 2652:     }
 2653:   }, [selectedHelpType, submitHelpRequest, pendingHelpActionTick, helpComment, normalizeHelpMessage, getHelpCooldownMs, partner?.id, queryClient, tr, isHelpOnline]);
 2654: 
 2655:   const handleRetry = useCallback((row) => {
 2656:     if (!row) return;
 2657: 
 2658:     if (row.errorKind === 'remind') {
 2659:       setRequestStates((prev) => {
 2660:         if (row.type === 'other') {
 2661:           const otherRows = Array.isArray(prev.other) ? prev.other : [];
 2662:           return {
 2663:             ...prev,
 2664:             other: otherRows.map((entry) => (
 2665:               entry.id === row.id
 2666:                 ? { ...entry, pendingAction: 'remind', errorKind: null, errorMessage: '' }
 2667:                 : entry
 2668:             )),
 2669:           };
 2670:         }
 2671: 
 2672:         const current = prev[row.type];
 2673:         if (!current) return prev;
 2674:         return {
 2675:           ...prev,
 2676:           [row.type]: { ...current, pendingAction: 'remind', errorKind: null, errorMessage: '' },
 2677:         };
 2678:       });
 2679: 
 2680:       pendingQuickSendRef.current = { type: row.type, action: 'remind', rowId: row.id, message: row.message };
 2681:       if (row.type === 'other' && row.message) {
 2682:         setHelpComment(row.message);
 2683:       }
 2684:       handlePresetSelect(row.type);
 2685:       setPendingHelpActionTick((value) => value + 1);
 2686:       return;
 2687:     }
 2688: 
 2689:     const now = Date.now();
 2690:     setRequestStates((prev) => {
 2691:       if (row.type === 'other') {
 2692:         const otherRows = Array.isArray(prev.other) ? prev.other : [];
 2693:         return {
 2694:           ...prev,
 2695:           other: otherRows.map((entry) => (
 2696:             entry.id === row.id
 2697:               ? {
 2698:                   ...entry,
 2699:                   status: 'sending',
 2700:                   sentAt: now,
 2701:                   reminderCount: 0,
 2702:                   lastReminderAt: null,
 2703:                   remindCooldownUntil: null,
 2704:                   pendingAction: 'send',
 2705:                   errorKind: null,
 2706:                   errorMessage: '',
 2707:                   terminalHideAt: null,
 2708:                   syncSource: 'local',
 2709:                 }
 2710:               : entry
 2711:           )),
 2712:         };
 2713:       }
 2714: 
 2715:       return {
 2716:         ...prev,
 2717:         [row.type]: {
 2718:           id: row.type,
 2719:           status: 'sending',
 2720:           message: '',
 2721:           sentAt: now,
 2722:           reminderCount: 0,
 2723:           lastReminderAt: null,
 2724:           remindCooldownUntil: null,
 2725:           pendingAction: 'send',
 2726:           errorKind: null,
 2727:           errorMessage: '',
 2728:           terminalHideAt: null,
 2729:           syncSource: 'local',
 2730:         },
 2731:       };
 2732:     });
 2733: 
 2734:     pendingQuickSendRef.current = { type: row.type, action: 'send', rowId: row.id, message: row.message || '' };
 2735:     if (row.type === 'other' && row.message) {
 2736:       setHelpComment(row.message);
 2737:     }
 2738:     handlePresetSelect(row.type);
 2739:     setPendingHelpActionTick((value) => value + 1);
 2740:   }, [handlePresetSelect, setHelpComment]);
 2741: 
 2742:   useEffect(() => {
 2743:     const shouldTick = isHelpModalOpen || !!undoToast || ticketRows.length > 0 || isHelpRestoring;
 2744:     if (!shouldTick) return;
 2745:     const interval = setInterval(() => setTimerTick((value) => value + 1), 1000);
 2746:     return () => clearInterval(interval);
 2747:   }, [isHelpModalOpen, isHelpRestoring, ticketRows.length, undoToast]);
 2748: 
 2749:   // HD-03: Recalculate on visibility change (tab return)
 2750:   useEffect(() => {
 2751:     const handler = () => { if (!document.hidden) setTimerTick(t => t + 1); };
 2752:     document.addEventListener('visibilitychange', handler);
 2753:     return () => document.removeEventListener('visibilitychange', handler);
 2754:   }, []);
 2755: 
 2756:   // HD-05: Persist requestStates to localStorage on change
 2757:   useEffect(() => {
 2758:     if (!currentTableId || !hasLoadedHelpStatesRef.current) return;
 2759: 
 2760:     const key = `helpdrawer_${currentTableId}`;
 2761:     const persistable = {};
 2762:     const now = Date.now();
 2763: 
 2764:     const toPersistedEntry = (type, rawEntry) => {
 2765:       const normalized = getNormalizedHelpState(type, rawEntry, now);
 2766:       if (!normalized || !normalized.isActive || normalized.status === 'sending' || normalized.pendingAction || normalized.errorKind) return null;
 2767:       if ((now - normalized.sentAt) > HELP_RESTORE_TTL_MS) return null;
 2768: 
 2769:       return {
 2770:         id: normalized.id,
 2771:         status: normalized.status,
 2772:         message: normalized.message,
 2773:         sentAt: normalized.sentAt,
 2774:         reminderCount: normalized.reminderCount || 0,
 2775:         lastReminderAt: normalized.lastReminderAt || null,
 2776:         remindCooldownUntil: normalized.remindCooldownUntil || null,
 2777:       };
 2778:     };
 2779: 
 2780:     Object.entries(requestStates).forEach(([type, state]) => {
 2781:       if (type === 'other') {
 2782:         const rows = (Array.isArray(state) ? state : [state].filter(Boolean))
 2783:           .map((entry) => toPersistedEntry('other', entry))
 2784:           .filter(Boolean);
 2785:         if (rows.length > 0) persistable.other = rows;
 2786:         return;
 2787:       }
 2788: 
 2789:       const persisted = toPersistedEntry(type, state);
 2790:       if (persisted) persistable[type] = persisted;
 2791:     });
 2792: 
 2793:     if (Object.keys(persistable).length === 0) {
 2794:       localStorage.removeItem(key);
 2795:     } else {
 2796:       localStorage.setItem(key, JSON.stringify(persistable));
 2797:     }
 2798:   }, [currentTableId, getNormalizedHelpState, requestStates]);
 2799: 
 2800:   // PM-125: Cart-to-help sequencing â€" close cart first, 300ms delay, then open help
 2801:   const handleHelpFromCart = useCallback(() => {
 2802:     popOverlay('cart');
 2803:     setDrawerMode(null);
 2804:     setTimeout(() => {
 2805:       openHelpDrawer();
 2806:     }, 300);
 2807:   }, [popOverlay, openHelpDrawer]);
 2808: 
 2809:   // OrderStages for the partner (for stage_id assignment)
 2810:   const { data: orderStages = [] } = useQuery({
 2811:     queryKey: ["orderStages", partner?.id],
 2812:     enabled: !!partner?.id,
 2813:     retry: shouldRetry,
 2814:     queryFn: () => base44.entities.OrderStage.filter({ 
 2815:       partner: partner.id, 
 2816:       is_active: true 
 2817:     }),
 2818:     staleTime: 5 * 60 * 1000,
 2819:   });
 2820: 
 2821:   // P0-4: Menu data - filter by partner on server side
 2822:   const { data: allDishes, isLoading: loadingDishes, error: dishesError } = useQuery({
 2823:     queryKey: ["dishes", partner?.id],
 2824:     enabled: !!partner?.id,
 2825:     retry: shouldRetry,
 2826:     queryFn: () => base44.entities.Dish.filter({ partner: partner.id }),
 2827:   });
 2828: 
 2829:   const { data: allCategories, error: categoriesError } = useQuery({
 2830:     queryKey: ["categories", partner?.id],
 2831:     enabled: !!partner?.id,
 2832:     retry: shouldRetry,
 2833:     queryFn: () => base44.entities.Category.filter({ partner: partner.id }),
 2834:   });
 2835: 
 2836:   // P0-4: Warning if limit reached
 2837:   useEffect(() => {
 2838:     if (allDishes?.length === 100) {
 2839:       // Dish limit reached (100) â€" silent in prod
 2840:     }
 2841:     if (allCategories?.length === 100) {
 2842:       // Category limit reached (100) â€" silent in prod
 2843:     }
 2844:   }, [allDishes?.length, allCategories?.length]);
 2845: 
 2846:   const { data: partnerContactsRaw = [] } = useQuery({
 2847:     queryKey: ["partnerContacts", partner?.id],
 2848:     enabled: !!partner?.id,
 2849:     retry: shouldRetry,
 2850:     queryFn: () => base44.entities.PartnerContacts.filter({ partner: partner.id }),
 2851:     initialData: [],
 2852:   });
 2853: 
 2854:   const { data: contactLinksRaw = [] } = useQuery({
 2855:     queryKey: ["partnerContactLinks", partner?.id],
 2856:     enabled: !!partner?.id,
 2857:     retry: shouldRetry,
 2858:     queryFn: () => base44.entities.PartnerContactLink.filter({ partner: partner.id }),
 2859:     initialData: [],
 2860:   });
 2861: 
 2862:   // Fetch translations
 2863:   const { data: categoryTranslations } = useQuery({
 2864:     queryKey: ["categoryTranslations", partner?.id, lang],
 2865:     enabled: !!partner?.id,
 2866:     retry: shouldRetry,
 2867:     queryFn: async () => {
 2868:       try {
 2869:         return await base44.entities.CategoryTranslation.filter({
 2870:           partner: partner.id,
 2871:           lang: lang
 2872:         });
 2873:       } catch (e) {
 2874:         // Failed to fetch category translations â€" silent in prod
 2875:         return [];
 2876:       }
 2877:     },
 2878:     initialData: []
 2879:   });
 2880: 
 2881:   const { data: dishTranslations } = useQuery({
 2882:     queryKey: ["dishTranslations", partner?.id, lang],
 2883:     enabled: !!partner?.id,
 2884:     retry: shouldRetry,
 2885:     queryFn: async () => {
 2886:       try {
 2887:         return await base44.entities.DishTranslation.filter({
 2888:           partner: partner.id,
 2889:           lang: lang
 2890:         });
 2891:       } catch (e) {
 2892:         // Failed to fetch dish translations â€" silent in prod
 2893:         return [];
 2894:       }
 2895:     },
 2896:     initialData: []
 2897:   });
 2898: 
 2899:   // Dish ratings/reviews
 2900:   const showReviews = partner?.show_dish_reviews === true;
 2901:   const partnerId = partner?.id || partner?._id;
 2902:   
 2903:   const { data: partnerFeedbacks = [] } = useQuery({
 2904:     queryKey: ["dishFeedbacksRecent", partnerId],
 2905:     queryFn: () => base44.entities.DishFeedback.filter({ partner: partnerId }, "-created_date", 100),
 2906:     enabled: showReviews && !!partnerId,
 2907:     retry: shouldRetry,
 2908:     staleTime: 5 * 60 * 1000,
 2909:   });
 2910: 
 2911:   // Build translation lookup maps
 2912:   const categoryTransMap = useMemo(() => {
 2913:     const map = {};
 2914:     (categoryTranslations || []).forEach(tr => {
 2915:       map[tr.category] = tr.name;
 2916:     });
 2917:     return map;
 2918:   }, [categoryTranslations]);
 2919: 
 2920:   const dishTransMap = useMemo(() => {
 2921:     const map = {};
 2922:     (dishTranslations || []).forEach(tr => {
 2923:       map[tr.dish] = {
 2924:         name: tr.name,
 2925:         description: tr.description
 2926:       };
 2927:     });
 2928:     return map;
 2929:   }, [dishTranslations]);
 2930: 
 2931:   // Aggregate dish ratings
 2932:   const dishRatings = useMemo(() => {
 2933:     if (!showReviews || !partnerFeedbacks?.length) return {};
 2934:     const tmp = {}; // { [dishId]: { sum, count } }
 2935: 
 2936:     for (const f of partnerFeedbacks) {
 2937:       const dishId = typeof f.dish === "object" ? f.dish?.id : f.dish;
 2938:       const rating = Number(f.rating);
 2939:       if (!dishId || !rating) continue;
 2940: 
 2941:       if (!tmp[dishId]) tmp[dishId] = { sum: 0, count: 0 };
 2942:       tmp[dishId].sum += rating;
 2943:       tmp[dishId].count += 1;
 2944:     }
 2945: 
 2946:     const out = {};
 2947:     for (const dishId of Object.keys(tmp)) {
 2948:       out[dishId] = {
 2949:         avg: tmp[dishId].sum / tmp[dishId].count,
 2950:         count: tmp[dishId].count,
 2951:       };
 2952:     }
 2953:     return out;
 2954:   }, [showReviews, partnerFeedbacks]);
 2955: 
 2956:   // Load reviews for selected dish (modal)
 2957:   const { data: selectedDishReviews = [], isLoading: loadingDishReviews } = useQuery({
 2958:     queryKey: ["dishReviews", partnerId, selectedDishId],
 2959:     queryFn: () => base44.entities.DishFeedback.filter(
 2960:       { partner: partnerId, dish: selectedDishId },
 2961:       "-created_date",
 2962:       20
 2963:     ),
 2964:     enabled: showReviews && !!partnerId && !!selectedDishId,
 2965:     retry: shouldRetry,
 2966:     staleTime: 5 * 60 * 1000,
 2967:   });
 2968: 
 2969:   // Helper functions to get translated content with fallback
 2970:   const getCategoryName = (category) => {
 2971:     return categoryTransMap[category.id] || category.name;
 2972:   };
 2973: 
 2974:   const getDishName = (dish) => {
 2975:     return dishTransMap[dish.id]?.name || dish.name;
 2976:   };
 2977: 
 2978:   const getDishDescription = (dish) => {
 2979:     const translated = dishTransMap[dish.id]?.description;
 2980:     if (translated) return getCleanDescription(translated);
 2981:     return getCleanDescription(dish.description);
 2982:   };
 2983: 
 2984:   // P1-8: Sync cart names when language changes
 2985:   useEffect(() => {
 2986:     if (!cart.length || !dishTransMap || Object.keys(dishTransMap).length === 0) return;
 2987:     
 2988:     setCart(prev => prev.map(item => {
 2989:       const translated = dishTransMap[item.dishId];
 2990:       if (translated?.name && translated.name !== item.name) {
 2991:         return { ...item, name: translated.name };
 2992:       }
 2993:       return item;
 2994:     }));
 2995:   }, [lang, dishTransMap]);
 2996: 
 2997:   const partnerContacts = partnerContactsRaw?.[0] || null;
 2998:   const viewMode = partner?.contacts_view_mode || partnerContacts?.view_mode || "full";
 2999: 
 3000:   const activeContactLinks = useMemo(() => {
 3001:     return contactLinksRaw
 3002:       .filter((link) => link.is_active !== false)
 3003:       .sort((a, b) => {
 3004:         const oa = a?.sort_order;
 3005:         const ob = b?.sort_order;
 3006:         if (oa == null && ob == null) return 0;
 3007:         if (oa == null) return 1;
 3008:         if (ob == null) return -1;
 3009:         return oa - ob;
 3010:       });
 3011:   }, [contactLinksRaw]);
 3012: 
 3013:   // Enabled languages for switcher
 3014:   const enabledLanguages = useMemo(() => {
 3015:     const partnerDefault = partner?.default_language || "RU";
 3016:     const enabled = partner?.enabled_languages;
 3017:     if (Array.isArray(enabled) && enabled.length > 0) {
 3018:       return enabled;
 3019:     }
 3020:     return [partnerDefault];
 3021:   }, [partner?.default_language, partner?.enabled_languages]);
 3022: 
 3023:   // Currency hook
 3024:   const {
 3025:     activeCurrency,
 3026:     enabledCurrencies,
 3027:     defaultCurrency,
 3028:     currencyRates,
 3029:     formatPrice,
 3030:     handleCurrencyChange,
 3031:     CURRENCY_SYMBOLS,
 3032:   } = useCurrency({ partner, location });
 3033: 
 3034:   // P0-4: Simplified - server already filters by partner
 3035:   const dishesForPartner = useMemo(() => {
 3036:     if (!allDishes) return [];
 3037:     return allDishes.filter((d) => !isDishArchived(d));
 3038:   }, [allDishes]);
 3039: 
 3040:   const categoriesForPartner = useMemo(() => {
 3041:     return allCategories || [];
 3042:   }, [allCategories]);
 3043: 
 3044:   // Get dish name for modal (moved here after dishesForPartner is declared)
 3045:   const selectedDish = useMemo(() => {
 3046:     if (!selectedDishId) return null;
 3047:     return dishesForPartner.find(d => d.id === selectedDishId);
 3048:   }, [selectedDishId, dishesForPartner]);
 3049: 
 3050:   // Channel visibility
 3051:   const channels = useGuestChannels(partner, dishesForPartner, categoriesForPartner);
 3052: 
 3053:   // Get visible mode tabs
 3054:   const visibleModeTabs = useMemo(() => {
 3055:     const tabs = [];
 3056:     
 3057:     if (channels.hall.visible) {
 3058:       tabs.push({
 3059:         id: "hall",
 3060:         label: t('mode.hall'),
 3061:         Icon: Store,
 3062:         available: channels.hall.available,
 3063:         disabled: channels.hall.disabled,
 3064:       });
 3065:     }
 3066:     
 3067:     if (channels.pickup.visible) {
 3068:       tabs.push({
 3069:         id: "pickup",
 3070:         label: t('mode.pickup'),
 3071:         Icon: Package,
 3072:         available: channels.pickup.available,
 3073:         disabled: channels.pickup.disabled,
 3074:       });
 3075:     }
 3076:     
 3077:     if (channels.delivery.visible) {
 3078:       tabs.push({
 3079:         id: "delivery",
 3080:         label: t('mode.delivery'),
 3081:         Icon: Truck,
 3082:         available: channels.delivery.available,
 3083:         disabled: channels.delivery.disabled,
 3084:       });
 3085:     }
 3086:     
 3087:     return tabs;
 3088:   }, [channels, t]);
 3089: 
 3090:   // Check if current mode is valid and redirect if needed
 3091:   useEffect(() => {
 3092:     if (!partner || loadingDishes) return;
 3093: 
 3094:     const currentModeChannel = channels[orderMode];
 3095:     
 3096:     if (!currentModeChannel?.visible || !currentModeChannel?.available) {
 3097:       const firstAvailable = visibleModeTabs.find((tab) => tab.available);
 3098:       
 3099:       if (firstAvailable && firstAvailable.id !== orderMode) {
 3100:         const originalMode = orderMode;
 3101:         setOrderMode(firstAvailable.id);
 3102:         
 3103:         const url = new URL(window.location.href);
 3104:         url.searchParams.set("mode", firstAvailable.id);
 3105:         window.history.replaceState({}, "", url.toString());
 3106:         
 3107:         const modeLabels = {
 3108:           hall: t('mode.hall'),
 3109:           pickup: t('mode.pickup'),
 3110:           delivery: t('mode.delivery'),
 3111:         };
 3112:         setRedirectBanner({
 3113:           originalMode: modeLabels[originalMode] || originalMode,
 3114:           newMode: modeLabels[firstAvailable.id] || firstAvailable.id,
 3115:         });
 3116: 
 3117:         const timerId = setTimeout(() => setRedirectBanner(null), 5000);
 3118:         return () => clearTimeout(timerId);
 3119:       }
 3120:     }
 3121:   }, [partner, loadingDishes, channels, orderMode, visibleModeTabs, t]);
 3122: 
 3123:   const visibleDishes = useMemo(() => {
 3124:     return dishesForPartner.filter((dish) => isDishEnabledForMode(dish, orderMode));
 3125:   }, [dishesForPartner, orderMode]);
 3126: 
 3127:   const sortedCategoriesAll = useMemo(() => sortCategoriesStable(categoriesForPartner), [categoriesForPartner]);
 3128: 
 3129:   const visibleCategoryIds = useMemo(() => {
 3130:     return getVisibleCategoryIds({
 3131:       categories: sortedCategoriesAll,
 3132:       dishes: visibleDishes,
 3133:       mode: orderMode,
 3134:       includeDisabledCategories: false,
 3135:     });
 3136:   }, [sortedCategoriesAll, visibleDishes, orderMode]);
 3137: 
 3138:   const sortedCategories = useMemo(() => {
 3139:     return sortedCategoriesAll.filter((c) => visibleCategoryIds.includes(c.id));
 3140:   }, [sortedCategoriesAll, visibleCategoryIds]);
 3141: 
 3142:   const groupedDishes = useMemo(() => {
 3143:     const dishesByCategory = buildDishesByCategory({
 3144:       categories: sortedCategoriesAll,
 3145:       dishes: visibleDishes,
 3146:       mode: orderMode,
 3147:       includeDisabledCategories: false,
 3148:     });
 3149: 
 3150:     const groups = {};
 3151:     for (const [catId, dishList] of dishesByCategory.entries()) {
 3152:       if (catId === "__uncat__") {
 3153:         if (dishList.length > 0) groups["no-category"] = dishList;
 3154:       } else {
 3155:         if (dishList.length > 0) groups[catId] = dishList;
 3156:       }
 3157:     }
 3158: 
 3159:     return groups;
 3160:   }, [sortedCategoriesAll, visibleDishes, orderMode]);
 3161: 
 3162:   const cartTotalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
 3163:   const cartTotalAmount = parseFloat(cart.reduce((acc, item) => acc + Math.round(item.price * item.quantity * 100) / 100, 0).toFixed(2));
 3164: 
 3165:   // Loyalty hook
 3166:   const {
 3167:     customerEmail,
 3168:     setCustomerEmail,
 3169:     loyaltyAccount,
 3170:     setLoyaltyAccount,
 3171:     loyaltyLoading,
 3172:     redeemedPoints,
 3173:     setRedeemedPoints,
 3174:     discountAmount,
 3175:     pointsDiscountAmount,
 3176:     finalTotal,
 3177:     earnedPoints,
 3178:     maxRedeemPoints,
 3179:   } = useLoyalty({ partner, cartTotalAmount });
 3180: 
 3181:   // Loyalty visibility flags
 3182:   const loyaltyEnabled = partner?.loyalty_enabled === true;
 3183:   const discountEnabled = partner?.discount_enabled === true;
 3184:   const showLoyaltySection = (loyaltyEnabled || discountEnabled) && cart.length > 0;
 3185: 
 3186:   // TableSession hook
 3187:   const {
 3188:     tableSession,
 3189:     setTableSession,
 3190:     currentGuest,
 3191:     setCurrentGuest,
 3192:     sessionOrders,
 3193:     setSessionOrders,
 3194:     sessionGuests,
 3195:     setSessionGuests,
 3196:     sessionItems,
 3197:     setSessionItems,
 3198:     itemsByOrder,
 3199:     billsByGuest,
 3200:     myBill,
 3201:     myOrders,
 3202:     otherGuestsBills,
 3203:     othersTotal,
 3204:     tableTotal,
 3205:     stagesMap,
 3206:     getOrderStatus,
 3207:     saveGuestId,
 3208:     sessionIdRef,
 3209:     currentGuestIdRef,
 3210:   } = useTableSession({
 3211:     partner,
 3212:     isHallMode,
 3213:     isTableVerified,
 3214:     currentTableId,
 3215:     orderStages,
 3216:     cartTotalAmount,
 3217:     getLinkId,
 3218:     isRateLimitError,
 3219:     t,
 3220:   });
 3221: 
 3222:   // Reviews hook
 3223:   const {
 3224:     reviewedItems,
 3225:     draftRatings,
 3226:     updateDraftRating,
 3227:     reviewableItems,
 3228:     otherGuestsReviewableItems,
 3229:     openReviewDialog,
 3230:     reviewDialogOpen,
 3231:     setReviewDialogOpen,
 3232:     reviewingItems,
 3233:     ratings,
 3234:     setRatings,
 3235:     submittingReview,
 3236:     handleSubmitReviews,
 3237:   } = useReviews({
 3238:     partner,
 3239:     currentTableId,
 3240:     currentGuest,
 3241:     myOrders,
 3242:     sessionOrders,
 3243:     itemsByOrder,
 3244:     stagesMap,
 3245:     getLinkId,
 3246:     loyaltyAccount,
 3247:     setLoyaltyAccount,
 3248:     toast,
 3249:     t,
 3250:   });
 3251: 
 3252:   // Rating-first flow (TASK-260130-09-FIX4): show prompt after first draft rating
 3253:   // MOVED HERE after useReviews to avoid TDZ (draftRatings, reviewableItems must exist)
 3254:   const hasAnyDraftRating = !!draftRatings && Object.keys(draftRatings).length > 0;
 3255:   const showRatingBlock = reviewableItems?.length > 0;
 3256:   const showLoginPromptAfterRating = loyaltyEnabled && !loyaltyAccount && showRatingBlock && hasAnyDraftRating;
 3257: 
 3258:   // Handle instant dish rating (save on star click)
 3259:   const handleRateDish = async ({ itemId, dishId, orderId, rating }) => {
 3260:     if (!dishId || !rating || ratingSavingByItemId[itemId]) return;
 3261:     
 3262:     setRatingSavingByItemId(prev => ({ ...prev, [itemId]: true }));
 3263:     
 3264:     try {
 3265:       await base44.entities.DishFeedback.create({
 3266:         partner: partner.id,
 3267:         dish: dishId,
 3268:         order: orderId,
 3269:         rating: rating,
 3270:         reviewed_by: currentGuest?.id || 'guest',
 3271:         order_item: itemId,
 3272:         guest: currentGuest?.id,
 3273:         author_type: loyaltyAccount ? 'loyalty' : 'anonymous',
 3274:         loyalty_account: loyaltyAccount?.id || undefined,
 3275:         points_awarded: 0,
 3276:       });
 3277:       
 3278:       toast.success(t('review.thanks'), { id: 'mm1' });
 3279:       
 3280:       // Track that user has rated in this session
 3281:       setHasRatedInSession(true);
 3282:       
 3283:       // Refresh ratings
 3284:       queryClient.invalidateQueries({ queryKey: ["dishFeedbacksRecent", partnerId] });
 3285:       
 3286:     } catch (err) {
 3287:       // silent
 3288:       toast.error(t('error.save_failed'), { id: 'mm1' });
 3289:       // BUG-PM-028: Roll back draft rating so user can retry
 3290:       updateDraftRating(itemId, 0);
 3291:     } finally {
 3292:       setRatingSavingByItemId(prev => ({ ...prev, [itemId]: false }));
 3293:     }
 3294:   };
 3295: 
 3296:   // Show cart button in hall mode: always when table verified, or when cart has items (even before verification)
 3297:   // TASK-260201-01: StickyBar Ð²Ð¸Ð´ÐµÐ½ Ð’Ð¡Ð•Ð"Ð"Ð Ð¿Ñ€Ð¸ Ð²ÐµÑ€Ð¸Ñ„Ð¸Ñ†Ð¸Ñ€Ð¾Ð²Ð°Ð½Ð½Ð¾Ð¼ ÑÑ‚Ð¾Ð»Ðµ
 3298:   // Ð­Ñ‚Ð¾ Ñ€ÐµÑˆÐ°ÐµÑ‚ Ð¿Ñ€Ð¾Ð±Ð»ÐµÐ¼Ñƒ F5 â€" Ð½Ðµ Ð½ÑƒÐ¶Ð½Ð¾ Ð¶Ð´Ð°Ñ‚ÑŒ Ð²Ð¾ÑÑÑ‚Ð°Ð½Ð¾Ð²Ð»ÐµÐ½Ð¸Ñ session/orders
 3299:   const showCartButton = isHallMode && (isTableVerified || (cart?.length || 0) > 0);
 3300: 
 3301:   // After F5, table is verified from localStorage but session data is still loading from server
 3302:   // Time-bounded: after 3s assume no session exists (prevents permanent "loading" for new visits)
 3303:   const [sessionCheckTimedOut, setSessionCheckTimedOut] = useState(false);
 3304:   useEffect(() => {
 3305:     if (!isTableVerified || tableSession) return;
 3306:     const timer = setTimeout(() => setSessionCheckTimedOut(true), 3000);
 3307:     return () => clearTimeout(timer);
 3308:   }, [isTableVerified, tableSession]);
 3309:   const isSessionLoading = isTableVerified && !tableSession && !sessionCheckTimedOut;
 3310: 
 3311:   // Just-in-time: auto-submit after table verification via confirmation sheet
 3312:   useEffect(() => {
 3313:     if (pendingSubmitRef.current && isTableVerified && currentTableId) {
 3314:       pendingSubmitRef.current = false;
 3315:       popOverlay('tableConfirm');
 3316:       setShowTableConfirmSheet(false);
 3317:       // Slight delay to let state propagate
 3318:       if (autoSubmitTimerRef.current) clearTimeout(autoSubmitTimerRef.current);
 3319:       autoSubmitTimerRef.current = setTimeout(() => handleSubmitOrder(), 100);
 3320:     }
 3321:     return () => {
 3322:       if (autoSubmitTimerRef.current) clearTimeout(autoSubmitTimerRef.current);
 3323:     };
 3324:   }, [isTableVerified, currentTableId]);
 3325: 
 3326:   // PM-128: Deferred pushOverlay for table confirm drawer â€" avoids disrupting vaul animation
 3327:   useEffect(() => {
 3328:     if (showTableConfirmSheet) {
 3329:       const id = setTimeout(() => pushOverlay('tableConfirm'), 50);
 3330:       return () => clearTimeout(id);
 3331:     }
 3332:   }, [showTableConfirmSheet, pushOverlay]);
 3333: 
 3334:   // Hall StickyBar mode: Ð¾Ð¿Ñ€ÐµÐ´ÐµÐ»ÑÐµÐ¼ Ñ‡Ñ‚Ð¾ Ð¿Ð¾ÐºÐ°Ð·Ñ‹Ð²Ð°Ñ‚ÑŒ
 3335:   const hallStickyMode =
 3336:     (cart?.length || 0) > 0
 3337:       ? "cart"
 3338:       : (myOrders?.length || 0) > 0
 3339:         ? "myBill"
 3340:         : (sessionOrders?.length || 0) > 0
 3341:           ? "tableOrders"
 3342:           : "cartEmpty";
 3343: 
 3344:   // Hall StickyBar label: Ñ‚ÐµÐºÑÑ‚ ÐºÐ½Ð¾Ð¿ÐºÐ¸
 3345:   const hallStickyButtonLabel =
 3346:     hallStickyMode === "cart"
 3347:       ? tr("cart.checkout", "Checkout")
 3348:       : hallStickyMode === "myBill"
 3349:         ? tr("cart.my_bill", "My bill")
 3350:         : hallStickyMode === "tableOrders"
 3351:           ? tr("cart.table_orders", "Table orders")
 3352:           : isSessionLoading
 3353:             ? tr("common.loading", "Loading...")
 3354:             : tr("cart.view", "Open");
 3355: 
 3356:   // Hall StickyBar: Ð·Ð°Ð³Ð¾Ð»Ð¾Ð²Ð¾Ðº (Ð´Ð»Ñ Ñ€ÐµÐ¶Ð¸Ð¼Ð¾Ð² Ð±ÐµÐ· ÐºÐ¾Ñ€Ð·Ð¸Ð½Ñ‹)
 3357:   const hallStickyModeLabel =
 3358:     hallStickyMode === "myBill"
 3359:       ? tr("cart.my_bill", "My bill")
 3360:       : hallStickyMode === "tableOrders"
 3361:         ? tr("cart.table_orders", "Table orders")
 3362:         : tr("cart.your_orders", "Your orders");
 3363: 
 3364:   // Hall StickyBar: ÑÑƒÐ¼Ð¼Ð° Ð´Ð»Ñ Ð¿Ð¾ÐºÐ°Ð·Ð°
 3365:   const hallStickyBillTotal =
 3366:     hallStickyMode === "myBill"
 3367:       ? formatPrice(parseFloat((myBill.total || 0).toFixed(2)))
 3368:       : hallStickyMode === "tableOrders"
 3369:         ? formatPrice(parseFloat((tableTotal || 0).toFixed(2)))
 3370:         : "";
 3371: 
 3372:   // Hall StickyBar: Ð¿Ð¾ÐºÐ°Ð·Ñ‹Ð²Ð°Ñ‚ÑŒ Ð»Ð¸ ÑÑƒÐ¼Ð¼Ñƒ
 3373:   const hallStickyShowBillAmount = hallStickyMode === "myBill" || hallStickyMode === "tableOrders";
 3374: 
 3375:   // Hall StickyBar: loading state
 3376:   const hallStickyIsLoadingBill = 
 3377:     (hallStickyMode === "myBill" || hallStickyMode === "tableOrders") && 
 3378:     (sessionItems.length === 0 && sessionOrders.length > 0);
 3379: 
 3380:   // Generate guest code for Hall mode (if enabled)
 3381:   useEffect(() => {
 3382:     if (!isHallMode || !hallGuestCodeEnabled) return;
 3383:     
 3384:     try {
 3385:       // P2-2: Should be tied to partner, but keeping simple for now
 3386:       let code = localStorage.getItem("menu_guest_code");
 3387:       if (!code) {
 3388:         code = String(Math.floor(1000 + Math.random() * 9000));
 3389:         localStorage.setItem("menu_guest_code", code);
 3390:       }
 3391:       setGuestCode(code);
 3392:     } catch (e) {
 3393:       // silent
 3394:     }
 3395:   }, [isHallMode, hallGuestCodeEnabled]);
 3396: 
 3397:   // P0-2: Removed legacy table_id/table_slug handling
 3398:   // Only explicit table code from URL triggers hall mode verification
 3399:   useEffect(() => {
 3400:     if (tableCodeParam && orderMode !== "hall") {
 3401:       setOrderMode("hall");
 3402:     }
 3403:   }, [tableCodeParam, orderMode]);
 3404: 
 3405:   // Scroll spy
 3406:   useEffect(() => {
 3407:     if (view !== "menu") return;
 3408: 
 3409:     let rafId;
 3410:     let ticking = false;
 3411: 
 3412:     const onScroll = () => {
 3413:       if (ticking) return;
 3414:       ticking = true;
 3415: 
 3416:       rafId = window.requestAnimationFrame(() => {
 3417:         if (isManualScroll.current) {
 3418:           ticking = false;
 3419:           return;
 3420:         }
 3421: 
 3422:         if (window.scrollY < 50) {
 3423:           setActiveCategoryKey("all");
 3424:           ticking = false;
 3425:           return;
 3426:         }
 3427: 
 3428:         let currentActive = "all";
 3429:         for (const cat of sortedCategories) {
 3430:           const el = sectionRefs.current[cat.id];
 3431:           if (!el) continue;
 3432:           const rect = el.getBoundingClientRect();
 3433:           if (rect.top < SCROLL_SPY_OFFSET_PX) currentActive = cat.id;
 3434:         }
 3435: 
 3436:         setActiveCategoryKey(currentActive);
 3437:         ticking = false;
 3438:       });
 3439:     };
 3440: 
 3441:     window.addEventListener("scroll", onScroll, { passive: true });
 3442:     return () => {
 3443:       window.removeEventListener("scroll", onScroll);
 3444:       if (rafId) cancelAnimationFrame(rafId);
 3445:     };
 3446:   }, [sortedCategories, view]);
 3447: 
 3448:   useEffect(() => {
 3449:     if (view !== "menu") return;
 3450:     const chip = chipRefs.current[activeCategoryKey];
 3451:     if (chip) chip.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "start" });
 3452:   }, [activeCategoryKey, view]);
 3453: 
 3454:   const handleCategoryClick = (key) => {
 3455:     isManualScroll.current = true;
 3456:     setActiveCategoryKey(key);
 3457: 
 3458:     if (key === "all") listTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
 3459:     else sectionRefs.current[key]?.scrollIntoView({ behavior: "smooth", block: "start" });
 3460: 
 3461:     setTimeout(() => {
 3462:       isManualScroll.current = false;
 3463:     }, MANUAL_SCROLL_LOCK_MS);
 3464:   };
 3465: 
 3466: 
 3467: 
 3468:   const handleModeChange = (mode) => {
 3469:     const channel = channels[mode];
 3470:     if (!channel?.available) {
 3471:       return;
 3472:     }
 3473: 
 3474:     const normalized = normalizeMode(mode);
 3475:     setOrderMode(normalized);
 3476: 
 3477:     const url = new URL(window.location.href);
 3478:     url.searchParams.set("mode", normalized);
 3479:     window.history.replaceState({}, "", url.toString());
 3480: 
 3481:     try {
 3482:       localStorage.setItem("menu_preview_mode", normalized);
 3483:     } catch {}
 3484: 
 3485:     // FIX P1: Revalidate cart on mode change â€" drop items not available in new mode
 3486:     setCart((prev) => {
 3487:       if (!allDishes || prev.length === 0) return prev;
 3488:       const filtered = prev.filter((cartItem) => {
 3489:         const dish = allDishes.find((d) => d.id === cartItem.dishId);
 3490:         return dish && isDishEnabledForMode(dish, normalized);
 3491:       });
 3492:       if (filtered.length < prev.length) {
 3493:         const removed = prev.length - filtered.length;
 3494:         toast.info(t('cart.items_removed_mode_switch', { count: removed }), { duration: 3000 });
 3495:       }
 3496:       return filtered;
 3497:     });
 3498: 
 3499:     setView("menu");
 3500:     setErrors({});
 3501:     setSubmitError(null);
 3502:     setRedirectBanner(null);
 3503:   };
 3504: 
 3505:   // Cart handlers - P1-8: use translated name
 3506:   const addToCart = (dish) => {
 3507:     const translatedName = getDishName(dish);
 3508:     setCart((prev) => {
 3509:       const existing = prev.find((i) => i.dishId === dish.id);
 3510:       if (existing) {
 3511:         return prev.map((i) => (i.dishId === dish.id ? { ...i, quantity: i.quantity + 1 } : i));
 3512:       }
 3513:       return [...prev, {
 3514:         dishId: dish.id,
 3515:         name: translatedName,
 3516:         originalName: dish.name,
 3517:         price: dish.price,
 3518:         quantity: 1
 3519:       }];
 3520:     });
 3521:     // AC-09: Toast handled by MenuView custom toast (PM-103: removed duplicate sonner call)
 3522:   };
 3523: 
 3524:   const updateQuantity = (dishId, delta) => {
 3525:     setCart((prev) =>
 3526:       prev
 3527:         .map((item) => (item.dishId === dishId ? { ...item, quantity: item.quantity + delta } : item))
 3528:         .filter((item) => item.quantity > 0)
 3529:     );
 3530:   };
 3531: 
 3532:   const clearCart = () => {
 3533:     setCart([]);
 3534:     setCustomerEmail('');
 3535:     setLoyaltyAccount(null);
 3536:     setRedeemedPoints(0);
 3537:   };
 3538: 
 3539:   // Check bill cooldown on mount
 3540:   useEffect(() => {
 3541:     if (currentTableId) {
 3542:       setBillCooldown(isBillOnCooldown(currentTableId));
 3543:     }
 3544:   }, [currentTableId]);
 3545: 
 3546:   // PM-152: Clear guest name when table changes â€" localStorage-based (survives Chrome kill)
 3547:   useEffect(() => {
 3548:     if (!tableCodeParam) return;
 3549:     try {
 3550:       const lastTable = localStorage.getItem('menuapp_last_table');
 3551:       if (lastTable && lastTable !== tableCodeParam) {
 3552:         localStorage.removeItem('menuapp_guest_name');
 3553:         setGuestNameInput('');
 3554:       }
 3555:       localStorage.setItem('menuapp_last_table', tableCodeParam);
 3556:     } catch(e) {}
 3557:   }, [tableCodeParam]);
 3558: 
 3559:   // Debug hook kept as no-op to maintain hook order (BUG-PM-040: removed prod logging)
 3560:   useEffect(() => {}, []);
 3561: 
 3562:   // PM-S81-15 + PM-105: Android back button closes topmost overlay (stack-based)
 3563:   useEffect(() => {
 3564:     const handlePopState = () => {
 3565:       // PM-107: If popOverlay triggered this back, skip â€" sheet already closed
 3566:       if (isProgrammaticCloseRef.current) {
 3567:         isProgrammaticCloseRef.current = false;
 3568:         return;
 3569:       }
 3570:       const stack = overlayStackRef.current;
 3571:       if (stack.length === 0) return; // No overlay open â€" let browser handle normally
 3572: 
 3573:       isPopStateClosingRef.current = true;
 3574:       const topOverlay = stack[stack.length - 1];
 3575:       overlayStackRef.current = stack.slice(0, -1);
 3576: 
 3577:       switch (topOverlay) {
 3578:         case 'tableConfirm':
 3579:           pendingSubmitRef.current = false;
 3580:           setShowTableConfirmSheet(false);
 3581:           break;
 3582:         case 'cart':
 3583:           if (isSubmitting) {
 3584:             // Re-push to prevent closing during submit
 3585:             overlayStackRef.current = [...overlayStackRef.current, 'cart'];
 3586:             window.history.pushState({ sheet: 'cart' }, '');
 3587:           } else {
 3588:             setDrawerMode(null);
 3589:           }
 3590:           break;
 3591:         case 'detailDish':
 3592:           setDetailDish(null);
 3593:           break;
 3594:         case 'help':
 3595:           setIsHelpModalOpen(false);
 3596:           break;
 3597:       }
 3598:       isPopStateClosingRef.current = false;
 3599:     };
 3600:     window.addEventListener('popstate', handlePopState);
 3601:     return () => window.removeEventListener('popstate', handlePopState);
 3602:   }, [isSubmitting]);
 3603: 
 3604:   // P0-7: Removed handleTableSelection - no dropdown
 3605: 
 3606:   // Phone input
 3607:   const handlePhoneChange = (e) => {
 3608:     const val = e.target.value;
 3609:     if (!val) {
 3610:       setClientPhone("");
 3611:       return;
 3612:     }
 3613:     const hasPlus = val.startsWith("+");
 3614:     const digitsOnly = val.replace(/\D/g, "");
 3615:     setClientPhone(hasPlus ? "+" + digitsOnly : digitsOnly);
 3616:   };
 3617: 
 3618:   const handlePhoneFocus = () => {
 3619:     if (!clientPhone) setClientPhone("+");
 3620:   };
 3621: 
 3622:   const validate = () => {
 3623:     const newErrors = {};
 3624:     const raw = (clientPhone || "").trim();
 3625: 
 3626:     const checkPhone = () => {
 3627:       if (!/^\+?\d*$/.test(raw)) return t('error.phone_invalid');
 3628:       const digitsCount = raw.replace(/\D/g, "").length;
 3629:       if (digitsCount < 8) return t('error.phone_short');
 3630:       if (digitsCount > 15) return t('error.phone_long');
 3631:       return null;
 3632:     };
 3633: 
 3634:     if (orderMode === "hall") {
 3635:       // P0-1: Hall mode - table MUST be verified with real ID
 3636:       if (!currentTableId) {
 3637:         newErrors.tableSelection = t('error.table_required');
 3638:       }
 3639:       if (raw) {
 3640:         const err = checkPhone();
 3641:         if (err) newErrors.clientPhone = err;
 3642:       }
 3643:     } else {
 3644:       if (!clientName.trim()) newErrors.clientName = t('error.name_required');
 3645: 
 3646:       if (!raw) newErrors.clientPhone = t('error.phone_required');
 3647:       else {
 3648:         const err = checkPhone();
 3649:         if (err) newErrors.clientPhone = err;
 3650:       }
 3651: 
 3652:       if (orderMode === "delivery" && !deliveryAddress.trim()) {
 3653:         newErrors.deliveryAddress = t('error.address_required');
 3654:       }
 3655:     }
 3656: 
 3657:     setErrors(newErrors);
 3658:     // Change 2b: Scroll to first error field on validation failure
 3659:     if (Object.keys(newErrors).length > 0) {
 3660:       const firstKey = Object.keys(newErrors)[0];
 3661:       requestAnimationFrame(() => {
 3662:         const el = document.querySelector(`[data-field="${firstKey}"]`);
 3663:         if (el) {
 3664:           el.scrollIntoView({ behavior: 'smooth', block: 'center' });
 3665:         }
 3666:       });
 3667:     }
 3668:     return Object.keys(newErrors).length === 0;
 3669:   };
 3670: 
 3671:   // P1-4: Anti-spam with partner filter
 3672:   const checkRateLimit = async () => {
 3673:     if (!clientPhone) return true;
 3674: 
 3675:     try {
 3676:       const recentOrders = await base44.entities.Order.filter({
 3677:         partner: partner.id,
 3678:         client_phone: clientPhone,
 3679:       });
 3680:       
 3681:       const now = new Date();
 3682:       const thresholdMinutes = 15;
 3683:       const limitCount = 3;
 3684:       const activeStatuses = ["new", "accepted", "in_progress", "ready"]; 
 3685: 
 3686:       const recentUserOrders = recentOrders.filter((o) => {
 3687:         if (!activeStatuses.includes(o.status)) return false;
 3688: 
 3689:         const created = new Date(o.created_date);
 3690:         const diffMinutes = (now - created) / 1000 / 60;
 3691:         return diffMinutes <= thresholdMinutes;
 3692:       });
 3693: 
 3694:       return recentUserOrders.length < limitCount;
 3695:     } catch (e) {
 3696:       // silent
 3697:       return true;
 3698:     }
 3699:   };
 3700: 
 3701: 
 3702: 
 3703:   // Submit order
 3704:   // Process hall order (P0-2: accepts validatedSession to avoid stale closure)
 3705:   const processHallOrder = async (guestToUse, validatedSession) => {
 3706:     try {
 3707:       // Handle loyalty account (find or create if email provided)
 3708:       let loyaltyAccountToUse = loyaltyAccount;
 3709:       if (customerEmail && customerEmail.trim() && !loyaltyAccountToUse) {
 3710:         const emailLower = customerEmail.trim().toLowerCase();
 3711:         const existingAccounts = await base44.entities.LoyaltyAccount.filter({
 3712:           partner: partner.id,
 3713:           email: emailLower
 3714:         });
 3715:         
 3716:         if (existingAccounts && existingAccounts.length > 0) {
 3717:           loyaltyAccountToUse = existingAccounts[0];
 3718:         } else if (loyaltyEnabled) {
 3719:           loyaltyAccountToUse = await base44.entities.LoyaltyAccount.create({
 3720:             partner: partner.id,
 3721:             email: emailLower,
 3722:             balance: 0,
 3723:             total_earned: 0,
 3724:             total_spent: 0,
 3725:             total_expired: 0,
 3726:             visit_count: 0
 3727:           });
 3728:         }
 3729:       }
 3730: 
 3731:       // Validate points redemption
 3732:       if (redeemedPoints > 0) {
 3733:         if (!loyaltyAccountToUse || loyaltyAccountToUse.balance < redeemedPoints) {
 3734:           toast.error(t('loyalty.insufficient_points'), { id: 'mm1' });
 3735:           return false;
 3736:         }
 3737:       }
 3738: 
 3739:       // Get start stage for this order type
 3740:       const startStage = getStartStage(orderStages, orderMode);
 3741: 
 3742:       // Save table selection BEFORE order creation loop
 3743:       if (partner?.id && currentTableId) saveTableSelection(partner.id, currentTableId);
 3744: 
 3745:       // Split-order: create N Orders (1 per cart line) instead of 1 Order + N OrderItems
 3746:       const cartSubtotal = cartTotalAmount; // use same rounded value as discount computation
 3747:       const totalDiscount = discountAmount + pointsDiscountAmount;
 3748: 
 3749:       // Base orderData — shared fields (per-item fields added in loop)
 3750:       const baseOrderData = {
 3751:         partner: partner.id,
 3752:         order_type: 'hall',
 3753:         status: "new",
 3754:         stage_id: startStage?.id || null,
 3755:         payment_status: "unpaid",
 3756:         comment: comment || undefined,
 3757:         client_phone: clientPhone || undefined,
 3758:         client_email: customerEmail && customerEmail.trim() ? customerEmail.trim().toLowerCase() : undefined,
 3759:         table: currentTableId,
 3760:         table_session: validatedSession?.id ?? null,
 3761:         guest: guestToUse?.id || null,
 3762:         loyalty_account: loyaltyAccountToUse?.id || null,
 3763:         points_redeemed: redeemedPoints || 0,
 3764:       };
 3765: 
 3766:       // Loop: create N Orders, accumulate order numbers
 3767:       const createdOrders = [];
 3768:       let currentPartnerState = { ...partner };
 3769:       let accumulatedDiscount = 0;
 3770: 
 3771:       for (let idx = 0; idx < cart.length; idx++) {
 3772:         const item = cart[idx];
 3773:         const itemGross = Math.round(item.price * item.quantity * 100) / 100;
 3774: 
 3775:         // Proportional discount; last item absorbs rounding remainder
 3776:         let itemDiscount;
 3777:         if (cartSubtotal <= 0) {
 3778:           itemDiscount = 0;
 3779:         } else if (idx < cart.length - 1) {
 3780:           itemDiscount = parseFloat((totalDiscount * (itemGross / cartSubtotal)).toFixed(2));
 3781:         } else {
 3782:           itemDiscount = parseFloat((totalDiscount - accumulatedDiscount).toFixed(2));
 3783:         }
 3784:         // Clamp: itemTotal must not go below 0
 3785:         const itemTotal = Math.max(0, parseFloat((itemGross - itemDiscount).toFixed(2)));
 3786:         accumulatedDiscount += itemDiscount;
 3787: 
 3788:         // Sequential order number (accumulate state across loop)
 3789:         const { orderNumber: itemOrderNumber, updatedCounters: itemCounters } =
 3790:           getNextOrderNumber(currentPartnerState, 'hall');
 3791:         currentPartnerState = { ...currentPartnerState, ...itemCounters };
 3792: 
 3793:         const itemOrderData = {
 3794:           ...baseOrderData,
 3795:           total_amount: itemTotal,
 3796:           discount_amount: itemDiscount,
 3797:           order_number: itemOrderNumber,
 3798:           public_token: Math.random().toString(36).substring(2, 10),
 3799:         };
 3800: 
 3801:         const createdOrder = await base44.entities.Order.create(itemOrderData);
 3802:         createdOrders.push(createdOrder);
 3803: 
 3804:         await base44.entities.OrderItem.create({
 3805:           order: createdOrder.id,
 3806:           dish: item.dishId,
 3807:           dish_name: item.name,
 3808:           dish_price: item.price,
 3809:           quantity: item.quantity,
 3810:           line_total: itemGross,
 3811:           split_type: splitType,
 3812:         });
 3813:       }
 3814: 
 3815:       // Final accumulated counters for Partner.update (once, not N times)
 3816:       const finalUpdatedCounters = {
 3817:         order_counter_hall: currentPartnerState.order_counter_hall,
 3818:         order_counter_pickup: currentPartnerState.order_counter_pickup,
 3819:         order_counter_delivery: currentPartnerState.order_counter_delivery,
 3820:         order_counter_date: currentPartnerState.order_counter_date,
 3821:       };
 3822: 
 3823:       // Post-create side effects — best-effort after items exist
 3824:       // Loyalty attaches to createdOrders[0] only (architecture decision)
 3825:       try {
 3826:         // Process points redemption AFTER items created (BUG-PM-032, P0 fix)
 3827:         if (loyaltyAccountToUse && redeemedPoints > 0) {
 3828:           await base44.entities.LoyaltyTransaction.create({
 3829:             account: loyaltyAccountToUse.id,
 3830:             type: 'redeem',
 3831:             amount: -redeemedPoints,
 3832:             description: t('loyalty.transaction.redeem')
 3833:           });
 3834: 
 3835:           await base44.entities.LoyaltyAccount.update(loyaltyAccountToUse.id, {
 3836:             balance: loyaltyAccountToUse.balance - redeemedPoints,
 3837:             total_spent: (loyaltyAccountToUse.total_spent || 0) + redeemedPoints
 3838:           });
 3839:         }
 3840:       } catch (sideEffectErr) {
 3841:         // silent
 3842:       }
 3843: 
 3844:       // Earn points after order creation — best-effort
 3845:       try {
 3846:         if (loyaltyAccountToUse && loyaltyEnabled && earnedPoints > 0) {
 3847:           const expiresAt = new Date();
 3848:           expiresAt.setDate(expiresAt.getDate() + (partner.loyalty_expiry_days || 100));
 3849: 
 3850:           await base44.entities.LoyaltyTransaction.create({
 3851:             account: loyaltyAccountToUse.id,
 3852:             type: 'earn_order',
 3853:             amount: earnedPoints,
 3854:             order: createdOrders[0].id,
 3855:             description: t('loyalty.transaction.earn_order', { orderNumber: createdOrders[0].order_number }),
 3856:             expires_at: expiresAt.toISOString()
 3857:           });
 3858: 
 3859:           const newBalance = (loyaltyAccountToUse.balance - redeemedPoints) + earnedPoints;
 3860:           await base44.entities.LoyaltyAccount.update(loyaltyAccountToUse.id, {
 3861:             balance: newBalance,
 3862:             total_earned: (loyaltyAccountToUse.total_earned || 0) + earnedPoints,
 3863:             visit_count: (loyaltyAccountToUse.visit_count || 0) + 1,
 3864:             last_visit_at: new Date().toISOString()
 3865:           });
 3866: 
 3867:           await base44.entities.Order.update(createdOrders[0].id, {
 3868:             points_earned: earnedPoints
 3869:           });
 3870:         }
 3871:       } catch (earnErr) {
 3872:         // silent
 3873:       }
 3874: 
 3875:       // Update partner counters — best-effort (once, with final accumulated counters)
 3876:       try { await base44.entities.Partner.update(partner.id, finalUpdatedCounters); } catch (e) { /* silent */ }
 3877: 
 3878:       // Update local partner cache
 3879:       queryClient.setQueryData(["publicPartner", partnerParamRaw], (prev) =>
 3880:         prev ? { ...prev, ...finalUpdatedCounters } : prev
 3881:       );
 3882: 
 3883:       // Optimistic update session data — add ALL N created orders
 3884:       // BUG-PM-004: add _optimisticAt so polling merge preserves this until server confirms
 3885:       const optimisticAt = Date.now();
 3886:       setSessionOrders(prev => {
 3887:         const existingIds = new Set(prev.map(o => String(o.id)));
 3888:         const newOpts = createdOrders
 3889:           .filter(o => !existingIds.has(String(o.id)))
 3890:           .map(o => ({ ...o, guest: guestToUse?.id, _optimisticAt: optimisticAt }));
 3891:         return [...newOpts, ...prev];
 3892:       });
 3893: 
 3894:       const tempIdBase = typeof crypto !== 'undefined' && crypto.randomUUID
 3895:         ? crypto.randomUUID()
 3896:         : `${Date.now()}_${Math.random().toString(16).slice(2)}`;
 3897: 
 3898:       // BUG-PM-004: add _optimisticAt so polling merge preserves temp items
 3899:       const allOptimisticItems = cart.map((item, i) => ({
 3900:         id: `temp_${tempIdBase}_${i}`,
 3901:         order: createdOrders[i].id,
 3902:         dish: item.dishId,
 3903:         dish_name: item.name,
 3904:         dish_price: item.price,
 3905:         quantity: item.quantity,
 3906:         line_total: Math.round(item.price * item.quantity * 100) / 100,
 3907:         split_type: splitType,
 3908:         _optimisticAt: optimisticAt,
 3909:       }));
 3910: 
 3911:       setSessionItems(prev => [...prev, ...allOptimisticItems]);
 3912: 
 3913:       // GAP-01: Save cart snapshot for confirmation screen BEFORE clearing
 3914:       // FIX P1: Use finalTotal (post-discount) instead of raw cart.reduce
 3915:       const confirmedItems = [...cart];
 3916:       const confirmedTotal = finalTotal;
 3917:       const guestLabel = guestToUse
 3918:         ? getGuestDisplayName(guestToUse)
 3919:         : null;
 3920: 
 3921:       // Clear form
 3922:       clearCart();
 3923:       clearCartStorage(partner.id);
 3924:       setSplitType('single');
 3925:       setComment("");
 3926:       setCustomerEmail('');
 3927:       setLoyaltyAccount(null);
 3928:       setRedeemedPoints(0);
 3929: 
 3930:       // GAP-01: Show confirmation screen instead of toast
 3931:       showConfirmation({
 3932:         items: confirmedItems,
 3933:         totalAmount: confirmedTotal,
 3934:         guestLabel,
 3935:         orderMode: "hall",
 3936:         publicToken: createdOrders[0].public_token,
 3937:         clientName: null,
 3938:       });
 3939: 
 3940:       return true;
 3941:     } catch (err) {
 3942:       setSubmitError(t('error.send.title'));
 3943:       return false;
 3944:     }
 3945:   };
 3946: 
 3947:   const handleSubmitOrder = async () => {
 3948:     // CODE-024: protect from double-tap
 3949:     if (submitLockRef.current) return;
 3950: 
 3951:     // PM-071: Just-in-time table confirmation BEFORE validate(),
 3952:     // because validate() rejects hall submits when !currentTableId,
 3953:     // silently blocking the BS trigger.
 3954:     if (orderMode === "hall" && !isTableVerified) {
 3955:       pendingSubmitRef.current = true;
 3956:       setShowTableConfirmSheet(true);
 3957:       return;
 3958:     }
 3959: 
 3960:     if (!validate()) return;
 3961: 
 3962:     // Empty cart guard
 3963:     if (cart.length === 0) {
 3964:       toast.error(tr('cart.empty', 'Cart is empty'), { id: 'mm1' });
 3965:       return;
 3966:     }
 3967: 
 3968:     submitLockRef.current = true;
 3969:     setIsSubmitting(true);
 3970:     setSubmitError(null);
 3971: 
 3972:     try {
 3973:       // Hall mode: handle session and guest
 3974:       if (orderMode === "hall" && isTableVerified) {
 3975:         // P0-2: Validate existing session is still valid
 3976:         let session = tableSession;
 3977:         if (session && isSessionExpired(session)) {
 3978:           // Session expired â€" close it in DB and force new one
 3979:           try {
 3980:             await base44.entities.TableSession.update(session.id, {
 3981:               status: 'expired',
 3982:               closed_at: new Date().toISOString(),
 3983:             });
 3984:           } catch (e) { /* best effort */ }
 3985:           session = null;
 3986:         }
 3987: 
 3988:         // Ensure we have a valid session
 3989:         if (!session) {
 3990:           session = await getOrCreateSession(partner.id, currentTableId);
 3991:           setTableSession(session);
 3992:           sessionIdRef.current = session?.id;
 3993:         }
 3994: 
 3995:         // P0-2: Hard guard â€" reject order if no valid session
 3996:         if (!session?.id) {
 3997:           toast.error(t('error.session_expired'), { id: 'session-err' });
 3998:           submitLockRef.current = false;
 3999:           setIsSubmitting(false);
 4000:           return;
 4001:         }
 4002: 
 4003:         // ============================================================
 4004:         // FIX-260131-07 FINAL: SAFEGUARD â€" try restore guest before creating new
 4005:         // This prevents "submit races restore" bug where guest is created
 4006:         // because currentGuest hasn't been set yet
 4007:         // ============================================================
 4008:         let guest = currentGuest;
 4009:         const normalizeId = (g) => String(g?.id ?? g?._id ?? "");
 4010: 
 4011:         if (!guest) {
 4012:           try {
 4013:             
 4014:             // 1) Try device-based lookup (all known device keys)
 4015:             const deviceIds = Array.from(new Set(
 4016:               [getDeviceId(), localStorage.getItem("menu_device_id"), localStorage.getItem("menuapp_device_id")]
 4017:                 .filter(Boolean)
 4018:                 .map(String)
 4019:             ));
 4020: 
 4021:             for (const dId of deviceIds) {
 4022:               if (guest) break;
 4023:               const found = await findGuestByDevice(session.id, dId);
 4024:               if (found) { guest = found; }
 4025:             }
 4026: 
 4027:             // 2) Try saved guestId from localStorage (ALL keys, not || )
 4028:             if (!guest) {
 4029:               const TTL_MS = 8 * 60 * 60 * 1000;
 4030:               const readGuestId = (key) => {
 4031:                 try {
 4032:                   const raw = localStorage.getItem(key);
 4033:                   if (!raw) return null;
 4034:                   const data = JSON.parse(raw);
 4035:                   const ts = data?.ts ?? data?.timestamp;
 4036:                   const gid = data?.guestId;
 4037:                   if (!gid) return null;
 4038:                   if (ts && (Date.now() - ts > TTL_MS)) return null;
 4039:                   return String(gid);
 4040:                 } catch { return null; }
 4041:               };
 4042: 
 4043:               // All possible keys
 4044:               const sessionKey = `menuApp_hall_guest_${partner.id}_${session.id}`;
 4045:               const tableKey = `menuApp_hall_guest_${partner.id}_${currentTableId}`;
 4046:               const legacyKey = `menuapp_guest_${partner.id}_${currentTableId}`;
 4047:               
 4048:               const sessionSavedId = readGuestId(sessionKey);
 4049:               const tableSavedId = readGuestId(tableKey);
 4050:               const legacySavedId = readGuestId(legacyKey);
 4051: 
 4052:               // Load guests ONCE (optimization)
 4053:               const guests = await getSessionGuests(session.id);
 4054: 
 4055:               // Try session-key first
 4056:               if (sessionSavedId) {
 4057:                 guest = (guests || []).find(g => normalizeId(g) === sessionSavedId) || null;
 4058:               }
 4059:               // If not found, try table-key
 4060:               if (!guest && tableSavedId) {
 4061:                 guest = (guests || []).find(g => normalizeId(g) === tableSavedId) || null;
 4062:               }
 4063:               // If not found, try legacy-key
 4064:               if (!guest && legacySavedId) {
 4065:                 guest = (guests || []).find(g => normalizeId(g) === legacySavedId) || null;
 4066:               }
 4067:               
 4068:               // 3) Try guest_code lookup (using already loaded guests)
 4069:               if (!guest) {
 4070:                 const guestCode = localStorage.getItem("menu_guest_code");
 4071:                 if (guestCode) {
 4072:                   guest = (guests || []).find(g => {
 4073:                     const code = g?.guest_code ?? g?.guestCode ?? g?.code ?? g?.menu_guest_code;
 4074:                     return code != null && String(code) === String(guestCode);
 4075:                   }) || null;
 4076:                 }
 4077:               }
 4078:             }
 4079: 
 4080:             // If restored â†’ sync state + storage
 4081:             if (guest) {
 4082:               const gid = normalizeId(guest);
 4083:               setCurrentGuest(guest);
 4084:               currentGuestIdRef.current = gid || null;
 4085:               if (gid) {
 4086:                 saveGuestId(partner.id, session.id, currentTableId, gid);
 4087:               }
 4088:               setSessionGuests(prev => {
 4089:                 const list = Array.isArray(prev) ? prev : [];
 4090:                 return (gid && list.some(x => normalizeId(x) === gid)) ? list : [...list, guest];
 4091:               });
 4092:             }
 4093:           } catch (e) {
 4094:             // Ignore errors, will create new guest below
 4095:           }
 4096:         }
 4097: 
 4098:         // If still no guest after safeguard â€" create new
 4099:         if (!guest) {
 4100:           const deviceId = getDeviceId();
 4101:           guest = await addGuestToSession(session.id, null, deviceId);
 4102:           const gid = normalizeId(guest);
 4103:           setCurrentGuest(guest);
 4104:           currentGuestIdRef.current = gid || null;
 4105:           setSessionGuests(prev => [...(Array.isArray(prev) ? prev : []), guest]);
 4106:           // Save guest ID for persistence across refreshes
 4107:           if (gid) {
 4108:             saveGuestId(partner.id, session.id, currentTableId, gid);
 4109:           }
 4110:         }
 4111:         // ============================================================
 4112:         // END FIX-260131-07 FINAL
 4113:         // ============================================================
 4114: 
 4115:         // Process the order (pass validated session to avoid stale closure)
 4116:         const success = await processHallOrder(guest, session);
 4117:         if (!success) {
 4118:           submitLockRef.current = false;
 4119:           setIsSubmitting(false);
 4120:           return;
 4121:         }
 4122:       } else {
 4123:         // Pickup/Delivery flow (unchanged)
 4124:         if (orderMode === "pickup" || orderMode === "delivery" || clientPhone) {
 4125:           const isAllowed = await checkRateLimit();
 4126:           if (!isAllowed) {
 4127:             setSubmitError(t('error.rate_limit'));
 4128:             submitLockRef.current = false;
 4129:             setIsSubmitting(false);
 4130:             return;
 4131:           }
 4132:         }
 4133: 
 4134:         // Handle loyalty account (find or create if email provided)
 4135:         let loyaltyAccountToUse = loyaltyAccount;
 4136:         if (customerEmail && customerEmail.trim() && !loyaltyAccountToUse) {
 4137:           const emailLower = customerEmail.trim().toLowerCase();
 4138:           const existingAccounts = await base44.entities.LoyaltyAccount.filter({
 4139:             partner: partner.id,
 4140:             email: emailLower
 4141:           });
 4142:           
 4143:           if (existingAccounts && existingAccounts.length > 0) {
 4144:             loyaltyAccountToUse = existingAccounts[0];
 4145:           } else if (loyaltyEnabled) {
 4146:             loyaltyAccountToUse = await base44.entities.LoyaltyAccount.create({
 4147:               partner: partner.id,
 4148:               email: emailLower,
 4149:               balance: 0,
 4150:               total_earned: 0,
 4151:               total_spent: 0,
 4152:               total_expired: 0,
 4153:               visit_count: 0
 4154:             });
 4155:           }
 4156:         }
 4157: 
 4158:         // Validate points redemption
 4159:         if (redeemedPoints > 0) {
 4160:           if (!loyaltyAccountToUse || loyaltyAccountToUse.balance < redeemedPoints) {
 4161:             toast.error(t('loyalty.insufficient_points'), { id: 'mm1' });
 4162:             submitLockRef.current = false;
 4163:             setIsSubmitting(false);
 4164:             return;
 4165:           }
 4166:         }
 4167: 
 4168:         // Get start stage for this order type
 4169:         const startStage = getStartStage(orderStages, orderMode);
 4170: 
 4171:         // Split-order: create N Orders (1 per cart line) for delivery/takeaway
 4172:         const cartSubtotal = cartTotalAmount; // use same rounded value as discount computation
 4173:         const totalDiscount = discountAmount + pointsDiscountAmount;
 4174: 
 4175:         // Base orderData — shared fields (per-item fields added in loop)
 4176:         const baseDeliveryOrderData = {
 4177:           partner: partner.id,
 4178:           order_type: orderMode,
 4179:           status: "new",
 4180:           stage_id: startStage?.id || null,
 4181:           payment_status: "unpaid",
 4182:           comment: comment || undefined,
 4183:           client_name: clientName || undefined,
 4184:           client_phone: clientPhone || undefined,
 4185:           client_email: customerEmail && customerEmail.trim() ? customerEmail.trim().toLowerCase() : undefined,
 4186:           delivery_address: orderMode === "delivery" ? deliveryAddress || undefined : undefined,
 4187:           loyalty_account: loyaltyAccountToUse?.id || null,
 4188:           points_redeemed: redeemedPoints || 0,
 4189:         };
 4190: 
 4191:         const createdOrders = [];
 4192:         let accumulatedDiscount = 0;
 4193: 
 4194:         for (let idx = 0; idx < cart.length; idx++) {
 4195:           const item = cart[idx];
 4196:           const itemGross = Math.round(item.price * item.quantity * 100) / 100;
 4197: 
 4198:           let itemDiscount;
 4199:           if (cartSubtotal <= 0) {
 4200:             itemDiscount = 0;
 4201:           } else if (idx < cart.length - 1) {
 4202:             itemDiscount = parseFloat((totalDiscount * (itemGross / cartSubtotal)).toFixed(2));
 4203:           } else {
 4204:             itemDiscount = parseFloat((totalDiscount - accumulatedDiscount).toFixed(2));
 4205:           }
 4206:           const itemTotal = Math.max(0, parseFloat((itemGross - itemDiscount).toFixed(2)));
 4207:           accumulatedDiscount += itemDiscount;
 4208: 
 4209:           const itemOrderData = {
 4210:             ...baseDeliveryOrderData,
 4211:             total_amount: itemTotal,
 4212:             discount_amount: itemDiscount,
 4213:             public_token: Math.random().toString(36).substring(2, 10),
 4214:           };
 4215: 
 4216:           const createdOrder = await base44.entities.Order.create(itemOrderData);
 4217:           createdOrders.push(createdOrder);
 4218: 
 4219:           await base44.entities.OrderItem.create({
 4220:             order: createdOrder.id,
 4221:             dish: item.dishId,
 4222:             dish_name: item.name,
 4223:             dish_price: item.price,
 4224:             quantity: item.quantity,
 4225:             line_total: itemGross,
 4226:           });
 4227:         }
 4228: 
 4229:         // Post-create side effects — best-effort after items exist
 4230:         // Loyalty attaches to createdOrders[0] only (architecture decision)
 4231:         try {
 4232:           if (loyaltyAccountToUse && redeemedPoints > 0) {
 4233:             await base44.entities.LoyaltyTransaction.create({
 4234:               account: loyaltyAccountToUse.id,
 4235:               type: 'redeem',
 4236:               amount: -redeemedPoints,
 4237:               description: t('loyalty.transaction.redeem')
 4238:             });
 4239: 
 4240:             await base44.entities.LoyaltyAccount.update(loyaltyAccountToUse.id, {
 4241:               balance: loyaltyAccountToUse.balance - redeemedPoints,
 4242:               total_spent: (loyaltyAccountToUse.total_spent || 0) + redeemedPoints
 4243:             });
 4244:           }
 4245:         } catch (sideEffectErr) {
 4246:           // silent
 4247:         }
 4248: 
 4249:         // Earn points after order creation — best-effort
 4250:         try {
 4251:           if (loyaltyAccountToUse && loyaltyEnabled && earnedPoints > 0) {
 4252:             const expiresAt = new Date();
 4253:             expiresAt.setDate(expiresAt.getDate() + (partner.loyalty_expiry_days || 100));
 4254: 
 4255:             await base44.entities.LoyaltyTransaction.create({
 4256:               account: loyaltyAccountToUse.id,
 4257:               type: 'earn_order',
 4258:               amount: earnedPoints,
 4259:               order: createdOrders[0].id,
 4260:               description: t('loyalty.transaction.earn_order', { orderNumber: createdOrders[0].order_number || createdOrders[0].id }),
 4261:               expires_at: expiresAt.toISOString()
 4262:             });
 4263: 
 4264:             const newBalance = (loyaltyAccountToUse.balance - redeemedPoints) + earnedPoints;
 4265:             await base44.entities.LoyaltyAccount.update(loyaltyAccountToUse.id, {
 4266:               balance: newBalance,
 4267:               total_earned: (loyaltyAccountToUse.total_earned || 0) + earnedPoints,
 4268:               visit_count: (loyaltyAccountToUse.visit_count || 0) + 1,
 4269:               last_visit_at: new Date().toISOString()
 4270:             });
 4271: 
 4272:             await base44.entities.Order.update(createdOrders[0].id, {
 4273:               points_earned: earnedPoints
 4274:             });
 4275:           }
 4276:         } catch (earnErr) {
 4277:           // silent
 4278:         }
 4279: 
 4280:         // Optimistic update session data — add ALL N created orders
 4281:         const optimisticAt = Date.now();
 4282:         setSessionOrders(prev => {
 4283:           const existingIds = new Set(prev.map(o => String(o.id)));
 4284:           const newOpts = createdOrders
 4285:             .filter(o => !existingIds.has(String(o.id)))
 4286:             .map(o => ({ ...o, _optimisticAt: optimisticAt }));
 4287:           return [...newOpts, ...prev];
 4288:         });
 4289: 
 4290:         const tempIdBase = typeof crypto !== 'undefined' && crypto.randomUUID
 4291:           ? crypto.randomUUID()
 4292:           : `${Date.now()}_${Math.random().toString(16).slice(2)}`;
 4293: 
 4294:         const allOptimisticItems = cart.map((item, i) => ({
 4295:           id: `temp_${tempIdBase}_${i}`,
 4296:           order: createdOrders[i].id,
 4297:           dish: item.dishId,
 4298:           dish_name: item.name,
 4299:           dish_price: item.price,
 4300:           quantity: item.quantity,
 4301:           line_total: Math.round(item.price * item.quantity * 100) / 100,
 4302:           _optimisticAt: optimisticAt,
 4303:         }));
 4304: 
 4305:         setSessionItems(prev => [...prev, ...allOptimisticItems]);
 4306: 
 4307:         // GAP-01: Save cart snapshot for confirmation screen BEFORE clearing
 4308:         const confirmedItems = [...cart];
 4309:         const confirmedTotal = finalTotal;
 4310:         const savedClientName = clientName;
 4311: 
 4312:         clearCart();
 4313:         clearCartStorage(partner.id);
 4314:         setClientName("");
 4315:         setClientPhone("");
 4316:         setDeliveryAddress("");
 4317:         setComment("");
 4318:         setCustomerEmail('');
 4319:         setLoyaltyAccount(null);
 4320:         setRedeemedPoints(0);
 4321: 
 4322:         // GAP-01: Show confirmation screen instead of toast + delayed transition
 4323:         showConfirmation({
 4324:           items: confirmedItems,
 4325:           totalAmount: confirmedTotal,
 4326:           guestLabel: null,
 4327:           orderMode,
 4328:           publicToken: createdOrders[0].public_token,
 4329:           clientName: savedClientName,
 4330:         });
 4331: 
 4332:       }
 4333:     } catch (err) {
 4334:       // silent
 4335:       setSubmitError(t('error.send.title'));
 4336:     } finally {
 4337:       submitLockRef.current = false;
 4338:       setIsSubmitting(false);
 4339:     }
 4340:   };
 4341: 
 4342:   // Update guest name (inline on cart page)
 4343:   const handleUpdateGuestName = async () => {
 4344:     const trimmedName = guestNameInput.trim();
 4345:     if (!trimmedName) return;
 4346: 
 4347:     try {
 4348:       // DB update only if guest record exists
 4349:       if (currentGuest?.id) {
 4350:         await base44.entities.SessionGuest.update(currentGuest.id, {
 4351:           name: trimmedName
 4352:         });
 4353:         setSessionGuests(prev => prev.map(g =>
 4354:           g.id === currentGuest.id ? { ...g, name: trimmedName } : g
 4355:         ));
 4356:       }
 4357: 
 4358:       // Always: persist locally + update state
 4359:       try { localStorage.setItem('menuapp_guest_name', trimmedName); } catch (e) { /* quota */ }
 4360:       setCurrentGuest(prev => ({ ...(prev || {}), name: trimmedName }));
 4361:       setIsEditingName(false);
 4362:       setGuestNameInput(trimmedName);
 4363: 
 4364:       toast.success(t('guest.name_saved'), { id: 'mm1' });
 4365:     } catch (err) {
 4366:       // silent
 4367:       toast.error(t('error.save_failed'), { id: 'mm1' });
 4368:     }
 4369:   };
 4370: 
 4371:   // Request bill (ServiceRequest)
 4372:   const handleCheckoutClick = () => {
 4373:     setView("checkout");
 4374:   };
 4375: 
 4376:   const handleRequestBill = async () => {
 4377:     if (billCooldown || billRequested) {
 4378:       toast.info(tr('cart.bill_already_requested', 'Bill already requested'), { id: 'mm1' });
 4379:       return;
 4380:     }
 4381:     
 4382:     setBillRequested(true);
 4383:     try {
 4384:       await base44.entities.ServiceRequest.create({
 4385:         partner: partner.id,
 4386:         table: currentTableId,
 4387:         table_session: tableSession?.id,
 4388:         request_type: 'bill',
 4389:         status: 'new',
 4390:         source: 'public'
 4391:       });
 4392:       
 4393:       setBillCooldownStorage(currentTableId);
 4394:       setBillCooldown(true);
 4395:       toast.success(tr('cart.bill_requested', 'Waiter will bring the bill'), { id: 'mm1' });
 4396:     } catch (err) {
 4397:       // silent
 4398:       toast.error(t('toast.error'), { id: 'mm1' });
 4399:       setBillRequested(false);
 4400:     }
 4401:   };
 4402: 
 4403: 
 4404: 
 4405:   // Guards
 4406:   if (!partnerParamRaw) {
 4407:     return (
 4408:       <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
 4409:         <Card className="w-full max-w-md text-center p-6">
 4410:           <p className="text-slate-700 font-medium">{t('error.partner_missing')}</p>
 4411:           <p className="text-slate-500 text-sm mt-2">
 4412:             {t('error.partner_hint')} <span className="font-mono">?partner=&lt;partner_id|slug&gt;</span>
 4413:           </p>
 4414:         </Card>
 4415:       </div>
 4416:     );
 4417:   }
 4418: 
 4419:   if (loadingPartner) {
 4420:     return (
 4421:       <div className="min-h-screen flex items-center justify-center bg-slate-50">
 4422:         <Loader2 className="w-8 h-8 animate-spin" style={{color: '#1A1A1A'}} />
 4423:       </div>
 4424:     );
 4425:   }
 4426: 
 4427:   if (partnerError) {
 4428:     return (
 4429:       <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
 4430:         <Card className="w-full max-w-md text-center p-6">
 4431:           <p className="text-slate-500">{t('error.network_error')}</p>
 4432:           <p className="text-sm text-slate-400 mt-2">{t('error.check_connection')}</p>
 4433:           <Button variant="outline" className="mt-4 min-h-[44px]" onClick={() => refetchPartner()}>
 4434:             {t('common.retry')}
 4435:           </Button>
 4436:         </Card>
 4437:       </div>
 4438:     );
 4439:   }
 4440: 
 4441:   if (!partner) {
 4442:     return (
 4443:       <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
 4444:         <Card className="w-full max-w-md text-center p-6">
 4445:           <p className="text-slate-500">{t('error.partner_not_found')}</p>
 4446:         </Card>
 4447:       </div>
 4448:     );
 4449:   }
 4450: 
 4451:   // P1-5: Error UI for failed requests
 4452:   if ((dishesError || categoriesError) && !isRateLimitError(dishesError) && !isRateLimitError(categoriesError)) {
 4453:     return (
 4454:       <ErrorState
 4455:         onRetry={() => window.location.reload()}
 4456:         t={t}
 4457:       />
 4458:     );
 4459:   }
 4460: 
 4461:   // Empty state: no content at all
 4462:   if (!loadingDishes && !channels.hasAnyContent) {
 4463:     return (
 4464:       <EmptyMenuState
 4465:         partner={partner}
 4466:         activeContactLinks={activeContactLinks}
 4467:         viewMode={viewMode}
 4468:         enabledLanguages={enabledLanguages}
 4469:         enabledCurrencies={enabledCurrencies}
 4470:         lang={lang}
 4471:         activeCurrency={activeCurrency}
 4472:         onLangChange={handleLangChange}
 4473:         onCurrencyChange={handleCurrencyChange}
 4474:         onContactClick={handleContactClick}
 4475:         isSafeUrl={isSafeUrl}
 4476:         t={t}
 4477:         CURRENCY_SYMBOLS={CURRENCY_SYMBOLS}
 4478:       />
 4479:     );
 4480:   }
 4481: 
 4482:   const getModeDescription = () => {
 4483:     switch (orderMode) {
 4484:       case "hall":
 4485:         return t('mode.hall.desc');
 4486:       case "pickup":
 4487:         return t('mode.pickup.desc');
 4488:       case "delivery":
 4489:         return t('mode.delivery.desc');
 4490:       default:
 4491:         return "";
 4492:     }
 4493:   };
 4494: 
 4495:   // ============================================================
 4496:   // HALL CHECKOUT SCREEN (TASK-260127-01: removed "Ð¡Ñ‚Ð¾Ð» Ð¿Ð¾Ð´Ñ‚Ð²ÐµÑ€Ð¶Ð´Ñ‘Ð½" block)
 4497:   // ============================================================
 4498:   const renderHallCheckoutContent = () => {
 4499:     // Table already verified - nothing special needed here
 4500:     // (table info shown in menu header, comment field below)
 4501:     if (isTableVerified && currentTableId) {
 4502:       return null;
 4503:     }
 4504: 
 4505:     // Table NOT verified - show verification options (NO dropdown per P0-7)
 4506:     const showHallOnlineBenefitsHint = !!(partner?.discount_enabled || partner?.loyalty_enabled);
 4507: 
 4508:     return (
 4509:       <div className="space-y-3">
 4510:         <div className="text-sm text-slate-700 text-center">
 4511:           {t('hall.verify.title')}
 4512:         </div>
 4513:         <div className="text-xs text-slate-500 text-center">
 4514:           {t('hall.verify.subtitle')}
 4515:         </div>
 4516:         <div className="text-xs text-slate-500 text-center">
 4517:           {t('hall.verify.benefit')}
 4518:         </div>
 4519: 
 4520:         <HallVerifyBlock
 4521:           tableCodeInput={tableCodeInput}
 4522:           setTableCodeInput={setTableCodeInput}
 4523:           isVerifyingCode={isVerifyingCode}
 4524:           codeVerificationError={codeVerificationError}
 4525:           hallGuestCodeEnabled={hallGuestCodeEnabled}
 4526:           guestCode={guestCode}
 4527:           partner={partner}
 4528:           t={t}
 4529:         />
 4530: 
 4531:         {showHallOnlineBenefitsHint && (
 4532:           <div className="text-xs text-slate-500 text-center">
 4533:             {t('hall.verify.online_benefits')}
 4534:           </div>
 4535:         )}
 4536:       </div>
 4537:     );
 4538: };
 4539: 
 4540:   return (
 4541:     <div className="min-h-screen bg-slate-50 pb-24 font-sans">
 4542:       <PublicMenuHeader
 4543:         partner={partner}
 4544:         activeContactLinks={activeContactLinks}
 4545:         viewMode={viewMode}
 4546:         enabledLanguages={enabledLanguages}
 4547:         enabledCurrencies={enabledCurrencies}
 4548:         lang={lang}
 4549:         activeCurrency={activeCurrency}
 4550:         onLangChange={handleLangChange}
 4551:         onCurrencyChange={handleCurrencyChange}
 4552:         onContactClick={handleContactClick}
 4553:         isSafeUrl={isSafeUrl}
 4554:         t={t}
 4555:         CURRENCY_SYMBOLS={CURRENCY_SYMBOLS}
 4556:       />
 4557: 
 4558:       {/* Redirect banner */}
 4559:       {redirectBanner && (
 4560:         <RedirectBanner
 4561:           redirectBanner={redirectBanner}
 4562:           onClose={() => setRedirectBanner(null)}
 4563:           t={t}
 4564:         />
 4565:       )}
 4566: 
 4567:       {/* Mode tabs */}
 4568:       {view === "menu" && visibleModeTabs.length > 0 && (
 4569:         <ModeTabs
 4570:           visibleModeTabs={visibleModeTabs}
 4571:           orderMode={orderMode}
 4572:           onModeChange={handleModeChange}
 4573:           getModeDescription={getModeDescription}
 4574:           isHallMode={isHallMode}
 4575:           isTableVerified={isTableVerified}
 4576:           currentTableId={currentTableId}
 4577:           currentTable={currentTable}
 4578:           tableCodeParam={tableCodeParam}
 4579:           resolvedTable={resolvedTable}
 4580:           verifiedByCode={verifiedByCode}
 4581:           t={t}
 4582:           primaryColor={primaryColor}
 4583:         />
 4584:       )}
 4585: 
 4586:       {/* Category chips */}
 4587:       {view === "menu" && sortedCategories.length > 1 && (
 4588:         <CategoryChips
 4589:           sortedCategories={sortedCategories}
 4590:           activeCategoryKey={activeCategoryKey}
 4591:           onCategoryClick={handleCategoryClick}
 4592:           getCategoryName={getCategoryName}
 4593:           chipRefs={chipRefs}
 4594:           t={t}
 4595:           activeColor={primaryColor}
 4596:         />
 4597:       )}
 4598: 
 4599:       {/* Menu list */}
 4600:       {view === "menu" && (
 4601:         <MenuView
 4602:           partner={partner}
 4603:           isMobile={isMobile}
 4604:           mobileLayout={mobileLayout}
 4605:           onSetMobileLayout={handleSetMobileLayout}
 4606:           showReviews={showReviews}
 4607:           dishRatings={dishRatings}
 4608:           onOpenReviews={(dishId) => setSelectedDishId(dishId)}
 4609:           listTopRef={listTopRef}
 4610:           loadingDishes={loadingDishes}
 4611:           sortedCategories={sortedCategories}
 4612:           groupedDishes={groupedDishes}
 4613:           getCategoryName={getCategoryName}
 4614:           sectionRefs={sectionRefs}
 4615:           cart={cart}
 4616:           getDishName={getDishName}
 4617:           getDishDescription={getDishDescription}
 4618:           formatPrice={formatPrice}
 4619:           addToCart={addToCart}
 4620:           updateQuantity={updateQuantity}
 4621:           onDishClick={(dish) => { setDetailDish(dish); pushOverlay('detailDish'); }}
 4622:           t={t}
 4623:         />
 4624:       )}
 4625: 
 4626:       {/* Checkout */}
 4627:       {view === "checkout" && (
 4628:         <CheckoutView
 4629:           t={t}
 4630:           setView={setView}
 4631:           cart={cart}
 4632:           updateQuantity={updateQuantity}
 4633:           formatPrice={formatPrice}
 4634:           cartTotalItems={cartTotalItems}
 4635:           cartTotalAmount={cartTotalAmount}
 4636:           clearCart={clearCart}
 4637:           showLoyaltySection={showLoyaltySection}
 4638:           customerEmail={customerEmail}
 4639:           setCustomerEmail={setCustomerEmail}
 4640:           loyaltyLoading={loyaltyLoading}
 4641:           loyaltyAccount={loyaltyAccount}
 4642:           partner={partner}
 4643:           earnedPoints={earnedPoints}
 4644:           redeemedPoints={redeemedPoints}
 4645:           setRedeemedPoints={setRedeemedPoints}
 4646:           maxRedeemPoints={maxRedeemPoints}
 4647:           discountEnabled={discountEnabled}
 4648:           discountAmount={discountAmount}
 4649:           pointsDiscountAmount={pointsDiscountAmount}
 4650:           finalTotal={finalTotal}
 4651:           loyaltyEnabled={loyaltyEnabled}
 4652:           activeCurrency={activeCurrency}
 4653:           defaultCurrency={defaultCurrency}
 4654:           orderMode={orderMode}
 4655:           renderHallCheckoutContent={renderHallCheckoutContent}
 4656:           clientName={clientName}
 4657:           setClientName={setClientName}
 4658:           clientPhone={clientPhone}
 4659:           handlePhoneChange={handlePhoneChange}
 4660:           handlePhoneFocus={handlePhoneFocus}
 4661:           deliveryAddress={deliveryAddress}
 4662:           setDeliveryAddress={setDeliveryAddress}
 4663:           comment={comment}
 4664:           setComment={setComment}
 4665:           errors={errors}
 4666:           submitError={submitError}
 4667:           isSubmitting={isSubmitting}
 4668:           handleSubmitOrder={handleSubmitOrder}
 4669:           isTableVerified={isTableVerified}
 4670:           currentTableId={currentTableId}
 4671:         />
 4672:       )}
 4673: 
 4674:       {/* GAP-01: Order Confirmation Screen */}
 4675:       {view === "confirmation" && confirmationData && (
 4676:         <OrderConfirmationScreen
 4677:           items={confirmationData.items}
 4678:           totalAmount={confirmationData.totalAmount}
 4679:           guestLabel={confirmationData.guestLabel}
 4680:           orderMode={confirmationData.orderMode}
 4681:           publicToken={confirmationData.publicToken}
 4682:           clientName={confirmationData.clientName}
 4683:           formatPrice={formatPrice}
 4684:           partner={partner}
 4685:           onBackToMenu={dismissConfirmation}
 4686:           onOpenOrders={() => {
 4687:             dismissConfirmation();
 4688:             pushOverlay('cart');
 4689:             setDrawerMode("cart");
 4690:           }}
 4691:           onTrackOrder={handleTrackOrder}
 4692:           t={t}
 4693:         />
 4694:       )}
 4695: 
 4696:       {/* GAP-02: Order Status Screen (embedded) */}
 4697:       {view === "orderstatus" && orderStatusToken && (
 4698:         <OrderStatusScreen
 4699:           token={orderStatusToken}
 4700:           partnerId={partner?.id}
 4701:           onBackToMenu={dismissOrderStatus}
 4702:           t={t}
 4703:         />
 4704:       )}
 4705: 
 4706:       {/* TASK-260203-01: Cart as Bottom Drawer */}
 4707:       <Drawer
 4708:         open={drawerMode === 'cart'}
 4709:         dismissible={!isSubmitting}
 4710:         onOpenChange={(open) => { if (!open && !isSubmitting) { popOverlay('cart'); setDrawerMode(null); } }}
 4711:       >
 4712:         <DrawerContent className="max-h-[85vh] overflow-hidden">
 4713:           <DrawerHeader className="sr-only">
 4714:             <DrawerTitle>{t('cart.title')}</DrawerTitle>
 4715:           </DrawerHeader>
 4716:           <div className="overflow-y-auto max-h-[calc(85vh-2rem)]">
 4717:             <CartView
 4718:               partner={partner}
 4719:               currentTable={currentTable}
 4720:               currentGuest={currentGuest}
 4721:               t={t}
 4722:               setView={setView}
 4723:               isEditingName={isEditingName}
 4724:               guestNameInput={guestNameInput}
 4725:               setGuestNameInput={setGuestNameInput}
 4726:               handleUpdateGuestName={handleUpdateGuestName}
 4727:               setIsEditingName={setIsEditingName}
 4728:               getGuestDisplayName={getGuestDisplayName}
 4729:               cart={cart}
 4730:               formatPrice={formatPrice}
 4731:               updateQuantity={updateQuantity}
 4732:               sessionGuests={sessionGuests}
 4733:               splitType={splitType}
 4734:               setSplitType={setSplitType}
 4735:               showLoyaltySection={showLoyaltySection}
 4736:               showLoginPromptAfterRating={showLoginPromptAfterRating}
 4737:               customerEmail={customerEmail}
 4738:               setCustomerEmail={setCustomerEmail}
 4739:               loyaltyLoading={loyaltyLoading}
 4740:               loyaltyAccount={loyaltyAccount}
 4741:               earnedPoints={earnedPoints}
 4742:               maxRedeemPoints={maxRedeemPoints}
 4743:               redeemedPoints={redeemedPoints}
 4744:               setRedeemedPoints={setRedeemedPoints}
 4745:               toast={toast}
 4746:               cartTotalAmount={cartTotalAmount}
 4747:               discountAmount={discountAmount}
 4748:               pointsDiscountAmount={pointsDiscountAmount}
 4749:               isSubmitting={isSubmitting}
 4750:               submitError={submitError}
 4751:               setSubmitError={setSubmitError}
 4752:               handleSubmitOrder={handleSubmitOrder}
 4753:               myOrders={myOrders}
 4754:               itemsByOrder={itemsByOrder}
 4755:               getOrderStatus={getOrderStatus}
 4756:               reviewedItems={reviewedItems}
 4757:               draftRatings={draftRatings}
 4758:               updateDraftRating={updateDraftRating}
 4759:               sessionItems={sessionItems}
 4760:               sessionOrders={sessionOrders}
 4761:               myBill={myBill}
 4762:               reviewableItems={reviewableItems}
 4763:               openReviewDialog={openReviewDialog}
 4764:               handleRequestBill={handleRequestBill}
 4765:               billRequested={billRequested}
 4766:               billCooldown={billCooldown}
 4767:               otherGuestsBills={otherGuestsBills}
 4768:               othersTotal={othersTotal}
 4769:               setOtherGuestsExpanded={setOtherGuestsExpanded}
 4770:               otherGuestsExpanded={otherGuestsExpanded}
 4771:               getLinkId={getLinkId}
 4772:               otherGuestsReviewableItems={otherGuestsReviewableItems}
 4773:               tableTotal={tableTotal}
 4774:               formatOrderTime={formatOrderTime}
 4775:               handleRateDish={handleRateDish}
 4776:               ratingSavingByItemId={ratingSavingByItemId}
 4777:               onClose={() => { popOverlay('cart'); setDrawerMode(null); }}
 4778:               onCallWaiter={handleHelpFromCart}
 4779:               isTableVerified={isTableVerified}
 4780:               tableCodeInput={tableCodeInput}
 4781:               setTableCodeInput={setTableCodeInput}
 4782:               isVerifyingCode={isVerifyingCode}
 4783:               verifyTableCode={verifyTableCode}
 4784:               codeVerificationError={codeVerificationError}
 4785:               hallGuestCodeEnabled={hallGuestCodeEnabled}
 4786:               guestCode={guestCode}
 4787:             />
 4788:           </div>
 4789:         </DrawerContent>
 4790:       </Drawer>
 4791: 
 4792:       {/* Just-in-time Table Confirmation Bottom Sheet (PM-064) */}
 4793:       {/* PM-071: z-[60] on DrawerContent ensures BS renders above cart Drawer (z-50) */}
 4794:       <Drawer
 4795:         open={showTableConfirmSheet}
 4796:         onOpenChange={(open) => {
 4797:           if (!open) {
 4798:             pendingSubmitRef.current = false;
 4799:             popOverlay('tableConfirm');
 4800:             setShowTableConfirmSheet(false);
 4801:             if (!isTableVerified) {
 4802:               toast(tr('cart.confirm_table.dismissed', 'Got it'), { id: 'table-dismiss' });
 4803:             }
 4804:           }
 4805:         }}
 4806:       >
 4807:         <DrawerContent className="max-h-[85dvh] rounded-t-3xl z-[60]">
 4808:           <div className="relative">
 4809:             {/* #143: Chevron close button â€" top-right */}
 4810:             <button
 4811:               onClick={() => { popOverlay('tableConfirm'); pendingSubmitRef.current = false; setShowTableConfirmSheet(false); }}
 4812:               className="absolute top-3 right-3 w-11 h-11 flex items-center justify-center rounded-full bg-gray-200 text-gray-500 z-10"
 4813:               aria-label={t('common.close', 'Ð—Ð°ÐºÑ€Ñ‹Ñ‚ÑŒ')}
 4814:             >
 4815:               <ChevronDown className="w-6 h-6" />
 4816:             </button>
 4817:             <DrawerHeader className="text-center pb-2">
 4818: 
 4819:               <DrawerTitle className="text-lg font-semibold text-slate-900">
 4820:                 {tr('cart.verify.enter_table_code', 'Enter table code')}
 4821:               </DrawerTitle>
 4822:               <p className="text-xs text-gray-400 mt-2 px-4">
 4823:                 {tr('cart.verify.helper_text', 'Enter code from your table')}
 4824:               </p>
 4825:             </DrawerHeader>
 4826:           </div>
 4827:           <div className="px-6 pb-6">
 4828:             {/* Table code input */}
 4829:             <div className="flex flex-col items-center gap-4 mt-4">
 4830:               <div className="flex gap-2 justify-center">
 4831:                 {Array.from({ length: tableCodeLength }).map((_, idx) => {
 4832:                   const safe = String(tableCodeInput || '').replace(/\D/g, '').slice(0, tableCodeLength);
 4833:                   const ch = safe[idx] || '';
 4834:                   return (
 4835:                     <div
 4836:                       key={idx}
 4837:                       className="w-10 h-12 rounded-lg border-2 border-slate-200 bg-white flex items-center justify-center text-xl font-mono text-slate-900 cursor-pointer"
 4838:                       style={{'--tw-ring-color': primaryColor}}
 4839:                       onClick={() => codeInputRef.current?.focus()}
 4840:                     >
 4841:                       {ch || <span className="text-slate-300">_</span>}
 4842:                     </div>
 4843:                   );
 4844:                 })}
 4845:               </div>
 4846:               <Input
 4847:                 ref={codeInputRef}
 4848:                 type="text"
 4849:                 inputMode="numeric"
 4850:                 pattern="[0-9]*"
 4851:                 maxLength={tableCodeLength}
 4852:                 autoFocus
 4853:                 value={String(tableCodeInput || '').replace(/\D/g, '').slice(0, tableCodeLength)}
 4854:                 onChange={(e) => {
 4855:                   const next = String(e.target.value || '').replace(/\D/g, '').slice(0, tableCodeLength);
 4856:                   if (typeof setTableCodeInput === 'function') setTableCodeInput(next);
 4857:                 }}
 4858:                 className="sr-only"
 4859:                 placeholder=""
 4860:                 aria-label={tr('cart.verify.enter_table_code', 'Enter table code')}
 4861:               />
 4862:               {isVerifyingCode && (
 4863:                 <div className="flex items-center gap-2 text-sm text-slate-500">
 4864:                   <Loader2 className="w-4 h-4 animate-spin" />
 4865:                   {t('common.loading')}
 4866:                 </div>
 4867:               )}
 4868:               {codeVerificationError && !isVerifyingCode && (
 4869:                 <p className="text-sm text-red-600 text-center">{codeVerificationError}</p>
 4870:               )}
 4871:             </div>
 4872:             {/* Bonus motivation (PM-082) */}
 4873:             {(() => {
 4874:               if (!loyaltyEnabled) return null;
 4875:               const motivationPoints = Math.round((Number(cartTotalAmount) || 0) * (Number(partner?.loyalty_points_per_currency) || 1));
 4876:               if (motivationPoints <= 0) return null;
 4877:               return (
 4878:                 <p className="text-center text-sm text-emerald-600 mt-4">
 4879:                   {tr('cart.motivation_bonus_short', `+${motivationPoints} Ð±Ð¾Ð½ÑƒÑÐ¾Ð² Ð·Ð° ÑÑ‚Ð¾Ñ‚ Ð·Ð°ÐºÐ°Ð·`)}
 4880:                 </p>
 4881:               );
 4882:             })()}
 4883:             {/* Primary CTA: Confirm and submit (PM-064 A3) */}
 4884:             <Button
 4885:               className="w-full mt-6 text-white"
 4886:               style={{ backgroundColor: primaryColor }}
 4887:               disabled={isVerifyingCode || String(tableCodeInput || '').replace(/\D/g, '').length < tableCodeLength}
 4888:               onClick={() => {
 4889:                 const code = String(tableCodeInput || '').replace(/\D/g, '').slice(0, tableCodeLength);
 4890:                 if (code.length === tableCodeLength && typeof verifyTableCode === 'function') {
 4891:                   verifyTableCode(code);
 4892:                 }
 4893:               }}
 4894:             >
 4895:               {isVerifyingCode
 4896:                 ? t('common.loading')
 4897:                 : tr('cart.confirm_table.submit', 'Send')}
 4898:             </Button>
 4899:           </div>
 4900:         </DrawerContent>
 4901:       </Drawer>
 4902: 
 4903:       {/* Floating Help Button - only when table verified in Hall */}
 4904:       {orderMode === "hall" && isTableVerified && currentTableId && (
 4905:         <div className="relative inline-block">
 4906:           <HelpFab
 4907:             fabSuccess={fabSuccess}
 4908:             isSendingHelp={isSendingHelp}
 4909:             isHelpModalOpen={isHelpModalOpen}
 4910:             onOpen={openHelpDrawer}
 4911:             t={t}
 4912:           />
 4913:           {/* HD-07: Badge showing active request count */}
 4914:           {activeRequestCount > 0 && (
 4915:             <span className="absolute -top-1 -right-1 bg-[#B5543A] text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-medium pointer-events-none z-10">
 4916:               {activeRequestCount}
 4917:             </span>
 4918:           )}
 4919:         </div>
 4920:       )}
 4921: 
 4922:       {/* PM-125: Help as Bottom Drawer (replaces HelpModal Dialog) */}
 4923:       <Drawer open={isHelpModalOpen} onOpenChange={(open) => { if (!open) closeHelpDrawer(); }}>
 4924:         <DrawerContent className="max-h-[85vh] rounded-t-2xl flex flex-col">
 4925:           {/* SOS v6.0 Header */}
 4926:           <div className="px-4 pt-2 pb-2">
 4927:             <div className="flex items-center justify-between">
 4928:               <span className="text-[17px] font-extrabold text-gray-900">
 4929:                 {tr('help.modal_title', 'Нужна помощь?')}
 4930:               </span>
 4931:               <span className="bg-orange-500 text-white rounded-xl px-3 py-0.5 text-[13px] font-bold">
 4932:                 {currentTable?.name || currentTable?.code || tr('help.table_default', 'Стол')}
 4933:               </span>
 4934:             </div>
 4935:             {activeRequestCount === 0 && (
 4936:               <p className="text-[13px] text-gray-400 mt-0.5">
 4937:                 {tr('help.subtitle_choose', 'Выберите, что нужно')}
 4938:               </p>
 4939:             )}
 4940:           </div>
 4941: 
 4942:           {/* SOS v6.0 Scroll wrapper */}
 4943:           <div className="overflow-y-auto flex-1 pb-6">
 4944:             {/* SOS v6.0 Button Grid — 3x2, in-place state */}
 4945:             <div className="grid grid-cols-2 gap-[9px] px-3.5 pt-2.5 pb-2">
 4946:               {SOS_BUTTONS.map(btn => {
 4947:                 const activeRow = activeRequests.find(r => r.type === btn.id);
 4948:                 const isActive = Boolean(activeRow);
 4949:                 const sentAt = activeRow?.sentAt;
 4950:                 const urgency = isActive ? getHelpUrgency(btn.id, sentAt) : 'neutral';
 4951:                 const timerText = isActive ? getHelpTimerStr(sentAt) : '';
 4952:                 if (isActive) {
 4953:                   const hasError = Boolean(activeRow.errorKind);
 4954:                   if (hasError) {
 4955:                     return (
 4956:                       <button key={btn.id} onClick={() => handleRetry(activeRow)}
 4957:                         className="rounded-xl border-2 border-red-400 bg-red-50 p-[11px] min-h-[70px] flex flex-col justify-between select-none active:bg-red-100">
 4958:                         <span className="text-[13px] font-extrabold text-red-800">{btn.shortLabel}</span>
 4959:                         <div className="text-[12px] font-bold text-red-600 flex items-center gap-[3px] mt-1">
 4960:                           <span className="text-[11px]">⚠</span>{tr('help.retry', 'Повторить')}
 4961:                         </div>
 4962:                       </button>
 4963:                     );
 4964:                   }
 4965:                   const s = URGENCY_STYLES[urgency] || URGENCY_STYLES.neutral;
 4966:                   return (
 4967:                     <div key={btn.id} className={`rounded-xl border-2 ${s.border} ${s.bg} p-[11px] min-h-[70px] flex flex-col justify-between select-none`}>
 4968:                       <div className="flex items-start justify-between">
 4969:                         <span className={`text-[13px] font-extrabold ${s.label}`}>{btn.shortLabel}</span>
 4970:                         <button onClick={(e) => { e.stopPropagation(); handleSosCancel(btn.id); }}
 4971:                           className={`w-[22px] h-[22px] rounded-full ${s.xBg} ${s.xColor} flex items-center justify-center text-[11px] font-extrabold -mt-0.5 flex-shrink-0`}>✕</button>
 4972:                       </div>
 4973:                       <div className={`text-[12px] font-bold ${s.timer} flex items-center gap-[3px] mt-1`}>
 4974:                         <span className="text-[11px]">⏱</span>{timerText}
 4975:                       </div>
 4976:                     </div>
 4977:                   );
 4978:                 }
 4979:                 return (
 4980:                   <button key={btn.id} onClick={() => handleCardTap(btn.id)}
 4981:                     className="rounded-xl border-2 border-gray-200 bg-gray-50 p-[11px] min-h-[70px] flex flex-row items-center gap-[9px] select-none active:bg-gray-100 active:scale-[0.97] transition-transform">
 4982:                     {btn.icon === 'layers' ? (
 4983:                       <Layers className="w-[22px] h-[22px] text-gray-500 flex-shrink-0" />
 4984:                     ) : (
 4985:                       <span className="text-xl leading-none flex-shrink-0">{btn.emoji}</span>
 4986:                     )}
 4987:                     <span className="text-[13px] font-bold text-gray-900 text-left leading-tight">{btn.label}</span>
 4988:                   </button>
 4989:                 );
 4990:               })}
 4991:             </div>
 4992: 
 4993:             {/* Cancel confirm panel */}
 4994:             {cancelConfirmType && (
 4995:               <div className="mx-3.5 mb-1.5 p-3 bg-red-50 border-[1.5px] border-red-200 rounded-xl">
 4996:                 <div className="text-sm font-extrabold text-red-900 mb-2.5">
 4997:                   {tr('help.cancel_confirm_q', 'Отменить запрос?')}
 4998:                 </div>
 4999:                 <div className="flex gap-2">
 5000:                   <button onClick={() => setCancelConfirmType(null)}
 5001:                     className="flex-1 py-2 rounded-lg border-2 border-gray-200 bg-white text-sm font-bold text-gray-700">
 5002:                     {tr('help.cancel_keep', 'Оставить')}
 5003:                   </button>
 5004:                   <button onClick={() => {
 5005:                       const targetRow = activeRequests.find(r => r.type === cancelConfirmType);
 5006:                       if (targetRow) {
 5007:                         handleResolve(cancelConfirmType);
 5008:                       }
 5009:                       setCancelConfirmType(null);
 5010:                     }}
 5011:                     className="flex-1 py-2 rounded-lg bg-red-500 text-white text-sm font-bold">
 5012:                     {tr('help.cancel_do', 'Отменить')}
 5013:                   </button>
 5014:                 </div>
 5015:               </div>
 5016:             )}
 5017: 
 5018:             {/* Active custom "other" requests — same urgency model as 6 SOS buttons */}
 5019:             {activeRequests.filter(r => r.type === 'other').map(row => {
 5020:               const hasError = Boolean(row.errorKind);
 5021:               if (hasError) {
 5022:                 return (
 5023:                   <div key={row.id} className="mx-3.5 mb-2 px-3 py-2 bg-red-50 border-[1.5px] border-red-400 rounded-[10px] flex items-center justify-between gap-2">
 5024:                     <span className="text-[13px] text-red-800 font-semibold flex-1 truncate">
 5025:                       «{row.message || tr('help.other_label', 'Другое')}»
 5026:                     </span>
 5027:                     <button onClick={() => handleRetry(row)}
 5028:                       className="text-[12px] font-bold text-red-600 whitespace-nowrap">
 5029:                       {tr('help.retry', 'Повторить')}
 5030:                     </button>
 5031:                   </div>
 5032:                 );
 5033:               }
 5034:               const urgency = getHelpUrgency('other', row.sentAt);
 5035:               const s = URGENCY_STYLES[urgency] || URGENCY_STYLES.neutral;
 5036:               return (
 5037:                 <div key={row.id} className={`mx-3.5 mb-2 px-3 py-2 ${s.bg} border-[1.5px] ${s.border} rounded-[10px] flex items-center justify-between gap-2`}>
 5038:                   <span className={`text-[13px] ${s.label} font-semibold flex-1 truncate`}>
 5039:                     «{row.message || tr('help.other_label', 'Другое')}»
 5040:                   </span>
 5041:                   <span className={`text-[12px] font-bold ${s.timer} whitespace-nowrap`}>⏱ {getHelpTimerStr(row.sentAt)}</span>
 5042:                   <button onClick={(e) => { e.stopPropagation(); handleResolve('other', row.id); }}
 5043:                     className={`w-[22px] h-[22px] rounded-full ${s.xBg} ${s.xColor} flex items-center justify-center text-[11px] font-extrabold flex-shrink-0`}>✕</button>
 5044:                 </div>
 5045:               );
 5046:             })}
 5047: 
 5048:             {/* "Другой запрос?" link — hidden while any 'other' request is active */}
 5049:             {!activeRequests.some(r => r.type === 'other') && !showOtherForm && (
 5050:               <div className="px-3.5 pb-3">
 5051:                 <button onClick={() => setShowOtherForm(true)}
 5052:                   className="text-sm text-gray-400 underline underline-offset-2 bg-transparent border-none cursor-pointer">
 5053:                   {tr('help.other_request_link', 'Другой запрос?')}
 5054:                 </button>
 5055:               </div>
 5056:             )}
 5057: 
 5058:             {/* Textarea form for "other" request */}
 5059:             {showOtherForm && (
 5060:               <div className="mx-3.5 mb-3.5 p-2.5 bg-gray-50 border-[1.5px] border-gray-200 rounded-xl flex flex-col gap-2">
 5061:                 <textarea
 5062:                   autoFocus
 5063:                   value={helpComment}
 5064:                   onChange={(e) => setHelpComment(e.target.value.slice(0, 120))}
 5065:                   placeholder={tr('help.other_placeholder', 'Напишите, что нужно…')}
 5066:                   maxLength={120}
 5067:                   className="w-full rounded-lg border border-gray-200 p-2 text-sm resize-none h-[70px] focus:border-orange-400 focus:ring-1 focus:ring-orange-400 outline-none"
 5068:                 />
 5069:                 <div className="flex items-center justify-between">
 5070:                   <span className="text-xs text-gray-400">{helpComment.length}/120</span>
 5071:                   <div className="flex gap-2">
 5072:                     <button onClick={() => { setShowOtherForm(false); setHelpComment(''); }}
 5073:                       className="px-3 py-[7px] rounded-lg border border-gray-200 bg-white text-[13px] font-bold text-gray-700">
 5074:                       {tr('common.cancel', 'Отмена')}
 5075:                     </button>
 5076:                     <button
 5077:                       disabled={!helpComment.trim()}
 5078:                       onClick={() => {
 5079:                         if (!helpComment.trim()) return;
 5080:                         const msg = helpComment.trim();
 5081:                         if (undoToast?.timeoutId) clearTimeout(undoToast.timeoutId);
 5082:                         const entryId = `other-${Date.now()}`;
 5083:                         const timeoutId = setTimeout(() => {
 5084:                           if (currentTableIdRef.current !== currentTableId) return;
 5085:                           const now = Date.now();
 5086:                           setRequestStates(prev => {
 5087:                             const otherArr = Array.isArray(prev.other) ? prev.other : (prev.other ? [prev.other] : []);
 5088:                             return {
 5089:                               ...prev,
 5090:                               other: [
 5091:                                 ...otherArr,
 5092:                                 {
 5093:                                   id: entryId,
 5094:                                   status: 'sending',
 5095:                                   sentAt: now,
 5096:                                   lastReminderAt: null,
 5097:                                   reminderCount: 0,
 5098:                                   remindCooldownUntil: null,
 5099:                                   message: msg,
 5100:                                   pendingAction: 'send',
 5101:                                   errorKind: null,
 5102:                                   errorMessage: '',
 5103:                                   terminalHideAt: null,
 5104:                                   syncSource: 'local',
 5105:                                 },
 5106:                               ],
 5107:                             };
 5108:                           });
 5109:                           setHelpComment(msg);
 5110:                           pendingQuickSendRef.current = { type: 'other', action: 'send', rowId: entryId, message: msg };
 5111:                           handlePresetSelect('other');
 5112:                           setPendingHelpActionTick((value) => value + 1);
 5113:                           setUndoToast(prev => (prev?.timeoutId === timeoutId ? null : prev));
 5114:                         }, 5000);
 5115:                         setUndoToast({ type: 'other', rowId: entryId, tableId: currentTableId, message: msg, expiresAt: Date.now() + 5000, timeoutId });
 5116:                         setShowOtherForm(false);
 5117:                         setHelpComment('');
 5118:                       }}
 5119:                       className="flex-1 py-[7px] rounded-lg bg-orange-500 text-white text-[13px] font-bold disabled:opacity-50">
 5120:                       {tr('help.send_btn', 'Отправить')}
 5121:                     </button>
 5122:                   </div>
 5123:                 </div>
 5124:               </div>
 5125:             )}
 5126: 
 5127:             {/* Undo toast */}
 5128:             {undoToast && (
 5129:               <div className="mx-3.5 mb-3 rounded-lg bg-slate-800 text-white px-4 py-3 flex items-center justify-between text-sm">
 5130:                 <span>{HELP_CARD_LABELS[undoToast.type] || undoToast.type} {tr('help.sent_suffix', 'отправлено')}</span>
 5131:                 <button onClick={handleUndo} className="text-amber-300 font-medium ml-2 min-h-[44px] min-w-[44px] flex items-center justify-center">
 5132:                   {tr('help.undo', 'Отмена')} ({Math.max(0, Math.ceil((undoToast.expiresAt - Date.now()) / 1000))})
 5133:                 </button>
 5134:               </div>
 5135:             )}
 5136: 
 5137:             {/* Generic error fallback */}
 5138:             {helpSubmitError && !activeRequests.some(r => r.errorKind) && (
 5139:               <div className="mx-3.5 mb-3 bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
 5140:                 {helpSubmitError}
 5141:               </div>
 5142:             )}
 5143:           </div>
 5144:         </DrawerContent>
 5145:       </Drawer>
 5146: 
 5147:       {/* P0-6: Removed custom toast - using sonner */}
 5148: 
 5149:       {/* Review Dialog */}
 5150:       <ReviewDialog
 5151:         open={reviewDialogOpen}
 5152:         onOpenChange={setReviewDialogOpen}
 5153:         t={t}
 5154:         partner={partner}
 5155:         reviewingItems={reviewingItems}
 5156:         ratings={ratings}
 5157:         onChangeRating={(itemId, val) => setRatings(prev => ({
 5158:           ...prev,
 5159:           [itemId]: { ...prev[itemId], rating: val }
 5160:         }))}
 5161:         onChangeComment={(itemId, text) => setRatings(prev => ({
 5162:           ...prev,
 5163:           [itemId]: { ...prev[itemId], comment: text }
 5164:         }))}
 5165:         submittingReview={submittingReview}
 5166:         onSubmit={handleSubmitReviews}
 5167:         hasLoyalty={!!loyaltyAccount}
 5168:       />
 5169: 
 5170:       {/* Dish Reviews Modal (read-only) */}
 5171:       <DishReviewsModal
 5172:         open={!!selectedDishId}
 5173:         onOpenChange={(open) => !open && setSelectedDishId(null)}
 5174:         dishTitle={selectedDish ? getDishName(selectedDish) : undefined}
 5175:         reviews={selectedDishReviews}
 5176:         loading={loadingDishReviews}
 5177:       />
 5178: 
 5179:       {/* PM-102/PM-122: Dish Detail as Bottom Drawer */}
 5180:       <Drawer open={!!detailDish} onOpenChange={(open) => { if (!open) { popOverlay('detailDish'); setDetailDish(null); } }}>
 5181:         <DrawerContent className="max-h-[88vh] rounded-t-2xl overflow-hidden p-0">
 5182:           <DrawerTitle className="sr-only">{detailDish ? getDishName(detailDish) : ''}</DrawerTitle>
 5183:           {detailDish && (
 5184:             <div className="flex flex-col h-full">
 5185:               {/* Photo with close chevron */}
 5186:               <div className="relative w-full flex-shrink-0">
 5187:                 {detailDish.image && (
 5188:                   <div className="w-full aspect-square bg-slate-100">
 5189:                     <img
 5190:                       src={detailDish.image}
 5191:                       alt={getDishName(detailDish)}
 5192:                       className="w-full h-full object-cover"
 5193:                     />
 5194:                   </div>
 5195:                 )}
 5196:                 <button
 5197:                   onClick={() => { popOverlay('detailDish'); setDetailDish(null); }}
 5198:                   className="absolute top-3 right-3 w-11 h-11 flex items-center justify-center rounded-full bg-black/40 text-white"
 5199:                   aria-label={t('common.close', 'Ð—Ð°ÐºÑ€Ñ‹Ñ‚ÑŒ')}
 5200:                 >
 5201:                   <ChevronDown className="w-6 h-6" />
 5202:                 </button>
 5203:               </div>
 5204:               {/* Scrollable content: PM-123 order: Title â†’ Description â†’ Price+Discount â†’ Rating */}
 5205:               <div className="overflow-y-auto flex-1 p-4 space-y-3">
 5206:                 <h2 className="text-lg font-bold text-slate-900">
 5207:                   {getDishName(detailDish)}
 5208:                 </h2>
 5209:                 {getDishDescription(detailDish) && (
 5210:                   <p className="text-sm text-slate-500">
 5211:                     {getDishDescription(detailDish)}
 5212:                   </p>
 5213:                 )}
 5214:                 {/* PM-118: Discount display â€" partner-level pattern (matches MenuView.jsx) */}
 5215:                 <div className="flex items-baseline gap-2">
 5216:                   {partner?.discount_enabled === true && (partner?.discount_percent ?? 0) > 0 ? (
 5217:                     <>
 5218:                       <span className="text-lg font-bold" style={{ color: partner?.primary_color || '#1A1A1A' }}>
 5219:                         {formatPrice(parseFloat((detailDish.price * (1 - partner.discount_percent / 100)).toFixed(2)))}
 5220:                       </span>
 5221:                       <span className="text-sm text-slate-400 line-through">
 5222:                         {formatPrice(detailDish.price)}
 5223:                       </span>
 5224:                       <span
 5225:                         className="text-xs font-bold text-white px-2 py-0.5 rounded-full"
 5226:                         style={{ backgroundColor: partner?.discount_color || '#C92A2A' }}
 5227:                       >
 5228:                         -{partner.discount_percent}%
 5229:                       </span>
 5230:                     </>
 5231:                   ) : (
 5232:                     <span className="text-lg font-bold" style={{ color: partner?.primary_color || '#1A1A1A' }}>
 5233:                       {formatPrice(detailDish.price)}
 5234:                     </span>
 5235:                   )}
 5236:                 </div>
 5237:                 {showReviews && dishRatings?.[detailDish.id] && (
 5238:                   <DishRating
 5239:                     avgRating={dishRatings[detailDish.id]?.avg}
 5240:                     reviewCount={dishRatings[detailDish.id]?.count}
 5241:                   />
 5242:                 )}
 5243:               </div>
 5244:               {/* Sticky bottom bar */}
 5245:               <div className="sticky bottom-0 bg-white p-4 border-t border-slate-100">
 5246:                 <Button
 5247:                   variant="ghost"
 5248:                   className="w-full min-h-[44px]"
 5249:                   style={{ backgroundColor: partner?.primary_color || '#1A1A1A', color: '#FFFFFF' }}
 5250:                   onClick={() => { addToCart(detailDish); popOverlay('detailDish'); setDetailDish(null); }}
 5251:                 >
 5252:                   {t('menu.add_to_cart', 'Ð"Ð¾Ð±Ð°Ð²Ð¸Ñ‚ÑŒ Ð² ÐºÐ¾Ñ€Ð·Ð¸Ð½Ñƒ')}
 5253:                 </Button>
 5254:               </div>
 5255:             </div>
 5256:           )}
 5257:         </DrawerContent>
 5258:       </Drawer>
 5259: 
 5260:       {/* PM-156: Floating bell removed â€" bell accessible via CartView header + help drawer */}
 5261: 
 5262:       {/* Sticky cart bar - updated for TableSession */}
 5263:       {view === "menu" && (() => {
 5264:         // Hall mode: show if cart has items OR if there are past orders OR table activity
 5265:         if (isHallMode && showCartButton) {
 5266:           return (
 5267:             <StickyCartBar
 5268:               t={t}
 5269:               isHallMode={true}
 5270:               isDrawerOpen={drawerMode === 'cart'}
 5271:               hasCart={(cart?.length || 0) > 0}
 5272:               cartTotalItems={cartTotalItems}
 5273:               formattedCartTotal={formatPrice(cartTotalAmount)}
 5274:               isLoadingBill={hallStickyIsLoadingBill}
 5275:               formattedBillTotal={hallStickyBillTotal}
 5276:               onButtonClick={() => {
 5277:                 if (hallStickyMode === 'cartEmpty' && isSessionLoading) {
 5278:                   toast.info(t('common.loading'), { id: 'mm1', duration: 1500 });
 5279:                   return;
 5280:                 }
 5281:                 if (isSubmitting && drawerMode === 'cart') return;
 5282:                 if (drawerMode !== 'cart') {
 5283:                   pushOverlay('cart');
 5284:                   setDrawerMode('cart');
 5285:                 } else {
 5286:                   popOverlay('cart');
 5287:                   setDrawerMode(null);
 5288:                 }
 5289:               }}
 5290:               buttonLabel={hallStickyButtonLabel}
 5291:               hallModeLabel={hallStickyModeLabel}
 5292:               showBillAmount={hallStickyShowBillAmount}
 5293:               primaryColor={primaryColor}
 5294:             />
 5295:           );
 5296:         }
 5297: 
 5298:         // Pickup/Delivery: original behavior
 5299:         if (cart.length > 0) {
 5300:           return (
 5301:             <StickyCartBar
 5302:               t={t}
 5303:               isHallMode={false}
 5304:               hasCart={true}
 5305:               cartTotalItems={cartTotalItems}
 5306:               formattedCartTotal={formatPrice(cartTotalAmount)}
 5307:               isLoadingBill={false}
 5308:               formattedBillTotal=""
 5309:               onButtonClick={handleCheckoutClick}
 5310:               buttonLabel={tr('cart.checkout', 'Checkout')}
 5311:               primaryColor={primaryColor}
 5312:             />
 5313:           );
 5314:         }
 5315: 
 5316:         return null;
 5317:       })()}
 5318:     </div>
 5319:   );
 5320: }                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                
=== END SOURCE CODE ===

=== TASK CONTEXT ===
You are reviewing the quality of a КС implementation prompt for a React/Base44 app.
DO NOT execute the changes. DO NOT read code files. Only review the prompt quality.

Context: This prompt redesigns CartView.jsx (1163 lines) — collapses 5 status buckets into 2 groups (В работе/Выдано), moves money to header only, footer=CTA only, adds submit-feedback transition (State A2). Batch CV-A: States A/A2/B only.

Find issues with the PROMPT DESIGN:
1. Incorrect code snippets (wrong syntax, variable names, line numbers)
2. Missing edge cases
3. Ambiguous instructions
4. Safety risks (unintended file changes)
5. Validation: are post-fix checks sufficient?

---

# CartView Drawer Redesign: Core Structure (Batch CV-A) — КС Prompt

## Context
Файл: pages/PublicMenu/CartView.jsx (1163 lines, RELEASE `260330-02 CartView RELEASE.jsx`)
Задача: Redesign CartView drawer — collapse 5 status buckets into 2 groups (В работе / Выдано), add "В корзине" group with stepper, move money to header only, make footer CTA-only, implement submit-feedback state A2.
Вес: H (architectural UI redesign) | Бюджет: $18 | Модель: С5v2

⚠️ If `wc -l pages/PublicMenu/CartView.jsx` < 1100 — restore: `cp "260330-02 CartView RELEASE.jsx" CartView.jsx` (KB-095).

## UX Reference
UX-документ: `ux-concepts/CartView/260408-00 CartView UX S246.md` v6.0 (60 decisions CV-01..CV-60, 8 states A→T, GPT R4 "Lock and build")
HTML макет: `ux-concepts/CartView/260408-00 CartView Drawer Mockup S241.html` — **v5.1, pre-dates v6.0.**
Скриншоты: `menuapp-code-review/pages/PublicMenu/screenshots/current/` — CartView_S241_asIs_drawer.jpg (as-is состояние до редизайна) Layout/structure is valid reference, but these v6.0 overrides apply:
  - Footer `"К отправке:"` summary → **REMOVE** (v6.0 CV-51: footer = only CTA)
  - Bucket `bucket-sum` in header → **REMOVE** (v6.0 CV-50: no subtotals in groups)
  - "Отправлено" status → **REMOVE** (v6.0 CV-52: only 2 statuses)
  - "Новый заказ" section name → rename to **"В корзине"** (v6.0 CV-49)
BACKLOG: WS-CV (CartView Drawer)

**CRITICAL: `OrderItem` has NO status field.** Status = `Order.status` only. All items in one order share the same status. Buckets group ORDERS, not items.

**`Order.status` → Guest-facing groups (v6.0):**
- `new`, `accepted`, `in_progress`, `ready` → **В работе**
- `served`, `completed` → **Выдано**
- `cancelled` → hidden

This batch covers States A, A2, B only. Rating flow (C/C2/C3/D) and Tab "Стол" (T) → Batch CV-B.

## FROZEN UX (DO NOT CHANGE)
- **Tab switching** (Мои/Стол) — leave as-is, Batch CV-B will update Tab Стол
- **Guest name editing** (`isEditingName`, `handleUpdateGuestName`) — leave as-is
- **Help drawer integration** (`onCallWaiter`) — leave as-is
- **Star rating rendering** on served items — leave existing rating code as-is, Batch CV-B refactors
- **Table verification flow** (`hallGuestCodeEnabled`, `verifyTableCode`) — leave as-is
- **Loyalty redemption** (`redeemedPoints`, `pointsDiscountAmount`) — leave as-is
- **Close drawer** (`onClose`, vaul mechanics) — leave as-is
- **StickyCartBar** in x.jsx — DO NOT TOUCH
- **x.jsx** — DO NOT MODIFY. This batch = CartView.jsx only.

---

## Fix 1 — CV-01+CV-48+CV-52 [MUST-FIX, H]: Replace 5-status buckets with 2 groups + В корзине

### Проблема
CartView splits orders into 5 status buckets (served/ready/in_progress/accepted/new_order). Guest sees labels "Отправлено", "Принят", "Готовится", "Готов", "Подано". v6.0 says: guest needs only 2 statuses.

### Wireframe (было → должно быть)
```
БЫЛО:                           ДОЛЖНО БЫТЬ:
▾ Отправлено (1)                ▸ Выдано (2)         ← collapsed
▾ Принят (1)                    ▾ В работе (3)       ← all non-served merged
▾ Готовится (1)                   Суши       44.77 ₸
▾ Подано (2)                      Стейк      64.02 ₸
  [collapsed]                     New dish    10.00 ₸
--- new order ---               ▾ В корзине (1)      ← cart items
                                  Ризотто    32.00 ₸
                                  [ − ] 1 [ + ]
                                  +32 бонуса
```

### What the mockup shows (HTML reference)
```html
<!-- Bucket structure from mockup (adapt to v6.0 names) -->
<div class="bucket">
  <div class="bucket-header">
    <span class="bucket-chevron open">▸</span>
    <span class="bucket-name">В работе (4)</span>
    <!-- NO bucket-sum here — v6.0 CV-50 removes subtotals -->
  </div>
  <div class="bucket-items">
    <div class="item-row">
      <span class="item-name">Суши</span>
      <span class="item-price">44.77 ₸</span>
    </div>
  </div>
</div>

<!-- Cart group (mockup calls it "new-order-section", v6.0 calls it "В корзине") -->
<div class="new-order-section">
  <div class="new-order-header">
    <span class="new-order-title">В корзине</span>
    <!-- NO sum in header — v6.0 CV-50 -->
  </div>
  <div class="new-order-items">
    <div class="cart-item-row">
      <span class="cart-item-name">Ризотто</span>
      <span class="cart-item-price">32.00 ₸</span>
      <div class="stepper"><button>−</button><span>1</span><button>+</button></div>
    </div>
    <div class="bonus-hint">+32 бонуса</div>  <!-- CV-49: bonus in cart group -->
  </div>
</div>
```

### Что менять
Grep: `const buckets = { served` → find bucket creation logic. Currently creates 5 buckets.
Grep: `'Отправлено'` → find all 4 occurrences of this label. Remove all.
Grep: `new_order:` → find bucket label map. Replace 5-label map with 2 labels.
Grep: `statusBuckets` → find all usages. Update to use 2-group model.

Change bucket creation:
```javascript
// OLD (5 buckets):
const buckets = { served: [], ready: [], in_progress: [], accepted: [], new_order: [] };
// ...complex per-status splitting...

// NEW (2 groups):
const groups = { served: [], in_progress: [] };
todayMyOrders.forEach(o => {
  const s = o.status?.toLowerCase?.() || 'new';
  if (s === 'served' || s === 'completed') groups.served.push(o);
  else if (s !== 'cancelled') groups.in_progress.push(o);
});
```

Grep: `Отправлено` → 4 matches to delete:
- `tr('status.sent', 'Отправлено')` in getOrderStatus
- `'new': tr('status.sent', 'Отправлено')` in fallbacks map
- `fallbacks[code] || tr('status.sent', 'Отправлено')` default
- `new_order: 'Отправлено'` in bucket label map

Replace render: 3 groups in order: Выдано (collapsed) → В работе (expanded) → В корзине (expanded). Empty groups hidden.

### НЕ должно быть
- NO 5-status sub-buckets visible to guest
- NO "Отправлено" text/badge/color ANYWHERE
- NO per-order rows with timestamps (CV-28: flat list by dish name)
- NO horizontal dividers between items (CV-29)

### Проверка
1. Orders in `accepted` + `ready` → both under single "В работе" group.
2. Grep `Отправлено` in modified file → 0 matches.

---

## Fix 2 — CV-50+CV-51 [MUST-FIX, M]: Money only in drawer header, footer = only CTA

### Проблема
Footer has summary (amount, count). Groups have subtotals. Money scattered across UI.

### Wireframe (было → должно быть)
```
БЫЛО (footer):                  ДОЛЖНО БЫТЬ (footer):
├─────────────────────┤         ├─────────────────────┤
│ К отправке: 32.00 ₸│         │ [Отправить          │
│ +32 бонуса          │         │  официанту]         │
│ [Отправить офиц.]   │         └─────────────────────┘
└─────────────────────┘
                                ДОЛЖНО БЫТЬ (header):
                                │ Стол 22 · Tulip (Г1) ˅│
                                │ 4 блюда · 118.79 ₸    │
```

### What the mockup shows (adapt for v6.0)
```html
<!-- Header line2 from mockup (KEEP — this is the ONLY place for money) -->
<div class="header-line2">
  <span class="orders-info">4 блюда · 118.79 ₸</span>
</div>

<!-- Footer from mockup — v6.0 REMOVES summary, keeps only button -->
<div class="sticky-footer">
  <!-- DELETE: footer-summary, footer-bonus -->
  <button class="footer-btn primary">Отправить официанту</button>
</div>
```

### Что менять
Grep: `orders-info\|ordersSum\|cnt.*plural` → header total calculation. Update to include BOTH submitted orders AND cart items in count/sum.
Grep: `Сумма заказа` → find inline subtotal in bucket render. REMOVE this entire line.
Grep: `footer-summary\|К отправке\|footer-bonus\|cartGrandTotal` → find footer summary elements. REMOVE all summary/bonus display from footer, keep ONLY the CTA button.

**Header formula:** `N блюд` = total items across all groups (cart + active + served). `X ₸` = sum of all orders + cart items.

### НЕ должно быть
- NO `ИТОГО` / `К отправке` / `Всего` in footer
- NO subtotals in group headers
- **Banned labels:** `«За визит»`, `«ИТОГО ЗА ВИЗИТ»`, `«К отправке: X ₸»`

### Проверка
1. Open drawer → header: "4 блюда · 118.79 ₸". Footer: ONLY the button.
2. Grep `Сумма заказа` → 0 matches.
3. Grep `К отправке` → 0 matches.

---

## Fix 3 — CV-48 compensator [MUST-FIX, M]: State A2 — submit-feedback (1.5s CTA transition)

### Проблема
After removing "Отправлено" badge (Fix 1), guest gets no feedback that order was sent. Currently CTA just goes to loading state via `isSubmitting` prop.

### Wireframe
```
State A:  [Отправить официанту]   ← primary
          ↓ tap
State A2: [⏳ Отправляем…]        ← disabled, 1-2s
          ↓ success
          [✅ Заказ отправлен]     ← disabled, success color, 1.5s
          ↓ auto-transition
State B:  [Заказать ещё]           ← outline
```

### Что менять
Grep: `isSubmitting\|handleSubmitOrder` → find CTA render and submit handler.

Add new state variable (place AFTER existing hooks to preserve React hook order):
```javascript
const [submitPhase, setSubmitPhase] = React.useState('idle'); // 'idle' | 'submitting' | 'success'
```

Wrap submit handler:
```javascript
// Inside CTA onClick:
setSubmitPhase('submitting');
handleSubmitOrder(); // existing prop call
// After success (need to detect via isSubmitting prop going false):
// useEffect watching isSubmitting: false + submitPhase === 'submitting' → setSubmitPhase('success')
// setTimeout 1500ms → setSubmitPhase('idle')
```

CTA render — 3 states:
```javascript
submitPhase === 'submitting' ? tr('cart.submit.sending', 'Отправляем…')
: submitPhase === 'success' ? tr('cart.submit.success', '✅ Заказ отправлен')
: submitError ? tr('cart.submit.retry', 'Повторить отправку')
: cart.length > 0 ? tr('cart.submit.send', 'Отправить официанту')
: tr('cart.order_more', 'Заказать ещё')
```

**⚠️ Hook order safety (D12):** Place `useState('idle')` AFTER `const [infoModal, setInfoModal]` (grep: `infoModal`). Do NOT insert before existing hooks.

### НЕ должно быть
- NO "Отправлено" badge on orders after submit
- NO silent transition
- NO blocking dialog/modal

### Проверка
1. Add to cart → tap "Отправить" → see "Отправляем…" → "✅ Заказ отправлен" → "Заказать ещё".
2. Double-tap → only 1 order created.

---

## Fix 4 — CV-46 [MUST-FIX, L]: Выдано auto-collapse logic

### Проблема
"Выдано" collapse may not auto-adjust based on other groups.

### Что менять
Grep: `expandedStatuses\|setExpandedStatuses` → find existing state and initializer.

Auto-collapse rule: `served` expanded = `(inProgressItems.length === 0 && cart.length === 0)`. If Выдано is the ONLY group → expanded. Otherwise → collapsed.

Update useEffect that recomputes `expandedStatuses`:
```javascript
// CV-46: Auto-collapse Выдано when other groups exist
const otherGroupsExist = groups.in_progress.length > 0 || cart.length > 0;
setExpandedStatuses(prev => ({
  ...prev,
  served: prev.served !== undefined ? prev.served : !otherGroupsExist
}));
```

**CV-25/CV-47:** Polling must NOT reset manual expand/collapse. Only auto-set on FIRST render or when groups change structurally (group appears/disappears), not on every poll.

### НЕ должно быть
- NO forced collapse on every poll/re-render
- NO always-collapsed Выдано when it's the only group

### Проверка
1. Cart non-empty + served orders → Выдано collapsed.
2. Only served orders → Выдано expanded.
3. User manually expands Выдано → polling triggers → stays expanded.

---

## Fix 5 — CV-33+CV-49 [MUST-FIX, L]: Remove "Для кого заказ", add bonuses in cart group

### Что менять
Grep: `splitType` → confirmed: appears ONLY in prop destructuring, no UI render in current code. ✅ No UI to remove.

Grep: `earnedPoints\|loyalty_points\|бонус` → find loyalty info display. Move bonus line into "В корзине" group:
```html
<!-- Inside cart group, after last cart item -->
<div class="bonus-hint">+{loyaltyPoints} бонусов</div>
```
Show ONLY if partner has loyalty configured. Grep: `partner.loyalty` to find condition.

### НЕ должно быть
- NO bonus info in footer
- NO yellow loyalty banner

### Проверка
1. Partner has loyalty + cart items → "+32 бонуса" below stepper.
2. Partner without loyalty → no bonus line.

---

## Fix 6 — CV-23+CV-34 [MUST-FIX, L]: Qty display cleanup

### Что менять
Grep: `totalQty > 1.*×` → find existing qty display. Currently: `{g.totalQty > 1 ? \` ×${g.totalQty}\` : ''}`. ✅ Already hides ×1 for ordered items.

Check cart items: grep `quantity\|stepper` in cart render section. If cart shows `price × 1` text when qty=1 → hide it.

### НЕ должно быть
- NO "×1" visible anywhere

### Проверка
1. Single-qty: "Суши  44.77 ₸" (no ×1).
2. Multi-qty: "Суши ×2  89.54 ₸" (muted ×2).

---

## Fix 7 — CV-31 [NICE-TO-HAVE, L]: Compact header — table + guest on one line

### Wireframe
```
БЫЛО:                    ДОЛЖНО БЫТЬ:
│ Стол 22               │ Стол 22 · Tulip (Г1) ˅│
│ Tulip (Гость 1)       │ 4 блюда · 118.79 ₸    │
│ 4 заказа · 118 ₸      │                        │
```

### What the mockup shows
```html
<div class="header-line1">
  Стол 22 · <a class="restaurant-link">Tulip</a> <span>(Гость 1)</span>
</div>
<div class="header-line2">
  <span class="orders-info">4 блюда · 118.79 ₸</span>
</div>
```

### Что менять
Grep: `header-line1\|tablePrefix\|tableLabel\|getGuestDisplayName` → find header render. Merge table + guest onto line1. Line2 = total from Fix 2.

### Проверка
1. Header = 2 lines max: line1=table+guest, line2=total.

---

## ⛔ SCOPE LOCK — менять ТОЛЬКО то, что указано в Fix 1-7

- Изменяй ТОЛЬКО код из Fix-секций.
- ВСЁ остальное — НЕ ТРОГАТЬ.
- Rating flow (States C/C2/C3/D) — **OUT OF SCOPE**. Do NOT change star rating, DishFeedback, isRatingMode.
- Tab "Стол" content — **OUT OF SCOPE**. Leave tab Стол render as-is.
- Email bottom sheet — **OUT OF SCOPE**.
- Table verification — **OUT OF SCOPE**.
- Loyalty redemption logic — **OUT OF SCOPE** (only DISPLAY bonus line in cart group).
- **x.jsx — DO NOT MODIFY.**

## Implementation Notes
- i18n: file uses `tr(key, fallback)` (grep: `const tr =`). For ALL new strings use same `tr(key, fallback)` pattern. Keys: `cart.group.served`, `cart.group.in_progress`, `cart.group.in_cart`, `cart.submit.sending`, `cart.submit.success`, `cart.cta.order_more`.
- `formatPrice` prop for currency formatting — use it for ALL price displays.
- **⚠️ D7 — DrawerContent `relative` ban:** Do NOT add `className="relative"` to any top-level div. Breaks vaul drawer (KB-096).
- **⚠️ D12 — Deletion safety:** When removing 5-bucket code, grep each variable for usage outside deleted block. If useState/useMemo hooks become dead → comment out with `// reserved — hook order`, do NOT delete.
- **⚠️ D15 — stopPropagation:** Group headers have `onClick` for expand/collapse. Clickable elements INSIDE header (e.g., rating chip in future) need `e.stopPropagation()`.
- **⚠️ D16 — useMemo:** Derived arrays combining items from different groups MUST use `React.useMemo`. No naked `const x = [...a, ...b]`.
- git add pages/PublicMenu/CartView.jsx && git commit after all fixes.

## MOBILE-FIRST CHECK (MANDATORY before commit)
This is a mobile-first restaurant app (320-420px, one-handed use at table). Verify:
- [ ] Drawer header: 2 lines, readable at 320px
- [ ] Group headers: tappable, touch targets >= 44px height
- [ ] Stepper buttons in cart: >= 44x44px
- [ ] Footer CTA: full width, prominent, sticky bottom
- [ ] No horizontal overflow
- [ ] No excessive whitespace between groups

## Regression Check (MANDATORY after implementation)
- [ ] Cart items: add/remove via stepper still works
- [ ] Submit order: `handleSubmitOrder` still called correctly
- [ ] Star ratings on served items still render (rating MODE is out of scope, but display is not)
- [ ] Tab switching (Мои/Стол) still works
- [ ] Drawer close (chevron/swipe) still works
- [ ] Guest name display correct
- [ ] Price formatting correct (`formatPrice`)

## FROZEN UX grep verification (run before commit)
```bash
grep -n "Отправлено" pages/PublicMenu/CartView.jsx      # should return 0
grep -n "Сумма заказа" pages/PublicMenu/CartView.jsx     # should return 0
grep -n "К отправке" pages/PublicMenu/CartView.jsx       # should return 0
grep -n "ИТОГО" pages/PublicMenu/CartView.jsx             # should return 0
grep -n "isRatingMode" pages/PublicMenu/CartView.jsx      # should still exist (untouched)
grep -n "handleUpdateGuestName" pages/PublicMenu/CartView.jsx  # should still exist
```
=== END ===
