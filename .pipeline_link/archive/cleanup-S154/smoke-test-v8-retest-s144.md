---
page: Profile
budget: 10
agent: cc+codex
type: consensus
---

# Smoke Test V8 Consensus — retest after KB-068/069 fix

## Цель smoke test
Проверить что V8 consensus pipeline работает после фиксов:
- KB-068: `(if` → `$(if` в PS5.1 (коммит 9f04ce2) — CC Writer крашился
- KB-069: Single-writer fallback в supervisor (коммит 9f04ce2) — Comparator крашился

## Ожидаемый результат
1. ОБА writer-а (CC + Codex) успешно завершаются с коммитами
2. Comparator получает оба коммита и создаёт consensus-compare.result.json
3. Discussion и Merge проходят штатно
4. Финальный RELEASE создан

## Задача для writer-ов: Fix PR-S104-01

### Проблема
`handleSave()` в Profile (`pages/Profile/base/profile.jsx`) не имеет unmount guard.
Если пользователь уходит со страницы во время сохранения, промис вызывает `setInitialFullName`, `setSaveStatus`, toast на уже размонтированном компоненте.

### Воспроизведение
1. Открыть /profile
2. Изменить имя
3. Нажать «Сохранить»
4. Быстро перейти на другую страницу до завершения сохранения

### Ожидаемое поведение
Добавить `useRef(true)` для `isMounted`, сбрасывать в `useEffect` cleanup.
В `handleSave` проверять `isMounted.current` перед каждым setState/toast.

### Контекст
- Приоритет: P2
- Найден: S104, Codex code-review
- Статус в BUGS_MASTER: 🔴 Open
