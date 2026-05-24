# Composer — Product Requirements Document

Ключевые слова `MUST`, `SHOULD`, `MAY` интерпретируются по BCP 14 / RFC 8174.

## Product Summary

Composer — первый portfolio-специальный проект `skitime-resume`. Это исследовательский editorial long-read о проектировании ADE: Agentic Development Environment.

Формат доставки — страница кейса `/projects/composer`. Жанр — авторская статья с живым hero, исследовательскими графиками, интерактивными фрагментами и код-сниппетами.

Ключевая идея: современный coding workspace уже не сводится к IDE с боковым чатом. ADE управляет агентами, окружениями, правами, планами, выполнением, проверками и evidence.

## Why This Project

- Закрывает разрыв между заявленным AI-native процессом и доказательством через живой продуктовый код.
- Показывает, что автор умеет не только стилизовать интерфейс, но и строить исследовательскую рамку вокруг новой категории.
- Переводит кейс из generic AI IDE эстетики в профессиональный ADE-разбор: trace, context, permissions, workspaces, evidence, review.

## Audience

- Первичная: потенциальные клиенты и hiring managers. Читают страницу как длинную статью и оценивают мышление, вкус, системность и реализацию.
- Вторичная: дизайнеры и инженеры AI-продуктов, которым кейс служит референсом по agentic workflow surfaces.

## The Case As A Story

Страница MUST читаться как авторский текст, не как шаблонный case study. Повествование строится вокруг сдвига:

- раньше: autocomplete и chat IDE помогали внутри редактора;
- сейчас: coding agents выполняют задачи в терминале, sandbox, cloud session, GitHub и manager surface;
- задача дизайна: сделать агентную работу наблюдаемой, управляемой и проверяемой;
- решение Composer: thinking trace, composer input, agent control plane.

Исследовательская база: Addy ADE, OpenAI Codex, Claude Code, Google Antigravity, GitHub Copilot coding agent, AWS Kiro, Windsurf Cascade, а также исследования про adoption coding agents и конфигурационные артефакты вроде `AGENTS.md`.

## Hero

- Первый экран MUST быть визуально главным.
- Hero title: `Composer, или как работает ADE`.
- Hero lede объясняет, что кейс про управление агентами, окружениями, правами и evidence.
- В hero живёт крупный `ThinkingModel` — настоящий работающий компонент, не картинка.
- При `prefers-reduced-motion: reduce` hero показывает финальный понятный кадр.

## Inline Live Elements And Research Figures

Обязательные live-элементы v1:

- `ThinkingModel` — наблюдаемый trace агентной работы.
- `ComposerInput` — место связывания намерения, контекста, модели и прав.
- `AgentControlPlane` — управление агентами, workspaces, guardrails и evidence.

Обязательные research figures v1:

- evolution timeline: `autocomplete → chat IDE → coding agent → ADE`;
- surface matrix: `editor / terminal / cloud / manager surface` × `assistive / agentic`;
- ADE loop: `intent → plan → permission → execute → verify → review`.

Live-элементы и графики MUST быть встроены в повествование как доказательства тезиса, а не вынесены в галерею компонентов.

## Scope

### MUST

- Страница-список `/projects` с карточкой Composer.
- Страница кейса `/projects/composer`.
- Hero с живым `ThinkingModel`.
- Полностью переписанный ADE-нарратив на русском языке.
- Три live-элемента: `ThinkingModel`, `ComposerInput`, `AgentControlPlane`.
- Три исследовательских графика без новых runtime-зависимостей.
- Код-сниппеты рядом с live-элементами, отражающие реальный код.
- Accessibility минимум: focus, клавиатура, контраст AA, корректные `aria-live` там, где есть streaming.

### Non-goals

- Полноценное macOS-приложение.
- Реальная LLM, сеть, GitHub API, MCP-сервер или cloud sandbox.
- Persist-состояние между сессиями.
- Локальный theme-switcher внутри кейса.
- Глобальный theme-switcher сайта.

## Success Criteria

- Читатель понимает, почему ADE — более точная рамка, чем AI IDE.
- Текст не содержит недоказуемых тезисов про выдуманные конкуренты, sparkles, purple gradients или generic AI UI.
- Research figures выглядят как часть профессионального исследования, а не как декоративные блоки.
- `AgentControlPlane` заменяет старый `AssistantActionBlock` по смыслу и коду.
- Кодовая база проходит `lint`, `typecheck`, `build` без послаблений.
