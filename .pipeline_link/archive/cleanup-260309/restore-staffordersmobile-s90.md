---
task_id: restore-staffordersmobile-s90
status: pending
page: StaffOrdersMobile
work_dir: C:/Users/ASUS/OneDrive/002 Menu/Claude AI Cowork/menuapp-code-review
budget_usd: 10
fallback_model: sonnet
system_rules: C:/Users/ASUS/OneDrive/002 Menu/Claude AI Cowork/references/cc-system-rules.txt
version: "4.0"
---

# Task: restore-staffordersmobile-s90

## Config (v4.0)
- Budget: $10
- Fallback model: sonnet
- System rules: cc-system-rules.txt (v4.0 — READ IT FIRST, especially "File Integrity Protection" section)
- Progress: per-task TG message via progress-monitor.sh

## Prompt
IMPORTANT: Your VERY FIRST action must be: echo "started $(date -Iseconds)" > "C:/Users/ASUS/OneDrive/002 Menu/Claude AI Cowork/pipeline/started-restore-staffordersmobile-s90.md" — this confirms to Cowork that you started working.

=== TASK SETUP ===
Progress file: C:/Users/ASUS/OneDrive/002 Menu/Claude AI Cowork/pipeline/progress-restore-staffordersmobile-s90.txt
Task ID: restore-staffordersmobile-s90
=== END TASK SETUP ===

---
task: restore-staffordersmobile-s90
type: restore + bugfix
budget: "$10"
priority: P0
codex: yes
---

# Задача: Восстановить StaffOrdersMobile из полной версии + применить фиксы S88+S89

## КРИТИЧЕСКИЙ КОНТЕКСТ

В S88 CC переписал staffordersmobile.jsx ЦЕЛИКОМ и потерял ~920 строк кода (было 3978, стало 3042).
Потеряны: changelog-комментарий (70 строк), импорты (useQueries, ChevronLeft, Phone, MapPin),
и сотни строк функций expand/collapse, детального просмотра, банерных нотификаций и др.

Текущий base (`pages/StaffOrdersMobile/base/staffordersmobile.jsx`) — ОБРЕЗАННЫЙ (3058 строк).
Полная версия: `pages/StaffOrdersMobile/versions/260305-00 StaffOrdersMobile RELEASE.jsx` (3978 строк).

## ПЛАН ДЕЙСТВИЙ (строго по шагам)

### Шаг 1: Восстановить base из полной версии
```bash
cd pages/StaffOrdersMobile
cp base/staffordersmobile.jsx base/staffordersmobile.jsx.broken
cp "versions/260305-00 StaffOrdersMobile RELEASE.jsx" base/staffordersmobile.jsx
```
Проверить: `wc -l base/staffordersmobile.jsx` должно быть 3978.

### Шаг 2: Бэкап восстановленного файла
```bash
cp base/staffordersmobile.jsx base/staffordersmobile.jsx.bak
BEFORE=$(wc -l < base/staffordersmobile.jsx)
echo "[CHK] Base restored: $BEFORE lines" >> "$PLOG"
```

### Шаг 3: Применить фикс SO-S89-01 ТОЧЕЧНО (ТОЛЬКО Edit tool / sed)
Фикс из S89: добавить `STAGE_NAME_FALLBACKS` map + `getStageName()` helper function.
Маппинг i18n ключей → русские имена для orderprocess.default.new/accepted/in_progress/ready/served/cancelled.
Применяется в `getStatusConfig()` для `label` и `actionLabel`.

**ПРАВИЛА:**
- НЕ переписывать файл целиком. Только ТОЧЕЧНЫЕ вставки через Edit tool.
- Найти `getStatusConfig` функцию, добавить `STAGE_NAME_FALLBACKS` перед ней, и добавить вызов `getStageName()` внутри.
- Пример вставки — перед функцией getStatusConfig:
```javascript
const STAGE_NAME_FALLBACKS = {
  'orderprocess.default.new': 'Новый',
  'orderprocess.default.accepted': 'Принят',
  'orderprocess.default.in_progress': 'Готовится',
  'orderprocess.default.ready': 'Готов',
  'orderprocess.default.served': 'Подан',
  'orderprocess.default.cancelled': 'Отменён',
};

const getStageName = (name) => {
  if (!name) return '';
  return STAGE_NAME_FALLBACKS[name] || name;
};
```
- Внутри `getStatusConfig()` заменить прямое использование `name` на `getStageName(name)` для label/actionLabel.

### Шаг 4: Проверить размер после фикса
```bash
AFTER=$(wc -l < base/staffordersmobile.jsx)
echo "[CHK] After fix: $BEFORE -> $AFTER lines" >> "$PLOG"
```
AFTER должен быть >= BEFORE (мы только ДОБАВЛЯЛИ код). Если AFTER < BEFORE * 0.95 — СТОП, восстановить из .bak.

### Шаг 5: Git commit
```bash
git add . && git commit -m "restore: StaffOrdersMobile from 260305-00 + apply SO-S89-01 fix" && git push
```

### Шаг 6: Создать RELEASE
```bash
# Архивировать старые
mv "260306-01 StaffOrdersMobile RELEASE.jsx" versions/ 2>/dev/null
mv "260306-03 StaffOrdersMobile RELEASE.jsx" versions/ 2>/dev/null
# Новый RELEASE
cp base/staffordersmobile.jsx "260306-04 StaffOrdersMobile RELEASE.jsx"
```

### Шаг 7: Финальная валидация
```bash
FINAL=$(wc -l < "260306-04 StaffOrdersMobile RELEASE.jsx")
echo "[CHK] RELEASE 260306-04: $FINAL lines (was 3978 in 260305-00)" >> "$PLOG"
```
FINAL должен быть ~3978 + ~15 (добавленный код). Если меньше 3978 — ЧТО-ТО ПОШЛО НЕ ТАК.

### Шаг 8: Обновить BUGS.md и README
- BUGS.md: SO-S89-01 → Fixed (260306-04), пометить что 260306-01 и 260306-03 были дефектные (truncated)
- README: добавить строку v4.0.1 — restored from 260305-00, re-applied SO-S89-01 fix

### Шаг 9: Git final
```bash
git add . && git commit -m "release: StaffOrdersMobile 260306-04 (restored + SO-S89-01)" && git push
```

## НАПОМИНАНИЕ: ПРАВИЛА F1-F7 (cc-system-rules v4.0)
- F1: НИКОГДА не переписывать файл целиком (>100 строк) — только Edit/sed
- F2: Бэкап .bak перед правками
- F3: wc -l до и после, стоп при потере >5%
- F4: Менять ТОЛЬКО то, что в задаче
- F5: git diff --stat — diff должен быть маленький
- F6: grep ключевых функций после правок
- F7: Никаких «улучшений» без запроса

## Приоритет
P0 — это восстановление потерянного кода. Без этого деплоить нельзя.
