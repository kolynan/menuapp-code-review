# PartnerOrderProcess Redesign + язправ — КС Prompt v3

## Context
Файл: pages/PartnerOrderProcess/partnerorderprocess.jsx (1653 строки, RELEASE 260403-01)
Задача: Redesign UI layout (desktop compact table + mobile accordion) + i18n fixes
Вес: H | Бюджет: $15 | Модель: С5v2

## UX Reference
UX-документ: ux-concepts/PartnerOrderProcess/partner-order-process.md (v2.0)
GPT консультации: GPT_OrderProcess_UX_S218.md (R1) + GPT_OrderProcess_UX_R2_S218.md (R2)

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

## Fix 2 — REDESIGN FixedStageRow to compact row + mobile accordion [MUST-FIX]

### Проблема
Current FixedStageRow (lines 636-769) uses full-width card layout with text channel badges and text role labels. Takes too much vertical space. Per UX v2.0: desktop should be compact table-like rows, channels shown as icons only (no text), roles as text chips. Mobile should have accordion — collapsed by default, chevron expands to show details + edit button.

⚠️ NOTE: `getRoleLabel` (line 664) is defined INSIDE the current FixedStageRow using `useCallback`. When replacing the component, preserve this function inside the new component with the same `useCallback([t])` dependency.

### Key data facts (VERIFIED against real code — use exactly these):
- `slot.label` — display name of the stage (pre-computed, type: string)
- `slot.index` — zero-based index → display as `slot.index + 1`
- `slot.color` — hex color string
- `slot.active` — boolean, whether stage is active (pre-computed, includes lock logic)
- `slot.definition.locked` — boolean, whether stage is a locked system stage
- `slot.canEdit` — boolean, true when DB stage record exists (safe to call handleEditStage)
- `slot.allowedRoles` — string array of role keys (pre-computed)
- `slot.channels.enabled_hall` — boolean
- `slot.channels.enabled_pickup` — boolean
- `slot.channels.enabled_delivery` — boolean
- `slot.stage` — DB stage object or null (use when calling handleEditStage)

### Behavior matrix
| Situation | Desktop | Mobile |
|-----------|---------|--------|
| Default view | Compact read-only row | Collapsed row with chevron |
| Edit (unlocked, canEdit=true) | Pencil → opens EditStageDialog | Tap chevron → expand → tap [Редактировать] → opens EditStageDialog |
| Edit (locked or canEdit=false) | No pencil, read-only | No [Редактировать] in expanded view, read-only |
| Save | EditStageDialog handles save | EditStageDialog handles save |

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
│ 2  ● Принято      🍽  🚚    Выключен    ▾  │
└────────────────────────────────────────────┘
```

### Wireframe — MOBILE accordion (expanded, unlocked stage)
```
┌────────────────────────────────────────────┐
│ 3  ● Готовится                    Активен  │
│                                         ▴  │
│  Каналы: 🍽 В зале  📦 Самовывоз  🚚 Доставка │
│  Роли: Менеджер  Персонал                  │
│  [Редактировать]   ← opens EditStageDialog │
└────────────────────────────────────────────┘
```

### Wireframe — MOBILE accordion (expanded, locked stage)
```
┌────────────────────────────────────────────┐
│ 1  ● Новый                   🔒 Зафиксирован│
│                                         ▴  │
│  Каналы: 🍽 В зале  📦 Самовывоз  🚚 Доставка │
│  Роли: Менеджер  Персонал                  │
│  (no edit button)                          │
└────────────────────────────────────────────┘
```

### Что менять — STEP 1: Add accordion state to parent component

Find the `useState` group at lines 1076-1079 (grep: `toggleBusyKey`). Add two new state variables immediately after:

```jsx
const [expandedKey, setExpandedKey] = useState(null); // which stage row is expanded on mobile
const [editingKey, setEditingKey] = useState(null);   // reserved for future inline edit (not used yet)
```

### Что менять — STEP 2: Replace FixedStageRow function

Replace the entire `FixedStageRow` function (grep: `function FixedStageRow` — lines 636-769) with:

```jsx
function FixedStageRow({ slot, isExpanded, onToggleExpand, onEdit, t }) {
  const locked = slot.definition.locked;

  // preserve from original component — keep useCallback with [t] dependency
  const getRoleLabel = useCallback((role) => {
    const labels = {
      partner_staff: t("orderprocess.role.staff"),
      kitchen: t("orderprocess.role.kitchen"),
      partner_manager: t("orderprocess.role.manager"),
    };
    return labels[role] || role;
  }, [t]);

  return (
    <div className="border-b last:border-b-0">
      {/* Collapsed row — shown always (desktop and mobile) */}
      <div className="flex items-center gap-3 px-4 py-3 min-h-[44px]">
        {/* number + color dot + name */}
        <span className="text-sm text-slate-500 w-5 flex-shrink-0">{slot.index + 1}</span>
        <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: slot.color }} />
        <span className="flex-1 text-sm font-medium text-slate-900">{slot.label}</span>

        {/* channel icons */}
        <div className="flex gap-1">
          {slot.channels.enabled_hall && (
            <Utensils className="h-3.5 w-3.5 text-slate-500" title={t('channel.hall')} />
          )}
          {slot.channels.enabled_pickup && (
            <Package className="h-3.5 w-3.5 text-slate-500" title={t('channel.pickup')} />
          )}
          {slot.channels.enabled_delivery && (
            <Truck className="h-3.5 w-3.5 text-slate-500" title={t('channel.delivery')} />
          )}
        </div>

        {/* role chips — desktop only */}
        <div className="hidden sm:flex gap-1 flex-wrap">
          {slot.allowedRoles.map(role => (
            <span key={role} className="rounded-full px-2 py-0.5 text-xs bg-slate-100 text-slate-600">
              {getRoleLabel(role)}
            </span>
          ))}
        </div>

        {/* status badge */}
        <span className={`text-xs px-2.5 py-1 rounded-full font-medium flex-shrink-0 ${
          locked
            ? 'bg-slate-100 text-slate-500'
            : slot.active
              ? 'bg-emerald-100 text-emerald-700'
              : 'bg-amber-100 text-amber-700'
        }`}>
          {locked ? (
            <><Lock className="h-3 w-3 inline mr-1" />{t('orderprocess.status.locked')}</>
          ) : slot.active ? (
            t('orderprocess.status.active')
          ) : (
            t('orderprocess.status.inactive')
          )}
        </span>

        {/* desktop: pencil for editable unlocked stages */}
        {!locked && slot.canEdit && (
          <button
            onClick={() => onEdit(slot.stage)}
            className="hidden sm:flex p-1 text-slate-400 hover:text-slate-600 min-h-[44px] items-center"
            aria-label={t('orderprocess.aria.edit')}
          >
            <Pencil className="h-4 w-4" />
          </button>
        )}

        {/* mobile: chevron toggle */}
        <button
          onClick={() => onToggleExpand(slot.key)}
          className="sm:hidden p-1 text-slate-400 min-h-[44px] min-w-[44px] flex items-center justify-center"
        >
          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
      </div>

      {/* Expanded panel — mobile only */}
      {isExpanded && (
        <div className="sm:hidden px-4 pb-3 pt-1 bg-slate-50 text-sm space-y-2">
          {/* channels with labels */}
          <div className="flex items-center gap-3 text-slate-600">
            <span className="text-xs font-medium text-slate-500">{t('orderprocess.channels_label')}:</span>
            {slot.channels.enabled_hall && (
              <span className="flex items-center gap-1">
                <Utensils className="h-3.5 w-3.5" />{t('channel.hall')}
              </span>
            )}
            {slot.channels.enabled_pickup && (
              <span className="flex items-center gap-1">
                <Package className="h-3.5 w-3.5" />{t('channel.pickup')}
              </span>
            )}
            {slot.channels.enabled_delivery && (
              <span className="flex items-center gap-1">
                <Truck className="h-3.5 w-3.5" />{t('channel.delivery')}
              </span>
            )}
          </div>

          {/* roles */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-medium text-slate-500">{t('orderprocess.roles_label')}:</span>
            {slot.allowedRoles.map(role => (
              <span key={role} className="rounded-full px-2 py-0.5 text-xs bg-slate-100 text-slate-600">
                {getRoleLabel(role)}
              </span>
            ))}
          </div>

          {/* edit button — only for unlocked stages with DB record */}
          {!locked && slot.canEdit && (
            <button
              onClick={() => onEdit(slot.stage)}
              className="mt-1 text-sm text-blue-600 font-medium min-h-[44px] flex items-center"
            >
              {t('orderprocess.edit_button')}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
```

### Что менять — STEP 3: Update call-site (REQUIRED)

Find the existing call-site (grep: `<FixedStageRow` — lines 1609-1618). Replace the entire `.map()` block with:

```jsx
{fixedStageSlots.map((slot) => (
  <FixedStageRow
    key={slot.key}
    slot={slot}
    isExpanded={expandedKey === slot.key}
    onToggleExpand={(key) => setExpandedKey(prev => prev === key ? null : key)}
    onEdit={handleEditStage}
    t={t}
  />
))}
```

⚠️ NOTE: `toggleBusyKey` and `onToggle` are intentionally removed from props — active/inactive toggling is now handled exclusively through EditStageDialog (per UX v2.0). The old toggle button in each row is gone.

### Проверка
- Desktop: all 5 stages as compact rows, channel icon tooltips visible on hover, pencil opens EditStageDialog for unlocked+canEdit stages only
- Mobile: all 5 stages collapsed by default, tap chevron expands ONE stage (tapping same key collapses), expanded view shows channels/roles/edit button
- Locked stages: no pencil (desktop), no [Редактировать] button (mobile expanded)
- canEdit=false (slot has no DB record): same behavior as locked for edit access

---

## Fix 3 — ADD mobile channel legend at top of page [MUST-FIX]

### Проблема
On mobile, channel icons (🍽📦🚚) in stage rows are shown without text. Users need a one-time legend at the top.

### Wireframe
```
┌────────────────────────────────────────────┐
│ 🍽 В зале  📦 Самовывоз  🚚 Доставка       │
└────────────────────────────────────────────┘
```

### Что менять
Find the JSX anchor `className="bg-white rounded-xl border overflow-hidden"` in the main render (grep: `bg-white rounded-xl border overflow-hidden`). Insert the following JSX IMMEDIATELY BEFORE the line containing this class:

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
- Desktop (`sm:` breakpoint): legend hidden (sm:hidden)

---

## Fix 4 — язправ: Replace LOCAL_UI_TEXT with t() [MUST-FIX]

### Проблема
`LOCAL_UI_TEXT` (grep: `LOCAL_UI_TEXT` — lines 125-135) contains hardcoded Russian strings. Standard project i18n pattern is `t(key)` from `useI18n()`. All strings must use `t(key)`.

⚠️ NOTE: The file already uses `const { t } = useI18n()` at line 1067. This is the correct project standard. Do NOT create a `tr()` helper — use `t(key)` directly.

⚠️ NOTE: The text for `enabled`/`disabled` INTENTIONALLY changes from short `'Вкл'`/`'Выкл'` to `'Активен'`/`'Выключен'` per UX v2.0. This is correct.

### Replacement table

| Current code | Replace with | Russian value |
|---|---|---|
| `LOCAL_UI_TEXT.currentProcess` | `t('orderprocess.current_process')` | `"Текущий процесс"` |
| `LOCAL_UI_TEXT.locked` | `t('orderprocess.status.locked')` | `"Зафиксирован"` |
| `LOCAL_UI_TEXT.enabled` | `t('orderprocess.status.active')` | `"Активен"` |
| `LOCAL_UI_TEXT.disabled` | `t('orderprocess.status.inactive')` | `"Выключен"` |
| `LOCAL_UI_TEXT.blockerGeneric` | `t('orderprocess.blocker.generic')` | `"Не удалось безопасно привести этапы к фиксированной схеме."` |
| `LOCAL_UI_TEXT.blockerMultipleStart` | `t('orderprocess.blocker.multiple_start')` | `"Обнаружено несколько стартовых этапов."` |
| `LOCAL_UI_TEXT.blockerMultipleFinish` | `t('orderprocess.blocker.multiple_finish')` | `"Обнаружено несколько финальных этапов."` |
| `LOCAL_UI_TEXT.blockerTooManyMiddle` | `t('orderprocess.blocker.too_many_middle')` | `"Обнаружено больше трёх промежуточных этапов."` |
| `LOCAL_UI_TEXT.blockerUnsupportedType` | `t('orderprocess.blocker.unsupported_type')` | `"Обнаружен этап с неподдерживаемым типом."` |

After replacing all usages, DELETE the `LOCAL_UI_TEXT` constant entirely (lines 125-135).

### New t() keys to add to i18n dictionary (for Fix 2 + Fix 3)
Add these entries to the Russian i18n dictionary:
- `'orderprocess.status.locked'` → `"Зафиксирован"`
- `'orderprocess.edit_button'` → `"Редактировать"`
- `'orderprocess.channels_label'` → `"Каналы"`
- `'orderprocess.roles_label'` → `"Роли"`
- `'channel.hall'` → `"В зале"` (grep first — may already exist)
- `'channel.pickup'` → `"Самовывоз"` (grep first — may already exist)
- `'channel.delivery'` → `"Доставка"` (grep first — may already exist)
- `'toast.saved'` → `"Сохранено"` (grep first — may already exist)

⚠️ NOTE: Before adding `channel.*` and `toast.saved` keys — grep the i18n dictionary file to check if they already exist. Add only missing ones.

### Проверка
- Grep: `LOCAL_UI_TEXT` returns 0 matches in the file
- All UI text renders correctly (Russian values from dictionary)
- No raw i18n key strings visible in UI

---

## Fix 5 — REMOVE dead handlers (handleAddStage, handleMoveUp, handleMoveDown, handleDeleteStage) [NICE-TO-HAVE]

### Проблема
These functions exist but are never called in JSX (fixed 5-stage system per UX v2.0):
- `handleAddStage` (line 1229) — 0 JSX usages
- `handleMoveUp` (line 1365) — 0 JSX usages
- `handleMoveDown` (line 1390) — 0 JSX usages
- `handleDeleteStage` (line 1326) — 0 JSX usages

### ⚠️ CRITICAL: Verify before deleting

**Step A — confirm zero JSX usages:**
```bash
grep -n "handleAddStage\|handleMoveUp\|handleMoveDown\|handleDeleteStage\|deleteDialog\|handleConfirmDelete" pages/PartnerOrderProcess/partnerorderprocess.jsx
```
Only proceed if usages are in function definitions only (not JSX/onClick/props).

**Step B — check for top-level hooks:**
```bash
grep -n "useMutation\|useQuery" pages/PartnerOrderProcess/partnerorderprocess.jsx
```
⚠️ HOOK ORDER WARNING: If any of the dead functions (`handleAddStage`, `handleDeleteStage`) are connected to `useMutation` hooks called at the TOP LEVEL of the component (not inside the functions), do NOT delete those hook calls. Removing top-level React hooks changes hook call order and will crash the component. In that case: delete only the function body code, leave the `useMutation` variable declaration in place with a comment `// reserved — do not remove (hook order)`.

**Step C — safe to delete if unused:**
- Function definitions themselves
- `deleteDialog` useState (if grep confirms 0 usages outside its own declaration)
- Connected `handleConfirmDelete` (if grep confirms 0 usages)

**After deletion, add comment:**
```jsx
// NOTE: Add/Move/Delete stage handlers removed — fixed 5-stage system (UX v2.0)
```

### Проверка
- No runtime errors after deletion
- Grep: `handleAddStage`, `handleMoveUp`, `handleMoveDown`, `handleDeleteStage`, `deleteDialog` return 0 matches (except comment line)

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
- [ ] Touch targets ≥ 44px (`min-h-[44px]` on all interactive elements)
- [ ] Accordion: only one row expanded at a time (setExpandedKey toggles same key to null)
- [ ] Locked stages: no edit access on any breakpoint
- [ ] canEdit=false stages: no pencil (desktop), no [Редактировать] (mobile expanded)

## DESIGN SYSTEM
- Colors: Tailwind slate/emerald/amber palette (already used in file)
- Icons: Lucide React (`Utensils`, `Package`, `Truck`, `Lock`, `Pencil`, `ChevronUp`, `ChevronDown`) — already imported, do NOT re-import
- Badges: `rounded-full px-2.5 py-1 text-xs font-medium` (existing pattern)
- i18n: `t(key)` from `useI18n()` — already initialized at line 1067 as `const { t } = useI18n()`

## VALIDATION (run BEFORE git commit)
```bash
# 1. Line count check — BEFORE commit (expected: 1620-1700, base was 1653 ± changes)
wc -l pages/PartnerOrderProcess/partnerorderprocess.jsx
# If below 1550 → STOP, do not commit, restore: git checkout -- pages/PartnerOrderProcess/partnerorderprocess.jsx

# 2. Dead code cleanup
grep -n "LOCAL_UI_TEXT\|ChannelFilter\|CHANNEL_FILTERS" pages/PartnerOrderProcess/partnerorderprocess.jsx
# Expected: 0 matches

# 3. i18n check
grep -n "orderprocess.status.locked\|orderprocess.edit_button\|orderprocess.channels_label\|orderprocess.roles_label" pages/PartnerOrderProcess/partnerorderprocess.jsx
# Expected: multiple matches (usages in new component)

# 4. Syntax check
node --input-type=module < /dev/null 2>&1 || python -c "import ast; print('use node for jsx')"
```

## GIT
```bash
git add pages/PartnerOrderProcess/partnerorderprocess.jsx
git commit -m "feat: redesign PartnerOrderProcess — compact table + mobile accordion + i18n"
git push
```
