---
task: sticky-save-bar-s78
type: feature
budget: "$12"
priority: P1
page: PartnerSettings + PartnerLoyalty
---

# Задача: Sticky Save Bar — PartnerSettings + PartnerLoyalty

## Контекст

Страницы `/partnersettings` и `/partnerloyalty` — длинные формы.
Кнопка "Сохранить" не закреплена, пользователь не понимает: сохранилось или нет, есть ли несохранённые изменения.
Нужно добавить единый sticky save bar снизу с 5 состояниями.

---

## Спека: Sticky Save Bar

### Внешний вид
- Фиксированная панель снизу экрана, высота ~56–64px
- Слева: иконка + текст статуса
- Справа: кнопки действий

### Кнопки
- **Primary:** "Сохранить" (или "Повторить" в состоянии error)
- **Secondary:** "Отменить" — показывать только в состоянии `dirty`

---

## Состояния

### A) `idle` — нет изменений
- Текст: `common.stickySave.status.idle` ("Все изменения сохранены")
- Primary: disabled, текст `common.stickySave.action.save`
- Secondary: скрыта
- Бар: тонкий (можно уменьшить opacity или высоту), не отвлекает

### B) `dirty` — есть несохранённые изменения
- Текст: `common.stickySave.status.changed` ("Есть несохранённые изменения")
- Primary: enabled, текст `common.stickySave.action.save`
- Secondary: `common.stickySave.action.cancel` ("Отменить") — откатывает к `lastSavedSnapshot`
- При попытке уйти со страницы (route change): показать confirm modal (см. ниже)

### C) `saving` — идёт сохранение
- Текст: `common.stickySave.status.saving` ("Сохраняем…")
- Primary: disabled + spinner
- Secondary: скрыта

### D) `saved` — успешно сохранено
- Текст: `common.stickySave.status.saved` ("Сохранено") — держать 2 секунды, потом переключить в `idle`
- Primary: disabled
- Secondary: скрыта
- Toast success:
  - PartnerSettings: `partnersettings.toast.saved` ("Настройки сохранены")
  - PartnerLoyalty: `partnerloyalty.toast.saved` ("Лояльность сохранена")
  - Toast duration: 1.5–2 сек

### E) `error` — ошибка сохранения
- Текст: `common.stickySave.status.error` ("Не удалось сохранить")
- Primary: enabled, текст `common.stickySave.action.retry` ("Повторить")
- Secondary: `common.stickySave.action.cancel` ("Отменить")
- Toast error: `common.stickySave.toast.error_generic`

---

## Confirm modal (при уходе со страницы в состоянии `dirty`)

- Заголовок: `common.stickySave.leaveConfirm.title` ("Сохранить изменения?")
- Primary: `common.stickySave.leaveConfirm.saveAndExit` ("Сохранить и выйти")
- Destructive: `common.stickySave.leaveConfirm.exitWithoutSaving` ("Выйти без сохранения")
- Secondary: `common.stickySave.leaveConfirm.stay` ("Остаться")

---

## Логика dirty-tracking

```
lastSavedSnapshot = deepCopy(formValues) // при загрузке страницы и после успешного save
dirty = !deepEqual(formValues, lastSavedSnapshot)
```

Sticky bar state:
- `idle` если `!dirty && !saving && !error`
- `dirty` если `dirty && !saving`
- `saving` если запрос в процессе
- `saved` после успеха (2 сек, потом `idle`)
- `error` если запрос вернул ошибку

---

## Особенности PartnerLoyalty

Для полей: % скидки, % начисления бонусов, максимальный % списания — перед сохранением показывать confirm:
- Заголовок: `partnerloyalty.confirmChange.title` ("Изменить условия лояльности?")
- Текст: `partnerloyalty.confirmChange.body` ("Новые условия применятся к следующим заказам.")
- Кнопки: "Сохранить" / "Отмена"

---

## Validation (до сохранения)

Если поля не прошли валидацию — показать toast и НЕ отправлять запрос:
- `common.stickySave.toast.validation_generic`
- Для конкретных полей: подсветить поле + скролл к нему

---

## i18n ключи

Все ключи уже добавлены в translationadmin через CSV (S78).
Ключи `common.stickySave.*` — используются на обеих страницах.
Ключи `partnersettings.*` и `partnerloyalty.*` — страничные.

---

## Acceptance criteria

1. Sticky save bar виден на `/partnersettings` и `/partnerloyalty`
2. Состояния переключаются корректно: idle → dirty → saving → saved/error
3. "Отменить" откатывает форму к последнему сохранённому состоянию
4. При уходе со страницы с несохранёнными изменениями — confirm modal
5. Toast появляется после успеха/ошибки (правильный текст для каждой страницы)
6. На PartnerLoyalty — confirm перед сохранением финансовых параметров
7. Нет регрессий: существующая логика сохранения работает

---

## Файлы для изменения

- `pages/PartnerSettings/260301-00 partnersettings RELEASE.jsx`
- `pages/PartnerLoyalty/260301-00 partnerloyalty RELEASE.jsx`

## RELEASE

- `260305-00 partnersettings RELEASE.jsx`
- `260305-00 partnerloyalty RELEASE.jsx`
