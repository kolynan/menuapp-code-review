---
version: "1.2"
updated: "2026-03-01"
session: 52
---

# PartnerSettings — Настройки ресторана

## Описание
Страница настроек ресторана. Позволяет владельцу/менеджеру настраивать: профиль (название, адрес, лого), часы работы, каналы продаж, настройки зала, Wi-Fi, языки, валюты, контакты.

**Route:** `/partnersettings`
**Roles:** partner_owner, partner_manager, director, managing_director
**Размер:** 2116 строк

## Архитектура

### Компоненты
- `PartnerSettings` — главный компонент (export default)
- `ProfileSection` — имя, адрес, лого, карта
- `WorkingHoursSection` — расписание 7 дней, копирование
- `ChannelsSection` — Hall/Pickup/Delivery toggles
- `HallOrderingSection` — guest code, table code, attempts, cooldown
- `WifiSection` — SSID, пароль, тип безопасности
- `LanguagesSection` — язык по умолчанию, enabled languages
- `CurrenciesSection` — валюта, курсы, custom currency
- `ContactsSection` — CRUD контактов, preview
- `SectionNav` — горизонтальная навигация с scroll-spy
- `RateLimitScreen` — экран при 429 ошибках
- `NoPartnerAccessScreen` — экран без доступа

### Entities
- **Partner** — основные настройки (60+ полей)
- **WiFiConfig** — Wi-Fi (1:1 с Partner)
- **PartnerContacts** — настройки контактов (view_mode)
- **PartnerContactLink** — отдельные ссылки (CRUD)

### Ключевые паттерны
- **Auto-save с debounce (500ms):** WorkingHours, Languages, Currencies
- **Rate limiting:** isRateLimitError(), RateLimitScreen
- **i18n:** useI18n(), все строки через t()
- **Оптимистичный UI:** channels, hall settings
- **pendingCount:** счётчик вместо boolean для параллельных save

## UX Changelog

| Дата | Версия | Что изменилось |
|------|--------|----------------|
| 2026-02-24 | 1.0 | Первичное сохранение кода (из B44) |
| 2026-02-28 | 1.1 | Phase 1 UX: sticky Save/Discard бар для профиля (определение несохранённых изменений), увеличены тач-цели до 44px по всей странице (время, кнопки, переключатели) |
| 2026-03-01 | 1.2 | Phase 1v2 CC+Codex: 8 оставшихся тач-целей исправлены (rate input, custom currency, nav tabs, copy-to-all, contact add, hall/wifi save кнопки) |

## Известные вопросы для review
1. Main component ~300 строк — можно разбить
2. Похожие debounce-паттерны в 3 секциях — вынести в shared hook
3. checkScrollPosition без debounce на scroll event
4. Нет confirm dialog для деструктивных действий (кроме контактов)
5. Нет валидации времени (close < open)
6. Logo save state отличается от других секций
