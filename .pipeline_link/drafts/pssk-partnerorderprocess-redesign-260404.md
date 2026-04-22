# PartnerOrderProcess Redesign + язправ — КС Prompt

## Context
Файл: pages/PartnerOrderProcess/partnerorderprocess.jsx (1653 строки, RELEASE 260403-01)
Задача: Redesign UI layout (desktop compact table + mobile accordion) + i18n fixes
Вес: H | Бюджет: $15 | Модель: С5v2

## UX Reference
UX-документ: ux-concepts/PartnerOrderProcess/partner-order-process.md (v2.0)
GPT консультации: GPT_OrderProcess_UX_S218.md (R1) + GPT_OrderProcess_UX_R2_S218.md (R2)
BACKLOG: #233 redesign (DONE — спиннер/legacy builder), этот промпт = новая задача (layout + i18n)

## FROZEN UX (DO NOT CHANGE)
These elements were fixed in S217 and MUST NOT be modified:
- PipelinePreview component (lines 548-576) — "Текущий процесс" banner with colored circles and arrows. Works correctly.
- EditStageDialog component (lines 775-993) — modal edit dialog with checkboxes for channels/roles. Fully functional.
- handleToggleStage function (lines 1261-1297) — toggle logic with order-safety check. Works correctly.
- handleSaveStage function (lines 1300-1370) — save logic with rebalance. Works correctly.
- Normalization logic (isNormalizing guard, normalizeStages) — fixed in S217, do not touch.
- SYSTEM_STAGE_SLOTS constant (lines 42-113) — 5 fixed stages definition. Do not change structure.

## DO NOT DELETE (shared functions used elsewhere)
- `handleEditStage` (line 1257) — opens edit dialog
- `handleToggleStage` (line 1261) — toggle active/inactive
- `handleSaveStage` (line 1300) — save from edit dialog
- `buildStagePayload` — used by handleSaveStage and handleToggleStage
- `getDisplayName` — used by PipelinePreview and stage rendering
- `rebalanceSortOrder` — used after create/delete

---

## Fix 1 — REMOVE ChannelFilter component and related state [MUST-FIX]

### Проблема
ChannelFilter (lines 582-630) renders a filter bar (Все / В зале / Самовывоз / Доставка) above the stage list. Per UX v2.0, this is no longer needed — all channels are visible as icons directly in each row.

### Что менять
1. Delete `ChannelFilter` function (lines 582-630)
2. Delete `CHANNEL_FILTERS` constant (lines 35-40)
3. Delete the state: grep `channelFilter` — remove `useState` and any usage in filtering logic
4. Delete the `<ChannelFilter .../>` JSX call in main render

### Проверка
- No filter bar above stage list
- All 5 stages always visible regardless of channels

---

## Fix 2 — REDESIGN FixedStageRow to compact row with icons [MUST-FIX]

### Проблема
Current FixedStageRow (lines 636-769) uses full-width card layout with text channel badges and text role labels. Takes too much vertical space. Per UX v2.0: desktop should be compact table-like rows, channels shown as icons only (no text), roles as text chips.

### Wireframe — DESKTOP compact row
```
┌──────────────────────────────────────────────────────────────────────────────┐
│ #  ● Этап            🍽  📦  🚚      Менеджер Персонал    Активен       ✎  │
├──────────────────────────────────────────────────────────────────────────────┤
│ 1  ● Новый           🍽  📦  🚚      Менеджер Персонал    🔒 Зафиксирован  │
│ 2  ● Принято         🍽      🚚      Менеджер Персонал    Выключен      ✎  │
│ 3  ● Готовится       🍽  📦  🚚      Менеджер Персонал    Активен       ✎  │
│ 4  ● Готово          🍽  📦  🚚      Кухня               Активен       ✎  │
│ 5  ● Выдано          🍽  📦  🚚      Менеджер Персонал    🔒 Зафиксирован  │
└──────────────────────────────────────────────────────────────────────────────┘
```

### Wireframe — MOBILE accordion (collapsed)
```
┌────────────────────────────────────────────┐
│ 🍽 В зале  📦 Самовывоз  🚚 Доставка       │  ← legend (once at top)
├────────────────────────────────────────────┤
│ 1  ● Новый        🍽📦🚚    🔒 Зафиксирован │
│                                         ▾  │
├────────────────────────────────────────────┤
│ 2  ● Принято      🍽  🚚    Выключен       │
│                                         ▾  │
├────────────────────────────────────────────┤
│ 3  ● Готовится    🍽📦🚚    Активен         │
│                                         ▾  │
└────────────────────────────────────────────┘
```

### Wireframe — MOBILE accordion (expanded + edit mode)
```
┌────────────────────────────────────────────┐
│ 3  ● Готовится                    Активен  │
│                                         ▴  │
│                                            │
│  Каналы:                                   │
│  🍽 В зале ──●       (toggle ON)           │
│  📦 Самовывоз ──●    (toggle ON)           │
│  🚚 Доставка ──●     (toggle ON)           │
│                                            │
│  Роли:                                     │
│  ☑ Менеджер  ☑ Персонал  ☐ Кухня          │
│                                            │
│  [Редактировать]                           │
│                                            │
│  → Clicking [Редактировать] enables        │
│    channel toggles and role checkboxes     │
│  → Changes autosave + toast "Сохранено"    │
└────────────────────────────────────────────┘
```

### Что менять
Replace the entire `FixedStageRow` function (lines 636-769) with a new component that has THREE modes:

**A) Collapsed row (DEFAULT for both desktop and mobile):**
- Single row: `[number] [color dot] [stage name] [channel icons] [role chips] [status badge] [edit/chevron]`
- Channel icons: use Lucide `<Utensils>`, `<Package>`, `<Truck>` — show only enabled channels, no text labels
- Desktop: icon tooltip on hover (title attribute) with `tr('channel.hall', 'В зале')` etc.
- Mobile: no tooltip, icons self-explanatory (legend at top of page, see Fix 3)
- Status badge: locked stages → `🔒 Зафиксирован`, active → `Активен`, inactive → `Выключен` — READ-ONLY, no toggle in collapsed
- Role chips: text chips (`Менеджер`, `Персонал`, `Кухня`) using existing `getRoleLabel()`
- Edit button (pencil icon) for unlocked stages
- Mobile: chevron (▾/▴) to expand/collapse

**B) Expanded view (mobile only, after tapping chevron):**
- Shows channel icons WITH text labels side by side: `🍽 В зале`, `📦 Самовывоз`, `🚚 Доставка`
- Shows role chips with labels
- Shows `[Редактировать]` button
- Status badge still read-only

**C) Edit mode (after tapping [Редактировать] in expanded):**
- Channel toggles become interactive (toggle switch for each channel)
- Role checkboxes become interactive
- Changes AUTOSAVE immediately via existing `handleToggleStage` / `handleSaveStage` logic
- Show toast `tr('toast.saved', 'Сохранено')` after each autosave
- No Save/Cancel buttons needed (low error cost, easily reversible)

### Technical implementation notes
- Use React state `expandedKey` (string|null) for which stage is expanded (accordion — only one at a time)
- Use React state `editingKey` (string|null) for which stage is in edit mode
- Desktop: skip expanded/edit modes, keep pencil icon that opens existing `EditStageDialog`
- Mobile: use `sm:` breakpoint to distinguish (collapsed row on desktop, accordion on mobile)
- Keep existing `handleToggleStage` for autosave — it already saves to DB and shows toast
- For channel toggle in edit mode: call a new `handleChannelToggle(slot, channelKey)` that updates single channel via `OrderStage.update()`
- For role toggle in edit mode: call a new `handleRoleToggle(slot, role)` that updates `allowed_roles` via `OrderStage.update()`

### Проверка
- Desktop: all 5 stages visible as compact rows, channel icons with hover tooltip, pencil opens EditStageDialog
- Mobile: all 5 stages collapsed, tap chevron expands, [Редактировать] enables editing, autosave works

---

## Fix 3 — ADD mobile channel legend at top of page [MUST-FIX]

### Проблема
On mobile, channel icons (🍽📦🚚) are shown without text. Users need a one-time legend to understand what each icon means.

### Wireframe
```
┌────────────────────────────────────────────┐
│ 🍽 В зале  📦 Самовывоз  🚚 Доставка       │
└────────────────────────────────────────────┘
```

### Что менять
Add a legend bar below the PipelinePreview, ABOVE the stage list. Only visible on mobile (`sm:hidden`).

```jsx
{/* Channel legend — mobile only */}
<div className="flex items-center gap-4 px-4 py-2 bg-slate-50 rounded-lg mb-3 text-xs text-slate-600 sm:hidden">
  <span className="flex items-center gap-1"><Utensils className="h-3.5 w-3.5" />{tr('channel.hall', 'В зале')}</span>
  <span className="flex items-center gap-1"><Package className="h-3.5 w-3.5" />{tr('channel.pickup', 'Самовывоз')}</span>
  <span className="flex items-center gap-1"><Truck className="h-3.5 w-3.5" />{tr('channel.delivery', 'Доставка')}</span>
</div>
```

Insert this JSX in main render (around line 1607), between PipelinePreview and the stage list container.

### Проверка
- Mobile: legend visible above stages
- Desktop: legend hidden

---

## Fix 4 — язправ: Move LOCAL_UI_TEXT to i18n [MUST-FIX]

### Проблема
`LOCAL_UI_TEXT` (lines 125-135) contains hardcoded Russian strings that should use `tr()` with i18n keys and Russian fallbacks.

### Что менять
Replace ALL usages of `LOCAL_UI_TEXT.*` throughout the file with `tr()` calls:

| Current code | New code |
|---|---|
| `LOCAL_UI_TEXT.currentProcess` | `tr('orderprocess.current_process', 'Текущий процесс')` |
| `LOCAL_UI_TEXT.locked` | `tr('orderprocess.status.locked', 'Зафиксировано')` |
| `LOCAL_UI_TEXT.enabled` | `tr('orderprocess.status.active', 'Активен')` |
| `LOCAL_UI_TEXT.disabled` | `tr('orderprocess.status.inactive', 'Выключен')` |
| `LOCAL_UI_TEXT.blockerGeneric` | `tr('orderprocess.blocker.generic', 'Не удалось безопасно привести этапы к фиксированной схеме.')` |
| `LOCAL_UI_TEXT.blockerMultipleStart` | `tr('orderprocess.blocker.multiple_start', 'Обнаружено несколько стартовых этапов.')` |
| `LOCAL_UI_TEXT.blockerMultipleFinish` | `tr('orderprocess.blocker.multiple_finish', 'Обнаружено несколько финальных этапов.')` |
| `LOCAL_UI_TEXT.blockerTooManyMiddle` | `tr('orderprocess.blocker.too_many_middle', 'Обнаружено больше трёх промежуточных этапов.')` |
| `LOCAL_UI_TEXT.blockerUnsupportedType` | `tr('orderprocess.blocker.unsupported_type', 'Обнаружен этап с неподдерживаемым типом.')` |

After replacing all usages, DELETE the `LOCAL_UI_TEXT` constant entirely (lines 125-135).

### New i18n keys for redesigned UI
Also add these NEW `tr()` calls in the new FixedStageRow component:
- `tr('orderprocess.edit_button', 'Редактировать')` — edit mode button
- `tr('orderprocess.status.locked_badge', '🔒 Зафиксирован')` — locked badge (with lock emoji)
- `tr('orderprocess.channels_label', 'Каналы')` — section label in expanded
- `tr('orderprocess.roles_label', 'Роли')` — section label in expanded

### ⚠️ IMPORTANT: Use `tr(key, fallback)`, NOT `t(key)`
The file uses `useI18n()` which provides `t()`. But `t()` does NOT support fallbacks — if the key is missing from the dictionary, it shows the raw key.
`tr()` is a custom function that falls back to the second argument. For ALL new strings, use `tr('key', 'Russian fallback text')`.

Grep: `const { t } = useI18n` — check if `tr` is also destructured. If not, check if `tr` is defined elsewhere in the file or imported. If `tr` is NOT available, create a helper:
```jsx
const tr = (key, fallback) => {
  const val = t(key);
  return val === key ? fallback : val;
};
```

### Проверка
- No raw Russian strings in LOCAL_UI_TEXT
- All UI text renders correctly with Russian fallbacks
- Grep: `LOCAL_UI_TEXT` should return 0 matches after fix

---

## Fix 5 — REMOVE dead code: handleAddStage, handleMoveUp, handleMoveDown [NICE-TO-HAVE]

### Проблема
These functions exist but are never called in the current UI (fixed 5-stage system, no add/reorder):
- Grep: `handleAddStage` — defined but no JSX calls it
- Grep: `handleMoveUp` — defined but no JSX calls it
- Grep: `handleMoveDown` — defined but no JSX calls it
- Grep: `handleDeleteStage` — defined but no JSX calls it

### Что менять
**⚠️ BEFORE deleting: grep each function name across the ENTIRE file to confirm zero JSX usages.**
If confirmed unused, delete the function bodies. Keep a comment:
```jsx
// NOTE: Add/Move/Delete stage handlers removed — fixed 5-stage system (UX v2.0)
```

### Проверка
- No runtime errors
- Grep: function names should return 0 matches (except the comment)

---

## SCOPE LOCK
DO NOT modify:
- PipelinePreview component (keep as-is)
- EditStageDialog component (keep as-is)
- handleToggleStage logic (keep as-is)
- handleSaveStage logic (keep as-is)
- Normalization logic (isNormalizing, normalizeStages)
- SYSTEM_STAGE_SLOTS structure
- Any file OTHER than partnerorderprocess.jsx

## MOBILE-FIRST CHECK
- [ ] All new JSX uses responsive classes (`sm:` for desktop overrides)
- [ ] Touch targets ≥ 44px (`min-h-[44px]`)
- [ ] No hover-only interactions (tooltips are desktop enhancement only, mobile has legend)
- [ ] Accordion works with touch (tap chevron to expand/collapse)
- [ ] Edit mode toggles have adequate tap area

## DESIGN SYSTEM
- Colors: Tailwind slate/emerald/amber palette (already used in file)
- Icons: Lucide React (`Utensils`, `Package`, `Truck`, `Lock`, `Pencil`, `ChevronUp`, `ChevronDown`) — already imported
- Badges: `rounded-full px-2.5 py-1 text-xs font-medium` (existing pattern)
- Toast: use `toast.success(tr('toast.saved', 'Сохранено'), { id: TOAST_ID })` (existing pattern)

## GIT
```bash
git add pages/PartnerOrderProcess/partnerorderprocess.jsx
git commit -m "feat: redesign PartnerOrderProcess — compact table + mobile accordion + i18n"
git push
```
