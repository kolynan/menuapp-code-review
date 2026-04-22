---
page: Profile
code_file: pages/Profile/base/profile.jsx
budget: 10
agent: cc+codex
pipeline: v8
type: consensus
---

# Smoke Test S144 v6: V8 Consensus — After List.ToArray() fix (f594333)

## Задача
Пофиксить баг PR-S104-01: `handleSave()` без unmount guard.

## Что исправить
1. Добавить unmount guard (useRef isMounted pattern или AbortController)
2. Все setState вызовы в handleSave() должны проверять что компонент ещё смонтирован

## Контекст
6-й smoke test. Fix f594333: @(List[object]) → .ToArray() для ConvertTo-Json PS5.1 compat (KB-072).

### Критерии PASS:
- [ ] Pipeline DONE (не FAILED)
- [ ] Comparator НЕ крашнулся
- [ ] Результат — consensus, single-writer fallback, или DISPUTE
