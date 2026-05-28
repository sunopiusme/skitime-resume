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
        <h3 className={styles.stageTitle}>Откуда взята рамка</h3>
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

export function LabCapabilityMatrix({ caption }: { caption?: string }) {
  return (
    <div className={styles.figure} aria-label="Этап 02: матрица признаков">
      <header className={styles.stageHeader}>
        <p className={styles.stageEyebrow}>Этап 02</p>
        <div className={styles.stageHeadline}>
          <h3 className={styles.stageTitle}>Что ADE обязан показывать</h3>
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
      {caption ? <p className={styles.matrixNote}>{caption}</p> : null}
    </div>
  );
}

export function LabFrictionRadar({ caption }: { caption?: string }) {
  const points = frictionSignals
    .map((signal, index) => radarPoint(index, signal.score))
    .join(" ");

  return (
    <div className={styles.figure} aria-label="Этап 03: радар трения">
      <header className={styles.stageHeader}>
        <p className={styles.stageEyebrow}>Этап 03</p>
        <div className={styles.stageHeadline}>
          <h3 className={styles.stageTitle}>Где автономность начинает стоить дорого</h3>
        </div>
      </header>
      <div className={styles.radarLayout}>
        <div className={styles.radarPanel}>
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
          {caption ? <p className={styles.radarCaption}>{caption}</p> : null}
        </div>
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
  const activeIndex = 1;

  /* Геометрия сцены сохранена точь-в-точь, как раньше.
     viewBox -230..230 (=460), сфера R=120 в центре (0,0).
     Станции лежат на orbit-окружности R_ORBIT=120; leader-линии
     уходят радиально наружу до R_LEAD=136, где приземляется
     anchor подписи. Подписи в DOM позиционируются от центра .disk
     через CSS-% от полной диагонали viewBox (460). */
  const R_ORBIT = 120;
  const R_LEAD = 136;
  const LABEL_R_RATIO = R_LEAD / 460;
  const BULLET_GAP = 5;

  const stations = workflowSteps.map((step, index) => {
    const angleDeg = -90 + index * stepAngle;
    const angleRad = (angleDeg * Math.PI) / 180;
    const cosA = Math.cos(angleRad);
    const sinA = Math.sin(angleRad);
    const bullet = { x: cosA * R_ORBIT, y: sinA * R_ORBIT };
    const leaderStart = {
      x: cosA * (R_ORBIT + BULLET_GAP),
      y: sinA * (R_ORBIT + BULLET_GAP),
    };
    const anchor = { x: cosA * R_LEAD, y: sinA * R_LEAD };
    return { step, index, angleDeg, cosA, sinA, bullet, leaderStart, anchor };
  });

  const active = stations[activeIndex]!;
  const nextIndex = (activeIndex + 1) % total;
  const next = stations[nextIndex]!;

  /* Активная dwell-зона: дуговой сектор вокруг текущей
     станции от центра до orbit'а. Прямая аналогия
     radar polygon'а из этапа 03: fill rgba(255,255,255,0.08),
     stroke ink 1px. Sector шире одного шага не делаем,
     чтобы не уезжать в соседние станции. */
  const dwellHalf = stepAngle / 2;
  const dwellStart = (active.angleDeg - dwellHalf) * (Math.PI / 180);
  const dwellEnd = (active.angleDeg + dwellHalf) * (Math.PI / 180);
  const dwellP0 = {
    x: Math.cos(dwellStart) * R_ORBIT,
    y: Math.sin(dwellStart) * R_ORBIT,
  };
  const dwellP1 = {
    x: Math.cos(dwellEnd) * R_ORBIT,
    y: Math.sin(dwellEnd) * R_ORBIT,
  };
  const dwellPath = `M 0 0 L ${dwellP0.x.toFixed(2)} ${dwellP0.y.toFixed(2)} A ${R_ORBIT} ${R_ORBIT} 0 0 1 ${dwellP1.x.toFixed(2)} ${dwellP1.y.toFixed(2)} Z`;

  return (
    <div className={styles.figure} aria-label="Этап 04: блюпринт-сфера процесса">
      <header className={styles.stageHeader}>
        <p className={styles.stageEyebrow}>Этап 04</p>
        <div className={styles.stageHeadline}>
          <h3 className={styles.stageTitle}>Петля работы, которую можно проверить</h3>
        </div>
      </header>

      {/* Orbital sphere — radar language.
          Рендеринг приведён к языку радара (этап 03):
          • wireframe-линии — единый stroke hairline-strong,
            как кольца и спицы радара;
          • активная dwell-зона — заливка rgba(255,255,255,0.08)
            с белым stroke 1px, как polygon радара;
          • никакой grid-подложки и solid-grey палитры. */}
      <div className={styles.diskFrame}>
        <div className={`${styles.disk} ${styles.diskRadar}`} aria-hidden="false">
          <svg
            className={styles.diskRings}
            viewBox="-230 -230 460 460"
            preserveAspectRatio="xMidYMid meet"
            aria-hidden="true"
          >
            <defs>
              <marker
                id="diskFlowArrow"
                viewBox="0 0 10 10"
                refX="8"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto-start-reverse"
              >
                <path d="M 0 0 L 10 5 L 0 10 Z" fill="currentColor" />
              </marker>
            </defs>

            {/* Wireframe сферы — три параллели и три
                меридиана. Все линии выровнены по одному
                stroke (как кольца радара): без выделения
                экватора отдельной толщиной. */}
            <g className={styles.diskWire}>
              <ellipse cx="0" cy="-90" rx="79.4" ry="16" />
              <ellipse cx="0" cy="0" rx="120" ry="32" />
              <ellipse cx="0" cy="90" rx="79.4" ry="16" />
              <ellipse cx="0" cy="0" rx="120" ry="120" />
              <ellipse cx="0" cy="0" rx="40" ry="120" transform="rotate(60)" />
              <ellipse cx="0" cy="0" rx="40" ry="120" transform="rotate(-60)" />
            </g>

            {/* Dwell-сектор: эквивалент polygon'а радара. */}
            <path
              d={dwellPath}
              className={styles.diskDwell}
              vectorEffect="non-scaling-stroke"
            />

            {/* Leader-линии: радиальные отрезки от внешней
                кромки bullet'а до подписи-anchor.
                Неактивные — hairline-strong, активный — ink. */}
            <g className={styles.diskLeaders}>
              {stations.map((s) => {
                const isActive = s.index === activeIndex;
                return (
                  <line
                    key={`leader-${s.index}`}
                    x1={s.leaderStart.x}
                    y1={s.leaderStart.y}
                    x2={s.anchor.x}
                    y2={s.anchor.y}
                    className={isActive ? styles.diskLeaderActive : styles.diskLeader}
                    vectorEffect="non-scaling-stroke"
                  />
                );
              })}
            </g>

            {/* Flow-индикатор: тонкая дуга по orbit'у от
                активной станции к следующей со стрелкой. */}
            <path
              d={`M ${active.bullet.x.toFixed(2)} ${active.bullet.y.toFixed(2)} A ${R_ORBIT} ${R_ORBIT} 0 0 1 ${next.bullet.x.toFixed(2)} ${next.bullet.y.toFixed(2)}`}
              className={styles.diskFlow}
              vectorEffect="non-scaling-stroke"
              markerEnd="url(#diskFlowArrow)"
            />

            {/* Bullet-маркеры станций. У активной — halo. */}
            <g>
              {stations.map((s) => {
                const isActive = s.index === activeIndex;
                return (
                  <g key={`bullet-${s.index}`}>
                    {isActive && (
                      <circle
                        cx={s.bullet.x}
                        cy={s.bullet.y}
                        r="8.5"
                        className={styles.diskBulletHalo}
                        vectorEffect="non-scaling-stroke"
                      />
                    )}
                    <circle
                      cx={s.bullet.x}
                      cy={s.bullet.y}
                      r={isActive ? 4.4 : 3}
                      className={isActive ? styles.diskBulletActive : styles.diskBullet}
                      vectorEffect="non-scaling-stroke"
                    />
                  </g>
                );
              })}
            </g>

            {/* Центральная точка — фокус радара. */}
            <circle cx="0" cy="-4" r="1.8" className={styles.diskCenter} />
          </svg>

          {/* 7 станций с подписями шагов: index + label +
              detail. Anchor по 8 направлениям — DOM-метка
              «садится» на конец SVG-leader'а. */}
          {stations.map(({ step, index, cosA, sinA }) => {
            const left = `${50 + cosA * LABEL_R_RATIO * 100}%`;
            const top = `${50 + sinA * LABEL_R_RATIO * 100}%`;

            const halign: "left" | "right" | "center" =
              cosA < -0.3 ? "right" : cosA > 0.3 ? "left" : "center";
            const valign: "top" | "bottom" | "middle" =
              sinA < -0.3 ? "bottom" : sinA > 0.3 ? "top" : "middle";

            return (
              <div
                key={step.label}
                className={styles.diskStep}
                data-halign={halign}
                data-valign={valign}
                data-active={index === activeIndex}
                style={{ left, top } as CSSProperties}
              >
                <span className={styles.diskStepIndex}>{String(index + 1).padStart(2, "0")}</span>
                <strong className={styles.diskStepLabel}>{step.label}</strong>
                <span className={styles.diskStepDetail}>{step.detail}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* mobile fallback */}
      <ol className={styles.diskList} aria-label="Шаги процесса">
        {workflowSteps.map((step, index) => (
          <li
            key={`list-${step.label}`}
            className={styles.diskListItem}
            data-active={index === activeIndex}
          >
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
  /* Доказательная база как горизонтальный фан-чарт.
     Шесть рисок слева направо, каждая привязана к пункту
     evidenceStack: пара чисел (меньшее сверху, большее снизу)
     отсылает к референсу, а сверху над риской лежит caps-метка
     класса доказательства, снизу — короткое описание. */
  const pairs: ReadonlyArray<readonly [number, number]> = [
    [20, 50],
    [30, 75],
    [40, 100],
    [48, 120],
    [80, 200],
    [100, 250],
  ];

  const W = 1200;
  const padX = 80;
  const cy = 220;
  const innerW = W - padX * 2;

  const maxSpan = 150;
  const ruleSpan = maxSpan + 36;
  const ruleTop = cy - ruleSpan / 2;
  const ruleBottom = cy + ruleSpan / 2;

  const numberOffset = 18;
  const labelGap = 28;
  const detailGap = 28;

  const numberTopY = ruleTop - numberOffset;
  const labelY = numberTopY - labelGap;
  const numberBottomY = ruleBottom + numberOffset + 14;
  const detailY = numberBottomY + detailGap;

  const topPad = numberOffset + 22 + labelGap + 14;
  const bottomPad = numberOffset + 22 + detailGap + 18;
  const H = cy + maxSpan / 2 + bottomPad + (ruleSpan - maxSpan) / 2;
  const viewboxTop = cy - maxSpan / 2 - topPad - (ruleSpan - maxSpan) / 2;

  const columns = pairs.map(([lo, hi], i) => {
    const x = padX + (innerW * i) / (pairs.length - 1);
    const span = hi - lo;
    const yTop = cy - span / 2;
    const yBottom = cy + span / 2;
    const item = evidenceStack[i]!;
    return { x, yTop, yBottom, lo, hi, item };
  });

  const left = columns[0]!;
  const right = columns[columns.length - 1]!;

  const lineCount = 56;
  const fanLines = Array.from({ length: lineCount }, (_, i) => {
    const t = i / (lineCount - 1);
    const y1 = left.yTop + t * (left.yBottom - left.yTop);
    const y2 = right.yTop + t * (right.yBottom - right.yTop);
    return { y1, y2 };
  });

  return (
    <div className={styles.figure} aria-label="Этап 05: доказательная база">
      <header className={styles.stageHeader}>
        <p className={styles.stageEyebrow}>Этап 05</p>
        <div className={styles.stageHeadline}>
          <h3 className={styles.stageTitle}>Что делает работу пригодной для ревью</h3>
        </div>
      </header>

      <div className={styles.evidenceFan}>
        <svg
          className={styles.evidenceFanSvg}
          viewBox={`0 ${viewboxTop} ${W} ${H - viewboxTop}`}
          role="img"
          aria-hidden="true"
          preserveAspectRatio="xMidYMid meet"
        >
          <g className={styles.evidenceFanBeam}>
            {fanLines.map((line, i) => (
              <line
                key={i}
                x1={left.x}
                y1={line.y1}
                x2={right.x}
                y2={line.y2}
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
                y1={ruleTop}
                x2={col.x}
                y2={ruleBottom}
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
                y={numberTopY}
                textAnchor="middle"
                className={styles.evidenceFanNumberSvg}
              >
                {col.lo}
              </text>
              <text
                x={col.x}
                y={numberBottomY}
                textAnchor="middle"
                className={styles.evidenceFanNumberSvg}
              >
                {col.hi}
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
