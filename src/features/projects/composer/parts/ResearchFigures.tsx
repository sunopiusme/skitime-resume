"use client";

import {
  capabilities,
  evidenceStack,
  frictionSignals,
  researchSources,
  workflowSteps,
  type ResearchSourceType,
} from "@/content/projects/composer/research";

import styles from "./ResearchFigures.module.css";

const SOURCE_TYPE_LABELS: Record<ResearchSourceType, string> = {
  official: "официальные",
  community: "сообщество",
  academic: "академические",
  category: "категория",
};

const SOURCE_TYPE_RANK: Record<ResearchSourceType, number> = {
  official: 4,
  academic: 4,
  category: 3,
  community: 2,
};

export function LabSourceMap() {
  return (
    <div className={styles.figure} aria-label="Карта источников">
      <div className={styles.sourceTable}>
        <div className={styles.sourceTableHead} aria-hidden="true">
          <span>Источник</span>
          <span>Тип</span>
          <span>Поверхность</span>
          <span>Сигнал</span>
          <span />
        </div>
        <div className={styles.sourceList} role="list">
          {researchSources.map((source) => (
            <a
              key={source.id}
              className={styles.sourceRow}
              href={source.url}
              role="listitem"
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className={styles.sourceName} title={source.name}>
                {source.name}
              </span>
              <span
                className={styles.sourceType}
                data-type={source.type}
                title={`вес источника ${SOURCE_TYPE_RANK[source.type]}/4`}
              >
                {SOURCE_TYPE_LABELS[source.type]}
              </span>
              <span className={styles.sourceSurface}>{source.surface}</span>
              <span className={styles.sourceSignal}>{source.signal}</span>
              <svg
                className={styles.sourceLinkIcon}
                viewBox="0 0 14 14"
                width="12"
                height="12"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M3 11L11 3M11 3H4.5M11 3V9.5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

export function LabCapabilityMatrix() {
  return (
    <div className={styles.figure} aria-label="Матрица признаков">
      <div className={styles.matrix}>
        <span className={`${styles.cell} ${styles.blank}`} />
        {capabilities.map((capability) => (
          <span key={capability.key} className={`${styles.cell} ${styles.axis}`}>
            {capability.label}
          </span>
        ))}
        {researchSources.map((source) => (
          <div key={source.id} className={styles.matrixRow}>
            <span className={`${styles.cell} ${styles.toolName}`}>{source.name}</span>
            {capabilities.map((capability) => {
              const active = source.coded.includes(capability.key);
              return (
                <span
                  key={`${source.id}-${capability.key}`}
                  className={`${styles.cell} ${styles.signalCell}`}
                  data-active={active}
                  aria-label={`${capability.label}: ${active ? "есть сигнал" : "не ключевой сигнал"}`}
                >
                  <span
                    className={active ? styles.signalDot : styles.signalDash}
                    aria-hidden="true"
                  />
                </span>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

export function LabFrictionRadar() {
  /* Паутина заменена спокойным списком горизонтальных шкал:
     название сигнала, оценка, тонкая полоса с заполнением по
     score и описание. Никакого hover-состояния и SVG-геометрии —
     фигура читается сверху вниз, как остальной кейс. */
  return (
    <div className={styles.figure} aria-label="Сигналы трения">
      <ul className={styles.frictionScaleList}>
        {frictionSignals.map((signal) => (
          <li key={signal.label} className={styles.frictionScaleItem}>
            <span className={styles.frictionHead}>
              <strong>{signal.label}</strong>
              <span>{signal.score}/5</span>
            </span>
            <span
              className={styles.frictionTrack}
              role="img"
              aria-label={`Оценка ${signal.score} из 5`}
            >
              <span
                className={styles.frictionFill}
                style={{ width: `${(signal.score / 5) * 100}%` }}
              />
            </span>
            <p>{signal.evidence}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function LabWorkflowDisk() {
  const activeIndex = 4;

  /* Вместо оси и кривой — накопление следов. Каждая стадия —
     стопка тонких hairline-рисок над своей колонкой рейла:
     чем дальше по workflow, тем больше артефактов можно
     проверить. Рост читается силуэтом стопок, поэтому фигуре
     не нужны ни подписи осей, ни сетка. Количество рисок
     растёт нелинейно — доказательства накапливаются лавинно
     после получения доступа (04). */
  const tallies = [3, 5, 8, 12, 17, 22, 26] as const;

  return (
    <div className={styles.figure} aria-label="Проверяемость workflow">
      <div className={styles.workflowBoard}>
        <div className={styles.workflowTallyField} aria-hidden="true">
          {tallies.map((count, index) => (
            <div
              key={workflowSteps[index]!.label}
              className={styles.workflowTallyColumn}
              data-active={index === activeIndex}
            >
              {Array.from({ length: count }, (_, tick) => (
                <span key={tick} className={styles.workflowTallyTick} />
              ))}
            </div>
          ))}
        </div>

        <div className={styles.workflowStageRail}>
          {workflowSteps.map((step, index) => (
            <div
              key={step.label}
              className={styles.workflowStage}
              data-active={index === activeIndex}
            >
              <span className={styles.workflowStageHead}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <strong>{step.label}</strong>
              </span>
              <p>{step.detail}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function LabEvidenceStack() {
  /* Доказательная база как горизонтальная фан-лента.
     Шесть рисок слева направо — по одной на каждый класс
     доказательства. Высота риски кодирует силу доказательства
     (strength из research.ts), лента из тонких линий проходит
     через все колонки и «дышит» вместе с данными: видно, как
     доказательная база набирает вес от лога сессии к PR.
     Колонки стоят ровно в центрах шести равных долей viewBox
     (80 + 160·i), чтобы HTML-рейл подписей под графиком
     совпадал с рисками по X — как workflowStageRail
     совпадает с узлами своего графика. */
  const W = 960;
  const padX = 80;
  const cy = 190;
  const innerW = W - padX * 2;

  const spanFor = (strength: number) => 40 + (strength - 1) * 28;
  const maxSpan = spanFor(5);

  const columns = evidenceStack.map((item, i) => {
    const x = padX + (innerW * i) / (evidenceStack.length - 1);
    const span = spanFor(item.strength);
    return { x, yTop: cy - span / 2, yBottom: cy + span / 2, item };
  });

  const labelY = cy - maxSpan / 2 - 56;
  const strengthY = labelY + 22;

  const viewTop = labelY - 14;
  const viewBottom = cy + maxSpan / 2 + 16;

  const lineCount = 36;
  const ribbons = Array.from({ length: lineCount }, (_, lineIndex) => {
    const t = lineIndex / (lineCount - 1);
    return columns
      .map((col) => `${col.x},${(col.yTop + t * (col.yBottom - col.yTop)).toFixed(1)}`)
      .join(" ");
  });

  return (
    <div className={styles.figure} aria-label="Доказательная база">
      <div className={styles.evidenceFan}>
        <svg
          className={styles.evidenceFanSvg}
          viewBox={`0 ${viewTop} ${W} ${viewBottom - viewTop}`}
          role="img"
          aria-hidden="true"
          preserveAspectRatio="xMidYMid meet"
        >
          <g className={styles.evidenceFanBeam}>
            {ribbons.map((points, i) => (
              <polyline
                key={i}
                points={points}
                fill="none"
                stroke="currentColor"
                strokeWidth={0.5}
                strokeLinecap="round"
              />
            ))}
          </g>

          {columns.map((col, i) => (
            <g key={i} className={styles.evidenceFanRule}>
              <line
                x1={col.x}
                y1={col.yTop}
                x2={col.x}
                y2={col.yBottom}
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="square"
              />
              <text
                x={col.x}
                y={labelY}
                textAnchor="middle"
                className={styles.evidenceFanLabelSvg}
              >
                {col.item.label}
              </text>
              <text
                x={col.x}
                y={strengthY}
                textAnchor="middle"
                className={styles.evidenceFanNumberSvg}
              >
                {col.item.strength}/5
              </text>
            </g>
          ))}
        </svg>

        {/* Нижние подписи — HTML-рейл из шести равных колонок,
            а не SVG-тексты: центры колонок совпадают с рисками
            (80 + 160·i), поэтому подписи стоят ровно под своими
            колонками, а промежутки между ними одинаковые —
            без рваных зазоров SVG-версии. */}
        <ul className={styles.evidenceRail} aria-hidden="true">
          {evidenceStack.map((item) => (
            <li key={item.label}>{item.detail}</li>
          ))}
        </ul>

        <ul className={styles.srOnly} aria-label="Доказательная база">
          {evidenceStack.map((item) => (
            <li key={item.label}>
              {item.label}: {item.detail} (сила {item.strength} из 5)
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
