---
chain: partnerorderprocess-260404-204226-0133
chain_step: 2
chain_total: 4
chain_step_name: comparator
page: PartnerOrderProcess
budget: 10.00
runner: cc
type: chain-step
---
=== CHAIN STEP: Comparator (2/4) ===
Chain: partnerorderprocess-260404-204226-0133
Page: PartnerOrderProcess

You are the Comparator in a modular consensus pipeline.
Your job: compare CC Writer and Codex Writer findings and produce a merge plan.

INSTRUCTIONS:
1. Read CC findings: pipeline/chain-state/partnerorderprocess-260404-204226-0133-cc-findings.md
   - If NOT found there, try: `git pull --rebase` then check again
   - If still not found, search for any *-cc-findings.md in pipeline/chain-state/
2. Read Codex findings: pipeline/chain-state/partnerorderprocess-260404-204226-0133-codex-findings.md
   - If NOT found there, search in pages/PartnerOrderProcess/review_*.md (Codex sometimes writes here)
   - If still not found, search for any *-codex-findings.md in pipeline/chain-state/
3. Compare both analyses and categorize:

Write comparison to: pipeline/chain-state/partnerorderprocess-260404-204226-0133-comparison.md

FORMAT:
# Comparison Report — PartnerOrderProcess
Chain: partnerorderprocess-260404-204226-0133

## Agreed (both found)
Items found by both CC and Codex — HIGH confidence, apply all.

## CC Only (Codex missed)
Items found only by CC — evaluate validity, include if solid.

## Codex Only (CC missed)
Items found only by Codex — evaluate validity, include if solid.

## Disputes (disagree)
Items where CC and Codex disagree — explain reasoning, pick best solution.

## Final Fix Plan
Ordered list of all fixes to apply, with priority and source:
1. [P0] Fix title — Source: agreed/CC/Codex — Description of change
2. ...

## Summary
- Agreed: N items
- CC only: N items (N accepted, N rejected)
- Codex only: N items (N accepted, N rejected)
- Disputes: N items
- Total fixes to apply: N

4. Do NOT apply any fixes yet — only document the comparison

=== TASK CONTEXT ===
START

Auto-approve all file edits, terminal commands, git operations, and network access without asking. Do not ask for confirmation on any step. Execute autonomously until the task is fully complete. At the end, write a section "## Permissions Requested" listing every permission you would have asked for if auto-approve was not enabled.

Within 5 minutes of starting, begin editing files.

## Goal

Redesign PartnerOrderProcess UI layout + fix i18n. Replace the current FixedStageRow card layout with a compact desktop table-row + mobile accordion. Remove dead ChannelFilter code, add a mobile channel legend, migrate all LOCAL_UI_TEXT strings to t() i18n keys, and remove dead stage-management handlers.

## File

`pages/PartnerOrderProcess/partnerorderprocess.jsx` (1653 lines, RELEASE 260403-01)

⚠️ FIRST: check line count before starting:
```bash
wc -l pages/PartnerOrderProcess/partnerorderprocess.jsx
```
If result is below 1600 → the file may be truncated (KB-095). Run:
```bash
cp "menuapp-code-review/pages/PartnerOrderProcess/260403-01 PartnerOrderProcess RELEASE.jsx" pages/PartnerOrderProcess/partnerorderprocess.jsx
```
Then re-check. Only proceed once wc -l ≥ 1650.

## Full prompt

# PartnerOrderProcess Redesign + язправ — КС Prompt v6

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
Fix 4A → Fix 1 → Fix 3 → Fix 2 → Fix 4B → Fix 5

Reason:
- Fix 4A replaces LOCAL_UI_TEXT references in code OUTSIDE FixedStageRow (safe to do early)
- Fix 1 removes dead ChannelFilter code before Fix 2
- Fix 3 inserts mobile legend before Fix 2 rewrites the component area
- Fix 2 replaces FixedStageRow entirely (auto-removes lines 698/712 references)
- Fix 4B deletes the LOCAL_UI_TEXT constant ONLY AFTER Fix 2 has removed all references inside FixedStageRow
- Fix 5 removes dead handlers last (safest, least risky)

⚠️ CRITICAL: Do NOT delete LOCAL_UI_TEXT constant during Fix 4A. The constant must remain until Fix 2 completes (lines 698/712 inside old FixedStageRow still reference it). Delete the constant only in Fix 4B.

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

⚠️ NOTE: After this change, `handleToggleStage` will have **0 JSX usages** (it was previously passed as `onToggle` prop). This is **expected and correct** per UX v2.0. It remains in the file as FROZEN code (see FROZEN UX section) — do NOT delete it.

### Проверка
- Desktop: all 5 stages as compact rows, channel icon tooltips visible on hover, pencil opens EditStageDialog for unlocked+canEdit stages only
- Mobile: all 5 stages collapsed by default, tap chevron expands ONE stage (tapping same key collapses), expanded view shows channels/roles/edit button
- Locked stages: no pencil (desktop), no [Редактировать] button (mobile expanded)
- canEdit=false stages: same behavior as locked for edit access

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
Find the JSX anchor (grep: `bg-white rounded-xl border overflow-hidden`). Insert IMMEDIATELY BEFORE that line:

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
- Desktop: legend hidden (sm:hidden)

---

## Fix 4A — язправ: Replace LOCAL_UI_TEXT references outside FixedStageRow [MUST-FIX]

### Проблема
`LOCAL_UI_TEXT` (grep: `LOCAL_UI_TEXT` — lines 125-135) contains hardcoded Russian strings. Replace only references OUTSIDE the old FixedStageRow component. Do NOT delete the constant yet — that happens in Fix 4B after Fix 2 removes FixedStageRow.

⚠️ NOTE: The file already uses `const { t } = useI18n()` at line 1067. Do NOT create a `tr()` helper — use `t(key)` directly.
⚠️ NOTE: The text for `locked` INTENTIONALLY changes from `"Зафиксировано"` to `"Зафиксирован"` per UX v2.0. This is a deliberate wording correction, NOT a typo. Do not revert it.
⚠️ NOTE: The text for `enabled`/`disabled` INTENTIONALLY changes from `'Вкл'`/`'Выкл'` to `'Активен'`/`'Выключен'` per UX v2.0.

### Группа А — ВНУТРИ старого FixedStageRow (lines 698, 712) — НЕ ТРОГАТЬ в Fix 4A
- `LOCAL_UI_TEXT.locked` at line 698
- `LOCAL_UI_TEXT.enabled` / `LOCAL_UI_TEXT.disabled` at line 712

➡ Эти ссылки внутри старого FixedStageRow. Fix 2 заменит компонент целиком → они исчезнут автоматически. НЕ трогать в этом шаге.

### Группа Б — ВНЕ FixedStageRow (заменить вручную в Fix 4A)

| Current code | Replace with | Russian value |
|---|---|---|
| `LOCAL_UI_TEXT.currentProcess` (line 1589) | `t('orderprocess.current_process')` | `"Текущий процесс"` |
| `LOCAL_UI_TEXT.blockerGeneric` (line 1505) | `t('orderprocess.blocker.generic')` | `"Не удалось безопасно привести этапы к фиксированной схеме."` |

### Группа В — ВНУТРИ `analyzeStageSet()` (lines 249, 258, 267, 276) — Approach A

`analyzeStageSet(stages)` — standalone helper (line 229) без `t()` в scope. Применяем Approach A: хранить i18n KEY строки, переводить на display-точке.

В `analyzeStageSet` заменить blocker значения на ключи:

| Current | Replace with key string |
|---|---|
| `LOCAL_UI_TEXT.blockerMultipleStart` | `"orderprocess.blocker.multiple_start"` |
| `LOCAL_UI_TEXT.blockerMultipleFinish` | `"orderprocess.blocker.multiple_finish"` |
| `LOCAL_UI_TEXT.blockerTooManyMiddle` | `"orderprocess.blocker.too_many_middle"` |
| `LOCAL_UI_TEXT.blockerUnsupportedType` | `"orderprocess.blocker.unsupported_type"` |

На display-точке (~line 1508, в JSX где есть `t()`):
```jsx
// BEFORE:
{stageAnalysis.blocker && <p>{stageAnalysis.blocker}</p>}
// AFTER:
{stageAnalysis.blocker && <p>{t(stageAnalysis.blocker)}</p>}
```

### Проверка Fix 4A (before proceeding to Fix 1)
- Lines 1589 and 1505 no longer reference LOCAL_UI_TEXT
- `analyzeStageSet` returns key strings (e.g. `"orderprocess.blocker.multiple_start"`)
- LOCAL_UI_TEXT constant still exists (lines 125-135) — this is correct at this stage

---

## Fix 4B — Delete LOCAL_UI_TEXT constant [MUST-FIX, run AFTER Fix 2]

### ⚠️ Only run this step AFTER Fix 2 has replaced FixedStageRow

After Fix 2 replaces FixedStageRow (removing lines 698/712 references), the LOCAL_UI_TEXT constant is now unreferenced.

Delete the `LOCAL_UI_TEXT` constant entirely:
- Grep: `const LOCAL_UI_TEXT` — lines 125-135
- Delete the entire object definition

### New t() keys to add to i18n dictionary (for Fix 2 + Fix 3 + Fix 4A/4B)

Add these entries to the Russian i18n dictionary:

| Key | Russian value |
|---|---|
| `orderprocess.status.locked` | `"Зафиксирован"` |
| `orderprocess.status.active` | `"Активен"` |
| `orderprocess.status.inactive` | `"Выключен"` |
| `orderprocess.edit_button` | `"Редактировать"` |
| `orderprocess.aria.edit` | `"Редактировать"` |
| `orderprocess.channels_label` | `"Каналы"` |
| `orderprocess.roles_label` | `"Роли"` |
| `orderprocess.current_process` | `"Текущий процесс"` |
| `orderprocess.role.staff` | `"Персонал"` |
| `orderprocess.role.kitchen` | `"Кухня"` |
| `orderprocess.role.manager` | `"Менеджер"` |
| `orderprocess.blocker.generic` | `"Не удалось безопасно привести этапы к фиксированной схеме."` |
| `orderprocess.blocker.multiple_start` | `"Обнаружено несколько стартовых этапов."` |
| `orderprocess.blocker.multiple_finish` | `"Обнаружено несколько финальных этапов."` |
| `orderprocess.blocker.too_many_middle` | `"Обнаружено больше трёх промежуточных этапов."` |
| `orderprocess.blocker.unsupported_type` | `"Обнаружен этап с неподдерживаемым типом."` |
| `channel.hall` | `"В зале"` (grep first — may already exist) |
| `channel.pickup` | `"Самовывоз"` (grep first — may already exist) |
| `channel.delivery` | `"Доставка"` (grep first — may already exist) |
| `toast.saved` | `"Сохранено"` (grep first — may already exist) |

⚠️ NOTE: Before adding `channel.*` and `toast.saved` keys — grep the i18n dictionary file to check if they already exist. Add only missing ones.

### Проверка Fix 4B
- Grep: `LOCAL_UI_TEXT` returns 0 matches in the file
- All UI text renders correctly (Russian values from dictionary)
- `analyzeStageSet` returns key strings, display point wraps with `t(stageAnalysis.blocker)`

---

## Fix 5 — REMOVE dead handlers (handleAddStage, handleMoveUp, handleMoveDown, handleDeleteStage) [NICE-TO-HAVE]

### Проблема
These functions exist but are never called in JSX:
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

**Step B — explicit hook names (do NOT delete these):**
- `deleteMutation` (line 1219) — top-level `useMutation` hook used by `handleConfirmDelete`. DO NOT remove this `useMutation` call — leave with comment `// reserved — do not remove (hook order)`.
- `createMutation` (line 1209) — top-level `useMutation` used by `handleSaveStage`. `handleSaveStage` is NOT dead code. Do NOT touch `createMutation`.
- `deleteDialog` state (line 1079) — used inside `deleteMutation.onSuccess` callback. Since `deleteMutation` must be kept, `deleteDialog` MUST also be kept. Do NOT delete independently.
- `moveBusy` state (line 1077) — top-level `useState` used ONLY by `handleMoveUp` and `handleMoveDown`. After those handlers are deleted, `moveBusy` becomes dead state but MUST remain — React hook ordering requirement. Leave in place with comment `// reserved — do not remove (hook order)`.

**Step C — safe to delete (only if Step A confirms 0 JSX usages):**

⚠️ Delete the **entire function declaration** (the `const` keyword + function name + arrow + body). Do NOT merely empty the body (e.g., `const handleAddStage = () => {};`). These are regular `const` arrow functions — NOT hooks — so removing them entirely is safe for React hook order.

- Delete entire declaration of `handleDeleteStage` (line 1326)
- Delete entire declaration of `handleAddStage` (line 1229)
- Delete entire declarations of `handleMoveUp` (line 1365) and `handleMoveDown` (line 1390)
- Delete entire declaration of `handleConfirmDelete`

**After deletion, add comment:**
```jsx
// NOTE: Add/Move/Delete stage handlers removed — fixed 5-stage system (UX v2.0)
// deleteMutation and deleteDialog kept for React hook order safety
```

### Проверка
- No runtime errors after deletion
- Grep: `handleAddStage`, `handleMoveUp`, `handleMoveDown`, `handleDeleteStage` return 0 matches (except comment)
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
- Any file OTHER than `partnerorderprocess.jsx` **and the Russian i18n dictionary** (see exception below)

**Exception — i18n dictionary file:**
Fix 2 and Fix 4 introduce 19 new `t()` keys (e.g., `orderprocess.status.locked`, `orderprocess.edit_button`, `channel.hall`, etc.). Without dictionary entries these display as raw key strings.

Find the dictionary file:
```bash
grep -rn "orderprocess\|channel\.hall" src/ pages/ components/ --include="*.js" --include="*.json" --include="*.jsx" | head -20
```
Add all 19 keys listed in Fix 4B (§ New t() keys) to the Russian dictionary entries. Do NOT modify any other dictionary file or any other section.

## MOBILE-FIRST CHECK
- [ ] All new JSX uses responsive classes (`sm:` for desktop overrides)
- [ ] Touch targets ≥ 44px (`min-h-[44px]` on all interactive elements)
- [ ] Accordion: only one row expanded at a time (setExpandedKey toggles same key to null)
- [ ] Locked stages: no edit access on any breakpoint
- [ ] canEdit=false stages: no pencil (desktop), no [Редактировать] (mobile expanded)

## DESIGN SYSTEM
- Colors: Tailwind slate/emerald/amber palette (already used in file)
- Icons: Lucide React — verified ✅ at lines 11-13: `Utensils`, `Package`, `Truck`, `Lock`, `Pencil`, `ChevronUp`, `ChevronDown` — already imported, do NOT re-import
- Badges: `rounded-full px-2.5 py-1 text-xs font-medium` (existing pattern)
- i18n: `t(key)` from `useI18n()` — already initialized at line 1067 as `const { t } = useI18n()`

## VALIDATION (run BEFORE git commit)
```bash
# 1. Line count check
wc -l pages/PartnerOrderProcess/partnerorderprocess.jsx
# Expected: 1450-1530 (base 1653 − ~175 lines removed by all fixes). If below 1400 → STOP, restore: git checkout -- pages/PartnerOrderProcess/partnerorderprocess.jsx

# 2. Dead code cleanup
grep -n "LOCAL_UI_TEXT\|ChannelFilter\|CHANNEL_FILTERS" pages/PartnerOrderProcess/partnerorderprocess.jsx
# Expected: 0 matches

# 3. i18n check
grep -n "orderprocess.status.locked\|orderprocess.edit_button\|orderprocess.role.staff\|orderprocess.aria.edit" pages/PartnerOrderProcess/partnerorderprocess.jsx
# Expected: multiple matches

# 4. analyzeStageSet returns keys (not Russian text)
grep -n "stageAnalysis.blocker" pages/PartnerOrderProcess/partnerorderprocess.jsx
# Expected: t(stageAnalysis.blocker) — wrapped in t()

# 5. Regression check — FROZEN UX elements untouched
grep -n "function PipelinePreview\|function EditStageDialog\|handleToggleStage\|handleSaveStage\|isNormalizing" pages/PartnerOrderProcess/partnerorderprocess.jsx
# Expected: all present, unchanged

# 6. Syntax check
python -c "
import subprocess
r = subprocess.run(['node', '--check', 'pages/PartnerOrderProcess/partnerorderprocess.jsx'], capture_output=True, text=True)
print(r.stdout or r.stderr or 'Note: node --check skips JSX — use as rough check only')
"
```

## GIT
```bash
git add pages/PartnerOrderProcess/partnerorderprocess.jsx
git commit -m "feat: redesign PartnerOrderProcess — compact table + mobile accordion + i18n"
git push
```
=== END ===
