import type { ReactNode } from "react";

import styles from "./InlineFigure.module.css";

type Props = {
  label?: string;
  caption?: ReactNode;
  variant?: "inline" | "wide";
  frame?: "bordered" | "plain";
  children: ReactNode;
};

export default function InlineFigure({
  label,
  caption,
  variant = "inline",
  frame = "bordered",
  children,
}: Props) {
  const stageClass = frame === "plain" ? styles.stagePlain : styles.stage;
  return (
    <figure className={`${styles.figure} ${variant === "wide" ? styles.wide : ""}`}>
      {label ? <figcaption className={styles.label}>{label}</figcaption> : null}
      <div className={stageClass}>{children}</div>
      {caption ? <figcaption className={styles.caption}>{caption}</figcaption> : null}
    </figure>
  );
}
