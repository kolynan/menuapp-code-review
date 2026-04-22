---
page: PublicMenu
code_file: pages/PublicMenu/base/CartView.jsx
budget: 10
agent: cc+codex
pipeline: v7
---

# Smoke Test V7: supervisor code_file frontmatter (KB-050)

Smoke test для V7 pipeline. Проверяем:
1. Supervisor читает `code_file:` из frontmatter и передаёт CC Writer правильный файл
2. CC Writer строит preflight bundle для CartView.jsx
3. Полный цикл V7: writer + reviewer + merge → commit

## Задача

Fix BUG-PM-029: Table-code auto-verify cannot retry same code after failure.

## Проблема
В CartView.jsx:174,184 — `lastSentVerifyCodeRef` никогда не очищается при ошибке или после cooldown unlock. Если API вернул транзиентную ошибку, гость вынужден менять цифры чтобы повторить попытку.

## Воспроизведение
1. Открыть публичное меню → перейти в корзину
2. Ввести код стола (4 цифры)
3. Если верификация упала с ошибкой сети → попробовать ввести тот же код
4. Код не отправляется повторно (ref хранит старое значение)

## Ожидаемое поведение
После ошибки верификации или после unlock cooldown `lastSentVerifyCodeRef` должен сбрасываться, позволяя повторную отправку того же кода.

## Фикс
Очистить `lastSentVerifyCodeRef` в трёх местах:
- При failed verification (catch block)
- При unlock (cooldown reset)
- Когда input становится неполным (меньше 4 цифр)
