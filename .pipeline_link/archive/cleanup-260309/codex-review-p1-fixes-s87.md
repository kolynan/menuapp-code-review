---
task_id: codex-review-p1-fixes-s87
status: pending
page: PublicMenu, MenuDishes, Profile
work_dir: C:/Users/ASUS/OneDrive/002 Menu/Claude AI Cowork/menuapp-code-review
budget_usd: 10
fallback_model: sonnet
version: "4.0"
---

# Task: codex-review-p1-fixes-s87

## Config (v4.0)
- Budget: $5
- Purpose: Codex-only review of CC fixes from fix-p1-bugs-s87
- Progress: per-task TG message via progress-monitor.sh

## Prompt
IMPORTANT: Your VERY FIRST action must be: echo "started $(date -Iseconds)" > "C:/Users/ASUS/OneDrive/002 Menu/Claude AI Cowork/pipeline/started-codex-review-p1-fixes-s87.md" — this confirms to Cowork that you started working.

=== TASK SETUP ===
Progress file: C:/Users/ASUS/OneDrive/002 Menu/Claude AI Cowork/pipeline/progress-codex-review-p1-fixes-s87.txt
Task ID: codex-review-p1-fixes-s87
=== END TASK SETUP ===

---

# Задача: Codex-ревью фиксов P1 от CC (S87)

CC уже починил 4 бага на 3 страницах (commit f9acc91). Codex не смог участвовать в оригинальной задаче (CLI вернул empty).

**Твоя задача:** проверить git diff последнего коммита и подтвердить (или опровергнуть) правильность фиксов CC.

## Шаг 1: Получи diff

```bash
cd "C:/Users/ASUS/OneDrive/002 Menu/Claude AI Cowork/menuapp-code-review"
git show f9acc91 --stat
git show f9acc91
```

Если f9acc91 — не последний коммит, используй:
```bash
git log --oneline -5
git show HEAD --stat
```

## Шаг 2: Запусти Codex-ревью

Отправь diff в Codex:

```bash
DIFF=$(git show f9acc91 2>/dev/null || git show HEAD)
codex exec "Review this git diff and confirm whether the bug fixes are correct. Check for: 1) correctness of the fix, 2) edge cases missed, 3) any regressions introduced. Report for each file changed.

$DIFF" 2>/dev/null
```

Запиши результат Codex в progress file:
```
[OK] HH:MM Cdx: [краткий вывод — согласен/не согласен + замечания]
```

## Шаг 3: Сравни с фиксами CC

Что проверял CC:
- **BUG-1+2 (PublicMenu x.jsx):** case-insensitive ARCHIVED strip + tr() для CART.MY_BILL
- **BUG-3 (MenuDishes menudishes.jsx):** getCleanDescription() для legacy данных
- **BUG-4 (Profile profile.jsx):** tr() fallback для profile.full_name

Если Codex нашёл проблемы — опиши в progress file и предложи дополнительные фиксы.
Если Codex согласен — отметь `[OK] Cdx confirmed all fixes`.

## Git
Если нужны дополнительные фиксы — commit/push с пометкой "(Codex review fix)".
Если всё ок — commit НЕ нужен.

## Финальный отчёт
Добавить в progress file итог:
```
[OK] HH:MM Review complete: [X/4 fixes confirmed] [замечания если есть]
```
