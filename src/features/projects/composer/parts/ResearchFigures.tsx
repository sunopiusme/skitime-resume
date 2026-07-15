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

  /* ── Геометрия ──────────────────────────
     Узлы стоят в центрах семи колонок legend-рейла
     (вьюпорт 960 / 7 колонок, рейл с gap 0): график и
     подписи делят одну координатную систему — узел 05
     стоит ровно над колонкой «выполнение». Ось X не
     нужна, её роль играет сам рейл. */
  const BASE_Y = 304;
  const nodes = [
    { x: 69, y: 272 },
    { x: 206, y: 244 },
    { x: 343, y: 210 },
    { x: 480, y: 172 },
    { x: 617, y: 122 },
    { x: 754, y: 92 },
    { x: 891, y: 72 },
  ] as const;

  /* Монотонная кривая с горизонтальными касательными в каждом
     узле (control points смещены только по X): подъём читается
     как спокойные ступени — без волнистости свободных безье. */
  const graphPath = nodes
    .map((point, index) => {
      if (index === 0) return `M ${point.x} ${point.y}`;
      const prev = nodes[index - 1]!;
      const c = Math.round((point.x - prev.x) * 0.45);
      return `C ${prev.x + c} ${prev.y}, ${point.x - c} ${point.y}, ${point.x} ${point.y}`;
    })
    .join(" ");
  const first = nodes[0]!;
  const last = nodes[nodes.length - 1]!;
  const graphArea = `${graphPath} L ${last.x} ${BASE_Y} L ${first.x} ${BASE_Y} Z`;
  const active = nodes[activeIndex]!;

  return (
    <div className={styles.figure} aria-label="Проверяемость workflow">
      <div className={styles.workflowBoard}>
        <svg
          className={styles.workflowChart}
          viewBox="0 0 960 340"
          role="img"
          aria-label="Проверяемость растет от намерения к ревью"
        >
          <defs>
            <linearGradient id="workflowAreaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="currentColor" stopOpacity="0.14" />
              <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
            </linearGradient>
          </defs>

          <text x="20" y="34" className={styles.workflowChartAxisLabel}>
            проверяемость
          </text>
          <text
            x="940"
            y="336"
            textAnchor="end"
            className={styles.workflowChartAxisLabel}
          >
            решение человека
          </text>

          {/* Единственная опорная линия фигуры — базовая ось.
              Сетка, вертикали и пунктирные сбросы убраны: рост
              кривой виден и без них, а стадии подписаны прямо
              под узлами. */}
          <path d={`M 20 ${BASE_Y} H 940`} className={styles.workflowChartAxis} />

          <path d={graphArea} className={styles.workflowGraphArea} />
          <path d={graphPath} className={styles.workflowGraphLine} />

          {/* Связка с легендой: тонкая вертикаль от активного
              узла до оси — взгляд сам спускается к колонке 05. */}
          <line
            x1={active.x}
            y1={active.y + 16}
            x2={active.x}
            y2={BASE_Y}
            className={styles.workflowActiveDrop}
          />

          {nodes.map((point, index) => {
            const step = workflowSteps[index]!;
            const isActive = index === activeIndex;

            return (
              <g
                key={step.label}
                className={styles.workflowGraphPoint}
                data-active={isActive}
              >
                {isActive ? (
                  <circle
                    cx={point.x}
                    cy={point.y}
                    r="11"
                    className={styles.workflowGraphRing}
                  />
                ) : null}
                <circle
                  cx={point.x}
                  cy={point.y}
                  r={isActive ? 5 : 4}
                  className={styles.workflowGraphNode}
                />
              </g>
            );
          })}
        </svg>

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
     доказательная база набирает вес от лога сессии к PR. */
  const W = 960;
  const padX = 64;
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
  const detailY = cy + maxSpan / 2 + 36;

  const viewTop = labelY - 14;
  const viewBottom = detailY + 18;

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
              <text
                x={col.x}
                y={detailY}
                textAnchor="middle"
                className={styles.evidenceFanDetailSvg}
              >
                {col.item.detail}
              </text>
            </g>
          ))}
        </svg>

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
