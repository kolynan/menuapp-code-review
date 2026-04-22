---
type: discussion
topic: "Контакты партнёра — отдельная страница или вкладка в Settings?"
budget: 5
---

# Discussion: Контакты партнёра — архитектура

## Вопрос
Сейчас в MenuApp есть отдельная страница /partnercontacts для контактной информации партнёра (ресторана). Но есть также страница /partnersettings с настройками. Нужно решить: контакты должны остаться отдельной страницей или их лучше слить в Settings как вкладку?

## Контекст
- MenuApp — QR-меню для ресторанов. Целевой пользователь: владелец ресторана, не технарь.
- Сейчас: /partnercontacts — отдельная страница (адрес, телефон, email, соцсети, часы работы)
- /partnersettings — настройки (название ресторана, язык, валюта, часы работы toggle)
- Часы работы дублируются в обоих местах — это проблема
- Навигация: hamburger меню, ~8 пунктов. Каждая страница = отдельный пункт
- Вопрос обсуждается с S54 (2026-03-01), решение откладывалось

## Варианты
1. Оставить /partnercontacts отдельно — меньше изменений, но дублирование часов работы
2. Слить контакты в Settings как вкладку "Контакты" — один источник правды, но Settings становится большим
3. Слить Settings в Contacts — наоборот (маловероятно, но для полноты)

## INSTRUCTIONS FOR CC

You are moderating a discussion between yourself (Claude/CC) and Codex (GPT) about the topic above.

Follow the discussion-moderator workflow:

1. Read relevant references/ config docs for project context (especially PRD and Architecture)
2. Form YOUR OWN position first (write it down before calling Codex)
3. Call Codex via powershell.exe (NOT bash — KB-013):
   ```
   powershell.exe -Command "codex exec -C 'C:/Dev/menuapp-code-review' --full-auto '[prompt]'"
   ```
4. Compare perspectives, challenge Codex on disagreements (max 3 rounds)
5. Write synthesis to discussion-result file in pipeline/ directory

Format of synthesis:
- Summary (2-3 sentences, no jargon)
- Agreed points
- Disagreements (with both arguments)
- ✅ Recommendation for Arman (numbered options)
- Next steps

IMPORTANT:
- Write for Arman (non-technical). No jargon.
- Be honest about disagreements. Don't force consensus.
- Max 3 Codex rounds (budget-conscious).
- Think about: what would a busy restaurant owner prefer? Less screens or more organization?
- Consider: mobile-first (90% of usage is on phone)

Update progress file after each round:
  echo "[CC] $(date +%H:%M) Round N complete" >> "[PROGRESS_FILE path from run-vsc-task.sh]"
