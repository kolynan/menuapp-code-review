---
page: PublicMenu
code_file: pages/PublicMenu/base/CartView.jsx
budget: 10
agent: cc+codex
---

# Smoke Test: CC Writer bundle + code_file frontmatter (KB-050)

Это smoke test для проверки KB-050 fix (commit 262bd5d). Цель — подтвердить что:
1. Supervisor правильно читает `code_file:` из frontmatter
2. CC Writer строит preflight bundle и находит целевой файл
3. Pipeline отрабатывает до конца без ошибок

## Задача

Fix BUG-PM-026: `tableCodeLength` default regressed to 5.

## Проблема
В CartView.jsx:101 дефолтная длина кода стола = 5 цифр, хотя ранее была исправлена на 4 (BUG-PM-S81-02). Если у партнёра не настроена длина кода, гости вводят 5 цифр вместо 4.

## Воспроизведение
1. Открыть публичное меню ресторана, у которого не настроен tableCodeLength
2. Перейти в корзину → ввести код стола
3. Поле ожидает 5 цифр вместо 4

## Ожидаемое поведение
Default = 4 цифры (как было после BUG-PM-S81-02).

## Фикс
В CartView.jsx найти fallback `return 5` для tableCodeLength и заменить на `return 4`.

## ОБЯЗАТЕЛЬНО после фиксов:
```bash
git add pages/PublicMenu/base/CartView.jsx
git commit -m "fix(PublicMenu): BUG-PM-026 tableCodeLength default 5→4 (regression)"
git push
```
