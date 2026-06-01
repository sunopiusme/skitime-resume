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
  return (
    <div className={styles.figure} aria-label="Карта источников">
      <header className={styles.stageHeader}>
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

export function LabCapabilityMatrix() {
  return (
    <div className={styles.figure} aria-label="Матрица признаков">
      <header className={styles.stageHeader}>
        <h3 className={styles.stageTitle}>Что ADE обязан показывать</h3>
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
    <div className={styles.figure} aria-label="Радар трения">
      <header className={styles.stageHeader}>
        <h3 className={styles.stageTitle}>Где автономность начинает стоить дорого</h3>
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
  const activeIndex = 1;

  return (
    <div className={styles.figure} aria-label="Схема процесса">
      <header className={styles.stageHeader}>
        <h3 className={styles.stageTitle}>Петля работы, которую можно проверить</h3>
      </header>

      <div className={styles.workflowLayout}>
        <div className={styles.workflowPanel}>
          <svg
            className={styles.workflowCircuit}
            viewBox="40 160 680 950"
            role="img"
            aria-label="Электрическая схема проверяемой работы"
          >
            <defs>
              <pattern id="wfGridMinor" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 H 0 V 40" fill="none" className={styles.wfGridMinor} />
              </pattern>
              <pattern id="wfGridMajor" width="200" height="200" patternUnits="userSpaceOnUse">
                <rect width="200" height="200" fill="url(#wfGridMinor)" />
                <path d="M 200 0 H 0 V 200" fill="none" className={styles.wfGridMajor} />
              </pattern>
              <marker
                id="workflowArrow"
                viewBox="0 0 10 10"
                refX="7"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto"
              >
                <path d="M 0 0 L 10 5 L 0 10 Z" className={styles.workflowArrow} />
              </marker>
            </defs>

            {/* Чертёжная сетка (всё на шаге 40 px) */}
            <rect width="720" height="1280" className={styles.workflowGrid} />

            {/* ── Шины питания ───────────────────────── */}
            {/* Верхняя шина +V: левый угол → отвод резистора → дроссель → правый угол */}
            <path d="M 120 240 H 280" className={styles.workflowWire} />
            <path d="M 440 240 H 600" className={styles.workflowWire} />
            <path
              d="M 280 240 a 20 20 0 0 1 40 0 a 20 20 0 0 1 40 0 a 20 20 0 0 1 40 0 a 20 20 0 0 1 40 0"
              className={styles.workflowInductor}
            />
            {/* Правая шина +V → вывод 8 */}
            <path d="M 600 240 V 560 H 440" className={styles.workflowWire} />
            {/* Левая шина: верхний угол → батарея → земляная шина */}
            <path d="M 120 240 V 342" className={styles.workflowWire} />
            <path d="M 120 378 V 1000" className={styles.workflowWire} />
            {/* Нижняя земляная шина */}
            <path d="M 120 1000 H 640" className={styles.workflowWire} />

            {/* ── Батарея 9 В ────────────────────────── */}
            <line x1="86" y1="342" x2="154" y2="342" className={styles.workflowBatteryPlate} />
            <line x1="100" y1="354" x2="140" y2="354" className={styles.workflowBatteryPlate} />
            <line x1="86" y1="366" x2="154" y2="366" className={styles.workflowBatteryPlate} />
            <line x1="100" y1="378" x2="140" y2="378" className={styles.workflowBatteryPlate} />

            {/* ── Резистор 40 кΩ: верхняя шина → вывод 7 ── */}
            <path d="M 200 240 V 400" className={styles.workflowWire} />
            <rect x="182" y="400" width="36" height="120" className={styles.workflowResistor} />
            <path d="M 200 520 V 560 H 280" className={styles.workflowWire} />

            {/* ── Времязадающий конденсатор 2.2 μF: выводы 6/2 → земля ── */}
            <path d="M 280 640 H 240 V 720 H 280" className={styles.workflowWire} />
            <path d="M 240 720 V 832" className={styles.workflowWire} />
            <line x1="206" y1="832" x2="274" y2="832" className={styles.workflowCapacitor} />
            <line x1="206" y1="848" x2="274" y2="848" className={styles.workflowCapacitor} />
            <path d="M 240 848 V 1000" className={styles.workflowWire} />

            {/* ── Конденсатор управления 1 μF: вывод 5 → земля ── */}
            <path d="M 440 640 H 640 V 832" className={styles.workflowWire} />
            <line x1="606" y1="832" x2="674" y2="832" className={styles.workflowCapacitor} />
            <line x1="606" y1="848" x2="674" y2="848" className={styles.workflowCapacitor} />
            <path d="M 640 848 V 1000" className={styles.workflowWire} />

            {/* ── Ядро (агент): этап «выполнение» ───── */}
            <rect x="280" y="520" width="160" height="240" rx="2" className={styles.workflowChipBody} />
            <text x="360" y="640" className={styles.workflowChipTitle}>выполнение</text>
            <text x="300" y="560" className={styles.workflowPinLabel}>7</text>
            <text x="300" y="640" className={styles.workflowPinLabel}>6</text>
            <text x="300" y="720" className={styles.workflowPinLabel}>2</text>
            <text x="420" y="560" className={styles.workflowPinLabel}>8</text>
            <text x="420" y="640" className={styles.workflowPinLabel}>5</text>
            <text x="420" y="720" className={styles.workflowPinLabel}>3</text>
            <text x="360" y="732" className={styles.workflowPinLabel}>1</text>

            {/* ── Выход: вывод 3 → лампа → земля (активная цепь) ── */}
            <path d="M 360 760 V 1000" className={styles.workflowWire} />
            <path d="M 440 720 H 520 V 836" className={styles.workflowWireActive} markerEnd="url(#workflowArrow)" />
            <path d="M 476 880 a 44 44 0 1 0 88 0 a 44 44 0 1 0 -88 0" className={styles.workflowLamp} />
            <path d="M 489 849 L 551 911 M 551 849 L 489 911" className={styles.workflowLampCross} />
            <path d="M 520 924 V 1000" className={styles.workflowWire} />

            {/* ── Узлы соединений ───────────────────── */}
            <circle cx="200" cy="240" r="7" className={styles.workflowDot} />
            <circle cx="240" cy="720" r="7" className={styles.workflowDot} />
            <circle cx="240" cy="1000" r="7" className={styles.workflowDot} />
            <circle cx="360" cy="1000" r="7" className={styles.workflowDot} />
            <circle cx="520" cy="1000" r="7" className={styles.workflowDot} />
            <circle cx="520" cy="1000" r="13" className={styles.workflowDotHalo} />

            {/* ── Земля ─────────────────────────────── */}
            <path d="M 360 1000 V 1040" className={styles.workflowGroundStem} />
            <line x1="328" y1="1040" x2="392" y2="1040" className={styles.workflowGroundLine} />
            <line x1="340" y1="1052" x2="380" y2="1052" className={styles.workflowGroundLine} />
            <line x1="352" y1="1064" x2="368" y2="1064" className={styles.workflowGroundLine} />

            {/* ── Подписи этапов (зеркалят список справа) ── */}
            <text x="70" y="360" className={styles.workflowVerticalText}>намерение</text>
            <text x="360" y="212" textAnchor="middle" className={styles.workflowComponentText}>план</text>
            <text x="164" y="460" className={styles.workflowVerticalText}>контекст</text>
            <text x="188" y="840" className={styles.workflowVerticalText}>доступ</text>
            <text x="694" y="840" className={styles.workflowVerticalText}>проверка</text>
            <text x="435" y="884" textAnchor="middle" className={styles.workflowComponentText}>ревью</text>
          </svg>
        </div>
        <div className={styles.workflowList}>
          {workflowSteps.map((step, index) => (
            <div
              key={step.label}
              className={styles.workflowItem}
              data-active={index === activeIndex}
            >
              <span className={styles.workflowHead}>
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
    <div className={styles.figure} aria-label="Доказательная база">
      <header className={styles.stageHeader}>
        <h3 className={styles.stageTitle}>Что делает работу пригодной для ревью</h3>
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
