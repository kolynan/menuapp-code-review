# CC Writer Findings — PublicMenu
Chain: publicmenu-260325-164631-3748

## Findings

### Fix 1 — PM-133 (P1): No table code → redirect to table code entry, not help drawer

**Current code** (lines 1655–1658):
```js
const openHelpDrawer = useCallback(() => {
  setIsHelpModalOpen(true);
  pushOverlay('help');
}, [pushOverlay]);
```

No guard for `currentTableId`. When `currentTableId` is null, help drawer opens and shows an internal error message — user must close drawer and separately navigate to table code entry.

**FIX:** Add guard at top of `openHelpDrawer`:
```js
const openHelpDrawer = useCallback(() => {
  if (!currentTableId) {
    setShowTableConfirmSheet(true);
    return;
  }
  setIsHelpModalOpen(true);
  pushOverlay('help');
}, [pushOverlay, currentTableId, setShowTableConfirmSheet]);
```

**Verification:** `setShowTableConfirmSheet(true)` already triggers `pushOverlay('tableConfirm')` via useEffect at lines 2224–2230 — no additional overlay management needed. `currentTableId` is computed at line 1627. `setShowTableConfirmSheet` is useState at line 1297.

**Note on deps:** `setShowTableConfirmSheet` is a useState setter (stable ref), but adding it to deps is harmless and follows React best practices. `currentTableId` is a derived value and MUST be in deps since the guard depends on it.

---

### Fix 2a — PM-134a (P2): Textarea hidden until "Другое" tapped — use conditional rendering

**Current code** (line 3767):
```js
<div className={`overflow-hidden transition-all duration-300 ${showOtherForm ? 'max-h-[300px] opacity-100' : 'max-h-0 opacity-0'}`}>
```

CSS transition `max-h-0 opacity-0` does not reliably hide textarea from DOM on Android — may render partially visible.

**FIX:** Replace CSS transition wrapper with conditional rendering:
```jsx
{showOtherForm && (
  <div className="space-y-3 pt-1">
    <textarea
      autoFocus
      value={helpComment}
      onChange={(e) => setHelpComment(e.target.value)}
      placeholder={t('help.comment_placeholder_other', 'Расскажите, что случилось...')}
      className="w-full rounded-lg border border-slate-200 p-3 text-sm min-h-[80px] resize-none focus:outline-none focus:ring-2 focus:ring-blue-200"
    />
  </div>
)}
```

Remove the outer `<div className="overflow-hidden transition-all duration-300 ...">` wrapper entirely.

---

### Fix 2b — PM-134b (P2): autoFocus textarea when "Другое" is tapped

**Current code** (lines 3769–3774): textarea has no `autoFocus` attribute.

**FIX:** Add `autoFocus` attribute to the textarea element. Since we're switching to conditional rendering (Fix 2a), `autoFocus` will fire when the element mounts — which is exactly when `showOtherForm` becomes true. This is combined with Fix 2a above.

---

### Fix 2c — PM-134c (P2): "Отправить" button sticky at bottom of drawer

**Current code** (lines 3699, 3713, 3776–3785): The submit button is inside the scrollable `<div className="px-4 pb-6 space-y-4">` alongside the textarea. When Android keyboard opens, button is hidden behind keyboard.

**FIX:** Restructure DrawerContent to use flex column layout:

1. Change DrawerContent (line 3699):
```jsx
<DrawerContent className="max-h-[85vh] rounded-t-2xl flex flex-col">
```

2. Wrap the main content area (line 3713) in `overflow-y-auto flex-1`:
```jsx
<div className="px-4 pb-6 space-y-4 overflow-y-auto flex-1">
```

3. Move submit Button OUT of the conditional textarea section. When `showOtherForm` is true, render the button in a sticky bottom bar OUTSIDE the scrollable area:
```jsx
{/* After closing </div> of scrollable content, before </DrawerContent> */}
{showOtherForm && !helpQuickSent && (
  <div className="px-4 pb-4 pt-2 border-t border-slate-100">
    <Button
      className="w-full min-h-[44px] text-white"
      style={{ backgroundColor: primaryColor }}
      onClick={submitHelpRequest}
      disabled={isSendingHelp || !helpComment.trim()}
    >
      {isSendingHelp ? (
        <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" />{t('common.loading', 'Отправка...')}</span>
      ) : t('help.submit', 'Отправить')}
    </Button>
  </div>
)}
```

4. Remove the original Button from inside the conditional textarea div (lines 3776–3785).

**Important:** The `disabled` condition `isSendingHelp || !helpComment.trim()` must be preserved exactly (FROZEN UX, PM-131).

---

### Fix 3 — PM-135 (P2): helpQuickSent state not reset on openHelpDrawer

**Current code** (lines 1655–1658): `openHelpDrawer` sets `isHelpModalOpen` and pushes overlay but does NOT reset help drawer state. `closeHelpDrawer` (lines 1661–1668) resets everything. But if user reopens drawer before the 2s auto-close timeout fires, `helpQuickSent` may still be `true` → green checkmark shown immediately.

**FIX:** Reset all help state in `openHelpDrawer` (combined with Fix 1 guard):
```js
const openHelpDrawer = useCallback(() => {
  if (!currentTableId) {
    setShowTableConfirmSheet(true);
    return;
  }
  // PM-135: Reset all help drawer state before opening
  setHelpQuickSent(false);
  setSendingCardId(null);
  setShowOtherForm(false);
  setHelpComment('');
  setIsHelpModalOpen(true);
  pushOverlay('help');
}, [pushOverlay, currentTableId, setShowTableConfirmSheet, setHelpComment]);
```

**Note on deps:** `setHelpQuickSent`, `setSendingCardId`, `setShowOtherForm` are all useState setters (stable refs, lines 1649–1651). Adding them to deps array is optional but harmless. `setHelpComment` comes from the `useHelpRequests` hook (line 1638) — it's already referenced elsewhere so adding to deps is correct.

**Keep closeHelpDrawer resets** (lines 1661–1668) as-is for redundancy — belt-and-suspenders approach.

---

## Summary
Total: 5 findings (0 P0, 1 P1, 4 P2, 0 P3)

- Fix 1 (PM-133): 1 finding — P1 — guard openHelpDrawer for null currentTableId
- Fix 2a (PM-134a): 1 finding — P2 — conditional rendering instead of CSS transition
- Fix 2b (PM-134b): 1 finding — P2 — autoFocus on textarea (combined with 2a)
- Fix 2c (PM-134c): 1 finding — P2 — sticky submit button via flex column layout
- Fix 3 (PM-135): 1 finding — P2 — reset state in openHelpDrawer

All findings are within the specified scope (Fix 1, Fix 2, Fix 3). No out-of-scope issues reported.

## Prompt Clarity
- Overall clarity: 5/5
- Ambiguous Fix descriptions: None — all three fixes had clear "Current / Expected / Must NOT" sections with exact line numbers and code snippets
- Missing context: None — line numbers were accurate, state declarations and useEffect references all verified in code
- Scope questions: None — FROZEN UX section and SCOPE LOCK were explicit and comprehensive
