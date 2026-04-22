# TEST_PLAN: Lab

**URL:** `/lab`  
**Роль:** Партнёр (разработчик/внутренний)  
**Авторизация:** Не проверяется на странице (но контент предназначен для разработчиков)  
**Версия плана:** v2.0 | Сессия S293

---

## Назначение страницы

Навигационный хаб для лабораторных (`*1`) страниц. Содержит ссылки на dev/experimental версии страниц, чеклист для промоута lab-страницы в продакшн, описание workflow.

---

## Featured Lab Pages

| Страница | Путь | Описание |
|----------|------|----------|
| Menu Builder (LAB) | `/menudishes1` | CRUD блюд и категорий |
| Menu Translations (LAB) | `/menutranslations1` | Мультиязычность меню |

---

## Other Lab Pages (список)

| Страница | Путь |
|----------|------|
| Partner Home Lab | `/partnerhome1` |
| Tables Lab | `/partnertables1` |
| Settings Lab | `/partnersettings1` |
| Staff Lab | `/partnerstaffaccess1` |
| Orders Lab | `/orderslist1` |
| Hall Defaults Migration | `/hallmigrate1` |
| Table Sessions (Hall) | `/tablesessions1` |

---

## Promote Checklist (на странице)

Чеклист перед промоутом `*1` → продакшн:
1. Page loads without console errors
2. Empty states are visible (no blank screens)
3. CRUD tested: create/edit/disable works
4. Smoke test PROD routes: /partnerhome, /menudishes, /partnertables, /staffordersmobile, /x
5. After promote: remove or stop using the *1 page to avoid drift

---

## Happy Path сценарии

### HP-1: Открыть Lab
1. Открыть `/lab`
2. ✅ FlaskConical иконка, заголовок «Lab — Experimental Pages»
3. ✅ About Lab карточка с описанием workflow
4. ✅ Featured Lab Pages (2 карточки с кнопками)
5. ✅ Other Lab Pages список
6. ✅ Promote Checklist

### HP-2: Перейти в Featured Lab
1. Нажать «Open Lab Page» (Menu Builder)
2. ✅ `navigate('/menudishes1')` через useNavigate

### HP-3: Перейти в Other Lab
1. Нажать ссылку из списка
2. ✅ Навигация на `*1` путь

---

## Edge Cases

| # | Сценарий | Ожидаемое |
|---|----------|-----------|
| E1 | Путь `/menudishes1` не существует | Страница 404 в B44 (Lab не проверяет существование) |
| E2 | Авторизация | Страница открывается без проверки (нет PartnerShell) |

---

## Специфические проверки

- **Нет API-запросов:** Lab — чисто навигационный компонент, без useQuery
- **Иконки:** FlaskConical (хаб), Utensils (menu builder), Globe (translations), CheckCircle2 (checklist)
- **Featured cards:** цвета indigo (MenuBuilder) и purple (Translations)
- **Workflow:** `*1` (lab) → тест → copy в продакшн → убрать `*1`
- **Нет PartnerShell:** Lab не имеет стандартного shell (отдельный layout)

---

## Preconditions & Тестовые данные

| Сценарий | Что подготовить |
|----------|----------------|
| HP-1 (открыть) | Любой пользователь (авторизованный или нет) |
| HP-2 (переход в Featured Lab) | `/menudishes1` должна существовать в B44 |

---

## Security & Authorization Tests

| # | Тест | Ожидаемое |
|---|------|-----------|
| S1 | `/lab` без авторизации | Страница открывается (нет PartnerShell — нет auth check) |
| S2 | `*1` страницы — авторизация | Переход на `/menudishes1` — требует партнёрскую авторизацию |

---

## UI / Visual Tests

| # | Тест | Критерий прохождения |
|---|------|---------------------|
| V1 | Мобиль 390px — Featured Lab карточки | Видны без горизонтального скролла |
| V2 | Other Lab Pages список | Все ссылки видны |
| V3 | Promote Checklist | Читаем на мобиле |
| V4 | FlaskConical иконка | Отображается корректно |

---

## Performance Tests

| # | Тест | Целевой показатель |
|---|------|--------------------|
| P1 | Загрузка `/lab` | Мгновенно (нет API запросов) |

---

## Integration Tests

| # | Сценарий | Ожидаемое |
|---|----------|-----------|
| I1 | Нажать «Open Lab Page» (Menu Builder) → `/menudishes1` | Lab-страница загружается корректно |
| I2 | Promote flow: скопировать `*1` код в продакшн | Продакшн страница работает без регрессий (по Promote Checklist) |
