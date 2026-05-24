import { highlight, type SupportedLanguage, type DiffMarker } from "@/lib/code/highlight";

import styles from "./CodeBlock.module.css";
import CopyButton from "./CopyButton";

type Props = {
  code: string;
  lang: SupportedLanguage;
  path: string;
  diff?: DiffMarker[] | undefined;
};

const LANG_LABEL: Record<SupportedLanguage, string> = {
  typescript: "ts",
  tsx: "tsx",
  javascript: "js",
  jsx: "jsx",
  css: "css",
  json: "json",
  bash: "sh",
  markdown: "md",
};

function splitPath(path: string) {
  const idx = path.lastIndexOf("/");
  if (idx === -1) return { dir: "", file: path };
  return { dir: path.slice(0, idx), file: path.slice(idx + 1) };
}

export default async function CodeBlock({ code, lang, path, diff }: Props) {
  const { html, lines, renderedLines } = await highlight(code, lang, diff);
  const { dir, file } = splitPath(path);
  const isDiffView = !!diff && diff.some((m) => m);
  const addCount = diff?.filter((m) => m === "add").length ?? 0;
  const removeCount = diff?.filter((m) => m === "remove").length ?? 0;

  return (
    <figure className={styles.block}>
      <figcaption className={styles.head}>
        <div className={styles.headPath} title={path}>
          <span className={styles.pathFile}>{file}</span>
          {dir ? <span className={styles.pathDir}>{dir}</span> : null}
        </div>
        <div className={styles.headMeta}>
          <span className={styles.lang} aria-hidden="true">
            {LANG_LABEL[lang]}
          </span>
          {isDiffView ? (
            <span className={styles.diffStat} aria-hidden="true">
              <span className={styles.diffStatAdd}>+{addCount}</span>
              <span className={styles.diffStatRemove}>−{removeCount}</span>
            </span>
          ) : (
            <>
              <span className={styles.metaDot} aria-hidden="true" />
              <span className={styles.lines} aria-hidden="true">
                {lines} {linesNoun(lines)}
              </span>
            </>
          )}
          <CopyButton source={code} />
        </div>
      </figcaption>
      <div className={styles.body} data-view={isDiffView ? "diff" : "full"}>
        <div
          className={styles.pre}
          dangerouslySetInnerHTML={{ __html: html }}
          aria-label={
            isDiffView
              ? `Изменения в ${path}: +${addCount} −${removeCount}, показано ${renderedLines} строк`
              : `Код ${path}`
          }
        />
      </div>
    </figure>
  );
}

function linesNoun(n: number): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return "строка";
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return "строки";
  return "строк";
}
