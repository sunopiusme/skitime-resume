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
  /* Горизонтальная лента-петля. Замена круглого блюпринта:
     круг плохо ложился в широкий wide-контейнер (большие
     пустые бока) и читался как «вечная карусель», тогда как
     процесс направленный — от намерения к ревью. Лента
     использует всю ширину блока, идёт слева направо и
     замыкается короткой возвратной дугой снизу.

     Геометрия в системе координат viewBox 1200×360:
     - track Y=160, станции равномерно от X=80 до X=1120;
     - leader-линии уходят вверх к ярусу подписей (Y≈70);
     - возвратная дуга идёт ниже track'а через Y≈260 и
       соединяет правую крайнюю станцию с левой крайней. */
  const total = workflowSteps.length;
  const activeIndex = 1;

  const W = 1200;
  const H = 360;
  const padX = 80;
  const trackY = 160;
  const labelAnchorY = 70;
  const innerW = W - padX * 2;

  const stations = workflowSteps.map((step, index) => {
    const x = padX + (innerW * index) / (total - 1);
    return { step, index, x };
  });

  const active = stations[activeIndex]!;
  const first = stations[0]!;
  const last = stations[total - 1]!;

  /* Возвратная дуга: уходит вниз от последней станции,
     проходит под track'ом и приходит сверху к первой.
     Через два control-point'а: квадратичная Безье через
     общую нижнюю точку (mid, Y=260) даёт плавную ёмкую
     дугу, не перекрывающую сам track. */
  const loopMidY = 260;
  const loopPath = `M ${last.x} ${trackY + 14} C ${last.x} ${loopMidY}, ${first.x} ${loopMidY}, ${first.x} ${trackY + 14}`;

  return (
    <div className={styles.figure} aria-label="Этап 04: лента работы">
      <header className={styles.stageHeader}>
        <p className={styles.stageEyebrow}>Этап 04</p>
        <div className={styles.stageHeadline}>
          <h3 className={styles.stageTitle}>Петля работы, которую можно проверить</h3>
        </div>
      </header>

      {/* Blueprint ribbon.
          Палитра solid greys (без alpha), как и в прошлой
          версии диска — линии не накапливают плотность на
          пересечениях:
          • #2c2c2c — major grid;
          • #6e6e6e — track и возвратная дуга;
          • #5a5a5a — пассивные leader'ы;
          • #f5f5f5 — активная станция, активный leader,
            стрелка возврата. */}
      <div className={styles.ribbonFrame}>
        <svg
          className={styles.ribbonSvg}
          viewBox={`0 0 ${W} ${H}`}
          preserveAspectRatio="xMidYMid meet"
          role="img"
          aria-label="Лента: семь шагов процесса"
        >
          <defs>
            <pattern
              id="ribbonGridMajor"
              width="60"
              height="60"
              patternUnits="userSpaceOnUse"
              x="0"
              y="0"
            >
              <path
                d="M 60 0 L 0 0 0 60"
                fill="none"
                stroke="#2c2c2c"
                strokeWidth="0.75"
                vectorEffect="non-scaling-stroke"
              />
            </pattern>
            <marker
              id="ribbonLoopArrow"
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

          <rect x="0" y="0" width={W} height={H} fill="url(#ribbonGridMajor)" />

          {/* Основной track — единая горизонтальная линия,
              на которой сидят все станции. */}
          <line
            x1={first.x}
            y1={trackY}
            x2={last.x}
            y2={trackY}
            stroke="#6e6e6e"
            strokeWidth="1.4"
            vectorEffect="non-scaling-stroke"
          />

          {/* Возвратная дуга — закрывает петлю снизу:
              от ревью обратно к намерению. */}
          <path
            d={loopPath}
            fill="none"
            stroke="#f5f5f5"
            strokeWidth="1.2"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
            markerEnd="url(#ribbonLoopArrow)"
          />

          {/* Leader-линии: вверх от каждой станции к ярусу
              подписей. Активный leader белый и толще. */}
          <g>
            {stations.map((s) => {
              const isActive = s.index === activeIndex;
              return (
                <line
                  key={`leader-${s.index}`}
                  x1={s.x}
                  y1={trackY - 9}
                  x2={s.x}
                  y2={labelAnchorY + 6}
                  stroke={isActive ? "#f5f5f5" : "#5a5a5a"}
                  strokeWidth={isActive ? 1.4 : 0.9}
                  vectorEffect="non-scaling-stroke"
                />
              );
            })}
          </g>

          {/* Bullet-маркеры станций. У активной — halo. */}
          <g>
            {stations.map((s) => {
              const isActive = s.index === activeIndex;
              return (
                <g key={`bullet-${s.index}`}>
                  {isActive && (
                    <circle
                      cx={s.x}
                      cy={trackY}
                      r="10"
                      fill="none"
                      stroke="#f5f5f5"
                      strokeWidth="1"
                      vectorEffect="non-scaling-stroke"
                      opacity="0.45"
                    />
                  )}
                  <circle
                    cx={s.x}
                    cy={trackY}
                    r={isActive ? 5 : 3.4}
                    fill={isActive ? "#f5f5f5" : "#0a0a0a"}
                    stroke={isActive ? "#f5f5f5" : "#cccccc"}
                    strokeWidth={isActive ? 0 : 1.4}
                    vectorEffect="non-scaling-stroke"
                  />
                </g>
              );
            })}
          </g>
        </svg>

        {/* DOM-подписи поверх SVG: позиционируются в %
            от .ribbonStage. SVG масштабируется 1:1 в
            квадрат-агностический стейдж, поэтому ratio
            считается от полной ширины/высоты viewBox. */}
        <div className={styles.ribbonLabels} aria-hidden="false">
          {stations.map(({ step, index, x }) => {
            const leftPct = `${(x / W) * 100}%`;
            const topPct = `${(labelAnchorY / H) * 100}%`;
            return (
              <div
                key={step.label}
                className={styles.ribbonStep}
                data-active={index === activeIndex}
                style={{ left: leftPct, top: topPct } as CSSProperties}
              >
                <span className={styles.ribbonStepIndex}>{String(index + 1).padStart(2, "0")}</span>
                <strong className={styles.ribbonStepLabel}>{step.label}</strong>
                <span className={styles.ribbonStepDetail}>{step.detail}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* mobile fallback — список шагов; используется при
         сворачивании ленты на узких экранах. */}
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
