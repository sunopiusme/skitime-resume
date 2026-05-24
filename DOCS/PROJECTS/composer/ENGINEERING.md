# Composer — Engineering Plan

Ключевые слова `MUST`, `SHOULD`, `MAY` интерпретируются по BCP 14 / RFC 8174.

## Scope

Этот документ описывает, как кейс Composer встраивается в `skitime-resume`: как устроены маршруты `/projects` и `/projects/composer`, как организован ADE research long-read с hero, research figures и inline live elements, как моделируется agentic-поведение без сети, и как работают код-сниппеты. Документ MUST быть прочитан после `PRD.md` и `DESIGN.md`.

## Stack Decisions

- Stack наследуется от `skitime-resume`: `Next.js 16 App Router`, `React 19`, `TypeScript strict`, `CSS Modules`.
- Никакой реальной LLM-интеграции, никаких сетевых запросов из живых элементов. AI-поведения — детерминированные локальные симуляции.
- Тело кейса реализуется как TSX-страница, не MDX. Причина: это статья с вкраплениями настоящих интерактивных компонентов, MDX добавил бы слой без выгоды. MDX остаётся опцией для будущих кейсов попроще.
- Подсветка кода — `shiki` на этапе серверного рендера. Сниппеты пререндерятся в HTML один раз, клиент получает готовую разметку.

## Routing

- `/projects` — страница-список. Файл `src/app/projects/page.tsx`. Server component. Рендерит список из реестра.
- `/projects/[slug]` — страница кейса. Файл `src/app/projects/[slug]/page.tsx`.
- Типизированный реестр `src/content/projects/registry.ts` экспортирует `ProjectSlug` union и маппинг на рендер кейса и его metadata.
- `generateStaticParams` MUST возвращать слаги из реестра.
- `generateMetadata` для `[slug]` MUST собирать metadata из записи реестра.
- Неизвестный слаг MUST приводить к `notFound()`.
- Шапка сайта получает пункт «Проекты», ведущий на `/projects`. Обновление в `src/app/page.tsx` и любом общем layout/header, если он появится.

## File Structure

```
src/
  app/
    projects/
      page.tsx
      [slug]/
        page.tsx
        opengraph-image.tsx
  content/
    projects/
      registry.ts
      composer/
        index.ts
        metadata.ts
        case.tsx
        snippets/
          thinking-model.ts
          composer-input.ts
          agent-control-plane.ts
  design-system/
    composer.ts
  features/
    projects/
      list/
        ProjectsList.tsx
        ProjectsList.module.css
      composer/
        case.module.css
        parts/
          CaseMetaRail.tsx
          CaseHero.tsx
          CaseProse.tsx
          InlineFigure.tsx
          CodeBlock.tsx
          ResearchFigures.tsx
          ResearchFigures.module.css
        live/
          thinking-model/
            ThinkingModel.tsx
            ThinkingModel.module.css
            useThinkingTimeline.ts
          composer-input/
            ComposerInput.tsx
            ComposerInput.module.css
          agent-control-plane/
            AgentControlPlane.tsx
            AgentControlPlane.module.css
            useAgentTimeline.ts
  lib/
    code/
      highlight.ts
    motion/
      usePrefersReducedMotion.ts
      useInView.ts
```

Конвенции:

- Компоненты живых элементов — client components (`"use client"`): несут локальное состояние и таймеры.
- Части кейса (`CaseHero`, `CaseProse`, `InlineFigure`, `CodeBlock`) — server components, кроме `CodeBlock`, в котором кнопка copy — маленький client island.
- `ProjectsList` — server component.
- Пути импортов через alias `@/`.

## Content Layer

- `src/content/projects/registry.ts` объявляет:
  - `ProjectSlug = "composer"` на v1, union расширяется при добавлении кейсов;
  - `type ProjectEntry` c полями `slug`, `title`, `summary`, `year`, `role`, `tags`, `metadata`, `render`;
  - `projects: Record<ProjectSlug, ProjectEntry>`;
  - helpers `getProject(slug): ProjectEntry`, `listProjects(): ProjectEntry[]`.
- `src/content/projects/composer/metadata.ts` экспортирует заголовок, summary, year, tags и данные для OG.
- `src/content/projects/composer/case.tsx` экспортирует `ComposerCase` — server component, который собирает кейс: hero + прозовые секции + research figures + inline живые элементы и код-сниппеты.
- `src/content/projects/composer/snippets/*.ts` хранят исходники сниппетов как строки с указанием языка и пути файла. На этапе рендера проходят через `highlight`.

## Hero

- Реализован как `CaseHero`, композирующий `CaseMetaRail`, крупный заголовок, short summary и `ThinkingModel` в режиме `hero`.
- `ThinkingModel` в hero:
  - автозапуск цикла через `useThinkingTimeline({ autoplay: true, loop: true })`;
  - при `prefers-reduced-motion: reduce` останавливается на финальном кадре цикла;
  - не интерактивен и не перехватывает фокус;
  - имеет `aria-label`, описывающий его как визуальную демонстрацию; `aria-live` — `off`, чтобы hero не спамил скринридер.

## Inline Live Elements

- Размещаются через `InlineFigure` (обёртка с опциональной подписью сверху и caption снизу).
- По умолчанию стартуют при въезде в viewport (`useInView`), играют один цикл, замирают в финальном состоянии.
- Повторный запуск при повторном въезде допустим и включается флагом компонента.
- При `prefers-reduced-motion: reduce` живой элемент показывает финальное состояние сразу, без анимации.

## State Simulation

Фрагменты моделируют AI-поведение детерминированно, без сети и без таймеров длиннее 4 секунд на цикл.

### Thinking model

- `useThinkingTimeline` принимает массив шагов и длительностей, флаги `autoplay`, `loop`, `reducedMotion`.
- В hero: autoplay + loop, цикл streaming → expanded → done → пауза → restart.
- В inline-появлении: autoplay без loop, цикл подбирается под абзац (например, только streaming → done, или error-вариант).

### Composer input

- Локальный state для фокуса, набранного текста, открытого `ModelSelector`, списка `ContextPill`.
- Скрипт состояния для inline-демо задаётся пропом `script`, который проигрывается при въезде в viewport.

### Agent control plane

- `useAgentTimeline` управляет фазами `queued → planning → running → review → verified`.
- `AgentControlPlane` отображает agent cards, workspaces, evidence panel и guardrails.
- Скрипт запускается при въезде и при `prefers-reduced-motion: reduce` сразу показывает `verified`.

### Research figures

- `ResearchFigures.tsx` содержит статические TSX/CSS-схемы без runtime chart dependencies.
- Обязательные фигуры: evolution timeline, surface matrix, ADE loop.

Любое состояние, перечисленное в `DESIGN.md`, MUST быть достижимо через конфигурацию компонента и попадать в публикуемую версию кейса хотя бы в одном inline-появлении.

## Code Blocks

- `highlight(code, lang)` в `src/lib/code/highlight.ts` оборачивает `shiki`, кэширует highlighter между вызовами, возвращает `{ html, lang, lines }`.
- `CodeBlock` — server component, принимает пререндеренный HTML и рендерит `<pre>` с классами из токенов.
- Кнопка copy — маленький client island внутри `CodeBlock`, читает исходник из data-атрибута.
- Код-сниппет MUST быть копией реального кода компонента. Сокращения разрешены: удаление импортов не-ключевых утилит, свёртка неважных веток. Каждое сокращение MUST быть отмечено одним `// …`.

## Accessibility Implementation

- `:focus-visible` с outline в cyan-акценте для всех интерактивов.
- Inline `ThinkingModel` и `AgentControlPlane` используют `aria-live="polite"` там, где обновления помогают понять состояние. Hero `ThinkingModel` — `aria-live="off"`.
- `ContextPill` — `<button>`, удаляется через `Backspace` при фокусе.
- `ModelSelector` — `<button>` + `<ul role="listbox">`, клавиатурная навигация: стрелки, Enter, Escape.
- `/projects` — список в `<ol>` с `<a>`-элементами, навигация клавиатурой через Tab.
- Контраст текста проверяется вручную для обеих базовых тем сайта.

## Motion Strategy

- `src/lib/motion/usePrefersReducedMotion.ts` — один источник истины для reduced-motion. Живые элементы подписываются на него.
- `src/lib/motion/useInView.ts` — IntersectionObserver-хук для триггера inline-демонстраций.
- Все разрешённые кейсы motion перечислены в `DESIGN.md`; новые добавлять MUST NOT без обновления дизайн-контракта.

## Performance

- `shiki` работает только на сервере.
- Код-сниппеты пререндерятся, клиент не загружает highlighter.
- Client-бюджет на живой элемент — не более 25kb gzip. Проверяется по `next build` stats.
- Hero `ThinkingModel` MUST рендериться без hydration warnings и без layout shift при старте цикла.

## Quality Gates

- `npm run lint` MUST проходить.
- `npm run typecheck` MUST проходить.
- `npm run build` MUST проходить.
- Маршруты `/projects` и `/projects/composer` MUST рендериться без hydration warnings.
- Все состояния живых элементов из `DESIGN.md` MUST быть проверены визуально в светлой и тёмной темах.
- Код-сниппеты MUST соответствовать исходному коду компонентов на момент сборки.

## Dependencies

- Новая runtime-зависимость: `shiki`. Версия фиксируется при установке.
- Никаких CSS-in-JS библиотек. Только CSS Modules и CSS custom properties.
- Иконки — собственные inline SVG.

## Out of Scope (Engineering)

- Реальная LLM или сетевой слой.
- Persist-состояние между сессиями.
- Локальный theme-switcher внутри кейса.
- Глобальный theme-switcher сайта.
- MDX-рендер для этого кейса.
- Автоматизированные тесты в v1. При добавлении — Vitest + Testing Library, решение фиксируется отдельной записью в `DOCS/ENGINEERING/TECH_SPEC.md`.

## Delivery Steps

1. Design tokens: `src/design-system/composer.ts` и scoped CSS-переменные в `case.module.css`.
2. Shared motion utilities: `usePrefersReducedMotion`, `useInView`.
3. Content registry: `src/content/projects/registry.ts`, запись для `composer`.
4. Route scaffolding:
   - `src/app/projects/page.tsx` с рендером `ProjectsList`;
   - `src/app/projects/[slug]/page.tsx` с `generateStaticParams`, `generateMetadata`, `notFound()`.
5. Header: пункт «Проекты» в шапке `/` ведёт на `/projects`.
6. Case primitives: `CaseMetaRail`, `CaseHero`, `CaseProse`, `InlineFigure`, `CodeBlock`, `highlight`.
7. Hero live element: `ThinkingModel` с `hero` режимом и автоциклом.
8. Inline live element 01: `ThinkingModel` inline-конфигурация внутри текста.
9. Inline live element 02: `ComposerInput`.
10. Inline live element 03: `AgentControlPlane`.
11. Research figures: `EvolutionTimeline`, `SurfaceMatrix`, `AdeLoop`.
12. Написание самой статьи: `case.tsx` с прозовыми блоками, встроенными `InlineFigure`, research figures и `CodeBlock`.
13. OG image кейса.
14. Финальный проход quality gates.

Порядок MUST сохраняться: токены и примитивы раньше живых элементов, живые элементы раньше написания статьи.
