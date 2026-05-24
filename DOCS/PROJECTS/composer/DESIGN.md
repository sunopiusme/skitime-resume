# Composer — Design Contract

Ключевые слова `MUST`, `SHOULD`, `MAY` интерпретируются по BCP 14 / RFC 8174.

## Visual Direction

- Наследует editorial направление `skitime-resume`: типографика first, тишина, авторский тон.
- Жанр страницы — исследовательский long-read, не витрина компонентов.
- ADE-поверхность выглядит как рабочая система: строгая сетка, thin dividers, restrained accents, monospace для служебных данных.
- Запрещены generic AI UI клише: sparkles, violet gradients, glowing рамки, gimmick-анимации, декоративные «магические» состояния.
- Тон текста и UI — спокойный, доказательный, без onboarding-микрокопи.

## `/projects/composer`

- Ширина текстовой колонны — 68-72ch.
- Live-элементы, research figures и code snippets MAY выходить за границы текстовой колонны через full-bleed wrappers.
- Страница MUST читаться как непрерывный рассказ: контекст → trace → input → control plane → рефлексия.
- Переходы между частями задаются вертикальным ритмом, hairline-разделителями и встроенными фигурами, а не карточными секциями.

## Hero

- Hero title: `Composer, или как работает ADE`.
- Hero MUST содержать meta rail, title, lede и живой `ThinkingModel`.
- `ThinkingModel` автоматически проигрывает цикл: streaming trace → expanded trace → done → pause → restart.
- При reduced motion показывается финальное состояние без lift/pulse-анимаций.

## Research Figures

- Research figures MUST быть построены на TSX/CSS без новой графической зависимости.
- Фигуры должны выглядеть как исследовательские схемы: таблица, timeline, loop, matrix.
- Обязательные фигуры:
  - evolution timeline: `autocomplete → chat IDE → coding agent → ADE`;
  - surface matrix: `editor / terminal / cloud / manager surface` × `assistive / agentic`;
  - ADE loop: `intent → plan → permission → execute → verify → review`.
- Фигуры не должны быть вложенными карточками или декоративными иллюстрациями.

## Live Elements — Required States

### ThinkingModel

- Idle / final state for reduced motion.
- Streaming trace.
- Expanded trace.
- Done with duration.
- Error variant MAY appear in future case revisions.

### ComposerInput

- Warning / hooks state.
- Prompt placeholder.
- Permission mode.
- Model selector chip.
- Context chips: repository, environment, branch.

### AgentControlPlane

- Timeline phases: `queued`, `planning`, `running`, `review`, `verified`.
- Agent cards: role, workspace, current task, status.
- Evidence panel: commands, tests, changed files, review gate.
- Guardrail row: sandbox, approval, network, branch.
- Running / verified states MUST NOT be communicated by color alone; labels and icons duplicate state.

## Components

- `ThinkingModel` — trace surface for observable agent reasoning.
- `ComposerInput` — intent/context/permission surface.
- `AgentControlPlane` — orchestration surface for agents, workspaces, guardrails and evidence.
- `EvolutionTimeline`, `SurfaceMatrix`, `AdeLoop` — research figures for the case narrative.
- Service components: `CaseMetaRail`, `InlineFigure`, `CodeBlock`, `CopyButton`.

## Code Snippets

- Snippets MUST reflect real code from the live element.
- Allowed: shortening imports and non-essential branches.
- Any shortening MUST be obvious from the snippet and must not invent APIs that do not exist.
- Forbidden: decorative editor chrome, fake tabs, fake terminal windows.

## Typography, Density, Motion

- Sans — основной текст статьи и live UI.
- Serif italic — редкие editorial-акценты.
- Monospace — trace, states, file paths, commands, code snippets.
- Measures: body prose 18-19px desktop, 16-17px mobile, line-height 1.55-1.65.
- Motion is limited to trace reveal, streaming cursor, active status spinner, hover/focus color changes.
- `prefers-reduced-motion: reduce` MUST disable non-essential animation and show stable final states.

## Accessibility

- All interactive elements MUST have visible focus states.
- State MUST NOT be conveyed by color alone.
- Live streaming areas use `aria-live="polite"` where updates are meaningful.
- Hero `ThinkingModel` should not spam screen readers.
- Mobile layouts MUST avoid horizontal overflow for figures and `AgentControlPlane`.
