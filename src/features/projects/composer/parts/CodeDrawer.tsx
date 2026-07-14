"use client";

import { useId, useState } from "react";
import type { ReactNode } from "react";

import styles from "./CodeDrawer.module.css";

/* ─────────────────────────────────────────
   CodeDrawer — свёрнутый виджет «артефактов»
   секции вместо развёрнутого полотна кода.

   Паттерн из панелей ресурсов в AI-средах:
   компактная карточка со списком файлов,
   каждый файл раскрывается по клику и
   показывает готовый CodeBlock (children,
   отрендеренный на сервере). Монохром,
   hairline — в системе кейса.
   ───────────────────────────────────────── */

type Props = {
  /* Имя файла (последний сегмент пути). */
  file: string;
  /* Каталог файла — приглушённым после имени. */
  dir?: string;
  /* Короткая мета: язык, diff-статистика. */
  meta?: string;
  /* Пререндеренный CodeBlock. */
  children: ReactNode;
};

function FileIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M9.5 1.5H4.5C3.94772 1.5 3.5 1.94772 3.5 2.5V13.5C3.5 14.0523 3.94772 14.5 4.5 14.5H11.5C12.0523 14.5 12.5 14.0523 12.5 13.5V4.5L9.5 1.5Z"
        stroke="currentColor"
        strokeLinejoin="round"
      />
      <path d="M9.5 1.5V4.5H12.5" stroke="currentColor" strokeLinejoin="round" />
    </svg>
  );
}

function ChevronIcon() {
  return (
    <svg viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <path
        d="M4.5 2.5L8 6L4.5 9.5"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function CodeDrawer({ file, dir, meta, children }: Props) {
  const [open, setOpen] = useState(false);
  const regionId = useId();

  return (
    <div className={styles.drawer} data-open={open}>
      <div className={styles.head}>
        <span className={styles.headLabel}>Код</span>
        {meta ? <span className={styles.headMeta}>{meta}</span> : null}
      </div>

      <button
        type="button"
        className={styles.row}
        aria-expanded={open}
        aria-controls={regionId}
        onClick={() => setOpen((v) => !v)}
      >
        <span className={styles.rowIcon}>
          <FileIcon />
        </span>
        <span className={styles.rowName}>{file}</span>
        {dir ? <span className={styles.rowDir}>{dir}</span> : null}
        <span className={styles.rowChevron}>
          <ChevronIcon />
        </span>
      </button>

      <div id={regionId} className={styles.body} hidden={!open}>
        {children}
      </div>
    </div>
  );
}
