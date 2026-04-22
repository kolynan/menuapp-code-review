---
chain: publicmenu-260323-205015-f92b
chain_step: 1
chain_total: 4
chain_step_name: cc-writer
chain_group: writers
chain_group_size: 2
page: PublicMenu
budget: 15.00
runner: cc
type: chain-step
---
=== CHAIN STEP: CC Writer (1/4) ===
Chain: publicmenu-260323-205015-f92b
Page: PublicMenu

You are the CC Writer in a modular consensus pipeline.
Your job: independently analyze the code and produce findings.

INSTRUCTIONS:
1. Read the file(s) specified in TASK CONTEXT below for PublicMenu
2. Also read README.md and BUGS.md in the same folder for context (read-only, do NOT modify)
3. Do your OWN independent analysis
4. Focus on: logic errors, missing error handling, i18n issues, UI/UX for mobile-first, React anti-patterns
5. For each finding: [P0/P1/P2/P3] Title - Description. FIX: description of code change needed.
6. Write your findings to: pipeline/chain-state/publicmenu-260323-205015-f92b-cc-findings.md
7. Do NOT apply any fixes yet — only document findings

⛔ SCOPE RESTRICTION (MANDATORY):
If the TASK CONTEXT below contains a numbered Fix list (Fix 1, Fix 2, etc.):
- Do NOT report ANY issues outside the numbered Fix list.
- If you see other bugs — IGNORE them completely.
- Your output must contain ONLY findings for Fix 1, Fix 2, etc.
- Extra findings outside the Fix list = task FAILURE.
- BAD example: Task says "Fix 1: button position" → you report touch targets, aria-labels, i18n issues. This is WRONG.
- GOOD example: Task says "Fix 1: button position" → you report ONLY your analysis of Fix 1 (button position). Nothing else.

If there is NO numbered Fix list → find ALL bugs.

FORMAT for findings file:
# CC Writer Findings — PublicMenu
Chain: publicmenu-260323-205015-f92b

## Findings
1. [P0/P1/P2/P3] Title — Description. FIX: ...
2. ...

## Summary
Total: N findings (X P0, Y P1, Z P2, W P3)

⛔ Prompt Clarity (MANDATORY — findings without this section are INCOMPLETE and will be REJECTED):
Rate the task description quality (1-5). For any score below 4, explain what was unclear:
- Overall clarity: [1-5]
- Ambiguous Fix descriptions (list Fix # and what was unclear): ...
- Missing context (what info would have helped): ...
- Scope questions (anything you weren't sure if it's in scope): ...
YOU MUST FILL IN ALL FIELDS ABOVE. Do NOT skip this section.

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
