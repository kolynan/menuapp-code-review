---
task_id: fix-bugs-s89
status: pending
page: StaffOrdersMobile, PartnerClients
work_dir: C:/Users/ASUS/OneDrive/002 Menu/Claude AI Cowork/menuapp-code-review
budget_usd: 12
fallback_model: sonnet
system_rules: C:/Users/ASUS/OneDrive/002 Menu/Claude AI Cowork/references/cc-system-rules.txt
version: "4.0"
---

# Task: fix-bugs-s89

## Config (v4.0)
- Budget: $12
- Fallback model: sonnet
- System rules: cc-system-rules.txt
- Progress: per-task TG message via progress-monitor.sh

## Prompt
IMPORTANT: Your VERY FIRST action must be: echo "started $(date -Iseconds)" > "C:/Users/ASUS/OneDrive/002 Menu/Claude AI Cowork/pipeline/started-fix-bugs-s89.md" — this confirms to Cowork that you started working.

=== TASK SETUP ===
Progress file: C:/Users/ASUS/OneDrive/002 Menu/Claude AI Cowork/pipeline/progress-fix-bugs-s89.txt
Task ID: fix-bugs-s89
=== END TASK SETUP ===

---
task: fix-bugs-s89
type: bugfix
budget: "$12"
priority: P1+P2
codex: yes
---

# Задача: Фиксы S89 — StaffOrdersMobile (P1) + PartnerClients (P2)

Починить 2 бага найденных в Deep Test S89.

## Баги для починки

### BUG-1: SO-S89-01 — `orderprocess.default.new` сырой i18n ключ (P1) — РЕГРЕССИЯ

- **Файл:** `pages/StaffOrdersMobile/base/staffordersmobile.jsx`
- **Симптом:** В списке заказов (/staffordersmobile) бейдж статуса у заказов со статусом "Новый" показывает сырой ключ `orderprocess.default.new` вместо переведённого текста (например "Новый").
- **История:** Этот баг уже был починен как SO-S76-01 в RELEASE 260305-00. Потом регрессировал в S88 когда был создан RELEASE 260306-01 (3042 строки) на основе другой базы. Arman восстановил 260305-00 как 260306-02 (3978 строк) и задеплоил, но баг ВСЁ ЕЩЁ присутствует — значит 260305-00 не содержал нужного фикса.
- **Задача для CC+Codex:**
  1. Открыть `pages/StaffOrdersMobile/base/staffordersmobile.jsx`
  2. Найти место где рендерится статус заказа (бейдж/badge с текстом статуса)
  3. Найти как получается название статуса — скорее всего через `t('orderprocess.default.new')` или через lookup по stage/status ID
  4. Проверить: если код читает название стейджа из данных `partnerorderprocess` (например поле `name` из stages) — это правильный подход, переведённое имя уже в данных. Если код вызывает `t(key)` с дефолтными ключами — нужно заменить на чтение имени стейджа из данных.
  5. Правильный фикс: статус заказа должен брать `name` из соответствующего этапа в `partnerorderprocess.stages`, а НЕ использовать i18n ключ `orderprocess.default.new`.
  6. Если в данных этапа уже есть поле `name` (например "Новый") — использовать его напрямую.
- **RELEASE:** `260306-03 StaffOrdersMobile RELEASE.jsx` в `pages/StaffOrdersMobile/`

### BUG-2: PC-S89-01 — «1 Баллы» неправильное склонение в PartnerClients (P2)

- **Файл:** `pages/PartnerClients/base/partnerclients.jsx`
- **Симптом:** В детальном модале клиента в секции "Баллы" показывает "1 Баллы" вместо "1 Балл". Неправильное склонение числительного.
- **Контекст:** Аналогичный баг PL-S83-02 был починен в `pages/PartnerLoyalty/base/partnerloyalty.jsx` через pluralization функцию. Нужно применить тот же подход к partnerclients.jsx.
- **Правила склонения:**
  - 1 → "Балл"
  - 2, 3, 4 → "Балла"
  - 5, 6, 7, 8, 9, 0 → "Баллов"
  - 11, 12, 13, 14 → "Баллов" (исключения)
- **Фикс:**
  1. Открыть `pages/PartnerLoyalty/base/partnerloyalty.jsx` — найти pluralization функцию для баллов (она там уже есть после PL-S83-02 фикса)
  2. Скопировать ту же функцию в partnerclients.jsx
  3. Найти в partnerclients.jsx все места где выводится слово "Баллы" / "Баллов" / "Балл" в секции детали клиента
  4. Применить функцию плюрализации ко всем таким местам
- **RELEASE:** `260306-02 PartnerClients RELEASE.jsx` в `pages/PartnerClients/`

## Git & RELEASE
- git add / commit / push после КАЖДОГО фикса (по одному commit на баг)
- Новые RELEASE файлы в соответствующих папках страниц
- Обновить BUGS.md и README.md для каждой затронутой страницы
- Номера RELEASE: StaffOrdersMobile — 260306-03, PartnerClients — 260306-02

## Приоритет выполнения
1. BUG-1 (SO-S89-01 — P1, критичнее)
2. BUG-2 (PC-S89-01 — P2, аналог уже решённого бага)
