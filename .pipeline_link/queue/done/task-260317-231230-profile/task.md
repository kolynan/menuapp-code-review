---
page: Profile
code_file: pages/Profile/base/profile.jsx
budget: 5
agent: cc+codex
pipeline: v7
---

# Smoke Test S143: Auto-save BUGS_MASTER + TG Streaming

## Задача
Code review файла profile.jsx — найти баги, проблемы безопасности, UX-проблемы.

## Что проверить
1. Валидация данных профиля (email, phone, name) — есть ли проверки перед сохранением
2. Обработка ошибок при API-вызовах — показываются ли пользователю
3. useEffect cleanup — есть ли утечки памяти
4. i18n — есть ли сырые ключи или хардкод текста

## Ожидаемое поведение
- Все input fields валидируются перед submit
- Ошибки API показываются пользователю (toast/alert)
- useEffect с side effects имеют cleanup

## Контекст
Smoke test для двух новых фич pipeline:
1. **Auto-save BUGS_MASTER** (коммит 376631e) — findings P0-P2 должны автосохраниться в BUGS_MASTER.md
2. **TG findings streaming** (коммит c0df707) — findings должны появляться в TG по мере обнаружения

### Критерии PASS:
- [ ] Pipeline завершился без ошибок
- [ ] BUGS_MASTER.md содержит новые строки с ID типа `PR-S143-*`
- [ ] В TG были видны findings по мере обнаружения (секция "--- Findings ---")
