---
chain_template: pssk-review
budget: 10
code_file: menuapp-code-review/pages/MenuDishes/menudishes.jsx
ws: WS-MD
type: ПССК
pc_verdict: GO
---

# ПССК MenuDishes — Batch Dummy: ButtonSecondary Fix
**Версия:** v1 | **Сессия:** S308 | **Дата:** 2026-04-17

<!-- PC-VERDICT: GO (S308, 2026-04-17 — 2 исправления: B12 Fix-маркер + E1 MOBILE-FIRST CHECK) -->

> ⚠️ **ПРИМЕР-СКЕЛЕТ** — сгенерирован `skills/pssk-generator.md` v1.0 (S308) для демонстрации структуры.
> Использует реальный файл `menudishes.jsx` (2995 строк) и реальные anchors.
> Задача вымышленная: замена amber-кнопки «Попробовать снова» на shadcn variant="secondary".

---

## Context

**TARGET FILES (будут изменены):**
- `pages/MenuDishes/menudishes.jsx` (2995 lines в HEAD, `260306-01 MenuDishes RELEASE.jsx` = 2995 lines — источник истины)

**CONTEXT FILES (только для чтения, не менять):**
- Нет — все context inline.

**Задача:** Заменить нестандартный amber CSS класс на кнопке «Попробовать снова» (rate-limit screen, строка ~1815) на shadcn variant="secondary" — для consistency с дизайн-системой.

**Бюджет:** $10 | **Шаблон:** `consensus-with-discussion-v2` (С5v2) | **Вес:** S (1 Fix, изолированный) | **Модель:** claude-sonnet-4-5

**BACKLOG:** #DUMMY-01 (P2) — UI consistency: amber inline CSS → shadcn token

---

## Root Cause (VERIFIED via code reading)

Прочитал `260306-01 MenuDishes RELEASE.jsx` строки 1812-1825:

1. `<Button className="bg-amber-600 hover:bg-amber-700">` (строка ~1815) — inline Tailwind цвет вместо shadcn variant. Это единственное место в файле где Button использует сырой amber-цвет.
2. Дизайн-система MenuApp (DECISIONS_INDEX §11): все destructive/warning-action кнопки должны использовать `variant="secondary"` или `variant="destructive"` — без inline цветов.

**Sequence:** UI inconsistency. При rate-limit screen кнопка «Попробовать снова» имеет amber фон вместо стандартного secondary token — визуально выбивается из дизайна.

---

## UX Reference

- Скриншоты: `pages/MenuDishes/screenshots/current/`
- BUGS: `pages/MenuDishes/BUGS.md §BUG-MD-019`
- Дизайн-решение: кнопки secondary = стандарт для non-destructive actions (DECISIONS_INDEX §11)

---

## ⛔ FROZEN UX / FROZEN BEHAVIOR (НЕ МЕНЯТЬ)

- `onClick` handler кнопки «Попробовать снова» — НЕ менять (содержит `setRateLimitHit(false)` + `queryClient.invalidateQueries()`)
- `rateLimitHit` логика — НЕ трогать state/conditional
- Текст кнопки — НЕ менять
- Все остальные Button на странице — НЕ затрагивать

**SCOPE LOCK:**
- ✅ Можно менять: только `className="bg-amber-600 hover:bg-amber-700"` → `variant="secondary"` в строке ~1815
- ⛔ Запрещено менять: onClick handler, текст кнопки, все остальные компоненты, state logic

---

## Working Directory

> **cwd для всех bash команд:** `Menu AI Cowork/` (корень проекта).
> CC writer: выполни `pwd` при старте, убедись что НЕ в worktree.

---

## Fix Application Order

Порядок: Fix 1 (единственный Fix). Один Edit, изолированный.

---

## Preparation (выполнить ПЕРЕД Pre-flight)

```bash
# 0. Защита: gate если есть uncommitted изменения
if ! git diff --quiet -- pages/MenuDishes/menudishes.jsx; then
  echo "STOP: working copy has uncommitted changes vs HEAD. Подтверди у Arman."
  exit 1
fi

# 1. Backup рабочей копии
cp "pages/MenuDishes/menudishes.jsx" \
   "pages/MenuDishes/menudishes.jsx.bak" 2>/dev/null || true

# 2. Скопировать RELEASE → рабочую копию (источник истины = RELEASE)
cp "pages/MenuDishes/260306-01 MenuDishes RELEASE.jsx" \
   "pages/MenuDishes/menudishes.jsx"
# Ожидание: команда без ошибки, рабочая копия = 2995 строк

# 3. Pre-check: найти amber-кнопку которую будем менять
grep -n 'bg-amber-600 hover:bg-amber-700' "pages/MenuDishes/menudishes.jsx"
# Ожидание: 1 hit на строке ~1822 (внутри rate-limit UI блока)
```

⚠️ Если RELEASE-файл не найден — STOP, сообщить Arman (деплой не завершён или файл переименован).

---

## Pre-flight (обязательные команды ДО правки)

```bash
# 1. Подтвердить размер файла
wc -l "pages/MenuDishes/menudishes.jsx"
# Ожидание: 2995 ±35 (диапазон 2960-3030)

# 2. Подтвердить совпадение RELEASE и рабочей копии
diff -q "pages/MenuDishes/menudishes.jsx" \
        "pages/MenuDishes/260306-01 MenuDishes RELEASE.jsx"
# Ожидание: пусто (файлы идентичны после Preparation)

# 3. Grep-якорь для Fix 1: rate-limit UI block
grep -n "rateLimitHit\|setRateLimitHit" "pages/MenuDishes/menudishes.jsx"
# Ожидание: ≥2 hits (state declaration + UI conditional)

grep -n 'bg-amber-600 hover:bg-amber-700' "pages/MenuDishes/menudishes.jsx"
# Ожидание: 1 hit, строка ~1822
```

---

## Fix 1 [BUG at line ~1822] — Заменить inline amber CSS на shadcn variant="secondary"

**Цель:** строка ~1822 — убрать `className="bg-amber-600 hover:bg-amber-700"`, добавить `variant="secondary"` для consistency с дизайн-системой.
**Затронутые строки:** ~1815-1825 (только Button в rate-limit block)

### Шаг 1.1 — Верификация и Edit

```bash
# Верификация ДО правки
grep -n 'bg-amber-600' "pages/MenuDishes/menudishes.jsx"
# Ожидание: 1 hit на строке ~1822
```

**Edit:** найти блок:
```jsx
            <Button 
              onClick={() => {
                setRateLimitHit(false);
                queryClient.invalidateQueries();
              }}
              className="bg-amber-600 hover:bg-amber-700"
```

Заменить на:
```jsx
            <Button 
              variant="secondary"
              onClick={() => {
                setRateLimitHit(false);
                queryClient.invalidateQueries();
              }}
```

> ⚠️ **НЕ делать:**
> - Не менять `onClick` handler — содержит бизнес-логику сброса rate-limit
> - Не добавлять другие props к Button
> - Не трогать окружающий JSX (paragraph выше, parent div)

### Верификация Fix 1

```bash
# Подтвердить что amber-класс удалён
grep -n 'bg-amber-600' "pages/MenuDishes/menudishes.jsx"
# Ожидание: 0 hits

# Подтвердить что variant="secondary" появился
grep -n 'variant="secondary"' "pages/MenuDishes/menudishes.jsx"
# Ожидание: ≥1 hit на строке ~1815

# Проверить размер файла (Fix 1 меняет className→variant, строки не добавляются)
wc -l "pages/MenuDishes/menudishes.jsx"
# Ожидание: 2995 ±2 (один Edit, net ±1 строки от className→variant)
```

### Acceptance Criteria Fix 1
- [ ] `bg-amber-600` не встречается в файле (`grep` = 0 hits)
- [ ] `variant="secondary"` добавлен к кнопке rate-limit (строка ~1815)
- [ ] `onClick` handler нетронут: `setRateLimitHit(false)` + `queryClient.invalidateQueries()` на месте
- [ ] Все другие Button на странице НЕ изменены (проверить через git diff)

---

## TestPlan

> Reviewer: выполни grep для S4/S6. Для S1/S2/S3/S5 — browser [POST-DEPLOY].

### S1 — Happy Path: кнопка «Попробовать снова» рендерится с secondary стилем [POST-DEPLOY]
При ошибке rate-limit (тест в dev: вызвать 429) — кнопка отображается в secondary варианте shadcn (серый/нейтральный), без amber фона.

### S2 — Edge Case: нажатие кнопки работает [POST-DEPLOY]
После нажатия: `rateLimitHit` сбрасывается в false, UI возвращается к нормальному виду, данные перезапрашиваются.

### S3 — Error State: при отсутствии queryClient кнопка не ломает страницу [POST-DEPLOY]
(edge case — queryClient всегда присутствует в компоненте; тест: убедиться что страница загружается без rate-limit ошибок)

### S4 — Regression: остальные Button на странице не затронуты
```bash
# Подсчёт Button с variant="outline" — должно совпасть с исходным
grep -c 'variant="outline"' "pages/MenuDishes/menudishes.jsx"
# Ожидание: то же число что до Fix (проверь через git diff --stat)

# Проверить что onClick на rate-limit кнопке нетронут
grep -n "setRateLimitHit(false)" "pages/MenuDishes/menudishes.jsx"
# Ожидание: 1 hit (в rate-limit UI block)
```

### S5 — UX Consistency: только 1 Button заменён [POST-DEPLOY]
Визуальный осмотр страницы: все другие кнопки выглядят как раньше. Rate-limit кнопка — secondary.

### S6 — FROZEN UX Check: queryClient.invalidateQueries не удалён
```bash
grep -n "queryClient.invalidateQueries" "pages/MenuDishes/menudishes.jsx"
# Ожидание: ≥1 hit (в rate-limit onClick + возможно в других местах — не удалён)
```

---

## MOBILE-FIRST CHECK (MANDATORY before commit)

This is a mobile-first restaurant app. Verify at **375px width** after deploy:
- [ ] Button «Попробовать снова» видна полностью, не обрезана
- [ ] Touch target кнопки ≥ 44×44px (shadcn secondary по умолчанию ✅)
- [ ] Нет overflow: текст внутри кнопки не выходит за края
- [ ] Rate-limit UI block скроллируется без потери кнопки на малых экранах

---

## Safety Guards

После применения Fix 1 — обязательные проверки перед commit:

```bash
# 1. Итоговый размер файла
wc -l "pages/MenuDishes/menudishes.jsx"
# Ожидание: 2995 ±2 (Fix 1 net delta ~0-1 строки: className → variant)

# 2. Проверка что только 1 файл изменён
git diff --stat -- pages/MenuDishes/menudishes.jsx
# Ожидание: только menudishes.jsx, НЕ другие файлы

# 3. Синтаксис JSX — export count
grep -c "^export " "pages/MenuDishes/menudishes.jsx"
# Ожидание: совпадает с исходным (1 default export)
```

**Commit message:**
```
fix(MenuDishes): replace amber inline CSS with shadcn secondary variant on rate-limit button

UI consistency: bg-amber-600 className → variant="secondary" (line ~1815, rate-limit screen)
```

---

## После применения Fix'ов — сообщить Cowork

Reviewer: по завершении:

```
## Findings Summary

### Fix 1 — ButtonSecondary Replace
Rating: X/5
Status: APPROVED / NEEDS REVISION / CRITICAL
Notes: ...

### Overall
- Lines changed: ~1 строка (net delta)
- Commit: [SHA если был]
- Blockers: [список или "Нет"]
```
