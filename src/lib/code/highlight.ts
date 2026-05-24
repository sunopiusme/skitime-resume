import {
  createHighlighter,
  type Highlighter,
  type BundledLanguage,
  type BundledTheme,
} from "shiki";

type SupportedLanguage = Extract<
  BundledLanguage,
  "typescript" | "tsx" | "javascript" | "jsx" | "css" | "json" | "bash" | "markdown"
>;

type DiffMarker = "add" | "remove" | null;

type DisplayMode = "full" | "diff-only";

type HighlightOptions = {
  displayMode?: DisplayMode;
  contextLines?: number;
};

type HighlightResult = {
  html: string;
  lang: SupportedLanguage;
  lines: number;
  renderedLines: number;
};

const THEME: BundledTheme = "github-dark";

const LANGS: SupportedLanguage[] = [
  "typescript",
  "tsx",
  "javascript",
  "jsx",
  "css",
  "json",
  "bash",
  "markdown",
];

let highlighterPromise: Promise<Highlighter> | null = null;

function getHighlighter(): Promise<Highlighter> {
  if (!highlighterPromise) {
    highlighterPromise = createHighlighter({
      themes: [THEME],
      langs: LANGS,
    });
  }
  return highlighterPromise;
}

function rewriteLines(
  html: string,
  diff: DiffMarker[] | undefined,
  displayMode: DisplayMode,
  contextLines: number,
): { html: string; total: number; rendered: number } {
  const codeOpenMatch = html.match(/<code\b[^>]*>/);
  const codeClose = html.lastIndexOf("</code>");
  if (!codeOpenMatch || codeClose < 0) {
    return { html, total: 0, rendered: 0 };
  }
  const innerStart = (codeOpenMatch.index ?? 0) + codeOpenMatch[0].length;
  const inner = html.slice(innerStart, codeClose);

  const fragments = inner.split("\n");
  const lineSpans = fragments.filter((f) => f.startsWith('<span class="line"'));
  const total = lineSpans.length;

  const annotated = lineSpans.map((line, i) => {
    const marker = diff?.[i] ?? null;
    const attrs = ` data-line-no="${i + 1}"${marker ? ` data-diff="${marker}"` : ""}`;
    return {
      html: line.replace(/^<span class="line"/, `<span class="line"${attrs}`),
      marker,
    };
  });

  const hasMarkers = !!diff && diff.some((m) => m);
  let emitted: string[];

  if (displayMode === "diff-only" && hasMarkers) {
    const visible = new Set<number>();
    annotated.forEach(({ marker }, i) => {
      if (!marker) return;
      const from = Math.max(0, i - contextLines);
      const to = Math.min(annotated.length - 1, i + contextLines);
      for (let j = from; j <= to; j++) visible.add(j);
    });

    const out: string[] = [];
    let prev = -2;
    annotated.forEach((item, i) => {
      if (!visible.has(i)) return;
      if (prev >= 0 && i - prev > 1) {
        out.push('<span class="hunk-gap" aria-hidden="true">\u22EF</span>');
      }
      out.push(item.html);
      prev = i;
    });
    emitted = out;
  } else {
    emitted = annotated.map((a) => a.html);
  }

  // Join with NO separator: each `.line` is `display: block` in CSS,
  // a stray "\n" text node would render as an extra empty row.
  const newInner = emitted.join("");
  return {
    html: html.slice(0, innerStart) + newInner + html.slice(codeClose),
    total,
    rendered: emitted.length,
  };
}

export async function highlight(
  code: string,
  lang: SupportedLanguage,
  diff?: DiffMarker[],
  options?: HighlightOptions,
): Promise<HighlightResult> {
  const highlighter = await getHighlighter();
  const normalized = code.replace(/\t/g, "  ");

  const html = highlighter.codeToHtml(normalized, {
    lang,
    theme: THEME,
  });

  const hasMarkers = !!diff && diff.some((m) => m);
  const displayMode: DisplayMode =
    options?.displayMode ?? (hasMarkers ? "diff-only" : "full");
  const contextLines = options?.contextLines ?? 1;

  const { html: finalHtml, total, rendered } = rewriteLines(
    html,
    diff,
    displayMode,
    contextLines,
  );

  return { html: finalHtml, lang, lines: total, renderedLines: rendered };
}

export type { SupportedLanguage, HighlightResult, DiffMarker, DisplayMode, HighlightOptions };
