# Delivery Checklist

## Runbook

1. `npm install`
2. `npm run lint`
3. `npm run typecheck`
4. `npm run build`
5. Открыть `/`, `/projects`, `/projects/composer`, `/_not_found_test_route` (проверка 404).

## Definition of Done

- Главная коммуницирует позиционирование в первом экране.
- Все CTA в шапке и hero ведут на опубликованный маршрут или на внешний контакт. Мёртвых якорей нет.
- Список `/projects` и кейс `/projects/composer` рендерятся без placeholder-текста.
- 404 рендерится с собственной русскоязычной разметкой и ведущими ссылками на `/` и `/projects`.
- `lang` корневого документа равен `ru`. `og:locale` равен `ru-RU`.
- Каждый опубликованный маршрут имеет canonical, OG image, title и description.
- Видимый focus-visible на ключевых интерактивных элементах.
- Декоративных комментариев в коде не оставлено.

## Review Script

1. Прочитать первый экран главной, проверить, что обе кнопки кликабельны.
2. Открыть `/projects`, перейти в `/projects/composer`.
3. Проверить tab-навигацию по главной и списку проектов: фокусное кольцо видно.
4. Открыть несуществующий маршрут и убедиться, что 404 ведёт обратно в навигацию.
5. Проверить OG-превью для `/`, `/projects`, `/projects/composer`.

## Future scope (не входит в текущий gate)

- `/resume`, `/labs`, `/projects/relay`, `/projects/zenpulse`.
- Self-hosted шрифты и offline build без сетевой зависимости от Google Fonts.
- Полный WCAG 2.2 AA pass и автоматизированный Playwright keyboard test.
