"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { ReactNode } from "react";

import styles from "./CodeDrawer.module.css";

/* ─────────────────────────────────────────
   CodeDrawer — плавающая кнопка «показать код».

   Вместо разворачивающегося в потоке полотна:
   компактная пилюля с иконкой кода, по клику
   из неё выплывает floating-панель с готовым
   CodeBlock (children, пререндерен на сервере).
   Панель — overlay поверх контента: короткий
   fade+slide, закрытие по Escape и клику мимо.
   Монохром, hairline — в системе кейса.
   ───────────────────────────────────────── */

type Props = {
  /* Имя файла — подпись в триггере и aria-label панели.
     Путь и мету показывает сам CodeBlock внутри. */
  file: string;
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

function CloseIcon() {
  return (
    <svg viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <path
        d="M3 3L9 9M9 3L3 9"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function CodeDrawer({ file, children }: Props) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const panelId = useId();

  /* Закрытие по Escape и клику вне виджета. */
  useEffect(() => {
    if (!open) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    function onPointerDown(event: PointerEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className={styles.root} data-open={open}>
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
        <span className={styles.triggerLabel}>Код</span>
        <span className={styles.triggerFile}>{file}</span>
      </button>

      {/* Панель всегда в DOM — переход opacity/transform
          работает в обе стороны, visibility прячет от
          фокуса и скринридеров в закрытом состоянии.
          Без собственной шапки: CodeBlock внутри уже несёт
          имя файла, путь и мету — дублировать их нечего.
          Крестик плавает над правым верхним углом кода. */}
      <div id={panelId} className={styles.panel} role="dialog" aria-label={`Код ${file}`}>
        <button
          type="button"
          className={styles.panelClose}
          aria-label="Закрыть код"
          onClick={() => setOpen(false)}
        >
          <CloseIcon />
        </button>
        <div className={styles.panelBody}>{children}</div>
      </div>
    </div>
  );
}
