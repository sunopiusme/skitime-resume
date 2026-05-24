import type { CSSProperties } from "react";

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

function radarPoint(index: number, score: number) {
  const angle = -90 + (360 / frictionSignals.length) * index;
  const radius = 22 + score * 13;
  const rad = (angle * Math.PI) / 180;
  const x = 110 + Math.cos(rad) * radius;
  const y = 110 + Math.sin(rad) * radius;
  return `${x.toFixed(1)},${y.toFixed(1)}`;
}

export function LabSourceMap() {
  const totalsLabel = `${researchSources.length} источников`;

  return (
    <div className={styles.figure} aria-label="Этап 01: карта источников">
      <header className={styles.stageHeader}>
        <div className={styles.stageHeaderTop}>
          <p className={styles.stageEyebrow}>Этап 01</p>
          <span className={styles.stageHeaderMeta}>{totalsLabel}</span>
        </div>
        <h3 className={styles.stageTitle}>Источники, на которых построен кейс</h3>
      </header>

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
                title={`надёжность ${SOURCE_TYPE_RANK[source.type]}/4`}
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
    <div className={styles.figure} aria-label="Этап 02: матрица признаков">
      <header className={styles.stageHeader}>
        <p className={styles.stageEyebrow}>Этап 02</p>
        <div className={styles.stageHeadline}>
          <h3 className={styles.stageTitle}>Какие способности повторяются у ADE</h3>
        </div>
      </header>
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
                  aria-label={`${capability.label}: ${active ? "наблюдается" : "не главный признак"}`}
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
  const points = frictionSignals
    .map((signal, index) => radarPoint(index, signal.score))
    .join(" ");

  return (
    <div className={styles.figure} aria-label="Этап 03: радар трения">
      <header className={styles.stageHeader}>
        <p className={styles.stageEyebrow}>Этап 03</p>
        <div className={styles.stageHeadline}>
          <h3 className={styles.stageTitle}>Где автономная работа упирается в реальность</h3>
        </div>
      </header>
      <div className={styles.radarLayout}>
        <svg className={styles.radar} viewBox="0 0 220 220" role="img" aria-label="Качественный радар трения">
          <circle cx="110" cy="110" r="35" />
          <circle cx="110" cy="110" r="61" />
          <circle cx="110" cy="110" r="87" />
          {frictionSignals.map((signal, index) => {
            const outer = radarPoint(index, 5);
            const [x, y] = outer.split(",");
            return <line key={signal.label} x1="110" y1="110" x2={x} y2={y} />;
          })}
          <polygon points={points} />
        </svg>
        <div className={styles.frictionList}>
          {frictionSignals.map((signal) => (
            <div key={signal.label} className={styles.frictionItem}>
              <span className={styles.frictionHead}>
                <strong>{signal.label}</strong>
                <span>{signal.score}/5</span>
              </span>
              <p>{signal.evidence}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function LabWorkflowDisk() {
  const total = workflowSteps.length;
  const stepAngle = 360 / total;

  return (
    <div className={styles.figure} aria-label="Этап 04: диск процесса">
      <header className={styles.stageHeader}>
        <p className={styles.stageEyebrow}>Этап 04</p>
        <div className={styles.stageHeadline}>
          <h3 className={styles.stageTitle}>Петля доказательной работы ADE</h3>
        </div>
      </header>

      {/* desktop disk */}
      <div className={styles.disk} aria-hidden="false">
        <svg
          className={styles.diskRings}
          viewBox="-100 -100 200 200"
          preserveAspectRatio="xMidYMid meet"
          aria-hidden="true"
        >
          <circle cx="0" cy="0" r="92" />
          <circle cx="0" cy="0" r="64" />
          <circle cx="0" cy="0" r="34" />
          {workflowSteps.map((step, index) => {
            const a = (-90 + index * stepAngle) * (Math.PI / 180);
            const x = Math.cos(a) * 78;
            const y = Math.sin(a) * 78;
            return (
              <line
                key={`tick-${step.label}`}
                x1={Math.cos(a) * 34}
                y1={Math.sin(a) * 34}
                x2={x}
                y2={y}
              />
            );
          })}
        </svg>

        <div className={styles.diskCore}>
          <span>ADE</span>
          <strong>петля доказательной работы</strong>
        </div>

        {workflowSteps.map((step, index) => {
          const a = (-90 + index * stepAngle) * (Math.PI / 180);
          const left = `${50 + Math.cos(a) * 38}%`;
          const top = `${50 + Math.sin(a) * 38}%`;
          return (
            <div
              key={step.label}
              className={styles.diskStep}
              style={{ left, top } as CSSProperties}
            >
              <span className={styles.diskStepIndex}>{String(index + 1).padStart(2, "0")}</span>
              <div className={styles.diskStepBody}>
                <strong>{step.label}</strong>
                <span>{step.detail}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* mobile fallback */}
      <ol className={styles.diskList} aria-label="Шаги процесса">
        {workflowSteps.map((step, index) => (
          <li key={`list-${step.label}`} className={styles.diskListItem}>
            <span className={styles.diskListIndex}>{String(index + 1).padStart(2, "0")}</span>
            <div>
              <strong>{step.label}</strong>
              <span>{step.detail}</span>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

export function LabEvidenceStack() {
  return (
    <div className={styles.figure} aria-label="Этап 05: доказательная база">
      <header className={styles.stageHeader}>
        <p className={styles.stageEyebrow}>Этап 05</p>
        <div className={styles.stageHeadline}>
          <h3 className={styles.stageTitle}>Чем агентная работа становится проверяемой</h3>
        </div>
      </header>
      <div className={styles.stack}>
        {evidenceStack.map((item) => (
          <div key={item.label} className={styles.stackRow}>
            <span className={styles.stackLabel}>{item.label}</span>
            <span className={styles.stackDetail}>{item.detail}</span>
            <span
              className={styles.stackStrength}
              aria-label={`сила доказательства ${item.strength} из 5`}
            >
              <span aria-hidden="true">{"●".repeat(item.strength)}</span>
              <span aria-hidden="true" className={styles.stackStrengthDim}>
                {"○".repeat(5 - item.strength)}
              </span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
