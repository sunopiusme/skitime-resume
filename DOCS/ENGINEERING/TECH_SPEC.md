# Technical Specification

## Stack

- Framework: `Next.js 16 App Router`
- Language: `TypeScript`
- Runtime: `React 19`
- Styling: `CSS Modules` + global CSS variables
- Content: local `TypeScript` data + `MDX` case studies
- Tooling: `ESLint` with `eslint-config-next/core-web-vitals`

## Rules

- App Router MUST be the only routing layer.
- Server Components MUST be the default for page composition.
- Content MUST stay local in repository for v1.
- `typescript.ignoreBuildErrors` MUST NOT be enabled.
- Decorative comments in JSX, CSS and config MUST NOT be added.
- `strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `noImplicitOverride` MUST stay enabled.

## Architecture

- `src/app` hosts public routes and metadata surfaces.
- `src/components` hosts shared chrome and structural elements.
- `src/features/*` hosts page-domain components and CSS modules.
- `src/content` hosts typed data and MDX case studies.
- `src/design-system` hosts site config and design tokens consumed by code and OG image generation.

## Content Model

- `Profile`
- `ContactLink`
- `ExperienceEntry`
- `SkillGroup`
- `ProjectSummary`
- `CaseStudyFrontmatter`
- `LabEntry`

## Quality Gates

- `npm run lint` MUST pass.
- `npm run typecheck` MUST pass.
- `npm run build` MUST pass.
- Key routes MUST render without hydration issues.
- Case study routing MUST be typed through an explicit slug registry.
