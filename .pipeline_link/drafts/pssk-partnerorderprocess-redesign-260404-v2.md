# PartnerOrderProcess Redesign + язправ — КС Prompt v2

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

## EXECUTION ORDER (follow strictly)
Fix 4 → Fix 1 → Fix 3 → Fix 2 → Fix 5
Reason: Fix 4 must run first because `t()` calls are used in Fix 2 and Fix 3. Fix 1 removes dead code before Fix 2 rewrites the row component.

---

## Fix 1 — REMOVE ChannelFilter component and related state [MUST-FIX]

### Проблема
ChannelFilter (lines 582-630) renders a filter bar (Все / В зале / Самовывоз / Доставка) above the stage list. Per UX v2.0, this is no longer needed — all channels are visible as icons directly in each row.

### Что менять
1. Delete `ChannelFilter` function (grep: `function ChannelFilter` — lines 582-630)
2. Delete `CHANNEL_FILTERS` constant (grep: `CHANNEL_FILTERS` — lines 35-40)

⚠️ NOTE: `<ChannelFilter>` is NOT called anywhere in JSX — it is already dead code (0 JSX usages).
⚠️ NOTE: there is no `channelFilter` state variable — the component was defined but never wired up. Do NOT search for useState/channelFilter state — it does not exist.

### Проверка
- Grep: `ChannelFilter` returns 0 matches
- All 5 stages always visible (no filter logic)

---

## Fix 2 — REDESIGN FixedStageRow to compact row with icons [MUST-FIX]

### Проблема
Current FixedStageRow (lines 636-769) uses full-width card layout with text channel badges and text role labels. Takes too much vertical space. Per UX v2.0: desktop should be compact table-like rows, channels shown as icons only (no text), roles as text chips.

⚠️ NOTE: `getRoleLabel` (line 664) is defined INSIDE the current FixedStageRow. When replacing the component, preserve this function inside the new component.

### Behavior matrix (desktop vs mobile)
| Situation | Desktop | Mobile |
|-----------|---------|--------|
| Default view | Compact read-only row | Collapsed row with chevron |
| Edit (unlocked) | Pencil → opens existing EditStageDialog | Tap chevron → expand → tap [Редактировать] → inline edit |
| Edit (locked) | No pencil icon, read-only | No edit in expanded mode, read-only |
| Save | EditStageDialog Save/Cancel | Autosave via handleSaveStage on each change |

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
│ 1  ● Новый        🍽📦🚚    🔒 Зафиксирован │
│                                         ▾  │
├────────────────────────────────────────────┤
│ 2  ● Принято      🍽  🚚    Выключен    ✎  │
│                                         ▾  │
└────────────────────────────────────────────┘
```

### Wireframe — MOBILE accordion (expanded, unlocked stage)
```
┌────────────────────────────────────────────┐
│ 3  ● Готовится                    Активен  │
│                                         ▴  │
│  Каналы: 🍽 В зале  📦 Самовывоз  🚚 Доставка │
│  Роли: Менеджер  Персонал                  │
│  [Редактировать]                           │
└────────────────────────────────────────────┘
```

### Wireframe — MOBILE accordion (edit mode, after [Редактировать])
```
┌────────────────────────────────────────────┐
│ 3  ● Готовится                    Активен  │
│                                         ▴  │
│  Каналы:                                   │
│  🍽 В зале ──●    📦 Самовывоз ──●         │
│  🚚 Доставка ──●                           │
│  Роли: ☑ Менеджер  ☑ Персонал  ☐ Кухня    │
│  [Готово]   ← closes edit mode            │
└────────────────────────────────────────────┘
```

### Что менять
Replace the entire `FixedStageRow` function (grep: `function FixedStageRow` — lines 636-769) with a new component:

**Accordion state (add to parent component, not inside FixedStageRow):**
```jsx
const [expandedKey, setExpandedKey] = useState(null); // which stage is expanded (string|null)
const [editingKey, setEditingKey] = useState(null);   // which stage is in edit mode (string|null)
```

**Accordion state rules:**
- Only one stage expanded at a time. Expanding a new stage: close previous + clear editingKey
- Collapsing a stage: clear editingKey for that stage
- editingKey must always match expandedKey (cannot edit a collapsed stage)

**JSX skeleton for collapsed row (A-mode, used on both desktop and mobile):**
```jsx
function FixedStageRow({ slot, stage, isExpanded, isEditing, onToggleExpand, onToggleEdit, onEdit }) {
  // preserve getRoleLabel from original component
  const getRoleLabel = (role) => { /* keep existing implementation */ };

  return (
    <div className="flex items-center gap-3 px-4 py-3 min-h-[44px] border-b last:border-b-0">
      {/* number + color dot + name */}
      <span className="text-sm text-slate-500 w-5">{slot.sort_order}</span>
      <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: slot.color }} />
      <span className="flex-1 text-sm font-medium text-slate-800">{getDisplayName(stage, slot)}</span>

      {/* channel icons — desktop: with title tooltip; mobile: icon only */}
      <div className="flex gap-1">
        {slot.channels.hall && <Utensils className="h-3.5 w-3.5 text-slate-500" title={t('channel.hall')} />}
        {slot.channels.pickup && <Package className="h-3.5 w-3.5 text-slate-500" title={t('channel.pickup')} />}
        {slot.channels.delivery && <Truck className="h-3.5 w-3.5 text-slate-500" title={t('channel.delivery')} />}
      </div>

      {/* role chips */}
      <div className="hidden sm:flex gap-1">
        {(stage?.allowed_roles || slot.defaultRoles).map(role => (
          <span key={role} className="rounded-full px-2 py-0.5 text-xs bg-slate-100 text-slate-600">
            {getRoleLabel(role)}
          </span>
        ))}
      </div>

      {/* status badge */}
      <span className={`text-xs px-2 py-0.5 rounded-full ${slot.locked ? 'bg-slate-100 text-slate-500' : stage?.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
        {slot.locked ? t('orderprocess.status.locked') : stage?.is_active ? t('orderprocess.status.active') : t('orderprocess.status.inactive')}
      </span>

      {/* desktop: pencil for unlocked; mobile: chevron */}
      {!slot.locked && (
        <button onClick={() => onEdit(slot)} className="hidden sm:block p-1 text-slate-400 hover:text-slate-600">
          <Pencil className="h-4 w-4" />
        </button>
      )}
      <button onClick={() => onToggleExpand(slot.key)} className="sm:hidden p-1 text-slate-400">
        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </button>
    </div>
  );
}
```

**For mobile edit mode (C-mode) save path:**
Use existing `handleSaveStage` for role changes and `handleToggleStage` for active/inactive toggle.
For channel toggles, use `OrderStage.update({ id: stage.id, enabled_hall: bool, enabled_pickup: bool, enabled_delivery: bool })` followed by `queryClient.invalidateQueries(['orderStages'])` and `toast.success(t('toast.saved'))`.

### Проверка
- Desktop: all 5 stages as compact rows, channel icon tooltips on hover, pencil opens EditStageDialog for unlocked stages
- Mobile: all 5 stages collapsed, tap chevron expands ONE stage, [Редактировать] enables inline edit, closing collapsed clears edit state
- Locked stages: no pencil (desktop), no [Редактировать] button (mobile expanded)

---

## Fix 3 — ADD mobile channel legend at top of page [MUST-FIX]

### Проблема
On mobile, channel icons (🍽📦🚚) in stage rows are shown without text. Users need a one-time legend.

### Wireframe
```
┌────────────────────────────────────────────┐
│ 🍽 В зале  📦 Самовывоз  🚚 Доставка       │
└────────────────────────────────────────────┘
```

### Что менять
Insert this JSX in main render between PipelinePreview closing `</div>` (line 1606) and `<div className="bg-white rounded-xl border overflow-hidden">` (line 1608). Only visible on mobile (`sm:hidden`):

```jsx
{/* Channel legend — mobile only */}
<div className="flex items-center gap-4 px-4 py-2 bg-slate-50 rounded-lg mb-3 text-xs text-slate-600 sm:hidden">
  <span className="flex items-center gap-1"><Utensils className="h-3.5 w-3.5" />{t('channel.hall')}</span>
  <span className="flex items-center gap-1"><Package className="h-3.5 w-3.5" />{t('channel.pickup')}</span>
  <span className="flex items-center gap-1"><Truck className="h-3.5 w-3.5" />{t('channel.delivery')}</span>
</div>
```

### Проверка
- Mobile: legend visible above stage list
- Desktop (`sm:` breakpoint): legend hidden

---

## Fix 4 — язправ: Replace LOCAL_UI_TEXT with t() [MUST-FIX]

### Проблема
`LOCAL_UI_TEXT` (grep: `LOCAL_UI_TEXT` — lines 125-135) contains hardcoded Russian strings. Standard project i18n pattern is `t(key)` from `useI18n()`. All new strings must use `t(key)`.

⚠️ NOTE: The file uses `const { t } = useI18n()` at line 1067. This is the correct project standard. Do NOT create a `tr()` helper — use `t(key)` directly.

⚠️ NOTE: The text for `enabled`/`disabled` INTENTIONALLY changes from short forms `'Вкл'`/`'Выкл'` to `'Активен'`/`'Выключен'` per UX v2.0. This is correct, not a mistake.

### Что менять — replacement table

| Current code | Replace with | i18n key to add |
|---|---|---|
| `LOCAL_UI_TEXT.currentProcess` | `t('orderprocess.current_process')` | `"Текущий процесс"` |
| `LOCAL_UI_TEXT.locked` | `t('orderprocess.status.locked')` | `"Зафиксировано"` |
| `LOCAL_UI_TEXT.enabled` | `t('orderprocess.status.active')` | `"Активен"` |
| `LOCAL_UI_TEXT.disabled` | `t('orderprocess.status.inactive')` | `"Выключен"` |
| `LOCAL_UI_TEXT.blockerGeneric` | `t('orderprocess.blocker.generic')` | `"Не удалось безопасно привести этапы к фиксированной схеме."` |
| `LOCAL_UI_TEXT.blockerMultipleStart` | `t('orderprocess.blocker.multiple_start')` | `"Обнаружено несколько стартовых этапов."` |
| `LOCAL_UI_TEXT.blockerMultipleFinish` | `t('orderprocess.blocker.multiple_finish')` | `"Обнаружено несколько финальных этапов."` |
| `LOCAL_UI_TEXT.blockerTooManyMiddle` | `t('orderprocess.blocker.too_many_middle')` | `"Обнаружено больше трёх промежуточных этапов."` |
| `LOCAL_UI_TEXT.blockerUnsupportedType` | `t('orderprocess.blocker.unsupported_type')` | `"Обнаружен этап с неподдерживаемым типом."` |

After replacing all usages, DELETE the `LOCAL_UI_TEXT` constant entirely (lines 125-135).

### New t() calls for redesigned UI (Fix 2 + Fix 3)
Add these keys to i18n dictionary (Russian values):
- `t('orderprocess.status.locked')` → `"Зафиксирован"`
- `t('orderprocess.edit_button')` → `"Редактировать"`
- `t('channel.hall')` → `"В зале"`
- `t('channel.pickup')` → `"Самовывоз"`
- `t('channel.delivery')` → `"Доставка"`
- `t('orderprocess.channels_label')` → `"Каналы"`
- `t('orderprocess.roles_label')` → `"Роли"`
- `t('toast.saved')` → `"Сохранено"` (check if already exists — grep first)

### Проверка
- Grep: `LOCAL_UI_TEXT` returns 0 matches
- All UI text renders correctly (Russian fallbacks from dictionary)
- No raw i18n key strings visible in UI

---

## Fix 5 — REMOVE dead code: handleAddStage, handleMoveUp, handleMoveDown, handleDeleteStage [NICE-TO-HAVE]

### Проблема
These functions exist but are never called in JSX (fixed 5-stage system):
- `handleAddStage` (line 1229) — 0 JSX usages
- `handleMoveUp` (line 1365) — 0 JSX usages
- `handleMoveDown` (line 1390) — 0 JSX usages
- `handleDeleteStage` (line 1326) — 0 JSX usages

`handleDeleteStage` is connected to `deleteDialog` state (grep: `deleteDialog`) and `handleConfirmDelete` — check if these are also unused before deleting.

### Что менять
**⚠️ BEFORE deleting: grep each function name + connected state across the ENTIRE file to confirm zero JSX usages.**
If confirmed unused, remove the full function definitions and all references (useState, JSX calls).
Add a comment after deletion:
```jsx
// NOTE: Add/Move/Delete stage handlers removed — fixed 5-stage system (UX v2.0)
```

### Проверка
- No runtime errors
- Grep: function names + `deleteDialog` + `handleConfirmDelete` return 0 matches (except comment)

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
- [ ] No hover-only interactions (tooltips are desktop enhancement only)
- [ ] Accordion: only one row expanded at a time
- [ ] Collapsing clears edit mode
- [ ] Locked stages: no edit access on any breakpoint

## DESIGN SYSTEM
- Colors: Tailwind slate/emerald/amber palette (already used in file)
- Icons: Lucide React (`Utensils`, `Package`, `Truck`, `Lock`, `Pencil`, `ChevronUp`, `ChevronDown`) — already imported
- Badges: `rounded-full px-2.5 py-1 text-xs font-medium` (existing pattern)
- Toast: `toast.success(t('toast.saved'))` (existing pattern)

## GIT
```bash
git add pages/PartnerOrderProcess/partnerorderprocess.jsx
git commit -m "feat: redesign PartnerOrderProcess — compact table + mobile accordion + i18n"
git push
```
