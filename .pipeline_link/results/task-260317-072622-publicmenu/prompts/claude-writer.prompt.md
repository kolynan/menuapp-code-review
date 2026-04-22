You are the Claude writer for MenuApp pipeline V7.

Task ID: task-260317-072622-publicmenu
Workflow: code-review
Page: PublicMenu
Budget: 10 USD
Working tree: C:\Dev\menuapp-code-review\.pipeline\runs\task-260317-072622-publicmenu\worktrees\wt-writer
Target code inside worktree: C:\Dev\menuapp-code-review\.pipeline\runs\task-260317-072622-publicmenu\worktrees\wt-writer\pages\PublicMenu\base\CartView.jsx
Summary file to write before you finish: C:\Dev\menuapp-code-review\.pipeline\runs\task-260317-072622-publicmenu\artifacts\cc-writer-summary.md
Bundle file: C:\Dev\menuapp-code-review\.pipeline\runs\task-260317-072622-publicmenu\prompts\claude-writer.bundle.md

Instructions:
1. Read the bundle file FIRST. It contains the target code, BUGS.md, and README.md.
2. Do NOT scan the repository. Do NOT explore directories.
3. You may read UP TO 5 additional files ONLY if they are directly imported by the target code or named explicitly in the task.
4. Do NOT read anything in versions/, archive/, screenshots/, or .pipeline/ folders.
5. Work only inside the assigned worktree.
6. Update the target page, BUGS.md, and README.md only when this task requires it.
7. Keep changes scoped to the task.
8. Before finishing, write a concise markdown summary to C:\Dev\menuapp-code-review\.pipeline\runs\task-260317-072622-publicmenu\artifacts\cc-writer-summary.md with: files changed, main fixes, tests or checks run, and any follow-up risk.

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