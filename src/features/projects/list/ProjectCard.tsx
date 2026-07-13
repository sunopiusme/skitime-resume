"use client";

import Link from "next/link";
import { useRef } from "react";

import ProjectCover from "./ProjectCover";
import styles from "./ProjectsList.module.css";

type Props = {
  slug: string;
  title: string;
  year: string;
  index: string;
};

/**
 * Карточка проекта со spotlight-hover: курсор «подсвечивает» рамку
 * и внутренность карточки в точке наведения. Контент при этом
 * неподвижен — никакого zoom'а/lift'а. Координаты пишутся напрямую
 * в CSS-переменные на DOM-узле, минуя React-рендер.
 */
export default function ProjectCard({ slug, title, year, index }: Props) {
  const coverRef = useRef<HTMLDivElement>(null);

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = coverRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${e.clientX - rect.left}px`);
    el.style.setProperty("--my", `${e.clientY - rect.top}px`);
  };

  /* Светлая mesh-обложка получает свой вариант spotlight'а:
     белый блик на пастели не читается, поэтому кольцо — слейтовое,
     блик — overlay, плюс ambient bloom вокруг карточки (см. CSS). */
  const light = slug === "composer";

  return (
    <div
      ref={coverRef}
      className={light ? `${styles.cover} ${styles.coverLight}` : styles.cover}
      onPointerMove={handlePointerMove}
    >
      <ProjectCover title={title} year={year} index={index} slug={slug} />
      <Link
        className={styles.coverLink}
        href={`/projects/${slug}`}
        aria-label={`${title}, ${year}`}
      />
      <span className={styles.coverSheen} aria-hidden="true" />
      <span className={styles.coverRing} aria-hidden="true" />
    </div>
  );
}
