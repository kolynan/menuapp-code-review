---
task_id: task-260323-205955-publicmenu
status: running
started: 2026-03-23T20:59:56+05:00
type: chain-step
page: PublicMenu
work_dir: C:/Dev/menuapp-code-review
budget_usd: 7.50
fallback_model: sonnet
version: 5.12
launcher: python-popen
---

# Task: task-260323-205955-publicmenu

## Config
- Budget: $7.50
- Mode: task-watcher.py launches Claude Code directly via Popen
- Fallback model: sonnet

## Prompt
---
chain: publicmenu-260323-205015-f92b
chain_step: 2
chain_total: 4
chain_step_name: comparator
page: PublicMenu
budget: 7.50
runner: cc
type: chain-step
---
=== CHAIN STEP: Comparator (2/4) ===
Chain: publicmenu-260323-205015-f92b
Page: PublicMenu

You are the Comparator in a modular consensus pipeline.
Your job: compare CC Writer and Codex Writer findings and produce a merge plan.

INSTRUCTIONS:
1. Read CC findings: pipeline/chain-state/publicmenu-260323-205015-f92b-cc-findings.md
   - If NOT found there, try: `git pull --rebase` then check again
   - If still not found, search for any *-cc-findings.md in pipeline/chain-state/
2. Read Codex findings: pipeline/chain-state/publicmenu-260323-205015-f92b-codex-findings.md
   - If NOT found there, search in pages/PublicMenu/review_*.md (Codex sometimes writes here)
   - If still not found, search for any *-codex-findings.md in pipeline/chain-state/
3. Compare both analyses and categorize:

Write comparison to: pipeline/chain-state/publicmenu-260323-205015-f92b-comparison.md

FORMAT:
# Comparison Report — PublicMenu
Chain: publicmenu-260323-205015-f92b

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
# UX Batch 7: Card Layout Redesign — List & Tile Mode (PM-108 + PM-110 + PM-111)

**Production page.** File: `pages/PublicMenu/MenuView.jsx`.

Reference: `ux-concepts/UX_LOCKED_PublicMenu.md`, `BUGS_MASTER.md`, UX pattern: Glovo/Wolt card design.

TARGET FILES (modify): `pages/PublicMenu/MenuView.jsx`
CONTEXT FILES (read-only): `pages/PublicMenu/README.md`, `pages/PublicMenu/BUGS.md`

---

## Fix 1 — PM-108 + PM-110 (P2) [MUST-FIX]: List-mode card redesign — фото вправо, «+» overlay на фото

### Сейчас (текущее поведение)
В list-mode карточка блюда: фото слева, контент справа, кнопка «+» прикреплена к правому краю КАРТОЧКИ (не фото). Кнопка «+» обрезана — видна только половина круга (не помещается в layout).

### Должно быть (ожидаемое поведение)
Redesign list-mode карточки по паттерну Glovo/Wolt:
1. **Фото — справа** карточки (не слева). Примерная ширина фото: 80–100px, высота = высота карточки.
2. **Кнопка «+» — position: absolute, bottom-right of the dish image** (правый нижний угол фото, поверх фото). НЕ правый нижний угол карточки — именно фото.
3. Кнопка «+» — круглая, полностью видима, без обрезания.
4. Название, описание, цена — слева от фото (занимают оставшееся место).

### НЕ должно быть
- Кнопка «+» НЕ должна быть прикреплена к карточке (card container) — только к image.
- НЕ увеличивать высоту карточки как компенсацию (предыдущая неверная попытка в Батч 6).
- Фото НЕ оставлять слева.
- Кнопка «+» НЕ должна быть обрезана ни при каком viewport.

### Файл и локация
Файл: `pages/PublicMenu/MenuView.jsx`
Функция: `renderListCard` (поиск: `renderListCard` или `list-mode` комментарий).
Обёртка фото: найти `<img` внутри `renderListCard` — добавить `position: relative` на контейнер фото, `position: absolute; bottom: 8px; right: 8px` на кнопку «+».

### Уже пробовали
Батч 6 (chain publicmenu-260323-*): КС увеличил высоту карточки вместо redesign layout. Fix был неверным — «+» по-прежнему привязан к карточке. Нужен именно layout redesign: фото вправо + overlay кнопка.

### Проверка
Открыть /x в list-mode → карточка блюда: фото справа, «+» кнопка в правом нижнем углу фото (поверх фото), полностью видима, кружок не обрезан. Нажать «+» — блюдо добавляется в корзину ✅.

---

## Fix 2 — PM-111 (P2) [MUST-FIX]: Tile-mode — «+» overlay в правый нижний угол фото

### Сейчас (текущее поведение)
В tile-mode кнопка «+» прикреплена к правому нижнему углу КАРТОЧКИ (card container), а не фото. Выглядит оторванной от изображения.

### Должно быть (ожидаемое поведение)
Кнопка «+» — **position: absolute, bottom-right of the dish image** (правый нижний угол фото, поверх фото).
- Контейнер фото в tile: `position: relative`
- Кнопка «+»: `position: absolute; bottom: 8px; right: 8px` внутри контейнера фото
- Кнопка полностью поверх фото (z-index достаточный)
- Остальной layout tile-карточки не меняется

### НЕ должно быть
- «+» НЕ прикреплять к card container — только к image container.
- НЕ трогать размеры карточки, шрифты, цвета, другие элементы tile.

### Файл и локация
Файл: `pages/PublicMenu/MenuView.jsx`
Функция: `renderTileCard` (поиск: `renderTileCard`).
Паттерн: найти `<img` внутри `renderTileCard` → добавить `position: relative` на обёртку → перенести «+» кнопку внутрь обёртки фото с `position: absolute; bottom: 8px; right: 8px`.

### Уже пробовали
Не пробовали (PM-111 новый, S167). PM-106 (whitespace-nowrap цены) починен в КС-5 S166 — не трогать.

### Проверка
Открыть /x → переключиться в tile-mode → карточка блюда: кнопка «+» в правом нижнем углу фото (поверх фото), не карточки. Нажать «+» — блюдо добавляется ✅.

---

## ⛔ SCOPE LOCK — менять ТОЛЬКО то, что указано выше

- Изменяй ТОЛЬКО `renderListCard` и `renderTileCard` в `MenuView.jsx`.
- ВСЁ остальное (CartView, x.jsx, другие компоненты, routing, discount logic, polling) — НЕ ТРОГАТЬ.
- Locked UX decisions — см. `ux-concepts/UX_LOCKED_PublicMenu.md` — ЗАПРЕЩЕНО менять.
- Если видишь «проблему» не из этой задачи — ПРОПУСТИ, не чини.
- PM-106 (whitespace-nowrap цены в tile) — уже починен, НЕ трогать.
- PM-109 (discount guard) — уже починен в MenuView.jsx, НЕ трогать.

---

## Implementation Notes

- **TARGET FILE (modify):** `pages/PublicMenu/MenuView.jsx`
- **CONTEXT (read-only):** `pages/PublicMenu/README.md`, `pages/PublicMenu/BUGS.md`
- Ключевые функции: `renderListCard`, `renderTileCard`
- UX pattern: Glovo/Wolt — image right in list, «+» button as `position: absolute` overlay on image bottom-right
- НЕ ломать: PM-109 (discount guard), PM-106 (tile price nowrap), PM-107 (BS programmatic close)
- **ОБЯЗАТЕЛЬНО:** `git add pages/PublicMenu/MenuView.jsx && git commit -m "PM-108+110+111: card layout redesign, + overlay on image" && git push`
=== END ===


## Status
Running...
