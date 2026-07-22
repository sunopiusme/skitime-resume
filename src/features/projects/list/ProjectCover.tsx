import ComposerInputV2 from "@/features/projects/composer/live/composer-input-v2/ComposerInput";

import styles from "./ProjectCover.module.css";

type Props = {
  title: string;
  year: string;
  index: string;
  slug?: string;
};

/**
 * Обложка-постер проекта для карточки списка. Заливает свою ячейку.
 * Композиция: индекс сверху, название и год — внутри карточки.
 */
export default function ProjectCover({ title, year, index, slug }: Props) {
  if (slug === "composer") {
    return (
      <div
        className={`${styles.cover} ${styles.composerCover}`}
        role="img"
        aria-label={`${title}, ${year}`}
      >
        <span className={styles.composerIssue} aria-hidden="true">
          {index}
        </span>

        {/* Product-shot: композер целиком в кадре, без fixed-760 кропа.
            inert — превью, не интерактив. Без LCD-плашки: чистая карточка. */}
        <div className={styles.composerStage} aria-hidden="true" inert>
          <div className={styles.composerFrame}>
            <ComposerInputV2 />
          </div>
        </div>

        <span className={styles.composerMeta}>
          <span className={styles.composerTitle}>{title}</span>
          <span className={styles.composerYear}>{year}</span>
        </span>
      </div>
    );
  }

  if (slug === "xsycoin") {
    return (
      <div
        className={`${styles.cover} ${styles.xsycoinCover}`}
        role="img"
        aria-label={`${title}, ${year}`}
      >
        <span className={styles.xsycoinIssue} aria-hidden="true">
          {index}
        </span>

        <span className={styles.xsycoinMeta}>
          <span className={styles.xsycoinTitle}>{title}</span>
          <span className={styles.xsycoinYear}>{year}</span>
        </span>
      </div>
    );
  }

  return (
    <div className={styles.cover} role="img" aria-label={`${title}, ${year}`}>
      <span className={styles.index} aria-hidden="true">
        {index}
      </span>
      <span className={styles.meta}>
        <span className={styles.title}>{title}</span>
        <span className={styles.year}>{year}</span>
      </span>
    </div>
  );
}
