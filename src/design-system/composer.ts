export const composerTokens = {
  color: {
    surface: "var(--composer-surface)",
    surfaceRaised: "var(--composer-surface-raised)",
    surfaceSunken: "var(--composer-surface-sunken)",
    ink: "var(--composer-ink)",
    inkMuted: "var(--composer-ink-muted)",
    inkSubtle: "var(--composer-ink-subtle)",
    hairline: "var(--composer-hairline)",
    hairlineStrong: "var(--composer-hairline-strong)",
    accent: "var(--composer-accent)",
    accentInk: "var(--composer-accent-ink)",
    tension: "var(--composer-tension)",
    focus: "var(--composer-focus)",
  },
  radius: {
    xs: "var(--composer-radius-xs)",
    sm: "var(--composer-radius-sm)",
    md: "var(--composer-radius-md)",
  },
  space: {
    unit: "var(--composer-unit)",
    1: "var(--composer-space-1)",
    2: "var(--composer-space-2)",
    3: "var(--composer-space-3)",
    4: "var(--composer-space-4)",
    5: "var(--composer-space-5)",
    6: "var(--composer-space-6)",
    7: "var(--composer-space-7)",
    8: "var(--composer-space-8)",
    prose: "var(--composer-space-prose)",
    sectionInner: "var(--composer-space-section-inner)",
    sectionOuter: "var(--composer-space-section-outer)",
    hero: "var(--composer-space-hero)",
  },
  font: {
    sans: "var(--font-sans)",
    serif: "var(--font-serif)",
    mono: "var(--composer-font-mono)",
  },
  duration: {
    hover: "var(--composer-duration-hover)",
    lift: "var(--composer-duration-lift)",
    reveal: "var(--composer-duration-reveal)",
  },
  measure: {
    body: "var(--composer-measure)",
    wide: "var(--composer-measure-wide)",
    graphic: "var(--composer-measure-graphic)",
    hero: "var(--composer-measure-hero)",
  },
  layout: {
    pageMax: "var(--composer-page-max)",
    sectionGap: "var(--composer-section-gap)",
    sectionGapTight: "var(--composer-section-gap-tight)",
  },
} as const;

/**
 * Базовые CSS-переменные дизайн-системы.
 * Сайт всегда в тёмной монохромной теме, поэтому светлый набор удалён.
 *
 * Spacing система основана на модульной шкале с коэффициентом 1.5 (идеальная квинта).
 * Базовая единица: 8px. Каждый уровень в 1.5 раза больше предыдущего.
 */
export const composerCssVariables = `
  --composer-surface: #0a0a0a;
  --composer-surface-sunken: #1a1a1a;
  --composer-surface-raised: #242424;
  --composer-ink: #f5f5f5;
  --composer-ink-muted: rgba(255, 255, 255, 0.72);
  --composer-ink-subtle: rgba(255, 255, 255, 0.5);
  --composer-hairline: rgba(255, 255, 255, 0.14);
  --composer-hairline-strong: rgba(255, 255, 255, 0.3);
  --composer-accent: #f5f5f5;
  --composer-accent-ink: #ffffff;
  --composer-tension: rgba(255, 255, 255, 0.55);
  --composer-focus: #ffffff;
  --composer-radius-xs: 6px;
  --composer-radius-sm: 10px;
  --composer-radius-md: 14px;
  --composer-unit: 8px;
  --composer-font-mono: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace;
  --composer-duration-hover: 120ms;
  --composer-duration-lift: 160ms;
  --composer-duration-reveal: 200ms;
  --composer-page-max: 1280px;
  --composer-measure: 70ch;
  --composer-measure-wide: 960px;
  --composer-measure-graphic: 1120px;
  --composer-measure-hero: 760px;

  /* Spacing-шкала на сетке 8pt (шаг 4px): 4·1, 4·2, 4·3, 4·4, 4·6, 4·8, 4·12, 4·16 */
  --composer-space-1: 4px;
  --composer-space-2: 8px;
  --composer-space-3: 12px;
  --composer-space-4: 16px;
  --composer-space-5: 24px;
  --composer-space-6: 32px;
  --composer-space-7: 48px;
  --composer-space-8: 64px;

  /* Адаптивные отступы для разных контекстов */
  --composer-space-prose: clamp(24px, 2.5vw, 32px);
  --composer-space-section-inner: clamp(48px, 5vw, 96px);
  --composer-space-section-outer: clamp(96px, 10vw, 160px);
  --composer-space-hero: clamp(64px, 8vw, 128px);

  /* Обратная совместимость (deprecated, используйте новые токены выше) */
  --composer-section-gap: var(--composer-space-section-outer);
  --composer-section-gap-tight: var(--composer-space-section-inner);
`;

export const composerDarkCssVariables = composerCssVariables;
