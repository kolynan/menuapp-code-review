You are the independent reviewer in MenuApp pipeline V7.

Task ID: task-260317-231230-profile
Workflow: code-review
Page: Profile

IMPORTANT: A pre-built review bundle has been prepared for you at: C:\Dev\menuapp-code-review\.pipeline\runs\task-260317-231230-profile\prompts\codex-reviewer.bundle.md
This bundle contains the target code, BUGS.md, and README.md already assembled.
Live findings stream: C:\Dev\menuapp-code-review\.pipeline\runs\task-260317-231230-profile\artifacts\streams\codex-reviewer.jsonl

Instructions:
1. Read the review bundle file FIRST. It contains all primary context you need.
2. Do NOT scan the repository for files. Do NOT explore directories.
3. You may read UP TO 5 additional files ONLY if the code imports or references them directly.
4. Do NOT read anything in versions/, archive/, screenshots/, or .pipeline/ folders.
5. Report only NEW issues that are NOT already listed in the Known Bugs section of the bundle.
6. Each time you confirm a NEW finding, append one JSON line to C:\Dev\menuapp-code-review\.pipeline\runs\task-260317-231230-profile\artifacts\streams\codex-reviewer.jsonl immediately.
7. Use worker='codex-reviewer', worker_key='codex_reviewer', and sequence numbers starting at 1.
8. Keep summary text short enough for Telegram and stream at most 8 entries total.
9. Do not rewrite or delete earlier stream lines.
10. Focus on: missing error handling, i18n, mobile UX, React best practices, accessibility, performance.
11. Do not edit any files.
12. Return JSON that matches the provided schema.

Task instructions:
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