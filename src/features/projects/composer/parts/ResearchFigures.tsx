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

  /* Геометрия сцены.
     viewBox -230..230 (=460), сфера R=120 в центре (0,0).
     Станции лежат на orbit-окружности R_ORBIT=120; их
     leader-линии уходят радиально наружу до R_LEAD=180,
     где приземляется anchor для подписи. Подписи в DOM
     позиционируются от центра .disk через CSS-%: SVG 1:1
     мапится в квадратный .disk, поэтому ratio считается
     от полной диагонали viewBox (460), а не от её половины. */
  const R_ORBIT = 120;
  const R_LEAD = 136;
  const LABEL_R_RATIO = R_LEAD / 460;

  /* Leader стартует не из центра bullet'а, а с небольшим
     зазором за его внешней кромкой — иначе линия и точка
     визуально «сшиваются» и выноска теряется. */
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

  /* Активная станция и следующая по обходу — между ними
     рисуем короткую arc-стрелку (flow indicator). */
  const active = stations[activeIndex]!;
  const nextIndex = (activeIndex + 1) % total;
  const next = stations[nextIndex]!;

  return (
    <div className={styles.figure} aria-label="Этап 04: блюпринт-сфера процесса">
      <header className={styles.stageHeader}>
        <p className={styles.stageEyebrow}>Этап 04</p>
        <div className={styles.stageHeadline}>
          <h3 className={styles.stageTitle}>Петля работы, которую можно проверить</h3>
        </div>
      </header>

      {/* Blueprint orbital sphere.
          Палитра solid greys (без alpha) — линии не
          накапливают плотность на пересечениях:
          • #2c2c2c — major grid;
          • #555555 — bounding chrome и сноска;
          • #6e6e6e — wireframe сферы;
          • #aaaaaa — leader-линии и mono-метки;
          • #f5f5f5 — активная станция и flow-стрелка. */}
      <div className={styles.diskFrame}>
      <div className={styles.disk} aria-hidden="false">
        <svg
          className={styles.diskRings}
          viewBox="-230 -230 460 460"
          preserveAspectRatio="xMidYMid meet"
          aria-hidden="true"
        >
          <defs>
            {/* Только major-сетка: minor-grid убран,
                чтобы за wireframe'ом не «звенел» шум. */}
            <pattern
              id="diskGridMajor"
              width="100"
              height="100"
              patternUnits="userSpaceOnUse"
              x="0"
              y="0"
            >
              <path
                d="M 100 0 L 0 0 0 100"
                fill="none"
                stroke="#2c2c2c"
                strokeWidth="0.75"
                vectorEffect="non-scaling-stroke"
              />
            </pattern>
            <marker
              id="diskFlowArrow"
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 0 L 10 5 L 0 10 Z" fill="#f5f5f5" />
            </marker>
          </defs>

          <rect x="-230" y="-230" width="460" height="460" fill="url(#diskGridMajor)" />

          {/* Wireframe сферы — три параллели и три
              меридиана. Equator чуть толще: это
              единственная линия, которая принимает
              на себя bullet-маркеры станций. */}
          <ellipse
            cx="0"
            cy="-90"
            rx="79.4"
            ry="16"
            fill="none"
            stroke="#6e6e6e"
            strokeWidth="1"
            vectorEffect="non-scaling-stroke"
          />
          <ellipse
            cx="0"
            cy="0"
            rx="120"
            ry="32"
            fill="none"
            stroke="#6e6e6e"
            strokeWidth="1.2"
            vectorEffect="non-scaling-stroke"
          />
          <ellipse
            cx="0"
            cy="90"
            rx="79.4"
            ry="16"
            fill="none"
            stroke="#6e6e6e"
            strokeWidth="1"
            vectorEffect="non-scaling-stroke"
          />

          <ellipse
            cx="0"
            cy="0"
            rx="120"
            ry="120"
            fill="none"
            stroke="#6e6e6e"
            strokeWidth="1.4"
            vectorEffect="non-scaling-stroke"
          />
          <ellipse
            cx="0"
            cy="0"
            rx="40"
            ry="120"
            fill="none"
            stroke="#6e6e6e"
            strokeWidth="0.9"
            vectorEffect="non-scaling-stroke"
            transform="rotate(60)"
          />
          <ellipse
            cx="0"
            cy="0"
            rx="40"
            ry="120"
            fill="none"
            stroke="#6e6e6e"
            strokeWidth="0.9"
            vectorEffect="non-scaling-stroke"
            transform="rotate(-60)"
          />

          {/* Leader-линии: радиальный отрезок от внешней
              кромки bullet'а до подписи-anchor. Активный
              leader — белый и толще. */}
          <g>
            {stations.map((s) => {
              const isActive = s.index === activeIndex;
              return (
                <line
                  key={`leader-${s.index}`}
                  x1={s.leaderStart.x}
                  y1={s.leaderStart.y}
                  x2={s.anchor.x}
                  y2={s.anchor.y}
                  stroke={isActive ? "#f5f5f5" : "#5a5a5a"}
                  strokeWidth={isActive ? 1.4 : 0.9}
                  vectorEffect="non-scaling-stroke"
                />
              );
            })}
          </g>

          {/* Flow-индикатор: тонкая дуга по orbit'у от
              активной станции к следующей со стрелкой.
              Это превращает «семь точек по кругу» в
              ориентированную петлю. */}
          <path
            d={`M ${active.bullet.x.toFixed(2)} ${active.bullet.y.toFixed(2)} A ${R_ORBIT} ${R_ORBIT} 0 0 1 ${next.bullet.x.toFixed(2)} ${next.bullet.y.toFixed(2)}`}
            fill="none"
            stroke="#f5f5f5"
            strokeWidth="2"
            strokeLinecap="round"
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
                      fill="none"
                      stroke="#f5f5f5"
                      strokeWidth="1"
                      vectorEffect="non-scaling-stroke"
                      opacity="0.45"
                    />
                  )}
                  <circle
                    cx={s.bullet.x}
                    cy={s.bullet.y}
                    r={isActive ? 4.4 : 3}
                    fill={isActive ? "#f5f5f5" : "#0a0a0a"}
                    stroke={isActive ? "#f5f5f5" : "#cccccc"}
                    strokeWidth={isActive ? 0 : 1.4}
                    vectorEffect="non-scaling-stroke"
                  />
                </g>
              );
            })}
          </g>

          {/* Центральная точка без дополнительной подписи:
              сам контур уже несёт идею петли. */}
          <circle cx="0" cy="-4" r="1.8" fill="#aaaaaa" />
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
     класса доказательства, снизу — короткое описание. Между
     крайними рисками плотный пучок прямых линий, который
     передаёт «расхождение» от компактного слева к развёрнутому
     справа. Никакой визуальной шкалы strength: разница пар
     20→50, 30→75 ... 100→250 уже передаёт нарастание сама. */
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

  /* Геометрия:
     - риски одинаковой высоты для всех колонок (как в референсе),
       равной размаху самой большой пары + небольшое расширение,
       чтобы они выглядели «шире самой диаграммы»;
     - фан таперит между колонками: его высота на конкретной колонке
       определяется парой (lo, hi);
     - числа ставятся в точках, где фан касается риски, поэтому
       у маленьких колонок числа ближе к центру риски, а у самой
       правой расходятся к краям. */
  const maxSpan = 150; // самая большая пара: 100→250 (250 − 100)
  const ruleSpan = maxSpan + 36; // риска чуть длиннее фана
  const ruleTop = cy - ruleSpan / 2;
  const ruleBottom = cy + ruleSpan / 2;

  /* Все подписи стоят на фиксированных горизонталях:
       label   ─── над всем
       number  ─── ближе к риске сверху
       rule    ─── одинаковая высота для всех колонок
       number  ─── ближе к риске снизу
       detail  ─── под всем
     Между собой выдержан стабильный зазор, чтобы цифры не
     налезали на caps-метки и описания, как было до этого. */
  const numberOffset = 18; // от конца риски до числа
  const labelGap = 28; // от числа до caps-метки
  const detailGap = 28; // от числа до description

  /* Фиксированные горизонтали под подписи: одна для верхнего числа,
     одна для caps-метки над ним, одна для нижнего числа и одна для
     описания под ним. Все колонки выравниваются по этим линиям,
     никаких смещений вверх/вниз вслед за длиной фана. */
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

  /* Меньше линий и тоньше штрих, чем раньше: фан читается
     как штриховка, а не серая заливка. Высокая плотность
     забивала контраст с числами и подписями. */
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
          {/* Сам фан */}
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

          {/* Колонки: одинаковые риски, фан таперит, числа и подписи
              выровнены по фиксированным горизонталям. */}
          {columns.map((col, i) => (
            <g key={i} className={styles.evidenceFanRule}>
              {/* Сама риска — единая высота для всех колонок */}
              <line
                x1={col.x}
                y1={ruleTop}
                x2={col.x}
                y2={ruleBottom}
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="square"
              />
              {/* Caps-метка */}
              <text
                x={col.x}
                y={labelY}
                textAnchor="middle"
                className={styles.evidenceFanLabelSvg}
              >
                {col.item.label}
              </text>
              {/* Верхнее число */}
              <text
                x={col.x}
                y={numberTopY}
                textAnchor="middle"
                className={styles.evidenceFanNumberSvg}
              >
                {col.lo}
              </text>
              {/* Нижнее число */}
              <text
                x={col.x}
                y={numberBottomY}
                textAnchor="middle"
                className={styles.evidenceFanNumberSvg}
              >
                {col.hi}
              </text>
              {/* Описание */}
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

        {/* Скринридерам — структура без визуального дубля */}
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
