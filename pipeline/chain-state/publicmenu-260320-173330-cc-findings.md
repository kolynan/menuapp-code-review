# CC Writer Findings — PublicMenu (Terracotta Palette)
Chain: publicmenu-260320-173330

## Task Context
Replace ALL hardcoded colors in x.jsx + CartView.jsx with semantic palette from STYLE_GUIDE.md v3.2.
Primary: `#B5543A` (terracotta), Primary Hover: `#9A4530`, Primary Light: `#F5E6E0`, Surface: `#faf9f7`.

---

## Findings

### x.jsx — Hardcoded indigo/purple colors (must → terracotta)

1. [P1] Loader spinner uses indigo instead of terracotta (line 1013) — `text-indigo-500` on Loader2 spinner in OrderStatusScreen loading state. FIX: Replace `text-indigo-500` with `style={{color: '#B5543A'}}`.

2. [P1] Track Order button uses indigo text (line 759) — OrderConfirmationScreen "Track Order" button has `text-indigo-600`. FIX: Replace `text-indigo-600` with `style={{color: '#B5543A'}}`.

3. [P1] Phone icon uses indigo in Order Status (line 1145) — `text-indigo-500` on Phone icon. FIX: Replace with `style={{color: '#B5543A'}}`.

4. [P1] Phone number text uses indigo in Order Status (line 1146) — `text-indigo-600` on phone number span. FIX: Replace `text-indigo-600` with `style={{color: '#B5543A'}}`.

5. [P1] Main page loader uses indigo (line 2983) — Partner loading spinner `text-indigo-600`. FIX: Replace with `style={{color: '#B5543A'}}`.

### x.jsx — bg-white on fullscreen overlays (should → warm surface where appropriate)

6. [P2] OrderConfirmationScreen bg-white (line 618) — Fullscreen confirmation uses cold `bg-white`. FIX: Replace `bg-white` with `style={{backgroundColor: '#faf9f7'}}` for warm surface.

7. [P2] OrderStatusScreen loading bg-white (line 1011) — Loading state uses cold `bg-white`. FIX: Replace `bg-white` with `style={{backgroundColor: '#faf9f7'}}`.

8. [P2] OrderStatusScreen invalid-token bg-white (line 993) — Invalid token error page uses cold `bg-white`. FIX: Replace `bg-white` with `style={{backgroundColor: '#faf9f7'}}`.

9. [P2] OrderStatusScreen error/not-found bg-white (line 1022) — Error state uses cold `bg-white`. FIX: Replace `bg-white` with `style={{backgroundColor: '#faf9f7'}}`.

10. [P2] OrderStatusScreen expired bg-white (line 1040) — Expired order page uses cold `bg-white`. FIX: Replace `bg-white` with `style={{backgroundColor: '#faf9f7'}}`.

### x.jsx — Status colors that are correct (DO NOT CHANGE)

Note: The following are status/semantic colors and should NOT be changed:
- line 658: `stroke="#22c55e"` (success checkmark) — correct green
- line 795-801: `osGetStatusConfig` colors (blue/orange/green/red) — correct semantic status colors
- line 831, 846: progress bar green — correct status color
- line 1128: `text-green-600` discount text — correct success color

### x.jsx — OrderConfirmationScreen buttons missing terracotta styling

11. [P2] "Back to menu" button in confirmation (line 740-744) — `Button className="w-full h-12"` uses default shadcn Button primary. If shadcn default is not terracotta, this button will be wrong color. FIX: Add `style={{backgroundColor: '#B5543A', color: 'white'}} className="w-full h-12 hover:opacity-90"`.

### CartView.jsx — Hardcoded indigo colors (must → terracotta)

12. [P1] Guest name edit link uses indigo (line 469) — `text-indigo-600 hover:underline` on edit name link. FIX: Replace `text-indigo-600` with `style={{color: '#B5543A'}}`.

13. [P1] Guest name edit link (second instance) (line 506) — `text-indigo-600 hover:underline font-medium text-sm`. FIX: Replace `text-indigo-600` with `style={{color: '#B5543A'}}`.

14. [P1] Loyalty info icon uses indigo (line 848) — `text-indigo-600` on info icon in loyalty section. FIX: Replace with `style={{color: '#B5543A'}}`.

15. [P1] Loyalty info icon second instance (line 858) — `text-indigo-600`. FIX: Replace with `style={{color: '#B5543A'}}`.

16. [P1] Loyalty points info box uses indigo-50 bg (line 940) — `bg-indigo-50 p-2 rounded-lg text-xs`. FIX: Replace `bg-indigo-50` with `style={{backgroundColor: '#F5E6E0'}}`.

### CartView.jsx — CTA button colors (green → terracotta for primary action)

17. [P1] Submit button uses green instead of terracotta (line 1254) — `bg-green-600 hover:bg-green-700` for the main "Send to waiter" CTA. Per STYLE_GUIDE, primary CTA should be terracotta. FIX: Replace `bg-green-600 hover:bg-green-700` with `style={{backgroundColor: '#B5543A'}}` and hover via onMouseEnter/Leave or keep as inline. The disabled state `bg-gray-300 text-gray-500` (line 1251) should change to `bg-slate-100 text-slate-400 cursor-not-allowed` per STYLE_GUIDE.

18. [P2] Submit error retry button uses red (line 1253) — `bg-red-600 hover:bg-red-700`. This is for retry after error state. Red is acceptable as error/danger color per palette. KEEP AS-IS (red is semantic error color).

### CartView.jsx — bg-white surfaces (should → warm where appropriate)

19. [P2] Cart drawer header card bg-white (line 431) — `bg-white rounded-lg shadow-sm border p-3 mb-4`. FIX: Leave as `bg-white` — cards within drawer typically stay white for contrast against warm surface. No change needed here since drawer bg is controlled by DrawerContent.

20. [P2] Sticky bottom CTA area bg-white (line 1244) — `sticky bottom-0 bg-white border-t border-slate-200 p-4`. FIX: This should stay white for contrast since it's a sticky UI element on top of scrollable content. No change needed.

### CartView.jsx — Status colors that are correct (DO NOT CHANGE)

Note: The following are status/semantic colors correctly per STYLE_GUIDE:
- line 437: `bg-amber-50 text-amber-600` — waiter call button (sent/waiting semantic)
- line 490: `text-amber-700 bg-amber-50` — cooldown warning
- line 498: `bg-green-50 border-green-200` — verified state
- line 674: `text-green-600` — order icon (success)
- line 887: `text-amber-500` — gift/loyalty icon
- line 934, 990: green success feedback
- line 994: amber waiting feedback
- line 1007: `text-green-600` — discount display
- line 1022-1059: amber loyalty/bill section
- line 1234: `bg-red-50 border-red-200` — error display
- line 799: `hover:bg-red-50 hover:text-red-600` — remove button (destructive action)

### CartView.jsx — Other indigo/color issues

21. [P2] Status default color fallback is blue (line 241, 272) — `#3B82F6` hardcoded as default status color. This is the "Preparing" blue from STYLE_GUIDE, which is correct for "new" order status. However, per STYLE_GUIDE, "Sent/Waiting" (new) should be Amber `#f59e0b`, not blue. FIX: Change default fallback from `#3B82F6` to `#f59e0b` (amber for "sent" status), matching STYLE_GUIDE status table where "ОТПРАВЛЕН (Sent)" = Amber.

### x.jsx — OrderStatusBadge colors

22. [P2] OrderStatusBadge "new" status uses blue instead of amber (line 573) — `new: { icon: '🔵', bg: 'bg-blue-100', color: 'text-blue-700' }`. Per STYLE_GUIDE, "Sent" (new) should be Amber. FIX: Change to `bg: 'bg-amber-100', color: 'text-amber-700'`, icon: '🟡'.

23. [P2] OrderStatusBadge "accepted" uses blue (line 574) — `accepted: { bg: 'bg-blue-100', color: 'text-blue-700' }`. Per STYLE_GUIDE, "Accepted" should be Amber. FIX: Change to `bg: 'bg-amber-100', color: 'text-amber-700'`, icon: '🟡'.

### x.jsx — osGetStatusConfig colors

24. [P2] osGetStatusConfig "new" status uses blue instead of amber (line 795) — `color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200"`. Per STYLE_GUIDE, "new/sent" = Amber. FIX: Change to `color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200"`.

---

## Summary

Total: 24 findings (0 P0, 10 P1, 14 P2, 0 P3)

### Breakdown by type:
- **Indigo → Terracotta** (10 findings): Lines 759, 1013, 1145, 1146, 2983 in x.jsx; Lines 469, 506, 848, 858, 940 in CartView.jsx
- **CTA Green → Terracotta** (1 finding): Line 1254 in CartView.jsx (main submit button)
- **bg-white → warm surface** (4 findings): Lines 618, 993, 1011, 1022, 1040 in x.jsx
- **Status color corrections** (4 findings): "new"/"accepted" should be amber not blue per STYLE_GUIDE
- **Button styling** (1 finding): Confirmation screen primary button needs terracotta
- **Keep as-is** (4 notes): Status semantic colors (green/amber/blue/red) are correct

### Files affected:
- `pages/PublicMenu/base/x.jsx` — 15 findings (5 indigo, 5 bg-white, 1 button, 4 status colors)
- `pages/PublicMenu/base/CartView.jsx` — 9 findings (5 indigo, 1 CTA green, 1 status default, 2 already correct)

### Implementation notes:
- Terracotta `#B5543A` is NOT in standard Tailwind. Must use `style={{}}` inline or CSS variables.
- Status colors (green/amber/blue/red) should NOT change — they are semantic per STYLE_GUIDE.
- Disabled state should use `bg-slate-100 text-slate-400 cursor-not-allowed` per STYLE_GUIDE.
- `bg-white` on Cards inside drawers/overlays can stay white for contrast; only page-level surfaces should be warm `#faf9f7`.
