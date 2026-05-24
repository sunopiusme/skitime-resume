import styles from "./ProjectCover.module.css";

type Props = {
  title: string;
  eyebrow: string;
};

/**
 * Плоский постер проекта: заливает свою ячейку без рамки и фона.
 * Композиция в две зоны — крупный заголовок и тонкая категория.
 * Номер и год специально не дублируем: они уже есть в своих колонках.
 */
export default function ProjectCover({ title, eyebrow }: Props) {
  return (
    <div className={styles.cover} role="img" aria-label={title}>
      <span className={styles.title}>{title}</span>
      <span className={styles.eyebrow}>{eyebrow}</span>
    </div>
  );
}
