"use client";

import { useEffect, useRef, useState } from "react";

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

const BASE_RADAR_SCORES = frictionSignals.map((signal) => signal.score);

const RADAR_PROFILES: Record<string, readonly number[]> = {
  "стоимость и лимиты": [4.5, 3.2, 3.6, 2.8, 3.4, 4.2],
  "риск доверия": [3.2, 4.8, 4.4, 4.1, 4.7, 3.6],
  "потеря контекста": [3.7, 4.4, 4.7, 3.6, 4.1, 4],
  "ошибки доступа": [2.9, 4.1, 3.5, 4.6, 3.8, 3.7],
  "нагрузка ревью": [3.3, 4.6, 4, 3.6, 4.8, 4.2],
  "разрыв процесса": [4, 3.5, 4.2, 3.7, 4.3, 4.6],
};

function easeOutCubic(progress: number) {
  return 1 - Math.pow(1 - progress, 3);
}

function useAnimatedRadarScores(targetScores: readonly number[]) {
  const scoresRef = useRef<readonly number[]>(targetScores);
  const [scores, setScores] = useState(() => [...targetScores]);

  useEffect(() => {
    const from = [...scoresRef.current];
    const startedAt = window.performance.now();
    const duration = 260;
    let frame = 0;

    const tick = (now: number) => {
      const progress = Math.min((now - startedAt) / duration, 1);
      const eased = easeOutCubic(progress);
      const next = targetScores.map((target, index) => {
        const start = from[index] ?? target;
        return start + (target - start) * eased;
      });

      scoresRef.current = next;
      setScores(next);

      if (progress < 1) {
        frame = window.requestAnimationFrame(tick);
      }
    };

    frame = window.requestAnimationFrame(tick);

    return () => window.cancelAnimationFrame(frame);
  }, [targetScores]);

  return scores;
}

function radarCoords(index: number, score: number) {
  const angle = -90 + (360 / frictionSignals.length) * index;
  const radius = 22 + score * 13;
  const rad = (angle * Math.PI) / 180;
  const x = 110 + Math.cos(rad) * radius;
  const y = 110 + Math.sin(rad) * radius;
  return { x, y };
}

function radarPoint(index: number, score: number) {
  const { x, y } = radarCoords(index, score);
  return `${x.toFixed(1)},${y.toFixed(1)}`;
}

function radarLabelCoords(index: number) {
  return radarCoords(index, index === 0 ? 6.35 : 5.72);
}

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
  const [activeSignal, setActiveSignal] = useState<string | null>(null);
  const targetScores = activeSignal
    ? RADAR_PROFILES[activeSignal] ?? BASE_RADAR_SCORES
    : BASE_RADAR_SCORES;
  const displayScores = useAnimatedRadarScores(targetScores);
  const activeShortLabel =
    frictionSignals.find((signal) => signal.label === activeSignal)?.shortLabel ?? null;
  const points = displayScores.map((score, index) => radarPoint(index, score)).join(" ");

  return (
    <div className={styles.figure} aria-label="Радар трения">
      <div className={styles.radarLayout}>
        <div className={styles.radarPanel}>
          <svg
            className={styles.radar}
            viewBox="0 0 220 220"
            role="img"
            aria-label="Качественный радар трения"
          >
            <circle cx="110" cy="110" r="35" />
            <circle cx="110" cy="110" r="61" className={styles.radarThreshold} />
            <circle cx="110" cy="110" r="87" />
            {frictionSignals.map((signal, index) => {
              const outer = radarPoint(index, 5);
              const [x, y] = outer.split(",");
              return <line key={signal.label} x1="110" y1="110" x2={x} y2={y} />;
            })}
            <polygon className={styles.radarShape} points={points} />
            <text x="110" y="103" textAnchor="middle" className={styles.radarCore}>
              {activeShortLabel ?? "контроль"}
            </text>
            <text x="110" y="119" textAnchor="middle" className={styles.radarCoreSub}>
              {activeShortLabel ? "профиль риска" : "автономность"}
            </text>
            {frictionSignals.map((signal, index) => {
              const point = radarCoords(index, displayScores[index] ?? signal.score);
              const label = radarLabelCoords(index);
              const anchor =
                label.x < 92 ? "end" : label.x > 128 ? "start" : "middle";

              return (
                <g
                  key={signal.label}
                  className={styles.radarNode}
                  data-active={signal.label === activeSignal ? "true" : undefined}
                >
                  <circle
                    cx={point.x.toFixed(1)}
                    cy={point.y.toFixed(1)}
                    r="3.8"
                    className={styles.radarPoint}
                  />
                  <text
                    x={label.x.toFixed(1)}
                    y={label.y.toFixed(1)}
                    textAnchor={anchor}
                    className={styles.radarLabel}
                  >
                    {signal.shortLabel}
                  </text>
                  <text
                    x={label.x.toFixed(1)}
                    y={(label.y + 10).toFixed(1)}
                    textAnchor={anchor}
                    className={styles.radarScore}
                  >
                    {signal.score}/5
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
        <div className={styles.frictionList}>
          {frictionSignals.map((signal) => (
            <button
              key={signal.label}
              className={styles.frictionItem}
              type="button"
              aria-pressed={signal.label === activeSignal}
              data-active={signal.label === activeSignal ? "true" : undefined}
              onBlur={() => setActiveSignal(null)}
              onClick={() => setActiveSignal(signal.label)}
              onFocus={() => setActiveSignal(signal.label)}
              onPointerEnter={() => setActiveSignal(signal.label)}
              onPointerLeave={() => setActiveSignal(null)}
            >
              <span className={styles.frictionHead}>
                <strong>{signal.label}</strong>
                <span>{signal.score}/5</span>
              </span>
              <p>{signal.evidence}</p>
            </button>
          ))}
        </div>
      </div>
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
