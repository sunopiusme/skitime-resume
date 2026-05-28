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
  --composer-unit: 4px;
  --composer-font-mono: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace;
  --composer-duration-hover: 120ms;
  --composer-duration-lift: 160ms;
  --composer-duration-reveal: 200ms;
  --composer-page-max: 1280px;
  --composer-measure: 70ch;
  --composer-measure-wide: 960px;
  --composer-measure-graphic: 1120px;
  --composer-measure-hero: 760px;
  --composer-section-gap: clamp(72px, 7vw, 112px);
  --composer-section-gap-tight: clamp(24px, 2.8vw, 40px);
`;

export const composerDarkCssVariables = composerCssVariables;
