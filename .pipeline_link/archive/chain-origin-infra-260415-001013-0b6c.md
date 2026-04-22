---
page: INFRA
ws: WS-INFRA
budget: 10
agent: cc+codex
chain_template: discussion-cc-codex
session: 274
created: 2026-04-15
topic: Smoke-validation v5.4 chain expansion fix (retry after auth CLI fix)
---

# Smoke-test v2: ВЧР v5.4 chain expansion + auth CLI fix (S274)

**Цель:** после фикса порядка аргументов в `check_cc_auth` проверить что Д3 chain раскрывается в CC+Codex и доходит до synthesizer.

## Тривиальный вопрос для дискуссии

Какой из двух подходов лучше для логирования race conditions в Python ThreadPoolExecutor:

**Вариант A:** thread-local logger с дополнительным префиксом `[thread:<name>]` в каждом сообщении.
**Вариант B:** один глобальный logger с `%(threadName)s` в форматтере (стандартный logging).

Опишите коротко (3-5 предложений каждый): когда какой подход уместнее, какие подводные камни.

## Ожидаемая работа ВЧР v5.4

- В TG приходит стартовое сообщение chain.
- Лог: `Chain task detected: template=discussion-cc-codex, page=INFRA`.
- Лог: `CC auth check OK` (или просто отсутствие warning — значит auth прошёл).
- Chain раскрылся в 3 step-файла (CC writer + Codex writer параллельно → synthesizer).
- Время ~8-15 минут total.
- В pipeline/: `cc-findings-*.md`, `codex-findings-*.md`.
- В .debug: `Mode: task-watcher-multi.py v5.4 direct Popen`.

## Если провалится снова

Напишите точное сообщение лога + что вы видите в TG в finding-файле.
