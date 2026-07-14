"use client";

import { useId, useState } from "react";
import type { ReactNode } from "react";

import styles from "./CodeDrawer.module.css";

/* ─────────────────────────────────────────
   CodeDrawer — свёрнутый код за строкой-виджетом.

   Тихая строка в потоке страницы: иконка кода,
   имя файла, мета и шеврон справа — как ряд из
   панелей ресурсов (Outputs/Sources). Клик —
   CodeBlock мгновенно появляется под строкой,
   ещё клик — скрывается. Без анимаций и
   плавающих слоёв: ничего не ездит и не
   выплывает. Монохром, hairline — в системе.
   ───────────────────────────────────────── */

type Props = {
  /* Имя файла — подпись строки. */
  file: string;
  /* Короткая мета справа: язык, diff-статистика. */
  meta?: string;
  /* Пререндеренный CodeBlock. */
  children: ReactNode;
};

function CodeIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M5.5 4.5L2 8L5.5 11.5"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10.5 4.5L14 8L10.5 11.5"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ChevronIcon() {
  return (
    <svg viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <path
        d="M3 4.5L6 7.5L9 4.5"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function CodeDrawer({ file, meta, children }: Props) {
  const [open, setOpen] = useState(false);
  const panelId = useId();

  return (
    <div className={styles.root} data-open={open}>
      <button
        type="button"
        className={styles.trigger}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
      >
        <span className={styles.triggerIcon}>
          <CodeIcon />
        </span>
        <span className={styles.triggerFile}>{file}</span>
        {meta ? <span className={styles.triggerMeta}>{meta}</span> : null}
        <span className={styles.chevron} aria-hidden="true">
          <ChevronIcon />
        </span>
      </button>

      {/* Код монтируется в DOM всегда (children пререндерены
          на сервере), скрывается display:none — мгновенно,
          без переходов, состояние не теряется. */}
      <div id={panelId} className={styles.panel} hidden={!open}>
        {children}
      </div>
    </div>
  );
}
