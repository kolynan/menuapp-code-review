---
version: "1.1"
approved: "2026-03-21"
session: 155
status: approved
---

# TG Message Format — Утверждённый формат (S155B)

Этот документ описывает эталонный формат Telegram-уведомлений от КС (task-watcher-v3.py).
При изменении формата — обновлять этот файл.

---

## DONE — Цепочка завершена

```
[consensus-with-versioning] PublicMenu
✅ DONE | 09:37 → 10:03 (26m)
--- Steps ---
cc-writer (CC): OK, 26 findings, $1.74, 4m
codex-writer (Codex): OK, 8 findings, 58k tok, 11m
comparator (CC): OK, 7 agreed / 2 disputes, $0.46, 2m
discussion (CC): OK, 2 resolved / 0 unresolved, $0.27, 1m
merge-with-tag (CC): OK, 6 applied / 1 skipped, $3.60, 9m
--- Result ---
Total: $6.07 | 5/5 steps
```

## RUNNING — Цепочка в процессе

```
[consensus-with-versioning] PublicMenu
⏳ RUNNING | 11:07
--- Steps ---
cc-writer (CC): OK, 12 findings, $1.50, 5m
codex-writer (Codex): OK, 6 findings, 42k tok, 15m
comparator (CC): running...
discussion: waiting
merge-with-tag: waiting
```

## FAILED — Шаг упал

```
[consensus-with-versioning] PublicMenu
❌ FAILED at comparator | 11:07 → 11:25 (18m)
--- Steps ---
cc-writer (CC): OK, 12 findings, $1.50, 5m
codex-writer (Codex): OK, 6 findings, 42k tok, 15m
comparator (CC): FAIL — timeout, $0.50, 10m
discussion: cancelled
merge-with-tag: cancelled
--- Result ---
Total: $2.10 | 2/5 steps
```

---

## Метрики по шагам

Каждый шаг показывает **свои** ключевые метрики. Не пропускать.

| Шаг | Формат метрик | Пример |
|-----|---------------|--------|
| cc-writer | `{N} findings, ${cost}, {dur}` | `26 findings, $1.74, 4m` |
| codex-writer | `{N} findings, {N}k tok, {dur}` | `8 findings, 58k tok, 11m` |
| comparator | `{N} agreed / {N} disputes, ${cost}, {dur}` | `7 agreed / 2 disputes, $0.46, 2m` |
| discussion | `{N} resolved / {N} unresolved, ${cost}, {dur}` | `2 resolved / 0 unresolved, $0.27, 1m` |
| discussion (skip) | `no disputes, skipped, ${cost}, {dur}` | `no disputes, skipped, $0.27, 1m` |
| merge / merge-with-tag | `{N} applied / {N} skipped, ${cost}, {dur}` | `6 applied / 1 skipped, $3.60, 9m` |

### Правила

- **CC шаги:** стоимость в `$X.XX`, длительность в `Xm` или `Xs`
- **Codex шаги:** токены в `{N}k tok` (НЕ доллары), длительность в `Xm`
- **Findings:** парсить из файла `*-findings.md` (считать заголовки `##` или numbered items)
- **Comparator metrics:** парсить из `*-comparison.md` (секции AGREED / DISPUTES)
- **Discussion metrics:** парсить из `*-discussion.md` (RESOLVED / UNRESOLVED)
- **Merge metrics:** парсить из `*-merge-report.md` (Applied Fixes / Skipped)
- **Если метрик нет** — показать `(no metrics)` вместо пустоты

### Исправлено в v5.2–5.3 (S155B)

1. ~~**Codex `0k tok`**~~ — FIXED v5.2: парсер теперь извлекает цифры через `re.findall(r'\d+')`, не зависит от типа пробела-разделителя (#65)
2. ~~**`>` вместо `→`**~~ — FIXED v5.2: DONE/FAILED заголовок теперь `→`
3. ~~**`N files` в строках шагов**~~ — FIXED v5.2: убрано из формата (не было в эталоне)
4. ~~**FAIL без причины**~~ — FIXED v5.3: `FAIL — auth error`, `FAIL — timeout`, `FAIL — rate limit` и др.

### Известные баги (на 2026-03-21)

1. **CC-writer `$0.00/0s`** — race condition в task_id при параллельных writers (#68, KB-076)
2. **Метрики не всегда показываются** — comparator/discussion/merge иногда без цифр
