import {
  createHighlighter,
  type Highlighter,
  type BundledLanguage,
  type ThemeRegistration,
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

const THEME_NAME = "composer-code" as const;
const DIFF_ADD_CODE_COLOR = "#9fdcc9";
const DIFF_REMOVE_CODE_COLOR = "#ffa69e";

const THEME: ThemeRegistration = {
  name: THEME_NAME,
  type: "dark",
  fg: "#eeeeee",
  bg: "#202020",
  settings: [
    {
      settings: {
        foreground: "#eeeeee",
        background: "#202020",
      },
    },
    {
      scope: ["comment", "punctuation.definition.comment"],
      settings: {
        foreground: "#787878",
      },
    },
    {
      scope: [
        "punctuation",
        "meta.brace",
        "meta.delimiter",
        "keyword.operator",
      ],
      settings: {
        foreground: "#969696",
      },
    },
    {
      scope: ["punctuation.definition.tag"],
      settings: {
        foreground: "#a6a6a6",
      },
    },
    {
      scope: ["entity.name.tag"],
      settings: {
        foreground: "#edbe88",
      },
    },
    {
      scope: [
        "keyword.control",
        "keyword.control.import",
        "keyword.control.export",
        "keyword.control.from",
        "keyword.control.default",
        "keyword.control.flow",
        "keyword",
        "storage.type",
        "storage.modifier",
        "support.type",
      ],
      settings: {
        foreground: "#8fbaf0",
      },
    },
    {
      scope: ["entity.other.attribute-name"],
      settings: {
        foreground: "#8fbaf0",
      },
    },
    {
      scope: [
        "variable.other.property",
        "support.type.property-name",
        "meta.object-literal.key",
      ],
      settings: {
        foreground: "#bebebe",
      },
    },
    {
      scope: [
        "string",
        "string.quoted",
        "string.template",
      ],
      settings: {
        foreground: "#7fe0cf",
      },
    },
    {
      scope: [
        "constant.numeric",
        "constant.language",
        "constant.character",
        "support.constant",
      ],
      settings: {
        foreground: "#bde2a8",
      },
    },
    {
      scope: [
        "entity.name.type",
        "entity.name.class",
        "support.class.component",
        "entity.name.function",
        "support.function",
      ],
      settings: {
        foreground: "#edbe88",
      },
    },
    {
      scope: ["variable", "variable.other", "variable.parameter"],
      settings: {
        foreground: "#eeeeee",
      },
    },
    {
      scope: [
        "variable.language",
        "constant.language.null",
        "constant.language.undefined",
      ],
      settings: {
        foreground: "#eaa0a0",
      },
    },
  ],
};

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

function tintDiffLineCode(line: string, marker: Exclude<DiffMarker, null>): string {
  const color = marker === "add" ? DIFF_ADD_CODE_COLOR : DIFF_REMOVE_CODE_COLOR;
  return line.replace(/color:#[0-9a-fA-F]{6}/g, `color:${color}`);
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
    const themedLine = marker ? tintDiffLineCode(line, marker) : line;
    return {
      html: themedLine.replace(/^<span class="line"/, `<span class="line"${attrs}`),
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
    theme: THEME_NAME,
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
