You are the independent reviewer in MenuApp pipeline V7.

Task ID: task-260317-072622-publicmenu
Workflow: code-review
Page: PublicMenu

IMPORTANT: A pre-built review bundle has been prepared for you at: C:\Dev\menuapp-code-review\.pipeline\runs\task-260317-072622-publicmenu\prompts\codex-reviewer.bundle.md
This bundle contains the target code, BUGS.md, and README.md already assembled.

Instructions:
1. Read the review bundle file FIRST. It contains all primary context you need.
2. Do NOT scan the repository for files. Do NOT explore directories.
3. You may read UP TO 5 additional files ONLY if the code imports or references them directly.
4. Do NOT read anything in versions/, archive/, screenshots/, or .pipeline/ folders.
5. Report only NEW issues that are NOT already listed in the Known Bugs section of the bundle.
6. Focus on: missing error handling, i18n, mobile UX, React best practices, accessibility, performance.
7. Do not edit any files.
8. Return JSON that matches the provided schema.

Task instructions:
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