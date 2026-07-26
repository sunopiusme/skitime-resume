import type { ReactNode } from "react";

import styles from "./BlueprintStage.module.css";

const MAJOR = 48;
const CARD_W = 720;
const CARD_H = 480;

const LABEL_STEP = MAJOR * 2;

const xLabels = Array.from(
  { length: CARD_W / LABEL_STEP + 1 },
  (_, position) => position * LABEL_STEP,
);

const yLabels = Array.from(
  { length: CARD_H / LABEL_STEP },
  (_, position) => (position + 1) * LABEL_STEP,
);

const SEGMENTS = [
  { key: "pad-left", size: 24, labelled: false },
  { key: "wallet", size: 304, labelled: true },
  { key: "gap", size: 24, labelled: false },
  { key: "pane", size: 344, labelled: true },
  { key: "pad-right", size: 24, labelled: false },
];

export default function BlueprintStage({ children }: { children: ReactNode }) {
  return (
    <div className={styles.stage}>
      <div className={styles.gridLayer} aria-hidden="true" />

      <div className={styles.rulerX} aria-hidden="true">
        {xLabels.map((value) => (
          <span
            key={value}
            className={styles.labelX}
            style={{ left: `${value}px` }}
          >
            {value}
          </span>
        ))}
      </div>

      <div className={styles.rulerY} aria-hidden="true">
        {yLabels.map((value) => (
          <span
            key={value}
            className={styles.labelY}
            style={{ top: `${value}px` }}
          >
            {value}
          </span>
        ))}
      </div>

      <div className={styles.cell}>{children}</div>

      <div className={styles.dims} aria-hidden="true">
        {SEGMENTS.map((segment) => (
          <span
            key={segment.key}
            className={styles.dim}
            style={{ width: `${segment.size}px` }}
          >
            {segment.labelled ? segment.size : null}
          </span>
        ))}
      </div>
    </div>
  );
}
