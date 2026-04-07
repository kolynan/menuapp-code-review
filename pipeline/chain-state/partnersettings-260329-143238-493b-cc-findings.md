# CC Writer Findings — PartnerSettings
Chain: partnersettings-260329-143238-493b

## Findings

### Fix 1 — PS-S158-01..05: Missing i18n fallbacks

1. **[P2] Line 127: `t("settings.tabs.appearance")` missing fallback** — Tab label for Appearance has no Russian fallback. If translation key is missing, raw key string shown to user. FIX: Change to `t("settings.tabs.appearance", "Внешний вид")`.

2. **[P2] Line 497: `t("settings.appearance.title")` missing fallback** — Section title in AppearanceSection has no fallback. FIX: Change to `t("settings.appearance.title", "Цвет оформления")`.

3. **[P2] Line 498: `t("settings.appearance.subtitle")` missing fallback** — Section subtitle in AppearanceSection has no fallback. FIX: Change to `t("settings.appearance.subtitle", "Основной цвет интерфейса ресторана")`.

4. **[P2] Line 509: `t("settings.appearance.default")` missing fallback in aria-label** — Aria-label for default color button has no fallback. FIX: Change to `t("settings.appearance.default", "По умолчанию")`.

5. **[P2] Line 526: `t("settings.appearance.defaultHint")` missing fallback** — Hint text below color palette has no fallback. FIX: Change to `t("settings.appearance.defaultHint", "Используется цвет по умолчанию")`.

**Analysis:** All 5 locations confirmed. The changes are pure string additions (second argument to `t()`). No logic or layout changes. Risk: minimal.

---

### Fix 2 — PS-S194-01: DiscountSection manual Save → per-field auto-save

6. **[P2] Lines 550-551: Remove `localSaving` and `hasChanges` state** — These states support the manual Save button pattern. With auto-save, they are unnecessary. FIX: Delete `const [localSaving, setLocalSaving] = useState(false);` (line 550) and `const [hasChanges, setHasChanges] = useState(false);` (line 551).

7. **[P2] Line 558: Remove `setHasChanges(false)` from useEffect** — The useEffect at lines 553-559 syncs state from partner prop. After removing `hasChanges` state, the `setHasChanges(false)` call on line 558 must also be removed. FIX: Delete line 558.

8. **[P2] Line 561: Remove `isSaving` derived variable** — `const isSaving = saving || localSaving;` is no longer needed since `localSaving` is removed. FIX: Delete line 561. Replace all `isSaving` references with `saving` prop directly:
   - Line 612: `{isSaving && <Loader2 ...>}` → `{saving && <Loader2 ...>}`
   - Line 620: className conditional `${isSaving ? ...}` → `${saving ? ...}`
   - Line 630: `disabled={isSaving}` → `disabled={saving}`

9. **[P2] Lines 563-566: Rewrite `handleToggle` for immediate save** — Currently only sets state + marks changes. Must also call `onSave()` immediately. FIX:
```jsx
const handleToggle = (checked) => {
  const newVal = checked === true;
  setDiscountEnabled(newVal);
  onSave({ discount_enabled: newVal });
};
```

10. **[P2] Lines 568-576: Rewrite `handlePercentChange` with debounced save** — Currently only sets state + marks changes. Must debounce-save after 500ms. `useDebouncedCallback` is already defined locally at line 233 — no import needed. FIX: Add debounced callback and update handler:
```jsx
const debouncedSavePercent = useDebouncedCallback(
  (val) => onSave({ discount_percent: val }),
  500
);

const handlePercentChange = (e) => {
  const val = parseInt(e.target.value, 10);
  if (!isNaN(val)) {
    const clamped = Math.max(1, Math.min(99, val));
    setDiscountPercent(clamped);
    debouncedSavePercent(clamped);
  } else if (e.target.value === "") {
    setDiscountPercent("");
  }
};
```

11. **[P2] Lines 578-582: Rewrite `handleColorSelect` for immediate save** — Currently only sets state + marks changes. Must call `onSave()` immediately. FIX:
```jsx
const handleColorSelect = (hex) => {
  if (saving || !discountEnabled) return;
  setDiscountColor(hex);
  onSave({ discount_color: hex });
};
```

12. **[P2] Line 685: Badge size `onValueChange` — immediate save** — Currently `onValueChange={(val) => { setDiscountBadgeSize(val); setHasChanges(true); }}`. Must save immediately. FIX:
```jsx
onValueChange={(val) => {
  setDiscountBadgeSize(val);
  onSave({ discount_badge_size: val });
}}
```

13. **[P2] Lines 584-599: Remove `handleSave` function** — The entire async function is no longer needed with per-field auto-save. FIX: Delete the `const handleSave = async () => { ... }` block.

14. **[P2] Lines 699-718: Remove Save button JSX** — The Save button and its wrapper div are no longer needed. FIX: Delete the entire `<div className="pt-2">...</div>` block containing the Button.

15. **[P2] Line 601: Update `fieldsDisabled`** — Currently `const fieldsDisabled = !discountEnabled || isSaving;`. FIX: Change to `const fieldsDisabled = !discountEnabled || saving;`.

**Analysis:** `useDebouncedCallback` is a locally-defined custom hook (line 233), already used by WorkingHoursSection (line 735) and other sections. No import needed. The toggle label wrapper (lines 619-624) has a guard preventing double-fire: `if (e.target.closest('[role="checkbox"]')) return;` — this is safe with immediate save. The useEffect dependency array (line 559) does NOT depend on `hasChanges`, so removing that state won't affect the effect's trigger conditions. Risk: low — pattern matches existing WorkingHoursSection and AppearanceSection.

---

### Fix 3 — PM-113: Hide "Макс. попыток" input from UI

16. **[P2] Lines 1047-1063: Hide maxAttempts input JSX** — The input, label, and hint for "Макс. попыток" should be hidden using `{false && (...)}` pattern. State variable `maxAttempts`, `setMaxAttempts`, and any `onSave` calls with `table_code_max_attempts` must remain. FIX: Wrap the `<div className="space-y-1.5">` block (lines 1047-1063) in `{false && ( ... )}`.

**Analysis:** Confirmed the JSX block exists at exactly lines 1047-1063. State variable and save logic are elsewhere and won't be affected. Adjacent fields (code length at ~1030, cooldown at ~1065) remain visible. Risk: minimal — purely cosmetic hide.

---

## Summary
Total: 16 findings (0 P0, 0 P1, 16 P2, 0 P3)

All 16 findings map directly to Fix 1 (5 findings), Fix 2 (10 findings), Fix 3 (1 finding) from the task description. No out-of-scope findings reported.

## Prompt Clarity

- **Overall clarity: 5/5**
- **Ambiguous Fix descriptions:** None. All 3 fixes have exact line numbers, before/after code, and clear expected behavior.
- **Missing context:** None. FROZEN UX section, verification steps, and implementation notes are comprehensive. The note about `useDebouncedCallback` being locally defined (line 233) vs imported was helpful — the prompt correctly said "verify before adding import" and grep confirmed it's local.
- **Scope questions:** None. Scope lock is explicit. FROZEN UX clearly marks what not to touch.
