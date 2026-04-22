---
type: discussion
page: none
budget: $5
priority: P1
session: S110
created: 2026-03-11
description: UX discussion — working hours display for restaurant guests on /x (PublicMenu)
agent: discussion-moderator
---

# UX Discussion: Working Hours Display for Guests

## Контекст
ST-02 (Sticky Task): Часы работы Этап B — расписание для гостей на /x (PublicMenu).

В PartnerSettings партнёр уже может настроить часы работы ресторана. Но гости на странице /x (публичное меню) НЕ видят часы работы. Если гость зашёл в нерабочее время — он видит обычное меню без предупреждения.

## Вопросы для дискуссии

1. **Где показывать часы работы гостю?** Варианты: баннер вверху, отдельная секция, в header рядом с названием ресторана, в модальном окне при входе.

2. **Что делать если ресторан ЗАКРЫТ?** Показывать меню но с предупреждением? Блокировать заказ? Показывать только меню для просмотра без кнопки "заказать"?

3. **Формат отображения часов.** Полное расписание по дням или только "сегодня открыто до 22:00"? Или оба?

4. **Таймзоны и edge cases.** Что если гость в другой таймзоне? Что если ресторан закрывается через 15 минут — предупреждать?

## Reference files
- Read `references/PRD.md` for product context
- Read `references/Architecture.md` for technical constraints
- Check `pages/PublicMenu/base/` for current x.jsx implementation context

## Output
Write result to: `pipeline/results/ux-discussion-hours-s110-result.md`
ОБЯЗАТЕЛЬНО: git add pipeline/results/ux-discussion-hours-s110-result.md && git commit -m "UX discussion: working hours for guests" && git push
