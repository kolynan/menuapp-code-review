---
task_id: fix-pm-s87-03
status: pending
page: PublicMenu
work_dir: C:/Dev/menuapp-code-review
budget_usd: 10
fallback_model: sonnet
system_rules: C:/Users/ASUS/OneDrive/002 Menu/Claude AI Cowork/references/cc-system-rules.txt
version: "5.2"
---

# Task: fix-pm-s87-03

## Config (v5.2)
- Budget: $10
- Fallback model: sonnet
- System rules: cc-system-rules.txt
- Progress: per-task TG message via progress-monitor.sh

## Prompt
IMPORTANT: Your VERY FIRST action must be: echo "started $(date -Iseconds)" > "C:/Users/ASUS/OneDrive/002 Menu/Claude AI Cowork/pipeline/started-fix-pm-s87-03.md" — this confirms to Cowork that you started working.

=== TASK SETUP ===
Progress file: C:/Users/ASUS/OneDrive/002 Menu/Claude AI Cowork/pipeline/progress-fix-pm-s87-03.txt
Task ID: fix-pm-s87-03
=== END TASK SETUP ===

---
task: fix-pm-s87-03
type: bugfix
budget: "$10"
priority: P2
codex: yes
---

# Задача: PM-S87-03 — Кнопка «Отправить официанту» выглядит активной когда disabled (P2)

## Контекст

Публичное меню (`/x`) — это QR-меню для клиентов ресторана. В drawer (выдвижная панель снизу) есть кнопка «Отправить официанту». Когда код стола НЕ введён, кнопка должна быть disabled — но визуально она всё равно выглядит зелёной/активной, что вводит пользователя в заблуждение.

## Баг: PM-S87-03

- **Файл:** `pages/PublicMenu/base/x.jsx`
- **Симптом:** Кнопка «Отправить официанту» (CTA в drawer) выглядит зелёной/активной даже когда `disabled={true}` (код стола не введён). Пользователь думает что можно нажать, но нажатие ничего не делает.
- **Ожидаемое поведение:** Когда disabled — кнопка серая/блёклая, визуально неактивная. Подсказка «Введите код стола».

## Что нужно сделать

1. **Найти кнопку «Отправить официанту»** в drawer JSX — это основной CTA (Call-to-Action)
2. **Проверить атрибут `disabled`** — он уже есть? Правильно ли вычисляется?
3. **Добавить визуальное различие для disabled-состояния:**
   - disabled: `bg-gray-300 text-gray-500 cursor-not-allowed` (серая, блёклая)
   - enabled: текущие стили (зелёная, яркая)
4. **Не ломать другие кнопки и стили** — менять ТОЛЬКО этот конкретный CTA

## Пример кода
```jsx
<button
  disabled={!tableCode}
  className={`w-full py-3 rounded-lg font-medium ${
    !tableCode
      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
      : 'bg-green-600 text-white hover:bg-green-700'
  }`}
>
  {t('cart.send_to_waiter') || 'Отправить официанту'}
</button>
```

## Git & RELEASE
- git add / commit / push после фикса
- Обновить BUGS.md и README.md для PublicMenu
- Архивировать предыдущий RELEASE в versions/
- Номер нового RELEASE: `260307-01 x RELEASE.jsx`
