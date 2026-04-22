# Post-Deploy Auto-Test: PartnerHome [SMOKE — только HP-1..HP-3]

**Skill:** post-deploy-test.md
**Page:** PartnerHome
**App URL:** https://menu-app-mvp-49a4f5b2.base44.app/partnerhome
**Screenshots dir:** pages/PartnerHome/screenshots/auto/
**Report output:** outputs/post-deploy-test-PartnerHome-20260417-0728.md

## Задача

Выполни Happy Path тестирование страницы PartnerHome через Claude-in-Chrome.

## Шаги

1. Прочитай `menuapp-code-review/pages/PartnerHome/TEST_PLAN.md` — извлеки HP-1..HP-3 сценарии.
2. Прочитай `menuapp-code-review/pages/PartnerHome/BUGS.md` — запомни существующие баги.
3. Подключись к Chrome (tabs_context_mcp).
4. Navigate → https://menu-app-mvp-49a4f5b2.base44.app/partnerhome
5. Скриншот начального состояния.
6. Для каждого HP-1..HP-3:
   - Выполни все шаги сценария через Claude-in-Chrome tools.
   - Сравни с ожидаемым результатом из TEST_PLAN.
   - Скриншот при FAIL.
   - Записать ✅/❌ для каждого шага.
7. Если найдены баги → добавить в `pages/PartnerHome/BUGS.md` (раздел Active).
8. Сохранить финальный отчёт в `outputs/post-deploy-test-PartnerHome-20260417-0728.md`.

## Acceptance Criteria (smoke)

- [ ] 3+ HP сценария протестированы
- [ ] Отчёт сохранён
- [ ] Скриншоты ≥2
- [ ] При наличии бага → запись в BUGS.md

Следуй инструкциям скилла: `skills/post-deploy-test.md`
