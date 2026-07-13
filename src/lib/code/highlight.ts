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

/* Тёплая тёмная палитра в духе One Dark / VS Code Dark+ (по референсу):
   • comment — тёплый оливковый, курсив (не холодный серо-синий);
   • number/const — оранжевый (#d19a66), самый узнаваемый акцент темы;
   • string — зелёный (#98c379);
   • function/support.function — золото (#dcdcaa): rgba()/var() читаются
     как вызовы;
   • type/class — тёплое золото (#e5c07b);
   • property / attribute-name — светло-голубой (#9cdcfe);
   • CSS-значения (grid и пр.) держим светлыми (fg), а не оранжевыми,
     чтобы оранжевый оставался признаком ЧИСЕЛ;
   • keyword/storage — фиолетовый (#c678dd); tag — синий (#61afef);
     null/undefined — красный (#e06c75).
   Bg = #1a1a1a (== --composer-surface-sunken): насыщенные токены и
   зелёная/красная заливка diff-строк получают «воздух».
   Diff-строки СОХРАНЯЮТ подсветку синтаксиса (как в референсе): фон-
   полоса + знак в гаттере несут состояние, а токены остаются цветными
   (раньше строку целиком перекрашивали в один зелёный/красный). */
const THEME_NAME = "composer-code" as const;

const THEME: ThemeRegistration = {
  name: THEME_NAME,
  type: "dark",
  fg: "#d6d6d6",
  bg: "#1a1a1a",
  settings: [
    {
      settings: {
        foreground: "#d6d6d6",
        background: "#1a1a1a",
      },
    },
    {
      scope: ["comment", "punctuation.definition.comment"],
      settings: {
        foreground: "#8a9468",
        fontStyle: "italic",
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
        foreground: "#9aa0ac",
      },
    },
    {
      scope: ["punctuation.definition.tag", "entity.name.tag"],
      settings: {
        foreground: "#61afef",
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
        foreground: "#c678dd",
      },
    },
    {
      scope: [
        "entity.other.attribute-name",
        "variable.other.property",
        "support.type.property-name",
        "meta.object-literal.key",
      ],
      settings: {
        foreground: "#9cdcfe",
      },
    },
    {
      scope: ["support.constant.property-value", "meta.property-value"],
      settings: {
        foreground: "#d6d6d6",
      },
    },
    {
      scope: ["string", "string.quoted", "string.template"],
      settings: {
        foreground: "#98c379",
      },
    },
    {
      scope: [
        "constant.numeric",
        "constant.language",
        "constant.character",
        "constant.other.color",
      ],
      settings: {
        foreground: "#d19a66",
      },
    },
    {
      scope: [
        "entity.name.function",
        "support.function",
        "meta.function-call.identifier",
      ],
      settings: {
        foreground: "#dcdcaa",
      },
    },
    {
      scope: [
        "entity.name.type",
        "entity.name.class",
        "support.class.component",
      ],
      settings: {
        foreground: "#e5c07b",
      },
    },
    {
      scope: ["variable", "variable.other", "variable.parameter"],
      settings: {
        foreground: "#d6d6d6",
      },
    },
    {
      scope: [
        "variable.language",
        "constant.language.null",
        "constant.language.undefined",
      ],
      settings: {
        foreground: "#e06c75",
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
    // Diff-строки сохраняют подсветку синтаксиса (как в референсе):
    // состояние несёт фон-полоса + знак в гаттере, не перекраска текста.
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
