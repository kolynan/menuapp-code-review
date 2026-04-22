---
chain_template: pssk-review
code_file: menuapp-code-review/pages/StaffOrdersMobile/staffordersmobile.jsx
budget: 10
model: claude-sonnet-4-5
ws: WS-SOM
---

# ПССК ревью: SOM Б2.1 — Fix BUG-SM-015 (v3)

**Файл ПССК для ревью:** `pipeline/drafts/pssk-som-b2-1-260416-v3.md`

Прочитай файл ПССК по пути выше и выполни полный prompt-checker ревью (секции A-H):
- Структура (A), Скоуп и файлы (B), Содержание Fix'ов (C), Валидация бага (D), Mobile-first (E), Git (F), КС-специфичные правила (G), Codex-специфичные правила (H).

**Целевой файл:** `menuapp-code-review/pages/StaffOrdersMobile/staffordersmobile.jsx` (4617 lines, RELEASE `260415-01`)
**Контекст файл:** `menuapp-code-review/components/sessionHelpers.js` (232 lines)
**Задача ПССК:** Фикс BUG-SM-015 — новые заказы на закрытый стол появляются в «Завершённых» вместо «Активных».
**Фиксов:** 3 (Fix A: staleTime 30s→5s; Fix B: compositeKey orderGroups + 7 координированных правок; Fix C: invalidate orphan orders useEffect)
**v3 vs v2:** исправлены 3 CRITICAL (working copy sync, data-group-id count 2→3, B.5 pin 3 hits) + 3 MEDIUM (B.6 defensive unconditional, Fix C orders var pre-check, wc -l ±35 unified).

Для каждого пункта чеклиста: ✅ PASS / ❌ FAIL + оценка 1-5 по разделам C/D/G/H.
