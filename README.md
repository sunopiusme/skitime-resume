# skitime-resume

Персональный сайт-портфолио и резюме Данилы Фурманова на `Next.js 16`, `TypeScript` и локальном content layer.

## Stack

- `Next.js App Router`
- `TypeScript` strict mode
- `React 19`
- `CSS Modules` + CSS custom properties
- Локальный content layer на TS (без MDX и без CMS)

## Routes

Опубликованы:

- `/` — editorial landing
- `/projects` — список кейсов
- `/projects/composer` — research-кейс об Agentic Development Environment

Future scope (см. `DOCS/PRODUCT/PRD.md`):

- `/resume` — print-friendly резюме
- `/labs` — полка экспериментов и research tracks
- `/projects/relay`, `/projects/zenpulse` — продуктовые кейсы

## Scripts

```bash
npm install
npm run dev
npm run lint
npm run typecheck
npm run build
```

## Documentation OS

Документация живёт в `DOCS/` и описывает продукт, дизайн, инженерные правила и delivery gates раньше реализации.
