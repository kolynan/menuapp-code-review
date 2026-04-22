# PartnerOrderProcess Redesign + язправ — КС Prompt v4

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

Find the `useState` group at lines 1076-1079 (grep: `toggleBusyKey`). Add ONE new state variable immediately after:

```jsx
const [expandedKey, setExpandedKey] = useState(null); // which stage row is expanded on mobile
```

⚠️ NOTE: Do NOT add `editingKey` state — it is not used anywhere and would be dead code (YAGNI).

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

⚠️ NOTE: The text for `locked` INTENTIONALLY changes from `"Зафиксировано"` (current value at line 127) to `"Зафиксирован"` per UX v2.0. This is a deliberate wording correction, NOT a typo. Do not revert it.

⚠️ NOTE: The text for `enabled`/`disabled` INTENTIONALLY changes from short `'Вкл'`/`'Выкл'` to `'Активен'`/`'Выключен'` per UX v2.0. This is correct.

### Группировка LOCAL_UI_TEXT references (IMPORTANT — read before making changes)

**Группа A — ВНУТРИ старого FixedStageRow (lines 698, 712):**
- `LOCAL_UI_TEXT.locked` at line 698
- `LOCAL_UI_TEXT.enabled` / `LOCAL_UI_TEXT.disabled` at line 712

➡ Эти ссылки будут автоматически УДАЛЕНЫ Fix 2 (замена всего FixedStageRow). **НЕ ТРОГАТЬ вручную.** Новый FixedStageRow уже использует `t('orderprocess.status.locked')`, `t('orderprocess.status.active')`, `t('orderprocess.status.inactive')` напрямую.

**Группа Б — ВНЕ FixedStageRow (нужна ручная замена):**
- Line 1589: `LOCAL_UI_TEXT.currentProcess` → `t('orderprocess.current_process')`
- Line 1505: `LOCAL_UI_TEXT.blockerGeneric` → `t('orderprocess.blocker.generic')`

**Группа В — ВНУТРИ `analyzeStageSet()` (lines 249, 258, 267, 276) — Approach A:**
- `analyzeStageSet(stages)` — standalone helper function (line 229) without `t()` in scope.
- The blocker strings at lines 249, 258, 267, 276 CANNOT use `t()` directly.
- Apply **Approach A**: change the function to RETURN i18n KEY strings (not translated text). Translate at the display point in JSX where `t()` is available.

**Approach A implementation for analyzeStageSet:**

In `analyzeStageSet`, replace the blocker string values with i18n keys:
```js
// BEFORE (example):
return { stages: ..., blocker: LOCAL_UI_TEXT.blockerMultipleStart };

// AFTER — store the KEY, not the translated text:
return { stages: ..., blocker: "orderprocess.blocker.multiple_start" };
```

Apply to all 4 blocker cases:
| Current LOCAL_UI_TEXT field | Replace with key string |
|---|---|
| `LOCAL_UI_TEXT.blockerMultipleStart` | `"orderprocess.blocker.multiple_start"` |
| `LOCAL_UI_TEXT.blockerMultipleFinish` | `"orderprocess.blocker.multiple_finish"` |
| `LOCAL_UI_TEXT.blockerTooManyMiddle` | `"orderprocess.blocker.too_many_middle"` |
| `LOCAL_UI_TEXT.blockerUnsupportedType` | `"orderprocess.blocker.unsupported_type"` |

At the **display point** (line ~1508, inside JSX where `t()` is available), update the render:
```jsx
// BEFORE:
{stageAnalysis.blocker && <p>{stageAnalysis.blocker}</p>}

// AFTER — translate the key at display:
{stageAnalysis.blocker && <p>{t(stageAnalysis.blocker)}</p>}
```

### Replacement table (Группа Б — ручная замена)

| Current code | Replace with | Russian value |
|---|---|---|
| `LOCAL_UI_TEXT.currentProcess` | `t('orderprocess.current_process')` | `"Текущий процесс"` |
| `LOCAL_UI_TEXT.blockerGeneric` | `t('orderprocess.blocker.generic')` | `"Не удалось безопасно привести этапы к фиксированной схеме."` |

After all replacements (Groups A auto-deleted by Fix 2, Groups Б+В manually replaced), DELETE the `LOCAL_UI_TEXT` constant entirely (lines 125-135).

### New t() keys to add to i18n dictionary (for Fix 2 + Fix 3 + Fix 4)
Add these entries to the Russian i18n dictionary:
- `'orderprocess.status.locked'` → `"Зафиксирован"`
- `'orderprocess.edit_button'` → `"Редактировать"`
- `'orderprocess.channels_label'` → `"Каналы"`
- `'orderprocess.roles_label'` → `"Роли"`
- `'orderprocess.current_process'` → `"Текущий процесс"`
- `'orderprocess.blocker.generic'` → `"Не удалось безопасно привести этапы к фиксированной схеме."`
- `'orderprocess.blocker.multiple_start'` → `"Обнаружено несколько стартовых этапов."`
- `'orderprocess.blocker.multiple_finish'` → `"Обнаружено несколько финальных этапов."`
- `'orderprocess.blocker.too_many_middle'` → `"Обнаружено больше трёх промежуточных этапов."`
- `'orderprocess.blocker.unsupported_type'` → `"Обнаружен этап с неподдерживаемым типом."`
- `'channel.hall'` → `"В зале"` (grep first — may already exist)
- `'channel.pickup'` → `"Самовывоз"` (grep first — may already exist)
- `'channel.delivery'` → `"Доставка"` (grep first — may already exist)
- `'toast.saved'` → `"Сохранено"` (grep first — may already exist)

⚠️ NOTE: Before adding `channel.*` and `toast.saved` keys — grep the i18n dictionary file to check if they already exist. Add only missing ones.

### Проверка
- Grep: `LOCAL_UI_TEXT` returns 0 matches in the file
- Grep: `analyzeStageSet` returns keys (strings starting with `"orderprocess.blocker."`) not Russian text
- Display point wraps result with `t(stageAnalysis.blocker)`
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

⚠️ HOOK ORDER WARNING — explicit hook names:
- `deleteMutation` (line 1219) — top-level `useMutation` hook used by `handleConfirmDelete`. Do NOT remove this `useMutation` call — removing top-level React hooks changes hook call order and will crash the component. Leave `deleteMutation` in place with comment `// reserved — do not remove (hook order)`.
- `createMutation` (line 1209) — top-level `useMutation` hook used by `handleSaveStage`. `handleSaveStage` is NOT dead code (it is called from EditStageDialog). Do NOT touch `createMutation` at all.

**Step C — deleteDialog state coupling:**
- `deleteDialog` state (line 1079) is used inside `deleteMutation.onSuccess` callback (calls `setDeleteDialog({ open: false, stage: null })`).
- Since `deleteMutation` hook must be kept (hook order), `deleteDialog` state MUST also be kept. Do NOT delete `deleteDialog` independently — deleting it while `deleteMutation` remains will cause a crash when `onSuccess` calls `setDeleteDialog`.

**Step D — safe to delete:**
- Function body of `handleDeleteStage` (line 1326) — if grep Step A confirms 0 JSX usages
- Function body of `handleAddStage` (line 1229) — if grep Step A confirms 0 JSX usages
- Function bodies of `handleMoveUp` (line 1365) and `handleMoveDown` (line 1390) — if grep Step A confirms 0 JSX usages
- `handleConfirmDelete` function — if grep Step A confirms 0 JSX usages

**After deletion, add comment:**
```jsx
// NOTE: Add/Move/Delete stage handlers removed — fixed 5-stage system (UX v2.0)
// deleteMutation and deleteDialog kept for React hook order safety
```

### Проверка
- No runtime errors after deletion
- Grep: `handleAddStage`, `handleMoveUp`, `handleMoveDown`, `handleDeleteStage` return 0 matches (except comment line)
- `deleteMutation` and `deleteDialog` remain in file

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

# 4. analyzeStageSet returns keys (not Russian text)
grep -n "analyzeStageSet" pages/PartnerOrderProcess/partnerorderprocess.jsx
# Check that blocker values are key strings like "orderprocess.blocker.*"

# 5. Display point translates the key
grep -n "stageAnalysis.blocker" pages/PartnerOrderProcess/partnerorderprocess.jsx
# Expected: wrapped in t(...): t(stageAnalysis.blocker)

# 6. Syntax check
python -c "
import subprocess, sys
r = subprocess.run(['node', '--check', 'pages/PartnerOrderProcess/partnerorderprocess.jsx'], capture_output=True, text=True)
print(r.stdout or r.stderr or 'Note: node --check does not validate JSX syntax, use as rough check only')
"
```

## GIT
```bash
git add pages/PartnerOrderProcess/partnerorderprocess.jsx
git commit -m "feat: redesign PartnerOrderProcess — compact table + mobile accordion + i18n"
git push
```
